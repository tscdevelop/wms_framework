import React, { useState, useEffect } from "react";
import { Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import TableComponent from "../components/table_component";
import * as lang from "utils/langHelper";
import SupplierAPI from "api/SupplierAPI";
import { GlobalVar } from "../../../common/GlobalVar";

const Supplier = () => {
  // loading: ควบคุมสถานะการโหลดข้อมูลจาก API ถ้าเป็น true แสดงว่าข้อมูลกำลังโหลดอยู่
  const [supplierAll, setSupplierAll] = useState([]); // ข้อมูลทั้งหมด
  const [supplierForm, setSupplierForm] = useState({
    sup_id: "",
    sup_code: "",
    sup_name: "",
    sup_tax_id: "",
    sup_phone: "",
    sup_address: "",
    sup_email: "",
    sup_remark: "",
    sup_payment_due_days: "",
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
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState("");

  useEffect(() => {
    const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
    setRole(userRole);
  }, []);



  const fetchDataAll = async () => {
    try {
      const response = await SupplierAPI.getSupplierAll();

      if (response.isCompleted) {
        const data = response.data;
        setSupplierAll(data);
      }
    } catch (error) {
      console.error("Error fetching  data : ", error);
    }
  };

  useEffect(() => {
    fetchDataAll();
  }, []);

  // จัดการเปลี่ยนค่าของฟิลด์
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    // กรองเฉพาะตัวเลขและจำกัดความยาวไว้ที่ 10 หลักสำหรับฟิลด์ fty_phone
    if (name === "sup_phone") {
      newValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    } else if (name === "sup_tax_id") {
      newValue = value.replace(/[^0-9]/g, "");
    } else if (name === "sup_payment_due_days") {
      newValue = value.replace(/[^0-9]/g, "");
    }

    setSupplierForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleEdit = async (sup_id) => {
    try {
      const response = await SupplierAPI.getSupplierByID(sup_id);
      if (response.isCompleted) {
        const Data = response.data;

        // อัปเดต ZoneForm
        setSupplierForm(Data);

        // เปลี่ยนโหมดเป็น edit
        setMode("edit");
      }
    } catch (error) {
      console.error("Error fetching data for edit:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!supplierForm.sup_code || !supplierForm.sup_code.trim()) {
      newErrors.sup_code = "กรุณากรอกรหัสผู้จัดจำหน่าย";
    }

    if (!supplierForm.sup_name || !supplierForm.sup_name.trim()) {
      newErrors.sup_name = "กรุณากรอกชื่อผู้จัดจำหน่าย";
    }

    if (!supplierForm.sup_tax_id || !supplierForm.sup_tax_id.trim()) {
      newErrors.sup_tax_id = "กรุณากรอกเลขที่ประจำตัวผู้เสียภาษี";
    }

    if (!supplierForm.sup_phone || !supplierForm.sup_phone.trim()) {
      newErrors.sup_phone = "กรุณากรอกเบอร์ติดต่อ ";
    }

    if (!supplierForm.sup_address || !supplierForm.sup_address.trim()) {
      newErrors.sup_address = "กรุณากรอกที่อยู่ผู้จัดจำหน่าย";
    }

    if (!supplierForm.sup_email || !supplierForm.sup_email.trim()) {
      newErrors.sup_email = "กรุณากรอกอีเมล";
    } else if (!/\S+@\S+\.\S+/.test(supplierForm.sup_email)) {
      newErrors.sup_email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!supplierForm.sup_payment_due_days || isNaN(supplierForm.sup_payment_due_days)) {
      newErrors.sup_payment_due_days = "กรุณากรอกจำนวนวันเครดิตชำระเงิน";
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

      const payload = {
        sup_code: supplierForm.sup_code || "",
        sup_name: supplierForm.sup_name || "",
        sup_tax_id: supplierForm.sup_tax_id || "",
        sup_phone: supplierForm.sup_phone || "",
        sup_address: supplierForm.sup_address || "",
        sup_email: supplierForm.sup_email || "",
        sup_remark: supplierForm.sup_remark || "",
        sup_payment_due_days: supplierForm.sup_payment_due_days || "",
      };

      if (mode === "add") {
        console.log("Add Payload:", payload);
        response = await SupplierAPI.createSupplier(payload);
      } else {
        const formData = new FormData();
        formData.append("sup_code", supplierForm.sup_code || "");
        formData.append("sup_name", supplierForm.sup_name || "");
        formData.append("sup_tax_id", supplierForm.sup_tax_id || "");
        formData.append("sup_phone", supplierForm.sup_phone || "");
        formData.append("sup_address", supplierForm.sup_address || "");
        formData.append("sup_email", supplierForm.sup_email || "");
        formData.append("sup_remark", supplierForm.sup_remark || "");
        formData.append("sup_payment_due_days", supplierForm.sup_payment_due_days || "");

        console.log("Update FormData:", formData);
        response = await SupplierAPI.updateSupplier(supplierForm.sup_id, formData);
      }

      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: mode === "add" ? "เพิ่มสำเร็จ" : "แก้ไขสำเร็จ",
          message: response.message,
        });
        await fetchDataAll();
        setSupplierForm({
          fty_id: "",
          sup_code: "",
          sup_name: "",
          sup_tax_id: "",
          sup_phone: "",
          sup_address: "",
          sup_email: "",
          sup_remark: "",
          sup_payment_due_days: "",
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
      const response = await SupplierAPI.deleteSupplier(deleteCode);
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
      const response = await SupplierAPI.importFile(selectedFile);
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
          <MDTypography variant="h3" color="inherit">
            {lang.msg("title.supplier")}
          </MDTypography>
        </MDBox>

        <MDBox mt={5}>
          <Card>
            <MDBox mt={3} p={3}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6} lg={5}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("supplier.sup_code")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDInput
                        name="sup_code"
                        value={supplierForm.sup_code}
                        onChange={handleInputChange}
                        variant="outlined"
                        fullWidth
                      />
                      {errors.sup_code && (
                        <MDTypography variant="caption" color="error">
                          {errors.sup_code}
                        </MDTypography>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("supplier.sup_name")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDInput
                        name="sup_name"
                        value={supplierForm.sup_name}
                        onChange={handleInputChange}
                        variant="outlined"
                        fullWidth
                      />
                      {errors.sup_name && (
                        <MDTypography variant="caption" color="error">
                          {errors.sup_name}
                        </MDTypography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("supplier.sup_tax_id")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDInput
                        name="sup_tax_id"
                        value={supplierForm.sup_tax_id}
                        onChange={handleInputChange}
                        variant="outlined"
                        fullWidth
                      />
                      {errors.sup_tax_id && (
                        <MDTypography variant="caption" color="error">
                          {errors.sup_tax_id}
                        </MDTypography>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("supplier.credit")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDInput
                        name="sup_payment_due_days"
                        value={supplierForm.sup_payment_due_days}
                        onChange={handleInputChange}
                        variant="outlined"
                        fullWidth
                      />
                      {errors.sup_payment_due_days && (
                        <MDTypography variant="caption" color="error">
                          {errors.sup_payment_due_days}
                        </MDTypography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("supplier.sup_remark")}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDInput
                        name="sup_remark"
                        value={supplierForm.sup_remark}
                        onChange={handleInputChange}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={5} lg={6}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("supplier.sup_address")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDInput
                        name="sup_address"
                        multiline
                        rows={5}
                        value={supplierForm.sup_address}
                        onChange={handleInputChange}
                        variant="outlined"
                        fullWidth
                      />
                      {errors.sup_address && (
                        <MDTypography variant="caption" color="error">
                          {errors.sup_address}
                        </MDTypography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("supplier.sup_phone")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDInput
                        name="sup_phone"
                        value={supplierForm.sup_phone}
                        onChange={handleInputChange}
                        variant="outlined"
                        fullWidth
                      />
                      {errors.sup_phone && (
                        <MDTypography variant="caption" color="error">
                          {errors.sup_phone}
                        </MDTypography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("supplier.sup_email")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDInput
                        name="sup_email"
                        value={supplierForm.sup_email}
                        onChange={handleInputChange}
                        variant="outlined"
                        fullWidth
                      />
                      {errors.sup_email && (
                        <MDTypography variant="caption" color="error">
                          {errors.sup_email}
                        </MDTypography>
                      )}
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} lg={1}>
                  <Grid container>
                    <MDBox
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                    >
                      <ButtonComponent
                        type={mode === "add" ? "add" : "edit"}
                        onClick={handleSubmit}
                      />
                      {mode === "edit" && (
                        <MDBox mt={2}>
                          {" "}
                          {/* เพิ่มระยะห่างด้านบน 2 หน่วย */}
                          <ButtonComponent
                            type="cancel"
                            onClick={() => {
                              setMode("add"); // กลับไปที่โหมด add
                              setSupplierForm({
                                sup_id: "",
                                sup_code: "",
                                sup_name: "",
                                sup_tax_id: "",
                                sup_phone: "",
                                sup_address: "",
                                sup_email: "",
                                sup_remark: "",
                                sup_payment_due_days: "",
                              }); // ล้างค่าฟิลด์ทั้งหมด
                            }}
                          />
                        </MDBox>
                      )}
                    </MDBox>
                  </Grid>
                </Grid>

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
              </Grid>
            </MDBox>

            <MDBox p={5}>
              <Card>
                <TableComponent
                  columns={[
                    { field: "sup_code", label: lang.msg("supplier.sup_code"), width: "5%" },
                    { field: "sup_name", label: lang.msg("supplier.supplier"), width: "10%" },
                    {
                      field: "sup_address", label: lang.msg("supplier.sup_address"), cellStyle: () => ({
                        whiteSpace: "normal",      // ปรับให้เป็น multiline
                        wordBreak: "break-word",     // ไม่ตัดคำ
                        minWidth: 400,         // ป้องกันการบีบเกินไป
                        maxWidth: 600,         // จำกัดความกว้างไม่ให้เกิน
                      }),
                    },
                    { field: "sup_tax_id", label: lang.msg("supplier.sup_tax_id"), width: "10%" },
                    { field: "sup_phone", label: lang.msg("supplier.sup_phone"), width: "5%" },
                    { field: "sup_email", label: lang.msg("supplier.email"), width: "5%" },
                    {
                      field: "sup_payment_due_days",
                      label: lang.msg("supplier.credit"),
                      width: "5%",
                    },
                    { field: "sup_remark", label: lang.msg("supplier.sup_remark"), width: "10%" },
                  ]}
                  data={supplierAll}
                  idField="sup_id"
                  onEdit={(id) => {
                    handleEdit(id);
                  }}
                  onDelete={(id) => {
                    setDeleteCode(id);
                    setConfirmAlert(true);
                  }}
                  searchableColumns={["sup_code", "sup_name"]}
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
          type="warning"
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

export default Supplier;
