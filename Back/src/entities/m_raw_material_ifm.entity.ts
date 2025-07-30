import { Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "m_raw_material_ifm" })
export class m_raw_material_ifm {

    // PK
    @PrimaryGeneratedColumn()
    rmifm_id: number;                      // ไอดีวัตถุดิบ

    // FK -> m_raw_material
    @Column({nullable: true})
    rm_id: number;                          // ไอดี rm type

    // FK -> m_criteria
    @Column({nullable: true})
    crt_id: number;                         // ไอดี criteria

    @Column({  unique: true, length: 20, nullable: false })
    rmifm_code: string;                    // รหัสวัตถุดิบ

    @Column({  unique: true, length: 255, nullable: false })
    rmifm_name: string;                    // ชื่อวัตถุดิบ

    @Column('float',{ nullable: true })
    rmifm_width: number;                   // ความกว้างวัตถุดิบ

    @Column({ nullable: true })
    rmifm_width_unitId: number;             // ไอดีหน่วยของ ความกว้าง (อ้างอิง unit_id จาก m_unit)

    @Column('float',{ nullable: true })
    rmifm_length: number;                  // ความยาววัตถุดิบ

    @Column({ nullable: true })
    rmifm_length_unitId: number;          // ไอดีหน่วยของ ความยาว (อ้างอิง unit_id จาก m_unit)

    @Column('float',{ nullable: true })
    rmifm_thickness: number;               // ความหนาวัตถุดิบ

    @Column({ nullable: true })
    rmifm_thickness_unitId: number;       // ไอดีหน่วยของ ความหนา (อ้างอิง unit_id จาก m_unit)

    @Column('float',{ nullable: true })
    rmifm_weight: number;                  // น้ำหนักต่อหน่วย

    @Column({ nullable: true })
    rmifm_weight_unitId: number;          // ไอดีหน่วยของ น้ำหนัก (อ้างอิง unit_id จาก m_unit)

    @Column({ nullable: true })
    rmifm_product_unitId: number;         // ไอดีหน่วยของ สินค้า (อ้างอิง unit_id จาก m_unit)

    @Column({ default: true, nullable: false })
    rmifm_is_active: boolean;              // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล

}