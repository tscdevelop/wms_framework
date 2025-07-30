


import React, { useState, useEffect } from "react";
import {  Grid, Card, MenuItem, Divider} from "@mui/material";
import { StyledMenuItem, StyledSelect } from "common/Global.style";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import DropDownAPI from "api/DropDownAPI";
import InBSemiFGAPI from "api/InBoundSemiFGAPI";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import TransactionAPI from "api/TransactionLogAPI";
import PrintBarCodeSemiModal from "../components/semifg_barcode";
import SemiAPI from "api/SemiAPI";
import SemiFGFormComponent from "../components/semifg_modal";
import { GlobalVar } from "../../../common/GlobalVar";



const InboundSemiFGAdd = () => {
  const [apiData, setApiData] = useState(null);

  const [isDropdownLoaded, setIsDropdownLoaded] = useState(false);
  const [dropdownFac,setDropDownFac]= useState([]);
  const [dropdownWH,setDropDownWH]= useState([]);
  const [dropdownZone,setDropDownZone]= useState([]);
  const [dropdownLoc,setDropDownLoc]= useState([]);
  const [dropdownSup,setDropDownSup]= useState([]);
  const [dropdownSemiInfo,setDropDownSemiInfo]= useState([]);


  const [Form, setForm] = useState({
    semiifm_id: "",
    fty_id: "",
    wh_id: "",
    zn_id: "",
    loc_id: "",
    sup_id: "",
    semi_type:"",
    inbsemi_grade: "",
    inbsemi_lot: "",
    inbsemi_width: "",
    inbsemi_width_name: "",
    inbsemi_length: "",
    inbsemi_length_name: "",
    inbsemi_thickness: "",
    inbsemi_thickness_name: "",
    inbsemi_quantity: "",
    inbsemi_quantity_name: "",
    inbsemi_total_weight: "",
    inbsemi_remark: "",
    inbsemi_color:"",
    inbsemi_exp_low: "",
    inbsemi_exp_medium: "",
    inbsemi_exp_high: "",
    inbsemi_rem_low: "",
    inbsemi_rem_medium: "",
    inbsemi_rem_high: "",
  });
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const [mode, setMode] = useState("add"); // ตัวแปรเพื่อจัดการโหมด add/edit
  const [modalOpen, setModalOpen] = useState(false); // สถานะ Modal
  const [inbSemiId, setInbSemiId] = useState(null); // เก็บ inbsemi_id หลังจาก submit
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const inbsemi_id = params.get("inbsemi_id");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const uid = GlobalVar.getUserId(); // ✅ ดึง user_id จาก GlobalVar
    setUserId(uid);
  }, []);


  //สำหรับ ปิด pop-up QRcode 
  const handleModalClose = () => {
    setModalOpen(false); // ปิด Modal
    setInbSemiId(null); // ล้างค่า inbsemi_id
    navigate("/inbound/inbsemifg");
  };

//สำหรับ ดึงข้อมูลDropdown ทั้งหมด
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
    fetchDropdownData(DropDownAPI.getSupplierDropdown, setDropDownSup);
    fetchDropdownData(DropDownAPI.getSemiInfoDropdown, setDropDownSemiInfo);
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





//สำหรับ ดึงข้อมูลจากการเลือก dropdown Semi FG
useEffect(() => {
  const fetchSemiFgInfo = async () => {
    if (Form.semiifm_id) {
      try {
        const response = await SemiAPI.getSemiFgByID(Form.semiifm_id);
        if (response.isCompleted && response.data) {
          setForm((prevForm) => ({
            ...prevForm,
            semi_type: response.data.semi_type || "",
            inbsemi_width: response.data.semiifm_width || "",
            inbsemi_length: response.data.semiifm_length || "",
            inbsemi_thickness: response.data.semiifm_thickness || "",
            inbsemi_width_name: response.data.semiifm_width_name || "",
            inbsemi_quantity_name: response.data.semiifm_product_name || "",
            inbsemi_length_name: response.data.semiifm_length_name || "",
            inbsemi_thickness_name: response.data.semiifm_thickness_name || "",
            inbsemi_exp_low: response.data.crt_exp_low||"",
            inbsemi_exp_medium: response.data.crt_exp_medium||"",
            inbsemi_exp_high: response.data.crt_exp_high||"",
            inbsemi_rem_low: response.data.crt_rem_low||"",
            inbsemi_rem_medium: response.data.crt_rem_medium||"",
            inbsemi_rem_high: response.data.crt_rem_high||"",
          }));
        } else {
          console.error("Error fetching Semi FG info:", response.message);
        }
      } catch (error) {
        console.error("Error fetching Semi FG info:", error);
      }
    }
  };

  fetchSemiFgInfo();
}, [Form.semiifm_id]); // เมื่อ `semiifm_id` เปลี่ยน จะเรียก API ใหม่


