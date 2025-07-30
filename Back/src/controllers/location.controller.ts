import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { LocationModel } from '../models/location.model';
import { LocationService } from '../services/location.service';

dotenv.config();

const locationService = new LocationService();

export const create = async (req: Request, res: Response) => {
    const operation = 'LocationController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<LocationModel> = DataSanitizer.fromObject<LocationModel>(req.body, LocationModel);
        data.create_by = reqUsername;

        const response = await locationService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.location', true, reqUsername);
    }
};

export const update = async (req: Request, res: Response) => {
    const operation = 'LocationController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }
            
    // รับ loc_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
    const loc_id = Number(req.params.loc_id);
    if (!loc_id || isNaN(Number(loc_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {

        const data: Partial<LocationModel> = DataSanitizer.fromObject<LocationModel>(req.body, LocationModel);
        data.update_by = reqUsername;

        // เรียกใช้ service สำหรับการอัปเดตข้อมูล factory
        const response = await locationService.update(loc_id, data, reqUsername);

        // ส่งผลลัพธ์ที่ได้จาก service กลับไปยัง client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.location', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'LocationController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const loc_id = Number(req.params.loc_id);
    if (!loc_id || isNaN(Number(loc_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ service สำหรับลบ location
        const response = await locationService.delete(loc_id, reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.location', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'LocationController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await locationService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.location', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'LocationController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const loc_id = Number(req.params.loc_id);
    if (!loc_id || isNaN(Number(loc_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.loc_id:', loc_id);

        const response = await locationService.getById(loc_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.location', true, reqUsername);
    }
};

export const getLocDropdown = async (req: Request, res: Response) => {
    const operation = 'LocationController.getLocDropdown';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // ดึงพารามิเตอร์จาก path
    const zn_id = Number(req.params.zn_id);

    // ตรวจสอบว่าพารามิเตอร์มีค่าที่ถูกต้อง
    if (!zn_id || isNaN(zn_id)) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequired('zn_id'));
    }

    try {

        // เรียก Service พร้อมส่งพารามิเตอร์
        const response = await locationService.getLocDropdown(zn_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.location', true, reqUsername);
    }
};


export const createJson = async (req: Request, res: Response) => {
    const operation = 'LocationController.createJson';

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

        const response = await locationService.createJson(requestData, reqUsername);
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`❌ Error during ${operation}:`, error);
        return ResponseUtils.handleError(res, operation, error.message, 'importing location', true, reqUsername);
    }
};

