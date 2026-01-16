import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Select, Tag, Space, Typography, Table, Button } from "antd";
import {
  DollarCircleOutlined,
  TeamOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { MdOutlineMan } from "react-icons/md";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";

import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import api from "../instance/TokenInstance";

const { Text, Title } = Typography;

// Constants
const ALERT_MESSAGES = {
  EMPLOYEE_FETCH_ERROR: "Failed to load employees",
  LEDGER_FETCH_ERROR: "Failed to load salary ledger",
};

const CURRENCY_FORMAT_OPTIONS = {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
};

// Utility Functions
const formatCurrency = (amount) => {
  return amount?.toLocaleString("en-IN", CURRENCY_FORMAT_OPTIONS);
};

const getAchievementTag = (status) => {
  const isSuccess = status === "Met/Exceeded";
  return (
    <Tag
      color={isSuccess ? "green" : "red"}
      icon={isSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
      {status}
    </Tag>
  );
};

const formatLedgerData = (ledger) => {
  return ledger.map((item, index) => {
    const balance = item.financials?.current_running_balance ?? 0;
    const balanceColor = balance >= 0 ? "text-green-600" : "text-red-600";
    const advanceAmount = item.financials?.advance_amount || 0;
    const advanceCount = item.financials?.advance_count || 0;
    
    // Create a formatted advance string that shows amount and count
    const advanceDisplay = advanceCount > 1 
      ? `${formatCurrency(advanceAmount)}`
      : formatCurrency(advanceAmount);

    return {
      id: index + 1,
      month: item.period,
      netPayable: formatCurrency(item.financials?.net_payable),
      paidAmount: formatCurrency(item.financials?.paid_amount),
      targetAmount: formatCurrency(item.business?.target),
      businessClosed: formatCurrency(item.business?.totalBusinessClosed),
      achievement: getAchievementTag(item.business?.achievement),
      incentiveEarned: formatCurrency(item.business?.incentive_earned),
      otherIncentives: formatCurrency(item.business?.other_incentives),
      advance: advanceDisplay, // Use the formatted display string

      balance: (
        <span className={balanceColor + " font-bold"}>
          {formatCurrency(balance)}
        </span>
      ),
      netPayableRaw: item.financials?.net_payable,
      standardDeductions: item.financials?.standard_deductions,
      advanceRaw: advanceAmount, // Keep the raw amount for sorting/exporting
      advanceCount: advanceCount, // Add count for potential use
      grossSalary: item.financials?.gross_salary,
      otherPayments: item.financials?.other_payments,
      paidAmountRaw: item.financials?.paid_amount,
      targetRaw: item.business?.target,
      businessClosedRaw: item.business?.totalBusinessClosed,
      achievementRaw: item.business?.achievement,
      incentiveRaw: item.business?.incentive_earned,
      balanceRaw: balance,
      details: item,
    };
  });
};

const filterTableData = (data, searchText) => {
  if (!searchText) return data;
  const lowerSearchText = searchText.toLowerCase();
  return data.filter((item) =>
    Object.values(item).some(
      (val) =>
        (typeof val === "string" || typeof val === "number") &&
        val.toString().toLowerCase().includes(lowerSearchText)
    )
  );
};

const EmployeeStatement = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [overallNetPosition, setOverallNetPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "",
    type: "info",
  });
  const [advanceDetails, setAdvanceDetails] = useState([]);
  const [showAdvanceDetails, setShowAdvanceDetails] = useState(false);

  const showAlert = (message, type = "error") => {
    setAlertConfig({ visibility: true, message, type });
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employee");
      setEmployees(response.data?.employee || []);
    } catch (error) {
      showAlert(ALERT_MESSAGES.EMPLOYEE_FETCH_ERROR);
    }
  };

  // Modified function to fetch both ledger and advance data in a single call
  const fetchLedgerData = async (employeeId) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/employee/ledgernew/${employeeId}`);
      const ledger = response.data?.ledger || [];
      const advances = response.data?.advances || [];

      setOverallNetPosition(response.data?.overall_net_position);
      setTableData(formatLedgerData(ledger));
      setLedgerData(ledger);
      setAdvanceDetails(advances); // Set advance details from the same response
    } catch (error) {
      showAlert(ALERT_MESSAGES.LEDGER_FETCH_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchLedgerData(selectedEmployee);
    } else {
      setLedgerData([]);
      setTableData([]);
      setOverallNetPosition(null);
      setAdvanceDetails([]);
      setShowAdvanceDetails(false);
    }
  }, [selectedEmployee]);

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "month", header: "Month" },
    { key: "targetAmount", header: "Target" },
    { key: "businessClosed", header: "Business Closed" },
    { key: "incentiveEarned", header: "Incentive" },
    { key: "otherIncentives", header: "Other Incentives" },
    { key: "achievement", header: "Achievement" },
    { key: "advance", header: "Advance" },
    { key: "netPayable", header: "Net Payable" },
    { key: "standardDeductions", header: "Standard Deductions" },
    { key: "otherPayments", header: "Other Payments" },
    { key: "grossSalary", header: "Gross Salary" },
    { key: "paidAmount", header: "Paid Amount" },
    { key: "balance", header: "Running Balance" },
  ];

  const columnsRaw = [
    { key: "month", header: "Month" },
    { key: "targetRaw", header: "Target" },
    { key: "businessClosedRaw", header: "Business Closed" },
    { key: "incentiveRaw", header: "Incentive" },
    { key: "achievementRaw", header: "Achievement" },
    { key: "advanceRaw", header: "Advance" },
    { key: "netPayableRaw", header: "Net Payable" },
    { key: "standardDeductions", header: "Standard Deductions" },
    { key: "otherPayments", header: "Other Payments" },
    { key: "grossSalary", header: "Gross Salary" },
    { key: "paidAmountRaw", header: "Paid" },
    { key: "balanceRaw", header: "Balance" },
  ];

  // Columns for advance details table
  const advanceColumns = [
    {
      title: "Date",
      dataIndex: "pay_date",
      key: "pay_date",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => formatCurrency(text),
    },
    {
      title: "Pay Type",
      dataIndex: "pay_type",
      key: "pay_type",
    },
    {
      title: "Transaction ID",
      dataIndex: "transaction_id",
      key: "transaction_id",
      render: (text) => text || "N/A",
    },
  ];

  const selectedEmployeeName = employees.find(
    (e) => e._id === selectedEmployee
  )?.name;

  return (
    <div>
      <Navbar
        visibility={true}
        onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
      />
      <CustomAlertDialog
        type={alertConfig.type}
        isVisible={alertConfig.visibility}
        message={alertConfig.message}
        onClose={() => setAlertConfig((p) => ({ ...p, visibility: false }))}
      />

      <div className="flex mt-20">
        <Sidebar />
        <div className="flex-grow p-7">
          {/* Navigator */}
          <section className="mb-8">
            <h1 className="text-lg font-bold font-mono p-2">Quick Navigator</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/hr-menu/salary-management"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-blue-50 transition-all">
                <MdOutlineMan className="text-blue-600" size={20} />
                <span className="font-medium">HR / Salary Management</span>
              </Link>
            </div>
          </section>

          {/* Employee Selection */}
          <section className="mt-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-semibold flex items-center">
              <TeamOutlined className="mr-2 text-blue-600" /> Employee Statement
            </h1>
            <Select
              showSearch
              size="large"
              className="w-full sm:w-1/3"
              placeholder="Select Employee"
              onChange={setSelectedEmployee}
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              options={employees.map((emp) => ({
                value: emp._id,
                label: `${emp.name} (${emp.phone_number})`,
              }))}
            />
          </section>

          {selectedEmployee ? (
            <>
              {tableData.length > 0 && !isLoading ? (
                <DataTable
                  exportCols={columnsRaw}
                  data={filterTableData(tableData, searchText)}
                  columns={columns}
                  exportedPdfName={`Salary Statement: ${selectedEmployeeName}`}
                  exportedFileName={`Salary Statement ${selectedEmployeeName}`}
                />
              ) : (
                <CircularLoader
                  isLoading={isLoading}
                  failure={tableData.length === 0 && !isLoading}
                  data="Ledger Data"
                />
              )}

            

              {/* Updated Summary Section */}
              {overallNetPosition !== null && (
                <section className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <Title level={4} className="mb-4">
                    Financial Summary
                  </Title>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <Text type="secondary">Status Description</Text>
                      <p className="mt-2 text-sm text-gray-600">
                        The net position represents the final closing balance
                        for this employee across all periods.
                      </p>
                    </div>
                    <div
                      className={`p-6 rounded-lg border-2 flex flex-col justify-center ${
                        overallNetPosition >= 0
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}>
                      <Text strong className="text-gray-600">
                        OVERALL NET POSITION
                      </Text>
                      <Title
                        level={2}
                        className={`m-0 ${
                          overallNetPosition >= 0
                            ? "text-green-700"
                            : "text-red-700"
                        }`}>
                        {formatCurrency(overallNetPosition)}
                      </Title>
                      <Text className="text-xs mt-1 uppercase font-bold">
                        {overallNetPosition >= 0
                          ? "Amount to be Paid by Company"
                          : "Excess Paid / Advance Due"}
                      </Text>
                    </div>
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
              <TeamOutlined className="text-5xl text-gray-300 mb-4" />
              <Title level={4}>No Employee Selected</Title>
              <Text>
                Please select an employee from the dropdown to view financial
                history.
              </Text>
            </div>
          )}

          <footer className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
            <Space>
              <CreditCardOutlined />
              <Text className="text-blue-800">
                <strong>Running Balance:</strong> Positive (+) means company
                owes employee | Negative (-) means employee has taken
                excess/advance.
              </Text>
            </Space>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default EmployeeStatement;