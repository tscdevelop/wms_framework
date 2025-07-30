    import React, { useState, useEffect } from "react";
    import { Grid, Card } from "@mui/material";
    import "jspdf-autotable";
    import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
    import DashboardNavbar from "examples/Navbars/DashboardNavbar";
    import MDBox from "components/MDBox";
    import MDTypography from "components/MDTypography";
    import ButtonComponent from "../components/ButtonComponent";
    import SweetAlertComponent from "../components/sweetAlert";
    import TableComponent from "../components/table_component";
    import { useNavigate } from "react-router-dom";
    import InBoundToolingAPI from "api/InBoundToolingAPI";
    import { GlobalVar } from "../../../common/GlobalVar";
    const InbTranToolingDetails = () => {
        // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [inboundAll, setInboundAll] = useState([]); // ข้อมูลทั้งหมด
    const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    });

    const [role, setRole] = useState("");
    const params = new URLSearchParams(location.search);
    const tlifm_id = params.get("tlifm_id");

    useEffect(() => {
    const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
    setRole(userRole);
    }, []);

    const fetchDataAll = async (tlifm_id) => {
    if (!tlifm_id) {
        setLoading(false);
        return;
    }
    try {
        const response = await InBoundToolingAPI.getInBoundTlAllDetails(tlifm_id);
        console.log("tooling detail All :", response);

        if (response.isCompleted) {
        const data = response.data;
        setInboundAll(data);
        }
    } catch (error) {
        console.error("Error fetching  data : ", error);
    } finally {
        setLoading(false);
    }
    };
    useEffect(() => {
    if (tlifm_id) {
        fetchDataAll(tlifm_id);
    }
    }, [tlifm_id]);

    const navigate = useNavigate();
    const handleReturn = () => {
    navigate("/inbtransaction/inbtooling");
    };

    const [searchFilters, setSearchFilters] = useState({});

    const handleExport = async () => {
    try {
        setLoading(true); // ✅ แสดงสถานะ loading

        // ✅ ถ้าพบข้อมูลที่มี `formatted_date` ตรงกัน → เรียก API เพื่อดาวน์โหลดไฟล์
        const response = await InBoundToolingAPI.ExportDetailsInbTl(tlifm_id, searchFilters,false);

        if (!response.isCompleted) {
       
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
            Inbound Transaction / Tooling / รายละเอียด
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
                    { field: "formatted_date", label: "วันที่", width: "5%" },
                    { field: "create_time", label: "เวลา", width: "5%" },
                    { field: "inbtl_code", label: "รหัส", width: "15%" },
                    { field: "tlifm_name", label: "ชื่อ", width: "5%" },
                    {
                        label: "store",
                        subColumns: [
                        { field: "fty_name", label: "โรงงาน", width: "5%" },
                        { field: "wh_name", label: "คลัง", width: "5%" },
                        { field: "zn_name", label: "Zone", width: "5%" },
                        { field: "loc_name", label: "Location", width: "5%" },
                        ],
                        width: "5%",
                    },
                    { field: "inbtl_quantity", label: "จำนวน", width: "5%" },
                    { field: "inbtl_remark", label: "หมายเหตุ", width: "5%" },
                    ]}
                    data={inboundAll}
                    idField="inbtl_id"
                    showActions={false}
                    searchableColumns={[
                        "formatted_date",
                        "create_time",
                        "inbtl_code",
                        "fty_name",
                        "wh_name",
                        "zn_name",
                        "loc_name",
                        "inbtl_quantity"
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
    export default InbTranToolingDetails;
