import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_raw_material_ifm } from '../entities/m_raw_material_ifm.entity';
import { RawMaterialIfmModel } from '../models/raw_material_ifm.model';
import { m_unit } from '../entities/m_unit.entity';
import { RMIfmDropdownModel } from '../models/raw_material_ifm_dropdown.model';
import { m_raw_material } from '../entities/m_raw_material.entity';
import { m_criteria } from '../entities/m_criteria.entity';
import { deleteEntity } from '../utils/DatabaseUtils';

export class RawMaterialIfmService {
    private rmifmRepository: Repository<m_raw_material_ifm>;
    private unitRepository: Repository<m_unit>;
    private rmtypeRepository: Repository<m_raw_material>;
    private criteriaRepository: Repository<m_criteria>;

    constructor(){
        this.rmifmRepository = AppDataSource.getRepository(m_raw_material_ifm);
        this.unitRepository = AppDataSource.getRepository(m_unit);
        this.rmtypeRepository = AppDataSource.getRepository(m_raw_material);
        this.criteriaRepository = AppDataSource.getRepository(m_criteria);
    }

    //validate field inbrm
    private validateRequiredFields(data: Partial<RawMaterialIfmModel>, response: ApiResponse<any>): ApiResponse<any> | null {
        const requiredFields = [
            { field: data.rm_id, message: 'raw_material.rm_id' },
            { field: data.crt_id, message: 'criteria.crt_id' },
            { field: data.rmifm_code, message: 'raw_material_ifm.rmifm_code' },
            { field: data.rmifm_name, message: 'raw_material_ifm.rmifm_name' },
            { field: data.rmifm_width, message: 'raw_material_ifm.rmifm_width' },
            { field: data.rmifm_width_unitId, message: 'raw_material_ifm.rmifm_width_unitId' },
            { field: data.rmifm_length, message: 'raw_material_ifm.rmifm_length' },
            { field: data.rmifm_length_unitId, message: 'raw_material_ifm.rmifm_length_unitId' },
            { field: data.rmifm_thickness, message: 'raw_material_ifm.rmifm_thickness' },
            { field: data.rmifm_thickness_unitId, message: 'raw_material_ifm.rmifm_thickness_unitId' },
            { field: data.rmifm_weight, message: 'raw_material_ifm.rmifm_weight' },
            { field: data.rmifm_weight_unitId, message: 'raw_material_ifm.rmifm_weight_unitId' },
            { field: data.rmifm_product_unitId, message: 'raw_material_ifm.rmifm_product_unitId' },
        ];
    
        for (const { field, message } of requiredFields) {
            if (validate.isNullOrEmpty(field)) {
                return response.setIncomplete(lang.msgRequired(message));
            }
        }
    
        return null;
    }

    async create(data: Partial<RawMaterialIfmModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<RawMaterialIfmModel>();
        const operation = 'RawMaterialIfmService.create';

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

            const repository = manager ? useManager.getRepository(m_raw_material_ifm) : this.rmifmRepository;
            const unitRepository = manager ? useManager.getRepository(m_unit) : this.unitRepository;
            const rmtypeRepository = manager ? useManager.getRepository(m_raw_material) : this.rmtypeRepository;
            const criteriaRepository = manager ? useManager.getRepository(m_criteria) : this.criteriaRepository;

            // Validate required fields
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) {
                return validationResponse;
            }

            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            // ตรวจสอบว่า rm_id มีอยู่ใน m_raw_material หรือไม่
            const existingRMType = await rmtypeRepository.findOne({ where: { rm_id: data.rm_id } });
            if (!existingRMType) {
                return response.setIncomplete(lang.msgNotFound('raw_material.rm_id'));
            }

            // ตรวจสอบว่า crt_id มีอยู่ใน m_criteria หรือไม่
            const existingCrt = await criteriaRepository.findOne({ where: { crt_id: data.crt_id } });
            if (!existingCrt) {
                return response.setIncomplete(lang.msgNotFound('criteria.crt_id'));
            }

