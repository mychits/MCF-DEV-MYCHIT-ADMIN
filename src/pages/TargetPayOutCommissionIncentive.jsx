/* eslint-disable no-unused-vars */

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

const TargetPayOutCommissionIncentive = () => {
  const paymentFor = "commission";
  const [api, contextHolder] = notification.useNotification();
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [modifyPayment, setModifyPayment] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    noReload: false,
    type: "info",
  });
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [agentType, setAgentType] = useState("");
  const [calculatedAmount, setCalculatedAmount] = useState("0.00");
  const [alreadyPaid, setAlreadyPaid] = useState("0.00");
  const [remainingPayable, setRemainingPayable] = useState("0.00");
  const [selectedUserList, setSelectedUserList] = useState([]);
  const [commissionPayments, setCommissionPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCommissionCalculation, setIsLoadingCommissionCalculation] =
    useState(false);
  const [adminName, setAdminName] = useState("");
  const [errors, setErrors] = useState({});
  const [reRender, setReRender] = useState(0);
  const [targetData, setTargetData] = useState({
    target: 0,
    achieved: 0,
    remaining: 0,
    difference: 0,
    upToTarget: 0,
    beyondTarget: 0,
    targetCommission: 0,
    isTargetSet: false,
    targetDisplay: "Not Set",
    calculationType: "commission", // "commission" for agents, "incentive" for employees
  });

  // Get current month for max attribute
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  const [commissionForm, setCommissionForm] = useState({
    agent_id: "",
    pay_date: new Date().toISOString().split("T")[0],
    selectedMonth: currentMonth,
    amount: "",
    pay_type: "cash",
    transaction_id: "",
    note: "",
    pay_for: paymentFor,
    admin_type: "",
  });

  const [commissionBreakdown, setCommissionBreakdown] = useState([]);
  const [isTargetLoading, setIsTargetLoading] = useState(false);

  const fetchAgents = async () => {
    try {
      const res = await API.get("/agent/get-agent");
      const all = res.data || [];
      setAgents(
        all.filter((a) => a.agent_type === "agent" || a.agent_type === "both")
      );
      setEmployees(
        all.filter(
          (a) => a.agent_type === "employee" || a.agent_type === "both"
        )
      );
    } catch (err) {
      console.error("Agent fetch error", err);
    }
  };

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

  const fetchTargetDetails = async (agentId, month, type) => {
    if (!agentId || !month) {
      setTargetData({
        target: 0,
        achieved: 0,
        remaining: 0,
        difference: 0,
        upToTarget: 0,
        beyondTarget: 0,
        targetCommission: 0,
        isTargetSet: false,
        targetDisplay: "Not Set",
        calculationType: type === "employee" ? "incentive" : "commission",
      });
      return;
    }

    setIsTargetLoading(true);
    try {
      // Calculate first and last day of selected month
      const [year, monthStr] = month.split("-");
      const firstDay = `${year}-${monthStr}-01`;
      const lastDay = new Date(year, parseInt(monthStr), 0)
        .toISOString()
        .split("T")[0];

      // Fetch target details for the selected agent
      const targetRes = await API.get(`/target/agent/${agentId}`, {
        params: { year },
      });

      // Map month number to month name
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const monthNumber = parseInt(monthStr, 10);
      const monthName = monthNames[monthNumber - 1];

      let targetForMonth = 0;
      if (targetRes.data && targetRes.data.length > 0) {
        const monthData = targetRes.data[0].monthData || {};
        targetForMonth = Number(monthData[monthName] || 0);
      }

      // Fetch commission data to get achieved - CORRECTED: Removed extra /api prefix
      const comm = await API.get("/enroll/get-detailed-commission-per-month", {
        params: {
          agent_id: agentId,
          from_date: formatDate(firstDay),
          to_date: formatDate(lastDay),
        },
      });

      let achieved = comm?.data?.summary?.actual_business || 0;
      if (typeof achieved === "string") {
        achieved = Number(achieved.replace(/[^0-9.-]+/g, ""));
      }

      const remaining = Math.max(targetForMonth - achieved, 0);
      const difference = targetForMonth - achieved;

      // Calculate commission/incentive based on agent type
      let upToTarget = 0;
      let beyondTarget = 0;
      let totalCommission = 0;

      if (type === "agent") {
        // For agents: 0.5% up to target, 1% beyond target
        if (achieved <= targetForMonth) {
          upToTarget = achieved * 0.005; // 0.5%
        } else {
          upToTarget = targetForMonth * 0.005;
          beyondTarget = (achieved - targetForMonth) * 0.01; // 1%
        }
        totalCommission = upToTarget + beyondTarget;
      } else {
        // For employees: 1% only on amount beyond target
        if (achieved > targetForMonth) {
          beyondTarget = (achieved - targetForMonth) * 0.01; // 1%
        }
        totalCommission = beyondTarget;
      }

      // Format target value for display
      const targetDisplay =
        targetForMonth > 0
          ? `₹${targetForMonth.toLocaleString("en-IN")}`
          : "Not Set";

      setTargetData({
        target: targetForMonth,
        achieved,
        remaining,
        difference,
        upToTarget,
        beyondTarget,
        targetCommission: totalCommission,
        isTargetSet: targetForMonth >= 0,
        targetDisplay: targetDisplay,
        calculationType: type === "employee" ? "incentive" : "commission",
      });

      if (type === "agent") {
        setCalculatedAmount(totalCommission.toFixed(2));
        setCommissionForm((prev) => ({
          ...prev,
          amount: totalCommission.toFixed(2),
        }));
      } else {
        setCalculatedAmount(totalCommission.toFixed(2));
        setCommissionForm((prev) => ({
          ...prev,
          amount: totalCommission.toFixed(2),
        }));
      }

      // Store commission breakdown for display
      setCommissionBreakdown(comm?.data?.commission_data || []);
    } catch (error) {
      console.error("Failed to fetch target details", error);
      setTargetData({
        target: 0,
        achieved: 0,
        remaining: 0,
        difference: 0,
        upToTarget: 0,
        beyondTarget: 0,
        targetCommission: 0,
        isTargetSet: false,
        targetDisplay: "Not Set",
        calculationType: agentType === "employee" ? "incentive" : "commission",
      });
      setCommissionBreakdown([]);
    } finally {
      setIsTargetLoading(false);
    }
  };
  const fetchCommissionPayments = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/payment-out/get-commission-payments");
      const responseData = response.data.map((payment, index) => ({
        id: index + 1,
        _id: payment._id,
        agent_id: payment.agent_id,
        agent_name: payment.agent_id?.name,
        pay_date: payment.pay_date,
        amount: payment.amount,
        pay_type: payment.pay_type,
        commission_from:
          payment.commissionCalculationFromDate?.split("T")[0] || "-",
        commission_to:
          payment.commissionCalculationToDate?.split("T")[0] || "-",
        transaction_id: payment.transaction_id,
        note: payment.note,
        pay_for: payment.pay_for,
        disbursed_by: payment.admin_type?.name,
        receipt_no: payment.receipt_no,
      }));
      setCommissionPayments(responseData);
    } catch (error) {
      console.error("Failed to fetch Commission payments", error);
      setCommissionPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    const userObj = JSON.parse(user);
    setAdminId(userObj._id);
    setAdminName(userObj.full_name || userObj.name || "");
    if (userObj?.admin_access_right_id?.access_permissions?.edit_payment) {
      setModifyPayment(
        userObj.admin_access_right_id.access_permissions.edit_payment === "true"
      );
    }
    fetchAgents();
    fetchCommissionPayments();
  }, [reRender]);

  // Helper function to get first and last day from selected month
  const getMonthRange = (selectedMonth) => {
    if (!selectedMonth) return { firstDay: "", lastDay: "" };
    const [year, month] = selectedMonth.split("-");
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(year, month, 0).toISOString().split("T")[0];
    return { firstDay, lastDay };
  };

  const calculateTotalPayableCommission = async (agentId, month, type) => {
    if (!agentId || !month) {
      setCommissionForm((prev) => ({ ...prev, amount: "" }));
      return;
    }

    setIsLoadingCommissionCalculation(true);
    try {
      await fetchTargetDetails(agentId, month, type);
    } catch (error) {
      console.error("Failed to calculate agent commission:", error);
      setCommissionForm((prev) => ({ ...prev, amount: "" }));
    } finally {
      setIsLoadingCommissionCalculation(false);
    }
  };

  const handleCommissionChange = (e) => {
    const { name, value } = e.target;
    setCommissionForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "agent_id" || name === "selectedMonth") {
      const updatedAgentId =
        name === "agent_id" ? value : commissionForm.agent_id;
      const updatedMonth =
        name === "selectedMonth" ? value : commissionForm.selectedMonth;
      if (updatedAgentId && updatedMonth && agentType) {
        calculateTotalPayableCommission(
          updatedAgentId,
          updatedMonth,
          agentType
        );
      } else {
        setCalculatedAmount("0.00");
        setTargetData({
          target: 0,
          achieved: 0,
          remaining: 0,
          difference: 0,
          upToTarget: 0,
          beyondTarget: 0,
          targetCommission: 0,
          isTargetSet: false,
          targetDisplay: "Not Set",
          calculationType:
            agentType === "employee" ? "incentive" : "commission",
        });
        setCommissionBreakdown([]);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!commissionForm.agent_id) {
      newErrors.agent_id = "Please select an agent";
    }
    if (
      !commissionForm.amount ||
      isNaN(commissionForm.amount) ||
      parseFloat(commissionForm.amount) <= 0
    ) {
      newErrors.amount = "Please enter a valid amount";
    }
    if (!commissionForm.selectedMonth) {
      newErrors.selectedMonth = "Please select a month";
    }
    if (
      commissionForm.pay_type === "online" &&
      !commissionForm.transaction_id
    ) {
      newErrors.transaction_id =
        "Transaction ID is required for online payments";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      try {
        setIsLoading(true);

        // Calculate first and last day for payload
        const { firstDay, lastDay } = getMonthRange(
          commissionForm.selectedMonth
        );

        const payload = {
          ...commissionForm,
          admin_type: adminId,
          commissionCalculationFromDate: firstDay,
          commissionCalculationToDate: lastDay,
        };

        await API.post("/payment-out/add-commission-payment", payload);
        api.open({
          message: "Commission PayOut Added",
          description: "Commission Payment Has Been Successfully Added",
          className: "bg-green-400 rounded-lg font-bold",
          showProgress: true,
          pauseOnHover: false,
        });
        setShowCommissionModal(false);
        setCommissionForm({
          agent_id: "",
          pay_date: new Date().toISOString().split("T")[0],
          selectedMonth: currentMonth,
          amount: "",
          pay_type: "cash",
          transaction_id: "",
          note: "",
          admin_type: adminId,
          pay_for: paymentFor,
        });
        setReRender((val) => val + 1);
        fetchCommissionPayments();
      } catch (error) {
        const message = error.message || "Something went wrong";
        api.open({
          message: "Failed to Add Commission Payout",
          description: message,
          showProgress: true,
          pauseOnHover: false,
          className: "bg-red-400 rounded-lg font-bold",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const commissionColumns = [
    { key: "id", header: "SL. NO" },
    { key: "pay_date", header: "Pay Date" },
    { key: "agent_name", header: "Agent" },
    { key: "amount", header: "Amount (₹)" },
    { key: "pay_type", header: "Payment Mode" },
    { key: "commission_from", header: "From Date" },
    { key: "commission_to", header: "To Date" },
    { key: "receipt_no", header: "Receipt No" },
    { key: "note", header: "Note" },
    { key: "disbursed_by", header: "Disbursed by" },
  ];

  const resetCommissionForm = () => {
    setAgentType("");
    setSelectedUserList([]);
    setCommissionForm({
      agent_id: "",
      pay_date: new Date().toISOString().split("T")[0],
      selectedMonth: currentMonth,
      amount: "",
      pay_type: "cash",
      transaction_id: "",
      note: "",
      admin_type: adminId,
      pay_for: paymentFor,
    });
    setCommissionBreakdown([]);
    setTargetData({
      target: 0,
      achieved: 0,
      remaining: 0,
      difference: 0,
      upToTarget: 0,
      beyondTarget: 0,
      targetCommission: 0,
      isTargetSet: false,
      targetDisplay: "Not Set",
      calculationType: "commission",
    });
    setCalculatedAmount("0.00");
    setErrors({});
    setAlreadyPaid("0.00");
    setRemainingPayable("0.00");
    setIsTargetLoading(false);
  };

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
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold mb-4 md:mb-0">
                <span className="text-2xl text-red-500 font-bold">
                  Commission / Incentive
                </span>{" "}
                Payments Out
              </h1>
              <Tooltip title="Add Commission Payment">
                <button
                  onClick={() => {
                    setShowCommissionModal(true);
                    resetCommissionForm();
                  }}
                  className="bg-blue-900 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition duration-200 flex items-center"
                >
                  <span className="mr-2">+</span> Commission / Incentive Payment
                </button>
              </Tooltip>
            </div>
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                Commission / Incentive Payments
              </h2>
              {isLoading ? (
                <div className="mt-10 text-center">
                  <CircularLoader isLoading={true} data="Commission Payments" />
                </div>
              ) : commissionPayments.length > 0 ? (
                <DataTable
                  data={commissionPayments}
                  columns={commissionColumns}
                  exportedPdfName="PayOut Commission"
                  exportedFileName={`Commission Payments.csv`}
                />
              ) : (
                <div className="mt-10 text-center text-gray-500">
                  No commission payments found
                </div>
              )}
            </div>
          </div>

          <Modal
            isVisible={showCommissionModal}
            onClose={() => {
              setShowCommissionModal(false);
              resetCommissionForm();
            }}
            width="max-w-md"
          >
            <div className="py-6 px-5 lg:px-8 text-left">
              <h3 className="mb-4 text-xl font-bold text-gray-900 border-b pb-2">
                Add Commission / Incentive Payment
              </h3>
              <form className="space-y-4" onSubmit={handleCommissionSubmit}>
                <div className="w-full mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Select Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={agentType}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setAgentType(selected);
                      setSelectedUserList(
                        selected === "agent" ? agents : employees
                      );
                      setCommissionForm((prev) => ({
                        ...prev,
                        agent_id: "",
                        amount: "",
                      }));
                      setAlreadyPaid("0.00");
                      setRemainingPayable("0.00");
                      setTargetData({
                        target: 0,
                        achieved: 0,
                        remaining: 0,
                        difference: 0,
                        upToTarget: 0,
                        beyondTarget: 0,
                        targetCommission: 0,
                        isTargetSet: false,
                        targetDisplay: "Not Set",
                        calculationType:
                          selected === "employee" ? "incentive" : "commission",
                      });
                      setCommissionBreakdown([]);
                      setCalculatedAmount("0.00");
                      setErrors({});
                    }}
                  >
                    <option value="" disabled>
                      -- Select Type --
                    </option>
                    <option value="agent">Agent</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>

                {agentType && (
                  <div className="w-full mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Select {agentType === "agent" ? "Agent" : "Employee"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      className="w-full h-12"
                      placeholder={`Select ${agentType}`}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        String(option?.children)
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={commissionForm.agent_id || undefined}
                      onChange={(value) => {
                        setErrors((prev) => ({ ...prev, agent_id: "" }));
                        setCommissionForm((prev) => ({
                          ...prev,
                          agent_id: value,
                        }));
                        calculateTotalPayableCommission(
                          value,
                          commissionForm.selectedMonth,
                          agentType
                        );
                      }}
                    >
                      {(agentType === "agent" ? agents : employees).map(
                        (person) => (
                          <Select.Option key={person._id} value={person._id}>
                            {person.name} | {person.phone_number}
                          </Select.Option>
                        )
                      )}
                    </Select>
                    {errors.agent_id && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.agent_id}
                      </p>
                    )}
                  </div>
                )}

                {/* Single Month Picker */}
                <div className="w-full mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Month <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="month"
                    name="selectedMonth"
                    value={commissionForm.selectedMonth}
                    max={currentMonth}
                    onChange={handleCommissionChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {errors.selectedMonth && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.selectedMonth}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      calculateTotalPayableCommission(
                        commissionForm.agent_id,
                        commissionForm.selectedMonth,
                        agentType
                      )
                    }
                    disabled={
                      !commissionForm.agent_id ||
                      !commissionForm.selectedMonth ||
                      isLoadingCommissionCalculation
                    }
                    className="px-2 py-2 bg-green-700 text-white rounded-lg shadow-md hover:bg-green-800 transition duration-200"
                  >
                    {isLoadingCommissionCalculation
                      ? "Calculating..."
                      : "Calculate Amount"}
                  </button>
                </div>

                {/* Loading indicator for target data */}
                {isTargetLoading && (
                  <div className="mt-4 flex justify-center">
                    <CircularLoader isLoading={true} data="Target Details" />
                  </div>
                )}

                {/* Target details for both agents and employees */}
                {agentType && targetData && !isTargetLoading && (
                  <div className="mt-6">
                    {targetData.isTargetSet ? (
                      <div className="bg-gray-100 p-4 rounded-lg shadow mb-6">
                        <h2 className="text-lg font-bold text-yellow-800 mb-2">
                          Target Details
                        </h2>

                        {targetData.achieved >= targetData.target && (
                          <div className="text-green-800 font-semibold mb-3">
                            🎉 Target Achieved
                          </div>
                        )}

                        <div className="grid md:grid-cols-3 gap-4 bg-gray-50">
                          <div>
                            <label className="block font-medium">
                              Target Set
                            </label>
                            <input
                              value={targetData.targetDisplay}
                              readOnly
                              className="border px-3 py-2 rounded w-full bg-gray-50 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block font-medium">
                              Achieved
                            </label>
                            <input
                              value={`₹${targetData.achieved?.toLocaleString(
                                "en-IN"
                              )}`}
                              readOnly
                              className="border px-3 py-2 rounded w-full bg-gray-50 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block font-medium">
                              Difference
                            </label>
                            <input
                              value={`₹${targetData.difference?.toLocaleString(
                                "en-IN"
                              )}`}
                              readOnly
                              className="border px-3 py-2 rounded w-full bg-gray-50 font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block font-medium">
                              Total Payable{" "}
                              {targetData.calculationType === "incentive"
                                ? "Incentive"
                                : "Commission"}
                            </label>
                            <input
                              readOnly
                              value={`₹${targetData.targetCommission.toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}`}
                              className="border px-3 py-2 rounded w-full bg-gray-50 text-green-700 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-yellow-800 font-medium">
                          No target set for this {agentType}.{" "}
                          {targetData.calculationType === "incentive"
                            ? "Incentive"
                            : "Commission"}{" "}
                          will be calculated based on standard rules.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Commission/Incentive breakdown table */}
                {agentType && targetData.isTargetSet && !isTargetLoading && (
                  <div className="mt-4 bg-white p-4 rounded-lg shadow border">
                    <h3 className="font-semibold text-gray-800 mb-3 text-lg">
                      {targetData.calculationType === "incentive"
                        ? "Incentive"
                        : "Commission"}{" "}
                      Breakdown
                    </h3>
                    <table className="min-w-full text-sm border">
                      <thead>
                        <tr className="bg-blue-100 text-gray-700">
                          <th className="border px-3 py-2 text-left">Part</th>
                          <th className="border px-3 py-2 text-right">
                            Amount (₹)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {agentType === "agent" && (
                          <tr>
                            <td className="border px-3 py-2">
                              0.5% up to Target
                            </td>
                            <td className="border px-3 py-2 text-right">
                              ₹
                              {targetData.upToTarget?.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="border px-3 py-2">
                            {agentType === "agent"
                              ? "1% beyond Target"
                              : "1% incentive on target difference"}
                          </td>
                          <td className="border px-3 py-2 text-right">
                            ₹
                            {targetData.beyondTarget?.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                        <tr className="bg-green-100 font-semibold">
                          <td className="border px-3 py-2">
                            Total Payable{" "}
                            {targetData.calculationType === "incentive"
                              ? "Incentive"
                              : "Commission"}
                          </td>
                          <td className="border px-3 py-2 text-right text-green-800">
                            ₹
                            {targetData.targetCommission?.toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="pay_date"
                    value={commissionForm.pay_date}
                    onChange={handleCommissionChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    disabled={!modifyPayment}
                  />
                  {errors.pay_date && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.pay_date}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Total Payable (₹)
                  </label>
                  <input
                    type="text"
                    value={calculatedAmount}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 font-semibold"
                  />
                </div>

                <div className="w-full mt-4">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Enter Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    min={1}
                    value={commissionForm.amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCommissionForm((prev) => ({
                        ...prev,
                        amount: value,
                      }));
                      setErrors((prev) => ({ ...prev, amount: "" }));
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Enter how much to pay"
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                  )}
                </div>

                {agentType === "agent" && commissionBreakdown.length > 0 &&!isLoading && (
                  <div className="mt-6 bg-gray-100 p-3 rounded-lg shadow-inner border border-gray-300">
                    <h4 className="font-semibold text-gray-800 mb-3 text-lg">
                      Commission Breakdown (Customer-wise)
                    </h4>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      <table className="min-w-full text-sm border">
                        <thead>
                          <tr className="bg-blue-100 text-gray-700">
                            <th className="border px-3 py-2 text-left">
                              Customer
                            </th>
                            <th className="border px-3 py-2 text-left">
                              Phone
                            </th>
                            <th className="border px-3 py-2 text-left">
                              Group
                            </th>
                            <th className="border px-3 py-2 text-right">
                              Released Group value (₹)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {commissionBreakdown.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border px-3 py-2">
                                {item.user_name || "-"}
                              </td>
                              <td className="border px-3 py-2">
                                {item.phone_number || "-"}
                              </td>
                              <td className="border px-3 py-2">
                                {item.group_name || "-"}
                              </td>
                              <td className="border px-3 py-2 text-right">
                                {item.commission_released === "Yes"
                                  ? item.group_value
                                  : "₹0"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {agentType === "employee" && commissionBreakdown.length > 0 && !isLoading &&(
                  <div className="mt-6 bg-gray-100 p-3 rounded-lg shadow-inner border border-gray-300">
                    <h4 className="font-semibold text-gray-800 mb-3 text-lg">
                      Incentive Breakdown (Customer-wise)
                    </h4>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      <table className="min-w-full text-sm border">
                        <thead>
                          <tr className="bg-blue-100 text-gray-700">
                            <th className="border px-3 py-2 text-left">
                              Customer
                            </th>
                            <th className="border px-3 py-2 text-left">
                              Phone
                            </th>
                            <th className="border px-3 py-2 text-left">
                              Group
                            </th>
                            <th className="border px-3 py-2 text-right">
                              Released Group value (₹)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {commissionBreakdown.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border px-3 py-2">
                                {item.user_name || "-"}
                              </td>
                              <td className="border px-3 py-2">
                                {item.phone_number || "-"}
                              </td>
                              <td className="border px-3 py-2">
                                {item.group_name || "-"}
                              </td>
                              <td className="border px-3 py-2 text-right">
                                {item.commission_released === "Yes"
                                  ? item.group_value
                                  : "₹0"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Payment Mode
                  </label>
                  <select
                    name="pay_type"
                    value={commissionForm.pay_type}
                    onChange={handleCommissionChange}
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
                  {errors.pay_type && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.pay_type}
                    </p>
                  )}
                </div>

                {commissionForm.pay_type === "online" && (
                  <div className="w-full">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="transaction_id"
                      value={commissionForm.transaction_id}
                      onChange={handleCommissionChange}
                      placeholder="Enter transaction ID"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    {errors.transaction_id && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.transaction_id}
                      </p>
                    )}
                  </div>
                )}

                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Note
                  </label>
                  <textarea
                    name="note"
                    value={commissionForm.note}
                    onChange={handleCommissionChange}
                    placeholder="Additional details"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows="2"
                  />
                  {errors.note && (
                    <p className="text-red-500 text-xs mt-1">{errors.note}</p>
                  )}
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
                    onClick={() => {
                      setShowCommissionModal(false);
                      resetCommissionForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isLoadingCommissionCalculation}
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

export default TargetPayOutCommissionIncentive;


