import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_finished_goods_ifm } from '../entities/m_finished_goods_ifm.entity';
import { FinishedGoodsIfmModel } from '../models/finished_goods_ifm.model';
import { m_unit } from '../entities/m_unit.entity';
import { FGIfmDropdownModel } from '../models/finished_goods_ifm_dropdown.model';
import { m_criteria } from '../entities/m_criteria.entity';
import { m_finished_goods } from '../entities/m_finished_goods.entity';
import { deleteEntity } from '../utils/DatabaseUtils';

export class FinishedGoodsIfmService {
    private fgifmRepository: Repository<m_finished_goods_ifm>;
    private unitRepository: Repository<m_unit>;
    private fgtypeRepository: Repository<m_finished_goods>;
    private criteriaRepository: Repository<m_criteria>;

    constructor(){
        this.fgifmRepository = AppDataSource.getRepository(m_finished_goods_ifm);
        this.unitRepository = AppDataSource.getRepository(m_unit);
        this.criteriaRepository = AppDataSource.getRepository(m_criteria);
        this.fgtypeRepository = AppDataSource.getRepository(m_finished_goods);
    }

    //validate field inbrm
    private validateRequiredFields(data: Partial<FinishedGoodsIfmModel>, response: ApiResponse<any>): ApiResponse<any> | null {
        const requiredFields = [
            { field: data.fg_id, message: 'finished_goods.fg_id' },
            { field: data.crt_id, message: 'criteria.crt_id' },
            { field: data.fgifm_code, message: 'finished_goods_ifm.fgifm_code' },
            { field: data.fgifm_name, message: 'finished_goods_ifm.fgifm_name' },
            { field: data.fgifm_width, message: 'finished_goods_ifm.fgifm_width' },
            { field: data.fgifm_width_unitId, message: 'finished_goods_ifm.fgifm_width_unitId' },
            { field: data.fgifm_length, message: 'finished_goods_ifm.fgifm_length' },
            { field: data.fgifm_length_unitId, message: 'finished_goods_ifm.fgifm_length_unitId' },
            { field: data.fgifm_thickness, message: 'finished_goods_ifm.fgifm_thickness' },
            { field: data.fgifm_thickness_unitId, message: 'finished_goods_ifm.fgifm_thickness_unitId' },
            { field: data.fgifm_product_unitId, message: 'finished_goods_ifm.fgifm_product_unitId' },
        ];
    
        for (const { field, message } of requiredFields) {
            if (validate.isNullOrEmpty(field)) {
                return response.setIncomplete(lang.msgRequired(message));
            }
        }
    
        return null;
    }

    async create(data: Partial<FinishedGoodsIfmModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<FinishedGoodsIfmModel>();
        const operation = 'FinishedGoodsIfmService.create';

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

            const repository = manager ? useManager.getRepository(m_finished_goods_ifm) : this.fgifmRepository;
            const unitRepository = manager ? useManager.getRepository(m_unit) : this.unitRepository;
            const criteriaRepository = manager ? useManager.getRepository(m_criteria) : this.criteriaRepository;
            const fgtypeRepository = manager ? useManager.getRepository(m_finished_goods) : this.fgtypeRepository;

            // Validate required fields
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) {
                return validationResponse;
            }

            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            // ตรวจสอบว่า fg_id มีอยู่ใน m_finished_goods หรือไม่
            const existingFGType = await fgtypeRepository.findOne({ where: { fg_id: data.fg_id } });
            if (!existingFGType) {
                return response.setIncomplete(lang.msgNotFound('finished_goods.fg_id'));
            }

            // ตรวจสอบว่า fg_id มีอยู่ใน m_criteria หรือไม่
            const existingCrt = await criteriaRepository.findOne({ where: { crt_id: data.crt_id } });
            if (!existingCrt) {
                return response.setIncomplete(lang.msgNotFound('criteria.crt_id'));
            }

