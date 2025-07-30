import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('m_outb_tooling_items')
export class m_outb_tooling_items {

    // PK
    @PrimaryGeneratedColumn()
    outbtlitm_id: number;                    // ไอดีรายการย่อยใบเบิก Tooling (Outbound)

    //FK --> m_outb_tooling
    @Column({ nullable: false })
    outbtl_id: number;                         // ไอดีใบเบิก Tooling (Outbound)

    @Column({ default: false , nullable: true })
    outbtlitm_is_returned: boolean;           // สถานะการคืนเครื่องมือ เช่น ทำเรื่องคืน

    // FK -> m_inb_tooling
    @Column({ nullable: false })
    inbtl_id: number;                         // ไอดี Tooling (Inbound)

    @Column({ length: 300, nullable: true })
    outbtlitm_remark: string;                 // หมายเหตุใบเบิก Tooling (Inbound)

    @Column({ length: 255, nullable: true })
    outbtlitm_img: string;                   // รูปเครื่องมือ

    @Column({ length: 500, nullable: true })
    outbtlitm_img_url: string;               // url เครื่องมือ

    @Column('float', { nullable: true, default: 1 })
    outbtlitm_quantity: number;             // จำนวนที่เบิกเป็น 1 เสมอ    
}