import React, { useState, useEffect } from "react"; 
import { Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationAPI from "api/NotificationAPI";
import TableComponent from "../components/table_component";

import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
const NotiAppWithdraw = () => {
  const [Form, setForm] = useState({
    noti_code: "",      // จะแสดงเลขที่ใบเบิก
    noti_details: "",   // จะแสดงรายละเอียด
    items: []           // รายการ (items) ที่ดึงมาจาก API
  });
    const [alert, setAlert] = useState({
      show: false,
      type: "success",
      title: "",
      message: "",
    });
 
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const approvalStatus = params.get("approvalStatus") || "";



  useEffect(() => {
    const code = params.get("notif_id");
    if (code) {
      fetchNotiApporve(code); // เรียก API ดึงข้อมูล
    }
  }, [location.search]);

  const fetchNotiApporve = async (notif_id) => {
    try {
      const response = await NotificationAPI.getNotifByID(notif_id);
      console.log("API Response:", response);
  
      if (response.isCompleted) {
        // ดึงข้อมูลจาก API ตาม Swagger: { code, details, items }
        const { code, details, items } = response.data;
        
        // แปลงค่าใน items โดยการดึง bom_number จาก bom object
        const mappedItems = Array.isArray(items)
          ? items.map(item => ({
              ...item,
              bom: item.bom && item.bom.bom_number ? item.bom.bom_number : "", // แสดงเป็น string
              remaining: approvalStatus === "APPROVED" ? item.inb_quantity : item.remaining
            }))
          : [];
  
        setForm((prevState) => ({
          ...prevState,
          noti_code: code || "",
          noti_details: details || "",
          items: mappedItems,
        }));
      } else {
        console.error("Response is not completed or data is missing");
      }
    } catch (error) {
      console.error("Error fetching outbound raw data:", error);
    }
  };
  

  // ฟังก์ชัน submit สำหรับ Approve/Reject
  const handleSubmit = async (approvalStatus) => {
    const notif_id = params.get("notif_id");
    const payload = {
      notif_id,
      approvalStatus
    };

    try {
      const response = await NotificationAPI.CreateNotif(payload);
      console.log("CreateNotif Response:", response);
      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: "ดำเนินการสำเร็จ", 
          message: response.message,
        });
        
        setTimeout(() => {
          navigate("/noti/notiapprove"); // เปลี่ยน path หลังจาก 2 วินาที
        }, 2000);

      } else {
        setAlert({
          show: true,
          type: "error",
          title: "เกิดข้อผิดพลาด", 
          message: response.message,
        });
      }
    } catch (error) {
      console.error("Error during createNotif:", error);
      
    }
  };

  useEffect(() => {
    console.log("Form items:", Form.items);
  }, [Form.items]);



  
        const handleReturn = () =>{
            navigate("/noti/notiapprove");
        };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="inherit" fontWeight="bold">
               แจ้งเตือนอนุมัติคำร้อง
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
                      name="noti_code"
                      value={Form.noti_code || ""}
                      disabled
                    />
                  </MDBox>
                </Grid>

                <Grid item xs={12} md={8}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 2 }}>
                    <MDTypography variant="h6" color="inherit">
                      รายละเอียด
                    </MDTypography>
                    <MDInput
                      sx={{ width: "500px", maxWidth: "100%" }}
                      name="noti_details"
                      value={Form.noti_details || ""}
                      disabled
                    />
                  </MDBox>
                </Grid>

                <Grid item xs={12}>
                  <MDBox p={5}>
                    <Card>
                      <TableComponent
                        columns={[
                          { field: "bom", label: "BOM", width: "15%" },
                          { field: "code_name", label: "รายการสินค้า", width: "25%" },
                          { field: "inb_quantity", label: "จำนวนในคลัง", width: "15%" },
                          { field: "out_quantity", label: "จำนวน", width: "20%" },
                          { field: "remaining", label: "จำนวนคงเหลือในคลัง", width: "20%" }
                        ]}
                        data={Array.isArray(Form.items) ? Form.items : []}
                        idField="inb_id"
                        showActions={false}
                      />
                    </Card>
                  </MDBox>
                </Grid>

                <Grid container>
                  <Grid item xs={12}>
                    {/* แสดงเฉพาะปุ่ม Return ถ้า approvalStatus เป็น "APPROVED" หรือ "REJECTED" */}
                    {approvalStatus === "APPROVED" || approvalStatus === "REJECTED" ? (
                      <MDBox
                        mt={6}
                        display="flex"
                        justifyContent="flex-end"
                      >
                        <ButtonComponent 
                          type="return" 
                          sx={{ px: 4, width: { xs: "100%", sm: "auto" } }}
                          onClick={handleReturn}
                        />
                      </MDBox>
                    ) : (
                      <MDBox
                        mt={6}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        flexWrap="wrap"
                        gap={2}
                      >
                        <ButtonComponent 
                          type="return" 
                          sx={{ px: 4, width: { xs: "100%", sm: "auto" } }}
                          onClick={handleReturn}
                        />
                        <MDBox
                          display="flex"
                          gap={2}
                          ml={{ xs: 0, md: "auto" }}
                          flexDirection={{ xs: "column", sm: "row" }}
                          width={{ xs: "100%", sm: "auto" }}
                        >
                          <ButtonComponent 
                            type="rejected" 
                            sx={{ px: 4, width: { xs: "100%", sm: "auto" } }}
                            onClick={() => handleSubmit("REJECTED")}
                          />
                          <ButtonComponent 
                            type="Approve" 
                            sx={{ px: 4, width: { xs: "100%", sm: "auto" } }}
                            onClick={() => handleSubmit("APPROVED")}
                          />
                        </MDBox>
                      </MDBox>
                    )}
                  </Grid>
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
        onConfirm={() => setAlert({ ...alert, show: false , title: "", })}
      />
    </DashboardLayout>
  );
};

export default NotiAppWithdraw;
