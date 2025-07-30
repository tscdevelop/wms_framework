// import { m_outb_raw_material } from "../entities/m_outb_raw_material.entity";
// import { m_outb_raw_material_items } from "../entities/m_outb_raw_material_items.entity";

// export class OutbRawMaterialModel extends m_outb_raw_material {
//     inbrm_id?: number;                  // ใช้ inbrm_id แทน inbrm_bom และ rmifm_id
//     outbrmitm_quantity?: number;        // จำนวนที่ต้องการเบิก
//     outbrmitm_issued_count?: number;    // จำนวนครั้งที่เบิก
//     outbrmitm_withdr_status?: string;   // สถานะการเบิก เช่น ยังไม่ได้เบิก, เบิกแล้ว, เบิกไม่ครบ

//     // เชื่อมโยงกับรายการ Item (ใช้ inbrm_id เป็น FK หลัก)
//     item: Partial<Pick<m_outb_raw_material_items, 'inbrm_id' | 'outbrmitm_quantity'>>[] = []; 
// }


import { m_outb_raw_material } from "../entities/m_outb_raw_material.entity";

export class OutbRawMaterialModel extends m_outb_raw_material {
    items: {
        outbrmitm_id?: number;
        outbrm_id?: number;
        inbrm_id: number;
        outbrmitm_quantity: number;
    }[] = []; // ✅ กำหนดค่าเริ่มต้นเป็น []
}
