import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_semi_ifm } from '../entities/m_semi_ifm.entity';
import { SemiIfmModel } from '../models/semi_ifm.model';
import { m_unit } from '../entities/m_unit.entity';
import { m_criteria } from '../entities/m_criteria.entity';
import { m_semi } from '../entities/m_semi.entity';
import { SemiIfmDropdownModel } from '../models/semi_ifm_dropdown.model';
import { deleteEntity } from '../utils/DatabaseUtils';

export class SemiIfmService {
    private semiifmRepository: Repository<m_semi_ifm>;
    private unitRepository: Repository<m_unit>;
    private semitypeRepository: Repository<m_semi>;
    private criteriaRepository: Repository<m_criteria>;


    constructor(){
        this.semiifmRepository = AppDataSource.getRepository(m_semi_ifm);
        this.unitRepository = AppDataSource.getRepository(m_unit);
        this.semitypeRepository = AppDataSource.getRepository(m_semi);
        this.criteriaRepository = AppDataSource.getRepository(m_criteria);
    }

    //validate field inbrm
    private validateRequiredFields(data: Partial<SemiIfmModel>, response: ApiResponse<any>): ApiResponse<any> | null {
        const requiredFields = [
            { field: data.semi_id, message: 'semi.semi_id' },
            { field: data.crt_id, message: 'criteria.crt_id' },
            { field: data.semiifm_code, message: 'semi_ifm.semiifm_code' },
            { field: data.semiifm_name, message: 'semi_ifm.semiifm_name' },
            { field: data.semiifm_width, message: 'semi_ifm.semiifm_width' },
            { field: data.semiifm_width_unitId, message: 'semi_ifm.semiifm_width_unitId' },
            { field: data.semiifm_length, message: 'semi_ifm.semiifm_length' },
            { field: data.semiifm_length_unitId, message: 'semi_ifm.semiifm_length_unitId' },
            { field: data.semiifm_thickness, message: 'semi_ifm.semiifm_thickness' },
            { field: data.semiifm_thickness_unitId, message: 'semi_ifm.semiifm_thickness_unitId' },
            { field: data.semiifm_product_unitId, message: 'semi_ifm.semiifm_product_unitId' },
        ];
    
        for (const { field, message } of requiredFields) {
            if (validate.isNullOrEmpty(field)) {
                return response.setIncomplete(lang.msgRequired(message));
            }
        }
    
        return null;
    }

    async create(data: Partial<SemiIfmModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<SemiIfmModel>();
        const operation = 'SemiIfmService.create';

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

            const repository = manager ? useManager.getRepository(m_semi_ifm) : this.semiifmRepository;
            const unitRepository = manager ? useManager.getRepository(m_unit) : this.unitRepository;
            const criteriaRepository = manager ? useManager.getRepository(m_criteria) : this.criteriaRepository;
            const semiRepository = manager ? useManager.getRepository(m_semi) : this.semitypeRepository;

            // Validate required fields
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) {
                return validationResponse;
            }

            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            // ตรวจสอบว่า semi_id มีอยู่ใน m_semi หรือไม่
            const existingSemiType = await semiRepository.findOne({ where: { semi_id: data.semi_id } });
            if (!existingSemiType) {
                return response.setIncomplete(lang.msgNotFound('semi.semi_id'));
            }

            // ตรวจสอบว่า crt_id มีอยู่ใน m_criteria หรือไม่
            const existingCrt = await criteriaRepository.findOne({ where: { crt_id: data.crt_id } });
            if (!existingCrt) {
                return response.setIncomplete(lang.msgNotFound('criteria.crt_id'));
            }

            // ตรวจสอบว่า semiifm_width_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitWd = await unitRepository.findOne({ where: { unit_id: data.semiifm_width_unitId } });
            if (!existingUnitWd) {
                return response.setIncomplete(lang.msgNotFound('semi_ifm.semiifm_width_unitId'));
            }

            // ตรวจสอบว่า semiifm_length_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitLen = await unitRepository.findOne({ where: { unit_id: data.semiifm_length_unitId } });
            if (!existingUnitLen) {
                return response.setIncomplete(lang.msgNotFound('semi_ifm.semiifm_length_unitId'));
            }

