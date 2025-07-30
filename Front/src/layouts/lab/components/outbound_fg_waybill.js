import React, { useRef, useState } from "react";
import MDTypography from "components/MDTypography";
import { Box, Modal, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ButtonComponent from "./ButtonComponent";
import OutBoundFGAPI from "api/OutBoundFgAPI";

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
  backgroundColor: "#F8FFFF", // <<--- เพิ่มตรงนี้
};

// สไตล์ตาราง
const tableStyle = {
  borderCollapse: "collapse",
  width: "100%",
};

// สไตล์หัวตาราง
const thStyle = {
  border: "1px solid #000",
  padding: "5px",
  backgroundColor: "#f2f2f2",
  fontWeight: "bold",
  textAlign: "center",
  fontSize: "0.9rem",
};

// สไตล์ช่องตาราง
const tdStyle = {
  border: "1px solid #000",
  padding: "5px",
  textAlign: "center",
  fontSize: "0.85rem",
};

// สไตล์ช่องตาราง (จัดซ้าย)
const tdLeftStyle = {
  ...tdStyle,
  textAlign: "left",
};

// สไตล์ช่องตาราง (จัดกลาง)
const tdCenterStyle = {
  ...tdStyle,
  textAlign: "center",
};

const PrintWayBillComponent = ({ open, onClose, data }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const pdfRef = useRef();

  if (!data) return null;

  // ดึงข้อมูลจาก props data
  const {
    today_date = "-",
    today_date_time = "-",
    outbfg_vehicle_license = "-",
    outbfg_driver_name= "-",
    outbfg_address = "-",
    outbfg_phone = "-",
    so_code = "-",
    outbfg_remark = "-",
    items = [],
  } = data;

  // ฟังก์ชันสร้าง PDF
  const generatePDF = async () => {
    if (!pdfRef.current) return;
    setIsPrinting(true);

  try {
      // สมมติว่า data มีฟิลด์ outbfg_id อยู่
      if (data.outbfg_id) {
        const payload = { shipmt_date: today_date_time };
        await OutBoundFGAPI.updateOutbDateFG(data.outbfg_id, payload);
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
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin,
          printWidth,
          printHeight
        );

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
        {/* Container ที่จะจับภาพไปทำ PDF */}
        <Box ref={pdfRef}>
          {/* Header: ปุ่มปิดและชื่อเอกสาร */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            {!isPrinting && (
              <>
                <MDTypography variant="h4" fontWeight="bold">
                  พิมพ์ใบนำส่ง FG
                </MDTypography>
                <IconButton onClick={onClose} sx={{ color: "black" }}>
                  <CloseIcon />
                </IconButton>
              </>
            )}
          </Box>

          <div style={borderedContainerStyle}>
            {/* ========== ส่วนหัวกระดาษ 4 กล่องแบบรูปตัวอย่าง ========== */}
            <Box sx={{ border: "1px solid black", display: "flex" }}>
              {/* ฝั่งซ้าย (3 กล่อง) */}
              <Box
                sx={{
                  width: "60%",
                  borderRight: "1px solid black",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* แถวบน: 2 กล่องซ้าย-ขวา */}
                <Box sx={{ display: "flex", borderBottom: "1px solid black" }}>
                  {/* กล่องซ้ายบน */}
                  <Box
                    sx={{
                      width: "50%",
                      borderRight: "1px solid black",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      p: 1,
                    }}
                  >
                    {/* Checkbox แถวแรก */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <input type="checkbox" style={{ marginRight: "8px" }} />
                      <MDTypography variant="body1">LPI CO., LTD.</MDTypography>
                    </Box>

                    {/* Checkbox แถวสอง */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <input type="checkbox" style={{ marginRight: "8px" }} />
                      <MDTypography variant="body1">LPI-RR CO., LTD.</MDTypography>
                    </Box>
                  </Box>
                  {/* กล่องขวาบน */}
                  <Box sx={{ width: "50%", p: 1, mt: 3 }}>
                    <MDTypography variant="h5" fontWeight="bold">
                      ใบนำออกชิ้นส่วนสินค้า
                    </MDTypography>
                  </Box>
                </Box>

                {/* แถวล่าง: 1 กล่องเต็มความกว้าง */}
                <Box sx={{ p: 1 }}>
                  {/* บรรทัดที่ 1 */}
                  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <MDTypography variant="h6">
                      ขอเบิกสินค้า / ชิ้นส่วนดังกล่าว เพื่อจัดส่ง
                    </MDTypography>
                  </Box>

                  {/* บรรทัดที่ 2 */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      minHeight: "40px", // กำหนดความสูงขั้นต่ำให้กล่องมีพื้นที่ว่าง

                      p: 1, // padding ถ้าต้องการ
                    }}
                  >
                    {/* คุณสามารถใส่เนื้อหาหรือปล่อยว่างไว้ก็ได้ */}
                  </Box>



                  {/* บรรทัดที่ 3 (แบ่งซ้าย-ขวา) */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                    <MDTypography variant="h6">
                      ติดต่อ: {outbfg_address || "-"}
                    </MDTypography>
                    <MDTypography variant="h6">
                      โทร: {outbfg_phone || "-"}
                    </MDTypography>
                  </Box>
                </Box>
              </Box>

              {/* ฝั่งขวา (1 กล่องเต็ม) */}
              <Box sx={{ width: "40%", p: 1, textAlign: "left" }}>
                {/* สามารถใส่ข้อมูลเพิ่มเติมได้ที่นี่ */}
                <MDTypography variant="h6">
                  วันที่ออกเอกสาร : {today_date}
                </MDTypography>
                <MDTypography variant="h6">
                  เลขที่ INV : -
                </MDTypography>
                <MDTypography variant="h6">
                  เลขที่ Job : {so_code}
                </MDTypography>
                <MDTypography variant="h6">
                  ทะเบียนรถ : {outbfg_vehicle_license}
                </MDTypography>
              </Box>
            </Box>
            {/* ========== จบส่วนหัวกระดาษ ========== */}

            {/* ตารางรายการ */}
            <Box sx={{ mt: 2 }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>NO.</th>
                    <th style={thStyle}>DESCRIPTION</th>
                    <th style={thStyle}>SIZE</th>
                    <th style={thStyle}>QUANTITY</th>
                    <th style={thStyle}>UNIT</th>
                    <th style={thStyle}>COLOUR</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const sizeString = `${item.fgifm_width || "-"} x ${item.fgifm_length || "-"
                      } x ${item.fgifm_thickness || "-"}`;

                    return (
                      <tr key={index}>
                        <td style={tdStyle}>{index + 1}</td>
                        <td style={tdLeftStyle}>
                          {item.fgifm_name || "-"}
                        </td>
                        <td style={tdLeftStyle}>{sizeString}</td>
                        <td style={tdCenterStyle}>{item.outbfgitm_quantity || "-"}</td>
                        <td style={tdCenterStyle}>{item.unit_abbr_th || "-"}</td>
                        <td style={tdCenterStyle}>{item.inbfg_color || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  {/* แถวเดียวสำหรับ REMARK */}
                  <tr>
                    <td colSpan={6} style={tdLeftStyle}>
                      <strong>REMARK : </strong>
                      {outbfg_remark || "-"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </Box>

            {/* ส่วนลายเซ็น (ผู้ส่งของ / ผู้ตรวจนับ / ผู้รับของ) */}
            <Box sx={{ mt: 4 }}>
              <table style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={{ ...tdStyle, height: "60px" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <div>ส่วนสนับสนุน PC</div>
                        <div>เบิกของ (1)</div>
                      </Box>
                      <div style={{ marginBottom: "10px" }}>
                        ..............................................
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        (.............................................)
                      </div>
                      <div>............../................../..............</div>
                    </td>
                    <td style={{ ...tdStyle, height: "60px" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <div>ฝ่ายโรงงาน</div>
                        <div>ผู้อนุมัติ (2)</div>
                      </Box>
                      <div style={{ marginBottom: "10px" }}>
                        ..............................................
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        (.............................................)
                      </div>
                      <div>............../................../..............</div>
                    </td>
                    <td style={{ ...tdStyle, height: "60px" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <div>ส่วนสโตร์วัตถุดิบ</div>
                        <div>ผลิต (3)</div>
                      </Box>
                      <div style={{ marginBottom: "10px" }}>
                        ..............................................
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        (.............................................)
                      </div>
                      <div>............../................../..............</div>
                    </td>
                  </tr>
                </tbody>
                <tbody>
                  <tr>
                    <td style={{ ...tdStyle, height: "60px" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <div>ส่วนคลังสินค้า</div>
                        <div>จัดสินค้าหน้าท่า (4)</div>
                      </Box>
                      <div style={{ marginBottom: "10px" }}>
                        ..............................................
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        (.............................................)
                      </div>
                      <div>............../................../..............</div>
                    </td>
                    <td style={{ ...tdStyle, height: "60px" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <div>ลูกค้า</div>
                        <div>ตรวจรับ-ขนส่ง (5)</div>
                      </Box>
                      <div style={{ marginBottom: "10px" }}>
                        ..............................................
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                              ( {outbfg_driver_name} )
                      </div>
                      <div>............../................../..............</div>
                    </td>
                    <td style={{ ...tdStyle, height: "60px" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <div>รปภ.</div>
                        <div>บุคคล (6)</div>
                      </Box>
                      <div style={{ marginBottom: "10px" }}>
                        ..............................................
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        (.............................................)
                      </div>
                      <div>............../................../..............</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </div>
        </Box>

        {/* ปุ่ม Print (อยู่นอก pdfRef) */}
        {!isPrinting && (
          <Box mt={3} display="flex" textAlign="center" justifyContent="center">
            <ButtonComponent type="print"
              onClick={generatePDF}
            />

          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default PrintWayBillComponent;
