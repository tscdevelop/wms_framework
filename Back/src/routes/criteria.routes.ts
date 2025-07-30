import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as criteriaController from '../controllers/criteria.controller'

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Criteria
 *   description: การจัดการเกณฑ์
 */

/**
 * @swagger
 * /api/criteria/create:
 *   post:
 *     summary: สร้างรายการเกณฑ์ใหม่
 *     tags: [Criteria]
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
 *               crt_name:
 *                 type: string
 *                 description: ชื่อเกณฑ์
 *                 example: "เกณฑ์สำหรับ RM"
 *               crt_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "RM ไม่มีวันเบิกคืน"
 *               crt_exp_low:
 *                 type: number
 *                 description: วันหมดอายุระดับ Low
 *                 example: 30
 *               crt_exp_medium:
 *                 type: number
 *                 description: วันหมดอายุระดับ Medium
 *                 example: 15
 *               crt_exp_high:
 *                 type: number
 *                 description: วันหมดอายุระดับ High
 *                 example: 7
 *               crt_txn_low:
 *                 type: number
 *                 description: กำหนดวันเบิก-คืนระดับ Low
 *                 example: 5
 *               crt_txn_medium:
 *                 type: number
 *                 description: กำหนดวันเบิก-คืนระดับ Medium
 *                 example: 3
 *               crt_txn_high:
 *                 type: number
 *                 description: กำหนดวันเบิก-คืนระดับ High
 *                 example: 1
 *               crt_rem_low:
 *                 type: number
 *                 description: วันคงเหลือระดับ Low Low
 *                 example: 50
 *               crt_rem_medium:
 *                 type: number
 *                 description: วันคงเหลือระดับ Low Medium
 *                 example: 30
 *               crt_rem_high:
 *                 type: number
 *                 description: วันคงเหลือระดับ Low High
 *                 example: 10
 *     responses:
 *       201:
 *         description: สร้างข้อมูลเกณฑ์สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลเกณฑ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , criteriaController.create);


/**
 * @swagger
 * /api/criteria/create-json:
 *   post:
 *     summary: Import Criteria Data from JSON
 *     tags: [Criteria]
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
 *                 ชื่อเกณฑ์:
 *                   type: string
 *                   example: "เกณฑ์สำหรับทดสอบ"
 *                 กำหนดวันหมดอายุ(LowLevel):
 *                   type: number
 *                   example: "20"
 *                 กำหนดวันหมดอายุ(MediumLevel):
 *                   type: number
 *                   example: "10"
 *                 กำหนดวันหมดอายุ(HighLevel):
 *                   type: number
 *                   example: "5"
 *                 กำหนดวันเบิก-คืนอุปกรณ์(LowLevel):
 *                   type: number
 *                   example: "35"
 *                 กำหนดวันเบิก-คืนอุปกรณ์(MediumLevel):
 *                   type: number
 *                   example: "15"
 *                 กำหนดวันเบิก-คืนอุปกรณ์(HighLevel):
 *                   type: number
 *                   example: "5"
 *                 กำหนดจำนวนคงเหลือ(LowLevel):
 *                   type: number
 *                   example: "50"
 *                 กำหนดจำนวนคงเหลือ(MediumLevel):
 *                   type: number
 *                   example: "45"
 *                 กำหนดจำนวนคงเหลือ(HighLevel):
 *                   type: number
 *                   example: "20"
 *                 หมายเหตุ:
 *                   type: string
 *                   example: "หมายเหตุ"
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */
router.post('/create-json', authenticateToken, criteriaController.createJson);

/**
 * @swagger
 * /api/criteria/update/{crt_id}:
 *   put:
 *     summary: แก้ไขรายการเกณฑ์ที่มีอยู่
 *     tags: [Criteria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: crt_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการเกณฑ์
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               crt_name:
 *                 type: string
 *                 description: ชื่อเกณฑ์
 *                 example: "เกณฑ์สำหรับ RM2"
 *               crt_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "RM ไม่มีวันเบิกคืน"
 *               crt_exp_low:
 *                 type: number
 *                 description: วันหมดอายุระดับ Low
 *                 example: 45
 *               crt_exp_medium:
 *                 type: number
 *                 description: วันหมดอายุระดับ Medium
 *                 example: 30
 *               crt_exp_high:
 *                 type: number
 *                 description: ไอดีหน่วยของ ความยาว
 *                 example: 22
 *               crt_txn_low:
 *                 type: number
 *                 description: กำหนดวันเบิก-คืนระดับ Low
 *                 example: 55
 *               crt_txn_medium:
 *                 type: number
 *                 description: กำหนดวันเบิก-คืนระดับ Medium
 *                 example: 33
 *               crt_txn_high:
 *                 type: number
 *                 description: กำหนดวันเบิก-คืนระดับ High
 *                 example: 11
 *               crt_rem_low:
 *                 type: number
 *                 description: วันคงเหลือระดับ Low Low
 *                 example: 20
 *               crt_rem_medium:
 *                 type: number
 *                 description: วันคงเหลือระดับ Low Medium
 *                 example: 15
 *               crt_rem_high:
 *                 type: number
 *                 description: วันคงเหลือระดับ Low High
 *                 example: 5
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลเกณฑ์สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลเกณฑ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:crt_id'
    , authenticateToken
    , criteriaController.update);

/**
 * @swagger
 * /api/criteria/delete/{crt_id}:
 *   delete:
 *     summary: ลบข้อมูลรายการเกณฑ์ตามไอดีรายการเกณฑ์
 *     tags: [Criteria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: crt_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีรายการเกณฑ์ที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลรายการเกณฑ์สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการเกณฑ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:crt_id'
    , authenticateToken
    , criteriaController.del);

/**
 * @swagger
 * /api/criteria/get-all:
 *   get:
 *     summary: ดึงข้อมูลรายการเกณฑ์ทั้งหมด
 *     tags: [Criteria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการเกณฑ์
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการเกณฑ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , criteriaController.getAll);

/**
 * @swagger
 * /api/criteria/get-by-id/{crt_id}:
 *   get:
 *     summary: ดึงข้อมูลรายการเกณฑ์ตามไอดีรายการเกณฑ์
 *     tags: [Criteria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: crt_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการเกณฑ์
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการเกณฑ์
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการเกณฑ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:crt_id'
    , authenticateToken
    , criteriaController.getById);
    
export default router;