import { Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "m_finished_goods" })
export class m_finished_goods {

    // PK
    @PrimaryGeneratedColumn()
    fg_id: number;                      // ไอดีสินค้าสำเร็จรูป

    @Column({ length: 20, nullable: false })
    fg_code: string;                    // รหัสสินค้าสำเร็จรูป

    @Column({ length: 255, nullable: false })
    fg_type: string;                    // ประเภทสินค้าสำเร็จรูป

    @Column({ length: 300, nullable: true })
    fg_remark: string;                  // หมายเหตุสินค้าสำเร็จรูป

    @Column({ default: true, nullable: false })
    fg_is_active: boolean;              // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

}