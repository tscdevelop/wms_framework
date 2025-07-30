import { Repository, EntityManager, Not, In } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils
import CodeGenerator from '../utils/CodeGenerator';

import { m_outb_raw_material } from '../entities/m_outb_raw_material.entity';
import { OutbRawMaterialModel } from '../models/outb_raw_material.model';
import { m_outb_raw_material_items } from '../entities/m_outb_raw_material_items.entity';
import { OutbRawMaterialReqModel } from '../models/outb_raw_material_getreqbyid.mode.l';
import { m_inb_raw_material } from '../entities/m_inb_raw_material.entity';
import { deleteEntity } from '../utils/DatabaseUtils';
import { m_notifications } from '../entities/m_notifications.entity';
import { ApprovalStatus, NotifStatus, NotifType, RefType, WithdrawStatus } from '../common/global.enum';
import { s_user_notification } from '../entities/s_user_notification.entity';
import { s_user } from '../entities/s_user.entity';
import { getUsersToNotify } from '../utils/NotificationsUtils';

export class OutbRawMaterialService {
    private outbrmRepository: Repository<m_outb_raw_material>;
    private outbrmItmRepository: Repository<m_outb_raw_material_items>;
    private inbrmRepository: Repository<m_inb_raw_material>;
    private notificationRepository: Repository<m_notifications>;
    private usernotifRepo: Repository<s_user_notification>;
    private userRepository: Repository<s_user>;

    constructor(){
        this.outbrmRepository = AppDataSource.getRepository(m_outb_raw_material);
        this.outbrmItmRepository = AppDataSource.getRepository(m_outb_raw_material_items);
        this.inbrmRepository = AppDataSource.getRepository(m_inb_raw_material);
        this.notificationRepository = AppDataSource.getRepository(m_notifications);
        this.usernotifRepo = AppDataSource.getRepository(s_user_notification);
        this.userRepository = AppDataSource.getRepository(s_user);
    }

    private async generateCode(): Promise<string> {
        const codeGenerator = new CodeGenerator(AppDataSource);
        const newCode = await codeGenerator.generateCode('m_outb_raw_material', 'outbrm_code', 'ORM', '', '[PREFIX][000x]');
        return newCode;
    }
    
    // เช็คว่ามี items ถูกส่งมาไหม
    private validateItemsExistence(items: OutbRawMaterialModel["items"] | undefined, response: ApiResponse<any>): ApiResponse<any> | null {
        items = items ?? [];  // ป้องกัน `undefined`
        if (items.length === 0) {
            return response.setIncomplete(lang.msgRequired('items'));
        }
        return null;
    }

    // ห้ามมี inbrm_id ซ้ำกันในรายการที่ส่งมา
    private checkDuplicateInbrmId(inbrm_ids: number[], response: ApiResponse<any>): ApiResponse<any> | null {
        if (new Set(inbrm_ids).size !== inbrm_ids.length) {
            return response.setIncomplete(lang.msg('validation.duplicate'));
        }
        return null;
    }

    // ตรวจสอบว่ามี inbrm_id อยู่ใน m_inb_raw_material หรือไม่
    private async checkInbrmExists(inbrm_ids: number[], manager: EntityManager, response: ApiResponse<any>): Promise<ApiResponse<any> | null> {
        if (inbrm_ids.length === 0) return null;
    
        const foundInbrm = await manager.getRepository(m_inb_raw_material)
            .findBy({ inbrm_id: In(inbrm_ids) });
    
        const foundIds = new Set(foundInbrm.map(inb => inb.inbrm_id));
        const missingIds = inbrm_ids.filter(id => !foundIds.has(id));
    
        if (missingIds.length > 0) {
            return response.setIncomplete(lang.msgNotFound(`inbrm.inbrm_id`));
        }
        return null;
    }
    
