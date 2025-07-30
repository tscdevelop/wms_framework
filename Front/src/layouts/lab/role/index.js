import React, { useState, useEffect } from "react"; // นำเข้า useState และ useEffect จาก React
import { Card } from "@mui/material"; // นำเข้า components จาก MUI (Material-UI)
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; // นำเข้า layout component
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // นำเข้า navbar component
import MDBox from "components/MDBox";
import { useNavigate } from "react-router-dom"; // นำเข้า Link และ useNavigate สำหรับการจัดการ routing
import TableComponent from "../components/table_component";
import MDTypography from "components/MDTypography";
import EmployeeAPI from "api/EmployeeAPI";
import { GlobalVar } from "../../../common/GlobalVar";

const Role = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [roleAll ,setRoleAll] = useState([]);
  const [role, setRole] = useState("");
  const navigate = useNavigate();


   useEffect(() => {
        const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
        setRole(userRole);
      }, []);


  const fetchDataAll = async () => {
    try {
      const response = await EmployeeAPI.searchEmployeesAll();
      console.log("factory All:", response);

      if (response?.isCompleted) {
        const data = response?.data || []; // ดึงข้อมูล data หากมี
        setRoleAll(data); // อัปเดต state
      } else {
        console.error("API response error: ", response?.message);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };
  
 useEffect(() =>{
    fetchDataAll();
  },[]);


  const handleEditClick = (role_code, emp_name) => {
    navigate(`/role-edit?role_code=${role_code}&emp_name=${emp_name}`); // นำทางไปยังหน้า Editlabform พร้อมส่ง emp_name
  };
  
  const handleFactoryClick = (role_code, emp_name,user_id) => {
    navigate(`/rolefactory?role_code=${role_code}&emp_name=${emp_name}&user_id=${user_id}`); // นำทางไปยังหน้า Editlabform พร้อมส่ง emp_name
  };

  return(
    <DashboardLayout>
      <DashboardNavbar/>
      <MDBox p={2}>
        <MDBox mt ={2} ml={5}>
          <MDTypography variant="h3" color="inherit" fontWeight="bold">
              ตั้งค่า / สิทธิ์การเข้าใช้งานเเละการเเสดงผลเมนู
          </MDTypography>
        </MDBox>
      </MDBox>
    
      <MDBox mt={5}>
        <Card>
          <MDBox mt={3} p={3}>
            <TableComponent
              columns={[
                { field: "emp_code", label: "รหัส", width: "30%" },
                { field: "emp_name", label: "ชื่อ-นานสกุล", width: "30%" },
                { field: "role_code", label: "ตำเเหน่ง", width: "30%" },
              ]}       
              data={roleAll}
              idField="role_code"
              codeField="emp_name"
              userField="user_id"
              onEdit={handleEditClick}
              onSettings={handleFactoryClick}
              userRole={role}
              hiddenActions={["delete","print","barcode"]}
            />
          </MDBox>
        </Card>
      </MDBox>
    
    </DashboardLayout>
    );



};
export default Role;