// 2024-08-09 : ปรับ ให้รองรับ ValidationUtils การ response โดยใช้ฟังก์ชั่นใน ApiResponse, message ให้ใช้ LangHelper 
import { Repository, EntityManager } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { m_employee } from '../entities/m_employee.entity';
import { s_user } from '../entities/s_user.entity';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils
import CodeGenerator from '../utils/CodeGenerator';

import { UserService } from './user.service'; // Import UserServic
import { EmployeeModel} from '../models/employee.model';
import { s_role } from '../entities/s_role.entity';
import CryptHelper from '../utils/CryptHelper';
import { UserModel } from '../models/user.model';

export class EmployeeService {
    private employeeRepository: Repository<m_employee>;
    private userRepository: Repository<s_user>;
    private roleRepository: Repository<s_role>;
    private userService: UserService;

    constructor() {
        this.employeeRepository = AppDataSource.getRepository(m_employee);
        this.userRepository = AppDataSource.getRepository(s_user);
        this.roleRepository = AppDataSource.getRepository(s_role);
        this.userService = new UserService();
    }

    // Generate employee code
    private async generateCode(): Promise<string> {
        const codeGenerator = new CodeGenerator(AppDataSource);
        const newCode = await codeGenerator.generateCode('m_employee', 'emp_code', 'E', '', '[PREFIX][TH(YY)][000x]');
        return newCode;
    }

