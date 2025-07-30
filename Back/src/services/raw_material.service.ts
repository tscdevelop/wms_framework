import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils
import CodeGenerator from '../utils/CodeGenerator';

import { m_raw_material } from '../entities/m_raw_material.entity';
import { RawMaterialModel } from '../models/raw_material.model';
import { RMDropdownModel } from '../models/raw_material_dropdown.model';
import { deleteEntity } from '../utils/DatabaseUtils';

export class RawMaterialService {
    private rawmaterialRepository: Repository<m_raw_material>;

    constructor(){
        this.rawmaterialRepository = AppDataSource.getRepository(m_raw_material);
    }

    async create(data: Partial<RawMaterialModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<RawMaterialModel>();
        const operation = 'RawMaterialService.create';

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

            const repository = manager ? useManager.getRepository(m_raw_material) : this.rawmaterialRepository;

            // Validate required data
            if (validate.isNullOrEmpty(data.rm_code)) {
                return response.setIncomplete(lang.msgRequired('raw_material.rm_code'));
            }
            if (validate.isNullOrEmpty(data.rm_type)) {
                return response.setIncomplete(lang.msgRequired('raw_material.rm_type'));
            }
            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            // ตรวจสอบว่า `rm_code` หรือ `rm_type` ที่ส่งมาใน `data` มีอยู่ในฐานข้อมูลหรือไม่
            const existingRM = await repository
            .createQueryBuilder('rm')
            .where('rm.rm_code = :rm_code OR rm.rm_type = :rm_type', { 
                rm_code: data.rm_code, 
                rm_type: data.rm_type })
            .getOne();

            // ตรวจสอบว่าพบข้อมูลในฐานข้อมูลหรือไม่
            if (existingRM) {
                if (existingRM.rm_code === data.rm_code) {
                    return response.setIncomplete(lang.msgAlreadyExists('raw_material.rm_code'));
                }
                if (existingRM.rm_type === data.rm_type) {
                    return response.setIncomplete(lang.msgAlreadyExists('raw_material.rm_type'));
                }
            }

            const rmData = repository.create({
                ...data,
                rm_is_active: data.rm_is_active ?? true,
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
            return response.setComplete(lang.msgSuccessAction('created', 'item.raw_material'), savedData);

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
        rm_id: number,
        data: Partial<RawMaterialModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<RawMaterialModel>();
        const operation = 'RawMaterialService.update';
    
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
            const repository = manager ? useManager.getRepository(m_raw_material) : this.rawmaterialRepository;

            // ตรวจสอบว่ามี rm_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingRM = await repository.findOne({ where: { rm_id: rm_id } });
            if (!existingRM) {
                return response.setIncomplete(lang.msgNotFound('raw_material.rm_id'));
            }
    
            // ตรวจสอบค่าที่จำเป็น
            if (validate.isNullOrEmpty(data.rm_code)) {
                return response.setIncomplete(lang.msgRequired('raw_material.rm_code'));
            }
            if (validate.isNullOrEmpty(data.rm_type)) {
                return response.setIncomplete(lang.msgRequired('raw_material.rm_type'));
            }
    
            // ตรวจสอบว่า rm_code ไม่ซ้ำ
            if (data.rm_code && data.rm_code !== existingRM.rm_code) {
                const duplicateCode = await repository.findOne({
                    where: { rm_code: data.rm_code, rm_id: Not(existingRM.rm_id) },
                });
                if (duplicateCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('raw_material.rm_code'));
                }
            }

            // ตรวจสอบว่า fty_name ไม่ซ้ำ
            if (data.rm_type && data.rm_type !== existingRM.rm_type) {
                const duplicateType = await repository.findOne({
                    where: { rm_type: data.rm_type, rm_id: Not(existingRM.rm_id) },
                });
                if (duplicateType) {
                    return response.setIncomplete(lang.msgAlreadyExists('raw_material.rm_type'));
                }
            }

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existingRM, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
            });
    
            await repository.save(existingRM); // บันทึกข้อมูล
            
            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(rm_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }
    
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.raw_material'), dataResponse.data);

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
            
