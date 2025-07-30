import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "s_user_permis_factory" })
export class s_user_permis_factory {
    @PrimaryGeneratedColumn()
    upf_id: number;

    @Column()
    user_id: number; // FK -> s_user

    @Column()
    fty_id: number; // FK -> s_factory
}
