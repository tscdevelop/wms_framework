import React, { useEffect, useState, useRef } from "react";
import { Modal, Box, Typography,  Table, TableBody, TableCell, TableRow } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InBoundFGAPI from "api/InBoundFgAPI"; // Import API
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react"; // Import QRCodeCanvas
import ButtonComponent from "./ButtonComponent";
const PrintBarCodeFgModal = ({ open, onClose, inbfg_id }) => {
  const [labelData, setLabelData] = useState(null); // ข้อมูล Label
  const [isPrinting, setIsPrinting] = useState(false);
  const pdfRef = useRef();

  const generatePDF = async () => {
    if (!pdfRef.current) {
      console.error("PDF container is not found.");
      return;
    }
  
    setIsPrinting(true); // ตั้งสถานะเป็นกำลังพิมพ์
  
    setTimeout(async () => {
      try {
        const originalStyle = pdfRef.current.style.cssText;
  
        // ปรับขนาดของ Container ให้ตรงกับ modalStyle
        pdfRef.current.style.width = "1000px";
        pdfRef.current.style.maxWidth = "100%";
        pdfRef.current.style.height = "auto";
        pdfRef.current.style.overflow = "visible";
  
        // สร้าง Canvas ด้วย html2canvas
        const canvas = await html2canvas(pdfRef.current, {
          useCORS: true,
          scale: 2, // เพิ่มความละเอียดของภาพ
        });
  
        // คืนค่าขนาดเดิมของ Container
        pdfRef.current.style.cssText = originalStyle;
  
        // กำหนดขนาดของ PDF ให้คงอัตราส่วน
        // const pdfWidth = 210; // A4 ขนาดกว้างในหน่วย mm
        // const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const imgData = canvas.toDataURL("image/png");
  
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });
  
        const margin = 10; // เพิ่มระยะขอบ
        const contentWidth = pdf.internal.pageSize.getWidth() - margin * 2;
        const contentHeight = (canvas.height * contentWidth) / canvas.width;
  
        const imageWidth = contentWidth * 0.6;
        const imageHeight = contentHeight * 0.6;
  
        pdf.addImage(imgData, "PNG", margin, margin, imageWidth, imageHeight);
        pdf.save("document.pdf");
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setIsPrinting(false); // คืนสถานะหลังจากสร้าง PDF เสร็จ
      }
    }, 0);
  };

  // ฟังก์ชันสำหรับดึงข้อมูล Label
  const fetchLabelData = async () => {
    try {
      const response = await InBoundFGAPI.getInBoundFgByID(inbfg_id);
      if (response.isCompleted) {
        setLabelData(response.data);
      } else {
        console.error("Failed to fetch label data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching label data:", error);
    }
  };

  const handleClose = () => {
    onClose();
    setLabelData(null);
  };

  // ดึงข้อมูลเมื่อ Modal เปิด
  useEffect(() => {
    if (open && inbfg_id) {
      fetchLabelData();
    }
  }, [open, inbfg_id]);

  // สร้างข้อมูล JSON สำหรับ QR Code จาก labelData
  const qrData = labelData
    ? JSON.stringify({
        code: labelData.inbfg_code || "-",
        name: labelData.fgifm_name || "-",
        factory: labelData.fty_name || "-",
        warehouse: labelData.wh_name || "-",
        zone: labelData.zn_name || "-",
        location: labelData.loc_name || "-"
      })
    : "";

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 8,
          maxWidth: "95vw", // ✅ จำกัดไม่ให้กว้างเกินหน้าจอ
          maxHeight: "95vh", // ✅ ป้องกันสูงเกินจอ
          overflow: "auto",  // ✅ เพิ่ม scroll ถ้าสูงเกิน
        }}
        ref={pdfRef}
      >
        {!isPrinting && ( 
          <>
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
              <CloseIcon onClick={handleClose} sx={{ cursor: "pointer" }} />
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
              <Typography variant="h3" fontWeight="bold">
                Print Label
              </Typography>
            </Box>
          </>    
        )}

        {/* ข้อมูล Label */}
        {labelData ? (
          <Box
            sx={{
              display: "flex",
              border: "2px solid black", // เส้นขอบสีดำ
              borderRadius: 2,
              padding: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 300,
                mb: 2,
                padding: 2,
              }}
            >
              {/* แสดง QR Code ที่สร้างจาก JSON */}
              {qrData ? (
                <QRCodeCanvas value={qrData} size={200} />
              ) : (
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  กำลังโหลด QR Code...
                </Typography>
              )}
            </Box>

            <Box sx={{ padding: 2 }}>
              <Table
                sx={{
                  width: "100%", // ให้ตารางขยายเต็มพื้นที่
                  "& .MuiTableCell-root": {
                    border: "2px solid gray", // เส้นขอบสีเทา
                    padding: "10px", // เพิ่ม padding ให้เซลล์
                    fontSize: "22px",
                  },
                }}
              >
                <TableBody>
                  <TableRow>
                    <TableCell align="left" sx={{ backgroundColor: "#F8D7A7", fontWeight: "bold", width: "200px" }}>
                      รหัส
                    </TableCell>
                    <TableCell align="left" sx={{ width: "300px" }}>
                      {labelData.inbfg_code || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ backgroundColor: "#F8D7A7", fontWeight: "bold", width: "200px" }}>
                      ชื่อ
                    </TableCell>
                    <TableCell align="left" sx={{ width: "300px" }}>
                      {labelData.fgifm_name || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ backgroundColor: "#F8D7A7", fontWeight: "bold", width: "200px" }}>
                      โรงงาน
                    </TableCell>
                    <TableCell align="left" sx={{ width: "300px" }}>
                      {labelData.fty_name || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ backgroundColor: "#F8D7A7", fontWeight: "bold", width: "200px" }}>
                      คลัง
                    </TableCell>
                    <TableCell align="left" sx={{ width: "300px" }}>
                      {labelData.wh_name || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ backgroundColor: "#F8D7A7", fontWeight: "bold", width: "200px" }}>
                      Zone
                    </TableCell>
                    <TableCell align="left" sx={{ width: "300px" }}>
                      {labelData.zn_name || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left" sx={{ backgroundColor: "#F8D7A7", fontWeight: "bold", width: "200px" }}>
                      Location
                    </TableCell>
                    <TableCell align="left" sx={{ width: "300px" }}>
                      {labelData.loc_name || "-"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary" textAlign="center">
            กำลังโหลดข้อมูล...
          </Typography>
        )}

        {!isPrinting && ( 
          <Box mt={3} display="flex" justifyContent="center">
            <ButtonComponent
              type="print"
              onClick={generatePDF}
              sx={{ width: "100px", textAlign: "center" }}
            />
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default PrintBarCodeFgModal;
