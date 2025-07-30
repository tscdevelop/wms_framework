import { Entity, Column, PrimaryGeneratedColumn , PrimaryColumn} from "typeorm";

@Entity({ name: "m_warehouse" })
export class m_warehouse {

    // PK
    @PrimaryGeneratedColumn()
    wh_id: number;                    // ไอดีคลังสินค้า

    // FK -> m_factory
    @Column({ nullable: false })
    fty_id: number;                     // ไอดีโรงงาน

    @Column({ length: 20, nullable: false })
    wh_code: string;                   // รหัสคลังสินค้า

    @Column({ length: 50, nullable: false })
    wh_type: string;                   // ประเภทคลังสินค้า (Raw material, FG, Tooling)

    @Column({ length: 100, nullable: false })
    wh_name: string;                   // ชื่อคลังสินค้า

    @Column({ default: true, nullable: false })
    wh_is_active: boolean;             // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

}