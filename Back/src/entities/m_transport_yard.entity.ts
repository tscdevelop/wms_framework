import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('m_transport_yard')
export class m_transport_yard {

     // PK
    @PrimaryGeneratedColumn()
    tspyard_id: number;                     // ไอดีท่ารถ

    // FK -> m_factory
    @Column({ nullable: false })
    fty_id: number;                          // ไอดีโรงงาน

    @Column({ length: 20, nullable: false })
    tspyard_code: string;                   // รหัสท่ารถ

    @Column({ length: 255, nullable: false })
    tspyard_name: string;                   // ชื่อท่ารถ

    @Column({ length: 300, nullable: true })
    tspyard_remark: string;                 // หมายเหตุ

    @Column({ length: 500, nullable: true })
    tspyard_address: string;                // ที่อยู่ท่ารถ

    @Column({ length: 30, nullable: true })
    tspyard_phone: string;                  // เบอร์ติดต่อท่ารถ

    @Column({ default: true, nullable: false })
    tspyard_is_active: boolean;             // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล
}
