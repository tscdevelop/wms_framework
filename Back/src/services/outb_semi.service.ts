import { Repository, EntityManager, QueryFailedError, In } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; 
import * as validate from '../utils/ValidationUtils'; 
import CodeGenerator from '../utils/CodeGenerator';

import { m_outb_semi } from '../entities/m_outb_semi.entity';
import { m_outb_semi_items } from '../entities/m_outb_semi_items.entity';
import { m_inb_semi } from '../entities/m_inb_semi.entity';
import { OutbSemiModel } from '../models/outb_semi.model';
import { OutbSemiGroupedModel } from '../models/outb_semi_getbyid.model';
import { deleteEntity } from '../utils/DatabaseUtils';
import { ApprovalStatus, NotifStatus, NotifType, RefType, ShipmentStatus, WithdrawStatus } from '../common/global.enum';
import { m_notifications } from '../entities/m_notifications.entity';
import { OutbSemiReqModel } from '../models/outb_semi_getreqbyid.model';
import { s_user_notification } from '../entities/s_user_notification.entity';
import { s_user } from '../entities/s_user.entity';
import { getUsersToNotify } from '../utils/NotificationsUtils';

export class OutbSemiService {
    private outbsemiRepository: Repository<m_outb_semi>;
    private outbsemiItemsRepository: Repository<m_outb_semi_items>;
    private inbsemiRepository: Repository<m_inb_semi>;
    private notificationRepository: Repository<m_notifications>;
    private usernotifRepo: Repository<s_user_notification>;
    private userRepository: Repository<s_user>;

    constructor() {
        this.outbsemiRepository = AppDataSource.getRepository(m_outb_semi);
        this.outbsemiItemsRepository = AppDataSource.getRepository(m_outb_semi_items);
        this.inbsemiRepository = AppDataSource.getRepository(m_inb_semi);
        this.notificationRepository = AppDataSource.getRepository(m_notifications);
        this.usernotifRepo = AppDataSource.getRepository(s_user_notification);
        this.userRepository = AppDataSource.getRepository(s_user);
    }

    private async generateCode(): Promise<string> {
        const codeGenerator = new CodeGenerator(AppDataSource);
        return await codeGenerator.generateCode('m_outb_semi', 'outbsemi_code', 'OSM', '', '[PREFIX][000x]');
    }

    //ฟังก์ชันตรวจสอบค่าที่ต้องกรอก
    private validateRequiredFields(data: Partial<OutbSemiModel>, response: ApiResponse<any>): ApiResponse<any> | null {
        const requiredFields: { key: keyof OutbSemiModel; message: string }[] = [
            { key: "outbsemi_so", message: "outbsemi.outbsemi_so" }
        ];
    
        // ถ้า `outbsemi_is_returned` เป็น false ต้องกรอกข้อมูลของ driver
        if (data.outbsemi_is_returned === false) {
            requiredFields.push(
                { key: "outbsemi_driver_name", message: "outbsemi.outbsemi_driver_name" },
                { key: "outbsemi_vehicle_license", message: "outbsemi.outbsemi_vehicle_license" },
                { key: "tspyard_id", message: "item.tspyard" },
                { key: "outbsemi_phone", message: "field.phone" },
                { key: "outbsemi_address", message: "field.address" }
            );
        }
    
        for (const { key, message } of requiredFields) {
            if (validate.isNullOrEmpty(data[key])) {
                return response.setIncomplete(lang.msgRequired(message));
            }
        }
        return null;
    }
    

    // เช็คว่ามี items ถูกส่งมาไหม
    private validateItemsExistence(items: OutbSemiModel["items"] | undefined, response: ApiResponse<any>): ApiResponse<any> | null {
        items = items ?? [];  // ป้องกัน `undefined`
        if (items.length === 0) {
            return response.setIncomplete(lang.msgRequired('items'));
        }
        return null;
    }

    // ห้ามมี inbsemi_id ซ้ำกันในรายการที่ส่งมา
    private checkDuplicateInbsemiId(inbsemi_ids: number[], response: ApiResponse<any>): ApiResponse<any> | null {
        if (new Set(inbsemi_ids).size !== inbsemi_ids.length) {
            return response.setIncomplete(lang.msg('validation.duplicate'));
        }
        return null;
    }

    // ตรวจสอบว่ามี inbsemi_id อยู่ใน m_inb_semi หรือไม่
    private async checkInbsemiExists(inbsemi_ids: number[], manager: EntityManager, response: ApiResponse<any>): Promise<ApiResponse<any> | null> {
        if (inbsemi_ids.length === 0) return null;
    
        const foundInbsemi = await manager.getRepository(m_inb_semi)
            .findBy({ inbsemi_id: In(inbsemi_ids) });
    
        const foundIds = new Set(foundInbsemi.map(inb => inb.inbsemi_id));
        const missingIds = inbsemi_ids.filter(id => !foundIds.has(id));
    
        if (missingIds.length > 0) {
            return response.setIncomplete(lang.msgNotFound(`inbsemi.inbsemi_id`));
        }
        return null;
    }
    
