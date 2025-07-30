import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as inbfinishedgoodsController from '../controllers/inb_finished_goods.controller';
import * as inbrawmaterialController from '../controllers/inb_raw_material.controller';
import * as inbsemiController from '../controllers/inb_semi.controller';
import * as inbtoolingController from '../controllers/inb_tooling.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: การจัดการรายการสินค้า (Inventory)
 */

/**
 * @swagger
 * /api/inventory/get-inbound-rm-all:
 *   get:
 *     summary: ดึงข้อมูลรายการวัตถุดิบทั้งหมด
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: ftyName
 *         schema:
 *           type: string
 *         required: false
 *         description: "ระบุโรงงาน"
 *       - in: query
 *         name: whName
 *         schema:
 *           type: string
 *         required: false
 *         description: "ระบุคลัง"
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการวัตถุดิบ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการวัตถุดิบที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-inbound-rm-all', authenticateToken, inbrawmaterialController.getInventoryAll);

/**
 * @swagger
 * /api/inventory/get-inbound-semi-all:
 *   get:
 *     summary: ดึงข้อมูลรายการสินค้า semi ทั้งหมด
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: ftyName
 *         schema:
 *           type: string
 *         required: false
 *         description: "ระบุโรงงาน"
 *       - in: query
 *         name: whName
 *         schema:
 *           type: string
 *         required: false
 *         description: "ระบุคลัง"
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการสินค้า semi
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการสินค้า semi ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-inbound-semi-all', authenticateToken, inbsemiController.getInventoryAll);


/**
 * @swagger
 * /api/inventory/get-inbound-fg-all:
 *   get:
 *     summary: ดึงข้อมูลรายการสินค้าสำเร็จรูปทั้งหมด
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: ftyName
 *         schema:
 *           type: string
 *         required: false
 *         description: "ระบุโรงงาน"
 *       - in: query
 *         name: whName
 *         schema:
 *           type: string
 *         required: false
 *         description: "ระบุคลัง"
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการสินค้าสำเร็จรูป
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-inbound-fg-all', authenticateToken, inbfinishedgoodsController.getInventoryAll);

/**
 * @swagger
 * /api/inventory/get-inbound-tl-all:
 *   get:
 *     summary: ดึงข้อมูลรายการเครื่องมือและอุปกรณ์ทั้งหมด
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: ftyName
 *         schema:
 *           type: string
 *         required: false
 *         description: "ระบุโรงงาน"
 *       - in: query
 *         name: whName
 *         schema:
 *           type: string
 *         required: false
 *         description: "ระบุคลัง"
 *     responses:
 *       200:
 *         description: พบข้อมูลรายการเครื่องมือและอุปกรณ์
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลรายการเครื่องมือและอุปกรณ์ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-inbound-tl-all', authenticateToken, inbtoolingController.getInventoryAll);

/**
 * @swagger
 * /api/inventory/export-rm-to-excel:
 *   get:
 *     summary: Export Inventory RM Data to Excel (Option to include Lot)
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: fty_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาชื่อโรงงาน (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: wh_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาชื่อคลัง (รองรับการค้นหาบางส่วน)
 *     responses:
 *       200:
 *         description: ไฟล์ Excel ถูกสร้างและส่งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-rm-to-excel', authenticateToken, inbrawmaterialController.exportINVAllToExcel);

/**
 * @swagger
 * /api/inventory/export-semi-to-excel:
 *   get:
 *     summary: Export Inventory Semi Data to Excel
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fty_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาชื่อโรงงาน (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: wh_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาชื่อคลัง (รองรับการค้นหาบางส่วน)
 *     responses:
 *       200:
 *         description: ไฟล์ Excel ถูกสร้างและส่งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-semi-to-excel', authenticateToken, inbsemiController.exportINVAllToExcel);

/**
 * @swagger
 * /api/inventory/export-fg-to-excel:
 *   get:
 *     summary: Export Inventory FG Data to Excel
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fty_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาชื่อโรงงาน (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: wh_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาชื่อคลัง (รองรับการค้นหาบางส่วน)
 *     responses:
 *       200:
 *         description: ไฟล์ Excel ถูกสร้างและส่งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-fg-to-excel', authenticateToken, inbfinishedgoodsController.exportINVAllToExcel);

/**
 * @swagger
 * /api/inventory/export-tl-to-excel:
 *   get:
 *     summary: Export Inventory TL Data to Excel
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fty_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาชื่อโรงงาน (รองรับการค้นหาบางส่วน)
 *       - in: query
 *         name: wh_name
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาชื่อคลัง (รองรับการค้นหาบางส่วน)
 *     responses:
 *       200:
 *         description: ไฟล์ Excel ถูกสร้างและส่งสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลการนำเข้าสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: ไม่สามารถสร้างไฟล์ Excel ได้
 */
router.get('/export-tl-to-excel', authenticateToken, inbtoolingController.exportINVAllToExcel);

export default router;
