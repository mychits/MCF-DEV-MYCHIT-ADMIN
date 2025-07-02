/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import api from "../instance/TokenInstance";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import CircularLoader from "../components/loaders/CircularLoader";
import { FaWhatsappSquare } from "react-icons/fa";
import Navbar from "../components/layouts/Navbar";
import { Select, Modal as AntModal, Drawer, Tooltip } from "antd";
import { useParams } from "react-router-dom";
import BackdropBlurLoader from "../components/loaders/BackdropBlurLoader";
import { FaReceipt } from "react-icons/fa";
import { fieldSize } from "../data/fieldSize";

const  PayOutOthers = () => {
  const { paymentType } = useParams();
  const [groups, setGroups] = useState([]);
  const [actualGroups, setActualGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [TablePayments, setTablePayments] = useState([]);
  const [selectedAuctionGroup, setSelectedAuctionGroup] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedAuctionGroupId, setSelectedAuctionGroupId] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [viewLoader, setViewLoader] = useState(false);
  const [filteredAuction, setFilteredAuction] = useState([]);
  const [groupInfo, setGroupInfo] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [currentUpdateAmount, setCurrentUpdateAmount] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [showModalView, setShowModalView] = useState(false);
  const [currentViewGroup, setCurrentViewGroup] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [receiptNo, setReceiptNo] = useState("");
  const whatsappEnable = true;
  const [paymentMode, setPaymentMode] = useState("cash");
  const today = new Date().toISOString().split("T")[0];
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [enableGroupColumn, setEnableGroupColumn] = useState(true);
  const [paymentGroupTickets, setPaymentGroupTickets] = useState([]);
  const [render, setRerender] = useState(0);
  const [openBackdropLoader, setOpenBackdropLoader] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [openAntDDrawer, setOpenAntDDrawer] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [lastThreePayments, setLastThreePayments] = useState([]);
  const [adminName, setAdminName] = useState("");
  const [showOthersField, setShowOthersField] = useState(false);
  const [disbursementType, setDisbursementType] = useState("");
  const disbursementTypes = [
    {
      key: "#1",
      title: "Auction Winning Payout",
      value: "Auction Winning Payout",
    },
    {
      key: "#2",
      title: "Chit Cancellation",
      value: "Chit Cancellation",
    },
    {
      key: "#3",
      title: "Refund to Member",
      value: "Refund to Member",
    },
    {
      key: "#4",
      title: "Foreman Commission Disbursement",
      value: "Refund to Member",
    },

    {
      key: "#6",
      title: "Reinvestment Transfer",
      value: "Reinvestment Transfer",
    },
    {
      key: "#7",
      title: "Advance Payout Before Auction",
      value: "Advance Payout Before Auction",
    },
    {
      key: "#8",
      title: "Divident Share Disbursement",
      value: "Divident Share Disbursement",
    },
    {
      key: "#9",
      title: "Group Closure Settlement",
      value: "Group Closure Settlement",
    },
    {
      key: "#10",
      title: "Emergency Withdrawal",
      value: "Emergency Withdrawal",
    },
    {
      key: "#11",
      title: "Mistaken Payment Reversal",
      value: "Mistaken Payment Reversal",
    },
    {
      key: "#12",
      title: "Others",
      value: "Others",
    },
  ];

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

    pay_date: today,
    amount: "",
    pay_type: "cash",
    transaction_id: "",
    payment_group_tickets: [],
    disbursement_type: "Auction Winning Payout",
    note: "",
  });
  const [updateFormData, setUpdateFormData] = useState({
    amount: "",
    pay_date: "",
  });
  const [modifyPayment, setModifyPayment] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const userObj = JSON.parse(user);
    setAdminName(userObj.name || "");

    if (
      userObj &&
      userObj.admin_access_right_id?.access_permissions?.edit_payment
    ) {
      const isModify =
        userObj.admin_access_right_id?.access_permissions?.edit_payment ===
        "true"
          ? true
          : false;
      setModifyPayment(isModify);
    }
  }, []);

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
        const response = await api.get(
          "/payment-out/get-payment-out-report-daybook",
          {
            params: {
              pay_date: today,
              pay_for: paymentType,
            },
          }
        );
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
              date: formatPayDate(group.pay_date),
              transaction_date: formatPayDate(group.createdAt),
              disbursed_by: group?.admin_type?.admin_name || "Super Admin",
              disbursement_type: group.disbursement_type,
              note: group.note,
            };
          });
          setTablePayments(formattedData);
          setEnableGroupColumn(true);
        } else {
          setFilteredAuction([]);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setFilteredAuction([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodaysPayments();
  }, [render]);

  const fetchLastThreeTransactions = async (event) => {
    event.preventDefault();
    setOpenAntDDrawer(true);
    if (formData.user_id && formData.payment_group_tickets) {
      try {
        setShowLoader(true);
        const response = await api.get("payment-out/get-last-n-transaction", {
          params: {
            user_id: formData.user_id,
            payment_group_tickets: paymentGroupTickets,
            limit: 3,
            pay_for: paymentType,
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
    const fetchGroups = async () => {
      try {
        const response = await api.get("/user/get-user");
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, [alertConfig]);

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
  }, [alertConfig]);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedGroupId) {
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
    if (!formData.disbursement_type) {
      newErrors.disbursement_type = "Disbursement Type is Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "disbursement_type") {
      if (value === "Others") {
        setShowOthersField(true);
        setDisbursementType("");
      } else {
        setShowOthersField(false);
      }
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevData) => ({ ...prevData, [name]: "" }));
  };

  const handlePaymentAntSelect = (value) => {
    // ✅ Now value is a string like "chit-<group_id>|<ticket>"
    setPaymentGroupTickets([value]); // Still store as array for backend compatibility

    if (value && value.startsWith("chit-")) {
      const [, entity] = value.split("-");
      const [groupId, ticket] = entity.split("|");

      // Call win amount fetch
      fetchWinAmount(formData.user_id, groupId, ticket);
    }
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

  const fetchWinAmount = async (userId, groupId, ticket) => {
    try {
      if (!userId || !groupId || !ticket) return;

      const response = await api.get(
        "/auction/get-auction-by-user-group-ticket",
        {
          params: { user_id: userId, group_id: groupId, ticket },
        }
      );

      if (response?.data?.win_amount) {
        setFormData((prev) => ({
          ...prev,
          amount: response.data.win_amount,
        }));
        console.log("✅ Win Amount Set:", response.data.win_amount);
      } else {
        console.warn("⚠️ No win amount found for user/group/ticket");
      }
    } catch (error) {
      console.error("❌ Error fetching win amount:", error);
    }
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "date", header: "Paid Date" },
    { key: "transaction_date", header: "Transaction Date" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
  ];
  if (enableGroupColumn) {
    columns.push({ key: "group_name", header: "Group Name" });
  }
  columns.push(
    { key: "ticket", header: "Ticket Number" },
    { key: "old_receipt", header: "Old Receipt" },
    { key: "receipt", header: "Receipt" },
    { key: "amount", header: "Amount" },
    { key: "disbursed_by", header: "Disbursed By" },
    { key: "disbursement_type", header: "Disbursement Type" },
    { key: "note", header: "Note" },
    { key: "action", header: "Action" }
  );
  // const handleGroup = async (event) => {
  //   const groupId = event.target.value;
  //   setSelectedGroupId(groupId);
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     user_id: groupId,
  //   }));
  //   setErrors((prevData) => ({ ...prevData, customer: "" }));

  //   handleGroupChange(groupId);
  //   handleGroupAuctionChange(groupId);

  //   if (groupId) {
  //     try {
  //       const response = await api.get(`/group/get-by-id-group/${groupId}`);
  //       setGroupInfo(response.data || {});
  //     } catch (error) {
  //       setGroupInfo({});
  //     }
  //   } else {
  //     setGroupInfo({});
  //   }
  // };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setUpdateFormData((prevData) => ({
  //     ...prevData,
  //     [name]: value,
  //   }));
  // };

  const handleCustomer = async (userId) => {
    setSelectedGroupId(userId);

    // ✅ Reset previously selected ticket & amount
    setPaymentGroupTickets([]);
    setFormData((prev) => ({
      ...prev,
      user_id: userId,
      amount: "", // 🔥 Clear previous win amount
    }));
    setErrors((prev) => ({ ...prev, customer: "" }));

    // 👇 Fetch ticket data and group info
    handleGroupChange(userId);
    handleGroupAuctionChange(userId);

    try {
      const response = await api.get(`/group/get-by-id-group/${userId}`);
      setGroupInfo(response.data || {});
    } catch (error) {
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
        url = `/payment-out/get-payment-out-report-daybook/?pay_date=${today}&pay_for=${paymentType}`;
        setEnableGroupColumn(true);
      } else {
        url = `/payment-out/get-group-payment-out/?group_id=${groupId}&pay_for=${paymentType}`;
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
              receipt: group.receipt_no,
              old_receipt: group.old_receipt_no,
              amount: group.amount,
              date: group?.pay_date.split("T")[0],
              transaction_date: group?.createdAt?.split("T")[0],
              disbursed_by: group?.admin_type?.admin_name || "Super Admin",
              disbursement_type: group?.disbursement_type,
              note: group.note,
            };
          });
          setTablePayments(formattedData);
        } else {
          setFilteredAuction([]);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setFilteredAuction([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setFilteredAuction([]);
    }
  };

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
    const isValid = validateForm();
    try {
      if (isValid) {
        setDisabled(true);
        setAlertConfig((prev) => ({
          ...prev,
          visibility: false,
        }));
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
        if (formData.disbursement_type === "Others") {
          formData.disbursement_type = disbursementType;
        }
        formData.payment_group_tickets = paymentGroupTickets;
        formData.admin_type = admin_type?._id;
        formData.pay_for = paymentType;
        setOpenBackdropLoader(true);
        console.log(formData, "formData this is formData");
        const response = await api.post(
          "/payment-out/add-payments-out",
          formData
        );

        if (response.status === 201) {
          setSelectedGroupId("");
          setPaymentGroupTickets([]);
          setDisabled(false);
          setFormData({
            user_id: "",
            pay_date: today,
            amount: "",
            pay_type: "cash",
            transaction_id: "",
            payment_group_tickets: [],
            disbursement_type: "",
            note: "",
          });
          setAlertConfig({
            visibility: true,
            noReload: true,
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
            pay_date: today,
            amount: "",
            pay_type: "cash",
            transaction_id: "",
            payment_group_tickets: [],
            disbursement_type: "",
            note: "",
          });
          setAlertConfig({
            visibility: true,
            noReload: true,
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
        pay_date: "",
        amount: "",
        pay_type: "cash",
        transaction_id: "",
        payment_group_tickets: [],
        disbursement_type: "",
        note: "",
      });
      setAlertConfig({
        visibility: true,
        noReload: true,
        message: `Error submitting payment data`,
        type: "error",
      });
      setDisabled(false);
      console.error("Error submitting payment data:", error);
    } finally {
      setOpenBackdropLoader(false);
      setRerender((prev) => prev + 1);
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

        setShowModalDelete(false);
        setCurrentGroup(null);
        setAlertConfig({
          visibility: true,
          message: "Payment deleted successfully",
          type: "success",
        });
      } catch (error) {
        console.error("Error deleting auction:", error);
      }
    }
  };

  const handleViewModalOpen = async (groupId) => {
    try {
      setLoading(true);
      setShowModalView(true);
      setCurrentGroupId(groupId);
      setViewLoader(true);
      const response = await api.get(`/payment/get-payment-by-id/${groupId}`);
      setCurrentViewGroup(response.data);
    } catch (error) {
      console.error("Error viewing Payment:", error);
    } finally {
      setLoading(false);
      setViewLoader(false);
    }
  };

  const handleUpdateModalOpen = async (groupId) => {
    try {
      const response = await api.get(`/payment/get-payment-by-id/${groupId}`);
      setCurrentUpdateAmount(response.data);
      setUpdateFormData({
        amount: response?.data?.amount,
        pay_date: response?.data?.pay_date.split("T")[0],
      });
      setShowUpdateModal(true);
    } catch (error) {
      console.error("Error fetching Payment Amount data:", error);
    }
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        `/payment/update-payment-amount/${currentUpdateAmount._id}`,
        updateFormData
      );
      setShowUpdateModal(false);

      setAlertConfig({
        visibility: true,
        message: "Payment Amount Updated Successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating Payment Amount:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setAlertConfig({
          visibility: true,
          message: `${error?.response?.data?.message}`,
          type: "error",
        });
      } else {
        setAlertConfig({
          visibility: true,
          message: "An unexpected error occurred. Please try again.",
          type: "error",
        });
      }
    }
  };
  const handleDisbursementTypeChange = (event) => {
    const { name, value } = event.target;
    setDisbursementType(value);
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
      }
    } else {
      setFilteredAuction([]);
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
              <h1 className="text-2xl font-semibold">
                <span className="text-2xl text-red-500 font-bold">
                     {" OTHER "}
                  {paymentType?.toUpperCase()}
                </span>
                {" "}
               CHIT Payments Out
              </h1>
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
                        {"Today's Payments"}
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
                        +Add Payment Out
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
                    exportedFileName={`Payments ${
                      TablePayments.length > 0
                        ? TablePayments[0].date +
                          " to " +
                          TablePayments[TablePayments.length - 1].date
                        : "empty"
                    }.csv`}
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
                <h3 className="mb-4 text-xl font-bold text-gray-900">
                  Add Payment Out
                </h3>
                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  <Drawer
                    closable
                    destroyOnHidden
                    title={<p>Last Three Transactions</p>}
                    placement="right"
                    open={openAntDDrawer}
                    loading={showLoader}
                    onClose={() => setOpenAntDDrawer(false)}
                  >
                    {lastThreePayments?.length <= 0 ? (
                      <div className="font-semibold text-center text-xl">
                        No Transaction Found
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 ">
                        {lastThreePayments.map((payment, index) => {
                          return (
                            <section
                              className="bg-white shadow-md rounded-lg p-4 space-y-2 border border-gray-200 "
                              key={index}
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
                                PayOut Amount:{" "}
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
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Customer <span className="text-red-500 ">*</span>
                    </label>

                    <Select
                      className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full ${fieldSize.height}`}
                      placeholder="Select Or Search Customer"
                      popupMatchSelectWidth={false}
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toString()
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.customer}
                      </p>
                    )}
                  </div>

                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Group & Ticket <span className="text-red-500 ">*</span>
                    </label>
                    <Select
                      // mode="multiple"
                      name="group_id"
                      placeholder="Select Group | Ticket"
                      onChange={handlePaymentAntSelect}
                      value={paymentGroupTickets}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  w-full h-14"
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
                    </Select>
                    {errors.payment_group_tickets && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.payment_group_tickets}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row justify-between space-x-4">
                    <div className="w-full">
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
                        value={formData.pay_date}
                        id="pay_date"
                        onChange={handleChange}
                        placeholder=""
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full h-14"
                      />

                      {errors.pay_date && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.pay_date}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row justify-between space-x-4">
                    <div className="w-1/2">
                      <label
                        className="block mb-2 text-sm font-medium text-gray-900"
                        htmlFor="group_value"
                      >
                        Amount <span className="text-red-500 ">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          id="amount"
                          onChange={handleChange}
                          placeholder="Enter Amount"
                          required
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                        <Tooltip title="Last 3 Transactions">
                          <button
                            className="bg-green-300 rounded-md p-2 border-2 font-semibold"
                            onClick={(e) => fetchLastThreeTransactions(e)}
                          >
                            <FaReceipt />
                          </button>
                        </Tooltip>
                      </div>

                      {errors.amount && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.amount}
                        </p>
                      )}
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
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        onChange={handlePaymentModeChange}
                      >
                        <option value="cash">Cash</option>
                        <option value="online">Online</option>
                        {modifyPayment && (
                          <>
                            <option value="suspense">Suspense</option>
                            <option value="credit">Credit</option>
                            <option value="adjustment">Adjustment</option>
                            <option value="others">Others</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                  {formData.amount && paymentGroupTickets.length > 1 && (
                    <div>
                      <label
                        className="block mb-2 text-sm font-medium text-gray-900"
                        htmlFor="pay_mode"
                      >
                        Individual Ticket Amount
                      </label>

                      <input
                        type="text"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg hover:cursor-not-allowed w-full p-2.5"
                        placeholder="totalAmount"
                        value={
                          Number(formData.amount) / paymentGroupTickets.length
                        }
                        disabled
                      />
                    </div>
                  )}
                  {paymentMode === "online" && (
                    <div className="w-full mt-4">
                      <label
                        className="block mb-2 text-sm font-medium text-gray-900"
                        htmlFor="transaction_id"
                      >
                        Transaction ID <span className="text-red-500 ">*</span>
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
                  <div className="mb-4">
                    <label className="block font-medium mb-1">
                      Disbursement Type
                    </label>
                    <input
                      type="text"
                      name="disbursement_type"
                      value={formData.disbursement_type}
                      readOnly
                      className="w-full h-12 border px-4 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {showOthersField && (
                    <>
                      <div className="w-full">
                        <label
                          className="block mb-2 text-sm font-medium text-gray-900"
                          htmlFor="othersField"
                        >
                          Others
                        </label>
                        <input
                          type="text"
                          className=" border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                          id="othersField"
                          name="disbursement_type"
                          value={disbursementType}
                          placeholder="Specify if your option is not listed above"
                          onChange={handleDisbursementTypeChange}
                        />
                      </div>
                      {errors.disbursement_type && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.disbursement_type}
                        </p>
                      )}
                    </>
                  )}
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="note"
                    >
                      Note
                    </label>
                    <textarea
                      rows={2}
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      id="note"
                      name="note"
                      value={formData.note}
                      placeholder="Note if any?"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="w-full">
                    <div className="w-full bg-blue-50 p-3 rounded-lg">
                      <label className="block mb-1 text-sm font-medium text-gray-900">
                        Disbursed By
                      </label>
                      <div className="font-semibold">{adminName}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-4 max-w-full bg-white rounded-lg shadow-sm space-y-4">
                    <div className="flex items-center space-x-1">
                      <FaWhatsappSquare color="green" className="w-8 h-8" />
                      <h2 className="text-md font-semibold text-gray-800">
                        WhatsApp
                      </h2>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={whatsappEnable}
                        className="text-green-500 checked:ring-2  checked:ring-green-700 rounded-full w-4 h-4"
                      />
                      <span className="text-gray-700 text-sm">
                        Send Via Whatsapp
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <Tooltip title="Saving Payment Out">
                      <button
                        type="submit"
                        className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
                              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                      >
                        Save Payment Out
                      </button>
                    </Tooltip>
                  </div>
                </form>
              </div>
            </Modal>
          </div>
        </div>
      )}
    </>
  );
};

export default PayOutOthers;
