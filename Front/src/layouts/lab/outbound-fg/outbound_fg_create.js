
import React, { useState, useEffect } from "react";
import { Box, Grid, Card, Button, Divider, FormControlLabel, Checkbox, MenuItem } from "@mui/material";
import { StyledSelect } from "common/Global.style";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import BOMAPI from "api/BOMAPI";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import DynamicTableComponent from "../components/dynamic_table";
import OutBoundFGAPI from "api/OutBoundFgAPI";
import DropDownAPI from "api/DropDownAPI";
import PrintWayBillComponent from "../components/outbound_fg_waybill";
import PrintFgBillComponent from "../components/outbound_fg_bill";
import PrintModalAllComponent from "../components/outbound_fg_billall";
import InBoundFGAPI from "api/InBoundFgAPI";
// import { GlobalVar } from "common/GlobalVar";
import TransactionAPI from "api/TransactionLogAPI";

const OutboundFgCreate = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const outbfg_id = params.get("outbfg_id");
    console.log("outbfg_id", outbfg_id);
    const [showPrintModal, setShowPrintModal] = useState(false);
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
    const [printModalData, setPrintModalData] = useState(null);
    const [showPrintFgModal, setShowPrintFgModal] = useState(false);
    const [showPrintFgModalAll, setShowPrintFgModalAll] = useState(false);
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
    // เพิ่ม state สำหรับเก็บค่าจาก checkbox ของ "พิมพ์ใบเบิก" และ "พิมพ์ใบนำส่ง"
    const [printFgChecked, setPrintFgChecked] = useState(false);
    const [printWayBillChecked, setPrintWayBillChecked] = useState(false);


    const handleModalClose = () => {
        setPrintModalData(false); // ปิด Modal
        setShowPrintFgModal(false); // ปิด Modal
        setShowPrintFgModalAll(false); // ปิด Modal
        navigate("/outbound/outboundfg");
    };



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









    // ✅ เพิ่มแถวใหม่โดยไม่เชื่อมกับ BOM เดิม
  const handleAddRowWithJobNo = (index) => {
    setRows((prevRows) => {
        const newRow = {
            bom_jobnb: "",
            bom_id: "",
            outbfg_item_quantity: "",
            showJobNo: true,
            showTable: false,
            tableData: [],
        };

        const updatedRows = [...prevRows];
        updatedRows.splice(index + 1, 0, newRow); // 👉 แทรกแถวใหม่ถัดจาก index
        return updatedRows;
    });
};

 

   const handleAddManualRow = (index) => {
    setManualRows((prevRows) => {
        const newRow = {
            selectedFG: "",
            fgName: "",
            fgStock: "",
            quantity: 0,
            remaining: 0,
        };
        const updatedRows = [...prevRows];
        updatedRows.splice(index + 1, 0, newRow); // แทรกแถวใหม่หลังแถวปัจจุบัน
        return updatedRows;
    });
};


    // const handleRemoveRow = (index) => {
    //     setRows((prevRows) => prevRows.filter((_, i) => i !== index));
    //   };

    const handleRemoveRow = (index) => {
        if (rows.length === 1) {
            console.log("❌ Cannot remove the last remaining row");
            return;
        }
        setRows((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveManualRow = (index) => {
        if (manualRows.index === 1) {
            console.log("❌ Cannot remove the last remaining row");
            return;
        }
    setManualRows((prev) => prev.filter((_, i) => i !== index));
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
  render: (row, onChange, isChecked) => (
    <MDInput
      type="text"
      value={
        row.outbfg_item_quantity === undefined || row.outbfg_item_quantity === 0
          ? ""
          : String(row.outbfg_item_quantity)
      }
      onFocus={() => {
        // ไม่ทำอะไร — ไม่ต้องลบ 0 เพราะไม่ได้แสดง 0 ตั้งแต่แรก
      }}
      onBlur={(e) => {
        const val = e.target.value.trim();
        if (val === "" || isNaN(Number(val))) {
          onChange(0); // ใส่ 0 กลับเข้า state (แต่ไม่แสดง)
        } else {
          onChange(Number(val));
        }
      }}
      onChange={(e) => {
        const val = e.target.value;
        if (/^\d*$/.test(val)) {
          onChange(val); // ยังเป็น string ระหว่างพิมพ์
        }
      }}
      disabled={!isChecked}
      
    />
  )
}

,
  {
    field: "remaining",
    label: "คงเหลือ",
    render: (row) => {
      const remaining = (row.inbfg_quantity || 0) - (row.outbfg_item_quantity || 0);
      return (
        <MDTypography
          variant="body02"
          color={remaining >= 0 ? "inherit" : "error"}
        >
          {remaining >= 0 ? remaining : 0}
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







    const handleSubmitWithJobNo = async () => {
        const items = rows.flatMap((row) =>
            row.tableData
                .filter((item) => item.outbfg_item_quantity > 0) // ✅ ตรวจสอบว่ามีจำนวนที่จัดส่ง
                .map((item) => ({
                    bom_id: item.bom_id,
                    inbfg_id: item.inbfg_id,
                    outbfgitm_quantity: item.outbfg_item_quantity || 0,
                }))
        );
        const payload = {
            outbfg_so: Form.outbfg_so,
            outbfg_details: Form.outbfg_details,
            outbfg_is_shipment: Form.outbfg_is_shipment === true,
            outbfg_driver_name: Form.outbfg_driver_name || "",
            outbfg_vehicle_license: Form.outbfg_vehicle_license || "",
            tspyard_id: Form.tspyard_id ? Number(Form.tspyard_id) : null,
            outbfg_phone: Form.outbfg_phone || "",
            outbfg_address: Form.outbfg_address || "",
            outbfg_remark: Form.outbfg_remark || "",
            outbfg_is_bom_used: isBomUsed,
            so_id: Form.so_id ? Number(Form.so_id) : null,
            sup_id: Form.sup_id ? Number(Form.sup_id) : null,
            items: items,
        };

        console.log("🚀 Submit With Job No. Payload:", payload);

        try {
            const response = outbfg_id && mode === "edit"
                ? await OutBoundFGAPI.updateOutBoundFG(outbfg_id, payload)
                : await OutBoundFGAPI.createOutBoundFG(payload);

            if (response.isCompleted) {
                const createdOutbfgId = response.data.outbfg_id;

                // 🔹 ดึงข้อมูล `text` แทน `value` จาก dropdown
                const so_text = dropdownSO.find((item) => item.value === Form.so_id)?.text || "";
                const tspyard_text = dropdownTransport.find((item) => item.value === Form.tspyard_id)?.text || "";

                // 🔹 สร้าง Transaction Log Payload
                const logPayload = {
                    log_type: "OUTBOUND",
                    log_ctgy: "FINISHED_GOODS",
                    log_action: mode === "add" ? "CREATED" : "UPDATED",
                    ref_id: createdOutbfgId,
                    transaction_data: {
                        outbfg_so: Form.outbfg_so,
                        outbfg_details: Form.outbfg_details,
                        outbfg_is_shipment: Form.outbfg_is_shipment === true ? "DELIVERY" : "SELF_PICKUP",
                        outbfg_driver_name: Form.outbfg_driver_name,
                        outbfg_vehicle_license: Form.outbfg_vehicle_license,
                        outbfg_phone: Form.outbfg_phone,
                        outbfg_address: Form.outbfg_address,
                        so_name: so_text, // ✅ ใช้ text แทน value
                        tspyard_name: tspyard_text, // ✅ ใช้ text แทน value
                        items: items.map((item) => ({
                            bom_id: item.bom_id,
                            inbfg_id: item.inbfg_id,
                            outbfgitm_quantity: item.outbfgitm_quantity,
                        })),
                    },
                };

                console.log("📌 Transaction Log Payload:", logPayload);
                await TransactionAPI.createLog(logPayload);

                const fetchedData = await OutBoundFGAPI.getOutBoundFGReqByID(createdOutbfgId);
                if (fetchedData.isCompleted) {
                    setPrintModalData(fetchedData.data);
                }
                setAlert({
                    show: true,
                    type: "success",
                      title: mode === "add" ? "สร้างข้อมูลสำเร็จ" : "แก้ไขข้อมูลสำเร็จ",
                    message: response.message,
                });

                if (printFgChecked && printWayBillChecked) {
                    setShowPrintFgModalAll(true);
                } else if (printFgChecked) {
                    setShowPrintFgModal(true);
                } else if (printWayBillChecked) {
                    setShowPrintModal(true);
                }



            } else {
                setAlert({
                    show: true,
                    type: "error",
                     title: mode === "add" ? "สร้างข้อมูลไม่สำเร็จ" : "แก้ไขข้อมูลไม่สำเร็จ",
                    message: response.message,
                });
            }
        } catch (error) {
            console.error("❌ Error submitting with Job No.:", error);
        }
    };

    // ปรับปรุงฟังก์ชัน submit เมื่อไม่มี Job No.
    const handleSubmitWithoutJobNo = async () => {
        const items = manualRows
            .filter((row) => row.selectedFG)
            .map((row) => ({
                inbfg_id: Number(row.selectedFG),
                outbfgitm_quantity: Number(row.quantity),
            }));

        const payload = {
            outbfg_so: Form.outbfg_so,
            outbfg_details: Form.outbfg_details,
            outbfg_is_shipment: Boolean(Form.outbfg_is_shipment),
            outbfg_driver_name: Form.outbfg_driver_name || "",
            outbfg_vehicle_license: Form.outbfg_vehicle_license || "",
            tspyard_id: Form.tspyard_id ? Number(Form.tspyard_id) : null,
            outbfg_phone: Form.outbfg_phone || "",
            outbfg_address: Form.outbfg_address || "",
            outbfg_remark: Form.outbfg_remark || "",
            outbfg_is_bom_used: isBomUsed,
            sup_id: Form.sup_id ? Number(Form.sup_id) : null,
            items: items,
        };

        console.log("🚀 Submit Without Job No. Payload:", payload);

        try {
            const response = outbfg_id && mode === "edit"
                ? await OutBoundFGAPI.updateNoBomOutBoundFG(outbfg_id, payload)
                : await OutBoundFGAPI.createNoBomOutBoundFG(payload);

            if (response.isCompleted) {
                setAlert({
                    show: true,
                    type: "success",
                    title: mode === "add" ? "เพิ่มสำเร็จ" : "แก้ไขสำเร็จ",
                    message: response.message,
                });


                const createdOutbfgId = response.data.outbfg_id;

                const fetchedData = await OutBoundFGAPI.getOutBoundFGReqByID(createdOutbfgId);
                if (fetchedData.isCompleted) {
                    setPrintModalData(fetchedData.data);
                }

                // 🔹 ดึงข้อมูล `text` แทน `value` จาก dropdown
                const tspyard_text = dropdownTransport.find((item) => item.value === Form.tspyard_id)?.text || "";

                // 🔹 สร้าง Transaction Log Payload
                const logPayload = {
                    log_type: "OUTBOUND",
                    log_ctgy: "FINISHED_GOODS",
                    log_action: mode === "add" ? "CREATED" : "UPDATED",
                    ref_id: createdOutbfgId,
                    transaction_data: {
                        outbfg_so: Form.outbfg_so,
                        outbfg_details: Form.outbfg_details,
                        outbfg_is_shipment: Form.outbfg_is_shipment === true ? "DELIVERY" : "SELF_PICKUP",
                        outbfg_driver_name: Form.outbfg_driver_name,
                        outbfg_vehicle_license: Form.outbfg_vehicle_license,
                        outbfg_phone: Form.outbfg_phone,
                        outbfg_address: Form.outbfg_address,
                        tspyard_name: tspyard_text, // ✅ ใช้ text แทน value
                        items: items.map((item) => ({
                            inbfg_id: item.inbfg_id,
                            outbfgitm_quantity: item.outbfgitm_quantity,
                        })),
                    },
                };

                console.log("📌 Transaction Log Payload:", logPayload);
                await TransactionAPI.createLog(logPayload);



                if (printFgChecked && printWayBillChecked) {
                    setShowPrintFgModalAll(true);
                } else if (printFgChecked) {
                    setShowPrintFgModal(true);
                } else if (printWayBillChecked) {
                    setShowPrintModal(true);
                }



            } else {
                setAlert({
                    show: true,
                    type: "error",
                    title: mode === "add" ? "เพิ่มไม่สำเร็จ" : "แก้ไขไม่สำเร็จ",
                    message: response.message,
                });
            }
        } catch (error) {
            console.error("❌ Error submitting without Job No.:", error);
        }
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
        navigate("/outbound/outboundfg");
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox p={2}>
                <MDBox mt={2} ml={5}>
                    <MDTypography variant="h3" color="inherit" fontWeight="bold">
                        {mode === "add" ? " Outbound / เบิก FG / สร้างใบนำส่ง" : " Outbound / เบิก FG / เเก้ไขใบนำส่ง"}
                    </MDTypography>
                </MDBox>

                <MDBox mt={5}>
                    <Card>
                        <MDBox m={3} p={5}>
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
                                                        <>
                                                            <Button
                                                                onClick={() =>handleAddRowWithJobNo(index)}
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

                                                {/* Column for DynamicTableComponent */}
                                                {row.showTable && (
                                                    <Grid item xs={9}>
                                                        <MDBox>
                                                            <MDTypography variant="h6" fontWeight="bold" gutterBottom>
                                                                BOM : {row.bom_jobnb}
                                                            </MDTypography>
                                                            <DynamicTableComponent
                                                                columns={tableColumns}
                                                                data={row.tableData}
                                                                onRowSelectionChange={(inbfg_id) => handleRowSelectionChange(inbfg_id, index)}
                                                                onRowChange={(updatedRow, field, value) => handleRowChange(index, updatedRow, field, value)}
                                                                // ส่งเฉพาะของ row นี้
                                                                preselectedRows={row.selectedBomIds || []}
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
                                            <Grid item xs={12} md={4}>
                                                <MDBox display="flex" alignItems="center" gap={1} >
                                                    <MDTypography variant="h6" color="inherit">รหัส FG</MDTypography>
                                                    <StyledSelect
                                                        value={row.selectedFG}
                                                        onChange={(e) => handleManualInputChange(index, "selectedFG", e.target.value)}
                                                        sx={{ width: "350px", maxWidth: "100%", }}
                                                    >
                                                        {/* {dropdownFG.map((item) => (
                                                            <MenuItem key={item.value} value={item.value}>
                                                                {item.text}
                                                            </MenuItem>
                                                        ))} */}
                                                        {dropdownFG
                                                            .filter((item) => {
                                                                // ดึงค่าที่ถูกเลือกใน manualRows ยกเว้นแถวปัจจุบัน
                                                                const selectedInOtherRows = manualRows
                                                                    .filter((_, idx) => idx !== index)
                                                                    .map((r) => r.selectedFG);
                                                                // แสดง item เฉพาะถ้ายังไม่ถูกเลือกในแถวอื่น หรือเป็นค่าที่ถูกเลือกของแถวปัจจุบัน
                                                                return !selectedInOtherRows.includes(item.value) || item.value === row.selectedFG;
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
                                                <MDBox display="flex" alignItems="center" gap={1} >
                                                    <MDTypography variant="h6" color="inherit">จำนวนในคลัง</MDTypography>
                                                    <MDInput
                                                        value={row.fgStock}
                                                        disabled
                                                        sx={{ width: "100px", maxWidth: "100%", }}
                                                    />
                                                </MDBox>
                                            </Grid>

                                            <Grid item xs={12} md={2}>
                                                <MDBox display="flex" alignItems="center" gap={1} >
                                                    <MDTypography variant="h6" color="inherit">จำนวน</MDTypography>
                                                    <MDInput
                                                        type="number"
                                                        value={row.quantity}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            handleManualInputChange(index, "quantity", value === "" ? "" : Math.max(0, Number(value)));
                                                        }}
                                                        sx={{ width: "100px", maxWidth: "100%", }}
                                                    />
                                                </MDBox>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <MDBox display="flex" alignItems="center" gap={1} >
                                                    <MDTypography variant="h6" color="inherit">จำนวนคงเหลือ</MDTypography>
                                                    <MDInput
                                                        value={row.remaining}
                                                        disabled
                                                        sx={{ width: "100px", maxWidth: "100%", }}
                                                    />
                                                  <>
  {/* ปุ่ม + → เพิ่มถัดจากแถวที่กด */}
  <Button
    onClick={() => handleAddManualRow(index)}
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

  {/* ปุ่ม - → แสดงเมื่อมีมากกว่า 1 แถว */}
  {manualRows.length > 1 && (
    <Button
      onClick={() => handleRemoveManualRow(index)}
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
                                                onChange={handleChange}
                                                sx={{ width: "1175px", maxWidth: "100%" }}
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
                                                    disabled={!Form.outbfg_is_shipment}
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
                                                    disabled={!Form.outbfg_is_shipment}
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
                                                    disabled={!Form.outbfg_is_shipment}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <MDBox mt={6}>
                                            <MDBox display="flex" justifyContent="flex-start" mt={4} mb={4} ml={5} gap={10}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={printFgChecked}
                                                            onChange={(e) => setPrintFgChecked(e.target.checked)}
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
                                                            พิมพ์ใบเบิก
                                                        </MDTypography>
                                                    }
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={printWayBillChecked}
                                                            onChange={(e) => setPrintWayBillChecked(e.target.checked)}
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
                                                            พิมพ์ใบนำส่ง
                                                        </MDTypography>
                                                    }
                                                />
                                            </MDBox>
                                        </MDBox>
                                    </Grid>
                                </Grid>
                            </MDBox>

                            <Box mt={5} display="flex" justifyContent="flex-end" gap={2}>
                                <ButtonComponent type="cancelcolor" onClick={handlecancel} />
                                {/* <ButtonComponent
                                    type={mode === "add" ? "Document" : "confirmedit"}
                                    onClick={isBomUsed ? handleSubmitWithJobNo : handleSubmitWithoutJobNo}
                                /> */}
                                <ButtonComponent
                                    type={mode === "add" ? "Document" : "confirmedit"}
                                    onClick={() => {
                                        // ✅ เช็คเฉพาะตอน "add" เท่านั้น
                                        if (!printFgChecked && !printWayBillChecked) {
                                            setAlert({
                                                show: true,
                                                type: "error",
                                                title: "กรุณาเลือก",
                                                message: "กรุณาเลือก 'พิมพ์ใบเบิก' หรือ 'พิมพ์ใบนำส่ง'",
                                            });
                                            return;
                                        }

                                        if (isBomUsed) {
                                            handleSubmitWithJobNo();
                                        } else {
                                            handleSubmitWithoutJobNo();
                                        }
                                    }}
                                />



                            </Box>
                        </MDBox>
                    </Card>
                </MDBox>
            </MDBox>

            {printModalData && (
                <PrintWayBillComponent
                    open={showPrintModal}
                    onClose={handleModalClose}
                    data={printModalData}
                />
            )}
            {printModalData && (
                <PrintFgBillComponent
                    open={showPrintFgModal}
                    onClose={handleModalClose}
                    data={printModalData}
                />
            )}
            {printModalData && (
                <PrintModalAllComponent
                    open={showPrintFgModalAll}
                    onClose={handleModalClose}
                    data={printModalData}
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

export default OutboundFgCreate;