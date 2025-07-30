import { Repository, EntityManager, Not, In } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils
import CodeGenerator from '../utils/CodeGenerator';

import { m_inb_finished_goods } from '../entities/m_inb_finished_goods.entity';
import { InbFinishedGoodsModel } from '../models/inb_finished_goods.model';
import { m_factory } from '../entities/m_factory.entity';
import { m_warehouse } from '../entities/m_warehouse.entity';
import { m_zone } from '../entities/m_zone.entity';
import { m_location } from '../entities/m_location.entity';
import { m_finished_goods_ifm } from '../entities/m_finished_goods_ifm.entity';
import { InbfgDropdownModel } from '../models/inb_finished_goods_dropdown.model';
import { deleteEntity } from '../utils/DatabaseUtils';
import { m_supplier } from '../entities/m_supplier.entity';
import { m_notifications } from '../entities/m_notifications.entity';
import { RefType } from '../common/global.enum';
import { s_user_notification } from '../entities/s_user_notification.entity';

export class InbFinishedGoodsService {
    private inbFinishedgoodsRepository: Repository<m_inb_finished_goods>;
    private factoryRepository: Repository<m_factory>;
    private warehouseRepository: Repository<m_warehouse>;
    private zoneRepository: Repository<m_zone>;
    private locationRepository: Repository<m_location>;
    private fgifmRepository: Repository<m_finished_goods_ifm>;
    private supplierRepository: Repository<m_supplier>;
    private notificationRepository: Repository<m_notifications>;
    private usernotifRepo: Repository<s_user_notification>;

    constructor() {
        this.inbFinishedgoodsRepository = AppDataSource.getRepository(m_inb_finished_goods);
        this.factoryRepository = AppDataSource.getRepository(m_factory);
        this.warehouseRepository = AppDataSource.getRepository(m_warehouse);
        this.zoneRepository = AppDataSource.getRepository(m_zone);
        this.locationRepository = AppDataSource.getRepository(m_location);
        this.fgifmRepository = AppDataSource.getRepository(m_finished_goods_ifm);
        this.supplierRepository = AppDataSource.getRepository(m_supplier);
        this.notificationRepository = AppDataSource.getRepository(m_notifications);
        this.usernotifRepo = AppDataSource.getRepository(s_user_notification);
    }

    private async generateCode(): Promise<string> {
        const codeGenerator = new CodeGenerator(AppDataSource);
        const newCode = await codeGenerator.generateCode('m_inb_finished_goods', 'inbfg_code', 'FG', '', '[PREFIX][000x]');
        return newCode;
    }

    //validate required field
    private validateRequiredFields(data: Partial<InbFinishedGoodsModel>, response: ApiResponse<any>): ApiResponse<any> | null {
        const requiredFields = [
            { field: data.fgifm_id, message: 'finished_goods_ifm.fgifm_id' },
            { field: data.fty_id, message: 'item.factory' },
            { field: data.wh_id, message: 'item.warehouse' },
            { field: data.zn_id, message: 'item.zone' },
            { field: data.loc_id, message: 'item.location' },
            { field: data.sup_id, message: 'item.supplier' },
            { field: data.inbfg_grade, message: 'inbfg.inbfg_grade' },
            { field: data.inbfg_lot, message: 'inbfg.inbfg_lot' },
            { field: data.inbfg_quantity, message: 'inbfg.inbfg_quantity' },
            { field: data.inbfg_color, message: 'inbfg.inbfg_color' },
        ];
    
        for (const { field, message } of requiredFields) {
            if (validate.isNullOrEmpty(field)) {
                return response.setIncomplete(lang.msgRequired(message));
            }
        }
    
        return null;
    }

