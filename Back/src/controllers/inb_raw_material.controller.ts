import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { InbRawMaterialModel } from '../models/inb_raw_material.model';
import { InbRawMaterialService } from '../services/inb_raw_material.service';
import { ExcelService } from '../services/export_excel.service';

import { applyFilters, todayDateFormatted } from '../utils/ExportExcelUtils';
import { ApiResponse } from '../models/api-response.model';

dotenv.config();

const inbrawaterialService = new InbRawMaterialService();

export const create = async (req: Request, res: Response) => {
    const operation = 'InbRawMaterialController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<InbRawMaterialModel> = DataSanitizer.fromObject<InbRawMaterialModel>(req.body, InbRawMaterialModel);
        data.create_by = reqUsername;

        const response = await inbrawaterialService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

        // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.inbrm', true, reqUsername);
    }
};


export const update = async (req: Request, res: Response) => {
    const operation = 'InbRawMaterialController.update';

    // รับค่าผู้ใช้ที่ทำการอัปเดตจาก token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }
    
    try {
        
        // รับ inbrm_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
        const inbrm_id = Number(req.params.inbrm_id);
        if (!inbrm_id || isNaN(Number(inbrm_id))) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        const data: Partial<InbRawMaterialModel> = DataSanitizer.fromObject<InbRawMaterialModel>(req.body, InbRawMaterialModel);
        data.update_by = reqUsername;

        // เรียกใช้ service สำหรับการอัปเดตข้อมูล factory
        const response = await inbrawaterialService.update(inbrm_id, data, reqUsername);

        // ส่งผลลัพธ์ที่ได้จาก service กลับไปยัง client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.inbrm', true, reqUsername);
    }
};

export const del = async (req: Request, res: Response) => {
    const operation = 'InbRawMaterialController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const inbrm_id = Number(req.params.inbrm_id); //ดึงทุกตัว
    if (!inbrm_id || isNaN(Number(inbrm_id))) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ service สำหรับลบ location
        const response = await inbrawaterialService.delete(inbrm_id, reqUsername);
        // ส่งผลลัพธ์กลับไปยัง client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        // จัดการข้อผิดพลาดหากเกิดขึ้น
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.inbrm', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'InbRawMaterialController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const response = await inbrawaterialService.getAll();
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbrm', true, reqUsername);
    }
};

