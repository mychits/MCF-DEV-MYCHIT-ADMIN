/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import api from "../instance/TokenInstance";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import Modal from "../components/modals/Modal";
import { BsEye } from "react-icons/bs";
import UploadModal from "../components/modals/UploadModal";
import axios from "axios";
import url from "../data/Url";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select, Dropdown,Input } from "antd";
import Navbar from "../components/layouts/Navbar";

import { IoMdMore } from "react-icons/io";
import { Link } from "react-router-dom";
import filterOption from "../helpers/filterOption";
import { fieldSize } from "../data/fieldSize";
const Daybook = () => {
  const [groups, setGroups] = useState([]);
  const [TableDaybook, setTableDaybook] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedAuctionGroup, setSelectedAuctionGroup] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedAuctionGroupId, setSelectedAuctionGroupId] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredAuction, setFilteredAuction] = useState([]);
  const [groupInfo, setGroupInfo] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentUpdateGroup, setCurrentUpdateGroup] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [receiptNo, setReceiptNo] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
    const [onlinePayments, setOnlinePayments] = useState([]);
  const [cashPayments, setCashPayments] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState([]);
  const [totalCashPaymentsCount, setCashPaymentsCount] = useState(0);
const [totalOnlinePaymentsCount, setOnlinePaymentsCount] = useState(0);
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [showFilterField, setShowFilterField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState("");
    const [hideAccountType, setHideAccountType] = useState("");
    const [selectedAccountType, setSelectedAccountType] = useState("");
  const [payments, setPayments] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("Today")
const [showAllPaymentModes,setShowAllPaymentModes] = useState(false);
  const onGlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };
  const [formData, setFormData] = useState({
    group_id: "",
    user_id: "",
    ticket: "",
    receipt_no: "",
    pay_date: "",
    amount: "",
    pay_type: "cash",
    transaction_id: "",
  });
 useEffect(() => {
    const user = localStorage.getItem("user");
    const userObj = JSON.parse(user);

    if (
      userObj &&
      userObj.admin_access_right_id?.access_permissions?.edit_payment
    ) {
      const showPaymentsModes =
        userObj.admin_access_right_id?.access_permissions?.edit_payment ===
        "true"
          ? true
          : false;
      setShowAllPaymentModes(showPaymentsModes);
    }
  }, []);
   useEffect(() => {
        const user = localStorage.getItem("user");
        const userObj = JSON.parse(user);
    
        if (
          userObj &&
          userObj.admin_access_right_id?.access_permissions?.edit_payment
        ) {
          const isModify =
            userObj.admin_access_right_id?.access_permissions?.edit_payment ===
            "true"
              ? true
              : false;
          setHideAccountType(isModify);
        }
      }, []);
  const handleModalClose = () => setShowUploadModal(false);
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/user/get-user");
        setFilteredUsers(response.data);
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
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await api.get("/payment/get-latest-receipt");
        setReceiptNo(response.data);
      } catch (error) {
        console.error("Error fetching receipt data:", error);
      }
    };
    fetchReceipt();
  }, []);

  useEffect(() => {
    if (receiptNo) {
      setFormData((prevData) => ({
        ...prevData,
        receipt_no: receiptNo.receipt_no,
      }));
    }
  }, [receiptNo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const dayGroup = [
    { value: "Today", label: "Today" },
    { value: "Yesterday", label: "Yesterday" },
    { value: "Twodaysago", label: "Two Days Ago" },
    { value: "Custom", label: "Custom" },
  ];

  const handleChangeUser = (e) => {
    const { name, value } = e.target;
    const [user_id, ticket] = value.split("-");
    setFormData((prevData) => ({
      ...prevData,
      user_id,
      ticket,
    }));
  };

  // const handleSelectFilter = (e) => {
  //   const { value } = e.target;
  //   setShowFilterField(false);
  //   const formatDate = (date) => date.toISOString().slice(0, 10);
  //   if (value === "Today") {
  //     const formattedToday = formatDate(today);
  //     setSelectedDate(formattedToday);
  //   } else if (value === "Yesterday") {
  //     const yesterday = new Date(today);
  //     yesterday.setDate(yesterday.getDate() - 1);
  //     const formatted = formatDate(yesterday);
  //     setSelectedDate(formatted);
  //   }else if (value === "Custom") {
  //     setShowFilterField(true);
  //   }
  // };

  const handleSelectFilter = (value) => {
    setSelectedLabel(value)
    setShowFilterField(false);
    const today = new Date();
    const formatDate = (date) => date.toISOString().slice(0, 10);

    if (value === "Today") {
      setSelectedDate(formatDate(today));
    } else if (value === "Yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      setSelectedDate(formatDate(yesterday));
    } else if (value === "Twodaysago") {
      const twodaysago = new Date(today);
      twodaysago.setDate(twodaysago.getDate() - 2);
      setSelectedDate(formatDate(twodaysago));
    } else if (value === "Custom") {
      setShowFilterField(true);
    } else {
      setSelectedDate("");
    }
  };

  const handleGroup = async (event) => {
    const groupId = event.target.value;
    setSelectedGroupId(groupId);
    setFormData((prevFormData) => ({
      ...prevFormData,
      group_id: groupId,
    }));

    //handleGroupChange(groupId);
    const handleGroupChange = async (groupId) => {
      //const groupId = event.target.value;
      setSelectedGroup(groupId);
    };

    if (groupId) {
      try {
        const response = await api.get(`/group/get-by-id-group/${groupId}`);
        setGroupInfo(response.data || {});
      } catch (error) {
        console.error("Error fetching group data:", error);
        setGroupInfo({});
      }
    } else {
      setGroupInfo({});
    }
  };

  const handleGroupPayment = (groupId) => {
    setSelectedAuctionGroupId(groupId);
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/payment/get-report-daybook`, {
          params: {
            pay_date: selectedDate,
            groupId: selectedAuctionGroupId,
            userId: selectedCustomers,
            pay_type: selectedPaymentMode,
            account_type: selectedAccountType,
          },
        });
        if (response.data && response.data.length > 0) {
          setFilteredAuction(response.data);
          const paymentData = response.data;
          const totalAmount = paymentData.reduce(
            (sum, payment) => sum + Number(payment.amount || 0),
            0
          );
          setPayments(totalAmount || 0);
          const totalCash = paymentData
            .filter((row) => row.pay_type?.toLowerCase() === "cash")
            .reduce((sum, row) => sum + Number(row.amount || 0), 0);
            setCashPayments(totalCash || 0);
          console.info(totalCash, "cash");

          const totalOnline = paymentData
            .filter((row) => row.pay_type?.toLowerCase() === "online")
            .reduce((sum, row) => sum + Number(row.amount || 0), 0);
            setOnlinePayments(totalOnline || 0);
          
          const totalCustomers = new Set(
          paymentData.map((row) => row?.user_id?.full_name || row.name)
        ).size;
        setTotalCustomers?.(totalCustomers); // Optional state if you have one

        //  Count: Total Online Payments
        const totalOnlineCount = paymentData.filter(
          (row) => row.pay_type?.toLowerCase() === "online"
        ).length;
        setOnlinePaymentsCount?.(totalOnlineCount); // Optional state

        //  Count: Total Cash Payments
        const totalCashCount = paymentData.filter(
          (row) => row.pay_type?.toLowerCase() === "cash"
        ).length;
        setCashPaymentsCount?.(totalCashCount);
          const formattedData = response.data.map((group, index) => ({
            _id: group._id,
            id: index + 1,
            group: group?.group_id?.group_name || group?.pay_for,
            name: group?.user_id?.full_name,
            category: group?.pay_for || "Chit",
            phone_number: group?.user_id?.phone_number,
            ticket: group?.ticket,
            receipt: group?.receipt_no,
            old_receipt_no: group?.old_receipt_no,
            amount: group?.amount,
            date:group.pay_date?.split("T")?.[0],
            transaction_date:group?.createdAt?.split("T")?.[0],
            mode: group?.pay_type,
            account_type: group?.account_type,
            collected_by:
              group?.collected_by?.name ||
              group?.admin_type?.admin_name ||
              "Super Admin",
            action: (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "1",
                      label: (
                        <Link
                          target="_blank"
                          to={`/print/${group._id}`}
                          className="text-blue-600 "
                        >
                          Print
                        </Link>
                      ),
                    },
                  ],
                }}
                placement="bottomLeft"
              >
                <IoMdMore className="text-bold" />
              </Dropdown>
            ),
          }));
          setTableDaybook(formattedData);
        } else {
          setFilteredAuction([]);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setFilteredAuction([]);
        setPayments(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [
    selectedAuctionGroupId,
    selectedDate,
    selectedPaymentMode,
    selectedCustomers,
    selectedAccountType,
  ]);

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "date", header: "Paid Date" },
    { key: "transaction_date", header: "Transaction Date" },
    { key: "group", header: "Group Name" },
    { key: "category", header: "Category" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "ticket", header: "Ticket" },
    { key: "receipt", header: "Receipt" },
    { key: "old_receipt_no", header: "Old Receipt" },
    { key: "amount", header: "Amount" },
    { key: "mode", header: "Payment Mode" },
     ...(hideAccountType
    ? [{ key: "account_type", header: "Account Type" }]: []),
    { key: "collected_by", header: "Collected By" },
    { key: "action", header: "Action" },
  ];

  useEffect(() => {
    if (groupInfo && formData.bid_amount) {
      const commission = (groupInfo.group_value * 5) / 100 || 0;
      const win_amount =
        (groupInfo.group_value || 0) - (formData.bid_amount || 0);
      const divident = (formData.bid_amount || 0) - commission;
      const divident_head = groupInfo.group_members
        ? divident / groupInfo.group_members
        : 0;
      const payable = (groupInfo.group_install || 0) - divident_head;

      setFormData((prevData) => ({
        ...prevData,
        group_id: groupInfo._id,
        commission,
        win_amount,
        divident,
        divident_head,
        payable,
      }));
    }
  }, [groupInfo, formData.bid_amount]);

  const handlePaymentModeChange = (e) => {
    const selectedMode = e.target.value;
    setPaymentMode(selectedMode);
    setFormData((prevData) => ({
      ...prevData,
      pay_type: selectedMode,
      transaction_id: selectedMode === "online" ? prevData.transaction_id : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/payment/add-payment", formData);
      if (response.status === 201) {
        alert("Payment Added Successfully");
        //window.location.reload();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error submitting payment data:", error);
    }
  };

  const handleDeleteModalOpen = async (groupId) => {
    try {
      const response = await api.get(`/payment/get-payment-by-id/${groupId}`);
      setCurrentGroup(response.data);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching enroll:", error);
    }
  };

  const handleDeleteAuction = async () => {
    if (currentGroup) {
      try {
        await api.delete(`/payment/delete-payment/${currentGroup._id}`);
        alert("Payment deleted successfully");
        setShowModalDelete(false);
        setCurrentGroup(null);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting auction:", error);
      }
    }
  };

  const handleUpdateModalOpen = async (groupId) => {
    try {
      const response = await api.get(`/auction/get-auction-by-id/${groupId}`);
      setCurrentUpdateGroup(response.data);
      setShowModalUpdate(true);
    } catch (error) {
      console.error("Error fetching auction:", error);
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();

    const formDatas = new FormData();
    const fileInput = e.target.file;
    if (fileInput && fileInput.files[0]) {
      formDatas.append("file", fileInput.files[0]);

      try {
        const response = await api.post(`/payment/payment-excel`, formDatas, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status === 200) {
          alert("File uploaded successfully!");
          window.location.reload();
          setShowUploadModal(false);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file.");
      }
    } else {
      alert("Please select a file to upload.");
    }
  };

  return (
    <>
      <div className="w-screen">
        <div className="flex mt-30">
          <Navbar
            onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
            visibility={true}
          />
          <div className="flex-grow p-7">
            <h1 className="text-2xl font-semibold">Reports - Daybook</h1>
            <div className="mt-6 mb-8">
              <div className="mb-2">
                <div className="flex justify-start items-center w-full gap-4">
                  <div className="mb-2">
                    <label>Filter Option</label>
                    {/* <select
                      onChange={handleSelectFilter}
                      className="border border-gray-300 rounded px-6 shadow-sm outline-none w-full max-w-md"
                    >
                      <option value="Today">Today</option>
                      <option value="Yesterday">Yesterday</option>
                    
                      <option value="Custom">Custom</option>
                    </select> */}
                    <Select
                      showSearch
                      popupMatchSelectWidth={false}
                      onChange={handleSelectFilter}
                      value={selectedLabel || undefined}
                      placeholder="Search Or Select Filter"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full max-w-xs h-11"
                    >
                      {dayGroup.map((time) => (
                        <Select.Option key={time.value} value={time.value}>
                          {time.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {showFilterField && (
                    <div className="mb-2">
                      <label>Date</label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full max-w-xs"
                      />
                    </div>
                  )}
                  <div className="mb-2">
                    <label>Group</label>
                    <Select
                      showSearch
                      popupMatchSelectWidth={false}
                      value={selectedAuctionGroupId}
                      onChange={handleGroupPayment}
                      placeholder="Search Or Select Group"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full max-w-xs h-11"
                    >
                      <Select.Option value={""}>All</Select.Option>
                      {groups.map((group) => (
                        <Select.Option key={group._id} value={group._id}>
                          {group.group_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="mb-2">
                    <label>Customers</label>
                    <Select
                      showSearch
                      popupMatchSelectWidth={false}
                      value={selectedCustomers}
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      placeholder="Search Or Select Customer"
                      onChange={(groupId) => setSelectedCustomers(groupId)}
                      className="w-full max-w-xs h-11"
                    // className="border border-gray-300 rounded px-6 py-2 shadow-sm outline-none w-full max-w-md"
                    >
                      <Select.Option value="">All</Select.Option>
                      {filteredUsers.map((group) => (
                        <Select.Option key={group?._id} value={group?._id}>
                          {group?.full_name} - {group.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="mb-2">
                    <label>Payment Mode</label>
                    <Select
                      value={selectedPaymentMode}
                      showSearch
                      placeholder="Search Or Select Payment"
                      popupMatchSelectWidth={false}
                      onChange={(groupId) => setSelectedPaymentMode(groupId)}
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full max-w-xs h-11"
                    // className="border border-gray-300 rounded px-6 py-2 shadow-sm outline-none w-full max-w-md"
                    >
                      <Select.Option value="">All</Select.Option>
                      <Select.Option value="cash">Cash</Select.Option>
                      <Select.Option value="online">Online</Select.Option>
                      <Select.Option value="Payment Link">Payment Link</Select.Option>
                      <Select.Option value="Transfer">Transfer</Select.Option>
                      </Select>
                  </div>
                  {showAllPaymentModes && (
                  <div className="mb-2">
                    <label>Account Type</label>
                    <Select
                      value={selectedAccountType}
                      showSearch
                      placeholder="Search Or Account Type"
                      popupMatchSelectWidth={false}
                      onChange={(groupId) => setSelectedAccountType(groupId)}
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full max-w-xs h-11"
                    // className="border border-gray-300 rounded px-6 py-2 shadow-sm outline-none w-full max-w-md"
                    >
                     
                       
                          <>
                           <option value="">Select Account Type</option>
                            <option value="suspense">Suspense</option>
                            <option value="credit">Credit</option>
                            <option value="adjustment">Adjustment</option>
                            <option value="others">Others</option>
                          </>
                      
                    </Select>
                  </div>
                   )}

                  <div className="text-md font-semibold text-blue-700 mb-2">
                    <label> Total Amount </label>
                    <div>
                      <input
                        className="w-full max-w-xs h-11 rounded-md"
                        readOnly
                        value={`₹ ${(payments + 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}`}
                      />
                    </div>
                  </div>



                </div>
              </div>
              {filteredAuction && filteredAuction.length > 0 && !isLoading ? (
                <div className="mt-10">
                  <DataTable
                    data={filterOption(TableDaybook, searchText)}
                    columns={columns}
                    exportedPdfName={`Daybook Report`}
                    exportedFileName={`Daybook-${TableDaybook.length > 0
                        ? TableDaybook[0].name +
                        " to " +
                        TableDaybook[TableDaybook.length - 1].name
                        : "empty"
                      }.csv`}
                  />
                  <div className="flex justify-end mt-4 pr-4">
                    <span className="text-lg font-semibold">
                      Total Amount: ₹{payments}
                    </span>
                  </div>
                </div>
              ) : (
                <CircularLoader
                  isLoading={isLoading}
                  failure={filteredAuction.length <= 0}
                  data="Daybook Data"
                />
              )}
            </div>
          </div>

          <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
            <div className="py-6 px-5 lg:px-8 text-left">
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Add Payment
              </h3>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="w-full">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="category"
                  >
                    Group
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={handleGroup}
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  >
                    <option value="">Select Group</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.group_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="category"
                  >
                    Customers
                  </label>
                  <Select
                    name="user_id"
                    value={`${formData.user_id}-${formData.ticket}`}
                    onChange={handleChangeUser}
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  >
                    <Select.Option value="">Select Customer</Select.Option>
                    {filteredUsers.map((user) => (
                      <Select.Option
                        key={`${user?.user_id?._id}-${user.tickets}`}
                        value={`${user?.user_id?._id}-${user.tickets}`}
                      >
                        {user?.user_id?.full_name} | {user.tickets}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_value"
                    >
                      Receipt No.
                    </label>
                    <input
                      type="text"
                      name="receipt_no"
                      value={formData.receipt_no}
                      id="receipt_no"
                      placeholder="Receipt No."
                      readOnly
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_install"
                    >
                      Payment Date
                    </label>
                    <input
                      type="date"
                      name="pay_date"
                      value={formData.pay_date}
                      id="pay_date"
                      onChange={handleChange}
                      placeholder=""
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_value"
                    >
                      Amount
                    </label>
                    <input
                      type="text"
                      name="amount"
                      value={formData.amount}
                      id="amount"
                      onChange={handleChange}
                      placeholder="Enter Amount"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="pay_mode"
                    >
                      Payment Mode
                    </label>
                    <select
                      name="pay_mode"
                      id="pay_mode"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                      onChange={handlePaymentModeChange}
                    >
                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                      <option value="Payment Link">Payment Link</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                  </div>
                </div>
                {paymentMode === "online" && (
                  <div className="w-full mt-4">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="transaction_id"
                    >
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      name="transaction_id"
                      id="transaction_id"
                      value={formData.transaction_id}
                      onChange={handleChange}
                      placeholder="Enter Transaction ID"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full text-white bg-blue-700 hover:bg-blue-800
                              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Add
                </button>
              </form>
            </div>
          </Modal>
          <Modal
            isVisible={showModalUpdate}
            onClose={() => setShowModalUpdate(false)}
          >
            <div className="py-6 px-5 lg:px-8 text-left">
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                View Auction
              </h3>
              <form className="space-y-6" onSubmit={() => { }}>
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="email"
                  >
                    Group
                  </label>
                  <input
                    type="text"
                    name="group_id"
                    value={currentUpdateGroup?.group_id?.group_name}
                    onChange={() => { }}
                    id="name"
                    placeholder="Enter the Group Name"
                    readOnly
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_value"
                    >
                      Group Value
                    </label>
                    <input
                      type="text"
                      name="group_value"
                      value={currentUpdateGroup?.group_id?.group_value}
                      id="group_value"
                      placeholder="select group to check"
                      readOnly
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_install"
                    >
                      Group Installment
                    </label>
                    <input
                      type="text"
                      name="group_install"
                      value={currentUpdateGroup?.group_id?.group_install}
                      id="group_install"
                      placeholder="select group to check"
                      readOnly
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="email"
                  >
                    User
                  </label>
                  <input
                    type="text"
                    name="group_id"
                    value={`${currentUpdateGroup?.user_id?.full_name} | ${currentUpdateGroup?.ticket}`}
                    onChange={() => { }}
                    id="name"
                    placeholder="Enter the User Name"
                    readOnly
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>

                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="email"
                  >
                    Bid Amount
                  </label>
                  <input
                    type="number"
                    name="bid_amount"
                    value={
                      currentUpdateGroup?.group_id?.group_value -
                      currentUpdateGroup?.win_amount
                    }
                    onChange={() => { }}
                    id="name"
                    placeholder="Enter the Bid Amount"
                    readOnly
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_value"
                    >
                      Commission
                    </label>
                    <input
                      type="text"
                      name="commission"
                      value={currentUpdateGroup?.commission}
                      id="commission"
                      placeholder=""
                      readOnly
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_install"
                    >
                      Winning Amount
                    </label>
                    <input
                      type="text"
                      name="win_amount"
                      value={currentUpdateGroup?.win_amount}
                      id="win_amount"
                      placeholder=""
                      readOnly
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_value"
                    >
                      Divident
                    </label>
                    <input
                      type="text"
                      name="divident"
                      value={currentUpdateGroup?.divident}
                      id="divident"
                      placeholder=""
                      readOnly
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_install"
                    >
                      Divident per Head
                    </label>
                    <input
                      type="text"
                      name="divident_head"
                      value={currentUpdateGroup?.divident_head}
                      id="divident_head"
                      placeholder=""
                      readOnly
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="group_install"
                    >
                      Next Payable
                    </label>
                    <input
                      type="text"
                      name="payable"
                      value={currentUpdateGroup?.payable}
                      id="payable"
                      placeholder=""
                      readOnly
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="date"
                    >
                      Auction Date
                    </label>
                    <input
                      type="date"
                      name="auction_date"
                      value={currentUpdateGroup?.auction_date}
                      onChange={() => { }}
                      id="date"
                      placeholder="Enter the Date"
                      readOnly
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="date"
                    >
                      Next Date
                    </label>
                    <input
                      type="date"
                      name="next_date"
                      value={currentUpdateGroup?.next_date}
                      onChange={() => { }}
                      id="date"
                      placeholder="Enter the Date"
                      readOnly
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
              </form>
            </div>
          </Modal>
          <Modal
            isVisible={showModalDelete}
            onClose={() => {
              setShowModalDelete(false);
              setCurrentGroup(null);
            }}
          >
            <div className="py-6 px-5 lg:px-8 text-left">
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Sure want to delete this Payment ?
              </h3>
              {currentGroup && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleDeleteAuction();
                  }}
                  className="space-y-6"
                >
                  <button
                    type="submit"
                    className="w-full text-white bg-red-700 hover:bg-red-800
                    focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    Delete
                  </button>
                </form>
              )}
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default Daybook;
