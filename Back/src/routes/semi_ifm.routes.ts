import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as semiifmController from '../controllers/semi_ifm.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Semi
 *   description: การจัดการรายการสินค้า semi 
 */

/**
 * @swagger
 * /api/semi-information/create:
 *   post:
 *     summary: สร้างรายการสินค้า semi ใหม่
 *     tags: [Semi]
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
 *               semi_id:
 *                 type: number
 *                 description: ไอดีประเภท semi
 *                 example: 1
 *               crt_id:
 *                 type: number
 *                 description: ไอดีเกณฑ์
 *                 example: 1
 *               semiifm_code:
 *                 type: string
 *                 description: รหัสรายการสินค้า semi 
 *                 example: "001"
 *               semiifm_name:
 *                 type: string
 *                 description: ชื่อสินค้า semi 
 *                 example: "โต๊ะ"
 *               semiifm_width:
 *                 type: number
 *                 description: ความกว้างสินค้า semi 
 *                 example: 5
 *               semiifm_width_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความกว้าง
 *                 example: 1
 *               semiifm_length:
 *                 type: number
 *                 description: ความยาวสินค้า semi 
 *                 example: 5
 *               semiifm_length_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความยาว
 *                 example: 1
 *               semiifm_thickness:
 *                 type: number
 *                 description: ความหนาสินค้า semi 
 *                 example: 5
 *               semiifm_thickness_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความหนา
 *                 example: 1
 *               semiifm_product_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ สินค้า
 *                 example: 1
 *     responses:
 *       201:
 *         description: สร้างข้อมูลสินค้า semi สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลสินค้า semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , semiifmController.create);

/**
 * @swagger
 * /api/semi-information/create-json:
 *   post:
 *     summary: Import Semi Data from JSON
 *     tags: [Semi]
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
 *                   example: "SemiIfm"
 *                 เกณฑ์:
 *                   type: string
 *                   example: "เกณฑ์สำหรับ Semi"
 *                 ประเภท:
 *                   type: string
 *                   example: "semi1"
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
router.post('/create-json', authenticateToken, semiifmController.createJson);

/**
 * @swagger
 * /api/semi-information/update/{semiifm_id}:
 *   put:
 *     summary: แก้ไขรายการสินค้า semi ที่มีอยู่
 *     tags: [Semi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: semiifm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการสินค้า semi 
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               semi_id:
 *                 type: number
 *                 description: ไอดีประเภท semi
 *                 example: 2
 *               crt_id:
 *                 type: number
 *                 description: ไอดีเกณฑ์
 *                 example: 2
 *               semiifm_code:
 *                 type: string
 *                 description: รหัสรายการสินค้า semi 
 *                 example: "001"
 *               semiifm_name:
 *                 type: string
 *                 description: ชื่อสินค้า semi 
 *                 example: "โต๊ะ"
 *               semiifm_width:
 *                 type: number
 *                 description: ความกว้างสินค้า semi 
 *                 example: 10
 *               semiifm_width_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความกว้าง
 *                 example: 2
 *               semiifm_length:
 *                 type: number
 *                 description: ความยาวสินค้า semi 
 *                 example: 10
 *               semiifm_length_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความยาว
 *                 example: 2
 *               semiifm_thickness:
 *                 type: number
 *                 description: ความหนาสินค้า semi 
 *                 example: 10
 *               semiifm_thickness_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความหนา
 *                 example: 2
 *               semiifm_product_unitId:
 *                 type: number
 *                 description: ไอดีหน่วยของ สินค้า
 *                 example: 2
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลสินค้า semi สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลสินค้า semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:semiifm_id'
    , authenticateToken
    , semiifmController.update);

/**
 * @swagger
 * /api/semi-information/delete/{semiifm_id}:
 *   delete:
 *     summary: ลบข้อมูลรายการสินค้า semi ตามไอดีรายการสินค้า semi 
 *     tags: [Semi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: semiifm_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีรายการสินค้า semi ที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลรายการสินค้า semi สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการสินค้า semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:semiifm_id'
    , authenticateToken
    , semiifmController.del);

/**
 * @swagger
 * /api/semi-information/get-all:
 *   get:
 *     summary: ดึงข้อมูลรายการสินค้า semi ทั้งหมด
 *     tags: [Semi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการสินค้า semi 
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการสินค้า semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , semiifmController.getAll);

/**
 * @swagger
 * /api/semi-information/get-by-id/{semiifm_id}:
 *   get:
 *     summary: ดึงข้อมูลรายการสินค้า semi ตามไอดีรายการสินค้า semi 
 *     tags: [Semi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: semiifm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการสินค้า semi 
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการสินค้า semi 
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการสินค้า semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:semiifm_id'
    , authenticateToken
    , semiifmController.getById);
    
export default router;