import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Select,
  DatePicker,
  Button,
  Spin,
  message,
  Row,
  Col,
  Typography,
} from "antd";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// const SalaryRemainingReport = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmp, setSelectedEmp] = useState(null);
//   const [selectedDateType, setSelectedDateType] = useState("ThisYear");
//   const [selectedFromDate, setSelectedFromDate] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [reportData, setReportData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Format date
//   const today = new Date();
//   const formatDate = (date) => date.toLocaleDateString("en-CA");

//   // 🟢 Handle predefined date ranges
//   useEffect(() => {
//     const handleDateChange = (value) => {
//       if (value === "Today") {
//         const formatted = formatDate(today);
//         setSelectedFromDate(formatted);
//         setSelectedDate(formatted);
//       } else if (value === "Yesterday") {
//         const yesterday = new Date(today);
//         yesterday.setDate(yesterday.getDate() - 1);
//         const formatted = formatDate(yesterday);
//         setSelectedFromDate(formatted);
//         setSelectedDate(formatted);
//       } else if (value === "ThisMonth") {
//         const start = new Date(today.getFullYear(), today.getMonth(), 1);
//         const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//         setSelectedFromDate(formatDate(start));
//         setSelectedDate(formatDate(end));
//       } else if (value === "LastMonth") {
//         const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//         const end = new Date(today.getFullYear(), today.getMonth(), 0);
//         setSelectedFromDate(formatDate(start));
//         setSelectedDate(formatDate(end));
//       } else if (value === "ThisYear") {
//         const start = new Date(today.getFullYear(), 0, 1);
//         const end = new Date(today.getFullYear(), 11, 31);
//         setSelectedFromDate(formatDate(start));
//         setSelectedDate(formatDate(end));
//       }
//     };

//     handleDateChange(selectedDateType);
//   }, [selectedDateType]);

//   // 🟢 Fetch Employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await api.get("/agent/get-employee"); // adjust your endpoint
//         setEmployees(res.data.employee);
//       } catch (err) {
//         message.error("Failed to fetch employees");
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // 🟣 Fetch salary remaining data

// const handleGenerateReport = async () => {
//   if (!selectedEmp) {
//     message.warning("Please select an employee");
//     return;
//   }

//   setLoading(true);
//   try {
//     // const res = await api.get("/salary/get-remaining-salary", {
//     //   empId: selectedEmp,  // ✅ must match backend exactly
//     //   from_date: selectedFromDate,
//     //   to_date: selectedDate,
//     //   year: new Date().getFullYear().toString(),
//     // });
//        const res = await api.get(
//      `/salary/get-remaining-salary?empId=${selectedEmp}&from_date=${selectedFromDate}&to_date=${selectedDate}&year=${new Date().getFullYear()}`
//    );

//     console.log("API Response:", res.data);

//     if (res.data?.success) {
//       const d = res.data;
//       const emp = employees.find((e) => e._id === selectedEmp);

//       setReportData([
//         {
//           key: d.employee_id,
//           name: emp?.name || "N/A",
//           expected: d.summary.expected,
//           paid: d.summary.paid,
//           remaining: d.summary.remaining,
//           period: `${d.period.from_date} → ${d.period.to_date}`,
//         },
//       ]);
//     } else {
//       message.warning("No salary data found");
//       setReportData([]);
//     }
//   } catch (error) {
//     console.error("Error:", error.response?.data || error.message);
//     message.error("Error fetching salary report");
//     setReportData([]);
//   } finally {
//     setLoading(false);
//   }
// };

//   // 🧾 DataTable Columns
//   const columns = [
//     { title: "Employee Name", dataIndex: "name", key: "name" },
//     { title: "Expected Salary", dataIndex: "expected", key: "expected" },
//     { title: "Total Paid", dataIndex: "paid", key: "paid" },
//     { title: "Remaining Salary", dataIndex: "remaining", key: "remaining" },
//     { title: "Period", dataIndex: "period", key: "period" },
//   ];

//   return (
//     <div className="p-6">
//       <Card bordered={false} className="shadow-md rounded-xl mb-4">
//         <Title level={3}>💼 Employee Salary Remaining Report</Title>

//         <Row gutter={[16, 16]} align="middle">
//           <Col xs={24} md={8}>
//             <label className="font-semibold">Select Employee</label>
//             <Select
//               showSearch
//               placeholder="Choose employee"
//               style={{ width: "100%" }}
//               value={selectedEmp}
//               onChange={(v) => setSelectedEmp(v)}
//               filterOption={(input, option) =>
//                 option.children.toLowerCase().includes(input.toLowerCase())
//               }
//             >
//               {employees.map((emp) => (
//                 <Option key={emp._id} value={emp._id}>
//                   {emp.name}
//                 </Option>
//               ))}
//             </Select>
//           </Col>

//           <Col xs={24} md={8}>
//             <label className="font-semibold">Select Period</label>
//             <Select
//               value={selectedDateType}
//               onChange={(value) => setSelectedDateType(value)}
//               style={{ width: "100%" }}
//             >
//               <Option value="Today">Today</Option>
//               <Option value="Yesterday">Yesterday</Option>
//               <Option value="ThisMonth">This Month</Option>
//               <Option value="LastMonth">Last Month</Option>
//               <Option value="ThisYear">This Year</Option>
//             </Select>
//           </Col>

//           <Col xs={24} md={8} className="flex items-end">
//             <Button
//               type="primary"
//               size="large"
//               loading={loading}
//               onClick={handleGenerateReport}
//               style={{ width: "100%" }}
//             >
//               Generate Report
//             </Button>
//           </Col>
//         </Row>
//       </Card>

//       {/* 🧾 Salary DataTable */}
//       <Card bordered={false} className="shadow rounded-xl">
//         <Table
//           columns={columns}
//           dataSource={reportData}
//           loading={loading}
//           pagination={false}
//           bordered
//         />
//       </Card>
//     </div>
//   );
// };

// const SalaryRemainingReport = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmp, setSelectedEmp] = useState(null);
//   const [selectedDateType, setSelectedDateType] = useState("ThisYear");
//   const [selectedFromDate, setSelectedFromDate] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [reportData, setReportData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showFilterField, setShowFilterField] = useState(false);

//   const today = new Date();
//   const formatDate = (date) => date.toLocaleDateString("en-CA");

//   useEffect(() => {
//     const handleDateChange = (value) => {
//       setShowFilterField(false);

//       if (value === "Today") {
//         const formatted = formatDate(today);
//         setSelectedFromDate(formatted);
//         setSelectedDate(formatted);
//       } else if (value === "Yesterday") {
//         const yesterday = new Date(today);
//         yesterday.setDate(yesterday.getDate() - 1);
//         const formatted = formatDate(yesterday);
//         setSelectedFromDate(formatted);
//         setSelectedDate(formatted);
//       } else if (value === "ThisMonth") {
//         const start = new Date(today.getFullYear(), today.getMonth(), 1);
//         const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//         setSelectedFromDate(formatDate(start));
//         setSelectedDate(formatDate(end));
//       } else if (value === "LastMonth") {
//         const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//         const end = new Date(today.getFullYear(), today.getMonth(), 0);
//         setSelectedFromDate(formatDate(start));
//         setSelectedDate(formatDate(end));
//       } else if (value === "ThisYear") {
//         const start = new Date(today.getFullYear(), 0, 1);
//         const end = new Date(today.getFullYear(), 11, 31);
//         setSelectedFromDate(formatDate(start));
//         setSelectedDate(formatDate(end));
//       } else if (value === "Custom") {
//         setShowFilterField(true);
//         setSelectedFromDate("");
//         setSelectedDate("");
//       }
//     };

