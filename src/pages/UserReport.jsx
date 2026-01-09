/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomerReportPrint from "../components/printFormats/CustomerReportPrint";
import { Dropdown, Select } from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { Link, useSearchParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { IoMdDownload } from "react-icons/io";
import { IoMdMore } from "react-icons/io";
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
  const [customerTransactions, setCustomerTransactions] = useState(null);
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

  // const [selectedDate, setSelectedDate] = useState(() => {
  //   const today = new Date();
  //   return today.toISOString().split("T")[0];
  // });
  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
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
  const [pigmeCustomers, setPigmeCustomers] = useState([]);
  const [pigmeCustomerData, setPigmeCustomerData] = useState([]);
  const [pigmeId, setPigmeId] = useState("No");
  const [filteredPigmeData, setFilteredPigmeData] = useState([]);
  const [borrowersData, setBorrowersData] = useState([]);
  const [borrowerId, setBorrowerId] = useState("No");
  const [filteredBorrowerData, setFilteredBorrowerData] = useState([]);
  const [filteredDisbursement, setFilteredDisbursement] = useState([]);
  const [disbursementLoading, setDisbursementLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const [registrationAmount, setRegistrationAmount] = useState(null);
  const [registrationDate, setRegistrationDate] = useState(null);
  const [finalPaymentBalance, setFinalPaymentBalance] = useState(0);
  // transctions details
  const [selectedLabel, setSelectedLabel] = useState("50");
  const [showFilterField, setShowFilterField] = useState(false);
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const [hideAccountType, setHideAccountType] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [selectedPaymentFor, setSelectedPaymentFor] = useState([]);
  const [showAllPaymentModes, setShowAllPaymentModes] = useState(false);
  const [transactionsTable, setTransactionsTable] = useState([]);
  const [totalTransactions, setTotalTransactons] = useState(10);
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
  const BasicPigmeColumns = [
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
    { key: "group_name", header: "Group Name" },
    { key: "ticket", header: "Ticket" },
    { key: "amount", header: "Amount" },
    { key: "receipt_no", header: "Receipt No" },
    { key: "pay_type", header: "Payment Type" },
    { key: "disbursement_type", header: "Disbursement Type" },
    { key: "disbursed_by", header: "Disbursed By" },
    { key: "balance", header: "Balance" },
  ];

  const TransactionsColumns = [
    { key: "id", header: "SL. NO" },
    { key: "date", header: "Paid Date" },
    { key: "transaction_date", header: "Transaction Date" },
    { key: "group", header: "Group Name" },
    { key: "category", header: "Category" },
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
    const abortController = new AbortController();
    const fetchPayments = async () => {
      if (!selectedGroup) return;

      try {
        setTransactionsLoading(true);

        const queryParams = { userId: selectedGroup };
        if (selectedFromDate) queryParams.from_date = selectedFromDate;
          if (selectedToDate) queryParams.to_date = selectedToDate;
        if (totalTransactions)
          queryParams.totalTransactions = totalTransactions;
        if (selectedPaymentMode?.length)
          queryParams.pay_type = selectedPaymentMode;
        if (selectedAccountType) queryParams.account_type = selectedAccountType;
        if (selectedPaymentFor?.length)
          queryParams.pay_for = selectedPaymentFor;

        const response = await api.get(`/payment/customer/transactions`, {
          params: queryParams,
          signal: abortController.signal,
        });

        if (response.data && response.data.length > 0) {
          const formattedData = response.data.map((item, index) => {
            return {
              _id: item._id,
              id: index + 1,
              group: item?.group_id?.group_name || item?.pay_for || "N/A",
              name: item?.user_id?.full_name || "Unknown Customer",
              category: item?.pay_for || "Chit",
              phone_number: item?.user_id?.phone_number || "N/A",
              ticket: item?.loan
                ? item.loan?.loan_id
                : item?.pigme
                ? item.pigme?.pigme_id
                : item?.ticket || "N/A",
              receipt: item?.receipt_no || "N/A",
              old_receipt_no: item?.old_receipt_no || "-",
              amount: item?.amount || 0,
              date: item.pay_date?.split("T")?.[0] || "N/A",
              transaction_date: item?.createdAt?.split("T")?.[0] || "N/A",
              mode: item?.pay_type || "N/A",
              account_type: item?.account_type || "-",
              collection_time: item?.collection_time || "-",
              collected_by:
                item?.collected_by?.name ||
                item?.admin_type?.admin_name ||
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
                            to={`/print/${item._id}`}
                            className="text-blue-600">
                            Print
                          </Link>
                        ),
                      },
                    ],
                  }}
                  placement="bottomLeft">
                  <IoMdMore className="cursor-pointer" />
                </Dropdown>
              ),
            };
          });

          console.log("Formatted Data Success:", formattedData);
          setTransactionsTable(formattedData);
        } else {
          console.warn("No data returned for these filters:", queryParams);
          setTransactionsTable([]);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Request was cancelled (AbortError)");
        } else {
          console.error("Mapping/API Error:", error);
        }
        setTransactionsTable([]);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchPayments();
    return () => abortController.abort();
  }, [
    selectedFromDate,
    selectedToDate,
    selectedPaymentMode,
    selectedGroup,
    selectedAccountType,
    selectedPaymentFor,
    totalTransactions,
  ]);
  useEffect(() => {
    const fetchRegistrationFee = async () => {
      if (
        activeTab === "basicReport" &&
        selectedGroup &&
        EnrollGroupId.groupId &&
        EnrollGroupId.ticket &&
        EnrollGroupId.groupId !== "Loan" &&
        EnrollGroupId !== "Pigme"
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
        // Find actual loan_id from selected loan
        const selectedLoan = loanCustomers?.overall_loan?.find(
          (loan) => loan?.loan_details?.loan?._id === EnrollGroupId.ticket
        );
        const loanId =
          selectedLoan?.loan_details?.loan?._id || EnrollGroupId.ticket;

        const response = await api.get(
          `/loan-payment/get-all-loan-payments/${loanId}`
        );

        if (response.data?.length > 0) {
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

    if (EnrollGroupId.groupId === "Loan" && EnrollGroupId.ticket)
      fetchAllLoanPaymentsbyId();
  }, [EnrollGroupId.ticket]);

  useEffect(() => {
    const fetchAllPigmePaymentsbyId = async () => {
      setPigmeCustomerData([]);
      setBasicLoading(true);

      try {
        const response = await api.get(
          `/pigme-payment/get-all-pigme-payments-by-id/${EnrollGroupId.ticket}`
        );

        if (response.data && response.data.length > 0) {
          let balance = 0;
          const formattedData = response.data.map((pigmePayment, index) => {
            balance += Number(pigmePayment.amount);
            return {
              _id: pigmePayment._id,
              id: index + 1,
              pay_date: formatPayDate(pigmePayment?.pay_date),
              amount: pigmePayment.amount,
              receipt_no: pigmePayment.receipt_no,
              pay_type: pigmePayment.pay_type,
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
          setPigmeCustomerData(formattedData);
        } else {
          setPigmeCustomerData([]);
        }
      } catch (error) {
        console.error("Error fetching pigme payment data:", error);
        setPigmeCustomerData([]);
      } finally {
        setBasicLoading(false);
      }
    };

    if (EnrollGroupId.groupId === "Pigme") fetchAllPigmePaymentsbyId();
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
    if (EnrollGroupId.groupId !== "Loan" && EnrollGroupId.groupId !== "Pigme")
      fetchGroupById();
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
        const response = await api.get(`/payment/loan/user/${selectedGroup}`);
        if (response.data) {
          const filteredBorrowerData = response.data?.overall_loan?.map(
            (loan, index) => ({
              sl_no: index + 1,
              loan: loan?.loan_details?.loan?.loan_id,
              loan_amount: loan?.loan_value,
              tenure: loan?.loan_details?.loan?.tenure,
              service_charge: loan?.loan_details?.loan?.service_charges,
              total_paid_amount: loan?.total_paid_amount,
              balance: loan?.balance,
            })
          );
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
    const fetchPigme = async () => {
      try {
        setPigmeCustomers([]);
        const response = await api.get(`/payment/pigme/user/${selectedGroup}`);
        if (response.data) {
          const filteredPigmeData = response.data?.overall_pigme?.map(
            (pigme, index) => ({
              sl_no: index + 1,
              pigme: pigme?.pigme_details?.pigme?.pigme_id,
              start_date:
                pigme?.pigme_details?.pigme?.start_date?.split("T")[0],
              duration: pigme?.pigme_details?.pigme?.duration,
              maturity_interest: pigme?.pigme_details?.pigme?.maturity_interest,
              total_deposited_amount: pigme?.total_deposited_amount,
            })
          );
          setFilteredPigmeData(filteredPigmeData);
        }
        setPigmeCustomers(response.data);

        if (response.status >= 400) throw new Error("Failed to send message");
      } catch (err) {
        console.log("failed to fetch Pigme customers", err.message);
        setFilteredPigmeData([]);
      }
    };
    setPigmeCustomerData([]);
    setPigmeId("No");
    fetchPigme();
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
              group_name: payment?.group_id?.group_name,
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
    console.info(borrowersData, " information borroswers ADATA");
    console.info(EnrollGroupId.groupId, " information EnrollGroupId.groupId");
  };

  useEffect(() => {
    const fetchCustomerTransaction = async () => {
      try {
        if (!selectedAuctionGroupId) return;

        const response = await api.get(
          `/payment/users/${selectedAuctionGroupId}`
        );
        console.info(response.data.payments, "Fetched user transactions");
        setCustomerTransactions(response.data.payments); // <-- store in state
      } catch (error) {
        console.error("Unable to fetch customer transaction details", error);
      }
    };
    fetchCustomerTransaction();
  }, [selectedAuctionGroupId]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get(`/payment/get-customer-history`, {
          params: {
            from_date: selectedFromDate,
            to_date: selectedToDate,
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
    selectedToDate,
    selectedFromDate,
    selectedPaymentMode,
    selectedCustomers,
  ]);

const handleTransactionsSelectFilter = (value) => {
  setSelectedLabel(value);
  const today = new Date();
  const formatDate = (date) => date.toISOString().slice(0, 10);

  if (value === "Custom") {
    setShowFilterField(true);
    setTotalTransactons(0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setSelectedFromDate(formatDate(startOfMonth));
    setSelectedToDate(formatDate(today));
  } else {
    setShowFilterField(false);
    setTotalTransactons(parseInt(value));
    setSelectedFromDate(""); // Clear dates so they don't interfere with limit logic
    setSelectedToDate("");
  }
};

  const dayGroup = [
    { value: "200", label: "Last 200 Transactions" },
    { value: "100", label: "Last 100 Transactions" },
    { value: "50", label: "Last 50 Transactions" },
    { value: "25", label: "Last 25 Transactions" },
    { value: "Custom", label: "Custom" },
  ];
  const loanColumns = [
    { key: "sl_no", header: "SL. No" },
    { key: "loan", header: "Loan ID" },
    { key: "loan_amount", header: "Loan Amount" },
    { key: "service_charge", header: "Service Charge" },
    { key: "tenure", header: "Tenure" },
    { key: "total_paid_amount", header: "Total Paid Amount" },
    { key: "balance", header: "Balance" },
  ];

  const pigmeColumns = [
    { key: "sl_no", header: "SL. No" },
    { key: "pigme", header: "Pigme ID" },
    { key: "start_date", header: "Start Date" },
    { key: "duration", header: "duration" },
    { key: "maturity_interest", header: "Intrest" },
    { key: "total_deposited_amount", header: "Total Deposited Amount" },
  ];

  // const handleGroupAuctionChange = async (groupId) => {
  //   setFilteredAuction([]);
  //   if (groupId) {
  //     try {
  //       const response = await api.post(
  //         `/enroll/account/${groupId}`
  //       );

  //       if (response.data && response.data.length > 0) {
  //         setFilteredAuction(response.data);
  //         console.log(response.data, "resienns");

  //         const formattedData = response.data
  //           .map((group, index) => {
  //             const groupName = group?.enrollment?.group?.group_name || "";
  //             const tickets = group?.enrollment?.tickets || "";
  //             const groupType = group?.enrollment?.group?.group_type;
  //             const groupInstall =
  //               parseInt(group?.enrollment?.group?.group_install) || 0;
  //             const auctionCount = parseInt(group?.auction?.auctionCount) || 0;
  //             const totalPaidAmount = group?.payments?.totalPaidAmount || 0;
  //             const totalProfit = group?.profit?.totalProfit || 0;
  //             const totalPayable = group?.payable?.totalPayable || 0;
  //             const firstDividentHead =
  //               group?.firstAuction?.firstDividentHead || 0;

  //             if (!group?.enrollment?.group) {
  //               return null;
  //             }

  //             return {
  //               id: index + 1,
  //               group: groupName,
  //               ticket: tickets,

  //               totalBePaid:
  //                 groupType === "double"
  //                   ? groupInstall * auctionCount + groupInstall
  //                   : totalPayable + groupInstall + totalProfit,

  //               profit: totalProfit,

  //               toBePaidAmount:
  //                 groupType === "double"
  //                   ? groupInstall * auctionCount + groupInstall
  //                   : totalPayable + groupInstall + firstDividentHead,

  //               paidAmount: totalPaidAmount,

  //               balance:
  //                 groupType === "double"
  //                   ? groupInstall * auctionCount +
  //                   groupInstall -
  //                   totalPaidAmount
  //                   : totalPayable +
  //                   groupInstall +
  //                   firstDividentHead -
  //                   totalPaidAmount,
  //               referred_type: group?.enrollment?.referred_type || "N/A",
  //               referrer_name: group?.enrollment?.referrer_name || "N/A",
  //               chit_asking_month: group?.enrollment?.chit_asking_month || "N/A",
  //               customer_status: group?.enrollment?.customer_status || "N/A",
  //               removal_reason: group?.enrollment?.removal_reason || "N/A",
  //               isPrized:
  //                 group?.enrollment?.isPrized === true
  //                   ? "Prized"
  //                   : "Un Prized" || "N/A",
  //             };
  //           })
  //           .filter((item) => item !== null)
  //           .filter((item) => item.customer_status === "Active");

  //         setTableAuctions(formattedData);
  //         setCommission(0);
  //         console.info(formattedData, "test");
  //         const totalToBePaidAmount = formattedData
  //           .filter((summary) => summary.customer_status === "Active")
  //           .reduce((sum, group) => {
  //             return sum + (group?.totalBePaid || 0);
  //           }, 0);
  //         setTotalToBePaid(totalToBePaidAmount);

  //         const totalNetToBePaidAmount = formattedData
  //           .filter((summary) => summary.customer_status === "Active")
  //           .reduce((sum, group) => {
  //             return sum + (group?.toBePaidAmount || 0);
  //           }, 0);
  //         setNetTotalProfit(totalNetToBePaidAmount);

  //         const totalPaidAmount = formattedData
  //           .filter((summary) => summary.customer_status === "Active")
  //           .reduce((sum, group) => sum + (group?.paidAmount || 0), 0);
  //         setTotalPaid(totalPaidAmount);

  //         const totalProfit = formattedData
  //           .filter((summary) => summary.customer_status === "Active")
  //           .reduce((sum, group) => sum + (group?.profit || 0), 0);
  //         setTotalProfit(totalProfit);
  //       } else {
  //         setFilteredAuction([]);
  //         setCommission(0);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching enrollment data:", error);
  //       setFilteredAuction([]);
  //       setCommission(0);
  //     }
  //   } else {
  //     setFilteredAuction([]);
  //     setCommission(0);
  //   }
  // };

  const handleGroupAuctionChange = async (userId) => {
    setFilteredAuction([]);
    setTableAuctions([]);
    setCommission(0);
    setTotalToBePaid(0);
    setNetTotalProfit(0);
    setTotalPaid(0);
    setTotalProfit(0);

    if (!userId) return;

    // 🔐 Request guard to avoid stale response updates
    const currentRequestId = Date.now();
    handleGroupAuctionChange.latestRequest = currentRequestId;

    try {
      const response = await api.post(`/enroll/account/${userId}`);

      // ❌ Ignore old API responses
      if (handleGroupAuctionChange.latestRequest !== currentRequestId) return;

      if (!response?.data?.length) return;

      setFilteredAuction(response.data);

      const formattedData = response.data
        .map((group, index) => {
          const enrollment = group?.enrollment;
          const grp = enrollment?.group;
          if (!grp || enrollment?.customer_status !== "Active") return null;

          const groupInstall = Number(grp.group_install) || 0;
          const auctionCount = Number(group?.auction?.auctionCount) || 0;
          const totalPaid = Number(group?.payments?.totalPaidAmount) || 0;
          const profit = Number(group?.profit?.totalProfit) || 0;
          const payable = Number(group?.payable?.totalPayable) || 0;
          const firstDividend =
            Number(group?.firstAuction?.firstDividentHead) || 0;

          const isDouble = grp.group_type === "double";

          const totalBePaid = isDouble
            ? groupInstall * auctionCount + groupInstall
            : payable + groupInstall + profit;

          const toBePaidAmount = isDouble
            ? totalBePaid
            : payable + groupInstall + firstDividend;

          return {
            id: index + 1,
            group: grp.group_name || "",
            ticket: enrollment.tickets || "",
            totalBePaid,
            profit,
            toBePaidAmount,
            paidAmount: totalPaid,
            balance: toBePaidAmount - totalPaid,
            referred_type: enrollment.referred_type || "N/A",
            referrer_name: enrollment.referrer_name || "N/A",
            chit_asking_month: enrollment.chit_asking_month || "N/A",
            customer_status: enrollment.customer_status,
            removal_reason: enrollment.removal_reason || "N/A",
            isPrized: enrollment.isPrized ? "Prized" : "Un Prized",
          };
        })
        .filter(Boolean);

      setTableAuctions(formattedData);

      // 📊 Totals
      setTotalToBePaid(
        formattedData.reduce((sum, row) => sum + row.totalBePaid, 0)
      );

      setNetTotalProfit(
        formattedData.reduce((sum, row) => sum + row.toBePaidAmount, 0)
      );

      setTotalPaid(formattedData.reduce((sum, row) => sum + row.paidAmount, 0));

      setTotalProfit(formattedData.reduce((sum, row) => sum + row.profit, 0));
    } catch (error) {
      console.error("Error fetching enrollment data:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      handleGroupAuctionChange(userId);
    }
  }, []);
  const Auctioncolumns = [
    { key: "id", header: "SL. NO" },
    { key: "customer_status", header: "Customer Status" },
    { key: "removal_reason", header: "Removal Reason" },
    { key: "group", header: "Group Name" },
    { key: "ticket", header: "Ticket" },
    { key: "referred_type", header: "Referrer Type" },
    { key: "referrer_name", header: "Referred By" },
    { key: "chit_asking_month", header: "Chit Asking Month" },
    { key: "isPrized", header: "Is Prized" },
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
    if (EnrollGroupId.groupId !== "Loan" && EnrollGroupId.groupId !== "Pigme")
      fetchEnroll();
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
                      htmlFor={"SS"}>
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
                      style={{ height: "50px", width: "600px" }}>
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
                        onClick={() => handleTabChange("groupDetails")}>
                        Customer Details
                      </button>
                      <button
                        className={`px-6 py-2 font-medium ${
                          activeTab === "basicReport"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleTabChange("basicReport")}>
                        Customer Ledger
                      </button>
                      <button
                        className={`px-6 py-2 font-medium ${
                          activeTab === "transactions"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleTabChange("transactions")}>
                        Transactions
                      </button>
                      <button
                        className={`px-6 py-2 font-medium ${
                          activeTab === "disbursement"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleTabChange("disbursement")}>
                        PayOut | Disbursement
                      </button>
                    </div>
                    <div className="flex justify-end mb-3">
                      <button
                        onClick={() =>
                          CustomerReportPrint(
                            group,
                            TableAuctions,
                            filteredBorrowerData,
                            filteredDisbursement,
                            {
                              TotalToBepaid,
                              Totalprofit,
                              NetTotalprofit,
                              Totalpaid,
                            },
                            TableEnrolls,
                            customerTransactions
                          )
                        }
                        className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded shadow">
                        <IoMdDownload size={20} />
                        Download Full Report
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
                                            className="p-1 border-b">
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
                                  onClick={() =>
                                    setVisibleRows((prev) => ({
                                      ...prev,
                                      row1: !prev.row1,
                                    }))
                                  }
                                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out
        ${
          visibleRows.row1
            ? "bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg"
            : "bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md hover:shadow-lg hover:scale-105"
        }
      `}>
                                  {visibleRows.row1
                                    ? "✓ Hide Basic Info"
                                    : "Show Basic Info"}
                                </button>

                                <button
                                  onClick={() =>
                                    setVisibleRows((prev) => ({
                                      ...prev,
                                      row2: !prev.row2,
                                    }))
                                  }
                                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out
        ${
          visibleRows.row2
            ? "bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg"
            : "bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md hover:shadow-lg hover:scale-105"
        }
      `}>
                                  {visibleRows.row2
                                    ? "✓ Hide Address Info"
                                    : "Show Address Info"}
                                </button>

                                <button
                                  onClick={() =>
                                    setVisibleRows((prev) => ({
                                      ...prev,
                                      row3: !prev.row3,
                                    }))
                                  }
                                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out
        ${
          visibleRows.row3
            ? "bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg"
            : "bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md hover:shadow-lg hover:scale-105"
        }
      `}>
                                  {visibleRows.row3
                                    ? "✓ Hide Regional Info"
                                    : "Show Regional Info"}
                                </button>

                                <button
                                  onClick={() =>
                                    setVisibleRows((prev) => ({
                                      ...prev,
                                      row4: !prev.row4,
                                    }))
                                  }
                                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out
        ${
          visibleRows.row4
            ? "bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg"
            : "bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md hover:shadow-lg hover:scale-105"
        }
      `}>
                                  {visibleRows.row4
                                    ? "✓ Hide Referral, Nominee & Bank Details"
                                    : "Show Referral, Nominee & Bank Details"}
                                </button>
                              </div>

                              {/* Row 1: Basic Info */}
                              {visibleRows.row1 && (
                                <div className="flex gap-8 mb-6">
                                  <div className="flex flex-col w-full gap-4">
                                    <Input
                                      label="Name"
                                      value={group.full_name}
                                    />
                                    <Input label="Email" value={group.email} />
                                  </div>
                                  <div className="flex flex-col gap-4 w-full">
                                    <Input
                                      label="Phone Number"
                                      value={group.phone_number}
                                    />
                                    <Input
                                      label="Adhaar Number"
                                      value={group.adhaar_no}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-4 w-full">
                                    <Input
                                      label="PAN Number"
                                      value={group.pan_no}
                                    />
                                    <Input
                                      label="Pincode"
                                      value={group.pincode}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Row 2: Address Info */}
                              {visibleRows.row2 && (
                                <div className="flex gap-8 mb-6">
                                  <div className="flex flex-col gap-4 w-full">
                                    <Input
                                      label="Address"
                                      value={group.address}
                                    />
                                    <Input
                                      label="Gender"
                                      value={group.gender}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-4 w-full">
                                    <Input
                                      label="Date of Birth"
                                      value={
                                        group.dateofbirth
                                          ? new Date(group.dateofbirth)
                                              .toISOString()
                                              .split("T")[0]
                                          : ""
                                      }
                                    />
                                    <Input
                                      label="Collection Area"
                                      value={group?.collection_area?.route_name}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-4 w-full">
                                    <Input
                                      label="Marital Status"
                                      value={group.marital_status}
                                    />
                                    <Input
                                      label="Father Name"
                                      value={group.father_name}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Row 3: Regional Info */}
                              {visibleRows.row3 && (
                                <div className="flex gap-8 mb-6">
                                  <div className="flex flex-col gap-4 w-full">
                                    <Input
                                      label="Nationality"
                                      value={group.nationality}
                                    />
                                    <Input
                                      label="Village"
                                      value={group.village}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-4 w-full">
                                    <Input label="Taluk" value={group.taluk} />
                                    <Input
                                      label="District"
                                      value={group.district}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-4 w-full">
                                    <Input label="State" value={group.state} />
                                    <Input
                                      label="Alternate Number"
                                      value={group.alternate_number}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Row 4: Referral, Nominee & Bank Info */}
                              {visibleRows.row4 && (
                                <div className="flex gap-8 mb-6">
                                  <div className="flex flex-col gap-4 w-full">
                                    <Input
                                      label="Referral Name"
                                      value={group.referral_name}
                                    />
                                    <Input
                                      label="Nominee Name"
                                      value={group.nominee_name}
                                    />
                                    <Input
                                      label="Nominee DOB"
                                      value={
                                        group.nominee_dateofbirth
                                          ? new Date(group.nominee_dateofbirth)
                                              .toISOString()
                                              .split("T")[0]
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
                                    <Input
                                      label="Bank Name"
                                      value={group.bank_name}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-4 w-full">
                                    <Input
                                      label="Bank Branch Name"
                                      value={group.bank_branch_name}
                                    />
                                    <Input
                                      label="Bank Account Number"
                                      value={group.bank_account_number}
                                    />
                                    <Input
                                      label="Bank IFSC Code"
                                      value={group.bank_IFSC_code}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="mt-10">
                              <h3 className="text-lg font-medium mb-4">
                                Enrolled Groups
                              </h3>

                              {TableAuctions &&
                                TableAuctions.length > 0 &&
                                !isLoading && (
                                  <div className="mt-5">
                                    <DataTable
                                      data={filterOption(
                                        TableAuctions,
                                        searchText
                                      )}
                                      columns={Auctioncolumns}
                                      exportedPdfName="Customer Report"
                                      printHeaderKeys={[
                                        "Customer Name",
                                        "Phone Number",
                                        "Total Amount To Be Paid",
                                        "Total Profit",
                                        "Total Net To be Paid",
                                        "Total Balance",
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
                                      exportedFileName={`CustomerChitReport.csv`}
                                    />
                                  </div>
                                )}

                              {filteredBorrowerData &&
                                filteredBorrowerData.length > 0 &&
                                !isLoading && (
                                  <div className="mt-10">
                                    <h3 className="text-lg font-medium mb-4">
                                      Loan Details
                                    </h3>
                                    <DataTable
                                      data={filteredBorrowerData}
                                      columns={loanColumns}
                                      exportedFileName="CustomerLoanReport.csv"
                                    />
                                  </div>
                                )}

                              {filteredPigmeData &&
                                filteredPigmeData.length > 0 &&
                                !isLoading && (
                                  <div className="mt-10">
                                    <h3 className="text-lg font-medium mb-4">
                                      Pigme Details
                                    </h3>
                                    <DataTable
                                      data={filteredPigmeData}
                                      columns={pigmeColumns}
                                      exportedFileName="PigmeCustomerReport.csv"
                                    />
                                  </div>
                                )}

                              {!isLoading &&
                                TableAuctions.length === 0 &&
                                filteredBorrowerData.length === 0 &&
                                filteredPigmeData.length === 0 && (
                                  <div className="p-20 w-full flex justify-center items-center text-gray-500">
                                    No Chit Group, Loan, or Pigme data found for
                                    this customer
                                  </div>
                                )}

                              {isLoading && (
                                <CircularLoader isLoading={isLoading} />
                              )}

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

                    {/* {activeTab === "basicReport" && (
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

                                {Array.isArray(loanCustomers)
                                  ? loanCustomers.map((loan) => (
                                      <option
                                        key={loan._id}
                                        value={`Loan|${loan._id}`}
                                      >
                                        {`${loan.loan_id || "N/A"} | ₹${
                                          loan.loan_amount || 0
                                        }`}
                                      </option>
                                    ))
                                  : Array.isArray(loanCustomers?.overall_loan)
                                  ? loanCustomers.overall_loan.map(
                                      (loan, index) => (
                                        <option
                                          key={index}
                                          value={`Loan|${
                                            loan?.loan_details?.loan?._id ||
                                            index
                                          }`}
                                        >
                                          {`${
                                            loan?.loan_details?.loan?.loan_id ||
                                            "N/A"
                                          } | ₹${loan?.loan_value || 0}`}
                                        </option>
                                      )
                                    )
                                  : null}
                                  {Array.isArray(pigmeCustomers)
                                  ? pigmeCustomers.map((pigme) => (
                                      <option
                                        key={loan._id}
                                        value={`Pigme|${pigme._id}`}
                                      >
                                        {`${pigme.pigme_id || "N/A"} 
                                        }`}
                                      </option>
                                    ))
                                  : Array.isArray(pigmeCustomers?.overall_pigme)
                                  ? pigmeCustomers.overall_pigme.map(
                                      (pigme, index) => (
                                        <option
                                          key={index}
                                          value={`Pigme|${
                                            pigme?.pigme_details?.pigme?._id ||
                                            index
                                          }`}
                                        >
                                          {`${
                                            pigme?.pigme_details?.pigme?.pigme_id ||
                                            "N/A"
                                          } | ₹${pigme?.total_deposited_amount || 0}`}
                                        </option>
                                      )
                                    )
                                  : null}
                              </select>

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
                    )} */}
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
                                className="border border-gray-300 rounded px-6 py-2 shadow-sm outline-none w-full max-w-md">
                                <option value="">Select Group | Ticket</option>

                                {filteredAuction.map((group) => {
                                  if (
                                    group?.enrollment?.group &&
                                    group?.enrollment?.customer_status ===
                                      "Active"
                                  ) {
                                    return (
                                      <option
                                        key={group.enrollment.group._id}
                                        value={`${group.enrollment.group._id}|${group.enrollment.tickets}`}>
                                        {group.enrollment.group.group_name} |{" "}
                                        {group.enrollment.tickets}
                                      </option>
                                    );
                                  }
                                  return null;
                                })}

                                {Array.isArray(loanCustomers?.overall_loan) &&
                                  loanCustomers.overall_loan.map(
                                    (loan, index) => (
                                      <option
                                        key={
                                          loan?.loan_details?.loan?._id || index
                                        }
                                        value={`Loan|${
                                          loan?.loan_details?.loan?._id || index
                                        }`}>
                                        {loan?.loan_details?.loan?.loan_id ||
                                          "N/A"}{" "}
                                        | ₹{loan?.loan_value || 0}
                                      </option>
                                    )
                                  )}

                                {Array.isArray(pigmeCustomers?.overall_pigme) &&
                                  pigmeCustomers.overall_pigme.map(
                                    (pigme, index) => (
                                      <option
                                        key={
                                          pigme?.pigme_details?.pigme?._id ||
                                          index
                                        }
                                        value={`Pigme|${
                                          pigme?.pigme_details?.pigme?._id ||
                                          index
                                        }`}>
                                        {pigme?.pigme_details?.pigme
                                          ?.pigme_id || "N/A"}{" "}
                                        | ₹{pigme?.total_deposited_amount || 0}
                                      </option>
                                    )
                                  )}
                              </select>
                            </div>
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

                          {(TableEnrolls?.length > 0 ||
                            borrowersData?.length > 0 ||
                            pigmeCustomerData?.length > 0) &&
                          !basicLoading ? (
                            <div className="mt-10">
                              <DataTable
                                exportedPdfName="Customer Ledger Report"
                                printHeaderKeys={[
                                  "Customer Name",
                                  "Customer Id",
                                  "Phone Number",
                                  "Ticket Number",
                                  "Group Name",
                                ]}
                                printHeaderValues={[
                                  group?.full_name,
                                  group?.customer_id,
                                  group?.phone_number,
                                  EnrollGroupId?.ticket,
                                  groupDetails?.group_name,
                                ]}
                                data={
                                  EnrollGroupId?.groupId === "Loan"
                                    ? borrowersData
                                    : EnrollGroupId?.groupId === "Pigme"
                                    ? pigmeCustomerData
                                    : TableEnrolls
                                }
                                columns={
                                  EnrollGroupId?.groupId === "Loan"
                                    ? BasicLoanColumns
                                    : EnrollGroupId?.groupId === "Pigme"
                                    ? BasicPigmeColumns
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
                              exportedFileName={`Customer Payout Report.csv`}
                              printHeaderKeys={[
                                "Customer Name",
                                "Phone Number",
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

                    {activeTab === "transactions" && (
                      <div className="flex flex-col flex-1">
                        <label className="mb-1 text-sm  text-gray-700 font-bold">
                          Transactions
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                              Date Range
                            </label>
                            <Select
                              showSearch
                              popupMatchSelectWidth={false}
                              onChange={handleTransactionsSelectFilter}
                              value={selectedLabel || undefined}
                              placeholder="Last 50 Transactions"
                              filterOption={(input, option) =>
                                option.children
                                  .toString()
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                              className="w-full"
                              style={{ height: "44px" }}>
                              {dayGroup.map((time) => (
                                <Select.Option
                                  key={time.value}
                                  value={time.value}>
                                  {time.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </div>

                          {/* Date Field */}
                          {showFilterField && (
                            <>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  From Date
                                </label>
                                <input
                                  type="date"
                                  value={selectedFromDate}
                                  onChange={(e) =>
                                    setSelectedFromDate(e.target.value)
                                  }
                                  className="w-full h-11 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  To Date
                                </label>
                                <input
                                  type="date"
                                  value={selectedToDate}
                                  onChange={(e) =>
                                    setSelectedToDate(e.target.value)
                                  }
                                  className="w-full h-11 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                />
                              </div>
                            </>
                          )}

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                              Payment Mode
                            </label>

                            <Select
                              mode="multiple"
                              value={selectedPaymentMode || undefined}
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
                                {
                                  label: "Payment Link",
                                  value: "Payment Link",
                                },
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
                                onChange={(groupId) =>
                                  setSelectedAccountType(groupId)
                                }
                                filterOption={(input, option) =>
                                  option.children
                                    .toString()
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                className="w-full"
                                style={{ height: "44px" }}>
                                <Select.Option value="">
                                  All Types
                                </Select.Option>
                                <Select.Option value="suspense">
                                  Suspense
                                </Select.Option>
                                <Select.Option value="credit">
                                  Credit
                                </Select.Option>
                                <Select.Option value="adjustment">
                                  Adjustment
                                </Select.Option>
                                <Select.Option value="others">
                                  Others
                                </Select.Option>
                              </Select>
                            </div>
                          )}
                        </div>
                        {transactionsLoading ? (
                          <CircularLoader />
                        ) : transactionsTable?.length > 0 ? (
                          <div className="mt-10">
                            <DataTable
                              data={transactionsTable}
                              columns={TransactionsColumns}
                              exportedPdfName={`Transactions Report`}
                              exportedFileName={`Transactions Report.csv`}
                            />
                          </div>
                        ) : (
                          <div className="p-40  w-full flex justify-center items-center ">
                            No Transactions Found
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


// Date Range in transaction section is not working properly why
