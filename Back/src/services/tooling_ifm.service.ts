import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_tooling_ifm } from '../entities/m_tooling_ifm.entity';
import { ToolingIfmModel } from '../models/tooling_ifm.model';
import { m_tooling } from '../entities/m_tooling.entity';
import { m_criteria } from '../entities/m_criteria.entity';
import { TLIfmDropdownModel } from '../models/tooling_ifm_dropdown.model';
import { deleteEntity } from '../utils/DatabaseUtils';

export class ToolingIfmService {
    private tlifmRepository: Repository<m_tooling_ifm>;
    private tltypeRepository: Repository<m_tooling>;
    private criteriaRepository: Repository<m_criteria>;

    constructor(){
        this.tlifmRepository = AppDataSource.getRepository(m_tooling_ifm);
        this.tltypeRepository = AppDataSource.getRepository(m_tooling);
        this.criteriaRepository = AppDataSource.getRepository(m_criteria);
    }

    //validate field inbtl
    private validateRequiredFields(data: Partial<ToolingIfmModel>, response: ApiResponse<any>): ApiResponse<any> | null {
        const requiredFields = [
            { field: data.tl_id, message: 'tooling.tl_id' },
            { field: data.crt_id, message: 'criteria.crt_id' },
            { field: data.tlifm_code, message: 'tooling_ifm.tlifm_code' },
            { field: data.tlifm_name, message: 'tooling_ifm.tlifm_name' }
        ];
    
        for (const { field, message } of requiredFields) {
            if (validate.isNullOrEmpty(field)) {
                return response.setIncomplete(lang.msgRequired(message));
            }
        }
    
        return null;
    }

    async create(data: Partial<ToolingIfmModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<ToolingIfmModel>();
        const operation = 'ToolingIfmService.create';

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

            const repository = manager ? useManager.getRepository(m_tooling_ifm) : this.tlifmRepository;
            const tltypeRepository = manager ? useManager.getRepository(m_tooling) : this.tltypeRepository;
            const criteriaRepository = manager ? useManager.getRepository(m_criteria) : this.criteriaRepository;

            // Validate required fields
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) {
                return validationResponse;
            }

            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            // ตรวจสอบว่า tl_id มีอยู่ใน m_tooling หรือไม่
            const existingTlType = await tltypeRepository.findOne({ where: { tl_id: data.tl_id } });
            if (!existingTlType) {
                return response.setIncomplete(lang.msgNotFound('tooling.tl_id'));
            }

            // ตรวจสอบว่า crt_id มีอยู่ใน m_criteria หรือไม่
            const existingCrt = await criteriaRepository.findOne({ where: { crt_id: data.crt_id } });
            if (!existingCrt) {
                return response.setIncomplete(lang.msgNotFound('criteria.crt_id'));
            }
            
            // ตรวจสอบว่า tlifm_code มีอยู่ในฐานข้อมูลหรือไม่
            const existingCode = await repository.findOne({ where: { tlifm_code: data.tlifm_code } });
            if (existingCode) {
                return response.setIncomplete(lang.msgAlreadyExists('tooling_ifm.tlifm_code'));
            }

            // ตรวจสอบว่า tlifm_name มีอยู่ในฐานข้อมูลหรือไม่
            const existingName = await repository.findOne({ where: { tlifm_name: data.tlifm_name } });
            if (existingName) {
                return response.setIncomplete(lang.msgAlreadyExists('tooling_ifm.tlifm_name'));
            }

            const Data = repository.create({
                ...data,
                tl_id: existingTlType.tl_id,
                crt_id: existingCrt.crt_id,
                tlifm_is_active: data.tlifm_is_active ?? true,
                create_date: new Date(),
                create_by: reqUsername,
            });            

            // บันทึก entity (Data) ลงฐานข้อมูล
            const savedData = await repository.save(Data);

            // Commit Transaction หลังบันทึกข้อมูลสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
            // ดึงข้อมูล user ที่สร้างใหม่
            return response.setComplete(lang.msgSuccessAction('created', 'item.tooling_ifm'), savedData);

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
        tlifm_id: number,
        data: Partial<ToolingIfmModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<ToolingIfmModel>();
        const operation = 'ToolingIfmService.update';
    
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
            const repository = manager ? useManager.getRepository(m_tooling_ifm) : this.tlifmRepository;
            const tltypeRepository = manager ? useManager.getRepository(m_tooling) : this.tltypeRepository;
            const criteriaRepository = manager ? useManager.getRepository(m_criteria) : this.criteriaRepository;