//     handleDateChange(selectedDateType);
//   }, [selectedDateType]);

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await api.get("/agent/get-employee");
//         setEmployees(res.data.employee);
//       } catch (err) {
//         message.error("Failed to fetch employees");
//       }
//     };
//     fetchEmployees();
//   }, []);

// //   const handleGenerateReport = async () => {
// //     if (!selectedEmp) {
// //       message.warning("Please select an employee");
// //       return;
// //     }

// //     if (!selectedFromDate || !selectedDate) {
// //       message.warning("Please select valid dates");
// //       return;
// //     }

// //     setLoading(true);
// //     try {

// //       const res = await api.get(
// //         `/salary/get-remaining-salary?empId=${selectedEmp}&from_date=${selectedFromDate}&to_date=${selectedDate}&year=${new Date().getFullYear()}`
// //       );

// //       console.log("API Response:", res.data);

// //       if (res.data?.success) {
// //         const d = res.data;
// //         const emp = employees.find((e) => e._id === selectedEmp);

// //         setReportData([
// //           {
// //             key: d.employee_id,
// //             name: emp?.full_name || emp?.name || "N/A",
// //             expected: d.summary.expected,
// //             paid: d.summary.paid,
// //             remaining: d.summary.remaining,
// //             period: `${d.period.from_date} → ${d.period.to_date}`,
// //           },
// //         ]);
// //       } else {
// //         message.warning("No salary data found");
// //         setReportData([]);
// //       }
// //     } catch (error) {
// //       console.error("Error:", error.response?.data || error.message);
// //       message.error("Error fetching salary report");
// //       setReportData([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// const handleGenerateReport = async () => {
//   if (!selectedEmp) {
//     message.warning("Please select an employee");
//     return;
//   }
//   if (!selectedFromDate || !selectedDate) {
//     message.warning("Please select valid dates");
//     return;
//   }

//   setLoading(true);
//   try {
//     const res = await api.get(
//       `/salary/get-remaining-salary?empId=${selectedEmp}&from_date=${selectedFromDate}&to_date=${selectedDate}&year=${new Date().getFullYear()}`
//     );

//     if (res.data?.success && res.data.monthlyReport?.length) {
//       const emp = employees.find((e) => e._id === selectedEmp);
//       const rows = res.data.monthlyReport.map((m, index) => ({
//         key: index,
//         name: emp?.full_name || emp?.name || "N/A",
//         month: m.month,
//         expected: m.expected,
//         paid: m.paid,
//         remaining: m.remaining,
//       }));
//       setReportData(rows);
//     } else {
//       message.warning("No data found for this employee");
//       setReportData([]);
//     }
//   } catch (error) {
//     console.error("Error:", error.response?.data || error.message);
//     message.error("Error fetching salary report");
//   } finally {
//     setLoading(false);
//   }
// };

// const columns = [
//   { header: "Employee Name", key: "name" },
//   { header: "Month", key: "month" },
//   { header: "Expected Salary", key: "expected" },
//   { header: "Paid Salary", key: "paid" },
//   { header: "Remaining Salary", key: "remaining" },
// ];

//   return (
//     <div className="p-6">
//       <Card bordered={false} className="shadow-md rounded-xl mb-4">
//         <Title level={3}>Monthly Salary Report</Title>

//         <Row gutter={[16, 16]} align="middle">
//           <Col xs={24} md={8}>
//             <label className="font-semibold">Select Employee</label>
//             <Select
//               showSearch
//               placeholder="Choose employee"
//               style={{ width: "100%" }}
//               value={selectedEmp}
//               onChange={(v) => setSelectedEmp(v)}
//               filterOption={(input, option) =>
//                 option?.children?.toLowerCase().includes(input.toLowerCase())
//               }
//             >
//               {employees.map((emp) => (
//                 <Option key={emp._id} value={emp._id}>
//                   {emp.name}
//                 </Option>
//               ))}
//             </Select>
//           </Col>

//           <Col xs={24} md={8}>
//             <label className="font-semibold">Select Period</label>
//             <Select
//               value={selectedDateType}
//               onChange={(value) => setSelectedDateType(value)}
//               style={{ width: "100%" }}
//             >
//               {/* <Option value="Today">Today</Option>
//               <Option value="Yesterday">Yesterday</Option> */}
//               <Option value="ThisMonth">This Month</Option>
//               <Option value="LastMonth">Last Month</Option>
//               <Option value="ThisYear">This Year</Option>
//               <Option value="Custom">Custom</Option>
//             </Select>
//           </Col>

//           <Col xs={24} md={8} className="flex items-end">
//             <Button
//               type="primary"
//               size="large"
//               loading={loading}
//               onClick={handleGenerateReport}
//               style={{ width: "100%" }}
//             >
//               Generate Report
//             </Button>
//           </Col>
//         </Row>

//         {/* 🗓️ Custom Date Filter Fields */}
//         {showFilterField && (
//           <div className="flex gap-4 mt-4">
//             <div className="mb-2">
//               <label>From Date</label>
//               <input
//                 type="date"
//                 value={selectedFromDate}
//                 onChange={(e) => setSelectedFromDate(e.target.value)}
//                 className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full max-w-xs"
//               />
//             </div>
//             <div className="mb-2">
//               <label>To Date</label>
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full max-w-xs"
//               />
//             </div>
//           </div>
//         )}
//       </Card>

//       <Card bordered={false} className="shadow rounded-xl">
//         <DataTable
//           columns={columns}
//           data={reportData}
//           loading={loading}
//          // pagination={false}
//          // bordered
//         />
//       </Card>
//     </div>
//   );
// };

// const SalaryRemainingReport = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmp, setSelectedEmp] = useState(null);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
//   const [reportData, setReportData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // 🟢 Fetch employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await api.get("/agent/get-employee");
//         setEmployees(res.data.employee);
//       } catch (err) {
//         console.error("Error fetching employees:", err);
//         message.error("Failed to load employees");
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // 🟣 Fetch monthly salary data
//   const handleGenerateReport = async () => {
//     if (!selectedEmp) {
//       message.warning("Please select an employee");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await api.get(
//         `/salary/get-remaining-salary?empId=${selectedEmp}&year=${selectedYear}`
//       );

//       console.log("API Response:", res.data);

//       if (res.data?.success && res.data.monthlyReport.length > 0) {
//         const employee = employees.find((e) => e._id === selectedEmp);
//         const tableData = res.data.monthlyReport.map((m, index) => ({
//           key: index,
//           employee: employee?.full_name || employee?.name || "N/A",
//           month: m.month,
//           expected: m.expected,
//           paid: m.paid,
//           remaining: m.remaining,
//         }));

//         setReportData(tableData);
//       } else {
//         message.warning("No salary data found for this employee");
//         setReportData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching report:", error);
//       message.error("Error fetching salary report");
//       setReportData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🧾 Table Columns
//   const columns = [
//     { header: "Employee Name", key: "employee" },
//     { header: "Month", key: "month" },
//     { header: "Expected Salary",key: "expected" },
//     { header: "Total Paid", key: "paid" },
//     { header: "Remaining Salary", key: "remaining" },
//   ];

