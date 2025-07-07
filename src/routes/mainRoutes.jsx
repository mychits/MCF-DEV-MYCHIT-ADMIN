import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/authentication/ProtectedRoute";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Navbar from "../components/layouts/Navbar";
import Group from "../pages/Group";
import User from "../pages/User";
import Task from "../pages/Task";
import Target from "../pages/Target";
import EnrollmentRequestForm from "../pages/EnrollmentRequestForm";
import FilterGroups from "../pages/FilterGroups";
import EmployeeProfile from "../pages/EmployeeProfile";
import Staff from "../pages/Staff";
import Employee from "../pages/Employee";
import WeekGroup from "../pages/WeekGroup";
import Enroll from "../pages/Enroll";
import Loan from "../pages/Loan";
import Pigme from "../pages/Pigme";
import Auction from "../pages/Auction";
import Payment from "../pages/Payment";
import CollectionArea from "../pages/CollectionArea";
import Agent from "../pages/Agent";
import Lead from "../pages/Lead";
import LeadSetting from "../pages/LeadSetting";
import AppSettings from "../pages/AppSettings";
import GroupSettings from "../pages/GroupSettings";
import AdministrativePrivileges from "../pages/AdministrativePrivileges";
import AdminAccessRights from "../pages/AdminAccessRights";
import Marketing from "../pages/Marketing";
import Profile from "../pages/Profile";
import Daybook from "../pages/Daybook";
import SalesReport from "../pages/SalesReport";
import Receipt from "../pages/Receipt";
import GroupReport from "../pages/GroupReport";
import AllGroupReport from "../pages/AllGroupReport";
import AuctionReport from "../pages/AuctionReport";
import LeadReport from "../pages/LeadReport";
import UserReport from "../pages/UserReport";
import AllUserReport from "../pages/AllUserReport";
import LoanReport from "../pages/LoanReport";
import PigmeReport from "../pages/PigmeReport";
import EmployeeReport from "../pages/EmployeeReport";
import CommissionReport from "../pages/CommissionReport";
import EnrollmentReport from "../pages/EnrollmentReport";
import PaymentSummary from "../pages/PaymentSummary";
import WhatsappAdd from "../pages/WhatsappAdd";
import WhatsappFailed from "../pages/WhatsappFailed";
import DueMessage from "../pages/DueMessage";
import Reports from "../pages/Reports";
import LeadSettings from "../pages/LeadSettings";
import Designation from "../pages/Designation";
import PayOutMenu from "../pages/PayOutMenu";
import GeneralPaymentOut from "../pages/GeneralPaymentOut";
import Print from "../pages/Print";
import PayOutCommission from "../pages/PayOutCommission";
import PayOutPettyCash from "../pages/PayOutPettyCash";
import PayOutSalary from "../pages/PayOutSalary";
import PayOutReport from "../pages/PayoutReport";
import ErrorPage from "./error/ErrorPage";
import Guarantor from "../pages/Guarantor";
import DreamAsset from "../pages/DreamAsset";
import BecomeAgent from "../pages/BecomeAgent";
import PayOutOthers from "../pages/PayOutOthers";
import PayInMenu from "../pages/PayInMenu";
import RegistrationFee from "../pages/RegistrationFees";
import PrintPaymentOut from "../pages/PrintPaymentOut";
import RegistrationReceipt from "../pages/RegistrationReceipt";
const mainRoutes = createBrowserRouter([
  {
    path: "/",

    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <Navbar />
      </ProtectedRoute>
    ),
  },
    {
    path: "/reg-fee-print/:id",

    element: <RegistrationReceipt />,
  },

  {
    path: "/group",
    element: (
      <ProtectedRoute>
        <Group />
      </ProtectedRoute>
    ),
  },
   {
    path: "/pay-in-menu",
    element: (
      <ProtectedRoute>
        <PayInMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pay-in-menu/payment",
    element: (
      <ProtectedRoute>
        <Payment />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pay-in-menu/registration-fee",
    element: (
      <ProtectedRoute>
        <RegistrationFee />
      </ProtectedRoute>
    ),
  },
    {
    path: "/print-payment-out/:id",
    element: (
      <ProtectedRoute>
        <PrintPaymentOut />
      </ProtectedRoute>
    ),
  },

  {
    path: "/user",
    element: (
      <ProtectedRoute>
        <User />
      </ProtectedRoute>
    ),
  },
  {
    path: "/task",
    element: (
      <ProtectedRoute>
        <Task />
      </ProtectedRoute>
    ),
  },
  {
    path: "/target",
    element: (
      <ProtectedRoute>
        <Target />
      </ProtectedRoute>
    ),
  },
  {
    path: "/enrollment-request-form",
    element: <EnrollmentRequestForm />,
  },
  {
    path: "/guarantor",
    element: <Guarantor />,
  },
  {
    path: "/filter-groups",
    element: (
      <ProtectedRoute>
        <FilterGroups />
      </ProtectedRoute>
    ),
  },
  {
    path: "/employee-profile",
    element: (
      <ProtectedRoute>
        <EmployeeProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff",
    element: (
      <ProtectedRoute>
        <Staff />
      </ProtectedRoute>
    ),
  },
  {
    path: "/employee",
    element: (
      <ProtectedRoute>
        <Employee />
      </ProtectedRoute>
    ),
  },
  {
    path: "/week-group",
    element: (
      <ProtectedRoute>
        <WeekGroup />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user",
    element: (
      <ProtectedRoute>
        <User />
      </ProtectedRoute>
    ),
  },
  {
    path: "/enrollment",
    element: (
      <ProtectedRoute>
        <Enroll />
      </ProtectedRoute>
    ),
  },
  {
    path: "/loan",
    element: (
      <ProtectedRoute>
        <Loan />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pigme",
    element: (
      <ProtectedRoute>
        <Pigme />
      </ProtectedRoute>
    ),
  },
  {
    path: "/auction",
    element: (
      <ProtectedRoute>
        <Auction />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment",
    element: (
      <ProtectedRoute>
        <Payment />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pay-out-menu",
    element: (
      <ProtectedRoute>
        <PayOutMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/general-payment-out/:paymentType",
    element: (
      <ProtectedRoute>
        <GeneralPaymentOut />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-out/commission",
    element: (
      <ProtectedRoute>
        <PayOutCommission />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-out/salary",
    element: (
      <ProtectedRoute>
        <PayOutSalary />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-out/petty-Cash",
    element: (
      <ProtectedRoute>
        <PayOutPettyCash />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-out/others",
    element: (
      <ProtectedRoute>
        <PayOutOthers />
      </ProtectedRoute>
    ),
  },
  {
    path: "/collection-area-request",
    element: (
      <ProtectedRoute>
        <CollectionArea />
      </ProtectedRoute>
    ),
  },
  {
    path: "/agent",
    element: (
      <ProtectedRoute>
        <Agent />
      </ProtectedRoute>
    ),
  },

  {
    path: "/lead",
    element: (
      <ProtectedRoute>
        <Navbar />
        <Lead />
      </ProtectedRoute>
    ),
  },

  {
    path: "/lead-setting",
    element: <LeadSetting />,
    children: [
      {
        index: true,
        element: <LeadSettings />,
      },
      {
        path: "app-settings",
        element: <AppSettings />,
        children: [
          {
            path: "groups/mobile-access",
            element: <GroupSettings />,
          },
          {
            path: "groups/asset",
            element: <DreamAsset />,
          },
          {
            path: "groups/become-agent",
            element: <BecomeAgent />,
          },
        ],
      },
    ],
  },

  {
    path: "/designation",
    element: (
      <ProtectedRoute>
        <Designation />
      </ProtectedRoute>
    ),
  },
  {
    path: "/administrative-privileges",
    element: (
      <ProtectedRoute>
        <Navbar />
        <AdministrativePrivileges />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin-access-rights",
    element: (
      <ProtectedRoute>
        <Navbar />
        <AdminAccessRights />
      </ProtectedRoute>
    ),
  },
  {
    path: "/marketing",
    element: (
      <ProtectedRoute>
        <Navbar />
        <Marketing />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Navbar />
        <Profile />
      </ProtectedRoute>
    ),
  },

  {
    path: "/reports",
    element: <Reports />,
    children: [
      { path: "daybook", element: <Daybook /> },
      { path: "payout", element: <PayOutReport /> },
      { path: "sales-report", element: <SalesReport /> },
      { path: "receipt", element: <Receipt /> },
      { path: "group-report", element: <GroupReport /> },
      { path: "all-group-report", element: <AllGroupReport /> },
      { path: "auction-report", element: <AuctionReport /> },
      { path: "lead-report", element: <LeadReport /> },
      { path: "user-report", element: <UserReport /> },
      { path: "all-user-report", element: <AllUserReport /> },
      { path: "loan-report", element: <LoanReport /> },
      { path: "pigme-report", element: <PigmeReport /> },
      { path: "employee-report", element: <EmployeeReport /> },
      { path: "commission-report", element: <CommissionReport /> },
      { path: "enrollment-report", element: <EnrollmentReport /> },
      { path: "payment-summary", element: <PaymentSummary /> },
    ],
  },
  {
    path: "/print/:id",

    element: <Print />,
  },
  {
    path: "/marketing",
    element: (
      <ProtectedRoute>
        <Navbar />
        <Marketing />
      </ProtectedRoute>
    ),
    children: [
      { path: "what-add", element: <WhatsappAdd /> },
      { path: "failed-whatuser", element: <WhatsappFailed /> },
      { path: "due-message", element: <DueMessage /> },
    ],
  },
]);
export default mainRoutes;
