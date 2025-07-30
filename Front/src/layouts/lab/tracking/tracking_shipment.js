

import React, { useState, useEffect } from "react";
import { Box, Grid, Card, Divider, FormControlLabel, Checkbox, MenuItem } from "@mui/material";
import { StyledSelect } from "common/Global.style";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import BOMAPI from "api/BOMAPI";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import DynamicTableComponent from "../components/dynamic_table";
import OutBoundFGAPI from "api/OutBoundFgAPI";
import DropDownAPI from "api/DropDownAPI";
import InBoundFGAPI from "api/InBoundFgAPI";
import SweetAlertComponent from "../components/sweetAlert";
// import { GlobalVar } from "common/GlobalVar";

const TrackingShipment = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const outbfg_id = params.get("outbfg_id");
    console.log("outbfg_id", outbfg_id);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [Form, setForm] = useState({
        outbfg_so: "",
        outbfg_code: "",// ค่าเริ่มต้นของเลขที่ใบเบิก
        outbfg_details: "", // ค่าเริ่มต้นของรายละเอียด
        bom_jobnb: "",
        outbfg_priority: "",
        outbfg_is_shipment: "", // SELF_PICKUP หรือ DELIVERY
        outbfg_driver_name: "",
        outbfg_vehicle_license: "",
        outbfg_phone: "",
        outbfg_address: "",
        tspyard_id: "",
        sup_id: "",
        dockyard_id: "",
        formatted_date: "",
        so_id: "",
        outbfg_remark: ""
    });

    const [rows, setRows] = useState([
        {
            bom_jobnb: "",
            bom_id: "",
            inbfg_id: "",
            outbfg_item_quantity: "",
            showJobNo: true,
            showTable: false,
            tableData: [],
        },
    ]);
    const [alert, setAlert] = useState({
        show: false,
        type: "success",
        title: "",
        message: "",
    });
    // const [selectedRows, setSelectedRows] = useState([]); // เพิ่ม state สำหรับ selectedRows
    const [mode, setMode] = useState("add"); // ตัวแปรเพื่อจัดการโหมด add/edit
    const [dropdownFG, setDropdownFG] = useState([]);
    const [dropdownSO, setDropdownSO] = useState([]);
    const [dropdownBOM, setDropdownBOM] = useState([]);
    const [dropdownTransport, setDropDownTransport] = useState([]);
    const [isBomUsed, setIsBomUsed] = useState(true); // ตั้งค่าเริ่มต้นเป็น true (ระบุ Job No.)
    const [manualRows, setManualRows] = useState([
        {
            selectedFG: "",
            fgName: "",
            fgStock: "",
            quantity: 0,
            remaining: 0,
        }
    ]);








    useEffect(() => {
        // ตรวจสอบว่า employeeId มีค่าอยู่หรือไม่
        if (outbfg_id) {
            setMode("edit"); // หากมี employeeId ให้ตั้งค่าโหมดเป็น 'edit'
        } else {
            setMode("add"); // หากไม่มี employeeId ให้ตั้งค่าโหมดเป็น 'create'
        }
    }, [outbfg_id]);




    // ฟังก์ชันจัดการการเปลี่ยนค่าใน manualRows
    const handleManualInputChange = (index, field, value) => {
        const updatedRows = [...manualRows];
        updatedRows[index][field] = value;

        // คำนวณค่า remaining
        if (field === "quantity") {
            const fgStock = updatedRows[index].fgStock || 0;
            updatedRows[index].remaining = fgStock - value;
        }

        setManualRows(updatedRows);

        // ถ้าเลือก FG ให้ดึงข้อมูลรายละเอียดเพิ่มเติม
        if (field === "selectedFG") {
            fetchFGDetails(index, value);
        }
    };



    const fetchFGDetails = async (index, inbfg_id) => {
        try {
            const response = await InBoundFGAPI.getInBoundFgByID(inbfg_id);
            if (response.isCompleted && response.data) {
                const fgData = response.data;

                // อัปเดตข้อมูลใน manualRows
                setManualRows((prevRows) => {
                    const updatedRows = [...prevRows];
                    updatedRows[index] = {
                        ...updatedRows[index],
                        fgName: fgData.inbfg_name || "",
                        fgStock: fgData.inbfg_quantity || 0,
                        remaining: fgData.inbfg_quantity || 0,
                    };
                    return updatedRows;
                });
            } else {
                console.error("Error fetching FG details:", response.message);
            }
        } catch (error) {
            console.error("Error fetching FG details:", error);
        }
    };

    const fetchDropdownFG = async () => {
        try {
            const response = await DropDownAPI.getInboundFGDropdown();
            if (response.isCompleted && response.data.length > 0) {
                setDropdownFG(response.data);
            } else {
                console.error("Error fetching FG dropdown:", response.message);
            }
        } catch (error) {
            console.error("Error fetching FG dropdown:", error);
        }
    };

    useEffect(() => {
        fetchDropdownFG(); // ดึงข้อมูล FG เมื่อโหลดหน้า
    }, []);

    const fetchDropdownSoNum = async () => {
        try {
            const response = await DropDownAPI.getSoNumberDropdown();
            if (response.isCompleted && response.data.length > 0) {
                setDropdownSO(response.data);
            } else {
                console.error("Error fetching FG dropdown:", response.message);
            }
        } catch (error) {
            console.error("Error fetching FG dropdown:", error);
        }
    };

    useEffect(() => {
        fetchDropdownSoNum(); // ดึงข้อมูล FG เมื่อโหลดหน้า
    }, []);

    const fetchDropdownBOM = async (so_id) => {
        try {
            if (!so_id) {
                setDropdownBOM([]); // ล้างค่า BOM หากไม่มี SO
                return;
            }

            const response = await DropDownAPI.getBomNumDropdown(so_id);
            if (response.isCompleted && response.data.length > 0) {
                setDropdownBOM(response.data);
            } else {
                console.error("Error fetching BOM dropdown:", response.message);
                setDropdownBOM([]);
            }
        } catch (error) {
            console.error("Error fetching BOM dropdown:", error);
            setDropdownBOM([]);
        }
    };

    // เรียกใช้ fetchDropdownBOM เมื่อ so_id เปลี่ยนแปลง
    useEffect(() => {
        fetchDropdownBOM(Form.so_id);
    }, [Form.so_id]);



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





    // ฟังก์ชันเพื่อเรียก API และตั้งค่าฟอร์มและแถวข้อมูล
    const fetchOutBoundFGBaseData = async (id) => {
        try {
            const response = await OutBoundFGAPI.getOutBoundFGByID(id);
            console.log("📌 Fetched Base Data:", response);

            if (response.isCompleted && response.data) {
                const data = response.data;

                // ตั้งค่าฟอร์มพื้นฐาน
                setForm({
                    outbfg_code: data.outbfg_code || "",
                    outbfg_so: data.outbfg_so || "",
                    outbfg_details: data.outbfg_details || "",
                    outbfg_priority: data.outbfg_priority || "",
                    outbfg_is_shipment: data.outbfg_is_shipment || false,
                    outbfg_driver_name: data.outbfg_driver_name || "",
                    outbfg_vehicle_license: data.outbfg_vehicle_license || "",
                    outbfg_phone: data.outbfg_phone || "",
                    outbfg_address: data.outbfg_address || "",
                    tspyard_id: data.tspyard_id || null,
                    sup_id: data.sup_id || "",
                    dockyard_id: data.dockyard_id || "",
                    so_id: data.so_id || null,
                    outbfg_remark: data.outbfg_remark || "",
                });

                if (data.outbfg_is_bom_used) {
                    setIsBomUsed(true);
                    // สร้าง base rows โดยแยกเอาเฉพาะ bom_number (เก็บใน bom_jobnb) และเก็บข้อมูลต้นฉบับไว้
                    const baseRows = data.items.map((item) => ({
                        bom_jobnb: item.bom_number || "",
                        bom_id: item.bom_id || "",
                        originalItem: { ...item }, // clone object
                        showTable: false,
                        showJobNo: true,
                        tableData: [],
                        // เพิ่มฟิลด์นี้เพื่อเก็บ ID ที่ถูกเลือกใน row นี้
                        selectedBomIds: [],
                    }));

                    setRows(baseRows);

                    console.log("Rows: ", baseRows);

                    setForm((prevForm) => ({
                        ...prevForm,
                        so_id: data.so_id || null, // ตรวจสอบให้แน่ใจว่า so_id มีค่า
                    }));
                    // สำหรับแต่ละ row ให้เรียก handleInputChange เพื่อดึงข้อมูล BOM ผ่าน getByBOM
                    baseRows.forEach((row, index) => {
                        if (row.bom_jobnb && data.so_id) {
                            handleInputChange(index, "bom_jobnb", row.bom_jobnb);
                        }
                    });
                } else {
                    setIsBomUsed(false);
                    const manualRowsData = data.items.map((item) => ({
                        selectedFG: item.inbfg_id || "",
                        fgName: item.fgifm_name || "",
                        fgStock: item.inbfg_quantity || 0,
                        quantity: item.outbfgitm_quantity || 0,
                        remaining: Math.max(0, item.inbfg_quantity - item.outbfgitm_quantity),
                    }));
                    setManualRows(manualRowsData);
                }
            }
        } catch (error) {
            console.error("❌ Error fetching Outbound FG Base Data:", error);
        } finally {
            setLoading(false);
        }
    };







    useEffect(() => {
        if (mode === "edit" && Form.so_id && rows.length > 0 && !initialized) {
            rows.forEach((row, index) => {
                if (row.bom_jobnb) {
                    handleInputChange(index, "bom_jobnb", row.bom_jobnb);
                }
            });
            setInitialized(true);
        }
    }, [rows, Form.so_id, mode, initialized]);




    // เรียก fetchOutBoundFGByID เมื่อโหลดหน้า
    useEffect(() => {
        if (outbfg_id && !initialized) {
            fetchOutBoundFGBaseData(outbfg_id);

        }
    }, [outbfg_id, initialized]);




    //  แก้ไขให้แต่ละแถวมี BOM แยกกัน
    const handleInputChange = async (index, field, value) => {
        setRows((prevRows) => {
            if (index < 0 || index >= prevRows.length) return prevRows;

            const updatedRows = [...prevRows];
            const targetRow = updatedRows[index];

            targetRow[field] = value;
            console.log(`Field Changed: ${field}, Value: ${value}`);

            if (field === "bom_jobnb") {
                targetRow.showTable = !!value.trim();

                if (value.trim() !== "" && Form.so_id) {
                    const so_id = dropdownSO.find((item) => item.value === Form.so_id)?.value || Form.so_id;
                    const bom_number = value.trim();

                    console.log("Final API Call with:", { so_id, bom_number });

                    try {
                        BOMAPI.getByBOM(so_id, String(bom_number)).then((response) => {
                            console.log("API Response from getByBOM:", response);

                            if (response?.data?.length > 0) {
                                console.log(`Row ${index} - API Response has data length:`, response.data.length);

                                const fetchedTableData = response.data;
                                console.log(`Row ${index} - Fetched Table Data:`, fetchedTableData);

                                // Log originalItem ของ row ปัจจุบัน
                                console.log(`Row ${index} - Original Item:`, targetRow.originalItem);

                                // ดึง inbfg_id จากข้อมูล originalItem ของ row นี้
                                const outboundFGInbfgIds = targetRow.originalItem?.inbfg_ids?.map(item => item.inbfg_id) || [];
                                console.log(`Row ${index} - Outbound FG Inbfg Ids:`, outboundFGInbfgIds);

                                // รวมข้อมูลและตรวจสอบ isChecked สำหรับ row นี้
                                const mergedTableData = fetchedTableData.map((fetchedItem) => {
                                    const isChecked = outboundFGInbfgIds.includes(fetchedItem.inbfg_id);
                                    const outbfg_item_quantity = targetRow.originalItem?.inbfg_ids?.find(item => item.inbfg_id === fetchedItem.inbfg_id)?.outbfgitm_quantity || 0;
                                    const remaining = fetchedItem.inbfg_quantity;

                                    return {
                                        ...fetchedItem,
                                        isChecked,
                                        outbfg_item_quantity,
                                        remaining,
                                    };
                                });
                                console.log(`Row ${index} - Merged Table Data:`, mergedTableData);

                                targetRow.tableData = mergedTableData;
                                targetRow.showTable = true;
                                setRows([...updatedRows]);

                                // กำหนด selectedRows สำหรับ row นี้
                                const preselectedBomIds = mergedTableData
                                    .filter(item => item.isChecked)
                                    .map(item => item.inbfg_id);
                                console.log(`Row ${index} - Preselected BOM Ids:`, preselectedBomIds);


                                targetRow.selectedBomIds = preselectedBomIds; // เก็บใน row ตัวปัจจุบันแทน
                                setRows([...updatedRows]);


                            } else {
                                console.warn("No BOM Data Found");
                                targetRow.showTable = false;
                                targetRow.tableData = [];
                                setRows([...updatedRows]);
                            }
                        });
                    } catch (error) {
                        console.error("Error fetching BOM data:", error);
                        targetRow.showTable = false;
                        targetRow.tableData = [];
                        setRows([...updatedRows]);
                    }
                } else {
                    console.warn("Empty BOM Number or missing so_id");
                    targetRow.showTable = false;
                    targetRow.tableData = [];
                    setRows([...updatedRows]);
                }
            }
            return updatedRows;
        });
    };













    const handleShipmentChange = (isChecked) => {
        setForm((prevForm) => ({
            ...prevForm,
            outbfg_is_shipment: isChecked ? true : false, // ✅ กำหนดเป็น true หรือ false
            ...(isChecked === false && { // ถ้าเป็น false (SELF_PICKUP) ให้ล้างข้อมูลที่เกี่ยวข้อง
                outbfg_driver_name: "",
                outbfg_vehicle_license: "",
                outbfg_phone: "",
                outbfg_address: "",
                tspyard_id: null, // ✅ ปรับเป็น null เพื่อไม่ให้ API แจ้งเตือน

            }),
        }));
    };



    const tableColumns = [
        { field: "inbfg_code", label: "รหัส" },
        { field: "fgifm_name", label: "ชื่อ" },
        { field: "inbfg_quantity", label: "จำนวนภายในคลัง" },
        {
            field: "outbfg_item_quantity",
            label: "จำนวนจัดส่ง",
            render: (row, onChange) => (
                <MDInput
                    type="number"
                    value={row.outbfg_item_quantity}
                    onChange={(e) => onChange(e.target.value)}
                    fullWidth
                    inputProps={{ min: 0, max: row.inbfg_quantity }}
                    disabled
                />
            ),
        },
        {
            field: "remaining",
            label: "คงเหลือ",
            render: (row) => {
                const remaining = row.remaining >= 0 ? row.remaining : 0;
                return (
                    <MDTypography
                        variant="body02"
                        color={remaining >= 0 ? "inherit" : "error"} // Highlight in red if remaining is negative
                    >
                        {remaining}
                    </MDTypography>
                );
            },
        },
    ];

    // ฟังก์ชัน handleRowChange เพื่อรับค่าที่อัปเดตจาก DynamicTableComponent
    const handleRowChange = (rowIndex, updatedRow, field, value) => {
        setRows((prevRows) => {
            const updatedRows = [...prevRows]; // สร้างสำเนาใหม่ของ rows
            updatedRows[rowIndex].tableData = updatedRows[rowIndex].tableData.map((tableRow) => {
                if (tableRow.inbfg_id === updatedRow.inbfg_id) {
                    const newOutbfgItemQuantity = value;
                    const newRemaining = tableRow.inbfg_quantity - newOutbfgItemQuantity;
                    return {
                        ...tableRow,
                        outbfg_item_quantity: newOutbfgItemQuantity,
                        remaining: newRemaining >= 0 ? newRemaining : 0,
                    };
                }
                return tableRow;
            });
            return updatedRows;
        });
    };



    // ฟังก์ชัน handleRowSelectionChange
    const handleRowSelectionChange = (inbfg_id, rowIndex) => {
        setRows((prevRows) =>
            prevRows.map((row, index) => {
                if (index === rowIndex) {
                    // toggle isChecked เฉพาะ row นี้
                    const updatedTableData = row.tableData.map((item) => {
                        if (item.inbfg_id === inbfg_id) {
                            return { ...item, isChecked: !item.isChecked };
                        }
                        return item;
                    });

                    // คำนวณค่า selectedBomIds ใหม่
                    const selectedBomIds = updatedTableData
                        .filter((item) => item.isChecked)
                        .map((item) => item.inbfg_id);

                    return {
                        ...row,
                        tableData: updatedTableData,
                        selectedBomIds, // เก็บไว้ใน row นี้เท่านั้น
                    };
                }
                return row;
            })
        );
    };

















    //สำหรับ Dropdown ท่ารถเลือก
    const handleDropTpyardChange = (event) => {
        const { value } = event.target;
        setForm((prevForm) => ({
            ...prevForm,
            tspyard_id: value

        }));
        setForm((prevForm) => ({
            ...prevForm,

            sup_id: value
        }));
    };


    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === "outbfg_phone") {
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



    const navigate = useNavigate();
    const handlecancel = () => {
        navigate("/track");
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox p={2}>
                <MDBox mt={2} ml={5}>
                    <MDTypography variant="h3" color="inherit" fontWeight="bold">
                        ติดตามการขนส่ง / รายละเอียดใบนำส่ง
                    </MDTypography>
                </MDBox>

                <MDBox mt={5} >
                    <Card>
                        <MDBox m={3} p={5} sx={{ pointerEvents: "none" }}>
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
                                <Grid item xs={12} md={4}>
                                    <MDBox display="flex" alignItems="center" sx={{ gap: 2 }}>
                                        <MDTypography variant="h6" color="inherit">
                                            เลขที่ใบเบิก
                                        </MDTypography>
                                        <MDInput
                                            sx={{ width: "200px", maxWidth: "100%" }}
                                            name="outbfg_code"
                                            value={Form.outbfg_code || ""}
                                            disabled
                                        />
                                    </MDBox>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <MDBox display="flex" alignItems="center" sx={{ gap: 2 }}>
                                        <MDTypography variant="h6" color="inherit">
                                            เลขที่ใบ SO.
                                        </MDTypography>
                                        <MDInput
                                            sx={{ width: "300px", maxWidth: "100%" }}
                                            name="outbfg_so"
                                            value={Form.outbfg_so || ""}
                                            onChange={(e) => setForm((prev) => ({ ...prev, outbfg_so: e.target.value }))}
                                            disabled
                                        />
                                    </MDBox>
                                </Grid>


                                <Grid item xs={12} md={4} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={isBomUsed}
                                                onChange={() => setIsBomUsed(true)}
                                                color="primary"
                                            />
                                        }
                                        label="ระบุ BOM"
                                    />

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={!isBomUsed}
                                                onChange={() => setIsBomUsed(false)}
                                                color="primary"
                                            />
                                        }
                                        label="ไม่ระบุ BOM"
                                    />
                                </Grid>




                                <Grid item xs={12} md={12}>
                                    <MDBox display="flex" alignItems="center" sx={{ gap: 2 }}>
                                        <MDTypography variant="h6" color="inherit">
                                            รายละเอียด
                                        </MDTypography>
                                        <MDInput
                                            sx={{ width: "1300px", maxWidth: "100%" }}
                                            name="outbfg_details"
                                            value={Form.outbfg_details || ""}
                                            onChange={(e) => setForm((prev) => ({ ...prev, outbfg_details: e.target.value }))}
                                            disabled
                                        />
                                    </MDBox>
                                </Grid>
                                {isBomUsed && (
                                    <Grid item xs={12} >
                                        <MDBox display="flex" alignItems="center" sx={{ gap: 2 }}>
                                            <MDTypography variant="h6" color="inherit">
                                                เลขที่ SO.
                                            </MDTypography>
                                            <StyledSelect
                                                name="so_id"
                                                value={Form.so_id || ""}
                                                onChange={(e) => {
                                                    const selectedSO = e.target.value;
                                                    console.log("SO Selected:", selectedSO); // ตรวจสอบค่าที่เลือก
                                                    setForm((prev) => ({ ...prev, so_id: selectedSO }));
                                                    if (selectedSO) {
                                                        fetchDropdownBOM(selectedSO); // เรียก API โหลด BOM ใหม่
                                                    }
                                                }}
                                                placeholder="ระบุเลขที่ SO."
                                                sx={{ width: "150px", maxWidth: "100%", height: "45px" }}
                                            >
                                                {dropdownSO.map((item) => (
                                                    <MenuItem key={item.value} value={item.value}>
                                                        {item.text}
                                                    </MenuItem>
                                                ))}
                                            </StyledSelect>
                                        </MDBox>
                                    </Grid>
                                )}



                                {isBomUsed ? (
                                    // กรณีเลือก "ระบุ Job No."
                                    rows.map((row, index) => (
                                        <React.Fragment key={index}>
                                            <Grid container spacing={2} alignItems="center" sx={{ mt: 3 }}>
                                                {/* Column for BOM Dropdown */}
                                                <Grid item xs={3}>
                                                    <MDBox display="flex" alignItems="center" gap={2}>
                                                        {row.showJobNo ? (
                                                            <>
                                                                <MDTypography variant="h6" color="inherit">BOM</MDTypography>
                                                                <StyledSelect
                                                                    name="bom_jobnb"
                                                                    value={row.bom_jobnb || ""}
                                                                    onChange={(e) => {
                                                                        handleInputChange(index, "bom_jobnb", e.target.value);
                                                                        setForm((prev) => ({ ...prev, bom_jobnb: e.target.value })); // อัปเดต Form
                                                                    }}
                                                                    placeholder="เลือก BOM"
                                                                    sx={{ width: "150px", maxWidth: "100%", height: "45px" }}
                                                                    disabled={!Form.so_id} // ปิดใช้งานหากไม่มี SO
                                                                >
                                                                    {/* {dropdownBOM.map((item) => (
                                                                        <MenuItem key={item.value} value={item.value}>
                                                                            {item.text}
                                                                        </MenuItem>
                                                                    ))} */}
                                                                    {dropdownBOM
                                                                        .filter((bomItem) => {
                                                                            // เช็คว่ามีแถวอื่นเลือก bom นี้ไปแล้วหรือยัง
                                                                            const isUsedInOtherRow = rows.some((r, i) => i !== index && r.bom_jobnb === bomItem.value);
                                                                            // ถ้าเป็นของ row อื่นแล้ว และไม่ใช่ bom_jobnb ของแถวนี้ -> ซ่อน
                                                                            if (isUsedInOtherRow && bomItem.value !== row.bom_jobnb) {
                                                                                return false;
                                                                            }
                                                                            return true;
                                                                        })
                                                                        .map((bomItem) => (
                                                                            <MenuItem key={bomItem.value} value={bomItem.value}>
                                                                                {bomItem.text}
                                                                            </MenuItem>
                                                                        ))}
                                                                </StyledSelect>
                                                            </>
                                                        ) : (
                                                            <Box sx={{ visibility: "hidden", width: "100%" }}>
                                                                <MDTypography variant="h6" color="inherit">Job No.</MDTypography>
                                                                <MDInput fullWidth />
                                                            </Box>
                                                        )}

                                                    </MDBox>
                                                </Grid>

                                                {/* Column for DynamicTableComponent */}
                                                {row.showTable && (
                                                    <Grid item xs={9}>
                                                        <MDBox sx={{ pointerEvents: "auto" }}>
                                                            <MDTypography variant="h6" fontWeight="bold" gutterBottom>
                                                                BOM : {row.bom_jobnb}
                                                            </MDTypography>
                                                            <DynamicTableComponent
                                                                columns={tableColumns}
                                                                data={row.tableData}
                                                                onRowSelectionChange={(inbfg_id) => handleRowSelectionChange(inbfg_id, index)}
                                                                onRowChange={(updatedRow, field, value) => handleRowChange(index, updatedRow, field, value)}
                                                                preselectedRows={row.selectedBomIds || []}
                                                                hideSelectColumn={true}
                                                            />

                                                        </MDBox>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </React.Fragment>

                                    ))
                                ) : (
                                    // กรณีเลือก "ไม่ระบุ Job No."
                                    manualRows.map((row, index) => (
                                        <Grid container spacing={2} key={index} sx={{ mt: 3 }}>
                                            <Grid item xs={12} md={3.5}>
                                                <MDBox
                                                    display="flex"
                                                    flexDirection={{ xs: "column", md: "row" }}
                                                    alignItems={{ xs: "flex-start", md: "center" }}
                                                    gap={2}
                                                >
                                                    <MDTypography
                                                        variant="h6"
                                                        color="inherit"
                                                        sx={{ fontSize: 12 }}
                                                    >
                                                        รหัส FG
                                                    </MDTypography>
                                                    <StyledSelect
                                                        value={row.selectedFG}
                                                        onChange={(e) =>
                                                            handleManualInputChange(index, "selectedFG", e.target.value)
                                                        }
                                                        sx={{
                                                            width: { xs: "100%", md: "200px" }, maxWidth: "100%",
                                                            "& .MuiInputBase-input": { fontSize: 12 }
                                                        }}
                                                    >
                                                        {dropdownFG
                                                            .filter((item) => {
                                                                const selectedInOtherRows = manualRows
                                                                    .filter((_, idx) => idx !== index)
                                                                    .map((r) => r.selectedFG);
                                                                return (
                                                                    !selectedInOtherRows.includes(item.value) ||
                                                                    item.value === row.selectedFG
                                                                );
                                                            })
                                                            .map((item) => (
                                                                <MenuItem key={item.value} value={item.value}>
                                                                    {item.text}
                                                                </MenuItem>
                                                            ))}
                                                    </StyledSelect>
                                                </MDBox>
                                            </Grid>

                                            <Grid item xs={12} md={3}>
                                                <MDBox
                                                    display="flex"
                                                    flexDirection={{ xs: "column", md: "row" }}
                                                    alignItems={{ xs: "flex-start", md: "center" }}
                                                    gap={1}
                                                >
                                                    <MDTypography
                                                        variant="h6"
                                                        color="inherit"
                                                        sx={{ fontSize: 12 }}
                                                    >
                                                        จำนวนในคลัง
                                                    </MDTypography>
                                                    <MDInput
                                                        value={row.fgStock}
                                                        disabled
                                                        sx={{
                                                            width: { xs: "100%", md: "95px" },
                                                            maxWidth: "100%",
                                                            "& .MuiInputBase-input": { fontSize: 12 }
                                                        }}
                                                    />
                                                </MDBox>
                                            </Grid>

                                            <Grid item xs={12} md={2.5}>
                                                <MDBox
                                                    display="flex"
                                                    flexDirection={{ xs: "column", md: "row" }}
                                                    alignItems={{ xs: "flex-start", md: "center" }}
                                                    gap={1}
                                                >
                                                    <MDTypography
                                                        variant="h6"
                                                        color="inherit"
                                                        sx={{ fontSize: 12 }}
                                                    >
                                                        จำนวน
                                                    </MDTypography>
                                                    <MDInput
                                                        type="number"
                                                        value={row.quantity}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            handleManualInputChange(
                                                                index,
                                                                "quantity",
                                                                value === "" ? "" : Math.max(0, Number(value))
                                                            );
                                                        }}
                                                        disabled
                                                        sx={{
                                                            width: { xs: "100%", md: "75px" },
                                                            maxWidth: "100%",
                                                            "& .MuiInputBase-input": { fontSize: 12 },
                                                        }}
                                                    />
                                                </MDBox>
                                            </Grid>

                                            <Grid item xs={12} md={3}>
                                                <MDBox
                                                    display="flex"
                                                    flexDirection={{ xs: "column", md: "row" }}
                                                    alignItems={{ xs: "flex-start", md: "center" }}
                                                    gap={1}
                                                >
                                                    <MDTypography
                                                        variant="h6"
                                                        color="inherit"
                                                        sx={{ fontSize: 12 }}
                                                    >
                                                        จำนวนคงเหลือ
                                                    </MDTypography>
                                                    <MDInput
                                                        value={row.remaining}
                                                        disabled
                                                        sx={{
                                                            width: { xs: "100%", md: "95px" },
                                                            maxWidth: "100%",
                                                            "& .MuiInputBase-input": { fontSize: 12 },
                                                        }}
                                                    />
                                                </MDBox>
                                            </Grid>
                                        </Grid>
                                    ))


                                )}
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






                            <MDBox mt={5}>
                                <Grid item xs={12}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={3} md={2}>
                                            <MDBox display="flex" alignItems="center" justifyContent="center" height="100%">
                                                <MDTypography variant="h5" color="warning">
                                                    หมายเหตุ
                                                </MDTypography>
                                            </MDBox>
                                        </Grid>
                                        <Grid item xs={12} sm={9} md={10}>
                                            <MDInput
                                                name="outbfg_remark"
                                                value={Form.outbfg_remark}
                                                onChange={handleChange}
                                                sx={{ width: "1175px", maxWidth: "100%" }}
                                                disabled
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </MDBox>


                            <MDBox mt={10}>
                                <MDTypography variant="h4" color="warning" gutterBottom>
                                    การจัดส่ง
                                </MDTypography>
                                <MDBox display="flex" justifyContent="flex-start" mt={4} mb={4} ml={5} gap={10}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={!Form.outbfg_is_shipment}
                                                onChange={() => handleShipmentChange(false)}
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
                                                checked={Form.outbfg_is_shipment}
                                                onChange={() => handleShipmentChange(true)}
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
                                                    name="outbfg_driver_name"
                                                    value={Form.outbfg_driver_name}
                                                    onChange={handleChange}
                                                    sx={{ width: "400px", maxWidth: "100%" }}
                                                    disabled
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
                                                    name="tspyard_id"
                                                    value={Form.tspyard_id || ""}
                                                    onChange={handleDropTpyardChange}
                                                    sx={{ width: "400px", maxWidth: "100%", hight: "45px" }}
                                                    disabled
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
                                                    name="outbfg_vehicle_license"
                                                    value={Form.outbfg_vehicle_license}
                                                    onChange={handleChange}
                                                    sx={{ width: "400px", maxWidth: "100%" }}
                                                    disabled
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
                                                    name="outbfg_phone"
                                                    value={Form.outbfg_phone}
                                                    onChange={handleChange}
                                                    sx={{ width: "400px", maxWidth: "100%" }}
                                                    disabled
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
                                                    onChange={handleChange}
                                                    sx={{ width: "1125px", maxWidth: "100%" }}
                                                    disabled
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box mt={5} display="flex" justifyContent="flex-end" gap={2} sx={{ pointerEvents: "auto" }}>
                                            <ButtonComponent type="return" onClick={handlecancel} />
                                        </Box>
                                    </Grid>


                                </Grid>
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

export default TrackingShipment;