//   return (
//     <div className="p-6">
//       <Card bordered={false} className="shadow-md rounded-xl mb-4">
//         <Title level={3}>💼 Monthly Employee Salary Remaining Report</Title>

//         <Row gutter={[16, 16]} align="middle">
//           {/* Select Employee */}
//           <Col xs={24} md={8}>
//             <label className="font-semibold">Select Employee</label>
//             <Select
//               showSearch
//               placeholder="Choose employee"
//               style={{ width: "100%" }}
//               value={selectedEmp}
//               onChange={(v) => setSelectedEmp(v)}
//               filterOption={(input, option) =>
//                 option?.children?.toLowerCase().includes(input.toLowerCase())
//               }
//             >
//               {employees.map((emp) => (
//                 <Option key={emp._id} value={emp._id}>
//                   {emp.name}
//                 </Option>
//               ))}
//             </Select>
//           </Col>

//           {/* Select Year */}
//           <Col xs={24} md={8}>
//             <label className="font-semibold">Select Year</label>
//             <Select
//               value={selectedYear}
//               onChange={(v) => setSelectedYear(v)}
//               style={{ width: "100%" }}
//             >
//               <Option value="2025">2025</Option>
//               <Option value="2024">2024</Option>
//               <Option value="2023">2023</Option>
//             </Select>
//           </Col>

//           {/* Generate Button */}
//           <Col xs={24} md={8} className="flex items-end">
//             <Button
//               type="primary"
//               size="large"
//               loading={loading}
//               onClick={handleGenerateReport}
//               style={{ width: "100%" }}
//             >
//               Generate Report
//             </Button>
//           </Col>
//         </Row>
//       </Card>

//       {/* 🧾 Salary Table */}
//       <Card bordered={false} className="shadow rounded-xl">
//         <DataTable
//           columns={columns}
//           data={reportData}
//           loading={loading}
//           //pagination={false}
//          // bordered
//         />
//       </Card>
//     </div>
//   );
// };

// const SalaryRemainingReport = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmp, setSelectedEmp] = useState(null);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
//   const [reportData, setReportData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const allMonths = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December",
//   ];

//   // 🟢 Fetch employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await api.get("/agent/get-employee");
//         setEmployees(res.data.employee);
//       } catch (err) {
//         console.error("Error fetching employees:", err);
//         message.error("Failed to load employees");
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // 🟣 Fetch monthly salary data
//   const handleGenerateReport = async () => {
//     if (!selectedEmp) {
//       message.warning("Please select an employee");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await api.get(
//         `/salary/get-remaining-salary?empId=${selectedEmp}&year=${selectedYear}`
//       );

//       console.log("API Response:", res.data);

//       if (res.data?.success) {
//         const employee = employees.find((e) => e._id === selectedEmp);
//         const salaryData = res.data.monthlyReport || [];

//         // 🔹 Create a map of months that have data
//         const salaryMap = salaryData.reduce((acc, item) => {
//           acc[item.month] = item;
//           return acc;
//         }, {});

//         // 🔹 Build full 12-month data
//         const fullYearData = allMonths.map((month, index) => {
//           const data = salaryMap[month] || {};
//           return {
//             key: index,
//             employee: employee?.full_name || employee?.name || "N/A",
//             month,
//             expected: data.expected ?? 0,
//             paid: data.paid ?? 0,
//             remaining: data.remaining ?? data.expected ?? 0,
//           };
//         });

//         setReportData(fullYearData);
//       } else {
//         message.warning("No salary data found for this employee");
//         setReportData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching report:", error);
//       message.error("Error fetching salary report");
//       setReportData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🧾 Table Columns
//   const columns = [
//     { header: "Employee Name", key: "employee" },
//     { header: "Month", key: "month" },
//     { header: "Expected Salary", key: "expected" },
//     { header: "Total Paid", key: "paid" },
//     { header: "Remaining Salary", key: "remaining" },
//   ];

//   return (
//     <div className="p-6">
//       <Card bordered={false} className="shadow-md rounded-xl mb-4">
//         <Title level={3}>Monthly Employee Salary Report</Title>

//         <Row gutter={[16, 16]} align="middle">
//           {/* Select Employee */}
//           <Col xs={24} md={8}>
//             <label className="font-semibold">Select Employee</label>
//             <Select
//               showSearch
//               placeholder="Choose employee"
//               style={{ width: "100%" }}
//               value={selectedEmp}
//               onChange={(v) => setSelectedEmp(v)}
//               filterOption={(input, option) =>
//                 option?.children?.toLowerCase().includes(input.toLowerCase())
//               }
//             >
//               {employees.map((emp) => (
//                 <Option key={emp._id} value={emp._id}>
//                   {emp.name}
//                 </Option>
//               ))}
//             </Select>
//           </Col>

//           {/* Select Year */}
//           <Col xs={24} md={8}>
//             <label className="font-semibold">Select Year</label>
//             <Select
//               value={selectedYear}
//               onChange={(v) => setSelectedYear(v)}
//               style={{ width: "100%" }}
//             >
//               <Option value="2025">2025</Option>
//               <Option value="2024">2024</Option>
//               <Option value="2023">2023</Option>
//             </Select>
//           </Col>

//           {/* Generate Button */}
//           <Col xs={24} md={8} className="flex items-end">
//             <Button
//               type="primary"
//               size="large"
//               loading={loading}
//               onClick={handleGenerateReport}
//               style={{ width: "100%" }}
//             >
//               Generate Report
//             </Button>
//           </Col>
//         </Row>
//       </Card>

//       {/* 🧾 Salary Table */}
//       <Card bordered={false} className="shadow rounded-xl">
//         <DataTable
//           columns={columns}
//           data={reportData}
//           loading={loading}
//         />
//       </Card>
//     </div>
//   );
// };

// const SalaryRemainingReport = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmp, setSelectedEmp] = useState(null);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
//   const [reportData, setReportData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [noData, setNoData] = useState(false); // 🆕 Flag for empty results

//   const allMonths = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December",
//   ];

//   // 🟢 Fetch employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await api.get("/agent/get-employee");
//         setEmployees(res.data.employee);
//       } catch (err) {
//         console.error("Error fetching employees:", err);
//         message.error("Failed to load employees");
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // 🟣 Fetch monthly salary data
//   const handleGenerateReport = async () => {
//     if (!selectedEmp) {
//       message.warning("Please select an employee");
//       return;
//     }

//     setLoading(true);
//     setNoData(false);

//     try {
//       const res = await api.get(
//         `/salary/get-remaining-salary?empId=${selectedEmp}&year=${selectedYear}`
//       );

//       console.log("API Response:", res.data);

//       if (res.data?.success && res.data.monthlyReport?.length > 0) {
//         const employee = employees.find((e) => e._id === selectedEmp);
//         const salaryData = res.data.monthlyReport;

//         // 🔹 Create a map of months that have data
//         const salaryMap = salaryData.reduce((acc, item) => {
//           acc[item.month] = item;
//           return acc;
//         }, {});

//         // 🔹 Build full 12-month data (mix with API data)
//         const fullYearData = allMonths.map((month, index) => {
//           const data = salaryMap[month] || {};
//           return {
//             key: index,
//             employee: employee?.full_name || employee?.name || "N/A",
//             month,
//             expected: data.expected ?? 0,
//             paid: data.paid ?? 0,
//             remaining: data.remaining ?? (data.expected ?? 0),
//           };
//         });

