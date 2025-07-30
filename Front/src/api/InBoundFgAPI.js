import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class InBoundFGAPI {
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



  static async getInBoundFgAll() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/inbound-fg/get-all";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in InBound:", error);
      throw error;
    }
  }

  static async getIbDetailAll(fgifm_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/inbound-fg/get-all-details/${fgifm_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in get InBound:", error);
      throw error;
    }
  }

  static async getInBoundFgByID(inbfg_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/inbound-fg/get-by-id/${inbfg_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in get InBound:", error);
      throw error;
    }
  }
  static async getInBoundFgByCode(inbfg_code) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/inbound-fg/get-by-code/${inbfg_code}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in get InBound:", error);
      throw error;
    }
  }
  static async createInBoundFg(payload) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/inbound-fg/create";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.postData(endpoint, payload, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in create InBound:", error);
      throw error;
    }
  }
  static async updateInBoundFg(inbfg_id, form) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/inbound-fg/update/${inbfg_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.putData(endpoint, form, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in update InBound:", error);
      throw error;
    }
  }
  static async deleteInBoundFg(inbfg_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/inbound-fg/delete/${inbfg_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.deleteData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in delete InBound:", error);
      throw error;
    }
  }


  static async ExportInbFG(searchFilters = {}) {
    try {
      const token = GlobalVar.getToken();
      let endpoint = "/api/inbound-fg/export-to-excel?";

      // แปลง searchFilters เป็น query params
      const queryParams = Object.entries(searchFilters)
        // eslint-disable-next-line no-unused-vars
        .filter(([_, value]) => value.trim() !== "") // กรองค่าเว้นว่างออก
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

      if (queryParams) {
        endpoint += `&${queryParams}`;
      }

      console.log("Final Export API Endpoint:", endpoint);

      // ใช้ getData ของ ApiProvider เพื่อรับข้อมูลเป็น Blob
      const response = await ApiProvider.getData(endpoint, {}, token, "", "blob");

      if (!response) {
        throw new Error("Failed to download file. No response received.");
      }

      if (response.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      // สร้าง URL สำหรับ Blob และสร้างลิงก์ดาวน์โหลด
      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "inbound_fg.xlsx"); // ตั้งชื่อไฟล์

      document.body.appendChild(link);
      link.click();

      // ลบลิงก์ออกจาก DOM และยกเลิก URL ของ Blob
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { isCompleted: true, message: "File downloaded successfully." };
    } catch (error) {
      console.error("Error downloading file:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }
  static async ExportDetailsInbFG(fgifm_id, searchFilters = {} ,filterToday) {
    try {
      const token = GlobalVar.getToken();
      let endpoint = `/api/inbound-fg/export-details-to-excel?fgifm_id=${fgifm_id}`;

      // แปลง searchFilters เป็น query params
      const queryParams = Object.entries(searchFilters)
        // eslint-disable-next-line no-unused-vars
        .filter(([_, value]) => value.trim() !== "") // กรองค่าเว้นว่างออก
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

      if (queryParams) {
        endpoint += `&${queryParams}`;
      }

   // เพิ่ม filterToday เข้าไปใน endpoint ถ้ามีค่า (แม้จะเป็น false)
   if (typeof filterToday !== "undefined") {
    endpoint += `&filterToday=${filterToday}`;
  }

      console.log("Final Export API Endpoint:", endpoint);

      // ✅ ใช้ `getData` เพื่อรับไฟล์เป็น Blob
      const response = await ApiProvider.getData(endpoint, {}, token, "", "blob");

      if (!response) {
        throw new Error("Failed to download file. No response received.");
      }

      if (response.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      // ✅ สร้าง URL สำหรับ Blob และลิงก์ดาวน์โหลด
      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "inbound_details_fg.xlsx"); // ตั้งชื่อไฟล์ให้มี rmifm_id

      document.body.appendChild(link);
      link.click();

      // ✅ ลบลิงก์ออกจาก DOM และยกเลิก URL ของ Blob
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { isCompleted: true, message: "File downloaded successfully." };
    } catch (error) {
      console.error("❌ Error downloading file:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }


}

export default InBoundFGAPI;