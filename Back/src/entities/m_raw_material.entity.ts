import { Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "m_raw_material" })
export class m_raw_material {

    // PK
    @PrimaryGeneratedColumn()
    rm_id: number;                      // ไอดีประเภทวัตถุดิบ

    @Column({ length: 20, nullable: false })
    rm_code: string;                    // รหัสประเภทวัตถุดิบ

    @Column({ length: 100, nullable: false })
    rm_type: string;                    // ประเภทวัตถุดิบ

    @Column({ length: 300, nullable: true })
    rm_remark: string;                  // หมายเหตุประเภทวัตถุดิบ

    @Column({ default: true, nullable: false })
    rm_is_active: boolean;              // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

}