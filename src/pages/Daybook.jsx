/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";

import api from "../instance/TokenInstance";

import Modal from "../components/modals/Modal";

import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select, Dropdown, Input } from "antd";
import Navbar from "../components/layouts/Navbar";

import { IoMdMore } from "react-icons/io";
import { Link } from "react-router-dom";
import filterOption from "../helpers/filterOption";
import { fieldSize } from "../data/fieldSize";

const Daybook = () => {
  const [groups, setGroups] = useState([]);
  const [TableDaybook, setTableDaybook] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

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
  const [selectedPaymentMode, setSelectedPaymentMode] = useState([]);
  const [selectedPaymentFor, setSelectedPaymentFor] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState("");
  const [hideAccountType, setHideAccountType] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [selectedCollectedBy, setSelectedCollectedBy] = useState("");
  const [payments, setPayments] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("Today");
  const [showAllPaymentModes, setShowAllPaymentModes] = useState(false);
  const [collectionAgent, setCollectionAgent] = useState("");
  const [collectionAdmin, setCollectionAdmin] = useState("");
  const [agents, setAgents] = useState([]);
  const [admins, setAdmins] = useState([]);
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
    collection_time: "",
    collected_by: collectionAgent,
    admin_type: collectionAdmin,
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

  const handleSelectFilter = (value) => {
    setSelectedLabel(value);
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
    const abortController = new AbortController();
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
            collected_by: collectionAgent,
            admin_type: collectionAdmin,
            pay_for: selectedPaymentFor,
          },
          signal: abortController.signal,
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
            ticket: group?.loan
              ? group.loan?.loan_id
              : group?.pigme
              ? group.pigme?.pigme_id
              : group?.ticket,
            receipt: group?.receipt_no,
            old_receipt_no: group?.old_receipt_no,
            amount: group?.amount,
            date: group.pay_date?.split("T")?.[0],
            transaction_date: group?.createdAt?.split("T")?.[0],
            mode: group?.pay_type,
            account_type: group?.account_type,
            collection_time: group?.collection_time,
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
                          className="text-blue-600 ">
                          Print
                        </Link>
                      ),
                    },
                  ],
                }}
                placement="bottomLeft">
                <IoMdMore className="text-bold" />
              </Dropdown>
            ),
          }));
          setTableDaybook(formattedData);
        } else {
          setFilteredAuction([]);
        }
      } catch (error) {
        setFilteredAuction([]);
        setPayments(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
    return () => {
      abortController.abort();
    };
  }, [
    selectedAuctionGroupId,
    selectedDate,
    selectedPaymentMode,
    selectedCustomers,
    selectedAccountType,
    collectionAgent,
    collectionAdmin,
    selectedPaymentFor,
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
      ? [{ key: "account_type", header: "Account Type" }]
      : []),
    { key: "collected_by", header: "Collected By" },
    { key: "collection_time", header: "Collection Time" },
    { key: "action", header: "Action" },
  ];

  useEffect(() => {
    (async () => {
      try {
        const [employees, admins] = await Promise.all([
          api.get("/employee"),
          api.get("/admin/get-sub-admins"),
        ]);
        const emps = employees?.data?.employee.map((emp) => ({
          _id: emp._id,
          full_name: emp.name,
          phone_number: emp.phone_number,
          selected_type: "agent_type",
        }));
        setAgents(emps);
        const adms = admins?.data?.map((ad) => ({
          _id: ad?._id,
          full_name: ad?.name,
          phone_number: ad?.phoneNumber,
          selected_type: "admin_type",
        }));
        setAdmins(adms);
        console.log(adms, "adms");
      } catch (error) {
        setAdmins([]);
        setAgents([]);
      }
    })();
  }, []);

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
        <div className="flex ">
          <Navbar
            onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
            visibility={true}
          />
          <div className="flex-grow p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
            <div className="flex-grow ">
              {/* Header Section */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent p-2">
                  Reports - Daybook
                </h1>
                <p className="text-gray-600 mt-2">
                  Track and manage all receipt transactions
                </p>
              </div>

              {/* Filters Card */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filters
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {/* Filter Option */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Date Range
                    </label>
                    <Select
                      showSearch
                      popupMatchSelectWidth={false}
                      onChange={handleSelectFilter}
                      value={selectedLabel || undefined}
                      placeholder="Select date range"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full"
                      style={{ height: "44px" }}>
                      {dayGroup.map((time) => (
                        <Select.Option key={time.value} value={time.value}>
                          {time.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {/* Date Field */}
                  {showFilterField && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Custom Date
                      </label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full h-11 border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* Group */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Group
                    </label>
                    <Select
                      showSearch
                      popupMatchSelectWidth={false}
                      value={selectedAuctionGroupId}
                      onChange={handleGroupPayment}
                      placeholder="Select group"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full"
                      style={{ height: "44px" }}>
                      <Select.Option value={""}>All Groups</Select.Option>
                      {groups.map((group) => (
                        <Select.Option key={group._id} value={group._id}>
                          {group.group_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {/* Customers */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Customer
                    </label>
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
                      placeholder="Select customer"
                      onChange={(groupId) => setSelectedCustomers(groupId)}
                      className="w-full"
                      style={{ height: "44px" }}>
                      <Select.Option value="">All Customers</Select.Option>
                      {filteredUsers.map((group) => (
                        <Select.Option key={group?._id} value={group?._id}>
                          {group?.full_name} - {group.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {/* Collection Employee */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Collection Employee
                    </label>
                    <Select
                      showSearch
                      placeholder="Select employee"
                      popupMatchSelectWidth={false}
                      onChange={(selection) => {
                        const [id, type] = selection.split("|") || [];
                        if (type === "admin_type") {
                          setCollectionAdmin(id);
                          setCollectionAgent("");
                        } else if (type === "agent_type") {
                          setCollectionAgent(id);
                          setCollectionAdmin("");
                        } else {
                          setCollectionAdmin("");
                          setCollectionAgent("");
                        }
                      }}
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full"
                      style={{ height: "44px" }}>
                      <Select.Option value="">All Employees</Select.Option>
                      {[...new Set(agents), ...new Set(admins)].map((dt) => (
                        <Select.Option
                          key={dt?._id}
                          value={`${dt._id}|${dt.selected_type}`}>
                          {dt.selected_type === "admin_type"
                            ? "Admin | "
                            : "Employee | "}
                          {dt.full_name} | {dt.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {/* Payment Mode */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Payment Mode
                    </label>

                    <Select
                      mode="multiple"
                      value={selectedPaymentMode}
                      showSearch
                      placeholder="Select payment mode"
                      popupMatchSelectWidth={false}
                      onChange={(modes) => {
                        setSelectedPaymentMode(modes);
                      }}
                      filterOption={(input, option) =>
                        option.label
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full"
                      style={{ height: "44px" }}
                      options={[
                        { label: "Cash", value: "cash" },
                        { label: "Online", value: "online" },
                        { label: "Payment Link", value: "Payment Link" },
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Payment For
                    </label>

                    <Select
                      mode="multiple"
                      value={selectedPaymentFor}
                      showSearch
                      placeholder="Select payment for"
                      popupMatchSelectWidth={false}
                      onChange={(modes) => {
                        setSelectedPaymentFor(modes);
                      }}
                      filterOption={(input, option) =>
                        option.label
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full"
                      style={{ height: "44px" }}
                      options={[
                        { label: "Chit", value: "chit" },
                        { label: "Pigme", value: "Pigme" },
                        { label: "Loan", value: "Loan" },
                      ]}
                    />
                  </div>
                  {/* Account Type */}
                  {showAllPaymentModes && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Account Type
                      </label>
                      <Select
                        value={selectedAccountType}
                        showSearch
                        placeholder="Select account type"
                        popupMatchSelectWidth={false}
                        onChange={(groupId) => setSelectedAccountType(groupId)}
                        filterOption={(input, option) =>
                          option.children
                            .toString()
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        className="w-full"
                        style={{ height: "44px" }}>
                        <Select.Option value="">All Types</Select.Option>
                        <Select.Option value="suspense">Suspense</Select.Option>
                        <Select.Option value="credit">Credit</Select.Option>
                        <Select.Option value="adjustment">
                          Adjustment
                        </Select.Option>
                        <Select.Option value="others">Others</Select.Option>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Total Amount
                    </label>
                    <div className="relative">
                      <input
                        className="w-full h-11 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg font-semibold text-blue-700 text-lg"
                        readOnly
                        value={`₹ ${(payments + 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table Section */}
              {filteredAuction && filteredAuction.length > 0 && !isLoading ? (
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                  <DataTable
                    data={filterOption(TableDaybook, searchText)}
                    columns={columns}
                    exportedPdfName={`Daybook Report`}
                    exportedFileName={`Daybook-${
                      TableDaybook.length > 0
                        ? TableDaybook[0].name +
                          " to " +
                          TableDaybook[TableDaybook.length - 1].name
                        : "empty"
                    }.csv`}
                  />
                  <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-md">
                      <span className="text-sm font-medium opacity-90">
                        Total Amount
                      </span>
                      <div className="text-2xl font-bold">
                        ₹ {payments.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12">
                  <CircularLoader
                    isLoading={isLoading}
                    failure={filteredAuction.length <= 0}
                    data="Daybook Data"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Daybook;
