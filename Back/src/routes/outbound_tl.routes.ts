import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as outbtoolingController from '../controllers/outb_tooling.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: OutboundTL
 *   description: การจัดการใบเบิกเครื่องมือและอุปกรณ์ (TL)
 */

/**
 * @swagger
 * /api/outbound-tl/create:
 *   post:
 *     summary: สร้างใบเบิกเครื่องมือ/อุปกรณ์ (Outbound Tooling)
 *     tags: [OutboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               outbtl_issued_by:
 *                 type: string
 *                 description: ชื่อผู้เบิก
 *                 example: "สวัสดี มงคล"
 *               outbtl_details:
 *                 type: string
 *                 description: รายละเอียดใบเบิก Tooling (Outbound)
 *                 example: เบิกเครื่องมือสำหรับโครงการ A
 *               outbtl_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งาน
 *                 example: true
 *               items:
 *                 type: array
 *                 description: รายการเครื่องมือที่ต้องการเบิก
 *                 items:
 *                   type: object
 *                   properties:
 *                     inbtl_id:
 *                       type: integer
 *                       description: ไอดี Tooling (Inbound)
 *                       example: 1
 *     responses:
 *       201:
 *         description: สร้างข้อมูลสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลที่เกี่ยวข้อง
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create', authenticateToken, outbtoolingController.create);

/**
 * @swagger
 * /api/outbound-tl/update/{outbtl_id}:
 *   put:
 *     summary: แก้ไขข้อมูลใบเบิกเครื่องมือ/อุปกรณ์ (Outbound Tooling)
 *     tags: [OutboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - name: outbtl_id
 *         in: path
 *         required: true
 *         description: ไอดีใบเบิกเครื่องมือ/อุปกรณ์ที่ต้องการแก้ไข
 *         schema:
 *           type: integer
 *           example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               outbtl_issued_by:
 *                 type: string
 *                 example: บัวแดง มงคล
 *               outbtl_details:
 *                 type: string
 *                 example: แก้ไขรายละเอียดใบเบิกเครื่องมือ
 *               outbtl_is_active:
 *                 type: boolean
 *                 example: true
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     inbtl_id:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลใบเบิกเครื่องมือ/อุปกรณ์สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลที่เกี่ยวข้อง
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:outbtl_id'
    , authenticateToken
    , outbtoolingController.update);


/**
 * @swagger
 * /api/outbound-tl/return-tooling/{id}:
 *   put:
 *     summary: คืนเครื่องมือและอุปกรณ์ (Return Outbound Tooling Items)
 *     tags: [OutboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ไอดีใบเบิกเครื่องมือ/อุปกรณ์ที่ต้องการคืน
 *         schema:
 *           type: number
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               outbtl_returned_by:
 *                 type: string
 *                 description: ชื่อผู้คืน
 *                 example: "สิงหา พันธ์วา"
 *               items:
 *                 type: string
 *                 description: รายการ JSON ที่ส่งมาในรูปแบบ stringified
 *                 example: '[{"outbtlitm_id":1,"outbtlitm_remark":"ค้อนเสียหาย","outbtlitm_img":"ชิว่า.jpg"}]'
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: ไฟล์รูปภาพที่เกี่ยวข้องกับรายการ
 *     responses:
 *       200:
 *         description: คืนเครื่องมือ/อุปกรณ์สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบข้อมูลที่เกี่ยวข้อง
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/return-tooling/:id', authenticateToken, outbtoolingController.returnTooling);

/**
 * @swagger
 * /api/outbound-tl/update-dates/{outbtl_id}:
 *   put:
 *     summary: อัปเดตวันเวลาใบเบิก
 *     tags: [OutboundTL]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: outbtl_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีใบเบิกเครื่องมือ/อุปกรณ์
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               withdr_date:
 *                 type: string
 *                 format: date-time
 *                 description: วันที่ใบเบิก
 *     responses:
 *       200:
 *         description: อัปเดตวันเวลาสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกเครื่องมือ/อุปกรณ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update-dates/:outbtl_id', authenticateToken, outbtoolingController.updateDates);


/**
 * @swagger
 * /api/outbound-tl/delete/{outbtl_id}:
 *   delete:
 *     summary: ลบข้อมูลใบเบิกเครื่องมือ/อุปกรณ์
 *     tags: [OutboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbtl_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีใบเบิกเครื่องมือ/อุปกรณ์ที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลใบเบิกเครื่องมือ/อุปกรณ์สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกเครื่องมือ/อุปกรณ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:outbtl_id'
    , authenticateToken
    , outbtoolingController.del);


/**
 * @swagger
 * /api/outbound-tl/get-all:
 *   get:
 *     summary: ดึงข้อมูลใบเบิกเครื่องมือ/อุปกรณ์ทั้งหมด
 *     tags: [OutboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลใบเบิกเครื่องมือ/อุปกรณ์
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกเครื่องมือ/อุปกรณ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , outbtoolingController.getAll);
    
/**
 * @swagger
 * /api/outbound-tl/get-by-id/{outbtl_id}:
 *   get:
 *     summary: ดึงข้อมูลการเบิกเครื่องมือ/อุปกรณ์ตามไอดี
 *     tags: [OutboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbtl_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีใบเบิกเครื่องมือ/อุปกรณ์
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกเครื่องมือ/อุปกรณ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:outbtl_id', authenticateToken, outbtoolingController.getById);

/**
 * @swagger
 * /api/outbound-tl/get-requisition-by-id/{outbtl_id}:
 *   get:
 *     summary: ดึงข้อมูลใบเบิกเครื่องมือ/อุปกรณ์ตามไอดี
 *     tags: [OutboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbtl_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีใบเบิกเครื่องมือ/อุปกรณ์
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกเครื่องมือ/อุปกรณ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-requisition-by-id/:outbtl_id', authenticateToken, outbtoolingController.getReqById);

/**
 * @swagger
 * /api/outbound-tl/export-to-excel:
 *   get:
 *     summary: Export Outbound Tooling Data to Excel
 *     tags: [OutboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: formatted_date
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาวันที่สร้างในรูปแบบ เช่น 02 Feb 25 (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: create_time
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาเวลาที่สร้างในรูปแบบ HH:mm:ss (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: return_date
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาวันที่คืนของในรูปแบบ เช่น 02 Feb 25 (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: return_time
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาเวลาที่คืนของในรูปแบบ HH:mm:ss (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: outbtl_code
 *         schema:
 *           type: string
 *         required: false
 *         description: เลขที่ใบเบิก (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: outbtl_details
 *         schema:
 *           type: string
 *         required: false
 *         description: รายละเอียด (ใช้เพื่อค้นหาเฉพาะจำนวนที่กำหนด)
 *       - in: query
 *         name: outbtl_appr_status
 *         schema:
 *           type: string
 *         required: false
 *         description: สถานะอนุมัติในรูปแบบ APPROVED , PENDING , REJECTED (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
  *       - in: query
 *         name: outbtl_return_status
 *         schema:
 *           type: string
 *         required: false
 *         description: สถานะคืนในรูปแบบ RETURNED , PARTIAL_RETURNED , NOT_RETURNED (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: outbtl_issued_by
 *         schema:
 *           type: string
 *         required: false
 *         description: ชื่อผู้ทำเรื่องเบิก (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: outbtl_returned_by
 *         schema:
 *           type: string
 *         required: false
 *         description: ชื่อผู้ทำเรื่องคืน (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *     responses:
 *       200:
 *         description: ไฟล์ Excel ถูกสร้างและส่งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าเครื่องมือที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-to-excel', authenticateToken, outbtoolingController.exportAllToExcel);

export default router;