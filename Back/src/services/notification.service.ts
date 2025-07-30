import { Repository, EntityManager, SelectQueryBuilder, In } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import cron from 'node-cron';

import { getIO } from '../services/socket.service'; // ✅ เปลี่ยนจาก import io

import { m_outb_raw_material } from '../entities/m_outb_raw_material.entity';
import { m_outb_finished_goods } from '../entities/m_outb_finished_goods.entity';
import { m_inb_raw_material } from '../entities/m_inb_raw_material.entity';
import { m_inb_finished_goods } from '../entities/m_inb_finished_goods.entity';
import { m_outb_semi } from '../entities/m_outb_semi.entity';
import { m_notifications } from '../entities/m_notifications.entity';
import { m_outb_tooling } from '../entities/m_outb_tooling.entity';
import { m_outb_finished_goods_items } from '../entities/m_outb_finished_goods_items.entity';
import { m_outb_semi_items } from '../entities/m_outb_semi_items.entity';
import { m_outb_tooling_items } from '../entities/m_outb_tooling_items.entity';
import { m_outb_raw_material_items } from '../entities/m_outb_raw_material_items.entity';
import { m_inb_semi } from '../entities/m_inb_semi.entity';
import { m_inb_tooling } from '../entities/m_inb_tooling.entity';
import { m_finished_goods_ifm } from '../entities/m_finished_goods_ifm.entity';
import { m_tooling_ifm } from '../entities/m_tooling_ifm.entity';
import { m_semi_ifm } from '../entities/m_semi_ifm.entity';
import { m_raw_material_ifm } from '../entities/m_raw_material_ifm.entity';
import { m_criteria } from '../entities/m_criteria.entity';
import { m_bom_items } from '../entities/m_bom_items.entity';
import { s_user_notification } from '../entities/s_user_notification.entity';
import { s_user } from '../entities/s_user.entity';

import { ApprovalStatus, NotifStatus, NotifType, NotiLevel, RefType, ReturnStatus } from '../common/global.enum';
import { getUsersToNotify } from '../utils/NotificationsUtils';

// ✅ Mapping ตาราง reference ที่สามารถอ้างอิงถึงได้
export const tables: Record<string, { alias: string; entity: any; codeField: string; detailsField: string; approveField: string }> = {
    outbsemi: { alias: "outbsemi", entity: m_outb_semi, codeField: "outbsemi_code", detailsField: "outbsemi_details", approveField: "outbsemi_appr_status" },
    outbfg: { alias: "outbfg", entity: m_outb_finished_goods, codeField: "outbfg_code", detailsField: "outbfg_details", approveField: "outbfg_appr_status" },
    outbrm: { alias: "outbrm", entity: m_outb_raw_material, codeField: "outbrm_code", detailsField: "outbrm_details", approveField: "outbrm_appr_status" },
    outbtl: { alias: "outbtl", entity: m_outb_tooling, codeField: "outbtl_code", detailsField: "outbtl_details", approveField: "outbtl_appr_status" }
};

export class NotifApprovalService {
    private inbrmRepository: Repository<m_inb_raw_material>;
    private inbfgRepository: Repository<m_inb_finished_goods>;
    private outbrmRepository: Repository<m_outb_raw_material>;
    private outbfgRepository: Repository<m_outb_finished_goods>; 
    private outbsemiRepository: Repository<m_outb_semi>
    private outbtlRepository: Repository<m_outb_tooling>;
    private notifRepository: Repository<m_notifications>
    private criteriaRepo: Repository<m_criteria>;
    private userRepository: Repository<s_user>;
    private usernotifRepo: Repository<s_user_notification>;
    private repoMap: Record<string, Repository<any>>;

    constructor(){
        this.inbrmRepository = AppDataSource.getRepository(m_inb_raw_material);
        this.inbfgRepository = AppDataSource.getRepository(m_inb_finished_goods);
        this.outbrmRepository = AppDataSource.getRepository(m_outb_raw_material);
        this.outbfgRepository = AppDataSource.getRepository(m_outb_finished_goods);
        this.outbsemiRepository = AppDataSource.getRepository(m_outb_semi);
        this.outbtlRepository = AppDataSource.getRepository(m_outb_tooling);
        this.notifRepository = AppDataSource.getRepository(m_notifications);
        this.criteriaRepo = AppDataSource.getRepository(m_criteria);
        this.userRepository = AppDataSource.getRepository(s_user);
        this.usernotifRepo = AppDataSource.getRepository(s_user_notification);

        // ✅ ใช้ `repoMap` แทน `this[`${reference_type}Repository`]` เพื่อความปลอดภัย
        this.repoMap = {
            outbsemi: this.outbsemiRepository,
            outbfg: this.outbfgRepository,
            outbrm: this.outbrmRepository,
            outbtl: this.outbtlRepository
        } as const; // ✅ ใช้ `as const` เพื่อให้ TypeScript ตรวจสอบชนิดข้อมูลได้

        const SYSTEM_USER_ID = -1;

         //console.log("✅ node-cron ติดตั้งเรียบร้อย!");

    /*minimum stock*/
        // cron.schedule("*/10 * * * *", async () => {  //ทุก 10 นาที
        cron.schedule("0 */2 * * *", async () => {
            console.log("⏳ Cron Job getNotiMinimumStock ทำงานทุก 2 ชั่วโมง -", new Date().toLocaleString());
            await this.getNotiMinimumStock(SYSTEM_USER_ID, undefined, true); // ✅ ส่ง isFromCron = true
        });

    /*shelflife*/
        // cron.schedule("*/1 * * * *", async () => { 
        cron.schedule("0 10 * * *", async () => { 
            console.log("⏳ Cron Job getNotiShelfLife ทำงานทุกวันเวลา 10:00 น. -", new Date().toLocaleString());
            await this.getNotiShelfLife(SYSTEM_USER_ID, undefined, true); // ✅ ส่ง isFromCron = true
        });

    /*clearOldNotifications*/
        // 🔁 ทำงานทุก 3 เดือน วันที่ 1 เวลา 01:00
        cron.schedule('0 1 1 */3 *', async () => {
            console.log("🧹 Running scheduled clearOldNotifications (every 3 months)", new Date().toLocaleString());
            await this.clearOldNotifications(3);
        });

    
    }

    // ฟังก์ชันนี้จะกำหนดว่า READ ควรถูกนำมาแสดงด้วยหรือไม่
    private shouldIncludeRead(showRead: boolean, notif_status: string): boolean {
        return showRead || notif_status === "UNREAD";
    }
    
    /*
     * service ค้นหาคำร้อง
     */
    async searchRequestApproval(
        user_id: number,
        filters?: { code?: string; details?: string; approvalStatus?: ApprovalStatus }, 
        showRead: boolean = true, // ✅ กำหนดค่าเริ่มต้นว่าให้แสดง `READ` หรือไม่ (true = แสดง READ, false = ไม่แสดง)
        // maxDays: number = 30, // ✅ ค่าเริ่มต้นให้ดึงข้อมูลย้อนหลัง 30 วัน
        manager?: EntityManager
    ): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'NotifApprovalService.searchRequestApproval';

        try {
            // ✅ ใช้ `manager` ถ้ามี ไม่งั้นใช้ `this.notifRepository`
            const notifRepo = manager ? manager.getRepository(m_notifications) : this.notifRepository;

            // ✅ ดึงข้อมูล `m_notifications` ที่มี `notif_type = REQUEST_APPROVAL`
            const notifications = await notifRepo.createQueryBuilder('notif')
                .innerJoin('s_user_notification', 'userNotif', 'userNotif.notif_id = notif.notif_id AND userNotif.user_id = :user_id', { user_id })
                .select([
                    'notif.notif_id AS notif_id',
                    'userNotif.notif_status AS notif_status',
                    'notif.reference_id AS reference_id',
                    'notif.reference_type AS reference_type',
                    "DATE_FORMAT(notif.create_date, '%d %b %y') AS formatted_date", // ✅ แปลงเป็นวันที่
                    "DATE_FORMAT(notif.create_date, '%H:%i:%s') AS formatted_time"    // ✅ แปลงเป็นเวลา
                ])
                .where('notif.notif_type = :notifType', { notifType: NotifType.REQUEST_APPROVAL })
                .getRawMany();

            // ✅ ถ้าไม่มีข้อมูลให้ return ทันที
            if (notifications.length === 0) {
                return response.setIncomplete(lang.msgNotFound('notif.request_approval'));
            }

            let combinedData: any[] = [];

            // ✅ วนลูปเพื่อตรวจสอบแต่ละ `reference_type`
            for (const notif of notifications) {
                if (!this.shouldIncludeRead(showRead, notif.notif_status)) continue; // ✅ ตรวจสอบว่าควรแสดง READ หรือไม่

                const reference_type = notif.reference_type?.toLowerCase() as keyof typeof tables; // ✅ แปลงเป็นตัวพิมพ์เล็ก
                const tableInfo = tables[reference_type];

                if (!tableInfo) continue; // ✅ ถ้า `reference_type` ไม่ตรงกับ `tables` ให้ข้ามไป

                const { alias, codeField, detailsField, approveField } = tableInfo;

                // ✅ ใช้ `manager` ถ้ามี, ถ้าไม่มีให้ใช้ `repoMap`
                const repository = manager 
                    ? manager.getRepository(tableInfo.entity) 
                    : this.repoMap[reference_type] ?? null; // ✅ ป้องกัน error ถ้า `reference_type` ไม่มีอยู่จริงใน `repoMap`

                if (!repository) {
                    console.warn(`⚠️ Warning: Repository for reference_type '${reference_type}' not found.`);
                    continue;
                }

                // ✅ ดึงข้อมูลจากตารางที่อ้างอิง
                const query = repository.createQueryBuilder(alias)
                    .select([
                        `${alias}.${codeField} AS code`,
                        `${alias}.${detailsField} AS details`,
                        `${alias}.${approveField} AS is_approved`,
                        `'${reference_type}' AS type`
                    ])
                    .where(`${alias}_id = :referenceId`, { referenceId: notif.reference_id });

                // ✅ ใช้ฟิลเตอร์ถ้ามี
                if (filters) {
                    this.applyFilters(query, alias, codeField, detailsField, approveField, filters);
                }

                // ✅ ดึงข้อมูลจาก reference table
                const record = await query.getRawOne();

                // ✅ ถ้ามีข้อมูลให้เพิ่มเข้า array
                if (record) {
                    //console.log(`🔎 Found Record for notif_id=${notif.notif_id} - Alert Level: ${notif.alert_level}`);
                
                    combinedData.push({
                        notif_id: notif.notif_id,
                        notif_status: notif.notif_status,
                        id: notif.reference_id,
                        ...record,
                        date: notif.formatted_date,  
                        time: notif.formatted_time
                    });
                }
                
            }

            // ✅ กรองค่าที่ซ้ำกันโดยใช้ `code`
            const filteredData: any[] = Array.from(
                combinedData.reduce((map, record) => {
                    if (!map.has(record.code)) {
                        map.set(record.code, record);
                    }
                    return map;
                }, new Map<string, any>()).values()
            );

             // เรียงลำดับให้ UNREAD อยู่ก่อน READ >>
            // เรียงลำดับตามสถานะ approvalStatus (โดยที่ค่าที่น้อยกว่าใน statusOrder จะอยู่ก่อน)
            // และเรียงตามวันที่ (เก่าสุดก่อน)
            const statusOrder: { [key in ApprovalStatus]: number } = {
                [ApprovalStatus.PENDING]: 1,
                [ApprovalStatus.APPROVED]: 2,
                [ApprovalStatus.REJECTED]: 3
            };
            
            filteredData.sort((a, b) => {
                // เรียงลำดับให้ UNREAD อยู่ก่อน READ
                if (a.notif_status !== b.notif_status) return a.notif_status === "UNREAD" ? -1 : 1;
                
                // แปลงค่า a.is_approved และ b.is_approved ให้เป็น ApprovalStatus key
                const approvalA = statusOrder[a.is_approved as keyof typeof statusOrder] || 0;
                const approvalB = statusOrder[b.is_approved as keyof typeof statusOrder] || 0;
                
                if (approvalA !== approvalB) return approvalA - approvalB;
                
                // เรียงตามวันที่ (จากเก่าไปใหม่)
                const dateA = new Date(a.date + " " + a.time).getTime();
                const dateB = new Date(b.date + " " + b.time).getTime();
                return dateA - dateB;
            });

            // ✅ ถ้าไม่มีข้อมูลหลังจากกรอง ให้ return ว่าไม่พบข้อมูล
            if (filteredData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('notif.request_approval'));
            }

