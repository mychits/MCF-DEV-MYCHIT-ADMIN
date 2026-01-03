/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import {
  Select,
  Modal,
  Table,
  message,
  Card,
  Statistic,
  Row,
  Col,
  Button,
  DatePicker,
  Input,
  Tag,
  Checkbox,
  Dropdown,
  Menu,
  Space,
  Drawer,
  Divider,
  Typography,
  Alert,
  Progress,
  Tooltip,
} from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import moment from "moment";
import {
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  UsergroupAddOutlined,
  PhoneOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
  SendOutlined,
  DownOutlined,
  ArrowLeftOutlined,
  UndoOutlined,
  InfoCircleOutlined,
  CalculatorOutlined,
  WalletOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { AiFillBackward } from "react-icons/ai";
import Sidebar from "../components/layouts/Sidebar";
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const PenaltyMonitor = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [screenLoading, setScreenLoading] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [groupFilter, setGroupFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [monthlyCollectedSummary, setMonthlyCollectedSummary] = useState(null);
  const [monthlyCollectedDetails, setMonthlyCollectedDetails] = useState([]);
  const [monthlyCollectedLoading, setMonthlyCollectedLoading] = useState(false);
  const [monthlyDetailsModalVisible, setMonthlyDetailsModalVisible] = useState(false);

  // Modal for breakdown
  const [breakdownModal, setBreakdownModal] = useState(false);
  const [breakdownData, setBreakdownData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  // WhatsApp Selection & Modal
  const [selectedRows, setSelectedRows] = useState([]);
  const [sendModal, setSendModal] = useState({ open: false, type: null });

  // Penalty Reversal State
  const [reversalGroupFilter, setReversalGroupFilter] = useState("");
  const [reversalCustomerFilter, setReversalCustomerFilter] = useState("");
  const [reversalTicketFilter, setReversalTicketFilter] = useState("");
  const [reversalDrawerOpen, setReversalDrawerOpen] = useState(false);
  const [penaltySummaryDrawer, setPenaltySummaryDrawer] = useState(false);
  const [penaltySummary, setPenaltySummary] = useState(null);
  const [selectedReversalType, setSelectedReversalType] = useState(null);
  const [reverseAmountDrawer, setReverseAmountDrawer] = useState(false);
  const [reverseAmount, setReverseAmount] = useState("");
  const [maxAllowedAmount, setMaxAllowedAmount] = useState(0);

  // Add Penalty State
  const [addPenaltyDrawerOpen, setAddPenaltyDrawerOpen] = useState(false);
  const [addPenaltyGroupFilter, setAddPenaltyGroupFilter] = useState("");
  const [addPenaltyCustomerFilter, setAddPenaltyCustomerFilter] = useState("");
  const [addPenaltyTicketFilter, setAddPenaltyTicketFilter] = useState("");
  const [addPenaltyDetails, setAddPenaltyDetails] = useState(null);
  const [addPenaltyAmount, setAddPenaltyAmount] = useState("");
  const [addLateFeeAmount, setAddLateFeeAmount] = useState("");
  const [addPenaltyLoading, setAddPenaltyLoading] = useState(false);

  const groupOptions = [...new Set(usersData.map((u) => u.groupName))];

  // Customer & Ticket Options for Reversal Filters
  const customerOptions = useMemo(() => {
    if (!reversalGroupFilter) return [];
    const customers = new Map();
    usersData
      .filter(u => u.groupName === reversalGroupFilter)
      .forEach(u => customers.set(u.userName, u));
    return Array.from(customers.values());
  }, [usersData, reversalGroupFilter]);

  const ticketOptions = useMemo(() => {
    if (!reversalCustomerFilter) return [];
    const user = usersData.find(
      u => u.groupName === reversalGroupFilter && u.userName === reversalCustomerFilter
    );
    return user ? [user.paymentsTicket] : [];
  }, [usersData, reversalGroupFilter, reversalCustomerFilter]);

  // Customer & Ticket Options for Add Penalty
  const addPenaltyCustomerOptions = useMemo(() => {
    if (!addPenaltyGroupFilter) return [];
    const customers = new Map();
    usersData
      .filter(u => u.groupName === addPenaltyGroupFilter)
      .forEach(u => customers.set(u.userName, u));
    return Array.from(customers.values());
  }, [usersData, addPenaltyGroupFilter]);

  const addPenaltyTicketOptions = useMemo(() => {
    if (!addPenaltyCustomerFilter) return [];
    const user = usersData.find(
      u => u.groupName === addPenaltyGroupFilter && u.userName === addPenaltyCustomerFilter
    );
    return user ? [user.paymentsTicket] : [];
  }, [usersData, addPenaltyGroupFilter, addPenaltyCustomerFilter]);

  const filteredUsers = useMemo(() => {
    return filterOption(
      usersData.filter((u) => {
        const matchGroup = groupFilter ? u.groupName === groupFilter : true;
        const enrollmentDate = new Date(u.enrollmentDate);
        const matchFromDate = fromDate ? enrollmentDate >= new Date(fromDate) : true;
        const matchToDate = toDate ? enrollmentDate <= new Date(toDate) : true;
        return matchGroup && matchFromDate && matchToDate;
      }),
      searchText
    );
  }, [usersData, groupFilter, fromDate, toDate, searchText]);

  // Fetch Data Function - Updated to use backend calculations
  const fetchData = async () => {
    try {
      setScreenLoading(true);
      // Fetch penalty report from backend
      const penaltyResponse = await api.get("/penalty/get-penalty-report");
      
      if (!penaltyResponse.data?.success || !penaltyResponse.data?.data) {
        message.error("Failed to load penalty monitor data");
        return;
      }

      const allPenaltyData = penaltyResponse.data.data;
      
      // Fetch user details for additional information
      const reportResponse = await api.get("/user/all-customers-report");
      
      // Create a map of user details for quick lookup
      const userDetailsMap = new Map();
      if (reportResponse.data) {
        for (const usrData of reportResponse.data) {
          if (usrData?.data) {
            for (const data of usrData.data) {
              if (data?.enrollment?.group) {
                const groupId = String(data.enrollment.group._id);
                const userId = String(usrData._id);
                const ticket = String(data.payments.ticket || "").trim();
                
                userDetailsMap.set(`${userId}_${groupId}_${ticket}`, {
                  userName: usrData.userName,
                  userPhone: usrData.phone_number,
                  customerId: usrData.customer_id,
                  enrollmentDate: data.enrollment.createdAt?.split("T")[0] || "",
                  isPrized: data.isPrized === "true"
                });
              }
            }
          }
        }
      }

      // Process penalty data from backend
      const usersList = [];
      let count = 1;
      
      for (const penaltyData of allPenaltyData) {
        const userId = String(penaltyData.user_id);
        const groupId = String(penaltyData.group_id);
        const ticket = String(penaltyData.ticket_number || "").trim();
        
        // Get user details from map
        const userDetails = userDetailsMap.get(`${userId}_${groupId}_${ticket}`);
        
        if (!userDetails) continue;
        
        const summary = penaltyData.summary || {};
        
        // Extract values from backend calculation
        const amountToBePaid = summary.total_expected || 0;
        const amountPaid = summary.total_paid || 0;
        const balance = summary.grand_total_due_with_penalty || 0;
        const totalPenalty = summary.total_penalty || 0;
        const totalLateFee = summary.total_late_payment_charges || 0;
        const vcPenalty = summary.total_vacant_chit_penalty || 0;
        const regularPenalty = totalPenalty - vcPenalty - (summary.manual_penalty || 0);
        const manualPenalty = summary.manual_penalty || 0;
        const manualLateFee = summary.manual_late_fee || 0;
        
        const totalOverdueCharges = totalPenalty + totalLateFee;
        const balanceWithoutPenalty = amountToBePaid - amountPaid;
        
        // Determine VC status
        const enrollmentDate = moment(userDetails.enrollmentDate);
        const today = moment().startOf("day");
        const vacantGraceDays = Number(penaltyData.vacant_grace_days || 90);
        const vcGraceEnd = enrollmentDate.clone().add(vacantGraceDays, "days").startOf("day");
        
        let isVcWithinGrace = false;
        let isVcPenaltyApplied = false;
        const vacantCycles = penaltyData?.cycles?.filter((c) => c.vacant_cycle === true) || [];
        
        if (vacantCycles.length > 0) {
          if (today.isSameOrBefore(vcGraceEnd, "day")) {
            isVcWithinGrace = true;
          } else {
            isVcPenaltyApplied = true;
          }
        }
        
        const whatsappActions = (
          <Space size="small">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() =>
                handleShowBreakdown(
                  userId,
                  groupId,
                  userDetails.userName,
                  penaltyData.group_name,
                  penaltyData
                )
              }
            >
              View
            </Button>
          </Space>
        );
        
        const userRecord = {
          _id: penaltyData.enrollment_id,
          userId,
          groupId,
          sl_no: count,
          userName: userDetails.userName,
          userPhone: userDetails.userPhone,
          customerId: userDetails.customerId,
          amountPaid,
          paymentsTicket: ticket,
          amountToBePaid,
          groupName: penaltyData.group_name,
          enrollmentDate: userDetails.enrollmentDate,
          totalToBePaid: amountToBePaid,
          balance,
          regularPenalty,
          vcPenalty,
          totalPenalty,
          totalLateFee,
          balanceWithoutPenalty,
          combinedPenalty: totalPenalty,
          totalOverdueCharges,
          manualPenalty,
          manualLateFee,
          actions: whatsappActions,
          statusDiv: isVcWithinGrace ? (
            <Tag color="blue">VC – Within Grace</Tag>
          ) : isVcPenaltyApplied ? (
            <Tag color="gold">VC Penalty Applied</Tag>
          ) : userDetails.isPrized ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Prized
            </Tag>
          ) : (
            <Tag color="error" icon={<CloseCircleOutlined />}>
              Un Prized
            </Tag>
          ),
          isVcWithinGrace,
          isVcPenaltyApplied,
          hasPenaltyOrLateFee: totalPenalty > 0 || totalLateFee > 0,
          vacantGraceDays,
        };
        
        usersList.push(userRecord);
        count++;
      }
      
      setUsersData(usersList);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load penalty monitor data");
    } finally {
      setScreenLoading(false);
    }
  };

  const fetchMonthlyCollected = async () => {
    try {
      setMonthlyCollectedLoading(true);
      const res = await api.get("/penalty/collected-this-month");
      if (res.data.success) {
        setMonthlyCollectedSummary(res?.data?.summary);
        setMonthlyCollectedDetails(res?.data?.details || []);
      }
    } catch (err) {
      message.error("Failed to load monthly penalty collected data");
      console.error(err);
    } finally {
      setMonthlyCollectedLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMonthlyCollected();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        navigate('/penalty-settings');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Calculate totals based on backend data
  const [totals, setTotals] = useState({
    totalCustomers: 0,
    totalGroups: 0,
    totalToBePaid: 0,
    totalPaid: 0,
    totalBalance: 0,
    totalPenalty: 0,
    totalLateFee: 0,
    totalRegularPenalty: 0,
    totalVcPenalty: 0,
    totalTickets: 0,
    totalBalanceWithoutPenalty: 0,
    totalOutstandingWithPenalty: 0,
    totalPenaltyAndLateFee: 0,
    totalManualPenalty: 0,
    totalManualLateFee: 0,
  });

  useEffect(() => {
    const uniqueCustomerIds = new Set(filteredUsers.map(u => u.userId));
    const totalCustomers = uniqueCustomerIds.size;
    const groupSet = new Set(filteredUsers.map((user) => user.groupName));
    const totalGroups = groupFilter ? 1 : groupSet.size;
    const totalToBePaid = filteredUsers.reduce((sum, u) => sum + (u.totalToBePaid || 0), 0);
    const totalPaid = filteredUsers.reduce((sum, u) => sum + (u.amountPaid || 0), 0);
    const totalBalance = filteredUsers.reduce((sum, u) => sum + (u.balance || 0), 0);
    const totalBalanceWithoutPenalty = filteredUsers.reduce((sum, u) => sum + (u.balanceWithoutPenalty || 0), 0);
    const totalOutstandingWithPenalty = filteredUsers.reduce((sum, u) => sum + (u.balance || 0), 0);
    const totalPenalty = filteredUsers.reduce((sum, u) => sum + (u.totalPenalty || 0), 0);
    const totalLateFee = filteredUsers.reduce((sum, u) => sum + (u.totalLateFee || 0), 0);
    const totalPenaltyAndLateFee = totalPenalty + totalLateFee;
    const totalRegularPenalty = filteredUsers.reduce((sum, u) => sum + (u.regularPenalty || 0), 0);
    const totalVcPenalty = filteredUsers.reduce((sum, u) => sum + (u.vcPenalty || 0), 0);
    const totalManualPenalty = filteredUsers.reduce((sum, u) => sum + (u.manualPenalty || 0), 0);
    const totalManualLateFee = filteredUsers.reduce((sum, u) => sum + (u.manualLateFee || 0), 0);
    const totalTickets = filteredUsers.length;

    setTotals({
      totalCustomers,
      totalGroups,
      totalToBePaid,
      totalPaid,
      totalBalance,
      totalPenalty,
      totalLateFee,
      totalRegularPenalty,
      totalVcPenalty,
      totalTickets,
      totalBalanceWithoutPenalty,
      totalOutstandingWithPenalty,
      totalPenaltyAndLateFee,
      totalManualPenalty,
      totalManualLateFee,
    });
  }, [filteredUsers, groupFilter]);

  // Show penalty breakdown
  const handleShowBreakdown = async (userId, groupId, userName, groupName, cachedPenaltyData = null) => {
    try {
      setLoadingBreakdown(true);
      setSelectedCustomer({ userName, groupName });
      setBreakdownModal(true);
      
      // Use cached data if available
      let penaltyData = cachedPenaltyData;
      if (!penaltyData) {
        const res = await api.get("/penalty/get-penalty-report", {
          params: { user_id: userId, group_id: groupId },
        });
        if (res.data?.success && res.data?.data?.length > 0) {
          penaltyData = res.data.data[0];
        }
      }
      
      if (!penaltyData || !penaltyData.cycles) {
        message.error("No penalty breakdown data available");
        return;
      }
      
      setBreakdownData(penaltyData.cycles);
    } catch (err) {
      console.error(err);
      message.error("Failed to load penalty breakdown");
    } finally {
      setLoadingBreakdown(false);
    }
  };

  // WhatsApp Handlers
  const calculateGraceDaysLeft = (enrollmentDateStr, vacantGraceDays = 90) => {
    const enrollmentDate = moment(enrollmentDateStr);
    const today = moment().startOf("day");
    const graceEnd = enrollmentDate.clone().add(vacantGraceDays, "days");
    return Math.max(0, graceEnd.diff(today, "days"));
  };

  const calculateDaysLate = (enrollmentDateStr) => {
    const lastDue = moment().startOf("month");
    const today = moment();
    return Math.max(0, today.diff(lastDue, "days"));
  };

  const sendSingleWhatsapp = async (user, type) => {
    try {
      setScreenLoading(true);
      const payload = {
        [`user_0`]: {
          info: {
            status: true,
            userName: user.userName,
            groupName: user.groupName,
            paymentsTicket: user.paymentsTicket,
            expected: user.totalToBePaid,
            userPhone: user.userPhone,
            ...(type === "vcWithinGrace" && {
              graceDaysLeft: calculateGraceDaysLeft(user.enrollmentDate, user.vacantGraceDays),
            }),
            ...(type === "vcPenaltyApplied" && {
              appliedVcAmount: user.vcPenalty || 0,
              balance: user.balance,
            }),
            ...(type === "latePenaltyWithin" && {
              daysLate: calculateDaysLate(user.enrollmentDate),
            }),
            ...(type === "latePenaltyApplied" && {
              lateFee: user.totalLateFee,
              penalty: user.regularPenalty,
              balance: user.balance,
            }),
          },
        },
      };

      let endpoint = "";
      switch (type) {
        case "vcWithinGrace": endpoint = "/whatsapp/vc-within-grace"; break;
        case "vcPenaltyApplied": endpoint = "/whatsapp/vc-penalty-applied"; break;
        case "latePenaltyWithin": endpoint = "/whatsapp/late-penalty-within-threshold"; break;
        case "latePenaltyApplied": endpoint = "/whatsapp/late-penalty-applied"; break;
        default: throw new Error("Invalid WhatsApp type");
      }

      const res = await api.post(endpoint, payload);
      const { success, error } = res.data;
      if (success > 0) {
        message.success(`✅ WhatsApp sent to ${user.userName}`);
      } else {
        message.error(`❌ Failed to send to ${user.userName}`);
      }
    } catch (err) {
      console.error("Single WhatsApp send error:", err);
      message.error(`❌ Failed to send to ${user.userName}`);
    } finally {
      setScreenLoading(false);
    }
  };

  const handleSendWhatsapp = async () => {
    if (selectedRows.length === 0) return;
    setScreenLoading(true);
    try {
      const payload = {};
      selectedRows.forEach((user, idx) => {
        payload[`user_${idx}`] = {
          info: {
            status: true,
            userName: user.userName,
            groupName: user.groupName,
            paymentsTicket: user.paymentsTicket,
            expected: user.totalToBePaid,
            userPhone: user.userPhone,
            ...(sendModal.type === "vcWithinGrace" && {
              graceDaysLeft: calculateGraceDaysLeft(user.enrollmentDate, user.vacantGraceDays),
            }),
            ...(sendModal.type === "vcPenaltyApplied" && {
              appliedVcAmount: user.vcPenalty || 0,
              balance: user.balance,
            }),
            ...(sendModal.type === "latePenaltyWithin" && {
              daysLate: calculateDaysLate(user.enrollmentDate),
            }),
            ...(sendModal.type === "latePenaltyApplied" && {
              lateFee: user.totalLateFee,
              penalty: user.regularPenalty,
              balance: user.balance,
            }),
          },
        };
      });

      let endpoint = "";
      switch (sendModal.type) {
        case "vcWithinGrace": endpoint = "/whatsapp/vc-within-grace"; break;
        case "vcPenaltyApplied": endpoint = "/whatsapp/vc-penalty-applied"; break;
        case "latePenaltyWithin": endpoint = "/whatsapp/late-penalty-within-threshold"; break;
        case "latePenaltyApplied": endpoint = "/whatsapp/late-penalty-applied"; break;
        default: throw new Error("Invalid WhatsApp type");
      }

      const res = await api.post(endpoint, payload);
      const { success, error } = res.data;
      message.success(`✅ ${success} message(s) sent. ❌ ${error} failed.`);
      setSendModal({ open: false, type: null });
      setSelectedRows([]);
    } catch (err) {
      console.error("WhatsApp send error:", err);
      message.error("❌ Failed to send WhatsApp messages. Check console.");
    } finally {
      setScreenLoading(false);
    }
  };

  const openSendModal = (type) => {
    setSendModal({ open: true, type });
  };

  // Reversal Handlers
  const handleGroupSelect = (value) => {
    setReversalGroupFilter(value || "");
    setReversalCustomerFilter("");
    setReversalTicketFilter("");
  };
  const handleCustomerSelect = (value) => {
    setReversalCustomerFilter(value || "");
    setReversalTicketFilter("");
  };
  const handleTicketSelect = (value) => {
    setReversalTicketFilter(value);
  };

  const openReverseAmountDrawer = (type) => {
    let maxAmount = 0;
    switch (type) {
      case "late_fee": maxAmount = penaltySummary.totalLateFee; break;
      case "penalty": maxAmount = penaltySummary.regularPenalty; break;
      case "vc_penalty": maxAmount = penaltySummary.vcPenalty; break;
      case "all": maxAmount = penaltySummary.totalLateFee + penaltySummary.regularPenalty + penaltySummary.vcPenalty; break;
      default: maxAmount = 0;
    }
    setMaxAllowedAmount(maxAmount);
    setReverseAmount("");
    setSelectedReversalType(type);
    setReverseAmountDrawer(true);
    setPenaltySummaryDrawer(false);
  };

  const handleApplyReversal = async () => {
    const amount = parseFloat(reverseAmount);
    if (!amount || amount <= 0 || amount > maxAllowedAmount) {
      message.error(`Please enter a valid amount (≤ ₹${maxAllowedAmount.toFixed(2)})`);
      return;
    }
    try {
      setScreenLoading(true);
      const payload = {
        user_id: penaltySummary.userId,
        group_id: penaltySummary.groupId,
        ticket: penaltySummary.paymentsTicket,
        amount,
        type: selectedReversalType,
      };
      await api.post("/penalty/reverse-amount", payload);
      message.success("✅ Penalty reversal applied successfully!");
      setReverseAmountDrawer(false);
      fetchData();
    } catch (err) {
      console.error("Reversal error:", err);
      message.error("❌ Failed to apply reversal");
    } finally {
      setScreenLoading(false);
    }
  };

  // Add Penalty Handlers
  const handleAddPenaltyGroupSelect = (value) => {
    setAddPenaltyGroupFilter(value || "");
    setAddPenaltyCustomerFilter("");
    setAddPenaltyTicketFilter("");
  };
  const handleAddPenaltyCustomerSelect = (value) => {
    setAddPenaltyCustomerFilter(value || "");
    setAddPenaltyTicketFilter("");
  };
  const handleAddPenaltyTicketSelect = (value) => {
    setAddPenaltyTicketFilter(value);
  };

  const handleSavePenalty = async () => {
    if (!addPenaltyDetails || (!addPenaltyAmount && !addLateFeeAmount)) {
      message.error("Please enter at least one of penalty or late fee amount");
      return;
    }
    try {
      setAddPenaltyLoading(true);
      const payload = {
        user_id: addPenaltyDetails.userId,
        group_id: addPenaltyDetails.groupId,
        ticket: addPenaltyDetails.paymentsTicket,
        penalty_amount: parseFloat(addPenaltyAmount) || 0,
        late_fee_amount: parseFloat(addLateFeeAmount) || 0,
      };
      await api.post("/penalty/add-manual-penalty", payload);
      message.success("✅ Penalty added successfully!");
      setAddPenaltyDrawerOpen(false);
      setAddPenaltyDetails(null);
      setAddPenaltyAmount("");
      setAddLateFeeAmount("");
      fetchData();
    } catch (err) {
      console.error("Add penalty error:", err);
      message.error("❌ Failed to add penalty");
    } finally {
      setAddPenaltyLoading(false);
    }
  };

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // COLUMN DEFINITION
  const columns = [
    {
      key: "sl_no",
      header: "SL. NO",
      render: (text, record, index) => <span className="font-medium text-gray-700">{index + 1}</span>,
    },
    {
      key: "userName",
      header: "Customer Name",
      render: (text) => <div className="font-medium text-gray-900">{text}</div>,
    },
    {
      key: "userPhone",
      header: "Phone Number",
      render: (text) => (
        <div className="flex items-center">
          <PhoneOutlined className="mr-2 text-blue-500" />
          {text}
        </div>
      ),
    },
    {
      key: "customerId",
      header: "Customer ID",
      render: (text) => <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{text}</span>,
    },
    {
      key: "groupName",
      header: "Group Name",
      render: (text) => <Tag color="blue" className="font-medium">{text}</Tag>,
    },
    {
      key: "enrollmentDate",
      header: "Enrollment Date",
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      key: "paymentsTicket",
      header: "Ticket",
    },
    {
      key: "totalToBePaid",
      header: "Amount to be Paid",
      render: (text) => (
        <span className="font-semibold text-green-600">
          ₹{Number(text || 0).toFixed(2).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "amountPaid",
      header: "Amount Paid",
      render: (text) => (
        <span className="font-semibold text-indigo-600">
          ₹{Number(text || 0).toFixed(2).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "balanceWithoutPenalty",
      header: "Balance",
      render: (text, record) => {
        const balance = Number(record.balanceWithoutPenalty || 0);
        return (
          <span className={`font-semibold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
            ₹{balance.toFixed(2).toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      key: "totalPenalty",
      header: "Total Penalty",
      render: (text, record) => (
        <span className="font-semibold text-purple-600">
          ₹{Number(record.totalPenalty || 0).toFixed(2).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "totalLateFee",
      header: "Late Fee",
      render: (text) => (
        <span className="font-semibold text-orange-600">
          ₹{Number(text || 0).toFixed(2).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "totalOverdueCharges",
      header: "Total Overdue Charges",
      render: (text, record) => (
        <span className="font-semibold text-red-700">
          ₹{Number(record.totalOverdueCharges || 0).toFixed(2).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Outstanding with Penalty",
      render: (text) => {
        const balance = Number(text || 0);
        return (
          <span className={`font-semibold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
            ₹{balance.toFixed(2).toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (text, record) => record.actions,
    },
  ];

  const breakdownColumns = [
    {
      title: "Auction",
      dataIndex: "cycle_no",
      align: "center",
      width: 80,
      render: (text, row) =>
        row.vacant_cycle ? (
          <Tag color="gold" style={{ fontWeight: "bold" }}>
            VC
          </Tag>
        ) : (
          <span className="font-medium">{text}</span>
        ),
    },
    {
      title: "Due Date",
      dataIndex: "to_date",
      render: (v, row) =>
        row.vacant_cycle ? (
          <span style={{ color: "#b58900", fontWeight: "600" }}>{moment(v).format("DD/MM/YYYY")}</span>
        ) : (
          moment(v).format("DD/MM/YYYY")
        ),
    },
    {
      title: "Expected",
      dataIndex: "expected",
      align: "right",
      render: (v, row) => {
        const value = Number(v || 0);
        return row.vacant_cycle ? (
          <span style={{ color: "#b58900", fontWeight: "600" }}>
            ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="font-medium">
            ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      title: "Paid",
      dataIndex: "paid",
      align: "right",
      render: (v) => {
        const value = Number(v || 0);
        return <span className="text-green-600 font-medium">
          ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>;
      },
    },
    {
      title: "Balance",
      dataIndex: "balance",
      align: "right",
      render: (v) => {
        const value = Number(v || 0);
        return <span className="text-red-600 font-medium">
          ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>;
      },
    },
    {
      title: "Penalty",
      dataIndex: "penalty",
      align: "right",
      render: (v, row) => {
        const value = Number(v || 0);
        return row.vacant_cycle ? (
          <span style={{ color: "#d97706", fontWeight: 700 }}>
            ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ) : (
          <span style={{ color: value > 0 ? "red" : "gray", fontWeight: 500 }}>
            ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      title: "Late Fee",
      dataIndex: "late_payment_charges",
      align: "right",
      render: (v) => {
        const value = Number(v || 0);
        return (
          <span className="text-orange-600 font-medium">
            ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      title: "Penalty Rate",
      dataIndex: "penalty_rate_percent",
      align: "center",
      render: (v, row) =>
        row.vacant_cycle ? <Tag color="gold">VC Rate</Tag> : <span className="text-blue-600">{Number(v || 0)}%</span>,
    },
  ];

  const exportBreakdownToCSV = () => {
    if (!breakdownData.length) {
      message.warning("No data to export");
      return;
    }
    const headers = [
      "Auction",
      "Due Date",
      "Expected",
      "Paid",
      "Balance",
      "Penalty",
      "Late Fee",
      "Penalty Rate (%)",
    ];
    const csvContent = [
      headers.join(","),
      ...breakdownData.map((row) => {
        const auction = row.vacant_cycle ? "VC" : row.cycle_no;
        const dueDate = moment(row.to_date).format("DD/MM/YYYY");
        const expected = Number(row.expected || 0).toFixed(2);
        const paid = Number(row.paid || 0).toFixed(2);
        const balance = Number(row.balance || 0).toFixed(2);
        const penalty = Number(row.penalty || 0).toFixed(2);
        const lateFee = Number(row.late_payment_charges || 0).toFixed(2);
        const penaltyRate = row.vacant_cycle ? "VC Rate" : Number(row.penalty_rate_percent || 0);
        const escape = (val) =>
          typeof val === "string" && (val.includes(",") || val.includes('"'))
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        return [
          escape(auction),
          escape(dueDate),
          expected,
          paid,
          balance,
          penalty,
          lateFee,
          escape(penaltyRate),
        ].join(",");
      }),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `PenaltyBreakdown_${selectedCustomer?.userName || "customer"}_${moment().format("YYYYMMDD")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        <Sidebar />
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        {screenLoading ? (
          <div className="flex-grow flex items-center justify-center h-screen">
            <CircularLoader color="text-green-600" />
          </div>
        ) : (
          <div className="flex-grow w-1/2 p-6">
            {/* Header with buttons */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Penalty & Outstanding Report</h1>
                <p className="text-gray-600">Monitor and manage customer penalties, late fees, and outstanding amounts</p>
              </div>
              <div className="flex gap-3">
                <Button
                  type="dashed"
                  onClick={() => navigate('/penalty-settings')}
                >
                  Go to Penalty Settings
                </Button>
                <Button
                  type="primary"
                  icon={<CalculatorOutlined />}
                  onClick={() => setAddPenaltyDrawerOpen(true)}
                >
                  Add Penalty
                </Button>
                <Button
                  type="primary"
                  icon={<AiFillBackward />}
                  onClick={() => setReversalDrawerOpen(true)}
                >
                  Penalty Reversal
                </Button>
              </div>
            </div>

            {/* Main Filters */}
            <div className="mb-8">
              <Card
                className="shadow-sm rounded-lg border border-gray-200"
                title={
                  <div className="flex items-center">
                    <FilterOutlined className="mr-2 text-blue-600" />
                    <span className="font-semibold text-lg">Filters</span>
                  </div>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Filter</label>
                    <Select
                      className="w-full"
                      allowClear
                      placeholder="Select a group"
                      onChange={(value) => setGroupFilter(value)}
                      value={groupFilter || undefined}
                      suffixIcon={<UsergroupAddOutlined />}
                    >
                      {groupOptions.map((group) => (
                        <Option key={group} value={group}>
                          {group}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Customer</label>
                    <Input
                      placeholder="Search by name, phone, or ID"
                      prefix={<SearchOutlined className="text-gray-400" />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Stats Cards Section */}
            <div className="mb-8">
              {/* First Row - Compact Overview Cards */}
              <div className="mb-6">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Card className="shadow-sm border border-gray-200">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                          <UsergroupAddOutlined className="text-blue-500 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Customers</p>
                          <p className="text-xl font-bold text-gray-800">{totals.totalCustomers}</p>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card className="shadow-sm border border-gray-200">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-lg mr-4">
                          <CalculatorOutlined className="text-purple-500 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Tickets</p>
                          <p className="text-xl font-bold text-gray-800">{totals.totalTickets}</p>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card className="shadow-sm border border-gray-200">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg mr-4">
                          <UsergroupAddOutlined className="text-green-500 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Groups</p>
                          <p className="text-xl font-bold text-gray-800">{totals.totalGroups}</p>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
              <Row gutter={[12, 16]}>
                <Col xs={24} sm={4}>
                  <Card className="shadow-md border-l-4 border-l-red-500">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Total Penalty</p>
                        <p className="text-lg font-bold text-red-600">
                          ₹{Number(totals.totalPenalty || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={4}>
                  <Card className="shadow-md border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Total Late Fees</p>
                        <p className="text-lg font-bold text-orange-600">
                          ₹{Number(totals.totalLateFee || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={4}>
                  <Card className="shadow-md border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Penalty Collected</p>
                        {monthlyCollectedLoading ? (
                          <div className="flex justify-center py-1">
                            <CircularLoader size="small" />
                          </div>
                        ) : monthlyCollectedSummary ? (
                          <p className="text-lg font-bold text-amber-700">
                            ₹{Number(monthlyCollectedSummary.totalCollected).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400">No data</p>
                        )}
                      </div>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => setMonthlyDetailsModalVisible(true)}
                        className="ml-1 p-0 h-auto"
                      >
                        <EyeOutlined className="text-amber-600" />
                      </Button>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={4}>
                  <Card className="shadow-md border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Total Balance</p>
                        <p className="text-lg font-bold text-blue-600">
                          ₹{Number(totals.totalBalanceWithoutPenalty || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={4}>
                  <Card className="shadow-md border-l-4 border-l-purple-500">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Outstanding (w/ Penalty)</p>
                        <p className="text-lg font-bold text-purple-600">
                          ₹{Number(totals.totalOutstandingWithPenalty || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={4}>
                  <Card className="shadow-md border-l-4 border-l-pink-500">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Penalty + Late Fee</p>
                        <p className="text-lg font-bold text-pink-600">
                          ₹{Number(totals.totalPenaltyAndLateFee || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>

            {/* Data Table */}
            <Card
              className="shadow-sm rounded-lg border border-gray-200 overflow-hidden"
              title={
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Customer Details</span>
                  <span className="text-gray-500 text-sm">
                    {selectedRows.length > 0 ? (
                      <span className="font-medium text-blue-600">{selectedRows.length} selected</span>
                    ) : (
                      `Showing ${filteredUsers.length} of ${usersData.length} Records`
                    )}
                  </span>
                </div>
              }
              extra={
                selectedRows.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <Button
                      icon={<MessageOutlined />}
                      type="dashed"
                      onClick={() => openSendModal("vcWithinGrace")}
                      disabled={!selectedRows.some((u) => u.isVcWithinGrace)}
                    >
                      VC Grace Reminder
                    </Button>
                    <Button
                      icon={<WarningOutlined />}
                      danger
                      onClick={() => openSendModal("vcPenaltyApplied")}
                      disabled={!selectedRows.some((u) => u.isVcPenaltyApplied)}
                    >
                      VC Penalty Applied
                    </Button>
                    <Button
                      icon={<ClockCircleOutlined />}
                      onClick={() => openSendModal("latePenaltyWithin")}
                      disabled={!selectedRows.some(
                        (u) => !u.isVcWithinGrace && !u.isVcPenaltyApplied && u.statusDiv?.props?.children?.props?.children?.includes("Un Prized")
                      )}
                    >
                      Late (No Penalty)
                    </Button>
                    <Button
                      icon={<DollarCircleOutlined />}
                      type="primary"
                      onClick={() => openSendModal("latePenaltyApplied")}
                      disabled={!selectedRows.some((u) => u.hasPenaltyOrLateFee)}
                    >
                      Penalty Applied
                    </Button>
                    <Button onClick={() => setSelectedRows([])} disabled={selectedRows.length === 0}>
                      Clear ({selectedRows.length})
                    </Button>
                  </div>
                )
              }
            >
              <div className="w-full overflow-x-auto overflow-y-auto max-h-[600px]">
                <div style={{ width: "max-content" }}>
                  <DataTable
                    data={filteredUsers}
                    columns={columns}
                    exportedPdfName="Penalty Report"
                    exportedFileName="PenaltyReport.csv"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Breakdown Modal */}
      <Modal
        title={
          <div>
            <div className="flex items-center">
              <EyeOutlined className="mr-2 text-blue-600" />
              <span className="text-lg font-semibold">Penalty Breakdown</span>
            </div>
            {selectedCustomer && (
              <div className="text-sm text-gray-600 mt-1">
                {selectedCustomer.userName} - {selectedCustomer.groupName}
              </div>
            )}
          </div>
        }
        open={breakdownModal}
        onCancel={() => setBreakdownModal(false)}
        footer={null}
        width={1200}
        bodyStyle={{ padding: "20px" }}
      >
        {loadingBreakdown ? (
          <div className="flex justify-center items-center h-64">
            <CircularLoader />
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <Button
                type="primary"
                onClick={exportBreakdownToCSV}
                disabled={loadingBreakdown || !breakdownData.length}
                icon={<DownloadOutlined />}
              >
                Export to CSV
              </Button>
            </div>
            <Table
              dataSource={breakdownData.map((d, i) => ({ ...d, key: i }))}
              columns={breakdownColumns}
              pagination={false}
              bordered
              scroll={{ x: 1300, y: 400 }}
              rowClassName={(record) => (record.vacant_cycle ? "bg-yellow-50 border-l-4 border-yellow-500" : "")}
            />
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6">
              <div className="text-center">
                <div className="text-gray-500 text-sm">Expected</div>
                <div className="text-lg font-semibold">
                  ₹{breakdownData.reduce((s, d) => s + (d.expected || 0), 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-sm">Paid</div>
                <div className="text-lg font-semibold text-green-600">
                  ₹{breakdownData.reduce((s, d) => s + (d.paid || 0), 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-sm">Penalty</div>
                <div className="text-lg font-semibold text-red-600">
                  ₹{breakdownData.reduce((s, d) => s + (d.penalty || 0), 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-sm">Late Fees</div>
                <div className="text-lg font-semibold text-orange-600">
                  ₹{breakdownData.reduce((s, d) => s + (d.late_payment_charges || 0), 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-sm">VC Penalty</div>
                <div className="text-lg font-bold text-yellow-700">
                  ₹{breakdownData.filter((d) => d.vacant_cycle).reduce((s, d) => s + (d.penalty || 0), 0).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* WhatsApp Bulk Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <MessageOutlined className="mr-2 text-blue-600" />
            <span className="text-lg font-semibold">
              {sendModal.type === "vcWithinGrace" && "Send VC Grace Reminder?"}
              {sendModal.type === "vcPenaltyApplied" && "Send VC Penalty Applied Alert?"}
              {sendModal.type === "latePenaltyWithin" && "Send Late (No Penalty) Reminder?"}
              {sendModal.type === "latePenaltyApplied" && "Send Penalty Applied Notice?"}
            </span>
          </div>
        }
        open={sendModal.open}
        onCancel={() => setSendModal({ open: false, type: null })}
        onOk={handleSendWhatsapp}
        okText="Send Now"
        okButtonProps={{
          loading: screenLoading,
          danger: sendModal.type?.includes("Penalty"),
        }}
        cancelText="Cancel"
      >
        <p className="mb-4">You are about to send WhatsApp messages to <strong>{selectedRows.length}</strong> customer(s).</p>
        <ul className="list-disc pl-5 text-sm text-gray-700 max-h-32 overflow-y-auto">
          {selectedRows.slice(0, 5).map((u) => (
            <li key={u._id}>
              {u.userName} ({u.userPhone}) - {u.groupName}
            </li>
          ))}
          {selectedRows.length > 5 && <li>+ {selectedRows.length - 5} more...</li>}
        </ul>
      </Modal>

      {/* Monthly Penalty Collection Details Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <WalletOutlined className="mr-2 text-amber-600" />
            <span className="text-lg font-semibold">Monthly Penalty Collection Details</span>
          </div>
        }
        open={monthlyDetailsModalVisible}
        onCancel={() => setMonthlyDetailsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setMonthlyDetailsModalVisible(false)}>
            Back
          </Button>
        ]}
        width={1000}
        bodyStyle={{ padding: "20px" }}
      >
        {monthlyCollectedLoading ? (
          <div className="flex justify-center items-center h-64">
            <CircularLoader />
          </div>
        ) : (
          <>
            <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Total Collected This Month</div>
                  <div className="text-2xl font-bold text-amber-700">
                    ₹{Number(monthlyCollectedSummary?.totalCollected).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Number of Transactions</div>
                  <div className="text-xl font-semibold text-gray-800">
                    {monthlyCollectedDetails.length}
                  </div>
                </div>
              </div>
            </div>
            <Table
              dataSource={monthlyCollectedDetails}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 900 }}
              columns={[
                {
                  title: "Customer",
                  dataIndex: "userName",
                  key: "userName",
                  render: (name, r) => (
                    <div>
                      <div className="font-medium">{r.userName || "—"} </div>
                      <div className="text-xs text-gray-500">{r.userName}</div>
                    </div>
                  ),
                },
                { title: "Group", dataIndex: "groupName", key: "groupName" },
                { title: "Ticket", dataIndex: "ticket", key: "ticket" },
                {
                  title: "Regular",
                  dataIndex: "regular_penalty",
                  key: "regular_penalty",
                  align: "right",
                  render: (v) => `₹${Number(v || 0).toFixed(2)}`,
                },
                {
                  title: "VC Penalty",
                  dataIndex: "vc_penalty",
                  key: "vc_penalty",
                  align: "right",
                  render: (v) => `₹${Number(v || 0).toFixed(2)}`,
                },
                {
                  title: "Late Fee",
                  dataIndex: "late_fee",
                  key: "late_fee",
                  align: "right",
                  render: (v) => `₹${Number(v || 0).toFixed(2)}`,
                },
                {
                  title: "Total",
                  dataIndex: "total_penalty_deducted",
                  key: "total",
                  align: "right",
                  render: (v) => (
                    <strong className="text-green-700">₹{Number(v || 0).toFixed(2)}</strong>
                  ),
                },
                {
                  title: "Date",
                  dataIndex: "createdAt",
                  key: "date",
                  render: (d) => moment(d).format("DD MMM YYYY"),
                },
              ]}
            />
          </>
        )}
      </Modal>

      {/* Penalty Reversal Selection Drawer */}
      <Drawer
        title={
          <div className="flex items-center">
            <UndoOutlined className="mr-2 text-blue-600" />
            <span className="text-lg font-semibold">Penalty Reversal</span>
          </div>
        }
        placement="right"
        onClose={() => setReversalDrawerOpen(false)}
        open={reversalDrawerOpen}
        width={600}
        bodyStyle={{ padding: "20px" }}
      >
        <div className="mb-6">
          <Alert
            message="Select a customer to reverse penalties"
            description="Choose a group, customer, and ticket to view and reverse penalties for that account."
            type="info"
            showIcon
            className="mb-4"
          />
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
            <Select
              className="w-full"
              placeholder="Select Group"
              value={reversalGroupFilter || undefined}
              onChange={handleGroupSelect}
              allowClear
            >
              {groupOptions.map((group) => (
                <Option key={group} value={group}>
                  {group}
                </Option>
              ))}
            </Select>
            <p className="text-xs text-gray-500 mt-1">Step 1: Select a group to proceed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
            <Select
              className="w-full"
              placeholder="Select Customer"
              value={reversalCustomerFilter || undefined}
              onChange={(value) => handleCustomerSelect(value)}
              disabled={!reversalGroupFilter}
              allowClear
            >
              {customerOptions.map((user) => (
                <Option key={user.userName} value={user.userName}>
                  {user.userName}
                </Option>
              ))}
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {reversalGroupFilter
                ? "Step 2: Choose a customer from this group"
                : "Select a group first"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ticket</label>
            <Select
              className="w-full"
              placeholder="Select Ticket"
              value={reversalTicketFilter || undefined}
              onChange={handleTicketSelect}
              disabled={!reversalCustomerFilter}
              allowClear
            >
              {ticketOptions.map((ticket) => (
                <Option key={ticket} value={ticket}>
                  {ticket}
                </Option>
              ))}
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {reversalCustomerFilter
                ? "Step 3: Select a ticket to review penalties"
                : "Select a customer first"}
            </p>
          </div>
          <div className="pt-4">
            <Button
              type="primary"
              size="large"
              block
              disabled={!reversalTicketFilter}
              onClick={() => {
                const user = usersData.find(
                  (u) =>
                    u.groupName === reversalGroupFilter &&
                    u.userName === reversalCustomerFilter &&
                    u.paymentsTicket === reversalTicketFilter
                );
                if (user) {
                  setPenaltySummary({
                    userName: user.userName,
                    groupName: user.groupName,
                    userPhone: user.userPhone,
                    paymentsTicket: user.paymentsTicket,
                    userId: user.userId,
                    groupId: user.groupId,
                    totalLateFee: user.totalLateFee || 0,
                    regularPenalty: user.regularPenalty || 0,
                    vcPenalty: user.vcPenalty || 0,
                  });
                  setReversalDrawerOpen(false);
                  setPenaltySummaryDrawer(true);
                }
              }}
            >
              Review & Reverse Penalties
            </Button>
          </div>
        </div>
      </Drawer>

      <Drawer
        title={null}
        placement="right"
        onClose={() => setPenaltySummaryDrawer(false)}
        open={penaltySummaryDrawer}
        width={900}
        bodyStyle={{ padding: "0" }}
        closable={false}
      >
        {penaltySummary && (
          <div className="h-full flex flex-col bg-white">
            {/* Header Section */}
            <div className="bg-blue-100 text-white p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <Title level={3} className="text-white mb-1">Penalty Reversal</Title>
                  <Text className="text-sm">Review and reverse penalties for customer account</Text>
                </div>
                <Button
                  type="primary"
                  danger
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setPenaltySummaryDrawer(false)}
                >
                  Close
                </Button>
              </div>
            </div>
            {/* Customer Info Card */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center mb-3">
                <Title level={4} className="mb-0">Customer Details</Title>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Customer Name</Text>
                  <Text strong className="text-base">{penaltySummary.userName}</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Phone Number</Text>
                  <Text strong className="text-base">{penaltySummary.userPhone}</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Group</Text>
                  <Text strong className="text-base">{penaltySummary.groupName}</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Ticket Number</Text>
                  <Text strong className="text-base">{penaltySummary.paymentsTicket}</Text>
                </div>
              </div>
            </div>
            {/* Penalty Breakdown Section */}
            <div className="px-6 py-4 flex-grow overflow-auto">
              <Title level={4} className="mb-4">Penalty Breakdown</Title>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Card className={`h-full ${penaltySummary.totalLateFee > 0 ? '' : 'opacity-60'}`}>
                  <div className="mb-4">
                    <Title level={5} className="mb-1">Late Fee</Title>
                    <Text type="secondary" className="text-sm">Charges for delayed payments</Text>
                  </div>
                  <div className="mb-4">
                    <Text type="secondary" className="text-sm">Available for Reversal</Text>
                    <div className="text-xl font-semibold">
                      ₹{Number(penaltySummary.totalLateFee).toLocaleString("en-IN")}
                    </div>
                  </div>
                  {penaltySummary.totalLateFee > 0 && (
                    <Button
                      type="primary"
                      className="w-full"
                      onClick={() => openReverseAmountDrawer("late_fee")}
                    >
                      Review Late Fee
                    </Button>
                  )}
                </Card>
                <Card className={`h-full ${penaltySummary.regularPenalty > 0 ? '' : 'opacity-60'}`}>
                  <div className="mb-4">
                    <Title level={5} className="mb-1">Regular Penalty</Title>
                    <Text type="secondary" className="text-sm">Standard penalty charges</Text>
                  </div>
                  <div className="mb-4">
                    <Text type="secondary" className="text-sm">Available for Reversal</Text>
                    <div className="text-xl font-semibold">
                      ₹{Number(penaltySummary.regularPenalty).toLocaleString("en-IN")}
                    </div>
                  </div>
                  {penaltySummary.regularPenalty > 0 && (
                    <Button
                      type="primary"
                      className="w-full"
                      onClick={() => openReverseAmountDrawer("penalty")}
                    >
                      Review Regular Penalty
                    </Button>
                  )}
                </Card>
              </div>
              <Card className={`mb-4 ${penaltySummary.vcPenalty > 0 ? '' : 'opacity-60'}`}>
                <div className="mb-4">
                  <Title level={5} className="mb-1">Vacant Chit Penalty</Title>
                  <Text type="secondary" className="text-sm">Vacant chit penalty charges</Text>
                </div>
                <div className="mb-4">
                  <Text type="secondary" className="text-sm">Available for Reversal</Text>
                  <div className="text-xl font-semibold">
                    ₹{Number(penaltySummary.vcPenalty).toLocaleString("en-IN")}
                  </div>
                </div>
                {penaltySummary.vcPenalty > 0 && (
                  <Button
                    type="primary"
                    className="w-full"
                    onClick={() => openReverseAmountDrawer("vc_penalty")}
                  >
                    Review Vacant Chit Penalty
                  </Button>
                )}
              </Card>
              <Card className={`mb-4 ${(penaltySummary.totalLateFee + penaltySummary.regularPenalty + penaltySummary.vcPenalty) > 0 ? 'border-2 border-slate-300' : 'opacity-60'}`}>
                <div className="mb-4">
                  <Title level={5} className="mb-1">Total Reversible Amount</Title>
                  <Text type="secondary" className="text-sm">Sum of all penalties and fees</Text>
                </div>
                <div className="mb-4">
                  <Text type="secondary" className="text-sm">Total Available for Reversal</Text>
                  <div className="text-2xl font-semibold">
                    ₹{(
                      Number(penaltySummary.totalLateFee) +
                      Number(penaltySummary.regularPenalty) +
                      Number(penaltySummary.vcPenalty)
                    ).toLocaleString("en-IN")}
                  </div>
                </div>
                {(penaltySummary.totalLateFee + penaltySummary.regularPenalty + penaltySummary.vcPenalty) > 0 && (
                  <Button
                    type="primary"
                    className="w-full"
                    onClick={() => openReverseAmountDrawer("all")}
                  >
                    Review All Penalties & Fees
                  </Button>
                )}
              </Card>
              <Alert
                message="Important Information"
                description="Select a penalty type above to reverse. You may reverse part or all of any penalty type. Enter the exact amount in the next step. All reversals will be logged for audit purposes."
                type="info"
                showIcon
                className="mt-4"
              />
            </div>
          </div>
        )}
      </Drawer>

      <Drawer
        title={null}
        placement="right"
        onClose={() => {
          setReverseAmountDrawer(false);
          setPenaltySummaryDrawer(true);
        }}
        open={reverseAmountDrawer}
        width={800}
        bodyStyle={{ padding: "0" }}
        closable={false}
      >
        {penaltySummary && (
          <div className="h-full flex flex-col bg-white">
            {/* Header Section */}
            <div className="bg-blue-100 text-white p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <Title level={3} className="text-white mb-1">
                    {selectedReversalType === "late_fee"
                      ? "Reverse Late Fee"
                      : selectedReversalType === "penalty"
                      ? "Reverse Regular Penalty"
                      : selectedReversalType === "vc_penalty"
                      ? "Reverse VC Penalty"
                      : "Reverse All Penalties & Fees"}
                  </Title>
                  <Text className="text-sm">
                    Enter the amount you want to reverse from the customer's penalties
                  </Text>
                </div>
                <Button
                  type="primary"
                  danger
                  icon={<ArrowLeftOutlined />}
                  onClick={() => {
                    setReverseAmountDrawer(false);
                    setPenaltySummaryDrawer(true);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="px-6 py-4 flex-grow overflow-auto">
              {/* Customer Info */}
              <div className="mb-4 border-b pb-4">
                <Title level={4} className="mb-3">Customer Information</Title>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Customer</Text>
                    <Text strong className="text-base">{penaltySummary.userName}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Phone</Text>
                    <Text strong className="text-base">{penaltySummary.userPhone}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Group</Text>
                    <Text strong className="text-base">{penaltySummary.groupName}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Ticket</Text>
                    <Text strong className="text-base">{penaltySummary.paymentsTicket}</Text>
                  </div>
                </div>
              </div>
              {/* Available Amount Card */}
              <div className="mb-4 p-4 bg-slate-50 rounded-lg border">
                <Title level={4} className="mb-2">
                  {selectedReversalType === "late_fee"
                    ? "Late Fee Available for Reversal"
                    : selectedReversalType === "penalty"
                    ? "Regular Penalty Available for Reversal"
                    : selectedReversalType === "vc_penalty"
                    ? "VC Penalty Available for Reversal"
                    : "Total Reversible Amount"}
                </Title>
                <div className="text-2xl font-semibold mb-2">
                  ₹{maxAllowedAmount.toLocaleString("en-IN")}
                </div>
                <Text type="secondary">Maximum amount that can be reversed</Text>
              </div>
              {/* Amount Input Section */}
              <div className="mb-4">
                <Title level={4} className="mb-3">Enter Reversal Amount</Title>
                <Input
                  type="number"
                  value={reverseAmount}
                  onChange={(e) => setReverseAmount(e.target.value)}
                  placeholder={`Enter amount (e.g., ${Math.min(100, maxAllowedAmount).toLocaleString("en-IN")})`}
                  min={0}
                  step={0.01}
                  className="w-full h-12 text-lg"
                  addonBefore="₹"
                />
                {parseFloat(reverseAmount) > maxAllowedAmount && (
                  <div className="text-red-600 text-sm mt-2 flex items-center bg-red-50 p-2 rounded">
                    <ExclamationCircleOutlined className="mr-2" />
                    Amount cannot exceed ₹{maxAllowedAmount.toLocaleString("en-IN")}
                  </div>
                )}
              </div>
              {/* Quick Select Buttons */}
              <div className="mb-4">
                <Title level={5} className="mb-3">Quick Select Amount</Title>
                <div className="grid grid-cols-4 gap-3">
                  <Button
                    onClick={() => setReverseAmount((maxAllowedAmount * 0.25).toFixed(2))}
                    disabled={maxAllowedAmount <= 0}
                  >
                    25%
                  </Button>
                  <Button
                    onClick={() => setReverseAmount((maxAllowedAmount * 0.5).toFixed(2))}
                    disabled={maxAllowedAmount <= 0}
                  >
                    50%
                  </Button>
                  <Button
                    onClick={() => setReverseAmount((maxAllowedAmount * 0.75).toFixed(2))}
                    disabled={maxAllowedAmount <= 0}
                  >
                    75%
                  </Button>
                  <Button
                    onClick={() => setReverseAmount(maxAllowedAmount.toFixed(2))}
                    disabled={maxAllowedAmount <= 0}
                  >
                    100%
                  </Button>
                </div>
              </div>
              {/* Warning Alert */}
              <Alert
                message="Important Notice"
                description="Reversed amounts will be deducted from the customer's balance and logged for audit. This action cannot be undone. Please verify the amount before proceeding."
                type="warning"
                showIcon
                className="mb-4"
              />
              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  size="large"
                  className="flex-1"
                  onClick={() => {
                    setReverseAmountDrawer(false);
                    setPenaltySummaryDrawer(true);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  danger
                  size="large"
                  className="flex-1"
                  disabled={!reverseAmount || parseFloat(reverseAmount) <= 0 || parseFloat(reverseAmount) > maxAllowedAmount}
                  onClick={handleApplyReversal}
                >
                  Apply Reversal
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add Penalty Selection Drawer */}
      <Drawer
        title={
          <div className="flex items-center">
            <CalculatorOutlined className="mr-2 text-blue-600" />
            <span className="text-lg font-semibold">Add Manual Penalty</span>
          </div>
        }
        placement="right"
        onClose={() => setAddPenaltyDrawerOpen(false)}
        open={addPenaltyDrawerOpen}
        width={600}
        bodyStyle={{ padding: "20px" }}
      >
        <div className="mb-6">
          <Alert
            message="Select a customer to add manual penalties"
            description="Choose a group, customer, and ticket to add manual penalties and late fees to that account."
            type="info"
            showIcon
            className="mb-4"
          />
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
            <Select
              className="w-full"
              placeholder="Select Group"
              value={addPenaltyGroupFilter || undefined}
              onChange={handleAddPenaltyGroupSelect}
              allowClear
            >
              {groupOptions.map((group) => (
                <Option key={group} value={group}>
                  {group}
                </Option>
              ))}
            </Select>
            <p className="text-xs text-gray-500 mt-1">Step 1: Select a group to proceed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
            <Select
              className="w-full"
              placeholder="Select Customer"
              value={addPenaltyCustomerFilter || undefined}
              onChange={(value) => handleAddPenaltyCustomerSelect(value)}
              disabled={!addPenaltyGroupFilter}
              allowClear
            >
              {addPenaltyCustomerOptions.map((user) => (
                <Option key={user.userName} value={user.userName}>
                  {user.userName}
                </Option>
              ))}
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {addPenaltyGroupFilter
                ? "Step 2: Choose a customer from this group"
                : "Select a group first"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ticket</label>
            <Select
              className="w-full"
              placeholder="Select Ticket"
              value={addPenaltyTicketFilter || undefined}
              onChange={handleAddPenaltyTicketSelect}
              disabled={!addPenaltyCustomerFilter}
              allowClear
            >
              {addPenaltyTicketOptions.map((ticket) => (
                <Option key={ticket} value={ticket}>
                  {ticket}
                </Option>
              ))}
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {addPenaltyCustomerFilter
                ? "Step 3: Select a ticket to add penalties"
                : "Select a customer first"}
            </p>
          </div>
          <div className="pt-4">
            <Button
              type="primary"
              size="large"
              block
              disabled={!addPenaltyTicketFilter}
              onClick={() => {
                const user = usersData.find(
                  (u) =>
                    u.groupName === addPenaltyGroupFilter &&
                    u.userName === addPenaltyCustomerFilter &&
                    u.paymentsTicket === addPenaltyTicketFilter
                );
                if (user) {
                  setAddPenaltyDetails({
                    userName: user.userName,
                    groupName: user.groupName,
                    userPhone: user.userPhone,
                    paymentsTicket: user.paymentsTicket,
                    userId: user.userId,
                    groupId: user.groupId,
                    balance: user.balance,
                    totalPenalty: user.totalPenalty,
                    totalLateFee: user.totalLateFee,
                  });
                }
              }}
            >
              Add Penalties
            </Button>
          </div>
        </div>
      </Drawer>

      <Drawer
        title={null}
        placement="right"
        onClose={() => {
          setAddPenaltyDrawerOpen(false);
          setAddPenaltyDetails(null);
          setAddPenaltyAmount("");
          setAddLateFeeAmount("");
        }}
        open={!!addPenaltyDetails}
        width={800}
        bodyStyle={{ padding: "0" }}
        closable={false}
      >
        {addPenaltyDetails && (
          <div className="h-full flex flex-col bg-white">
            {/* Header Section */}
            <div className="bg-blue-100 text-white p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <Title level={3} className="text-white mb-1">Add Manual Penalty</Title>
                  <Text className="text-sm">Enter penalty and late fee amounts for customer account</Text>
                </div>
                <Button
                  type="primary"
                  danger
                  icon={<ArrowLeftOutlined />}
                  onClick={() => {
                    setAddPenaltyDetails(null);
                    setAddPenaltyAmount("");
                    setAddLateFeeAmount("");
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="px-6 py-4 flex-grow overflow-auto">
              {/* Customer Info */}
              <div className="mb-4 border-b pb-4">
                <Title level={4} className="mb-3">Customer Information</Title>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Customer</Text>
                    <Text strong className="text-base">{addPenaltyDetails.userName}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Phone</Text>
                    <Text strong className="text-base">{addPenaltyDetails.userPhone}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Group</Text>
                    <Text strong className="text-base">{addPenaltyDetails.groupName}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Ticket</Text>
                    <Text strong className="text-base">{addPenaltyDetails.paymentsTicket}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Current Balance</Text>
                    <Text strong className="text-base">₹{Number(addPenaltyDetails.balance || 0).toLocaleString("en-IN")}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Current Penalty</Text>
                    <Text strong className="text-base">₹{Number(addPenaltyDetails.totalPenalty || 0).toLocaleString("en-IN")}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs uppercase tracking-wide block mb-1">Current Late Fee</Text>
                    <Text strong className="text-base">₹{Number(addPenaltyDetails.totalLateFee || 0).toLocaleString("en-IN")}</Text>
                  </div>
                </div>
              </div>
              {/* Penalty Input Section */}
              <div className="mb-4">
                <Title level={4} className="mb-3">Enter Penalty Details</Title>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Penalty Amount</label>
                  <Input
                    type="number"
                    value={addPenaltyAmount}
                    onChange={(e) => setAddPenaltyAmount(e.target.value)}
                    placeholder="Enter penalty amount (e.g., 500)"
                    min={0}
                    step={0.01}
                    className="w-full h-12 text-lg"
                    addonBefore="₹"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Late Fee Amount</label>
                  <Input
                    type="number"
                    value={addLateFeeAmount}
                    onChange={(e) => setAddLateFeeAmount(e.target.value)}
                    placeholder="Enter late fee amount (e.g., 200)"
                    min={0}
                    step={0.01}
                    className="w-full h-12 text-lg"
                    addonBefore="₹"
                  />
                </div>
              </div>
              {/* Warning Alert */}
              <Alert
                message="Important Notice"
                description="The penalty and late fee amounts will be added to the customer's account. This action cannot be undone. Please verify the amounts before proceeding."
                type="warning"
                showIcon
                className="mb-4"
              />
              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  size="large"
                  className="flex-1"
                  onClick={() => {
                    setAddPenaltyDetails(null);
                    setAddPenaltyAmount("");
                    setAddLateFeeAmount("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  className="flex-1"
                  disabled={addPenaltyLoading || (!addPenaltyAmount && !addLateFeeAmount)}
                  onClick={handleSavePenalty}
                  loading={addPenaltyLoading}
                >
                  Add Penalty
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PenaltyMonitor;