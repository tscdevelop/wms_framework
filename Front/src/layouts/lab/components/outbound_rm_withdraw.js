
import React, { useRef, useState, useEffect } from "react";
import MDTypography from "components/MDTypography";
import { Box, Modal, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import OutBoundRawAPI from "api/OutBoundRawAPI";
import ButtonComponent from "./ButtonComponent";
// สไตล์ Modal (ตำแหน่ง/ขนาดพื้นฐาน)
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

// สไตล์หลักของหน้าใบเสร็จ (ให้มีพื้นหลังสีเขียวอ่อน ๆ คล้ายฟอร์ม)
const formContainerStyle = {
  width: "100%",
  backgroundColor: "#ecf9ec", // เขียวอ่อนหรือปรับตามชอบ (#ecf9ec, #e3fbe3, ฯลฯ)
  color: "#000",
  padding: "20px",
  fontFamily: "THSarabunNew, Arial, sans-serif", // หรือฟอนต์อื่น
  fontSize: "14px",
  position: "relative",
  margin: "0 auto",
  border: "1px solid #999",
  borderRadius: "10px",
};

// ตารางหลัก (หัวฟอร์ม + รายละเอียด)
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: "10px",
};

// สไตล์หัวตาราง
const thStyle = {
  border: "1px solid #000",
  padding: "5px",
  backgroundColor: "#e6ffe6",
  textAlign: "center",
  fontWeight: "bold",
};

// สไตล์ช่องตาราง
const tdStyle = {
  border: "1px solid #000",
  padding: "5px",
  textAlign: "left",
};

// สไตล์ช่องตาราง (จัดกลาง)
const tdCenterStyle = {
  ...tdStyle,
  textAlign: "center",
};

// สไตล์การจัดกลุ่มหัวฟอร์ม (บนสุด)
const headerCellStyle = {
  padding: "4px 8px",
  fontSize: "14px",
};

