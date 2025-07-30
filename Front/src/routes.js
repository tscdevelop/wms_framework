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

/** 
  All of the routes for the Material Dashboard 2 PRO React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that contains other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/



// Material Dashboard 2 PRO React layouts
/* import Analytics from "layouts/dashboards/analytics";
import Sales from "layouts/dashboards/sales";
import ProfileOverview from "layouts/pages/profile/profile-overview";
import AllProjects from "layouts/pages/profile/all-projects";
import NewUser from "layouts/pages/users/new-user";
import Settings from "layouts/pages/account/settings";
import Billing from "layouts/pages/account/billing";
import Invoice from "layouts/pages/account/invoice";
import Timeline from "layouts/pages/projects/timeline";
import PricingPage from "layouts/pages/pricing-page";
import Widgets from "layouts/pages/widgets";
import RTL from "layouts/pages/rtl";
import Charts from "layouts/pages/charts";
import Notifications from "layouts/pages/notifications";
import Kanban from "layouts/applications/kanban";
import Wizard from "layouts/applications/wizard";
import DataTables from "layouts/applications/data-tables";
import Calendar from "layouts/applications/calendar";
import NewProduct from "layouts/ecommerce/products/new-product";
import EditProduct from "layouts/ecommerce/products/edit-product";
import ProductPage from "layouts/ecommerce/products/product-page";
import OrderList from "layouts/ecommerce/orders/order-list";
import OrderDetails from "layouts/ecommerce/orders/order-details";
import SignInBasic from "layouts/authentication/sign-in/basic";
import SignInCover from "layouts/authentication/sign-in/cover";
import SignInIllustration from "layouts/authentication/sign-in/illustration";
import SignUpCover from "layouts/authentication/sign-up/cover";
import ResetCover from "layouts/authentication/reset-password/cover";
 */

// Images
//import profilePicture from "assets/images/team-3.jpg";

// import React, { useEffect, useState ,useContext} from 'react';
// import axios from 'axios';

// ภาษา language
//import * as lang from "utils/langHelper.js"

// @mui icons


import Icon from "@mui/material/Icon";

// Menu initial
import HomePage from "layouts/lab/home";
import BOMCreatePage from "layouts/lab/bom/bom_create";
import BOMDetailsPage from "layouts/lab/bom/bom_details";
import NotiAppWithdrawPage from "layouts/lab/noti-approve/noti_withdraw";
import TrackingPage from "layouts/lab/tracking";
import TrackingShipmentPage from "layouts/lab/tracking/tracking_shipment";
import BOMPage from "layouts/lab/bom";
import PickupWithdrawPage from "layouts/lab/pickup-withdraw";
import WithdrawPage from "layouts/lab/pickup-withdraw/withdraw";
import ConfirmWithdrawPage from "layouts/lab/confirm-sending/confirm";
import ConfirmDeliveryPage from "layouts/lab/confirm-sending/comfirm_delivery";
import ConfirmSemiFGWithdrawPage from "layouts/lab/confirm-semifg/confirm_semifg";
import ConfirmSemiFGDeliveryPage from "layouts/lab/confirm-semifg/confirm_semifg_delivery";
import LoginPage from "layouts/lab/login";
import LogoutPage from "layouts/lab/logout";
import RoleEditPage from "layouts/lab/role/edit_role.js";
import InboundRawAddPage from "layouts/lab/inbound-rawmaterial/inbound_rawmaterial_add";
import InboundFgAddPage from "layouts/lab/inbound-fg/inbound_fg_add";
import InboundFGDetailsPage from "layouts/lab/inbound-fg/inbound_fg_details";
import InboundToolingAddPage from "layouts/lab/inbound-tooling/inbound_tooling_add";
import InboundTlDetailsPage from "layouts/lab/inbound-tooling/inbound_tooling_details";
import InboundSemiFGAddPage from "layouts/lab/inbound-semi-fg/inbound_semifg_add";
import InboundSemiFGDetailsPage from "layouts/lab/inbound-semi-fg/inbound_semifg_details";
import OutboundRawCreatePage from "layouts/lab/outbound-rawmaterial/outbound_rawmaterial_create";
import OutboundRawDetailsPage from "layouts/lab/outbound-rawmaterial/outbound_raw_details";
import OutboundFgCreatePage from "layouts/lab/outbound-fg/outbound_fg_create";
import OutboundFgDetailsPage from "layouts/lab/outbound-fg/outbound_fg_details";
import OutboundSemiCreatePage from "layouts/lab/outbound-semifg/outbound_semi_create";
import OutBoundToolingCreatePage from "layouts/lab/outbound-tooling/outbound_tooling_create";
import OutBoundToolingReturnPage from "layouts/lab/outbound-tooling/outbound_tooling_return";
import OutboundToolingDetailsPage from "layouts/lab/outbound-tooling/outbound_tooling_details";
import OutboundSemiDetailPage from "layouts/lab/outbound-semifg/outbound_semi_details";
import RoleFactoryPage from "layouts/lab/role/fac_role";
import InbTranRawDetailsPage from "layouts/lab/inbound-transaction/raw_details";
import InbTranFGDetailsPage from "layouts/lab/inbound-transaction/fg_details";
import InbTranToolingDetailsPage from "layouts/lab/inbound-transaction/tooling_details";
import InbTranSemiFGDetailsPage from "layouts/lab/inbound-transaction/semi_details";
import OutbTranRawDetailsPage from "layouts/lab/outbound-transaction/raw_details";
import OutbTranSemiDetailsPage from "layouts/lab/outbound-transaction/semi_details";
import OutbTranFGDetailsPage from "layouts/lab/outbound-transaction/fg_details";
import OutbTranToolingDetailsPage from "layouts/lab/outbound-transaction/tooling_details";



