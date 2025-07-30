// Model สำหรับข้อมูลย่อย (Items)
export class InbtlCodeGroup {
    outbtlitm_id: number;
    inbtl_id: string;
    inbtl_name: string;
    outbtlitm_remark: string;
    outbtlitm_img: string;
    outbtlitm_img_url: string;
    tlifm_code_name: string;
    tlifm_code: string;
    tlifm_name: string;
}

// Model สำหรับข้อมูลหลัก (Header)
export class OutbToolingGroupedModel {
    outbtl_code: string;
    outbtl_details: string;
    outbtl_issued_by: string;
    outbtl_returned_by: string;
    inbtlCodes: InbtlCodeGroup[];

    // ฟังก์ชันแปลงข้อมูลจาก rawData ให้เป็น Model ที่จัดกลุ่มแล้ว
    static fromRawData(rawData: any[]): OutbToolingGroupedModel {
        if (!rawData || rawData.length === 0) {
            throw new Error('Raw data is empty or invalid');
        }

        // ข้อมูลหลัก (Header)
        const mainData = {
            outbtl_code: rawData[0].outbtl_code,
            outbtl_details: rawData[0].outbtl_details,
            outbtl_issued_by: rawData[0].outbtl_issued_by,
            outbtl_returned_by: rawData[0].outbtl_returned_by,
        };

        // ข้อมูลย่อย (Items)
        const inbtlCodes = rawData.map((row) => ({
            outbtlitm_id: row.outbtlitm_id,
            inbtl_id: row.inbtl_id,
            inbtl_name: row.inbtl_name,
            outbtlitm_remark: row.outbtlitm_remark,
            outbtlitm_img: row.outbtlitm_img,
            outbtlitm_img_url: row.outbtlitm_img_url,
            tlifm_code_name: row.tlifm_code_name,
            tlifm_code: row.tlifm_code,
            tlifm_name: row.tlifm_name,
        }));

        // รวมข้อมูล Header และ Items
        return { ...mainData, inbtlCodes } as OutbToolingGroupedModel;
    }
}
