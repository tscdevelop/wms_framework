import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_warehouse } from '../entities/m_warehouse.entity';
import { WarehouseModel } from '../models/warehouse.model';
import { WhDropdownModel } from '../models/warehouse_dropdown.model';
import { m_factory } from '../entities/m_factory.entity';
import { WarehouseType } from '../common/global.enum';
import { deleteEntity } from '../utils/DatabaseUtils';
import { m_inb_raw_material } from '../entities/m_inb_raw_material.entity';
import { m_inb_finished_goods } from '../entities/m_inb_finished_goods.entity';
import { m_inb_semi } from '../entities/m_inb_semi.entity';
import { m_inb_tooling } from '../entities/m_inb_tooling.entity';

export class WarehouseService {
    private warehouseRepository: Repository<m_warehouse>;
    private factoryRepository: Repository<m_factory>;

    constructor(){
        this.warehouseRepository = AppDataSource.getRepository(m_warehouse);
        this.factoryRepository = AppDataSource.getRepository(m_factory);
    }

    async create(data: Partial<WarehouseModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<WarehouseModel>();
        const operation = 'WarehouseService.create';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        // ตรวจสอบ EntityManager หรือ QueryRunner
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        // เริ่ม Transaction หากไม่มี Manager
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const repository = manager ? useManager.getRepository(m_warehouse): this.warehouseRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory): this.factoryRepository;
    
