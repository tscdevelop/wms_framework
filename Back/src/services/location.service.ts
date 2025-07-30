import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_location } from '../entities/m_location.entity';
import { m_zone } from '../entities/m_zone.entity';
import { LocationModel } from '../models/location.model';
import { LocDropdownModel } from '../models/location_dropdown.model';
import { m_factory } from '../entities/m_factory.entity';
import { m_warehouse } from '../entities/m_warehouse.entity';
import { deleteEntity } from '../utils/DatabaseUtils';

export class LocationService {
    private locationRepository: Repository<m_location>;
    private zoneRepository: Repository<m_zone>;
    private warehouseRepository: Repository<m_warehouse>;
    private factoryRepository: Repository<m_factory>;

    constructor(){
        this.locationRepository = AppDataSource.getRepository(m_location);
        this.zoneRepository = AppDataSource.getRepository(m_zone);
        this.warehouseRepository = AppDataSource.getRepository(m_warehouse);
        this.factoryRepository = AppDataSource.getRepository(m_factory);
    }

    async create(data: Partial<LocationModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<LocationModel>();
        const operation = 'LocationService.create';
    
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
            
            const repository = manager ? useManager.getRepository(m_location) : this.locationRepository;
            const zoneRepository = manager ? useManager.getRepository(m_zone) : this.zoneRepository;
            const warehouseRepository = manager ? useManager.getRepository(m_warehouse) : this.warehouseRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory): this.factoryRepository;

            // Validate required data
            if (validate.isNullOrEmpty(data.fty_id)) {
                return response.setIncomplete(lang.msgRequired('factory.fty_id'));
            }        
            if (validate.isNullOrEmpty(data.wh_id)) {
                return response.setIncomplete(lang.msgRequired('warehouse.wh_id'));
            }
            if (validate.isNullOrEmpty(data.zn_id)) {
                return response.setIncomplete(lang.msgRequired('zone.zn_id'));
            }            
            if (validate.isNullOrEmpty(data.loc_code)) {
                return response.setIncomplete(lang.msgRequired('location.loc_code'));
            }
            if (validate.isNullOrEmpty(data.loc_name)) {
                return response.setIncomplete(lang.msgRequired('location.loc_name'));
            }
            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            // ตรวจสอบ fty_id, wh_id, zn_id
            const [existingFty, existingWh, existingZn] = await Promise.all([
                factoryRepository.findOne({ where: { fty_id: data.fty_id } }),
                warehouseRepository.findOne({ where: { wh_id: data.wh_id } }),
                zoneRepository.findOne({ where: { zn_id: Number(data.zn_id) } }),
            ]);

