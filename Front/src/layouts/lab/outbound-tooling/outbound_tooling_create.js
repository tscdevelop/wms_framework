
import React, { useState, useEffect } from "react";
import { Box, Grid, Card, MenuItem, Button } from "@mui/material";
import { StyledSelect } from "common/Global.style";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import DropDownAPI from "api/DropDownAPI";
import OutBoundToolingAPI from "api/OutboundToolingAPI";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import PrintTLBillComponent from "../components/outbound_tl_billtooling";
import TransactionAPI from "api/TransactionLogAPI";
const OutBoundToolingCreate = () => {
  const [unitLoading, setUnitLoading] = useState(true); // State สำหรับ dropdownUnit
  const [Form, setForm] = useState({
    outbtl_code: "", // ค่าเริ่มต้นของเลขที่ใบเบิก
    outbtl_details: "", // ค่าเริ่มต้นของรายละเอียด
    outbtl_withdrawer_name: ""
  });
  const [dropdownTL, setDropDownTL] = useState([]);
  const [printData, setPrintData] = useState(null); // เก็บข้อมูลสำหรับการพิมพ์
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false); // ควบคุม modal
  const [mode, setMode] = useState("add"); // "add" หรือ "edit"
  const [rows, setRows] = useState([
    {
      outbtlitm_id: "",
      inbtl_code: "",
      inbtl_name: "",
      outbtlitm_quantity: "",
      outbtlitm_quantity_unitId: "",
      outbtlitm_return_quantity: "",
      inbtl_quantity: "",
      showJobNo: true, // กำหนดให้แสดง Job No. สำหรับแถวแรก
    },
  ]);
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [outbtl_id, setOutbtlCode] = useState(""); // สร้าง state สำหรับเก็บ outbrm_code
  const navigate = useNavigate();

  const handleModalClose = () => {
    setIsPrintModalOpen(false); // ปิด Modal
    navigate("/outbound/outboundtooling");
  };

  useEffect(() => {
    const code = params.get("outbtl_id");
    console.log("outbtl_id from URL:", code);
    if (code) {
      setOutbtlCode(code);
      setMode("edit"); // เปลี่ยนเป็นโหมดแก้ไขหากพบค่า outbrm_code
      fetchOutTLCode(code); // โหลดข้อมูลเก่าจาก API
    }
  }, [location.search]);


  const fetchDropdownData = async (fetchFunction, setState) => {
    try {
      const response = await fetchFunction();
      if (response.isCompleted && response.data.length > 0) {
        setState(response.data);
      } else {
        console.error("Error fetching data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setUnitLoading(true); // เริ่ม Loading
        await fetchDropdownData(DropDownAPI.getInboundToolingDropdown, setDropDownTL);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      } finally {
        setUnitLoading(false); // Dropdown โหลดเสร็จ
      }
    };

    fetchDropdowns();
  }, []);





  const fetchOutTLCode = async (outbtl_id) => {
    try {
      const response = await OutBoundToolingAPI.getOutBoundTLByID(outbtl_id);
      console.log("API Response:", response);

      if (response.isCompleted) {
        const { data } = response;

        // อัปเดต Form
        setForm((prevState) => ({
          ...prevState,
          outbtl_code: data.outbtl_code || "",
          outbtl_details: data.outbtl_details || "",
          outbtl_withdrawer_name: data.outbtl_issued_by || "",
        }));

        // แปลงข้อมูลจาก inbtlCodes เป็น rows หลายแถว
        const updatedRows = data.inbtlCodes.map((item) => ({
          inbtl_code: item.inbtl_id || "",

        }));

        console.log("Updated Rows:", updatedRows);
        setRows(updatedRows);
      } else {
        console.error("Failed to fetch data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching outbound raw data:", error);
    }
  };







  useEffect(() => {
    if (outbtl_id && !unitLoading) { // รอให้ unitLoading เสร็จก่อน
      console.log("Fetching Outbound Raw Data for:", outbtl_id);
      fetchOutTLCode(outbtl_id);
    }
  }, [outbtl_id, unitLoading]);


  useEffect(() => {
    if (outbtl_id) {
      setMode("edit"); // แก้ไขข้อมูล
      fetchOutTLCode(outbtl_id); // โหลดข้อมูลเดิม
    } else {
      setMode("add"); // เพิ่มข้อมูลใหม่
    }
  }, [outbtl_id]);





  const handleAddRowAtIndex = (index) => {
    const newRow = {
      outbtlitm_id: "",
      inbtl_code: "",
      inbtl_name: "",
      outbtlitm_quantity: "",
      outbtlitm_quantity_unitId: "",
      outbtlitm_return_quantity: "",
      inbtl_quantity: "",
      showJobNo: false,
    };
  
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      updatedRows.splice(index + 1, 0, newRow); // แทรกหลังจาก index ที่กด
      return updatedRows;
    });
  };
  


  const handleRemoveRow = (index) => {
    if (rows.length === 1) {
      console.log("❌ Cannot remove the last remaining row");
      return;
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };


  const handleSubmit = async () => {


    // ✅ ตรวจสอบข้อมูลในแต่ละ row
    for (const row of rows) {
      console.log("Processing row:", row);
       
    }

    // ✅ สร้าง Payload ตามโครงสร้าง API Swagger
    const payload = {
      outbtl_issued_by: Form.outbtl_withdrawer_name,
      outbtl_details: Form.outbtl_details,
      items: rows.map((row) => ({
        inbtl_id: row.inbtl_code,
      })),
    };

    console.log("📌 Payload for API:", payload);

    try {
      if (mode === "add") {
        // ✅ สร้างข้อมูลใหม่
        const response = await OutBoundToolingAPI.createOutBoundTL(payload);
        if (response.isCompleted) {
          setAlert({
            show: true,
            type: "success",
            title: "สร้างข้อมูลสำเร็จ",
            message: response.message,
          });

          // ✅ ดึง `outbtl_id` ที่ถูกสร้าง
          const createdOutbtlId = response.data?.outbtl_id;
          if (!createdOutbtlId) {
            console.error("❌ ไม่มี outbtl_id ใน response");
            return;
          }

          // ✅ ดึงข้อมูลที่ถูกสร้าง
          const fetchData = await OutBoundToolingAPI.getOutBoundTLReqByID(createdOutbtlId);
          console.log("📌 Fetch Data Response:", fetchData);
          if (fetchData.isCompleted) {
            setPrintData(fetchData.data);
          }
          setIsPrintModalOpen(true);

          // ✅ ดึงค่าจาก dropdown เป็น text
          const dropdownTLText = dropdownTL?.find((item) => item.value === rows[0]?.inbtl_code)?.text || "";


          // ✅ สร้าง Transaction Log
          const logPayload = {
            log_type: "OUTBOUND",
            log_ctgy: "TOOLING",
            log_action: "CREATED",
            ref_id: createdOutbtlId,
            transaction_data: {
              outbtl_code: fetchData.data?.outbtl_code || "",
              outbtl_details: fetchData.data?.outbtl_details || "",
              tooling_name: dropdownTLText, // ✅ ส่ง Tooling เป็น text
            },
          };

          console.log("📌 Transaction Log Payload:", logPayload);
          await TransactionAPI.createLog(logPayload);
        } else {
          setAlert({
            show: true,
            type: "error",
            title: "สร้างข้อมูลไม่สำเร็จ",
            message: response.message,
          });
        }
      } else if (mode === "edit") {
        // ✅ อัปเดตข้อมูลที่มีอยู่
        const response = await OutBoundToolingAPI.updateOutBoundTL(outbtl_id, payload);
        if (response.isCompleted) {
          setAlert({
            show: true,
            type: "success",
            title: "แก้ไขข้อมูลสำเร็จ",
            message: response.message,
          });

          // ✅ ดึงข้อมูลที่ถูกอัปเดต
          const fetchData = await OutBoundToolingAPI.getOutBoundTLByID(outbtl_id);
          console.log("📌 Fetch Data Response:", fetchData);

          // ✅ ดึงค่าจาก dropdown เป็น text
          const dropdownTLText = dropdownTL?.find((item) => item.value === rows[0]?.inbtl_code)?.text || "";


          // ✅ สร้าง Transaction Log
          const logPayload = {
            log_type: "OUTBOUND",
            log_ctgy: "TOOLING",
            log_action: "UPDATED",
            ref_id: outbtl_id,
            transaction_data: {
              outbtl_code: fetchData.data?.outbtl_code || "",
              outbtl_details: fetchData.data?.outbtl_details || "",
              tooling_name: dropdownTLText, // ✅ ส่ง Tooling เป็น text
            },
          };

          console.log("📌 Transaction Log Payload:", logPayload);
          await TransactionAPI.createLog(logPayload);

          setTimeout(() => {
            navigate("/outbound/outboundtooling");
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



  const handlecancel = () => {
    navigate("/outbound/outboundtooling");
  };


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="inherit" >
            {mode === "add" ? " Outbound / Tooling / สร้างใบเบิก" : " Outbound / Tooling / เเก้ไขใบเบิก"}
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
                      sx={{ width: "300px", maxWidth: "100%" }}
                      name="outbtl_code "
                      value={Form.outbtl_code || ""} // ตรวจสอบว่า `Form.inbrm_code` มีค่า
                      disabled
                    />
                  </MDBox>
                </Grid>

                <Grid item xs={12} md={8}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 2 }}>
                    <MDTypography variant="h6" color="inherit">
                      ชื่อ - นามสกุลผู้ทำเรื่องเบิก
                    </MDTypography>
                    <MDInput
                      sx={{ width: "600px", maxWidth: "100%" }}
                      name="outbtl_withdrawer_name" // ลบช่องว่างด้านหลังออก
                      value={Form.outbtl_withdrawer_name || ""}
                      onChange={handleChange}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={12}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 2 }}>
                    <MDTypography variant="h6" color="inherit">
                      รายละเอียด
                    </MDTypography>
                    <MDInput
                      sx={{ width: "1195px", maxWidth: "100%" }}
                      name="outbtl_details" // ลบช่องว่างด้านหลังออก
                      value={Form.outbtl_details || ""}
                      onChange={handleChange}
                    />
                  </MDBox>
                </Grid>

                {rows.map((row, index) => (
                  <React.Fragment key={index}>
                    {/* Job No. Row */}
                    <Grid item xs={12} md={1}>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDBox display="flex" alignItems="center" gap={3}>
                        <MDTypography variant="h6" color="inherit">เครื่องมือ</MDTypography>
                        {/* <StyledSelect
                          name="inbtl_code"
                          value={row.inbtl_code || ""}
                          onChange={(e) => handleInputChange(index, "inbtl_code", e.target.value)}
                          sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                        >
                          {dropdownTL.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.text}
                            </MenuItem>
                          ))}
                        </StyledSelect> */}
                        <StyledSelect
                          name="inbtl_code"
                          value={row.inbtl_code || ""}
                          onChange={(e) => handleInputChange(index, "inbtl_code", e.target.value)}
                          sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                        >
                          {dropdownTL
                            .filter((item) => {
                              // ดึงค่าที่ถูกเลือกในแถวอื่น (ยกเว้นแถวปัจจุบัน)
                              const selectedValues = rows
                                .filter((_, idx) => idx !== index)
                                .map((r) => r.inbtl_code);
                              // ถ้ายังไม่ได้เลือกในแถวอื่น หรือถ้าเป็นค่าที่เลือกในแถวปัจจุบัน ก็ให้แสดง
                              return !selectedValues.includes(item.value) || item.value === row.inbtl_code;
                            })
                            .map((item) => (
                              <MenuItem key={item.value} value={item.value}>
                                {item.text}
                              </MenuItem>
                            ))}
                        </StyledSelect>

                        <>
                        {/* ปุ่มเพิ่มแถว: แสดงทุกแถว */}
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

                        {/* ปุ่มลบแถว: แสดงทุกแถว ยกเว้นเหลือแถวเดียว */}
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
                    <Grid item xs={12} md={5}>
                    </Grid>



                  </React.Fragment>
                ))}
              </Grid>

              <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                <ButtonComponent type="cancel" onClick={handlecancel} />
                <ButtonComponent type={mode === "add" ? "bill" : "confirmedit"} onClick={handleSubmit} />
              </Box>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>

      <PrintTLBillComponent
        open={isPrintModalOpen}
        onClose={handleModalClose}
        data={printData || { items: [] }}  // Ensure default value
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

export default OutBoundToolingCreate;