            // ตรวจสอบว่ามี tlifm_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingtlifm = await repository.findOne({ where: { tlifm_id: tlifm_id } });
            if (!existingtlifm) {
                return response.setIncomplete(lang.msgNotFound('tooling_ifm.tlifm_id'));
            }

            // ตรวจสอบว่า tl_id มีอยู่ใน m_tooling หรือไม่
            const existingTlType = await tltypeRepository.findOne({ where: { tl_id: data.tl_id } });
            if (!existingTlType) {
                return response.setIncomplete(lang.msgNotFound('tooling.tl_id'));
            }

            // ตรวจสอบว่า crt_id มีอยู่ใน m_criteria หรือไม่
            const existingCrt = await criteriaRepository.findOne({ where: { crt_id: data.crt_id } });
            if (!existingCrt) {
                return response.setIncomplete(lang.msgNotFound('criteria.crt_id'));
            }

            // Validate required fields
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) {
                return validationResponse;
            }

            // ตรวจสอบว่า tlifm_code ไม่ซ้ำ
            if (data.tlifm_code && data.tlifm_code !== existingtlifm.tlifm_code) {
                const duplicateCode = await repository.findOne({
                    where: { tlifm_code: data.tlifm_code, tlifm_id: Not(tlifm_id) },
                });
                if (duplicateCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('tooling_ifm.tlifm_code'));
                }
            }
    
            // ตรวจสอบว่า tlifm_name ไม่ซ้ำ
            if (data.tlifm_name && data.tlifm_name !== existingtlifm.tlifm_name) {
                const duplicateName = await repository.findOne({
                    where: { tlifm_name: data.tlifm_name, tlifm_id: Not(tlifm_id) },
                });
                if (duplicateName) {
                    return response.setIncomplete(lang.msgAlreadyExists('tooling_ifm.tlifm_name'));
                }
            }

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existingtlifm, {
                ...data, 
                tl_id: existingTlType.tl_id,
                crt_id: existingCrt.crt_id,
                update_by: reqUsername,
                update_date: new Date(),
            });
    
            await repository.save(existingtlifm); // บันทึกข้อมูล

            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(tlifm_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }

            response = response.setComplete(lang.msgSuccessAction('updated', 'item.tooling_ifm'), dataResponse.data);

            // Commit Transaction หลังบันทึกข้อมูลสำเร็จ
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

    async delete(tlifm_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'ToolingIfmService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_tooling_ifm) : this.tlifmRepository;
    
            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, tlifm_id, reqUsername, 'tlifm_is_active', 'tlifm_id');
            
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
            console.error(`Error during ${operation}:`, error);
    
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
    
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    

    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'ToolingIfmService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(m_tooling_ifm) : this.tlifmRepository;
    
            const rawData = await repository
                .createQueryBuilder('tlifm')
                .leftJoin('m_tooling', 'tl', 'tl.tl_id = tlifm.tl_id')
                .leftJoin('m_criteria', 'crt', 'crt.crt_id = tlifm.crt_id')
                .select([
                    'crt.crt_id AS crt_id',
                    'tlifm.tlifm_id AS tlifm_id',
                    'tlifm.tlifm_code AS tlifm_code',
                    'tlifm.tlifm_name AS tlifm_name',
                    'tl.tl_type AS tl_type',
                    // ใส่ , ให้ crt_txn
                    `CONCAT(
                        COALESCE(NULLIF(crt.crt_txn_low, ''), ''),
                        CASE WHEN crt.crt_txn_low IS NOT NULL AND crt.crt_txn_medium IS NOT NULL THEN ', ' ELSE '' END,
                        COALESCE(NULLIF(crt.crt_txn_medium, ''), ''),
                        CASE WHEN crt.crt_txn_medium IS NOT NULL AND crt.crt_txn_high IS NOT NULL THEN ', ' ELSE '' END,
                        COALESCE(NULLIF(crt.crt_txn_high, ''), '')
                    ) AS crt_txn`,
                     // ใส่ , ให้ crt_rem
                    // `CONCAT(
                    //     COALESCE(NULLIF(crt.crt_rem_low, ''), ''),
                    //     CASE WHEN crt.crt_rem_low IS NOT NULL AND crt.crt_rem_medium IS NOT NULL THEN ', ' ELSE '' END,
                    //     COALESCE(NULLIF(crt.crt_rem_medium, ''), ''),
                    //     CASE WHEN crt.crt_rem_medium IS NOT NULL AND crt.crt_rem_high IS NOT NULL THEN ', ' ELSE '' END,
                    //     COALESCE(NULLIF(crt.crt_rem_high, ''), '')
                    // ) AS crt_rem`,
                    'tlifm.tlifm_is_active AS tlifm_is_active',
                ])
                .where('tlifm.tlifm_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();
    
            // ตรวจสอบว่ามีข้อมูลหรือไม่
            if (!Array.isArray(rawData) || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.tooling_ifm'));
            }
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('item.tooling_ifm'), rawData);
            
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(tlifm_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'ToolingIfmService.getById';

        try {
            const repository = manager ? manager.getRepository(m_tooling_ifm) : this.tlifmRepository;
    
            // Query tooling_ifm ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('tlifm')
                .leftJoin('m_tooling', 'tl', 'tl.tl_id = tlifm.tl_id')
                .leftJoin('m_criteria' , 'crt', 'crt.crt_id = tlifm.crt_id')
                .select([
                    'tlifm.tlifm_id AS tlifm_id',
                    'tlifm.tlifm_code AS tlifm_code',
                    'tlifm.tlifm_name AS tlifm_name',
                    'tl.tl_id AS tl_id',
                    'tl.tl_type AS tl_type',
                    'crt.crt_id AS crt_id',
                    'crt.crt_txn_low AS crt_txn_low',
                    'crt.crt_txn_medium AS crt_txn_medium',
                    'crt.crt_txn_high AS crt_txn_high',
                    'crt.crt_rem_low AS crt_rem_low',
                    'crt.crt_rem_medium AS crt_rem_medium',
                    'crt.crt_rem_high AS crt_rem_high',
                ])
                .where('tlifm.tlifm_id = :tlifm_id', { tlifm_id })
                .andWhere('tlifm.tlifm_is_active = :isActive', { isActive: true })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('tooling_ifm.tlifm_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('tooling_ifm.tlifm_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with tlifm_id: ${tlifm_id}`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getTLIfmDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'ToolingIfmService.getTLIfmDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_tooling_ifm) : this.tlifmRepository;
    
            // ดึงข้อมูล tlifm_id และรวม tlifm_code กับ tlifm_name
            const rawData = await repository
                .createQueryBuilder("tlifm")
                .select([
                    "tlifm.tlifm_id", // เลือก tlifm_id
                    "CONCAT(tlifm.tlifm_code, ' ', tlifm.tlifm_name) AS tlifm_code_name" // รวม tlifm_code และ tlifm_name
                ])
                .where("tlifm.tlifm_id IS NOT NULL") // กรองค่า null ออก
                .andWhere("tlifm.tlifm_is_active = :isActive", { isActive: true }) // กรองเฉพาะข้อมูลที่ใช้งานอยู่
                .distinct(true) // ให้ผลลัพธ์ไม่ซ้ำ
                .getRawMany(); // ดึงข้อมูลในรูปแบบ raw
    
            // ตรวจสอบว่า rawData มีข้อมูลหรือไม่
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound("item.tooling_ifm")); // หากไม่พบข้อมูล
            }
    
            console.log("rawData:", rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ LocDropdownModel
            const data = rawData.map((tl: any) => new TLIfmDropdownModel(tl.tlifm_tlifm_id, tl.tlifm_code_name));
    
            return response.setComplete(lang.msgFound("item.tooling_ifm"), data); // ส่งผลลัพธ์กลับ
        } catch (error: any) {
            console.error("Error during getTLIfmDropdown:", error.message); // แสดงข้อผิดพลาด
            throw new Error(lang.msgErrorFunction(operation, error.message)); // ส่งข้อผิดพลาดกลับ
        }
    }

    async createJson(
        data: any[], 
        reqUsername: string, 
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'ToolingIfmService.createJson';
    
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
            const repository = useManager.getRepository(m_tooling_ifm);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_tooling_ifm> = {
                'รหัส': 'tlifm_code',
                'ชื่อ': 'tlifm_name',
                'ประเภท': 'tl_id',
                'เกณฑ์': 'crt_id'
            };
    
            console.log('📌 Raw JSON Data:', data);
    
    /* Map ชื่อประเภท tl เป็น ID */
            // ✅ ดึงรายชื่อประเภท tl ทั้งหมดจาก DB
            const tltype = await this.tltypeRepository.find();

            // ✅ สร้าง Map: 'ชื่อประเภท tl ' => tl_id
            const tltypeMap = new Map(tltype.map(t => [t.tl_type?.trim(), t.tl_id]));
    
    /* Map ชื่อเกณฑ์ เป็น ID */
            // ✅ ดึงรายชื่อเกณฑ์ ทั้งหมดจาก DB
            const crt = await this.criteriaRepository.find();

            // ✅ สร้าง Map: 'ชื่อเกณฑ์' => crt_id
            const crtMap = new Map(crt.map(c => [c.crt_name?.trim(), c.crt_id]));

            // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล
            const formattedData: Partial<m_tooling_ifm>[] = data.map((row: any, index) => {
                const mappedRow: Partial<m_tooling_ifm> = {};
    
                Object.keys(row).forEach((jsonKey) => {
                    const dbField = fieldMapping[jsonKey];
            // กรณีเป็นฟิลด์ 'ประเภท tl' → ต้อง map ชื่อประเภท tl เป็น tl_id
                    if (dbField === 'tl_id') {
                        const tltypeName = row[jsonKey]?.trim();                // ตัดช่องว่างชื่อประเภท tl
                        const tltypeId = tltypeMap.get(tltypeName);           // หาค่า tl_id
                        mappedRow.tl_id = tltypeId ?? undefined;               // ถ้าไม่เจอให้เป็น undefined
                    }
            // กรณีเป็นฟิลด์ 'เกณฑ์' → ต้อง map ชื่อคลังเป็น crt_id
                    else if (dbField === 'crt_id') {
                        const crtName = row[jsonKey]?.trim();
                        const crtId = crtMap.get(crtName);
                        mappedRow.crt_id = crtId ?? undefined;
                    }
                    // ฟิลด์ทั่วไป เช่น loc_code, loc_name, loc_remark
                    else if (dbField) {
                        mappedRow[dbField] = row[jsonKey] !== '' ? row[jsonKey] : null; // แปลง "" เป็น null
                    }
                });
    
                // ✅ ตั้งค่า default values
                mappedRow.tlifm_is_active = mappedRow.tlifm_is_active ?? true;
                mappedRow.create_date = new Date();
                mappedRow.create_by = reqUsername;
    
                console.log(`📌 Mapped Row ${index + 1}:`, mappedRow);
                return mappedRow;
            });
    
            console.log("formattedData",formattedData)
            // ✅ ตรวจสอบข้อมูลที่จำเป็น
            for (const item of formattedData) {
                if (validate.isNullOrEmpty(item.tlifm_code)) {
                    return response.setIncomplete(lang.msgRequired('tooling_ifm.tlifm_code'));
                }
                if (validate.isNullOrEmpty(item.tlifm_name)) {
                    return response.setIncomplete(lang.msgRequired('tooling_ifm.tlifm_name'));
                }
            }

    /* ตรวจชื่อประเภท tl ที่ไม่พบ (tl_id = undefined) */
        const notFoundTLTypes = formattedData.filter(l => !l.tl_id);
        if (notFoundTLTypes.length > 0) {
            return response.setIncomplete(
                `พบชื่อประเภทที่ไม่ตรงกับระบบ ${notFoundTLTypes.length} รายการ: ` +
                notFoundTLTypes.map(e => `${e.tlifm_code} (${e.tlifm_name})`).join(', ')
            );
        }

    /* ตรวจชื่อเกณฑ์ที่ไม่พบ (crt_id = undefined) */
        const notFoundCriterias = formattedData.filter(l => !l.crt_id);
        if (notFoundCriterias.length > 0) {
            return response.setIncomplete(
                `พบชื่อเกณฑ์ที่ไม่ตรงกับระบบ ${notFoundCriterias.length} รายการ: ` +
                notFoundCriterias.map(e => `${e.tlifm_code} (${e.tlifm_name})`).join(', ')
            );
        }  

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_tooling_ifm>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.tlifm_code);
                const isNameDuplicate = seenNames.has(s.tlifm_name);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.tlifm_code);
                    seenNames.add(s.tlifm_name);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.tlifm_code} (${e.tlifm_name})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueTLIfm
            const uniqueTLIfm = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `tlifm_code` และ `tlifm_name` ใน database
            const existingTLIfm = await repository
                .createQueryBuilder('tlifm')
                .where('tlifm.tlifm_code IN (:...codes) OR tlifm.tlifm_name IN (:...names)', {
                    codes: uniqueTLIfm.map((s) => s.tlifm_code).filter(Boolean),
                    names: uniqueTLIfm.map((s) => s.tlifm_name).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueTLIfm) ที่ซ้ำกับข้อมูลในระบบ (existingTLIfm)
            const duplicateInInput = uniqueTLIfm.filter((s) =>
                existingTLIfm.some((ex) =>
                    ex.tlifm_code === s.tlifm_code || ex.tlifm_name === s.tlifm_name
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.tlifm_code} (${e.tlifm_name})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedTLIfm = await repository.save(uniqueTLIfm);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.tooling_ifm'), savedTLIfm);
    
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