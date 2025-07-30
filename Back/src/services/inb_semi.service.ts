import { Repository, EntityManager, Not, In } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils
import CodeGenerator from '../utils/CodeGenerator';

import { m_inb_semi } from '../entities/m_inb_semi.entity';
import { InbSemiModel } from '../models/inb_semi.model';
import { m_factory } from '../entities/m_factory.entity';
import { m_warehouse } from '../entities/m_warehouse.entity';
import { m_zone } from '../entities/m_zone.entity';
import { m_location } from '../entities/m_location.entity';
import { m_semi_ifm } from '../entities/m_semi_ifm.entity';
import { deleteEntity } from '../utils/DatabaseUtils';
import { InbsemiDropdownModel } from '../models/inb_semi_dropdown.model';
import { m_supplier } from '../entities/m_supplier.entity';
import { m_notifications } from '../entities/m_notifications.entity';
import { RefType } from '../common/global.enum';
import { s_user_notification } from '../entities/s_user_notification.entity';

export class InbSemiService {
    private inbsemiRepository: Repository<m_inb_semi>;
    private factoryRepository: Repository<m_factory>;
    private warehouseRepository: Repository<m_warehouse>;
    private zoneRepository: Repository<m_zone>;
    private locationRepository: Repository<m_location>;
    private semiifmRepository: Repository<m_semi_ifm>;
    private supplierRepository: Repository<m_supplier>;
    private notificationRepository: Repository<m_notifications>;
    private usernotifRepo: Repository<s_user_notification>;

    constructor() {
        this.inbsemiRepository = AppDataSource.getRepository(m_inb_semi);
        this.factoryRepository = AppDataSource.getRepository(m_factory);
        this.warehouseRepository = AppDataSource.getRepository(m_warehouse);
        this.zoneRepository = AppDataSource.getRepository(m_zone);
        this.locationRepository = AppDataSource.getRepository(m_location);
        this.semiifmRepository = AppDataSource.getRepository(m_semi_ifm);
        this.supplierRepository = AppDataSource.getRepository(m_supplier);
        this.notificationRepository = AppDataSource.getRepository(m_notifications);
        this.usernotifRepo = AppDataSource.getRepository(s_user_notification);
    }

    private async generateCode(): Promise<string> {
        const codeGenerator = new CodeGenerator(AppDataSource);
        const newCode = await codeGenerator.generateCode('m_inb_semi', 'inbsemi_code', 'SM', '', '[PREFIX][000x]');
        return newCode;
    }

    //validate required field
    private validateRequiredFields(data: Partial<InbSemiModel>, response: ApiResponse<any>): ApiResponse<any> | null {
        const requiredFields = [
            { field: data.semiifm_id, message: 'semi_ifm.semiifm_id' },
            { field: data.fty_id, message: 'item.factory' },
            { field: data.wh_id, message: 'item.warehouse' },
            { field: data.zn_id, message: 'item.zone' },
            { field: data.loc_id, message: 'item.location' },
            { field: data.sup_id, message: 'item.supplier' },
            { field: data.inbsemi_grade, message: 'inbsemi.inbsemi_grade' },
            { field: data.inbsemi_lot, message: 'inbsemi.inbsemi_lot' },
            { field: data.inbsemi_quantity, message: 'inbsemi.inbsemi_quantity' },
            { field: data.inbsemi_color, message: 'inbsemi.inbsemi_color' },
        ];
    
        for (const { field, message } of requiredFields) {
            if (validate.isNullOrEmpty(field)) {
                return response.setIncomplete(lang.msgRequired(message));
            }
        }
    
        return null;
    }

    async create(data: Partial<InbSemiModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<InbSemiModel>();
        let Data = new m_inb_semi();
        const operation = 'InbSemiService.create';

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
            
            const repository = manager ? useManager.getRepository(m_inb_semi) : this.inbsemiRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory) : this.factoryRepository;
            const warehouseRepository = manager ? useManager.getRepository(m_warehouse) : this.warehouseRepository;
            const zoneRepository = manager ? useManager.getRepository(m_zone) : this.zoneRepository;
            const locationRepository = manager ? useManager.getRepository(m_location) : this.locationRepository;
            const semiifmRepository = manager ? useManager.getRepository(m_semi_ifm) : this.semiifmRepository;
            const supplierRepository = manager ? useManager.getRepository(m_supplier) : this.supplierRepository;

