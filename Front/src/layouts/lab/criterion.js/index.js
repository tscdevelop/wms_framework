import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import TableComponent from "../components/table_component";
import * as lang from "utils/langHelper";
import CriteriaAPI from "api/CriteriaAPI";
import { GlobalVar } from "../../../common/GlobalVar";
import MDButton from "components/MDButton";


const Criterion = () =>{
// loading: ควบคุมสถานะการโหลดข้อมูลจาก API ถ้าเป็น true แสดงว่าข้อมูลกำลังโหลดอยู่
// eslint-disable-next-line no-unused-vars
const [loading, setLoading] = useState(true);
const [crtAll,setCrtAll] = useState([]);
const [Form,setForm] =useState({
  crt_id : "",
  crt_name:"",
  crt_remark:"",
  crt_exp_low:"",
  crt_exp_medium:"",
  crt_exp_high:"",
  crt_txn_low:"",
  crt_txn_medium:"",
  crt_txn_high:"",
  crt_rem_low:"",
  crt_rem_medium:"",
  crt_rem_high:"",
});
const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
const [confirmAlert, setConfirmAlert] = useState(false); 
const [confirmSubmit, setConfirmSubmit] = useState(false);
const [confirmEdit, setConfirmEdit] = useState(false); 
const [errors, setErrors] = useState({});
const [deleteCode, setDeleteCode] = useState(""); // รหัสโรงงานที่จะลบ
const [mode, setMode] = useState("add"); // ตัวแปรเพื่อจัดการโหมด add/edit
const [role, setRole] = useState("");
     

 useEffect(() => {
        const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
        setRole(userRole);
      }, []);



const fetchDataAll = async () => {
    try{
      const response = await CriteriaAPI.getCriteriaAll();
  
      if(response.isCompleted){
        const data = response.data;
        setCrtAll(data);
      }
    }catch(error){
      console.error("Error fetching  data :",error);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() =>{
    fetchDataAll();
  },[]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    let newValue = value;
    
    // เช็คว่าฟิลด์เป็นตัวเลขหรือไม่ ถ้าเป็นให้ใช้ Math.max(0, value)
    if (["crt_exp_low", "crt_exp_medium", "crt_exp_high", "crt_txn_low", "crt_txn_medium", "crt_txn_high", "crt_rem_low", "crt_rem_medium", "crt_rem_high"].includes(name)) {
      newValue = Math.max( parseFloat(value));
    }
  
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  




  const handleEdit = async (crt_id ) => {
    try {
      const response = await CriteriaAPI.getCriteriaByID(crt_id );
      if (response.isCompleted) {
        const Data = response.data;
        // อัปเดต ZoneForm
        setForm(Data);
        // เปลี่ยนโหมดเป็น edit
        setMode("edit");
      }
    } catch (error) {
      console.error("Error fetching data for edit:", error);
    }
  };






  const validateForm = () => {
    const newErrors = {};
  
    if (!Form.crt_name || String(Form.crt_name).trim() === "") {
      newErrors.crt_name = "กรุณากรอกชื่อเกณฑ์";
    }
  
    setErrors(newErrors);
  
    // Return true if no errors, otherwise false
    return Object.keys(newErrors).length === 0;
  };
  


// ฟังก์ชันสำหรับสร้างข้อมูลใหม่
const handleSubmit = async (e) => {
    e.preventDefault();
  

  // Show confirmation dialog before proceeding
  if (mode === "edit") {
    setConfirmEdit(true); // แสดง SweetAlert สำหรับการแก้ไข
  } else {
    setConfirmSubmit(true); // แสดง SweetAlert สำหรับการเพิ่ม
  }
  };


  const handleConfirmSubmit = async () => {
  if (!validateForm()) {
    setConfirmSubmit(false); // Close the dialog if validation fails
    setConfirmEdit(false);
    return;
  }


    try {
      let response;
  
      if (mode === "add") {
        // Payload สำหรับเพิ่มข้อมูล
        const payload = {
          crt_name: Form.crt_name || "",
          crt_remark: Form.crt_remark || "",
          crt_exp_low: Form.crt_exp_low || "",
          crt_exp_medium: Form.crt_exp_medium || "",
          crt_exp_high: Form.crt_exp_high || "",
          crt_txn_low: Form.crt_txn_low || "",
          crt_txn_medium: Form.crt_txn_medium || "",
          crt_txn_high: Form.crt_txn_high || "",
          crt_rem_low: Form.crt_rem_low || "",
          crt_rem_medium: Form.crt_rem_medium || "",
          crt_rem_high: Form.crt_rem_high || "",
        };
        response = await CriteriaAPI.createCriteria(payload);
      } else {
        // FormData สำหรับอัปเดตข้อมูล
        const formData = new FormData();
        formData.append("crt_name", Form.crt_name || "");
        formData.append("crt_remark", Form.crt_remark || "");
        formData.append("crt_exp_low", Form.crt_exp_low || "");
        formData.append("crt_exp_medium", Form.crt_exp_medium || "");
        formData.append("crt_exp_high", Form.crt_exp_high || "");
        formData.append("crt_txn_low", Form.crt_txn_low || "");
        formData.append("crt_txn_medium", Form.crt_txn_medium || "");
        formData.append("crt_txn_high", Form.crt_txn_high || "");
        formData.append("crt_rem_low", Form.crt_rem_low || "");
        formData.append("crt_rem_medium", Form.crt_rem_medium || "");
        formData.append("crt_rem_high", Form.crt_rem_high || "");
        response = await CriteriaAPI.updateCriteria(Form.crt_id , formData); // ใช้ API updateSupplier
      }
  
      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: mode === "add" ? "เพิ่มสำเร็จ" : "แก้ไขสำเร็จ",
          message: response.message,
        });
        await fetchDataAll(); // โหลดข้อมูลใหม่
        setForm({
          crt_id : "",
          crt_name:"",
          crt_remark:"",
          crt_exp_low:"",
          crt_exp_medium:"",
          crt_exp_high:"",
          crt_txn_low:"",
          crt_txn_medium:"",
          crt_txn_high:"",
          crt_rem_low:"",
          crt_rem_medium:"",
          crt_rem_high:"",
        });
        setMode("add");
      } else {
        setAlert({
          show: true,
          type: "error",
          title: mode === "add" ? "เพิ่มไม่สำเร็จ" : "แก้ไขไม่สำเร็จ",
          message: response.message,
        });
      }
    } catch (error) {
      console.error("Error during submit:", error);
    }finally {
      setConfirmSubmit(false); // Close the confirmation dialog
      setConfirmEdit(false); 
    }
  };




  const handleDelete = async () => {
    try {
      const response = await CriteriaAPI.deleteCriteria(deleteCode);
      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: "ลบสำเร็จ",
          message: response.message,
        });
        await fetchDataAll();
      } else {
        setAlert({
          show: true,
          type: "error",
          title: "ลบไม่สำเร็จ",
          message: response.message,
        });
      }
    } catch (error) {
        console.error("Error :", error);
    } finally {
      setConfirmAlert(false); // ซ่อน SweetAlert ยืนยัน
    }
  };


  
  // นำเข้า useState หากยังไม่ได้ import
  const [selectedFile, setSelectedFile] = useState(null);
  // state สำหรับ key ของ input element เพื่อบังคับ re-mount
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // ปรับปรุง handleImportFile ให้เก็บไฟล์ที่เลือกไว้ใน state
  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setAlert({
        show: true,
        type: "error",
        title: "ข้อผิดพลาด",
        message: "กรุณาเลือกไฟล์ก่อนทำการอัปโหลด",
      });
      return;
    }
    console.log("📌 ไฟล์ที่เลือก:", file);
    setSelectedFile(file);
  };

  // ฟังก์ชันสำหรับส่งไฟล์ที่เลือกไปยัง API
  const handleSubmitImport = async () => {
    if (!selectedFile) return;
    try {
      const response = await CriteriaAPI.importFile(selectedFile);
      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: "อัปโหลดสำเร็จ",
          message: response.message,
        });
        await fetchDataAll();
        // เคลียร์ไฟล์ที่เลือก และอัปเดต key เพื่อให้ input re-mount ใหม่
        setSelectedFile(null);
        setFileInputKey(Date.now());
      } else {
        setAlert({
          show: true,
          type: "error",
          title: "อัปโหลดไม่สำเร็จ",
          message: response.message,
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  // ฟังก์ชันสำหรับลบไฟล์ที่เลือก (และรีเซ็ต input)
  const handleClearFile = () => {
    setSelectedFile(null);
    setFileInputKey(Date.now());
  };

  return(
    <DashboardLayout>
        <DashboardNavbar/>
        <MDBox p={2}>
          <MDBox mt={2} ml={5}>
            <MDTypography variant="h3" color="dark" fontWeight="bold">
               {lang.msg("title.criterion")}
            </MDTypography>
          </MDBox>
  
          <MDBox mt={5}>
            <Card>
              <MDBox mt={3} p={3}>
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs ={12} md={6} lg={5}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} lg={6}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                            <MDTypography  variant="h6" color="inherit">
                            {lang.msg("crt.crt_name")}
                            </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <MDInput 
                            name="crt_name"
                            variant="outlined"
                            value={Form.crt_name}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!errors.crt_name} // แสดงสีแดงถ้ามี error
                            helperText={errors.crt_name || ""} // แสดงข้อความเตือน
                            FormHelperTextProps={{
                              style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                            }}
                        />
                      </Grid>
                      
                    </Grid>
                  </Grid>
  
                  <Grid item xs={12} md={5} lg={6}>
                    <Grid container  spacing={3}   alignItems="center" >
                    <Grid item xs={12} sm={6} lg={6}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <MDTypography  variant="h6" color="inherit">
                            {lang.msg("crt.crt_remark")}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                            <MDInput 
                                name="crt_remark"
                                variant="outlined"
                                value={Form.crt_remark}
                                onChange={handleInputChange}
                                fullWidth
                                
                            />
                        </Grid>
                      
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                  <MDBox display="flex"  alignItems="center" height="100%"  sx={{ ml: 10}}>
                          <MDTypography  variant="h6" color="inherit">
                          {lang.msg("crt.crt_exp")}
                          </MDTypography>
                        </MDBox>
                  </Grid>

                  <Grid item xs ={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} lg={2}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <MDTypography  variant="h6" color="inherit">
                           Low Level
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center" height="100%">
                          {/* Input อยู่ด้านซ้าย */}
                          <MDInput
                            name="crt_exp_low"
                            variant="outlined"
                            value={Form.crt_exp_low}
                            onChange={handleInputChange}
                            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, "")} 
                            type="number"
                            sx={{ width: "150px", maxWidth: "100%" }}
                            
                          />
                          {/* Typography อยู่ด้านขวา */}
                          <MDTypography variant="h6" color="inherit" sx={{ marginLeft: "10px" }}>
                          {lang.msg("crt.crt_day")}
                          </MDTypography>
                        </MDBox>
                      </Grid>

                      <Grid item xs={12} lg={2}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <MDTypography  variant="h6" color="inherit">
                            Medium Level
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center" height="100%">
                          {/* Input อยู่ด้านซ้าย */}
                          <MDInput
                            name="crt_exp_medium"
                            variant="outlined"
                            value={Form.crt_exp_medium}
                            onChange={handleInputChange}
                            type="number"
                            sx={{ width: "150px", maxWidth: "100%" }}
                           
                          />
                          {/* Typography อยู่ด้านขวา */}
                          <MDTypography variant="h6" color="inherit" sx={{ marginLeft: "10px" }}>
                          {lang.msg("crt.crt_day")}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} lg={2}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <MDTypography  variant="h6" color="inherit">
                          High Level
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center" height="100%">
                          {/* Input อยู่ด้านซ้าย */}
                          <MDInput
                            name="crt_exp_high"
                            variant="outlined"
                            value={Form.crt_exp_high}
                            onChange={handleInputChange}
                            type="number"
                            sx={{ width: "150px", maxWidth: "100%" }}
                            
                          />
                          {/* Typography อยู่ด้านขวา */}
                          <MDTypography variant="h6" color="inherit" sx={{ marginLeft: "10px" }}>
                          {lang.msg("crt.crt_day")}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                    </Grid>
                  </Grid>


                  <Grid item xs={12}>
                        <MDBox display="flex"  alignItems="center" height="100%"  sx={{ ml: 10}}>
                          <MDTypography  variant="h6" color="inherit">
                          {lang.msg("crt.crt_withdraw")}
                          </MDTypography>
                        </MDBox>
                  </Grid>

                  <Grid item xs ={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} lg={2}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <MDTypography  variant="h6" color="inherit">
                           Low Level
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center" height="100%">
                          {/* Input อยู่ด้านซ้าย */}
                          <MDInput
                            name="crt_txn_low"
                            variant="outlined"
                            value={Form.crt_txn_low}
                            onChange={handleInputChange}
                            type="number"
                            sx={{ width: "150px", maxWidth: "100%" }}
                            
                          />
                          {/* Typography อยู่ด้านขวา */}
                          <MDTypography variant="h6" color="inherit" sx={{ marginLeft: "10px" }}>
                          {lang.msg("crt.crt_day")}
                          </MDTypography>
                        </MDBox>
                      </Grid>

                      <Grid item xs={12} lg={2}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <MDTypography  variant="h6" color="inherit">
                            Medium Level
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center" height="100%">
                          {/* Input อยู่ด้านซ้าย */}
                          <MDInput
                            name="crt_txn_medium"
                            variant="outlined"
                            value={Form.crt_txn_medium}
                            onChange={handleInputChange}
                            type="number"
                            sx={{ width: "150px", maxWidth: "100%" }}
                          
                          />
                          {/* Typography อยู่ด้านขวา */}
                          <MDTypography variant="h6" color="inherit" sx={{ marginLeft: "10px" }}>
                          {lang.msg("crt.crt_day")}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} lg={2}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <MDTypography  variant="h6" color="inherit">
                          High Level
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center" height="100%">
                          {/* Input อยู่ด้านซ้าย */}
                          <MDInput
                            name="crt_txn_high"
                            variant="outlined"
                            value={Form.crt_txn_high}
                            onChange={handleInputChange}
                            type="number"
                            sx={{ width: "150px", maxWidth: "100%" }}
                            
                          />
                          {/* Typography อยู่ด้านขวา */}
                          <MDTypography variant="h6" color="inherit" sx={{ marginLeft: "10px" }}>
                          {lang.msg("crt.crt_day")}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                        <MDBox display="flex"  alignItems="center" height="100%"  sx={{ ml: 10}}>
                          <MDTypography  variant="h6" color="inherit">
                          {lang.msg("crt.crt_remaining")}
                          </MDTypography>
                        </MDBox>
                  </Grid>

                  <Grid item xs ={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} lg={2}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <MDTypography  variant="h6" color="inherit">
                           Low Level
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center" height="100%">
                          {/* Input อยู่ด้านซ้าย */}
                          <MDInput
                            name="crt_rem_low"
                            variant="outlined"
                            value={Form.crt_rem_low}
                            onChange={handleInputChange}
                            type="number"
                            sx={{ width: "150px", maxWidth: "100%" }}
                      
                          
                          />
                          {/* Typography อยู่ด้านขวา */}
                         
                        </MDBox>
                      </Grid>

                      <Grid item xs={12} lg={2}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <MDTypography  variant="h6" color="inherit">
                            Medium Level
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center" height="100%">
                          {/* Input อยู่ด้านซ้าย */}
                          <MDInput
                            name="crt_rem_medium"
                            variant="outlined"
                            value={Form.crt_rem_medium}
                            onChange={handleInputChange}
                            type="number"
                            sx={{ width: "150px", maxWidth: "100%" }}
                         
                          />
                          {/* Typography อยู่ด้านขวา */}
                         
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} lg={2}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <MDTypography  variant="h6" color="inherit">
                          High Level
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center" height="100%">
                          {/* Input อยู่ด้านซ้าย */}
                          <MDInput
                            name="crt_rem_high"
                            variant="outlined"
                            value={Form.crt_rem_high}
                            onChange={handleInputChange}
                            type="number"
                            sx={{ width: "150px", maxWidth: "100%" }}
                            
                          />
                          {/* Typography อยู่ด้านขวา */}
                         
                        </MDBox>
                      </Grid>
                    </Grid>
                  </Grid>


                     
                    
                </Grid>
              </MDBox>

              <MDBox pt={2} pr={6}>
                      <Grid item xs={12} >
                        <MDBox display="flex" flexDirection="column" alignItems="flex-end" justifyContent="flex-end" height="100%">
                          <ButtonComponent type={mode === "add" ? "add" : "edit"} onClick={handleSubmit} />
                          {mode === "edit" && (
                            <MDBox mt={2}> {/* เพิ่มระยะห่างด้านบน 2 หน่วย */}
                              <ButtonComponent
                                type="cancel"
                                onClick={() => {
                                  setMode("add"); // กลับไปที่โหมด add
                                  setForm({
                                    crt_id : "",
                                    crt_name:"",
                                    crt_remark:"",
                                    crt_exp_low:"",
                                    crt_exp_medium:"",
                                    crt_exp_high:"",
                                    crt_txn_low:"",
                                    crt_txn_medium:"",
                                    crt_txn_high:"",
                                    crt_rem_low:"",
                                    crt_rem_medium:"",
                                    crt_rem_high:"",
                                  }); // ล้างค่าฟิลด์ทั้งหมด
                                  
                                }}
                              />
                            </MDBox>
                          )}
                        </MDBox>
                      </Grid>
                     </MDBox>
  
              <MDBox pt={2} pr={3}>
              <Grid item xs={12}>
                <Grid container alignItems="center" justifyContent="flex-end" spacing={2}>
                  {/* ปุ่มนำเข้าไฟล์เป็นตัวแรก */}
                  <Grid item>
                    <MDBox mb={0} mr={2.5}>
                      <MDInput
                        key={fileInputKey}
                        type="file"
                        accept=".xlsx"
                        style={{ display: "none" }}
                        id="import-file"
                        onChange={handleImportFile}
                      />
                      <label htmlFor="import-file">
                        <MDButton variant="contained" component="span" color="info">
                          นำเข้าไฟล์ Excel
                        </MDButton>
                      </label>
                    </MDBox>
                  </Grid>

                  {/* เมื่อมีไฟล์แล้วจึงแสดง ชื่อไฟล์ → ปุ่มลบไฟล์ → ปุ่มยืนยัน ถัดไปทางขวา */}
                  {selectedFile && (
                    <>
                      <Grid item>
                        <MDTypography variant="body2">{selectedFile.name}</MDTypography>
                      </Grid>

                      <Grid item>
                        <ButtonComponent onClick={handleClearFile} type="iconDelete" />
                      </Grid>

                      <Grid item>
                        <ButtonComponent type="Confirm" onClick={handleSubmitImport} />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>
            </MDBox>

              <MDBox p={5}>
              <Card>
                <TableComponent
                  columns={[
                    { field: "crt_name", label: lang.msg("crt.crt_name"), width: "5%" },
                    {  
                      label: lang.msg("fg_data.fg_size"), 
                      subColumns:[
                          {field: "crt_exp",label:lang.msg("crt.crt_exp_lmh"), width: "5%"},
                          {field: "crt_txn",label:lang.msg("crt.crt_withdraw_lmh"), width: "5%"},
                          {field: "crt_rem",label:lang.msg("crt.crt_remaining_lmh"), width: "5%"},
                      ],
                    },
                    { field: "crt_remark", label: lang.msg("crt.crt_remark"), width: "5%" },
                  ]}
                  data={crtAll}
                  idField="crt_id"
                  onEdit={(id) => {
                    handleEdit(id);
                  }}
                  onDelete={(id) => {
                    setDeleteCode(id);
                    setConfirmAlert(true);
                  }}
                  searchableColumns={["semi_code", "semi_type"]} // กรองเฉพาะฟิลด์ที่กำหนด
                  hiddenActions={["barcode","settings","print"]}
                  userRole={role}
                />
              </Card>
            </MDBox>
  
            </Card>
          </MDBox>
        </MDBox>
        {confirmAlert && (
      <SweetAlertComponent
      type="error"
      title="ยืนยันการลบ"
      message="คุณต้องการลบข้อมูลนี้ใช่หรือไม่?"
      show={confirmAlert}
      showCancel
      confirmText="ตกลง"
      cancelText="ยกเลิก"
      onConfirm={handleDelete}
      onCancel={() => setConfirmAlert(false)}
      />
      )}


    {confirmSubmit && (
        <SweetAlertComponent
          type="info"
          title="เพิ่ม"
          message="ยืนยันการเพิ่มรายการใช่หรือไม่?"
          show={confirmSubmit}
          showCancel
          confirmText="ยืนยัน"
          cancelText="ยกเลิก"
          onConfirm={handleConfirmSubmit} // Proceed with the submission
          onCancel={() => setConfirmSubmit(false)} // Close the dialog without submitting
        />
      )}


      {confirmEdit && (
        <SweetAlertComponent
          type="warning"
          title="แก้ไข"
          message="ยืนยันการแก้ไขรายการใช่หรือไม่?"
          show={confirmEdit}
          showCancel
          confirmText="ยืนยัน"
          cancelText="ยกเลิก"
          onConfirm={handleConfirmSubmit} // ฟังก์ชันสำหรับยืนยันการแก้ไข
          onCancel={() => setConfirmEdit(false)} // ปิด dialog
        />
      )}

      <SweetAlertComponent
      show={alert.show}
      type={alert.type}
      title={alert.title}
      message={alert.message}
      onConfirm={() => setAlert({ ...alert, show: false })}
      />
      </DashboardLayout>
  );

};

export default Criterion;