//         setReportData(fullYearData);
//       } else {
//         // ❌ No data found
//         setReportData([]);
//         setNoData(true);
//       }
//     } catch (error) {
//       console.error("Error fetching report:", error);
//       message.error("Error fetching salary report");
//       setReportData([]);
//       setNoData(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🧾 Table Columns
//   const columns = [
//     { header: "Employee Name", key: "employee" },
//     { header: "Month", key: "month" },
//     { header: "Expected Salary", key: "expected" },
//     { header: "Total Paid", key: "paid" },
//     { header: "Remaining Salary", key: "remaining" },
//   ];

//   return (
//     <div className="p-6">
//       <Card bordered={false} className="shadow-md rounded-xl mb-4">
//         <Title level={3}>Monthly Employee Salary Report</Title>

//         <Row gutter={[16, 16]} align="middle">
//           {/* Select Employee */}
//           <Col xs={24} md={8}>
//             <label className="font-semibold">Select Employee</label>
//             <Select
//               showSearch
//               placeholder="Choose employee"
//               style={{ width: "100%" }}
//               value={selectedEmp}
//               onChange={(v) => setSelectedEmp(v)}
//               filterOption={(input, option) =>
//                 option?.children?.toLowerCase().includes(input.toLowerCase())
//               }
//             >
//               {employees.map((emp) => (
//                 <Option key={emp._id} value={emp._id}>
//                   {emp.name}
//                 </Option>
//               ))}
//             </Select>
//           </Col>

//           {/* Select Year */}
//           <Col xs={24} md={8}>
//             <label className="font-semibold">Select Year</label>
//             <Select
//               value={selectedYear}
//               onChange={(v) => setSelectedYear(v)}
//               style={{ width: "100%" }}
//             >
//               <Option value="2025">2025</Option>
//               <Option value="2024">2024</Option>
//               <Option value="2023">2023</Option>
//             </Select>
//           </Col>

//           {/* Generate Button */}
//           <Col xs={24} md={8} className="flex items-end">
//             <Button
//               type="primary"
//               size="large"
//               loading={loading}
//               onClick={handleGenerateReport}
//               style={{ width: "100%" }}
//             >
//               Generate Report
//             </Button>
//           </Col>
//         </Row>
//       </Card>

//       {/* 🧾 Salary Table */}
//       <Card bordered={false} className="shadow rounded-xl">
//         {noData ? (
//           <Empty
//             description={`No data found for this employee in ${selectedYear}`}
//             image={Empty.PRESENTED_IMAGE_SIMPLE}
//           />
//         ) : (
//           <DataTable columns={columns} data={reportData} loading={loading} />
//         )}
//       </Card>
//     </div>
//   );
// };

// const SalaryRemainingReport = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmp, setSelectedEmp] = useState(null);
//   const [selectedYear, setSelectedYear] = useState(moment().year().toString());
//   const [dateRange, setDateRange] = useState([
//     moment().startOf("year"),
//     moment().endOf("year"),
//   ]);
//   const [reportData, setReportData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // 🟢 Fetch employees on mount
//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const res = await api.get("/agent/get-employee"); // 🔹 Adjust this API endpoint
//       setEmployees(res.data.employee || []);
//     } catch (err) {
//       console.error("Error fetching employees:", err);
//       message.error("Failed to fetch employee list");
//     }
//   };

//   // 🟢 Fetch monthly remaining salary report
//   const fetchSalaryReport = async () => {
//     if (!selectedEmp) {
//       message.warning("Please select an employee");
//       return;
//     }

//     const [fromDate, toDate] = dateRange;
//     if (!fromDate || !toDate) {
//       message.warning("Please select a date range");
//       return;
//     }

//     setLoading(true);
//     try {
//       const params = {
//         empId: selectedEmp,
//         from_date: fromDate.startOf("month").toISOString(),
//         to_date: toDate.endOf("month").toISOString(),
//         year: selectedYear,
//       };

//       const res = await api.get("/salary/get-remaining-salary", { params });
//       if (res.data.success) {
//         setReportData(res.data.monthlyReport || []);
//       } else {
//         message.error("Failed to load salary report");
//       }
//     } catch (err) {
//       console.error("Error fetching salary report:", err);
//       message.error("Error loading salary report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const columns = [
//     {
//       title: "Month",
//       dataIndex: "month",
//       key: "month",
//       align: "center",
//     },
//     {
//       title: "Expected Salary",
//       dataIndex: "expected",
//       key: "expected",
//       align: "right",
//     },
//     {
//       title: "Paid Salary",
//       dataIndex: "paid",
//       key: "paid",
//       align: "right",
//     },
//     {
//       title: "Remaining Salary",
//       dataIndex: "remaining",
//       key: "remaining",
//       align: "right",
//       render: (value) => (
//         <span
//           style={{
//             color: value === "₹0.00" ? "green" : "red",
//             fontWeight: 600,
//           }}
//         >
//           {value}
//         </span>
//       ),
//     },
//   ];

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-xl font-semibold mb-4 text-gray-700">
//         💼 Monthly Salary Remaining Report
//       </h2>

//       {/* Filters */}
//       <div className="flex flex-wrap gap-4 mb-5">
//         <div className="flex flex-col">
//           <label className="mb-1 font-medium text-gray-600">Employee</label>
//           <Select
//             showSearch
//             placeholder="Select Employee"
//             value={selectedEmp}
//             onChange={setSelectedEmp}
//             style={{ width: 200 }}
//             optionFilterProp="children"
//           >
//             {employees.map((emp) => (
//               <Option key={emp._id} value={emp._id}>
//                 {emp.name}
//               </Option>
//             ))}
//           </Select>
//         </div>

//         <div className="flex flex-col">
//           <label className="mb-1 font-medium text-gray-600">Year</label>
//           <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 120 }}>
//             {Array.from({ length: 5 }, (_, i) => {
//               const year = moment().year() - i;
//               return (
//                 <Option key={year} value={year.toString()}>
//                   {year}
//                 </Option>
//               );
//             })}
//           </Select>
//         </div>

//         <div className="flex flex-col">
//           <label className="mb-1 font-medium text-gray-600">Date Range</label>
//           <RangePicker
//             picker="month"
//             value={dateRange}
//             onChange={(dates) => setDateRange(dates)}
//             allowClear={false}
//           />
//         </div>

//         <div className="flex items-end">
//           <Button type="primary" onClick={fetchSalaryReport} loading={loading}>
//             Generate Report
//           </Button>
//         </div>
//       </div>

//       {/* Report Table */}
//       {loading ? (
//         <div className="flex justify-center items-center py-10">
//           <Spin size="large" />
//         </div>
//       ) : reportData.length > 0 ? (
//         <Table
//           columns={columns}
//           dataSource={reportData}
//           pagination={false}
//           rowKey={(r) => r.month}
//           bordered
//         />
//       ) : (
//         <div className="text-center text-gray-500 py-10">
//           No data found for this employee and date range
//         </div>
//       )}
//     </div>
//   );
// };

// const SalaryRemainingReport = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmp, setSelectedEmp] = useState(null);
//   const [selectedYear, setSelectedYear] = useState(moment().year().toString());
//   const [dateRange, setDateRange] = useState([
//     moment().startOf("year"),
//     moment().endOf("year"),
//   ]);
//   const [reportData, setReportData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [totals, setTotals] = useState({
//     totalExpected: 0,
//     totalPaid: 0,
//     totalRemaining: 0,
//   });

