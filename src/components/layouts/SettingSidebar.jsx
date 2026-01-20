import React, { useState } from "react";
import { BsArrowLeftShort, BsChevronDown } from "react-icons/bs";
import { RiDashboardFill } from "react-icons/ri";
import { SiGoogleanalytics } from "react-icons/si";
import { CgProfile } from "react-icons/cg";
import { IoIosHelpCircle } from "react-icons/io";
import { GiGoldBar } from "react-icons/gi";
import { IoPeopleOutline } from "react-icons/io5";
import { TiSpanner } from "react-icons/ti";
import { RiAdminLine } from "react-icons/ri";
import { MdOutlineGroups } from "react-icons/md";
import { BsPersonCheck } from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { MdAppSettingsAlt } from "react-icons/md";
import { ImHappy } from "react-icons/im";
import { FaPersonMilitaryPointing } from "react-icons/fa6";
import { TbTargetArrow } from "react-icons/tb";
import { LuTarget } from "react-icons/lu";
import { BsFileBarGraph } from "react-icons/bs";
import { TbGraph } from "react-icons/tb";
import { TbGraphFilled } from "react-icons/tb";
import { MdAccountBalanceWallet } from "react-icons/md";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { FaGift } from "react-icons/fa6";
const MenuSidebar = [
  { title: "Dashboard", icon: <RiDashboardFill />, link: "/dashboard" },
  {
    title: "Analytics",
    icon: <SiGoogleanalytics />,
    link: "/analytics",
  },

  {
    title: "App Settings ",
    spacing: true,
    icon: <TiSpanner />,
    submenu: true,
    submenuItems: [
      {
        title: "Groups",
        icon: <MdOutlineGroups />,
        submenu: true,
        submenuItems: [
          {
            title: "Mobile Access",
            icon: <MdAppSettingsAlt size={20} />,
            link: "/group-menu/filter-groups",
          },
          {
            title: "Dream Asset",
            icon: <ImHappy size={20} />,
            link: "/lead-setting/app-settings/groups/asset",
          },
          {
            title: "Become Agent",
            icon: <FaPersonMilitaryPointing size={20} />,
            link: "/lead-setting/app-settings/groups/become-agent",
          },
        ],
      },
    ],
  },
  {
    title: "Insurance",
    icon: <IoPeopleOutline />,
    link: "/insurance",
  },
  {
    title: "Gift Received",
    icon: <FaGift />,
    link: "/gift-received",
  },

  {
    title: "Reward",
    icon: <FaGift />,
    submenu: true,
    submenuItems: [
      // {
      //   title: "Generate Reward Points",
      //   icon: <FaGift size={20} />,
      //   link: "/employee-reward-points",
      // },
      {
        title: "Reward Settings",
        icon: <FaGift size={20} />,
        link: "/reward-settings",
      },
      // {
      //   title: "Redeem Reward Points",
      //   icon: <FaGift size={20} />,
      //   link: "/redeem-reward-points",
      // },
    ],
  },

  {
    title: "Designations",
    icon: <IoPeopleOutline />,
    link: "/designation",
  },
  {
    title: "Administrative Privileges",
    icon: <RiAdminLine />,
    link: "/administrative-privileges",
  },
  {
    title: "Admin Access Rights",
    icon: <BsPersonCheck />,
    link: "/admin-access-rights",
  },

  // {
  //   title: "Target Management",
  //   icon: <LuTarget />,
  //   submenu: true,

  //   submenuItems: [
  //     {
  //       title: "Target",
  //       icon: <TbTargetArrow />,
  //       link: "/target",
  //     },
  //     {
  //       title: "Reports",
  //       icon: <BsFileBarGraph />,
  //       submenu: true,
  //       submenuItems: [
  //         {
  //           title: "Commission Report",
  //           icon: <TbGraph size={20} />,
  //           link: "/target-commission",
  //         },
  //         {
  //           title: "Incentive Report",
  //           icon: <TbGraphFilled size={20} />,
  //           link: "/target-incentive",
  //         },
  //       ],
  //     },
  //     // {
  //     //   title: "Accounts",
  //     //   icon: <MdAccountBalanceWallet />,
  //     //   submenu: true,
  //     //   submenuItems: [
  //     //     {
  //     //       title: "PayOut Menu",
  //     //       icon: <RiMoneyRupeeCircleFill size={20} />,
  //     //       link:"/target-payout-menu"

  //     //     },
  //     //   ],
  //     // },
  //   ],
  // },

  {
    title: "Penalty Management",
    icon: <RiMoneyRupeeCircleFill />,
    submenu: true,
    submenuItems: [
      {
        title: "Penalty Settings",
        icon: <TiSpanner size={20} />,
        link: "/penalty-settings",
      },
    ],
  },

  {
    title: "Profile",
    spacing: true,
    icon: <CgProfile />,
    link: "/profile",
  },
  { title: "Help & Support", icon: <IoIosHelpCircle />, link: "/help" },
];

