// import React, { useState, useEffect } from "react"; // นำเข้า useState และ useEffect จาก React
// import PropTypes from "prop-types"; // นำเข้า PropTypes สำหรับการตรวจสอบ props
// import {
//   Box,
//   Grid,
//   Card,
//   TextField,
//   InputAdornment,
//   Typography,
//   TableContainer,
//   Button,
//   Modal,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   styled,
//   Checkbox,
//   FormControlLabel,
//   Radio,
//   RadioGroup,
// } from "@mui/material"; // นำเข้า components จาก MUI (Material-UI)
// import { Search, Edit, Delete, Password } from "@mui/icons-material"; // นำเข้าไอคอนจาก MUI Icons
// import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; // นำเข้า layout component
// import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // นำเข้า navbar component
// import { makeStyles } from "@mui/styles"; // นำเข้า makeStyles สำหรับการสร้างสไตล์

// // นำเข้า components และข้อมูลที่ใช้งานจากส่วนอื่นๆ
// import MDBox from "components/MDBox";
// import MDInput from "components/MDInput";
// import MDButton from "components/MDButton";
// import { department, position, role } from "common/dataMain"; // นำเข้าข้อมูลแผนกและตำแหน่ง
// import DataTable from "examples/Tables/DataTable"; // นำเข้า DataTable component
// import Editemployee from "./edit_employee.js"; // นำเข้าหน้า Edit Employee

// // react-router-dom components
// import { useNavigate } from "react-router-dom"; // นำเข้า Link และ useNavigate สำหรับการจัดการ routing
// import EmployeeApi from "api/EmployeeAPI"; // นำเข้า EmployeeApi สำหรับการเรียก API
// import SweetAlert from "react-bootstrap-sweetalert";
// import IconButton from "@mui/material/IconButton";
// import { StyledFormControl, StyledMenuItem, StyledSelect } from "common/Global.style";
// import * as lang from "utils/langHelper";
// import MDBadge from "components/MDBadge";
// import MDTypography from "components/MDTypography";

// import ButtonComponent from "../components/ButtonComponent";

// // สร้าง component ชื่อ Employee
// const Employee = () => {
//   const [employee, setEmployee] = useState([]); // สถานะสำหรับเก็บข้อมูลพนักงาน
//   const [employeeID, setEmployeeID] = useState({
//     employee_id: "",
//   });
//   const [filters, setFilters] = useState({
//     employee_emp_code: "",
//     dept_code: "",
//     posi_code: "",
//     name: "",
//     username: "",
//     emp_is_active: "",
//   }); // สถานะสำหรับเก็บค่าฟิลเตอร์
//   const [departmentList, setDepartmentList] = useState([]); // State to store department data from API
//   const [positionList, setPositionList] = useState([]); // State to store position data from API

//   const [modalUser, setModalUser] = useState(false); // สถานะสำหรับควบคุมการเปิด/ปิด modal
//   const [getSearch, setGetSearch] = useState([]); // สถานะสำหรับเก็บผลการค้นหา
//   const [isSubmitted, setIsSubmitted] = useState(false); // สถานะสำหรับควบคุมการส่งฟอร์ม
//   const [showData, setShowData] = useState(false);

//   // สถานะสำหรับควบคุมการแสดงข้อมูล
//   const [selectedUserId, setSelectedUserId] = useState(null);
//   const [selectedEmployee, setSelectedEmployee] = useState(null); // สถานะสำหรับเก็บพนักงานที่เลือก
//   const [userForm, setUserForm] = useState({
//     username: "",
//     password: "",
//     confirmPassword: "",
//     status: "",
//     role_code: "",
//   }); // สถานะสำหรับเก็บข้อมูลฟอร์มของผู้ใช้

//   const [mode, setMode] = useState("adduser"); // To track if editing or adding a user
//   const [showPasswordField, setShowPasswordField] = useState(false); // To control the visibility of password field

//   const [warningAlert, setWarningAlert] = useState(false);
//   const [userAlert, setUserAlert] = useState(false);
//   const [modalMessage, setModalMessage] = useState("");
//   const [DeleteEmployee, setDeleteEmployee] = useState(false);

