import { Repository, EntityManager, Not, In } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { s_user_permis_factory } from '../entities/s_user_permis_factory.entity';
import { s_user } from '../entities/s_user.entity';
import { m_factory } from '../entities/m_factory.entity';
import { m_warehouse } from '../entities/m_warehouse.entity';
import { s_user_permis_warehouse } from '../entities/s_user_permis_warehouse.entity';

export class AccessService {
    private userPermisFtyRepository: Repository<s_user_permis_factory>;
    private userPermisWhRepository: Repository<s_user_permis_warehouse>;
    private userRepository: Repository<s_user>;
    private factoryRepository: Repository<m_factory>;
    private warehouseRepository: Repository<m_warehouse>;

    constructor(){
        this.userPermisFtyRepository = AppDataSource.getRepository(s_user_permis_factory);
        this.userPermisWhRepository = AppDataSource.getRepository(s_user_permis_warehouse);
        this.userRepository = AppDataSource.getRepository(s_user);
        this.factoryRepository = AppDataSource.getRepository(m_factory);
        this.warehouseRepository = AppDataSource.getRepository(m_warehouse);
    }

    async create(
        userId: number,
        ftyIds: number[],
        whIds: number[],
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'AccessService.create';
    
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
            if (!ftyIds || ftyIds.length === 0) {
                return response.setIncomplete(lang.msgRequired('factory.fty_id'));
            }
    
            if (!whIds || whIds.length === 0) {
                return response.setIncomplete(lang.msgRequired('warehouse.wh_id'));
            }
    
            const userPermisFtyRepository = manager ? useManager.getRepository(s_user_permis_factory): this.userPermisFtyRepository;
            const userRepository =  manager ? useManager.getRepository(s_user): this.userRepository;
            const factoryRepository = manager ? useManager.getRepository(m_factory): this.factoryRepository;
            const warehouseRepository = manager ? useManager.getRepository(m_warehouse): this.warehouseRepository;
            const userPermisWhRepository = manager ? useManager.getRepository(s_user_permis_warehouse): this.userPermisWhRepository;
    
            // ตรวจสอบว่า user_id มีอยู่จริงใน s_user
            const userExists = await userRepository.findOne({ where: { user_id: userId } });
            if (!userExists) {
                throw new Error(lang.msgNotFound('user'));
            }
    
            // ตรวจสอบว่า ftyIds ทุกค่า มีอยู่จริงใน m_factory
            const validFactories = await factoryRepository.findBy({ fty_id: In(ftyIds) });
            const validFtyIds = validFactories.map((fty) => fty.fty_id);
    
            // ตรวจสอบว่า ftyIds ที่ส่งมามีบางรายการที่ไม่ถูกต้องหรือไม่
            const invalidFtyIds = ftyIds.filter((ftyId) => !validFtyIds.includes(ftyId));
            if (invalidFtyIds.length > 0) {
                throw new Error(lang.msgNotFound('factory.fty_id') + `: ${invalidFtyIds.join(', ')}`);
            }
    
            // ดึง upf_id ที่เกี่ยวข้องกับ user_id ก่อนลบ
            const existingFactories = await userPermisFtyRepository.find({
                where: { user_id: userId },
                select: ['upf_id'],
            });
            const upfIds = existingFactories.map((entry) => entry.upf_id);
    
            // ลบรายการเดิมของ upf_id ใน s_user_permis_warehouse ก่อน
            if (upfIds.length > 0) {
                await userPermisWhRepository
                    .createQueryBuilder()
                    .delete()
                    .where('upf_id IN (:...upfIds)', { upfIds })
                    .execute();
            }
    
            // ลบรายการเดิมของ user_id ใน s_user_permis_factory
            await userPermisFtyRepository.delete({ user_id: userId });
    
            // บันทึกข้อมูลใหม่ใน s_user_permis_factory
            const newFactoryEntries = validFtyIds.map((ftyId) => ({
                user_id: userId,
                fty_id: ftyId,
            }));
            const savedFactories = await userPermisFtyRepository.save(newFactoryEntries);
    
            // ดึง upf_id จากรายการที่บันทึกแล้ว
            const upfMap = savedFactories.reduce((map, factory) => {
                map[factory.fty_id] = factory.upf_id;
                return map;
            }, {} as Record<number, number>);
    
            // ตรวจสอบว่า whIds ทุกค่า มีอยู่จริงใน m_warehouse
            const validWarehouses = await warehouseRepository.findBy({ wh_id: In(whIds) });
            const validWhIds = validWarehouses.map((wh) => wh.wh_id);
    
            const invalidWhIds = whIds.filter((whId) => !validWhIds.includes(whId));
            if (invalidWhIds.length > 0) {
                throw new Error(lang.msgNotFound('warehouse.wh_id') + `: ${invalidWhIds.join(', ')}`);
            }
    
            // สร้างรายการใหม่ใน s_user_permis_warehouse
            const newWarehouseEntries = validWhIds.map((whId) => {
                // ดึง fty_id ที่สัมพันธ์กับ whId
                const warehouse = validWarehouses.find((wh) => wh.wh_id === whId);
                const upfId = upfMap[warehouse?.fty_id as number];
    
                if (!upfId) {
                    throw new Error(
                        lang.msgNotFound('mapping.upf_id') +
                            `: fty_id=${warehouse?.fty_id}, wh_id=${whId}`
                    );
                }
    
                return {
                    upf_id: upfId,
                    wh_id: whId,
                };
            });
    
            const savedWarehouses = await userPermisWhRepository.save(newWarehouseEntries);
    
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            // จัดกลุ่ม response ให้อยู่ในรูปแบบที่อ่านง่าย
            const formattedData = savedFactories.map((factory) => ({
                upf_id: factory.upf_id,
                fty_id: factory.fty_id,
                warehouses: savedWarehouses
                    .filter((warehouse) => warehouse.upf_id === factory.upf_id)
                    .map((warehouse) => ({
                        upw_id: warehouse.upw_id,
                        wh_id: warehouse.wh_id
                    })),
            }));
    
            return response.setComplete(
                lang.msgSuccessAction('updated', 'item.factory_and_warehouse'),
                formattedData
            );
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`Error during ${operation}:`, error.message);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    
    async searchWarehouse(fty_ids: number[], manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'AccessService.searchWarehouse';
    
        try {
            const repository = manager ? manager.getRepository(m_warehouse) : this.warehouseRepository;
    
            // Query warehouse โดยกรองตาม fty_ids
            const queryBuilder = repository.createQueryBuilder('warehouse')
                .select([
                    'warehouse.fty_id AS fty_id', // เพิ่ม fty_id เพื่อให้แสดงในผลลัพธ์
                    'warehouse.wh_id AS wh_id',
                    'warehouse.wh_name AS wh_name'
                ]);
    
            // ตรวจสอบว่า fty_ids มีค่า และเพิ่มเงื่อนไขการกรอง
            if (fty_ids && fty_ids.length > 0) {
                queryBuilder.where('warehouse.fty_id IN (:...fty_ids)', { fty_ids });
            }

            // เพิ่มคำสั่งเรียงลำดับตาม fty_id
            queryBuilder.orderBy('warehouse.fty_id', 'ASC');
    
            const rawData = await queryBuilder.getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('warehouse.wh_name'));
            }
    
