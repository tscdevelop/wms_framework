import React, { useState, useEffect } from "react";
import { Grid, Card, Autocomplete, TextField } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import TableComponent from "../components/table_component";
import { GlobalVar } from "../../../common/GlobalVar";
import InventoryAPI from "api/InventoryAPI";
import DropDownAPI from "api/DropDownAPI";
import * as lang from "utils/langHelper";

const InventoryTooling = () => {
  const [inventory, setInventory] = useState([]); // ข้อมูลที่จะนำไปแสดงในตาราง
  const [allInventory, setAllInventory] = useState([]); // เก็บข้อมูลดิบทั้งหมด
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [dropdownFty, setDropDownFty] = useState([]);
  const [dropdownWH, setDropDownWH] = useState([]);
  const [selectedFty, setSelectedFty] = useState(null);
  const [selectedWH, setSelectedWH] = useState(null); // เก็บค่าที่เลือกจาก dropdown
  const [role, setRole] = useState("");


  useEffect(() => {
    const userRole = GlobalVar.getRole(); // ดึง Role จาก GlobalVar
    setRole(userRole);
  }, []);

  const fetchDropdownFty = async () => {
    try {
      const response = await DropDownAPI.getFactoryDropdown();
      if (response.isCompleted && response.data.length > 0) {
        const data = response.data.map((item) => ({
          value: String(item.value),
          text: item.text,
        }));
        setDropDownFty(data);
      } else {
        console.error("Error fetching factory dropdown:", response.message);
      }
    } catch (error) {
      console.error("Error fetching factory dropdown:", error);
    }
  };

  const fetchDropdownWH = async (fty_id) => {
    if (!fty_id) {
      setDropDownWH([]); // ถ้ายังไม่เลือกโรงงานให้ล้างข้อมูลคลัง
      setSelectedWH(null);
      return;
    }
    try {
      const response = await DropDownAPI.getWareHouseByFacDropdown(fty_id);
      if (response.isCompleted && response.data.length > 0) {
        const formattedData = response.data.map((item) => ({
          value: String(item.value),
          text: item.text,
        }));
        setDropDownWH(formattedData);
      } else {
        console.error("Error fetching dropdown data:", response.message);
        setDropDownWH([]);
      }
    } catch (error) {
      console.error("Error fetching dropdown:", error);
    }
  };

  useEffect(() => {
    fetchDropdownFty();
    fetchDropdownWH(); // ดึงข้อมูลประเภทคลังเบื้องต้น
  }, []);

  // เมื่อเลือกโรงงาน ให้โหลดคลังที่เกี่ยวข้อง
  const handleFtyChange = (event, newValue) => {
    if (newValue) {
      setSelectedFty({ value: newValue.value, text: newValue.text });
      fetchDropdownWH(newValue.value); // ดึงข้อมูลคลังตามโรงงาน
    } else {
      setSelectedFty(null);
      setDropDownWH([]);
      setSelectedWH(null);
    }
  };

  const handleWHChange = (event, newValue) => {
    if (newValue) {
      setSelectedWH({ value: newValue.value, text: newValue.text });
    } else {
      setSelectedWH(null);
    }
  };

  const fetchDataAll = async () => {
    try {
      const response = await InventoryAPI.getInventoryTooling();
      console.log("API Response:", response);
      if (response.isCompleted && Array.isArray(response.data)) {
        const newdata = response.data;
        setAllInventory(newdata); // เก็บข้อมูลทั้งหมดไว้สำหรับค้นหา
        setInventory(newdata);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataAll();
  }, []);

  // ฟังก์ชั่นค้นหาข้อมูลโดยใช้ text ของ dropdown ในการกรองกับ fty_name และ wh_name
  const handleSearch = () => {
    let filteredData = allInventory;
    if (selectedFty) {
      filteredData = filteredData.filter(
        (item) => String(item.fty_name).toLowerCase() === selectedFty.text.toLowerCase()
      );
    }
    if (selectedWH) {
      filteredData = filteredData.filter(
        (item) => String(item.wh_name).toLowerCase() === selectedWH.text.toLowerCase()
      );
    }
    setInventory(filteredData);
  };

  // คอลัมน์สำหรับ TableComponent
  const columns = [
    { field: "inbtl_code", label: "รหัสสินค้า", width: "13%" },
    { field: "tlifm_name", label: "ชื่อสินค้า", width: "13%" },
    { field: "fty_name", label: "โรงงาน", width: "13%" },
    { field: "wh_name", label: "คลัง", width: "20%" },
  ];

  const handleExport = async () => {
    try {
      setLoading(true); // แสดงสถานะ loading
      const response = await InventoryAPI.ExportInvTooling(
        selectedFty ? selectedFty.text : "", // ถ้าไม่ได้เลือกโรงงาน ส่งเป็นค่าว่าง
        selectedWH ? selectedWH.text : ""      // ถ้าไม่ได้เลือกคลัง ส่งเป็นค่าว่าง
      );

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
            Inventory / Tooling
          </MDTypography>
        </MDBox>
        <MDBox mt={5}>
          <Card>
            <MDBox mt={3} p={3}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4} lg={4}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4} lg={6}>
                      <MDBox
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("warehouse.warehouse_fac")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} lg={6}>
                      <Autocomplete
                        options={dropdownFty} // ใช้ข้อมูลจาก API
                        getOptionLabel={(option) => option.text || ""}
                        value={selectedFty}
                        isOptionEqualToValue={(option, value) =>
                          String(option.value) === String(value?.value)
                        }
                        onChange={handleFtyChange}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="-- โรงงาน --" variant="outlined" />
                        )}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4} lg={6}>
                      <MDBox
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("zone.zone_wh")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} lg={6}>
                      <Autocomplete
                        options={dropdownWH} // ใช้ข้อมูลจาก API
                        getOptionLabel={(option) => option.text || ""}
                        value={selectedWH}
                        isOptionEqualToValue={(option, value) =>
                          String(option.value) === String(value?.value)
                        }
                        onChange={handleWHChange}
                        disabled={!selectedFty}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="-- คลัง --" variant="outlined" />
                        )}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                  <Grid container spacing={2} justifyContent="space-between">
                    <Grid item>
                      <ButtonComponent type="searchIcon" onClick={handleSearch} />
                    </Grid>
                    <Grid item>
                      <ButtonComponent type="export" onClick={handleExport} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </MDBox>
            <MDBox p={5}>
              <Card>
                <TableComponent
                  columns={columns}
                  data={Array.isArray(inventory) ? inventory : []}
                  idField="notif_id"
                  showActions={false}
                  userRole={role}
                />
              </Card>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
};

export default InventoryTooling;
