import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_factory } from '../entities/m_factory.entity';
import { FactoryModel } from '../models/factory.model';
import { FtyDropdownModel } from '../models/factory_dropdown.model';
import { s_user_permis_factory } from '../entities/s_user_permis_factory.entity';
import { deleteEntity } from '../utils/DatabaseUtils';
import { m_warehouse } from '../entities/m_warehouse.entity';
import { m_inb_raw_material } from '../entities/m_inb_raw_material.entity';
import { m_inb_finished_goods } from '../entities/m_inb_finished_goods.entity';
import { m_inb_semi } from '../entities/m_inb_semi.entity';
import { m_inb_tooling } from '../entities/m_inb_tooling.entity';

export class FactoryService {
    private factoryRepository: Repository<m_factory>;
    private userPermisFtyRepository: Repository<s_user_permis_factory>;
    private warehouseRepository: Repository<m_warehouse>;

    constructor() {
        this.factoryRepository = AppDataSource.getRepository(m_factory);
        this.userPermisFtyRepository = AppDataSource.getRepository(s_user_permis_factory);
        this.warehouseRepository = AppDataSource.getRepository(m_warehouse);
    }

    async create(data: Partial<FactoryModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<FactoryModel>();
        const operation = 'FactoryService.create';
    
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
            const repository = manager ? useManager.getRepository(m_factory) : this.factoryRepository;
    
            // ตรวจสอบข้อมูลที่จำเป็น
            if (validate.isNullOrEmpty(data.fty_code)) {
                return response.setIncomplete(lang.msgRequired('factory.fty_code'));
            }
            if (validate.isNullOrEmpty(data.fty_name)) {
                return response.setIncomplete(lang.msgRequired('factory.fty_name'));
            }
            if (validate.isNullOrEmpty(data.fty_phone)) {
                return response.setIncomplete(lang.msgRequired('field.phone'));
            }
            if (validate.isNullOrEmpty(data.fty_address)) {
                return response.setIncomplete(lang.msgRequired('field.address'));
            }
            if (validate.isNullOrEmpty(reqUsername)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }
    
            // ตรวจสอบข้อมูลซ้ำ
            const existingFty = await repository
                .createQueryBuilder('fty')
                .where('fty.fty_code = :fty_code OR fty.fty_name = :fty_name', {
                    fty_code: data.fty_code,
                    fty_name: data.fty_name,
                })
                .getOne();
    
            if (existingFty) {
                return response.setIncomplete(
                    existingFty.fty_code === data.fty_code
                        ? lang.msgAlreadyExists('factory.fty_code')
                        : lang.msgAlreadyExists('factory.fty_name')
                );
            }
    
            // สร้างและบันทึกข้อมูล
            const newFactory = repository.create({
                ...data,
                fty_is_active: data.fty_is_active ?? true,
                create_date: new Date(),
                create_by: reqUsername,
            });
    
            const savedData = await repository.save(newFactory);
    
            // Commit Transaction หลังบันทึกข้อมูลสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgSuccessAction('created', 'item.factory'), savedData);
    
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
            // ปิด QueryRunner ทุกกรณี
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    

    async update(
        fty_id: number,
        data: Partial<FactoryModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<FactoryModel>();
        const operation = 'FactoryService.update';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        // ตรวจสอบ EntityManager หรือ QueryRunner
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        // เริ่ม Transaction หากไม่มี Manager
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const repository = manager ? useManager.getRepository(m_factory) : this.factoryRepository;
    
            // ตรวจสอบว่ามี fty_id อยู่ในระบบหรือไม่
            const existingFty = await repository.findOne({ where: { fty_id } });
            if (!existingFty) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }
    
            // ตรวจสอบค่าที่จำเป็น
            if (validate.isNullOrEmpty(data.fty_code)) {
                return response.setIncomplete(lang.msgRequired('factory.fty_code'));
            }
            if (validate.isNullOrEmpty(data.fty_name)) {
                return response.setIncomplete(lang.msgRequired('factory.fty_name'));
            }
            if (validate.isNullOrEmpty(data.fty_phone)) {
                return response.setIncomplete(lang.msgRequired('field.phone'));
            }
            if (validate.isNullOrEmpty(data.fty_address)) {
                return response.setIncomplete(lang.msgRequired('field.address'));
            }
    
            // ตรวจสอบว่า fty_code ไม่ซ้ำ
            if (data.fty_code && data.fty_code !== existingFty.fty_code) {
                const duplicateCode = await repository.findOne({
                    where: { fty_code: data.fty_code, fty_id: Not(fty_id) },
                });
                if (duplicateCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('factory.fty_code'));
                }
            }
    
            // ตรวจสอบว่า fty_name ไม่ซ้ำ
            if (data.fty_name && data.fty_name !== existingFty.fty_name) {
                const duplicateName = await repository.findOne({
                    where: { fty_name: data.fty_name, fty_id: Not(fty_id) },
                });
                if (duplicateName) {
                    return response.setIncomplete(lang.msgAlreadyExists('factory.fty_name'));
                }
            }
    
