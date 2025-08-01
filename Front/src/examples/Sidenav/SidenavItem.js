// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Collapse from "@mui/material/Collapse";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon"; // เพิ่ม import สำหรับไอคอน
import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";

// Custom styles for the SidenavItem
import { item, itemContent, itemArrow } from "examples/Sidenav/styles/sidenavItem";

// Material Dashboard 2 PRO React contexts
import { useMaterialUIController } from "context";
import * as lang from "utils/langHelper";

function SidenavItem({ color, name, active, nested, children, open, icon, ...rest }) { // เพิ่ม icon เป็น prop
  const [controller] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;

  return (
    <>
      <ListItem
        {...rest}
        component="li"
        sx={(theme) => item(theme, { active, color, transparentSidenav, whiteSidenav, darkMode })}
      >
        <MDBox
          sx={(theme) =>
            itemContent(theme, {
              active,
              miniSidenav,
              name,
              open,
              nested,
              transparentSidenav,
              whiteSidenav,
              darkMode,
            })
          }
        >
          {/* แสดงผล icon ที่ส่งเข้ามา */}
          {icon && (
            <ListItemIcon>
              {icon}
            </ListItemIcon>
          )}
          <ListItemText primary={lang.msg(name)} sx={{ color: "black !important" }}/>
          {children && (
            <Icon
              component="i"
              sx={(theme) =>
                itemArrow(theme, { open, miniSidenav, transparentSidenav, whiteSidenav, darkMode })
              }
            >
              expand_less
            </Icon>
          )}
        </MDBox>
      </ListItem>
      {children && (
        <Collapse in={open} timeout="auto" unmountOnExit {...rest}>
          {children}
        </Collapse>
      )}
    </>
  );
}

// Setting default values for the props of SidenavItem
SidenavItem.defaultProps = {
  color: "info",
  active: false,
  nested: false,
  children: false,
  open: false,
  icon: null, // เพิ่มค่า default สำหรับ icon
};

// Typechecking props for the SidenavItem
SidenavItem.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  name: PropTypes.string.isRequired,
  active: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  nested: PropTypes.bool,
  children: PropTypes.node,
  open: PropTypes.bool,
  icon: PropTypes.node, // เพิ่มการตรวจสอบ prop สำหรับ icon
};

export default SidenavItem;




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

// // prop-types is a library for typechecking of props.
// import PropTypes from "prop-types";

// // @mui material components
// import Collapse from "@mui/material/Collapse";
// import ListItem from "@mui/material/ListItem";
// import ListItemText from "@mui/material/ListItemText";
// import Icon from "@mui/material/Icon";

// // Material Dashboard 2 PRO React components
// import MDBox from "components/MDBox";

// // Custom styles for the SidenavItem
// import { item, itemContent, itemArrow } from "examples/Sidenav/styles/sidenavItem";

// // Material Dashboard 2 PRO React contexts
// import { useMaterialUIController } from "context";
// import * as lang from "utils/langHelper";

// function SidenavItem({ color, name, active, nested, children, open, ...rest }) {
//   const [controller] = useMaterialUIController();
//   const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;

//   return (
//     <>
//       <ListItem
//         {...rest}
//         component="li"
//         sx={(theme) => item(theme, { active, color, transparentSidenav, whiteSidenav, darkMode })}
//       >
//         <MDBox
//           sx={(theme) =>
//             itemContent(theme, {
//               active,
//               miniSidenav,
//               name,
//               open,
//               nested,
//               transparentSidenav,
//               whiteSidenav,
//               darkMode,
//             })
//           }
//         >
//           <ListItemText primary={lang.msg(name)} />
//           {children && (
//             <Icon
//               component="i"
//               sx={(theme) =>
//                 itemArrow(theme, { open, miniSidenav, transparentSidenav, whiteSidenav, darkMode })
//               }
//             >
//               expand_less
//             </Icon>
//           )}
//         </MDBox>
//       </ListItem>
//       {children && (
//         <Collapse in={open} timeout="auto" unmountOnExit {...rest}>
//           {children}
//         </Collapse>
//       )}
//     </>
//   );
// }

// // Setting default values for the props of SidenavItem
// SidenavItem.defaultProps = {
//   color: "info",
//   active: false,
//   nested: false,
//   children: false,
//   open: false,
// };

// // Typechecking props for the SidenavItem
// SidenavItem.propTypes = {
//   color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
//   name: PropTypes.string.isRequired,
//   active: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
//   nested: PropTypes.bool,
//   children: PropTypes.node,
//   open: PropTypes.bool,
// };

// export default SidenavItem;
