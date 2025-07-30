import { Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "m_tooling_ifm" })
export class m_tooling_ifm {

    // PK
    @PrimaryGeneratedColumn()
    tlifm_id: number;                      // ไอดีเครื่องมือ

    // FK -> m_tooling
    @Column({nullable: true})
    tl_id: number;                          // ไอดี tl type

    // FK -> m_criteria
    @Column({nullable: true})
    crt_id: number;                         // ไอดี criteria

    @Column({  unique: true, length: 20, nullable: false })
    tlifm_code: string;                    // รหัสเครื่องมือ

    @Column({  unique: true, length: 255, nullable: false })
    tlifm_name: string;                    // ชื่อเครื่องมือ

    @Column({ default: true, nullable: false })
    tlifm_is_active: boolean;              // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

}