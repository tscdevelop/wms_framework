import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { FactoryModel } from '../models/factory.model';
import { FactoryService } from '../services/factory.service';

dotenv.config();

const factoryService = new FactoryService();

export const create = async (req: Request, res: Response) => {
    const operation = 'FactoryController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        console.log(`[${operation}] Raw req.body:`, req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<FactoryModel> = DataSanitizer.fromObject<FactoryModel>(req.body, FactoryModel);
        data.create_by = reqUsername;

        // เรียก Service
        const response = await factoryService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);

        // จัดการ Error ให้ละเอียดขึ้น
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.factory', true, reqUsername);
    }
};

export const update = async (req: Request, res: Response) => {
    const operation = 'FactoryController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // รับ fty_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
    const fty_id = Number(req.params.fty_id); //ระบุดึง fty_id
    if (!fty_id || isNaN(Number(fty_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {

        const data: Partial<FactoryModel> = DataSanitizer.fromObject<FactoryModel>(req.body, FactoryModel);
        data.update_by = reqUsername;

        // เรียกใช้ service สำหรับการอัปเดตข้อมูล factory
        const response = await factoryService.update(fty_id, data, reqUsername);

        // ส่งผลลัพธ์ที่ได้จาก service กลับไปยัง client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.factory', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'FactoryController.delete';

    // ดึงชื่อผู้ใช้งานจาก Token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // ตรวจสอบพารามิเตอร์ fty_id
    const fty_id = Number(req.params.fty_id);
    if (!fty_id || isNaN(fty_id)) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ Service สำหรับลบ factory
        const response = await factoryService.delete(fty_id, reqUsername);

        // ส่งผลลัพธ์กลับไปยัง Client โดยไม่ต้องเช็ค isCompleted
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // จัดการ Error และส่งกลับไปยัง Client
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.factory', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'FactoryController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        const response = await factoryService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.factory', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'FactoryController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const fty_id = Number(req.params.fty_id);
    if (!fty_id || isNaN(fty_id)) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        const response = await factoryService.getById(fty_id);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation} with fty_id ${fty_id}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.factory', true, reqUsername);
    }
};

export const getFtyDropdown = async (req: Request, res: Response) => {
    const operation = 'FactoryController.getFtyDropdown';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        const response = await factoryService.getFtyDropdown();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.factory', true, reqUsername);
    }
};

export const getFtyDropdownByUserId = async (req: Request, res: Response) => {
    const operation = 'FactoryController.getFtyDropdownByUserId';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const user_id = Number(req.params.user_id);
    if (!user_id || isNaN(user_id)) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequired('user_id'));
    }

    try {
        const response = await factoryService.getFtyDropdownByUserId(user_id);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation} with user_id ${user_id}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.factory', true, reqUsername);
    }
};

export const createJson = async (req: Request, res: Response) => {
    const operation = 'FactoryController.createJson';

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

        const response = await factoryService.createJson(requestData, reqUsername);
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`❌ Error during ${operation}:`, error);
        return ResponseUtils.handleError(res, operation, error.message, 'importing factories', true, reqUsername);
    }
};


