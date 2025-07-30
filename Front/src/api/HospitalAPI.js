import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";
import { DEFAULT_HOSPITAL_CODE } from "common/constants";

class HospitalAPI {
// //getID
// static async getHospitalCODE() {
//     // ลบพารามิเตอร์ hospitalID

//     try {
//     const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar
//     console.log("getHospitalById Token:", token);
//     const hosp = GlobalVar.getHospitalCode();
//     // ตรวจสอบว่ามี token หรือไม่
   

//     // ใช้ DEFAULT_HOSPITAL_ID แทน
//     const endpoint = `/api/hospitals/get-by-code/${hosp}`;
//     console.log("Request Endpoint:", endpoint);

//     const apiResponse = await ApiProvider.getData(endpoint, {}, token); // เรียก API เพื่อดึงข้อมูล

//     console.log("API Response:", apiResponse);

//     // ตรวจสอบว่า API Response ถูกต้องหรือไม่
   

//     // สร้าง ApiResponse ที่ตรงตามรูปแบบที่ต้องการ
   

//     return apiResponse;
//     } catch (error) {
//         console.error("Error creating customer and pet:", error.message || error);
//         throw new Error(`Error: ${error.message}`);
//     }
// }

static async editHospital(hospitalData) {
    const hosp = GlobalVar.getHospitalCode();
    try {
    const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar

    // ตรวจสอบว่ามี token หรือไม่
    

    const endpoint = `/api/hospitals/edit/${hosp}`; // กำหนด endpoint สำหรับเรียก API
    // console.log("Request Endpoint:", endpoint);
    const apiResponse = await ApiProvider.putData(endpoint, hospitalData, token); // เรียก API เพื่อแก้ไขข้อมูลลูกค้า

    return apiResponse;
    } catch (error) {
        console.error("Error creating customer and pet:", error.message || error);
        throw new Error(`Error: ${error.message}`);
    }
}

static async createHospital(hospitalData) {
    try {
    const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar

    const endpoint = `/api/hospitals/create`;
    const apiResponse = await ApiProvider.postData(endpoint, hospitalData, token); // เรียก API เพื่อสร้างข้อมูลลูกค้าใหม่
    return apiResponse;
    
    } catch (error) {
        console.error("Error creating customer and pet:", error.message || error);
        throw new Error(`Error: ${error.message}`);
    }
}




static async getHospitalALL() {

    try {
    const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar
    console.log("getHospitalById Token:", token);
    const endpoint = `/api/hospitals/get-hospital-all`;
    console.log("Request Endpoint:", endpoint);
    const apiResponse = await ApiProvider.getData(endpoint, {}, token); // เรียก API เพื่อดึงข้อมูล
    console.log("API Response:", apiResponse);

    return apiResponse;
    } catch (error) {
        console.error("Error creating customer and pet:", error.message || error);
        throw new Error(`Error: ${error.message}`);
    }
}

static async getHospitalDropDown() {

    try {
    const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar
    const endpoint = `/api/dropdown/get-hospital-clinic-refer-dropdown`;
    console.log("Request Endpoint:", endpoint);
    const apiResponse = await ApiProvider.getData(endpoint, {}, token); // เรียก API เพื่อดึงข้อมูล
    console.log("API Response:", apiResponse);

    return apiResponse;
    } catch (error) {
        console.error("Error creating customer and pet:", error.message || error);
        throw new Error(`Error: ${error.message}`);
    }
}
static async getVeterinaryDropDown(hcrf_id) {

    try {
    const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar
    const endpoint = `/api/dropdown/get-veterinary-dropdown/${hcrf_id}`;
    console.log("Request Endpoint:", endpoint);
    const apiResponse = await ApiProvider.getData(endpoint, {}, token); // เรียก API เพื่อดึงข้อมูล
    console.log("API Response:", apiResponse);

    return apiResponse;
    } catch (error) {
        console.error("Error creating customer and pet:", error.message || error);
        throw new Error(`Error: ${error.message}`);
    }
}


static async getHospitalClinicALL() {

    try {
    const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar
    console.log("getHospitalById Token:", token);
    const endpoint = `/api/hospclinic-refer/get-all`;
    console.log("Request Endpoint:", endpoint);
    const apiResponse = await ApiProvider.getData(endpoint, {}, token); // เรียก API เพื่อดึงข้อมูล
    console.log("API Response:", apiResponse);

    return apiResponse;
    } catch (error) {
        console.error("Error creating customer and pet:", error.message || error);
        throw new Error(`Error: ${error.message}`);
    }
}
static async getHospitalClinicById(hcrf_id) {

    try {
    const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar
    console.log("getHospitalById Token:", token);
    const endpoint = `/api/hospclinic-refer/get-by-id/${hcrf_id}`;
    console.log("Request Endpoint:", endpoint);
    const apiResponse = await ApiProvider.getData(endpoint, {}, token); // เรียก API เพื่อดึงข้อมูล
    console.log("API Response:", apiResponse);

    return apiResponse;
    } catch (error) {
        console.error("Error creating customer and pet:", error.message || error);
        throw new Error(`Error: ${error.message}`);
    }
}

static async updateHospitalClinic(hcrf_id, payload) {
    try {
      // ดึง Token สำหรับ Authentication
      const token = GlobalVar.getToken();
      console.log("Token:", token); // ตรวจสอบ token
  
      // กำหนด endpoint
      const endpoint = `/api/hospclinic-refer/update/${hcrf_id}`;
  
      // เรียก API ด้วยข้อมูล payload และ token
      const apiResponse = await ApiProvider.putData(endpoint, payload, token);
  
      // ตรวจสอบผลลัพธ์และส่งกลับ
      return apiResponse;
    } catch (error) {
      console.error("Error updating hospital clinic:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }


  static async createHospitalClinic(payload) {
    try {
    const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar

    const endpoint = `/api/hospclinic-refer/create`;
    const apiResponse = await ApiProvider.postData(endpoint, payload, token); // เรียก API เพื่อสร้างข้อมูลลูกค้าใหม่
    return apiResponse;
    
    } catch (error) {
        console.error("Error creating customer and pet:", error.message || error);
        throw new Error(`Error: ${error.message}`);
    }
}
  
static async deleteHospitalClinic(hcrf_id) {
    try {
      const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar
  
      const endpoint = `/api/hospclinic-refer/delete/${hcrf_id}`; // กำหนด endpoint สำหรับเรียก API
      const apiResponse = await ApiProvider.deleteData(endpoint, {}, token); // เรียก API เพื่อทำการลบข้อมูลพนักงาน

     
      return apiResponse;
    } catch (error) {
     
      console.error("Error creating customer and pet:", error.message || error);
        throw new Error(`Error: ${error.message}`);
      
    }
  }


}

export default HospitalAPI;
