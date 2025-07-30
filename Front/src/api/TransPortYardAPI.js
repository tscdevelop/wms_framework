import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";
import * as XLSX from "xlsx";
class TransPortYardAPI {
  static async fetchData(endpoint, method = "GET", data = null) {
    try {
      const token = GlobalVar.getToken();
      if (!token) {
        return new ApiResponse({
          isCompleted: false,
          isError: true,
          message: "Token not found in GlobalVar",
          data: null,
          error: "Token not found in GlobalVar"
        });
      }

      const options = {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: data ? JSON.stringify(data) : null
      };

      const apiResponse = await ApiProvider.request(endpoint, options);
      return new ApiResponse({
        isCompleted: apiResponse.isCompleted,
        isError: apiResponse.isError,
        message: apiResponse.message,
        data: apiResponse.data,
        error: apiResponse.error
      });

    } catch (error) {
      console.error(`Error ${method} request to ${endpoint}:`, error.response ? error.response.data : error.message || error);
      return new ApiResponse({
        isCompleted: false,
        isError: true,
        message: error.message || `Error ${method} request to ${endpoint}`,
        data: null,
        error: error.message || `Error ${method} request to ${endpoint}`
      });
    }
  }


      static async getTransYardAll() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/transport-yard/get-all";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in transport-yard:", error);
          throw error;
        }
      }

      static async getTransYardByID(tspyard_id) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = `/api/transport-yard/get-by-id/${tspyard_id}`;
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get transport-yard:", error);
          throw error;
        }
      }
      static async createTransYard(payload) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/transport-yard/create";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.postData(endpoint, payload, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get transport-yard:", error);
          throw error;
        }
      }
      static async updateTransYard(tspyard_id,formData) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = `/api/transport-yard/update/${tspyard_id}`;
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.putData(endpoint, formData, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get transport-yard:", error);
          throw error;
        }
      }
      static async deleteTransYard(tspyard_id) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = `/api/transport-yard/delete/${tspyard_id}`;
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.deleteData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get transport-yard:", error);
          throw error;
        }
      }


      // ✅ ตรวจสอบ headers
    static validateHeaders(expectedHeaders, actualHeaders) {
      // กรอง header ที่มีค่า "หมายเหตุ" ออก
      const filteredExpected = expectedHeaders.filter(header => header.trim().toLowerCase() !== "หมายเหตุ");
      const filteredActual = actualHeaders.filter(header => header.trim().toLowerCase() !== "หมายเหตุ");
    
      const normalizedExpectedHeaders = filteredExpected.map(header => header.trim().toLowerCase());
      const normalizedActualHeaders = filteredActual.map(header => header.trim().toLowerCase());
    
      const matchingHeaders = normalizedExpectedHeaders.filter(header => normalizedActualHeaders.includes(header));
    
      console.log(`📌 Headers ที่ตรงกัน: ${matchingHeaders.length} headers`, matchingHeaders);
      return matchingHeaders.length >= 5; // ถ้ามี headers ที่ตรงกันตั้งแต่ 7 ขึ้นไป ถือว่าผ่านการตรวจสอบ
    }
          

    static async importFile(file) {
      try {
          if (!file || !(file instanceof Blob)) {
              return new ApiResponse({
                  isCompleted: false,
                  isError: true,
                  message: "ไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ Excel",
                  data: null
              });
          }
  
          const token = GlobalVar.getToken();
          if (!token) {
              return new ApiResponse({
                  isCompleted: false,
                  isError: true,
                  message: "Token not found in GlobalVar",
                  data: null,
                  error: "Token not found in GlobalVar"
              });
          }
  
          console.log("📌 กำลังอ่านไฟล์:", file.name);
  
          const reader = new FileReader();
          const jsonData = await new Promise((resolve, reject) => {
            reader.onload = (e) => {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: "array" });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              let rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              console.log("rows:", rows);
              
              // กรองเอา row ที่มีข้อมูลจริงๆ เท่านั้น (เช็คว่ามีค่าไม่ใช่ค่าว่างหรือช่องว่าง)
              rows = rows.filter(row =>
                row.some(cell => cell !== undefined && cell !== null && cell.toString().trim() !== "")
              );
          
              if (rows.length < 2) {
                reject("ไฟล์ไม่มีข้อมูล");
              }
          
              resolve(rows);
            };
            reader.readAsArrayBuffer(file);
          });
          
          console.log("jsonData:",jsonData);
          // ✅ ตรวจสอบ headers
          const actualHeaders = jsonData[0];
          const expectedHeaders = ["รหัสท่ารถ", "ชื่อท่ารถ", "ที่อยู่", "เบอร์ติดต่อ","หมายเหตุ","โรงงาน"];
  
          if (!this.validateHeaders(expectedHeaders, actualHeaders)) {
              return new ApiResponse({
                  isCompleted: false,
                  isError: true,
                  message: "โครงสร้าง Header ของไฟล์ไม่ถูกต้อง",
                  data: null
              });
          }
  
          // ✅ แปลงข้อมูลเป็น JSON และกรองแถวที่ไม่มีรหัส
          const formattedData = jsonData.slice(1)
              .map(col => ({
                  "รหัสท่ารถ": col[0]?.toString().trim() || "",
                  "ชื่อท่ารถ": col[1]?.toString().trim() || "",
                  "ที่อยู่": col[2]?.toString().trim() || "",
                  "เบอร์ติดต่อ": col[3]?.toString().trim() || "",
                  "หมายเหตุ": col[4]?.toString().trim() || "",
                  "โรงงาน": col[5]?.toString().trim() || "",
              }))
              .filter(col => col["รหัสท่ารถ"] !== ""); // ✅ กรองแถวที่ไม่มีรหัสออก
  
          console.log("📌 ข้อมูล JSON ที่ส่งไป API:", formattedData);
  
          if (formattedData.length === 0) {
              return new ApiResponse({
                  isCompleted: false,
                  isError: true,
                  message: "ไม่มีข้อมูลที่ถูกต้องในไฟล์",
                  data: null
              });
          }
  
          // ✅ ส่ง JSON ไปยัง API
          const endpoint = "/api/transport-yard/create-json";
          const response = await ApiProvider.postData(endpoint, formattedData , token);
          console.log("📌 API Response:", response);

          
          return response;
      } catch (error) {
          console.error("Error in Import File Supplier:", error);
          return new ApiResponse({
              isCompleted: false,
              isError: true,
              message: error.message || "เกิดข้อผิดพลาดระหว่างอัปโหลดไฟล์",
              data: null
          });
      }
  }

}

export default TransPortYardAPI;