            // ตรวจสอบว่า fgifm_width_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitWd = await unitRepository.findOne({ where: { unit_id: data.fgifm_width_unitId } });
            if (!existingUnitWd) {
                return response.setIncomplete(lang.msgNotFound('finished_goods_ifm.fgifm_width_unitId'));
            }

            // ตรวจสอบว่า fgifm_length_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitLen = await unitRepository.findOne({ where: { unit_id: data.fgifm_length_unitId } });
            if (!existingUnitLen) {
                return response.setIncomplete(lang.msgNotFound('finished_goods_ifm.fgifm_length_unitId'));
            }

            // ตรวจสอบว่า fgifm_thickness_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitThk = await unitRepository.findOne({ where: { unit_id: data.fgifm_thickness_unitId } });
            if (!existingUnitThk) {
                return response.setIncomplete(lang.msgNotFound('finished_goods_ifm.fgifm_thickness_unitId'));
            }

            // ตรวจสอบว่า fgifm_product_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitPO = await unitRepository.findOne({ where: { unit_id: data.fgifm_product_unitId } });
            if (!existingUnitPO) {
                return response.setIncomplete(lang.msgNotFound('finished_goods_ifm.fgifm_product_unitId'));
            }
            
            // ตรวจสอบว่า fgifm_code มีอยู่ในฐานข้อมูลหรือไม่
            const existingCode = await repository.findOne({ where: { fgifm_code: data.fgifm_code } });
            if (existingCode) {
                return response.setIncomplete(lang.msgAlreadyExists('finished_goods_ifm.fgifm_code'));
            }

            // ตรวจสอบว่า fgifm_name มีอยู่ในฐานข้อมูลหรือไม่
            const existingName = await repository.findOne({ where: { fgifm_name: data.fgifm_name } });
            if (existingName) {
                return response.setIncomplete(lang.msgAlreadyExists('finished_goods_ifm.fgifm_name'));
            }

            const Data = repository.create({
                ...data,
                fg_id: existingFGType.fg_id,
                crt_id: existingCrt.crt_id,
                fgifm_width_unitId: existingUnitWd.unit_id,
                fgifm_length_unitId: existingUnitLen.unit_id,
                fgifm_thickness_unitId: existingUnitThk.unit_id,
                fgifm_product_unitId: existingUnitPO.unit_id,
                fgifm_is_active: data.fgifm_is_active ?? true,
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
            return response.setComplete(lang.msgSuccessAction('created', 'item.finished_goods_ifm'), savedData);

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
        fgifm_id: number,
        data: Partial<FinishedGoodsIfmModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<FinishedGoodsIfmModel>();
        const operation = 'FinishedGoodsIfmService.update';
    
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
            const repository = manager ? useManager.getRepository(m_finished_goods_ifm) : this.fgifmRepository;
            const unitRepository = manager ? useManager.getRepository(m_unit) : this.unitRepository;
            const criteriaRepository = manager ? useManager.getRepository(m_criteria) : this.criteriaRepository;
            const fgtypeRepository = manager ? useManager.getRepository(m_finished_goods) : this.fgtypeRepository;

            // ตรวจสอบว่ามี fgifm_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingFGIfm = await repository.findOne({ where: { fgifm_id: fgifm_id } });
            if (!existingFGIfm) {
                return response.setIncomplete(lang.msgNotFound('finished_goods_ifm.fgifm_id'));
            }

            // Validate required fields
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) {
                return validationResponse;
            }

            // ตรวจสอบว่า fg_id มีอยู่ใน m_finished_goods หรือไม่
            const existingFGType = await fgtypeRepository.findOne({ where: { fg_id: data.fg_id } });
            if (!existingFGType) {
                return response.setIncomplete(lang.msgNotFound('finished_goods.fg_id'));
            }

            // ตรวจสอบว่า fg_id มีอยู่ใน m_criteria หรือไม่
            const existingCrt = await criteriaRepository.findOne({ where: { crt_id: data.crt_id } });
            if (!existingCrt) {
                return response.setIncomplete(lang.msgNotFound('criteria.crt_id'));
            }

            // ตรวจสอบว่า fgifm_width_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitWd = await unitRepository.findOne({ where: { unit_id: data.fgifm_width_unitId } });
            if (!existingUnitWd) {
                return response.setIncomplete(lang.msgNotFound('finished_goods_ifm.fgifm_width_unitId'));
            }

            // ตรวจสอบว่า fgifm_length_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitLen = await unitRepository.findOne({ where: { unit_id: data.fgifm_length_unitId } });
            if (!existingUnitLen) {
                return response.setIncomplete(lang.msgNotFound('finished_goods_ifm.fgifm_length_unitId'));
            }

            // ตรวจสอบว่า fgifm_thickness_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitThk = await unitRepository.findOne({ where: { unit_id: data.fgifm_thickness_unitId } });
            if (!existingUnitThk) {
                return response.setIncomplete(lang.msgNotFound('finished_goods_ifm.fgifm_thickness_unitId'));
            }

            // ตรวจสอบว่า fgifm_product_unitId มีอยู่ใน m_unit หรือไม่
            const existingUnitPO = await unitRepository.findOne({ where: { unit_id: data.fgifm_product_unitId } });
            if (!existingUnitPO) {
                return response.setIncomplete(lang.msgNotFound('finished_goods_ifm.fgifm_product_unitId'));
            }

            // ตรวจสอบว่า fgifm_code ไม่ซ้ำ
            if (data.fgifm_code && data.fgifm_code !== existingFGIfm.fgifm_code) {
                const duplicateCode = await repository.findOne({
                    where: { fgifm_code: data.fgifm_code, fgifm_id: Not(fgifm_id) },
                });
                if (duplicateCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('finished_goods_ifm.fgifm_code'));
                }
            }
    
