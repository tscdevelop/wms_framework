import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('m_inb_raw_material')
export class m_inb_raw_material {

    // PK
    @PrimaryGeneratedColumn()
    inbrm_id: number;                       // ไอดี Raw Material (Inbound)

    @Column({ length: 20, unique: true, nullable: false })
    inbrm_code: string;                     // รหัส Raw Material (Inbound)

    // FK -> m_raw_material_ifm
    @Column({ nullable: false })
    rmifm_id: number;                       // ไอดี rm list

    @Column({ default: false, nullable: false })
    inbrm_is_bom_used: boolean;             // สถานะการใช้ bom (true:ใช้ bom,false:ไม่ใช้ bom)
    
    @Column({ length: 100, nullable: true })
    inbrm_bom: string;                      // Job number

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

    @Column({ length: 100, nullable: true })
    inbrm_grade: string;                  // Grade

    @Column({ length: 100, nullable: true })
    inbrm_lot: string;                    // Lot

    @Column({ nullable: true })
    inbrm_quantity: number;               // จำนวน

    @Column({ length: 300, nullable: true })
    inbrm_remark: string;                   // remark

    // FK -> m_supplier
    @Column({ nullable: true })
    sup_id: number;                         // ไอดี supplier

    @Column({ default: true, nullable: false })
    inbrm_is_active: boolean;             // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                  // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                  // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                  // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                   // ผู้แก้ไขข้อมูล
}
