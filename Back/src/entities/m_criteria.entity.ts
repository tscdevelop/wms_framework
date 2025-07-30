import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: "m_criteria" })
export class m_criteria {

    // PK
    @PrimaryGeneratedColumn()
    crt_id: number;                     // Primary Key

    @Column({ type: 'varchar', length: 255, nullable: false })
    crt_name: string;                   // ชื่อเกณฑ์

    @Column({ type: 'text', nullable: true })
    crt_remark: string;                 // หมายเหตุเกี่ยวกับเกณฑ์

    @Column({nullable: true})
    crt_exp_low: number;                // วันหมดอายุระดับ Low (exp: Expiry )

    @Column({nullable: true})
    crt_exp_medium: number;             // วันหมดอายุระดับ Medium

    @Column({nullable: true})
    crt_exp_high: number;               // วันหมดอายุระดับ High

    @Column({nullable: true})
    crt_txn_low: number;                // กำหนดวันเบิก-คืนระดับ Low (txn: Transaction )

    @Column({nullable: true})
    crt_txn_medium: number;             // กำหนดวันเบิก-คืนระดับ Medium

    @Column({nullable: true})
    crt_txn_high: number;               // กำหนดวันเบิก-คืนระดับ High

    @Column({nullable: true})
    crt_rem_low: number;                // วันคงเหลือระดับ Low (rem: Remaining )

    @Column({nullable: true})
    crt_rem_medium: number;             // วันคงเหลือระดับ Medium

    @Column({nullable: true})
    crt_rem_high: number;               // วันคงเหลือระดับ High

    @Column({ default: true, nullable: false })
    crt_is_active: boolean;             // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

}
