import React, { useState, useEffect } from "react";
import { Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TableComponent from "../components/table_component";
import * as lang from "utils/langHelper";
import { useNavigate } from "react-router-dom";
import InBoundAPI from "api/InBoundRawAPI";
import ButtonComponent from "../components/ButtonComponent";



const InboundRawMaterial = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [inboundAll, setInboundAll] = useState([]); // ข้อมูลทั้งหมด



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

  const navigate = useNavigate();
  const handleAdd = () => {
    navigate("/inboundraw-add");
  };

  const handleEdit = (inbrm_id) => {
    navigate(`/inboundraw-add?inbrm_id=${inbrm_id}`); // ส่ง inbrm_id ผ่าน query string
  };

  const [searchFilters, setSearchFilters] = useState({});
  const handleExport = async () => {
    try {
      setLoading(true);
      // เรียกใช้ export → ได้เป็น Blob หรือ throw error
      await InBoundAPI.ExportInbRaw(searchFilters);

      // สำเร็จก็ไม่ต้องทำอะไรเพิ่ม (ไฟล์ดาวน์โหลดแล้ว)
      console.log("✅ Export Inbound Raw success!");
      // หรือแสดง alert “Export success” ตามต้องการ
    } catch (error) {
      console.error("❌ Error during export:", error);
      // จับ error มาทำ alert แจ้งผู้ใช้
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
            {lang.msg("title.inrawmaterial")}
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
                    { field: "rmifm_code", label: "รหัส", width: "10%" },
                    { field: "rm_type", label: "ประเภท", width: "10%" },
                    { field: "rmifm_name", label: "ชื่อ", width: "10%" },
                    { field: "inbrm_total_weight", label: "น้ำหนักรวม" },
                    { field: "inbrm_quantity", label: "จำนวน" },
                    {
                      field: "rm_id",
                      width: "5%",
                      render: (row) => {
                        const rm_id = row.rm_id; // ดึงค่า bom_code จาก row
                        const rmifm_id = row.rmifm_id;
                        return (
                          <a
                            href={`/inboundraw-details?rm_id=${encodeURIComponent(
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
                  onEdit={(id) => {
                    console.log("Edit clicked for ID:", id);
                    handleEdit(id);
                  }}
                  searchableColumns={[
                    "rmifm_code",
                    "rm_type",
                    "rmifm_name",
                    "inbrm_quantity",
                    "inbrm_total_weight",
                  ]}
                  showActions={false}
                  onFilterChange={setSearchFilters} // ส่งฟังก์ชันไปเพื่อรับค่าค้นหา
                />
              </Card>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
};
export default InboundRawMaterial;
