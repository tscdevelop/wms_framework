import { Repository, EntityManager, Not, In } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils
import CodeGenerator from '../utils/CodeGenerator';

import { m_outb_finished_goods } from '../entities/m_outb_finished_goods.entity';
import { OutbFGModel, OutbFGNoBomModel } from '../models/outb_finished_goods.model';
import { m_bom } from '../entities/m_bom.entity';
import { m_inb_finished_goods } from '../entities/m_inb_finished_goods.entity';
import { m_outb_finished_goods_items } from '../entities/m_outb_finished_goods_items.entity';
import { m_transport_yard } from '../entities/m_transport_yard.entity';
import { OutbFinishedGoodsReqModel } from '../models/outb_finished_goods_getreqbyid.model';
import { m_bom_items } from '../entities/m_bom_items.entity';
import { m_supplier } from '../entities/m_supplier.entity';
import { m_finished_goods_ifm } from '../entities/m_finished_goods_ifm.entity';
import { deleteEntity } from '../utils/DatabaseUtils';
import { m_notifications } from '../entities/m_notifications.entity';
import { ApprovalStatus, NotifStatus, NotifType, RefType, ShipmentStatus, WithdrawStatus } from '../common/global.enum';
import { s_user_notification } from '../entities/s_user_notification.entity';
import { s_user } from '../entities/s_user.entity';
import { getUsersToNotify } from '../utils/NotificationsUtils';

export class OutbFinishedGoodsService {
    private outbfgRepository: Repository<m_outb_finished_goods>;
    private bomRepository: Repository<m_bom>;
    private bomItemsRepository: Repository<m_bom_items>;
    private inbfgRepository: Repository<m_inb_finished_goods>;
    private outbfgItemsRepository: Repository<m_outb_finished_goods_items>;
    private tspyardRepository: Repository<m_transport_yard>;
    private supplierRepository: Repository<m_supplier>;
    private fgifmRepository: Repository<m_finished_goods_ifm>;
    private notificationRepository: Repository<m_notifications>;
    private usernotifRepo: Repository<s_user_notification>;
    private userRepository: Repository<s_user>;

    constructor(){
        this.outbfgRepository = AppDataSource.getRepository(m_outb_finished_goods);
        this.bomRepository = AppDataSource.getRepository(m_bom);
        this.bomItemsRepository = AppDataSource.getRepository(m_bom_items);
        this.inbfgRepository = AppDataSource.getRepository(m_inb_finished_goods);
        this.outbfgItemsRepository = AppDataSource.getRepository(m_outb_finished_goods_items);
        this.tspyardRepository = AppDataSource.getRepository(m_transport_yard);
        this.supplierRepository = AppDataSource.getRepository(m_supplier);
        this.fgifmRepository = AppDataSource.getRepository(m_finished_goods_ifm);
        this.notificationRepository = AppDataSource.getRepository(m_notifications);
        this.usernotifRepo = AppDataSource.getRepository(s_user_notification);
        this.userRepository = AppDataSource.getRepository(s_user);
    }

    private async generateCode(): Promise<string> {
        const codeGenerator = new CodeGenerator(AppDataSource);
        const newCode = await codeGenerator.generateCode('m_outb_finished_goods', 'outbfg_code', 'OFG', '', '[PREFIX][000x]');
        return newCode;
    }

    /**
     * ฟังก์ชันตรวจสอบค่าที่ต้องกรอกแบบมี bom
     */
    private validateRequiredFields(
        data: Partial<Record<string, any>>, 
        isShipment: boolean
    ): ApiResponse<any> | null {
        const response = new ApiResponse<any>();
    
        // ตรวจสอบว่า `data` เป็น `object` จริงๆ
        if (!data || typeof data !== "object") {
            return response.setIncomplete(lang.msgNotFound("item.data"));
        }
    
        // ฟิลด์ที่จำเป็นเสมอ
        const requiredFields: { key: string; message: string }[] = [
            { key: "outbfg_so", message: "เลขที่ใบ SO." },
        ];
    
        if (isShipment) {
            // ถ้าเป็น `shipment` ต้องกรอกข้อมูลเหล่านี้
            requiredFields.push(
                { key: "tspyard_id", message: "tspyard.tspyard_id" },
                { key: "outbfg_driver_name", message: "outbfg.outbfg_driver_name" },
                { key: "outbfg_vehicle_license", message: "outbfg.outbfg_vehicle_license" },
                { key: "outbfg_phone", message: "field.phone" },
                { key: "outbfg_address", message: "field.address" }
            );
        } else {
            // ถ้าไม่ใช่ `shipment` บังคับให้กรอกเฉพาะ `driver_name` และ `vehicle_license`
            requiredFields.push(
                { key: "outbfg_driver_name", message: "outbfg.outbfg_driver_name" },
                { key: "outbfg_vehicle_license", message: "outbfg.outbfg_vehicle_license" }
            );
    
            // ล้างค่าที่ไม่จำเป็นเป็น `null`
            const mustBeNullFields = ["tspyard_id", "outbfg_phone", "outbfg_address"];
            for (const field of mustBeNullFields) {
                if (field in data && !validate.isNullOrEmpty(data[field])) {
                    data[field] = null; // 🔹 ล้างค่าเป็น `null`
                }
            }
        }
    
        // ตรวจสอบค่าที่ต้องกรอก
        for (const { key, message } of requiredFields) {
            if (!(key in data) || validate.isNullOrEmpty((data as any)[key])) {
                return response.setIncomplete(lang.msgRequired(message));
            }
        }
    
        return null;
    }
    

    /**
     * ฟังก์ชันตรวจสอบ so_id ใน m_bom
     */
    private async checkSoExists(so_id: number, manager: EntityManager, response: ApiResponse<any>): Promise<ApiResponse<any> | null> {
        const bomExists = await manager.getRepository(m_bom).findOne({ where: { so_id } });
    
        if (!bomExists) {
            return response.setIncomplete(lang.msg(`so_id: ${so_id} not found in BOM`));
        }
        return null;
    }

    /**
     * ฟังก์ชันตรวจสอบ tspyard_id ใน m_transport_yard
     */
    private async checkTransportYardExists(tspyard_id: number, manager: EntityManager, response: ApiResponse<any>): Promise<ApiResponse<any> | null> {
        const yardExists = await manager.getRepository(m_transport_yard).findOne({ where: { tspyard_id } });
    
        if (!yardExists) {
            return response.setIncomplete(lang.msg(`tspyard_id: ${tspyard_id} not found in Transport Yard`));
        }
        return null;
    }
    
    /**
     * ฟังก์ชันตรวจสอบ so_id และ bom_id ว่าต้องเป็นคู่ที่สัมพันธ์กันใน m_bom_items
     */
    private async checkSoBomRelation(
        so_id: number, 
        bom_ids: number[], 
        manager: EntityManager, 
        response: ApiResponse<any>
    ): Promise<ApiResponse<any> | null> {
        // ค้นหา bom_id ที่เกี่ยวข้องกับ so_id ใน m_bom_items
        const validBomItems = await manager.getRepository(m_bom_items).find({
            where: { so_id, bom_id: In(bom_ids) }
        });
    
        // แปลงรายการที่ดึงมาให้เป็น Set เพื่อเปรียบเทียบ
        const validBomIds = new Set(validBomItems.map(item => item.bom_id));
    
        // ตรวจสอบว่าทุก `bom_id` ที่ส่งมาอยู่ใน `validBomIds` หรือไม่
        const invalidBomIds = bom_ids.filter(bom_id => !validBomIds.has(bom_id));
    
        if (invalidBomIds.length > 0) {
            return response.setIncomplete(
                lang.msg(`The following bom_id(s) are not related to so_id: ${so_id}: ${invalidBomIds.join(', ')}`)
            );
        }
        
        return null;
    }
    
    /**
     * ฟังก์ชันตรวจสอบรายการสินค้า
     */
    private validateItemsExistence(items: OutbFGModel["items"] | undefined, response: ApiResponse<any>): ApiResponse<any> | null {
        items = items ?? [];  // ป้องกัน `undefined`
        if (items.length === 0) {
            return response.setIncomplete(lang.msgRequired('จำนวนจัดส่ง'));
        }
        return null;
    }