            if (!existingFty) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }
            if (!existingWh) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_id'));
            }
            if (!existingZn) {
                return response.setIncomplete(lang.msgNotFound('zone.zn_id'));
            }

            // ตรวจสอบว่า `loc_code` หรือ `loc_name` ที่ส่งมาใน `data` มีอยู่ในฐานข้อมูลหรือไม่
            const existingLoc = await repository
                .createQueryBuilder('location')
                .where('location.loc_code = :loc_code OR location.loc_name = :loc_name', { 
                    loc_code: data.loc_code, 
                    loc_name: data.loc_name })
                .getOne();

            // ตรวจสอบว่าพบข้อมูลในฐานข้อมูลหรือไม่
            if (existingLoc) {
                return response.setIncomplete(
                    existingLoc.loc_code === data.loc_code
                        ? lang.msgAlreadyExists('location.loc_code')
                        : lang.msgAlreadyExists('location.loc_name')
                );
            }

            // สร้างข้อมูลใหม่
            const newLocation = repository.create({
                ...data,
                loc_is_active: data.loc_is_active ?? true,
                create_date: new Date(),
                create_by: reqUsername,
                fty_id: existingFty.fty_id,
                wh_id: existingWh.wh_id,
                zn_id: existingZn.zn_id,
            });

            const savedData = await repository.save(newLocation);

            // Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }            

            return response.setComplete(lang.msgSuccessAction('created', 'item.location'), savedData);

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

    async update(
        loc_id: number,
        data: Partial<LocationModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<LocationModel>();
        const operation = 'LocationService.update';
    
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

            const repository = manager ? useManager.getRepository(m_location) : this.locationRepository;
            const zoneRepository = manager ? useManager.getRepository(m_zone) : this.zoneRepository;
            const warehouseRepository = manager ? useManager.getRepository(m_warehouse) : this.warehouseRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory): this.factoryRepository;

            // ตรวจสอบว่ามี loc_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingLoc = await repository.findOne({ where: { loc_id: loc_id } });
            if (!existingLoc) {
                return response.setIncomplete(lang.msgNotFound('location.loc_id'));
            }

            // Validate required data
            if (validate.isNullOrEmpty(data.fty_id)) {
                return response.setIncomplete(lang.msgRequired('factory.fty_id'));
            }        
            if (validate.isNullOrEmpty(data.wh_id)) {
                return response.setIncomplete(lang.msgRequired('warehouse.wh_id'));
            }
            if (validate.isNullOrEmpty(data.zn_id)) {
                return response.setIncomplete(lang.msgRequired('zone.zn_id'));
            }            
            if (validate.isNullOrEmpty(data.loc_code)) {
                return response.setIncomplete(lang.msgRequired('location.loc_code'));
            }
            if (validate.isNullOrEmpty(data.loc_name)) {
                return response.setIncomplete(lang.msgRequired('location.loc_name'));
            }

             // ตรวจสอบข้อมูลซ้ำ (loc_code, loc_name)
                const duplicateLoc = await repository
                .createQueryBuilder('location')
                .where('(location.loc_code = :loc_code OR location.loc_name = :loc_name)', {
                    loc_code: data.loc_code,
                    loc_name: data.loc_name
                })
                .andWhere('location.loc_id != :loc_id', { loc_id })  // ยกเว้น loc_id ปัจจุบัน
                .getOne();

            if (duplicateLoc) {
                return response.setIncomplete(
                    duplicateLoc.loc_code === data.loc_code
                        ? lang.msgAlreadyExists('location.loc_code')
                        : lang.msgAlreadyExists('location.loc_name')
                );
            }

            // ตรวจสอบ fty_id, wh_id, zn_id
            const [existingFty, existingWh, existingZn] = await Promise.all([
                factoryRepository.findOne({ where: { fty_id: data.fty_id } }),
                warehouseRepository.findOne({ where: { wh_id: data.wh_id } }),
                zoneRepository.findOne({ where: { zn_id: Number(data.zn_id) } }),
            ]);

            if (!existingFty) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }
            if (!existingWh) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_id'));
            }
            if (!existingZn) {
                return response.setIncomplete(lang.msgNotFound('zone.zn_id'));
            }

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existingLoc, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
                fty_id: existingFty.fty_id,
                wh_id: existingWh.wh_id,
                zn_id: existingZn.zn_id,
            });
    
            await repository.save(existingLoc); // บันทึกข้อมูล
            
            // ดึงข้อมูลใหม่และส่งกลับ
            const dataResponse = await this.getById(loc_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }

            response = response.setComplete(lang.msgSuccessAction('updated', 'item.location'), dataResponse.data);

            // Commit Transaction ก่อน Query ข้อมูลใหม่
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

    async delete(loc_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'LocationService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_location) : this.locationRepository;
    
            // ตรวจสอบว่า loc_id มีอยู่ในระบบหรือไม่
            const existingLoc = await repository.findOne({ where: { loc_id: loc_id } });
            if (!existingLoc) {
                throw new Error(lang.msgNotFound('location.loc_id'));  // เปลี่ยนเป็น throw เพื่อให้ Rollback ทำงาน
            }
    
            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, loc_id, reqUsername, 'loc_is_active', 'loc_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
    
            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง Response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.location'));
    
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
        const operation = 'LocationService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_location) : this.locationRepository;
    
            // Query location ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('location')
                .leftJoin('m_factory', 'fty', 'location.fty_id = fty.fty_id')
                .leftJoin('m_warehouse', 'wh', 'location.wh_id = wh.wh_id')
                .leftJoin('m_zone', 'zone', 'location.zn_id = zone.zn_id')
                .select([
                    'location.loc_id AS loc_id',
                    'fty.fty_id AS fty_id',
                    'fty.fty_name AS fty_name',
                    'wh.wh_id AS wh_id',
                    'wh.wh_name AS wh_name',
                    'zone.zn_id AS zn_id',
                    'zone.zn_name AS zn_name',
                    'location.loc_code AS loc_code',
                    'location.loc_name AS loc_name',
                    'location.loc_remark AS loc_remark',
                    'location.create_date AS create_date',
                    'location.create_by AS create_by',
                    'location.update_date AS update_date',
                    'location.update_by AS update_by',
                    'location.loc_is_active AS loc_is_active'
                ])
                .where('location.loc_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.location'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.location'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(loc_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'LocationService.getById';

        try {
            const repository = manager ? manager.getRepository(m_location) : this.locationRepository;
    
            // Query location ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('location')
                .select([
                    'location.*',
                ])
                .where('location.loc_id = :loc_id', { loc_id })
                .andWhere('location.loc_is_active = :isActive', { isActive: true })  // ดึงเฉพาะข้อมูลที่ยังไม่ถูกลบ
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('location.loc_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('location.loc_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with loc_id: ${loc_id}`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getLocDropdown(zn_id: number, manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'LocationService.getLocDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_location) : this.locationRepository;

            // ดึงข้อมูลทั้ง loc_id และ loc_name
            const rawData = await repository.createQueryBuilder("location")
                .select(["location.loc_id", "location.loc_name"])
                .where("location.zn_id = :zn_id", { zn_id }) // เพิ่มเงื่อนไข zn_id
                .andWhere("location.loc_name IS NOT NULL") // กรองค่า null ออก
                .andWhere('location.loc_is_active = :isActive', { isActive: true })  // ดึงเฉพาะข้อมูลที่ยังไม่ถูกลบ
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.location'));
            }
    
            console.log('rawData:', rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ LocDropdownModel
            const data = rawData.map((loc) => new LocDropdownModel(loc.location_loc_id, loc.location_loc_name));
    
            return response.setComplete(lang.msgFound('item.location'), data);
    
        } catch (error: any) {
            console.error('Error during getLocDropdown:', error.message);
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
        const operation = 'LocationService.createJson';
    
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
            const repository = useManager.getRepository(m_location);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_location> = {
                'รหัสLocation': 'loc_code',
                'ชื่อLocation': 'loc_name',
                'โรงงาน': 'fty_id',
                'คลัง': 'wh_id',
                'Zone': 'zn_id',
                'หมายเหตุ': 'loc_remark',
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
    
    /* Map ชื่อZoneเป็น ID */
            // ✅ ดึงรายชื่อZoneทั้งหมดจาก DB
            const zones = await this.zoneRepository.find();

            // ✅ สร้าง Map: 'ชื่อZone' => zn_id
            const zoneMap = new Map(zones.map(z => [z.zn_name?.trim(), z.zn_id]));

    /* แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล */
            const formattedData: Partial<m_location>[] = data.map((row: any, index) => {
                // สร้างอ็อบเจ็กต์ว่างสำหรับแต่ละแถว
                const mappedRow: Partial<m_location> = {};

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
            // กรณีเป็นฟิลด์ 'คลัง' → ต้อง map ชื่อคลังเป็น wh_id
                    else if (dbField === 'wh_id') {
                        const warehouseName = row[jsonKey]?.trim();
                        const warehouseId = warehouseMap.get(warehouseName);
                        mappedRow.wh_id = warehouseId ?? undefined;
                    }
            // กรณีเป็นฟิลด์ 'zone' → ต้อง map ชื่อzoneเป็น fty_id
                    else if (dbField === 'zn_id') {
                        const zoneName = row[jsonKey]?.trim();
                        const zoneId = zoneMap.get(zoneName);
                        mappedRow.zn_id = zoneId ?? undefined;
                    }
                    // ฟิลด์ทั่วไป เช่น loc_code, loc_name, loc_remark
                    else if (dbField) {
                        mappedRow[dbField] = row[jsonKey] !== '' ? row[jsonKey] : null; // แปลง "" เป็น null
                    }
                });

                // ✅ กำหนดค่าเริ่มต้นเพิ่มเติม
                mappedRow.loc_is_active = mappedRow.loc_is_active ?? true;       // ถ้ายังไม่กำหนด ให้ default = true
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
                if (validate.isNullOrEmpty(item.loc_code)) {
                    return response.setIncomplete(lang.msgRequired('location.loc_code'));
                }
                if (validate.isNullOrEmpty(item.loc_name)) {
                    return response.setIncomplete(lang.msgRequired('location.loc_name'));
                }
            }
            
    /* ตรวจชื่อโรงงานที่ไม่พบ (fty_id = undefined) */
            const notFoundFactories = formattedData.filter(l => !l.fty_id);
            if (notFoundFactories.length > 0) {
                return response.setIncomplete(
                    `พบชื่อโรงงานที่ไม่ตรงกับระบบ ${notFoundFactories.length} รายการ: ` +
                    notFoundFactories.map(e => `${e.loc_code} (${e.loc_name})`).join(', ')
                );
            }
    
    /* ตรวจชื่อคลังที่ไม่พบ (wh_id = undefined) */
            const notFoundWarehouses = formattedData.filter(l => !l.wh_id);
            if (notFoundWarehouses.length > 0) {
                return response.setIncomplete(
                    `พบชื่อคลังที่ไม่ตรงกับระบบ ${notFoundWarehouses.length} รายการ: ` +
                    notFoundWarehouses.map(e => `${e.loc_code} (${e.loc_name})`).join(', ')
                );
            }    
    
    /* ตรวจชื่อzoneที่ไม่พบ (zn_id = undefined) */
            const notFoundZones = formattedData.filter(l => !l.zn_id);
            if (notFoundZones.length > 0) {
                return response.setIncomplete(
                    `พบชื่อzoneที่ไม่ตรงกับระบบ ${notFoundZones.length} รายการ: ` +
                    notFoundZones.map(e => `${e.loc_code} (${e.loc_name})`).join(', ')
                );
            }

    /* ตรวจสอบความสัมพันธ์ระหว่าง fty_id, wh_id, zn_id */
            const invalidZoneRelations = formattedData.filter(item => {
                const zone = zones.find(z => z.zn_id === item.zn_id);
                if (!zone) return true; // ถ้าไม่เจอ zone ถือว่าผิด

                const isSameFactory = zone.fty_id === item.fty_id;
                const isSameWarehouse = zone.wh_id === item.wh_id;

                return !(isSameFactory && isSameWarehouse);
            });

            if (invalidZoneRelations.length > 0) {
                return response.setIncomplete(
                    `พบความไม่สัมพันธ์ระหว่างโรงงาน, คลัง และโซน จำนวน ${invalidZoneRelations.length} รายการ: ` +
                    invalidZoneRelations.map(e => `${e.loc_code} (${e.loc_name})`).join(', ')
                );
            }

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_location>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.loc_code);
                const isNameDuplicate = seenNames.has(s.loc_name);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.loc_code);
                    seenNames.add(s.loc_name);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.loc_code} (${e.loc_name})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueLocations
            const uniqueLocations = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `loc_code` และ `loc_name` ใน database
            const existingLocations = await repository
                .createQueryBuilder('loc')
                .where('loc.loc_code IN (:...codes) OR loc.loc_name IN (:...names)', {
                    codes: uniqueLocations.map((s) => s.loc_code).filter(Boolean),
                    names: uniqueLocations.map((s) => s.loc_name).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueLocations) ที่ซ้ำกับข้อมูลในระบบ (existingLocations)
            const duplicateInInput = uniqueLocations.filter((s) =>
                existingLocations.some((ex) =>
                    ex.loc_code === s.loc_code || ex.loc_name === s.loc_name
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.loc_code} (${e.loc_name})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedLocations = await repository.save(uniqueLocations);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.location'), savedLocations);
    
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