// Menu Generate
import ConfirmSendingPage from "layouts/lab/confirm-sending";
import ConfirmSemiFGPage from "layouts/lab/confirm-semifg";
import NotiShelfPage from "layouts/lab/notification/noti_shelf";
import NotiMinimumPage from "layouts/lab/notification/noti_minimum";
import NotiToolingPage from "layouts/lab/notification/noti_tooling";
import NotiApprovePage from "layouts/lab/noti-approve";
import FactoryPage from "layouts/lab/factory-setting";
import WareHouesPage from "layouts/lab/warehouse-setting";
import ZonePage from "layouts/lab/zone-setting";
import LocationPage from "layouts/lab/location-setting";
import SupplierPage from "layouts/lab/supplier-setting";
import DockYardPage from "layouts/lab/dockyard-setting";
import UnitPage from "layouts/lab/unit-setting";
import RawPage from "layouts/lab/rawmaterial-type";
import FGPage from "layouts/lab/fg-type";
import ToolingPage from "layouts/lab/tooling-type";
import SemiPage from "layouts/lab/semi-fg-type";
import CriterionPage from "layouts/lab/criterion.js";
import SemiFGPage from "layouts/lab/semi-fg-info/index.js";
import RawInfoPage from "layouts/lab/rawmaterial-info";
import FgInfoPage from "layouts/lab/fg-info";
import ToolingInfoPage from "layouts/lab/tooling-info";
import InboundRawMaterialPage from "layouts/lab/inbound-rawmaterial";
import InboundRawDetailsPage from "layouts/lab/inbound-rawmaterial/inbound_raw_detail";
import InboundFGPage from "layouts/lab/inbound-fg";
import InboundToolingPage from "layouts/lab/inbound-tooling";
import InboundSemiFGPage from "layouts/lab/inbound-semi-fg";
import OutboundRawMaterialPage from "layouts/lab/outbound-rawmaterial";
import OutboundFGPage from "layouts/lab/outbound-fg";
import OutboundToolingPage from "layouts/lab/outbound-tooling";
import OutboundSemiFGPage from "layouts/lab/outbound-semifg";
import InventoryRawPage from "layouts/lab/inventory/inventory_raw";
import InventorySemiPage from "layouts/lab/inventory/inventory_semi";
import InventoryFGPage from "layouts/lab/inventory/inventory_fg";
import InventoryToolingPage from "layouts/lab/inventory/inventory_tooling";
import InbTranRawMaterialPage from "layouts/lab/inbound-transaction/raw";
import InbTranFGPage from "layouts/lab/inbound-transaction/fg";
import InbTranSemiFGPage from "layouts/lab/inbound-transaction/semi";
import InbTranToolingPage from "layouts/lab/inbound-transaction/tooling";
import OutbTranRawMaterialPage from "layouts/lab/outbound-transaction/raw";
import OutbTranSemiFGPage from "layouts/lab/outbound-transaction/semi";
import OutbTranFGPage from "layouts/lab/outbound-transaction/fg";
import OutbTranToolingPage from "layouts/lab/outbound-transaction/tooling";


import EmployeePage from "layouts/lab/employee";
import RolePage from "layouts/lab/role";




const getComponent = (componentName) => {
  switch (componentName) {
    // for menu intital
    case "home":
      return <HomePage />;
    case "bom":
      return <BOMPage />;
  
    case "noti-app-withdraw":
      return <NotiAppWithdrawPage />;
    case "track":
      return <TrackingPage />;
    case "pickupwithdraw":
      return <PickupWithdrawPage />;
    case "withdraw":
      return <WithdrawPage />;
    case "confirm-wd":
      return <ConfirmWithdrawPage />;
    case "confirm-deli":
      return <ConfirmDeliveryPage />;
    case "confirm-semi-wd":
      return <ConfirmSemiFGWithdrawPage />;
    case "confirm-semi-deli":
      return <ConfirmSemiFGDeliveryPage />;
    case "login":
      return <LoginPage />;
    case "logout":
      return <LogoutPage />;
    case "role-edit":
        return <RoleEditPage />;
    case "inboundraw-add":
      return <InboundRawAddPage />;
    case "inboundraw-details":
      return <InboundRawDetailsPage />;
    case "inboundFG-add":
      return <InboundFgAddPage />;
    case "inboundFG-details":
      return <InboundFGDetailsPage />;
    case "inboundTooling-add":
      return <InboundToolingAddPage />;
    case "inboundTooling-details":
      return <InboundTlDetailsPage />;
    case "inboundSemiFG-add":
      return <InboundSemiFGAddPage />;
    case "inboundSemiFG-details":
      return <InboundSemiFGDetailsPage />;
    case "outboundRaw-create":
      return <OutboundRawCreatePage />;
    case "outboundRaw-details":
      return <OutboundRawDetailsPage />;
    case "outboundFg-create":
      return <OutboundFgCreatePage />;
    case "outboundFg-details":
      return <OutboundFgDetailsPage />;
    case "outboundSemiFG-create":
      return <OutboundSemiCreatePage />;
    case "bom-create":
      return <BOMCreatePage />;
    case "bom-details":
      return <BOMDetailsPage />;
    case "outboundTooling-create":
      return <OutBoundToolingCreatePage />;
    case "outboundTooling-return":
      return <OutBoundToolingReturnPage />;
    case "outboundTooling-details":
      return <OutboundToolingDetailsPage />;
    case "outboundSemifg-details":
      return <OutboundSemiDetailPage />;
    case "tracking-shipment":
      return <TrackingShipmentPage />;
    case "rolefactory":
      return <RoleFactoryPage />;
    case "tran-raw-details":
      return <InbTranRawDetailsPage />;
    case "tran-fg-details":
      return <InbTranFGDetailsPage />;
    case "tran-tooling-details":
      return <InbTranToolingDetailsPage />;
    case "tran-semi-details":
      return <InbTranSemiFGDetailsPage />;
    case "outbtran-raw-details":
      return <OutbTranRawDetailsPage />;
    case "outbtran-semi-details":
      return <OutbTranSemiDetailsPage />;
    case "outbtran-fg-details":
      return <OutbTranFGDetailsPage />;
    case "outbtran-tooling-details":
      return <OutbTranToolingDetailsPage />;
    
    


    // for menu generate
    case "confirm":
      return <ConfirmSendingPage />;
    case "confirmsemi":
      return <ConfirmSemiFGPage />;
    case "notishelf":
      return <NotiShelfPage />;
    case "notimini":
      return <NotiMinimumPage />;
    case "notitooling":
      return <NotiToolingPage />;
    case "notiapprove":
      return <NotiApprovePage />;
    case "factory":
      return <FactoryPage />;
    case "employee":
      return <EmployeePage />;
    case "role":
      return <RolePage />;
    case "warehouse":
      return <WareHouesPage />;
    case "zone":
      return <ZonePage />;
    case "location":
      return <LocationPage />;
    case "supplier":
      return <SupplierPage />;
    case "dockyard":
      return <DockYardPage />;
    case "unit":
      return <UnitPage />;
    case "raw":
      return <RawPage />;
    case "finishedgood":
      return <FGPage />;
    case "tooling":
      return <ToolingPage />;
    case "semi":
      return <SemiPage />;
    case "criterion":
      return <CriterionPage />;
    case "semifg":
      return <SemiFGPage />;
    case "rawinfo":
      return <RawInfoPage />;
    case "fginfo":
      return <FgInfoPage />;
    case "toolinginfo":
      return <ToolingInfoPage />;
    case "inrawmaterial":
      return <InboundRawMaterialPage />;
    case "inboundfg":
      return <InboundFGPage />;
    case "inboundtooling":
      return <InboundToolingPage />;
    case "inbsemifg":
      return <InboundSemiFGPage />;
    case "outboundraw":
      return <OutboundRawMaterialPage />;
    case "outboundfg":
      return <OutboundFGPage />;
    case "outboundtooling":
      return <OutboundToolingPage />;
    case "outboundsemifg":
      return <OutboundSemiFGPage />;
    case "invraw":
      return <InventoryRawPage />;
    case "invsemifg":
      return <InventorySemiPage />;
    case "invfg":
      return <InventoryFGPage />;
    case "invtooling":
      return <InventoryToolingPage />;
    case "inbraw":
      return <InbTranRawMaterialPage />;
    case "inbfg":
      return <InbTranFGPage />;
    case "inbsemi":
      return <InbTranSemiFGPage />;
    case "inbtooling":
      return <InbTranToolingPage />;
    case "outbraw":
      return <OutbTranRawMaterialPage />;
    case "outbsemi":
      return <OutbTranSemiFGPage />;
    case "outbfg":
      return <OutbTranFGPage />;
    case "outbtooling":
      return <OutbTranToolingPage />;
    


    // เพิ่มกรณีสำหรับ components อื่นๆ
    default:
      return null;
  }
};