    async create(data: Partial<InbFinishedGoodsModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<InbFinishedGoodsModel>();
        let Data = new m_inb_finished_goods();
        const operation = 'InbFinishedGoodsService.create';

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
            
            const repository = manager ? useManager.getRepository(m_inb_finished_goods) : this.inbFinishedgoodsRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory) : this.factoryRepository;
            const warehouseRepository = manager ? useManager.getRepository(m_warehouse) : this.warehouseRepository;
            const zoneRepository = manager ? useManager.getRepository(m_zone) : this.zoneRepository;
            const locationRepository = manager ? useManager.getRepository(m_location) : this.locationRepository;
            const fgifmRepository = manager ? useManager.getRepository(m_finished_goods_ifm) : this.fgifmRepository;
            const supplierRepository = manager ? useManager.getRepository(m_supplier) : this.supplierRepository;

            // ตรวจสอบว่า fgifm_id มีอยู่ใน m_finished_goods_ifm หรือไม่
            const existingFGIFM = await fgifmRepository.findOne({ where: { fgifm_id: data.fgifm_id } });
            if (!existingFGIFM) {
                return response.setIncomplete(lang.msgNotFound('finished_goods_ifm.fgifm_id'));
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

            if (validate.isNotNullOrEmpty(data.inbfg_code)) {
                const existingCode = await repository.findOneBy({ inbfg_code: data.inbfg_code });
                if (existingCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('inbfg.inbfg_code'));
                }
            } else {
                data.inbfg_code = await this.generateCode();
            }

            // ตรวจสอบว่ามีข้อมูลซ้ำหรือไม่
            const duplicateRecord = await repository.findOne({
                where: {
                    fgifm_id: data.fgifm_id,
                    fty_id: data.fty_id,
                    wh_id: data.wh_id,
                    zn_id: data.zn_id,
                    loc_id: data.loc_id,
                    inbfg_lot: data.inbfg_lot,
                    inbfg_grade: data.inbfg_grade,
                    sup_id: data.sup_id,
                    inbfg_color: data.inbfg_color
                }
            });

             // ถ้าพบว่าเป็นข้อมูลของ record อื่น → ไม่ให้ create
            if (duplicateRecord) {
                return response.setIncomplete(lang.msgAlreadyExists('item.finished_goods_ifm'));
            }

            // assign ข้อมูลเข้าไป
            Object.assign(Data, {
                ...data,
                inbfg_is_active: data.inbfg_is_active ?? true, // ถ้า is_active เป็น null หรือ undefined จะใช้ true
                create_date: new Date(),
                fgifm_id: existingFGIFM.fgifm_id,
                fty_id: existingFtyId.fty_id,
                wh_id: existingWhId.wh_id,
                zn_id: existingZnId.zn_id,
                loc_id: existingLocId.loc_id,
                sup_id: existingSup.sup_id,
            });

            // สร้าง instance ของ entity (m_inb_finished_goods) ที่พร้อมสำหรับการบันทึก
            const inbfg = repository.create(Data);

            // บันทึก entity (inbfg) ลงฐานข้อมูล
            const savedData = await repository.save(inbfg);

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
            // ดึงข้อมูล user ที่สร้างใหม่
            return response.setComplete(lang.msgSuccessAction('created', 'item.inbfg'), savedData);

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
        inbfg_id: number,
        data: Partial<InbFinishedGoodsModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<InbFinishedGoodsModel>();
        const operation = 'InbFinishedGoodsService.update';
    
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

