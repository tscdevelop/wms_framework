import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "s_user_permis_warehouse" })
export class s_user_permis_warehouse {
    @PrimaryGeneratedColumn()
    upw_id: number; // Primary Key

    @Column()
    upf_id: number; // FK → s_user_permis_factory

    @Column()
    wh_id: number; // FK → m_warehouse (อ้างอิงคลังสินค้า)
}
