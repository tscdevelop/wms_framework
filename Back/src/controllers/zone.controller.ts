import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { ZoneModel } from '../models/zone.model';
import { ZoneService } from '../services/zone.service';

dotenv.config();

const zoneService = new ZoneService();

export const create = async (req: Request, res: Response) => {
    const operation = 'ZoneController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<ZoneModel> = DataSanitizer.fromObject<ZoneModel>(req.body, ZoneModel);
        data.create_by = reqUsername;

        const response = await zoneService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.zone', true, reqUsername);
    }
};

export const update = async (req: Request, res: Response) => {
    const operation = 'ZoneController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // รับ zn_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
    const zn_id = Number(req.params.zn_id);
    if (!zn_id || isNaN(Number(zn_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }
    
    try {
        
        const data: Partial<ZoneModel> = DataSanitizer.fromObject<ZoneModel>(req.body, ZoneModel);
        data.update_by = reqUsername;

        // เรียกใช้ service สำหรับการอัปเดตข้อมูล factory
        const response = await zoneService.update(zn_id, data, reqUsername);

        // ส่งผลลัพธ์ที่ได้จาก service กลับไปยัง client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.zone', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'ZoneController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const zn_id = Number(req.params.zn_id);
    if (!zn_id || isNaN(Number(zn_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ service สำหรับลบ zone
        const response = await zoneService.delete(zn_id, reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.zone', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'ZoneController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await zoneService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.zone', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'ZoneController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const zn_id = Number(req.params.zn_id);
    if (!zn_id || isNaN(Number(zn_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.zn_id:', zn_id);

        const response = await zoneService.getById(zn_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.zone', true, reqUsername);
    }
};

export const getZnDropdown = async (req: Request, res: Response) => {
    const operation = 'ZoneController.getZnDropdown';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // ดึงพารามิเตอร์ wh_id จาก path
    const wh_id = Number(req.params.wh_id);

    // ตรวจสอบว่าพารามิเตอร์มีค่า
    if (!wh_id || isNaN(wh_id)) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequired('wh_id'));
    }

    try {
        // เรียก service พร้อมส่ง fty_id และ wh_id
        const response = await zoneService.getZnDropdown(wh_id);

        // ส่ง response กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation} with wh_id ${wh_id}:`, error);
        // จัดการ error และส่ง response กลับ
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.zone', true, reqUsername);
    }
};

export const createJson = async (req: Request, res: Response) => {
    const operation = 'ZoneController.createJson';

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

        const response = await zoneService.createJson(requestData, reqUsername);
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`❌ Error during ${operation}:`, error);
        return ResponseUtils.handleError(res, operation, error.message, 'importing zone', true, reqUsername);
    }
};