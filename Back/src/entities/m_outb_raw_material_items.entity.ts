import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { WithdrawStatus } from '../common/global.enum';

@Entity('m_outb_raw_material_items')
export class m_outb_raw_material_items {

    // PK
    @PrimaryGeneratedColumn()
    outbrmitm_id: number; // ไอดี bom item

    // FK --> m_outb_raw_material
    @Column({ nullable: false })
    outbrm_id: number; // FK ไปยัง outbrm (Master Table)

    // FK -> m_inb_raw_material 
    @Column({ nullable: false }) 
    inbrm_id: number;

    @Column('float', { nullable: false })
    outbrmitm_quantity: number; // จำนวน  

    @Column({ type: 'int', default: 0 })
    outbrmitm_issued_count: number; // จำนวนครั้งที่เบิก (สแกน)

    @Column({ type: 'enum', enum: WithdrawStatus, nullable: false, default: WithdrawStatus.PENDING })
    outbrmitm_withdr_status: WithdrawStatus; // สถานะการเบิก เช่น ยังไม่ได้เบิก(PENDING), เบิกแล้ว(COMPLETED) , เบิกไม่ครบ(PARTIAL)
}
