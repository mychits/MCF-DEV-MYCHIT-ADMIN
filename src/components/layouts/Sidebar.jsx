import { Fragment, useRef, useState } from "react";
import { BsArrowLeftShort, BsChevronDown } from "react-icons/bs";
import { RiDashboardFill } from "react-icons/ri";
import { SiGoogleanalytics } from "react-icons/si";
import { TbCategoryPlus } from "react-icons/tb";
import { IoIosPersonAdd } from "react-icons/io";
import { BsCash } from "react-icons/bs";
import { GrAnalytics } from "react-icons/gr";
import { CgWebsite } from "react-icons/cg";
import { IoIosSettings } from "react-icons/io";
import { IoIosHelpCircle } from "react-icons/io";
import { RiAuctionLine } from "react-icons/ri";
import { FaPeopleArrows } from "react-icons/fa";
import { GiGoldBar } from "react-icons/gi";
import { IoPeopleOutline } from "react-icons/io5";
import { GoGraph } from "react-icons/go";
import { GiTakeMyMoney } from "react-icons/gi";
import { PiCalculatorBold } from "react-icons/pi";
import { HiOutlineUserGroup } from "react-icons/hi";
import ids from "../../data/ids";
import { FaClipboardList } from "react-icons/fa";
import { TbArrowsLeftDown } from "react-icons/tb";
import { RiUserLocationFill } from "react-icons/ri";
import { FaMapLocationDot } from "react-icons/fa6";
import { HiCurrencyRupee } from "react-icons/hi2";
import { TbSettings } from "react-icons/tb";
import { MdOutlineGroups } from "react-icons/md";
import { FaFilter } from "react-icons/fa";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { FaUserTie } from "react-icons/fa6";
import { FaPersonMilitaryPointing } from "react-icons/fa6";
import { GiRoundTable } from "react-icons/gi";
import { GrUserSettings } from "react-icons/gr";
import { TbCoinRupeeFilled } from "react-icons/tb";
import { TbReceiptRupee } from "react-icons/tb";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { FaHandshake } from "react-icons/fa";
import { SiQuicklook } from "react-icons/si";
import { BiTransfer } from "react-icons/bi";
import { FaMobileAlt } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { MdAccountBalanceWallet } from "react-icons/md";
import { LuTarget } from "react-icons/lu";
import { TbTargetArrow } from "react-icons/tb";
import { FaExclamationTriangle } from "react-icons/fa";
const MenuSidebar = [
  {
    id: "$1",
    title: "Dashboard",
    icon: <RiDashboardFill />,
    link: "/dashboard",
  },
  {
    id: "$!GPP",
    title: "Quick Search",
    icon: <SiQuicklook />,
    link: "/quick-search",
  },
  {
    id: "$PP",
    title: "Analytics",
    icon: <SiGoogleanalytics />,
    link: "/analytics",
  },
  {
    id: "$2",
    title: "Groups ",
    spacing: true,
    icon: <TbCategoryPlus />,
    link: "/group-menu",
  },
  {
    id: ids.three,
    title: "Customers",
    icon: <IoIosPersonAdd />,
   link: "/customer-menu",
    // submenu: true,
    // submenuItems: [
    //   {
    //     id: "$101#",
    //     title: "Customers",
    //     icon: <IoIosPersonAdd size={20} />,
    //     link: "/user",
    //   },
    //   {
    //     id: "&*&",
    //     title: "Unverified Customers",
    //     icon: <MdCancel size={25} />,
    //     link: "/un-approved-customer",
    //   },
    // ],
    
  },
  ,
  // {
  //   id: "&*&",
  //   title: "Unverified Customers",
  //   icon: <MdCancel />,
  //   link: "/un-approved-customer",
  // },
  {
    id: "$4",
    title: "Enrollments ",
    icon: <FaPeopleArrows />,
   link: "/enroll-menu",
    //  submenu: true,
    // submenuItems: [
    //   {
    //     id: "$101#%",
    //     title: "Enrollments",
    //     icon: <FaPeopleArrows size={20} />,
    //     link: "/enrollment",
    //   },
    //   {
    //     id: "$83",
    //     title: "Mobile Enrollments",
    //     icon: <FaMobileAlt size={25} />,
    //     link: "/mobile-app-enroll",
    //   },
    // ],
  },
  
  // {
  //   id: "$83",
  //   title: "Mobile Enrollments ",
  //   icon: <FaMobileAlt />,
  //   link: "/mobile-app-enroll",
  // },
  {
    id: "$9856",
    title: "Legals ",
    icon: <FaHandshake />,
    link: "/legals-menu"
//      submenu: true,
//     submenuItems: [
//   {
//     id: "$67",
//     title: "Guarantor ",
//     icon: <FaHandshake />,
//     link: "/guarantor",
//   },
// ],
  },

  {
    id: "$18",
    title: "Tasks",
    icon: <FaClipboardList />,
    link: "/task",
  },
  {
    id: ids.seven,
    title: "Staff",
    icon: <GiRoundTable />,
    link: "/staff-menu"
    //submenu: true,
    // submenuItems: [
    //   {
    //     id: "$101",
    //     title: "All",
    //     icon: <HiOutlineUserGroup size={20} />,
    //     link: "/staff",
    //   },
    //   {
    //     id: "$102",
    //     title: "Agent",
    //     icon: <FaPersonMilitaryPointing size={20} />,
    //     link: "/agent",
    //   },
    //   {
    //     id: "$103",
    //     title: "Employee",
    //     icon: <FaUserTie size={18} />,
    //     link: "/employee",
    //   },
    // ],
  },
   {
      title: "Target Management",
      icon: <LuTarget />,
     // submenu: true,
      link: "/target-menu"
      // submenuItems: [
      //   {
      //     title: "Target",
      //     icon: <TbTargetArrow />,
      //     link: "/target",
      //   },
      // ],
    },

  {
    id: "$7",
    title: "Leads",
    icon: <IoPeopleOutline />,
    link: "/lead",
  },
  {
    id: "$7865",
    title: "Other Services",
    icon: <GiTakeMyMoney />,
   link: "/other-service-menu",
//     submenu: true,
//     submenuItems: [
//   {
//     id: "$8",
//     title: "Loans",
//     icon: <GiTakeMyMoney size={20} />,
//     link: "/loan",
//   },
//   {
//     id: "$9",
//     title: "Pigme",
//     icon: <PiCalculatorBold size={20} />,
//     link: "/pigme",
//   },
// ],
},
  {
    id: "$2564",
    title: "Approvals",
    icon: <FaExclamationTriangle />,
    link: "/approval-menu",
  },
  {
    id: ids.eleven,
    title: "Auctions ",
    icon: <RiAuctionLine />,
    link: "/auction",
  },

  {
    id: "$#S",
    title: "Accounts",
    icon: <MdAccountBalanceWallet />,
    link: "/payment-menu/"
   // submenu: true,
   // submenuItems: [
     // {
        // id: "&^$1",
        // title: "Payments ",
        // icon: <BsCash size={20} />,
        // link: "/payment-in-out-menu"
        // submenu: true,
        // submenuItems: [
        //   {
        //     id: "&^$2",
        //     title: "Pay-In ",
        //     icon: <TbReceiptRupee size={20} />,
        //     link: "/pay-in-menu",
        //   },
        //   {
        //     id: "&^$3",
        //     title: "Pay-Out ",
        //     icon: <RiMoneyRupeeCircleLine size={20} />,
        //     link: "/pay-out-menu",
        //   },
        // ],
     // },
  //  ],
  },

  {
    id: "$12",
    title: "Reports",
    icon: <GrAnalytics />,
    link: "/reports",
  },
  {
    id: ids.fourteen,
    title: "Marketing",
    icon: <GoGraph />,
    link: "/marketing",
  },

  {
    id: "$199",
    title: "General Settings",
    icon: <TbSettings />,
    submenu: true,
    submenuItems: [
      {
        id: "#1",
        title: "Collection",
        icon: <HiCurrencyRupee size="20" />,
        hider: true,
        newTab: true,
        submenu: true,
        submenuItems: [
          {
            id: ids.fourteen,
            title: "Collection Area",
            icon: <FaMapLocationDot />,
            link: "/collection-area-request",
          },
        
        ],
      },
      // {
      //   id: "#2",
      //   title: "Groups",
      //   icon: <MdOutlineGroups size="25" />,
      //   hider: true,
      //   newTab: true,
      //   submenu: true,
      //   submenuItems: [
      //     {
      //       id: ids.sixteen,
      //       title: "Mobile Access Groups",
      //       icon: <FaFilter size={18} />,
      //       link: "/filter-groups",
      //     },
      //   ],
      // },
      {
        id: "#3",
        title: "Employee",
        hider: true,
        icon: <FaUserTie size={18} />,
        newTab: true,
        submenu: true,
        submenuItems: [
          {
            id: "#206",
            title: "Employee Profile",
            icon: <GrUserSettings size={18} />,
            link: "/employee-profile",
          },
        ],
      },
       {
        id: "#3",
        title: "Transfer",
        hider: true,
        icon: <BiTransfer  size={18} />,
        newTab: true,
        submenu: true,
        submenuItems: [
          {
            id: "#206",
            title: "Soft Transfer",
            icon: <GrUserSettings size={18} />,
            link: "/soft-transfer",
            
          },
            {
            id: "#206",
            title: "Hard Transfer",
            icon: <GrUserSettings size={18} />,
            link: "/hard-transfer",
            
          },
        ],
      },
    ],
  },

  {
    id: "$15",
    title: "Other Sites",
    icon: <CgWebsite />,
    submenu: true,
    submenuItems: [
      {
        id: "#1",
        title: "Gold Admin",
        link: "http://prod-new-gold-chit.s3-website.eu-north-1.amazonaws.com/",
        newTab: true,
      },
      {
        id: "#2",
        title: "Chit Plans Admin",
        link: "https://erp.admin.mychits.co.in/chit-enrollment-plan/admin/",
        newTab: true,
      },
      {
        id: "#3",
        title: "Chit Enrollment Request",
        link: "https://erp.admin.mychits.co.in/src/request/enrollment.php?user-role=&user-code=",
        newTab: true,
      },
    ],
  },
  {
    id: "$16",
    title: "Settings",
    icon: <IoIosSettings />,
    link: "/lead-setting",
  },
  {
    id: "$17",
    title: "Help & Support",
    icon: <IoIosHelpCircle />,
    link: "/help",
  },
];

