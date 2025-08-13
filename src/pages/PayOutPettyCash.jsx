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

const PayOutPettyCash = () => {
  const paymentFor = "petty_cash";
  const [api, contextHolder] = notification.useNotification();
  const [showPettyCashModal, setShowPettyCashModal] = useState(false);
  const [modifyPayment, setModifyPayment] = useState(false);
  const [adminId, setAdminId] = useState("");

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    noReload: false,
    type: "info",
  });
  const expenseCategories = [
    { key: "$1", title: "Chit Operations" },
    { key: "$2", title: "Staff & Administration" },
    { key: "$3", title: "Communication & Technology" },
    { key: "$4", title: "Legal & Compliance" },
    { key: "$5", title: "Marketing & Promotion" },
    { key: "$6", title: "Travel & Conveyance" },
    { key: "$7", title: "Training & Development" },
    { key: "$8", title: "Maintenance & Repairs" },
    { key: "$9", title: "Banking & Financial Charges" },
    { key: "$10", title: "Utilities & Bills" },
    { key: "$11", title: "Insurance" },
    { key: "$12", title: "Data & Security" },
    { key: "$13", title: "Customer Service & Support" },
    { key: "$14", title: "Depreciation & Assets" },
    { key: "$15", title: "Miscellaneous / Other Expenses" },
  ];

  const [pettyCashPayments, setPettyCashPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [errors, setErrors] = useState({});
  const [agents ,setAgents] = useState([]);
  const [reRender, setReRender] = useState(0);
  const [pettyCashForm, setPettyCashForm] = useState({
    category: "",
    pay_date: new Date().toISOString().split("T")[0],
    amount: "",
    pay_type: "cash",
    transaction_id: "",
    note: "",
    pay_for: paymentFor,
    admin_type: "",
    expense_description: "",
    agent_id:""
  });

  // Fetch petty cash payments
  const fetchPettyCashPayments = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/payment-out/get-petty-cash-payments");
      const responseData = response.data.map((payment, index) => ({
        id: index + 1,
        _id: payment._id,
        category: payment.category,
        expense_description: payment.expense_description,
        pay_date: payment.pay_date,
        amount: payment.amount,
        pay_type: payment.pay_type,
        transaction_id: payment.transaction_id,
        note: payment.note,
        disbursed_by: payment.admin_type?.name,
        receipt_no: payment.receipt_no,
        agent:payment.agent_id?.name,
      }));
      setPettyCashPayments(responseData);
    } catch (error) {
      console.error("Failed to fetch Petty Cash payments", error);
      setPettyCashPayments([]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
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
  fetchAgents();
  }, []);
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

    fetchPettyCashPayments();
  }, [reRender]);

  const handlePettyCashChange = (e) => {
    const { name, value } = e.target;
    setPettyCashForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!pettyCashForm.category) {
      newErrors.category = "Please select a category";
    }

    if (!pettyCashForm.amount || isNaN(pettyCashForm.amount)) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (pettyCashForm.pay_type === "online" && !pettyCashForm.transaction_id) {
      newErrors.transaction_id =
        "Transaction ID is required for online payments";
    }

    if (!pettyCashForm.expense_description) {
      newErrors.expense_description = "Please enter expense description";
    }
    if(!pettyCashForm.agent_id){
      newErrors.agent = "Please select staff name";

    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePettyCashSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();

    if (isValid) {
      try {
        setIsLoading(true);
        const payload = {
          ...pettyCashForm,
          admin_type: adminId,
        };
        await API.post("/payment-out/add-petty-cash-payment", payload);
        api.open({
          message: "Petty Cash Payment Successful",
          description: "The petty cash payment has been recorded successfully.",
          className: "bg-green-500 rounded-lg font-semibold text-white",
          showProgress: true,
          pauseOnHover: false,
        });

        setShowPettyCashModal(false);
        setPettyCashForm({
          category: "",
          pay_date: new Date().toISOString().split("T")[0],
          amount: "",
          pay_type: "cash",
          transaction_id: "",
          note: "",
          admin_type: adminId,
          pay_for: paymentFor,
          expense_description: "",
          agent_id:""
        });
        setReRender((val) => val + 1);
      } catch (error) {
        const message = error.response?.data?.message || "Something went wrong";
        api.open({
          message: "Petty Cash Payment Failed",
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

  const pettyCashColumns = [
    { key: "id", header: "SL. NO" },
    { key: "pay_date", header: "Payment Date" },
    { key: "category", header: "Category" },
    { key: "expense_description", header: "Description" },
    { key: "amount", header: "Amount (₹)" },
    { key: "pay_type", header: "Payment Mode" },
    { key: "receipt_no", header: "Receipt No" },
    { key: "agent", header: "Staff" },
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
                  PETTY CASH
                </span>
                {"  "}
                Management
              </h1>

              <Tooltip title="Record Petty Cash Expense">
                <button
                  onClick={() => setShowPettyCashModal(true)}
                  className="ml-4 bg-blue-900 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition duration-200 flex items-center"
                >
                  <span className="mr-2">+</span> New Expense
                </button>
              </Tooltip>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                Petty Cash Transactions
              </h2>

              {pettyCashPayments.length > 0 ? (
                <DataTable
                  data={pettyCashPayments}
                  columns={pettyCashColumns}
                  exportedPdfName="PayOut Petty Cash"
                  exportedFileName={`petty_cash_transactions_${
                    new Date().toISOString().split("T")[0]
                  }.csv`}
                />
              ) : (
                <div className="mt-10 text-center text-gray-500">
                  <CircularLoader
                    isLoading={isLoading}
                    data="Petty Cash Transactions"
                    failure={pettyCashPayments.length === 0}
                  />
                </div>
              )}
            </div>
          </div>

          <Modal
            isVisible={showPettyCashModal}
            onClose={() => setShowPettyCashModal(false)}
            width="max-w-md"
          >
            <div className="py-6 px-5 lg:px-8 text-left">
              <h3 className="mb-4 text-xl font-bold text-gray-900 border-b pb-2">
                Record Petty Cash Expense
              </h3>

              <form className="space-y-4" onSubmit={handlePettyCashSubmit}>
                {/* Expense Category */}
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Expense Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    className="w-full h-12"
                    placeholder="Select Category"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={pettyCashForm.category || undefined}
                    onChange={(value) =>{
                      setErrors(prev=>({...prev,category:""}))
                      setPettyCashForm((prev) => ({ ...prev, category: value }))}
                    }
                  >
                    {expenseCategories.map((category) => (
                      <Select.Option key={category.key} value={category.title}>
                        {category.title}
                      </Select.Option>
                    ))}
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Expense Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="expense_description"
                    value={pettyCashForm.expense_description}
                    onChange={handlePettyCashChange}
                    placeholder="Enter description"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {errors.expense_description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.expense_description}
                    </p>
                  )}
                </div>

             
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="pay_date"
                    value={pettyCashForm.pay_date}
                    onChange={handlePettyCashChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    disabled={!modifyPayment}
                  />
                </div>

                
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={pettyCashForm.amount}
                    onChange={handlePettyCashChange}
                    placeholder="Enter amount"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                  )}
                </div>

              
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Payment Mode
                  </label>
                  <select
                    name="pay_type"
                    value={pettyCashForm.pay_type}
                    onChange={handlePettyCashChange}
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

                
                {pettyCashForm.pay_type === "online" && (
                  <div className="w-full">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="transaction_id"
                      value={pettyCashForm.transaction_id}
                      onChange={handlePettyCashChange}
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
                    value={pettyCashForm.note}
                    onChange={handlePettyCashChange}
                    placeholder="Additional details"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows="2"
                  />
                </div>
                   <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                   Staff <span className="text-red-500">*</span>
                  </label>
                  <Select
                    className="w-full h-12"
                    placeholder="Select Staff"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={pettyCashForm.agent_id || undefined}
                    onChange={(value) =>{
                      setErrors(prev=>({...prev,agent:""}))
                      setPettyCashForm((prev) => ({ ...prev, agent_id: value }))}
                    }
                  >
                    {agents.map((agent) => (
                      <Select.Option key={agent.key} value={agent._id}>
                        {agent.name}
                      </Select.Option>
                    ))}
                  </Select>
                  {errors.agent && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.agent}
                    </p>
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
                    onClick={() => setShowPettyCashModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isLoading ? "Processing..." : "Save Expense"}
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

export default PayOutPettyCash;
