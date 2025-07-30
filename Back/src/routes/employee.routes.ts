import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';
import { authenticateToken } from '../common/auth.token';


const router = Router();


/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: การจัดการพนักงาน
 */


/**
 * @swagger
 * /api/employees/create:
 *   post:
 *     summary: สร้างพนักงานใหม่
 *     tags: [Employees]
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
 *               emp_first_name:
 *                 type: string
 *                 description: ชื่อจริงของพนักงาน
 *                 example: "สมชาย"
 *               emp_last_name:
 *                 type: string
 *                 description: นามสกุลของพนักงาน 
 *                 example: "ใจดี"
 *     responses:
 *       201:
 *         description: สร้างข้อมูลพนักงานสำเร็จ
 *       400:
 *         description: เกิดข้อผิดพลาดในการสร้างข้อมูลพนักงาน
 */
router.post('/create'
    , authenticateToken
    , employeeController.create);

/**
 * @swagger
 * /api/employees/save-user/{emp_id}/{user_id}:
 *   post:
 *     summary: เพิ่มหรืออัปเดตข้อมูลผู้ใช้สำหรับพนักงานที่มีอยู่
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: emp_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ไอดีพนักงาน ที่ต้องการเพิ่มหรือแก้ไข ข้อมูลผู้ใช้
 *       - in: path
 *         name: user_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: ไอดีผู้ใช้  (กรณีเพิ่มใหม่ ไม่ต้องส่ง user_id, กรณีต้องการแก้ไข ให้ระบุ user_id)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: ชื่อผู้ใช้
 *                 example: "somchai.jaidee"
 *               password:
 *                 type: string
 *                 description: รหัสผ่าน
 *                 example: "password123"
 *               role_code:
 *                 type: string
 *                 description: บทบาทของผู้ใช้
 *                 example: "ADMIN"
 *     responses:
 *       200:
 *         description: เพิ่มหรือแก้ไขข้อมูลผู้ใช้สำเร็จ
 *       400:
 *         description: เกิดข้อผิดพลาดในการเพิ่มหรือแก้ไขข้อมูลผู้ใช้
 */
router.post('/save-user/:emp_id/:user_id'
    , authenticateToken
    , employeeController.saveUser);

/**
 * @swagger
 * /api/employees/update/{emp_id}:
 *   put:
 *     summary: แก้ไขข้อมูลพนักงานที่มีอยู่
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: emp_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสพนักงานที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               emp_first_name:
 *                 type: string
 *                 description: ชื่อจริงของพนักงาน
 *                 example: "สมชาย"
 *               emp_last_name:
 *                 type: string
 *                 description: นามสกุลของพนักงาน
 *                 example: "ใจดี"
 *     responses:
 *       204:
 *         description: แก้ไขข้อมูลพนักงานสำเร็จ
 *       400:
 *         description: เกิดข้อผิดพลาดในการแก้ไขข้อมูลพนักงาน
 */
router.put('/update/:emp_id'
    , authenticateToken
    , employeeController.update);

/**
 * @swagger
 * /api/employees/delete/{emp_id}:
 *   delete:
 *     summary: ลบพนักงาน
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: emp_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสพนักงานที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบข้อมูลพนักงานสำเร็จ
 *       400:
 *         description: เกิดข้อผิดพลาดในการลบข้อมูลพนักงาน
 */
router.delete('/delete/:emp_id'
    , authenticateToken
    , employeeController.del);

/**
 * @swagger
 * /api/employees/search:
 *   get:
 *     summary: ค้นหาพนักงาน
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: emp_code
 *         schema:
 *           type: string
 *         description: รหัสพนักงาน
 *       - in: query
 *         name: emp_name
 *         schema:
 *           type: string
 *         description: ชื่อของพนักงาน
 *     responses:
 *       200:
 *         description: พบข้อมูลพนักงาน
 *       400:
 *         description: เกิดข้อผิดพลาดในการค้นหาข้อมูลพนักงาน
 */
router.get('/search'
    , authenticateToken
    , employeeController.search);

/**
 * @swagger
 * /api/employees/get/{emp_id}:
 *   get:
 *     summary: ดึงข้อมูลพนักงานตาม emp_id
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: emp_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีพนักงาน
 *     responses:
 *       200:
 *         description: พบข้อมูลพนักงาน
 *       404:
 *         description: ไม่พบข้อมูลพนักงาน
 *       400:
 *         description: เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน
 */
router.get('/get/:emp_id'
    , authenticateToken
    , employeeController.getById);

/**
 * @swagger
 * /api/employees/get-by-user-id/{user_id}:
 *   get:
 *     summary: ดึงข้อมูลพนักงานตาม user ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสผู้ใช้งาน (user ID)
 *     responses:
 *       200:
 *         description: พบข้อมูลพนักงาน
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: พบข้อมูลพนักงาน
 *                 data:
 *                   $ref: '#/components/schemas/m_employee'
 *                 isCompleted:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: ไม่พบข้อมูลพนักงาน
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลพนักงานตาม user ID
 */
router.get('/get-by-user-id/:user_id'
    , authenticateToken
    , employeeController.getByUserId);

/**
 * @swagger
 * /api/employees/get-by-username/{username}:
 *   get:
 *     summary: ดึงข้อมูลพนักงานตาม username
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: ชื่อผู้ใช้งาน (username)
 *     responses:
 *       200:
 *         description: พบข้อมูลพนักงาน
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: พบข้อมูลพนักงาน
 *                 data:
 *                   $ref: '#/components/schemas/m_employee'
 *                 isCompleted:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: ไม่พบข้อมูลพนักงาน
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลพนักงานตาม username
 */
router.get('/get-by-username/:username'
    , authenticateToken
    , employeeController.getByUsername);

export default router;
