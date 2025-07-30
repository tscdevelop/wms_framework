import { Request, Response } from 'express';
import dotenv from 'dotenv';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import * as lang from '../utils/LangHelper'; // ใช้ helper function
import { DataSanitizer } from '../utils/DataSanitizer'; // นำเข้า DataSanitizer
import RequestUtils from '../utils/RequestUtils'; // Import the utility class

import { OutbFGModel , OutbFGNoBomModel} from '../models/outb_finished_goods.model';
import { OutbFinishedGoodsService } from '../services/outb_finished_goods.service';
import { ApprovalStatus, WithdrawStatus } from '../common/global.enum';

import { ExcelService } from '../services/export_excel.service';
import { mapApprovalStatus, mapShipmentStatus, mapWithdrawStatus } from '../utils/StatusMapper';
import { ApiResponse } from '../models/api-response.model';
import { applyFilters } from '../utils/ExportExcelUtils';

dotenv.config();

const outbfinishedgoodsService = new OutbFinishedGoodsService();

export const create = async (req: Request, res: Response) => {
    const operation = 'OutbFinishedGoodsController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('📥 Raw req.body:', req.body);

        // ✅ ตรวจสอบว่ามีข้อมูลถูกส่งมาหรือไม่
        if (!req.body || Object.keys(req.body).length === 0) {
            return ResponseUtils.handleBadRequest(res, lang.msg('request.body.empty'));
        }

        // Sanitization ข้อมูลจาก req.body
        const data: Partial<OutbFGModel> = DataSanitizer.fromObject<OutbFGModel>(
            req.body,
            OutbFGModel
        );
        
        data.create_by = reqUsername;

        // เรียก Service
        const response = await outbfinishedgoodsService.create(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.outbfg', true, reqUsername);
    }
};


export const createNoBom = async (req: Request, res: Response) => {
    const operation = 'OutbFinishedGoodsController.createNoBom';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {  
        console.log('Raw req.body:', req.body);

        // Sanitization ข้อมูลจาก req.body โดยส่ง ModelClass เข้าไปด้วย
        const data: Partial<OutbFGNoBomModel> = DataSanitizer.fromObject(req.body, OutbFGNoBomModel);

        // เรียก Service
        const response = await outbfinishedgoodsService.createNoBom(data, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'item.outbfg', true, reqUsername);
    }
};

export const withdrScan = async (req: Request, res: Response) => {
    const operation = 'OutbFinishedGoodsController.withdrScan';
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    const { outbfg_id } = req.params;
    const { items } = req.body;

    // ตรวจสอบพื้นฐาน
    if (!reqUsername || !outbfg_id || !Array.isArray(items) || items.length === 0) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        const outbfgIdNumber = Number(outbfg_id);

        // ส่งข้อมูลไปยัง service โดยให้ service ตรวจสอบรายละเอียดเอง
        const response = await outbfinishedgoodsService.withdrScan(outbfgIdNumber, items, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.outbfg', true, reqUsername);
    }
};

export const shipmtScan = async (req: Request, res: Response) => {
    const operation = 'OutbFinishedGoodsController.shipmtScan';
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    const { outbfg_id } = req.params;
    const { items } = req.body;

    // ตรวจสอบเบื้องต้น
    if (!reqUsername || !outbfg_id || !Array.isArray(items) || items.length === 0) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        const outbfgIdNumber = Number(outbfg_id);

        // ส่งให้ service จัดการ validation และ logic ทั้งหมด
        const response = await outbfinishedgoodsService.shipmtScan(outbfgIdNumber, items, reqUsername);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.outbfg', true, reqUsername);
    }
};


export const update = async (req: Request, res: Response) => {
    const operation = 'OutbFinishedGoodsController.update';

    // ดึง username จาก Token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        console.log('Raw req.body:', req.body);

        // รับ outbfg_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
        const outbfg_id = Number(req.params.outbfg_id);
        if (!outbfg_id || isNaN(Number(outbfg_id))) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        // Sanitization ข้อมูลจาก req.body โดยส่ง ModelClass เข้าไปด้วย
        const data: Partial<OutbFGModel> = DataSanitizer.fromObject(req.body, OutbFGModel);
        data.update_by = reqUsername;

        // เรียกใช้ Service สำหรับการอัปเดตข้อมูล
        const response = await outbfinishedgoodsService.update(outbfg_id, data, reqUsername);

        // ส่งผลลัพธ์กลับไปยัง Client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.outbfg', true, reqUsername);
    }
};

