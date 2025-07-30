import React, { useState, useEffect } from "react";
import { Box, Card, Checkbox,  CircularProgress, useMediaQuery, Grid } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import SweetAlertComponent from "../components/sweetAlert";
import ButtonComponent from "../components/ButtonComponent";
import OutBoundSemiFGAPI from "api/OutBoundSemiFGAPI";

const borderedContainerStyle = {
  border: "1.5px solid #363636", // ขอบหนา 2px สีดำ
  borderRadius: "8px", // มุมโค้งมน
  overflowX: "auto", // รองรับการเลื่อนในแนวนอนสำหรับจอเล็ก
};

const tableStyle = {
  borderCollapse: "collapse",
  width: "100%",
  border: "1px solid #363636",
};

const thStyle = {
  border: "1px solid #363636",
  padding: "3px",
  backgroundColor: "#f2f2f2",
  textAlign: "center",
  width: "200px",
  whiteSpace: "nowrap", // ป้องกันการตัดบรรทัด
  overflow: "hidden", // ตัดข้อความที่เกินความกว้าง
  textOverflow: "ellipsis",
};

const tdStyle = {
  border: "1px solid #363636",
  padding: "3px",
  textAlign: "center",
  fontSize: "0.85rem",
  width: "500px",
};

const ConfirmSemiFGWithdraw = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const outbsemi_id = params.get("outbsemi_id");
  const status = params.get("status"); // รับค่า status
  const isViewMode = status === "view"; // เช็คว่าเป็นโหมดดูอย่างเดียว

  const isTablet = useMediaQuery("(max-width: 1024px)");
  const [loading, setLoading] = useState(true);
  const [withdrawData, setWithdrawData] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [scanValue, setScanValue] = useState("");
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const navigate = useNavigate();

  const fetchWithdrawData = async () => {
    try {
      const response = await OutBoundSemiFGAPI.getOutBoundSemiReqByID(outbsemi_id);
      if (response.isCompleted) {
        setWithdrawData(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (outbsemi_id) {
      fetchWithdrawData();
    }
  }, [outbsemi_id]);

  // ฟังก์ชันสำหรับจัดการเมื่อกด Enter ในฟิลด์ Scan รหัส FG
  const handleScanEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      let scannedCode = scanValue.trim();
      if (!scannedCode) return;

      try {
        // พยายามแปลงเป็น JSON และดึงเฉพาะ inbfg_code
        const scannedData = JSON.parse(scannedCode);
        if (scannedData && scannedData.code) {
          scannedCode = scannedData.code;
        }
      } catch (error) {
        // ถ้าไม่ใช่ JSON (เช่นพิมพ์ตรงๆ) ก็ใช้ scannedCode ตามเดิม
      }

      // ค้นหา item ที่มี inbsemi_code ตรงกับค่า scanValue
      const itemIndex = withdrawData.items.findIndex((item) => item.inbsemi_code === scannedCode);
      if (itemIndex === -1) {
        setScanValue("");
        return;
      }
      const currentCount = Number(withdrawData.items[itemIndex].outbsemiitm_withdr_count) || 0;
      const requiredQuantity = Number(withdrawData.items[itemIndex].outbsemiitm_quantity) || 0;
      // ตรวจสอบว่า count ยังไม่ถึงจำนวนที่ต้องส่ง
      if (currentCount >= requiredQuantity) {
        setScanValue("");
        return;
      }
      const newCount = currentCount + 1;

      // อัปเดตจำนวนในรายการสินค้า
      const updatedItems = [...withdrawData.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        outbsemiitm_withdr_count: newCount,
      };
      setWithdrawData({
        ...withdrawData,
        items: updatedItems,
      });

      // เพิ่มรายการใน selectedItems หากยังไม่มี (ตรวจสอบด้วย inbsemi_id)
      const selectedExists = selectedItems.some(
        (selected) => selected.inbsemi_id === updatedItems[itemIndex].inbsemi_id
      );
      if (!selectedExists) {
        setSelectedItems((prev) => [...prev, { inbsemi_id: updatedItems[itemIndex].inbsemi_id }]);
      }
      setScanValue("");
    }
  };

  const handleConfirmWithdraw = async () => {
    if (selectedItems.length === 0) {
      return;
    }

    setLoading(true);
    try {
      // สร้าง payload โดยรวมรายการสินค้าที่ถูกเลือก
      const payload = {
        items: withdrawData.items
          .filter((item) => selectedItems.some((sel) => sel.inbsemi_id === item.inbsemi_id))
          .map((item) => ({
            inbsemi_id: item.inbsemi_id,
            outbsemiitm_withdr_count: item.outbsemiitm_withdr_count,
          })),
      };

      const response = await OutBoundSemiFGAPI.createOutBSemiWd(withdrawData.outbsemi_id, payload);
      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: "ดำเนินการสำเร็จ",
          message: response.message,
        });
        setTimeout(() => {
          navigate("/confirmsemi");
        }, 1500);
      } else {
        setAlert({
          show: true,
          type: "error",
          title: "เกิดข้อผิดพลาด",
          message: response.message,
        });
      }

      fetchWithdrawData(); // รีเฟรชข้อมูลหลังส่ง API สำเร็จ
    } catch (error) {
      console.error("Error confirming withdrawal:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3} display="flex" justifyContent="center">
          <CircularProgress />
        </MDBox>
      </DashboardLayout>
    );
  }

  if (!withdrawData) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography variant="h6" color="error">
            ไม่พบข้อมูลการเบิก
          </MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  const {
    outbsemi_code,
    today_date,
    outbsemi_details,
    outbsemi_driver_name,
    outbsemi_vehicle_license,
    outbsemi_phone,
    outbsemi_address,
    tspyard_name,
    items,
  } = withdrawData;

  const handleReturn = () => {
    navigate("/confirmsemi");
  };
  console.log("status :", params.get("status"));
  console.log("isViewMode:", isViewMode);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={isTablet ? 1 : 3}>
        <MDTypography variant="h4" fontWeight="bold" gutterBottom>
          {isViewMode ? "รายละเอียดยืนยันการเบิก Semi FG" : "ยืนยันการเบิก Semi FG"}
        </MDTypography>

        <MDBox mt={3}>
          <Card>
            <MDBox p={{ xs: 2, md: 5 }}>
              <MDBox mt={2}>
                <Grid container alignItems="center">
                  {/* Label: Scan รหัส FG */}
                  <Grid item xs="auto">
                    <MDTypography variant="h6" color="inherit">
                      Scan รหัส Semi FG
                    </MDTypography>
                  </Grid>
                  {/* Input: ช่องกรอกข้อมูล สำหรับสแกนรหัส */}
                  <Grid item xs={8} sm={6} md={4}>
                    <MDInput
                      autoFocus={!isViewMode}
                      name="scan_fg"
                      variant="outlined"
                      value={scanValue}
                      onChange={(e) => setScanValue(e.target.value)}
                      onKeyDown={handleScanEnter}
                      sx={{ width: "300px", maxWidth: "100%", ml: 3 }}
                      disabled={isViewMode}
                      placeholder="สแกนรหัส FG "
                    />
                  </Grid>
                </Grid>
              </MDBox>

              {/* รายละเอียดใบเบิก */}
              <MDBox mt={2} style={borderedContainerStyle}>
                <table style={tableStyle}>
                  <tbody>
                    <tr>
                      <th style={thStyle}>
                        <MDTypography variant="h6" color="inherit">
                          เลขที่ใบนำส่ง
                        </MDTypography>
                      </th>
                      <td style={tdStyle}>{outbsemi_code || "-"}</td>
                      <th style={thStyle}>
                        <MDTypography variant="h6" color="inherit">
                          วันที่
                        </MDTypography>
                      </th>
                      <td style={tdStyle}>{today_date || "-"}</td>
                      <th style={thStyle}>
                        <MDTypography variant="h6" color="inherit">
                          รายละเอียด
                        </MDTypography>
                      </th>
                      <td style={tdStyle}>{outbsemi_details || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </MDBox>

              {/* ตารางสินค้า */}
              <MDBox mt={3} style={borderedContainerStyle}>
                <Box sx={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle} rowSpan={2}>
                          <MDTypography variant="h6" color="inherit">
                            Select
                          </MDTypography>
                        </th>
                        <th style={thStyle} rowSpan={2}>
                          <MDTypography variant="h6" color="inherit">
                            รหัส
                          </MDTypography>
                        </th>
                        <th style={thStyle} rowSpan={2}>
                          <MDTypography variant="h6" color="inherit">
                            ชื่อ
                          </MDTypography>
                        </th>
                        <th style={thStyle} colSpan={3}>
                          <MDTypography variant="body1" fontWeight="bold">
                            ขนาด
                          </MDTypography>
                        </th>
                        <th style={thStyle} rowSpan={2}>
                          <MDTypography variant="h6" color="inherit">
                            จำนวนที่ต้องส่ง
                          </MDTypography>
                        </th>
                        <th style={thStyle} rowSpan={2}>
                          <MDTypography variant="h6" color="inherit">
                            จำนวนที่นับได้
                          </MDTypography>
                        </th>
                        <th style={thStyle} rowSpan={2}>
                          <MDTypography variant="h6" color="inherit">
                            สถานะ
                          </MDTypography>
                        </th>
                      </tr>
                      <tr>
                        <th style={thStyle}>
                          <MDTypography variant="h6" color="inherit">
                            กว้าง
                          </MDTypography>
                        </th>
                        <th style={thStyle}>
                          <MDTypography variant="h6" color="inherit">
                            ยาว
                          </MDTypography>
                        </th>
                        <th style={thStyle}>
                          <MDTypography variant="h6" color="inherit">
                            หนา
                          </MDTypography>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => {
                        const currentCount = Number(item.outbsemiitm_withdr_count) || 0;
                        const requiredQuantity = Number(item.outbsemiitm_quantity) || 0;
                        const isComplete = currentCount === requiredQuantity;
                        return (
                          <tr key={index}>
                            <td style={tdStyle}>
                              <Checkbox
                                checked={selectedItems.some(
                                  (selected) => selected.inbsemi_id === item.inbsemi_id
                                )}
                                disabled
                              />
                            </td>
                            <td style={tdStyle}>{item.inbsemi_code || "-"}</td>
                            <td style={tdStyle}>{item.semiifm_name || "-"}</td>
                            <td style={tdStyle}>{item.semiifm_width || "-"}</td>
                            <td style={tdStyle}>{item.semiifm_length || "-"}</td>
                            <td style={tdStyle}>{item.semiifm_thickness || "-"}</td>
                            <td style={tdStyle}>{item.outbsemiitm_quantity || "-"}</td>
                            <td style={tdStyle}>{item.outbsemiitm_withdr_count || "-"}</td>
                            <td
                              style={{
                                ...tdStyle,
                                background: isComplete ? "#C8E6C9" : "#FFE0B2",
                              }}
                            >
                              {isComplete ? "ครบ" : "ไม่ครบ"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>
              </MDBox>

              <MDBox mt={2}>
                <MDTypography variant="h6" color="inherit">
                  จัดส่ง
                </MDTypography>
              </MDBox>

              <MDBox mt={2} style={borderedContainerStyle}>
                <table style={tableStyle}>
                  <tbody>
                    <tr>
                      <th style={thStyle}>
                        <MDTypography variant="h6" color="inherit">
                          ผู้ส่ง
                        </MDTypography>
                      </th>
                      <td style={tdStyle}>{outbsemi_driver_name || "-"}</td>
                      <th style={thStyle}>
                        <MDTypography variant="h6" color="inherit">
                          ทะเบียนรถ
                        </MDTypography>
                      </th>
                      <td style={tdStyle}>{outbsemi_vehicle_license || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </MDBox>

              <MDBox mt={3} style={borderedContainerStyle}>
                <table style={tableStyle}>
                  <tbody>
                    <tr>
                      <td style={thStyle}>
                        <MDTypography variant="h6" color="inherit">
                          ท่ารถ
                        </MDTypography>
                      </td>
                      <td style={tdStyle}>
                        <MDTypography variant="body02">{tspyard_name || "-"}</MDTypography>
                      </td>
                    </tr>
                    <tr>
                      <td style={thStyle}>
                        <MDTypography variant="h6" color="inherit">
                          เบอร์ติดต่อ
                        </MDTypography>
                      </td>
                      <td style={tdStyle}>
                        <MDTypography variant="body02">{outbsemi_phone || "-"}</MDTypography>
                      </td>
                    </tr>
                    <tr>
                      <td style={thStyle}>
                        <MDTypography variant="h6" color="inherit">
                          ที่อยู่
                        </MDTypography>
                      </td>
                      <td style={tdStyle}>
                        <MDTypography variant="body02">{outbsemi_address || "-"}</MDTypography>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </MDBox>

              {/* ปุ่มย้อนกลับและยืนยัน */}
              <Box display="flex" justifyContent={isTablet ? "center" : "flex-end"} mt={3} gap={2}>
                <ButtonComponent
                  type="return"
                  onClick={handleReturn}
                  sx={{ width: isTablet ? "100%" : "150px" }}
                />

                {!isViewMode && (
                  <ButtonComponent
                    type="ConfirmWithdraw"
                    onClick={handleConfirmWithdraw}
                    disabled={loading}
                  />
                )}
              </Box>
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

export default ConfirmSemiFGWithdraw;
