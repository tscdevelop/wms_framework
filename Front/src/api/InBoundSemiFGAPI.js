import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class InBoundSemiFGAPI {
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

  static async getInBoundAll() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/inbound-semi/get-all";

      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response;
    } catch (error) {
      console.error("Error in InBound:", error);
      throw error;
    }
  }

  static async getInBoundByID(inbsemi_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/inbound-semi/get-by-id/${inbsemi_id}`;

      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response;
    } catch (error) {
      console.error("Error in get InBound:", error);
      throw error;
    }
  }
  static async getIbDetaliAll(inbsemi_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/inbound-semi/get-all-details/${inbsemi_id}`;

      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response;
    } catch (error) {
      console.error("Error in get InBound:", error);
      throw error;
    }
  }

  static async createInBound(payload) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/inbound-semi/create";

      const response = await ApiProvider.postData(endpoint, payload, token);
      console.log("API Response:", response);

      return response;
    } catch (error) {
      console.error("Error in create InBound:", error);
      throw error;
    }
  }
  static async updateInBound(inbsemi_id, formData) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/inbound-semi/update/${inbsemi_id}`;

      const response = await ApiProvider.putData(endpoint, formData, token);
      console.log("API Response:", response);

      return response;
    } catch (error) {
      console.error("Error in update InBound:", error);
      throw error;
    }
  }
  static async deleteInBound(inbsemi_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/inbound-semi/delete/${inbsemi_id}`;

      const response = await ApiProvider.deleteData(endpoint, {}, token);
      console.log("API Response:", response);

      return response;
    } catch (error) {
      console.error("Error in delete InBound:", error);
      throw error;
    }
  }

  static async ExportInbSemi(searchFilters = {}) {
    try {
      const token = GlobalVar.getToken();
      let endpoint = "/api/inbound-semi/export-to-excel?";

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
      link.setAttribute("download", "inbound_semiFG.xlsx"); // ตั้งชื่อไฟล์

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

  static async ExportDetailsInbSemi(semiifm_id, searchFilters = {},filterToday) {
    try {
      const token = GlobalVar.getToken();
      let endpoint = `/api/inbound-semi/export-details-to-excel?semiifm_id=${semiifm_id}`;

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
      link.setAttribute("download", "inbound_details_semiFG.xlsx"); // ตั้งชื่อไฟล์ให้มี rmifm_id

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

export default InBoundSemiFGAPI;
