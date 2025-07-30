// SO number dropdown
export class SODropdownModel {
    value: number; 
    text: string;

    constructor(so_id: number,so_code: string) {
        this.value = so_id;
        this.text = so_code;
    }
}

// Bom number dropdown
export class BOMDropdownModel {
    value: number; 
    text: string;

    constructor(bom_id: number,bom_number: string) {
        this.value = bom_id;
        this.text = bom_number;
    }
}
