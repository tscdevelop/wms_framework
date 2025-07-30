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
    import InBoundToolingAPI from "api/InBoundToolingAPI";
    import { GlobalVar } from "../../../common/GlobalVar";
    import PrintBarCodeToolingModal from "../components/tl_barcode";
    import TransactionAPI from "api/TransactionLogAPI";
    const InboundTlDetails = () => {
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
    const [selectedInbtlId, setSelectedInbtlId] = useState(null); // เก็บ inbrm_id ที่เลือก
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
        console.error("Error fetching  data :", error);
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
    const handleEdit = (inbtl_id) => {
    navigate(`/inboundTooling-add?inbtl_id=${inbtl_id}`); // ส่ง inbrm_id ผ่าน query string
    };

    const handleBarcodeClick = (inbtl_id) => {
    setSelectedInbtlId(inbtl_id); // ตั้งค่า inbrm_id
    setBarcodeModalOpen(true); // เปิด Modal
    };

    const closeBarcodeModal = () => {
    setBarcodeModalOpen(false); // ปิด Modal
    setSelectedInbtlId(null); // ล้าง inbrm_id
    };

    const handleDelete = async () => {
    try {
        

        // 🔹 ดึงข้อมูลทั้งหมดจาก getInBoundTlAllDetails
        const responseAll = await InBoundToolingAPI.getInBoundTlAllDetails(tlifm_id);
        if (!responseAll.isCompleted || !responseAll.data) {
        return;
        }

        // 🔹 ค้นหาข้อมูลที่ตรงกับ inbtl_id ที่ต้องการลบ
        const selectedData = responseAll.data.find((item) => item.inbtl_id === deleteCode);
        if (!selectedData) {
        return;
        }

        // 🔹 เรียก API ลบข้อมูล
        const responseDelete = await InBoundToolingAPI.deleteInBoundTool(deleteCode);
        if (responseDelete.isCompleted) {
        // 🔹 สร้าง Log Payload
        const logPayload = {
            log_type: "INBOUND",
            log_ctgy: "TOOLING",
            log_action: "DELETED",
            ref_id: selectedData.inbtl_id,
            transaction_data: {
            tlifm_id: selectedData.tlifm_id,
            tlifm_code: selectedData.tlifm_code,
            tlifm_name: selectedData.tlifm_name,
            inbtl_code: selectedData.inbtl_code,
            fty_name: selectedData.fty_name,
            wh_name: selectedData.wh_name,
            zn_name: selectedData.zn_name,
            loc_name: selectedData.loc_name,
            inbtl_quantity: selectedData.inbtl_quantity,
            inbtl_remark: selectedData.inbtl_remark,
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

        await fetchDataAll(tlifm_id); // โหลดข้อมูลใหม่
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

    const handleReturn = () => {
    navigate("/inbound/inboundtooling");
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
        const response = await InBoundToolingAPI.ExportDetailsInbTl(tlifm_id, searchFilters);

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
            {lang.msg("title.intooling")}
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
                    onEdit={(id) => {
                    handleEdit(id);
                    }}
                    onDelete={(id) => {
                    setDeleteCode(id);
                    setConfirmAlert(true);
                    }}
                    searchableColumns={[
                    "formatted_date",
                    "create_time",
                    "inbtl_code",
                    "fty_name",
                    "wh_name",
                    "zn_name",
                    "loc_name",
                    "inbtl_quantity",
                    ]}
                    userRole={role}
                    hiddenActions={["print", "settings"]}
                    onBarcodeClick={handleBarcodeClick}
                    onSearchChange={(val) => setSearchValue(val)} // รับค่าค้นหา
                    onFilterChange={setSearchFilters}
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
        </MDBox>
        <PrintBarCodeToolingModal
        open={barcodeModalOpen}
        onClose={closeBarcodeModal}
        inbtl_id={selectedInbtlId}
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
    </DashboardLayout>
    );
    };
    export default InboundTlDetails;