const getIcon = (menuKey) => {
  switch (menuKey) {
    case "home":
      return <Icon fontSize="medium">home</Icon>;
    case "login":
      return <Icon fontSize="medium">login</Icon>;
    case "data":
      return <Icon fontSize="medium">grid_view</Icon>;
    case "setting":
      return <Icon fontSize="medium"></Icon>;
    case "bom":
      return <Icon fontSize="medium">receipt_long</Icon>; 
    case "inbound":
      return <Icon fontSize="medium">move_to_inbox</Icon>;
    case "outbound":
      return <Icon fontSize="medium">outbox</Icon>;
    case "track":
      return <Icon fontSize="medium">local_shipping</Icon>;
    case "pickupwithdraw":
      return <Icon fontSize="medium">inventory_2</Icon>;
    case "confirm":
      return <Icon fontSize="medium">inventory</Icon>;
    case "confirmsemi":
      return <Icon fontSize="medium">inventory</Icon>;
    case "inventory":
      return <Icon fontSize="medium">warehouse</Icon>;
    case "noti":
      return <Icon fontSize="medium">notifications</Icon>;
    case "inbtransaction":
      return <Icon fontSize="medium">move_to_inbox</Icon>;
    case "outbtransaction":
      return <Icon fontSize="medium">outbox</Icon>;
      

      // for menu generate
      case "notimini":
        return <Icon fontSize="medium">notifications</Icon>;
      case "notitooling":
        return <Icon fontSize="medium">notifications</Icon>;
      case "notiapprove":
        return <Icon fontSize="medium">notifications</Icon>;
      case "notishelf":
        return <Icon fontSize="medium">notifications</Icon>;
      case "inrawmaterial":
        return <Icon fontSize="medium">archive</Icon>;
      case "inboundfg":
        return <Icon fontSize="medium">archive</Icon>;
      case "inboundtooling":
        return <Icon fontSize="medium">archive</Icon>;
      case "inbsemifg":
        return <Icon fontSize="medium">archive</Icon>;
      case "inbraw":
        return <Icon fontSize="medium">archive</Icon>;
      case "inbfg":
        return <Icon fontSize="medium">archive</Icon>;
      case "inbtooling":
        return <Icon fontSize="medium">archive</Icon>;
      case "inbsemi":
        return <Icon fontSize="medium">archive</Icon>;
      case "outbraw":
        return <Icon fontSize="medium">unarchive</Icon>;
      case "outbfg":
        return <Icon fontSize="medium">unarchive</Icon>;
      case "outbtooling":
        return <Icon fontSize="medium">unarchive</Icon>;
      case "outbsemi":
        return <Icon fontSize="medium">unarchive</Icon>;
      case "invraw":
        return <Icon fontSize="medium">inventory_2</Icon>;
      case "invsemifg":
        return <Icon fontSize="medium">inventory_2</Icon>;
      case "invfg":
        return <Icon fontSize="medium">inventory_2</Icon>;
      case "invtooling":
        return <Icon fontSize="medium">inventory_2</Icon>;
      case "outboundraw":
        return <Icon fontSize="medium">unarchive</Icon>;
      case "outboundfg":
        return <Icon fontSize="medium">unarchive</Icon>;
      case "outboundtooling":
        return <Icon fontSize="medium">unarchive</Icon>;
      case "outboundsemifg":
        return <Icon fontSize="medium">unarchive</Icon>;






        case "factory":
          return <Icon fontSize="medium">settings</Icon>;
        case "warehouse":
          return <Icon fontSize="medium">settings</Icon>;
        case "zone":
          return <Icon fontSize="medium">settings</Icon>;
        case "location":
          return <Icon fontSize="medium">settings</Icon>;
        case "supplier":
          return <Icon fontSize="medium">settings</Icon>;
        case "dockyard":
          return <Icon fontSize="medium">settings</Icon>;
        case "unit":
          return <Icon fontSize="medium">settings</Icon>;
        case "raw":
          return <Icon fontSize="medium">settings</Icon>;
        case "finishedgood":
          return <Icon fontSize="medium">settings</Icon>;
        case "tooling":
          return <Icon fontSize="medium">settings</Icon>;
        case "semi":
          return <Icon fontSize="medium">settings</Icon>;
        case "criterion":
          return <Icon fontSize="medium">settings</Icon>;
        case "rawinfo":
          return <Icon fontSize="medium">settings</Icon>;
        case "semifg":
          return <Icon fontSize="medium">settings</Icon>;
        case "fginfo":
          return <Icon fontSize="medium">settings</Icon>;
        case "toolinginfo":
          return <Icon fontSize="medium">settings</Icon>;
     
     



      case "role":
        return <Icon fontSize="medium">admin_panel_settings</Icon>;

     
    default:
      return <Icon fontSize="medium">fiber_manual_record</Icon>;
  }
};

