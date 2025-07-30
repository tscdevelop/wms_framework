import React, { useState, useEffect } from "react";
import { Grid, Card } from "@mui/material";
import "jspdf-autotable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import TableComponent from "../components/table_component";
import InBoundToolingAPI from "api/InBoundToolingAPI";

const InbTranTooling = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [inboundAll, setInboundAll] = useState([]); // ข้อมูลทั้งหมด
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });


  const fetchDataAll = async () => {
    try {
      const response = await InBoundToolingAPI.getInBoundToolAll();
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
      const response = await InBoundToolingAPI.ExportInbTL(searchFilters); // เรียกใช้ API

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
            Inbound Transaction / Tooling
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
                    { field: "tlifm_code", label: "รหัส", width: "5%" },
                    { field: "tl_type", label: "ประเภท", width: "5%" },
                    { field: "tlifm_name", label: "ชื่อ", width: "15%" },
                    { field: "inbtl_quantity", label: "จำนวน", width: "10%" },
                    {
                      field: "tlifm_id",
                      width: "5%",
                      render: (row) => {
                        const tlifm_id = row.tlifm_id; // ดึงค่า bom_code จาก row

                        return (
                          <a
                            href={`/tran-tooling-details?tlifm_id=${encodeURIComponent(tlifm_id)}`}
                            style={{ textDecoration: "none", fontWeight: "bold" }}
                          >
                            ดูรายละเอียด
                          </a>
                        );
                      },
                    },
                  ]}
                  data={inboundAll}
                  idField="tlifm_id"
                  searchableColumns={["tlifm_code", "tl_type", "tlifm_name", "inbtl_quantity"]}
                  showActions={false}
                  onFilterChange={setSearchFilters} // ส่งฟังก์ชันไปเพื่อรับค่าค้นหา
                />
              </Card>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>

      
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
export default InbTranTooling;
