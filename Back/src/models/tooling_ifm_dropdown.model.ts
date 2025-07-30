export class TLIfmDropdownModel {
    value: number; 
    text: string;

    constructor(tlifm_id: number,tlifm_code_name: string) {
        this.value = tlifm_id;
        this.text = tlifm_code_name;
    }
}