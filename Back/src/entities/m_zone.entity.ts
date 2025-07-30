import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn} from "typeorm";

@Entity({ name: "m_zone" })
export class m_zone {

    // PK
    @PrimaryGeneratedColumn()
    zn_id: number;                     // ไอดีโซนในคลังสินค้า

    // FK -> m_factory
    @Column({ nullable: false })
    fty_id: number;                     // ไอดีโรงงาน

    // FK -> m_warehouse
    @Column({ nullable: false })
    wh_id: number;                     // ไอดีคลังสินค้า

    @Column({ length: 20, nullable: false })
    zn_code: string;                   // รหัสโซนในคลังสินค้า

    @Column({ length: 100, nullable: false })
    zn_name: string;                   // ชื่อโซนในคลังสินค้า

    @Column({ length: 300, nullable: true })
    zn_remark: string;                 // หมายเหตุโซนในคลังสินค้า

    @Column({ default: true, nullable: false })
    zn_is_active: boolean;             // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

}