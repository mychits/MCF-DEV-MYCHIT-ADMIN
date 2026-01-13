// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { Select, Tag, Space, Typography } from "antd";
// import {
//   DollarCircleOutlined,
//   TeamOutlined,
//   PlusCircleOutlined,
//   MinusCircleOutlined,
//   CreditCardOutlined,
// } from "@ant-design/icons";
// import { MdOutlineMan } from "react-icons/md";
// import { RiMoneyRupeeCircleFill } from "react-icons/ri";

// import Sidebar from "../components/layouts/Sidebar";
// import Navbar from "../components/layouts/Navbar";
// import DataTable from "../components/layouts/Datatable";
// import CircularLoader from "../components/loaders/CircularLoader";
// import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
// import api from "../instance/TokenInstance";

// const { Text, Title } = Typography;

// // Constants
// const ALERT_MESSAGES = {
//   EMPLOYEE_FETCH_ERROR: "Failed to load employees",
//   LEDGER_FETCH_ERROR: "Failed to load salary ledger",
// };

// const STATUS_TYPES = {
//   PAID: "Paid",
//   PROCESSED: "Processed",
//   PENDING: "Pending",
// };

// const CURRENCY_FORMAT_OPTIONS = {
//   style: "currency",
//   currency: "INR",
//   minimumFractionDigits: 0,
//   maximumFractionDigits: 0,
// };

// // Utility Functions
// const formatCurrency = (amount) => {
//   return amount?.toLocaleString("en-IN", CURRENCY_FORMAT_OPTIONS);
// };

// const getStatusTag = (status) => {
//   const statusConfig = {
//     [STATUS_TYPES.PAID]: { color: "green", label: "Paid" },
//     [STATUS_TYPES.PROCESSED]: { color: "blue", label: "Processed" },
//     [STATUS_TYPES.PENDING]: { color: "orange", label: "Pending" },
//   };

//   const config = statusConfig[status] || statusConfig[STATUS_TYPES.PENDING];
//   return <Tag color={config.color}>{config.label}</Tag>;
// };

// const formatLedgerData = (ledger) => {
//   return ledger.map((item, index) => {
//     const netPosition = item?.accounting?.balance ?? 0;
//     const balanceColor = netPosition >= 0 ? "text-green-600" : "text-red-600";

//     return {
//       id: index + 1,
//       month: item?.period?.label,
//       netPayable: item?.salary?.net_payable,
//       paidAmount: item?.salary?.paid_amount,
//       targetAmount: item?.business?.target,
//       businessClosed: item?.business?.total_business_closed,
//       isTargetAchieved: item?.business?.target_achieved ? "Yes" : "No",
//       incentiveEarned: item?.incentive?.earned,
//       incentivePaid: item?.incentive?.paid,
//       salaryStatus: getStatusTag(item?.salary?.status),
//       salaryStatusRaw:item?.salary?.status,
//       incentiveStatus: getStatusTag(item?.incentive?.status),
//       incentiveStatusRaw: item?.incentive?.status,
//       advanceGiven: item?.advance?.given,
//       debit: item?.accounting?.debit > 0 ? formatCurrency(item.accounting.debit) : "0",
//       debitRaw: item?.accounting?.debit > 0 ? item.accounting.debit : "0",
//       credit: item?.accounting?.credit > 0 ? formatCurrency(item.accounting.credit) : "0",
//       creditRaw: item?.accounting?.credit > 0 ? item.accounting.credit : "0",
//       balance: netPosition !== undefined ? (
//         <span className={balanceColor}>{formatCurrency(netPosition)}</span>
//       ) : (
//         "-"
//       ),
//       balanceRaw:netPosition || 0,
//       details: item,
//     };
//   });
// };

// const filterTableData = (data, searchText) => {
//   if (!searchText) return data;

//   const lowerSearchText = searchText.toLowerCase();
//   return data.filter((item) =>
//     Object.values(item).some(
//       (val) =>
//         (typeof val === "string" || typeof val === "number") &&
//         val.toString().toLowerCase().includes(lowerSearchText)
//     )
//   );
// };

