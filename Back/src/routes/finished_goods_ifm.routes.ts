import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as finishedgoodsIfmController from '../controllers/finished_goods_ifm.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: FinishedGoods
 *   description: การจัดการรายการสินค้าสำเร็จรูป
 */

/**
 * @swagger
 * /api/finished-goods-information/create:
 *   post:
 *     summary: สร้างรายการสินค้าสำเร็จรูปใหม่
 *     tags: [FinishedGoods]
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
 *               fg_id:
 *                 type: number
 *                 description: ไอดีประเภทสินค้าสำเร็จรูป
 *                 example: 1
 *               crt_id:
 *                 type: number
 *                 description: ไอดีเกณฑ์
 *                 example: 1
 *               fgifm_code:
 *                 type: string
 *                 description: รหัสรายการสินค้าสำเร็จรูป
 *                 example: "001"
 *               fgifm_name:
 *                 type: string
 *                 description: ชื่อสินค้าสำเร็จรูป
 *                 example: "โต๊ะ"
 *               fgifm_width:
 *                 type: number
 *                 description: ความกว้างสินค้าสำเร็จรูป
 *                 example: 5
 *               fgifm_width_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความกว้าง
 *                 example: 1
 *               fgifm_length:
 *                 type: number
 *                 description: ความยาวสินค้าสำเร็จรูป
 *                 example: 5
 *               fgifm_length_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความยาว
 *                 example: 1
 *               fgifm_thickness:
 *                 type: number
 *                 description: ความหนาสินค้าสำเร็จรูป
 *                 example: 5
 *               fgifm_thickness_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความหนา
 *                 example: 1
 *               fgifm_product_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ สินค้า
 *                 example: 1
 *     responses:
 *       201:
 *         description: สร้างข้อมูลสินค้าสำเร็จรูปสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , finishedgoodsIfmController.create);

/**
 * @swagger
 * /api/finished-goods-information/create-json:
 *   post:
 *     summary: Import Finished Goods Data from JSON
 *     tags: [FinishedGoods]
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
 *                   example: "FGIfm"
 *                 เกณฑ์:
 *                   type: string
 *                   example: "เกณฑ์สำหรับ FG"
 *                 ประเภท:
 *                   type: string
 *                   example: "FG1"
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
router.post('/create-json', authenticateToken, finishedgoodsIfmController.createJson);

/**
 * @swagger
 * /api/finished-goods-information/update/{fgifm_id}:
 *   put:
 *     summary: แก้ไขรายการสินค้าสำเร็จรูปที่มีอยู่
 *     tags: [FinishedGoods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: fgifm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการสินค้าสำเร็จรูป
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fg_id:
 *                 type: number
 *                 description: ไอดีประเภทสินค้าสำเร็จรูป
 *                 example: 2
 *               crt_id:
 *                 type: number
 *                 description: ไอดีเกณฑ์
 *                 example: 2
 *               fgifm_code:
 *                 type: string
 *                 description: รหัสรายการสินค้าสำเร็จรูป
 *                 example: "001"
 *               fgifm_name:
 *                 type: string
 *                 description: ชื่อสินค้าสำเร็จรูป
 *                 example: "โต๊ะ"
 *               fgifm_width:
 *                 type: number
 *                 description: ความกว้างสินค้าสำเร็จรูป
 *                 example: 10
 *               fgifm_width_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความกว้าง
 *                 example: 2
 *               fgifm_length:
 *                 type: number
 *                 description: ความยาวสินค้าสำเร็จรูป
 *                 example: 10
 *               fgifm_length_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความยาว
 *                 example: 2
 *               fgifm_thickness:
 *                 type: number
 *                 description: ความหนาสินค้าสำเร็จรูป
 *                 example: 10
 *               fgifm_thickness_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความหนา
 *                 example: 2
 *               fgifm_product_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ สินค้า
 *                 example: 1
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลสินค้าสำเร็จรูปสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:fgifm_id'
    , authenticateToken
    , finishedgoodsIfmController.update);

/**
 * @swagger
 * /api/finished-goods-information/delete/{fgifm_id}:
 *   delete:
 *     summary: ลบข้อมูลรายการสินค้าสำเร็จรูปตามไอดีรายการสินค้าสำเร็จรูป
 *     tags: [FinishedGoods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: fgifm_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีรายการสินค้าสำเร็จรูปที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลรายการสินค้าสำเร็จรูปสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:fgifm_id'
    , authenticateToken
    , finishedgoodsIfmController.del);

/**
 * @swagger
 * /api/finished-goods-information/get-all:
 *   get:
 *     summary: ดึงข้อมูลรายการสินค้าสำเร็จรูปทั้งหมด
 *     tags: [FinishedGoods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการสินค้าสำเร็จรูป
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , finishedgoodsIfmController.getAll);

/**
 * @swagger
 * /api/finished-goods-information/get-by-id/{fgifm_id}:
 *   get:
 *     summary: ดึงข้อมูลรายการสินค้าสำเร็จรูปตามไอดีรายการสินค้าสำเร็จรูป
 *     tags: [FinishedGoods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: fgifm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการสินค้าสำเร็จรูป
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการสินค้าสำเร็จรูป
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:fgifm_id'
    , authenticateToken
    , finishedgoodsIfmController.getById);
    
export default router;