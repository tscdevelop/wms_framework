
import React, { useRef, useState } from "react";
import { Modal, Box, IconButton } from "@mui/material";
import MDTypography from "components/MDTypography";
import CloseIcon from "@mui/icons-material/Close";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import OutBoundFGAPI from "api/OutBoundFgAPI";
import ButtonComponent from "./ButtonComponent";
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "1000px",
  maxWidth: "100%",
  maxHeight: "90vh", // กำหนดความสูงสูงสุดให้ modal
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
  textAlign: "center",
  overflowY: "auto", // เพิ่ม Scrollbar เมื่อเนื้อหาเกิน
  overflowX: "hidden", // ซ่อน Scrollbar แนวนอน
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

// กล่องมีขอบ (เส้นกรอบ)
const borderedContainerStyle1 = {
  border: "1px solid #999",
  borderRadius: "10px",
  padding: "20px",
  margin: "20px 0",
  backgroundColor: "#F8FFFF", // <<--- เพิ่มตรงนี้
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


// สไตล์การจัดกลุ่มหัวฟอร์ม (บนสุด)
const headerCellStyle = {
  padding: "4px 8px",
  fontSize: "14px",
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


const PrintModalAllComponent = ({ open, onClose, data }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const pdfRef = useRef();

  const generatePDF = async () => {
    if (!pdfRef.current) return;
    setIsPrinting(true);

    try {
      if (data.outbfg_id) {
        const payload = {
          shipmt_date: today_date_time,
          withdr_date: today_date_time
        };
        await OutBoundFGAPI.updateOutbDateFG(data.outbfg_id, payload);
        console.log("Updated shipmt_date and withdr_date successfully");
      }
    } catch (error) {
      console.error("Error updating dates:", error);
    }


    setTimeout(async () => {
      try {
        const pdf = new jsPDF("portrait", "mm", "a4");
        const pdfWidth = 210; // ความกว้างของ A4 (mm)
        const pdfHeight = 190; // ความสูงของ A4 (mm)
        const margin = 20; // กำหนดระยะขอบ

        // สร้าง Canvas สำหรับส่วน "ใบนำส่ง"
        const waybillSection = pdfRef.current.querySelector("#waybill-section");
        const canvasWaybill = await html2canvas(waybillSection, {
          useCORS: true,
          scale: 2, // เพิ่มความละเอียด
        });
        const imgDataWaybill = canvasWaybill.toDataURL("image/png");
        const imgWidthWaybill = pdfWidth - 2 * margin; // ลดขนาดให้พอดีกับหน้ากระดาษและเหลือขอบ
        const imgHeightWaybill = (canvasWaybill.height * imgWidthWaybill) / canvasWaybill.width;

        // คำนวณตำแหน่งให้อยู่กึ่งกลางในหน้าแรก
        const xWaybill = margin;
        const yWaybill = (pdfHeight - imgHeightWaybill) / 2; // กึ่งกลางในแนวตั้ง

        // เพิ่มส่วน "ใบนำส่ง" ในหน้าแรก
        pdf.addImage(imgDataWaybill, "PNG", xWaybill, yWaybill, imgWidthWaybill, imgHeightWaybill);

        // สร้าง Canvas สำหรับส่วน "ใบเบิก FG"
        const fgSection = pdfRef.current.querySelector("#fg-section");
        const canvasFG = await html2canvas(fgSection, {
          useCORS: true,
          scale: 2, // เพิ่มความละเอียด
        });
        const imgDataFG = canvasFG.toDataURL("image/png");
        const imgWidthFG = pdfWidth - 2 * margin; // ลดขนาดให้พอดีกับหน้ากระดาษและเหลือขอบ
        const imgHeightFG = (canvasFG.height * imgWidthFG) / canvasFG.width;

        // เพิ่มหน้าใหม่และคำนวณตำแหน่งให้อยู่กึ่งกลาง
        pdf.addPage();
        const xFG = margin;
        const yFG = (pdfHeight - imgHeightFG) / 2; // กึ่งกลางในแนวตั้ง
        pdf.addImage(imgDataFG, "PNG", xFG, yFG, imgWidthFG, imgHeightFG);

        // บันทึก PDF
        pdf.save("All_Bills.pdf");
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setIsPrinting(false);
      }
    }, 0);
  };









  if (!data) return null;

  const {
    today_date_time,
    today_date,
    outbfg_vehicle_license,
    outbfg_driver_name,
    outbfg_phone,
    outbfg_address,
    outbfg_remark,
    so_code,
    items,
  } = data;


  // eslint-disable-next-line no-unused-vars
  const renderTableRows = (items, isWayBill) =>
    items.map((item, index) => (
      <tr key={index}>
        <td style={tdStyle}>{item.inbfg_code || "-"}</td>
        <td style={tdStyle}>{item.fgifm_name || "-"}</td>
        <td style={tdStyle}>{item.fgifm_width || "-"}</td>
        <td style={tdStyle}>{item.fgifm_length || "-"}</td>
        <td style={tdStyle}>{item.fgifm_thickness || "-"}</td>
        {!isWayBill && <td style={tdStyle}>{item.wh_name || "-"}</td>}
        {!isWayBill && <td style={tdStyle}>{item.zn_name || "-"}</td>}
        <td style={tdStyle}>{item.outbfgitm_quantity || "-"}</td>
      </tr>
    ));

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle} ref={pdfRef}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box />
          <IconButton onClick={onClose} sx={{ color: "black" }}>
            <CloseIcon />
          </IconButton>
        </Box>




        {/* WayBill Section */}
        <div id="waybill-section" style={borderedContainerStyle1}>
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
                เลขที่ INV :
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
                      <div>ส่วนคลังสินค้า DC</div>
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



        {/* FG Section */}
        <div id="fg-section" style={formContainerStyle}>



          <Box sx={{ mt: 4, mb: 4 }}>
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
                    <div style={{ fontWeight: "bold", fontSize: "14px" }}>
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
                  <td style={{ ...headerCellStyle, border: "none", textAlign: "left", padding: "5px" }}>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                      <input type="checkbox" readOnly disabled /> วัตถุดิบ (RAW MATERIAL)
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                      <input type="checkbox" readOnly disabled /> ชิ้นงานกึ่งสำเร็จ (SEMI FINISHED PRODUCTS)
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                      <input type="checkbox" checked={true} readOnly /> ชิ้นงานสำเร็จ (FINISHED PRODUCTS)
                    </div>
                  </td>
                  <td style={{ ...headerCellStyle, border: "none", textAlign: "left", padding: "5px" }}>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                      <input type="checkbox" readOnly disabled /> วัสดุจำเป็นในการผลิต (PRODUCTION SUPPLY)
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                      <input type="checkbox" readOnly disabled /> เครื่องเขียน (STATIONERY)
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                      <input type="checkbox" readOnly disabled /> อื่นๆ ..........................................
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
                          {item.fgifm_name || "-"}{" "}
                          {`(${item.fgifm_width || "-"}x${item.fgifm_length || "-"}x${item.fgifm_thickness || "-"})`}
                        </td>

                        {/* COLOUR (ตัวอย่างยังเป็น "-" หากมีข้อมูลจริงอาจเติม item.colour) */}
                        <td style={tdCenterStyle}>{item.inbfg_color || "-"}</td>

                        {/* QTY */}
                        <td style={tdCenterStyle}>{item.outbfgitm_quantity || "-"}</td>

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
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  (F-WH-05)
                </div>
              </div>
            </div>
          </Box>

        </div>
        {!isPrinting && (
          <Box mt={3} display="flex" justifyContent="center" textAlign="center">
            <ButtonComponent
              type="print"
              onClick={generatePDF}

            />

          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default PrintModalAllComponent;

