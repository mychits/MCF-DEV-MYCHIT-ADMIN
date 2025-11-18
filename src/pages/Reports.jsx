import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { MdOutlinePending } from "react-icons/md";
import { TbMoneybag } from "react-icons/tb";
import { HiOutlineBanknotes } from "react-icons/hi2";
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
import { MdCalendarMonth } from "react-icons/md";
import { FaPersonWalkingArrowLoopLeft } from "react-icons/fa6";
import { RiMoneyRupeeCircleFill, RiAuctionFill } from "react-icons/ri";
import { MdOutlinePayments } from "react-icons/md";
import { LiaCalculatorSolid } from "react-icons/lia";
import { GiMoneyStack } from "react-icons/gi";
import { TbReportSearch } from "react-icons/tb";
import { MdOutlinePayment } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { RiReceiptLine } from "react-icons/ri";
import { useState } from "react";
import { BiGrid } from "react-icons/bi";
import { TbList } from "react-icons/tb";
import { BsCalendarDate } from "react-icons/bs";
import { TbGraph } from "react-icons/tb";
import { TbGraphFilled } from "react-icons/tb";
import { IoSearchOutline } from "react-icons/io5";
import { IoCloseCircle } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import { BsCalculator } from "react-icons/bs";
const subMenus = [
  {
    id:"1",
    title: "Daybook",
    link: "/reports/daybook",
    Icon: FaCalendarDays,
    category: "Reports",
    color: "from-blue-500 to-blue-600",
  },
  {
     id:"2",
    title: "Receipt Report",
    link: "/reports/receipt",
    Icon: MdOutlineReceiptLong,
    category: "Finance",
    color: "from-green-500 to-green-600",
  },
    {
     id:"&&%",
    title: "Payment Report",
    link: "/reports/payment-report",
    Icon: MdOutlinePayments ,
    category: "Reports",
    color: "from-yellow-500 to-pink-600",
  },
  {
     id:"3",
    title: "Group Report",
    link: "/reports/group-report",
    Icon: FaPeopleGroup,
    category: "Reports",
    color: "from-purple-500 to-purple-600",
  },
  {
     id:"4",
    title: "Enrollment Report",
    link: "/reports/enrollment-report",
    Icon: FaPeopleArrows,
    category: "Customer",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id:"5",
    title: "All Customer Report",
    link: "/reports/all-user-report",
    Icon: FaPersonWalkingArrowLoopLeft,
    category: "Customer",
    color: "from-teal-500 to-teal-600",
  },
  {
    id:"6",
    title: "Customer Report",
    link: "/reports/user-report",
    Icon: MdOutlineEmojiPeople,
    category: "Customer",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id:"7",
    title: "Loan Summary Report",
    link: "/reports/customer-loan-report",
    Icon: GiMoneyStack,
    category: "Customer",
    color: "from-cyan-500 to-cyan-600",
  },
   {
    id:"&*DD",
    title: "Pigmy Summary Report",
    link: "/reports/pigmy-summary-report",
    Icon: BsCalculator ,
    category: "Customer",
    color: "from-blue-500 to-blue-600",
  },
  {
    id:"8",
    title: "Holded Customers",
    link: "/reports/holded-customer-report",
    Icon: TbUserCancel,
    category: "Customer",
    color: "from-red-500 to-red-600",
  },
  {
    id:"9",
    title: "Collection Executive Report",
    link: "/reports/collection-executive",
    Icon: TbMoneybag,
    category: "Finance",
    color: "from-green-500 to-green-600",
  },
  {
    id:"10",
    title: "Collection Area Report",
    link: "/reports/collection-area-report",
    Icon: TbMoneybag,
    category: "Customer",
    color: "from-green-500 to-green-600",
  },
  {
    id:"11",
    title: "Employee Report",
    link: "/reports/employee-report",
    Icon: FaUserTie,
    category: "Employee",
    color: "from-indigo-500 to-indigo-600",
  },
 
  {
     id:"13",
    title: "Registration Receipt",
    link: "/reports/registration-fee-receipt",
    Icon: RiReceiptLine,
    category: "Finance",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id:"14",
    title: "PayOut Report",
    link: "/reports/payout",
    Icon: MdOutlinePayment,
    category: "Finance",
    color: "from-green-500 to-green-600",
  },
  {
    id:"15",
    title: "Outstanding Report",
    link: "/reports/outstanding-report",
    Icon: MdOutlinePending,
    category: "Finance",
    color: "from-orange-500 to-orange-600",
  },
  {
     id:"16",
    title: "Auction Report",
    link: "/reports/auction-report",
    Icon: RiAuctionFill,
    category: "Reports",
    color: "from-pink-500 to-pink-600",
  },
 
  {
     id:"17",
    title: "Lead Report",
    link: "/reports/lead-report",
    Icon: MdMan,
    category: "Reports",
    color: "from-purple-500 to-purple-600",
  },
  {
     id:"18",
    title: "Pigme Report",
    link: "/reports/pigme-report",
    Icon: LiaCalculatorSolid,
    category: "Finance",
    color: "from-yellow-500 to-yellow-600",
  },
  {
     id:"19",
    title: "Loan Report",
    link: "/reports/loan-report",
    Icon: GiMoneyStack,
    category: "Finance",
    color: "from-green-500 to-green-600",
  },
  {
       id:"20",
    title: "Sales Report",
    link: "/reports/sales-report",
    Icon: FaUserCheck,
    category: "Reports",
    color: "from-blue-500 to-blue-600",
  },
  {
     id:"21",
    title: "Payment Summary",
    link: "/reports/payment-summary",
    Icon: TbReportSearch,
    category: "Finance",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id:"22",
    title: "Monthly Installment Turnover",
    link: "/reports/monthly-install-turnover",
    Icon: SlCalender,
    category: "Employee",
    color: "from-blue-500 to-blue-600",
  },
  {
    id:"23",
    title: "Monthly Attendance Report",
    link: "/reports/employee-monthly-report",
    category: "Employee",
    Icon: BsCalendarDate,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id:"24",
    title: "Payout Salary Report",
    link: "/reports/payout-salary-report",
    category: "Employee",
    Icon: HiOutlineBanknotes,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id:"25",
    title: "Commission Report",
    link: "/reports/target-commission",
    category: "Agent",
   Icon: TbGraph,
   color: "from-yellow-500 to-yellow-600",
  },
   {
    id:"26",
    title: "Incentive Report",
    link: "/reports/target-incentive",
    category: "Employee",
   Icon: TbGraphFilled,
   color: "from-indigo-500 to-indigo-600",
  },
    {
    id:"27",
    title: "Unverified Customer Report",
    link: "/reports/unverified-customer-report",
    category: "Customer",
   Icon: MdCancel,
   color: "from-blue-500 to-blue-600",
  },
      {
    id:"28",
    title: "Remaining Salary Report",
    link: "/reports/salary-remaining",
    category: "Employee",
   Icon: MdCancel,
   color: "from-blue-500 to-blue-600",
  },
     {
    id:"29",
    title: "Chit Asking Month Report",
    link: "/reports/chit-asking-month-report",
    category: "Customer",
   Icon: MdCalendarMonth,
   color: "from-blue-500 to-blue-600",
  },
];