            // ตรวจสอบว่า semiifm_id มีอยู่ใน m_semi_ifm หรือไม่
            const existingSemiIfm = await semiifmRepository.findOne({ where: { semiifm_id: data.semiifm_id } });
            if (!existingSemiIfm) {
                return response.setIncomplete(lang.msgNotFound('semi_ifm.semiifm_id'));
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

            if (validate.isNotNullOrEmpty(data.inbsemi_code)) {
                const existingCode = await repository.findOneBy({ inbsemi_code: data.inbsemi_code });
                if (existingCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('inbsemi.inbsemi_code'));
                }
            } else {
                data.inbsemi_code = await this.generateCode();
            }

             // ตรวจสอบว่ามีข้อมูลซ้ำหรือไม่
            const duplicateRecord = await repository.findOne({
                where: {
                    semiifm_id: data.semiifm_id,
                    fty_id: data.fty_id,
                    wh_id: data.wh_id,
                    zn_id: data.zn_id,
                    loc_id: data.loc_id,
                    inbsemi_lot: data.inbsemi_lot,
                    inbsemi_grade: data.inbsemi_grade,
                    sup_id: data.sup_id,
                    inbsemi_color: data.inbsemi_color
                }
            });

                // ถ้าพบว่าเป็นข้อมูลของ record อื่น → ไม่ให้ create
            if (duplicateRecord) {
                return response.setIncomplete(lang.msgAlreadyExists('item.semi_ifm'));
            }

            // assign ข้อมูลเข้าไป
            Object.assign(Data, {
                ...data,
                inbsemi_is_active: data.inbsemi_is_active ?? true, // ถ้า is_active เป็น null หรือ undefined จะใช้ true
                create_date: new Date(),
                semiifm_id: existingSemiIfm.semiifm_id,
                fty_id: existingFtyId.fty_id,
                wh_id: existingWhId.wh_id,
                zn_id: existingZnId.zn_id,
                loc_id: existingLocId.loc_id,
                sup_id: existingSup.sup_id,
            });

            // สร้าง instance ของ entity (m_inb_semi) ที่พร้อมสำหรับการบันทึก
            const inbsemi = repository.create(Data);

            // บันทึก entity (inbsemi) ลงฐานข้อมูล
            const savedData = await repository.save(inbsemi);

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
            // ดึงข้อมูล user ที่สร้างใหม่
            return response.setComplete(lang.msgSuccessAction('created', 'item.inbsemi'), savedData);

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
        inbsemi_id: number,
        data: Partial<InbSemiModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<InbSemiModel>();
        const operation = 'InbSemiService.update';
    
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

