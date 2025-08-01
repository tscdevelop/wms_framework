// /**
// =========================================================
// * Material Dashboard 2 PRO React - v2.2.0
// =========================================================

// * Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
// * Copyright 2023 Creative Tim (https://www.creative-tim.com)

// Coded by www.creative-tim.com

//  =========================================================

// * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// */

// //ฉบับเดิม
// import React from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import App from "App";

// // Material Dashboard 2 PRO React Context Provider
// import { MaterialUIControllerProvider } from "context";

// const container = document.getElementById("app");
// const root = createRoot(container);

// root.render(
//   <BrowserRouter>
//     <MaterialUIControllerProvider>
//       <App />
//     </MaterialUIControllerProvider>
//   </BrowserRouter>
// );


//ฉบับแก้ไข
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";
import "./i18n"; // นำเข้า i18n.js เพื่อเปิดใช้งานการแปลภาษา

// Material Dashboard 2 PRO React Context Provider
import { MaterialUIControllerProvider } from "context";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <MaterialUIControllerProvider>
      <App />
    </MaterialUIControllerProvider>
  </BrowserRouter>
);
