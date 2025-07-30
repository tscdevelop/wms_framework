import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_semi } from '../entities/m_semi.entity';
import { SemiModel } from '../models/semi.model';
import { SemiDropdownModel } from '../models/semi_dropdown.model';
import { deleteEntity } from '../utils/DatabaseUtils';

export class SemiService {
    private semiRepository: Repository<m_semi>;

    constructor(){
        this.semiRepository = AppDataSource.getRepository(m_semi);
    }

    async create(data: Partial<SemiModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<SemiModel>();
        const operation = 'SemiService.create';

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
            const repository = manager ? useManager.getRepository(m_semi): this.semiRepository;

            // Validate required data
            if (validate.isNullOrEmpty(data.semi_code)) {
                return response.setIncomplete(lang.msgRequired('semi.semi_code'));
            }
            if (validate.isNullOrEmpty(data.semi_type)) {
                return response.setIncomplete(lang.msgRequired('semi.semi_type'));
            }
            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            // ตรวจสอบว่า `semi_code` หรือ `semi_type` ที่ส่งมาใน `data` มีอยู่ในฐานข้อมูลหรือไม่
            const existingSemi = await repository
            .createQueryBuilder('semi')
            .where('semi.semi_code = :semi_code OR semi.semi_type = :semi_type', {
                semi_code: data.semi_code,
                semi_type: data.semi_type,
            })
            .getOne();

            // ตรวจสอบว่าพบข้อมูลในฐานข้อมูลหรือไม่
            if (existingSemi) {
                if (existingSemi.semi_code === data.semi_code) {
                    return response.setIncomplete(lang.msgAlreadyExists('semi.semi_code'));
                }
                if (existingSemi.semi_type === data.semi_type) {
                    return response.setIncomplete(lang.msgAlreadyExists('semi.semi_type'));
                }
            }

            const Data = repository.create({
                ...data,
                semi_is_active: data.semi_is_active ?? true,
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
            return response.setComplete(lang.msgSuccessAction('created', 'item.semi'), savedData);

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
        semi_id: number,
        data: Partial<SemiModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<SemiModel>();
        const operation = 'SemiService.update';
    
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
            const repository = manager ? useManager.getRepository(m_semi) : this.semiRepository;

            // ตรวจสอบว่ามี semi_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingSemi = await repository.findOne({ where: { semi_id: semi_id } });
            if (!existingSemi) {
                return response.setIncomplete(lang.msgNotFound('semi.semi_id'));
            }
    
            // ตรวจสอบค่าที่จำเป็น
            if (validate.isNullOrEmpty(data.semi_code)) {
                return response.setIncomplete(lang.msgRequired('semi.semi_code'));
            }
            if (validate.isNullOrEmpty(data.semi_type)) {
                return response.setIncomplete(lang.msgRequired('semi.semi_type'));
            }
    
            // ตรวจสอบว่า semi_code ไม่ซ้ำ
            if (data.semi_code && data.semi_code !== existingSemi.semi_code) {
                const duplicateCode = await repository.findOne({
                    where: { semi_code: data.semi_code, semi_id: Not(existingSemi.semi_id) },
                });
                if (duplicateCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('semi.semi_code'));
                }
            }

            // ตรวจสอบว่า fty_name ไม่ซ้ำ
            if (data.semi_type && data.semi_type !== existingSemi.semi_type) {
                const duplicateType = await repository.findOne({
                    where: { semi_type: data.semi_type, semi_id: Not(existingSemi.semi_id) },
                });
                if (duplicateType) {
                    return response.setIncomplete(lang.msgAlreadyExists('semi.semi_type'));
                }
            }

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existingSemi, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
            });
    