//   // 🟢 Fetch employees on mount
//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const res = await api.get("/agent/get-employee");
//       setEmployees(res.data.employee || []);
//     } catch (err) {
//       console.error("Error fetching employees:", err);
//       message.error("Failed to fetch employee list");
//     }
//   };

//   // 🟢 Fetch Salary Report
//   const fetchSalaryReport = async () => {
//     if (!selectedEmp) {
//       message.warning("Please select an employee");
//       return;
//     }

//     const employee = employees.find((e) => e._id === selectedEmp);
//     if (!employee) {
//       message.error("Employee not found");
//       return;
//     }

//     // 🗓 Start date = Employee's Date of Joining or Year Start
//     const fromDate = employee.date_of_joining
//       ? moment(employee.date_of_joining)
//       : moment().startOf("year");

//     const toDate = moment().endOf("year");

//     setDateRange([fromDate, toDate]);
//     setLoading(true);

//     try {
//       const params = {
//         empId: selectedEmp,
//         from_date: fromDate.startOf("month").toISOString(),
//         to_date: toDate.endOf("month").toISOString(),
//         year: selectedYear,
//       };

//       const res = await api.get("/salary/get-remaining-salary", { params });
//       if (res.data.success) {
//         setReportData(res.data.monthlyReport || []);
//         setTotals(res.data.totals || {
//           totalExpected: 0,
//           totalPaid: 0,
//           totalRemaining: 0,
//         });
//       } else {
//         message.error("Failed to load salary report");
//       }
//     } catch (err) {
//       console.error("Error fetching salary report:", err);
//       message.error("Error loading salary report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const columns = [
//     {
//       title: "Month",
//       dataIndex: "month",
//       key: "month",
//       align: "center",
//     },
//     {
//       title: "Expected Salary",
//       dataIndex: "expected",
//       key: "expected",
//       align: "right",
//     },
//     {
//       title: "Paid Salary",
//       dataIndex: "paid",
//       key: "paid",
//       align: "right",
//     },
//     {
//       title: "Remaining Salary",
//       dataIndex: "remaining",
//       key: "remaining",
//       align: "right",
//       render: (value) => (
//         <span
//           style={{
//             color: value === "₹0.00" ? "green" : "red",
//             fontWeight: 600,
//           }}
//         >
//           {value}
//         </span>
//       ),
//     },
//   ];

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-xl font-semibold mb-6 text-gray-700 text-center">
//         💼 Employee Salary Remaining Report ({selectedYear})
//       </h2>

//       {/* Filters */}
//       <div className="flex flex-wrap gap-4 mb-6 justify-center">
//         <div className="flex flex-col">
//           <label className="mb-1 font-medium text-gray-600">Employee</label>
//           <Select
//             showSearch
//             placeholder="Select Employee"
//             value={selectedEmp}
//             onChange={setSelectedEmp}
//             style={{ width: 220 }}
//             optionFilterProp="children"
//           >
//             {employees.map((emp) => (
//               <Option key={emp._id} value={emp._id}>
//                 {emp.name}
//               </Option>
//             ))}
//           </Select>
//         </div>

//         <div className="flex flex-col">
//           <label className="mb-1 font-medium text-gray-600">Year</label>
//           <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 120 }}>
//             {Array.from({ length: 5 }, (_, i) => {
//               const year = moment().year() - i;
//               return (
//                 <Option key={year} value={year.toString()}>
//                   {year}
//                 </Option>
//               );
//             })}
//           </Select>
//         </div>

//         <div className="flex items-end">
//           <Button type="primary" onClick={fetchSalaryReport} loading={loading}>
//             Generate Report
//           </Button>
//         </div>
//       </div>

//       {/* 🧾 Show Totals */}
//       {totals && (
//         <div className="flex flex-wrap justify-center gap-6 mb-8">
//           <div className="bg-green-100 border border-green-400 rounded-lg p-4 w-60 text-center">
//             <h3 className="text-sm font-medium text-gray-600">Expected Salary</h3>
//             <p className="text-xl font-semibold text-green-800">
//               ₹{totals.totalExpected?.toLocaleString() || 0}
//             </p>
//           </div>
//           <div className="bg-blue-100 border border-blue-400 rounded-lg p-4 w-60 text-center">
//             <h3 className="text-sm font-medium text-gray-600">Paid Salary</h3>
//             <p className="text-xl font-semibold text-blue-800">
//               ₹{totals.totalPaid?.toLocaleString() || 0}
//             </p>
//           </div>
//           <div className="bg-red-100 border border-red-400 rounded-lg p-4 w-60 text-center">
//             <h3 className="text-sm font-medium text-gray-600">Remaining Salary</h3>
//             <p className="text-xl font-semibold text-red-800">
//               ₹{totals.totalRemaining?.toLocaleString() || 0}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Date of Joining */}
//       {selectedEmp && (
//         <p className="text-center text-gray-500 mb-4">
//           Showing data from{" "}
//           <span className="font-medium text-gray-700">
//             {employees.find((e) => e._id === selectedEmp)?.date_of_joining
//               ? moment(employees.find((e) => e._id === selectedEmp).date_of_joining).format("DD-MM-YYYY")
//               : "Start of Year"}
//           </span>
//         </p>
//       )}

//       {/* Report Table */}
//       {loading ? (
//         <div className="flex justify-center items-center py-10">
//           <Spin size="large" />
//         </div>
//       ) : reportData.length > 0 ? (
//         <Table
//           columns={columns}
//           dataSource={reportData}
//           pagination={false}
//           rowKey={(r) => r.month}
//           bordered
//         />
//       ) : (
//         <div className="text-center text-gray-500 py-10">
//           No data found for this employee and date range
//         </div>
//       )}
//     </div>
//   );
// };

// const SalaryRemainingReport = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmp, setSelectedEmp] = useState(null);
//   const [selectedYear, setSelectedYear] = useState(moment().year().toString());
//   const [reportData, setReportData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [summary, setSummary] = useState({});
//   const [joiningDate, setJoiningDate] = useState("");

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const res = await api.get("/agent/get-employee");
//       setEmployees(res.data.employee || []);
//     } catch (err) {
//       message.error("Failed to fetch employees");
//     }
//   };

//   const fetchSalaryReport = async () => {
//     if (!selectedEmp) {
//       message.warning("Please select an employee");
//       return;
//     }

//     setLoading(true);
//     try {
//       const params = { empId: selectedEmp, year: selectedYear };
//       const res = await api.get("/salary/get-remaining-salary", { params });
//       console.info(res, "testing")
//       if (res.data.success) {
//         setReportData(res.data.monthlyReport || []);
//         setSummary(res.data.summary || {});
//         setJoiningDate(res.data.joining_date);
//       } else {
//         message.error("Failed to load salary report");
//       }
//     } catch (err) {
//       console.error("Error fetching salary report:", err);
//       message.error("Error loading salary report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const columns = [
//     { title: "Month", dataIndex: "month", align: "center" },
//     { title: "Expected Salary", dataIndex: "expected", align: "right" },
//     { title: "Paid Salary", dataIndex: "paid", align: "right" },
//     {
//       title: "Remaining Salary",
//       dataIndex: "remaining",
//       align: "right",
//       render: (v) => (
//         <span style={{ color: v === "₹0.00" ? "green" : "red", fontWeight: 600 }}>{v}</span>
//       ),
//     },
//   ];

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-xl font-semibold mb-6 text-gray-700 text-center">
//         💼 Salary Remaining Report ({selectedYear})
//       </h2>