            // ตรวจสอบว่า fty_id มีอยู่ใน m_factory หรือไม่
            const existingFtyID = await factoryRepository.findOne({ where: { fty_id: Number(data.fty_id) } });
            if (!existingFtyID) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }
    
            // ตรวจสอบข้อมูลที่จำเป็น
            if (validate.isNullOrEmpty(data.fty_id)) {
                return response.setIncomplete(lang.msgRequired('factory.fty_id'));
            }
            if (validate.isNullOrEmpty(data.wh_code)) {
                return response.setIncomplete(lang.msgRequired('warehouse.wh_code'));
            }
            if (validate.isNullOrEmpty(data.wh_name)) {
                return response.setIncomplete(lang.msgRequired('warehouse.wh_name'));
            }
            if (validate.isNullOrEmpty(reqUsername)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }
    
            // ตรวจสอบข้อมูลซ้ำ wh_code และ wh_name
            const existingWh = await repository
                .createQueryBuilder('wh')
                .where('wh.wh_code = :wh_code OR wh.wh_name = :wh_name', { 
                    wh_code: data.wh_code, 
                    wh_name: data.wh_name 
                })
                .getOne();
    
            if (existingWh) {
                return response.setIncomplete(
                    existingWh.wh_code === data.wh_code
                        ? lang.msgAlreadyExists('warehouse.wh_code')
                        : lang.msgAlreadyExists('warehouse.wh_name')
                );
            }
    
            // ตรวจสอบว่า wh_type มีค่าตาม enum หรือไม่
            if (!data.wh_type || !Object.values(WarehouseType).includes(data.wh_type as WarehouseType)) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_type') + `: ${Object.values(WarehouseType).join(', ')}`);
            }
    
            // สร้างและบันทึกข้อมูล
            const newWarehouse = repository.create({
                ...data,
                wh_is_active: data.wh_is_active ?? true,
                create_date: new Date(),
                create_by: reqUsername,
                fty_id: existingFtyID.fty_id
            });
    
            const savedData = await repository.save(newWarehouse);
    
            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.warehouse'), savedData);
    
        } catch (error: any) {
            // Rollback เมื่อเกิด Error
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`Error during ${operation}:`, error);
    
            // จัดการ Business Error
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            // จัดการ Critical Error
            throw new Error(lang.msgErrorFunction(operation, error.message));
    
        } finally {
            // ปิดการใช้งาน QueryRunner
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    
    async update(
        wh_id: number,
        data: Partial<WarehouseModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<WarehouseModel>();
        const operation = 'WarehouseService.update';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        // ตรวจสอบว่า EntityManager พร้อมใช้งานหรือไม่
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const repository = manager ? useManager.getRepository(m_warehouse): this.warehouseRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory): this.factoryRepository;
    
            // ตรวจสอบข้อมูลที่จำเป็นก่อน Query
            if (validate.isNullOrEmpty(data.fty_id)) {
                return response.setIncomplete(lang.msgRequired('factory.fty_id'));
            }
            if (validate.isNullOrEmpty(data.wh_code)) {
                return response.setIncomplete(lang.msgRequired('warehouse.wh_code'));
            }
            if (validate.isNullOrEmpty(data.wh_name)) {
                return response.setIncomplete(lang.msgRequired('warehouse.wh_name'));
            }
    
            // ตรวจสอบว่า wh_id มีอยู่หรือไม่
            const existingWh = await repository.findOne({ where: { wh_id } });
            if (!existingWh) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_id'));
            }
    
            // ตรวจสอบว่า fty_id มีอยู่หรือไม่
            const existingFtyID = await factoryRepository.findOne({ where: { fty_id: Number(data.fty_id) } });
            if (!existingFtyID) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }
    
            // ตรวจสอบว่า wh_code และ wh_name ไม่ซ้ำ
            if (data.wh_code && data.wh_code !== existingWh.wh_code) {
                const duplicateCode = await repository.findOne({
                    where: { wh_code: data.wh_code, wh_id: Not(existingWh.wh_id) },
                });
                if (duplicateCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('warehouse.wh_code'));
                }
            }
    
            if (data.wh_name && data.wh_name !== existingWh.wh_name) {
                const duplicateName = await repository.findOne({
                    where: { wh_name: data.wh_name, wh_id: Not(existingWh.wh_id) },
                });
                if (duplicateName) {
                    return response.setIncomplete(lang.msgAlreadyExists('warehouse.wh_name'));
                }
            }
    
            // ตรวจสอบว่า wh_type ถูกต้อง
            if (!data.wh_type || !Object.values(WarehouseType).includes(data.wh_type as WarehouseType)) {
                return response.setIncomplete(
                    lang.msgNotFound(`warehouse.wh_type: ${Object.values(WarehouseType).join(', ')}`)
                );
            }
    
            // อัปเดตข้อมูล
            Object.assign(existingWh, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
                fty_id: existingFtyID.fty_id,
            });
    
            // บันทึกข้อมูล
            await repository.save(existingWh);
    
            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(wh_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }

            // ส่งข้อมูลกลับ
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.warehouse'), dataResponse.data);
    
             // Commit Transaction ก่อนดึงข้อมูล
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response;

        } catch (error: any) {
            // Rollback เมื่อเกิด Error
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`Error during ${operation}:`, error);
    
            // จัดการ Error อย่างเหมาะสม
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
    
        } finally {
            // ปิด QueryRunner ทุกกรณี
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    
    async delete(wh_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'WarehouseService.delete';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        // ตรวจสอบว่า EntityManager พร้อมใช้งานหรือไม่
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const repository = useManager.getRepository(m_warehouse);
    
            // ตรวจสอบว่า wh_id มีอยู่หรือไม่
            const existingWh = await repository.findOne({ where: { wh_id } });
            if (!existingWh) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_id'));
            }
    
            // ✅ ตรวจสอบว่ายังมีสินค้าอยู่หรือไม่ โดยใช้ `EXISTS()`
            const hasStock = await useManager
                .createQueryBuilder()
                .select('1')
                .from(m_warehouse, 'wh')
                .leftJoin(m_inb_raw_material, 'inbrm', 'inbrm.wh_id = wh.wh_id')
                .leftJoin(m_inb_finished_goods, 'inbfg', 'inbfg.wh_id = wh.wh_id')
                .leftJoin(m_inb_semi, 'inbsemi', 'inbsemi.wh_id = wh.wh_id')
                .leftJoin(m_inb_tooling, 'inbtl', 'inbtl.wh_id = wh.wh_id')
                .where('wh.wh_id = :wh_id', { wh_id })
                .andWhere(`
                    COALESCE(inbrm.inbrm_quantity, 0) +
                    COALESCE(inbfg.inbfg_quantity, 0) +
                    COALESCE(inbsemi.inbsemi_quantity, 0) +
                    COALESCE(inbtl.inbtl_quantity, 0) > 0
                `)
                .limit(1) // ถ้ามีสินค้าแม้แต่ 1 รายการ ให้หยุดตรวจสอบ
                .getRawOne();

            if (hasStock) {
                return response.setIncomplete(lang.msg('field.cannot_delete_has_stock'));
            }
            
            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, wh_id, reqUsername, 'wh_is_active', 'wh_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
            
            // Commit Transaction ก่อนส่ง Response
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง Response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.warehouse'));
    
        } catch (error: any) {
            // Rollback เมื่อเกิด Error
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`Error during ${operation}:`, error);
    
            // จัดการ Business Error (Validation, Constraint)
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            // กรณี Critical Error (DB ล่ม)
            throw new Error(lang.msgErrorFunction(operation, error.message));
    
        } finally {
            // ปิด QueryRunner ทุกกรณี
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    
    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'WarehouseService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_warehouse) : this.warehouseRepository;
        //    // ✅ บังคับใช้ PRIMARY Connection เพื่อเลี่ยง Read Replica Delay
        //    await repository.query('SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;');

            // Query warehouse ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('warehouse')
                .leftJoin('m_factory', 'factory', 'warehouse.fty_id = factory.fty_id')
                .select([
                    'warehouse.wh_id AS wh_id',
                    'factory.fty_id AS fty_id',
                    'factory.fty_name AS fty_name',
                    'warehouse.wh_code AS wh_code',
                    'warehouse.wh_name AS wh_name',
                    'warehouse.wh_type AS wh_type',
                    'warehouse.create_date AS create_date',
                    'warehouse.create_by AS create_by',
                    'warehouse.update_date AS update_date',
                    'warehouse.update_by AS update_by',
                    'warehouse.wh_is_active AS wh_is_active'
                ])
                .where('warehouse.wh_is_active = :isActive', { isActive: true }) // ดึงเฉพาะข้อมูลที่ยังไม่ถูกลบ
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.warehouse'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.warehouse'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
    
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getById(wh_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'WarehouseService.getById';

        try {
            const repository = manager ? manager.getRepository(m_warehouse) : this.warehouseRepository;
    
            // Query warehouse ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('warehouse')
                .select([
                    'warehouse.wh_id AS wh_id',
                    'warehouse.fty_id AS fty_id',
                    'warehouse.wh_code AS wh_code',
                    'warehouse.wh_name AS wh_name',
                    'warehouse.wh_type AS wh_type',
                    'warehouse.create_date AS create_date',
                    'warehouse.create_by AS create_by',
                    'warehouse.update_date AS update_date',
                    'warehouse.update_by AS update_by',
                    'warehouse.wh_is_active AS wh_is_active'
                ])
                .where('warehouse.wh_id = :wh_id', { wh_id })
                .andWhere('warehouse.wh_is_active = :isActive', { isActive: true }) // ดึงเฉพาะข้อมูลที่ยังไม่ถูกลบ
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('warehouse.wh_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with wh_id: ${wh_id}`, error);
    
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getWhDropdown(fty_id: number,manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'WarehouseService.getWhDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_warehouse) : this.warehouseRepository;
    
            // ดึงข้อมูล warehouse ที่ตรงกับ fty_id
            const rawData = await repository.createQueryBuilder("warehouse")
            .select(["warehouse.wh_id", "warehouse.wh_name"])
            .where("warehouse.fty_id = :fty_id", { fty_id }) // กรองตาม fty_id
            .andWhere("warehouse.wh_name IS NOT NULL") // กรองค่า null ออก
            .andWhere('warehouse.wh_is_active = :isActive', { isActive: true }) // ดึงเฉพาะข้อมูลที่ยังไม่ถูกลบ
            .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
            .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.warehouse'));
            }
    
            console.log('rawData:', rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ WhDropdownModel
            const data = rawData.map((wh) => new WhDropdownModel(wh.warehouse_wh_id,wh.warehouse_wh_name));
        
            return response.setComplete(lang.msgFound('item.warehouse'), data);
    
        } catch (error: any) {
            console.error('Error during getWhDropdown:', error.message);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getWhDropdownByFtyId(user_id: number, fty_id: number, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'WarehouseService.getWhDropdownByFtyId';
    
        try {
            const queryRunner = manager ?? this.warehouseRepository.manager;
    
            const rawData = await queryRunner.query(`
                SELECT DISTINCT w.wh_id, w.wh_name
                FROM s_user_permis_factory upf
                INNER JOIN s_user_permis_warehouse upw ON upw.upf_id = upf.upf_id
                INNER JOIN m_warehouse w ON w.wh_id = upw.wh_id
                WHERE upf.user_id = ? AND upf.fty_id = ? AND w.wh_is_active = 1
            `, [user_id, fty_id]);
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.warehouse'));
            }
    
            const data = rawData.map(
                (wh: any) => new WhDropdownModel(wh.wh_id, wh.wh_name)
            );
    
            return response.setComplete(lang.msgFound('item.warehouse'), data);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error.message);
    
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    

    async getWhTypeDropdown(): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'WarehouseService.getWhTypeDropdown';
    
        try {
            // สร้างข้อมูลจาก WarehouseType Enum
            const rawData = Object.values(WarehouseType).map((type) => ({
                value: type,
                text: type.replace(/_/g, ' ').toLowerCase(),  // แปลง RAW_MATERIAL เป็น raw material
            }));
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_type'));
            }
    
            console.log('Dropdown Data:', rawData);  // Debug ตรวจสอบข้อมูล
    
            return response.setComplete(lang.msgFound('warehouse.wh_type'), rawData);
    
        } catch (error: any) {
            console.error('Error during getWhTypeDropdown:', error.message);
    
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async createJson(
        data: any[], 
        reqUsername: string, 
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'WarehouseService.createJson';
    
        // ✅ ใช้ `QueryRunner` เพื่อรองรับ Transaction
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
            const repository = useManager.getRepository(m_warehouse);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_warehouse> = {
                'รหัสคลัง': 'wh_code',
                'ชื่อคลัง': 'wh_name',
                'ประเภทคลัง': 'wh_type',
                'โรงงาน': 'fty_id'
            };
    
            console.log('📌 Raw JSON Data:', data);
    
    /* Map ชื่อโรงงานเป็น ID */
            // ✅ ดึงรายชื่อโรงงานทั้งหมดจาก DB
            const factories = await this.factoryRepository.find(); // ดึงทั้งหมด

            // ✅ สร้าง Map: 'ชื่อโรงงาน' => fty_id
            const factoryMap = new Map(factories.map(f => [f.fty_name?.trim(), f.fty_id]));

            // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล
            const formattedData: Partial<m_warehouse>[] = data.map((row: any, index) => {
                // สร้างอ็อบเจ็กต์ว่างสำหรับแต่ละแถว
                const mappedRow: Partial<m_warehouse> = {};

                // Loop เพื่อ map ฟิลด์จาก JSON → ฟิลด์ของ Entity
                Object.keys(row).forEach((jsonKey) => {
                    // แปลงชื่อคอลัมน์จาก Excel เป็นชื่อ field ในฐานข้อมูล
                    const dbField = fieldMapping[jsonKey];

                    // กรณีเป็นฟิลด์ 'โรงงาน' → ต้อง map ชื่อโรงงานเป็น fty_id
                    if (dbField === 'fty_id') {
                        const factoryName = row[jsonKey]?.trim();                // ตัดช่องว่างชื่อโรงงาน
                        const factoryId = factoryMap.get(factoryName);           // หาค่า fty_id จากชื่อโรงงาน
                        mappedRow.fty_id = factoryId ?? undefined;               // ถ้าไม่เจอให้เป็น undefined
                    }
                    // ฟิลด์ทั่วไป เช่น wh_code, wh_name, wh_type
                    else if (dbField) {
                        mappedRow[dbField] = row[jsonKey] !== '' ? row[jsonKey] : null; // แปลง "" เป็น null
                    }
                });

                // ✅ กำหนดค่าเริ่มต้นเพิ่มเติม
                mappedRow.wh_is_active = mappedRow.wh_is_active ?? true;       // ถ้ายังไม่กำหนด ให้ default = true
                mappedRow.create_date = new Date();                             // วันที่สร้าง = ปัจจุบัน
                mappedRow.create_by = reqUsername;                              // ผู้ใช้ที่ import

                // แสดง log ของแต่ละแถวที่แปลงเสร็จ
                console.log(`📌 Mapped Row ${index + 1}:`, mappedRow);

                // คืนค่าแถวนี้เข้าสู่ formattedData[]
                return mappedRow;
            });
    
            console.log("formattedData",formattedData)
            // ✅ ตรวจสอบข้อมูลที่จำเป็น
            for (const item of formattedData) {
                if (validate.isNullOrEmpty(item.wh_code)) {
                    return response.setIncomplete(lang.msgRequired('warehouse.wh_code'));
                }
                if (validate.isNullOrEmpty(item.wh_name)) {
                    return response.setIncomplete(lang.msgRequired('warehouse.wh_name'));
                }
            }

            // ✅ ตรวจชื่อประเภทคลัง
            const invalidWhTypeItems = formattedData.filter(
                w => !Object.values(WarehouseType).includes(w.wh_type as WarehouseType)
            );
            if (invalidWhTypeItems.length > 0) {
                return response.setIncomplete(
                `พบประเภทคลังไม่ถูกต้อง ${invalidWhTypeItems.length} รายการ: ` +
                invalidWhTypeItems.map(w => `${w.wh_code} (${w.wh_type})`).join(', ') +
                ` ประเภทคลังที่รองรับ: ${Object.values(WarehouseType).join(', ')}`
                );
            }
            
            // ✅ ตรวจชื่อโรงงานที่ไม่พบ (fty_id = undefined)
            const notFoundFactories = formattedData.filter(w => !w.fty_id);
            if (notFoundFactories.length > 0) {
                return response.setIncomplete(
                    `พบชื่อโรงงานที่ไม่ตรงกับระบบ ${notFoundFactories.length} รายการ: ` +
                    notFoundFactories.map(e => `${e.wh_code} (${e.wh_name})`).join(', ')
                );
            }

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_warehouse>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.wh_code);
                const isNameDuplicate = seenNames.has(s.wh_name);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.wh_code);
                    seenNames.add(s.wh_name);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.wh_code} (${e.wh_name})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueWarehouses
            const uniqueWarehouses = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `wh_code` และ `wh_name` ใน database
            const existingWarehouses = await repository
                .createQueryBuilder('wh')
                .where('wh.wh_code IN (:...codes) OR wh.wh_name IN (:...names)', {
                    codes: uniqueWarehouses.map((s) => s.wh_code).filter(Boolean),
                    names: uniqueWarehouses.map((s) => s.wh_name).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueWarehouses) ที่ซ้ำกับข้อมูลในระบบ (existingWarehouses)
            const duplicateInInput = uniqueWarehouses.filter((s) =>
                existingWarehouses.some((ex) =>
                    ex.wh_code === s.wh_code || ex.wh_name === s.wh_name
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.wh_code} (${e.wh_name})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedWarehouses = await repository.save(uniqueWarehouses);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.warehouse'), savedWarehouses);
    
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`❌ Error in ${operation}:`, error);
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    
}