import { Repository, EntityManager, Not } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils
import CodeGenerator from '../utils/CodeGenerator';

import { m_inb_tooling } from '../entities/m_inb_tooling.entity';
import { InbToolingModel } from '../models/inb_tooling.model';
import { m_factory } from '../entities/m_factory.entity';
import { m_warehouse } from '../entities/m_warehouse.entity';
import { m_zone } from '../entities/m_zone.entity';
import { m_location } from '../entities/m_location.entity';
import { InbtlDropdownModel } from '../models/inb_tooling_dropdown.model';
import { m_tooling_ifm } from '../entities/m_tooling_ifm.entity';
import { m_supplier } from '../entities/m_supplier.entity';
import { deleteEntity } from '../utils/DatabaseUtils';

export class InbToolingService {
    private inbToolingRepository: Repository<m_inb_tooling>;
    private factoryRepository: Repository<m_factory>;
    private warehouseRepository: Repository<m_warehouse>;
    private zoneRepository: Repository<m_zone>;
    private locationRepository: Repository<m_location>;
    private tlifmRepository: Repository<m_tooling_ifm>;
    private supplierRepository: Repository<m_supplier>;

    constructor() {
        this.inbToolingRepository = AppDataSource.getRepository(m_inb_tooling);
        this.factoryRepository = AppDataSource.getRepository(m_factory);
        this.warehouseRepository = AppDataSource.getRepository(m_warehouse);
        this.zoneRepository = AppDataSource.getRepository(m_zone);
        this.locationRepository = AppDataSource.getRepository(m_location);
        this.tlifmRepository = AppDataSource.getRepository(m_tooling_ifm);
        this.supplierRepository = AppDataSource.getRepository(m_supplier);
    }

    private async generateCode(): Promise<string> {
        const codeGenerator = new CodeGenerator(AppDataSource);
        const newCode = await codeGenerator.generateCode('m_inb_tooling', 'inbtl_code', 'TL', '', '[PREFIX][000x]');
        console.log("Generated Code:", newCode); // ตรวจสอบค่าที่ได้
        return newCode;
    }

    //validate field inbtl
    private validateRequiredFields(data: Partial<InbToolingModel>, response: ApiResponse<any>): ApiResponse<any> | null {
        const requiredFields = [
            { field: data.fty_id, message: 'item.factory' },
            { field: data.wh_id, message: 'item.warehouse' },
            { field: data.zn_id, message: 'item.zone' },
            { field: data.loc_id, message: 'item.location' },
            { field: data.sup_id, message: 'item.supplier' },
        ];
    
        for (const { field, message } of requiredFields) {
            if (validate.isNullOrEmpty(field)) {
                return response.setIncomplete(lang.msgRequired(message));
            }
        }
    
        return null;
    }

    async create(data: Partial<InbToolingModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<InbToolingModel>();
        let Data = new m_inb_tooling();
        const operation = 'InbToolingService.create';

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
            
            const repository = manager ? useManager.getRepository(m_inb_tooling) : this.inbToolingRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory) : this.factoryRepository;
            const warehouseRepository = manager ? useManager.getRepository(m_warehouse) : this.warehouseRepository;
            const zoneRepository = manager ? useManager.getRepository(m_zone) : this.zoneRepository;
            const locationRepository = manager ? useManager.getRepository(m_location) : this.locationRepository;
            const tlifmRepository = manager ? useManager.getRepository(m_tooling_ifm) : this.tlifmRepository;
            const supplierRepository = manager ? useManager.getRepository(m_supplier) : this.supplierRepository;

            // ตรวจสอบว่า tlifm_id มีอยู่ใน m_tooling_ifm หรือไม่
            const existingTlIfm = await tlifmRepository.findOne({ where: { tlifm_id: data.tlifm_id } });
            if (!existingTlIfm) {
                return response.setIncomplete(lang.msgNotFound('tooling_ifm.tlifm_id'));
            }

