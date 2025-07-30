import { Entity, Column, PrimaryGeneratedColumn, AfterInsert } from 'typeorm';
import { NotifType, NotiLevel } from '../common/global.enum';
import { getIO } from '../services/socket.service'; // ✅ เปลี่ยนจาก import io เป็น getIO

@Entity('m_notifications')
export class m_notifications {
    @PrimaryGeneratedColumn()
    notif_id: number;

    @Column({ type: 'enum', enum: NotifType, nullable: false })
    notif_type: NotifType;

    @Column({ type: 'varchar', length: 30, nullable: false })
    reference_type: string;

    @Column({ type: 'int', nullable: false })
    reference_id: number;

    @Column({ type: 'enum', enum: NotiLevel, nullable: true })
    alert_level: NotiLevel;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;

    @Column({ length: 30, nullable: false, default: "system" })
    create_by: string;

    // ✅ 📌 เมื่อมีการ INSERT แจ้งเตือนใหม่ ให้ส่งไปที่ WebSocket ทันที
    @AfterInsert()
    notifyWebSocket() {
        const io = getIO(); // ✅ เรียกผ่าน getIO
        io.emit("new-notification", {
            notif_type: this.notif_type,
            reference_type: this.reference_type,
            create_date: this.create_date
        });
        console.log(`📢 New Notification: ${this.notif_type}`);
    }

}
