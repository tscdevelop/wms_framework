export class SupDropdownModel {
    value: number; 
    text: string;

    constructor(sup_id: number, supplier_code_name: string) {
        this.value = sup_id;
        this.text = supplier_code_name;
    }
}
