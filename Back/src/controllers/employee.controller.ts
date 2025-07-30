import { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service';
import dotenv from 'dotenv';
import { m_employee } from '../entities/m_employee.entity'; // นำเข้าประเภทของ employee
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class
import { EmployeeModel} from '../models/employee.model';
import {getLanguage} from '../common/language.context';
dotenv.config();

const employeeService = new EmployeeService();


export const create = async (req: Request, res: Response) => {
    const operation = 'EmployeeController.create';
    console.log("operation : ", operation);

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {  
        console.log('Raw req.body:', req.body);

        let data: Partial<EmployeeModel> = DataSanitizer.fromObject<EmployeeModel>(req.body, EmployeeModel);
        data.create_by = reqUsername;
        console.log('Sanitized data : ', JSON.stringify(data, null, 2));

        const response = await employeeService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.employee', true, reqUsername);
    }
};

export const saveUser = async (req: Request, res: Response) => {
    const operation = 'EmployeeController.saveUser';
    console.log(operation);

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;
    console.log('reqUsername : ', reqUsername);

    try {
        const emp_id = parseInt(req.params.emp_id);
        console.log('Raw emp_id:', emp_id);

        if (!emp_id) {
            return ResponseUtils.handleBadRequestIsRequired(res, 'employee.emp_id');
        }

        // แปลง user_id ถ้าไม่ส่งค่ามาจะเป็น null
        const user_id = req.params.user_id ? parseInt(req.params.user_id) : null;
        console.log('user_id : ', user_id);

        console.log('Raw req.body:', req.body);

        const userData = req.body;

        // เรียก service เพื่อสร้างหรืออัปเดต user
        const response = await employeeService.saveUser(emp_id, user_id, userData, reqUsername);

        console.log('saveUser response:', response);
        if (!response.isCompleted) {
            return ResponseUtils.handleResponse(res, response);
        }

        // ตรวจสอบสถานะการสร้างหรืออัปเดต
        response.message = !user_id
            ? lang.msgSuccessAction('created', 'item.user_for_employee') // ข้อความสำหรับการสร้างใหม่
            : lang.msgSuccessAction('updated', 'item.user_for_employee'); // ข้อความสำหรับการแก้ไข

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.user_for_employee', true, reqUsername);
    }
};


export const update = async (req: Request, res: Response) => {
    const operation = 'EmployeeController.update';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const { emp_id } = req.params;
        console.log('Raw emp_id:', emp_id);

        if (!emp_id) {
            return ResponseUtils.handleBadRequestIsRequired(res, 'employee.emp_id');
        }

        const data: Partial<m_employee> = DataSanitizer.fromObject<m_employee>(req.body, m_employee);
        data.update_by = reqUsername;
        console.log('Parsed data:', data);

        const response = await employeeService.update(Number(emp_id), data, reqUsername);

        if (!response.isCompleted) {
            return ResponseUtils.handleResponse(res, response);
        }
        response.message = lang.msgSuccessAction('updated', 'item.employee');
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.employee', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'EmployeeController.del';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const { emp_id } = req.params;
        console.log('Raw emp_id:', emp_id);
        
        if (!emp_id) {
            return ResponseUtils.handleBadRequestIsRequired(res, 'employee.emp_id');
        }

        const response = await employeeService.delete(Number(emp_id));

        if (!response.isCompleted) {
            return ResponseUtils.handleResponse(res, response);
        }

        response.message = lang.msgSuccessAction('deleted', 'item.employee');
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.employee', true, reqUsername);
    }
};

export const search = async (req: Request, res: Response) => {
    const operation = 'EmployeeController.search';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    const { emp_code, emp_name} = req.query;

    try {
        console.log('Query params:', req.query);

        const response = await employeeService.search(
            emp_code as string,
            emp_name as string
        );

        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorSearch(res, operation, error.message, 'item.employee', true, reqUsername);
    }
};




export const getById = async (req: Request, res: Response) => {
    const operation = 'EmployeeController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    const { emp_id } = req.params;

    try {
        console.log('Raw req.params.emp_id:', emp_id);

        const response = await employeeService.getById(Number(emp_id));
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.employee', true, reqUsername);
    }
};

export const getByUserId = async (req: Request, res: Response) => {
    const operation = 'EmployeeController.getByUserId';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    const { user_id } = req.params;

    try {
        console.log('Raw req.params.user_id:', user_id);

        const response = await employeeService.getByUserId(Number(user_id));

        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.employee', true, reqUsername);
    }
};

export const getByUsername = async (req: Request, res: Response) => {
    const operation = 'EmployeeController.getByUsername';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    const { username } = req.params;

    try {
        console.log('Raw req.params.username:', username);

        const response = await employeeService.getByUsername(username);

        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.employee', true, reqUsername);
    }
};

