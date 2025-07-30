import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { NotifApprovalService } from '../services/notification.service';
import { ApprovalStatus } from '../common/global.enum';

dotenv.config();

const notifapprovalService = new NotifApprovalService();

export const approveRequest = async (req: Request, res: Response) => {
    const operation = 'NotificationController.approveRequest';

    // ดึง `username` จาก Token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        // ตรวจสอบ `notif_id` ว่าต้องเป็นตัวเลขที่ถูกต้อง
        const notif_id = Number(req.body.notif_id);
        if (Number.isNaN(notif_id) || notif_id <= 0) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }
        // ✅ ดึง user_id จาก Token (หรือระบบ auth ที่คุณใช้)
        const reqUserId = RequestUtils.getUserIdToken(req, res); // ✅ ต้องแน่ใจว่า getUserIdToken คืนค่า user_id
        if (!reqUserId) {
        return ResponseUtils.handleErrorGet(res, operation, 'User ID not found in token', 'user', true, reqUsername);
        }

        // ตรวจสอบ `approvalStatus` จาก req.body และแปลงเป็นตัวพิมพ์ใหญ่
        const approvalStatusInput = req.body.approvalStatus;
        if (!approvalStatusInput || typeof approvalStatusInput !== 'string') {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }
        const approvalStatus = approvalStatusInput.toUpperCase();

        // ตรวจสอบว่า approvalStatus ที่ได้รับอยู่ใน enum หรือไม่
        if (!Object.values(ApprovalStatus).includes(approvalStatus as ApprovalStatus)) {
            return ResponseUtils.handleBadRequestIsRequired(
                res,
                lang.msg(`Invalid approvalStatus value. Accepted values: ${Object.values(ApprovalStatus).join(', ')}`)
            );
        }

        // เรียกใช้งาน Service โดยส่ง approvalStatus (รองรับ APPROVED, REJECTED, PENDING หรืออื่นๆ ตามที่กำหนดใน enum)
        const response = await notifapprovalService.approveRequest(notif_id, approvalStatus as ApprovalStatus, reqUsername, reqUserId);

        // ส่ง Response กลับไปที่ Client
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // แสดง Error Log ช่วย Debug
        console.error(`❌ Error in ${operation}:`, error);

        // ส่ง Error Response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.request_details', true, reqUsername);
    }
};

export const searchRequestApproval = async (req: Request, res: Response) => { 
    const operation = 'NotificationController.searchRequestApproval';

    // ดึง username จาก Token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
         // ✅ ดึง user_id จาก Token (หรือระบบ auth ที่คุณใช้)
        const reqUserId = RequestUtils.getUserIdToken(req, res); // ✅ ต้องแน่ใจว่า getUserIdToken คืนค่า user_id
        if (!reqUserId) {
        return ResponseUtils.handleErrorGet(res, operation, 'User ID not found in token', 'user', true, reqUsername);
        }
        // อ่าน Query Parameters อย่างปลอดภัย
        const validStatuses = ['APPROVED', 'PENDING', 'REJECTED'];
        const approvalStatusParam = req.query.approvalStatus?.toString().trim().toUpperCase();
        
        // หาก approvalStatus ที่ส่งเข้ามาไม่อยู่ใน validStatuses ให้มองว่าไม่ได้ส่งมา
        const filters = {
            code: req.query.code?.toString().trim() || undefined,
            details: req.query.details?.toString().trim() || undefined,
            approvalStatus: approvalStatusParam && validStatuses.includes(approvalStatusParam)
                ? approvalStatusParam as ApprovalStatus 
                : undefined,
        };

        // เรียกใช้งาน Service
        const response = await notifapprovalService.searchRequestApproval(reqUserId, filters);

        // ส่ง Response กลับไปที่ Client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`❌ Error in ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.notif', true, reqUsername);
    }
};


export const getApprovalDetails = async (req: Request, res: Response) => {
    const operation = 'NotificationController.getApprovalDetails';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const notif_id = Number(req.params.notif_id);
        // ✅ ดึง user_id จาก Token (หรือระบบ auth ที่คุณใช้)
        const reqUserId = RequestUtils.getUserIdToken(req, res); // ✅ ต้องแน่ใจว่า getUserIdToken คืนค่า user_id
        if (!reqUserId) {
        return ResponseUtils.handleErrorGet(res, operation, 'User ID not found in token', 'user', true, reqUsername);
        }

        if (isNaN(notif_id)) {
            return ResponseUtils.handleErrorGet(res, operation, "Invalid notif_id", "notif.invalid_id", true, reqUsername);
        }

        const response = await notifapprovalService.getApprovalDetails(reqUserId, notif_id);

        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`❌ Error in ${operation}:`, error);
        return ResponseUtils.handleErrorGet(res, operation, error.message, "notif.error", true, reqUsername);
    }
};

export const getNotiOutbTLIsAppr = async (req: Request, res: Response) => {
    const operation = 'NotificationController.getNotiOutbTLIsAppr';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        // ✅ ดึง user_id จาก Token (หรือระบบ auth ที่คุณใช้)
        const reqUserId = RequestUtils.getUserIdToken(req, res); // ✅ ต้องแน่ใจว่า getUserIdToken คืนค่า user_id
        if (!reqUserId) {
        return ResponseUtils.handleErrorGet(res, operation, 'User ID not found in token', 'user', true, reqUsername);
        }
        
        const response = await notifapprovalService.getNotiOutbTLIsAppr(reqUserId);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'notif.error', true, reqUsername);
    }
};

export const getNotiMinimumStock = async (req: Request, res: Response) => {
    const operation = 'NotificationController.getNotiMinimumStock';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        // ✅ ดึง user_id จาก Token (หรือระบบ auth ที่คุณใช้)
        const reqUserId = RequestUtils.getUserIdToken(req, res); // ✅ ต้องแน่ใจว่า getUserIdToken คืนค่า user_id
        if (!reqUserId) {
        return ResponseUtils.handleErrorGet(res, operation, 'User ID not found in token', 'user', true, reqUsername);
        }
        
        const response = await notifapprovalService.getNotiMinimumStock(reqUserId);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'notif.error', true, reqUsername);
    }
};

export const getNotiShelfLife = async (req: Request, res: Response) => {
    const operation = 'NotificationController.getNotiShelfLife';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
         // ✅ ดึง user_id จาก Token (หรือระบบ auth ที่คุณใช้)
        const reqUserId = RequestUtils.getUserIdToken(req, res); // ✅ ต้องแน่ใจว่า getUserIdToken คืนค่า user_id
        if (!reqUserId) {
        return ResponseUtils.handleErrorGet(res, operation, 'User ID not found in token', 'user', true, reqUsername);
        }
        
        const response = await notifapprovalService.getNotiShelfLife(reqUserId);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'notif.error', true, reqUsername);
    }
};

export const getUnreadNotif = async (req: Request, res: Response) => {
    const operation = 'NotificationController.getUnreadNotif';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        // ✅ ดึง user_id จาก Token (หรือระบบ auth ที่คุณใช้)
        const reqUserId = RequestUtils.getUserIdToken(req, res); // ✅ ต้องแน่ใจว่า getUserIdToken คืนค่า user_id
        if (!reqUserId) {
        return ResponseUtils.handleErrorGet(res, operation, 'User ID not found in token', 'user', true, reqUsername);
        }
        
        const response = await notifapprovalService.getUnreadNotif(reqUserId);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'notif.error', true, reqUsername);
    }
};

