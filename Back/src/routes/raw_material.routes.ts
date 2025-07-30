import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as rawmaterialController from '../controllers/raw_material.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: RawMaterialType
 *   description: การจัดการประเภทวัตถุดิบ
 */

/**
 * @swagger
 * /api/raw-material-type/create:
 *   post:
 *     summary: สร้างประเภทวัตถุดิบใหม่
 *     tags: [RawMaterialType]
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
 *               rm_code:
 *                 type: string
 *                 description: รหัสประเภทวัตถุดิบ
 *                 example: "001"
 *               rm_type:
 *                 type: string
 *                 description: ประเภทวัตถุดิบ
 *                 example: "เหล็ก"
 *               rm_remark:
 *                 type: string
 *                 description: หมายเหตุประเภทวัตถุดิบ
 *                 example: ""
 *               rm_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของประเภทวัตถุดิบ
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลประเภทวัตถุดิบสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , rawmaterialController.create);
    
/**
 * @swagger
 * /api/raw-material-type/create-json:
 *   post:
 *     summary: Import RawMaterial Type Data from JSON
 *     tags: [RawMaterialType]
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
 *                   example: "TYRM01"
 *                 ประเภท:
 *                   type: string
 *                   example: "สี"
 *                 หมายเหตุ:
 *                   type: string
 *                   example: "ตัวอย่างข้อมูล"
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */
router.post('/create-json', authenticateToken, rawmaterialController.createJson);
    
/**
 * @swagger
 * /api/raw-material-type/update/{rm_id}:
 *   put:
 *     summary: แก้ไขข้อมูลประเภทวัตถุดิบที่มีอยู่
 *     tags: [RawMaterialType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: rm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีประเภทวัตถุดิบ
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               rm_code:
 *                 type: string
 *                 description: รหัสประเภทวัตถุดิบ
 *                 example: "001"
 *               rm_type:
 *                 type: string
 *                 description: ประเภทวัตถุดิบ
 *                 example: "เหล็ก"
 *               rm_remark:
 *                 type: string
 *                 description: หมายเหตุประเภทวัตถุดิบ
 *                 example: ""
 *               rm_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของประเภทวัตถุดิบ
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลประเภทวัตถุดิบสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:rm_id'
    , authenticateToken
    , rawmaterialController.update);

/**
 * @swagger
 * /api/raw-material-type/delete/{rm_id}:
 *   delete:
 *     summary: ลบข้อมูลประเภทวัตถุดิบตามไอดีประเภทวัตถุดิบ
 *     tags: [RawMaterialType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: rm_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีประเภทวัตถุดิบที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลประเภทวัตถุดิบสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:rm_id'
    , authenticateToken
    , rawmaterialController.del);

/**
 * @swagger
 * /api/raw-material-type/get-all:
 *   get:
 *     summary: ดึงข้อมูลประเภทวัตถุดิบทั้งหมด
 *     tags: [RawMaterialType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลประเภทวัตถุดิบ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , rawmaterialController.getAll);
    
/**
 * @swagger
 * /api/raw-material-type/get-by-id/{rm_id}:
 *   get:
 *     summary: ดึงข้อมูลประเภทวัตถุดิบตามไอดีประเภทวัตถุดิบ
 *     tags: [RawMaterialType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: rm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีประเภทวัตถุดิบ
 *     responses:
 *       200:
 *         description: พบข้อมูลประเภทวัตถุดิบ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:rm_id'
    , authenticateToken
    , rawmaterialController.getById);

export default router;