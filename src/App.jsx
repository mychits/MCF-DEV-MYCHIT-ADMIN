import { Route, Routes, useLocation } from "react-router-dom";
import React, { Suspense, lazy, useEffect } from "react";
import Navbar from "./components/layouts/Navbar";
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Group = lazy(() => import("./pages/Group"));
const User = lazy(() => import("./pages/User"));
const Enroll = lazy(() => import("./pages/Enroll"));
const Auction = lazy(() => import("./pages/Auction"));
const Payment = lazy(() => import("./pages/Payment"));
const WeekGroup = lazy(() => import("./pages/WeekGroup"));
const Agent = lazy(() => import("./pages/Agent"));
const Daybook = lazy(() => import("./pages/Daybook"));
const Test = lazy(() => import("./pages/Test"));
const Lead = lazy(() => import("./pages/Lead"));
const LeadSetting = lazy(() => import("./pages/LeadSetting"));
const Receipt = lazy(() => import("./pages/Receipt"));
const GroupReport = lazy(() => import("./pages/GroupReport"));
const UserReport = lazy(() => import("./pages/UserReport"));
const Profile = lazy(() => import("./pages/Profile"));
const AuctionReport = lazy(() => import("./pages/AuctionReport"));
const Print = lazy(() => import("./pages/Print"));
const AppSettings = lazy(() => import("./pages/AppSettings"));
const GroupSettings = lazy(() => import("./pages/GroupSettings"));
const Task = lazy(() => import("./pages/Task"));
import ProtectedRoute from "./components/authentication/ProtectedRoute";
import CircularLoader from "./components/loaders/CircularLoader";
import Marketing from "./pages/Marketing";
import WhatsappAdd from "./pages/WhatsappAdd";
import WhatsappFailed from "./pages/WhatsappFailed";
import AllGroupReport from "./pages/AllGroupReport";
import Reports from "./pages/Reports";
import LeadReport from "./pages/LeadReport";
import Sidebar from "./components/layouts/Sidebar";
import AllUserReport from "./pages/AllUserReport";
import Loan from "./pages/Loan";
import Pigme from "./pages/Pigme";
import PigmeReport from "./pages/PigmeReport";
import LoanReport from "./pages/LoanReport";
import EnrollmentRequestForm from "./pages/EnrollmentRequestForm";
import Designation from "./pages/Designation";
import AdministrativePrivileges from "./pages/AdministrativePrivileges";
import AdminAccessRights from "./pages/AdminAccessRights";
import EmployeeReport from "./pages/EmployeeReport";
import CollectionArea from "./pages/CollectionArea";
import CollectionAreaMapping from "./pages/CollectionAreaMapping";
import FilterGroups from "./pages/FilterGroups";
import CommissionReport from "./pages/CommissionReport";
import EnrollmentReport from "./pages/EnrollmentReport";
import Staff from "./pages/Staff";
import Employee from "./pages/Employee";
import EmployeeProfile from "./pages/EmployeeProfile"
import LeadSettings from "./pages/LeadSettings";
import SalesReport from "./pages/SalesReport";
import PaymentSummary from './pages/PaymentSummary';
import Target from "./pages/Target";
function App() {
  return (
    <>
      <div className="overflow-x">
        <Suspense fallback={<CircularLoader seconds={30} />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Navbar />
                </ProtectedRoute>
              }
            />

            <Route
              path="/task"
              element={
                <ProtectedRoute>
                  <Task />
                </ProtectedRoute>
              }
            />

              <Route
              path="/target"
              element={
                <ProtectedRoute>
                  <Target />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enrollment-request-form"
              element={<EnrollmentRequestForm />}
            />

            <Route
              path="/group"
              element={
                <ProtectedRoute>
                  <Group />
                </ProtectedRoute>
              }
            />

          <Route
              path="/filter-groups"
              element={
                <ProtectedRoute>
                  <FilterGroups />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-profile"
              element={
                <ProtectedRoute>
                  <EmployeeProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  <Staff />
                </ProtectedRoute>
              }
            />
             <Route
              path="/employee"
              element={
                <ProtectedRoute>
                  <Employee />
                </ProtectedRoute>
              }
            />
            <Route
              path="/week-group"
              element={
                <ProtectedRoute>
                  <WeekGroup />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user"
              element={
                <ProtectedRoute>
                  <User />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enrollment"
              element={
                <ProtectedRoute>
                  <Enroll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loan"
              element={
                <ProtectedRoute>
                  <Loan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pigme"
              element={
                <ProtectedRoute>
                  <Pigme />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auction"
              element={
                <ProtectedRoute>
                  <Auction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/collection-area-request"
              element={
                <ProtectedRoute>
                  <CollectionArea />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collection-area-mapping"
              element={
                <ProtectedRoute>
                  <CollectionAreaMapping />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agent"
              element={
                <ProtectedRoute>
                  <Agent />
                </ProtectedRoute>
              }
            />

            <Route
              path="/designation"
              element={
                <ProtectedRoute>
                  <Designation />
                </ProtectedRoute>
              }
            />

            <Route
              path="/lead"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Lead />
                </ProtectedRoute>
              }
            />

            <Route
              path="/"
              element={
                <>
                  <Login />
                </>
              }
            />
            <Route
              path="/lead-setting"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <LeadSetting />
                </ProtectedRoute>
              }
            >
              <Route
                path=""
                element={
                  <ProtectedRoute>
                    <LeadSettings />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="app-settings"
                element={
                  <ProtectedRoute>
                    <AppSettings />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="groups/mobile-access"
                  element={
                    <ProtectedRoute>
                      <GroupSettings />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Route>
            <Route
              path="administrative-privileges"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <AdministrativePrivileges />
                </ProtectedRoute>
              }
            />
            <Route />
            <Route
              path="admin-access-rights"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <AdminAccessRights />
                </ProtectedRoute>
              }
            />
            <Route />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            >
              <Route path="daybook" element={<Daybook />} />
              <Route path="sales-report" element={<SalesReport />} />
              <Route path="receipt" element={<Receipt />} />
              <Route path="group-report" element={<GroupReport />} />
              <Route path="all-group-report" element={<AllGroupReport />} />
              <Route path="auction-report" element={<AuctionReport />} />
              <Route path="lead-report" element={<LeadReport />} />
              <Route path="user-report" element={<UserReport />} />
              <Route path="all-user-report" element={<AllUserReport />} />
              <Route path="loan-report" element={<LoanReport />} />
              <Route path="pigme-report" element={<PigmeReport />} />
              <Route path="employee-report" element={<EmployeeReport />} />
              <Route path="commission-report" element={<CommissionReport />} />
              <Route path="enrollment-report" element={<EnrollmentReport />} />
              <Route path="payment-summary"element={<PaymentSummary/>} />
            </Route>

            <Route
              path="/marketing"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Marketing />
                </ProtectedRoute>
              }
            >
              <Route path="what-add" element={<WhatsappAdd />} />
              <Route path="failed-whatuser" element={<WhatsappFailed />} />
            </Route>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/print/:id"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Print />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Test />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default App;
