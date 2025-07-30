// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Grid,
//   Card,
//   TextField,
//   Select,
//   MenuItem,
//   Autocomplete,
//   Switch,
//   FormControlLabel,
// } from "@mui/material";
// import {
//   prefixes,
//   bloodGroups,
//   sex,
//   nationalities,
//   ethnicity,
//   religions,
//   empStatus,
// } from "common/dataMain";
// import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
// import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// // Material Dashboard 2 PRO React components
// import MDBox from "components/MDBox";
// import MDInput from "components/MDInput";
// import MDButton from "components/MDButton";
// import MDTypography from "components/MDTypography";
// import { useNavigate } from "react-router-dom"; // นำเข้า Link และ useNavigate สำหรับการจัดการ routing

// import { data as dataProvinces } from "common/dataProvinces";

// import UploadPic from "../components/from_uploadpicture_V002";
// import { format } from "date-fns";

// import BaseClass from "common/baseClass";
// import SweetAlert from "react-bootstrap-sweetalert";
// import EmployeeApi from "api/EmployeeAPI";
// import {
//   StyledTypography,
//   StyledFormControl,
//   StyledMenuItem,
//   StyledSelect,
// } from "common/Global.style";
// import * as lang from "utils/langHelper";
// import { GlobalVar } from "common/GlobalVar";
// import ButtonComponent from "../components/ButtonComponent";

// // ฟังก์ชันสำหรับคำนวณอายุจากวันที่เกิด
// const calculateAge = (birthDate) => {
//   const today = new Date(); // ดึงวันที่ปัจจุบัน
//   const birthDateObj = new Date(birthDate); // แปลงวันที่เกิดเป็น Date object
//   let age = today.getFullYear() - birthDateObj.getFullYear(); // คำนวณปีโดยหักลบปีเกิดจากปีปัจจุบัน
//   const monthDifference = today.getMonth() - birthDateObj.getMonth(); // คำนวณส่วนต่างของเดือน
//   if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
//     age--; // ถ้าเดือนยังไม่ถึงหรือวันยังไม่ถึง ให้ลบอายุลง 1 ปี
//   }
//   return age; // คืนค่าที่คำนวณอายุได้
// };

// // ฟังก์ชันสำหรับคำนวณอายุงานจากวันที่เริ่มงาน
// const calculateWorkAge = (startDate) => {
//   const today = new Date(); // ดึงวันที่ปัจจุบัน
//   const startDateObj = new Date(startDate); // แปลงวันที่เริ่มงานเป็น Date object
//   let years = today.getFullYear() - startDateObj.getFullYear(); // คำนวณปีโดยหักลบปีเริ่มงานจากปีปัจจุบัน
//   let months = today.getMonth() - startDateObj.getMonth(); // คำนวณส่วนต่างของเดือน
//   let days = today.getDate() - startDateObj.getDate(); // คำนวณส่วนต่างของวัน
//   if (months < 0) {
//     // ถ้าเดือนปัจจุบันน้อยกว่าเดือนเริ่มงาน
//     years--; //ลบปีลง 1 ปี
//     months += 12; // เพิ่มเดือนให้เท่ากับ 12 เดือน
//   }
//   if (days < 0) {
//     // ถ้าวันปัจจุบันน้อยกว่าวันเริ่มงาน
//     months--; // ลบเดือนลง 1 เดือน
//     days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); // เพิ่มวันเท่ากับจำนวนวันในเดือนก่อนหน้า
//   }
//   return `${days} วัน ${months} เดือน ${years} ปี`; // คืนค่าที่คำนวณอายุงานได้ในรูปแบบ 'วัน เดือน ปี'
// };

// const Editemployee = () => {
//   // ประกาศ state สำหรับจัดการข้อมูลต่าง ๆ
//   const [selectedDate, setSelectedDate] = useState(null); // เก็บวันที่เกิดที่เลือก
//   const [startDate, setStartDate] = useState(null); // เก็บวันที่เริ่มงานที่เลือก
//   const [isSubmitted, setIsSubmitted] = useState(false); // ใช้ตรวจสอบว่าฟอร์มถูกส่งแล้วหรือยัง
//   const [formData, setFormData] = useState({
//     emp_code: "",
//     dept_code: "",
//     posi_code: "",
//     emp_title_name: "",
//     emp_first_name_th: "",
//     emp_last_name_th: "",
//     emp_first_name_en: "",
//     emp_last_name_en: "",
//     emp_nick_name: "",
//     emp_sex: "ไม่ระบุ",
//     emp_blood_group: "ไม่ระบุ",
//     emp_birth_date: null,
//     emp_age: "",
//     emp_nationality: "ไม่ระบุ",
//     emp_ethnicity: "ไม่ระบุ",
//     emp_religion: "ไม่ระบุ",
//     emp_idcard_number: "",
//     emp_contact: "",
//     emp_email: "",
//     emp_address: "",
//     emp_address_number: "",
//     emp_alley: "",
//     emp_road: "",
//     emp_province: "",
//     emp_district: "",
//     emp_subdistrict: "",
//     emp_postal_code: "",
//     emp_status: "WORK",
//     emp_is_active: "",
//     emp_photo_filename: null,
//     emp_photo_url: null,
//     emp_sign_filename: null,
//     emp_sign_img_url: null,
//     emp_sign: null,
//     emp_photo: null,
//     districts: [],
//     subdistricts: [],
//   });

//   const [districts, setDistricts] = useState([]); // state สำหรับจัดการรายชื่ออำเภอ
//   const [subdistricts, setSubdistricts] = useState([]); // state สำหรับจัดการรายชื่อตำบล
//   const [mode, setMode] = useState("create"); // state สำหรับเก็บโหมดการทำงาน ('create' หรือ 'edit')
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalMessage, setModalMessage] = useState("");

