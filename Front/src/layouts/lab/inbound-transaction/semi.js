import React, { useState, useEffect } from "react";
import { Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import SweetAlertComponent from "../components/sweetAlert";
import ButtonComponent from "../components/ButtonComponent";
import TableComponent from "../components/table_component";
import InBoundSemiFGAPI from "api/InBoundSemiFGAPI";
// import roleAPI from "api/RoleAPI";
import { GlobalVar } from "../../../common/GlobalVar";

const InbTranSemiFG = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [inboundAll, setInboundAll] = useState([]); // ข้อมูลทั้งหมด
  const [role, setRole] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [PermissionAction, setPermissionAction] = useState({
    ACT_EDIT: false,
  });
const [alert, setAlert] = useState({
        show: false,
        type: "success",
        title: "",
        message: "",
    });
  useEffect(() => {
    const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
    setRole(userRole);
  }, []);

  const fetchDataAll = async () => {
    try {
      const response = await InBoundSemiFGAPI.getInBoundAll();
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
      const response = await InBoundSemiFGAPI.ExportInbSemi(searchFilters); // เรียกใช้ API

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
            Inbound Transaction / Semi FG
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
                    { field: "semiifm_code", label: "รหัส", width: "10%" },
                    { field: "semi_type", label: "ประเภท", width: "10%" },
                    { field: "semiifm_name", label: "ชื่อ", width: "10%" },
                    { field: "inbsemi_quantity", label: "จำนวน", width: "10%" },
                    {
                      field: "semiifm_id",
                      width: "5%",
                      render: (row) => {
                        const semiifm_id = row.semiifm_id; // ดึงค่า bom_code จาก row

                        return (
                          <a
                            href={`/tran-semi-details?semiifm_id=${encodeURIComponent(semiifm_id)}`}
                            style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
                          >
                            ดูรายละเอียด
                          </a>
                        );
                      },
                    },
                  ]}
                  data={inboundAll}
                  idField="semiifm_id"
                 
                  searchableColumns={["semiifm_code", "semi_type", "semiifm_name", "inbsemi_quantity"]}
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
export default InbTranSemiFG;
