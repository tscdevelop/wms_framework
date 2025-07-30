import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as zoneController from '../controllers/zone.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Zone
 *   description: การจัดการโซน
 */

/**
 * @swagger
 * /api/zone/create:
 *   post:
 *     summary: สร้างโซนใหม่
 *     tags: [Zone]
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
 *               fty_id:
 *                 type: number
 *                 description: ไอดีโรงงาน
 *                 example: "1"
 *               wh_id:
 *                 type: number
 *                 description: ไอดีคลังสินค้า
 *                 example: "1"
 *               zn_code:
 *                 type: string
 *                 description: รหัสโซน
 *                 example: "001"
 *               zn_name:
 *                 type: string
 *                 description: ชื่อโซน
 *                 example: "A"
 *               zn_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: ""
 *               zn_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของโซน
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลโซนสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลโซนที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , zoneController.create);


/**
 * @swagger
 * /api/zone/create-json:
 *   post:
 *     summary: Import Zone Data from JSON
 *     tags: [Zone]
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
 *                 รหัสZone:
 *                   type: string
 *                   example: "ZN001"
 *                 ชื่อZone:
 *                   type: string
 *                   example: "Zone A"
 *                 โรงงาน:
 *                   type: string
 *                   example: "โลหะบางปลา"
 *                 คลัง:
 *                   type: string
 *                   example: "คลัง A"
 *                 หมายเหตุ:
 *                   type: string
 *                   example: "test"
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */
router.post('/create-json', authenticateToken, zoneController.createJson);

/**
 * @swagger
 * /api/zone/update/{zn_id}:
 *   put:
 *     summary: แก้ไขข้อมูลโซนที่มีอยู่
 *     tags: [Zone]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: zn_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีโซนที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fty_id:
 *                 type: number
 *                 description: ไอดีโรงงาน
 *                 example: "1"
 *               wh_id:
 *                 type: number
 *                 description: ไอดีคลังสินค้า
 *                 example: "2"
 *               zn_code:
 *                 type: string
 *                 description: รหัสโซน
 *                 example: "001"
 *               zn_name:
 *                 type: string
 *                 description: ชื่อโซน
 *                 example: "A"
 *               zn_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: ""
 *               zn_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของโซน
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลโซนสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลโซนที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:zn_id'
    , authenticateToken
    , zoneController.update);

/**
 * @swagger
 * /api/zone/delete/{zn_id}:
 *   delete:
 *     summary: ลบข้อมูลโซนตามไอดีโซน
 *     tags: [Zone]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: zn_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีโรงงานที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลโซนสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลโซนที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:zn_id'
    , authenticateToken
    , zoneController.del);

    /**
 * @swagger
 * /api/zone/get-all:
 *   get:
 *     summary: ดึงข้อมูลโรงงานทั้งหมด
 *     tags: [Zone]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลโซน
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลโรงงานที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , zoneController.getAll);
    
/**
 * @swagger
 * /api/zone/get-by-id/{zn_id}:
 *   get:
 *     summary: ดึงข้อมูลโซนตามไอดีโซน
 *     tags: [Zone]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: zn_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีโซน
 *     responses:
 *       200:
 *         description: พบข้อมูลโซน
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลโซนที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:zn_id'
    , authenticateToken
    , zoneController.getById);

export default router;