    // Create employee without user relation
    async create(data: Partial<EmployeeModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        let response = new ApiResponse<EmployeeModel>();
        let employeeData = new m_employee();
        const operation = 'EmployeeService.create';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        if (!manager) {
            await queryRunner?.connect();
            await queryRunner?.startTransaction();
        }
    
        try {
            const repository = useManager.getRepository(m_employee);
    
            // Validate required data
            if (validate.isNullOrEmpty(data.emp_first_name)) {
                return response.setIncomplete(lang.msgRequired('field.first_name'));
            }
            if (validate.isNullOrEmpty(data.emp_last_name)) {
                return response.setIncomplete(lang.msgRequired('field.last_name'));
            }
            data.create_by = data.create_by || reqUsername;
    
            if (validate.isNotNullOrEmpty(data.emp_code)) {
                const existingCode = await repository.findOne({ where: { emp_code: data.emp_code } });
                if (existingCode) {
                    return response.setIncomplete(lang.msgAlreadyExists('employee.emp_code'));
                }
            } else {
                data.emp_code = await this.generateCode();
            }
    
            // Assign data
            Object.assign(employeeData, data);
            employeeData.create_date = new Date();
            employeeData.emp_is_active = true;
    
            // Save the new employee
            const savedData = await repository.save(employeeData);
    
            console.log('Parsed user_id:', data.user_id);
    
            const dataResponse = await this.getById(savedData.emp_id!, useManager);
    
            if (!dataResponse.isCompleted) {
                throw new Error(dataResponse.message);
            }
    
            response = response.setComplete(lang.msgSuccessAction('created', 'item.employee'), dataResponse.data!);
    
            if (!manager) {
                await queryRunner?.commitTransaction();
            }
    
            return response;
    
        } catch (error: any) {
            if (!manager) {
                await queryRunner?.rollbackTransaction();
            }
            console.error('Error during role creation:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    
    
    async saveUser(
        emp_id: number,
        user_id: number | null,
        userData: Partial<UserModel>,
        savedataBy: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<EmployeeModel>();
        const operation = "EmployeeService.saveUser";
    
        // ใช้ QueryRunner ถ้าไม่ได้ส่ง manager เข้ามา
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(
                lang.msg("validation.no_entityManager_or_queryRunner_available")
            );
        }
    
        // ถ้าไม่ได้ส่ง manager เข้ามา ให้เริ่มต้น transaction
        if (!manager) {
            await queryRunner?.connect();
            await queryRunner?.startTransaction();
        }
    
        try {
            const employeeRepository = manager ? useManager.getRepository(m_employee): this.employeeRepository;
            const userRepository = manager ? useManager.getRepository(s_user): this.userRepository;
            const roleRepository = manager ? useManager.getRepository(s_role): this.roleRepository;
    
            if (validate.isNullOrEmpty(emp_id)) {
                return response.setIncomplete(lang.msgRequired("employee.emp_id"));
            }
            
            // ค้นหา employee
            const employee = await employeeRepository.findOne({ where: { emp_id } });
            if (!employee) {
                return response.setIncomplete(lang.msgNotFound("item.employee"));
            }

            if (user_id) {
                // กรณีอัปเดต user: ตรวจสอบว่า employee มี user_id ตรงกับ user_id ที่ส่งมาหรือไม่
                if (employee.user_id !== user_id) {
                    return response.setIncomplete(
                        lang.msgNotFound("field.user_id")
                    );
                }
            } else {
                // กรณีสร้างใหม่: ตรวจสอบว่า employee มี user_id อยู่แล้วหรือไม่
                if (employee.user_id) {
                    return response.setIncomplete(
                        lang.msgAlreadyExists("field.user_id")
                    );
                }
    
                // ตรวจสอบค่าที่จำเป็นสำหรับการสร้าง user
                if (!userData.username) {
                    return response.setIncomplete(lang.msgRequired("field.username"));
                }
                if (!userData.password) {
                    return response.setIncomplete(lang.msgRequired("field.password"));
                }
                if (!userData.role_code) {
                    return response.setIncomplete(lang.msgRequired("role.role_code"));
                }
    
                // ตรวจสอบ username ซ้ำ
                const existingUser = await userRepository.findOne({
                    where: { username: userData.username },
                });
                if (existingUser) {
                    return response.setIncomplete(lang.msgAlreadyExists("field.username"));
                }
            }
            
            // ตรวจสอบว่า role_code มีอยู่ใน s_role หรือไม่
            const role = await roleRepository.findOne({ where: { role_code: userData.role_code } });
            if (!role) {
                return response.setIncomplete(lang.msgNotFound('role.role_code'));
            }
    
            let user: s_user | null = null;
    
            if (user_id) {
                // อัปเดต user ที่มีอยู่
                user = await userRepository.findOne({ where: { user_id } });
                if (!user) {
                    return response.setIncomplete(lang.msgNotFound("item.user"));
                }
                
                // ไม่อนุญาตให้เปลี่ยน username
                if (userData.username && userData.username !== user.username) {
                    return response.setIncomplete(lang.msgNotRequired("field.username"));
                }

                // อนุญาตให้แก้ไขเฉพาะ password และ role_code
                if (userData.password) {
                    user.password = await CryptHelper.hashPassword(userData.password);
                }
                if (userData.role_code) {
                    user.role_code = userData.role_code;
                }

                // อัปเดตข้อมูล
                user.username = userData.username || user.username;
                user.password = userData.password
                    ? await CryptHelper.hashPassword(userData.password)
                    : user.password;
                user.role_code = userData.role_code || user.role_code;
                user.update_by = savedataBy;
                user.update_date = new Date();
    
                await userRepository.save(user);
            } else {
                // สร้าง user ใหม่
                user = userRepository.create({
                    username: userData.username,
                    password: await CryptHelper.hashPassword(userData.password),
                    role_code: userData.role_code,
                    create_by: savedataBy,
                });
    
                await userRepository.save(user);
            }
    
            // อัปเดต employee ด้วย user_id
            employee.user_id = user.user_id;
            employee.update_by = savedataBy;
            employee.update_date = new Date();
    
            const updatedEmployee = await employeeRepository.save(employee);
    
            // ดึงข้อมูล employee ที่อัปเดตสำเร็จ
            const employeeResponse = await this.getById(updatedEmployee.emp_id!, useManager);
            if (!employeeResponse.isCompleted) {
                throw new Error(employeeResponse.message);
            }
    
            response = response.setComplete(
                lang.msgSuccessAction("updated", "item.user_employee"),
                employeeResponse.data!
            );
    
            // คอมมิต transaction ถ้าไม่ได้ส่ง manager เข้ามา
            if (!manager) {
                await queryRunner?.commitTransaction();
            }
    
            return response;
        } catch (error: any) {
            // ย้อนกลับ transaction ถ้ามีข้อผิดพลาดเกิดขึ้น
            if (!manager) {
                await queryRunner?.rollbackTransaction();
            }
            console.error("Error in saveUser:", error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            // ปิด queryRunner ถ้าไม่ได้ส่ง manager เข้ามา
            if (!manager) {
                await queryRunner?.release();
            }
        }
    }
    
    async update(id: number, data: Partial<EmployeeModel>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<m_employee>> {
        let response = new ApiResponse<m_employee>();
        const operation = 'EmployeeService.update';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        if (!manager) {
            await queryRunner?.connect();
            await queryRunner?.startTransaction();
        }
    
        try {
            const repository = useManager.getRepository(m_employee);
    
            // ใช้ getById ตรวจสอบและดึงข้อมูล
            const existingEmp = await repository.findOneBy({ emp_id: id });
            if (!existingEmp) {
                return response.setIncomplete(lang.msgNotFound('field.employee'));
            }
    
            // Validate required fields
            data.update_by = data.update_by || reqUsername;
            if (validate.isNullOrEmpty(data.update_by)) {
                return response.setIncomplete(lang.msgRequiredUpdateby());
            }
    
            console.log('Before update:', existingEmp);
            Object.assign(existingEmp, data); // Update fields
            existingEmp.update_date = new Date();
    
            // Save updated data
            await repository.save(existingEmp);
    
            // Fetch updated data
            const dataResponse = await this.getById(id, useManager);
            if (!dataResponse.isCompleted) {
                throw new Error(dataResponse.message);
            }
    
            response = response.setComplete(lang.msgSuccessAction('updated', 'item.employee'), dataResponse.data!);
    
            if (!manager) {
                await queryRunner?.commitTransaction();
            }
    
            return response;
    
        } catch (error: any) {
            if (!manager) {
                await queryRunner?.rollbackTransaction();
            }
            console.error('Error during role edit:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager) {
                await queryRunner?.release();
            }
        }
    }

    async delete(id: number, manager?: EntityManager): Promise<ApiResponse<void>> {
        let response = new ApiResponse<void>();
        const operation = 'EmployeeService.delete';
    
        // ใช้ QueryRunner ถ้าไม่ได้ส่ง manager เข้ามา
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        // ถ้าไม่ได้ส่ง manager เข้ามา ให้เริ่มต้น transaction
        if (!manager) {
            await queryRunner?.connect();
            await queryRunner?.startTransaction();
        }
    
        try {
            const repository = useManager.getRepository(m_employee);
    
            // ตรวจสอบว่าพนักงานมีอยู่จริงหรือไม่
            const dataResponse = await this.getById(id, useManager);
            if (!dataResponse.isCompleted || !dataResponse.data) {
                return response.setIncomplete(lang.msgNotFound('item.employee'));
            }
    
            // ทำการลบพนักงานโดยใช้ repository.delete
            await repository.delete(id);
    
            // คอมมิต transaction ถ้าไม่ได้ส่ง manager เข้ามา
            if (!manager) {
                await queryRunner?.commitTransaction();
            }
    
            // ส่ง response ว่าลบสำเร็จ
            return response.setComplete(lang.msgSuccessAction('deleted', 'item.employee'));
    
        } catch (error: any) {
            // ย้อนกลับ transaction ถ้ามีข้อผิดพลาดเกิดขึ้นและไม่ได้ส่ง manager เข้ามา
            if (!manager) {
                await queryRunner?.rollbackTransaction();
            }
            console.error('Error during employee deletion:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            // ปิด queryRunner ถ้าไม่ได้ส่ง manager เข้ามา
            if (!manager) {
                await queryRunner?.release();
            }
        }
    }
    
    async search(
        emp_code?: string,
        emp_name?: string,
    ): Promise<ApiResponse<any[]>> {
        let response = new ApiResponse<any[]>(); // สร้าง instance ของ ApiResponse
        const operation = 'EmployeeService.search'; // ระบุชื่อ operation สำหรับใช้ในการจัดการ error
    
        try {
            const query = this.employeeRepository.createQueryBuilder('employee')
                .leftJoin('s_user', 'user', 'employee.user_id = user.user_id') // JOIN ตาราง user ด้วย user_id
                .select([
                    'employee.emp_id AS emp_id',
                    'employee.emp_code AS emp_code',
                    "CONCAT(employee.emp_first_name, ' ', employee.emp_last_name) AS emp_name",
                    'user.user_id AS user_id',
                    'user.role_code AS role_code',
                ]);

            // เพิ่มเงื่อนไขการค้นหาตามพารามิเตอร์ที่ระบุ
            if (validate.isNotNullOrEmpty(emp_code)) {
                query.andWhere('employee.emp_code LIKE :emp_code', { emp_code: `%${emp_code}%` });
            }
    
            if (validate.isNotNullOrEmpty(emp_name)) {
                query.andWhere('(employee.emp_first_name LIKE :emp_name OR employee.emp_last_name LIKE :emp_name)', { emp_name: `%${emp_name}%` });
            }
    
            console.log("Generated SQL query: ", query.getSql()); // Debug SQL query ที่สร้าง
    
            // ดึงข้อมูลผลลัพธ์ที่ตรงกับเงื่อนไขทั้งหมด
            const employees = await query.getRawMany(); // ใช้ getRawMany() เพื่อดึงข้อมูลแบบ raw พร้อมกับข้อมูลที่ JOIN
    
            if (employees.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.employee')); // หากไม่พบข้อมูล ให้คืนค่าผลลัพธ์ว่าไม่ครบถ้วน
            }
    
            return response.setComplete(lang.msgFound('item.employee'), employees); // หากพบข้อมูล คืนค่าผลลัพธ์พร้อมข้อมูลที่พบ
        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message)); // จัดการข้อผิดพลาดด้วยการโยน error พร้อมข้อความที่อธิบาย
        }
    }

    async getById(emp_id: number, manager?: EntityManager): Promise<ApiResponse<m_employee | null>> {
        let response = new ApiResponse<m_employee | null>();
        const operation = 'EmployeeService.getById';

        // แก้ไขเงื่อนไขการตรวจสอบ emp_id
        if (!emp_id) {
            return response.setIncomplete(lang.msgInvalidParameter());
        }
    
        try {
            const repository = manager ? manager.getRepository(m_employee) : this.employeeRepository;
    
            // Query ข้อมูลทั้งหมดจากตาราง m_employee และ join กับ s_user
            const rawData = await repository.createQueryBuilder('employee')
                .leftJoin('s_user', 'user', 'employee.user_id = user.user_id') // JOIN ตาราง user ด้วย user_id
                .select([
                    'employee.*',  // ดึงข้อมูลทั้งหมดของ employee
                    'user.user_id AS user_id',
                    'user.role_code AS role_code',
                ])
                .where('employee.emp_id = :emp_id', { emp_id })
                .getRawOne(); // ใช้ getRawOne() เพื่อดึงข้อมูลทั้งหมดในรูปแบบ raw
    
            // ตรวจสอบว่ามีข้อมูลหรือไม่
            if (!rawData) {
                return response.setIncomplete(lang.msgNotFound('item.employee'));
            }

            // ส่งผลลัพธ์กลับในรูปแบบของข้อมูล employee รวมข้อมูล user
            return response.setComplete(lang.msgFound('item.employee') , rawData);
            } catch (error: any) {
                throw new Error(lang.msgErrorFunction(operation, error.message));
            }
        }
    
    async getByUserId(userId: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        let response = new ApiResponse<any | null>();
        const operation = 'EmployeeService.getByUserId'; // ตั้งชื่อให้สอดคล้องกับ EmployeeService
    
        // ตรวจสอบว่า userId ถูกต้องหรือไม่
        if (userId <= 0 || isNaN(userId)) {
            return response.setIncomplete(lang.msgInvalidParameter());
        }
    
        try {
            const repository = manager ? manager.getRepository(m_employee) : this.employeeRepository;
    
            // Query ข้อมูลทั้งหมดจากตาราง m_employee และ join กับ s_user
            const rawData = await repository.createQueryBuilder('employee')
                .leftJoin('s_user', 'user', 'employee.user_id = user.user_id') // JOIN ตาราง user ด้วย user_id
                .select([
                    // 'employee.*',  // ดึงข้อมูลทั้งหมดของ employee
                    'employee.emp_id AS emp_id',
                    'employee.emp_code AS emp_code',
                    "CONCAT(employee.emp_first_name, ' ', employee.emp_last_name) AS emp_name",
                    'user.username AS username',
                    'user.role_code AS role_code',
                ])
                .where('employee.user_id = :userId', { userId })
                .getRawOne(); // ใช้ getRawOne() เพื่อดึงข้อมูลทั้งหมดในรูปแบบ raw
    
            // ตรวจสอบว่ามีข้อมูลหรือไม่
            if (!rawData) {
                return response.setIncomplete(lang.msgNotFound('item.employee'));
            }
    
            // ส่งผลลัพธ์กลับในรูปแบบของข้อมูล employee รวมข้อมูล user
            return response.setComplete(lang.msgFound('item.employee') , rawData);
        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
        
    async getByUsername(username: string, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        let response = new ApiResponse<any | null>();
        const operation = 'EmployeeService.getByUsername';
    
        // ตรวจสอบความถูกต้องของ username
        if (validate.isNullOrEmpty(username)) {
            return response.setIncomplete(lang.msgInvalidParameter());
        }
    
        try {
            const repository = manager ? manager.getRepository(m_employee) : this.employeeRepository;
    
            // Query ข้อมูลจากตาราง m_employee และ join กับ s_user
            const rawData = await repository.createQueryBuilder('employee')
                .leftJoin('s_user', 'user', 'employee.user_id = user.user_id')
                .select([
                    'employee.emp_id AS emp_id',
                    'employee.emp_code AS emp_code',
                    "CONCAT(employee.emp_first_name, ' ', employee.emp_last_name) AS emp_name",
                    'user.username AS username',
                    'user.role_code AS role_code',
                ])
                .where('user.username = :username', { username })
                .getRawOne();
    
            if (!rawData) {
                return response.setIncomplete(lang.msgNotFound('item.employee'));
            }
    
            return response.setComplete(lang.msgFound('item.employee') , rawData);
        } catch (error: any) {
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async idExists(id: number, manager?: EntityManager): Promise<boolean> {
        const repository = manager ? manager.getRepository(m_employee) : this.employeeRepository;
        const count = await repository.count({ where: { emp_id: id } });
        return count > 0;
    }

}