import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { AccessService } from '../services/access.service';

dotenv.config();

const accessService = new AccessService();

export const create = async (req: Request, res: Response) => {
    const operation = 'AccessService.create';

    // ตรวจสอบ username จาก Token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, 'Username is required.');
    }

    try {
        const { user_id, fty_ids, wh_ids } = req.body;

        // Validation: ตรวจสอบว่า user_id, fty_ids และ wh_ids ถูกต้องหรือไม่
        if (!user_id) {
            return ResponseUtils.handleBadRequest(res, 'User ID is required.');
        }
        if (!fty_ids || !Array.isArray(fty_ids) || fty_ids.length === 0) {
            return ResponseUtils.handleBadRequest(res, 'Factory IDs must be a non-empty array.');
        }
        if (!wh_ids || !Array.isArray(wh_ids) || wh_ids.length === 0) {
            return ResponseUtils.handleBadRequest(res, 'Warehouse IDs must be a non-empty array.');
        }

        // เรียก Service เพื่อบันทึกข้อมูล
        const response = await accessService.create(user_id, fty_ids, wh_ids);

        // ส่ง Response กลับไป
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // จัดการ Error
        console.error(`Error during ${operation}:`, error.message);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.factory_and_warehouse', true, reqUsername);
    }
};

export const searchWarehouse = async (req: Request, res: Response) => {
    const operation = 'AccessController.searchWarehouse';

    try {
        // ดึง user_id จาก query string (optional)
        const userId = parseInt(req.query.user_id as string, 10);

        // ดึง fty_ids จาก query string และแปลงเป็น array ของตัวเลข
        const ftyIds = req.query.fty_ids
            ? (req.query.fty_ids as string).split(',').map((id) => parseInt(id.trim(), 10))
            : [];

        if (!ftyIds || ftyIds.some(isNaN)) {
            return ResponseUtils.handleBadRequest(res, 'Invalid fty_ids format.');
        }

        // เรียก Service โดยส่ง fty_ids
        const response = await accessService.searchWarehouse(ftyIds);

        // ส่ง Response
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error.message);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'warehouse.list', true);
    }
};


export const getByUserId = async (req: Request, res: Response) => {
    const operation = 'AccessController.getByUserId';

    try {
        // ดึง user_id จาก Path Parameter
        const userId = parseInt(req.params.user_id, 10);

        if (!userId || isNaN(userId)) {
            return ResponseUtils.handleBadRequest(res, 'User ID is required and must be a number.');
        }

        const response = await accessService.getByUserId(userId);

        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error.message);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'checked factories', true);
    }
};

export const getFtyByUserId = async (req: Request, res: Response) => {
    const operation = 'AccessController.getFtyByUserId';

    try {
        // ดึง user_id จาก Path Parameter
        const userId = parseInt(req.params.user_id, 10);

        // ตรวจสอบว่า userId มีค่าและเป็นตัวเลขหรือไม่
        if (!userId || isNaN(userId)) {
            return ResponseUtils.handleBadRequest(res, lang.msgRequired('field.user_id'));
        }

        // เรียกใช้งาน Service
        const response = await accessService.getFtyByUserId(userId);

        // ตรวจสอบผลลัพธ์ ถ้าไม่พบข้อมูล
        if (!response.isCompleted || !response.data || response.data.length === 0) {
            return ResponseUtils.handleBadRequest(res, lang.msgNotFound('factory.fty_id'));
        }

        // ส่งข้อมูลกลับ
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error.message);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'checked factories', true);
    }
};