    // เช็ค outbrmitm_quantity ไม่เกิน inbrm_quantity
    private async checkQuantityLimit(
        inbrm_ids: number[],
        quantities: number[],
        manager: EntityManager,
        response: ApiResponse<any>
    ): Promise<ApiResponse<any> | null> {
        if (inbrm_ids.length === 0) return null;
    
        // ✅ รวมยอดปริมาณที่ต้องใช้ของ inbrm_id เดียวกัน
        const totalQuantityMap = new Map<number, number>();
    
        for (let i = 0; i < inbrm_ids.length; i++) {
            const inbrm_id = inbrm_ids[i];
            const qty = quantities[i];
    
            // ✅ ตรวจสอบว่าห้ามเป็นค่าติดลบ
            if (qty < 0) {
                return response.setIncomplete(
                    lang.msg(`field.integer`)
                );
            }
    
            // ✅ ตรวจสอบว่าห้ามเป็น 0
            if (qty === 0) {
                return response.setIncomplete(
                    lang.msg(`field.not_zero`)
                );
            }
            
            // รวมยอดเบิกของ inbrm_id เดียวกัน
            if (!totalQuantityMap.has(inbrm_id)) {
                totalQuantityMap.set(inbrm_id, 0);
            }
            totalQuantityMap.set(inbrm_id, totalQuantityMap.get(inbrm_id)! + qty);
        }
    
        // ✅ ดึงข้อมูล inbrm_quantity จากฐานข้อมูล
        const inbrmData = await manager.getRepository(m_inb_raw_material)
            .findBy({ inbrm_id: In(Array.from(totalQuantityMap.keys())) });
    
        if (inbrmData.length === 0) {
            return response.setIncomplete(lang.msg('inbrm.not_found'));
        }
    
        // ✅ ตรวจสอบว่าสินค้าพอหรือไม่ (เช็คยอดรวม)
        for (const [inbrm_id, totalQty] of totalQuantityMap.entries()) {
            const inbrm = inbrmData.find(inb => inb.inbrm_id === inbrm_id);
            if (!inbrm) {
                return response.setIncomplete(lang.msgNotFound(`inbrm_id: ${inbrm_id}`));
            }
    
            if (totalQty > inbrm.inbrm_quantity) {
                return response.setIncomplete(
                    lang.msg(`field.quantity_not_enough`) + ` มีอยู่ ${inbrm.inbrm_quantity} แต่ต้องการ ${totalQty}`
                );
            }
        }
    
        return null;
    }    