const PrintRmBillComponent = ({ open, onClose, data, outbrm_id }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [fetchedData, setFetchedData] = useState(null); // ใช้สำหรับจัดเก็บข้อมูลที่ดึงจาก API
  const pdfRef = useRef();

  useEffect(() => {
    if (!data && outbrm_id) {
      const fetchData = async () => {
        try {
          const response = await OutBoundRawAPI.getOutBoundRawReqByID(outbrm_id);
          if (response?.data) {
            setFetchedData(response.data); // เซ็ตข้อมูลจาก API
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
  }, [data, outbrm_id]);

  // เลือกแหล่งข้อมูลที่ต้องใช้ (data หรือ fetchedData)
  const displayData = data || fetchedData;
  if (!displayData) return null;

  // แยกข้อมูลสำหรับการแสดงผล
  const {
    today_date,
    today_date_time,
    items,
  } = displayData;

  const generatePDF = async () => {
    if (!pdfRef.current) {
      console.error("PDF container is not found.");
      return;
    }
    setIsPrinting(true); // ตั้งสถานะเป็นกำลังพิมพ์

    try {
      // อัปเดตวันที่ในระบบ (ตามโค้ดเดิม)
      const id = displayData.outbrm_id || outbrm_id;
      if (id) {
        const payload = { withdr_date: today_date_time };
        await OutBoundRawAPI.updateOutbDateRaw(id, payload);
        console.log("Updated shipmt_date successfully");
      } else {
        console.warn("No outbrm_id found in displayData or props");
      }
    } catch (error) {
      console.error("Error updating shipmt_date:", error);
    }

    setTimeout(async () => {
      try {
        const originalStyle = pdfRef.current.style.cssText;
        // ปรับขนาดของ Container ชั่วคราวให้พอดีสำหรับจับภาพ
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
       
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const margin = 10; // ขอบกระดาษ
        const contentWidth = pdf.internal.pageSize.getWidth() - margin * 2;
        const contentHeight = (canvas.height * contentWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", margin, margin, contentWidth, contentHeight);
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
        {/* ส่วนที่จะถูกแปลงเป็น PDF */}
        <Box ref={pdfRef} style={formContainerStyle}>
          {/* Header Row (Title + Close Button) */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box />
            {!isPrinting && (
              <>
                <MDTypography variant="h4" fontWeight="bold">
                  พิมพ์ใบเบิก Raw Material
                </MDTypography>
                <IconButton onClick={onClose} sx={{ color: "black" }}>
                  <CloseIcon />
                </IconButton>
              </>
            )}
          </Box>

          {/* ===================== หัวฟอร์มบริษัท / ชื่อฟอร์ม ===================== */}
          <table style={{ ...tableStyle, marginBottom: "20px" }}>
            <tbody>
              <tr>
                <td style={{ ...headerCellStyle, textAlign: "center", border: "none" }}>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    บริษัท แอลพีไอ แร็คเร็นจ์ (ประเทศไทย) จำกัด
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    LPI RACK-RANGE (THAILAND) CORP., LTD.
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    ใบเบิก (REQUESTION VOUCHER)
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ===================== ตัวเลือกประเภทฟอร์ม (ตัวอย่าง checkbox) ===================== */}
          {/* (ในภาพมี RAW MATERIAL, SEMI FINISHED, FINISHED, PRINTING, STATIONERY, OTHER) */}
          <table style={{ ...tableStyle, marginBottom: "20px", border: "none" }}>
            <tbody>
              <tr>
                <td style={{...headerCellStyle, border: "none", textAlign: "left", padding: "5px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    <input type="checkbox" checked={true} readOnly /> วัตถุดิบ (RAW MATERIAL)
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    <input type="checkbox" readOnly /> ชิ้นงานกึ่งสำเร็จ (SEMI FINISHED PRODUCTS)
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    <input type="checkbox" readOnly /> ชิ้นงานสำเร็จ (FINISHED PRODUCTS)
                  </div>
                </td>
                <td style={{...headerCellStyle, border: "none", textAlign: "left", padding: "5px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    <input type="checkbox" readOnly /> วัสดุจำเป็นในการผลิต (PRODUCTION SUPPLY)
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    <input type="checkbox" readOnly /> เครื่องเขียน (STATIONERY)
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    <input type="checkbox" readOnly /> อื่นๆ ..........................................
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ===================== ส่วนข้อมูลผู้เบิก (ตัวอย่าง) ===================== */}
          <table style={{ ...tableStyle, marginBottom: "20px", border: "none" }}>
            <tbody>
              <tr>
              <td style={{ textAlign: "center", border: "none" }}>
                  <div style={{ marginBottom: "4px" }}>
                  <strong>วันที่(DATE):</strong> {today_date || "-"}
                  </div>
                 
                </td>
              <td style={{ textAlign: "center", border: "none" }}>
                
                  <div style={{ marginBottom: "4px" }}>
                  <strong>ชื่อผู้เบิก(NAME):</strong>
                  </div>
                 
                </td>
              <td style={{ textAlign: "center", border: "none" }}>
                 
                  <div style={{ marginBottom: "4px" }}>
                    <strong>แผนก(SECTION):</strong> 
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

{/* กล่องใหญ่ ใช้ flex แบ่ง 2 ส่วน (ตารางซ้าย, ลายเซ็นขวา) */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: "20px",
  }}
>
  {/* ----------------------------------- */}
  {/*              ตารางรายการ (ซ้าย)   */}
  {/* ----------------------------------- */}
  <div style={{ flex: "1", marginRight: "20px" }}>
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>
            <div>ลำดับที่</div>
            <div>ITEM</div>
          </th>
          <th style={thStyle}>
            <div>รายการ</div>
            <div>DESCRIPTION</div>  
          </th>
          <th style={thStyle}>
            <div>สี</div>
            <div>COLOUR</div>  
          </th>
          <th style={thStyle}>
            <div>จำนวน</div>
            <div>Q&apos;TY.</div>
          </th>
          <th style={thStyle}>
            <div>หน่วย</div>
            <div>UNIT</div>   
          </th>
          <th style={thStyle}>
            <div>วัตถุประสงค์</div>
            <div>PURPOSE</div>       
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            {/* คอลัมน์เลขลำดับ (Run Number) */}
            <td style={tdCenterStyle}>{index + 1}</td>

            {/* ITEM: ชื่อวัตถุดิบ + ขนาด (กว้างxยาวxหนา) */}
            <td style={tdStyle}>
              {item.rmifm_name || "-"}{" "}
              {`(${item.rmifm_width || "-"}x${item.rmifm_length || "-"}x${item.rmifm_thickness || "-"})`}
            </td>

            {/* COLOUR (ตัวอย่างยังเป็น "-" หากมีข้อมูลจริงอาจเติม item.colour) */}
            <td style={tdCenterStyle}></td>

            {/* QTY */}
            <td style={tdCenterStyle}>{item.outbrmitm_quantity || "-"}</td>

            {/* UNIT (ตัวอย่างยังเป็น "-" หากมีข้อมูลจริงอาจเติม item.unit) */}
            <td style={tdCenterStyle}>{item.unit_abbr_th || "-"}</td>

            {/* PURPOSE (ตอนนี้ใช้ outbrm_details แทน) */}
            <td style={tdStyle}></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* ----------------------------------- */}
  {/*         ส่วนลงชื่อ (Signature) ขวา */}
  {/* ----------------------------------- */}
  {/* ลดความกว้างจาก 30% -> 20% */}
  <div style={{ width: "20%" }}>
    <table style={{ ...tableStyle, width: "100%" }}>
      <tbody>
        {/* กล่องที่ 1 */}
        <tr>
          <td style={{ ...tdStyle, verticalAlign: "top", height: "30px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ marginTop: "30px" }}>
                ....................................
              </div>
              <div>ผู้อนุมัติ</div>
              <div>APPROVED BY</div>
            </div>
          </td>
        </tr>
        {/* กล่องที่ 2 */}
        <tr>
          <td style={{ ...tdStyle, verticalAlign: "top", height: "30px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ marginTop: "30px" }}>
                ....................................
              </div>
              <div>ผู้รับของ</div>
              <div>RECEIVED BY</div>
            </div>
          </td>
        </tr>
        {/* กล่องที่ 3 */}
        <tr>
          <td style={{ ...tdStyle, verticalAlign: "top", height: "30px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ marginTop: "30px" }}>
                ....................................
              </div>
              <div>ผู้จ่ายของ</div>
              <div>STORE KEEPER</div>
            </div>
          </td>
        </tr>
        {/* กล่องที่ 4 */}
        <tr>
          <td style={{ ...tdStyle, verticalAlign: "top", height: "30px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ marginTop: "30px" }}>
                ....................................
              </div>
              <div>ผู้ลงบัญชี</div>
              <div>RECORED BY</div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div style={{ textAlign: "center", marginTop: "10px"}}>
      (F-WH-05)
    </div>
  </div>
</div>



        </Box>

        {/* ปุ่ม Print (อยู่นอก ref เพื่อไม่ให้ติดไปใน PDF) */}
        {!isPrinting && (
          <Box mt={3} display="flex" textAlign="center" justifyContent="center">
            <ButtonComponent type="print" onClick={generatePDF} />
      
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default PrintRmBillComponent;