//สำหรับกรอกข้อมูล เเละเลือกDropdown  
const handleChange = async (e) => {
  const { name, value } = e.target;
   if (name === "semiifm_id") {
    // เมื่อเปลี่ยนค่า Dropdown ของ Semi FG
    try {
      const response = await SemiAPI.getSemiFgByID(value); // ดึงข้อมูล Semi FG ตาม ID
      if (response.isCompleted && response.data) {
        setForm((prevForm) => ({
          ...prevForm,
          semiifm_id: value,
          
    
          semi_type: response.data.semi_type || "",
          inbsemi_width: response.data.semiifm_width || "",
          inbsemi_length: response.data.semiifm_length || "",
          inbsemi_thickness: response.data.semiifm_thickness || "",
          inbsemi_width_name: response.data.semiifm_width_name || "",
          inbsemi_quantity_name: response.data.semiifm_product_name || "",
          inbsemi_length_name: response.data.semiifm_length_name || "",
          inbsemi_thickness_name: response.data.semiifm_thickness_name || "",

          inbsemi_exp_low: response.data.crt_exp_low||"",
          inbsemi_exp_medium: response.data.crt_exp_medium||"",
          inbsemi_exp_high: response.data.crt_exp_high||"",
          inbsemi_rem_low: response.data.crt_rem_low||"",
          inbsemi_rem_medium: response.data.crt_rem_medium||"",
          inbsemi_rem_high: response.data.crt_rem_high||"",
       
        }));
      } else {
        console.error("Error fetching Semi FG info:", response.message);
      }
    } catch (error) {
      console.error("Error fetching Semi FG info:", error);
    }
  } else {

    let newValue = value;

    // ✅ ตรวจสอบว่าฟิลด์นี้เป็นตัวเลขหรือไม่
    const numberFields = [
      "inbsemi_quantity",
    ];
    if (numberFields.includes(name)) {
      // ✅ กรองเฉพาะตัวเลขและห้ามติดลบ
      newValue = value.replace(/[^0-9]/g, "");
    }
    // อัปเดตค่า field ปกติ
    setForm((prevForm) => ({
      ...prevForm,
      [name]: newValue,
    }));
  }
};


