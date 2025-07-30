import React, { useState, useEffect } from "react"; 
import { Grid, Card, FormControlLabel, Checkbox } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useLocation } from "react-router-dom";
import OutBoundRawAPI from "api/OutBoundRawAPI";
import TableComponent from "../components/table_component";
import { GlobalVar } from "../../../common/GlobalVar";
import ButtonComponent from "../components/ButtonComponent";
import { useNavigate } from "react-router-dom";

const OutboundRawDetails = () => {
   const [Form, setForm] = useState({
    outbrm_code: "", // ค่าเริ่มต้นของเลขที่ใบเบิก
    outbrm_details: "", // ค่าเริ่มต้นของรายละเอียด
  });
  
  const [isJobNoChecked, setIsJobNoChecked] = useState(true); // สถานะของ Checkbox
  // eslint-disable-next-line no-unused-vars
  const [outbrm_id, setOutbrmID] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [role, setRole] = useState("");
  const location = useLocation();
  const params = new URLSearchParams(location.search);

      
  useEffect(() => {
      const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
      setRole(userRole);
    }, []);

  useEffect(() => {
    const code = params.get("outbrm_id");
    console.log("URL parameter outbrm_id:", code);
    if (code) {
      setOutbrmID(code);
      fetchOutRawID(code); // เรียก API ดึงข้อมูล
    }
  }, [location.search]);

  const fetchOutRawID = async (outbrm_id) => {
    try {
      const response = await OutBoundRawAPI.getOutBoundRawByID(outbrm_id);
      console.log("API Response:", response);
  
      if (response && response.isCompleted && response.data) {
        console.log("Response Data:", response.data);
        const { outbrm_code, outbrm_details, outbrm_is_bom_used } = response.data;
        const items = response.data?.items || []; // ✅ ตรวจสอบว่ามี items หรือไม่
  
        setForm((prevState) => ({
          ...prevState,
          outbrm_code: outbrm_code || "",
          outbrm_details: outbrm_details || "",
          items: Array.isArray(items) ? items : [] // ✅ ป้องกัน undefined
        }));
  
        setIsJobNoChecked(outbrm_is_bom_used === 1);
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

  // กด "ระบุ BOM"
  const handleJobNoCheckboxChange = () => {
    setIsJobNoChecked(true);
  };

  // กด "ไม่ระบุ BOM"
  const handleJobNoOutCheckboxChange = () => {
    setIsJobNoChecked(false);
  };



 const navigate = useNavigate(); 
  const handleReturn = () =>{
    
    navigate("/outbound/outboundraw");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="inherit" fontWeight="bold">
            Outbound / เบิก Raw Material / รายละเอียด
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
                      name="outbrm_code"
                      value={Form.outbrm_code || ""}
                      disabled
                    />
                  </MDBox>
                </Grid>

                <Grid item xs={12} md={5}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 2 }}>
                    <MDTypography variant="h6" color="inherit">
                      รายละเอียด
                    </MDTypography>
                    <MDInput
                      sx={{ width: "450px", maxWidth: "100%" }}
                      name="outbrm_details"
                      value={Form.outbrm_details || ""}
                      disabled
                    />
                  </MDBox>
                </Grid>

                <Grid item xs={12} md={3} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isJobNoChecked === true}
                        onChange={handleJobNoCheckboxChange}
                        color="primary"
                        disabled
                      />
                    }
                    label="ระบุ BOM"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isJobNoChecked === false}
                        onChange={handleJobNoOutCheckboxChange}
                        color="primary"
                        disabled
                      />
                    }
                    label="ไม่ระบุ BOM"
                  />
                </Grid>
                <Grid item xs={12}>
                    <MDBox p={5}>
                        <Card>
                            <TableComponent
                                columns={[
                                { field: "inbrm_code", label: "รหัส Raw Material", width: "15%" },
                                { field: "rmifm_name", label: "Raw Material", width: "25%" },
                                { field: "outbrmitm_quantity", label: "จำนวน", width: "15%" },
                                { field: "inbrm_quantity", label: "จำนวนคงเหลือในคลัง", width: "20%" }
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

export default OutboundRawDetails;
