export class OutbSemiReqModel {
    outbsemi_id: number;
    outbsemi_code: string;
    today_date_time: string;
    today_date: string;
    withdr_date: string;
    shipmt_date: string;
    outbsemi_details: string;
    outbsemi_driver_name: string;
    outbsemi_vehicle_license: string;
    outbsemi_phone: string;
    outbsemi_address: string;
    outbsemi_so: string;
    tspyard_id: number;
    tspyard_name: string;
    items: {
        outbsemiitm_id: number;
        inbsemi_id: number;
        inbsemi_code: string;
        inbsemi_color: string;
        semiifm_name: string;
        semiifm_width: string;
        semiifm_length: string;
        semiifm_thickness: string;
        wh_name: string;
        zn_name: string;
        unit_abbr_th: string;
        outbsemiitm_quantity: number;
        outbsemiitm_withdr_count: number;
        outbsemiitm_withdr_status: string;
        outbsemiitm_shipmt_count: number;
        outbsemiitm_shipmt_status: string;
    }[];

    // ฟังก์ชันสำหรับจัดรูปแบบข้อมูล
    static fromRawData(rawData: any[]): OutbSemiReqModel {
        if (!rawData || rawData.length === 0) {
            throw new Error('No data available to process.');
        }

        // ข้อมูลหลัก (Header)
        const mainData = {
            outbsemi_id: rawData[0].outbsemi_id,
            outbsemi_code: rawData[0].outbsemi_code,
            today_date_time: rawData[0].today_date_time,
            today_date: rawData[0].today_date,
            withdr_date: rawData[0].withdr_date,
            shipmt_date: rawData[0].shipmt_date,
            outbsemi_details: rawData[0].outbsemi_details,
            outbsemi_driver_name: rawData[0].outbsemi_driver_name,
            outbsemi_vehicle_license: rawData[0].outbsemi_vehicle_license,
            outbsemi_phone: rawData[0].outbsemi_phone,
            outbsemi_address: rawData[0].outbsemi_address,
            outbsemi_so: rawData[0].outbsemi_so,
            tspyard_id: rawData[0].tspyard_id,
            tspyard_name: rawData[0].tspyard_name
        };

        // ข้อมูลย่อย (Items)
        const items = rawData.map((row) => ({
            outbsemiitm_id: row.outbsemiitm_id,
            inbsemi_id: row.inbsemi_id,
            inbsemi_code: row.inbsemi_code,
            inbsemi_color: row.inbsemi_color,
            semiifm_name: row.semiifm_name,
            semiifm_width: row.semiifm_width,
            semiifm_length: row.semiifm_length,
            semiifm_thickness: row.semiifm_thickness,
            wh_name: row.wh_name,
            zn_name: row.zn_name,
            unit_abbr_th: row.unit_abbr_th,
            outbsemiitm_quantity: row.outbsemiitm_quantity,
            outbsemiitm_withdr_count: row.outbsemiitm_withdr_count,
            outbsemiitm_withdr_status: row.outbsemiitm_withdr_status,
            outbsemiitm_shipmt_count: row.outbsemiitm_shipmt_count,
            outbsemiitm_shipmt_status: row.outbsemiitm_shipmt_status,
        }));

        // รวมข้อมูลหลักและข้อมูลย่อย
        return { ...mainData, items } as OutbSemiReqModel;
    }
}
