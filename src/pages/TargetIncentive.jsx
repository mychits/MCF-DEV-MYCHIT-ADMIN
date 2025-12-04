import React, { useEffect, useState } from "react";
import { Select, Radio, Tabs } from "antd";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import Modal from "../components/modals/Modal";
import { GiPartyPopper } from "react-icons/gi";
import { Link } from "react-router-dom";
import { FileTextOutlined, DollarOutlined } from "@ant-design/icons";
import { FaMoneyBill } from "react-icons/fa";
import { MdPayments } from "react-icons/md";
import { FiTarget } from "react-icons/fi";

const { TabPane } = Tabs;

const TargetIncentive = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [dateSelectionMode, setDateSelectionMode] = useState("month");
  const [agentLoading, setAgentLoading] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [employeeCustomerData, setEmployeeCustomerData] = useState([]);
  const [commissionTotalDetails, setCommissionTotalDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionForm, setCommissionForm] = useState({
    agent_id: "",
    pay_date: new Date().toISOString().split("T")[0],
    amount: "",
    pay_type: "cash",
    transaction_id: "",
    note: "",
    pay_for: "commission",
    admin_type: "",
  });
  const [errors, setErrors] = useState({});
  const [adminId, setAdminId] = useState("");
  const [adminName, setAdminName] = useState("");
  const [targetData, setTargetData] = useState({
    target: 0,
    achieved: 0,
    remaining: 0,
    startDate: "",
    endDate: "",
    incentiveAmount: 0,
  });
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(null);
  const [tempFromDate, setTempFromDate] = useState(null);
  const [tempToDate, setTempToDate] = useState(null);
  const [activeTab, setActiveTab] = useState("commission");
  const [grossIncentiveData, setGrossIncentiveData] = useState([]);
  const [grossIncentiveSummary, setGrossIncentiveSummary] = useState({
    total_gross_incentive_value: 0,
    total_gross_group_value: 0,
    total_gross_enrollments: 0,
  });

  useEffect(() => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`;
    setTempSelectedMonth(currentMonth);
    setSelectedMonth(currentMonth);
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastday1 = new Date(year, month, 0).getDate();
    const lastDay = `${year}-${month}-${String(lastday1).padStart(2, "0")}`;
    setTempFromDate(firstDay);
    setTempToDate(lastDay);
    setFromDate(firstDay);
    setToDate(lastDay);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setAdminId(user._id);
      setAdminName(user.name || "");
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employee");
      setEmployees(res?.data?.employee);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchCommissionReport = async (employeeId, startDate, endDate) => {
    if (!employeeId || !startDate || !endDate) return;
    const abortController = new AbortController();
    try {
      let params = {
        start_date: startDate,
        end_date: endDate,
      };
      const res = await api.get(`/enroll/employee/${employeeId}/incentive`, {
        params,
        signal: abortController.signal,
      });
      setEmployeeCustomerData(res.data?.incentiveData);
      setCommissionTotalDetails({
        actual_business: res.data?.incentiveSummary?.total_group_value,
        total_actual: res.data?.incentiveSummary?.total_incentive_value,
        total_customers: res.data?.incentiveSummary?.total_enrollments,
        total_groups: res.data?.incentiveSummary?.total_enrollments,
        expected_business: res.data?.incentiveSummary?.total_group_value,
        total_estimated: res.data?.incentiveSummary?.total_incentive_value,
      });
    } catch (err) {
      if (err.name !== "AbortController") {
        console.error("Error fetching employee report:", err);
        setEmployeeCustomerData([]);
        setCommissionTotalDetails({});
      }
    }
  };

  const fetchTargetData = async (employeeId, startDate, endDate) => {
    if (!employeeId || !startDate || !endDate) return;
    try {
      const res = await api.get(`/target/employees/${employeeId}`, {
        params: { start_date: startDate, end_date: endDate },
      });
      if (res.data.status && res.data.total_target !== undefined) {
        const totalTarget = Number(res.data.total_target);
        let params = {
          start_date: startDate,
          end_date: endDate,
        };
        const { data: comm } = await api.get(
          `/enroll/employee/${employeeId}/incentive`,
          {
            params,
          }
        );
        let achieved = comm?.incentiveSummary?.total_group_value || 0;
        if (typeof achieved === "string") {
          achieved = Number(achieved.replace(/[^0-9.-]+/g, ""));
        }
        const remaining = Math.max(totalTarget - achieved, 0);
        const difference = achieved - totalTarget;
        const incentiveAmount = difference > 0 ? difference * 0.01 : 0;
        setTargetData({
          target: Math.round(totalTarget),
          achieved: Math.round(achieved),
          remaining: Math.round(remaining),
          difference: Math.round(difference),
          startDate: startDate,
          endDate: endDate,
          incentiveAmount: parseFloat(incentiveAmount.toFixed(2)),
        });
      } else {
        throw new Error("Invalid target response");
      }
    } catch (err) {
      console.error("Error fetching target data:", err);
      setTargetData({
        target: 0,
        achieved: 0,
        remaining: 0,
        difference: 0,
        startDate: "",
        endDate: "",
        incentiveAmount: 0,
      });
    }
  };

  const fetchAllCommissionReport = async () => {
    if (!fromDate || !toDate) return;
    const abortController = new AbortController();
    try {
      let params = {
        start_date: fromDate,
        end_date: toDate,
      };
      const res = await api.get("/enroll/incentive", {
        params,
        signal: abortController.signal,
      });
      setEmployeeCustomerData(res.data?.commissionData);
      setCommissionTotalDetails({
        actual_business: res.data?.commissionSummary?.total_group_value,
        total_actual: res.data?.commissionSummary?.total_commission_value,
        total_customers: res.data?.commissionSummary?.total_enrollments,
        total_groups: res.data?.commissionSummary?.total_enrollments,
        expected_business: res.data?.commissionSummary?.total_group_value,
        total_estimated: res.data?.commissionSummary?.total_commission_value,
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error fetching all commission report:", err);
        setEmployeeCustomerData([]);
        setCommissionTotalDetails({});
      }
    }
  };

  const fetchGrossIncentiveReport = async (employeeId, startDate, endDate) => {
    if (!employeeId || !startDate || !endDate) return;
    try {
      let params = {
        start_date: startDate,
        end_date: endDate,
      };
      const res = await api.get(
        `/enroll/employee/${employeeId}/gross-incentive`,
        {
          params,
        }
      );
      const incentiveData = res.data?.grossIncentiveInfo?.map(enrollment => ({
        user_name: enrollment?.user_id?.full_name || "N/A",
        phone_number: enrollment?.user_id?.phone_number || "N/A",
        group_name: enrollment?.group_id?.group_name || "N/A",
        group_value: enrollment?.group_id?.group_value || "N/A",
        group_incentive: enrollment?.group_id?.incentives || "N/A",
        group_ticket: enrollment?.tickets || "N/A",
        enrollment_date: enrollment?.createdAt?.split("T")?.[0],
        total_paid_amount: enrollment?.total_paid_amount || "0",
        group_monthly_installment: enrollment?.group_id?.monthly_installment || "N/A",


      }));
      setGrossIncentiveData(incentiveData || []);
      setGrossIncentiveSummary(res.data.grossIncentiveSummary || {
        total_gross_incentive_value: 0,
        total_gross_group_value: 0,
        total_gross_enrollments: 0
      });
    } catch (err) {
      console.error("Error fetching gross incentive report:", err);
      setGrossIncentiveData([]);
      setGrossIncentiveSummary({
        total_gross_incentive_value: 0,
        total_gross_group_value: 0,
        total_gross_enrollments: 0
      });
    }
  };

  const fetchAllGrossIncentiveReport = async () => {
    if (!fromDate || !toDate) return;
    try {
      let params = {
        start_date: fromDate,
        end_date: toDate,
      };
      const res = await api.get("/enroll/gross-incentive", {
        params,
      });
      setGrossIncentiveData(res.data.grossIncentiveInfo || []);
      setGrossIncentiveSummary(res.data.grossIncentiveSummary || {
        total_gross_incentive_value: 0,
        total_gross_group_value: 0,
        total_gross_enrollments: 0
      });
    } catch (err) {
      console.error("Error fetching all gross incentive report:", err);
      setGrossIncentiveData([]);
      setGrossIncentiveSummary({
        total_gross_incentive_value: 0,
        total_gross_group_value: 0,
        total_gross_enrollments: 0
      });
    }
  };

  const handleEmployeeChange = (value) => {
    setSelectedEmployeeId(value);
    setSelectedEmployeeDetails(null);
    setEmployeeCustomerData([]);
    setCommissionTotalDetails({});
    setTargetData({
      target: 0,
      achieved: 0,
      remaining: 0,
      startDate: "",
      endDate: "",
      incentiveAmount: 0,
    });
    setGrossIncentiveData([]);
    setGrossIncentiveSummary({
      total_gross_incentive_value: 0,
      total_gross_group_value: 0,
      total_gross_enrollments: 0
    });
  };

  const handleTempMonthChange = (e) => {
    const selectedMonth = e.target.value;
    setTempSelectedMonth(selectedMonth);
    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-");
      const firstDay = `${year}-${month}-01`;
      const lastday1 = new Date(year, month, 0).getDate();
      const lastDay = `${year}-${month}-${String(lastday1).padStart(2, "0")}`;
      setTempFromDate(firstDay);
      setTempToDate(lastDay);
    }
  };

  const applyFilter = async () => {
    if (!selectedEmployeeId) {
      alert("Please select an employee.");
      return;
    }
    if (dateSelectionMode === "month" && !tempSelectedMonth) {
      alert("Please select a month.");
      return;
    }
    if (dateSelectionMode === "date-range" && (!tempFromDate || !tempToDate)) {
      alert("Please select both From and To dates.");
      return;
    }
    setIsFiltering(true);
    let startDate, endDate;
    if (dateSelectionMode === "month") {
      setSelectedMonth(tempSelectedMonth);
      const [year, month] = tempSelectedMonth.split("-");
      startDate = `${year}-${month}-01`;

      const lastDay = new Date(year, month, 0).getDate();
      endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;


      setFromDate(startDate);
      setToDate(endDate);
    } else {
      startDate = tempFromDate;
      endDate = tempToDate;
      setFromDate(startDate);
      setToDate(endDate);
    }
    setLoading(true);
    setAgentLoading(true);
    try {
      // Always fetch both reports regardless of active tab
      if (selectedEmployeeId === "ALL") {
        setSelectedEmployeeDetails(null);
        setTargetData({
          target: 0,
          achieved: 0,
          remaining: 0,
          startDate: "",
          endDate: "",
          incentiveAmount: 0,
        });
        await fetchAllCommissionReport();
        await fetchAllGrossIncentiveReport();
      } else {
        const emp = employees.find((e) => e._id === selectedEmployeeId);
        setSelectedEmployeeDetails(emp || null);
        await fetchCommissionReport(selectedEmployeeId, startDate, endDate);
        await fetchTargetData(selectedEmployeeId, startDate, endDate);
        await fetchGrossIncentiveReport(selectedEmployeeId, startDate, endDate);
      }
    } finally {
      setAgentLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCommissionChange = (e) => {
    const { name, value } = e.target;
    setCommissionForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!commissionForm.agent_id) newErrors.agent_id = "Please select an agent";
    if (!commissionForm.amount || isNaN(commissionForm.amount))
      newErrors.amount = "Please enter a valid amount";
    if (commissionForm.pay_type === "online" && !commissionForm.transaction_id)
      newErrors.transaction_id = "Transaction ID is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = { ...commissionForm, admin_type: adminId };
      await api.post("/payment-out/add-commission-payment", payload);
      alert("Commission Paid Successfully!");
      setShowCommissionModal(false);
    } catch (err) {
      alert("Failed to add payment.");
    }
  };

  const processedTableData = employeeCustomerData.map((item, index) => ({
    ...item,
    group_value_digits: item.group_id?.group_value,
    group_ticket: item.ticket || "N/A",
    estimated_commission_digits: item?.estimated_commission || 0,
    net_incentive_digits: item?.incentive_value || 0,
    incentive_percentage: item?.group_id?.incentives || 0,
    total_paid_digits: item?.total_paid_amount || 0,
    required_installment_digits: item?.group_id?.monthly_installment || 0,
    incentive_released: item.incentive_released ? "Yes" : "No",
    user_name: item.user_id?.full_name || "N/A",
    phone_number: item.user_id?.phone_number || "N/A",
    group_name: item.group_id?.group_name || "N/A",
    enrollment_date: item.createdAt?.split("T")?.[0]
      || "N/A",
  }));

  const columns = [
    { key: "user_name", header: "Customer Name" },
    { key: "phone_number", header: "Phone Number" },
    { key: "group_name", header: "Group Name" },
    { key: "group_ticket", header: "Ticket No" },
    { key: "group_value_digits", header: "Group Value" },
    { key: "enrollment_date", header: "Enrollment Date" },
    { key: "incentive_percentage", header: "Net Incentive Percentage" },
    { key: "net_incentive_digits", header: "Net  Incentive" },
    { key: "total_paid_digits", header: "Total Paid" },
    { key: "required_installment_digits", header: "First Installment Amount" },
    { key: "incentive_released", header: "Incentive Released" },
  ];


  const grossIncentiveColumns = [
    { key: "user_name", header: "Customer Name" },
    { key: "phone_number", header: "Phone Number" },
    { key: "group_name", header: "Group Name" },
    { key: "group_value", header: "Group Value" },
    { key: "group_ticket", header: "Ticket No" },
    { key: "enrollment_date", header: "Enrollment Date" },
    { key: "group_monthly_installment", header: "First Installment Amount" },
    { key: "group_incentive", header: "Incentive Percentage" },
    { key: "total_paid_amount", header: "Total Paid" },

  ];

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  return (
    <div className="w-screen min-h-screen bg-gray-50">
      <div className="flex">
        <Navbar visibility={true} />
        <div className="flex-grow p-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              Incentive Reports
            </h1>
            <p className="text-gray-600 mt-2">Track and manage employee incentives and commissions</p>
          </div>

          {/* Filter Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Report Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Employee Select */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Employee
                </label>
                <Select
                  value={selectedEmployeeId || undefined}
                  onChange={handleEmployeeChange}
                  showSearch
                  popupMatchSelectWidth={false}
                  placeholder="Search by name or phone"
                  filterOption={(input, option) =>
                    option.children
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  style={{ height: "44px" }}
                  className="rounded"
                >
                  {employees.map((emp) => (
                    <Select.Option key={emp._id} value={emp._id}>
                      {emp.name} - {emp.phone_number}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              {/* Date Selection Mode */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Date Selection
                </label>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg h-11">
                  <Radio.Group
                    value={dateSelectionMode}
                    onChange={(e) => setDateSelectionMode(e.target.value)}
                  >
                    <Radio value="month" className="text-sm">Month</Radio>
                    <Radio value="date-range" className="text-sm">Range</Radio>
                  </Radio.Group>
                </div>
              </div>
              {/* Date Picker Fields */}
              {dateSelectionMode === "month" ? (
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Month
                  </label>
                  <input
                    type="month"
                    value={tempSelectedMonth || ""}
                    max={currentMonth}
                    onChange={handleTempMonthChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
                  />
                </div>
              ) : (
                <>
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={tempFromDate || ""}
                      max={tempToDate || currentMonth}
                      onChange={(e) => setTempFromDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={tempToDate || ""}
                      min={tempFromDate || ""}
                      max={currentMonth}
                      onChange={(e) => setTempToDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
                    />
                  </div>
                </>
              )}
            </div>
            {/* Filter Button */}
            <div className="flex justify-end">
              <button
                onClick={applyFilter}
                className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm"
              >
                Continue
              </button>
            </div>
          </div>

          {agentLoading ? (
            <div className="flex justify-center py-20">
              <CircularLoader isLoading={true} />
            </div>
          ) : (
            <>
              {/* Quick Links */}
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link
                    to="/target-menu/target"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <FiTarget className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">Set Target</span>
                  </Link>
                  <Link
                    to="/reports/target-commission"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <DollarOutlined className="text-blue-600 group-hover:scale-110 transition-transform text-lg" />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">Incentive Report</span>
                  </Link>
                  <Link
                    to="/target-commission-incentive"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <MdPayments className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">Incentive / Commission Payout</span>
                  </Link>
                  <Link
                    to="/payment-menu/payment-in-out-menu/payment-out/salary-payment"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <FaMoneyBill className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">Salary Payout</span>
                  </Link>
                </div>
              </div>

              {/* Employee Details */}
              {isFiltering &&
                ((dateSelectionMode === "month" && selectedMonth) ||
                  (dateSelectionMode === "date-range" && fromDate && toDate)) &&
                (selectedEmployeeId === "ALL" || selectedEmployeeDetails) && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    {selectedEmployeeId !== "ALL" && selectedEmployeeDetails && (
                      <>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Employee Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase">Name</label>
                            <input
                              value={selectedEmployeeDetails.name || "-"}
                              readOnly
                              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase">Email</label>
                            <input
                              value={selectedEmployeeDetails.email || "-"}
                              readOnly
                              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase">Phone</label>
                            <input
                              value={selectedEmployeeDetails.phone_number || "-"}
                              readOnly
                              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase">Adhaar</label>
                            <input
                              value={selectedEmployeeDetails.adhaar_no || "-"}
                              readOnly
                              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase">PAN</label>
                            <input
                              value={selectedEmployeeDetails.pan_no || "-"}
                              readOnly
                              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase">Pincode</label>
                            <input
                              value={selectedEmployeeDetails.pincode || "-"}
                              readOnly
                              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 uppercase">Address</label>
                          <input
                            value={selectedEmployeeDetails.address || "-"}
                            readOnly
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                          />
                        </div>
                        <hr className="my-6" />
                      </>
                    )}
                    {/* Summary Section */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Commission Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                        <label className="text-xs font-semibold text-gray-600 uppercase">Net Business</label>
                        <input
                          value={commissionTotalDetails?.actual_business || "-"}
                          readOnly
                          className="w-full bg-transparent text-2xl font-bold text-green-700 mt-2 border-0"
                        />
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                        <label className="text-xs font-semibold text-gray-600 uppercase">Net Incentive (1% each)</label>
                        <input
                          value={commissionTotalDetails?.total_actual || "-"}
                          readOnly
                          className="w-full bg-transparent text-2xl font-bold text-blue-700 mt-2 border-0"
                        />
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                        <label className="text-xs font-semibold text-gray-600 uppercase">Net Customers</label>
                        <input
                          value={commissionTotalDetails?.total_customers || "-"}
                          readOnly
                          className="w-full bg-transparent text-2xl font-bold text-purple-700 mt-2 border-0"
                        />
                      </div>
                      {/* <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                        <label className="text-xs font-semibold text-gray-600 uppercase">Net Groups</label>
                        <input
                          value={commissionTotalDetails?.total_groups || "-"}
                          readOnly
                          className="w-full bg-transparent text-2xl font-bold text-orange-700 mt-2 border-0"
                        />
                      </div> */}
                    </div>
                  </div>
                )}

              {/* Tabbed View for Reports */}
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                {/* Commission Report Tab */}
                <TabPane tab="Net Incentive Report" key="commission">
                  {/* Target Details */}
                  {isFiltering &&
                    ((dateSelectionMode === "month" && selectedMonth) ||
                      (dateSelectionMode === "date-range" && fromDate && toDate)) &&
                    selectedEmployeeId &&
                    selectedEmployeeId !== "ALL" && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-800">Target Performance</h3>
                          {targetData.achieved >= targetData.target && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 border border-green-300">
                              <GiPartyPopper size={24} className="text-green-600" />
                              <span className="text-green-700 font-semibold">Target Achieved! </span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                            <label className="text-xs font-semibold text-gray-600 uppercase">Target Set</label>
                            <p className="text-2xl font-bold text-blue-700 mt-2">
                              {`${targetData.target?.toLocaleString("en-IN")}`}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                            <label className="text-xs font-semibold text-gray-600 uppercase">Achieved</label>
                            <p className="text-2xl font-bold text-green-700 mt-2">
                              {`${targetData.achieved?.toLocaleString("en-IN")}`}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
                            <label className="text-xs font-semibold text-gray-600 uppercase">Difference</label>
                            <p className="text-2xl font-bold text-amber-700 mt-2">
                              {`${(targetData?.difference ?? "0").toLocaleString("en-IN")}`}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
                            <label className="text-xs font-semibold text-gray-600 uppercase">Total Payable</label>
                            <p className="text-2xl font-bold text-emerald-700 mt-2">
                              {`${targetData.incentiveAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`}
                            </p>
                          </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                          <p className="text-sm font-semibold text-blue-800 mb-3">Incentive Breakdown</p>
                          <ul className="space-y-2">
                            <li className="text-sm text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              <span>Up to target (0%): <span className="font-semibold">0.00</span></span>
                            </li>
                            {targetData.achieved > targetData.target && (
                              <li className="text-sm text-gray-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                <span>Beyond target (1%): <span className="font-semibold">
                                  {(
                                    (targetData.achieved - targetData.target) *
                                    0.01
                                  ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span></span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  {/* Data Table */}
                  {loading ? (
                    <div className="flex justify-center py-20">
                      <CircularLoader isLoading={true} />
                    </div>
                  ) : employeeCustomerData.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <DataTable
                        data={processedTableData}
                        columns={columns}
                        exportedPdfName={`Incentive Report`}
                        printHeaderKeys={[
                          "Name",
                          "Phone Number",
                          "Month",
                          "Target Set",
                          "Achieved",
                          "Remaining",
                          "Total Payable Commission",
                          "Actual Business",
                          "Actual Commission",
                          "Gross Business",
                          "Gross Commission",
                          "Total Customers",
                          "Total Groups",
                        ]}
                        printHeaderValues={[
                          selectedEmployeeId === "ALL"
                            ? "All Employees"
                            : selectedEmployeeDetails?.name || "-",
                          selectedEmployeeId === "ALL"
                            ? "-"
                            : selectedEmployeeDetails?.phone_number || "-",
                          (dateSelectionMode === "month" && selectedMonth) ||
                            (dateSelectionMode === "date-range" && fromDate && toDate)
                            ? dateSelectionMode === "month"
                              ? new Date(`${selectedMonth}-01`).toLocaleString(
                                "default",
                                {
                                  month: "long",
                                  year: "numeric",
                                }
                              )
                              : `${new Date(
                                fromDate
                              ).toLocaleDateString()} - ${new Date(
                                toDate
                              ).toLocaleDateString()}`
                            : "-",
                          `${targetData?.target?.toLocaleString("en-IN") || "0"}`,
                          `${targetData?.achieved?.toLocaleString("en-IN") || "0"}`,
                          `${targetData?.remaining?.toLocaleString("en-IN") || "0"
                          }`,
                          `${targetData?.incentiveAmount?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) || "0.00"
                          }`,
                          `${commissionTotalDetails?.actual_business?.toLocaleString(
                            "en-IN"
                          ) || "0"
                          }`,
                          `${commissionTotalDetails?.total_actual?.toLocaleString(
                            "en-IN"
                          ) || "0"
                          }`,
                          `${commissionTotalDetails?.expected_business?.toLocaleString(
                            "en-IN"
                          ) || "0"
                          }`,
                          `${commissionTotalDetails?.total_estimated?.toLocaleString(
                            "en-IN"
                          ) || "0"
                          }`,
                          commissionTotalDetails?.total_customers || "0",
                          commissionTotalDetails?.total_groups || "0",
                        ]}
                        exportedFileName={`IncentiveReport-${selectedEmployeeDetails?.name || "all"
                          }-${dateSelectionMode === "month"
                            ? selectedMonth
                            : `${fromDate}_to_${toDate}`
                          }.csv`}
                      />
                    </div>
                  ) : (
                    isFiltering &&
                    ((dateSelectionMode === "month" && selectedMonth) ||
                      (dateSelectionMode === "date-range" && fromDate && toDate)) &&
                    selectedEmployeeDetails?.name && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-lg font-medium">
                          No incentive data found for the selected period.
                        </p>
                      </div>
                    )
                  )}
                </TabPane>
                {/* Gross Incentive Report Tab */}
                <TabPane tab="Gross Incentive Report" key="gross-incentive">
                  {/* Gross Incentive Summary Section */}
                  {isFiltering &&
                    ((dateSelectionMode === "month" && selectedMonth) ||
                      (dateSelectionMode === "date-range" && fromDate && toDate)) &&
                    (selectedEmployeeId === "ALL" || selectedEmployeeDetails) && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Gross Incentive Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                            <label className="text-xs font-semibold text-gray-600 uppercase">Gross Group Value</label>
                            <input
                              value={grossIncentiveSummary.total_gross_group_value?.toLocaleString("en-IN") || "-"}
                              readOnly
                              className="w-full bg-transparent text-2xl font-bold text-green-700 mt-2 border-0"
                            />
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                            <label className="text-xs font-semibold text-gray-600 uppercase">Gross Incentive Value</label>
                            <input
                              value={grossIncentiveSummary.total_gross_incentive_value?.toLocaleString("en-IN") || "-"}
                              readOnly
                              className="w-full bg-transparent text-2xl font-bold text-blue-700 mt-2 border-0"
                            />
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                            <label className="text-xs font-semibold text-gray-600 uppercase">Gross Enrollments</label>
                            <input
                              value={grossIncentiveSummary.total_gross_enrollments || "-"}
                              readOnly
                              className="w-full bg-transparent text-2xl font-bold text-purple-700 mt-2 border-0"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  {/* Data Table */}
                  {loading ? (
                    <div className="flex justify-center py-20">
                      <CircularLoader isLoading={true} />
                    </div>
                  ) : grossIncentiveData.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <DataTable
                        data={grossIncentiveData}
                        columns={grossIncentiveColumns}
                        exportedPdfName={`Gross Incentive Report`}
                        printHeaderKeys={[
                          "Name",
                          "Phone Number",
                          "Period",
                          "Total Group Value",
                          "Total Incentive Value",
                          "Total Enrollments",
                        ]}
                        printHeaderValues={[
                          selectedEmployeeId === "ALL"
                            ? "All Employees"
                            : selectedEmployeeDetails?.name || "-",
                          selectedEmployeeId === "ALL"
                            ? "-"
                            : selectedEmployeeDetails?.phone_number || "-",
                          (dateSelectionMode === "month" && selectedMonth) ||
                            (dateSelectionMode === "date-range" && fromDate && toDate)
                            ? dateSelectionMode === "month"
                              ? new Date(`${selectedMonth}-01`).toLocaleString(
                                "default",
                                {
                                  month: "long",
                                  year: "numeric",
                                }
                              )
                              : `${new Date(
                                fromDate
                              ).toLocaleDateString()} - ${new Date(
                                toDate
                              ).toLocaleDateString()}`
                            : "-",
                          `${grossIncentiveSummary.total_gross_group_value?.toLocaleString("en-IN") || "0"}`,
                          `${grossIncentiveSummary.total_gross_incentive_value?.toLocaleString("en-IN") || "0"}`,
                          `${grossIncentiveSummary.total_gross_enrollments || "0"}`,
                        ]}
                        exportedFileName={`GrossIncentiveReport-${selectedEmployeeDetails?.name || "all"
                          }-${dateSelectionMode === "month"
                            ? selectedMonth
                            : `${fromDate}_to_${toDate}`
                          }.csv`}
                      />
                    </div>
                  ) : (
                    isFiltering &&
                    ((dateSelectionMode === "month" && selectedMonth) ||
                      (dateSelectionMode === "date-range" && fromDate && toDate)) &&
                    selectedEmployeeDetails?.name && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-lg font-medium">
                          No gross incentive data found for the selected period.
                        </p>
                      </div>
                    )
                  )}
                </TabPane>
              </Tabs>
            </>
          )}


        </div>
      </div>
    </div>
  );
};

export default TargetIncentive;