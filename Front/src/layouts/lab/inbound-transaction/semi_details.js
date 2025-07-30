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
    import InBoundSemiFGAPI from "api/InBoundSemiFGAPI";
    import "jspdf-autotable";
    import { GlobalVar } from "../../../common/GlobalVar";

    const InbTranSemiFGDetails = () => {
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
     // eslint-disable-next-line no-unused-vars
    const [PermissionAction, setPermissionAction] = useState({
        ACT_EDIT: false,
    });
    const params = new URLSearchParams(location.search);
    const semiifm_id = params.get("semiifm_id");

    useEffect(() => {
        const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
        setRole(userRole);
    }, []);

    const fetchDataAll = async () => {
        if (!semiifm_id) {
        setLoading(false);
        return;
        }

        try {
        const response = await InBoundSemiFGAPI.getIbDetaliAll(semiifm_id);
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
    }, [semiifm_id]);

    const navigate = useNavigate();
    const handleReturn = () => {
        navigate("/inbtransaction/inbsemi");
    };

    const [searchFilters, setSearchFilters] = useState({});

    const handleExport = async () => {
        try {
        setLoading(true); // ✅ แสดงสถานะ loading

       
        const response = await InBoundSemiFGAPI.ExportDetailsInbSemi(semiifm_id, searchFilters,false);

        if (response.isCompleted) {
           
            return;
        }

        
        } catch (error) {
        console.error("Error during export:", error);
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
                Inbound Transaction / Semi FG / รายละเอียด
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
                        { field: "inbsemi_code", label: "รหัส", width: "10%" },
                        { field: "semiifm_name", label: "ชื่อ", width: "10%" },
                        {
                        label: "เกรด",
                        subColumns: [
                            { field: "semiifm_width", label: "กว้าง", width: "5%" },
                            { field: "semiifm_length", label: "ยาว", width: "5%" },
                            { field: "semiifm_thickness", label: "หนา", width: "5%" },
                        ],
                        width: "5%",
                        },
                        { field: "inbsemi_color", label: "สี" },
                        { field: "inbsemi_grade", label: "เกรด" },
                        { field: "inbsemi_lot", label: "Lot" },
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
                        { field: "inbsemi_quantity", label: "จำนวน" },
                    ]}
                    data={inboundAll}
                    idField="inbsemi_id"
                    showActions={false}
                    searchableColumns={[
                        "formatted_date",
                        "create_time",
                        "inbsemi_code",
                        "inbsemi_grade",
                        "fty_name",
                        "wh_name",
                        "zn_name",
                        "loc_name",
                        "inbsemi_quantity",
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
    export default InbTranSemiFGDetails;
