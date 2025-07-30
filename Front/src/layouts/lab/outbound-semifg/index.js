import React, { useState, useEffect } from "react";
import { Box, Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import TableComponent from "../components/table_component";
import { useNavigate } from "react-router-dom";
import OutBoundSemiFGAPI from "api/OutBoundSemiFGAPI";
import TransactionAPI from "api/TransactionLogAPI";
import { GlobalVar } from "../../../common/GlobalVar";
import PrintSemiFgWDComponent from "../components/outbound_semifg_withdraw";
import PrintSemiShipComponent from "../components/outbound_semifg_shipment";

const OutboundSemiFG = () => {
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
  const [role, setRole] = useState("");
  const [selectedOutbSemiId, setSelectedOutbSemiId] = useState(null); // เก็บ outbsemi_id ที่เลือก
  const [selectedOutbSemiReturned, setSelectedOutbSemiReturned] = useState(null); // เก็บค่าของ outbsemi_is_returned

  // สำหรับ PrintSemiFgWDComponent
  const [printModalOpen, setPrintModalOpen] = useState(false); // สำหรับเปิด/ปิด Modal

  //  สำหรับ PrintSemiShipComponent
  const [printShipModalOpen, setPrintShipModalOpen] = useState(false);

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

  const navigate = useNavigate();
  const handleAdd = () => {
    navigate("/outboundSemiFG-create");
  };

  const handleEdit = (outbsemi_id) => {
    navigate(`/outboundSemiFG-create?outbsemi_id=${outbsemi_id}`); // ส่ง inbrm_id ผ่าน query string
  };

  const handleDelete = async () => {
    try {
      

      // 🔹 Fetch the data before deletion to log details
      const responseGet = await OutBoundSemiFGAPI.getOutBoundSemiByID(deleteCode);
      if (!responseGet.isCompleted) {
        console.error("❌ Failed to fetch data before deletion.");
        return;
      }

      const deletedData = responseGet.data;

      // 🔹 Call API to delete the record
      const responseDelete = await OutBoundSemiFGAPI.deleteOutBoundSemi(deleteCode);
      if (responseDelete.isCompleted) {
        // ✅ Prepare Transaction Log
        const logPayload = {
          log_type: "OUTBOUND",
          log_ctgy: "SEMI",
          log_action: "DELETED",
          ref_id: deletedData.outbsemi_id || deleteCode,
          transaction_data: {
            outbsemi_code: deletedData.outbsemi_code || "",
            outbsemi_details: deletedData.outbsemi_details || "",
            outbsemi_appr_status: deletedData.outbsemi_appr_status || "",
            outbsemiitm_withdr_status: deletedData.outbsemiitm_withdr_status || "",
            outbsemiitm_shipmt_status: deletedData.outbsemiitm_shipmt_status || "",
            withdr_date: deletedData.withdr_date || null,
            withdr_time: deletedData.withdr_time || null,
            shipmt_date: deletedData.shipmt_date || null,
            shipmt_time: deletedData.shipmt_time || null,
            delay_days: deletedData.delay_days || null,
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

        await fetchDataAll(); // ✅ Refresh data list
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
      setAlert({
        show: true,
        type: "error",
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถดำเนินการลบได้",
      });
    } finally {
      setConfirmAlert(false); // ✅ Hide confirmation dialog
      setLoading(false); // ✅ Hide loading state
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

  // ฟังก์ชัน handleBarcodeClick ส่ง id ไปยัง component ที่เหมาะสม
  const handleBarcodeClick = (outbsemi_id) => {
    const rowData = outboundAll.find((item) => item.outbsemi_id === outbsemi_id);
    if (rowData) {
      // กำหนดข้อมูลให้ทั้งสอง props
      setSelectedOutbSemiId(rowData.outbsemi_id);
      setSelectedOutbSemiReturned(rowData.outbsemi_is_returned);

      // ถ้า outbsemi_is_returned เป็น 1 ให้เปิด PrintSemiFgWDComponent
      if (rowData.outbsemi_is_returned === 1) {
        setPrintModalOpen(true);
      }
      // ถ้า outbsemi_is_returned เป็น 0 ให้เปิด PrintSemiShipComponent
      else if (rowData.outbsemi_is_returned === 0) {
        setPrintShipModalOpen(true);
      }
    }
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
            Outbound / เบิก Semi FG
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
                          href={`/outboundSemifg-details?outbsemi_id=${encodeURIComponent(
                            bomCode
                          )}`}
                          style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
                        >
                          <MDTypography variant="subtitle2" sx={{ color: "blue" }}>ดูรายละเอียด</MDTypography>
                        </a>
                      );
                    },
                  }}
                  data={outboundAll}
                  idField="outbsemi_id"
                  onEdit={(id) => {
                    handleEdit(id);
                  }}
                  onDelete={(id) => {
                    setDeleteCode(id);
                    setConfirmAlert(true);
                  }}
                  userRole={role}
                  onPrint={handleBarcodeClick}
                  hiddenActions={["settings", "barcode"]}
                  actionOrder={["print", "edit", "delete"]}
                  searchableColumns={[
                    "formatted_date",
                    "create_time",
                    "outbsemi_code",
                    "outbsemi_details"
                  ]}
                  onFilterChange={setSearchFilters}
                />
              </Card>
            </MDBox>
          </Card>
        </MDBox>

        {/* Modal สำหรับ PrintSemiFgWDComponent */}
        <PrintSemiFgWDComponent
          open={printModalOpen}
          onClose={() => {
            setPrintModalOpen(false);
            setSelectedOutbSemiId(null);
            setSelectedOutbSemiReturned(null);
          }}
          outbsemi_id={selectedOutbSemiId}
          outbsemi_is_returned={selectedOutbSemiReturned}
        />

        {/* Modal สำหรับ PrintSemiShipComponent */}
        <PrintSemiShipComponent
          open={printShipModalOpen}
          onClose={() => {
            setPrintShipModalOpen(false);
            setSelectedOutbSemiId(null);
            setSelectedOutbSemiReturned(null);
          }}
          outbsemi_id={selectedOutbSemiId}
          outbsemi_is_returned={selectedOutbSemiReturned}
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
export default OutboundSemiFG;
