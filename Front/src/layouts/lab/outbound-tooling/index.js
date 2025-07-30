import React, { useState, useEffect } from "react";
import { Box, Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import TableComponent from "../components/table_component";
import * as lang from "utils/langHelper";
import { useNavigate } from "react-router-dom";
import OutBoundToolingAPI from "api/OutboundToolingAPI";
import TransactionAPI from "api/TransactionLogAPI";
import PrintTLBillComponent from "../components/outbound_tl_billtooling";
import { GlobalVar } from "../../../common/GlobalVar";

const OutboundTooling = () => {
   // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [outboundAll, setOutboundAll] = useState([]); // ข้อมูลทั้งหมด
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const [confirmAlert, setConfirmAlert] = useState(false);
  const [deleteCode, setDeleteCode] = useState(""); // รหัสโรงงานที่จะลบ
  const [printModalOpen, setPrintModalOpen] = useState(false); // สำหรับเปิด/ปิด Modal
  const [selectedOutbtlId, setSelectedOutbtlId] = useState(null); // เก็บ inbrm_id ที่เลือก
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

  const navigate = useNavigate();
  const handleAdd = () => {
    navigate("/outboundTooling-create");
  };

  const handleEdit = (outbtl_id) => {
    navigate(`/outboundTooling-create?outbtl_id=${outbtl_id}`); // ส่ง inbrm_id ผ่าน query string
  };

  const handleDelete = async () => {
    try {
     
      // 🔹 ดึงข้อมูลทั้งหมดจาก `getOutBoundTLAll`
      const responseAll = await OutBoundToolingAPI.getOutBoundTLAll();
      if (!responseAll.isCompleted || !responseAll.data) {
        return;
      }

      // 🔹 ค้นหาข้อมูลที่ตรงกับ `outbtl_id` ที่ต้องการลบ
      const selectedData = responseAll.data.find((item) => item.outbtl_id === deleteCode);
      if (!selectedData) {
        return;
      }

      // 🔹 เรียก API ลบข้อมูล
      const responseDelete = await OutBoundToolingAPI.deleteOutBoundTL(deleteCode);
      if (responseDelete.isCompleted) {
        // 🔹 สร้าง log payload
        const logPayload = {
          log_type: "OUTBOUND",
          log_ctgy: "TOOLING",
          log_action: "DELETED",
          ref_id: selectedData.outbtl_id,
          transaction_data: {
            outbtl_id: selectedData.outbtl_id,
            outbtl_code: selectedData.outbtl_code,
            outbtl_details: selectedData.outbtl_details,
            outbtl_appr_status: selectedData.outbtl_appr_status,
            outbtl_return_status: selectedData.outbtl_return_status,
            outbtl_issued_by: selectedData.outbtl_issued_by || "-",
            outbtl_returned_by: selectedData.outbtl_returned_by || "-",
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
      badgeContent = "อนุมัติสำเร็จ";
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
      badgeContent = "คืนสำเร็จ";
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

  const handleBarcodeClick = (outbtl_id) => {
    setSelectedOutbtlId(outbtl_id); // ตั้งค่า inbrm_id
    setPrintModalOpen(true); // เปิด Modal
  };

  const closeBarcodeModal = () => {
    setPrintModalOpen(false); // ปิด Modal
    setSelectedOutbtlId(null); // ล้าง inbrm_id
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
            {lang.msg("title.outtooling")}
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
                  <ButtonComponent type="export" onClick={handleExport} />
                </Grid>
              </Grid>
            </MDBox>

            <MDBox p={5}>
              <Card>
                <TableComponent
                  columns={[
                    { field: "create_date", label: "วันที่เบิกของ", width: "5%" },
                    { field: "create_time", label: "เวลาเบิกของ", width: "5%" },
                    { field: "return_date", label: "วันที่คืนของ", width: "5%" },
                    { field: "return_time", label: "เวลาคืนของ", width: "5%" },
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
                    {
                      field: "return_action",
                      label: "คืนเครื่องมือ",
                      width: "8%",
                      render: (row) => {
                        const outTLCode = row.outbtl_id;
                        
                        if (row.outbtl_return_status === "RETURNED") {
                          return (
                            <span style={{ color: "gray", cursor: "not-allowed", pointerEvents: "none" }}>
                              คืนแล้ว
                            </span>
                          );
                        } else if (row.outbtl_appr_status !== "APPROVED") {
                          return (
                            <span style={{ color: "gray", cursor: "not-allowed", pointerEvents: "none" }}>
                              ทำเรื่องคืน
                            </span>
                          );
                        } else {
                          return (
                            <a
                              href={`/outboundTooling-return?outbtl_id=${encodeURIComponent(outTLCode)}`}
                              style={{ textDecoration: "none", color: "blue" }}
                            >
                              ทำเรื่องคืน
                            </a>
                          );
                        }
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
                          href={`/outboundTooling-details?outbtl_id=${encodeURIComponent(
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
                  onEdit={(id) => {
                    handleEdit(id);
                  }}
                  onDelete={(id) => {
                    setDeleteCode(id);
                    setConfirmAlert(true);
                  }}
                  onPrint={handleBarcodeClick}
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
                  onFilterChange={setSearchFilters}
                />
              </Card>
            </MDBox>
          </Card>
        </MDBox>

        <PrintTLBillComponent
          open={printModalOpen}
          onClose={closeBarcodeModal}
          outbtl_id={selectedOutbtlId}
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
export default OutboundTooling;
