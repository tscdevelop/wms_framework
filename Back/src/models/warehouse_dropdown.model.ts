export class WhDropdownModel {
    value: number; 
    text: string;

    constructor(wh_id: number, wh_name: string) {
        this.value = wh_id;
        this.text = wh_name;
    }
}
