import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as BOMController from '../controllers/bom.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: BOM
 *   description: การจัดการ BOM
 */

/**
 * @swagger
 * /api/bom/create:
 *   post:
 *     summary: สร้างรายการ BOM
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               so_code:
 *                 type: string
 *                 description: รหัส SO.
 *                 example: "SO123"
 *               so_cust_name:
 *                 type: string
 *                 description: ชื่อลูกค้า
 *                 example: "วิมล สังค์ทอง"
 *               so_details:
 *                 type: string
 *                 description: รายละเอียด
 *                 example: "ผลิตชั้นวางหนังสือ"
 *               item:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     bom_number:
 *                       type: string
 *                       description: Job number
 *                       example: "JB001"
 *                     fgifm_id:
 *                       type: number
 *                       description: ไอดี FG
 *                       example: 1
 *                     bom_quantity:
 *                       type: number
 *                       description: จำนวน
 *                       example: 1
 *     responses:
 *       201:
 *         description: สร้างข้อมูลรายการ BOM สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isError:
 *                   type: boolean
 *                   example: false
 *                 isCompleted:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Created item bom successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     so_id:
 *                       type: number
 *                       example: 1
 *                     so_cust_name:
 *                       type: string
 *                       example: "วิมล สังค์ทอง"
 *                     so_details:
 *                       type: string
 *                       example: "ผลิตชั้นวางหนังสือ"
 *                     item:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           bom_number:
 *                             type: string
 *                             example: "JB001"
 *                           fgifm_id:
 *                             type: number
 *                             example: 1
 *                           bom_quantity:
 *                             type: number
 *                             example: 1
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ BOM ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

router.post('/create',
    authenticateToken,
    BOMController.create);


/**
 * @swagger
 * /api/bom/update/{so_id}:
 *   put:
 *     summary: แก้ไขข้อมูล BOM และรายการ BOM Items ทั้งหมดที่เกี่ยวข้องกับ so_id
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: so_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID ของ BOM (so_id) ที่ต้องการอัปเดต
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               so_code:
 *                 type: string
 *                 description: รหัส Sales Order (SO Code)
 *                 example: "SO1234"
 *               so_cust_name:
 *                 type: string
 *                 description: ชื่อลูกค้า
 *                 example: "วิมล สังค์ทอง"
 *               so_details:
 *                 type: string
 *                 description: รายละเอียดเพิ่มเติม
 *                 example: "Updated Sales Order Details"
 *               item:
 *                 type: array
 *                 description: รายการ BOM Items
 *                 items:
 *                   type: object
 *                   properties:
 *                     bom_number:
 *                       type: string
 *                       description: หมายเลข BOM
 *                       example: "B001"
 *                     fgifm_id:
 *                       type: number
 *                       description: ไอดี FG
 *                       example: 1
 *                     bom_quantity:
 *                       type: number
 *                       description: จำนวน
 *                       example: 10
 *     responses:
 *       200:
 *         description: อัปเดตข้อมูล BOM สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isCompleted:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Update BOM successfully"
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบ BOM ตาม so_id ที่ระบุ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update/:so_id', authenticateToken, BOMController.update);

/**
 * @swagger
 * /api/bom/delete/{so_id}:
 *   delete:
 *     summary: ลบข้อมูลรายการ SO ตามไอดี
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: so_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีรายการ SO ที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลรายการ SO สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ SO ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:so_id'
    , authenticateToken
    , BOMController.del);

/**
 * @swagger
 * /api/bom/get-all:
 *   get:
 *     summary: ดึงข้อมูลรายการ BOM ทั้งหมด
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ BOM 
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ BOM ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , BOMController.getAll);

    /**
 * @swagger
 * /api/bom/get-all-details/{so_id}:
 *   get:
 *     summary: ดึงข้อมูลรายละเอียดรายการ BOM
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: so_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการ BOM 
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ BOM 
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ BOM ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all-details/:so_id'
    , authenticateToken
    , BOMController.getAllDetails);

/**
 * @swagger
 * /api/bom/get-by-id/{so_id}:
 *   get:
 *     summary: ดึงข้อมูลรายการ BOM ตามไอดีรายการ BOM 
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: so_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการ BOM 
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ BOM 
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ BOM ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:so_id'
    , authenticateToken
    , BOMController.getById);

/**
 * @swagger
 * /api/bom/get-by-bom/{so_id}/{bom_number}:
 *   get:
 *     summary: ดึงข้อมูลรายการ Inbound FG ตามไอดี SO และรหัส Bom
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: so_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดี SO
 *       - in: path
 *         name: bom_number
 *         schema:
 *           type: string
 *         required: true
 *         description: รหัส Bom
 *     responses:
 *       200:
 *         description: พบข้อมูล Inbound FG
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล Inbound FG ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-bom/:so_id/:bom_number'
    , authenticateToken
    , BOMController.getByBom);

    /**
 * @swagger
 * /api/bom/export-to-excel:
 *   get:
 *     summary: Export BOM Data to Excel
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: formatted_date
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาตามวันที่ในรูปแบบ เช่น 02 Feb 25 (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: create_time
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาเวลาในรูปแบบ HH:mm:ss (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: so_code
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาตามรหัส SO. (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: so_details
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาตามรายละเอียด (ใช้เพื่อค้นหาเฉพาะจำนวนที่กำหนด)
 *     responses:
 *       200:
 *         description: ไฟล์ Excel ถูกสร้างและส่งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้ารายการ BOM ที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-to-excel', authenticateToken, BOMController.exportAllToExcel);

/**
 * @swagger
 * /api/bom/export-details-to-excel:
 *   get:
 *     summary: Export BOM Details to Excel
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: so_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีรายการ BOM 
 *       - in: query
 *         name: bom_number
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหา BOM no. (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: fgifm_code
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหารหัส (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: fgifm_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาชื่อ (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *     responses:
 *       200:
 *         description: ไฟล์ Excel ถูกสร้างและส่งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้ารายการ BOM ที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-details-to-excel', authenticateToken, BOMController.exportDetailsToExcel);

export default router;