// กำหนด route ที่ไม่ได้อยู่ใน menu database
const initialRoutes = [
  {
    type: "collapse",
    name: "menu.home",
    key: "home",
    icon: getIcon("home"),
    route: "/home",
    component: getComponent("home"),
    noCollapse: true,
  },


  {
    name: "menu.login",
    key: "login",
    route: "/login",
    component: getComponent("login"),

  },
  {
    name: "menu.logout",
    key: "logout",
    route: "/logout",
    component: getComponent("logout"),
  },

  {
    name: "menu.role-edit",
    key: "role-edit",
    route: "/role-edit",
    component: getComponent("role-edit"),
  },


  {
    name: "menu.employee-edit",
    key: "employee-edit",
    route: "/employee-edit",
    component: getComponent("employee-edit"),
  },
  {
    name: "menu.inrawadd",
    key: "inboundraw-add",
    route: "/inboundraw-add",
    component: getComponent("inboundraw-add"),
  },
  {
    name: "menu.inrawdetails",
    key: "inboundraw-details",
    route: "/inboundraw-details",
    component: getComponent("inboundraw-details"),
  },
  {
    name: "menu.infgadd",
    key: "inboundFG-add",
    route: "/inboundFG-add",
    component: getComponent("inboundFG-add"),
  },
  {
    name: "menu.infgdetails",
    key: "inboundFG-details",
    route: "/inboundFG-details",
    component: getComponent("inboundFG-details"),
  },
  {
    name: "menu.intoolingadd",
    key: "inboundTooling-add",
    route: "/inboundTooling-add",
    component: getComponent("inboundTooling-add"),
  },
  {
    name: "menu.intoolingDetails",
    key: "inboundTooling-details",
    route: "/inboundTooling-details",
    component: getComponent("inboundTooling-details"),
  },
  {
    name: "menu.inSemifgadd",
    key: "inboundSemiFG-add",
    route: "/inboundSemiFG-add",
    component: getComponent("inboundSemiFG-add"),
  },
  {
    name: "menu.inSemifgdetails",
    key: "inboundSemiFG-details",
    route: "/inboundSemiFG-details",
    component: getComponent("inboundSemiFG-details"),
  },
  {
    name: "menu.outboundRawcreate",
    key: "outboundRaw-create",
    route: "/outboundRaw-create",
    component: getComponent("outboundRaw-create"),
  },
  {
    name: "menu.outboundRawDetails",
    key: "outboundRaw-details",
    route: "/outboundRaw-details",
    component: getComponent("outboundRaw-details"),
  },
  {
    name: "menu.outboundFgCreate",
    key: "outboundFg-create",
    route: "/outboundFg-create",
    component: getComponent("outboundFg-create"),
  },
  {
    name: "menu.outboundFgDetails",
    key: "outboundFg-details",
    route: "/outboundFg-details",
    component: getComponent("outboundFg-details"),
  },
  {
    name: "menu.outboundSemiFGCreate",
    key: "outboundSemiFG-create",
    route: "/outboundSemiFG-create",
    component: getComponent("outboundSemiFG-create"),
  },
  {
    name: "menu.bomCreate",
    key: "bom-create",
    route: "/bom-create",
    component: getComponent("bom-create"),
  },
  {
    name: "menu.bomDetails",
    key: "bom-details",
    route: "/bom-details",
    component: getComponent("bom-details"),
  },
  {
    name: "menu.outboundToolingCreate",
    key: "outboundTooling-create",
    route: "/outboundTooling-create",
    component: getComponent("outboundTooling-create"),
  },
  {
    name: "menu.outboundToolingReturn",
    key: "outboundTooling-return",
    route: "/outboundTooling-return",
    component: getComponent("outboundTooling-return"),
  },
  {
    name: "menu.outboundToolingDetails",
    key: "outboundTooling-details",
    route: "/outboundTooling-details",
    component: getComponent("outboundTooling-details"),
  },
  {
    name: "menu.outboundSemifgDetails",
    key: "outboundSemifg-details",
    route: "/outboundSemifg-details",
    component: getComponent("outboundSemifg-details"),
  },
  {
    name: "menu.trackingShipment",
    key: "tracking-shipment",
    route: "/tracking-shipment",
    component: getComponent("tracking-shipment"),
  },
  {
    name: "menu.withdraw",
    key: "withdraw",
    route: "/withdraw",
    component: getComponent("withdraw"),
  },
  {
    name: "menu.rolefactory",
    key: "rolefactory",
    route: "/rolefactory",
    component: getComponent("rolefactory"),
  },
  {
    name: "menu.confirm-wd",
    key: "confirm-wd",
    route: "/confirm-wd",
    component: getComponent("confirm-wd"),
  },
  {
    name: "menu.confirm-semi-wd",
    key: "confirm-semi-wd",
    route: "/confirm-semi-wd",
    component: getComponent("confirm-semi-wd"),
  },
  {
    name: "menu.confirm-deli",
    key: "confirm-deli",
    route: "/confirm-deli",
    component: getComponent("confirm-deli"),
  },
  {
    name: "menu.confirm-semi-deli",
    key: "confirm-semi-deli",
    route: "/confirm-semi-deli",
    component: getComponent("confirm-semi-deli"),
  },
  {
    name: "menu.notiAppWithdraw",
    key: "noti-app-withdraw",
    route: "/noti-app-withdraw",
    component: getComponent("noti-app-withdraw"),
  },
  {
    name: "menu.tranraw-details",
    key: "tran-raw-details",
    route: "/tran-raw-details",
    component: getComponent("tran-raw-details"),
  },
  {
    name: "menu.tranfg-details",
    key: "tran-fg-details",
    route: "/tran-fg-details",
    component: getComponent("tran-fg-details"),
  },
  {
    name: "menu.transemi-details",
    key: "tran-semi-details",
    route: "/tran-semi-details",
    component: getComponent("tran-semi-details"),
  },
  {
    name: "menu.trantooling-details",
    key: "tran-tooling-details",
    route: "/tran-tooling-details",
    component: getComponent("tran-tooling-details"),
  },
  {
    name: "menu.outbtranraw-details",
    key: "outbtran-raw-details",
    route: "/outbtran-raw-details",
    component: getComponent("outbtran-raw-details"),
  },

  {
    name: "menu.outbtransemi-details",
    key: "outbtran-semi-details",
    route: "/outbtran-semi-details",
    component: getComponent("outbtran-semi-details"),
  },
  {
    name: "menu.outbtranfg-details",
    key: "outbtran-fg-details",
    route: "/outbtran-fg-details",
    component: getComponent("outbtran-fg-details"),
  },
  {
    name: "menu.outbtrantooling-details",
    key: "outbtran-tooling-details",
    route: "/outbtran-tooling-details",
    component: getComponent("outbtran-tooling-details"),
  },





];

