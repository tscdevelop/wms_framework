import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import TableComponent from "../components/table_component";
import { useNavigate } from "react-router-dom";
// import { useLocation } from "react-router-dom";
import InBoundSemiFGAPI from "api/InBoundSemiFGAPI";
// import roleAPI from "api/RoleAPI";
import { GlobalVar } from "../../../common/GlobalVar";



const InboundSemiFG = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [inboundAll, setInboundAll] = useState([]); // ข้อมูลทั้งหมด
  // const location = useLocation();
  const [role, setRole] = useState("");
  // const [PermissionAction, setPermissionAction] = useState({
  //   ACT_EDIT: false, 
  // });


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
    navigate("/inboundSemiFG-add");
  };

  const handleEdit = (semiifm_id) => {
    navigate(`/inboundSemiFG-add?semiifm_id=${semiifm_id}`); // ส่ง inbrm_id ผ่าน query string
  };


 const [searchFilters, setSearchFilters] = useState({});
  const handleExport = async () => {
    try {
      setLoading(true); // แสดงสถานะ loading
      await InBoundSemiFGAPI.ExportInbSemi(searchFilters); // เรียกใช้ API


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
            Inbound / Semi FG
          </MDTypography>
        </MDBox>

        <MDBox mt={5}>
          <Card>
            <MDBox mt={3} p={3}>
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item>
                  <ButtonComponent
                    type="add"
                    onClick={handleAdd}
                  />
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
                    { field: "semiifm_code", label: "รหัส", width: "10%" },
                    { field: "semi_type", label: "ประเภท", width: "10%" },
                    { field: "semiifm_name", label: "ชื่อ", width: "10%" },
                    { field: "inbsemi_quantity", label: "จำนวน", },

                    {
                      field: "semiifm_id",
                      width: "5%",
                      render: (row) => {
                        const semiifm_id = row.semiifm_id; // ดึงค่า bom_code จาก row

                        return (
                          <a href={`/inboundSemiFG-details?semiifm_id=${encodeURIComponent(semiifm_id)}`}
                            style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}>
                            ดูรายละเอียด
                          </a>
                        );
                      }
                    },
                  ]}
                  data={inboundAll}
                  idField="semiifm_id"
                  onEdit={(id) => {
                    console.log("Edit clicked for ID:", id);
                    handleEdit(id);
                  }}
                  searchableColumns={["semiifm_code", "semi_type", "semiifm_name", "inbsemi_quantity" ]}
                  userRole={role}
                  showActions={false}
                  onFilterChange={setSearchFilters}
                />
              </Card>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
};
export default InboundSemiFG;