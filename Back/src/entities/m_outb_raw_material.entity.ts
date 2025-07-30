import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApprovalStatus } from '../common/global.enum';

@Entity('m_outb_raw_material')
export class m_outb_raw_material {

    // PK
    @PrimaryGeneratedColumn()
    outbrm_id: number;                    // ไอดีใบเบิก Raw Material (Outbound)

    @Column({ length: 20, nullable: false })
    outbrm_code: string;                   // รหัสใบเบิก Raw Material (Outbound)

    @Column({ length: 300, nullable: true })
    outbrm_details: string;                // รายละเอียด

    @Column({ default: false, nullable: false })
    outbrm_is_bom_used: boolean;          // สถานะการใช้ bom (true:ใช้ bom,false:ไม่ใช้ bom)

    @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING, nullable: false }) 
    outbrm_appr_status: ApprovalStatus;           // สถานะการอนุมัติ (approved) เช่น APPROVED:อนุมัติแล้ว , REJECTED:ไม่อนุมัติ ,PENDING:รออนุมัติ
    
    @Column({ default: true, nullable: false })
    outbrm_is_active: boolean;            // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

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
}