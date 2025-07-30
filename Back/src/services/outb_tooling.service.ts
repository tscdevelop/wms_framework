import { Repository, EntityManager, Not, In } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils
import CodeGenerator from '../utils/CodeGenerator';

import { m_outb_tooling } from '../entities/m_outb_tooling.entity';
import { OutbToolingModel } from '../models/outb_tooling.model';
import { m_inb_tooling } from '../entities/m_inb_tooling.entity';
import { m_unit } from '../entities/m_unit.entity';
import { OutbToolingGroupedModel } from '../models/outb_tooling_getbyid.model';
import { ApprovalStatus, NotifStatus, NotifType, RefType, ReturnStatus } from '../common/global.enum';
import { m_outb_tooling_items } from '../entities/m_outb_tooling_items.entity';
import { handleFileUploads, UploadDirKey } from '../utils/FileManager';
import { OutbToolingGroupedReqModel } from '../models/outb_tooling_getreqbyid.model';
import { deleteEntity } from '../utils/DatabaseUtils';
import { m_notifications } from '../entities/m_notifications.entity';
import { s_user_notification } from '../entities/s_user_notification.entity';
import { s_user } from '../entities/s_user.entity';
import { getUsersToNotify } from '../utils/NotificationsUtils';

const outbtlFileMapping = {
    files: { filename: 'outbtlitm_img', url: 'outbtlitm_img_url', by: 'update_by' },
};

export class OutbToolingService {
    private outbtlRepository: Repository<m_outb_tooling>;
    private inbtlRepository: Repository<m_inb_tooling>;
    private outbtlItemsRepository: Repository<m_outb_tooling_items>;
    private notificationRepository: Repository<m_notifications>;
    private usernotifRepo: Repository<s_user_notification>;
    private userRepository: Repository<s_user>;

    constructor(){
        this.outbtlRepository = AppDataSource.getRepository(m_outb_tooling);
        this.inbtlRepository = AppDataSource.getRepository(m_inb_tooling);
        this.outbtlItemsRepository = AppDataSource.getRepository(m_outb_tooling_items);
        this.notificationRepository = AppDataSource.getRepository(m_notifications);
        this.usernotifRepo = AppDataSource.getRepository(s_user_notification);
        this.userRepository = AppDataSource.getRepository(s_user);
    }

    private async generateCode(): Promise<string> {
        const codeGenerator = new CodeGenerator(AppDataSource);
        const newCode = await codeGenerator.generateCode('m_outb_tooling', 'outbtl_code', 'TL', '', '[PREFIX][0000x]');
        return newCode;
    }

     //ฟังก์ชันตรวจสอบค่าที่ต้องกรอก
    private validateRequiredFields(data: Partial<OutbToolingModel>, response: ApiResponse<any>): ApiResponse<any> | null {
        const requiredFields: { key: keyof OutbToolingModel; message: string }[] = [
            { key: "outbtl_issued_by", message: "outbtl.outbtl_issued_by" }
        ];

        for (const { key, message } of requiredFields) {
            if (validate.isNullOrEmpty(data[key])) {
                return response.setIncomplete(lang.msgRequired(message));
            }
        }
        return null;
    }

    // เช็คว่ามี items ถูกส่งมาไหม
    private validateItemsExistence(items: OutbToolingModel["items"] | undefined, response: ApiResponse<any>): ApiResponse<any> | null {
        if (!items || items.length === 0) {
            return response.setIncomplete(lang.msgRequired('items'));
        }
        return null;
    }
    

    // ห้ามมี inbtl_id ซ้ำกันในรายการที่ส่งมา
    private checkDuplicateInbtlId(inbtl_ids: number[], response: ApiResponse<any>): ApiResponse<any> | null {
        if (new Set(inbtl_ids).size !== inbtl_ids.length) {
            return response.setIncomplete(lang.msg('validation.duplicate'));
        }
        return null;
    }

    // ตรวจสอบว่ามี inbtl_id อยู่ใน m_inb_tooling หรือไม่
    private async checkInbtlExists(inbtl_ids: number[], manager: EntityManager, response: ApiResponse<any>): Promise<ApiResponse<any> | null> {
        if (inbtl_ids.length === 0) return null;
    
        const foundInbsemi = await manager.getRepository(m_inb_tooling)
            .findBy({ inbtl_id: In(inbtl_ids) });
    
        const foundIds = new Set(foundInbsemi.map(inb => inb.inbtl_id));
        const missingIds = inbtl_ids.filter(id => !foundIds.has(id));
    
        if (missingIds.length > 0) {
            return response.setIncomplete(lang.msgNotFound(`inbtl.inbtl_id`));
        }
        return null;
    }

