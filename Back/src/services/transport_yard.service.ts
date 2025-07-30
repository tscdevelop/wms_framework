import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_transport_yard } from '../entities/m_transport_yard.entity';
import { TspYardModel } from '../models/transport_yard.model';
import { TspYDropdownModel } from '../models/transport_yard_dropdown.model';
import { m_factory } from '../entities/m_factory.entity';
import { deleteEntity } from '../utils/DatabaseUtils';

export class TransportYardService {
    private tspyardRepository: Repository<m_transport_yard>;
    private factoryRepository: Repository<m_factory>;

    constructor(){
        this.tspyardRepository = AppDataSource.getRepository(m_transport_yard);
        this.factoryRepository = AppDataSource.getRepository(m_factory);
    }

    async create(data: Partial<TspYardModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<TspYardModel>();
        const operation = 'TransportYardService.create';
    
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
            const repository = manager ? useManager.getRepository(m_transport_yard) : this.tspyardRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory): this.factoryRepository;
    
            // ตรวจสอบว่า fty_id มีอยู่ใน m_factory หรือไม่
            if (validate.isNullOrEmpty(data.fty_id)) {
                return response.setIncomplete(lang.msgRequired('factory.fty_id'));
            }
    
            const existingFtyID = await factoryRepository.findOne({ where: { fty_id: Number(data.fty_id) } });
            if (!existingFtyID) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }
    
            // ตรวจสอบข้อมูลที่จำเป็น
            if (validate.isNullOrEmpty(data.tspyard_code)) {
                return response.setIncomplete(lang.msgRequired('tspyard.tspyard_code'));
            }
            if (validate.isNullOrEmpty(data.tspyard_name)) {
                return response.setIncomplete(lang.msgRequired('tspyard.tspyard_name'));
            }
            if (validate.isNullOrEmpty(data.tspyard_address)) {
                return response.setIncomplete(lang.msgRequired('field.address'));
            }
            if (validate.isNullOrEmpty(data.tspyard_phone)) {
                return response.setIncomplete(lang.msgRequired('field.phone'));
            }
            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }
    
            // ตรวจสอบข้อมูลซ้ำ tspyard_code และ tspyard_name
            const existingTspYard = await repository
                .createQueryBuilder('tspyard')
                .where('tspyard.tspyard_code = :tspyard_code OR tspyard.tspyard_name = :tspyard_name', {
                    tspyard_code: data.tspyard_code,
                    tspyard_name: data.tspyard_name
                })
                .getOne();
    
            if (existingTspYard) {
                if (existingTspYard.tspyard_code === data.tspyard_code) {
                    return response.setIncomplete(lang.msgAlreadyExists('tspyard.tspyard_code'));
                }
                if (existingTspYard.tspyard_name === data.tspyard_name) {
                    return response.setIncomplete(lang.msgAlreadyExists('tspyard.tspyard_name'));
                }
            }
    
            // Assign ข้อมูลเข้า Entity
            const tspYardData = repository.create({
                ...data,
                tspyard_is_active: data.tspyard_is_active ?? true,  // ค่าเริ่มต้นเป็น true
                create_date: new Date(),
                fty_id: existingFtyID.fty_id,
                create_by: reqUsername,
            });
    
            // บันทึกข้อมูล
            const savedData = await repository.save(tspYardData);
    
            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.tspyard'), savedData);
    
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
        tspyard_id: number,
        data: Partial<TspYardModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<TspYardModel>();
        const operation = 'TransportYardService.update';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        // ตรวจสอบ EntityManager หรือ QueryRunner
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        // เริ่ม Transaction
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const repository = manager ? useManager.getRepository(m_transport_yard) : this.tspyardRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory): this.factoryRepository;
    
            // ตรวจสอบว่ามี tspyard_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingTspY = await repository.findOne({ where: { tspyard_id } });
            if (!existingTspY) {
                return response.setIncomplete(lang.msgNotFound('tspyard.tspyard_id'));
            }
    
            // ตรวจสอบข้อมูลที่จำเป็น
            if (validate.isNullOrEmpty(data.fty_id)) {
                return response.setIncomplete(lang.msgRequired('factory.fty_id'));
            }
            if (validate.isNullOrEmpty(data.tspyard_code)) {
                return response.setIncomplete(lang.msgRequired('tspyard.tspyard_code'));
            }
            if (validate.isNullOrEmpty(data.tspyard_name)) {
                return response.setIncomplete(lang.msgRequired('tspyard.tspyard_name'));
            }
            if (validate.isNullOrEmpty(data.tspyard_address)) {
                return response.setIncomplete(lang.msgRequired('field.address'));
            }
            if (validate.isNullOrEmpty(data.tspyard_phone)) {
                return response.setIncomplete(lang.msgRequired('field.phone'));
            }
    
            // ตรวจสอบว่า fty_id มีอยู่จริงใน m_factory หรือไม่
            const existingFtyID = await factoryRepository.findOne({ where: { fty_id: data.fty_id } });
            if (!existingFtyID) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }
    
            // ตรวจสอบข้อมูลซ้ำ tspyard_code และ tspyard_name ใน Query เดียว
            const duplicateTspYard = await repository
                .createQueryBuilder('tspyard')
                .where('(tspyard.tspyard_code = :tspyard_code OR tspyard.tspyard_name = :tspyard_name)', {
                    tspyard_code: data.tspyard_code,
                    tspyard_name: data.tspyard_name
                })
                .andWhere('tspyard.tspyard_id != :tspyard_id', { tspyard_id })
                .getOne();
    
            if (duplicateTspYard) {
                if (duplicateTspYard.tspyard_code === data.tspyard_code) {
                    return response.setIncomplete(lang.msgAlreadyExists('tspyard.tspyard_code'));
                }
                if (duplicateTspYard.tspyard_name === data.tspyard_name) {
                    return response.setIncomplete(lang.msgAlreadyExists('tspyard.tspyard_name'));
                }
            }
    
            // อัปเดตข้อมูล
            Object.assign(existingTspY, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
                fty_id: existingFtyID.fty_id,
            });
    
            await repository.save(existingTspY);
    
            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(tspyard_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }
    
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.tspyard'), dataResponse.data);
    
            // Commit Transaction หลังบันทึกสำเร็จ
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

    async delete(tspyard_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'TransportYardService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_transport_yard) : this.tspyardRepository;
    
            // ตรวจสอบว่ามี tspyard_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingTspY = await repository.findOne({ where: { tspyard_id: tspyard_id } });
            if (!existingTspY) {
                return response.setIncomplete(lang.msgNotFound('tspyard.tspyard_id'));
            }
    
            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, tspyard_id, reqUsername, 'tspyard_is_active', 'tspyard_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }

            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.tspyard'));
    
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
        const operation = 'TransportYardService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_transport_yard) : this.tspyardRepository;
    
            // Query tspyard ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('tspyard')
                .leftJoin('m_factory', 'fty', 'tspyard.fty_id = fty.fty_id')
                .select([
                    'fty.fty_id AS fty_id',
                    'fty.fty_name AS fty_name',
                    'tspyard.tspyard_id AS tspyard_id',
                    'tspyard.tspyard_code AS tspyard_code',
                    'tspyard.tspyard_name AS tspyard_name',
                    'tspyard.tspyard_remark AS tspyard_remark',
                    'tspyard.tspyard_address AS tspyard_address',
                    'tspyard.tspyard_phone AS tspyard_phone',
                    'tspyard.create_date AS create_date',
                    'tspyard.create_by AS create_by',
                    'tspyard.update_date AS update_date',
                    'tspyard.update_by AS update_by',
                    'tspyard.tspyard_is_active AS tspyard_is_active'
                ])
                .where('tspyard.tspyard_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.tspyard'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.tspyard'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(tspyard_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'TransportYardService.getById';

        try {
            const repository = manager ? manager.getRepository(m_transport_yard) : this.tspyardRepository;
    
            // Query tspyard ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('tspyard')
                .leftJoin('m_factory', 'fty', 'tspyard.fty_id = fty.fty_id')
                .select([
                    'fty.fty_id AS fty_id',
                    'tspyard.tspyard_id AS tspyard_id',
                    'tspyard.tspyard_code AS tspyard_code',
                    'tspyard.tspyard_name AS tspyard_name',
                    'tspyard.tspyard_remark AS tspyard_remark',
                    'tspyard.tspyard_address AS tspyard_address',
                    'tspyard.tspyard_phone AS tspyard_phone',
                    'tspyard.create_date AS create_date',
                    'tspyard.create_by AS create_by',
                    'tspyard.update_date AS update_date',
                    'tspyard.update_by AS update_by',
                    'tspyard.tspyard_is_active AS tspyard_is_active'
                ])
                .where('tspyard.tspyard_id = :tspyard_id', { tspyard_id })
                .andWhere('tspyard.tspyard_is_active = :isActive', { isActive: true })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('tspyard.tspyard_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('tspyard.tspyard_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with tspyard_id: ${tspyard_id}`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getDYDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'TransportYardService.getDYDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_transport_yard) : this.tspyardRepository;
    
            // ดึงข้อมูลทั้ง tspyard_id และ tspyard_code พร้อม alias
            const rawData = await repository.createQueryBuilder("tspyard")
                .select([
                    "tspyard.tspyard_id AS tspyard_id",
                    "CONCAT(tspyard.tspyard_code, ' ', tspyard.tspyard_name) AS tspyard_code_name" // รวม semiifm และ semiifm_name
                ])
                .where("tspyard.tspyard_code IS NOT NULL")
                .andWhere('tspyard.tspyard_is_active = :isActive', { isActive: true })
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.tspyard'));
            }
    
            console.log('rawData:', rawData);
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ TspYDropdownModel
            const data = rawData.map((DY) => new TspYDropdownModel(DY.tspyard_id, DY.tspyard_code_name));
    
            return response.setComplete(lang.msgFound('item.tspyard'), data);    
    
        } catch (error: any) {
            console.error('Error during getDYDropdown:', error.message);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    

    async codeExists(id: string, manager?: EntityManager): Promise<boolean> {
        const repository = manager ? manager.getRepository(m_transport_yard) : this.tspyardRepository;
        const count = await repository.count({ where: { tspyard_id: Number(id) } });
        return count > 0;
    }

    async createJson(
        data: any[], 
        reqUsername: string, 
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'TransportYardService.createJson';
    
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
            const repository = useManager.getRepository(m_transport_yard);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_transport_yard> = {
                'รหัสท่ารถ': 'tspyard_code',
                'ชื่อท่ารถ': 'tspyard_name',
                'ที่อยู่': 'tspyard_address',
                'เบอร์ติดต่อ': 'tspyard_phone',
                'หมายเหตุ': 'tspyard_remark',
                'โรงงาน': 'fty_id'
            };
    
            console.log('📌 Raw JSON Data:', data);
    
    /* Map ชื่อโรงงานเป็น ID */
            // ✅ ดึงรายชื่อโรงงานทั้งหมดจาก DB
            const factories = await this.factoryRepository.find(); // ดึงทั้งหมด

            // ✅ สร้าง Map: 'ชื่อโรงงาน' => fty_id
            const factoryMap = new Map(factories.map(f => [f.fty_name?.trim(), f.fty_id]));

            // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล
            const formattedData: Partial<m_transport_yard>[] = data.map((row: any, index) => {
                // สร้างอ็อบเจ็กต์ว่างสำหรับแต่ละแถว
                const mappedRow: Partial<m_transport_yard> = {};

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
                    // ฟิลด์ทั่วไป เช่น tspyard_code, tspyard_name, tspyard_type
                    else if (dbField) {
                        mappedRow[dbField] = row[jsonKey] !== '' ? row[jsonKey] : null; // แปลง "" เป็น null
                    }
                });

                // ✅ กำหนดค่าเริ่มต้นเพิ่มเติม
                mappedRow.tspyard_is_active = mappedRow.tspyard_is_active ?? true;       // ถ้ายังไม่กำหนด ให้ default = true
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
                if (validate.isNullOrEmpty(item.tspyard_code)) {
                    return response.setIncomplete(lang.msgRequired('tspyard.tspyard_code'));
                }
                if (validate.isNullOrEmpty(item.tspyard_name)) {
                    return response.setIncomplete(lang.msgRequired('tspyard.tspyard_name'));
                }
                if (validate.isNullOrEmpty(item.tspyard_address)) {
                    return response.setIncomplete(lang.msgRequired('field.address'));
                }
                if (validate.isNullOrEmpty(item.tspyard_phone)) {
                    return response.setIncomplete(lang.msgRequired('field.phone'));
                }
            }
            
            // ✅ ตรวจชื่อโรงงานที่ไม่พบ (fty_id = undefined)
            const notFoundFactories = formattedData.filter(w => !w.fty_id);
            if (notFoundFactories.length > 0) {
                return response.setIncomplete(
                    `พบชื่อโรงงานที่ไม่ตรงกับระบบ ${notFoundFactories.length} รายการ: ` +
                    notFoundFactories.map(e => `${e.tspyard_code} (${e.tspyard_name})`).join(', ')
                );
            }

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_transport_yard>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.tspyard_code);
                const isNameDuplicate = seenNames.has(s.tspyard_name);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.tspyard_code);
                    seenNames.add(s.tspyard_name);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.tspyard_code} (${e.tspyard_name})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueTspyard
            const uniqueTspyard = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `tspyard_code` และ `tspyard_name` ใน database
            const existingTspyard = await repository
                .createQueryBuilder('tspyard')
                .where('tspyard.tspyard_code IN (:...codes) OR tspyard.tspyard_name IN (:...names)', {
                    codes: uniqueTspyard.map((s) => s.tspyard_code).filter(Boolean),
                    names: uniqueTspyard.map((s) => s.tspyard_name).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueTspyard) ที่ซ้ำกับข้อมูลในระบบ (existingTspyard)
            const duplicateInInput = uniqueTspyard.filter((s) =>
                existingTspyard.some((ex) =>
                    ex.tspyard_code === s.tspyard_code || ex.tspyard_name === s.tspyard_name
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.tspyard_code} (${e.tspyard_name})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedTspyard = await repository.save(uniqueTspyard);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.tspyard'), savedTspyard);
    
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


