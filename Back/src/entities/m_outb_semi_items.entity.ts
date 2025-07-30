import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ShipmentStatus, WithdrawStatus } from '../common/global.enum';

@Entity('m_outb_semi_items')
export class m_outb_semi_items {
    @PrimaryGeneratedColumn()
    outbsemiitm_id: number;           // ไอดีรายการย่อย (Primary Key)

    //FK --> m_outb_semi
    @Column({ nullable: false })
    outbsemi_id: number;                // FK ไปยัง outbsemi (Master Table)

    // FK -> m_inb_semi
    @Column({ nullable: false })
    inbsemi_id: number;                 // ไอดี inbound semi

    @Column('float',{ nullable: true })
    outbsemiitm_quantity: number;     // จำนวนที่ต้องการเบิก

    @Column({ type: 'int', default: 0 })
    outbsemiitm_withdr_count: number;    // จำนวนครั้งการเบิกที่สแกน (จำนวนที่รับจริง)

    @Column({ type: 'enum', enum: WithdrawStatus, nullable: false, default: WithdrawStatus.PENDING })
    outbsemiitm_withdr_status: WithdrawStatus;    // สถานะการเบิก เช่น ยังไม่ได้เบิก(PENDING), เบิกแล้ว(COMPLETED) , เบิกไม่ครบ(PARTIAL)

    @Column({ type: 'int', default: 0 })
    outbsemiitm_shipmt_count: number;   // จำนวนครั้งการจัดส่งที่สแกน (จำนวนที่รับจริง)

    @Column({ type: 'enum', enum: ShipmentStatus, nullable: false, default: ShipmentStatus.PENDING })
    outbsemiitm_shipmt_status: ShipmentStatus;    // สถานะการเบิก เช่น รอจัดส่ง(PENDING), ส่งสำเร็จ(COMPLETED) , ส่งไม่ครบ(PARTIAL)
}