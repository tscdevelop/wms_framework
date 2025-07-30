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
import FGAPI from "api/FgAPI";
import MDButton from "components/MDButton";
const FgInfo = () => {
  // loading: ควบคุมสถานะการโหลดข้อมูลจาก API ถ้าเป็น true แสดงว่าข้อมูลกำลังโหลดอยู่
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [FgAll, setFgAll] = useState([]);
  const [Form, setForm] = useState({
    fgifm_id: "",
    fg_id: "",
    crt_id: "",
    fgifm_code: "",
    fgifm_name: "",
    fgifm_width: "", // ควรเป็น string
    fgifm_width_unitId: "",
    fgifm_length: "",
    fgifm_length_unitId: "",
    fgifm_thickness: "",
    fgifm_thickness_unitId: "",
    fgifm_product_unitId: "",
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
  const [dropdownUnit, setDropDownUnit] = useState([]);
  const [dropdownFG, setDropDownFG] = useState([]);
  const [dropdownCri, setDropDownCri] = useState([]);


  useEffect(() => {
    const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
    setRole(userRole);
  }, []);



  const fetchDataAll = async () => {
    try {
      const response = await FGAPI.getFgInfoAll();
      console.log("FG Data : ", response);
      if (response.isCompleted) {
        const data = response.data;
        setFgAll(data);
      }
    } catch (error) {
      console.error("Error fetching  data : ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataAll();
  }, []);


  const Dropdown = async () => {
    try {
      const response = await DropDownAPI.getUnitDropDown();
      if (response.isCompleted) {
        const data = response.data;
        setDropDownUnit(data);
      }
    } catch (error) {
      console.error("Error fetching  data : ", error);
    }
  };
  useEffect(() => {
    Dropdown();
  }, []);

  const DropdownFG = async () => {
    try {
      const response = await DropDownAPI.getFGDropDown();
      if (response.isCompleted) {
        const data = response.data;
        setDropDownFG(data);
      }
    } catch (error) {
      console.error("Error fetching  data : ", error);
    }
  };
  useEffect(() => {
    DropdownFG();
  }, []);

  const DropdownCriter = async () => {
    try {
      const response = await DropDownAPI.getCriterDropdown();
      if (response.isCompleted) {
        const data = response.data;
        setDropDownCri(data);
      }
    } catch (error) {
      console.error("Error fetching  data : ", error);
    }
  };
  useEffect(() => {
    DropdownCriter();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;
  
    // ฟิลด์ที่ต้องเป็นตัวเลข และห้ามติดลบ
    const numericFields = [
      "fgifm_width",
      "fgifm_length",
      "fgifm_thickness",
      "fgifm_weight",
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
    setErrors((prev) => ({
      ...prev,
      [name]: "", // ล้าง error ของฟิลด์นั้น
    }));
  };





  const handleEdit = async (fgifm_id) => {
    try {
      const response = await FGAPI.getFgInfoByID(fgifm_id);
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

    if (!Form.fgifm_code.trim()) {
      newErrors.fgifm_code = "กรุณากรอกรหัส FG";
    }

    if (!Form.fgifm_name.trim()) {
      newErrors.fgifm_name = "กรุณากรอกชื่อ FG";
    }

    if (!String(Form.fgifm_width || "").trim()) {
      newErrors.fgifm_width = "กรุณากรอกความกว้าง";
    }

    if (!String(Form.fgifm_width_unitId || "").trim()) {
      newErrors.fgifm_width_unitId = "กรุณาเลือกหน่วย";
    }

    if (!String(Form.fgifm_length || "").trim()) {
      newErrors.fgifm_length = "กรุณากรอกความยาว";
    }

    if (!String(Form.fgifm_length_unitId || "").trim()) {
      newErrors.fgifm_length_unitId = "กรุณาเลือกหน่วย";
    }

    if (!String(Form.fgifm_thickness || "").trim()) {
      newErrors.fgifm_thickness = "กรุณากรอกความหนา";
    }

    if (!String(Form.fgifm_thickness_unitId || "").trim()) {
      newErrors.fgifm_thickness_unitId = "กรุณาเลือกหน่วย";
    }

    if (!String(Form.fgifm_product_unitId || "").trim()) {
      newErrors.fgifm_product_unitId = "กรุณาเลือกหน่วยของสินค้า";
    }
    if (!String(Form.fg_id || "").trim()) {
      newErrors.fg_id = "กรุณาเลือกประเภทสินค้าสำเร็จรูป";
    }
    if (!String(Form.crt_id || "").trim()) {
      newErrors.crt_id = "กรุณาเลือกเกณฑ์";
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
          fgifm_code: Form.fgifm_code || "",
          fgifm_name: Form.fgifm_name || "",
          fg_id: Form.fg_id || "",
          crt_id: Form.crt_id || "",
          fgifm_width: Form.fgifm_width || "",
          fgifm_width_unitId: Form.fgifm_width_unitId || "",
          fgifm_length: Form.fgifm_length || "",
          fgifm_length_unitId: Form.fgifm_length_unitId || "",
          fgifm_thickness: Form.fgifm_thickness || "",
          fgifm_thickness_unitId: Form.fgifm_thickness_unitId || "",
          fgifm_product_unitId: Form.fgifm_product_unitId || "",
        };
        response = await FGAPI.createFgInfo(payload);
      } else {
        // FormData สำหรับอัปเดตข้อมูล
        const formData = new FormData();
        formData.append("fgifm_code", Form.fgifm_code || "");
        formData.append("fgifm_name", Form.fgifm_name || "");
        formData.append("fg_id", Form.fg_id || "");
        formData.append("crt_id", Form.crt_id || "");
        formData.append("fgifm_width", Form.fgifm_width || "");
        formData.append("fgifm_width_unitId", Form.fgifm_width_unitId || "");
        formData.append("fgifm_length", Form.fgifm_length || "");
        formData.append("fgifm_length_unitId", Form.fgifm_length_unitId || "");
        formData.append("fgifm_thickness", Form.fgifm_thickness || "");
        formData.append("fgifm_thickness_unitId", Form.fgifm_thickness_unitId || "");
        formData.append("fgifm_product_unitId", Form.fgifm_product_unitId || "");
        response = await FGAPI.updateFgInfo(Form.fgifm_id, formData); // ใช้ API updateSupplier
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
          fgifm_id: "",
          fg_id: "",
          crt_id: "",
          fgifm_code: "",
          fgifm_name: "",
          fgifm_width: "",
          fgifm_width_unitId: "",
          fgifm_length: "",
          fgifm_length_unitId: "",
          fgifm_thickness: "",
          fgifm_thickness_unitId: "",
          fgifm_product_unitId: ""
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
    } finally {
      setConfirmSubmit(false); // Close the confirmation dialog
      setConfirmEdit(false);
    }

  };




  const handleDelete = async () => {
    try {
      const response = await FGAPI.deleteFgInfo(deleteCode);
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
      const response = await FGAPI.importFileInfo(selectedFile);
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
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="dark" fontWeight="bold">
            {lang.msg("title.fginfo")}
          </MDTypography>
        </MDBox>

        <MDBox mt={5}>
          <Card>
            <MDBox mt={3} p={3}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6} lg={5}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("fg_data.fg_code")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDInput
                          name="fgifm_code"
                          variant="outlined"
                          value={Form.fgifm_code}
                          onChange={handleInputChange}
                          sx={{ width: "300px", maxWidth: "100%" }}
                          error={!!errors.fgifm_code} // แสดงสีแดงถ้ามี error
                          helperText={errors.fgifm_code || ""} // แสดงข้อความเตือน
                          FormHelperTextProps={{
                            style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                          }}
                        />
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("fg_data.fg_width")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" alignItems="flex-start" justifyContent="center" gap={1}>
                        <MDInput
                          name="fgifm_width"
                          value={Form.fgifm_width || ""}
                          onChange={handleInputChange}
                          sx={{ width: "180px", maxWidth: "100%" }}
                          error={!!errors.fgifm_width} // แสดงสีแดงถ้ามี error
                          helperText={errors.fgifm_width || ""} // แสดงข้อความเตือน
                          FormHelperTextProps={{
                            style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                          }}
                        />
                        <FormControl error={!!errors.fgifm_width_unitId} sx={{ width: "120px" }}>
                          <StyledSelect
                            name="fgifm_width_unitId"
                            value={Form.fgifm_width_unitId || ""}
                            onChange={handleInputChange}
                            sx={{ width: "120px", maxWidth: "100%", height: "45px" }}
                            error={!!errors.fgifm_width_unitId} // แสดงสีแดงถ้ามี error
                            helperText={errors.fgifm_width_unitId || ""} // แสดงข้อความเตือน
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
                          {errors.fgifm_width_unitId && (
                            <FormHelperText sx={{ color: "red" }}>
                              {errors.fgifm_width_unitId}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("fg_data.fg_thickness")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" alignItems="flex-start" justifyContent="center" gap={1}>
                        <MDInput
                          name="fgifm_thickness"
                          value={Form.fgifm_thickness || ""}
                          onChange={handleInputChange}
                          sx={{ width: "180px", maxWidth: "100%" }}
                          error={!!errors.fgifm_thickness} // แสดงสีแดงถ้ามี error
                          helperText={errors.fgifm_thickness || ""} // แสดงข้อความเตือน
                          FormHelperTextProps={{
                            style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                          }}
                        />
                        <FormControl error={!!errors.fgifm_thickness_unitId} sx={{ width: "120px" }}>
                          <StyledSelect
                            name="fgifm_thickness_unitId"
                            value={Form.fgifm_thickness_unitId || ""}
                            onChange={handleInputChange}
                            sx={{ width: "120px", maxWidth: "100%", height: "45px" }}
                            error={!!errors.fgifm_thickness_unitId} // แสดงสีแดงถ้ามี error
                            helperText={errors.fgifm_thickness_unitId || ""} // แสดงข้อความเตือน
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
                          {errors.fgifm_thickness_unitId && (
                            <FormHelperText sx={{ color: "red" }}>
                              {errors.fgifm_thickness_unitId}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </MDBox>
                    </Grid>

                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("raw_data.raw_type")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <FormControl
                          error={!!errors.fg_id}
                          sx={{ width: "300px", maxWidth: "100%", display: "flex", flexDirection: "column" }}
                        >
                          <StyledSelect
                            name="fg_id"
                            value={Form.fg_id || ""}
                            onChange={handleInputChange}
                            sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                            error={!!errors.fg_id} // แสดงสีแดงถ้ามี error
                            helperText={errors.fg_id || ""} // แสดงข้อความเตือน
                            FormHelperTextProps={{
                              style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                            }}
                          >
                            {(dropdownFG || []).map((item) => (
                              <MenuItem key={item.value} value={item.value}>
                                {item.text}
                              </MenuItem>
                            ))}
                          </StyledSelect>
                          {errors.fg_id && (
                            <FormHelperText sx={{ color: "red" }}>
                              {errors.fg_id}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </MDBox>
                    </Grid>

                  </Grid>
                </Grid>

                <Grid item xs={12} md={5} lg={6}>
                  <Grid container spacing={3} alignItems="center" >
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("fg_data.fg_name")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDInput
                          name="fgifm_name"
                          variant="outlined"
                          value={Form.fgifm_name}
                          onChange={handleInputChange}
                          sx={{ width: "300px", maxWidth: "100%" }}
                          error={!!errors.fgifm_name} // แสดงสีแดงถ้ามี error
                          helperText={errors.fgifm_name || ""} // แสดงข้อความเตือน
                          FormHelperTextProps={{
                            style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                          }}
                        />
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("fg_data.fg_length")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" alignItems="flex-start" justifyContent="center" gap={1}>
                        <MDInput
                          name="fgifm_length"
                          value={Form.fgifm_length || ""}
                          onChange={handleInputChange}
                          sx={{ width: "180px", maxWidth: "100%" }}
                          error={!!errors.fgifm_length} // แสดงสีแดงถ้ามี error
                          helperText={errors.fgifm_length || ""} // แสดงข้อความเตือน
                          FormHelperTextProps={{
                            style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                          }}
                        />

                        {/* Select สำหรับหน่วย */}
                        <FormControl error={!!errors.fgifm_length_unitId} sx={{ width: "120px" }}>
                          <StyledSelect
                            name="fgifm_length_unitId"
                            value={Form.fgifm_length_unitId || ""}
                            onChange={handleInputChange}
                            sx={{ width: "120px", maxWidth: "100%", height: "45px" }}
                            error={!!errors.fgifm_length_unitId} // แสดงสีแดงถ้ามี error
                            helperText={errors.fgifm_length_unitId || ""} // แสดงข้อความเตือน
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
                          {/* ข้อความแจ้งเตือน Error สำหรับ Select */}
                          {errors.fgifm_length_unitId && (
                            <FormHelperText sx={{ color: "red" }}>
                              {errors.fgifm_length_unitId}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("raw_data.raw_Unit_product")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <FormControl
                          error={!!errors.fgifm_product_unitId}
                          sx={{ width: "300px", maxWidth: "100%", display: "flex", flexDirection: "column" }}
                        >
                          <StyledSelect
                            name="fgifm_product_unitId"
                            value={Form.fgifm_product_unitId || ""}
                            onChange={handleInputChange}
                            sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                            error={!!errors.fgifm_product_unitId} // แสดงสีแดงถ้ามี error
                            helperText={errors.fgifm_product_unitId || ""} // แสดงข้อความเตือน
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
                          {errors.fgifm_product_unitId && (
                            <FormHelperText sx={{ color: "red" }}>
                              {errors.fgifm_product_unitId}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </MDBox>

                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
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
                            sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
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

                <Grid item xs={12} lg={1}>
                  <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="flex-end" height="100%">
                    <ButtonComponent type={mode === "add" ? "add" : "edit"} onClick={handleSubmit} />
                    {mode === "edit" && (
                      <MDBox mt={2}> {/* เพิ่มระยะห่างด้านบน 2 หน่วย */}
                        <ButtonComponent
                          type="cancel"
                          onClick={() => {
                            setMode("add"); // กลับไปที่โหมด add
                            setForm({
                              fgifm_id: "",
                              fgifm_code: "",
                              fgifm_name: "",
                              fgifm_width: "",
                              fgifm_width_unitId: "",
                              fgifm_length: "",
                              fgifm_length_unitId: "",
                              fgifm_thickness: "",
                              fgifm_thickness_unitId: "",
                              fgifm_product_unitId: "",
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
                    { field: "fgifm_code", label: lang.msg("fg_data.fg_code"), width: "5%" },
                    { field: "fgifm_name", label: lang.msg("fg_data.fg_name"), width: "10%" },
                    { field: "fg_type", label: lang.msg("raw_data.raw_type"), width: "10%" },
                    {
                      label: lang.msg("fg_data.fg_size"),
                      subColumns: [
                        { field: "fgifm_width_with_name", label: lang.msg("fg_data.fg_width"), width: "5%" },
                        { field: "fgifm_length_with_name", label: lang.msg("fg_data.fg_length"), width: "5%" },
                        { field: "fgifm_thickness_with_name", label: lang.msg("fg_data.fg_thickness"), width: "5%" },
                      ],
                    },
                    { field: "fgifm_product_unitId", label: lang.msg("raw_data.raw_unit"), width: "10%" },
                    { field: "crt_exp", label: lang.msg("raw_data.raw_exp_cri"), width: "10%" },
                    { field: "crt_rem", label: lang.msg("raw_data.raw_rem_cri"), width: "10%" },
                  ]}
                  data={FgAll}
                  idField="fgifm_id"
                  onEdit={(id) => {
                    handleEdit(id);
                  }}
                  onDelete={(id) => {
                    setDeleteCode(id);
                    setConfirmAlert(true);
                  }}
                  searchableColumns={["fgifm_code", "fgifm_name", "fg_type", "fgifm_width_with_name", "fgifm_length_with_name", "fgifm_thickness_with_name", "fgifm_product_unitId", "crt_exp", "crt_rem"]} // กรองเฉพาะฟิลด์ที่กำหนด
                  hiddenActions={["barcode", "settings", "print"]}
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

export default FgInfo;