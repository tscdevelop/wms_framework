export class RMIfmDropdownModel {
    value: number; 
    text: string;

    constructor(rmifm_id: number,rmifm_code_name: string) {
        this.value = rmifm_id;
        this.text = rmifm_code_name;
    }
}