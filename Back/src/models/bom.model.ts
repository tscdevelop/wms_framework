// import { m_bom } from "../entities/m_bom.entity";

// export class BomModel extends m_bom{}


import { m_bom } from "../entities/m_bom.entity";
import { m_bom_items } from "../entities/m_bom_items.entity";

export class BomModel extends m_bom {
    // ฟิลด์จาก m_bom_items
    bom_number?: string;                // BOM Number
    fgifm_id?: number;                  // FG list
    bom_quantity?: number;              // Quantity

    // เชื่อมโยงกับรายการ Item (m_bom_items)
    item: Partial<m_bom_items>[] = []; // กำหนดค่าเริ่มต้นให้เป็น Array ว่าง
}