export const getAllDetails = async (req: Request, res: Response) => {
    const operation = 'InbRawMaterialController.getAllDetails';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const rmifm_id = Number(req.params.rmifm_id);
    if (!rmifm_id || isNaN(Number(rmifm_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        // เรียกใช้ Service โดยส่งค่าจาก `req.params`
        const response = await inbrawaterialService.getAllDetails(rmifm_id);
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbrm', true, reqUsername);
    }
};

export const getById = async (req: Request, res: Response) => {
    const operation = 'InbRawMaterialController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const inbrm_id = Number(req.params.inbrm_id);
    if (!inbrm_id || isNaN(Number(inbrm_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.inbrm_id:', inbrm_id);

        const response = await inbrawaterialService.getById(inbrm_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbrm', true, reqUsername);
    }
};

export const getBomByInbrmId = async (req: Request, res: Response) => {
    const operation = 'InbRawMaterialController.getBomByInbrmId';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    const inbrm_id = Number(req.params.inbrm_id);
    if (!inbrm_id || isNaN(Number(inbrm_id))) {
        return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.inbrm_id:', inbrm_id);

        const response = await inbrawaterialService.getBomByInbrmId(inbrm_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbrm', true, reqUsername);
    }
};

export const getInbrmDropdown = async (req: Request, res: Response) => {
    const operation = 'InbRawMaterialController.getInbrmDropdown';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        // รับค่า isBomUsed และ inbrm_bom จาก query parameters
        const isBomUsedParam = req.query.isBomUsed as string | undefined;
        const inbrmBomParam = req.query.inbrm_bom as string | undefined;

        // ตรวจสอบค่าที่ได้รับ (isBomUsed ต้องเป็น 'true' หรือ 'false')
        if (isBomUsedParam !== undefined && isBomUsedParam !== 'true' && isBomUsedParam !== 'false') {
            return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
        }

        // เรียก service และส่งค่า isBomUsed, inbrm_bom
        const response = await inbrawaterialService.getInbrmDropdown(isBomUsedParam, inbrmBomParam);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error.message);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbrm', true, reqUsername);
    }
};


export const getBomDropdown = async (req: Request, res: Response) => {
    const operation = 'InbRawMaterialController.getBomDropdown';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {

        // ส่งค่า isBomUsed ไปที่ service
        const response = await inbrawaterialService.getBomDropdown();

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error.message);
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbrm', true, reqUsername);
    }
};

export const getInventoryAll = async (req: Request, res: Response) => {
    const operation = 'InbRawMaterialController.getInventoryAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        const { ftyName, whName } = req.query; // ดึงค่าจาก Query Params
        const response = await inbrawaterialService.getInventoryAll(undefined, ftyName as string, whName as string);
        
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.inbrm', true, reqUsername);
    }
};

export const exportAllToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Inbound_Raw_Material_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ ดึงค่า filter จาก query string
        const filters = {
            rm_type: req.query.rm_type ? String(req.query.rm_type).trim().normalize("NFC") : undefined,
            rmifm_code: req.query.rmifm_code ? String(req.query.rmifm_code).trim().normalize("NFC") : undefined,
            rmifm_name: req.query.rmifm_name ? String(req.query.rmifm_name).trim().normalize("NFC") : undefined,
            inbrm_quantity: req.query.inbrm_quantity ? Number(req.query.inbrm_quantity) : undefined,
            inbrm_total_weight: req.query.inbrm_total_weight ? Number(req.query.inbrm_total_weight) : undefined
        };
        console.log('✅ Filters:', filters);

        const response = await inbrawaterialService.getAll();
        console.log('✅ Data retrieved from inbrawaterialService:', response);

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
            { title: 'รายงานรับวัตถุดิบทั้งหมด', row: 3, col: 1 ,colspan:3, horizontal: 'left'}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'รหัส', key: 'rmifm_code', col: 2, colspan: 1 },
                { title: 'ประเภท', key: 'rm_type', col: 3, colspan: 1 },
                { title: 'ชื่อ', key: 'rmifm_name', col: 4, colspan: 1 },
                { title: 'น้ำหนักรวม', key: 'inbrm_total_weight', col: 5, colspan: 1 },
                { title: 'จำนวน', key: 'inbrm_quantity', col: 6, colspan: 1 }
            ],
            startRow: 6 // ✅ ถ้ามี Sub-Header ให้เริ่มที่แถว 5
        };
        
        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any, index: number) => ({
            no: index + 1,
            rmifm_code: item.rmifm_code,
            rm_type: item.rm_type,
            rmifm_name: item.rmifm_name,
            inbrm_total_weight: item.inbrm_total_weight,
            inbrm_quantity: item.inbrm_quantity 
        }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        await ExcelService.exportToExcel(excelStructure, excelData, [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 14,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting Inbound Raw Material to Excel:', error);
        return ResponseUtils.handleError(res, 'exportAllToExcel', error.message, 'exporting inbound Raw Material');
    }
};

export const exportDetailsToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Inbound_Raw_Material_Details_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ รับค่า `rmifm_id` จาก query string
        const rmifm_id = req.query.rmifm_id ? Number(req.query.rmifm_id) : NaN;
        if (Number.isNaN(rmifm_id)) {
            console.log('❌ Invalid rmifm_id:', req.query.rmifm_id);
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        // ✅ ดึงค่า filter จาก query string (ไม่ต้องแก้ไขโค้ดนี้)
        const filters = {
            create_time: req.query.create_time ? String(req.query.create_time).trim() : undefined,
            inbrm_code: req.query.inbrm_code ? String(req.query.inbrm_code).trim().normalize("NFC") : undefined,
            inbrm_grade: req.query.inbrm_grade ? String(req.query.inbrm_grade).trim().normalize("NFC") : undefined,
            fty_name: req.query.fty_name ? String(req.query.fty_name).trim().normalize("NFC") : undefined,
            wh_name: req.query.wh_name ? String(req.query.wh_name).trim().normalize("NFC") : undefined,
            zn_name: req.query.zn_name ? String(req.query.zn_name).trim().normalize("NFC") : undefined,
            loc_name: req.query.loc_name ? String(req.query.loc_name).trim().normalize("NFC") : undefined,
            inbrm_quantity: req.query.inbrm_quantity ? Number(req.query.inbrm_quantity) : undefined
        };
        console.log('✅ Filters:', filters);

        // ✅ ตรวจสอบว่าต้องกรองเฉพาะข้อมูลของวันนี้หรือไม่ (default = true)
        const filterToday = req.query.filterToday !== 'false';

        // ✅ ดึงข้อมูลจาก `getAllDetails`
        const response = await inbrawaterialService.getAllDetails(rmifm_id);
        console.log('✅ Data retrieved from inbrawaterialService:', response);      

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
            { title: `รายงานรับวัตถุดิบประจำวัน`, row: 3, col: 1 ,colspan:3, horizontal: 'left'},
            { title: 'วันที่พิมพ์', key: 'today_date', row: 3, col: 14 ,colspan: 2}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header พร้อมเพิ่ม No.
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 }, // เพิ่มคอลัมน์ No.
                { title: 'รหัส', key: 'inbrm_code', col: 2, colspan: 1 },
                { title: 'ชื่อ', key: 'rmifm_name', col: 3, colspan: 1 },
                { title: 'ขนาด', col: 4, colspan: 4 },
                { title: 'เกรด', key: 'inbrm_grade', col: 8, colspan: 1 },
                { title: 'Lot', key: 'inbrm_lot', col: 9, colspan: 1 },
                { title: 'Store', col: 10, colspan: 4 },
                { title: 'BOM NO.', key: 'inbrm_bom', col: 14, colspan: 1 },
                { title: 'จำนวน', key: 'inbrm_quantity', col: 15, colspan: 1 },
                { title: 'หน่วย', key: 'unit_abbr_th', col: 16, colspan: 1 }
            ],
            subHeaders: [
                { title: 'ความกว้าง', key: 'rmifm_width', col: 4 },
                { title: 'ความยาว', key: 'rmifm_length', col: 5},
                { title: 'ความหนา', key: 'rmifm_thickness', col: 6 },
                { title: 'น้ำหนัก', key: 'rmifm_weight', col: 7 },
                { title: 'โรงงาน', key: 'fty_name', col: 10 },
                { title: 'คลัง', key: 'wh_name', col: 11 },
                { title: 'Zone', key: 'zn_name', col: 12 },
                { title: 'Location', key: 'loc_name', col: 13 }
            ],
            startRow: 7
        };

        console.log(`✅ Today’s formatted date: ${todayDateFormatted}`);

        // ✅ กรองข้อมูลที่มีวันที่ตรงกับวันนี้
        const excelData = filteredData
            .filter((item: any) => {
                return filterToday ? item.formatted_date === todayDateFormatted : true;
            })
            .map((item: any, index: number) => ({
                no: index + 1,
                formatted_date: item.formatted_date,
                create_time: item.create_time,
                today_date: item.today_date,
                rmifm_code: item.rmifm_code,
                rmifm_name: item.rmifm_name,
                rmifm_width: item.rmifm_width,
                rmifm_length: item.rmifm_length,
                rmifm_thickness: item.rmifm_thickness,
                rmifm_weight: item.rmifm_weight,
                inbrm_grade: item.inbrm_grade,
                inbrm_lot: item.inbrm_lot,
                inbrm_code: item.inbrm_code,
                fty_name: item.fty_name,
                wh_name: item.wh_name,
                zn_name: item.zn_name,
                loc_name: item.loc_name,
                inbrm_bom: item.inbrm_bom,
                inbrm_quantity: item.inbrm_quantity,
                unit_abbr_th: item.unit_abbr_th
            }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        //ใช้ [...] เพื่อสร้าง array ใหม่
        await ExcelService.exportToExcel(excelStructure, excelData,  [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 16,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting Inbound Raw Material to Excel:', error);
        return ResponseUtils.handleError(res, 'exportDetailsToExcel', error.message, 'exporting inbound raw material');
    }
};

export const exportINVAllToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Inventory_Raw_Material_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ ดึงค่า filter จาก query string (ไม่ต้องแก้ไขโค้ดนี้)
        const filters = {
            fty_name: req.query.fty_name ? String(req.query.fty_name).trim().normalize("NFC") : undefined,
            wh_name: req.query.wh_name ? String(req.query.wh_name).trim().normalize("NFC") : undefined,
        };
        console.log('✅ Filters:', filters);

        const response = await inbrawaterialService.getInventoryAll();
        console.log('✅ Data retrieved from inbrawaterialService:', response);

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
            { title: 'รายงานรายการวัตถุดิบทั้งหมด', row: 3, col: 1 ,colspan:3, horizontal: 'left'}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'รหัสสินค้า', key: 'inbrm_code', col: 2, colspan: 1 },
                { title: 'ชื่อสินค้า', key: 'rmifm_name', col: 3, colspan: 1 },
                { title: 'จำนวนคงเหลือในคลัง', key: 'inbrm_quantity', col: 4, colspan: 1 },
                { title: 'Lot.', key: 'inbrm_lot', col: 5, colspan: 1 }, // 🔹 คอลัมน์ที่สามารถเอาออกได้
                { title: 'โรงงาน', key: 'fty_name', col: 6, colspan: 1 },
                { title: 'คลัง', key: 'wh_name', col: 7 , colspan: 1 }
            ],
            startRow: 6 // ✅ ถ้ามี Sub-Header ให้เริ่มที่แถว 5
        };

        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any,  index: number) => ({
            no: index + 1,
            inbrm_code: item.inbrm_code,
            rmifm_name: item.rmifm_name,
            inbrm_quantity: item.inbrm_quantity,
            inbrm_lot: item.inbrm_lot,
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
        console.error('❌ Error exporting Inventory Raw Material to Excel:', error);
        return ResponseUtils.handleError(res, 'exportINVAllToExcel', error.message, 'exporting inventory Raw Material');
    }
};
