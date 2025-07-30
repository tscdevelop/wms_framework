import { Router } from 'express';
import { authenticateToken } from '../common/auth.token';
import * as outbfinishedgoodsController from '../controllers/outb_finished_goods.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: OutboundFG
 *   description: การจัดการใบเบิกสินค้าสำเร็จรูป (FG)
 */

/**
 * @swagger
 * /api/outbound-fg/create:
 *   post:
 *     summary: สร้างรายการใบเบิกสินค้าสำเร็จรูป
 *     description: outbfg_is_shipment [ true =  จัดส่งโดยบริษัท, false = มารับเอง ]
 *     tags: [OutboundFG]
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
 *               outbfg_so:
 *                 type: string
 *                 description: รหัสใบเบิก SO
 *                 example: "S124-aa"
 *               outbfg_details:
 *                 type: string
 *                 description: รายละเอียดใบเบิก
 *                 example: "Order FG"
 *               outbfg_is_shipment:
 *                 type: boolean
 *                 description: การจัดส่ง (true = จัดส่งโดยบริษัท, false = มารับเอง)
 *                 example: true
 *               outbfg_driver_name:
 *                 type: string
 *                 description: ชื่อคนขับ (จำเป็นหากเป็น SELF_PICKUP)
 *                 example: "นายพล"
 *               outbfg_vehicle_license:
 *                 type: string
 *                 description: ทะเบียนรถ (จำเป็นหากเป็น SELF_PICKUP)
 *                 example: "กข543"
 *               tspyard_id:
 *                 type: integer
 *                 description: ไอดีท่าเรือหรือท่ารถ (จำเป็นหากเป็น DELIVERY)
 *                 example: 1
 *               outbfg_phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์ (จำเป็นหากเป็น DELIVERY)
 *                 example: "025678945"
 *               outbfg_address:
 *                 type: string
 *                 description: ที่อยู่ (จำเป็นหากเป็น DELIVERY)
 *                 example: "7/12 พญาไท กรุงเทพ 10400"
 *               so_id:
 *                 type: integer
 *                 description: ไอดีของ SO ที่เกี่ยวข้อง
 *                 example: 1
 *               outbfg_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "หมายเหตุ"
 *               items:
 *                 type: array
 *                 description: รายการสินค้าสำเร็จรูปที่ต้องการเบิก
 *                 items:
 *                   type: object
 *                   properties:
 *                     bom_id:
 *                       type: integer
 *                       description: Bom Id ของ BOM
 *                       example: 1
 *                     inbfg_id:
 *                       type: integer
 *                       description: ไอดี Inbound FG
 *                       example: 1
 *                     outbfgitm_quantity:
 *                       type: number
 *                       description: จำนวนที่ต้องการเบิก
 *                       example: 10
 *     responses:
 *       201:
 *         description: สร้างข้อมูลสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post(
    '/create',
    authenticateToken,
    outbfinishedgoodsController.create
);


/**
 * @swagger
 * /api/outbound-fg/create-no-bom:
 *   post:
 *     summary: สร้างรายการใบเบิกสินค้าสำเร็จรูป (ไม่มี BOM)
 *     description: outbfg_is_shipment [ true =  จัดส่งโดยบริษัท, false = มารับเอง ]
 *     tags: [OutboundFG]
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
 *               outbfg_so:
 *                 type: string
 *                 description: รหัสใบเบิก SO
 *                 example: "S124-aa"
 *               outbfg_details:
 *                 type: string
 *                 description: รายละเอียดใบเบิก
 *                 example: "Order FG"
 *               outbfg_is_shipment:
 *                 type: boolean
 *                 description: การจัดส่ง (true = จัดส่งโดยบริษัท, false = มารับเอง)
 *                 example: true
 *               outbfg_driver_name:
 *                 type: string
 *                 description: ชื่อคนขับ (จำเป็นหากเป็น SELF_PICKUP)
 *                 example: "นายพล"
 *               outbfg_vehicle_license:
 *                 type: string
 *                 description: ทะเบียนรถ (จำเป็นหากเป็น SELF_PICKUP)
 *                 example: "กข543"
 *               tspyard_id:
 *                 type: integer
 *                 description: ไอดีท่าเรือหรือท่ารถ (จำเป็นหากเป็น DELIVERY)
 *                 example: 1
 *               outbfg_phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์ (จำเป็นหากเป็น DELIVERY)
 *                 example: "025678945"
 *               outbfg_address:
 *                 type: string
 *                 description: ที่อยู่ (จำเป็นหากเป็น DELIVERY)
 *                 example: "7/12 พญาไท กรุงเทพ 10400"
 *               outbfg_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "หมายเหตุ"
 *               items:
 *                 type: array
 *                 description: รายการสินค้าที่ต้องการเบิก (ไม่มี BOM)
 *                 items:
 *                   type: object
 *                   properties:
 *                     inbfg_id:
 *                       type: integer
 *                       description: ไอดี Inbound FG
 *                       example: 1
 *                     outbfgitm_quantity:
 *                       type: integer
 *                       description: จำนวนที่ต้องเบิก
 *                       example: 10
 *     responses:
 *       201:
 *         description: สร้างข้อมูลสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post(
    '/create-no-bom',
    authenticateToken,
    outbfinishedgoodsController.createNoBom
);


/**
 * @swagger
 * /api/outbound-fg/withdraw-scan/{outbfg_id}:
 *   post:
 *     summary: บันทึกการสแกนบาร์โค้ด รายการเบิกหลายรายการ
 *     tags: [OutboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbfg_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีของ Outbound Finished Goods ที่ต้องการสแกน
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 description: รายการ Inbound Finished Goods ที่ต้องการเบิก
 *                 items:
 *                   type: object
 *                   properties:
 *                     outbfgitm_id:
 *                       type: integer
 *                       description: ไอดีของ outbound Finished Goods
 *                       example: 1
 *                     inbfg_id:
 *                       type: integer
 *                       description: ไอดีของ Inbound Finished Goods
 *                       example: 1
 *                     outbfgitm_withdr_count:
 *                       type: integer
 *                       description: จำนวนที่ต้องการเบิก
 *                       example: 10
 *     responses:
 *       200:
 *         description: บันทึกจำนวนการสแกนสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isCompleted:
 *                   type: boolean
 *                   description: สถานะการทำงานสำเร็จ
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: ข้อความแสดงผลลัพธ์
 *                   example: "Scan count updated successfully"
 *                 isError:
 *                   type: boolean
 *                   description: สถานะการเกิดข้อผิดพลาด
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       outbfg_id:
 *                         type: integer
 *                         description: ไอดีของ Outbound Finished Goods
 *                         example: 1
 *                       outbfgitm_id:
 *                         type: integer
 *                         description: ไอดีของ outbound Finished Goods
 *                         example: 1
 *                       inbfg_id:
 *                         type: integer
 *                         description: ไอดีของ Inbound Finished Goods
 *                         example: 2
 *                       outbfgitm_withdr_count:
 *                         type: integer
 *                         description: จำนวนการสแกนที่บันทึก
 *                         example: 3
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง
 *       404:
 *         description: ไม่พบข้อมูลสำหรับบาร์โค้ดนี้
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/withdraw-scan/:outbfg_id', authenticateToken, outbfinishedgoodsController.withdrScan);

/**
 * @swagger
 * /api/outbound-fg/shipment-scan/{outbfg_id}:
 *   post:
 *     summary: บันทึกการสแกนบาร์โค้ด รายการส่งสินค้าหลายรายการ
 *     tags: [OutboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbfg_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ไอดีของ Outbound Finished Goods ที่ต้องการสแกน
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 description: รายการ Inbound Finished Goods ที่ต้องการสแกนส่งออก
 *                 items:
 *                   type: object
 *                   properties:
 *                     outbfgitm_id:
 *                       type: integer
 *                       description: ไอดีของ outbound Finished Goods
 *                       example: 1
 *                     inbfg_id:
 *                       type: integer
 *                       description: ไอดีของ Inbound Finished Goods
 *                       example: 1
 *                     outbfgitm_shipmt_count:
 *                       type: integer
 *                       description: จำนวนที่ต้องการส่งออก
 *                       example: 10
 *     responses:
 *       200:
 *         description: บันทึกจำนวนการสแกนสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isCompleted:
 *                   type: boolean
 *                   description: สถานะการทำงานสำเร็จ
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: ข้อความแสดงผลลัพธ์
 *                   example: "Scan count updated successfully"
 *                 isError:
 *                   type: boolean
 *                   description: สถานะการเกิดข้อผิดพลาด
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       outbfg_id:
 *                         type: number
 *                         description: ไอดีของ Outbound Finished Goods
 *                         example: 1
 *                       outbfgitm_id:
 *                         type: integer
 *                         description: ไอดีของ outbound Finished Goods
 *                         example: 1
 *                       inbfg_id:
 *                         type: number
 *                         description: ไอดีของ Inbound Finished Goods
 *                         example: 2
 *                       outbfgitm_shipmt_count:
 *                         type: number
 *                         description: จำนวนการสแกนที่บันทึก
 *                         example: 3
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง
 *       404:
 *         description: ไม่พบข้อมูลสำหรับบาร์โค้ดนี้
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post('/shipment-scan/:outbfg_id', authenticateToken, outbfinishedgoodsController.shipmtScan);


/**
 * @swagger
 * /api/outbound-fg/update/{outbfg_id}:
 *   put:
 *     summary: แก้ไขรายการใบเบิกสินค้าสำเร็จรูป
 *     description: outbfg_is_shipment [ true =  จัดส่งโดยบริษัท, false = มารับเอง ]
 *     tags: [OutboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbfg_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ไอดีใบเบิกสินค้าสำเร็จรูป
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               outbfg_so:
 *                 type: string
 *                 description: รหัสใบเบิก SO
 *                 example: "S124-aa"
 *               outbfg_details:
 *                 type: string
 *                 description: รายละเอียดใบเบิก
 *                 example: "Order FG"
 *               outbfg_is_shipment:
 *                 type: boolean
 *                 description: การจัดส่ง (true = จัดส่งโดยบริษัท, false = มารับเอง)
 *                 example: true
 *               outbfg_driver_name:
 *                 type: string
 *                 description: ชื่อคนขับ (จำเป็นหากเป็น SELF_PICKUP)
 *                 example: "นายพล"
 *               outbfg_vehicle_license:
 *                 type: string
 *                 description: ทะเบียนรถ (จำเป็นหากเป็น SELF_PICKUP)
 *                 example: "กข543"
 *               tspyard_id:
 *                 type: integer
 *                 description: ไอดีท่าเรือหรือท่ารถ (จำเป็นหากเป็น DELIVERY)
 *                 example: 1
 *               outbfg_phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์ (จำเป็นหากเป็น DELIVERY)
 *                 example: "025678945"
 *               outbfg_address:
 *                 type: string
 *                 description: ที่อยู่ (จำเป็นหากเป็น DELIVERY)
 *                 example: "7/12 พญาไท กรุงเทพ 10400"
 *               so_id:
 *                 type: integer
 *                 description: ไอดีของ SO ที่เกี่ยวข้อง
 *                 example: 1
 *               outbfg_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "หมายเหตุ"
 *               items:
 *                 type: array
 *                 description: รายการสินค้าสำเร็จรูปที่ต้องการเบิก
 *                 items:
 *                   type: object
 *                   properties:
 *                     bom_id:
 *                       type: integer
 *                       description: Bom Id ของ BOM
 *                       example: 1
 *                     inbfg_id:
 *                       type: integer
 *                       description: ไอดี Inbound FG
 *                       example: 1
 *                     outbfgitm_quantity:
 *                       type: number
 *                       description: จำนวนที่ต้องการเบิก
 *                       example: 10
 *     responses:
 *       200:
 *         description: อัปเดตข้อมูลสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put(
    '/update/:outbfg_id',
    authenticateToken,
    outbfinishedgoodsController.update
);

/**
 * @swagger
 * /api/outbound-fg/update-no-bom/{outbfg_id}:
 *   put:
 *     summary: แก้ไขรายการใบเบิกสินค้าสำเร็จรูป (ไม่มี BOM)
 *     description: outbfg_is_shipment [ true =  จัดส่งโดยบริษัท, false = มารับเอง ]
 *     tags: [OutboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbfg_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีใบเบิกสินค้าสำเร็จรูป
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               outbfg_so:
 *                 type: string
 *                 description: รหัสใบเบิก SO
 *                 example: "S124-aa"
 *               outbfg_details:
 *                 type: string
 *                 description: รายละเอียดใบเบิก
 *                 example: "Order FG"
 *               outbfg_is_shipment:
 *                 type: boolean
 *                 description: การจัดส่ง (true = จัดส่งโดยบริษัท, false = มารับเอง)
 *                 example: true
 *               outbfg_driver_name:
 *                 type: string
 *                 description: ชื่อคนขับ (จำเป็นหากเป็น SELF_PICKUP)
 *                 example: "นายพล"
 *               outbfg_vehicle_license:
 *                 type: string
 *                 description: ทะเบียนรถ (จำเป็นหากเป็น SELF_PICKUP)
 *                 example: "กข543"
 *               tspyard_id:
 *                 type: integer
 *                 description: ไอดีท่าเรือหรือท่ารถ (จำเป็นหากเป็น DELIVERY)
 *                 example: 1
 *               outbfg_phone:
 *                 type: string
 *                 description: เบอร์โทรศัพท์ (จำเป็นหากเป็น DELIVERY)
 *                 example: "025678945"
 *               outbfg_address:
 *                 type: string
 *                 description: ที่อยู่ (จำเป็นหากเป็น DELIVERY)
 *                 example: "7/12 พญาไท กรุงเทพ 10400"
 *               outbfg_remark:
 *                 type: string
 *                 description: หมายเหตุ
 *                 example: "หมายเหตุ"
 *               items:
 *                 type: array
 *                 description: รายการสินค้า FG ที่ต้องการแก้ไข
 *                 items:
 *                   type: object
 *                   properties:
 *                     inbfg_id:
 *                       type: integer
 *                       description: ไอดี Inbound FG
 *                       example: 1
 *                     outbfgitm_quantity:
 *                       type: integer
 *                       description: จำนวนที่ต้องเบิก
 *                       example: 10
 *     responses:
 *       200:
 *         description: อัปเดตข้อมูลสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put(
    '/update-no-bom/:outbfg_id',
    authenticateToken,
    outbfinishedgoodsController.updateNoBom
);


/**
 * @swagger
 * /api/outbound-fg/update-dates/{outbfg_id}:
 *   put:
 *     summary: อัปเดตวันเวลาใบเบิกและใบส่งสินค้า
 *     tags: [OutboundFG]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: outbfg_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ไอดีใบเบิกสินค้าสำเร็จรูป
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               withdr_date:
 *                 type: string
 *                 format: date-time
 *                 description: วันที่ใบเบิก
 *               shipmt_date:
 *                 type: string
 *                 format: date-time
 *                 description: วันที่ใบส่งสินค้า
 *     responses:
 *       200:
 *         description: อัปเดตวันเวลาสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.put('/update-dates/:outbfg_id', authenticateToken, outbfinishedgoodsController.updateDates);

/**
 * @swagger
 * /api/outbound-fg/delete/{outbfg_id}:
 *   delete:
 *     summary: ลบข้อมูลใบเบิกสินค้าสำเร็จรูปตามไอดี
 *     tags: [OutboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbfg_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีใบเบิกสินค้าสำเร็จรูป
 *     responses:
 *       200:
 *         description: ลบข้อมูลใบเบิกสินค้าสำเร็จรูปสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.delete('/delete/:outbfg_id'
    , authenticateToken
    , outbfinishedgoodsController.del);

/**
 * @swagger
 * /api/outbound-fg/get-all:
 *   get:
 *     summary: ดึงข้อมูลใบเบิกสินค้าสำเร็จรูปทั้งหมด
 *     tags: [OutboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: query
 *         name: approvalStatus
 *         schema:
 *           type: string
 *           enum: [APPROVED, REJECTED, PENDING]
 *         required: false
 *         description: "ระบุสถานะการอนุมัติ (APPROVED, REJECTED, PENDING) เพื่อดึงข้อมูลเฉพาะสถานะนั้น (ไม่ระบุจะดึงข้อมูลทั้งหมด)"
 *       - in: query
 *         name: withdrawStatus
 *         schema:
 *           type: boolean
 *         required: false
 *         description: "true = คืนค่าเฉพาะสถานะ COMPLETED และ PARTIAL, false หรือไม่ระบุ = คืนค่าทุกสถานะ"
 *     responses:
 *       200:
 *         description: พบข้อมูลใบเบิกสินค้าสำเร็จรูป
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-all'
    , authenticateToken
    , outbfinishedgoodsController.getAll);
    
/**
 * @swagger
 * /api/outbound-fg/get-by-id/{outbfg_id}:
 *   get:
 *     summary: ดึงข้อมูลสินค้าสำเร็จที่จะส่งออกรูปตามไอดี
 *     tags: [OutboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbfg_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีใบเบิกสินค้าสำเร็จรูป
 *     responses:
 *       200:
 *         description: พบข้อมูลใบเบิกสินค้าสำเร็จรูป
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-by-id/:outbfg_id'
, authenticateToken
, outbfinishedgoodsController.getById);

/**
 * @swagger
 * /api/outbound-fg/get-requisition-by-id/{outbfg_id}:
 *   get:
 *     summary: ดึงข้อมูลใบเบิกและใบนำส่งตามไอดี
 *     tags: [OutboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lng'
 *       - in: path
 *         name: outbfg_id
 *         schema:
 *           type: number
 *         required: true
 *         description: ไอดีใบเบิกสินค้าสำเร็จรูป
 *     responses:
 *       200:
 *         description: พบข้อมูลใบเบิกสินค้าสำเร็จรูป
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน
 *       404:
 *         description: ไม่พบข้อมูลใบเบิกสินค้าสำเร็จรูปที่ร้องขอ
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.get('/get-requisition-by-id/:outbfg_id'
    , authenticateToken
    , outbfinishedgoodsController.getReqById);

/**
 * @swagger
 * /api/outbound-fg/export-to-excel:
 *   get:
 *     summary: Export Outbound FG Data to Excel
 *     tags: [OutboundFG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: formatted_date
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาวันที่ในรูปแบบ เช่น 02 Feb 25 (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: create_time
 *         schema:
 *           type: string
 *         required: false
 *         description: ค้นหาเวลาในรูปแบบ HH:mm:ss (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: outbfg_code
 *         schema:
 *           type: string
 *         required: false
 *         description: เลขที่ใบเบิก (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: outbfg_details
 *         schema:
 *           type: string
 *         required: false
 *         description: รายละเอียด (ใช้เพื่อค้นหาเฉพาะจำนวนที่กำหนด)
 *       - in: query
 *         name: outbfg_appr_status
 *         schema:
 *           type: string
 *         required: false
 *         description: สถานะอนุมัติในรูปแบบ APPROVED , PENDING , REJECTED (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
  *       - in: query
 *         name: outbfgitm_withdr_status
 *         schema:
 *           type: string
 *         required: false
 *         description: สถานะเบิกในรูปแบบ COMPLETED , PARTIAL , PENDING (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
 *       - in: query
 *         name: outbfgitm_shipmt_status
 *         schema:
 *           type: string
 *         required: false
 *         description: สถานะจัดส่งในรูปแบบ COMPLETED , PARTIAL , PENDING (ถ้าไม่ระบุ จะดึงข้อมูลทั้งหมด)
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
router.get('/export-to-excel', authenticateToken, outbfinishedgoodsController.exportAllToExcel);

export default router;
