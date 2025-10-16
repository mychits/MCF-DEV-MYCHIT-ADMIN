import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import API from "../instance/TokenInstance";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import { Select, Tooltip, notification, Dropdown } from "antd";
import SettingSidebar from "../components/layouts/SettingSidebar";
import SalarySlipPrint from "../components/printFormats/SalarySlipPrint";
import { IoMdMore } from "react-icons/io";
import EditSalaryModal from "../components/modals/EditSalaryModal";

const PayoutSalary = () => {
  const paymentFor = "salary";
  const [api, contextHolder] = notification.useNotification();
  const [dateMode, setDateMode] = useState("month"); // "month" or "custom"
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [modifyPayment, setModifyPayment] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [absent, setAbsent] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    noReload: false,
    type: "info",
  });
  const [targetData, setTargetData] = useState({
    target: 0,
    achieved: 0,
    remaining: 0,
    difference: 0,
    incentiveAmount: "₹0.00",
    incentivePercent: "0%",
  });
  const [agents, setAgents] = useState([]);
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [errors, setErrors] = useState({});
  const [reRender, setReRender] = useState(0);
  const [salaryCalculationDetails, setSalaryCalculationDetails] = useState(null);
  const [manualPaidAmount, setManualPaidAmount] = useState(""); // NEW: Manual amount field
  const [isEditing, setIsEditing] = useState(false); // For edit mode
  const [editingSalary, setEditingSalary] = useState(null);
  
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  
  const [salaryForm, setSalaryForm] = useState({
    agent_id: "",
    pay_date: today.toISOString().split("T")[0],
    from_date: "",
    to_date: "",
    amount: "",
    pay_type: "cash",
    transaction_id: "",
    note: "",
    pay_for: paymentFor,
    admin_type: "",
  });
  
  const [employeeDetails, setEmployeeDetails] = useState({
    joining_date: "",
    salary: "",
  });
  
  const [totalWithIncentive, setTotalWithIncentive] = useState("0.00");
  const [calculatedSalary, setCalculatedSalary] = useState("");
  const [alreadyPaid, setAlreadyPaid] = useState("0.00");
  const [remainingSalary, setRemainingSalary] = useState("0.00");
  
  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    const d = new Date(date);
    if (isNaN(d)) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  
  // Initialize selectedMonth
  useEffect(() => {
    setSelectedMonth(currentMonth);
  }, []);
  
  // Auto-update from_date / to_date when month changes
  useEffect(() => {
    if (dateMode === "month" && selectedMonth) {
      const [year, month] = selectedMonth.split("-").map(Number);
      const fromDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const toDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      setSalaryForm((prev) => ({
        ...prev,
        from_date: fromDate,
        to_date: toDate,
      }));
    }
  }, [selectedMonth, dateMode]);
  
  const calculateProRatedSalary = async (fromDateStr, toDateStr, monthlySalary, empId) => {
    if (!empId || !fromDateStr || !toDateStr) {
      setCalculatedSalary("");
      setAlreadyPaid("0.00");
      setRemainingSalary("0.00");
      setAlertConfig({
        visibility: true,
        message: "Please select valid dates and employee.",
        type: "warning",
        noReload: true,
      });
      return;
    }
    try {
      setIsLoading(true);
      const res = await API.post("/salary/calculate", {
        empId,
        from_date: formatDate(fromDateStr),
        to_date: formatDate(toDateStr),
      });
      console.log(res, "hello");
      const { totalSalary } = res.data;
      setSalaryCalculationDetails(res.data);
      const payable = parseFloat(totalSalary).toFixed(2);
      setCalculatedSalary(payable);
      setTotalWithIncentive(payable);
      const paymentsRes = await API.get("/salary/get-salary-payments");
      const fromDate = new Date(formatDate(fromDateStr));
      const toDate = new Date(formatDate(toDateStr));
      const salaryArray = Array.isArray(paymentsRes.data)
        ? paymentsRes.data
        : paymentsRes.data.data || [];
      const paidInPeriod = salaryArray
        .filter((p) => {
          const pAgentId = p.employee_id?._id ? String(p.employee_id._id) : String(p.employee_id);
          const payDate = new Date(formatDate(p.payout_metadata?.date_range?.from));
          return pAgentId === String(empId) && payDate >= fromDate && payDate <= toDate;
        })
        .reduce((sum, p) => sum + parseFloat(p.payout_metadata?.total_paid_amount || 0), 0);
      const alreadyPaidAmt = paidInPeriod.toFixed(2);
      const remaining = Math.max(0, parseFloat(payable) - paidInPeriod).toFixed(2);
      setAlreadyPaid(alreadyPaidAmt);
      setRemainingSalary(remaining);
      setAlertConfig({
        visibility: true,
        message: "Salary calculated successfully!",
        type: "success",
        noReload: true,
      });
    } catch (error) {
      console.error("Calculate salary error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message ||
        "Failed to calculate salary";
      setAlertConfig({
        visibility: true,
        message: message,
        type: "error",
        noReload: true,
      });
      setCalculatedSalary("");
      setAlreadyPaid("0.00");
      setRemainingSalary("0.00");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchEmployeeDetails = async (empId) => {
    try {
      const res = await API.get(`/agent/get-additional-employee-info-by-id/${empId}`);
      const emp = res?.data?.employee;
      if (emp) {
        const joining = emp.joining_date?.split("T")[0] || "";
        const baseSalary = emp.salary || "";
        setEmployeeDetails({ joining_date: joining, salary: baseSalary });
        const todayStr = new Date().toISOString().split("T")[0];
        const newFromDate = joining || todayStr;
        const newToDate = todayStr;
        setSalaryForm((prev) => ({
          ...prev,
          from_date: newFromDate,
          to_date: newToDate,
        }));
        // Also update month field if in month mode
        if (dateMode === "month") {
          const joinDate = new Date(joining || todayStr);
          const sm = `${joinDate.getFullYear()}-${String(joinDate.getMonth() + 1).padStart(2, "0")}`;
          setSelectedMonth(sm);
        }
      }
    } catch (err) {
      console.error("Error fetching employee info", err);
      setEmployeeDetails({ joining_date: "", salary: "" });
      setCalculatedSalary("");
    }
  };
  
  const fetchAgents = async () => {
    try {
      const response = await API.get("/agent/get-employee");
      setAgents(response.data?.employee || []);
    } catch (error) {
      console.error("Failed to fetch Agents");
    }
  };
  
  const fetchSalaryPayments = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/salary/get-salary-payments");
      const salaryArray = Array.isArray(response.data) ? response.data : response.data.data || [];
      console.log("Fetched Salary Payments:", salaryArray);
      const responseData = salaryArray.map((payment, index) => ({
        id: index + 1,
        _id: payment._id,
        pay_date:
          payment.payout_metadata?.date_range?.from?.split("T")[0] ||
          payment.pay_date?.split("T")[0] ||
          "-",
        agent_id: payment.employee_id?._id || "-",
        agent_name:
          payment.employee_id?.name ||
          payment.employee_id?.full_name ||
          payment.agent_name ||
          "N/A",
        from_date: payment.payout_metadata?.date_range?.from?.split("T")[0],
        to_date: payment.payout_metadata?.date_range?.to?.split("T")[0],
        amount: payment.payout_metadata?.total_paid_amount || payment.amount || 0,
        pay_type: payment.payout_metadata?.pay_type || payment.pay_type || "N/A",
        receipt_no: payment.payout_metadata?.receipt_no || payment.receipt_no || "-",
        note: payment.payout_metadata?.note || payment.note || "-",
        disbursed_by: payment.payout_metadata?.disbursed_by || payment.disbursed_by || "Admin",
        action: (
          <div className="flex justify-center gap-2">
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "1",
                    label: (
                      <div className="text-green-600" onClick={(e) => e.stopPropagation()}>
                        <SalarySlipPrint payment={payment} />
                      </div>
                    ),
                  },
                  {
                    key: "2",
                    label: (
                      <div 
                        className="text-blue-600 cursor-pointer"
                        onClick={() => {
                          setEditingSalary(payment);
                          setIsEditing(true);
                        }}
                      >
                        Edit Payment
                      </div>
                    ),
                  },
                ],
              }}
            >
              <IoMdMore className="text-bold" />
            </Dropdown>
          </div>
        ),
      }));
      setSalaryPayments(responseData);
    } catch (error) {
      console.error("Failed to fetch Salary payments", error);
      setSalaryPayments([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const user = localStorage.getItem("user");
    const userObj = JSON.parse(user);
    setAdminId(userObj._id);
    setAdminName(userObj.name || "");
    if (userObj?.admin_access_right_id?.access_permissions?.edit_payment) {
      setModifyPayment(
        userObj.admin_access_right_id.access_permissions.edit_payment === "true"
      );
    }
  }, []);
  
  useEffect(() => {
    if (alertConfig.visibility && alertConfig.noReload) {
      const timer = setTimeout(() => {
        setAlertConfig((prev) => ({ ...prev, visibility: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alertConfig.visibility]);
  
  useEffect(() => {
    fetchAgents();
    fetchSalaryPayments();
  }, [reRender]);
  
  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    const todayStr = new Date().toISOString().split("T")[0];
    setSalaryForm((prev) => {
      const updated = { ...prev, [name]: value };
      const from = updated.from_date ? new Date(updated.from_date) : null;
      const to = updated.to_date ? new Date(updated.to_date) : null;
      const today = new Date(todayStr);
      let fromError = "";
      let toError = "";
      if (from && isNaN(from.getTime())) {
        fromError = "Invalid From Date";
      } else if (from && from > today) {
        fromError = "From Date cannot be in the future.";
      }
      if (to && isNaN(to.getTime())) {
        toError = "Invalid To Date";
      } else if (to && to > today) {
        toError = "To Date cannot be in the future.";
      }
      if (from && to && !isNaN(from.getTime()) && !isNaN(to.getTime()) && from > to) {
        fromError = "From Date cannot be greater than To Date.";
        toError = "To Date cannot be less than From Date.";
      }
      setErrors((prevErrors) => ({
        ...prevErrors,
        from_date: fromError,
        to_date: toError,
      }));
      return updated;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!salaryForm.agent_id) newErrors.agent_id = "Please select an agent";
    if (salaryForm.pay_type === "online" && !salaryForm.transaction_id)
      newErrors.pay_type = "Transaction ID is required for online payments";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;
    
    const payload = {
      empId: salaryForm.agent_id,
      from_date: salaryForm.from_date,
      to_date: salaryForm.to_date,
      note: salaryForm.note,
      pay_type: salaryForm.pay_type,
      total_paid_amount: manualPaidAmount ? parseFloat(manualPaidAmount) : null,
    };
    
    try {
      setIsLoading(true);
      const res = await API.post("/salary/save", payload);
      api.open({
        message: "Salary Processed Successfully",
        description: res.data.message || "Salary calculated and payout record created.",
        className: "bg-green-500 rounded-lg font-semibold text-white",
        showProgress: true,
        pauseOnHover: false,
      });
      setShowSalaryModal(false);
      resetForm();
      setReRender((val) => val + 1);
      fetchSalaryPayments();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to process salary";
      api.open({
        message: "Salary Processing Failed",
        description: message,
        showProgress: true,
        pauseOnHover: false,
        className: "bg-red-500 rounded-lg font-semibold text-white",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setDateMode("month");
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(currentMonth);
    setSalaryForm({
      agent_id: "",
      pay_date: today.toISOString().split("T")[0],
      from_date: "",
      to_date: "",
      amount: "",
      pay_type: "cash",
      transaction_id: "",
      note: "",
      pay_for: paymentFor,
      admin_type: adminId,
    });
    setEmployeeDetails({ joining_date: "", salary: "" });
    setCalculatedSalary("");
    setManualPaidAmount("");
    setAlreadyPaid("0.00");
    setRemainingSalary("0.00");
    setSalaryCalculationDetails(null);
  };
  
  const salaryColumns = [
    { key: "id", header: "SL. NO" },
    { key: "pay_date", header: "Pay Date" },
    { key: "agent_name", header: "Agent" },
    { key: "amount", header: "Paid Amount (₹)" }, // Updated header
    { key: "pay_type", header: "Payment Mode" },
    { key: "receipt_no", header: "Receipt No" },
    { key: "from_date", header: "From Date" },
    { key: "to_date", header: "To Date" },
    { key: "note", header: "Note" },
    { key: "disbursed_by", header: "Disbursed by" },
    { key: "action", header: "Action" },
  ];
  
  return (
    <>
      <div>
        {contextHolder}
        <div className="flex mt-20">
          <Navbar visibility={true} />
          <Sidebar />
          <CustomAlert
            type={alertConfig.type}
            isVisible={alertConfig.visibility}
            message={alertConfig.message}
            noReload={alertConfig.noReload}
          />
          <div className="flex-grow p-7">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">
                <span className="text-2xl text-red-500 font-bold">{paymentFor?.toUpperCase()}</span> Payments Out
              </h1>
              <Tooltip title="Add Salary Payment">
                <button
                  onClick={() => {
                    setShowSalaryModal(true);
                    resetForm();
                  }}
                  className="ml-4 bg-blue-900 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition duration-200 flex items-center"
                >
                  <span className="mr-2">+</span> Salary Payment
                </button>
              </Tooltip>
            </div>
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">Salary Payments</h2>
              {salaryPayments.length > 0 ? (
                <DataTable
                  data={salaryPayments}
                  columns={salaryColumns}
                  exportedPdfName="PayOut Salary"
                  exportedFileName={`PayOut Salary.csv`}
                />
              ) : (
                <div className="mt-10 text-center text-gray-500">
                  <CircularLoader
                    isLoading={isLoading}
                    data="Salary Payments"
                    failure={salaryPayments.length === 0}
                  />
                </div>
              )}
            </div>
          </div>
          <Modal
            isVisible={showSalaryModal}
            onClose={() => {
              setShowSalaryModal(false);
              resetForm();
            }}
          >
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-6 lg:px-8 text-left max-h-[90vh] my-2">
              <div className="mb-6 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Salary Payment</h3>
                    <p className="text-sm text-gray-500">Process and manage employee salary disbursement</p>
                  </div>
                </div>
              </div>
              <form className="space-y-6" onSubmit={handleSalarySubmit}>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <label className="block mb-2 text-sm font-semibold text-gray-800">
                    Select Employee <span className="text-red-500">*</span>
                  </label>
                  <Select
                    className="w-full"
                    placeholder="Search and select employee..."
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                    value={salaryForm.agent_id || undefined}
                    onChange={(value) => {
                      setErrors((prev) => ({ ...prev, agent_id: "" }));
                      setSalaryForm((prev) => ({
                        ...prev,
                        agent_id: value,
                        amount: "",
                      }));
                      setEmployeeDetails({ joining_date: "", salary: "" });
                      setCalculatedSalary("");
                      setManualPaidAmount("");
                      setAlreadyPaid("0.00");
                      setRemainingSalary("0.00");
                      fetchEmployeeDetails(value);
                    }}
                  >
                    {agents.map((agent) => (
                      <Select.Option key={agent._id} value={agent._id}>
                        {`${agent.name} | ${agent.phone_number}`}
                      </Select.Option>
                    ))}
                  </Select>
                  {errors.agent_id && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <span>⚠</span> {errors.agent_id}
                    </p>
                  )}
                </div>
                {employeeDetails.joining_date && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Joining Date</p>
                        <p className="text-lg font-bold text-gray-900">{employeeDetails.joining_date}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Monthly Salary</p>
                        <p className="text-lg font-bold text-green-700">₹{employeeDetails.salary}</p>
                      </div>
                    </div>
                    {/* Month Range Toggle & Inputs */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-800 mb-4">Salary Period</h4>
                      <div className="flex items-center space-x-6 mb-5">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            className="form-radio text-blue-600"
                            checked={dateMode === "month"}
                            onChange={() => setDateMode("month")}
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">Month</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            className="form-radio text-blue-600"
                            checked={dateMode === "custom"}
                            onChange={() => setDateMode("custom")}
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">Custom Date Range</span>
                        </label>
                      </div>
                      {/* Single Month Input */}
                      {dateMode === "month" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
                          <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                      {/* Custom Date Inputs */}
                      {dateMode === "custom" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                            <input
                              type="date"
                              name="from_date"
                              value={salaryForm.from_date}
                              max={new Date().toISOString().split("T")[0]}
                              onChange={handleSalaryChange}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                            {errors.from_date && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span>⚠</span> {errors.from_date}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                            <input
                              type="date"
                              name="to_date"
                              value={salaryForm.to_date}
                              max={new Date().toISOString().split("T")[0]}
                              onChange={handleSalaryChange}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                            {errors.to_date && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span>⚠</span> {errors.to_date}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Calculate Button */}
                      {salaryForm.from_date && salaryForm.to_date && (
                        <div className="text-right mt-4">
                          <button
                            type="button"
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                            onClick={() => {
                              if (
                                salaryForm.agent_id &&
                                salaryForm.from_date &&
                                salaryForm.to_date &&
                                employeeDetails.salary
                              ) {
                                const fd = formatDate(salaryForm.from_date);
                                const td = formatDate(salaryForm.to_date);
                                calculateProRatedSalary(fd, td, employeeDetails.salary, salaryForm.agent_id);
                              }
                            }}
                          >
                            Calculate Salary
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Calculated Salary Highlight */}
                    {calculatedSalary && (
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-300 shadow-sm">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Total Payable Amount</p>
                        <p className="text-3xl font-bold text-blue-900">₹{calculatedSalary}</p>
                      </div>
                    )}
                    {/* Manual Paid Amount Input */}
                    {calculatedSalary && (
                      <div className="mt-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Actual Paid Amount (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={manualPaidAmount}
                          onChange={(e) => setManualPaidAmount(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="Enter the actual amount paid"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Leave blank to use calculated amount ({calculatedSalary}₹)
                        </p>
                      </div>
                    )}
                    {/* Salary Breakdown Section */}
                    {salaryCalculationDetails && (
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-5 py-3 border-b border-slate-200">
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3v3m-6-6v6m0-11V5a2 2 0 012-2h6a2 2 0 012 2v11m-6 0h6" />
                            </svg>
                            Salary Breakdown
                          </h4>
                        </div>
                        <div className="p-5 space-y-5">
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Leave Summary</p>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-white p-3 rounded border border-slate-100">
                                <p className="text-xs text-gray-500 font-medium">Leaves Used</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">
                                  {salaryCalculationDetails.leave_info.total_leaves_used}
                                </p>
                              </div>
                              <div className="bg-white p-3 rounded border border-slate-100">
                                <p className="text-xs text-gray-500 font-medium">Total Absences</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">
                                  {salaryCalculationDetails.leave_info.total_absences}
                                </p>
                              </div>
                              <div className="bg-white p-3 rounded border border-slate-100">
                                <p className="text-xs text-gray-500 font-medium">Leave Balance</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">
                                  {salaryCalculationDetails.leave_info.current_leave_balance}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3">Monthly Details</p>
                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                              <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                                  <tr>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Month</th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Absences</th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Leaves</th>
                                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700">Deductions</th>
                                  </tr>
                                </thead>
                                <tbody className="text-gray-800">
                                  {salaryCalculationDetails.leave_info.monthly_breakdown.map((m, i) => (
                                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                      <td className="px-4 py-3 font-medium text-gray-900">{m.month}</td>
                                      <td className="px-4 py-3">{m.total_absences}</td>
                                      <td className="px-4 py-3">{m.leaves_used}</td>
                                      <td className="px-4 py-3 text-right font-medium text-red-600">
                                        ₹{m.deductions.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          {salaryCalculationDetails.deductions_info.details.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-3">Deductions</p>
                              <div className="space-y-2 bg-red-50 p-4 rounded-lg border border-red-200">
                                {salaryCalculationDetails.deductions_info.details.map((d, i) => (
                                  <div key={i} className="flex justify-between items-center py-2 border-b border-red-100 last:border-0">
                                    <span className="text-sm text-gray-700">{d.justification}{d.note && ` (${d.note})`}</span>
                                    <span className="font-semibold text-red-700">-₹{parseFloat(d.amount).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Already Paid</p>
                        <p className="text-2xl font-bold text-green-900">₹{alreadyPaid}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-1">Remaining</p>
                        <p className="text-2xl font-bold text-orange-900">₹{remainingSalary}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Payment Date</label>
                        <input
                          type="date"
                          name="pay_date"
                          value={salaryForm.pay_date}
                          onChange={handleSalaryChange}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          disabled={!modifyPayment}
                        />
                      </div>
                      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Payment Mode</label>
                        <select
                          name="pay_type"
                          value={salaryForm.pay_type}
                          onChange={handleSalaryChange}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        >
                          <option value="cash">Cash</option>
                          <option value="online">Online Transfer</option>
                          {modifyPayment && (
                            <>
                              <option value="cheque">Cheque</option>
                              <option value="bank_transfer">Bank Transfer</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                    {salaryForm.pay_type === "online" && (
                      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Transaction ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="transaction_id"
                          value={salaryForm.transaction_id}
                          onChange={handleSalaryChange}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="Enter transaction ID"
                        />
                      </div>
                    )}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Additional Notes</label>
                      <textarea
                        name="note"
                        value={salaryForm.note}
                        onChange={handleSalaryChange}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                        rows="3"
                        placeholder="Add any additional notes..."
                      />
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-300 shadow-sm">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Disbursed By</p>
                      <p className="text-lg font-bold text-blue-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                          {adminName?.charAt(0).toUpperCase()}
                        </div>
                        {adminName}
                      </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowSalaryModal(false)}
                        className="px-6 mb-10 py-2.5 text-gray-700 font-medium border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 mb-10 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Payment
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </Modal>
          {/* Edit Salary Modal */}
          <EditSalaryModal
            isVisible={isEditing}
            onClose={() => {
              setIsEditing(false);
              setEditingSalary(null);
            }}
            salary={editingSalary}
            onEditSuccess={() => {
              setIsEditing(false);
              setEditingSalary(null);
              setReRender(prev => prev + 1);
              fetchSalaryPayments();
            }}
          />
        </div>
      </div>
    </>
  );
};

export default PayoutSalary;