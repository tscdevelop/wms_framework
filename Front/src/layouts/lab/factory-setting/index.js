import React, { useState, useEffect } from "react";
import { Card, Grid } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import ButtonComponent from "../components/ButtonComponent";
import MDTypography from "components/MDTypography";
import TableComponent from "../components/table_component"; // ใช้ TableComponent
import FactoryAPI from "api/FactoryAPI";
import SweetAlertComponent from "../components/sweetAlert";
import * as lang from "utils/langHelper";
import { GlobalVar } from "../../../common/GlobalVar";
import MDButton from "components/MDButton";
const Factory = () => {
  // loading: ควบคุมสถานะการโหลดข้อมูลจาก API ถ้าเป็น true แสดงว่าข้อมูลกำลังโหลดอยู่
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [factoryAll, setFactoryAll] = useState([]); // ข้อมูลทั้งหมด
  const [factoryForm, setFactoryForm] = useState({
    fty_id: "",
    fty_code: "",
    fty_name: "",
    fty_address: "",
    fty_phone: "",
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const [confirmAlert, setConfirmAlert] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmEdit, setConfirmEdit] = useState(false); // State สำหรับ confirm edit
  const [deleteCode, setDeleteCode] = useState(""); // รหัสโรงงานที่จะลบ
  const [mode, setMode] = useState("add"); // ตัวแปรเพื่อจัดการโหมด add/edit
  const [role, setRole] = useState("");

  useEffect(() => {
    const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
    setRole(userRole);
  }, []);


  const fetchDataAll = async () => {
    try {
      const response = await FactoryAPI.getFactoryAll();
      console.log("factory All :", response);

      if (response.isCompleted) {
        const data = response.data;
        setFactoryAll(data);

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



  const fetchDataById = async (fty_id) => {
    try {
      const response = await FactoryAPI.getFactoryByID(fty_id);
      console.log("Response from getFactoryByID:", response); // ตรวจสอบข้อมูลที่ได้จาก API
      if (response.isCompleted) {
        setFactoryForm({
          fty_id: response.data.fty_id || "",
          fty_code: response.data.fty_code || "",
          fty_name: response.data.fty_name || "",
          fty_address: response.data.fty_address || "",
          fty_phone: response.data.fty_phone || "",
        }); // อัปเดตฟอร์มด้วยข้อมูลที่ได้
        setMode("edit"); // เปลี่ยนโหมดเป็น edit
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  // ปรับปรุง handleInputChange ให้รองรับ fty_phone
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // กรองเฉพาะตัวเลขและจำกัดความยาวไว้ที่ 10 หลักสำหรับฟิลด์ fty_phone
    if (name === "fty_phone") {
      newValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    setFactoryForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };


  const handleEdit = (fty_id) => {
    fetchDataById(fty_id); // ดึงข้อมูลจาก API และอัปเดตฟอร์ม
  };


  const validateForm = () => {
    const newErrors = {};
    if (!factoryForm.fty_code.trim()) {
      newErrors.fty_code = "กรุณากรอกรหัสโรงงาน"; // ใช้ข้อความธรรมดา
    }
    if (!factoryForm.fty_name.trim()) {
      newErrors.fty_name = "กรุณากรอกชื่อโรงงาน"; // ใช้ข้อความธรรมดา
    }
    if (!factoryForm.fty_address.trim()) {
      newErrors.fty_address = "กรุณากรอกที่อยู่โรงงาน"; // ใช้ข้อความธรรมดา
    }
    if (!factoryForm.fty_phone.trim()) {
      newErrors.fty_phone = "กรุณากรอกเบอร์ติดต่อ"; // ใช้ข้อความธรรมดา
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // คืนค่า true หากไม่มีข้อผิดพลาด
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
        // For adding new data
        const payload = {
          fty_code: factoryForm.fty_code,
          fty_name: factoryForm.fty_name,
          fty_address: factoryForm.fty_address,
          fty_phone: factoryForm.fty_phone,
        };
        response = await FactoryAPI.createFactory(payload);
      } else {
        // For updating existing data
        const formData = new FormData();
        formData.append("fty_code", factoryForm.fty_code);
        formData.append("fty_name", factoryForm.fty_name);
        formData.append("fty_address", factoryForm.fty_address);
        formData.append("fty_phone", factoryForm.fty_phone);

        response = await FactoryAPI.updateFactory(factoryForm.fty_id, formData);
      }

      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: mode === "add" ? "เพิ่มสำเร็จ" : "แก้ไขสำเร็จ",
          message: response.message,
        });
        await fetchDataAll(); // Refresh table data
        setFactoryForm({
          fty_code: "",
          fty_name: "",
          fty_address: "",
          fty_phone: "",
        });
        setMode("add"); // Reset to add mode
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
      const response = await FactoryAPI.deleteFactory(deleteCode);
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
      console.error("Error during submit:", error);
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
      const response = await FactoryAPI.importFile(selectedFile);
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
          <MDTypography variant="h3" color="inherit" fontWeight="bold">
            {lang.msg("title.factory")}
          </MDTypography>
        </MDBox>

        <MDBox mt={5}>
          <Card>
            <MDBox mt={3} p={3}>
              <Grid container spacing={4} alignItems="center">
                {/* Input Fields */}
                <Grid item xs={12} md={6} lg={5}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("factory.factory_code")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDInput
                        name="fty_code"
                        variant="outlined"
                        value={factoryForm.fty_code || ""}
                        onChange={handleInputChange}
                        fullWidth
                      />
                      {errors.fty_code && (
                        <MDTypography variant="caption" color="error">
                          {errors.fty_code}
                        </MDTypography>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("factory.factory_name")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDInput
                        name="fty_name"
                        variant="outlined"
                        value={factoryForm.fty_name || ""}
                        onChange={handleInputChange}
                        fullWidth
                      />
                      {errors.fty_name && (
                        <MDTypography variant="caption" color="error">
                          {errors.fty_name}
                        </MDTypography>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("factory.factory_contact")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDInput
                        name="fty_phone"
                        variant="outlined"
                        value={factoryForm.fty_phone || ""}
                        onChange={handleInputChange}
                        fullWidth
                      />
                      {errors.fty_phone && (
                        <MDTypography variant="caption" color="error">
                          {errors.fty_phone}
                        </MDTypography>
                      )}
                    </Grid>
                  </Grid>
                </Grid>

                {/* Address Field and Button */}
                <Grid item xs={12} md={5} lg={6}>
                  <Grid container >
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("factory.factory_address")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDInput
                        name="fty_address"
                        multiline
                        rows={8}
                        value={factoryForm.fty_address || ""}
                        onChange={handleInputChange}
                        variant="outlined"
                        fullWidth
                      />
                      {errors.fty_address && (
                        <MDTypography variant="caption" color="error">
                          {errors.fty_address}
                        </MDTypography>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} lg={1} >
                  <MDBox
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="flex-end"
                    height="100%"
                  >
                    <ButtonComponent type={mode === "add" ? "add" : "edit"} onClick={handleSubmit} />
                    {mode === "edit" && (
                      <MDBox mt={2}> {/* เพิ่มระยะห่างด้านบน 2 หน่วย */}
                        <ButtonComponent
                          type="cancel"
                          onClick={() => {
                            setMode("add"); // กลับไปที่โหมด add
                            setFactoryForm({
                              fty_id: "",
                              fty_code: "",
                              fty_name: "",
                              fty_address: "",
                              fty_phone: "",
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
                    { field: "fty_code", label: lang.msg("factory.factory_code"), width: "10%" },
                    { field: "fty_name", label: lang.msg("factory.factory_name"), width: "10%" },
                    {
                      field: "fty_address", label: lang.msg("factory.factory_address"), cellStyle: () => ({
                        whiteSpace: "normal",      // ปรับให้เป็น multiline
                        wordBreak: "break-word",     // ไม่ตัดคำ
                        minWidth: 400,         // ป้องกันการบีบเกินไป
                        maxWidth: 600,         // จำกัดความกว้างไม่ให้เกิน
                      }),
                    },
                    { field: "fty_phone", label: lang.msg("factory.factory_contact") },
                  ]}
                  data={factoryAll}
                  idField="fty_id" // ชื่อ field ที่ใช้ระบุ ID
                  onEdit={(id) => {
                    console.log("Editing ID:", id);
                    handleEdit(id);
                  }}
                  onDelete={(id) => {
                    setDeleteCode(id);
                    setConfirmAlert(true);
                  }}
                  searchableColumns={["fty_code", "fty_name"]}
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

export default Factory;




