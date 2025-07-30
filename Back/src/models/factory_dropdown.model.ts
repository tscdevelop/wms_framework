export class FtyDropdownModel {
    value: string; 
    text: string;

    constructor(fty_id: string, fty_name: string) {
        this.value = fty_id; // ใช้ fty_id เป็น value
        this.text = fty_name; // ใช้ fty_name เป็น text
    }
}