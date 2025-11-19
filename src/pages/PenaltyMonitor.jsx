/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select, Modal, Table, message, Card, Statistic, Row, Col, Button, DatePicker, Input, Tag } from "antd";
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
} from "@ant-design/icons";
import SettingSidebar from "../components/layouts/SettingSidebar";
const { RangePicker } = DatePicker;
const { Option } = Select;

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
  });

  // 🔹 Modal for breakdown
  const [breakdownModal, setBreakdownModal] = useState(false);
  const [breakdownData, setBreakdownData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  const groupOptions = [...new Set(usersData.map((u) => u.groupName))];

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

  // 🔹 Fetch all users and penalty summaries - OPTIMIZED
  useEffect(() => {
    const fetchData = async () => {
      try {
        setScreenLoading(true);

        // Get user data
        const reportResponse = await api.get("/user/all-customers-report");

        // Get ALL penalty data in ONE call
        const penaltyResponse = await api.get("/penalty/get-penalty-report"); // This now returns all data
        const allPenaltyData = penaltyResponse.data?.data || [];

        // Create a map for fast lookup: "userId_groupId" -> penalty data
        const penaltyMap = new Map();
        allPenaltyData.forEach(penalty => {
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

                // 🔥 Get penalty data from the single call (no API call here!)
                const penaltyKey = `${userId}_${groupId}`;
                const penaltyData = penaltyMap.get(penaltyKey) || {
                  summary: {
                    total_penalty: 0,
                    total_late_payment_charges: 0,
                    grand_total_due_with_penalty: 0,
                  }
                };

                const summary = penaltyData.summary || {};
                const totalPenalty = summary.total_penalty || 0;
                const totalLateFee = summary.total_late_payment_charges || 0;
                const balanceWithPenalty = summary.grand_total_due_with_penalty || 0;

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
                  enrollmentDate: data.enrollment.createdAt
                    ? data.enrollment.createdAt.split("T")[0]
                    : "",
                  totalToBePaid: summary.total_expected || 0,
                  balance: balanceWithPenalty,
                  totalPenalty: totalPenalty,
                  totalLateFee: totalLateFee,

                  // ✅ Action button - will now use cached data
                  actions: (
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
                          penaltyData // Pass the penalty data directly
                        )
                      }
                    >
                      View
                    </Button>
                  ),

                  statusDiv: data.isPrized === "true" ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Prized
                    </Tag>
                  ) : (
                    <Tag color="error" icon={<CloseCircleOutlined />}>
                      Un Prized
                    </Tag>
                  ),
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

    fetchData();
  }, []);

  // 🔹 Calculate totals
  useEffect(() => {
    const totalCustomers = filteredUsers.length;
    const groupSet = new Set(filteredUsers.map((user) => user.groupName));
    const totalGroups = groupFilter ? 1 : groupSet.size;

    const totalToBePaid = filteredUsers.reduce((sum, u) => sum + (u.totalToBePaid || 0), 0);
    const totalPaid = filteredUsers.reduce((sum, u) => sum + (u.amountPaid || 0), 0);
    const totalBalance = filteredUsers.reduce((sum, u) => sum + (u.balance || 0), 0);
    const totalPenalty = filteredUsers.reduce((sum, u) => sum + (u.totalPenalty || 0), 0);
    const totalLateFee = filteredUsers.reduce((sum, u) => sum + (u.totalLateFee || 0), 0);

    setTotals({
      totalCustomers,
      totalGroups,
      totalToBePaid,
      totalPaid,
      totalBalance,
      totalPenalty,
      totalLateFee,
    });
  }, [filteredUsers, groupFilter]);

  // 🔹 Show penalty breakdown - OPTIMIZED
  const handleShowBreakdown = async (userId, groupId, userName, groupName, cachedPenaltyData = null) => {
    try {
      setLoadingBreakdown(true);
      setSelectedCustomer({ userName, groupName });
      setBreakdownModal(true);

      let penaltyData = cachedPenaltyData;

      // Only fetch if not cached (for edge cases)
      if (!penaltyData) {
        const res = await api.get("/penalty/get-penalty-report", {
          params: { user_id: userId, group_id: groupId },
        });
        penaltyData = res.data;
      }

      setBreakdownData(penaltyData.cycles || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load penalty breakdown");
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const columns = [
    {
      key: "sl_no",
      header: "SL. NO",
      render: (text, record, index) => (
        <span className="font-medium text-gray-700">{index + 1}</span>
      ),
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
      render: (text) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{text}</span>
      ),
    },
    {
      key: "groupName",
      header: "Group Name",
      render: (text) => (
        <Tag color="blue" className="font-medium">
          {text}
        </Tag>
      ),
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
        <span className="font-semibold text-green-600">₹{text?.toLocaleString("en-IN")}</span>
      ),
    },
    {
      key: "amountPaid",
      header: "Amount Paid",
      render: (text) => (
        <span className="font-semibold text-indigo-600">₹{text?.toLocaleString("en-IN")}</span>
      ),
    },
    {
      key: "totalPenalty",
      header: "Penalty Amount",
      render: (text) => (
        <span className="font-semibold text-red-600">₹{text?.toLocaleString("en-IN")}</span>
      ),
    },
    {
      key: "totalLateFee",
      header: "Late Fee",
      render: (text) => (
        <span className="font-semibold text-orange-600">₹{text?.toLocaleString("en-IN")}</span>
      ),
    },
    {
      key: "balance",
      header: "Outstanding with Penalty",
      render: (text) => (
        <span className={`font-semibold ${text > 0 ? "text-red-600" : "text-green-600"}`}>
          ₹{text?.toLocaleString("en-IN")}
        </span>
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
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Due Date",
      dataIndex: "to_date",
      render: (v) => moment(v).format("DD/MM/YYYY"),
    },
    {
      title: "Expected",
      dataIndex: "expected",
      align: "right",
      render: (v) => <span className="font-medium">₹{v?.toFixed(2)}</span>,
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
      render: (v) => (
        <span style={{ color: v > 0 ? "red" : "gray", fontWeight: 500 }}>
          ₹{v?.toFixed(2)}
        </span>
      ),
    },
    {
      title: "Late Fee",
      dataIndex: "late_payment_charges",
      align: "right",
      render: (v) => (
        <span className="text-orange-600 font-medium">
          ₹{Number(v || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      title: "Penalty Rate",
      dataIndex: "penalty_rate_percent",
      align: "center",
      render: (v) => <span className="text-blue-600">{v}%</span>,
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
        <SettingSidebar />
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        {screenLoading ? (
          <div className="flex-grow flex items-center justify-center h-screen">
            <CircularLoader color="text-green-600" />
          </div>
        ) : (
          <div className="flex-grow p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Penalty & Outstanding Report
              </h1>
              <p className="text-gray-600">
                Monitor and manage customer penalties, late fees, and outstanding amounts
              </p>
            </div>

            {/* Filters */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group Filter
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enrollment Date Range
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Customer
                    </label>
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
                <Col xs={24} sm={12} md={4}>
                  <Card className="shadow-sm border border-gray-200">
                    <Statistic
                      title="Total Penalty"
                      value={totals.totalPenalty}
                      precision={2}
                      valueStyle={{ color: "#ff4d4f", fontSize: "1.5rem" }}
                      formatter={(value) => `₹${value?.toLocaleString("en-IN")}`}
                    />
                  </Card>
                </Col>
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
              </Row>
            </div>

            {/* Data Table */}
            <Card
              className="shadow-sm rounded-lg border border-gray-200"
              title={
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Customer Details</span>
                  <span className="text-gray-500 text-sm">
                    Showing {filteredTableData.length} of {usersData.length} customers
                  </span>
                </div>
              }
            >
              <DataTable
                data={filteredTableData}
                columns={columns}
                exportedPdfName="Penalty Report"
                exportedFileName="PenaltyReport.csv"
              />
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
        width={1000}
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
              scroll={{ y: 400 }}
              className="breakdown-table"
            />

            {/* ✅ Summary Totals */}
            {breakdownData.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-gray-500 text-sm">Expected</div>
                    <div className="text-lg font-semibold">
                      ₹{breakdownData
                        .reduce((sum, d) => sum + (d.expected || 0), 0)
                        .toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500 text-sm">Paid</div>
                    <div className="text-lg font-semibold text-green-600">
                      ₹{breakdownData
                        .reduce((sum, d) => sum + (d.paid || 0), 0)
                        .toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500 text-sm">Penalty</div>
                    <div className="text-lg font-semibold text-red-600">
                      ₹{breakdownData
                        .reduce((sum, d) => sum + (d.penalty || 0), 0)
                        .toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500 text-sm">Late Fees</div>
                    <div className="text-lg font-semibold text-orange-600">
                      ₹{breakdownData
                        .reduce((sum, d) => sum + (d.late_payment_charges || 0), 0)
                        .toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default PenaltyMonitor;