            // ✅ ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('notif.request_approval'), filteredData);
        } catch (error: any) {
            console.error(`❌ Error in ${operation}:`, error);
            return response.setIncomplete(`Error: ${error.message}`);
        }
    }

        // ✅ ฟังก์ชันใช้สำหรับ apply filters ใน query
        private applyFilters(
            query: SelectQueryBuilder<any>,  // กำหนดประเภท query
            alias: string,
            codeField: string,
            detailsField: string,
            approveField: string,
            filters?: { code?: string; details?: string; approvalStatus?: ApprovalStatus }
        ) {
            if (filters?.code) {
                query.andWhere(`${alias}.${codeField} LIKE :code`, { code: `%${filters.code}%` });
            }
            if (filters?.details) {
                query.andWhere(`${alias}.${detailsField} LIKE :details`, { details: `%${filters.details}%` });
            }
            // ตรวจสอบเฉพาะกรณีที่มีการส่ง approvalStatus มาอย่างชัดเจน
            if (filters?.approvalStatus !== undefined && filters?.approvalStatus !== null) {
                query.andWhere(`${alias}.${approveField} = :approvalStatus`, { approvalStatus: filters.approvalStatus });
            }           
        }
    
    /*
     *  ดึงข้อมูลรายละเอียด
     */
    async getApprovalDetails( 
        user_id: number,
        notif_id: number,                    // รหัสของการแจ้งเตือน (notification id)
        manager?: EntityManager              // EntityManager แบบกำหนดเอง (ถ้ามี) สำหรับการทำงานกับฐานข้อมูล
    ): Promise<ApiResponse<any | null>> {
        // สร้าง instance ของ ApiResponse เพื่อเก็บผลลัพธ์
        const response = new ApiResponse<any | null>();
        // ระบุชื่อฟังก์ชันสำหรับใช้ในการ log ข้อผิดพลาด (debugging)
        const operation = "NotifApprovalService.getApprovalDetails";

        try {
            // Log สำหรับตรวจสอบขั้นตอนการทำงาน
            //console.log(`🔍 Fetching details for notif_id=${notif_id}`);

            // ใช้ manager ที่ส่งเข้ามา ถ้าไม่มีจะใช้ default manager จาก AppDataSource
            const useManager = manager ?? AppDataSource.manager;
            // ดึง Repository สำหรับตาราง m_notifications
            const notifRepo = useManager.getRepository(m_notifications);

            // ดึงข้อมูล notification: reference_type, reference_id, notif_status
            const notification = await notifRepo.createQueryBuilder("notif")
                .select([
                    "notif.reference_type AS notif_reference_type",
                    "notif.reference_id AS notif_reference_id",
                ])
                .where("notif.notif_id = :notif_id", { notif_id })
                .getRawOne();

            // Log ข้อมูล notification ที่ดึงมาได้
            //console.log("🔎 Retrieved notification data:", notification);

            // ถ้าไม่พบข้อมูล notification ให้ส่ง response ว่าไม่พบข้อมูล
            if (!notification) {
                console.warn(`⚠️ ไม่พบข้อมูล notification สำหรับ notif_id=${notif_id}`);
                return response.setIncomplete(lang.msgNotFound(`notif.${notif_id}`));
            }

            // แปลงค่า reference_type ให้เป็นตัวพิมพ์เล็กเพื่อความสอดคล้องกับ key ของ tables
            let reference_type = notification["notif_reference_type"]?.toLowerCase() as keyof typeof tables;
            let reference_id = notification["notif_reference_id"];
            // let notif_status = notification["notif_status"];

            // Log ค่าที่ได้จากการแมทช์ reference_id และ reference_type
            //console.log(`🔍 Matched reference_id=${reference_id}, reference_type=${reference_type}`);

            // ตรวจสอบว่ามีค่า reference_id และ reference_type หรือไม่
            if (!reference_id || !reference_type) {
                console.warn(`⚠️ notif_id=${notif_id} มีค่า reference_id=${reference_id}, reference_type=${reference_type}`);
                return response.setIncomplete(lang.msgNotFound(`notif.reference.${notif_id}`));
            }

            // ดึง status จาก s_user_notification แทน
            const userNotifRepo = useManager.getRepository(s_user_notification);
            const userNotif = await userNotifRepo.findOne({
                where: {
                    notif_id,
                    user_id,
                },
            });

            if (!userNotif) {
            return response.setIncomplete(lang.msgNotFound(`notif_user.${notif_id}`));
            }

            const notif_status = userNotif.notif_status;

            // ✅ ถ้ายังไม่ได้อ่าน → อัปเดตเป็น READ
            if (notif_status === NotifStatus.UNREAD) {
            await userNotifRepo.update(
                { notif_id, user_id },
                { notif_status: NotifStatus.READ }
            );
            //console.log(`✅ Updated notif_status to READ for notif_id=${notif_id} and user_id=${user_id}`);
            }

            // กำหนด object สำหรับตารางอ้างอิงหลัก (reference tables)
            const tables = {
                outbfg: { 
                    entity: m_outb_finished_goods,    // entity สำหรับ finished goods
                    alias: "outbfg",                  // alias ที่ใช้ใน query
                    idField: "outbfg_id",             // field รหัสของตาราง
                    codeField: "outbfg_code",         // field รหัสสินค้า
                    detailsField: "outbfg_details",   // field รายละเอียดสินค้า
                    ifmIdField: "fgifm_id",           // field รหัส ifm ใน finished goods
                    ifmTable: m_finished_goods_ifm,   // ตาราง ifm สำหรับ finished goods
                    ifmAlias: "fgifm",                // alias ของ ifm
                    ifmNameField: "fgifm_name"         // field ชื่อใน ifm
                },
                outbsemi: { 
                    entity: m_outb_semi,
                    alias: "outbsemi",
                    idField: "outbsemi_id",
                    codeField: "outbsemi_code",
                    detailsField: "outbsemi_details",
                    ifmIdField: "semiifm_id",
                    ifmTable: m_semi_ifm,
                    ifmAlias: "semiifm",
                    ifmNameField: "semiifm_name"
                },
                outbtl: { 
                    entity: m_outb_tooling,
                    alias: "outbtl",
                    idField: "outbtl_id",
                    codeField: "outbtl_code",
                    detailsField: "outbtl_details",
                    ifmIdField: "tlifm_id",
                    ifmTable: m_tooling_ifm,
                    ifmAlias: "tlifm",
                    ifmNameField: "tlifm_name"
                },
                outbrm: { 
                    entity: m_outb_raw_material,
                    alias: "outbrm",
                    idField: "outbrm_id",
                    codeField: "outbrm_code",
                    detailsField: "outbrm_details",
                    ifmIdField: "rmifm_id",
                    ifmTable: m_raw_material_ifm,
                    ifmAlias: "rmifm",
                    ifmNameField: "rmifm_name"
                }
            };

            // กำหนด object สำหรับตารางที่เกี่ยวข้องกับสต็อก (stock tables)
            const stockTables = {
                outbfg: { 
                    outbItemTable: m_outb_finished_goods_items,
                    inbTable: m_inb_finished_goods,
                    outbIdField: "outbfg_id",
                    inbIdField: "inbfg_id",
                    quantityFields: ["outbfgitm_quantity", "inbfg_quantity"],
                    inbCodeField: "inbfg_code"  // เพิ่ม field สำหรับ inbfg_code
                },
                outbsemi: { 
                    outbItemTable: m_outb_semi_items,
                    inbTable: m_inb_semi,
                    outbIdField: "outbsemi_id",
                    inbIdField: "inbsemi_id",
                    quantityFields: ["outbsemiitm_quantity", "inbsemi_quantity"],
                    inbCodeField: "inbsemi_code" // เพิ่ม field สำหรับ inbsemi_code
                },
                outbtl: { 
                    outbItemTable: m_outb_tooling_items,
                    inbTable: m_inb_tooling,
                    outbIdField: "outbtl_id",
                    inbIdField: "inbtl_id",
                    quantityFields: ["outbtlitm_quantity", "inbtl_quantity"],
                    inbCodeField: "inbtl_code"  // เพิ่ม field สำหรับ inbtl_code
                },
                outbrm: { 
                    outbItemTable: m_outb_raw_material_items,
                    inbTable: m_inb_raw_material,
                    outbIdField: "outbrm_id",
                    inbIdField: "inbrm_id",
                    quantityFields: ["outbrmitm_quantity", "inbrm_quantity"],
                    inbCodeField: "inbrm_code"  // เพิ่ม field สำหรับ inbrm_code
                }
            };
            
            // ดึงข้อมูลการอ้างอิงหลัก (reference) จากตารางที่เกี่ยวข้องตาม reference_type
            const refInfo = tables[reference_type];
            // ดึงข้อมูลสำหรับสต็อกจากตารางที่เกี่ยวข้องตาม reference_type
            const stockInfo = stockTables[reference_type];

            // ถ้าไม่พบข้อมูลในตารางอ้างอิงหรือสต็อก ให้ส่ง response ว่าไม่พบข้อมูล
            if (!refInfo || !stockInfo) {
                return response.setIncomplete(lang.msgNotFound(`reference_type.${reference_type}`));
            }

            // ดึงข้อมูลจากตารางหลักตาม entity ที่เกี่ยวข้อง (เช่น outb_finished_goods, outb_semi, ...)
            const referenceData = await useManager.getRepository(refInfo.entity)
                .createQueryBuilder(refInfo.alias)
                .select([
                    `${refInfo.alias}.${refInfo.idField} AS id`,
                    `${refInfo.alias}.${refInfo.codeField} AS code`,
                    `${refInfo.alias}.${refInfo.detailsField} AS details`
                ])
                .where(`${refInfo.alias}.${refInfo.idField} = :reference_id`, { reference_id })
                .getRawOne();

            // ถ้าไม่พบข้อมูลในตารางหลัก ให้ส่ง response ว่าไม่พบข้อมูล
            if (!referenceData) {
                return response.setIncomplete(lang.msgNotFound(`item.${reference_type}`));
            }

            // สร้าง array สำหรับ select fields
            let selectFields = [
                // ดึงข้อมูลพื้นฐานของแต่ละรายการ
                `outbItem.${stockInfo.inbIdField} AS inb_id`,
                `${refInfo.ifmAlias}.${refInfo.ifmNameField} AS ifm_name`,
                `inb.${stockInfo.quantityFields[1]} AS inb_quantity`,
                `outbItem.${stockInfo.quantityFields[0]} AS out_quantity`,
                // ดึง inb code แล้วต่อกับ ifm name
                `CONCAT(inb.${stockInfo.inbCodeField}, ' ', ${refInfo.ifmAlias}.${refInfo.ifmNameField}) AS code_name`
            ];

            // สร้าง query builder จาก repository ของ outbItemTable
            let query = useManager.getRepository(stockInfo.outbItemTable)
                .createQueryBuilder("outbItem")
                // join ตาราง inb
                .leftJoin(stockInfo.inbTable, "inb", `inb.${stockInfo.inbIdField} = outbItem.${stockInfo.inbIdField}`)
                // join ตาราง ifm (เพื่อดึง ifm_name)
                .leftJoin(refInfo.ifmTable, refInfo.ifmAlias, `${refInfo.ifmAlias}.${refInfo.ifmIdField} = inb.${refInfo.ifmIdField}`);

            // เฉพาะ FG (outbfg) และ RM (outbrm) เท่านั้นที่จะดึงข้อมูล BOM
            if (reference_type === 'outbfg') {
                selectFields.push(`outbItem.bom_id AS bom_id`);
                selectFields.push(`bomItem.bom_number AS bom_number`);
                query.leftJoin(m_bom_items, "bomItem", "bomItem.bom_id = outbItem.bom_id");
            } else if (reference_type === 'outbrm') {
                // สำหรับ RM ดึงเฉพาะ bom_number จาก inb (inbrm_bom) โดยไม่ต้องมี bom_id
                selectFields.push(`inb.inbrm_bom AS bom_number`);
            }

            // กำหนด select fields และเงื่อนไข where
            query.select(selectFields)
                .where(`outbItem.${stockInfo.outbIdField} = :reference_id`, { reference_id });

            // ดึงข้อมูล raw ของ stock details
            const stockDetails = await query.getRawMany();

             // Map แต่ละรายการเพื่อคำนวณ remaining และแนบข้อมูล BOM เฉพาะกรณีที่มี
            const processedStockDetails = stockDetails.map(item => {
                let bom = null;
                if (reference_type === 'outbfg' && item.bom_number) {
                    bom = { bom_id: item.bom_id, bom_number: item.bom_number };
                } else if (reference_type === 'outbrm' && item.bom_number) {
                    bom = { bom_number: item.bom_number };
                }
                return {
                    ...item,
                    remaining: (item.inb_quantity !== null && item.out_quantity !== null)
                        ? item.inb_quantity - item.out_quantity
                        : null,
                    bom: bom
                };
            });

            // ไม่ต้องดึง bomData เพิ่มเติมจาก fetchBomData อีก เพราะแต่ละรายการมีข้อมูลของตัวเองแล้ว
            // const bomData = await this.fetchBomData(reference_type, reference_id, useManager);
            // const itemsWithBom = processedStockDetails.map(item => ({
            //     ...item,
            //     bom: bomData // <-- นี่คือสาเหตุที่ทำให้ BOM เหมือนกันทุก item
            // }));

            // ไม่เรียก fetchBomData เพราะแต่ละรายการมีข้อมูล BOM ของตัวเองแล้ว
            const itemsWithBom = processedStockDetails;

            return response.setComplete(lang.msgFound(`details ${reference_type}`), { 
                ...referenceData, 
                items: itemsWithBom 
            });
        } catch (error: any) {
            console.error(`❌ Error in ${operation}:`, error);
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        }
    }

    /*
    * service อนุมัติคำร้อง
    */
    async approveRequest(
        notif_id: number,
        approvalStatus: ApprovalStatus,
        username: string,
        userId: number, // ✅ เพิ่ม userId เข้ามา
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'NotifApprovalService.approveRequest';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            //console.log(`🔍 Fetching details for notif_id=${notif_id}`);
    
            // ✅ ค้นหา `reference_id` และ `reference_type` จาก `m_notifications`
            const notifRepo = useManager.getRepository(m_notifications);
            const notification = await notifRepo.createQueryBuilder("notif")
                .select([ 
                    "notif.reference_type AS reference_type",
                    "notif.reference_id AS reference_id",
                ])
                .where("notif.notif_id = :notif_id", { notif_id })
                .andWhere("notif.notif_type = :notif_type", { notif_type: NotifType.REQUEST_APPROVAL })
                .getRawOne();
    
            //console.log("🔎 Retrieved notification data:", notification);
    
            // ✅ ตรวจสอบว่าพบข้อมูล `notification` หรือไม่
            if (!notification) {
                console.warn(`⚠️ ไม่พบข้อมูล notification สำหรับ notif_id=${notif_id}`);
                return response.setIncomplete(lang.msgNotFound(`notif.${notif_id}`));
            }
            //เพิ่มว่าให้ qeury เฉพาะ type
    
            // ✅ กำหนดค่า `reference_id` และ `reference_type`
            let reference_type = notification["reference_type"]?.toLowerCase() as keyof typeof tables;
            let reference_id = notification["reference_id"];
    
            //console.log(`🔍 Matched reference_id=${reference_id}, reference_type=${reference_type}`);
    
            // ✅ ตรวจสอบค่าที่ดึงมา ถ้าไม่มีให้แจ้งเตือน
            if (!reference_id || !reference_type) {
                console.warn(`⚠️ notif_id=${notif_id} มีค่า reference_id=${reference_id}, reference_type=${reference_type}`);
                return response.setIncomplete(lang.msgNotFound(`notif.reference.${notif_id}`));
            }
    
            // ✅ ตรวจสอบว่ามี tableInfo และ repository
            const tableInfo = tables[reference_type];
            if (!tableInfo) {
                return response.setIncomplete(lang.msgNotFound(`table.${reference_type}`));
            }
    
             // ✅ ดึง Repository ของ table ที่ต้องการอัปเดต
            const repository = useManager.getRepository(tableInfo.entity);
            if (!repository) {
                return response.setIncomplete(lang.msgNotFound(`repository.${reference_type}`));
            }
    
            // ตรวจสอบว่าข้อมูลที่ต้องการอัปเดตมีอยู่จริง
            // เลือก field ที่เก็บสถานะการอนุมัติ ซึ่งตอนนี้คือ approvalStatus (แต่ใน query เราใช้ alias is_approved เพื่อความเข้ากัน)
            const record = await repository.createQueryBuilder(tableInfo.alias)
            .select([`${tableInfo.alias}.${tableInfo.approveField} AS is_approved`])
            .where(`${tableInfo.alias}_id = :id`, { id: reference_id })
            .getRawOne();
    
            if (!record) {
                return response.setIncomplete(lang.msgNotFound(`item.${reference_type}`));
            }
    
            const previousApprovalStatus: ApprovalStatus = record.is_approved;
            //console.log('previousApprovalStatus:', previousApprovalStatus);
            //console.log('new approvalStatus:', approvalStatus);
    
            // ตรวจสอบว่ารายการนี้ถูก approve ไปแล้วหรือยัง
            if (previousApprovalStatus === ApprovalStatus.APPROVED && approvalStatus === ApprovalStatus.APPROVED) {
                return response.setIncomplete(lang.msg("รายการนี้ได้รับการอนุมัติแล้ว"));
            }

            // ✅ **ป้องกันการเปลี่ยนจาก `REJECTED` เป็นสถานะอื่น**
            if (previousApprovalStatus === ApprovalStatus.REJECTED) {
                return response.setIncomplete(lang.msg(`item:${reference_type} ไม่สามารถเปลี่ยนสถานะจาก REJECTED ได้`));
            }

            // ✅ ตรวจสอบ `withdr_count` ก่อนเปลี่ยนเป็น `PENDING`
            if (approvalStatus === ApprovalStatus.PENDING) {
                const withdrawFieldMap: Record<string, { table: any; alias: string; field: string; foreignKey: string }> = {
                    outbfg: { table: m_outb_finished_goods_items, alias: "outbfgitm", field: "outbfgitm_withdr_count", foreignKey: "outbfg_id" },
                    outbsemi: { table: m_outb_semi_items, alias: "outbsemiitm", field: "outbsemiitm_withdr_count", foreignKey: "outbsemi_id" },
                    outbrm: { table: m_outb_raw_material_items, alias: "outbrmitm", field: "outbrmitm_issued_count", foreignKey: "outbrm_id" }
                };

                 // ✅ กรณีพิเศษ: outbtl → ต้องตรวจสอบว่า return_status เป็น NOT_RETURNED เท่านั้น
                if (reference_type === "outbtl") {
                    const toolingRecord = await useManager.getRepository(m_outb_tooling)
                        .createQueryBuilder("tool")
                        .select("tool.outbtl_return_status", "return_status")
                        .where("tool.outbtl_id = :id", { id: reference_id })
                        .getRawOne();

                    const returnStatus = toolingRecord?.return_status;

                    if (!returnStatus || returnStatus !== ReturnStatus.NOT_RETURNED) {
                        return response.setIncomplete(lang.msg("ไม่สามารถยกเลิกอนุมัติได้ เนื่องจากมีการคืนอุปกรณ์แล้ว"));
                    }
                }

                 // ✅ ตรวจสอบกับ withdrawFieldMap กรณีทั่วไป
                if (withdrawFieldMap[reference_type]) {
                    const { table, alias, field, foreignKey } = withdrawFieldMap[reference_type];

                    // ✅ SUM ค่า withdr_count ของ outbfgitm / outbsemiitm / outbrmitm
                    const withdrCountResult = await useManager.getRepository(table)
                        .createQueryBuilder(alias)
                        .select(`SUM(${alias}.${field}) AS withdr_count`)
                        .where(`${alias}.${foreignKey} = :id`, { id: reference_id })
                        .getRawOne();

                    const withdrCount = withdrCountResult?.withdr_count ?? 0;

                    if (withdrCount > 0) {
                        return response.setIncomplete(lang.msg(`ไม่สามารถยกเลิกอนุมัติได้ เนื่องจากมีการเบิกสินค้าแล้ว`));
                    }
                }
            }

            //console.log('record.approval_status === approvalStatus', record.approval_status === approvalStatus); 

            // ตรวจสอบว่า table นั้นมีฟิลด์ update_date และ update_by หรือไม่
            const columns = repository.metadata.columns.map(c => c.propertyName);
            const updateFields: any = { [tableInfo.approveField]: approvalStatus };
    
            if (columns.includes('update_date')) {
                updateFields.update_date = new Date();
            }
            if (columns.includes('update_by')) {
                updateFields.update_by = username;
            }
    
            //console.log('Fields to update:', updateFields); // ✅ Debug ดูว่าอัปเดตฟิลด์อะไรบ้าง
    
    
            // ตัดยอดสต็อก หรือคืนสต็อก
            // ปรับยอดสต็อกตามเงื่อนไข:
            // - ถ้าสถานะใหม่เป็น APPROVED และสถานะเดิมไม่ใช่ APPROVED => หักสต็อก
            // - ถ้าสถานะเดิมเป็น APPROVED และสถานะใหม่ไม่ใช่ APPROVED => คืนสต็อก
            // - หากเปลี่ยนระหว่าง PENDING กับ REJECTED => ไม่ปรับยอดสต็อก
            const stockResponse = await this.adjustStock(
                reference_type,
                reference_id,
                previousApprovalStatus,
                approvalStatus,
                useManager
            );
    
            // ❌ หยุดทำงานทันที ถ้าสต็อกไม่พอ
            if (!stockResponse.isCompleted) {
                console.warn("⚠️ Stopping approval process due to insufficient stock!");
                return stockResponse;
            }

            // ✅ อัปเดตข้อมูล
            await repository.createQueryBuilder(tableInfo.alias)
                .update()
                .set(updateFields)
                .where(`${tableInfo.alias}_id = :id`, { id: reference_id })
                .execute();
            // ✅ Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            // ✅ ตรวจสอบเฉพาะกรณีที่ notif_type เป็น REQUEST_APPROVAL และ reference_type เป็น OUTBTL
            if (
                approvalStatus === ApprovalStatus.APPROVED &&
                reference_type === "outbtl" // หรือใช้ RefType.OUTBTL
            ) {
                try {
                await this.processToolingNotificationAfterApproval(reference_id, username, useManager);
                } catch (error) {
                console.error("❌ Error processing tooling approval notification:", error);
                }
            }
            
            return response.setComplete(
                lang.msg(
                    approvalStatus === ApprovalStatus.APPROVED
                    ? "คำร้องได้รับการอนุมัติแล้ว"
                    : approvalStatus === ApprovalStatus.REJECTED
                    ? "คำร้องได้ถูกปฏิเสธแล้ว"
                    : approvalStatus === ApprovalStatus.PENDING
                    ? "สถานะอนุมัติถูกยกเลิกแล้ว"
                    : "ดำเนินการสำเร็จ"
                ),
                { id: reference_id, type: reference_type, approvalStatus }
            );
    
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during update operation:', error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
        // ฟังก์ชันตัดยอดสต็อก (รองรับ Transaction)
        private async adjustStock(
            reference_type: string,
            outbId: number,
            previousApprovalStatus: ApprovalStatus,
            newApprovalStatus: ApprovalStatus,
            manager: EntityManager
        ): Promise<ApiResponse<any>> {  // ✅ แก้ให้ return `null` ถ้าสต็อกไม่พอ
            //console.log(`🔄 ปรับยอดสต็อกสำหรับ Type: ${reference_type}, ID: ${outbId}, previousApprovalStatus: ${previousApprovalStatus}, newApprovalStatus: ${newApprovalStatus}`);
            const response = new ApiResponse<any>();
        
            // ถ้าไม่มีการเปลี่ยนจาก APPROVED ไปเป็นสถานะอื่น หรือจากสถานะอื่นไปเป็น APPROVED ให้ข้ามการปรับสต็อก
            if (
                (previousApprovalStatus !== ApprovalStatus.APPROVED && newApprovalStatus !== ApprovalStatus.APPROVED) ||
                ( (previousApprovalStatus === ApprovalStatus.PENDING || previousApprovalStatus === ApprovalStatus.REJECTED) &&
                (newApprovalStatus === ApprovalStatus.PENDING || newApprovalStatus === ApprovalStatus.REJECTED) )
            ) {
                //console.log("🔹 ไม่มีการปรับยอดสต็อก เนื่องจากสถานะไม่เกี่ยวข้องกับ APPROVED");
                return response.setComplete(lang.msg("stock.no_change"), { reference_type, outbId, approvalStatus: newApprovalStatus });
            }
        
            // Mapping ตารางให้เป็น Dynamic
            const stockTables: Record<string, { outbItemTable: any, inbTable: any, inbField: string, outbField: string, inbIdField: string, outbIdField: string }> = {
                outbfg: { outbItemTable: m_outb_finished_goods_items, inbTable: m_inb_finished_goods, inbField: "inbfg_quantity", outbField: "outbfgitm_quantity", inbIdField: "inbfg_id", outbIdField: "outbfg_id" },
                outbsemi: { outbItemTable: m_outb_semi_items, inbTable: m_inb_semi, inbField: "inbsemi_quantity", outbField: "outbsemiitm_quantity", inbIdField: "inbsemi_id", outbIdField: "outbsemi_id" },
                outbtl: { outbItemTable: m_outb_tooling_items, inbTable: m_inb_tooling, inbField: "inbtl_quantity", outbField: "outbtlitm_quantity", inbIdField: "inbtl_id", outbIdField: "outbtl_id" },
                outbrm: { outbItemTable: m_outb_raw_material_items, inbTable: m_inb_raw_material, inbField: "inbrm_quantity", outbField: "outbrmitm_quantity", inbIdField: "inbrm_id", outbIdField: "outbrm_id" }
            };
        
            const stockInfo = stockTables[reference_type];
            if (!stockInfo) {
                console.warn(`⚠️ ไม่มีการตั้งค่าการตัดสต็อกสำหรับ reference_type: ${reference_type}`);
                return response.setIncomplete(lang.msgNotFound(`stock.${reference_type}`));
            }
        
            const { outbItemTable, inbTable, inbField, outbField, inbIdField, outbIdField } = stockInfo;
        
            const outbItemRepo = manager.getRepository(outbItemTable);
            const inbRepo = manager.getRepository(inbTable);
        
            try {
                // ดึงข้อมูล outb_items
                const outbItems = await outbItemRepo.createQueryBuilder("outbItem")
                    .select([`outbItem.${inbIdField} AS inb_id`, `outbItem.${outbField} AS quantity`])
                    .where(`outbItem.${outbIdField} = :outbId`, { outbId })
                    .getRawMany();
        
                if (!outbItems || outbItems.length === 0) {
                    console.warn(`⚠️ ไม่พบสินค้าที่ต้องตัดยอดสำหรับ Outb ID: ${outbId}`);
                    return response.setIncomplete(lang.msgNotFound(`stock_items: ${reference_type}`));
                }
                
                // เช็คที่ละรายการ
                // for (const item of outbItems) {
                //     const inb_id = Number(item["inb_id"]);
                //     const quantity = Number(item["quantity"]);
        
                //     if (!inb_id || quantity <= 0) {
                //         console.error(`⚠️ ค่าที่ดึงมาไม่ถูกต้อง inb_id=${inb_id}, quantity=${quantity}`);
                //         return response.setIncomplete(`Data error: inb_id=${inb_id}, quantity=${quantity}`);
                //     }
        
                //     console.log(`🔹 ปรับสต็อก: inb_id=${inb_id}, quantity=${quantity}, newApprovalStatus=${newApprovalStatus}`);
        
                //     // ถ้าสถานะใหม่เป็น APPROVED (และสถานะเดิมไม่ใช่ APPROVED) ให้หักสต็อก
                //     // ✅ ตรวจสอบว่าสต็อกมีพอสำหรับทุก item ก่อนทำการหักยอด
                //     if (newApprovalStatus === ApprovalStatus.APPROVED && previousApprovalStatus !== ApprovalStatus.APPROVED) {
                //         const inbStockCheck = await inbRepo.createQueryBuilder("inb")
                //             .select([`inb.${inbIdField} AS inb_id`, `inb.${inbField} AS stock_quantity`])
                //             .where(`inb.${inbIdField} IN (:...inbIds)`, { inbIds: outbItems.map(item => item.inb_id) })
                //             .getRawMany();

                //         // แปลงเป็น Map เพื่อให้เข้าถึงง่ายขึ้น
                //         const stockMap = new Map(inbStockCheck.map(stock => [stock.inb_id, stock.stock_quantity]));

                        
                //         // ตรวจสอบทุกรายการว่าสต็อกเพียงพอหรือไม่
                //         for (const item of outbItems) {
                //             const inb_id = Number(item["inb_id"]);
                //             const quantity = Number(item["quantity"]);
                //             const stockAvailable = stockMap.get(inb_id) ?? 0;

                //             if (stockAvailable < quantity) {
                //                 console.warn(`⚠️ สต็อกไม่พอ! inb_id=${inb_id}, มีอยู่ ${stockAvailable}, ต้องการ ${quantity}`);
                //                 return response.setIncomplete(lang.msg(`field.quantity_not_enough`));
                //             }
                //         }

                //         // ✅ หากสต็อกมีพอสำหรับทุกรายการแล้ว ค่อยทำการหักสต็อกจริง
                //         for (const item of outbItems) {
                //             const inb_id = Number(item["inb_id"]);
                //             const quantity = Number(item["quantity"]);

                //             await inbRepo.createQueryBuilder()
                //                 .update()
                //                 .set({ [inbField]: () => `${inbField} - ${quantity}` })
                //                 .where(`${inbIdField} = :inbId`, { inbId: inb_id })
                //                 .execute();
                //         }
                //     }

                //     // ถ้าสถานะเดิมเป็น APPROVED และสถานะใหม่ไม่ใช่ APPROVED ให้คืนสต็อก
                //     else if (previousApprovalStatus === ApprovalStatus.APPROVED && newApprovalStatus !== ApprovalStatus.APPROVED) {
                //         await inbRepo.createQueryBuilder()
                //             .update()
                //             .set({ [inbField]: () => `${inbField} + ${quantity}` })
                //             .where(`${inbIdField} = :inbId`, { inbId: inb_id })
                //             .execute();
                //     }
                //     // สำหรับการเปลี่ยนแปลงระหว่าง PENDING กับ REJECTED ไม่มีการปรับยอดสต็อก
                //     else {
                //         console.log(`🔹 ไม่ต้องปรับยอดสต็อกสำหรับ inb_id=${inb_id} เมื่อเปลี่ยนจาก ${previousApprovalStatus} เป็น ${newApprovalStatus}`);
                //     }
                // }

                // ✅ รวมยอด quantity ที่ต้องใช้ของ inb_id เดียวกัน
                const requiredStockMap = new Map<number, number>();

                for (const item of outbItems) {
                    const inb_id = Number(item["inb_id"]);
                    const quantity = Number(item["quantity"]);

                    if (!requiredStockMap.has(inb_id)) {
                        requiredStockMap.set(inb_id, 0);
                    }
                    requiredStockMap.set(inb_id, requiredStockMap.get(inb_id)! + quantity);
                }

                if (newApprovalStatus === ApprovalStatus.APPROVED && previousApprovalStatus !== ApprovalStatus.APPROVED) {
                    const inbStockCheck = await inbRepo.createQueryBuilder("inb")
                        .select([`inb.${inbIdField} AS inb_id`, `inb.${inbField} AS stock_quantity`])
                        .where(`inb.${inbIdField} IN (:...inbIds)`, { inbIds: Array.from(requiredStockMap.keys()) })
                        .getRawMany();

                    const stockMap = new Map(inbStockCheck.map(stock => [stock.inb_id, stock.stock_quantity]));

                    for (const [inb_id, requiredQty] of requiredStockMap.entries()) {
                        const stockAvailable = stockMap.get(inb_id) ?? 0;

                        if (stockAvailable < requiredQty) {
                            console.warn(`⚠️ สต็อกไม่พอ! inb_id=${inb_id}, มีอยู่ ${stockAvailable}, ต้องการ ${requiredQty}`);
                            return response.setIncomplete(lang.msg(`field.quantity_not_enough`)); 
                        }
                    }

                   // ✅ หักสต็อกจริง
                    for (const [inb_id, requiredQty] of requiredStockMap.entries()) {
                        //console.log(`📉 Updating stock for inb_id=${inb_id}, required=${requiredQty}`);

                        await inbRepo.createQueryBuilder()
                            .update()
                            .set({ [inbField]: () => `${inbField} - ${requiredQty}` })
                            .where(`${inbIdField} = :inbId`, { inbId: inb_id })
                            .execute();

                        //console.log(`✅ Stock updated for inb_id=${inb_id}`);
                    }

                }

                else if (previousApprovalStatus === ApprovalStatus.APPROVED && newApprovalStatus !== ApprovalStatus.APPROVED) {
                    for (const [inb_id, returnedQty] of requiredStockMap.entries()) {
                        await inbRepo.createQueryBuilder()
                            .update()
                            .set({ [inbField]: () => `${inbField} + ${returnedQty}` })
                            .where(`${inbIdField} = :inbId`, { inbId: inb_id })
                            .execute();
                    }
                }
        
                //console.log(`✅ ปรับสต็อกสำเร็จ!`);
                return response.setComplete(lang.msg(`stock.updated.${reference_type}`), { reference_type, outbId, approvalStatus: newApprovalStatus });
        
            } catch (error: any) {
                //console.error(`❌ เกิดข้อผิดพลาดระหว่างปรับสต็อก: ${error.message}`);
                return response.setIncomplete(lang.msgErrorFunction('adjustStock', error.message));
            }
        }
        
        //ฟังก์ชันแจ้งเตือน outbound tooling ทุก userid ที่เกี่ยวข้อง
        private async processToolingNotificationAfterApproval(
            reference_id: number,
            username: string,
            manager: EntityManager
        ): Promise<void> {
        
            // 🔍 ลบแจ้งเตือนเดิมถ้ามี (ป้องกันซ้ำ)
            const existingNotif = await this.notifRepository.findOne({
                where: {
                    reference_type: RefType.OUTBTL,
                    reference_id,
                    notif_type: NotifType.TOOL_WITHDRAWAL,
                },
            });
        
            if (existingNotif) {
                await this.usernotifRepo.delete({ notif_id: existingNotif.notif_id });
                await this.notifRepository.delete({ notif_id: existingNotif.notif_id });
            }
        
            // ✅ สร้าง noti ใหม่
            const newNotif = await this.notifRepository.save({
                notif_type: NotifType.TOOL_WITHDRAWAL,
                reference_type: RefType.OUTBTL,
                reference_id,
                create_by: username,
                create_date: new Date(),
            });
        
            // ✅ หาผู้ใช้งานที่เกี่ยวข้อง
            const userIds = await getUsersToNotify(
                NotifType.TOOL_WITHDRAWAL,
                this.userRepository,
                manager
            );
        
            const userNotiData = userIds.map((uid) => ({
                notif_id: newNotif.notif_id,
                user_id: uid,
                notif_status: NotifStatus.UNREAD,
            }));
        
            if (userNotiData.length > 0) {
                await this.usernotifRepo.insert(userNotiData);
            }
        
            // ✅ แจ้งผ่าน WebSocket
            getIO().emit("new-notification", {
                notif_type: NotifType.TOOL_WITHDRAWAL,
                reference_type: RefType.OUTBTL,
                reference_id,
                create_date: new Date(),
            });
        
            console.log(`📢 แจ้งเตือน TOOL_WITHDRAWAL ไปยัง ${userIds.length} users แล้ว`);
        }
        

    /*
    * service แสดงข้อมูล outbound tooling ที่อนุมัติแล้ว โดย query ทุก 10 นาที
    * isFromCron = true → Cron Job เรียกใช้งาน → ❌ ไม่เปลี่ยน notif_status
    * isFromCron = false → Frontend เรียกใช้งาน → ✅ เปลี่ยน notif_status เป็น READ
    */
    async getNotiOutbTLIsAppr(userId: number, manager?: EntityManager): Promise<ApiResponse<{ newAdded: number, details: any[] }>> {
        let response = new ApiResponse<{ newAdded: number, details: any[] }>();
        const operation = 'NotifApprovalService.getNotiOutbTLIsAppr';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            //console.log("🔍 Checking approved Outbound Tooling for notifications...");
    
            const outbToolingRepo = useManager.getRepository(m_outb_tooling);
            const userNotifRepo = useManager.getRepository(s_user_notification);
            
            const notifRepo = useManager.getRepository(m_notifications);
            const outbToolingItemRepo = useManager.getRepository(m_outb_tooling_items);
            const inbToolingRepo = useManager.getRepository(m_inb_tooling);
            const toolingIFMRepo = useManager.getRepository(m_tooling_ifm);
    
            // ✅ Step 1: Fetch approved outbtl_id from `m_outb_tooling`
            const approvedOutbTooling = await outbToolingRepo.createQueryBuilder("outbtl")
                .select([
                    "outbtl.outbtl_id AS outbtl_id",
                    "outbtl.outbtl_code AS outbtl_code",
                    "outbtl.outbtl_details AS outbtl_details"
                ])
                .where("outbtl.outbtl_appr_status = :approvalStatus", { approvalStatus: ApprovalStatus.APPROVED })
                .getRawMany();        
    
            const approvedIds = approvedOutbTooling.map(row => row.outbtl_id);
            //console.log(`✅ Approved outbtl_ids found: ${approvedIds.length > 0 ? approvedIds.join(", ") : "None"}`);
    
            // ✅ Step 2: ดึง noti ของ user นี้
            const userNotifs = await userNotifRepo.createQueryBuilder("user_notif")
                .innerJoin(m_notifications, "notif", "notif.notif_id = user_notif.notif_id")
                .select([
                    "user_notif.notif_id AS notif_id",
                    "notif.reference_id AS reference_id",
                    "user_notif.notif_status AS notif_status",
                    "DATE_FORMAT(notif.create_date, '%d %b %y') AS formatted_date",
                    "DATE_FORMAT(notif.create_date, '%H:%i:%s') AS formatted_time"
                ])
                .where("notif.notif_type = :notifType", { notifType: NotifType.TOOL_WITHDRAWAL })
                .andWhere("user_notif.user_id = :userId", { userId })
                .orderBy("notif.create_date", "DESC")
                .getRawMany();

            const existingNotifIds = new Set(userNotifs.map(n => n.reference_id));
        
            // ✅ Step 2.5: อัปเดต notif_status = READ ใน s_user_notification สำหรับ user นี้
            const notifIds = userNotifs.map((n) => n.notif_id);

            if (notifIds.length > 0) {
            await userNotifRepo.createQueryBuilder()
                .update()
                .set({ notif_status: NotifStatus.READ })
                .where("notif_id IN (:...notifIds) AND user_id = :userId AND notif_status = :status", {
                notifIds,
                userId: userId,
                status: NotifStatus.UNREAD
                })
                .execute();

            //console.log(`📖 Marked notifications as READ for user_id=${userId}`);
            }


            // ✅ Step 3: Determine new and removed notifications
            const newNotifIds = approvedIds.filter(id => !existingNotifIds.has(id));
            const removedNotifIds = [...existingNotifIds].filter(id => !approvedIds.includes(id));
    
            //console.log(`🆕 New notifications to insert: ${newNotifIds.length}`);
            //console.log(`🗑️ Notifications to remove: ${removedNotifIds.length}`);    
    
            let newAdded = 0;
            let details: any[] = [];
            
            // ✅ Step 4: สร้าง noti ใหม่
            if (newNotifIds.length > 0) {
                const newNotis = newNotifIds.map(id => ({
                    notif_type: NotifType.TOOL_WITHDRAWAL,
                    reference_type: RefType.OUTBTL,
                    reference_id: id,
                    create_by: "system",
                    create_date: new Date(),
                }));

                const inserted = await notifRepo.createQueryBuilder().insert().values(newNotis).execute();
                const insertedNotifIds = inserted.identifiers.map((n) => n.notif_id);

                // ✅ สร้าง user_notif ให้ user นี้
                const userNotifData = insertedNotifIds.map(notif_id => ({
                    notif_id,
                    user_id: userId,
                    notif_status: NotifStatus.UNREAD,
                }));

                await userNotifRepo.insert(userNotifData);
                newAdded = insertedNotifIds.length;
            
                //console.log("✅ New notifications inserted:", newAdded);
            }
    
             // ✅ Step 5: ลบ noti ที่ไม่ต้องมีแล้ว
            if (removedNotifIds.length > 0) {
                // ดึง notif_id ที่จะลบ
                const toRemove = await notifRepo.createQueryBuilder("notif")
                    .select(["notif.notif_id"])
                    .where("notif.reference_id IN (:...ids)", { ids: removedNotifIds })
                    .andWhere("notif.notif_type = :type", { type: NotifType.TOOL_WITHDRAWAL })
                    .getMany();

                const notifIdsToRemove = toRemove.map(n => n.notif_id);

                await userNotifRepo.delete({ user_id: userId, notif_id: In(notifIdsToRemove) });
                await notifRepo.delete({ notif_id: In(notifIdsToRemove) });
            }
    
             // ✅ Step 6: รายละเอียดแสดงผล
            for (const notif of userNotifs) {
                // ค้นหา outbtlData จาก approvedOutbTooling ที่มี outbtl_id ตรงกับ reference_id ของ notif
                const outbtlData = approvedOutbTooling.find(o => o.outbtl_id === notif.reference_id);

                // ถ้าไม่พบ outbtlData แสดงว่าไม่มีข้อมูล Outbound Tooling ที่อนุมัติให้แจ้งเตือน → ข้ามการทำงาน
                if (!outbtlData) continue;

                // ดึงข้อมูลจาก m_outb_tooling_items ที่เชื่อมกับ outbtl_id ของการแจ้งเตือน
                const outbtlItems = await outbToolingItemRepo.createQueryBuilder("outbtlitm")
                    .select([
                        "outbtlitm.outbtlitm_id AS outbtlitm_id", 
                        "outbtlitm.inbtl_id AS inbtl_id"
                    ])
                    .where("outbtlitm.outbtl_id = :outbtlId", { outbtlId: notif.reference_id })
                    .getRawMany();

                // วนลูปข้อมูล outbtlItems (ข้อมูล Item ที่เชื่อมโยงกับ Outbound Tooling)
                for (const item of outbtlItems) {
                    // ดึง tlifm_id จาก m_inb_tooling โดยใช้ inbtl_id ที่ได้จาก outbtlItems
                    const inbtlData = await inbToolingRepo.createQueryBuilder("inbtl")
                        .select(["inbtl.tlifm_id AS tlifm_id"])
                        .where("inbtl.inbtl_id = :inbtlId", { inbtlId: item.inbtl_id })
                        .getRawOne();

                    // ถ้า inbtlData ไม่มีข้อมูล → ข้ามการทำงาน
                    if (!inbtlData) continue;

                    // ดึงชื่อ tlifm_name จาก m_tooling_ifm โดยใช้ tlifm_id ที่ได้จาก m_inb_tooling
                    const finishedGoodsData = await toolingIFMRepo.createQueryBuilder("tlifm")
                        .select(["tlifm.tlifm_name AS tlifm_name"])
                        .where("tlifm.tlifm_id = :tlifmId", { tlifmId: inbtlData.tlifm_id })
                        .getRawOne();

                    // เพิ่มข้อมูลเข้า details เพื่อใช้ในผลลัพธ์
                    details.push({
                        notif_id: notif.notif_id,
                        outbtl_id: notif.reference_id,
                        notif_status: notif.notif_status,
                        date: notif.formatted_date,
                        time: notif.formatted_time,
                        code: outbtlData.outbtl_code,
                        details: outbtlData.outbtl_details,
                        outbtlitm_id: item.outbtlitm_id,
                        name: finishedGoodsData ? finishedGoodsData.tlifm_name : null
                    });
                }
            }

            // ✅ Step 7: Commit Transaction
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }
    
            return response.setComplete(lang.msgFound("notif.tool_withdrawal"), { newAdded, details });
    
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`❌ Error in ${operation}:`, error);
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }    

    /*
    * service แสดงข้อมูล minimum stock โดย query ทุกวัน
    * isFromCron = true → Cron Job เรียกใช้งาน → ❌ ไม่เปลี่ยน notif_status
    * isFromCron = false → Frontend เรียกใช้งาน → ✅ เปลี่ยน notif_status เป็น READ
    */
    async getNotiMinimumStock(userId: number, manager?: EntityManager, isFromCron: boolean = false): Promise<ApiResponse<{ newAdded: number, details: any[] }>> {
        let response = new ApiResponse<{ newAdded: number, details: any[] }>();
        const operation = 'NotifApprovalService.getNotiMinimumStock';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            const userNotifRepo = useManager.getRepository(s_user_notification);
            //console.log("🔍 Checking minimum stock for notifications...");
            
            // ✅ 1. ดึงรายการสินค้าที่ต่ำกว่าเกณฑ์จากทุกตาราง
            const lowStockItems = await this.fetchLowStockItems(useManager);
    
            let newAdded = 0;
    
            // ✅ 2. ประมวลผลแจ้งเตือนสำหรับแต่ละรายการ
            for (const item of lowStockItems) {
                const isNewNotificationAdded = await this.processStockNotification(useManager, item);
                if (isNewNotificationAdded) newAdded++;
            }
    
            // ✅ 3. ดึงแจ้งเตือนทั้งหมด (รวมของเก่าและใหม่)
            const allNotifs = await this.fetchAllNotifications(useManager, userId);
    
             // ✅ 4. อัปเดต `notif_status` เป็น `READ` (เฉพาะเมื่อ frontend เรียกใช้)
            if (!isFromCron) {
                const notifIds = allNotifs.map(n => n.notif_id);
                if (notifIds.length > 0) {
                    await userNotifRepo.createQueryBuilder()
                        .update()
                        .set({ notif_status: NotifStatus.READ })
                        .where("notif_id IN (:...notifIds) AND user_id = :userId AND notif_status = :status", {
                            notifIds,
                            userId,
                            status: NotifStatus.UNREAD
                        })
                        .execute();
                    //console.log(`📖 Marked ${notifIds.length} notifications as READ for user_id=${userId}`);
                }
            }

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete(lang.msgFound("notif.minimum_stock"), { newAdded, details: allNotifs });
    
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`❌ Error in ${operation}:`, error);
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    
        
        //ฟังก์ชันดึงข้อมูลสินค้าที่ต่ำกว่าเกณฑ์
        private async fetchLowStockItems(manager: EntityManager) {
            const tables = {
                inbrm: { repo: manager.getRepository(m_inb_raw_material), alias: "inbrm", ifmField: "rmifm_id", ifmTable: "m_raw_material_ifm", idField: "inbrm_id", quantityField: "inbrm_quantity" },
                inbfg: { repo: manager.getRepository(m_inb_finished_goods), alias: "inbfg", ifmField: "fgifm_id", ifmTable: "m_finished_goods_ifm", idField: "inbfg_id", quantityField: "inbfg_quantity" },
                inbsemi: { repo: manager.getRepository(m_inb_semi), alias: "inbsemi", ifmField: "semiifm_id", ifmTable: "m_semi_ifm", idField: "inbsemi_id", quantityField: "inbsemi_quantity" }
            };
        
            let lowStockItems = [];
        
            for (const [key, table] of Object.entries(tables)) {
                //console.log(`🔎 Checking ${key.toUpperCase()}`);
        
                const items = await table.repo.createQueryBuilder(table.alias)
                    .select([
                        `${table.alias}.${table.idField} AS reference_id`,
                        `${table.alias}.${table.ifmField} AS ifm_id`,
                        `${table.alias}.${table.quantityField} AS inb_quantity`,
                        `'${key.toUpperCase()}' AS reference_type`
                    ])
                    .getRawMany();
        
                for (const item of items) {
                    
                    // ✅ ดึงข้อมูลจาก `m_criteria`
                    const criteria = await manager.createQueryBuilder()
                        .select([
                            "crt.crt_rem_low AS crt_rem_low", 
                            "crt.crt_rem_medium AS crt_rem_medium", 
                            "crt.crt_rem_high AS crt_rem_high"
                        ])
                        .from(m_criteria, "crt")
                        .innerJoin(table.ifmTable, "ifm", `ifm.crt_id = crt.crt_id`)
                        .where(`ifm.${table.ifmField} = :ifmId`, { ifmId: item.ifm_id })
                        .getRawOne();
        
                    if (!criteria) continue;
        
                    let alertLevel: NotiLevel | null = null;
        
                    if (criteria.crt_rem_high !== null && item.inb_quantity <= criteria.crt_rem_high) alertLevel = NotiLevel.HIGH;
                    else if (criteria.crt_rem_medium !== null && item.inb_quantity <= criteria.crt_rem_medium) alertLevel = NotiLevel.MEDIUM;
                    else if (criteria.crt_rem_low !== null && item.inb_quantity <= criteria.crt_rem_low) alertLevel = NotiLevel.LOW;
        
                    if (alertLevel) {
                        item.alert_level = alertLevel;
                        lowStockItems.push(item);
                    }
                }
            }
        
            return lowStockItems;
        }
        
        //ฟังก์ชันตรวจสอบและเพิ่มแจ้งเตือน
        private async processStockNotification(manager: EntityManager, item: any): Promise<boolean> {
            const notifRepo = manager.getRepository(m_notifications);
            const userNotifRepo = manager.getRepository(s_user_notification);
        
            // ✅ ตรวจสอบแจ้งเตือนที่มีอยู่
            const existingNotif = await notifRepo.createQueryBuilder("notif")
                .select([
                    "notif.notif_id AS notif_id", 
                    "notif.reference_id AS reference_id", 
                    "notif.reference_type AS reference_type",
                    "notif.alert_level AS alert_level"
                ])
                .where("notif.reference_id = :refId AND notif.notif_type = :notifType AND notif.reference_type = :refType", { 
                    refId: item.reference_id, 
                    notifType: NotifType.MINIMUM_STOCK,
                    refType: item.reference_type
                })
                .getRawOne();
        
            if (existingNotif) {
                if (existingNotif.alert_level === item.alert_level) {
                    //console.log(`✅ Alert level unchanged. Skipping insert for ID: ${item.reference_id}`);
                    return false;
                } else {
                  //  console.log(`🗑️ Removing outdated notification: notif_id=${existingNotif.notif_id}`);
                    await notifRepo.delete({ notif_id: existingNotif.notif_id });
                    await userNotifRepo.delete({ notif_id: existingNotif.notif_id });
                }
            }
                
                    // ✅ Insert new notification
            const inserted = await notifRepo.insert({
                notif_type: NotifType.MINIMUM_STOCK,
                reference_type: item.reference_type,
                reference_id: item.reference_id,
                alert_level: item.alert_level,
                create_date: new Date(),
                create_by: "system",
            });
            const notif_id = inserted.identifiers[0].notif_id;

            // ✅ Link with users
            const userIds = await getUsersToNotify(NotifType.MINIMUM_STOCK, this.userRepository, manager);
            const userNotifData = userIds.map(user_id => ({
                user_id,
                notif_id,
                notif_status: NotifStatus.UNREAD
            }));
            await userNotifRepo.save(userNotifData);

            // ✅ แจ้งเตือนผ่าน WebSocket
            getIO().emit("new-notification", {
                notif_type: NotifType.MINIMUM_STOCK,
                reference_type: item.reference_type,
                reference_id: item.reference_id,
                alert_level: item.alert_level,
                create_date: new Date()
            });

            //console.log("📢 WebSocket sent: MINIMUM_STOCK");

            return true;
        }
        
        // ฟังก์ชันดึงข้อมูลแจ้งเตือนทั้งหมด พร้อมข้อมูล code, lot, name
        private async fetchAllNotifications(manager: EntityManager, userId: number) {
            const notifRepo = manager.getRepository(m_notifications);
        
            const notifications = await notifRepo.createQueryBuilder("notif")
                .innerJoin(s_user_notification, "usernotif", "usernotif.notif_id = notif.notif_id AND usernotif.user_id = :userId", { userId })
                .select([
                    "notif.notif_id AS notif_id",
                    "notif.reference_id AS reference_id",
                    "notif.reference_type AS reference_type",
                    "usernotif.notif_status AS notif_status",
                    "notif.alert_level AS alert_level",
                    "DATE_FORMAT(notif.create_date, '%d %b %y') AS date",
                    "DATE_FORMAT(notif.create_date, '%H:%i:%s') AS time"
                ])
                .where("notif.notif_type = :notifType", { notifType: NotifType.MINIMUM_STOCK })
                .orderBy("notif.create_date", "DESC")
                .getRawMany();
        
            // ✅ Mapping ตารางและฟิลด์ที่เกี่ยวข้อง
            const tableMap = {
                "INBRM": { table: "m_inb_raw_material", codeField: "inbrm_code", lotField: "inbrm_lot", nameField: "rmifm_name", joinField: "rmifm_id", ifmTable: "m_raw_material_ifm" },
                "INBFG": { table: "m_inb_finished_goods", codeField: "inbfg_code", lotField: "inbfg_lot", nameField: "fgifm_name", joinField: "fgifm_id", ifmTable: "m_finished_goods_ifm" },
                "INBSEMI": { table: "m_inb_semi", codeField: "inbsemi_code", lotField: "inbsemi_lot", nameField: "semiifm_name", joinField: "semiifm_id", ifmTable: "m_semi_ifm" }
            };
        
            for (const notif of notifications) {
                // 🔹 ใช้ Type Assertion เพื่อบอก TypeScript ว่า `notif.reference_type` อยู่ใน `tableMap`
                const tableInfo = tableMap[notif.reference_type as keyof typeof tableMap];
        
                if (!tableInfo) continue;
        
                const additionalData = await manager.createQueryBuilder()
                    .select([
                        `inb.${tableInfo.codeField} AS inb_code`,
                        `inb.${tableInfo.lotField} AS inb_lot`,
                        `ifm.${tableInfo.nameField} AS inb_name`
                    ])
                    .from(tableInfo.table, "inb")
                    .leftJoin(tableInfo.ifmTable, "ifm", `ifm.${tableInfo.joinField} = inb.${tableInfo.joinField}`)
                    .where(`inb.${notif.reference_type.toLowerCase()}_id = :refId`, { refId: notif.reference_id })
                    .getRawOne();
        
                notif.inb_code = additionalData?.inb_code || null;
                notif.inb_lot = additionalData?.inb_lot || null;
                notif.inb_name = additionalData?.inb_name || null;
                notif.alert_level = `สินค้าต่ำกว่าเกณฑ์ ระดับ ${notif.alert_level}`;
            }
        
            return notifications;
        }
        

        

    /*
    * Service สำหรับแจ้งเตือนสินค้าที่ใกล้หมดอายุ (จาก create_date)
    */
    // สมมติว่า NotiLevel, NotifType, NotifStatus, m_inb_raw_material, m_inb_finished_goods, m_inb_semi, m_criteria, m_notifications 
    // ถูก import และกำหนดไว้แล้ว

    async getNotiShelfLife(userId: number, manager?: EntityManager, isFromCron: boolean = false): Promise<ApiResponse<{ newAdded: number, details: any[] }>> {
        let response = new ApiResponse<{ newAdded: number, details: any[] }>();
        const operation = 'NotifApprovalService.getNotiShelfLife';
    
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
    
        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }
    
        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }
    
        try {
            //console.log("🔍 Checking shelf life for notifications...");
            const userNotifRepo = useManager.getRepository(s_user_notification);

            // 1. ดึงรายการสินค้าที่ต้องตรวจสอบจากทุกตาราง
            const expiringItems = await this.fetchExpiringItems(useManager);
        
            let newAdded = 0;
        
            // 2. ประมวลผลแจ้งเตือนสำหรับแต่ละรายการ
            for (const item of expiringItems) {
                const isNewNotificationAdded = await this.processShelfLifeNotification(useManager, item);
                if (isNewNotificationAdded) newAdded++;
            }
        
            // 3. ดึงแจ้งเตือนทั้งหมด (รวมของเก่าและใหม่)
            const allNotifs = await this.fetchAllShelfLifeNotifications(useManager, userId);
        
            // ✅ 4. อัปเดต `notif_status` เป็น `READ` (เฉพาะเมื่อ frontend เรียกใช้)
            if (!isFromCron) {
                const unreadNotifIds = allNotifs
                    .filter(notif => notif.notif_status === NotifStatus.UNREAD)
                    .map(notif => notif.notif_id);

                if (unreadNotifIds.length > 0) {
                    await userNotifRepo.createQueryBuilder()
                        .update()
                        .set({ notif_status: NotifStatus.READ })
                        .where("user_id = :userId AND notif_id IN (:...unreadNotifIds) AND notif_status = :status", {
                            userId,
                            unreadNotifIds,
                            status: NotifStatus.UNREAD
                        })
                        .execute();

                    //console.log(`📖 Marked ${unreadNotifIds.length} shelf life notifications as READ for user_id=${userId}`);
                }
            }


            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete(lang.msgFound("notif.shelf_life"), { newAdded, details: allNotifs });

        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`❌ Error in ${operation}:`, error);
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
    
        // ฟังก์ชันดึงรายการสินค้าที่จะต้องแจ้งเตือน โดยคำนวณวันหมดอายุในระดับต่างๆ
        private async fetchExpiringItems(manager: EntityManager) {
            const tables = {
            inbrm: {
                repo: manager.getRepository(m_inb_raw_material),
                alias: "inbrm",
                ifmField: "rmifm_id",
                ifmTable: "m_raw_material_ifm",
                idField: "inbrm_id",
                createDateField: "create_date"
            },
            inbfg: {
                repo: manager.getRepository(m_inb_finished_goods),
                alias: "inbfg",
                ifmField: "fgifm_id",
                ifmTable: "m_finished_goods_ifm",
                idField: "inbfg_id",
                createDateField: "create_date"
            },
            inbsemi: {
                repo: manager.getRepository(m_inb_semi),
                alias: "inbsemi",
                ifmField: "semiifm_id",
                ifmTable: "m_semi_ifm",
                idField: "inbsemi_id",
                createDateField: "create_date"
            }
            };
        
            let expiringItems = [];
            const now = new Date();
            //console.log(`🔍 [fetchExpiringItems] Current time: ${now.toISOString()}`);
        
            for (const [key, table] of Object.entries(tables)) {
            //console.log(`🔎 Checking table: ${key.toUpperCase()}`);
        
            const items = await table.repo.createQueryBuilder(table.alias)
                .select([
                `${table.alias}.${table.idField} AS reference_id`,
                `${table.alias}.${table.ifmField} AS ifm_id`,
                `${table.alias}.${table.createDateField} AS create_date`,
                `'${key.toUpperCase()}' AS reference_type`
                ])
                .getRawMany();
        
            //console.log(`✅ Retrieved ${items.length} items from ${key.toUpperCase()}`);
        
            for (const item of items) {
                if (!item.create_date) {
                //console.log(`⚠️ Skipping item with reference_id=${item.reference_id} because create_date is missing.`);
                continue;
                }
        
                const createDate = new Date(item.create_date);
        
                // ดึงค่าเกณฑ์จาก m_criteria
                const criteria = await manager.createQueryBuilder()
                .select([
                    "crt.crt_exp_low AS crt_exp_low", 
                    "crt.crt_exp_medium AS crt_exp_medium", 
                    "crt.crt_exp_high AS crt_exp_high"
                ])
                .from(m_criteria, "crt")
                .innerJoin(table.ifmTable, "ifm", `ifm.crt_id = crt.crt_id`)
                .where(`ifm.${table.ifmField} = :ifmId`, { ifmId: item.ifm_id })
                .getRawOne();
        
                if (!criteria) {
                //console.log(`⚠️ No criteria found for item reference_id=${item.reference_id} with ifm_id=${item.ifm_id}`);
                continue;
                }
        
                //console.log(`📝 Criteria for item reference_id=${item.reference_id}: crt_exp_low=${criteria.crt_exp_low}, crt_exp_medium=${criteria.crt_exp_medium}, crt_exp_high=${criteria.crt_exp_high}`);
        
                // คำนวณ low expiry เสมอ
                const lowExpiry = new Date(createDate);
                lowExpiry.setDate(lowExpiry.getDate() + Number(criteria.crt_exp_low));
        
                // คำนวณ medium expiry หากมีค่า crt_exp_medium
                let mediumExpiry: Date | null = null;
                let mediumTrigger: Date | null = null;
                if (criteria.crt_exp_medium != null) {
                    mediumExpiry = new Date(createDate);
                    mediumExpiry.setDate(mediumExpiry.getDate() + Number(criteria.crt_exp_low) + Number(criteria.crt_exp_medium));
                    mediumTrigger = new Date(mediumExpiry);
                    mediumTrigger.setDate(mediumTrigger.getDate() - 1);
                }
        
                // คำนวณ high expiry หากมีค่า crt_exp_high
                let highExpiry: Date | null = null;
                let highTrigger: Date | null = null;
                if (criteria.crt_exp_high != null) {
                // ถ้ามี mediumExpiry อยู่แล้ว (หรือไม่ก็ใช้ 0 สำหรับ crt_exp_medium ถ้าไม่มี)
                const mediumDays = criteria.crt_exp_medium ? Number(criteria.crt_exp_medium) : 0;
                    highExpiry = new Date(createDate);
                    highExpiry.setDate(highExpiry.getDate() + Number(criteria.crt_exp_low) + mediumDays + Number(criteria.crt_exp_high));
                    highTrigger = new Date(highExpiry);
                    highTrigger.setDate(highTrigger.getDate() - 1);
                }
        
                // กำหนด alert_level ตามลำดับความพร้อมของ trigger
                let alertLevel: NotiLevel;
                // กรณีตรวจสอบ alert_level:
                // - ถ้ามี highTrigger และ now >= highTrigger → HIGH
                // - Else ถ้ามี mediumTrigger และ now >= mediumTrigger → MEDIUM
                // - ถ้าไม่เข้าเงื่อนไขใดๆ → LOW
                if (highTrigger && now >= highTrigger) {
                    alertLevel = NotiLevel.HIGH;
                    //console.log(`🔔 [HIGH] Item ref_id=${item.reference_id}: now ${now.toISOString()} >= high trigger ${highTrigger.toISOString()} (High expiry: ${highExpiry!.toISOString()})`);
                } else if (mediumTrigger && now >= mediumTrigger) {
                    alertLevel = NotiLevel.MEDIUM;
                    //console.log(`🔔 [MEDIUM] Item ref_id=${item.reference_id}: now ${now.toISOString()} >= medium trigger ${mediumTrigger.toISOString()} (Medium expiry: ${mediumExpiry!.toISOString()})`);
                } else {
                    alertLevel = NotiLevel.LOW;
                    //console.log(`🔔 [LOW] Item ref_id=${item.reference_id}: now ${now.toISOString()} is before medium trigger ${mediumTrigger ? mediumTrigger.toISOString() : "N/A"} (Low expiry: ${lowExpiry.toISOString()})`);
                }
        
                item.alert_level = alertLevel;
                // บันทึก expiry_date เฉพาะในแต่ละระดับ (เพื่อใช้แสดงข้อมูลเพิ่มเติม)
                if (alertLevel === NotiLevel.LOW) {
                    item.expiry_date = lowExpiry;
                } else if (alertLevel === NotiLevel.MEDIUM && mediumExpiry) {
                    item.expiry_date = mediumExpiry;
                } else if (alertLevel === NotiLevel.HIGH && highExpiry) {
                    item.expiry_date = highExpiry;
                }
        
                expiringItems.push(item);
                //console.log(`✅ Added item reference_id=${item.reference_id} with alert_level=${alertLevel}`);
            }
            }
        
            //console.log(`🔚 Finished fetching. Total expiring items: ${expiringItems.length}`);
            return expiringItems;
        }
        
        // ฟังก์ชันตรวจสอบและเพิ่มแจ้งเตือน shelf life (ไม่ insert ถ้าแจ้งเตือนที่มีอยู่แล้วมี alert_level เดิม)
        private async processShelfLifeNotification(manager: EntityManager, item: any): Promise<boolean> {
            const notifRepo = manager.getRepository(m_notifications);
            const userNotifRepo = manager.getRepository(s_user_notification);
            const userRepo = manager.getRepository(s_user);
        
            // ค้นหาแจ้งเตือนที่มีอยู่แล้ว (โดยใช้ reference_id, notif_type และ reference_type)
            const existingNotif = await notifRepo.findOne({
                where: {
                    reference_id: item.reference_id,
                    notif_type: NotifType.SHELF_LIFE,
                    reference_type: item.reference_type,
                },
            });
        
            if (existingNotif) {
                if (String(existingNotif.alert_level) === String(item.alert_level)) {
                    //console.log(`⚙️ Notification already exists for reference_id=${item.reference_id} with same alert_level=${item.alert_level}. Skipping insert.`);
                    return false;
                } else {
                    //console.log(`⚙️ Alert level changed. Removing notif_id=${existingNotif.notif_id}`);
                    // ลบทั้ง m_notifications และ s_user_notification
                    await userNotifRepo.delete({ notif_id: existingNotif.notif_id });
                    await notifRepo.delete(existingNotif.notif_id);
                }
            }
        
        
            // เพิ่มแจ้งเตือนใหม่
            const newNotif = notifRepo.create({
                notif_type: NotifType.SHELF_LIFE,
                reference_type: item.reference_type,
                reference_id: item.reference_id,
                alert_level: item.alert_level,
                create_date: new Date(),
                create_by: "system",
            });

            const savedNotif = await notifRepo.save(newNotif);

            // ดึง user_id ที่ต้องได้รับ noti ตาม role
            const userIds = await getUsersToNotify(NotifType.SHELF_LIFE, userRepo, manager);

            if (userIds.length > 0) {
                const userNotifList = userIds.map(userId => ({
                    notif_id: savedNotif.notif_id,
                    user_id: userId,
                    notif_status: NotifStatus.UNREAD
                }));
                await userNotifRepo.save(userNotifList);
            }

            // ✅ แจ้งเตือนผ่าน WebSocket
            getIO().emit("new-notification", {
                notif_type: NotifType.SHELF_LIFE,
                reference_type: item.reference_type,
                reference_id: item.reference_id,
                alert_level: item.alert_level,
                create_date: new Date()
            });

            //console.log("📢 WebSocket sent: SHELF_LIFE");

            return true;
        }

        // ฟังก์ชันดึงข้อมูลแจ้งเตือน shelf life พร้อมข้อมูลเพิ่มเติม (code, lot, ชื่อสินค้า)
        private async fetchAllShelfLifeNotifications(manager: EntityManager, userId: number) {
            const notifRepo = manager.getRepository(m_notifications);
        
            const notifications = await notifRepo.createQueryBuilder("notif")
                .innerJoin(s_user_notification, "usernotif", "notif.notif_id = usernotif.notif_id AND usernotif.user_id = :userId", { userId })
                .select([
                    "notif.notif_id AS notif_id",
                    "notif.reference_id AS reference_id",
                    "notif.reference_type AS reference_type",
                    "usernotif.notif_status AS notif_status",
                    "notif.alert_level AS alert_level",
                    "DATE_FORMAT(notif.create_date, '%d %b %y') AS date",
                    "DATE_FORMAT(notif.create_date, '%H:%i:%s') AS time"
                ])
                .where("notif.notif_type = :notifType", { notifType: NotifType.SHELF_LIFE })
                .orderBy("notif.create_date", "DESC") 
                .getRawMany();
        
            // Mapping ตารางและฟิลด์ที่เกี่ยวข้อง
            const tableMap = {
            "INBRM": { table: "m_inb_raw_material", codeField: "inbrm_code", lotField: "inbrm_lot", nameField: "rmifm_name", joinField: "rmifm_id", ifmTable: "m_raw_material_ifm" },
            "INBFG": { table: "m_inb_finished_goods", codeField: "inbfg_code", lotField: "inbfg_lot", nameField: "fgifm_name", joinField: "fgifm_id", ifmTable: "m_finished_goods_ifm" },
            "INBSEMI": { table: "m_inb_semi", codeField: "inbsemi_code", lotField: "inbsemi_lot", nameField: "semiifm_name", joinField: "semiifm_id", ifmTable: "m_semi_ifm" }
            };
        
            for (const notif of notifications) {
            const tableInfo = tableMap[notif.reference_type as keyof typeof tableMap];
            if (!tableInfo) continue;
        
            const additionalData = await manager.createQueryBuilder()
                .select([
                `inb.${tableInfo.codeField} AS inb_code`,
                `inb.${tableInfo.lotField} AS inb_lot`,
                `ifm.${tableInfo.nameField} AS inb_name`
                ])
                .from(tableInfo.table, "inb")
                .leftJoin(tableInfo.ifmTable, "ifm", `ifm.${tableInfo.joinField} = inb.${tableInfo.joinField}`)
                .where(`inb.${notif.reference_type.toLowerCase()}_id = :refId`, { refId: notif.reference_id })
                .getRawOne();
        
            notif.inb_code = additionalData?.inb_code || null;
            notif.inb_lot = additionalData?.inb_lot || null;
            notif.inb_name = additionalData?.inb_name || null;
            notif.alert_level = `สินค้าใกล้หมดอายุ ระดับ ${notif.alert_level}`;
            }
        
            return notifications;
        }

    /*
     * ดึงข้อมูลที่ยังเป็น UNREAD 
    */
    async getUnreadNotif(userId: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'NotifApprovalService.getUnreadNotif';
        
        try {
            const userNotifRepo = manager ? manager.getRepository(s_user_notification) : this.usernotifRepo;

            const rawData = await userNotifRepo
                .createQueryBuilder('user_notif')
                .innerJoin(m_notifications, 'notif', 'notif.notif_id = user_notif.notif_id')
                .select('notif.notif_type', 'notif_type')
                .addSelect('COUNT(*)', 'count')
                .where('user_notif.user_id = :userId', { userId })
                .andWhere('user_notif.notif_status = :status', { status: NotifStatus.UNREAD })
                .groupBy('notif.notif_type')
                .getRawMany();
        
            // 👇 เตรียมค่า default
            const result = {
                SHELF_LIFE: 0,
                MINIMUM_STOCK: 0,
                TOOL_WITHDRAWAL: 0,
                REQUEST_APPROVAL: 0,
            };
        
            // 👇 map ค่าจาก rawData ไปยัง object
            rawData.forEach((row: any) => {
                const type = row.notif_type;
                const count = Number(row.count);
                if (type in result) {
                    result[type as keyof typeof result] = count;
                }
            });
        
            return response.setComplete(lang.msgFound('item.notif'), result);
        
        } catch (error: any) {
            console.error(`❌ Error in ${operation}:`, error);
            return response.setIncomplete(`Error: ${error.message}`);
        }
    }

    /*
     * ลบข้อมูลการแจ้งเตือน เกิน 3 เดือน โดยลบข้อมูลเฉพาะที่ READ แล้ว
    */
    async clearOldNotifications(months: number = 3, manager?: EntityManager): Promise<void> {
        const useManager = manager || AppDataSource.manager;
    
        // 🔸 คำนวณวันที่ย้อนหลัง N เดือนจากวันนี้ (เที่ยงคืนของวัน)
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);
        cutoffDate.setHours(0, 0, 0, 0);
    
        // 🔸 ดึงรายการ notif_id ที่ create_date < cutoff และมี status = READ
        const results = await useManager
            .getRepository(s_user_notification)
            .createQueryBuilder('usernotif')
            .innerJoin(m_notifications, 'notif', 'usernotif.notif_id = notif.notif_id')
            .select('usernotif.notif_id', 'notif_id')
            .where('notif.create_date < :cutoff', { cutoff: cutoffDate })
            .andWhere('usernotif.notif_status = :status', { status: NotifStatus.READ })
            .getRawMany();
    
        const notifIds = results.map(r => r.notif_id);
        if (notifIds.length === 0) {
            //console.log('✅ No notifications to delete.');
            return;
        }
    
        // 🔸 ลบจาก s_user_notification
        await useManager.getRepository(s_user_notification)
            .createQueryBuilder()
            .delete()
            .where('notif_id IN (:...ids)', { ids: notifIds })
            .execute();
    
        // 🔸 ลบจาก m_notifications
        await useManager.getRepository(m_notifications)
            .createQueryBuilder()
            .delete()
            .where('notif_id IN (:...ids)', { ids: notifIds })
            .execute();
    
        //console.log(`🧹 Deleted ${notifIds.length} notifications older than ${months} months (before ${cutoffDate.toISOString().split('T')[0]}).`);
    }
    
}
