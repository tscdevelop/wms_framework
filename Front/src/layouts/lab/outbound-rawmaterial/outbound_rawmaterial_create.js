
import React, { useState, useEffect } from "react";
import { Box, Grid, Card, MenuItem, Button, FormControlLabel, Checkbox } from "@mui/material";
import { StyledSelect } from "common/Global.style";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import DropDownAPI from "api/DropDownAPI";
import InBoundRawAPI from "api/InBoundRawAPI";
import OutBoundRawAPI from "api/OutBoundRawAPI";
import { useLocation, useNavigate } from "react-router-dom";
import PrintRmBillComponent from "../components/outbound_rm_withdraw";
import TransactionAPI from "api/TransactionLogAPI";

const OutboundRawCreate = () => {
  // eslint-disable-next-line no-unused-vars
  const [unitLoading, setUnitLoading] = useState(true);

  const [Form, setForm] = useState({
    outbrm_code: "",
    outbrm_details: "",
  });

  // dropdown หลัก
  const [dropdownInbRaw, setDropDownInbRaw] = useState([]);
  const [dropdownBOM, setDropDownBOM] = useState([]);

  const [mode, setMode] = useState("add"); // หรือ "edit" ถ้ามีเงื่อนไข
  const [rows, setRows] = useState([
    {
      bom: "",
      inbrm_id: "",
      outbrm_quantity: "",
      outbrm_quantity_unitId: "",
      inbrm_quantity: "",
      showJobNo: true,
      rawOptions: [],
      bomOptions: [],
    },
  ]);

  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const [printData, setPrintData] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Checkbox “ระบุ BOM” หรือไม่
  const [isJobNoChecked, setIsJobNoChecked] = useState(true);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  // หากต้องการรับ outbrm_id จาก query param
  const code = params.get("outbrm_id");

  const navigate = useNavigate();


  const handleModalClose = () => {
    setIsPrintModalOpen(false); // ปิด Modal
    navigate("/outbound/outboundraw");
  };


  // --------------------------------------------
  // ฟังก์ชัน load dropdown
  // --------------------------------------------
  const fetchDropdownData = async (fetchFunction, setState) => {
    try {
      const response = await fetchFunction();
      if (response.isCompleted && Array.isArray(response.data)) {
        setState(response.data);
      } else {
        console.error("Error fetching data:", response.message);
        setState([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setState([]);
    }
  };

  // --------------------------------------------
  // ดึงข้อมูล InBoundRaw เพื่อหาคงเหลือ ฯลฯ
  // --------------------------------------------
  const fetchInBoundByID = async (inbrm_id, index) => {
    try {
      const response = await InBoundRawAPI.getInBoundByID(inbrm_id);
      if (response.isCompleted) {
        const data = response.data;
        setRows((prev) => {
          const updated = [...prev];
          updated[index].inbrm_quantity = data.inbrm_quantity || 0;
          updated[index].outbrm_quantity_unitId = data.rmifm_product_name || "";
          return updated;
        });
      }
    } catch (error) {
      console.error("Error fetchInBoundByID:", error);
    }
  };

  // --------------------------------------------
  // ฟังก์ชันหลัก: getInboundRawDropdown
  // --------------------------------------------
  const fetchDropdownInbRaw = async (isBomUsed, inbrm_bom = "") => {
    try {
      const response = await DropDownAPI.getInboundRawDropdown(isBomUsed, inbrm_bom);
      if (response.isCompleted && Array.isArray(response.data)) {
        setDropDownInbRaw(response.data);
        return response.data;
      } else {
        setDropDownInbRaw([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetchDropdownInbRaw:", error);
      setDropDownInbRaw([]);
      return [];
    }
  };

  // --------------------------------------------
  // ฟังก์ชัน fetchRawOptionsByBOM
  // --------------------------------------------
  const fetchRawOptionsByBOM = async (isBomUsed, inbrm_bom) => {
    try {
      const response = await DropDownAPI.getInboundRawDropdown(isBomUsed, inbrm_bom);
      if (response.isCompleted && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetchRawOptionsByBOM:", error);
      return [];
    }
  };

  // --------------------------------------------
  // ดึงข้อมูล OutBoundRaw ตาม outbrm_id
  // --------------------------------------------
  const fetchOutRawID = async (outbrm_id) => {
    try {
      const response = await OutBoundRawAPI.getOutBoundRawByID(outbrm_id);
      console.log("API Response:", response);

      if (response && response.isCompleted && response.data) {
        console.log("Response Data:", response.data);
        const { outbrm_details, outbrm_is_bom_used, items, outbrm_code } = response.data;

        // เซต Form
        setForm((prev) => ({
          ...prev,
          outbrm_code: outbrm_code || "",
          outbrm_details: outbrm_details || "",
        }));

        // อัปเดตค่า checkbox BOM
        const isBomUsed = outbrm_is_bom_used === 1;
        setIsJobNoChecked(isBomUsed);
        console.log("Checkbox (isJobNoChecked):", isBomUsed);

        // โหลด dropdown raw ใหม่ตามค่า isBomUsed
        fetchDropdownInbRaw(isBomUsed);

        if (Array.isArray(items)) {
          let updatedRows = [];

          if (isBomUsed) {
            // จัดกลุ่มข้อมูลตาม inbrm_bom
            const groupedItems = {};
            items.forEach((item) => {
              const jobnb = item.inbrm_bom || "NO_BOM";
              if (!groupedItems[jobnb]) {
                groupedItems[jobnb] = [];
              }
              groupedItems[jobnb].push(item);
            });

            updatedRows = Object.values(groupedItems).flatMap((group) =>
              group.map((item, idx) => ({
                bom: item.inbrm_bom || "",
                inbrm_id: item.inbrm_id || "",
                outbrm_quantity: item.outbrmitm_quantity || "",
                outbrm_quantity_unitId: item.unit_abbr_th || "",
                inbrm_quantity: item.inbrm_quantity || "",
                outbrm_item_id: item.outbrmitm_id,
                showJobNo: idx === 0,
                rawOptions: [], // จะอัปเดตด้านล่าง
                bomOptions: [],
              }))
            );
          } else {
            updatedRows = items.map((item) => ({
              bom: "",
              inbrm_id: item.inbrm_id || "",
              outbrm_quantity: item.outbrmitm_quantity || "",
              outbrm_quantity_unitId: item.unit_abbr_th || "",
              inbrm_quantity: item.inbrm_quantity || "",
              outbrm_item_id: item.outbrmitm_id,
              showJobNo: false,
              rawOptions: [], // สำหรับ non-BOM
              bomOptions: [],
            }));
          }

          // หลังจากได้ updatedRows แล้ว ให้ดึง rawOptions สำหรับแต่ละแถวที่มีค่า BOM
          const rowsWithRawOptions = await Promise.all(
            updatedRows.map(async (row) => {
              if (row.bom) {
                const rawOptions = await fetchRawOptionsByBOM(true, row.bom);
                return { ...row, rawOptions };
              }
              return row;
            })
          );

          console.log("Updated Rows with Raw Options:", rowsWithRawOptions);
          setRows(rowsWithRawOptions);
        } else {
          console.error("items is not an array:", items);
        }
      } else {
        console.error("Response is not completed or data is missing");
      }
    } catch (error) {
      console.error("Error fetching outbound raw data:", error);
    }
  };


  // --------------------------------------------
  // โหลด dropdown เริ่มต้น
  // --------------------------------------------
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setUnitLoading(true);

        await fetchDropdownData(InBoundRawAPI.dropdownIRawBom, setDropDownBOM);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      } finally {
        setUnitLoading(false);
      }
    };
    fetchDropdowns();
  }, []);

  // --------------------------------------------
  // ถ้า mode = "edit" หรือต้องการ load จาก outbrm_id
  // --------------------------------------------
  useEffect(() => {
    if (code) {
      // สมมุติว่าเป็นการแก้ไข
      setMode("edit");
      fetchOutRawID(code);
    }
  }, [code]);

  // --------------------------------------------
  // ดูว่า “แถวแรก” มี showJobNo = true/false => โหลด rawOptions แถวแรก
  // --------------------------------------------
  useEffect(() => {
    if (rows.length === 0) return;
    const firstRow = rows[0];
    if (!firstRow) return;

    const isBomUsed = firstRow.showJobNo;
    (async () => {
      const result = await fetchDropdownInbRaw(isBomUsed, "");
      setRows((prev) => {
        const updated = [...prev];
        if (updated[0]) {
          updated[0].rawOptions = result;
        }
        return updated;
      });
    })();
  }, [rows[0]?.showJobNo]);

  // --------------------------------------------
  // Checkbox “ระบุ BOM” / “ไม่ระบุ BOM”
  // --------------------------------------------
  const handleJobNoCheckboxChange = () => {
    setIsJobNoChecked(true);

    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        showJobNo: true,
        bom: "",
        inbrm_id: "",
        outbrm_quantity: "",
        outbrm_quantity_unitId: "",
        inbrm_quantity: "",
        rawOptions: [],
        bomOptions: [],
      }))
    );
  };

  const handleJobNoOutCheckboxChange = () => {
    setIsJobNoChecked(false);

    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        showJobNo: false,
        bom: "",
        inbrm_id: "",
        outbrm_quantity: "",
        outbrm_quantity_unitId: "",
        inbrm_quantity: "",
        rawOptions: [],
        bomOptions: [],
      }))
    );
  };

  // --------------------------------------------
  // เมื่อเลือก Raw Material
  // --------------------------------------------
  const handleDropdownChange = async (index, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index].inbrm_id = String(value).trim();
      return updated;
    });

    try {
      const bomResponse = await InBoundRawAPI.getIBRawBomByID(value);
      if (bomResponse.isCompleted) {
        const bomList = Array.isArray(bomResponse.data)
          ? bomResponse.data
          : [{ value: bomResponse.data, text: bomResponse.data }];

        setRows((prev) => {
          const updated = [...prev];
          updated[index].bomOptions = bomList;
          return updated;
        });

        if (bomList.length > 0) {
          const currentBOM = bomList[0].value;
          if (rows[index].showJobNo) {
            const rawOptions = await fetchRawOptionsByBOM(true, currentBOM);
            setRows((prev2) => {
              const updated2 = [...prev2];
              updated2[index].rawOptions = rawOptions;
              return updated2;
            });
            setRows((prev2) => {
              const updated2 = [...prev2];
              updated2[index].bom = currentBOM;
              return updated2;
            });
          }
        }
      }
    } catch (err) {
      console.error("Error handleDropdownChange => BOM", err);
    }

    setTimeout(() => {
      fetchInBoundByID(String(value).trim(), index);
    }, 100);
  };

  // --------------------------------------------
  // เมื่อเลือก BOM
  // --------------------------------------------
  // const handleBOMSelectChange = async (index, newBOMValue) => {
  //   setRows((prev) => {
  //     const updated = [...prev];
  //     updated[index].bom = newBOMValue;
  //     return updated;
  //   });

  //   const rawList = await fetchRawOptionsByBOM(true, newBOMValue);
  //   if (rawList.length > 0) {
  //     setRows((prev) => {
  //       const updated = [...prev];
  //       updated[index].rawOptions = rawList;
  //       updated[index].inbrm_id = rawList[0].value;
  //       return updated;
  //     });
  //     fetchInBoundByID(rawList[0].value, index);
  //   } else {
  //     setRows((prev) => {
  //       const updated = [...prev];
  //       updated[index].rawOptions = [];
  //       updated[index].inbrm_id = "";
  //       return updated;
  //     });
  //   }
  // };

  const handleBOMSelectChange = async (index, newBOMValue) => {
  const rawList = await fetchRawOptionsByBOM(true, newBOMValue);

  setRows((prevRows) => {
    const updated = [...prevRows];

    // ✅ 1. อัปเดตแถวหัว
    updated[index].bom = newBOMValue;
    updated[index].rawOptions = rawList;
    updated[index].inbrm_id = rawList[0]?.value || "";
    updated[index].outbrm_quantity = "";
    updated[index].outbrm_quantity_unitId = "";
    updated[index].inbrm_quantity = "";

    // ✅ 2. รีเซตแถวลูกถัดๆ ไปที่ไม่ใช่หัว (showJobNo === false)
    for (let i = index + 1; i < updated.length; i++) {
      if (updated[i].showJobNo) break;

      updated[i].bom = newBOMValue;
      updated[i].rawOptions = rawList;
      updated[i].inbrm_id = "";
      updated[i].outbrm_quantity = "";
      updated[i].outbrm_quantity_unitId = "";
      updated[i].inbrm_quantity = "";
    }

    return updated;
  });

  // ✅ ดึงข้อมูลสำหรับแถวหัวใหม่ที่ถูกเลือก raw
  if (rawList.length > 0) {
    fetchInBoundByID(rawList[0].value, index);
  }
};


  // --------------------------------------------
  // handleChange ฟอร์มหลัก
  // --------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const handleNumericChange = (e, index, field) => {
    let { value } = e.target;

    // ✅ กรองเฉพาะตัวเลข (ห้ามตัวอักษร + ห้ามติดลบ)
    value = value.replace(/[^0-9]/g, "");

    setRows((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };


  // --------------------------------------------
  // เพิ่ม/ลบ แถว
  // --------------------------------------------
  const handleAddRowWithJobNo = async () => {
  const lastRow = rows[rows.length - 1];
  if (!lastRow.bom) {
    setAlert({
      show: true,
      type: "warning",
      title: "กรุณาเลือก BOM",
      message: "ต้องเลือกข้อมูล BOM ก่อนจึงจะเพิ่มแถวถัดไปได้",
    });
    return;
  }

  setRows((prev) => [
    ...prev,
    {
      bom: "",
      inbrm_id: "",
      outbrm_quantity: "",
      outbrm_quantity_unitId: "",
      inbrm_quantity: "",
      showJobNo: true,
      rawOptions: [],
      bomOptions: [],
    },
  ]);
};


  const isLastRowWithJobNo = (index) => {
    const lastIndex = [...rows]
      .map((row, i) => (row.showJobNo ? i : -1))
      .filter((i) => i !== -1)
      .pop();

    return index === lastIndex;
  };



  // const findLastRowWithBOM = (rows) => {
  //   if (!rows || rows.length === 0) return null;
  //   for (let i = rows.length - 1; i >= 0; i--) {
  //     if (rows[i].showJobNo && rows[i].bom) {
  //       return { row: rows[i], index: i };
  //     }
  //   }
  //   return null;
  // };

  const findClosestAboveRowWithBOM = (rows, index) => {
  for (let i = index; i >= 0; i--) {
    if (rows[i].showJobNo && rows[i].bom) {
      return { row: rows[i], index: i };
    }
  }
  return null;
};

 const handleAddRowWithoutJobNo = async (index) => {
  const currentRow = rows[index];
  if (!currentRow.inbrm_id) {
    setAlert({
      show: true,
      type: "warning",
      title: "กรุณาเลือก Raw Material",
      message: "ต้องเลือก Raw Material ก่อนจึงจะเพิ่มแถวถัดไปได้",
    });
    return;
  }

  const nearestRow = findClosestAboveRowWithBOM(rows, index);
  let existingBOM = "";
  let isBomUsedParam = false;

  if (nearestRow) {
    existingBOM = nearestRow.row.bom;
    isBomUsedParam = true;
  }

  const rawOps = await fetchRawOptionsByBOM(isBomUsedParam, existingBOM);

  const newRow = {
    bom: existingBOM,
    inbrm_id: "",
    outbrm_quantity: "",
    outbrm_quantity_unitId: "",
    inbrm_quantity: "",
    showJobNo: false,
    rawOptions: rawOps,
    bomOptions: [],
  };

  setRows((prev) => {
    const updated = [...prev];
    updated.splice(index + 1, 0, newRow);
    return updated;
  });
};




  const handleRemoveRow = (index) => {
    if (index === 0) {
      console.log("Cannot remove first row");
      return;
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // --------------------------------------------
  // ปุ่ม cancel
  // --------------------------------------------
  const handlecancel = () => {
    navigate("/outbound/outboundraw");
  };

  // --------------------------------------------
  // ฟังก์ชัน Submit
  // --------------------------------------------
  const handleSubmit = async () => {
    // ตรวจสอบว่าข้อมูลจำเป็นมีครบไหม

    if (rows.some(row => !row.inbrm_id)) {
      setAlert({
        show: true,
        type: "error",
        title: "ข้อมูลไม่ครบ",
        message: "กรุณากรอกข้อมูลให้ครบถ้วนในทุกแถว"
      });
      return; // หยุดการทำงานหากข้อมูลไม่ครบ
    }


    // สร้าง payload
    const payload = {
      outbrm_details: Form.outbrm_details,
      outbrm_is_bom_used: isJobNoChecked,
      items: rows.map((row) => ({
        inbrm_id: Number(row.inbrm_id),
        outbrmitm_quantity: Number(row.outbrm_quantity) || 0,
      })),
    };

    console.log("📌 Sending Payload:", JSON.stringify(payload, null, 2));

    try {
      if (mode === "add") {
        // call create
        const response = await OutBoundRawAPI.createOutBoundRaw(payload);
        console.log("📌 API Response:", response);

        if (response.isCompleted) {
          setAlert({
            show: true,
            type: "success",
            title: "สร้างข้อมูลสำเร็จ",
            message: response.message,
          });

          // 🔹 สมมติว่า API ส่งกลับ outbrm_id หลังจากสร้างข้อมูลเสร็จ
          const createdOutbrmCode = response.data.outbrm_id;
          // 🔹 หลังได้รับ response และก่อนสร้าง logPayload
          let outbrmData = {};
          const fetchedData = await OutBoundRawAPI.getOutBoundRawReqByID(createdOutbrmCode);
          if (fetchedData.isCompleted && fetchedData.data) {
            outbrmData = fetchedData.data;
            setPrintData(fetchedData.data);
          }

          // 📌 สร้าง array สำหรับ BOM และ Raw Material
          const bomTextArray = [];
          const rawTextArray = [];

          rows.forEach((row) => {
            // 1) หา BOM text
            const bomItem = dropdownBOM.find((item) => String(item.value) === String(row.bom));
            const bomText = bomItem?.text || "";

            // 2) หา Raw Material text
            const rawItem = row.rawOptions?.find((i) => String(i.value) === String(row.inbrm_id));
            const rawText = rawItem?.text || "";

            bomTextArray.push(bomText);
            rawTextArray.push(rawText);
          });

          const joinedBomText = bomTextArray.join(", ");
          const joinedRawText = rawTextArray.join(", ");

          // 🔹 สร้าง Transaction Log Payload
          const logPayload = {
            log_type: "OUTBOUND",
            log_ctgy: "RAW_MATERIAL",
            log_action: "CREATED",
            ref_id: createdOutbrmCode,
            transaction_data: {
              outbrm_code: outbrmData.outbrm_code || "",
              outbrm_details: outbrmData.outbrm_details || "",
              outbrm_appr_status: outbrmData.outbrm_appr_status || "",
              outbrmitm_withdr_status: outbrmData.outbrmitm_withdr_status || "",
              bom_name: joinedBomText,
              raw_material_name: joinedRawText,
            },
          };

          console.log("📌 Transaction Log Payload:", logPayload);
          await TransactionAPI.createLog(logPayload);

          setIsPrintModalOpen(true);
        } else {
          setAlert({
            show: true,
            type: "error",
            title: "สร้างข้อมูลไม่สำเร็จ",
            message: response.message,
          });
        }
      } else if (mode === "edit") {
        const outbrm_id = code;
        const response = await OutBoundRawAPI.updateOutBoundRaw(outbrm_id, payload);
        console.log("📌 API Response:", response);

        if (response.isCompleted) {
          setAlert({
            show: true,
            type: "success",
            title: "แก้ไขข้อมูลสำเร็จ",
            message: response.message,
          });

          let outbrmData = {};
          const fetchedData = await OutBoundRawAPI.getOutBoundRawByID(outbrm_id);
          if (fetchedData.isCompleted && fetchedData.data) {
            outbrmData = fetchedData.data;
          }

          // 📌 สร้าง array สำหรับ BOM และ Raw Material
          const bomTextArray = [];
          const rawTextArray = [];

          rows.forEach((row) => {
            // 1) หา BOM text
            const bomItem = dropdownBOM.find((item) => String(item.value) === String(row.bom));
            const bomText = bomItem?.text || "";

            // 2) หา Raw Material text
            let rawItem = row.rawOptions?.find((i) => String(i.value) === String(row.inbrm_id));
            if (!rawItem) {
              // fallback หาจาก dropdownInbRaw
              rawItem = dropdownInbRaw.find((i) => String(i.value) === String(row.inbrm_id));
            }
            const rawText = rawItem?.text || "";

            bomTextArray.push(bomText);
            rawTextArray.push(rawText);
          });

          const joinedBomText = bomTextArray.join(", ");
          const joinedRawText = rawTextArray.join(", ");

          // 🔹 สร้าง Transaction Log Payload
          const logPayload = {
            log_type: "OUTBOUND",
            log_ctgy: "RAW_MATERIAL",
            log_action: "UPDATED",
            ref_id: outbrm_id,
            transaction_data: {
              outbrm_code: outbrmData.outbrm_code || "",
              outbrm_details: outbrmData.outbrm_details || "",
              outbrm_appr_status: outbrmData.outbrm_appr_status || "",
              outbrmitm_withdr_status: outbrmData.outbrmitm_withdr_status || "",
              bom_name: joinedBomText,
              raw_material_name: joinedRawText,
            },
          };

          console.log("📌 Transaction Log Payload:", logPayload);
          await TransactionAPI.createLog(logPayload);


          setTimeout(() => {
            navigate("/outbound/outboundraw");
          }, 2000);
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2} ml={5}>

          <MDTypography variant="h3" color="inherit" fontWeight="bold">
            {mode === "add" ? " Outbound / เบิก Raw Material / สร้างใบเบิก" : " Outbound / เบิก Raw Material / เเก้ไขใบเบิก"}
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
                <Grid item xs={12} md={3}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 2 }}>
                    <MDTypography variant="h6" color="inherit">
                      เลขที่ใบเบิก
                    </MDTypography>
                    <MDInput
                      sx={{ width: "200px", maxWidth: "100%" }}
                      name="outbrm_code"
                      value={Form.outbrm_code || ""}
                      disabled
                    />
                  </MDBox>
                </Grid>

                <Grid item xs={12} md={5}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 2 }}>
                    <MDTypography variant="h6" color="inherit">
                      รายละเอียด
                    </MDTypography>
                    <MDInput
                      sx={{ width: "450px", maxWidth: "100%" }}
                      name="outbrm_details"
                      value={Form.outbrm_details || ""}
                      onChange={handleChange}
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
                      />
                    }
                    label="ไม่ระบุ BOM"
                  />
                </Grid>

                {rows.map((row, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={12} md={3}>
                      <MDBox display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        {row.showJobNo ? (
                          <>
                            <Box sx={{ minWidth: 60 }}>
                              <MDTypography variant="h6" color="inherit" noWrap>
                                BOM
                              </MDTypography>
                            </Box>
                            <StyledSelect
                              value={row.bom || ""}
                              onChange={(e) => handleBOMSelectChange(index, e.target.value)}
                              sx={{ width: "150px", maxWidth: "100%", height: "45px" }}
                            >
                              {dropdownBOM.map((item) => (
                                <MenuItem key={item.value} value={item.value}>
                                  {item.text}
                                </MenuItem>
                              ))}
                            </StyledSelect>

                            {/* ปุ่ม + - เฉพาะแถวแรกของ BOM */}
                            {row.showJobNo && isLastRowWithJobNo(index) && (
                              <Button
                                onClick={handleAddRowWithJobNo}
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
                            )}

                          </>
                        ) : (
                          <Box sx={{ visibility: "hidden", width: "100%" }}>
                            <MDTypography>BOM.</MDTypography>
                            <MDInput fullWidth />
                          </Box>
                        )}
                      </MDBox>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <MDBox display="flex" alignItems="center" gap={1}>
                        <MDTypography variant="h6" color="inherit">
                          Raw Material
                        </MDTypography>
                        <StyledSelect
                          value={row.inbrm_id || ""}
                          onChange={(e) => handleDropdownChange(index, e.target.value)}
                          sx={{ width: "250px", maxWidth: "100%" }}
                        >
                          {(
                            row.rawOptions && row.rawOptions.length > 0
                              ? row.rawOptions
                              : dropdownInbRaw
                          ).map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.text}
                            </MenuItem>
                          ))}
                        </StyledSelect>

                      </MDBox>
                    </Grid>

                    <Grid item xs={12} md={2.5}>
                      <MDBox display="flex" alignItems="center" gap={1}>
                        <MDTypography variant="h6" color="inherit">
                          จำนวน
                        </MDTypography>
                        <MDInput
                          value={row.outbrm_quantity || ""}
                          onChange={(e) => handleNumericChange(e, index, "outbrm_quantity")}
                          sx={{ width: "125px", maxWidth: "100%" }}
                          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }} // ✅ ป้องกันตัวอักษร
                        />
                        <MDInput
                          value={row.outbrm_quantity_unitId || ""}
                          sx={{ width: "125px", maxWidth: "100%" }}
                          disabled
                        />
                      </MDBox>
                    </Grid>

                    <Grid item xs={12} md={3.5}>
                      <MDBox display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        <Box sx={{ minWidth: 120 }}>
                          <MDTypography variant="h6" color="inherit" noWrap>
                            จำนวนคงเหลือในคลัง
                          </MDTypography>
                        </Box>
                        <MDInput
                          name="inbrm_quantity"
                          value={row.inbrm_quantity || ""}
                          disabled
                          sx={{ width: "100px", maxWidth: "100%" }}
                        />

                        <>
                          <Button
                            onClick={() => handleAddRowWithoutJobNo(index)}
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

              <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                <ButtonComponent type="cancelcolor" onClick={handlecancel} />
                <ButtonComponent
                  type={mode === "add" ? "bill" : "confirmedit"}
                  onClick={handleSubmit}
                />
              </Box>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>

      <PrintRmBillComponent
        open={isPrintModalOpen}
        onClose={handleModalClose}
        data={printData}
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

export default OutboundRawCreate;
