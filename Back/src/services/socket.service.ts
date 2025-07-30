// services/socket.service.ts

import { Server } from 'socket.io';
import http from 'http';

// ตัวแปร io สำหรับเก็บ instance ของ Socket.io
let io: Server;

/**
 * ฟังก์ชันสำหรับเริ่มต้นการทำงานของ Socket.IO
 * จะถูกเรียกจาก app.ts โดยส่ง http server เข้ามา
 */
export const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
        origin: "http://localhost:3200", // อนุญาต frontend ที่พอร์ต 3200
        methods: ["GET", "POST"],        // อนุญาตเฉพาะเมธอด GET และ POST
        }
    });

    // เมื่อเชื่อมต่อเข้ามา
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // เมื่อตัดการเชื่อมต่อ
        socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        });
    });
};

/**
 * ฟังก์ชันสำหรับดึง io instance ที่ถูกประกาศไว้
 * ใช้ในที่อื่นๆ โดยไม่ต้อง import io จาก app.ts
 */
export const getIO = (): Server => {
    if (!io) {
        throw new Error("❌ Socket.io not initialized!"); // กรณียังไม่ได้ init จาก app.ts
    }
    return io;
};