    // เช็ค outbsemiitm_quantity ไม่เกิน inbsemi_quantity
    private async checkQuantityLimit(
        inbsemi_ids: number[],
        quantities: number[],
        manager: EntityManager,
        response: ApiResponse<any>
    ): Promise<ApiResponse<any> | null> {
        if (inbsemi_ids.length === 0) return null;
    
        // ✅ รวมยอดปริมาณที่ต้องใช้ของ inbsemi_id เดียวกัน
        const totalQuantityMap = new Map<number, number>();
    
        for (let i = 0; i < inbsemi_ids.length; i++) {
            const inbsemi_id = inbsemi_ids[i];
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
    
            // รวมยอดเบิกของ inbsemi_id เดียวกัน
            if (!totalQuantityMap.has(inbsemi_id)) {
                totalQuantityMap.set(inbsemi_id, 0);
            }
            totalQuantityMap.set(inbsemi_id, totalQuantityMap.get(inbsemi_id)! + qty);
        }
    
        // ✅ ดึงข้อมูล inbsemi_quantity จากฐานข้อมูล
        const inbsemiData = await manager.getRepository(m_inb_semi)
            .findBy({ inbsemi_id: In(Array.from(totalQuantityMap.keys())) });
    
        if (inbsemiData.length === 0) {
            return response.setIncomplete(lang.msgNotFound('item.data'));
        }
    
        // ✅ ตรวจสอบว่าสินค้าพอหรือไม่ (เช็คยอดรวม)
        for (const [inbsemi_id, totalQty] of totalQuantityMap.entries()) {
            const inbsemi = inbsemiData.find(inb => inb.inbsemi_id === inbsemi_id);
            if (!inbsemi) {
                return response.setIncomplete(lang.msgNotFound(`inbsemi_id: ${inbsemi_id}`));
            }
    
            if (totalQty > inbsemi.inbsemi_quantity) {
                return response.setIncomplete(
                    lang.msg(`field.quantity_not_enough`) + ` มีอยู่ ${inbsemi.inbsemi_quantity} แต่ต้องการ ${totalQty}`
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
            reference_id,   // ไอดี outbsemi_id
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

    async create(data: Partial<OutbSemiModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbSemiService.create';
    
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
            const outbsemiRepo = manager ? useManager.getRepository(m_outb_semi): this.outbsemiRepository;
            const outbsemiItemsRepo = manager ? useManager.getRepository(m_outb_semi_items): this.outbsemiItemsRepository;
    
            // ตรวจสอบค่าที่ต้องกรอก
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) return validationResponse;
    
            const items = data.items ?? []; // ถ้า `data.items` เป็น undefined ให้ใช้ []
    
            const inbsemi_ids = items.map(item => item.inbsemi_id);
            const quantities = items.map(item => item.outbsemiitm_quantity);
            
            // ตรวจสอบ items ว่ามีค่าหรือไม่
            const itemsValidation = this.validateItemsExistence(items, response);
            if (itemsValidation) return itemsValidation;
    
            // ตรวจสอบห้ามมี inbsemi_id ซ้ำกัน
            const duplicateCheck = this.checkDuplicateInbsemiId(inbsemi_ids, response);
            if (duplicateCheck) return duplicateCheck;
    
            // ตรวจสอบว่า inbsemi_id มีอยู่ใน m_inb_semi หรือไม่
            const inbsemiCheck = await this.checkInbsemiExists(inbsemi_ids, useManager, response);
            if (inbsemiCheck) return inbsemiCheck;
    
            // ตรวจสอบว่า outbsemiitm_quantity ไม่เกิน inbsemi_quantity
            const quantityCheck = await this.checkQuantityLimit(inbsemi_ids, quantities, useManager, response);
            if (quantityCheck) return quantityCheck;
    
            // ตรวจสอบค่า `outbsemi_is_returned`
            if (data.outbsemi_is_returned === true) {
                data.outbsemi_driver_name = null;
                data.outbsemi_vehicle_license = null;
                data.tspyard_id = null;
                data.outbsemi_phone = null;
                data.outbsemi_address = null;
            }

            // สร้างข้อมูล `m_outb_semi`
            const newOutbSemi = outbsemiRepo.create({
                ...data,
                outbsemi_code: await this.generateCode(),
                outbsemi_is_active: true,
                create_date: new Date(),
                create_by: reqUsername,
            });
    
            const savedOutbSemi = await outbsemiRepo.save(newOutbSemi);
    
            // บันทึก `m_outb_semi_items`
            const outbSemiItems = items.map(item => ({
                outbsemi_id: savedOutbSemi.outbsemi_id,
                inbsemi_id: item.inbsemi_id,
                outbsemiitm_quantity: item.outbsemiitm_quantity,
            }));
    
            await outbsemiItemsRepo.save(outbSemiItems);
    
            // ดึงข้อมูล items ที่เพิ่งบันทึก
            const savedItems = await outbsemiItemsRepo.find({ where: { outbsemi_id: savedOutbSemi.outbsemi_id } });

            // บันทึกแจ้งเตือน `REQUEST_APPROVAL`
            await this.saveRequestApprovalNotification( RefType.OUTBSEMI, savedOutbSemi.outbsemi_id, reqUsername, useManager);

            // Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.outbsemi'), {
                ...savedOutbSemi,
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

    async withdrScan(
        outbsemi_id: number,  // ไอดี Outbound Semi 
        items: { inbsemi_id: number; outbsemiitm_withdr_count: number }[], // อาเรย์ของ inbsemi_id และ จำนวนที่เบิก
        reqUsername: string, // ชื่อผู้ใช้งานที่ยิงบาร์โค้ด
        manager?: EntityManager // ตัวเลือก EntityManager สำหรับการจัดการทรานแซกชัน (ถ้ามี)
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbSemiService.withdrScan';
    
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
            const outbsemiRepo = manager ? useManager.getRepository(m_outb_semi): this.outbsemiRepository;
            const outbsemiItemsRepo = manager ? useManager.getRepository(m_outb_semi_items): this.outbsemiItemsRepository;
    
            // ✅ ตรวจสอบว่า `outbsemi_appr_status` เป็น `APPROVED`
            const outbsemiRecord = await outbsemiRepo.findOne({ where: { outbsemi_id } });
            if (!outbsemiRecord) {
                return response.setIncomplete(lang.msgNotFound('outbsemi.outbsemi_id'));
            }
    
            // 🛑 ตรวจสอบสถานะการอนุมัติ
            if (outbsemiRecord.outbsemi_appr_status === ApprovalStatus.PENDING) {
                return response.setIncomplete(lang.msgErrorFormat('field.not_approved'));
            }
    
            if (outbsemiRecord.outbsemi_appr_status === ApprovalStatus.REJECTED) {
                return response.setIncomplete(lang.msgErrorFormat('field.rejected_approved'));
            }
    
                // ✅ ตรวจสอบว่า `inbsemi_id` ห้ามซ้ำกัน
            const uniqueInbsemiIds = new Set(items.map(item => item.inbsemi_id));
            if (uniqueInbsemiIds.size !== items.length) {
                return response.setIncomplete(lang.msgErrorFormat('field.duplicate_inbsemi_id'));
            }

            let updatedItems: any[] = []; // เก็บผลลัพธ์ของรายการที่ถูกอัปเดต
    
            // ✅ วนลูปประมวลผลแต่ละ `inbsemi_id`
            for (const item of items) {
                const { inbsemi_id, outbsemiitm_withdr_count } = item;
    
                // ค้นหารายการที่มี outbsemi_id และ inbsemi_id ที่ตรงกับที่ส่งมา
                const existingItem = await outbsemiItemsRepo.findOne({ where: { outbsemi_id, inbsemi_id } });
    
                if (!existingItem) {
                    return response.setIncomplete(lang.msgNotFound(`outbsemi_id ${outbsemi_id} , inbsemi_id ${inbsemi_id}`));
                }
    
                // ✅ ตรวจสอบว่าค่าที่กรอกไม่เกิน `outbsemiitm_quantity`
                if (outbsemiitm_withdr_count > existingItem.outbsemiitm_quantity) {
                    return response.setIncomplete(lang.msgErrorFormat(`field.scan_count_exceeded`)+ `(for inbrm_id ${inbsemi_id})`);
                }
    
                // ✅ อัปเดตจำนวนที่เบิกโดยตรง (Set ค่าที่ส่งมา)
                existingItem.outbsemiitm_withdr_count = outbsemiitm_withdr_count;
    
                // ✅ กำหนดสถานะการเบิก
                existingItem.outbsemiitm_withdr_status = existingItem.outbsemiitm_withdr_count === existingItem.outbsemiitm_quantity 
                ? WithdrawStatus.COMPLETED
                : existingItem.outbsemiitm_withdr_count > 0
                ? WithdrawStatus.PARTIAL
                : WithdrawStatus.PENDING;

    
                // ✅ บันทึกการเปลี่ยนแปลง
                await outbsemiItemsRepo.save(existingItem);
    
                // ✅ เพิ่มรายการที่อัปเดตเข้าไปใน `updatedItems`
                updatedItems.push({
                    outbsemi_id: existingItem.outbsemi_id,
                    inbsemi_id: existingItem.inbsemi_id,
                    outbsemiitm_quantity: existingItem.outbsemiitm_quantity,
                    outbsemiitm_withdr_count: existingItem.outbsemiitm_withdr_count,
                    outbsemiitm_withdr_status: existingItem.outbsemiitm_withdr_status,
                });
            }
    
            // ✅ ถ้าไม่มี manager และใช้ queryRunner ให้ commit ทรานแซกชัน
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ✅ ส่งคืนผลลัพธ์
            response.setComplete(lang.msgSuccessAction('created', 'field.prod_issued'), updatedItems);
            return response;
    
        } catch (error: any) {
            // ❌ ถ้ามีข้อผิดพลาด rollback ทรานแซกชัน
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during withdrScan:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            // ✅ ปิดการเชื่อมต่อ queryRunner ถ้าไม่มี manager
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
        

    async shipmtScan(
        outbsemi_id: number,  
        items: { inbsemi_id: number; outbsemiitm_shipmt_count: number }[], 
        reqUsername: string, 
        manager?: EntityManager 
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbSemiService.shipmtScan';
    
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
            const outbsemiRepo = manager ? useManager.getRepository(m_outb_semi): this.outbsemiRepository;
            const outbsemiItemsRepo = manager ? useManager.getRepository(m_outb_semi_items): this.outbsemiItemsRepository;

            // ✅ ตรวจสอบว่า `outbsemi_appr_status` เป็น `APPROVED`
            const outbsemiRecord = await outbsemiRepo.findOne({ where: { outbsemi_id } });
            if (!outbsemiRecord) {
                return response.setIncomplete(lang.msgNotFound('outbsemi.outbsemi_id'));
            }
    
            // 🛑 ตรวจสอบสถานะการอนุมัติ
            if (outbsemiRecord.outbsemi_appr_status === ApprovalStatus.PENDING) {
                return response.setIncomplete(lang.msgErrorFormat('field.not_approved'));
            }
    
            if (outbsemiRecord.outbsemi_appr_status === ApprovalStatus.REJECTED) {
                return response.setIncomplete(lang.msgErrorFormat('field.rejected_approved'));
            }
    
            // ✅ ตรวจสอบว่า `inbsemi_id` ห้ามซ้ำกัน
            const uniqueInbsemiIds = new Set(items.map(item => item.inbsemi_id));
            if (uniqueInbsemiIds.size !== items.length) {
                return response.setIncomplete(lang.msgErrorFormat('field.duplicate_inbsemi_id'));
            }
    
            let updatedItems: any[] = [];
    
            // ✅ วนลูปประมวลผลแต่ละ `inbsemi_id`
            for (const item of items) {
                const { inbsemi_id, outbsemiitm_shipmt_count } = item;
    
                // ค้นหารายการที่มี outbsemi_id และ inbsemi_id ที่ตรงกับที่ส่งมา
                const existingItem = await outbsemiItemsRepo.findOne({ where: { outbsemi_id, inbsemi_id } });
    
                if (!existingItem) {
                    return response.setIncomplete(lang.msgNotFound(`outbsemi_id ${outbsemi_id} , inbsemi_id ${inbsemi_id}`));
                }
    
                // ✅ ตรวจสอบว่าค่าที่กรอกไม่เกิน `outbsemiitm_quantity`
                if (outbsemiitm_shipmt_count > existingItem.outbsemiitm_quantity) {
                    return response.setIncomplete(lang.msgErrorFormat(`field.scan_count_exceeded`)+ `(for inbrm_id ${inbsemi_id})`);
                }
    
                // ✅ อัปเดตจำนวนการจัดส่งโดยตรง
                existingItem.outbsemiitm_shipmt_count = outbsemiitm_shipmt_count;
    
                // ✅ กำหนดสถานะการจัดส่ง
                existingItem.outbsemiitm_shipmt_status = existingItem.outbsemiitm_shipmt_count === existingItem.outbsemiitm_quantity 
                    ? ShipmentStatus.COMPLETED
                    : existingItem.outbsemiitm_shipmt_count > 0
                    ? ShipmentStatus.PARTIAL
                    : ShipmentStatus.PENDING;
    
                // ✅ บันทึกการเปลี่ยนแปลง
                await outbsemiItemsRepo.save(existingItem);
    
                // ✅ เพิ่มรายการที่อัปเดตเข้าไปใน `updatedItems`
                updatedItems.push({
                    outbsemi_id: existingItem.outbsemi_id,
                    inbsemi_id: existingItem.inbsemi_id,
                    outbsemiitm_quantity: existingItem.outbsemiitm_quantity,
                    outbsemiitm_shipmt_count: existingItem.outbsemiitm_shipmt_count,
                    outbsemiitm_shipmt_status: existingItem.outbsemiitm_shipmt_status,
                });
            }
    
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            response.setComplete(lang.msgSuccessAction('created', 'field.prod_shipment'), updatedItems);
            return response;
    
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during shipmtScan:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async update(outbsemi_id: number, data: Partial<OutbSemiModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'OutbSemiService.update';
    
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
            const outbsemiRepo = manager ? useManager.getRepository(m_outb_semi): this.outbsemiRepository;
            const outbsemiItemsRepo = manager ? useManager.getRepository(m_outb_semi_items): this.outbsemiItemsRepository;
    
            // ตรวจสอบว่า `outbsemi_id` มีอยู่จริงหรือไม่
            let existingOutbSemi = await outbsemiRepo.findOne({ where: { outbsemi_id } });
            if (!existingOutbSemi) {
                return response.setIncomplete(lang.msgNotFound('outbsemi.outbsemi_id'));
            }
    
            // ตรวจสอบค่าที่ต้องกรอก
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) return validationResponse;
    
            const items = data.items ?? []; // ถ้า `data.items` เป็น undefined ให้ใช้ []
            const inbsemi_ids = items.map(item => item.inbsemi_id);
            const quantities = items.map(item => item.outbsemiitm_quantity);
    
            // ตรวจสอบ items ว่ามีค่าหรือไม่
            const itemsValidation = this.validateItemsExistence(items, response);
            if (itemsValidation) return itemsValidation;
    
            // ตรวจสอบห้ามมี inbsemi_id ซ้ำกัน
            const duplicateCheck = this.checkDuplicateInbsemiId(inbsemi_ids, response);
            if (duplicateCheck) return duplicateCheck;
    
            // ตรวจสอบว่า inbsemi_id มีอยู่ใน m_inb_semi หรือไม่
            const inbsemiCheck = await this.checkInbsemiExists(inbsemi_ids, useManager, response);
            if (inbsemiCheck) return inbsemiCheck;
    
            // ตรวจสอบว่า outbsemiitm_quantity ไม่เกิน inbsemi_quantity
            const quantityCheck = await this.checkQuantityLimit(inbsemi_ids, quantities, useManager, response);
            if (quantityCheck) return quantityCheck;
    
            // ตรวจสอบค่า `outbsemi_is_returned`
            if (data.outbsemi_is_returned === true) {
                data.outbsemi_driver_name = null;
                data.outbsemi_vehicle_license = null;
                data.tspyard_id = null;
                data.outbsemi_phone = null;
                data.outbsemi_address = null;
            }
            
            // ลบข้อมูลเก่าทั้งหมด
            await outbsemiItemsRepo.delete({ outbsemi_id });
    
            // อัปเดตข้อมูล `m_outb_semi`
            Object.assign(existingOutbSemi, {
                ...data,
                update_date: new Date(),
                update_by: reqUsername,
            });
    
            await outbsemiRepo.save(existingOutbSemi);

            // บันทึก `m_outb_semi_items` ใหม่
            const outbSemiItems = items.map(item => ({
                outbsemi_id: outbsemi_id,
                inbsemi_id: item.inbsemi_id,
                outbsemiitm_quantity: item.outbsemiitm_quantity,
            }));
            
            await outbsemiItemsRepo.save(outbSemiItems);
            
            // ดึงข้อมูล `existingOutbSemi` ที่อัปเดตล่าสุด (โดยไม่ใช้ relations)
            existingOutbSemi = await outbsemiRepo.findOne({ where: { outbsemi_id } });
            
            if (!existingOutbSemi) {
                return response.setIncomplete(lang.msgNotFound('outbsemi.outbsemi_id'));
            }
            
            // ดึง `items` จาก `m_outb_semi_items`
            const updatedItems = await outbsemiItemsRepo.find({ where: { outbsemi_id } });
            
            // รวมข้อมูล `existingOutbSemi` กับ `items` แล้ว response กลับไป
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.outbsemi'), {
                ...existingOutbSemi,
                items: updatedItems
            });
            
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

    async delete(outbsemi_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'OutbSemiService.delete';
    
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
            const repository = useManager.getRepository(m_outb_semi);
            const itemsRepository = useManager.getRepository(m_outb_semi_items);
            const notificationRepository = useManager.getRepository(m_notifications);
    
            // ตรวจสอบว่ามี `outbsemi_id` หรือไม่
            const existingOutbSemi = await repository.findOne({ where: { outbsemi_id } });
            if (!existingOutbSemi) {
                return response.setIncomplete(lang.msgNotFound('outbsemi.outbsemi_id'));
            }

            // ✅ ตรวจสอบสถานะการอนุมัติ
            if (existingOutbSemi.outbsemi_appr_status === ApprovalStatus.APPROVED) {
                return response.setIncomplete(lang.msg(`ไม่สามารถลบรายการที่อนุมัติแล้วได้`));
            }
    
            // ลบรายการ `m_outb_semi_items` ที่เกี่ยวข้องทั้งหมดก่อน
            await itemsRepository.delete({ outbsemi_id });
    
            // ลบแจ้งเตือน `s_user_notification` ที่เกี่ยวข้อง
            const notiToDelete = await notificationRepository.find({
                where: { reference_type: RefType.OUTBSEMI, reference_id: outbsemi_id },
            });
            
            const notifIds = notiToDelete.map(n => n.notif_id);
            
            if (notifIds.length > 0) {
                const userNotifRepo = manager ? useManager.getRepository(s_user_notification): this.usernotifRepo;
            
                await userNotifRepo.delete({ notif_id: In(notifIds) });
            }

            // ลบแจ้งเตือน `m_notifications` ที่เกี่ยวข้อง
            await notificationRepository.delete({ reference_type: RefType.OUTBSEMI, reference_id: outbsemi_id });

            // ใช้ `deleteEntity()` เพื่อลบ `m_outb_semi`
            const deleteResponse = await deleteEntity(repository, outbsemi_id, reqUsername, 'outbsemi_is_active', 'outbsemi_id');
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
            console.error(`Error during ${operation}:`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async getAll(approvalStatus?: ApprovalStatus, filterReturnedStatus?: boolean, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OutbSemiService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_semi) : this.outbsemiRepository;
    
            // Query ข้อมูลทั้งหมดในรูปแบบ raw data
            const queryBuilder = repository
                .createQueryBuilder('outbsemi')
                .leftJoin('m_outb_semi_items', 'outbsemiitm', 'outbsemi.outbsemi_id = outbsemiitm.outbsemi_id')
                .select([
                    'outbsemi.outbsemi_id AS outbsemi_id',
                    'outbsemi.outbsemi_code AS outbsemi_code',
                    'outbsemi.outbsemi_details AS outbsemi_details',
                    "DATE_FORMAT(outbsemi.create_date, '%d %b %y') AS formatted_date",
                    "DATE_FORMAT(outbsemi.create_date, '%H:%i:%s') AS create_time",
                    'outbsemi.outbsemi_appr_status AS outbsemi_appr_status',
                    'outbsemiitm.outbsemiitm_withdr_status AS outbsemiitm_withdr_status',
                    'outbsemiitm.outbsemiitm_shipmt_status AS outbsemiitm_shipmt_status',
                    'outbsemi.create_by AS create_by',
                    'outbsemi.update_date AS update_date',
                    'outbsemi.update_by AS update_by',
                    'outbsemi.outbsemi_is_active AS outbsemi_is_active',
                    'outbsemi.outbsemi_is_returned AS outbsemi_is_returned',
                    "DATE_FORMAT(outbsemi.withdr_date, '%d %b %y') AS withdr_date",
                    "DATE_FORMAT(outbsemi.withdr_date, '%H:%i:%s') AS withdr_time",
                    "DATE_FORMAT(outbsemi.shipmt_date, '%d %b %y') AS shipmt_date",
                    "DATE_FORMAT(outbsemi.shipmt_date, '%H:%i:%s') AS shipmt_time",
                    "DATE_FORMAT(NOW(), '%d %b %y') AS today_date",
                    "DATEDIFF(CURDATE(), outbsemi.shipmt_date) AS delay_days" // ✅ เพิ่มจำนวนวันล่าช้า
                ])
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .where('outbsemi.outbsemi_is_active = :isActive', { isActive: true })
                .orderBy('outbsemi.outbsemi_code', 'ASC')
    
            // ✅ กรองเฉพาะสถานะที่กำหนด ถ้ามีค่า approvalStatus
            if (approvalStatus) {
                queryBuilder.andWhere('outbsemi.outbsemi_appr_status = :apprStatus', { apprStatus: approvalStatus });
            }

            // ✅ กรองตามสถานะการคืนสินค้า (Returned)
            if (filterReturnedStatus === true) {
                queryBuilder.andWhere('outbsemi.outbsemi_is_returned = :isReturned', { isReturned: true });
            } else if (filterReturnedStatus === false) {
                queryBuilder.andWhere('outbsemi.outbsemi_is_returned = :isReturned', { isReturned: false });
            }

    
            const rawData = await queryBuilder.getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setComplete(lang.msgNotFound('item.outbsemi'), []); // ✅ คืน array ว่าง
            }
    
            // ลำดับความสำคัญของสถานะการเบิก (Withdraw)
            const withdrawPriority: { [key in WithdrawStatus]: number } = {
                [WithdrawStatus.PARTIAL]: 1,
                [WithdrawStatus.PENDING]: 2,
                [WithdrawStatus.COMPLETED]: 3
            };
    
            // ลำดับความสำคัญของสถานะการจัดส่ง (Shipment)
            const shipmentPriority: { [key in ShipmentStatus]: number } = {
                [ShipmentStatus.PARTIAL]: 1,
                [ShipmentStatus.PENDING]: 2,
                [ShipmentStatus.COMPLETED]: 3
            };
    
            // ฟิลเตอร์เอาเฉพาะค่า outbsemi_id ที่ไม่ซ้ำ และจัดเรียงตามสถานะ
            const filteredData = Array.from(
                rawData.reduce((map, record) => {
                    const existing = map.get(record.outbsemi_id);
    
                    //ตรวจสอบสถานะที่ไม่ถูกต้อง
                    const existingWithdrawStatus = existing?.outbsemiitm_withdr_status as WithdrawStatus;
                    const newWithdrawStatus = record.outbsemiitm_withdr_status as WithdrawStatus;
    
                    const existingShipmentStatus = existing?.outbsemiitm_shipmt_status as ShipmentStatus;
                    const newShipmentStatus = record.outbsemiitm_shipmt_status as ShipmentStatus;
    
                    // ตรวจสอบว่าเป็นค่าสถานะที่ถูกต้อง
                    if (!Object.values(WithdrawStatus).includes(newWithdrawStatus)) {
                        console.warn(`พบค่า outbsemiitm_withdr_status ที่ไม่ถูกต้อง: ${newWithdrawStatus}`);
                        return map;
                    }
                    if (!Object.values(ShipmentStatus).includes(newShipmentStatus)) {
                        console.warn(`พบค่า outbsemiitm_shipmt_status ที่ไม่ถูกต้อง: ${newShipmentStatus}`);
                        return map;
                    }
    
                    // ตรวจสอบว่าเป็นค่าสถานะที่ถูกต้อง
                    if (!Object.values(WithdrawStatus).includes(newWithdrawStatus)) {
                        console.warn(`พบค่า outbsemiitm_withdr_status ที่ไม่ถูกต้อง: ${newWithdrawStatus}`);
                        return map;
                    }
                    if (!Object.values(ShipmentStatus).includes(newShipmentStatus)) {
                        console.warn(`พบค่า outbsemiitm_shipmt_status ที่ไม่ถูกต้อง: ${newShipmentStatus}`);
                        return map;
                    }

                    // ใช้ตัวแปรกลาง updatedRecord เพื่อป้องกันการเขียนทับค่า
                    const updatedRecord = existing ? { ...existing } : { ...record };

                    // ✅ อัปเดตสถานะการเบิก (Withdraw)
                    if (existing) {
                        if (existingWithdrawStatus === WithdrawStatus.PARTIAL || newWithdrawStatus === WithdrawStatus.PARTIAL) {
                            updatedRecord.outbsemiitm_withdr_status = WithdrawStatus.PARTIAL;
                        } else if (
                            (existingWithdrawStatus === WithdrawStatus.PENDING && newWithdrawStatus === WithdrawStatus.COMPLETED) ||
                            (existingWithdrawStatus === WithdrawStatus.COMPLETED && newWithdrawStatus === WithdrawStatus.PENDING)
                        ) {
                            updatedRecord.outbsemiitm_withdr_status = WithdrawStatus.PARTIAL;
                        } else if (
                            withdrawPriority[newWithdrawStatus] !== undefined &&
                            withdrawPriority[existingWithdrawStatus] !== undefined &&
                            withdrawPriority[newWithdrawStatus] < withdrawPriority[existingWithdrawStatus]
                        ) {
                            updatedRecord.outbsemiitm_withdr_status = newWithdrawStatus;
                        }
                    }

                    // ✅ อัปเดตสถานะการจัดส่ง (Shipment)
                    if (existing) {
                        if (existingShipmentStatus === ShipmentStatus.PARTIAL || newShipmentStatus === ShipmentStatus.PARTIAL) {
                            updatedRecord.outbsemiitm_shipmt_status = ShipmentStatus.PARTIAL;
                        } else if (
                            (existingShipmentStatus === ShipmentStatus.PENDING && newShipmentStatus === ShipmentStatus.COMPLETED) ||
                            (existingShipmentStatus === ShipmentStatus.COMPLETED && newShipmentStatus === ShipmentStatus.PENDING)
                        ) {
                            updatedRecord.outbsemiitm_shipmt_status = ShipmentStatus.PARTIAL;
                        } else if (
                            shipmentPriority[newShipmentStatus] !== undefined &&
                            shipmentPriority[existingShipmentStatus] !== undefined &&
                            shipmentPriority[newShipmentStatus] < shipmentPriority[existingShipmentStatus]
                        ) {
                            updatedRecord.outbsemiitm_shipmt_status = newShipmentStatus;
                        }
                    }

                    // ✅ ใช้ updatedRecord เพื่อให้แน่ใจว่าค่าที่อัปเดตแล้วไม่ถูกเขียนทับ
                    map.set(record.outbsemi_id, updatedRecord);
                    return map;
                }, new Map<number, any>()).values()
            );
    
            return response.setComplete(lang.msgFound('item.outbsemi'), filteredData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getById(outbsemi_id: number, manager?: EntityManager): Promise<ApiResponse<OutbSemiGroupedModel>> {
        const response = new ApiResponse<OutbSemiGroupedModel>();
        const operation = 'OutbSemiService.getById';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_semi) : this.outbsemiRepository;
    
            // Query ข้อมูลทั้งหมดของ `outbsemi` พร้อม `items`
            const rawData = await repository
                .createQueryBuilder('outbsemi')
                .leftJoin('m_outb_semi_items', 'outbsemiitm', 'outbsemi.outbsemi_id = outbsemiitm.outbsemi_id')
                .leftJoin('m_inb_semi', 'inbsemi', 'outbsemiitm.inbsemi_id = inbsemi.inbsemi_id')
                .leftJoin('m_semi_ifm', 'semiifm', 'semiifm.semiifm_id = inbsemi.semiifm_id')
                .leftJoin('m_transport_yard', 'tspyard', 'tspyard.tspyard_id = outbsemi.tspyard_id')
                .select([
                    'outbsemi.outbsemi_id AS outbsemi_id',
                    'outbsemi.outbsemi_code AS outbsemi_code',
                    'outbsemi.outbsemi_details AS outbsemi_details',
                    'outbsemi.outbsemi_so AS outbsemi_so',
                    'outbsemi.outbsemi_remark AS outbsemi_remark',
                    'outbsemi.outbsemi_driver_name AS outbsemi_driver_name',
                    'outbsemi.outbsemi_vehicle_license AS outbsemi_vehicle_license',
                    'outbsemi.outbsemi_phone AS outbsemi_phone',
                    'outbsemi.outbsemi_address AS outbsemi_address',
                    'outbsemi.outbsemi_is_returned AS outbsemi_is_returned',
                    'tspyard.tspyard_id AS tspyard_id',
                    "CONCAT(tspyard.tspyard_code, ' ', tspyard.tspyard_name) AS tspyard_name",
                    'outbsemi.outbsemi_is_active AS outbsemi_is_active',
                    'outbsemi.create_date AS create_date',
                    'outbsemi.create_by AS create_by',
                    'outbsemi.update_date AS update_date',
                    'outbsemi.update_by AS update_by',
                    'outbsemiitm.outbsemiitm_id AS outbsemiitm_id',
                    'outbsemiitm.inbsemi_id AS inbsemi_id',
                    'outbsemiitm.outbsemiitm_quantity AS outbsemiitm_quantity',
                    'inbsemi.inbsemi_quantity AS inbsemi_quantity',
                    'inbsemi.inbsemi_code AS inbsemi_code',
                    'semiifm.semiifm_name AS semiifm_name',
                    '(inbsemi.inbsemi_quantity - outbsemiitm.outbsemiitm_quantity) AS remaining_quantity' // จำนวนคงเหลือ
                ])
                .where('outbsemi.outbsemi_id = :outbsemi_id', { outbsemi_id: Number(outbsemi_id) })
                .andWhere('outbsemi.outbsemi_is_active = :isActive', { isActive: true})
                .getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('outbsemi.outbsemi_id'));
            }
    
            // ใช้ Model จัดการรูปแบบข้อมูล
            const groupedData = OutbSemiGroupedModel.fromRawData(rawData);
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('outbsemi.outbsemi_id'), groupedData);
        } catch (error: any) {
            console.error(`Error in ${operation} with outbsemi_id: ${outbsemi_id}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getReqByID(outbsemi_id: number, manager?: EntityManager): Promise<ApiResponse<OutbSemiReqModel>> {
        const response = new ApiResponse<OutbSemiReqModel>();
        const operation = 'OutbSemiService.getReqByID';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_semi) : this.outbsemiRepository;
    
            // Query ข้อมูลทั้งหมดที่มี outbsemi_id เดียวกัน
            const rawData = await repository
                .createQueryBuilder('outbsemi')
                .leftJoin('m_outb_semi_items', 'outbsemiitm', 'outbsemiitm.outbsemi_id = outbsemi.outbsemi_id')
                .leftJoin('m_inb_semi', 'inbsemi', 'inbsemi.inbsemi_id = outbsemiitm.inbsemi_id')
                .leftJoin('m_semi_ifm', 'semiifm', 'semiifm.semiifm_id = inbsemi.semiifm_id')
                .leftJoin('m_warehouse', 'warehouse', 'inbsemi.wh_id = warehouse.wh_id')
                .leftJoin('m_zone', 'zone', 'inbsemi.zn_id = zone.zn_id')
                .leftJoin('m_transport_yard', 'tspyard', 'outbsemi.tspyard_id = tspyard.tspyard_id')
                .leftJoin('m_unit', 'unit', 'unit.unit_id = semiifm.semiifm_product_unitId')
                .select([
                    'outbsemi.outbsemi_id AS outbsemi_id',
                    'outbsemi.outbsemi_code AS outbsemi_code',
                    "NOW() AS today_date_time", // ✅ ใช้ค่า Timestamp ปกติ
                    "DATE_FORMAT(NOW(), '%e/%c/%y %H:%i:%s') AS today_date", // ✅ ใช้รูปแบบ YYYY-MM-DD
                    "DATE_FORMAT(outbsemi.withdr_date, '%d %b %y') AS withdr_date",
                    "DATE_FORMAT(outbsemi.shipmt_date, '%d %b %y') AS shipmt_date",
                    'outbsemi.outbsemi_details AS outbsemi_details',
                    'outbsemi.outbsemi_driver_name AS outbsemi_driver_name',
                    'outbsemi.outbsemi_vehicle_license AS outbsemi_vehicle_license',
                    'outbsemi.outbsemi_phone AS outbsemi_phone',
                    'outbsemi.outbsemi_address AS outbsemi_address',
                    'outbsemi.outbsemi_so AS outbsemi_so',
                    'tspyard.tspyard_id AS tspyard_id',
                    'tspyard.tspyard_name AS tspyard_name',
                    'outbsemiitm.outbsemiitm_id AS outbsemiitm_id',
                    'inbsemi.inbsemi_id AS inbsemi_id',
                    'inbsemi.inbsemi_code AS inbsemi_code',
                    'inbsemi.inbsemi_color AS inbsemi_color',
                    'semiifm.semiifm_name AS semiifm_name',
                    'semiifm.semiifm_width AS semiifm_width',
                    'semiifm.semiifm_length AS semiifm_length',
                    'semiifm.semiifm_thickness AS semiifm_thickness',
                    'warehouse.wh_name AS wh_name',
                    'zone.zn_name AS zn_name',
                    'unit.unit_abbr_th AS unit_abbr_th',
                    'outbsemiitm.outbsemiitm_quantity AS outbsemiitm_quantity',
                    'outbsemiitm.outbsemiitm_withdr_count AS outbsemiitm_withdr_count',
                    'outbsemiitm.outbsemiitm_withdr_status AS outbsemiitm_withdr_status',
                    'outbsemiitm.outbsemiitm_shipmt_count AS outbsemiitm_shipmt_count',
                    'outbsemiitm.outbsemiitm_shipmt_status AS outbsemiitm_shipmt_status',
                ])
                .where('outbsemi.outbsemi_id = :outbsemi_id', { outbsemi_id })
                .andWhere('outbsemi.outbsemi_is_active = :isActive', { isActive: true})
                .getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData.length) {
                return response.setIncomplete(lang.msgNotFound('outbsemi.outbsemi_id'));
            }

            // ใช้ Model จัดการรูปแบบข้อมูล
            const groupedData = OutbSemiReqModel.fromRawData(rawData);
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('outbsemi.outbsemi_id'), groupedData);
        } catch (error: any) {
            console.error(`Error in ${operation} with outbsemi_id: ${outbsemi_id}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async updateDates(outbsemi_id: number, data: { withdr_date?: string; shipmt_date?: string}, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbSemiService.updateDates';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_semi) : this.outbsemiRepository;
    
            // ค้นหา Record ตาม outbsemi_id
            const outbsemi = await repository.findOne({ where: { outbsemi_id } });
    
            if (!outbsemi) {
                return response.setIncomplete(lang.msgNotFound('outbsemi.outbsemi_id'));
            }
    
            // ตรวจสอบว่ามีค่าที่ต้องอัปเดตหรือไม่
            if (!data.withdr_date && !data.shipmt_date) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // อัปเดตค่าตามที่ได้รับ
            if (data.withdr_date) {
                outbsemi.withdr_date = new Date(data.withdr_date);
            }
            if (data.shipmt_date) {
                outbsemi.shipmt_date = new Date(data.shipmt_date);
            }
    
            // บันทึกการอัปเดต
            await repository.save(outbsemi);
    
            // ✅ ส่ง Response เฉพาะค่าที่ต้องการ
            const responseData = {
                outbsemi_id: outbsemi.outbsemi_id,
                withdr_date: outbsemi.withdr_date,
                shipmt_date: outbsemi.shipmt_date
            };
    
            return response.setComplete(lang.msgSuccessAction('updated', 'item.outbsemi'), responseData);
    
        } catch (error: any) {
            console.error(`Error in ${operation} with outbsemi_id: ${outbsemi_id}`, error);
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        }
    }
}