            const repository = manager ? useManager.getRepository(m_inb_finished_goods) : this.inbFinishedgoodsRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory) : this.factoryRepository;
            const warehouseRepository = manager ? useManager.getRepository(m_warehouse) : this.warehouseRepository;
            const zoneRepository = manager ? useManager.getRepository(m_zone) : this.zoneRepository;
            const locationRepository = manager ? useManager.getRepository(m_location) : this.locationRepository;
            const fgifmRepository = manager ? useManager.getRepository(m_finished_goods_ifm) : this.fgifmRepository;
            const supplierRepository = manager ? useManager.getRepository(m_supplier) : this.supplierRepository;

            // ตรวจสอบว่ามี inbfg_id ปัจจุบันอยู่ในระบบหรือไม่
            const existinginbfg = await repository.findOne({ where: { inbfg_id: Number(inbfg_id) } });
            if (!existinginbfg) {
                return response.setIncomplete(lang.msgNotFound('inbfg.inbfg_id'));
            }

            // ตรวจสอบว่า fgifm_id มีอยู่ใน m_finished_goods_ifm หรือไม่
            const existingFGIFM = await fgifmRepository.findOne({ where: { fgifm_id: data.fgifm_id } });
            if (!existingFGIFM) {
                return response.setIncomplete(lang.msgNotFound('finished_goods_ifm.fgifm_id'));
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
                    fgifm_id: data.fgifm_id,
                    fty_id: data.fty_id,
                    wh_id: data.wh_id,
                    zn_id: data.zn_id,
                    loc_id: data.loc_id,
                    inbfg_lot: data.inbfg_lot,
                    inbfg_grade: data.inbfg_grade,
                    sup_id: data.sup_id
                }
            });
            
            // ถ้าพบว่าเป็นข้อมูลของ record อื่น → ไม่ให้ update
            if (duplicateRecord && duplicateRecord.inbfg_id !== inbfg_id) {
                return response.setIncomplete(lang.msgAlreadyExists('item.finished_goods_ifm'));
            }            

            // อัปเดตข้อมูลอื่น ๆ
            Object.assign(existinginbfg, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
                fgifm_id: existingFGIFM.fgifm_id,
                fty_id: existingFtyId.fty_id,
                wh_id: existingWhId.wh_id,
                zn_id: existingZnId.zn_id,
                loc_id: existingLocId.loc_id,
                sup_id: existingSup.sup_id,
            });
    
            await repository.save(existinginbfg); // บันทึกข้อมูล
    
            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(inbfg_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }
    
            response.setComplete(lang.msgSuccessAction('updated', 'item.inbfg'), dataResponse.data);
    
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

    async delete(inbfg_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'InbFinishedGoodsService.delete';
    
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
            const repository = manager ? useManager.getRepository(m_inb_finished_goods) : this.inbFinishedgoodsRepository;
            const notificationRepository = manager ? useManager.getRepository(m_notifications): this.notificationRepository;
        
            // ลบแจ้งเตือน `s_user_notification` ที่เกี่ยวข้อง
            const notiToDelete = await notificationRepository.find({
                where: { reference_type: RefType.INBFG, reference_id: inbfg_id },
            });
            
            const notifIds = notiToDelete.map(n => n.notif_id);
            
            if (notifIds.length > 0) {
                const userNotifRepo = manager ? useManager.getRepository(s_user_notification): this.usernotifRepo;
            
                await userNotifRepo.delete({ notif_id: In(notifIds) });
            }

            // ลบแจ้งเตือน `m_notifications` ที่เกี่ยวข้อง
            await notificationRepository.delete({ reference_type: RefType.INBFG, reference_id: inbfg_id });
            
            // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, inbfg_id, reqUsername, 'inbfg_is_active', 'inbfg_id');
            
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
        const operation = 'InbFinishedGoodsService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_inb_finished_goods) : this.inbFinishedgoodsRepository;
    
            // Query inbfg ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('inbfg')
                .leftJoin('m_finished_goods_ifm', 'fgifm', 'fgifm.fgifm_id = inbfg.fgifm_id')
                .leftJoin('m_finished_goods', 'fg', 'fg.fg_id = fgifm.fg_id')
                .select([
                    'fgifm.fgifm_id AS fgifm_id',
                    'fgifm.fgifm_code AS fgifm_code',
                    'fgifm.fgifm_name AS fgifm_name',
                    'fg.fg_type AS fg_type',
                    'COALESCE(SUM(inbfg.inbfg_quantity), 0) AS inbfg_quantity'
                ])
                .where('inbfg.inbfg_is_active = :isActive', { isActive: true })
                .groupBy('fgifm.fgifm_id')
                .orderBy('fgifm.fgifm_code', 'ASC') // ✅ เรียงลำดับตาม fgifm_code จากน้อยไปมาก (A → Z, 0 → 9)
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.inbfg'));
            }            

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.inbfg'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    
    async getAllDetails(fgifm_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'InbFinishedGoodsService.getAllDetails';

        try {
            const repository = manager ? manager.getRepository(m_inb_finished_goods) : this.inbFinishedgoodsRepository;
    
            // Query ข้อมูลทั้งหมดในรูปแบบ raw data
            const query = repository.createQueryBuilder('inbfg')
                .leftJoin('m_finished_goods_ifm', 'fgifm', 'fgifm.fgifm_id = inbfg.fgifm_id')    
                .leftJoin('m_factory', 'fty', 'fty.fty_id = inbfg.fty_id')
                .leftJoin('m_warehouse', 'wh', 'wh.wh_id = inbfg.wh_id')
                .leftJoin('m_zone', 'zn', 'zn.zn_id = inbfg.zn_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = inbfg.loc_id')
                .leftJoin('m_unit','unit', 'unit.unit_id = fgifm.fgifm_product_unitId')
                .select([
                    "DATE_FORMAT(inbfg.create_date, '%d %b %y') AS formatted_date", // วันที่
                    "DATE_FORMAT(inbfg.create_date, '%H:%i:%s') AS create_time",    // เวลา
                    'fgifm.fgifm_id AS fgifm_id',
                    'fgifm.fgifm_code AS fgifm_code',
                    'fgifm.fgifm_name AS fgifm_name',
                    'fgifm.fgifm_width AS fgifm_width',
                    'fgifm.fgifm_length AS fgifm_length',
                    'fgifm.fgifm_thickness AS fgifm_thickness',
                    'inbfg.inbfg_color AS inbfg_color',
                    'inbfg.inbfg_grade AS inbfg_grade',
                    'inbfg.inbfg_lot AS inbfg_lot',
                    'inbfg.inbfg_id AS inbfg_id',
                    'inbfg.inbfg_code AS inbfg_code',
                    'fty.fty_name AS fty_name',
                    'wh.wh_name AS wh_name',
                    'zn.zn_name AS zn_name',
                    'loc.loc_name AS loc_name',
                    'inbfg.inbfg_quantity AS inbfg_quantity',
                    "DATE_FORMAT(NOW(), '%d %b %y') AS today_date",
                    'unit.unit_abbr_th AS unit_abbr_th'
                ])
                .where('inbfg.inbfg_is_active = :isActive', { isActive: true })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .andWhere('fgifm.fgifm_id = :fgifm_id', { fgifm_id }); // ใช้ค่า param ที่แปลงเป็นตัวเลขแล้ว

                const rawData = await query.getRawMany();
        
                // หากไม่พบข้อมูล
                if (!rawData || rawData.length === 0) {
                    return response.setIncomplete(lang.msgNotFound('item.inbfg'));
                }                
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('item.inbfg'), rawData);
    
        } catch (error: any) {
            console.error('Error in getAllDetails:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    

    async getById(inbfg_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'InbFinishedGoodsService.getById';

        try {
            const repository = manager ? manager.getRepository(m_inb_finished_goods) : this.inbFinishedgoodsRepository;

            // Query inbfg ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('inbfg')
                .leftJoin('m_factory', 'fty', 'fty.fty_id = inbfg.fty_id')
                .leftJoin('m_warehouse', 'wh', 'wh.wh_id = inbfg.wh_id')
                .leftJoin('m_zone', 'zn', 'zn.zn_id = inbfg.zn_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = inbfg.loc_id')
                .leftJoin('m_finished_goods_ifm', 'fgifm', 'fgifm.fgifm_id = inbfg.fgifm_id')
                .leftJoin('m_finished_goods', 'fg', 'fg.fg_id = fgifm.fg_id')
                .leftJoin('m_unit' , 'unit_width', 'unit_width.unit_id = fgifm.fgifm_width_unitId')
                .leftJoin('m_unit' , 'unit_length', 'unit_length.unit_id = fgifm.fgifm_length_unitId')
                .leftJoin('m_unit' , 'unit_thickness', 'unit_thickness.unit_id = fgifm.fgifm_thickness_unitId')
                .leftJoin('m_unit' , 'unit_product', 'unit_product.unit_id = fgifm.fgifm_product_unitId')
                .leftJoin('m_criteria', 'crt', 'crt.crt_id = fgifm.crt_id')
                .select([
                    'inbfg.*',
                    'fgifm.fgifm_name AS fgifm_name',
                    'fty.fty_name AS fty_name',
                    'wh.wh_name AS wh_name',
                    'zn.zn_name AS zn_name',
                    'loc.loc_name AS loc_name',
                    'fg.fg_type AS fg_type',
                    'fgifm.fgifm_width AS fgifm_width',
                    'unit_width.unit_abbr_th AS fgifm_width_unit_name',
                    'fgifm.fgifm_length AS fgifm_length',
                    'unit_length.unit_abbr_th AS fgifm_length_unit_name',
                    'fgifm.fgifm_thickness AS fgifm_thickness',
                    'unit_thickness.unit_abbr_th AS fgifm_thickness_unit_name',
                    'fgifm.fgifm_product_unitId AS fgifm_product_unitId',
                    'unit_product.unit_abbr_th AS fgifm_product_name',
                    'crt.crt_id AS crt_id',
                    'crt.crt_exp_low AS crt_exp_low',
                    'crt.crt_exp_medium AS crt_exp_medium',
                    'crt.crt_exp_high AS crt_exp_high',
                    'crt.crt_rem_low AS crt_rem_low',
                    'crt.crt_rem_medium AS crt_rem_medium',
                    'crt.crt_rem_high AS crt_rem_high',
                ])
                .where('inbfg.inbfg_id = :inbfg_id', { inbfg_id })
                .andWhere('inbfg.inbfg_is_active = :isActive', { isActive: true }) 
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('inbfg.inbfg_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('inbfg.inbfg_id'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with inbfg_id: ${inbfg_id}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'InbFinishedGoodsService.getDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_inb_finished_goods) : this.inbFinishedgoodsRepository;
            // ดึงข้อมูลทั้ง inbfg_code
            const rawData = await repository.createQueryBuilder("inbfg")
            .leftJoin("m_finished_goods_ifm", "fgifm", "fgifm.fgifm_id = inbfg.fgifm_id")
            .select([
                "inbfg.inbfg_id AS inbfg_id",      // ต้องมี inbfg_id ด้วย
                "inbfg.inbfg_code AS inbfg_code",
                "fgifm.fgifm_name AS fgifm_name"
            ])
                .where("inbfg.inbfg_code IS NOT NULL") // กรองค่า null ออก
                .andWhere('inbfg.inbfg_is_active = :isActive', { isActive: true })
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.inbfg'));
            }
    
            console.log('rawData:', rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ LocDropdownModel
            const data = rawData.map((fg) => new InbfgDropdownModel(
                fg.inbfg_id,
                fg.inbfg_code,
                fg.fgifm_name
            ));
    
            return response.setComplete(lang.msgFound('item.inbfg'), data);
    
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
        const operation = 'InbFinishedGoodsService.getInventoryAll';
    
        try {
            const repository = manager
                ? manager.getRepository(m_inb_finished_goods)
                : this.inbFinishedgoodsRepository;
    
            let query = repository.createQueryBuilder('inbfg')
                .leftJoin("m_finished_goods_ifm", "fgifm", "fgifm.fgifm_id = inbfg.fgifm_id")
                .leftJoin('m_factory', 'fty', 'fty.fty_id = inbfg.fty_id')
                .leftJoin('m_warehouse', 'wh', 'wh.wh_id = inbfg.wh_id')
                .select([
                    'inbfg.inbfg_id AS inbfg_id',
                    'inbfg.inbfg_code AS inbfg_code',
                    'fgifm.fgifm_name AS fgifm_name',
                    'inbfg.inbfg_quantity AS inbfg_quantity',
                    'inbfg.inbfg_lot AS inbfg_lot',
                    'fty.fty_name AS fty_name',
                    'wh.wh_name AS wh_name',
                ])
                .where('inbfg.inbfg_is_active = :isActive', { isActive: true })
    
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
                return response.setIncomplete(lang.msgNotFound('item.inbfg'));
            }
    
            return response.setComplete(lang.msgFound('item.inbfg'), rawData);
        } catch (error: any) {
            console.error('Error during getInventoryAll:', error.message);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
}