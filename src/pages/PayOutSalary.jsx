import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import API from "../instance/TokenInstance";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import { Select, Tooltip, notification, Dropdown, Input } from "antd";
import SettingSidebar from "../components/layouts/SettingSidebar";
import SalarySlipPrint from "../components/printFormats/SalarySlipPrint";
import { IoMdMore } from "react-icons/io";
import EditSalaryModal from "../components/modals/EditSalaryModal";
import { DollarOutlined, CalendarOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';

const PayoutSalary = () => {
  const paymentFor = "salary";
  const [api, contextHolder] = notification.useNotification();
  const [dateMode, setDateMode] = useState("month");
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
  const [manualPaidAmount, setManualPaidAmount] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);
  const [isSalaryAlreadyPaid, setIsSalaryAlreadyPaid] = useState(false);
  const [isCalculationForExistingPayment, setIsCalculationForExistingPayment] = useState(false);
  const [otherPayments, setOtherPayments] = useState("");
  
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
  
  const checkIfSalaryAlreadyPaid = async (empId, fromDate, toDate) => {
    try {
      const response = await API.get("/salary/get-salary-payments", {
        params: {
          empId,
          from_date: formatDate(fromDate),
          to_date: formatDate(toDate)
        }
      });
      
      const salaryArray = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      const paidAmount = salaryArray
        .filter((p) => {
          const pAgentId = p.employee_id?._id ? String(p.employee_id._id) : String(p.employee_id);
          const paymentDate = new Date(formatDate(p.payout_metadata?.date_range?.from));
          return pAgentId === String(empId) && 
                 paymentDate >= new Date(formatDate(fromDate)) && 
                 paymentDate <= new Date(formatDate(toDate));
        })
        .reduce((sum, p) => sum + parseFloat(p.payout_metadata?.total_paid_amount || 0), 0);
        
      const alreadyPaid = paidAmount > 0;
      
      // Check if this is a calculation for existing payment
      const isCalculationForExisting = alreadyPaid && 
        salaryCalculationDetails && 
        salaryCalculationDetails?.totalSalary === paidAmount;
        
      setIsCalculationForExistingPayment(isCalculationForExisting);
      setIsSalaryAlreadyPaid(alreadyPaid);
      return {
        isPaid: alreadyPaid,
        totalPaid: paidAmount
      };
    } catch (error) {
      console.error("Error checking existing payments:", error);
      return {
        isPaid: false,
        totalPaid: 0
      };
    }
  };
  
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
    
    // Check if salary is already paid for this period
    const paymentStatus = await checkIfSalaryAlreadyPaid(empId, fromDateStr, toDateStr);
    setIsSalaryAlreadyPaid(paymentStatus.isPaid);
    
    if (paymentStatus.isPaid) {
      setCalculatedSalary("");
      setAlreadyPaid(paymentStatus.totalPaid.toFixed(2));
      setRemainingSalary("0.00");
      setSalaryCalculationDetails({
        totalSalary: paymentStatus.totalPaid,
        leave_info: {
          total_leaves_used: 0,
          total_absences: 0,
          current_leave_balance: 0,
          monthly_breakdown: [],
          full_year_report: []
        },
        deductionDetails: []
      });
      
      setAlertConfig({
        visibility: true,
        message: `Salary has already been paid for this period. Total paid: ₹${paymentStatus.totalPaid.toFixed(2)}`,
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
      
      const { totalSalary } = res.data;
      console.log(totalSalary, "salary calculation response");
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
        total_salary: payment.payout_metadata?.total_salary || 0,
        total_paid_amount: payment.payout_metadata?.total_paid_amount || 0,
        other_payments: payment.payout_metadata?.other_payments || 0,
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;
    
    // Check if salary is already paid before proceeding
    const paymentStatus = await checkIfSalaryAlreadyPaid(
      salaryForm.agent_id, 
      salaryForm.from_date, 
      salaryForm.to_date
    );
    
    if (paymentStatus.isPaid) {
      api.open({
        message: "Cannot create new payment",
        description: "Salary has already been paid for this period.",
        className: "bg-red-500 rounded-lg font-semibold text-white",
      });
      return;
    }
    
    // Calculate total paid amount including other payments
    let totalPaidAmount = 0;
    if (manualPaidAmount) {
      totalPaidAmount = parseFloat(manualPaidAmount);
    } else {
      totalPaidAmount = parseFloat(calculatedSalary);
    }
    
    if (otherPayments) {
      totalPaidAmount += parseFloat(otherPayments);
    }
    
    const payload = {
      empId: salaryForm.agent_id,
      from_date: salaryForm.from_date,
      to_date: salaryForm.to_date,
      note: salaryForm.note,
      pay_type: salaryForm.pay_type,
      transaction_id: salaryForm.transaction_id,
      total_paid_amount: totalPaidAmount,
      other_payments: otherPayments ? parseFloat(otherPayments) : 0
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
    setOtherPayments("");
    setAlreadyPaid("0.00");
    setRemainingSalary("0.00");
    setSalaryCalculationDetails(null);
    setIsSalaryAlreadyPaid(false);
    setIsCalculationForExistingPayment(false);
  };
  
  const salaryColumns = [
    { key: "id", header: "SL. NO" },
    { key: "pay_date", header: "Pay Date" },
    { key: "agent_name", header: "Agent" },
    { key: "total_paid_amount", header: "Total Paid Amount (₹)" },
    { key: "other_payments", header: "Other Payments (₹)" },
    { key: "total_salary", header: "Total Salary Amount (₹)" },
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0 0c0 3.517 2.843 6.38 6.36 6.38a6.36 6.36 0 006.36-6.38 6.36 6.36 0 00-6.36-6.38c-3.517 0-6.36 2.863-6.36 6.38m0 0c0 3.517 2.843 6.38 6.36 6.38a6.36 6.36 0 006.36-6.38 6.36 6.36 0 00-6.36-6.38c-3.517 0-6.36 2.863-6.36 6.38z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Salary Payment</h3>
                  <p className="text-sm text-gray-500">Process and manage employee salary disbursement</p>
                </div>
              </div>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    setOtherPayments("");
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
                      <p className="text-lg font-bold text-gray-900">{employeeDetails?.joining_date}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Monthly Salary</p>
                      <p className="text-lg font-bold text-green-700">₹{employeeDetails?.salary}</p>
                    </div>
                  </div>
                  
                
                  
                  {/* Month Range Toggle & Inputs */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <CalendarOutlined className="mr-2 text-blue-500" />
                      Salary Period
                    </h3>
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
                  
                  {/* Payment Already Exists Warning */}
                  {isSalaryAlreadyPaid && !isCalculationForExistingPayment && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                      <div className="flex items-start">
                        <InfoCircleOutlined className="text-yellow-500 mt-1 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Salary Already Paid</p>
                          <p className="text-xs text-yellow-600 mt-1">This salary period has already been processed.</p>
                          
                          <div className="mt-3 grid grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded-lg border border-yellow-100">
                              <p className="text-xs text-yellow-700 font-medium">Salary Amount</p>
                              <p className="text-lg font-bold text-yellow-900">₹{calculatedSalary || "0.00"}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-yellow-100">
                              <p className="text-xs text-yellow-700 font-medium">Already Paid</p>
                              <p className="text-lg font-bold text-yellow-900">₹{alreadyPaid}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-yellow-100">
                              <p className="text-xs text-yellow-700 font-medium">Other Payments</p>
                              <p className="text-lg font-bold text-yellow-900">₹{otherPayments || "0.00"}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-yellow-200">
                            <p className="text-sm font-semibold text-yellow-800">Total Amount: ₹{parseFloat(alreadyPaid) + (parseFloat(otherPayments) || 0)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Calculated Salary Highlight */}
                  {calculatedSalary && !isSalaryAlreadyPaid && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-300 shadow-sm">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Total Payable Amount</p>
                      <p className="text-3xl font-bold text-blue-900">₹{calculatedSalary}</p>
                    </div>
                  )}
                      {/* Salary Breakdown Section */}
                  {salaryCalculationDetails && !isSalaryAlreadyPaid && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-5 py-3 border-b border-slate-200">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3v3m-6-6v6m0-11V5a2 2 0 012-2h6a2 2 0 012 2v11m-6 0h6" />
                          </svg>
                          {isSalaryAlreadyPaid && isCalculationForExistingPayment ? "Existing Payment Details" : "Salary Breakdown"}
                        </h4>
                      </div>
                      <div className="p-5 space-y-5">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <p className="text-sm font-semibold text-gray-700 mb-3">Leave Summary</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded border border-slate-100">
                              <p className="text-xs text-gray-500 font-medium">Leaves Used</p>
                              <p className="text-xl font-bold text-gray-900 mt-1">
                                {salaryCalculationDetails?.leave_info?.total_leaves_used}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded border border-slate-100">
                              <p className="text-xs text-gray-500 font-medium">Total Absences</p>
                              <p className="text-xl font-bold text-gray-900 mt-1">
                                {salaryCalculationDetails?.leave_info?.total_absences}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded border border-slate-100">
                              <p className="text-xs text-gray-500 font-medium">Leave Balance</p>
                              <p className="text-xl font-bold text-gray-900 mt-1">
                                {salaryCalculationDetails?.leave_info?.current_leave_balance}
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
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Leaves Used</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Deductions</th>
                                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700">Salary Amount</th>
                                </tr>
                              </thead>
                              <tbody className="text-gray-800">
                                {salaryCalculationDetails?.leave_info?.monthly_breakdown.map((m, i) => (
                                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">{m.month}</td>
                                    <td className="px-4 py-3">{m.total_absences}</td>
                                    <td className="px-4 py-3">{m.leaves_used}</td>
                                    <td className="px-4 py-3 text-right font-medium text-red-600">
                                      ₹{m.deductions.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-blue-700">
                                      ₹{m.salary_amount ? m.salary_amount.toFixed(2) : "0.00"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        {salaryCalculationDetails?.deductions_info?.details?.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3">Deductions</p>
                            <div className="space-y-2 bg-red-50 p-4 rounded-lg border border-red-200">
                              {salaryCalculationDetails?.deductions_info.details.map((d, i) => (
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
                  
                  {calculatedSalary && !isSalaryAlreadyPaid && (
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
                  )}
                  {/* Manual Paid Amount Input */}
                  {calculatedSalary && !isSalaryAlreadyPaid && (
                    <div className="mt-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                         Payable Amount (₹)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={manualPaidAmount}
                        onChange={(e) => setManualPaidAmount(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.total_paid_amount ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="Enter Payable amount"
                      />
                      {errors.total_paid_amount && (
                        <p className="text-red-500 text-xs mt-1">{errors.total_paid_amount}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Leave blank to use calculated amount ({calculatedSalary}₹)
                      </p>
                    </div>
                  )}
                  
                  {/* Other Payments Field */}
                  {calculatedSalary && !isSalaryAlreadyPaid && (
                    <div className="mt-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Other Payments (₹)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={otherPayments}
                        onChange={(e) => setOtherPayments(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.other_payments ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="Enter additional payments"
                      />
                      {errors.other_payments && (
                        <p className="text-red-500 text-xs mt-1">{errors.other_payments}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Additional payments will be added to the base amount
                      </p>
                    </div>
                  )}
                  
              
                  
                  {calculatedSalary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Payment Date
                        </label>
                        <input
                          type="date"
                          name="pay_date"
                          value={salaryForm.pay_date}
                          onChange={handleSalaryChange}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          disabled={!modifyPayment}
                        />
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Payment Mode
                        </label>
                        <Select
                          value={salaryForm.pay_type}
                          onChange={(value) => setSalaryForm({...salaryForm, pay_type: value})}
                          className="w-full"
                        >
                          <Select.Option value="cash">Cash</Select.Option>
                          <Select.Option value="online">Online Transfer</Select.Option>
                          {modifyPayment && (
                            <>
                              <Select.Option value="cheque">Cheque</Select.Option>
                              <Select.Option value="bank_transfer">Bank Transfer</Select.Option>
                            </>
                          )}
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  {calculatedSalary && salaryForm.pay_type === "online" && (
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Transaction ID
                      </label>
                      <Input
                        value={salaryForm.transaction_id}
                        onChange={(e) => setSalaryForm({...salaryForm, transaction_id: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.transaction_id ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="Enter transaction ID"
                      />
                      {errors.transaction_id && (
                        <p className="text-red-500 text-xs mt-1">{errors.transaction_id}</p>
                      )}
                    </div>
                  )}
                  
                  {calculatedSalary && (
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={salaryForm.note}
                        onChange={(e) => setSalaryForm({...salaryForm, note: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.note ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        rows="3"
                        placeholder="Add any notes about this payment..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        These notes will be visible on the salary slip
                      </p>
                    </div>
                  )}
                  
                  {calculatedSalary && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-300 shadow-sm">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Disbursed By</p>
                      <p className="text-lg font-bold text-blue-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                          {adminName?.charAt(0).toUpperCase()}
                        </div>
                        {adminName}
                      </p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="p-4 border-t border-gray-200 mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSalaryModal(false);
                        resetForm();
                      }}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-5 py-2.5 rounded-lg text-white font-medium transition-colors ${
                        isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Save Payment"
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
    </>
  );
};

export default PayoutSalary;