//   // selectedHospitalCode: เก็บค่า hospital_code ที่ผู้ใช้เลือกจาก dropdown ใน modal สำหรับการส่ง LAB นอก
//   const [selectedHospitalCode, setSelectedHospitalCode] = useState("");
//   // department: เก็บรายชื่อโรงพยาบาลที่ดึงมาจาก API เพื่อนำไปใช้ใน dropdown ของ department
//   const [departmentList, setDepartment] = useState([]);
//   // department: เก็บรายชื่อโรงพยาบาลที่ดึงมาจาก API เพื่อนำไปใช้ใน dropdown ของ department
//   const [positionList, setPosition] = useState([]);
//   // hops: เก็บ hospital_code ของโรงพยาบาลที่ถูกเลือก โดยใช้ค่าเริ่มต้นจาก GlobalVar.getHospitalCode()
//   const [hops, setHops] = useState(GlobalVar.getHospitalCode());

//   // ดึง query parameter 'employee_id' จาก URL
//   const searchParams = new URLSearchParams(location.search);
//   const employeeId = searchParams.get("employee_id");
//   console.log("Employee ID:", employeeId);

//   // ฟังก์ชันสำหรับดึงข้อมูลdepartment
//   const fetchDepartment = async () => {
//     try {
//       const response = await EmployeeApi.getEmployeeDepartmentDropdown(hops);
//       if (response.isCompleted && response.data.length > 0) {
//         setDepartment(response.data); // อัปเดตรายการ fetchDepartment ที่จะใช้ใน dropdown
//       }
//       console.log("response fetchHospitalList", response);
//     } catch (error) {
//       console.error("Error fetching hospital list:", error.message);
//     }
//   };

//   // ฟังก์ชันสำหรับดึงข้อมูลposition
//   const fetchPosition = async () => {
//     try {
//       const response = await EmployeeApi.getEmployeePositionDropdown(hops);
//       if (response.isCompleted && response.data.length > 0) {
//         setPosition(response.data); // อัปเดตรายการ fetchPosition ที่จะใช้ใน dropdown
//       }
//       console.log("response fetchHospitalList", response);
//     } catch (error) {
//       console.error("Error fetching hospital list:", error.message);
//     }
//   };

//   // ใช้ useEffect เพื่อดึงข้อมูลพนักงานจาก API เมื่อ component โหลด
//   useEffect(() => {
//     const fetchEmployeeData = async () => {
//       if (!employeeId) {
//         // ถ้าไม่พบ employee_id
//         console.error("Employee ID is missing");
//         return; // หยุดการทำงานของฟังก์ชัน
//       }

//       try {
//         const response = await EmployeeApi.getEmployeeDataById(employeeId); // เรียก API เพื่อดึงข้อมูลพนักงานตาม employee_id
//         console.log("Response from getEmployeeDataById:", response); // แสดง response ที่ได้จาก API ใน console เพื่อการดีบัก

//         if (response.isCompleted && !response.isError) {
//           // ถ้า response สำเร็จและไม่มีข้อผิดพลาด
//           const employeeinfo = response.data; // ดึงข้อมูลพนักงานจาก response

//           if (!employeeinfo) {
//             // ถ้าไม่พบข้อมูลพนักงาน
//             console.error("Employee data is undefined");
//             return; // หยุดการทำงานของฟังก์ชัน
//           }

//           console.log("Fetched employee data:", employeeinfo);

//           const fetchedDistricts = getDistricts(employeeinfo.emp_province); // ดึงรายชื่ออำเภอตามจังหวัดที่พนักงานอยู่
//           const fetchedSubdistricts = getSubdistricts(
//             employeeinfo.emp_province,
//             employeeinfo.emp_district
//           ); // ดึงรายชื่อตำบลตามจังหวัดและอำเภอที่พนักงานอยู่

//           console.log("Fetched districts:", fetchedDistricts);
//           console.log("Fetched subdistricts:", fetchedSubdistricts);

//           setFormData((prevFormData) => ({
//             ...prevFormData,
//             ...employeeinfo, // นำข้อมูลพนักงานมาใส่ใน formData
//             emp_code: employeeinfo.emp_code || "",
//             dept_code: employeeinfo.dept_code || "",
//             posi_code: employeeinfo.posi_code || "",
//             emp_title_name: employeeinfo.emp_title_name || "",
//             emp_first_name_th: employeeinfo.emp_first_name_th || "",
//             emp_first_name_en: employeeinfo.emp_first_name_en || "",
//             emp_last_name_th: employeeinfo.emp_last_name_th || "",
//             emp_last_name_en: employeeinfo.emp_last_name_en || "",
//             emp_nick_name: employeeinfo.emp_nick_name || "",
//             photo: employeeinfo.photo || "",
//             emp_photo_filename: employeeinfo.emp_photo_filename || "",
//             emp_photo_url: employeeinfo.emp_photo_url || "",
//             emp_sex: employeeinfo.emp_sex || "ไม่ระบุ",
//             emp_blood_group: employeeinfo.emp_blood_group || "ไม่ระบุ",
//             emp_birth_date: employeeinfo.emp_birth_date
//               ? new Date(employeeinfo.emp_birth_date)
//               : null, // แปลง birth_date เป็น Date object
//             emp_age: employeeinfo.emp_age || "",
//             emp_nationality: employeeinfo.emp_nationality || "ไม่ระบุ",
//             emp_ethnicity: employeeinfo.emp_ethnicity || "ไม่ระบุ",
//             emp_religion: employeeinfo.emp_religion || "ไม่ระบุ",
//             emp_idcard_number: employeeinfo.emp_idcard_number || "",
//             emp_contact: employeeinfo.emp_contact || "",
//             emp_email: employeeinfo.emp_email || "",
//             emp_address: employeeinfo.emp_address || "",
//             emp_address_number: employeeinfo.emp_address_number || "",
//             emp_alley: employeeinfo.emp_alley || "",
//             emp_road: employeeinfo.emp_road || "",
//             emp_province: employeeinfo.emp_province || "",
//             emp_district: employeeinfo.emp_district || "",
//             emp_subdistrict: employeeinfo.emp_subdistrict || "",
//             emp_postal_code: employeeinfo.emp_postal_code || "",
//             emp_status: employeeinfo.emp_status || "WORK",
//             emp_is_active: employeeinfo.emp_is_active || false,
//             emp_sign_filename: employeeinfo.emp_sign_filename || "",
//             emp_sign_img_url: employeeinfo.emp_sign_img_url || "",
//             emp_sign: employeeinfo.emp_sign || "",
//             districts: fetchedDistricts,
//             subdistricts: fetchedSubdistricts,
//           }));

