import { Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "m_location" })
export class m_location {

    // PK
    @PrimaryGeneratedColumn()
    loc_id: number;                     // ไอดีตำแหน่งที่ตั้ง

    // FK -> m_factory
    @Column({ nullable: false })
    fty_id: number;                     // ไอดีโรงงาน

    // FK -> m_warehouse
    @Column({ nullable: false })
    wh_id: number;                     // ไอดีคลังสินค้า

    // FK -> m_zone
    @Column({ nullable: false })
    zn_id: number;                      // ไอดีโซนในคลังสินค้า

    @Column({ length: 20, nullable: false })
    loc_code: string;                   // รหัสตำแหน่งที่ตั้ง

    @Column({ length: 100, nullable: false })
    loc_name: string;                   // ชื่อตำแหน่งที่ตั้ง

    @Column({ length: 300, nullable: true })
    loc_remark: string;                 // หมายเหตุตำแหน่งที่ตั้ง

    @Column({ default: true, nullable: false })
    loc_is_active: boolean;              // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

}