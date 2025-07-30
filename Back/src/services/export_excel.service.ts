import ExcelJS from 'exceljs';
import { Response } from 'express';
import ResponseUtils, { HttpStatus } from '../utils/ResponseUtils';
import { ApiResponse } from '../models/api-response.model';

export class ExcelService {
    static async exportToExcel(
        structure: { 
            headers: { title: string; key?: string; col: number, colspan?: number }[], 
            subHeaders?: { title: string; key: string; col: number }[], 
            startRow: number,
            documentTitle?: string
        },
        data: any[],
        extraData: { 
            title: string; 
            key?: string;  // ✅ เปลี่ยนเป็น optional
            row: number; 
            col: number; 
            colspan?: number; 
            horizontal?: 'left' | 'center' | 'right'; // ✅ เพิ่มการกำหนดตำแหน่งข้อความ
        }[] = [], // ✅ ใช้ key เพื่อดึงจากฐานข้อมูล
        fileName: string,
        res: Response,
        options?: { 
            headerBgColor?: string,
            headerTextColor?: string,
            titleFontSize?: number,
            titleBold?: boolean,
        }
    ) {
        try {
            console.log('✅ Exporting Excel with structure:', structure);
            console.log('✅ Data length:', data.length);
            if (data.length === 0) {
                return ResponseUtils.handleCustomResponse(
                    res,
                    new ApiResponse({
                        isCompleted: false,
                        message: 'No data available for export.',
                    }),
                    HttpStatus.NOT_FOUND
                );
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');

            // ✅ คำนวณคอลัมน์สุดท้ายที่ต้อง Merge (ใช้ headers และ subHeaders)
            const maxCol = Math.max(
                ...structure.headers.map(({ col, colspan }) => col + (colspan || 1) - 1), // Headers
                ...(structure.subHeaders ? structure.subHeaders.map(({ col }) => col) : []) // SubHeaders
            );

            // ✅ ถ้ามี `documentTitle` ให้ Merge ครอบทุกคอลัมน์
            if (structure.documentTitle) {
                worksheet.mergeCells(1, 1, 1, maxCol); // ✅ Merge documentTitle จนถึงคอลัมน์สุดท้าย
                const titleCell = worksheet.getCell(1, 1);
                titleCell.value = structure.documentTitle;
                titleCell.font = { 
                    size: options?.titleFontSize || 14, 
                    bold: options?.titleBold !== false 
                };
                titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            }

            // ✅ ใส่ข้อมูลที่ไม่ใช่ตาราง (รองรับ title, key, horizontal, colspan)
            extraData?.forEach(({ title, key, row, col, colspan = 1, horizontal = 'center' }) => {
                const endCol = col + colspan - 1; // คำนวณตำแหน่งเซลล์สุดท้ายที่ต้อง Merge
                const labelCell = worksheet.getCell(row, col);

                // 🟢 ถ้าไม่มี `key` → ใส่ `title` เป็นข้อความล้วน
                if (!key) {
                    labelCell.value = title;
                } else {
                    // 🟢 ถ้ามี `key` → ใส่ `title` และค่าจาก `data`
                    labelCell.value = title;
                    const valueCell = worksheet.getCell(row, endCol + 1);
                    valueCell.value = data[0]?.[key] ?? '-';
                    valueCell.font = { bold: false };
                    valueCell.alignment = { horizontal: 'left' };
                }

                // ✅ ตั้งค่า Font และ Alignment ตาม `horizontal`
                labelCell.font = { bold: true, size: 12 };
                labelCell.alignment = { horizontal };

                // ✅ Merge Cells ถ้าต้องการให้ข้อความครอบหลายคอลัมน์
                if (colspan > 1) {
                    worksheet.mergeCells(row, col, row, endCol);
                }
            });

            // ✅ ใช้สี Header ตามที่กำหนด
            const headerBgColor = options?.headerBgColor || 'FFFFFF'; // สีเหลือง
            const headerTextColor = options?.headerTextColor || '000000'; // สีดำ

            // ✅ ตรวจสอบว่ามี subHeaders หรือไม่
            const hasSubHeaders = structure.subHeaders && structure.subHeaders.length > 0;
            const subHeaders = structure.subHeaders || [];

            // ✅ คำนวณตำแหน่งแถวของ Header และ Sub-header
            const headerRowIndex = hasSubHeaders ? structure.startRow - 2 : structure.startRow - 1;
            const subHeaderRowIndex = headerRowIndex + 1;

            // ✅ วาด Header หลัก (Main Headers)
            structure.headers.forEach(({ title, col, colspan }) => {
                const endCol = col + (colspan ? colspan - 1 : 0);
                const hasSubHeader = subHeaders.some(sh => sh.col >= col && sh.col <= endCol);

                // ✅ ถ้าไม่มี `subHeaders` เลย ไม่ต้อง merge แนวตั้ง
                if (hasSubHeaders && hasSubHeader) {
                    worksheet.mergeCells(headerRowIndex, col, headerRowIndex, endCol);
                } else if (hasSubHeaders) {
                    worksheet.mergeCells(headerRowIndex, col, subHeaderRowIndex, endCol);
                }

                const cell = worksheet.getCell(headerRowIndex, col);
                cell.value = title;
                cell.font = { bold: true, color: { argb: headerTextColor } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: headerBgColor }
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });

            // ✅ วาด Sub-Header (ถ้ามี)
            if (hasSubHeaders) {
                subHeaders.forEach(({ title, col }) => {
                    const cell = worksheet.getCell(subHeaderRowIndex, col);
                    cell.value = title;
                    cell.font = { bold: true, color: { argb: headerTextColor } };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: headerBgColor }
                    };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                });
            }

            // ✅ รวม headers และ subHeaders ที่ใช้จริง
            const columns: { title: string; key: string; col: number }[] = structure.headers.flatMap(header => {
                const relatedSubHeaders = subHeaders
                    .filter(sh => sh.col >= header.col && sh.col < (header.col + (header.colspan || 1)))
                    .map(sh => ({
                        title: sh.title,
                        key: sh.key ?? '', // 🔹 ป้องกัน key เป็น undefined
                        col: sh.col
                    }));

                return relatedSubHeaders.length > 0
                    ? relatedSubHeaders
                    : [{ title: header.title, key: header.key ?? '', col: header.col }];
            });

            // ✅ Debug ตรวจสอบค่าที่ใช้จริง
            console.log("✅ Final Columns Used:", columns);

            // ✅ ใส่ข้อมูลลงใน Excel
            let currentRow = structure.startRow;
            data.forEach((row, rowIndex) => {
                const excelRow = worksheet.getRow(currentRow);
                console.log(`🔹 Processing row ${rowIndex + 1}:`, row);

                columns.forEach(({ key, col }) => {
                    const cell = excelRow.getCell(col);
                    cell.value = key ? row[key] ?? '-' : '-';
                    cell.alignment = { horizontal: 'left', vertical: 'middle' };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });

                currentRow++;
            });


            // ✅ Debug ดูว่า Data ทั้งหมดถูกใส่หรือไม่
            console.log(`✅ Total Rows Written: ${currentRow - structure.startRow}`);

            // ✅ Auto Fit Columns: คำนวณความกว้างสูงสุดของ Header + SubHeader + Data
            structure.headers.forEach(({ col, key, title, colspan }) => {
                let maxHeaderWidth = title.length;
                let totalSubHeaderWidth = 0; // เก็บค่ารวมของ subHeader ถ้ามี colspan
                let subHeaderWidths: { [col: number]: number } = {}; // เก็บความกว้างของแต่ละ subHeader

                // 🟢 ถ้ามี SubHeader ให้คำนวณความกว้างของแต่ละตัว
                const relatedSubHeaders = subHeaders.filter(sh => sh.col >= col && sh.col < (col + (colspan || 1)));
                if (relatedSubHeaders.length > 0) {
                    relatedSubHeaders.forEach(sh => {
                        const maxSubHeaderDataWidth = Math.max(
                            sh.title.length, // ความยาวของชื่อ subHeader
                            ...data.map(row => (row[sh.key] ? row[sh.key].toString().trim().length : 0)) // ข้อมูลจริง
                        );
                        subHeaderWidths[sh.col] = maxSubHeaderDataWidth + 4; // เพิ่ม padding 4
                        totalSubHeaderWidth += maxSubHeaderDataWidth + 4; // รวมความกว้างของทุก subHeader
                    });
                }

                // 🟢 คำนวณความกว้างของข้อมูลจริง (ใช้ key ที่มีค่าเท่านั้น)
                let maxDataWidth = key
                    ? Math.max(...data.map(row => (row[key] ? row[key].toString().trim().length : 0)))
                    : 0;

                // ✅ ใช้ค่าที่ใหญ่ที่สุดเป็นความกว้างของคอลัมน์
                let finalWidth = Math.max(maxHeaderWidth, maxDataWidth, totalSubHeaderWidth) + 4;

                // ✅ ถ้ามี subHeaders ให้กำหนดขนาดแยก
                if (relatedSubHeaders.length > 0) {
                    relatedSubHeaders.forEach(sh => {
                        worksheet.getColumn(sh.col).width = subHeaderWidths[sh.col];
                    });
                } else {
                    // ✅ ถ้าไม่มี subHeaders และไม่มี colspan → ใช้ขนาดปกติ
                    worksheet.getColumn(col).width = finalWidth;
                }
            });

            // ✅ บันทึกลง buffer และส่งกลับไปยัง Response
            console.log('✅ Writing Excel file...');
            const buffer = await workbook.xlsx.writeBuffer();

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
            res.send(buffer);

        } catch (error: any) {
            console.error('❌ Error exporting to Excel:', error);
            ResponseUtils.handleError(
                res,
                'exportToExcel',
                error.message,
                'excel.export'
            );
        }
    }
}
