import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as inbtoolingController from '../controllers/inb_tooling.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: InboundTL
 *   description: การจัดการการนำเข้าเครื่องมือ/อุปกรณ์ (Tooling)
 */

/**
 * @swagger
 * /api/inbound-tl/create:
 *   post:
 *     summary: สร้างการนำเข้าเครื่องมือ/อุปกรณ์ (Tooling)
 *     tags: [InboundTL]
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
 *               tlifm_id:
 *                 type: number
 *                 description: ไอดีรายการเครื่องมือ/อุปกรณ์
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
 *               sup_id:
 *                 type: number
 *                 description: ไอดี supplier
 *                 example: 1
 *               inbtl_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "หมายเหตุ"
 *               inbtl_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งาน
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลการนำเข้าเครื่องมือ/อุปกรณ์สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าเครื่องมือ/อุปกรณ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , inbtoolingController.create);

/**
 * @swagger
 * /api/inbound-tl/update/{inbtl_id}:
 *   put:
 *     summary: แก้ไขการนำเข้าเครื่องมือ/อุปกรณ์ที่มีอยู่ (Tooling)
 *     tags: [InboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: inbtl_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีเครื่องมือ/อุปกรณ์
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               tlifm_id:
 *                 type: number
 *                 description: ไอดีรายการเครื่องมือ/อุปกรณ์
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
 *               sup_id:
 *                 type: number
 *                 description: ไอดี supplier
 *                 example: 1
 *               inbtl_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "หมายเหตุ"
 *               inbtl_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งาน
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลการนำเข้าเครื่องมือ/อุปกรณ์สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าเครื่องมือ/อุปกรณ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:inbtl_id'
    , authenticateToken
    , inbtoolingController.update);

/**
 * @swagger
 * /api/inbound-tl/delete/{inbtl_id}:
 *   delete:
 *     summary: ลบข้อมูลการนำเข้าเครื่องมือ/อุปกรณ์ตามไอดี (Tooling)
 *     tags: [InboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: inbtl_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีเครื่องมือ/อุปกรณ์
 *     responses:
 *       200:
 *         description: ลบข้อมูลการนำเข้าเครื่องมือ/อุปกรณ์สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าเครื่องมือ/อุปกรณ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:inbtl_id'
    , authenticateToken
    , inbtoolingController.del);

    /**
 * @swagger
 * /api/inbound-tl/get-all:
 *   get:
 *     summary: ดึงข้อมูลการนำเข้าเครื่องมือ/อุปกรณ์ทั้งหมด (Tooling)
 *     tags: [InboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลการนำเข้าเครื่องมือ/อุปกรณ์
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าเครื่องมือ/อุปกรณ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , inbtoolingController.getAll);

/**
 * @swagger
 * /api/inbound-tl/get-all-details/{tlifm_id}:
 *   get:
 *     summary: ดึงข้อมูลรายละเอียดการนำเข้าเครื่องมือและอุปกรณ์
 *     tags: [InboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: tlifm_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีรายการเครื่องมือและอุปกรณ์
 *     responses:
 *       200:
 *         description: พบข้อมูลรายละเอียดการนำเข้าเครื่องมือและอุปกรณ์
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายละเอียดการนำเข้าเครื่องมือและอุปกรณ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all-details/:tlifm_id'
    , authenticateToken
    , inbtoolingController.getAllDetails);

/**
 * @swagger
 * /api/inbound-tl/get-by-id/{inbtl_id}:
 *   get:
 *     summary: ดึงข้อมูลการนำเข้าเครื่องมือ/อุปกรณ์ตามไอดี (Tooling)
 *     tags: [InboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: inbtl_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีเครื่องมือ/อุปกรณ์
 *     responses:
 *       200:
 *         description: พบข้อมูลการนำเข้าเครื่องมือ/อุปกรณ์
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าเครื่องมือ/อุปกรณ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:inbtl_id'
    , authenticateToken
    , inbtoolingController.getById);

/**
 * @swagger
 * /api/inbound-tl/export-to-excel:
 *   get:
 *     summary: Export Inbound Tooling Data to Excel
 *     description: ส่งออกข้อมูลเครื่องมือและอุปกรณ์เป็นไฟล์ Excel โดยสามารถใช้ตัวกรองข้อมูลได้
 *     tags: [InboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tl_type
 *         schema:
 *           type: string
 *         required: false
 *         description: ประเภทของเครื่องมือและอุปกรณ์ (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: tlifm_code
 *         schema:
 *           type: string
 *         required: false
 *         description: รหัสเครื่องมือและอุปกรณ์ (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: tlifm_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ชื่อเครื่องมือและอุปกรณ์ (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: inbtl_quantity
 *         schema:
 *           type: number
 *         required: false
 *         description: จำนวนเครื่องมือและอุปกรณ์ที่นำเข้า (ใช้เพื่อค้นหาเฉพาะจำนวนที่กำหนด)
 *     responses:
 *       200:
 *         description: ไฟล์ Excel ถูกสร้างและส่งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้ารายการเครื่องมือที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-to-excel', authenticateToken, inbtoolingController.exportAllToExcel);


/**
 * @swagger
 * /api/inbound-tl/export-details-to-excel:
 *   get:
 *     summary: Export Inbound Tooling Details to Excel
 *     description: ส่งออกข้อมูลเครื่องมือและอุปกรณ์เป็นไฟล์ Excel โดยสามารถใช้ตัวกรองข้อมูลได้
 *     tags: [InboundTL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tlifm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการเครื่องมือ
 *       - in: query
 *         name: create_time
 *         schema:
 *           type: string
 *         required: false
 *         description: เวลาที่นำเข้าในรูปแบบ HH:mm:ss (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: inbtl_code
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหารหัส inbound (รองรับการค้นหาบางส่วน)
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
 *         name: inbtl_quantity
 *         schema:
 *           type: integer
 *         required: false
 *         description: จำนวนเครื่องมือและอุปกรณ์ที่นำเข้า (ใช้เพื่อค้นหาเฉพาะจำนวนที่กำหนด)
 *       - in: query
 *         name: inbtl_remark
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาหมายเหตุ (รองรับการค้นหาบางส่วน)
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
 *         description: ไม่พบข้อมูลการนำเข้ารายการเครื่องมือที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-details-to-excel', authenticateToken, inbtoolingController.exportDetailsToExcel);


export default router;