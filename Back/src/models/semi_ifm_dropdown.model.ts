export class SemiIfmDropdownModel {
    value: number; 
    text: string;

    constructor(semiifm_id: number,semiifm_code_name: string) {
        this.value = semiifm_id;
        this.text = semiifm_code_name;
    }
}