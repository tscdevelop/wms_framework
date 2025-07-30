export class ZnDropdownModel {
    value: number; 
    text: string;

    constructor(zn_id: number,zn_name: string) {
        this.value = zn_id;
        this.text = zn_name;
    }
}
