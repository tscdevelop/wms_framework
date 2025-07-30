import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as inbfinishedgoodsController from '../controllers/inb_finished_goods.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: InboundFG
 *   description: การจัดการการนำเข้าสินค้าสำเร็จรูป (FG)
 */

/**
 * @swagger
 * /api/inbound-fg/create:
 *   post:
 *     summary: สร้างการนำเข้าสินค้าสำเร็จรูป (FG)
 *     tags: [InboundFG]
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
 *               fgifm_id:
 *                 type: number
 *                 description: ไอดีรายการสินค้าสำเร็จรูป
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
 *               inbfg_grade:
 *                 type: string
 *                 description: Grade ของสินค้าสำเร็จรูป
 *                 example: "A"
 *               inbfg_lot:
 *                 type: string
 *                 description: Lot ของสินค้าสำเร็จรูป
 *                 example: "LOT20231201"
 *               inbfg_quantity:
 *                 type: number
 *                 description: จำนวน
 *                 example: 100
 *               inbfg_color:
 *                 type: number
 *                 description: สี
 *                 example: 15.0
 *               inbfg_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "This is a test remark"
 *               sup_id:
 *                 type: number
 *                 description: ไอดี supplier
 *                 example: 1
 *               inbfg_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งาน
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลนำเข้าสินค้าสำเร็จรูปสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
, authenticateToken
, inbfinishedgoodsController.create);

/**
 * @swagger
 * /api/inbound-fg/update/{inbfg_id}:
 *   put:
 *     summary: แก้ไขการนำเข้าสินค้าสำเร็จรูปที่มีอยู่ (FG)
 *     tags: [InboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: inbfg_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีสินค้าสำเร็จรูป
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fgifm_id:
 *                 type: number
 *                 description: ไอดีรายการสินค้าสำเร็จรูป
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
 *               inbfg_grade:
 *                 type: string
 *                 description: Grade ของสินค้าสำเร็จรูป
 *                 example: "A"
 *               inbfg_lot:
 *                 type: string
 *                 description: Lot ของสินค้าสำเร็จรูป
 *                 example: "LOT20232202"
 *               inbfg_quantity:
 *                 type: number
 *                 description: จำนวน
 *                 example: 200
 *               inbfg_color:
 *                 type: number
 *                 description: สี
 *                 example: 25.0
 *               inbfg_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "This is a test remark"
 *               sup_id:
 *                 type: number
 *                 description: ไอดี supplier
 *                 example: 1
 *               inbfg_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งาน
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลการนำเข้าสินค้าสำเร็จรูปสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:inbfg_id'
    , authenticateToken
    , inbfinishedgoodsController.update);

/**
 * @swagger
 * /api/inbound-fg/delete/{inbfg_id}:
 *   delete:
 *     summary: ลบข้อมูลการนำเข้าสินค้าสำเร็จรูปตามไอดีการนำเข้าสินค้าสำเร็จรูป (FG)
 *     tags: [InboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: inbfg_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีสินค้าสำเร็จรูป
 *     responses:
 *       200:
 *         description: ลบข้อมูลการนำเข้าสินค้าสำเร็จรูปสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:inbfg_id'
, authenticateToken
, inbfinishedgoodsController.del);

/**
 * @swagger
 * /api/inbound-fg/get-all:
 *   get:
 *     summary: ดึงข้อมูลการนำเข้าสินค้าสำเร็จรูปทั้งหมด (FG)
 *     tags: [InboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลการนำเข้าสินค้าสำเร็จรูป
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , inbfinishedgoodsController.getAll);

/**
 * @swagger
 * /api/inbound-fg/get-all-details/{fgifm_id}:
 *   get:
 *     summary: ดึงข้อมูลรายละเอียดการนำเข้าสินค้าสำเร็จรูปทั้งหมด (FG)
 *     tags: [InboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: fgifm_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีรายการสินค้าสำเร็จรูป
 *     responses:
 *       200:
 *         description: พบข้อมูลรายละเอียดการนำเข้าสินค้าสำเร็จรูป
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายละเอียดการนำเข้าสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all-details/:fgifm_id'
    , authenticateToken
    , inbfinishedgoodsController.getAllDetails);

/**
 * @swagger
 * /api/inbound-fg/get-by-id/{inbfg_id}:
 *   get:
 *     summary: ดึงข้อมูลการนำเข้าสินค้าสำเร็จรูปตามไอดีการนำเข้าสินค้าสำเร็จรูป (FG)
 *     tags: [InboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: inbfg_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีสินค้าสำเร็จรูป
 *     responses:
 *       200:
 *         description: พบข้อมูลการนำเข้าสินค้าสำเร็จรูป
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:inbfg_id'
, authenticateToken
, inbfinishedgoodsController.getById);

/**
 * @swagger
 * /api/inbound-fg/export-to-excel:
 *   get:
 *     summary: Export Inbound Finished Goods Data to Excel
 *     description: ส่งออกข้อมูลสินค้าสำเร็จรูปเป็นไฟล์ Excel โดยสามารถใช้ตัวกรองข้อมูลได้
 *     tags: [InboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fg_type
 *         schema:
 *           type: string
 *         required: false
 *         description: ประเภทของสินค้าสำเร็จรูป (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: fgifm_code
 *         schema:
 *           type: string
 *         required: false
 *         description: รหัสสินค้าสำเร็จรูป (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: fgifm_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ชื่อสินค้าสำเร็จรูป (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: inbfg_quantity
 *         schema:
 *           type: number
 *         required: false
 *         description: จำนวนสินค้าสำเร็จรูปที่นำเข้า (ใช้เพื่อค้นหาเฉพาะจำนวนที่กำหนด)
 *     responses:
 *       200:
 *         description: ไฟล์ Excel ถูกสร้างและส่งสำเร็จ
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลสินค้าสำเร็จรูปที่ตรงกับเงื่อนไขที่กำหนด
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-to-excel', authenticateToken, inbfinishedgoodsController.exportAllToExcel);

/**
 * @swagger
 * /api/inbound-fg/export-details-to-excel:
 *   get:
 *     summary: Export Inbound FG Details to Excel
 *     description: ส่งออกข้อมูลสินค้าสำเร็จรูปเป็นไฟล์ Excel โดยสามารถใช้ตัวกรองข้อมูลได้
 *     tags: [InboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fgifm_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีสินค้าสำเร็จรูปที่ต้องการดึงข้อมูล
 *         example: 1
 *       - in: query
 *         name: create_time
 *         schema:
 *           type: string
 *         required: false
 *         description: เวลาที่นำเข้าในรูปแบบ HH:mm:ss (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: inbfg_code
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหารหัส inbound (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: inbfg_color
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาสี (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: inbfg_grade
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
 *         name: inbfg_quantity
 *         schema:
 *           type: integer
 *         required: false
 *         description: จำนวนสินค้าสำเร็จรูปที่นำเข้า (ใช้เพื่อค้นหาเฉพาะจำนวนที่กำหนด)
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
 *         description: ไม่พบข้อมูลการนำเข้าสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-details-to-excel', authenticateToken, inbfinishedgoodsController.exportDetailsToExcel);


export default router;