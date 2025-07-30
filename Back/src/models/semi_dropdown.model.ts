export class SemiDropdownModel {
    value: number; 
    text: string;

    constructor(semi_id: number, semi_type: string) {
        this.value = semi_id;
        this.text = semi_type;
    }
}