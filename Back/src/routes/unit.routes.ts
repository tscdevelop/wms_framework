import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as unitController from '../controllers/unit.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Unit
 *   description: การจัดการหน่วย
 */

/**
 * @swagger
 * /api/unit/create:
 *   post:
 *     summary: สร้างหน่วยใหม่
 *     tags: [Unit]
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
 *               unit_name_th:
 *                 type: string
 *                 description: ชื่อหน่วย ภาษาไทย
 *                 example: "เซนติเมตร"
 *               unit_name_en:
 *                 type: string
 *                 description: ชื่อหน่วย ภาษาอังกฤษ
 *                 example: "centimeter"
 *               unit_abbr_th:
 *                 type: string
 *                 description: คำย่อหน่วย ภาษาไทย
 *                 example: "ซม."
 *               unit_abbr_en:
 *                 type: string
 *                 description: คำย่อหน่วย ภาษาอังกฤษ
 *                 example: "cm."
 *               unit_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของหน่วย
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลหน่วยสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลหน่วยที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , unitController.create);


/**
 * @swagger
 * /api/unit/create-json:
 *   post:
 *     summary: Import Unit Data from JSON
 *     tags: [Unit]
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
 *                 หน่วย:
 *                   type: string
 *                   example: "เซนติเมตร"
 *                 หน่วย(คำย่อ):
 *                   type: string
 *                   example: "ซม."
 *                 Unit:
 *                   type: string
 *                   example: "Centimeter"
 *                 Unit(Abbreviation):
 *                   type: string
 *                   example: "cm."
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */
router.post('/create-json', authenticateToken, unitController.createJson);

/**
 * @swagger
 * /api/unit/update/{unit_id}:
 *   put:
 *     summary: แก้ไขข้อมูลหน่วยที่มีอยู่
 *     tags: [Unit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: unit_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีหน่วยที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               unit_name_th:
 *                 type: string
 *                 description: ชื่อหน่วย ภาษาไทย
 *                 example: "เซนติเมตร"
 *               unit_name_en:
 *                 type: string
 *                 description: ชื่อหน่วย ภาษาอังกฤษ
 *                 example: "centimeter"
 *               unit_abbr_th:
 *                 type: string
 *                 description: คำย่อหน่วย ภาษาไทย
 *                 example: "ซม."
 *               unit_abbr_en:
 *                 type: string
 *                 description: คำย่อหน่วย ภาษาอังกฤษ
 *                 example: "cm."
 *               unit_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของหน่วย
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลหน่วยสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลหน่วยที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:unit_id'
    , authenticateToken
    , unitController.update);


/**
 * @swagger
 * /api/unit/delete/{unit_id}:
 *   delete:
 *     summary: ลบข้อมูลหน่วย ตามไอดีหน่วย 
 *     tags: [Unit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: unit_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีหน่วยที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลหน่วยสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลหน่วยที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:unit_id'
    , authenticateToken
    , unitController.del);

/**
 * @swagger
 * /api/unit/get-all:
 *   get:
 *     summary: ดึงข้อมูลหน่วยทั้งหมด
 *     tags: [Unit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลหน่วย 
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลหน่วยที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , unitController.getAll);

/**
 * @swagger
 * /api/unit/get-by-id/{unit_id}:
 *   get:
 *     summary: ดึงข้อมูลหน่วย ตามไอดีหน่วย 
 *     tags: [Unit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: unit_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีหน่วย 
 *     responses:
 *       200:
 *         description: พบข้อมูลหน่วย 
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลหน่วยที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:unit_id'
    , authenticateToken
    , unitController.getById);

export default router;