import { NavLink, Outlet } from "react-router-dom";
import { useState, Fragment, useRef } from "react";
import Sidebar from "../components/layouts/Sidebar";
import { FaWhatsapp } from "react-icons/fa";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { FaFacebookSquare } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { LiaSmsSolid } from "react-icons/lia";

// const mainMenus = [
//   {
//     key: "#main-1",
//     title: "Whatsapp Marketing",
//     icon: <FaWhatsapp size={20} />,
//     subMenus: [
//       {
//         key: "#1",
//         title: "Login",
//         link: "https://app.interakt.ai/login",
//         icon: <FaWhatsapp size={20} />,
//         newTab: true,
//       },

//       {
//         key: "#main-4",
//         title: "Due Message",
//         icon: <FaWhatsapp size={20} />,
//         subMenus: [
//           {
//             key: "#4",
//             title: "Due",
//             link: "/marketing/due-message",
//             icon: <RiMoneyRupeeCircleLine size={20} />,
//           },
//           {
//             key: "#6",
//             title: "Over Due",
//             link: "/marketing/over-due-message",
//             icon: <RiMoneyRupeeCircleLine size={28} />,
//           },
//         ],
//       },
//       {
//         key: "#main-6",
//         title: "Auction Message",
//         icon: <FaWhatsapp size={20} />,
//         subMenus: [
//           {
//         key: "#5",
//         title: "Auction Intimation Message",
//         link: "/marketing/auction-intimation-message",
//         icon: <RiMoneyRupeeCircleLine size={28} />,
//       },

//       {
//         key: "#12",
//         title: "Bid Winner",
//         link: "/marketing/bid-winner",
//         icon: <RiMoneyRupeeCircleLine size={28} />,
//       },
//         ],
//       },
//       {
//         key: "#main-5",
//         title: "Promo",
//         icon: <FaWhatsapp size={20} />,
//         subMenus: [
//           {
//         key: "#11",
//         title: "Promo",
//         link: "/marketing/what-promo",
//         icon: <FaWhatsapp size={20} />,
//       },
//           {
//         key: "#11",
//         title: "Customer promo",
//         link: "/marketing/what-customer-promo",
//         icon: <FaWhatsapp size={20} />,
//       },
//         ],
//       },
//     ],
//   },
//   {
//     key: "#main-2",
//     title: "Email Marketing",
//     icon: <MdEmail size={20} />,
//     subMenus: [
//       {
//         key: "#7",
//         title: " Due Email ",
//         link: "/marketing/due-email",
//         icon: <RiMoneyRupeeCircleLine size={20} />,
//       },
//       {
//         key: "#8",
//         title: "Over Due Email",
//         link: "/marketing/over-due-email",
//         icon: <RiMoneyRupeeCircleLine size={20} />,
//       },
//     ],
//   },
//   {
//     key: "#main-3",
//     title: "SMS Marketing",
//     icon: <LiaSmsSolid size={20} />,
//     subMenus: [
//       {
//         key: "#9",
//         title: " Due SMS Message ",
//         link: "/marketing/due-sms",
//         icon: <RiMoneyRupeeCircleLine size={20} />,
//       },
//       {
//         key: "#10",
//         title: "Over Due SMS Message",
//         link: "/marketing/over-due-sms",
//         icon: <RiMoneyRupeeCircleLine size={28} />,
//       },
//     ],
//   },
// ];

// const Marketing = () => {
//   const [openMenuIndex, setOpenMenuIndex] = useState(null);

//   const toggleMenu = (index) => {
//     setOpenMenuIndex((prevIndex) => (prevIndex === index ? null : index));
//   };

//   return (
//     <div className="w-screen flex mt-20">
//       <Sidebar />
//       <div className="flex min-h-screen">
//         <div className="w-[300px] bg-gray-50 min-h-screen p-4 space-y-4">
//           {mainMenus.map((menu, index) => {
//             const isOpen = openMenuIndex === index;
//             return (
//               <Fragment key={menu.key}>
//                 <div
//                   onClick={() => toggleMenu(index)}
//                   className="flex items-center gap-3 text-lg font-semibold text-blue-900 px-2 py-2 cursor-pointer hover:opacity-80 rounded-md transition"
//                 >
//                   {menu.icon}
//                   {menu.title}
//                   {menu.subMenus && (
//                     <span className="ml-auto">
//                       {isOpen ? (
//                         <AiOutlineMinus className="text-sm" />
//                       ) : (
//                         <AiOutlinePlus className="text-sm" />
//                       )}
//                     </span>
//                   )}
//                 </div>

//                 {/* Submenus */}
//                 {isOpen && menu.subMenus && (
//                   <ul className="ml-5 mt-2 space-y-1">
//                     {menu.subMenus.map((submenu) => (
//                       <li key={submenu.key}>
//                         <NavLink
//                           to={submenu.link}
//                           target={submenu.newTab ? "_blank" : "_self"}
//                           className={({ isActive }) =>
//                             `flex items-center gap-3 p-2 rounded-md transition font-medium ${
//                               submenu.red ? "text-red-700" : "text-blue-950"
//                             } ${
//                               isActive
//                                 ? "bg-blue-100 border-l-4 border-blue-400"
//                                 : "hover:bg-gray-200"
//                             }`
//                           }
//                         >
//                           {submenu.icon}
//                           {submenu.title}
//                         </NavLink>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </Fragment>
//             );
//           })}
//         </div>

