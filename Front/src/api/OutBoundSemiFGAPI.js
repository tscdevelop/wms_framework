import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class OutBoundSemiFGAPI {
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

  static async getOutBoundSemiAll(approvalStatus,isShipment = false) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/outbound-semi/get-all";
  
      const params = {};
      if (approvalStatus) {
        params.approvalStatus = approvalStatus;
      }
      // ถ้าเป็นรายการส่งของทั้งหมด (shipment) ให้ส่ง withdrawStatus:true
      if (typeof isShipment !== "undefined") {
        params.returnedStatus = isShipment;
      }
      
  
      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, params, token);
      console.log("API Response:", response);
  
      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in OutBoundSemi:", error);
      throw error;
    }
  }

  static async getOutbSemiAll() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/outbound-semi/get-all";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in get OutBoundSemi:", error);
      throw error;
    }
  }

  static async getOutBoundSemiByID(outbsemi_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/outbound-semi/get-by-id/${outbsemi_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in get OutBoundSemi:", error);
      throw error;
    }
  }

  static async getOutBoundSemiReqByID(outbsemi_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/outbound-semi/get-requisition-by-id/${outbsemi_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in get OutBoundSemi:", error);
      throw error;
    }
  }

  static async createOutBoundSemi(payload) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/outbound-semi/create";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.postData(endpoint, payload, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in create OutBoundSemi:", error);
      throw error;
    }
  }
  static async createOutBSemiWd(outbsemi_id, payload) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/outbound-semi/withdraw-scan/${outbsemi_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.postData(endpoint, payload, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in create OutBoundSemi:", error);
      throw error;
    }
  }
  static async createOutBSemiShip(outbsemi_id, payload) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/outbound-semi/shipment-scan/${outbsemi_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.postData(endpoint, payload, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in create OutBoundSemi:", error);
      throw error;
    }
  }

  static async updateOutBoundSemi(outbsemi_id, payload) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/outbound-semi/update/${outbsemi_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.putData(endpoint, payload, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in update OutBoundSemi:", error);
      throw error;
    }
  }
  static async updateOutbDateSemi(outbsemi_id,payload) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/outbound-semi/update-dates/${outbsemi_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.putData(endpoint,payload, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in update OutBoundSemi:", error);
      throw error;
    }
  }
  static async deleteOutBoundSemi(outbsemi_id) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/outbound-semi/delete/${outbsemi_id}`;

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.deleteData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in delete OutBoundSemi:", error);
      throw error;
    }
  }

  static async ExportOutbSemiFG(searchFilters = {}) {
    try {
      const token = GlobalVar.getToken();
      let endpoint = "/api/outbound-semi/export-to-excel?";

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
      link.setAttribute("download", "outbound_semiFG.xlsx"); // ตั้งชื่อไฟล์

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
}

export default OutBoundSemiFGAPI;
