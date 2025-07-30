export class FGIfmDropdownModel {
    value: number; 
    text: string;

    constructor(fgifm_id: number,fgifm_code_name: string) {
        this.value = fgifm_id;
        this.text = fgifm_code_name;
    }
}