//           setDistricts(fetchedDistricts); // อัพเดท districts state ด้วยข้อมูลอำเภอที่ดึงมา
//           setSubdistricts(fetchedSubdistricts); // อัพเดท subdistricts state ด้วยข้อมูลตำบลที่ดึงมา

//           setSelectedDate(
//             employeeinfo.emp_birth_date ? new Date(employeeinfo.emp_birth_date) : null
//           ); // อัพเดต state ของ selectedDate ด้วยวันเกิด
//           setStartDate(employeeinfo.start_date ? new Date(employeeinfo.start_date) : null); // อัพเดต state ของ startDate ด้วยวันเริ่มงาน
//           console.log("Birth Date:", employeeinfo.emp_birth_date);
//         } else {
//           console.error("Error fetching employee data:", response.message);
//         }
//       } catch (error) {
//         console.error("Error fetching employee data:", error.message || error);
//       }
//     };

//     fetchDepartment();
//     fetchPosition();
//     fetchEmployeeData(); // เรียกฟังก์ชัน fetchEmployeeData หากมี employee_id
//   }, [location.search]);

//   useEffect(() => {
//     // ตรวจสอบว่า employeeId มีค่าอยู่หรือไม่
//     if (employeeId) {
//       setMode("edit"); // หากมี employeeId ให้ตั้งค่าโหมดเป็น 'edit'
//     } else {
//       setMode("create"); // หากไม่มี employeeId ให้ตั้งค่าโหมดเป็น 'create'
//     }
//   }, [employeeId]); // ใช้ useEffect เพื่อเรียกทำงานเมื่อ employeeId เปลี่ยนแปลง

//   // ฟังก์ชันสำหรับดึงรายชื่ออำเภอจากจังหวัดที่เลือก
//   const getDistricts = (provinceName) => {
//     return dataProvinces.provinces.find((p) => p.name === provinceName)?.districts || [];
//   };

//   // ฟังก์ชันสำหรับดึงรายชื่อตำบลจากจังหวัดและอำเภอที่เลือก
//   const getSubdistricts = (provinceName, districtName) => {
//     return (
//       dataProvinces.provinces
//         .find((p) => p.name === provinceName)
//         ?.districts.find((d) => d.name === districtName)?.subdistricts || []
//     );
//   };

//   // ฟังก์ชันสำหรับจัดการเมื่อเลือกจังหวัด
//   const handleProvinceChange = (e) => {
//     const { value } = e.target;
//     const selectedProvince = dataProvinces.provinces.find((p) => p.name === value);
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       emp_province: value, // อัปเดตชื่อจังหวัดใน formData
//       emp_district: "", // ล้างค่าอำเภอ
//       subdistricts: [], // ล้างรายชื่อตำบล
//       emp_subdistrict: "", // ล้างค่าตำบล
//       emp_postal_code: "", // ล้างรหัสไปรษณีย์
//     }));

//     setDistricts(selectedProvince ? selectedProvince.districts : []); // อัปเดตรายชื่ออำเภอ
//     setSubdistricts([]); // ล้างรายชื่อตำบล
//   };

//   // ฟังก์ชันสำหรับจัดการเมื่อเลือกอำเภอ
//   const handleDistrictChange = (e) => {
//     const { value } = e.target;
//     const selectedDistrict = districts.find((d) => d.name === value);
//     const fetchedSubdistricts = getSubdistricts(formData.emp_province, value);

//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       emp_district: value,
//       emp_subdistrict: "",
//       emp_postal_code: "",
//       subdistricts: fetchedSubdistricts,
//     }));
//     setSubdistricts(fetchedSubdistricts);
//   };

//   // ฟังก์ชันสำหรับจัดการเมื่อเลือกตำบล
//   const handleSubdistrictChange = (e) => {
//     const { value } = e.target;
//     const selectedSubdistrict = subdistricts.find((s) => s.name === value);

//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       emp_subdistrict: value, // อัปเดตชื่อตำบลใน formData
//       emp_postal_code: selectedSubdistrict ? selectedSubdistrict.postalCode : "", // อัปเดตรหัสไปรษณีย์
//     }));
//   };

//   // useEffect สำหรับคำนวณอายุเมื่อวันที่เกิดเปลี่ยนแปลง
//   useEffect(() => {
//     if (selectedDate) {
//       const age = calculateAge(selectedDate); // คำนวณอายุจากวันที่เกิด
//       setFormData((prevFormData) => ({
//         ...prevFormData,
//         emp_birth_date: selectedDate, // อัปเดตวันที่เกิดใน formData
//         emp_age: age, // อัปเดตอายุใน formData
//       }));
//     }
//   }, [selectedDate]); // ใช้ useEffect เพื่อเรียกทำงานเมื่อ selectedDate เปลี่ยนแปลง

//   // useEffect สำหรับคำนวณอายุงานเมื่อวันที่เริ่มงานเปลี่ยนแปลง
//   useEffect(() => {
//     if (startDate) {
//       const workAge = calculateWorkAge(startDate); // คำนวณอายุงานจากวันที่เริ่มงาน
//       setFormData((prevFormData) => ({
//         ...prevFormData,
//         start_date: startDate, // อัปเดตวันที่เริ่มงานใน formData
//         work_age: workAge, // อัปเดตอายุงานใน formData
//       }));
//     }
//   }, [startDate]); // ใช้ useEffect เพื่อเรียกทำงานเมื่อ startDate เปลี่ยนแปลง

//   //ฟังก์ชัน รวมข้อมูลที่อยู่ไว้ใน emp_address
//   const updateAddressField = () => {
//     const { emp_address_number, emp_road, emp_alley, emp_postal_code, emp_subdistrict, emp_district, emp_province } = formData;
  
//     const formattedAddress = [
//       emp_address_number, // บ้านเลขที่
//       emp_road ? `ถนน ${emp_road}` : '', // ถนน
//       emp_alley ? `ซอย ${emp_alley}` : '', // ซอย
//       emp_subdistrict ? `ตำบล ${emp_subdistrict}` : '', // ตำบล
//       emp_district ? `อำเภอ ${emp_district}` : '', // อำเภอ
//       emp_province ? `จังหวัด ${emp_province}` : '', // จังหวัด
//       emp_postal_code ? `รหัสไปรษณีย์ ${emp_postal_code}` : '' // รหัสไปรษณีย์
//     ]
//       .filter((field) => field.trim() !== '') // กรองค่าว่างออก
//       .join(' '); // เชื่อมข้อความด้วยคอมมา
  
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       emp_address: formattedAddress, // อัปเดตที่อยู่
//     }));
//   };

