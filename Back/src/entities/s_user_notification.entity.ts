import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';
import { NotifStatus} from '../common/global.enum';

@Entity('s_user_notification')
export class s_user_notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number; // FK -> s_user

    @Column()
    notif_id: number; // FK -> m_notifications

    @Column({ type: 'enum', enum: NotifStatus, default: NotifStatus.UNREAD })
    notif_status: NotifStatus;
}