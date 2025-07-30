import { Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "m_tooling" })
export class m_tooling {

    // PK
    @PrimaryGeneratedColumn()
    tl_id: number;                      // ไอดีประเภทเครื่องมือ

    @Column({ length: 20, nullable: false })
    tl_code: string;                    // รหัสประเภทเครื่องมือ

    @Column({ length: 100, nullable: false })
    tl_type: string;                    // ประเภทเครื่องมือ

    @Column({ length: 300, nullable: true })
    tl_remark: string;                  // หมายเหตุประเภทเครื่องมือ

    @Column({ default: true, nullable: false })
    tl_is_active: boolean;              // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

}