import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { InbSemiModel } from '../models/inb_semi.model';
import { InbSemiService } from '../services/inb_semi.service';
import { ExcelService } from '../services/export_excel.service';

import { applyFilters, todayDateFormatted } from '../utils/ExportExcelUtils';
import { ApiResponse } from '../models/api-response.model';

dotenv.config();

const inbsemiService = new InbSemiService();

export const create = async (req: Request, res: Response) => {
    const operation = 'InbSemiController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<InbSemiModel> = DataSanitizer.fromObject<InbSemiModel>(req.body, InbSemiModel);
        data.create_by = reqUsername;

        const response = await inbsemiService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.inbsemi', true, reqUsername);
    }
};


export const update = async (req: Request, res: Response) => {
    const operation = 'InbSemiController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }
    
    try {
        
        // รับ inbsemi_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
        const inbsemi_id = Number(req.params.inbsemi_id);
        if (!inbsemi_id || isNaN(Number(inbsemi_id))) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        const data: Partial<InbSemiModel> = DataSanitizer.fromObject<InbSemiModel>(req.body, InbSemiModel);
        data.update_by = reqUsername;

        // เรียกใช้ service สำหรับการอัปเดตข้อมูล factory
        const response = await inbsemiService.update(inbsemi_id, data, reqUsername);

        // ส่งผลลัพธ์ที่ได้จาก service กลับไปยัง client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.inbsemi', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'InbSemiController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const inbsemi_id = Number(req.params.inbsemi_id);
    if (!inbsemi_id || isNaN(Number(inbsemi_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ service สำหรับลบ location
        const response = await inbsemiService.delete(inbsemi_id, reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.inbsemi', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'InbSemiController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await inbsemiService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbsemi', true, reqUsername);
    }
};

export const getAllDetails = async (req: Request, res: Response) => {
    const operation = 'InbSemiController.getAllDetails';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const semiifm_id = Number(req.params.semiifm_id);
    if (!semiifm_id || isNaN(Number(semiifm_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ Service โดยส่งค่าจาก `req.params`
        const response = await inbsemiService.getAllDetails(semiifm_id);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbsemi', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'InbSemiController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const inbsemi_id = Number(req.params.inbsemi_id);
    if (!inbsemi_id || isNaN(Number(inbsemi_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.inbsemi_id:', inbsemi_id);

        const response = await inbsemiService.getById(inbsemi_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbsemi', true, reqUsername);
    }
};

export const getInbsemiDropdown = async (req: Request, res: Response) => {
    const operation = 'InbSemiController.getInbsemiDropdown';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {

        // ส่งค่า isBomUsed ไปที่ service
        const response = await inbsemiService.getDropdown();

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error.message);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbsemi', true, reqUsername);
    }
};

export const getInventoryAll = async (req: Request, res: Response) => {
    const operation = 'InbSemiController.getInventoryAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const { ftyName, whName } = req.query; // ดึงค่าจาก Query Params
        const response = await inbsemiService.getInventoryAll(undefined, ftyName as string, whName as string);
        
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbsemi', true, reqUsername);
    }
};

export const exportAllToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Inbound_Semi_Finished_Goods_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ ดึงค่า filter จาก query string
        const filters = {
            semi_type: req.query.semi_type ? String(req.query.semi_type).trim().normalize("NFC") : undefined,
            semiifm_code: req.query.semiifm_code ? String(req.query.semiifm_code).trim().normalize("NFC") : undefined,
            semiifm_name: req.query.semiifm_name ? String(req.query.semiifm_name).trim().normalize("NFC") : undefined,
            inbsemi_quantity: req.query.inbsemi_quantity ? Number(req.query.inbsemi_quantity) : undefined
        };
        console.log('✅ Filters:', filters);

        // ✅ ดึงข้อมูลทั้งหมดจาก `inbsemiService`
        const response = await inbsemiService.getAll();
        console.log('✅ Data retrieved from inbsemiService:', response);

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
            { title: 'รายงานรับสินค้ากึ่งสำเร็จรูปทั้งหมด', row: 3, col: 1 ,colspan:3, horizontal: 'left'}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'รหัส', key: 'semiifm_code', col: 2, colspan: 1 },
                { title: 'ประเภท', key: 'semi_type', col: 3, colspan: 1 },
                { title: 'ชื่อ', key: 'semiifm_name', col: 4, colspan: 1 },
                { title: 'จำนวน', key: 'inbsemi_quantity', col: 5, colspan: 1 }
            ],
            startRow: 6 // ✅ ถ้ามี Sub-Header ให้เริ่มที่แถว 5
        };

        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any,index: number) => ({
            no: index + 1,
            semiifm_code: item.semiifm_code,
            semi_type: item.semi_type,
            semiifm_name: item.semiifm_name,
            inbsemi_quantity: item.inbsemi_quantity
        }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        await ExcelService.exportToExcel(excelStructure, excelData, [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 14,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting Inbound Semi Finished Goods to Excel:', error);
        return ResponseUtils.handleError(res, 'exportAllToExcel', error.message, 'exporting inbound semi finished goods');
    }
};

export const exportDetailsToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Inbound_Semi_Finished_Goods_Details_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ รับค่า `semiifm_id` จาก query string
        const semiifm_id = req.query.semiifm_id ? Number(req.query.semiifm_id) : NaN;
        if (Number.isNaN(semiifm_id)) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        // ✅ ดึงค่า filter จาก query string (ไม่ต้องแก้ไขโค้ดนี้)
        const filters = {
            create_time: req.query.create_time ? String(req.query.create_time).trim() : undefined,
            inbsemi_code: req.query.inbsemi_code ? String(req.query.inbsemi_code).trim().normalize("NFC") : undefined,
            inbsemi_color: req.query.inbsemi_color ? String(req.query.inbsemi_color).trim().normalize("NFC") : undefined,
            inbsemi_grade: req.query.inbsemi_grade ? String(req.query.inbsemi_grade).trim().normalize("NFC") : undefined,
            fty_name: req.query.fty_name ? String(req.query.fty_name).trim().normalize("NFC") : undefined,
            wh_name: req.query.wh_name ? String(req.query.wh_name).trim().normalize("NFC") : undefined,
            zn_name: req.query.zn_name ? String(req.query.zn_name).trim().normalize("NFC") : undefined,
            loc_name: req.query.loc_name ? String(req.query.loc_name).trim().normalize("NFC") : undefined,
            inbsemi_quantity: req.query.inbsemi_quantity ? Number(req.query.inbsemi_quantity) : undefined
        };
        console.log('✅ Filters:', filters);

        // ✅ ตรวจสอบว่าต้องกรองเฉพาะข้อมูลของวันนี้หรือไม่ (default = true)
        const filterToday = req.query.filterToday !== 'false';

        // ✅ ดึงข้อมูลจาก `getAllDetails`
        const response = await inbsemiService.getAllDetails(semiifm_id);
        console.log('✅ Data retrieved from inbsemiService:', response);

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
            { title: 'รายงานรับสินค้ากึ่งสำเร็จรูปประจำวัน', row: 3, col: 1 ,colspan:3, horizontal: 'left'},
            { title: 'วันที่พิมพ์', key: 'today_date', row: 3, col: 13 ,colspan: 2}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'รหัส', key: 'inbsemi_code', col: 2, colspan: 1 },
                { title: 'ชื่อ', key: 'semiifm_name', col: 3, colspan: 1 },
                { title: 'ขนาด', col: 4, colspan: 3 },
                { title: 'สี', key: 'inbsemi_color', col: 7, colspan: 1 },
                { title: 'เกรด', key: 'inbsemi_grade', col: 8, colspan: 1 },
                { title: 'Lot', key: 'inbsemi_lot', col: 9, colspan: 1 },
                { title: 'Store', col: 10, colspan: 4 },
                { title: 'จำนวน', key: 'inbsemi_quantity', col: 14, colspan: 1 },
                { title: 'หน่วย', key: 'unit_abbr_th', col: 15, colspan: 1 }
            ],
            subHeaders: [
                { title: 'ความกว้าง', key: 'semiifm_width', col: 4 },
                { title: 'ความยาว', key: 'semiifm_length', col: 5 },
                { title: 'ความหนา', key: 'semiifm_thickness', col: 6 },
                { title: 'โรงงาน', key: 'fty_name', col: 10 },
                { title: 'คลัง', key: 'wh_name', col: 11 },
                { title: 'Zone', key: 'zn_name', col: 12 },
                { title: 'Location', key: 'loc_name', col: 13 }
            ],
            startRow: 7
        };

        console.log(`✅ Today’s formatted date: ${todayDateFormatted}`);

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
            semiifm_code: item.semiifm_code,
            semiifm_name: item.semiifm_name,
            semiifm_width: item.semiifm_width,
            semiifm_length: item.semiifm_length,
            semiifm_thickness: item.semiifm_thickness,
            inbsemi_code: item.inbsemi_code,
            inbsemi_color: item.inbsemi_color,
            inbsemi_grade: item.inbsemi_grade,
            inbsemi_lot: item.inbsemi_lot,
            fty_name: item.fty_name,
            wh_name: item.wh_name,
            zn_name: item.zn_name,
            loc_name: item.loc_name,
            inbsemi_quantity: item.inbsemi_quantity,
            unit_abbr_th: item.unit_abbr_th
        }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        await ExcelService.exportToExcel(excelStructure, excelData, [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 16,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting Inbound Semi Finished Goods to Excel:', error);
        return ResponseUtils.handleError(res, 'exportDetailsToExcel', error.message, 'exporting inbound semi finished goods');
    }
};

export const exportINVAllToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Inventory_Semi_Finished_Goods_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ ดึงค่า filter จาก query string (ไม่ต้องแก้ไขโค้ดนี้)
        const filters = {
            fty_name: req.query.fty_name ? String(req.query.fty_name).trim().normalize("NFC") : undefined,
            wh_name: req.query.wh_name ? String(req.query.wh_name).trim().normalize("NFC") : undefined,
        };
        console.log('✅ Filters:', filters);

        // ✅ ดึงข้อมูลทั้งหมดจาก `inbsemiService`
        const response = await inbsemiService.getInventoryAll();
        console.log('✅ Data retrieved from inbsemiService:', response);

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
            { title: 'รายงานรายการรับสินค้ากึ่งสำเร็จรูปทั้งหมด', row: 3, col: 1 ,colspan:3, horizontal: 'left'}
        ] as const; //เป็นค่าคงที่
        
        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'รหัสสินค้า', key: 'inbsemi_code', col: 2, colspan: 1 },
                { title: 'ชื่อสินค้า', key: 'semiifm_name', col: 3, colspan: 1 },
                { title: 'จำนวนคงเหลือในคลัง', key: 'inbsemi_quantity', col: 4, colspan: 1 },
                { title: 'Lot.', key: 'inbsemi_lot', col: 5, colspan: 1 },
                { title: 'โรงงาน', key: 'fty_name', col: 6, colspan: 1 },
                { title: 'คลัง', key: 'wh_name', col: 7, colspan: 1 }
            ],
            startRow: 6 // ✅ ถ้ามี Sub-Header ให้เริ่มที่แถว 5
        };

        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any,  index: number) => ({
            no: index + 1,
            inbsemi_code: item.inbsemi_code,
            semiifm_name: item.semiifm_name,
            inbsemi_quantity: item.inbsemi_quantity,
            inbsemi_lot: item.inbsemi_lot,
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
        console.error('❌ Error exporting Inventory Semi Finished Goods to Excel:', error);
        return ResponseUtils.handleError(res, 'exportINVAllToExcel', error.message, 'exporting inventory semi finished goods');
    }
};