            // ตรวจสอบว่า rmifm_width_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitWd = await unitRepository.findOne({ where: { unit_id: data.rmifm_width_unitId } });
            if (!existingUnitWd) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_width_unitId'));
            }

            // ตรวจสอบว่า rmifm_length_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitLen = await unitRepository.findOne({ where: { unit_id: data.rmifm_length_unitId } });
            if (!existingUnitLen) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_length_unitId'));
            }

            // ตรวจสอบว่า rmifm_thickness_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitThk = await unitRepository.findOne({ where: { unit_id: data.rmifm_thickness_unitId } });
            if (!existingUnitThk) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_thickness_unitId'));
            }

            // ตรวจสอบว่า rmifm_weight_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitWt = await unitRepository.findOne({ where: { unit_id: data.rmifm_weight_unitId } });
            if (!existingUnitWt) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_weight_unitId'));
            }

            // ตรวจสอบว่า rmifm_product_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitPO = await unitRepository.findOne({ where: { unit_id: data.rmifm_product_unitId } });
            if (!existingUnitPO) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_product_unitId'));
            }
            
            // ตรวจสอบว่า rmifm_code มีอยู่ในฐานข้อมูลหรือไม่
            const existingCode = await repository.findOne({ where: { rmifm_code: data.rmifm_code } });
            if (existingCode) {
                return response.setIncomplete(lang.msgAlreadyExists('raw_material_ifm.rmifm_code'));
            }

            // ตรวจสอบว่า rmifm_name มีอยู่ในฐานข้อมูลหรือไม่
            const existingName = await repository.findOne({ where: { rmifm_name: data.rmifm_name } });
            if (existingName) {
                return response.setIncomplete(lang.msgAlreadyExists('raw_material_ifm.rmifm_name'));
            }

            const Data = repository.create({
                ...data,
                rm_id: existingRMType.rm_id,
                crt_id: existingCrt.crt_id,
                rmifm_width_unitId: existingUnitWd.unit_id,
                rmifm_length_unitId: existingUnitLen.unit_id,
                rmifm_thickness_unitId: existingUnitThk.unit_id,
                rmifm_weight_unitId: existingUnitWt.unit_id,
                rmifm_product_unitId: existingUnitPO.unit_id,
                rmifm_is_active: data.rmifm_is_active ?? true,
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
            return response.setComplete(lang.msgSuccessAction('created', 'item.raw_material_ifm'), savedData);

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
        rmifm_id: number,
        data: Partial<RawMaterialIfmModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<RawMaterialIfmModel>();
        const operation = 'RawMaterialIfmService.update';
    
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
            const repository = manager ? useManager.getRepository(m_raw_material_ifm) : this.rmifmRepository;
            const unitRepository = manager ? useManager.getRepository(m_unit) : this.unitRepository;
            const rmtypeRepository = manager ? useManager.getRepository(m_raw_material) : this.rmtypeRepository;
            const criteriaRepository = manager ? useManager.getRepository(m_criteria) : this.criteriaRepository;

            // ตรวจสอบว่ามี rmifm_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingRMIfm = await repository.findOne({ where: { rmifm_id: rmifm_id } });
            if (!existingRMIfm) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_id'));
            }

            // ตรวจสอบว่า rm_id มีอยู่ใน m_raw_material หรือไม่
            const existingRMType = await rmtypeRepository.findOne({ where: { rm_id: data.rm_id } });
            if (!existingRMType) {
                return response.setIncomplete(lang.msgNotFound('raw_material.rm_id'));
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

            // ตรวจสอบว่า rmifm_width_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitWd = await unitRepository.findOne({ where: { unit_id: data.rmifm_width_unitId } });
            if (!existingUnitWd) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_width_unitId'));
            }

            // ตรวจสอบว่า rmifm_length_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitLen = await unitRepository.findOne({ where: { unit_id: data.rmifm_length_unitId } });
            if (!existingUnitLen) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_length_unitId'));
            }

            // ตรวจสอบว่า rmifm_thickness_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitThk = await unitRepository.findOne({ where: { unit_id: data.rmifm_thickness_unitId } });
            if (!existingUnitThk) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_thickness_unitId'));
            }

            // ตรวจสอบว่า rmifm_weight_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitWt = await unitRepository.findOne({ where: { unit_id: data.rmifm_weight_unitId } });
            if (!existingUnitWt) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_weight_unitId'));
            }

            // ตรวจสอบว่า rmifm_product_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitPO = await unitRepository.findOne({ where: { unit_id: data.rmifm_product_unitId } });
            if (!existingUnitPO) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_product_unitId'));
            }

            // ตรวจสอบว่า rmifm_code ไม่ซ้ำ
            if (data.rmifm_code && data.rmifm_code !== existingRMIfm.rmifm_code) {
                const duplicateCode = await repository.findOne({
                    where: { rmifm_code: data.rmifm_code, rmifm_id: Not(rmifm_id) },
                });
                if (duplicateCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('raw_material_ifm.rmifm_code'));
                }
            }
    
            // ตรวจสอบว่า rmifm_name ไม่ซ้ำ
            if (data.rmifm_name && data.rmifm_name !== existingRMIfm.rmifm_name) {
                const duplicateName = await repository.findOne({
                    where: { rmifm_name: data.rmifm_name, rmifm_id: Not(rmifm_id) },
                });
                if (duplicateName) {
                    return response.setIncomplete(lang.msgAlreadyExists('raw_material_ifm.rmifm_name'));
                }
            }

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existingRMIfm, {
                ...data, 
                rm_id: existingRMType.rm_id,
                crt_id: existingCrt.crt_id,
                rmifm_width_unitId: existingUnitWd.unit_id,
                rmifm_length_unitId: existingUnitLen.unit_id,
                rmifm_thickness_unitId: existingUnitThk.unit_id,
                rmifm_weight_unitId: existingUnitWt.unit_id,
                rmifm_product_unitId: existingUnitPO.unit_id,
                update_by: reqUsername,
                update_date: new Date(),
            });
    
            await repository.save(existingRMIfm); // บันทึกข้อมูล

            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(rmifm_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }

            response = response.setComplete(lang.msgSuccessAction('updated', 'item.raw_material_ifm'), dataResponse.data);

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

    async delete(rmifm_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'RawMaterialIfmService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_raw_material_ifm) : this.rmifmRepository;

            // ตรวจสอบว่ามี rmifm_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingRMIfm = await repository.findOne({ where: { rmifm_id: rmifm_id } });
            if (!existingRMIfm) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_id'));
            }

            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, rmifm_id, reqUsername, 'rmifm_is_active', 'rmifm_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
            
            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.raw_material_ifm'));
    
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
        const operation = 'RawMaterialIfmService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(m_raw_material_ifm) : this.rmifmRepository;
    
            const rawData = await repository
                .createQueryBuilder('rmifm')
                .leftJoin('m_unit', 'unit_width', 'unit_width.unit_id = rmifm.rmifm_width_unitId')
                .leftJoin('m_unit', 'unit_length', 'unit_length.unit_id = rmifm.rmifm_length_unitId')
                .leftJoin('m_unit', 'unit_thickness', 'unit_thickness.unit_id = rmifm.rmifm_thickness_unitId')
                .leftJoin('m_unit', 'unit_weight', 'unit_weight.unit_id = rmifm.rmifm_weight_unitId')
                .leftJoin('m_unit', 'unit_product', 'unit_product.unit_id = rmifm.rmifm_product_unitId')
                .leftJoin('m_raw_material', 'rm', 'rm.rm_id = rmifm.rm_id')
                .leftJoin('m_criteria', 'crt', 'crt.crt_id = rmifm.crt_id')
                .select([
                    'rmifm.rmifm_id AS rmifm_id',
                    'rmifm.rmifm_code AS rmifm_code',
                    'rmifm.rmifm_name AS rmifm_name',
                    'rm.rm_type AS rm_type',
                    // ใช้ COALESCE + CONCAT เพื่อรวมค่า unit_name_th กับค่าที่อาจเป็น NULL
                    "CONCAT(COALESCE(rmifm.rmifm_width, ''), ' ', COALESCE(unit_width.unit_name_th, '')) AS rmifm_width_with_name",
                    "CONCAT(COALESCE(rmifm.rmifm_length, ''), ' ', COALESCE(unit_length.unit_name_th, '')) AS rmifm_length_with_name",
                    "CONCAT(COALESCE(rmifm.rmifm_thickness, ''), ' ', COALESCE(unit_thickness.unit_name_th, '')) AS rmifm_thickness_with_name",
                    "CONCAT(COALESCE(rmifm.rmifm_weight, ''), ' ', COALESCE(unit_weight.unit_name_th, '')) AS rmifm_weight_with_name",
                    "unit_product.unit_name_th AS rmifm_product_with_name",
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
                    'rmifm.rmifm_is_active AS rmifm_is_active',
                ])
                .where('rmifm.rmifm_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();
    
            // ตรวจสอบว่ามีข้อมูลหรือไม่
            if (!Array.isArray(rawData) || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.raw_material_ifm'));
            }
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('item.raw_material_ifm'), rawData);
            
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(rmifm_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'RawMaterialIfmService.getById';

        try {
            const repository = manager ? manager.getRepository(m_raw_material_ifm) : this.rmifmRepository;
    
            // Query raw_material_ifm ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('rmifm')
                .leftJoin('m_raw_material', 'rm', 'rm.rm_id = rmifm.rm_id')
                .leftJoin('m_unit' , 'unit_width', 'unit_width.unit_id = rmifm.rmifm_width_unitId')
                .leftJoin('m_unit' , 'unit_length', 'unit_length.unit_id = rmifm.rmifm_length_unitId')
                .leftJoin('m_unit' , 'unit_thickness', 'unit_thickness.unit_id = rmifm.rmifm_thickness_unitId')
                .leftJoin('m_unit' , 'unit_weight', 'unit_weight.unit_id = rmifm.rmifm_weight_unitId')
                .leftJoin('m_unit' , 'unit_product', 'unit_product.unit_id = rmifm.rmifm_product_unitId')
                .leftJoin('m_criteria' , 'crt', 'crt.crt_id = rmifm.crt_id')
                .select([
                    'rmifm.rmifm_id AS rmifm_id',
                    'rmifm.rmifm_code AS rmifm_code',
                    'rmifm.rmifm_name AS rmifm_name',
                    'rmifm.rmifm_width AS rmifm_width',
                    'rmifm.rmifm_width_unitId AS rmifm_width_unitId',
                    'unit_width.unit_abbr_th AS rmifm_width_unit_name',
                    'rmifm.rmifm_length AS rmifm_length',
                    'rmifm.rmifm_length_unitId AS rmifm_length_unitId',
                    'unit_length.unit_abbr_th AS rmifm_length_unit_name',
                    'rmifm.rmifm_thickness AS rmifm_thickness',
                    'rmifm.rmifm_thickness_unitId AS rmifm_thickness_unitId',
                    'unit_thickness.unit_abbr_th AS rmifm_thickness_unit_name',
                    'rmifm.rmifm_weight AS rmifm_weight',
                    'rmifm.rmifm_weight_unitId AS rmifm_weight_unitId',
                    'unit_weight.unit_abbr_th AS rmifm_weight_unit_name',
                    'rmifm.rmifm_product_unitId AS rmifm_product_unitId',
                    'unit_product.unit_abbr_th AS rmifm_product_name',
                    'rm.rm_id AS rm_id',
                    'rm.rm_type AS rm_type',
                    'crt.crt_id AS crt_id',
                    'crt.crt_exp_low AS crt_exp_low',
                    'crt.crt_exp_medium AS crt_exp_medium',
                    'crt.crt_exp_high AS crt_exp_high',
                    'crt.crt_rem_low AS crt_rem_low',
                    'crt.crt_rem_medium AS crt_rem_medium',
                    'crt.crt_rem_high AS crt_rem_high',
                ])
                .where('rmifm.rmifm_id = :rmifm_id', { rmifm_id })
                .andWhere('rmifm.rmifm_is_active = :isActive', { isActive: true })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('raw_material_ifm.rmifm_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('raw_material_ifm.rmifm_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with rmifm_id: ${rmifm_id}`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getRMIfmDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'RawMaterialIfmService.getRMIfmDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_raw_material_ifm) : this.rmifmRepository;
    
            // ดึงข้อมูล rmifm_id และรวม rmifm_code กับ rmifm_name
            const rawData = await repository
                .createQueryBuilder("rmifm")
                .select([
                    "rmifm.rmifm_id", // เลือก rmifm_id
                    "CONCAT(rmifm.rmifm_code, ' ', rmifm.rmifm_name) AS rmifm_code_name" // รวม rmifm_code และ rmifm_name
                ])
                .where("rmifm.rmifm_id IS NOT NULL") // กรองค่า null ออก
                .andWhere("rmifm.rmifm_is_active = :isActive", { isActive: true }) // กรองเฉพาะข้อมูลที่ใช้งานอยู่
                .distinct(true) // ให้ผลลัพธ์ไม่ซ้ำ
                .getRawMany(); // ดึงข้อมูลในรูปแบบ raw
    
            // ตรวจสอบว่า rawData มีข้อมูลหรือไม่
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound("item.raw_material_ifm")); // หากไม่พบข้อมูล
            }
    
            console.log("rawData:", rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ LocDropdownModel
            const data = rawData.map((rm: any) => new RMIfmDropdownModel(rm.rmifm_rmifm_id, rm.rmifm_code_name));
    
            return response.setComplete(lang.msgFound("item.raw_material_ifm"), data); // ส่งผลลัพธ์กลับ
        } catch (error: any) {
            console.error("Error during getRMIfmDropdown:", error.message); // แสดงข้อผิดพลาด
            throw new Error(lang.msgErrorFunction(operation, error.message)); // ส่งข้อผิดพลาดกลับ
        }
    }

    async createJson(
        data: any[], 
        reqUsername: string, 
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'RawMaterialIfmService.createJson';
    
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
            const repository = useManager.getRepository(m_raw_material_ifm);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_raw_material_ifm> = {
                'รหัส': 'rmifm_code',
                'ชื่อ': 'rmifm_name',
                'ความกว้าง': 'rmifm_width',
                'หน่วยของความกว้าง': 'rmifm_width_unitId',
                'ความยาว': 'rmifm_length',
                'หน่วยของความยาว': 'rmifm_length_unitId',
                'ความหนา': 'rmifm_thickness',
                'หน่วยของความหนา': 'rmifm_thickness_unitId',
                'น้ำหนัก': 'rmifm_weight',
                'หน่วยของน้ำหนัก': 'rmifm_weight_unitId',
                'หน่วยของสินค้า': 'rmifm_product_unitId',
                'ประเภท': 'rm_id',
                'เกณฑ์': 'crt_id'
            };
    
            console.log('📌 Raw JSON Data:', data);
    
    /* Map ชื่อประเภท rm เป็น ID */
            // ✅ ดึงรายชื่อประเภท rm ทั้งหมดจาก DB
            const rmtype = await this.rmtypeRepository.find();

            // ✅ สร้าง Map: 'ชื่อประเภท rm ' => rm_id
            const rmtypeMap = new Map(rmtype.map(r => [r.rm_type?.trim(), r.rm_id]));
    
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
            const formattedData: Partial<m_raw_material_ifm>[] = data.map((row: any, index) => {
                const mappedRow: Partial<m_raw_material_ifm> = {};
    
                Object.keys(row).forEach((jsonKey) => {
                    const dbField = fieldMapping[jsonKey];
            // ฟิลด์ที่ลงท้ายว่า _unitId และ map หน่วยให้เป็น ID
                    if (dbField?.endsWith('_unitId')) {
                        const unitName = row[jsonKey]?.trim();
                        const unitId = unitMap.get(unitName);
                        (mappedRow as any)[dbField] = unitId ?? undefined;
                    } 
            // กรณีเป็นฟิลด์ 'ประเภท rm' → ต้อง map ชื่อประเภท rmเป็น rm_id
                    else if (dbField === 'rm_id') {
                        const rmtypeName = row[jsonKey]?.trim();                // ตัดช่องว่างชื่อประเภท rm
                        const rmtypeId = rmtypeMap.get(rmtypeName);           // หาค่า rm_id
                        mappedRow.rm_id = rmtypeId ?? undefined;               // ถ้าไม่เจอให้เป็น undefined
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
                mappedRow.rmifm_is_active = mappedRow.rmifm_is_active ?? true;
                mappedRow.create_date = new Date();
                mappedRow.create_by = reqUsername;
    
                console.log(`📌 Mapped Row ${index + 1}:`, mappedRow);
                return mappedRow;
            });
    
            console.log("formattedData",formattedData)
            // ✅ ตรวจสอบข้อมูลที่จำเป็น
            for (const item of formattedData) {
                if (validate.isNullOrEmpty(item.rmifm_code)) {
                    return response.setIncomplete(lang.msgRequired('raw_material_ifm.rmifm_code'));
                }
                if (validate.isNullOrEmpty(item.rmifm_name)) {
                    return response.setIncomplete(lang.msgRequired('raw_material_ifm.rmifm_name'));
                }
            }

    /* ตรวจชื่อประเภท rm ที่ไม่พบ (rm_id = undefined) */
        const notFoundRmTypes = formattedData.filter(l => !l.rm_id);
        if (notFoundRmTypes.length > 0) {
            return response.setIncomplete(
                `พบชื่อประเภทที่ไม่ตรงกับระบบ ${notFoundRmTypes.length} รายการ: ` +
                notFoundRmTypes.map(e => `${e.rmifm_code} (${e.rmifm_name})`).join(', ')
            );
        }

    /* ตรวจชื่อเกณฑ์ที่ไม่พบ (crt_id = undefined) */
        const notFoundCriterias = formattedData.filter(l => !l.crt_id);
        if (notFoundCriterias.length > 0) {
            return response.setIncomplete(
                `พบชื่อเกณฑ์ที่ไม่ตรงกับระบบ ${notFoundCriterias.length} รายการ: ` +
                notFoundCriterias.map(e => `${e.rmifm_code} (${e.rmifm_name})`).join(', ')
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
                notFoundUnits.map(e => `${e.rmifm_code} (${e.rmifm_name})`).join(', ')
            );
        }        

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_raw_material_ifm>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.rmifm_code);
                const isNameDuplicate = seenNames.has(s.rmifm_name);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.rmifm_code);
                    seenNames.add(s.rmifm_name);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.rmifm_code} (${e.rmifm_name})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueRMIfm
            const uniqueRMIfm = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `rmifm_code` และ `rmifm_name` ใน database
            const existingRMIfm = await repository
                .createQueryBuilder('rmifm')
                .where('rmifm.rmifm_code IN (:...codes) OR rmifm.rmifm_name IN (:...names)', {
                    codes: uniqueRMIfm.map((s) => s.rmifm_code).filter(Boolean),
                    names: uniqueRMIfm.map((s) => s.rmifm_name).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueRMIfm) ที่ซ้ำกับข้อมูลในระบบ (existingRMIfm)
            const duplicateInInput = uniqueRMIfm.filter((s) =>
                existingRMIfm.some((ex) =>
                    ex.rmifm_code === s.rmifm_code || ex.rmifm_name === s.rmifm_name
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.rmifm_code} (${e.rmifm_name})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedRMIfm = await repository.save(uniqueRMIfm);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.raw_material_ifm'), savedRMIfm);
    
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