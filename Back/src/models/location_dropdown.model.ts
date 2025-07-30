export class LocDropdownModel {
    value: number; 
    text: string;

    constructor(loc_id: number,loc_name: string) {
        this.value = loc_id;
        this.text = loc_name;
    }
}