//       {/* Filters */}
//       <div className="flex flex-wrap justify-center gap-4 mb-6">
//         <div>
//           <label className="block text-gray-600 mb-1 font-medium">Employee</label>
//           <Select
//             showSearch
//             placeholder="Select Employee"
//             value={selectedEmp}
//             onChange={setSelectedEmp}
//             style={{ width: 220 }}
//             optionFilterProp="children"
//           >
//             {employees.map((emp) => (
//               <Option key={emp._id} value={emp._id}>
//                 {emp.name}
//               </Option>
//             ))}
//           </Select>
//         </div>

//         <div>
//           <label className="block text-gray-600 mb-1 font-medium">Year</label>
//           <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 120 }}>
//             {Array.from({ length: 5 }, (_, i) => {
//               const year = moment().year() - i;
//               return (
//                 <Option key={year} value={year.toString()}>
//                   {year}
//                 </Option>
//               );
//             })}
//           </Select>
//         </div>

//         <div className="flex items-end">
//           <Button type="primary" onClick={fetchSalaryReport} loading={loading}>
//             Generate Report
//           </Button>
//         </div>
//       </div>

//       {/* 🗓️ Date of Joining */}
//       {joiningDate && (
//         <p className="text-center text-gray-500 mb-4">
//           Employee joined on{" "}
//           <span className="font-medium text-gray-700">
//             {moment(joiningDate).format("DD MMM YYYY")}
//           </span>
//         </p>
//       )}

//       {/* Totals Summary */}
//       {summary?.totalExpectedSalary && (
//         <div className="flex flex-wrap justify-center gap-6 mb-8">
//           <div className="bg-green-100 p-4 rounded-lg text-center w-60 border border-green-400">
//             <p className="text-sm text-gray-600">Expected Salary</p>
//             <p className="text-lg font-semibold text-green-700">{summary.totalExpectedSalary}</p>
//           </div>
//           <div className="bg-blue-100 p-4 rounded-lg text-center w-60 border border-blue-400">
//             <p className="text-sm text-gray-600">Paid Salary</p>
//             <p className="text-lg font-semibold text-blue-700">{summary.totalPaidSalary}</p>
//           </div>
//           <div className="bg-red-100 p-4 rounded-lg text-center w-60 border border-red-400">
//             <p className="text-sm text-gray-600">Remaining Salary</p>
//             <p className="text-lg font-semibold text-red-700">{summary.totalRemainingSalary}</p>
//           </div>
//         </div>
//       )}

//       {/* Table */}
//       {loading ? (
//         <div className="flex justify-center items-center py-10">
//           <Spin size="large" />
//         </div>
//       ) : reportData.length > 0 ? (
//         <Table columns={columns} dataSource={reportData} rowKey="month" pagination={false} bordered />
//       ) : (
//         <div className="text-center text-gray-500 py-10">No data found</div>
//       )}
//     </div>
//   );
// };

// const SalaryRemainingReport = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmp, setSelectedEmp] = useState(null);
//   const [selectedYear, setSelectedYear] = useState(moment().year().toString());
//   const [reportData, setReportData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [summary, setSummary] = useState(null);
//   const [joiningDate, setJoiningDate] = useState(null);

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const res = await api.get("/agent/get-employee");
//       setEmployees(res.data.employee || []);
//     } catch (err) {
//       message.error("Failed to fetch employees");
//     }
//   };

//   const fetchSalaryReport = async () => {
//     if (!selectedEmp) {
//       message.warning("Please select an employee");
//       return;
//     }

//     setLoading(true);
//     try {
//       const params = { empId: selectedEmp, year: selectedYear };
//       const res = await api.get("/salary/get-remaining-salary", { params });

//       if (res.data.success) {
//         setReportData(res.data.monthlyReport || []);
//         setSummary(res.data.summary);
//         setJoiningDate(res.data.joining_date);
//       } else {
//         message.error(res.data.error || "Failed to load salary report");
//         setReportData([]);
//         setSummary(null);
//         setJoiningDate(null);
//       }
//     } catch (err) {
//       console.error("Error fetching salary report:", err);
//       message.error("Error loading salary report");
//       setReportData([]);
//       setSummary(null);
//       setJoiningDate(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Optional: Auto-fetch when selection changes (remove if you prefer manual "Generate")
//   // useEffect(() => {
//   //   if (selectedEmp) fetchSalaryReport();
//   // }, [selectedEmp, selectedYear]);

//   const isZeroRemaining = (value) => {
//     // Handle cases like "₹0", "₹0.00", "₹0.0"
//     return /^₹0(\.0*)?$/.test(value?.replace(/,/g, ''));
//   };

//   const columns = [
//     { title: "Month", dataIndex: "month", align: "center" },
//     { title: "Expected Salary", dataIndex: "expected", align: "right" },
//     { title: "Paid Salary", dataIndex: "paid", align: "right" },
//     // {
//     //   title: "Remaining Salary",
//     //   dataIndex: "remaining",
//     //   align: "right",
//     //   render: (v) => (
//     //     <span
//     //       style={{
//     //         color: isZeroRemaining(v) ? "green" : "red",
//     //         fontWeight: 600,
//     //       }}
//     //     >
//     //       {v}
//     //     </span>
//     //   ),
//     // },
//   ];

//   // Generate 5 years: current -2 to current +2 (covers past/future)
//   const yearOptions = Array.from({ length: 5 }, (_, i) => {
//     const year = moment().year() - 2 + i;
//     return (
//       <Option key={year} value={year.toString()}>
//         {year}
//       </Option>
//     );
//   });

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-xl font-semibold mb-6 text-gray-700 text-center">
//         💼 Salary Remaining Report ({selectedYear})
//       </h2>

//       {/* Filters */}
//       <div className="flex flex-wrap justify-center gap-4 mb-6">
//         <div>
//           <label className="block text-gray-600 mb-1 font-medium">Employee</label>
//           <Select
//             showSearch
//             placeholder="Select Employee"
//             value={selectedEmp}
//             onChange={(value) => {
//               setSelectedEmp(value);
//               // Reset report when employee changes
//               setReportData([]);
//               setSummary(null);
//               setJoiningDate(null);
//             }}
//             style={{ width: 220 }}
//             optionFilterProp="children"
//           >
//             {employees.map((emp) => (
//               <Option key={emp._id} value={emp._id}>
//                 {emp.name}
//               </Option>
//             ))}
//           </Select>
//         </div>

//         <div>
//           <label className="block text-gray-600 mb-1 font-medium">Year</label>
//           <Select
//             value={selectedYear}
//             onChange={(value) => {
//               setSelectedYear(value);
//               // Reset report when year changes
//               setReportData([]);
//               setSummary(null);
//               setJoiningDate(null);
//             }}
//             style={{ width: 120 }}
//           >
//             {yearOptions}
//           </Select>
//         </div>

//         <div className="flex items-end">
//           <Button type="primary" onClick={fetchSalaryReport} loading={loading}>
//             Generate Report
//           </Button>
//         </div>
//       </div>

