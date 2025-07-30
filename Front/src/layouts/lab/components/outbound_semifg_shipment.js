import React, { useRef, useState, useEffect } from "react";
import MDTypography from "components/MDTypography";
import { Box, Modal, IconButton } from "@mui/material";
import ButtonComponent from "./ButtonComponent";
import CloseIcon from "@mui/icons-material/Close";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import OutBoundSemiFGAPI from "api/OutBoundSemiFGAPI";

// สไตล์ Modal
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "1000px",
  maxWidth: "100%",
  maxHeight: "90vh",        // ✅ จำกัดความสูงสูงสุด
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
  textAlign: "center",
  overflowY: "auto",        // ✅ scroll แนวตั้งเมื่อเนื้อหาเกิน
  overflowX: "hidden",      // ✅ ซ่อน scroll แนวนอน
};

// กล่องมีขอบ (เส้นกรอบ)
const borderedContainerStyle = {
  border: "1px solid #999",
  borderRadius: "10px",
  padding: "20px",
  margin: "20px 0",
  backgroundColor: "#FFE4E1", // ตัวอย่างสีชมพูอ่อน (MistyRose)
};

// สไตล์ตาราง
const tableStyle = {
  borderCollapse: "collapse",
  width: "100%",
};

// ตรงนี้คือเฉพาะส่วนหัวคอลัมน์ที่เปลี่ยนสี
const thStyle = {
  border: "1px solid #000",
  padding: "8px",
  backgroundColor: "#FFC0CB", // เลือกชมพูเข้มขึ้นจากพื้นหลัง
  fontWeight: "bold",
  textAlign: "center",
  fontSize: "0.9rem",
};

// สไตล์ช่องตาราง
const tdStyle = {
  border: "1px solid #000",
  padding: "8px",
  textAlign: "center",
  fontSize: "0.85rem",
};

// สไตล์การจัดกลุ่มหัวฟอร์ม (บนสุด)
const headerCellStyle = {
  padding: "4px 8px",
  fontSize: "14px",
};

// narrowThStyle / wideTdStyle ถ้ายังใช้ #ddd ก็เปลี่ยนเป็น #000 ได้เหมือนกัน
const narrowThStyle = {
  border: "1px solid #000",
  padding: "4px",
  backgroundColor: "#FFC0CB", // ถ้าต้องการหัวข้อชมพูเหมือนกัน
  fontWeight: "bold",
  textAlign: "left",
  fontSize: "0.9rem",
  whiteSpace: "nowrap",
  width: "100px",
};

const wideTdStyle = {
  border: "1px solid #000",
  padding: "4px",
  textAlign: "left",
  fontSize: "0.85rem",
  width: "auto",
};



