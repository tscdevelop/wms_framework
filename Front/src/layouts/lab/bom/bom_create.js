

import React, { useState, useEffect } from "react";
import { Box, Grid, Card, MenuItem, Button } from "@mui/material";
import { StyledSelect } from "common/Global.style";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import SweetAlertComponent from "../components/sweetAlert";
import DropDownAPI from "api/DropDownAPI";
import BOMAPI from "api/BOMAPI";
// import InBoundFGAPI from "api/InBoundFgAPI";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import FGAPI from "api/FgAPI";
import FGFormComponent from "../components/fg_modal";
import { GlobalVar } from "common/GlobalVar"; // ✅ เพิ่มหากยังไม่มี

const BOMCreate = () => {
  const [loading, setLoading] = useState(true);
  const [dropDownFGInfo, setDropDownFGInfo] = useState([]);
  const [mode, setMode] = useState("add");
  const [form, setForm] = useState({
    so_code: "",
    so_cust_name: "",
    so_details: ""
  });

  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const [rows, setRows] = useState([
    {
      bom_number: "",
      fgifm_id: "",
      bom_quantity: "",
      fgifm_product_name: "",
      showJobNo: true, // กำหนดให้แสดง Job No. สำหรับแถวแรก
    },
  ]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [BOM, setBom] = useState("");
  const [open, setOpen] = useState(false);
  const [fgCreatingIndex, setFgCreatingIndex] = useState(null);
const [hasLoadedBOM, setHasLoadedBOM] = useState(false);

  useEffect(() => {
    const code = params.get("so_id");
    console.log("so_id  from URL:", code); // Log ค่า so_id  จาก URL

    if (code) {
      setBom(code);
      setMode("edit");
      fetchBOMCode(code);
    } else {
      console.warn("No so_id  found in URL parameters.");
    }
  }, [location.search]);



  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      const response = await DropDownAPI.getFgInfoDropdown();
      if (response.isCompleted && response.data.length > 0) {
        setDropDownFGInfo(response.data);
      } else {
        console.error("Error fetching FG info dropdown:", response.message);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    } finally {
      setLoading(false);
    }
  };

  // เรียกใช้ fetchDropdownData ครั้งแรกเมื่อ component โหลด
  useEffect(() => {
    fetchDropdownData();
  }, []);



  const fetchFGInfo = async (fgifm_id, index) => {
    try {
      const response = await FGAPI.getFgInfoByID(fgifm_id);
      if (response.isCompleted) {
        const { fgifm_product_name } = response.data;
        setRows((prevRows) => {
          const updatedRows = [...prevRows];
          updatedRows[index].fgifm_product_name = fgifm_product_name;
          return updatedRows;
        });
      } else {
        console.error("Error fetching FG info:", response.message);
      }
    } catch (error) {
      console.error("Error fetching FG info by ID:", error);
    }
  };


  // // ฟังก์ชันเรียก API เพื่อนำข้อมูล Raw Material มาใช้
  // const fetchFGCode = async (fgifm_id, index) => {
  //   try {
  //     const response = await InBoundFGAPI.getInBoundFgByCode(fgifm_id);
  //     console.log(`Fetching FG for: ${fgifm_id}`, response);
  //     if (response.isCompleted) {


  //       setRows((prevRows) => {
  //         const updatedRows = [...prevRows];
  //         updatedRows[index] = {
  //           ...updatedRows[index],

  //         };
  //         return updatedRows;
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data for fgifm_id:", fgifm_id, error);
  //   }
  // };


  // useEffect(() => {
  //   fetchFGCode();
  // }, []);




  const fetchBOMCode = async (so_id) => {
    console.log("Fetching BOM Code:", so_id);
    try {
      const response = await BOMAPI.getBOMByID(so_id);
      console.log("Response from API:", response);

      if (response.isCompleted) {
        const { so_code, so_cust_name, so_details, item } = response.data;

        // Update Form
        setForm((prevState) => ({
          ...prevState,
          so_code: so_code || "",
          so_cust_name: so_cust_name || "",
          so_details: so_details || "",
        }));

        // Map item -> rows
        const updatedRows = item.flatMap((job) => {
          const isFirstRow = true; // แถวแรกของแต่ละ job
          return job.bom.map((bomItem, index) => ({
            bom_number: isFirstRow && index === 0 ? job.bom_number : "",
            fgifm_id: bomItem.fgifm_id || "",
            bom_quantity: bomItem.bom_quantity || 0,
            fgifm_product_name: "", // ค่า product name จะอัปเดตจาก API
            showJobNo: isFirstRow && index === 0,
          }));
        });

        // ดึงข้อมูล fgifm_product_name สำหรับแต่ละ fgifm_id
        const rowsWithProductName = await Promise.all(
          // eslint-disable-next-line no-unused-vars
          updatedRows.map(async (row, index) => {
            if (row.fgifm_id) {
              try {
                const fgResponse = await FGAPI.getFgInfoByID(row.fgifm_id);
                if (fgResponse.isCompleted) {
                  return {
                    ...row,
                    fgifm_product_name: fgResponse.data.fgifm_product_name || "",
                  };
                }
              } catch (error) {
                console.error(
                  `Error fetching FG info for fgifm_id: ${row.fgifm_id}`,
                  error
                );
              }
            }
            return row; // กรณีไม่มี fgifm_id หรือเกิดข้อผิดพลาด
          })
        );

        console.log("Mapped Rows with Product Names:", rowsWithProductName);
        setRows(rowsWithProductName); // อัปเดต state
      } else {
        console.error("Failed to fetch BOM data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching BOM Code:", error);
    }
  };





  useEffect(() => {
  if (!loading && BOM && !hasLoadedBOM) {
    fetchBOMCode(BOM);
    setHasLoadedBOM(true);
  }
}, [BOM, loading]);



  useEffect(() => {
    if (BOM) {
      setMode("edit"); // แก้ไขข้อมูล
      fetchBOMCode(BOM); // โหลดข้อมูลเดิม
    } else {
      setMode("add"); // เพิ่มข้อมูลใหม่
    }
  }, [BOM]);



  const handleAddRowWithJobNo = () => {
    setRows((prevRows) => [
      ...prevRows,
      {
        bom_number: "",
        fgifm_id: "",
        bom_quantity: "",
        fgifm_product_name: "",
        showJobNo: true, // แสดง Job No. สำหรับแถวนี้
      },
    ]);
  };

  const isLastCreatedJobNoRow = (index) => {
    const lastIndex = rows.map((r, i) => r.showJobNo ? i : -1).filter(i => i !== -1).pop();
    return index === lastIndex;
  };


  const handleAddRowWithoutJobNo = (index) => {
    setRows((prevRows) => {
      const newRow = {
        bom_number: "",
        fgifm_id: "",
        bom_quantity: "",
        fgifm_product_name: "",
        showJobNo: false,
      };
      const updatedRows = [...prevRows];
      updatedRows.splice(index + 1, 0, newRow); // แทรกหลัง index
      return updatedRows;
    });
  };



  const handleDeleteRow = (index) => {
    if (index === 0) {
      console.log("Cannot remove first row");
      return;
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    let newValue = value;

    if (field === "bom_quantity") {
      // กรองค่าให้เป็นตัวเลขเท่านั้น และห้ามติดลบ
      newValue = value.replace(/[^0-9]/g, "");
    }

    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      updatedRows[index][field] = newValue;
      return updatedRows;
    });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // ฟังก์ชันจัดการการเปลี่ยนค่าของ Dropdown
  const handleDropdownChange = (index, value) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      updatedRows[index] = { ...updatedRows[index], fgifm_id: value };
      return updatedRows;
    });
    fetchFGInfo(value, index); // ดึงข้อมูล FG
  };


  const handleFGFormClose = async (newFgifmId) => {
    setOpen(false);
    if (newFgifmId != null && fgCreatingIndex != null) {
      // ตั้งเวลา 2 วินาที (2000 มิลลิวินาที)
      setTimeout(async () => {
        await fetchDropdownData(); // โหลด dropdown ใหม่

        try {
          const response = await FGAPI.getFgInfoByID(newFgifmId);
          if (response.isCompleted) {
            const { fgifm_product_name } = response.data;

            setRows((prevRows) => {
              const updatedRows = [...prevRows];
              updatedRows[fgCreatingIndex] = {
                ...updatedRows[fgCreatingIndex],
                fgifm_id: newFgifmId,
                fgifm_product_name: fgifm_product_name || "",
              };
              return updatedRows;
            });

            setFgCreatingIndex(null);
          } else {
            console.error("Error fetching FG info:", response.message);
          }
        } catch (error) {
          console.error("Error fetching FG info by ID:", error);
        }
      }, 2000); // <-- หน่วง 2 วินาที
    }
  };



  const handleSubmit = async () => {
    let currentJobNumber = ""; // ตัวแปรเก็บ Job Number ล่าสุด
    const groupedData = {}; // ใช้เก็บข้อมูลที่จัดกลุ่มตาม BOM Number

    // ตรวจสอบค่า so_id ว่ามีอยู่ใน form หรือไม่
    if (!form.so_code) {
      setAlert({
        show: true,
        type: "error",
        title: "ข้อมูลไม่ครบ",
        message: "กรุณากรอกเลขที่ใบ SO."
      });
      return;
    }

    for (const row of rows) {
      const jobNumber = row.bom_number?.trim() || ""; // ใช้ ?.trim() ป้องกัน error

      // ตรวจสอบค่าที่จำเป็นต้องมี
      if (!row.fgifm_id) {
        setAlert({
          show: true,
          type: "error",
          title: "ข้อมูลไม่ครบ",
          message: "กรุณากรอกข้อมูล รหัส FG ให้ครบทุกแถว"
        });
        return;
      }

      if (jobNumber) {
        currentJobNumber = jobNumber; // บันทึกค่า Job Number ล่าสุด
      }

      if (!groupedData[currentJobNumber]) {
        groupedData[currentJobNumber] = []; // สร้าง array ใหม่ถ้ายังไม่มี
      }

      groupedData[currentJobNumber].push({
        bom_number: currentJobNumber,
        fgifm_id: Number(row.fgifm_id), // ✅ แปลงให้เป็นตัวเลข
        bom_quantity: Number(row.bom_quantity) || 0,
      });
    }

    try {
      if (mode === "add") {
        // ✅ สำหรับเพิ่มข้อมูลใหม่
        const payload = {
          ...form, // รวมข้อมูล form
          item: Object.values(groupedData).flat() // เปลี่ยนเป็น `item`
        };
        const response = await BOMAPI.createBOM(payload);
        if (response.isCompleted) {
          setAlert({
            show: true,
            type: "success",
            title: "ดำเนินการสำเร็จ",
            message: response.message,
          });

          setTimeout(() => {
            navigate("/bom", { state: { userRole: GlobalVar.getRole(), menu_id: 22 } });
          }, 2000);
        } else {
          setAlert({
            show: true,
            type: "error",
            title: "เกิดข้อผิดพลาด",
            message: response.message,
          });
        }
      } else if (mode === "edit") {
        // ✅ สำหรับแก้ไขข้อมูล
        const payload = {
          so_code: form.so_code,
          so_cust_name: form.so_cust_name,
          so_details: form.so_details,
          item: Object.values(groupedData).flat() // ใช้ key `item` ตาม Swagger
        };

        const response = await BOMAPI.updateBOM(BOM, payload);
        if (response.isCompleted) {
          setAlert({
            show: true,
            type: "success",
            title: "ดำเนินการสำเร็จ",
            message: response.message,
          });
          setTimeout(() => {
            navigate("/bom", { state: { userRole: GlobalVar.getRole(), menu_id: 22 } });
          }, 2000);
        } else {
          setAlert({
            show: true,
            type: "error",
            title: "เกิดข้อผิดพลาด",
            message: response.message,
          });
        }
      }
    } catch (error) {
      console.error("Error during submit:", error);

    }
  };

  const navigate = useNavigate();
  const handleReturn = () => {

    navigate("/bom", { state: { userRole: GlobalVar.getRole(), menu_id: 22 } }); // <-- ใส่ menu_id ที่ถูกต้องของ BOM

  };



  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="inherit" fontWeight="bold">
            BOM / สร้าง BOM
          </MDTypography>
        </MDBox>

        <MDBox mt={5}>
          <Card>
            <MDBox m={3} p={5}>
              <MDTypography
                variant="h4"
                fontWeight="bold"
                color="warning"
                gutterBottom
                sx={{ mb: 5 }}
              >
                รายละเอียด
              </MDTypography>

              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 3, mt: 5 }}>
                    <MDTypography variant="h6" color="inherit">
                      เลขที่ใบ SO.
                    </MDTypography>
                    <MDInput
                      sx={{ width: "200px", maxWidth: "100%" }}
                      name="so_code"
                      value={form.so_code || ""} // ตรวจสอบว่า `Form.inbrm_code` มีค่า
                      onChange={handleChange}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={4}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 3, mt: 5 }}>
                    <MDTypography variant="h6" color="inherit">
                      ชื่อลูกค้า
                    </MDTypography>
                    <MDInput
                      sx={{ width: "300px", maxWidth: "100%" }}
                      name="so_cust_name"
                      value={form.so_cust_name || ""} // ตรวจสอบว่า `Form.inbrm_code` มีค่า
                      onChange={handleChange}
                    />
                  </MDBox>
                </Grid>

                <Grid item xs={12} md={5}>
                  <MDBox display="flex" alignItems="center" sx={{ gap: 3, mt: 5 }}>
                    <MDTypography variant="h6" color="inherit">
                      รายละเอียด
                    </MDTypography>
                    <MDInput
                      sx={{ width: "400px", maxWidth: "100%" }}
                      name="so_details" // ลบช่องว่างด้านหลังออก
                      value={form.so_details || ""}
                      onChange={handleChange}
                    />
                  </MDBox>
                </Grid>

                {rows.map((row, index) => (
                  <React.Fragment key={index}>
                    {/* Job No. Row */}
                    <Grid item xs={12} md={3}>
                      <MDBox display="flex" alignItems="center" gap={2}>
                        {row.showJobNo ? (
                          <>
                            <MDTypography variant="h6" color="inherit">BOM</MDTypography>
                            <MDInput
                              value={row.bom_number || ""}
                              onChange={(e) => handleInputChange(index, "bom_number", e.target.value)}
                              sx={{ width: "200px", maxWidth: "100%" }}
                            />
                          </>
                        ) : (
                          // บล็อกพื้นที่ของ Job No. โดยตั้ง visibility: hidden
                          <Box sx={{ visibility: "hidden", width: "100%" }}>
                            <MDTypography variant="h6" color="inherit">BOM</MDTypography>
                            <MDInput fullWidth />
                          </Box>
                        )}
                        {row.showJobNo && isLastCreatedJobNoRow(index) && (
                          <>
                            <Button
                              onClick={handleAddRowWithJobNo}
                              size="small"
                              sx={{
                                width: "30px",
                                height: "30px",
                                minWidth: "30px",
                                fontSize: "14px",
                                borderRadius: "50%",
                                padding: 0,
                                backgroundColor: "#1976d2",
                                color: "#ffffff",
                                "&:hover": {
                                  backgroundColor: "#115293",
                                },
                              }}
                              variant="contained"
                            >
                              +
                            </Button>

                          </>

                        )}

                      </MDBox>
                    </Grid>

                    {/* Raw Material Code */}
                    <Grid item xs={12} md={4}>
                      <MDBox display="flex" alignItems="center" gap={1}>
                        <MDTypography variant="h6" color="inherit">รหัส FG</MDTypography>
                        <StyledSelect
                          value={row.fgifm_id || ""}
                          onChange={(e) => handleDropdownChange(index, e.target.value)}
                          sx={{ width: "300px", maxWidth: "100%" }}
                        >
                          {dropDownFGInfo.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.text}
                            </MenuItem>
                          ))}
                        </StyledSelect>
                        {/* <StyledSelect
                          value={row.fgifm_id || ""}
                          onChange={(e) => handleDropdownChange(index, e.target.value)}
                          sx={{ width: "300px", maxWidth: "100%" }}
                        >
                          {dropDownFGInfo
                            .filter((item) => {
                              // ดึงค่าที่ถูกเลือกในแถวอื่น (ยกเว้นแถวปัจจุบัน)
                              const selectedFGIds = rows
                                .filter((_, idx) => idx !== index)
                                .map((r) => r.fgifm_id);
                              // แสดงตัวเลือก กรณีที่ยังไม่ได้ถูกเลือก หรือถ้าในแถวนี้เลือกค่านั้นอยู่แล้ว
                              return !selectedFGIds.includes(item.value) || item.value === row.fgifm_id;
                            })
                            .map((item) => (
                              <MenuItem key={item.value} value={item.value}>
                                {item.text}
                              </MenuItem>
                            ))}
                        </StyledSelect> */}

                        <ButtonComponent
                          type="add"
                          onClick={() => {
                            setFgCreatingIndex(index);
                            setOpen(true);
                          }}
                        />



                      </MDBox>
                    </Grid>




                    {/* Quantity */}
                    <Grid item xs={12} md={5}>
                      <MDBox display="flex" alignItems="center" gap={2}>
                        <MDTypography variant="h6" color="inherit">จำนวนที่ต้องการผลิตเพิ่ม</MDTypography>
                        <MDInput
                          value={row.bom_quantity || ""}
                          onChange={(e) => handleInputChange(index, "bom_quantity", e.target.value)}
                          sx={{ width: "150px", maxWidth: "100%" }}
                        />
                        <MDInput
                          value={row.fgifm_product_name || ""}
                          onChange={(e) => handleInputChange(index, "fgifm_product_name", e.target.value)}
                          sx={{ width: "100px", maxWidth: "100%" }}
                          disabled
                          placeholder="หน่วย"
                        />

                        <>
                          <Button
                            onClick={() => handleAddRowWithoutJobNo(index)}
                            size="small"
                            sx={{
                              width: "30px",
                              height: "30px",
                              minWidth: "30px",
                              fontSize: "14px",
                              borderRadius: "50%",
                              padding: 0,
                              backgroundColor: "#1976d2",
                              color: "#ffffff",
                              "&:hover": {
                                backgroundColor: "#115293",
                              },
                            }}
                            variant="contained"
                          >
                            +
                          </Button>

                          {rows.length > 1 && (
                            <Button
                              onClick={() => handleDeleteRow(index)}
                              size="small"
                              sx={{
                                width: "30px",
                                height: "30px",
                                minWidth: "30px",
                                fontSize: "14px",
                                borderRadius: "50%",
                                padding: 0,
                                backgroundColor: "#d32f2f",
                                color: "#ffffff",
                                "&:hover": {
                                  backgroundColor: "#9a0007",
                                },
                              }}
                              variant="contained"
                            >
                              -
                            </Button>
                          )}
                        </>





                      </MDBox>
                    </Grid>

                    {/* Remark */}

                  </React.Fragment>
                ))}
                <FGFormComponent key={fgCreatingIndex} open={open} onClose={handleFGFormClose} />
              </Grid>
              <MDBox
                mt={6}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={2}
              >

                <MDBox
                  display="flex"
                  gap={2}
                  ml={{ xs: 0, md: "auto" }}
                  flexDirection={{ xs: "column", sm: "row" }}
                  width={{ xs: "100%", sm: "auto" }}
                >
                  <ButtonComponent
                    type="cancel"
                    sx={{ px: 4, width: { xs: "100%", sm: "auto" } }}
                    onClick={handleReturn}
                  />
                  <ButtonComponent type={mode === "add" ? "BomAdd" : "confirmedit"} onClick={handleSubmit} />
                </MDBox>
              </MDBox>


            </MDBox>
          </Card>
        </MDBox>
      </MDBox>




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
export default BOMCreate;