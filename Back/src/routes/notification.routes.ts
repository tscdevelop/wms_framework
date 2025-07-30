import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as notifapprovalController from '../controllers/notification.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: NotifApproval
 *   description: การจัดการการแจ้งเตือนและการอนุมัติคำร้อง
 */

/**
 * @swagger
 * /api/notif-approval/approve-request:
 *   post:
 *     summary: อัปเดตสถานะอนุมัติ (Approval) สำหรับคำร้อง
 *     tags: [NotifApproval]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               notif_id:
 *                 type: number
 *                 description: ไอดีของคำขอที่ต้องอนุมัติ
 *                 example: 3
 *               approvalStatus:
 *                 type: string
 *                 description: สถานะการอนุมัติ เช่น APPROVED:อนุมัติแล้ว , REJECTED:ไม่อนุมัติ(เลือกแล้วจะไม่สามารถเปลี่ยนได้) , PENDING:รออนุมัติ
 *                 example: APPROVED
 *                 enum: [APPROVED, REJECTED, PENDING]
 *     responses:
 *       200:
 *         description: อนุมัติคำขอสำเร็จ
 *       400:
 *         description: ค่าที่ส่งมาไม่ถูกต้อง
 *       404:
 *         description: ไม่พบข้อมูลที่ต้องการอนุมัติ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/approve-request', authenticateToken, notifapprovalController.approveRequest);

/**
 * @swagger
 * /api/notif-approval/get-request-all:
 *   get:
 *     summary: ดึงข้อมูลรายละเอียดคำร้องทั้งหมด
 *     operationId: getRequestAll
 *     tags: [NotifApproval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาด้วยรหัสคำร้อง
 *       - in: query
 *         name: details
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาด้วยรายละเอียดคำร้อง
 *       - in: query
 *         name: approvalStatus
 *         schema:
 *           type: string
 *           example: true
 *           enum: [APPROVED, REJECTED, PENDING]
 *         required: false
 *         description: สถานะการอนุมัติ เช่น APPROVED:อนุมัติแล้ว , REJECTED:ไม่อนุมัติ , PENDING:รออนุมัติ
 *     responses:
 *       200:
 *         description: พบข้อมูลรายละเอียดคำร้อง
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายละเอียดคำร้องที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-request-all'
    , authenticateToken
    , notifapprovalController.searchRequestApproval);

/**
 * @swagger
 * /api/notif-approval/get-request-by-id/{notif_id}:
 *   get:
 *     summary: ดึงข้อมูลรายละเอียดคำร้องทั้งหมด
 *     tags: [NotifApproval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: notif_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีคำร้อง
 *     responses:
 *       200:
 *         description: พบข้อมูลรายละเอียดคำร้อง
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายละเอียดคำร้องที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-request-by-id/:notif_id'
    , authenticateToken
    , notifapprovalController.getApprovalDetails);

/**
 * @swagger
 * /api/notif-approval/get-noti-outbtl-all:
 *   get:
 *     summary: ดึงข้อมูลรายการ outbound tooling ที่อนุมัติแล้วทั้งหมด
 *     tags: [NotifApproval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการ outbound tooling ที่อนุมัติแล้วทั้งหมด
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการ outbound tooling ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-noti-outbtl-all'
    , authenticateToken
    , notifapprovalController.getNotiOutbTLIsAppr);

/**
 * @swagger
 * /api/notif-approval/get-noti-minimum-stock-all:
 *   get:
 *     summary: ดึงข้อมูลจำนวนสินค้าที่ต่ำกว่าเกณฑ์ทั้งหมด
 *     tags: [NotifApproval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลจำนวนสินค้าที่ต่ำกว่าเกณฑ์ทั้งหมด
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลจำนวนสินค้าที่ต่ำกว่าเกณฑ์ ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-noti-minimum-stock-all'
    , authenticateToken
    , notifapprovalController.getNotiMinimumStock);

/**
 * @swagger
 * /api/notif-approval/get-noti-shelf-life-all:
 *   get:
 *     summary: ดึงข้อมูลจำนวนสินค้าที่ใกล้หมดอายุทั้งหมด
 *     tags: [NotifApproval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลจำนวนสินค้าที่ใกล้หมดอายุทั้งหมด
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลจำนวนสินค้าที่ใกล้หมดอายุ ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-noti-shelf-life-all'
    , authenticateToken
    , notifapprovalController.getNotiShelfLife);

/**
 * @swagger
 * /api/notif-approval/get-unread-counts:
 *   get:
 *     summary: ดึงข้อมูลจำนวนการแจ้งเตือนที่เป็นสถานะ unread ทั้งหมด
 *     tags: [NotifApproval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลจำนวนการแจ้งเตือนที่เป็นสถานะ unread ทั้งหมด
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลจำนวนการแจ้งเตือนที่เป็นสถานะ unread  ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-unread-counts'
    , authenticateToken
    , notifapprovalController.getUnreadNotif);

export default router;