import React, { useState, useEffect } from "react";
import { Modal, Box, Grid, MenuItem } from "@mui/material";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDBox from "components/MDBox";
import { StyledSelect } from "common/Global.style";
import DropDownAPI from "api/DropDownAPI";
import SemiAPI from "api/SemiAPI";
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


  const SemiFGFormComponent = ({ open, onClose }) => {
 const [Form, setForm] = useState({
    semiifm_id:"",
    semi_id:"",
    crt_id:"",
    semiifm_code:"",
    semiifm_name:"",
    semiifm_width:"",
    semiifm_width_unitId: "",
    semiifm_length: "",
    semiifm_length_unitId: "",
    semiifm_thickness: "",
    semiifm_thickness_unitId: "",
    semiifm_product_unitId: "",
  });
  const [dropdownUnit, setDropdownUnit] = useState([]);
  const [dropdownSemi,setDropDownSemi]= useState([]);
  const [dropdownCri,setDropDownCri]= useState([]); 
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
    
        const DropdownSemi = async () => {
            try{
                const response = await DropDownAPI.getSemiFGDropDown();
                if(response.isCompleted){
                    const data = response.data;
                    setDropDownSemi(data);
                }
            }catch(error){
                console.error("Error fetching  data : ",error);
            }
          };
        
        
          useEffect(() =>{
            DropdownSemi();
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

        const numericFields = ["semiifm_width", "semiifm_length", "semiifm_thickness"];
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
          const response = await SemiAPI.createSemiFg(Form);
          if (response.isCompleted) {
            onClose(response.data.semiifm_id);  // ปิด Modal ก่อน
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
        <Modal open={open}  onClose={() => onClose(null)}>
          <Box sx={modalStyle}>
            <MDBox mb={3} sx={{ display: "flex", justifyContent: "flex-start" }}  >
                <MDTypography variant="h6" component="h2" color="warning" mb={2}>
                    เพิ่มข้อมูล Semi FG
                </MDTypography>
            </MDBox>
            
            <MDBox sx={{ border: "2px solid black", borderRadius: "10px", padding: "20px" }}>
                      <Grid container spacing={3} alignItems="center">
                                <Grid item xs ={12}  lg={6}>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} lg={6}>
                                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                                          <MDTypography  variant="h6" color="inherit">
                                          {lang.msg("fg_data.fg_code")}
                                          </MDTypography>
                                      </MDBox>
                                    </Grid>
                                    <Grid item xs={12} sm={6} lg={6}>
                                      <MDInput 
                                          name="semiifm_code"
                                          variant="outlined"
                                          value={Form.semiifm_code}
                                          onChange={handleInputChange}
                                          sx={{ width: "200px", maxWidth: "100%" }}
                                          error={!!errors.semiifm_code} // แสดงสีแดงถ้ามี error
                                              helperText={errors.semiifm_code || ""} // แสดงข้อความเตือน
                                              FormHelperTextProps={{
                                                style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                          }}
                                      />
                                    </Grid>
                                      <Grid item xs={12} sm={6} lg={6}>
                                          <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                                              <MDTypography  variant="h6" color="inherit">
                                              {lang.msg("fg_data.fg_width")}
                                              </MDTypography>
                                          </MDBox>
                                      </Grid>
                                      <Grid item xs={12} sm={6} lg={6}>
                                          <MDInput
                                              name="semiifm_width"
                                              value={Form.semiifm_width || ""}
                                              onChange={handleInputChange}
                                              sx={{ width: "110px", maxWidth: "100%" }}
                                              error={!!errors.semiifm_width} // แสดงสีแดงถ้ามี error
                                              helperText={errors.semiifm_width || ""} // แสดงข้อความเตือน
                                              FormHelperTextProps={{
                                                style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                              }}
                                          />
                                          <StyledSelect
                                              name="semiifm_width_unitId"
                                              value={Form.semiifm_width_unitId || ""}
                                              onChange={handleInputChange}
                                              sx={{ width: "80px", maxWidth: "100%" , height: "45px"}}
                                              error={!!errors.semiifm_width_unitId} // แสดงสีแดงถ้ามี error
                                              helperText={errors.semiifm_width_unitId || ""} // แสดงข้อความเตือน
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
                                              <MDTypography  variant="h6" color="inherit">
                                              {lang.msg("fg_data.fg_thickness")}
                                              </MDTypography>
                                          </MDBox>
                                      </Grid>
                                      <Grid item xs={12} sm={6} lg={6}>
                                          <MDInput
                                              name="semiifm_thickness"
                                              value={Form.semiifm_thickness || ""}
                                              onChange={handleInputChange}
                                              sx={{ width: "110px", maxWidth: "100%" }}
                                              error={!!errors.semiifm_thickness} // แสดงสีแดงถ้ามี error
                                              helperText={errors.semiifm_thickness || ""} // แสดงข้อความเตือน
                                              FormHelperTextProps={{
                                                style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                              }}
                                          />
                                          <StyledSelect
                                              name="semiifm_thickness_unitId"
                                              value={Form.semiifm_thickness_unitId || ""}
                                              onChange={handleInputChange}
                                              sx={{ width: "80px", maxWidth: "100%" , height: "45px"}}
                                              error={!!errors.semiifm_thickness_unitId} // แสดงสีแดงถ้ามี error
                                              helperText={errors.semiifm_thickness_unitId || ""} // แสดงข้อความเตือน
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
                                              <MDTypography  variant="h6" color="inherit">
                                              ประเภท
                                              </MDTypography>
                                          </MDBox>
                                      </Grid>
                                      <Grid item xs={12} sm={6} lg={6}>
                                          <StyledSelect
                                              name="semi_id"
                                              value={Form.semi_id || ""}
                                              onChange={handleInputChange}
                                              sx={{ width: "200px", maxWidth: "100%" , height: "45px"}}
                                              error={!!errors.semi_id} // แสดงสีแดงถ้ามี error
                                              helperText={errors.semi_id || ""} // แสดงข้อความเตือน
                                              FormHelperTextProps={{
                                                style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                              }}
                                          >
                                              {(dropdownSemi || []).map((item) => (
                                                  <MenuItem key={item.value} value={item.value}>
                                                      {item.text}
                                                  </MenuItem>
                                              ))}
                                          </StyledSelect>
                                      </Grid>
                                     

                                    

                                  </Grid>
                                </Grid>
    
                      <Grid item xs={12}  lg={6}>
                        <Grid container  spacing={3}   alignItems="center" >
                            <Grid item xs={12} sm={6} lg={6}>
                                <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                                    <MDTypography  variant="h6" color="inherit">
                                    {lang.msg("fg_data.fg_name")}
                                    </MDTypography>
                                </MDBox>
                            </Grid>
                            <Grid item xs={12} sm={6} lg={6}>
                                <MDInput 
                                    name="semiifm_name"
                                    variant="outlined"
                                    value={Form.semiifm_name}
                                    onChange={handleInputChange}
                                    sx={{ width: "200px", maxWidth: "100%" }}
                                    error={!!errors.semiifm_name} // แสดงสีแดงถ้ามี error
                                    helperText={errors.semiifm_name || ""} // แสดงข้อความเตือน
                                    FormHelperTextProps={{
                                      style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={6}>
                                <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                                    <MDTypography  variant="h6" color="inherit">
                                    {lang.msg("fg_data.fg_length")}
                                    </MDTypography>
                                </MDBox>
                            </Grid>
                            <Grid item xs={12} sm={6} lg={6}>
                                <MDInput
                                    name="semiifm_length"
                                    value={Form.semiifm_length || ""}
                                    onChange={handleInputChange}
                                    sx={{ width: "110px", maxWidth: "100%" }}
                                    error={!!errors.semiifm_length} // แสดงสีแดงถ้ามี error
                                    helperText={errors.semiifm_length || ""} // แสดงข้อความเตือน
                                    FormHelperTextProps={{
                                      style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                    }}
                                />
                                <StyledSelect
                                    name="semiifm_length_unitId"
                                    value={Form.semiifm_length_unitId || ""}
                                    onChange={handleInputChange}
                                    sx={{ width: "80px", maxWidth: "100%" , height: "45px"}}
                                    error={!!errors.semiifm_length_unitId} // แสดงสีแดงถ้ามี error
                                    helperText={errors.semiifm_length_unitId || ""} // แสดงข้อความเตือน
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
                                    <MDTypography  variant="h6" color="inherit">   
                                          หน่วยของสินค้า
                                    </MDTypography>
                                </MDBox>
                            </Grid>
                            <Grid item xs={12} sm={6} lg={6}>
                                <StyledSelect
                                    name="semiifm_product_unitId"
                                    value={Form.semiifm_product_unitId || ""}
                                    onChange={handleInputChange}
                                    sx={{ width: "200px", maxWidth: "100%" , height: "45px"}}
                                    error={!!errors.semiifm_product_unitId} // แสดงสีแดงถ้ามี error
                                    helperText={errors.semiifm_product_unitId || ""} // แสดงข้อความเตือน
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
                                    <MDTypography  variant="h6" color="inherit">
                                        เกณฑ์
                                    </MDTypography>
                                </MDBox>
                            </Grid>
                            <Grid item xs={12} sm={6} lg={6}>
                                <StyledSelect
                                    name="crt_id"
                                    value={Form.crt_id || ""}
                                    onChange={handleInputChange}
                                    sx={{ width: "200px", maxWidth: "100%" , height: "45px"}}
                                    error={!!errors.crt_id} // แสดงสีแดงถ้ามี error
                                    helperText={errors.crt_id || ""} // แสดงข้อความเตือน
                                    FormHelperTextProps={{
                                        style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                    }}
                                >
                                    {(dropdownCri || []).map((item) => (
                                        <MenuItem key={item.value} value={item.value}>
                                            {item.text}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
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

  export default SemiFGFormComponent;