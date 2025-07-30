// log.service.ts

import { AppDataSource } from '../config/app-data-source';
import { Log } from '../entities/s_log.entity';
import { m_log_inb_outb } from '../entities/m_log_inb_outb.entity';
import { LessThan } from 'typeorm';

// ฟังก์ชันสำหรับบันทึก Log ลงในฐานข้อมูล
export class LogService {
  private logRepository = AppDataSource.getRepository(Log);
  private transactionLogRepo = AppDataSource.getRepository(m_log_inb_outb);

  /**
   * บันทึก Log ลงในฐานข้อมูล
   * @param level ระดับของ Log (info, warn, error, ฯลฯ)
   * @param message ข้อความ Log
   * @param operation ชื่อฟังก์ชันหรือการดำเนินการที่เกี่ยวข้อง
   * @param username ชื่อผู้ใช้ที่เกี่ยวข้อง (ถ้ามี)
   */
  async logToDatabase(
    level: string,
    message: string,
    operation: string,
    username?: string
  ) {
    try {
      const log = new Log();
      log.level = level;
      log.message = message;
      log.operation = operation || 'N/A';
      log.username = username || 'system';'';
      log.timestamp = new Date();

      await this.logRepository.save(log); // บันทึก Log ลงในฐานข้อมูล
      console.log('Log saved successfully');
    } catch (error) {
      console.error('Failed to log to database:', error);
    }
  }

  /**
   * ลบ Log ที่เก็บไว้นานกว่า 30 วัน
   */
  async deleteOldLogs(LessThanDay:number=30) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - LessThanDay);

      const deleteResult = await this.logRepository.delete({
        timestamp: LessThan(thirtyDaysAgo),
      });

      console.log(`Old logs deleted successfully! Total deleted: ${deleteResult.affected}`);
    } catch (error) {
      console.error('Error deleting old logs:', error);
    }
  }

  /**
   * 📌 บันทึก Log ลงในฐานข้อมูล (ใช้ได้กับ INBOUND & OUTBOUND)
   */
  async logTransaction(
    log_type: string,
    log_ctgy: string,
    log_action: string,
    ref_id: number,
    transaction_data: any | null = null,
    username: string = 'system'
  ): Promise<m_log_inb_outb> {  // ✅ เปลี่ยนจาก void เป็น m_log_inb_outb
    try {
      const logEntry = new m_log_inb_outb();
      logEntry.log_type = log_type;
      logEntry.log_ctgy = log_ctgy;
      logEntry.log_action = log_action;
      logEntry.ref_id = ref_id;
      logEntry.transaction_data = transaction_data;
      logEntry.username = username;
      logEntry.timestamp = new Date(); // ✅ ตั้งค่าตามเวลาปัจจุบัน

      const savedLog = await this.transactionLogRepo.save(logEntry); // ✅ บันทึก Log
      console.log('✅ Log saved successfully:', savedLog);

      return savedLog; // ✅ ส่งข้อมูล Log ที่ถูกบันทึกกลับไป
    } catch (error) {
      console.error('❌ Failed to log to database:', error);
      throw new Error('Failed to save transaction log');
    }
  }


  


}



