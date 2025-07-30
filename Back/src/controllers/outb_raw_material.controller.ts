import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { OutbRawMaterialModel } from '../models/outb_raw_material.model';
import { OutbRawMaterialService } from '../services/outb_raw_material.service';
import { ApprovalStatus } from '../common/global.enum';

import { ExcelService } from '../services/export_excel.service';
import { mapApprovalStatus, mapWithdrawStatus } from '../utils/StatusMapper';
import { applyFilters } from '../utils/ExportExcelUtils';
import { ApiResponse } from '../models/api-response.model';

dotenv.config();

const outbrawmaterialService = new OutbRawMaterialService();

export const create = async (req: Request, res: Response) => {
    const operation = 'OutRawMaterialController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<OutbRawMaterialModel> = DataSanitizer.fromObject<OutbRawMaterialModel>(req.body, OutbRawMaterialModel);
        data.create_by = reqUsername;

        const response = await outbrawmaterialService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);

        // ส่ง response ข้อผิดพลาดกลับ
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.outbrm', true, reqUsername);
    }
};

export const update = async (req: Request, res: Response) => {
    const operation = 'OutbRawMaterialController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        // รับ outbrm_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
        const outbrm_id = Number(req.params.outbrm_id);
        if (!outbrm_id || isNaN(Number(outbrm_id))) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        const data: Partial<OutbRawMaterialModel> = DataSanitizer.fromObject<OutbRawMaterialModel>(req.body, OutbRawMaterialModel);
        data.update_by = reqUsername;

        // ✅ เรียกใช้งาน service update
        const response = await outbrawmaterialService.update(outbrm_id, data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: unknown) {
        console.error(`Error during ${operation}:`, error);

        // ✅ ป้องกัน error ที่อาจไม่ใช่ instance ของ `Error`
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return ResponseUtils.handleErrorUpdate(res, operation, errorMessage, 'item.outbrm', true, reqUsername);
    }
};
export const withdrScan = async (req: Request, res: Response) => {
    const operation = 'OutbRawMaterialController.withdrScan';
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    const { outbrm_id } = req.params;
    const { items } = req.body;

    if (!reqUsername || !outbrm_id || !Array.isArray(items) || items.length === 0) {
    return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
    const outbrmIdNumber = Number(outbrm_id);

    // ส่งไปให้ service ตรวจสอบรายละเอียดและดำเนินการ
    const response = await outbrawmaterialService.withdrScan(outbrmIdNumber, items, reqUsername);

    return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
    console.error(`Error during ${operation}:`, error);
    return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.outbrm', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'OutRawMaterialController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // 🔹 แปลง outbrm_id จาก params และตรวจสอบค่าที่ถูกต้อง
    const outbrm_id = Number(req.params.outbrm_id);
    if (!outbrm_id || isNaN(outbrm_id)) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // 🔹 เรียกใช้ service สำหรับลบ Outbound RM
        const response = await outbrawmaterialService.delete(outbrm_id, reqUsername);

        // 🔹 ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.factory', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'OutRawMaterialController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        // รับค่า approvalStatus จาก query parameter (เช่น /api/getAll?approvalStatus=APPROVED)
        const { approvalStatus } = req.query;
        let approvalStatusValue: ApprovalStatus | undefined;

        // ตรวจสอบค่า approvalStatus (เฉพาะ string เท่านั้น)
        if (typeof approvalStatus === 'string') {
            const statusStr = approvalStatus.trim().toUpperCase(); // ลบช่องว่าง และทำเป็น uppercase

            // ตรวจสอบว่าค่าอยู่ใน Enum ApprovalStatus หรือไม่
            if (Object.values(ApprovalStatus).includes(statusStr as unknown as ApprovalStatus)) {
                approvalStatusValue = statusStr as ApprovalStatus;
            } else {
                return ResponseUtils.handleErrorGet(
                    res,
                    operation,
                    `Invalid approvalStatus value. Accepted values: ${Object.values(ApprovalStatus).join(', ')}`,
                    'item.outbrm',
                    true,
                    reqUsername
                );
            }
        }

        // เรียกใช้งาน service พร้อมส่ง approvalStatusValue (undefined หมายถึงดึงข้อมูลทั้งหมด)
        const response = await outbrawmaterialService.getAll(approvalStatusValue);

        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.outbrm', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'OutRawMaterialController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const outbrm_id = Number(req.params.outbrm_id);
    if (!outbrm_id || isNaN(Number(outbrm_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.outbrm_id:', outbrm_id);

        const response = await outbrawmaterialService.getById(outbrm_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.outbrm', true, reqUsername);
    }
};

export const getReqByID = async (req: Request, res: Response) => {
    const operation = 'OutRawMaterialController.getReqByID';

    // ดึง username จาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // ตรวจสอบและดึง outbrm_id จาก params
    const outbrm_id = Number(req.params.outbrm_id);
    if (!outbrm_id || isNaN(Number(outbrm_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.outbrm_id:', outbrm_id);

        // เรียก service getReqByID เพื่อดึงข้อมูล
        const response = await outbrawmaterialService.getReqByID(outbrm_id);

        // ส่ง response กลับ
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.outbrm', true, reqUsername);
    }
};


export const updateDates = async (req: Request, res: Response) => {
    const operation = 'OutbFinishedGoodsController.updateDates';

    // ดึง username จาก Token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        console.log('Raw req.body:', req.body);

        // รับ `outbrm_id` จาก `params`
        const outbrm_id = Number(req.params.outbrm_id);

        // รับค่าจาก `multipart/form-data`
        const { withdr_date} = req.body;

        // ตรวจสอบ `outbrm_id`
        if (!outbrm_id || isNaN(outbrm_id)) {
            return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
        }

        // เรียกใช้ Service สำหรับอัปเดตข้อมูล
        const response = await outbrawmaterialService.updateDates(outbrm_id, { withdr_date});

        // ส่งผลลัพธ์กลับไปยัง Client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.outbrm', true, reqUsername);
    }
};

export const exportAllToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Outbound_Raw_Material_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ ดึงค่า filter จาก query string
        const filters = {
            formatted_date: req.query.formatted_date ? String(req.query.formatted_date).trim().normalize("NFC") : undefined, 
            create_time: req.query.create_time ? String(req.query.create_time).trim() : undefined,
            outbrm_code: req.query.outbrm_code ? String(req.query.outbrm_code).trim().normalize("NFC") : undefined,
            outbrm_details: req.query.outbrm_details ? String(req.query.outbrm_details).trim().normalize("NFC") : undefined,
            outbrm_appr_status: req.query.outbrm_appr_status ? String(req.query.outbrm_appr_status).trim().normalize("NFC") : undefined,
            outbrmitm_withdr_status: req.query.outbrmitm_withdr_status ? String(req.query.outbrmitm_withdr_status).trim().normalize("NFC") : undefined
        };
        console.log('✅ Filters:', filters);
        
        const response = await outbrawmaterialService.getAll();
        console.log('✅ Data retrieved from outbrawmaterialService:', response);

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
            { title: 'รายงานเบิกวัตถุดิบทั้งหมด', row: 3, col: 1 ,colspan:3, horizontal: 'left'},
            { title: 'วันที่พิมพ์', key: 'today_date', row: 3, col: 6 ,colspan: 1}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure: any = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'วันที่', key: 'formatted_date', col: 2, colspan: 1 },
                { title: 'เวลา', key: 'create_time', col: 3, colspan: 1 },
                { title: 'เลขที่ใบเบิก', key: 'outbrm_code', col: 4, colspan: 1 },
                { title: 'รายละเอียด', key: 'outbrm_details', col: 5, colspan: 1 },
                { title: 'สถานะอนุมัติ', key: 'outbrm_appr_status', col: 6, colspan: 1 },
                { title: 'สถานะเบิก', key: 'outbrmitm_withdr_status', col: 7, colspan: 1 }
            ],
            startRow: 6 // ✅ ถ้ามี Sub-Header ให้เริ่มที่แถว 5
        };
        
        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any ,index: number) => ({
            no: index + 1,
            formatted_date: item.formatted_date,
            create_time: item.create_time,
            today_date: item.today_date,
            outbrm_code: item.outbrm_code,
            outbrm_details: item.outbrm_details,
            outbrm_appr_status: mapApprovalStatus(item.outbrm_appr_status), // ✅ แปลงค่าสถานะ
            outbrmitm_withdr_status: mapWithdrawStatus(item.outbrmitm_withdr_status) // ✅ แปลงค่าสถานะ
        }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        await ExcelService.exportToExcel(excelStructure, excelData, [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 14,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting Outbound Raw Material to Excel:', error);
        return ResponseUtils.handleError(res, 'exportAllToExcel', error.message, 'exporting outbound Raw Material');
    }
};




