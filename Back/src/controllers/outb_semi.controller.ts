import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { OutbSemiModel } from '../models/outb_semi.model';
import { OutbSemiService } from '../services/outb_semi.service';
import { ApprovalStatus } from '../common/global.enum';

import { ExcelService } from '../services/export_excel.service';
import { mapApprovalStatus, mapShipmentStatus, mapWithdrawStatus } from '../utils/StatusMapper';
import { ApiResponse } from '../models/api-response.model';
import { applyFilters } from '../utils/ExportExcelUtils';

dotenv.config();

const outbsemiService = new OutbSemiService();

export const create = async (req: Request, res: Response) => {
    const operation = 'OutbSemiController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<OutbSemiModel> = DataSanitizer.fromObject<OutbSemiModel>(req.body, OutbSemiModel);
        data.create_by = reqUsername;

        const response = await outbsemiService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.outbsemi', true, reqUsername);
    }
};

export const withdrScan = async (req: Request, res: Response) => {
    const operation = 'OutbSemiController.withdrScan';
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    const { outbsemi_id } = req.params;
    const { items } = req.body;

    if (!reqUsername || !outbsemi_id || !Array.isArray(items) || items.length === 0) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        const outbsemiIdNumber = Number(outbsemi_id);

        const response = await outbsemiService.withdrScan(outbsemiIdNumber, items, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.outbsemi', true, reqUsername);
    }
};

export const shipmtScan = async (req: Request, res: Response) => {
    const operation = 'OutbSemiController.shipmtScan';
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    const { outbsemi_id } = req.params;
    const { items } = req.body;

    if (!reqUsername || !outbsemi_id || !Array.isArray(items) || items.length === 0) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        const outbsemiIdNumber = Number(outbsemi_id);

        const response = await outbsemiService.shipmtScan(outbsemiIdNumber, items, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.outbsemi', true, reqUsername);
    }
};


