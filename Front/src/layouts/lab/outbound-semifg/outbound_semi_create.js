import React, { useState, useEffect } from "react";
import { Box, Grid, Card, Button, Divider, FormControlLabel, Checkbox, MenuItem } from "@mui/material";
import { StyledSelect } from "common/Global.style";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import SweetAlertComponent from "../components/sweetAlert";
import ButtonComponent from "../components/ButtonComponent";

import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import OutBoundSemiFGAPI from "api/OutBoundSemiFGAPI";
import InBoundSemiFGAPI from "api/InBoundSemiFGAPI";

import DropDownAPI from "api/DropDownAPI";
import PrintSemiFgWDComponent from "../components/outbound_semifg_withdraw";
import PrintSemiShipComponent from "../components/outbound_semifg_shipment";
import TransactionAPI from "api/TransactionLogAPI";
const OutboundSemiCreate = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const outbsemi_id = params.get("outbsemi_id");
    console.log("outbsemi_id", outbsemi_id);

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
        inbsemi_quantity: "",
        inbsemi_code: "",
        semiifm_name: "",
        outbsemi_is_returned: false
    });
    const [dropdownSemiFG, setDropDownSemiFG] = useState([]);
    const [dropdownTransport, setDropDownTransport] = useState([]);

    // state สำหรับ Modal ของ Component Print
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [printShipModalOpen, setPrintShipModalOpen] = useState(false);
    const [selectedOutbSemiId, setSelectedOutbSemiId] = useState(null);
    const [mode, setMode] = useState("add"); // "add" หรือ "edit"
    const [alert, setAlert] = useState({
        show: false,
        type: "success",
        title: "",
        message: "",
    });
    const [rows, setRows] = useState([
        {
            inbsemi_drop: "",
            outbsemi_quantity: "",
            inbsemi_quantity: "",
            quantity: "",
        },
    ]);

    const handleModalClose = () => {
        setPrintModalOpen(false); // ปิด Modal
        setPrintShipModalOpen(false); // ปิด Modal
        navigate("/outbound/outboundsemifg");
    };

    useEffect(() => {
        if (outbsemi_id) {
            setMode("edit");
        } else {
            setMode("add");
        }
    }, [outbsemi_id]);



    const handleAddRowAtIndex = (index) => {
        const newRow = {
            inbsemi_drop: "",
            outbsemi_quantity: "",
            inbsemi_quantity: "",
            quantity: "",
        };
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            updatedRows.splice(index + 1, 0, newRow); // แทรกหลังแถวที่กด
            return updatedRows;
        });
    };
        

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
                        outbsemi_address: response.data.outbsemi_address,
                        tspyard_name: response.data.tspyard_id,
                        outbsemi_is_returned: response.data.outbsemi_is_returned === 1
                    });

                    // ตั้งค่าข้อมูลในตาราง
                    if (response.data.items) {
                        const formattedRows = response.data.items.map(item => ({
                            inbsemi_drop: item.inbsemi_id,
                            outbsemi_quantity: item.outbsemiitm_quantity,
                            inbsemi_quantity: item.inbsemi_quantity,
                            quantity: item.remaining_quantity
                        }));
                        setRows(formattedRows);
                        console.log(" FG details:", formattedRows);
                    }

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



    //สำหรับ กรอกข้อมูลใน Field 
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === "outbsemi_phone") {
            // กรองเอาเฉพาะตัวเลขและจำกัดความยาวที่ 10 หลัก
            const numericValue = value.replace(/\D/g, "").substring(0, 10);
            setForm((prevForm) => ({
                ...prevForm,
                [name]: numericValue,
            }));
        } else {
            setForm((prevForm) => ({
                ...prevForm,
                [name]: value,
            }));
        }
    };

    // ฟังก์ชันสำหรับจัดการกับการเปลี่ยนแปลงของ checkbox
    const handleCheckboxChange = (event) => {
        setForm((prevForm) => ({
            ...prevForm,
            outbsemi_is_returned: event.target.checked,
        }));
    };

    //สำหรับ Dropdown ท่ารถเลือก
    const handleTransportDropdownChange = (event) => {
        const { value } = event.target;
        setForm((prevForm) => ({
            ...prevForm,
            tspyard_name: value
        }));
    };



    const handleRemoveRow = (index) => {
        if (rows.length === 1) {
            console.log("❌ Cannot remove the last remaining row");
            return;
        }
        setRows((prev) => prev.filter((_, i) => i !== index));
    };
        

    //เรียกใช้ API Dropdown Semi FG ในเจน Row
    useEffect(() => {
        const fetchDropdownSemiFG = async () => {
            try {
                const response = await DropDownAPI.getInboundSemiFGDropdown();
                if (response.isCompleted && response.data) {
                    setDropDownSemiFG(response.data);
                }
            } catch (error) {
                console.error("Error fetching dropdownSemiFG:", error);
            }
        };
        fetchDropdownSemiFG();
    }, []);

    //เรียกใช้ API Dropdown ท่ารถ 
    useEffect(() => {
        const fetchDropdownTransPort = async () => {
            try {
                const response = await DropDownAPI.getTransPostDropdown();
                if (response.isCompleted && response.data) {
                    setDropDownTransport(response.data);
                }
            } catch (error) {
                console.error("Error fetching dropdownSemiFG:", error);
            }
        };
        fetchDropdownTransPort();
    }, []);

    const handleDropdownChange = async (event, index) => {
        const selectedValue = event.target.value;
        try {
            const response = await InBoundSemiFGAPI.getInBoundByID(selectedValue);
            if (response.isCompleted && response.data) {
                setRows((prevRows) => {
                    const updatedRows = [...prevRows];
                    updatedRows[index] = {
                        ...updatedRows[index],
                        inbsemi_drop: selectedValue,
                        inbsemi_quantity: response.data.inbsemi_quantity,
                        quantity: response.data.inbsemi_quantity,
                    };
                    return updatedRows;
                });
            }
        } catch (error) {
            console.error("Error fetching InBoundSemiFG details:", error);
        }
    };

    const handleQuantityChange = (event, index) => {
        const value = event.target.value.replace(/[^0-9]/g, "");
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            const remainingQuantity = updatedRows[index].inbsemi_quantity - parseInt(value || 0, 10);
            updatedRows[index] = {
                ...updatedRows[index],
                outbsemi_quantity: value,
                quantity: remainingQuantity >= 0 ? remainingQuantity : 0,
            };
            return updatedRows;
        });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        
         // ✅ วน loop เพื่อ process แต่ไม่ตรวจสอบเงื่อนไขข้อมูลในแต่ละ row
    for (const row of rows) {
        console.log("Processing row:", row);
    }

        // 🔹 แปลงค่า dropdown จาก value → text สำหรับ Transaction เท่านั้น
        const selectedTransport = dropdownTransport.find(item => item.value === Form.tspyard_name);
        const selectedItems = rows.map(row => {
            const selectedSemiFG = dropdownSemiFG.find(item => item.value === row.inbsemi_drop);
            return {
                inbsemi_id: Number(row.inbsemi_drop),
                outbsemiitm_quantity: Number(row.outbsemi_quantity) || 0,
                inbsemi_text: selectedSemiFG ? selectedSemiFG.text : "", // ✅ แปลงเป็น text
            };
        });

        // ✅ สร้าง payload สำหรับ API (ส่ง value)
        const payload = {
            outbsemi_details: Form.outbsemi_details,
            outbsemi_so: Form.outbsemi_so,
            outbsemi_remark: Form.outbsemi_remark,
            outbsemi_driver_name: Form.outbsemi_driver_name,
            outbsemi_vehicle_license: Form.outbsemi_vehicle_license,
            outbsemi_phone: Form.outbsemi_phone,
            outbsemi_address: Form.outbsemi_address,
            tspyard_id: Form.tspyard_name,
            outbsemi_is_returned: Form.outbsemi_is_returned, // ✅ Boolean
            items: selectedItems.map(item => ({
                inbsemi_id: item.inbsemi_id,
                outbsemiitm_quantity: item.outbsemiitm_quantity,
            })),

        };

        console.log("📌 Sending Payload:", JSON.stringify(payload, null, 2));

        try {
            if (!outbsemi_id) {
                // 🔹 โหมดเพิ่มข้อมูล (add)
                const response = await OutBoundSemiFGAPI.createOutBoundSemi(payload);
                console.log("📌 API Response:", response);
                if (response.isCompleted) {
                    setAlert({
                        show: true,
                        type: "success",
                        title: "สร้างข้อมูลสำเร็จ",
                        message: response.message,
                    });

                    // 🔹 ดึงข้อมูลจาก ID ที่สร้างใหม่
                    const createdId = response.data.outbsemi_id;
                    const fetchedData = await OutBoundSemiFGAPI.getOutBoundSemiReqByID(createdId);
                    if (fetchedData.isCompleted) {
                        setSelectedOutbSemiId(createdId);
                    }

                    // ✅ บันทึก Transaction Log (ส่ง text แทน value)
                    const logPayload = {
                        log_type: "OUTBOUND",
                        log_ctgy: "SEMI",
                        log_action: "CREATED",
                        ref_id: createdId,
                        transaction_data: {
                            outbsemi_code: fetchedData.data?.outbsemi_code || "",
                            outbsemi_details: fetchedData.data?.outbsemi_details || "",
                            outbsemi_so: fetchedData.data?.outbsemi_so || "",
                            outbsemi_remark: fetchedData.data?.outbsemi_remark || "",
                            outbsemi_driver_name: fetchedData.data?.outbsemi_driver_name || "",
                            outbsemi_vehicle_license: fetchedData.data?.outbsemi_vehicle_license || "",
                            outbsemi_phone: fetchedData.data?.outbsemi_phone || "",
                            outbsemi_address: fetchedData.data?.outbsemi_address || "",
                            tspyard_name: selectedTransport ? selectedTransport.text : "", // ✅ แปลง dropdown เป็น text
                            items: selectedItems.map(item => ({
                                inbsemi_text: item.inbsemi_text, // ✅ ใช้ text แทน value
                                outbsemiitm_quantity: item.outbsemiitm_quantity,
                            })),
                        },
                    };

                    console.log("📌 Transaction Log Payload:", logPayload);
                    await TransactionAPI.createLog(logPayload);

                    // 🔹 เปิด Modal ตามเงื่อนไขของ checkbox "นำกลับหรือไม่"
                    if (Form.outbsemi_is_returned) {
                        setPrintModalOpen(true);
                    } else {
                        setPrintShipModalOpen(true);
                    }
                } else {
                    setAlert({
                        show: true,
                        type: "error",
                        title: "สร้างข้อมูลไม่สำเร็จ",
                        message: response.message,
                    });
                }
            } else {
                // 🔹 โหมดแก้ไข (edit)
                const response = await OutBoundSemiFGAPI.updateOutBoundSemi(outbsemi_id, payload);
                console.log("📌 API Response:", response);
                if (response.isCompleted) {
                    setAlert({
                        show: true,
                        type: "success",
                        title: "แก้ไขข้อมูลสำเร็จ",
                        message: response.message,
                    });

                    // ✅ บันทึก Transaction Log (ส่ง text แทน value)
                    const fetchedData = await OutBoundSemiFGAPI.getOutBoundSemiByID(outbsemi_id);
                    const logPayload = {
                        log_type: "OUTBOUND",
                        log_ctgy: "SEMI",
                        log_action: "UPDATED",
                        ref_id: outbsemi_id,
                        transaction_data: {
                            outbsemi_code: fetchedData.data?.outbsemi_code || "",
                            outbsemi_details: fetchedData.data?.outbsemi_details || "",
                            outbsemi_so: fetchedData.data?.outbsemi_so || "",
                            outbsemi_remark: fetchedData.data?.outbsemi_remark || "",
                            outbsemi_driver_name: fetchedData.data?.outbsemi_driver_name || "",
                            outbsemi_vehicle_license: fetchedData.data?.outbsemi_vehicle_license || "",
                            outbsemi_phone: fetchedData.data?.outbsemi_phone || "",
                            outbsemi_address: fetchedData.data?.outbsemi_address || "",
                            tspyard_name: selectedTransport ? selectedTransport.text : "", // ✅ แปลง dropdown เป็น text
                            items: selectedItems.map(item => ({
                                inbsemi_text: item.inbsemi_text, // ✅ ใช้ text แทน value
                                outbsemiitm_quantity: item.outbsemiitm_quantity,
                            })),
                        },
                    };

                    const fetchedModal = await OutBoundSemiFGAPI.getOutBoundSemiReqByID(outbsemi_id);
                    if (fetchedModal.isCompleted) {
                        setSelectedOutbSemiId(outbsemi_id);
                    }

                    console.log("📌 Transaction Log Payload:", logPayload);
                    await TransactionAPI.createLog(logPayload);
                    if (Form.outbsemi_is_returned) {
                        setPrintModalOpen(true);
                    } else {
                        setPrintShipModalOpen(true);
                    }
                } else {
                    setAlert({
                        show: true,
                        type: "error",
                        title: "แก้ไขข้อมูลไม่สำเร็จ",
                        message: response.message,
                    });
                }
            }
        } catch (error) {
            console.error("❌ เกิดข้อผิดพลาดขณะส่งข้อมูล:", error);
        }
    };




    const navigate = useNavigate();
    const handlecancel = () => {
        navigate("/outbound/outboundsemifg");
    };


    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox p={2}>
                <MDBox mt={2} ml={5}>
                    <MDTypography variant="h3" color="inherit" fontWeight="bold">
                        {mode === "add" ? "Outbound / เบิก Semi FG / สร้างใบนำส่ง" : " Outbound / เบิก Semi FG / เเก้ไขใบนำส่ง"}
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
                                    <MDBox display="flex" alignItems="center" sx={{ gap: 3 }}>
                                        <MDTypography variant="h6" color="inherit">
                                            เลขที่ใบ SO.
                                        </MDTypography>
                                        <MDInput
                                            sx={{ width: "300px", maxWidth: "100%" }}
                                            name="outbsemi_so"
                                            value={Form.outbsemi_so || ""}
                                            onChange={handleInputChange}
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
                                            onChange={handleInputChange}
                                        />
                                    </MDBox>
                                </Grid>

                                {rows.map((row, index) => (
                                    <React.Fragment key={index}>
                                        {/* Seni FG Code */}
                                        <Grid item xs={12} md={4}>
                                            <MDBox display="flex" alignItems="center" gap={1} >
                                                <MDTypography variant="h6" color="inherit"> Semi FG</MDTypography>
                                                {/* <StyledSelect
                                                    value={row.inbsemi_drop || ""}
                                                    onChange={(e) => handleDropdownChange(e, index)}
                                                    sx={{ width: "350px", maxWidth: "100%" }}
                                                >
                                                    {dropdownSemiFG.map((item) => (
                                                        <MenuItem key={item.value} value={item.value}>
                                                            {item.text}
                                                        </MenuItem>
                                                    ))}
                                                </StyledSelect> */}
                                                <StyledSelect
                                                    value={row.inbsemi_drop || ""}
                                                    onChange={(e) => handleDropdownChange(e, index)}
                                                    sx={{ width: "350px", maxWidth: "100%" }}
                                                >
                                                    {dropdownSemiFG
                                                        .filter((item) => {
                                                            // ดึงค่าที่ถูกเลือกในแถวอื่น (ยกเว้นแถวปัจจุบัน)
                                                            const selectedValues = rows
                                                                .filter((_, idx) => idx !== index)
                                                                .map((r) => r.inbsemi_drop);
                                                            // แสดงตัวเลือก ถ้ายังไม่ได้ถูกเลือกในแถวอื่น หรือเป็นค่าที่เลือกอยู่ในแถวปัจจุบัน
                                                            return !selectedValues.includes(item.value) || item.value === row.inbsemi_drop;
                                                        })
                                                        .map((item) => (
                                                            <MenuItem key={item.value} value={item.value}>
                                                                {item.text}
                                                            </MenuItem>
                                                        ))}
                                                </StyledSelect>

                                            </MDBox>
                                        </Grid>

                                        <Grid item xs={12} md={2.5}>
                                            <MDBox display="flex" alignItems="center" gap={1} >
                                                <MDTypography variant="h6" color="inherit">จำนวนในคลัง</MDTypography>
                                                <MDInput
                                                    value={row.inbsemi_quantity || ""}
                                                    sx={{ width: "125px", maxWidth: "100%" }}
                                                    disabled
                                                />
                                            </MDBox>
                                        </Grid>


                                        {/* Quantity */}
                                        <Grid item xs={12} md={2}>
                                            <MDBox display="flex" alignItems="center" gap={1} >
                                                <MDTypography variant="h6" color="inherit">จำนวน</MDTypography>
                                                <MDInput
                                                    value={row.outbsemi_quantity || ""}
                                                    onChange={(e) => handleQuantityChange(e, index)}
                                                    sx={{ width: "125px", maxWidth: "100%" }}
                                                />
                                            </MDBox>
                                        </Grid>

                                        {/* Remark */}
                                        <Grid item xs={12} md={3.5}>
                                            <MDBox display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                                <Box sx={{ minWidth: 120 }}>
                                                    <MDTypography variant="h6" color="inherit" noWrap>
                                                        จำนวนคงเหลือในคลัง
                                                    </MDTypography>
                                                </Box>
                                                <MDInput
                                                    name="quantity"
                                                    value={row.quantity || ""}
                                                    disabled
                                                    sx={{ width: "100px", maxWidth: "100%", }}
                                                />
                                                <>
                                                <Button
                                                    onClick={() => handleAddRowAtIndex(index)}
                                                    size="small"
                                                    sx={{
                                                    width: "30px",
                                                    height: "30px",
                                                    minWidth: "30px",
                                                    fontSize: "14px",
                                                    borderRadius: "50%",
                                                    padding: 0,
                                                    backgroundColor: "#1976d2",
                                                    color: "#ffffff",
                                                    "&:hover": {
                                                        backgroundColor: "#115293",
                                                    },
                                                    }}
                                                    variant="contained"
                                                >
                                                    +
                                                </Button>

                                                {rows.length > 1 && (
                                                    <Button
                                                    onClick={() => handleRemoveRow(index)}
                                                    size="small"
                                                    sx={{
                                                        width: "30px",
                                                        height: "30px",
                                                        minWidth: "30px",
                                                        fontSize: "14px",
                                                        borderRadius: "50%",
                                                        padding: 0,
                                                        backgroundColor: "#d32f2f",
                                                        color: "#ffffff",
                                                        "&:hover": {
                                                        backgroundColor: "#9a0007",
                                                        },
                                                    }}
                                                    variant="contained"
                                                    >
                                                    -
                                                    </Button>
                                                )}
                                                </>

                                            </MDBox>
                                        </Grid>
                                    </React.Fragment>
                                ))}
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
                                                onChange={handleInputChange}
                                                sx={{ width: "1175px", maxWidth: "100%" }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </MDBox>

                            <MDBox mt={8}>
                                <MDTypography variant="h5" color="warning" gutterBottom>
                                    การจัดส่ง
                                </MDTypography>
                                <MDBox display="flex" mt={10} mb={5} ml={2}>
                                    <MDTypography variant="h6" color="inherit" >
                                        ข้อมูลการจัดส่งสินค้า
                                    </MDTypography>
                                </MDBox>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} md={6} lg={6}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={4} md={3} >
                                                <MDBox display="flex" alignItems="center" justifyContent="center" height="100%">
                                                    <MDTypography variant="h6" color="inherit">
                                                        ชื่อผู้ขับ
                                                    </MDTypography>
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12} sm={8} md={9} >
                                                <MDInput
                                                    name="outbsemi_driver_name"
                                                    value={Form.outbsemi_driver_name}
                                                    onChange={handleInputChange}
                                                    sx={{ width: "400px", maxWidth: "100%" }}
                                                    disabled={Form.outbsemi_is_returned}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={4} md={3} >
                                                <MDBox display="flex" alignItems="center" justifyContent="center" height="100%">
                                                    <MDTypography variant="h6" color="inherit">
                                                        ชื่อท่ารถ
                                                    </MDTypography>
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12} sm={8} md={9} >
                                                <StyledSelect
                                                    value={Form.tspyard_name || ""}
                                                    onChange={handleTransportDropdownChange}
                                                    sx={{ width: "400px", maxWidth: "100%", hight: "45px" }}
                                                    disabled={Form.outbsemi_is_returned}
                                                >
                                                    {dropdownTransport.map((item) => (
                                                        <MenuItem key={item.value} value={item.value}>
                                                            {item.text}
                                                        </MenuItem>
                                                    ))}
                                                </StyledSelect>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={6} lg={6}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={4} md={3} >
                                                <MDBox display="flex" alignItems="center" justifyContent="center" height="100%">
                                                    <MDTypography variant="h6" color="inherit">
                                                        ทะเบียนรถ
                                                    </MDTypography>
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12} sm={8} md={9} >
                                                <MDInput
                                                    name="outbsemi_vehicle_license"
                                                    value={Form.outbsemi_vehicle_license}
                                                    onChange={handleInputChange}
                                                    sx={{ width: "400px", maxWidth: "100%" }}
                                                    disabled={Form.outbsemi_is_returned}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4} md={3} >
                                                <MDBox display="flex" alignItems="center" justifyContent="center" height="100%">
                                                    <MDTypography variant="h6" color="inherit">
                                                        เบอร์ติดต่อ
                                                    </MDTypography>
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12} sm={8} md={9} >
                                                <MDInput
                                                    name="outbsemi_phone"
                                                    value={Form.outbsemi_phone}
                                                    onChange={handleInputChange}
                                                    sx={{ width: "400px", maxWidth: "100%" }}
                                                    disabled={Form.outbsemi_is_returned}
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
                                                    onChange={handleInputChange}
                                                    sx={{ width: "1125px", maxWidth: "100%" }}
                                                    disabled={Form.outbsemi_is_returned}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container spacing={3}>

                                            <Grid item xs={12} sm={2.5} md={1.5}>
                                                <MDBox display="flex" alignItems="center" justifyContent="center">
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={Form.outbsemi_is_returned}
                                                                onChange={handleCheckboxChange}
                                                            />
                                                        }
                                                    />
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12} sm={10.5} md={10.5}>
                                                <MDBox display="flex" alignItems="center" justifyContent="flex-start" height="100%">
                                                    <MDTypography variant="h6" color="inherit">
                                                        นำกลับหรือไม่
                                                    </MDTypography>
                                                </MDBox>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                                    <ButtonComponent type="cancelcolor" onClick={handlecancel} />
                                    <ButtonComponent type={mode === "add" ? "Document" : "confirmedit"} onClick={handleSubmit} />
                                </Box>
                            </MDBox>

                        </MDBox>
                    </Card>
                </MDBox>
            </MDBox>


            {/* Modal สำหรับ PrintSemiFgWDComponent เมื่อ checkbox ถูกติ๊ก */}
            <PrintSemiFgWDComponent
                open={printModalOpen}
                onClose={handleModalClose}
                outbsemi_id={selectedOutbSemiId}
                outbsemi_is_returned={1}
            />

            {/* Modal สำหรับ PrintSemiShipComponent เมื่อ checkbox ไม่ถูกติ๊ก */}
            <PrintSemiShipComponent
                open={printShipModalOpen}
                onClose={handleModalClose}
                outbsemi_id={selectedOutbSemiId}
                outbsemi_is_returned={0}
            />


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

export default OutboundSemiCreate;



