import { Repository, EntityManager, Not, In, IsNull } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions

import { m_bom } from '../entities/m_bom.entity';
import { BomModel } from '../models/bom.model';
import { m_finished_goods_ifm } from '../entities/m_finished_goods_ifm.entity';
import { m_bom_items } from '../entities/m_bom_items.entity';
import { BomGroupById } from '../models/bom_getbyid.model';
import { BOMDropdownModel, SODropdownModel } from '../models/bom_dropdown.model';
import { deleteEntity } from '../utils/DatabaseUtils';

export class BOMService {
    private bomRepository: Repository<m_bom>;
    private bomItemsRepository: Repository<m_bom_items>;
    private fgRepository: Repository<m_finished_goods_ifm>;

    constructor(){
        this.bomRepository = AppDataSource.getRepository(m_bom);
        this.bomItemsRepository = AppDataSource.getRepository(m_bom_items);
        this.fgRepository = AppDataSource.getRepository(m_finished_goods_ifm);
    }

    // ฟังก์ชันสำหรับตรวจสอบข้อมูล
    private async validateRecord(
        record: BomModel,
        bomRepository: Repository<m_bom>,
        bomItemsRepository: Repository<m_bom_items>,
        fgRepository: Repository<m_finished_goods_ifm>,
        errors: string[],
        so_id?: number // ใช้เพื่อระบุกรณี update
    ): Promise<void> {
        // ตรวจสอบว่า so_code มีค่าหรือไม่
        if (!record.so_code) {
            errors.push(lang.msgRequired('bom.so_code'));
        }

        // ตรวจสอบว่า so_cust_name มีค่าหรือไม่
        if (!record.so_cust_name) {
            errors.push(lang.msgRequired('bom.so_cust_name'));
        }

        // ตรวจสอบว่า so_code ซ้ำหรือไม่ (เฉพาะกรณี update และไม่ใช่รายการของตัวเอง)
        const existingSalesOrder = await bomRepository.findOne({ where: { so_code: record.so_code } });
        if (existingSalesOrder && existingSalesOrder.so_id !== so_id) {
            errors.push(lang.msgAlreadyExists(`bom.so_code`));
        }

        // ตรวจสอบว่า item มีหรือไม่
        if (!record.item || record.item.length === 0) {
            errors.push(lang.msgRequired('bom.bom_number'));
            return;
        }

        // รวบรวม bom_number และตรวจสอบว่าซ้ำในฐานข้อมูลหรือไม่
        const bomNumbers = record.item.map((item) => item.bom_number).filter(Boolean);
        const existingBomNumbers = await bomItemsRepository.find({
            where: {
                bom_number: In(bomNumbers),
                ...(so_id ? { so_id: Not(so_id) } : {}), // ข้าม so_id เดียวกันในกรณี update
            },
        });
        const existingBomNumberSet = new Set(existingBomNumbers.map((bom) => bom.bom_number));

        const bomItemKeys = new Map<string, Set<string>>(); // ใช้ Map เพื่อตรวจสอบซ้ำในรายการ
        for (const item of record.item) {
            if (!item.bom_number) {
                errors.push(lang.msgRequired('bom.bom_number'));
            } else if (existingBomNumberSet.has(item.bom_number)) {
               // errors.push(lang.msgAlreadyExists(`bom.bom_number`) + `: ${item.bom_number}`);
                errors.push(lang.msg(`${item.bom_number}`) + ` มีข้อมูลอยู่แล้ว`);
            }

            // ตรวจสอบว่า fgifm_id มีค่าหรือไม่
            if (!item.fgifm_id) {
                errors.push(lang.msgRequired('finished_goods_ifm.fgifm_id'));
            }

            // ตรวจสอบว่า bom_quantity ถูกระบุ และมากกว่า 0 หรือไม่
            if (item.bom_quantity === undefined || item.bom_quantity === null || item.bom_quantity <= 0) {
                errors.push(lang.msgRequired('bom.bom_quantity'));
            }

            // ตรวจสอบว่า fgifm_id ไม่ซ้ำใน bom_number เดียวกัน
            if (item.bom_number && item.fgifm_id !== undefined) {
                const fgifmIdStr = item.fgifm_id.toString();
                const inbfgSet = bomItemKeys.get(item.bom_number) || new Set();

                if (inbfgSet.has(fgifmIdStr)) {
                    errors.push(
                        lang.msg(
                            `bom: ${item.bom_number} มีรหัส FG ซ้ำ`
                        )
                    );
                } else {
                    inbfgSet.add(fgifmIdStr);
                    bomItemKeys.set(item.bom_number, inbfgSet);
                }

                // ตรวจสอบว่า fgifm_id มีอยู่ใน fgRepository หรือไม่
                const existingInbfgCode = await fgRepository.findOne({ where: { fgifm_id: item.fgifm_id } });
                if (!existingInbfgCode) {
                    errors.push(lang.msgNotFound(`finished_goods_ifm.fgifm_id`)+`: ${item.fgifm_id}`);
                }
            }
        }
    }
    
