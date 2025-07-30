export class InbfgDropdownModel {
    value: string; 
    text: string;

    constructor(inbfg_id: string, inbfg_code: string, fgifm_name: string) {
        this.value = inbfg_id;
        this.text = `${inbfg_code} ${fgifm_name}`.trim();
    }
}