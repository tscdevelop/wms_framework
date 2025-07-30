import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as finishedGoodsController from '../controllers/finished_goods.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: FinishedGoodsType
 *   description: การจัดการประเภทสินค้าสำเร็จรูป
 */

/**
 * @swagger
 * /api/finished-goods-type/create:
 *   post:
 *     summary: สร้างประเภทสินค้าสำเร็จรูปใหม่
 *     tags: [FinishedGoodsType]
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
 *               fg_code:
 *                 type: string
 *                 description: รหัสประเภทสินค้าสำเร็จรูป
 *                 example: "001"
 *               fg_type:
 *                 type: string
 *                 description: ประเภทสินค้าสำเร็จรูป
 *                 example: "ชั้นวางสินค้าประเภทโคมไฟ"
 *               fg_remark:
 *                 type: string
 *                 description: หมายเหตุประเภทสินค้าสำเร็จรูป
 *                 example: ""
 *               fg_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของประเภทสินค้าสำเร็จรูป
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลประเภทสินค้าสำเร็จรูปสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , finishedGoodsController.create);

/**
 * @swagger
 * /api/finished-goods-type/create-json:
 *   post:
 *     summary: Import FinishedGoods Type Data from JSON
 *     tags: [FinishedGoodsType]
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
 *                   example: "TYFG01"
 *                 ประเภท:
 *                   type: string
 *                   example: "ชั้นวางสินค้าประเภทโคมไฟ"
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
router.post('/create-json', authenticateToken, finishedGoodsController.createJson);

/**
 * @swagger
 * /api/finished-goods-type/update/{fg_id}:
 *   put:
 *     summary: แก้ไขข้อมูลประเภทสินค้าสำเร็จรูปที่มีอยู่
 *     tags: [FinishedGoodsType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: fg_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีประเภทสินค้าสำเร็จรูป
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fg_code:
 *                 type: string
 *                 description: รหัสประเภทสินค้าสำเร็จรูป
 *                 example: "001"
 *               fg_type:
 *                 type: string
 *                 description: ประเภทสินค้าสำเร็จรูป
 *                 example: "ชั้นวางสินค้าประเภทอุปกรณ์เครื่องมือช่าง"
 *               fg_remark:
 *                 type: string
 *                 description: หมายเหตุประเภทสินค้าสำเร็จรูป
 *                 example: ""
 *               fg_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของประเภทสินค้าสำเร็จรูป
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลประเภทสินค้าสำเร็จรูปสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:fg_id'
    , authenticateToken
    , finishedGoodsController.update);

/**
 * @swagger
 * /api/finished-goods-type/delete/{fg_id}:
 *   delete:
 *     summary: ลบข้อมูลประเภทสินค้าสำเร็จรูปตามไอดีประเภทสินค้าสำเร็จรูป
 *     tags: [FinishedGoodsType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: fg_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีประเภทสินค้าสำเร็จรูปที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลประเภทสินค้าสำเร็จรูปสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:fg_id'
    , authenticateToken
    , finishedGoodsController.del);

/**
 * @swagger
 * /api/finished-goods-type/get-all:
 *   get:
 *     summary: ดึงข้อมูลประเภทสินค้าสำเร็จรูปทั้งหมด
 *     tags: [FinishedGoodsType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลประเภทสินค้าสำเร็จรูป
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , finishedGoodsController.getAll);

    
/**
 * @swagger
 * /api/finished-goods-type/get-by-id/{fg_id}:
 *   get:
 *     summary: ดึงข้อมูลประเภทสินค้าสำเร็จรูปตามไอดีประเภทสินค้าสำเร็จรูป
 *     tags: [FinishedGoodsType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: fg_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีประเภทสินค้าสำเร็จรูป
 *     responses:
 *       200:
 *         description: พบข้อมูลประเภทสินค้าสำเร็จรูป
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:fg_id'
    , authenticateToken
    , finishedGoodsController.getById);

export default router;