    async create(
        data: BomModel[],
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>(); // สร้าง response object สำหรับจัดการผลลัพธ์
        const operation = 'BOMService.create'; // ชื่อ operation เพื่อบอกว่าอยู่ในฟังก์ชันใด
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner(); // ตรวจสอบว่ามี queryRunner หรือไม่
        const useManager = manager || queryRunner?.manager; // ใช้ manager ที่ส่งเข้ามาหรือสร้าง queryRunner ใหม่
    
        if (!useManager) {
            // หากไม่มี manager หรือ queryRunner ให้ส่งข้อผิดพลาดกลับ
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        if (!manager && queryRunner) {
            // เริ่ม transaction หากไม่มี manager
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const bomRepository = manager ? useManager.getRepository(m_bom) : this.bomRepository; // สร้าง repository สำหรับ m_bom
            const bomItemsRepository = manager ? useManager.getRepository(m_bom_items) : this.bomItemsRepository; // repository สำหรับ m_bom_items
            const fgRepository = manager ? useManager.getRepository(m_finished_goods_ifm) : this.fgRepository; // repository สำหรับ finished goods
    
            const errors: string[] = []; // เก็บข้อความข้อผิดพลาด
            const salesOrdersToSave: m_bom[] = []; // เก็บ Sales Orders ที่จะบันทึก
            const bomItemsToSave: m_bom_items[] = []; // เก็บ BOM Items ที่จะบันทึก
    
            // **Phase 1: Validation**
            for (const record of data) {
                // เรียกฟังก์ชัน validateRecord เพื่อตรวจสอบข้อมูล
                await this.validateRecord(
                    record,
                    bomRepository,
                    bomItemsRepository,
                    fgRepository,
                    errors
                );
    
                if (errors.length === 0) {
                    // หากไม่มีข้อผิดพลาด เตรียมข้อมูลสำหรับการบันทึก
                    const salesOrder = bomRepository.create({
                        so_code: record.so_code,
                        so_cust_name: record.so_cust_name,
                        so_details: record.so_details,
                        so_is_active: true,
                        create_date: new Date(),
                        create_by: reqUsername,
                    });
    
                    salesOrdersToSave.push(salesOrder); // เก็บ Sales Order ไว้ใน array
    
                    record.item.forEach(item => {
                        // เตรียม BOM Items สำหรับการบันทึก
                        bomItemsToSave.push(
                            bomItemsRepository.create({
                                bom_number: item.bom_number,
                                fgifm_id: item.fgifm_id,
                                bom_quantity: item.bom_quantity
                            })
                        );
                    });
                }
            }
    
            // หากมีข้อผิดพลาด ให้หยุดการประมวลผลและส่งข้อผิดพลาดกลับ
            if (errors.length > 0) {
                return response.setIncomplete(errors.join(', '));
            }
    
            // **Phase 2: Save Data**
            for (const salesOrder of salesOrdersToSave) {
                // บันทึก Sales Orders ลงในฐานข้อมูล
                const savedSalesOrder = await bomRepository.save(salesOrder);
                // อัปเดต so_id ใน BOM Items
                bomItemsToSave.forEach(item => (item.so_id = savedSalesOrder.so_id));
            }
    
            // บันทึก BOM Items ทั้งหมด
            await bomItemsRepository.save(bomItemsToSave);
    
            // Commit transaction หากไม่มีข้อผิดพลาด
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่งผลลัพธ์กลับหากสำเร็จ
            return response.setComplete(lang.msgSuccessAction('created', 'item.bom'), data);
        } catch (error: any) {
            // Rollback transaction หากเกิดข้อผิดพลาด
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during BOM creation:', error); // Log ข้อผิดพลาด
            throw new Error(lang.msgErrorFunction(operation, error.message)); // ส่งข้อผิดพลาดกลับ
        } finally {
            // ปิด queryRunner
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    
    async update(so_id: number, data: BomModel, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'BOMService.update';
    
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
            const bomRepository = manager ? useManager.getRepository(m_bom) : this.bomRepository;
            const bomItemsRepository = manager ? useManager.getRepository(m_bom_items) : this.bomItemsRepository;
            const fgRepository = manager ? useManager.getRepository(m_finished_goods_ifm) : this.fgRepository;
    
            const errors: string[] = [];
    
            // ตรวจสอบว่า so_id มีอยู่ในระบบหรือไม่
            const existingBOM = await bomRepository.findOne({ where: { so_id } });
            if (!existingBOM) {
                return response.setIncomplete(lang.msgNotFound(`bom.so_id: ${so_id}`));
            }
    
           // เรียกใช้ validateRecord เพื่อตรวจสอบข้อมูล
            await this.validateRecord(data, bomRepository, bomItemsRepository, fgRepository, errors, so_id);

            // หากมีข้อผิดพลาด ให้หยุดทำงาน
            if (errors.length > 0) {
                return response.setIncomplete(errors.join(', '));
            }
    
            // ลบ BOM Items เดิมทั้งหมดที่เกี่ยวข้องกับ so_id
            await bomItemsRepository.delete({ so_id });
    
            // อัปเดตข้อมูล Sales Order (m_bom)
            existingBOM.so_code = data.so_code;
            existingBOM.so_cust_name = data.so_cust_name;
            existingBOM.so_details = data.so_details;
            existingBOM.update_date = new Date();
            existingBOM.update_by = reqUsername;
            await bomRepository.save(existingBOM);
    
            // บันทึก BOM Items ใหม่
            const bomItems = data.item.map(item => bomItemsRepository.create({
                bom_number: item.bom_number,
                fgifm_id: item.fgifm_id,
                bom_quantity: item.bom_quantity,
                so_id
            }));
            await bomItemsRepository.save(bomItems);
    
            // Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('updated', 'item.bom'), data);
        } catch (error: any) {
            // Rollback Transaction หากเกิดข้อผิดพลาด
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during BOM update:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            // ปิด QueryRunner
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    

    async delete(so_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<void>();
        const operation = 'BOMService.delete';
    
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
            const bomRepository = manager ? useManager.getRepository(m_bom) : this.bomRepository;
            const itemsRepository = manager ? useManager.getRepository(m_bom_items) : this.bomItemsRepository;

            // ตรวจสอบว่า so_id มีอยู่หรือไม่
            const existingBOM = await bomRepository.findOne({ where: { so_id } });
            if (!existingBOM) {
                return response.setIncomplete(lang.msgNotFound(`bom.so_id`));
            }
    
            // ลบรายการ `m_bom_items` ที่เกี่ยวข้องทั้งหมดก่อน
            await itemsRepository.delete({ so_id });
    
            // ใช้ `deleteEntity()` เพื่อลบ `m_bom`
            const deleteResponse = await deleteEntity(bomRepository, so_id, reqUsername, 'so_is_active', 'so_id');
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
    
            // Commit transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.bom'));
        } catch (error: any) {
            // Rollback transaction
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during BOM delete:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            // Release query runner
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    
    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'BOMService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(m_bom) : this.bomRepository;
    
            // 🔹 1. ดึง `so_id`, `so_code`, `so_details`, `create_date` จาก `m_bom`
            const allSoData = await repository
                .createQueryBuilder('bom')
                .select([
                    'bom.so_id AS so_id',
                    'bom.so_code AS so_code',
                    'bom.so_details AS so_details',
                    "DATE_FORMAT(bom.create_date, '%d %b %y') AS formatted_date",
                    "DATE_FORMAT(bom.create_date, '%H:%i:%s') AS create_time"
                ])
                .where('bom.so_is_active = :isActive', { isActive: true })
                .groupBy('bom.so_id')
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();
    
            if (!allSoData || allSoData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.bom'));
            }
    
            // 🔹 2. ดึงข้อมูลย่อยทั้งหมดโดยใช้ Promise.all()
            const allDetailsResults = await Promise.all(
                allSoData.map(async (so) => {
                    const details = await this.getAllDetails(so.so_id, manager);
                    return {
                        so_id: so.so_id,
                        so_code: so.so_code,
                        so_details: so.so_details,
                        formatted_date: so.formatted_date,
                        create_time: so.create_time,
                        details: details.data || []
                    };
                })
            );
    
            // 🔹 3. คำนวณ `outbfgitm_shipmt_status` โดยใช้ `PARTIAL > PENDING > COMPLETED`
            const summarizedData = allDetailsResults.map(({ so_id, so_code, so_details, formatted_date, create_time, details }) => {
                // ✅ ดึงสถานะจากข้อมูลย่อยทั้งหมด
                const statuses = details.map((record: { outbfgitm_shipmt_status: string }) => record.outbfgitm_shipmt_status);
                
                // ✅ ลำดับความสำคัญของสถานะ: PARTIAL → PENDING → COMPLETED
                let finalStatus = 'COMPLETED';
            
                if (statuses.includes('PARTIAL')) {
                    finalStatus = 'PARTIAL'; // ❗ ถ้ามี PARTIAL อย่างน้อย 1 ค่า → เป็น PARTIAL
                } else if (statuses.includes('COMPLETED') && statuses.includes('PENDING')) {
                    finalStatus = 'PARTIAL'; // ❗ ถ้ามีทั้ง COMPLETED และ PENDING → เป็น PARTIAL
                } else if (statuses.includes('PENDING')) {
                    finalStatus = 'PENDING'; // ❗ ถ้ามีแต่ PENDING อย่างเดียว → เป็น PENDING
                }
            
                return { so_id, so_code, so_details, formatted_date, create_time, so_shipmt_status: finalStatus };
            });
            
            
            return response.setComplete(lang.msgFound('item.bom'), summarizedData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    
    async getAllDetails(so_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'BOMService.getAllDetails';
    
        try {
            const repository = manager ? manager.getRepository(m_bom) : this.bomRepository;
    
            // Query ข้อมูลทั้งหมดในรูปแบบ raw data
            const query = repository.createQueryBuilder('bom')
                .leftJoin('m_bom_items', 'bomitm', 'bom.so_id = bomitm.so_id')    
                .leftJoin('m_finished_goods_ifm', 'fgifm', 'bomitm.fgifm_id = fgifm.fgifm_id')
                .leftJoin(
                    subQuery => subQuery
                        .select(['fgifm_id', 'SUM(inbfg_quantity) AS total_inbfg_quantity'])
                        .from('m_inb_finished_goods', 'inbfg')
                        .groupBy('fgifm_id'),
                    'inbfg',
                    'inbfg.fgifm_id = bomitm.fgifm_id'
                ) // ✅ Subquery เพื่อลดค่า Duplicate
                .leftJoin('m_outb_finished_goods_items', 'outbfg', 'bomitm.bom_id = outbfg.bom_id AND outbfg.bom_id IS NOT NULL')  // ✅ ข้ามกรณีที่ bom_id ไม่ตรง
                .leftJoin('m_inb_finished_goods', 'inbfg_check', 'outbfg.inbfg_id = inbfg_check.inbfg_id') 
                .select([
                    "DATE_FORMAT(NOW(), '%d %b %y') AS today_date",
                    'bom.so_id AS so_id',
                    'bom.so_code AS so_code',
                    'bom.so_cust_name AS so_cust_name',
                    'bom.so_details AS so_details',
                    'bomitm.bom_id AS bom_id',
                    'bomitm.bom_number AS bom_number',
                    'fgifm.fgifm_id AS fgifm_id',
                    'fgifm.fgifm_code AS fgifm_code',
                    'fgifm.fgifm_name AS fgifm_name',
                    'COALESCE(inbfg.total_inbfg_quantity, 0) AS inbfg_quantity',  // ✅ แก้ปัญหาการนับค่าซ้ำ
                    'bomitm.bom_quantity AS bom_quantity',
                    'COALESCE(SUM(CASE WHEN inbfg_check.fgifm_id = bomitm.fgifm_id AND outbfg.bom_id IS NOT NULL THEN outbfg.outbfgitm_quantity ELSE 0 END), 0) AS outbfgitm_quantity',
                    'COALESCE(SUM(CASE WHEN inbfg_check.fgifm_id = bomitm.fgifm_id AND outbfg.bom_id IS NOT NULL THEN outbfg.outbfgitm_withdr_count ELSE 0 END), 0) AS outbfgitm_withdr_count',
                    'COALESCE(SUM(CASE WHEN inbfg_check.fgifm_id = bomitm.fgifm_id AND outbfg.bom_id IS NOT NULL THEN outbfg.outbfgitm_shipmt_count ELSE 0 END), 0) AS outbfgitm_shipmt_count',
                     // ✅ คำนวณ outbfgitm_quantity_remain
                    '(COALESCE(SUM(CASE WHEN inbfg_check.fgifm_id = bomitm.fgifm_id THEN outbfg.outbfgitm_quantity ELSE 0 END),0) - COALESCE(SUM(CASE WHEN inbfg_check.fgifm_id = bomitm.fgifm_id THEN outbfg.outbfgitm_withdr_count ELSE 0 END),0)) AS outbfgitm_quantity_remain',
                    // ✅ คำนวณ outbfgitm_withdr_count_remain
                    '(COALESCE(SUM(outbfg.outbfgitm_withdr_count), 0) - COALESCE(SUM(outbfg.outbfgitm_shipmt_count), 0)) AS outbfgitm_withdr_count_remain',
                    // ✅ คำนวณ outbfgitm_shipmt_count_remain
                    'COALESCE(SUM(outbfg.outbfgitm_shipmt_count), 0) AS outbfgitm_shipmt_count_remain',
                     // ✅ แก้ไข `outbfgitm_shipmt_status`
                    `CASE 
                        -- ✅ กรณีที่ outbfgitm_shipmt_count เป็น 0 → สถานะ PENDING
                        WHEN SUM(CASE WHEN inbfg_check.fgifm_id = bomitm.fgifm_id 
                                    THEN outbfg.outbfgitm_shipmt_count ELSE 0 END) = 0 
                        THEN 'PENDING'
                    
                        -- ✅ กรณีที่ outbfgitm_shipmt_count เท่ากับ outbfgitm_quantity → สถานะ COMPLETED
                        WHEN SUM(CASE WHEN inbfg_check.fgifm_id = bomitm.fgifm_id 
                                    THEN outbfg.outbfgitm_shipmt_count ELSE 0 END) =
                            SUM(CASE WHEN inbfg_check.fgifm_id = bomitm.fgifm_id 
                                    THEN outbfg.outbfgitm_quantity ELSE 0 END) 
                        THEN 'COMPLETED'
                    
                        -- ✅ กรณีที่ outbfgitm_shipmt_count มากกว่า 0 แต่ยังน้อยกว่า outbfgitm_quantity → สถานะ PARTIAL
                        WHEN SUM(CASE WHEN inbfg_check.fgifm_id = bomitm.fgifm_id 
                                    THEN outbfg.outbfgitm_shipmt_count ELSE 0 END) > 0 
                            AND SUM(CASE WHEN inbfg_check.fgifm_id = bomitm.fgifm_id 
                                        THEN outbfg.outbfgitm_shipmt_count ELSE 0 END) < 
                                SUM(CASE WHEN inbfg_check.fgifm_id = bomitm.fgifm_id 
                                        THEN outbfg.outbfgitm_quantity ELSE 0 END)
                        THEN 'PARTIAL'
                    
                        -- ✅ กรณีที่ไม่ตรงกับเงื่อนไขไหนเลย → PENDING
                        ELSE 'PENDING'
                    END AS outbfgitm_shipmt_status`
                ])
                .where('bom.so_is_active = :isActive', { isActive: true })
                .andWhere('bom.so_id = :so_id', { so_id })
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .groupBy('bom.so_id, bomitm.bom_id, bomitm.bom_number, bomitm.bom_quantity, fgifm.fgifm_id, fgifm.fgifm_code, fgifm.fgifm_name, inbfg.total_inbfg_quantity');
    
            const rawData = await query.getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.bom'));
            }                
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('item.bom'), rawData);
    
        } catch (error: any) {
            console.error('Error in getAllDetails:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    

    async getById(so_id: number, manager?: EntityManager): Promise<ApiResponse<BomModel | null>> { 
        const response = new ApiResponse<BomModel | null>();
        const operation = 'BOMService.getById';
    
        try {
            const repository = manager ? manager.getRepository(m_bom) : this.bomRepository;
            const itemRepository = manager ? manager.getRepository(m_bom_items) : this.bomItemsRepository;
    
            // ดึงข้อมูล bom
            const rawData = await repository
                .createQueryBuilder('bom')
                .select([
                    'bom.so_id',
                    'bom.so_code',
                    'bom.so_cust_name',
                    'bom.so_details',
                    'bom.so_is_active' // เพิ่มการเลือก so_is_active
                ])
                .where('bom.so_id = :so_id', { so_id })
                .andWhere('bom.so_is_active = :isActive', { isActive: true }) // กรองเฉพาะ is_active = true
                .getRawOne();
    
            // หากไม่พบข้อมูล
            if (!rawData) {
                return response.setIncomplete(lang.msgNotFound('bom.so_id'));
            }
    
            // ดึงข้อมูล item
            const rawItems = await itemRepository
                .createQueryBuilder('item')
                .select([
                    'item.bom_number',
                    'item.bom_id',
                    'item.fgifm_id',
                    'item.bom_quantity',
                ])
                .where('item.so_id = :so_id', { so_id })
                .orderBy('item.bom_number', 'ASC')
                .getRawMany();
    
            // จัดรูปแบบข้อมูลด้วย BomGroupById
            const formattedData = BomGroupById.formatData(rawData, rawItems);
            console.log('Formatted Data:', formattedData);
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('bom.so_id'), formattedData);
        } catch (error: any) {
            console.error(`Error in ${operation} with so_id: ${so_id}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getByBom(
        so_id: number,
        bom_number: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'BOMService.getByBom';
    
        try {
            const repository = manager ? manager.getRepository(m_bom_items) : this.bomItemsRepository;
    
            // ตรวจสอบค่า `so_id` และ `bom_number` ต้องไม่เป็นค่าว่าง
            if (!so_id || !bom_number) {
                return response.setIncomplete(lang.msgRequired('so_id or bom_number is required.'));
            }
    
            // Query ค้นหาข้อมูลจาก `m_bom_items`, `m_inb_finished_goods`, และ `m_finished_goods_ifm`
            const rawData = await repository
                .createQueryBuilder('bomItm')
                .leftJoin('m_inb_finished_goods', 'inbfg', 'inbfg.fgifm_id = bomItm.fgifm_id') // เชื่อม `fgifm_id` เพื่อดึง `inbfg_id`
                .leftJoin('m_finished_goods_ifm', 'fgifm', 'fgifm.fgifm_id = bomItm.fgifm_id') // เชื่อม `fgifm_id` เพื่อดึง `fgifm_name`
                .select([
                    'bomItm.so_id AS so_id',
                    'bomItm.bom_id AS bom_id',
                    'bomItm.bom_number AS bom_number',
                    'inbfg.inbfg_id AS inbfg_id',
                    'inbfg.inbfg_code AS inbfg_code',
                    'bomItm.fgifm_id AS fgifm_id',
                    'fgifm.fgifm_name AS fgifm_name',
                    'inbfg.inbfg_remark AS inbfg_remark',
                    'inbfg.inbfg_quantity AS inbfg_quantity',
                ])
                .where('bomItm.so_id = :so_id', { so_id })  // กรอง `so_id`
                .andWhere('bomItm.bom_number = :bom_number', { bom_number })  // กรอง `bom_number`
                .andWhere('inbfg.inbfg_id IS NOT NULL')  // กรองเฉพาะรายการที่มี `inbfg_id`
                .orderBy('inbfg.inbfg_id', 'ASC') // เรียงตาม `bom_id` จากน้อยไปมาก
                .getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('bom.bom_number'));
            }
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('bom.bom_number'), rawData);
        } catch (error: any) {
            console.error(`Error in ${operation} with so_id: ${so_id}, bom_number: ${bom_number}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    

    async getSODropdown(
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'BOMService.getSODropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_bom) : this.bomRepository;
    
            // Query ข้อมูลทั้งหมดที่มี so_id เดียวกัน
            const rawData = await repository.createQueryBuilder('bom')
                .select(["bom.so_id", "bom.so_code"])
                .where("bom.so_code IS NOT NULL") // กรองค่า null ออก
                .andWhere('bom.so_is_active = :isActive', { isActive: true }) // ดึงเฉพาะข้อมูลที่ยังไม่ถูกลบ
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('bom.so_id'));
            }
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ SODropdownModel
            const data = rawData.map((so) => new SODropdownModel(so.bom_so_id, so.bom_so_code));
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('bom.so_id'), data);
        } catch (error: any) {
            console.error(`Error in ${operation}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    async getBomDropdown(
        so_id: number,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'BOMService.getBomDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_bom_items) : this.bomItemsRepository;
    
            // Query ข้อมูลทั้งหมดที่มี so_id เดียวกัน
            const rawData = await repository.createQueryBuilder('bomItm')
                .leftJoin('m_bom', 'bom', 'bomItm.so_id = bom.so_id') // ใช้ `so_id` เป็นตัวเชื่อม
                .select([
                    "bomItm.bom_number AS bom_number"
                ])
                .where('bomItm.so_id = :so_id', { so_id })
                .andWhere("bomItm.bom_number IS NOT NULL") // กรองค่า NULL ออกจาก `bom_number`
                .andWhere('bom.so_is_active = :isActive', { isActive: true }) // ตรวจสอบว่า BOM ยัง Active อยู่
                .distinct(true) // ดึงเฉพาะค่าที่ไม่ซ้ำ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.bom'));
            }
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ SODropdownModel
            const data = rawData.map((so) => new BOMDropdownModel(so.bom_number, so.bom_number));
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('item.bom'), data);
        } catch (error: any) {
            console.error(`Error in ${operation}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

}