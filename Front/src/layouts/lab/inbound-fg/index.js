import React, { useState, useEffect } from "react";
import { Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import TableComponent from "../components/table_component";
import * as lang from "utils/langHelper";
import { useNavigate } from "react-router-dom";
import InBoundFGAPI from "api/InBoundFgAPI";
import TransactionAPI from "api/TransactionLogAPI";
import PrintBarCodeFgModal from "../components/fg_barcode";

const InboundFG = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [inboundAll, setInboundAll] = useState([]); // ข้อมูลทั้งหมด
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const [confirmAlert, setConfirmAlert] = useState(false);
  const [deleteCode, setDeleteCode] = useState(""); // รหัสโรงงานที่จะลบ
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false); // สำหรับเปิด/ปิด Modal
  const [selectedInbfgId, setSelectedInbfgId] = useState(null); // เก็บ inbrm_id ที่เลือก
  const fetchDataAll = async () => {
    try {
      const response = await InBoundFGAPI.getInBoundFgAll();
      console.log("factory All :", response);

      if (response.isCompleted) {
        const data = response.data;
        setInboundAll(data);
      }
    } catch (error) {
      console.error("Error fetching  data :", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDataAll();
  }, []);

  const navigate = useNavigate();
  const handleAdd = () => {
    navigate("/inboundFG-add");
  };

  const handleEdit = (inbfg_id) => {
    navigate(`/inboundFG-add?inbfg_id=${inbfg_id}`); // ส่ง inbrm_id ผ่าน query string
  };

  const handleDelete = async () => {
    try {
      setLoading(true); // แสดงสถานะ loading
      const responseGet = await InBoundFGAPI.getInBoundFgByID(deleteCode);
      if (!responseGet.isCompleted) {
        return;
      }

      const Form = responseGet.data;

      const response = await InBoundFGAPI.deleteInBoundFg(deleteCode);
      if (response.isCompleted) {
        // ส่ง log ไปที่ TransactionAPI.createLog
        const logPayload = {
          log_type: "inbound",
          log_name: "FG",
          log_action: "delete",
          code: Form.inbfg_code,
          name: Form.inbfg_name,
          type_id: Form.fg_id,
          factory_id: Form.fty_id,
          warehouse_id: Form.wh_id,
          zone_id: Form.zn_id,
          location_id: Form.loc_id,
          grade: Form.inbfg_grade,
          lot: Form.inbfg_lot,
          width: Form.inbfg_width,
          width_unitId: Form.inbfg_width_unitId,
          length: Form.inbfg_length,
          length_unitId: Form.inbfg_length_unitId,
          thickness: Form.inbfg_thickness,
          thickness_unitId: Form.inbfg_thickness_unitId,
          quantity: Form.inbfg_quantity,
          quantity_unitId: Form.inbfg_quantity_unitId,
          remark: Form.inbfg_remark,
          exp_low: Form.inbfg_exp_low,
          exp_medium: Form.inbfg_exp_medium,
          exp_high: Form.inbfg_exp_high,
          rem_low: Form.inbfg_rem_low,
          rem_medium: Form.inbfg_rem_medium,
          rem_high: Form.inbfg_rem_high,
        };

        try {
          await TransactionAPI.createLog(logPayload);
        } catch (logError) {
          console.error("Error logging transaction:", logError);
        }

        setAlert({
          show: true,
          type: "success",
          title: "ลบสำเร็จ",
          message: response.message,
        });
        await fetchDataAll();
      } else {
        setAlert({
          show: true,
          type: "error",
          title: "ลบไม่สำเร็จ",
          message: response.message,
        });
      }
    } catch (error) {
      console.error("Error during submit:", error);
    } finally {
      setConfirmAlert(false); // ซ่อน SweetAlert ยืนยัน
      setLoading(true); // แสดงสถานะ loading
    }
  };

  const handleBarcodeClick = (inbfg_id) => {
    setSelectedInbfgId(inbfg_id); // ตั้งค่า inbrm_id
    setBarcodeModalOpen(true); // เปิด Modal
  };

  const closeBarcodeModal = () => {
    setBarcodeModalOpen(false); // ปิด Modal
    setSelectedInbfgId(null); // ล้าง inbrm_id
  };

  const [searchFilters, setSearchFilters] = useState({});
  const handleExport = async () => {
    try {
      setLoading(true); // แสดงสถานะ loading
      await InBoundFGAPI.ExportInbFG(searchFilters); // เรียกใช้ API
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
            {lang.msg("title.infg")}
          </MDTypography>
        </MDBox>

        <MDBox mt={5}>
          <Card>
            <MDBox mt={3} p={3}>
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item>
                  <ButtonComponent type="add" onClick={handleAdd} />
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
                    { field: "fgifm_code", label: "รหัส", width: "5%" },
                    { field: "fg_type", label: "ประเภท", width: "5%" },
                    { field: "fgifm_name", label: "ชื่อ", width: "5%" },
                    { field: "inbfg_quantity", label: "จำนวน", width: "5%" },
                    {
                      field: "fgifm_id",
                      width: "5%",
                      render: (row) => {
                        const fgifm_id = row.fgifm_id; // ดึงค่า bom_code จาก row

                        return (
                          <a
                            href={`/inboundFG-details?fgifm_id=${encodeURIComponent(fgifm_id)}`}
                            style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
                          >
                            ดูรายละเอียด
                          </a>
                        );
                      },
                    },
                  ]}
                  data={inboundAll}
                  idField="fgifm_id"
                  onEdit={(id) => {
                    console.log("Edit clicked for ID:", id);
                    handleEdit(id);
                  }}
                  onDelete={(id) => {
                    setDeleteCode(id);
                    setConfirmAlert(true);
                  }}
                  onBarcodeClick={handleBarcodeClick}
                  showActions={false}
                  searchableColumns={["fgifm_code", "fgifm_name", "inbfg_quantity", "fg_type"]}
                  onFilterChange={setSearchFilters}
                />
              </Card>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
      <PrintBarCodeFgModal
        open={barcodeModalOpen}
        onClose={closeBarcodeModal}
        inbfg_id={selectedInbfgId}
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
    </DashboardLayout>
  );
};
export default InboundFG;
