import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { OutbToolingModel } from '../models/outb_tooling.model';
import { OutbToolingService } from '../services/outb_tooling.service';

import { ExcelService } from '../services/export_excel.service';
import { mapApprovalStatus, mapReturnStatus } from '../utils/StatusMapper';
import { ApiResponse } from '../models/api-response.model';
import { applyFilters } from '../utils/ExportExcelUtils';

dotenv.config();

const outbtoolingService = new OutbToolingService();

export const create = async (req: Request, res: Response) => {
    const operation = 'OutbToolingController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

         // Sanitization ข้อมูลจาก req.body
        const data: Partial<OutbToolingModel> = DataSanitizer.fromObject<OutbToolingModel>(req.body, OutbToolingModel);
        data.create_by = reqUsername;

        // เรียก Service เพื่อประมวลผล
        const response = await outbtoolingService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.outbtl', true, reqUsername);
    }
};

export const update = async (req: Request, res: Response) => {
    const operation = 'OutbToolingController.update';
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    const { outbtl_id } = req.params;

    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    if (isNaN(Number(outbtl_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }    

    try {
        console.log('Raw req.body:', req.body);

        // รับ outbtl_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
        const outbtl_id = Number(req.params.outbtl_id);
        if (!outbtl_id || isNaN(Number(outbtl_id))) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        const data: Partial<OutbToolingModel> = DataSanitizer.fromObject<OutbToolingModel>(req.body, OutbToolingModel);
        data.update_by = reqUsername;

        // ส่งข้อมูล Header และ Items ไปยัง Service
        const response = await outbtoolingService.update(Number(outbtl_id), data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.outbtl', true, reqUsername);
    }
};



export const returnTooling = async (req: Request, res: Response) => {
    const operation = 'OutbToolingController.returnTooling';
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    const { id } = req.params;

    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    if (isNaN(Number(id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        const { outbtl_returned_by } = req.body;
        let items = req.body.items;
        console.log('Items received:', items);


        if (typeof items === 'string') {
            try {
                items = JSON.parse(items);
                if (!Array.isArray(items)) {
                    throw new Error();
                }
            } catch (error) {
                console.error('Invalid JSON format for items:', error);
                return ResponseUtils.handleBadRequest(res, lang.msg('Invalid JSON format for items'));
            }
        }

        if (!Array.isArray(items) || items.length === 0) {
            return ResponseUtils.handleBadRequest(res, lang.msgRequired('แนบรูปเครื่องมือและอุปกรณ์'));
        }

        // Validate and map items
        const validatedItems = items.map((item: any) => {
            if (!item.outbtlitm_id) {
                throw new Error(lang.msg(`Invalid data: missing outbtlitm_id`));
            }

            // if (item.outbtlitm_return_quantity === undefined || item.outbtlitm_return_quantity < 0) {
            //     throw new Error(lang.msg(`Invalid outbtlitm_return_quantity for outbtlitm_id: ${item.outbtlitm_id}`));
            // }
            console.log('outbtlitm_img', item.outbtlitm_img);
            return {
                outbtlitm_id: item.outbtlitm_id,
                outbtlitm_remark: item.outbtlitm_remark,
                outbtlitm_img: item.outbtlitm_img,
            };
            
        });

        // Map files to items
        const files = req.files as { [key: string]: Express.Multer.File[] };
        if (files) {
            for (const [key, fileArray] of Object.entries(files)) {
                const item = validatedItems.find((item) => item.outbtlitm_id.toString() === key);
                if (item && fileArray.length > 0) {
                    item.outbtlitm_img = fileArray[0].filename;
                }
            }
        }

        // Call service
        const response = await outbtoolingService.returnTooling(
            Number(id),
            { files, outbtl_returned_by, items: validatedItems },
            reqUsername
        );

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.outbtl', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'OutbToolingController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const outbtl_id = req.params.outbtl_id; //ดึงทุกตัว
    if (isNaN(Number(outbtl_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }    

    try {
        // เรียกใช้ service สำหรับลบ location
        const response = await outbtoolingService.delete(Number(outbtl_id), reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.outbtl', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'OutbToolingController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await outbtoolingService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.outbtl', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'OutbToolingController.getById';

    // ดึง username จาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // ตรวจสอบและดึง outbtl_id จาก params
    const outbtl_id = req.params.outbtl_id;
    if (isNaN(Number(outbtl_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }    

    try {
        console.log('Raw req.params.outbtl_id:', outbtl_id);

        // เรียก service getById เพื่อดึงข้อมูล
        const response = await outbtoolingService.getById(Number(outbtl_id));

        // ส่ง response กลับ
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.outbtl', true, reqUsername);
    }
};

export const getReqById = async (req: Request, res: Response) => {
    const operation = 'OutbToolingController.getReqById';

    // ดึง username จาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // ตรวจสอบและดึง outbtl_id จาก params
    const outbtl_id = req.params.outbtl_id;
    if (isNaN(Number(outbtl_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }    

    try {
        console.log('Raw req.params.outbtl_id:', outbtl_id);

        // เรียก service getReqById เพื่อดึงข้อมูล
        const response = await outbtoolingService.getReqById(Number(outbtl_id));

        // ส่ง response กลับ
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.outbtl', true, reqUsername);
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

        // รับ `outbtl_id` จาก `params`
        const outbtl_id = Number(req.params.outbtl_id);

        // รับค่าจาก `multipart/form-data`
        const { withdr_date} = req.body;

        // ตรวจสอบ `outbtl_id`
        if (!outbtl_id || isNaN(outbtl_id)) {
            return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
        }

        // เรียกใช้ Service สำหรับอัปเดตข้อมูล
        const response = await outbtoolingService.updateDates(outbtl_id, { withdr_date});

        // ส่งผลลัพธ์กลับไปยัง Client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.outbtl', true, reqUsername);
    }
};

export const exportAllToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Outbound_Tooling_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ ดึงค่า filter จาก query string
        const filters = {
            formatted_date: req.query.formatted_date ? String(req.query.formatted_date).trim().normalize("NFC") : undefined, 
            create_time: req.query.create_time ? String(req.query.create_time).trim() : undefined,
            return_date: req.query.return_date ? String(req.query.return_date).trim().normalize("NFC") : undefined, 
            return_time: req.query.return_time ? String(req.query.return_time).trim() : undefined,
            outbtl_code: req.query.outbtl_code ? String(req.query.outbtl_code).trim().normalize("NFC") : undefined,
            outbtl_details: req.query.outbtl_details ? String(req.query.outbtl_details).trim().normalize("NFC") : undefined,
            outbtl_appr_status: req.query.outbtl_appr_status ? String(req.query.outbtl_appr_status).trim().normalize("NFC") : undefined,
            outbtl_return_status: req.query.outbtl_return_status ? String(req.query.outbtl_return_status).trim().normalize("NFC") : undefined,
            outbtl_issued_by: req.query.outbtl_issued_by ? String(req.query.outbtl_issued_by).trim().normalize("NFC") : undefined,
            outbtl_returned_by: req.query.outbtl_returned_by ? String(req.query.outbtl_returned_by).trim().normalize("NFC") : undefined
        };
        console.log('✅ Filters:', filters);

        // ✅ ดึงข้อมูลทั้งหมดจาก `outbtoolingService`
        const response = await outbtoolingService.getAll();
        console.log('✅ Data retrieved from outbtoolingService:', response);

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
            { title: 'รายงานเบิกเครื่องมือและอุปกรณ์ทั้งหมด', row: 3, col: 1 ,colspan:3, horizontal: 'left'},
            { title: 'วันที่พิมพ์', key: 'today_date', row: 3, col: 10 ,colspan: 1}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'วันที่เบิกของ', key: 'create_date', col: 2},
                { title: 'เวลาเบิกของ', key: 'create_time', col: 3},
                { title: 'วันที่คืนของ', key: 'return_date', col: 4},
                { title: 'เวลาที่คืนของ', key: 'return_time', col: 5},
                { title: 'เลขใบเบิก', key: 'outbtl_code', col: 6},
                { title: 'รายละเอียด', key: 'outbtl_details', col: 7},
                { title: 'สถานะอนุมัติ', key: 'outbtl_appr_status', col: 8},
                { title: 'สถานะคืน', key: 'outbtl_return_status', col: 9},
                { title: 'ผู้ทำเรื่องเบิก', key: 'outbtl_issued_by', col: 10},
                { title: 'ผู้ทำเรื่องคืน', key: 'outbtl_returned_by', col: 11}
            ],
            startRow: 6 // ✅ ถ้ามี Sub-Header ให้เริ่มที่แถว 5
        };

        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any ,index: number) => ({
            no: index + 1,
            create_date: item.create_date,
            create_time: item.create_time,
            return_date: item.return_date,
            return_time: item.return_time,
            today_date: item.today_date,
            outbtl_code: item.outbtl_code,
            outbtl_details: item.outbtl_details,
            outbtl_appr_status: mapApprovalStatus(item.outbtl_appr_status),
            outbtl_return_status: mapReturnStatus(item.outbtl_return_status),
            outbtl_issued_by: item.outbtl_issued_by,
            outbtl_returned_by: item.outbtl_returned_by,
        }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        await ExcelService.exportToExcel(excelStructure, excelData, [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 14,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting Outbound Tooling to Excel:', error);
        return ResponseUtils.handleError(res, 'exportAllToExcel', error.message, 'exporting outbound tooling');
    }
};