            // ตรวจสอบว่า fgifm_name ไม่ซ้ำ
            if (data.fgifm_name && data.fgifm_name !== existingFGIfm.fgifm_name) {
                const duplicateName = await repository.findOne({
                    where: { fgifm_name: data.fgifm_name, fgifm_id: Not(fgifm_id) },
                });
                if (duplicateName) {
                    return response.setIncomplete(lang.msgAlreadyExists('finished_goods_ifm.fgifm_name'));
                }
            }

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existingFGIfm, {
                ...data,
                fg_id: existingFGType.fg_id,
                crt_id: existingCrt.crt_id,
                fgifm_width_unitId: existingUnitWd.unit_id,
                fgifm_length_unitId: existingUnitLen.unit_id,
                fgifm_thickness_unitId: existingUnitThk.unit_id,
                fgifm_product_unitId: existingUnitPO.unit_id,
                update_by: reqUsername,
                update_date: new Date(),
            });
    
            await repository.save(existingFGIfm); // บันทึกข้อมูล

            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(fgifm_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }
    
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.finished_goods_ifm'), dataResponse.data);

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

    async delete(fgifm_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'FinishedGoodsIfmService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_finished_goods_ifm) : this.fgifmRepository;

            // ตรวจสอบว่ามี fgifm_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingFGIfm = await repository.findOne({ where: { fgifm_id: fgifm_id } });
            if (!existingFGIfm) {
                return response.setIncomplete(lang.msgNotFound('finished_goods_ifm.fgifm_id'));
            }

            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, fgifm_id, reqUsername, 'fgifm_is_active', 'fgifm_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
            
            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.finished_goods_ifm'));
    
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
        const operation = 'FinishedGoodsIfmService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_finished_goods_ifm) : this.fgifmRepository;

            // Query finished_goods_ifm ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
            .createQueryBuilder('fgifm')
            .leftJoin('m_unit', 'unit_width', 'unit_width.unit_id = fgifm.fgifm_width_unitId')
            .leftJoin('m_unit', 'unit_length', 'unit_length.unit_id = fgifm.fgifm_length_unitId')
            .leftJoin('m_unit', 'unit_thickness', 'unit_thickness.unit_id = fgifm.fgifm_thickness_unitId')
            .leftJoin('m_unit', 'unit_product', 'unit_product.unit_id = fgifm.fgifm_product_unitId')
            .leftJoin('m_finished_goods', 'fg', 'fg.fg_id = fgifm.fg_id')
            .leftJoin('m_criteria', 'crt', 'crt.crt_id = fgifm.crt_id')   
            .select([
                'fgifm.fgifm_id AS fgifm_id',
                'fgifm.fgifm_code AS fgifm_code',
                'fgifm.fgifm_name AS fgifm_name',
                'fg.fg_type AS fg_type',
                // ใช้ COALESCE ใน CONCAT เพื่อป้องกันค่า NULL
                "CONCAT(COALESCE(fgifm.fgifm_width, ''), ' ', COALESCE(unit_width.unit_name_th, '')) AS fgifm_width_with_name",
                "CONCAT(COALESCE(fgifm.fgifm_length, ''), ' ', COALESCE(unit_length.unit_name_th, '')) AS fgifm_length_with_name",
                "CONCAT(COALESCE(fgifm.fgifm_thickness, ''), ' ', COALESCE(unit_thickness.unit_name_th, '')) AS fgifm_thickness_with_name",
                "unit_product.unit_name_th AS fgifm_product_unitId",
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
                'fgifm.fgifm_is_active AS fgifm_is_active',
            ])
            .where('fgifm.fgifm_is_active = :isActive', { isActive: true })
            .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
            .getRawMany();        

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.finished_goods_ifm'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.finished_goods_ifm'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(fgifm_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'FinishedGoodsIfmService.getById';

        try {
            const repository = manager ? manager.getRepository(m_finished_goods_ifm) : this.fgifmRepository;
    
            // Query finished_goods_ifm ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('fgifm')
                .leftJoin('m_finished_goods', 'fg', 'fg.fg_id = fgifm.fg_id')
                .leftJoin('m_unit', 'unit', 'unit.unit_id = fgifm.fgifm_width_unitId')
                .leftJoin('m_unit' , 'unit_width', 'unit_width.unit_id = fgifm.fgifm_width_unitId')
                .leftJoin('m_unit' , 'unit_length', 'unit_length.unit_id = fgifm.fgifm_length_unitId')
                .leftJoin('m_unit' , 'unit_thickness', 'unit_thickness.unit_id = fgifm.fgifm_thickness_unitId')
                .leftJoin('m_unit' , 'unit_product', 'unit_product.unit_id = fgifm.fgifm_product_unitId')
                .leftJoin('m_criteria' , 'crt', 'crt.crt_id = fgifm.crt_id')
                .select([
                    'fgifm.fgifm_id AS fgifm_id',
                    'fgifm.fgifm_code AS fgifm_code',
                    'fgifm.fgifm_name AS fgifm_name',
                    'fgifm.fgifm_width AS fgifm_width',
                    'fgifm.fgifm_width_unitId AS fgifm_width_unitId',
                    'unit_width.unit_abbr_th AS fgifm_width_unit_name',
                    'fgifm.fgifm_length AS fgifm_length',
                    'fgifm.fgifm_length_unitId AS fgifm_length_unitId',
                    'unit_length.unit_abbr_th AS fgifm_length_unit_name',
                    'fgifm.fgifm_thickness AS fgifm_thickness',
                    'fgifm.fgifm_thickness_unitId AS fgifm_thickness_unitId',
                    'unit_thickness.unit_abbr_th AS fgifm_thickness_unit_name',
                    'fgifm.fgifm_product_unitId AS fgifm_product_unitId',
                    'unit_product.unit_abbr_th AS fgifm_product_name',
                    "unit.unit_abbr_th AS fgifm_product_name",
                    'fg.fg_id AS fg_id',
                    'fg.fg_type AS fg_type',
                    'crt.crt_id AS crt_id',
                    'crt.crt_exp_low AS crt_exp_low',
                    'crt.crt_exp_medium AS crt_exp_medium',
                    'crt.crt_exp_high AS crt_exp_high',
                    'crt.crt_rem_low AS crt_rem_low',
                    'crt.crt_rem_medium AS crt_rem_medium',
                    'crt.crt_rem_high AS crt_rem_high',
                ])
                .where('fgifm.fgifm_id = :fgifm_id', { fgifm_id })
                .andWhere('fgifm.fgifm_is_active = :isActive', { isActive: true })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('finished_goods_ifm.fgifm_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('finished_goods_ifm.fgifm_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with fgifm_id: ${fgifm_id}`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getFGIfmDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'FinishedGoodsIfmService.getFGIfmDropdown';
    
        try {
            const repository = manager
                ? manager.getRepository(m_finished_goods_ifm)
                : this.fgifmRepository; // เลือก Repository ที่เหมาะสม
    
            // ดึงข้อมูล fgifm_id และรวม fgifm_code กับ fgifm_name
            const rawData = await repository
                .createQueryBuilder("fgifm")
                .select([
                    "fgifm.fgifm_id", // เลือก fgifm_id
                    "CONCAT(fgifm.fgifm_code, ' ', fgifm.fgifm_name) AS fgifm_code_name" // รวม fgifm_code และ fgifm_name
                ])
                .where("fgifm.fgifm_id IS NOT NULL") // กรองค่า null ออก
                .andWhere("fgifm.fgifm_is_active = :isActive", { isActive: true }) // กรองเฉพาะข้อมูลที่ใช้งานอยู่
                .distinct(true) // ให้ผลลัพธ์ไม่ซ้ำ
                .getRawMany(); // ดึงข้อมูลในรูปแบบ raw
    
            // ตรวจสอบว่า rawData มีข้อมูลหรือไม่
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound("item.finished_goods_ifm")); // หากไม่พบข้อมูล
            }
    
            console.log("rawData:", rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ LocDropdownModel
            const data = rawData.map((fg: any) => new FGIfmDropdownModel(fg.fgifm_fgifm_id, fg.fgifm_code_name));
    
            return response.setComplete(lang.msgFound("item.finished_goods_ifm"), data); // ส่งผลลัพธ์กลับ
        } catch (error: any) {
            console.error("Error during getFGIfmDropdown:", error.message); // แสดงข้อผิดพลาด
            throw new Error(lang.msgErrorFunction(operation, error.message)); // ส่งข้อผิดพลาดกลับ
        }
    }

    async createJson(
        data: any[], 
        reqUsername: string, 
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'FinishedGoodsIfmService.createJson';
    
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
            const repository = useManager.getRepository(m_finished_goods_ifm);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_finished_goods_ifm> = {
                'รหัส': 'fgifm_code',
                'ชื่อ': 'fgifm_name',
                'ความกว้าง': 'fgifm_width',
                'หน่วยของความกว้าง': 'fgifm_width_unitId',
                'ความยาว': 'fgifm_length',
                'หน่วยของความยาว': 'fgifm_length_unitId',
                'ความหนา': 'fgifm_thickness',
                'หน่วยของความหนา': 'fgifm_thickness_unitId',
                'หน่วยของสินค้า': 'fgifm_product_unitId',
                'ประเภท': 'fg_id',
                'เกณฑ์': 'crt_id'
            };
    
            console.log('📌 Raw JSON Data:', data);
    
    /* Map ชื่อประเภท fg เป็น ID */
            // ✅ ดึงรายชื่อประเภท fg ทั้งหมดจาก DB
            const fgtype = await this.fgtypeRepository.find();

            // ✅ สร้าง Map: 'ชื่อประเภท fg ' => fg_id
            const fgtypeMap = new Map(fgtype.map(f => [f.fg_type?.trim(), f.fg_id]));
    
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
            const formattedData: Partial<m_finished_goods_ifm>[] = data.map((row: any, index) => {
                const mappedRow: Partial<m_finished_goods_ifm> = {};
    
                Object.keys(row).forEach((jsonKey) => {
                    const dbField = fieldMapping[jsonKey];
            // ฟิลด์ที่ลงท้ายว่า _unitId และ map หน่วยให้เป็น ID
                    if (dbField?.endsWith('_unitId')) {
                        const unitName = row[jsonKey]?.trim();
                        const unitId = unitMap.get(unitName);
                        (mappedRow as any)[dbField] = unitId ?? undefined;
                    } 
            // กรณีเป็นฟิลด์ 'ประเภท fg' → ต้อง map ชื่อประเภท fgเป็น fg_id
                    else if (dbField === 'fg_id') {
                        const fgtypeName = row[jsonKey]?.trim();                // ตัดช่องว่างชื่อประเภท fg
                        const fgtypeId = fgtypeMap.get(fgtypeName);           // หาค่า fg_id
                        mappedRow.fg_id = fgtypeId ?? undefined;               // ถ้าไม่เจอให้เป็น undefined
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
                mappedRow.fgifm_is_active = mappedRow.fgifm_is_active ?? true;
                mappedRow.create_date = new Date();
                mappedRow.create_by = reqUsername;
    
                console.log(`📌 Mapped Row ${index + 1}:`, mappedRow);
                return mappedRow;
            });
    
            console.log("formattedData",formattedData)
            // ✅ ตรวจสอบข้อมูลที่จำเป็น
            for (const item of formattedData) {
                if (validate.isNullOrEmpty(item.fgifm_code)) {
                    return response.setIncomplete(lang.msgRequired('finished_goods_ifm.fgifm_code'));
                }
                if (validate.isNullOrEmpty(item.fgifm_name)) {
                    return response.setIncomplete(lang.msgRequired('finished_goods_ifm.fgifm_name'));
                }
            }

    /* ตรวจชื่อประเภท fg ที่ไม่พบ (fg_id = undefined) */
        const notFoundfgTypes = formattedData.filter(l => !l.fg_id);
        if (notFoundfgTypes.length > 0) {
            return response.setIncomplete(
                `พบชื่อประเภทที่ไม่ตรงกับระบบ ${notFoundfgTypes.length} รายการ: ` +
                notFoundfgTypes.map(e => `${e.fgifm_code} (${e.fgifm_name})`).join(', ')
            );
        }

    /* ตรวจชื่อเกณฑ์ที่ไม่พบ (crt_id = undefined) */
        const notFoundCriterias = formattedData.filter(l => !l.crt_id);
        if (notFoundCriterias.length > 0) {
            return response.setIncomplete(
                `พบชื่อเกณฑ์ที่ไม่ตรงกับระบบ ${notFoundCriterias.length} รายการ: ` +
                notFoundCriterias.map(e => `${e.fgifm_code} (${e.fgifm_name})`).join(', ')
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
                notFoundUnits.map(e => `${e.fgifm_code} (${e.fgifm_name})`).join(', ')
            );
        }        

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_finished_goods_ifm>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.fgifm_code);
                const isNameDuplicate = seenNames.has(s.fgifm_name);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.fgifm_code);
                    seenNames.add(s.fgifm_name);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.fgifm_code} (${e.fgifm_name})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueFGIfm
            const uniqueFGIfm = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `fgifm_code` และ `fgifm_name` ใน database
            const existingFGIfm = await repository
                .createQueryBuilder('fgifm')
                .where('fgifm.fgifm_code IN (:...codes) OR fgifm.fgifm_name IN (:...names)', {
                    codes: uniqueFGIfm.map((s) => s.fgifm_code).filter(Boolean),
                    names: uniqueFGIfm.map((s) => s.fgifm_name).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueFGIfm) ที่ซ้ำกับข้อมูลในระบบ (existingFGIfm)
            const duplicateInInput = uniqueFGIfm.filter((s) =>
                existingFGIfm.some((ex) =>
                    ex.fgifm_code === s.fgifm_code || ex.fgifm_name === s.fgifm_name
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.fgifm_code} (${e.fgifm_name})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedFGIfm = await repository.save(uniqueFGIfm);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.finished_goods_ifm'), savedFGIfm);
    
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