const SettingSidebar = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const [expandedMenus, setExpandedMenus] = useState(new Set());

  const toggleExpand = (key) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const isExpanded = (key) => expandedMenus.has(key);

  const renderMenu = (items, level = 0, pathPrefix = "") => {
    return items.map((item, index) => {
      const key = pathPrefix ? `${pathPrefix}/${index}` : `${index}`;
      const isSubmenu = level > 0;

      const textSizeClass = "text-sm";
      const titleFontSizeClass = isSubmenu
        ? "text-sm font-normal"
        : "text-base font-medium";
      const iconSizeClass = isSubmenu ? "text-xl" : "text-2xl";
      const paddingLeftClass = isSubmenu ? "pl-6 md:pl-8" : "";

      return (
        <div key={key} className={`${item.spacing ? "mt-9" : "mt-2"}`}>
          {item.submenu ? (
            <>
              <div
                className={`text-gray-300 ${textSizeClass} ${paddingLeftClass} flex items-center justify-between gap-x-4 cursor-pointer p-2 hover:bg-light-white rounded-2xl`}
                onClick={() => toggleExpand(key)}
              >
                <div className="flex items-center gap-x-4">
                  {item.icon && (
                    <span className={iconSizeClass}>{item.icon}</span>
                  )}
                  {open && (
                    <span className={titleFontSizeClass}>{item.title}</span>
                  )}
                </div>
                {open && (
                  <span className={isSubmenu ? "text-sm" : "text-xl"}>
                    {item.title === "Groups" ? (
                      isExpanded(key) ? (
                        <AiOutlineMinus size={isSubmenu ? 14 : 16} />
                      ) : (
                        <AiOutlinePlus size={isSubmenu ? 14 : 16} />
                      )
                    ) : (
                      <BsChevronDown
                        size={isSubmenu ? 14 : 16}
                        className={`transition-transform duration-200 ${
                          isExpanded(key) ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </span>
                )}
              </div>
              {open && isExpanded(key) && item.submenuItems && (
                <div className="ml-3 md:ml-4">
                  {" "}
                  {renderMenu(item.submenuItems, level + 1, key)}
                </div>
              )}
            </>
          ) : (
            <Link to={item.link || "#"}>
              <div
                className={`text-gray-300 ${textSizeClass} ${paddingLeftClass} flex items-center gap-x-4 cursor-pointer p-2 hover:bg-light-white rounded-2xl ${
                  location.pathname === item.link ? "bg-light-white" : ""
                }`}
              >
                {item.icon && (
                  <span className={iconSizeClass}>{item.icon}</span>
                )}
                {open && (
                  <span className={titleFontSizeClass}>{item.title}</span>
                )}
              </div>
            </Link>
          )}
        </div>
      );
    });
  };

  return (
    <div
      className={`bg-secondary min-h-screen p-5 pt-8 duration-300 relative ${
        open ? "w-64" : "w-20"
      }`}
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
          className={`text-white origin-left font-medium text-2xl duration-300 ${
            !open && "scale-0"
          }`}
        >
          Settings
        </h3>
      </div>
      <ul className="pt-2">{renderMenu(MenuSidebar)}</ul>
    </div>
  );
};

export default SettingSidebar;
