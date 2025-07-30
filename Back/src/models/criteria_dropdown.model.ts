export class CrtDropdownModel {
    value: number; 
    text: string;

    constructor(crt_id: number, crt_name: string) {
        this.value = crt_id;
        this.text = crt_name;
    }
}