//   useEffect(() => {
//     updateAddressField();
//   }, [
//     formData.emp_address_number,
//     formData.emp_road,
//     formData.emp_alley,
//     formData.emp_postal_code,
//     formData.emp_subdistrict,
//     formData.emp_district,
//     formData.emp_province,
//   ]); // ทำงานเมื่อฟิลด์ที่เกี่ยวข้องเปลี่ยนแปลง

  
//   // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของวันที่เกิด
//   const handleDateChange = (newDate) => {
//     setSelectedDate(newDate); // อัปเดตวันที่เกิดที่เลือก
//   };

//   // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของวันที่เริ่มงาน
//   const handleStartDateChange = (newDate) => {
//     setStartDate(newDate); // อัปเดตวันที่เริ่มงานที่เลือก
//   };

//   // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของข้อมูลในฟอร์ม
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     console.log(`Changing ${name}:`, value);
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       [name]: value, // อัปเดตค่าตามชื่อของ input
//     }));
//   };

//   // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของไฟล์ภาพ
//   const handleImageChange = (name, file) => {
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       [name]: file, // อัปเดตไฟล์ภาพใน formData
//     }));
//   };

//   const close = () => {
//     navigate(-1);
//   };

//   // ฟังก์ชันสำหรับจัดการการส่งข้อมูลฟอร์ม
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitted(true);

//     const form = new FormData();
//     const formattedBirthDate = formData.emp_birth_date
//       ? format(new Date(formData.emp_birth_date), "yyyy-MM-dd")
//       : "";

//     if (mode === "edit") {
//       // Append fields specifically for editing
//       form.append("emp_code", formData.emp_code);
//       form.append("dept_code", formData.dept_code);
//       form.append("posi_code", formData.posi_code);
//       form.append("emp_title_name", formData.emp_title_name);
//       form.append("emp_first_name_th", formData.emp_first_name_th);
//       form.append("emp_first_name_en", formData.emp_first_name_en);
//       form.append("emp_last_name_th", formData.emp_last_name_th);
//       form.append("emp_last_name_en", formData.emp_last_name_en);
//       form.append("emp_nick_name", formData.emp_nick_name);
//       form.append("emp_sex", formData.emp_sex);
//       form.append("emp_blood_group", formData.emp_blood_group);
//       form.append("emp_birth_date", formattedBirthDate);
//       form.append("emp_age", formData.emp_age ? parseInt(formData.emp_age, 10) : null);
//       form.append("emp_nationality", formData.emp_nationality);
//       form.append("emp_ethnicity", formData.emp_ethnicity);
//       form.append("emp_religion", formData.emp_religion);
//       form.append("emp_idcard_number", formData.emp_idcard_number);
//       form.append("emp_contact", formData.emp_contact);
//       form.append("emp_email", formData.emp_email);
//       form.append("emp_address", formData.emp_address);
//       form.append("emp_address_number", formData.emp_address_number);
//       form.append("emp_alley", formData.emp_alley);
//       form.append("emp_road", formData.emp_road);
//       form.append("emp_province", formData.emp_province);
//       form.append("emp_district", formData.emp_district);
//       form.append("emp_subdistrict", formData.emp_subdistrict);
//       form.append("emp_postal_code", formData.emp_postal_code);
//       form.append("emp_status", formData.emp_status); // Add emp_status
//       form.append("emp_is_active", formData.emp_is_active ? "true" : "false"); // Add emp_is_active

//       form.append("emp_photo_filename", formData.emp_photo_filename);
//       form.append("emp_photo_url", formData.emp_photo_url);

//       if (formData.emp_photo) {
//         form.append("emp_photo", formData.emp_photo);
//       }

//       if (formData.emp_sign) {
//         form.append("emp_sign", formData.emp_sign); // บันทึกไฟล์ลายเซ็นต์ลงใน FormData
//       }
//     } else if (mode === "create") {
//       // Prepare payload and append data for creation
//       const payload = {
//         ...formData,
//         dept_code: formData.dept_code,
//         posi_code: formData.posi_code,
//         emp_first_name_th: formData.emp_first_name_th,
//         emp_last_name_th: formData.emp_last_name_th,
//         emp_first_name_en: formData.emp_first_name_en,
//         emp_last_name_en: formData.emp_last_name_en,
//         emp_title_name: formData.emp_title_name,
//         emp_nick_name: formData.emp_nick_name,
//         emp_sex: formData.emp_sex,
//         emp_blood_group: formData.emp_blood_group,
//         emp_birth_date: formattedBirthDate,
//         emp_age: formData.emp_age ? parseInt(formData.emp_age, 10) : null,
//         emp_nationality: formData.emp_nationality,
//         emp_ethnicity: formData.emp_ethnicity,
//         emp_religion: formData.emp_religion,
//         emp_idcard_number: formData.emp_idcard_number,
//         emp_contact: formData.emp_contact,
//         emp_email: formData.emp_email,
//         emp_address: formData.emp_address,
//         emp_address_number: formData.emp_address_number,
//         emp_alley: formData.emp_alley,
//         emp_road: formData.emp_road,
//         emp_province: formData.emp_province,
//         emp_district: formData.emp_district,
//         emp_subdistrict: formData.emp_subdistrict,
//         emp_postal_code: formData.emp_postal_code,
//         emp_photo: formData.emp_photo,
//         emp_status: formData.emp_status, // Add emp_status
//         emp_is_active: formData.emp_is_active ? "true" : "false", // Add emp_is_active and make sure it's true/false
//         emp_sign: formData.emp_sign,
//       };

//       Object.keys(payload).forEach((key) => {
//         if (payload[key] !== undefined && payload[key] !== null) {
//           form.append(key, payload[key]);
//         }
//       });
//     }

//     try {
//       let response;
//       if (employeeId && mode === "edit") {
//         response = await EmployeeApi.updateEmployeeData(employeeId, form);
//       } else if (mode === "create") {
//         response = await EmployeeApi.createEmployee(form);
//       }

