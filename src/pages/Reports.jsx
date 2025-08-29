// import Sidebar from "../components/layouts/Sidebar";
// import {NavLink, Outlet } from "react-router-dom";
// import Navbar from "../components/layouts/Navbar";
// import { FaCalendarDays } from "react-icons/fa6";
// import { FaPeopleGroup } from "react-icons/fa6";
// import { FaPeopleArrows } from "react-icons/fa";
// import { MdOutlineEmojiPeople } from "react-icons/md";
// import { FaPersonWalkingArrowLoopLeft } from "react-icons/fa6";
// import { FaUserTie } from "react-icons/fa";
// import { RiMoneyRupeeCircleFill } from "react-icons/ri";
// import { MdOutlineReceiptLong } from "react-icons/md";
// import { RiAuctionFill } from "react-icons/ri";
// import { MdMan } from "react-icons/md";
// import { LiaCalculatorSolid } from "react-icons/lia";
// import { GiMoneyStack } from "react-icons/gi"
// const subMenus = [
//   { title: "Daybook", link: "/reports/daybook" ,Icon:FaCalendarDays },
//   { title: "Group Report", link: "/reports/group-report" ,Icon:FaPeopleGroup  },
//   { title: "Enrollment Report", link: "/reports/enrollment-report" ,Icon:FaPeopleArrows },
//   { title: "All Customer Report", link: "/reports/all-user-report" ,Icon:FaPersonWalkingArrowLoopLeft },
//   { title: "Customer Report", link: "/reports/user-report",Icon:MdOutlineEmojiPeople},
//   { title: "Employee Report", link: "/reports/employee-report",Icon: FaUserTie },
//   { title: "Commission Report", link: "/reports/commission-report" ,Icon:RiMoneyRupeeCircleFill },
//   { title: "Receipt Report", link: "/reports/receipt",Icon:MdOutlineReceiptLong  },
//   { title: "Auction Report", link: "/reports/auction-report",Icon:RiAuctionFill  },
//   { title: "Lead Report", link: "/reports/lead-report",Icon:MdMan  },
//   { title: "Pigme Report", link: "/reports/pigme-report",Icon:LiaCalculatorSolid  },
//   { title: "Loan Report", link: "/reports/loan-report",Icon:GiMoneyStack  },
// ];
// const Reports = () => {
//   return (
//     <div>
//       <div className="w-screen flex mt-20">
//        {document.location.pathname ==="/reports" && <Navbar/>}
//         <Sidebar />
//         <div className="flex-grow">
//           <div className="w-[300px] bg-gray-50 h-full  p-4">
//             {subMenus.map(({ title, link, Icon, red }) => (
//               <NavLink
            
//                 className={({ isActive }) =>
//                   `my-2 flex items-center gap-2 font-medium rounded-md hover:bg-gray-300  p-3 ${
//                     red ? "text-red-800" : "text-blue-950"
//                   } ${isActive ? "bg-gray-200 border-l-8 border-blue-300" : ""}`
//                 }
//                 to={link}
//               >
//                 {({ isActive }) => (
//               <>
//                 <Icon className={`${isActive ? "animate-bounce" : ""}`} />
//                 {title}
//               </>
//             )}
//               </NavLink>
//             ))}
//           </div>
//         </div>
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default Reports;

import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { MdOutlinePending } from "react-icons/md";
import {
  FaCalendarDays,
  FaPeopleGroup,
  FaPeopleArrows,
  FaUserCheck,
  FaUserTie,
} from "react-icons/fa6";
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
const subMenus = [
  { title: "Daybook", link: "/reports/daybook", Icon: FaCalendarDays },
  { title: "Group Report", link: "/reports/group-report", Icon: FaPeopleGroup },
  {
    title: "Enrollment Report",
    link: "/reports/enrollment-report",
    Icon: FaPeopleArrows,
  },
  {
    title: "All Customer Report",
    link: "/reports/all-user-report",
    Icon: FaPersonWalkingArrowLoopLeft,
  },
  {
    title: "Customer Report",
    link: "/reports/user-report",
    Icon: MdOutlineEmojiPeople,
  },
  {
    title: "Employee Report",
    link: "/reports/employee-report",
    Icon: FaUserTie,
  },
  {
    title: "Commission Report",
    link: "/reports/commission-report",
    Icon: RiMoneyRupeeCircleFill,
  },
  {
    title: "Receipt Report",
    link: "/reports/receipt",
    Icon: MdOutlineReceiptLong,
  },
  {
    title: "PayOut Report",
    link: "/reports/payout",
    Icon: MdOutlinePayment ,
  },
  {
    title: "Due Report",
    link: "/reports/due-report",
    Icon: MdOutlinePending  ,
  },
  {
    title: "Auction Report",
    link: "/reports/auction-report",
    Icon: RiAuctionFill,
  },
  { title: "Lead Report", link: "/reports/lead-report", Icon: MdMan },
  {
    title: "Pigme Report",
    link: "/reports/pigme-report",
    Icon: LiaCalculatorSolid,
  },
  { title: "Loan Report", link: "/reports/loan-report", Icon: GiMoneyStack },
  { title: "Sales Report", link: "/reports/sales-report", Icon: FaUserCheck },
   { title: "Payment Summary", link: "/reports/payment-summary", Icon: TbReportSearch },
];

const Reports = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bgColors = [
"bg-gray-200"
  ];

  return (
    <div>
      <div className="min-w-screen min-h-screen flex mt-20">
        {<Navbar />}
        <Sidebar />

        <div className="w-[300px]  bg-gray-50 min-h-screen p-4">
          {subMenus.map(({ title, link, Icon, red }) => (
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

        <div className="flex-grow p-6  ">
          {location.pathname === "/reports" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 w-full">
              {subMenus.map(({ title, Icon, link }, idx) => (
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
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

