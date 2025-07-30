import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as factoryController from '../controllers/factory.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Factory
 *   description: การจัดการโรงงาน
 */

/**
 * @swagger
 * /api/factory/create:
 *   post:
 *     summary: สร้างโรงงานใหม่
 *     tags: [Factory]
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
 *               fty_code:
 *                 type: string
 *                 description: รหัสโรงงาน
 *                 example: "001"
 *               fty_name:
 *                 type: string
 *                 description: ชื่อโรงงาน
 *                 example: "โรงงานบางพลี"
 *               fty_phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์โรงงาน
 *                 example: "0623692587"
 *               fty_address:
 *                 type: string
 *                 description: ที่อยู่โรงงาน
 *                 example: "135 หมู่ 17 นิคมอุตสาหกรรมบางพลี ซอย 4 ถนนบางนา-ตราด ตำบลบางพลีใหญ่ อำเภอบางพลี จังหวัดสมุทรปราการ 10540"
 *               fty_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของโรงงาน
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูลโรงงานสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลโรงงานที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , factoryController.create);

/**
 * @swagger
 * /api/factory/create-json:
 *   post:
 *     summary: Import Factory Data from JSON
 *     tags: [Factory]
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
 *                 รหัสโรงงาน:
 *                   type: string
 *                   example: "FTY001"
 *                 ชื่อโรงงาน:
 *                   type: string
 *                   example: "Factory A"
 *                 ที่อยู่:
 *                   type: string
 *                   example: "123 Main Street"
 *                 เบอร์ติดต่อ:
 *                   type: string
 *                   example: "0812345678"
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */
router.post('/create-json', authenticateToken, factoryController.createJson);

/**
 * @swagger
 * /api/factory/update/{fty_id}:
 *   put:
 *     summary: แก้ไขข้อมูลโรงงานที่มีอยู่
 *     tags: [Factory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: fty_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีโรงงานที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fty_code:
 *                 type: string
 *                 description: รหัสโรงงานใหม่
 *                 example: "002"
 *               fty_name:
 *                 type: string
 *                 description: ชื่อโรงงาน
 *                 example: "โรงงานบางพลี"
 *               fty_phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์โรงงาน
 *                 example: 0623692587
 *               fty_address:
 *                 type: string
 *                 description: ที่อยู่โรงงาน
 *                 example: "135 หมู่ 17 นิคมอุตสาหกรรมบางพลี ซอย 4 ถนนบางนา-ตราด ตำบลบางพลีใหญ่ อำเภอบางพลี จังหวัดสมุทรปราการ 10540"
 *               fty_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของโรงงาน
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลโรงงานสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลโรงงานที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:fty_id'
    , authenticateToken
    , factoryController.update);


/**
 * @swagger
 * /api/factory/delete/{fty_id}:
 *   delete:
 *     summary: ลบข้อมูลโรงงานตามไอดีโรงงาน
 *     tags: [Factory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: fty_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีโรงงานที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลโรงงานสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลโรงงานที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:fty_id'
    , authenticateToken
    , factoryController.del);

/**
 * @swagger
 * /api/factory/get-all:
 *   get:
 *     summary: ดึงข้อมูลโรงงานทั้งหมด
 *     tags: [Factory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลโรงงาน
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลโรงงานที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , factoryController.getAll);
    
/**
 * @swagger
 * /api/factory/get-by-id/{fty_id}:
 *   get:
 *     summary: ดึงข้อมูลโรงงานตามไอดีโรงงาน
 *     tags: [Factory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: fty_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีโรงงาน
 *     responses:
 *       200:
 *         description: พบข้อมูลโรงงาน
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลโรงงานที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:fty_id'
    , authenticateToken
    , factoryController.getById);



export default router;