//   // Sync hospitalData with formState
//   const [initialLoad, setInitialLoad] = useState(false);

//   // Fetch department data from API
//   const fetchDepartments = async () => {
//     try {
//       const response = await EmployeeApi.getEmployeeDepartmentDropdown(); // Replace this with your actual API call
//       if (response.isCompleted && response.data.length > 0) {
//         setDepartmentList(response.data); // Set department data from API
//       } else {
//         console.error("Error fetching department data:", response.message);
//       }
//     } catch (error) {
//       console.error("Error fetching department:", error);
//     }
//   };

//   useEffect(() => {
//     fetchDepartments(); // Fetch department data when component loads
//   }, []);

//   // Fetch department data from API
//   const fetchPositions = async () => {
//     try {
//       const response = await EmployeeApi.getEmployeePositionDropdown(); // Replace this with your actual API call
//       if (response.isCompleted && response.data.length > 0) {
//         setPositionList(response.data); // Set position data from API
//       } else {
//         console.error("Error fetching position data:", response.message);
//       }
//     } catch (error) {
//       console.error("Error fetching position:", error);
//     }
//   };

//   useEffect(() => {
//     fetchPositions(); // Fetch department data when component loads
//   }, []);

//   // useEffect สำหรับการดึงข้อมูลพนักงานเมื่อ component ทำการ mount

//   const fetchEmployee = async () => {
//     try {
//       const response = await EmployeeApi.searchEmployees(filters); // เรียก API เพื่อนำข้อมูลพนักงาน
//       if (response.data.isCompleted) {
//         // ตรวจสอบว่าข้อมูลที่ดึงมาสำเร็จ
//         const employees = response.data.data; // เก็บข้อมูลพนักงาน
//         setEmployee(employees); // ตั้งค่าข้อมูลพนักงาน
//         setGetSearch(Array.isArray(employees) ? employees : []); // ตั้งค่าผลการค้นหา
//       } else {
//         console.error("Error fetching employee data:", response.data.message); // แสดงข้อผิดพลาดถ้าการดึงข้อมูลไม่สำเร็จ
//       }
//     } catch (error) {
//       console.error("Error fetching employee", error); // แสดงข้อผิดพลาดถ้ามีปัญหาในการดึงข้อมูล
//     }
//   };

//   useEffect(() => {
//     fetchEmployee();
//   }, []);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target; // ดึงชื่อและค่าจากเหตุการณ์ที่เกิดขึ้น
//     setFilters({
//       ...filters,
//       [name]: value, // อัพเดตค่าฟิลเตอร์
//     });
//     setShowData(false); // ซ่อนข้อมูลเมื่อฟิลเตอร์มีการเปลี่ยนแปลง
//   };

//   // ฟังก์ชันสำหรับหา department name จาก dept_code
//   const getDepartmentName = (dept_code) => {
//     const departmentItem = departmentList.find((dept) => dept.value === dept_code); // ใช้ departmentList ที่ดึงจาก API
//     return departmentItem ? departmentItem.text : ""; // return department name หรือ empty string ถ้าไม่พบ
//   };

//   // ฟังก์ชันสำหรับหา position name จาก posi_code
//   const getPositionName = (posi_code) => {
//     const positionItem = positionList.find((posi) => posi.value === posi_code); // position ยังคงมาจาก dataMain หรือ API (ขึ้นอยู่กับการออกแบบของคุณ)
//     return positionItem ? positionItem.text : ""; // return position name หรือ empty string ถ้าไม่พบ
//   };

//   const getStatusBadge = (is_active) => {
//     const badgeColor = is_active === 1 ? "success" : "error";
//     const badgeContent = is_active === 1 ? "ใช้งาน" : "ไม่ใช้งาน";

//     const badgeColorMap = {
//       success: "#28a745",
//       error: "#dc3545",
//     };

//     return (
//       <Box mr={1}>
//         <MDBadge
//           variant="contained"
//           size="xs"
//           color={badgeColor}
//           container
//           badgeContent={
//             <>
//               <span
//                 className="status-circle"
//                 style={{ backgroundColor: badgeColorMap[badgeColor] }}
//               ></span>
//               {badgeContent}
//             </>
//           }
//         />
//       </Box>
//     );
//   };

