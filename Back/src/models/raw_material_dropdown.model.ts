export class RMDropdownModel {
    value: number; 
    text: string;

    constructor(rm_id: number, rm_type: string) {
        this.value = rm_id;
        this.text = rm_type;
    }
}