            // ตรวจสอบว่า semiifm_thickness_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitThk = await unitRepository.findOne({ where: { unit_id: data.semiifm_thickness_unitId } });
            if (!existingUnitThk) {
                return response.setIncomplete(lang.msgNotFound('semi_ifm.semiifm_thickness_unitId'));
            }

            // ตรวจสอบว่า semiifm_product_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitPO = await unitRepository.findOne({ where: { unit_id: data.semiifm_product_unitId } });
            if (!existingUnitPO) {
                return response.setIncomplete(lang.msgNotFound('semi_ifm.semiifm_product_unitId'));
            }
            
            // ตรวจสอบว่า semiifm_code มีอยู่ในฐานข้อมูลหรือไม่
            const existingCode = await repository.findOne({ where: { semiifm_code: data.semiifm_code } });
            if (existingCode) {
                return response.setIncomplete(lang.msgAlreadyExists('semi_ifm.semiifm_code'));
            }

            // ตรวจสอบว่า semiifm_name มีอยู่ในฐานข้อมูลหรือไม่
            const existingName = await repository.findOne({ where: { semiifm_name: data.semiifm_name } });
            if (existingName) {
                return response.setIncomplete(lang.msgAlreadyExists('semi_ifm.semiifm_name'));
            }

            const Data = repository.create({
                ...data,
                semi_id: existingSemiType.semi_id,
                crt_id: data.crt_id,
                semiifm_width_unitId: existingUnitWd.unit_id,
                semiifm_length_unitId: existingUnitLen.unit_id,
                semiifm_thickness_unitId: existingUnitThk.unit_id,
                semiifm_product_unitId: existingUnitPO.unit_id,
                semiifm_is_active: data.semiifm_is_active ?? true,
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
            return response.setComplete(lang.msgSuccessAction('created', 'item.semi_ifm'), savedData);

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
        semiifm_id: number,
        data: Partial<SemiIfmModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<SemiIfmModel>();
        const operation = 'SemiIfmService.update';
    
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
            const repository = manager ? useManager.getRepository(m_semi_ifm) : this.semiifmRepository;
            const unitRepository = manager ? useManager.getRepository(m_unit) : this.unitRepository;
            const criteriaRepository = manager ? useManager.getRepository(m_criteria) : this.criteriaRepository;
            const semiRepository = manager ? useManager.getRepository(m_semi) : this.semitypeRepository;

            // ตรวจสอบว่ามี semiifm_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingSemiIfm = await repository.findOne({ where: { semiifm_id: semiifm_id } });
            if (!existingSemiIfm) {
                return response.setIncomplete(lang.msgNotFound('semi_ifm.semiifm_id'));
            }

            // Validate required fields
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) {
                return validationResponse;
            }

            // ตรวจสอบว่า semi_id มีอยู่ใน m_semi หรือไม่
            const existingSemiType = await semiRepository.findOne({ where: { semi_id: data.semi_id } });
            if (!existingSemiType) {
                return response.setIncomplete(lang.msgNotFound('semi.semi_id'));
            }

            // ตรวจสอบว่า crt_id มีอยู่ใน m_criteria หรือไม่
            const existingCrt = await criteriaRepository.findOne({ where: { crt_id: data.crt_id } });
            if (!existingCrt) {
                return response.setIncomplete(lang.msgNotFound('criteria.crt_id'));
            }

            // ตรวจสอบว่า semiifm_width_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitWd = await unitRepository.findOne({ where: { unit_id: data.semiifm_width_unitId } });
            if (!existingUnitWd) {
                return response.setIncomplete(lang.msgNotFound('semi_ifm.semiifm_width_unitId'));
            }

            // ตรวจสอบว่า semiifm_length_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitLen = await unitRepository.findOne({ where: { unit_id: data.semiifm_length_unitId } });
            if (!existingUnitLen) {
                return response.setIncomplete(lang.msgNotFound('semi_ifm.semiifm_length_unitId'));
            }

            // ตรวจสอบว่า semiifm_thickness_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitThk = await unitRepository.findOne({ where: { unit_id: data.semiifm_thickness_unitId } });
            if (!existingUnitThk) {
                return response.setIncomplete(lang.msgNotFound('semi_ifm.semiifm_thickness_unitId'));
            }

            // ตรวจสอบว่า semiifm_product_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitPO = await unitRepository.findOne({ where: { unit_id: data.semiifm_product_unitId } });
            if (!existingUnitPO) {
                return response.setIncomplete(lang.msgNotFound('semi_ifm.semiifm_product_unitId'));
            }

            // ตรวจสอบว่า semiifm_code ไม่ซ้ำ
            if (data.semiifm_code && data.semiifm_code !== existingSemiIfm.semiifm_code) {
                const duplicateCode = await repository.findOne({
                    where: { semiifm_code: data.semiifm_code, semiifm_id: Not(semiifm_id) },
                });
                if (duplicateCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('semi_ifm.semiifm_code'));
                }
            }
    
