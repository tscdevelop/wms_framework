export class FGDropdownModel {
    value: number; 
    text: string;

    constructor(fg_id: number,fg_type: string) {
        this.value = fg_id;
        this.text = fg_type;
    }
}