const initialRoutesTest = [
  { type: "divider", key: "divider-2" },
  // {
  //   type: "collapse",
  //   name: "Test page for aek",
  //   key: "testpage-aek",
  //   route: "/testpage-aek",
  //   component: getComponent('testpage-aek'),
  //   noCollapse: true,
  // },
  // {
  //   type: "collapse",
  //   name: "Test page for labform",
  //   key: "testpage-labform",
  //   route: "/testpage-labform",
  //   icon: getIcon('testpage-labform'),
  //   component: getComponent('testpage-labform'),
  //   noCollapse: true,
  // },
];

// const initialRoutesStart = [
//   {
//     name: "menu.home",
//     key: "home",
//     icon: getIcon('home'),
//     route: "/home",
//     component: getComponent('home'),
//     noCollapse: true,
//   },
 

  
//   //{ type: "divider", key: "divider-2" },
//   // เพิ่ม static routes อื่นๆ ตามต้องการ
// ];

// const initialRoutesEnd = [
//   //{ type: "divider", key: "divider-2" },
//   {
//     name: "menu.login",
//     key: "login",
//     route: "/login",
//     component: getComponent('login'),

//   },
//   {
//     name: "menu.logout",
//     key: "logout",
//     route: "/logout",
//     component: getComponent('logout'),

//   },
// ];

const transformRoute =  (route) => ({
  type: route.type,
  name: route.name,
  key: route.key,
  icon: getIcon(route.key),
  route: route.route,
  menu_id: route.menu_id, // เพิ่มส่ง menu_id
  // ปรับการสร้าง route URL เพื่อใส่ menu_id เข้าไปใน route
  //route: route.route ? `${route.route}/${route.menu_id}` : undefined,  // เพิ่ม menu_id เข้าไปใน route
  // เพิ่ม Query Parameters ใน route
  //route: `${route.route}?menu_id=${route.menu_id}`, // เพิ่ม menu_id เป็น query parameter
  component: getComponent(route.key),
  noCollapse: route.noCollapse,
  collapse: Array.isArray(route.collapse) && route.collapse.length > 0
    ? route.collapse.map(subRoute => transformRoute(subRoute))
    : undefined,
});

export async function  generateRoutesFromApi(apiRoutes) {
  const apiRoutesTransformed = await apiRoutes.map(transformRoute);
  return [  ...initialRoutes,...apiRoutesTransformed,...initialRoutesTest ];
}


/* export function getInitialRoutes() {

  return [ initialRoutes];
} */

export { initialRoutes};






// Material Dashboard 2 PRO React layouts
// import Analytics from "layouts/dashboards/analytics";
// import Sales from "layouts/dashboards/sales";
// import ProfileOverview from "layouts/pages/profile/profile-overview";
// import AllProjects from "layouts/pages/profile/all-projects";
// import NewUser from "layouts/pages/users/new-user";
// import Settings from "layouts/pages/account/settings";
// import Billing from "layouts/pages/account/billing";
// import Invoice from "layouts/pages/account/invoice";
// import Timeline from "layouts/pages/projects/timeline";
// import PricingPage from "layouts/pages/pricing-page";
// import Widgets from "layouts/pages/widgets";
// import RTL from "layouts/pages/rtl";
// import Charts from "layouts/pages/charts";
// import Notifications from "layouts/pages/notifications";
// import Kanban from "layouts/applications/kanban";
// import Wizard from "layouts/applications/wizard";
// import DataTables from "layouts/applications/data-tables";
// import Calendar from "layouts/applications/calendar";
// import NewProduct from "layouts/ecommerce/products/new-product";
// import EditProduct from "layouts/ecommerce/products/edit-product";
// import ProductPage from "layouts/ecommerce/products/product-page";
// import OrderList from "layouts/ecommerce/orders/order-list";
// import OrderDetails from "layouts/ecommerce/orders/order-details";
// import SignInBasic from "layouts/authentication/sign-in/basic";
// import SignInCover from "layouts/authentication/sign-in/cover";
// import SignInIllustration from "layouts/authentication/sign-in/illustration";
// import SignUpCover from "layouts/authentication/sign-up/cover";
// import ResetCover from "layouts/authentication/reset-password/cover";


// // Lab-Page
// import BlankPage from "layouts/Lab/blank";
// import Login from "layouts/Lab/login";
// import Signup from "layouts/Lab/sign-up";
// import Addcustomer from "layouts/Lab/customer/addcustomer";
// import CheckList from "layouts/Lab/checklist";
// import Listcustomer from "layouts/Lab/customer/listcustomer";
// import Infocustomer from "layouts/Lab/customer/recordcustomer";
// import TestPage from "layouts/Lab/testpage";
// import Formlab from "layouts/Lab/form-lab/form-lab";
// import TestPageAek from "layouts/Lab/testpage-aek";
// import SettingHospital from "layouts/Lab/setting-hospital";
// import SettingLabPrice from "layouts/Lab/setting-price";
// import Employee from "layouts/Lab/employee";
// import Editemployee from "layouts/Lab/employee/edit-employee";
// import LabHeader from "layouts/Lab/lab_form_header/index.js";
// import Editlabform from "layouts/Lab/lab_form_header/edit-lab-header.js";
// // Material Dashboard 2 PRO React components
// import MDAvatar from "components/MDAvatar";
// import TestPageNan from "./layouts/Lab/testpage-nan/indexnan.js";

// // @mui icons
// import Icon from "@mui/material/Icon";

// // Images
// import profilePicture from "assets/images/team-3.jpg";

// import React, { useEffect, useState ,useContext} from 'react';
// import axios from 'axios';


// // ภาษา language
// import * as lang from "utils/langHelper.js"


