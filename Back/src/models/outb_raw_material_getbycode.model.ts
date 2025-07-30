// JobGroup class
export class JobGroup {
    inbrm_jobnb: string;
    inbrmCodes: Array<{
        inbrm_code: string;
        outbrm_quantity: number;
        outbrm_quantity_unitId: number;
        outbrm_id: number;
        inbrm_name: string;
        inbrm_quantity: number;
        outbrm_scan_count: number;
    }>;

    constructor(inbrm_jobnb: string) {
        this.inbrm_jobnb = inbrm_jobnb;
        this.inbrmCodes = [];
    }

    addInbrmCode(inbrm_code: string, outbrm_quantity: number, outbrm_quantity_unitId: number, outbrm_id: number, inbrm_name: string, inbrm_quantity: number, outbrm_scan_count: number) {
        this.inbrmCodes.push({ inbrm_code, outbrm_quantity, outbrm_quantity_unitId, outbrm_id, inbrm_name, inbrm_quantity, outbrm_scan_count });
    }
}

// OutbRawMaterialGroupedModel class
export class OutbRawMaterialGroupedModel {
    outbrm_code: string;
    outbrm_details: string;
    jobGroups: JobGroup[];

    constructor(outbrm_code: string, outbrm_details: string) {
        this.outbrm_code = outbrm_code;
        this.outbrm_details = outbrm_details;
        this.jobGroups = [];
    }

    static fromRawData(rawData: any[]): OutbRawMaterialGroupedModel {
        if (!rawData || rawData.length === 0) {
            throw new Error('Raw data is empty or invalid');
        }

        // สร้าง instance สำหรับ OutbRawMaterialGroupedModel
        const groupedModel = new OutbRawMaterialGroupedModel(
            rawData[0].outbrm_code,
            rawData[0].outbrm_details
        );

        // จัดกลุ่มข้อมูลตาม inbrm_jobnb
        rawData.forEach(record => {
            const {
                inbrm_jobnb,
                inbrm_code,
                outbrm_quantity,
                outbrm_quantity_unitId,
                outbrm_id,
                inbrm_name,
                inbrm_quantity,
                outbrm_scan_count,
            } = record;

            groupedModel.addJobGroup(inbrm_jobnb, inbrm_code, outbrm_quantity, outbrm_quantity_unitId, outbrm_id, inbrm_name, inbrm_quantity, outbrm_scan_count);
        });

        return groupedModel;
    }

    addJobGroup(inbrm_jobnb: string, inbrm_code: string, outbrm_quantity: number, outbrm_quantity_unitId: number, outbrm_id: number, inbrm_name: string, inbrm_quantity: number, outbrm_scan_count: number) {
        let jobGroup = this.jobGroups.find(group => group.inbrm_jobnb === inbrm_jobnb);

        if (!jobGroup) {
            jobGroup = new JobGroup(inbrm_jobnb);
            this.jobGroups.push(jobGroup);
        }

        jobGroup.addInbrmCode(inbrm_code, outbrm_quantity, outbrm_quantity_unitId, outbrm_id, inbrm_name, inbrm_quantity, outbrm_scan_count);
    }
}
