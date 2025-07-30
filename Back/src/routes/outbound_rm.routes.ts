import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as outbrawmaterialController from '../controllers/outb_raw_material.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: OutboundRM
 *   description: การจัดการใบเบิกวัตถุดิบ (RM)
 */

/**
 * @swagger
 * /api/outbound-rm/create:
 *   post:
 *     summary: สร้างใบเบิกวัตถุดิบ (Outbound RM)
 *     description: |
 *       รองรับกรณีที่ใช้ BOM และไม่ใช้ BOM
 *       
 *       - **กรณีใช้ BOM ให้ใส่ `outbrm_is_bom_used = true`**:  
 *       - **กรณีไม่ใช้ BOM ให้ใส่ `outbrm_is_bom_used = false`**:  
 *     tags: [OutboundRM]
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
 *               outbrm_details:
 *                 type: string
 *                 description: รายละเอียดของ Outbound RM
 *                 example: "กรอกรายละเอียด outbound rm"
 *               outbrm_is_bom_used:
 *                 type: boolean
 *                 description: |
 *                   สถานะการใช้ BOM:
 *                   - `true` = ใช้ BOM → ต้องใช้ `inbrm_id`
 *                   - `false` = ไม่ใช้ BOM → ต้องใช้ `inbrm_id`
 *                 example: true
 *               items:
 *                 type: array
 *                 description: รายการวัตถุดิบที่ต้องการเบิก
 *                 items:
 *                   type: object
 *                   properties:
 *                     inbrm_id:
 *                       type: number
 *                       description: รหัส `inbrm_id` ของวัตถุดิบ
 *                       example: 5
 *                     outbrmitm_quantity:
 *                       type: number
 *                       description: จำนวนวัตถุดิบที่ต้องการเบิก
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
    outbrawmaterialController.create
);

/**
 * @swagger
 * /api/outbound-rm/withdraw-scan/{outbrm_id}:
 *   post:
 *     summary: บันทึกการสแกนบาร์โค้ด รายการเบิกวัตถุดิบหลายรายการ
 *     tags: [OutboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbrm_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีของ Outbound Raw Material ที่ต้องการสแกน
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 description: รายการ Inbound Raw Material ที่ต้องการเบิก
 *                 items:
 *                   type: object
 *                   properties:
 *                     inbrm_id:
 *                       type: integer
 *                       description: ไอดีของ Inbound Raw Material
 *                       example: 1
 *                     outbrmitm_issued_count:
 *                       type: integer
 *                       description: จำนวนที่ต้องการเบิก
 *                       example: 5
 *     responses:
 *       200:
 *         description: บันทึกจำนวนการเบิกสำเร็จ
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
 *                       outbrm_id:
 *                         type: number
 *                         description: ไอดีของ Outbound Raw Material
 *                         example: 1
 *                       inbrm_id:
 *                         type: number
 *                         description: ไอดีของ Inbound Raw Material
 *                         example: 2
 *                       outbrmitm_issued_count:
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
router.post('/withdraw-scan/:outbrm_id', authenticateToken, outbrawmaterialController.withdrScan);

/**
 * @swagger
 * /api/outbound-rm/update/{outbrm_id}:
 *   put:
 *     summary: แก้ไขใบเบิกวัตถุดิบ
 *     tags: [OutboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: outbrm_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: รหัสใบเบิกวัตถุดิบ (`outbrm_id`)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               outbrm_details:
 *                 type: string
 *                 description: รายละเอียดของ Outbound RM
 *                 example: "กรอกรายละเอียด outbound rm"
 *               outbrm_is_bom_used:
 *                 type: boolean
 *                 description: |
 *                   สถานะการใช้ BOM:
 *                   - `true` = ใช้ BOM → ต้องใช้ `inbrm_id`
 *                   - `false` = ไม่ใช้ BOM → ต้องใช้ `inbrm_id`
 *                 example: true
 *               items:
 *                 type: array
 *                 description: รายการวัตถุดิบที่ต้องการเบิก
 *                 items:
 *                   type: object
 *                   properties:
 *                     inbrm_id:
 *                       type: number
 *                       description: รหัส `inbrm_id` ของวัตถุดิบ
 *                       example: 5
 *                     outbrmitm_quantity:
 *                       type: number
 *                       description: จำนวนวัตถุดิบที่ต้องการเบิก
 *                       example: 10
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลใบเบิกวัตถุดิบสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกวัตถุดิบ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:outbrm_id', authenticateToken, outbrawmaterialController.update)

/**
 * @swagger
 * /api/outbound-rm/update-dates/{outbrm_id}:
 *   put:
 *     summary: อัปเดตวันเวลาใบเบิก
 *     tags: [OutboundRM]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: outbrm_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีใบเบิกวัตถุดิบ
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
 *         description: ไม่พบข้อมูลใบเบิกวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update-dates/:outbrm_id', authenticateToken, outbrawmaterialController.updateDates);

/**
 * @swagger
 * /api/outbound-rm/delete/{outbrm_id}:
 *   delete:
 *     summary: ลบข้อมูลใบเบิกวัตถุดิบตามไอดี
 *     tags: [OutboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbrm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีใบเบิกวัตถุดิบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลใบเบิกวัตถุดิบสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:outbrm_id'
    , authenticateToken
    , outbrawmaterialController.del);

/**
 * @swagger
 * /api/outbound-rm/get-all:
 *   get:
 *     summary: ดึงข้อมูลใบเบิกวัตถุดิบทั้งหมด
 *     tags: [OutboundRM]
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
 *     responses:
 *       200:
 *         description: พบข้อมูลใบเบิกวัตถุดิบ
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
 *                   example: "Data found"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       outbrm_id:
 *                         type: number
 *                         description: รหัสใบเบิกวัตถุดิบ
 *                         example: 1
 *                       outbrm_code:
 *                         type: string
 *                         description: รหัสใบเบิก
 *                         example: "RM20240001"
 *                       outbrm_details:
 *                         type: string
 *                         description: รายละเอียดใบเบิก
 *                         example: "Request for raw material"
 *                       outbrm_appr_status:
 *                         type: string
 *                         description: สถานะการอนุมัติ
 *                         example: PENDING
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all', authenticateToken, outbrawmaterialController.getAll);

    
/**
 * @swagger
 * /api/outbound-rm/get-by-id/{outbrm_id}:
 *   get:
 *     summary: ดึงข้อมูลใบเบิกวัตถุดิบตามไอดี
 *     tags: [OutboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbrm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีใบเบิกวัตถุดิบ
 *     responses:
 *       200:
 *         description: พบข้อมูลใบเบิกวัตถุดิบ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:outbrm_id'
    , authenticateToken
    , outbrawmaterialController.getById);

/**
 * @swagger
 * /api/outbound-rm/get-requisition-by-id/{outbrm_id}:
 *   get:
 *     summary: ดึงข้อมูลใบเบิกวัตถุดิบตามไอดี
 *     tags: [OutboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbrm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีใบเบิกวัตถุดิบ
 *     responses:
 *       200:
 *         description: ไฟล์ Excel ถูกสร้างและส่งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าวัตถุดิบที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/get-requisition-by-id/:outbrm_id', authenticateToken, outbrawmaterialController.getReqByID);

    /**
 * @swagger
 * /api/outbound-rm/export-to-excel:
 *   get:
 *     summary: Export Outbound RM Data to Excel
 *     tags: [OutboundRM]
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
 *         name: outbrm_code
 *         schema:
 *           type: string
 *         required: false
 *         description: เลขที่ใบเบิก (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: outbrm_details
 *         schema:
 *           type: string
 *         required: false
 *         description: รายละเอียด (ใช้เพื่อค้นหาเฉพาะจำนวนที่กำหนด)
 *       - in: query
 *         name: outbrm_appr_status
 *         schema:
 *           type: string
 *         required: false
 *         description: สถานะอนุมัติในรูปแบบ APPROVED , PENDING , REJECTED (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
  *       - in: query
 *         name: outbrmitm_withdr_status
 *         schema:
 *           type: string
 *         required: false
 *         description: สถานะเบิกในรูปแบบ COMPLETED , PARTIAL , PENDING (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *     responses:
 *       200:
 *         description: ไฟล์ Excel ถูกสร้างและส่งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าวัตถุดิบที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-to-excel', authenticateToken, outbrawmaterialController.exportAllToExcel);


export default router;