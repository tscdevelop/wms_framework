export class BomGroupedModel {
    bom_jobnb: string;
    items: {
        inbfg_code: string;
        bom_id: string;
        bom_code: string;
        bom_details: string;
        inbfg_quantity: string;
    }[];

    constructor(bom_jobnb: string, items: {
        inbfg_code: string;
        bom_id: string;
        bom_code: string;
        bom_details: string;
        inbfg_quantity: string;
    }[]) {
        this.bom_jobnb = bom_jobnb;
        this.items = items;
    }

    static fromRawData(rawData: any[]): BomGroupedModel {
        if (!rawData || rawData.length === 0) {
            throw new Error('No data found to group');
        }

        const bom_jobnb = rawData[0].bom_jobnb; // Assume all rows have the same bom_jobnb
        const items = rawData.map((row) => ({
            inbfg_code: row.inbfg_code,
            bom_id: row.bom_id,
            bom_code: row.bom_code,
            bom_details: row.bom_details,
            inbfg_quantity: row.inbfg_quantity,
        }));

        return new BomGroupedModel(bom_jobnb, items);
    }
}
