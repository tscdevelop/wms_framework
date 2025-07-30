import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as toolingController from '../controllers/tooling.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: ToolingType
 *   description: การจัดการประเภทเครื่องมือ
 */

/**
 * @swagger
 * /api/tooling-type/create:
 *   post:
 *     summary: สร้างประเภทเครื่องมือใหม่
 *     tags: [ToolingType]
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
 *               tl_code:
 *                 type: string
 *                 description: รหัสประเภทเครื่องมือ
 *                 example: "001"
 *               tl_type:
 *                 type: string
 *                 description: ประเภทเครื่องมือ
 *                 example: "ประเภทเครื่องมือ"
 *               tl_remark:
 *                 type: string
 *                 description: หมายเหตุประเภทเครื่องมือ
 *                 example: ""
 *               tl_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของประเภทเครื่องมือ
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลประเภทเครื่องมือสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทเครื่องมือที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , toolingController.create);

/**
 * @swagger
 * /api/tooling-type/create-json:
 *   post:
 *     summary: Import Tooling Type Data from JSON
 *     tags: [ToolingType]
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
 *                   example: "TYTL01"
 *                 ประเภท:
 *                   type: string
 *                   example: "เครื่องมือ"
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
router.post('/create-json', authenticateToken, toolingController.createJson);

/**
 * @swagger
 * /api/tooling-type/update/{tl_id}:
 *   put:
 *     summary: แก้ไขข้อมูลประเภทเครื่องมือที่มีอยู่
 *     tags: [ToolingType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: tl_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีประเภทเครื่องมือ
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               tl_code:
 *                 type: string
 *                 description: รหัสประเภทเครื่องมือ
 *                 example: "001"
 *               tl_type:
 *                 type: string
 *                 description: ประเภทเครื่องมือ
 *                 example: "ประเภทเครื่องมือ2"
 *               tl_remark:
 *                 type: string
 *                 description: หมายเหตุประเภทเครื่องมือ
 *                 example: ""
 *               tl_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของประเภทเครื่องมือ
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลประเภทเครื่องมือสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทเครื่องมือที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:tl_id'
    , authenticateToken
    , toolingController.update);

/**
 * @swagger
 * /api/tooling-type/delete/{tl_id}:
 *   delete:
 *     summary: ลบข้อมูลประเภทเครื่องมือตามไอดีประเภทเครื่องมือ
 *     tags: [ToolingType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: tl_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีประเภทเครื่องมือที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลประเภทเครื่องมือสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทเครื่องมือที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:tl_id'
    , authenticateToken
    , toolingController.del);

/**
 * @swagger
 * /api/tooling-type/get-all:
 *   get:
 *     summary: ดึงข้อมูลประเภทเครื่องมือทั้งหมด
 *     tags: [ToolingType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลประเภทเครื่องมือ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทเครื่องมือที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , toolingController.getAll);
    
/**
 * @swagger
 * /api/tooling-type/get-by-id/{tl_id}:
 *   get:
 *     summary: ดึงข้อมูลประเภทเครื่องมือตามไอดีประเภทเครื่องมือ
 *     tags: [ToolingType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: tl_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีประเภทเครื่องมือ
 *     responses:
 *       200:
 *         description: พบข้อมูลประเภทเครื่องมือ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลประเภทเครื่องมือที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:tl_id'
    , authenticateToken
    , toolingController.getById);

export default router;