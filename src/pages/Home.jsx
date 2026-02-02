import { LiaLayerGroupSolid } from "react-icons/lia";
import { MdOutlinePayments } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { FaPersonMilitaryPointing } from "react-icons/fa6";
import { ImUserTie } from "react-icons/im";
import { MdGroups } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import api from "../instance/TokenInstance";
import { Tag } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import Receipt from "../components/receipts/CustomReceiptOne";
import { BsGrid3X3GapFill, BsListUl } from "react-icons/bs";

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [staff, setStaffs] = useState([]);
  const [employee, setEmployees] = useState([]);
  const [paymentsPerMonthValue, setPaymentsPerMonthValue] = useState("0");
  const [searchValue, setSearchValue] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [hidePayment, setHidePayment] = useState(false);
  const [notRendered, setNotRendered] = useState(true);
  const [clickedIndex, setClickedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [tableTransactions, setTableTransactions] = useState([]);
  const [viewMode, setViewMode] = useState('list');

  const fetchGroupData = useCallback(async () => {
    try {
      const response = await api.get("/group/get-group-admin");
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching group data:", error);
      setGroups([]);
    }
  }, []);

  const fetchAgentData = useCallback(async () => {
    try {
      const response = await api.get("/agent/get");
      setAgents(response.data?.agent || []);
    } catch (error) {
      console.error("Error fetching agent data:", error);
      setAgents([]);
    }
  }, []);

  const fetchStaffData = useCallback(async () => {
    try {
      const response = await api.get("/agent/get-agent");
      setStaffs(response.data || []);
    } catch (error) {
      console.error("Error fetching staff data:", error);
      setStaffs([]);
    }
  }, []);

  const fetchEmployeeData = useCallback(async () => {
    try {
      const response = await api.get("/employee");
      setEmployees(response.data?.employee || []);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setEmployees([]);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await api.get("/user/get-user");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUsers([]);
    }
  }, []);

  const fetchTotalAmount = useCallback(async () => {
    try {
      const response = await api.get("/payment/get-total-payment-amount");
      setTotalAmount(response?.data?.totalAmount || 0);
    } catch (error) {
      console.error("Error fetching total amount:", error);
      setTotalAmount(0);
    }
  }, []);

  const fetchMonthlyPayments = useCallback(async () => {
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
      setPaymentsPerMonthValue(0);
    }
  }, []);

  const checkPaymentPermissions = useCallback(() => {
    try {
      const user = localStorage.getItem("user");
      const userObj = user ? JSON.parse(user) : null;

      if (
        userObj?.admin_access_right_id?.access_permissions?.edit_payment ===
        "true"
      ) {
        setHidePayment(true);
      }
    } catch (error) {
      console.error("Error parsing user permissions:", error);
      setHidePayment(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    checkPaymentPermissions();
  }, [checkPaymentPermissions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotRendered(false);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchGroupData(),
      fetchUserData(),
      fetchAgentData(),
      fetchStaffData(),
      fetchEmployeeData(),
      fetchTotalAmount(),
      fetchMonthlyPayments(),
    ]).then(() => setLoading(false));
  }, [
    reloadTrigger,
    fetchGroupData,
    fetchUserData,
    fetchAgentData,
    fetchStaffData,
    fetchEmployeeData,
    fetchTotalAmount,
    fetchMonthlyPayments,
  ]);
  async function getTransactions() {
    try {
      setTransactionsLoading(true);
      const response = await api.get("/cashfree-pg-orders/10");
      const transactionsData = response.data?.data;
      const filteredData = transactionsData.map((order, index) => {
        const status = order?.status;
        const color = status === "ACTIVE" ? "blue" : status === "PAID" ? "green" : "red"
        const icon = status === "ACTIVE" ? <ClockCircleOutlined /> : status === "PAID" ? <CheckCircleOutlined /> : <CloseCircleOutlined />;
        const groups = order?.groups;
        const pigmys = order.pigmys;
        const loans = order?.loans;
        const groupsString = (groups?.map(group => `${group?.group_id?.group_name} | ${group?.ticket}`) || []).join(" | ");
        const pigmysString = (pigmys?.map(pigmy => `${pigmy?.payable_amount} | ${pigmy?.pigme_id}`) || []).join(" | ");
        const loansString = (loans?.map(loan => `${loan?.loan_amount} | ${loan?.loan_id}`) || []).join(" | ");
        return ({
          id: index + 1,
          orderType: order?.order_type,
          user_name: order?.user_id?.full_name,
          phone_number: order?.user_id?.phone_number,
          groups: (groups?.map(group => `${group?.group_id?.group_name} | ${group?.ticket}`) || []).join(" | "),
          pigmys: (pigmys?.map(pigmy => `${pigmy?.payable_amount} | ${pigmy?.pigme_id}`) || []).join(" | "),
          loans: (loans?.map(loan => `${loan?.loan_amount} | ${loan?.loan_id}`) || []).join(" | "),
          others: groupsString + pigmysString + loansString,
          status: <Tag key={"success"} color={color} icon={icon} variant={"filled"}>
            {status}
          </Tag>,
          statusRaw: status,
          collectedBy: order?.collected_by
        })
      });
      setTableTransactions(filteredData);
    } catch (error) {
      setTableTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  }
  useEffect(() => {
    getTransactions();
  }, [])
  const baseCards = [
    {
      id: 1,
      icon: <LiaLayerGroupSolid size={24} />,
      text: "Groups",
      count: groups?.length,
      bgGradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-700",
      hoverBg: "hover:from-blue-600 hover:to-blue-700",
      redirect: "/group-menu",
    },
    {
      id: 2,
      icon: <MdGroups size={24} />,
      text: "Customers",
      count: users?.length,
      bgGradient: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-700",
      hoverBg: "hover:from-orange-600 hover:to-orange-700",
      redirect: "/user",
    },
    {
      id: 3,
      icon: <FaPeopleGroup size={24} />,
      text: "Staff",
      count: staff?.length,
      bgGradient: "from-sky-500 to-sky-600",
      iconBg: "bg-sky-700",
      hoverBg: "hover:from-sky-600 hover:to-sky-700",
      redirect: "/staff-menu",
    },
    {
      id: 4,
      icon: <FaPersonMilitaryPointing size={24} />,
      text: "Agents",
      count: agents?.length,
      bgGradient: "from-teal-500 to-teal-600",
      iconBg: "bg-teal-700",
      hoverBg: "hover:from-teal-600 hover:to-teal-700",
      redirect: "/staff-menu/agent",
    },
    {
      id: 5,
      icon: <ImUserTie size={24} />,
      text: "Employees",
      count: employee?.length,
      bgGradient: "from-lime-500 to-lime-600",
      iconBg: "bg-lime-700",
      hoverBg: "hover:from-lime-600 hover:to-lime-700",
      redirect: "/staff-menu/employee-menu",
    },
  ];

  const paymentCards = hidePayment
    ? [
      {
        id: 6,
        icon: <MdOutlinePayments size={24} />,
        text: "Payments",
        count: totalAmount,
        bgGradient: "from-yellow-500 to-yellow-600",
        iconBg: "bg-yellow-700",
        hoverBg: "hover:from-yellow-600 hover:to-yellow-700",
        redirect: "/payment-in-out-menu/pay-in-menu/payment",
      },
      {
        id: 7,
        icon: (
          <div className="flex items-center justify-center">
            <SlCalender size={24} className="mr-1" />
          </div>
        ),
        text: "Current Month Payments",
        count: paymentsPerMonthValue,
        bgGradient: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-700",
        hoverBg: "hover:from-purple-600 hover:to-purple-700",
        redirect: "/payment-in-out-menu/pay-in-menu/payment",
      },
    ]
    : [];

  const allCards = [...baseCards, ...paymentCards];

  const filteredCards = allCards.filter((card) =>
    card.text.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Event Handlers
  const handleCardClick = (index) => {
    setClickedIndex(index);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleCardKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === " ") {
      setClickedIndex(index);
    }
  };

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-gray-200 rounded-lg h-32 animate-pulse" />
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar
          onGlobalSearchChangeHandler={handleSearchChange}
          visibility={true}
        />

        <main className="flex-1 overflow-auto mt-20 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Overview of your business metrics and data
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading
                ? Array(baseCards.length)
                  .fill(0)
                  .map((_, i) => <SkeletonCard key={i} />)
                : filteredCards.map((card, index) => (
                  <Link
                    to={card.redirect}
                    key={card.id}
                    onClick={() => handleCardClick(index)}
                    onKeyDown={(e) => handleCardKeyDown(e, index)}
                    role="button"
                    tabIndex={0}
                    className={`
                        group relative flex flex-col p-6 rounded-xl
                        bg-gradient-to-br ${card.bgGradient}
                        text-white cursor-pointer
                        transition-all duration-500 ease-out
                        shadow-lg hover:shadow-2xl
                        transform hover:scale-105 hover:translate-y-[-4px]
                        ${card.hoverBg}
                        ${notRendered
                        ? "-translate-y-56 opacity-0 pointer-events-none"
                        : "translate-y-0 opacity-100 pointer-events-auto"
                      }
                        ${clickedIndex === index
                        ? "scale-95 brightness-110"
                        : ""
                      }
                        overflow-hidden
                      `}
                    style={{
                      transitionDelay: `${index * 100}ms`,
                    }}>
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12" />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      <div
                        className={`
                            flex items-center justify-center w-16 h-16
                            ${card.iconBg} text-white rounded-xl mb-4
                            group-hover:scale-110 transition-transform duration-300
                            shadow-md
                          `}>
                        {card.icon}
                      </div>

                      {/* Title and Count */}
                      <h3
                        className={`
                          font-semibold text-white mb-2 
                          group-hover:translate-x-1 transition-transform duration-300
                          line-clamp-2
                          ${card.text.length > 20 ? "text-base" : "text-lg"}
                          ${card.text.length > 30 ? "text-sm" : ""}
                        `}>
                        {card.text}
                      </h3>

                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={`
                            font-bold text-white truncate
                            ${String(card.count).length > 10
                              ? "text-2xl"
                              : "text-3xl"
                            }
                            ${String(card.count).length > 15 ? "text-xl" : ""}
                          `}>
                          {card.count}
                        </span>
                        <div className="text-xs font-semibold text-white opacity-75 bg-white bg-opacity-20 px-2 py-1 rounded-full whitespace-nowrap">
                          View
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
            <div className="mt-16">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
                  <p className="text-sm text-gray-500">Showing the latest activities</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* View Toggle Buttons */}
                  <div className="flex bg-gray-200 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                    >
                      <BsGrid3X3GapFill size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                    >
                      <BsListUl size={18} />
                    </button>
                  </div>

                  <button onClick={getTransactions} className="bg-white border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Refresh
                  </button>
                </div>
              </div>

              {transactionsLoading ? (
                <div className="space-y-4">
                  <div className="h-20 bg-gray-200 animate-pulse rounded-md" />
                  <div className="h-20 bg-gray-200 animate-pulse rounded-md" />
                </div>
              ) : (
                <div className={viewMode === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "flex flex-col border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                }>
                  {/* List View Header */}
                  {viewMode === 'list' && tableTransactions.length > 0 && (
                    <div className="flex items-center justify-between bg-gray-100 p-4 border-b border-gray-200 font-bold text-[10px] text-gray-500 uppercase tracking-wider">
                      <div className="w-16">ID</div>
                      <div className="w-1/4">Customer</div>
                      <div className="w-1/4">Details</div>
                      <div className="w-1/6">Type</div>
                      <div className="w-1/6">Status</div>
                      <div className="w-1/6 text-right">Agent</div>
                    </div>
                  )}

                  {tableTransactions.length > 0 ? (
                    tableTransactions.map((item) => (
                      <Receipt
                        key={item?.id}
                        {...item}
                        status={item?.statusRaw}
                        viewMode={viewMode}
                      />
                    ))
                  ) : (
                    <div className="p-20 text-center text-gray-400 italic">No transactions found</div>
                  )}
                </div>
              )}
            </div>
          
            {!loading && filteredCards.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">
                  No results found for "{searchValue}"
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
