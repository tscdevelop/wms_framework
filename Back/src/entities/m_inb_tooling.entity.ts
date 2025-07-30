import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('m_inb_tooling')
export class m_inb_tooling {

    // PK
    @PrimaryGeneratedColumn()
    inbtl_id: number;                     // ไอดี Tooling (Inbound)

    @Column({ length: 20, nullable: false })
    inbtl_code: string;                   // รหัส Tooling (Inbound)
    
    // FK -> m_tooling_ifm
    @Column({ nullable: false })
    tlifm_id: number;                       // ไอดี tooling list

    // FK -> m_factory
    @Column({nullable: true})
    fty_id: number;                        // ไอดีโรงงาน

    // FK -> m_warehouse
    @Column({nullable: true})
    wh_id: number;                         // ไอดีคลังสินค้า

    // FK -> m_zone
    @Column({nullable: true})
    zn_id: number;                         // ไอดีโซนในคลังสินค้า

    // FK -> m_location
    @Column({nullable: true})
    loc_id: number;                        // ไอดีตำแหน่งที่ตั้ง

    @Column({ length: 300, nullable: true })
    inbtl_remark: string;                   // หมายเหตุ

    // FK -> m_supplier
    @Column({ nullable: true })
    sup_id: number;                         // ไอดี supplier

    @Column({ default: true, nullable: false })
    inbtl_is_active: boolean;             // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                   // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                   // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                   // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                    // ผู้แก้ไขข้อมูล

    @Column('float', { nullable: true, default: 1 })
    inbtl_quantity: number;              // จำนวนคงเหลือ

}