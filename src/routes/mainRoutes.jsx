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
import Payroll from "../pages/Payroll";
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
import OutstandingReport from "../pages/OutstandingReport";
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
import AuctionIntemationMessage from "../pages/AuctionIntemationMessage";
import OverDueMessage from "../pages/OverDueMessage";
import DueEmail from "../pages/DueEmail";
import OverDueEmail from "../pages/OverDueEmail";
import WhatsappPromo from "../pages/WhatsappPromo";
import QuickSearch from "../pages/QuickSearch";
import BidWinner from "../pages/BidWinner";
import TransferCustomer from "../pages/SoftTransferCustomer";
import SoftTransferCustomer from "../pages/SoftTransferCustomer";
import HardTransferCustomer from "../pages/HardTransfer";
import UnApprovedCustomer from "../pages/UnApprovedCustomer";
import PaymentLink from "../pages/PaymentLink";
import MobileAppEnroll from "../pages/MobileAppEnroll";
import PaymentLinkMenu from "../pages/PaymentLinkMenu";
import ChitBulkPaymentLink from "../pages/BulkChitPaymentLink";
import IndividualChitPaymentLink from "../pages/IndividualChitPaymentLink";

import IndividualRegistrationChitPaymentLink from "../pages/IndividualRegistrationChitPaymentLink";
import TargetIncentiveReport from "../pages/TargetIncentive";
import TargetPayOutSalary from "../pages/TargetPayoutSalary";
import TargetPayOutCommissionIncentive from "../pages/TargetPayOutCommissionIncentive";
import TargetCommission from "../pages/TargetCommission";
// import TargetPayOutMenu from "../pages/TargetPayOutMenu";
import MonthlyInstallmentTurnoverReport from "../pages/MonthlyInstallmentTurnoverReport";
import HoldedCustomerReport from "../pages/HoldedCustomerReport"
import AuctionBidStatus from "../pages/AuctionBidStatus"
import AuctionWinnerDocuments from "../pages/AuctionWinnerDocuments";
import AuctionInformation from "../pages/AuctionInformation";
import AuctionTermsandCondition from "../pages/AuctionTermsandCondition";
import LeadWhatsappWelcomeMessage from "../pages/LeadWhatsappWelcomeMessage";
import LeadReferredByWhatsappMessage from "../pages/LeadReferredByWhatsappMessage";
import CustomerWelcomeWhatsappMessage from "../pages/CustomerWelcomeWhatsappMessage";
import CustomerChitPlanWhatsappMessage from "../pages/CustomerChitPlanWhatsappMessage";
import Insurance from "../pages/Insurance";
import CustomerRewards from "../pages/CustomerRewards";
import PayInOutMenu from "../pages/PayInOutMenu";
import RegistrationFeeReport from "../pages/RegistrationFeeReport";
import CollectionExecutiveReport from "../pages/CollectionExecutiveReport";
import StaffMenu from "../pages/StaffMenu";
import EmployeeAttendance from "../pages/EmployeeAttendanceReport"
import EmployeeMonthlyReport from "../pages/EmployeeMonthlyReport";
import EmployeeMenu from "../pages/EmployeeMenu";
import PaymentMenu from "../pages/PaymentMenu";
import CustomerLoanReport from "../pages/CustomerLoanReport";
import CollectionAreaReport from "../pages/CollectionAreaReport";
import PayoutSalaryReport from "../pages/PayoutSalaryReport";
import TargetMenu from "../pages/TargetMenu";
import EnrollmentMenu from "../pages/EnrollmentView";
import GroupMenu from "../pages/GroupMenu";

import PenaltySettings from "../pages/PenaltySettings";
import PenaltyMonitor from "../pages/PenaltyMonitor";
import UserMenu from "../pages/UserMenu"
import OtherServicesMenu from "../pages/OtherServicesMenu";
import LegalsMenu from "../pages/LegalsMenu";
import UnApprovedCustomerReport from "../pages/UnApprovedCustomerReport";
import PaymentReport from "../pages/PaymentReport";
import PigmySummaryReport from "../pages/PigmySummaryReport";

