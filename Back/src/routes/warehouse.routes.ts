import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as warehouseController from '../controllers/warehouse.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Warehouse
 *   description: การจัดการคลังสินค้า
 */

/**
 * @swagger
 * /api/warehouse/create:
 *   post:
 *     summary: สร้างคลังสินค้าใหม่
 *     tags: [Warehouse]
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
 *               wh_code:
 *                 type: string
 *                 description: รหัสคลังสินค้า
 *                 example: "001"
 *               wh_name:
 *                 type: string
 *                 description: ชื่อคลังสินค้า
 *                 example: "คลัง Raw Materials"
 *               wh_type:
 *                 type: string
 *                 description: ประเภทคลังสินค้า
 *                 enum:
 *                   - RAW_MATERIAL
 *                   - FG
 *                   - TOOLING
 *               wh_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของคลังสินค้า
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลคลังสินค้าสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลคลังสินค้าที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , warehouseController.create);

/**
 * @swagger
 * /api/warehouse/create-json:
 *   post:
 *     summary: Import Warehouse Data from JSON
 *     tags: [Warehouse]
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
 *                 รหัสคลัง:
 *                   type: string
 *                   example: "WH001"
 *                 ชื่อคลัง:
 *                   type: string
 *                   example: "คลัง Raw Material"
 *                 ประเภทคลัง:
 *                   type: string
 *                   example: "RAW_MATERIAL"
 *                 โรงงาน:
 *                   type: string
 *                   example: "โลหะบางปลา"
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */
router.post('/create-json', authenticateToken, warehouseController.createJson);

/**
 * @swagger
 * /api/warehouse/update/{wh_id}:
 *   put:
 *     summary: แก้ไขข้อมูลคลังสินค้าที่มีอยู่
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: wh_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีคลังสินค้า
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
 *               wh_code:
 *                 type: string
 *                 description: ไอดีคลังสินค้าใหม่
 *                 example: "002"
 *               wh_name:
 *                 type: string
 *                 description: ชื่อคลังสินค้า
 *                 example: "คลัง Raw Materials"
 *               wh_type:
 *                 type: string
 *                 description: ประเภทคลังสินค้า
 *                 enum:
 *                   - RAW_MATERIAL
 *                   - FG
 *                   - TOOLING
 *               wh_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของคลังสินค้า
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลคลังสินค้าสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลคลังสินค้าที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:wh_id'
    , authenticateToken
    , warehouseController.update);

/**
 * @swagger
 * /api/warehouse/delete/{wh_id}:
 *   delete:
 *     summary: ลบข้อมูลคลังสินค้าตามไอดีคลังสินค้า
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: wh_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีคลังสินค้าที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลคลังสินค้าสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลคลังสินค้าที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:wh_id'
    , authenticateToken
    , warehouseController.del);

    /**
 * @swagger
 * /api/warehouse/get-all:
 *   get:
 *     summary: ดึงข้อมูลคลังสินค้าทั้งหมด
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลคลังสินค้า
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลคลังสินค้าที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , warehouseController.getAll);
    
/**
 * @swagger
 * /api/warehouse/get-by-id/{wh_id}:
 *   get:
 *     summary: ดึงข้อมูลคลังสินค้าตามไอดีคลังสินค้า
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: wh_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีคลังสินค้า
 *     responses:
 *       200:
 *         description: พบข้อมูลคลังสินค้า
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลคลังสินค้าที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:wh_id'
    , authenticateToken
    , warehouseController.getById);

export default router;