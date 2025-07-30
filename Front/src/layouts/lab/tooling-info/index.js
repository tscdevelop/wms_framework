import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  MenuItem,
  FormControl,
  FormHelperText
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import TableComponent from "../components/table_component";
import * as lang from "utils/langHelper";
import ToolingAPI from "api/ToolingAPI";
import { GlobalVar } from "../../../common/GlobalVar";
import { StyledSelect } from "common/Global.style";
import DropDownAPI from "api/DropDownAPI";
import MDButton from "components/MDButton";
const ToolingInfo = () => {
  // loading: ควบคุมสถานะการโหลดข้อมูลจาก API ถ้าเป็น true แสดงว่าข้อมูลกำลังโหลดอยู่
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [ToolingAll, setToolingAll] = useState([]);
  const [Form, setForm] = useState({
    tlifm_code: "",
    tl_id: "",
    crt_id: "",
    tlifm_name: "",
    tlifm_id: ""
  });
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const [confirmAlert, setConfirmAlert] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmEdit, setConfirmEdit] = useState(false);
  const [deleteCode, setDeleteCode] = useState(""); // รหัสโรงงานที่จะลบ
  const [mode, setMode] = useState("add"); // ตัวแปรเพื่อจัดการโหมด add/edit
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState({});
  const [dropdownTooling, setDropDownTooling] = useState([]);
  const [dropdownCri, setDropDownCri] = useState([]);


  useEffect(() => {
    const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
    setRole(userRole);
  }, []);



  const fetchDataAll = async () => {
    try {
      const response = await ToolingAPI.getToolingInfoAll();

      if (response.isCompleted) {
        const data = response.data;
        setToolingAll(data);
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




  const DropdownTooling = async () => {
    try {
      const response = await DropDownAPI.getToolingDropDown();
      if (response.isCompleted) {
        const data = response.data;
        setDropDownTooling(data);
      }
    } catch (error) {
      console.error("Error fetching  data :", error);
    }
  };
  useEffect(() => {
    DropdownTooling();
  }, []);

  const DropdownCriter = async () => {
    try {
      const response = await DropDownAPI.getCriterDropdown();
      if (response.isCompleted) {
        const data = response.data;
        setDropDownCri(data);
      }
    } catch (error) {
      console.error("Error fetching  data :", error);
    }
  };
  useEffect(() => {
    DropdownCriter();
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };




  const handleEdit = async (tlifm_id) => {
    try {
      const response = await ToolingAPI.getToolingInfoByID(tlifm_id);
      if (response.isCompleted) {
        const Data = response.data;
        // อัปเดต ZoneForm
        setForm(Data);
        // เปลี่ยนโหมดเป็น edit
        setMode("edit");
      }
    } catch (error) {
      console.error("Error fetching data for edit:", error);
    }
  };






  const validateForm = () => {
    const newErrors = {};

    if (!Form.tlifm_code || !Form.tlifm_code.trim()) {
      newErrors.tlifm_code = "กรุณากรอกรหัสเครื่องมือ";
    }

    if (!Form.tlifm_name || !Form.tlifm_name.trim()) {
      newErrors.tlifm_name = "กรุณากรอกชื่อเครื่องมือ";
    }

    if (!String(Form.crt_id || "").trim()) {
      newErrors.crt_id = "กรุณาเลือกเกณฑ์";
    }
    if (!String(Form.tl_id || "").trim()) {
      newErrors.tl_id = "กรุณาเลือกประเภทเครื่องมือ";
    }




    setErrors(newErrors);

    // Return true if no errors, otherwise false
    return Object.keys(newErrors).length === 0;
  };




  // ฟังก์ชันสำหรับสร้างข้อมูลใหม่
  const handleSubmit = async (e) => {
    e.preventDefault();



    // Show confirmation dialog before proceeding
    if (mode === "edit") {
      setConfirmEdit(true); // แสดง SweetAlert สำหรับการแก้ไข
    } else {
      setConfirmSubmit(true); // แสดง SweetAlert สำหรับการเพิ่ม
    }
  };


  const handleConfirmSubmit = async () => {
    if (!validateForm()) {
      setConfirmSubmit(false); // Close the dialog if validation fails
      setConfirmEdit(false);
      return;
    }



    try {
      let response;

      if (mode === "add") {
        // Payload สำหรับเพิ่มข้อมูล
        const payload = {
          tlifm_code: Form.tlifm_code || "",
          tlifm_name: Form.tlifm_name || "",
          tl_id: Form.tl_id || "",
          crt_id: Form.crt_id || "",

        };
        response = await ToolingAPI.createToolingInfo(payload);
      } else {
        // FormData สำหรับอัปเดตข้อมูล
        const formData = new FormData();
        formData.append("tlifm_code", Form.tlifm_code || "");
        formData.append("tlifm_name", Form.tlifm_name || "");
        formData.append("tl_id", Form.tl_id || "");
        formData.append("crt_id", Form.crt_id || "");
        response = await ToolingAPI.updateToolingInfo(Form.tlifm_id, formData); // ใช้ API updateSupplier
      }

      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: mode === "add" ? "เพิ่มสำเร็จ" : "แก้ไขสำเร็จ",
          message: response.message,
        });
        await fetchDataAll(); // โหลดข้อมูลใหม่
        setForm({
          tlifm_code: "",
          tl_id: "",
          crt_id: "",
          tlifm_name: "",
        });
        setMode("add");
      } else {
        setAlert({
          show: true,
          type: "error",
          title: mode === "add" ? "เพิ่มไม่สำเร็จ" : "แก้ไขไม่สำเร็จ",
          message: response.message,
        });
      }
    } catch (error) {
      console.error("Error during submit:", error);
    } finally {
      setConfirmSubmit(false); // Close the confirmation dialog
      setConfirmEdit(false);
    }
  };




  const handleDelete = async () => {
    try {
      const response = await ToolingAPI.deleteToolingInfo(deleteCode);
      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: "ลบสำเร็จ",
          message: response.message,
        });
        await fetchDataAll();
      } else {
        setAlert({
          show: true,
          type: "error",
          title: "ลบไม่สำเร็จ",
          message: response.message,
        });
      }
    } catch (error) {
      console.error("Error :", error);
    } finally {
      setConfirmAlert(false); // ซ่อน SweetAlert ยืนยัน
    }
  };