//       if (response.isCompleted) {
//         setModalMessage(response.message);
//         setIsModalOpen(true);
//       } else {
//         setModalMessage(response.message);
//         setIsModalOpen(true);
//       }
//     } catch (error) {
//       console.error("Error saving data:", error);
//     }
//   };

//   const navigate = useNavigate(); // ใช้ useNavigate แทน Navigate

//   const closeModal = () => {
//     setIsModalOpen(false); // ปิดโมดอล
//     if (modalMessage && modalMessage.toLowerCase().includes("สำเร็จ")) {
//       navigate(-1); // ย้ายไปยังหน้า /employee หากสำเร็จ
//     }
//   };

//   const handleSwitchChange = (event) => {
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       emp_is_active: event.target.checked, // Update emp_is_active with boolean value
//     }));
//   };

 
  

//   return (
//     <DashboardLayout>
//       <DashboardNavbar />
//       <MDBox p={2}>
//         <Box mt={2}>
//           <Card>
//             <MDBox>
//               <MDTypography variant="h5" gutterBottom p={3} ml={3}>
//                 {employeeId
//                   ? lang.msg("employee.employee_status_2")
//                   : lang.msg("employee.employee_status_1")}
//               </MDTypography>
//             </MDBox>
//           </Card>
//           <Box mt={3}>
//             <form>
//               <Grid container spacing={3}>
//                 {/* Left side for main employee details */}
//                 <Grid item xs={12} md={6} lg={6}>
//                   <Card>
//                     <MDBox p={3}>
//                       <MDTypography>
//                         <StyledTypography
//                           variant="h5"
//                           gutterBottom
//                           align="center"
//                           style={{ textAlign: "center" }}
//                         >
//                           <Grid container alignItems="center" justifyContent="space-between">
//                             {/* ข้อความทางซ้าย */}
//                             <Grid item lg={8} container justifyContent="flex-start">
//                               {lang.msg("field.personal_information")}
//                             </Grid>

//                             {/* คำว่า "สถานะ :" และปุ่ม Switch พร้อมข้อความ */}
//                             <Grid
//                               item
//                               lg={4}
//                               container
//                               alignItems="center"
//                               justifyContent="flex-end"
//                               style={{ whiteSpace: "nowrap", flexWrap: "nowrap" }} // ป้องกันการขึ้นบรรทัดใหม่
//                             >
//                               <MDTypography variant="body2" style={{ marginRight: "8px" }}>
//                                 {lang.msg("employee.employee_status")}
//                               </MDTypography>
//                               <Switch
//                                 checked={formData.emp_is_active}
//                                 onChange={handleSwitchChange}
//                                 name="emp_is_active"
//                                 color="success"
//                               />
//                               <MDTypography variant="body2" style={{ marginLeft: "8px" }}>
//                                 {formData.emp_is_active
//                                   ? lang.msg("employee.employee_active_1")
//                                   : lang.msg("employee.employee_active_2")}
//                               </MDTypography>
//                             </Grid>
//                           </Grid>
//                         </StyledTypography>
//                         <hr style={{ border: "1px solid #EEEEEE" }} />
//                       </MDTypography>
//                       <Grid container spacing={3}>
//                         <Grid item xs={12} lg={6}>
                          
//                           <MDTypography variant="body2" p={1} gutterBottom>
//                             {mode === "create"
//                               ? lang.msg("employee.emp_code_2")
//                               : lang.msg("employee.emp_code_1")}
//                             {<span style={{ color: "red" }}> *</span>}
//                           </MDTypography>
//                           {mode === "create" ? (
//                             <MDInput
//                               fullWidth
//                               name="emp_code"
//                               value={formData.emp_code}
//                               onChange={handleChange}
//                               disabled
//                             />
//                           ) : (
//                             <MDInput
//                               fullWidth
//                               name="emp_code"
//                               value={formData.emp_code}
//                               onChange={handleChange}
//                               disabled
//                             />
//                           )}

//                           <Grid item mt={2}>
//                             {mode === "create" ? (
//                               <UploadPic
//                                 name="emp_photo"
//                                 onImageChange={handleImageChange}
//                                 apiImage={
//                                   formData.emp_photo
//                                     ? URL.createObjectURL(formData.emp_photo)
//                                     : null
//                                 }
//                                 resetImage={!formData.emp_photo}
//                                 label={lang.msg("employee.employee_photo")}
//                               />
//                             ) : (
//                               <UploadPic
//                                 name="emp_photo"
//                                 onImageChange={handleImageChange}
//                                 apiImage={
//                                   formData.emp_photo instanceof File ||
//                                   formData.emp_photo instanceof Blob
//                                     ? URL.createObjectURL(formData.emp_photo)
//                                     : formData.emp_photo_url
//                                     ? BaseClass.buildFileUrl(formData.emp_photo_url)
//                                     : null
//                                 }
//                                 resetImage={!formData.emp_photo && !formData.emp_photo_url}
//                                 label={lang.msg("employee.employee_photo")}
//                               />
//                             )}
//                             <Grid
//                               container
//                               alignItems="center"
//                               justifyContent="center"
//                               direction="column"
//                             >
//                             </Grid>
//                           </Grid>
//                         </Grid>
//                         <Grid item xs={12} lg={6} mt={2}>
//                           <StyledFormControl fullWidth>
//                             <MDTypography variant="body2">
//                               {lang.msg("employee.emp_status")}{" "}
//                               {<span style={{ color: "red" }}> *</span>}
//                             </MDTypography>
//                             <StyledSelect
//                               name="emp_status"
//                               value={formData.emp_status}
//                               onChange={handleChange}
//                               required
//                               error={(formData.emp_status || "").trim() === ""}
//                               helperText={
//                                 (formData.emp_status || "").trim() === "" ? "Required field" : ""
//                               }
//                             >
//                               {empStatus.map((status) => (
//                                 <StyledMenuItem key={status.value} value={status.value}>
//                                   {status.text}
//                                 </StyledMenuItem>
//                               ))}
//                             </StyledSelect>
//                           </StyledFormControl>
//                           <Box mt={1} />
//                           <StyledFormControl fullWidth>
//                             <MDTypography variant="body2">
//                               {lang.msg("employee.department")}
//                               {<span style={{ color: "red" }}> *</span>}
//                             </MDTypography>