//   // ฟังก์ชันสำหรับการค้นหาข้อมูลพนักงาน
//   const onSearch = () => {
//     if (!Array.isArray(employee)) {
//       console.error("Employee is not an array:", employee);
//       return;
//     }

//     const filteredEmployees = employee.filter((emp) => {
//       const fullName = `${emp.employee_emp_title_name || ""} ${
//         emp.employee_emp_first_name_th || ""
//       } ${emp.employee_emp_last_name_th || ""}`;
//       return (
//         (emp.employee_emp_code ? emp.employee_emp_code.toLowerCase() : "").includes(
//           filters.employee_emp_code.toLowerCase()
//         ) &&
//         fullName.toLowerCase().includes(filters.name.toLowerCase()) &&
//         (emp.dept_code ? emp.dept_code.toLowerCase() : "").includes(
//           filters.dept_code.toLowerCase()
//         ) &&
//         (emp.posi_code ? emp.posi_code.toLowerCase() : "").includes(filters.posi_code.toLowerCase())
//       );
//     });

//     setGetSearch(filteredEmployees);
//     setShowData(true);
//   };

//   // คอลัมน์ที่จะแสดงใน DataTable
//   const columns = [
//     {
//       Header: lang.msg("employee.emp_code_1"),
//       accessor: "emp_code",
//       width: "10%",
//       align: "center",
//     },
//     { Header: lang.msg("employee.employee_name"), accessor: "name", width: "10%", align: "center" },
//     { Header: lang.msg("employee.contact"), accessor: "contact", width: "10%", align: "center" },
//     {
//       Header: lang.msg("employee.department"),
//       accessor: "department",
//       width: "10%",
//       align: "center",
//     },
//     { Header: lang.msg("employee.position"), accessor: "position", width: "10%", align: "center" },
//     { Header: lang.msg("field.username"), accessor: "username", width: "10%", align: "center" },
//     {
//       Header: lang.msg("employee.employee_status"),
//       accessor: "status",
//       width: "10%",
//       align: "center",
//     },
//     {
//       Header: lang.msg("employee.actions"),
//       accessor: "actions",
//       width: "15%",
//       align: "center",
//       Cell: ({ row }) => row.original.actions,
//     },
//   ];

//   // แปลงข้อมูลพนักงานเป็นรูปแบบของแถวใน DataTable
//   const rows = Array.isArray(getSearch)
//     ? getSearch.map((employee) => ({
//         emp_code: employee.employee_emp_code || "",
//         name: `${employee.employee_emp_title_name || ""} ${
//           employee.employee_emp_first_name_th || ""
//         } ${employee.employee_emp_last_name_th || ""}`,
//         contact: employee.employee_emp_contact || "",
//         department: getDepartmentName(employee.dept_code) || "", // แสดง department name แทน dept_code
//         position: getPositionName(employee.posi_code) || "", // แสดง position name แทน posi_code
//         username: employee.username || "",
//         status: getStatusBadge(employee.emp_is_active),
//         actions: (
//           <Box display="flex" alignItems="center" gap={0.5}>
//             {/* ใช้ ButtonComponent สำหรับ Delete */}
//             <ButtonComponent
//               type="iconDelete"
//               onClick={() => handleDeleteClick(employee.employee_emp_id)}
//             />

//             {/* ใช้ ButtonComponent สำหรับ Edit */}
//             <ButtonComponent
//               type="iconEdit"
//               onClick={() => handleEditClick(employee.employee_emp_id)}
//             />

//             {/* ใช้ ButtonComponent สำหรับ addUser */}
//             <ButtonComponent type="iconPermission" onClick={() => handleUserClick(employee)} />
//           </Box>
//         ),
//       }))
//     : []; // ตรวจสอบว่าข้อมูล getSearch เป็น array และแปลงเป็นรูปแบบของแถวใน DataTable

//   const navigate = useNavigate(); // ใช้ useNavigate สำหรับการนำทาง

