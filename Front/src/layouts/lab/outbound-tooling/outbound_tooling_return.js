
import React, { useState, useEffect } from "react"; 
import { Box, Grid, Card, MenuItem } from "@mui/material";
import { StyledSelect } from "common/Global.style";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import DropDownAPI from "api/DropDownAPI";
import OutBoundToolingAPI from "api/OutboundToolingAPI";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import BaseClass from "common/baseClass";
import UploadButton from "../components/upload_button"; 
import TransactionAPI from "api/TransactionLogAPI";


const OutBoundToolingReturn = () => {
   // eslint-disable-next-line no-unused-vars
   const [loading, setLoading] = useState(true);
   const [unitLoading, setUnitLoading] = useState(true); // State สำหรับ dropdownUnit
  const [Form, setForm] = useState({
    outbtl_code : "", // ค่าเริ่มต้นของเลขที่ใบเบิก
    outbtl_details : "", // ค่าเริ่มต้นของรายละเอียด
    outbtl_remark : "", 
    outbtl_img: "", // เพิ่มไฟล์ใน state
    outbtl_img_url: "",
    outbtl_img_name: "",
    outbtl_return_name:"",
    outbtlitm_img_url:""
  });
  const [dropdownTL, setDropDownTL] = useState([]);
  const [rows, setRows] = useState([
    {
      outbtlitm_id:"",
      inbtl_name: "",
      outbtl_img: "",
      outbtl_img_url: "",
      outbtl_remark : "", 
      outbtlitm_img_url:"",
    },
  ]);
  const [alert, setAlert] = useState({
      show: false,
      type: "success",
      title: "",
      message: "",
  });
   const location = useLocation();
    const params = new URLSearchParams(location.search);
    const [outbtl_id, setOutbtlCode] = useState(""); // สร้าง state สำหรับเก็บ outbrm_code
  
    useEffect(() => {
      const id = params.get("outbtl_id");
      if (id) {
        setOutbtlCode(id);
        fetchOutTlByID(id);
      }
    }, [location.search]);
    


  const fetchDropdownData = async (fetchFunction, setState) => {
    try {
      const response = await fetchFunction();
      if (response.isCompleted && response.data.length > 0) {
        setState(response.data);
      } else {
        console.error("Error fetching data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setUnitLoading(true); // เริ่ม Loading
        await fetchDropdownData(DropDownAPI.getInboundToolingDropdown, setDropDownTL);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      } finally {
        setUnitLoading(false); // Dropdown โหลดเสร็จ
      }
    };
  
    fetchDropdowns();
  }, []);
  




  useEffect(() =>{
    fetchOutTlByID();
  },[]);


  const fetchOutTlByID = async (outbtl_id) => {
    try {
      const response = await OutBoundToolingAPI.getOutBoundTLByID(outbtl_id);
      if (response.isCompleted) {
        const { data } = response;
  
        setForm((prevState) => ({
          ...prevState,
          outbtl_code: data.outbtl_code || "",
          outbtl_details: data.outbtl_details || "",
          outbtl_remark: data.outbtlitm_remark || "",
          outbtl_return_name: data.outbtl_returned_by || ""
        }));
  
        // แปลงข้อมูลจาก inbtlCodes เป็น rows หลายแถว
        const updatedRows = data.inbtlCodes.map((item) => ({
          outbtlitm_id: item.outbtlitm_id || null,
          inbtl_name: item.inbtl_id || "",
          // ยังไม่มีไฟล์ที่อัปโหลดใหม่
          outbtl_img: null, 
          // แปลง path ให้เป็น URL ที่เรียกดูรูปได้จริง
          outbtl_img_url: item.outbtlitm_img_url
            ? BaseClass.buildFileUrl(item.outbtlitm_img_url)
            : null,
          outbtl_remark: item.outbtlitm_remark || "",
        }));
  
        setRows(updatedRows);
      }
    } catch (error) {
      console.error("Error fetching outbound raw data:", error);
    }
  };
  
  

  
  
  
  useEffect(() => {
    if (outbtl_id && !unitLoading) { // รอให้ unitLoading เสร็จก่อน
      console.log("Fetching Outbound Raw Data for:", outbtl_id);
      fetchOutTlByID(outbtl_id);
    }
  }, [outbtl_id, unitLoading]);
  

  
  


  
  

  const handleInputChange = (index, field, value) => {
    setRows((prevRows) => {
      if (prevRows[index][field] === value) return prevRows; // ถ้าค่าเหมือนเดิม ไม่ต้องอัปเดต
      const updatedRows = [...prevRows];
      updatedRows[index] = { ...updatedRows[index], [field]: value };
      return updatedRows;
    });
  };
  
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };


  const handleSubmit = async () => {
    if (!outbtl_id) {
      console.error("❌ No outbtl_id found, cannot proceed.");
      return;
    }
  
    const formData = new FormData();
    formData.append("outbtl_details", Form.outbtl_details);
    formData.append("outbtl_returned_by", Form.outbtl_return_name);
    formData.append("outbtl_remark", Form.outbtl_remark);
  
    // ✅ Filter rows to include only those with images or existing URLs
    const filteredRows = rows.filter(row => row.outbtl_img instanceof File || row.outbtlitm_img_url);
  
    // ✅ Attach images only if they exist
    filteredRows.forEach(row => {
      if (row.outbtl_img instanceof File) {
        formData.append("files", row.outbtl_img);
      }
    });
  
    // ✅ Prepare `itemsData` with image URLs
    const itemsData = filteredRows.map(row => ({
      outbtlitm_id: row.outbtlitm_id,
      outbtlitm_remark: row.outbtl_remark,
      outbtlitm_img: row.outbtl_img instanceof File ? row.outbtl_img.name : row.outbtlitm_img_url || "",
    }));
  
    formData.append("items", JSON.stringify(itemsData));
  
    console.log("🚀 Filtered Items Data before sending:", itemsData);
    console.log("🚀 FormData for API:", Object.fromEntries(formData.entries()));
  
    try {
      const response = await OutBoundToolingAPI.returnOutBoundTL(outbtl_id, formData);
      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: "ยืนยันสำเร็จ",
          message: response.message,
        });
  
        // ✅ Fetch the latest returned data
        const fetchData = await OutBoundToolingAPI.getOutBoundTLByID(outbtl_id);
        console.log("📌 Fetch Data Response:", fetchData);
  
        // ✅ Convert dropdown values to text
        const dropdownTLText = dropdownTL?.find(item => item.value === rows[0]?.inbtl_name)?.text || "";
  
        // ✅ Prepare Transaction Log
        const logPayload = {
          log_type: "OUTBOUND",
          log_ctgy: "TOOLING",
          log_action: "RETURNED",
          ref_id: outbtl_id,
          transaction_data: {
            outbtl_code: fetchData.data?.outbtl_code || "",
            outbtl_details: fetchData.data?.outbtl_details || "",
            outbtl_remark: fetchData.data?.outbtl_remark || "",
            outbtl_return_status: fetchData.data?.outbtl_return_status || "",
            returned_by: Form.outbtl_return_name || "",
            tooling_name: dropdownTLText, // ✅ Convert Tooling to text
            images: itemsData.map(item => item.outbtlitm_img), // ✅ Log returned images
          },
        };
  
        console.log("📌 Transaction Log Payload:", logPayload);
        await TransactionAPI.createLog(logPayload);
  
        setTimeout(() => navigate("/outbound/outboundtooling"), 2000);
      } else {
        setAlert({
          show: true,
          type: "error",
          title: "ยืนยันไม่สำเร็จ",
          message: response.message,
        });
      }
    } catch (error) {
      console.error("❌ Error during return operation:", error);
    }
  };
  
  
  
  
  
  



  const handleImageChange = (index, name, file) => {
    setRows((prevRows) => {
      if (prevRows[index][name] === file) return prevRows; // ถ้ารูปเหมือนเดิม ไม่ต้องอัปเดต
      const updatedRows = [...prevRows];
      updatedRows[index][name] = file;
      return updatedRows;
    });
  };
  
  

  

  
  const navigate = useNavigate(); 
        const handlecancel = () =>{
            navigate("/outbound/outboundtooling");
        };
  

  return (
    <DashboardLayout>
      <DashboardNavbar />

        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="inherit" fontWeight="bold">
            Outbound/Tooling/ทำเรื่องคืน
          </MDTypography>
        </MDBox>

        <MDBox mt={5}>
          <Card>
            <MDBox m={3} p={5}>
              <MDTypography
                variant="h4"
                fontWeight="bold"
                color="warning"
                gutterBottom
                sx={{ mb: 5 }}
              >
                รายละเอียด
              </MDTypography>

              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 4 }}>
                    <MDTypography variant="body02" color="inherit">
                      เลขที่ใบเบิก
                    </MDTypography>
                    <MDInput
                      sx={{ width: "300px", maxWidth: "100%" }}
                      name="outbtl_code "
                      value={Form.outbtl_code  || ""} // ตรวจสอบว่า `Form.inbrm_code` มีค่า
                      disabled
                    />
                  </MDBox>
                </Grid>

                <Grid item xs={12} md={8}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 5 }}>
                    <MDTypography variant="h6" color="inherit">
                    ชื่อ - นามสกุลผู้ทำเรื่องคืน
                    </MDTypography>
                      <MDInput
                        sx={{ width: "600px", maxWidth: "100%" }}
                        name="outbtl_return_name" // ลบช่องว่างด้านหลังออก
                        value={Form.outbtl_return_name || ""}
                        onChange={handleChange}
                      />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={12}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 4 }}>
                    <MDTypography variant="h6" color="inherit">
                      รายละเอียด
                    </MDTypography>
                      <MDInput
                        sx={{ width: "1204px", maxWidth: "100%" }}
                        name="outbtl_details" // ลบช่องว่างด้านหลังออก
                        value={Form.outbtl_details || ""}
                        onChange={handleChange}
                      />
                  </MDBox>
                </Grid>


                <Grid item xs={12} sx={{ mt: 3 }}>
                  {rows.map((row, index) => (
                    <React.Fragment key={index}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={6} lg={6}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4} md={3}>
                              <MDBox display="flex" alignItems="center" justifyContent="center">
                                <MDTypography variant="h6" color="inherit">
                                  เครื่องมือ
                                </MDTypography>
                              </MDBox>
                            </Grid>
                            <Grid item xs={12} sm={8} md={9}>
                              <StyledSelect
                                name="inbtl_name"
                                value={row.inbtl_name || ""}
                                sx={{ width: "600px", maxWidth: "100%", height: "45px" }}
                                disabled
                              >
                                {dropdownTL.map((item) => (
                                  <MenuItem key={item.value} value={item.value}>
                                    {item.text}
                                  </MenuItem>
                                ))}
                              </StyledSelect>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item xs={12} sm={6} md={6} lg={6}>
                          <Grid container alignItems="center">
                            <Grid item xs={12} sm={4} md={3}>
                              <MDBox display="flex" alignItems="center" justifyContent="center">
                                <MDTypography variant="h6" color="inherit">
                                  แนบรูป
                                </MDTypography>
                              </MDBox>
                            </Grid>
                            <Grid item xs={12} sm={8} md={9}>
                              <MDBox display="flex" alignItems="center">
                              <UploadButton
                                name={`outbtl_img_${index}`}
                                fileData={row.outbtl_img} // File ที่ผู้ใช้เพิ่งอัปโหลด (ถ้าเป็น null แสดงว่ายังไม่มีการอัปโหลดใหม่)
                                apiImage={row.outbtl_img_url} // URL ที่โหลดมาจาก API
                                onFileChange={handleImageChange}
                                index={index}
                                label="อัปโหลดรูป"
                              />
                              </MDBox>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>

                      {/* เพิ่มระยะห่างให้หมายเหตุ */}
                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <Grid container alignItems="center">
                          <Grid item xs={12} sm={1.5}>
                            <MDBox display="flex" alignItems="center" justifyContent="center">
                              <MDTypography variant="h6" color="inherit">
                                หมายเหตุ
                              </MDTypography>
                            </MDBox>
                          </Grid>
                          <Grid item xs={12} sm={10.5}>
                            <MDInput
                              value={row.outbtl_remark || ""}
                              onChange={(e) => handleInputChange(index, "outbtl_remark", e.target.value)}
                              sx={{ width: "100%", maxWidth: "100%" }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>


             

              </Grid>

              <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                <ButtonComponent type="cancel" onClick={handlecancel} />
                <ButtonComponent  type="ConfirmReturn" onClick={handleSubmit} />
              </Box>
            </MDBox>
          </Card>
        </MDBox>


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

export default OutBoundToolingReturn;

