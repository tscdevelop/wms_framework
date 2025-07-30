import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_tooling } from '../entities/m_tooling.entity';
import { ToolingModel } from '../models/tooling.model';
import { TLDropdownModel } from '../models/tooling_dropdown.model';
import { deleteEntity } from '../utils/DatabaseUtils';

export class ToolingService {
    private toolingRepository: Repository<m_tooling>;

    constructor(){
        this.toolingRepository = AppDataSource.getRepository(m_tooling);
    }

    async create(data: Partial<ToolingModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<ToolingModel>();
        const operation = 'ToolingService.create';

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

            const repository = manager ? useManager.getRepository(m_tooling) : this.toolingRepository;

            // Validate required data
            if (validate.isNullOrEmpty(data.tl_code)) {
                return response.setIncomplete(lang.msgRequired('tooling.tl_code'));
            }
            if (validate.isNullOrEmpty(data.tl_type)) {
                return response.setIncomplete(lang.msgRequired('tooling.tl_type'));
            }
            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            // ตรวจสอบว่า `tl_code` หรือ `tl_type` ที่ส่งมาใน `data` มีอยู่ในฐานข้อมูลหรือไม่
            const existingTL = await repository
            .createQueryBuilder('tl')
            .where('tl.tl_code = :tl_code OR tl.tl_type = :tl_type', { 
                tl_code: data.tl_code, 
                tl_type: data.tl_type })
            .getOne();

            // ตรวจสอบว่าพบข้อมูลในฐานข้อมูลหรือไม่
            if (existingTL) {
                if (existingTL.tl_code === data.tl_code) {
                    return response.setIncomplete(lang.msgAlreadyExists('tooling.tl_code'));
                }
                if (existingTL.tl_type === data.tl_type) {
                    return response.setIncomplete(lang.msgAlreadyExists('tooling.tl_type'));
                }
            }

            const rmData = repository.create({
                ...data,
                tl_is_active: data.tl_is_active ?? true,
                create_date: new Date(),
                create_by: reqUsername,
            });            

            // บันทึก entity (rmData) ลงฐานข้อมูล
            const savedData = await repository.save(rmData);

            // Commit Transaction หลังบันทึกข้อมูลสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            // ดึงข้อมูล user ที่สร้างใหม่
            return response.setComplete(lang.msgSuccessAction('created', 'item.tooling'), savedData);

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
            throw error;
    
        } finally {
            // ปิดการใช้งาน QueryRunner
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async update(
        tl_id: number,
        data: Partial<ToolingModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<ToolingModel>();
        const operation = 'ToolingService.update';
    
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
            const repository = manager ? useManager.getRepository(m_tooling) : this.toolingRepository;

            // ตรวจสอบว่ามี tl_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingTL = await repository.findOne({ where: { tl_id: tl_id } });
            if (!existingTL) {
                return response.setIncomplete(lang.msgNotFound('tooling.tl_id'));
            }
    
            // ตรวจสอบค่าที่จำเป็น
            if (validate.isNullOrEmpty(data.tl_code)) {
                return response.setIncomplete(lang.msgRequired('tooling.tl_code'));
            }
            if (validate.isNullOrEmpty(data.tl_type)) {
                return response.setIncomplete(lang.msgRequired('tooling.tl_type'));
            }
    
            // ตรวจสอบว่า tl_code ไม่ซ้ำ
            if (data.tl_code && data.tl_code !== existingTL.tl_code) {
                const duplicateCode = await repository.findOne({
                    where: { tl_code: data.tl_code, tl_id: Not(existingTL.tl_id) },
                });
                if (duplicateCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('tooling.tl_code'));
                }
            }

            // ตรวจสอบว่า fty_name ไม่ซ้ำ
            if (data.tl_type && data.tl_type !== existingTL.tl_type) {
                const duplicateType = await repository.findOne({
                    where: { tl_type: data.tl_type, tl_id: Not(existingTL.tl_id) },
                });
                if (duplicateType) {
                    return response.setIncomplete(lang.msgAlreadyExists('tooling.tl_type'));
                }
            }

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existingTL, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
            });
    
            await repository.save(existingTL); // บันทึกข้อมูล
            
            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(tl_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }
    
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.tooling'), dataResponse.data);

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
            
    async delete(tl_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'ToolingService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_tooling) : this.toolingRepository;

            // ตรวจสอบว่ามี tl_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingTL = await repository.findOne({ where: { tl_id: tl_id } });
            if (!existingTL) {
                return response.setIncomplete(lang.msgNotFound('tooling.tl_id'));
            }

            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, tl_id, reqUsername, 'tl_is_active', 'tl_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
    
            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.tooling'));
    
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
        const operation = 'ToolingService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_tooling) : this.toolingRepository;
    
            // Query tooling ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('tl')
                .select([
                    'tl.tl_id AS tl_id',
                    'tl.tl_code AS tl_code',
                    'tl.tl_type AS tl_type',
                    'tl.tl_remark AS tl_remark',
                    'tl.create_date AS create_date',
                    'tl.create_by AS create_by',
                    'tl.update_date AS update_date',
                    'tl.update_by AS update_by',
                    'tl.tl_is_active AS tl_is_active'
                ])
                .where('tl.tl_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.tooling'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.tooling'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(tl_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'ToolingService.getById';

        try {
            const repository = manager ? manager.getRepository(m_tooling) : this.toolingRepository;
    
            // Query tooling ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('tl')
                .select([
                    'tl.tl_id AS tl_id',
                    'tl.tl_code AS tl_code',
                    'tl.tl_type AS tl_type',
                    'tl.tl_remark AS tl_remark',
                    'tl.create_date AS create_date',
                    'tl.create_by AS create_by',
                    'tl.update_date AS update_date',
                    'tl.update_by AS update_by',
                    'tl.tl_is_active AS tl_is_active'
                ])
                .where('tl.tl_id = :tl_id', { tl_id })
                .andWhere('tl.tl_is_active = :isActive', { isActive: true })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('tooling.tl_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('tooling.tl_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with tl_id: ${tl_id}`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getTLDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'ToolingService.getTLDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_tooling) : this.toolingRepository;
            // ดึงข้อมูลทั้ง tl_id และ tl_type
            const rawData = await repository.createQueryBuilder("tooling")
                .select(["tooling.tl_id", "tooling.tl_type"])
                .where("tooling.tl_type IS NOT NULL") // กรองค่า null ออก
                .andWhere('tooling.tl_is_active = :isActive', { isActive: true })
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.tooling'));
            }
    
            console.log('rawData:', rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ RMDropdownModel
            const data = rawData.map((tl) => new TLDropdownModel(tl.tooling_tl_id, tl.tooling_tl_type));
    
            return response.setComplete(lang.msgFound('item.tooling'), data);
    
        } catch (error: any) {
            console.error('Error during getTLDropdown:', error.message);
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
        const operation = 'FinishedGoodsService.createJson';
    
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
            const repository = useManager.getRepository(m_tooling);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_tooling> = {
                'รหัส': 'tl_code',
                'ประเภท': 'tl_type',
                'หมายเหตุ': 'tl_remark'
            };
    
            console.log('📌 Raw JSON Data:', data);
    
            // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล
            const formattedData: Partial<m_tooling>[] = data.map((row: any, index) => {
                const mappedRow: Partial<m_tooling> = {};
    
                Object.keys(row).forEach((jsonKey) => {
                    const dbField = fieldMapping[jsonKey];
                    if (dbField) {
                        mappedRow[dbField] = row[jsonKey] !== '' ? row[jsonKey] : null; // ✅ ให้ `""` เป็น `null`
                    }
                });
    
                // ✅ ตั้งค่า default values
                mappedRow.tl_is_active = mappedRow.tl_is_active ?? true;
                mappedRow.create_date = new Date();
                mappedRow.create_by = reqUsername;
    
                console.log(`📌 Mapped Row ${index + 1}:`, mappedRow);
                return mappedRow;
            });
    
            console.log("formattedData",formattedData)
            // ✅ ตรวจสอบข้อมูลที่จำเป็น
            for (const item of formattedData) {
                if (validate.isNullOrEmpty(item.tl_code)) {
                    return response.setIncomplete(lang.msgRequired('tooling.tl_code'));
                }
                if (validate.isNullOrEmpty(item.tl_type)) {
                    return response.setIncomplete(lang.msgRequired('tooling.tl_type'));
                }
            }

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_tooling>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.tl_code);
                const isNameDuplicate = seenNames.has(s.tl_type);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.tl_code);
                    seenNames.add(s.tl_type);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.tl_code} (${e.tl_type})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueTLType
            const uniqueTLType = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `tl_code` และ `tl_type` ใน database
            const existingTLType = await repository
                .createQueryBuilder('tl')
                .where('tl.tl_code IN (:...codes) OR tl.tl_type IN (:...names)', {
                    codes: uniqueTLType.map((s) => s.tl_code).filter(Boolean),
                    names: uniqueTLType.map((s) => s.tl_type).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueTLType) ที่ซ้ำกับข้อมูลในระบบ (existingTLType)
            const duplicateInInput = uniqueTLType.filter((s) =>
                existingTLType.some((ex) =>
                    ex.tl_code === s.tl_code || ex.tl_type === s.tl_type
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.tl_code} (${e.tl_type})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedTLType = await repository.save(uniqueTLType);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.tooling'), savedTLType);
    
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