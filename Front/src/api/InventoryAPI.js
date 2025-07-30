import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class InventoryAPI {
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

  static async getInventoryRaw() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/inventory/get-inbound-rm-all";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in getInventoryRaw:", error);
      throw error;
    }
  }
  static async getInventorySemi() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/inventory/get-inbound-semi-all";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in getInventorySemiFG:", error);
      throw error;
    }
  }
  static async getInventoryFg() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/inventory/get-inbound-fg-all";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in getInventoryFg:", error);
      throw error;
    }
  }
  static async getInventoryTooling() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/inventory/get-inbound-tl-all";

      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);

      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in getInventoryTooling:", error);
      throw error;
    }
  }

  // InventoryAPI.js
static async ExportInvRaw(ftyName, whName) {
  try {
    const token = GlobalVar.getToken();
    let endpoint = "/api/inventory/export-rm-to-excel";

    // สร้าง query string โดยใช้ parameter ที่รับเข้ามา
    const queryParams = [];
    if (ftyName && ftyName.trim() !== "") {
      queryParams.push(`fty_name=${encodeURIComponent(ftyName)}`);
    }
    if (whName && whName.trim() !== "") {
      queryParams.push(`wh_name=${encodeURIComponent(whName)}`);
    }

    if (queryParams.length > 0) {
      endpoint += "?" + queryParams.join("&");
    }

    // เรียก API เพื่อดาวน์โหลดไฟล์เป็น Blob
    const response = await ApiProvider.getData(endpoint, {}, token, "", "blob");

    if (!response) {
      throw new Error("Failed to download file. No response received.");
    }

    if (response.size === 0) {
      throw new Error("Downloaded file is empty");
    }

    // สร้าง URL สำหรับ Blob และ trigger ดาวน์โหลดไฟล์
    const url = window.URL.createObjectURL(response);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inventory_raw.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { isCompleted: true, message: "File downloaded successfully." };
  } catch (error) {
    console.error("Error downloading file:", error.message || error);
    return { isCompleted: false, message: `Error: ${error.message}` };
  }
}


  static async ExportInvFg(ftyName, whName) {
    try {
      const token = GlobalVar.getToken();
      let endpoint = "/api/inventory/export-fg-to-excel";

      // สร้าง query string โดยใช้ parameter ที่รับเข้ามา
      const queryParams = [];
      if (ftyName && ftyName.trim() !== "") {
        queryParams.push(`fty_name=${encodeURIComponent(ftyName)}`);
      }
      if (whName && whName.trim() !== "") {
        queryParams.push(`wh_name=${encodeURIComponent(whName)}`);
      }

      if (queryParams.length > 0) {
        endpoint += "?" + queryParams.join("&");
      }

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
      link.setAttribute("download", "inventory_fg.xlsx"); // ตั้งชื่อไฟล์

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

  static async ExportInvSemi(ftyName, whName) {
    try {
      const token = GlobalVar.getToken();
      let endpoint = "/api/inventory/export-semi-to-excel";

      // สร้าง query string โดยใช้ parameter ที่รับเข้ามา
      const queryParams = [];
      if (ftyName && ftyName.trim() !== "") {
        queryParams.push(`fty_name=${encodeURIComponent(ftyName)}`);
      }
      if (whName && whName.trim() !== "") {
        queryParams.push(`wh_name=${encodeURIComponent(whName)}`);
      }

      if (queryParams.length > 0) {
        endpoint += "?" + queryParams.join("&");
      }

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
      link.setAttribute("download", "inventory_semi.xlsx"); // ตั้งชื่อไฟล์

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

  static async ExportInvTooling(ftyName, whName) {
    try {
      const token = GlobalVar.getToken();
      let endpoint = "/api/inventory/export-tl-to-excel";

      // สร้าง query string โดยใช้ parameter ที่รับเข้ามา
      const queryParams = [];
      if (ftyName && ftyName.trim() !== "") {
        queryParams.push(`fty_name=${encodeURIComponent(ftyName)}`);
      }
      if (whName && whName.trim() !== "") {
        queryParams.push(`wh_name=${encodeURIComponent(whName)}`);
      }

      if (queryParams.length > 0) {
        endpoint += "?" + queryParams.join("&");
      }

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
      link.setAttribute("download", "inventory_tooling.xlsx"); // ตั้งชื่อไฟล์

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

export default InventoryAPI;
