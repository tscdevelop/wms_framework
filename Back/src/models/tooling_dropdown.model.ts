export class TLDropdownModel {
    value: number; 
    text: string;

    constructor(tl_id: number, tl_type: string) {
        this.value = tl_id;
        this.text = tl_type;
    }
}