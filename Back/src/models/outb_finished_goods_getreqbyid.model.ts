export class OutbFinishedGoodsReqModel {
    outbfg_id: number;
    outbfg_code: string;
    shipmt_date_time: string;
    today_date_time: string;
    today_date: string;
    withdr_date: string;
    shipmt_date: string;
    so_code: string;
    outbfg_details: string;
    outbfg_driver_name: string;
    outbfg_vehicle_license: string;
    outbfg_phone: string;
    outbfg_address: string;
    outbfg_remark: string;
    tspyard_id: number;
    tspyard_name: string;
    items: {
        outbfgitm_id: number;
        inbfg_id: number;
        inbfg_code: string;
        inbfg_color: string;
        fgifm_id: number;
        fgifm_name: string;
        fgifm_width: string;
        fgifm_length: string;
        fgifm_thickness: string;
        unit_abbr_th: string;
        fty_name: string;
        wh_name: string;
        zn_name: string;
        outbfgitm_quantity: number;
        outbfgitm_withdr_count: number;
        outbfgitm_withdr_status: string;
        outbfgitm_shipmt_count: number;
        outbfgitm_shipmt_status: string;
    }[];

    // ฟังก์ชันสำหรับจัดรูปแบบข้อมูล
    static fromRawData(rawData: any[]): OutbFinishedGoodsReqModel {
        if (!rawData || rawData.length === 0) {
            throw new Error('No data available to process.');
        }

        // ข้อมูลหลัก (Header)
        const mainData = {
            outbfg_id: rawData[0].outbfg_id,
            outbfg_code: rawData[0].outbfg_code,
            today_date_time: rawData[0].today_date_time,
            today_date: rawData[0].today_date,
            withdr_date: rawData[0].withdr_date,
            shipmt_date: rawData[0].shipmt_date,
            so_code: rawData[0].so_code,
            outbfg_details: rawData[0].outbfg_details,
            outbfg_driver_name: rawData[0].outbfg_driver_name,
            outbfg_vehicle_license: rawData[0].outbfg_vehicle_license,
            outbfg_phone: rawData[0].outbfg_phone,
            outbfg_address: rawData[0].outbfg_address,
            outbfg_remark: rawData[0].outbfg_remark,
            tspyard_id: rawData[0].tspyard_id,
            tspyard_name: rawData[0].tspyard_name,
        };

        // ข้อมูลย่อย (Items)
        const items = rawData.map((row) => ({
            outbfgitm_id: row.outbfgitm_id,
            inbfg_id: row.inbfg_id,
            inbfg_code: row.inbfg_code,
            inbfg_color: row.inbfg_color,
            fgifm_id: row.fgifm_id,
            fgifm_name: row.fgifm_name,
            fgifm_width: row.fgifm_width,
            fgifm_length: row.fgifm_length,
            fgifm_thickness: row.fgifm_thickness,
            unit_abbr_th: row.unit_abbr_th,
            fty_name: row.fty_name,
            wh_name: row.wh_name,
            zn_name: row.zn_name,
            outbfgitm_quantity: row.outbfgitm_quantity,
            outbfgitm_withdr_count: row.outbfgitm_withdr_count,
            outbfgitm_withdr_status: row.outbfgitm_withdr_status,
            outbfgitm_shipmt_count: row.outbfgitm_shipmt_count,
            outbfgitm_shipmt_status: row.outbfgitm_shipmt_status
        }));

        // รวมข้อมูลหลักและข้อมูลย่อย
        return { ...mainData, items } as OutbFinishedGoodsReqModel;
    }
}
