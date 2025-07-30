// Model สำหรับข้อมูลย่อย (Items)
export class OutbSemiItemGroup {
    outbsemiitm_id: number;
    inbsemi_id: number;
    outbsemiitm_quantity: number;
    inbsemi_quantity: number;
    inbsemi_code: string;
    semiifm_name: string;
    remaining_quantity: number;
}

// Model สำหรับข้อมูลหลัก (Header)
export class OutbSemiGroupedModel {
    outbsemi_id: number;
    outbsemi_code: string;
    outbsemi_details: string;
    outbsemi_so: string;
    outbsemi_remark: string;
    outbsemi_driver_name: string;
    outbsemi_vehicle_license: string;
    outbsemi_phone: string;
    outbsemi_address: string;
    outbsemi_is_returned: boolean;
    tspyard_id: number;
    tspyard_name: string;
    outbsemi_is_active: boolean;
    create_date: Date;
    create_by: string;
    update_date?: Date | null;
    update_by?: string | null;
    items: OutbSemiItemGroup[];

    // ฟังก์ชันแปลงข้อมูลจาก rawData ให้เป็น Model ที่จัดกลุ่มแล้ว
    static fromRawData(rawData: any[]): OutbSemiGroupedModel {
        if (!rawData || rawData.length === 0) {
            throw new Error('Raw data is empty or invalid');
        }

        // ข้อมูลหลัก (Header)
        const mainData = {
            outbsemi_id: rawData[0].outbsemi_id,
            outbsemi_code: rawData[0].outbsemi_code,
            outbsemi_details: rawData[0].outbsemi_details,
            outbsemi_so: rawData[0].outbsemi_so,
            outbsemi_remark: rawData[0].outbsemi_remark,
            outbsemi_driver_name: rawData[0].outbsemi_driver_name,
            outbsemi_vehicle_license: rawData[0].outbsemi_vehicle_license,
            outbsemi_phone: rawData[0].outbsemi_phone,
            outbsemi_address: rawData[0].outbsemi_address,
            outbsemi_is_returned: rawData[0].outbsemi_is_returned,
            tspyard_id: rawData[0].tspyard_id,
            tspyard_name: rawData[0].tspyard_name,
            outbsemi_is_active: rawData[0].outbsemi_is_active,
            create_date: rawData[0].create_date,
            create_by: rawData[0].create_by,
            update_date: rawData[0].update_date,
            update_by: rawData[0].update_by,
        };

        // ข้อมูลย่อย (Items)
        const items = rawData.map(row => ({
            outbsemiitm_id: row.outbsemiitm_id,
            inbsemi_id: row.inbsemi_id,
            outbsemiitm_quantity: row.outbsemiitm_quantity,
            inbsemi_quantity: row.inbsemi_quantity,
            inbsemi_code: row.inbsemi_code,
            semiifm_name: row.semiifm_name,
            remaining_quantity: row.remaining_quantity
        }));

        // รวมข้อมูล Header และ Items
        return { ...mainData, items } as OutbSemiGroupedModel;
    }
}
