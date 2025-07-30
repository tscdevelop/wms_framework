import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { InbToolingModel } from '../models/inb_tooling.model';
import { InbToolingService } from '../services/inb_tooling.service';

import { ExcelService } from '../services/export_excel.service';
import { applyFilters, todayDateFormatted } from '../utils/ExportExcelUtils';
import { ApiResponse } from '../models/api-response.model';

dotenv.config();

const inbtoolingService = new InbToolingService();

export const create = async (req: Request, res: Response) => {
    const operation = 'InbToolingController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<InbToolingModel> = DataSanitizer.fromObject<InbToolingModel>(req.body, InbToolingModel);
        data.create_by = reqUsername;

        const response = await inbtoolingService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.inbtl', true, reqUsername);
    }
};


export const update = async (req: Request, res: Response) => {
    const operation = 'InbToolingController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }
    
    try {
        
        // รับ inbtl_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
        const inbtl_id = Number(req.params.inbtl_id);
        if (!inbtl_id || isNaN(Number(inbtl_id))) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        const data: Partial<InbToolingModel> = DataSanitizer.fromObject<InbToolingModel>(req.body, InbToolingModel);
        data.update_by = reqUsername;

        // เรียกใช้ service สำหรับการอัปเดตข้อมูล factory
        const response = await inbtoolingService.update(inbtl_id, data, reqUsername);

        // ส่งผลลัพธ์ที่ได้จาก service กลับไปยัง client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.inbtl', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'InbToolingController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const inbtl_id = Number(req.params.inbtl_id)
    if (!inbtl_id || isNaN(Number(inbtl_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ service สำหรับลบ location
        const response = await inbtoolingService.delete(inbtl_id, reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.inbtl', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'InbToolingController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await inbtoolingService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbtl', true, reqUsername);
    }
};

export const getAllDetails = async (req: Request, res: Response) => {
    const operation = 'InbToolingController.getAllDetails';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const tlifm_id = Number(req.params.tlifm_id);
    if (!tlifm_id || isNaN(Number(tlifm_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ Service โดยส่งค่าจาก `req.params`
        const response = await inbtoolingService.getAllDetails(tlifm_id);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbtl', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'InbToolingController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const inbtl_id = Number(req.params.inbtl_id)
    if (!inbtl_id || isNaN(Number(inbtl_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.inbtl_id:', inbtl_id);

        const response = await inbtoolingService.getById(inbtl_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbtl', true, reqUsername);
    }
};

export const getInbtlDropdown = async (req: Request, res: Response) => {
    const operation = 'InbToolingController.getInbtlDropdown';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        const response = await inbtoolingService.getDropdown();

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbtl', true, reqUsername);
    }
};

export const getInventoryAll = async (req: Request, res: Response) => {
    const operation = 'InbToolingController.getInventoryAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const { ftyName, whName } = req.query; // ดึงค่าจาก Query Params
        const response = await inbtoolingService.getInventoryAll(undefined, ftyName as string, whName as string);
        
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbtl', true, reqUsername);
    }
};

export const exportAllToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Inbound_Tooling_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ ดึงค่า filter จาก query string
        const filters = {
            tl_type: req.query.tl_type ? String(req.query.tl_type).trim().normalize("NFC") : undefined,
            tlifm_code: req.query.tlifm_code ? String(req.query.tlifm_code).trim().normalize("NFC") : undefined,
            tlifm_name: req.query.tlifm_name ? String(req.query.tlifm_name).trim().normalize("NFC") : undefined,
            inbtl_quantity: req.query.inbtl_quantity ? Number(req.query.inbtl_quantity) : undefined
        };
        console.log('✅ Filters:', filters);

        // ✅ ดึงข้อมูลทั้งหมดจาก `inbtoolingService`
        const response = await inbtoolingService.getAll();
        console.log('✅ Data retrieved from inbtoolingService:', response);

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
            { title: 'รายงานรับเครื่องมือและอุปกรณ์ทั้งหมด', row: 3, col: 1 ,colspan:3, horizontal: 'left'}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'รหัส', key: 'tlifm_code', col: 2, colspan: 1 },
                { title: 'ประเภท', key: 'tl_type', col: 3, colspan: 1 },
                { title: 'ชื่อ', key: 'tlifm_name', col: 4, colspan: 1 },
                { title: 'จำนวน', key: 'inbtl_quantity', col: 5, colspan: 1 }
            ],
            startRow: 6 // ✅ ถ้ามี Sub-Header ให้เริ่มที่แถว 5
        };

        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any ,index: number) => ({
            no: index + 1,
            tlifm_code: item.tlifm_code,
            tl_type: item.tl_type,
            tlifm_name: item.tlifm_name,
            inbtl_quantity: item.inbtl_quantity
        }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        await ExcelService.exportToExcel(excelStructure, excelData, [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 14,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting Inbound Tooling to Excel:', error);
        return ResponseUtils.handleError(res, 'exportAllToExcel', error.message, 'exporting inbound tooling');
    }
};

export const exportDetailsToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Inbound_Tooling_Details_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ รับค่า `tlifm_id` จาก query string
        const tlifm_id = req.query.tlifm_id ? Number(req.query.tlifm_id) : NaN;
        if (Number.isNaN(tlifm_id)) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        // ✅ ดึงค่า filter จาก query string (ไม่ต้องแก้ไขโค้ดนี้)
        const filters = {
            create_time: req.query.create_time ? String(req.query.create_time).trim() : undefined,
            inbtl_code: req.query.inbtl_code ? String(req.query.inbtl_code).trim().normalize("NFC") : undefined,
            fty_name: req.query.fty_name ? String(req.query.fty_name).trim().normalize("NFC") : undefined,
            wh_name: req.query.wh_name ? String(req.query.wh_name).trim().normalize("NFC") : undefined,
            zn_name: req.query.zn_name ? String(req.query.zn_name).trim().normalize("NFC") : undefined,
            loc_name: req.query.loc_name ? String(req.query.loc_name).trim().normalize("NFC") : undefined,
            inbtl_quantity: req.query.inbtl_quantity ? Number(req.query.inbtl_quantity) : undefined,
            inbtl_remark: req.query.inbtl_remark ? String(req.query.inbtl_remark).trim().normalize("NFC") : undefined,
        };
        console.log('✅ Filters:', filters);

        // ✅ ตรวจสอบว่าต้องกรองเฉพาะข้อมูลของวันนี้หรือไม่ (default = true)
        const filterToday = req.query.filterToday !== 'false';
        
        // ✅ ดึงข้อมูลจาก `getAllDetails`
        const response = await inbtoolingService.getAllDetails(tlifm_id);
        console.log('✅ Data retrieved from inbtoolingService:', response);

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
            { title: 'รายงานรับเครื่องมือและอุปกรณ์ประจำวัน', row: 3, col: 1 ,colspan:3, horizontal: 'left'},
            { title: 'วันที่พิมพ์', key: 'today_date', row: 3, col: 7 ,colspan: 2}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'รหัส', key: 'inbtl_code', col: 2, colspan: 1 },
                { title: 'ชื่อ', key: 'tlifm_name', col: 3, colspan: 1 },
                { title: 'Store', col: 4, colspan: 4 },
                { title: 'จำนวน', key: 'inbtl_quantity', col: 8, colspan: 1 },
                { title: 'หมายเหตุ', key: 'inbtl_remark', col: 9, colspan: 1 },
            ],
            subHeaders: [
                { title: 'โรงงาน', key: 'fty_name', col: 4 },
                { title: 'คลัง', key: 'wh_name', col: 5 },
                { title: 'Zone', key: 'zn_name', col: 6 },
                { title: 'Location', key: 'loc_name', col: 7 }
            ],
            startRow: 7
        };

        // ✅ แปลงข้อมูลให้อยู่ในรูปแบบที่เหมาะสมกับ Excel
        const excelData = filteredData
            .filter((item: any) => {
                return filterToday ? item.formatted_date === todayDateFormatted : true;
            })
            .map((item: any, index: number) => ({
            no: index + 1,
            formatted_date: item.formatted_date,
            create_time: item.create_time,
            today_date: item.today_date,
            tlifm_code: item.tlifm_code,
            tlifm_name: item.tlifm_name,
            inbtl_code: item.inbtl_code,
            fty_name: item.fty_name,
            wh_name: item.wh_name,
            zn_name: item.zn_name,
            loc_name: item.loc_name,
            inbtl_quantity: item.inbtl_quantity,
            inbtl_remark: item.inbtl_remark,
        }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        await ExcelService.exportToExcel(excelStructure, excelData, [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 16,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting Inbound Tooling to Excel:', error);
        return ResponseUtils.handleError(res, 'exportDetailsToExcel', error.message, 'exporting inbound tooling');
    }
};

export const exportINVAllToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Inventory_Tooling_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ ดึงค่า filter จาก query string (ไม่ต้องแก้ไขโค้ดนี้)
        const filters = {
            fty_name: req.query.fty_name ? String(req.query.fty_name).trim().normalize("NFC") : undefined,
            wh_name: req.query.wh_name ? String(req.query.wh_name).trim().normalize("NFC") : undefined,
        };
        console.log('✅ Filters:', filters);

        // ✅ ดึงข้อมูลทั้งหมดจาก `inbtoolingService`
        const response = await inbtoolingService.getInventoryAll();
        console.log('✅ Data retrieved from inbtoolingService:', response);

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
            { title: 'รายงานรายการเครื่องมือและอุปกรณ์ทั้งหมด', row: 3, col: 1 ,colspan:3, horizontal: 'left'}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'รหัสสินค้า', key: 'inbtl_code', col: 2, colspan: 1 },
                { title: 'ชื่อสินค้า', key: 'tlifm_name', col: 3, colspan: 1 },
                { title: 'จำนวนคงเหลือในคลัง', key: 'inbtl_quantity', col: 4, colspan: 1 },
                { title: 'โรงงาน', key: 'fty_name', col: 5, colspan: 1 },
                { title: 'คลัง', key: 'wh_name', col: 6, colspan: 1 }
            ],
            startRow: 6 // ✅ ถ้ามี Sub-Header ให้เริ่มที่แถว 5
        };

        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any,  index: number) => ({
            no: index + 1,
            inbtl_code: item.inbtl_code,
            tlifm_name: item.tlifm_name,
            inbtl_quantity: item.inbtl_quantity,
            fty_name: item.fty_name,
            wh_name: item.wh_name 
        }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        await ExcelService.exportToExcel(excelStructure, excelData, [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 14,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting Inventory Tooling to Excel:', error);
        return ResponseUtils.handleError(res, 'exportINVAllToExcel', error.message, 'exporting inventory tooling');
    }
};