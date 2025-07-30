import React, { useState, useEffect } from "react";
import { Box, Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import TableComponent from "../components/table_component";
import OutBoundSemiFGAPI from "api/OutBoundSemiFGAPI";
import "jspdf-autotable";
import { GlobalVar } from "../../../common/GlobalVar";

const OutbTranSemiFG = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [outboundAll, setOutboundAll] = useState([]); // ข้อมูลทั้งหมด
  const [role, setRole] = useState("");

  useEffect(() => {
    const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
    setRole(userRole);
  }, []);

  const fetchDataAll = async () => {
    try {
      const response = await OutBoundSemiFGAPI.getOutbSemiAll();
      console.log("factory All :", response);

      if (response.isCompleted) {
        const data = response.data;
        setOutboundAll(data);
      }
    } catch (error) {
      console.error("Error fetching  data : ", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDataAll();
  }, []);

  const getStatusBadge = (status) => {
    let badgeColor;
    let badgeContent;
    if (status === "APPROVED") {
      badgeColor = "#28a745"; // สีเขียว
      badgeContent = "อนุมัติแล้ว";
    } else if (status === "PENDING") {
      badgeColor = "#fd7e14"; // สีส้ม
      badgeContent = "รออนุมัติ";
    } else if (status === "REJECTED") {
      badgeColor = "#dc3545"; // สีแดง
      badgeContent = "ไม่อนุมัติ";
    } else {
      badgeColor = "#6c757d"; // สีเทาสำหรับกรณีอื่น ๆ (ถ้ามี)
      badgeContent = status;
    }
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{
          width: "100%",
          color: badgeColor,
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        {badgeContent}
      </Box>
    );
  };

  const getStatusWithDrawBadge = (status) => {
    let badgeColor;
    let badgeContent;
    if (status === "COMPLETED") {
      badgeColor = "#28a745"; // สีเขียว
      badgeContent = "เบิกเเล้ว";
    } else if (status === "PENDING") {
      badgeColor = "#dc3545"; // สีแดง
      badgeContent = "ยังไม่ได้เบิก";
    } else if (status === "PARTIAL") {
      badgeColor = "#fd7e14"; // สีส้ม
      badgeContent = "เบิกไม่ครบ";
    } else {
      badgeColor = "#6c757d"; // สีเทาสำหรับกรณีอื่น ๆ (ถ้ามี)
      badgeContent = status;
    }
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{
          width: "100%",
          color: badgeColor,
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        {badgeContent}
      </Box>
    );
  };

  const getStatusSendBadge = (status) => {
    let badgeColor;
    let badgeContent;
    if (status === "COMPLETED") {
      badgeColor = "#28a745"; // สีเขียว
      badgeContent = "ส่งเเล้ว";
    } else if (status === "PENDING") {
      badgeColor = "#dc3545"; // สีแดง
      badgeContent = "ยังไม่ได้ส่ง";
    } else if (status === "PARTIAL") {
      badgeColor = "#fd7e14"; // สีส้ม
      badgeContent = "ส่งไม่ครบ";
    } else {
      badgeColor = "#6c757d"; // สีเทาสำหรับกรณีอื่น ๆ (ถ้ามี)
      badgeContent = status;
    }

    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{
          width: "100%", // ทำให้ข้อความอยู่ตรงกลาง
          color: badgeColor, // กำหนดสีของข้อความ
          fontWeight: "bold", // ทำให้ข้อความหนา
          fontSize: "14px", // กำหนดขนาดฟอนต์
        }}
      >
        {badgeContent}
      </Box>
    );
  };

  const [searchFilters, setSearchFilters] = useState({});

  const handleExport = async () => {
    try {
      setLoading(true); // แสดงสถานะ loading
      const response = await OutBoundSemiFGAPI.ExportOutbSemiFG(searchFilters); // เรียกใช้ API

      if (response.isCompleted) {
        return;
      }
    } catch (error) {
      console.error("❌ Error during export:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="dark" fontWeight="bold">
            Outbound Transaction / เบิก Semi FG
          </MDTypography>
        </MDBox>

        <MDBox mt={5}>
          <Card>
            <MDBox mt={3} p={3}>
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item>
                  <ButtonComponent type="export" onClick={handleExport} />
                </Grid>
              </Grid>
            </MDBox>

            <MDBox p={5}>
              <Card>
                <TableComponent
                  columns={[
                    { field: "formatted_date", label: "วันที่", width: "10%" },
                    { field: "create_time", label: "เวลา", width: "10%" },
                    { field: "outbsemi_code", label: "เลขที่ใบเบิก", width: "15%" },
                    { field: "outbsemi_details", label: "รายละเอียด", width: "30%" },
                    {
                      field: "outbsemi_appr_status",
                      label: "สถานะอนุมัติ",
                      width: "10%",
                      render: (row) => (
                        <Box display="flex" justifyContent="center" alignItems="center">
                          {getStatusBadge(row.outbsemi_appr_status)}
                        </Box>
                      ),
                    },
                    {
                      field: "outbsemiitm_withdr_status",
                      label: "สถานะเบิก",
                      width: "10%",
                      render: (row) => (
                        <Box display="flex" justifyContent="center" alignItems="center">
                          {getStatusWithDrawBadge(row.outbsemiitm_withdr_status)}
                        </Box>
                      ),
                    },
                    {
                      field: "outbsemiitm_shipmt_status",
                      label: "สถานะจัดส่ง",
                      width: "10%",
                      render: (row) => (
                        <Box display="flex" justifyContent="center" alignItems="center">
                          {getStatusSendBadge(row.outbsemiitm_shipmt_status)}
                        </Box>
                      ),
                    },
                  ]}
                  showPostActionColumn={true} // ถ้าเปลี่ยนเป็น false จะไม่แสดงคอลัมน์หลัง Action
                  postActionColumn={{
                    field: "outbsemi_id ",
                    width: "15%",
                    render: (row) => {
                      const bomCode = row.outbsemi_id;
                      return (
                        <a
                          href={`/outbtran-semi-details?outbsemi_id=${encodeURIComponent(bomCode)}`}
                          style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
                        >
                          <MDTypography variant="subtitle2" sx={{ color: "blue" }}>ดูรายละเอียด</MDTypography>
                        </a>
                      );
                    },
                  }}
                  data={outboundAll}
                  idField="outbsemi_id"
                  userRole={role}
                  showActions={false}
                  hiddenActions={["settings", "barcode"]}
                  actionOrder={["print", "edit", "delete"]}
                  searchableColumns={[
                    "formatted_date",
                    "create_time",
                    "outbsemi_code",
                    "outbsemi_details"
                  ]}
                  onFilterChange={setSearchFilters} // ส่งฟังก์ชันไปเพื่อรับค่าค้นหา
                />
              </Card>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
};
export default OutbTranSemiFG;