const Sidebar = () => {
  const ref = useRef(null);
  const [open, setOpen] = useState(true);
  const [submenuOpenIndex, setSubmenuOpenIndex] = useState(null);

  const [nestedSubmenuOpenIndex, setNestedSubmenuOpenIndex] = useState({});

  const toggleSubMenu = (index) => {
    setSubmenuOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const toggleNestedSubMenu = (submenuIndex, subIndex) => {
    setNestedSubmenuOpenIndex((prevState) => ({
      ...prevState,
      [submenuIndex]: prevState[submenuIndex] === subIndex ? null : subIndex,
    }));
  };

  return (
    <div
      ref={ref}
      className={`bg-secondary min-h-screen max-h-auto p-5 pt-8  ${
        open ? "w-64" : "w-20"
      } duration-300 relative`}
    >
      <BsArrowLeftShort
        className={`bg-white text-secondary text-3xl rounded-full absolute -right-3 top-9 border border-secondary cursor-pointer ${
          !open && "rotate-180"
        }`}
        onClick={() => setOpen(!open)}
      />
      <div className="inline-flex">
        <GiGoldBar
          className={`bg-amber-300 text-4xl rounded cursor-pointer block float-left mr-2 duration-500 ${
            open && "rotate-[360deg]"
          }`}
        />
        <h3
          className={`text-white origin-left font-medium text-2xl ${
            !open && "scale-0"
          } duration-300 `}
        >
          MyChits
        </h3>
      </div>

      <ul className="pt-2">
        {MenuSidebar.map((menu, index) => {
          const isSpecialMenu =
            menu.title === "Collections" || menu.title === "Groups";
          const isOpen = submenuOpenIndex === index;

          return (
            <Fragment key={menu.id}>
              <a href={menu.link} onClick={() => toggleSubMenu(index)}>
                <li
                  className={`text-gray-300 text-sm flex items-center p-2 gap-x-4 cursor-pointer  hover:bg-light-white rounded-2xl  ${
                    menu.spacing ? "mt-9" : "mt-2"
                  }`}
                >
                  <span className="text-2xl block float-left">{menu.icon}</span>
                  <span
                    className={`text-base font-medium flex-1 ${
                      !open && "hidden"
                    }`}
                  >
                    {menu.title}
                  </span>
                  {menu.submenu &&
                    open &&
                    (isSpecialMenu ? (
                      isOpen ? (
                        <AiOutlineMinus className="ml-auto transition-transform duration-200" />
                      ) : (
                        <AiOutlinePlus className="ml-auto transition-transform duration-200" />
                      )
                    ) : (
                      <BsChevronDown
                        className={`${
                          isOpen ? "rotate-180" : "rotate-0"
                        } transition-transform duration-200`}
                      />
                    ))}
                </li>
              </a>

              {menu.submenu && isOpen && open && (
                <ul className="ml-4">
                  {menu.submenuItems.map((submenuItem, subIndex) => (
                    <Fragment key={submenuItem.id}>
                      <a
                        href={submenuItem.link}
                        target={submenuItem.newTab ? "_blank" : "_self"}
                      >
                        <li
                          onClick={() => toggleNestedSubMenu(index, subIndex)}
                          className={`${
                            submenuItem.red ? "text-red-300" : "text-gray-300"
                          } select-none text-sm flex items-center gap-x-4 cursor-pointer p-2 px-5 hover:bg-light-white  rounded-2xl`}
                        >
                          {submenuItem.icon}
                          {submenuItem.title}
                          {submenuItem.submenu &&
                            (nestedSubmenuOpenIndex[index] === subIndex ? (
                              <AiOutlineMinus className="ml-auto transition-transform duration-200" />
                            ) : (
                              <AiOutlinePlus className={`ml-auto`} />
                            ))}
                        </li>
                      </a>

                      {submenuItem.submenu &&
                        nestedSubmenuOpenIndex[index] === subIndex && (
                          <ul className="ml-8">
                            {submenuItem.submenuItems.map((subSubItem) => (
                              <a
                                key={subSubItem.id}
                                href={subSubItem.link}
                                target={subSubItem.newTab ? "_blank" : "_self"}
                              >
                                <li
                                  className={`${
                                    subSubItem.red
                                      ? "text-red-300"
                                      : "text-gray-300"
                                  } select-none text-sm flex items-center gap-x-4 cursor-pointer p-2 px-5 hover:bg-light-white rounded-md`}
                                >
                                  {subSubItem.icon}
                                  {subSubItem.title}
                                </li>
                              </a>
                            ))}
                          </ul>
                        )}
                    </Fragment>
                  ))}
                </ul>
              )}
            </Fragment>
          );
        })}
      </ul>

      <div
        className="rounded-md fixed right-1 bottom-20 bg-blue-900 p-2 bg-opacity-30 hover:bg-opacity-100 active:scale-95 z-50 animate-bounce"
        onClick={() => {
          ref.current.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <TbArrowsLeftDown className="text-3xl text-white rotate-90" />
      </div>
    </div>
  );
};

export default Sidebar;
