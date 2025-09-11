/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import API from "../instance/TokenInstance";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import { Select, Tooltip, notification } from "antd";
import SettingSidebar from "../components/layouts/SettingSidebar";

const PayoutSalary = () => {
  const paymentFor = "salary";
  const [api, contextHolder] = notification.useNotification();
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [modifyPayment, setModifyPayment] = useState(false);
  const [adminId, setAdminId] = useState("");
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

  const today = new Date();

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

  const calculateProRatedSalary = async (
    fromDateStr,
    toDateStr,
    monthlySalary,
    empId
  ) => {
    if (!fromDateStr || !toDateStr || !monthlySalary || !empId) {
      setCalculatedSalary("");
      setAlreadyPaid("0.00");
      setRemainingSalary("0.00");
      return;
    }

    const fromDate = new Date(formatDate(fromDateStr));
    const toDate = new Date(formatDate(toDateStr));
    const salary = parseFloat(monthlySalary);

    if (toDate < fromDate || isNaN(salary)) {
      setCalculatedSalary("");
      setAlreadyPaid("0.00");
      setRemainingSalary("0.00");
      return;
    }

    let current = new Date(fromDate);
    let totalSalary = 0;

    while (current <= toDate) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const fromDay =
        current.getFullYear() === fromDate.getFullYear() &&
        current.getMonth() === fromDate.getMonth()
          ? fromDate.getDate()
          : 1;

      const toDay =
        current.getFullYear() === toDate.getFullYear() &&
        current.getMonth() === toDate.getMonth()
          ? toDate.getDate()
          : daysInMonth;

      const daysWorked = toDay - fromDay + 1;
      const dailySalary = salary / daysInMonth;

      totalSalary += daysWorked * dailySalary;
      current = new Date(year, month + 1, 1);
    }

    const proRatedSalary = totalSalary;
    const totalPayableWithIncentive = proRatedSalary;

    setCalculatedSalary(totalPayableWithIncentive.toFixed(2));
    setTotalWithIncentive(totalPayableWithIncentive.toFixed(2));

    try {
      const res = await API.get("/payment-out/get-salary-payments");
      const paidToAgent = res?.data?.filter((p) => {
        const pAgentId = p.agent_id?._id
          ? String(p.agent_id._id)
          : String(p.agent_id);
        const matchesAgent = pAgentId === String(empId);
        const payDate = new Date(formatDate(p.pay_date));
        return matchesAgent && payDate >= fromDate && payDate <= toDate;
      });

      const totalPaid = paidToAgent.reduce(
        (sum, p) => sum + parseFloat(p.amount || 0),
        0
      );

      const remaining = totalPayableWithIncentive - totalPaid;

      setAlreadyPaid(totalPaid.toFixed(2));
      setRemainingSalary(remaining.toFixed(2));
    } catch (error) {
      console.error("Error calculating already paid and remaining", error);
      setAlreadyPaid("0.00");
      setRemainingSalary(totalPayableWithIncentive.toFixed(2));
    }
  };

  const fetchEmployeeDetails = async (empId) => {
    try {
      const res = await API.get(
        `/agent/get-additional-employee-info-by-id/${empId}`
      );
      const emp = res?.data?.employee;
      if (emp) {
        const joining = emp.joining_date?.split("T")[0] || "";
        const baseSalary = emp.salary || "";
        setEmployeeDetails({ joining_date: joining, salary: baseSalary });

        if (salaryForm.from_date && salaryForm.to_date) {
          const fd = formatDate(salaryForm.from_date);
          const td = formatDate(salaryForm.to_date);
          fetchTargetDetails(empId, fd, td);
          calculateProRatedSalary(fd, td, baseSalary, empId);
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
      const response = await API.get("/payment-out/get-salary-payments");
      const responseData = response.data.map((payment, index) => ({
        id: index + 1,
        _id: payment._id,
        agent_id: payment.agent_id,
        agent_name: payment.agent_id?.name,
        pay_date: payment.pay_date,
        amount: payment.amount,
        pay_type: payment.pay_type,
        transaction_id: payment.transaction_id,
        note: payment.note,
        pay_for: payment.pay_for,
        disbursed_by: payment.admin_type?.name,
        receipt_no: payment.receipt_no,
      }));
      setSalaryPayments(responseData);
    } catch (error) {
      console.error("Failed to fetch Salary payments", error);
      setSalaryPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTargetDetails = async (agentId, fromDate, toDate) => {
    if (!agentId || !fromDate || !toDate) {
      resetTargetData();
      return;
    }

    try {
      const res = await API.get(`/target/employee/${agentId}`, {
        params: { from_date: fromDate, to_date: toDate },
      });

      if (res.data?.success && res.data?.summary) {
        const empSummary = res.data.summary;

        setTargetData({
          target: empSummary.agent?.target?.value || "Not Set",
          achieved: empSummary.metrics?.actual_business || "₹0.00",
          difference: empSummary.metrics?.target_difference || "₹0.00",
          remaining: empSummary.metrics?.target_remaining || "₹0.00",
          incentiveAmount: empSummary.metrics?.total_estimated || "₹0.00",
          incentivePercent:
            (empSummary.agent?.target?.achievement_percent || "0") + "%",
        });
        return;
      }

      resetTargetData();
    } catch (error) {
      console.error("Error fetching target details", error);
      resetTargetData();
    }
  };

  const resetTargetData = () => {
    setTargetData({
      target: 0,
      achieved: 0,
      difference: 0,
      remaining: 0,
      incentiveAmount: "₹0.00",
      incentivePercent: "0%",
    });
  };

  // Load user info on mount
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

  // Initial data load
  useEffect(() => {
    fetchAgents();
    fetchSalaryPayments();
  }, [reRender]);

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setSalaryForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!salaryForm.agent_id) newErrors.agent_id = "Please select an agent";
    if (!salaryForm.amount || isNaN(salaryForm.amount))
      newErrors.amount = "Please enter a valid amount";
    if (salaryForm.pay_type === "online" && !salaryForm.transaction_id)
      newErrors.pay_type = "Transaction ID is required for online payments";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      try {
        setIsLoading(true);
        const payload = {
          ...salaryForm,
          admin_type: adminId,
        };
        await API.post("/payment-out/add-salary-payment", payload);
        api.open({
          message: "Salary Payout Successful",
          description: "The salary payment has been successfully processed.",
          className: "bg-green-500 rounded-lg font-semibold text-white",
          showProgress: true,
          pauseOnHover: false,
        });
        setShowSalaryModal(false);
        resetForm();
        setReRender((val) => val + 1);
        fetchSalaryPayments();
      } catch (error) {
        const message = error.message || "Something went wrong";
        api.open({
          message: "Salary Payout Failed",
          description: message,
          showProgress: true,
          pauseOnHover: false,
          className: "bg-red-500 rounded-lg font-semibold text-white",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
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
    setAlreadyPaid("0.00");
    setRemainingSalary("0.00");
    resetTargetData();
  };

  const salaryColumns = [
    { key: "id", header: "SL. NO" },
    { key: "pay_date", header: "Pay Date" },
    { key: "agent_name", header: "Agent" },
    { key: "amount", header: "Amount (₹)" },
    { key: "pay_type", header: "Payment Mode" },
    { key: "receipt_no", header: "Receipt No" },
    { key: "note", header: "Note" },
    { key: "disbursed_by", header: "Disbursed by" },
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
                <span className="text-2xl text-red-500 font-bold">
                  {paymentFor?.toUpperCase()}
                </span>{" "}
                Payments Out
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
              <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                Salary Payments
              </h2>

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
            <div className="py-6 px-5 lg:px-8 text-left">
              <h3 className="mb-4 text-xl font-bold text-gray-900 border-b pb-2">
                Add Salary Payment
              </h3>
              <form className="space-y-4" onSubmit={handleSalarySubmit}>
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <Select
                    className="w-full h-12"
                    placeholder="Select Agent"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={salaryForm.agent_id || undefined}
                    onChange={(value) => {
                      setErrors((prev) => ({ ...prev, agent_id: "" }));
                      setSalaryForm((prev) => ({
                        ...prev,
                        agent_id: value,
                        from_date: "",
                        to_date: "",
                        amount: "",
                      }));
                      setEmployeeDetails({ joining_date: "", salary: "" });
                      setCalculatedSalary("");
                      setAlreadyPaid("0.00");
                      setRemainingSalary("0.00");
                      resetTargetData();
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
                    <p className="text-red-500 text-xs mt-1">
                      {errors.agent_id}
                    </p>
                  )}
                </div>

                {employeeDetails.joining_date && (
                  <>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Joining Date
                      </label>
                      <input
                        type="text"
                        value={employeeDetails.joining_date}
                        readOnly
                        className="bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded-lg w-full p-2.5"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          From Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="from_date"
                          value={salaryForm.from_date}
                          onChange={handleSalaryChange}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          To Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="to_date"
                          value={salaryForm.to_date}
                          onChange={handleSalaryChange}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="col-span-2">
                        <button
                          type="button"
                          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                          onClick={() => {
                            if (
                              salaryForm.agent_id &&
                              salaryForm.from_date &&
                              salaryForm.to_date &&
                              employeeDetails.salary
                            ) {
                              const fd = formatDate(salaryForm.from_date);
                              const td = formatDate(salaryForm.to_date);
                              fetchTargetDetails(salaryForm.agent_id, fd, td);
                              calculateProRatedSalary(
                                fd,
                                td,
                                employeeDetails.salary,
                                salaryForm.agent_id
                              );
                            }
                          }}
                        >
                          Calculate
                        </button>
                      </div>
                    </div>

                    {/* ✅ TARGET DATA DISPLAY */}
                    <div className="grid grid-cols-2 gap-4 mt-6 p-3 rounded-lg bg-gray-50">
                      <div>
                        <label className="block text-sm font-medium">
                          Target
                        </label>
                        <input
                          value={`${targetData.target?.toLocaleString(
                            "en-IN"
                          )}`}
                          readOnly
                          className="w-full border rounded px-3 py-2 bg-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          Achieved
                        </label>
                        <input
                          value={`${targetData.achieved?.toLocaleString(
                            "en-IN"
                          )}`}
                          readOnly
                          className="w-full border rounded px-3 py-2 bg-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          Difference
                        </label>
                        <input
                          value={`${targetData.difference?.toLocaleString(
                            "en-IN"
                          )}`}
                          readOnly
                          className="w-full border rounded px-3 py-2 bg-white font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Monthly Salary (₹)
                      </label>
                      <input
                        type="text"
                        value={employeeDetails.salary}
                        readOnly
                        className="bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded-lg w-full p-2.5"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Total Payable Salary (₹)
                      </label>
                      <input
                        type="text"
                        value={calculatedSalary}
                        readOnly
                        className="border border-gray-300 font-semibold text-sm rounded-lg w-full p-2.5"
                      />
                    </div>
                  </>
                )}

                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="pay_date"
                    value={salaryForm.pay_date}
                    onChange={handleSalaryChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    disabled={!modifyPayment}
                  />
                </div>

                {calculatedSalary && (
                  <div className="mt-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Enter Payable Amount (₹){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      min={1}
                      value={salaryForm.amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value || 0);
                        const rem = parseFloat(remainingSalary);
                        if (val > rem) {
                          setErrors((prev) => ({
                            ...prev,
                            amount: `Cannot pay more than ₹${rem.toFixed(2)}`,
                          }));
                        } else {
                          setSalaryForm((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }));
                          setErrors((prev) => ({ ...prev, amount: "" }));
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Enter amount to pay"
                    />
                    {errors.amount && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.amount}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-900">
                          Already Paid (₹)
                        </label>
                        <input
                          type="text"
                          value={alreadyPaid}
                          readOnly
                          className="bg-green-50 border border-green-300 text-green-700 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-900">
                          Remaining Salary (₹)
                        </label>
                        <input
                          type="text"
                          value={remainingSalary}
                          readOnly
                          className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Payment Mode
                  </label>
                  <select
                    name="pay_type"
                    value={salaryForm.pay_type}
                    onChange={handleSalaryChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                    {modifyPayment && (
                      <>
                        <option value="cheque">Cheque</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </>
                    )}
                  </select>
                </div>

                {salaryForm.pay_type === "online" && (
                  <div className="w-full">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="transaction_id"
                      value={salaryForm.transaction_id}
                      onChange={handleSalaryChange}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Note
                  </label>
                  <textarea
                    name="note"
                    value={salaryForm.note}
                    onChange={handleSalaryChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows="2"
                  />
                </div>

                <div className="w-full bg-blue-50 p-3 rounded-lg">
                  <label className="block mb-1 text-sm font-medium text-gray-900">
                    Disbursed By
                  </label>
                  <div className="font-semibold">{adminName}</div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSalaryModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isLoading ? "Processing..." : "Save Payment"}
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default PayoutSalary;
