import { m_outb_semi } from "../entities/m_outb_semi.entity";

export class OutbSemiModel extends m_outb_semi {
    items: {
        outbsemiitm_id?: number;
        outbsemi_id?: number;
        inbsemi_id: number;
        outbsemiitm_quantity: number;
    }[] = []; // ✅ กำหนดค่าเริ่มต้นเป็น []
}
