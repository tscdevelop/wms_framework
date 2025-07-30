import React, { useState, useEffect } from "react"; // นำเข้า useState และ useEffect จาก React
import {
  Grid,
  Card,
  TextField,
  Autocomplete,
} from "@mui/material"; // นำเข้า components จาก MUI (Material-UI)
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; // นำเข้า layout component
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // นำเข้า navbar component
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import ButtonComponent from "../components/ButtonComponent";
import MDTypography from "components/MDTypography";
import SweetAlertComponent from "../components/sweetAlert";
import * as lang from "utils/langHelper";
import WareHouseAPI from "api/WareHouseAPI";
import TableComponent from "../components/table_component"; 
import DropDownAPI from "api/DropDownAPI";
import { GlobalVar } from "../../../common/GlobalVar";
import MDButton from "components/MDButton";
const FactoryWareHouse = () => {
    // loading: ควบคุมสถานะการโหลดข้อมูลจาก API ถ้าเป็น true แสดงว่าข้อมูลกำลังโหลดอยู่
      // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [warehouseAll,setWareHouseAll] = useState([]);
    const [dropdownFty,setDropDownFty]= useState([]);
    const [dropdownWHType, setDropDownWHType] = useState([]); // เพิ่ม dropdown ประเภทคลัง
    const [selectedFty, setSelectedFty] = useState(null);
    const [selectedWHType, setSelectedWHType] = useState(null); // เพิ่ม state สำหรับประเภทคลัง
    const [warehouseForm, setWareHouseForm] = useState({
        wh_id: "",
        wh_code:"",
        wh_name:"",
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
    const [role, setRole] = useState("");
 
    useEffect(() => {
        const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
        setRole(userRole);
      }, []);
  

    // 🔎 ดึงข้อมูลโรงงาน
  const fetchDropdownFty = async () => {
    try {
      const response = await DropDownAPI.getFactoryDropdown();
      if (response.isCompleted && response.data.length > 0) {
        const data = response.data.map((item) => ({
          value: String(item.value),
          text: item.text,
        }));
        setDropDownFty(data);
      } else {
        console.error("Error fetching factory dropdown:", response.message);
      }
    } catch (error) {
      console.error("Error fetching factory dropdown:", error);
    }
  };

  // 🔎 ดึงข้อมูลประเภทคลัง
  const fetchDropdownWHType = async () => {
    try {
      const response = await DropDownAPI.getWHTypeDropdown();
      if (response.isCompleted && response.data.length > 0) {
        const data = response.data.map((item) => ({
          value: String(item.value),
          text: item.text,
        }));
        setDropDownWHType(data);
      } else {
        console.error("Error fetching warehouse type dropdown:", response.message);
      }
    } catch (error) {
      console.error("Error fetching warehouse type dropdown:", error);
    }
  };

  useEffect(() => {
    fetchDropdownFty();
    fetchDropdownWHType(); // ✅ ดึงข้อมูลประเภทคลัง
  }, []);


    const fetchDataAll = async () => {
        try{
          const response = await WareHouseAPI.getWareHouseAll();
          if(response.isCompleted){
            const data = response.data;
            setWareHouseAll(data);
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

      const fetchDataById = async (wh_id) => {
        try{
          const response = await WareHouseAPI.getWareHouseByID(wh_id);
          if(response.isCompleted){
            const Data =response.data;
            setWareHouseForm(Data); // อัปเดตฟอร์มด้วยข้อมูลที่ได้
            setMode("edit"); // เปลี่ยนโหมดเป็น edit

            const selected = dropdownFty.find((fty) => String(fty.value) === String(Data.fty_id));
            setSelectedFty(selected || null);

            // เพิ่มการแมปประเภทคลัง
            const selectedType = dropdownWHType.find(
              (type) => String(type.value).toUpperCase() === String(Data.wh_type).toUpperCase()
            );
            setSelectedWHType(selectedType || null);
          }
        }catch(error){
          console.error("Error fetching  data :",error);
        }finally{
          setLoading(false);
        }
      };

      
      
      // จัดการเปลี่ยนค่าของฟิลด์
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setWareHouseForm((prev) => ({
        ...prev,
        [name]: value,
        }));
        setErrors((prev) => ({ ...prev, [name]: "" })); 
    };

    const handleEdit = (wh_id) => {
        fetchDataById(wh_id); // ดึงข้อมูลจาก API และอัปเดตฟอร์ม
    };
    

    const validateForm = () => {
      const newErrors = {};
    
      // ตรวจสอบโรงงาน
      if (!selectedFty || !selectedFty.value) {
        newErrors.fty_id = "กรุณาเลือกโรงงาน";
      }
    
      // ตรวจสอบประเภทคลัง
      if (!selectedWHType || !selectedWHType.value) {
        newErrors.wh_type = "กรุณาเลือกประเภทคลัง";
      }
    
      // ตรวจสอบรหัสคลัง
      if (!warehouseForm.wh_code || !warehouseForm.wh_code.trim()) {
        newErrors.wh_code = "กรุณากรอกรหัสคลัง";
      }
    
      // ตรวจสอบชื่อคลัง
      if (!warehouseForm.wh_name || !warehouseForm.wh_name.trim()) {
        newErrors.wh_name = "กรุณากรอกชื่อคลัง";
      }
    
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0; // คืนค่า true หากไม่มีข้อผิดพลาด
    };
    

    // ฟังก์ชันสำหรับสร้างข้อมูลใหม่
  const handleSubmit = async (e) => {
    e.preventDefault();

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
        // สำหรับการเพิ่มข้อมูล ใช้ payload แบบ JSON
        const payload = {
            fty_id: selectedFty.value,
            wh_type: selectedWHType?.value,
            wh_code: warehouseForm.wh_code,
            wh_name: warehouseForm.wh_name,
        };
        response = await WareHouseAPI.createWareHouse(payload);
      } else {
        // สำหรับการอัปเดตข้อมูล ใช้ FormData
        const formData = new FormData();
        formData.append("fty_id", selectedFty.value);
        formData.append("wh_type", selectedWHType.value);
        formData.append("wh_code", warehouseForm.wh_code);
        formData.append("wh_name", warehouseForm.wh_name);
  
        response = await WareHouseAPI.updateWareHouse(warehouseForm.wh_id, formData);
      }
  
      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: mode === "add" ? "เพิ่มสำเร็จ" : "แก้ไขสำเร็จ",
          message: response.message,
        });
        await fetchDataAll(); // รีเฟรชข้อมูลในตาราง
        setWareHouseForm({
            wh_code: "",
            wh_name: "",
        });
        setSelectedWHType(null);
        setSelectedFty(null);
        setMode("add"); // เปลี่ยนกลับไปโหมด add
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
      const response = await WareHouseAPI.deleteWareHouse(deleteCode);
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
      console.error("Error during submit:", error);
    } finally {
      setConfirmAlert(false); // ซ่อน SweetAlert ยืนยัน
    }
  };




  
const handleFtyChange = (event, newValue) => {
  if (newValue) {
    setSelectedFty({ value: newValue.value, text: newValue.text });
  } else {
    setSelectedFty(null);
  }
};
const handleWHTypeChange = (event, newValue) => {
  setSelectedWHType(newValue || null);
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
    const response = await WareHouseAPI.importFile(selectedFile);
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



return (
  <DashboardLayout>
  <DashboardNavbar/>
  <MDBox p={2}>
    <MDBox mt={2} ml={5}>
      <MDTypography variant="h3" color="inherit">
      {lang.msg("title.warehouse")}
      </MDTypography>
    </MDBox>

    <MDBox mt={5}>
      <Card>
        <MDBox mt={3} p={3}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs ={12} md={6} lg={5}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4} lg={6}>
                <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                  <MDTypography variant="h6" color="inherit">
                  {lang.msg("warehouse.warehouse_code")}
                  <span style={{ color: "red" }}> *</span>
                  </MDTypography>
                </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDInput 
                    name= "wh_code"
                    value={warehouseForm.wh_code}
                    onChange={handleInputChange}
                    variant="outlined" 
                    fullWidth
                  />
                  {errors.wh_code && (
                    <MDTypography variant="caption" color="error">
                      {errors.wh_code}
                    </MDTypography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                  <MDTypography variant="h6" color="inherit">
                  {lang.msg("warehouse.warehouse_type")}
                   <span style={{ color: "red" }}> *</span>
                  </MDTypography>
                </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <Autocomplete
                    options={dropdownWHType} // ใช้ข้อมูลจาก API
                    getOptionLabel={(option) => option.text || ""} // ใช้ฟิลด์ text สำหรับแสดงใน dropdown
                    value={selectedWHType}
                    isOptionEqualToValue={(option, value) => String(option.value) === String(value?.value)} // ตรวจสอบความเท่าของค่า
                    onChange={handleWHTypeChange}
                    renderInput={(params) => (
                      <TextField
                      {...params}
                      placeholder="-- คลัง --"
                      variant="outlined"
                      />
                    )}
                    fullWidth
                  />
                   {errors.wh_type && (
                    <MDTypography variant="caption" color="error">
                      {errors.wh_type}
                    </MDTypography>
                  )}
                </Grid>


              </Grid>
            </Grid>

            <Grid item xs={12} md={5} lg={6}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4} lg={6}>
                <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                  <MDTypography variant="h6" color="inherit">
                  {lang.msg("warehouse.warehouse_name")}
                  <span style={{ color: "red" }}> *</span>
                  </MDTypography>
                </MDBox>
                </Grid>
                <Grid item xs={12} sm={8} lg={6}>
                  <MDInput 
                    name= "wh_name"
                    value={warehouseForm.wh_name}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                  />
                  {errors.wh_name && (
                    <MDTypography variant="caption" color="error">
                      {errors.wh_name}
                    </MDTypography>
                  )}
                </Grid>
                <Grid item xs={12} sm={4} lg={6}>
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <MDTypography variant="h6" color="inherit">
                    {lang.msg("warehouse.warehouse_fac")}
                    <span style={{ color: "red" }}> *</span>
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={8} lg={6}>
                  <Autocomplete
                    options={dropdownFty} // ใช้ข้อมูลจาก API
                    getOptionLabel={(option) => option.text || ""} // ใช้ฟิลด์ text สำหรับแสดงใน dropdown
                    value={selectedFty}
                    isOptionEqualToValue={(option, value) => String(option.value) === String(value?.value)} // ตรวจสอบความเท่าของค่า
                    onChange={handleFtyChange}
                    renderInput={(params) => (
                      <TextField
                      {...params}
                      placeholder="-- โรงงาน --"
                      variant="outlined"
                      />
                    )}
                    fullWidth
                  />
                  {errors.fty_id && (
                    <MDTypography variant="caption" color="error">
                      {errors.fty_id}
                    </MDTypography>
                  )}
                </Grid>
              </Grid>
            </Grid>
            
            
            <Grid item xs={12} lg={1}>
              <MDBox 
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="flex-end"
                height="100%"
                >
                <ButtonComponent  type={mode === "add" ? "add" : "edit"}  onClick={handleSubmit}/>
                  {mode === "edit" && (
                    <MDBox mt={2}> {/* เพิ่มระยะห่างด้านบน 2 หน่วย */}
                      <ButtonComponent
                        type="cancel"
                        onClick={() => {
                          setMode("add"); // กลับไปที่โหมด add
                          setWareHouseForm({
                              wh_code: "",
                              wh_name: "",
                          }); // ล้างค่าฟิลด์ทั้งหมด
                          setSelectedFty(null);
                          setSelectedWHType(null);
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

        <MDBox  p={5}>
          <Card>
            <TableComponent
              columns={[
              { field: "wh_code", label: lang.msg("warehouse.warehouse_code") ,width: "15%" },
              { field: "wh_name", label: lang.msg("warehouse.warehouse_name"),width: "30%" },
              { field: "wh_type", label: lang.msg("warehouse.warehouse_type"),width: "15%" },
              { field: "fty_name", label: lang.msg("warehouse.warehouse_fac"),width: "30%" },
              ]}
              data={warehouseAll}
              idField="wh_id"
              onEdit={(id) => {
              handleEdit(id);
              }}
              onDelete={(id)=> {
              setDeleteCode(id);
              setConfirmAlert(true);
              }}
              searchableColumns={["wh_code", "wh_name" ,"wh_type","fty_name"]}
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

export default FactoryWareHouse;





// <DashboardLayout>
//           <DashboardNavbar />
//           <MDBox p={2}>
//             <MDBox mt={2} ml={5}>
//                 <MDTypography variant="h3" color="dark" fontWeight="bold">
//                     {lang.msg("title.warehouse")}
//                 </MDTypography>
//             </MDBox>

//             <MDBox mt={5}>
//                 <Card>
//                     <MDBox mt={3} p={3}>
//                         <Grid container spacing={4} alignItems="center" justifyContent="center">
//                             {/* รหัสคลัง */}
//                             <Grid item xs={12} lg={5}>
//                             <MDBox display="flex" alignItems="center" justifyContent="flex-end">
//                                 <MDTypography
//                                 variant="body02"
//                                 sx={{
//                                     minWidth: "100px",
//                                     textAlign: "left",
//                                     marginRight: "25px",
//                                 }}
//                                 >
//                                 {lang.msg("warehouse.warehouse_code")}
//                                 </MDTypography>

//                                 <MDInput 
//                                 name= "wh_code"
//                                 value={warehouseForm.wh_code}
//                                 onChange={handleInputChange}
//                                 variant="outlined" 
//                                 sx={{ width: "300px" }} 
//                                 />
//                             </MDBox>
//                             </Grid>

//                             {/* ชื่อคลัง */}
//                             <Grid item xs={12} lg={5}>
//                             <MDBox display="flex" alignItems="center" justifyContent="flex-end">
//                                 <MDTypography
//                                 variant="body02"
//                                 sx={{
//                                     minWidth: "100px",
//                                     textAlign: "left",
//                                     marginRight: "25px",
//                                 }}
//                                 >
//                                 {lang.msg("warehouse.warehouse_name")}
//                                 </MDTypography>

//                                 <MDInput 
//                                 name= "wh_name"
//                                 value={warehouseForm.wh_name}
//                                 onChange={handleInputChange}
//                                 variant="outlined"
//                                  sx={{ width: "300px" }} />
//                             </MDBox>
//                             </Grid>

//                             {/* ปุ่มเพิ่ม */}
//                             <Grid item xs={12} lg={2}>
//                             <MDBox display="flex" justifyContent="center">
//                                 <ButtonComponent  type={mode === "add" ? "add" : "edit"}  onClick={handleSubmit}/>
//                             </MDBox>
//                             </Grid>
//                         </Grid>
//                     </MDBox>


//                     <MDBox  p={5}>
//                         <Card>
//                             <TableComponent
//                             columns={[
//                               { field: "wh_code", label: lang.msg("warehouse.warehouse_code") ,width: "5%" },
//                               { field: "wh_name", label: lang.msg("warehouse.warehouse_name"),width: "5%" },
//                             ]}
//                             data={warehouseAll}
//                             idField="wh_id"
//                             onEdit={(id) => {
//                               handleEdit(id);
//                             }}
//                             onDelete={(id)=> {
//                               setDeleteCode(id);
//                               setConfirmAlert(true);
//                             }}
//                             searchableColumns={["wh_code", "wh_name"]}
//                             />
//                         </Card>
//                     </MDBox>
//                 </Card>
//             </MDBox>
//         </MDBox>

//         {confirmAlert && (
//         <SweetAlertComponent
//           type="warning"
//           title="ยืนยันการลบ"
//           message="คุณต้องการลบข้อมูลนี้ใช่หรือไม่?"
//           show={confirmAlert}
//           showCancel
//           confirmText="ตกลง"
//           cancelText="ยกเลิก"
//           onConfirm={handleDelete}
//           onCancel={() => setConfirmAlert(false)}
//         />
//       )}


//           <SweetAlertComponent
//         show={alert.show}
//         type={alert.type}
//         title={alert.title}
//         message={alert.message}
//         onConfirm={() => setAlert({ ...alert, show: false })}
//       />
//         </DashboardLayout>