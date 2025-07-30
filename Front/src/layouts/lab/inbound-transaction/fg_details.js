    import React, { useState, useEffect } from "react";
    import { Grid, Card } from "@mui/material";
    import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
    import DashboardNavbar from "examples/Navbars/DashboardNavbar";
    import MDBox from "components/MDBox";
    import MDTypography from "components/MDTypography";
    import ButtonComponent from "../components/ButtonComponent";
    import SweetAlertComponent from "../components/sweetAlert";
    import TableComponent from "../components/table_component";
    import { useNavigate } from "react-router-dom";
    import { useLocation } from "react-router-dom";
    import InBoundFGAPI from "api/InBoundFgAPI";
    import "jspdf-autotable";
    import { GlobalVar } from "../../../common/GlobalVar";

    const InbTranFGDetails = () => {
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [inboundAll, setInboundAll] = useState([]); // ข้อมูลทั้งหมด
    
    const [alert, setAlert] = useState({
        show: false,
        type: "success",
        title: "",
        message: "",
    });

    const location = useLocation();
    const [role, setRole] = useState("");
    const params = new URLSearchParams(location.search);
    const fgifm_id = params.get("fgifm_id");

    useEffect(() => {
        const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
        setRole(userRole);
    }, []);

    const fetchDataAll = async () => {
        try {
        const response = await InBoundFGAPI.getIbDetailAll(fgifm_id);
        console.log("Inbound Detail Data:", response);

        if (response.isCompleted) {
            setInboundAll(response.data);
        }
        } catch (error) {
        console.error("Error fetching inbound detail data:", error);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataAll();
    }, [fgifm_id]);

    const navigate = useNavigate();
    const handleReturn = () => {
        navigate("/inbtransaction/inbfg");
    };

    const [searchFilters, setSearchFilters] = useState({});

    const handleExport = async () => {
        try {
        setLoading(true); // ✅ แสดงสถานะ loading

      

        // ✅ ถ้าพบข้อมูลที่มี `formatted_date` ตรงกัน → เรียก API เพื่อดาวน์โหลดไฟล์
        const response = await InBoundFGAPI.ExportDetailsInbFG(fgifm_id, searchFilters,false);

        if (response.isCompleted) {
         
            return;
        }

        } catch (error) {
        console.error("❌ Error during export:", error);
        } finally {
        setLoading(false);
        }
    };

    return (
        <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={2}>
            <MDBox mt={2} ml={5}>
            <MDTypography variant="h3" color="dark" fontWeight="bold">
                Inbound Transaction / FG / รายละเอียด
            </MDTypography>
            </MDBox>

            <MDBox mt={5}>
            <Card>
                <MDBox mt={3} p={3}>
                <Grid container spacing={2} justifyContent="flex-end">
                    <Grid item>
                    <ButtonComponent type="report" onClick={handleExport} />
                    </Grid>
                </Grid>
                </MDBox>

                <MDBox p={5}>
                <Card>
                    <TableComponent
                    columns={[
                        { field: "formatted_date", label: "วันที่", width: "10%" },
                        { field: "create_time", label: "เวลา", width: "10%" },
                        { field: "inbfg_code", label: "รหัส", width: "10%" },
                        { field: "fgifm_name", label: "ชื่อ", width: "10%" },
                        {
                        label: "ขนาด",
                        subColumns: [
                            { field: "fgifm_width", label: "กว้าง", width: "5%" },
                            { field: "fgifm_length", label: "ยาว", width: "5%" },
                            { field: "fgifm_thickness", label: "หนา", width: "5%" },
                        ],
                        width: "5%",
                        },
                        { field: "inbfg_color", label: "สี" },
                        { field: "inbfg_grade", label: "เกรด" },
                        { field: "inbfg_lot", label: "Lot" },
                        {
                        label: "Store",
                        subColumns: [
                            { field: "fty_name", label: "โรงงาน", width: "5%" },
                            { field: "wh_name", label: "คลัง", width: "5%" },
                            { field: "zn_name", label: "Zone", width: "5%" },
                            { field: "loc_name", label: "Location", width: "5%" },
                        ],
                        width: "5%",
                        },
                        { field: "inbfg_quantity", label: "จำนวน" },
                    ]}
                    data={inboundAll}
                    idField="inbfg_id"
                    showActions={false}
                    searchableColumns={[
                        "formatted_date",
                        "create_time",
                        "inbfg_code",
                        "inbfg_color",
                        "inbfg_grade",
                        "fty_name",
                        "wh_name",
                        "zn_name",
                        "loc_name",
                        "inbfg_quantity"
                    ]}
                    userRole={role}
                    hiddenActions={["print", "settings"]}
                    onFilterChange={setSearchFilters} // ส่งฟังก์ชันไปเพื่อรับค่าค้นหา
                    />
                </Card>
                <MDBox mt={3} display="flex" justifyContent="flex-end">
                    <ButtonComponent
                    type="return"
                    sx={{ px: 4, width: { xs: "100%", sm: "auto" } }}
                    onClick={handleReturn}
                    />
                </MDBox>
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
        </MDBox>
        </DashboardLayout>
    );
    };
    export default InbTranFGDetails;
