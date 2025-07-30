import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_criteria } from '../entities/m_criteria.entity';
import { CriteriaModel } from '../models/criteria.model';
import { CrtDropdownModel } from '../models/criteria_dropdown.model';
import { deleteEntity } from '../utils/DatabaseUtils';

export class CriteriaService {
    private criteriaRepository: Repository<m_criteria>;

    constructor(){
        this.criteriaRepository = AppDataSource.getRepository(m_criteria);
    }

    async create(data: Partial<CriteriaModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<CriteriaModel>();
        const operation = 'CriteriaService.create';

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

            const repository = manager ? useManager.getRepository(m_criteria) : this.criteriaRepository;

            if (validate.isNullOrEmpty(data.crt_name)) {
                return response.setIncomplete(lang.msgRequired('criteria.crt_name'));
            }
            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            // ตรวจสอบว่า crt_name มีอยู่ในฐานข้อมูลหรือไม่
            const existingName = await repository.findOne({ where: { crt_name: data.crt_name } });
            if (existingName) {
                return response.setIncomplete(lang.msgAlreadyExists('criteria.crt_name'));
            }

            const Data = repository.create({
                ...data,
                crt_is_active: data.crt_is_active ?? true,
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
            return response.setComplete(lang.msgSuccessAction('created', 'item.criteria'), savedData);

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
        crt_id: number,
        data: Partial<CriteriaModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<CriteriaModel>();
        const operation = 'CriteriaService.update';
    
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
            const repository = manager ? useManager.getRepository(m_criteria) : this.criteriaRepository;

            // ตรวจสอบว่ามี crt_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingCrt = await repository.findOne({ where: { crt_id: crt_id } });
            if (!existingCrt) {
                return response.setIncomplete(lang.msgNotFound('criteria.crt_id'));
            }
    
            // ตรวจสอบว่า crt_name ไม่ซ้ำ
            if (data.crt_name && data.crt_name !== existingCrt.crt_name) {
                const duplicateName = await repository.findOne({
                    where: { crt_name: data.crt_name, crt_id: Not(crt_id) },
                });
                if (duplicateName) {
                    return response.setIncomplete(lang.msgAlreadyExists('criteria.crt_name'));
                }
            }

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existingCrt, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
            });
    
            await repository.save(existingCrt); // บันทึกข้อมูล
            
            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(crt_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }
    
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.criteria'), dataResponse.data);
        
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

    async delete(crt_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'CriteriaService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_criteria) : this.criteriaRepository;

            // ตรวจสอบว่ามี crt_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingCrt = await repository.findOne({ where: { crt_id: crt_id } });
            if (!existingCrt) {
                return response.setIncomplete(lang.msgNotFound('criteria.crt_id'));
            }
            
            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, crt_id, reqUsername, 'crt_is_active', 'crt_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
    
            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.criteria'));
    
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
        const operation = 'CriteriaService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(m_criteria) : this.criteriaRepository;
    
            // Query criteria ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('crt')
                .select([
                    'crt.crt_id AS crt_id',
                    'crt.crt_name AS crt_name',
                    // ใช้ CONCAT และ COALESCE เพื่อป้องกันค่าที่เป็น NULL
                    // ใส่ , ให้ crt_exp
                    `CONCAT(
                        COALESCE(NULLIF(crt.crt_exp_low, ''), ''),
                        CASE 
                            WHEN crt.crt_exp_low IS NOT NULL AND crt.crt_exp_medium IS NOT NULL THEN ', ' 
                            ELSE '' 
                        END,
                        COALESCE(NULLIF(crt.crt_exp_medium, ''), ''),
                        CASE 
                            WHEN crt.crt_exp_medium IS NOT NULL AND crt.crt_exp_high IS NOT NULL THEN ', ' 
                            ELSE '' 
                        END,
                        COALESCE(NULLIF(crt.crt_exp_high, ''), '')
                    ) AS crt_exp`,
                    // ใส่ , ให้ crt_txn
                    `CONCAT(
                        COALESCE(NULLIF(crt.crt_txn_low, ''), ''),
                        CASE 
                            WHEN crt.crt_txn_low IS NOT NULL AND crt.crt_txn_medium IS NOT NULL THEN ', ' 
                            ELSE '' 
                        END,
                        COALESCE(NULLIF(crt.crt_txn_medium, ''), ''),
                        CASE 
                            WHEN crt.crt_txn_medium IS NOT NULL AND crt.crt_txn_high IS NOT NULL THEN ', ' 
                            ELSE '' 
                        END,
                        COALESCE(NULLIF(crt.crt_txn_high, ''), '')
                    ) AS crt_txn`,
                    // ใส่ , ให้ crt_rem
                    `CONCAT(
                        COALESCE(NULLIF(crt.crt_rem_low, ''), ''),
                        CASE 
                            WHEN crt.crt_rem_low IS NOT NULL AND crt.crt_rem_medium IS NOT NULL THEN ', ' 
                            ELSE '' 
                        END,
                        COALESCE(NULLIF(crt.crt_rem_medium, ''), ''),
                        CASE 
                            WHEN crt.crt_rem_medium IS NOT NULL AND crt.crt_rem_high IS NOT NULL THEN ', ' 
                            ELSE '' 
                        END,
                        COALESCE(NULLIF(crt.crt_rem_high, ''), '')
                    ) AS crt_rem`,
                    'crt.crt_remark AS crt_remark',
                    'crt.crt_is_active AS crt_is_active'
                ])
                .where('crt.crt_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.criteria'));
            }
    
            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.criteria'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }    

