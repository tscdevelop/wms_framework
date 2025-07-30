import { m_outb_tooling } from "../entities/m_outb_tooling.entity";

export class OutbToolingModel extends m_outb_tooling {
    items?: {
        outbtlitm_id?: number;
        outbtl_id?: number;
        inbtl_id: number;
    }[] = []; // ✅ กำหนดค่าเริ่มต้นเป็น []
}
