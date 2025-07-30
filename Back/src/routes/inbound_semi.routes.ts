import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as inbsemiController from '../controllers/inb_semi.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: InboundSemi
 *   description: การจัดการการนำเข้าสินค้า semi
 */

/**
 * @swagger
 * /api/inbound-semi/create:
 *   post:
 *     summary: สร้างการนำเข้าสินค้า semi
 *     tags: [InboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               semiifm_id:
 *                 type: number
 *                 description: ไอดีรายการสินค้า semi
 *                 example: "1"
 *               fty_id:
 *                 type: number
 *                 description: ไอดีโรงงาน
 *                 example: "1"
 *               wh_id:
 *                 type: number
 *                 description: ไอดีคลังสินค้า
 *                 example: "1"
 *               zn_id:
 *                 type: number
 *                 description: ไอดีโซนในคลังสินค้า
 *                 example: "1"
 *               loc_id:
 *                 type: number
 *                 description: ไอดีตำแหน่งที่ตั้ง
 *                 example: 1
 *               inbsemi_grade:
 *                 type: string
 *                 description: Grade ของสินค้า semi
 *                 example: "A"
 *               inbsemi_lot:
 *                 type: string
 *                 description: Lot ของสินค้า semi
 *                 example: "LOT20231201"
 *               inbsemi_quantity:
 *                 type: number
 *                 description: จำนวน
 *                 example: 100
 *               inbsemi_color:
 *                 type: number
 *                 description: สี
 *                 example: 15.0
 *               inbsemi_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "This is a test remark"
 *               sup_id:
 *                 type: number
 *                 description: ไอดี supplier
 *                 example: 1
 *               inbsemi_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งาน
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลนำเข้าสินค้า semi สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้า semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
, authenticateToken
, inbsemiController.create);

/**
 * @swagger
 * /api/inbound-semi/update/{inbsemi_id}:
 *   put:
 *     summary: แก้ไขการนำเข้าสินค้า semiที่มีอยู่
 *     tags: [InboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: inbsemi_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีสินค้า semi
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               semiifm_id:
 *                 type: number
 *                 description: ไอดีรายการสินค้า semi
 *                 example: "1"
 *               fty_id:
 *                 type: number
 *                 description: ไอดีโรงงาน
 *                 example: "1"
 *               wh_id:
 *                 type: number
 *                 description: ไอดีคลังสินค้า
 *                 example: "1"
 *               zn_id:
 *                 type: number
 *                 description: ไอดีโซนในคลังสินค้า
 *                 example: "1"
 *               loc_id:
 *                 type: number
 *                 description: ไอดีตำแหน่งที่ตั้ง
 *                 example: 1
 *               inbsemi_grade:
 *                 type: string
 *                 description: Grade ของสินค้า semi
 *                 example: "A"
 *               inbsemi_lot:
 *                 type: string
 *                 description: Lot ของสินค้า semi
 *                 example: "LOT20232202"
 *               inbsemi_quantity:
 *                 type: number
 *                 description: จำนวน
 *                 example: 200
 *               inbsemi_color:
 *                 type: number
 *                 description: สี
 *                 example: 25.0
 *               inbsemi_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "This is a test remark"
 *               sup_id:
 *                 type: number
 *                 description: ไอดี supplier
 *                 example: 1
 *               inbsemi_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งาน
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลการนำเข้าสินค้า semi สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้า semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:inbsemi_id'
    , authenticateToken
    , inbsemiController.update);

/**
 * @swagger
 * /api/inbound-semi/delete/{inbsemi_id}:
 *   delete:
 *     summary: ลบข้อมูลการนำเข้าสินค้า semi
 *     tags: [InboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: inbsemi_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีสินค้า semi
 *     responses:
 *       200:
 *         description: ลบข้อมูลการนำเข้าสินค้า semi สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้า semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:inbsemi_id'
, authenticateToken
, inbsemiController.del);

/**
 * @swagger
 * /api/inbound-semi/get-all:
 *   get:
 *     summary: ดึงข้อมูลการนำเข้าสินค้า semi
 *     tags: [InboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลการนำเข้าสินค้า semi
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้า semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , inbsemiController.getAll);

/**
 * @swagger
 * /api/inbound-semi/get-all-details/{semiifm_id}:
 *   get:
 *     summary: ดึงข้อมูลรายละเอียดการนำเข้าสินค้า semi
 *     tags: [InboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: semiifm_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีรายการ semi
 *     responses:
 *       200:
 *         description: พบข้อมูลรายละเอียดการนำเข้าสินค้า semi
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายละเอียดการนำเข้าสินค้า semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all-details/:semiifm_id'
    , authenticateToken
    , inbsemiController.getAllDetails);

/**
 * @swagger
 * /api/inbound-semi/get-by-id/{inbsemi_id}:
 *   get:
 *     summary: ดึงข้อมูลการนำเข้าสินค้า semi
 *     tags: [InboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: inbsemi_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีสินค้า semi
 *     responses:
 *       200:
 *         description: พบข้อมูลการนำเข้าสินค้า semi
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้า semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:inbsemi_id'
, authenticateToken
, inbsemiController.getById);

/**
 * @swagger
 * /api/inbound-semi/export-to-excel:
 *   get:
 *     summary: Export Inbound Semi FG Data to Excel
 *     description: ส่งออกข้อมูลสินค้ากึ่งสำเร็จรูปเป็นไฟล์ Excel โดยสามารถใช้ตัวกรองข้อมูลได้
 *     tags: [InboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: semi_type
 *         schema:
 *           type: string
 *         required: false
 *         description: ประเภทของสินค้ากึ่งสำเร็จรูป (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: semiifm_code
 *         schema:
 *           type: string
 *         required: false
 *         description: รหัสสินค้ากึ่งสำเร็จรูป (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: semiifm_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ชื่อสินค้ากึ่งสำเร็จรูป (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: inbsemi_quantity
 *         schema:
 *           type: number
 *         required: false
 *         description: จำนวนสินค้ากึ่งสำเร็จรูปที่นำเข้า (ใช้เพื่อค้นหาเฉพาะจำนวนที่กำหนด)
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
router.get('/export-to-excel', authenticateToken, inbsemiController.exportAllToExcel);

/**
 * @swagger
 * /api/inbound-semi/export-details-to-excel:
 *   get:
 *     summary: Export Inbound Semi FG Details to Excel
 *     description: ส่งออกข้อมูลสินค้ากึ่งสำเร็จรูปเป็นไฟล์ Excel โดยสามารถใช้ตัวกรองข้อมูลได้
 *     tags: [InboundSemi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: semiifm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการ semi 
 *       - in: query
 *         name: create_time
 *         schema:
 *           type: string
 *         required: false
 *         description: เวลาที่นำเข้าในรูปแบบ HH:mm:ss (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: inbsemi_code
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหารหัส inbound (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: inbsemi_color
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาสี (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: inbsemi_grade
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาเกรด (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: fty_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาชื่อโรงงาน (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: wh_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาชื่อคลัง (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: zn_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาชื่อโซน (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: loc_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาชื่อlocation (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: inbsemi_quantity
 *         schema:
 *           type: integer
 *         required: false
 *         description: จำนวนสินค้ากึ่งสำเร็จรูปที่นำเข้า (ใช้เพื่อค้นหาเฉพาะจำนวนที่กำหนด)
 *       - in: query
 *         name: filterToday
 *         schema:
 *           type: boolean
 *           default: true
 *         required: false
 *         description: ถ้าเป็น true (ค่าเริ่มต้น) จะกรองเฉพาะข้อมูลของวันที่วันนี้เท่านั้น. ถ้าเป็น false จะแสดงข้อมูลทั้งหมด
 *     responses:
 *       200:
 *         description: ไฟล์ Excel ถูกสร้างและส่งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้ารายการ semi ที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-details-to-excel', authenticateToken, inbsemiController.exportDetailsToExcel);

export default router;