// utils/notification.utils.ts
import { NotifType } from '../common/global.enum';
import { s_user } from '../entities/s_user.entity';
import { EntityManager, Repository } from 'typeorm';

export async function getUsersToNotify(
    notif_type: NotifType,
    userRepo: Repository<s_user>,
    manager?: EntityManager
    ): Promise<number[]> {
    // 🔧 กำหนด role ที่ควรเห็นแจ้งเตือนตาม notif_type
    let allowedRoles: string[] = [];

    switch (notif_type) {
        case NotifType.REQUEST_APPROVAL:
        allowedRoles = ['MANAGER', 'OWNER'];
        break;
        case NotifType.SHELF_LIFE:
        case NotifType.MINIMUM_STOCK:
        case NotifType.TOOL_WITHDRAWAL:
        allowedRoles = ['OWNER', 'OFFICER_PC', 'MANAGER'];
        break;
        // เพิ่ม case ตาม notif_type อื่นได้ที่นี่
        default:
        allowedRoles = []; // ไม่มี role ได้รับ noti นี้
    }

    if (!allowedRoles.length) return [];

    const repo = manager?.getRepository(s_user) ?? userRepo;

    const users = await repo
        .createQueryBuilder('user')
        .select(['user.user_id'])
        .where('user.role_code IN (:...roles)', { roles: allowedRoles })
        .getMany();

    return users.map((u) => u.user_id);
}
