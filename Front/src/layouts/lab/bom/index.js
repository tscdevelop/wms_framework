import React, { useState, useEffect } from "react";
import { Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import TableComponent from "../components/table_component";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import BOMAPI from "api/BOMAPI";
import "jspdf-autotable";
import { GlobalVar } from "../../../common/GlobalVar";
import SweetAlertComponent from "../components/sweetAlert";
import roleAPI from "api/RoleAPI";
const BOM = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [BomAll, setBomAll] = useState([]); // ข้อมูลทั้งหมด
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const [confirmAlert, setConfirmAlert] = useState(false);
  const [deleteCode, setDeleteCode] = useState(""); // รหัสโรงงานที่จะลบ
  // eslint-disable-next-line no-unused-vars
  const [state_menu_id, setStateMenuId] = useState(null);
  const location = useLocation();
  const [role, setRole] = useState("");
  const [PermissionAction, setPermissionAction] = useState({
    ACT_EDIT: false,
  });


  useEffect(() => {
    // ✅ รับ role จาก state ถ้ามี ถ้าไม่มี fallback เป็น GlobalVar
    const incomingRole = location.state?.userRole || GlobalVar.getRole();
    setRole(incomingRole);
  }, [location.state]);
  

  const fetchPermissionAction = async (menuId) => {
    try {
      const apiResponse = await roleAPI.getPermissionAction(menuId);
      console.log("fetchPermissionAction -> apiResponse : ", apiResponse);
      if (apiResponse.data && apiResponse.data.permission_actions) {
        const pmsActData = apiResponse.data.permission_actions;
        console.log("fetchPermissionAction -> pmsActData: ", pmsActData);
        // ตั้งค่า permission actions จาก API
        setPermissionAction(
          pmsActData || {
            ACT_EDIT: false,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching menu permissions:", error);
    }
  };


  useEffect(() => {
    const menuId = location.state?.menu_id || 34; // ✅ ใส่ default menu_id ของ BOM
    setStateMenuId(menuId);
    fetchPermissionAction(menuId);
  }, []);
  


  const fetchDataAll = async () => {
    try {
      const response = await BOMAPI.getBOMAll();

      if (response.isCompleted) {
        const data = response.data;
        setBomAll(data);
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
    navigate("/bom-create");
  };

  const handleEdit = (so_id) => {
    navigate(`/bom-create?so_id=${so_id}`); // ส่ง inbrm_id ผ่าน query string
  };

  const handleDelete = async () => {
    try {
      const response = await BOMAPI.deleteBOM(deleteCode);
      if (response.isCompleted) {
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
    }
  };

  const [searchFilters, setSearchFilters] = useState({});

  const handleExport = async () => {
    try {
      setLoading(true); // แสดงสถานะ loading
      const response = await BOMAPI.ExportBom(searchFilters);

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
            BOM
          </MDTypography>
        </MDBox>

        <MDBox mt={5}>
          <Card>
            <MDBox mt={3} p={3}>
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item>
                  {PermissionAction.ACT_EDIT && <ButtonComponent type="BomAdd" onClick={handleAdd} />}
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
                    { field: "formatted_date", label: "วันที่", width: "13%" },
                    { field: "create_time", label: "เวลา", width: "13%" },
                    { field: "so_code", label: "เลขที่ SO.", width: "13%" },
                    { field: "so_details", label: "รายละเอียด", width: "20%" },
                    {
                      field: "so_shipmt_status",
                      label: "สถานะ",
                      width: "15%",
                      cellStyle: (row) => {
                        let bgColor = "";
                        let textColor = "white"; // ค่าเริ่มต้นให้สีขาว
                        if (row.so_shipmt_status === "COMPLETED") {
                          bgColor = "#52D21233";
                          textColor = "black"; // เมื่อสถานะเป็น COMPLETED ให้ข้อความเป็นสีดำ
                        } else if (row.so_shipmt_status === "PENDING") {
                          bgColor = "#FF000033";
                          textColor = "black";
                        } else if (row.so_shipmt_status === "PARTIAL") {
                          bgColor = "#FF8A0033";
                          textColor = "black";
                        }
                        return {
                          backgroundColor: bgColor,
                          color: textColor,
                          padding: "5px",
                          borderRadius: "4px",
                        };
                      },
                      render: (row) => {
                        let text = "";
                        if (row.so_shipmt_status === "COMPLETED") {
                          text = "ส่งเเล้ว";
                        } else if (row.so_shipmt_status === "PENDING") {
                          text = "ยังไม่ได้ส่ง";
                        } else if (row.so_shipmt_status === "PARTIAL") {
                          text = "ส่งไม่ครบ";
                        }
                        return text;
                      },
                    },
                  ]}
                  searchableColumns={["formatted_date", "create_time", "so_code", "so_details"]}
                  onFilterChange={setSearchFilters} // ส่งฟังก์ชันไปเพื่อรับค่าค้นหา
                  data={BomAll}
                  idField="so_id"
                  onEdit={(id) => handleEdit(id)}
                  onDelete={(id) => {
                    setDeleteCode(id);
                    setConfirmAlert(true);
                  }}
                  // ถ้าอยากให้มี Action
                  showActions={true}
                  hiddenActions={["barcode", "settings"]}
                  actionOrder={["edit", "delete"]}
                  userRole={role}
                  // ----- ส่วนนี้คือของใหม่ -----
                  showPostActionColumn={true} // ถ้าเปลี่ยนเป็น false จะไม่แสดงคอลัมน์หลัง Action
                  postActionColumn={{
                    field: "so_id",
                    width: "15%",
                    render: (row) => {
                      const so_id = row.so_id;
                      return (
                        <a
                          href={`/bom-details?so_id=${encodeURIComponent(so_id)}`}
                          style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
                        >
                          <MDTypography variant="subtitle2" sx={{ color: "blue" }}>ดูรายละเอียด</MDTypography>
                        </a>
                      );
                    },
                  }}
                />
              </Card>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>

      {confirmAlert && (
        <SweetAlertComponent
          type="error"
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

export default BOM;
