import { Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "m_unit" })
export class m_unit {

    // PK
    @PrimaryGeneratedColumn()
    unit_id: number;                     // ไอดีหน่วย

    @Column({ length: 50, nullable: true })
    unit_name_th: string;                // ชื่อหน่วย ภาษาไทย

    @Column({ length: 50, nullable: true })
    unit_name_en: string;                // ชื่อหน่วย ภาษาอังกฤษ

    @Column({ length: 10, nullable: true })
    unit_abbr_th: string;                // คำย่อหน่วย ภาษาไทย

    @Column({ length: 10, nullable: true })
    unit_abbr_en: string;                // คำย่อหน่วย ภาษาอังกฤษ

    @Column({ default: true, nullable: false })
    unit_is_active: boolean;             // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

}