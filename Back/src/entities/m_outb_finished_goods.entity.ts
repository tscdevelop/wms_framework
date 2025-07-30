import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApprovalStatus } from '../common/global.enum';

@Entity('m_outb_finished_goods')
export class m_outb_finished_goods {

    // PK
    @PrimaryGeneratedColumn()
    outbfg_id: number;                    // ไอดีใบเบิก Finished Goods (Outbound)

    @Column({ length: 20, nullable: false })
    outbfg_code: string;                   // รหัสใบเบิก Finished Goods (Outbound)

    @Column({ length: 300, nullable: true })
    outbfg_details: string;                 // รายละเอียดใบเบิก Finished Goods (Outbound)

    @Column({ length: 100, nullable: true })
    outbfg_so: string;                      // SO number

    // FK -> m_bom
    @Column({ nullable: true })
    so_id: number;                          // ไอดี SO

    @Column({ length: 300, nullable: true })
    outbfg_remark: string;                 // หมายเหตุ

    @Column({ default: true, nullable: false })
    outbfg_is_shipment: boolean;            // สถานะการจัดส่ง (true:บริษัทจัดส่ง, false:มารับเอง)

    @Column({ type: "varchar", length: 100, nullable: true })
    outbfg_driver_name: string | null;      // ชื่อคนขับ
    
    @Column({ type: "varchar", length: 20, nullable: true })
    outbfg_vehicle_license: string | null;  // ทะเบียนรถ

    @Column({ type: "varchar", length: 20, nullable: true })
    outbfg_phone: string | null;            // เบอร์โทรศัพท์
    
    @Column({ type: "varchar", length: 1000, nullable: true })
    outbfg_address: string | null;          // ที่อยู่

    // FK -> m_transport_yard
    @Column({ type: 'int', nullable: true })
    tspyard_id: number | null;              // ไอดีท่าเรือหรือท่ารถ
    
    @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING, nullable: false }) 
    outbfg_appr_status: ApprovalStatus;               // สถานะการอนุมัติ (approved) เช่น APPROVED:อนุมัติแล้ว , REJECTED:ไม่อนุมัติ ,PENDING:รออนุมัติ

    @Column({ default: true, nullable: false })
    outbfg_is_bom_used: boolean;             // สถานะการใช้ bom (true:ใช้ bom, false:ไม่ใช้ bom)

    @Column({ default: true, nullable: false })
    outbfg_is_active: boolean;             // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    withdr_date: Date;                  // วันที่สร้างใบเบิก

    @Column({ type: "timestamp", nullable: true, default: () => null })
    shipmt_date: Date;                  // วันที่สร้างใบนำส่ง

    @Column({ type: "timestamp", nullable: true, default: () => null })
    scan_shipmt_date: Date;             // วันที่แสกนสินค้าตามใบนำส่ง
}