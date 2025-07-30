    import React, { useState, useEffect } from "react";
    import {
    Box,
    Grid,
    Card,
    } from "@mui/material";
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
    import InBoundFGAPI from "api/InBoundFgAPI";
    import TransactionAPI from "api/TransactionLogAPI";
    import PrintBarCodeFgModal from "../components/fg_barcode";
    import { GlobalVar } from "../../../common/GlobalVar";

    const InboundFGDetails = () => {
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
    const [selectedInbfgId, setSelectedInbfgId] = useState(null); // เก็บ inbrm_id ที่เลือก
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
    const handleEdit = (inbfg_id) => {
        navigate(`/inboundFG-add?inbfg_id=${inbfg_id}`); // ส่ง inbrm_id ผ่าน query string
    };

    const handleDelete = async () => {
        try {
        

        // 🔹 ดึงข้อมูลทั้งหมดจาก getIbDetailAll
        const responseAll = await InBoundFGAPI.getIbDetailAll(fgifm_id);
        if (!responseAll.isCompleted || !responseAll.data) {
            return;
        }

        // 🔹 ค้นหาข้อมูลที่ตรงกับ inbfg_id ที่ต้องการลบ
        const selectedData = responseAll.data.find((item) => item.inbfg_id === deleteCode);
        if (!selectedData) {
            return;
        }

        // 🔹 เรียก API ลบข้อมูล
        const responseDelete = await InBoundFGAPI.deleteInBoundFg(deleteCode);
        if (responseDelete.isCompleted) {
            // 🔹 สร้าง log payload
            const logPayload = {
            log_type: "INBOUND",
            log_ctgy: "FINISHED_GOODS",
            log_action: "DELETED",
            ref_id: selectedData.inbfg_id,
            transaction_data: {
                fgifm_id: selectedData.fgifm_id,
                fgifm_code: selectedData.fgifm_code,
                fgifm_name: selectedData.fgifm_name,
                fgifm_width: selectedData.fgifm_width,
                fgifm_length: selectedData.fgifm_length,
                fgifm_thickness: selectedData.fgifm_thickness,
                inbfg_color: selectedData.inbfg_color,
                inbfg_grade: selectedData.inbfg_grade,
                inbfg_lot: selectedData.inbfg_lot,
                inbfg_code: selectedData.inbfg_code,
                fty_name: selectedData.fty_name,
                wh_name: selectedData.wh_name,
                zn_name: selectedData.zn_name,
                loc_name: selectedData.loc_name,
                inbfg_quantity: selectedData.inbfg_quantity,
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

    const handleBarcodeClick = (inbfg_id) => {
        setSelectedInbfgId(inbfg_id); // ตั้งค่า inbrm_id
        setBarcodeModalOpen(true); // เปิด Modal
    };

    const closeBarcodeModal = () => {
        setBarcodeModalOpen(false); // ปิด Modal
        setSelectedInbfgId(null); // ล้าง inbrm_id
    };

    const handleReturn = () => {
        navigate("/inbound/inboundfg");
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
        const response = await InBoundFGAPI.ExportDetailsInbFG(fgifm_id,searchFilters);

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
                {lang.msg("title.infg")}/ รายละเอียด
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

            <PrintBarCodeFgModal
            open={barcodeModalOpen}
            onClose={closeBarcodeModal}
            inbfg_id={selectedInbfgId}
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
    export default InboundFGDetails;
