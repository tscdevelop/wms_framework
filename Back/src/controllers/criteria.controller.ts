import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { CriteriaModel } from '../models/criteria.model';
import { CriteriaService } from '../services/criteria.service';

dotenv.config();

const criteriaService = new CriteriaService();

export const create = async (req: Request, res: Response) => {
    const operation = 'CriteriaController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<CriteriaModel> = DataSanitizer.fromObject<CriteriaModel>(req.body, CriteriaModel);
        data.create_by = reqUsername;

        const response = await criteriaService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.criteria', true, reqUsername);
    }
};

export const update = async (req: Request, res: Response) => {
    const operation = 'CriteriaController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // รับ crt_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
    const crt_id = Number(req.params.crt_id);
    if (!crt_id || isNaN(Number(crt_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }
    
    try {
        const data: Partial<CriteriaModel> = DataSanitizer.fromObject<CriteriaModel>(req.body, CriteriaModel);
        data.update_by = reqUsername;

        // เรียกใช้ service สำหรับการอัปเดตข้อมูล factory
        const response = await criteriaService.update(crt_id, data, reqUsername);

        // ส่งผลลัพธ์ที่ได้จาก service กลับไปยัง client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.criteria', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'CriteriaController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const crt_id = Number(req.params.crt_id);
    if (!crt_id || isNaN(Number(crt_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ service สำหรับลบ raw_material
        const response = await criteriaService.delete(crt_id, reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.criteria', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'CriteriaController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await criteriaService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.criteria', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'CriteriaController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }
    const crt_id = Number(req.params.crt_id);
    if (!crt_id || isNaN(Number(crt_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.crt_id:', crt_id);

        const response = await criteriaService.getById(crt_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.criteria', true, reqUsername);
    }
};

export const getCrtDropdown = async (req: Request, res: Response) => {
    const operation = 'CriteriaController.getCrtDropdown';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        const response = await criteriaService.getCrtDropdown();

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.criteria', true, reqUsername);
    }
};


export const createJson = async (req: Request, res: Response) => {
    const operation = 'CriteriaController.createJson';

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

        const response = await criteriaService.createJson(requestData, reqUsername);
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`❌ Error during ${operation}:`, error);
        return ResponseUtils.handleError(res, operation, error.message, 'importing criteria', true, reqUsername);
    }
};