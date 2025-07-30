export class OutbToolingGroupedReqModel {
    outbtl_id: number;
    outbtl_code: string;
    today_date_time: string;
    today_date: string;
    withdr_date: string;
    outbtl_details: string;
    outbtl_issued_by: string;
    items: {
        outbtlitm_id: number;
        inbtl_id: number;
        inbtl_code: string;
        tlifm_name: string;
        wh_name: string;
        zn_name: string;
        loc_name: string;
        outbtlitm_quantity: number;
    }[];

    // ฟังก์ชันสำหรับจัดรูปแบบข้อมูล
    static fromRawData(rawData: any[]): OutbToolingGroupedReqModel {
        if (!rawData || rawData.length === 0) {
            throw new Error('No data available to process.');
        }

        // ข้อมูลหลัก (Header)
        const mainData = {
            outbtl_id: rawData[0].outbtl_id,
            outbtl_code: rawData[0].outbtl_code,
            today_date_time: rawData[0].today_date_time,
            today_date: rawData[0].today_date,
            withdr_date: rawData[0].withdr_date,
            outbtl_details: rawData[0].outbtl_details,
            outbtl_issued_by: rawData[0].outbtl_issued_by,
        };

        // ข้อมูลย่อย (Items)
        const items = rawData.map((row) => ({
            outbtlitm_id: row.outbtlitm_id,
            inbtl_id: row.inbtl_id,
            inbtl_code: row.inbtl_code,
            tlifm_name: row.tlifm_name,
            wh_name: row.wh_name,
            zn_name: row.zn_name,
            loc_name: row.loc_name,
            outbtlitm_quantity: row.outbtlitm_quantity
        }));

        // รวมข้อมูลหลักและข้อมูลย่อย
        return { ...mainData, items } as OutbToolingGroupedReqModel;
    }
}
