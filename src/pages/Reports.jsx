import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { MdOutlinePending } from "react-icons/md";
import { TbMoneybag } from "react-icons/tb";
import {
  FaCalendarDays,
  FaPeopleGroup,
  FaPeopleArrows,
  FaUserCheck,
  FaUserTie,
} from "react-icons/fa6";
import { TbUserCancel } from "react-icons/tb";
import {
  MdOutlineEmojiPeople,
  MdOutlineReceiptLong,
  MdMan,
} from "react-icons/md";
import { FaPersonWalkingArrowLoopLeft } from "react-icons/fa6";
import { RiMoneyRupeeCircleFill, RiAuctionFill } from "react-icons/ri";
import { LiaCalculatorSolid } from "react-icons/lia";
import { GiMoneyStack } from "react-icons/gi";
import { TbReportSearch } from "react-icons/tb";
import { MdOutlinePayment } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { RiReceiptLine } from "react-icons/ri";
import { useState } from "react";
import { BiGrid } from "react-icons/bi";
import { TbList } from "react-icons/tb";

const subMenus = [
  { title: "Daybook", link: "/reports/daybook", Icon: FaCalendarDays, category: "Reports" },
  { title: "Group Report", link: "/reports/group-report", Icon: FaPeopleGroup, category: "Reports" },
  {
    title: "Enrollment Report",
    link: "/reports/enrollment-report",
    Icon: FaPeopleArrows,
    category: "Customer",
  },
  {
    title: "All Customer Report",
    link: "/reports/all-user-report",
    Icon: FaPersonWalkingArrowLoopLeft,
    category: "Customer",
  },
  {
    title: "Customer Report",
    link: "/reports/user-report",
    Icon: MdOutlineEmojiPeople,
    category: "Customer",
  },
  {
    title: "Holded Customers",
    link: "/reports/holded-customer-report",
    Icon: TbUserCancel,
    category: "Customer",
  },
  {
    title: "Collection Executive Report",
    link: "/reports/collection-executive",
    Icon: TbMoneybag,
    category: "Finance",
  },
  {
    title: "Employee Report",
    link: "/reports/employee-report",
    Icon: FaUserTie,
    category: "Employee",
  },
  {
    title: "Receipt Report",
    link: "/reports/receipt",
    Icon: MdOutlineReceiptLong,
    category: "Finance",
  },
  {
    title: "Registration Receipt",
    link: "/reports/registration-fee-receipt",
    Icon: RiReceiptLine,
    category: "Finance",
  },
  {
    title: "PayOut Report",
    link: "/reports/payout",
    Icon: MdOutlinePayment,
    category: "Finance",
  },
  {
    title: "Due Report",
    link: "/reports/due-report",
    Icon: MdOutlinePending,
    category: "Finance",
  },
  {
    title: "Auction Report",
    link: "/reports/auction-report",
    Icon: RiAuctionFill,
    category: "Reports",
  },
  { title: "Lead Report", link: "/reports/lead-report", Icon: MdMan, category: "Reports" },
  {
    title: "Pigme Report",
    link: "/reports/pigme-report",
    Icon: LiaCalculatorSolid,
    category: "Finance",
  },
  { title: "Loan Report", link: "/reports/loan-report", Icon: GiMoneyStack, category: "Finance" },
  { title: "Sales Report", link: "/reports/sales-report", Icon: FaUserCheck, category: "Reports" },
  {
    title: "Payment Summary",
    link: "/reports/payment-summary",
    Icon: TbReportSearch,
    category: "Finance",
  },
  {
    title: "Monthly Installment Turnover",
    link: "/reports/monthly-install-turnover",
    Icon: SlCalender,
    category: "Employee",
  },
  {
    title: "Employee Attendance Report",
    link: "/reports/employee-attendance-report",
    Icon: SlCalender,
    category: "Employee",
  },
  {
    title: "Monthly Attendance Report",
    link: "/reports/employee-monthly-report",
    Icon: SlCalender,
    category: "Employee",
  },
];

const categories = ["All", "Reports", "Customer", "Employee", "Finance"];

const Reports = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewType, setViewType] = useState("grid"); // "grid" or "list"

  const bgColors = ["bg-gray-200"];

  const filteredMenus =
    activeCategory === "All"
      ? subMenus
      : subMenus.filter((menu) => menu.category === activeCategory);

  return (
    <div>
      <div className="min-w-screen min-h-screen flex mt-20">
        {<Navbar />}
        <Sidebar />

        <div className="w-[300px] bg-gray-50 min-h-screen p-4">
          {filteredMenus.map(({ title, link, Icon, red }) => (
            <NavLink
              key={link}
              to={link}
              className={({ isActive }) =>
                `whitespace-nowrap my-2 flex items-center gap-2 font-medium rounded-3xl hover:bg-gray-300 p-3 ${
                  red ? "text-red-800" : "text-gray-900"
                } ${isActive ? "bg-gray-200 border-l-8 border-blue-300" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`${isActive ? "animate-bounce" : "text-black"}`}
                  />
                  <span className="text-black">{title}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex-grow p-6">
          {location.pathname === "/reports" ? (
            <>
              {/* Category Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      activeCategory === category
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex gap-2 mb-6 justify-end">
                <button
                  onClick={() => setViewType("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewType === "grid"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                  title="Grid View"
                >
                  <BiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewType === "list"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                  title="List View"
                >
                  <TbList size={20} />
                </button>
              </div>

              {/* Grid View */}
              {viewType === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 w-full">
                  {filteredMenus.map(({ title, Icon, link }, idx) => (
                    <div
                      key={link}
                      onClick={() => navigate(link)}
                      className={`group flex items-center p-2 rounded-3xl shadow-sm cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:bg-gray-300 ${
                        bgColors[idx % bgColors.length]
                      }`}
                    >
                      <div className="flex items-center justify-center w-14 h-14 rounded-full mr-3 bg-transparent text-black">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-700 text-white">
                          <Icon className="text-2xl" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-black">{title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-2 w-full">
                  {filteredMenus.map(({ title, Icon, link }) => (
                    <div
                      key={link}
                      onClick={() => navigate(link)}
                      className="flex items-center p-4 bg-gray-100 rounded-lg shadow-sm cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4 bg-gray-700 text-white">
                        <Icon className="text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-black">{title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;