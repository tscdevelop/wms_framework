import React, { useState, useEffect } from "react";
import { Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import SweetAlertComponent from "../components/sweetAlert";
import MDTypography from "components/MDTypography";

import TableComponent from "../components/table_component";
import { GlobalVar } from "../../../common/GlobalVar";

import NotificationAPI from "api/NotificationAPI";

const NotiApprove = () => {
  const [NotiApprove, setNotiApprove] = useState([]); // ข้อมูลทั้งหมด
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const [role, setRole] = useState("");


  useEffect(() => {
    const userRole = GlobalVar.getRole(); // ดึง Role จาก GlobalVar
    setRole(userRole);
  }, []);

  const fetchDataAll = async () => {
    try {
      const response = await NotificationAPI.getNotifReqAll();
      if (response.isCompleted) {
        setNotiApprove(response.data);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataAll();
  }, []);


// ฟังก์ชันสำหรับอัปเดตสถานะ (Approve/Reject)
const handleUpdateStatus = async (notif_id, newStatus) => {
  const payload = {
    notif_id,
    approvalStatus: newStatus,
  };

  try {
    const response = await NotificationAPI.CreateNotif(payload);
    console.log("Update Status Response:", response);
    
    if (response.isCompleted) {
      setAlert({
        show: true,
        type: "success",
        title: "ดำเนินการสำเร็จ",
        message: response.message,
      });

      // รีเฟรชข้อมูลหลังจากการอัปเดตเสร็จสิ้น
      await fetchDataAll();
    } else {
      setAlert({
        show: true,
        type: "error",
        title: "เกิดข้อผิดพลาด",
        message: response.message,
      });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    setAlert({
      show: true,
      type: "error",
      title: "Error",
      message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ",
    });
  }


  };

  // ฟังก์ชันสำหรับเมื่อผู้ใช้คลิกที่ field is_approved (จะเรียก API ส่งค่า PENDING)
  // const handleStatusClick = async (notif_id, currentStatus) => {
  //   // ให้คลิกได้เฉพาะเมื่อสถานะเป็น PENDING
  //   if (currentStatus === "PENDING") {
  //     // ในกรณีนี้ หากกดที่ status แล้วส่งค่า PENDING (อาจใช้เพื่อ re-submit notification)
  //     await handleUpdateStatus(notif_id, "PENDING");
  //   }
  // };

  // คอลัมน์สำหรับ TableComponent
  const columns = [
    { field: "date", label: "วันที่", width: "13%" },
    { field: "time", label: "เวลา", width: "13%" },
    { field: "code", label: "เลขที่ใบเบิก/ใบนำส่ง", width: "13%" },
    { field: "details", label: "รายละเอียด", width: "20%" },
    {
      field: "is_approved",
      label: "สถานะ",
      width: "15%",
      render: (row) => {
        let displayText = "";
        let color = "black";
        if (row.is_approved === "APPROVED") {
          displayText = "อนุมัติแล้ว";
          color = "green";
        } else if (row.is_approved === "REJECTED") {
          displayText = "ไม่อนุมัติ";
          color = "red";
        } else if (row.is_approved === "PENDING") {
          displayText = "รออนุมัติ";
          color = "orange";
        }
        return (
          <span style={{ color, cursor: "default" }}>
            {displayText}
          </span>
        );
      },
    },
    {
      field: "action",
      label: "การอนุมัติ",
      width: "15%",
      render: (row) => {
        const isApproved = row.is_approved === "APPROVED";
    
        return (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            {isApproved ? (
              <button
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  color: "red",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
                onClick={async () => {
                  await handleUpdateStatus(row.notif_id, "PENDING");
                }}
              >
                ยกเลิกอนุมัติ
              </button>
            ) : (
              <span style={{ color: "gray", fontSize: "1rem", fontWeight: "bold" }}>
                ยกเลิกอนุมัติ
              </span>
            )}
          </div>
        );
      },
    },
    
    
    
    {
      field: "notif_id",
      label: "รายละเอียด",
      width: "15%",
      render: (row) => {
        const notifId = row.notif_id;
        const approvalStatus = row.is_approved; // ส่งค่า approvalStatus จาก row
        return (
          <a
            href={`/noti-app-withdraw?notif_id=${encodeURIComponent(notifId)}&approvalStatus=${encodeURIComponent(approvalStatus)}`}
            style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
          >
            <MDTypography variant="subtitle2"  sx={{ color: "blue" }}>ดูรายละเอียด</MDTypography>
          </a>
        );
      },
    },
    
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="dark" fontWeight="bold">
            แจ้งเตือน / แจ้งเตือนอนุมัติคำร้อง
          </MDTypography>
        </MDBox>
        <MDBox mt={5}>
          <Card>
            <MDBox mt={3} p={3}>
              <MDTypography
                variant="h4"
                fontWeight="bold"
                color="warning"
                gutterBottom
                
              >
                รายละเอียดแจ้งเตือน
              </MDTypography>
            </MDBox>
            <MDBox p={5}>
              <Card>
                <TableComponent
                  columns={columns}
                  data={NotiApprove}
                  idField="notif_id"
                  showActions={false}
                  userRole={role}
                />
              </Card>
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

export default NotiApprove;
