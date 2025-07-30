import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApprovalStatus, ReturnStatus } from '../common/global.enum';

@Entity('m_outb_tooling')
export class m_outb_tooling {

    // PK
    @PrimaryGeneratedColumn()
    outbtl_id: number;                    // ไอดีใบเบิก Tooling (Outbound)

    @Column({ length: 20, nullable: false })
    outbtl_code: string;                   // รหัสใบเบิก Tooling (Outbound)

    @Column({ length: 300, nullable: true })
    outbtl_details: string;                // รายละเอียดใบเบิก Tooling (Outbound)

    @Column({ length: 150, nullable: false })
    outbtl_issued_by: string;             // ชื่อ-นามสกุล ทำเรื่องเบิก Tooling (Outbound)

    @Column({ length: 150, nullable: true })
    outbtl_returned_by: string;             // ผู้-นามสกุล ทำเรื่องคืน Tooling (อาจเป็น null ถ้ายังไม่คืน)
        
    @Column({ type: 'enum', enum: ReturnStatus, nullable: false, default: ReturnStatus.NOT_RETURNED })
    outbtl_return_status: ReturnStatus;      // สถานะการคืน เช่น ยังไม่ได้คืน(NOT_RETURNED), คืนแล้ว(RETURNED) , คืนไม่ครบ(PARTIAL_RETURNED)

    @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING, nullable: false }) 
    outbtl_appr_status: ApprovalStatus;           // สถานะการอนุมัติ (approved) เช่น APPROVED:อนุมัติแล้ว , REJECTED:ไม่อนุมัติ ,PENDING:รออนุมัติ
            
    @Column({ default: true, nullable: false })
    outbtl_is_active: boolean;             // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    return_date: Date;                  // วันที่คืนของ

    @Column({ type: "timestamp", nullable: true, default: () => null })
    withdr_date: Date;                  // วันที่สร้างใบเบิก
}