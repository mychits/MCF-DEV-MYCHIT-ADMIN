import { IoIosLogOut } from "react-icons/io";
import { MdMenu } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { NavbarMenu } from "../../data/menu";
import ResponsiveMenu from "./ResponsiveMenu";
import Modal from "../modals/Modal";
import { AiTwotoneGold } from "react-icons/ai";
import { NavLink } from "react-router-dom";
import GlobalSearchBar from "../search/GlobalSearchBar";
import { CgProfile } from "react-icons/cg";
import { Button, Input } from "antd";
import { RiSettings3Line } from "react-icons/ri";
import { FiUser } from "react-icons/fi";

const Navbar = ({
  onGlobalSearchChangeHandler = () => { },
  visibility = false,
}) => {
  const [adminName, setAdminName] = useState("");
  const [onload, setOnload] = useState(true);
  const [showProfileCard, setShowProfileCard] = useState(false);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const profileRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOnload(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      const usr = localStorage.getItem("user");
      if (usr) {
        const admin = JSON.parse(usr);
        setAdminName(admin?.admin_name || "Super Admin");
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileCard(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef, notificationRef]);

  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const quickApprovals = [
    { title: "Unverified Customers", href: "/approval-menu/un-approved-customer", color: "text-blue-600", icon: "👥" },
    { title: "Mobile Enrollments", href: "/approval-menu/mobile-app-enroll", color: "text-amber-600", icon: "📱" },
    { title: "Unapproved Loans", href: "/approval-menu/un-approved-loans", color: "text-red-600", icon: "💰" },
  ];

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <nav className="w-full fixed top-0 left-0 z-50 bg-white shadow-md">
        <div
          className={`
    flex justify-between items-center py-2 px-10
    transition-all duration-700 ease-out transform
    ${onload ? "opacity-0 -translate-y-5" : "opacity-100 translate-y-0"}
  `}
        >
          <div className="text-2xl flex items-center gap-2 font-bold py-4 uppercase">
            <AiTwotoneGold />
            <p>MyChits</p>
            <p className="text-primary">Chit</p>
          </div>
          <div>
            <GlobalSearchBar
              onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
              visibility={visibility}
            />
          </div>

          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold " : "text-white font-medium "
            }
            to={"/reports/group-report"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${isActive
                    ? "bg-blue-200 text-blue-900 font-bold"
                    : "font-semibold"
                  }  `}
              >
                Group Report
              </Button>
            )}
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold" : "text-white font-medium "
            }
            to={"/reports/daybook"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${isActive
                    ? "bg-blue-200 text-blue-900 font-bold"
                    : "font-semibold"
                  }  `}
              >
                Day Book
              </Button>
            )}
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold " : "text-white font-medium "
            }
            to={"/reports"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${isActive
                    ? "bg-blue-200 text-blue-900 font-bold"
                    : "font-semibold"
                  }  `}
              >
                Reports
              </Button>
            )}
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold" : "text-white font-medium "
            }
            to={"/reports/receipt"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${isActive
                    ? "bg-blue-200 text-blue-900 font-bold"
                    : "font-semibold"
                  }  `}
              >
                Receipt Report
              </Button>
            )}
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold" : "text-white font-medium"
            }
            to={"/reports/user-report"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${isActive
                    ? "bg-blue-200 text-blue-900 font-bold"
                    : "font-semibold"
                  }  `}
              >
                Customer Report
              </Button>
            )}
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold" : "text-white font-medium"
            }
            to={"/reports/employee-report"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4 border ${isActive
                    ? "bg-blue-200 text-blue-900 font-bold"
                    : "font-semibold"
                  }  `}
              >
                Employee Report
              </Button>
            )}
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold" : "text-white font-medium"
            }
            to={"/reports/lead-report"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4 border ${isActive
                    ? "bg-blue-200 text-blue-900 font-bold"
                    : "font-semibold"
                  }  `}
              >
                Lead Report
              </Button>
            )}
          </NavLink>

          <div className="flex items-center gap-4">
            
            {/* REDESIGNED NOTIFICATION BLOCK */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                  showNotifications 
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg" 
                    : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-blue-50 hover:to-blue-100 shadow-sm"
                }`}
              >
                <IoIosNotifications className="text-2xl" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-down">
                  
                  {/* Header with gradient */}
                  <div className="px-6 py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">Pending Approvals</h3>
                        <p className="text-blue-100 text-xs mt-0.5">Action required on these items</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <span className="text-sm font-bold">3</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Body with enhanced styling */}
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {quickApprovals.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        onClick={() => setShowNotifications(false)}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 border-b border-gray-100 last:border-0 group"
                      >
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${
                          item.color === "text-blue-600" ? "from-blue-100 to-blue-50" :
                          item.color === "text-amber-600" ? "from-amber-100 to-amber-50" :
                          "from-red-100 to-red-50"
                        } flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200`}>
                          {item.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${item.color} group-hover:text-blue-700 transition-colors`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">Requires immediate attention</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                            item.color === "text-blue-600" ? "bg-blue-100 text-blue-700" :
                            item.color === "text-amber-600" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            Pending
                          </span>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Footer */}
                  
                </div>
              )}
            </div>

            {/* REDESIGNED PROFILE BLOCK */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileCard(!showProfileCard)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                  showProfileCard 
                    ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg ring-4 ring-indigo-100" 
                    : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-indigo-50 hover:to-indigo-100 shadow-sm"
                }`}
              >
                <CgProfile className="text-2xl" />
              </button>

              {showProfileCard && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-down">
                  
                  {/* Header with gradient and avatar */}
                  <div className="relative h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                      <div className="w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center ring-4 ring-white">
                        <CgProfile className="text-5xl text-indigo-600" />
                      </div>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="pt-16 px-6 pb-6">
                    <div className="text-center mb-6">
                      <h3 className="font-bold text-xl text-gray-800">{adminName}</h3>
                     
                      <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-green-50 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-semibold text-green-700">Active Now</span>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                        <p className="text-xs text-blue-600 font-medium mb-1">Last Login</p>
                        <p className="text-sm font-bold text-blue-900">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                        <p className="text-xs text-purple-600 font-medium mb-1">Session</p>
                        <p className="text-sm font-bold text-purple-900">Active</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                   
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <IoIosLogOut className="text-lg" />
                        <span className="text-sm font-semibold">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden" onClick={() => setOpen(!open)}>
            <MdMenu className="text-4xl" />
          </div>
        </div>
      </nav>
      <ResponsiveMenu open={open} menu={NavbarMenu} />
    </>
  );
};

export default Navbar;