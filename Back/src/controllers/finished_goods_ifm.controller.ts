import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { FinishedGoodsIfmModel } from '../models/finished_goods_ifm.model';
import { FinishedGoodsIfmService } from '../services/finished_goods_ifm.service';

dotenv.config();

const finishedgoodsIfmService = new FinishedGoodsIfmService();

export const create = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsIfmController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<FinishedGoodsIfmModel> = DataSanitizer.fromObject<FinishedGoodsIfmModel>(req.body, FinishedGoodsIfmModel);
        data.create_by = reqUsername;

        const response = await finishedgoodsIfmService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.finished_goods_ifm', true, reqUsername);
    }
};

export const update = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsIfmController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // รับ fgifm_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
    const fgifm_id = Number(req.params.fgifm_id);
    if (!fgifm_id || isNaN(Number(fgifm_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }
    
    try {
        const data: Partial<FinishedGoodsIfmModel> = DataSanitizer.fromObject<FinishedGoodsIfmModel>(req.body, FinishedGoodsIfmModel);
        data.update_by = reqUsername;

        // เรียกใช้ service สำหรับการอัปเดตข้อมูล factory
        const response = await finishedgoodsIfmService.update(fgifm_id, data, reqUsername);

        // ส่งผลลัพธ์ที่ได้จาก service กลับไปยัง client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.finished_goods_ifm', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsIfmController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const fgifm_id = Number(req.params.fgifm_id);
    if (!fgifm_id || isNaN(Number(fgifm_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ service สำหรับลบ raw_material
        const response = await finishedgoodsIfmService.delete(fgifm_id, reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.finished_goods_ifm', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsIfmController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await finishedgoodsIfmService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.finished_goods_ifm', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsIfmController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }
    const fgifm_id = Number(req.params.fgifm_id);
    if (!fgifm_id || isNaN(Number(fgifm_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.fgifm_id:', fgifm_id);

        const response = await finishedgoodsIfmService.getById(fgifm_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.finished_goods_ifm', true, reqUsername);
    }
};

export const getFGIfmDropdown = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsIfmController.getFGIfmDropdown';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        const response = await finishedgoodsIfmService.getFGIfmDropdown();

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.finished_goods_ifm', true, reqUsername);
    }
};

export const createJson = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsIfmController.createJson';

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

        const response = await finishedgoodsIfmService.createJson(requestData, reqUsername);
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`❌ Error during ${operation}:`, error);
        return ResponseUtils.handleError(res, operation, error.message, 'importing finished goods', true, reqUsername);
    }
};