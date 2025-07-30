import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class EmployeeAPI {
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


  static async getEmployeeDataById(employee_id) {
    try {
      const user = GlobalVar.getUsername();
      const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar
      // const username = GlobalVar.getUsername(); // ดึง username จาก GlobalVar
      console.log("getUsername",user);
      console.log("getEmployeeDataById Token:", token);
      // console.log("getEmployeeDataById Username:", username);

      const endpoint = `/api/employees/get/${employee_id}`; // กำหนด endpoint สำหรับเรียก API
      const apiResponse = await ApiProvider.getData(endpoint, {}, token); // เรียก API เพื่อดึงข้อมูลพนักงาน
      return apiResponse;

    } catch (error) {
      console.error("Error in employee :", error);
          throw new Error(`Error: ${error.message}`);
      }
  }

  static async updateEmployeeData(emp_id,form) {
    try {
      const token = GlobalVar.getToken(); // Ensure token retrieval
     

      const endpoint = `/api/employees/update/${emp_id}`; // Correct endpoint
      const apiResponse = await ApiProvider.putData(endpoint, form, token); // Sending PUT request

    
      return apiResponse;

    } catch (error) {
      console.error("Error in employee :", error);
      throw new Error(`Error: ${error.message}`);
    }
}

  static async deleteEmployee(employee_id) {
    try {
      const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar
  
      const endpoint = `/api/employees/delete/${employee_id}`; // กำหนด endpoint สำหรับเรียก API
      const apiResponse = await ApiProvider.deleteData(endpoint, {}, token); // เรียก API เพื่อทำการลบข้อมูลพนักงาน

     
      return apiResponse;
    } catch (error) {
     
      console.error("Error in employee :", error);
        throw new Error(`Error: ${error.message}`);
      
    }
  }

  static async searchEmployeesAll() {
    try {
      const token = GlobalVar.getToken();
      const endpoint = "/api/employees/search";
      
      // ทำการเรียก API ด้วย token และ endpoint
      const response = await ApiProvider.getData(endpoint, {}, token);
      console.log("API Response:", response);
      
      return response; // ส่งค่ากลับไป
    } catch (error) {
      console.error("Error in employee :", error);
      throw error;
    }
  }

  // static async searchEmployees(filters) {
  //   try {
  //     const token = GlobalVar.getToken(); // ดึง token จาก GlobalVar
       
  //     if (!token) {
  //       return new ApiResponse({
  //         isCompleted: false,
  //         isError: true,
  //         message: 'Token not found in GlobalVar',
  //         data: null,
  //         error: 'Token not found in GlobalVar'
  //       });
  //     }
  
  //     const endpoint = `/api/employees/search`; // กำหนด endpoint สำหรับเรียก API
  //     console.log("filters : ", filters);
  //     const apiResponse = await ApiProvider.getData(endpoint, filters, token); // เรียก API เพื่อค้นหาข้อมูลพนักงาน
  //     console.log("apiResponse : ", apiResponse);
  
  //     return new ApiResponse({
  //       isCompleted: true,
  //       isError: false,
  //       message: 'Success',
  //       data: apiResponse,
  //       error: null
  //     });
  
  //   } catch (error) {
  //     console.error('Error searching employees:', error.response ? error.response.data : error.message || error);
  //     return new ApiResponse({
  //       isCompleted: false,
  //       isError: true,
  //       message: error.message || 'Error searching employees',
  //       data: null,
  //       error: error.message || 'Error searching employees'
  //     });
  //   }
  // }

  static async createEmployee(form) {
    try {
      const token = GlobalVar.getToken(); // Get token from GlobalVar
      // const username = GlobalVar.getUsername(); // Get username from GlobalVar
  
  
      const endpoint = "/api/employees/create"; // Define API endpoint
      
      // Log details for debugging
  
      
  
      const apiResponse = await ApiProvider.postData(endpoint, form, token); // Make API request
  
      
      return apiResponse;
    } catch (error) {
      
      console.error("Error creating customer and pet:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }

  static async addUserToEmployee(employee_employee_id, user_id, userForm) {
    try {
      const token = GlobalVar.getToken();

      

      const endpoint = `/api/employees/save-user/${employee_employee_id}/${user_id}`;
      const apiResponse = await ApiProvider.postData(endpoint, userForm, token);
      console.log("API Response:", apiResponse);
      
      return apiResponse;
    } catch (error) {
      console.error("Error employees:", error.message || error);
      throw new Error(`Error: ${error.message}`);
      
    }
  }

  static async getEmployeeDataByUserId(selectedUserId) {
    try { 
      const token = GlobalVar.getToken();

      


      const endpoint = `/api/employees/get-by-user-id/${selectedUserId}`;
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);

      
      return apiResponse;
    } catch (error) {
      console.error("Error employees:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }
  
  static async getEmployeeDataByUsername() {
    try {
      const username = GlobalVar.getUsername();
      const token = GlobalVar.getToken();
      console.log("getEmployeeDataByUsername Token:", token);
    

      const endpoint = `/api/employees/get-by-user-username/${username}`;
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);

      return apiResponse;

    } catch (error) {
      console.error("Error creating customer and pet:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }

  static async getEmployeeUserId() {
    try { 
      const token = GlobalVar.getToken();
      const userId = GlobalVar.getUserId();
    

      const endpoint = `/api/employees/get-by-user-id/${userId}`;
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);

    
      return apiResponse;
      
    } catch (error) {
      console.error("Error creating customer and pet:", error.message || error);
            throw new Error(`Error: ${error.message}`);
    }
  }

  static async getEmployeeDepartmentDropdown() {
    try { 
      const token = GlobalVar.getToken();
      const hospital_code  = GlobalVar.getHospitalCode();
    
      const endpoint = `/api/dropdown/get-departments-dropdown/${hospital_code}`;
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);
      
      // return new ApiResponse({
      //   isCompleted: apiResponse.isCompleted,
      //   isError: apiResponse.isError,
      //   message: apiResponse.message,
      //   data: apiResponse.data,
      //   error: apiResponse.error
      // });
      
      return apiResponse;
    } catch (error) {
      // return new ApiResponse({
      //   isCompleted: false,
      //   isError: true,
      //   message: error.message || 'Error calling API for user data',
      //   data: null,
      //   error: error.message || 'Error calling API for user data'
      // });
    }
  }

  static async getEmployeePositionDropdown() {
    try { 
      const token = GlobalVar.getToken();
      const hospital_code  = GlobalVar.getHospitalCode();
    
      const endpoint = `/api/dropdown/get-positions-dropdown/${hospital_code}`;
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);

      return new ApiResponse({
        isCompleted: apiResponse.isCompleted,
        isError: apiResponse.isError,
        message: apiResponse.message,
        data: apiResponse.data,
        error: apiResponse.error
      });

    } catch (error) {
      return new ApiResponse({
        isCompleted: false,
        isError: true,
        message: error.message ,
        data: null,
        error: error.message 
      });
    }
  }

  static async getEmployeeDropdown(hops) {
    try { 
      const token = GlobalVar.getToken();
    
      const endpoint = `/api/dropdown/get-employee-dropdown/${hops}`;
      const apiResponse = await ApiProvider.getData(endpoint, {}, token);

      return apiResponse;

    } catch (error) {
      console.error("Error fetching lab Inspect item result data:", error.message || error);
      console.error("Error fetching data:", error.message || error);
      throw new Error(`Error: ${error.message}`);
    }
  }


}

export default EmployeeAPI;
