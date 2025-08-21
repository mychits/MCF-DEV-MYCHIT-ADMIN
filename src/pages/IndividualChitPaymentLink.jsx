/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import api from "../instance/TokenInstance";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import { Select, Dropdown, Modal as AntModal, Alert } from "antd";
import { IoMdMore } from "react-icons/io";
import { Link } from "react-router-dom";
import BackdropBlurLoader from "../components/loaders/BackdropBlurLoader";
import { fieldSize } from "../data/fieldSize";

const IndividualChitPaymentLink = () => {
  const [groups, setGroups] = useState([]);
  const [actualGroups, setActualGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [TablePayments, setTablePayments] = useState([]);
  const [selectedAuctionGroup, setSelectedAuctionGroup] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedAuctionGroupId, setSelectedAuctionGroupId] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [viewLoader, setViewLoader] = useState(false);
  const [filteredAuction, setFilteredAuction] = useState([]);
  const [groupInfo, setGroupInfo] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showModalView, setShowModalView] = useState(false);
  const [currentViewGroup, setCurrentViewGroup] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  
  // Calculate tomorrow correctly (current date + 1 day)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [borrowers, setBorrowers] = useState([]);
  const [pigmeCustomers, setPigmeCustomers] = useState([]);
  const [enableGroupColumn, setEnableGroupColumn] = useState(true);
  const [paymentGroupTickets, setPaymentGroupTickets] = useState([]);
  const [render, setRerender] = useState(0);
  const [openBackdropLoader, setOpenBackdropLoader] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  
  // Alert state for Ant Design Alert
  const [alert, setAlert] = useState({
    visible: false,
    message: "",
    type: "info"
  });

  const dropDownItems = (group) => {
    const dropDownItemList = [
      {
        key: "1",
        label: (
          <Link to={`/print/${group._id}`} className="text-blue-600 ">
            Print
          </Link>
        ),
      },
      {
        key: "3",
        label: (
          <div
            className="text-green-600"
            onClick={() => handleViewModalOpen(group._id)}
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
  
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    user_id: "",
    amount: "",
    payment_group_tickets: [],
    expiry: tomorrowFormatted, // Use the correctly calculated tomorrow
    send_sms: true,
    send_email: true,
  });

  useEffect(() => {
    const usr = localStorage.getItem("user");
    let admin_type = null;
    try {
      if (usr) {
        admin_type = JSON.parse(usr);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
    }

    const fetchTodaysPayments = async () => {
      try {
        setTablePayments([]);
        setIsLoading(true);
        const response = await api.get("/paymentapi/payment-link", {
          params: {
            from_date: today,
            to_date: today,
          },
        });
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
              amount: group.amount,
              payment_status: group.payment_status,
              transaction_date: formatPayDate(group.createdAt),
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
          setEnableGroupColumn(true);
        } else {
          setFilteredAuction([]);
        }
      } catch (error) {
        console.error("Error fetching payment Link data:", error);
        setFilteredAuction([]);
        // Show error alert
        setAlert({
          visible: true,
          message: "Failed to load payment data",
          type: "error"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodaysPayments();
  }, [render]);

  useEffect(() => {
    setBorrowers([]);
    const fetchCustomerLoanDetails = async () => {
      try {
        const response = await api.get(
          `/loans/get-borrower-by-user-id/${selectedGroupId}`
        );
        if (response.status >= 400)
          throw new Error("fetching loan borrowers Failed");
        setBorrowers(response.data);
      } catch (err) {
        console.log("Error Occurred");
      }
    };

    fetchCustomerLoanDetails();
  }, [selectedGroupId]);

  useEffect(() => {
    setPigmeCustomers([]);
    const fetchCustomerLoanDetails = async () => {
      try {
        const response = await api.get(
          `/pigme/get-pigme-customer-by-user-id/${selectedGroupId}`
        );
        if (response.status >= 400)
          throw new Error("fetching pigme customers Failed");
        setPigmeCustomers(response.data);
      } catch (err) {
        console.log(
          "Error Occurred while fetching pigme customers,",
          err.message
        );
      }
    };

    fetchCustomerLoanDetails();
  }, [selectedGroupId]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/user/get-user");
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/group/get-group-admin");
        setActualGroups(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedGroupId) {
      newErrors.customer = "Please select a customer";
    }

    if (!paymentGroupTickets || paymentGroupTickets.length === 0) {
      newErrors.payment_group_tickets = "Please select a group and ticket";
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = "Please enter a valid positive amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevData) => ({ ...prevData, [name]: "" }));
  };
  
  const handlePaymentAntSelect = (values) => {
    setPaymentGroupTickets(values);
  };

  const handleGroupChange = async (groupId) => {
    setSelectedGroup(groupId);

    if (groupId) {
      try {
        const response = await api.get(`/enroll/get-group-enroll/${groupId}`);
        if (response.data && response.data.length > 0) {
          setFilteredUsers(response.data);
        } else {
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        setFilteredUsers([]);
      }
    } else {
      setFilteredUsers([]);
    }
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "transaction_date", header: "Transaction Date" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
  ];
  if (enableGroupColumn) {
    columns.push({ key: "group_name", header: "Group Name" });
  }
  columns.push(
    { key: "ticket", header: "Ticket Number" },
    { key: "amount", header: "Amount" },
    { key: "payment_status", header: "Payment Status" },
    { key: "action", header: "Action" }
  );

  const handleCustomer = async (groupId) => {
    setSelectedGroupId(groupId);
    setFormData((prevFormData) => ({
      ...prevFormData,
      user_id: groupId,
    }));
    setErrors((prevData) => ({ ...prevData, customer: "" }));
    setPaymentGroupTickets([]);
    handleGroupChange(groupId);
    handleGroupAuctionChange(groupId);

    if (groupId) {
      try {
        const response = await api.get(`/group/get-by-id-group/${groupId}`);
        setGroupInfo(response.data || {});
      } catch (error) {
        setGroupInfo({});
      }
    } else {
      setGroupInfo({});
    }
  };
  
  const handleGroupPayment = async (groupId) => {
    setSelectedAuctionGroupId(groupId);
    handleGroupPaymentChange(groupId);
  };

  const formatPayDate = (dateString) => {
    return dateString?.split("T")[0];
  };

  const handleGroupPaymentChange = async (groupId) => {
    setSelectedAuctionGroup(groupId);
    if (groupId) {
      let url;
      if (groupId === "today") {
        url = `/paymentapi/payment-link/get-payments?from_date=${today}&to_date=${today}`;
        setEnableGroupColumn(true);
      } else {
        url = `/paymentapi/payment-link/${groupId}`;
        setEnableGroupColumn(false);
      }
      try {
        setTablePayments([]);
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
              amount: group.amount,
              transaction_date: group?.createdAt?.split("T")[0],
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
        } else {
          setFilteredAuction([]);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setFilteredAuction([]);
        // Show error alert
        setAlert({
          visible: true,
          message: "Failed to load payment data",
          type: "error"
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setFilteredAuction([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    try {
      if (isValid) {
        setDisabled(true);
        setAlert({ visible: false, message: "", type: "info" });
        setShowModal(false);
        let payload;
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
        const response = await api.post("/paymentapi/payment-link", formData);
        if (response.status === 201) {
          setSelectedGroupId("");
          setPaymentGroupTickets([]);
          setDisabled(false);
          setFormData({
            user_id: "",
            amount: "",
            payment_group_tickets: [],
            expiry: tomorrowFormatted, // Reset with correct tomorrow date
            send_sms: true,
            send_email: true,
          });
          setAlert({
            visible: true,
            message: "Payment Added Successfully",
            type: "success",
          });
        }

        if (response.status >= 400) {
          setShowModal(false);
          setSelectedGroupId("");
          setPaymentGroupTickets([]);
          setDisabled(false);
          setFormData({
            user_id: "",
            amount: "",
            payment_group_tickets: [],
            expiry: tomorrowFormatted, // Reset with correct tomorrow date
            send_sms: true,
            send_email: true,
          });
          setAlert({
            visible: true,
            message: "Payment Added Failed",
            type: "error",
          });
        }
      }
    } catch (error) {
      setShowModal(false);
      setSelectedGroupId("");
      setFormData({
        user_id: "",
        amount: "",
        payment_group_tickets: [],
        expiry: tomorrowFormatted, // Reset with correct tomorrow date
        send_sms: true,
        send_email: true,
      });
      setAlert({
        visible: true,
        message: `Error submitting payment data: ${error.message}`,
        type: "error",
      });
      setDisabled(false);
      console.error("Error submitting payment data:", error);
    } finally {
      setOpenBackdropLoader(false);
      setRerender((prev) => prev + 1);
    }
  };

  const handleViewModalOpen = async (groupId) => {
    try {
      setLoading(true);
      setShowModalView(true);
      setCurrentGroupId(groupId);
      setViewLoader(true);
      const response = await api.get(`/paymentapi/payment-link/${groupId}`);
      setCurrentViewGroup(response.data);
    } catch (error) {
      console.error("Error viewing Payment:", error);
      setAlert({
        visible: true,
        message: "Failed to load payment details",
        type: "error"
      });
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
          const validAuctions = response.data.filter(
            (auction) => auction.enrollment && auction.enrollment.group
          );
          setFilteredAuction(validAuctions);
        } else {
          setFilteredAuction([]);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        setFilteredAuction([]);
        // Show error alert
        setAlert({
          visible: true,
          message: "Failed to load group auction data",
          type: "error"
        });
      }
    } else {
      setFilteredAuction([]);
    }
  };
  
  const selectednewGroup = actualGroups.find(
    (g) => g._id === selectedAuctionGroupId
  );
  
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
            
            {/* Ant Design Alert */}
            {alert.visible && (
              <div className="fixed top-4 right-4 z-50 w-96">
                <Alert
                  message={alert.message}
                  type={alert.type}
                  showIcon
                  closable
                  onClose={() => setAlert({ ...alert, visible: false })}
                />
              </div>
            )}
            
            <div className="flex-grow p-7">
              <h1 className="text-2xl font-semibold">Payment Links</h1>
              <div className="mt-6  mb-8">
                <div className="mb-10">
                  <label className="font-bold">Search or Select Group</label>
                  <div className="flex justify-between items-center w-full">
                    <Select
                      placeholder="Today's Payment"
                      popupMatchSelectWidth={false}
                      showSearch
                      className="w-full  h-14 max-w-md"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={selectedAuctionGroupId || undefined}
                      onChange={handleGroupPayment}
                    >
                      <Select.Option key={"#1"} value={"today"}>
                        Today's Payments
                      </Select.Option>
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
                        + Add Payment Link
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
                    printHeaderValues={[
                      selectednewGroup?.group_name || "Today's",
                    ]}
                    exportedFileName={`Payments.csv`}
                  />
                ) : (
                  <div className="mt-10 text-center text-gray-500">
                    <CircularLoader
                      isLoading={isLoading}
                      data="Payments Data"
                      failure={
                        TablePayments.length <= 0 && selectedAuctionGroupId
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            <Modal
              isVisible={showModal}
              onClose={() => {
                setSelectedGroupId("");
                setShowModal(false);
                setErrors({});
                setPaymentGroupTickets([]);
              }}
            >
              <div className="py-6 px-5 lg:px-8 text-left">
                <h3 className="mb-6 text-xl font-bold text-gray-900 border-b pb-2">
                  Add Payment Link
                </h3>

                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  <div className="w-full">
                    <label
                      htmlFor="customer"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="customer"
                      className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full ${fieldSize.height}`}
                      placeholder="Select or Search Customer"
                      popupMatchSelectWidth={false}
                      showSearch
                      filterOption={(input, option) =>
                        option?.children
                          ?.toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={selectedGroupId || undefined}
                      onChange={handleCustomer}
                    >
                      {groups.map((group) => (
                        <Select.Option key={group._id} value={group._id}>
                          {`${group.full_name} | ${group.phone_number}`}
                        </Select.Option>
                      ))}
                    </Select>
                    {errors.customer && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.customer}
                      </p>
                    )}
                  </div>

                  <div className="w-full">
                    <label
                      htmlFor="group-ticket"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Group & Ticket <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="group-ticket"
                      mode="multiple"
                      placeholder="Select Group | Ticket"
                      onChange={handlePaymentAntSelect}
                      value={paymentGroupTickets}
                      className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full ${fieldSize.height}`}
                    >
                      {filteredAuction.map((entry, index) => {
                        const groupName =
                          entry?.enrollment?.group?.group_name ||
                          "Unnamed Group";
                        const groupId =
                          entry?.enrollment?.group?._id || `missing-${index}`;
                        const ticket = entry?.enrollment?.tickets || "Unknown";
                        return (
                          <Select.Option
                            key={`chit-${groupId}|${ticket}`}
                            value={`chit-${groupId}|${ticket}`}
                          >
                            {groupName} | {ticket}
                          </Select.Option>
                        );
                      })}
                      {pigmeCustomers?.map((pigme) => (
                        <Select.Option
                          key={pigme._id}
                          value={`pigme-${pigme._id}`}
                        >
                          {`${pigme.pigme_id} | ₹ ${pigme.payable_amount}`}
                        </Select.Option>
                      ))}
                      {borrowers?.map((borrower) => (
                        <Select.Option
                          key={borrower._id}
                          value={`loan-${borrower._id}`}
                        >
                          {`loan-${borrower.loan_id} | ₹ ${borrower.loan_amount}`}
                        </Select.Option>
                      ))}
                    </Select>
                    {errors.payment_group_tickets && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.payment_group_tickets}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-4">
                    <div className="w-full">
                      <label
                        htmlFor="amount"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="amount"
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          placeholder="Enter Amount"
                          required
                          className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                        />
                      </div>
                      {errors.amount && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.amount}
                        </p>
                      )}
                    </div>

                    {formData.amount && paymentGroupTickets.length > 1 && (
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Individual Ticket Amount
                        </label>
                        <input
                          type="text"
                          className="w-full bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded-lg p-2.5 cursor-not-allowed"
                          placeholder="Total Amount"
                          value={(
                            Number(formData.amount) / paymentGroupTickets.length
                          ).toFixed(2)}
                          disabled
                        />
                      </div>
                    )}
                  </div>
                  {/* Expiry Date Field */}
                  <div className="w-full">
                    <label
                      htmlFor="expiry"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Expiry Date
                    </label>
                    <input
                      id="expiry"
                      type="date"
                      name="expiry"
                      min={tomorrowFormatted} // Prevent selecting past dates
                      value={formData.expiry}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    />
                  </div>

                  {/* Send SMS Checkbox */}
                  <div className="flex items-center">
                    <input
                      id="send_sms"
                      type="checkbox"
                      name="send_sms"
                      checked={formData.send_sms}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          send_sms: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50"
                    />
                    <label
                      htmlFor="send_sms"
                      className="ml-2 text-sm font-medium text-gray-900"
                    >
                      Send SMS
                    </label>
                  </div>

                  {/* Send Email Checkbox */}
                  <div className="flex items-center">
                    <input
                      id="send_email"
                      type="checkbox"
                      name="send_email"
                      checked={formData.send_email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          send_email: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50"
                    />
                    <label
                      htmlFor="send_email"
                      className="ml-2 text-sm font-medium text-gray-900"
                    >
                      Send Email
                    </label>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 
                   border-2 border-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 
                   font-medium rounded-lg text-sm px-5 py-2.5 transition-colors duration-200"
                    >
                      Add Payment Link
                    </button>
                  </div>
                </form>
              </div>
            </Modal>

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
              </div>
            </AntModal>
          </div>
        </div>
      )}
    </>
  );
};

export default IndividualChitPaymentLink;
