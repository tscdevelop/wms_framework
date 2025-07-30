import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_finished_goods } from '../entities/m_finished_goods.entity';
import { FinishedGoodsModel } from '../models/finished_goods.model';
import { FGDropdownModel } from '../models/finished_goods_dropdown.model';
import { deleteEntity } from '../utils/DatabaseUtils';

export class FinishedGoodsService {
    private finishedGoodsRepository: Repository<m_finished_goods>;

    constructor(){
        this.finishedGoodsRepository = AppDataSource.getRepository(m_finished_goods);
    }

    async create(data: Partial<FinishedGoodsModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<FinishedGoodsModel>();
        const operation = 'FinishedGoodsService.create';

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

            const repository = manager ? useManager.getRepository(m_finished_goods) : this.finishedGoodsRepository;

            // Validate required data
            if (validate.isNullOrEmpty(data.fg_code)) {
                return response.setIncomplete(lang.msgRequired('finished_goods.fg_code'));
            }
            if (validate.isNullOrEmpty(data.fg_type)) {
                return response.setIncomplete(lang.msgRequired('finished_goods.fg_type'));
            }
            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            // ตรวจสอบว่า `fg_code` หรือ `fg_type` ที่ส่งมาใน `data` มีอยู่ในฐานข้อมูลหรือไม่
            const existingFG = await repository
            .createQueryBuilder('fg')
            .where('fg.fg_code = :fg_code OR fg.fg_type = :fg_type', { 
                fg_code: data.fg_code, 
                fg_type: data.fg_type })
            .getOne();

            // ตรวจสอบว่าพบข้อมูลในฐานข้อมูลหรือไม่
            if (existingFG) {
                if (existingFG.fg_code === data.fg_code) {
                    return response.setIncomplete(lang.msgAlreadyExists('finished_goods.fg_code'));
                }
                if (existingFG.fg_type === data.fg_type) {
                    return response.setIncomplete(lang.msgAlreadyExists('finished_goods.fg_type'));
                }
            }

            const fgData = repository.create({
                ...data,
                fg_is_active: data.fg_is_active ?? true,
                create_date: new Date(),
                create_by: reqUsername,
            });            

            // บันทึก entity (fg) ลงฐานข้อมูล
            const savedData = await repository.save(fgData);

            // Commit Transaction หลังบันทึกข้อมูลสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            // ดึงข้อมูล user ที่สร้างใหม่
            return response.setComplete(lang.msgSuccessAction('created', 'item.finished_goods'), savedData);

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
        fg_id: number,
        data: Partial<FinishedGoodsModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<FinishedGoodsModel>();
        const operation = 'FinishedGoodsService.update';
    
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
            const repository = manager ? useManager.getRepository(m_finished_goods) : this.finishedGoodsRepository;

            // ตรวจสอบว่ามี fg_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingFG = await repository.findOne({ where: { fg_id: fg_id } });
            if (!existingFG) {
                return response.setIncomplete(lang.msgNotFound('finished_goods.fg_id'));
            }
    
            // ตรวจสอบค่าที่จำเป็น
            if (validate.isNullOrEmpty(data.fg_code)) {
                return response.setIncomplete(lang.msgRequired('finished_goods.fg_code'));
            }
            if (validate.isNullOrEmpty(data.fg_type)) {
                return response.setIncomplete(lang.msgRequired('finished_goods.fg_type'));
            }
    
            // ตรวจสอบว่า fg_code ไม่ซ้ำ
            if (data.fg_code && data.fg_code !== existingFG.fg_code) {
                const duplicateCode = await repository.findOne({
                    where: { fg_code: data.fg_code, fg_id: Not(existingFG.fg_id) },
                });
                if (duplicateCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('finished_goods.fg_code'));
                }
            }

