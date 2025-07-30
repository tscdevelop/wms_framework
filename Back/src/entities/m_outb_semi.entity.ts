import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApprovalStatus } from '../common/global.enum';

@Entity('m_outb_semi')
export class m_outb_semi {

    // PK
    @PrimaryGeneratedColumn()
    outbsemi_id: number;                    // ไอดีใบเบิก Semi (Outbound)

    @Column({ length: 20, nullable: false })
    outbsemi_code: string;                   // รหัสใบเบิก Semi (Outbound)

    @Column({ length: 300, nullable: true })
    outbsemi_details: string;                 // รายละเอียดใบเบิก Semi (Outbound)

    @Column({ length: 100, nullable: true })
    outbsemi_so: string;                    // SO number

    @Column({ length: 300, nullable: true })
    outbsemi_remark: string;                 // หมายเหตุ

    @Column({ type: "varchar", length: 100, nullable: true })
    outbsemi_driver_name: string | null;      // ชื่อคนขับ
    
    @Column({ type: "varchar", length: 20, nullable: true })
    outbsemi_vehicle_license: string | null;  // ทะเบียนรถ

    @Column({ type: "varchar", length: 20, nullable: true })
    outbsemi_phone: string | null;            // เบอร์โทรศัพท์
    
    @Column({ type: "varchar", length: 1000, nullable: true })
    outbsemi_address: string | null;          // ที่อยู่

    // FK -> m_transport_yard
    @Column({ type: 'int', nullable: true })
    tspyard_id: number | null;              // ไอดีท่าเรือหรือท่ารถ

    @Column({ default: false, nullable: false })
    outbsemi_is_returned: boolean;          // นำกลับหรือไม่

    @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING, nullable: false }) 
    outbsemi_appr_status: ApprovalStatus;           // สถานะการอนุมัติ (approved) เช่น APPROVED:อนุมัติแล้ว , REJECTED:ไม่อนุมัติ ,PENDING:รออนุมัติ
        
    @Column({ default: true, nullable: false })
    outbsemi_is_active: boolean;             // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

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
}