            const repository = manager ? useManager.getRepository(m_inb_semi) : this.inbsemiRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory) : this.factoryRepository;
            const warehouseRepository = manager ? useManager.getRepository(m_warehouse) : this.warehouseRepository;
            const zoneRepository = manager ? useManager.getRepository(m_zone) : this.zoneRepository;
            const locationRepository = manager ? useManager.getRepository(m_location) : this.locationRepository;
            const semiifmRepository = manager ? useManager.getRepository(m_semi_ifm) : this.semiifmRepository;
            const supplierRepository = manager ? useManager.getRepository(m_supplier) : this.supplierRepository;

            // ตรวจสอบว่ามี inbsemi_id ปัจจุบันอยู่ในระบบหรือไม่
            const existinginbsemi = await repository.findOne({ where: { inbsemi_id: Number(inbsemi_id) } });
            if (!existinginbsemi) {
                return response.setIncomplete(lang.msgNotFound('inbsemi.inbsemi_id'));
            }

            // ตรวจสอบว่า semiifm_id มีอยู่ใน m_semi_ifm หรือไม่
            const existingSemiIfm = await semiifmRepository.findOne({ where: { semiifm_id: data.semiifm_id } });
            if (!existingSemiIfm) {
                return response.setIncomplete(lang.msgNotFound('semi_ifm.semiifm_id'));
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
                    semiifm_id: data.semiifm_id,
                    fty_id: data.fty_id,
                    wh_id: data.wh_id,
                    zn_id: data.zn_id,
                    loc_id: data.loc_id,
                    inbsemi_lot: data.inbsemi_lot,
                    inbsemi_grade: data.inbsemi_grade,
                    sup_id: data.sup_id
                }
            });
            
            // ถ้าพบว่าเป็นข้อมูลของ record อื่น → ไม่ให้ update
            if (duplicateRecord && duplicateRecord.inbsemi_id !== inbsemi_id) {
                return response.setIncomplete(lang.msgAlreadyExists('item.semi_ifm'));
            }    

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existinginbsemi, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
                semiifm_id: existingSemiIfm.semiifm_id,
                fty_id: existingFtyId.fty_id,
                wh_id: existingWhId.wh_id,
                zn_id: existingZnId.zn_id,
                loc_id: existingLocId.loc_id,
                sup_id: existingSup.sup_id,
            });
    
            await repository.save(existinginbsemi); // บันทึกข้อมูล
    
            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(inbsemi_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }
    
            response.setComplete(lang.msgSuccessAction('updated', 'item.inbsemi'), dataResponse.data);
    
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

    async delete(inbsemi_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'InbSemiService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_inb_semi) : this.inbsemiRepository;
            const notificationRepository = manager ? useManager.getRepository(m_notifications): this.notificationRepository;
    
            // ลบแจ้งเตือน `s_user_notification` ที่เกี่ยวข้อง
            const notiToDelete = await notificationRepository.find({
                where: { reference_type: RefType.INBSEMI, reference_id: inbsemi_id },
            });
            
            const notifIds = notiToDelete.map(n => n.notif_id);
            
            if (notifIds.length > 0) {
                const userNotifRepo = manager ? useManager.getRepository(s_user_notification): this.usernotifRepo;
            
                await userNotifRepo.delete({ notif_id: In(notifIds) });
            }

            // ลบแจ้งเตือน `m_notifications` ที่เกี่ยวข้อง
            await notificationRepository.delete({ reference_type: RefType.INBSEMI, reference_id: inbsemi_id });

            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, inbsemi_id, reqUsername, 'inbsemi_is_active', 'inbsemi_id');
            
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
        const operation = 'InbSemiService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_inb_semi) : this.inbsemiRepository;
    
            // Query inbsemi ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('inbsemi')
                .leftJoin('m_semi_ifm', 'semiifm', 'semiifm.semiifm_id = inbsemi.semiifm_id')
                .leftJoin('m_semi', 'semi', 'semi.semi_id = semiifm.semi_id')
                .select([
                    'semiifm.semiifm_id AS semiifm_id',
                    'semiifm.semiifm_code AS semiifm_code',
                    'semi.semi_type AS semi_type',
                    'semiifm.semiifm_name AS semiifm_name',
                    'COALESCE(SUM(inbsemi.inbsemi_quantity), 0) AS inbsemi_quantity',
                ])
                .where('inbsemi.inbsemi_is_active = :isActive', { isActive: true })
                .groupBy('semiifm.semiifm_id')
                .orderBy('semiifm.semiifm_code', 'ASC') // ✅ เรียงลำดับตาม semiifm_code จากน้อยไปมาก (A → Z, 0 → 9)
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.inbsemi'));
            }            

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.inbsemi'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    
    async getAllDetails(semiifm_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'InbSemiService.getAllDetails';

        try {
            const repository = manager ? manager.getRepository(m_inb_semi) : this.inbsemiRepository;
    
            // Query ข้อมูลทั้งหมดในรูปแบบ raw data
            const query = repository.createQueryBuilder('inbsemi')
                .leftJoin('m_semi_ifm', 'semiifm', 'semiifm.semiifm_id = inbsemi.semiifm_id')    
                .leftJoin('m_factory', 'fty', 'fty.fty_id = inbsemi.fty_id')
                .leftJoin('m_warehouse', 'wh', 'wh.wh_id = inbsemi.wh_id')
                .leftJoin('m_zone', 'zn', 'zn.zn_id = inbsemi.zn_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = inbsemi.loc_id')
                .leftJoin('m_unit','unit', 'unit.unit_id = semiifm.semiifm_product_unitId')
                .select([
                    "DATE_FORMAT(inbsemi.create_date, '%d %b %y') AS formatted_date", // วันที่
                    "DATE_FORMAT(inbsemi.create_date, '%H:%i:%s') AS create_time",    // เวลา
                    'semiifm.semiifm_id AS semiifm_id',
                    'semiifm.semiifm_code AS semiifm_code',
                    'semiifm.semiifm_name AS semiifm_name',
                    'semiifm.semiifm_width AS semiifm_width',
                    'semiifm.semiifm_length AS semiifm_length',
                    'semiifm.semiifm_thickness AS semiifm_thickness',
                    'inbsemi.inbsemi_color AS inbsemi_color',
                    'inbsemi.inbsemi_grade AS inbsemi_grade',
                    'inbsemi.inbsemi_lot AS inbsemi_lot',
                    'inbsemi.inbsemi_id AS inbsemi_id',
                    'inbsemi.inbsemi_code AS inbsemi_code',
                    'fty.fty_name AS fty_name',
                    'wh.wh_name AS wh_name',
                    'zn.zn_name AS zn_name',
                    'loc.loc_name AS loc_name',
                    'inbsemi.inbsemi_quantity AS inbsemi_quantity',
                    "DATE_FORMAT(NOW(), '%d %b %y') AS today_date",
                    'unit.unit_abbr_th AS unit_abbr_th'
                ])
                .where('inbsemi.inbsemi_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .andWhere('semiifm.semiifm_id = :semiifm_id', { semiifm_id }); // ใช้ค่า param ที่แปลงเป็นตัวเลขแล้ว

                const rawData = await query.getRawMany();
        
                // หากไม่พบข้อมูล
                if (!rawData || rawData.length === 0) {
                    return response.setIncomplete(lang.msgNotFound('item.inbsemi'));
                }                
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('item.inbsemi'), rawData);
    
        } catch (error: any) {
            console.error('Error in getAllDetails:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    

    async getById(inbsemi_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'InbSemiService.getById';

        try {
            const repository = manager ? manager.getRepository(m_inb_semi) : this.inbsemiRepository;

            // Query inbsemi ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('inbsemi')
                .leftJoin('m_factory', 'fty', 'fty.fty_id = inbsemi.fty_id')
                .leftJoin('m_warehouse', 'wh', 'wh.wh_id = inbsemi.wh_id')
                .leftJoin('m_zone', 'zn', 'zn.zn_id = inbsemi.zn_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = inbsemi.loc_id')
                .leftJoin('m_semi_ifm', 'semiifm', 'semiifm.semiifm_id = inbsemi.semiifm_id')
                .leftJoin('m_semi', 'semi', 'semi.semi_id = semiifm.semi_id')
                .leftJoin('m_unit' , 'unit_width', 'unit_width.unit_id = semiifm.semiifm_width_unitId')
                .leftJoin('m_unit' , 'unit_length', 'unit_length.unit_id = semiifm.semiifm_length_unitId')
                .leftJoin('m_unit' , 'unit_thickness', 'unit_thickness.unit_id = semiifm.semiifm_thickness_unitId')
                .leftJoin('m_unit' , 'unit_product', 'unit_product.unit_id = semiifm.semiifm_product_unitId')
                .leftJoin('m_criteria', 'crt', 'crt.crt_id = semiifm.crt_id')
                .select([
                    'inbsemi.*',
                    'fty.fty_name AS fty_name',
                    'wh.wh_name AS wh_name',
                    'zn.zn_name AS zn_name',
                    'loc.loc_name AS loc_name',
                    'semi.semi_type AS semi_type',
                    'semiifm.semiifm_name AS semiifm_name',
                    'semiifm.semiifm_width AS semiifm_width',
                    'unit_width.unit_abbr_th AS semiifm_width_unit_name',
                    'semiifm.semiifm_length AS semiifm_length',
                    'unit_length.unit_abbr_th AS semiifm_length_unit_name',
                    'semiifm.semiifm_thickness AS semiifm_thickness',
                    'unit_thickness.unit_abbr_th AS semiifm_thickness_unit_name',
                    'semiifm.semiifm_product_unitId AS semiifm_product_unitId',
                    'unit_product.unit_abbr_th AS semiifm_product_name',
                    'crt.crt_id AS crt_id',
                    'crt.crt_exp_low AS crt_exp_low',
                    'crt.crt_exp_medium AS crt_exp_medium',
                    'crt.crt_exp_high AS crt_exp_high',
                    'crt.crt_rem_low AS crt_rem_low',
                    'crt.crt_rem_medium AS crt_rem_medium',
                    'crt.crt_rem_high AS crt_rem_high',
                ])
                .where('inbsemi.inbsemi_id = :inbsemi_id', { inbsemi_id })
                .andWhere('inbsemi.inbsemi_is_active = :isActive', { isActive: true }) 
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('inbsemi.inbsemi_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('inbsemi.inbsemi_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with inbsemi_id: ${inbsemi_id}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'InbSemiService.getDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_inb_semi) : this.inbsemiRepository;
    
            // ดึงข้อมูล inbsemi_id, inbsemi_code และ semiifm_name
            const rawData = await repository.createQueryBuilder("inbsemi")
                .leftJoin("m_semi_ifm", "semiifm", "semiifm.semiifm_id = inbsemi.semiifm_id")
                .select([
                    "inbsemi.inbsemi_id AS inbsemi_id",      // ต้องมี inbsemi_id ด้วย
                    "inbsemi.inbsemi_code AS inbsemi_code",
                    "semiifm.semiifm_name AS semiifm_name"
                ])
                .where("inbsemi.inbsemi_is_active = :isActive", { isActive: true })
                .distinct(true) // DISTINCT ใช้ที่นี่
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.inbsemi'));
            }
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ InbsemiDropdownModel
            const data = rawData.map((semi) => new InbsemiDropdownModel(
                semi.inbsemi_id,       // ใช้ key ให้ตรงกับ select()
                semi.inbsemi_code,     // ใช้ key ให้ตรงกับ select()
                semi.semiifm_name ?? '' // ป้องกัน null ใน semiifm_name
            ));
    
            return response.setComplete(lang.msgFound('item.inbsemi'), data);
    
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
        const operation = 'InbSemiService.getInventoryAll';
    
        try {
            const repository = manager ? manager.getRepository(m_inb_semi) : this.inbsemiRepository;
    
            let query = repository.createQueryBuilder('inbsemi')
                .leftJoin("m_semi_ifm", "semiifm", "semiifm.semiifm_id = inbsemi.semiifm_id")
                .leftJoin('m_factory', 'fty', 'fty.fty_id = inbsemi.fty_id')
                .leftJoin('m_warehouse', 'wh', 'wh.wh_id = inbsemi.wh_id')
                .select([
                    'inbsemi.inbsemi_id AS inbsemi_id',
                    'inbsemi.inbsemi_code AS inbsemi_code',
                    'semiifm.semiifm_name AS semiifm_name',
                    'inbsemi.inbsemi_quantity AS inbsemi_quantity',
                    'inbsemi.inbsemi_lot AS inbsemi_lot',
                    'fty.fty_name AS fty_name',
                    'wh.wh_name AS wh_name',
                ]) 
                .where("inbsemi.inbsemi_is_active = :isActive", { isActive: true })
    
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
                return response.setIncomplete(lang.msgNotFound('item.inbsemi'));
            }
    
            return response.setComplete(lang.msgFound('item.inbsemi'), rawData);
        } catch (error: any) {
            console.error('Error during getInventoryAll:', error.message);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
}