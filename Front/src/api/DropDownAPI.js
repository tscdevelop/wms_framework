import { GlobalVar } from "../common/GlobalVar";
import ApiProvider from "./ApiProvider";
import ApiResponse from "../common/ApiResponse";

class DropDownAPI {
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



      static async getRawDropDown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-raw-material-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get raw-material:", error);
          throw error;
        }
      }
      
      static async getFGDropDown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-finished-goods-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get finished-goods:", error);
          throw error;
        }
      }

      static async getToolingDropDown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-tooling-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get tooling:", error);
          throw error;
        }
      }

      static async getSemiFGDropDown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-semi-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get semi:", error);
          throw error;
        }
      }

      static async getUnitDropDown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-unit-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get raw-material:", error);
          throw error;
        }
      }

      static async getLocationDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-location-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get location:", error);
          throw error;
        }
      }

      static async getLocationByDropdown(zn_id) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = `/api/dropdown/get-location-dropdown/${zn_id}`;
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get location:", error);
          throw error;
        }
      }

      static async getSupplierDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-supplier-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get supplier:", error);
          throw error;
        }
      }

      static async getZoneDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-zone-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get Zone:", error);
          throw error;
        }
      }

      static async getZoneByDropdown(wh_id) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = `/api/dropdown/get-zone-dropdown/${wh_id}`;
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get Zone:", error);
          throw error;
        }
      }

      static async getWareHouseDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-warehouse-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get warehouse:", error);
          throw error;
        }
      }

      static async getWHTypeDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-warehouse-type-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get warehouse:", error);
          throw error;
        }
      }

      static async getWareHouseByFacDropdown(fty_id) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = `/api/dropdown/get-warehouse-dropdown/${fty_id}`;
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get warehouse:", error);
          throw error;
        }
      }

      static async getFactoryDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-factory-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get factory:", error);
          throw error;
        }
      }

      static async getInbFactoryDropdown(user_id) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = `/api/dropdown/get-inbound-factory-dropdown/${user_id}`;
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get factory:", error);
          throw error;
        }
      }
      static async getInbWHDropdown(fty_id) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = `/api/dropdown/get-inbound-warehouse-dropdown/${fty_id}`;
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get WH:", error);
          throw error;
        }
      }
     
      static async getInboundRawDropdown(isBomUsed, inbrm_bom) {
        try {
          const token = GlobalVar.getToken();
         
          const endpoint = `/api/dropdown/get-inbound-raw-material-dropdown?isBomUsed=${isBomUsed}&inbrm_bom=${inbrm_bom}`;
         
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get inbound-raw-material:", error);
          throw error;
        }
      }

      static async getInboundFGDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-inbound-finished-goods-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get inbound-finished-goods:", error);
          throw error;
        }
      }

      static async getInboundSemiFGDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-inbound-semi-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get inboundsemi:", error);
          throw error;
        }
      }
      static async getInboundToolingDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-inbound-tooling-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get inbound-tooling:", error);
          throw error;
        }
      }

      static async getSoNumberDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-so-number";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get so:", error);
          throw error;
        }
      }

      static async getBomNumDropdown(so_id) {
        try {
          const token = GlobalVar.getToken();
          const endpoint = `/api/dropdown/get-bom-number/${so_id}`;
          
          
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get bom:", error);
          throw error;
        }
      }

      static async getTransPostDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-transport-yard-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get transport-yard:", error);
          throw error;
        }
      }

      static async getRawInfoDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-raw-material-information-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get raw-material:", error);
          throw error;
        }
      }
      
      static async getFgInfoDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-finished-goods-information-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get finished-goods:", error);
          throw error;
        }
      }
      
      static async getToolingInfoDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-tooling-information-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get tooling:", error);
          throw error;
        }
      }

      static async getSemiInfoDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-semi-information-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get semi:", error);
          throw error;
        }
      }

      static async getCriterDropdown() {
        try {
          const token = GlobalVar.getToken();
          const endpoint = "/api/dropdown/get-criteria-dropdown";
          
          // ทำการเรียก API ด้วย token และ endpoint
          const response = await ApiProvider.getData(endpoint, {}, token);
          console.log("API Response:", response);
          
          return response; // ส่งค่ากลับไป
        } catch (error) {
          console.error("Error in get criteria-dropdown:", error);
          throw error;
        }
      }

}

export default DropDownAPI;