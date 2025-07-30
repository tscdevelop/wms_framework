import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as transportyardController from '../controllers/transport_yard.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TransportYard
 *   description: การจัดการท่ารถ
 */

/**
 * @swagger
 * /api/transport-yard/create:
 *   post:
 *     summary: สร้างท่ารถใหม่
 *     tags: [TransportYard]
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
 *               tspyard_code:
 *                 type: string
 *                 description: รหัสท่ารถ
 *                 example: "001"
 *               tspyard_name:
 *                 type: string
 *                 description: ชื่อท่ารถ
 *                 example: "ท่าเรือบางพลี"
 *               tspyard_phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์ท่ารถ
 *                 example: "024589631"
 *               tspyard_address:
 *                 type: string
 *                 description: ที่อยู่ท่ารถ
 *                 example: "นิคมอุตสาหกรรมบางพลี ถนนบางนา-ตราด ตำบลบางพลีใหญ่ อำเภอบางพลี จังหวัดสมุทรปราการ 10540"
 *               tspyard_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: ""
 *               tspyard_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของท่ารถ
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลท่ารถสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลท่ารถที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , transportyardController.create);

/**
 * @swagger
 * /api/transport-yard/create-json:
 *   post:
 *     summary: Import TransportYard Data from JSON
 *     tags: [TransportYard]
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
 *                 รหัสท่ารถ:
 *                   type: string
 *                   example: "T001"
 *                 ชื่อท่ารถ:
 *                   type: string
 *                   example: "ท่ารถ A"
 *                 ที่อยู่:
 *                   type: string
 *                   example: "179 อาคารบางกอกซิตี้ ทาวเวอร์ ชั้น 22"
 *                 เบอร์ติดต่อ:
 *                   type: string
 *                   example: "0251365478"
 *                 หมายเหตุ:
 *                   type: string
 *                   example: "test"
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
router.post('/create-json', authenticateToken, transportyardController.createJson);

/**
 * @swagger
 * /api/transport-yard/update/{tspyard_id}:
 *   put:
 *     summary: แก้ไขข้อมูลท่ารถที่มีอยู่
 *     tags: [TransportYard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: tspyard_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีท่ารถที่ต้องการแก้ไข
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
 *               tspyard_code:
 *                 type: string
 *                 description: รหัสท่ารถ
 *                 example: "001"
 *               tspyard_name:
 *                 type: string
 *                 description: ชื่อท่ารถ
 *                 example: "ท่ารถบางพลี"
 *               tspyard_phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์ท่ารถ
 *                 example: "0623692587"
 *               tspyard_address:
 *                 type: string
 *                 description: ที่อยู่ท่ารถ
 *                 example: "นิคมอุตสาหกรรมบางพลี ถนนบางนา-ตราด ตำบลบางพลีใหญ่ อำเภอบางพลี จังหวัดสมุทรปราการ 10540"
 *               tspyard_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: ""
 *               tspyard_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของท่ารถ
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลท่ารถสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลท่ารถที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:tspyard_id'
    , authenticateToken
    , transportyardController.update);


/**
 * @swagger
 * /api/transport-yard/delete/{tspyard_id}:
 *   delete:
 *     summary: ลบข้อมูลท่ารถตามไอดีท่ารถ
 *     tags: [TransportYard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: tspyard_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีท่ารถที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลท่ารถสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลท่ารถที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:tspyard_id'
    , authenticateToken
    , transportyardController.del);

/**
 * @swagger
 * /api/transport-yard/get-all:
 *   get:
 *     summary: ดึงข้อมูลท่ารถทั้งหมด
 *     tags: [TransportYard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลท่ารถ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลท่ารถที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , transportyardController.getAll);
    
/**
 * @swagger
 * /api/transport-yard/get-by-id/{tspyard_id}:
 *   get:
 *     summary: ดึงข้อมูลท่ารถตามไอดีท่ารถ
 *     tags: [TransportYard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: tspyard_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีท่ารถ
 *     responses:
 *       200:
 *         description: พบข้อมูลท่ารถ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลท่ารถที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:tspyard_id'
    , authenticateToken
    , transportyardController.getById)

export default router;