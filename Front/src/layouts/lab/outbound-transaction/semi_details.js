import React, { useState, useEffect } from "react";
import { Box, Grid, Card, FormControlLabel, Checkbox ,Divider} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import TableComponent from "../components/table_component";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import OutBoundSemiFGAPI from "api/OutBoundSemiFGAPI";

const OutbTranSemiDetails = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const outbsemi_id = params.get("outbsemi_id");
    const [Form, setForm] = useState({
        outbsemi_code: "", // ค่าเริ่มต้นของเลขที่ใบเบิก
        outbsemi_details: "", // ค่าเริ่มต้นของรายละเอียด
        outbsemi_so: "",
        outbsemi_remark: "",
        outbsemi_driver_name: "", // SELF_PICKUP หรือ DELIVERY
        outbsemi_vehicle_license: "",
        outbsemi_phone: "",
        outbsemi_address: "",
        tspyard_name: "",
        outbsemiitm_quantity: "",
        inbsemi_quantity:"",
        inbsemi_code: "",
        semiifm_name: "",
        outbsemi_is_returned: "",
        remaining_quantity: "",
    });
    const [tableData, setTableData] =useState([]);






   
    useEffect(() => {
        const fetchSemiFGDetails = async (id) => {
            try {
                const response = await OutBoundSemiFGAPI.getOutBoundSemiByID(id);
                if (response.isCompleted && response.data) {
                    setForm({
                        outbsemi_code: response.data.outbsemi_code,
                        outbsemi_details: response.data.outbsemi_details,
                        outbsemi_so: response.data.outbsemi_so,
                        outbsemi_remark: response.data.outbsemi_remark,
                        outbsemi_driver_name: response.data.outbsemi_driver_name,
                        outbsemi_vehicle_license: response.data.outbsemi_vehicle_license,
                        outbsemi_phone: response.data.outbsemi_phone,
                        tspyard_name: response.data.tspyard_name,
                        outbsemi_address: response.data.outbsemi_address,
                        outbsemi_is_returned: response.data.outbsemi_is_returned === 1,
                        remaining_quantity: response.data.remaining_quantity
                    });
                    setTableData(response.data.items || []);
                } else {
                    console.error("Error fetching FG details:", response.message);
                }
            } catch (error) {
                console.error("Error fetching FG details:", error);
            }
        };
        if (outbsemi_id) {
            fetchSemiFGDetails(outbsemi_id);
        }
    }, [outbsemi_id]);


    const navigate = useNavigate(); 
        const handlecancel = () =>{
            navigate("/outbtransaction/outbsemi");
        };
  

  



      
      
    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox p={2}>
                <MDBox mt={2} ml={5}>
                    <MDTypography variant="h3" color="inherit" fontWeight="bold">
                    Outbound Transaction / เบิก Semi FG / รายละเอียด 
                    </MDTypography>
                </MDBox>

                <MDBox mt={5}>
                    <Card>
                        <MDBox m={3} p={5}>
                            <MDTypography
                                variant="h5"
                                fontWeight="bold"
                                color="warning"
                                gutterBottom
                                sx={{ mb: 5 }}
                            >
                                รายละเอียด
                            </MDTypography>

                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <MDBox display="flex" alignItems="center" sx={{ gap: 3 }}>
                                        <MDTypography variant="h6" color="inherit">
                                            เลขที่ใบเบิก
                                        </MDTypography>
                                        <MDInput
                                            sx={{ width: "300px", maxWidth: "100%" }}
                                            name="outbsemi_code"
                                            value={Form.outbsemi_code || ""}
                                            disabled
                                        />
                                    </MDBox>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <MDBox display="flex" alignItems="center" sx={{ gap: 3}}>
                                        <MDTypography variant="h6" color="inherit">
                                            เลขที่ใบ SO.
                                        </MDTypography>
                                        <MDInput
                                            sx={{ width: "300px", maxWidth: "100%" }}
                                            name="outbsemi_so"
                                            value={Form.outbsemi_so || ""}
                                            disabled
                                        />
                                    </MDBox>
                                </Grid>



                                <Grid item xs={12} md={12}>
                                    <MDBox display="flex" alignItems="center" sx={{ gap: 2, mt: 3 }}>
                                        <MDTypography variant="h6" color="inherit">
                                            รายละเอียด
                                        </MDTypography>
                                        <MDInput
                                            sx={{ width: "1300px", maxWidth: "100%" }}
                                            name="outbsemi_details"
                                            value={Form.outbsemi_details || ""}
                                            disabled
                                        />
                                    </MDBox>
                                </Grid>
                                <Grid item xs={12} md={12}>
                                    <TableComponent
                                    columns={[
                                        { field: "inbsemi_code", label: "รหัส Semi FG", width: "10%"},
                                        { field: "semiifm_name", label: "Semi FG", width: "10%"},
                                        { field: "inbsemi_quantity", label: "จำนวนในคลัง", width: "30%"},
                                        { field: "outbsemiitm_quantity", label: "จำนวน", width: "30%"},   
                                        { field: "remaining_quantity", label: "จำนวนคงเหลือ", width: "30%" },
                                    ]}
                                    data={tableData}
                                    showActions={false}
                                    />
                                </Grid>
                               
                            </Grid>

                            <Divider
                                sx={{
                                    position: "absolute", // ทำให้สามารถจัดวางตำแหน่งด้วย left และ transform
                                    left: "50%", // ตั้งจุดเริ่มต้นให้อยู่กึ่งกลาง
                                    transform: "translateX(-50%)", // เลื่อนเส้นให้อยู่ตรงกลาง
                                    width: "95%", // ขยายความยาวของเส้นไปซ้ายและขวา (ปรับตามต้องการ เช่น 90%)
                                    height: "4px", // ความหนาของเส้น
                                    backgroundColor: "#000000", // สีของเส้น
                                }}
                            />
                            <MDBox mt={10}>
                                <Grid item xs={12}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={2} md={1}>
                                                <MDBox display="flex" alignItems="center" justifyContent="center" height="100%">
                                                <MDTypography variant="h5" color="warning">
                                                    หมายเหตุ
                                                </MDTypography>
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12} sm={10} md={11}>
                                                <MDInput
                                                name="outbsemi_remark"
                                                value={Form.outbsemi_remark}
                                                disabled
                                                sx={{ width: "1175px" ,maxWidth:"100%"}}
                                                />
                                            </Grid>
                                        </Grid>
                                </Grid>
                            </MDBox>
                           
                            <MDBox mt={8}>
                                <MDTypography variant="h5" color="warning" gutterBottom>
                                    การจัดส่ง
                                </MDTypography>
                                <MDBox display="flex"  mt={10} mb={5} ml={2}>
                                    <MDTypography variant="h6" color="inherit" >
                                        ข้อมูลการจัดส่งสินค้า
                                    </MDTypography>
                                </MDBox>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} md={6} lg={6}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={4} md={3} >
                                                <MDBox display="flex" alignItems="center"  justifyContent="center" height="100%">
                                                    <MDTypography variant="h6" color="inherit">
                                                        ชื่อผู้ขับ
                                                    </MDTypography>
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12} sm={8} md={9} >
                                                <MDInput
                                                    name="outbsemi_driver_name"
                                                    value={Form.outbsemi_driver_name}
                                                    disabled
                                                    sx={{ width: "400px", maxWidth: "100%" }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4} md={3} >
                                            <MDBox display="flex" alignItems="center"  justifyContent="center" height="100%">
                                                    <MDTypography variant="h6" color="inherit">
                                                        ชื่อท่ารถ
                                                    </MDTypography>
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12} sm={8} md={9} >
                                                <MDInput
                                                    name="tspyard_name"
                                                    value={Form.tspyard_name}
                                                    disabled
                                                    sx={{ width: "400px", maxWidth: "100%" }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={6} lg={6}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={4} md={3} >
                                                <MDBox display="flex" alignItems="center"  justifyContent="center" height="100%">
                                                    <MDTypography variant="h6" color="inherit">
                                                        ทะเบียนรถ
                                                    </MDTypography>
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12} sm={8} md={9} >
                                                <MDInput
                                                    name="outbsemi_vehicle_license"
                                                    value={Form.outbsemi_vehicle_license}
                                                    disabled
                                                    sx={{ width: "400px", maxWidth: "100%" }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4} md={3} >
                                            <MDBox display="flex" alignItems="center"  justifyContent="center" height="100%">
                                                    <MDTypography variant="h6" color="inherit">
                                                        เบอร์ติดต่อ
                                                    </MDTypography>
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12} sm={8} md={9} >
                                                <MDInput
                                                    name="outbsemi_phone"
                                                    value={Form.outbsemi_phone}
                                                    disabled
                                                    sx={{ width: "400px", maxWidth: "100%" }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={2.5} md={1.5}>
                                                <MDBox display="flex" alignItems="center" justifyContent="center" height="100%">
                                                <MDTypography variant="h6" color="inherit">
                                                    ที่อยู่
                                                </MDTypography>
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12} sm={10.5} md={10.5}>
                                                <MDInput
                                                name="outbsemi_address"
                                                value={Form.outbsemi_address}
                                                disabled
                                                sx={{  width: "1125px" ,maxWidth:"100%"}}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container spacing={3}>
                                            
                                            <Grid item xs={12} sm={2.5} md={1.5}>
                                                <MDBox display="flex" alignItems="center" justifyContent="center">
                                                <FormControlLabel
                                                    control={<Checkbox checked={Form.outbsemi_is_returned} />}
                                                    disabled
                                                />
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12}  sm={10.5} md={10.5}>
                                                <MDBox display="flex" alignItems="center" justifyContent="flex-start" height="100%">
                                                    <MDTypography variant="h6" color="inherit">
                                                        นำกลับหรือไม่
                                                    </MDTypography>
                                                </MDBox>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </MDBox>
                            <Box mt={5} display="flex" justifyContent="flex-end" gap={2}>
                                <ButtonComponent type="return" onClick={handlecancel} />
                            </Box>
                        </MDBox>
                    </Card>
                </MDBox>
            </MDBox>
          
        </DashboardLayout>
    );
};

export default OutbTranSemiDetails;



