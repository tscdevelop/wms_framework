// ✅ แปลงค่าสถานะการอนุมัติ
export const mapApprovalStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'PENDING': 'รออนุมัติ',
        'APPROVED': 'อนุมัติสำเร็จ',
        'REJECTED': 'ไม่อนุมัติ'
    };
    return statusMap[status] || status; // ถ้าไม่มีใน map ให้ใช้ค่าดั้งเดิม
};

// ✅ แปลงค่าสถานะการเบิก
export const mapWithdrawStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'COMPLETED': 'เบิกสำเร็จ',
        'PARTIAL': 'เบิกไม่ครบ',
        'PENDING': 'ยังไม่ได้เบิก'
    };
    return statusMap[status] || status; // ถ้าไม่มีใน map ให้ใช้ค่าดั้งเดิม
};

// ✅ แปลงค่าสถานะการส่ง
export const mapShipmentStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'COMPLETED': 'ส่งสำเร็จ',
        'PARTIAL': 'ส่งไม่ครบ',
        'PENDING': 'ยังไม่ได้ส่ง'
    };
    return statusMap[status] || status; // ถ้าไม่มีใน map ให้ใช้ค่าดั้งเดิม
};

// ✅ แปลงค่าสถานะการคืนของ
export const mapReturnStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'RETURNED': 'คืนสำเร็จ',
        'PARTIAL_RETURNED': 'คืนไม่ครบ',
        'NOT_RETURNED': 'ยังไม่ได้คืน'
    };
    return statusMap[status] || status; // ถ้าไม่มีใน map ให้ใช้ค่าดั้งเดิม
};