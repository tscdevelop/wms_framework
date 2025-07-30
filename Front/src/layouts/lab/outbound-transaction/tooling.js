import React, { useState, useEffect } from "react";
import { Box, Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import TableComponent from "../components/table_component";
import OutBoundToolingAPI from "api/OutboundToolingAPI";
import "jspdf-autotable";
import { GlobalVar } from "../../../common/GlobalVar";

const OutbTranTooling = () => {
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
      const response = await OutBoundToolingAPI.getOutBoundTLAll();
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
  const getReturnBadge = (status) => {
    let badgeColor;
    let badgeContent;
    if (status === "RETURNED") {
      badgeColor = "#28a745"; // สีเขียว
      badgeContent = "คืนครบ";
    } else if (status === "PARTIAL_RETURNED") {
      badgeColor = "#fd7e14"; // สีส้ม
      badgeContent = "คืนไม่ครบ";
    } else if (status === "NOT_RETURNED") {
      badgeColor = "#dc3545"; // สีแดง
      badgeContent = "ไม่คืน";
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

  const [searchFilters, setSearchFilters] = useState({});

  const handleExport = async () => {
    try {
      setLoading(true); // แสดงสถานะ loading
      const response = await OutBoundToolingAPI.ExportOutbTL(searchFilters); // เรียกใช้ API

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
            Outbound Transaction / เบิก-คืน Tooling
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
                    { field: "create_date", label: "วันที่เบิกของ", width: "7%" },
                    { field: "create_time", label: "เวลาเบิกของ", width: "7%" },
                    { field: "return_date", label: "วันที่คืนของ", width: "7%" },
                    { field: "return_time", label: "เวลาคืนของ", width: "7%" },
                    { field: "outbtl_code", label: "เลขที่ใบเบิก", width: "10%" },
                    { field: "outbtl_details", label: "รายละเอียด", width: "15%" },
                    {
                      field: "outbtl_appr_status",
                      label: "สถานะคำร้อง",
                      width: "8%",
                      render: (row) => {
                        return (
                          <Box display="flex" justifyContent="center" alignItems="center">
                            {getStatusBadge(row.outbtl_appr_status)}
                          </Box>
                        );
                      },
                    },
                    {
                      field: "outbtl_return_status",
                      label: "สถานะคืน",
                      width: "15%",
                      render: (row) => {
                        return (
                          <Box display="flex" justifyContent="center" alignItems="center">
                            {getReturnBadge(row.outbtl_return_status)}
                          </Box>
                        );
                      },
                    },
                   

                    { field: "outbtl_issued_by", label: "ผู้ทำเรื่องเบิก", width: "8%" },
                    { field: "outbtl_returned_by", label: "ผู้ทำเรื่องคืน", width: "8%" },
                  ]}
                  showPostActionColumn={true} // ถ้าเปลี่ยนเป็น false จะไม่แสดงคอลัมน์หลัง Action
                  postActionColumn={{
                    field: "outbtl_id",
                    width: "15%",
                    render: (row) => {
                      const outbtl_id = row.outbtl_id;
                      return (
                        <a
                          href={`/outbtran-tooling-details?outbtl_id=${encodeURIComponent(
                            outbtl_id
                          )}`}
                          style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
                        >
                          <MDTypography variant="subtitle2" sx={{ color: "blue" }}>ดูรายละเอียด</MDTypography>
                        </a>
                      );
                    },
                  }}
                  data={outboundAll}
                  idField="outbtl_id"
                  showActions={false}
                  searchableColumns={[
                    "create_date",
                    "create_time",
                    "return_date",
                    "return_time",
                    "outbtl_code",
                    "outbtl_details",
                    "outbtl_issued_by",
                    "outbtl_returned_by"
                  ]}
                  hiddenActions={["settings", "barcode"]}
                  actionOrder={["print", "edit", "delete"]}
                  userRole={role}
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
export default OutbTranTooling;
