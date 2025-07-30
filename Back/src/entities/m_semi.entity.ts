import { Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "m_semi" })
export class m_semi {

    // PK
    @PrimaryGeneratedColumn()
    semi_id: number;                      // ไอดีวัตถุดิบ

    @Column({ length: 20, nullable: false })
    semi_code: string;                    // รหัสวัตถุดิบ

    @Column({ length: 255, nullable: false })
    semi_type: string;                    // ประเภทวัตถุดิบ

    @Column({ length: 300, nullable: true })
    semi_remark: string;                  // หมายเหตุวัตถุดิบ

    @Column({ default: true, nullable: false })
    semi_is_active: boolean;              // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

}