// const routes = [
//   // {
//   //   type: "collapse",
//   //   name: "Brooklyn Alice",
//   //   key: "brooklyn-alice",
//   //   icon: <MDAvatar src={profilePicture} alt="Brooklyn Alice" size="sm" />,
//   //   collapse: [
//   //     {
//   //       name: "My Profile",
//   //       key: "my-profile",
//   //       route: "/pages/profile/profile-overview",
//   //       component: <ProfileOverview />,
//   //     },
//   //     {
//   //       name: "Settings",
//   //       key: "profile-settings",
//   //       route: "/pages/account/settings",
//   //       component: <Settings />,
//   //     },
//   //     {
//   //       name: "Logout",
//   //       key: "logout",
//   //       route: "/authentication/sign-in/basic",
//   //       component: <SignInBasic />,
//   //     },
//   //   ],
//   // },
//   // { type: "divider", key: "divider-0" },
//   {
//     type: "collapse",
//     name: "Dashboards",
//     key: "dashboards",
//     icon: <Icon fontSize="medium">dashboard</Icon>,
//     collapse: [
//       {
//         name: "Analytics",
//         key: "analytics",
//         route: "/dashboards/analytics",
//         component: <Analytics />,
//       },
//       {
//         name: "Sales",
//         key: "sales",
//         route: "/dashboards/sales",
//         component: <Sales />,
//       },
//     ],
//   },
//   { type: "title", title: "Pages", key: "title-pages" },
//   {
//     type: "collapse",
//     name: "Pages",
//     key: "pages",
//     icon: <Icon fontSize="medium">image</Icon>,
//     collapse: [
//       {
//         name: "Profile",
//         key: "profile",
//         collapse: [
//           {
//             name: "Profile Overview",
//             key: "profile-overview",
//             route: "/pages/profile/profile-overview",
//             component: <ProfileOverview />,
//           },
//           {
//             name: "All Projects",
//             key: "all-projects",
//             route: "/pages/profile/all-projects",
//             component: <AllProjects />,
//           },
//         ],
//       },
//       {
//         name: "Users",
//         key: "users",
//         collapse: [
//           {
//             name: "New User",
//             key: "new-user",
//             route: "/pages/users/new-user",
//             component: <NewUser />,
//           },
//         ],
//       },
//       {
//         name: "Account",
//         key: "account",
//         collapse: [
//           {
//             name: "Settings",
//             key: "settings",
//             route: "/pages/account/settings",
//             component: <Settings />,
//           },
//           {
//             name: "Billing",
//             key: "billing",
//             route: "/pages/account/billing",
//             component: <Billing />,
//           },
//           {
//             name: "Invoice",
//             key: "invoice",
//             route: "/pages/account/invoice",
//             component: <Invoice />,
//           },
//         ],
//       },
//       {
//         name: "Projects",
//         key: "projects",
//         collapse: [
//           {
//             name: "Timeline",
//             key: "timeline",
//             route: "/pages/projects/timeline",
//             component: <Timeline />,
//           },
//         ],
//       },
//       {
//         name: "Pricing Page",
//         key: "pricing-page",
//         route: "/pages/pricing-page",
//         component: <PricingPage />,
//       },
//       { name: "RTL", key: "rtl", route: "/pages/rtl", component: <RTL /> },
//       { name: "Widgets", key: "widgets", route: "/pages/widgets", component: <Widgets /> },
//       { name: "Charts", key: "charts", route: "/pages/charts", component: <Charts /> },
//       {
//         name: "Notfications",
//         key: "notifications",
//         route: "/pages/notifications",
//         component: <Notifications />,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     name: "Applications",
//     key: "applications",
//     icon: <Icon fontSize="medium">apps</Icon>,
//     collapse: [
//       {
//         name: "Kanban",
//         key: "kanban",
//         route: "/applications/kanban",
//         component: <Kanban />,
//       },
//       {
//         name: "Wizard",
//         key: "wizard",
//         route: "/applications/wizard",
//         component: <Wizard />,
//       },
//       {
//         name: "Data Tables",
//         key: "data-tables",
//         route: "/applications/data-tables",
//         component: <DataTables />,
//       },
//       {
//         name: "Calendar",
//         key: "calendar",
//         route: "/applications/calendar",
//         component: <Calendar />,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     name: "Ecommerce",
//     key: "ecommerce",
//     icon: <Icon fontSize="medium">shopping_basket</Icon>,
//     collapse: [
//       {
//         name: "Products",
//         key: "products",
//         collapse: [
//           {
//             name: "New Product",
//             key: "new-product",
//             route: "/ecommerce/products/new-product",
//             component: <NewProduct />,
//           },
//           {
//             name: "Edit Product",
//             key: "edit-product",
//             route: "/ecommerce/products/edit-product",
//             component: <EditProduct />,
//           },
//           {
//             name: "Product Page",
//             key: "product-page",
//             route: "/ecommerce/products/product-page",
//             component: <ProductPage />,
//           },
//         ],
//       },
//       {
//         name: "Orders",
//         key: "orders",
//         collapse: [
//           {
//             name: "Order List",
//             key: "order-list",
//             route: "/ecommerce/orders/order-list",
//             component: <OrderList />,
//           },
//           {
//             name: "Order Details",
//             key: "order-details",
//             route: "/ecommerce/orders/order-details",
//             component: <OrderDetails />,
//           },
//         ],
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     name: "Authentication",
//     key: "authentication",
//     icon: <Icon fontSize="medium">content_paste</Icon>,
//     collapse: [
//       {
//         name: "Sign In",
//         key: "sign-in",
//         collapse: [
//           {
//             name: "Basic",
//             key: "basic",
//             route: "/authentication/sign-in/basic",
//             component: <SignInBasic />,
//           },
//           {
//             name: "Cover",
//             key: "cover",
//             route: "/authentication/sign-in/cover",
//             component: <SignInCover />,
//           },
//           {
//             name: "Illustration",
//             key: "illustration",
//             route: "/authentication/sign-in/illustration",
//             component: <SignInIllustration />,
//           },
//         ],
//       },
//       {
//         name: "Sign Up",
//         key: "sign-up",
//         collapse: [
//           {
//             name: "Cover",
//             key: "cover",
//             route: "/authentication/sign-up/cover",
//             component: <SignUpCover />,
//           },
//         ],
//       },
//       {
//         name: "Reset Password",
//         key: "reset-password",
//         collapse: [
//           {
//             name: "Cover",
//             key: "cover",
//             route: "/authentication/reset-password/cover",
//             component: <ResetCover />,
//           },
//         ],
//       },
//     ],
//   },
//   { type: "divider", key: "divider-2" },
//   { type: "title", title: "Lab", key: "lab" },
//   {
//     type: "collapse",
//     name: "Customer",
//     key: "Customer",
//     icon: <Icon fontSize="medium">content_paste</Icon>,
//     collapse: [
//           {
//             name: "ลงทะเบียน",
//             key: "add",
//             route: "/customer/add",
//             component: <Addcustomer />,
//           },
//           {
//             name: "รายชื่อลูกค้า",
//             key: "list",
//             route: "/customer/list",
//             component: <Listcustomer />,
//           },
//           {
//             name: "ข้อมูลลูกค้า",
//             key: "custdata",
//             route: "/customer/custdata",
//             component: <Infocustomer />,
//           },
//           // {
//           //   name: "delete",
//           //   key: "signup",
//           //   route: "/user/signup",
//           //   component: <Signup />,
//           // },
//           // {
//           //   name: "Setting",
//           //   key: "setuser",
//           //   route: "/user/setting",
//           //   component: <Setuser />,
//           // },
//         ]
//   },
//   {
//     type: "collapse",
//     name: "blank",
//     key: "blank",
//     icon: <Icon fontSize="medium">content_paste</Icon>,
//     route: "/blank",
//     component: <BlankPage />,
//     noCollapse: true,
//   },
//   {
//     type: "collapse",
//     name: "Check List",
//     key: "checklist",
//     icon: <Icon fontSize="medium">content_paste</Icon>,
//     route: "/checklist",
//     component: <CheckList />,
//     noCollapse: true,
//   },
//   // {
//   //   type: "collapse",
//   //   name: "login",
//   //   key: "login",
//   //   icon: <Icon fontSize="medium">receipt_long</Icon>,
//   //   route: "/login",
//   //   component: <Login />,
//   //   noCollapse: true,
//   // },