//สำหรับดึงข้อมูลผ่าน inbsemi_id มาmap ที่field  
  const handleGet = async (inbsemi_id) => {
    try {
      setIsDropdownLoaded(false); // ✅ ป้องกันการโหลดข้อมูลซ้ำ
      const response = await InBSemiFGAPI.getInBoundByID(inbsemi_id);
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
        semi_type: apiData.semi_type || "",
        fty_id: apiData.fty_id || "",
        wh_id: apiData.wh_id || "",
        zn_id: apiData.zn_id || "",
        loc_id: apiData.loc_id || "",
        sup_id: apiData.sup_id || "",
        
        semiifm_id: apiData.semiifm_id || "",
        inbsemi_grade: apiData.inbsemi_grade || "",
        inbsemi_lot: apiData.inbsemi_lot || "",
        inbsemi_quantity: apiData.inbsemi_quantity || "",
        inbsemi_total_weight: apiData.inbsemi_total_weight || "",
        inbsemi_remark: apiData.inbsemi_remark || "",
        inbsemi_supplier: apiData.inbsemi_supplier || "",
        inbsemi_quantity_name: apiData.inbsemi_quantity_name || "",
        inbsemi_color: apiData.inbsemi_color || ""
      }));
    }
  }, [isDropdownLoaded, apiData]); 
   // ✅ โหลดข้อมูลเมื่อ `apiData` พร้อม
  
  // เรียก API เมื่อ `inbsemi_id` มีค่า
  useEffect(() => {
    if (inbsemi_id) {
      handleGet(inbsemi_id);
    }
  }, [inbsemi_id]);
  
  


  useEffect(() => {
    // ตรวจสอบว่า  มีค่าอยู่หรือไม่
    if (inbsemi_id) {
      setMode("edit"); // หากมี  ให้ตั้งค่าโหมดเป็น 'edit'
    } else {
      setMode("add"); // หากไม่มี  ให้ตั้งค่าโหมดเป็น 'create'
    }
  }, [inbsemi_id]); 


 

  //สำหรับ สร้างข้อมูล เเละเเก้ไขข้อมูล 
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
            fty_id: Form.fty_id || "",
            wh_id: Form.wh_id || "",
            zn_id: Form.zn_id || "",
            loc_id: Form.loc_id || "",
            inbsemi_grade: Form.inbsemi_grade || "",
            inbsemi_lot: Form.inbsemi_lot || "",
            inbsemi_quantity: Form.inbsemi_quantity || "",
            inbsemi_remark: Form.inbsemi_remark || "",
            inbsemi_color: Form.inbsemi_color || "",
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
        if (inbsemi_id && mode === "edit") {
            response = await InBSemiFGAPI.updateInBound(inbsemi_id, form);
        } else if (mode === "add") {
            response = await InBSemiFGAPI.createInBound(form);
        }

        if (response.isCompleted) {
            const newInbSemiId = response.data.inbsemi_id; // ดึง inbsemi_id ที่สร้างใหม่
            setInbSemiId(newInbSemiId);

            // 🔹 ดึงข้อมูล dropdown text แทนค่า value
            const fty_text = dropdownFac.find((item) => item.value === Form.fty_id)?.text || "";
            const wh_text = dropdownWH.find((item) => item.value === Form.wh_id)?.text || "";
            const zn_text = dropdownZone.find((item) => item.value === Form.zn_id)?.text || "";
            const loc_text = dropdownLoc.find((item) => item.value === Form.loc_id)?.text || "";

            // 🔹 ดึงข้อมูลเพิ่มเติมจาก semiifm_id
            let semiInfoData = {};
            if (Form.semiifm_id) {
                const semiInfoResponse = await SemiAPI.getSemiFgByID(Form.semiifm_id);
                if (semiInfoResponse.isCompleted && semiInfoResponse.data) {
                    semiInfoData = semiInfoResponse.data;
                }
            }

            // 🔹 สร้าง payload สำหรับ transaction log
            const logPayload = {
                log_type: "INBOUND",
                log_ctgy: "SEMI",
                log_action: mode === "add" ? "CREATED" : "UPDATED",
                ref_id: newInbSemiId,
                transaction_data: {
                  fty_name: fty_text,
                  wh_name: wh_text,
                  zn_name: zn_text,
                  loc_name: loc_text,
                    ...semiInfoData, // รวมข้อมูลที่ดึงจาก getSemiFgByID
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
                    navigate("/inbound/inbsemifg");
                } else {
                    setModalOpen(true);
                }
            }, 1500);
        } else {
            setAlert({
                show: true,
                type: "error",
                title: mode === "add" ? "สร้างข้อมูลไม่สำเร็จ" : "แก้ไขข้อไม่มูลสำเร็จ",
                message: response.message,
            });
        }
    } catch (error) {
        console.error("❌ Error saving data:", error);
    }
};

