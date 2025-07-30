import React, { useState, useEffect } from "react";
import { Box, Card, Checkbox, CircularProgress, useMediaQuery, Grid } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import OutBoundFGAPI from "api/OutBoundFgAPI";
import MDInput from "components/MDInput";
import SweetAlertComponent from "../components/sweetAlert";
import ButtonComponent from "../components/ButtonComponent";

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

const ConfirmDelivery = () => {

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const outbfg_id = params.get("outbfg_id");
  const status = params.get("status"); // รับค่า status
  const isViewMode = status === "view"; // เช็คว่าเป็นโหมดดูอย่างเดียว

  const isTablet = useMediaQuery("(max-width: 1024px)");
  const [loading, setLoading] = useState(true);
  const [shipMentData, setShipMentData] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [scanValue, setScanValue] = useState("");
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const navigate = useNavigate();

  const fetchsShipMentData = async () => {
    try {
      const response = await OutBoundFGAPI.getOutBoundFGReqByID(outbfg_id);
      if (response.isCompleted) {
        setShipMentData(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (outbfg_id) {
      fetchsShipMentData();
    }
  }, [outbfg_id]);

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
       // ค้นหารายการที่มี inbfg_code ตรงกับ scannedCode ที่สแกน
      // โดย map รายการที่มี index เพื่อให้ทราบตำแหน่งเดิม
      const matchingItems = shipMentData.items
        .map((item, index) => ({ ...item, index }))
        .filter((item) => item.inbfg_code === scannedCode);

      // หากไม่พบรายการที่ตรงกับรหัสที่สแกน
      if (matchingItems.length === 0) {
        setScanValue("");
        return;
      }

      // เลือกรายการแรกที่ยังไม่ครบ (จำนวนที่นับได้ < จำนวนที่ต้องเบิก)
      const targetItem = matchingItems.find((item) => {
        const currentCount = Number(item.outbfgitm_shipmt_count) || 0;
        const requiredQuantity = Number(item.outbfgitm_quantity) || 0;
        return currentCount < requiredQuantity;
      });

      // หากพบรายการที่ตรง แต่ทั้งหมดครบแล้ว
      if (!targetItem) {
        setScanValue("");
        return;
      }

      // ดึงตำแหน่ง index ของรายการที่ต้องการอัปเดต
      const itemIndex = targetItem.index;
      // ใช้ค่า outbfgitm_withdr_count เป็นค่าสูงสุด (จำนวนที่ต้องส่ง)
      const currentCount = Number(shipMentData.items[itemIndex].outbfgitm_shipmt_count) || 0;
      const maxCount = Number(shipMentData.items[itemIndex].outbfgitm_withdr_count) || 0;
      // ตรวจสอบว่าจำนวนที่นับได้ (outbfgitm_shipmt_count) ยังไม่เกินค่าสูงสุด
      if (currentCount >= maxCount) {
        setScanValue("");
        return;
      }
      const newCount = currentCount + 1;
      // อัปเดตจำนวนในรายการสินค้า
      const updatedItems = [...shipMentData.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        outbfgitm_shipmt_count: newCount,
      };
      setShipMentData({
        ...shipMentData,
        items: updatedItems,
      });

      // 🔁 จากเดิมใช้ inbfg_id → เปลี่ยนเป็น outbfgitm_id
      const selectedExists = selectedItems.some(
        (selected) => selected.outbfgitm_id === updatedItems[itemIndex].outbfgitm_id
      );

      if (!selectedExists) {
        setSelectedItems((prev) => [
          ...prev,
          { outbfgitm_id: updatedItems[itemIndex].outbfgitm_id },
        ]);
      }

      setScanValue("");
    }
  };

  // // ยังคงฟังก์ชัน handleSelectItem ไว้สำหรับเลือกรายการด้วยตนเอง (ถ้าจำเป็น)
  // const handleSelectItem = (id) => {
  //   setSelectedItems((prev) => (prev.includes(id) ? [] : [id]));
  // };

  // ปรับฟังก์ชัน handleConfirmWithdraw ให้สร้าง payload ตามรูปแบบที่ต้องการ
  const handleConfirmWithdraw = async () => {
    if (selectedItems.length === 0) {
      return;
    }

    setLoading(true);

    try {
      // สร้าง payload โดยกรองรายการสินค้าที่ถูกเลือกและ map ค่าให้เป็นรูปแบบ:
      // { inbfg_id, outbfgitm_shipmt_count }
      const payload = {
        items: shipMentData.items
          .filter((item) => selectedItems.some((sel) => sel.outbfgitm_id === item.outbfgitm_id))
          .map((item) => ({
            outbfgitm_id: item.outbfgitm_id, // ✅ เพิ่มตรงนี้
            inbfg_id: item.inbfg_id,
            outbfgitm_shipmt_count: item.outbfgitm_shipmt_count,
          })),
      };

      const response = await OutBoundFGAPI.OutBoundFGShipment(shipMentData.outbfg_id, payload);
      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: "ดำเนินการสำเร็จ",
          message: response.message,
        });
        setTimeout(() => {
          navigate("/confirm");
        }, 1500);
      } else {
        setAlert({
          show: true,
          type: "error",
          title: "เกิดข้อผิดพลาด",
          message: response.message,
        });
      }
      fetchsShipMentData(); // รีเฟรชข้อมูลหลังส่ง API สำเร็จ
    } catch (error) {
      console.error("Error confirming shipment:", error);
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

  if (!shipMentData) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography variant="h6" color="error">
            ไม่พบข้อมูลการส่ง
          </MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  const {
    outbfg_code,
    shipmt_date,
    outbfg_details,
    outbfg_driver_name,
    outbfg_vehicle_license,
    outbfg_phone,
    outbfg_address,
    tspyard_name,
    items,
  } = shipMentData;

  const handleReturn = () => {
    navigate("/confirm");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={isTablet ? 1 : 3}>
        <MDTypography variant="h4" fontWeight="bold" gutterBottom>
          {isViewMode ? "รายละเอียดยืนยันการส่ง" : "ยืนยันการส่ง"}
        </MDTypography>

        <MDBox mt={3}>
          <Card>
            <MDBox p={{ xs: 2, md: 5 }}>
              <MDBox mt={2}>
                <Grid container alignItems="center">
                  {/* Label: Scan รหัส FG */}
                  <Grid item xs="auto">
                    <MDTypography variant="h6" color="inherit">
                      Scan รหัส FG
                    </MDTypography>
                  </Grid>
                  {/* Input: ช่องกรอกข้อมูลสำหรับสแกน */}
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

              {/* รายละเอียดใบส่ง */}
              <MDBox mt={2} style={borderedContainerStyle}>
                <table style={tableStyle}>
                  <tbody>
                    <tr>
                      <th style={thStyle}>
                        <MDTypography variant="h6" color="inherit">
                          เลขที่ใบนำส่ง
                        </MDTypography>
                      </th>
                      <td style={tdStyle}>{outbfg_code || "-"}</td>
                      <th style={thStyle}>
                        <MDTypography variant="h6" color="inherit">
                          วันที่
                        </MDTypography>
                      </th>
                      <td style={tdStyle}>{shipmt_date || "-"}</td>
                      <th style={thStyle}>
                        <MDTypography variant="h6" color="inherit">
                          รายละเอียด
                        </MDTypography>
                      </th>
                      <td style={tdStyle}>{outbfg_details || "-"}</td>
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
                        const currentCount = Number(item.outbfgitm_shipmt_count) || 0;
                        const maxCount = Number(item.outbfgitm_withdr_count) || 0;
                        const isComplete = (maxCount > 0 && currentCount === maxCount);
                        return (
                          <tr key={index}>
                            <td style={tdStyle}>
                              <Checkbox
                                checked={selectedItems.some(
                                  (selected) => selected.outbfgitm_id === item.outbfgitm_id
                                )}
                                // onChange={() => handleSelectItem(item.inbfg_id)}
                                disabled={isViewMode}
                              />
                            </td>
                            <td style={tdStyle}>{item.inbfg_code || "-"}</td>
                            <td style={tdStyle}>{item.fgifm_name || "-"}</td>
                            <td style={tdStyle}>{item.fgifm_width || "-"}</td>
                            <td style={tdStyle}>{item.fgifm_length || "-"}</td>
                            <td style={tdStyle}>{item.fgifm_thickness || "-"}</td>
                            <td style={tdStyle}>{item.outbfgitm_withdr_count ||"-"}</td>
                            <td style={tdStyle}>{item.outbfgitm_shipmt_count ||"-"}</td>
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
                      <td style={tdStyle}>{outbfg_driver_name || "-"}</td>
                      <th style={thStyle}>
                        <MDTypography variant="h6" color="inherit">
                          ทะเบียนรถ
                        </MDTypography>
                      </th>
                      <td style={tdStyle}>{outbfg_vehicle_license || "-"}</td>
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
                        <MDTypography variant="body02">{outbfg_phone || "-"}</MDTypography>
                      </td>
                    </tr>
                    <tr>
                      <td style={thStyle}>
                        <MDTypography variant="h6" color="inherit">
                          ที่อยู่
                        </MDTypography>
                      </td>
                      <td style={tdStyle}>
                        <MDTypography variant="body02">{outbfg_address || "-"}</MDTypography>
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

export default ConfirmDelivery;