    async delete(rm_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'RawMaterialService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_raw_material) : this.rawmaterialRepository;

            // ตรวจสอบว่ามี rm_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingRM = await repository.findOne({ where: { rm_id: rm_id } });
            if (!existingRM) {
                return response.setIncomplete(lang.msgNotFound('raw_material.rm_id'));
            }

              // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, rm_id, reqUsername, 'rm_is_active', 'rm_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
            
            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.raw_material'));
    
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
        const operation = 'RawMaterialService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_raw_material) : this.rawmaterialRepository;
    
            // Query raw_material ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('rm')
                .select([
                    'rm.rm_id AS rm_id',
                    'rm.rm_code AS rm_code',
                    'rm.rm_type AS rm_type',
                    'rm.rm_remark AS rm_remark',
                    'rm.create_date AS create_date',
                    'rm.create_by AS create_by',
                    'rm.update_date AS update_date',
                    'rm.update_by AS update_by',
                    'rm.rm_is_active AS rm_is_active'
                ])
                .where('rm.rm_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.raw_material'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.raw_material'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(rm_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'RawMaterialService.getById';

        try {
            const repository = manager ? manager.getRepository(m_raw_material) : this.rawmaterialRepository;
    
            // Query raw_material ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('rm')
                .select([
                    'rm.rm_id AS rm_id',
                    'rm.rm_code AS rm_code',
                    'rm.rm_type AS rm_type',
                    'rm.rm_remark AS rm_remark',
                    'rm.create_date AS create_date',
                    'rm.create_by AS create_by',
                    'rm.update_date AS update_date',
                    'rm.update_by AS update_by',
                    'rm.rm_is_active AS rm_is_active'
                ])
                .where('rm.rm_id = :rm_id', { rm_id })
                .andWhere('rm.rm_is_active = :isActive', { isActive: true })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('raw_material.rm_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('raw_material.rm_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with rm_id: ${rm_id}`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getRMDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'RawMaterialService.getRMDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_raw_material) : this.rawmaterialRepository;
            // ดึงข้อมูลทั้ง rm_id และ rm_type
            const rawData = await repository.createQueryBuilder("rawMaterial")
                .select(["rawMaterial.rm_id", "rawMaterial.rm_type"])
                .where("rawMaterial.rm_type IS NOT NULL") // กรองค่า null ออก
                .andWhere('rawMaterial.rm_is_active = :isActive', { isActive: true })
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.raw_material'));
            }
    
            console.log('rawData:', rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ RMDropdownModel
            const data = rawData.map((rm) => new RMDropdownModel(rm.rawMaterial_rm_id, rm.rawMaterial_rm_type));
    
            return response.setComplete(lang.msgFound('item.raw_material'), data);
    
        } catch (error: any) {
            console.error('Error during getRMDropdown:', error.message);
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
        const operation = 'RawMaterialService.createJson';
    
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
            const repository = useManager.getRepository(m_raw_material);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_raw_material> = {
                'รหัส': 'rm_code',
                'ประเภท': 'rm_type',
                'หมายเหตุ': 'rm_remark'
            };
    
            console.log('📌 Raw JSON Data:', data);
    
            // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล
            const formattedData: Partial<m_raw_material>[] = data.map((row: any, index) => {
                const mappedRow: Partial<m_raw_material> = {};
    
                Object.keys(row).forEach((jsonKey) => {
                    const dbField = fieldMapping[jsonKey];
                    if (dbField) {
                        mappedRow[dbField] = row[jsonKey] !== '' ? row[jsonKey] : null; // ✅ ให้ `""` เป็น `null`
                    }
                });
    
                // ✅ ตั้งค่า default values
                mappedRow.rm_is_active = mappedRow.rm_is_active ?? true;
                mappedRow.create_date = new Date();
                mappedRow.create_by = reqUsername;
    
                console.log(`📌 Mapped Row ${index + 1}:`, mappedRow);
                return mappedRow;
            });
    
            console.log("formattedData",formattedData)
            // ✅ ตรวจสอบข้อมูลที่จำเป็น
            for (const item of formattedData) {
                if (validate.isNullOrEmpty(item.rm_code)) {
                    return response.setIncomplete(lang.msgRequired('raw_material.rm_code'));
                }
                if (validate.isNullOrEmpty(item.rm_type)) {
                    return response.setIncomplete(lang.msgRequired('raw_material.rm_type'));
                }
            }

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_raw_material>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.rm_code);
                const isNameDuplicate = seenNames.has(s.rm_type);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.rm_code);
                    seenNames.add(s.rm_type);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.rm_code} (${e.rm_type})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueRMType
            const uniqueRMType = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `rm_code` และ `rm_type` ใน database
            const existingRMType = await repository
                .createQueryBuilder('rm')
                .where('rm.rm_code IN (:...codes) OR rm.rm_type IN (:...names)', {
                    codes: uniqueRMType.map((s) => s.rm_code).filter(Boolean),
                    names: uniqueRMType.map((s) => s.rm_type).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueRMType) ที่ซ้ำกับข้อมูลในระบบ (existingRMType)
            const duplicateInInput = uniqueRMType.filter((s) =>
                existingRMType.some((ex) =>
                    ex.rm_code === s.rm_code || ex.rm_type === s.rm_type
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.rm_code} (${e.rm_type})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedRMType = await repository.save(uniqueRMType);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.raw_material'), savedRMType);
    
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