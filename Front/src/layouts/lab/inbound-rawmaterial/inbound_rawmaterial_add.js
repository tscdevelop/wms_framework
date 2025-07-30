
import React, { useState, useEffect } from "react";
import { Grid, Card, MenuItem, Divider, Checkbox, FormControlLabel } from "@mui/material";
import { StyledMenuItem, StyledSelect } from "common/Global.style";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import DropDownAPI from "api/DropDownAPI";
import InBoundAPI from "api/InBoundRawAPI";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import TransactionAPI from "api/TransactionLogAPI";
import SupplierAPI from "api/SupplierAPI";
import PrintBarCodeRmModal from "../components/rm_barcode";
import RawAPI from "api/RawMaterialAPI";
import CriteriaAPI from "api/CriteriaAPI";
import RawFormComponent from "../components/raw_modal";
import { GlobalVar } from "../../../common/GlobalVar";


const InboundRawAdd = () => {
  const [apiData, setApiData] = useState(null);
  const [isDropdownLoaded, setIsDropdownLoaded] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [dropdownFac, setDropDownFac] = useState([]);
  const [dropdownWH, setDropDownWH] = useState([]);
  const [dropdownZone, setDropDownZone] = useState([]);
  const [dropdownLoc, setDropDownLoc] = useState([]);
  const [dropdownUnit, setDropDownUnit] = useState([]);
  const [dropdownSup, setDropDownSup] = useState([]);
  const [dropdownRawInfo, setDropDownRawInfo] = useState([]);
  const [showInput, setShowInput] = useState(false); // State เพื่อติดตามสถานะ Checkbox

  const [Form, setForm] = useState({
    rm_id: "",
    fty_id: "",
    wh_id: "",
    zn_id: "",
    loc_id: "",
    rmifm_id: "",
    inbrm_is_bom_used: false,
    inbrm_bom: "",
    inbrm_grade: "",
    inbrm_lot: "",
    inbrm_width: "",
    inbrm_width_unitId: "",
    inbrm_length: "",
    inbrm_length_unitId: "",
    inbrm_weight: "",
    inbrm_weight_unitId: "",
    inbrm_thickness: "",
    inbrm_thickness_unitId: "",
    inbrm_quantity: "",
    inbrm_quantity_unitId: "",
    inbrm_total_weight: "",
    inbrm_remark: "",
    sup_id: "",
    crt_id: "",
    inbrm_supplier: "",
    inbrm_exp_low: "",
    inbrm_exp_medium: "",
    inbrm_exp_high: "",
    inbrm_rem_low: "",
    inbrm_rem_medium: "",
    inbrm_rem_high: "",
  });
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const [mode, setMode] = useState("add"); // ตัวแปรเพื่อจัดการโหมด add/edit
  const [modalOpen, setModalOpen] = useState(false); // สถานะ Modal
  const [inbrmId, setInbrmId] = useState(null); // เก็บ inbrm_id หลังจาก submit
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const inbrm_id = params.get("inbrm_id");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const uid = GlobalVar.getUserId(); // ✅ ดึง user_id จาก GlobalVar
    setUserId(uid);
  }, []);


  const handleModalClose = () => {
    setModalOpen(false); // ปิด Modal
    setInbrmId(null); // ล้างค่า inbrm_id
    navigate("/inbound/inrawmaterial");
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

  // เปลี่ยนการเรียก dropdownFac ด้วย API getInbFactoryDropdown โดยดึง user_id จาก GlobalVar
  useEffect(() => {
    if (userId) {
      fetchDropdownData(
        () => DropDownAPI.getInbFactoryDropdown(userId),
        setDropDownFac
      );
    }
    fetchDropdownData(DropDownAPI.getUnitDropDown, setDropDownUnit);
    fetchDropdownData(DropDownAPI.getSupplierDropdown, setDropDownSup);
    fetchDropdownData(DropDownAPI.getRawInfoDropdown, setDropDownRawInfo);
  }, [userId]);


  // เมื่อมีการเปลี่ยนแปลงในโรงงาน (fty_id) ให้ล้างค่า wh_id, zn_id, loc_id และดึงข้อมูลคลังใหม่
  useEffect(() => {
    // รีเซ็ตเฉพาะในโหมด "add"
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
  }, [Form.fty_id, mode]);
  

  // เมื่อเลือกคลัง (wh_id) ให้ล้างค่า zn_id, loc_id และดึงข้อมูลโซนใหม่
  useEffect(() => {
    // รีเซ็ตเฉพาะในโหมด "add"
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
  }, [Form.wh_id, mode]);
  
  useEffect(() => {
    // รีเซ็ตเฉพาะในโหมด "add"
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
  }, [Form.zn_id, mode]);
  






  useEffect(() => {
    const fetchRawMaterialInfo = async () => {
      if (Form.rmifm_id) {
        try {
          const response = await RawAPI.getRawInfoByID(Form.rmifm_id);
          if (response.isCompleted && response.data) {
            setForm((prevForm) => ({
              ...prevForm,
              rm_type: response.data.rm_type || "",
              inbrm_width: response.data.rmifm_width || "",
              inbrm_length: response.data.rmifm_length || "",
              inbrm_thickness: response.data.rmifm_thickness || "",
              inbrm_weight: response.data.rmifm_weight || "",
              inbrm_width_unitId: response.data.rmifm_width_unitId || "",
              inbrm_quantity_unitId: response.data.rmifm_product_unitId || "",
              inbrm_length_unitId: response.data.rmifm_length_unitId || "",
              inbrm_thickness_unitId: response.data.rmifm_thickness_unitId || "",
              inbrm_weight_unitId: response.data.rmifm_weight_unitId || "",

              inbrm_exp_low: response.data.crt_exp_low || "",
              inbrm_exp_medium: response.data.crt_exp_medium || "",
              inbrm_exp_high: response.data.crt_exp_high || "",
              inbrm_rem_low: response.data.crt_rem_low || "",
              inbrm_rem_medium: response.data.crt_rem_medium || "",
              inbrm_rem_high: response.data.crt_rem_high || "",
            }));
          } else {
            console.error("Error fetching raw material info:", response.message);
          }
        } catch (error) {
          console.error("Error fetching raw material info:", error);
        }
      }
    };

    fetchRawMaterialInfo();
  }, [Form.rmifm_id]); // เมื่อ `rmifm_id` เปลี่ยน จะเรียก API ใหม่



  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "sup_id") {
      // เมื่อเปลี่ยนค่า supplier
      try {
        const response = await SupplierAPI.getSupplierByID(value); // ดึงข้อมูล Supplier ตาม ID
        if (response.isCompleted && response.data) {
          setForm((prevForm) => ({
            ...prevForm,
            sup_id: value,
            inbrm_supplier: response.data.sup_name || "", // เซ็ตชื่อ Supplier
          }));
        } else {
          console.error("Error fetching supplier:", response.message);
        }
      } catch (error) {
        console.error("Error fetching supplier:", error);
      }
    } else if (name === "rmifm_id") {
      // เมื่อเปลี่ยนค่า Raw Material
      try {
        const response = await RawAPI.getRawInfoByID(value); // ดึงข้อมูล Raw Material ตาม ID
        if (response.isCompleted && response.data) {
          setForm((prevForm) => ({
            ...prevForm,
            rmifm_id: value,
            inbrm_width: response.data.rmifm_width || "",
            inbrm_length: response.data.rmifm_length || "",
            inbrm_thickness: response.data.rmifm_thickness || "",
            inbrm_weight: response.data.rmifm_weight || "",
            inbrm_width_unitId: response.data.rmifm_width_unitId || "",
            inbrm_length_unitId: response.data.rmifm_length_unitId || "",
            inbrm_thickness_unitId: response.data.rmifm_thickness_unitId || "",
            inbrm_weight_unitId: response.data.rmifm_weight_unitId || "",
            inbrm_quantity_unitId: response.data.rmifm_product_unitId || "",
          }));
        } else {
          console.error("Error fetching raw material info:", response.message);
        }
      } catch (error) {
        console.error("Error fetching raw material info:", error);
      }
    } else if (name === "crt_id") {
      // เมื่อเปลี่ยนค่า Raw Material
      try {
        const response = await CriteriaAPI.getCriteriaByID(value); // ดึงข้อมูล Raw Material ตาม ID
        if (response.isCompleted && response.data) {
          setForm((prevForm) => ({
            ...prevForm,
            crt_id: value,
            inbrm_exp_low: response.data.crt_exp_low || "",
            inbrm_exp_medium: response.data.crt_exp_medium || "",
            inbrm_exp_high: response.data.crt_exp_high || "",
            inbrm_rem_low: response.data.crt_rem_low || "",
            inbrm_rem_medium: response.data.crt_rem_medium || "",
            inbrm_rem_high: response.data.crt_rem_high || "",
          }));
        } else {
          console.error("Error fetching raw material info:", response.message);
        }
      } catch (error) {
        console.error("Error fetching raw material info:", error);
      }
    }



    else {
      // อัปเดตค่า field ปกติ

      let newValue = value;

      // ✅ ตรวจสอบว่าฟิลด์นี้เป็นตัวเลขหรือไม่
      const numberFields = [
        "inbrm_quantity",
      ];
      if (numberFields.includes(name)) {
        // ✅ กรองเฉพาะตัวเลขและห้ามติดลบ
        newValue = value.replace(/[^0-9]/g, "");
      }
      setForm((prevForm) => ({
        ...prevForm,
        [name]: newValue,
      }));
    }
  };

  useEffect(() => {
    const quantity = parseFloat(Form.inbrm_quantity) || 0;
    const weight = parseFloat(Form.inbrm_weight) || 0;
    const totalWeight = quantity * weight;

    setForm((prevForm) => ({
      ...prevForm,
      inbrm_total_weight: totalWeight.toFixed(2), // แสดงทศนิยม 2 ตำแหน่ง
    }));
  }, [Form.inbrm_quantity, Form.inbrm_weight]);



  useEffect(() => {
    const fetchSupplierName = async () => {
      if (Form.sup_id) {
        try {
          const response = await SupplierAPI.getSupplierByID(Form.sup_id);
          if (response.isCompleted && response.data) {
            setForm((prevForm) => ({
              ...prevForm,
              inbrm_supplier: response.data.sup_name || "",
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



  const handleCheckboxChange = (event) => {
    const checked = event.target.checked;
    setShowInput(checked);
    setForm((prev) => ({
      ...prev,
      inbrm_is_bom_used: checked, // ส่ง true/false ไปที่ API เมื่อ submit
    }));
  };

  const handleGet = async (inbrm_id) => {
    try {
      setIsDropdownLoaded(false); // ✅ ป้องกันการโหลดข้อมูลซ้ำ
      const response = await InBoundAPI.getInBoundByID(inbrm_id);
      if (!response.isCompleted || !response.data) {
        console.error(" ไม่พบข้อมูลจาก API");
        return;
      }

      const data = response.data;
      setApiData(data); // ✅ บันทึกข้อมูล API

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

      setIsDropdownLoaded(true); // ✅ ตอนนี้ dropdown พร้อมแล้ว
    } catch (error) {
      console.error(" Error fetching data:", error);
    }
  };


  // ✅ โหลดข้อมูลเข้า Form หลังจาก `apiData` ถูกกำหนดค่าแล้ว
  useEffect(() => {
    if (isDropdownLoaded && apiData) {
      setForm((prev) => ({
        ...prev,
        rm_type: apiData.rm_type || "",
        fty_id: apiData.fty_id || "",
        wh_id: apiData.wh_id || "",
        zn_id: apiData.zn_id || "",
        loc_id: apiData.loc_id || "",
        rmifm_id: apiData.rmifm_id || "",
        inbrm_bom: apiData.inbrm_bom || "",
        inbrm_grade: apiData.inbrm_grade || "",
        inbrm_lot: apiData.inbrm_lot || "",
        inbrm_quantity: apiData.inbrm_quantity || "",
        inbrm_total_weight: apiData.inbrm_total_weight || "",
        inbrm_remark: apiData.inbrm_remark || "",
        sup_id: apiData.sup_id || "",
        crt_id: apiData.crt_id || "",
        inbrm_supplier: apiData.inbrm_supplier || "",
        inbrm_quantity_unitId: apiData.inbrm_quantity_unitId || "",
        inbrm_is_bom_used: apiData.inbrm_is_bom_used || false,

      }));
      setShowInput(apiData.inbrm_is_bom_used || false);
    }
  }, [isDropdownLoaded, apiData]);
  // ✅ โหลดข้อมูลเมื่อ `apiData` พร้อม

  // เรียก API เมื่อ `inbrm_id` มีค่า
  useEffect(() => {
    if (inbrm_id) {
      handleGet(inbrm_id);
    }
  }, [inbrm_id]);




  useEffect(() => {
    // ตรวจสอบว่า employeeId มีค่าอยู่หรือไม่
    if (inbrm_id) {
      setMode("edit"); // หากมี employeeId ให้ตั้งค่าโหมดเป็น 'edit'
    } else {
      setMode("add"); // หากไม่มี employeeId ให้ตั้งค่าโหมดเป็น 'create'
    }
  }, [inbrm_id]);



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
        inbrm_total_weight: Form.inbrm_total_weight || "",
      };
      Object.keys(payload).forEach((key) => {
        if (payload[key] !== undefined && payload[key] !== null) {
          form.append(key, payload[key]);
        }
      });
    }

    console.log("🔹 Form Data before submission:");
    for (let pair of form.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      let response;
      if (inbrm_id && mode === "edit") {
        response = await InBoundAPI.updateInBound(inbrm_id, form);
      } else if (mode === "add") {
        response = await InBoundAPI.createInBound(form);
      }

      if (response.isCompleted) {
        const newInbrmId = response.data.inbrm_id; // ดึง inbrm_id ที่สร้างใหม่
        setInbrmId(newInbrmId);

        // 🔹 ดึงข้อมูล dropdown text แทนค่า value
        const fty_text = dropdownFac.find((item) => item.value === Form.fty_id)?.text || "";
        const wh_text = dropdownWH.find((item) => item.value === Form.wh_id)?.text || "";
        const zn_text = dropdownZone.find((item) => item.value === Form.zn_id)?.text || "";
        const loc_text = dropdownLoc.find((item) => item.value === Form.loc_id)?.text || "";

        // 🔹 ดึงข้อมูลเพิ่มเติมจาก rmifm_id
        let rawInfoData = {};
        if (Form.rmifm_id) {
          const rawInfoResponse = await RawAPI.getRawInfoByID(Form.rmifm_id);
          if (rawInfoResponse.isCompleted && rawInfoResponse.data) {
            rawInfoData = rawInfoResponse.data;
          }
        }

        // 🔹 สร้าง payload สำหรับ transaction log
        const logPayload = {
          log_type: "INBOUND",
          log_ctgy: "RAW_MATERIAL",
          log_action: mode === "add" ? "CREATED" : "UPDATED",
          ref_id: newInbrmId,
          transaction_data: {
            fty_name: fty_text,
            wh_name: wh_text,
            zn_name: zn_text,
            loc_name: loc_text,
            ...rawInfoData, // รวมข้อมูลที่ดึงจาก getRawInfoByID
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
            navigate("/inbound/inrawmaterial");
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



  const handleRamFormClose = async (newRawifmId) => {
    setOpen(false);

    if (newRawifmId) {
      try {
        // 1. รีเฟรช dropdownRawInfo ใหม่
        const response = await DropDownAPI.getRawInfoDropdown();
        if (response.isCompleted) {
          setDropDownRawInfo(response.data);

          // 2. รอให้ dropdown อัปเดตก่อน แล้วค่อยตั้งค่า rmifm_id
          setTimeout(() => {
            setForm((prevForm) => ({
              ...prevForm,
              rmifm_id: newRawifmId,
            }));
          }, 300); // ใช้ setTimeout ให้ dropdown โหลดก่อน
        } else {
          console.error("Error fetching updated raw info dropdown:", response.message);
        }
      } catch (error) {
        console.error("Error fetching raw info dropdown:", error);
      }
    }
  };


  const navigate = useNavigate();
  const handleClose = () => {
    navigate(-1);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        {/* Title */}
        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="inherit" fontWeight="bold">
            {mode === "add"
              ? "Inbound / Raw Material / เพิ่ม"
              : "Inbound / Raw Material / แก้ไข"}
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
                {/* Row 1 */}
                <Grid item xs={12} sm={6} md={6} lg={6} >
                  <Grid container alignItems="center">
                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                          Raw Material
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <StyledSelect
                        sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                        name="rmifm_id"
                        value={Form.rmifm_id}
                        onChange={handleChange}
                      >
                        {dropdownRawInfo.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={6} >
                  <Grid container alignItems="center">
                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center">
                        <MDTypography variant="h6" color="inherit">
                          ประเภท
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <MDBox display="flex" alignItems="center">
                        <MDInput
                          sx={{ width: "300px", maxWidth: "100%" }}
                          name="rm_type"
                          value={Form.rm_type}
                          onChange={handleChange}
                          disabled
                        />
                      </MDBox>
                    </Grid>
                  </Grid>
                </Grid>


                {/* Row 2: BOM. */}
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <Grid container alignItems="center">
                    <Grid item xs={12} sm={4} md={3} >
                      <MDBox display="flex" alignItems="center" justifyContent="center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showInput}
                              onChange={handleCheckboxChange}
                            />
                          }

                        />
                        <MDTypography variant="h6" color="inherit">
                          BOM
                        </MDTypography>

                      </MDBox>

                    </Grid>
                    <Grid item xs={12} sm={8} md={9} >
                      {showInput && (
                        <MDInput
                          sx={{ width: "300px", maxWidth: "100%" }}
                          name="inbrm_bom"
                          value={Form.inbrm_bom}
                          onChange={handleChange}
                          required
                          error={(Form.inbrm_bom || "").trim() === ""}
                          helperText={
                            (Form.inbrm_bom || "").trim() === "" ? "โปรดระบุ job No." : ""
                          }
                        />
                      )}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={6}>

                </Grid>




                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center">
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
                      <MDBox display="flex" alignItems="center" justifyContent="center">
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
                      >
                        {dropdownWH.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center">
                        <MDTypography variant="h6" color="inherit"  >
                          เกรด
                        </MDTypography>

                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <MDInput
                        sx={{ width: "300px", maxWidth: "100%" }}
                        name="inbrm_grade"
                        value={Form.inbrm_grade}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit"  >
                          Lot
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <MDInput
                        sx={{ width: "300px", maxWidth: "100%" }}
                        name="inbrm_lot"
                        value={Form.inbrm_lot}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center"  >
                        <MDTypography variant="h6" color="inherit" >
                          จำนวน
                        </MDTypography>

                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} display="flex" alignItems="center">
                      <MDInput
                        sx={{ width: "170px", maxWidth: "100%" }}
                        name="inbrm_quantity"
                        value={Form.inbrm_quantity}
                        onChange={handleChange}
                      />
                      <StyledSelect
                        sx={{ width: "130px", maxWidth: "100%", height: "45px" }}
                        name="inbrm_quantity_unitId"
                        value={Form.inbrm_quantity_unitId}
                        onChange={handleChange}
                        displayEmpty
                        disabled
                      >
                        <StyledMenuItem value="" disabled>
                          หน่วย
                        </StyledMenuItem>
                        {dropdownUnit.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center"  >
                        <MDTypography variant="h6" color="inherit" >
                          น้ำหนักรวม
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <MDInput
                        sx={{ width: "300px", maxWidth: "100%" }}
                        name="inbrm_total_weight"
                        value={Form.inbrm_total_weight}
                        disabled
                      />
                    </Grid>
                  </Grid>
                </Grid>


                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <Grid container spacing={3} alignItems="center" >
                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                          Zone
                        </MDTypography>

                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <StyledSelect
                        sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                        name="zn_id"
                        value={Form.zn_id}
                        onChange={handleChange}
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
                    <Grid item xs={12} sm={8} md={9}>
                      <StyledSelect
                        sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                        name="loc_id"
                        value={Form.loc_id}
                        onChange={handleChange}
                      >
                        {dropdownLoc.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit"  >
                          ความกว้าง
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} display="flex" alignItems="center">
                      <MDInput
                        sx={{ width: "170px", maxWidth: "100%" }}
                        name="inbrm_width"
                        value={Form.inbrm_width}
                        onChange={handleChange}
                        disabled
                      />
                      <StyledSelect
                        sx={{ width: "130px", maxWidth: "100%", height: "45px" }}
                        name="inbrm_width_unitId"
                        value={Form.inbrm_width_unitId}
                        onChange={handleChange}
                        displayEmpty
                        disabled
                      >
                        <StyledMenuItem value="" disabled>
                          หน่วย
                        </StyledMenuItem>
                        {dropdownUnit.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>


                    <Grid item xs={12} sm={4} md={3} >
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit"  >
                          ความยาว
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} display="flex" alignItems="center">
                      <MDInput
                        sx={{ width: "170px", maxWidth: "100%" }}
                        name="inbrm_length"
                        value={Form.inbrm_length}
                        onChange={handleChange}
                        disabled
                      />
                      <StyledSelect
                        sx={{ width: "130px", maxWidth: "100%", height: "45px" }}
                        name="inbrm_length_unitId"
                        value={Form.inbrm_length_unitId}
                        onChange={handleChange}
                        displayEmpty
                        disabled
                      >
                        <StyledMenuItem value="" disabled>
                          หน่วย
                        </StyledMenuItem>
                        {dropdownUnit.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>


                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center">
                        <MDTypography variant="h6" color="inherit"  >
                          ความหนา
                        </MDTypography>

                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} display="flex" alignItems="center">
                      <MDInput
                        sx={{ width: "170px", maxWidth: "100%" }}
                        name="inbrm_thickness"
                        value={Form.inbrm_thickness}
                        onChange={handleChange}
                        disabled
                      />
                      <StyledSelect
                        sx={{ width: "130px", maxWidth: "100%", height: "45px" }}
                        name="inbrm_thickness_unitId"
                        value={Form.inbrm_thickness_unitId}
                        onChange={handleChange}
                        displayEmpty
                        disabled
                      >
                        <StyledMenuItem value="" disabled>
                          หน่วย
                        </StyledMenuItem>
                        {dropdownUnit.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center">
                        <MDTypography variant="h6" color="inherit"  >
                          น้ำหนัก
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} display="flex" alignItems="center">
                      <MDInput
                        sx={{ width: "170px", maxWidth: "100%" }}
                        name="inbrm_weight"
                        value={Form.inbrm_weight}
                        onChange={handleChange}
                        disabled
                      />
                      <StyledSelect
                        sx={{ width: "130px", maxWidth: "100%", height: "45px" }}
                        name="inbrm_weight_unitId"
                        value={Form.inbrm_weight_unitId}
                        onChange={handleChange}
                        displayEmpty
                        disabled
                      >
                        <StyledMenuItem value="" disabled>
                          หน่วย
                        </StyledMenuItem>
                        {dropdownUnit.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>

                  </Grid>
                </Grid>

                <Grid item xs={12} >
                  <Grid container alignItems="center" >
                    <Grid item xs={12} sm={4} md={3} lg={1.5}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" mr={3} >
                        <MDTypography variant="h6" color="inherit"  >
                          หมายเหตุ
                        </MDTypography>

                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} lg={10.5}>
                      <MDInput
                        sx={{ width: "1025px", maxWidth: "100%" }}
                        name="inbrm_remark"
                        value={Form.inbrm_remark}
                        onChange={handleChange}
                      />
                    </Grid>
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

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <Grid container alignItems="center">
                      <Grid item xs={12} sm={4} md={3}>
                        <MDBox display="flex" alignItems="center" justifyContent="center">
                          <MDTypography variant="h6" color="inherit">
                            รหัส
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={8} md={9}>
                        <StyledSelect
                          sx={{ width: "300px", maxWidth: "100%" }}
                          name="sup_id"
                          value={Form.sup_id}
                          onChange={handleChange}
                          displayEmpty
                        >
                          <StyledMenuItem value="" disabled>-- รหัส --</StyledMenuItem>
                          {dropdownSup.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.text}
                            </MenuItem>
                          ))}
                        </StyledSelect>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Empty Grid to Maintain Layout */}
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



              {/* Grades Section */}
              <MDBox mt={10}>
                <MDTypography variant="h4" fontWeight="bold" color="warning" gutterBottom sx={{ mt: 6 }}>
                  เกณฑ์
                </MDTypography>
              </MDBox>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={6} lg={6} >

                </Grid>

                <Grid item xs={12} sm={6} md={6} lg={6}></Grid>
              </Grid>





              {/* Row 1: วันหมดอายุ */}

              <MDBox mt={3} mb={3}>
                <MDTypography variant="h6" color="dark" gutterBottom sx={{ textDecoration: "underline" }}>
                  วันหมดอายุ
                </MDTypography>
              </MDBox>



              {/* แจ้งเตือนครั้งที่ 1 */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={4} lg={4} >
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
                          sx={{ width: "250px", maxWidth: "100%" }}
                          name="inbrm_exp_low"
                          value={Form.inbrm_exp_low}
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
                {/* แจ้งเตือนครั้งที่ 2 */}
                <Grid item xs={12} md={4} lg={4} >
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
                          sx={{ width: "250px", maxWidth: "100%" }}
                          name="inbrm_exp_medium"
                          value={Form.inbrm_exp_medium}
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

                {/* แจ้งเตือนครั้งที่ 3 */}
                <Grid item xs={12} md={4} lg={4} >
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
                          sx={{ width: "250px", maxWidth: "100%" }}
                          name="inbrm_exp_high"
                          value={Form.inbrm_exp_high}
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


              {/* Row 2: จำนวนคงเหลือ */}
              <MDBox mt={6} mb={6}>
                <MDTypography variant="h6" color="dark" gutterBottom sx={{ textDecoration: "underline" }}>
                  จำนวนคงเหลือ
                </MDTypography>
              </MDBox>

              {/* แจ้งเตือนครั้งที่ 1 */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={4} lg={4} >
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
                          sx={{ width: "250px", maxWidth: "100%" }}
                          name="inbrm_rem_low"
                          value={Form.inbrm_rem_low}
                          onChange={handleChange}
                          disabled
                        />
                      </MDBox>
                    </Grid>
                  </Grid>
                </Grid>
                {/* แจ้งเตือนครั้งที่ 2 */}
                <Grid item xs={12} md={4} lg={4} >
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
                          sx={{ width: "250px", maxWidth: "100%" }}
                          name="inbrm_rem_medium"
                          value={Form.inbrm_rem_medium}
                          onChange={handleChange}
                          disabled
                        />

                      </MDBox>
                    </Grid>
                  </Grid>
                </Grid>

                {/* แจ้งเตือนครั้งที่ 3 */}
                <Grid item xs={12} md={4} lg={4} >
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
                          sx={{ width: "250px", maxWidth: "100%" }}
                          name="inbrm_rem_high"
                          value={Form.inbrm_rem_high}
                          onChange={handleChange}
                          disabled
                        />

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
                    <RawFormComponent open={open} onClose={handleRamFormClose} />

                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>

      {modalOpen && inbrmId && (
        <PrintBarCodeRmModal
          open={modalOpen}
          onClose={handleModalClose}
          inbrm_id={inbrmId} // ส่ง inbrm_id ไปที่ Modal
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

export default InboundRawAdd;
