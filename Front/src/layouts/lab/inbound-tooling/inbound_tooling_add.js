import React, { useState, useEffect } from "react";
import { Grid, Card, MenuItem, Divider } from "@mui/material";
import { StyledMenuItem, StyledSelect } from "common/Global.style";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import DropDownAPI from "api/DropDownAPI";
import InBoundToolingAPI from "api/InBoundToolingAPI";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import SupplierAPI from "api/SupplierAPI";
import ToolingAPI from "api/ToolingAPI";
import TLFormComponent from "../components/tooling_modal";
import PrintBarCodeToolingModal from "../components/tl_barcode";
import TransactionAPI from "api/TransactionLogAPI";
import { GlobalVar } from "../../../common/GlobalVar";

const InboundToolingAdd = () => {
  const [dropdownFac, setDropDownFac] = useState([]);
  const [dropdownWH, setDropDownWH] = useState([]);
  const [dropdownZone, setDropDownZone] = useState([]);
  const [dropdownLoc, setDropDownLoc] = useState([]);
  const [dropdownTL, setDropDownTL] = useState([]);
  const [dropdownSup, setDropDownSup] = useState([]);

  const [Form, setForm] = useState({
    rm_id: "",
    fty_id: "",
    wh_id: "",
    zn_id: "",
    loc_id: "",
    tlifm_id: "",
    tlifm_type: "",
    sup_id: "",
    inbtl_remark: "",
    inbtl_txn_low: "",
    inbtl_txn_medium: "",
    inbtl_txn_high: "",
    inbtl_rem_low: "",
    inbtl_rem_medium: "",
    inbtl_rem_high: "",
  });
  const [apiData, setApiData] = useState(null);
  const [isDropdownLoaded, setIsDropdownLoaded] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const [mode, setMode] = useState("add"); // ตัวแปรเพื่อจัดการโหมด add/edit
  const [modalOpen, setModalOpen] = useState(false); // สถานะ Modal
  const [inbtlId, setInbtlId] = useState(null); // เก็บ inbtl_id หลังจาก submit
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const inbtl_id = params.get("inbtl_id");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const uid = GlobalVar.getUserId(); // ✅ ดึง user_id จาก GlobalVar
    setUserId(uid);
  }, []);



  const handleModalClose = () => {
    setModalOpen(false); // ปิด Modal
    setInbtlId(null); // ล้างค่า inbtl_id
    navigate("/inbound/inboundtooling");
  };


  const fetchDropdownData = async (fetchFunction, setState) => {
    try {
      const response = await fetchFunction();
      if (response.isCompleted && response.data.length > 0) {
        setState(response.data);
      } else {
        console.error("Error fetching data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDropdownData(
        () => DropDownAPI.getInbFactoryDropdown(userId),
        setDropDownFac
      );
    }
    fetchDropdownData(DropDownAPI.getToolingInfoDropdown, setDropDownTL);
    fetchDropdownData(DropDownAPI.getSupplierDropdown, setDropDownSup);
  }, [userId]);


  // เมื่อมีการเปลี่ยนแปลงในโรงงาน (fty_id) ให้ล้างค่า wh_id, zn_id, loc_id และดึงข้อมูลคลังใหม่
useEffect(() => {
  // ล้างค่า dropdown ของคลัง, Zone และ Location เมื่อเปลี่ยนโรงงาน
  if (mode === "add") {
    setForm(prev => ({
      ...prev,
      wh_id: "",
      zn_id: "",
      loc_id: ""
    }));
  }
  if (Form.fty_id) {
    const fetchWareHouseByFactory = async () => {
      try {
        const response = await DropDownAPI.getInbWHDropdown(Form.fty_id);
        if (response.isCompleted) {
          setDropDownWH(response.data);
        } else {
          setDropDownWH([]);
        }
      } catch (error) {
        console.error("Error fetching warehouses:", error);
        setDropDownWH([]);
      }
    };
    fetchWareHouseByFactory();
  } else {
    setDropDownWH([]);
  }
}, [Form.fty_id,mode]);

