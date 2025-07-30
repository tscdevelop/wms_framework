import { Entity, Column, PrimaryGeneratedColumn} from "typeorm";

// ตาราง ข้อมูลพนักงาน

@Entity({ name: "m_employee" })
export class m_employee {

    // PK
    @PrimaryGeneratedColumn()
    emp_id: number;                 // ไอดีพนักงาน

    // FK -> s_user
    @Column({nullable: true})
    user_id: number;                // รหัสผู้ใช้งานระบบ

    @Column({ length: 20, nullable: false })
    emp_code: string;               // รหัสพนักงาน

    @Column({ length: 255, nullable: false })
    emp_first_name: string;         // ชื่อ

    @Column({ length: 255, nullable: true })
    emp_last_name: string;          // นามสกุล

    @Column({ default: true, nullable: false })
    emp_is_active: boolean;         // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;              // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;              // วันที่แก้ไขข้อมูล
 
    @Column({ length: 30, nullable: true })
    update_by: string;              // ผู้แก้ไขข้อมูล
}
