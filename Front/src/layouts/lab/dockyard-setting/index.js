import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  Autocomplete,
  TextField
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
import TransPortYardAPI from "api/TransPortYardAPI";
import DropDownAPI from "api/DropDownAPI";
import { GlobalVar } from "../../../common/GlobalVar";
import MDButton from "components/MDButton";
// import Role from "../role";
const Dockyard = () =>{
 // loading: ควบคุมสถานะการโหลดข้อมูลจาก API ถ้าเป็น true แสดงว่าข้อมูลกำลังโหลดอยู่
 // eslint-disable-next-line no-unused-vars
 const [loading, setLoading] = useState(true);
 const [TsyardAll,setTsyardAlll] = useState([]);
 const [Form,setForm] = useState({
    tspyard_id:"",
    tspyard_code:"",
    tspyard_name:"",
    tspyard_remark:"",
    tspyard_address:"",
    tspyard_phone:"",
 });
 const [errors, setErrors] = useState({});
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
  const [dropdownFactory,setDropDownFactory]= useState([]);
  const [selected,setSelected]=useState(null);
  const [role, setRole] = useState("");
  // const [PermissionAction, setPermissionAction] = useState({
  //   ACT_EDIT: false, 
  // });

  useEffect(() => {
      const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
      setRole(userRole);
    }, []);


  const fetchDropdown = async () => {
    try {
      const response = await DropDownAPI.getFactoryDropdown(); // Replace this with your actual API call
      if (response.isCompleted && response.data.length > 0) {
        setDropDownFactory(response.data); // Set position data from API
      } else {
        console.error("Error fetching position data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching position:", error);
    }
  };
  
  useEffect(() => {
    fetchDropdown(); // Fetch department data when component loads
  }, []);


  const fetchDataAll = async () => {
    try{
      const response = await TransPortYardAPI.getTransYardAll();
  
      if(response.isCompleted){
        const data = response.data;
        setTsyardAlll(data);
      }
    }catch(error){
      console.error("Error fetching data:",error);
    }finally{
      setLoading(false);
    }
  };
  
  useEffect(() =>{
    fetchDataAll();
  },[]);

// จัดการเปลี่ยนค่าของฟิลด์
const handleInputChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "tspyard_phone") {
      newValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    }
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" })); 
  };
  
  const handleDropdownChange = (event, newValue) => {
    setSelected(newValue || null);
  };

  const handleEdit = async (tspyard_id) => {
    try {
      const response = await TransPortYardAPI.getTransYardByID(tspyard_id);
      if (response.isCompleted) {
        const Data = response.data;
        // อัปเดต ZoneForm
        setForm(Data);

        const selected = dropdownFactory.find((sup) => String(sup.value) === String(Data.fty_id));
        setSelected(selected || null);
  

        // เปลี่ยนโหมดเป็น edit
        setMode("edit");
      }
    } catch (error) {
      console.error("Error fetching data for edit:", error);
    }
  };


  const validateForm = () => {
    const newErrors = {};
  
    if (!Form.tspyard_code || !Form.tspyard_code.trim()) {
      newErrors.tspyard_code = "กรุณากรอกรหัสท่ารถ";
    }
  
    if (!Form.tspyard_name || !Form.tspyard_name.trim()) {
      newErrors.tspyard_name = "กรุณากรอกชื่อท่ารถ";
    }
  
    if (!Form.tspyard_phone || !Form.tspyard_phone.trim()) {
      newErrors.tspyard_phone = "กรุณากรอกเบอร์ติดต่อ";
    } else if (!/^\d{10}$/.test(Form.tspyard_phone)) {
      newErrors.tspyard_phone = "หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก";
    }
  
    if (!Form.tspyard_address || !Form.tspyard_address.trim()) {
      newErrors.tspyard_address = "กรุณากรอกที่อยู่";
    }
  
    if (!selected || !selected.value) {
      newErrors.fty_id = "กรุณาเลือกโรงงาน";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if there are no errors
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
            fty_id: selected?.value || "",
            tspyard_code: Form.tspyard_code || "",
            tspyard_name: Form.tspyard_name || "",
            tspyard_remark: Form.tspyard_remark || "",
            tspyard_address: Form.tspyard_address || "",
            tspyard_phone: Form.tspyard_phone || "",
        };
        console.log("Add Payload:", payload);
        response = await TransPortYardAPI.createTransYard(payload);
      } else {
        // FormData สำหรับอัปเดตข้อมูล
        const formData = new FormData();
        formData.append("fty_id", selected?.value || "");
        formData.append("tspyard_code", Form.tspyard_code || "");
        formData.append("tspyard_name", Form.tspyard_name || "");
        formData.append("tspyard_remark", Form.tspyard_remark || "");
        formData.append("tspyard_address", Form.tspyard_address || "");
        formData.append("tspyard_phone", Form.tspyard_phone || "");
  
        console.log("Update FormData:", formData);
        response = await TransPortYardAPI.updateTransYard(Form.tspyard_id, formData); // ใช้ API updateSupplier
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
          tspyard_id:"",
          tspyard_code:"",
          tspyard_name:"",
          tspyard_remark:"",
          tspyard_address:"",
          tspyard_phone:"",
        });
        setSelected(null); // ล้างค่า dropdown
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
      const response = await TransPortYardAPI.deleteTransYard(deleteCode);
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
        console.error("Error fetching ", error);
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
      const response = await TransPortYardAPI.importFile(selectedFile);
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
               {lang.msg("title.dockyard")}
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
                          {lang.msg("dockyard.dock_code")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <MDInput 
                            name="tspyard_code"
                            variant="outlined"
                            value={Form.tspyard_code}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        {errors.tspyard_code && (
                          <MDTypography variant="caption" color="error">
                            {errors.tspyard_code}
                          </MDTypography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography  variant="h6" color="inherit">
                          {lang.msg("dockyard.dock_name")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <MDInput 
                            name="tspyard_name"
                            variant="outlined"
                            value={Form.tspyard_name}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        {errors.tspyard_name && (
                          <MDTypography variant="caption" color="error">
                            {errors.tspyard_name}
                          </MDTypography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography  variant="h6" color="inherit">
                          {lang.msg("dockyard.dock_phone")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <MDInput 
                            name="tspyard_phone"
                            variant="outlined"
                            value={Form.tspyard_phone}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        {errors.tspyard_phone && (
                          <MDTypography variant="caption" color="error">
                            {errors.tspyard_phone}
                          </MDTypography>
                        )}
                      </Grid>
                     
                      <Grid item xs={12} sm={6} lg={6}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <MDTypography variant="h6" color="inherit">
                          {lang.msg("factory.factory")}
                          <span style={{ color: "red" }}> *</span>
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <Autocomplete
                          fullWidth
                          options={dropdownFactory}
                          getOptionLabel={(option) => option.text || ""}
                          value={selected}
                          onChange={handleDropdownChange}
                          renderInput={(params) => (
                            <TextField
                             {...params} 
                            fullWidth
                            />
                          )}
                          />
                          {errors.fty_id  && (
                          <MDTypography variant="caption" color="error">
                            {errors.fty_id }
                          </MDTypography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
  
                  <Grid item xs={12} md={5} lg={6}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="flex-start" height="100%">
                        <MDTypography  variant="h6" color="inherit">
                          {lang.msg("dockyard.dock_address")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <MDInput 
                            name="tspyard_address"
                            multiline
                            rows={8}
                            variant="outlined"
                            value={Form.tspyard_address}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        {errors.tspyard_address  && (
                          <MDTypography variant="caption" color="error">
                            {errors.tspyard_address }
                          </MDTypography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography  variant="h6" color="inherit">
                          {lang.msg("dockyard.dock_remark")}
                        </MDTypography>
                      </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                      <MDInput 
                        name="tspyard_remark"
                        variant="outlined"
                        value={Form.tspyard_remark}
                        onChange={handleInputChange}
                        fullWidth
                      />
                      
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
                                setForm({
                                  tspyard_id:"",
                                  tspyard_code:"",
                                  tspyard_name:"",
                                  tspyard_remark:"",
                                  tspyard_address:"",
                                  tspyard_phone:"",
                                });// ล้างค่าฟิลด์ทั้งหมด
                                setSelected(null);
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
                        { field: "tspyard_code", label: lang.msg("dockyard.code"), width: "5%"},
                        { field: "tspyard_name", label: lang.msg("dockyard.dockyard"), width: "5%"},
                        { field: "tspyard_address", label: lang.msg("dockyard.dock_address"),cellStyle: () => ({
                          whiteSpace: "normal",      // ปรับให้เป็น multiline
                          wordBreak: "break-word",     // ไม่ตัดคำ
                          minWidth: 400,         // ป้องกันการบีบเกินไป
                          maxWidth: 600,         // จำกัดความกว้างไม่ให้เกิน
                        }),},
                        { field: "tspyard_phone", label: lang.msg("dockyard.dock_phone"), width: "5%"},
                        { field: "fty_name", label: lang.msg("factory.factory"), width: "5%"},
                        { field: "tspyard_remark" ,label: lang.msg("dockyard.dock_remark"), width: "5%"},
                    ]}
                    data={TsyardAll}
                    idField="tspyard_id"
                    onEdit={(id) => {
                        handleEdit(id);
                    }}
                    onDelete={(id) => {
                        setDeleteCode(id);
                        setConfirmAlert(true);
                    }}
                    searchableColumns={["tspyard_code","tspyard_name"]}
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

export default Dockyard;