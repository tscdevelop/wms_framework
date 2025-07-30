import { Repository, EntityManager, In } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils
import CodeGenerator from '../utils/CodeGenerator';

import { m_inb_raw_material } from '../entities/m_inb_raw_material.entity';
import { InbRawMaterialModel } from '../models/inb_raw_material.model';
import { m_factory } from '../entities/m_factory.entity';
import { m_warehouse } from '../entities/m_warehouse.entity';
import { m_zone } from '../entities/m_zone.entity';
import { m_location } from '../entities/m_location.entity';
import { InbrmDropdownModel } from '../models/inb_raw_material_dropdown.model';
import { m_supplier } from '../entities/m_supplier.entity';
import { m_raw_material_ifm } from '../entities/m_raw_material_ifm.entity';
import { m_criteria } from '../entities/m_criteria.entity';
import { deleteEntity } from '../utils/DatabaseUtils';
import { m_notifications } from '../entities/m_notifications.entity';
import { RefType } from '../common/global.enum';
import { s_user_notification } from '../entities/s_user_notification.entity';

export class InbRawMaterialService {
    private inbRawmaterialRepository: Repository<m_inb_raw_material>;
    private factoryRepository: Repository<m_factory>;
    private warehouseRepository: Repository<m_warehouse>;
    private zoneRepository: Repository<m_zone>;
    private locationRepository: Repository<m_location>;
    private criteriaRepository: Repository<m_criteria>;
    private supplierRepository: Repository<m_supplier>;
    private rmifmRepository: Repository<m_raw_material_ifm>;
    private notificationRepository: Repository<m_notifications>;
    private usernotifRepo: Repository<s_user_notification>;

    constructor() {
        this.inbRawmaterialRepository = AppDataSource.getRepository(m_inb_raw_material);
        this.factoryRepository = AppDataSource.getRepository(m_factory);
        this.warehouseRepository = AppDataSource.getRepository(m_warehouse);
        this.zoneRepository = AppDataSource.getRepository(m_zone);
        this.locationRepository = AppDataSource.getRepository(m_location);
        this.criteriaRepository = AppDataSource.getRepository(m_criteria);
        this.supplierRepository = AppDataSource.getRepository(m_supplier);
        this.rmifmRepository = AppDataSource.getRepository(m_raw_material_ifm);
        this.notificationRepository = AppDataSource.getRepository(m_notifications);
        this.usernotifRepo = AppDataSource.getRepository(s_user_notification);
    }

    private async generateCode(): Promise<string> {
        const codeGenerator = new CodeGenerator(AppDataSource);
        const newCode = await codeGenerator.generateCode('m_inb_raw_material', 'inbrm_code', 'RM', '', '[PREFIX][000x]');
        return newCode;
    }

    //validate field inbrm
    private validateRequiredFields(data: Partial<InbRawMaterialModel>, response: ApiResponse<any>): ApiResponse<any> | null {
        const requiredFields = [
            { field: data.rmifm_id, message: 'raw_material_ifm.rmifm_id' },
            { field: data.fty_id, message: 'item.factory' },
            { field: data.wh_id, message: 'item.warehouse' },
            { field: data.zn_id, message: 'item.zone' },
            { field: data.loc_id, message: 'item.location' },
            { field: data.sup_id, message: 'item.supplier' },
            { field: data.inbrm_grade, message: 'inbrm.inbrm_grade' },
            { field: data.inbrm_lot, message: 'inbrm.inbrm_lot' },
            { field: data.inbrm_quantity, message: 'inbrm.inbrm_quantity' },
        ];
    
        for (const { field, message } of requiredFields) {
            if (validate.isNullOrEmpty(field)) {
                return response.setIncomplete(lang.msgRequired(message));
            }
        }
    
        return null;
    }

