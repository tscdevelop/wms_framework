import React, { useState, useEffect } from "react";
import { Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TableComponent from "../components/table_component";

import NotificationAPI from "api/NotificationAPI";

const NotiTooling = () => {
  
  const [NotiApprove, setNotiApprove] = useState([]); // ข้อมูลทั้งหมด
   // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);


  const fetchDataAll = async () => {
    try {
      const response = await NotificationAPI.getNotifToolAll();
      console.log("API Response:", response);
  
      if (response.isCompleted && Array.isArray(response.data.details)) {
        setNotiApprove(response.data.details);  // ✅ ใช้ `data.details`
      } else {
        console.error("Response data is not an array:", response.data);
        setNotiApprove([]); // ป้องกัน error
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      setNotiApprove([]); // ป้องกัน crash
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchDataAll();
  }, []);



  // คอลัมน์สำหรับ TableComponent
  const columns = [
    { field: "date", label: "วันที่", width: "13%" },
    { field: "time", label: "เวลา", width: "13%" },
    { field: "code", label: "เลขที่ใบเบิก/ใบนำส่ง", width: "13%" },
    { field: "name", label: "ชื่อสินค้า", width: "20%" },
    { field: "details", label: "รายละเอียด", width: "20%" },
    
  
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="dark" fontWeight="bold">
            แจ้งเตือน / แจ้งเตือนเครื่องมือ-อุปกรณ์
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
                data={Array.isArray(NotiApprove) ? NotiApprove : []}  // ✅ ป้องกัน error
                idField="outbtlitm_id"
                showActions={false}
                searchableColumns={[
                  "date",
                  "time",
                  "code",
                  "name",
                  "details"

                ]}
              />
              </Card>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
};

export default NotiTooling;
