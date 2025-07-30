import React, { useState, useEffect } from "react";
import {  Grid, Card, MenuItem, Divider } from "@mui/material";
import { StyledMenuItem, StyledSelect } from "common/Global.style";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import DropDownAPI from "api/DropDownAPI";
import InBoundFGAPI from "api/InBoundFgAPI";
import SupplierAPI from "api/SupplierAPI";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import TransactionAPI from "api/TransactionLogAPI";
import FGAPI from "api/FgAPI";
import FGFormComponent from "../components/fg_modal";
import PrintBarCodeFgModal from "../components/fg_barcode";
import { GlobalVar } from "../../../common/GlobalVar";



const InboundFgAdd = () => {
  const [dropdownFG,setDropDownFG]= useState([]);
  const [dropdownFac,setDropDownFac]= useState([]);
  const [dropdownWH,setDropDownWH]= useState([]);
  const [dropdownZone,setDropDownZone]= useState([]);
  const [dropdownLoc,setDropDownLoc]= useState([]);
  const [dropdownSup,setDropDownSup]= useState([]);
  const [open, setOpen] = useState(false);
  const [isDropdownLoaded, setIsDropdownLoaded] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [Form, setForm] = useState({
    fgifm_id:"",
    fgifm_type:"",
    fty_id: "",
    wh_id: "",
    zn_id: "",
    loc_id: "",
    sup_id:"",
    inbfg_grade: "",
    inbfg_lot: "",
    inbfg_width: "",
    inbfg_width_unitId: "",
    inbfg_length: "",
    inbfg_length_unitId: "",
    inbfg_thickness: "",
    inbfg_thickness_unitId: "",
    inbfg_quantity: "",
    inbfg_quantity_unitId: "",
    inbfg_remark: "",
    inbfg_color: "",
    inbfg_exp_low: "",
    inbfg_exp_medium: "",
    inbfg_exp_high: "",
    inbfg_rem_low: "",
    inbfg_rem_medium: "",
    inbfg_rem_high: ""
  });
  
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const [mode, setMode] = useState("add"); // ตัวแปรเพื่อจัดการโหมด add/edit
  const [modalOpen, setModalOpen] = useState(false); // สถานะ Modal
  const [inbfgId, setInbfgId] = useState(null); // เก็บ inbfg_id หลังจาก submit
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const inbfg_id = params.get("inbfg_id");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const uid = GlobalVar.getUserId(); // ✅ ดึง user_id จาก GlobalVar
    setUserId(uid);
  }, []);


  const handleModalClose = () => {
    setModalOpen(false); // ปิด Modal
    setInbfgId(null); // ล้างค่า inbrm_id
    navigate("/inbound/inboundfg");
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

    fetchDropdownData(DropDownAPI.getFgInfoDropdown, setDropDownFG);
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


  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // ✅ ตรวจสอบว่าฟิลด์นี้เป็นตัวเลขหรือไม่
    const numberFields = [
      "inbfg_quantity",
    ];
    if (numberFields.includes(name)) {
      // ✅ กรองเฉพาะตัวเลขและห้ามติดลบ
      newValue = value.replace(/[^0-9]/g, "");
    }
    setForm((prevForm) => ({
      ...prevForm,
      [name]: newValue,
    }));
  };

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



  useEffect(() => {
    const fetchFGInfo = async () => {
      if (Form.fgifm_id) {
        try {
          const response = await FGAPI.getFgInfoByID(Form.fgifm_id);
          if (response.isCompleted && response.data) {
            setForm((prevForm) => ({
              ...prevForm,
              fgifm_type: response.data.fg_type || "",
              inbfg_width: response.data.fgifm_width || "",
              inbfg_length: response.data.fgifm_length || "",
              inbfg_thickness: response.data.fgifm_thickness || "",
              inbfg_width_unitId: response.data.fgifm_width_unit_name || "",
              inbfg_quantity_unitId: response.data.fgifm_product_name || "",
              inbfg_length_unitId: response.data.fgifm_length_unit_name || "",
              inbfg_thickness_unitId: response.data.fgifm_thickness_unit_name || "",
  
              inbfg_exp_low: response.data.crt_exp_low||"",
              inbfg_exp_medium: response.data.crt_exp_medium||"",
              inbfg_exp_high: response.data.crt_exp_high||"",
              inbfg_rem_low: response.data.crt_rem_low||"",
              inbfg_rem_medium: response.data.crt_rem_medium||"",
              inbfg_rem_high: response.data.crt_rem_high||"",
            }));
          } else {
            console.error("Error fetching raw material info:", response.message);
          }
        } catch (error) {
          console.error("Error fetching raw material info:", error);
        }
      }
    };
  
    fetchFGInfo();
  }, [Form.fgifm_id]); // เมื่อ `rmifm_id` เปลี่ยน จะเรียก API ใหม่

  
  
  const handleGet = async (inbfg_id) => {
    try {
      setIsDropdownLoaded(false); // ✅ ป้องกันการโหลดข้อมูลซ้ำ
      const response = await  InBoundFGAPI.getInBoundFgByID(inbfg_id);
      if (!response.isCompleted ) {
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
        fgifm_id: apiData.fgifm_id || "",
        fty_id: apiData.fty_id || "",
        wh_id: apiData.wh_id || "",
        zn_id: apiData.zn_id || "",
        loc_id: apiData.loc_id || "",
        fg_id: apiData.fg_id || "",
        sup_id: apiData.sup_id || "",
        inbfg_grade: apiData.inbfg_grade || "",
        inbfg_lot: apiData.inbfg_lot || "",
        inbfg_width: apiData.inbfg_width || "",
        inbfg_width_unitId: apiData.inbfg_width_unitId || "",
        inbfg_length: apiData.inbfg_length || "",
        inbfg_length_unitId: apiData.inbfg_length_unitId || "",
        inbfg_weight: apiData.inbfg_weight || "",
        inbfg_weight_unitId: apiData.inbfg_weight_unitId || "",
        inbfg_thickness: apiData.inbfg_thickness || "",
        inbfg_thickness_unitId: apiData.inbfg_thickness_unitId || "",
        inbfg_quantity: apiData.inbfg_quantity || "",
        inbfg_quantity_unitId: apiData.inbfg_quantity_unitId || "",
        inbfg_remark: apiData.inbfg_remark || "",
        inbfg_color: apiData.inbfg_color || "",
      }));
    }
  }, [isDropdownLoaded, apiData]); 
   // ✅ โหลดข้อมูลเมื่อ `apiData` พร้อม



  
  useEffect(() => {
    if (inbfg_id) {
      handleGet(inbfg_id);
    }
  }, [inbfg_id]);


  useEffect(() => {
    // ตรวจสอบว่า employeeId มีค่าอยู่หรือไม่
    if (inbfg_id) {
      setMode("edit"); // หากมี employeeId ให้ตั้งค่าโหมดเป็น 'edit'
    } else {
      setMode("add"); // หากไม่มี employeeId ให้ตั้งค่าโหมดเป็น 'create'
    }
  }, [inbfg_id]); 


 
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();

    if (mode === "edit") {
        // ✅ ใส่ค่าทุก field ที่ไม่ใช่ null/undefined
        Object.keys(Form).forEach((key) => {
            if (Form[key] !== undefined && Form[key] !== null) {
                form.append(key, Form[key]);
            }
        });
    } else if (mode === "add") {
        // ✅ เตรียม payload สำหรับสร้างใหม่
        const payload = {
            ...Form,
            fgifm_id: Form.fgifm_id || "",
            fty_id: Form.fty_id || "",
            wh_id: Form.wh_id || "",
            zn_id: Form.zn_id || "",
            loc_id: Form.loc_id || "",
            inbfg_grade: Form.inbfg_grade || "",
            inbfg_lot: Form.inbfg_lot || "",
            inbfg_color: Form.inbfg_color || "",
            inbfg_remark: Form.inbfg_remark || "",
            inbfg_quantity: Form.inbfg_quantity || "",
        };

        Object.keys(payload).forEach((key) => {
            if (payload[key] !== undefined && payload[key] !== null) {
                form.append(key, payload[key]);
            }
        });
    }


    for (let pair of form.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
        let response;
        if (inbfg_id && mode === "edit") {
            response = await InBoundFGAPI.updateInBoundFg(inbfg_id, form);
        } else if (mode === "add") {
            response = await InBoundFGAPI.createInBoundFg(form);
        }

        if (response.isCompleted) {
            const newInbfgId = response.data.inbfg_id; // ดึง inbfg_id ที่สร้างใหม่
            setInbfgId(newInbfgId);

            // 🔹 ดึงข้อมูล dropdown text แทนค่า value
            const fty_text = dropdownFac.find((item) => item.value === Form.fty_id)?.text || "";
            const wh_text = dropdownWH.find((item) => item.value === Form.wh_id)?.text || "";
            const zn_text = dropdownZone.find((item) => item.value === Form.zn_id)?.text || "";
            const loc_text = dropdownLoc.find((item) => item.value === Form.loc_id)?.text || "";

            // 🔹 ดึงข้อมูลเพิ่มเติมจาก fgifm_id
            let fgInfoData = {};
            if (Form.fgifm_id) {
                const fgInfoResponse = await FGAPI.getFgInfoByID(Form.fgifm_id);
                if (fgInfoResponse.isCompleted && fgInfoResponse.data) {
                    fgInfoData = fgInfoResponse.data;
                }
            }

            // 🔹 สร้าง payload สำหรับ transaction log
            const logPayload = {
                log_type: "INBOUND",
                log_ctgy: "FINISHED_GOODS",
                log_action: mode === "add" ? "CREATED" : "UPDATED",
                ref_id: newInbfgId,
                transaction_data: {
                    fty_name: fty_text,
                    wh_name: wh_text,
                    zn_name: zn_text,
                    loc_name: loc_text,
                    ...fgInfoData, // รวมข้อมูลที่ดึงจาก getFgInfoByID
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
                  navigate("/inbound/inboundfg");
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
  const handleClose = () =>{
      navigate(-1);
  };


  const handleFGFormClose = async (newfgifmId) => {
    setOpen(false);
  
    if (newfgifmId) {
      try {
        // 1. รีเฟรช dropdownRawInfo ใหม่
        const response = await DropDownAPI.getFgInfoDropdown();
        if (response.isCompleted) {
          setDropDownFG(response.data);
  
          // 2. รอให้ dropdown อัปเดตก่อน แล้วค่อยตั้งค่า semiifm_id
          setTimeout(() => {
            setForm((prevForm) => ({
              ...prevForm,
              fgifm_id: newfgifmId,
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
  



  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        {/* Title */}
        <MDBox  mt={2} ml={5}>
          <MDTypography variant="h3" color="inherit" fontWeight="bold">
          {mode === "add"
              ? "Inbound / FG / เพิ่ม"
              : "Inbound / FG / แก้ไข"}
          </MDTypography>
        </MDBox>

        {/* Details Section */}
        <MDBox mt={5}>
          <Card>
            <MDBox  m={3} p={5}>
              <MDTypography variant="h4" fontWeight="bold" color="warning" gutterBottom sx={{ mb: 5 }}>
                รายละเอียด
              </MDTypography>
              <Grid container spacing={3} alignItems="center">

                {/* Row 1 */}
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <Grid container  spacing={3} alignItems="center">
                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                           FG
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                    <StyledSelect  
                        sx={{ width: "300px", maxWidth: "100%" }}
                        name="fgifm_id"
                        value={Form.fgifm_id}
                        onChange={handleChange}
                      >
                        {dropdownFG.map((item) => (
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
                        sx={{ width: "300px", maxWidth: "100%" }}
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
                        sx={{  width: "300px", maxWidth: "100%" ,height: "45px"}}
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
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                           เกรด
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <MDInput
                        sx={{width:"300px" ,maxWidth:"100%"}}
                        name="inbfg_grade"
                        value={Form.inbfg_grade}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                           Lot
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <MDInput
                        sx={{width:"300px" ,maxWidth:"100%"}}
                        name="inbfg_lot"
                        value={Form.inbfg_lot}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                           จำนวน
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}  display="flex" alignItems="center">
                        <MDInput
                          sx={{ width:"170px" ,maxWidth:"100%"}}
                          name="inbfg_quantity"
                          value={Form.inbfg_quantity}
                          onChange={handleChange}
                        />
                        <MDInput 
                          sx={{width:"130px" ,maxWidth:"100%" ,height: "45px"}}
                          name="inbfg_quantity_unitId"
                          value={Form.inbfg_quantity_unitId}
                          onChange={handleChange}
                          disabled
                        />
                         
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
                        sx={{ width:"300px" ,maxWidth:"100%"}}
                        name="inbfg_remark"
                        value={Form.inbfg_remark}
                        onChange={handleChange}
                      />
                    </Grid>
                    
                  </Grid>
                </Grid>


                {/* Row 2 */}

                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                           ประเภท
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                    <MDInput
                        sx={{ width:"300px" ,maxWidth:"100%"}}
                        name="fgifm_type"
                        value={Form.fgifm_type}
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
                    <Grid item xs={12} sm={8} md={9}>
                      <StyledSelect  
                        sx={{ width: "300px", maxWidth: "100%" ,height: "45px"}}
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
                        sx={{ width: "300px", maxWidth: "100%" ,height: "45px"}}
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
                        <MDTypography variant="h6" color="inherit">
                           ความกว้าง
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} display="flex" alignItems="center">
                    <MDInput
                        sx={{ width:"170px" ,maxWidth:"100%"}}
                        name="inbfg_width"
                        value={Form.inbfg_width}
                        onChange={handleChange}
                        disabled
                      />
                      <MDInput 
                        sx={{ width:"130px" ,maxWidth:"100%" ,height: "45px"}}
                        name="inbfg_width_unitId"
                        value={Form.inbfg_width_unitId}
                        onChange={handleChange}
                        disabled
                       />
                       
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                           ความยาว
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} display="flex" alignItems="center">
                      <MDInput
                          sx={{ width:"170px" ,maxWidth:"100%"}}
                          name="inbfg_length"
                          value={Form.inbfg_length}
                          onChange={handleChange}
                          disabled
                        />
                        <MDInput 
                          sx={{ width:"130px" ,maxWidth:"100%" ,height: "45px"}}
                          name="inbfg_length_unitId"
                          value={Form.inbfg_length_unitId}
                          onChange={handleChange}
                          disabled
                        />
                          
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                           ความหนา
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} display="flex" alignItems="center">
                      <MDInput
                          sx={{ width:"170px" ,maxWidth:"100%"}}
                          name="inbfg_thickness"
                          value={Form.inbfg_thickness}
                          onChange={handleChange}
                          disabled
                        />
                        <MDInput 
                          sx={{ width:"130px" ,maxWidth:"100%" ,height: "45px"}}
                          name="inbfg_thickness_unitId"
                          value={Form.inbfg_thickness_unitId}
                          onChange={handleChange}
                          disabled
                        />
                         
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex" alignItems="center" justifyContent="center" >
                        <MDTypography variant="h6" color="inherit">
                           สี
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <MDInput
                        sx={{  width:"300px" ,maxWidth:"100%"}}
                        name="inbfg_color"
                        value={Form.inbfg_color}
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

            <MDBox mt={10}>
              <MDTypography variant="h4" fontWeight="bold" color="warning" gutterBottom sx={{ mt: 6 }}>
                  เกณฑ์
              </MDTypography>
            </MDBox> 
             <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={6} lg={6} ></Grid>
                <Grid item xs={12} sm={6} md={6} lg={6}></Grid>
            </Grid>

            

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
                              sx={{ width: "250px" ,maxWidth: "100%" }} 
                              name="inbfg_exp_low"
                              value={Form.inbfg_exp_low}
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
                              sx={{ width: "250px" ,maxWidth: "100%"}}
                              name="inbfg_exp_medium"
                              value={Form.inbfg_exp_medium}
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
                              sx={{  width: "250px" ,maxWidth: "100%"}} 
                              name="inbfg_exp_high"
                              value={Form.inbfg_exp_high}
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
                              sx={{ width: "250px",maxWidth: "100%" }} 
                              name="inbfg_rem_low"
                              value={Form.inbfg_rem_low}
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
                              sx={{ width: "250px" ,maxWidth: "100%"}}
                              name="inbfg_rem_medium"
                              value={Form.inbfg_rem_medium}
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
                              sx={{  width: "250px" ,maxWidth: "100%"}} 
                              name="inbfg_rem_high"
                              value={Form.inbfg_rem_high}
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
                        <FGFormComponent open={open} onClose={handleFGFormClose}/>
                        
                      </MDBox>
                    </Grid>
                  </Grid>

            </MDBox>
          </Card>
        </MDBox>
      </MDBox>

    
      {modalOpen && inbfgId && (
        <PrintBarCodeFgModal
          open={modalOpen}
          onClose={handleModalClose}
          inbfg_id={inbfgId} // ส่ง inbrm_id ไปที่ Modal
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

export default InboundFgAdd;