// // Main Component
// const EmployeeStatement = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [ledgerData, setLedgerData] = useState([]);
//   const [tableData, setTableData] = useState([]);
//   const [overallSummary, setOverallSummary] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [alertConfig, setAlertConfig] = useState({
//     visibility: false,
//     message: "",
//     type: "info",
//   });

//   const showAlert = (message, type = "error") => {
//     setAlertConfig({
//       visibility: true,
//       message,
//       type,
//     });
//   };

//   const closeAlert = () => {
//     setAlertConfig((prev) => ({ ...prev, visibility: false }));
//   };

//   const fetchEmployees = async () => {
//     try {
//       const response = await api.get("/employee");
//       const employeeData = response.data?.employee || [];
//       setEmployees(employeeData);
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//       showAlert(ALERT_MESSAGES.EMPLOYEE_FETCH_ERROR);
//     }
//   };

//   const fetchLedgerData = async (employeeId) => {
//     try {
//       setIsLoading(true);
//       const response = await api.get(`/employee/ledgertest/${employeeId}`);
//       const ledger = response.data?.ledger || [];
//       const summary = response.data?.overall_summary;

//       const formattedData = formatLedgerData(ledger);

//       setTableData(formattedData);
//       setLedgerData(ledger);
//       setOverallSummary(summary);
//     } catch (error) {
//       console.error("Error fetching ledger data:", error);
//       showAlert(ALERT_MESSAGES.LEDGER_FETCH_ERROR);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleEmployeeSelect = (value) => {
//     setSelectedEmployee(value);
//   };

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   useEffect(() => {
//     if (selectedEmployee) {
//       fetchLedgerData(selectedEmployee);
//     } else {
//       setLedgerData([]);
//       setTableData([]);
//       setOverallSummary(null);
//     }
//   }, [selectedEmployee]);

//   const columns = [
//     { key: "id", header: "SL. NO" },
//     { key: "month", header: "Month" },
//     { key: "netPayable", header: "Net Payable" },
//     { key: "targetAmount", header: "Target" },
//     { key: "businessClosed", header: "Total Business Closed" },
//     { key: "paidAmount", header: "Total Paid Amount" },
//     { key: "isTargetAchieved", header: "Target Achieved" },
//     { key: "incentiveEarned", header: "Incentive" },
//     { key: "incentivePaid", header: "Incentive Paid Amount" },
//     { key: "advanceGiven", header: "Advance" },
//     { key: "salaryStatus", header: "Salary Status" },
//     { key: "incentiveStatus", header: "Incentive Status" },
//     { key: "debit", header: "Debit (₹)" },
//     { key: "credit", header: "Credit (₹)" },
//     { key: "balance", header: "Balance"},
//   ];

//    const columnsRaw = [
//     { key: "id", header: "SL. NO" },
//     { key: "month", header: "Month" },
//     { key: "netPayable", header: "Net Payable" },
//     { key: "targetAmount", header: "Target" },
//     { key: "businessClosed", header: "Total Business Closed" },
//     { key: "paidAmount", header: "Total Paid Amount" },
//     { key: "isTargetAchieved", header: "Target Achieved" },
//     { key: "incentiveEarned", header: "Incentive" },
//     { key: "incentivePaid", header: "Incentive Paid Amount" },
//     { key: "advanceGiven", header: "Advance" },
//     { key: "salaryStatusRaw", header: "Salary Status" },
//     { key: "incentiveStatusRaw", header: "Incentive Status" },
//     { key: "debitRaw", header: "Debit" },
//     { key: "creditRaw", header: "Credit" },
//     { key: "balanceRaw", header: "Balance"},
//   ];

//   const selectedEmployeeName = employees.find((e) => e._id === selectedEmployee)?.name;
//   const filteredTableData = filterTableData(tableData, searchText);

//   return (
//     <div>
//       <Navbar
//         visibility={true}
//         onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
//       />

//       <CustomAlertDialog
//         type={alertConfig.type}
//         isVisible={alertConfig.visibility}
//         message={alertConfig.message}
//         onClose={closeAlert}
//       />

//       <div className="flex mt-20">
//         <Sidebar />

//         <div className="flex-grow p-7">
//           {/* Quick Navigator Section */}
//           <section className="mb-8">
//             <h1 className="text-lg text-black font-bold font-mono p-2">
//               Quick Navigator
//             </h1>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               <Link
//                 to="/payment-menu/payment-in-out-menu/payment-out/salary-payment"
//                 className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
//               >
//                 <RiMoneyRupeeCircleFill
//                   className="text-blue-600 group-hover:scale-110 transition-transform"
//                   size={24}
//                 />
//                 <span className="font-medium text-gray-700 group-hover:text-blue-600">
//                   Accounts / Salary Payment
//                 </span>
//               </Link>
//               <Link
//                 to="/hr-menu/salary-management"
//                 className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
//               >
//                 <MdOutlineMan className="text-blue-600 group-hover:scale-110 transition-transform text-lg" />
//                 <span className="font-medium text-gray-700 group-hover:text-blue-600">
//                   HR / Salary Management
//                 </span>
//               </Link>
//             </div>
//           </section>

//           {/* Employee Selection Section */}
//           <section className="mt-6 mb-8">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
//               <h1 className="text-2xl font-semibold flex items-center">
//                 <TeamOutlined className="mr-2 text-blue-600" />
//                 Employee Salary Ledger
//               </h1>

//               <div className="w-full sm:w-1/4">
//                 <Select
//                   showSearch
//                   size="large"
//                   style={{ width: "100%" }}
//                   placeholder="Select an employee"
//                   optionFilterProp="children"
//                   onChange={handleEmployeeSelect}
//                   filterOption={(input, option) =>
//                     (option?.label ?? "")
//                       .toLowerCase()
//                       .includes(input.toLowerCase())
//                   }
//                   options={employees.map((emp) => ({
//                     value: emp._id,
//                     label: `${emp.name} (${emp.phone_number}) ${
//                       emp.employeeCode ? `– ${emp.employeeCode}` : ""
//                     }`,
//                     employee: emp,
//                   }))}
//                 />
//               </div>
//             </div>

//             {selectedEmployee && (
//               <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
//                 <Space>
//                   <TeamOutlined className="text-blue-600" />
//                   <Text strong>
//                     Showing ledger for:{" "}
//                     <span className="text-blue-900">{selectedEmployeeName}</span>
//                   </Text>
//                 </Space>
//               </div>
//             )}
//           </section>

//           {/* Main Content Section */}
//           {selectedEmployee ? (
//             <>
//               {tableData.length > 0 && !isLoading ? (
//                 <DataTable
//                 exportCols={columnsRaw}
//                   catcher="_id"
//                   data={filteredTableData}
//                   columns={columns}
//                   exportedPdfName={`Salary_Ledger_${selectedEmployee}`}
//                   exportedFileName={`Salary_Ledger_${selectedEmployee}.csv`}
//                 />
//               ) : (
//                 <CircularLoader
//                   isLoading={isLoading}
//                   failure={tableData.length <= 0 && !isLoading}
//                   data="Salary Ledger Data"
//                 />
//               )}

//               {/* Summary Section */}
//               {overallSummary && (
//                 <section className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                   <Title level={4} className="flex items-center">
//                     <DollarCircleOutlined className="mr-2 text-gray-600" />
//                     Summary
//                   </Title>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//                     <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
//                       <Text type="secondary" className="text-sm">
//                         Total Credits (Outstanding)
//                       </Text>
//                       <Title
//                         level={3}
//                         className="text-green-600 mb-0 mt-1 flex items-center"
//                       >
//                         <PlusCircleOutlined className="mr-2" />
//                         {formatCurrency(overallSummary?.accounting?.total_credit)}
//                       </Title>
//                     </div>
//                     <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
//                       <Text type="secondary" className="text-sm">
//                         Total Debits (Paid/Advanced)
//                       </Text>
//                       <Title
//                         level={3}
//                         className="text-red-600 mb-0 mt-1 flex items-center"
//                       >
//                         <MinusCircleOutlined className="mr-2" />
//                         {formatCurrency(overallSummary?.accounting?.total_debit)}
//                       </Title>
//                     </div>
//                     <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
//                       <Text type="secondary" className="text-sm">
//                         Net Position
//                       </Text>
//                       <Title
//                         level={3}
//                         className={`mb-0 mt-1 flex items-center ${
//                           (overallSummary?.accounting?.net_position || 0) >= 0
//                             ? "text-green-600"
//                             : "text-red-600"
//                         }`}
//                       >
//                         {(overallSummary?.accounting?.net_position || 0) >= 0 ? (
//                           <PlusCircleOutlined className="mr-2" />
//                         ) : (
//                           <MinusCircleOutlined className="mr-2" />
//                         )}
//                         {formatCurrency(overallSummary?.accounting?.net_position || 0)}
//                       </Title>
//                     </div>
//                   </div>
//                 </section>
//               )}
//             </>
//           ) : (
//             <div className="rounded-xl p-12 text-center ">
//               <div className="flex justify-center mb-4">
//                 <div className="bg-blue-100 p-4 rounded-full">
//                   <TeamOutlined className="text-blue-600 text-3xl" />
//                 </div>
//               </div>
//               <Title level={4} className="text-gray-700">
//                 Select an Employee
//               </Title>
//               <Text className="mt-2 block">
//                 Use the dropdown above to choose an employee and view their
//                 detailed salary ledger
//               </Text>
//             </div>
//           )}

//           <footer className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-sm">
//             <Space>
//               <MinusCircleOutlined className="text-red-500" />
//               <Text>
//                 <strong>Debit:</strong> Amount paid |
//                 <PlusCircleOutlined className="text-green-500 ml-2 mr-1" />
//                 <strong>Credit:</strong> Amount owed by company |
//                 <CreditCardOutlined className="ml-2 mr-1" />
//                 <strong>Balance:</strong> Credit - Debit
//               </Text>
//             </Space>
//           </footer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeStatement;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Select, Tag, Space, Typography } from "antd";
import {
  DollarCircleOutlined,
  TeamOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
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

    return {
      id: index + 1,
      month: item.period,
      netPayable: formatCurrency(item.financials?.net_payable),
      paidAmount: formatCurrency(item.financials?.paid_amount),
      targetAmount: formatCurrency(item.business?.target),
      businessClosed: formatCurrency(item.business?.totalBusinessClosed),
      achievement: getAchievementTag(item.business?.achievement),
      incentiveEarned: formatCurrency(item.business?.incentive_earned),

      balance: (
        <span className={balanceColor + " font-bold"}>
          {formatCurrency(balance)}
        </span>
      ),
      // Raw values for export functionality
      netPayableRaw: item.financials?.net_payable,
      standardDeductions: item.financials?.standard_deductions,
      advance: item.financials?.advance,
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

  const fetchLedgerData = async (employeeId) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/employee/ledgernew/${employeeId}`);
      const ledger = response.data?.ledger || [];

      setOverallNetPosition(response.data?.overall_net_position);
      setTableData(formatLedgerData(ledger));
      setLedgerData(ledger);
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
    if (selectedEmployee) fetchLedgerData(selectedEmployee);
    else {
      setLedgerData([]);
      setTableData([]);
      setOverallNetPosition(null);
    }
  }, [selectedEmployee]);

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "month", header: "Month" },
    { key: "targetAmount", header: "Target" },
    { key: "businessClosed", header: "Business Closed" },
    { key: "incentiveEarned", header: "Incentive" },
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
    { key: "advance", header: "Advance" },
    { key: "netPayableRaw", header: "Net Payable" },
    { key: "standardDeductions", header: "Standard Deductions" },
    { key: "otherPayments", header: "Other Payments" },
    { key: "grossSalary", header: "Gross Salary" },
    { key: "paidAmountRaw", header: "Paid" },
    { key: "balanceRaw", header: "Balance" },
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
                  exportedFileName={`Statement_${selectedEmployeeName}`}
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
