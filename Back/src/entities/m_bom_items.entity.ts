import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { WithdrawStatus } from '../common/global.enum';

@Entity('m_bom_items')
export class m_bom_items {

    // PK
    @PrimaryGeneratedColumn()
    bom_id: number;                        // ไอดี bom

    @Column({ length: 100, nullable: false })
    bom_number: string;                    // bome number

    // FK -> m_bom
    @Column({ nullable: false })
    so_id: number;                         // ไอดี SO.

    // FK -> m_finished_goods_ifm
    @Column({ nullable: false })
    fgifm_id: number;                       // ไอดีรายการ FG เก็บรหัสและชื่อ

    @Column({ nullable: false })
    bom_quantity: number;                   // จำนวนที่ต้องการเพิ่ม
}