export const updateNoBom = async (req: Request, res: Response) => {
    const operation = 'OutbFinishedGoodsController.updateNoBom';

    // ดึง username จาก Token
    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        console.log('Raw req.body:', req.body);

        // รับ outbfg_id จากพารามิเตอร์และข้อมูลใหม่จาก req.body
        const outbfg_id = Number(req.params.outbfg_id);
        if (!outbfg_id || isNaN(Number(outbfg_id))) {
            return ResponseUtils.handleBadRequestIsRequired(res, lang.msgInvalidParameter());
        }

        // Sanitization ข้อมูลจาก req.body โดยส่ง ModelClass เข้าไปด้วย
        const data: Partial<OutbFGNoBomModel> = DataSanitizer.fromObject(req.body, OutbFGNoBomModel);
        data.update_by = reqUsername;

        // เรียกใช้ Service สำหรับการอัปเดตข้อมูล
        const response = await outbfinishedgoodsService.updateNoBom(outbfg_id, data, reqUsername);

        // ส่งผลลัพธ์กลับไปยัง Client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.outbfg', true, reqUsername);
    }
};


export const del = async (req: Request, res: Response) => {
    const operation = 'OutbFinishedGoodsController.delete';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // ตรวจสอบและแปลง outbfg_id
    const outbfg_id = Number(req.params.outbfg_id);
    if (!outbfg_id || isNaN(outbfg_id) || outbfg_id <= 0) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        console.log(`Request to delete outbfg_id: ${outbfg_id} by user: ${reqUsername}`);

        // เรียกใช้ Service สำหรับลบข้อมูล
        const response = await outbfinishedgoodsService.delete(outbfg_id, reqUsername);

        // ส่งผลลัพธ์กลับไปยัง Client
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        console.error(`Error in ${operation}:`, error);
        return ResponseUtils.handleErrorDelete(res, operation, error.message, 'item.outbfg', true, reqUsername);
    }
};

export const getAll = async (req: Request, res: Response) => {
    const operation = 'OutbFinishedGoodsController.getAll';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) return;

    try {
        // รับค่า approvalStatus และ withdrawStatus จาก query parameter
        const { approvalStatus, withdrawStatus } = req.query;
        let approvalStatusValue: ApprovalStatus | undefined;
        let filterWithdrawStatus: boolean | undefined;

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
                    'item.outbfg',
                    true,
                    reqUsername
                );
            }
        }

        // ตรวจสอบค่า withdrawStatus ให้เป็น boolean (true/false)
        if (typeof withdrawStatus === 'string') {
            filterWithdrawStatus = withdrawStatus.trim().toLowerCase() === 'true';
        }

        // เรียกใช้ Service พร้อมส่ง approvalStatus และ filterWithdrawStatus ที่ผ่านการตรวจสอบแล้ว
        const response = await outbfinishedgoodsService.getAll(approvalStatusValue, filterWithdrawStatus);
        
        return ResponseUtils.handleResponse(res, response);
    } catch (error: any) {
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.outbfg', true, reqUsername);
    }
};


export const getById = async (req: Request, res: Response) => {
    const operation = 'OutbFinishedGoodsController.getById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // ตรวจสอบและแปลง outbfg_id
    const outbfg_id = Number(req.params.outbfg_id);
    if (!outbfg_id || isNaN(outbfg_id) || outbfg_id <= 0) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.outbfg_id:', outbfg_id);

        const response = await outbfinishedgoodsService.getById(outbfg_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.outbfg', true, reqUsername);
    }
};

export const getReqById = async (req: Request, res: Response) => {
    const operation = 'OutbFinishedGoodsController.getReqById';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    // ตรวจสอบและแปลง outbfg_id
    const outbfg_id = Number(req.params.outbfg_id);
    if (!outbfg_id || isNaN(outbfg_id) || outbfg_id <= 0) {
        return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
    }

    try {
        console.log('Raw req.params.outbfg_id:', outbfg_id);

        const response = await outbfinishedgoodsService.getReqById(outbfg_id);

        return ResponseUtils.handleResponse(res, response);

    } catch (error: any) {
        // Log ข้อผิดพลาด
        console.error(`Error during ${operation}:`, error);

         // จัดการข้อผิดพลาดและส่ง response
        return ResponseUtils.handleErrorGet(res, operation, error.message, 'item.outbfg', true, reqUsername);
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

        // รับ `outbfg_id` จาก `params`
        const outbfg_id = Number(req.params.outbfg_id);

        // รับค่าจาก `multipart/form-data`
        const { withdr_date, shipmt_date } = req.body;

        // ตรวจสอบ `outbfg_id`
        if (!outbfg_id || isNaN(outbfg_id)) {
            return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
        }

        // เรียกใช้ Service สำหรับอัปเดตข้อมูล
        const response = await outbfinishedgoodsService.updateDates(outbfg_id, { withdr_date, shipmt_date });

        // ส่งผลลัพธ์กลับไปยัง Client
        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.OK);

    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorUpdate(res, operation, error.message, 'item.outbfg', true, reqUsername);
    }
};