import ChitAskingMonthReport from "../pages/ChitAskingMonthReport";
import  SalaryRemainingReport from "../pages/SalaryRemainingReport";
import AdminApprovalMenu from "../pages/AdminApprovalsMenu";
import SuspensePayments from "../pages/SuspensePayments";
import InActiveUserReport from "../pages/InActiveUserReport";
import NonConvertedLead from "../pages/NonConvertedLead";
import ConvertedLead from "../pages/ConvertedLead";
import UserRegistrationSourceSummaryReport from "../pages/UserRegistrationSourceSummaryReport";
import HRMenu from "../pages/HRMenu";
import SalaryPayment from "../pages/SalaryPayment";
import TransferMenu from "../pages/TransferMenu";
import CollectionMenu from "../pages/CollectionMenu";
import SalarySlipPrint from "../components/printFormats/SalarySlipPrint";
import EmployeeSalaryReport from "../pages/EmployeeSalaryReport"
import HRSalaryManagement from "../pages/HRSalaryManagement";
import EmployeeStatement from "../pages/EmployeeStatement";
import SalaryIncentive from "../pages/SalaryIncentive";
import UnapprovedLoans from "../pages/UnapprovedLoans";
import EmployeeDeductionReport from "../pages/EmployeeDeductionReport";
import MarketingMenu from "../pages/MarketingMenu"
import EmailMarketingMenu from "../pages/EmailMarketingMenu"
import PaymentLinkMarketingMenu from "../pages/PaymentLinkMarketingMenu"
import WhatsappMarketingMenu from "../pages/WhatsappMarketingMenu";
import DueWhatsappMessageMenu from "../pages/DueWhatsappMessageMenu";
import LeadWhatsappMessageMenu from "../pages/LeadWhatsappMessageMenu"
import CustomerWhatsappMessageMenu from "../pages/CustomerWhatsappMessageMenu";
import AuctionWhatsappMessageMenu from "../pages/AuctionWhatsappMessageMenu";
import PromotionWhatsappMessageMenu from "../pages/PromotionWhatsappMessageMenu"
import DueEmailMenu from "../pages/DueEmailMenu"
import RCSMarketingMenu from "../pages/RCSMarketingMenu";
import SMSMarketingMenu from "../pages/SMSMarketingMenu";
import CoApplicant from "../pages/CoApplicant";
import CoApplicantPrint from "../components/printFormats/CoApplicantPrint"
import PaymentWithPenalty from "../pages/PaymentWithPenalty";
import PenaltyWhatsappMessageMenu from "../pages/PenaltyWhatsappMessageMenu";
import EmployeeRewardPoints from "../pages/EmployeeRewardPoints";
import RewardSettings from "../pages/RewardSettings";
import AdvanceSalary from "../pages/AdvanceSalary"; 
import RewardMenu from "../pages/RewardsMenu";
import PaymentLinkTransactions from "../pages/PaymentLinkTransactions";
import CustomerRewardPoints from "../pages/CustomerRewards"
import RedemptionPointsReport from "../pages/RedemptionPointsReport";
import LoanCompletionReport from "../pages/LoanCompletionReport";
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
    path: "/quick-search",
    element: (
      <ProtectedRoute>
        <Navbar />
        <QuickSearch />
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
    path: "/group-menu/group",
    element: (
      <ProtectedRoute>
        <Group />
      </ProtectedRoute>
    ),
  },

         {
    path: "/reward-menu",
    element: (
      <ProtectedRoute>
        <RewardMenu />
      </ProtectedRoute>
    ),
  },
        {
    path: "/reward-menu/employee-reward-points",
    element: ( <ProtectedRoute> <EmployeeRewardPoints/> </ProtectedRoute>),
  },
       {
    path: "/reward-menu/customer-reward-points",
    element: ( <ProtectedRoute> <CustomerRewardPoints/> </ProtectedRoute>),
  },
  
  {
    path: "/payment-menu/payment-in-out-menu/pay-in-menu",
    element: (
      <ProtectedRoute>
        <PayInMenu />
      </ProtectedRoute>
    ),
  },
   {
    path: "/payment-menu/payment-in-out-menu",
    element: (
      <ProtectedRoute>
        <PayInOutMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-menu/payment-in-out-menu/pay-in-menu/payment",
    element: (
      <ProtectedRoute>
        <Payment />
      </ProtectedRoute>
    ),
  },
      {
    path: "/employee-reward-points",
    element: <EmployeeRewardPoints/>
  },
     {
    path: "/reward-settings",
    element: <RewardSettings/>
  },
      {
    path: "/payment-menu/payment-in-out-menu/pay-in-menu/penalty-payment",
    element: (
      <ProtectedRoute>
        <PaymentWithPenalty />
      </ProtectedRoute>
    ),
  },
   {
    path: "/payment-menu/payment-in-out-menu/pay-in-menu/suspense-payments",
    element: (
      <ProtectedRoute>
        <SuspensePayments />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-menu/payment-in-out-menu/pay-in-menu/registration-fee",
    element: (
      <ProtectedRoute>
        <RegistrationFee />
      </ProtectedRoute>
    ),
  },

  {
    path: "/payment-link-transactions",
    element: (
      <ProtectedRoute>
        <PaymentLinkTransactions />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-menu/payment-in-out-menu/pay-in-menu/payment-link-menu",
    element: (
      <ProtectedRoute>
        <PaymentLinkMenu />
      </ProtectedRoute>
    ),
  },
  //     {
  //   path: "/co-applicant-print/:id",

  //   element: <CoApplicantPrint />,
  // },
  {
    path: "/payment-menu/payment-in-out-menu/pay-in-menu/payment-link-menu/chit-payment",
    element: (
      <ProtectedRoute>
        <IndividualChitPaymentLink />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-menu/payment-in-out-menu/pay-in-menu/payment-link-menu/registration-chit-payment",
    element: (
      <ProtectedRoute>
        <IndividualRegistrationChitPaymentLink />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-menu/payment-in-out-menu/pay-in-menu/payment-link-menu/chit-bulk-payment",
    element: (
      <ProtectedRoute>
        <ChitBulkPaymentLink />
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
    path: "/salary-incentive",
    element: (
      <ProtectedRoute>
        <SalaryIncentive />
      </ProtectedRoute>
    ),
  },
  
  {
    path: "/enroll-menu/mobile-app-enroll",
    element: (
      <ProtectedRoute>
        <MobileAppEnroll />
      </ProtectedRoute>
    ),
  },
   {
    path: "/legals-menu/co-applicant",
    element: <CoApplicant />,
  },

    {
    path: "/approval-menu/mobile-app-enroll",
    element: (
      <ProtectedRoute>
        <MobileAppEnroll />
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
  ,
  {
    path: "/customer-menu/un-approved-customer",
    element: (
      <ProtectedRoute>
        <UnApprovedCustomer />
      </ProtectedRoute>
    ),
  },
   {
    path: "/approval-menu/un-approved-customer",
    element: (
      <ProtectedRoute>
        <UnApprovedCustomer />
      </ProtectedRoute>
    ),
  },

   {
    path: "/approval-menu/un-approved-loans",
    element: (
      <ProtectedRoute>
        <UnapprovedLoans />
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
    path: "/target-menu/target",
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
    path: "/legals-menu/guarantor",
    element: <Guarantor />,
  },
   {
    path: "/legals-menu",
    element: <LegalsMenu />,
  },
  {
    path: "/group-menu/filter-groups",
    element: (
      <ProtectedRoute>
        <FilterGroups />
      </ProtectedRoute>
    ),
  },
  {
    path: "/group-menu",
    element: (<ProtectedRoute>
      <GroupMenu/>
      </ProtectedRoute>
      ),

  },
   {
    path: "/approval-menu",
    element: (<ProtectedRoute>
      <AdminApprovalMenu/>
      </ProtectedRoute>
      ),

  },
     {
    path: "/hr-menu",
    element: (
      <ProtectedRoute>
        <HRMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/hr-menu/payroll",
    element: (
      <ProtectedRoute>
        <Payroll />
      </ProtectedRoute>
    ),
  },
  {
    path: "/hr-menu/salary-management",
    element: (
      <ProtectedRoute>
        <HRSalaryManagement />
      </ProtectedRoute>
    ),
  },
   {
    path: "/customer-menu",
    element: (
      <ProtectedRoute>
        <UserMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff-menu",
    element: (
      <ProtectedRoute>
        <StaffMenu />
      </ProtectedRoute>
    ),
  },
  {
   path: "/target-menu",
   element: (
   <ProtectedRoute>
    <TargetMenu/>
   </ProtectedRoute>
   ),
  },
  {
    path: "/enroll-menu",
    element: (<ProtectedRoute>
        <EnrollmentMenu/>
      </ProtectedRoute>),
  },
    {
    path: "/staff-menu/employee-menu",
    element: (
      <ProtectedRoute>
        <EmployeeMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff-menu/employee-menu/employee",
    element: (
      <ProtectedRoute>
        <Employee />
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff-menu/employee-menu/add-employee-attendance",
    element: (
      <ProtectedRoute>
        <EmployeeAttendance />
      </ProtectedRoute>
    ),
  },
   {
    path: "/staff-menu/employee-menu/employee-statement",
    element: (
      <ProtectedRoute>
        <EmployeeStatement />
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
    path: "/customer-menu/user",
    element: (
      <ProtectedRoute>
        <User />
      </ProtectedRoute>
    ),
  },
  {
    path: "/enroll-menu/enrollment",
    element: (
      <ProtectedRoute>
        <Enroll />
      </ProtectedRoute>
    ),
  },
  {
    path: "/other-service-menu/",
    element: (
      <ProtectedRoute>
        <OtherServicesMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/other-service-menu/loan",
    element: (
      <ProtectedRoute>
        <Loan />
      </ProtectedRoute>
    ),
  },
  {
    path: "/other-service-menu/pigme",
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
    path: "/payment-menu",
    element: (
      <ProtectedRoute>
        <PaymentMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-menu/payment",
    element: (
      <ProtectedRoute>
        <Payment />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-menu/payment-in-out-menu/pay-out-menu",
    element: (
      <ProtectedRoute>
        <PayOutMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-menu/payment-in-out-menu/general-payment-out/:paymentType",
    element: (
      <ProtectedRoute>
        <GeneralPaymentOut />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-menu/payment-in-out-menu/payment-out/commission",
    element: (
      <ProtectedRoute>
        <PayOutCommission />
      </ProtectedRoute>
    ),
  },
    {
    path: "/payment-menu/payment-in-out-menu/payment-out/advance-payment",
    element: (
      <ProtectedRoute>
        <AdvanceSalary />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-menu/payment-in-out-menu/payment-out/salary-payment",
    element: (
      <ProtectedRoute>
        <SalaryPayment />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-menu/payment-in-out-menu/payment-out/petty-Cash",
    element: (
      <ProtectedRoute>
        <PayOutPettyCash />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-menu/payment-in-out-menu/payment-out/others",
    element: (
      <ProtectedRoute>
        <PayOutOthers />
      </ProtectedRoute>
    ),
  },
     {
    path: "/collection-menu",
    element: (
      <ProtectedRoute>
        <CollectionMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/collection-menu/collection-area-request",
    element: (
      <ProtectedRoute>
        <CollectionArea />
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff-menu/agent",
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
    path: "/transfer-menu",
    element: (
      <ProtectedRoute>
        <TransferMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/transfer-menu/soft-transfer",
    element: (
      <ProtectedRoute>
        <SoftTransferCustomer />
      </ProtectedRoute>
    ),
  },
  ,
  {
    path: "/transfer-menu/hard-transfer",
    element: (
      <ProtectedRoute>
        <HardTransferCustomer />
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
    path:"/penalty-settings",
    element:<PenaltySettings/>
  },

   {
    path:"/penalty-monitor",
    element:<PenaltyMonitor/>
  },

    {
    path: "/gift-received",
    element: <CustomerRewards/>
  },

  {
    path: "/reports",
    element: <Reports />,
    children: [
      { path: "daybook", element: <Daybook /> },
      { path: "payout", element: <PayOutReport /> },
      { path: "sales-report", element: <SalesReport /> },
      { path: "pigmy-summary-report", element: <PigmySummaryReport /> },
      { path: "receipt", element: <Receipt /> },
      { path: "collection-executive", element: <CollectionExecutiveReport /> },
      {path: "collection-area-report", element: <CollectionAreaReport />},
      { path: "registration-fee-receipt", element: <RegistrationFeeReport /> },
      { path: "group-report", element: <GroupReport /> },
      { path: "all-group-report", element: <AllGroupReport /> },
      { path: "auction-report", element: <AuctionReport /> },
      { path: "auction-report", element: <AuctionReport /> },
      { path: "lead-report", element: <LeadReport /> },
      { path: "user-report", element: <UserReport /> },
      { path: "inactive-user-report", element: <InActiveUserReport /> },
      { path: "all-user-report", element: <AllUserReport /> },
      { path: "loan-report", element: <LoanReport /> },
      { path: "pigme-report", element: <PigmeReport /> },
      { path: "employee-report", element: <EmployeeReport /> },
      { path: "commission-report", element: <CommissionReport /> },
      { path: "enrollment-report", element: <EnrollmentReport /> },
      { path: "payment-summary", element: <PaymentSummary /> },
       { path: "holded-customer-report", element: <HoldedCustomerReport /> },
      {path: "monthly-install-turnover", element:<MonthlyInstallmentTurnoverReport/>},
      {path: "employee-monthly-report", element: <EmployeeMonthlyReport/>},
      {path: "customer-loan-report", element: <CustomerLoanReport/>},
      {path: "unverified-customer-report", element: <UnApprovedCustomerReport/>},
      {path: "payment-report", element: <PaymentReport/>},
      {
        path: "outstanding-report",
        element: <OutstandingReport />,
      },
      {path: "chit-asking-month-report", element: <ChitAskingMonthReport/>},
      {path: "payout-salary-report", element: <PayoutSalaryReport/>},
        {
    path: "target-incentive",
    element: <TargetIncentiveReport />,
  },
    {
    path: "target-commission",
    element: <TargetCommission />,
  },
   {path: "salary-remaining", element: <SalaryRemainingReport/>},
    {path: "non-converted-lead-report", element: <NonConvertedLead/>},
   {path: "converted-lead-report", element: <ConvertedLead/>},
   {path: "employee-salary-report", element: <EmployeeSalaryReport/>},
    {path: "user-registration-source-summary-report", element: <UserRegistrationSourceSummaryReport/>},
      {
        path: "employee-deduction-report",
        element: <EmployeeDeductionReport />,
      },
      {path:"redemtion-points", element: <RedemptionPointsReport/>},
      {path: "loan-completion-report", element: <LoanCompletionReport/>},
    ],
  },

  {
    path: "/target-commission-incentive",
    element: <TargetPayOutCommissionIncentive />,
  },
  // {
  //   path: "/target-payout-menu",
  //   element: <TargetPayOutMenu />,
  // },
  {
    path: "/target-payout-salary",
    element: <TargetPayOutSalary />,
  },
 
  
  {
    path: "/insurance",
    element: <Insurance/>
  },

  {
    path: "/print/:id",

    element: <Print />,
  },
   {
    path: "/salary-slip-print/:id",

    element: <SalarySlipPrint />,
  },
  {
    path: "/marketing-menu",
    element: (
      <ProtectedRoute>
        <MarketingMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/market-menu/email-marketing",
    element: (
      <ProtectedRoute>
        <EmailMarketingMenu />
      </ProtectedRoute>
    ),
  },
   {
    path: "/market-menu/payment-link-marketing",
    element: (
      <ProtectedRoute>
        <PaymentLinkMarketingMenu />
      </ProtectedRoute>
    ),
  },
   {
    path: "/market-menu/whatsapp-marketing",
    element: (
      <ProtectedRoute>
        <WhatsappMarketingMenu />
      </ProtectedRoute>
    ),
  },
   {
    path: "/market-menu/whatsapp-marketing/due-whatsapp-marketing",
    element: (
      <ProtectedRoute>
        <DueWhatsappMessageMenu />
      </ProtectedRoute>
    ),
  },
   {
    path: "/market-menu/whatsapp-marketing/lead-whatsapp-marketing",
    element: (
      <ProtectedRoute>
        <LeadWhatsappMessageMenu />
      </ProtectedRoute>
    ),
  },
    {
    path: "/market-menu/whatsapp-marketing/customer-whatsapp-marketing",
    element: (
      <ProtectedRoute>
        <CustomerWhatsappMessageMenu />
      </ProtectedRoute>
    ),
  },

    {
    path: "/market-menu/whatsapp-marketing/auction-whatsapp-marketing",
    element: (
      <ProtectedRoute>
        <AuctionWhatsappMessageMenu />
      </ProtectedRoute>
    ),
  },
    {
    path: "/market-menu/whatsapp-marketing/promo-whatsapp-marketing",
    element: (
      <ProtectedRoute>
        <PromotionWhatsappMessageMenu />
      </ProtectedRoute>
    ),
  },
   {
    path: "/market-menu/whatsapp-marketing/penalty-whatsapp-marketing",
    element: (
      <ProtectedRoute>
        <PenaltyWhatsappMessageMenu />
      </ProtectedRoute>
    ),
  },
    {
    path: "/market-menu/email-marketing/due-email-marketing",
    element: (
      <ProtectedRoute>
        <DueEmailMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/market-menu/sms-marketing",
    element: (
      <ProtectedRoute>
        <SMSMarketingMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/market-menu/rcs-marketing",
    element: (
      <ProtectedRoute>
        <RCSMarketingMenu />
      </ProtectedRoute>
    ),
  },
  
      { path: "/market-menu/email-marketing/due-email-marketing/due-email", element: <DueEmail /> },
      { path: "/market-menu/email-marketing/due-email-marketing/over-due-email", element: <OverDueEmail /> },
       { path: "/market-menu/whatsapp-marketing/what-add", element: <WhatsappAdd /> },
      { path: "/market-menu/whatsapp-marketing/failed-whatuser", element: <WhatsappFailed /> },
      { path: "/market-menu/whatsapp-marketing/due-whatsapp-marketing/due-message", element: <DueMessage /> },
      {
        path: "/market-menu/whatsapp-marketing/auction-whatsapp-marketing/auction-intimation-message",
        element: <AuctionIntemationMessage />,
      },
      { path: "/market-menu/whatsapp-marketing/due-whatsapp-marketing/over-due-message", element: <OverDueMessage /> },
       { path: "/market-menu/whatsapp-marketing/promo-whatsapp-marketing/what-promo", element: <WhatsappPromo /> },
      { path: "/market-menu/whatsapp-marketing/auction-whatsapp-marketing/bid-winner", element: <BidWinner /> },
      { path: "/market-menu/payment-link-marketing/payment-link", element: <PaymentLink /> },
       {path: "/market-menu/whatsapp-marketing/auction-whatsapp-marketing/bid-status", element: <AuctionBidStatus/>},
      {path: "/market-menu/whatsapp-marketing/auction-whatsapp-marketing/auction-info", element: <AuctionInformation/>},
      {path: "/market-menu/whatsapp-marketing/auction-whatsapp-marketing/winner-document", element: <AuctionWinnerDocuments/>},
      {path: "/market-menu/whatsapp-marketing/auction-whatsapp-marketing/auction-terms-condition", element: <AuctionTermsandCondition/>},
      {path: "/market-menu/whatsapp-marketing/lead-whatsapp-marketing/lead-welcome-message", element: <LeadWhatsappWelcomeMessage/>},
      {path: "/market-menu/whatsapp-marketing/lead-whatsapp-marketing/lead-referredby-message", element: <LeadReferredByWhatsappMessage/>},
      {path: "/market-menu/whatsapp-marketing/customer-whatsapp-marketing/customer-welcome-message", element: <CustomerWelcomeWhatsappMessage/>},
      {path: "/market-menu/whatsapp-marketing/customer-whatsapp-marketing/customer-chitplan-message", element: <CustomerChitPlanWhatsappMessage/>},
    
   
  

  // {
  //   path: "/marketing",
  //   element: (
  //     <ProtectedRoute>
  //       <Navbar />
  //       <Marketing />
  //     </ProtectedRoute>
  //   ),
  //   children: [
  //     { path: "what-add", element: <WhatsappAdd /> },
  //     { path: "failed-whatuser", element: <WhatsappFailed /> },
  //     { path: "due-message", element: <DueMessage /> },
  //     {
  //       path: "auction-intimation-message",
  //       element: <AuctionIntemationMessage />,
  //     },
  //     { path: "over-due-message", element: <OverDueMessage /> },
  //     // { path: "due-email", element: <DueEmail /> },
  //     // { path: "over-due-email", element: <OverDueEmail /> },
  //     { path: "what-promo", element: <WhatsappPromo /> },
  //     { path: "bid-winner", element: <BidWinner /> },
  //     { path: "payment-link", element: <PaymentLink /> },
  //      {path: "bid-status", element: <AuctionBidStatus/>},
  //     {path: "auction-info", element: <AuctionInformation/>},
  //     {path: "winner-document", element: <AuctionWinnerDocuments/>},
  //     {path: "auction-terms-condition", element: <AuctionTermsandCondition/>},
  //     {path: "lead-welcome-message", element: <LeadWhatsappWelcomeMessage/>},
  //     {path: "lead-referredby-message", element: <LeadReferredByWhatsappMessage/>},
  //     {path: "customer-welcome-message", element: <CustomerWelcomeWhatsappMessage/>},
  //     {path: "customer-chitplan-message", element: <CustomerChitPlanWhatsappMessage/>},
      
  //   ],
  // },
]);
export default mainRoutes;