            // ตรวจสอบว่า fty_name ไม่ซ้ำ
            if (data.fg_type && data.fg_type !== existingFG.fg_type) {
                const duplicateType = await repository.findOne({
                    where: { fg_type: data.fg_type, fg_id: Not(existingFG.fg_id) },
                });
                if (duplicateType) {
                    return response.setIncomplete(lang.msgAlreadyExists('finished_goods.fg_type'));
                }
            }

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existingFG, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
            });
    
            await repository.save(existingFG); // บันทึกข้อมูล

            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(fg_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }
    
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.finished_goods'), dataResponse.data);

            
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

    async delete(fg_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'FinishedGoodsService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_finished_goods) : this.finishedGoodsRepository;

            // ตรวจสอบว่ามี fg_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingFG = await repository.findOne({ where: { fg_id: fg_id } });
            if (!existingFG) {
                return response.setIncomplete(lang.msgNotFound('finished_goods.fg_id'));
            }

            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, fg_id, reqUsername, 'fg_is_active', 'fg_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }

            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.finished_goods'));
    
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
        const operation = 'FinishedGoodsService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_finished_goods) : this.finishedGoodsRepository;
    
            // Query finished_goods ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('fg')
                .select([
                    'fg.fg_id AS fg_id',
                    'fg.fg_code AS fg_code',
                    'fg.fg_type AS fg_type',
                    'fg.fg_remark AS fg_remark',
                    'fg.create_date AS create_date',
                    'fg.create_by AS create_by',
                    'fg.update_date AS update_date',
                    'fg.update_by AS update_by',
                    'fg.fg_is_active AS fg_is_active'
                ])
                .where('fg.fg_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.finished_goods'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.finished_goods'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(fg_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'FinishedGoodsService.getById';

        try {
            const repository = manager ? manager.getRepository(m_finished_goods) : this.finishedGoodsRepository;
    
            // Query finished_goods ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('fg')
                .select([
                    'fg.fg_id AS fg_id',
                    'fg.fg_code AS fg_code',
                    'fg.fg_type AS fg_type',
                    'fg.fg_remark AS fg_remark',
                    'fg.create_date AS create_date',
                    'fg.create_by AS create_by',
                    'fg.update_date AS update_date',
                    'fg.update_by AS update_by',
                    'fg.fg_is_active AS fg_is_active'
                ])
                .where('fg.fg_id = :fg_id', { fg_id })
                .andWhere('fg.fg_is_active = :isActive', { isActive: true })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('finished_goods.fg_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('finished_goods.fg_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with fg_id: ${fg_id}`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getFGDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'FinishedGoodsService.getFGDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_finished_goods) : this.finishedGoodsRepository;
            // ดึงข้อมูลทั้ง fg_id และ fg_type
            const rawData = await repository.createQueryBuilder("finishedGoods")
                .select(["finishedGoods.fg_id", "finishedGoods.fg_type"])
                .where("finishedGoods.fg_type IS NOT NULL") // กรองค่า null ออก
                .andWhere('finishedGoods.fg_is_active = :isActive', { isActive: true })
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.finished_goods'));
            }
    
            console.log('rawData:', rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ FGDropdownModel
            const data = rawData.map((fg) => new FGDropdownModel(fg.finishedGoods_fg_id, fg.finishedGoods_fg_type));
    
            return response.setComplete(lang.msgFound('item.finished_goods'), data);
    
        } catch (error: any) {
            console.error('Error during getFGDropdown:', error.message);
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
            const repository = useManager.getRepository(m_finished_goods);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_finished_goods> = {
                'รหัส': 'fg_code',
                'ประเภท': 'fg_type',
                'หมายเหตุ': 'fg_remark'
            };
    
            console.log('📌 Raw JSON Data:', data);
    
            // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล
            const formattedData: Partial<m_finished_goods>[] = data.map((row: any, index) => {
                const mappedRow: Partial<m_finished_goods> = {};
    
                Object.keys(row).forEach((jsonKey) => {
                    const dbField = fieldMapping[jsonKey];
                    if (dbField) {
                        mappedRow[dbField] = row[jsonKey] !== '' ? row[jsonKey] : null; // ✅ ให้ `""` เป็น `null`
                    }
                });
    
                // ✅ ตั้งค่า default values
                mappedRow.fg_is_active = mappedRow.fg_is_active ?? true;
                mappedRow.create_date = new Date();
                mappedRow.create_by = reqUsername;
    
                console.log(`📌 Mapped Row ${index + 1}:`, mappedRow);
                return mappedRow;
            });
    
            console.log("formattedData",formattedData)
            // ✅ ตรวจสอบข้อมูลที่จำเป็น
            for (const item of formattedData) {
                if (validate.isNullOrEmpty(item.fg_code)) {
                    return response.setIncomplete(lang.msgRequired('finished_goods.fg_code'));
                }
                if (validate.isNullOrEmpty(item.fg_type)) {
                    return response.setIncomplete(lang.msgRequired('finished_goods.fg_type'));
                }
            }

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_finished_goods>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.fg_code);
                const isNameDuplicate = seenNames.has(s.fg_type);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.fg_code);
                    seenNames.add(s.fg_type);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.fg_code} (${e.fg_type})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueFGType
            const uniqueFGType = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `fg_code` และ `fg_type` ใน database
            const existingFGType = await repository
                .createQueryBuilder('fg')
                .where('fg.fg_code IN (:...codes) OR fg.fg_type IN (:...names)', {
                    codes: uniqueFGType.map((s) => s.fg_code).filter(Boolean),
                    names: uniqueFGType.map((s) => s.fg_type).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueFGType) ที่ซ้ำกับข้อมูลในระบบ (existingFGType)
            const duplicateInInput = uniqueFGType.filter((s) =>
                existingFGType.some((ex) =>
                    ex.fg_code === s.fg_code || ex.fg_type === s.fg_type
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.fg_code} (${e.fg_type})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedFGType = await repository.save(uniqueFGType);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.finished_goods'), savedFGType);
    
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