import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as rawmaterialIfmController from '../controllers/raw_material_ifm.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: RawMaterial
 *   description: การจัดการรายการวัตถุดิบ
 */

/**
 * @swagger
 * /api/raw-material-information/create:
 *   post:
 *     summary: สร้างรายการวัตถุดิบใหม่
 *     tags: [RawMaterial]
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
 *               rmifm_code:
 *                 type: string
 *                 description: รหัสรายการวัตถุดิบ
 *                 example: "001"
 *               rm_id:
 *                 type: number
 *                 description: ไอดีประเภทวัตถุดิบ
 *                 example: 1
 *               crt_id:
 *                 type: number
 *                 description: ไอดีเกณฑ์
 *                 example: 1
 *               rmifm_name:
 *                 type: string
 *                 description: ชื่อวัตถุดิบ
 *                 example: "เหล็ก"
 *               rmifm_width:
 *                 type: number
 *                 description: ความกว้างวัตถุดิบ
 *                 example: 5
 *               rmifm_width_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความกว้าง
 *                 example: 1
 *               rmifm_length:
 *                 type: number
 *                 description: ความยาววัตถุดิบ
 *                 example: 5
 *               rmifm_length_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความยาว
 *                 example: 1
 *               rmifm_thickness:
 *                 type: number
 *                 description: ความหนาวัตถุดิบ
 *                 example: 5
 *               rmifm_thickness_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความหนา
 *                 example: 1
 *               rmifm_weight:
 *                 type: number
 *                 description: น้ำหนักต่อหน่วย
 *                 example: 5
 *               rmifm_weight_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ น้ำหนัก
 *                 example: 1
 *               rmifm_product_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ สินค้า
 *                 example: 2
 *     responses:
 *       201:
 *         description: สร้างข้อมูลวัตถุดิบสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , rawmaterialIfmController.create);

/**
 * @swagger
 * /api/raw-material-information/create-json:
 *   post:
 *     summary: Import Raw Material Data from JSON
 *     tags: [RawMaterial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 รหัส:
 *                   type: string
 *                   example: "001"
 *                 ชื่อ:
 *                   type: string
 *                   example: "RMIfm"
 *                 เกณฑ์:
 *                   type: string
 *                   example: "เกณฑ์สำหรับ RM"
 *                 ประเภท:
 *                   type: string
 *                   example: "RM1"
 *                 ความกว้าง:
 *                   type: number
 *                   example: 5
 *                 หน่วยของความกว้าง:
 *                   type: string
 *                   example: "เซนติเมตร"
 *                 ความยาว:
 *                   type: number
 *                   example: 5
 *                 หน่วยของความยาว:
 *                   type: string
 *                   example: "เซนติเมตร"
 *                 ความหนา:
 *                   type: number
 *                   example: 5
 *                 หน่วยของความหนา:
 *                   type: string
 *                   example: "เซนติเมตร"
 *                 น้ำหนัก:
 *                   type: number
 *                   example: 5
 *                 หน่วยของน้ำหนัก:
 *                   type: string
 *                   example: "กิโลกรัม"
 *                 หน่วยของสินค้า:
 *                   type: string
 *                   example: "ชิ้น"
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */
router.post('/create-json', authenticateToken, rawmaterialIfmController.createJson);

/**
 * @swagger
 * /api/raw-material-information/update/{rmifm_id}:
 *   put:
 *     summary: แก้ไขรายการวัตถุดิบที่มีอยู่
 *     tags: [RawMaterial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: rmifm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการวัตถุดิบ
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               rmifm_code:
 *                 type: string
 *                 description: รหัสรายการวัตถุดิบ
 *                 example: "001"
 *               rm_id:
 *                 type: number
 *                 description: ไอดีประเภทวัตถุดิบ
 *                 example: 2
 *               crt_id:
 *                 type: number
 *                 description: ไอดีเกณฑ์
 *                 example: 2
 *               rmifm_name:
 *                 type: string
 *                 description: ชื่อวัตถุดิบ
 *                 example: "เหล็ก"
 *               rmifm_width:
 *                 type: number
 *                 description: ความกว้างวัตถุดิบ
 *                 example: 10
 *               rmifm_width_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความกว้าง
 *                 example: 2
 *               rmifm_length:
 *                 type: number
 *                 description: ความยาววัตถุดิบ
 *                 example: 10
 *               rmifm_length_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความยาว
 *                 example: 2
 *               rmifm_thickness:
 *                 type: number
 *                 description: ความหนาวัตถุดิบ
 *                 example: 10
 *               rmifm_thickness_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความหนา
 *                 example: 2
 *               rmifm_weight:
 *                 type: number
 *                 description: น้ำหนักต่อหน่วย
 *                 example: 10
 *               rmifm_weight_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ น้ำหนัก
 *                 example: 2
 *               rmifm_product_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ สินค้า
 *                 example: 1
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลวัตถุดิบสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:rmifm_id'
    , authenticateToken
    , rawmaterialIfmController.update);

/**
 * @swagger
 * /api/raw-material-information/delete/{rmifm_id}:
 *   delete:
 *     summary: ลบข้อมูลรายการวัตถุดิบตามไอดีรายการวัตถุดิบ
 *     tags: [RawMaterial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: rmifm_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีรายการวัตถุดิบที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลรายการวัตถุดิบสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:rmifm_id'
    , authenticateToken
    , rawmaterialIfmController.del);

/**
 * @swagger
 * /api/raw-material-information/get-all:
 *   get:
 *     summary: ดึงข้อมูลรายการวัตถุดิบทั้งหมด
 *     tags: [RawMaterial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการวัตถุดิบ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , rawmaterialIfmController.getAll);

/**
 * @swagger
 * /api/raw-material-information/get-by-id/{rmifm_id}:
 *   get:
 *     summary: ดึงข้อมูลรายการวัตถุดิบตามไอดีรายการวัตถุดิบ
 *     tags: [RawMaterial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: rmifm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการวัตถุดิบ
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการวัตถุดิบ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:rmifm_id'
    , authenticateToken
    , rawmaterialIfmController.getById);
    
export default router;