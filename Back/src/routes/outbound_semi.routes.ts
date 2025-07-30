import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as outbsemiController from '../controllers/outb_semi.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: OutboundSemi
 *   description: การจัดการสินค้า Semi
 */

/**
 * @swagger
 * /api/outbound-semi/create:
 *   post:
 *     summary: สร้างสินค้า Semi
 *     tags: [OutboundSemi]
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
 *               outbsemi_details:
 *                 type: string
 *                 description: รายละเอียดของ Outbound Semi
 *                 example: "กรอกรายละเอียด outbound semi"
 *               outbsemi_so:
 *                 type: string
 *                 description: รายละเอียดเลขที่ใบ SO.
 *                 example: "SO1234"
 *               outbsemi_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "หมายเหตุ"
 *               outbsemi_driver_name:
 *                 type: string
 *                 description: ชื่อคนขับ
 *                 example: "วิบูรณ์ สงคราม"
 *               outbsemi_vehicle_license:
 *                 type: string
 *                 description: ทะเบียนรถ
 *                 example: "กข1254"
 *               outbsemi_phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์
 *                 example: "0985623654"
 *               outbsemi_address:
 *                 type: string
 *                 description: ที่อยู๋
 *                 example: "ที่อยู๋"
 *               tspyard_id:
 *                 type: integer
 *                 description: ไอดีท่ารถ
 *                 example: "1"
 *               outbsemi_is_returned:
 *                 type: boolean
 *                 description: นำกลับหรือไม่
 *                 example: true
 *               items:
 *                 type: array
 *                 description: รายการสินค้า semi ที่ต้องการเบิก
 *                 items:
 *                   type: object
 *                   properties:
 *                     inbsemi_id:
 *                       type: integer
 *                       description: ไอดี `inbsemi_id` ของ semi
 *                       example: 1
 *                     outbsemiitm_quantity:
 *                       type: number
 *                       description: จำนวนที่ต้องการเบิก
 *                       example: 10
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
router.post('/create',
    authenticateToken,
    outbsemiController.create
);

/**
 * @swagger
 * /api/outbound-semi/withdraw-scan/{outbsemi_id}:
 *   post:
 *     summary: บันทึกการสแกนบาร์โค้ด รายการเบิกหลายรายการ
 *     tags: [OutboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbsemi_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีของ Outbound Semi ที่ต้องการสแกน
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 description: รายการ Inbound Semi ที่ต้องการเบิก
 *                 items:
 *                   type: object
 *                   properties:
 *                     inbsemi_id:
 *                       type: integer
 *                       description: ไอดีของ Inbound Semi
 *                       example: 1
 *                     outbsemiitm_withdr_count:
 *                       type: integer
 *                       description: จำนวนที่ต้องการเบิก
 *                       example: 10
 *     responses:
 *       200:
 *         description: บันทึกจำนวนการสแกนสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isCompleted:
 *                   type: boolean
 *                   description: สถานะการทำงานสำเร็จ
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: ข้อความแสดงผลลัพธ์
 *                   example: "Scan count updated successfully"
 *                 isError:
 *                   type: boolean
 *                   description: สถานะการเกิดข้อผิดพลาด
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       outbsemi_id:
 *                         type: number
 *                         description: ไอดีของ Outbound Semi
 *                         example: 1
 *                       inbsemi_id:
 *                         type: number
 *                         description: ไอดีของ Inbound Semi
 *                         example: 2
 *                       outbsemiitm_withdr_count:
 *                         type: number
 *                         description: จำนวนการสแกนที่บันทึก
 *                         example: 3
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง
 *       404:
 *         description: ไม่พบข้อมูลสำหรับบาร์โค้ดนี้
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/withdraw-scan/:outbsemi_id', authenticateToken, outbsemiController.withdrScan);

/**
 * @swagger
 * /api/outbound-semi/shipment-scan/{outbsemi_id}:
 *   post:
 *     summary: บันทึกการสแกนบาร์โค้ด รายการส่งสินค้าหลายรายการ
 *     tags: [OutboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbsemi_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีของ Outbound Semi ที่ต้องการสแกน
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 description: รายการ Inbound Semi ที่ต้องการสแกนส่งออก
 *                 items:
 *                   type: object
 *                   properties:
 *                     inbsemi_id:
 *                       type: integer
 *                       description: ไอดีของ Inbound Semi
 *                       example: 1
 *                     outbsemiitm_shipmt_count:
 *                       type: integer
 *                       description: จำนวนที่ต้องการส่งออก
 *                       example: 10
 *     responses:
 *       200:
 *         description: บันทึกจำนวนการสแกนสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isCompleted:
 *                   type: boolean
 *                   description: สถานะการทำงานสำเร็จ
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: ข้อความแสดงผลลัพธ์
 *                   example: "Scan count updated successfully"
 *                 isError:
 *                   type: boolean
 *                   description: สถานะการเกิดข้อผิดพลาด
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       outbsemi_id:
 *                         type: number
 *                         description: ไอดีของ Outbound Semi
 *                         example: 1
 *                       inbsemi_id:
 *                         type: number
 *                         description: ไอดีของ Inbound Semi
 *                         example: 2
 *                       outbsemiitm_shipmt_count:
 *                         type: number
 *                         description: จำนวนการสแกนที่บันทึก
 *                         example: 3
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง
 *       404:
 *         description: ไม่พบข้อมูลสำหรับบาร์โค้ดนี้
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/shipment-scan/:outbsemi_id', authenticateToken, outbsemiController.shipmtScan);


/**
 * @swagger
 * /api/outbound-semi/update/{outbsemi_id}:
 *   put:
 *     summary: แก้ไขสินค้า Semi
 *     tags: [OutboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbsemi_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีใบเบิก Semi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               outbsemi_details:
 *                 type: string
 *                 description: รายละเอียดของ Outbound Semi
 *                 example: "แก้ไขรายละเอียด outbound semi"
 *               outbsemi_so:
 *                 type: string
 *                 description: รายละเอียดเลขที่ใบ SO.
 *                 example: "SO5467"
 *               outbsemi_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "แก้ไขหมายเหตุ"
 *               outbsemi_driver_name:
 *                 type: string
 *                 description: ชื่อคนขับ
 *                 example: "ธนชาติ โชคดี"
 *               outbsemi_vehicle_license:
 *                 type: string
 *                 description: ทะเบียนรถ
 *                 example: "หก6666"
 *               outbsemi_phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์
 *                 example: "0258746981"
 *               outbsemi_address:
 *                 type: string
 *                 description: ที่อยู๋
 *                 example: "แก้ไขที่อยู๋"
 *               tspyard_id:
 *                 type: integer
 *                 description: ไอดีท่ารถ
 *                 example: 2
 *               outbsemi_is_returned:
 *                 type: boolean
 *                 description: นำกลับหรือไม่
 *                 example: false
 *               items:
 *                 type: array
 *                 description: รายการสินค้า semi ที่ต้องการเบิก
 *                 items:
 *                   type: object
 *                   properties:
 *                     inbsemi_id:
 *                       type: integer
 *                       description: ไอดี `inbsemi_id` ของ semi
 *                       example: 2
 *                     outbsemiitm_quantity:
 *                       type: number
 *                       description: จำนวนที่ต้องการเบิก
 *                       example: 20
 *     responses:
 *       200:  # เปลี่ยนเป็น 200 OK
 *         description: แก้ไขข้อมูลสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลที่เกี่ยวข้อง
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:outbsemi_id',
    authenticateToken,
    outbsemiController.update
);

/**
 * @swagger
 * /api/outbound-semi/update-dates/{outbsemi_id}:
 *   put:
 *     summary: อัปเดตวันเวลาใบเบิก
 *     tags: [OutboundSemi]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: outbsemi_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีใบเบิก Outbound Semi
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
 *               shipmt_date:
 *                 type: string
 *                 format: date-time
 *                 description: วันที่ใบส่งสินค้า
 *     responses:
 *       200:
 *         description: อัปเดตวันเวลาสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลใบเบิก Outbound Semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update-dates/:outbsemi_id', authenticateToken, outbsemiController.updateDates);

/**
 * @swagger
 * /api/outbound-semi/delete/{outbsemi_id}:
 *   delete:
 *     summary: ลบข้อมูลสินค้า Semi
 *     tags: [OutboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbsemi_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีใบเบิก Outbound Semi
 *     responses:
 *       200:
 *         description: ลบข้อมูลสำเร็จ
 *       404:
 *         description: ไม่พบข้อมูลที่ต้องการลบ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:outbsemi_id', authenticateToken, outbsemiController.del);

/**
 * @swagger
 * /api/outbound-semi/get-all:
 *   get:
 *     summary: ดึงข้อมูล Semi ทั้งหมด
 *     tags: [OutboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: approvalStatus
 *         schema:
 *           type: string
 *           enum: [APPROVED, REJECTED, PENDING]
 *         required: false
 *         description: "ระบุสถานะการอนุมัติ (APPROVED, REJECTED, PENDING) เพื่อดึงข้อมูลเฉพาะสถานะนั้น (ไม่ระบุจะดึงข้อมูลทั้งหมด)"
 *       - in: query
 *         name: returnedStatus
 *         schema:
 *           type: boolean
 *         required: false
 *         description: "true = คืนค่าข้อมูลที่นำกลับ(ใบเบิก) , false = คืนค่าข้อมูลที่ส่งออกภายนอก(ใบนำส่ง) , ไม่ระบุ = เอาข้อมูลทั้งหมด"
 *     responses:
 *       200:
 *         description: พบข้อมูล Outbound Semi
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , outbsemiController.getAll);

/**
 * @swagger
 * /api/outbound-semi/get-by-id/{outbsemi_id}:
 *   get:
 *     summary: ดึงข้อมูล Outbound Semi ตาม ID
 *     tags: [OutboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: outbsemi_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีใบเบิก Semi
 *     responses:
 *       200:
 *         description: พบข้อมูล Outbound Semi
 *       404:
 *         description: ไม่พบข้อมูล
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:outbsemi_id', authenticateToken, outbsemiController.getById);

/**
 * @swagger
 * /api/outbound-semi/get-requisition-by-id/{outbsemi_id}:
 *   get:
 *     summary: ดึงข้อมูลใบเบิก Outbound Semi
 *     tags: [OutboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbsemi_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีใบเบิก Outbound Semi
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *       404:
 *         description: ไม่พบข้อมูลใบเบิก Outbound Semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-requisition-by-id/:outbsemi_id', authenticateToken, outbsemiController.getReqByID);

/**
 * @swagger
 * /api/outbound-semi/export-to-excel:
 *   get:
 *     summary: Export Outbound Semi FG Data to Excel
 *     tags: [OutboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: formatted_date
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาวันที่ในรูปแบบ เช่น 02 Feb 25 (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: create_time
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาเวลาในรูปแบบ HH:mm:ss (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: outbsemi_code
 *         schema:
 *           type: string
 *         required: false
 *         description: เลขที่ใบเบิก (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: outbsemi_details
 *         schema:
 *           type: string
 *         required: false
 *         description: รายละเอียด (ใช้เพื่อค้นหาเฉพาะจำนวนที่กำหนด)
 *       - in: query
 *         name: outbsemi_appr_status
 *         schema:
 *           type: string
 *         required: false
 *         description: สถานะอนุมัติในรูปแบบ APPROVED , PENDING , REJECTED (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
  *       - in: query
 *         name: outbsemiitm_withdr_status
 *         schema:
 *           type: string
 *         required: false
 *         description: สถานะเบิกในรูปแบบ COMPLETED , PARTIAL , PENDING (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: outbsemiitm_shipmt_status
 *         schema:
 *           type: string
 *         required: false
 *         description: สถานะจัดส่งในรูปแบบ COMPLETED , PARTIAL , PENDING (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *     responses:
 *       200:
 *         description: ไฟล์ Excel ถูกสร้างและส่งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้า semi ที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-to-excel', authenticateToken, outbsemiController.exportAllToExcel);

export default router;