    async getById(crt_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'CriteriaService.getById';

        try {
            const repository = manager ? manager.getRepository(m_criteria) : this.criteriaRepository;
    
            // Query criteria ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('crt')
                .select([
                    'crt.crt_id AS crt_id',
                    'crt.crt_name AS crt_name',
                    'crt.crt_remark AS crt_remark',
                    'crt.crt_exp_low AS crt_exp_low',
                    'crt.crt_exp_medium AS crt_exp_medium',
                    'crt.crt_exp_high AS crt_exp_high',
                    'crt.crt_txn_low AS crt_txn_low',
                    'crt.crt_txn_medium AS crt_txn_medium',
                    'crt.crt_txn_high AS crt_txn_high',
                    'crt.crt_rem_low AS crt_rem_low',
                    'crt.crt_rem_medium AS crt_rem_medium',
                    'crt.crt_rem_high AS crt_rem_high'
                ])
                .where('crt.crt_id = :crt_id', { crt_id })
                .andWhere('crt.crt_is_active = :isActive', { isActive: true })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('criteria.crt_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('criteria.crt_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with crt_id: ${crt_id}`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getCrtDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'CriteriaService.getCrtDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_criteria) : this.criteriaRepository;

            // ดึงข้อมูลทั้ง crt_id และ crt_name
            const rawData = await repository.createQueryBuilder("criteria")
                .select([
                    "criteria.crt_id", "criteria.crt_name" // รวม crt_id และ crt_name
                ])
                .where("criteria.crt_id IS NOT NULL") // กรองค่า null ออก
                .andWhere('criteria.crt_is_active = :isActive', { isActive: true })  // ดึงเฉพาะข้อมูลที่ยังไม่ถูกลบ
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.criteria'));
            }
    
            console.log('rawData:', rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ CrtDropdownModel
            const data = rawData.map((Crt) => new CrtDropdownModel(Crt.criteria_crt_id,Crt.criteria_crt_name));
        
            return response.setComplete(lang.msgFound('item.criteria'), data);
    
        } catch (error: any) {
            console.error('Error during getDYDropdown:', error.message);
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
        const operation = 'CriteriaService.createJson';
    
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
            const repository = useManager.getRepository(m_criteria);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_criteria> = {
                'ชื่อเกณฑ์': 'crt_name',
                'กำหนดวันหมดอายุ(LowLevel)': 'crt_exp_low',
                'กำหนดวันหมดอายุ(MediumLevel)': 'crt_exp_medium',
                'กำหนดวันหมดอายุ(HighLevel)': 'crt_exp_high',
                'กำหนดวันเบิก-คืนอุปกรณ์(LowLevel)': 'crt_txn_low',
                'กำหนดวันเบิก-คืนอุปกรณ์(MediumLevel)': 'crt_txn_medium',
                'กำหนดวันเบิก-คืนอุปกรณ์(HighLevel)': 'crt_txn_high',
                'กำหนดจำนวนคงเหลือ(LowLevel)': 'crt_rem_low',
                'กำหนดจำนวนคงเหลือ(MediumLevel)': 'crt_rem_medium',
                'กำหนดจำนวนคงเหลือ(HighLevel)': 'crt_rem_high',
                'หมายเหตุ': 'crt_remark',
            };
    
            console.log('📌 Raw JSON Data:', data);
    
            // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล
            const formattedData: Partial<m_criteria>[] = data.map((row: any, index) => {
                const mappedRow: Partial<m_criteria> = {};
    
                Object.keys(row).forEach((jsonKey) => {
                    const dbField = fieldMapping[jsonKey];
                    if (dbField) {
                        mappedRow[dbField] = row[jsonKey] !== '' ? row[jsonKey] : null; // ✅ ให้ `""` เป็น `null`
                    }
                });
    
                // ✅ ตั้งค่า default values
                mappedRow.crt_is_active = mappedRow.crt_is_active ?? true;
                mappedRow.create_date = new Date();
                mappedRow.create_by = reqUsername;
    
                console.log(`📌 Mapped Row ${index + 1}:`, mappedRow);
                return mappedRow;
            });
    
            console.log("formattedData",formattedData)
            // ✅ ตรวจสอบข้อมูลที่จำเป็น
            for (const item of formattedData) {
                if (validate.isNullOrEmpty(item.crt_name)) {
                    return response.setIncomplete(lang.msgRequired('criteria.crt_name'));
                }
            }

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenNames = new Set();
            const duplicateEntries: Partial<m_criteria>[] = [];

            formattedData.forEach((s) => {
                const isNameDuplicate = seenNames.has(s.crt_name);

                if (isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenNames.add(s.crt_name);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.crt_name}`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueCriteria
            const uniqueCriteria = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `crt_name` ใน database
            const existingCriteria = await repository
                .createQueryBuilder('crt')
                .where('crt.crt_name IN (:...codes)', {
                    codes: uniqueCriteria.map((s) => s.crt_name).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueCriteria) ที่ซ้ำกับข้อมูลในระบบ (existingCriteria)
            const duplicateInInput = uniqueCriteria.filter((s) =>
                existingCriteria.some((ex) =>
                    ex.crt_name === s.crt_name
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.crt_name}`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedCriteria = await repository.save(uniqueCriteria);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.criteria'), savedCriteria);
    
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