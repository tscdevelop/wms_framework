import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_zone } from '../entities/m_zone.entity';
import { m_warehouse } from '../entities/m_warehouse.entity';
import { ZoneModel } from '../models/zone.model';
import { ZnDropdownModel } from '../models/zone_dropdown.model';
import { m_factory } from '../entities/m_factory.entity';
import { deleteEntity } from '../utils/DatabaseUtils';

export class ZoneService {
    private zoneRepository: Repository<m_zone>;
    private warehouseRepository: Repository<m_warehouse>;
    private factoryRepository: Repository<m_factory>;

    constructor(){
        this.zoneRepository = AppDataSource.getRepository(m_zone);
        this.warehouseRepository = AppDataSource.getRepository(m_warehouse);
        this.factoryRepository = AppDataSource.getRepository(m_factory);
    }

    async create(data: Partial<ZoneModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<ZoneModel>();
        const operation = 'ZoneService.create';

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
            
            const repository = useManager.getRepository(m_zone);
            const warehouseRepository = useManager.getRepository(m_warehouse);
            const factoryRepository = useManager.getRepository(m_factory);

            // ตรวจสอบว่า fty_id มีอยู่ใน m_factory หรือไม่
            const existingFtyID = await factoryRepository.findOne({ where: { fty_id: data.fty_id } });
            if (!existingFtyID) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }

            // ตรวจสอบว่า wh_id มีอยู่ใน m_warehouse หรือไม่
            const existingWdID = await warehouseRepository.findOne({ where: { wh_id: data.wh_id } });
            if (!existingWdID) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_id'));
            }

            // Validate required data
            if (validate.isNullOrEmpty(data.fty_id)) {
                return response.setIncomplete(lang.msgRequired('factory.fty_id'));
            }   
            if (validate.isNullOrEmpty(data.wh_id)) {
                return response.setIncomplete(lang.msgRequired('warehouse.wh_id'));
            }            
            if (validate.isNullOrEmpty(data.zn_code)) {
                return response.setIncomplete(lang.msgRequired('zone.zn_code'));
            }
            if (validate.isNullOrEmpty(data.zn_name)) {
                return response.setIncomplete(lang.msgRequired('zone.zn_name'));
            }
            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            // ตรวจสอบว่า `zn_code` หรือ `zn_name` ที่ส่งมาใน `data` มีอยู่ในฐานข้อมูลหรือไม่
            const existingZone = await repository
                .createQueryBuilder('zone')
                .where('zone.zn_code = :zn_code OR zone.zn_name = :zn_name', { 
                    zn_code: data.zn_code, 
                    zn_name: data.zn_name })
                .getOne();

            // ตรวจสอบว่าพบข้อมูลในฐานข้อมูลหรือไม่
            if (existingZone) {
                if (existingZone.zn_code === data.zn_code) {
                    return response.setIncomplete(lang.msgAlreadyExists('zone.zn_code'));
                }
                if (existingZone.zn_name === data.zn_name) {
                    return response.setIncomplete(lang.msgAlreadyExists('zone.zn_name'));
                }
            }

            // สร้าง instance ของ entity (m_zone) ที่พร้อมสำหรับการบันทึก
            const newZone = repository.create({
                ...data,
                zn_is_active: data.zn_is_active ?? true, // ถ้า is_active เป็น null หรือ undefined จะใช้ true
                create_date: new Date(),
                fty_id: existingFtyID.fty_id,
                wh_id: existingWdID.wh_id
            });

            // บันทึก entity (zn) ลงฐานข้อมูล
            const savedData = await repository.save(newZone);

             // Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete(lang.msgSuccessAction('created', 'item.zone'), savedData);

        } catch (error: any) {
            // Rollback เมื่อเกิด Error
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`Error during ${operation}:`, error);

            // จัดการ Error จากฐานข้อมูล
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));

        } finally {
            // ปิด QueryRunner
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async update(
        zn_id: number,
        data: Partial<ZoneModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<ZoneModel>();
        const operation = 'ZoneService.update';
    
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
            const repository = manager ? useManager.getRepository(m_zone) : this.zoneRepository;
            const warehouseRepository = manager ? useManager.getRepository(m_warehouse) : this.warehouseRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory): this.factoryRepository;

            // ตรวจสอบว่ามี zn_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingZn = await repository.findOne({ where: { zn_id: zn_id } });
            if (!existingZn) {
                return response.setIncomplete(lang.msgNotFound('zone.zn_id'));
            }

            // ตรวจสอบว่า fty_id มีอยู่ใน m_factory หรือไม่
            const existingFtyID = await factoryRepository.findOne({ where: { fty_id: data.fty_id } });
            if (!existingFtyID) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }

            // ตรวจสอบว่า wh_id มีอยู่ใน m_warehouse หรือไม่
            const existingWdID = await warehouseRepository.findOne({ where: { wh_id: Number(data.wh_id) } });
            if (!existingWdID) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_id'));
            }

            // ตรวจสอบค่าที่จำเป็น      
            if (validate.isNullOrEmpty(data.fty_id)) {
                return response.setIncomplete(lang.msgRequired('factory.fty_id'));
            }        
            if (validate.isNullOrEmpty(data.wh_id)) {
                return response.setIncomplete(lang.msgRequired('warehouse.wh_id'));
            }
            if (validate.isNullOrEmpty(data.zn_code)) {
                return response.setIncomplete(lang.msgRequired('zone.zn_code'));
            }
            if (validate.isNullOrEmpty(data.zn_name)) {
                return response.setIncomplete(lang.msgRequired('zone.zn_name'));
            }

            // ตรวจสอบว่า zn_code ไม่ซ้ำ
            if (data.zn_code && data.zn_code !== existingZn.zn_code) {
                const duplicateCode = await repository.findOne({
                    where: { zn_code: data.zn_code, zn_id: Not(existingZn.zn_id) },
                });
                if (duplicateCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('zone.zn_code'));
                }
            }

            // ตรวจสอบว่า zn_name ไม่ซ้ำ
            if (data.zn_name && data.zn_name !== existingZn.zn_name) {
                const duplicateName = await repository.findOne({
                    where: { zn_name: data.zn_name, zn_id: Not(existingZn.zn_id) },
                });
                if (duplicateName) {
                    return response.setIncomplete(lang.msgAlreadyExists('zone.zn_name'));
                }
            }

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existingZn, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
                fty_id: existingFtyID.fty_id,
                wh_id: existingWdID.wh_id
            });
    
            await repository.save(existingZn);

            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(zn_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }

            response = response.setComplete(lang.msgSuccessAction('updated', 'item.zone'), dataResponse.data);

            // Commit Transaction
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
    
            // จัดการ Business Error (Validation, Constraint)
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            // จัดการ Critical Error (DB ล่ม, ระบบล้มเหลว)
            throw new Error(lang.msgErrorFunction(operation, error.message));
    
        } finally {
            // ปิดการใช้งาน QueryRunner
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async delete(zn_id: number, reqUsername: string,  manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'ZoneService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_zone) : this.zoneRepository;

            // ตรวจสอบว่ามี zn_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingZn = await repository.findOne({ where: { zn_id: zn_id } });
            if (!existingZn) {
                return response.setIncomplete(lang.msgNotFound('zone.zn_id'));
            }

            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, zn_id, reqUsername, 'zn_is_active', 'zn_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
            
            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.zone'));
    
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
    
            // จัดการ Critical Error (DB ล่ม, ระบบล้มเหลว)
            throw new Error(lang.msgErrorFunction(operation, error.message));
    
        } finally {
            // ปิดการใช้งาน QueryRunner
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    
    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'ZoneService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_zone) : this.zoneRepository;
    
            // Query zone ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('zone')
                .leftJoin('m_factory', 'fty', 'zone.fty_id = fty.fty_id')
                .leftJoin('m_warehouse', 'wh', 'zone.wh_id = wh.wh_id')
                .select([
                    'zone.zn_id AS zn_id',
                    'fty.fty_id AS fty_id',
                    'fty.fty_name AS fty_name',
                    'wh.wh_id AS wh_id',
                    'wh.wh_name AS wh_name',
                    'zone.zn_code AS zn_code',
                    'zone.zn_name AS zn_name',
                    'zone.zn_remark AS zn_remark',
                    'zone.create_date AS create_date',
                    'zone.create_by AS create_by',
                    'zone.update_date AS update_date',
                    'zone.update_by AS update_by',
                    'zone.zn_is_active AS zn_is_active'
                ])
                .where('zone.zn_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.zone'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.zone'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
    
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(zn_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'ZoneService.getById';

        try {
            const repository = manager ? manager.getRepository(m_zone) : this.zoneRepository;
    
            // Query zone ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('zone')
                .select([
                    'zone.zn_id AS zn_id',
                    'zone.fty_id AS fty_id',
                    'zone.wh_id AS wh_id',
                    'zone.zn_code AS zn_code',
                    'zone.zn_name AS zn_name',
                    'zone.zn_remark AS zn_remark',
                    'zone.create_date AS create_date',
                    'zone.create_by AS create_by',
                    'zone.update_date AS update_date',
                    'zone.update_by AS update_by',
                    'zone.zn_is_active AS zn_is_active'
                ])
                .where('zone.zn_id = :zn_id', { zn_id })
                .andWhere('zone.zn_is_active = :isActive', { isActive: true }) // ดึงเฉพาะข้อมูลที่ยังไม่ถูกลบ
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('zone.zn_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('zone.zn_id'), rawData);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error.message);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getZnDropdown(wh_id: number, manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'ZoneService.getZnDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_zone) : this.zoneRepository;
    
            // ดึงข้อมูลทั้ง zn_id และ zn_name
            const rawData = await repository.createQueryBuilder("zone")
                .select(["zone.zn_id", "zone.zn_name"])
                .where("zone.wh_id = :wh_id", { wh_id }) // เพิ่มเงื่อนไข wh_id
                .andWhere("zone.zn_name IS NOT NULL") // กรองค่า null ออก
                .andWhere('zone.zn_is_active = :isActive', { isActive: true }) // ดึงเฉพาะข้อมูลที่ยังไม่ถูกลบ
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.zone'));
            }
    
            console.log('rawData:', rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ ZnDropdownModel
            const data = rawData.map((zn) => new ZnDropdownModel(zn.zone_zn_id, zn.zone_zn_name));
    
            return response.setComplete(lang.msgFound('item.zone'), data);
    
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error.message);
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
        const operation = 'ZoneService.createJson';
    
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
            const repository = useManager.getRepository(m_zone);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_zone> = {
                'รหัสZone': 'zn_code',
                'ชื่อZone': 'zn_name',
                'โรงงาน': 'fty_id',
                'คลัง': 'wh_id',
                'หมายเหตุ': 'zn_remark',
            };
    
            console.log('📌 Raw JSON Data:', data);
    
    /* Map ชื่อโรงงานเป็น ID */
            // ✅ ดึงรายชื่อโรงงานทั้งหมดจาก DB
            const factories = await this.factoryRepository.find(); // ดึงทั้งหมด

            // ✅ สร้าง Map: 'ชื่อโรงงาน' => fty_id
            const factoryMap = new Map(factories.map(f => [f.fty_name?.trim(), f.fty_id]));

    /* Map ชื่อคลังเป็น ID */
            // ✅ ดึงรายชื่อคลังทั้งหมดจาก DB
            const warehouses = await this.warehouseRepository.find();

            // ✅ สร้าง Map: 'ชื่อคลัง' => wh_id
            const warehouseMap = new Map(warehouses.map(w => [w.wh_name?.trim(), w.wh_id]));

    /* แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล */
            const formattedData: Partial<m_zone>[] = data.map((row: any, index) => {
                // สร้างอ็อบเจ็กต์ว่างสำหรับแต่ละแถว
                const mappedRow: Partial<m_zone> = {};

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
            // กรณีเป็นฟิลด์ 'โรงงาน' → ต้อง map ชื่อโรงงานเป็น fty_id
                    else if (dbField === 'wh_id') {
                        const warehouseName = row[jsonKey]?.trim();
                        const warehouseId = warehouseMap.get(warehouseName);
                        mappedRow.wh_id = warehouseId ?? undefined;
                    }
                    // ฟิลด์ทั่วไป เช่น zn_code, zn_name, zn_remark
                    else if (dbField) {
                        mappedRow[dbField] = row[jsonKey] !== '' ? row[jsonKey] : null; // แปลง "" เป็น null
                    }
                });

                // ✅ กำหนดค่าเริ่มต้นเพิ่มเติม
                mappedRow.zn_is_active = mappedRow.zn_is_active ?? true;       // ถ้ายังไม่กำหนด ให้ default = true
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
                if (validate.isNullOrEmpty(item.zn_code)) {
                    return response.setIncomplete(lang.msgRequired('zone.zn_code'));
                }
                if (validate.isNullOrEmpty(item.zn_name)) {
                    return response.setIncomplete(lang.msgRequired('zone.zn_name'));
                }
            }
            
    /* ตรวจชื่อโรงงานที่ไม่พบ (fty_id = undefined) */
            const notFoundFactories = formattedData.filter(z => !z.fty_id);
            if (notFoundFactories.length > 0) {
                return response.setIncomplete(
                    `พบชื่อโรงงานที่ไม่ตรงกับระบบ ${notFoundFactories.length} รายการ: ` +
                    notFoundFactories.map(e => `${e.zn_code} (${e.zn_name})`).join(', ')
                );
            }
    
    /* ตรวจชื่อคลังที่ไม่พบ (wh_id = undefined) */
            const notFoundWarehouses = formattedData.filter(z => !z.wh_id);
            if (notFoundWarehouses.length > 0) {
                return response.setIncomplete(
                    `พบชื่อคลังที่ไม่ตรงกับระบบ ${notFoundWarehouses.length} รายการ: ` +
                    notFoundWarehouses.map(e => `${e.zn_code} (${e.zn_name})`).join(', ')
                );
            }

    /* ตรวจสอบความสัมพันธ์ระหว่าง fty_id และ wh_id */
            const invalidFactoryWarehousePairs = formattedData.filter(item => {
                // หาคลังที่ตรงกับ wh_id
                const warehouse = warehouses.find(w => w.wh_id === item.wh_id);
                // ถ้าไม่พบคลัง หรือ fty_id ไม่ตรงกับของใน warehouse table → ผิด
                return !warehouse || warehouse.fty_id !== item.fty_id;
            });

            if (invalidFactoryWarehousePairs.length > 0) {
                return response.setIncomplete(
                    `พบความไม่สัมพันธ์ระหว่างโรงงานและคลัง ${invalidFactoryWarehousePairs.length} รายการ: ` +
                    invalidFactoryWarehousePairs.map(e => `${e.zn_code} (${e.zn_name})`).join(', ')
                );
            }

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_zone>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.zn_code);
                const isNameDuplicate = seenNames.has(s.zn_name);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.zn_code);
                    seenNames.add(s.zn_name);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.zn_code} (${e.zn_name})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueZones
            const uniqueZones = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `zn_code` และ `zn_name` ใน database
            const existingZones = await repository
                .createQueryBuilder('zn')
                .where('zn.zn_code IN (:...codes) OR zn.zn_name IN (:...names)', {
                    codes: uniqueZones.map((s) => s.zn_code).filter(Boolean),
                    names: uniqueZones.map((s) => s.zn_name).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueZones) ที่ซ้ำกับข้อมูลในระบบ (existingZones)
            const duplicateInInput = uniqueZones.filter((s) =>
                existingZones.some((ex) =>
                    ex.zn_code === s.zn_code || ex.zn_name === s.zn_name
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.zn_code} (${e.zn_name})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedZones = await repository.save(uniqueZones);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.zone'), savedZones);
    
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