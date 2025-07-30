import React, { useState, useEffect } from "react";
import { Modal, Box, Grid, MenuItem, FormControl, FormHelperText } from "@mui/material";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDBox from "components/MDBox";
import { StyledSelect } from "common/Global.style";
import DropDownAPI from "api/DropDownAPI";
import FGAPI from "api/FgAPI";
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



const FGFormComponent = ({ open, onClose }) => {
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

  const [dropdownUnit, setDropdownUnit] = useState([]);
  const [dropdownFG, setDropDownFG] = useState([]);
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


  const DropdownFG = async () => {
    try {
      const response = await DropDownAPI.getFGDropDown();
      if (response.isCompleted) {
        const data = response.data;
        setDropDownFG(data);
      }
    } catch (error) {
      console.error("Error fetching  data :", error);
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
      [name]: "",
    }));
  };






  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await FGAPI.createFgInfo(Form);
      if (response.isCompleted) {
        onClose(response.data.fgifm_id);  // ปิด Modal ก่อน
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
            เพิ่มข้อมูล FG
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
                    name="fgifm_code"
                    variant="outlined"
                    value={Form.fgifm_code}
                    onChange={handleInputChange}
                    sx={{ width: "200px", maxWidth: "100%" }}
                    error={!!errors.fgifm_code} // แสดงสีแดงถ้ามี error
                    helperText={errors.fgifm_code || ""} // แสดงข้อความเตือน
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
                    name="fgifm_width"
                    value={Form.fgifm_width || ""}
                    onChange={handleInputChange}
                    sx={{ width: "110px", maxWidth: "100%" }}
                    error={!!errors.fgifm_width} // แสดงสีแดงถ้ามี error
                    helperText={errors.fgifm_width || ""} // แสดงข้อความเตือน
                    FormHelperTextProps={{
                      style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                    }}
                  />
                  <FormControl error={!!errors.fgifm_width_unitId} sx={{ width: "80px", maxWidth: "100%", height: "45px" }}>
                    <StyledSelect
                      name="fgifm_width_unitId"
                      value={Form.fgifm_width_unitId || ""}
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
                      {errors.fgifm_width_unitId || ""}
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
                    name="fgifm_thickness"
                    value={Form.fgifm_thickness || ""}
                    onChange={handleInputChange}
                    sx={{ width: "110px", maxWidth: "100%" }}
                    error={!!errors.fgifm_thickness} // แสดงสีแดงถ้ามี error
                    helperText={errors.fgifm_thickness || ""} // แสดงข้อความเตือน
                    FormHelperTextProps={{
                      style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                    }}
                  />
                  <FormControl error={!!errors.fgifm_thickness_unitId} sx={{ width: "80px", maxWidth: "100%", height: "45px" }}>
                    <StyledSelect
                      name="fgifm_thickness_unitId"
                      value={Form.fgifm_thickness_unitId || ""}
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
                      {errors.fgifm_thickness_unitId || ""}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <MDTypography variant="h6" color="inherit">
                      ประเภท
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <FormControl error={!!errors.fg_id} sx={{ width: "300px", maxWidth: "100%", height: "45px" }}>
                      <StyledSelect
                        name="fg_id"
                        value={Form.fg_id || ""}
                        onChange={handleInputChange}
                        sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                      >
                        {(dropdownFG || []).map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                      <FormHelperText sx={{ color: "red" }}>
                        {errors.fg_id || ""}
                      </FormHelperText>
                    </FormControl>
                  </MDBox>
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
                    name="fgifm_name"
                    variant="outlined"
                    value={Form.fgifm_name}
                    onChange={handleInputChange}
                    sx={{ width: "200px", maxWidth: "100%" }}
                    error={!!errors.fgifm_name} // แสดงสีแดงถ้ามี error
                    helperText={errors.fgifm_name || ""} // แสดงข้อความเตือน
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
                    name="fgifm_length"
                    value={Form.fgifm_length || ""}
                    onChange={handleInputChange}
                    sx={{ width: "110px", maxWidth: "100%" }}
                    error={!!errors.fgifm_length} // แสดงสีแดงถ้ามี error
                    helperText={errors.fgifm_length || ""} // แสดงข้อความเตือน
                    FormHelperTextProps={{
                      style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                    }}
                  />
                  <FormControl error={!!errors.fgifm_length_unitId} sx={{ width: "80px", maxWidth: "100%", height: "45px" }}>
                    <StyledSelect
                      name="fgifm_length_unitId"
                      value={Form.fgifm_length_unitId || ""}
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
                      {errors.fgifm_length_unitId || ""}
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
                <FormControl error={!!errors.fgifm_product_unitId} sx={{ width: "200px", maxWidth: "100%", height: "45px" }}>
                    <StyledSelect
                      name="fgifm_product_unitId"
                      value={Form.fgifm_product_unitId || ""}
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
                      {errors.fgifm_product_unitId || ""}
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
                <Grid item xs={12} sm={6} lg={6} >
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                  <FormControl error={!!errors.crt_id} sx={{ width: "300px", maxWidth: "100%", height: "45px" }}>
                    <StyledSelect
                      name="crt_id"
                      value={Form.crt_id || ""}
                      onChange={handleInputChange}
                      sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
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
                  </MDBox>
                </Grid>
              </Grid>
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

export default FGFormComponent;
