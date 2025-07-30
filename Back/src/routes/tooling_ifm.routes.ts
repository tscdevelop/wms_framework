import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as toolingIfmController from '../controllers/tooling_ifm.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tooling
 *   description: การจัดการรายการเครื่องมือ
 */

/**
 * @swagger
 * /api/tooling-information/create:
 *   post:
 *     summary: สร้างรายการเครื่องมือใหม่
 *     tags: [Tooling]
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
 *               tlifm_code:
 *                 type: string
 *                 description: รหัสรายการเครื่องมือ
 *                 example: "001"
 *               tl_id:
 *                 type: number
 *                 description: ไอดีประเภทเครื่องมือ
 *                 example: 1
 *               crt_id:
 *                 type: number
 *                 description: ไอดีเกณฑ์
 *                 example: 1
 *               tlifm_name:
 *                 type: string
 *                 description: ชื่อเครื่องมือ
 *                 example: "เหล็ก"
 *     responses:
 *       201:
 *         description: สร้างข้อมูลเครื่องมือสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลเครื่องมือที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , toolingIfmController.create);

/**
 * @swagger
 * /api/tooling-information/create-json:
 *   post:
 *     summary: Import Tooling Data from JSON
 *     tags: [Tooling]
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
 *                   example: "tlIfm"
 *                 เกณฑ์:
 *                   type: string
 *                   example: "เกณฑ์สำหรับ TL1"
 *                 ประเภท:
 *                   type: string
 *                   example: "tl1"
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */
router.post('/create-json', authenticateToken, toolingIfmController.createJson);

/**
 * @swagger
 * /api/tooling-information/update/{tlifm_id}:
 *   put:
 *     summary: แก้ไขรายการเครื่องมือที่มีอยู่
 *     tags: [Tooling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: tlifm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการเครื่องมือ
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               tlifm_code:
 *                 type: string
 *                 description: รหัสรายการเครื่องมือ
 *                 example: "001"
 *               tl_id:
 *                 type: number
 *                 description: ไอดีประเภทเครื่องมือ
 *                 example: 2
 *               crt_id:
 *                 type: number
 *                 description: ไอดีเกณฑ์
 *                 example: 2
 *               tlifm_name:
 *                 type: string
 *                 description: ชื่อเครื่องมือ
 *                 example: "เหล็ก"
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลเครื่องมือสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลเครื่องมือที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:tlifm_id'
    , authenticateToken
    , toolingIfmController.update);

/**
 * @swagger
 * /api/tooling-information/delete/{tlifm_id}:
 *   delete:
 *     summary: ลบข้อมูลรายการเครื่องมือตามไอดีรายการเครื่องมือ
 *     tags: [Tooling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: tlifm_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีรายการเครื่องมือที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลรายการเครื่องมือสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการเครื่องมือที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:tlifm_id'
    , authenticateToken
    , toolingIfmController.del);

/**
 * @swagger
 * /api/tooling-information/get-all:
 *   get:
 *     summary: ดึงข้อมูลรายการเครื่องมือทั้งหมด
 *     tags: [Tooling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการเครื่องมือ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการเครื่องมือที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , toolingIfmController.getAll);

/**
 * @swagger
 * /api/tooling-information/get-by-id/{tlifm_id}:
 *   get:
 *     summary: ดึงข้อมูลรายการเครื่องมือตามไอดีรายการเครื่องมือ
 *     tags: [Tooling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: tlifm_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการเครื่องมือ
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการเครื่องมือ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการเครื่องมือที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:tlifm_id'
    , authenticateToken
    , toolingIfmController.getById);
    
export default router;