            // ตรวจสอบว่า semiifm_name ไม่ซ้ำ
            if (data.semiifm_name && data.semiifm_name !== existingSemiIfm.semiifm_name) {
                const duplicateName = await repository.findOne({
                    where: { semiifm_name: data.semiifm_name, semiifm_id: Not(semiifm_id) },
                });
                if (duplicateName) {
                    return response.setIncomplete(lang.msgAlreadyExists('semi_ifm.semiifm_name'));
                }
            }

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existingSemiIfm, {
                ...data,
                semi_id: existingSemiType.semi_id,
                crt_id: data.crt_id,
                semiifm_width_unitId: existingUnitWd.unit_id,
                semiifm_length_unitId: existingUnitLen.unit_id,
                semiifm_thickness_unitId: existingUnitThk.unit_id,
                semiifm_product_unitId: existingUnitPO.unit_id,
                update_by: reqUsername,
                update_date: new Date(),
            });
    
            await repository.save(existingSemiIfm); // บันทึกข้อมูล

            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(semiifm_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }
    
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.semi_ifm'), dataResponse.data);

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

    async delete(semiifm_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'SemiIfmService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_semi_ifm) : this.semiifmRepository;

            // ตรวจสอบว่ามี semiifm_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingSemiIfm = await repository.findOne({ where: { semiifm_id: semiifm_id } });
            if (!existingSemiIfm) {
                return response.setIncomplete(lang.msgNotFound('semi_ifm.semiifm_id'));
            }
            
            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, semiifm_id, reqUsername, 'semiifm_is_active', 'semiifm_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
    
            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.semi_ifm'));
    
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
        const operation = 'SemiIfmService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_semi_ifm) : this.semiifmRepository;

            // Query semi_ifm ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('semiifm')
                .leftJoin('m_unit', 'unit_width', 'unit_width.unit_id = semiifm.semiifm_width_unitId')
                .leftJoin('m_unit', 'unit_length', 'unit_length.unit_id = semiifm.semiifm_length_unitId')
                .leftJoin('m_unit', 'unit_thickness', 'unit_thickness.unit_id = semiifm.semiifm_thickness_unitId')
                .leftJoin('m_unit', 'unit_product', 'unit_product.unit_id = semiifm.semiifm_product_unitId')
                .leftJoin('m_semi', 'semi', 'semi.semi_id = semiifm.semi_id')
                .leftJoin('m_criteria', 'crt', 'crt.crt_id = semiifm.crt_id')
                .select([
                    'semiifm.semiifm_id AS semiifm_id',
                    'semiifm.semiifm_code AS semiifm_code',
                    'semiifm.semiifm_name AS semiifm_name',
                    'semi.semi_type AS semi_type',
                    // ใช้ COALESCE ใน CONCAT เพื่อป้องกันค่าที่เป็น NULL
                    "CONCAT(COALESCE(semiifm.semiifm_width, ''), ' ', COALESCE(unit_width.unit_name_th, '')) AS semiifm_width_with_name",
                    "CONCAT(COALESCE(semiifm.semiifm_length, ''), ' ', COALESCE(unit_length.unit_name_th, '')) AS semiifm_length_with_name",
                    "CONCAT(COALESCE(semiifm.semiifm_thickness, ''), ' ', COALESCE(unit_thickness.unit_name_th, '')) AS semiifm_thickness_with_name",
                    'unit_product.unit_name_th AS semiifm_product_unitId',
                    // ใส่ , ให้ crt_exp
                    `CONCAT(
                        COALESCE(NULLIF(crt.crt_exp_low, ''), ''),
                        CASE WHEN crt.crt_exp_low IS NOT NULL AND crt.crt_exp_medium IS NOT NULL THEN ', ' ELSE '' END,
                        COALESCE(NULLIF(crt.crt_exp_medium, ''), ''),
                        CASE WHEN crt.crt_exp_medium IS NOT NULL AND crt.crt_exp_high IS NOT NULL THEN ', ' ELSE '' END,
                        COALESCE(NULLIF(crt.crt_exp_high, ''), '')
                    ) AS crt_exp`,
                    // ใส่ , ให้ crt_rem
                    `CONCAT(
                        COALESCE(NULLIF(crt.crt_rem_low, ''), ''),
                        CASE WHEN crt.crt_rem_low IS NOT NULL AND crt.crt_rem_medium IS NOT NULL THEN ', ' ELSE '' END,
                        COALESCE(NULLIF(crt.crt_rem_medium, ''), ''),
                        CASE WHEN crt.crt_rem_medium IS NOT NULL AND crt.crt_rem_high IS NOT NULL THEN ', ' ELSE '' END,
                        COALESCE(NULLIF(crt.crt_rem_high, ''), '')
                    ) AS crt_rem`,
                    'semiifm.semiifm_is_active AS semiifm_is_active',
                ])
                .where('semiifm.semiifm_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.semi_ifm'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.semi_ifm'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(semiifm_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'SemiIfmService.getById';

        try {
            const repository = manager ? manager.getRepository(m_semi_ifm) : this.semiifmRepository;
    
            // Query semi_ifm ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('semiifm')
                .leftJoin('m_semi', 'semi', 'semi.semi_id = semiifm.semi_id')
                .leftJoin('m_unit' , 'unit_width', 'unit_width.unit_id = semiifm.semiifm_width_unitId')
                .leftJoin('m_unit' , 'unit_length', 'unit_length.unit_id = semiifm.semiifm_length_unitId')
                .leftJoin('m_unit' , 'unit_thickness', 'unit_thickness.unit_id = semiifm.semiifm_thickness_unitId')
                .leftJoin('m_unit' , 'unit_product', 'unit_product.unit_id = semiifm.semiifm_product_unitId')
                .leftJoin('m_criteria' , 'crt', 'crt.crt_id = semiifm.crt_id')
                .select([
                    'semiifm.semiifm_id AS semiifm_id',
                    'semiifm.semiifm_code AS semiifm_code',
                    'semiifm.semiifm_name AS semiifm_name',
                    'semiifm.semiifm_width AS semiifm_width',
                    'semiifm.semiifm_width_unitId AS semiifm_width_unitId',
                    'unit_width.unit_abbr_th AS semiifm_width_name',
                    'semiifm.semiifm_length AS semiifm_length',
                    'semiifm.semiifm_length_unitId AS semiifm_length_unitId',
                    'unit_length.unit_abbr_th AS semiifm_length_name',
                    'semiifm.semiifm_thickness AS semiifm_thickness',
                    'semiifm.semiifm_thickness_unitId AS semiifm_thickness_unitId',
                    'unit_thickness.unit_abbr_th AS semiifm_thickness_name',
                    'semiifm.semiifm_product_unitId AS semiifm_product_unitId',
                    'unit_product.unit_abbr_th AS semiifm_product_name',
                    'semi.semi_id AS semi_id',
                    'semi.semi_type AS semi_type',
                    'crt.crt_id AS crt_id',
                    'crt.crt_exp_low AS crt_exp_low',
                    'crt.crt_exp_medium AS crt_exp_medium',
                    'crt.crt_exp_high AS crt_exp_high',
                    'crt.crt_rem_low AS crt_rem_low',
                    'crt.crt_rem_medium AS crt_rem_medium',
                    'crt.crt_rem_high AS crt_rem_high',
                ])
                .where('semiifm.semiifm_id = :semiifm_id', { semiifm_id })
                .andWhere('semiifm.semiifm_is_active = :isActive', { isActive: true })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('semi_ifm.semiifm_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('semi_ifm.semiifm_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with semiifm_id: ${semiifm_id}`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getSemiIfmDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'SemiIfmService.getSemiIfmDropdown';

        try {
            const repository = manager ? manager.getRepository(m_semi_ifm) : this.semiifmRepository;
    
            // ดึงข้อมูล semiifm_id และรวม semiifm_code กับ semiifm_name
            const rawData = await repository
                .createQueryBuilder("semiifm")
                .select([
                    "semiifm.semiifm_id", // เลือก semiifm_id
                    "CONCAT(semiifm.semiifm_code, ' ', semiifm.semiifm_name) AS semiifm_code_name" // รวม semiifm_code และ semiifm_name
                ])
                .where("semiifm.semiifm_id IS NOT NULL") // กรองค่า null ออก
                .andWhere("semiifm.semiifm_is_active = :isActive", { isActive: true }) // กรองเฉพาะข้อมูลที่ใช้งานอยู่
                .distinct(true) // ให้ผลลัพธ์ไม่ซ้ำ
                .getRawMany(); // ดึงข้อมูลในรูปแบบ raw
    
            // ตรวจสอบว่า rawData มีข้อมูลหรือไม่
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound("item.semi_ifm")); // หากไม่พบข้อมูล
            }
    
            console.log("rawData:", rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ LocDropdownModel
            const data = rawData.map((rm: any) => new SemiIfmDropdownModel(rm.semiifm_semiifm_id, rm.semiifm_code_name));
    
            return response.setComplete(lang.msgFound("item.semi_ifm"), data); // ส่งผลลัพธ์กลับ
        } catch (error: any) {
            console.error("Error during getSemiIfmDropdown:", error.message); // แสดงข้อผิดพลาด
            throw new Error(lang.msgErrorFunction(operation, error.message)); // ส่งข้อผิดพลาดกลับ
        }
    }

    async createJson(
        data: any[], 
        reqUsername: string, 
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'SemiIfmService.createJson';
    
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
            const repository = useManager.getRepository(m_semi_ifm);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_semi_ifm> = {
                'รหัส': 'semiifm_code',
                'ชื่อ': 'semiifm_name',
                'ความกว้าง': 'semiifm_width',
                'หน่วยของความกว้าง': 'semiifm_width_unitId',
                'ความยาว': 'semiifm_length',
                'หน่วยของความยาว': 'semiifm_length_unitId',
                'ความหนา': 'semiifm_thickness',
                'หน่วยของความหนา': 'semiifm_thickness_unitId',
                'หน่วยของสินค้า': 'semiifm_product_unitId',
                'ประเภท': 'semi_id',
                'เกณฑ์': 'crt_id'
            };
    
            console.log('📌 Raw JSON Data:', data);
    
    /* Map ชื่อประเภท semi เป็น ID */
            // ✅ ดึงรายชื่อประเภท semi ทั้งหมดจาก DB
            const semitype = await this.semitypeRepository.find();

            // ✅ สร้าง Map: 'ชื่อประเภท semi ' => semi_id
            const semitypeMap = new Map(semitype.map(s => [s.semi_type?.trim(), s.semi_id]));
    
    /* Map ชื่อเกณฑ์ เป็น ID */
            // ✅ ดึงรายชื่อเกณฑ์ ทั้งหมดจาก DB
            const crt = await this.criteriaRepository.find();

            // ✅ สร้าง Map: 'ชื่อเกณฑ์' => crt_id
            const crtMap = new Map(crt.map(c => [c.crt_name?.trim(), c.crt_id]));

     /* Map ชื่อหน่วย เป็น ID */
            // ✅ ดึงรายชื่อหน่วย ทั้งหมดจาก DB
            const units = await this.unitRepository.find();

            // ✅ สร้าง Map: 'ชื่อหน่วย' => unit_id
            const unitMap = new Map(units.map(u => [u.unit_name_th?.trim(), u.unit_id]));

            // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล
            const formattedData: Partial<m_semi_ifm>[] = data.map((row: any, index) => {
                const mappedRow: Partial<m_semi_ifm> = {};
    
                Object.keys(row).forEach((jsonKey) => {
                    const dbField = fieldMapping[jsonKey];
            // ฟิลด์ที่ลงท้ายว่า _unitId และ map หน่วยให้เป็น ID
                    if (dbField?.endsWith('_unitId')) {
                        const unitName = row[jsonKey]?.trim();
                        const unitId = unitMap.get(unitName);
                        (mappedRow as any)[dbField] = unitId ?? undefined;
                    } 
            // กรณีเป็นฟิลด์ 'ประเภท semi' → ต้อง map ชื่อประเภท semi เป็น semi_id
                    else if (dbField === 'semi_id') {
                        const semitypeName = row[jsonKey]?.trim();                // ตัดช่องว่างชื่อประเภท semi
                        const semitypeId = semitypeMap.get(semitypeName);           // หาค่า semi_id
                        mappedRow.semi_id = semitypeId ?? undefined;               // ถ้าไม่เจอให้เป็น undefined
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
                mappedRow.semiifm_is_active = mappedRow.semiifm_is_active ?? true;
                mappedRow.create_date = new Date();
                mappedRow.create_by = reqUsername;
    
                console.log(`📌 Mapped Row ${index + 1}:`, mappedRow);
                return mappedRow;
            });
    
            console.log("formattedData",formattedData)
            // ✅ ตรวจสอบข้อมูลที่จำเป็น
            for (const item of formattedData) {
                if (validate.isNullOrEmpty(item.semiifm_code)) {
                    return response.setIncomplete(lang.msgRequired('semi_ifm.semiifm_code'));
                }
                if (validate.isNullOrEmpty(item.semiifm_name)) {
                    return response.setIncomplete(lang.msgRequired('semi_ifm.semiifm_name'));
                }
            }

    /* ตรวจชื่อประเภท semi ที่ไม่พบ (semi_id = undefined) */
        const notFoundsemiTypes = formattedData.filter(l => !l.semi_id);
        if (notFoundsemiTypes.length > 0) {
            return response.setIncomplete(
                `พบชื่อประเภทที่ไม่ตรงกับระบบ ${notFoundsemiTypes.length} รายการ: ` +
                notFoundsemiTypes.map(e => `${e.semiifm_code} (${e.semiifm_name})`).join(', ')
            );
        }

    /* ตรวจชื่อเกณฑ์ที่ไม่พบ (crt_id = undefined) */
        const notFoundCriterias = formattedData.filter(l => !l.crt_id);
        if (notFoundCriterias.length > 0) {
            return response.setIncomplete(
                `พบชื่อเกณฑ์ที่ไม่ตรงกับระบบ ${notFoundCriterias.length} รายการ: ` +
                notFoundCriterias.map(e => `${e.semiifm_code} (${e.semiifm_name})`).join(', ')
            );
        }  

     /* ตรวจชื่อหน่วยที่ไม่พบ (unit_id = undefined) */
        const notFoundUnits = formattedData.filter(row =>
            Object.entries(row).some(([key, val]) =>
                key.endsWith('_unitId') && val === undefined
            )
        );
        
        if (notFoundUnits.length > 0) {
            return response.setIncomplete(
                `พบชื่อหน่วยที่ไม่ตรงกับระบบ ${notFoundUnits.length} รายการ: ` +
                notFoundUnits.map(e => `${e.semiifm_code} (${e.semiifm_name})`).join(', ')
            );
        }        

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_semi_ifm>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.semiifm_code);
                const isNameDuplicate = seenNames.has(s.semiifm_name);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.semiifm_code);
                    seenNames.add(s.semiifm_name);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.semiifm_code} (${e.semiifm_name})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueSemiIfm
            const uniqueSemiIfm = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `semiifm_code` และ `semiifm_name` ใน database
            const existingSemiIfm = await repository
                .createQueryBuilder('semiifm')
                .where('semiifm.semiifm_code IN (:...codes) OR semiifm.semiifm_name IN (:...names)', {
                    codes: uniqueSemiIfm.map((s) => s.semiifm_code).filter(Boolean),
                    names: uniqueSemiIfm.map((s) => s.semiifm_name).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueSemiIfm) ที่ซ้ำกับข้อมูลในระบบ (existingSemiIfm)
            const duplicateInInput = uniqueSemiIfm.filter((s) =>
                existingSemiIfm.some((ex) =>
                    ex.semiifm_code === s.semiifm_code || ex.semiifm_name === s.semiifm_name
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.semiifm_code} (${e.semiifm_name})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedSemiIfm = await repository.save(uniqueSemiIfm);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.semi_ifm'), savedSemiIfm);
    
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