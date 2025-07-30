import React, { useState, useEffect, useRef } from "react";
import { Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import OutBoundRawAPI from "api/OutBoundRawAPI";
import { useLocation, useNavigate } from "react-router-dom";
import TableComponent from "../components/table_component";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
const Withdraw = () => {
  //ตั้ง cursor
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const outbrm_id = params.get("outbrm_id");
  console.log("outbrm_id", outbrm_id);

  const navigate = useNavigate(); // เรียกใช้ hook สำหรับการนำทาง

  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    outbrm_id: "",
    outbrm_code: "",
    outbrm_details: "",
    inbrm_name: "",
    outbrm_quantity: "",
    outbrm_scan_count: "",
    outrm_is_withdr: "",
    scanRawMaterial: "",
  });
  const [withdrawAll, setWithdrawAll] = useState([]);
  // State สำหรับเก็บรายการสแกนที่ยังไม่ได้ส่ง API
  const [pendingScans, setPendingScans] = useState({});

  const fetchDataAll = async (code) => {
    try {
      const response = await OutBoundRawAPI.getOutBoundRawByID(code);
      console.log("Response from getOutBoundRawRecByCode:", response);

      if (response.isCompleted && response.data) {
        const data = response.data;
        // ดึงข้อมูลจาก items เพื่อนำไปแสดงใน Table
        setWithdrawAll(data.items || []);

        // ตั้งค่าข้อมูลในฟอร์มจาก response
        if (data.items.length > 0) {
          setForm((prev) => ({
            ...prev,
            outbrm_code: data.outbrm_code || "",
            outbrm_details: data.outbrm_details || "",
          }));

          // ดึงค่า inbrm_id จาก items
          const inbrmIdList = data.items.map((item) => item.inbrm_id);
          console.log("inbrmIdList:", inbrmIdList);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // เมื่อกด Enter ในช่อง scan จะทำการ validate และอัปเดต local state เท่านั้น
  const handleScanEnter = (e) => {
    if (e.key !== "Enter") return;

    const { scanRawMaterial } = form;
    if (!scanRawMaterial) {
      return;
    }

    let scannedCode = scanRawMaterial; // ค่าเริ่มต้นคือค่าที่ป้อนมา

    try {
      // พยายามแปลงเป็น JSON หากเป็นข้อมูล JSON
      const scannedData = JSON.parse(scanRawMaterial);
      if (scannedData && scannedData.code) {
        scannedCode = scannedData.code;
      }
    } catch (error) {
      // ถ้าไม่ใช่ JSON (อาจเป็นรหัสที่พิมพ์ตรงๆ) ก็ใช้ scanRawMaterial ตรงๆ
    }

    // ค้นหารายการที่มี inbrm_code ตรงกับค่าที่ได้
    const foundItem = withdrawAll.find((item) => item.inbrm_code === scannedCode);

    if (!foundItem) {
      console.error("ไม่พบรหัส Raw Material ที่สแกน");
      return;
    }

    // ตรวจสอบว่า outbrmitm_issued_count ไม่เกิน outbrmitm_quantity
    if (Number(foundItem.outbrmitm_issued_count) >= Number(foundItem.outbrmitm_quantity)) {
      console.error("จำนวนเบิกเกินที่กำหนด");
      return;
    }

    // อัปเดต pendingScans เพิ่มจำนวนสำหรับ inbrm_id ที่พบ
    setPendingScans((prev) => {
      const currentCount = prev[foundItem.inbrm_id] || 0;
      return { ...prev, [foundItem.inbrm_id]: currentCount + 1 };
    });

    // อัปเดต withdrawAll ให้เพิ่ม outbrmitm_issued_count เพื่อแสดงผลทันทีในตาราง
    setWithdrawAll((prev) =>
      prev.map((item) => {
        if (item.inbrm_id === foundItem.inbrm_id) {
          return {
            ...item,
            outbrmitm_issued_count: Number(item.outbrmitm_issued_count) + 1,
          };
        }
        return item;
      })
    );

    // เคลียร์ค่าในช่อง scan
    setForm((prev) => ({ ...prev, scanRawMaterial: "" }));
  };

  // ฟังก์ชันสำหรับส่งข้อมูล pendingScans ไปยัง API เมื่อกดปุ่ม Finish
  const handleAddScan = async () => {
    if (!outbrm_id) {
      return;
    }
    if (Object.keys(pendingScans).length === 0) {
      return;
    }
    try {
      // กรองเฉพาะ item ที่มีค่า outbrmitm_issued_count มากกว่า 0
      const items = withdrawAll
        .filter(item => item.outbrmitm_issued_count > 0)
        .map(item => ({
          inbrm_id: item.inbrm_id,
          outbrmitm_issued_count: item.outbrmitm_issued_count,
        }));
  
      const payload = { items };
  
      console.log("Payload: ", payload);
  
      // ส่ง payload ไปที่ API
      const response = await OutBoundRawAPI.WithdrawScan(outbrm_id, payload);
  
      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: "ดำเนินการสำเร็จ",
          message: response.message,
        });

        setTimeout(() => {
          navigate("/pickupwithdraw");
        }, 1500);
      } else {
        setAlert({
          show: true,
          type: "error",
          title: "เกิดข้อผิดพลาด",
          message: response.message,
        });
      }
      // เคลียร์ pendingScans หลังจากส่งข้อมูลเสร็จ
      setPendingScans({});
      // รีเฟรชข้อมูลจาก API
      fetchDataAll(outbrm_id);
    } catch (error) {
      console.error("Error sending scan data:", error);
    }
  };
  
  

  // ฟังก์ชันสำหรับย้อนกลับไปที่ /pickupwithdraw
  const handleReturn = () => {
    navigate("/pickupwithdraw");
  };

  useEffect(() => {
    if (outbrm_id) {
      fetchDataAll(outbrm_id);
    }
  }, [outbrm_id]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={{ xs: 2, md: 3, lg: 4 }}>
        <MDBox mt={{ xs: 3, md: 5 }}>
          <Card>
            <MDBox mt={3} p={{ xs: 2, md: 3 }}>
              <Grid container spacing={2}>
                {/* ฝั่งซ้าย */}
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    {/* เลขที่ใบเบิก */}
                    <Grid item xs={12} sm={4}>
                      <MDBox
                        display="flex"
                        justifyContent={{ xs: "flex-start", md: "flex-end" }}
                        alignItems="center"
                        height="100%"
                      >
                        <MDTypography variant="h6" color="inherit">
                          เลขที่ใบเบิก
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <MDInput
                        name="outbrm_code"
                        variant="outlined"
                        value={form.outbrm_code}
                        onChange={handleInputChange}
                        sx={{ width: "300px", maxWidth: "100%" }}
                        disabled
                      />
                    </Grid>

                    {/* Scan รหัส Raw Material */}
                    <Grid item xs={12} sm={5.5}>
                      <MDBox
                        display="flex"
                        justifyContent={{ xs: "flex-start", md: "flex-end" }}
                        alignItems="center"
                        height="100%"
                      >
                        <MDTypography variant="h6" color="inherit" >
                          Scan รหัส Raw Material
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6.5}>
                      <MDInput
                        name="scanRawMaterial"
                        variant="outlined"
                        value={form.scanRawMaterial}
                        onChange={handleInputChange}
                        onKeyDown={handleScanEnter}
                        sx={{ width: "300px", maxWidth: "100%" }}
                        inputRef={inputRef} // ✅ เพิ่ม inputRef ที่นี่
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* ฝั่งขวา */}
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    {/* รายละเอียด */}
                    <Grid item xs={12} sm={4}>
                      <MDBox
                        display="flex"
                        justifyContent={{ xs: "flex-start", md: "flex-end" }}
                        alignItems="center"
                        height="100%"
                      >
                        <MDTypography variant="h6" color="inherit">
                          รายละเอียด
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <MDInput
                        name="outbrm_details"
                        variant="outlined"
                        value={form.outbrm_details}
                        onChange={handleInputChange}
                        sx={{ width: "300px", maxWidth: "100%" }}
                        disabled
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </MDBox>

            {/* ตารางข้อมูล */}
            <MDBox p={{ xs: 2, md: 5 }} sx={{ overflowX: "auto" }}>
              <Card>
                <TableComponent
                  columns={[
                    {
                      field: "inbrm_code",
                      label: "รหัส Raw Material",
                      width: "20%",
                    },
                    {
                      field: "rmifm_name",
                      label: "รายการ",
                      width: "25%",
                    },
                    {
                      field: "outbrmitm_quantity",
                      label: "จำนวนที่ต้องเบิก",
                      width: "15%",
                    },
                    {
                      field: "outbrmitm_issued_count",
                      label: "จำนวนที่รับจริง",
                      width: "15%",
                    },
                    {
                      field: "outbrmitm_withdr_status",
                      label: "สถานะ",
                      width: "15%",
                      render: (row) => {
                        const issuedCount = Number(row.outbrmitm_issued_count);
                        const requiredQuantity = Number(row.outbrmitm_quantity);
                        const isComplete = issuedCount === requiredQuantity;

                        return (
                          <span
                            style={{
                              color: isComplete ? "#4CAF50" : "#F44336",
                              fontWeight: "bold",
                            }}
                          >
                            {isComplete ? "ครบ" : "ไม่ครบ"}
                          </span>
                        );
                      },
                    },
                  ]}
                  data={withdrawAll}
                  idField="outbrm_id"
                  showActions={false}
                />
              </Card>
            </MDBox>

            {/* ปุ่มทางลัด */}
            <MDBox mt={3} p={3}>
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item>
                  <ButtonComponent type="return" onClick={handleReturn} />
                </Grid>
                <Grid item>
                  <ButtonComponent type="finish" onClick={handleAddScan} />
                </Grid>
              </Grid>
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

export default Withdraw;