const PrintSemiShipComponent = ({ open, onClose, data, outbsemi_id, outbsemi_is_returned }) => {
  // ถ้าค่าที่ส่งมาบอกว่า returned ไม่ต้องแสดง
  if (outbsemi_is_returned !== 0) return null;

  const [isPrinting, setIsPrinting] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const pdfRef = useRef();

  // ดึงข้อมูลจาก API ถ้าไม่มี data แต่มี id
  useEffect(() => {
    if (!data && outbsemi_id) {
      const fetchData = async () => {
        try {
          const response = await OutBoundSemiFGAPI.getOutBoundSemiReqByID(outbsemi_id);
          if (response?.data) {
            setFetchedData(response.data);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
  }, [data, outbsemi_id]);

  // เลือกใช้ข้อมูลจาก props หรือ fetchedData
  const displayData = data || fetchedData;
  if (!displayData) return null;

  // ดึงข้อมูลจาก displayData
  const {
    outbsemi_code = "-",          // จะใช้เป็น JOB No.     // จะใช้เป็น S/O No.
    outbsemi_vehicle_license = "-", // จะใช้เป็น ทะเบียนรถ
    today_date = "-",
    outbsemi_driver_name = "-",
    outbsemi_so,
    today_date_time,
    items = [],
  } = displayData;

  // ฟังก์ชันสร้าง PDF
  const generatePDF = async () => {
    if (!pdfRef.current) return;
    setIsPrinting(true);
    try {
      // สมมติว่า data มีฟิลด์ outbfg_id อยู่
      if (displayData.outbsemi_id) {
        const payload = { shipmt_date: today_date_time };
        await OutBoundSemiFGAPI.updateOutbDateSemi(displayData.outbsemi_id, payload);
        console.log("Updated shipmt_date successfully");
      }
    } catch (error) {
      console.error("Error updating shipmt_date:", error);
    }

    setTimeout(async () => {
      try {
        const originalStyle = pdfRef.current.style.cssText;
        pdfRef.current.style.width = "900px";
        pdfRef.current.style.maxWidth = "100%";
        pdfRef.current.style.height = "auto";
        pdfRef.current.style.overflow = "visible";
  
        const canvas = await html2canvas(pdfRef.current, {
          useCORS: true,
          scale: 2, // ยังคง scale สูงเพื่อความคมชัด
        });
  
        pdfRef.current.style.cssText = originalStyle;
  
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });
  
        const pageWidth = pdf.internal.pageSize.getWidth();   // 210 mm
        const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm
  
        const imgData = canvas.toDataURL("image/png");
  
        // อัตราส่วนภาพ (กว้าง/สูง)
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
  
        // ตั้ง Margin ที่ต้องการ (เช่น 15 mm รอบด้าน)
        const margin = 15;
        const usableWidth = pageWidth - margin * 2;   // 210 - 30 = 180 mm
        const usableHeight = pageHeight - margin * 2; // 297 - 30 = 267 mm
  
        // เริ่ม fit ตามความกว้าง usableWidth
        let printWidth = usableWidth;
        let printHeight = printWidth / ratio;
  
        // ถ้าสูงเกิน usableHeight ให้ fit ตามความสูงแทน
        if (printHeight > usableHeight) {
          printHeight = usableHeight;
          printWidth = printHeight * ratio;
        }
  
        // ใส่รูปลงใน PDF โดยเลื่อนไป margin, margin
        pdf.addImage(imgData, "PNG", margin, margin, printWidth, printHeight);
        pdf.save("document.pdf");
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setIsPrinting(false);
      }
    }, 0);
  };
  
  

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Container สำหรับจับภาพ (html2canvas) */}
        <Box ref={pdfRef}>
          {/* Header (Title + Close Button) */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box />
            {!isPrinting && (
              <>
                <MDTypography variant="h4" fontWeight="bold">
                  พิมพ์ใบนำส่ง
                </MDTypography>
                <IconButton onClick={onClose} sx={{ color: "black" }}>
                  <CloseIcon />
                </IconButton>
              </>
            )}
          </Box>

          <div style={borderedContainerStyle}>
            {/* ===== ส่วนหัวแบบรูปตัวอย่าง (ชื่อบริษัท / โลโก้ / ชื่อเอกสาร) ===== */}
          
              {/* ชื่อเอกสารตรงกลาง */}
              <Box sx={{ textAlign: "center" }}>
                <table style={{ ...tableStyle, marginBottom: "0" }}>
                  <tbody>
                    <tr>
                      <td style={{ ...headerCellStyle, textAlign: "center", border: "none" }}>
                        <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                          บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด
                        </div>
                        <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                          LPI-RR CO.,LTD.
                        </div>
                        <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                          ใบเบิกนำส่งวัถตุดิบ/ชิ้นส่วน/วัสดุออกไปภายนอก
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Box>

             
           

            {/* ===== ตารางข้อมูลส่วนบน (JOB No, S/O No, ทะเบียนรถ ฯลฯ) ===== */}
            {/* ตั้งค่า marginBottom = 0 เพื่อไม่เว้นระยะห่าง */}
            <Box sx={{ mt: 2, mb: 0 }}>
              <table style={tableStyle}>
                <tbody>
                  <tr>
                    <th style={thStyle}>JOB No.</th>
                    <td style={tdStyle}>{outbsemi_code|| "-"}</td>
                    <th style={thStyle}>ทะเบียนรถ</th>
                    <td style={tdStyle}>{outbsemi_vehicle_license|| "-"}</td>
                    <th style={thStyle}>เลขที่ INV.</th>
                    <td style={tdStyle}>-</td>
                  </tr>
                  <tr>
                    <th style={thStyle}>SO/DO No.</th>
                    <td style={tdStyle}>{outbsemi_so||"-"}</td>
                    <th style={thStyle}>ชื่อคนขับรถ</th>
                    <td style={tdStyle}>{outbsemi_driver_name|| "-"}</td>
                    <th style={thStyle}>วันที่</th>
                    <td style={tdStyle}>{today_date|| "-"}</td>
                  </tr>
                </tbody>
              </table>
            </Box>

            {/* ===== ตาราง "ชื่อลูกค้า" และ "ประเภท" ชิดติดกัน ===== */}
            <Box sx={{ mb: 0 }}>
              <table style={tableStyle}>
                <tbody>
                  <tr>
                    <th style={narrowThStyle}>ชื่อลูกค้า</th>
                    <td style={wideTdStyle}></td>
                  </tr>
                  <tr>
                    <th style={narrowThStyle}>ประเภท</th>
                    <td style={wideTdStyle}></td>
                  </tr>
                </tbody>
              </table>
            </Box>

            {/* ===== ตารางรายการสินค้า (ติดกัน ไม่เว้นระยะ) ===== */}
            <table style={{ ...tableStyle, marginTop: "0" }}>
              <thead>
                <tr>
                  <th style={thStyle}>ลำดับที่</th>
                  <th style={thStyle}>รายการ(DESCRIPTION)</th>
                  <th style={thStyle}>ขนาด(SIZE)</th>
                  <th style={thStyle}>สี(COLOUR)</th>
                  <th style={thStyle}>จำนวน</th>
                  <th style={thStyle}>หน่วย</th>
                  <th style={thStyle}>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const sizeString = `${item.semiifm_width || "-"} x ${
                    item.semiifm_length || "-"
                  } x ${item.semiifm_thickness || "-"}`;

                  return (
                    <tr key={index}>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>{item.semiifm_name || "-"}</td>
                      <td style={tdStyle}>{sizeString}</td>
                      <td style={tdStyle}>{item.inbsemi_color || "-"}</td>
                      <td style={tdStyle}>{item.outbsemiitm_quantity || "-"}</td>
                      <td style={tdStyle}>{item.unit_abbr_th || "-"}</td>
                      <td style={tdStyle}></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>


            {/* ===== ส่วนล่าง (ลายเซ็น) ต่อจากตารางรายการสินค้า ===== */}
            <Box sx={{ mt: 0 }}>
  <table style={tableStyle}>
    <tbody>
      <tr>
        {/* คอลัมน์ซ้าย */}
        <td style={{ ...tdStyle, height: "60px", verticalAlign: "top" }}>
          {/* ผู้จัดทำเอกสาร */}
          <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
            <div>ผู้จัดทำเอกสาร :</div>
          </Box>
          <div style={{ marginBottom: "10px" }}>
            ..............................................
          </div>

          {/* วันที่ */}
          <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ minWidth: "50px" }}>วันที่:</div>
            <div>...........................................</div>
          </Box>

          {/* ผู้รับสินค้า/เอกสารต้นทาง */}
          <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
            <div>ผู้รับสินค้า/เอกสารต้นทาง :</div>
          </Box>
          <div style={{ marginBottom: "10px" }}>
            ..............................................
          </div>

          {/* วันที่ */}
          <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <div style={{ minWidth: "50px" }}>วันที่:</div>
            <div>...........................................</div>
          </Box>
        </td>

        {/* คอลัมน์ขวา */}
        <td style={{ ...tdStyle, height: "60px", verticalAlign: "top" }}>
          {/* ผู้อนุมัติ */}
          <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
            <div>ผู้อนุมัติ :</div>
          </Box>
          <div style={{ marginBottom: "10px" }}>
            ..............................................
          </div>

          {/* วันที่ */}
          <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ minWidth: "50px" }}>วันที่:</div>
            <div>...........................................</div>
          </Box>

          {/* พนักงานรักษาความปลอดภัย */}
          <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
            <div>พนักงานรักษาความปลอดภัย :</div>
          </Box>
          <div style={{ marginBottom: "10px" }}>
            ..............................................
          </div>

          {/* วันที่ */}
          <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <div style={{ minWidth: "50px" }}>วันที่:</div>
            <div>...........................................</div>
          </Box>
        </td>
      </tr>
    </tbody>
  </table>

  {/* ส่วนข้อความด้านล่าง */}
  <Box 
    sx={{ 
      marginTop: "10px", 
      fontSize: "12px", 
      fontWeight: "bold", 
      display: "flex", 
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >
    {/* ข้อความฝั่งซ้าย */}
    <div style={{ textAlign: "left", whiteSpace: "nowrap" }}>
      ต้นฉบับ = คลังวัตถุดิบ, สำเนาที่ 2 = ให้ลูกค้า, สำเนาที่ 3 = พนักงานรักษาความปลอดภัย
    </div>

    {/* ข้อความตรงกลาง */}
    <div style={{ textAlign: "center", flex: 1 }}>
      F-WH-06
    </div>

    {/* ข้อความฝั่งขวา */}
    <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
      Rev. 01
    </div>
  </Box>
</Box>



          </div>

          {/* ปุ่ม Print (อยู่นอก pdfRef) */}
          {!isPrinting && (
            <Box mt={3} display="flex" justifyContent="center" textAlign="center">
              <ButtonComponent  type="print" onClick={generatePDF}/>

            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default PrintSemiShipComponent;
