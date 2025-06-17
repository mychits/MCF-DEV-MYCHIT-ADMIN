import React, { useState } from "react";
import { BsArrowLeftShort, BsChevronDown } from "react-icons/bs";
import { RiDashboardFill } from "react-icons/ri";
import { SiGoogleanalytics } from "react-icons/si";
import { TbCategoryPlus } from "react-icons/tb";
import { IoIosPersonAdd } from "react-icons/io";
import { BsCash } from "react-icons/bs";
import { GrAnalytics } from "react-icons/gr";
import { CgProfile } from "react-icons/cg";
import { IoIosSettings } from "react-icons/io";
import { IoIosHelpCircle } from "react-icons/io";
import { RiAuctionLine } from "react-icons/ri";
import { FaPeopleArrows, FaLayerGroup, FaUserLock } from "react-icons/fa";
import { GiGoldBar } from "react-icons/gi";
import { IoPeopleOutline } from "react-icons/io5";
import { TiSpanner } from "react-icons/ti";
import { RiAdminLine } from "react-icons/ri";
import { MdOutlineGroups } from "react-icons/md";
import { BsPersonCheck } from "react-icons/bs";
import { GoGraph } from "react-icons/go";
import { Link, useLocation } from "react-router-dom";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { MdAppSettingsAlt } from "react-icons/md";


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
        icon: <MdOutlineGroups/>,
        submenu: true,
        submenuItems: [
          {
            title: "Mobile Access",
            icon: <MdAppSettingsAlt size={20} />,
            link: "/lead-setting/app-settings/groups/mobile-access", 
          },
        ],
      },
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

   {
      title: "Agent Target",
      icon: <GoGraph />,
      link: "/target",
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

  // Store all expanded menu keys (e.g., '0', '0/0')
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

      return (
        <div key={key} className={`${item.spacing ? "mt-9" : "mt-2"}`}>
          {item.submenu ? (
            <>
              <div
                className={`text-gray-300 text-sm flex items-center justify-between gap-x-4 cursor-pointer p-2 ${
                  level > 0 ? "pl-8" : ""
                } hover:bg-light-white rounded-2xl`}
                onClick={() => toggleExpand(key)}
              >
                <div className="flex items-center gap-x-4">
                  {item.icon && <span className="text-2xl">{item.icon}</span>}
                  {open && (
                    <span className="text-base font-medium">{item.title}</span>
                  )}
                </div>
                {open && (
                  <span className="text-xl">
                    {item.title === "Groups" ? (
                      isExpanded(key) ? (
                        <AiOutlineMinus size={15}/>
                      ) : (
                        <AiOutlinePlus size={15}/>
                      )
                    ) : (
                      <BsChevronDown size={15}
                        className={`transition-transform duration-200 ${
                          isExpanded(key) ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </span>
                )}
              </div>
              {open && isExpanded(key) && item.submenuItems && (
                <div className="ml-2">
                  {renderMenu(item.submenuItems, level + 1, key)}
                </div>
              )}
            </>
          ) : (
            <Link to={item.link || "#"}>
              <div
                className={`text-gray-300 text-sm flex items-center gap-x-4 cursor-pointer p-2 ${
                  level > 0 ? "pl-8" : ""
                } hover:bg-light-white rounded-2xl ${
                  location.pathname === item.link ? "bg-light-white" : ""
                }`}
              >
                {item.icon && <span className="text-2xl">{item.icon}</span>}
                {open && (
                  <span className="text-base font-medium">{item.title}</span>
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
