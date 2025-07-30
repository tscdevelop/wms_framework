import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";
import * as XLSX from "xlsx";

class FGAPI {
  static async fetchData(endpoint, method = "GET", data = null) {
    try {
      const token = GlobalVar.getToken();
      if (!token) {
        return new ApiResponse({
          isCompleted: false,
          isError: true,
          message: "Token not found in GlobalVar",
          data: null,
          error: "Token not found in GlobalVar",
        });
      }

      const options = {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : null,
      };

      const apiResponse = await ApiProvider.request(endpoint, options);
      return new ApiResponse({
        isCompleted: apiResponse.isCompleted,
        isError: apiResponse.isError,
        message: apiResponse.message,
        data: apiResponse.data,
        error: apiResponse.error,
      });
    } catch (error) {
      console.error(
        `Error ${method} request to ${endpoint}:`,
        error.response ? error.response.data : error.message || error
      );
      return new ApiResponse({
        isCompleted: false,
        isError: true,
        message: error.message || `Error ${method} request to ${endpoint}`,
        data: null,
        error: error.message || `Error ${method} request to ${endpoint}`,
      });
    }
  }


  static async getFGAll() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/finished-goods-type/get-all";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in finished-goods:", error);
      throw error;
    }
  }

  static async getFGByID(fg_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/finished-goods-type/get-by-id/${fg_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in get finished-goods:", error);
      throw error;
    }
  }
  static async createFG(payload) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/finished-goods-type/create";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.postData(endpoint, payload, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in create finished-goods:", error);
      throw error;
    }
  }
  static async updateFG(fg_id, formData) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/finished-goods-type/update/${fg_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.putData(endpoint, formData, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in update finished-goods:", error);
      throw error;
    }
  }
  static async deleteFG(fg_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/finished-goods-type/delete/${fg_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.deleteData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in delete finished-goods:", error);
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
    return matchingHeaders.length >= 2; // ถ้ามี headers ที่ตรงกันตั้งแต่ 7 ขึ้นไป ถือว่าผ่านการตรวจสอบ
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

      console.log("jsonData:", jsonData);
      // ✅ ตรวจสอบ headers
      const actualHeaders = jsonData[0];
      const expectedHeaders = ["รหัส", "ประเภท", "หมายเหตุ"];

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
          "รหัส": col[0]?.toString().trim() || "",
          "ประเภท": col[1]?.toString().trim() || "",
          "หมายเหตุ": col[2]?.toString().trim() || "",
        }))
        .filter(col => col["รหัส"] !== ""); // ✅ กรองแถวที่ไม่มีรหัสออก

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
      const endpoint = "/api/finished-goods-type/create-json";
      const response = await ApiProvider.postData(endpoint, formattedData, token);
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





  //FG Data

  static async getFgInfoAll() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/finished-goods-information/get-all";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in finished-good:", error);
      throw error;
    }
  }


  static async getFgInfoByID(fgifm_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/finished-goods-information/get-by-id/${fgifm_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in get finished-good", error);
      throw error;
    }
  }

  static async createFgInfo(payload) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/finished-goods-information/create";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.postData(endpoint, payload, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in create finished-good:", error);
      throw error;
    }
  }

  static async updateFgInfo(fgifm_id, formData) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/finished-goods-information/update/${fgifm_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.putData(endpoint, formData, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in update finished-good:", error);
      throw error;
    }
  }

  static async deleteFgInfo(fgifm_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/finished-goods-information/delete/${fgifm_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.deleteData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in update finished-good:", error);
      throw error;
    }
  }



  // ✅ ตรวจสอบ headers
  static validateHeadersinfo(expectedHeaders, actualHeaders) {
    // กรอง header ที่มีค่า "หมายเหตุ" ออก
    const filteredExpected = expectedHeaders.filter(header => header.trim().toLowerCase() !== "หมายเหตุ");
    const filteredActual = actualHeaders.filter(header => header.trim().toLowerCase() !== "หมายเหตุ");

    const normalizedExpectedHeaders = filteredExpected.map(header => header.trim().toLowerCase());
    const normalizedActualHeaders = filteredActual.map(header => header.trim().toLowerCase());

    const matchingHeaders = normalizedExpectedHeaders.filter(header => normalizedActualHeaders.includes(header));

    console.log(`📌 Headers ที่ตรงกัน: ${matchingHeaders.length} headers`, matchingHeaders);
    return matchingHeaders.length >= 11; // ถ้ามี headers ที่ตรงกันตั้งแต่ 7 ขึ้นไป ถือว่าผ่านการตรวจสอบ
  }


  static async importFileInfo(file) {
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

      console.log("jsonData:", jsonData);
      // ✅ ตรวจสอบ headers
      const actualHeaders = jsonData[0];
      const expectedHeaders = ["รหัส","ชื่อ", "เกณฑ์","ประเภท","ความกว้าง","หน่วยของความกว้าง","ความยาว","หน่วยของความยาว","ความหนา","หน่วยของความหนา","หน่วยของสินค้า"
      ];

      if (!this.validateHeadersinfo(expectedHeaders, actualHeaders)) {
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
          "รหัส": col[0]?.toString().trim() || "",
          "ชื่อ": col[1]?.toString().trim() || "",
          "เกณฑ์": col[2]?.toString().trim() || "",
          "ประเภท": col[3]?.toString().trim() || "",
          "ความกว้าง": col[4]?.toString().trim() || "",
          "หน่วยของความกว้าง": col[5]?.toString().trim() || "",
          "ความยาว": col[6]?.toString().trim() || "",
          "หน่วยของความยาว": col[7]?.toString().trim() || "",
          "ความหนา": col[8]?.toString().trim() || "",
          "หน่วยของความหนา": col[9]?.toString().trim() || "",
          "หน่วยของสินค้า": col[10]?.toString().trim() || "",
        }))
        .filter(col => col["รหัส"] !== ""); // ✅ กรองแถวที่ไม่มีรหัสออก

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
      const endpoint = "/api/finished-goods-information/create-json";
      const response = await ApiProvider.postData(endpoint, formattedData, token);
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

export default FGAPI;