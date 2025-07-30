import React, { useState, useEffect } from "react";
import { Modal, Box,  Grid, MenuItem } from "@mui/material";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDBox from "components/MDBox";
import { StyledSelect } from "common/Global.style";
import DropDownAPI from "api/DropDownAPI";
import ToolingAPI from "api/ToolingAPI";
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


  const TLFormComponent = ({ open, onClose }) => {
  const [Form, setForm] = useState({
    tlifm_code:"",
    tl_id:"",
    crt_id:"",
    tlifm_name:"",
    tlifm_id:""
  });
  const [dropdownTooling , setDropDownTooling] = useState([]);
  const [dropdownCri,setDropDownCri]= useState([]); 
  const [errors, setErrors] = useState({});


        
  const DropdownTooling = async () => {
    try{
        const response = await DropDownAPI.getToolingDropDown();
        if(response.isCompleted){
            const data = response.data;
            setDropDownTooling(data);
        }
    }catch(error){
        console.error("Error fetching  data : ",error);
    }
  };
  useEffect(() =>{
    DropdownTooling();
  },[]);
        
       
          const DropdownCriter = async () => {
            try{
                const response = await DropDownAPI.getCriterDropdown();
                if(response.isCompleted){
                    const data = response.data;
                    setDropDownCri(data);
                }
            }catch(error){
                console.error("Error fetching  data : ",error);
            }
          };
        
        
          useEffect(() =>{
            DropdownCriter();
          },[]);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
          ...prev,
          [name]: value,
        }));
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      };



      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await ToolingAPI.createToolingInfo(Form);
          if (response.isCompleted) {
            onClose(response.data.tlifm_id);  // ปิด Modal ก่อน
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
                    เพิ่มข้อมูล Tooling
                </MDTypography>
            </MDBox>
            
            <MDBox sx={{ border: "2px solid black", borderRadius: "10px", padding: "20px" }}>
                      <Grid container spacing={3} alignItems="center">
                                <Grid item xs ={12}  lg={6}>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} lg={6}>
                                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                                          <MDTypography  variant="h6" color="inherit">
                                          {lang.msg("semi.semi_code")}
                                          </MDTypography>
                                      </MDBox>
                                    </Grid>
                                    <Grid item xs={12} sm={6} lg={6}>
                                        <MDInput 
                                            name="tlifm_code"
                                            variant="outlined"
                                            value={Form.tlifm_code}
                                            onChange={handleInputChange}
                                            sx={{ width: "300px", maxWidth: "100%" }}
                                            error={!!errors.tlifm_code} // แสดงสีแดงถ้ามี error
                                                helperText={errors.tlifm_code || ""} // แสดงข้อความเตือน
                                                FormHelperTextProps={{
                                                style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                            }}
                                        />
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
                                            name="tl_id"
                                            value={Form.tl_id || ""}
                                            onChange={handleInputChange}
                                            sx={{ width: "300px", maxWidth: "100%" , height: "45px"}}
                                            error={!!errors.tl_id} // แสดงสีแดงถ้ามี error
                                            helperText={errors.tl_id || ""} // แสดงข้อความเตือน
                                            FormHelperTextProps={{
                                            style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                            }}
                                        >
                                            {( dropdownTooling|| []).map((item) => (
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
                                              {lang.msg("semifg.semifg_name")}
                                              </MDTypography>
                                          </MDBox>
                                      </Grid>
                                      <Grid item xs={12} sm={6} lg={6}>
                                        <MDInput 
                                        name="tlifm_name"
                                        variant="outlined"
                                        value={Form.tlifm_name}
                                        onChange={handleInputChange}
                                        sx={{ width: "300px", maxWidth: "100%" }}
                                        error={!!errors.tlifm_name} // แสดงสีแดงถ้ามี error
                                            helperText={errors.tlifm_name || ""} // แสดงข้อความเตือน
                                            FormHelperTextProps={{
                                                style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                                        }}
                                        />
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
                                      </Grid>
                        </Grid>

                        <Grid item xs={12}/>
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

  export default TLFormComponent;