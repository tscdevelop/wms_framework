import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('m_inb_finished_goods')
export class m_inb_finished_goods {

    // PK
    @PrimaryGeneratedColumn()
    inbfg_id: number;                     // ไอดี Finished Goods (Inbound)

    @Column({ length: 20, nullable: false })
    inbfg_code: string;                   // รหัส Finished Goods (Inbound)

    // FK -> m_finished_goods_ifm
    @Column({nullable: true})
    fgifm_id: number;                      // ไอดีรายการสินค้าสำเร็จรูป

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

    // FK -> m_supplier
    @Column({ nullable: true })
    sup_id: number;                         // ไอดี supplier

    @Column({ length: 100, nullable: true })
    inbfg_grade: string;                  // Grade

    @Column({ length: 100, nullable: true })
    inbfg_lot: string;                    // Lot

    @Column({ nullable: true })
    inbfg_quantity: number;               // จำนวน

    @Column({ length: 300, nullable: true })
    inbfg_remark: string;                 // หมายเหตุ

    @Column({ length: 50, nullable: true })
    inbfg_color: string;                  // สี

    @Column({ default: true, nullable: false })
    inbfg_is_active: boolean;             // สถานะการใช้งาน (true:ใช้งาน,false:ไม่ใช้งาน)

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;                    // วันที่สร้างข้อมูล

    @Column({ length: 30,  nullable: false, default: "system" })
    create_by: string;                    // ผู้สร้างข้อมูล

    @Column({ type: "timestamp", nullable: true, default: () => null })
    update_date: Date;                    // วันที่แก้ไขข้อมูล

    @Column({ length: 30, nullable: true })
    update_by: string                     // ผู้แก้ไขข้อมูล
}