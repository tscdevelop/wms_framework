export interface BomDetailsModel {
    bom_id: number;
    fgifm_id: number;
    bom_quantity: number;
}

export interface BomItemModel {
    bom_number: string;
    bom: BomDetailsModel[];
}

export interface BomModel {
    so_id: number;
    so_code: string;
    so_cust_name: string;
    so_details: string;
    item: BomItemModel[];
}


// Class สำหรับจัดรูปแบบข้อมูล
export class BomGroupById {
    static formatData(rawData: any, rawItems: any[]): BomModel {
        const groupedItems: Record<string, BomDetailsModel[]> = rawItems.reduce((acc, item) => {
            const bomNumber = item.item_bom_number;
    
            if (!acc[bomNumber]) {
                acc[bomNumber] = [];
            }
    
            acc[bomNumber].push({
                bom_id: item.item_bom_id,
                fgifm_id: item.item_fgifm_id,
                bom_quantity: item.item_bom_quantity,
            });
    
            return acc;
        }, {} as Record<string, BomDetailsModel[]>);
    
        return {
            so_id: rawData.bom_so_id,
            so_code: rawData.bom_so_code,
            so_cust_name: rawData.bom_so_cust_name,
            so_details: rawData.bom_so_details,
            item: Object.entries(groupedItems).map(([bom_number, bom]) => ({
                bom_number,
                bom,
            })),
        };
    }
    
    
}
