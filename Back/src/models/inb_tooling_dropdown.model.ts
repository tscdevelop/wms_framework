export class InbtlDropdownModel {
    value: string; 
    text: string;

    constructor(inbtl_id: string, inbtl_code: string, tlifm_name: string) {
        this.value = inbtl_id;
        this.text = `${inbtl_code} ${tlifm_name}`.trim();
    }
}