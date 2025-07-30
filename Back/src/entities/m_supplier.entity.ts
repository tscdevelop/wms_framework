import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('m_supplier')
export class m_supplier {

     // PK
    @PrimaryGeneratedColumn()
    sup_id: number;                     // ไอดี Supplier

    @Column({ length: 20, nullable: false })
    sup_code: string;                   // รหัส Supplier

    @Column({ length: 100, nullable: false })
    sup_name: string;                   // ชื่อ Supplier

    @Column({ length: 30, nullable: true })
    sup_tax_id: string;                 // เลขประจำตัวผู้เสียภาษี

    @Column({ length: 300, nullable: true })
    sup_remark: string;                 // หมายเหตุ

    @Column({ length: 1000, nullable: true })
    sup_address: string;                // ที่อยู่

    @Column({ length: 20, nullable: true })
    sup_phone: string;                  // เบอร์ติดต่อ

    @Column({ length: 100, nullable: true })
    sup_email: string;                  // Email

    @Column({ nullable: true })
    sup_payment_due_days: number;       // ระยะเวลาวันครบกำหนดชำระเงิน

    @Column({ default: true, nullable: false })
    sup_is_active: boolean;             // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล
}
