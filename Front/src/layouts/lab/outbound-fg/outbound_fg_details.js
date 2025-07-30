import React, { useState, useEffect } from "react";
import { Box, Grid, Card,  Divider, FormControlLabel, Checkbox } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import TableComponent from "../components/table_component";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import OutBoundFGAPI from "api/OutBoundFgAPI";

const OutboundFGDetail = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const outbfg_id = params.get("outbfg_id");
    console.log("outbfg_id", outbfg_id );
    const [Form, setForm] = useState({
        outbfg_code: "", // ค่าเริ่มต้นของเลขที่ใบเบิก
        outbfg_details: "", // ค่าเริ่มต้นของรายละเอียด
        outbfg_so: "",
        outbfg_remark: "",
        outbfg_driver_name: "", // SELF_PICKUP หรือ DELIVERY
        outbfg_vehicle_license: "",
        outbfg_phone: "",
        outbfg_address: "",
        tspyard_name: "",
        sup_name:"",
        outbfgitm_quantity: "",
        inbsemi_quantity:"",
        inbsemi_code: "",
        semiifm_name: "",
        outbfg_shipment: false
    });
    const [tableData, setTableData] =useState([]);
  const [isJobNoChecked, setIsJobNoChecked] = useState(true);





   
  useEffect(() => {
    const fetchFGDetails = async (id) => {
        try {
            const response = await OutBoundFGAPI.getOutBoundFGByID(id);
            if (response.isCompleted && response.data) {
                setForm({
                    outbfg_code: response.data.outbfg_code,
                    outbfg_details: response.data.outbfg_details,
                    outbfg_so: response.data.outbfg_so,
                    outbfg_remark: response.data.outbfg_remark,
                    outbfg_driver_name: response.data.outbfg_driver_name,
                    outbfg_vehicle_license: response.data.outbfg_vehicle_license,
                    outbfg_phone: response.data.outbfg_phone,
                    tspyard_name: response.data.tspyard_name,
                    outbfg_address: response.data.outbfg_address,
                    outbfg_address_checked: response.data.outbfg_is_active === true,
                    sup_name: response.data.sup_name,
                    outbfg_shipment: response.data.outbfg_is_shipment || false  // ✅ กำหนดค่า outbfg_shipment
                });

                // ตรวจสอบว่าใช้ BOM หรือไม่
                if (response.data.outbfg_is_bom_used) {
                    // ใช้ข้อมูลจาก inbfg_ids ใน items
                    const extractedData = response.data.items.flatMap(item => 
                        item.inbfg_ids.map(inbfg => ({
                            inbfg_code: inbfg.inbfg_code, // รหัส Semi FG
                            fgifm_name: inbfg.fgifm_name, // ชื่อสินค้า
                            outbfgitm_quantity: inbfg.outbfgitm_quantity, // จำนวนในคลัง
                            inbfg_quantity: inbfg.inbfg_quantity, // จำนวนเบิก
                            remaining_quantity: inbfg.remaining_quantity // จำนวนคงเหลือ
                        }))
                    );
                    setTableData(extractedData);
                } else {
                    // ใช้ข้อมูลจาก items โดยตรงเมื่อไม่ใช้ BOM
                    const extractedData = response.data.items.map(item => ({
                        inbfg_code: item.inbfg_code, // รหัส FG
                        fgifm_name: item.fgifm_name, // ชื่อสินค้า
                        outbfgitm_quantity: item.outbfgitm_quantity, // จำนวนในคลัง
                        inbfg_quantity: item.inbfg_quantity, // จำนวนเบิก
                        remaining_quantity: item.remaining_quantity // จำนวนคงเหลือ
                    }));
                    setTableData(extractedData);
                }

                // ตั้งค่าตรวจสอบว่าใช้ BOM หรือไม่
                setIsJobNoChecked(response.data.outbfg_is_bom_used === true);
            } else {
                console.error("Error fetching FG details:", response.message);
            }
        } catch (error) {
            console.error("Error fetching FG details:", error);
        }
    };

    if (outbfg_id) {
        fetchFGDetails(outbfg_id);
    }
}, [outbfg_id]);





    const navigate = useNavigate(); 
        const handlecancel = () =>{
            navigate("/outbound/outboundfg");
        };
  

  

 // กด "ระบุ BOM"
 const handleJobNoCheckboxChange = () => {
    setIsJobNoChecked(true);
  };

  // กด "ไม่ระบุ BOM"
  const handleJobNoOutCheckboxChange = () => {
    setIsJobNoChecked(false);
  };


      
      
    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox p={2}>
                <MDBox mt={2} ml={5}>
                    <MDTypography variant="h3" color="inherit" fontWeight="bold">
                    Outbound / เบิก FG / รายละเอียด 
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
                                            name="outbfg_code"
                                            value={Form.outbfg_code || ""}
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
                                            name="outbfg_so"
                                            value={Form.outbfg_so || ""}
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

                                <Grid item xs={12} md={12}>
                                    <MDBox display="flex" alignItems="center" sx={{ gap: 2, mt: 3 }}>
                                        <MDTypography variant="h6" color="inherit">
                                            รายละเอียด
                                        </MDTypography>
                                        <MDInput
                                            sx={{ width: "1300px", maxWidth: "100%" }}
                                            name="outbfg_details"
                                            value={Form.outbfg_details || ""}
                                            disabled
                                        />
                                    </MDBox>
                                </Grid>

                               

                                <Grid item xs={12} md={12}>
                                    <TableComponent
                                    columns={[
                                        { field: "inbfg_code", label: "รหัส FG", width: "10%"},
                                        { field: "fgifm_name", label: "FG", width: "10%"},
                                        { field: "inbfg_quantity", label: "จำนวนในคลัง", width: "15%"},
                                        { field: "outbfgitm_quantity", label: "จำนวน", width: "30%"},   
                                        { field: "remaining_quantity", label: "จำนวนคงเหลือ", width: "30%"},   
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
                                                name="outbfg_remark"
                                                value={Form.outbfg_remark}
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
                                    <MDBox display="flex" justifyContent="flex-start" mt={4} mb={4} ml={5} gap={10}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={!Form.outbfg_shipment}
                                                    disabled
                                                    sx={{
                                                        color: "orange",
                                                        "&.Mui-checked": {
                                                            color: "orange",
                                                        },
                                                    }}
                                                />
                                            }
                                            label={
                                                <MDTypography variant="h6" color="inherit">
                                                    ลูกค้ามารับสินค้าเอง
                                                </MDTypography>
                                            }
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={Form.outbfg_shipment}
                                                    disabled
                                                    sx={{
                                                        color: "orange",
                                                        "&.Mui-checked": {
                                                            color: "orange",
                                                        },
                                                    }}
                                                />
                                            }
                                            label={
                                                <MDTypography variant="h6" color="inherit">
                                                    บริษัทจัดส่งสินค้า
                                                </MDTypography>
                                            }
                                        />
                                    </MDBox>

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
                                                    name="outbfg_driver_name"
                                                    value={Form.outbfg_driver_name}
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
                                                    name="outbfg_vehicle_license"
                                                    value={Form.outbfg_vehicle_license}
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
                                                    name="outbfg_phone"
                                                    value={Form.outbfg_phone}
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
                                                name="outbfg_address"
                                                value={Form.outbfg_address}
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
                                                    control={<Checkbox checked={Form.outbfg_checked} />}
                                                />
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

export default OutboundFGDetail;



