import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import TableComponent from "../components/table_component";
import * as lang from "utils/langHelper";
import { useNavigate } from "react-router-dom";
import OutBoundRaw from "api/OutBoundRawAPI";
import TransactionAPI from "api/TransactionLogAPI";
import PrintRmBillComponent from "../components/outbound_rm_withdraw";
import { GlobalVar } from "../../../common/GlobalVar";


const OutboundRawMaterial = () => {
   // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [outboundAll ,setOutboundAll] = useState([]); // ข้อมูลทั้งหมด
    const [alert, setAlert] = useState({
        show: false,
        type: "success",
        title: "",
        message: "",
      });
      const [confirmAlert, setConfirmAlert] = useState(false); 
      const [deleteCode, setDeleteCode] = useState(""); // รหัสโรงงานที่จะลบ
      const [printModalOpen, setPrintModalOpen] = useState(false); // สำหรับเปิด/ปิด Modal
      const [selectedOutbrmId, setSelectedOutbrmId] = useState(null); // เก็บ inbrm_id ที่เลือก
      const [role, setRole] = useState("");
      
        useEffect(() => {
            const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
            setRole(userRole);
          }, []);


    const fetchDataAll = async () => {
        try{
          const response = await OutBoundRaw.getOutBoundRawAll();
          console.log("factory All :",response);
      
          if(response.isCompleted){
            const data = response.data;
            setOutboundAll(data);
            
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
      

    const navigate = useNavigate(); 
    const handleAdd = () =>{
        navigate("/outboundRaw-create");
    };

    const handleEdit = (outbrm_id) => {
        navigate(`/outboundRaw-create?outbrm_id=${outbrm_id}`); // ส่ง inbrm_id ผ่าน query string
    };
    


  
    const handleDelete = async () => {
      try {
          
  
          // 🔹 ดึงข้อมูลทั้งหมดจาก `getOutBoundRawAll`
          const responseAll = await OutBoundRaw.getOutBoundRawAll();
          if (!responseAll.isCompleted || !responseAll.data) {
              return;
          }
  
          // 🔹 ค้นหาข้อมูลที่ตรงกับ `outbrm_id` ที่ต้องการลบ
          const selectedData = responseAll.data.find(item => item.outbrm_id === deleteCode);
          if (!selectedData) {
              return;
          }
  
          // 🔹 เรียก API ลบข้อมูล
          const responseDelete = await OutBoundRaw.deleteOutBoundRaw(deleteCode);
          if (responseDelete.isCompleted) {
              // 🔹 สร้าง log payload
              const logPayload = {
                  log_type: "OUTBOUND",
                  log_ctgy: "RAW_MATERIAL",
                  log_action: "DELETED",
                  ref_id: selectedData.outbrm_id,
                  transaction_data: {
                      outbrm_id: selectedData.outbrm_id,
                      outbrm_code: selectedData.outbrm_code,
                      outbrm_details: selectedData.outbrm_details,
                      outbrm_appr_status: selectedData.outbrm_appr_status,
                      outbrmitm_withdr_status: selectedData.outbrmitm_withdr_status
                  },
              };
  
              console.log("📌 Transaction Log Payload:", logPayload);
              await TransactionAPI.createLog(logPayload);
  
              setAlert({
                  show: true,
                  type: "success",
                  title: "ลบสำเร็จ",
                  message: responseDelete.message,
              });
  
              await fetchDataAll(); // โหลดข้อมูลใหม่
          } else {
              setAlert({
                  show: true,
                  type: "error",
                  title: "ลบไม่สำเร็จ",
                  message: responseDelete.message,
              });
          }
      } catch (error) {
          console.error("❌ Error during delete operation:", error);
      } finally {
          setConfirmAlert(false); // ซ่อน SweetAlert ยืนยัน
          setLoading(false); // ปิดสถานะ loading
      }
  };
  

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

  

  const handleBarcodeClick = (outbrm_id) => {
    setSelectedOutbrmId(outbrm_id); // ตั้งค่า inbrm_id
    setPrintModalOpen(true); // เปิด Modal
  };
  
  const closeBarcodeModal = () => {
    setPrintModalOpen(false); // ปิด Modal
    setSelectedOutbrmId(null); // ล้าง inbrm_id
  };
  
  const [searchFilters, setSearchFilters] = useState({});

  const handleExport = async () => {
    try {
      setLoading(true); // แสดงสถานะ loading
      const response = await OutBoundRaw.ExportOutbRaw(searchFilters); // เรียกใช้ API
  
      if (response.isCompleted) {
        return;
      }
    } catch (error) {
      console.error("❌ Error during export:", error);
    } finally {
      setLoading(false);
    }
  };
  
    
    return(
        <DashboardLayout>
            <DashboardNavbar/>
                <MDBox p={2}>
                    <MDBox mt={2} ml={5}>
                        <MDTypography variant="h3" color="dark" fontWeight="bold">
                            {lang.msg("title.outraw")}
                        </MDTypography>
                    </MDBox>

                    <MDBox mt={5}>
                        <Card>
                           <MDBox mt={3} p={3}>
                            <Grid container spacing={2} justifyContent="flex-end">
                                <Grid item>
                                    <ButtonComponent type="bill" onClick={handleAdd} />
                                </Grid>
                                <Grid item>
                                  <ButtonComponent
                                   type="export" 
                                   onClick={handleExport}
                                   />
                                </Grid>
                            </Grid>
                           </MDBox>
                            
                            <MDBox p={5}>
                                <Card>
                                    <TableComponent
                                    columns={[
                                        { field: "formatted_date", label: "วันที่", width: "10%"},
                                        { field: "create_time", label: "เวลา", width: "10%"},
                                        { field: "outbrm_code", label: "เลขที่ใบเบิก", width: "15%"},
                                        { field: "outbrm_details", label: "รายละเอียด", width: "30%"},   
                                        {
                                            field: "outbrm_appr_status",
                                            label: "สถานะอนุมัติ",
                                            width: "10%",
                                            render: (row) => (
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                  {getStatusBadge(row.outbrm_appr_status)}
                                                </Box>
                                              ),
                                          },
                                          {
                                            field: "outbrmitm_withdr_status",
                                            label: "สถานะเบิก",
                                            width: "10%",
                                            render: (row) => (
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                  {getStatusWithDrawBadge(row.outbrmitm_withdr_status)}
                                                </Box>
                                              ),
                                          },
                                    ]}
                                    showPostActionColumn={true} // ถ้าเปลี่ยนเป็น false จะไม่แสดงคอลัมน์หลัง Action
                                    postActionColumn={{
                                      field: "outbrm_id",
                                      width: "15%",
                                      render: (row) => {
                                        const bomCode = row.outbrm_id;
                                        return (
                                          <a
                                            href={`/outboundRaw-details?outbrm_id=${encodeURIComponent(bomCode)}`}
                                            style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
                                          >
                                            <MDTypography variant="subtitle2" sx={{ color: "blue" }}>
                                            ดูรายละเอียด
                                            </MDTypography>
                                          </a>
                                        );
                                      },
                                    }}
                                    data={outboundAll}
                                    idField="outbrm_id"
                                    onEdit={(id) => {
                                        handleEdit(id);
                                    }}
                                    onDelete={(id) => {
                                        setDeleteCode(id);
                                        setConfirmAlert(true);
                                    }}
                                    userRole={role}
                                    onPrint={handleBarcodeClick}
                                    hiddenActions={["barcode","settings"]}
                                    actionOrder={["print", "edit", "delete",]}
                                    searchableColumns={[   
                                      "formatted_date",
                                      "create_time",
                                      "outbrm_code",
                                      "outbrm_details"
                                    ]}
                                    onFilterChange={setSearchFilters} 
                                    />
                                </Card>
                            </MDBox>
                        </Card>
                    </MDBox>

                    <PrintRmBillComponent
                        open={printModalOpen}
                        onClose={closeBarcodeModal}
                        outbrm_id={selectedOutbrmId}
                    />


                    {confirmAlert && (
                        <SweetAlertComponent
                        type="warning"
                        title="ยืนยันการลบ"
                        message="คุณต้องการลบข้อมูลนี้ใช่หรือไม่?"
                        show={confirmAlert}
                        showCancel
                        confirmText="ตกลง"
                        cancelText="ยกเลิก"
                        onConfirm={handleDelete}
                        onCancel={() => setConfirmAlert(false)}
                        />
                    )}
                    <SweetAlertComponent
                        show={alert.show}
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onConfirm={() => setAlert({ ...alert, show: false })}
                    />
                </MDBox>
        </DashboardLayout>
    );
};
export default OutboundRawMaterial;