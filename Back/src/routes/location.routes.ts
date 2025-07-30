import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as locationController from '../controllers/location.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Location
 *   description: การจัดการตำแหน่งที่ตั้ง
 */

/**
 * @swagger
 * /api/location/create:
 *   post:
 *     summary: สร้างตำแหน่งที่ตั้งใหม่
 *     tags: [Location]
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
 *               zn_id:
 *                 type: number
 *                 description: ไอดีโซน
 *                 example: "1"
 *               loc_code:
 *                 type: string
 *                 description: รหัสตำแหน่งที่ตั้ง
 *                 example: "001"
 *               loc_name:
 *                 type: string
 *                 description: ชื่อตำแหน่งที่ตั้ง
 *                 example: "A"
 *               loc_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: ""
 *               loc_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของตำแหน่งที่ตั้ง
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลตำแหน่งที่ตั้งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลตำแหน่งที่ตั้งที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , locationController.create);

/**
 * @swagger
 * /api/location/create-json:
 *   post:
 *     summary: Import Location Data from JSON
 *     tags: [Location]
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
 *                 รหัสLocation:
 *                   type: string
 *                   example: "LOC123"
 *                 ชื่อLocation:
 *                   type: string
 *                   example: "Location A"
 *                 โรงงาน:
 *                   type: string
 *                   example: "โลหะบางปลา"
 *                 คลัง:
 *                   type: string
 *                   example: "คลัง AAA"
 *                 Zone:
 *                   type: string
 *                   example: "zone 1A1"
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
router.post('/create-json', authenticateToken, locationController.createJson);

/**
 * @swagger
 * /api/location/update/{loc_id}:
 *   put:
 *     summary: แก้ไขข้อมูลตำแหน่งที่ตั้งที่มีอยู่
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: loc_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีตำแหน่งที่ตั้งที่ต้องการแก้ไข
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
 *               zn_id:
 *                 type: number
 *                 description: ไอดีโซน
 *                 example: "2"
 *               loc_code:
 *                 type: string
 *                 description: รหัสตำแหน่งที่ตั้ง
 *                 example: "001"
 *               loc_name:
 *                 type: string
 *                 description: ชื่อตำแหน่งที่ตั้ง
 *                 example: "A"
 *               loc_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: ""
 *               loc_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของตำแหน่งที่ตั้ง
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลตำแหน่งที่ตั้งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลตำแหน่งที่ตั้งที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:loc_id'
    , authenticateToken
    , locationController.update);

/**
 * @swagger
 * /api/location/delete/{loc_id}:
 *   delete:
 *     summary: ลบข้อมูลตำแหน่งที่ตั้งตามไอดีตำแหน่งที่ตั้ง
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: loc_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีโรงงานที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลตำแหน่งที่ตั้งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลตำแหน่งที่ตั้งที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:loc_id'
    , authenticateToken
    , locationController.del);

/**
 * @swagger
 * /api/location/get-all:
 *   get:
 *     summary: ดึงข้อมูลโรงงานทั้งหมด
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลตำแหน่งที่ตั้ง
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลโรงงานที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , locationController.getAll);

/**
 * @swagger
 * /api/location/get-by-id/{loc_id}:
 *   get:
 *     summary: ดึงข้อมูลตำแหน่งที่ตั้งตามไอดีตำแหน่งที่ตั้ง
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: loc_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีตำแหน่งที่ตั้ง
 *     responses:
 *       200:
 *         description: พบข้อมูลตำแหน่งที่ตั้ง
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลตำแหน่งที่ตั้งที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:loc_id'
    , authenticateToken
    , locationController.getById);

export default router;