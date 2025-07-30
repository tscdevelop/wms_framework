import React, { useState, useEffect } from "react";
import { Grid, Card, Tabs, Tab } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TableComponent from "../components/table_component";
import OutBoundSemiFGAPI from "api/OutBoundSemiFGAPI";

const ConfirmSemiFG = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0); // เก็บค่าการสลับ Tab
  const [allData, setAllData] = useState([]); // ข้อมูลทั้งหมด

  // ✅ ฟังก์ชันเปลี่ยน Tab
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // ✅ ดึงข้อมูลจาก API เดียว
  const fetchDataAll = async () => {
    try {
      let response;
      if (tabIndex === 1) {
        // สำหรับ " รายการเบิก Semi FG ทั้งหมด" ส่ง withdrawStatus:true ด้วย
        response = await OutBoundSemiFGAPI.getOutBoundSemiAll("APPROVED",false);
       console.log("TAB 1:",response);
      } else {
        // สำหรับ "รายการส่งของทั้งหมด" ไม่ต้องส่ง withdrawStatus
        response = await OutBoundSemiFGAPI.getOutBoundSemiAll("APPROVED",true);
      }
  
      if (response.isCompleted) {
        setAllData(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  

  // ✅ เรียก API เมื่อโหลดหน้า
  useEffect(() => {
    fetchDataAll();
  }, [tabIndex]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8} lg={9}>
            <MDBox mt={2} ml={{ xs: 0, md: 5 }}>
              <MDTypography variant="h3" color="dark" fontWeight="bold">
                ยืนยันการเบิก - ส่งสินค้า Semi FG
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>

        {/* ✅ Content ในแต่ละ Tab */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MDBox mt={3}>
              <Card>
                <MDBox p={{ xs: 2, md: 5 }} sx={{ overflowX: "auto" }}>
                  <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                  >
                    <Tab label="รายการเบิก" />
                    <Tab label="รายการส่งสินค้า" />
                  </Tabs>
                  {tabIndex === 0 && (
                    <TableComponent
                      columns={[
                        { field: "withdr_date", label: "วันที่", width: "5%" },
                        { field: "withdr_time", label: "เวลา", width: "5%" },
                        {
                          field: "outbsemi_code",
                          label: "เลขที่ใบนำส่ง",
                          width: "10%",
                          render: (row) => {
                            const outbsemi_code = row.outbsemi_code;
                            return (
                              <a
                                href={`/confirm-semi-wd?outbsemi_id=${encodeURIComponent(
                                  row.outbsemi_id
                                )}`}
                              >
                                <MDTypography variant="subtitle2" sx={{ color: "blue" }} > {outbsemi_code}</MDTypography>
                              </a>
                            );
                          },
                        },
                        {
                          field: "outbsemiitm_withdr_status",
                          label: "สถานะการเบิก",
                          width: "10%",
                          render: (row) => {
                            let statusText = "";
                            let statusColor = "red"; // กำหนดสีเริ่มต้น
                        
                            if (row.outbsemiitm_withdr_status === "COMPLETED") {
                              statusText = "เบิกสำเร็จ";
                              statusColor = "#4CAF50"; // สีเขียว
                            } else if (row.outbsemiitm_withdr_status === "PARTIAL") {
                              statusText = "เบิกไม่ครบ";
                              statusColor = "#FFA500"; // สีส้ม (ปรับได้ตามต้องการ)
                            } else if (row.outbsemiitm_withdr_status === "PENDING") {
                              statusText = "ยังไม่ได้เบิก";
                              statusColor = "red";
                            }
                        
                            return (
                              <MDTypography
                                variant="subtitle2"
                                component="span"
                                sx={{ color: statusColor }}
                              >
                                {statusText}
                              </MDTypography>
                            );
                          },
                        },
                        
                        {
                          field: "outbsemi_id",
                          width: "10%",
                          render: (row) => (
                            <a
                              href={`/confirm-semi-wd?outbsemi_id=${encodeURIComponent(
                                row.outbsemi_id
                              )}&status=view`}
                              style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
                            >
                              <MDTypography variant="subtitle2" sx={{ color: "blue" }} >ดูรายละเอียด</MDTypography>
                            </a>
                          ),
                        },
                      ]}
                      data={allData}
                      idField="outbsemi_id"
                      showActions={false}
                      searchableColumns={[
                        "withdr_date",
                        "withdr_time",
                        "outbsemi_code",
                        // "outbsemiitm_withdr_status",
                      ]}
                    />
                  )}

                  {tabIndex === 1 && (
                    <TableComponent
                      columns={[
                        { field: "shipmt_date", label: "วันที่สร้างเอกสาร", width: "10%" },
                        { field: "shipmt_time", label: "เวลาที่สร้างเอกสาร", width: "10%" },
                        {
                          field: "shipmt_date_alt",
                          label: "วันที่ต้องนำส่ง",
                          width: "10%",
                          render: (row) => row.shipmt_date,
                        },
                        {
                          field: "outbsemi_code",
                          label: "เลขที่ใบนำส่ง",
                          width: "10%",
                          render: (row) => {
                            const outbsemi_code = row.outbsemi_code;
                            return (
                              <a
                                href={`/confirm-semi-deli?outbsemi_id=${encodeURIComponent(
                                  row.outbsemi_id
                                )}`}
                              >
                                <MDTypography variant="subtitle2" sx={{ color: "blue" }} > {outbsemi_code}</MDTypography>
                              </a>
                            );
                          },
                        },
                        { field: "outbsemi_details", label: "รายละเอียด", width: "20%" },
                        {
                          field: "outbsemiitm_shipmt_status",
                          label: "สถานะการส่ง",
                          width: "10%",
                          render: (row) => {
                            let statusText = "";
                            let statusColor = "red"; // กำหนดสีเริ่มต้น
                        
                            if (row.outbsemiitm_shipmt_status === "COMPLETED") {
                              statusText = "ส่งสำเร็จ";
                              statusColor = "#4CAF50"; // สีเขียว
                            } else if (row.outbsemiitm_shipmt_status === "PARTIAL") {
                              statusText = "ส่งไม่ครบ";
                              statusColor = "#FFA500"; // สีส้ม (ปรับได้ตามต้องการ)
                            } else if (row.outbsemiitm_shipmt_status === "PENDING") {
                              statusText = "ยังไม่ได้ส่ง";
                              statusColor = "red";
                            }
                        
                            return (
                              <MDTypography
                                variant="subtitle2"
                                component="span"
                                sx={{ color: statusColor }}
                              >
                                {statusText}
                              </MDTypography>
                            );
                          },
                        },
                        
                        {
                          field: "outbsemi_id",
                          width: "15%",
                          render: (row) => (
                            <a
                              href={`/confirm-semi-deli?outbsemi_id=${encodeURIComponent(
                                row.outbsemi_id
                              )}&status=view`}
                              style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
                            >
                              <MDTypography variant="subtitle2" sx={{ color: "blue" }} >ดูรายละเอียด</MDTypography>
                            </a>
                          ),
                        },
                      ]}
                      data={allData}
                      idField="outbsemi_id"
                      showActions={false}
                      searchableColumns={[
                        "shipmt_date",
                        "shipmt_time",
                        "outbsemi_code",
                        "outbsemi_details",
                        // "outbsemiitm_shipmt_status",
                      ]}
                    />
                  )}
                </MDBox>
              </Card>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default ConfirmSemiFG;
