import React, { useState, useEffect } from "react";
import { Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import TableComponent from "../components/table_component";
import { useLocation } from "react-router-dom";
import InBoundAPI from "api/InBoundRawAPI";
import "jspdf-autotable";
import roleAPI from "api/RoleAPI";
import { GlobalVar } from "../../../common/GlobalVar";

const InbTranRawMaterial = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [inboundAll, setInboundAll] = useState([]); // ข้อมูลทั้งหมด
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  // eslint-disable-next-line no-unused-vars
  const [state_menu_id, setStateMenuId] = useState(null);
  const location = useLocation();
  const [role, setRole] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [PermissionAction, setPermissionAction] = useState({
    ACT_EDIT: false,
  });

  useEffect(() => {
    const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
    setRole(userRole);
  }, []);

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
    console.log("location.state : ", location.state);
    console.log("location.state.menu_id : ", location.state?.menu_id);
    if (location.state && location.state.menu_id) {
      const menuId = location.state.menu_id;
      setStateMenuId(menuId);
      fetchPermissionAction(menuId);
    }
  }, [location.state]);

  const fetchDataAll = async () => {
    try {
      const response = await InBoundAPI.getInBoundAll();
      console.log("factory All :", response);

      if (response.isCompleted) {
        const data = response.data;
        setInboundAll(data);
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


  

  const [searchFilters, setSearchFilters] = useState({});

  const handleExport = async () => {
    try {
      setLoading(true); // แสดงสถานะ loading
      const response = await InBoundAPI.ExportInbRaw(searchFilters); // เรียกใช้ API

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
            Inbound Transaction / Raw Material
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
                    { field: "rmifm_code", label: "รหัส", width: "10%" },
                    { field: "rm_type", label: "ประเภท", width: "10%" },
                    { field: "rmifm_name", label: "ชื่อ", width: "10%" },
                    { field: "inbrm_total_weight", label: "น้ำหนักรวม", width: "10%" },
                    { field: "inbrm_quantity", label: "จำนวน", width: "10%" },
                    {
                      field: "rm_id",
                      width: "5%",
                      render: (row) => {
                        const rm_id = row.rm_id; // ดึงค่า bom_code จาก row
                        const rmifm_id = row.rmifm_id;
                        return (
                          <a
                            href={`/tran-raw-details?rm_id=${encodeURIComponent(
                              rm_id
                            )}&rmifm_id=${encodeURIComponent(rmifm_id)}`}
                            style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
                          >
                            ดูรายละเอียด
                          </a>
                        );
                      },
                    },
                  ]}
                  data={inboundAll}
                  idField="rmifm_id"
                  searchableColumns={[
                    "rmifm_code",
                    "rm_type",
                    "rmifm_name",  
                    "inbrm_total_weight",
                    "inbrm_quantity",
                  ]}
                  userRole={role}
                  showActions={false}
                  onFilterChange={setSearchFilters} // ส่งฟังก์ชันไปเพื่อรับค่าค้นหา
                />
              </Card>
            </MDBox>
          </Card>
        </MDBox>

       
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
export default InbTranRawMaterial;