//   {
//     type: "collapse",
//     name: "User",
//     key: "user",
//     icon: <Icon fontSize="medium">content_paste</Icon>,
//     collapse: [
//           {
//             name: "Log-in",
//             key: "login",
//             route: "/user/login",
//             component: <Login />,
//           },
//           {
//             name: "Sign-Up",
//             key: "signup",
//             route: "/user/signup",
//             component: <Signup />,
//           },
//           // {
//           //   name: "Setting",
//           //   key: "setuser",
//           //   route: "/user/setting",
//           //   component: <Setuser />,
//           // },
//         ]
//   },
  
//   {
//     type: "collapse",
//     name: "testPage",
//     key: "testPage",
//     icon: <Icon fontSize="medium">BeachAccessIcon</Icon>,
//     route: "/Testpage",
//     component: <TestPage />,
//     noCollapse: true,
//   },
//   {
//     type: "collapse",
//     name: "testPageAek",
//     key: "testPageAek",
//     icon: <Icon fontSize="medium">BeachAccessIcon</Icon>,
//     route: "/TestpageAek",
//     component: <TestPageAek />,
//     noCollapse: true,
//   },
//   {
//     type: "collapse",
//     name: "testPageNan",
//     key: "testPageNan",
//     icon: <Icon fontSize="medium">BeachAccessIcon</Icon>,
//     route: "/TestPageNan",
//     component: <TestPageNan />,
//     noCollapse: true,
//   },
//   {
//     type: "collapse",
//     name: "formlab",
//     key: "formlab",
//     icon: <Icon fontSize="medium">BeachAccessIcon</Icon>,
//     route: "/Formlab",
//     component: <Formlab />,
//     noCollapse: true,
//   },
//   {
//     type: "collapse",
  
//     name: "settingHospital",
//     key: "settingHospital",
//     icon: <Icon fontSize="medium">BeachAccessIcon</Icon>,
//     route: "/SettingHospital",
//     component: <SettingHospital/>,
//     noCollapse: true,
//   },
  
//   {
//     type: "collapse",
  
//     name: "SettingLabPrice",
//     key: "SettingLabPrice",
//     icon: <Icon fontSize="medium">BeachAccessIcon</Icon>,
//     route: "/SettingLabPrice",
//     component: <SettingLabPrice/>,
//     noCollapse: true,
//   },
  
//   {
//     type: "collapse",
  
//     name: "Employee",
//     key: "Employee",
//     icon: <Icon fontSize="medium">BeachAccessIcon</Icon>,
//     route: "/employee",
//     component: <Employee/>,
//     noCollapse: true,
//   },
  
  
//   {
//     type: "collapse",
  
//     name: "Editemployee",
//     key: "Editemployee",
//     icon: <Icon fontSize="medium">BeachAccessIcon</Icon>,
//     route: "/Editemployee",
//     component: <Editemployee/>,
//     noCollapse: true,
//   },
  
  
//   {
//     type: "collapse",
  
//     name: "LabHeader",
//     key: "LabHeader",
//     icon: <Icon fontSize="medium">BeachAccessIcon</Icon>,
//     route: "/LabHeader",
//     component: <LabHeader/>,
//     noCollapse: true,
//   },
  
//   {
//     type: "collapse",
  
//     name: "Editlabform",
//     key: "Editlabform",
//     icon: <Icon fontSize="medium">BeachAccessIcon</Icon>,
//     route: "/Editlabform",
//     component: <Editlabform/>,
//     noCollapse: true,
//   },

//   { type: "divider", key: "divider-2" },
//   { type: "title", title: "Lab Form", key: "lab" },
//   {
//     type: "collapse",
//     name: "ตั้งค่าพื้นฐาน",
//     key: "menu",
//     icon: <Icon fontSize="medium">content_paste</Icon>,
//     collapse: [
//             {
//               name: "รายชื่อลูกค้า",
//               key: "list",
//               route: "/customer/list",
//               component: <Listcustomer />,
//             },
//             {
//               name: "ข้อมูลโรงพยาบาล/คลินิก",
//               key: "settingHospital",
//               route: "/SettingHospital",
//               component: <SettingHospital/>,
//             },
//             {
//               name: "ตั้งราคา LAB",
//               key: "SettingLabPrice",
//               route: "/SettingLabPrice",
//               component: <SettingLabPrice/>,
//             },
//             {
//               name: "หัวออกรีพอร์ต LAB",
//               key: "LabHeader",
//               route: "/LabHeader",
//               component: <LabHeader/>,
//             },
//             {
//               name: "ข้อมูลพนักงาน",
//               key: "Employee",
//               route: "/employee",
//               component: <Employee/>,
//             },
            
//     ]
//   }
// ];

// export default routes;






