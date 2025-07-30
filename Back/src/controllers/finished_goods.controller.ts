import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { FinishedGoodsModel } from '../models/finished_goods.model'; 
import { FinishedGoodsService } from '../services/finished_goods.service'; 

dotenv.config();

const finishedGoodsService = new FinishedGoodsService();

export const create = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<FinishedGoodsModel> = DataSanitizer.fromObject<FinishedGoodsModel>(req.body, FinishedGoodsModel);
        data.create_by = reqUsername;

        const response = await finishedGoodsService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.finished_goods', true, reqUsername);
    }
};

export const update = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }
            
    // รับ fg_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
    const fg_id = Number(req.params.fg_id);
    if (!fg_id || isNaN(Number(fg_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        const data: Partial<FinishedGoodsModel> = DataSanitizer.fromObject<FinishedGoodsModel>(req.body, FinishedGoodsModel);
        data.update_by = reqUsername;

        // เรียกใช้ service สำหรับการอัปเดตข้อมูล factory
        const response = await finishedGoodsService.update(fg_id, data, reqUsername);

        // ส่งผลลัพธ์ที่ได้จาก service กลับไปยัง client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.finished_goods', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const fg_id = Number(req.params.fg_id); //ดึงทุกตัว
    if (!fg_id || isNaN(Number(fg_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ service สำหรับลบ finished_goods
        const response = await finishedGoodsService.delete(fg_id, reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.finished_goods', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const fg_id = Number(req.params.fg_id);
    if (!fg_id || isNaN(Number(fg_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.fg_id:', fg_id);

        const response = await finishedGoodsService.getById(fg_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.finished_goods', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await finishedGoodsService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.finished_goods', true, reqUsername);
    }
};

export const getFGDropdown = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsController.getFGDropdown';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        const response = await finishedGoodsService.getFGDropdown();

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.finished_goods', true, reqUsername);
    }
};

export const createJson = async (req: Request, res: Response) => {
    const operation = 'FinishedGoodsController.createJson';

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

        const response = await finishedGoodsService.createJson(requestData, reqUsername);
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`❌ Error during ${operation}:`, error);
        return ResponseUtils.handleError(res, operation, error.message, 'importing finished goods type', true, reqUsername);
    }
};