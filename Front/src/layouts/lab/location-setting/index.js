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
import LocationAPI from "api/LocationAPI";
import DropDownAPI from "api/DropDownAPI";
import { GlobalVar } from "../../../common/GlobalVar";
import MDButton from "components/MDButton";
const LocationSetting = () => {
 // loading: ควบคุมสถานะการโหลดข้อมูลจาก API ถ้าเป็น true แสดงว่าข้อมูลกำลังโหลดอยู่
 // eslint-disable-next-line no-unused-vars
 const [loading, setLoading] = useState(true);
 const [LocationAll ,setLocationAll] = useState([]); // ข้อมูลทั้งหมด
 const [LocationForm, setLocationForm] = useState({
  zn_id: "",
  loc_id: "",
  loc_code: "",
  loc_name: "",
  loc_remark: "",
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
const [dropdownFty,setDropDownFty]= useState([]);
const [selectedFty, setSelectedFty] = useState(null);
const [dropdownZone,setDropDownZone]= useState([]);
const [selectedZone, setSelectedZone] = useState(null); // เก็บค่าที่เลือกจาก dropdown
const [dropdownWH,setDropDownWH]= useState([]);
const [selectedWH, setSelectedWH] = useState(null); // เก็บค่าที่เลือกจาก dropdown
const [errors, setErrors] = useState({});
const [role, setRole] = useState("");
 
  useEffect(() => {
      const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
      setRole(userRole);
    }, []);


const fetchDataAll = async () => {
  try{
    const response = await LocationAPI.getLocationAll();

    if(response.isCompleted){
      const data = response.data;
      setLocationAll(data);
      console.log("ZoneAll:", data); // ตรวจสอบข้อมูลที่ดึงมา
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


const fetchDropdownWH = async (fty_id) => {
  if (!fty_id) {
    setDropDownWH([]);
    setSelectedWH(null);
    return [];
  }

  try {
    const response = await DropDownAPI.getWareHouseByFacDropdown(fty_id);
    if (response.isCompleted && response.data.length > 0) {
      const formattedData = response.data.map((item) => ({
        value: String(item.value),
        text: item.text,
      }));
      setDropDownWH(formattedData);
      return formattedData; // ✅ คืนค่าข้อมูล
    } else {
      console.error("Error fetching dropdown data:", response.message);
      setDropDownWH([]);
      return [];
    }
  } catch (error) {
    console.error("Error fetching dropdown:", error);
    return [];
  }
};


// ดึงข้อมูล Zone ตามคลังสินค้า
const fetchDropdownZone = async (wh_id) => {
  if (!wh_id) {
    setDropDownZone([]);
    setSelectedZone(null);
    return [];
  }

  try {
    const response = await DropDownAPI.getZoneByDropdown(wh_id);
    if (response.isCompleted && response.data.length > 0) {
      const formattedData = response.data.map((item) => ({
        value: String(item.value),
        text: item.text,
      }));
      setDropDownZone(formattedData);
      return formattedData; // ✅ คืนค่าข้อมูล
    } else {
      console.error("Error fetching zone dropdown:", response.message);
      setDropDownZone([]);
      return [];
    }
  } catch (error) {
    console.error("Error fetching zone dropdown:", error);
    return [];
  }
};


useEffect(() => {
    fetchDropdownFty();
    fetchDropdownWH(); 
    fetchDropdownZone();
  }, []);


  const handleEdit = async (loc_id) => {
    try {
      const response = await LocationAPI.getLocationByID(loc_id);
      if (response.isCompleted) {
        const locData = response.data;
  
        // อัปเดต LocationForm ด้วยข้อมูลที่ดึงมา
        setLocationForm({
          loc_id: locData.loc_id,
          loc_code: locData.loc_code,
          loc_name: locData.loc_name,
          loc_remark: locData.loc_remark || "",
        });
  
        // 🔍 ค้นหาและตั้งค่า Factory (selectedFty)
        const selectedFactory = dropdownFty.find(
          (fty) => String(fty.value) === String(locData.fty_id)
        );
        setSelectedFty(selectedFactory || null);
  
        // 📦 ดึงข้อมูล Warehouse ตาม Factory และรอให้โหลดเสร็จ
        const warehouseResponse = await fetchDropdownWH(locData.fty_id);
        if (warehouseResponse && warehouseResponse.length > 0) {
          const selectedWarehouse = warehouseResponse.find(
            (wh) => String(wh.value) === String(locData.wh_id)
          );
          setSelectedWH(selectedWarehouse || null);
  
          // 🗂️ ดึงข้อมูล Zone ตาม Warehouse และรอให้โหลดเสร็จ
          const zoneResponse = await fetchDropdownZone(locData.wh_id);
          if (zoneResponse && zoneResponse.length > 0) {
            const selectedZoneItem = zoneResponse.find(
              (zone) => String(zone.value) === String(locData.zn_id)
            );
            setSelectedZone(selectedZoneItem || null);
          }
        }
  
        // เปลี่ยนโหมดเป็น Edit
        setMode("edit");
      }
    } catch (error) {
      console.error("Error fetching data for edit:", error);
    }
  };
  
// จัดการเปลี่ยนค่าของฟิลด์
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setLocationForm((prev) => ({
    ...prev,
    [name]: value,
  }));
  setErrors((prev) => ({ ...prev, [name]: "" })); 
};

  const validateForm = () => {
    const newErrors = {};
  
    if (!selectedFty || !selectedFty.value) {
      newErrors.fty_id = "กรุณาเลือกโรงงาน";
    }
  
    if (!selectedWH || !selectedWH.value) {
      newErrors.wh_id = "กรุณาเลือกคลังสินค้า";
    }
  
    if (!selectedZone || !selectedZone.value) {
      newErrors.zn_id = "กรุณาเลือกโซน";
    }
  
    if (!LocationForm.loc_code || !LocationForm.loc_code.trim()) {
      newErrors.loc_code = "กรุณากรอกรหัสตำแหน่ง";
    }
  
    if (!LocationForm.loc_name || !LocationForm.loc_name.trim()) {
      newErrors.loc_name = "กรุณากรอกชื่อตำแหน่ง";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // คืนค่า true หากไม่มีข้อผิดพลาด
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
      // สำหรับการเพิ่มข้อมูล
      const payload = {
        fty_id: selectedFty.value,
        wh_id: selectedWH.value,  // ✅ ส่ง wh_id จาก dropdownWH
        zn_id: selectedZone.value,
        loc_code: LocationForm.loc_code,
        loc_name: LocationForm.loc_name,
        loc_remark: LocationForm.loc_remark,
      };
      console.log("Add Payload:", payload); // ตรวจสอบ payload
      response = await LocationAPI.createLocation(payload);
    } else {
      // สำหรับการอัปเดตข้อมูล ใช้ FormData
      const formData = new FormData();
      formData.append("fty_id", selectedFty.value); // ใช้ค่า value แทน wh_id
      formData.append("wh_id", selectedWH.value); // ใช้ค่า value แทน wh_id
      formData.append("zn_id", selectedZone.value); // ใช้ค่า value แทน wh_id
      formData.append("loc_code", LocationForm.loc_code); // เพิ่ม zn_code
      formData.append("loc_name", LocationForm.loc_name);
      formData.append("loc_remark", LocationForm.loc_remark || ""); // แทนค่า null ด้วย ""

      console.log("Update FormData:", formData); // ตรวจสอบ FormData
      response = await LocationAPI.updateLocation(LocationForm.loc_id , formData);
    }

    if (response.isCompleted) {
      setAlert({
        show: true,
        type: "success",
        title: mode === "add" ? "เพิ่มสำเร็จ" : "แก้ไขสำเร็จ",
        message: response.message,
      });
      await fetchDataAll(); // รีเฟรชข้อมูลในตาราง
      setLocationForm({
        zn_id: "",
        loc_id: "",
        loc_code: "",
        loc_name: "",
        loc_remark: "",
      });
      setSelectedFty(null);
      setSelectedWH(null);
      setSelectedZone(null);
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
    const response = await LocationAPI.deleteLocation(deleteCode);
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




// เมื่อเลือกโรงงาน ให้โหลดคลังที่เกี่ยวข้อง
const handleFtyChange = (event, newValue) => {
  if (newValue) {
    setSelectedFty({ value: newValue.value, text: newValue.text });
    fetchDropdownWH(newValue.value);  // ดึงข้อมูลคลังตามโรงงาน
  } else {
    setSelectedFty(null);
    setDropDownWH([]);
    setSelectedWH(null);
  }
};

const handleWHChange = (event, newValue) => {
  if (newValue) {
    setSelectedWH({ value: newValue.value, text: newValue.text });
    fetchDropdownZone(newValue.value);  // ดึงข้อมูล Zone ตามคลังที่เลือก
  } else {
    setSelectedWH(null);
    setDropDownZone([]);  // ล้างข้อมูล Zone
    setSelectedZone(null);
  }
};
const handleZoneChange = (event, newValue) => {
  if (newValue) {
    setSelectedZone({ value: newValue.value, text: newValue.text });
  } else {
    setSelectedZone(null);
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
      const response = await LocationAPI.importFile(selectedFile);
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
            {lang.msg("title.location")}
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
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("location.location_code")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <MDInput 
                          fullWidth 
                          name="loc_code"
                          variant="outlined"
                          value={LocationForm.loc_code}
                          onChange={handleInputChange}
                        />
                        {errors.loc_code && (
                          <MDTypography variant="caption" color="error">
                            {errors.loc_code}
                          </MDTypography>
                        )}
                      </Grid>

                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                        {lang.msg("location.factory")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
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

                      <Grid item xs={12} sm={6} lg={6}>
                        <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                          <MDTypography variant="h6" color="inherit">
                            {lang.msg("location.location_zone")}
                            <span style={{ color: "red" }}> *</span>
                          </MDTypography>
                        </MDBox>
                      </Grid>
 
                      <Grid item xs={12} sm={6} lg={6}>
                        <Autocomplete
                          fullWidth
                          options={dropdownZone} // ใช้ข้อมูลจาก API
                          getOptionLabel={(option) => option.text || ""} // ใช้ฟิลด์ text สำหรับแสดงใน dropdown
                          isOptionEqualToValue={(option, value) => String(option.value) === String(value?.value)} 
                          value={selectedZone}
                          disabled={!selectedWH}
                          onChange={handleZoneChange}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="-- โซน --"
                              variant="outlined"
                            />
                          )}
                        />
                         {errors.zn_id && (
                            <MDTypography variant="caption" color="error">
                              {errors.zn_id}
                            </MDTypography>
                          )}
                      </Grid>
                     
  
                    </Grid>
                  </Grid>
  
                  <Grid item xs={12} md={5} lg={6}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("location.location_name")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <MDInput 
                          fullWidth 
                          name="loc_name"
                          variant="outlined"
                          value={LocationForm.loc_name}
                          onChange={handleInputChange}
                        />
                        {errors.loc_name && (
                            <MDTypography variant="caption" color="error">
                              {errors.loc_name}
                            </MDTypography>
                          )}
                      </Grid>

                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("location.wh")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                    <Autocomplete
                      options={dropdownWH} // ใช้ข้อมูลจาก API
                      getOptionLabel={(option) => option.text || ""} // ใช้ฟิลด์ text สำหรับแสดงใน dropdown
                      value={selectedWH}
                      isOptionEqualToValue={(option, value) => String(option.value) === String(value?.value)} // ตรวจสอบความเท่าของค่า
                      onChange={handleWHChange}
                      disabled={!selectedFty} 
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="-- คลัง --"
                          variant="outlined"
                          
                        />
                      )}
                      fullWidth
                    />
                    {errors.wh_id  && (
                            <MDTypography variant="caption" color="error">
                              {errors.wh_id }
                            </MDTypography>
                          )}
                    </Grid>


                      <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("location.location_remark")}
                        </MDTypography>
                      </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <MDInput 
                          fullWidth 
                          name="loc_remark"
                          variant="outlined"
                          value={LocationForm.loc_remark}
                          onChange={handleInputChange}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} lg={1}>
                    <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="flex-end" height="100%">
                      <ButtonComponent type={mode === "add" ? "add" : "edit"} onClick={handleSubmit} />
                      {mode === "edit" && (
                          <MDBox mt={2}> {/* เพิ่มระยะห่างด้านบน 2 หน่วย */}
                            <ButtonComponent
                              type="cancel"
                              onClick={() => {
                                setMode("add"); // กลับไปที่โหมด add
                                setLocationForm({
                                  zn_id: "",
                                  loc_id: "",
                                  loc_code: "",
                                  loc_name: "",
                                  loc_remark: "",
                                }); // ล้างค่าฟิลด์ทั้งหมด
                                setSelectedFty(null);
                                setSelectedWH(null);
                                setSelectedZone(null);
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
                      { field: "loc_code", label: lang.msg("location.location_code"), width: "15%" },
                      { field: "loc_name", label: lang.msg("location.location"), width: "15%" },
                      { field: "fty_name", label: lang.msg("factory.factory_name"), width: "15%" },
                      { field: "wh_name", label: lang.msg("location.wh"), width: "15%" },
                      { field: "zn_name", label: lang.msg("location.zone"), width: "15%" },
                      { field: "loc_remark", label: lang.msg("location.location_remark"), width: "15%" },
                    ]}
                    data={LocationAll}
                    idField="loc_id"
                    onEdit={(id) => {
                        handleEdit(id);
                      }}
                    onDelete={(id) => {
                      setDeleteCode(id);
                      setConfirmAlert(true);
                    }}
                    searchableColumns={["loc_code", "loc_name", "zn_name","wh_name","fty_name"]} // กรองเฉพาะฟิลด์ที่กำหนด
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

export default LocationSetting;