const handleRamFormClose = async (newSemiifmId) => {
  setOpen(false);

  if (newSemiifmId) {
    try {
      // 1. รีเฟรช dropdownRawInfo ใหม่
      const response = await DropDownAPI.getSemiInfoDropdown();
      if (response.isCompleted) {
        setDropDownSemiInfo(response.data);

        // 2. รอให้ dropdown อัปเดตก่อน แล้วค่อยตั้งค่า semiifm_id
        setTimeout(() => {
          setForm((prevForm) => ({
            ...prevForm,
            semiifm_id: newSemiifmId,
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
  const handleClose = () =>{
      navigate(-1);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        {/* Title */}
        <MDBox  mt={2} ml={5}>
          <MDTypography variant="h3" color="inherit" fontWeight="bold">
            {mode === "add" ? " Inbound / Semi FG / เพิ่ม ":" Inbound / Semi FG / เเก้ไข"}
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
              <Grid item xs={12} sm={6} md={6} lg={6} >
                <Grid container alignItems="center">
                  <Grid item xs={12} sm={4} md={3}>
                    <MDBox display="flex" alignItems="center" justifyContent="center" >
                      <MDTypography variant="h6" color="inherit">
                            Semi FG
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={8} md={9}>
                  <StyledSelect 
                      sx={{ width: "300px", maxWidth: "100%"   , height: "45px"}}
                      name="semiifm_id"
                      value={Form.semiifm_id}
                      onChange={handleChange}
                      >
                        {dropdownSemiInfo.map((item) => (
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
                        sx={{ width:"300px" ,maxWidth:"100%"}}
                        name="semi_type"
                        value={Form.semi_type}
                        onChange={handleChange}
                        disabled
                      />
                    </MDBox>
                  </Grid>
                </Grid>
              </Grid>

            
                

                


                <Grid item xs={12} sm={6} md={6} lg={6}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} sm={4} md={3}>
                        <MDBox display="flex" alignItems="center"  justifyContent="center">
                          <MDTypography variant="h6" color="inherit">
                            โรงงาน
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={8} md={9}>
                          <StyledSelect  
                          sx={{ width: "300px", maxWidth: "100%" , height: "45px"}}
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
                        <MDBox display="flex" alignItems="center"  justifyContent="center">
                          <MDTypography variant="h6" color="inherit">
                            คลัง
                          </MDTypography>
                          
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={8} md={9}>
                        <StyledSelect 
                          sx={{  width: "300px", maxWidth: "100%", height: "45px" }}
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
                        <MDBox display="flex"  alignItems="center"  justifyContent="center">
                            <MDTypography variant="h6" color="inherit"  >
                                เกรด
                            </MDTypography>
                            
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={8} md={9}>
                        <MDInput
                          sx={{width:"300px" ,maxWidth:"100%"}}
                          name="inbsemi_grade"
                          value={Form.inbsemi_grade}
                          onChange={handleChange}
                        />
                      </Grid>

                      <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex"  alignItems="center" justifyContent="center" >
                          <MDTypography variant="h6" color="inherit"  >
                              Lot
                          </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                      <MDInput
                        sx={{ width:"300px" ,maxWidth:"100%"}}
                        name="inbsemi_lot"
                        value={Form.inbsemi_lot}
                        onChange={handleChange}
                      />
                    </Grid>

                      <Grid item xs={12} sm={4} md={3}>
                        <MDBox display="flex"  alignItems="center" justifyContent="center"  >
                            <MDTypography variant="h6" color="inherit" >
                                จำนวน
                            </MDTypography>
                            
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={8} md={9} display="flex" alignItems="center">
                        <MDInput
                          sx={{ width:"170px" ,maxWidth:"100%"}}
                          name="inbsemi_quantity"
                          value={Form.inbsemi_quantity}
                          onChange={handleChange}
                        />
                        <MDInput 
                          sx={{width:"130px" ,maxWidth:"100%" , height: "45px"}}
                          name="inbsemi_quantity_name"
                          value={Form.inbsemi_quantity_name}
                          onChange={handleChange}
                          disabled
                        />
                      </Grid>
                    <Grid item xs={12}  sm={4} md={3} >
                      <MDBox display="flex"  alignItems="center"justifyContent="center"  >
                        <MDTypography variant="h6" color="inherit"  >
                          หมายเหตุ
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12}  sm={8} md={9}>
                      <MDInput
                        sx={{ width:"300px" ,maxWidth:"100%"}}
                        name="inbsemi_remark"
                        value={Form.inbsemi_remark}
                        onChange={handleChange}
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
                        sx={{ width: "300px", maxWidth: "100%"  ,height: "45px"}}
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
                      <MDBox display="flex"  alignItems="center" justifyContent="center" >
                          <MDTypography variant="h6" color="inherit"  >
                              ความกว้าง
                          </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} display="flex" alignItems="center">
                      <MDInput
                        sx={{ width:"170px" ,maxWidth:"100%"}}
                        name="inbsemi_width"
                        value={Form.inbsemi_width}
                        onChange={handleChange}
                        disabled
                      />
                      <MDInput 
                        sx={{ width:"130px" ,maxWidth:"100%" , height: "45px"}}
                        name="inbsemi_width_name"
                        value={Form.inbsemi_width_name}
                        onChange={handleChange}
                        disabled
                      />
                       
                    </Grid>

                    
                    <Grid item xs={12} sm={4}  md={3} >
                      <MDBox display="flex"  alignItems="center" justifyContent="center" >
                          <MDTypography variant="h6" color="inherit"  >
                              ความยาว
                          </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} display="flex" alignItems="center">
                      <MDInput
                        sx={{width:"170px" ,maxWidth:"100%"}}
                        name="inbsemi_length"
                        value={Form.inbsemi_length}
                        onChange={handleChange}
                        disabled
                      />
                      <MDInput 
                        sx={{ width:"130px" ,maxWidth:"100%",height: "45px"}}
                        name="inbsemi_length_name"
                        value={Form.inbsemi_length_name}
                        onChange={handleChange}
                        disabled
                      />
                    </Grid>
                    

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex"  alignItems="center"  justifyContent="center">
                          <MDTypography variant="h6" color="inherit"  >
                              ความหนา
                          </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} display="flex" alignItems="center">
                      <MDInput
                        sx={{ width:"170px" ,maxWidth:"100%"}}
                        name="inbsemi_thickness"
                        value={Form.inbsemi_thickness}
                        onChange={handleChange}
                        disabled
                      />
                      <MDInput 
                        sx={{ width:"130px" ,maxWidth:"100%",height: "45px"}}
                        name="inbsemi_thickness_name"
                        value={Form.inbsemi_thickness_name}
                        onChange={handleChange}
                        disabled
                      />
                       
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <MDBox display="flex"  alignItems="center" justifyContent="center">
                          <MDTypography variant="h6" color="inherit"  >
                              สี
                          </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} display="flex" alignItems="center">
                      <MDInput
                        sx={{ width:"300px" ,maxWidth:"100%"}}
                        name="inbsemi_color"
                        value={Form.inbsemi_color}
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
                    height: "2px", // ความหนาของเส้น
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
                    height: "2px", // ความหนาของเส้น
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
                              sx={{ width: "250px" ,maxWidth: "100%" }} 
                              name="inbsemi_exp_low"
                              value={Form.inbsemi_exp_low}
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
                              name="inbsemi_exp_medium"
                              value={Form.inbsemi_exp_medium}
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
                              name="inbsemi_exp_high"
                              value={Form.inbsemi_exp_high}
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
                              name="inbsemi_rem_low"
                              value={Form.inbsemi_rem_low}
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
                              name="inbsemi_rem_medium"
                              value={Form.inbsemi_rem_medium}
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
                              name="inbsemi_rem_high"
                              value={Form.inbsemi_rem_high}
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
                        <SemiFGFormComponent open={open} onClose={handleRamFormClose} />
                      </MDBox>
                    </Grid>
                  </Grid>

            </MDBox>
          </Card>
        </MDBox>
      </MDBox>

      {modalOpen && inbSemiId && (
        <PrintBarCodeSemiModal
          open={modalOpen}
          onClose={handleModalClose}
          inbsemi_id={inbSemiId} // ส่ง inbrm_id ไปที่ Modal
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

export default InboundSemiFGAdd;
