    import React, { useState, useEffect } from "react";
    import { Grid, Card } from "@mui/material";
    import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
    import DashboardNavbar from "examples/Navbars/DashboardNavbar";
    import MDBox from "components/MDBox";
    import MDInput from "components/MDInput";
    import MDTypography from "components/MDTypography";
    import ButtonComponent from "../components/ButtonComponent";
    import TableComponent from "../components/table_component";
    import { useLocation, useNavigate } from "react-router-dom";
    import BOMAPI from "api/BOMAPI";
    import { GlobalVar } from "common/GlobalVar"; // ✅ เพิ่มหากยังไม่มี

    const BOMDetails = () => {
         // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [BomAll, setBomAll] = useState([]);
    const [form, setForm] = useState({
        so_code: "",
        so_cust_name: "",
        so_details: "",
    });
    const [BomCode, setBomCode] = useState("");
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    useEffect(() => {
        const so_id = params.get("so_id");
        if (so_id) {
        setBomCode(so_id);
        }
    }, [location.search]);

    const fetchDataAll = async (BomCode) => {
        try {
        const response = await BOMAPI.getBOMAllDetails(BomCode);
        if (response.isCompleted && response.data.length > 0) {
            const firstItem = response.data[0]; // ใช้ข้อมูลจากรายการแรกเพื่อตั้งค่า form
            setForm({
            so_code: firstItem.so_code || "",
            so_cust_name: firstItem.so_cust_name || "",
            so_details: firstItem.so_details || "",
            });
            setBomAll(response.data);
        } else {
            console.warn("No data found for the given BOM code.");
        }
        } catch (error) {
        console.error("Error fetching data:", error);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        if (BomCode) {
        fetchDataAll(BomCode);
        }
    }, [BomCode]);

    const navigate = useNavigate();
    const handleReturn = () => {
        navigate("/bom", { state: { userRole: GlobalVar.getRole(), menu_id: 22 } }); 
    };

    const [searchFilters, setSearchFilters] = useState({});
    // eslint-disable-next-line no-unused-vars
    const [searchValue, setSearchValue] = useState({});

    const handleExport = async () => {
        try {
            setLoading(true);
        
            const response = await BOMAPI.ExportBomDetails(BomCode, searchFilters);
            if (response.isCompleted) {
            // ทำอย่างอื่นได้ตามต้องการ
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
                        BOM / รายละเอียด BOM
                    </MDTypography>
                </MDBox>

                <MDBox mt={5}>
                    <Card>
                        <MDBox mt={3} p={3}>
                            <Grid container spacing={2} justifyContent="flex-start">
                                <Grid item xs={12} md={3}>
                                <MDBox display="flex" alignItems="center" sx={{ gap: 3 }}>
                                    <MDTypography variant="h6" color="inherit">
                                    เลขที่ใบ SO.
                                    </MDTypography>
                                    <MDInput
                                    sx={{ width: "300px", maxWidth: "100%" }}
                                    name="so_code"
                                    value={form.so_code}
                                    disabled
                                    />
                                </MDBox>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                <MDBox display="flex" alignItems="center" sx={{ gap: 3 }}>
                                    <MDTypography variant="h6" color="inherit">
                                    ชื่อลูกค้า
                                    </MDTypography>
                                    <MDInput
                                    sx={{ width: "400px", maxWidth: "100%" }}
                                    name="so_cust_name"
                                    value={form.so_cust_name}
                                    disabled
                                    />
                                </MDBox>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <MDBox display="flex" alignItems="center" sx={{ gap: 3 }}>
                                        <MDTypography variant="h6" color="inherit">
                                        รายละเอียด
                                        </MDTypography>
                                        <MDInput
                                        sx={{ width: "500px", maxWidth: "100%" }}
                                        name="so_details"
                                        value={form.so_details}
                                        disabled
                                        />
                                    </MDBox>
                                </Grid>
                                <Grid item xs={12} md={1}>
                                <ButtonComponent type="Iconprint" onClick={handleExport} />
                                </Grid>
                            </Grid>
                        </MDBox>

                        <MDBox p={5}>
                            <Card>
                                <TableComponent
                                    columns={[
                                        { field: "bom_number", label: "BOM", width: "5%" },
                                        { field: "fgifm_code", label: "รหัสFG", width: "5%" },
                                        { field: "fgifm_name", label: "FG", width: "5%" },
                                        { field: "inbfg_quantity", label: "จำนวนคงเหลือในคลัง", width: "5%" },
                                        { field: "bom_quantity", label: "BOM", width: "5%" },
                                        { field: "outbfgitm_quantity_remain", label: "จอง", width: "5%" },
                                        { field: "outbfgitm_withdr_count_remain", label: "เบิก", width: "5%" },
                                        {
                                        field: "outbfgitm_shipmt_count_remain",
                                        label: "ส่ง",
                                        width: "5%",
                                        render: (row) => {
                                            let bgColor = "";
                                            let textColor = "white";

                                            if (row.outbfgitm_shipmt_status === "COMPLETED") {
                                                bgColor = "#52D21233"; // เขียว
                                                textColor = "black";
                                            } else if (row.outbfgitm_shipmt_status === "PENDING") {
                                                bgColor = "#FF000033"; // แดง
                                                textColor = "black";
                                            } else if (row.outbfgitm_shipmt_status === "PARTIAL") {
                                                bgColor = "#FF8A0033"; // ส้ม
                                                textColor = "black";
                                            }
                                            

                                            return (
                                                <div
                                                    style={{
                                                    backgroundColor: bgColor,
                                                    color: textColor,
                                                    padding: "8px 0",
                                                    borderRadius: "4px",
                                                    width: "100%",
                                                    height: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: "bold",
                                                    }}
                                                >
                                                    {row.outbfgitm_shipmt_count_remain}
                                                </div>
                                            );
                                        },
                                        },
                                    ]}
                                    data={BomAll}
                                    idField="so_id"
                                    showActions={false}
                                    searchableColumns={["bom_number", "fgifm_code", "fgifm_name"]}
                                    onSearchChange={(val) => setSearchValue(val)} // รับค่าค้นหา
                                    onFilterChange={setSearchFilters} // ส่งฟังก์ชันไปเพื่อรับค่าค้นหา
                                />
                            </Card>
                        </MDBox>

                        <MDBox p={2} display="flex" justifyContent="flex-end">
                            <ButtonComponent type="return" onClick={handleReturn} />
                        </MDBox>
                    </Card>
                </MDBox>
            </MDBox>
        </DashboardLayout>
    );
    };

    export default BOMDetails;
