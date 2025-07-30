import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  MenuItem,
  FormControl,
   FormHelperText
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
import { GlobalVar } from "../../../common/GlobalVar";
import { StyledSelect } from "common/Global.style";
import DropDownAPI from "api/DropDownAPI";
import RawAPI from "api/RawMaterialAPI";
import MDButton from "components/MDButton";
const RawInfo = () =>{
// loading: ควบคุมสถานะการโหลดข้อมูลจาก API ถ้าเป็น true แสดงว่าข้อมูลกำลังโหลดอยู่
  // eslint-disable-next-line no-unused-vars
const [loading, setLoading] = useState(true);
const [RawAll,setRawAll] = useState([]);
const [Form,setForm] =useState({
    rmifm_id:"",
    rm_id:"",
    crt_id:"",
    rmifm_code:"",
    rmifm_name:"",
    rmifm_width:"",
    rmifm_width_unitId: "",
    rmifm_length: "",
    rmifm_length_unitId: "",
    rmifm_thickness: "",
    rmifm_thickness_unitId: "",
    rmifm_weight: "",
    rmifm_weight_unitId: "",
    rmifm_product_unitId: "",
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
const [dropdownUnit , setDropDownUnit] = useState([]);
const [dropdownRaw,setDropDownRaw]= useState([]);
const [dropdownCri,setDropDownCri]= useState([]); 
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
      const response = await RawAPI.getRawInfoAll();
  
      if(response.isCompleted){
        const data = response.data;
        setRawAll(data);
      }
    }catch(error){
      console.error("Error fetching  data : ",error);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() =>{
    fetchDataAll();
  },[]);


  const Dropdown = async () => {
    try{
        const response = await DropDownAPI.getUnitDropDown();
        if(response.isCompleted){
            const data = response.data;
            setDropDownUnit(data);
        }
    }catch(error){
        console.error("Error fetching  data :",error);
    }
  };

  
  useEffect(() =>{
    Dropdown();
  },[]);

  const DropdownRaw = async () => {
    try{
        const response = await DropDownAPI.getRawDropDown();
        if(response.isCompleted){
            const data = response.data;
            setDropDownRaw(data);
        }
    }catch(error){
        console.error("Error fetching  data :",error);
    }
  };


  useEffect(() =>{
    DropdownRaw();
  },[]);
  const DropdownCriter = async () => {
    try{
        const response = await DropDownAPI.getCriterDropdown();
        if(response.isCompleted){
            const data = response.data;
            setDropDownCri(data);
        }
    }catch(error){
        console.error("Error fetching  data :",error);
    }
  };


  useEffect(() =>{
    DropdownCriter();
  },[]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    let newValue = value;
  
    // ฟิลด์ที่ต้องเป็นตัวเลข และห้ามติดลบ
    const numericFields = [
      "rmifm_width",
      "rmifm_length",
      "rmifm_thickness",
      "rmifm_weight",
    ];
  
    if (numericFields.includes(name)) {
      // ถ้าค่าเป็น "." หรือมีจุดอยู่ตอนท้าย (เช่น "3.") ให้เก็บค่าเป็นสตริงไว้
      if (value === "." || value.slice(-1) === ".") {
        newValue = value;
      } else {
        newValue = Math.max(0, parseFloat(value) || 0);
      }
    }
  
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  




  const handleEdit = async (rmifm_id) => {
    try {
      const response = await RawAPI.getRawInfoByID(rmifm_id);
      if (response.isCompleted) {
        const Data = response.data;
  
        // ตรวจสอบค่าที่ได้จาก API
        console.log("Data from API:", Data);
  
        // แปลงค่าที่ไม่ใช่ string เป็น string เพื่อป้องกัน error
        setForm({
          ...Data,
          rmifm_width_unitId: Data.rmifm_width_unitId ? String(Data.rmifm_width_unitId) : "",
          rmifm_length_unitId: Data.rmifm_length_unitId ? String(Data.rmifm_length_unitId) : "",
          rmifm_thickness_unitId: Data.rmifm_thickness_unitId ? String(Data.rmifm_thickness_unitId) : "",
          rmifm_weight_unitId: Data.rmifm_weight_unitId ? String(Data.rmifm_weight_unitId) : "",
          rmifm_product_unitId: Data.rmifm_product_unitId ? String(Data.rmifm_product_unitId) : "",
        });
  
        setMode("edit");
      }
    } catch (error) {
      console.error("Error fetching data for edit:", error);
    }
  };
  



  const validateForm = () => {
    const newErrors = {};
  
    if (!Form.rmifm_code || String(Form.rmifm_code).trim() === "") {
      newErrors.rmifm_code = "กรุณากรอกรหัส Semi";
    }
  
    if (!Form.rmifm_name || String(Form.rmifm_name).trim() === "") {
      newErrors.rmifm_name = "กรุณากรอกชื่อ Semi";
    }
  
    if (!Form.rmifm_width || String(Form.rmifm_width).trim() === "") {
      newErrors.rmifm_width = "กรุณากรอกความกว้าง";
    }
  
    if (!Form.rmifm_width_unitId || String(Form.rmifm_width_unitId).trim() === "") {
      newErrors.rmifm_width_unitId = "กรุณาเลือกหน่วย";
    }
  
    if (!Form.rmifm_length || String(Form.rmifm_length).trim() === "") {
      newErrors.rmifm_length = "กรุณากรอกความยาว";
    }
  
    if (!Form.rmifm_length_unitId || String(Form.rmifm_length_unitId).trim() === "") {
      newErrors.rmifm_length_unitId = "กรุณาเลือกหน่วย";
    }
  
    if (!Form.rmifm_thickness || String(Form.rmifm_thickness).trim() === "") {
      newErrors.rmifm_thickness = "กรุณากรอกความหนา";
    }
  
    if (!Form.rmifm_thickness_unitId || String(Form.rmifm_thickness_unitId).trim() === "") {
      newErrors.rmifm_thickness_unitId = "กรุณาเลือกหน่วย";
    }
  
    if (!Form.rmifm_weight || String(Form.rmifm_weight).trim() === "") {
      newErrors.rmifm_weight = "กรุณากรอกน้ำหนัก";
    }
  
    if (!Form.rmifm_weight_unitId || String(Form.rmifm_weight_unitId).trim() === "") {
      newErrors.rmifm_weight_unitId = "กรุณาเลือกหน่วย";
    }
  
    if (!Form.rm_id || String(Form.rm_id).trim() === "") {
      newErrors.rm_id = "กรุณาเลือกประเภทวัตถุดิบ";
    }
  
    if (!Form.crt_id || String(Form.crt_id).trim() === "") {
      newErrors.crt_id = "กรุณาเลือกเกณฑ์";
    }
  
    if (!Form.rmifm_product_unitId || String(Form.rmifm_product_unitId).trim() === "") {
      newErrors.rmifm_product_unitId = "กรุณาเลือกหน่วยของ สินค้า";
    }
  
    setErrors(newErrors);
  
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
            rmifm_code: Form.rmifm_code || "",
            rm_id: Form.rm_id || "",
            crt_id: Form.crt_id || "",
            rmifm_name: Form.rmifm_name || "",
            rmifm_width: Form.rmifm_width || "",
            rmifm_width_unitId: Form.rmifm_width_unitId|| "",
            rmifm_length: Form.rmifm_length||"",
            rmifm_length_unitId:Form.rmifm_length_unitId|| "",
            rmifm_thickness:Form.rmifm_thickness|| "",
            rmifm_thickness_unitId:Form.rmifm_thickness_unitId|| "",
            rmifm_weight: Form.rmifm_weight||"",
            rmifm_weight_unitId:Form.rmifm_weight_unitId|| "",
            rmifm_product_unitId:Form.rmifm_product_unitId|| "",
        };
        response = await RawAPI.createRawInfo(payload);
      } else {
        // FormData สำหรับอัปเดตข้อมูล
        const formData = new FormData();
        formData.append("rmifm_code", Form.rmifm_code || "");
        formData.append("rm_id", Form.rm_id || "");
        formData.append("crt_id", Form.crt_id || "");
        formData.append("rmifm_name", Form.rmifm_name || "");
        formData.append("rmifm_width", Form.rmifm_width || "");
        formData.append("rmifm_width_unitId", Form.rmifm_width_unitId || "");
        formData.append("rmifm_length", Form.rmifm_length || "");
        formData.append("rmifm_length_unitId", Form.rmifm_length_unitId || "");
        formData.append("rmifm_thickness", Form.rmifm_thickness || "");
        formData.append("rmifm_thickness_unitId", Form.rmifm_thickness_unitId || "");
        formData.append("rmifm_weight", Form.rmifm_weight || "");
        formData.append("rmifm_weight_unitId", Form.rmifm_weight_unitId || "");
        formData.append("rmifm_product_unitId", Form.rmifm_product_unitId || "");
        response = await RawAPI.updateRawInfo(Form.rmifm_id, formData); // ใช้ API updateSupplier
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
            rmifm_id:"",
            rmifm_code:"",
            rmifm_name:"",
            rmifm_width:"",
            rmifm_width_unitId: "",
            rmifm_length: "",
            rmifm_length_unitId: "",
            rmifm_thickness: "",
            rmifm_thickness_unitId: "",
            rmifm_weight: "",
            rmifm_weight_unitId: "",
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
      const response = await RawAPI.deleteRawInfo(deleteCode);
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
      const response = await RawAPI.importFileInfo(selectedFile);
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
               {lang.msg("title.rawinfo")}
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
                            {lang.msg("raw_data.raw_code")}
                            </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <MDInput 
                              name="rmifm_code"
                              variant="outlined"
                              value={Form.rmifm_code}
                              onChange={handleInputChange}
                              sx={{ width: "300px", maxWidth: "100%" }}
                              error={!!errors.rmifm_code} // แสดงสีแดงถ้ามี error
                              helperText={errors.rmifm_code || ""} // แสดงข้อความเตือน
                              FormHelperTextProps={{
                                style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                            }}
                          />
                        </MDBox>
                      </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                            <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                                <MDTypography  variant="h6" color="inherit">
                                {lang.msg("raw_data.raw_width")}
                                </MDTypography>
                            </MDBox>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                          <MDBox display="flex" alignItems="flex-start"  justifyContent="center" gap={1}> 
                            {/* Input สำหรับความกว้าง */}
                            <MDInput
                              name="rmifm_width"
                              value={Form.rmifm_width || ""}
                              onChange={handleInputChange}
                              sx={{ width: "180px", maxWidth: "100%" }}
                              error={!!errors.rmifm_width}
                              helperText={errors.rmifm_width || ""}
                              FormHelperTextProps={{
                                style: { color: "red" },
                              }}
                            />

                            {/* Select สำหรับหน่วย */}
                            <FormControl error={!!errors.rmifm_width_unitId} sx={{ width: "120px" }}>
                              <StyledSelect
                                name="rmifm_width_unitId"
                                value={Form.rmifm_width_unitId || ""}
                                onChange={handleInputChange}
                                sx={{ width: "120px", maxWidth: "100%", height: "45px" }}
                              >
                                {(dropdownUnit || []).map((item) => (
                                  <MenuItem key={item.value} value={item.value}>
                                    {item.text}
                                  </MenuItem>
                                ))}
                              </StyledSelect>
                              {/* ข้อความแจ้งเตือน Error สำหรับ Select */}
                              {errors.rmifm_width_unitId && (
                                <FormHelperText sx={{ color: "red" }}>
                                  {errors.rmifm_width_unitId}
                                </FormHelperText>
                              )}
                            </FormControl>
                          </MDBox>
                        </Grid>

                        <Grid item xs={12} sm={6} lg={6}>
                            <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                                <MDTypography  variant="h6" color="inherit">
                                {lang.msg("raw_data.raw_thickness")}
                                </MDTypography>
                            </MDBox>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                          <MDBox display="flex" alignItems="flex-start"  justifyContent="center" gap={1}>
                          <MDInput
                                name="rmifm_thickness"
                                value={Form.rmifm_thickness || ""}
                                onChange={handleInputChange}
                                sx={{ width: "180px", maxWidth: "100%" }}
                                error={!!errors.rmifm_thickness} // แสดงสีแดงถ้ามี error
                                helperText={errors.rmifm_thickness || ""} // แสดงข้อความเตือน
                                FormHelperTextProps={{
                                  style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                }}
                            />
                            <FormControl  error={!!errors.rmifm_thickness_unitId} sx={{ width: "120px" }}>
                              <StyledSelect
                                  name="rmifm_thickness_unitId"
                                  value={Form.rmifm_thickness_unitId || ""}
                                  onChange={handleInputChange}
                                  sx={{ width: "120px", maxWidth: "100%" , height: "45px"}}
                                  FormHelperTextProps={{
                                    style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                  }}
                              >
                                  {(dropdownUnit || []).map((item) => (
                                      <MenuItem key={item.value} value={item.value}>
                                          {item.text}
                                      </MenuItem>
                                  ))}
                              </StyledSelect>
                              {errors.rmifm_thickness_unitId && (
                                  <FormHelperText sx={{ color: "red" }}>
                                    {errors.rmifm_thickness_unitId}
                                  </FormHelperText>
                                )}  
                            </FormControl>
                          </MDBox>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} lg={6}>
                            <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                                <MDTypography  variant="h6" color="inherit">
                                {lang.msg("raw_data.raw_type")}
                                </MDTypography>
                            </MDBox>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                          <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <FormControl  
                                error={!!errors.rm_id}
                                sx={{ width: "300px", maxWidth: "100%", display: "flex", flexDirection: "column" }} 
                              >
                               <StyledSelect
                                    name="rm_id"
                                    value={Form.rm_id || ""}
                                    onChange={handleInputChange}
                                    sx={{ width: "300px", maxWidth: "100%" , height: "45px"}}
                                    error={!!errors.rm_id} // แสดงสีแดงถ้ามี error
                                    helperText={errors.rm_id || ""} // แสดงข้อความเตือน
                                    FormHelperTextProps={{
                                      style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                    }}
                                >
                                    {( dropdownRaw|| []).map((item) => (
                                        <MenuItem key={item.value} value={item.value}>
                                            {item.text}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                                {errors.rm_id && (
                                  <FormHelperText sx={{ color: "red" }}>
                                    {errors.rm_id}
                                  </FormHelperText>
                                )}
                              </FormControl>
                            </MDBox>
                        </Grid>

                        <Grid item xs={12} sm={6} lg={6}>
                            <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                                <MDTypography  variant="h6" color="inherit">
                                {lang.msg("raw_data.raw_criterion")}
                                </MDTypography>
                            </MDBox>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6} >
                            <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                            <FormControl  
                                error={!!errors.crt_id}
                                sx={{ width: "300px", maxWidth: "100%", display: "flex", flexDirection: "column" }} 
                              >
                                <StyledSelect
                                name="crt_id"
                                value={Form.crt_id || ""}
                                onChange={handleInputChange}
                                sx={{ width: "300px", maxWidth: "100%" , height: "45px"}}
                                error={!!errors.crt_id}
                                helperText={errors.crt_id || ""} 
                            >
                                {(dropdownCri || []).map((item) => (
                                    <MenuItem key={item.value} value={item.value}>
                                        {item.text}
                                    </MenuItem>
                                ))}
                            </StyledSelect>
                                {errors.crt_id && (
                                  <FormHelperText sx={{ color: "red" }}>
                                    {errors.crt_id}
                                  </FormHelperText>
                                )}
                              </FormControl>
                            </MDBox>
                        </Grid>
                    </Grid>
                  </Grid>
  
                  <Grid item xs={12} md={5} lg={6}>
                    <Grid container  spacing={3}   alignItems="center" >
                        <Grid item xs={12} sm={6} lg={6}>
                            <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                                <MDTypography  variant="h6" color="inherit">
                                {lang.msg("raw_data.raw_name")}
                                </MDTypography>
                            </MDBox>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                            <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                              <MDInput 
                                  name="rmifm_name"
                                  variant="outlined"
                                  value={Form.rmifm_name}
                                  onChange={handleInputChange}
                                  sx={{ width: "300px", maxWidth: "100%" }}
                                  error={!!errors.rmifm_name} // แสดงสีแดงถ้ามี error
                                  helperText={errors.rmifm_name || ""} // แสดงข้อความเตือน
                                  FormHelperTextProps={{
                                    style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                }}
                              />
                            </MDBox>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                            <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                                <MDTypography  variant="h6" color="inherit">
                                {lang.msg("raw_data.raw_length")}
                                </MDTypography>
                            </MDBox>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                            <MDBox display="flex"   alignItems="flex-start"  justifyContent="center" gap={1}>
                              <MDInput
                                  name="rmifm_length"
                                  value={Form.rmifm_length || ""}
                                  onChange={handleInputChange}
                                  sx={{ width: "180px", maxWidth: "100%" }}
                                  error={!!errors.rmifm_length} // แสดงสีแดงถ้ามี error
                                  helperText={errors.rmifm_length || ""} // แสดงข้อความเตือน
                                  FormHelperTextProps={{
                                    style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                  }}
                              /> 
                              <FormControl  error={!!errors.rmifm_length_unitId} sx={{ width: "120px" }}>
                                <StyledSelect
                                  name="rmifm_length_unitId"
                                  value={Form.rmifm_length_unitId || ""}
                                  onChange={handleInputChange}
                                  sx={{ width: "120px", maxWidth: "100%" , height: "45px"}}
                                >
                                  {(dropdownUnit || []).map((item) => (
                                      <MenuItem key={item.value} value={item.value}>
                                          {item.text}
                                      </MenuItem>
                                  ))}
                                </StyledSelect>
                                {errors.rmifm_length_unitId && (
                                  <FormHelperText sx={{ color: "red" }}>
                                    {errors.rmifm_length_unitId}
                                  </FormHelperText>
                                )}
                              </FormControl>
                            </MDBox>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                            <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                                <MDTypography  variant="h6" color="inherit">
                                {lang.msg("raw_data.raw_weight")}
                                </MDTypography>
                            </MDBox>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                            <MDBox display="flex"  alignItems="flex-start"  justifyContent="center" gap={1}>
                              <MDInput
                                  name="rmifm_weight"
                                  value={Form.rmifm_weight || ""}
                                  onChange={handleInputChange}
                                  sx={{ width: "180px", maxWidth: "100%" }}
                                  error={!!errors.rmifm_weight} // แสดงสีแดงถ้ามี error
                                  helperText={errors.rmifm_weight || ""} // แสดงข้อความเตือน
                                  FormHelperTextProps={{
                                    style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                  }}
                              />
                              <FormControl  error={!!errors.rmifm_weight_unitId} sx={{ width: "120px" }}>
                                <StyledSelect
                                    name="rmifm_weight_unitId"
                                    value={Form.rmifm_weight_unitId || ""}
                                    onChange={handleInputChange}
                                    sx={{ width: "120px", maxWidth: "100%" , height: "45px"}}
                                >
                                    {(dropdownUnit || []).map((item) => (
                                        <MenuItem key={item.value} value={item.value}>
                                            {item.text}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                                {errors.rmifm_weight_unitId && (
                                  <FormHelperText sx={{ color: "red" }}>
                                    {errors.rmifm_weight_unitId}
                                  </FormHelperText>
                                )}
                              </FormControl>
                            </MDBox>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                            <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                                <MDTypography  variant="h6" color="inherit">
                                {lang.msg("raw_data.raw_Unit_product")}
                                </MDTypography>
                            </MDBox>
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                            <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                              <FormControl  
                                error={!!errors.rmifm_product_unitId}
                                sx={{ width: "300px", maxWidth: "100%", display: "flex", flexDirection: "column" }} 
                              >
                                <StyledSelect
                                    name="rmifm_product_unitId"
                                    value={Form.rmifm_product_unitId || ""}
                                    onChange={handleInputChange}
                                    sx={{ width: "300px", maxWidth: "100%" , height: "45px"}}
                                    error={!!errors.rmifm_product_unitId}
                                    helperText={errors.rmifm_product_unitId || ""} 
                                >
                                    {(dropdownUnit || []).map((item) => (
                                        <MenuItem key={item.value} value={item.value}>
                                            {item.text}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                                {errors.rmifm_product_unitId && (
                                  <FormHelperText sx={{ color: "red" }}>
                                    {errors.rmifm_product_unitId}
                                  </FormHelperText>
                                )}
                              </FormControl>
                            </MDBox>
                        </Grid>
                        <Grid item xs={12}  />
                        <Grid item xs={12}  />
                        <Grid item xs={12}  />
                    </Grid>
                  </Grid>
                     
                    <Grid item xs={12}  lg={1}>
                      <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="flex-end" height="100%">
                        <ButtonComponent type={mode === "add" ? "add" : "edit"} onClick={handleSubmit} />
                        {mode === "edit" && (
                          <MDBox mt={2}> {/* เพิ่มระยะห่างด้านบน 2 หน่วย */}
                            <ButtonComponent
                              type="cancel"
                              onClick={() => {
                                setMode("add"); // กลับไปที่โหมด add
                                setForm({
                                    rmifm_id:"",
                                    rmifm_code:"",
                                    rmifm_name:"",
                                    rmifm_width:"",
                                    rmifm_width_unitId: "",
                                    rmifm_length: "",
                                    rmifm_length_unitId: "",
                                    rmifm_thickness: "",
                                    rmifm_thickness_unitId: "",
                                    rmifm_weight: "",
                                    rmifm_weight_unitId: "",
                                }); // ล้างค่าฟิลด์ทั้งหมด
                                
                              }}
                            />
                          </MDBox>
                        )}
                      </MDBox>
                    </Grid>
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
                    { field: "rmifm_code", label: lang.msg("raw_data.raw_code"), width: "5%" },
                    { field: "rmifm_name", label: lang.msg("raw_data.raw_name"), width: "10%" },
                    {  
                        label: lang.msg("raw_data.raw_size"), 
                        subColumns:[
                            {field: "rmifm_width_with_name",label:lang.msg("raw_data.raw_width"), width: "5%"},
                            {field: "rmifm_length_with_name",label:lang.msg("raw_data.raw_length"), width: "5%"},
                            {field: "rmifm_thickness_with_name",label:lang.msg("raw_data.raw_thickness"), width: "5%"},
                        ],
                    },
                    { field: "rmifm_weight_with_name", label: lang.msg("raw_data.raw_Unit_weight"), width: "10%" },
                    { field: "rmifm_product_with_name", label: lang.msg("raw_data.raw_unit"), width: "10%" },
                    { field: "crt_exp", label: lang.msg("raw_data.raw_exp_cri"), width: "10%" },
                    { field: "crt_rem", label: lang.msg("raw_data.raw_rem_cri"), width: "10%" },
                  ]}
                  data={RawAll}
                  idField="rmifm_id"
                  onEdit={(id) => {
                    handleEdit(id);
                  }}
                  onDelete={(id) => {
                    setDeleteCode(id);
                    setConfirmAlert(true);
                  }}
                  searchableColumns={["rmifm_code", "rmifm_name","rmifm_width_with_name","rmifm_length_with_name","rmifm_thickness_with_name","rmifm_weight_with_name"]} // กรองเฉพาะฟิลด์ที่กำหนด
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

export default RawInfo;