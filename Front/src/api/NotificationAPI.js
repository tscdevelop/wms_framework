import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class NotificationAPI {
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


      static async getNotifAll() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/notif-approval/get-notif-all";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in notif:", error);
          throw error;
        }
      }

      static async getNotifReqAll() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/notif-approval/get-request-all";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in request:", error);
          throw error;
        }
      }

 
      static async updateNotif(formData) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/notif-approval/update";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.putData(endpoint, formData, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in update OutBoundRaw:", error);
          throw error;
        }
      }
     

      static async getNotifByID(notif_id) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = `/api/notif-approval/get-request-by-id/${notif_id}`;
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in notif:", error);
          throw error;
        }
      }
      static async CreateNotif(payload) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/notif-approval/approve-request";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.postData(endpoint, payload, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in notif:", error);
          throw error;
        }
      }

      static async getNotifToolAll() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/notif-approval/get-noti-outbtl-all";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in request:", error);
          throw error;
        }
      }


      static async getNotifMiniAll() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/notif-approval/get-noti-minimum-stock-all";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in request:", error);
          throw error;
        }
      }
      static async getNotifShelfAll() {
        try {
          const token = GlobalVar.getToken();
        const endpoint = "/api/notif-approval/get-noti-shelf-life-all";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in request:", error);
          throw error;
        }
      }

      static async getUnreadNotif() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/notif-approval/get-unread-counts";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in request:", error);
          throw error;
        }
      }

}

export default NotificationAPI;