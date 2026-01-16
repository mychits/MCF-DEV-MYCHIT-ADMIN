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
import { Select, Dropdown, Modal as AntModal, Drawer, Tooltip } from "antd";
import { IoMdMore } from "react-icons/io";
import { Link } from "react-router-dom";
import dataPaymentsFor from "../data/paymentsFor";
import BackdropBlurLoader from "../components/loaders/BackdropBlurLoader";
import { FaReceipt } from "react-icons/fa";
import { fieldSize } from "../data/fieldSize";
const RegistrationFee = () => {
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
  //const [showModalView, setShowModelView] = useState(false);
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
  const [paymentFor, setPaymentFor] = useState(dataPaymentsFor.typeChit);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [borrowers, setBorrowers] = useState([]);
  const [pigmeCustomers, setPigmeCustomers] = useState([]);
  const [enableGroupColumn, setEnableGroupColumn] = useState(true);
  const [paymentGroupTickets, setPaymentGroupTickets] = useState([]);
  const [render, setRerender] = useState(0);
  const [openBackdropLoader, setOpenBackdropLoader] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [openAntDDrawer, setOpenAntDDrawer] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [lastThreePayments, setLastThreePayments] = useState([]);

  const dropDownItems = (group) => {
    const dropDownItemList = [
      {
        key: "1",
        label: (
          <Link to={`/reg-fee-print/${group._id}`} className="text-blue-600 ">
            Print
          </Link>
        ),
      },
    //   {
    //     key: "2",
    //     label: (
    //       <div
    //         className="text-red-600 "
    //         onClick={() => handleDeleteModalOpen(group._id)}
    //       >
    //         Delete
    //       </div>
    //     ),
    //   },
      {
        key: "3",
        label: (
          <div
            className="text-green-600 "
            onClick={() => handleViewModalOpen(group._id)}
          >
            View
          </div>
        ),
      },
    ];
    if (modifyPayment) {
      dropDownItemList.push({
        key: "4",
        label: (
          <div
            className="text-blue-600 "
            onClick={() => handleUpdateModalOpen(group._id)}
          >
            Update Amount
          </div>
        ),
      });
    }
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
    pay_for: "",
  });
  const [updateFormData, setUpdateFormData] = useState({
    amount: "",
    pay_date: "",
  });
  // const [showPrintModal, setShowPrintModal] = useState(false);
  const [modifyPayment, setModifyPayment] = useState(false);

  const handleUploadModalClose = () => {
    setShowUploadModal(false);
  };

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
        const response = await api.get("/registration-fee/get-reg-fee-by-dates", {
          params: {
            from_date: today,
            to_date: today,
          },
        });
     
        if (response.data && response.data.length > 0) {
          const formattedData = response.data.map((group, index) => {
           //if (!group?.group_id?.group_name) return {};
           
            return {
              _id: group._id,
              id: index + 1,
              name: group?.user_id?.full_name,
              phone_number: group?.user_id?.phone_number,
            //   group_name: group?.group_id?.group_name ? `${group?.group_id?.group_name}`:
            //     group?.group_id?.group_name ? `${group?.group_id?.group_name}`: "N/A",
                group_name: group?.group_id?.group_name || group?.pay_for || "N/A",
              ticket: group.ticket,
              receipt: group.receipt_no,
              old_receipt: group.old_receipt_no,
              amount: group.amount,
              date: formatPayDate(group.pay_date),
              pay_for: group?.pay_for,
              transaction_date: formatPayDate(group.createdAt),
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

  //   const fetchLastThreeTransactions = async (event) => {
  //     event.preventDefault();
  //     setOpenAntDDrawer(true);
  //     if (formData.user_id && formData.payment_group_tickets) {
  //       try {
  //         setShowLoader(true);
  //         const response = await api.get("payment/get-last-n-transaction", {
  //           params: {
  //             user_id: formData.user_id,
  //             payment_group_tickets: paymentGroupTickets,
  //             limit: 3,
  //           },
  //         });
  //         if (response?.data) {
  //           setLastThreePayments(response.data);
  //         } else {
  //           setLastThreePayments([]);
  //         }
  //       } catch (error) {
  //         setLastThreePayments([]);
  //       } finally {
  //         setShowLoader(false);
  //       }
  //     }
  //   };

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

    useEffect(() => {
      const fetchReceipt = async () => {
        try {
          const response = await api.get("/registration-fee/get-fee-latest-receipt");
          console.info("testing",response.data);
          setReceiptNo(response.data);
        } catch (error) {
          console.error("Error fetching receipt data:", error);
        }
      };
      fetchReceipt();
    }, [alertConfig]);

    useEffect(() => {
      if (receiptNo) {
        setFormData((prevData) => ({
          ...prevData,
          receipt_no: receiptNo.receipt_no,
        }));
      }
    }, [receiptNo]);

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
    if (!formData.pay_for) {
      newErrors.pay_for = "Registration Type is required";
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = "Please enter a valid positive amount";
    }

    if (paymentMode === "online" && !formData.transaction_id?.trim()) {
      newErrors.transaction_id =
        "Transaction ID is required for online payments";
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

  const onChoosePaymentFor = (e) => {
    setPaymentFor(e.target.value);
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
    { key: "pay_for", header: "Registration Type" },
    { key: "collected_by", header: "Collected By" },
    { key: "action", header: "Action" }
  );
  const handleGroup = async (event) => {
    const groupId = event.target.value;
    setSelectedGroupId(groupId);
    setFormData((prevFormData) => ({
      ...prevFormData,
      user_id: groupId,
    }));
    setErrors((prevData) => ({ ...prevData, customer: "" }));

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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
        url = `/registration-fee/get-reg-fee-by-dates?from_date=${today}&to_date=${today}`;
        setEnableGroupColumn(true);
      } else {
        url = `/registration-fee/get-registration-group-fee-by-id/${groupId}`;
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
              pay_for: group?.pay_for,
              phone_number: group?.user_id?.phone_number,
              group_name: group?.group_id?.group_name,
              ticket: group.ticket,
              receipt: group.receipt_no,
              old_receipt: group.old_receipt_no,
              amount: group.amount,
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
  const handlePaymentFor = (e) => {
    const selectedMode = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      pay_for: selectedMode,
    }));
  };
  //   const createReceipt = async (formData) => {
  //     try {
  //       const {
  //         group_id,
  //         user_id,
  //         ticket,
  //         receipt_no,
  //         pay_date,
  //         amount,
  //         pay_type,
  //         transaction_id,
  //       } = formData;

  //       const responseUser = await api.get(`user/get-user-by-id/${user_id}`);

  //       const responseGroup = await api.get(`group/get-by-id-group/${group_id}`);

  //       if (responseUser.status === 200 && responseGroup.status === 200) {
  //         const customerName = responseUser?.data?.full_name;
  //         const groupName = responseGroup?.data?.group_name;
  //         if (customerName && groupName) {
  //           setPrintDetails((prev) => ({
  //             ...prev,
  //             customerName,
  //             groupName,
  //             ticketNumber: ticket,
  //             receiptNumber: receipt_no,
  //             paymentDate: pay_date,
  //             paymentMode: pay_type,
  //             transactionId: pay_type === "cash" ? "" : transaction_id,
  //             amount,
  //           }));
  //           // setShowPrintModal(true);
  //         }
  //       }
  //       if (responseUser.status >= 400 || responseGroup.status >= 400) {
  //         setAlertConfig({
  //           visibility: true,
  //           noReload: true,
  //           message: `Error Creating Receipt`,
  //           type: "error",
  //         });
  //       }
  //     } catch (err) {
  //       setAlertConfig({
  //         visibility: true,
  //         noReload: true,
  //         message: `Error Creating Receipt`,
  //         type: "error",
  //       });
  //     }
  //   };

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

        formData.payment_group_tickets = paymentGroupTickets;
        formData.admin_type = admin_type?._id;
        setOpenBackdropLoader(true);
        const response = await api.post(
          "/registration-fee/add-multiple-registration-fee",
          formData
        );
        if (response.status === 201) {
          setSelectedGroupId("");
          setPaymentGroupTickets([]);
          setDisabled(false);
          setFormData({
            user_id: "",
            // receipt_no: "",
            pay_date: today,
            amount: "",
            pay_type: "cash",
            transaction_id: "",
            payment_group_tickets: [],
            account_type: "",
            pay_for: "",
          });
          setAlertConfig({
            visibility: true,
            noReload: true,
            message: "registration fee Added Successfully",
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
            // receipt_no: "",
            pay_date: today,
            amount: "",
            pay_type: "cash",
            transaction_id: "",
            payment_group_tickets: [],
            account_type: "",
            pay_for: "",
          });
          setAlertConfig({
            visibility: true,
            noReload: true,
            message: "registration fee Added Failed",
            type: "error",
          });
        }
      }
    } catch (error) {
      setShowModal(false);
      setSelectedGroupId("");
      setFormData({
        user_id: "",
        receipt_no: "",
        pay_date: "",
        amount: "",
        pay_type: "cash",
        transaction_id: "",
        payment_group_tickets: [],
        account_type: "",
        pay_for: "",
      });
      setAlertConfig({
        visibility: true,
        noReload: true,
        message: `Error submitting registration fee data`,
        type: "error",
      });
      setDisabled(false);
      console.error("Error submitting registration fee data:", error);
    } finally {
      setOpenBackdropLoader(false);
      setRerender((prev) => prev + 1);
    }
  };

  //   const handleDeleteModalOpen = async (groupId) => {
  //     try {
  //       const response = await api.get(`/payment/get-payment-by-id/${groupId}`);
  //       setCurrentGroup(response.data);
  //       setShowModalDelete(true);
  //     } catch (error) {
  //       console.error("Error fetching enroll:", error);
  //     }
  //   };

  // const handleViewModalOpen = async (groupId) => {
  //   try {
  //     const response = await api.get(`/payment/get-payment-by-id/${groupId}`);
  //     setCurrentGroup(response.data);
  //     setShowModelView(true);

  //   }catch (error) {
  //     console.error("Error view Payment Details:", error);
  // }

  //   const handleDeleteAuction = async () => {
  //     if (currentGroup) {
  //       try {
  //         await api.delete(`/payment/delete-payment/${currentGroup._id}`);

  //         setShowModalDelete(false);
  //         setCurrentGroup(null);
  //         setAlertConfig({
  //           visibility: true,
  //           message: "Payment deleted successfully",
  //           type: "success",
  //         });
  //         window.location.reload();
  //       } catch (error) {
  //         console.error("Error deleting auction:", error);
  //       }
  //     }
  //   };

  const handleViewModalOpen = async (groupId) => {
    try {
      setLoading(true);
      setShowModalView(true);
      setCurrentGroupId(groupId);
      setViewLoader(true);
      const response = await api.get(
        `/registration-fee/get-registration-fee-by-id/${groupId}`
      );
      console.info("registration testing", response.data);
      setCurrentViewGroup(response.data);
    } catch (error) {
      console.error("Error viewing registration-fee:", error);
    } finally {
      setLoading(false);
      setViewLoader(false);
    }
  };

  const handleUpdateModalOpen = async (groupId) => {
    try {
      const response = await api.get(
        `/registration-fee/get-registration-fee-by-id/${groupId}`
      );
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
              <h1 className="text-2xl font-semibold">Registration Fee</h1>
              <div className="mt-6  mb-8">
                <div className="mb-10">
                  <label className="font-bold ">Search or Select Group</label>
                  <div className="flex justify-between items-center w-full mt-4">
                    <Select
                      placeholder="Today's Registration Fee"
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
                        + Add Registration Fees
                      </button>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="ml-4 bg-yellow-300 text-black px-4 py-2 rounded shadow-md hover:bg-yellow-400 transition duration-200"
                      >
                        Upload Excel
                      </button>
                    </div>
                  </div>
                </div>
                {/* <UploadModal
                show={showUploadModal}
                onClose={handleUploadModalClose}
                onSubmit={handleFileSubmit}
                groups={groups}
                selectedGroupId={selectedGroupId}
                handleGroup={handleGroup}
                handleChangeUser={handleChangeUser}
                formData={formData}
                filteredAuction={filteredAuction}
              /> */}
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
                    exportedPdfName="Registration Fees"
                    exportedFileName={`Registration Fees.csv`}
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
                  Add Registration Fees
                </h3>
                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  {/* <Drawer
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
                        {lastThreePayments.map((payment) => {
                          return (
                            <section className="bg-white shadow-md rounded-lg p-4 space-y-2 border border-gray-200 ">
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
                  </Drawer> */}
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
                      htmlFor="pay"
                    >
                      Registration Fee
                    </label>
                    <select
                      name="pay"
                      id="pay_for"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                      onChange={handlePaymentFor}
                    >
                      <option value="">Select Registration Fee Type</option>
                      <option value="Reg|Chit">Chit Registration Fee </option>
                      <option value="Reg|Pigme">Pigme Registration Fee</option>
                      <option value="Reg|Loan">Loan Registration Fee</option>
                    </select>
                  </div>

                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Group & Ticket <span className="text-red-500 ">*</span>
                    </label>
                    <Select
                      mode="multiple"
                      name="group_id"
                      placeholder="Select Group | Ticket"
                      onChange={handlePaymentAntSelect}
                      value={paymentGroupTickets}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 "
                    >
                      {formData.pay_for === "Reg|Chit" && (
                        <>
                          {filteredAuction.map((entry, index) => {
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
                        </>
                      )}
                      {formData.pay_for === "Reg|Pigme" && (
                        <>
                          {pigmeCustomers?.map((pigme) => {
                            return (
                              <Select.Option value={`pigme-${pigme._id}`}>
                                {`${pigme.pigme_id} | ₹ ${pigme.payable_amount}`}
                              </Select.Option>
                            );
                          })}
                        </>
                      )}
                      {formData.pay_for === "Reg|Loan" && (
                        <>
                          {borrowers?.map((borrower) => {
                            return (
                              <Select.Option value={`loan-${borrower._id}`}>
                                {`loan-${borrower.loan_id} | ₹ ${borrower.loan_amount}`}
                              </Select.Option>
                            );
                          })}
                        </>
                      )}
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
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
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
                  <div className="w-full flex justify-end">
                    <button
                      type="submit"
                      className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
                              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    >
                      Save Payment
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
            {/* </PaymentModal> */}

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
      )}
    </>
  );
};

export default RegistrationFee;
