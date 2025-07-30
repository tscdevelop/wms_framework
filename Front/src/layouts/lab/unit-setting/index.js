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
import UnitAPI from "api/UnitAPI";
import { GlobalVar } from "../../../common/GlobalVar";
import MDButton from "components/MDButton";
const Unit = () =>{
// loading: ควบคุมสถานะการโหลดข้อมูลจาก API ถ้าเป็น true แสดงว่าข้อมูลกำลังโหลดอยู่
// eslint-disable-next-line no-unused-vars
const [loading, setLoading] = useState(true);
const [unitAll,setUnitAll] = useState([]);
const [unitForm,setUnitForm] =useState({
    unit_id: "",
    unit_name_th: "",
    unit_name_en: "",
    unit_abbr_th: "",
    unit_abbr_en: "",
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
const [deleteCode, setDeleteCode] = useState(""); // รหัสโรงงานที่จะลบ
const [mode, setMode] = useState("add"); // ตัวแปรเพื่อจัดการโหมด add/edit
const [errors, setErrors] = useState({});
const [role, setRole] = useState("");
 
useEffect(() => {
    const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
    setRole(userRole);
  }, []);


const fetchDataAll = async () => {
    try{
      const response = await UnitAPI.getUnitAll();
  
      if(response.isCompleted){
        const data = response.data;
        setUnitAll(data);
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


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUnitForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" })); 
  };



  const handleEdit = async (unit_id) => {
    try {
      const response = await UnitAPI.getUnitByID(unit_id);
      if (response.isCompleted) {
        const Data = response.data;
        // อัปเดต ZoneForm
        setUnitForm(Data);
        // เปลี่ยนโหมดเป็น edit
        setMode("edit");
      }
    } catch (error) {
      console.error("Error fetching data for edit:", error);
    }
  };


  const validateForm = () => {
    const newErrors = {};
  
    if (!unitForm.unit_name_th || !unitForm.unit_name_th.trim()) {
      newErrors.unit_name_th = "กรุณากรอกชื่อหน่วยภาษาไทย";
    }
  
    if (!unitForm.unit_name_en || !unitForm.unit_name_en.trim()) {
      newErrors.unit_name_en = "กรุณากรอกชื่อหน่วยภาษาอังกฤษ";
    }
  
    if (!unitForm.unit_abbr_th || !unitForm.unit_abbr_th.trim()) {
      newErrors.unit_abbr_th = "กรุณากรอกคำย่อหน่วยภาษาไทย";
    }
  
    if (!unitForm.unit_abbr_en || !unitForm.unit_abbr_en.trim()) {
      newErrors.unit_abbr_en = "กรุณากรอกคำย่อหน่วยภาษาอังกฤษ";
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
            unit_name_th: unitForm.unit_name_th || "",
            unit_name_en: unitForm.unit_name_en || "",
            unit_abbr_th: unitForm.unit_abbr_th || "",
            unit_abbr_en: unitForm.unit_abbr_en || "",
        };
        response = await UnitAPI.createUnit(payload);
      } else {
        // FormData สำหรับอัปเดตข้อมูล
        const formData = new FormData();
        formData.append("unit_name_th", unitForm.unit_name_th || "");
        formData.append("unit_name_en", unitForm.unit_name_en || "");
        formData.append("unit_abbr_th", unitForm.unit_abbr_th || "");
        formData.append("unit_abbr_en", unitForm.unit_abbr_en || "");
        response = await UnitAPI.updateUnit(unitForm.unit_id, formData); // ใช้ API updateSupplier
      }
  
      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: mode === "add" ? "เพิ่มสำเร็จ" : "แก้ไขสำเร็จ",
          message: response.message,
        });
        await fetchDataAll(); // โหลดข้อมูลใหม่
        setUnitForm({
          unit_id: "",
          unit_name_th: "",
          unit_name_en: "",
          unit_abbr_th: "",
          unit_abbr_en: "",
        }); // ล้างค่าฟิลด์ทั้งหมด
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
      const response = await UnitAPI.deleteUnit(deleteCode);
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
      const response = await UnitAPI.importFile(selectedFile);
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
            <MDTypography  variant="h3" color="inherit">
               {lang.msg("title.unit")}
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
                          หน่วย
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                      <MDInput 
                        name="unit_name_th"
                        variant="outlined"
                        value={unitForm.unit_name_th}
                        onChange={handleInputChange}
                        fullWidth
                      />
                      {errors.unit_name_th && (
                        <MDTypography variant="caption" color="error">
                          {errors.unit_name_th}
                        </MDTypography>
                      )}
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography  variant="h6" color="inherit">
                          Unit
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                      <MDInput 
                        name="unit_name_en"
                        variant="outlined"
                        value={unitForm.unit_name_en}
                        onChange={handleInputChange}
                        fullWidth
                      />
                      {errors.unit_name_en && (
                        <MDTypography variant="caption" color="error">
                          {errors.unit_name_en}
                        </MDTypography>
                      )}
                      </Grid>
                    </Grid>
                  </Grid>
  
                  <Grid item xs={12} md={5} lg={6}>
                    <Grid container  spacing={3}>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography  variant="h6" color="inherit">
                          หน่วย(คำย่อ)
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                      <MDInput 
                        name="unit_abbr_th"
                        variant="outlined"
                        value={unitForm.unit_abbr_th}
                        onChange={handleInputChange}
                        fullWidth
                      />
                      {errors.unit_abbr_th && (
                        <MDTypography variant="caption" color="error">
                          {errors.unit_abbr_th}
                        </MDTypography>
                      )}
                      </Grid>
  
                      <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography  variant="h6" color="inherit">
                            Unit(Abbreviation)
                            <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                      <MDInput 
                        name="unit_abbr_en"
                        variant="outlined"
                        value={unitForm.unit_abbr_en}
                        onChange={handleInputChange}
                        fullWidth
                      />
                      {errors.unit_abbr_en && (
                        <MDTypography variant="caption" color="error">
                          {errors.unit_abbr_en}
                        </MDTypography>
                      )}
                      </Grid>
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
                                setUnitForm({
                                  unit_id: "",
                                  unit_name_th: "",
                                  unit_name_en: "",
                                  unit_abbr_th: "",
                                  unit_abbr_en: "",
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
                        { field: "unit_name_th", label: "หน่วย", width: "20%"},
                        { field: "unit_abbr_th", label: "หน่วย(คำย่อ)", width: "20%"},
                        { field: "unit_name_en", label: "Unit", width: "20%"},
                        { field: "unit_abbr_en", label: "Unit(Abbreviation)", width: "20%"},   
                    ]}
                    data={unitAll}
                    idField="unit_id"
                    onEdit={(id) => {
                        handleEdit(id);
                    }}
                    onDelete={(id) => {
                        setDeleteCode(id);
                        setConfirmAlert(true);
                    }}
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
      type="warning"
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
export default Unit;