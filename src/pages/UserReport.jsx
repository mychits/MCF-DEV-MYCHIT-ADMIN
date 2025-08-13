/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select } from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { useSearchParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import Fuse from "fuse.js";
const UserReport = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user_id");
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [TableDaybook, setTableDaybook] = useState([]);
  const [TableAuctions, setTableAuctions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(userId ? userId : "");
  const [group, setGroup] = useState([]);
  const [commission, setCommission] = useState("");
  const [TableEnrolls, setTableEnrolls] = useState([]);
  const [TableEnrollsDate, setTableEnrollsDate] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [groupPaid, setGroupPaid] = useState("");
  const [groupToBePaid, setGroupToBePaid] = useState("");
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [groupPaidDate, setGroupPaidDate] = useState("");
  const [groupToBePaidDate, setGroupToBePaidDate] = useState("");
  const [detailsLoading, setDetailLoading] = useState(false);
  const [basicLoading, setBasicLoading] = useState(false);
  const [dateLoading, setDateLoading] = useState(false);
  const [EnrollGroupId, setEnrollGroupId] = useState({
    groupId: "",
    ticket: "",
  });
  const [registrationFee, setRegistrationFee] = useState({
    amount: 0,
    createdAt: null,
  });
  const [visibleRows, setVisibleRows] = useState({
  row1: false,
  row2: false,
  row3: false,
  row4: false,
  row5: false,
  row6: false,
  row7: false,
  row8: false,
  row9: false,
});

// Reusable Input component
const Input = ({ label, value }) => (
  <div className="flex flex-col flex-1">
    <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      placeholder={label}
      value={value || ""}
      readOnly
      className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
    />
  </div>
);
  const [TotalToBepaid, setTotalToBePaid] = useState("");
  const [Totalpaid, setTotalPaid] = useState("");
  const [Totalprofit, setTotalProfit] = useState("");

  const [NetTotalprofit, setNetTotalProfit] = useState("");
  const [selectedAuctionGroupId, setSelectedAuctionGroupId] = useState(
    userId ? userId : ""
  );
  const [filteredAuction, setFilteredAuction] = useState([]);
  const [groupInfo, setGroupInfo] = useState({});

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState(
    userId ? userId : ""
  );
  const [payments, setPayments] = useState([]);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [screenLoading, setScreenLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("groupDetails");
  const [searchText, setSearchText] = useState("");
  const [groupDetails, setGroupDetails] = useState(" ");
  const [loanCustomers, setLoanCustomers] = useState([]);
  const [borrowersData, setBorrowersData] = useState([]);
  const [borrowerId, setBorrowerId] = useState("No");
  const [filteredBorrowerData, setFilteredBorrowerData] = useState([]);
  const [filteredDisbursement, setFilteredDisbursement] = useState([]);
  const [disbursementLoading, setDisbursementLoading] = useState(false);
  const [registrationAmount, setRegistrationAmount] = useState(null);
  const [registrationDate, setRegistrationDate] = useState(null);
  const [finalPaymentBalance, setFinalPaymentBalance] = useState(0);
  const onGlobalSearchChangeHandler = (e) => {
    setSearchText(e.target.value);
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
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

  const BasicLoanColumns = [
    { key: "id", header: "SL. NO" },
    { key: "pay_date", header: "Payment Date" },
    { key: "receipt_no", header: "Receipt No" },
    { key: "amount", header: "Amount" },
    { key: "pay_type", header: "Payment Type" },
    { key: "balance", header: "Balance" },
  ];
  const DisbursementColumns = [
    { key: "id", header: "SL. NO" },
    { key: "pay_date", header: "Disbursed Date" },
    { key: "transaction_date", header: "Transaction Date" },
    { key: "ticket", header: "Ticket" },
    { key: "amount", header: "Amount" },
    { key: "receipt_no", header: "Receipt No" },
    { key: "pay_type", header: "Payment Type" },
    { key: "disbursement_type", header: "Disbursement Type" },
    { key: "disbursed_by", header: "Disbursed By" },
    { key: "balance", header: "Balance" },
  ];

  useEffect(() => {
    const fetchRegistrationFee = async () => {
      if (
        activeTab === "basicReport" &&
        selectedGroup &&
        EnrollGroupId.groupId &&
        EnrollGroupId.ticket &&
        EnrollGroupId.groupId !== "Loan"
      ) {
        try {
          setTableEnrolls([]);
          setGroupPaid("");
          setGroupToBePaid("");
          setRegistrationAmount(null);
          setRegistrationDate(null);
          setBasicLoading(true);
          setIsLoading(true);

          const response = await api.get(
            "/enroll/get-user-registration-fee-report",
            {
              params: {
                group_id: EnrollGroupId.groupId,
                ticket: EnrollGroupId.ticket,
                user_id: selectedGroup,
              },
            }
          );

          const { payments = [], registrationFees = [] } = response.data || {};

          setGroupPaid(payments[0]?.groupPaidAmount || 0);
          setGroupToBePaid(payments[0]?.totalToBePaidAmount || 0);

          let balance = 0;
          const formattedData = payments.map((payment, index) => {
            balance += Number(payment.amount || 0);
            return {
              _id: payment._id,
              id: index + 1,
              date: formatPayDate(payment?.pay_date),
              amount: payment.amount,
              receipt: payment.receipt_no,
              old_receipt: payment.old_receipt_no,
              type: payment.pay_type,
              balance,
            };
          });

          let totalRegAmount = 0;
          registrationFees.forEach((regFee, idx) => {
            formattedData.push({
              id: "-",
              date: regFee.createdAt
                ? new Date(regFee.createdAt).toLocaleDateString("en-GB")
                : "",
              amount: regFee.amount,
              receipt: regFee.receipt_no,
              old_receipt: "-",
              type: regFee.pay_for || "Reg Fee",
              balance: "-",
            });

            totalRegAmount += Number(regFee.amount || 0);
          });

          setRegistrationAmount(totalRegAmount);

          if (registrationFees.length > 0) {
            setRegistrationDate(
              registrationFees[0]?.createdAt
                ? new Date(registrationFees[0].createdAt).toLocaleDateString(
                    "en-GB"
                  )
                : null
            );
          }

          if (formattedData.length > 0) {
            formattedData.push({
              id: "",
              date: "",
              amount: "",
              receipt: "",
              old_receipt: "",
              type: "TOTAL",
              balance,
            });
            setFinalPaymentBalance(balance);
          } else {
            setFinalPaymentBalance(0);
          }

          setTableEnrolls(formattedData);
        } catch (error) {
          console.error("Error fetching registration fee and payments:", error);
          setTableEnrolls([]);
          setGroupPaid("");
          setGroupToBePaid("");
          setRegistrationAmount(null);
          setRegistrationDate(null);
        } finally {
          setBasicLoading(false);
          setIsLoading(false);
        }
      } else {
        setTableEnrolls([]);
        setGroupPaid("");
        setGroupToBePaid("");
        setRegistrationAmount(null);
        setRegistrationDate(null);
      }
    };

    fetchRegistrationFee();
  }, [activeTab, selectedGroup, EnrollGroupId.groupId, EnrollGroupId.ticket]);

  useEffect(() => {
    const fetchAllLoanPaymentsbyId = async () => {
      setBorrowersData([]);
      setBasicLoading(true);

      try {
        const response = await api.get(
          `/loan-payment/get-all-loan-payments/${EnrollGroupId.ticket}`
        );

        if (response.data && response.data.length > 0) {
          let balance = 0;
          const formattedData = response.data.map((loanPayment, index) => {
            balance += Number(loanPayment.amount);
            return {
              _id: loanPayment._id,
              id: index + 1,
              pay_date: formatPayDate(loanPayment?.pay_date),
              amount: loanPayment.amount,
              receipt_no: loanPayment.receipt_no,
              pay_type: loanPayment.pay_type,
              balance,
            };
          });
          formattedData.push({
            _id: "",
            id: "",
            pay_date: "",
            receipt_no: "",
            amount: "",
            pay_type: "",
            balance,
          });
          setBorrowersData(formattedData);
        } else {
          setBorrowersData([]);
        }
      } catch (error) {
        console.error("Error fetching loan payment data:", error);
        setBorrowersData([]);
      } finally {
        setBasicLoading(false);
      }
    };

    if (EnrollGroupId.groupId === "Loan") fetchAllLoanPaymentsbyId();
  }, [EnrollGroupId.ticket]);

  useEffect(() => {
    const fetchGroupById = async () => {
      try {
        const response = await api.get(
          `/group/get-by-id-group/${EnrollGroupId.groupId}`
        );
        if (response.status >= 400) throw new Error("API ERROR");
        setGroupDetails(response.data);
      } catch (err) {
        console.log("Failed to fetch group details by ID:", err.message);
      }
    };
    if (EnrollGroupId.groupId !== "Loan") fetchGroupById();
  }, [EnrollGroupId?.ticket]);

  useEffect(() => {
    setScreenLoading(true);

    const fetchGroups = async () => {
      setDetailLoading(true);
      try {
        const response = await api.get("/user/get-user");
        setGroups(response.data);
        setScreenLoading(false);
        setDetailLoading(false);
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchBorrower = async () => {
      try {
        setLoanCustomers([]);
        const response = await api.get(
          `/loans/get-borrower-by-user-id/${selectedGroup}`
        );
        if (response.data) {
          const filteredBorrowerData = response.data.map((loan, index) => ({
            sl_no: index + 1,
            loan: loan.loan_id,
            loan_amount: loan.loan_amount,
            tenure: loan.tenure,
            service_charge: loan.service_charges,
          }));
          setFilteredBorrowerData(filteredBorrowerData);
        }
        setLoanCustomers(response.data);

        if (response.status >= 400) throw new Error("Failed to send message");
      } catch (err) {
        console.log("failed to fetch loan customers", err.message);
        setFilteredBorrowerData([]);
      }
    };
    setBorrowersData([]);
    setBorrowerId("No");
    fetchBorrower();
  }, [selectedGroup]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get(`/user/get-user-by-id/${selectedGroup}`);
        setGroup(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, [selectedGroup]);

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
  // disbursement report

  useEffect(() => {
    const fetchDisbursement = async () => {
      try {
        setDisbursementLoading(true);
        const response = await api.get(
          `/payment-out/get-payment-out-report-daybook`,
          {
            params: {
              userId: selectedGroup,
            },
          }
        );

        if (response.data) {
          const formattedData = response.data.map((payment, index) => {
            let balance = 0;

            balance += Number(payment.amount);
            return {
              _id: payment._id,
              id: index + 1,
              disbursement_type: payment.disbursement_type,
              pay_date: formatPayDate(payment?.pay_date),
              ticket: payment.ticket,
              transaction_date: formatPayDate(payment.createdAt),
              amount: payment.amount,
              receipt_no: payment.receipt_no,
              pay_type: payment.pay_type,
              disbursed_by: payment.admin_type?.name,
              balance,
            };
          });

          setFilteredDisbursement(formattedData);
        } else {
          setFilteredDisbursement([]);
        }
      } catch (error) {
        console.error("Error fetching disbursement data", error, error.message);
        setFilteredDisbursement([]);
      } finally {
        setDisbursementLoading(false);
      }
    };
    if (selectedGroup) fetchDisbursement();
  }, [selectedGroup]);

  const handleGroupPayment = async (groupId) => {
    setSelectedAuctionGroupId(groupId);
    setSelectedGroup(groupId);
    handleGroupAuctionChange(groupId);
  };
  useEffect(() => {
    if (userId) {
      handleGroupPayment(userId);
    }
  }, []);
  const handleEnrollGroup = (event) => {
    const value = event.target.value;

    if (value) {
      const [groupId, ticket] = value.split("|");
      setEnrollGroupId({ groupId, ticket });
    } else {
      setEnrollGroupId({ groupId: "", ticket: "" });
    }
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get(`/payment/get-report-daybook`, {
          params: {
            pay_date: selectedDate,
            groupId: selectedAuctionGroupId,
            userId: selectedCustomers,
            pay_type: selectedPaymentMode,
          },
        });

        if (response.data && response.data.length > 0) {
          setFilteredAuction(response);
          const paymentData = response.data;
          const totalAmount = paymentData.reduce(
            (sum, payment) => sum + Number(payment.amount || 0),
            0
          );
          setPayments(totalAmount);
          const formattedData = response.data.map((group, index) => ({
            id: index + 1,
            group: group.group_id.group_name,
            name: group.user_id?.full_name,
            phone_number: group.user_id.phone_number,
            ticket: group.ticket,
            amount: group.amount,
            mode: group.pay_type,
          }));
          setTableDaybook(formattedData);
        } else {
          setFilteredAuction([]);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setFilteredAuction([]);
        setPayments(0);
      }
    };

    fetchPayments();
  }, [
    selectedAuctionGroupId,
    selectedDate,
    selectedPaymentMode,
    selectedCustomers,
  ]);
  const loanColumns = [
    { key: "sl_no", header: "SL. No" },
    { key: "loan", header: "Loan ID" },
    { key: "loan_amount", header: "Loan Amount" },
    { key: "service_charge", header: "Service Charge" },
    { key: "tenure", header: "Tenure" },
  ];
  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "group", header: "Group Name" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "ticket", header: "Ticket" },
    { key: "amount", header: "Amount" },
    { key: "mode", header: "Payment Mode" },
  ];

  const handleGroupAuctionChange = async (groupId) => {
    setFilteredAuction([]);
    if (groupId) {
      try {
        const response = await api.post(
          `/enroll/get-user-refer-report/${groupId}`
        );

        if (response.data && response.data.length > 0) {
          setFilteredAuction(response.data);

          const formattedData = response.data
            .map((group, index) => {
              const groupName = group?.enrollment?.group?.group_name || "";
              const tickets = group?.enrollment?.tickets || "";
              const groupType = group?.enrollment?.group?.group_type;
              const groupInstall =
                parseInt(group?.enrollment?.group?.group_install) || 0;
              const auctionCount = parseInt(group?.auction?.auctionCount) || 0;
              const totalPaidAmount = group?.payments?.totalPaidAmount || 0;
              const totalProfit = group?.profit?.totalProfit || 0;
              const totalPayable = group?.payable?.totalPayable || 0;
              const firstDividentHead =
                group?.firstAuction?.firstDividentHead || 0;

              if (!group?.enrollment?.group) {
                return null;
              }

              return {
                id: index + 1,
                group: groupName,
                ticket: tickets,

                totalBePaid:
                  groupType === "double"
                    ? groupInstall * auctionCount + groupInstall
                    : totalPayable + groupInstall + totalProfit,

                profit: totalProfit,

                toBePaidAmount:
                  groupType === "double"
                    ? groupInstall * auctionCount + groupInstall
                    : totalPayable + groupInstall + firstDividentHead,

                paidAmount: totalPaidAmount,

                balance:
                  groupType === "double"
                    ? groupInstall * auctionCount +
                      groupInstall -
                      totalPaidAmount
                    : totalPayable +
                      groupInstall +
                      firstDividentHead -
                      totalPaidAmount,
                referred_type: group?.enrollment?.referred_type || "N/A",
                referrer_name: group?.enrollment?.referrer_name || "N/A",
              };
            })
            .filter((item) => item !== null);

          setTableAuctions(formattedData);
          setCommission(0);

          const totalToBePaidAmount = formattedData.reduce((sum, group) => {
            return sum + (group?.totalBePaid || 0);
          }, 0);
          setTotalToBePaid(totalToBePaidAmount);

          const totalNetToBePaidAmount = formattedData.reduce((sum, group) => {
            return sum + (group?.toBePaidAmount || 0);
          }, 0);
          setNetTotalProfit(totalNetToBePaidAmount);

          const totalPaidAmount = response.data.reduce(
            (sum, group) => sum + (group?.payments?.totalPaidAmount || 0),
            0
          );
          setTotalPaid(totalPaidAmount);

          const totalProfit = response.data.reduce(
            (sum, group) => sum + (group?.profit?.totalProfit || 0),
            0
          );
          setTotalProfit(totalProfit);
        } else {
          setFilteredAuction([]);
          setCommission(0);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        setFilteredAuction([]);
        setCommission(0);
      }
    } else {
      setFilteredAuction([]);
      setCommission(0);
    }
  };
  useEffect(() => {
    if (userId) {
      handleGroupAuctionChange(userId);
    }
  }, []);
  const Auctioncolumns = [
    { key: "id", header: "SL. NO" },
    { key: "group", header: "Group Name" },
    { key: "ticket", header: "Ticket" },
    { key: "referred_type", header: "Referrer Type" },
    { key: "referrer_name", header: "Referred By" },
    { key: "totalBePaid", header: "Amount to be Paid" },
    { key: "profit", header: "Profit" },
    { key: "toBePaidAmount", header: "Net To be Paid" },
    { key: "paidAmount", header: "Amount Paid" },
    { key: "balance", header: "Balance" },
  ];

  const formatPayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchEnroll = async () => {
      setTableEnrolls([]);
      setBasicLoading(true);

      try {
        setIsLoading(true);
        const response = await api.get(
          `/enroll/get-user-payment?group_id=${EnrollGroupId.groupId}&ticket=${EnrollGroupId.ticket}&user_id=${selectedGroup}`
        );

        if (response.data && response.data.length > 0) {
          setFilteredUsers(response.data);

          const Paid = response.data;
          setGroupPaid(Paid[0].groupPaidAmount);

          const toBePaid = response.data;
          setGroupToBePaid(toBePaid[0].totalToBePaidAmount);

          let balance = 0;
          const formattedData = response.data.map((group, index) => {
            balance += Number(group.amount);
            return {
              _id: group._id,
              id: index + 1,
              date: formatPayDate(group?.pay_date),
              amount: group.amount,
              receipt: group.receipt_no,
              old_receipt: group.old_receipt_no,
              type: group.pay_type,
              balance,
            };
          });
          formattedData.push({
            id: "",
            date: "",
            amount: "",
            receipt: "",
            old_receipt: "",
            type: "",
            balance,
          });

          setTableEnrolls(formattedData);
        } else {
          setFilteredUsers([]);
          setTableEnrolls([]);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        setFilteredUsers([]);
        setTableEnrolls([]);
      } finally {
        setBasicLoading(false);
        setIsLoading(false);
      }
    };
    if (EnrollGroupId.groupId !== "Loan") fetchEnroll();
  }, [selectedGroup, EnrollGroupId.groupId, EnrollGroupId.ticket]);

  const Basiccolumns = [
    { key: "id", header: "SL. NO" },
    { key: "date", header: "Date" },
    { key: "amount", header: "Amount" },
    { key: "receipt", header: "Receipt No" },
    { key: "old_receipt", header: "Old Receipt No" },
    { key: "type", header: "Payment Type" },
    { key: "balance", header: "Balance" },
  ];

  const formatDate = (dateString) => {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  };
  const formattedFromDate = formatDate(fromDate);
  const formattedToDate = formatDate(toDate);

  useEffect(() => {
    const fetchEnroll = async () => {
      try {
        const response = await api.get(
          `/group-report/get-group-enroll-date/${selectedGroup}?fromDate=${formattedFromDate}&toDate=${formattedToDate}`
        );
        if (response.data && response.data.length > 0) {
          setFilteredUsers(response.data);

          const Paid = response.data;
          setGroupPaidDate(Paid[0].groupPaidAmount || 0);

          const toBePaid = response.data;
          setGroupToBePaidDate(toBePaid[0].totalToBePaidAmount);

          const totalAmount = response.data.reduce(
            (sum, group) => sum + parseInt(group.amount),
            0
          );
          setTotalAmount(totalAmount);
          const formattedData = response.data.map((group, index) => ({
            id: index + 1,
            name: group?.user?.full_name,
            phone_number: group?.user?.phone_number,
            ticket: group.ticket,
            amount_to_be_paid:
              parseInt(group.group.group_install) + group.totalToBePaidAmount,
            amount_paid: group.totalPaidAmount,
            amount_balance:
              parseInt(group.group.group_install) +
              group.totalToBePaidAmount -
              group.totalPaidAmount,
          }));
          setTableEnrollsDate(formattedData);
        } else {
          setFilteredUsers([]);
          setTotalAmount(0);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        setFilteredUsers([]);
        setTotalAmount(0);
      }
    };
    fetchEnroll();
  }, [selectedGroup, formattedFromDate, formattedToDate]);

  const Datecolumns = [
    { key: "id", header: "SL. NO" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "ticket", header: "Ticket" },
    { key: "amount_to_be_paid", header: "Amount to be Paid" },
    { key: "amount_paid", header: "Amount Paid" },
    { key: "amount_balance", header: "Amount Balance" },
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

  useEffect(() => {
    if (selectedGroup) {
      api
        .post(`/enroll/get-next-tickets/${selectedGroup}`)
        .then((response) => {
          setAvailableTickets(response.data.availableTickets || []);
        })
        .catch((error) => {
          console.error("Error fetching available tickets:", error);
        });
    } else {
      setAvailableTickets([]);
    }
  }, [selectedGroup]);
  if (screenLoading)
    return (
      <div className="w-screen m-24">
        <CircularLoader color="text-green-600" />
      </div>
    );

  return (
    <>
      <div className="w-screen min-h-screen">
        <div className="flex mt-30">
          <Navbar
            onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
            visibility={true}
          />
          <div className="flex-grow p-7">
            <h1 className="text-2xl font-bold text-center">
              Reports - Customer
            </h1>
            <div className="mt-6 mb-8">
              <div className="mb-2">
                <div className="flex justify-center items-center w-full gap-4 bg-blue-50    p-2 w-30 h-40  rounded-3xl  border   space-x-2  ">
                  <div className="mb-2">
                    <label
                      className="block text-lg text-gray-500 text-center  font-semibold mb-2"
                      htmlFor={"SS"}
                    >
                      Customer
                    </label>
                    <Select
                      id="SS"
                      value={selectedAuctionGroupId || undefined}
                      onChange={handleGroupPayment}
                      showSearch
                      popupMatchSelectWidth={false}
                      placeholder="Search or Select Customer"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{ height: "50px", width: "600px" }}
                    >
                      {groups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.full_name} - {group.phone_number}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
              {selectedGroup && (
                <>
                  <div className="mt-6 mb-8">
                    <div className="flex justify-start border-b border-gray-300 mb-4">
                      <button
                        className={`px-6 py-2 font-medium ${
                          activeTab === "groupDetails"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleTabChange("groupDetails")}
                      >
                        Customer Details
                      </button>
                      <button
                        className={`px-6 py-2 font-medium ${
                          activeTab === "basicReport"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleTabChange("basicReport")}
                      >
                        Customer Ledger
                      </button>

                      <button
                        className={`px-6 py-2 font-medium ${
                          activeTab === "disbursement"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleTabChange("disbursement")}
                      >
                        PayOut | Disbursement
                      </button>
                    </div>

                    {activeTab === "groupDetails" && (
                      <>
                        {detailsLoading ? (
                          <p>loading...</p>
                        ) : (
                          <div className="mt-10">
                            <div className="mb-4">
                              <div className="relative w-full max-w-lg  ">
                                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 ">
                                  <FiSearch className="text-xl" />
                                </span>
                                <input
                                  type="text"
                                  placeholder="Search customer details..."
                                  className="w-full pl-12 pr-5 py-3.5 text-gray-800 bg-white border border-gray-200 rounded-full shadow-3xl 
                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 
                   transition-all duration-300 ease-in-out text-sm md:text-base"
                                  value={searchText}
                                  onChange={(e) =>
                                    setSearchText(e.target.value)
                                  }
                                />
                              </div>

                              {searchText &&
                                (() => {
                                  const detailsArray = [
                                    { key: "Name", value: group.full_name },
                                    { key: "Email", value: group.email },
                                    { key: "Phone", value: group.phone_number },
                                    {
                                      key: "Alternate Number",
                                      value: group.alternate_number,
                                    },
                                    { key: "Address", value: group.address },
                                    { key: "Aadhaar", value: group.adhaar_no },
                                    { key: "PAN", value: group.pan_no },
                                    { key: "Pincode", value: group.pincode },
                                    {
                                      key: "Father Name",
                                      value: group.father_name,
                                    },
                                    {
                                      key: "Nominee Name",
                                      value: group.nominee_name,
                                    },
                                    {
                                      key: "Bank Name",
                                      value: group.bank_name,
                                    },
                                    {
                                      key: "Bank Account",
                                      value: group.bank_account_number,
                                    },
                                  ];

                                  const fuse = new Fuse(detailsArray, {
                                    keys: ["key", "value"],
                                    threshold: 0.3, // Fuzzy match
                                  });

                                  const results = fuse.search(searchText);

                                  return (
                                    <div className="mt-2 bg-white border rounded shadow p-3 w-1/2">
                                      {results.length > 0 ? (
                                        results.map(({ item }) => (
                                          <div
                                            key={item.key}
                                            className="p-1 border-b"
                                          >
                                            <strong>{item.key}</strong> →{" "}
                                            {item.value || "-"}
                                          </div>
                                        ))
                                      ) : (
                                        <p>No matching details</p>
                                      )}
                                    </div>
                                  );
                                })()}
                            </div>

      <div className="mt-5">
  {/* Toggle Buttons */}
  <div className="flex flex-wrap gap-4 mb-6">
    <button
      onClick={() => setVisibleRows((prev) => ({ ...prev, row1: !prev.row1 }))}
      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out
        ${visibleRows.row1
          ? "bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg"
          : "bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md hover:shadow-lg hover:scale-105"}
      `}
    >
      {visibleRows.row1 ? "✓ Hide Basic Info" : "Show Basic Info"}
    </button>

    <button
      onClick={() => setVisibleRows((prev) => ({ ...prev, row2: !prev.row2 }))}
      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out
        ${visibleRows.row2
          ? "bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg"
          : "bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md hover:shadow-lg hover:scale-105"}
      `}
    >
      {visibleRows.row2 ? "✓ Hide Address Info" : "Show Address Info"}
    </button>

    <button
      onClick={() => setVisibleRows((prev) => ({ ...prev, row3: !prev.row3 }))}
      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out
        ${visibleRows.row3
          ? "bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg"
          : "bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md hover:shadow-lg hover:scale-105"}
      `}
    >
      {visibleRows.row3 ? "✓ Hide Regional Info" : "Show Regional Info"}
    </button>

    <button
      onClick={() => setVisibleRows((prev) => ({ ...prev, row4: !prev.row4 }))}
      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out
        ${visibleRows.row4
          ? "bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg"
          : "bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md hover:shadow-lg hover:scale-105"}
      `}
    >
      {visibleRows.row4
        ? "✓ Hide Referral, Nominee & Bank Details"
        : "Show Referral, Nominee & Bank Details"}
    </button>
  </div>

  {/* Row 1: Basic Info */}
  {visibleRows.row1 && (
    <div className="flex gap-8 mb-6">
      <div className="flex flex-col w-full gap-4">
        <Input label="Name" value={group.full_name} />
        <Input label="Email" value={group.email} />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Input label="Phone Number" value={group.phone_number} />
        <Input label="Adhaar Number" value={group.adhaar_no} />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Input label="PAN Number" value={group.pan_no} />
        <Input label="Pincode" value={group.pincode} />
      </div>
    </div>
  )}

  {/* Row 2: Address Info */}
  {visibleRows.row2 && (
    <div className="flex gap-8 mb-6">
      <div className="flex flex-col gap-4 w-full">
        <Input label="Address" value={group.address} />
        <Input label="Gender" value={group.gender} />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Input
          label="Date of Birth"
          value={
            group.dateofbirth
              ? new Date(group.dateofbirth).toISOString().split("T")[0]
              : ""
          }
        />
        <Input
          label="Collection Area"
          value={group?.collection_area?.route_name}
        />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Input label="Marital Status" value={group.marital_status} />
        <Input label="Father Name" value={group.father_name} />
      </div>
    </div>
  )}

  {/* Row 3: Regional Info */}
  {visibleRows.row3 && (
    <div className="flex gap-8 mb-6">
      <div className="flex flex-col gap-4 w-full">
        <Input label="Nationality" value={group.nationality} />
        <Input label="Village" value={group.village} />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Input label="Taluk" value={group.taluk} />
        <Input label="District" value={group.district} />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Input label="State" value={group.state} />
        <Input label="Alternate Number" value={group.alternate_number} />
      </div>
    </div>
  )}

  {/* Row 4: Referral, Nominee & Bank Info */}
  {visibleRows.row4 && (
    <div className="flex gap-8 mb-6">
      <div className="flex flex-col gap-4 w-full">
        <Input label="Referral Name" value={group.referral_name} />
        <Input label="Nominee Name" value={group.nominee_name} />
        <Input
          label="Nominee DOB"
          value={
            group.nominee_dateofbirth
              ? new Date(group.nominee_dateofbirth).toISOString().split("T")[0]
              : ""
          }
        />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Input
          label="Nominee Phone Number"
          value={group.nominee_phone_number}
        />
        <Input
          label="Nominee Relationship"
          value={group.nominee_relationship}
        />
        <Input label="Bank Name" value={group.bank_name} />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Input label="Bank Branch Name" value={group.bank_branch_name} />
        <Input label="Bank Account Number" value={group.bank_account_number} />
        <Input label="Bank IFSC Code" value={group.bank_IFSC_code} />
      </div>
    </div>
  )}
</div>






                            <div className="mt-10">
                              <h3 className="text-lg font-medium mb-4">
                                Enrolled Groups
                              </h3>
                              {/* Changed conditional to check TableAuctions directly, as it's the formatted data */}
                              {TableAuctions &&
                              TableAuctions.length > 0 &&
                              !isLoading ? (
                                <div className="mt-5">
                                  <DataTable
                                    data={filterOption(
                                      TableAuctions, // Use TableAuctions for display
                                      searchText
                                    )}
                                    columns={Auctioncolumns}
                                    exportedPdfName={`Customer Report`}
                                    printHeaderKeys={[
                                  "Customer Name",
                                  "Phone Number",
                                  "Total Amount To Be Paid",
                                  "Total Profit",
                                  "Total Net To be Paid",
                                  "Total Balance"
                                ]}
                                printHeaderValues={[
                                  group.full_name,
                                  group?.phone_number,
                                  TotalToBepaid,
                                  Totalprofit,
                                  NetTotalprofit,
                                   NetTotalprofit && Totalpaid
                                      ? NetTotalprofit - Totalpaid
                                      : "",
                                ]}
                                    exportedFileName={`CustomerReport-${
                                      TableAuctions.length > 0
                                        ? TableAuctions[0].date +
                                          " to " +
                                          TableAuctions[
                                            TableAuctions.length - 1
                                          ].date
                                        : "empty"
                                    }.csv`}
                                  />
                                  {/* yes you can */}
                                  {filteredBorrowerData.length > 0 && (
                                    <div className="mt-10">
                                      <h3 className="text-lg font-medium mb-4">
                                        Loan Details
                                      </h3>
                                      <DataTable
                                        data={filteredBorrowerData}
                                        columns={loanColumns}
                                        exportedFileName={`CustomerReport.csv`}
                                      />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <CircularLoader isLoading={isLoading} />
                              )}
                              {/* Display "No Data" if not loading and TableAuctions is empty */}
                              {!isLoading && TableAuctions.length === 0 && (
                                <div className="p-40 w-full flex justify-center items-center">
                                  No Enrolled Group Data Found
                                </div>
                              )}
                            </div>
                            <div className="flex gap-4 mt-5">
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Total Amount to be Paid
                                </label>
                                <input
                                  type="text"
                                  placeholder="-"
                                  value={TotalToBepaid || ""} // Default to empty string
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Total Profit
                                </label>
                                <input
                                  type="text"
                                  placeholder="-"
                                  value={Totalprofit || ""} // Default to empty string
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Total Net To be Paid
                                </label>
                                <input
                                  type="text"
                                  placeholder="-"
                                  value={NetTotalprofit || ""} // Default to empty string
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Total Amount Paid
                                </label>
                                <input
                                  type="text"
                                  placeholder="-"
                                  value={Totalpaid || ""} // Default to empty string
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Total Balance
                                </label>
                                <input
                                  type="text"
                                  placeholder="-"
                                  value={
                                    NetTotalprofit && Totalpaid
                                      ? NetTotalprofit - Totalpaid
                                      : ""
                                  } // Calculate only if both are numbers
                                  readOnly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === "basicReport" && (
                      <>
                        <div>
                          <div className="flex gap-4">
                            <div className="flex flex-col flex-1">
                              <label className="mb-1 text-sm font-medium text-gray-700">
                                Groups and Tickets
                              </label>
                              <select
                                value={
                                  EnrollGroupId.groupId
                                    ? `${EnrollGroupId.groupId}|${EnrollGroupId.ticket}`
                                    : ""
                                }
                                onChange={handleEnrollGroup}
                                className="border border-gray-300 rounded px-6 py-2 shadow-sm outline-none w-full max-w-md"
                              >
                                <option value="">Select Group | Ticket</option>
                                {filteredAuction.map((group) => {
                                  if (group?.enrollment?.group) {
                                    return (
                                      <option
                                        key={group.enrollment.group._id}
                                        value={`${group.enrollment.group._id}|${group.enrollment.tickets}`}
                                      >
                                        {group.enrollment.group.group_name} |{" "}
                                        {group.enrollment.tickets}
                                      </option>
                                    );
                                  }
                                  return null;
                                })}
                                {loanCustomers.map((loan) => (
                                  <option
                                    key={loan._id}
                                    value={`Loan|${loan._id}`}
                                  >
                                    {`${loan.loan_id} | ₹${loan.loan_amount}`}
                                  </option>
                                ))}
                                {registrationFee.amount > 0 && (
                                  <div className="mt-6 p-4 border rounded bg-gray-100 w-fit text-gray-800 shadow">
                                    <p className="text-sm font-semibold">
                                      Registration Fee Info
                                    </p>
                                    <p>
                                      <strong>Amount:</strong> ₹
                                      {registrationFee.amount}
                                    </p>
                                    <p>
                                      <strong>Date:</strong>{" "}
                                      {registrationFee.createdAt
                                        ? new Date(
                                            registrationFee.createdAt
                                          ).toLocaleDateString("en-GB")
                                        : "N/A"}
                                    </p>
                                  </div>
                                )}
                              </select>
                            </div>
                            <div className="mt-6 flex justify-center gap-8 flex-wrap">
                              <input
                                type="text"
                                value={`Registration Fee: ₹${
                                  registrationAmount || 0
                                }`}
                                readOnly
                                className="px-4 py-2 border rounded font-semibold w-60 text-center bg-green-100 text-green-800 border-green-400"
                              />

                              <input
                                type="text"
                                value={`Payment Balance: ₹${finalPaymentBalance}`}
                                readOnly
                                className="px-4 py-2 border rounded font-semibold w-60 text-center bg-blue-100 text-blue-800 border-blue-400"
                              />

                              <input
                                type="text"
                                value={`Total: ₹${
                                  Number(finalPaymentBalance) +
                                  Number(registrationAmount || 0)
                                }`}
                                readOnly
                                className="px-4 py-2 border rounded font-semibold w-60 text-center bg-purple-100 text-purple-800 border-purple-400"
                              />
                            </div>
                          </div>

                          {(TableEnrolls && TableEnrolls.length > 0) ||
                          (borrowersData.length > 0 && !basicLoading) ? (
                            <div className="mt-10">
                              <DataTable
                              exportedPdfName="Customer Ledger Report"
                                printHeaderKeys={[
                                  "Customer Name",
                                  "Customer Id",
                                  "Phone Number",
                                  "Ticket Number",
                                  "Group Name",
                                  "Start Date",
                                  "End Date",
                                ]}
                                printHeaderValues={[
                                  group.full_name,
                                  group.customer_id,
                                  group.phone_number,
                                  EnrollGroupId.ticket,
                                  groupDetails.group_name,
                                  new Date(
                                    groupDetails.start_date
                                  ).toLocaleDateString("en-GB"),
                                  new Date(
                                    groupDetails.end_date
                                  ).toLocaleDateString("en-GB"),
                                ]}
                                data={
                                  EnrollGroupId.groupId === "Loan"
                                    ? borrowersData
                                    : TableEnrolls
                                }
                                columns={
                                  EnrollGroupId.groupId === "Loan"
                                    ? BasicLoanColumns
                                    : Basiccolumns
                                }
                              />
                            </div>
                          ) : (
                            <CircularLoader isLoading={basicLoading} />
                          )}
                        </div>
                      </>
                    )}
                    {activeTab === "disbursement" && (
                      <div className="flex flex-col flex-1">
                        <label className="mb-1 text-sm  text-gray-700 font-bold">
                          Disbursement
                        </label>

                        {disbursementLoading ? (
                          <CircularLoader />
                        ) : filteredDisbursement?.length > 0 ? (
                          <div className="mt-10">
                            <DataTable
                              data={filteredDisbursement}
                              columns={DisbursementColumns}
                              exportedPdfName={`Customer Payout Report`}
                                    printHeaderKeys={[
                                  "Customer Name",
                                   "Phone Number"
                                ]}
                                printHeaderValues={[
                                  group?.full_name,
                                  group?.phone_number,
                                ]}
                            />
                          </div>
                        ) : (
                          <div className="p-40  w-full flex justify-center items-center ">
                            No Disbursement Data Found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserReport;