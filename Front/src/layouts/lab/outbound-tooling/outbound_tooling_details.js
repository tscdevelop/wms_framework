import React, { useState, useEffect } from "react"; 
import { Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useLocation } from "react-router-dom";
import OutBoundToolingAPI from "api/OutboundToolingAPI";
import TableComponent from "../components/table_component";
// import { GlobalVar } from "../../../common/GlobalVar";
import ButtonComponent from "../components/ButtonComponent";
import { useNavigate } from "react-router-dom";

const OutboundToolingDetails = () => {
   const [Form, setForm] = useState({
    outbtl_code: "", // ค่าเริ่มต้นของเลขที่ใบเบิก
    outbtl_issued_by: "",
    outbtl_details: "", // ค่าเริ่มต้นของรายละเอียด
  });
  const location = useLocation();
  const params = new URLSearchParams(location.search);

      
  // useEffect(() => {
  //     const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
  //     setRole(userRole);
  //   }, []);

  useEffect(() => {
    const code = params.get("outbtl_id");
    console.log("URL parameter outbtl_id:", code);
    if (code) {
      
      fetchOutTLID(code); // เรียก API ดึงข้อมูล
    }
  }, [location.search]);

  const fetchOutTLID = async (outbtl_id) => {
    try {
      const response = await OutBoundToolingAPI.getOutBoundTLByID(outbtl_id);
      console.log("API Response:", response);
  
      if ( response.isCompleted) {
        console.log("Response Data:", response.data);
        const { outbtl_code, outbtl_details,outbtl_issued_by } = response.data;
        const items = response.data?.inbtlCodes  || []; // ✅ ตรวจสอบว่ามี items หรือไม่
  
        setForm((prevState) => ({
          ...prevState,
          outbtl_code: outbtl_code || "",
          outbtl_issued_by: outbtl_issued_by || "",
          outbtl_details: outbtl_details || "",
          items: Array.isArray(items) ? items : [] // ✅ ป้องกัน undefined
        }));
  
        
      } else {
        console.error("Response is not completed or data is missing");
      }
    } catch (error) {
      console.error("Error fetching outbound raw data:", error);
    }
  };
  

  useEffect(() => {
    console.log("Form items:", Form.items);
  }, [Form.items]);




 const navigate = useNavigate(); 
  const handleReturn = () =>{
    
    navigate("/outbound/outboundtooling");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="inherit" fontWeight="bold">
            Outbound / Tooling / รายละเอียด
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
                <Grid item xs={12} md={3}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 2 }}>
                    <MDTypography variant="h6" color="inherit">
                      เลขที่ใบเบิก
                    </MDTypography>
                    <MDInput
                      sx={{ width: "200px", maxWidth: "100%" }}
                      name="outbtl_code"
                      value={Form.outbtl_code || ""}
                      disabled
                    />
                  </MDBox>
                </Grid>

                <Grid item xs={12} md={9}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 2 }}>
                    <MDTypography variant="h6" color="inherit">
                      ชื่อ - นานสกุลผู้ทำเรื่องเบิก 
                    </MDTypography>
                    <MDInput
                      sx={{ width: "450px", maxWidth: "100%" }}
                      name="outbtl_issued_by"
                      value={Form.outbtl_issued_by || ""}
                      disabled
                    />
                  </MDBox>
                </Grid>

                <Grid item xs={12} >
                <MDBox display="flex" alignItems="center" sx={{ gap: 2 }}>
                    <MDTypography variant="h6" color="inherit">
                      รายละเอียด
                    </MDTypography>
                    <MDInput
                      sx={{ width: "920px", maxWidth: "100%" }}
                      name="outbtl_details"
                      value={Form.outbtl_details || ""}
                      disabled
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12}>
                    <MDBox p={5}>
                        <Card>
                            <TableComponent
                                columns={[
                                { field: "tlifm_code", label: "รหัส Tooling", width: "15%" },
                                { field: "tlifm_name", label: "Tooling", width: "25%" },
                               
                                ]}
                                data={Array.isArray(Form.items) ? Form.items : []} // ✅ แก้ปัญหา .filter() error
                                idField="outbrmitm_id"
                                showActions={false}
                            />
                        </Card>
                    </MDBox>
                </Grid>

                  <Grid container>
                    <Grid item xs={12}>
                      <MDBox mt={6} display="flex" alignItems="center" justifyContent="flex-end" >
                          <ButtonComponent type="return" sx={{ px: 4, width: { xs: "100%", sm: "auto" } }} onClick={handleReturn} />
                      </MDBox>
                    </Grid>
                  </Grid>
              </Grid>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
};

export default OutboundToolingDetails;
