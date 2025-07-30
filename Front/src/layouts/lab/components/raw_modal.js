import React, { useState, useEffect } from "react";
import { Modal, Box, Grid, MenuItem ,FormControl,FormHelperText } from "@mui/material";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDBox from "components/MDBox";
import { StyledSelect } from "common/Global.style";
import DropDownAPI from "api/DropDownAPI";
import RawAPI from "api/RawMaterialAPI";
import * as lang from "utils/langHelper";
import Swal from "sweetalert2";
import ButtonComponent from "../components/ButtonComponent";



const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1000,
  maxWidth: "100%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
  textAlign: "center",
  zIndex: 1300,
};


const RawFormComponent = ({ open, onClose }) => {
  const [Form, setForm] = useState({
    rmifm_id: "",
    rm_id: "",
    crt_id: "",
    rmifm_code: "",
    rmifm_name: "",
    rmifm_width: "",
    rmifm_width_unitId: "",
    rmifm_length: "",
    rmifm_length_unitId: "",
    rmifm_thickness: "",
    rmifm_thickness_unitId: "",
    rmifm_weight: "",
    rmifm_weight_unitId: "",
    rmifm_product_unitId: "",
  });
  const [dropdownUnit, setDropdownUnit] = useState([]);
  const [dropdownRaw, setDropDownRaw] = useState([]);
  const [dropdownCri, setDropDownCri] = useState([]);
  const [errors, setErrors] = useState({});


  useEffect(() => {
    const fetchDropdown = async () => {
      try {
        const response = await DropDownAPI.getUnitDropDown();
        if (response.isCompleted) {
          setDropdownUnit(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDropdown();
  }, []);

  const DropdownRaw = async () => {
    try {
      const response = await DropDownAPI.getRawDropDown();
      if (response.isCompleted) {
        const data = response.data;
        setDropDownRaw(data);
      }
    } catch (error) {
      console.error("Error fetching  data :", error);
    }
  };


  useEffect(() => {
    DropdownRaw();
  }, []);

  const DropdownCriter = async () => {
    try {
      const response = await DropDownAPI.getCriterDropdown();
      if (response.isCompleted) {
        const data = response.data;
        setDropDownCri(data);
      }
    } catch (error) {
      console.error("Error fetching  data :", error);
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
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await RawAPI.createRawInfo(Form);
      if (response.isCompleted) {
        onClose(response.data.rmifm_id);  // ปิด Modal ก่อน
        setTimeout(() => {
          Swal.fire({
            icon: "success",
            title: "เพิ่มสำเร็จ",
            text: response.message,
          });
        }, 300);
      } else {
        onClose(null); // ปิด Modal ก่อน
        setTimeout(() => {
          Swal.fire({
            icon: "error",
            title: "เพิ่มไม่สำเร็จ",
            text: response.message,
          });
        }, 300);
      }
    } catch (error) {
      console.error("Error during submit:", error);
    }
  };


  return (
    <Modal open={open} onClose={() => onClose(null)}>
      <Box sx={modalStyle}>
        <MDBox mb={3} sx={{ display: "flex", justifyContent: "flex-start" }}  >
          <MDTypography variant="h6" component="h2" color="warning" mb={2}>
            เพิ่มข้อมูล Raw Material
          </MDTypography>
        </MDBox>

        <MDBox sx={{ border: "2px solid black", borderRadius: "10px", padding: "20px" }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} lg={6}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <MDTypography variant="h6" color="inherit">
                      {lang.msg("fg_data.fg_code")}
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDInput
                    name="rmifm_code"
                    variant="outlined"
                    value={Form.rmifm_code}
                    onChange={handleInputChange}
                    sx={{ width: "200px", maxWidth: "100%" }}
                    error={!!errors.rmifm_code} // แสดงสีแดงถ้ามี error
                    helperText={errors.rmifm_code || ""} // แสดงข้อความเตือน
                    FormHelperTextProps={{
                      style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <MDTypography variant="h6" color="inherit">
                      {lang.msg("fg_data.fg_width")}
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDInput
                    name="rmifm_width"
                    value={Form.rmifm_width || ""}
                    onChange={handleInputChange}
                    sx={{ width: "110px", maxWidth: "100%" }}
                    error={!!errors.rmifm_width} // แสดงสีแดงถ้ามี error
                    helperText={errors.rmifm_width || ""} // แสดงข้อความเตือน
                    FormHelperTextProps={{
                      style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                    }}
                  />
                  <FormControl error={!!errors.rmifm_width_unitId} sx={{ width: "80px", maxWidth: "100%", height: "45px" }}>
                  <StyledSelect
                    name="rmifm_width_unitId"
                    value={Form.rmifm_width_unitId || ""}
                    onChange={handleInputChange}
                    sx={{ width: "80px", maxWidth: "100%", height: "45px" }}
                   
                  >
                    {(dropdownUnit || []).map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.text}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                  <FormHelperText sx={{ color: "red" }}>
                    {errors.rmifm_width_unitId || ""}
                  </FormHelperText>
                  </FormControl>
                 
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <MDTypography variant="h6" color="inherit">
                      {lang.msg("fg_data.fg_thickness")}
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDInput
                    name="rmifm_thickness"
                    value={Form.rmifm_thickness || ""}
                    onChange={handleInputChange}
                    sx={{ width: "110px", maxWidth: "100%" }}
                    error={!!errors.rmifm_thickness} // แสดงสีแดงถ้ามี error
                    helperText={errors.rmifm_thickness || ""} // แสดงข้อความเตือน
                    FormHelperTextProps={{
                      style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                    }}
                  />
                  <StyledSelect
                    name="rmifm_thickness_unitId"
                    value={Form.rmifm_thickness_unitId || ""}
                    onChange={handleInputChange}
                    sx={{ width: "80px", maxWidth: "100%", height: "45px" }}
                    error={!!errors.rmifm_thickness_unitId} // แสดงสีแดงถ้ามี error
                    helperText={errors.rmifm_thickness_unitId || ""} // แสดงข้อความเตือน
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
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <MDTypography variant="h6" color="inherit">
                      ประเภท
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                <FormControl error={!!errors.rm_id} sx={{ width: "300px", maxWidth: "100%", height: "45px" }}>
                <StyledSelect
                    name="rm_id"
                    value={Form.rm_id || ""}
                    onChange={handleInputChange}
                    sx={{ width: "200px", maxWidth: "100%", height: "45px" }}
                   
                  >
                    {(dropdownRaw || []).map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.text}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                  <FormHelperText sx={{ color: "red" }}>
                      {errors.rm_id || ""}
                    </FormHelperText>
                </FormControl>
                 
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <MDTypography variant="h6" color="inherit">
                      เกณฑ์
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                <FormControl error={!!errors.crt_id} sx={{ width: "300px", maxWidth: "100%", height: "45px" }}>
                <StyledSelect
                    name="crt_id"
                    value={Form.crt_id || ""}
                    onChange={handleInputChange}
                    sx={{ width: "200px", maxWidth: "100%", height: "45px" }}
                    
                  >
                    {(dropdownCri || []).map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.text}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                  <FormHelperText sx={{ color: "red" }}>
                      {errors.crt_id || ""}
                    </FormHelperText>
                </FormControl>
                 
                </Grid>



              </Grid>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Grid container spacing={3} alignItems="center" >
                <Grid item xs={12} sm={6} lg={6}>
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <MDTypography variant="h6" color="inherit">
                      {lang.msg("fg_data.fg_name")}
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDInput
                    name="rmifm_name"
                    variant="outlined"
                    value={Form.rmifm_name}
                    onChange={handleInputChange}
                    sx={{ width: "200px", maxWidth: "100%" }}
                    error={!!errors.rmifm_name} // แสดงสีแดงถ้ามี error
                    helperText={errors.rmifm_name || ""} // แสดงข้อความเตือน
                    FormHelperTextProps={{
                      style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <MDTypography variant="h6" color="inherit">
                      {lang.msg("fg_data.fg_length")}
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDInput
                    name="rmifm_length"
                    value={Form.rmifm_length || ""}
                    onChange={handleInputChange}
                    sx={{ width: "110px", maxWidth: "100%" }}
                    error={!!errors.rmifm_length} // แสดงสีแดงถ้ามี error
                    helperText={errors.rmifm_length || ""} // แสดงข้อความเตือน
                    FormHelperTextProps={{
                      style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                    }}
                  />
                  <FormControl error={!!errors.rmifm_length_unitId} sx={{ width: "80px", maxWidth: "100%", height: "45px" }}>
                  <StyledSelect
                    name="rmifm_length_unitId"
                    value={Form.rmifm_length_unitId || ""}
                    onChange={handleInputChange}
                    sx={{ width: "80px", maxWidth: "100%", height: "45px" }}
                  >
                    {(dropdownUnit || []).map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.text}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                  <FormHelperText sx={{ color: "red" }}>
                      {errors.rmifm_length_unitId || ""}
                    </FormHelperText>
                  </FormControl>
                  
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <MDTypography variant="h6" color="inherit">
                      น้ำหนักต่อหน่วย
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDInput
                    name="rmifm_weight"
                    value={Form.rmifm_weight || ""}
                    onChange={handleInputChange}
                    sx={{ width: "110px", maxWidth: "100%" }}
                    error={!!errors.rmifm_weight} // แสดงสีแดงถ้ามี error
                    helperText={errors.rmifm_weight || ""} // แสดงข้อความเตือน
                    FormHelperTextProps={{
                      style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                    }}
                  />
                  <FormControl error={!!errors.rmifm_weight_unitId} sx={{ width: "80px", maxWidth: "100%", height: "45px" }}>
                  <StyledSelect
                    name="rmifm_weight_unitId"
                    value={Form.rmifm_weight_unitId || ""}
                    onChange={handleInputChange}
                    sx={{ width: "80px", maxWidth: "100%", height: "45px" }}
                    
                  >
                    {(dropdownUnit || []).map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.text}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                  <FormHelperText sx={{ color: "red" }}>
                      {errors.rmifm_weight_unitId || ""}
                  </FormHelperText>
                  </FormControl>
                  
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <MDTypography variant="h6" color="inherit">
                      หน่วยของสินค้า
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <FormControl error={!!errors.rmifm_product_unitId} sx={{ width: "300px", maxWidth: "100%", height: "45px" }}>
                  <StyledSelect
                    name="rmifm_product_unitId"
                    value={Form.rmifm_product_unitId || ""}
                    onChange={handleInputChange}
                    sx={{ width: "200px", maxWidth: "100%", height: "45px" }}
                    
                  >
                    {(dropdownUnit || []).map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.text}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                  <FormHelperText sx={{ color: "red" }}>
                      {errors.rmifm_product_unitId || ""}
                    </FormHelperText>
                  </FormControl>
                 
                </Grid>
              </Grid>

              <Grid item xs={12} />
            </Grid>
          </Grid>
        </MDBox>

        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <ButtonComponent type="cancel" onClick={onClose} />

          <ButtonComponent type="Confirm" onClick={handleSubmit} />


        </Box>
      </Box>

    </Modal>
  );




};

export default RawFormComponent;