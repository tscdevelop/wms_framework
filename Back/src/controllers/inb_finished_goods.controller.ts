import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { InbFinishedGoodsModel } from '../models/inb_finished_goods.model';
import { InbFinishedGoodsService } from '../services/inb_finished_goods.service';

import { ExcelService } from '../services/export_excel.service';
import { ApiResponse } from '../models/api-response.model';
import { applyFilters, todayDateFormatted } from '../utils/ExportExcelUtils';

dotenv.config();

const inbfinishedgoodsService = new InbFinishedGoodsService();

export const create = async (req: Request, res: Response) => {
    const operation = 'InbFinishedGoodsController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<InbFinishedGoodsModel> = DataSanitizer.fromObject<InbFinishedGoodsModel>(req.body, InbFinishedGoodsModel);
        data.create_by = reqUsername;

        const response = await inbfinishedgoodsService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.inbfg', true, reqUsername);
    }
};


export const update = async (req: Request, res: Response) => {
    const operation = 'InbFinishedGoodsController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }
    
    try {
        
        // รับ inbfg_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
        const inbfg_id = Number(req.params.inbfg_id);
        if (!inbfg_id || isNaN(Number(inbfg_id))) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        const data: Partial<InbFinishedGoodsModel> = DataSanitizer.fromObject<InbFinishedGoodsModel>(req.body, InbFinishedGoodsModel);
        data.update_by = reqUsername;

        // เรียกใช้ service สำหรับการอัปเดตข้อมูล factory
        const response = await inbfinishedgoodsService.update(inbfg_id, data, reqUsername);

        // ส่งผลลัพธ์ที่ได้จาก service กลับไปยัง client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.inbfg', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'InbFinishedGoodsController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const inbfg_id = Number(req.params.inbfg_id);
    if (!inbfg_id || isNaN(Number(inbfg_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ service สำหรับลบ location
        const response = await inbfinishedgoodsService.delete(inbfg_id, reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.inbfg', true, reqUsername);
    }
};


export const getById = async (req: Request, res: Response) => {
    const operation = 'InbFinishedGoodsController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const inbfg_id = Number(req.params.inbfg_id);
    if (!inbfg_id || isNaN(Number(inbfg_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.inbfg_id:', inbfg_id);

        const response = await inbfinishedgoodsService.getById(inbfg_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbfg', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'InbFinishedGoodsController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await inbfinishedgoodsService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbfg', true, reqUsername);
    }
};

export const getAllDetails = async (req: Request, res: Response) => {
    const operation = 'InbFinishedGoodsController.getAllDetails';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const fgifm_id = Number(req.params.fgifm_id);
    if (!fgifm_id || isNaN(Number(fgifm_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ Service โดยส่งค่าจาก `req.params`
        const response = await inbfinishedgoodsService.getAllDetails(fgifm_id);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbfg', true, reqUsername);
    }
};

export const getInbfgDropdown = async (req: Request, res: Response) => {
    const operation = 'InbFinishedGoodsController.getInbfgDropdown';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        const response = await inbfinishedgoodsService.getDropdown();

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbfg', true, reqUsername);
    }
};

export const getInventoryAll = async (req: Request, res: Response) => {
    const operation = 'InbFinishedGoodsController.getInventoryAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const { ftyName, whName } = req.query; // ดึงค่าจาก Query Params
        const response = await inbfinishedgoodsService.getInventoryAll(undefined, ftyName as string, whName as string);
        
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbfg', true, reqUsername);
    }
};

export const exportAllToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Inbound_Finished_Goods_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ ดึงค่า filter จาก query string
        const filters = {
            fg_type: req.query.fg_type ? String(req.query.fg_type).trim().normalize("NFC") : undefined,
            fgifm_code: req.query.fgifm_code ? String(req.query.fgifm_code).trim().normalize("NFC") : undefined,
            fgifm_name: req.query.fgifm_name ? String(req.query.fgifm_name).trim().normalize("NFC") : undefined,
            inbfg_quantity: req.query.inbfg_quantity ? Number(req.query.inbfg_quantity) : undefined
        };
        console.log('✅ Filters:', filters);

        // ✅ ดึงข้อมูลทั้งหมดจาก `inbfinishedgoodsService`
        const response = await inbfinishedgoodsService.getAll();
        console.log('✅ Data retrieved from inbfinishedgoodsService:', response);

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
            { title: 'รายงานรับสินค้าสำเร็จรูปทั้งหมด', row: 3, col: 1 ,colspan:3, horizontal: 'left'}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'รหัส', key: 'fgifm_code', col: 2, colspan: 1 },
                { title: 'ประเภท', key: 'fg_type', col: 3, colspan: 1 },
                { title: 'ชื่อ', key: 'fgifm_name', col: 4, colspan: 1 },
                { title: 'จำนวน', key: 'inbfg_quantity', col: 5, colspan: 1 }
            ],
            startRow: 6 //จุดเริ่มต้นของข้อมูล
        };

        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any ,index: number) => ({
            no: index + 1,
            fgifm_code: item.fgifm_code,
            fg_type: item.fg_type,
            fgifm_name: item.fgifm_name,
            inbfg_quantity: item.inbfg_quantity
        }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        await ExcelService.exportToExcel(excelStructure, excelData, [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 14,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting Inbound Finished Goods to Excel:', error);
        return ResponseUtils.handleError(res, 'exportAllToExcel', error.message, 'exporting inbound finished goods');
    }
};

export const exportDetailsToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Inbound_Finished_Goods_Details_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ รับค่า `fgifm_id` จาก query string
        const fgifm_id = req.query.fgifm_id ? Number(req.query.fgifm_id) : NaN;
        if (Number.isNaN(fgifm_id)) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        // ✅ ดึงค่า filter จาก query string (ไม่ต้องแก้ไขโค้ดนี้)
        const filters = {
            create_time: req.query.create_time ? String(req.query.create_time).trim() : undefined,
            inbfg_code: req.query.inbfg_code ? String(req.query.inbfg_code).trim().normalize("NFC") : undefined,
            inbfg_color: req.query.inbfg_color ? String(req.query.inbfg_color).trim().normalize("NFC") : undefined,
            inbfg_grade: req.query.inbfg_grade ? String(req.query.inbfg_grade).trim().normalize("NFC") : undefined,
            fty_name: req.query.fty_name ? String(req.query.fty_name).trim().normalize("NFC") : undefined,
            wh_name: req.query.wh_name ? String(req.query.wh_name).trim().normalize("NFC") : undefined,
            zn_name: req.query.zn_name ? String(req.query.zn_name).trim().normalize("NFC") : undefined,
            loc_name: req.query.loc_name ? String(req.query.loc_name).trim().normalize("NFC") : undefined,
            inbfg_quantity: req.query.inbfg_quantity ? Number(req.query.inbfg_quantity) : undefined
        };
        console.log('✅ Filters:', filters);

        // ✅ ตรวจสอบว่าต้องกรองเฉพาะข้อมูลของวันนี้หรือไม่ (default = true)
        const filterToday = req.query.filterToday !== 'false';

        // ✅ ดึงข้อมูลจาก `getAllDetails`
        const response = await inbfinishedgoodsService.getAllDetails(fgifm_id);
        console.log('✅ Data retrieved from inbfinishedgoodsService:', response);

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
            { title: 'รายงานรับสินค้าสำเร็จรูปประจำวัน', row: 3, col: 1 ,colspan:3, horizontal: 'left'},
            { title: 'วันที่พิมพ์', key: 'today_date', row: 3, col: 13 ,colspan: 2}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'รหัส', key: 'inbfg_code', col: 2, colspan: 1 },
                { title: 'ชื่อ', key: 'fgifm_name', col: 3, colspan: 1 },
                { title: 'ขนาด', col: 4, colspan: 3 },
                { title: 'สี', key: 'inbfg_color', col: 7, colspan: 1 },
                { title: 'เกรด', key: 'inbfg_grade', col: 8, colspan: 1 },
                { title: 'Lot', key: 'inbfg_lot', col: 9, colspan: 1 },
                { title: 'Store', col: 10, colspan: 4 },
                { title: 'จำนวน', key: 'inbfg_quantity', col: 14, colspan: 1 },
                { title: 'หน่วย', key: 'unit_abbr_th', col: 15, colspan: 1 }
            ],
            subHeaders: [
                { title: 'ความกว้าง', key: 'fgifm_width', col: 4 },
                { title: 'ความยาว', key: 'fgifm_length', col: 5 },
                { title: 'ความหนา', key: 'fgifm_thickness', col: 6 },
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
            fgifm_code: item.fgifm_code,
            fgifm_name: item.fgifm_name,
            fgifm_width: item.fgifm_width,
            fgifm_length: item.fgifm_length,
            fgifm_thickness: item.fgifm_thickness,
            inbfg_code: item.inbfg_code,
            inbfg_color: item.inbfg_color,
            inbfg_grade: item.inbfg_grade,
            inbfg_lot: item.inbfg_lot,
            fty_name: item.fty_name,
            wh_name: item.wh_name,
            zn_name: item.zn_name,
            loc_name: item.loc_name,
            inbfg_quantity: item.inbfg_quantity,
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
        console.error('❌ Error exporting Inbound Finished Goods to Excel:', error);
        return ResponseUtils.handleError(res, 'exportDetailsToExcel', error.message, 'exporting inbound finished goods');
    }
};

export const exportINVAllToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Inventory_Finished_Goods_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ ดึงค่า filter จาก query string (ไม่ต้องแก้ไขโค้ดนี้)
        const filters = {
            fty_name: req.query.fty_name ? String(req.query.fty_name).trim().normalize("NFC") : undefined,
            wh_name: req.query.wh_name ? String(req.query.wh_name).trim().normalize("NFC") : undefined,
        };
        console.log('✅ Filters:', filters);

        // ✅ ดึงข้อมูลทั้งหมดจาก `inbfinishedgoodsService`
        const response = await inbfinishedgoodsService.getInventoryAll();
        console.log('✅ Data retrieved from inbfinishedgoodsService:', response);

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
            { title: 'รายงานรายการรับสินค้าสำเร็จรูปทั้งหมด', row: 3, col: 1 ,colspan:3, horizontal: 'left'}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'รหัสสินค้า', key: 'inbfg_code', col: 2, colspan: 1 },
                { title: 'ชื่อสินค้า', key: 'fgifm_name', col: 3, colspan: 1 },
                { title: 'จำนวนคงเหลือในคลัง', key: 'inbfg_quantity', col: 4, colspan: 1 },
                { title: 'Lot.', key: 'inbfg_lot', col: 5, colspan: 1 },
                { title: 'โรงงาน', key: 'fty_name', col: 6, colspan: 1 },
                { title: 'คลัง', key: 'wh_name', col: 7, colspan: 1 }
            ],
            startRow: 6 // ✅ ถ้ามี Sub-Header ให้เริ่มที่แถว 5
        };

        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any,  index: number) => ({
            no: index + 1,
            inbfg_code: item.inbfg_code,
            fgifm_name: item.fgifm_name,
            inbfg_quantity: item.inbfg_quantity,
            inbfg_lot: item.inbfg_lot,
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
        console.error('❌ Error exporting Inventory Finished Goods to Excel:', error);
        return ResponseUtils.handleError(res, 'exportInvAllToExcel', error.message, 'exporting inventory finished goods');
    }
};
