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
import { useParams } from "react-router-dom";
// daily customer automated message
const PayOutCommission = () => {
  const  paymentFor ="commission"
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
  const [commissionPayments, setCommissionPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Used for form submission and initial table load
  const [isLoadingCommissionCalculation, setIsLoadingCommissionCalculation] = useState(false); // New loader for commission calculation
  const [adminName, setAdminName] = useState("");
  const [errors, setErrors] = useState({});
  const [reRender, setReRender] = useState(0);

  // Removed date filters for the main table as requested by the user.
  // The main table will now fetch all commission payments or rely on backend defaults.
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);


  const [commissionForm, setCommissionForm] = useState({
    agent_id: "",
    pay_date: new Date().toISOString().split("T")[0], // Date of the actual payment (transaction date)
    // New fields for commission calculation period within the modal
    commissionCalculationFromDate: firstDayOfMonth.toISOString().split("T")[0],
    commissionCalculationToDate: today.toISOString().split("T")[0],
    amount: "", // This will be auto-populated
    pay_type: "cash",
    transaction_id: "",
    note: "",
    pay_for: paymentFor,
    admin_type: "",
  });

  const fetchAgents = async () => {
    try {
      const response = await API.get("/agent/get-agent");
      if (response.data) {
        setAgents(response.data);
      } else {
        setAgents({});
      }
    } catch (error) {
      console.error("Failed to fetch Agents");
    }
  };

  // Fetch commission payments - removed date filters for the main table as per user request
  const fetchCommissionPayments = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/payment-out/get-commission-payments"); // No date parameters
      const responseData = response.data.map((payment,index) => ({
        id:index+1,
        _id: payment._id,
        agent_id: payment.agent_id,
        agent_name:payment.agent_id?.name,
        pay_date:payment.pay_date,
        amount: payment.amount,
        pay_type: payment.pay_type,
        transaction_id: payment.transaction_id,
        note: payment.note,
        pay_for: payment.pay_for,
        disbursed_by: payment.admin_type?.name,
        receipt_no:payment.receipt_no
      }));
      setCommissionPayments(responseData);
    } catch (error) {
      console.error("Failed to fetch Commission payments",error);
      setCommissionPayments([]);
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
    // Initial fetch of agents and commission payments
    fetchAgents();
    fetchCommissionPayments();
  }, [reRender]); // reRender is used to force a re-fetch of data.

  // New function to calculate total payable commission - updated to use specific calculation dates
  const calculateTotalPayableCommission = async (agentId, calcFromDate, calcToDate) => {
    if (!agentId || !calcFromDate || !calcToDate) {
      setCommissionForm((prev) => ({ ...prev, amount: "" }));
      return;
    }

    setIsLoadingCommissionCalculation(true);
    try {
      // Use calcFromDate and calcToDate directly from the arguments for the calculation period
      const fromDateForCalc = calcFromDate;
      const toDateForCalc = calcToDate;

      // Fetch target data (similar to CommissionReport)
      const targetRes = await API.get("/target/get-targets", {
        params: { fromDate: fromDateForCalc, toDate: toDateForCalc, agentId },
      });
      const rawTargets = targetRes.data || [];

      // Calculate total target for the period (mimicking CommissionReport logic)
      let totalTarget = 0;
      const monthMap = {};
      rawTargets.forEach((t) => {
        if ((t.agentId?._id || t.agentId) !== agentId) return;
        const date = new Date(t.startDate);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthMap[key]) monthMap[key] = t.totalTarget || 0;
      });

      const start = new Date(fromDateForCalc);
      const end = new Date(toDateForCalc);
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const key = `${year}-${month}`;
        // Fallback to the first target value if a month-specific target is not found
        const monthTarget = monthMap[key] ?? Object.values(monthMap)[0] ?? 0;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const perDayTarget = daysInMonth > 0 ? monthTarget / daysInMonth : 0;
        totalTarget += perDayTarget;
        currentDate.setDate(currentDate.getDate() + 1);
      }
      totalTarget = Math.round(totalTarget);

      let comm = { summary: { actual_business: 0 }, commission_data: [] };
      try {
        const detailedCommRes = await API.get(
          `/enroll/get-detailed-commission/${agentId}`,
          { params: { from_date: fromDateForCalc, to_date: toDateForCalc } }
        );
        comm = detailedCommRes.data;
      } catch (err) {
        // Check if the error is an AxiosError and if it's a 404 with specific message 'No enrollments found'
        if (err.response && err.response.status === 404 && err.response.data && err.response.data.message === 'No enrollments found') {
          // This is an expected scenario when no enrollments are found for the period.
          // 'comm' will retain its initial default value (actual_business: 0, commission_data: []),
          // which correctly translates to zero actualCommission.
          console.log("No enrollments found for agent in the period. Actual commission set to 0.");
        } else {
          // Re-throw other unexpected errors to be caught by the outer catch block
          throw err;
        }
      }

      let achievedBusiness = comm?.summary?.actual_business || 0;
      if (typeof achievedBusiness === "string") {
        achievedBusiness = Number(achievedBusiness.replace(/[^0-9.-]+/g, ""));
      }

      let actualCommission = 0;
      if (comm?.commission_data) {
          actualCommission = comm.commission_data.reduce((sum, item) => {
          const itemPayDate = new Date(item.start_date);
          // Ensure item date is within the calculated range (fromDateForCalc, toDateForCalc)
          if (itemPayDate >= new Date(fromDateForCalc) && itemPayDate <= new Date(toDateForCalc)) {
            const val = parseFloat(item.actual_commission_digits?.toString().replace(/[^0-9.-]+/g, "") || "0");
            return sum + val;
          }
          return sum;
        }, 0);
      }


      const difference = totalTarget - achievedBusiness;

      // Determine incentive (mimicking CommissionReport logic)
      const designation = rawTargets.find(
        (t) => (t.agentId?._id || t.agentId) === agentId
      )?.agentId?.designation_id?.title || "N/A";

      let incentiveAmount = 0;
      const title = designation.toLowerCase();

      if (title === "business agent" && achievedBusiness <= totalTarget) {
        incentiveAmount = difference * 0.005; // 0.5% of remaining for business agent if target not met
      } else if (difference < 0) {
        incentiveAmount = Math.abs(difference) * 0.01; // 1% of extra business if target exceeded
      }

      const totalPayable = actualCommission + incentiveAmount;

      setCommissionForm((prev) => ({
        ...prev,
        amount: totalPayable.toFixed(2), // Set the calculated amount, formatted to 2 decimal places
      }));

    } catch (error) {
      console.error("Failed to calculate commission:", error);
      setCommissionForm((prev) => ({ ...prev, amount: "" })); // Clear amount on error
      api.open({
        message: "Commission Calculation Failed",
        description: error.message || "Could not calculate commission for the selected agent.",
        className: "bg-red-400 rounded-lg font-bold",
        showProgress: true,
        pauseOnHover: false,
      });
    } finally {
      setIsLoadingCommissionCalculation(false);
    }
  };

  const handleCommissionChange = (e) => {
    const { name, value } = e.target;
    setCommissionForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Only trigger calculation if agent_id changes and relevant dates are already selected for initial calculation
    if (name === "agent_id") {
        const updatedAgentId = value;
        const updatedFromDate = commissionForm.commissionCalculationFromDate;
        const updatedToDate = commissionForm.commissionCalculationToDate;

        if (updatedAgentId && updatedFromDate && updatedToDate) {
            calculateTotalPayableCommission(updatedAgentId, updatedFromDate, updatedToDate);
        } else {
            setCommissionForm((prev) => ({ ...prev, amount: "" })); // Clear amount if agent or dates are missing
        }
    }
  };
  const validateForm = () => {
    const newErrors = {};

    if (!commissionForm.agent_id) {
      newErrors.agent_id = "Please select an agent";
    }

    if (!commissionForm.amount || isNaN(commissionForm.amount) || parseFloat(commissionForm.amount) <= 0) { // Added check for amount
      newErrors.amount = "Please enter a valid amount";
    }
    // Validate commission calculation dates
    if (!commissionForm.commissionCalculationFromDate) {
      newErrors.commissionCalculationFromDate = "Commission From Date is required";
    }
    if (!commissionForm.commissionCalculationToDate) {
      newErrors.commissionCalculationToDate = "Commission To Date is required";
    }
    if (commissionForm.commissionCalculationFromDate && commissionForm.commissionCalculationToDate &&
        new Date(commissionForm.commissionCalculationFromDate) > new Date(commissionForm.commissionCalculationToDate)) {
      newErrors.commissionCalculationToDate = "To Date must be after From Date";
    }


    if (
      commissionForm.pay_type === "online" &&
      !commissionForm.transaction_id
    ) {
      newErrors.transaction_id = "Transaction ID is required for online payments"; // Corrected error key
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
        const payload = {
          ...commissionForm,
          admin_type: adminId, 
        };
       
        const { commissionCalculationFromDate, commissionCalculationToDate, ...apiPayload } = payload;


        await API.post("/payment-out/add-commission-payment", apiPayload);
        api.open({
          message: "Commission PayOut Added",
          description: "Commission Payment Has Been Successfully Added",
          className: "bg-green-400 rounded-lg  font-bold",
          showProgress: true,
          pauseOnHover: false,
        });

        setShowCommissionModal(false);
      
        setCommissionForm({
          agent_id: "",
          pay_date: new Date().toISOString().split("T")[0],
          commissionCalculationFromDate: firstDayOfMonth.toISOString().split("T")[0],
          commissionCalculationToDate: today.toISOString().split("T")[0],
          amount: "",
          pay_type: "cash",
          transaction_id: "",
          note: "",
          admin_type:adminId, 
          pay_for:paymentFor
        });
        setReRender(val=>val+1)
        
        fetchCommissionPayments();
      } catch (error) {
        const message = error.message || "Something went wrong";
        api.open({
          message: "Failed to Add Commission Payout",
          description: message,
          showProgress: true,
          pauseOnHover: false,
          className: "bg-red-400 rounded-lg  font-bold",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const commissionColumns = [
    { key: "id", header: "SL. NO" },
    {
      key: "pay_date",
      header: "Pay Date",
    },
    {
      header: "Agent",
      key: "agent_name",
    },
    {
      header: "Amount (₹)",
      key: "amount",
    },
    {
      header: "Payment Mode",
      key: "pay_type",
    },
    {
      header: "Receipt_no",
      key: "receipt_no",
    },
    {
      header: "Note",
      key: "note",
    },
    {
      header: "Disbursed by",
      key: "disbursed_by",
    }
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
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold mb-4 md:mb-0">
                    <span className="text-2xl text-red-500 font-bold">
                        {paymentFor?.toUpperCase()}
                    </span>{" "}
                    Payments Out
                </h1>

           
                <Tooltip title="Add Commission Payment">
                    <button
                        onClick={() => {
                            setShowCommissionModal(true);
                            setCommissionForm({
                                agent_id: "",
                                pay_date: new Date().toISOString().split("T")[0],
                                commissionCalculationFromDate: firstDayOfMonth.toISOString().split("T")[0],
                                commissionCalculationToDate: today.toISOString().split("T")[0],
                                amount: "",
                                pay_type: "cash",
                                transaction_id: "",
                                note: "",
                                admin_type: adminId,
                                pay_for: paymentFor
                            });
                            setErrors({});
                        }}
                        className="bg-blue-900 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition duration-200 flex items-center"
                    >
                        <span className="mr-2">+</span> Commission Payment
                    </button>
                </Tooltip>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                Commission Payments
              </h2>

              {commissionPayments.length > 0 ? (
                <DataTable
                  data={commissionPayments}
                  columns={commissionColumns}
                  exportedFileName={`Commission_Payments_${
                    new Date().toISOString().split("T")[0]
                  }.csv`}
                />
              ) : (
                <div className="mt-10 text-center text-gray-500">
                  <CircularLoader
                    isLoading={isLoading}
                    data="Commission Payments"
                    failure={commissionPayments.length === 0}
                  />
                </div>
              )}
            </div>
          </div>

          <Modal
            isVisible={showCommissionModal}
            onClose={() => setShowCommissionModal(false)}
            width="max-w-md"
          >
            <div className="py-6 px-5 lg:px-8 text-left">
              <h3 className="mb-4 text-xl font-bold text-gray-900 border-b pb-2">
                Add Commission Payment
              </h3>

              <form className="space-y-4" onSubmit={handleCommissionSubmit}>
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Agent <span className="text-red-500">*</span>
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
                    value={commissionForm.agent_id || undefined}
                    onChange={(value) =>{
                      setErrors(prev=>({...prev,agent_id:""}));
                      setCommissionForm((prev) => ({
                        ...prev,
                        agent_id: value,
                      }));
  
                      calculateTotalPayableCommission(value, commissionForm.commissionCalculationFromDate, commissionForm.commissionCalculationToDate);
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

            
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="w-full sm:w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                            Commission From Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="commissionCalculationFromDate"
                            value={commissionForm.commissionCalculationFromDate}
                            onChange={handleCommissionChange} 
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                        {errors.commissionCalculationFromDate && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.commissionCalculationFromDate}
                            </p>
                        )}
                    </div>
                    <div className="w-full sm:w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                            Commission To Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="commissionCalculationToDate"
                            value={commissionForm.commissionCalculationToDate}
                            onChange={handleCommissionChange} 
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                        {errors.commissionCalculationToDate && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.commissionCalculationToDate}
                            </p>
                        )}
                    </div>
                </div>
               
                <div className="flex justify-end pt-2">
                    <button
                        type="button" 
                        onClick={() => calculateTotalPayableCommission(
                            commissionForm.agent_id,
                            commissionForm.commissionCalculationFromDate,
                            commissionForm.commissionCalculationToDate
                        )}
                        disabled={!commissionForm.agent_id || !commissionForm.commissionCalculationFromDate || !commissionForm.commissionCalculationToDate || isLoadingCommissionCalculation}
                        className="px-2 py-2 bg-green-700 text-white rounded-lg shadow-md hover:bg-green-800 transition duration-200"
                    >
                        {isLoadingCommissionCalculation ? "Calculating..." : "Calculate Amount"}
                    </button>
                </div>


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

                {/* Amount */}
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="amount"
                      value={commissionForm.amount}
                      onChange={handleCommissionChange}
                      placeholder="Enter amount"
                      className="w-full p-3 border border-gray-300 rounded-lg pr-10" // Added padding for loader
                      readOnly // Make it read-only as it's auto-populated
                    />
                    {/* Loader for commission calculation*/}
                    {isLoadingCommissionCalculation && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                  )}
                </div>

                {/* Payment Mode */}
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

                {/* Transaction ID (conditionally shown) */}
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

                {/* Disbursed By */}
                <div className="w-full bg-blue-50 p-3 rounded-lg">
                  <label className="block mb-1 text-sm font-medium text-gray-900">
                    Disbursed By
                  </label>
                  <div className="font-semibold">{adminName}</div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCommissionModal(false)}
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

export default PayOutCommission;