// เมื่อเลือกคลัง (wh_id) ให้ล้างค่า zn_id, loc_id และดึงข้อมูลโซนใหม่
useEffect(() => {
  // ล้างค่า Zone และ Location เมื่อเปลี่ยนคลัง
  if (mode === "add") {
    setForm(prev => ({
      ...prev,
      zn_id: "",
      loc_id: ""
    }));
  }
  if (Form.wh_id) {
    const fetchZoneByWarehouse = async () => {
      try {
        const response = await DropDownAPI.getZoneByDropdown(Form.wh_id);
        if (response.isCompleted) {
          setDropDownZone(response.data);
        } else {
          setDropDownZone([]);
        }
      } catch (error) {
        console.error("Error fetching zones:", error);
        setDropDownZone([]);
      }
    };
    fetchZoneByWarehouse();
  } else {
    setDropDownZone([]);
  }
}, [Form.wh_id,mode]);

// เมื่อเลือก Zone (zn_id) ให้ล้างค่า Location และดึงข้อมูลตำแหน่งใหม่
useEffect(() => {
  // ล้างค่า Location เมื่อเปลี่ยน Zone
  if (mode === "add") {
    setForm(prev => ({
      ...prev,
      loc_id: ""
    }));
  }
  if (Form.zn_id) {
    const fetchLocationByZone = async () => {
      try {
        const response = await DropDownAPI.getLocationByDropdown(Form.zn_id);
        if (response.isCompleted) {
          setDropDownLoc(response.data);
        } else {
          setDropDownLoc([]);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        setDropDownLoc([]);
      }
    };
    fetchLocationByZone();
  } else {
    setDropDownLoc([]);
  }
}, [Form.zn_id,mode]);




  useEffect(() => {
    const fetchSupplierName = async () => {
      if (Form.sup_id) {
        try {
          const response = await SupplierAPI.getSupplierByID(Form.sup_id);
          if (response.isCompleted && response.data) {
            setForm((prevForm) => ({
              ...prevForm,
              inbtl_supplier: response.data.sup_name || "",
            }));
          } else {
            console.error("Error fetching supplier:", response.message);
          }
        } catch (error) {
          console.error("Error fetching supplier:", error);
        }
      }
    };

    fetchSupplierName();
  }, [Form.sup_id]); // ใช้ barcode เป็น dependency


  const handleChange = async (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
      ...(name === "fty_id" && { wh_id: "", zn_id: "", loc_id: "" }), // ✅ เลือกโรงงาน -> ล้างค่า Warehouse, Zone, Location
      ...(name === "wh_id" && { zn_id: "", loc_id: "" }), // ✅ เลือก Warehouse -> ล้างค่า Zone, Location
      ...(name === "zn_id" && { loc_id: "" }) // ✅ เลือก Zone -> ล้างค่า Location
    }));

    // ✅ ถ้าเลือก Tooling ให้ดึงข้อมูลจาก API
    if (name === "tlifm_id") {
      fetchToolingInfoByID(value);
    }
  };


  // ฟังก์ชันดึงข้อมูล Tooling Info โดยใช้ tlifm_id
  const fetchToolingInfoByID = async (tlifm_id) => {
    if (!tlifm_id) return; // ถ้าไม่มีค่าให้หยุดการทำงาน

    try {
      const response = await ToolingAPI.getToolingInfoByID(tlifm_id);
      if (response.isCompleted && response.data) {
        const data = response.data;

        setForm((prevForm) => ({
          ...prevForm,
          tlifm_type: data.tl_type || "",  // ประเภท Tooling
          inbtl_txn_low: data.crt_txn_low || "",  // แจ้งเตือน Low
          inbtl_txn_medium: data.crt_txn_medium || "",  // แจ้งเตือน Medium
          inbtl_txn_high: data.crt_txn_high || "",  // แจ้งเตือน High
          inbtl_rem_low: data.crt_rem_low || "",  // คงเหลือ Low
          inbtl_rem_medium: data.crt_rem_medium || "",  // คงเหลือ Medium
          inbtl_rem_high: data.crt_rem_high || ""  // คงเหลือ High
        }));
      } else {
        console.error("Error fetching tooling data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching tooling data:", error);
    }
  };

  const handleGet = async (inbtl_id) => {
    try {
      setIsDropdownLoaded(false); // ❌ ป้องกันการโหลดข้อมูลซ้ำ
      const response = await InBoundToolingAPI.getInBoundToolByID(inbtl_id);
      if (!response.isCompleted || !response.data) {
        console.error("ไม่พบข้อมูลจาก API");
        return;
      }

      const data = response.data;
      setApiData(data); // ✅ เก็บข้อมูลจาก API

      // ✅ โหลด dropdown ทีละขั้นตอน
      const whResponse = await DropDownAPI.getWareHouseByFacDropdown(data.fty_id);
      setDropDownWH(whResponse.isCompleted ? whResponse.data : []);

      if (data.wh_id) {
        const znResponse = await DropDownAPI.getZoneByDropdown(data.wh_id);
        setDropDownZone(znResponse.isCompleted ? znResponse.data : []);
      }

      if (data.zn_id) {
        const locResponse = await DropDownAPI.getLocationByDropdown(data.zn_id);
        setDropDownLoc(locResponse.isCompleted ? locResponse.data : []);
      }

      setIsDropdownLoaded(true); // ✅ Dropdown โหลดเสร็จแล้ว
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (isDropdownLoaded && apiData) {
      setForm((prev) => ({
        ...prev,
        tlifm_id: apiData.tlifm_id || "",
        tlifm_type: apiData.tl_type || "",  // ✅ ประเภท
        fty_id: apiData.fty_id || "",
        wh_id: apiData.wh_id || "",
        zn_id: apiData.zn_id || "",
        loc_id: apiData.loc_id || "",
        sup_id: apiData.sup_id || "",
        inbtl_remark: apiData.inbtl_remark || "",
        inbtl_txn_low: apiData.crt_txn_low || "",  // ✅ แจ้งเตือน Low
        inbtl_txn_medium: apiData.crt_txn_medium || "",  // ✅ แจ้งเตือน Medium
        inbtl_txn_high: apiData.crt_txn_high || "",  // ✅ แจ้งเตือน High
        inbtl_rem_low: apiData.crt_rem_low || "",  // ✅ คงเหลือ Low
        inbtl_rem_medium: apiData.crt_rem_medium || "",  // ✅ คงเหลือ Medium
        inbtl_rem_high: apiData.crt_rem_high || "",  // ✅ คงเหลือ High
      }));
    }
  }, [isDropdownLoaded, apiData]);


  useEffect(() => {
    if (inbtl_id) {
      handleGet(inbtl_id);
    }
  }, [inbtl_id]);




  useEffect(() => {
    // ตรวจสอบว่า employeeId มีค่าอยู่หรือไม่
    if (inbtl_id) {
      setMode("edit"); // หากมี employeeId ให้ตั้งค่าโหมดเป็น 'edit'
    } else {
      setMode("add"); // หากไม่มี employeeId ให้ตั้งค่าโหมดเป็น 'create'
    }
  }, [inbtl_id]);



  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();

    if (mode === "edit") {
      Object.keys(Form).forEach((key) => {
        if (Form[key] !== undefined && Form[key] !== null) {
          form.append(key, Form[key]);
        }
      });
    } else if (mode === "add") {
      const payload = {
        ...Form,
        tlifm_id: Form.tlifm_id || "",
        rm_id: Form.rm_id || "",
        fty_id: Form.fty_id || "",
        wh_id: Form.wh_id || "",
        zn_id: Form.zn_id || "",
        loc_id: Form.loc_id || "",
        sup_id: Form.sup_id || "",
        inbtl_remark: Form.inbtl_remark || "",
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] !== undefined && payload[key] !== null) {
          form.append(key, payload[key]);
        }
      });
    }

    try {
      let response;
      if (inbtl_id && mode === "edit") {
        response = await InBoundToolingAPI.updateInBoundTool(inbtl_id, form);
      } else if (mode === "add") {
        response = await InBoundToolingAPI.createInBoundTool(form);
      }

      if (response.isCompleted) {
        const newInbtlId = response.data.inbtl_id; // ดึง `inbtl_id` ที่สร้างใหม่
        setInbtlId(newInbtlId);

        // 🔹 ดึงข้อมูล dropdown text แทนค่า value
        const fty_text = dropdownFac.find((item) => item.value === Form.fty_id)?.text || "";
        const wh_text = dropdownWH.find((item) => item.value === Form.wh_id)?.text || "";
        const zn_text = dropdownZone.find((item) => item.value === Form.zn_id)?.text || "";
        const loc_text = dropdownLoc.find((item) => item.value === Form.loc_id)?.text || "";
        const sup_text = dropdownSup.find((item) => item.value === Form.sup_id)?.text || "";

        // 🔹 ดึงข้อมูลเพิ่มเติมจาก tlifm_id
        let toolingInfoData = {};
        if (Form.tlifm_id) {
          const toolingInfoResponse = await ToolingAPI.getToolingInfoByID(Form.tlifm_id);
          if (toolingInfoResponse.isCompleted && toolingInfoResponse.data) {
            toolingInfoData = toolingInfoResponse.data;
          }
        }

        // 🔹 สร้าง payload สำหรับ transaction log
        const logPayload = {
          log_type: "INBOUND",
          log_ctgy: "TOOLING",
          log_action: mode === "add" ? "CREATED" : "UPDATED",
          ref_id: newInbtlId,
          transaction_data: {
            fty_name: fty_text,
            wh_name: wh_text,
            zn_name: zn_text,
            loc_name: loc_text,
            sup_name: sup_text,
            ...toolingInfoData, // รวมข้อมูลจาก `getToolingInfoByID`
          },
        };

        console.log("📌 Transaction Log Payload:", logPayload);
        await TransactionAPI.createLog(logPayload);

        setAlert({
          show: true,
          type: "success",
          title: mode === "add" ? "สร้างข้อมูลสำเร็จ" : "แก้ไขข้อมูลสำเร็จ",
          message: response.message,
        });

        setTimeout(() => {
          if (mode === "edit") {
            navigate("/inbound/inboundtooling");
          } else {
            setModalOpen(true);
          }
        }, 1500);
      } else {
        setAlert({
          show: true,
          type: "error",
          title: mode === "add" ? "สร้างข้อมูลไม่สำเร็จ" : "แก้ไขข้อมูลไม่สำเร็จ",
          message: response.message,
        });
      }
    } catch (error) {
      console.error("❌ Error saving data:", error);
    }
  };


  const navigate = useNavigate();
  const handleClose = () => {
    navigate(-1);
  };



  const handleTlFormClose = async (newtlifmId) => {
    setOpen(false);

    if (newtlifmId) {
      try {
        // 1. รีเฟรช dropdownTlInfo ใหม่
        const response = await DropDownAPI.getToolingInfoDropdown();
        if (response.isCompleted) {
          setDropDownTL(response.data);

          // 2. รอให้ dropdown อัปเดตก่อน แล้วค่อยตั้งค่า tlifm_id
          setTimeout(() => {
            setForm((prevForm) => ({
              ...prevForm,
              tlifm_id: newtlifmId,
            }));
          }, 300); // ใช้ setTimeout ให้ dropdown โหลดก่อน

          fetchToolingInfoByID(newtlifmId);
        } else {
          console.error("Error fetching updated raw info dropdown:", response.message);
        }
      } catch (error) {
        console.error("Error fetching raw info dropdown:", error);
      }
    }
  };



  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        {/* Title */}
        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="inherit" fontWeight="bold">
            {mode === "add" ? "Inbound / Tooling / เพิ่ม" : "Inbound / Tooling / เเก้ไข"}
          </MDTypography>
        </MDBox>

        {/* Details Section */}
        <MDBox mt={5}>
          <Card>
            <MDBox m={3} p={5}>
              <MDTypography variant="h4" fontWeight="bold" color="warning" gutterBottom sx={{ mb: 5 }}>
                รายละเอียด
              </MDTypography>

              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={6} md={6} lg={6} >
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                          Tooling
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <StyledSelect
                        sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                        name="tlifm_id"
                        value={Form.tlifm_id}
                        onChange={handleChange}
                      >
                        {dropdownTL.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                          โรงงาน
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <StyledSelect
                        sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                        name="fty_id"
                        value={Form.fty_id}
                        onChange={handleChange}
                      >
                        {dropdownFac.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                          คลัง
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <StyledSelect
                        sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                        name="wh_id"
                        value={Form.wh_id}
                        onChange={handleChange}
                        disabled={!Form.fty_id}
                      >
                        {dropdownWH.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                          หมายเหตุ
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <MDInput
                        sx={{ width: "600px", maxWidth: "100%" }}
                        name="inbtl_remark"
                        value={Form.inbtl_remark}
                        onChange={handleChange}
                      />
                    </Grid>

                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={6} >
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                          ประเภท
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} >
                      <MDInput
                        sx={{ width: "300px", maxWidth: "100%" }}
                        name="tlifm_type"
                        value={Form.tlifm_type}
                        onChange={handleChange}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                          Zone
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} >
                      <StyledSelect
                        sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                        name="zn_id"
                        value={Form.zn_id}
                        onChange={handleChange}
                        disabled={!Form.wh_id}
                      >
                        {dropdownZone.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                          Location
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} >
                      <StyledSelect
                        sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                        name="loc_id"
                        value={Form.loc_id}
                        onChange={handleChange}
                        disabled={!Form.zn_id}
                      >
                        {dropdownLoc.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}></Grid>
                    <Grid item xs={12} sm={8} md={9}></Grid>
                    <Grid item xs={12} sm={4} md={3}></Grid>
                    <Grid item xs={12} sm={8} md={9}></Grid>
                    <Grid item xs={12} sm={4} md={3}></Grid>
                    <Grid item xs={12} sm={8} md={9}></Grid>

                  </Grid>
                </Grid>
              </Grid>

              <Divider
                sx={{
                  position: "absolute", // ทำให้สามารถจัดวางตำแหน่งด้วย left และ transform
                  left: "50%", // ตั้งจุดเริ่มต้นให้อยู่กึ่งกลาง
                  transform: "translateX(-50%)", // เลื่อนเส้นให้อยู่ตรงกลาง
                  width: "95%", // ขยายความยาวของเส้นไปซ้ายและขวา (ปรับตามต้องการ เช่น 90%)
                  height: "4px", // ความหนาของเส้น
                  backgroundColor: "#000000", // สีของเส้น
                }}
              />
              {/* Supplier Section */}
              <MDBox mt={6} mb={3}>
                <MDTypography variant="h4" fontWeight="bold" color="warning" gutterBottom sx={{ mt: 5 }}>
                  Supplier
                </MDTypography>
                <Grid container spacing={2} >
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <Grid container alignItems="center">
                      <Grid item xs={12} sm={4} md={3}>
                        <MDBox display="flex" alignItems="center" justifyContent="center">
                          <MDTypography variant="h6" color="inherit"  >
                            Supplier
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={8} md={9}>
                        <StyledSelect
                          sx={{ width: "400px", maxWidth: "100%", height: "45px" }}
                          name="sup_id"
                          value={Form.sup_id}
                          onChange={handleChange}
                          displayEmpty
                        >
                          <StyledMenuItem value="" disabled>
                            -- รหัส --
                          </StyledMenuItem>
                          {dropdownSup.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.text}
                            </MenuItem>
                          ))}
                        </StyledSelect>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} sm={6} md={6} lg={6}></Grid>
                </Grid>
              </MDBox>
              <Divider
                sx={{
                  position: "absolute", // ทำให้สามารถจัดวางตำแหน่งด้วย left และ transform
                  left: "50%", // ตั้งจุดเริ่มต้นให้อยู่กึ่งกลาง
                  transform: "translateX(-50%)", // เลื่อนเส้นให้อยู่ตรงกลาง
                  width: "95%", // ขยายความยาวของเส้นไปซ้ายและขวา (ปรับตามต้องการ เช่น 90%)
                  height: "4px", // ความหนาของเส้น
                  backgroundColor: "#000000", // สีของเส้น
                }}
              />





              <MDBox mt={10}>
                <MDTypography variant="h4" fontWeight="bold" color="warning" gutterBottom sx={{ mt: 6 }}>
                  เกณฑ์
                </MDTypography>
              </MDBox>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={6} lg={6}></Grid>
                <Grid item xs={12} sm={6} md={6} lg={6}></Grid>
              </Grid>

              <MDBox mt={3} mb={3}>
                <MDTypography variant="h6" color="dark" gutterBottom sx={{ textDecoration: "underline" }}>
                  กำหนดวันเบิก-คืน
                </MDTypography>
              </MDBox>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4} lg={4}>
                  <Grid container alignItems="center">
                    <Grid item xs={12} lg={4}>
                      <MDBox display="flex" alignItems="center" justifyContent="center">
                        <MDTypography variant="h6" color="inherit">
                          แจ้งเตือนครั้งที่ 1   (Low Level)
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} lg={8}>
                      <MDBox display="flex" alignItems="center" sx={{ gap: 4 }} >
                        <MDInput
                          sx={{ width: "300px", maxWidth: "100%" }}
                          name="inbtl_txn_low"
                          value={Form.inbtl_txn_low}
                          onChange={handleChange}
                          disabled
                        />
                        <MDTypography variant="h6" color="inherit">
                          วัน
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                  <Grid container alignItems="center">
                    <Grid item xs={12} lg={4}>
                      <MDBox display="flex" alignItems="center" justifyContent="center">
                        <MDTypography variant="h6" color="inherit">
                          แจ้งเตือนครั้งที่ 2  (Medium Level)
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} lg={8}>
                      <MDBox display="flex" alignItems="center" sx={{ gap: 4 }} >
                        <MDInput
                          sx={{ width: "300px", maxWidth: "100%" }}
                          name="inbtl_txn_medium"
                          value={Form.inbtl_txn_medium}
                          onChange={handleChange}
                          disabled
                        />
                        <MDTypography variant="h6" color="inherit">
                          วัน
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                  <Grid container alignItems="center">
                    <Grid item xs={12} lg={4}>
                      <MDBox display="flex" alignItems="center" justifyContent="center">
                        <MDTypography variant="h6" color="inherit">
                          แจ้งเตือนครั้งที่ 3   (High Level)
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} lg={8}>
                      <MDBox display="flex" alignItems="center" sx={{ gap: 4 }} >
                        <MDInput
                          sx={{ width: "300px", maxWidth: "100%" }}
                          name="inbtl_txn_high"
                          value={Form.inbtl_txn_high}
                          onChange={handleChange}
                          disabled
                        />
                        <MDTypography variant="h6" color="inherit">
                          วัน
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

             


              <Grid container>
                <Grid item xs={12}>
                  {/* Submit Button */}
                  <MDBox mt={6} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>

                    {/* ปุ่ม Cancel อยู่ซ้ายสุด */}

                    {mode === "add" && (
                      <ButtonComponent type="cancel" sx={{ px: 4 }} onClick={handleClose} />
                    )}
                    {/* กล่องห่อปุ่ม master และ add/edit เพื่อให้อยู่ขวาสุดในจอใหญ่ และซ้อนกันในจอเล็ก */}
                    <MDBox display="flex" gap={2} ml={{ xs: 0, md: "auto" }} flexDirection={{ xs: "column", sm: "row" }} width={{ xs: "100%", sm: "auto" }}>

                      {mode === "edit" ? (

                        <ButtonComponent type="cancel" sx={{ px: 4 }} onClick={handleClose} />
                      ) : (
                        <ButtonComponent type="master" sx={{ px: 4 }} onClick={() => setOpen(true)} />
                      )}
                      <ButtonComponent type={mode === "add" ? "add" : "confirmedit"} sx={{ px: 4, width: { xs: "100%", sm: "auto" } }} onClick={handleSubmit} />

                    </MDBox>

                    {/* ฟอร์ม Modal */}
                    <TLFormComponent open={open} onClose={handleTlFormClose} />

                  </MDBox>
                </Grid>
              </Grid>

            </MDBox>
          </Card>
        </MDBox>
      </MDBox>

      {modalOpen && inbtlId && (
        <PrintBarCodeToolingModal
          open={modalOpen}
          onClose={handleModalClose}
          inbtl_id={inbtlId} // ส่ง inbrm_id ไปที่ Modal
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

export default InboundToolingAdd;