export const exportAllToExcel = async (req: Request, res: Response) => {
    try {
        const fileName = req.query.fileName ? String(req.query.fileName) : 'Outbound_Finished_Goods_List';
        const documentTitle = req.query.documentTitle ? String(req.query.documentTitle) : 'บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด';

        // ✅ ดึงค่า filter จาก query string
        const filters = {
            formatted_date: req.query.formatted_date ? String(req.query.formatted_date).trim().normalize("NFC") : undefined, 
            create_time: req.query.create_time ? String(req.query.create_time).trim() : undefined,
            outbfg_code: req.query.outbfg_code ? String(req.query.outbfg_code).trim().normalize("NFC") : undefined,
            outbfg_details: req.query.outbfg_details ? String(req.query.outbfg_details).trim().normalize("NFC") : undefined,
            outbfg_appr_status: req.query.outbfg_appr_status ? String(req.query.outbfg_appr_status).trim().normalize("NFC") : undefined,
            outbfgitm_withdr_status: req.query.outbfgitm_withdr_status ? String(req.query.outbfgitm_withdr_status).trim().normalize("NFC") : undefined,
            outbfgitm_shipmt_status: req.query.outbfgitm_shipmt_status ? String(req.query.outbfgitm_shipmt_status).trim().normalize("NFC") : undefined
        };
        console.log('✅ Filters:', filters);

        // ✅ ดึงข้อมูลทั้งหมดจาก `outbfinishedgoodsService`
        const response = await outbfinishedgoodsService.getAll();
        console.log('✅ Data retrieved from outbfinishedgoodsService:', response);

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
            { title: 'รายงานเบิกสินค้าสำเร็จรูปทั้งหมด', row: 3, col: 1 ,colspan:3, horizontal: 'left'},
            { title: 'วันที่พิมพ์', key: 'today_date', row: 3, col: 7 ,colspan: 1}
        ] as const; //เป็นค่าคงที่

        // ✅ โครงสร้าง Header
        const excelStructure = {
            documentTitle,
            headers: [
                { title: 'ลำดับ', key: 'no', col: 1, colspan: 1 },
                { title: 'วันที่', key: 'formatted_date', col: 2},
                { title: 'เวลา', key: 'create_time', col: 3},
                { title: 'เลขที่ใบนำส่ง', key: 'outbfg_code', col: 4},
                { title: 'รายละเอียด', key: 'outbfg_details', col: 5},
                { title: 'สถานะอนุมัติ', key: 'outbfg_appr_status', col: 6},
                { title: 'สถานะเบิก', key: 'outbfgitm_withdr_status', col: 7},
                { title: 'สถานะจัดส่ง', key: 'outbfgitm_shipmt_status', col: 8}
            ],
            startRow: 6 // ✅ ถ้ามี Sub-Header ให้เริ่มที่แถว 5
        };

        // ✅ จัดรูปแบบข้อมูลสำหรับ Excel
        const excelData = filteredData.map((item: any ,index: number) => ({
            no: index + 1,
            formatted_date: item.formatted_date,
            create_time: item.create_time,
            today_date: item.today_date,
            outbfg_code: item.outbfg_code,
            outbfg_details: item.outbfg_details,
            outbfg_appr_status: mapApprovalStatus(item.outbfg_appr_status),
            outbfgitm_withdr_status: mapWithdrawStatus(item.outbfgitm_withdr_status),
            outbfgitm_shipmt_status: mapShipmentStatus(item.outbfgitm_shipmt_status)
        }));

        console.log('✅ Sending data to ExcelService:', excelData.length, 'rows');

        await ExcelService.exportToExcel(excelStructure, excelData, [...extraData], fileName, res, {
            headerBgColor: req.query.headerBgColor ? String(req.query.headerBgColor) : 'FFFFFF',
            headerTextColor: req.query.headerTextColor ? String(req.query.headerTextColor) : '000000',
            titleFontSize: 14,
            titleBold: true
        });

    } catch (error: any) {
        console.error('❌ Error exporting Outbound Finished Goods to Excel:', error);
        return ResponseUtils.handleError(res, 'exportAllToExcel', error.message, 'exporting outbound finished goods');
    }
};