//                             <StyledSelect
//                               name="dept_code"
//                               value={formData.dept_code} // ใช้ formData.dept_code เป็นค่าที่เลือก
//                               onChange={(e) =>
//                                 setFormData({ ...formData, dept_code: e.target.value })
//                               } // เมื่อเลือกค่าใหม่ใน dropdown
//                               required
//                               error={(formData.dept_code || "").trim() === ""}
//                               helperText={
//                                 (formData.dept_code || "").trim() === "" ? "Required field" : ""
//                               }
//                               displayEmpty // เพื่อแสดงค่าเริ่มต้นใน dropdown
//                             >
//                               <StyledMenuItem value="" disabled>
//                                 --กรุณาเลือก--
//                               </StyledMenuItem>
//                               {departmentList.map((hospital) => (
//                                 <MenuItem key={hospital.value} value={hospital.value}>
//                                   {hospital.text}
//                                 </MenuItem>
//                               ))}
//                             </StyledSelect>
//                           </StyledFormControl>
//                           <Box mt={1} />
//                           <StyledFormControl fullWidth>
//                             <MDTypography variant="body2">
//                               {lang.msg("employee.position")}
//                               {<span style={{ color: "red" }}> *</span>}
//                             </MDTypography>

//                             <StyledSelect
//                               name="posi_code"
//                               value={formData.posi_code}
//                               onChange={(e) =>
//                                 setFormData({ ...formData, posi_code: e.target.value })
//                               }
//                               required
//                               error={(formData.posi_code || "").trim() === ""}
//                               helperText={
//                                 (formData.posi_code || "").trim() === "" ? "Required field" : ""
//                               }
//                               displayEmpty // เพื่อแสดงค่าเริ่มต้นใน dropdown
//                             >
//                               <StyledMenuItem value="" disabled>
//                                 --กรุณาเลือก--
//                               </StyledMenuItem>
//                               {positionList.map((hospital) => (
//                                 <MenuItem key={hospital.value} value={hospital.value}>
//                                   {hospital.text}
//                                 </MenuItem>
//                               ))}
//                             </StyledSelect>
//                           </StyledFormControl>
//                           <Box mt={1} />
//                           <StyledFormControl fullWidth>
//                             <MDTypography variant="body2">{lang.msg("pet.gender")}</MDTypography>
//                             <StyledSelect
//                               name="emp_sex"
//                               value={formData.emp_sex}
//                               onChange={handleChange}
//                               required
//                               error={(formData.emp_sex || "").trim() === ""}
//                               helperText={
//                                 (formData.emp_sex || "").trim() === "" ? "Required field" : ""
//                               }
//                             >
//                               {sex.map((s) => (
//                                 <StyledMenuItem key={s.value} value={s.value}>
//                                   {s.text}
//                                 </StyledMenuItem>
//                               ))}
//                             </StyledSelect>
//                           </StyledFormControl>
//                         </Grid>

//                         <Grid item xs={12} lg={6}>
//                           <StyledFormControl fullWidth>
//                             <MDTypography variant="body2">
//                               {lang.msg("employee.title_name")}
//                               {<span style={{ color: "red" }}> *</span>}
//                             </MDTypography>
//                             <StyledSelect
//                               name="emp_title_name"
//                               value={formData.emp_title_name}
//                               onChange={handleChange}
//                               required
//                               error={(formData.emp_title_name || "").trim() === ""}
//                               helperText={
//                                 (formData.emp_title_name || "").trim() === ""
//                                   ? "Required field"
//                                   : ""
//                               }
//                               displayEmpty // เพื่อแสดงค่าเริ่มต้นใน dropdown
//                             >
//                               <StyledMenuItem value="" disabled>
//                                 --กรุณาเลือก--
//                               </StyledMenuItem>
//                               {prefixes.map((pre) => (
//                                 <StyledMenuItem key={pre.value} value={pre.value}>
//                                   {pre.text}
//                                 </StyledMenuItem>
//                               ))}
//                             </StyledSelect>
//                           </StyledFormControl>
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <MDTypography variant="body2">
//                             {lang.msg("employee.nick_name")}
//                           </MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_nick_name"
//                             value={formData.emp_nick_name}
//                             onChange={handleChange}
//                           />
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <MDTypography variant="body2">
//                             {lang.msg("field.first_name")}
//                             {<span style={{ color: "red" }}> *</span>}
//                           </MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_first_name_th"
//                             value={formData.emp_first_name_th}
//                             onChange={handleChange}
//                             required
//                             error={(formData.emp_first_name_th || "").trim() === ""}
//                             helperText={
//                               (formData.emp_first_name_th || "").trim() === ""
//                                 ? "Required field"
//                                 : ""
//                             }
//                           />
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <MDTypography variant="body2">
//                             {lang.msg("field.last_name")}
//                             {<span style={{ color: "red" }}> *</span>}
//                           </MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_last_name_th"
//                             value={formData.emp_last_name_th}
//                             onChange={handleChange}
//                             required
//                             error={(formData.emp_last_name_th || "").trim() === ""}
//                             helperText={
//                               (formData.emp_last_name_th || "").trim() === ""
//                                 ? "Required field"
//                                 : ""
//                             }
//                           />
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <MDTypography variant="body2">
//                             {lang.msg("field.first_name_en")}
//                             {<span style={{ color: "red" }}> *</span>}
//                           </MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_first_name_en"
//                             value={formData.emp_first_name_en}
//                             onChange={handleChange}
//                             required
//                             error={(formData.emp_first_name_en || "").trim() === ""}
//                             helperText={
//                               (formData.emp_first_name_en || "").trim() === ""
//                                 ? "Required field"
//                                 : ""
//                             }
//                           />
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <MDTypography variant="body2">
//                             {lang.msg("field.last_name_en")}
//                             {<span style={{ color: "red" }}> *</span>}
//                           </MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_last_name_en"
//                             value={formData.emp_last_name_en}
//                             onChange={handleChange}
//                             required
//                             error={(formData.emp_last_name_en || "").trim() === ""}
//                             helperText={
//                               (formData.emp_last_name_en || "").trim() === ""
//                                 ? "Required field"
//                                 : ""
//                             }
//                           />
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <MDTypography variant="body2">
//                             {lang.msg("employee.contact")}
//                             {<span style={{ color: "red" }}> *</span>}
//                           </MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_contact"
//                             value={formData.emp_contact}
//                             onChange={handleChange}
//                           />
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <MDTypography variant="body2">{lang.msg("field.email")}</MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_email"
//                             value={formData.emp_email}
//                             onChange={handleChange}
//                           />
//                         </Grid>