//       {/* 🗓️ Date of Joining */}
//       {joiningDate && (
//         <p className="text-center text-gray-500 mb-4">
//           Employee joined on{" "}
//           <span className="font-medium text-gray-700">
//             {moment(joiningDate).format("DD MMM YYYY")}
//           </span>
//         </p>
//       )}

//       {/* Totals Summary */}
//       {summary && (
//         <div className="flex flex-wrap justify-center gap-6 mb-8">
//           <div className="bg-green-100 p-4 rounded-lg text-center w-60 border border-green-400">
//             <p className="text-sm text-gray-600">Expected Salary</p>
//             <p className="text-lg font-semibold text-green-700">{summary.totalExpectedSalary}</p>
//           </div>
//           <div className="bg-blue-100 p-4 rounded-lg text-center w-60 border border-blue-400">
//             <p className="text-sm text-gray-600">Paid Salary</p>
//             <p className="text-lg font-semibold text-blue-700">{summary.totalPaidSalary}</p>
//           </div>
//           {/* <div className="bg-red-100 p-4 rounded-lg text-center w-60 border border-red-400">
//             <p className="text-sm text-gray-600">Remaining Salary</p>
//             <p className="text-lg font-semibold text-red-700">{summary.totalRemainingSalary}</p>
//           </div> */}
//         </div>
//       )}

//       {/* Table */}
//       {loading ? (
//         <div className="flex justify-center items-center py-10">
//           <Spin size="large" />
//         </div>
//       ) : reportData.length > 0 ? (
//         <Table
//           columns={columns}
//           dataSource={reportData}
//           rowKey="month"
//           pagination={false}
//           bordered
//         />
//       ) : summary !== null ? (
//         <div className="text-center text-gray-500 py-10">
//           No salary data available for this period.
//         </div>
//       ) : (
//         <div className="text-center text-gray-500 py-10">
//           Select an employee and click "Generate Report" to view details.
//         </div>
//       )}
//     </div>
//   );
// };

const SalaryRemainingReport = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedYear, setSelectedYear] = useState(moment().year().toString());
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [joiningDate, setJoiningDate] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 🔹 Fetch all employees
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/agent/get-employee");
      setEmployees(res.data.employee || []);
    } catch (err) {
      message.error("Failed to fetch employees");
    }
  };

  // 🔹 Fetch report
  const fetchSalaryReport = async () => {
    if (!selectedEmp) {
      message.warning("Please select an employee");
      return;
    }

    setLoading(true);
    try {
      const params = { empId: selectedEmp, year: selectedYear };
      const res = await api.get("/salary/get-remaining-salary", { params });

      if (res.data.success) {
        setReportData(res.data.monthlyReport || []);
        setSummary(res.data.summary);
        setJoiningDate(res.data.joining_date);
      } else {
        message.error(res.data.error || "Failed to load salary report");
        setReportData([]);
        setSummary(null);
        setJoiningDate(null);
      }
    } catch (err) {
      console.error("Error fetching salary report:", err);
      message.error("Error loading salary report");
      setReportData([]);
      setSummary(null);
      setJoiningDate(null);
    } finally {
      setLoading(false);
    }
  };

  const isZeroRemaining = (value) =>
    /^₹0(\.0*)?$/.test(value?.replace(/,/g, ""));

  const columns = [
    { title: "Month", dataIndex: "month", align: "center" },
    {
      title: "Expected Salary",
      dataIndex: "expected",
      align: "right",
      render: (v) => <span>{v || "₹0"}</span>,
    },
    {
      title: "Paid Salary",
      dataIndex: "paid",
      align: "right",
      render: (v) => <span>{v || "₹0"}</span>,
    },
    {
      title: "Remaining Salary",
      dataIndex: "remaining",
      align: "right",
      render: (v) => (
        <span
          style={{
            color: isZeroRemaining(v) ? "green" : "red",
            fontWeight: 600,
          }}
        >
          {v || "₹0"}
        </span>
      ),
    },
  ];

  // Generate year options (5-year window)
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = moment().year() - 2 + i;
    return (
      <Option key={year} value={year.toString()}>
        {year}
      </Option>
    );
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-gray-700 text-center">
        💼 Salary Remaining Report ({selectedYear})
      </h2>

      {/* 🔹 Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <div>
          <label className="block text-gray-600 mb-1 font-medium">
            Employee
          </label>
          <Select
            showSearch
            placeholder="Select Employee"
            value={selectedEmp}
            onChange={(value) => {
              setSelectedEmp(value);
              setReportData([]);
              setSummary(null);
              setJoiningDate(null);
            }}
            style={{ width: 220 }}
            optionFilterProp="children"
          >
            {employees.map((emp) => (
              <Option key={emp._id} value={emp._id}>
                {emp.name}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-gray-600 mb-1 font-medium">Year</label>
          <Select
            value={selectedYear}
            onChange={(value) => {
              setSelectedYear(value);
              setReportData([]);
              setSummary(null);
              setJoiningDate(null);
            }}
            style={{ width: 120 }}
          >
            {yearOptions}
          </Select>
        </div>

        <div className="flex items-end">
          <Button type="primary" onClick={fetchSalaryReport} loading={loading}>
            Generate Report
          </Button>
        </div>
      </div>

    
    

      {summary && (
  <>
    {joiningDate && moment(joiningDate).isValid() && (
      <div className="text-center mb-4">
        <p className="text-gray-600 text-base font-medium">
          🗓️ <strong>Joining Date:</strong>{" "}
          <span className="text-gray-800">
            {moment(joiningDate).format("DD MMM YYYY")}
          </span>
        </p>
      </div>
    )}

    {/* 🔹 Salary Summary */}
    <div className="flex flex-wrap justify-center gap-6 mb-8">
      <div className="bg-green-100 p-4 rounded-lg text-center w-60 border border-green-400 shadow-sm">
        <p className="text-sm text-gray-600">Expected Salary</p>
        <p className="text-lg font-semibold text-green-700">
          {summary.totalExpectedSalary || "₹0"}
        </p>
      </div>
      <div className="bg-blue-100 p-4 rounded-lg text-center w-60 border border-blue-400 shadow-sm">
        <p className="text-sm text-gray-600">Paid Salary</p>
        <p className="text-lg font-semibold text-blue-700">
          {summary.totalPaidSalary || "₹0"}
        </p>
      </div>
    </div>
  </>
)}

      {/* 📊 Table */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
        </div>
      ) : reportData.length > 0 ? (
        <Table
          columns={columns}
          dataSource={reportData}
          rowKey="month"
          pagination={false}
          bordered
        />
      ) : summary !== null ? (
        <div className="text-center text-gray-500 py-10">
          No salary data available for this employee/year.
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          Select an employee and click <b>"Generate Report"</b> to view details.
        </div>
      )}
    </div>
  );
};

// const SalaryRemainingReport = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmp, setSelectedEmp] = useState(null);
//   const [selectedYear, setSelectedYear] = useState(moment().year().toString());
//   const [reportData, setReportData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [summary, setSummary] = useState(null);
//   const [joiningDate, setJoiningDate] = useState(null);

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   // 🔹 Fetch all employees
//   const fetchEmployees = async () => {
//     try {
//       // Replace with your actual API call
//       // const res = await api.get("/agent/get-employee");
//       // Mocking data for demonstration
//       const res = {
//         data: {
//           employee: [
//             { _id: "1", name: "John Doe", joining_date: "2022-01-15" },
//             { _id: "2", name: "Jane Smith", joining_date: "2021-03-20" },
//             { _id: "3", name: "Peter Jones", joining_date: "2023-07-01" },
//           ],
//         },
//       };
//       setEmployees(res.data.employee || []);
      