            await repository.save(existingSemi); // บันทึกข้อมูล

            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(semi_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }
    
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.semi'), dataResponse.data);

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
            throw error;
    
        } finally {
            // ปิดการใช้งาน QueryRunner
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async delete(semi_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'SemiService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_semi) : this.semiRepository;

            // ตรวจสอบว่ามี semi_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingSemi = await repository.findOne({ where: { semi_id: semi_id } });
            if (!existingSemi) {
                return response.setIncomplete(lang.msgNotFound('semi.semi_id'));
            }
            
            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, semi_id, reqUsername, 'semi_is_active', 'semi_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }

            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.semi'));
    
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
            throw error
    
        } finally {
            // ปิดการใช้งาน QueryRunner
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'SemiService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_semi) : this.semiRepository;
    
            // Query semi ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('semi')
                .select([
                    'semi.semi_id AS semi_id',
                    'semi.semi_code AS semi_code',
                    'semi.semi_type AS semi_type',
                    'semi.semi_remark AS semi_remark',
                    'semi.create_date AS create_date',
                    'semi.create_by AS create_by',
                    'semi.update_date AS update_date',
                    'semi.update_by AS update_by',
                    'semi.semi_is_active AS semi_is_active'
                ])
                .where('semi.semi_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.semi'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.semi'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(semi_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'SemiService.getById';

        try {
            const repository = manager ? manager.getRepository(m_semi) : this.semiRepository;

            // Query semi ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('semi')
                .select([
                    'semi.semi_id AS semi_id',
                    'semi.semi_code AS semi_code',
                    'semi.semi_type AS semi_type',
                    'semi.semi_remark AS semi_remark',
                    'semi.create_date AS create_date',
                    'semi.create_by AS create_by',
                    'semi.update_date AS update_date',
                    'semi.update_by AS update_by',
                    'semi.semi_is_active AS semi_is_active'
                ])
                .where('semi.semi_id = :semi_id', { semi_id })
                .andWhere('semi.semi_is_active = :isActive', { isActive: true })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('semi.semi_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('semi.semi_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with semi_id: ${semi_id}`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getSemiDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'SemiService.getSemiDropdown';
    
        try { 
            const repository = manager ? manager.getRepository(m_semi) : this.semiRepository;
            // ดึงข้อมูลทั้ง semi_id และ semi_type
            const rawData = await repository.createQueryBuilder("semi")
                .select(["semi.semi_id", "semi.semi_type"])
                .where("semi.semi_type IS NOT NULL") // กรองค่า null ออก
                .andWhere('semi.semi_is_active = :isActive', { isActive: true })
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.semi'));
            }
    
            console.log('rawData:', rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ RMDropdownModel
            const data = rawData.map((semi) => new SemiDropdownModel(semi.semi_semi_id, semi.semi_semi_type));
    
            return response.setComplete(lang.msgFound('item.semi'), data);
    
        } catch (error: any) {
            console.error('Error during getSemiDropdown:', error.message);
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
        const operation = 'SemiService.createJson';
    
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
            const repository = useManager.getRepository(m_semi);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_semi> = {
                'รหัส': 'semi_code',
                'ประเภท': 'semi_type',
                'หมายเหตุ': 'semi_remark'
            };
    
            console.log('📌 Raw JSON Data:', data);
    
            // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล
            const formattedData: Partial<m_semi>[] = data.map((row: any, index) => {
                const mappedRow: Partial<m_semi> = {};
    
                Object.keys(row).forEach((jsonKey) => {
                    const dbField = fieldMapping[jsonKey];
                    if (dbField) {
                        mappedRow[dbField] = row[jsonKey] !== '' ? row[jsonKey] : null; // ✅ ให้ `""` เป็น `null`
                    }
                });
    
                // ✅ ตั้งค่า default values
                mappedRow.semi_is_active = mappedRow.semi_is_active ?? true;
                mappedRow.create_date = new Date();
                mappedRow.create_by = reqUsername;
    
                console.log(`📌 Mapped Row ${index + 1}:`, mappedRow);
                return mappedRow;
            });
    
            console.log("formattedData",formattedData)
            // ✅ ตรวจสอบข้อมูลที่จำเป็น
            for (const item of formattedData) {
                if (validate.isNullOrEmpty(item.semi_code)) {
                    return response.setIncomplete(lang.msgRequired('semi.semi_code'));
                }
                if (validate.isNullOrEmpty(item.semi_type)) {
                    return response.setIncomplete(lang.msgRequired('semi.semi_type'));
                }
            }

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_semi>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.semi_code);
                const isNameDuplicate = seenNames.has(s.semi_type);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.semi_code);
                    seenNames.add(s.semi_type);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.semi_code} (${e.semi_type})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueSemiType
            const uniqueSemiType = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `semi_code` และ `semi_type` ใน database
            const existingSemiType = await repository
                .createQueryBuilder('semi')
                .where('semi.semi_code IN (:...codes) OR semi.semi_type IN (:...names)', {
                    codes: uniqueSemiType.map((s) => s.semi_code).filter(Boolean),
                    names: uniqueSemiType.map((s) => s.semi_type).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueSemiType) ที่ซ้ำกับข้อมูลในระบบ (existingSemiType)
            const duplicateInInput = uniqueSemiType.filter((s) =>
                existingSemiType.some((ex) =>
                    ex.semi_code === s.semi_code || ex.semi_type === s.semi_type
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.semi_code} (${e.semi_type})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedSemiType = await repository.save(uniqueSemiType);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.semi'), savedSemiType);
    
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