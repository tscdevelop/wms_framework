export class InbsemiDropdownModel {
    value: string;
    text: string;

    constructor(inbsemi_id: string, inbsemi_code: string, semiifm_name: string) {
        this.value = inbsemi_id;
        this.text = `${inbsemi_code} ${semiifm_name}`.trim();
    }
}