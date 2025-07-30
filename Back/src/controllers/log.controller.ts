import { Request, Response } from 'express';
import { LogService } from '../services/log.service';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import RequestUtils from '../utils/RequestUtils';
import * as lang from '../utils/LangHelper';
import { ApiResponse } from '../models/api-response.model';
import { m_log_inb_outb } from '../entities/m_log_inb_outb.entity';

const logService = new LogService();

const safeValue = (value: any, defaultValue: any = null): any => {
    return value === undefined || value === null || value === "" ? defaultValue : value;
};

const safeNumber = (value: any): number | null => {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
};


/**
 * บันทึก Transaction Log
 * @param req Request
 * @param res Response
 */
// export const createTransactionLog = async (req: Request, res: Response) => {
//     const operation = 'TransactionLogController.createTransactionLog';

//     const username = RequestUtils.getUsernameToken(req, res);
//     if (!username) {
//         return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
//     }

//     try {
//         const requestData = req.body;

//         if (!requestData.code) {
//             return ResponseUtils.handleBadRequest(res, lang.msgRequired('field.code'));
//         }
//         if (!requestData.log_type) {
//             return ResponseUtils.handleBadRequest(res, lang.msgRequired('field.log_type'));
//         }
//         if (!requestData.log_name) {
//             return ResponseUtils.handleBadRequest(res, lang.msgRequired('field.name'));
//         }
//         if (!requestData.log_action) {
//             return ResponseUtils.handleBadRequest(res, lang.msgRequired('field.log_action'));
//         }

//         if (!['inbound', 'outbound'].includes(requestData.log_type)) {
//             return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
//         }

//         if (!['created', 'updated', 'deleted', 'returned'].includes(requestData.log_action)) {
//             return ResponseUtils.handleBadRequest(res, lang.msgInvalidParameter());
//         }

//         // Map ข้อมูลไปยัง TransactionDataModel
//         const transactionData: Partial<TransactionDataModel> = {
//             log_type: safeValue(requestData.log_type),
//             log_name: safeValue(requestData.log_name),
//             log_action: safeValue(requestData.log_action),
//             id: safeValue(requestData.id),
//             code: safeValue(requestData.code),
//             name: safeValue(requestData.name),
//             type_id: safeValue(requestData.type_id),
//             factory_id: safeValue(requestData.factory_id),
//             warehouse_id: safeValue(requestData.warehouse_id),
//             zone_id: safeValue(requestData.zone_id),
//             location_id: safeValue(requestData.location_id),
//             grade: safeValue(requestData.grade),
//             lot: safeValue(requestData.lot),
//             width: safeNumber(requestData.width),
//             width_unitId: safeValue(requestData.width_unitId),
//             length: safeNumber(requestData.length),
//             length_unitId: safeValue(requestData.length_unitId),
//             weight: safeNumber(requestData.weight),
//             weight_unitId: safeValue(requestData.weight_unitId),
//             thickness: safeNumber(requestData.thickness),
//             thickness_unitId: safeValue(requestData.thickness_unitId),
//             quantity: safeNumber(requestData.quantity),
//             quantity_unitId: safeValue(requestData.quantity_unitId),
//             color: safeValue(requestData.color),
//             barcode: safeValue(requestData.barcode),
//             supplier: safeValue(requestData.supplier),
//             exp_low: safeNumber(requestData.exp_low),
//             exp_medium: safeNumber(requestData.exp_medium),
//             exp_high: safeNumber(requestData.exp_high),
//             rem_low: safeValue(requestData.rem_low),
//             rem_medium: safeValue(requestData.rem_medium),
//             rem_high: safeValue(requestData.rem_high),
//             txn_low: safeNumber(requestData.txn_low),
//             txn_medium: safeNumber(requestData.txn_medium),
//             txn_high: safeNumber(requestData.txn_high),
//             details: safeValue(requestData.details),
//             remark: safeValue(requestData.remark),
//             jobnb: safeValue(requestData.jobnb),
//             so_id: safeValue(requestData.so_id),
//             ponb: safeValue(requestData.ponb),
//             priority: safeValue(requestData.priority),
//             shipment: safeValue(requestData.shipment),
//             driver_name: safeValue(requestData.driver_name),
//             vehicle_license: safeValue(requestData.vehicle_license),
//             phone: safeValue(requestData.phone),
//             address: safeValue(requestData.address),
//             tspyard_id: safeValue(requestData.tspyard_id),
//         };

//         // เรียกใช้ Service
//         await logService.logTransaction(transactionData, username);

//         // Response
//         const response = new ApiResponse<null>();
//         response.setComplete(lang.msgSuccessAction('created', 'field.transaction_log'), null);

//         return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);

//     } catch (error: any) {
//         console.error(`Error during ${operation}:`, error);
//         return ResponseUtils.handleErrorCreate(
//             res,
//             operation,
//             error.message,
//             'log.transaction',
//             true,
//             username
//         );
//     }
// };

export const create = async (req: Request, res: Response) => {
    const operation = 'LogController.create';

    const reqUsername = RequestUtils.getUsernameToken(req, res);
    if (!reqUsername) {
        return ResponseUtils.handleBadRequest(res, lang.msgRequiredUsername());
    }

    try {
        console.log('Raw req.body:', req.body);

        // ดึงข้อมูลจาก req.body
        const { log_type, log_ctgy, log_action, ref_id, transaction_data } = req.body;

        if (!log_type || !log_ctgy || !log_action || !ref_id || !transaction_data) {
            return ResponseUtils.handleBadRequest(res, lang.msg('validation.missing_required_fields'));
        }

        // ✅ บันทึก Log และรับค่ากลับ
        const savedLog = await logService.logTransaction(
            log_type,
            log_ctgy,
            log_action,
            ref_id,
            transaction_data || null,
            reqUsername
        );

        // ✅ ส่ง Log ที่บันทึกกลับไปใน response
        const response = new ApiResponse<m_log_inb_outb>();
        response.setComplete(lang.msgSuccessAction('created', 'field.transaction_log'), savedLog);

        return ResponseUtils.handleCustomResponse(res, response, HttpStatus.CREATED);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error);
        return ResponseUtils.handleErrorCreate(res, operation, error.message, 'logs', true, reqUsername);
    }
};
