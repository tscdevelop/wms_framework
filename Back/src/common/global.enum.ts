export enum Language {
    TH = "th",
    EN = "en"
}

export enum LabTestParamDataType {
    STRING = 'STRING',
    JSON = 'JSON',
    NUMBER = 'NUMBER',
    OBJECT = 'OBJECT',
    ARRAY = 'ARRAY',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE',
}

export enum Directories {
    register_image = "dirUploadRigisterImage",
    employee_image = "dirUploadEmployeeImage",
    outbound_tooling_image = "dirUploadOutboundToolingImage",
}

export enum OutbfgShipment {
    SELF_PICKUP = 'SELF_PICKUP',
    DELIVERY = 'DELIVERY'
}

export enum ReturnStatus {
    RETURNED = "RETURNED", // คืนครบ
    PARTIAL_RETURNED = "PARTIAL_RETURNED", // คืนไม่ครบ
    NOT_RETURNED = "NOT_RETURNED" // ไม่คืน
}

// Enum สำหรับสถานะการอนุมัติ
export enum ApprovalStatus {
    PENDING = "PENDING",  // รออนุมัติ
    APPROVED = "APPROVED", // อนุมัติสำเร็จ
    REJECTED = "REJECTED"  // ไม่อนุมัติ
}

export enum WithdrawStatus {
    // COMPLETED = "เบิกสำเร็จ",
    // PARTIAL = "เบิกไม่ครบ",
    // PENDING = "ยังไม่ได้เบิก",
    COMPLETED = "COMPLETED",
    PARTIAL = "PARTIAL",
    PENDING = "PENDING",
}

export enum ShipmentStatus {
    COMPLETED = "COMPLETED",  //ส่งสำเร็จ
    PARTIAL = "PARTIAL", //ส่งไม่ครบ
    PENDING = "PENDING", //ยังไม่ได้ส่ง
}

export enum WarehouseType {
    RAW_MATERIAL = "RAW_MATERIAL",
    FG = "FG",
    TOOLING = "TOOLING",
    SEMI = "SEMI",
}

// Enum สำหรับประเภทการแจ้งเตือน
export enum NotifType {
    SHELF_LIFE = "SHELF_LIFE",
    MINIMUM_STOCK = "MINIMUM_STOCK",
    TOOL_WITHDRAWAL = "TOOL_WITHDRAWAL",
    REQUEST_APPROVAL = "REQUEST_APPROVAL"
}

// Enum สำหรับสถานะการแจ้งเตือน
export enum NotifStatus {
    UNREAD = "UNREAD",
    READ = "READ"
}

// Enum สำหรับประเภทข้อมูล
export enum RefType {
    OUTBRM = "OUTBRM",
    OUTBFG = "OUTBFG",
    OUTBSEMI = "OUTBSEMI",
    OUTBTL = "OUTBTL",
    INBRM = "INBRM",
    INBFG = "INBFG",
    INBSEMI = "INBSEMI"
}

// Enum สำหรับระดับการแจ้งเตือน
export enum NotiLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}


