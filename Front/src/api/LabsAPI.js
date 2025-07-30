import { GlobalVar } from '../common/GlobalVar';
import ApiProvider from './ApiProvider';
import ApiResponse from '../common/ApiResponse';

class LabsAPI {
  static async fetchData(endpoint, method = 'GET', data = null) {
    try {
      const token = GlobalVar.getToken();
      if (!token) {
        return new ApiResponse({
          isCompleted: false,
          isError: true,
          message: 'Token not found in GlobalVar',
          data: null,
          error: 'Token not found in GlobalVar',
        });
      }
  
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : null,
      };
  
      let apiResponse;
      if (method === 'GET') {
        apiResponse = await ApiProvider.getData(endpoint, options, token);
      } else if (method === 'PUT') {
        apiResponse = await ApiProvider.putData(endpoint, data, token);
      }
  
      return new ApiResponse({
        isCompleted: apiResponse.isCompleted,
        isError: apiResponse.isError,
        message: apiResponse.message,
        data: apiResponse.data,
        error: apiResponse.error,
      });
  
    } catch (error) {
      console.error(`Error ${method} request to ${endpoint}:`, error.response ? error.response.data : error.message || error);
      return new ApiResponse({
        isCompleted: false,
        isError: true,
        message: error.message || `Error ${method} request to ${endpoint}`,
        data: null,
        error: error.message || `Error ${method} request to ${endpoint}`,
      });
    }
  }

  static async getLabDataById(editingLabId) {
    try {
      const token = GlobalVar.getToken();
      console.log("getLabDataById Token:", token);
  
     
      const endpoint = `/api/labs/getById/${editingLabId}`;
      console.log('Request Endpoint:', endpoint);
  
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);
      console.log('Raw API Response:', apiResponse);
  
      // Check for missing or empty message and set a default if necessary
     
      return apiResponse;
      
  
    } catch (error) {
      console.error("Error creating customer and pet:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }
  
  

  static async searchLabs(hospital_code) {
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/labs/get-lab-price-all/${hospital_code}`;
      
      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);
      
      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error('Error in searchLabs:', error);
      throw error;
    }
  }
  
  static async getlabprice(labcfdprc_id){
    try {
      const token = GlobalVar.getToken();
      const endpoint = `/api/labs/get-lab-price/${labcfdprc_id}`;
      
      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);
      
      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error('Error in searchLabs:', error);
      throw error;
    }
  
  }
   


  static async updateLabPrices(labcfdprc_id, updatedLabForm) {
    try {
      const token = GlobalVar.getToken();
      console.log("Token:", token); // ตรวจสอบ token
  
      const endpoint = `/api/labs/update-lab-price/${labcfdprc_id}`;
      
  
      // ตรวจสอบ payload ที่จะถูกส่งไป
      
      console.log("Updated Lab Form Payload:", updatedLabForm);
  
      const apiResponse = await ApiProvider.putData(endpoint, updatedLabForm, token);
      return apiResponse;
    } catch (error) {
      console.error("Error updating lab prices:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }



  static async getLabConfig(labcnf_type) {
    try {
      const token = GlobalVar.getToken();
      const hosp = GlobalVar.getHospitalCode();
      
      console.log("getLabDataById Token:", token);
      console.log("getHospitalCode :", hosp);
  
      const endpoint = `/api/labs/getLabConfig/${hosp}/${labcnf_type}`;
      console.log('Request Endpoint:', endpoint);
  
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);
      console.log('Raw API Response:', apiResponse);
  
      return apiResponse;
      
  
    } catch (error) {
      console.error("Error creating customer and pet:", error.message || error);
          throw new Error(`Error: ${error.message}`);
    }
  }


  static async createInspect(labInspectData) {
    try {
        // ดึง Token จาก GlobalVar
        const token = GlobalVar.getToken();

        // ตรวจสอบว่า Token มีอยู่หรือไม่
        

        // กำหนด endpoint สำหรับการส่งคำขอ
        const endpoint = `/api/labs/createInspect`;
        console.log("ข้อมูลการตรวจ LAB ที่จะส่ง:", labInspectData);
        const apiResponse = await ApiProvider.postData(endpoint, labInspectData, token);
        console.log("ผลลัพธ์จาก API:", apiResponse);

        return apiResponse;
    

    } catch (error) {
        // จัดการกรณีที่เกิดข้อผิดพลาด และแสดงข้อความที่เกี่ยวข้อง
        console.error('เกิดข้อผิดพลาดในการสร้างการตรวจ LAB:', error.response ? error.response.data : error.message || error);
        return new ApiResponse({
            isCompleted: false,
            isError: true,
            message: error.message || 'เกิดข้อผิดพลาดในการสร้างการตรวจ LAB',
            data: null,
            error: error.message || 'เกิดข้อผิดพลาดในการสร้างการตรวจ LAB',
        });
    }
}



// static async getLabInspectIn() {
//   try {
//     const token = GlobalVar.getToken();


//     const endpoint = `/api/labs/get-lab-inspect-by-lab-in`;
//     console.log("getLabInspectByLabIn:",endpoint );

//     const apiResponse = await ApiProvider.getData(endpoint, {}, token);
//     console.log("lab API Response:", apiResponse);

//     return apiResponse;

//   } catch (error) {
//     console.error('Error searching labs:', error.response ? error.response.data : error.message || error);
//     return new ApiResponse({
//       isCompleted: false,
//       isError: true,
//       message: error.message || 'Error searching labs',
//       data: null,
//       error: error.message || 'Error searching labs',
//     });
//   }
// }


static async getLabInspectIn(startDate, endDate, status) {
  try {
    const token = GlobalVar.getToken();

    // สร้าง query string สำหรับพารามิเตอร์ที่ต้องการส่ง
    const queryParams = new URLSearchParams({
      startDate: startDate || '', // ถ้าไม่มีค่าให้ส่งเป็นค่าว่าง
      endDate: endDate || '',     // ถ้าไม่มีค่าให้ส่งเป็นค่าว่าง
      status: status || ''        // ถ้าไม่มีค่าให้ส่งเป็นค่าว่าง
    }).toString();

    
    // สร้าง endpoint พร้อม query string
    const endpoint = `/api/labs/get-lab-inspect-by-lab-in?${queryParams}`;
    console.log("getLabInspectByLabIn endpoint:", endpoint);

    // เรียก API โดยส่ง query parameters
    const apiResponse = await ApiProvider.getData(endpoint, {}, token);
    console.log("API Response:", apiResponse);

    return apiResponse;

  } catch (error) {
    console.error('Error searching labs:', error.response ? error.response.data : error.message || error);
    return new ApiResponse({
      isCompleted: false,
      isError: true,
      message: error.message || 'Error searching labs',
      data: null,
      error: error.message || 'Error searching labs',
    });
  }
}



static async getLabInspectExt(startDate, endDate, status) {
  try {
    const token = GlobalVar.getToken();

    // สร้าง query string สำหรับ URL
    const queryParams = new URLSearchParams({
      startDate: startDate || '', // ถ้าไม่มีค่าให้ส่งเป็นค่าว่าง
      endDate: endDate || '',     // ถ้าไม่มีค่าให้ส่งเป็นค่าว่าง
      status: status || ''        // ถ้าไม่มีค่าให้ส่งเป็นค่าว่าง
    }).toString();

    // เอา $ ออกจาก endpoint
    const endpoint = `/api/labs/get-lab-inspect-by-lab-ext?${queryParams}`;
    console.log("getLabInspectByLabExt:", endpoint);

    // เรียก API
    const apiResponse = await ApiProvider.getData(endpoint, {}, token);
    console.log("API Response:", apiResponse);

    return apiResponse;

  } catch (error) {
    console.error('Error searching labs:', error.response ? error.response.data : error.message || error);
    return new ApiResponse({
      isCompleted: false,
      isError: true,
      message: error.message || 'Error searching labs',
      data: null,
      error: error.message || 'Error searching labs',
    });
  }
}


static async getLaboratoryExt(hosp) {
  try {
    const token = GlobalVar.getToken();
    
    const endpoint = `/api/labs/get-laboratory-ext-by-hospitalcode/${hosp}`;
    console.log("labs:", );

    const apiResponse = await ApiProvider.getData(endpoint, {}, token);
    console.log("API Response:", apiResponse);

    return apiResponse;

  } catch (error) {
    console.error("Error creating customer and pet:", error.message || error);
        throw new Error(`Error: ${error.message}`);
  }
}

static async updateExternal(labinsp_id, labInspectData) {
  try {
    // ดึง Token จาก GlobalVar
    const token = GlobalVar.getToken();

    // ตรวจสอบว่า Token มีอยู่หรือไม่
    if (!token) {
      throw new Error("Token not found");
    }

    // กำหนด endpoint สำหรับการส่งคำขอ
    const endpoint = `/api/labs/update-to-external/${labinsp_id}`;
    
    // ส่งคำขอไปยัง API โดยส่ง labInspectData ทั้งออบเจ็กต์ไปแทน
    console.log("ข้อมูลการตรวจ LAB ที่จะส่ง:", labInspectData);
    const apiResponse = await ApiProvider.postData(endpoint, labInspectData, token); // ส่งทั้งออบเจ็กต์ labInspectData

    console.log("ผลลัพธ์จาก API:", apiResponse);
    return apiResponse;

  } catch (error) {
    console.error("Error sending data to external lab:", error.message || error);
    throw new Error(`Error: ${error.message}`);
  }
}

static async getHistoryPetId(petId, startDateForAPI, endDateForAPI, status, labinsp_labtype) {
  try {
    const token = GlobalVar.getToken(); // รับ token สำหรับการยืนยันตัวตน

    // สร้าง query string จากพารามิเตอร์
    const queryParams = new URLSearchParams({
      startDate: startDateForAPI || '',       // ถ้าไม่มีค่าให้ส่งเป็นค่าว่าง
      endDate: endDateForAPI || '',           // ถ้าไม่มีค่าให้ส่งเป็นค่าว่าง
      status: status || '',             // ถ้าไม่มีค่าให้ส่งเป็นค่าว่าง
      labinsp_labtype: labinsp_labtype || '' // ถ้าไม่มีค่าให้ส่งเป็นค่าว่าง
    }).toString();

    // สร้าง URL endpoint พร้อม query string
    const endpoint = `/api/labs/get-lab-inspect-history-by-petId/${petId}?${queryParams}`;
    console.log("API endpoint with queryParams:", endpoint);

    // เรียก API โดยส่ง URL endpoint พร้อม token
    const apiResponse = await ApiProvider.getData(endpoint, {}, token);
    console.log("API Response:", apiResponse);

    return apiResponse;

  } catch (error) {
    console.error("Error fetching history data:", error.message || error);
    throw new Error(`Error: ${error.message}`);
  }
}


static async getlabinspiId(labinspiId) {
  try {
    const token = GlobalVar.getToken(); // รับ token สำหรับการยืนยันตัวตน


    // สร้าง URL endpoint พร้อม query string
    const endpoint = `/api/labs/get-lab-inspect-item-result-by-labinspiId/${labinspiId}`;
    console.log("API endpoint with queryParams:", endpoint);

    // เรียก API โดยส่ง URL endpoint พร้อม token
    const apiResponse = await ApiProvider.getData(endpoint, {}, token);
    console.log("API Response:", apiResponse);

    return apiResponse;

  } catch (error) {
    console.error("Error fetching history data:", error.message || error);
    throw new Error(`Error: ${error.message}`);
  }
}


static async getlabNumber(labinsp_number) {
  try {
    const token = GlobalVar.getToken(); // รับ token สำหรับการยืนยันตัวตน


    // สร้าง URL endpoint พร้อม query string
    const endpoint = `/api/labs/get-lab-inspect-by-labnumber/${labinsp_number}`;
    console.log("API endpoint with queryParams:", endpoint);

    // เรียก API โดยส่ง URL endpoint พร้อม token
    const apiResponse = await ApiProvider.getData(endpoint, {}, token);
    console.log("API Response:", apiResponse);

    return apiResponse;

  } catch (error) {
    console.error("Error fetching labnumber data:", error.message || error);
    throw new Error(`Error: ${error.message}`);
  }
}

static async getLabPetNumber(labinspNum) {
  try {
    const token = GlobalVar.getToken(); // รับ token สำหรับการยืนยันตัวตน


    // สร้าง URL endpoint พร้อม query string
    const endpoint = `/api/labs/get-lab-inspect-pet-by-labnumber/${labinspNum}`;
    console.log("API endpoint with queryParams:", endpoint);

    // เรียก API โดยส่ง URL endpoint พร้อม token
    const apiResponse = await ApiProvider.getData(endpoint, {}, token);
    console.log("API Response:", apiResponse);

    return apiResponse;

  } catch (error) {
    console.error("Error fetching pet data:", error.message || error);
    throw new Error(`Error: ${error.message}`);
  }
}


static async inspectReject(labinspi_id, emp_id, payload) {
  try {
      const token = GlobalVar.getToken(); // รับ token สำหรับการยืนยันตัวตน
      const endpoint = `/api/labs/inspect-reject/${labinspi_id}/${emp_id}`;

      const apiResponse = await ApiProvider.postData(endpoint, payload, token);
      console.log("API Response:", apiResponse);

      return apiResponse;
  } catch (error) {
      console.error("Error fetching reject data:", error.message || error);
      throw new Error(`Error: ${error.message}`);
  }
}
static async inspectSpecimen(labinspi_id, emp_id, payload) {
  try {
      const token = GlobalVar.getToken(); // รับ token สำหรับการยืนยันตัวตน
      const endpoint = `/api/labs/inspect-specimen/${labinspi_id}/${emp_id}`;

      const apiResponse = await ApiProvider.postData(endpoint, payload, token);
      console.log("API Response:", apiResponse);

      return apiResponse;
  } catch (error) {
      console.error("Error fetching reject data:", error.message || error);
      throw new Error(`Error: ${error.message}`);
  }
}






  
}

export default LabsAPI;