    /**
     * ดึง fgifm_id จากทั้งสองตารางแล้วเปรียบเทียบกัน
     */
    private async checkFgifmIdMatch(
        bom_ids: number[],
        inbfg_ids: number[],
        manager: EntityManager,
        response: ApiResponse<any>
    ): Promise<ApiResponse<any> | null> {
        // ดึง fgifm_id จาก m_bom_items
        const bomItems = await manager
            .createQueryBuilder(m_bom_items, "bi")
            .select(["bi.bom_id", "bi.fgifm_id"])
            .where("bi.bom_id IN (:...bom_ids)", { bom_ids })
            .getMany();
    
        // ดึง fgifm_id จาก m_inb_finished_goods
        const inbFinishedGoods = await manager
            .createQueryBuilder(m_inb_finished_goods, "ifg")
            .select(["ifg.inbfg_id", "ifg.fgifm_id"])
            .where("ifg.inbfg_id IN (:...inbfg_ids)", { inbfg_ids })
            .getMany();
    
        // สร้าง Map สำหรับตรวจสอบค่า fgifm_id
        const bomFgifmMap = new Map(bomItems.map(item => [item.bom_id, item.fgifm_id]));
        const inbFgifmMap = new Map(inbFinishedGoods.map(item => [item.inbfg_id, item.fgifm_id]));
    
        // ตรวจสอบว่าค่าที่ได้ตรงกันหรือไม่
        for (let i = 0; i < bom_ids.length; i++) {
            const bomId = bom_ids[i];
            const inbfgId = inbfg_ids[i];
    
            const bomFgifmId = bomFgifmMap.get(bomId);
            const inbFgifmId = inbFgifmMap.get(inbfgId);
    
            if (!bomFgifmId || !inbFgifmId || bomFgifmId !== inbFgifmId) {
                return response.setIncomplete(
                    lang.msg(
                        "bom and inbound fg does not match",
                        { bom_id: bomId, inbfg_id: inbfgId }
                    )
                );
            }
        }
    
        return null;
    }
    

    /** 
     * ตรวจสอบว่ามี inbfg_id อยู่ใน m_inb_finished_goods หรือไม่ 
     */
    private async checkInbsemiExists(inbfg_ids: number[], manager: EntityManager, response: ApiResponse<any>): Promise<ApiResponse<any> | null> {
        if (inbfg_ids.length === 0) return null;
    
        const foundInbsemi = await manager.getRepository(m_inb_finished_goods)
            .findBy({ inbfg_id: In(inbfg_ids) });
    
        const foundIds = new Set(foundInbsemi.map(inb => inb.inbfg_id));
        const missingIds = inbfg_ids.filter(id => !foundIds.has(id));
    
        if (missingIds.length > 0) {
            return response.setIncomplete(lang.msgNotFound(`inbfg.inbfg_id`));
        }
        return null;
    }

    /**
     * ตรวจสอบว่า bom_id เดียวกัน มี inbfg_id ซ้ำกันหรือไม่ (ใช้ใน have bom)
     */
    private checkDuplicateInbfgPerBom(items: OutbFGModel["items"], response: ApiResponse<any>): ApiResponse<any> | null {
        const bomInbfgMap = new Map<number, Set<number>>();

        for (const item of items) {
            const { bom_id, inbfg_id } = item;

            if (!bomInbfgMap.has(bom_id)) {
                bomInbfgMap.set(bom_id, new Set());
            }

            const inbfgSet = bomInbfgMap.get(bom_id)!;
            if (inbfgSet.has(inbfg_id)) {
                return response.setIncomplete(lang.msg(`Duplicate inbfg_id ${inbfg_id} found under bom_id ${bom_id}`));
            }

            inbfgSet.add(inbfg_id);
        }

        return null;
    }

    /**
     * ตรวจสอบว่า inbfg_ids ห้ามซ้ำกัน (ใช้ใน no bom)
     */
    private checkDuplicateInbfgIds(inbfg_ids: number[], response: ApiResponse<any>): ApiResponse<any> | null {
        const inbfgIdSet = new Set<number>();
        for (const id of inbfg_ids) {
            if (inbfgIdSet.has(id)) {
                return response.setIncomplete(lang.msg(`validation.duplicate`));
            }
            inbfgIdSet.add(id);
        }
        return null;
    }

    /** 
     * เช็ค outbfgitm_quantity ไม่เกิน inbfg_quantity
     */
    private async checkQuantityLimit(
        inbfg_ids: number[],
        quantities: number[],
        manager: EntityManager,
        response: ApiResponse<any>
    ): Promise<ApiResponse<any> | null> {
        if (inbfg_ids.length === 0) return null;
    
        // ✅ รวมจำนวนที่เบิกของ inbfg_id เดียวกัน
        const totalQuantityMap = new Map<number, number>();
    
        for (let i = 0; i < inbfg_ids.length; i++) {
            const inbfg_id = inbfg_ids[i];
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
    
            // รวมยอดเบิกของ inbfg_id เดียวกัน
            if (!totalQuantityMap.has(inbfg_id)) {
                totalQuantityMap.set(inbfg_id, 0);
            }
            totalQuantityMap.set(inbfg_id, totalQuantityMap.get(inbfg_id)! + qty);
        }
    
        // ✅ ดึงข้อมูล inbfg_quantity จากฐานข้อมูล
        const inbfgData = await manager.getRepository(m_inb_finished_goods)
            .findBy({ inbfg_id: In(Array.from(totalQuantityMap.keys())) });
    
        if (inbfgData.length === 0) {
            return response.setIncomplete(lang.msgNotFound('item.data'));
        }
    
        // ✅ ตรวจสอบว่าสินค้าพอหรือไม่ (เช็คยอดรวม)
        for (const [inbfg_id, totalQty] of totalQuantityMap.entries()) {
            const inbfg = inbfgData.find(inb => inb.inbfg_id === inbfg_id);
            if (!inbfg) {
                return response.setIncomplete(lang.msgNotFound(`inbfg_id: ${inbfg_id}`));
            }
    
            if (totalQty > inbfg.inbfg_quantity) {
                return response.setIncomplete(
                    //lang.msg(`field.quantity_not_enough`)
                    lang.msg(`field.quantity_not_enough`) + ` มีอยู่ ${inbfg.inbfg_quantity} แต่ต้องการ ${totalQty}`
                );
            }
        }
    
        return null;
    }
    
