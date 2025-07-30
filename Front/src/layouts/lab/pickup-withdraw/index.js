import React, { useState, useEffect } from "react";
import { Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TableComponent from "../components/table_component";
import OutBoundRawAPI from "api/OutBoundRawAPI";

const PickupWithdraw = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [PickAll, setPickAll] = useState([]); // ข้อมูลทั้งหมด


  const fetchDataAll = async () => {
    try {
      const response = await OutBoundRawAPI.getOutBoundRawAll("APPROVED");
      if (response.isCompleted) {
        const data = response.data;
        setPickAll(data);
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



  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8} lg={9}>
            <MDBox mt={2} ml={{ xs: 0, md: 5 }}>
              <MDTypography variant="h3" color="dark" fontWeight="bold">
                รายการรับ Raw Material
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MDBox mt={5}>
              <Card>
                <MDBox p={{ xs: 2, md: 5 }} sx={{ overflowX: "auto" }}>
                  <Card>
                    <TableComponent
                      columns={[
                        { field: "withdr_date", label: "วันที่", width: "10%" },
                        { field: "withdr_time", label: "เวลา", width: "10%" },
                        { field: "outbrm_code", label: "เลขที่ใบเบิก", width: "15%" },
                        { field: "outbrm_details", label: "รายละเอียด", width: "25%" },

                        {
                          field: "outbrmitm_withdr_status",
                          label: "สถานะการเบิก",
                          width: "10%",
                          render: (row) => {
                            let statusText = "";
                            let statusColor = "red"; // กำหนดสีเริ่มต้น

                            if (row.outbrmitm_withdr_status === "COMPLETED") {
                              statusText = "เบิกสำเร็จ";
                              statusColor = "#4CAF50"; // สีเขียว
                            } else if (row.outbrmitm_withdr_status === "PARTIAL") {
                              statusText = "เบิกไม่ครบ";
                              statusColor = "#FFA500"; // สีส้ม (ปรับได้ตามต้องการ)
                            } else if (row.outbrmitm_withdr_status === "PENDING") {
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
                          field: "outbrm_id",
                          width: "10%",
                          render: (row) => {
                            const outbrm_id = row.outbrm_id;
                            return (
                              <a
                                href={`/withdraw?outbrm_id=${encodeURIComponent(outbrm_id)}`}
                                style={{
                                  textDecoration: "none",
                                  color: "blue",
                                  fontWeight: "bold",
                                }}
                              >
                                <MDTypography variant="subtitle2" sx={{ color: "blue" }}>
                                  ดูรายละเอียด
                                </MDTypography>
                              </a>
                            );
                          },
                        },
                      ]}
                      data={PickAll}
                      idField="outbrm_id"
                      showActions={false}
                      searchableColumns={[
                        "withdr_date",
                        "withdr_time",
                        "outbrm_code",
                        "outbrm_details",
                        // "outbrmitm_withdr_status",
                      ]}
                    />
                  </Card>
                </MDBox>
              </Card>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default PickupWithdraw;
