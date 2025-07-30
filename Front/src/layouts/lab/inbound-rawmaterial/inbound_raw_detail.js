    import React, { useState, useEffect } from "react";
    import { Box, Grid, Card } from "@mui/material";
    import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
    import DashboardNavbar from "examples/Navbars/DashboardNavbar";
    import MDBox from "components/MDBox";
    import MDTypography from "components/MDTypography";
    import ButtonComponent from "../components/ButtonComponent";
    import SweetAlertComponent from "../components/sweetAlert";
    import TableComponent from "../components/table_component";
    import * as lang from "utils/langHelper";
    import { useNavigate } from "react-router-dom";
    import { useLocation } from "react-router-dom";
    import InBoundAPI from "api/InBoundRawAPI";
    import "jspdf-autotable";
    import TransactionAPI from "api/TransactionLogAPI";
    import PrintBarCodeRmModal from "../components/rm_barcode";
    // import roleAPI from "api/RoleAPI";
    import { GlobalVar } from "../../../common/GlobalVar";

    const InboundRawDetails = () => {
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [inboundAll, setInboundAll] = useState([]); // ข้อมูลทั้งหมด
    const [alert, setAlert] = useState({
        show: false,
        type: "success",
        title: "",
        message: "",
    });
    const [confirmAlert, setConfirmAlert] = useState(false);
    const [deleteCode, setDeleteCode] = useState(""); // รหัสโรงงานที่จะลบ
    const [barcodeModalOpen, setBarcodeModalOpen] = useState(false); // สำหรับเปิด/ปิด Modal
    const [selectedInbrmId, setSelectedInbrmId] = useState(null); // เก็บ inbrm_id ที่เลือก
    // const [state_menu_id, setStateMenuId] = useState(null);
    const location = useLocation();
    const [role, setRole] = useState("");
    // const [PermissionAction, setPermissionAction] = useState({
    // ACT_EDIT: false,
    // });
    const params = new URLSearchParams(location.search);
    const rmifm_id = params.get("rmifm_id");
    const rm_id = params.get("rm_id");

    useEffect(() => {
        const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
        setRole(userRole);
    }, []);

    // const fetchPermissionAction = async (menuId) => {
    // try {
    //     const apiResponse = await roleAPI.getPermissionAction(menuId);
    //     console.log("fetchPermissionAction -> apiResponse : ", apiResponse);
    //     if (apiResponse.data && apiResponse.data.permission_actions) {
    //     const pmsActData = apiResponse.data.permission_actions;
    //     console.log("fetchPermissionAction -> pmsActData: ", pmsActData);
    //     // ตั้งค่า permission actions จาก API
    //     setPermissionAction(
    //         pmsActData || {
    //         ACT_EDIT: false,
    //         }
    //     );
    //     }
    // } catch (error) {
    //     console.error("Error fetching menu permissions:", error);
    // }
    // };

    // useEffect(() => {
    // console.log("location.state : ", location.state);
    // console.log("location.state.menu_id : ", location.state?.menu_id);
    // if (location.state && location.state.menu_id) {
    //     const menuId = location.state.menu_id;
    //     setStateMenuId(menuId);
    //     fetchPermissionAction(menuId);
    // }
    // }, [location.state]);

    const fetchDataAll = async () => {
        if (!rmifm_id || !rm_id) {
        console.warn("rmifm_id หรือ rm_id ไม่มีค่า, ไม่สามารถเรียก API ได้");
        setLoading(false);
        return;
        }

        try {
        const response = await InBoundAPI.getIbDetaliAll(rmifm_id, rm_id);
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
    }, [rmifm_id, rm_id]);

    const navigate = useNavigate();
    const handleEdit = (inbrm_id) => {
        navigate(`/inboundraw-add?inbrm_id=${inbrm_id}`); // ส่ง inbrm_id ผ่าน query string
    };

    //

    const handleDelete = async () => {
        try {
        

        // 🔹 ดึงข้อมูลทั้งหมดจาก getIbDetaliAll
        const responseAll = await InBoundAPI.getIbDetaliAll(rmifm_id, rm_id);
        if (!responseAll.isCompleted || !responseAll.data) {
            return;
        }

        // 🔹 ค้นหาข้อมูลที่ตรงกับ inbrm_id ที่ต้องการลบ
        const selectedData = responseAll.data.find((item) => item.inbrm_id === deleteCode);
        if (!selectedData) {
            return;
        }

        // 🔹 เรียก API ลบข้อมูล
        const responseDelete = await InBoundAPI.deleteInBound(deleteCode);
        if (responseDelete.isCompleted) {
            // 🔹 สร้าง log payload
            const logPayload = {
            log_type: "INBOUND",
            log_ctgy: "RAW_MATERIAL",
            log_action: "DELETED",
            ref_id: selectedData.inbrm_id,
            transaction_data: {
                rmifm_id: selectedData.rmifm_id,
                rmifm_code: selectedData.rmifm_code,
                rmifm_name: selectedData.rmifm_name,
                rmifm_width: selectedData.rmifm_width,
                rmifm_length: selectedData.rmifm_length,
                rmifm_thickness: selectedData.rmifm_thickness,
                rmifm_weight: selectedData.rmifm_weight,
                inbrm_grade: selectedData.inbrm_grade,
                inbrm_lot: selectedData.inbrm_lot,
                inbrm_code: selectedData.inbrm_code,
                fty_name: selectedData.fty_name,
                wh_name: selectedData.wh_name,
                zn_name: selectedData.zn_name,
                loc_name: selectedData.loc_name,
                inbrm_quantity: selectedData.inbrm_quantity,
            },
            };

            console.log("📌 Transaction Log Payload:", logPayload);
            await TransactionAPI.createLog(logPayload);

            setAlert({
            show: true,
            type: "success",
            title: "ลบสำเร็จ",
            message: responseDelete.message,
            });

            await fetchDataAll(); // โหลดข้อมูลใหม่
        } else {
            setAlert({
            show: true,
            type: "error",
            title: "ลบไม่สำเร็จ",
            message: responseDelete.message,
            });
        }
        } catch (error) {
        console.error("❌ Error during delete operation:", error);
        } finally {
        setConfirmAlert(false); // ซ่อน SweetAlert ยืนยัน
        setLoading(false); // ปิดสถานะ loading
        }
    };

    const handleBarcodeClick = (inbrm_id) => {
        setSelectedInbrmId(inbrm_id); // ตั้งค่า inbrm_id
        setBarcodeModalOpen(true); // เปิด Modal
    };

    const closeBarcodeModal = () => {
        setBarcodeModalOpen(false); // ปิด Modal
        setSelectedInbrmId(null); // ล้าง inbrm_id
    };

    const handleReturn = () => {
        navigate("/inbound/inrawmaterial");
    };

    const [searchFilters, setSearchFilters] = useState({});
    // eslint-disable-next-line no-unused-vars
    const [searchValue, setSearchValue] = useState({});

    const handleExport = async () => {
        try {
        setLoading(true); // ✅ แสดงสถานะ loading

        // ✅ ตรวจสอบว่า `inboundAll` มีข้อมูลหรือไม่
        if (inboundAll.length === 0) {
            return;
        }

        // ✅ ดึงวันที่ปัจจุบันในรูปแบบ `"DD MMM YY"`
        const today = new Date();
        const formattedToday = today.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
        });

        // ✅ ตรวจสอบว่ามีข้อมูล `formatted_date` ตรงกับวันที่ปัจจุบันหรือไม่
        const matchingData = inboundAll.some((item) => item.formatted_date === formattedToday);

        if (!matchingData) {
            setAlert({
            show: true,
            type: "warning",
            title: "ไม่สามารถดาวน์โหลดไฟล์ได้",
            message: `ไม่พบข้อมูลที่ตรงกับวันที่ปัจจุบัน (${formattedToday})`,
            });
            return;
        }

        // ✅ ถ้าพบข้อมูลที่มี `formatted_date` ตรงกัน → เรียก API เพื่อดาวน์โหลดไฟล์
        const response = await InBoundAPI.ExportDetailsInbRaw(rmifm_id, searchFilters);

        if (!response.isCompleted) {
            setAlert({
            show: true,
            type: "error",
            title: "ดาวน์โหลดไฟล์ไม่สำเร็จ",
            message: response.message || "เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์",
            });
            return;
        }

        setAlert({
            show: true,
            type: "success",
            title: "ดาวน์โหลดไฟล์สำเร็จ",
            message: "ไฟล์ Excel ถูกสร้างและดาวน์โหลดเรียบร้อย",
        });
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
                {lang.msg("title.inrawmaterial")}/ รายละเอียด
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
                        { field: "inbrm_code", label: "รหัส", width: "10%" },
                        { field: "rmifm_name", label: "ชื่อ", width: "10%" },
                        {
                        label: "ขนาด",
                        subColumns: [
                            { field: "rmifm_width", label: "กว้าง", width: "5%" },
                            { field: "rmifm_length", label: "ยาว", width: "5%" },
                            { field: "rmifm_thickness", label: "หนา", width: "5%" },
                            { field: "rmifm_weight", label: "น้ำหนัก", width: "5%" },
                        ],
                        width: "5%",
                        },
                        { field: "inbrm_grade", label: "เกรด" },
                        { field: "inbrm_lot", label: "Lot" },
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
                        { field: "inbrm_quantity", label: "จำนวน" },
                    ]}
                    data={inboundAll}
                    idField="inbrm_id"
                    onEdit={(id) => {
                        console.log("Edit clicked for ID:", id);
                        handleEdit(id);
                    }}
                    onDelete={(id) => {
                        setDeleteCode(id);
                        setConfirmAlert(true);
                    }}
                    onBarcodeClick={handleBarcodeClick}
                    searchableColumns={[
                        "formatted_date",
                        "create_time",
                        "inbrm_code",
                        "inbrm_quantity",
                        "inbrm_total_weight",
                        "inbrm_grade",
                        "fty_name",
                        "wh_name",
                        "zn_name",
                        "loc_name",
                    ]}
                    userRole={role}
                    hiddenActions={["print", "settings"]}
                    onSearchChange={(val) => setSearchValue(val)} // รับค่าค้นหา
                    onFilterChange={setSearchFilters} // ส่งฟังก์ชันไปเพื่อรับค่าค้นหา
                    actionOrder={["barcode","edit","delete"]}
                    />
                </Card>
                <Box mt={3} display="flex" justifyContent="flex-end">
                    <ButtonComponent
                    type="return"
                    sx={{ px: 4, width: { xs: "100%", sm: "auto" } }}
                    onClick={handleReturn}
                    />
                </Box>
                </MDBox>
            </Card>
            </MDBox>

            <PrintBarCodeRmModal
            open={barcodeModalOpen}
            onClose={closeBarcodeModal}
            inbrm_id={selectedInbrmId}
            />

            {confirmAlert && (
            <SweetAlertComponent
                type="warning"
                title="ยืนยันการลบ"
                message="คุณต้องการลบข้อมูลนี้ใช่หรือไม่?"
                show={confirmAlert}
                showCancel
                confirmText="ตกลง"
                cancelText="ยกเลิก"
                onConfirm={handleDelete}
                onCancel={() => setConfirmAlert(false)}
            />
            )}
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
    export default InboundRawDetails;
