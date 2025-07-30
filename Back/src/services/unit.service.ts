import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils
import * as genum from '../common/global.enum';

import { m_unit } from '../entities/m_unit.entity';
import { UnitModel } from '../models/unit.model';
import { UnitDropdownModel } from '../models/unit_dropdown.model';
import { deleteEntity } from '../utils/DatabaseUtils';

export class UnitService {
    private unitRepository: Repository<m_unit>;

    constructor(){
        this.unitRepository = AppDataSource.getRepository(m_unit);
    }

    async create(data: Partial<UnitModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<UnitModel>();
        const operation = 'UnitService.create';

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
            
            const repository = manager ? useManager.getRepository(m_unit) : this.unitRepository;

            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            // ตรวจสอบว่าข้อมูลที่ส่งมาใน `data` มีอยู่ในฐานข้อมูลหรือไม่
            const existingUnit = await repository
            .createQueryBuilder('unit')
            .where('unit.unit_name_th = :unit_name_th OR unit.unit_name_en = :unit_name_en OR unit.unit_abbr_th = :unit_abbr_th OR unit.unit_abbr_en = :unit_abbr_en', { 
                unit_name_th: data.unit_name_th, 
                unit_name_en: data.unit_name_en,
                unit_abbr_th: data.unit_abbr_th, 
                unit_abbr_en: data.unit_abbr_en })
            .getOne();

            // ตรวจสอบว่าพบข้อมูลในฐานข้อมูลหรือไม่
            if (existingUnit) {
                if (existingUnit.unit_name_th === data.unit_name_th) {
                    return response.setIncomplete(lang.msgAlreadyExists('unit.unit_name_th'));
                }
                if (existingUnit.unit_name_en === data.unit_name_en) {
                    return response.setIncomplete(lang.msgAlreadyExists('unit.unit_name_en'));
                }
                if (existingUnit.unit_abbr_th === data.unit_abbr_th) {
                    return response.setIncomplete(lang.msgAlreadyExists('unit.unit_abbr_th'));
                }
                if (existingUnit.unit_abbr_en === data.unit_abbr_en) {
                    return response.setIncomplete(lang.msgAlreadyExists('unit.unit_abbr_en'));
                }
            }
            
            // บันทึกข้อมูล
            const unitData = repository.create({
                ...data,
                unit_is_active: data.unit_is_active ?? true,
                create_date: new Date(),
                create_by: reqUsername,
            });

            // บันทึก entity (unit) ลงฐานข้อมูล
            const savedData = await repository.save(unitData);

            // Commit Transaction หลังบันทึกข้อมูลสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            // ดึงข้อมูล user ที่สร้างใหม่
            return response.setComplete(lang.msgSuccessAction('created', 'item.unit'), savedData);

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
        unit_id: number,
        data: Partial<UnitModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<UnitModel>();
        const operation = 'UnitService.update';
    
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
            const repository = manager ? useManager.getRepository(m_unit) : this.unitRepository;

            // ตรวจสอบว่ามี unit_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingUnitId = await repository.findOne({ where: { unit_id: unit_id } });
            if (!existingUnitId) {
                return response.setIncomplete(lang.msgNotFound('unit.unit_id'));
            }
            
            // ตรวจสอบว่าข้อมูลที่ส่งมาใน `data` มีอยู่ในฐานข้อมูลหรือไม่
            const existingUnit = await repository
            .createQueryBuilder('unit')
            .where( '(unit.unit_name_th = :unit_name_th OR unit.unit_name_en = :unit_name_en OR unit.unit_abbr_th = :unit_abbr_th OR unit.unit_abbr_en = :unit_abbr_en) AND unit.unit_id != :unit_id', { 
                unit_name_th: data.unit_name_th, 
                unit_name_en: data.unit_name_en,
                unit_abbr_th: data.unit_abbr_th, 
                unit_abbr_en: data.unit_abbr_en,
                unit_id: unit_id })
            .getOne();

            // ตรวจสอบว่าพบข้อมูลในฐานข้อมูลหรือไม่
            if (existingUnit) {
                if (existingUnit.unit_name_th === data.unit_name_th) {
                    return response.setIncomplete(lang.msgAlreadyExists('unit.unit_name_th'));
                }
                if (existingUnit.unit_name_en === data.unit_name_en) {
                    return response.setIncomplete(lang.msgAlreadyExists('unit.unit_name_en'));
                }
                if (existingUnit.unit_abbr_th === data.unit_abbr_th) {
                    return response.setIncomplete(lang.msgAlreadyExists('unit.unit_abbr_th'));
                }
                if (existingUnit.unit_abbr_en === data.unit_abbr_en) {
                    return response.setIncomplete(lang.msgAlreadyExists('unit.unit_abbr_en'));
                }
            }

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existingUnitId, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
            });
    
            await repository.save(existingUnitId); // บันทึกข้อมูล
    
            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(unit_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }
    
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.unit'), dataResponse.data);
    
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

    async delete(unit_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'UnitService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_unit) : this.unitRepository;

            // ตรวจสอบว่ามี unit_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingUnit = await repository.findOne({ where: { unit_id: unit_id } });
            if (!existingUnit) {
                return response.setIncomplete(lang.msgNotFound('unit.unit_id'));
            }

            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, unit_id, reqUsername, 'unit_is_active', 'unit_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
            
            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.unit'));
    
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
        const operation = 'UnitService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_unit) : this.unitRepository;
    
            // Query unit ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('unit')
                .select([
                    'unit.unit_id AS unit_id',
                    'unit.unit_name_th AS unit_name_th',
                    'unit.unit_name_en AS unit_name_en',
                    'unit.unit_abbr_th AS unit_abbr_th',
                    'unit.unit_abbr_en AS unit_abbr_en',
                    'unit.create_date AS create_date',
                    'unit.create_by AS create_by',
                    'unit.update_date AS update_date',
                    'unit.update_by AS update_by',
                    'unit.unit_is_active AS unit_is_active'
                ])
                .where('unit.unit_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.unit'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.unit'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getById(unit_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'UnitService.getById';

        try {
            const repository = manager ? manager.getRepository(m_unit) : this.unitRepository;
    
            // Query unit ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('unit')
                .select([
                    'unit.unit_id AS unit_id',
                    'unit.unit_name_th AS unit_name_th',
                    'unit.unit_name_en AS unit_name_en',
                    'unit.unit_abbr_th AS unit_abbr_th',
                    'unit.unit_abbr_en AS unit_abbr_en',
                    'unit.create_date AS create_date',
                    'unit.create_by AS create_by',
                    'unit.update_date AS update_date',
                    'unit.update_by AS update_by',
                    'unit.unit_is_active AS unit_is_active'
                ])
                .where('unit.unit_id = :unit_id', { unit_id })
                .andWhere('unit.unit_is_active = :isActive', { isActive: true })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('unit.unit_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('unit.unit_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with unit_id: ${unit_id}`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getUnitDropdown(language:string, manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'UnitService.getUnitDropdown';
    
        if (!language) {
            return response.setIncomplete(lang.msgInvalidParameter());
        }

        try {
            const repository = manager ? manager.getRepository(m_unit) : this.unitRepository;
            // ดึงข้อมูลทั้ง unit_id และ unit_abbr_th
            const rawData = await repository.createQueryBuilder("unit")
                .select([
                    "unit.unit_id AS unit_id", 
                    "unit.unit_abbr_th AS unit_abbr_th",
                    "unit.unit_abbr_en AS unit_abbr_en"
                ])
                .where("unit.unit_abbr_th IS NOT NULL AND unit.unit_abbr_en IS NOT NULL") // กรองค่า null ออก
                .andWhere('unit.unit_is_active = :isActive', { isActive: true })
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.unit'));
            }
    
            console.log('rawData:', rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // เลือกใช้ชื่อแผนกตามภาษาที่ส่งมา
            // const data = rawData.map((unit: any) => {
            //     const text = language === genum.Language.TH ? unit.unit_abbr_th : unit.unit_abbr_en;
            //     return new UnitDropdownModel(unit.unit_id, text);
            // });
            // แปลงข้อมูลให้อยู่ในรูปแบบ UnitDropdownModel
            const data = rawData.map((unit) => new UnitDropdownModel(unit.unit_id,unit.unit_abbr_th));

            return response.setComplete(lang.msgFound('item.unit'), data);
    
        } catch (error: any) {
            console.error('Error during getUnitDropdown:', error.message);
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
        const operation = 'UnitService.createJson';
    
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
            const repository = useManager.getRepository(m_unit);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_unit> = {
                'หน่วย': 'unit_name_th',
                'หน่วย(คำย่อ)': 'unit_abbr_th',
                'Unit': 'unit_name_en',
                'Unit(Abbreviation)': 'unit_abbr_en'
            };
    
            console.log('📌 Raw JSON Data:', data);
    
            // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล
            const formattedData: Partial<m_unit>[] = data.map((row: any, index) => {
                const mappedRow: Partial<m_unit> = {};
    
                Object.keys(row).forEach((jsonKey) => {
                    const dbField = fieldMapping[jsonKey];
                    if (dbField) {
                        mappedRow[dbField] = row[jsonKey] !== '' ? row[jsonKey] : null; // ✅ ให้ `""` เป็น `null`
                    }
                });
    
                // ✅ ตั้งค่า default values
                mappedRow.unit_is_active = mappedRow.unit_is_active ?? true;
                mappedRow.create_date = new Date();
                mappedRow.create_by = reqUsername;
    
                console.log(`📌 Mapped Row ${index + 1}:`, mappedRow);
                return mappedRow;
            });
    
            console.log("formattedData",formattedData)
            // ✅ ตรวจสอบข้อมูลที่จำเป็น
            for (const item of formattedData) {
                if (validate.isNullOrEmpty(item.unit_name_th)) {
                    return response.setIncomplete(lang.msgRequired('unit.unit_name_th'));
                }
                if (validate.isNullOrEmpty(item.unit_abbr_th)) {
                    return response.setIncomplete(lang.msgRequired('unit.unit_abbr_th'));
                }
                if (validate.isNullOrEmpty(item.unit_name_en)) {
                    return response.setIncomplete(lang.msgRequired('unit.unit_name_en'));
                }
                if (validate.isNullOrEmpty(item.unit_abbr_en)) {
                    return response.setIncomplete(lang.msgRequired('unit.unit_abbr_en'));
                }
            }

    /* เช็คซ้ำกันเองใน excel */
            // ✅ ตรวจสอบข้อมูลที่ซ้ำกันเองใน Excel (ถ้า field ใด field หนึ่งซ้ำ ก็ถือว่าซ้ำ)
            const seenUnits = new Set<string>();
            const duplicateEntries: Partial<m_unit>[] = [];

            formattedData.forEach((s) => {
                const keys = [
                    s.unit_name_th?.trim(),
                    s.unit_abbr_th?.trim(),
                    s.unit_name_en?.trim(),
                    s.unit_abbr_en?.trim()
                ];

                // ตรวจว่าฟิลด์ใดซ้ำบ้าง
                const isDuplicate = keys.some(key => seenUnits.has(key || ''));

                if (isDuplicate) {
                    duplicateEntries.push(s);
                }

                keys.forEach(key => {
                    if (key) seenUnits.add(key);
                });
            });

            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    duplicateEntries.map(e => `${e.unit_name_th} (${e.unit_abbr_th})`).join(', ')
                );
            }
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueUnits
            const uniqueUnits = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำกับฐานข้อมูล (ถ้า field ใด field หนึ่งซ้ำ ก็ถือว่าซ้ำ)
            const existingUnits = await repository
                .createQueryBuilder('unit')
                .where('unit.unit_name_th IN (:...nameTh) OR unit.unit_abbr_th IN (:...abbrTh) OR unit.unit_name_en IN (:...nameEn) OR unit.unit_abbr_en IN (:...abbrEn)', {
                    nameTh: formattedData.map(s => s.unit_name_th).filter(Boolean),
                    abbrTh: formattedData.map(s => s.unit_abbr_th).filter(Boolean),
                    nameEn: formattedData.map(s => s.unit_name_en).filter(Boolean),
                    abbrEn: formattedData.map(s => s.unit_abbr_en).filter(Boolean)
                })
                .getMany();

            const duplicateInInput = formattedData.filter((s) =>
                existingUnits.some((ex) =>
                    ex.unit_name_th === s.unit_name_th ||
                    ex.unit_abbr_th === s.unit_abbr_th ||
                    ex.unit_name_en === s.unit_name_en ||
                    ex.unit_abbr_en === s.unit_abbr_en
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.unit_name_th} (${e.unit_abbr_th})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedUnit = await repository.save(uniqueUnits);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.unit'), savedUnit);
    
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