    async create(data: Partial<InbRawMaterialModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<InbRawMaterialModel>();
        let Data = new m_inb_raw_material();
        const operation = 'InbRawMaterialService.create';

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
            
            const repository = manager ? useManager.getRepository(m_inb_raw_material) : this.inbRawmaterialRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory) : this.factoryRepository;
            const warehouseRepository = manager ? useManager.getRepository(m_warehouse) : this.warehouseRepository;
            const zoneRepository = manager ? useManager.getRepository(m_zone) : this.zoneRepository;
            const locationRepository = manager ? useManager.getRepository(m_location) : this.locationRepository;
            const rmifmRepository = manager ? useManager.getRepository(m_raw_material_ifm) : this.rmifmRepository;
            const supplierRepository = manager ? useManager.getRepository(m_supplier) : this.supplierRepository;

            // ตรวจสอบว่า `rmifm_id` มีอยู่ใน m_raw_material_ifm หรือไม่
            const existingRMIfm = await rmifmRepository.findOne({ where: { rmifm_id: data.rmifm_id}});
            if (!existingRMIfm) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_id'));
            }

             // ตรวจสอบว่า `rmifm_id` และ `inbrm_bom` เป็นคู่ที่ไม่ซ้ำกันใน repository
            if (data.inbrm_bom) {
                const existingPair = await repository.findOne({ where: { rmifm_id: data.rmifm_id, inbrm_bom: data.inbrm_bom } });
                if (existingPair) {
                    return response.setIncomplete(lang.msgAlreadyExists('inbrm.inbrm_bom'));
                }
            }

            // ตรวจสอบว่า fty_id มีอยู่ใน m_factory หรือไม่
            const existingFty = await factoryRepository.findOne({ where: { fty_id: data.fty_id } });
            if (!existingFty) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }

            // ตรวจสอบว่า wh_id มีอยู่ใน m_warehouse หรือไม่
            const existingWh = await warehouseRepository.findOne({ where: { wh_id: data.wh_id } });
            if (!existingWh) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_id'));
            }

            // ตรวจสอบว่า zn_id มีอยู่ใน m_zone หรือไม่
            const existingZn = await zoneRepository.findOne({ where: { zn_id: data.zn_id } });
            if (!existingZn) {
                return response.setIncomplete(lang.msgNotFound('zone.zn_id'));
            }

            // ตรวจสอบว่า loc_id มีอยู่ใน m_location หรือไม่
            const existingLoc = await locationRepository.findOne({ where: { loc_id: data.loc_id } });
            if (!existingLoc) {
                return response.setIncomplete(lang.msgNotFound('location.loc_id'));
            }

            // ตรวจสอบว่า sup_id มีอยู่ใน m_supplier หรือไม่
            const existingSup = await supplierRepository.findOne({ where: { sup_id: data.sup_id } });
            if (!existingSup) {
                return response.setIncomplete(lang.msgNotFound('supplier.sup_id'));
            }

            // Validate required fields
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) {
                return validationResponse;
            }

            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            if (validate.isNotNullOrEmpty(data.inbrm_code)) {
                const existingCode = await repository.findOneBy({ inbrm_code: data.inbrm_code });
                if (existingCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('inbrm.inbrm_code'));
                }
            } else {
                data.inbrm_code = await this.generateCode();
            }

            // เช็คข้อมูลซ้ำทั้งหมดตามเงื่อนไขที่กำหนด
            const existingRecord = await repository.findOne({
                where: {
                    rmifm_id: data.rmifm_id,
                    fty_id: data.fty_id,
                    wh_id: data.wh_id,
                    zn_id: data.zn_id,
                    loc_id: data.loc_id,
                    inbrm_lot: data.inbrm_lot,
                    inbrm_grade: data.inbrm_grade,
                    sup_id: data.sup_id
                }
            });

            // ถ้าพบว่าเป็นข้อมูลของ record อื่น → ไม่ให้ create
            if (existingRecord) {
                return response.setIncomplete(lang.msgAlreadyExists('item.raw_material_ifm'));
            }

            // assign ข้อมูลเข้าไป
            Object.assign(Data, {
                ...data,
                inbrm_is_active: data.inbrm_is_active ?? true, // ถ้า is_active เป็น null หรือ undefined จะใช้ true
                create_date: new Date(),
                rmifm_id: existingRMIfm.rmifm_id,
                fty_id: existingFty.fty_id,
                wh_id: existingWh.wh_id,
                zn_id: existingZn.zn_id,
                loc_id: existingLoc.loc_id,
                sup_id: existingSup.sup_id,
            });

            // สร้าง instance ของ entity (m_inb_raw_material) ที่พร้อมสำหรับการบันทึก
            const inbrm = repository.create(Data);

            // บันทึก entity (inbrm) ลงฐานข้อมูล
            const savedData = await repository.save(inbrm);

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
            // ดึงข้อมูล user ที่สร้างใหม่
            return response.setComplete(lang.msgSuccessAction('created', 'item.inbrm'), savedData);

        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during user creation:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async update(
        inbrm_id: number,
        data: Partial<InbRawMaterialModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<InbRawMaterialModel>();
        const operation = 'InbRawMaterialService.update';
    
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

            const repository = manager ? useManager.getRepository(m_inb_raw_material) : this.inbRawmaterialRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory) : this.factoryRepository;
            const warehouseRepository = manager ? useManager.getRepository(m_warehouse) : this.warehouseRepository;
            const zoneRepository = manager ? useManager.getRepository(m_zone) : this.zoneRepository;
            const locationRepository = manager ? useManager.getRepository(m_location) : this.locationRepository;
            const rmifmRepository = manager ? useManager.getRepository(m_raw_material_ifm) : this.rmifmRepository;
            const supplierRepository = manager ? useManager.getRepository(m_supplier) : this.supplierRepository;

            // ตรวจสอบว่ามี inbrm_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingInbRM = await repository.findOne({ where: { inbrm_id: inbrm_id } });
            if (!existingInbRM) {
                return response.setIncomplete(lang.msgNotFound('inbrm.inbrm_id'));
            }

            // ตรวจสอบว่า `rmifm_id` มีอยู่ในฐานข้อมูลหรือไม่
            const existingRMIfm = await rmifmRepository.findOne({ where: { rmifm_id: data.rmifm_id}});
            if (!existingRMIfm) {
                return response.setIncomplete(lang.msgAlreadyExists('raw_material_ifm.rmifm_id'));
            }

            // ตรวจสอบว่า fty_id มีอยู่ใน m_factory หรือไม่
            const existingFty = await factoryRepository.findOne({ where: { fty_id: data.fty_id } });
            if (!existingFty) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }

            // ตรวจสอบว่า wh_id มีอยู่ใน m_warehouse หรือไม่
            const existingWh = await warehouseRepository.findOne({ where: { wh_id: data.wh_id } });
            if (!existingWh) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_id'));
            }

            // ตรวจสอบว่า zn_id มีอยู่ใน m_zone หรือไม่
            const existingZn = await zoneRepository.findOne({ where: { zn_id: data.zn_id } });
            if (!existingZn) {
                return response.setIncomplete(lang.msgNotFound('zone.zn_id'));
            }

            // ตรวจสอบว่า loc_id มีอยู่ใน m_location หรือไม่
            const existingLoc = await locationRepository.findOne({ where: { loc_id: data.loc_id } });
            if (!existingLoc) {
                return response.setIncomplete(lang.msgNotFound('location.loc_id'));
            }

            // ตรวจสอบว่า sup_id มีอยู่ใน m_supplier หรือไม่
            const existingSup = await supplierRepository.findOne({ where: { sup_id: data.sup_id } });
            if (!existingSup) {
                return response.setIncomplete(lang.msgNotFound('supplier.sup_id'));
            }

            // Validate required fields
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) {
                return validationResponse;
            }

            // ตรวจสอบว่ามี record ซ้ำหรือไม่ (ยกเว้นตัวเอง)
            const duplicateRecord = await repository.findOne({
                where: {
                    rmifm_id: data.rmifm_id,
                    fty_id: data.fty_id,
                    wh_id: data.wh_id,
                    zn_id: data.zn_id,
                    loc_id: data.loc_id,
                    inbrm_lot: data.inbrm_lot,
                    inbrm_grade: data.inbrm_grade,
                    sup_id: data.sup_id
                }
            });

              // ถ้าพบว่าเป็นข้อมูลของ record อื่น → ไม่ให้ update
            if (duplicateRecord && duplicateRecord.inbrm_id !== inbrm_id) {
                return response.setIncomplete(lang.msgAlreadyExists('item.raw_material_ifm'));
            }

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existingInbRM, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
                rmifm_id: existingRMIfm.rmifm_id,
                fty_id: existingFty.fty_id,
                wh_id: existingWh.wh_id,
                zn_id: existingZn.zn_id,
                loc_id: existingLoc.loc_id,
                sup_id: existingSup.sup_id,
            });
    
            await repository.save(existingInbRM); // บันทึกข้อมูล
    
            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(inbrm_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }
    
            response.setComplete(lang.msgSuccessAction('updated', 'item.inbrm'), dataResponse.data);
    
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response;
    
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during update operation:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async delete(inbrm_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'InbRawMaterialService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_inb_raw_material) : this.inbRawmaterialRepository;
            const notificationRepository = manager ? useManager.getRepository(m_notifications): this.notificationRepository;
    
             // ลบแจ้งเตือน `s_user_notification` ที่เกี่ยวข้อง
            const notiToDelete = await notificationRepository.find({
                where: { reference_type: RefType.INBRM, reference_id: inbrm_id },
            });
            
            const notifIds = notiToDelete.map(n => n.notif_id);
            
            if (notifIds.length > 0) {
                const userNotifRepo = manager ? useManager.getRepository(s_user_notification): this.usernotifRepo;
            
                await userNotifRepo.delete({ notif_id: In(notifIds) });
            }
            
            // ลบแจ้งเตือน `m_notifications` ที่เกี่ยวข้อง
            await notificationRepository.delete({ reference_type: RefType.INBRM, reference_id: inbrm_id });
            
            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, inbrm_id, reqUsername, 'inbrm_is_active', 'inbrm_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
    
            // Commit Transaction หลังจากลบข้อมูลสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return deleteResponse; // ส่ง response ตามผลลัพธ์จาก deleteEntity
    
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during zone deletion:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    
    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'InbRawMaterialService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(m_inb_raw_material) : this.inbRawmaterialRepository;
    
            // Query ข้อมูลทั้งหมด โดยใช้ GROUP BY และ SUM()
            const rawData = await repository.createQueryBuilder('inbrm')
                .leftJoin('m_raw_material_ifm', 'rmifm', 'rmifm.rmifm_id = inbrm.rmifm_id')    
                .leftJoin('m_raw_material', 'rm', 'rm.rm_id = rmifm.rm_id')
                .select([
                    'rmifm.rmifm_id AS rmifm_id',
                    'rmifm.rmifm_code AS rmifm_code',
                    'rmifm.rmifm_name AS rmifm_name',
                    // 👇 คำนวณน้ำหนักรวมโดยใช้จำนวน * น้ำหนักต่อหน่วย
                    'ROUND(COALESCE(SUM(inbrm.inbrm_quantity * rmifm.rmifm_weight), 0), 4) AS inbrm_total_weight',
                    'COALESCE(SUM(inbrm.inbrm_quantity), 0) AS inbrm_quantity',
                    'rm.rm_id AS rm_id',
                    'rm.rm_type AS rm_type',
                ])
                .where('inbrm.inbrm_is_active = :isActive', { isActive: true })
                .groupBy('rmifm.rmifm_id')
                .orderBy('rmifm.rmifm_code', 'ASC') // ✅ เรียงลำดับตาม rmifm_code จากน้อยไปมาก (A → Z, 0 → 9)
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.inbrm'));
            }            
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('item.inbrm'), rawData);
    
        } catch (error: any) {
            console.error('Error in getAll:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getAllDetails(rmifm_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'InbRawMaterialService.getAllDetails';
    
        try {
            const repository = manager ? manager.getRepository(m_inb_raw_material) : this.inbRawmaterialRepository;
    
            // Query ข้อมูลทั้งหมดในรูปแบบ raw data
            const query = repository.createQueryBuilder('inbrm')
                .leftJoin('m_raw_material_ifm', 'rmifm', 'rmifm.rmifm_id = inbrm.rmifm_id')    
                .leftJoin('m_factory', 'fty', 'fty.fty_id = inbrm.fty_id')
                .leftJoin('m_warehouse', 'wh', 'wh.wh_id = inbrm.wh_id')
                .leftJoin('m_zone', 'zn', 'zn.zn_id = inbrm.zn_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = inbrm.loc_id')
                .leftJoin('m_unit','unit', 'unit.unit_id = rmifm.rmifm_product_unitId')
                .select([
                    "DATE_FORMAT(inbrm.create_date, '%d %b %y') AS formatted_date", // วันที่
                    "DATE_FORMAT(inbrm.create_date, '%H:%i:%s') AS create_time",    // เวลา
                    'rmifm.rmifm_id AS rmifm_id',
                    'rmifm.rmifm_code AS rmifm_code',
                    'rmifm.rmifm_name AS rmifm_name',
                    'rmifm.rmifm_width AS rmifm_width',
                    'rmifm.rmifm_length AS rmifm_length',
                    'rmifm.rmifm_thickness AS rmifm_thickness',
                    'rmifm.rmifm_weight AS rmifm_weight',
                    'inbrm.inbrm_grade AS inbrm_grade',
                    'inbrm.inbrm_lot AS inbrm_lot',
                    'inbrm.inbrm_id AS inbrm_id',
                    'inbrm.inbrm_code AS inbrm_code',
                    'fty.fty_name AS fty_name',
                    'wh.wh_name AS wh_name',
                    'zn.zn_name AS zn_name',
                    'loc.loc_name AS loc_name',
                    'inbrm.inbrm_quantity AS inbrm_quantity',
                    "DATE_FORMAT(NOW(), '%d %b %y') AS today_date",
                    'inbrm.inbrm_bom AS inbrm_bom',
                    'unit.unit_abbr_th AS unit_abbr_th'
                ])
                .where('inbrm.inbrm_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .andWhere('rmifm.rmifm_id = :rmifm_id', { rmifm_id }); // ใช้ค่า param ที่แปลงเป็นตัวเลขแล้ว
    
            const rawData = await query.getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.inbrm'));
            }            
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('item.inbrm'), rawData);
    
        } catch (error: any) {
            console.error('Error in getAllDetails:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(inbrm_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'InbRawMaterialService.getById';

        try {
            const repository = manager ? manager.getRepository(m_inb_raw_material) : this.inbRawmaterialRepository;

            // Query inbrm ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('inbrm')
                .leftJoin('m_factory', 'fty', 'fty.fty_id = inbrm.fty_id')
                .leftJoin('m_warehouse', 'wh', 'wh.wh_id = inbrm.wh_id')
                .leftJoin('m_zone', 'zn', 'zn.zn_id = inbrm.zn_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = inbrm.loc_id')
                .leftJoin('m_raw_material_ifm', 'rmifm', 'rmifm.rmifm_id = inbrm.rmifm_id')
                .leftJoin('m_raw_material', 'rm', 'rm.rm_id = rmifm.rm_id')
                .leftJoin('m_unit' , 'unit_product', 'unit_product.unit_id = rmifm.rmifm_product_unitId')
                .leftJoin('m_unit' , 'unit_width', 'unit_width.unit_id = rmifm.rmifm_width_unitId')
                .leftJoin('m_unit' , 'unit_length', 'unit_length.unit_id = rmifm.rmifm_length_unitId')
                .leftJoin('m_unit' , 'unit_thickness', 'unit_thickness.unit_id = rmifm.rmifm_thickness_unitId')
                .leftJoin('m_unit' , 'unit_weight', 'unit_weight.unit_id = rmifm.rmifm_weight_unitId')
                .leftJoin('m_criteria' , 'crt', 'crt.crt_id = rmifm.crt_id')
                .select([
                    'inbrm.*',
                    'rmifm.rmifm_code AS rmifm_code',
                    'rmifm.rmifm_name AS rmifm_name',
                    'rm.rm_type AS rm_type',
                    'fty.fty_name AS fty_name',
                    'wh.wh_name AS wh_name',
                    'zn.zn_name AS zn_name',
                    'loc.loc_name AS loc_name',
                    'rmifm.rmifm_product_unitId AS rmifm_product_unitId',
                    'unit_product.unit_abbr_th AS rmifm_product_name',
                    'rmifm.rmifm_width AS rmifm_width',
                    'unit_width.unit_abbr_th AS rmifm_width_unit_name',
                    'rmifm.rmifm_length AS rmifm_length',
                    'unit_length.unit_abbr_th AS rmifm_length_unit_name',
                    'rmifm.rmifm_thickness AS rmifm_thickness',
                    'unit_thickness.unit_abbr_th AS rmifm_thickness_unit_name',
                    'rmifm.rmifm_weight AS rmifm_weight',
                    'unit_weight.unit_abbr_th AS rmifm_weight_unit_name',
                    'crt.crt_id AS crt_id',
                    'crt.crt_exp_low AS crt_exp_low',
                    'crt.crt_exp_medium AS crt_exp_medium',
                    'crt.crt_exp_high AS crt_exp_high',
                    'crt.crt_rem_low AS crt_rem_low',
                    'crt.crt_rem_medium AS crt_rem_medium',
                    'crt.crt_rem_high AS crt_rem_high',
                ])
                .where('inbrm.inbrm_id = :inbrm_id', { inbrm_id })
                .andWhere('inbrm.inbrm_is_active = :isActive', { isActive: true }) 
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('inbrm.inbrm_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('inbrm.inbrm_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with inbrm_id: ${inbrm_id}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getBomByInbrmId(inbrm_id: number, manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'InbRawMaterialService.getBomByInbrmId';
    
        try {
            if (!inbrm_id) {
                return response.setIncomplete(lang.msgInvalidParameter());
            }
    
            const repository = manager ? manager.getRepository(m_inb_raw_material) : this.inbRawmaterialRepository;
    
            const queryBuilder = repository.createQueryBuilder("inbrm")
                .select(["inbrm.inbrm_bom AS inbrm_bom"])
                .where("inbrm.inbrm_id = :inbrm_id", { inbrm_id })
                .andWhere("inbrm.inbrm_is_active = :isActive", { isActive: true });
    
            const rawData = await queryBuilder.getRawOne();
    
            if (!rawData) {
                return response.setIncomplete(lang.msgNotFound('inbrm.inbrm_bom'));
            }
    
            return response.setComplete(lang.msgFound('inbrm.inbrm_bom'), rawData.inbrm_bom);
    
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getInbrmDropdown(isBomUsed?: string, inbrm_bom?: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'InbRawMaterialService.getInbrmDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_inb_raw_material) : this.inbRawmaterialRepository;
    
            const queryBuilder = repository.createQueryBuilder("inbrm")
                .select([
                    "inbrm.inbrm_id",
                    "inbrm.inbrm_code",
                    "rmifm.rmifm_name"
                ])
                .leftJoin("m_raw_material_ifm", "rmifm", "rmifm.rmifm_id = inbrm.rmifm_id")
                .where("inbrm.inbrm_is_active = :isActive", { isActive: true });
    
            // กรอง isBomUsed และ inbrm_bom
            if (isBomUsed !== undefined) {
                if (isBomUsed === 'true' || isBomUsed === 'false') {
                    queryBuilder.andWhere("inbrm.inbrm_is_bom_used = :isBomUsed", { isBomUsed: isBomUsed === 'true' });

                    // เฉพาะกรณี isBomUsed = true และมีค่า inbrm_bom ให้กรองเพิ่ม
                    if (isBomUsed === 'true' && inbrm_bom) {
                        queryBuilder.andWhere("inbrm.inbrm_bom = :inbrm_bom", { inbrm_bom });
                    }
                } else {
                    return response.setIncomplete(lang.msgInvalidParameter());
                }
            }
    
            const rawData = await queryBuilder.getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.inbrm'));
            }
    
            const data = rawData.map((rm) => new InbrmDropdownModel(
                rm.inbrm_inbrm_id,
                rm.inbrm_inbrm_code,
                rm.rmifm_rmifm_name ?? '' //ป้องกัน null ใน rmifm_name
            ));
    
            return response.setComplete(lang.msgFound('item.inbrm'), data);
    
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getBomDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'InbRawMaterialService.getBomDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_inb_raw_material) : this.inbRawmaterialRepository;
    
            const rawData = await repository.createQueryBuilder("inbrm")
                .select(["inbrm.inbrm_bom AS inbrm_bom"])
                .where("inbrm.inbrm_is_active = :isActive", { isActive: true })
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('inbrm.inbrm_bom'));
            }
    
            // กรองค่าที่ซ้ำกันและที่ไม่มีค่า (null, undefined, หรือ empty string)
            const uniqueBomSet = new Set<string>();
            const data = rawData
                .map(rm => rm.inbrm_bom)
                .filter(bom => bom && !uniqueBomSet.has(bom) && uniqueBomSet.add(bom)) // ใช้ Set กรองค่าซ้ำ
    
            // แปลงค่าที่ผ่านการกรองเป็นรูปแบบ { value, text }
            const dropdownData = data.map(bom => ({
                value: bom,
                text: bom
            }));
    
            return response.setComplete(lang.msgFound('inbrm.inbrm_bom'), dropdownData);
    
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getInventoryAll(
        manager?: EntityManager,
        ftyName?: string,
        whName?: string
    ): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'InbRawMaterialService.getInventoryAll';
    
        try {
            const repository = manager ? manager.getRepository(m_inb_raw_material) : this.inbRawmaterialRepository;
    
            let query = repository.createQueryBuilder('inbrm')
                .leftJoin("m_raw_material_ifm", "rmifm", "rmifm.rmifm_id = inbrm.rmifm_id")
                .leftJoin('m_factory', 'fty', 'fty.fty_id = inbrm.fty_id')
                .leftJoin('m_warehouse', 'wh', 'wh.wh_id = inbrm.wh_id')
                .select([
                    'inbrm.inbrm_id AS inbrm_id',
                    'inbrm.inbrm_code AS inbrm_code',
                    'rmifm.rmifm_name AS rmifm_name',
                    'inbrm.inbrm_quantity AS inbrm_quantity',
                    'inbrm.inbrm_lot AS inbrm_lot',
                    'fty.fty_name AS fty_name',
                    'wh.wh_name AS wh_name',
                ])
                .where('inbrm.inbrm_is_active = :isActive', { isActive: true })
    
            // Apply filtering if ftyName is provided
            if (ftyName && ftyName.trim() !== '') {
                query = query.andWhere('fty.fty_name LIKE :ftyName', { ftyName: `%${ftyName}%` });
            }
    
            // Apply filtering if whName is provided
            if (whName && whName.trim() !== '') {
                query = query.andWhere('wh.wh_name LIKE :whName', { whName: `%${whName}%` });
            }
    
            const rawData = await query.getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.inbrm'));
            }
    
            return response.setComplete(lang.msgFound('item.inbrm'), rawData);
        } catch (error: any) {
            console.error('Error during getInventoryAll:', error.message);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    
}