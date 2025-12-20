import { IoIosLogOut } from "react-icons/io";
import { MdMenu } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
import { useEffect, useState } from "react";
import { NavbarMenu } from "../../data/menu";
import ResponsiveMenu from "./ResponsiveMenu";
import Modal from "../modals/Modal";
import { AiTwotoneGold } from "react-icons/ai";
import { NavLink } from "react-router-dom";
import GlobalSearchBar from "../search/GlobalSearchBar";
import { CgProfile } from "react-icons/cg";
import { Card, Button, Input } from "antd";
const Navbar = ({
  onGlobalSearchChangeHandler = () => {},
  visibility = false,
}) => {
  const [adminName, setAdminName] = useState("");
  const [onload, setOnload] = useState(true);

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

  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <nav className=" w-full fixed  top-0 left-0 z-50 bg-white shadow-md">
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
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${
                  isActive
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
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${
                  isActive
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
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${
                  isActive
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
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${
                  isActive
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
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4  border ${
                  isActive
                    ? "bg-blue-200 text-blue-900 font-bold"
                    : "font-semibold"
                }  `}
              >
                Customer Report
              </Button>
            )}
          </NavLink>

          {/* <NavLink
            className={({ isActive }) =>
              isActive
                ? "text-blue-900 font-bold border-b-2 border-blue-900"
                : "text-gray-700 font-medium hover:text-blue-500 hover:border-b-2 hover:border-blue-500"
            }
            to={"/reports/all-group-report"}
          >
            All Group Report
          </NavLink> */}
          <NavLink
            className={({ isActive }) =>
              isActive ? "text-white font-bold" : "text-white font-medium"
            }
            to={"/reports/employee-report"}
          >
            {({ isActive }) => (
              <Button
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4 border ${
                  isActive
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
                className={` pl-5  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4 border ${
                  isActive
                    ? "bg-blue-200 text-blue-900 font-bold"
                    : "font-semibold"
                }  `}
              >
                Lead Report
              </Button>
            )}
          </NavLink>

          {/* <div className="hidden md:block">
            <ul className="flex items-center gap-6 text-gray">
              {NavbarMenu.map((item) => {
                return (
                  <li key={item.id}>
                    <a
                      href={item.link}
                      className="inline-block py-1 px-3 hover:text-primary font-semibold"
                    >
                      {item.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div> */}
          <div className="flex items-center gap-4">
            <button className="text-2xl hover:bg-primary hover:text-white rounded-full p-2 duration-200">
              <IoIosNotifications />
            </button>
            {/* <button
              onClick={() => setShowModal(true)}
              className="hover:bg-secondary text-dark font-semibold hover:text-white rounded-md border-2 border-secondary px-6 py-2 duration-200 hidden md:block"
            >
              Gold Analytics
            </button> */}
            {/* <div className="pl-1  pr-4 py-2  w-30 h-12 rounded-full  focus:rounded-full px-4 shadow-md border">
              <div >
                <CgProfile className="text-4xl text-red-600 text-center ml-2 " /> <p className="text-black font-semibold  text-center">{adminName}</p>
              </div>
              
            </div> */}
            <div className=" w-30 h-12 rounded-full border flex items-center space-x-2 p-5 bg-white">
              <CgProfile className="text-2xl text-red-600" />
              <p className="text-black font-semibold">{adminName}</p>
            </div>
            <a
              href="/"
              onClick={() => {
                localStorage.clear();
              }}
              className="hover:bg-primary text-primary font-semibold hover:text-white rounded-full border-2 border-primary px-3 py-2 duration-200 hidden md:block"
            >
              <IoIosLogOut size={20} />
            </a>
          </div>
          <div className="md:hidden" onClick={() => setOpen(!open)}>
            <MdMenu className="text-4xl" />
          </div>
        </div>
      </nav>
      <ResponsiveMenu open={open} menu={NavbarMenu} />
      <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
        <div className="py-6 px-5 lg:px-8 text-left">
          <h3 className="mb-4 text-xl font-bold text-gray-900">Business</h3>
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <label
                htmlFor="remeber"
                className="ml-2 text-sm font-medium text-gray-900"
              >
                1. Grocery Shop
              </label>
            </div>
            <button className="text-sm text-white rounded-md bg-green-600 p-2">
              Active
            </button>
          </div>
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <label
                htmlFor="remeber"
                className="ml-2 text-sm font-medium text-gray-900"
              >
                2. Shoe Shop
              </label>
            </div>
            <button className="text-sm text-white rounded-md bg-primary p-2">
              Switch
            </button>
          </div>
          <hr className="bg-black" />
          <h5 className="mb-4 mt-4 text-l font-bold text-gray-900">
            Add Business
          </h5>
          <form className="space-y-6" action="#">
            <div>
              <input
                type="text"
                name="text"
                id="name"
                placeholder="Enter the Business Name"
                required
                className="bg-gray-50 border border-ray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
              />
            </div>
            <button
              type="submit"
              className="w-full text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Add
            </button>
            <div className="text-sm font-medium text-gray-500">
              Confuse to use? {""}
              <a href="#" className="text-blue-700 hover:underline">
                Check here!
              </a>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;
