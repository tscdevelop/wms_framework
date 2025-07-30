import { Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "m_semi_ifm" })
export class m_semi_ifm {

    // PK
    @PrimaryGeneratedColumn()
    semiifm_id: number;                      // ไอดีวัตถุดิบ

    // FK -> m_semi
    @Column({nullable: true})
    semi_id: number;                        // ไอดี semi type

    // FK -> m_criteria
    @Column({nullable: true})
    crt_id: number;                         // ไอดี criteria

    @Column({  unique: true, length: 20, nullable: false })
    semiifm_code: string;                    // รหัสวัตถุดิบ

    @Column({  unique: true, length: 255, nullable: false })
    semiifm_name: string;                    // ชื่อวัตถุดิบ

    @Column('float',{ nullable: true })
    semiifm_width: number;                   // ความกว้างวัตถุดิบ

    @Column({ nullable: true })
    semiifm_width_unitId: number;             // ไอดีหน่วยของ ความกว้าง (อ้างอิง unit_id จาก m_unit)

    @Column('float',{ nullable: true })
    semiifm_length: number;                  // ความยาววัตถุดิบ

    @Column({ nullable: true })
    semiifm_length_unitId: number;          // ไอดีหน่วยของ ความยาว (อ้างอิง unit_id จาก m_unit)

    @Column('float',{ nullable: true })
    semiifm_thickness: number;               // ความหนาวัตถุดิบ

    @Column({ nullable: true })
    semiifm_thickness_unitId: number;       // ไอดีหน่วยของ ความหนา (อ้างอิง unit_id จาก m_unit)

    @Column({ nullable: true })
    semiifm_product_unitId: number;         // ไอดีหน่วยของ สินค้า (อ้างอิง unit_id จาก m_unit)

    @Column({ default: true, nullable: false })
    semiifm_is_active: boolean;              // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

}