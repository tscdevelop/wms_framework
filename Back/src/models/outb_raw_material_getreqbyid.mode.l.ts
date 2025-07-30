export class OutbRawMaterialReqModel {
    outbrm_id: number;
    outbrm_code: string;
    today_date_time: string;
    today_date: string;
    withdr_date: string;
    outbrm_details: string;
    items: {
        outbrmitm_id: number;
        inbrm_id: number;
        inbrm_code: string;
        rmifm_name: string;
        rmifm_width: string;
        rmifm_length: string;
        rmifm_weight: string;
        rmifm_thickness: string;
        unit_abbr_th: string;
        wh_name: string;
        zn_name: string;
        outbrmitm_quantity: number;
        outbrmitm_issued_count: number;
        outbrmitm_withdr_status: string;
    }[];

    // ฟังก์ชันสำหรับจัดรูปแบบข้อมูล
    static fromRawData(rawData: any[]): OutbRawMaterialReqModel {
        if (!rawData || rawData.length === 0) {
            throw new Error('No data available to process.');
        }

        // ข้อมูลหลัก (Header)
        const mainData = {
            outbrm_id: rawData[0].outbrm_id,
            outbrm_code: rawData[0].outbrm_code,
            today_date_time: rawData[0].today_date_time,
            today_date: rawData[0].today_date,
            withdr_date: rawData[0].withdr_date,
            outbrm_details: rawData[0].outbrm_details,
        };

        // ข้อมูลย่อย (Items)
        const items = rawData.map((row) => ({
            outbrmitm_id: row.outbrmitm_id,
            inbrm_id: row.inbrm_id,
            inbrm_code: row.inbrm_code,
            rmifm_name: row.rmifm_name,
            rmifm_width: row.rmifm_width,
            rmifm_length: row.rmifm_length,
            rmifm_weight: row.rmifm_weight,
            rmifm_thickness: row.rmifm_thickness,
            unit_abbr_th: row.unit_abbr_th,
            wh_name: row.wh_name,
            zn_name: row.zn_name,
            outbrmitm_quantity: row.outbrmitm_quantity,
            outbrmitm_issued_count: row.outbrmitm_issued_count,
            outbrmitm_withdr_status: row.outbrmitm_withdr_status,
        }));

        // รวมข้อมูลหลักและข้อมูลย่อย
        return { ...mainData, items } as OutbRawMaterialReqModel;
    }
}
