import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class BOMAPI {
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

  static async getBOMAll() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/bom/get-all";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in OutBoundRaw:", error);
      throw error;
    }
  }

  static async getBOMByID(so_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/bom/get-by-id/${so_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in get OutBoundRaw:", error);
      throw error;
    }
  }
  static async getBOMAllDetails(so_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/bom/get-all-details/${so_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in get OutBoundRaw:", error);
      throw error;
    }
  }

  static async getByBOM(so_id, bom_number) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/bom/get-by-bom/${so_id}/${bom_number}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in get bom:", error);
      throw error;
    }
  }

  static async createBOM(payload) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/bom/create";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.postData(endpoint, payload, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in create OutBoundRaw:", error);
      throw error;
    }
  }
  static async updateBOM(so_id, formData) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/bom/update/${so_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.putData(endpoint, formData, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in update OutBoundRaw:", error);
      throw error;
    }
  }
  static async deleteBOM(so_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/bom/delete/${so_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.deleteData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in delete OutBoundRaw:", error);
      throw error;
    }
  }

  static async ExportBom(searchFilters = {}) {
    try {
      const token = GlobalVar.getToken();
      let endpoint = "/api/bom/export-to-excel?";

       // แปลง searchFilters เป็น query params
      const queryParams = Object.entries(searchFilters)
           // eslint-disable-next-line no-unused-vars
      .filter(([_,value]) => value.trim() !== "") // กรองค่าเว้นว่างออก
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
      link.setAttribute("download", "bom.xlsx"); // ตั้งชื่อไฟล์

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

  static async ExportBomDetails(so_id, searchFilters = {}) {
    try {
      const token = GlobalVar.getToken();
  
      let endpoint = `/api/bom/export-details-to-excel?so_id=${so_id}`;
  
      // แปลง searchFilters เป็น query params
      const queryParams = Object.entries(searchFilters)
           // eslint-disable-next-line no-unused-vars
      .filter(([_,value]) => value.trim() !== "") // กรองค่าเว้นว่างออก
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
  
      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bom_details.xlsx");
  
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  
      return { isCompleted: true, message: "File downloaded successfully." };
    } catch (error) {
      console.error("Error downloading file:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }
  
}

export default BOMAPI;
