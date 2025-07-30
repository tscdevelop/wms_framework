// import React from "react";
// import { Box, Button, Modal } from "@mui/material";
// import MDTypography from "components/MDTypography";
// import { Document } from "common/dataMain";

// const modalStyle = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 400,
//   bgcolor: "background.paper",
//   boxShadow: 24,
//   p: 4,
//   borderRadius: "10px",
//   textAlign: "center",
// };

// const ModalComponent = ({ open, onClose, onConfirm }) => {
//   const handleSelectChange = (e) => {
//     const selectedValue = e.target.value;

//     if (onConfirm && selectedValue) {
//       onConfirm(selectedValue); // ส่งค่าที่เลือกกลับไปยังฟังก์ชันที่กำหนดใน props
//     }
//   };

//   return (
//     <Modal open={open} onClose={onClose}>
//       <Box sx={modalStyle}>
//         <MDTypography variant="h6" component="h2">
//           เลือกเอกสารที่ต้องการพิมพ์
//         </MDTypography>
//         <MDTypography sx={{ mt: 2, mb: 3 }}>
//           <select
//             style={{
//               width: "100%",
//               padding: "10px",
//               borderRadius: "5px",
//               border: "1px solid #ccc",
//             }}
//             onChange={handleSelectChange}
//             defaultValue="" // ตั้งค่า default เป็นค่าว่าง
//           >
//             <option value="" disabled>
//               กรุณาเลือกเอกสาร
//             </option>
//             {Document.map((doc, index) => (
//               <option key={index} value={doc.value}>
//                 {doc.text}
//               </option>
//             ))}
//           </select>
//         </MDTypography>
//         <Box display="flex" justifyContent="center" gap={2}>
//           <Button
//             variant="outlined"
//             color="error"
//             onClick={onClose}
//             style={{ padding: "5px 20px" }}
//           >
//             ยกเลิก
//           </Button>
//         </Box>
//       </Box>
//     </Modal>
//   );
// };

// export default ModalComponent;




// import React, { useState } from "react";
// import { Box, Button, Modal } from "@mui/material";
// import MDTypography from "components/MDTypography";
// import { Document } from "common/dataMain";
// import MDButton from "components/MDButton";

// const modalStyle = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 400,
//   bgcolor: "background.paper",
//   boxShadow: 24,
//   p: 4,
//   borderRadius: "10px",
//   textAlign: "center",
// };

// const selectStyle = {
//   width: "100%",
//   padding: "10px",
//   borderRadius: "5px",
//   border: "1px solid #ccc",
//   marginBottom: "20px",
// };

// const ModalComponent = ({ open, onClose, onConfirm }) => {
//   const [selectedValue, setSelectedValue] = useState(""); // เก็บค่าที่เลือกจาก dropdown

//   const handleSelectChange = (e) => {
//     setSelectedValue(e.target.value); // อัปเดตค่าที่เลือก
//   };

//   const handleConfirmClick = () => {
//     if (onConfirm && selectedValue) {
//       onConfirm(selectedValue); // ส่งค่าที่เลือกกลับไปยังฟังก์ชันที่กำหนดใน props
//     }
//   };

//   return (
//     <Modal open={open} onClose={onClose}>
//       <Box sx={modalStyle}>
//         <MDTypography variant="h6" component="h2">
//           เลือกเอกสารที่ต้องการพิมพ์
//         </MDTypography>
//         <MDTypography sx={{ mt: 2, mb: 3 }}>
//           <select
//             style={selectStyle}
//             onChange={handleSelectChange}
//             value={selectedValue} // ตั้งค่าที่เลือกจาก state
//           >
//             <option value="" disabled>
//               เลือกเอกสารที่ต้องการ
//             </option>
//             {Document.map((doc, index) => (
//               <option key={index} value={doc.value}>
//                 {doc.text}
//               </option>
//             ))}
//           </select>
//         </MDTypography>
//         <Box display="flex" justifyContent="center" gap={2}>
//           <MDButton
//             variant="outlined"
//             color="error"
//             onClick={onClose}
//             style={{ padding: "5px 20px" }}
//           >
//             ยกเลิก
//           </MDButton>
//           <MDButton
//             variant="contained"
//             color="success"
//             onClick={handleConfirmClick}
//             style={{ padding: "5px 20px" }}
//             disabled={!selectedValue} // ปิดปุ่ม "ยืนยัน" หากยังไม่ได้เลือกค่า
//           >
//             ยืนยัน
//           </MDButton>
//         </Box>
//       </Box>
//     </Modal>
//   );
// };

// export default ModalComponent;





import React, { useState } from "react";
import { Box, Modal } from "@mui/material";
import MDTypography from "components/MDTypography";
import { Document } from "common/dataMain";
import MDButton from "components/MDButton";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
  textAlign: "center",
};

const selectStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  marginBottom: "20px",
};

const ModalComponent = ({ open, onClose, onConfirm }) => {
  const [selectedValue, setSelectedValue] = useState(""); // เก็บค่าที่เลือกจาก dropdown

  const handleSelectChange = (e) => {
    setSelectedValue(e.target.value); // อัปเดตค่าที่เลือก
  };

  const handleConfirmClick = () => {
    if (onConfirm && selectedValue) {
      onConfirm(selectedValue); // ส่งค่าที่เลือกกลับไปยังฟังก์ชันที่กำหนดใน props
    }
  };

  const handleClose = () => {
    setSelectedValue(""); // ล้างค่าที่เลือก
    if (onClose) {
      onClose(); // ปิด Modal
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <MDTypography variant="h6" component="h2">
          เลือกเอกสารที่ต้องการพิมพ์
        </MDTypography>
        <MDTypography sx={{ mt: 2, mb: 3 }}>
          <select
            style={selectStyle}
            onChange={handleSelectChange}
            value={selectedValue} // ตั้งค่าที่เลือกจาก state
          >
            <option value="" disabled>
              เลือกเอกสารที่ต้องการ
            </option>
            {Document.map((doc, index) => (
              <option key={index} value={doc.value}>
                {doc.text}
              </option>
            ))}
          </select>
        </MDTypography>
        <Box display="flex" justifyContent="center" gap={2}>
          <MDButton
            variant="outlined"
            color="error"
            onClick={handleClose} // เรียกฟังก์ชัน handleClose
            style={{ padding: "5px 20px" }}
          >
            ยกเลิก
          </MDButton>
          <MDButton
            variant="contained"
            color="success"
            onClick={handleConfirmClick}
            style={{ padding: "5px 20px" }}
            disabled={!selectedValue} // ปิดปุ่ม "ยืนยัน" หากยังไม่ได้เลือกค่า
          >
            ยืนยัน
          </MDButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalComponent;
