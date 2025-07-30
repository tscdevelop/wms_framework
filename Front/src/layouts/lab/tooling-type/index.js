import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
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
import MDButton from "components/MDButton";

const Tooling = () => {
  // loading: ควบคุมสถานะการโหลดข้อมูลจาก API ถ้าเป็น true แสดงว่าข้อมูลกำลังโหลดอยู่
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [ToolingAll, setToolingAll] = useState([]);
  const [Form, setForm] = useState({
    tl_code: "",
    tl_type: "",
    tl_remark: "",
    tl_id: ""
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



  useEffect(() => {
    const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
    setRole(userRole);
  }, []);



  const fetchDataAll = async () => {
    try {
      const response = await ToolingAPI.getToolingAll();

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






  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };




  const handleEdit = async (tl_id) => {
    try {
      const response = await ToolingAPI.getToolingByID(tl_id);
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

    if (!Form.tl_code || !Form.tl_code.trim()) {
      newErrors.tl_code = "กรุณากรอกรหัสประเภทเครื่องมือ";
    }

    if (!Form.tl_type || !Form.tl_type.trim()) {
      newErrors.tl_type = "กรุณากรอกประเภทเครื่องมือ";
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
          tl_code: Form.tl_code || "",
          tl_type: Form.tl_type || "",
          tl_remark: Form.tl_remark || "",


        };
        response = await ToolingAPI.createTooling(payload);
      } else {
        // FormData สำหรับอัปเดตข้อมูล
        const formData = new FormData();
        formData.append("tl_code", Form.tl_code || "");
        formData.append("tl_type", Form.tl_type || "");
        formData.append("tl_remark", Form.tl_remark || "");
        response = await ToolingAPI.updateTooling(Form.tl_id, formData); // ใช้ API updateSupplier
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
          tl_code: "",
          tl_type: "",
          tl_remark: "",
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
      const response = await ToolingAPI.deleteTooling(deleteCode);
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
        const response = await ToolingAPI.importFile(selectedFile);
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
            {lang.msg("title.tooling")}
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
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDInput
                          name="tl_code"
                          variant="outlined"
                          value={Form.tl_code}
                          onChange={handleInputChange}
                          sx={{ width: "300px", maxWidth: "100%" }}
                          error={!!errors.tl_code} // แสดงสีแดงถ้ามี error
                          helperText={errors.tl_code || ""} // แสดงข้อความเตือน
                          FormHelperTextProps={{
                            style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                          }}
                        />
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("semi.semi_remark")}

                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDInput
                          name="tl_remark"
                          variant="outlined"
                          value={Form.tl_remark}
                          onChange={handleInputChange}
                          sx={{ width: "300px", maxWidth: "100%" }}

                        />
                      </MDBox>
                    </Grid>


                  </Grid>
                </Grid>

                <Grid item xs={12} md={5} lg={6}>
                  <Grid container spacing={3} alignItems="center" >
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDTypography variant="h6" color="inherit">
                          {lang.msg("semi.semi_type")}
                          <span style={{ color: "red" }}> *</span>
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                        <MDInput
                          name="tl_type"
                          variant="outlined"
                          value={Form.tl_type}
                          onChange={handleInputChange}
                          sx={{ width: "300px", maxWidth: "100%" }}
                          error={!!errors.tl_type} // แสดงสีแดงถ้ามี error
                          helperText={errors.tl_type || ""} // แสดงข้อความเตือน
                          FormHelperTextProps={{
                            style: { color: "red" }, // เปลี่ยนสีข้อความเตือนเป็นสีแดง
                          }}
                        />
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} />
                    <Grid item xs={12} />
                    <Grid item xs={12} />
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
                    { field: "tl_code", label: lang.msg("semifg.semifg_code"), width: "5%" },
                    { field: "tl_type", label: lang.msg("semi.semi_type"), width: "10%" },
                    { field: "tl_remark", label: lang.msg("semi.semi_remark"), width: "10%" },
                  ]}
                  data={ToolingAll}
                  idField="tl_id"
                  onEdit={(id) => {
                    handleEdit(id);
                  }}
                  onDelete={(id) => {
                    setDeleteCode(id);
                    setConfirmAlert(true);
                  }}
                  searchableColumns={["tl_code", "tl_type", "tl_remark"]} // กรองเฉพาะฟิลด์ที่กำหนด
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

export default Tooling;