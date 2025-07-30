import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('m_log_inb_outb')
export class m_log_inb_outb {

    @PrimaryGeneratedColumn()
    log_id: number;                         // ไอดี log

    @Column({ length: 50 })
    log_type: string;                       // 'INBOUND' หรือ 'OUTBOUND'

    @Column({ length: 100 })
    log_ctgy: string;                       // ชื่อหมวดหมู่(category)ที่ดำเนินการ เช่น RAW_MATERIAL, FINISHED_GOODS, SEMI, TOOLING

    @Column({ length: 50 })
    log_action: string;                     // ประเภท action เช่น CREATED, UPDATED, DELETED, RETURNED
    
    @Column('int',{ nullable: true })
    ref_id: number;                         // ไอดีของรายการที่เกี่ยวข้อง (เช่น inbrm_id หรือ outbrm_id)

    @Column({ type: 'json', nullable: true })
    transaction_data: any | null;           // เก็บข้อมูลทั้งหมดของ transaction

   /*  @Column({ type: 'varchar', length: 50, nullable: true })
    code: string | null;                          // รหัสรายการ เช่น RM001

    @Column({ type: 'varchar', length: 100, nullable: true })
    name: string | null;                          // ชื่อรายการ เช่น RM > โลหะ

    @Column('int',{ nullable: true })
    ref_id: number | null;                        // ไอดี ที่อ้างถึง เช่น กรณี inbound: ref_id คือ ifm_id / กรณี outbound: ref_id คือ inbound_id  

    @Column('int',{ nullable: true })
    factory_id: number | null;                    // ไอดี โรงงาน (value dropdown)

    @Column({ type: 'varchar', length: 50, nullable: true })
    factory_name: string | null;                  //  ชื่อ โรงงาน

    @Column('int',{ nullable: true })
    warehouse_id: number | null;                  // ไอดี คลังสินค้า (value dropdown)

    @Column({ type: 'varchar', length: 50, nullable: true })
    warehouse_name: string | null;                //  ชื่อ คลังสินค้า

    @Column('int',{ nullable: true })
    zone_id: number | null;                       // ไอดี โซนในคลังสินค้า (value dropdown)

    @Column({ type: 'varchar', length: 50, nullable: true })
    zone_name: string | null;                     //  ชื่อ โซนในคลังสินค้า

    @Column('int',{ nullable: true })
    location_id: number | null;                   // ไอดี ตำแหน่งที่ตั้ง (value dropdown)

    @Column({ type: 'varchar', length: 50, nullable: true })
    location_name: string | null;                //  ชื่อ ตำแหน่งที่ตั้ง

    @Column({ type: 'varchar', length: 50, nullable: true })
    grade: string | null;                         // เกรด

    @Column({ type: 'varchar', length: 50, nullable: true })
    lot: string | null;                           // lot

    @Column({  type: 'int', nullable: true })
    quantity: number | null;                      // จำนวนที่เพิ่ม / เบิก

    @Column({ type: 'varchar', length: 50, nullable: true })
    color: string | null;                         // สี

    @Column({ type: 'varchar', length: 100, nullable: true })
    barcode: string | null;                       // barcode

    @Column('int',{ nullable: true })
    supplier_id: number | null;                   // supplier id

    @Column({ type: 'varchar', length: 100, nullable: true })
    supplier_name: string | null;                 // supplier name

    @Column({ type: 'varchar', length: 255, nullable: true })
    details: string | null;                        // รายละเอียด
    
    @Column({ type: 'varchar', length: 255, nullable: true })
    remark: string | null;                        // หมายเหตุ

    @Column({ type: 'int', nullable: true })
    so_id: number | null;                        // ไอดี bom

    @Column({ type: 'varchar', length: 100, nullable: true })
    bom_number: string | null;                    // Job number

    @Column({ type: 'varchar', length: 50, nullable: true })
    shipment: string | null;                      // การจัดส่ง เช่น SELF_PICKUP หรือ DELIVERY

    @Column({ type: "varchar", length: 100, nullable: true })
    driver_name: string | null;            // ชื่อคนขับ
    
    @Column({ type: "varchar", length: 20, nullable: true })
    vehicle_license: string | null;        // ทะเบียนรถ

    @Column({ type: "varchar", length: 20, nullable: true })
    phone: string | null;                  // เบอร์โทรศัพท์
    
    @Column({ type: 'text', nullable: true })
    address: string | null;                 // ที่อยู่

    @Column({ type: 'int', nullable: true })
    tspyard_id: number | null;             // ไอดีท่าเรือหรือท่ารถ

    @Column({ type: 'varchar', length: 100, nullable: true })
    tspyard_name: string | null;           // ชื่อท่าเรือหรือท่ารถ */

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    timestamp: Date;                      // วันที่สร้างข้อมูล

    @Column({ length: 30, nullable: false, default: "system" })
    username: string;                      // ผู้สร้างข้อมูล

}
