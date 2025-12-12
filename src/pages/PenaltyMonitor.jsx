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
} from "@ant-design/icons";
import Sidebar from "../components/layouts/Sidebar";
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const PenaltyMonitor = () => {
  const [searchText, setSearchText] = useState("");
  const [screenLoading, setScreenLoading] = useState(true);
  const [usersData, setUsersData] = useState([]);
  const [groupFilter, setGroupFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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
  });

  // 🔹 Modal for breakdown
  const [breakdownModal, setBreakdownModal] = useState(false);
  const [breakdownData, setBreakdownData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  // 🔹 WhatsApp Selection & Modal
  const [selectedRows, setSelectedRows] = useState([]);
  const [sendModal, setSendModal] = useState({ open: false, type: null });

  // 🔹 Penalty Reversal State
  const [reversalGroupFilter, setReversalGroupFilter] = useState("");
  const [reversalCustomerFilter, setReversalCustomerFilter] = useState("");
  const [reversalTicketFilter, setReversalTicketFilter] = useState("");

  const [penaltySummaryDrawer, setPenaltySummaryDrawer] = useState(false);
  const [penaltySummary, setPenaltySummary] = useState(null);
  const [selectedReversalType, setSelectedReversalType] = useState(null);
  const [reverseAmountDrawer, setReverseAmountDrawer] = useState(false);
  const [reverseAmount, setReverseAmount] = useState("");
  const [maxAllowedAmount, setMaxAllowedAmount] = useState(0);

  const groupOptions = [...new Set(usersData.map((u) => u.groupName))];

  // 🔹 Customer & Ticket Options for Reversal Filters
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

  // 🔹 Fetch Data Function (extracted for reuse)
  const fetchData = async () => {
    try {
      setScreenLoading(true);
      const reportResponse = await api.get("/user/all-customers-report");
      const penaltyResponse = await api.get("/penalty/get-penalty-report");
      const allPenaltyData = penaltyResponse.data?.data || [];
      const penaltyMap = new Map();
      allPenaltyData.forEach((penalty) => {
        const key = `${penalty.user_id}_${penalty.group_id}`;
        penaltyMap.set(key, penalty);
      });
      const usersList = [];
      let count = 1;
      for (const usrData of reportResponse.data || []) {
        if (usrData?.data) {
          for (const data of usrData.data) {
            if (data?.enrollment?.group) {
              const groupId = data.enrollment.group._id;
              const userId = usrData._id;
              const penaltyKey = `${userId}_${groupId}`;
              const penaltyData = penaltyMap.get(penaltyKey) || {
                summary: {
                  total_penalty: 0,
                  total_late_payment_charges: 0,
                  grand_total_due_with_penalty: 0,
                },
                vacant_grace_days: 90,
              };
              const vacantCycles = penaltyData?.cycles?.filter((c) => c.vacant_cycle === true) || [];
              const summary = penaltyData.summary || {};
              const vcPenalty = summary.total_vacant_chit_penalty || 0;
              const regularPenalty = Math.max(0, (summary.total_penalty || 0) - vcPenalty);
              const totalLateFee = summary.total_late_payment_charges || 0;
              const totalPenalty = regularPenalty + vcPenalty;
              const balanceWithPenalty = summary.grand_total_due_with_penalty || 0;
              const enrollmentDateStr = data.enrollment.createdAt?.split("T")[0] || "";
              const enrollmentDate = moment(enrollmentDateStr);
              const today = moment().startOf("day");
              const vacantGraceDays = Number(penaltyData.vacant_grace_days || 90);
              const vcGraceEnd = enrollmentDate.clone().add(vacantGraceDays, "days").startOf("day");
              let isVcWithinGrace = false;
              let isVcPenaltyApplied = false;
              if (vacantCycles.length > 0) {
                if (today.isSameOrBefore(vcGraceEnd, "day")) {
                  isVcWithinGrace = true;
                } else {
                  isVcPenaltyApplied = true;
                }
              }
              const whatsappMenuItems = [];
              if (isVcWithinGrace) {
                whatsappMenuItems.push({
                  key: "vcWithinGrace",
                  label: "VC Grace Reminder",
                  icon: <MessageOutlined />,
                  onClick: () =>
                    sendSingleWhatsapp(
                      {
                        userName: usrData.userName,
                        groupName: data.enrollment.group.group_name,
                        paymentsTicket: data.payments.ticket,
                        totalToBePaid: summary.total_expected || 0,
                        userPhone: usrData.phone_number,
                        enrollmentDate: enrollmentDateStr,
                      },
                      "vcWithinGrace"
                    ),
                });
              }
              if (isVcPenaltyApplied) {
                whatsappMenuItems.push({
                  key: "vcPenaltyApplied",
                  label: "VC Penalty Applied",
                  icon: <WarningOutlined style={{ color: "#faad14" }} />,
                  danger: true,
                  onClick: () =>
                    sendSingleWhatsapp(
                      {
                        userName: usrData.userName,
                        groupName: data.enrollment.group.group_name,
                        paymentsTicket: data.payments.ticket,
                        totalToBePaid: summary.total_expected || 0,
                        userPhone: usrData.phone_number,
                        enrollmentDate: enrollmentDateStr,
                        vcPenalty,
                        balance: balanceWithPenalty,
                      },
                      "vcPenaltyApplied"
                    ),
                });
              }
              if (!isVcWithinGrace && !isVcPenaltyApplied && data.isPrized !== "true") {
                whatsappMenuItems.push({
                  key: "latePenaltyWithin",
                  label: "Late (No Penalty)",
                  icon: <ClockCircleOutlined />,
                  onClick: () =>
                    sendSingleWhatsapp(
                      {
                        userName: usrData.userName,
                        groupName: data.enrollment.group.group_name,
                        paymentsTicket: data.payments.ticket,
                        totalToBePaid: summary.total_expected || 0,
                        userPhone: usrData.phone_number,
                        enrollmentDate: enrollmentDateStr,
                      },
                      "latePenaltyWithin"
                    ),
                });
              }
              if (regularPenalty > 0 || totalLateFee > 0) {
                whatsappMenuItems.push({
                  key: "latePenaltyApplied",
                  label: "Penalty Applied",
                  icon: <DollarCircleOutlined style={{ color: "#cf1322" }} />,
                  danger: true,
                  onClick: () =>
                    sendSingleWhatsapp(
                      {
                        userName: usrData.userName,
                        groupName: data.enrollment.group.group_name,
                        paymentsTicket: data.payments.ticket,
                        totalToBePaid: summary.total_expected || 0,
                        userPhone: usrData.phone_number,
                        enrollmentDate: enrollmentDateStr,
                        regularPenalty,
                        totalLateFee,
                        balance: balanceWithPenalty,
                      },
                      "latePenaltyApplied"
                    ),
                });
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
                        usrData.userName,
                        data.enrollment.group.group_name,
                        penaltyData
                      )
                    }
                  >
                    View
                  </Button>
                  {/* {whatsappMenuItems.length > 0 && (
                    <Dropdown menu={{ items: whatsappMenuItems }} placement="bottomRight">
                      <Button type="dashed" size="small" icon={<SendOutlined />}>
                        WhatsApp <DownOutlined />
                      </Button>
                    </Dropdown>
                  )} */}
                </Space>
              );
              usersList.push({
                _id: data.enrollment._id,
                userId,
                groupId,
                sl_no: count,
                userName: usrData.userName,
                userPhone: usrData.phone_number,
                customerId: usrData.customer_id,
                amountPaid: summary.total_paid || 0,
                paymentsTicket: data.payments.ticket,
                amountToBePaid: summary.total_expected || 0,
                groupName: data.enrollment.group.group_name,
                enrollmentDate: enrollmentDateStr,
                totalToBePaid: summary.total_expected || 0,
                balance: balanceWithPenalty,
                regularPenalty,
                vcPenalty,
                totalPenalty,
                totalLateFee,
                actions: whatsappActions,
                statusDiv: isVcWithinGrace ? (
                  <Tag color="blue">VC – Within Grace</Tag>
                ) : isVcPenaltyApplied ? (
                  <Tag color="gold">VC Penalty Applied</Tag>
                ) : data.isPrized === "true" ? (
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
                hasPenaltyOrLateFee: regularPenalty > 0 || totalLateFee > 0,
                vacantGraceDays,
              });
              count++;
            }
          }
        }
      }
      const validUsers = usersList.filter((u) => Number(u.totalToBePaid || 0) > 0);
      setUsersData(validUsers);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load penalty monitor data");
    } finally {
      setScreenLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Calculate totals
  useEffect(() => {
    const uniqueCustomerIds = new Set(filteredUsers.map(u => u.userId));
    const totalCustomers = uniqueCustomerIds.size;
    const groupSet = new Set(filteredUsers.map((user) => user.groupName));
    const totalGroups = groupFilter ? 1 : groupSet.size;
    const totalToBePaid = filteredUsers.reduce((sum, u) => sum + (u.totalToBePaid || 0), 0);
    const totalPaid = filteredUsers.reduce((sum, u) => sum + (u.amountPaid || 0), 0);
    const totalBalance = filteredUsers.reduce((sum, u) => sum + (u.balance || 0), 0);
    const totalPenalty = filteredUsers.reduce((sum, u) => sum + (u.totalPenalty || 0), 0);
    const totalLateFee = filteredUsers.reduce((sum, u) => sum + (u.totalLateFee || 0), 0);
    const totalRegularPenalty = filteredUsers.reduce((sum, u) => sum + (u.regularPenalty || 0), 0);
    const totalVcPenalty = filteredUsers.reduce((sum, u) => sum + (u.vcPenalty || 0), 0);
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
    });
  }, [filteredUsers, groupFilter]);

  // 🔹 Show penalty breakdown
  const handleShowBreakdown = async (userId, groupId, userName, groupName, cachedPenaltyData = null) => {
    try {
      setLoadingBreakdown(true);
      setSelectedCustomer({ userName, groupName });
      setBreakdownModal(true);
      let penaltyData = cachedPenaltyData;
      if (!penaltyData) {
        const res = await api.get("/penalty/get-penalty-report", {
          params: { user_id: userId, group_id: groupId },
        });
        penaltyData = res.data;
      }
      const processedCycles = penaltyData.cycles?.map((cycle, index, arr) => {
        const carryForward = index === 0 ? 0 : arr[index - 1].balance - Math.max(0, arr[index - 1].paid - (arr[index - 1].expected + (arr[index - 1].carry_forward || 0)));
        const cycleTotal = cycle.expected + Math.max(0, carryForward);
        const nextCarryForward = cycle.balance - Math.max(0, cycle.paid - cycleTotal);
        const vcRate = cycle.vacant_cycle ? Number(cycle.penalty_rate_percent || 0) : 0;
        const appliedVcAmount = cycle.vacant_cycle ? (cycle.expected * vcRate) / 100 : 0;
        return {
          ...cycle,
          carry_forward: Math.max(0, carryForward),
          cycle_total: cycleTotal,
          next_carry_forward: Math.max(0, nextCarryForward),
          excess: Math.max(0, cycle.paid - cycleTotal),
          appliedVcAmount,
        };
      }) || [];
      setBreakdownData(processedCycles);
    } catch (err) {
      console.error(err);
      message.error("Failed to load penalty breakdown");
    } finally {
      setLoadingBreakdown(false);
    }
  };

  // 🔹 WhatsApp Handlers (unchanged)
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

  // 🔹 Reversal Handlers
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
    // const user = usersData.find(
    //   u => u.groupName === reversalGroupFilter && u.userName === reversalCustomerFilter && u.paymentsTicket === value
    // );
    // if (user) {
    //   setPenaltySummary({
    //     userName: user.userName,
    //     groupName: user.groupName,
    //     paymentsTicket: user.paymentsTicket,
    //     userId: user.userId,
    //     groupId: user.groupId,
    //     lateFee: user.totalLateFee || 0,
    //     regularPenalty: user.regularPenalty || 0,
    //     vcPenalty: user.vcPenalty || 0,
    //   });
    //   // setPenaltySummaryModal(true);
    // }
  };
  const openReverseAmountDrawer = (type) => {
    let maxAmount = 0;
    switch (type) {
      case "late_fee": maxAmount = penaltySummary.lateFee; break;
      case "penalty": maxAmount = penaltySummary.regularPenalty; break;
      case "vc_penalty": maxAmount = penaltySummary.vcPenalty; break;
      case "all": maxAmount = penaltySummary.lateFee + penaltySummary.regularPenalty + penaltySummary.vcPenalty; break;
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
      fetchData(); // Refresh
    } catch (err) {
      console.error("Reversal error:", err);
      message.error("❌ Failed to apply reversal");
    } finally {
      setScreenLoading(false);
    }
  };

  // ✅ COLUMN DEFINITION (unchanged)
  const columns = [
    // {
    //   key: "selection",
    //   header: (
    //     <Checkbox
    //       indeterminate={filteredUsers.length > 0 && selectedRows.length > 0 && selectedRows.length < filteredUsers.length}
    //       checked={filteredUsers.length > 0 && selectedRows.length === filteredUsers.length}
    //       onChange={(e) => {
    //         if (e.target.checked) {
    //           setSelectedRows([...filteredUsers]);
    //         } else {
    //           setSelectedRows([]);
    //         }
    //       }}
    //       disabled={filteredUsers.length === 0}
    //     />
    //   ),
    //   render: (_, record) => (
    //     <Checkbox
    //       checked={selectedRows.some((row) => row._id === record._id)}
    //       onChange={(e) => {
    //         if (e.target.checked) {
    //           setSelectedRows((prev) => [...prev, record]);
    //         } else {
    //           setSelectedRows((prev) => prev.filter((row) => row._id !== record._id));
    //         }
    //       }}
    //     />
    //   ),
    //   width: 50,
    //   align: "center",
    // },
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
      render: (text) => <span className="font-semibold text-green-600">₹{text?.toLocaleString("en-IN")}</span>,
    },
    {
      key: "amountPaid",
      header: "Amount Paid",
      render: (text) => <span className="font-semibold text-indigo-600">₹{text?.toLocaleString("en-IN")}</span>,
    },
    {
      key: "regularPenalty",
      header: "Penalty",
      render: (text, record) => (
        <span className="font-semibold text-red-600">₹{(record.regularPenalty || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      key: "vcPenalty",
      header: "VC Penalty",
      render: (text, record) => (
        <span className="font-semibold text-yellow-700">₹{(record.vcPenalty || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      key: "totalLateFee",
      header: "Late Fee",
      render: (text) => <span className="font-semibold text-orange-600">₹{text?.toLocaleString("en-IN")}</span>,
    },
    {
      key: "balance",
      header: "Outstanding with Penalty",
      render: (text) => (
        <span className={`font-semibold ${text > 0 ? "text-red-600" : "text-green-600"}`}>₹{text?.toLocaleString("en-IN")}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (text, record) => record.actions,
    },
    {
      key: "statusDiv",
      header: "Status",
      render: (text) => text,
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
      render: (v, row) =>
        row.vacant_cycle ? (
          <span style={{ color: "#b58900", fontWeight: "600" }}>₹{v}</span>
        ) : (
          <span className="font-medium">₹{v?.toFixed(2)}</span>
        ),
    },
    {
      title: "Paid",
      dataIndex: "paid",
      align: "right",
      render: (v) => <span className="text-green-600 font-medium">₹{v?.toFixed(2)}</span>,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      align: "right",
      render: (v) => <span className="text-red-600 font-medium">₹{v?.toFixed(2)}</span>,
    },
    {
      title: "Penalty",
      dataIndex: "penalty",
      align: "right",
      render: (v, row) =>
        row.vacant_cycle ? (
          <span style={{ color: "#d97706", fontWeight: 700 }}>₹{v}</span>
        ) : (
          <span style={{ color: v > 0 ? "red" : "gray", fontWeight: 500 }}>₹{v?.toFixed(2)}</span>
        ),
    },
    {
      title: "Late Fee",
      dataIndex: "late_payment_charges",
      align: "right",
      render: (v) => (
        <span className="text-orange-600 font-medium">₹{Number(v || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      title: "Penalty Rate",
      dataIndex: "penalty_rate_percent",
      align: "center",
      render: (v, row) =>
        row.vacant_cycle ? <Tag color="gold">VC Rate</Tag> : <span className="text-blue-600">{v}%</span>,
    },
  ];
  const filteredTableData = filterOption(
    usersData.filter((u) => {
      const matchGroup = groupFilter ? u.groupName === groupFilter : true;
      const enrollmentDate = new Date(u.enrollmentDate);
      const matchFromDate = fromDate ? enrollmentDate >= new Date(fromDate) : true;
      const matchToDate = toDate ? enrollmentDate <= new Date(toDate) : true;
      return matchGroup && matchFromDate && matchToDate;
    }),
    searchText
  );
  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        <Sidebar />
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        {screenLoading ? (
          <div className=" flex-grow flex items-center justify-center h-screen">
            <CircularLoader color="text-green-600" />
          </div>
        ) : (
          <div className="flex-grow w-1/2 p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Penalty & Outstanding Report</h1>
              <p className="text-gray-600">Monitor and manage customer penalties, late fees, and outstanding amounts</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date Range</label>
                    <RangePicker
                      className="w-full"
                      onChange={(dates) => {
                        if (dates) {
                          setFromDate(moment(dates[0]).format("YYYY-MM-DD"));
                          setToDate(moment(dates[1]).format("YYYY-MM-DD"));
                        } else {
                          setFromDate("");
                          setToDate("");
                        }
                      }}
                      format="DD/MM/YYYY"
                    />
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


            {/* 🔹 PENALTY REVERSAL FILTERS */}
            <div className="mb-8">
              <Card
                className="shadow-sm rounded-lg border border-gray-200"
                title={
                  <div className="flex items-center">
                    <DollarCircleOutlined className="mr-2 text-red-600" />
                    <span className="font-semibold text-lg">Penalty Reversal</span>
                  </div>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ticket</label>
                    <Select
                      className="w-full"
                      placeholder="Select Ticket"
                      value={reversalTicketFilter || undefined}
                      onChange={(value) => setReversalTicketFilter(value)}
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
                </div>

                <div className="flex justify-end">
                  <Button
                    type="primary"
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
                          lateFee: user.totalLateFee || 0,
                          regularPenalty: user.regularPenalty || 0,
                          vcPenalty: user.vcPenalty || 0,
                        });
                        setPenaltySummaryDrawer(true);
                      }
                    }}
                  >
                    Review & Reverse Penalties
                  </Button>
                </div>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="mb-8">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={4}>
                  <Card className="shadow-sm border border-gray-200">
                    <Statistic
                      title="Total Customers"
                      value={totals.totalCustomers}
                      prefix={<UsergroupAddOutlined className="text-blue-500" />}
                      valueStyle={{ color: "#1890ff", fontSize: "1.5rem" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Card className="shadow-sm border border-gray-200">
                    <Statistic
                      title="Total Groups"
                      value={totals.totalGroups}
                      prefix={<UsergroupAddOutlined className="text-green-500" />}
                      valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Card className="shadow-sm border border-gray-200">
                    <Statistic
                      title="Amount to be Paid"
                      value={totals.totalToBePaid}
                      precision={2}
                      valueStyle={{ color: "#1890ff", fontSize: "1.5rem" }}
                      formatter={(value) => `₹${value?.toLocaleString("en-IN")}`}
                    />
                  </Card>
                </Col>
                {/* <Col xs={24} sm={12} md={4}>
                  <Card className="shadow-sm border border-gray-200">
                    <Statistic
                      title="Total Penalty"
                      value={totals.totalPenalty}
                      precision={2}
                      valueStyle={{ color: "#ff4d4f", fontSize: "1.5rem" }}
                      formatter={(value) => `₹${value?.toLocaleString("en-IN")}`}
                    />
                  </Card>
                </Col> */}
                <Col xs={24} sm={12} md={4}>
                  <Card className="shadow-sm border border-gray-200">
                    <Statistic
                      title="Total Late Fees"
                      value={totals.totalLateFee}
                      precision={2}
                      valueStyle={{ color: "#f97316", fontSize: "1.5rem" }}
                      formatter={(value) => `₹${value?.toLocaleString("en-IN")}`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Card className="shadow-sm border border-gray-200">
                    <Statistic
                      title="Total Paid"
                      value={totals.totalPaid}
                      precision={2}
                      valueStyle={{ color: "#722ed1", fontSize: "1.5rem" }}
                      formatter={(value) => `₹${value?.toLocaleString("en-IN")}`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Card className="shadow-sm border border-gray-200">
                    <Statistic
                      title="Total Balance"
                      value={totals.totalBalance}
                      precision={2}
                      valueStyle={{ color: "#ff4d4f", fontSize: "1.5rem" }}
                      formatter={(value) => `₹${value?.toLocaleString("en-IN")}`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Card className="shadow-sm border border-gray-200">
                    <Statistic
                      title=" Penalty"
                      value={totals.totalRegularPenalty}
                      precision={2}
                      valueStyle={{ color: "#ff4d4f", fontSize: "1.5rem" }}
                      formatter={(value) => `₹${value?.toLocaleString("en-IN")}`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Card className="shadow-sm border border-gray-200">
                    <Statistic
                      title="VC Penalty"
                      value={totals.totalVcPenalty}
                      precision={2}
                      valueStyle={{ color: "#d97706", fontSize: "1.5rem" }}
                      formatter={(value) => `₹${value?.toLocaleString("en-IN")}`}
                    />
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
                      `Showing ${filteredTableData.length} of ${usersData.length} customers`
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
                    data={filteredTableData}
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

      {/* 🔹 Breakdown Modal */}
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

      {/* 🔹 WhatsApp Bulk Confirmation Modal */}
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
                  <Text className=" text-sm">Review and reverse penalties for customer account</Text>
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
                {/* Late Fee Card */}
                <Card className={`h-full ${penaltySummary.lateFee > 0 ? '' : 'opacity-60'}`}>
                  <div className="mb-4">
                    <Title level={5} className="mb-1">Late Fee</Title>
                    <Text type="secondary" className="text-sm">Charges for delayed payments</Text>
                  </div>
                  <div className="mb-4">
                    <Text type="secondary" className="text-sm">Available for Reversal</Text>
                    <div className="text-xl font-semibold">
                      ₹{Number(penaltySummary.lateFee).toLocaleString("en-IN")}
                    </div>
                  </div>
                  {penaltySummary.lateFee > 0 && (
                    <Button
                      type="primary"
                      className="w-full"
                      onClick={() => openReverseAmountDrawer("late_fee")}
                    >
                      Review Late Fee
                    </Button>
                  )}
                </Card>

                {/* Regular Penalty Card */}
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

              {/* VC Penalty Card */}
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

              {/* Total Reversal Card */}
              <Card className={`mb-4 ${(penaltySummary.lateFee + penaltySummary.regularPenalty + penaltySummary.vcPenalty) > 0 ? 'border-2 border-slate-300' : 'opacity-60'}`}>
                <div className="mb-4">
                  <Title level={5} className="mb-1">Total Reversible Amount</Title>
                  <Text type="secondary" className="text-sm">Sum of all penalties and fees</Text>
                </div>
                <div className="mb-4">
                  <Text type="secondary" className="text-sm">Total Available for Reversal</Text>
                  <div className="text-2xl font-semibold">
                    ₹{(
                      Number(penaltySummary.lateFee) +
                      Number(penaltySummary.regularPenalty) +
                      Number(penaltySummary.vcPenalty)
                    ).toLocaleString("en-IN")}
                  </div>
                </div>
                {(penaltySummary.lateFee + penaltySummary.regularPenalty + penaltySummary.vcPenalty) > 0 && (
                  <Button
                    type="primary"
                    className="w-full"
                    onClick={() => openReverseAmountDrawer("all")}
                  >
                    Review All Penalties & Fees
                  </Button>
                )}
              </Card>

              {/* Information Alert */}
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
                  <Text className=" text-sm">
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
    </div>
  );
};

export default PenaltyMonitor;