//                         <Grid item xs={12} lg={6}>
//                           <LocalizationProvider dateAdapter={AdapterDateFns}>
//                             <MDTypography variant="body2">
//                               {lang.msg("field.birth_date")}
//                             </MDTypography>
//                             <DatePicker
//                               fullWidth
//                               value={selectedDate}
//                               onChange={handleDateChange}
//                               inputFormat="dd/MM/yyyy"
//                               renderInput={(params) => (
//                                 <MDInput {...params} sx={{ width: "100%" }} />
//                               )}
//                             />
//                           </LocalizationProvider>
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <MDTypography variant="body2">{lang.msg("pet.age_year")}</MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_age"
//                             value={formData.emp_age}
//                             disabled
//                             placeholder={lang.msg("field.auto_calculate")}
//                           />
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <MDTypography variant="body2">
//                             {lang.msg("field.idcard_number")}
//                           </MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_idcard_number"
//                             value={formData.emp_idcard_number}
//                             onChange={handleChange}
//                           />
//                         </Grid>
//                       </Grid>
//                     </MDBox>
//                   </Card>
//                 </Grid>

//                 {/* Right side for address details */}
//                 <Grid item xs={12} md={6} lg={6}>
//                   <Card>
//                     <MDBox p={3}>
//                       <MDTypography variant="h5" gutterBottom color="primary" mb={2}>
//                         {lang.msg("title.address_information")}
//                       </MDTypography>
//                       <hr style={{ border: "1px solid #EEEEEE" }} />
//                       <Grid container spacing={3}>
//                         <Grid item xs={12} lg={12} mt={2}>
//                           <MDTypography variant="body2">{lang.msg("field.address")}</MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_address"
//                             value={formData.emp_address}
//                             onChange={handleChange}
//                             multiline
//                             rows={3}
//                             disabled
//                           />
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <StyledFormControl fullWidth>
//                             <MDTypography variant="body2">
//                               {lang.msg("field.province")}
//                             </MDTypography>
//                             <Autocomplete
//                               id="province"
//                               options={dataProvinces?.provinces || []}
//                               getOptionLabel={(option) => option.name || ""}
//                               value={
//                                 (dataProvinces?.provinces || []).find(
//                                   (province) => province.name === formData.emp_province
//                                 ) || null
//                               }
//                               onChange={(event, newValue) => {
//                                 handleProvinceChange({
//                                   target: {
//                                     name: "emp_province",
//                                     value: newValue ? newValue.name : "",
//                                   },
//                                 });
//                               }}
//                               renderInput={(params) => <TextField {...params} />}
//                             />
//                           </StyledFormControl>
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <StyledFormControl fullWidth>
//                             <MDTypography variant="body2">
//                               {lang.msg("field.district")}
//                             </MDTypography>
//                             <Autocomplete
//                               id="district"
//                               options={districts || []}
//                               getOptionLabel={(option) => option.name || ""}
//                               value={
//                                 (districts || []).find(
//                                   (district) => district.name === formData.emp_district
//                                 ) || null
//                               }
//                               onChange={(event, newValue) => {
//                                 handleDistrictChange({
//                                   target: {
//                                     name: "emp_district",
//                                     value: newValue ? newValue.name : "",
//                                   },
//                                 });
//                               }}
//                               renderInput={(params) => <TextField {...params} />}
//                             />
//                           </StyledFormControl>
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <StyledFormControl fullWidth>
//                             <MDTypography variant="body2">
//                               {lang.msg("field.subdistrict")}
//                             </MDTypography>
//                             <Autocomplete
//                               id="subdistrict"
//                               options={subdistricts || []}
//                               getOptionLabel={(option) => option.name || ""}
//                               value={
//                                 (subdistricts || []).find(
//                                   (subdistrict) => subdistrict.name === formData.emp_subdistrict
//                                 ) || null
//                               }
//                               onChange={(event, newValue) => {
//                                 handleSubdistrictChange({
//                                   target: {
//                                     name: "emp_subdistrict",
//                                     value: newValue ? newValue.name : "",
//                                   },
//                                 });
//                               }}
//                               renderInput={(params) => <TextField {...params} />}
//                             />
//                           </StyledFormControl>
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <MDTypography variant="body2">
//                             {lang.msg("field.postal_code")}
//                           </MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_postal_code"
//                             value={formData.emp_postal_code}
//                             onChange={handleChange}
//                           />
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <MDTypography variant="body2">{lang.msg("field.road")}</MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_road"
//                             value={formData.emp_road}
//                             onChange={handleChange}
//                           />
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <MDTypography variant="body2">{lang.msg("field.alley")}</MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_alley"
//                             value={formData.emp_alley}
//                             onChange={handleChange}
//                           />
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           <MDTypography variant="body2">
//                             {lang.msg("employee.address_number")}
//                           </MDTypography>
//                           <MDInput
//                             fullWidth
//                             name="emp_address_number"
//                             value={formData.emp_address_number}
//                             onChange={handleChange}
//                           />
//                         </Grid>
//                       </Grid>
//                     </MDBox>
//                   </Card>
//                   <br />
//                   <Card>
//                     <MDBox p={3}>
//                       <MDTypography variant="h5" gutterBottom color="primary" mb={2}>
//                         {lang.msg("field.address_additional")}
//                       </MDTypography>
//                       <hr style={{ border: "1px solid #EEEEEE" }} />
//                       <Grid container spacing={3}>
//                         <Grid item xs={12} lg={6} mt={2}>
//                           <StyledFormControl fullWidth>
//                             <MDTypography variant="body2">
//                               {lang.msg("field.ethnicity")}
//                             </MDTypography>
//                             <StyledSelect
//                               name="emp_ethnicity"
//                               value={formData.emp_ethnicity}
//                               onChange={handleChange}
//                               required
//                               error={(formData.emp_ethnicity || "").trim() === ""}
//                               helperText={
//                                 (formData.emp_ethnicity || "").trim() === "" ? "Required field" : ""
//                               }
//                             >
//                               {ethnicity.map((e) => (
//                                 <StyledMenuItem key={e.value} value={e.value}>
//                                   {e.text}
//                                 </StyledMenuItem>
//                               ))}
//                             </StyledSelect>
//                           </StyledFormControl>
//                         </Grid>
//                         <Grid item xs={12} lg={6} mt={2}>
//                           <StyledFormControl fullWidth>
//                             <MDTypography variant="body2">
//                               {lang.msg("field.nationality")}
//                             </MDTypography>
//                             <StyledSelect
//                               name="emp_nationality"
//                               value={formData.emp_nationality}
//                               onChange={handleChange}
//                               required
//                               error={(formData.emp_nationality || "").trim() === ""}
//                               helperText={
//                                 (formData.emp_nationality || "").trim() === ""
//                                   ? "Required field"
//                                   : ""
//                               }
//                             >
//                               {nationalities.map((n) => (
//                                 <StyledMenuItem key={n.value} value={n.value}>
//                                   {n.text}
//                                 </StyledMenuItem>
//                               ))}
//                             </StyledSelect>
//                           </StyledFormControl>
//                         </Grid>