    // ฟังก์ชันบันทึกข้อมูลลง noti
    private async saveRequestApprovalNotification(
        reference_type: string,
        reference_id: number,
        reqUsername: string,
        manager?: EntityManager
    ) {
        const notificationRepo = manager ? manager.getRepository(m_notifications): this.notificationRepository;
        const usernotifRepo = manager ? manager.getRepository(s_user_notification): this.usernotifRepo;
    
        const newNotification = notificationRepo.create({
            notif_type: NotifType.REQUEST_APPROVAL,
            reference_type, // ประเภท table ที่บันทึก
            reference_id,   // ไอดี outbtl_id
            create_by: reqUsername,
        });
    
        const savedNotification = await notificationRepo.save(newNotification);
        
        // ✅ ดึงรายชื่อผู้ใช้ที่ควรได้รับแจ้งเตือน
        const userIds = await getUsersToNotify(NotifType.REQUEST_APPROVAL, this.userRepository,manager); // 👈 คุณต้องกำหนดเองว่าจะแจ้งใครบ้าง

        if (!userIds || userIds.length === 0) {
            console.warn(`⚠️ No users found to notify for ${reference_type}:${reference_id}`);
            return;
        }

        // ✅ สร้างข้อมูลลง s_user_notification
        const userNotifList = userIds.map((user_id) => ({
            user_id,
            notif_id: savedNotification.notif_id,
            notif_status: NotifStatus.UNREAD,
        }));

        await usernotifRepo.save(userNotifList);
    }

    private async checkInbtlQuantityValid(
        inbtl_ids: number[],
        manager: EntityManager,
        response: ApiResponse<any>
    ): Promise<ApiResponse<any> | null> {
        if (!inbtl_ids.length) return null;
    
        // ดึงข้อมูล inbtl_quantity ของ inbtl_id ทั้งหมดที่เลือก
        const inbtlData = await manager
            .getRepository(m_inb_tooling)
            .find({
                where: { inbtl_id: In(inbtl_ids) },
                select: ['inbtl_id', 'inbtl_quantity' , 'inbtl_code']
            });
    
        // ตรวจสอบว่ามี inbtl_quantity ใดเป็น 0 หรือไม่
        const invalidInbtl = inbtlData.filter(item => item.inbtl_quantity === 0);
    
        if (invalidInbtl.length > 0) {
            // const invalidIds = invalidInbtl.map(item => item.inbtl_id).join(', ');
            const invalidCodes = invalidInbtl.map(item => item.inbtl_code).join(', ');
            return response.setIncomplete(lang.msg('field.quantity_not_enough') +` [${invalidCodes}]`);
        }
    
        return null;
    }
    

    async create(
        data: Partial<OutbToolingModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbToolingService.create';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const outbToolingRepo = manager ? useManager.getRepository(m_outb_tooling): this.outbtlRepository;
            const outbToolingItemsRepo = manager ? useManager.getRepository(m_outb_tooling_items): this.outbtlItemsRepository;

            // ตรวจสอบค่าที่ต้องกรอก
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) return validationResponse;

            const items = data.items ?? [];
            const inbtl_ids = items.map(item => item.inbtl_id);

            // ตรวจสอบ items ว่ามีค่าหรือไม่
            const itemsValidation = this.validateItemsExistence(items, response);
            if (itemsValidation) return itemsValidation;

            // ตรวจสอบห้ามมี inbtl_id ซ้ำกัน
            const duplicateCheck = this.checkDuplicateInbtlId(inbtl_ids, response);
            if (duplicateCheck) return duplicateCheck;

            // ตรวจสอบว่า inbtl_id มีอยู่จริงใน `m_inb_tooling`
            const inbtlCheck = await this.checkInbtlExists(inbtl_ids, useManager, response);
            if (inbtlCheck) return inbtlCheck;

            // ตรวจสอบว่า inbtl_quantity ของ inbtl_id ต้องไม่เป็น 0
            const inbtlQuantityCheck = await this.checkInbtlQuantityValid(inbtl_ids, useManager, response);
            if (inbtlQuantityCheck) return inbtlQuantityCheck;


            // บันทึก `m_outb_tooling` (Header)
            const outbtlHeader = outbToolingRepo.create({
                ...data,
                outbtl_code: await this.generateCode(),
                outbtl_is_active: true,
                create_date: new Date(),
                create_by: reqUsername
            });
            const saveOutbTL = await outbToolingRepo.save(outbtlHeader);

            // บันทึก `m_outb_tooling_items`
            const newItems = items.map(item => ({
                outbtl_id: saveOutbTL.outbtl_id,
                inbtl_id: item.inbtl_id,
                outbtlitm_is_returned: false
            }));

