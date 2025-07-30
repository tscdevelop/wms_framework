import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TableComponent from "../components/table_component";
import TrackingAPI from "api/TrackingAPI";
import "jspdf-autotable";


const Tracking = () => {
  // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [TrackAll ,setTrackAll] = useState([]); // ข้อมูลทั้งหมด
      const fetchDataAll = async () => {
        try{
          const response = await TrackingAPI.getTrackingAll("APPROVED");
         
      
          if(response.isCompleted){
            const data = response.data;
            setTrackAll(data);
            
          }
      
        }catch(error){
          console.error("Error fetching  data : ",error);
        }finally{
          setLoading(false);
        }
      };
      useEffect(() =>{
        fetchDataAll();
      },[]);


  const getStatusSendBadge = (status) => {
    let badgeColor;
    let badgeContent;
    if (status === "COMPLETED") {
      badgeColor = "#28a745"; // สีเขียว
      badgeContent = "ส่งสำเร็จ";
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






    return(
        <DashboardLayout>
            <DashboardNavbar/>
            <MDBox p={2}>
                <MDBox mt={2} ml={5}>
                    <MDTypography variant="h3" color="inherit" fontWeight="bold">
                        ติดตามการขนส่ง
                    </MDTypography>
                </MDBox>


                <MDBox mt={5}>
                    <Card>
                        <MDBox p={5}>
                            <Card>
                                <TableComponent
                                columns={[
                                    { field: "shipmt_date",label: "วันที่", width: "5%"},
                                    { field: "outbfg_code",label: "เลขที่ใบนำส่ง", width: "5%"},
                                    { field: "outbfg_details",label: "รายละเอียด", width: "5%"},
                                    { field: "outbfgitm_shipmt_status",label: "สถานะจัดส่ง", 
                                      render: (row) => (
                                          <Box display="flex" justifyContent="center" alignItems="center">
                                         {getStatusSendBadge(row.outbfgitm_shipmt_status)}
                                            </Box>
                                      ),
                                    },
                                    { field: "delay_days",label: "จำนวนวันที่ล่าช้า", width: "5%"},
                                    { 
                                        field: "outbfg_id", 
                                        width: "5%",
                                        render: (row) => {
                                          const outbfg_id = row.outbfg_id; // ดึงค่า bom_code จาก row
                                          return (
                                            <a href={`/tracking-shipment?outbfg_id=${encodeURIComponent(outbfg_id)}`} 
                                               style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}>
                                              ดูรายละเอียด
                                            </a>
                                          );
                                        }
                                      },
                                ]}
                                data={TrackAll}
                                idField="outbfg_id"
                                showActions={false}
                                searchableColumns={["shipmt_date", "create_time","outbfg_code","outbfg_details","outbfg_is_shipment"]}
                                />
                            </Card>
                        </MDBox>
                    </Card>
                </MDBox>
            </MDBox>
        </DashboardLayout>
    );
};

export default Tracking;
