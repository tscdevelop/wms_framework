import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { m_supplier } from '../entities/m_supplier.entity';
import { SupplierModel } from '../models/supplier.model';
import { SupDropdownModel } from '../models/supplier_dropdown.model';
import { deleteEntity } from '../utils/DatabaseUtils';

export class SupplierService {
    private supplierRepository: Repository<m_supplier>;

    constructor() {
        this.supplierRepository = AppDataSource.getRepository(m_supplier);
    }

    async create(data: Partial<SupplierModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<SupplierModel>();
        const operation = 'SupplierService.create';
    
        // สร้าง QueryRunner สำหรับจัดการ Transaction
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        // ตรวจสอบว่า EntityManager หรือ QueryRunner พร้อมใช้งาน
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        // เริ่ม Transaction
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const repository = manager ? useManager.getRepository(m_supplier): this.supplierRepository;
    
            // ตรวจสอบข้อมูลที่จำเป็น
            if (validate.isNullOrEmpty(data.sup_code)) {
                return response.setIncomplete(lang.msgRequired('supplier.sup_code'));
            }
            if (validate.isNullOrEmpty(data.sup_name)) {
                return response.setIncomplete(lang.msgRequired('supplier.sup_name'));
            }
            if (data.sup_payment_due_days !== undefined && !validate.isPositiveNumber(data.sup_payment_due_days)) {
                return response.setIncomplete(lang.msgMultiple(["supplier.sup_payment_due_days", "field.integer"]));
            }
            if (validate.isNullOrEmpty(data.sup_address)) {
                return response.setIncomplete(lang.msgRequired('field.address'));
            }
            if (validate.isNullOrEmpty(data.sup_phone)) {
                return response.setIncomplete(lang.msgRequired('field.phone'));
            }
            if (validate.isNullOrEmpty(data.sup_email)) {
                return response.setIncomplete(lang.msgRequired('field.email'));
            }
            if (validate.isNullOrEmpty(data.create_by)) {
                return response.setIncomplete(lang.msgRequiredCreateby());
            }
    
            // ตรวจสอบข้อมูลซ้ำ sup_code และ sup_name
            const existingSup = await repository
                .createQueryBuilder('sup')
                .where('sup.sup_code = :sup_code OR sup.sup_name = :sup_name', {
                    sup_code: data.sup_code,
                    sup_name: data.sup_name
                })
                .getOne();

            if (existingSup) {
                if (existingSup.sup_code === data.sup_code) {
                    return response.setIncomplete(lang.msgAlreadyExists('supplier.sup_code'));
                }
                if (existingSup.sup_name === data.sup_name) {
                    return response.setIncomplete(lang.msgAlreadyExists('supplier.sup_name'));
                }
            }
    
            // บันทึกข้อมูล
            const supData = repository.create({
                ...data,
                sup_is_active: data.sup_is_active ?? true,
                create_date: new Date(),
            });
            // บันทึกข้อมูล
            const savedData = await repository.save(supData);

            // Commit Transaction หลังบันทึกข้อมูลสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
             // ส่งผลลัพธ์กลับ
            return response.setComplete(lang.msgSuccessAction('created', 'item.supplier'), savedData);

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
        sup_id: number,
        data: Partial<SupplierModel>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<SupplierModel>();
        const operation = 'SupplierService.update';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        // ตรวจสอบว่า EntityManager หรือ QueryRunner พร้อมใช้งาน
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        // เริ่ม Transaction
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const repository = manager ? useManager.getRepository(m_supplier): this.supplierRepository;
    
            // ตรวจสอบว่ามี sup_id ในระบบหรือไม่
            const existingSup = await repository.findOne({ where: { sup_id: sup_id } });
            if (!existingSup) {
                throw new Error(lang.msgNotFound('supplier.sup_id')); // ใช้ throw เพื่อเข้าสู่ catch
            }
    
             // ตรวจสอบข้อมูลที่จำเป็น
            if (validate.isNullOrEmpty(data.sup_code)) {
                return response.setIncomplete(lang.msgRequired('supplier.sup_code'));
            }
            if (validate.isNullOrEmpty(data.sup_name)) {
                return response.setIncomplete(lang.msgRequired('supplier.sup_name'));
            }
            if (data.sup_payment_due_days !== undefined && !validate.isPositiveNumber(data.sup_payment_due_days)) {
                return response.setIncomplete(lang.msgMultiple(["supplier.sup_payment_due_days", "field.integer"]));
            }
            if (validate.isNullOrEmpty(data.sup_address)) {
                return response.setIncomplete(lang.msgRequired('field.address'));
            }
            if (validate.isNullOrEmpty(data.sup_phone)) {
                return response.setIncomplete(lang.msgRequired('field.phone'));
            }
            if (validate.isNullOrEmpty(data.sup_email)) {
                return response.setIncomplete(lang.msgRequired('field.email'));
            }

            // ตรวจสอบข้อมูลซ้ำ sup_code และ sup_name
            const existingSupDuplicate = await repository
                .createQueryBuilder('sup')
                .where('(sup.sup_code = :sup_code OR sup.sup_name = :sup_name) AND sup.sup_id != :sup_id', {
                    sup_code: data.sup_code,
                    sup_name: data.sup_name,
                    sup_id: sup_id,
                })
                .getOne();

            if (existingSupDuplicate) {
                if (existingSupDuplicate.sup_code === data.sup_code) {
                    return response.setIncomplete(lang.msgAlreadyExists('supplier.sup_code'));
                }
                if (existingSupDuplicate.sup_name === data.sup_name) {
                    return response.setIncomplete(lang.msgAlreadyExists('supplier.sup_name'));
                }
            }

            // อัปเดตข้อมูล
            Object.assign(existingSup, {
                ...data,
                update_by: reqUsername,
                update_date: new Date(),
            });

            await repository.save(existingSup); // บันทึกข้อมูล

            // ดึงข้อมูลที่อัปเดตแล้วกลับมา
            const dataResponse = await this.getById(sup_id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                throw new Error(dataResponse.message);
            }

            response = response.setComplete(lang.msgSuccessAction('updated', 'item.supplier'), dataResponse.data);

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
    
    async delete(sup_id: number, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'SupplierService.delete';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        // ตรวจสอบว่า EntityManager หรือ QueryRunner พร้อมใช้งาน
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        // เริ่ม Transaction
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const repository = manager ? useManager.getRepository(m_supplier): this.supplierRepository;
    
            // ตรวจสอบว่ามี sup_id อยู่ในระบบหรือไม่
            const existingSup = await repository.findOne({ where: { sup_id: sup_id } });
            if (!existingSup) {
                throw new Error(lang.msgNotFound('supplier.sup_id'));  // ใช้ throw เพื่อให้ Rollback ทำงาน
            }

             // ใช้ deleteEntity โดยส่ง useManager (Transaction)
            const deleteResponse = await deleteEntity(repository, sup_id, reqUsername, 'sup_is_active', 'sup_id');
            
            if (!deleteResponse.isCompleted) {
                return deleteResponse; // ถ้าลบไม่สำเร็จให้ return response ทันที
            }
            
            // Commit Transaction หลังบันทึกสำเร็จ
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // ส่ง Response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.supplier'));
    
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
        const operation = 'SupplierService.getAll';

        try {
            const repository = manager ? manager.getRepository(m_supplier) : this.supplierRepository;
    
            // Query supplier ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository
                .createQueryBuilder('supplier')
                .select([
                    'supplier.sup_id AS sup_id',
                    'supplier.sup_code AS sup_code',
                    'supplier.sup_name AS sup_name',
                    'supplier.sup_tax_id AS sup_tax_id',
                    'supplier.sup_remark AS sup_remark',
                    'supplier.sup_address AS sup_address',
                    'supplier.sup_phone AS sup_phone',
                    'supplier.sup_email AS sup_email',
                    'supplier.sup_payment_due_days AS sup_payment_due_days',
                    'supplier.create_date AS create_date',
                    'supplier.create_by AS create_by',
                    'supplier.update_date AS update_date',
                    'supplier.update_by AS update_by',
                    'supplier.sup_is_active AS sup_is_active'
                ])
                // เพิ่มเงื่อนไขดึงเฉพาะข้อมูลที่ใช้งาน
                .where('supplier.sup_is_active = :isActive', { isActive: true })
                // เรียงลำดับตามชื่อ supplier.sup_name
                .orderBy('supplier.sup_name', 'ASC') // ASC สำหรับลำดับจากน้อยไปมาก, DESC สำหรับมากไปน้อย
                .cache(false) // ✅ ปิด Query Cache ถ้า TypeORM รองรับ
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.supplier'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.supplier'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getById(sup_id: number, manager?: EntityManager): Promise<ApiResponse<SupplierModel | null>> {
        const response = new ApiResponse<SupplierModel | null>();
        const operation = 'SupplierService.getById';
    
        try {
            const repository = manager ? manager.getRepository(m_supplier) : this.supplierRepository;
    
            // Query supplier ข้อมูลแบบ raw data
            const rawData = await repository
                .createQueryBuilder('supplier')
                .select([
                    'supplier.sup_id AS sup_id',
                    'supplier.sup_code AS sup_code',
                    'supplier.sup_name AS sup_name',
                    'supplier.sup_tax_id AS sup_tax_id',
                    'supplier.sup_remark AS sup_remark',
                    'supplier.sup_address AS sup_address',
                    'supplier.sup_phone AS sup_phone',
                    'supplier.sup_email AS sup_email',
                    'supplier.sup_payment_due_days AS sup_payment_due_days',
                    'supplier.create_date AS create_date',
                    'supplier.create_by AS create_by',
                    'supplier.update_date AS update_date',
                    'supplier.update_by AS update_by',
                    'supplier.sup_is_active AS sup_is_active'
                ])
                // เพิ่มเงื่อนไขดึงเฉพาะข้อมูลที่ใช้งาน
                .where('supplier.sup_id = :sup_id', { sup_id })
                .andWhere('supplier.sup_is_active = :isActive', { isActive: true })  // ดึงเฉพาะข้อมูลที่ยังไม่ถูกลบ
                .getRawOne();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('supplier.sup_id'));
            }
    
            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('supplier.sup_id'), rawData);
    
        } catch (error: any) {
            console.error(`Error in ${operation} with sup_id: ${sup_id}`, error);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    

    async getSupDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = 'SupplierService.getSupDropdown';
    
        try {
            const repository = manager ? manager.getRepository(m_supplier) : this.supplierRepository;

            // ดึงข้อมูลทั้ง sup_id และ sup_code
            const rawData = await repository.createQueryBuilder("supplier")
                .select([
                    "supplier.sup_id",
                    "CONCAT(supplier.sup_code, ' ', supplier.sup_name) AS supplier_code_name" // รวม sup_code และ sup_name
                ])
                .where("supplier.sup_id IS NOT NULL") // กรองค่า null ออก
                .andWhere('supplier.sup_is_active = :isActive', { isActive: true })  // ดึงเฉพาะข้อมูลที่ยังไม่ถูกลบ
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.supplier'));
            }
    
            console.log('rawData:', rawData); // ตรวจสอบข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ SupDropdownModel
            const data = rawData.map((Sup) => new SupDropdownModel(Sup.supplier_sup_id,Sup.supplier_code_name));
        
            return response.setComplete(lang.msgFound('item.supplier'), data);
    
        } catch (error: any) {
            console.error('Error during getDYDropdown:', error.message);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    } 

    async codeExists(id: string, manager?: EntityManager): Promise<boolean> {
        const repository = manager ? manager.getRepository(m_supplier) : this.supplierRepository;
        const count = await repository.count({ where: { sup_id: Number(id) } });
        return count > 0;
    }

    async createJson(
        data: any[], 
        reqUsername: string, 
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'SupplierService.createJson';
    
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
            const repository = useManager.getRepository(m_supplier);
    
            // ✅ ตรวจสอบว่ามีข้อมูลเข้ามาหรือไม่
            if (!data || !Array.isArray(data) || data.length === 0) {
                return response.setIncomplete(lang.msgDataNotFound());
            }
    
            // ✅ Map ฟิลด์จาก JSON ให้ตรงกับฟิลด์ในฐานข้อมูล
            const fieldMapping: Record<string, keyof m_supplier> = {
                'รหัสSupplier': 'sup_code',
                'ชื่อSupplier': 'sup_name',
                'เลขประจำตัวผู้เสียภาษี': 'sup_tax_id',
                'ที่อยู่': 'sup_address',
                'เบอร์ติดต่อ': 'sup_phone',
                'อีเมล': 'sup_email',
                'เครดิตชำระเงิน(วัน)': 'sup_payment_due_days',
                'หมายเหตุ': 'sup_remark',
            };
    
            console.log('📌 Raw JSON Data:', data);
    
            // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่ตรงกับฐานข้อมูล
            const formattedData: Partial<m_supplier>[] = data.map((row: any, index) => {
                const mappedRow: Partial<m_supplier> = {};
    
                Object.keys(row).forEach((jsonKey) => {
                    const dbField = fieldMapping[jsonKey];
                    if (dbField) {
                        mappedRow[dbField] = row[jsonKey] !== '' ? row[jsonKey] : null; // ✅ ให้ `""` เป็น `null`
                    }
                });
    
                // ✅ ตั้งค่า default values
                mappedRow.sup_is_active = mappedRow.sup_is_active ?? true;
                mappedRow.create_date = new Date();
                mappedRow.create_by = reqUsername;
    
                console.log(`📌 Mapped Row ${index + 1}:`, mappedRow);
                return mappedRow;
            });
    
            console.log("formattedData",formattedData)
            // ✅ ตรวจสอบข้อมูลที่จำเป็น
            for (const item of formattedData) {
                if (validate.isNullOrEmpty(item.sup_code)) {
                    return response.setIncomplete(lang.msgRequired('supplier.sup_code'));
                }
                if (validate.isNullOrEmpty(item.sup_name)) {
                    return response.setIncomplete(lang.msgRequired('supplier.sup_name'));
                }
                if (item.sup_payment_due_days !== undefined && !validate.isPositiveNumber(item.sup_payment_due_days)) {
                    return response.setIncomplete(lang.msgMultiple(["supplier.sup_payment_due_days", "field.integer"]));
                }
                if (validate.isNullOrEmpty(item.sup_tax_id)) {
                    return response.setIncomplete(lang.msgRequired('supplier.sup_tax_id'));
                }
                if (validate.isNullOrEmpty(item.sup_address)) {
                    return response.setIncomplete(lang.msgRequired('field.address'));
                }
                if (validate.isNullOrEmpty(item.sup_phone)) {
                    return response.setIncomplete(lang.msgRequired('field.phone'));
                }
                if (validate.isNullOrEmpty(item.sup_email)) {
                    return response.setIncomplete(lang.msgRequired('field.email'));
                }
            }

    /* เช็คซ้ำกันเองใน excel */
            // ตรวจสอบข้อมูลที่ซ้ำกันเองในไฟล์ Excel (รหัส หรือ ชื่อ ซ้ำกัน ห้ามบันทึก)
            const seenCodes = new Set();
            const seenNames = new Set();
            const duplicateEntries: Partial<m_supplier>[] = [];

            formattedData.forEach((s) => {
                const isCodeDuplicate = seenCodes.has(s.sup_code);
                const isNameDuplicate = seenNames.has(s.sup_name);

                if (isCodeDuplicate || isNameDuplicate) {
                    duplicateEntries.push(s);
                } else {
                    seenCodes.add(s.sup_code);
                    seenNames.add(s.sup_name);
                }
            });
            
            if (duplicateEntries.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกันเองในไฟล์ ${duplicateEntries.length} รายการ: ` +
                    `${duplicateEntries.map(e => `${e.sup_code} (${e.sup_name})`).join(', ')}`
                );
            }            
            
            // ถ้าไม่มีซ้ำกันเอง ก็ใช้ formattedData เป็น uniqueSuppliers
            const uniqueSuppliers = formattedData;

    /* เช็คซ้ำกับข้อมูลในระบบ */
            // ✅ ตรวจสอบข้อมูลซ้ำ `sup_code` และ `sup_name` ใน database
            const existingSuppliers = await repository
                .createQueryBuilder('sup')
                .where('sup.sup_code IN (:...codes) OR sup.sup_name IN (:...names)', {
                    codes: uniqueSuppliers.map((s) => s.sup_code).filter(Boolean),
                    names: uniqueSuppliers.map((s) => s.sup_name).filter(Boolean)
                })
                .getMany();

            // ดึงข้อมูลที่ user กรอกเข้ามา (uniqueSuppliers) ที่ซ้ำกับข้อมูลในระบบ (existingSuppliers)
            const duplicateInInput = uniqueSuppliers.filter((s) =>
                existingSuppliers.some((ex) =>
                    ex.sup_code === s.sup_code || ex.sup_name === s.sup_name
                )
            );

            if (duplicateInInput.length > 0) {
                return response.setIncomplete(
                    `พบข้อมูลซ้ำกับข้อมูลในระบบ ${duplicateInInput.length} รายการ: ` +
                    duplicateInInput.map(e => `${e.sup_code} (${e.sup_name})`).join(', ')
                );
            }

            // ถ้าไม่มีข้อมูลซ้ำเลย ก็ทำการ save
            const savedSuppliers = await repository.save(uniqueSuppliers);
    
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgSuccessAction('created', 'item.supplier'), savedSuppliers);
    
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