            await outbToolingItemsRepo.save(newItems);

            // ดึงข้อมูล items ที่เพิ่งบันทึก
            const savedItems = await outbToolingItemsRepo.find({ where: { outbtl_id: saveOutbTL.outbtl_id } });

            // บันทึกแจ้งเตือน `REQUEST_APPROVAL`
            await this.saveRequestApprovalNotification( RefType.OUTBTL, saveOutbTL.outbtl_id, reqUsername, useManager);

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete(lang.msgSuccessAction('created', 'item.outbtl'), {
                ...saveOutbTL,
                items: savedItems
            });

        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during record creation:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    

    async update(
        outbtl_id: number,
        data: Partial<OutbToolingModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbToolingService.update';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const outbToolingRepo = manager ? useManager.getRepository(m_outb_tooling): this.outbtlRepository;
            const outbToolingItemsRepo = manager ? useManager.getRepository(m_outb_tooling_items): this.outbtlItemsRepository;
    
            // ตรวจสอบว่าข้อมูลมีอยู่หรือไม่
            const existingOutbtl = await outbToolingRepo.findOne({ where: { outbtl_id } });
            if (!existingOutbtl) {
                return response.setIncomplete(lang.msgNotFound('outbtl.outbtl_id'));
            }
    
            // ตรวจสอบค่าที่ต้องกรอก
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) return validationResponse;
    
            const items = data.items ?? [];
            const inbtl_ids = items.map(item => item.inbtl_id);
    
            // ตรวจสอบ items ว่ามีค่าหรือไม่
            const itemsValidation = this.validateItemsExistence(items, response);
            if (itemsValidation) return itemsValidation;
    
            // ตรวจสอบห้ามมี inbtl_id ซ้ำกัน
            const duplicateCheck = this.checkDuplicateInbtlId(inbtl_ids, response);
            if (duplicateCheck) return duplicateCheck;
    
            // ตรวจสอบว่า inbtl_id มีอยู่จริงใน `m_inb_tooling`
            const inbtlCheck = await this.checkInbtlExists(inbtl_ids, useManager, response);
            if (inbtlCheck) return inbtlCheck;

            // ตรวจสอบว่า inbtl_quantity ของ inbtl_id ต้องไม่เป็น 0
            const inbtlQuantityCheck = await this.checkInbtlQuantityValid(inbtl_ids, useManager, response);
            if (inbtlQuantityCheck) return inbtlQuantityCheck;
    
            // อัปเดต `m_outb_tooling`
            Object.assign(existingOutbtl, {
                ...data,
                update_date: new Date(),
                update_by: reqUsername
            });
            const updatedHeader = await outbToolingRepo.save(existingOutbtl);
    
            // ดึงรายการ `items` ที่มีอยู่ปัจจุบัน
            const existingItems = await outbToolingItemsRepo.find({ where: { outbtl_id } });
            const existingItemIds = new Set(existingItems.map(item => item.inbtl_id));
    
            // หารายการที่ต้องลบ
            const newItemIds = new Set(inbtl_ids);
            const itemsToDelete = existingItems.filter(item => !newItemIds.has(item.inbtl_id));
    
            // ลบ `items` ที่ไม่มีในรายการใหม่
            if (itemsToDelete.length > 0) {
                await outbToolingItemsRepo.remove(itemsToDelete);
            }
    
            // เพิ่ม `items` ที่ยังไม่มี
            const newItems = items
                .filter(item => !existingItemIds.has(item.inbtl_id))
                .map(item => ({
                    outbtl_id,
                    inbtl_id: item.inbtl_id,
                    outbtlitm_is_returned: false
                }));
    
            if (newItems.length > 0) {
                await outbToolingItemsRepo.save(newItems);
            }
    