const categories = ["All", "Reports", "Customer", "Agent" ,"Employee",  "Finance",];

const Reports = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewType, setViewType] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter by category first, then by search query
  const filteredMenus = subMenus
    .filter((menu) => activeCategory === "All" || menu.category === activeCategory)
    .filter((menu) => 
      menu.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div>
      <div className="min-w-screen min-h-screen flex mt-20">
        {<Navbar />}
        <Sidebar />

        <div className="w-[300px] bg-gray-50 min-h-screen p-4 border-r border-gray-200">
          {filteredMenus.map(({ title, link, Icon, red }) => (
            <NavLink
              key={link}
              to={link}
              className={({ isActive }) =>
                `whitespace-nowrap my-2 flex items-center gap-2 font-medium rounded-3xl hover:bg-gray-300 p-3 ${
                  red ? "text-red-800" : "text-gray-900"
                } ${isActive ? "bg-gray-200 border-r-8 border-blue-300" : ""}`
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

        <div className="flex-grow p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          {location.pathname === "/reports" ? (
            <>
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative max-w-3xl mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <IoSearchOutline className="text-gray-400 text-2xl transition-all duration-300" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-16 py-4 text-lg bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md hover:shadow-lg focus:shadow-xl transition-all duration-300 placeholder:text-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <IoCloseCircle className="text-3xl" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      activeCategory === category
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                        : "bg-white text-gray-800 hover:bg-gray-50 border border-gray-200"
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
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                      : "bg-white text-gray-800 hover:bg-gray-50 border border-gray-200"
                  }`}
                  title="Grid View"
                >
                  <BiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewType === "list"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                      : "bg-white text-gray-800 hover:bg-gray-50 border border-gray-200"
                  }`}
                  title="List View"
                >
                  <TbList size={20} />
                </button>
              </div>

              {/* No Results Message */}
              {filteredMenus.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <IoSearchOutline className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No reports found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )}

              {/* Grid View */}
              {viewType === "grid" && filteredMenus.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMenus.map(({ title, Icon, link, color }) => (
                    <div
                      key={link}
                      onClick={() => navigate(link)}
                      className="group cursor-pointer h-full"
                    >
                      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full hover:-translate-y-1 border border-gray-100">
                        <div
                          className={`bg-gradient-to-br ${color} h-24 flex items-center justify-center relative overflow-hidden`}
                        >
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0 bg-white mix-blend-overlay"></div>
                          </div>
                          <div className="relative">
                            <Icon className="text-5xl text-white drop-shadow-lg" />
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {title}
                          </h3>
                          <div className="mt-4 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-sm font-medium">
                              View Report
                            </span>
                            <svg
                              className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                filteredMenus.length > 0 && (
                  <div className="space-y-3">
                    {filteredMenus.map(({ title, Icon, link, color, id }) => (
                      <div
                        key={id}
                        onClick={() => navigate(link)}
                        className="group cursor-pointer"
                      >
                        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:-translate-x-1 overflow-hidden">
                          <div className="flex items-center p-5 hover:bg-gray-50 transition-colors">
                            <div
                              className={`bg-gradient-to-br ${color} rounded-lg p-4 mr-5 flex-shrink-0`}
                            >
                              <Icon className="text-2xl text-white" />
                            </div>
                            <div className="flex-grow">
                              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                Click to view detailed report
                              </p>
                            </div>
                            <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                              <svg
                                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
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