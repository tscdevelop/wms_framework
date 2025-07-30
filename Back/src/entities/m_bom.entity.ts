import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('m_bom')
export class m_bom {

    // PK
    @PrimaryGeneratedColumn()
    so_id: number;                    // ไอดี Sales Order 

    @Column({ length: 20, nullable: false })
    so_code: string;                  // เลขที่ใบ Sales Order

    @Column({ length: 255, nullable: false })
    so_cust_name: string;             // ชื่อลูกค้า

    @Column({ length: 300, nullable: true })
    so_details: string;                // รายละเอียด

    @Column({ default: true, nullable: false })
    so_is_active: boolean;            // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล
}