    /**
     * ตรวจสอบค่าที่ต้องกรอกตามเงื่อนไขของการจัดส่ง
     * - true (SELF_PICKUP) -> ต้องมี outbfg_driver_name และ outbfg_vehicle_license
     * - false (DELIVERY) -> ต้องมี tspyard_id, outbfg_driver_name, outbfg_vehicle_license, outbfg_phone, และ outbfg_address
     */
    private async validateShipmentFields(
        data: Partial<any>,
        tspyardRepository: Repository<m_transport_yard>,
        response: ApiResponse<any>
    ): Promise<ApiResponse<any> | null> {
        // เรียก `validateRequiredFields` แทนการตรวจสอบซ้ำ
        const fieldValidation = this.validateRequiredFields(data, data.outbfg_is_shipment === true);
        if (fieldValidation) return fieldValidation;
    
        // ตรวจสอบ tspyard_id ว่ามีอยู่ในระบบหรือไม่
        if (data.outbfg_is_shipment === true && data.tspyard_id) {
            const existingTspYard = await tspyardRepository.findOne({ where: { tspyard_id: data.tspyard_id } });
            if (!existingTspYard) {
                return response.setIncomplete(lang.msgNotFound('tspyard.tspyard_id'));
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
            reference_id,   // ไอดีที่ถูกบันทึก
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
        data: Partial<OutbFGModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<OutbFGModel>();
        const operation = 'OutbFinishedGoodsService.create';
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
            const repository = manager ? useManager.getRepository(m_outb_finished_goods) : this.outbfgRepository;
            const outbfgItemsRepo = manager ? useManager.getRepository(m_outb_finished_goods_items) : this.outbfgItemsRepository;
            const tspyardRepository = manager ? useManager.getRepository(m_transport_yard) : this.tspyardRepository;

            // ตรวจสอบค่าที่ต้องกรอก
            const isShipment = typeof data.outbfg_is_shipment === "boolean" ? data.outbfg_is_shipment : true;
            const validationResponse = this.validateRequiredFields(data, isShipment);
            if (validationResponse) return validationResponse;
            
            // ตรวจสอบว่า so_id, tspyard_id มีอยู่จริงใน DB
            const soCheck = await this.checkSoExists(data.so_id!, useManager, response);
            if (soCheck) return soCheck;

            const yardCheck = await this.checkTransportYardExists(data.tspyard_id!, useManager, response);
            if (yardCheck) return yardCheck;

            // ตรวจสอบค่าที่ต้องกรอกสำหรับการจัดส่ง
            const shipmentValidation = await this.validateShipmentFields(data, tspyardRepository, response);
            if (shipmentValidation) return shipmentValidation;

            // ตรวจสอบ items มีอยู่จริงหรือไม่
            const items = data.items ?? [];
            const itemsValidation = this.validateItemsExistence(items, response);
            if (itemsValidation) return itemsValidation;
    
            // ดึงรายการ `bom_id` จาก items
            const bom_ids = items.map(item => item.bom_id);

            // ✅ ตรวจสอบว่า bom_id เดียวกัน มี inbfg_id ซ้ำกันหรือไม่
            const duplicateInbfgPerBomCheck = this.checkDuplicateInbfgPerBom(items, response);
            if (duplicateInbfgPerBomCheck) return duplicateInbfgPerBomCheck;

            // ตรวจสอบว่า so_id และ bom_id เป็นคู่กันใน m_bom_items
            const soBomCheck = await this.checkSoBomRelation(data.so_id!, bom_ids, useManager, response);
            if (soBomCheck) return soBomCheck;

            // ดึงค่า inbfg_id จาก ทุก object ในอาร์เรย์ items
            const inbfg_ids = items.map(item => item.inbfg_id);
    
            // ตรวจสอบ inbfg_id ว่ามีอยู่ใน DB หรือไม่
            const inbfgCheck = await this.checkInbsemiExists(inbfg_ids, useManager, response);
            if (inbfgCheck) return inbfgCheck;
    
            // ตรวจสอบว่า outbfgitm_quantity ไม่เกิน inbfg_quantity
            const quantities = items.map(item => item.outbfgitm_quantity);
            const quantityCheck = await this.checkQuantityLimit(inbfg_ids, quantities, useManager, response);
            if (quantityCheck) return quantityCheck;
    
            // ตรวจสอบว่าค่า fgifm_id จาก bom_id และ inbfg_id ตรงกันหรือไม่
            const fgifmCheck = await this.checkFgifmIdMatch(bom_ids, inbfg_ids, useManager, response);
            if (fgifmCheck) return fgifmCheck;

            // สร้างข้อมูล OutbFinishedGoods
            const newOutbFG = repository.create({
                ...data,
                outbfg_code: await this.generateCode(),
                outbfg_is_bom_used: true,
                outbfg_is_active: true,
                create_date: new Date(),
                create_by: reqUsername,
            });
    
            const savedOutbFG = await repository.save(newOutbFG);
    
            // บันทึก `items` และ `inbfg_id` แยกเป็น record
            const outbFGItems = items.map(item => ({
                outbfg_id: savedOutbFG.outbfg_id,
                bom_id: item.bom_id,
                inbfg_id: item.inbfg_id,
                outbfgitm_quantity: item.outbfgitm_quantity,
            }));
    
            // Debug log
            //console.log("outbFGItems:", JSON.stringify(outbFGItems, null, 2));
    
            // บันทึก `items` และ `inbfg_id` แยกเป็น record
            await outbfgItemsRepo.save(outbFGItems);
    
            // บันทึกแจ้งเตือน `REQUEST_APPROVAL`
            await this.saveRequestApprovalNotification( RefType.OUTBFG, savedOutbFG.outbfg_id, reqUsername, useManager);

            // Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            // ดึง `items` ที่เพิ่งบันทึกจากฐานข้อมูล
            const savedItems = await outbfgItemsRepo.find({ where: { outbfg_id: savedOutbFG.outbfg_id } });

            // ใช้ reduce() จัดกลุ่ม `items`
            const formattedItems: OutbFGModel["items"] = savedItems.map(item => ({
                bom_id: item.bom_id,
                inbfg_id: item.inbfg_id,
                outbfgitm_quantity: item.outbfgitm_quantity,
            }));

            // คืนค่า Response ให้เหมือน `update`
            return response.setComplete(lang.msgSuccessAction('created', 'item.outbfg'), {
                ...savedOutbFG,
                items: formattedItems, // คืนค่า `items` ที่ถูกจัดกลุ่มใหม่
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

    async createNoBom(
        data: Partial<OutbFGNoBomModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<OutbFGNoBomModel>();
        const operation = 'OutbFinishedGoodsService.createNoBom';
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
            const repository = manager ? useManager.getRepository(m_outb_finished_goods) : this.outbfgRepository;
            const outbfgItemsRepo = manager ? useManager.getRepository(m_outb_finished_goods_items) : this.outbfgItemsRepository;
            const tspyardRepository = manager ? useManager.getRepository(m_transport_yard) : this.tspyardRepository;

            // ตรวจสอบค่าที่ต้องกรอก
            const isShipment = typeof data.outbfg_is_shipment === "boolean" ? data.outbfg_is_shipment : true;
            const validationResponse = this.validateRequiredFields(data, isShipment);
            if (validationResponse) return validationResponse;

            const items = data.items ?? []; // ถ้า `data.items` เป็น undefined ให้ใช้ []

            const inbfg_ids = items.map(item => item.inbfg_id!).filter(id => id !== undefined);
            const quantities = items.map(item => item.outbfgitm_quantity!).filter(qty => qty !== undefined);

            // ✅ ตรวจสอบว่ามีค่า inbfg_id ซ้ำหรือไม่
            const duplicateCheck = this.checkDuplicateInbfgIds(inbfg_ids, response);
            if (duplicateCheck) return duplicateCheck;

            const yardCheck = await this.checkTransportYardExists(data.tspyard_id!, useManager, response);
            if (yardCheck) return yardCheck;

            // ตรวจสอบค่าที่ต้องกรอกสำหรับการจัดส่ง
            const shipmentValidation = await this.validateShipmentFields(data, tspyardRepository, response);
            if (shipmentValidation) return shipmentValidation;

                // ตรวจสอบ inbfg_id ว่ามีอยู่ใน DB หรือไม่
            const inbfgCheck = await this.checkInbsemiExists(inbfg_ids, useManager, response);
            if (inbfgCheck) return inbfgCheck;
    
            // ตรวจสอบว่า outbfgitm_quantity ไม่เกิน inbfg_quantity
            const quantityCheck = await this.checkQuantityLimit(inbfg_ids, quantities, useManager, response);
            if (quantityCheck) return quantityCheck;
    
            // สร้างข้อมูล OutbFinishedGoods
            const newOutbFG = repository.create({
                ...data,
                outbfg_code: await this.generateCode(),
                outbfg_is_bom_used: false,
                outbfg_is_active: true,
                create_date: new Date(),
                create_by: reqUsername,
            });
    
            const savedOutbFG = await repository.save(newOutbFG);
    
            // บันทึก `items` และ `inbfg_id` แยกเป็น record
            const outbFGItems = items.map(item => ({
                    outbfg_id: savedOutbFG.outbfg_id,
                    inbfg_id: item.inbfg_id,
                    outbfgitm_quantity: item.outbfgitm_quantity,
                }));
    
            // Debug log
            //console.log("outbFGItems:", JSON.stringify(outbFGItems, null, 2));
    
            if (outbFGItems.length > 0) {
                await outbfgItemsRepo.save(outbFGItems);
            }
            
    
            // ดึงข้อมูล items ที่เพิ่งบันทึก
            const savedItems = await outbfgItemsRepo.find({ where: { outbfg_id: savedOutbFG.outbfg_id } });

            // บันทึกแจ้งเตือน `REQUEST_APPROVAL`
            await this.saveRequestApprovalNotification( RefType.OUTBFG, savedOutbFG.outbfg_id, reqUsername, useManager);

            // Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
            
            return response.setComplete(lang.msgSuccessAction('created', 'item.outbfg'), {
                ...savedOutbFG,
                items: savedItems,
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
        outbfg_id: number,  // ไอดี Outbound Finished Goods 
        items: { outbfgitm_id: number; inbfg_id: number; outbfgitm_withdr_count: number }[],
        reqUsername: string, // ชื่อผู้ใช้งานที่ยิงบาร์โค้ด
        manager?: EntityManager // ตัวเลือก EntityManager สำหรับการจัดการทรานแซกชัน (ถ้ามี)
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbFinishedGoodsService.withdrScan';
    
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
            const outbfgItemsRepository = useManager.getRepository(m_outb_finished_goods_items);
            const outbfgRepository = useManager.getRepository(m_outb_finished_goods);
    
            // ✅ ตรวจสอบว่า `outbfg_appr_status` เป็น `APPROVED`
            const outbfgRecord = await outbfgRepository.findOne({ where: { outbfg_id } });
            if (!outbfgRecord) {
                return response.setIncomplete(lang.msgNotFound('outbfg.outbfg_id'));
            }
    
            // 🛑 ตรวจสอบสถานะการอนุมัติ
            if (outbfgRecord.outbfg_appr_status === ApprovalStatus.PENDING) {
                return response.setIncomplete(lang.msgErrorFormat('field.not_approved'));
            }
    
            if (outbfgRecord.outbfg_appr_status === ApprovalStatus.REJECTED) {
                return response.setIncomplete(lang.msgErrorFormat('field.rejected_approved'));
            }

            // ✅ ตรวจสอบว่า outbfgitm_id ห้ามซ้ำ
            const uniqueItemIds = new Set(items.map(item => item.outbfgitm_id));
            if (uniqueItemIds.size !== items.length) {
                return response.setIncomplete(lang.msgErrorFormat('duplicate_outbfgitm_id'));
            }

            let updatedItems: any[] = []; // เก็บผลลัพธ์ของรายการที่ถูกอัปเดต
    
            // ✅ วนลูปประมวลผลแต่ละ `inbfg_id`
            for (const item of items) {
                const { outbfgitm_id, inbfg_id, outbfgitm_withdr_count } = item;

                // const existingItem = await outbfgItemsRepository.findOne({ where: { outbfg_id, inbfg_id } });
                const existingItem = await outbfgItemsRepository.findOne({ where: { outbfgitm_id: item.outbfgitm_id } });

                if (!existingItem) {
                    return response.setIncomplete(lang.msgNotFound(`outbfgitm_id ${outbfgitm_id}`));
                }
                // ตรวจสอบว่า inbfg_id ที่ส่งมาตรงกับที่มีจริง
                if (existingItem.inbfg_id !== inbfg_id) {
                    return response.setIncomplete(lang.msgErrorFormat(`inbfg_id mismatch for outbfgitm_id ${outbfgitm_id}`));
                }
    
                // ✅ ตรวจสอบว่าค่าที่กรอกไม่เกิน `outbfgitm_quantity`
                if (outbfgitm_withdr_count > existingItem.outbfgitm_quantity) {
                    return response.setIncomplete(lang.msgErrorFormat(`field.scan_count_exceeded`)+ `(for inbrm_id ${inbfg_id})`);
                }
    
                // ✅ อัปเดตจำนวนที่เบิกโดยตรง (Set ค่าที่ส่งมา)
                existingItem.outbfgitm_withdr_count = outbfgitm_withdr_count;
    
                // ✅ กำหนดสถานะการเบิก
                existingItem.outbfgitm_withdr_status = existingItem.outbfgitm_withdr_count === existingItem.outbfgitm_quantity 
                ? WithdrawStatus.COMPLETED
                : existingItem.outbfgitm_withdr_count > 0
                ? WithdrawStatus.PARTIAL
                : WithdrawStatus.PENDING;

    
                // ✅ บันทึกการเปลี่ยนแปลง
                await outbfgItemsRepository.save(existingItem);
    
                // ✅ เพิ่มรายการที่อัปเดตเข้าไปใน `updatedItems`
                updatedItems.push({
                    outbfgitm_id: existingItem.outbfgitm_id,
                    outbfg_id: existingItem.outbfg_id,
                    inbfg_id: existingItem.inbfg_id,
                    outbfgitm_quantity: existingItem.outbfgitm_quantity,
                    outbfgitm_withdr_count: existingItem.outbfgitm_withdr_count,
                    outbfgitm_withdr_status: existingItem.outbfgitm_withdr_status,
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
        outbfg_id: number,  
        items: { outbfgitm_id: number; inbfg_id: number; outbfgitm_shipmt_count: number }[], 
        reqUsername: string, 
        manager?: EntityManager 
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbFinishedGoodsService.shipmtScan';
    
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
            const outbfgItemsRepository = useManager.getRepository(m_outb_finished_goods_items);
            const outbfgRepository = useManager.getRepository(m_outb_finished_goods);
    
            // ✅ ตรวจสอบว่า `outbfg_appr_status` เป็น `APPROVED`
            const outbfgRecord = await outbfgRepository.findOne({ where: { outbfg_id } });
            if (!outbfgRecord) {
                return response.setIncomplete(lang.msgNotFound('outbfg.outbfg_id'));
            }
    
            // 🛑 ตรวจสอบสถานะการอนุมัติ
            if (outbfgRecord.outbfg_appr_status === ApprovalStatus.PENDING) {
                return response.setIncomplete(lang.msgErrorFormat('field.not_approved'));
            }
    
            if (outbfgRecord.outbfg_appr_status === ApprovalStatus.REJECTED) {
                return response.setIncomplete(lang.msgErrorFormat('field.rejected_approved'));
            }
    
            // ✅ บันทึกเวลา scan
            outbfgRecord.scan_shipmt_date = new Date();
            await outbfgRepository.save(outbfgRecord);

            // ✅ ตรวจสอบว่า outbfgitm_id ห้ามซ้ำ
            const uniqueItemIds = new Set(items.map(item => item.outbfgitm_id));
            if (uniqueItemIds.size !== items.length) {
                return response.setIncomplete(lang.msgErrorFormat('duplicate_outbfgitm_id'));
            }
    
            let updatedItems: any[] = [];
    
            // ✅ วนลูปประมวลผลแต่ละ `inbfg_id`
            for (const item of items) {
                const { outbfgitm_id, inbfg_id, outbfgitm_shipmt_count } = item;
    
                const existingItem = await outbfgItemsRepository.findOne({ where: { outbfgitm_id } });

                if (!existingItem) {
                    return response.setIncomplete(lang.msgNotFound(`outbfgitm_id ${outbfgitm_id}`));
                }

                // ตรวจสอบว่า inbfg_id ที่ส่งมาตรงกับที่มีจริง
                if (existingItem.inbfg_id !== inbfg_id) {
                    return response.setIncomplete(lang.msgErrorFormat(`inbfg_id mismatch for outbfgitm_id ${outbfgitm_id}`));
                }
    
                // ✅ ตรวจสอบว่าค่าที่กรอกไม่เกิน `outbfgitm_withdr_count`
                if (outbfgitm_shipmt_count > existingItem.outbfgitm_withdr_count) {
                    return response.setIncomplete(lang.msgErrorFormat(`field.scan_count_exceeded`)+ `(for inbrm_id ${inbfg_id})`);
                }
    
                // ✅ อัปเดตจำนวนการจัดส่งโดยตรง
                existingItem.outbfgitm_shipmt_count = outbfgitm_shipmt_count;
    
                // ✅ กำหนดสถานะการจัดส่ง
                existingItem.outbfgitm_shipmt_status = existingItem.outbfgitm_shipmt_count === existingItem.outbfgitm_withdr_count 
                    ? ShipmentStatus.COMPLETED
                    : existingItem.outbfgitm_shipmt_count > 0
                    ? ShipmentStatus.PARTIAL
                    : ShipmentStatus.PENDING;
    
                // ✅ บันทึกการเปลี่ยนแปลง
                await outbfgItemsRepository.save(existingItem);
    
                // ✅ เพิ่มรายการที่อัปเดตเข้าไปใน `updatedItems`
                updatedItems.push({
                    outbfgitm_id: existingItem.outbfgitm_id,
                    outbfg_id: existingItem.outbfg_id,
                    inbfg_id: existingItem.inbfg_id,
                    outbfgitm_withdr_count: existingItem.outbfgitm_withdr_count,
                    outbfgitm_shipmt_count: existingItem.outbfgitm_shipmt_count,
                    outbfgitm_shipmt_status: existingItem.outbfgitm_shipmt_status,
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
    

    async update(
        outbfg_id: number,
        data: Partial<OutbFGModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<OutbFGModel>();
        const operation = 'OutbFinishedGoodsService.update';
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
            const repository = useManager.getRepository(m_outb_finished_goods);
            const outbfgItemsRepo = useManager.getRepository(m_outb_finished_goods_items);
            const tspyardRepository = useManager.getRepository(m_transport_yard);
    
            // ตรวจสอบว่ามีข้อมูลหรือไม่
            const existingOutbFG = await repository.findOne({ where: { outbfg_id } });
            if (!existingOutbFG) {
                return response.setIncomplete(lang.msgNotFound('outbfg.outbfg_id'));
            }
    
             // ตรวจสอบค่า `isShipment`
            const isShipment = typeof data.outbfg_is_shipment === "boolean" 
            ? data.outbfg_is_shipment 
            : existingOutbFG.outbfg_is_shipment ?? true;

            // เรียกใช้ validateRequiredFields เพื่อตรวจสอบและล้างค่าที่ไม่ต้องการ
            const validationResponse = this.validateRequiredFields(data, isShipment);
            if (validationResponse) return validationResponse;

            // ตรวจสอบว่า so_id, sup_id, tspyard_id มีอยู่จริงใน DB
            const soCheck = await this.checkSoExists(data.so_id!, useManager, response);
            if (soCheck) return soCheck;

            const yardCheck = await this.checkTransportYardExists(data.tspyard_id!, useManager, response);
            if (yardCheck) return yardCheck;

            // ตรวจสอบค่าที่ต้องกรอกสำหรับการจัดส่ง
            const shipmentValidation = await this.validateShipmentFields(data, tspyardRepository, response);
            if (shipmentValidation) return shipmentValidation;

            // ตรวจสอบ items มีอยู่จริงหรือไม่
            const items = data.items ?? [];
            const itemsValidation = this.validateItemsExistence(items, response);
            if (itemsValidation) return itemsValidation;
    
            // ดึงรายการ `bom_id` จาก items
            const bom_ids = items.map(item => item.bom_id);

            // ✅ ตรวจสอบว่า bom_id เดียวกัน มี inbfg_id ซ้ำกันหรือไม่
            const duplicateInbfgPerBomCheck = this.checkDuplicateInbfgPerBom(items, response);
            if (duplicateInbfgPerBomCheck) return duplicateInbfgPerBomCheck;

            // ตรวจสอบว่า so_id และ bom_id เป็นคู่กันใน m_bom_items
            const soBomCheck = await this.checkSoBomRelation(data.so_id!, bom_ids, useManager, response);
            if (soBomCheck) return soBomCheck;

            // ดึงค่า inbfg_id จาก ทุก object ในอาร์เรย์ items
            const inbfg_ids = items.map(item => item.inbfg_id);
    
            // ตรวจสอบ inbfg_id ว่ามีอยู่ใน DB หรือไม่
            const inbfgCheck = await this.checkInbsemiExists(inbfg_ids, useManager, response);
            if (inbfgCheck) return inbfgCheck;
    
            // ตรวจสอบว่า outbfgitm_quantity ไม่เกิน inbfg_quantity
            const quantities = items.map(item => item.outbfgitm_quantity);
            const quantityCheck = await this.checkQuantityLimit(inbfg_ids, quantities, useManager, response);
            if (quantityCheck) return quantityCheck;

            // ตรวจสอบว่าค่า fgifm_id จาก bom_id และ inbfg_id ตรงกันหรือไม่
            const fgifmCheck = await this.checkFgifmIdMatch(bom_ids, inbfg_ids, useManager, response);
            if (fgifmCheck) return fgifmCheck;
            
            // อัปเดตข้อมูลหลัก
            const updatedOutbFG = repository.merge(existingOutbFG, {
                ...data,
                outbfg_is_bom_used: true,
                update_date: new Date(),
                update_by: reqUsername,
            });
            await repository.save(updatedOutbFG);
    
            // ถ้ามี `items` ที่อัปเดต ให้ลบของเก่าก่อนเพิ่มใหม่
            if (data.items) {
                await outbfgItemsRepo.delete({ outbfg_id });
    
                const outbFGItems = data.items.map(item => ({
                    outbfg_id,
                    bom_id: item.bom_id,
                    inbfg_id: item.inbfg_id,
                    outbfgitm_quantity: item.outbfgitm_quantity,
                }));
                
    
                await outbfgItemsRepo.save(outbFGItems);
            }
    
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }       
            const updatedItems = await outbfgItemsRepo.find({ where: { outbfg_id } });

            // ใช้ reduce() จัดกลุ่ม `items`
            const formattedItems: OutbFGModel["items"] = updatedItems.map(item => ({
                bom_id: item.bom_id,
                inbfg_id: item.inbfg_id,
                outbfgitm_quantity: item.outbfgitm_quantity,
            }));     
    
            return response.setComplete(lang.msgSuccessAction('updated', 'item.outbfg'), {
                ...updatedOutbFG,
                items: formattedItems, // คืนค่า `items` ที่ถูกจัดกลุ่มใหม่
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

    async updateNoBom(
        outbfg_id: number,
        data: Partial<OutbFGNoBomModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<OutbFGNoBomModel>();
        const operation = 'OutbFinishedGoodsService.updateNoBom';
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
            const repository = useManager.getRepository(m_outb_finished_goods);
            const outbfgItemsRepo = useManager.getRepository(m_outb_finished_goods_items);
            const tspyardRepository = useManager.getRepository(m_transport_yard);
    
            // ตรวจสอบว่ามี `outbfg_id` ในระบบหรือไม่
            const existingOutbFG = await repository.findOne({ where: { outbfg_id } });
            if (!existingOutbFG) {
                return response.setIncomplete(lang.msgNotFound('outbfg.outbfg_id'));
            }
    
            // ตรวจสอบค่า `isShipment`
            const isShipment = typeof data.outbfg_is_shipment === "boolean" 
            ? data.outbfg_is_shipment 
            : existingOutbFG.outbfg_is_shipment ?? true;

            // เรียกใช้ validateRequiredFields เพื่อตรวจสอบและล้างค่าที่ไม่ต้องการ
            const validationResponse = this.validateRequiredFields(data, isShipment);
            if (validationResponse) return validationResponse;
    
            // ดึง `items`
            const items = data.items ?? [];
            const inbfg_ids = items.map(item => item.inbfg_id!);
            const quantities = items.map(item => item.outbfgitm_quantity!);

            // ✅ ตรวจสอบว่ามีค่า inbfg_id ซ้ำหรือไม่
            const duplicateCheck = this.checkDuplicateInbfgIds(inbfg_ids, response);
            if (duplicateCheck) return duplicateCheck;
    
            const yardCheck = await this.checkTransportYardExists(data.tspyard_id!, useManager, response);
            if (yardCheck) return yardCheck;
    
            // ตรวจสอบค่าที่ต้องกรอกสำหรับการจัดส่ง
            const shipmentValidation = await this.validateShipmentFields(data, tspyardRepository, response);
            if (shipmentValidation) return shipmentValidation;
    
            // ตรวจสอบ `inbfg_id` ว่ามีอยู่ในระบบหรือไม่
            const inbfgCheck = await this.checkInbsemiExists(inbfg_ids, useManager, response);
            if (inbfgCheck) return inbfgCheck;
    
            // ตรวจสอบว่า `outbfgitm_quantity` ไม่เกิน `inbfg_quantity`
            const quantityCheck = await this.checkQuantityLimit(inbfg_ids, quantities, useManager, response);
            if (quantityCheck) return quantityCheck;
    
            // อัปเดตข้อมูลหลัก
            const updatedOutbFG = repository.merge(existingOutbFG, {
                ...data,
                update_date: new Date(),
                update_by: reqUsername,
            });
            await repository.save(updatedOutbFG);
    
            // ลบ `items` เก่าก่อนเพิ่มใหม่
            await outbfgItemsRepo.delete({ outbfg_id });
    
            if (items.length > 0) {
                const outbFGItems = items.map(item => ({
                    outbfg_id,
                    inbfg_id: item.inbfg_id,
                    outbfgitm_quantity: item.outbfgitm_quantity,
                }));
                await outbfgItemsRepo.save(outbFGItems);
            }
    
            // ดึงข้อมูล `items` ที่เพิ่งอัปเดต
            const updatedItems = await outbfgItemsRepo.find({ where: { outbfg_id } });
    
            // จัดกลุ่ม `items` ให้เหมือน `createNoBom`
            const formattedItems: OutbFGNoBomModel["items"] = updatedItems.map(item => ({
                outbfgitm_id: item.outbfgitm_id,
                outbfg_id: item.outbfg_id,
                inbfg_id: item.inbfg_id,
                outbfgitm_quantity: item.outbfgitm_quantity,
            }));
    
            // Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('updated', 'item.outbfg'), {
                ...updatedOutbFG,
                items: formattedItems,
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
    

    async delete(outbfg_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'OutbFinishedGoodsService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_outb_finished_goods) : this.outbfgRepository;
            const itemsRepository = manager ? useManager.getRepository(m_outb_finished_goods_items) : this.outbfgItemsRepository;
            const notificationRepository =  manager ? useManager.getRepository(m_notifications): this.notificationRepository;

            // ตรวจสอบว่ามี `outbfg_id` หรือไม่
            const existingOutbFG = await repository.findOne({ where: { outbfg_id } });
            if (!existingOutbFG) {
                return response.setIncomplete(lang.msgNotFound('outbfg.outbfg_id'));
            }

            // ✅ ตรวจสอบสถานะการอนุมัติ
            if (existingOutbFG.outbfg_appr_status === ApprovalStatus.APPROVED) {
                return response.setIncomplete(lang.msg(`ไม่สามารถลบรายการที่อนุมัติแล้วได้`));
            }
    
            // ลบรายการ `m_outb_semi_items` ที่เกี่ยวข้องทั้งหมดก่อน
            await itemsRepository.delete({ outbfg_id });
    
            // ลบแจ้งเตือน `s_user_notification` ที่เกี่ยวข้อง
            const notiToDelete = await notificationRepository.find({
                where: { reference_type: RefType.OUTBFG, reference_id: outbfg_id },
            });
            
            const notifIds = notiToDelete.map(n => n.notif_id);
            
            if (notifIds.length > 0) {
                const userNotifRepo = manager ? useManager.getRepository(s_user_notification): this.usernotifRepo;
            
                await userNotifRepo.delete({ notif_id: In(notifIds) });
            }
            
            // ลบแจ้งเตือน `m_notifications` ที่เกี่ยวข้อง
            await notificationRepository.delete({ reference_type: RefType.OUTBFG, reference_id: outbfg_id });

            // ใช้ `deleteEntity()` เพื่อลบ `m_outb_semi`
            const deleteResponse = await deleteEntity(repository, outbfg_id, reqUsername, 'outbfg_is_active', 'outbfg_id');
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
    
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.outbfg'));
    
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during outbfg deletion:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    
    async getAll(approvalStatus?: ApprovalStatus,  filterWithdrawStatus?: boolean, manager?: EntityManager):  Promise<ApiResponse<any | null>> { 
        const response = new ApiResponse<any | null>();
        const operation = 'OutbFinishedGoodsService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_finished_goods) : this.outbfgRepository;
    
            // Query ข้อมูลทั้งหมดในรูปแบบ raw data
            const queryBuilder = repository
                .createQueryBuilder('outbfg')
                .leftJoin('m_outb_finished_goods_items', 'outbfgitm', 'outbfg.outbfg_id = outbfgitm.outbfg_id')
                .select([
                    'outbfg.outbfg_id AS outbfg_id',
                    'outbfg.outbfg_code AS outbfg_code',
                    'outbfg.outbfg_details AS outbfg_details',
                    "DATE_FORMAT(outbfg.create_date, '%d %b %y') AS formatted_date",
                    "DATE_FORMAT(outbfg.create_date, '%H:%i:%s') AS create_time",
                    'outbfg.outbfg_appr_status AS outbfg_appr_status',
                    'outbfgitm.outbfgitm_withdr_status AS outbfgitm_withdr_status',
                    'outbfgitm.outbfgitm_shipmt_status AS outbfgitm_shipmt_status', // เปลี่ยนจาก is_shipmt
                    'outbfg.create_by AS create_by',
                    'outbfg.update_date AS update_date',
                    'outbfg.update_by AS update_by',
                    'outbfg.outbfg_is_active AS outbfg_is_active',
                    "DATE_FORMAT(outbfg.withdr_date, '%d %b %y') AS withdr_date",
                    "DATE_FORMAT(outbfg.withdr_date, '%H:%i:%s') AS withdr_time",
                    "DATE_FORMAT(outbfg.shipmt_date, '%d %b %y') AS shipmt_date",
                    "DATE_FORMAT(outbfg.shipmt_date, '%H:%i:%s') AS shipmt_time",
                    "DATE_FORMAT(NOW(), '%d %b %y') AS today_date",
                    "GREATEST(DATEDIFF(outbfg.scan_shipmt_date, outbfg.shipmt_date), 0) AS delay_days" // ✅ คำนวณวันล่าช้าใหม่
                ])
                .where('outbfg.outbfg_is_active = :isActive', { isActive: true })
                .orderBy('outbfg.outbfg_code', 'ASC')
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
    
             // ✅ กรองเฉพาะสถานะที่กำหนด ถ้ามีค่า approvalStatus
            if (approvalStatus) {
                queryBuilder.andWhere('outbfg.outbfg_appr_status = :apprStatus', { apprStatus: approvalStatus });
            }

            // ✅ กรองเฉพาะ COMPLETED และ PARTIAL ถ้า filterWithdrawStatus เป็น true
            if (filterWithdrawStatus === true) {
                queryBuilder.andWhere('outbfgitm.outbfgitm_withdr_status IN (:...statuses)', { 
                    statuses: [WithdrawStatus.COMPLETED, WithdrawStatus.PARTIAL] 
                });
            }

            const rawData = await queryBuilder.getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setComplete(lang.msgNotFound('item.outbfg'), []); // ✅ คืน array ว่าง
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
    
            // ฟิลเตอร์เอาเฉพาะค่า outbfg_id ที่ไม่ซ้ำ และจัดเรียงตามสถานะ
            const filteredData = Array.from(
                rawData.reduce((map, record) => {
                    const existing = map.get(record.outbfg_id);
    
                    //ตรวจสอบสถานะที่ไม่ถูกต้อง
                    const existingWithdrawStatus = existing?.outbfgitm_withdr_status as WithdrawStatus;
                    const newWithdrawStatus = record.outbfgitm_withdr_status as WithdrawStatus;

                    const existingShipmentStatus = existing?.outbfgitm_shipmt_status as ShipmentStatus;
                    const newShipmentStatus = record.outbfgitm_shipmt_status as ShipmentStatus;
    
                    // ตรวจสอบว่าเป็นค่าสถานะที่ถูกต้อง
                    if (!Object.values(WithdrawStatus).includes(newWithdrawStatus)) {
                        console.warn(`พบค่า outbfgitm_withdr_status ที่ไม่ถูกต้อง: ${newWithdrawStatus}`);
                        return map;
                    }
                    if (!Object.values(ShipmentStatus).includes(newShipmentStatus)) {
                        console.warn(`พบค่า outbfgitm_shipmt_status ที่ไม่ถูกต้อง: ${newShipmentStatus}`);
                        return map;
                    }
    
                    // ใช้ตัวแปรกลางเพื่อลดการ Overwrite
                    const updatedRecord = existing ? { ...existing } : { ...record };
                                // ตรวจสอบและกำหนดค่าของ outbfgitm_withdr_status
                    if (existingWithdrawStatus === WithdrawStatus.COMPLETED && newWithdrawStatus === WithdrawStatus.PENDING) {
                        updatedRecord.outbfgitm_withdr_status = WithdrawStatus.PARTIAL;
                    } else if (existingWithdrawStatus === WithdrawStatus.PENDING && newWithdrawStatus === WithdrawStatus.COMPLETED) {
                        updatedRecord.outbfgitm_withdr_status = WithdrawStatus.PARTIAL;
                    } else if (existingWithdrawStatus === WithdrawStatus.PARTIAL || newWithdrawStatus === WithdrawStatus.PARTIAL) {
                        updatedRecord.outbfgitm_withdr_status = WithdrawStatus.PARTIAL;
                    } else if (
                        withdrawPriority[newWithdrawStatus] !== undefined &&
                        withdrawPriority[existingWithdrawStatus] !== undefined &&
                        withdrawPriority[newWithdrawStatus] < withdrawPriority[existingWithdrawStatus]
                    ) {
                        updatedRecord.outbfgitm_withdr_status = newWithdrawStatus;
                    }

                    // ตรวจสอบและกำหนดค่าของ outbfgitm_shipmt_status
                    if (existingShipmentStatus === ShipmentStatus.COMPLETED && newShipmentStatus === ShipmentStatus.PENDING) {
                        updatedRecord.outbfgitm_shipmt_status = ShipmentStatus.PARTIAL;
                    } else if (existingShipmentStatus === ShipmentStatus.PENDING && newShipmentStatus === ShipmentStatus.COMPLETED) {
                        updatedRecord.outbfgitm_shipmt_status = ShipmentStatus.PARTIAL;
                    } else if (existingShipmentStatus === ShipmentStatus.PARTIAL || newShipmentStatus === ShipmentStatus.PARTIAL) {
                        updatedRecord.outbfgitm_shipmt_status = ShipmentStatus.PARTIAL;
                    } else if (
                        shipmentPriority[newShipmentStatus] !== undefined &&
                        shipmentPriority[existingShipmentStatus] !== undefined &&
                        shipmentPriority[newShipmentStatus] < shipmentPriority[existingShipmentStatus]
                    ) {
                        updatedRecord.outbfgitm_shipmt_status = newShipmentStatus;
                    }

                    // ✅ ใช้ updatedRecord เพื่อให้แน่ใจว่าไม่มีการเขียนทับค่าที่อัปเดตไปแล้ว
                    map.set(record.outbfg_id, updatedRecord);
                    return map;
                }, new Map<number, any>()).values()
            );
    
            return response.setComplete(lang.msgFound('item.outbfg'), filteredData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(outbfg_id: number, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbFinishedGoodsService.getById';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_finished_goods) : this.outbfgRepository;
            const outbfgItemsRepo = manager ? manager.getRepository(m_outb_finished_goods_items) : this.outbfgItemsRepository;
            const inbfgRepo = manager ? manager.getRepository(m_inb_finished_goods) : this.inbfgRepository;
            const fgifmRepo = manager ? manager.getRepository(m_finished_goods_ifm) : this.fgifmRepository;
            const supplierRepo = manager ? manager.getRepository(m_supplier) : this.supplierRepository;
            const tspyardRepo = manager ? manager.getRepository(m_transport_yard) : this.tspyardRepository;
            const bomItemsRepo = manager ? manager.getRepository(m_bom_items) : this.bomItemsRepository;

            // ดึงข้อมูล `m_outb_finished_goods` โดยเพิ่มเงื่อนไข outbfg_is_active = true
            const outbfg = await repository.findOne({
                where: { 
                    outbfg_id, 
                    outbfg_is_active: true // ✅ เพิ่มเงื่อนไขนี้
                }
            });
    
            if (!outbfg) {
                return response.setIncomplete(lang.msgNotFound('outbfg.outbfg_id'));
            }
    
            // ดึง `items` ที่เกี่ยวข้อง
            const outbfgItems = await outbfgItemsRepo.find({ where: { outbfg_id } });
    
            // ดึง inbfg_id ทั้งหมด เพื่อนำไปหา inbfg_code, inbfg_quantity, fgifm_id
            const inbfgIds = outbfgItems.map(item => item.inbfg_id);
            const inbfgData = await inbfgRepo.findBy({ inbfg_id: In(inbfgIds) });
    
            // ดึง fgifm_id ที่เกี่ยวข้อง และหา fgifm_name จาก `m_finished_goods_ifm`
            const fgifmIds = [...new Set(inbfgData.map(i => i.fgifm_id))]; // เอา fgifm_id ที่ไม่ซ้ำ
            const fgifmData = await fgifmRepo.findBy({ fgifm_id: In(fgifmIds) });
    
            // ดึง tspyard_name จาก `m_transport_yard`
            const tspyard = outbfg.tspyard_id ? await tspyardRepo.findOne({ where: { tspyard_id: outbfg.tspyard_id } }) : null;
    
            let formattedItems: any[] = [];
    
            if (outbfg.outbfg_is_bom_used) {
                // พิ่มการดึงข้อมูล bom_number จาก m_bom_items
                const bomIds = [...new Set(outbfgItems.map(item => item.bom_id))];
                const bomData = await bomItemsRepo.findBy({ bom_id: In(bomIds) });
            
                // กรณีมี BOM → จัดกลุ่ม `items` ตาม `bom_number`
                formattedItems = outbfgItems.reduce<{ 
                    bom_number: string; 
                    inbfg_ids: { 
                        bom_id: number;
                        inbfg_id: number; 
                        inbfg_code: string | null; 
                        inbfg_quantity: number | null; 
                        fgifm_id: number | null; 
                        fgifm_name: string | null; 
                        outbfgitm_quantity: number; 
                        remaining_quantity: number | null;
                    }[] 
                }[]>((acc, cur) => {
                    const bomItem = bomData.find(b => b.bom_id === cur.bom_id);
                    const bom_number = bomItem?.bom_number || `BOM_${cur.bom_id}`; // หา bom_number ถ้าไม่มีใช้ BOM_bom_id
            
                    let existingItem = acc.find(item => item.bom_number === bom_number);
                    if (!existingItem) {
                        existingItem = { bom_number,inbfg_ids: [] };
                        acc.push(existingItem);
                    }

                    // ค้นหาข้อมูล `inbfg` และ `fgifm`
                    const inbfg = inbfgData.find(i => i.inbfg_id === cur.inbfg_id);
                    const fgifm = fgifmData.find(f => f.fgifm_id === inbfg?.fgifm_id);
                    const remaining_quantity = inbfg?.inbfg_quantity ? inbfg.inbfg_quantity - cur.outbfgitm_quantity : null;
            
                    existingItem.inbfg_ids.push({
                        bom_id: cur.bom_id, // เพิ่ม bom_id ที่ระดับ inbfg_ids
                        inbfg_id: cur.inbfg_id,
                        inbfg_code: inbfg?.inbfg_code || null,
                        inbfg_quantity: inbfg?.inbfg_quantity || null,
                        fgifm_id: inbfg?.fgifm_id || null,
                        fgifm_name: fgifm?.fgifm_name || null,
                        outbfgitm_quantity: cur.outbfgitm_quantity,
                        remaining_quantity: remaining_quantity, // ✅ เพิ่ม remaining_quantity
                    });
            
                    return acc;
                }, []);
            } else {
                // กรณีไม่มี BOM → แสดง `inbfg_id` และข้อมูลที่เกี่ยวข้อง
                formattedItems = outbfgItems.map(item => {
                    const inbfg = inbfgData.find(i => i.inbfg_id === item.inbfg_id);
                    const fgifm = fgifmData.find(f => f.fgifm_id === inbfg?.fgifm_id);
                    const remaining_quantity = inbfg?.inbfg_quantity ? inbfg.inbfg_quantity - item.outbfgitm_quantity : null;

                    return {
                        inbfg_id: item.inbfg_id,
                        inbfg_code: inbfg?.inbfg_code || null,
                        inbfg_quantity: inbfg?.inbfg_quantity || null,
                        fgifm_id: inbfg?.fgifm_id || null,
                        fgifm_name: fgifm?.fgifm_name || null,
                        outbfgitm_quantity: item.outbfgitm_quantity,
                        remaining_quantity: remaining_quantity, // ✅ เพิ่ม remaining_quantity
                    };
                });
            }
            
            const tspyardFull = [tspyard?.tspyard_code , tspyard?.tspyard_name].filter(Boolean).join(" ");

            // รวมข้อมูลและส่งกลับ
            const result = {
                ...outbfg, // ข้อมูลหลักของ OutbFinishedGoods
                tspyard_name: tspyardFull || null, // ป้องกัน null
                items: formattedItems // รายการสินค้า (จัดรูปแบบแล้ว)
            };

            return response.setComplete(lang.msgFound('outbfg.outbfg_id'), result);
        } catch (error: any) {
            console.error(`Error in ${operation} with outbfg_id: ${outbfg_id}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
 
    async getReqById(outbfg_id: number, manager?: EntityManager): Promise<ApiResponse<OutbFinishedGoodsReqModel | null>> {
        const response = new ApiResponse<OutbFinishedGoodsReqModel | null>();
        const operation = 'OutbFinishedGoodsService.getReqById';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_finished_goods) : this.outbfgRepository;
    
            // Query ดึงข้อมูลจากฐานข้อมูล
            const rawData = await repository
                .createQueryBuilder('outbfg')
                .leftJoin('m_outb_finished_goods_items', 'outbfgitm', 'outbfg.outbfg_id = outbfgitm.outbfg_id')
                .leftJoin('m_inb_finished_goods', 'inbfg', 'outbfgitm.inbfg_id = inbfg.inbfg_id')
                .leftJoin('m_finished_goods_ifm', 'fgifm', 'inbfg.fgifm_id = fgifm.fgifm_id')
                .leftJoin('m_bom', 'bom', 'outbfg.so_id = bom.so_id')
                .leftJoin('m_factory', 'factory', 'inbfg.fty_id = factory.fty_id')
                .leftJoin('m_warehouse', 'warehouse', 'inbfg.wh_id = warehouse.wh_id')
                .leftJoin('m_zone', 'zone', 'inbfg.zn_id = zone.zn_id')
                .leftJoin('m_transport_yard', 'tspyard', 'outbfg.tspyard_id = tspyard.tspyard_id')
                .leftJoin('m_unit', 'unit', 'unit.unit_id = fgifm.fgifm_product_unitId')
                .select([
                    'outbfg.outbfg_id AS outbfg_id',
                    'outbfg.outbfg_code AS outbfg_code',
                    "NOW() AS today_date_time", // ✅ ใช้ค่า Timestamp ปกติ
                    "DATE_FORMAT(NOW(), '%e/%c/%y %H:%i:%s') AS today_date", // ✅ ใช้รูปแบบ YYYY-MM-DD
                    "DATE_FORMAT(outbfg.withdr_date, '%d %b %y') AS withdr_date",
                    "DATE_FORMAT(outbfg.shipmt_date, '%d %b %y') AS shipmt_date",
                    'bom.so_code AS so_code',
                    'outbfg.outbfg_details AS outbfg_details',
                    'outbfg.outbfg_driver_name AS outbfg_driver_name',
                    'outbfg.outbfg_vehicle_license AS outbfg_vehicle_license',
                    'outbfg.outbfg_phone AS outbfg_phone',
                    'outbfg.outbfg_address AS outbfg_address',
                    'outbfg.outbfg_remark AS outbfg_remark',
                    'tspyard.tspyard_id AS tspyard_id',
                    'tspyard.tspyard_name AS tspyard_name',
                    'outbfgitm.outbfgitm_id AS outbfgitm_id',
                    'inbfg.inbfg_id AS inbfg_id',
                    'inbfg.inbfg_code AS inbfg_code',
                    'inbfg.inbfg_color AS inbfg_color',
                    'fgifm.fgifm_id AS fgifm_id',
                    'fgifm.fgifm_name AS fgifm_name',
                    'fgifm.fgifm_width AS fgifm_width',
                    'fgifm.fgifm_length AS fgifm_length',
                    'fgifm.fgifm_thickness AS fgifm_thickness',
                    'unit.unit_abbr_th AS unit_abbr_th',
                    'factory.fty_name AS fty_name',
                    'warehouse.wh_name AS wh_name',
                    'zone.zn_name AS zn_name',
                    'outbfgitm.outbfgitm_quantity AS outbfgitm_quantity',
                    'outbfgitm.outbfgitm_withdr_count AS outbfgitm_withdr_count',
                    'outbfgitm.outbfgitm_withdr_status AS outbfgitm_withdr_status',
                    'outbfgitm.outbfgitm_shipmt_count AS outbfgitm_shipmt_count',
                    'outbfgitm.outbfgitm_shipmt_status AS outbfgitm_shipmt_status',
                ])
                .where('outbfg.outbfg_id = :outbfg_id', { outbfg_id })
                .andWhere('outbfg.outbfg_is_active = :isActive', { isActive: true })
                .getRawMany();
    
            // ตรวจสอบว่ามีข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('outbfg.outbfg_id'));
            }

            // จัดรูปแบบข้อมูลด้วย Model
            const result = OutbFinishedGoodsReqModel.fromRawData(rawData);
    
            return response.setComplete(lang.msgFound('outbfg.outbfg_id'), result);
        } catch (error: any) {
            console.error(`Error in ${operation} with outbfg_id: ${outbfg_id}`, error);
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        }        
    }

    async updateDates(outbfg_id: number, data: { withdr_date?: string; shipmt_date?: string }, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OutbFinishedGoodsService.updateDates';
    
        try {
            const repository = manager ? manager.getRepository(m_outb_finished_goods) : this.outbfgRepository;
    
            // ค้นหา Record ตาม outbfg_id
            const outbfg = await repository.findOne({ where: { outbfg_id } });
    
            if (!outbfg) {
                return response.setIncomplete(lang.msgNotFound('outbfg.outbfg_id'));
            }
    
            // ตรวจสอบว่ามีค่าที่ต้องอัปเดตหรือไม่
            if (!data.withdr_date && !data.shipmt_date) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // อัปเดตค่าตามที่ได้รับ
            if (data.withdr_date) {
                outbfg.withdr_date = new Date(data.withdr_date);
            }
            if (data.shipmt_date) {
                outbfg.shipmt_date = new Date(data.shipmt_date);
            }
    
            // บันทึกการอัปเดต
            await repository.save(outbfg);
    
            // ✅ ส่ง Response เฉพาะค่าที่ต้องการ
            const responseData = {
                outbfg_id: outbfg.outbfg_id,
                withdr_date: outbfg.withdr_date,
                shipmt_date: outbfg.shipmt_date
            };
    
            return response.setComplete(lang.msgSuccessAction('updated', 'item.outbfg'), responseData);
    
        } catch (error: any) {
            console.error(`Error in ${operation} with outbfg_id: ${outbfg_id}`, error);
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        }
    }


}