//                         <Grid item xs={12} lg={6}>
//                           <StyledFormControl fullWidth>
//                             <MDTypography variant="body2">
//                               {lang.msg("field.religion")}
//                             </MDTypography>
//                             <StyledSelect
//                               name="emp_religion"
//                               value={formData.emp_religion}
//                               onChange={handleChange}
//                               required
//                               error={(formData.emp_religion || "").trim() === ""}
//                               helperText={
//                                 (formData.emp_religion || "").trim() === "" ? "Required field" : ""
//                               }
//                             >
//                               {religions.map((r) => (
//                                 <StyledMenuItem key={r.value} value={r.value}>
//                                   {r.text}
//                                 </StyledMenuItem>
//                               ))}
//                             </StyledSelect>
//                           </StyledFormControl>
//                           <Box mt={4} />
//                           <StyledFormControl fullWidth>
//                             <MDTypography variant="body2">
//                               {lang.msg("employee.blood_group")}
//                             </MDTypography>
//                             <StyledSelect
//                               name="emp_blood_group"
//                               value={formData.emp_blood_group}
//                               onChange={handleChange}
//                               required
//                               error={(formData.emp_blood_group || "").trim() === ""}
//                               helperText={
//                                 (formData.emp_blood_group || "").trim() === ""
//                                   ? "Required field"
//                                   : ""
//                               }
//                             >
//                               {bloodGroups.map((b) => (
//                                 <StyledMenuItem key={b.value} value={b.value}>
//                                   {b.text}
//                                 </StyledMenuItem>
//                               ))}
//                             </StyledSelect>
//                           </StyledFormControl>
//                         </Grid>
//                         <Grid item xs={12} lg={6}>
//                           {mode === "create" ? (
//                             <UploadPic
//                               name="emp_sign"
//                               onImageChange={handleImageChange}
//                               apiImage={
//                                 formData.emp_sign ? URL.createObjectURL(formData.emp_sign) : null
//                               }
//                               resetImage={!formData.emp_sign}
//                               label={lang.msg("employee.employee_photo")}
//                             />
//                           ) : (
//                             <UploadPic
//                               name="emp_sign"
//                               onImageChange={handleImageChange}
//                               apiImage={
//                                 formData.emp_sign instanceof File ||
//                                 formData.emp_sign instanceof Blob
//                                   ? URL.createObjectURL(formData.emp_sign) // หากเป็นไฟล์ที่เพิ่งอัปโหลด
//                                   : formData.emp_sign_img_url // หากเป็น URL ที่ได้รับจากฐานข้อมูล
//                                   ? BaseClass.buildFileUrl(formData.emp_sign_img_url) // สร้าง URL จากเซิร์ฟเวอร์
//                                   : null
//                               }
//                               resetImage={!formData.emp_sign && !formData.emp_sign_img_url} // ล้างรูปภาพหากไม่มีข้อมูล
//                               label={lang.msg("employee.employee_photo")}
//                             />
//                           )}
//                         </Grid>
//                       </Grid>
//                     </MDBox>
//                   </Card>
//                 </Grid>

//                 {isModalOpen && (
//                   <SweetAlert
//                     title={modalMessage}
//                     success
//                     confirmBtnText="ตกลง"
//                     confirmBtnStyle={{
//                       backgroundColor: "#007bff",
//                       color: "white",
//                       borderRadius: "5px",
//                       padding: "10px 20px",
//                       fontSize: "18px",
//                     }}
//                     onConfirm={closeModal}
//                     onCancel={() => setIsModalOpen(false)}
//                     focusCancelBtn
//                   >
//                     {/* Add any additional text or content if needed */}
//                   </SweetAlert>
//                 )}
//                 {/* Submit Button */}
//                 <Grid item xs={12}>
//                   {/* <Box mt={2} display="flex" justifyContent="center" gap={3}>
//                     <MDButton type="submit" color="primary" startIcon={<SaveOutlinedIcon />}>
//                       {lang.btnSave()}
//                     </MDButton>
//                     <MDButton
//                       variant="outlined"
//                       color="secondary"
//                       onClick={close}
//                       startIcon={<ClearOutlinedIcon />}
//                     >
//                       {lang.btnCancel()}
//                     </MDButton>
//                   </Box> */}
//                   <MDBox display="flex" justifyContent="center" gap={2} mt={3}>
//                     <ButtonComponent type="saveIcon" onClick={handleSubmit}/> {/* ปุ่มบันทึก */}
//                     <ButtonComponent type="cancelIcon" onClick={close} /> {/* ปุ่มยกเลิก */}
//                   </MDBox>
//                 </Grid>
//               </Grid>
//             </form>
//           </Box>
//         </Box>
//       </MDBox>
//     </DashboardLayout>
//   );
// };

// export default Editemployee;

