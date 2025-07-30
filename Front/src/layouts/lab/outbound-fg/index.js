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
import OutBoundFGAPI from "api/OutBoundFgAPI";
import TransactionAPI from "api/TransactionLogAPI";
import ModalComponent from "../components/outbfg_waybill";
import PrintWayBillComponent from "../components/outbound_fg_waybill";
import PrintFgBillComponent from "../components/outbound_fg_bill";
import PrintModalAllComponent from "../components/outbound_fg_billall";
import { GlobalVar } from "../../../common/GlobalVar";

const OutboundFG = () => {
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
  const [printModalData, setPrintModalData] = useState(null);
  const [showPrintWayBill, setShowPrintWayBill] = useState(false);
  const [showPrintFgBill, setShowPrintFgBill] = useState(false);
  const [showPrintFgBillAll, setShowPrintFgBillAll] = useState(false);
  const [selectedOutbfgId, setSelectedOutbfgId] = useState(null); // เก็บ outbfg_id
  const [role, setRole] = useState("");

  useEffect(() => {
    const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
    setRole(userRole);
  }, []);

  const fetchDataAll = async () => {
    try {
      const response = await OutBoundFGAPI.getOutBoundFGAll();
      console.log("OutBoundFGAPI All :", response);

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
    navigate("/outboundFg-create");
  };

  const handleEdit = (outbfg_id) => {
    navigate(`/outboundFg-create?outbfg_id=${outbfg_id}`); // ส่ง inbrm_id ผ่าน query string
  };

  const handleDelete = async () => {
    try {
      

      // 🔹 ดึงข้อมูลทั้งหมดจาก `getOutBoundFGAll`
      const responseAll = await OutBoundFGAPI.getOutBoundFGAll();
      if (!responseAll.isCompleted || !responseAll.data) {
        return;
      }

      // 🔹 ค้นหาข้อมูลที่ตรงกับ `outbfg_id` ที่ต้องการลบ
      const selectedData = responseAll.data.find((item) => item.outbfg_id === deleteCode);
      if (!selectedData) {
        return;
      }

      // 🔹 เรียก API ลบข้อมูล
      const responseDelete = await OutBoundFGAPI.deleteOutBoundFG(deleteCode);
      if (responseDelete.isCompleted) {
        // 🔹 สร้าง log payload
        const logPayload = {
          log_type: "OUTBOUND",
          log_ctgy: "FINISHED_GOODS",
          log_action: "DELETED",
          ref_id: selectedData.outbfg_id,
          transaction_data: {
            outbfg_id: selectedData.outbfg_id,
            outbfg_code: selectedData.outbfg_code,
            outbfg_details: selectedData.outbfg_details,
            outbfg_appr_status: selectedData.outbfg_appr_status,
            outbfgitm_withdr_status: selectedData.outbfgitm_withdr_status,
            outbfgitm_shipmt_status: selectedData.outbfgitm_shipmt_status,
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

  const handleConfirmModal = (selectedValue) => {
    if (!selectedOutbfgId) return;

    if (selectedValue === "1") {
      setShowPrintFgBillAll(true);
    } else if (selectedValue === "2") {
      setShowPrintWayBill(true);
    } else if (selectedValue === "3") {
      setShowPrintFgBill(true);
    }
    setPrintModalOpen(false); // ปิด Modal หลัก
  };

  const handleOpenPrintModal = async (outbfg_id) => {
    try {
      const response = await OutBoundFGAPI.getOutBoundFGReqByID(outbfg_id);
      if (response.isCompleted) {
        setPrintModalData(response.data);
        setSelectedOutbfgId(outbfg_id);
        setPrintModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching print data:", error);
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

  const getStatusWithDrawBadge = (status) => {
    let badgeColor;
    let badgeContent;
    if (status === "COMPLETED") {
      badgeColor = "#28a745"; // สีเขียว
      badgeContent = "เบิกสำเร็จ";
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

  const [searchFilters, setSearchFilters] = useState({});

  const handleExport = async () => {
    try {
      setLoading(true); // แสดงสถานะ loading
      const response = await OutBoundFGAPI.ExportOutbFG(searchFilters); // เรียกใช้ API

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
            {lang.msg("title.outfg")}
          </MDTypography>
        </MDBox>

        <MDBox mt={5}>
          <Card>
            <MDBox mt={3} p={3}>
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item>
                  <ButtonComponent type="waybill" onClick={handleAdd} />
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
                    { field: "formatted_date", label: "วันที่", width: "5%" },
                    { field: "create_time", label: "เวลา", width: "5%" },
                    { field: "outbfg_code", label: "เลขที่ใบเบิก", width: "5%" },
                    { field: "outbfg_details", label: "รายละเอียด", width: "5%" },
                    {
                      field: "outbfg_appr_status",
                      label: "สถานะ",
                      width: "10%",
                      render: (row) => (
                        <Box display="flex" justifyContent="center" alignItems="center">
                          {getStatusBadge(row.outbfg_appr_status)}
                        </Box>
                      ),
                    },
                    {
                      field: "outbfgitm_withdr_status",
                      label: "สถานะเบิก",
                      width: "10%",
                      render: (row) => (
                        <Box display="flex" justifyContent="center" alignItems="center">
                          {getStatusWithDrawBadge(row.outbfgitm_withdr_status)}
                        </Box>
                      ),
                    },
                    {
                      field: "outbfgitm_shipmt_status",
                      label: "สถานะจัดส่ง",
                      width: "10%",
                      render: (row) => (
                        <Box display="flex" justifyContent="center" alignItems="center">
                          {getStatusSendBadge(row.outbfgitm_shipmt_status)}
                        </Box>
                      ),
                    },
                  ]}
                  showPostActionColumn={true} // ถ้าเปลี่ยนเป็น false จะไม่แสดงคอลัมน์หลัง Action
                  postActionColumn={{
                    field: "outbfg_id",
                    width: "15%",
                    render: (row) => {
                      const outbfg_id = row.outbfg_id;
                      return (
                        <a
                          href={`/outboundFg-details?outbfg_id=${encodeURIComponent(outbfg_id)}`}
                          style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
                        >
                          <MDTypography variant="subtitle2" sx={{ color: "blue" }}>ดูรายละเอียด</MDTypography>
                        </a>
                      );
                    },
                  }}
                  data={outboundAll}
                  idField="outbfg_id"
                  onEdit={(id) => {
                    handleEdit(id);
                  }}
                  onDelete={(id) => {
                    setDeleteCode(id);
                    setConfirmAlert(true);
                  }}
                  hiddenActions={["barcode", "settings"]}
                  actionOrder={["print", "edit", "delete"]}
                  userRole={role}
                  onPrint={handleOpenPrintModal}
                  searchableColumns={[
                    "formatted_date",
                    "create_time",
                    "outbfg_code",
                    "outbfg_details"
                  ]}
                  onFilterChange={setSearchFilters}
                />
              </Card>
            </MDBox>
          </Card>
        </MDBox>
        <ModalComponent
          open={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          onConfirm={handleConfirmModal}
        />
        {printModalData && (
          <>
            <PrintWayBillComponent
              open={showPrintWayBill}
              onClose={() => setShowPrintWayBill(false)}
              data={printModalData}
            />
            <PrintFgBillComponent
              open={showPrintFgBill}
              onClose={() => setShowPrintFgBill(false)}
              data={printModalData}
            />
            <PrintModalAllComponent
              open={showPrintFgBillAll}
              onClose={() => setShowPrintFgBillAll(false)}
              data={printModalData}
            />
          </>
        )}

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
export default OutboundFG;