            console.log('Filtered fty_ids:', fty_ids); // Debug ตรวจสอบ fty_ids
            console.log('rawData:', rawData); // Debug ข้อมูลที่ดึงมา
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ Dropdown พร้อม fty_id
            const data = rawData.map((wh) => ({
                fty_id: wh.fty_id, // รวม fty_id ในผลลัพธ์
                wh_id: wh.wh_id,
                wh_name: wh.wh_name,
            }));
    
            return response.setComplete(lang.msgFound('warehouse.wh_name'), data);
        } catch (error: any) {
            console.error('Error in searchWarehouse:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    
    async getByUserId(userId: number, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'AccessService.getByUserId';
    
        try {
            // ตรวจสอบ userId
            if (!userId) {
                return response.setIncomplete(lang.msgRequired('field.user_id'));
            }
    
            const userPermisFtyRepository = manager
                ? manager.getRepository(s_user_permis_factory)
                : this.userPermisFtyRepository;
    
            const userPermisWhRepository = manager
                ? manager.getRepository(s_user_permis_warehouse)
                : this.userPermisWhRepository;
    
            // ดึงข้อมูลโรงงานที่เกี่ยวข้องกับ user_id
            const factories = await userPermisFtyRepository.find({
                where: { user_id: userId },
                select: ['fty_id', 'upf_id'], // ดึงทั้ง fty_id และ upf_id
            });
    
            // ตรวจสอบว่ามีข้อมูลโรงงานหรือไม่
            if (!factories || factories.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.factory'));
            }
    
            // ดึงรายการ upf_id จากโรงงานที่พบ
            const upfIds = factories.map((factory) => factory.upf_id);
    
            // ดึงข้อมูลคลังสินค้าโดย join กับ upf_id
            const warehouses = await userPermisWhRepository.find({
                where: { upf_id: In(upfIds) },
                select: ['upf_id', 'wh_id'], // ดึงทั้ง upf_id และ wh_id
            });
    
            // จัดรูปแบบข้อมูล
            const result = factories.map((factory) => ({
                fty_id: factory.fty_id,
                upf_id: factory.upf_id,
                warehouses: warehouses
                    .filter((warehouse) => warehouse.upf_id === factory.upf_id)
                    .map((warehouse) => ({
                        wh_id: warehouse.wh_id,
                    })),
            }));
    
            return response.setComplete(lang.msgFound('item.factory_and_warehouse'), result);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error.message);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getFtyByUserId(userId: number, manager?: EntityManager): Promise<ApiResponse<number[]>> {
        const response = new ApiResponse<number[]>();
        const operation = 'AccessService.getFtyByUserId';
    
        try {
            const repository = manager ? manager.getRepository(s_user_permis_factory) : this.userPermisFtyRepository;
    
            // ดึงข้อมูล factory ID
            const rawData = await repository
                .createQueryBuilder('permisFty')
                .select('permisFty.fty_id', 'fty_id')
                .where('permisFty.user_id = :user_id', { user_id: userId })
                .orderBy('permisFty.fty_id', 'ASC')
                .getRawMany();
    
            console.log('Raw Data:', rawData);
    
            // ตรวจสอบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('factory.fty_id'));
            }
    
            // ดึงค่า fty_id
            const factoryIds = rawData.map((item) => item.fty_id);
    
            return response.setComplete(lang.msgFound('factory.fty_id'), factoryIds);
        } catch (error: any) {
            console.error(`Error in ${operation} with userId: ${userId}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
    
    
}