//   // ฟังก์ชันสำหรับการคลิกปุ่ม Edit
//   const handleEditClick = (employee_id) => {
//     navigate(`/employee-edit?employee_id=${employee_id}`); // นำทางไปยังหน้า EditEmployee พร้อมกับพารามิเตอร์ employee_id
//   };

//   const handleDeleteClick = (employee_id) => {
//     setDeleteEmployee(true);
//     setSelectedEmployee(employee_id); // Store the selected employee ID for deletion
//     setModalMessage("คุณแน่ใจหรือไม่ที่จะลบพนักงานนี้?"); // Set the confirmation message
//   };

//   // ฟังก์ชันสำหรับการคลิกปุ่ม Delete
//   const handleDelete = async () => {
//     try {
//       const response = await EmployeeApi.deleteEmployee(selectedEmployee);

//       // ตรวจสอบสถานะการตอบกลับจาก API
//       console.log("Status", response.status);

//       if (response.isCompleted && !response.isError) {
//         console.log(`Employee with ID ${selectedEmployee} deleted successfully`);

//         setEmployee((prevEmployees) =>
//           prevEmployees.filter((emp) => emp.employee_id !== selectedEmployee)
//         );
//         setGetSearch((prevSearchResults) =>
//           prevSearchResults.filter((emp) => emp.employee_id !== selectedEmployee)
//         );
//         setDeleteEmployee(false); // ปิด SweetAlert modal
//         setModalMessage("พนักงานถูกลบเรียบร้อยแล้ว"); // ตั้งข้อความสำเร็จ
//         setUserAlert(true); // แสดงข้อความแจ้งเตือนสำเร็จ
//         fetchEmployee();
//       } else {
//         console.error(`Failed to delete employee with ID ${selectedEmployee}:`, response.message);
//         setModalMessage("ไม่สามารถลบพนักงานได้ กรุณาลองใหม่อีกครั้ง"); // ตั้งข้อความผิดพลาด
//         setDeleteEmployee(false); // ปิด SweetAlert modal
//         setWarningAlert(true); // แสดงข้อความแจ้งเตือนผิดพลาด
//       }
//     } catch (error) {
//       console.error(
//         "Error occurred while deleting employee:",
//         error.response ? error.response.data : error.message || error
//       );
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       if (selectedEmployee) {
//         try {
//           const response = await EmployeeApi.getEmployeeDataById(selectedEmployee);
//           if (response.isCompleted && !response.isError) {
//             const empId = response.data.employee_emp_id;
//             setEmployeeID({ employee_id: empId });
//           } else {
//             console.error("Error fetching Employee ID:", response.message);
//           }
//         } catch (error) {
//           console.error("Error fetching Employee ID:", error.message || error);
//         }
//       }
//     };

//     fetchData();
//   }, [selectedEmployee]);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       if (selectedUserId) {
//         try {
//           const response = await EmployeeApi.getEmployeeDataByUserId(selectedUserId);
//           console.log("Full API response: ", response); // ตรวจสอบโครงสร้างของการตอบกลับทั้งหมด

//           // แทนที่จะตรวจสอบ response.data.isCompleted ลองตรวจสอบว่า response.isCompleted ถูกต้องไหม
//           if (response.isCompleted && !initialLoad) {
//             const userData = response.data;
//             console.log("Fetched user data:", userData);

//             setUserForm({
//               username: userData.username || "",
//               password: "",
//               confirmPassword: "",
//               role_code: userData.role_code || "",
//             });
//             setInitialLoad(true);
//           } else {
//             console.error("Error fetching user data:", response.message || "Unknown error");
//           }
//         } catch (error) {
//           console.error("Error fetching user data:", error.message || error);
//         }
//       } else {
//         setUserForm({
//           username: "",
//           password: "",
//           confirmPassword: "",
//           role_code: "",
//         });
//         setInitialLoad(true);
//       }
//     };

//     fetchUserData();
//   }, [selectedUserId, initialLoad]);

//   useEffect(() => {
//     // Logic to determine if editing or adding a user
//     // For example, set `mode` based on whether `selectedUserId` exists or not
//     if (selectedUserId) {
//       setMode("edituser");
//       // Fetch user data and set form values for editing
//     } else {
//       setMode("adduser");
//     }
//   }, [selectedUserId]);

//   const handleUserFormChange = (e) => {
//     const { name, value } = e.target;
//     setUserForm({
//       ...userForm,
//       [name]: value,
//     });
//   };

//   const handleUserClick = async (user) => {
//     try {
//       // เรียก API เพื่อดึง role_code
//       const response = await EmployeeApi.getEmployeeDataByUserId(user.user_id);
//       const roleCode = response?.data?.role_code || ""; // ดึง role_code หรือกำหนดค่า Default
//       // ตั้งค่าข้อมูลใน form
//       setUserForm({
//         ...userForm,
//         user_id: user.user_id,
//         username: user.username,
//         password: "",
//         role_code: roleCode, // อัปเดต role_code ที่ดึงมา
//       });

//       setSelectedUserId(user.user_id);
//       setSelectedEmployee(user.employee_emp_id);
//       setModalUser(true); // เปิด modal
//     } catch (error) {
//       console.error("Error fetching role_code:", error);
//     }
//   };

//   const closeUser = () => {
//     setModalUser(false);
//     setShowPasswordField(false);
//     setUserForm({
//       username: "",
//       password: "",
//       confirmPassword: "",
//       role_code: "",
//     });
//   };

//   const handleUserSubmit = async (e) => {
//     e.preventDefault();

//     if (mode === "adduser" || showPasswordField) {
//       if (userForm.password !== userForm.confirmPassword) {
//         alert("Passwords do not match!");
//         return;
//       }
//     }

//     try {
//       let response;
//       if (mode === "edituser") {
//         // Call with both employee and user ID for updating
//         response = await EmployeeApi.addUserToEmployee(selectedEmployee, selectedUserId, userForm);
//       } else {
//         // Call without user ID for adding a new user
//         response = await EmployeeApi.addUserToEmployee(selectedEmployee, null, userForm); // Passing null explicitly to match the method
//       }

//       if (response.isCompleted) {
//         setModalUser(false);
//         setUserAlert(true);
//         setModalMessage(response.message);
//         setUserForm({
//           username: "",
//           password: "",
//           confirmPassword: "",
//           role_code: "",
//         });
//         fetchEmployee();
//       } else {
//         console.error("Failed to save user data:", response.message);
//         setWarningAlert(true);
//         setModalMessage(response.message);
//       }
//     } catch (error) {
//       console.error("Error saving data:", error);
//     }
//   };

//   const changespassword = lang.msg("item.user_change_password");
//   const password = lang.msg("field.password");
//   const confirmpassword = lang.msg("field.confirm_password");

//   const handleAdd = () => {
//     navigate("/employee-edit");
//   };

//   return (
//     <DashboardLayout>
//       <DashboardNavbar />
//       <MDBox p={2}>
//         <Box mt={2}>
//           <Card>
//             <MDBox>
//               <MDTypography variant="h5" gutterBottom p={3} ml={3}>
//                 {lang.msg("employee.search_employee")}
//               </MDTypography>
//             </MDBox>
//           </Card>
//           <Box mt={3}>
//             <Card>
//               <MDBox p={3}>
//                 <Box ml={3} mr={3}>
//                   <MDTypography variant="h6" gutterBottom color="primary">
//                     {lang.msg("control.search_information")}
//                   </MDTypography>
//                   <hr style={{ border: "1px solid #EEEEEE" }} />
//                 </Box>
//                 <Box mt={2} pl={5} pr={5}>
//                   <Grid container spacing={3}>
//                     <Grid item xs={12} md={6} lg={6}>
//                       <MDTypography variant="body2">
//                         {lang.msg("employee.employee_name")}
//                       </MDTypography>
//                       <MDInput
//                         fullWidth
//                         name="name"
//                         variant="outlined"
//                         value={filters.name}
//                         onChange={handleFilterChange}
//                         InputProps={{
//                           startAdornment: (
//                             <InputAdornment position="start">
//                               <Search />
//                             </InputAdornment>
//                           ),
//                         }}
//                         placeholder={lang.msg("employee.employee_name")}
//                       />
//                     </Grid>
//                     <Grid item xs={12} md={6} lg={6}>
//                       <MDTypography variant="body2">{lang.msg("employee.emp_code_1")}</MDTypography>
//                       <MDInput
//                         fullWidth
//                         name="employee_emp_code"
//                         value={filters.employee_emp_code}
//                         onChange={handleFilterChange}
//                         InputProps={{
//                           startAdornment: (
//                             <InputAdornment position="start">
//                               <Search />
//                             </InputAdornment>
//                           ),
//                         }}
//                         placeholder={lang.msg("employee.emp_code_1")}
//                       />
//                     </Grid>
//                     <Grid item xs={12} md={6} lg={6}>
//                       <StyledFormControl fullWidth>
//                         <MDTypography variant="body2">
//                           {lang.msg("employee.department")}
//                         </MDTypography>
//                         <StyledSelect
//                           name="dept_code"
//                           value={filters.dept_code}
//                           onChange={handleFilterChange}
//                           displayEmpty // เพื่อแสดงค่าเริ่มต้นใน dropdown
//                         >
//                           <StyledMenuItem value="" disabled>
//                             -- ทั้งหมด --
//                           </StyledMenuItem>
//                           {departmentList.map((dept) => (
//                             <MenuItem key={dept.value} value={dept.value}>
//                               {dept.text}
//                             </MenuItem>
//                           ))}
//                         </StyledSelect>
//                       </StyledFormControl>
//                     </Grid>
//                     <Grid item xs={12} md={6} lg={6}>
//                       <StyledFormControl fullWidth>
//                         <MDTypography variant="body2">{lang.msg("employee.position")}</MDTypography>
//                         <StyledSelect
//                           name="posi_code"
//                           value={filters.posi_code}
//                           onChange={handleFilterChange}
//                           displayEmpty // เพื่อแสดงค่าเริ่มต้นใน dropdown
//                         >
//                           <StyledMenuItem value="" disabled>
//                             -- ทั้งหมด --
//                           </StyledMenuItem>
//                           {positionList.map((dept) => (
//                             <MenuItem key={dept.value} value={dept.value}>
//                               {dept.text}
//                             </MenuItem>
//                           ))}
//                         </StyledSelect>
//                       </StyledFormControl>
//                     </Grid>
//                   </Grid>
//                   <Box display="flex" justifyContent="center" alignItems="center" mt={5} gap={2}>
//                     {/* <MDButton
//                       variant="contained"
//                       color="primary"
//                       onClick={() => {
//                         onSearch();
//                         setShowData(true);
//                       }}
//                       startIcon={<SearchOutlinedIcon />}
//                     >
//                       {lang.btnSearch()}
//                     </MDButton> */}

//                     <MDButton display="flex" justifyContent="center" gap={2} mt={3}>
//                       <ButtonComponent type="searchIcon" onClick={() => { onSearch(); setShowData(true);}} />
//                     </MDButton>
//                   </Box>
//                 </Box>
//               </MDBox>
//             </Card>
//           </Box>
//         </Box>
//       </MDBox>

//       <MDBox p={2}>
//         <Card>
//           <Box p={5}>
//             <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
//               <MDTypography variant="h5" color="primary">
//                 {lang.msg("title.search_results")}
//               </MDTypography>
//               {/* <MDButton
//             color="info"
//             component={Link}
//             to="/employee-edit"
//             startIcon={<AddCircleOutlineOutlinedIcon />}
//           >
//             {lang.btnAdd()}
//           </MDButton> */}

//               <MDButton display="flex" justifyContent="center" gap={2} mt={3}>
//                 <ButtonComponent type="addIcon" onClick={handleAdd} />
//               </MDButton>
//             </Box>
//             <TableContainer>
//               <DataTable
//                 table={{
//                   columns,
//                   rows: showData ? rows : [], // ถ้า showData เป็น false, แสดงตารางที่ไม่มี rows (ข้อมูล)
//                 }}
//                 canSearch
//               />
//             </TableContainer>
//           </Box>
//         </Card>
//       </MDBox>
//       <Modal
//         open={modalUser}
//         onClose={closeUser}
//         aria-labelledby="user-modal-title"
//         aria-describedby="user-modal-description"
//       >
//         <MDBox
//           sx={{
//             p: 2,
//             bgcolor: "background.paper",
//             borderRadius: 2,
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: "400px",
//             boxShadow: 24,
//           }}
//         >
//           <MDBox display="flex" justifyContent="space-between" alignItems="center">
//             <MDTypography
//               id="user-modal-title"
//               variant="h5"
//               sx={{
//                 color: "primary.main",
//               }}
//             >
//               {mode === "edituser" ? lang.msg("role.role_title_2") : lang.msg("role.role_title_1")}
//             </MDTypography>
//             <IconButton
//               onClick={closeUser}
//               sx={{
//                 color: "primary.main",
//                 borderRadius: "50%",
//                 fontWeight: "bold",
//                 p: 0.5, // Small padding for the button
//               }}
//             >
//               ✕
//             </IconButton>
//           </MDBox>

//           <Box sx={{ borderBottom: "1px solid #ccc", mb: 3 }} />

//           <form>
//             <MDBox mt={2}>
//               <MDTypography variant="body02" fontSize="medium">
//                 {lang.msg("field.username")}
//                 {<span style={{ color: "red" }}> *</span>}
//               </MDTypography>
//               <MDInput
//                 name="username"
//                 value={userForm.username}
//                 onChange={handleUserFormChange}
//                 fullWidth
//                 disabled={mode === "edituser"}
//               />

//               {/* Common elements for both adduser and edituser */}
//               {mode === "edituser" && (
//                 <>
//                   <Grid container>
//                     <Grid item xs={12} lg={1}>
//                       <FormControlLabel
//                         control={
//                           <Checkbox
//                             checked={showPasswordField}
//                             onChange={(e) => setShowPasswordField(e.target.checked)}
//                             name="showPassword"
//                           />
//                         }
//                       />
//                     </Grid>
//                     <Grid item xs={12} lg={11}>
//                       <MDTypography variant="body02" fontSize="medium">
//                         {changespassword}
//                       </MDTypography>
//                     </Grid>
//                   </Grid>
//                 </>
//               )}

//               {/* Show password fields conditionally based on the mode */}
//               {(mode === "adduser" || showPasswordField) && (
//                 <>
//                   <MDTypography variant="body02" fontSize="medium">
//                     {password}
//                     {<span style={{ color: "red" }}> *</span>}
//                   </MDTypography>

//                   <MDInput
//                     name="password"
//                     type="password"
//                     value={userForm.password}
//                     onChange={handleUserFormChange}
//                     fullWidth
//                   />
//                   <MDTypography variant="body02" fontSize="medium">
//                     {confirmpassword}
//                     {<span style={{ color: "red" }}> *</span>}
//                   </MDTypography>
//                   <MDInput
//                     name="confirmPassword"
//                     type="password"
//                     value={userForm.confirmPassword}
//                     onChange={handleUserFormChange}
//                     fullWidth
//                   />
//                 </>
//               )}

//               {/* Role select and other fields */}
//               <StyledFormControl fullWidth sx={{ mt: 2 }}>
//                 <MDTypography variant="body02" fontSize="medium">
//                   {lang.msg("field.role")}
//                   {<span style={{ color: "red" }}> *</span>}
//                 </MDTypography>
//                 <StyledSelect
//                   name="role_code"
//                   value={userForm.role_code} // กำหนดให้เป็น string ว่างถ้า role_code เป็น undefined
//                   onChange={handleUserFormChange}
//                   displayEmpty // ใช้ displayEmpty เพื่อแสดง MenuItem ที่ value=""
//                 >
//                   <StyledMenuItem value="" disabled>
//                     --- กรุณาเลือก ---
//                   </StyledMenuItem>

//                   {role.map((roleItem) => (
//                     <StyledMenuItem key={roleItem.value} value={roleItem.value}>
//                       {roleItem.text}
//                     </StyledMenuItem>
//                   ))}
//                 </StyledSelect>
//               </StyledFormControl>
//               <Box sx={{ borderBottom: "1px solid #ccc", mt: 3 }} />
//               {/* Buttons */}
//               {/* <Box display="flex" justifyContent="center" gap={2}>
//                 <MDButton
//                   variant="contained"
//                   type="submit"
//                   color="primary"
//                   startIcon={<SaveOutlinedIcon />}
//                   sx={{ mt: 2 }}
//                 >
//                   {lang.btnSave()}
//                 </MDButton>
//                 <MDButton
//                   variant="outlined"
//                   color="secondary"
//                   startIcon={<ClearOutlinedIcon />}
//                   onClick={closeUser}
//                   sx={{ mt: 2 }}
//                 >
//                   {lang.btnCancel()}
//                 </MDButton>
//               </Box> */}


//               <MDBox display="flex" justifyContent="center" gap={2} mt={3}>
//                 <ButtonComponent type="saveIcon" onClick={handleUserSubmit} /> {/* ปุ่มบันทึก */}
//                 <ButtonComponent type="cancelIcon" onClick={closeUser} /> {/* ปุ่มยกเลิก */}
//               </MDBox>


//             </MDBox>
//           </form>
//         </MDBox>
//       </Modal>
//       {DeleteEmployee && (
//         <SweetAlert
//           error
//           showCancel
//           title="ลบ"
//           cancelBtnText="ยกเลิก"
//           confirmBtnText="ตกลง"
//           style={{
//             padding: "20px",
//             fontSize: "16px", // General font size
//             borderRadius: "20px",
//           }}
//           cancelBtnStyle={{
//             backgroundColor: "white", // สีพื้นหลังปุ่ม "ยกเลิก"
//             color: "#d9534f", // สีข้อความปุ่ม "ยกเลิก"
//             border: "2px solid #d9534f", // เส้นขอบ
//             borderRadius: "10px", // ขอบมน
//             padding: "10px 30px", // เพิ่มขนาดปุ่ม
//             fontSize: "18px", // ขยายข้อความปุ่ม "ยกเลิก"
//           }}
//           confirmBtnStyle={{
//             backgroundColor: "#d9534f", // สีพื้นหลังปุ่ม "ตกลง"
//             color: "white", // สีข้อความปุ่ม "ตกลง"
//             borderRadius: "10px", // ขอบมน
//             padding: "10px 30px", // เพิ่มขนาดปุ่ม
//             fontSize: "18px", // ขยายข้อความปุ่ม "ตกลง"
//           }}
//           onConfirm={handleDelete}
//           onCancel={() => setDeleteEmployee(false)}
//           focusCancelBtn
//         >
//           <MDTypography variant="body02">{modalMessage}</MDTypography>
//         </SweetAlert>
//       )}

//       {userAlert && (
//         <SweetAlert
//           success
//           title={modalMessage}
//           style={{
//             padding: "20px",
//             fontSize: "16px", // General font size
//             borderRadius: "20px",
//           }}
//           confirmBtnStyle={{
//             backgroundColor: "#15803D", // สีพื้นหลัง
//             color: "white", // สีข้อความ
//             borderRadius: "10px", // ขอบมน
//             padding: "10px 20px", // ขยายขนาดของปุ่ม (บน/ล่าง, ซ้าย/ขวา)
//             fontSize: "18px", // ขยายขนาดของข้อความในปุ่ม
//           }}
//           onConfirm={() => setUserAlert(false)}
//           timeout={5000}
//           focusCancelBtn
//         ></SweetAlert>
//       )}
//       {warningAlert && (
//         <SweetAlert
//           warning
//           title={modalMessage}
//           style={{
//             padding: "20px",
//             fontSize: "16px", // General font size
//             borderRadius: "20px",
//           }}
//           confirmBtnStyle={{
//             backgroundColor: "#FFC107", // สีพื้นหลัง
//             color: "white", // สีข้อความ
//             borderRadius: "10px", // ขอบมน
//             padding: "10px 20px", // ขยายขนาดของปุ่ม (บน/ล่าง, ซ้าย/ขวา)
//             fontSize: "18px", // ขยายขนาดของข้อความในปุ่ม
//           }}
//           onConfirm={() => setWarningAlert(false)}
//           timeout={3000}
//           focusCancelBtn
//         ></SweetAlert>
//       )}
//     </DashboardLayout>
//   );
// };

// export default Employee;
