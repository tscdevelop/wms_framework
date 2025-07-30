export class TspYDropdownModel {
    value: number; 
    text: string;

    constructor(tspyard_id: number, tspyard_code_name: string) {
        this.value = tspyard_id;
        this.text = tspyard_code_name;
    }
}
