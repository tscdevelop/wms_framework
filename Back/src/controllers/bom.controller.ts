import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { BomModel } from '../models/bom.model';
import { BOMService } from '../services/bom.service';

import { ExcelService } from '../services/export_excel.service';
import { mapShipmentStatus } from '../utils/StatusMapper';
import { applyFilters } from '../utils/ExportExcelUtils';
import { ApiResponse } from '../models/api-response.model';

dotenv.config();

const bomService = new BOMService();

export const create = async (req: Request, res: Response) => {
    const operation = 'BOMController.create';

    // ดึง username จาก Token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        console.log(`[${operation}] Raw req.body:`, req.body);

        // ตรวจสอบว่า req.body เป็น Array หรือ Object
        const requestData = Array.isArray(req.body) ? req.body : [req.body];

        // ส่งข้อมูลไปยัง service
        const response = await bomService.create(requestData, reqUsername);

        // ส่ง response กลับหากสำเร็จ
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);

        // ส่ง response ข้อผิดพลาดกลับ
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.bom', true, reqUsername);
    }
};

export const update = async (req: Request, res: Response) => {
    const operation = 'BOMController.update';
    
    // ดึง `so_id` จากพารามิเตอร์
    const so_id  = Number(req.params.so_id);

    if (!so_id|| isNaN(so_id)) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequired('bom.so_id'));
    }

    // ดึง `reqUsername` จาก Token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        console.log(`[${operation}] Raw req.body:`, req.body);

        // ตรวจสอบว่า `req.body` มีข้อมูลหรือไม่
        if (!req.body || typeof req.body !== 'object') {
            return ResponseUtils.handleBadRequest(res, lang.msg('validation.invalid_request_format'));
        }

        // เรียก Service Update
        const response = await bomService.update(Number(so_id), req.body, reqUsername);

        // ส่ง Response กลับไปยัง Client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);

        // จัดการ Error Response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.bom', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'BOMController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const so_id = Number(req.params.so_id); //ดึงทุกตัว
    if (!so_id || isNaN(so_id)) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ service สำหรับลบ location
        const response = await bomService.delete(so_id, reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.bom', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'BOMController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await bomService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.bom', true, reqUsername);
    }
};