//         <div className="flex-1 bg-white p-6">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };
const mainMenus = [
  {
    key: "#main-1",
    title: "Whatsapp Marketing",
    icon: <FaWhatsapp size={20} />,
    subMenus: [
      {
        key: "#1",
        title: "Login",
        link: "https://app.interakt.ai/login",
        icon: <FaWhatsapp size={20} />,
        newTab: true,
      },
      {
        key: "#main-4",
        title: "Due Message",
        icon: <FaWhatsapp size={20} />,
        subMenus: [
          {
            key: "#4",
            title: "Due",
            link: "/marketing/due-message",
            icon: <RiMoneyRupeeCircleLine size={22} />,
          },
          {
            key: "#6",
            title: "Overdue",
            link: "/marketing/over-due-message",
            icon: <RiMoneyRupeeCircleLine size={22} />,
          },
        ],
      },
      {
        key: "#main-6",
        title: "Auction Message",
        icon: <FaWhatsapp size={20} />,
        subMenus: [
          {
            key: "#5",
            title: "Auction Intimation Message",
            link: "/marketing/auction-intimation-message",
            icon: <RiMoneyRupeeCircleLine size={22} />,
          },
          {
            key: "#12",
            title: "Bid Winner",
            link: "/marketing/bid-winner",
            icon: <RiMoneyRupeeCircleLine size={22} />,
          },
        ],
      },
      {
        key: "#main-5",
        title: "Promotion",
        icon: <FaWhatsapp size={20} />,
        subMenus: [
          {
            key: "#11",
            title: "Promo",
            link: "/marketing/what-promo",
            icon: <FaWhatsapp size={20} />,
          },
          // {
          //   key: "#11",
          //   title: "Customer Promo",
          //   link: "/marketing/what-customer-promo",
          //   icon: <FaWhatsapp size={20} />,
          //   Example of sub-submenu
          //   subMenus: [
          //     {
          //       key: "#11-1",
          //       title: "Special Promo",
          //       link: "/marketing/special-promo",
          //       icon: <FaWhatsapp size={18} />,
          //     },
          //     {
          //       key: "#11-2",
          //       title: "Festival Promo",
          //       link: "/marketing/festival-promo",
          //       icon: <FaWhatsapp size={18} />,
          //     },
          //   ],
          // },
        ],
      },
    ],
  },
  {
    key: "#main-2",
    title: "Email Marketing",
    icon: <MdEmail size={20} />,
    subMenus: [
      {
        key: "#main-10",
        title: "Due Email",
        icon: <MdEmail size={20} />,
        subMenus: [
          {
            key: "#15",
            title: "Due",
            link: "/marketing/due-email",
            icon: <RiMoneyRupeeCircleLine size={22} />,
          },
          {
            key: "#16",
            title: "Overdue",
            link: "/marketing/over-due-email",
            icon: <RiMoneyRupeeCircleLine size={22} />,
          },
        ],
      },
      
    ],
  },
  // {
  //   key: "#main-3",
  //   title: "SMS Marketing",
  //   icon: <LiaSmsSolid size={20} />,
  //   subMenus: [
  //     {
  //       key: "#9",
  //       title: "Due SMS Message",
  //       link: "/marketing/due-sms",
  //       icon: <RiMoneyRupeeCircleLine size={20} />,
  //     },
  //     {
  //       key: "#10",
  //       title: "Over Due SMS Message",
  //       link: "/marketing/over-due-sms",
  //       icon: <RiMoneyRupeeCircleLine size={28} />,
  //     },
  //   ],
  // },
];

const Marketing = () => {
  const [openMenu, setOpenMenu] = useState({});

  const toggleMenu = (menuKey) => {
    setOpenMenu((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // ✅ Recursive menu rendering function
  const renderMenu = (menus, level = 0) => {
    return (
      <ul className={level > 0 ? "ml-5 mt-2 space-y-1" : ""}>
        {menus.map((menu) => {
          const hasSubMenu = menu.subMenus && menu.subMenus.length > 0;
          const isOpen = openMenu[menu.key];

          return (
            <Fragment key={menu.key}>
              <li>
                {menu.link ? (
                  <NavLink
                    to={menu.link}
                    target={menu.newTab ? "_blank" : "_self"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-2 rounded-md transition font-medium cursor-pointer 
                      ${isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200 text-blue-950"}`
                    }
                  >
                    {menu.icon}
                    <span>{menu.title}</span>
                  </NavLink>
                ) : (
                  <div
                    onClick={() => hasSubMenu && toggleMenu(menu.key)}
                    className={`flex items-center gap-3 p-2 rounded-md transition font-medium cursor-pointer 
                    ${isOpen ? "bg-gray-100 text-blue-950" : "hover:bg-gray-200 text-blue-950"}`}
                  >
                    {menu.icon}
                    <span>{menu.title}</span>
                    {hasSubMenu && (
                      <span className="ml-auto">
                        {isOpen ? <AiOutlineMinus /> : <AiOutlinePlus />}
                      </span>
                    )}
                  </div>
                )}

                {hasSubMenu && isOpen && renderMenu(menu.subMenus, level + 1)}
              </li>
            </Fragment>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="w-screen flex mt-20">
      <Sidebar />
      <div className="flex min-h-screen">
        <div className="w-[300px] bg-gray-50 min-h-screen p-4 space-y-4">
          {renderMenu(mainMenus)}
        </div>

        <div className="flex-1 bg-white p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Marketing;
