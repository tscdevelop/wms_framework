import express, { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as warehouseController from '../controllers/warehouse.controller';
import * as zoneController from '../controllers/zone.controller';
import * as factoryController from '../controllers/factory.controller';
import * as locationController from '../controllers/location.controller';
import * as unitController from '../controllers/unit.controller';
import * as rawmaterialsController from '../controllers/raw_material.controller';
import * as finishedgoodsController from '../controllers/finished_goods.controller';
import * as semiController from '../controllers/semi.controller';
import * as toolingController from '../controllers/tooling.controller';
import * as transportyardController from '../controllers/transport_yard.controller';
import * as supplierController from '../controllers/supplier.controller';
import * as criteriaController from '../controllers/criteria.controller';
import * as rawmaterialIfmController from '../controllers/raw_material_ifm.controller';
import * as finishGoodsIfmController from '../controllers/finished_goods_ifm.controller'
import * as semiIfmController from '../controllers/semi_ifm.controller';
import * as toolingIfmController from '../controllers/tooling_ifm.controller';
import * as inbrmController from '../controllers/inb_raw_material.controller';
import * as inbfgController from '../controllers/inb_finished_goods.controller';
import * as inbsemiController from '../controllers/inb_semi.controller';
import * as inbtlController from '../controllers/inb_tooling.controller';
import * as BOMController from '../controllers/bom.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dropdown
 *   description: การจัดการ dropdown 
 */

/**
 * @swagger
 * /api/dropdown/get-factory-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรายชื่อโรงงาน
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายชื่อโรงงาน
 *       404:
 *         description: ไม่พบข้อมูลรายชื่อโรงงาน
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรายชื่อโรงงาน
 */
router.get('/get-factory-dropdown'
    , authenticateToken
    , factoryController.getFtyDropdown);

/**
 * @swagger
 * /api/dropdown/get-warehouse-dropdown/{fty_id}:
 *   get:
 *     summary: ดึงข้อมูลรายชื่อคลังสินค้า
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: fty_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดี factory
 *     responses:
 *       200:
 *         description: พบข้อมูลรายชื่อคลังสินค้า
 *       404:
 *         description: ไม่พบข้อมูลรายชื่อคลังสินค้า
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรายชื่อคลังสินค้า
 */
router.get('/get-warehouse-dropdown/:fty_id'
    , authenticateToken
    , warehouseController.getWhDropdown);

/**
 * @swagger
 * /api/dropdown/get-warehouse-type-dropdown:
 *   get:
 *     summary: ดึงข้อมูลประเภทคลังสินค้า
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลประเภทคลังสินค้า
 *       404:
 *         description: ไม่พบข้อมูลประเภทคลังสินค้า
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลประเภทคลังสินค้า
 */
router.get('/get-warehouse-type-dropdown'
    , authenticateToken
    , warehouseController.getWhTypeDropdown );

/**
 * @swagger
 * /api/dropdown/get-zone-dropdown/{wh_id}:
 *   get:
 *     summary: ดึงข้อมูลรายชื่อโซน
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: wh_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดี warehouse
 *     responses:
 *       200:
 *         description: พบข้อมูลรายชื่อโซน
 *       404:
 *         description: ไม่พบข้อมูลรายชื่อโซน
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรายชื่อโซน
 */
router.get('/get-zone-dropdown/:wh_id'
    , authenticateToken
    , zoneController.getZnDropdown);

/**
 * @swagger
 * /api/dropdown/get-location-dropdown/{zn_id}:
 *   get:
 *     summary: ดึงข้อมูลรายชื่อตำแหน่งที่ตั้ง
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: zn_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดี zone
 *     responses:
 *       200:
 *         description: พบข้อมูลรายชื่อตำแหน่งที่ตั้ง
 *       404:
 *         description: ไม่พบข้อมูลรายชื่อตำแหน่งที่ตั้ง
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรายชื่อตำแหน่งที่ตั้ง
 */
router.get('/get-location-dropdown/:zn_id'
    , authenticateToken
    , locationController.getLocDropdown);

/**
 * @swagger
 * /api/dropdown/get-unit-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรายชื่อหน่วย
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายชื่อหน่วย
 *       404:
 *         description: ไม่พบข้อมูลรายชื่อหน่วย
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรายชื่อหน่วย
 */
router.get('/get-unit-dropdown'
    , authenticateToken
    , unitController.getUnitDropdown);

/**
 * @swagger
 * /api/dropdown/get-raw-material-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรายชื่อ ประเภทวัตถุดิบ
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายชื่อวัตถุดิบ
 *       404:
 *         description: ไม่พบข้อมูลรายชื่อวัตถุดิบ
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรายชื่อวัตถุดิบ
 */
router.get('/get-raw-material-dropdown'
    , authenticateToken
    , rawmaterialsController.getRMDropdown);

/**
 * @swagger
 * /api/dropdown/get-finished-goods-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรายชื่อ ประเภทสินค้าสำเร็จรูป
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายชื่อสินค้าสำเร็จรูป
 *       404:
 *         description: ไม่พบข้อมูลรายชื่อสินค้าสำเร็จรูป
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรายชื่อสินค้าสำเร็จรูป
 */
router.get('/get-finished-goods-dropdown'
    , authenticateToken
    , finishedgoodsController.getFGDropdown);

/**
 * @swagger
 * /api/dropdown/get-semi-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรายชื่อ ประเภท Semi
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายชื่อ Semi
 *       404:
 *         description: ไม่พบข้อมูลรายชื่อ Semi
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรายชื่อ Semi
 */
router.get('/get-semi-dropdown'
    , authenticateToken
    , semiController.getSemiDropdown);

/**
 * @swagger
 * /api/dropdown/get-tooling-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรายชื่อ ประเภทเครื่องมือ
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรายชื่อเครื่องมือ
 *       404:
 *         description: ไม่พบข้อมูลรายชื่อเครื่องมือ
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรายชื่อเครื่องมือ
 */
router.get('/get-tooling-dropdown'
    , authenticateToken
    , toolingController.getTLDropdown);

/**
 * @swagger
 * /api/dropdown/get-transport-yard-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรหัสท่ารถ
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรหัสท่ารถ
 *       404:
 *         description: ไม่พบข้อมูลรหัสท่ารถ
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรหัสท่ารถ
 */
router.get('/get-transport-yard-dropdown'
    , authenticateToken
    , transportyardController.getDYDropdown);

/**
 * @swagger
 * /api/dropdown/get-supplier-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรหัสและชื่อ supplier
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรหัสและชื่อ supplier
 *       404:
 *         description: ไม่พบข้อมูลรหัสและชื่อ supplier
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรหัสและชื่อ supplier
 */
router.get('/get-supplier-dropdown'
    , authenticateToken
    , supplierController.getSupDropdown);

/**
 * @swagger
 * /api/dropdown/get-criteria-dropdown:
 *   get:
 *     summary: ดึงข้อมูลชื่อ criteria
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลชื่อ criteria
 *       404:
 *         description: ไม่พบข้อมูลชื่อ criteria
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลชื่อ criteria
 */
router.get('/get-criteria-dropdown'
    , authenticateToken
    , criteriaController.getCrtDropdown);

/**
 * @swagger
 * /api/dropdown/get-raw-material-information-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรหัสและชื่อ รายการ Raw Materials
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรหัสและชื่อ รายการ Raw Materials
 *       404:
 *         description: ไม่พบข้อมูลรหัสและชื่อ รายการ Raw Materials
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรหัสและชื่อ รายการ Raw Materials
 */
router.get('/get-raw-material-information-dropdown'
    , authenticateToken
    , rawmaterialIfmController.getRMIfmDropdown);

/**
 * @swagger
 * /api/dropdown/get-finished-goods-information-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรหัสและชื่อ รายการ FG
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรหัสและชื่อ รายการ FG
 *       404:
 *         description: ไม่พบข้อมูลรหัสและชื่อ รายการ FG
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรหัสและชื่อ รายการ FG
 */
router.get('/get-finished-goods-information-dropdown'
    , authenticateToken
    , finishGoodsIfmController.getFGIfmDropdown);

/**
 * @swagger
 * /api/dropdown/get-semi-information-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรหัสและชื่อ รายการ Semi
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรหัสและชื่อ รายการ Semi
 *       404:
 *         description: ไม่พบข้อมูลรหัสและชื่อ รายการ Semi
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรหัสและชื่อ รายการ Semi
 */
router.get('/get-semi-information-dropdown'
    , authenticateToken
    , semiIfmController.getSemiIfmDropdown);

/**
 * @swagger
 * /api/dropdown/get-tooling-information-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรหัสและชื่อ รายการ Tooling
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรหัสและชื่อ รายการ Tooling
 *       404:
 *         description: ไม่พบข้อมูลรหัสและชื่อ รายการ Tooling
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรหัสและชื่อ รายการ Tooling
 */
router.get('/get-tooling-information-dropdown'
    , authenticateToken
    , toolingIfmController.getTLIfmDropdown);

/**
 * @swagger
 * /api/dropdown/get-inbound-factory-dropdown/{user_id}:
 *   get:
 *     summary: ดึงข้อมูลรายชื่อโรงงาน ตามไอดี user
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดี user
 *     responses:
 *       200:
 *         description: พบข้อมูลรายชื่อโรงงาน
 *       404:
 *         description: ไม่พบข้อมูลรายชื่อโรงงาน
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรายชื่อโรงงาน
 */
router.get('/get-inbound-factory-dropdown/:user_id'
    , authenticateToken
    , factoryController.getFtyDropdownByUserId);

/**
 * @swagger
 * /api/dropdown/get-inbound-warehouse-dropdown/{fty_id}:
 *   get:
 *     summary: ดึงข้อมูลรายชื่อคลังสินค้าตามไอดีโรงงาน
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: fty_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ไอดี factory
 *     responses:
 *       200:
 *         description: สำเร็จ
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
 *                   example: "item.warehouse found"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       wh_id:
 *                         type: integer
 *                         example: 1
 *                       wh_name:
 *                         type: string
 *                         example: "Warehouse A"
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.get('/get-inbound-warehouse-dropdown/:fty_id'
    , authenticateToken
    , warehouseController.getWhDropdownByFtyId);

/**
 * @swagger
 * /api/dropdown/get-inbound-raw-material-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรหัสและชื่อการนำเข้าสินค้าสำเร็จรูป (Inbound) พร้อม filter BOM
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: isBomUsed
 *         schema:
 *           type: boolean
 *         required: false
 *         description: |
 *           กรองข้อมูลตามสถานะ inbrm_is_bom_used:
 *           - ส่ง **true** เพื่อกรองข้อมูลที่ **inbrm_is_bom_used = true** (ใช้งานกับ Bom)  
 *           - ส่ง **false** เพื่อกรองข้อมูลที่ **inbrm_is_bom_used = false** (ไม่ใช้งานกับ Bom)  
 *           - ถ้าไม่ส่ง จะดึงข้อมูลทั้งหมด
 *         example: true
 *       - in: query
 *         name: inbrm_bom
 *         schema:
 *           type: string
 *         required: false
 *         description: |
 *           - ใช้กรองรหัส BOM เฉพาะเมื่อ **isBomUsed = true**  
 *           - ถ้าไม่ส่ง จะดึงข้อมูลทั้งหมดของ BOM
 *         example: BOM123
 *     responses:
 *       200:
 *         description: พบข้อมูลรหัสและชื่อสินค้าสำเร็จรูป (Inbound)
 *       404:
 *         description: ไม่พบข้อมูลรหัสและชื่อสินค้าสำเร็จรูป (Inbound)
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรหัสและชื่อสินค้าสำเร็จรูป (Inbound)
 */
router.get('/get-inbound-raw-material-dropdown', authenticateToken, inbrmController.getInbrmDropdown);

/**
 * @swagger
 * /api/dropdown/get-inbound-finished-goods-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรหัสและชื่อการนำเข้าวัตถุดิบ (Inbound)
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรหัสและชื่อวัตถุดิบ (Inbound)
 *       404:
 *         description: ไม่พบข้อมูลรหัสและชื่อวัตถุดิบ (Inbound)
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรหัสและชื่อวัตถุดิบ (Inbound)
 */
router.get('/get-inbound-finished-goods-dropdown'
    , authenticateToken
    , inbfgController.getInbfgDropdown);

/**
 * @swagger
 * /api/dropdown/get-inbound-semi-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรหัสและชื่อการนำเข้า Semi (Inbound)
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรหัสและชื่อ Semi (Inbound)
 *       404:
 *         description: ไม่พบข้อมูลรหัสและชื่อ Semi (Inbound)
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรหัสและชื่อ Semi (Inbound)
 */
router.get('/get-inbound-semi-dropdown'
    , authenticateToken
    , inbsemiController.getInbsemiDropdown);

/**
 * @swagger
 * /api/dropdown/get-inbound-tooling-dropdown:
 *   get:
 *     summary: ดึงข้อมูลรหัสการนำเข้าเครื่องมือและอุปกรณ์ (Inbound)
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูลรหัสเครื่องมือและอุปกรณ์ (Inbound)
 *       404:
 *         description: ไม่พบข้อมูลรหัสเครื่องมือและอุปกรณ์ (Inbound)
 *       400:
 *         description: ข้อผิดพลาดในการดึงข้อมูลรหัสเครื่องมือและอุปกรณ์ (Inbound)
 */
router.get('/get-inbound-tooling-dropdown'
    , authenticateToken
    , inbtlController.getInbtlDropdown);


/**
 * @swagger
 * /api/dropdown/get-so-number:
 *   get:
 *     summary: ดึงข้อมูลรายการ SO
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *     responses:
 *       200:
 *         description: พบข้อมูล SO
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล SO ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-so-number'
    , authenticateToken
    , BOMController.getSODropdown);

/**
 * @swagger
 * /api/dropdown/get-bom-number/{so_id}:
 *   get:
 *     summary: ดึงข้อมูลรายการ Bom ตามไอดี SO
 *     tags: [Dropdown]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: so_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดี SO
 *     responses:
 *       200:
 *         description: พบข้อมูล Bom
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูล Bom ที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-bom-number/:so_id'
    , authenticateToken
    , BOMController.getBomDropdown);

export default router;
