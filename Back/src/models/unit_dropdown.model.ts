export class UnitDropdownModel {
    value: number; 
    text: string;

    constructor(unit_id: number, unit_abbr_th: string) {
        this.value = unit_id;
        this.text = unit_abbr_th;
    }
}