            // // ดึงข้อมูล items ที่อัปเดตแล้ว
            // const updatedItems = await outbToolingItemsRepo.find({ where: { outbtl_id } });
    
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('updated', 'item.outbtl'), {
                ...updatedHeader,
                // items: updatedItems
            });
    
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during record update:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    

    async returnTooling(
        id: number,
        data: {
            files: { [key: string]: Express.Multer.File[] }, // ไฟล์ที่ถูกอัปโหลด
            outbtl_returned_by: string, // ชื่อผู้ที่คืน
            items: Array<{
                outbtlitm_id: number; // ID ของ item ที่คืน
                outbtlitm_remark?: string; // หมายเหตุของการคืน (ถ้ามี)
                outbtlitm_img?: string; // ชื่อไฟล์รูปภาพที่เกี่ยวข้องกับการคืน (ถ้ามี)
            }>;
        },
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbToolingService.returnTooling';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        // ถ้าไม่ได้รับ manager ให้เริ่ม transaction ใหม่
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const { files = {}, outbtl_returned_by, items } = data;
            const outbToolingRepo = useManager.getRepository(m_outb_tooling);
            const outbToolingItemsRepo = useManager.getRepository(m_outb_tooling_items);
    
            // ตรวจสอบว่าค่า ID ที่รับเข้ามาเป็นตัวเลข
            if (isNaN(id)) {
                return response.setIncomplete(lang.msgInvalidParameter());
            }

            // ตรวจสอบว่ามีค่าผู้คืนหรือไม่
            if (validate.isNullOrEmpty(outbtl_returned_by)) {
                return response.setIncomplete(lang.msgRequired('outbtl.outbtl_returned_by'));
            }

            // ตรวจสอบว่ามีรายการ items ที่ต้องคืนหรือไม่
            if (!items || !Array.isArray(items)) {
                return response.setIncomplete(lang.msg('There are no items in the request.'));
            }
    
             // ดึงข้อมูล header ของการคืนออกมา
            const outbtlHeader = await outbToolingRepo.findOne({ where: { outbtl_id: id } });
            if (!outbtlHeader) {
                return response.setIncomplete(lang.msgNotFound('outbtl.outbtl_id'));
            }

            // ดึงรายการ items ที่เกี่ยวข้องกับ header
            const existingItems = await outbToolingItemsRepo.find({ where: { outbtl_id: outbtlHeader.outbtl_id } });
            if (existingItems.length === 0) {
                return response.setIncomplete(lang.msgNotFound('outbtl.outbtl_id'));
            }
    
            const errors: string[] = []; // เก็บ error ที่เกิดขึ้น
            const validatedItems: Array<{ 
                item: any; 
                existingOutbtlItem: m_outb_tooling_items;
                originalQuantity: number; // เพิ่ม originalQuantity เข้าไป
            }> = [];

            // console.log('Files received:', files);
            // console.log('Items received:', items);
    
             // ตรวจสอบว่า items ที่คืนมีอยู่จริงหรือไม่
            for (const { outbtlitm_id, outbtlitm_remark, outbtlitm_img } of items) {
                // console.log(`Processing item ID: ${outbtlitm_id}`);

                const existingOutbtlItem = existingItems.find((i) => i.outbtlitm_id === outbtlitm_id);
                if (!existingOutbtlItem) {
                    // console.log(`Item with ID ${outbtlitm_id} not found.`);
                    errors.push(lang.msgNotFound(`outbtl.outbtlitm_id`) + `: ${outbtlitm_id}`);
                    continue;
                }

                // กรณีคืนแล้วไม่คืนซ้ำ
                if (existingOutbtlItem.outbtlitm_is_returned) {
                    return response.setIncomplete(lang.msg(`Item with ID ${outbtlitm_id} has already been returned and cannot be returned again.`));
                }

                // บันทึกค่าเดิมก่อนเปลี่ยนแปลง
                const originalQuantity = existingOutbtlItem.outbtlitm_quantity;

                validatedItems.push({
                    item: { 
                        outbtlitm_remark: outbtlitm_remark === "" ? null : outbtlitm_remark,
                        outbtlitm_img
                    },
                    existingOutbtlItem,
                    originalQuantity // ✅ เพิ่ม originalQuantity เข้าไป
                });
            }
    
            if (errors.length > 0) {
                return response.setIncomplete(errors.join(', '));
            }
    
            // อัปเดตรายการคืนสินค้า
            for (const validatedItem of validatedItems) {
                // console.log('Before Update:', validatedItem.existingOutbtlItem);

                Object.assign(validatedItem.existingOutbtlItem, validatedItem.item, { 
                    outbtlitm_is_returned: true, 
                    outbtlitm_quantity: 0 // ตั้งค่าให้เป็น 0 เมื่อคืนของแล้ว
                });

                // console.log('After Update:', validatedItem.existingOutbtlItem);

                // ลบค่ารูปภาพออกจาก `item`
                delete validatedItem.item.outbtlitm_img;
                delete validatedItem.item.outbtlitm_img_url;

                // บันทึกอ็อบเจกต์ที่อัปเดต
                await outbToolingItemsRepo.save(validatedItem.existingOutbtlItem);
            }

            // ส่ง validatedItems พร้อม originalQuantity ไปยัง updateInboundQuantity
            await this.updateInboundQuantity(validatedItems, useManager);
    
            // **จัดการไฟล์อัปโหลด** (นำโค้ดเดิมกลับมา)
            // console.log('Object.keys(files)', Object.keys(files));
    
            if (files && Object.keys(files).length > 0) {
                // แปลง `files` ให้เป็น array (กรณีที่ยังไม่ใช่ array)
                const fileArray = Array.isArray(files)
                    ? files
                    : Object.values(files).flat() as Express.Multer.File[];
            
                // Log รายละเอียดไฟล์หลังแปลง
                //console.log('Files after transformation:', fileArray);
            
                // วนลูปผ่าน `items` ที่ส่งเข้ามา
                for (const { outbtlitm_id, outbtlitm_img } of items) {
                    //console.log(`Processing item ID: ${outbtlitm_id}`);
                    let matchedFile: Express.Multer.File | undefined;
            
                    // หาไฟล์ใน `fileArray` ที่ตรงกับ `outbtlitm_img`
                    for (const file of fileArray) {
                        const fileName = file.name ?? file.originalname; // Safe access for `name` or `originalname`
                        if (fileName) {
                            const decodedName = Buffer.from(fileName, 'latin1').toString('utf8'); // Decode ชื่อไฟล์
                            //console.log(`Comparing decodedName: ${decodedName} with outbtlitm_img: ${outbtlitm_img}`);
                            if (decodedName === outbtlitm_img) {
                                //console.log('decodedName === outbtlitm_img:', decodedName === outbtlitm_img);

                                matchedFile = file; // เจอไฟล์ที่ตรงกัน
                                break; // ออกจาก loop
                            }
                        }
                    }
            
                    if (matchedFile) {
                        //console.log(`Matched file for item ID ${outbtlitm_id}:`, matchedFile);
            
                        const subfolder = `${outbtlitm_id}`;
                        //console.log('Subfolder:', subfolder);
            
                        try {
                            // อัปโหลดไฟล์ที่จับคู่ได้
                            const uploadResult = await handleFileUploads(
                                [matchedFile], // ส่งไฟล์ที่จับคู่ไปอัปโหลด
                                subfolder,
                                UploadDirKey.DIR_UPLOAD_OUTBOUND_TOOLING_IMAGE,
                                reqUsername,
                                outbtlFileMapping
                            );
            
                            //console.log('Upload result:', uploadResult);
            
                            if (uploadResult) {
                                // ใช้ `outbtlitm_id` ที่ถูกต้องสำหรับอัปเดตฐานข้อมูล
                                const updateResponse = await this.updateUploadfile(
                                    outbtlitm_id, // ใช้ ID ของ item ที่กำลังประมวลผล
                                    uploadResult,
                                    useManager
                                );
            
                                if (!updateResponse.isCompleted) {
                                    console.error(`Failed to update file data for item ID ${outbtlitm_id}:`, updateResponse.message);
                                } else {
                                    //console.log(`File data successfully updated for item ID ${outbtlitm_id}`);
                                }
                            }
                        } catch (error) {
                            console.error(`Error uploading file for item ID ${outbtlitm_id}:`, error);
                        }
                    } else {
                        console.warn(`No matching files found for item ID ${outbtlitm_id}`);
                    }
                }
            } else {
                // Log เมื่อไม่มีไฟล์ถูกส่งเข้ามา
                console.warn('No files provided for upload.');
            }
    
            //บันทึกสถานะการคืนของ 
            const allItems = await outbToolingItemsRepo.find({ where: { outbtl_id: outbtlHeader.outbtl_id } });
            const allReturned = allItems.every(item => item.outbtlitm_is_returned);
            const someReturned = allItems.some(item => item.outbtlitm_is_returned);
    
           // ใช้ Object.assign() อัปเดตค่า header
            Object.assign(outbtlHeader, {
                outbtl_return_status: allReturned
                    ? ReturnStatus.RETURNED
                    : someReturned
                    ? ReturnStatus.PARTIAL_RETURNED
                    : ReturnStatus.NOT_RETURNED,
                outbtl_returned_by,
                return_date: new Date(),
            });

            //console.log(`Updated return status: ${outbtlHeader.outbtl_return_status}`);

        
            await outbToolingRepo.save(outbtlHeader);
    
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            const updatedItems = await outbToolingItemsRepo.find({ where: { outbtl_id: outbtlHeader.outbtl_id } });
            const updatedHeader = await outbToolingRepo.findOne({ where: { outbtl_id: outbtlHeader.outbtl_id } });
    
            return response.setComplete(lang.msgSuccessAction('returned', 'item.tooling_ifm'), { header: updatedHeader, items: updatedItems });
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`Error during ${operation}:`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    //ฟังก์ชันคืนจำนวนที่ยืม
    private async updateInboundQuantity(
        validatedItems: Array<{ existingOutbtlItem: m_outb_tooling_items; originalQuantity: number }>,
        useManager: EntityManager
    ): Promise<void> {
        const inbToolingRepo = useManager.getRepository(m_inb_tooling);
    
        for (const { existingOutbtlItem, originalQuantity } of validatedItems) {
            const { inbtl_id } = existingOutbtlItem;
    
            if (!inbtl_id) {
                console.warn(`No inbtl_id found for outbtlitm_id: ${existingOutbtlItem.outbtlitm_id}`);
                continue;
            }
    
            // ดึงข้อมูล inbound tooling ที่เกี่ยวข้อง
            const inbTooling = await inbToolingRepo.findOne({ where: { inbtl_id } });
    
            if (!inbTooling) {
                console.warn(`Inbound record not found for inbtl_id: ${inbtl_id}`);
                continue;
            }
    
            // อัปเดตค่า inbtl_quantity โดยใช้ originalQuantity ที่บันทึกไว้
            inbTooling.inbtl_quantity += originalQuantity;
    
            await inbToolingRepo.save(inbTooling);
            //console.log(`Updated inbtl_quantity for inbtl_id: ${inbtl_id} by adding ${originalQuantity}`);
        }
    }
    
    
    

    async updateUploadfile(
        outbtlitm_id: number,
        data: Partial<m_outb_tooling_items>,
        manager?: EntityManager
    ): Promise<ApiResponse<m_outb_tooling_items>> {
        let response = new ApiResponse<m_outb_tooling_items>();
        const operation = 'OutbToolingItemsService.updateUploadfile';

        try {
            const useManager = manager || AppDataSource.manager; // ใช้ manager ที่ส่งเข้ามาหรือใช้ค่า default

            await useManager.transaction(async (transactionManager) => {
                const repository = transactionManager.getRepository(m_outb_tooling_items);

                // ตรวจสอบว่า ID มีอยู่จริง
                const existingItem = await repository.findOne({ where: { outbtlitm_id } });
                //console.log('Existing item:', existingItem); // Log ข้อมูลเดิม
                if (!existingItem) {
                    return response.setIncomplete(lang.msgNotFound('item.outbtlitm'));
                }

                // Log ข้อมูลที่กำลังจะอัปเดต
                //console.log('Data to be updated:', data);

                // อัปเดตข้อมูลไฟล์
                const updatedData = await repository.save({ outbtlitm_id, ...data });
                //console.log('Updated Data:', updatedData); // Log ข้อมูลหลังอัปเดต

                // สร้าง response
                response = response.setComplete(
                    lang.msgSuccessAction('updated', 'item.outbtlitm'),
                    updatedData
                );
            });

            return response;
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async delete(outbtl_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'OutbToolingService.delete';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const outbToolingRepo = useManager.getRepository(m_outb_tooling);
            const outbToolingItemsRepo = useManager.getRepository(m_outb_tooling_items);
            const notificationRepository = useManager.getRepository(m_notifications);
    
              // ตรวจสอบว่ามี `outbtl_id` หรือไม่
            const existingOutbTL = await outbToolingRepo.findOne({ where: { outbtl_id } });
            if (!existingOutbTL) {
                return response.setIncomplete(lang.msgNotFound('outbtl.outbtl_id'));
            }

            // ✅ ตรวจสอบสถานะการอนุมัติ
            if (existingOutbTL.outbtl_appr_status === ApprovalStatus.APPROVED) {
                return response.setIncomplete(lang.msg(`ไม่สามารถลบรายการที่อนุมัติแล้วได้`));
            }
    
            // ลบรายการ `m_outb_semi_items` ที่เกี่ยวข้องทั้งหมดก่อน
            await outbToolingItemsRepo.delete({ outbtl_id });
    
            // ลบแจ้งเตือน `s_user_notification` ที่เกี่ยวข้อง
            const notiToDelete = await notificationRepository.find({
                where: { reference_type: RefType.OUTBTL, reference_id: outbtl_id },
            });
            
            const notifIds = notiToDelete.map(n => n.notif_id);
            
            if (notifIds.length > 0) {
                const userNotifRepo = manager ? useManager.getRepository(s_user_notification): this.usernotifRepo;
            
                await userNotifRepo.delete({ notif_id: In(notifIds) });
            }

            // ลบแจ้งเตือน `m_notifications` ที่เกี่ยวข้อง
            await notificationRepository.delete({ reference_type: RefType.OUTBTL , reference_id: outbtl_id });

            // ใช้ `deleteEntity()` เพื่อลบ `m_outb_semi`
            const deleteResponse = await deleteEntity(outbToolingRepo, outbtl_id, reqUsername, 'outbtl_is_active', 'outbtl_id');
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
    
            // Commit Transaction หลังจากลบข้อมูลสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return deleteResponse; // ส่ง response ตามผลลัพธ์จาก `deleteEntity`
                
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during outbtl deletion:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    
    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OutbToolingService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_tooling) : this.outbtlRepository;
    
            // Query outbtl ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('outbtl')
                .leftJoin('m_outb_tooling_items', 'outbtl_items', 'outbtl.outbtl_id = outbtl_items.outbtl_id')
                .select([
                    'outbtl.outbtl_id AS outbtl_id',
                    'outbtl.outbtl_code AS outbtl_code',
                    'outbtl.outbtl_details AS outbtl_details',
                    'outbtl.outbtl_return_status AS outbtl_return_status',
                    "DATE_FORMAT(outbtl.create_date, '%d %b %y') AS create_date", // วันที่เบิก
                    "DATE_FORMAT(outbtl.create_date, '%H:%i:%s') AS create_time", // เวลาเบิก
                    "DATE_FORMAT(outbtl.return_date, '%d %b %y') AS return_date", // วันที่คืน
                    "DATE_FORMAT(outbtl.return_date, '%H:%i:%s') AS return_time", // เวลาคืน
                    "outbtl.outbtl_issued_by AS outbtl_issued_by",
                    "outbtl.outbtl_returned_by AS outbtl_returned_by",
                    "outbtl.outbtl_appr_status AS outbtl_appr_status",
                    "DATE_FORMAT(NOW(), '%d %b %y') AS today_date"
                ])
                .orderBy('outbtl.outbtl_id', 'ASC') // เรียงลำดับตาม outbtl_id
                .where('outbtl.outbtl_is_active = :isActive', { isActive: true})
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.outbtl'));
            }
    
            // ฟิลเตอร์เอาเฉพาะ item ที่มีสถานะต่ำสุด
            const groupedData = rawData.reduce((result, record) => {
                if (!result[record.outbtl_code]) {
                    result[record.outbtl_code] = {
                        outbtl_id: record.outbtl_id,
                        outbtl_code: record.outbtl_code,
                        outbtl_details: record.outbtl_details,
                        create_date: record.create_date,
                        create_time: record.create_time,
                        return_date: record.return_date,
                        return_time: record.return_time,
                        outbtl_appr_status: record.outbtl_appr_status,
                        outbtl_return_status: record.outbtl_return_status,
                        outbtl_issued_by: record.outbtl_issued_by,
                        outbtl_returned_by: record.outbtl_returned_by,
                        today_date: record.today_date,
                    };
                }
    
                return result;
            }, {});
    
            // แปลงข้อมูลให้อยู่ในรูป array
            const filteredData = Object.values(groupedData);
    
            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.outbtl'), filteredData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getById(outbtl_id: number, manager?: EntityManager): Promise<ApiResponse<OutbToolingGroupedModel>> {
        const response = new ApiResponse<OutbToolingGroupedModel>();
        const operation = 'OutbToolingService.getById';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_tooling) : this.outbtlRepository;
    
            // Query ข้อมูลทั้งหมดที่มี outbtl_id เดียวกัน
            const rawData = await repository
                .createQueryBuilder('outbtl')
                .leftJoin('m_outb_tooling_items', 'outbtlitm', 'outbtl.outbtl_id = outbtlitm.outbtl_id')
                .leftJoin('m_inb_tooling', 'inbtl', 'outbtlitm.inbtl_id = inbtl.inbtl_id')
                .leftJoin('m_tooling_ifm', 'tlifm', 'tlifm.tlifm_id = inbtl.tlifm_id')
                .select([
                    'outbtl.outbtl_id AS outbtl_id',
                    'outbtl.outbtl_code AS outbtl_code',
                    'outbtl.outbtl_details AS outbtl_details',
                    "outbtl.outbtl_issued_by AS outbtl_issued_by",
                    "outbtl.outbtl_returned_by AS outbtl_returned_by",
                    'outbtlitm.outbtlitm_remark AS outbtlitm_remark',
                    'outbtlitm.outbtlitm_img AS outbtlitm_img',
                    'outbtlitm.outbtlitm_img_url AS outbtlitm_img_url',
                    'outbtlitm.outbtlitm_id AS outbtlitm_id',
                    'outbtlitm.inbtl_id AS inbtl_id',
                    "CONCAT(tlifm.tlifm_code, ' ', tlifm.tlifm_name) AS tlifm_code_name",
                    'tlifm.tlifm_code AS tlifm_code',
                    'tlifm.tlifm_name AS tlifm_name',
                ])
                .where('outbtl.outbtl_id = :outbtl_id', { outbtl_id: Number(outbtl_id) })
                .andWhere('outbtl.outbtl_is_active = :isActive', { isActive: true})
                .getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('outbtl.outbtl_id'));
            }
    
            // ใช้ Model จัดการรูปแบบข้อมูล
            const groupedData = OutbToolingGroupedModel.fromRawData(rawData);
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('outbtl.outbtl_id'), groupedData);
        } catch (error: any) {
            console.error(`Error in ${operation} with outbtl_id: ${outbtl_id}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getReqById(outbtl_id: number, manager?: EntityManager): Promise<ApiResponse<OutbToolingGroupedModel>> {
        const response = new ApiResponse<OutbToolingGroupedModel>();
        const operation = 'OutbToolingService.getReqById';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_tooling) : this.outbtlRepository;
            // Query ข้อมูลทั้งหมดที่มี outbtl_id เดียวกัน
            const rawData = await repository
                .createQueryBuilder('outbtl')
                .leftJoin('m_outb_tooling_items', 'outbtlitm', 'outbtl.outbtl_id = outbtlitm.outbtl_id')
                .leftJoin('m_inb_tooling', 'inbtl', 'outbtlitm.inbtl_id = inbtl.inbtl_id')
                .leftJoin('m_tooling_ifm', 'tlifm', 'inbtl.tlifm_id = tlifm.tlifm_id')
                .leftJoin('m_warehouse', 'wh', 'inbtl.wh_id = wh.wh_id')
                .leftJoin('m_zone', 'zn', 'inbtl.zn_id = zn.zn_id')
                .leftJoin('m_location', 'loc', 'inbtl.loc_id = loc.loc_id')
                .select([
                    'outbtl.outbtl_id AS outbtl_id',
                    'outbtl.outbtl_code AS outbtl_code',
                    "NOW() AS today_date_time", // ✅ ใช้ค่า Timestamp ปกติ
                    "DATE_FORMAT(NOW(), '%e/%c/%y %H:%i:%s') AS today_date", // ✅ ใช้รูปแบบ YYYY-MM-DD
                    "DATE_FORMAT(outbtl.withdr_date, '%d %b %y') AS withdr_date",
                    'outbtl.outbtl_details AS outbtl_details',
                    "outbtl.outbtl_issued_by AS outbtl_issued_by",
                    'outbtlitm.outbtlitm_id AS outbtlitm_id',
                    'inbtl.inbtl_id AS inbtl_id',
                    'inbtl.inbtl_code AS inbtl_code',
                    'tlifm.tlifm_name AS tlifm_name',
                    'wh.wh_name AS wh_name',
                    'zn.zn_name AS zn_name',
                    'loc.loc_name AS loc_name',
                    "outbtlitm.outbtlitm_quantity AS outbtlitm_quantity",
                ])
                .where('outbtl.outbtl_id = :outbtl_id', { outbtl_id: Number(outbtl_id) })
                .andWhere('outbtl.outbtl_is_active = :isActive', { isActive: true})
                .getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('outbtl.outbtl_id'));
            }
    
            // ใช้ Model จัดการรูปแบบข้อมูล
            const groupedData = OutbToolingGroupedReqModel.fromRawData(rawData);
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('outbtl.outbtl_id'), groupedData);
        } catch (error: any) {
            console.error(`Error in ${operation} with outbtl_id: ${outbtl_id}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async updateDates(outbtl_id: number, data: { withdr_date?: string;}, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbToolingService.updateDates';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_tooling) : this.outbtlRepository;
    
            // ค้นหา Record ตาม outbtl_id
            const outbtl = await repository.findOne({ where: { outbtl_id } });
    
            if (!outbtl) {
                return response.setIncomplete(lang.msgNotFound('outbtl.outbtl_id'));
            }
    
            // ตรวจสอบว่ามีค่าที่ต้องอัปเดตหรือไม่
            if (!data.withdr_date) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // อัปเดตค่าตามที่ได้รับ
            if (data.withdr_date) {
                outbtl.withdr_date = new Date(data.withdr_date);
            }
    
            // บันทึกการอัปเดต
            await repository.save(outbtl);
    
            // ✅ ส่ง Response เฉพาะค่าที่ต้องการ
            const responseData = {
                outbtl_id: outbtl.outbtl_id,
                withdr_date: outbtl.withdr_date
            };
    
            return response.setComplete(lang.msgSuccessAction('updated', 'item.outbtl'), responseData);
    
        } catch (error: any) {
            console.error(`Error in ${operation} with outbtl_id: ${outbtl_id}`, error);
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        }
    }

    async idExists(id: number, manager?: EntityManager): Promise<boolean> {
        const repository = manager ? manager.getRepository(m_outb_tooling) : this.outbtlRepository;
        const count = await repository.count({ where: { outbtl_id: id } });
        return count > 0;
    }

}