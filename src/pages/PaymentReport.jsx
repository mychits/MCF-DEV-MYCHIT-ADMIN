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
import { Select, Dropdown } from "antd";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import EndlessCircularLoader from "../components/loaders/EndlessCircularLoader";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { IoMdMore } from "react-icons/io";
import { Link } from "react-router-dom";
import { fieldSize } from "../data/fieldSize";

const PaymentReport = () => {
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
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterField, setShowFilterField] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Today");

  const now = new Date();
  const onGlobalSearchChangeHandler = (e) => {
    setSearchText(e.target.value);
  };
  const todayString = now.toISOString().split("T")[0];
  const [selectedFromDate, setSelectedFromDate] = useState(todayString);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState([]);
  const [hideAccountType, setHideAccountType] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState("");
  const [payments, setPayments] = useState([]);
  const [selectedPaymentFor, setSelectedPaymentFor] = useState([]);
  const [collectionAgent, setCollectionAgent] = useState("");
  const [collectionAdmin, setCollectionAdmin] = useState("");
  const [agents, setAgents] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [showAllPaymentModes, setShowAllPaymentModes] = useState(false);
  const [formData, setFormData] = useState({
    group_id: "",
    user_id: "",
    ticket: "",
    receipt_no: "",
    pay_date: "",
    amount: "",
    pay_type: "cash",
    transaction_id: "",
    collected_by: collectionAgent,
    admin_type: collectionAdmin,
    collection_time: "",
  });
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });
  const handleModalClose = () => setShowUploadModal(false);
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

  const handleChangeUser = (e) => {
    const { name, value } = e.target;
    const [user_id, ticket] = value.split("-");
    setFormData((prevData) => ({
      ...prevData,
      user_id,
      ticket,
    }));
  };

  const handleGroup = async (event) => {
    const groupId = event.target.value;
    setSelectedGroupId(groupId);
    setFormData((prevFormData) => ({
      ...prevFormData,
      group_id: groupId,
    }));

    handleGroupChange(groupId);

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

  const groupOptions = [
    { value: "Today", label: "Today" },
    { value: "Yesterday", label: "Yesterday" },
    { value: "ThisMonth", label: "This Month" },
    { value: "LastMonth", label: "Last Month" },
    { value: "ThisYear", label: "This Year" },
    { value: "Custom", label: "Custom" },
  ];

  const handleGroupPayment = async (groupId) => {
    // const groupId = event.target.value;
    setSelectedAuctionGroupId(groupId);
  };

  const handleSelectFilter = (value) => {
    setSelectedLabel(value);
    //const { value } = e.target;
    setShowFilterField(false);

    const today = new Date();
    const formatDate = (date) => date.toLocaleDateString("en-CA");

    if (value === "Today") {
      const formatted = formatDate(today);
      setSelectedFromDate(formatted);
      setSelectedDate(formatted);
    } else if (value === "Yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const formatted = formatDate(yesterday);
      setSelectedFromDate(formatted);
      setSelectedDate(formatted);
    } else if (value === "ThisMonth") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setSelectedFromDate(formatDate(start));
      setSelectedDate(formatDate(end));
    } else if (value === "LastMonth") {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setSelectedFromDate(formatDate(start));
      setSelectedDate(formatDate(end));
    } else if (value === "ThisYear") {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      setSelectedFromDate(formatDate(start));
      setSelectedDate(formatDate(end));
    } else if (value === "Custom") {
      setShowFilterField(true);
    }
  };
  const formatPayDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString("en-US", options).replace(",", "");
  };

  useEffect(() => {
    const abortController = new AbortController();
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/payment/paydate-report`, {
          params: {
            from_date: selectedFromDate,
            to_date: selectedDate,
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
        console.info(response.data, "testing account type");
        if (response.data && response.data.length > 0) {
          const validPayments = response.data.filter(
            (payment) => payment.group_id !== null
          );

          setFilteredAuction(validPayments);

          const totalAmount = validPayments.reduce(
            (sum, payment) => sum + Number(payment.amount || 0),
            0
          );
          console.info(totalAmount, "check amount");
          setPayments(totalAmount);

          const formattedData = validPayments.map((group, index) => ({
            _id: group?._id,
            id: index + 1,
            date: group?.pay_date,
            group: group?.group_id?.group_name || group.pay_for,
            name: group?.user_id?.full_name,
            category: group?.pay_for || "Chit",
            phone_number: group?.user_id?.phone_number,
            receipt_no: group?.receipt_no,
            old_receipt_no: group?.old_receipt_no,
            ticket: group?.loan
              ? group.loan?.loan_id
              : group?.pigme
              ? group.pigme?.pigme_id
              : group?.ticket,
            amount: group?.amount,
            transaction_date: group?.createdAt?.split("T")?.[0],
            mode: group?.pay_type,
            account_type: group?.account_type,
            collection_time: group?.collection_time,
            collected_by:
              group?.collected_by?.name ||
              group?.admin_type?.admin_name ||
              "Super Admin",
            action: (
              <div className="flex justify-center gap-2">
                <Dropdown
                  trigger={["click"]}
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
              </div>
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
    return () => {
      abortController.abort();
    };
  }, [
    selectedAuctionGroupId,
    selectedDate,
    selectedPaymentMode,
    selectedCustomers,
    selectedFromDate,
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
    { key: "name", header: "Customer Name" },
    { key: "category", header: "Category" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "receipt_no", header: "Receipt Number" },
    { key: "old_receipt_no", header: "Old Receipt" },
    { key: "ticket", header: "Ticket" },
    { key: "amount", header: "Amount" },
    { key: "mode", header: "Payment Mode" },
    ...(hideAccountType
      ? [{ key: "account_type", header: "Account Type" }]
      : []),
    { key: "collection_time", header: "Collection Time" },
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
          <CustomAlert
            type={alertConfig.type}
            isVisible={alertConfig.visibility}
            message={alertConfig.message}
          />
          <div className="flex-grow p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent p-2">
                Reports - Payment
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage all receipt transactions
              </p>
            </div>

            <div className="mt-6 mb-8">
              {/* Filters Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-indigo-600"
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
                  Filter Options
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Filter Option */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Filter Option
                    </label>
                    <Select
                      showSearch
                      popupMatchSelectWidth={false}
                      onChange={handleSelectFilter}
                      value={selectedLabel}
                      placeholder="Search Or Select Filter"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full h-11">
                      {groupOptions.map((time) => (
                        <Select.Option key={time.value} value={time.value}>
                          {time.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {/* Custom Date Range */}
                  {showFilterField && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          From Date
                        </label>
                        <input
                          type="date"
                          value={selectedFromDate}
                          onChange={(e) => setSelectedFromDate(e.target.value)}
                          className="w-full h-11 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          To Date
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full h-11 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                        />
                      </div>
                    </>
                  )}

                  {/* Group Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Group
                    </label>
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
                      className="w-full h-11">
                      <Select.Option value={""}>All</Select.Option>
                      {groups.map((group) => (
                        <Select.Option key={group._id} value={group._id}>
                          {group.group_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {/* Customer Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
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
                      placeholder="Search Or Select Customer"
                      onChange={(groupId) => setSelectedCustomers(groupId)}
                      className="w-full h-11">
                      <Select.Option value="">All</Select.Option>
                      {filteredUsers.map((group) => (
                        <Select.Option key={group?._id} value={group?._id}>
                          {group?.full_name} - {group.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

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
                        { label: "Chit", value: "Chit" },
                        { label: "Pigme", value: "Pigme" },
                        { label: "Loan", value: "Loan" },
                      ]}
                    />
                  </div>

                  {/* Account Type Filter */}
                  {showAllPaymentModes && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Account Type
                      </label>
                      <Select
                        value={selectedAccountType}
                        showSearch
                        placeholder="Search Or Select Account Type"
                        popupMatchSelectWidth={false}
                        onChange={(groupId) => setSelectedAccountType(groupId)}
                        filterOption={(input, option) =>
                          option.children
                            .toString()
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        className="w-full h-11">
                        <Select.Option value="">
                          Select Account Type
                        </Select.Option>
                        <Select.Option value="suspense">Suspense</Select.Option>
                        <Select.Option value="credit">Credit</Select.Option>
                        <Select.Option value="adjustment">
                          Adjustment
                        </Select.Option>
                        <Select.Option value="others">Others</Select.Option>
                      </Select>
                    </div>
                  )}

                  {/* Collection Employee Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Collection Employee
                    </label>
                    <Select
                      showSearch
                      placeholder="Search Or Select Collection Agent"
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
                      className="w-full h-11">
                      <Select.Option value="">All</Select.Option>
                      {[...new Set(agents), ...new Set(admins)].map((dt) => (
                        <Select.Option
                          key={dt?._id}
                          value={`${dt._id}|${dt.selected_type}`}>
                          {dt.selected_type === "admin_type"
                            ? "Admin | "
                            : "Agent | "}
                          {dt.full_name} | {dt.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              {/* Total Amount Card */}
              <div className="mb-8">
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 transform transition-all  duration-300">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                  <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <p className="text-white/90 text-sm font-semibold uppercase tracking-wider">
                        Total Amount
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-white text-5xl font-bold tracking-tight">
                        ₹{payments?.toLocaleString() || 0}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm mt-3">
                      Based on current filters
                    </p>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12"></div>
                </div>
              </div>

              {/* Data Table Section */}
              {filteredAuction && filteredAuction.length > 0 && !isLoading ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Payment Details
                    </h2>
                  </div>

                  <DataTable
                    data={filterOption(TableDaybook, searchText)}
                    columns={columns}
                    exportedPdfName={`Receipt Report`}
                    exportedFileName={`Reports Receipt.csv`}
                  />

                  <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-3 rounded-xl">
                      <span className="text-lg font-bold text-gray-800">
                        Total Amount:{" "}
                        <span className="text-indigo-600">
                          ₹{payments?.toLocaleString()}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                  <CircularLoader
                    isLoading={isLoading}
                    failure={filteredAuction.length <= 0}
                    data="Receipt Data"
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

export default PaymentReport;