    // ฟังก์ชันตรวจสอบการตรงกันของ BOM สำหรับ inbrm_id และ outbrm_is_bom_used
    private async checkBomMatch(
        inbrm_ids: number[],
        outbrm_is_bom_used: boolean,
        manager: EntityManager,
        response: ApiResponse<any>
    ): Promise<ApiResponse<any> | null> {
        // ดึงข้อมูลใน m_inb_raw_material สำหรับ inbrm_ids
        const inbrmData = await manager.getRepository(m_inb_raw_material).findBy({ inbrm_id: In(inbrm_ids) });

        if (inbrmData.length === 0) {
            return response.setIncomplete(lang.msgNotFound('item.data'));
        }

        // ตรวจสอบสถานะ BOM ของแต่ละ inbrm_id
        for (let i = 0; i < inbrm_ids.length; i++) {
            const inbrm = inbrmData.find(inb => inb.inbrm_id === inbrm_ids[i]);

            if (!inbrm) {
                return response.setIncomplete(lang.msgNotFound(`inbrm_id: ${inbrm_ids[i]}`));
            }

            // ตรวจสอบสถานะ BOM ว่าตรงกันหรือไม่
            if (inbrm.inbrm_is_bom_used !== outbrm_is_bom_used) {
                return response.setIncomplete(
                    lang.msg(
                        `Mismatch BOM usage for inbrm_id (${inbrm_ids[i]}). Expected: ${outbrm_is_bom_used ? "BOM" : "Non-BOM"}, Found: ${inbrm.inbrm_is_bom_used ? "BOM" : "Non-BOM"}`
                    )
                );
            }
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
            reference_id,   // ไอดี outbrm_id
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
    
    async create(
        data: Partial<OutbRawMaterialModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbRawMaterialService.create';

        // สร้าง Query Runner สำหรับ Transaction (ถ้าไม่มี Manager)
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
            const outbrmRepo = manager ? useManager.getRepository(m_outb_raw_material): this.outbrmRepository;
            const outbrmItmRepo = manager ? useManager.getRepository(m_outb_raw_material_items): this.outbrmItmRepository;
    
            const items = data.items ?? []; // ถ้า `data.items` เป็น undefined ให้ใช้ []
    
            const inbrm_ids = items.map(item => item.inbrm_id);
            const quantities = items.map(item => item.outbrmitm_quantity);
            
            // ตรวจสอบ items ว่ามีค่าหรือไม่
            const itemsValidation = this.validateItemsExistence(items, response);
            if (itemsValidation) return itemsValidation;
    
            // ตรวจสอบห้ามมี inbrm_id ซ้ำกัน
            const duplicateCheck = this.checkDuplicateInbrmId(inbrm_ids, response);
            if (duplicateCheck) return duplicateCheck;
    
            // ตรวจสอบว่า inbrm_id มีอยู่ใน m_inb_raw_material หรือไม่
            const inbrmCheck = await this.checkInbrmExists(inbrm_ids, useManager, response);
            if (inbrmCheck) return inbrmCheck;
    
            // ตรวจสอบว่า outbrmitm_quantity ไม่เกิน inbrm_quantity
            const quantityCheck = await this.checkQuantityLimit(inbrm_ids, quantities, useManager, response);
            if (quantityCheck) return quantityCheck;
    
             // ตรวจสอบการตรงกันของ BOM
            const bomCheck = await this.checkBomMatch(inbrm_ids, data.outbrm_is_bom_used ?? false, useManager, response);
            if (bomCheck) return bomCheck;

            // สร้างข้อมูล `m_outb_rm`
            const newOutbRM = outbrmRepo.create({
                ...data,
                outbrm_code: await this.generateCode(),
                outbrm_is_active: true,
                create_date: new Date(),
                create_by: reqUsername,
            });
    
            const savedOutbRM = await outbrmRepo.save(newOutbRM);
    
            // บันทึก `m_outb_rm_items`
            const outbSemiItems = items.map(item => ({
                outbrm_id: savedOutbRM.outbrm_id,
                inbrm_id: item.inbrm_id,
                outbrmitm_quantity: item.outbrmitm_quantity,
            }));
    
            await outbrmItmRepo.save(outbSemiItems);
    
            // ดึงข้อมูล items ที่เพิ่งบันทึก
            const savedItems = await outbrmItmRepo.find({ where: { outbrm_id: savedOutbRM.outbrm_id } });

             // บันทึกแจ้งเตือน `REQUEST_APPROVAL`
            await this.saveRequestApprovalNotification(RefType.OUTBRM, savedOutbRM.outbrm_id, reqUsername, useManager);

            // Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.outbrm'), {
                ...savedOutbRM,
                items: savedItems, // เพิ่มข้อมูล items ใน response
            });
            
    
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`Error during ${operation}:`, error);
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async update(
        outbrm_id: number,
        data: Partial<OutbRawMaterialModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'OutbRawMaterialService.create';

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
            const outbrmRepo = manager ? useManager.getRepository(m_outb_raw_material): this.outbrmRepository;
            const outbrmItmRepo = manager ? useManager.getRepository(m_outb_raw_material_items): this.outbrmItmRepository;
    
            // ตรวจสอบว่า `outbrm_id` มีอยู่จริงหรือไม่
            const existingOutbRM = await outbrmRepo.findOne({ where: { outbrm_id } });
            if (!existingOutbRM) {
                return response.setIncomplete(lang.msgNotFound('outbrm.outbrm_id'));
            }
            const items = data.items ?? []; // ถ้า `data.items` เป็น undefined ให้ใช้ []

            const inbrm_ids = items.map(item => item.inbrm_id);
            const quantities = items.map(item => item.outbrmitm_quantity);
            
            // ตรวจสอบ items ว่ามีค่าหรือไม่
            const itemsValidation = this.validateItemsExistence(items, response);
            if (itemsValidation) return itemsValidation;
    
            // ตรวจสอบห้ามมี inbrm_id ซ้ำกัน
            const duplicateCheck = this.checkDuplicateInbrmId(inbrm_ids, response);
            if (duplicateCheck) return duplicateCheck;
    
            // ตรวจสอบว่า inbrm_id มีอยู่ใน m_inb_raw_material หรือไม่
            const inbrmCheck = await this.checkInbrmExists(inbrm_ids, useManager, response);
            if (inbrmCheck) return inbrmCheck;
    
            // ตรวจสอบว่า outbrmitm_quantity ไม่เกิน inbrm_quantity
            const quantityCheck = await this.checkQuantityLimit(inbrm_ids, quantities, useManager, response);
            if (quantityCheck) return quantityCheck;
    
                // ตรวจสอบการตรงกันของ BOM
            const bomCheck = await this.checkBomMatch(inbrm_ids, data.outbrm_is_bom_used ?? false, useManager, response);
            if (bomCheck) return bomCheck;

            // ลบข้อมูลเก่าทั้งหมด
            await outbrmItmRepo.delete({ outbrm_id });
    
            // ใช้ Object.assign() รวมค่าที่ต้องการอัปเดต
            Object.assign(existingOutbRM, {
                ...data,
                update_date: new Date(),
                update_by: reqUsername,
            });
    
            await outbrmRepo.save(existingOutbRM);
    
            // บันทึก `m_outb_rm_items`
            const outbSemiItems = items.map(item => ({
                outbrm_id: outbrm_id,
                inbrm_id: item.inbrm_id,
                outbrmitm_quantity: item.outbrmitm_quantity,
            }));
    
            await outbrmItmRepo.save(outbSemiItems);
    
            const dataResponse = await this.getById(outbrm_id, useManager);
            if (!dataResponse.isCompleted) {
                throw new Error(dataResponse.message);
            }

            response = response.setComplete(lang.msgSuccessAction('updated', 'item.outbrm'),dataResponse.data!);

            // Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response;

        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`Error during ${operation}:`, error);
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }  

    async withdrScan(
        outbrm_id: number,  
        items: { inbrm_id: number; outbrmitm_issued_count: number }[], 
        reqUsername: string, 
        manager?: EntityManager 
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbRawMaterialService.withdrScan';
    
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
            const outbrmItemsRepository = useManager.getRepository(m_outb_raw_material_items);
            const outbrmRepository = useManager.getRepository(m_outb_raw_material);
    
            // ✅ ตรวจสอบว่า `outbrm_appr_status` เป็น `APPROVED`
            const outbrmRecord = await outbrmRepository.findOne({ where: { outbrm_id } });
            if (!outbrmRecord) {
                return response.setIncomplete(lang.msgNotFound('outbrm.outbrm_id'));
            }
    
            // 🛑 ตรวจสอบสถานะการอนุมัติ
            if (outbrmRecord.outbrm_appr_status === ApprovalStatus.PENDING) {
                return response.setIncomplete(lang.msgErrorFormat('field.not_approved'));
            }
    
            if (outbrmRecord.outbrm_appr_status === ApprovalStatus.REJECTED) {
                return response.setIncomplete(lang.msgErrorFormat('field.rejected_approved'));
            }
    
            // ✅ ตรวจสอบว่า `inbrm_id` ห้ามซ้ำกัน
            const uniqueInbrmIds = new Set(items.map(item => item.inbrm_id));
            if (uniqueInbrmIds.size !== items.length) {
                return response.setIncomplete(lang.msgErrorFormat('field.duplicate_inbrm_id'));
            }
    
            let updatedItems: any[] = [];
    
            // ✅ วนลูปประมวลผลแต่ละ `inbrm_id`
            for (const item of items) {
                const { inbrm_id, outbrmitm_issued_count } = item;
    
                // ค้นหารายการที่มี outbrm_id และ inbrm_id ที่ตรงกับที่ส่งมา
                const existingItem = await outbrmItemsRepository.findOne({ where: { outbrm_id, inbrm_id } });
    
                if (!existingItem) {
                    return response.setIncomplete(lang.msgNotFound(`outbrm_id ${outbrm_id} , inbrm_id ${inbrm_id}`));
                }
    
                // ✅ ตรวจสอบไม่ให้เบิกเกิน `outbrmitm_quantity`
                if (outbrmitm_issued_count > existingItem.outbrmitm_quantity) {
                    return response.setIncomplete(lang.msgErrorFormat(`field.scan_count_exceeded`)+ `(for inbrm_id ${inbrm_id})`);
                }
    
                // ✅ อัปเดตจำนวนที่เบิกโดยตรง (Set ค่าที่ส่งมา)
                existingItem.outbrmitm_issued_count = outbrmitm_issued_count;
    
                // ✅ กำหนดสถานะการเบิก
                existingItem.outbrmitm_withdr_status = existingItem.outbrmitm_issued_count === existingItem.outbrmitm_quantity 
                    ? WithdrawStatus.COMPLETED
                    : existingItem.outbrmitm_issued_count > 0
                    ? WithdrawStatus.PARTIAL
                    : WithdrawStatus.PENDING;
    
                // ✅ บันทึกการเปลี่ยนแปลง
                await outbrmItemsRepository.save(existingItem);
    
                // ✅ เพิ่มรายการที่อัปเดตเข้าไปใน `updatedItems`
                updatedItems.push({
                    outbrm_id: existingItem.outbrm_id,
                    inbrm_id: existingItem.inbrm_id,
                    outbrmitm_quantity: existingItem.outbrmitm_quantity,
                    outbrmitm_issued_count: existingItem.outbrmitm_issued_count,
                    outbrmitm_withdr_status: existingItem.outbrmitm_withdr_status,
                });
            }
    
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            response.setComplete(lang.msgSuccessAction('created', 'field.prod_issued'), updatedItems);
            return response;
    
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during withdrScan:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }    
    
    async delete(outbrm_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'OutbRawMaterialService.delete';
    
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
            // ดึง Repository ที่ต้องใช้
            const repository = useManager.getRepository(m_outb_raw_material);
            const itemsRepository = useManager.getRepository(m_outb_raw_material_items);
            const notificationRepository = useManager.getRepository(m_notifications);

            // ตรวจสอบว่ามี `outbrm_id` หรือไม่
            const existingOutbRM = await repository.findOne({ where: { outbrm_id } });
            if (!existingOutbRM) {
                return response.setIncomplete(lang.msgNotFound('outbrm.outbrm_id'));
            }

             // ✅ ตรวจสอบสถานะการอนุมัติ
            if (existingOutbRM.outbrm_appr_status === ApprovalStatus.APPROVED) {
                return response.setIncomplete(lang.msg(`ไม่สามารถลบรายการที่อนุมัติแล้วได้`));
            }
    
            // ลบรายการ `m_outb_rm_items` ที่เกี่ยวข้องทั้งหมดก่อน
            await itemsRepository.delete({ outbrm_id });
    
            // ลบแจ้งเตือน `s_user_notification` ที่เกี่ยวข้อง
            const notiToDelete = await notificationRepository.find({
                where: { reference_type: RefType.OUTBRM, reference_id: outbrm_id },
            });
            
            const notifIds = notiToDelete.map(n => n.notif_id);
            
            if (notifIds.length > 0) {
                const userNotifRepo = manager ? useManager.getRepository(s_user_notification): this.usernotifRepo;
            
                await userNotifRepo.delete({ notif_id: In(notifIds) });
            }

            // ลบแจ้งเตือน `m_notifications` ที่เกี่ยวข้อง
            await notificationRepository.delete({ reference_type: RefType.OUTBRM, reference_id: outbrm_id });

            // ใช้ `deleteEntity()` เพื่อลบ `m_outb_rm`
            const deleteResponse = await deleteEntity(repository, outbrm_id, reqUsername, 'outbrm_is_active', 'outbrm_id');
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
                
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.outbrm'));
    
        } catch (error: unknown) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during outbrm deletion:', error);
            throw new Error(error instanceof Error ? lang.msgErrorFunction(operation, error.message) : lang.msgErrorFunction(operation, 'Unknown error occurred'));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    /** 
     * เพิ่มกรอง outbrm_appr_status
     * เพิ่มกรอง outbrmitm_withdr_status
     * เพิ่มกรองเอาเฉพาะที่มี items
     */
    async getAll(approvalStatus?: ApprovalStatus, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OutbRawMaterialService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_raw_material) : this.outbrmRepository;
    
            // Query outbrm ข้อมูลทั้งหมดในรูปแบบ raw data
            const queryBuilder = repository
                .createQueryBuilder('outbrm')
                .leftJoin('m_outb_raw_material_items', 'outbrmitm', 'outbrmitm.outbrm_id = outbrm.outbrm_id')
                .select([
                    'outbrm.outbrm_id AS outbrm_id',
                    'outbrm.outbrm_code AS outbrm_code',
                    'outbrm.outbrm_details AS outbrm_details',
                    "DATE_FORMAT(outbrm.create_date, '%d %b %y') AS formatted_date", // วันที่เท่านั้น
                    "DATE_FORMAT(outbrm.create_date, '%H:%i:%s') AS create_time", // เวลาเท่านั้น
                    'outbrm.outbrm_appr_status AS outbrm_appr_status',
                    'outbrmitm.outbrmitm_withdr_status AS outbrmitm_withdr_status',
                    'outbrm.outbrm_is_active AS outbrm_is_active',
                    'outbrm.create_by AS create_by',
                    'outbrm.update_date AS update_date',
                    'outbrm.update_by AS update_by',
                    "DATE_FORMAT(outbrm.withdr_date, '%d %b %y') AS withdr_date",
                    "DATE_FORMAT(outbrm.withdr_date, '%H:%i:%s') AS withdr_time",
                    "DATE_FORMAT(NOW(), '%d %b %y') AS today_date",
                ])
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .where('outbrm.outbrm_is_active = :isActive', { isActive: true })
                .orderBy('outbrm.outbrm_code', 'ASC')
    
            // ✅ กรองข้อมูลเฉพาะสถานะที่กำหนด ถ้ามีการส่งค่า approvalStatus
            if (approvalStatus) {
                queryBuilder.andWhere('outbrm.outbrm_appr_status = :apprStatus', { apprStatus: approvalStatus });
            }
    
            const rawData = await queryBuilder.getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setComplete(lang.msgNotFound('item.outbrm'), []); // ✅ คืน array ว่าง
            }
    
            // ลำดับความสำคัญของ outbrmitm_withdr_status
            const statusPriority: { [key in WithdrawStatus]: number } = {
                [WithdrawStatus.PARTIAL]: 1, // เบิกไม่ครบ
                [WithdrawStatus.PENDING]: 2, // ยังไม่ได้เบิก
                [WithdrawStatus.COMPLETED]: 3 // เบิกแล้ว
            };

            // ฟิลเตอร์เอาเฉพาะค่า outbrm_id ที่ไม่ซ้ำ และจัดเรียงตาม outbrmitm_withdr_status
            const filteredData = Array.from(
                rawData.reduce((map, record) => {
                    const existing = map.get(record.outbrm_id);

                    //ตรวจสอบสถานะที่ไม่ถูกต้อง
                    const existingStatus = existing?.outbrmitm_withdr_status as WithdrawStatus;
                    const newStatus = record.outbrmitm_withdr_status as WithdrawStatus;

                    if (!Object.values(WithdrawStatus).includes(newStatus)) {
                        console.warn(`พบค่า outbrmitm_withdr_status ที่ไม่ถูกต้อง: ${newStatus}`);
                        return map;
                    }

                    // ใช้ตัวแปรกลาง updatedRecord เพื่อป้องกันการเขียนทับค่า
                    const updatedRecord = existing ? { ...existing } : { ...record };

                    if (existing) {
                        if (existingStatus === WithdrawStatus.PARTIAL || newStatus === WithdrawStatus.PARTIAL) {
                            updatedRecord.outbrmitm_withdr_status = WithdrawStatus.PARTIAL;
                        } else if (
                            (existingStatus === WithdrawStatus.PENDING && newStatus === WithdrawStatus.COMPLETED) ||
                            (existingStatus === WithdrawStatus.COMPLETED && newStatus === WithdrawStatus.PENDING)
                        ) {
                            updatedRecord.outbrmitm_withdr_status = WithdrawStatus.PARTIAL;
                        } else if (
                            statusPriority[newStatus] !== undefined &&
                            statusPriority[existingStatus] !== undefined &&
                            statusPriority[newStatus] < statusPriority[existingStatus]
                        ) {
                            updatedRecord.outbrmitm_withdr_status = newStatus;
                        }
                    }

                    map.set(record.outbrm_id, updatedRecord);
                    return map;
                }, new Map<number, any>()).values()
            );

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.outbrm'), filteredData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(outbrm_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OutbRawMaterialService.getById';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_raw_material) : this.outbrmRepository;
            const outbrmItmRepository = manager ? manager.getRepository(m_outb_raw_material_items) : this.outbrmItmRepository;
    
            // ดึงข้อมูล Outbound RM (ต้องเป็น outbrm_is_active = true เท่านั้น)
            const rawData = await repository
                .createQueryBuilder('outbrm')
                .select([
                    'outbrm.outbrm_id AS outbrm_id',
                    'outbrm.outbrm_code AS outbrm_code',
                    'outbrm.outbrm_details AS outbrm_details',
                    'outbrm.outbrm_is_bom_used AS outbrm_is_bom_used',
                    'outbrm.outbrm_appr_status AS outbrm_appr_status',
                    'outbrm.outbrm_is_active AS outbrm_is_active',
                    'outbrm.create_date AS create_date',
                    'outbrm.create_by AS create_by',
                    'outbrm.update_date AS update_date',
                    'outbrm.update_by AS update_by'
                ])
                .where('outbrm.outbrm_id = :outbrm_id', { outbrm_id })
                .andWhere('outbrm.outbrm_is_active = true') // เพิ่มเงื่อนไข active
                .getRawOne();
    
            if (!rawData) {
                return response.setIncomplete(lang.msgNotFound('outbrm.outbrm_id'));
            }
    
            // ดึงข้อมูล Item แยกจาก Table `m_outb_raw_material_items`
            const items = await outbrmItmRepository
                .createQueryBuilder('items')
                .leftJoin('m_inb_raw_material', 'inbrm', 'items.inbrm_id = inbrm.inbrm_id')
                .leftJoin('m_raw_material_ifm', 'rmifm', 'rmifm.rmifm_id = inbrm.rmifm_id')
                .leftJoin('m_unit', 'unit', 'unit.unit_id = rmifm.rmifm_product_unitId')
                .select([
                    'items.outbrmitm_id AS outbrmitm_id',
                    'items.inbrm_id AS inbrm_id',
                    'inbrm.inbrm_code AS inbrm_code',
                    'rmifm.rmifm_name AS rmifm_name',
                    'COALESCE(inbrm.inbrm_bom, "N/A") AS inbrm_bom', // กรณีไม่มี BOM ให้เป็น "N/A"
                    'items.outbrmitm_quantity AS outbrmitm_quantity',
                    'unit.unit_abbr_th AS unit_abbr_th',
                    'inbrm.inbrm_quantity AS inbrm_quantity',
                    'items.outbrmitm_issued_count AS outbrmitm_issued_count',
                    'items.outbrmitm_withdr_status AS outbrmitm_withdr_status'
                ])
                .where('items.outbrm_id = :outbrm_id', { outbrm_id })
                .getRawMany();
    
            // ถ้าไม่มี BOM ไม่ต้องใส่ inbrm_bom
            if (!rawData.outbrm_is_bom_used) {
                items.forEach(item => item.inbrm_bom = null);
            }
    
            // จัดโครงสร้างผลลัพธ์
            const result = {
                ...rawData,
                items: items.length > 0 ? items : []
            };
    
            return response.setComplete(lang.msgFound('outbrm.outbrm_id'), result);
        } catch (error: unknown) {
            console.error(`Error in ${operation} with outbrm_id: ${outbrm_id}`, error);
            throw new Error(lang.msgErrorFunction(operation, error instanceof Error ? error.message : 'Unknown error occurred'));
        }
    }
    
    async getReqByID(outbrm_id: number, manager?: EntityManager): Promise<ApiResponse<OutbRawMaterialReqModel>> {
        const response = new ApiResponse<OutbRawMaterialReqModel>();
        const operation = 'OutbRawMaterialService.getReqByID';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_raw_material) : this.outbrmRepository;
    
            // Query ข้อมูลทั้งหมดที่มี outbrm_id เดียวกัน
            const rawData = await repository
                .createQueryBuilder('outbrm')
                .leftJoin('m_outb_raw_material_items', 'outbrmitm', 'outbrmitm.outbrm_id = outbrm.outbrm_id')
                .leftJoin('m_inb_raw_material', 'inbrm', 'inbrm.inbrm_id = outbrmitm.inbrm_id')
                .leftJoin('m_raw_material_ifm', 'rmifm', 'rmifm.rmifm_id = inbrm.rmifm_id')
                .leftJoin('m_warehouse', 'warehouse', 'inbrm.wh_id = warehouse.wh_id')
                .leftJoin('m_zone', 'zone', 'inbrm.zn_id = zone.zn_id')
                .leftJoin('m_unit', 'unit', 'unit.unit_id = rmifm.rmifm_product_unitId')
                .select([
                    'outbrm.outbrm_id AS outbrm_id',
                    'outbrm.outbrm_code AS outbrm_code',
                    "NOW() AS today_date_time", // ✅ ใช้ค่า Timestamp ปกติ
                    "DATE_FORMAT(NOW(), '%e/%c/%y %H:%i:%s') AS today_date", // ✅ ใช้รูปแบบ YYYY-MM-DD
                    "DATE_FORMAT(outbrm.withdr_date, '%d %b %y') AS withdr_date",
                    'outbrm.outbrm_details AS outbrm_details',
                    'outbrmitm.outbrmitm_id AS outbrmitm_id',
                    'inbrm.inbrm_id AS inbrm_id',
                    'inbrm.inbrm_code AS inbrm_code',
                    'rmifm.rmifm_name AS rmifm_name',
                    'rmifm.rmifm_width AS rmifm_width',
                    'rmifm.rmifm_length AS rmifm_length',
                    'rmifm.rmifm_weight AS rmifm_weight',
                    'rmifm.rmifm_thickness AS rmifm_thickness',
                    'unit.unit_abbr_th AS unit_abbr_th',
                    'warehouse.wh_name AS wh_name',
                    'zone.zn_name AS zn_name',
                    'outbrmitm.outbrmitm_quantity AS outbrmitm_quantity',
                    'outbrmitm.outbrmitm_issued_count AS outbrmitm_issued_count',
                    'outbrmitm.outbrmitm_withdr_status AS outbrmitm_withdr_status',
                ])
                .where('outbrm.outbrm_id = :outbrm_id', { outbrm_id })
                .getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('outbrm.outbrm_id'));
            }

            // ใช้ Model จัดการรูปแบบข้อมูล
            const groupedData = OutbRawMaterialReqModel.fromRawData(rawData);
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('outbrm.outbrm_id'), groupedData);
        } catch (error: any) {
            console.error(`Error in ${operation} with outbrm_id: ${outbrm_id}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async updateDates(outbrm_id: number, data: { withdr_date?: string;}, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbRawMaterialService.updateDates';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_raw_material) : this.outbrmRepository;
    
            // ค้นหา Record ตาม outbrm_id
            const outbrm = await repository.findOne({ where: { outbrm_id } });
    
            if (!outbrm) {
                return response.setIncomplete(lang.msgNotFound('outbrm.outbrm_id'));
            }
    
            // ตรวจสอบว่ามีค่าที่ต้องอัปเดตหรือไม่
            if (!data.withdr_date) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // อัปเดตค่าตามที่ได้รับ
            if (data.withdr_date) {
                outbrm.withdr_date = new Date(data.withdr_date);
            }
    
            // บันทึกการอัปเดต
            await repository.save(outbrm);
    
            // ✅ ส่ง Response เฉพาะค่าที่ต้องการ
            const responseData = {
                outbrm_id: outbrm.outbrm_id,
                withdr_date: outbrm.withdr_date
            };
    
            return response.setComplete(lang.msgSuccessAction('updated', 'item.outbrm'), responseData);
    
        } catch (error: any) {
            console.error(`Error in ${operation} with outbrm_id: ${outbrm_id}`, error);
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        }
    }
    
}