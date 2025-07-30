import { m_outb_finished_goods } from "../entities/m_outb_finished_goods.entity";

export class OutbFGModel extends m_outb_finished_goods {
    items: {
        bom_id: number;
        inbfg_id: number;
        outbfgitm_quantity: number;
    }[];
}

export class OutbFGNoBomModel extends m_outb_finished_goods {
    items: {
        outbfgitm_id?: number;
        outbfg_id?: number;
        inbfg_id: number;
        outbfgitm_quantity: number;
    }[];
}
