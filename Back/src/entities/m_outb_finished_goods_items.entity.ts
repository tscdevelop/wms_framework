import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ShipmentStatus, WithdrawStatus } from '../common/global.enum';

@Entity('m_outb_finished_goods_items')
export class m_outb_finished_goods_items {
    @PrimaryGeneratedColumn()
    outbfgitm_id: number;         // ไอดีรายการย่อย (Primary Key)

    //FK --> m_outb_finished_goods
    @Column({ nullable: false })
    outbfg_id: number;              // FK ไปยัง outbfg (Master Table)

    // FK -> m_bom_items
    @Column({ nullable: true })
    bom_id: number;                 // ไอดี BOM

    // FK -> m_inb_finished_goods
    @Column({ nullable: false })
    inbfg_id: number;             // รหัส inbound FG

    @Column('float',{ nullable: false })
    outbfgitm_quantity: number;   // จำนวนที่ต้องการเบิก

    @Column({ type: 'int', default: 0 })
    outbfgitm_withdr_count: number;    // จำนวนครั้งการเบิกที่สแกน (จำนวนที่รับจริง)

    @Column({ type: 'enum', enum: WithdrawStatus, nullable: false, default: WithdrawStatus.PENDING })
    outbfgitm_withdr_status: WithdrawStatus; // สถานะการเบิก เช่น ยังไม่ได้เบิก(PENDING), เบิกแล้ว(COMPLETED) , เบิกไม่ครบ(PARTIAL)

    @Column({ type: 'int', default: 0 })
    outbfgitm_shipmt_count: number;   // จำนวนครั้งการจัดส่งที่สแกน (จำนวนที่รับจริง)

    @Column({ type: 'enum', enum: ShipmentStatus, nullable: false, default: ShipmentStatus.PENDING })
    outbfgitm_shipmt_status: ShipmentStatus;    // สถานะการเบิก เช่น รอจัดส่ง(PENDING), ส่งสำเร็จ(COMPLETED) , ส่งไม่ครบ(PARTIAL)
}