            // ตรวจสอบว่า fty_id มีอยู่ใน m_factory หรือไม่
            const existingFtyId = await factoryRepository.findOne({ where: { fty_id: data.fty_id } });
            if (!existingFtyId) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }

            // ตรวจสอบว่า wh_id มีอยู่ใน m_warehouse หรือไม่
            const existingWhId = await warehouseRepository.findOne({ where: { wh_id: data.wh_id } });
            if (!existingWhId) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_id'));
            }

            // ตรวจสอบว่า zn_id มีอยู่ใน m_zone หรือไม่
            const existingZnId = await zoneRepository.findOne({ where: { zn_id: data.zn_id } });
            if (!existingZnId) {
                return response.setIncomplete(lang.msgNotFound('zone.zn_id'));
            }

            // ตรวจสอบว่า loc_id มีอยู่ใน m_location หรือไม่
            const existingLocId = await locationRepository.findOne({ where: { loc_id: data.loc_id } });
            if (!existingLocId) {
                return response.setIncomplete(lang.msgNotFound('location.loc_id'));
            }

            // ตรวจสอบว่า sup_id มีอยู่ใน m_supplier หรือไม่
            const existingSup = await supplierRepository.findOne({ where: { sup_id: data.sup_id } });
            if (!existingSup) {
                return response.setIncomplete(lang.msgNotFound('supplier.sup_id'));
            }

            // Validate required fields
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) {
                return validationResponse;
            }

            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }

            if (validate.isNotNullOrEmpty(data.inbtl_code)) {
                const existingCode = await repository.findOneBy({ inbtl_code: data.inbtl_code });
                if (existingCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('inbtl.inbtl_code'));
                }
            } else {
                data.inbtl_code = await this.generateCode();
            }

              // ตรวจสอบว่ามีข้อมูลซ้ำหรือไม่
            const duplicateRecord = await repository.findOne({
                where: {
                    tlifm_id: data.tlifm_id,
                    fty_id: data.fty_id,
                    wh_id: data.wh_id,
                    zn_id: data.zn_id,
                    loc_id: data.loc_id,
                    sup_id: data.sup_id
                }
            });

                // ถ้าพบว่าเป็นข้อมูลของ record อื่น → ไม่ให้ create
            if (duplicateRecord) {
                return response.setIncomplete(lang.msgAlreadyExists('item.tooling_ifm'));
            }

            // assign ข้อมูลเข้าไป
            Object.assign(Data, {
                ...data,
                inbtl_is_active: data.inbtl_is_active ?? true, // ถ้า is_active เป็น null หรือ undefined จะใช้ true
                create_date: new Date(),
                tlifm_id: existingTlIfm.tlifm_id,
                fty_id: existingFtyId.fty_id,
                wh_id: existingWhId.wh_id,
                zn_id: existingZnId.zn_id,
                loc_id: existingLocId.loc_id,
                sup_id: existingSup.sup_id,

            });

            // สร้าง instance ของ entity (m_inb_tooling) ที่พร้อมสำหรับการบันทึก
            const inbtl = repository.create(Data);

            // บันทึก entity (inbtl) ลงฐานข้อมูล
            const savedData = await repository.save(inbtl);

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
            // ดึงข้อมูล user ที่สร้างใหม่
            return response.setComplete(lang.msgSuccessAction('created', 'item.inbtl'), savedData);

        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during user creation:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async update(
        inbtl_id: number,
        data: Partial<InbToolingModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<InbToolingModel>();
        const operation = 'InbToolingService.update';
    
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

            const repository = manager ? useManager.getRepository(m_inb_tooling) : this.inbToolingRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory) : this.factoryRepository;
            const warehouseRepository = manager ? useManager.getRepository(m_warehouse) : this.warehouseRepository;
            const zoneRepository = manager ? useManager.getRepository(m_zone) : this.zoneRepository;
            const locationRepository = manager ? useManager.getRepository(m_location) : this.locationRepository;
            const tlifmRepository = manager ? useManager.getRepository(m_tooling_ifm) : this.tlifmRepository;
            const supplierRepository = manager ? useManager.getRepository(m_supplier) : this.supplierRepository;

            // ตรวจสอบว่ามี inbtl_id ปัจจุบันอยู่ในระบบหรือไม่
            const existinginbtl = await repository.findOne({ where: { inbtl_id: inbtl_id } });
            if (!existinginbtl) {
                return response.setIncomplete(lang.msgNotFound('inbtl.inbtl_id'));
            }

            // ตรวจสอบว่า tlifm_id มีอยู่ใน m_tooling_ifm หรือไม่
            const existingTlIfm = await tlifmRepository.findOne({ where: { tlifm_id: data.tlifm_id } });
            if (!existingTlIfm) {
                return response.setIncomplete(lang.msgNotFound('tooling_ifm.tlifm_id'));
            }

            // ตรวจสอบว่า fty_id มีอยู่ใน m_factory หรือไม่
            const existingFtyId = await factoryRepository.findOne({ where: { fty_id: data.fty_id } });
            if (!existingFtyId) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }

            // ตรวจสอบว่า wh_id มีอยู่ใน m_warehouse หรือไม่
            const existingWhId = await warehouseRepository.findOne({ where: { wh_id: data.wh_id } });
            if (!existingWhId) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_id'));
            }

            // ตรวจสอบว่า zn_id มีอยู่ใน m_zone หรือไม่
            const existingZnId = await zoneRepository.findOne({ where: { zn_id: data.zn_id } });
            if (!existingZnId) {
                return response.setIncomplete(lang.msgNotFound('zone.zn_id'));
            }

            // ตรวจสอบว่า loc_id มีอยู่ใน m_location หรือไม่
            const existingLocId = await locationRepository.findOne({ where: { loc_id: data.loc_id } });
            if (!existingLocId) {
                return response.setIncomplete(lang.msgNotFound('location.loc_id'));
            }

            // ตรวจสอบว่า sup_id มีอยู่ใน m_supplier หรือไม่
            const existingSup = await supplierRepository.findOne({ where: { sup_id: data.sup_id } });
            if (!existingSup) {
                return response.setIncomplete(lang.msgNotFound('supplier.sup_id'));
            }
            
            // Validate required fields
            const validationResponse = this.validateRequiredFields(data, response);
            if (validationResponse) {
                return validationResponse;
            }
        
            // ตรวจสอบว่ามีข้อมูลซ้ำหรือไม่
            const duplicateRecord = await repository.findOne({
                where: {
                    tlifm_id: data.tlifm_id,
                    fty_id: data.fty_id,
                    wh_id: data.wh_id,
                    zn_id: data.zn_id,
                    loc_id: data.loc_id,
                    sup_id: data.sup_id
                }
            });

            // ถ้าพบว่าเป็นข้อมูลของ record อื่น → ไม่ให้ update
            if (duplicateRecord && duplicateRecord.inbtl_id !== inbtl_id) {
                return response.setIncomplete(lang.msgAlreadyExists('item.tooling_ifm'));
            }  

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existinginbtl, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
                tlifm_id: existingTlIfm.tlifm_id,
                fty_id: existingFtyId.fty_id,
                wh_id: existingWhId.wh_id,
                zn_id: existingZnId.zn_id,
                loc_id: existingLocId.loc_id,
                sup_id: existingSup.sup_id,
            });
    
            await repository.save(existinginbtl); // บันทึกข้อมูล
    
            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(inbtl_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }
    
            response.setComplete(lang.msgSuccessAction('updated', 'item.inbtl'), dataResponse.data);
    
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response;
    
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during update operation:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async delete(inbtl_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'InbToolingService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_inb_tooling) : this.inbToolingRepository;

             // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, inbtl_id, reqUsername, 'inbtl_is_active', 'inbtl_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
    
            // Commit Transaction หลังจากลบข้อมูลสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return deleteResponse; // ส่ง response ตามผลลัพธ์จาก deleteEntity
                
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during zone deletion:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'InbToolingService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(m_inb_tooling) : this.inbToolingRepository;
    
            // Query inbtl ข้อมูลทั้งหมด
            const rawData = await repository.createQueryBuilder('inbtl')
                .leftJoin('m_tooling_ifm', 'tlifm', 'tlifm.tlifm_id = inbtl.tlifm_id')
                .leftJoin('m_tooling', 'tl', 'tl.tl_id = tlifm.tl_id')
                .select([
                    'tlifm.tlifm_id AS tlifm_id',
                    'tlifm.tlifm_code AS tlifm_code',
                    'tl.tl_type AS tl_type',
                    'tlifm.tlifm_name AS tlifm_name',
                    'SUM(inbtl.inbtl_quantity) AS inbtl_quantity',  // นับจำนวน inbtl_quantity ที่มีอยู่ในกลุ่ม
                    'ANY_VALUE(inbtl.inbtl_is_active) AS inbtl_is_active' // ✅ ป้องกัน GROUP BY error
                ])
                .where('inbtl.inbtl_is_active = :isActive', { isActive: true }) // แก้ alias ผิด
                .groupBy('tlifm.tlifm_id, tlifm.tlifm_code, tl.tl_type, tlifm.tlifm_name') // ✅ เพิ่ม groupBy ครอบคลุมทุกคอลัมน์
                .orderBy('tlifm.tlifm_code', 'ASC') // ✅ เรียงลำดับตาม tlifm_code จากน้อยไปมาก (A → Z, 0 → 9)
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData.length) {
                return response.setIncomplete(lang.msgNotFound('item.inbtl'));
            }
    
            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.inbtl'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }    

    async getAllDetails(tlifm_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'InbToolingService.getAllDetails';

        try {
            const repository = manager ? manager.getRepository(m_inb_tooling) : this.inbToolingRepository;
    
            // Query ข้อมูลทั้งหมดในรูปแบบ raw data
            const query = repository.createQueryBuilder('inbtl')
                .leftJoin('m_tooling_ifm', 'tlifm', 'tlifm.tlifm_id = inbtl.tlifm_id')    
                .leftJoin('m_factory', 'fty', 'fty.fty_id = inbtl.fty_id')
                .leftJoin('m_warehouse', 'wh', 'wh.wh_id = inbtl.wh_id')
                .leftJoin('m_zone', 'zn', 'zn.zn_id = inbtl.zn_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = inbtl.loc_id')
                .select([
                    "DATE_FORMAT(inbtl.create_date, '%d %b %y') AS formatted_date", // วันที่
                    "DATE_FORMAT(inbtl.create_date, '%H:%i:%s') AS create_time",    // เวลา
                    'tlifm.tlifm_id AS tlifm_id',
                    'tlifm.tlifm_code AS tlifm_code',
                    'tlifm.tlifm_name AS tlifm_name',
                    'inbtl.inbtl_id AS inbtl_id',
                    'inbtl.inbtl_code AS inbtl_code',
                    'fty.fty_name AS fty_name',
                    'wh.wh_name AS wh_name',
                    'zn.zn_name AS zn_name',
                    'loc.loc_name AS loc_name',
                    'inbtl.inbtl_quantity AS inbtl_quantity',
                    'inbtl.inbtl_remark AS inbtl_remark',
                    "DATE_FORMAT(NOW(), '%d %b %y') AS today_date"
                ])
                .where('inbtl.inbtl_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .andWhere('tlifm.tlifm_id = :tlifm_id', { tlifm_id }); // ใช้ค่า param ที่แปลงเป็นตัวเลขแล้ว

                const rawData = await query.getRawMany();
        
                // หากไม่พบข้อมูล
                if (!rawData || rawData.length === 0) {
                    return response.setIncomplete(lang.msgNotFound('item.inbtl'));
                }
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('item.inbtl'), rawData);
    
        } catch (error: any) {
            console.error('Error in getAllDetails:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(inbtl_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'InbToolingService.getById';

        try {
            const repository = manager ? manager.getRepository(m_inb_tooling) : this.inbToolingRepository;

            // Query inbtl ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('inbtl')
                .leftJoin('m_factory', 'fty', 'fty.fty_id = inbtl.fty_id')
                .leftJoin('m_warehouse', 'wh', 'wh.wh_id = inbtl.wh_id')
                .leftJoin('m_zone', 'zn', 'zn.zn_id = inbtl.zn_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = inbtl.loc_id')
                .leftJoin('m_tooling_ifm', 'tlifm', 'tlifm.tlifm_id = inbtl.tlifm_id')  
                .leftJoin('m_tooling', 'tl', 'tl.tl_id = tlifm.tl_id') 
                .leftJoin('m_criteria', 'crt', 'crt.crt_id = tlifm.crt_id')
                .select([
                    'inbtl.*',
                    'tlifm.tlifm_name AS tlifm_name',
                    'fty.fty_name AS fty_name',
                    'wh.wh_name AS wh_name',
                    'zn.zn_name AS zn_name',
                    'loc.loc_name AS loc_name',
                    'tl.tl_type AS tl_type',
                    'crt.crt_id AS crt_id',
                    'crt.crt_txn_low AS crt_txn_low',
                    'crt.crt_txn_medium AS crt_txn_medium',
                    'crt.crt_txn_high AS crt_txn_high',
                    'crt.crt_rem_low AS crt_rem_low',
                    'crt.crt_rem_medium AS crt_rem_medium',
                    'crt.crt_rem_high AS crt_rem_high',
                ])
                .where('inbtl.inbtl_id = :inbtl_id', { inbtl_id })
                .andWhere('inbtl.inbtl_is_active = :isActive', { isActive: true }) 
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('inbtl.inbtl_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('inbtl.inbtl_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with inbtl_id: ${inbtl_id}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'InbToolingService.getDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_inb_tooling) : this.inbToolingRepository;
            // ดึงข้อมูลทั้ง inbtl_code
            const rawData = await repository.createQueryBuilder("inbtl")
                .leftJoin("m_tooling_ifm", "tlifm", "tlifm.tlifm_id = inbtl.tlifm_id")
                .select([
                    "inbtl.inbtl_id AS inbtl_id",
                    "inbtl.inbtl_code AS inbtl_code",
                    "tlifm.tlifm_name AS tlifm_name"
                ])
                .where("inbtl.inbtl_is_active = :isActive", { isActive: true })
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.inbtl'));
            }
    
            console.log('rawData:', rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ LocDropdownModel
            const data = rawData.map((tl) => new InbtlDropdownModel(
                tl.inbtl_id,       // ใช้ key ให้ตรงกับ select()
                tl.inbtl_code,     // ใช้ key ให้ตรงกับ select()
                tl.tlifm_name ?? '' // ป้องกัน null ใน tlifm_name
            ));
    
            return response.setComplete(lang.msgFound('item.inbtl'), data);
    
        } catch (error: any) {
            console.error('Error during getDropdown:', error.message);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }  

    async getInventoryAll(
        manager?: EntityManager,
        ftyName?: string,
        whName?: string
    ): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'InbToolingService.getInventoryAll';
    
        try {
            const repository = manager ? manager.getRepository(m_inb_tooling) : this.inbToolingRepository;
    
            let query = repository.createQueryBuilder('inbtl')
                .leftJoin("m_tooling_ifm", "tlifm", "tlifm.tlifm_id = inbtl.tlifm_id")
                .leftJoin('m_factory', 'fty', 'fty.fty_id = inbtl.fty_id')
                .leftJoin('m_warehouse', 'wh', 'wh.wh_id = inbtl.wh_id')
                .select([
                    'inbtl.inbtl_id AS inbtl_id',
                    'inbtl.inbtl_code AS inbtl_code',
                    'inbtl.inbtl_quantity AS inbtl_quantity',
                    'tlifm.tlifm_name AS tlifm_name',
                    'fty.fty_name AS fty_name',
                    'wh.wh_name AS wh_name',
                ])
                .where('inbtl.inbtl_is_active = :isActive', { isActive: true })
    
            // Apply filtering if ftyName is provided
            if (ftyName && ftyName.trim() !== '') {
                query = query.andWhere('fty.fty_name LIKE :ftyName', { ftyName: `%${ftyName}%` });
            }
    
            // Apply filtering if whName is provided
            if (whName && whName.trim() !== '') {
                query = query.andWhere('wh.wh_name LIKE :whName', { whName: `%${whName}%` });
            }
    
            const rawData = await query.getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.inbtl'));
            }
    
            return response.setComplete(lang.msgFound('item.inbtl'), rawData);
        } catch (error: any) {
            console.error('Error during getInventoryAll:', error.message);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
}