//       // If an employee was already selected, update their joining date from the fresh list
//       if (selectedEmp) {
//         const emp = res.data.employee.find((e) => e._id === selectedEmp);
//         if (emp && emp.joining_date) {
//           setJoiningDate(emp.joining_date);
//         }
//       }
//     } catch (err) {
//       message.error("Failed to fetch employees");
//     }
//   };

//   // 🔹 Fetch report
//   const fetchSalaryReport = async () => {
//     if (!selectedEmp) {
//       message.warning("Please select an employee");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Replace with your actual API call
//       // const params = { empId: selectedEmp, year: selectedYear };
//       // const res = await api.get("/salary/get-remaining-salary", { params });
      
//       // Mocking API response for demonstration
//       const res = {
//         data: {
//           success: true,
//           joining_date: employees.find(e => e._id === selectedEmp)?.joining_date, // Get from the list
//           summary: {
//             totalExpectedSalary: "₹1,200,000",
//             totalPaidSalary: "₹900,000",
//           },
//           monthlyReport: [
//             { month: "January", expected: "₹100,000", paid: "₹100,000", remaining: "₹0" },
//             { month: "February", expected: "₹100,000", paid: "₹75,000", remaining: "₹25,000" },
//             { month: "March", expected: "₹100,000", paid: "₹80,000", remaining: "₹20,000" },
//           ],
//         },
//       };

//       if (res.data.success) {
//         setReportData(res.data.monthlyReport || []);
//         setSummary(res.data.summary);
//         // Set joining date from API response as a fallback, but it's already set from the employee list
//         if (res.data.joining_date) {
//           setJoiningDate(res.data.joining_date);
//         }
//       } else {
//         message.error(res.data.error || "Failed to load salary report");
//         setReportData([]);
//         setSummary(null);
//         // Don't reset joining date here, as it's tied to the employee, not the report's success
//       }
//     } catch (err) {
//       console.error("Error fetching salary report:", err);
//       message.error("Error loading salary report");
//       setReportData([]);
//       setSummary(null);
//       // Don't reset joining date here
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isZeroRemaining = (value) =>
//     /^₹0(\.0*)?$/.test(value?.replace(/,/g, ""));

//   const columns = [
//     { title: "Month", dataIndex: "month", align: "center" },
//     {
//       title: "Expected Salary",
//       dataIndex: "expected",
//       align: "right",
//       render: (v) => <span>{v || "₹0"}</span>,
//     },
//     {
//       title: "Paid Salary",
//       dataIndex: "paid",
//       align: "right",
//       render: (v) => <span>{v || "₹0"}</span>,
//     },
//     {
//       title: "Remaining Salary",
//       dataIndex: "remaining",
//       align: "right",
//       render: (v) => (
//         <span
//           style={{
//             color: isZeroRemaining(v) ? "green" : "red",
//             fontWeight: 600,
//           }}
//         >
//           {v || "₹0"}
//         </span>
//       ),
//     },
//   ];

//   // Generate year options (5-year window)
//   const yearOptions = Array.from({ length: 5 }, (_, i) => {
//     const year = moment().year() - 2 + i;
//     return (
//       <Option key={year} value={year.toString()}>
//         {year}
//       </Option>
//     );
//   });

//   // --- FIXED HANDLERS ---
//   const handleEmployeeChange = (value) => {
//     setSelectedEmp(value);
//     setReportData([]);
//     setSummary(null);
    
//     // Get the joining date directly from the employees list
//     const emp = employees.find((e) => e._id === value);
//     if (emp && emp.joining_date) {
//       setJoiningDate(emp.joining_date);
//     } else {
//       setJoiningDate(null);
//     }
//   };

//   const handleYearChange = (value) => {
//     setSelectedYear(value);
//     setReportData([]);
//     setSummary(null);
//     // IMPORTANT: Do NOT reset joiningDate when the year changes
//   };

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-xl font-semibold mb-6 text-gray-700 text-center">
//         Salary Remaining Report ({selectedYear})
//       </h2>

//       {/* 🔹 Filters */}
//       <div className="flex flex-wrap justify-center gap-4 mb-6">
//         <div>
//           <label className="block text-gray-600 mb-1 font-medium">
//             Employee
//           </label>
//           <Select
//             showSearch
//             placeholder="Select Employee"
//             value={selectedEmp}
//             onChange={handleEmployeeChange} // Use the new handler
//             style={{ width: 220 }}
//             optionFilterProp="children"
//             filterOption={(input, option) =>
//               option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//             }
//           >
//             {employees.map((emp) => (
//               <Option key={emp._id} value={emp._id}>
//                 {emp.name}
//               </Option>
//             ))}
//           </Select>
//         </div>

//         <div>
//           <label className="block text-gray-600 mb-1 font-medium">Year</label>
//           <Select
//             value={selectedYear}
//             onChange={handleYearChange} // Use the new handler
//             style={{ width: 120 }}
//           >
//             {yearOptions}
//           </Select>
//         </div>

//         <div className="flex items-end">
//           <Button type="primary" onClick={fetchSalaryReport} loading={loading}>
//             Generate Report
//           </Button>
//         </div>
//       </div>

//       {/* 🔹 Joining Date Display */}
//       {/* --- FIXED LOGIC --- */}
//       {joiningDate && (
//         <div className="text-center mb-4">
//           <p className="text-gray-600 text-base font-medium">
//             🗓️ <strong>Joining Date:</strong>{" "}
//             <span className="text-gray-800">
//               {moment(joiningDate).isValid()
//                 ? moment(joiningDate).format("DD MMM YYYY")
//                 : joiningDate // Display as-is if not a valid moment date for debugging
//               }
//             </span>
//           </p>
//         </div>
//       )}

//       {summary && (
//         <>
//           {/* 🔹 Salary Summary */}
//           <div className="flex flex-wrap justify-center gap-6 mb-8">
//             <div className="bg-green-100 p-4 rounded-lg text-center w-60 border border-green-400 shadow-sm">
//               <p className="text-sm text-gray-600">Expected Salary</p>
//               <p className="text-lg font-semibold text-green-700">
//                 {summary.totalExpectedSalary || "₹0"}
//               </p>
//             </div>
//             <div className="bg-blue-100 p-4 rounded-lg text-center w-60 border border-blue-400 shadow-sm">
//               <p className="text-sm text-gray-600">Paid Salary</p>
//               <p className="text-lg font-semibold text-blue-700">
//                 {summary.totalPaidSalary || "₹0"}
//               </p>
//             </div>
//           </div>
//         </>
//       )}

//       {/* 📊 Table */}
//       {loading ? (
//         <div className="flex justify-center items-center py-10">
//           <Spin size="large" />
//         </div>
//       ) : reportData.length > 0 ? (
//         <Table
//           columns={columns}
//           dataSource={reportData}
//           rowKey="month"
//           pagination={false}
//           bordered
//         />
//       ) : summary !== null ? (
//         <div className="text-center text-gray-500 py-10">
//           No salary data available for this employee/year.
//         </div>
//       ) : (
//         <div className="text-center text-gray-500 py-10">
//           Select an employee and click <b>"Generate Report"</b> to view details.
//         </div>
//       )}
//     </div>
//   );
// };

export default SalaryRemainingReport;
