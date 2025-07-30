import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as inbrawmaterialController from '../controllers/inb_raw_material.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: InboundRM
 *   description: การจัดการการนำเข้าวัตถุดิบ (RM)
 */

/**
 * @swagger
 * /api/inbound-rm/create:
 *   post:
 *     summary: สร้างการนำเข้าวัตถุดิบ (RM)
 *     tags: [InboundRM]
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
 *               rmifm_id:
 *                 type: number
 *                 description: ไอดีรายการวัตถุดิบ
 *                 example: 1
 *               inbrm_is_bom_used:
 *                 type: boolean
 *                 description: สถานะการใช้ bom
 *                 example: true
 *               inbrm_bom:
 *                 type: string
 *                 description: bom number
 *                 example: "B001"
 *               fty_id:
 *                 type: number
 *                 description: ไอดีโรงงาน
 *                 example: 1
 *               wh_id:
 *                 type: number
 *                 description: ไอดีคลังสินค้า
 *                 example: 1
 *               zn_id:
 *                 type: number
 *                 description: ไอดีโซนในคลังสินค้า
 *                 example: 1
 *               loc_id:
 *                 type: number
 *                 description: ไอดีตำแหน่งที่ตั้ง
 *                 example: 1
 *               inbrm_grade:
 *                 type: string
 *                 description: Grade ของวัตถุดิบ
 *                 example: "A"
 *               inbrm_lot:
 *                 type: string
 *                 description: Lot ของวัตถุดิบ
 *                 example: "LOT20231201"
 *               inbrm_quantity:
 *                 type: number
 *                 description: จำนวน
 *                 example: 100
 *               inbrm_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "This is a test remark"
 *               sup_id:
 *                 type: number
 *                 description: ไอดี supplier
 *                 example: 1
 *               inbrm_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งาน
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลการนำเข้าวัตถุดิบสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , inbrawmaterialController.create);

/**
 * @swagger
 * /api/inbound-rm/update/{inbrm_id}:
 *   put:
 *     summary: แก้ไขการนำเข้าวัตถุดิบที่มีอยู่ (RM)
 *     tags: [InboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: inbrm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีวัตถุดิบที่นำเข้า
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               rmifm_id:
 *                 type: number
 *                 description: ไอดีรายการวัตถุดิบ
 *                 example: 2
 *               inbrm_is_bom_used:
 *                 type: boolean
 *                 description: สถานะการใช้ bom
 *                 example: true
 *               inbrm_bom:
 *                 type: string
 *                 description: bom number
 *                 example: "B002"
 *               fty_id:
 *                 type: number
 *                 description: ไอดีโรงงาน
 *                 example: 2
 *               wh_id:
 *                 type: number
 *                 description: ไอดีคลังสินค้า
 *                 example: 2
 *               zn_id:
 *                 type: number
 *                 description: ไอดีโซนในคลังสินค้า
 *                 example: 2
 *               loc_id:
 *                 type: number
 *                 description: ไอดีตำแหน่งที่ตั้ง
 *                 example: 2
 *               inbrm_grade:
 *                 type: string
 *                 description: Grade ของวัตถุดิบ
 *                 example: "A"
 *               inbrm_lot:
 *                 type: string
 *                 description: Lot ของวัตถุดิบ
 *                 example: "LOT20231201"
 *               inbrm_quantity:
 *                 type: number
 *                 description: จำนวน
 *                 example: 2
 *               inbrm_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "This is a test remark"
 *               sup_id:
 *                 type: number
 *                 description: ไอดี supplier
 *                 example: 2
 *               inbrm_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งาน
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลการนำเข้าวัตถุดิบสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:inbrm_id'
    , authenticateToken
    , inbrawmaterialController.update);

/**
 * @swagger
 * /api/inbound-rm/delete/{inbrm_id}:
 *   delete:
 *     summary: ลบข้อมูลการนำเข้าวัตถุดิบตามไอดีการนำเข้าวัตถุดิบ (RM)
 *     tags: [InboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: inbrm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีวัตถุดิบที่นำเข้า
 *     responses:
 *       200:
 *         description: ลบข้อมูลการนำเข้าวัตถุดิบสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:inbrm_id'
    , authenticateToken
    , inbrawmaterialController.del);

/**
 * @swagger
 * /api/inbound-rm/get-all:
 *   get:
 *     summary: ดึงข้อมูลการนำเข้าวัตถุดิบทั้งหมด (RM)
 *     tags: [InboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลการนำเข้าวัตถุดิบ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , inbrawmaterialController.getAll);

/**
 * @swagger
 * /api/inbound-rm/get-all-details/{rmifm_id}:
 *   get:
 *     summary: ดึงข้อมูลรายละเอียดการนำเข้าวัตถุดิบทั้งหมด (RM)
 *     tags: [InboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: rmifm_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีรายการวัตถุดิบ
 *     responses:
 *       200:
 *         description: พบข้อมูลรายละเอียดการนำเข้าวัตถุดิบ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายละเอียดการนำเข้าวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all-details/:rmifm_id'
    , authenticateToken
    , inbrawmaterialController.getAllDetails);
    
/**
 * @swagger
 * /api/inbound-rm/get-by-id/{inbrm_id}:
 *   get:
 *     summary: ดึงข้อมูลการนำเข้าวัตถุดิบตามไอดีการนำเข้าวัตถุดิบ (RM)
 *     tags: [InboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: inbrm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีวัตถุดิบที่นำเข้า
 *     responses:
 *       200:
 *         description: พบข้อมูลการนำเข้าวัตถุดิบ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:inbrm_id'
    , authenticateToken
    , inbrawmaterialController.getById);

/**
 * @swagger
 * /api/inbound-rm/get-bom-by-id/{inbrm_id}:
 *   get:
 *     summary: ดึงข้อมูล bom ตามไอดีการนำเข้าวัตถุดิบ (RM) // ใช้ใน outbound rm
 *     tags: [InboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: inbrm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีวัตถุดิบที่นำเข้า
 *     responses:
 *       200:
 *         description: พบข้อมูล bom ตามไอดีการนำเข้าวัตถุดิบ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล bom ตามไอดีการนำเข้าวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-bom-by-id/:inbrm_id'
    , authenticateToken
    , inbrawmaterialController.getBomByInbrmId);
    
/**
 * @swagger
 * /api/inbound-rm/get-bom-dropdown:
 *   get:
 *     summary: ดึงข้อมูล bom ของการนำเข้าวัตถุดิบทั้งหมด (RM)
 *     tags: [InboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูล bom ของการนำเข้าวัตถุดิบ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล bom ของการนำเข้าวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-bom-dropdown'
    , authenticateToken
    , inbrawmaterialController.getBomDropdown);

/**
 * @swagger
 * /api/inbound-rm/export-to-excel:
 *   get:
 *     summary: Export Inbound RM Data to Excel
 *     description: ส่งออกข้อมูลวัตถุดิบเป็นไฟล์ Excel โดยสามารถใช้ตัวกรองข้อมูลได้
 *     tags: [InboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rm_type
 *         schema:
 *           type: string
 *         required: false
 *         description: ประเภทของวัตถุดิบ (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: rmifm_code
 *         schema:
 *           type: string
 *         required: false
 *         description: รหัสวัตถุดิบ (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: rmifm_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ชื่อวัตถุดิบ (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: inbrm_quantity
 *         schema:
 *           type: number
 *         required: false
 *         description: จำนวนวัตถุดิบที่นำเข้า (ใช้เพื่อค้นหาเฉพาะจำนวนที่กำหนด)
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
router.get('/export-to-excel', authenticateToken, inbrawmaterialController.exportAllToExcel);

/**
 * @swagger
 * /api/inbound-rm/export-details-to-excel:
 *   get:
 *     summary: Export Inbound Raw Material Details to Excel
 *     description: ส่งออกข้อมูลวัตถุดิบเป็นไฟล์ Excel โดยสามารถใช้ตัวกรองข้อมูลได้
 *     tags: [InboundRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rmifm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีวัตถุดิบ
 *       - in: query
 *         name: create_time
 *         schema:
 *           type: string
 *         required: false
 *         description: เวลาที่นำเข้าในรูปแบบ HH:mm:ss (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: inbrm_code
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหารหัส inbound (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: inbrm_grade
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
 *         name: inbrm_quantity
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
 *         description: ไม่พบข้อมูลการนำเข้าวัตถุดิบที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-details-to-excel', authenticateToken, inbrawmaterialController.exportDetailsToExcel);


export default router;