/* 
const getComponent = (componentName) => {
  if (componentName === "Laboratory") {
    return <Laboratory />;
  } else if (componentName === "CheckList") {
    return <CheckList />;
  } else if (componentName === "Infocustomer") {
    return <Infocustomer />;
  } else if (componentName === "SettingHospital") {
    return <SettingHospital />;
  } else if (componentName === "SettingLabPrice") {
    return <SettingLabPrice />;
  } else if (componentName === "LabHeader") {
    return <LabHeader />;
  } else if (componentName === "Employee") {
    return <Employee />;
  } else if (componentName === "Role") {
    return <Role />;
  } else if (componentName === "Login") {
    return <Login />;
  } else if (componentName === "Signup") { // เพิ่มเงื่อนไขนี้
    return <Signup />;
  } else if (componentName === "BlankPage") {
    return <BlankPage />;
  } else {
    return null; // ถ้าไม่ตรงกับ component ที่รู้จัก ให้ส่งกลับเป็น null
  }
};


// ฟังก์ชันเพื่อแปลง icon
const getIcon = (iconName) => {
  if (iconName === "content_paste") {
    return <Icon fontSize="medium">content_paste</Icon>;
  }
  return <Icon fontSize="medium">default_icon</Icon>; // เพิ่ม icon ค่าเริ่มต้นถ้าไม่มี icon ที่รู้จัก
};


// ฟังก์ชันสำหรับแปลง routes จาก API ให้เป็นรูปแบบที่ใช้งานได้ใน React
// export function generateRoutesFromApi(apiRoutes) {
//   const apiRoutesTransformed = apiRoutes.map((route) => ({
//     type: route.type,
//     name: route.name,
//     key: route.key,
//     icon: getIcon(route.icon), // แปลง icon โดยใช้ฟังก์ชัน getIcon
//     route: route.route,
//     component: getComponent(route.component), // แปลง component โดยใช้ฟังก์ชัน getComponent
//     noCollapse: route.noCollapse,
//     collapse: route.collapse
//       ? route.collapse.map((subRoute) => ({
//           ...subRoute,
//           icon: getIcon(subRoute.icon), // แปลง sub-icon
//           component: getComponent(subRoute.component), // แปลง sub-component
//         }))
//       : [],
//   }));

//   routes =  [...routes, ...apiRoutesTransformed];
//   return routes; // รวม static routes กับ apiRoutes
// }


//version รองรับ 3 รอบ
// export function generateRoutesFromApi(apiRoutes) {
//   const apiRoutesTransformed = apiRoutes.map((route) => ({
//     type: route.type,
//     name: route.name,
//     key: route.key,
//     icon: getIcon(route.icon), // แปลง icon โดยใช้ฟังก์ชัน getIcon
//     route: route.route,
//     component: getComponent(route.component), // แปลง component โดยใช้ฟังก์ชัน getComponent
//     noCollapse: route.noCollapse,
//     collapse: route.collapse
//       ? route.collapse.map((subRoute) => ({
//           ...subRoute,
//           icon: getIcon(subRoute.icon), // แปลง sub-icon
//           component: getComponent(subRoute.component), // แปลง sub-component
//           collapse: subRoute.collapse
//             ? subRoute.collapse.map((innerSubRoute) => ({
//                 ...innerSubRoute,
//                 icon: getIcon(innerSubRoute.icon), // แปลง inner-sub-icon
//                 component: getComponent(innerSubRoute.component), // แปลง inner-sub-component
//               }))
//             : [], // ถ้าไม่มี collapse ซ้อนก็ส่ง array ว่าง
//         }))
//       : [], // ถ้าไม่มี collapse ก็ส่ง array ว่าง
//   }));

//   routes = [...routes, ...apiRoutesTransformed]; // รวม static routes กับ apiRoutes
//   return routes; // ส่งผลลัพธ์ routes กลับไป
// }
let routes = [
  {
    type: "collapse",
    name: "blank",
    key: "blank",
    icon: <Icon fontSize="medium">content_paste</Icon>,
    route: "/blank",
    component: getComponent('BlankPage'),
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "User",
    key: "user",
    icon: <Icon fontSize="medium">content_paste</Icon>,
    collapse: [
      {
        name: "Log-in",
        key: "login",
        route: "/user/login",
        component: getComponent('Login'),
      },
      {
        name: "Sign-Up",
        key: "signup",
        route: "/user/signup",
        component: getComponent('Signup'),
      },
    ]
  },
  // เพิ่ม routes อื่นๆ ตามต้องการ
];

export function generateRoutesFromApi(apiRoutes) {
  const apiRoutesTransformed = apiRoutes.map((route) => ({
    type: route.type,
    name: route.name,
    key: route.key,
    icon: getIcon(route.icon),
    route: route.route,
    component: getComponent(route.component),
    noCollapse: route.noCollapse,
    collapse: Array.isArray(route.collapse) && route.collapse.length > 0
      ? route.collapse.map((subRoute) => transformRoute(subRoute))
      : undefined,
  }));

  routes = [...routes, ...apiRoutesTransformed];
  return routes;
}

// ฟังก์ชัน recursive สำหรับจัดการ collapse หลายระดับ
function transformRoute(route) {
  return {
    ...route,
    icon: getIcon(route.icon),
    component: getComponent(route.component),
    collapse: Array.isArray(route.collapse) && route.collapse.length > 0 
      ? route.collapse.map((subRoute) => transformRoute(subRoute))
      : undefined,
  };
} */















  
  /* { type: "divider", key: "divider-2" },
  { type: "title", title: "Lab Form", key: "lab" },
  {
    type: "collapse",
    name: "ตั้งค่าพื้นฐาน",
    key: "menu",
    icon: <Icon fontSize="medium">content_paste</Icon>,
    collapse: [
            {
              name: "ข้อมูลลูกค้า",
              key: "custdata",
              route: "/customer/custdata",
              component: <Infocustomer />,
            },
            {
              name: "ข้อมูลโรงพยาบาล/คลินิก",
              key: "settingHospital",
              route: "/SettingHospital",
              component: <SettingHospital/>,
            },
            {
              name: "ตั้งราคา LAB",
              key: "SettingLabPrice",
              route: "/SettingLabPrice",
              component: <SettingLabPrice/>,
            },
            {
              name: "หัวออกรีพอร์ต LAB",
              key: "LabHeader",
              route: "/LabHeader",
              component: <LabHeader/>,
            },
            {
              name: "ข้อมูลพนักงาน",
              key: "Employee",
              route: "/employee",
              component: <Employee/>,
            },
            {
              name: "สิทธิ์การใช้งาน",
              key: "Role",
              route: "/Role",
              component: <Role/>,
            },

            
    ]
  }, */

  /* {
    type: "collapse",
    name: "Editrole",
    key: "Editrole",
    icon: <Icon fontSize="medium">content_paste</Icon>,
    route: "/Editrole",
    component: <Editrole />,
    noCollapse: true,
  },
  {
        type: "collapse",
      
        name: "Editlabform",
        key: "Editlabform",
        icon: <Icon fontSize="medium">content_paste</Icon>,
        route: "/Editlabform",
        component: <Editlabform/>,
        noCollapse: true,
      }, 

];*/


//export default routes;