import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn} from "typeorm";

@Entity({ name: "m_factory" })
export class m_factory {

    // PK
    @PrimaryGeneratedColumn()
    fty_id: number;                     // ไอดีโรงงาน

    @Column({ length: 20, nullable: false })
    fty_code: string;                   // รหัสโรงงาน

    @Column({ length: 255, nullable: false })
    fty_name: string;                   // ชื่อโรงงาน

    @Column({ length: 30, nullable: true })
    fty_phone: string;                  // เบอร์โทรศัพท์โรงงาน

    @Column({ length: 500, nullable: true })
    fty_address: string;                // ที่อยู่โรงงาน

    @Column({ default: true, nullable: false })
    fty_is_active: boolean;             // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

}