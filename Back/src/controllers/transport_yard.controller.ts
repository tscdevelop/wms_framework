import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { TspYardModel } from '../models/transport_yard.model';
import { TransportYardService } from '../services/transport_yard.service';

dotenv.config();

const transportyardService = new TransportYardService();

export const create = async (req: Request, res: Response) => {
    const operation = 'TransportYardController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<TspYardModel> = DataSanitizer.fromObject<TspYardModel>(req.body, TspYardModel);
        data.create_by = reqUsername;

        const response = await transportyardService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.tspyard', true, reqUsername);
    }
};

export const update = async (req: Request, res: Response) => {
    const operation = 'TransportYardController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // รับ tspyard_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
    const tspyard_id = Number(req.params.tspyard_id); //ระบุดึง tspyard_id
    if (!tspyard_id || isNaN(Number(tspyard_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {

        const data: Partial<TspYardModel> = DataSanitizer.fromObject<TspYardModel>(req.body, TspYardModel);
        data.update_by = reqUsername;

        // เรียกใช้ service สำหรับการอัปเดตข้อมูล tspyard
        const response = await transportyardService.update(tspyard_id, data, reqUsername);

        // ส่งผลลัพธ์ที่ได้จาก service กลับไปยัง client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);

        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.tspyard', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'TransportYardController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const tspyard_id = Number(req.params.tspyard_id);
    if (!tspyard_id || isNaN(Number(tspyard_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ service สำหรับลบ tspyard
        const response = await transportyardService.delete(tspyard_id,reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.tspyard', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'TransportYardController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await transportyardService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.tspyard', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'TransportYardController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const tspyard_id = Number(req.params.tspyard_id);
    if (!tspyard_id || isNaN(Number(tspyard_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.tspyard_id:', tspyard_id);

        const response = await transportyardService.getById(tspyard_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.tspyard', true, reqUsername);
    }
};

export const getDYDropdown = async (req: Request, res: Response) => {
    const operation = 'TransportYardController.getDYDropdown';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {

        console.log('Raw req.body:', req.body);
    
        const response = await transportyardService.getDYDropdown();

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.tspyard', true, reqUsername);
    }
};

export const createJson = async (req: Request, res: Response) => {
    const operation = 'TransportYardController.createJson';

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

        const response = await transportyardService.createJson(requestData, reqUsername);
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`❌ Error during ${operation}:`, error);
        return ResponseUtils.handleError(res, operation, error.message, 'importing tspyard', true, reqUsername);
    }
};