            // อัปเดตข้อมูล
            Object.assign(existingFty, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
            });
    
            // บันทึกข้อมูล
            await repository.save(existingFty);

            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(fty_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }

            // ตั้งค่า response เป็น "สำเร็จ"
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.factory'), dataResponse.data);

            // Commit Transaction ก่อน return response
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
            // ปิด QueryRunner ทุกกรณี
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async delete(fty_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'FactoryService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_factory) : this.factoryRepository;
            const warehouseRepository = manager ? useManager.getRepository(m_warehouse) : this.warehouseRepository;
            
            // ✅ ตรวจสอบว่า fty_id มีอยู่หรือไม่ (ไม่ต้องเช็ค fty_is_active เพราะ deleteEntity จัดการให้แล้ว)
            const existingFty = await repository.findOne({ where: { fty_id } });
            if (!existingFty) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }

            // ✅ ดึง wh_id ทั้งหมดที่อยู่ในโรงงานนี้
            const warehouses = await warehouseRepository.find({ where: { fty_id } });
            const whIds = warehouses.map(wh => wh.wh_id);

            if (whIds.length > 0) {
                // ✅ ตรวจสอบว่ายังมีสินค้าอยู่หรือไม่ โดยใช้ `EXISTS()`
                const hasStock = await useManager
                    .createQueryBuilder()
                    .select('1')
                    .from(m_warehouse, 'wh')
                    .leftJoin(m_inb_raw_material, 'inbrm', 'inbrm.wh_id = wh.wh_id')
                    .leftJoin(m_inb_finished_goods, 'inbfg', 'inbfg.wh_id = wh.wh_id')
                    .leftJoin(m_inb_semi, 'inbsemi', 'inbsemi.wh_id = wh.wh_id')
                    .leftJoin(m_inb_tooling, 'inbtl', 'inbtl.wh_id = wh.wh_id')
                    .where('wh.wh_id IN (:...whIds)', { whIds })
                    .andWhere(`
                        COALESCE(inbrm.inbrm_quantity, 0) +
                        COALESCE(inbfg.inbfg_quantity, 0) +
                        COALESCE(inbsemi.inbsemi_quantity, 0) +
                        COALESCE(inbtl.inbtl_quantity, 0) > 0
                    `)
                    .limit(1) // ถ้ามีสินค้าแม้แต่ 1 รายการ ให้หยุดตรวจสอบ
                    .getRawOne();

                if (hasStock) {
                    return response.setIncomplete(lang.msg('field.cannot_delete_has_stock'));
                }
            }
    
            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, fty_id, reqUsername, 'fty_is_active', 'fty_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
    
            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง Response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.factory'));
    
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
        const operation = 'FactoryService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(m_factory) : this.factoryRepository;
    
            const rawData = await repository
                .createQueryBuilder('factory')
                .select([
                    'factory.fty_id AS fty_id',
                    'factory.fty_code AS fty_code',
                    'factory.fty_name AS fty_name',
                    'factory.fty_phone AS fty_phone',
                    'factory.fty_address AS fty_address',
                    'factory.create_date AS create_date',
                    'factory.create_by AS create_by',
                    'factory.update_date AS update_date',
                    'factory.update_by AS update_by',
                    'factory.fty_is_active AS fty_is_active'
                ])
                .where('factory.fty_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.factory'));
            }
    
            return response.setComplete(lang.msgFound('item.factory'), rawData);
    
        } catch (error: any) {
            console.error('Error in getAll:', error);
    
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getById(fty_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'FactoryService.getById';
    
        try {
            const repository = manager ? manager.getRepository(m_factory) : this.factoryRepository;
    
            const rawData = await repository
                .createQueryBuilder('factory')
                .select([
                    'factory.fty_id AS fty_id',
                    'factory.fty_code AS fty_code',
                    'factory.fty_name AS fty_name',
                    'factory.fty_phone AS fty_phone',
                    'factory.fty_address AS fty_address',
                    'factory.create_date AS create_date',
                    'factory.create_by AS create_by',
                    'factory.update_date AS update_date',
                    'factory.update_by AS update_by',
                    'factory.fty_is_active AS fty_is_active'
                ])
                .where('factory.fty_id = :fty_id', { fty_id })
                .andWhere('factory.fty_is_active = :isActive', { isActive: true })
                .getRawOne();
    
            if (!rawData) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }
    
            return response.setComplete(lang.msgFound('factory.fty_id'), rawData);
    
        } catch (error: any) {
            console.error(`Error in ${operation} with fty_id: ${fty_id}`, error);
    
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    

    async getFtyDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'FactoryService.getFtyDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_factory) : this.factoryRepository;
    
            // ดึงข้อมูล fty_name
            const rawData = await repository.createQueryBuilder("factory")
                .select(["factory.fty_id", "factory.fty_name"])
                .where("factory.fty_name IS NOT NULL") // กรองค่า null ออก
                .andWhere('factory.fty_is_active = :isActive', { isActive: true })
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
                if (!rawData || rawData.length === 0) {
                    return response.setIncomplete(lang.msgNotFound('item.factory'));
                }
        
                const data = rawData.map((fty) => new FtyDropdownModel(fty.factory_fty_id, fty.factory_fty_name));
        
                return response.setComplete(lang.msgFound('item.factory'), data);
        
            } catch (error: any) {
                console.error('Error during getFtyDropdown:', error);
        
                if (error instanceof QueryFailedError) {
                    return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
                }
        
                throw new Error(lang.msgErrorFunction(operation, error.message));
            }
        }

    async getFtyDropdownByUserId(user_id: number, manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'FactoryService.getFtyDropdownByUserId';
    
        try {
            const repository = manager ? manager.getRepository(s_user_permis_factory) : this.userPermisFtyRepository;
    
            // ดึงข้อมูล fty_name พร้อมกรอง fty_id ตามสิทธิ์ของ user
            const rawData = await repository.createQueryBuilder("permisfty")
                .innerJoin('m_factory', 'factory', 'permisfty.fty_id = factory.fty_id')
                .select(["factory.fty_id", "factory.fty_name"])
                .where("permisfty.user_id = :user_id", { user_id }) // กรอง user_id
                .andWhere("factory.fty_name IS NOT NULL") // กรองค่า null ออก
                .andWhere('factory.fty_is_active = :isActive', { isActive: true })
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.factory'));
            }
    
            console.log('rawData:', rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ FtyDropdownModel โดยใช้ fty_name สำหรับทั้ง text และ value
            const data = rawData.map((fty) => new FtyDropdownModel(fty.factory_fty_id, fty.factory_fty_name));
    
            return response.setComplete(lang.msgFound('item.factory'), data);
    
        } catch (error: any) {
            console.error('Error during getFtyDropdownByUserId:', error.message);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async codeExists(id: string, manager?: EntityManager): Promise<boolean> {
        const repository = manager ? manager.getRepository(m_factory) : this.factoryRepository;
        const count = await repository.count({ where: { fty_id: Number(id) } });
        return count > 0;
    }

    async createJson(
        data: any[], 
        reqUsername: string, 
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'FactoryService.createJson';
    
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
            const repository = useManager.getRepository(m_factory);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_factory> = {
                'รหัสโรงงาน': 'fty_code',
                'ชื่อโรงงาน': 'fty_name',
                'ที่อยู่': 'fty_address',
                'เบอร์ติดต่อ': 'fty_phone'
            };
    
            console.log('📌 Raw JSON Data:', data);
    
            // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล
            const formattedData: Partial<m_factory>[] = data.map((row: any, index) => {
                const mappedRow: Partial<m_factory> = {};
    
                Object.keys(row).forEach((jsonKey) => {
                    const dbField = fieldMapping[jsonKey];
                    if (dbField) {
                        mappedRow[dbField] = row[jsonKey] !== '' ? row[jsonKey] : null; // ✅ ให้ `""` เป็น `null`
                    }
                });
    
                // ✅ ตั้งค่า default values
                mappedRow.fty_is_active = mappedRow.fty_is_active ?? true;
                mappedRow.create_date = new Date();
                mappedRow.create_by = reqUsername;
    
                console.log(`📌 Mapped Row ${index + 1}:`, mappedRow);
                return mappedRow;
            });
    
            console.log("formattedData",formattedData)
            // ✅ ตรวจสอบข้อมูลที่จำเป็น
            for (const item of formattedData) {
                if (validate.isNullOrEmpty(item.fty_code)) {
                    return response.setIncomplete(lang.msgRequired('factory.fty_code'));
                }
                if (validate.isNullOrEmpty(item.fty_name)) {
                    return response.setIncomplete(lang.msgRequired('factory.fty_name'));
                }
                if (validate.isNullOrEmpty(item.fty_address)) {
                    return response.setIncomplete(lang.msgRequired('field.address'));
                }
                if (validate.isNullOrEmpty(item.fty_phone)) {
                    return response.setIncomplete(lang.msgRequired('field.phone'));
                }
            }

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_factory>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.fty_code);
                const isNameDuplicate = seenNames.has(s.fty_name);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.fty_code);
                    seenNames.add(s.fty_name);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.fty_code} (${e.fty_name})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueFactories
            const uniqueFactories = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `fty_code` และ `fty_name` ใน database
            const existingFactories = await repository
                .createQueryBuilder('fty')
                .where('fty.fty_code IN (:...codes) OR fty.fty_name IN (:...names)', {
                    codes: uniqueFactories.map((s) => s.fty_code).filter(Boolean),
                    names: uniqueFactories.map((s) => s.fty_name).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueFactories) ที่ซ้ำกับข้อมูลในระบบ (existingFactories)
            const duplicateInInput = uniqueFactories.filter((s) =>
                existingFactories.some((ex) =>
                    ex.fty_code === s.fty_code || ex.fty_name === s.fty_name
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.fty_code} (${e.fty_name})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedFactories = await repository.save(uniqueFactories);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.factory'), savedFactories);
    
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


