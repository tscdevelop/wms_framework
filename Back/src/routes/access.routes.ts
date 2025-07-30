import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as accessController from '../controllers/access.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Access
 *   description: การจัดการสิทธิ์การเข้าใช้งาน
 */

/**
 * @swagger
 * /api/access/create:
 *   post:
 *     summary: บันทึกข้อมูลสิทธิ์โรงงานและคลังสินค้าสำหรับผู้ใช้
 *     tags: [Access]
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
 *               user_id:
 *                 type: number
 *                 description: ID ของผู้ใช้
 *                 example: 1
 *               fty_ids:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: รายการ Factory IDs
 *                 example: [1, 2, 3]
 *               wh_ids:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: รายการ Warehouse IDs
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: บันทึกสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.post(
    '/create',
    authenticateToken,
    accessController.create
);

/**
 * @swagger
 * /api/access/search-warehouse:
 *   get:
 *     summary: ค้นหาข้อมูลคลังสินค้าทั้งหมดตามสิทธิ์โรงงานของผู้ใช้
 *     tags: [Access]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: fty_ids
 *         schema:
 *           type: string
 *         required: false
 *         description: รายการ ID ของโรงงาน (คั่นด้วยเครื่องหมายจุลภาค เช่น "1,2,3")
 *     responses:
 *       200:
 *         description: พบข้อมูลคลังสินค้า
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
 *                   example: ข้อมูลคลังสินค้า
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       wh_id:
 *                         type: number
 *                         example: 1
 *                       wh_name:
 *                         type: string
 *                         example: คลังสินค้าหลัก
 *                       fty_id:
 *                         type: number
 *                         example: 1
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.get('/search-warehouse', authenticateToken, accessController.searchWarehouse);


/**
 * @swagger
 * /api/access/get-by-user-id/{user_id}:
 *   get:
 *     summary: ดึงข้อมูลสิทธิ์การเข้าใช้งานโรงงานและคลังสินค้า
 *     tags: [Access]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ID ของผู้ใช้
 *     responses:
 *       200:
 *         description: พบข้อมูลโรงงานและคลังสินค้าที่มีสิทธิ์
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.get('/get-by-user-id/:user_id', authenticateToken, accessController.getByUserId);

/**
 * @swagger
 * /api/access/get-factory-by-user-id/{user_id}:
 *   get:
 *     summary: ดึงข้อมูลสิทธิ์การเข้าใช้งานโรงงาน
 *     tags: [Access]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ID ของผู้ใช้
 *     responses:
 *       200:
 *         description: พบข้อมูลโรงงานที่มีสิทธิ์
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.get('/get-factory-by-user-id/:user_id', authenticateToken, accessController.getFtyByUserId);

export default router;
    

