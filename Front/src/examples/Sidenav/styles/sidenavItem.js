/* eslint-disable prefer-destructuring */

/**
=========================================================
* Material Dashboard 2 PRO React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
function item(theme, ownerState) {
  const { palette, borders, functions, transitions } = theme;
  const { active, transparentSidenav, whiteSidenav, darkMode } = ownerState;

  const { transparent, white, grey } = palette;
  const { borderRadius } = borders;
  const { rgba } = functions;

  return {
    pl: 3,
    mt: 0.375,
    mb: 0.3,
    width: "100%",
    borderRadius: borderRadius.md,
    cursor: "pointer",
    backgroundColor: () => {
      let backgroundValue = transparent.main;

      if (active) {
        backgroundValue = "#FDC068"; // เปลี่ยนเป็นสีส้มเมื่อ active
      } else if (
        (active === "isParent" && !transparentSidenav && !whiteSidenav) ||
        (active === "isParent" && transparentSidenav && darkMode)
      ) {
        backgroundValue = rgba(white.main, 0.2);
      } else if (active === "isParent" && transparentSidenav) {
        backgroundValue = grey[300];
      } else if (active === "isParent" && whiteSidenav) {
        backgroundValue = grey[200];
      }

      return backgroundValue;
    },
    transition: transitions.create("background-color", {
      easing: transitions.easing.easeInOut,
      duration: transitions.duration.sharp,
    }),

    "&:hover, &:focus": {
      backgroundColor:
        !active &&
        rgba((transparentSidenav && !darkMode) || whiteSidenav ? grey[400] : white.main, 0.2),
    },
  };
}


function itemContent(theme, ownerState) {
  const { palette, typography, transitions, functions } = theme;
  const { miniSidenav,  active, transparentSidenav, whiteSidenav, darkMode } = ownerState;

  const { white, dark } = palette;
  const { size, fontWeightRegular, fontWeightLight } = typography;
  const { pxToRem } = functions;

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",  // จัดให้อยู่ใกล้ไอคอน
    width: "100%",
    padding: `${pxToRem(12)} ${pxToRem(16)}`,
    marginLeft: pxToRem(-5),
    userSelect: "none",
    position: "relative",

    "& .MuiListItemIcon-root": {
      minWidth: pxToRem(25),  // ปรับขนาดไอคอนให้เล็กลงถ้าจำเป็น
      marginRight: pxToRem(5),  // ลดช่องว่างระหว่างไอคอนและชื่อเมนู
    },

    "& span": {
      color:
        ((transparentSidenav && !darkMode) || whiteSidenav) && (active === "isParent" || !active)
          ? dark.main
          : white.main,
      fontWeight: active ? fontWeightRegular : fontWeightLight,
      fontSize: size.sm,
      opacity: miniSidenav ? 0 : 1,
      transition: transitions.create(["opacity", "color"], {
        easing: transitions.easing.easeInOut,
        duration: transitions.duration.standard,
      }),
      marginLeft: pxToRem(1),  // ลดช่องว่างระหว่างไอคอนกับชื่อเมนู
      whiteSpace: "normal",    // อนุญาตให้ขึ้นบรรทัดใหม่
      wordWrap: "break-word",  // ตัดคำถ้ายาวเกิน
    },

    "&::before": {
      //content: `"${name[0]}"`,
      color:
        ((transparentSidenav && !darkMode) || whiteSidenav) && (active === "isParent" || !active)
          ? dark.main
          : white.main,
      fontWeight: fontWeightRegular,
      display: "flex",
      alignItems: "center",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      left: pxToRem(-15),  // ปรับตำแหน่งซ้ายให้ชิดไอคอนมากขึ้น
      opacity: 1,
      borderRadius: "50%",
      fontSize: size.sm,
    },
  };
}



function itemArrow(theme, ownerState) {
  const { palette, typography, transitions, breakpoints, functions } = theme;
  const { noCollapse, transparentSidenav, whiteSidenav, miniSidenav, open, active, darkMode } =
    ownerState;

  const { white, dark } = palette;
  const { size } = typography;
  const { pxToRem, rgba } = functions;

  return {
    fontSize: `${size.lg} !important`,
    fontWeight: 700,
    marginBottom: pxToRem(-1),
    transform: open ? "rotate(0)" : "rotate(-180deg)",
    color: () => {
      let colorValue;

      if (transparentSidenav && darkMode) {
        colorValue = open || active ? white.main : rgba(white.main, 0.25);
      } else if (transparentSidenav || whiteSidenav) {
        colorValue = open || active ? dark.main : rgba(dark.main, 0.25);
      } else {
        colorValue = open || active ? white.main : rgba(white.main, 0.5);
      }

      return colorValue;
    },
    transition: transitions.create(["color", "transform", "opacity"], {
      easing: transitions.easing.easeInOut,
      duration: transitions.duration.shorter,
    }),

    [breakpoints.up("xl")]: {
      display:
        noCollapse || (transparentSidenav && miniSidenav) || miniSidenav
          ? "none !important"
          : "block !important",
    },
  };
}

export { item, itemContent, itemArrow };
