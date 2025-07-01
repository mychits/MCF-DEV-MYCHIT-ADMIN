import Sidebar from "../components/layouts/Sidebar";
import { GrGroup } from "react-icons/gr";
import { BsArrowDown, BsArrowUp } from "react-icons/bs";
import { MdGroups } from "react-icons/md";
import { LiaLayerGroupSolid } from "react-icons/lia";
import { FaUserLock } from "react-icons/fa";
import { MdOutlinePayments } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import Navbar from "../components/layouts/Navbar";
import { Link } from "react-router-dom";
import { FaPeopleGroup } from "react-icons/fa6";
import { ImUserTie } from "react-icons/im";
import { FaPersonMilitaryPointing } from "react-icons/fa6"

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [staff, setStaffs] = useState([]);
  const [employee, setEmployees] = useState([]);
  const [paymentsPerMonthValue, setPaymentsPerMonthValue] = useState("0");
  const [searchValue, setSearchValue] = useState("")
  const [totalAmount, setTotalAmount] = useState(0);
  const [reloadTrigger, setReloadTrigger] = useState(0);
    const [hidePayment, setHidePayment] = useState(false);
  const [notRendered, setNotRendered] = useState(true)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/group/get-group-admin");
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, [reloadTrigger]);

    useEffect(() => {
      const user = localStorage.getItem("user");
      const userObj = JSON.parse(user);
  
      if (
        userObj &&
        userObj.admin_access_right_id?.access_permissions?.edit_payment
      ) {
        const isModify =
          userObj.admin_access_right_id?.access_permissions?.edit_payment ===
          "true"
            ? true
            : false;
        setHidePayment(isModify);
      }
    }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get("/agent/get");
        setAgents(response.data?.agent);
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
    };
    fetchAgents();
  }, [reloadTrigger]);
  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const response = await api.get("/agent/get-agent");
        setStaffs(response.data);
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
    };
    fetchStaffs();
  }, [reloadTrigger]);
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get("/agent/get-employee");
        setEmployees(response.data?.employee);
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
    };
    fetchEmployees();
  }, [reloadTrigger]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user/get-user");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUsers();
  }, [reloadTrigger]);

  useEffect(() => {
    const fetchTotalAmount = async () => {
      try {
        const response = await api.get("/payment/get-total-payment-amount");
        setTotalAmount(response?.data?.totalAmount || 0);

      } catch (error) {
        console.error("Error fetching total amount:", error);
      }
    };

    fetchTotalAmount();
  }, [reloadTrigger]);



  useEffect(() => {
    const timer = setTimeout(() => {
      setNotRendered(false);
    }, 500);

    return () => {
      clearTimeout(timer); // Cleanup to avoid memory leaks
    };
  }, []);

  useEffect(() => {
    const fetchMonthlyPayments = async () => {
      try {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const firstDay = `${currentYear}-${String(currentMonth + 1).padStart(
          2,
          "0"
        )}-01`;
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const lastDayFormatted = lastDay.toISOString().split("T")[0];

        const response = await api.get("/payment/get-current-month-payment", {
          params: {
            from_date: firstDay,
            to_date: lastDayFormatted,
          },
        });
        setPaymentsPerMonthValue(response?.data?.monthlyPayment || 0);
      } catch (err) {
        console.error("Error fetching monthly payment data:", err.message);
      }
    };
    fetchMonthlyPayments();
  }, [reloadTrigger]);

  const [clickedIndex, setClickedIndex] = useState(null);
  const handleCardClick = (index, path) => {
    setClickedIndex(index);
    setTimeout(() => {
      navigate(path);
    }, 200);
  };

  const cardData = [
    {
      icon: <LiaLayerGroupSolid size={20} />,
      text: "Groups",
      count: groups.length,
      bgColor: "bg-blue-200",
      iconColor: "bg-blue-900",
      redirect: "/group",
    },
    {
      icon: <MdGroups size={16} />,
      text: "Customers",
      count: users.length,
      bgColor: "bg-orange-200",
      iconColor: "bg-orange-900",
      redirect: "/user",
    },
    {
      icon: <FaPeopleGroup size={16} />,
      text: "Staff",
      count: staff.length,
      bgColor: "bg-sky-200",
      iconColor: "bg-sky-900",
      redirect: "/staff",
    },
    {
      icon: <FaPersonMilitaryPointing size={16} />,
      text: "Agents",
      count: agents.length,
      bgColor: "bg-teal-200",
      iconColor: "bg-teal-900",
      redirect: "/agent",
    },
    {
      icon: <ImUserTie size={16} />,
      text: "Employees",
      count: employee.length,
      bgColor: "bg-lime-200",
      iconColor: "bg-lime-900",
      redirect: "/employee",
    },

    ...(hidePayment
    ? [
        {
          icon: <MdOutlinePayments size={16} />,
          text: "Payments",
          count: `${totalAmount}`,
          bgColor: "bg-red-200",
          iconColor: "bg-red-900",
          redirect: "/payment",
        },
        {
          icon: (
            <div className="text-center">
              <SlCalender size={16} /> ₹
            </div>
          ),
          text: "Current Month Payments",
          count: `${paymentsPerMonthValue}`,
          bgColor: "bg-purple-200",
          iconColor: "bg-purple-900",
          redirect: "/payment",
        },
      ]
    : []),
  ].filter((ele) => ele.text.toLowerCase().includes(searchValue.toLocaleLowerCase()));

  const onGlobalSearchChangeHandler = (e) => {
    const { value } = e.target;

    setSearchValue(value)
  }

  return (
    <>
      <div>
        <div className="flex mt-20">
          <Sidebar />
          <Navbar onGlobalSearchChangeHandler={onGlobalSearchChangeHandler} visibility={true} />
          <div className="flex-grow p-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {cardData.map((card, index) => (
                <Link
                  to={card.redirect}
                  key={index}
                  onClick={() => { if (!notRendered) { handleCardClick(index, item.path) } }}
        //           className={`group flex items-center p-3 rounded-3xl  text-white 
        //   cursor-pointer transition-transform transition-opacity duration-500 ease-in-out
        //   ${notRendered ? "-translate-y-56 opacity-0 pointer-events-none" : "translate-y-0 opacity-100 pointer-events-auto"}
        //   ${card.bgColor}
        //   ${clickedIndex === index ? 'scale-95 brightness-110' : ''}
        //   ${!notRendered ? 'hover:scale-[1.05]' : ''}
        // `}
                 className={`
  group flex items-center p-3 rounded-3xl text-white cursor-pointer
  transition-transform  duration-500 ease-in-out
  ${card.bgColor}
  ${notRendered ? '-translate-y-56 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'}
  ${clickedIndex === index ? 'scale-95 brightness-110' : ''}
  ${!notRendered ? 'hover:scale-[1.05]' : ''}
`}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  <div
                    className={`flex items-center justify-center w-14 h-14 ${card.iconColor} text-white rounded-full mr-3`}
                  >
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-medium text-black">
                      {card.text}
                    </p>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-black">
                      {card.count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
