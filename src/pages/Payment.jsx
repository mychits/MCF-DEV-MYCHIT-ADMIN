/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import CircularLoader from "../components/loaders/CircularLoader";
import { FaWhatsappSquare } from "react-icons/fa";
import Navbar from "../components/layouts/Navbar";
import { Select, Dropdown, Modal as AntModal, Drawer, Tooltip } from "antd";
import { IoMdMore } from "react-icons/io";
import { Link } from "react-router-dom";
import BackdropBlurLoader from "../components/loaders/BackdropBlurLoader";
import { FaReceipt } from "react-icons/fa";
import { numberToIndianWords } from "../helpers/numberToIndianWords";
const Payment = () => {
  const [users, setUsers] = useState([]);
  const [actualGroups, setActualGroups] = useState([]);
  const [TablePayments, setTablePayments] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [viewLoader, setViewLoader] = useState(false);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [showModalView, setShowModalView] = useState(false);
  const [currentViewGroup, setCurrentViewGroup] = useState(null);
  const [whatsappEnable, setWhatsappEnable] = useState(true);
  const [paymentMode, setPaymentMode] = useState("cash");
  const today = new Date().toISOString().split("T")[0];
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [borrowers, setBorrowers] = useState([]);
  const [pigmeCustomers, setPigmeCustomers] = useState([]);
  const [paymentGroupTickets, setPaymentGroupTickets] = useState([]);
  const [openBackdropLoader, setOpenBackdropLoader] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [openAntDDrawer, setOpenAntDDrawer] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [lastThreePayments, setLastThreePayments] = useState([]);

  const dropDownItems = (paymentObject) => {
    const dropDownItemList = [
      {
        key: "1",
        label: (
          <Link to={`/print/${paymentObject?._id}`} className="text-blue-600 ">
            Print
          </Link>
        ),
      },

      {
        key: "3",
        label: (
          <div
            className="text-green-600 "
            onClick={() => handleViewModalOpen(paymentObject?._id)}
          >
            View
          </div>
        ),
      },
    ];

    return dropDownItemList;
  };
  const onGlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    noReload: false,
    type: "info",
  });

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    user_id: "",
    receipt_no: "",
    pay_date: today,
    amount: "",
    pay_type: "cash",
    transaction_id: "",
    payment_group_tickets: [],
    account_type: "",
    cheque_number: "",
    cheque_date: "",
    cheque_bank_name: "",
    cheque_bank_branch: "",
    collection_time: "",
  });

  const [modifyPayment, setModifyPayment] = useState(false);
  const [modifyMinMaxPaymentDate, setModifyMinMaxPaymentDate] = useState(false);
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    const user = localStorage.getItem("user");
    const userObj = JSON.parse(user);

    if (userObj) {
      const adminAccessPermissions =
        userObj.admin_access_right_id?.access_permissions;

      if (adminAccessPermissions?.edit_payment === "true") {
        setModifyPayment(true);
      }

      if (adminAccessPermissions?.edit_limited_payment === "true") {
        setModifyPayment(true);
        setModifyMinMaxPaymentDate(true);
      }
    }
  }, []);

  const fetchLastThreeTransactions = async (event) => {
    event.preventDefault();
    setOpenAntDDrawer(true);
    if (formData.user_id && formData.payment_group_tickets) {
      try {
        setShowLoader(true);
        const response = await api.get("payment/get-last-n-transaction", {
          params: {
            user_id: formData.user_id,
            payment_group_tickets: paymentGroupTickets,
            limit: 3,
          },
        });
        if (response?.data) {
          setLastThreePayments(response.data);
        } else {
          setLastThreePayments([]);
        }
      } catch (error) {
        setLastThreePayments([]);
      } finally {
        setShowLoader(false);
      }
    }
  };

  useEffect(() => {
    setBorrowers([]);
    const fetchCustomerLoanDetails = async () => {
      try {
        const response = await api.get(
          `/loans/get-borrower-by-user-id/${selectedUserId}`
        );
        if (response.status >= 400)
          throw new Error("fetching loan borrowers Failed");
        setBorrowers(response.data);
      } catch (err) {
        setBorrowers([]);
        console.log("Error Occurred");
      }
    };

    fetchCustomerLoanDetails();
  }, [selectedUserId]);

  useEffect(() => {
    setPigmeCustomers([]);
    const fetchCustomerLoanDetails = async () => {
      try {
        const response = await api.get(
          `/pigme/get-pigme-customer-by-user-id/${selectedUserId}`
        );
        if (response.status >= 400)
          throw new Error("fetching pigme customers Failed");
        setPigmeCustomers(response.data);
      } catch (err) {
        setPigmeCustomers([]);
        console.log(
          "Error Occurred while fetching pigme customers,",
          err.message
        );
      }
    };

    fetchCustomerLoanDetails();
  }, [selectedUserId]);

  useEffect(() => {
    const fetchAllCustomers = async () => {
      try {
        const response = await api.get("user/get-user");
        setUsers(response?.data);
      } catch (error) {
        setUsers([]);
        console.error("Error fetching group data:", error);
      }
    };
    fetchAllCustomers();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/group/get-group-admin");
        setActualGroups(response.data);
      } catch (error) {
        setActualGroups([]);
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedUserId) {
      newErrors.customer = "Please select a customer";
    }

    if (!formData.payment_group_tickets) {
      newErrors.payment_group_tickets = "Please select a group and ticket";
    }

    if (!formData.pay_date) {
      newErrors.pay_date = "Payment date is required";
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = "Please enter a valid positive amount";
    }

    if (paymentMode === "online" && !formData.transaction_id?.trim()) {
      newErrors.transaction_id =
        "Transaction ID is required for online payments";
    }

    if (paymentMode === "cheque" && !formData.cheque_date?.trim()) {
      newErrors.cheque_date = "Cheque Date is required for cheque payments";
    }
    if (paymentMode === "cheque" && !formData.cheque_number?.trim()) {
      newErrors.cheque_number = "Cheque Number is required for cheque payments";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "amount") {
    // Allow digits & ONLY one dot
    let cleaned = value.replace(/[^0-9.]/g, "");

    const dotCount = (cleaned.match(/\./g) || []).length;
    if (dotCount > 1) return;

    setFormData((prev) => ({
      ...prev,
      [name]: cleaned,
    }));

    return;
  }

  // Other fields
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


  const handlePaymentAntSelect = (values) => {
    setPaymentGroupTickets(values);
  };



  
const formatIndianNumber = (value) => {
  if (!value) return "";

  value = value.toString().replace(/[^0-9.]/g, "");

  const parts = value.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1] ? parts[1].slice(0, 2) : "";

  let lastThree = integerPart.slice(-3);
  let otherNumbers = integerPart.slice(0, -3);

  let formattedInt = otherNumbers
    ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
    : lastThree;

  return decimalPart ? `${formattedInt}.${decimalPart}` : formattedInt;
};

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "date", header: "Paid Date" },
    { key: "transaction_date", header: "Transaction Date" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "group_name", header: "Group Name" },
    { key: "ticket", header: "Ticket Number" },
    { key: "old_receipt", header: "Old Receipt" },
    { key: "receipt", header: "Receipt" },
    { key: "amount", header: "Amount" },
    { key: "pay_type", header: "Payment Type" },
    { key: "collection_time", header: "Collection Time" },
    { key: "collected_by", header: "Collected By" },
    { key: "action", header: "Action" },
  ];

  const handleCustomer = async (userId) => {
    setFilteredUsers([]);
    setFilteredEnrollments([]);
    setSelectedUserId(userId);
    setFormData((prevFormData) => ({
      ...prevFormData,
      user_id: userId,
    }));
    setErrors((prevData) => ({ ...prevData, customer: "" }));
    setPaymentGroupTickets([]);
    handleGroupAuctionChange(userId);
  };

  const handleGroupPayment = async (groupId) => {
    if (groupId) {
      let url = `/payment/get-payments-by-dates?from_date=${today}&to_date=${today}`;
      try {
        setIsLoading(true);
        const response = await api.get(url);

        if (response.data && response.data.length > 0) {
          const formattedData = response.data.map((group, index) => {
            if (!group?.group_id?.group_name) return {};
            return {
              _id: group._id,
              id: index + 1,
              name: group?.user_id?.full_name,
              phone_number: group?.user_id?.phone_number,
              group_name: group?.group_id?.group_name,
              ticket: group.ticket,
              receipt: group.receipt_no,
              old_receipt: group.old_receipt_no,
              amount: group.amount,
              pay_type: group?.pay_type,
              date: group?.pay_date.split("T")[0],
              transaction_date: group?.createdAt?.split("T")[0],
              collected_by:
                group?.collected_by?.name ||
                group?.admin_type?.admin_name ||
                "Super Admin",
              action: (
                <div className="flex justify-center gap-2">
                  <Dropdown
                    trigger={["click"]}
                    menu={{
                      items: dropDownItems(group),
                    }}
                    placement="bottomLeft"
                  >
                    <IoMdMore className="text-bold" />
                  </Dropdown>
                </div>
              ),
            };
          });
          setTablePayments(formattedData);
        }
      } catch (error) {
        setTablePayments([]);
        console.error("Error fetching payment data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePaymentModeChange = (e) => {
    const selectedMode = e.target.value;
    setPaymentMode(selectedMode);
    setFormData((prevData) => ({
      ...prevData,
      pay_type: selectedMode,

      transaction_id:
        selectedMode === "online" || selectedMode === "online/upi"
          ? prevData.transaction_id
          : "",
    }));
  };

  const handleAccountTypeChange = (e) => {
    const selectedMode = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      account_type: selectedMode,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    try {
      if (isValid) {
        setAlertConfig((prev) => ({
          ...prev,
          visibility: false,
        }));
        setShowModal(false);

        const usr = localStorage.getItem("user");
        let admin_type = null;
        try {
          if (usr) {
            admin_type = JSON.parse(usr);
          }
        } catch (e) {
          console.error("Failed to parse user from localStorage:", e);
        }

        formData.payment_group_tickets = paymentGroupTickets;
        formData.admin_type = admin_type?._id;
        setOpenBackdropLoader(true);
        await api.post("/payment/add-payments", formData);

        setSelectedUserId("");
        setPaymentGroupTickets([]);

        setFormData({
          user_id: "",
          receipt_no: "",
          pay_date: today,
          amount: "",
          pay_type: "cash",
          transaction_id: "",
          payment_group_tickets: [],
          account_type: "",
          cheque_number: "",
          cheque_date: "",
          cheque_bank_name: "",
          cheque_bank_branch: "",
        });
        setAlertConfig({
          visibility: true,
          noReload: true,
          message: "Payment Added Successfully",
          type: "success",
        });
      }
    } catch (error) {
      setShowModal(false);
      setSelectedUserId("");
      setFormData({
        user_id: "",
        receipt_no: "",
        pay_date: "",
        amount: "",
        pay_type: "cash",
        transaction_id: "",
        payment_group_tickets: [],
        account_type: "",
      });
      setAlertConfig({
        visibility: true,
        noReload: true,
        message: `Error submitting payment data`,
        type: "error",
      });

      console.error("Error submitting payment data:", error);
    } finally {
      setOpenBackdropLoader(false);
    }
  };

  const handleViewModalOpen = async (paymentId) => {
    try {
      setLoading(true);
      setShowModalView(true);
      setCurrentGroupId(paymentId);
      setViewLoader(true);
      const response = await api.get(`/payment/get-payment-by-id/${paymentId}`);
      setCurrentViewGroup(response.data);
    } catch (error) {
      console.error("Error viewing Payment:", error);
    } finally {
      setLoading(false);
      setViewLoader(false);
    }
  };

  const handleGroupAuctionChange = async (groupId) => {
    if (groupId) {
      try {
        const response = await api.post(
          `/enroll/get-user-tickets-report/${groupId}`
        );
        if (response.data && response.data.length > 0) {
          const validEnrollments = response.data.filter(
            (auction) => auction.enrollment && auction.enrollment.group
          );
          setFilteredEnrollments(validEnrollments);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        setFilteredEnrollments([]);
      }
    }
  };

  return (
    <>
      {openBackdropLoader ? (
        <BackdropBlurLoader title={"payment Data processing...."} />
      ) : (
        <div>
          <div className="flex mt-20">
            <Navbar
              onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
              visibility={true}
            />
            <Sidebar />
            <CustomAlert
              type={alertConfig.type}
              isVisible={alertConfig.visibility}
              message={alertConfig.message}
              noReload={alertConfig.noReload}
            />
            <div className="flex-grow p-7">
              <h1 className="text-2xl font-semibold">Payments</h1>
              <div className="mt-6  mb-8">
                <div className="mb-10">
                  <label className="font-bold">Search or Select Group</label>
                  <div className="flex justify-between items-center w-full">
                    <Select
                      placeholder="Select Group"
                      popupMatchSelectWidth={false}
                      showSearch
                      className="w-full  h-14 max-w-md"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={selectedGroupId || undefined}
                      onChange={handleGroupPayment}
                    >
                      {actualGroups.map((group) => (
                        <Select.Option key={group._id} value={group._id}>
                          {group.group_name}
                        </Select.Option>
                      ))}
                    </Select>
                    <div>
                      <button
                        onClick={() => setShowModal(true)}
                        className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                      >
                        + Add Payment
                      </button>
                    </div>
                  </div>
                </div>

                {TablePayments && TablePayments.length > 0 ? (
                  <DataTable
                    data={TablePayments.filter((item) =>
                      Object.values(item).some((value) =>
                        String(value)
                          .toLowerCase()
                          .includes(searchText.toLowerCase())
                      )
                    )}
                    columns={columns}
                    exportedPdfName="Payments"
                    printHeaderKeys={["Group Name"]}
                    printHeaderValues={["Today's"]}
                    exportedFileName={`Payments.csv`}
                  />
                ) : (
                  <div className="mt-10 text-center text-gray-500">
                    <CircularLoader
                      isLoading={isLoading}
                      data="Payments Data"
                      failure={TablePayments.length <= 0}
                    />
                  </div>
                )}
              </div>
            </div>

            <Drawer
              open={showModal}
              onClose={() => {
                setSelectedUserId("");
                setShowModal(false);
                setErrors({});
                setPaymentGroupTickets([]);
              }}
              width={"50%"}
              className="payment-drawer"
              extra={
                <Tooltip title="Last 3 Transactions">
                  <button
                    onClick={fetchLastThreeTransactions}
                    value="Last Three transaction"
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow-md transition-all duration-200 font-medium"
                  >
                    <FaReceipt className="text-lg" />
                    <span>Last 3 Transactions</span>
                  </button>
                </Tooltip>
              }
            >
              <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="mb-6 text-2xl font-bold text-gray-900 border-b pb-3">
                      Add Payment
                    </h3>
                    <form
                      className="space-y-6"
                      onSubmit={handleSubmit}
                      noValidate
                    >
                      <div className="form-group">
                        <label
                          className="block mb-2 text-sm font-medium text-gray-900"
                          htmlFor="category"
                        >
                          Customer <span className="text-red-500">*</span>
                        </label>
                        <Select
                          className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full h-12`}
                          placeholder="Select Or Search Customer"
                          popupMatchSelectWidth={false}
                          showSearch
                          filterOption={(input, option) =>
                            option.children
                              .toString()
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={selectedUserId || undefined}
                          onChange={handleCustomer}
                        >
                          {users.map((group) => (
                            <Select.Option key={group._id} value={group._id}>
                              {`${group.full_name} | ${group.phone_number}`}
                            </Select.Option>
                          ))}
                        </Select>
                        {errors.customer && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.customer}
                          </p>
                        )}
                      </div>

                      <div
                        className={`form-group ${
                          enrollmentLoading ? "cursor-progress" : ""
                        }`}
                      >
                        <label
                          className="block mb-2 text-sm font-medium text-gray-900"
                          htmlFor="category"
                        >
                          Group & Ticket <span className="text-red-500">*</span>
                        </label>
                        <Select
                          disabled={enrollmentLoading}
                          mode="multiple"
                          name="group_id"
                          placeholder="Select Group | Ticket"
                          onChange={handlePaymentAntSelect}
                          loading={enrollmentLoading}
                          value={paymentGroupTickets}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        >
                          {filteredEnrollments.map((entry, index) => {
                            const groupName =
                              entry?.enrollment?.group?.group_name ||
                              "Unnamed Group";
                            const groupId =
                              entry?.enrollment?.group?._id ||
                              `missing-${index}`;
                            const ticket =
                              entry?.enrollment?.tickets || "Unknown";

                            return (
                              <Select.Option
                                key={`chit-${groupId}|${ticket}`}
                                value={`chit-${groupId}|${ticket}`}
                              >
                                {groupName} | {ticket}
                              </Select.Option>
                            );
                          })}
                          {pigmeCustomers?.map((pigme) => {
                            return (
                              <Select.Option value={`pigme-${pigme._id}`}>
                                {`${pigme.pigme_id} | ₹ ${pigme.payable_amount}`}
                              </Select.Option>
                            );
                          })}
                          {borrowers?.map((borrower) => {
                            return (
                              <Select.Option value={`loan-${borrower._id}`}>
                                {`loan-${borrower.loan_id} | ₹ ${borrower.loan_amount}`}
                              </Select.Option>
                            );
                          })}
                        </Select>
                        {errors.payment_group_tickets && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.payment_group_tickets}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold mb-4 text-gray-800">
                          Payment Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                              className="block mb-2 text-sm font-medium text-gray-900"
                              htmlFor="group_install"
                            >
                              Payment Date
                            </label>
                            <input
                              disabled={!modifyPayment}
                              type="date"
                              name="pay_date"
                              min={
                                modifyMinMaxPaymentDate ? yesterday : undefined
                              }
                              max={modifyMinMaxPaymentDate ? today : undefined}
                              value={formData.pay_date}
                              id="pay_date"
                              onChange={handleChange}
                              placeholder=""
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                            />
                            {errors.pay_date && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.pay_date}
                              </p>
                            )}
                          </div>

                          <div>
                            <div>
                              <label
                                className="block mb-2 text-sm font-medium text-gray-900"
                                htmlFor="group_value"
                              >
                                Amount <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="amount"
                                value={formatIndianNumber(formData.amount)}
                                id="amount"
                                onChange={handleChange}
                                placeholder="Enter Amount"
                                required
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                              />
                              {errors.amount && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.amount}
                                </p>
                              )}
                            </div>
                            <div className="text-blue-900">{numberToIndianWords(formData.amount)}</div>
                          </div>

                          <div>
                            <label
                              className="block mb-2 text-sm font-medium text-gray-900"
                              htmlFor="pay_mode"
                            >
                              Payment Mode
                            </label>
                            <select
                              name="pay_mode"
                              id="pay_mode"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                              onChange={handlePaymentModeChange}
                            >
                              <option value="cash">Cash</option>
                              <option value="online">Online</option>
                              <option value="online/upi">Online/UPI</option>
                              <option value="cheque">Cheque</option>
                            </select>
                          </div>

                          {modifyPayment && (
                            <div>
                              <label
                                className="block mb-2 text-sm font-medium text-gray-900"
                                htmlFor="account_type"
                              >
                                Account Type
                              </label>
                              <select
                                name="account_type"
                                id="account_type"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                                onChange={handleAccountTypeChange}
                              >
                                <option value="">Select Account Type</option>
                                <option value="suspense">Suspense</option>
                              </select>
                            </div>
                          )}
                        </div>

                        {formData.amount && paymentGroupTickets.length > 1 && (
                          <div>
                            <div className="mt-4">
                              <label
                                className="block mb-2 text-sm font-medium text-gray-900"
                                htmlFor="individual_amount"
                              >
                                Individual Ticket Amount
                              </label>
                              <input
                                type="text"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg hover:cursor-not-allowed w-full p-2.5"
                                placeholder="Individual Amount"
                                value={formatIndianNumber(
                                  Number(formData.amount) /
                                    paymentGroupTickets.length
                                )}
                                disabled
                              />
                            </div>
                            <div className="text-blue-900">
                              {numberToIndianWords(
                                Number(formData.amount) /
                                  paymentGroupTickets.length
                              )}
                            </div>
                          </div>
                        )}

                        {(paymentMode === "online" ||
                          paymentMode === "online/upi") && (
                          <div className="mt-4">
                            <label
                              className="block mb-2 text-sm font-medium text-gray-900"
                              htmlFor="transaction_id"
                            >
                              Transaction ID{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="transaction_id"
                              id="transaction_id"
                              value={formData.transaction_id}
                              onChange={handleChange}
                              placeholder="Enter Transaction ID"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                            />
                            {errors.transaction_id && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.transaction_id}
                              </p>
                            )}
                          </div>
                        )}

                        {paymentMode === "cheque" && (
                          <div className="mt-4 space-y-4">
                            <h5 className="text-md font-semibold text-gray-800">
                              Cheque Details
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label
                                  className="block mb-2 text-sm font-medium text-gray-900"
                                  htmlFor="cheque_number"
                                >
                                  Cheque Number{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="cheque_number"
                                  id="cheque_number"
                                  value={formData.cheque_number}
                                  onChange={handleChange}
                                  placeholder="Enter Cheque Number"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                                />
                                {errors.cheque_number && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors.cheque_number}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label
                                  className="block mb-2 text-sm font-medium text-gray-900"
                                  htmlFor="cheque_date"
                                >
                                  Cheque Date{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="date"
                                  name="cheque_date"
                                  id="cheque_date"
                                  value={formData.cheque_date.split("T")[0]}
                                  onChange={handleChange}
                                  placeholder="Enter Cheque Date"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                                />
                                {errors.cheque_date && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors.cheque_date}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label
                                  className="block mb-2 text-sm font-medium text-gray-900"
                                  htmlFor="cheque_bank_name"
                                >
                                  Bank Name
                                </label>
                                <input
                                  type="text"
                                  name="cheque_bank_name"
                                  id="cheque_bank_name"
                                  value={formData.cheque_bank_name}
                                  onChange={handleChange}
                                  placeholder="Enter Bank Name"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                                />
                              </div>

                              <div>
                                <label
                                  className="block mb-2 text-sm font-medium text-gray-900"
                                  htmlFor="cheque_bank_branch"
                                >
                                  Bank Branch
                                </label>
                                <input
                                  type="text"
                                  name="cheque_bank_branch"
                                  id="cheque_bank_branch"
                                  value={formData.cheque_bank_branch}
                                  onChange={handleChange}
                                  placeholder="Enter Bank Branch"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FaWhatsappSquare
                              color="green"
                              className="w-8 h-8"
                            />
                            <h2 className="text-md font-semibold text-gray-800">
                              WhatsApp Notification
                            </h2>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={whatsappEnable}
                              className="text-green-500 checked:ring-2 checked:ring-green-700 rounded-full w-4 h-4"
                            />
                            <span className="text-gray-700 text-sm">
                              Send Via WhatsApp
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm px-6 py-3 shadow-sm transition-all"
                        >
                          Save Payment
                        </button>
                      </div>
                    </form>
                  </div>

                  <Drawer
                    closable
                    destroyOnHidden
                    title={
                      <p className="text-lg font-semibold">
                        Last Three Transactions
                      </p>
                    }
                    placement="right"
                    open={openAntDDrawer}
                    loading={showLoader}
                    onClose={() => setOpenAntDDrawer(false)}
                    width={400}
                  >
                    {lastThreePayments?.length <= 0 ? (
                      <div className="font-semibold text-center text-xl py-8">
                        No Transaction Found
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {lastThreePayments.map((payment, index) => {
                          return (
                            <section
                              key={index}
                              className="bg-white shadow-md rounded-lg p-4 space-y-2 border border-gray-200"
                            >
                              <div className="text-gray-800 font-semibold">
                                Payment Date:{" "}
                                <span className="font-bold">
                                  {payment?.pay_date}
                                </span>
                              </div>

                              {payment.group_id && (
                                <div className="text-gray-800 font-semibold">
                                  Group:{" "}
                                  <span className="font-bold">
                                    {payment.group_id?.group_name}
                                  </span>
                                </div>
                              )}
                              {payment.ticket && (
                                <div className="text-gray-800 font-semibold">
                                  Ticket:{" "}
                                  <span className="font-normal">
                                    {payment?.ticket}
                                  </span>
                                </div>
                              )}
                              <div className="text-gray-800 font-semibold">
                                Amount:{" "}
                                <span className="font-bold">
                                  ₹{payment?.amount}
                                </span>
                              </div>
                              <div className="text-gray-800 font-semibold">
                                Payment Type:{" "}
                                <span className="font-normal">
                                  {payment?.pay_type}
                                </span>
                              </div>
                              <div className="text-gray-800 font-semibold">
                                Name:{" "}
                                <span className="font-normal">
                                  {payment.user_id?.full_name}
                                </span>
                              </div>
                            </section>
                          );
                        })}
                      </div>
                    )}
                  </Drawer>
                </div>
              </div>
            </Drawer>

            <AntModal
              open={showModalView}
              onCancel={() => setShowModalView(false)}
              onClose={() => setShowModalView(false)}
              onOk={() => setShowModalView(false)}
              onReload={() => handleViewModalOpen(currentGroupId)}
              footer={<div></div>}
              loading={viewLoader}
            >
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Payment Details
              </h3>
              <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5">
                <div className="mb-3 flex gap-x-2">
                  <strong>Group: </strong>{" "}
                  {currentViewGroup?.group_id?.group_name}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Group Value:</strong>{" "}
                  {currentViewGroup?.group_id?.group_value}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Group Installment:</strong>{" "}
                  {currentViewGroup?.group_id?.group_install}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>User:</strong> {currentViewGroup?.user_id?.full_name}{" "}
                  | Ticket: {currentViewGroup?.ticket}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Bid Amount:</strong>{" "}
                  {currentViewGroup?.group_id?.group_value -
                  currentViewGroup?.win_amount
                    ? currentViewGroup?.group_id?.group_value -
                      currentViewGroup?.win_amount
                    : ""}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Commission:</strong> {currentViewGroup?.commission}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Winning Amount:</strong>{" "}
                  {currentViewGroup?.win_amount}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Divident:</strong> {currentViewGroup?.divident}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Divident per Head:</strong>{" "}
                  {currentViewGroup?.divident_head}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Next Payable:</strong> {currentViewGroup?.payable}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Auction Date:</strong>{" "}
                  {currentViewGroup?.auction_date}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Next Date:</strong> {currentViewGroup?.next_date}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Created At:</strong>{" "}
                  {currentViewGroup?.createdAt?.split("T")[0]}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Updated At:</strong>{" "}
                  {currentViewGroup?.updatedAt?.split("T")[0]}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Cheque Number:</strong>{" "}
                  {currentViewGroup?.cheque_number}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Cheque Date:</strong>{" "}
                  {currentViewGroup?.cheque_date?.split("T")[0]}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Cheque Bank Name:</strong>{" "}
                  {currentViewGroup?.cheque_bank_name}
                </div>
                <div className="mb-3 flex gap-x-2">
                  <strong>Cheque Bank Branch Name :</strong>{" "}
                  {currentViewGroup?.cheque_bank_branch}
                </div>
              </div>
            </AntModal>
          </div>
        </div>
      )}
    </>
  );
};

export default Payment;