export const update = async (req: Request, res: Response) => {
    const operation = 'OutbSemiController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }
    
    try {
        
        // รับ outbsemi_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
        const outbsemi_id = Number(req.params.outbsemi_id);
        if (!outbsemi_id || isNaN(Number(outbsemi_id))) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        const data: Partial<OutbSemiModel> = DataSanitizer.fromObject<OutbSemiModel>(req.body, OutbSemiModel);
        data.update_by = reqUsername;

        // เรียกใช้ service สำหรับการอัปเดตข้อมูล factory
        const response = await outbsemiService.update(outbsemi_id, data, reqUsername);

        // ส่งผลลัพธ์ที่ได้จาก service กลับไปยัง client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.outbsemi', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'OutbSemiController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const outbsemi_id = Number(req.params.outbsemi_id);
    if (!outbsemi_id || isNaN(Number(outbsemi_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ service สำหรับลบ location
        const response = await outbsemiService.delete(outbsemi_id, reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.outbsemi', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'OutbSemiController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        // รับค่า approvalStatus จาก query parameter (เช่น /api/getAll?approvalStatus=APPROVED)
        const { approvalStatus, returnedStatus } = req.query;
        let approvalStatusValue: ApprovalStatus | undefined;
        let filterReturnedStatus: boolean | undefined;

        // ตรวจสอบค่า approvalStatus
        if (typeof approvalStatus === 'string') {
            const statusStr = approvalStatus.trim().toUpperCase(); // ตัดช่องว่างและเปลี่ยนเป็น uppercase

            // ตรวจสอบว่าค่าอยู่ใน Enum ApprovalStatus หรือไม่
            if (Object.values(ApprovalStatus).includes(statusStr as unknown as ApprovalStatus)) {
                approvalStatusValue = statusStr as ApprovalStatus;
            } else {
                return ResponseUtils.handleErrorGet(
                    res,
                    operation,
                    `Invalid approvalStatus value. Accepted values: ${Object.values(ApprovalStatus).join(', ')}`,
                    'item.outbsemi',
                    true,
                    reqUsername
                );
            }
        }

        // ตรวจสอบค่า returnedStatus ให้เป็น boolean (true/false)
        if (typeof returnedStatus === 'string') {
            filterReturnedStatus = returnedStatus.trim().toLowerCase() === 'true';
        }
    
        // เรียกใช้ Service พร้อมส่ง approvalStatus และ filterReturnedStatus ที่ผ่านการตรวจสอบแล้ว
        const response = await outbsemiService.getAll(approvalStatusValue, filterReturnedStatus);
        
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.outbsemi', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'OutbSemiController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const outbsemi_id = Number(req.params.outbsemi_id);
    if (!outbsemi_id || isNaN(Number(outbsemi_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.outbsemi_id:', outbsemi_id);

        const response = await outbsemiService.getById(outbsemi_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.outbsemi', true, reqUsername);
    }
};

export const getReqByID = async (req: Request, res: Response) => {
    const operation = 'OutbSemiController.getReqByID';

    // ดึง username จาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // ตรวจสอบและดึง outbsemi_id จาก params
    const outbsemi_id = Number(req.params.outbsemi_id);
    if (!outbsemi_id || isNaN(Number(outbsemi_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.outbsemi_id:', outbsemi_id);

        // เรียก service getReqByID เพื่อดึงข้อมูล
        const response = await outbsemiService.getReqByID(outbsemi_id);

        // ส่ง response กลับ
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.outbsemi', true, reqUsername);
    }
};

export const updateDates = async (req: Request, res: Response) => {
    const operation = 'OutbSemiController.updateDates';

    // ดึง username จาก Token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        console.log('Raw req.body:', req.body);

        // รับ `outbsemi_id` จาก `params`
        const outbsemi_id = Number(req.params.outbsemi_id);

        // รับค่าจาก `multipart/form-data`
        const { withdr_date, shipmt_date } = req.body;

        // ตรวจสอบ `outbsemi_id`
        if (!outbsemi_id || isNaN(outbsemi_id)) {
            return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
        }

        // เรียกใช้ Service สำหรับอัปเดตข้อมูล
        const response = await outbsemiService.updateDates(outbsemi_id, { withdr_date, shipmt_date });

        // ส่งผลลัพธ์กลับไปยัง Client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.outbsemi', true, reqUsername);
    }
};

export const exportAllToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Outbound_Semi_Finished_Goods_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ ดึงค่า filter จาก query string
        const filters = {
            formatted_date: req.query.formatted_date ? String(req.query.formatted_date).trim().normalize("NFC") : undefined, 
            create_time: req.query.create_time ? String(req.query.create_time).trim() : undefined,
            outbsemi_code: req.query.outbsemi_code ? String(req.query.outbsemi_code).trim().normalize("NFC") : undefined,
            outbsemi_details: req.query.outbsemi_details ? String(req.query.outbsemi_details).trim().normalize("NFC") : undefined,
            outbsemi_appr_status: req.query.outbsemi_appr_status ? String(req.query.outbsemi_appr_status).trim().normalize("NFC") : undefined,
            outbsemiitm_withdr_status: req.query.outbsemiitm_withdr_status ? String(req.query.outbsemiitm_withdr_status).trim().normalize("NFC") : undefined,
            outbsemiitm_shipmt_status: req.query.outbsemiitm_shipmt_status ? String(req.query.outbsemiitm_shipmt_status).trim().normalize("NFC") : undefined
        };
        console.log('✅ Filters:', filters);

        // ✅ ดึงข้อมูลทั้งหมดจาก `outbsemiService`
        const response = await outbsemiService.getAll();
        console.log('✅ Data retrieved from outbsemiService:', response);

        // ✅ ตรวจสอบว่ามีข้อมูลหรือไม่
        if (!response.isCompleted || !response.Data || response.Data.length === 0) {
            console.log('❌ No data found for export.');
            return ResponseUtils.handleCustomResponse(res, response, HttpStatus.NOT_FOUND);
        }

        // ✅ ใช้ applyFilters() เพื่อเอาข้อมูลที่ filters
        const filteredData = applyFilters(response.Data, filters);
        console.log(`✅ Filtered data count: ${filteredData.length} rows`);

        if (filteredData.length === 0) {
            return ResponseUtils.handleCustomResponse(res, new ApiResponse({
                isCompleted: false,
                message: 'No data found after filtering.',
            }), HttpStatus.NOT_FOUND);
        }

        // ✅ เพิ่มข้อมูลที่จะ export to ecxel โดยดึงข้อมูลจากฐานข้อมูล
        const extraData = [
            { title: 'รายงานเบิกสินค้ากึ่งสำเร็จรูปทั้งหมด', row: 3, col: 1 ,colspan:3, horizontal: 'left'},
            { title: 'วันที่พิมพ์', key: 'today_date', row: 3, col: 7 ,colspan: 1}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'วันที่', key: 'formatted_date', col: 2},
                { title: 'เวลา', key: 'create_time', col: 3},
                { title: 'เลขใบเบิก', key: 'outbsemi_code', col: 4},
                { title: 'รายละเอียด', key: 'outbsemi_details', col: 5},
                { title: 'สถานะอนุมัติ', key: 'outbsemi_appr_status', col: 6},
                { title: 'สถานะเบิก', key: 'outbsemiitm_withdr_status', col: 7},
                { title: 'สถานะจัดส่ง', key: 'outbsemiitm_shipmt_status', col: 8}
            ],
            startRow: 6 // ✅ ถ้ามี Sub-Header ให้เริ่มที่แถว 5
        };

        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any ,index: number) => ({
            no: index + 1,
            formatted_date: item.formatted_date,
            create_time: item.create_time,
            today_date: item.today_date,
            outbsemi_code: item.outbsemi_code,
            outbsemi_details: item.outbsemi_details,
            outbsemi_appr_status: mapApprovalStatus(item.outbsemi_appr_status),
            outbsemiitm_withdr_status: mapWithdrawStatus(item.outbsemiitm_withdr_status),
            outbsemiitm_shipmt_status: mapShipmentStatus(item.outbsemiitm_shipmt_status)
        }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        await ExcelService.exportToExcel(excelStructure, excelData, [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 14,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting Outbound Semi Finished Goods to Excel:', error);
        return ResponseUtils.handleError(res, 'exportAllToExcel', error.message, 'exporting outbound semi finished goods');
    }
};
