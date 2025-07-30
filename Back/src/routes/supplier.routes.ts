import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as supplierController from '../controllers/supplier.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Supplier
 *   description: การจัดการ Supplier
 */

/**
 * @swagger
 * /api/supplier/create:
 *   post:
 *     summary: สร้าง Supplier ใหม่
 *     tags: [Supplier]
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
 *               sup_code:
 *                 type: string
 *                 description: รหัส Supplier
 *                 example: "001"
 *               sup_name:
 *                 type: string
 *                 description: ชื่อ Supplier
 *                 example: " Supplier บางพลี"
 *               sup_tax_id:
 *                 type: string
 *                 description: เลขประจำตัวผู้เสียภาษี
 *                 example: "0107537002111"
 *               sup_phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์ Supplier
 *                 example: "0623692587"
 *               sup_address:
 *                 type: string
 *                 description: ที่อยู่ Supplier
 *                 example: "135 หมู่ 17 นิคมอุตสาหกรรมบางพลี ซอย 4 ถนนบางนา-ตราด ตำบลบางพลีใหญ่ อำเภอบางพลี จังหวัดสมุทรปราการ 10540"
 *               sup_email:
 *                 type: string
 *                 description: email Supplier
 *                 example: "sup07@hotmail.com"
 *               sup_payment_due_days:
 *                 type: number
 *                 description: เครดิตชำระเงิน (วัน)
 *                 example: 45
 *                 nullable: true
 *               sup_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: ""
 *               sup_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของ Supplier
 *                 example: true
 *     responses:
 *       201:
 *         description: สร้างข้อมูล Supplier สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล Supplier ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/create'
    , authenticateToken
    , supplierController.create);

/**
 * @swagger
 * /api/supplier/create-json:
 *   post:
 *     summary: Import Supplier Data from JSON
 *     tags: [Supplier]
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
 *                 รหัสSupplier:
 *                   type: string
 *                   example: "SUP001"
 *                 ชื่อSupplier:
 *                   type: string
 *                   example: "Supplier A"
 *                 เลขประจำตัวผู้เสียภาษี:
 *                   type: string
 *                   example: "1234567890123"
 *                 หมายเหตุ:
 *                   type: string
 *                   example: "ตัวอย่างข้อมูล"
 *                 ที่อยู่:
 *                   type: string
 *                   example: "123 Main Street"
 *                 เบอร์ติดต่อ:
 *                   type: string
 *                   example: "0812345678"
 *                 อีเมล:
 *                   type: string
 *                   example: "supplier@example.com"
 *                 เครดิตชำระเงิน(วัน):
 *                   type: integer
 *                   example: 30
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */
router.post('/create-json', authenticateToken, supplierController.createJson);

/**
 * @swagger
 * /api/supplier/update/{sup_id}:
 *   put:
 *     summary: แก้ไขข้อมูล Supplier ที่มีอยู่
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: sup_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดี Supplier ที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sup_code:
 *                 type: string
 *                 description: รหัส Supplier
 *                 example: "001"
 *               sup_name:
 *                 type: string
 *                 description: ชื่อ Supplier
 *                 example: " Supplier บางพลี"
 *               sup_tax_id:
 *                 type: string
 *                 description: เลขประจำตัวผู้เสียภาษี
 *                 example: "0107537002111"
 *               sup_phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์ Supplier
 *                 example: "0623692587"
 *               sup_address:
 *                 type: string
 *                 description: ที่อยู่ Supplier
 *                 example: "135 หมู่ 17 นิคมอุตสาหกรรมบางพลี ซอย 4 ถนนบางนา-ตราด ตำบลบางพลีใหญ่ อำเภอบางพลี จังหวัดสมุทรปราการ 10540"
 *               sup_email:
 *                 type: string
 *                 description: email Supplier
 *                 example: "sup07@hotmail.com"
 *               sup_payment_due_days:
 *                 type: number
 *                 description: เครดิตชำระเงิน (วัน)
 *                 example: 45
 *               sup_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "หมายเหตุ"
 *               sup_is_active:
 *                 type: boolean
 *                 description: สถานะการใช้งานของ Supplier
 *                 example: true
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูล Supplier สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล Supplier ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:sup_id'
    , authenticateToken
    , supplierController.update);


/**
 * @swagger
 * /api/supplier/delete/{sup_id}:
 *   delete:
 *     summary: ลบข้อมูล Supplier ตามไอดี Supplier 
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: sup_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดี Supplier ที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูล Supplier สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล Supplier ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:sup_id'
    , authenticateToken
    , supplierController.del);

/**
 * @swagger
 * /api/supplier/get-all:
 *   get:
 *     summary: ดึงข้อมูล Supplier ทั้งหมด
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูล Supplier 
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล Supplier ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , supplierController.getAll);

/**
 * @swagger
 * /api/supplier/get-by-id/{sup_id}:
 *   get:
 *     summary: ดึงข้อมูล Supplier ตามไอดี Supplier 
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: sup_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดี Supplier 
 *     responses:
 *       200:
 *         description: พบข้อมูล Supplier 
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล Supplier ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:sup_id'
    , authenticateToken
    , supplierController.getById);


export default router;