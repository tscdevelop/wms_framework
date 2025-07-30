import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { WarehouseModel } from '../models/warehouse.model';
import { WarehouseService } from '../services/warehouse.service';

dotenv.config();
const warehouseService = new WarehouseService();

export const create = async  (req: Request, res: Response) => {
    const operation = 'WarehouseController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<WarehouseModel> = DataSanitizer.fromObject<WarehouseModel>(req.body, WarehouseModel);
        data.create_by = reqUsername;

        const response = await warehouseService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.warehouse', true, reqUsername);
    }
};

export const update = async (req: Request, res: Response) => {
    const operation = 'WarehouseController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // รับ wh_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
    const wh_id = Number(req.params.wh_id);
    if (!wh_id || isNaN(Number(wh_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {

        const data: Partial<WarehouseModel> = DataSanitizer.fromObject<WarehouseModel>(req.body, WarehouseModel);
        data.update_by = reqUsername;

        // เรียกใช้ service สำหรับการอัปเดตข้อมูล warehouse
        const response = await warehouseService.update(wh_id, data, reqUsername);

        // ส่งผลลัพธ์ที่ได้จาก service กลับไปยัง client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.warehouse', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'WarehouseController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const wh_id = Number(req.params.wh_id);
    if (!wh_id || isNaN(Number(wh_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ service สำหรับลบ warehouse
        const response = await warehouseService.delete(wh_id, reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.warehouse', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'WarehouseController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        const response = await warehouseService.getAll();

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.warehouse', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'WarehouseController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const wh_id = Number(req.params.wh_id);
    if (!wh_id || isNaN(Number(wh_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.wh_id:', wh_id);

        const response = await warehouseService.getById(wh_id);

        return ResponseUtils.handleResponse(res, response);
        

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.warehouse', true, reqUsername);
    }
};

export const getWhDropdown = async (req: Request, res: Response) => {
    const operation = 'WarehouseController.getWhDropdown';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const fty_id = Number(req.params.fty_id);
    if (!fty_id || isNaN(Number(fty_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        const response = await warehouseService.getWhDropdown(fty_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.warehouse', true, reqUsername);
    }
};

export const getWhDropdownByFtyId = async (req: Request, res: Response) => {
    const operation = 'WarehouseController.getWhDropdownByFtyId';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const user_id = RequestUtils.getUserIdToken(req, res);
    if (!user_id) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequired('user_id'));
    }

    const fty_id = Number(req.params.fty_id);
    if (!fty_id || isNaN(fty_id)) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        const response = await warehouseService.getWhDropdownByFtyId(user_id, fty_id);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.warehouse', true, reqUsername);
    }
};

export const getWhTypeDropdown = async (req: Request, res: Response) => {
    const operation = 'WarehouseController.getWhTypeDropdown';

    // ดึง username จาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        // เรียกใช้ Service เพื่อดึงข้อมูล
        const response = await warehouseService.getWhTypeDropdown();

        // ส่ง response กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.warehouse', true, reqUsername);
    }
}

export const createJson = async (req: Request, res: Response) => {
    const operation = 'WarehouseController.createJson';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log(`[${operation}] Raw req.body:`, req.body);

        // ✅ ตรวจสอบว่ามีข้อมูล
        if (!req.body || (Array.isArray(req.body) && req.body.length === 0)) {
            return ResponseUtils.handleBadRequest(res, lang.msg('No data provided.'));
        }

        // ✅ รับข้อมูลและแปลงให้เป็น Array (รองรับทั้ง Object และ Array)
        const requestData = Array.isArray(req.body) ? req.body : [req.body];

        const response = await warehouseService.createJson(requestData, reqUsername);
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`❌ Error during ${operation}:`, error);
        return ResponseUtils.handleError(res, operation, error.message, 'importing warehouse', true, reqUsername);
    }
};