export const getAllDetails = async (req: Request, res: Response) => {
    const operation = 'BOMController.getAllDetails';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const so_id = Number(req.params.so_id);
    if (!so_id || isNaN(Number(so_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.so_id:', so_id);

        const response = await bomService.getAllDetails(so_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.bom', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'BOMController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const so_id = Number(req.params.so_id);
    if (!so_id || isNaN(Number(so_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.so_id:', so_id);

        const response = await bomService.getById(so_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.bom', true, reqUsername);
    }
};


export const getByBom = async (req: Request, res: Response) => {
    const operation = 'BOMController.getByBom';

    // ดึง username จาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // ตรวจสอบและดึง so_id จาก params
    const so_id = Number(req.params.so_id);
    if (!so_id || isNaN(Number(so_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    // ตรวจสอบและดึง bom_number จาก params
    const bom_number = req.params.bom_number;
    if (!bom_number || typeof bom_number !== 'string') {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.bom_number:', bom_number);

        // เรียก service getByBom เพื่อดึงข้อมูล
        const response = await bomService.getByBom(so_id, bom_number);

        // ส่ง response กลับ
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.bom', true, reqUsername);
    }
};

export const getSODropdown = async (req: Request, res: Response) => {
    const operation = 'BOMController.getSODropdown';

    // ดึง username จาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {

        // เรียก service getSODropdown เพื่อดึงข้อมูล
        const response = await bomService.getSODropdown();

        // ส่ง response กลับ
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.bom', true, reqUsername);
    }
};

export const getBomDropdown = async (req: Request, res: Response) => {
    const operation = 'BOMController.getBomDropdown';

    // ดึง username จาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // ตรวจสอบและดึง so_id จาก params
    const so_id = Number(req.params.so_id);
    if (!so_id || isNaN(Number(so_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.so_id:', so_id);

        // เรียก service getBomDropdown เพื่อดึงข้อมูล
        const response = await bomService.getBomDropdown(so_id);

        // ส่ง response กลับ
        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.bom', true, reqUsername);
    }
};

export const exportAllToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'BOM_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ ดึงค่า filter จาก query string
        const filters = {
            formatted_date: req.query.formatted_date ? String(req.query.formatted_date).trim().normalize("NFC") : undefined, 
            create_time: req.query.create_time ? String(req.query.create_time).trim() : undefined,
            so_code: req.query.so_code ? String(req.query.so_code).trim().normalize("NFC") : undefined,
            so_details: req.query.so_details ? String(req.query.so_details).trim().normalize("NFC") : undefined
        };
        console.log('✅ Filters:', filters);

        const response = await bomService.getAll();
        console.log('✅ Data retrieved from BOMService:', response);

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
            { title: 'รายงาน BOM ทั้งหมด', row: 3, col: 1 ,colspan:3, horizontal: 'left'}
        ] as const; //เป็นค่าคงที่
        
        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'วันที่', key: 'formatted_date', col: 2, colspan: 1 },
                { title: 'เวลา', key: 'create_time', col: 3, colspan: 1 },
                { title: 'เลขที่ SO.', key: 'so_code', col: 4, colspan: 1 },
                { title: 'รายละเอียด', key: 'so_details', col: 5, colspan: 1 },
                { title: 'สถานะจัดส่ง', key: 'so_shipmt_status', col: 6, colspan: 1 }
            ],
            startRow: 6 // ✅ ถ้ามี Sub-Header ให้เริ่มที่แถว 5
        };
        
        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any ,index: number) => ({
            no: index + 1,
            formatted_date: item.formatted_date,
            create_time: item.create_time,
            so_code: item.so_code,
            so_details: item.so_details,
            so_shipmt_status: mapShipmentStatus(item.so_shipmt_status)
        }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        await ExcelService.exportToExcel(excelStructure, excelData, [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 14,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting BOM to Excel:', error);
        return ResponseUtils.handleError(res, 'exportAllToExcel', error.message, 'exporting BOM');
    }
};

export const exportDetailsToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'BOM_Details_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ รับค่า `so_id` จาก query string
        const so_id = req.query.so_id ? Number(req.query.so_id) : NaN;
        if (Number.isNaN(so_id)) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        // ✅ ดึงค่า filter จาก query string
        const filters = {
            bom_number: req.query.bom_number ? String(req.query.bom_number).trim().normalize("NFC") : undefined,
            fgifm_code: req.query.fgifm_code ? String(req.query.fgifm_code).trim().normalize("NFC") : undefined,
            fgifm_name: req.query.fgifm_name ? String(req.query.fgifm_name).trim().normalize("NFC") : undefined
        };
        console.log('✅ Filters:', filters);

        const response = await bomService.getAllDetails(so_id);
        console.log('✅ Data retrieved from BOMService:', response);

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
            { title: 'รายงานรายละเอียด BOM ทั้งหมด', row: 3, col: 3 ,colspan:3},
            { title: 'วันที่พิมพ์', key: 'today_date', row: 4, col: 4 ,colspan: 1},
            { title: 'เลขที่ SO.', key: 'so_code', row: 6, col: 1, colspan:1, horizontal: 'left' },
            { title: 'ชื่อลูกค้า', key: 'so_cust_name', row: 7, col: 1, colspan:1, horizontal: 'left' },
            { title: 'รายละเอียด', key: 'so_details', row: 8, col: 1, colspan:1, horizontal: 'left' }
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'รหัส BOM', key: 'bom_number', col: 2, colspan: 1 },
                { title: 'รหัส FG', key: 'fgifm_code', col: 3, colspan: 1 },
                { title: 'FG', key: 'fgifm_name', col: 4, colspan: 1 },
                { title: 'จำนวนคงเหลือในคลัง', key: 'inbfg_quantity', col: 5, colspan: 1 },
                { title: 'BOM', key: 'bom_quantity', col: 6, colspan: 1 },
                { title: 'จอง', key: 'outbfgitm_quantity_remain', col: 7, colspan: 1 },
                { title: 'เบิก', key: 'outbfgitm_withdr_count_remain', col: 8, colspan: 1 },
                { title: 'ส่ง', key: 'outbfgitm_shipmt_count_remain', col: 9, colspan: 1 }
            ],
            startRow: 11 // ✅ ถ้ามี Sub-Header ให้เริ่มที่แถว 5
        };
        
        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any ,index: number) => ({
            no: index + 1,
            today_date: item.today_date,
            bom_number: item.bom_number,
            fgifm_code: item.fgifm_code,
            fgifm_name: item.fgifm_name,
            inbfg_quantity: item.inbfg_quantity,
            bom_quantity: item.bom_quantity,
            outbfgitm_quantity_remain: item.outbfgitm_quantity_remain,
            outbfgitm_withdr_count_remain: item.outbfgitm_withdr_count_remain,
            outbfgitm_shipmt_count_remain: item.outbfgitm_shipmt_count_remain,
            so_code: item.so_code,
            so_cust_name: item.so_cust_name,
            so_details: item.so_details
        }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        await ExcelService.exportToExcel(excelStructure, excelData, [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 16,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting BOM to Excel:', error);
        return ResponseUtils.handleError(res, 'exportDetailsToExcel', error.message, 'exporting BOM');
    }
};