// นำเข้า useState หากยังไม่ได้ import
  const [selectedFile, setSelectedFile] = useState(null);
  // state สำหรับ key ของ input element เพื่อบังคับ re-mount
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // ปรับปรุง handleImportFile ให้เก็บไฟล์ที่เลือกไว้ใน state
  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setAlert({
        show: true,
        type: "error",
        title: "ข้อผิดพลาด",
        message: "กรุณาเลือกไฟล์ก่อนทำการอัปโหลด",
      });
      return;
    }
    console.log("📌 ไฟล์ที่เลือก:", file);
    setSelectedFile(file);
  };

  // ฟังก์ชันสำหรับส่งไฟล์ที่เลือกไปยัง API
  const handleSubmitImport = async () => {
    if (!selectedFile) return;
    try {
      const response = await ToolingAPI.importFileInfo(selectedFile);
      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: "อัปโหลดสำเร็จ",
          message: response.message,
        });
        await fetchDataAll();
        // เคลียร์ไฟล์ที่เลือก และอัปเดต key เพื่อให้ input re-mount ใหม่
        setSelectedFile(null);
        setFileInputKey(Date.now());
      } else {
        setAlert({
          show: true,
          type: "error",
          title: "อัปโหลดไม่สำเร็จ",
          message: response.message,
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  // ฟังก์ชันสำหรับลบไฟล์ที่เลือก (และรีเซ็ต input)
  const handleClearFile = () => {
    setSelectedFile(null);
    setFileInputKey(Date.now());
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="dark" fontWeight="bold">
            {lang.msg("title.toolinginfo")}
          </MDTypography>
        </MDBox>

        <MDBox mt={5}>
          <Card>
            <MDBox mt={3} p={3}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6} lg={5}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("semi.semi_code")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDInput
                          name="tlifm_code"
                          variant="outlined"
                          value={Form.tlifm_code}
                          onChange={handleInputChange}
                          sx={{ width: "300px", maxWidth: "100%" }}
                          error={!!errors.tlifm_code} // แสดงสีแดงถ้ามี error
                          helperText={errors.tlifm_code || ""} // แสดงข้อความเตือน
                          FormHelperTextProps={{
                            style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                          }}
                        />
                      </MDBox>
                    </Grid>

                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("raw_data.raw_type")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <FormControl
                          error={!!errors.tl_id}
                          sx={{ width: "300px", maxWidth: "100%", display: "flex", flexDirection: "column" }}
                        >
                          <StyledSelect
                            name="tl_id"
                            value={Form.tl_id || ""}
                            onChange={handleInputChange}
                            sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                            error={!!errors.tl_id} // แสดงสีแดงถ้ามี error
                            helperText={errors.tl_id || ""} // แสดงข้อความเตือน
                            FormHelperTextProps={{
                              style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                            }}
                          >
                            {(dropdownTooling || []).map((item) => (
                              <MenuItem key={item.value} value={item.value}>
                                {item.text}
                              </MenuItem>
                            ))}
                          </StyledSelect>
                          {errors.tl_id && (
                            <FormHelperText sx={{ color: "red" }}>
                              {errors.tl_id}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </MDBox>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={5} lg={6}>
                  <Grid container spacing={3} alignItems="center" >
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("semifg.semifg_name")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDInput
                          name="tlifm_name"
                          variant="outlined"
                          value={Form.tlifm_name}
                          onChange={handleInputChange}
                          sx={{ width: "300px", maxWidth: "100%" }}
                          error={!!errors.tlifm_name} // แสดงสีแดงถ้ามี error
                          helperText={errors.tlifm_name || ""} // แสดงข้อความเตือน
                          FormHelperTextProps={{
                            style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                          }}
                        />
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("raw_data.raw_criterion")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6} >
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <FormControl
                          error={!!errors.crt_id}
                          sx={{ width: "300px", maxWidth: "100%", display: "flex", flexDirection: "column" }}
                        >
                          <StyledSelect
                            name="crt_id"
                            value={Form.crt_id || ""}
                            onChange={handleInputChange}
                            sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                            error={!!errors.crt_id}
                            helperText={errors.crt_id || ""}
                          >
                            {(dropdownCri || []).map((item) => (
                              <MenuItem key={item.value} value={item.value}>
                                {item.text}
                              </MenuItem>
                            ))}
                          </StyledSelect>
                          {errors.crt_id && (
                            <FormHelperText sx={{ color: "red" }}>
                              {errors.crt_id}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </MDBox>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} lg={1}>
                  <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="flex-end" height="100%">
                    <ButtonComponent type={mode === "add" ? "add" : "edit"} onClick={handleSubmit} />
                    {mode === "edit" && (
                      <MDBox mt={2}> {/* เพิ่มระยะห่างด้านบน 2 หน่วย */}
                        <ButtonComponent
                          type="cancel"
                          onClick={() => {
                            setMode("add"); // กลับไปที่โหมด add
                            setForm({
                              tlifm_code: "",
                              tl_id: "",
                              crt_id: "",
                              tlifm_name: "",
                            }); // ล้างค่าฟิลด์ทั้งหมด

                          }}
                        />
                      </MDBox>
                    )}
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>

            <MDBox pt={2} pr={3}>
              <Grid item xs={12}>
                <Grid container alignItems="center" justifyContent="flex-end" spacing={2}>
                  {/* ปุ่มนำเข้าไฟล์เป็นตัวแรก */}
                  <Grid item>
                    <MDBox mb={0} mr={2.5}>
                      <MDInput
                        key={fileInputKey}
                        type="file"
                        accept=".xlsx"
                        style={{ display: "none" }}
                        id="import-file"
                        onChange={handleImportFile}
                      />
                      <label htmlFor="import-file">
                        <MDButton variant="contained" component="span" color="info">
                          นำเข้าไฟล์ Excel
                        </MDButton>
                      </label>
                    </MDBox>
                  </Grid>

                  {/* เมื่อมีไฟล์แล้วจึงแสดง ชื่อไฟล์ → ปุ่มลบไฟล์ → ปุ่มยืนยัน ถัดไปทางขวา */}
                  {selectedFile && (
                    <>
                      <Grid item>
                        <MDTypography variant="body2">{selectedFile.name}</MDTypography>
                      </Grid>

                      <Grid item>
                        <ButtonComponent onClick={handleClearFile} type="iconDelete" />
                      </Grid>

                      <Grid item>
                        <ButtonComponent type="Confirm" onClick={handleSubmitImport} />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>
            </MDBox>

            <MDBox p={5}>
              <Card>
                <TableComponent
                  columns={[
                    { field: "tlifm_code", label: lang.msg("semifg.semifg_code"), width: "5%" },
                    { field: "tlifm_name", label: lang.msg("semifg.semifg_name"), width: "10%" },
                    { field: "tl_type", label: lang.msg("raw_data.raw_type"), width: "10%" },
                    { field: "crt_txn", label: lang.msg("raw_data.raw_cri_wd_return"), width: "10%" }
                  ]}
                  data={ToolingAll}
                  idField="tlifm_id"
                  onEdit={(id) => {
                    handleEdit(id);
                  }}
                  onDelete={(id) => {
                    setDeleteCode(id);
                    setConfirmAlert(true);
                  }}
                  searchableColumns={["tlifm_code", "tlifm_name", "tl_type", "crt_txn"]} // กรองเฉพาะฟิลด์ที่กำหนด
                  hiddenActions={["barcode", "settings", "print"]}
                  userRole={role}
                />
              </Card>
            </MDBox>

          </Card>
        </MDBox>
      </MDBox>
      {confirmAlert && (
        <SweetAlertComponent
          type="error"
          title="ยืนยันการลบ"
          message="คุณต้องการลบข้อมูลนี้ใช่หรือไม่?"
          show={confirmAlert}
          showCancel
          confirmText="ตกลง"
          cancelText="ยกเลิก"
          onConfirm={handleDelete}
          onCancel={() => setConfirmAlert(false)}
        />
      )}


      {confirmSubmit && (
        <SweetAlertComponent
          type="info"
          title="เพิ่ม"
          message="ยืนยันการเพิ่มรายการใช่หรือไม่?"
          show={confirmSubmit}
          showCancel
          confirmText="ยืนยัน"
          cancelText="ยกเลิก"
          onConfirm={handleConfirmSubmit} // Proceed with the submission
          onCancel={() => setConfirmSubmit(false)} // Close the dialog without submitting
        />
      )}


      {confirmEdit && (
        <SweetAlertComponent
          type="warning"
          title="แก้ไข"
          message="ยืนยันการแก้ไขรายการใช่หรือไม่?"
          show={confirmEdit}
          showCancel
          confirmText="ยืนยัน"
          cancelText="ยกเลิก"
          onConfirm={handleConfirmSubmit} // ฟังก์ชันสำหรับยืนยันการแก้ไข
          onCancel={() => setConfirmEdit(false)} // ปิด dialog
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

export default ToolingInfo;