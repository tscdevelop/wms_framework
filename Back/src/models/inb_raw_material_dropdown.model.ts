export class InbrmDropdownModel {
    value: string;
    text: string;

    constructor(inbrm_id: string, inbrm_code: string, rmifm_name: string) {
        this.value = inbrm_id;
        this.text = `${inbrm_code} ${rmifm_name}`.trim(); // ✅ ป้องกันช่องว่างเกินถ้า rmifm_name เป็น ""
    }
}