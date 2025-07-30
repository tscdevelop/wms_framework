import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as semiController from '../controllers/semi.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: SemiType
 *   description: การจัดการสินค้าประเภท Semi
 */

/**
 * @swagger
 * /api/semi-type/create:
 *   post:
 *     summary: สร้างสินค้าประเภท semi ใหม่
 *     tags: [SemiType]
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
 *               semi_code:
 *                 type: string
 *                 description: รหัสสินค้าประเภท semi
 *                 example: "001"
 *               semi_type:
 *                 type: string
 *                 description: ประเภทสินค้าประเภท semi
 *                 example: "เหล็ก"
 *               semi_remark:
 *                 type: string
 *                 description: หมายเหตุสินค้าประเภท semi
 *                 example: ""
 *               semi_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของสินค้าประเภท semi
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลสินค้าประเภท semi สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลสินค้าประเภท semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , semiController.create);

/**
 * @swagger
 * /api/semi-type/create-json:
 *   post:
 *     summary: Import Semi Type Data from JSON
 *     tags: [SemiType]
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
 *                   example: "TYSEMI01"
 *                 ประเภท:
 *                   type: string
 *                   example: "เหล็กชุบ"
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
router.post('/create-json', authenticateToken, semiController.createJson);

/**
 * @swagger
 * /api/semi-type/update/{semi_id}:
 *   put:
 *     summary: แก้ไขข้อมูลประเภท semi ที่มีอยู่
 *     tags: [SemiType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: semi_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีประเภท semi
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               semi_code:
 *                 type: string
 *                 description: รหัสสินค้าประเภท semi
 *                 example: "001"
 *               semi_type:
 *                 type: string
 *                 description: ประเภทสินค้าประเภท semi
 *                 example: "เหล็ก"
 *               semi_remark:
 *                 type: string
 *                 description: หมายเหตุสินค้าประเภท semi
 *                 example: ""
 *               semi_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของสินค้าประเภท semi
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลสินค้าประเภท semi สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลสินค้าประเภท semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:semi_id'
    , authenticateToken
    , semiController.update);

/**
 * @swagger
 * /api/semi-type/delete/{semi_id}:
 *   delete:
 *     summary: ลบข้อมูลสินค้าประเภท semi
 *     tags: [SemiType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: semi_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีสินค้าประเภท semi ที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลสินค้าประเภท semi สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลสินค้าประเภท semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:semi_id'
    , authenticateToken
    , semiController.del);

/**
 * @swagger
 * /api/semi-type/get-all:
 *   get:
 *     summary: ดึงข้อมูลสินค้าประเภท semi ทั้งหมด
 *     tags: [SemiType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลสินค้าประเภท semi
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลสินค้าประเภท semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , semiController.getAll);
    
/**
 * @swagger
 * /api/semi-type/get-by-id/{semi_id}:
 *   get:
 *     summary: ดึงข้อมูลสินค้าประเภท semi
 *     tags: [SemiType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: semi_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีสินค้าประเภท semi
 *     responses:
 *       200:
 *         description: พบข้อมูลสินค้าประเภท semi
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลสินค้าประเภท semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:semi_id'
    , authenticateToken
    , semiController.getById);

export default router;