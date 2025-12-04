// import React, { useEffect, useState } from "react";
// import { Select, Radio } from "antd";
// import api from "../instance/TokenInstance";
// import DataTable from "../components/layouts/Datatable";
// import CircularLoader from "../components/loaders/CircularLoader";
// import Navbar from "../components/layouts/Navbar";
// import Modal from "../components/modals/Modal";
// import { GiPartyPopper } from "react-icons/gi";
// import { FileTextOutlined, DollarOutlined } from "@ant-design/icons";
// import { Collapse } from "antd";
// import { FaMoneyBill } from "react-icons/fa";
// import { MdPayments } from "react-icons/md";
// import { Link } from "react-router-dom";
// import { FiTarget } from "react-icons/fi";

// const TargetCommission = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
//   const [selectedMonth, setSelectedMonth] = useState(null);
//   const [dateSelectionMode, setDateSelectionMode] = useState("month");
//   const [agentLoading, setAgentLoading] = useState(false);
//   const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
//   const [employeeCustomerData, setEmployeeCustomerData] = useState([]);
//   const [commissionTotalDetails, setCommissionTotalDetails] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showCommissionModal, setShowCommissionModal] = useState(false);
//   const [commissionForm, setCommissionForm] = useState({
//     agent_id: "",
//     pay_date: new Date().toISOString().split("T")[0],
//     amount: "",
//     pay_type: "cash",
//     transaction_id: "",
//     note: "",
//     pay_for: "commission",
//     admin_type: "",
//   });
//   const [errors, setErrors] = useState({});
//   const [adminId, setAdminId] = useState("");
//   const [adminName, setAdminName] = useState("");
//   const [targetData, setTargetData] = useState({
//     target: 0,
//     achieved: 0,
//     remaining: 0,
//     startDate: "",
//     endDate: "",
//     targetCommission: 0,
//   });

//   const [tempSelectedMonth, setTempSelectedMonth] = useState(null);
//   const [tempFromDate, setTempFromDate] = useState(null);
//   const [tempToDate, setTempToDate] = useState(null);
//   const [isFilterApplied, setIsFilterApplied] = useState(false);

//   useEffect(() => {
//     const today = new Date();
//     const currentMonth = `${today.getFullYear()}-${String(
//       today.getMonth() + 1
//     ).padStart(2, "0")}`;
//     setTempSelectedMonth(currentMonth);

//     const year = today.getFullYear();
//     const month = today.getMonth() + 1;
//     const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
//     const lastDay = new Date(year, month, 0).toISOString().split("T")[0];
//     setTempFromDate(firstDay);
//     setTempToDate(lastDay);
//   }, []);

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user) {
//       setAdminId(user._id);
//       setAdminName(user.name || "");
//     }
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const res = await api.get("/agent/get");
//       setEmployees(res?.data?.agent);
//     } catch (err) {
//       console.error("Error fetching employees:", err);
//     }
//   };

//   const fetchCommissionReport = async (employeeId, startDate, endDate) => {
//     if (!employeeId || !startDate || !endDate) return;
//     const abortController = new AbortController();
//     setLoading(true);
//     try {
//       const params = {
//         start_date: startDate,
//         end_date: endDate,
//       };

//       const res = await api.get(`/enroll/agent/${employeeId}/commission`, {
//         params,
//         signal: abortController.signal,
//       });

//       setEmployeeCustomerData(res.data?.commissionData);
//       setCommissionTotalDetails({
//         actual_business: res.data?.commissionSummary?.total_group_value,
//         total_actual: res.data?.commissionSummary?.total_commission_value,
//         total_customers: res.data?.commissionSummary?.total_enrollments,
//         total_groups: res.data?.commissionSummary?.total_enrollments,
//         expected_business: res.data?.commissionSummary?.total_group_value,
//         total_estimated: res.data?.commissionSummary?.total_commission_value,
//       });
//     } catch (err) {
//       if (err.name !== "AbortController") {
//         console.error("Error fetching employee report:", err);
//         setEmployeeCustomerData([]);
//         setCommissionTotalDetails({});
//       }
//     } finally {
//       if (!abortController.signal.aborted) {
//         setLoading(false);
//       }
//     }
//   };

//   const calculateTargetCommission = (achievedBusiness, targetAmount) => {
//     const achievedNum =
//       typeof achievedBusiness === "string"
//         ? Number(achievedBusiness.replace(/[^0-9.-]+/g, ""))
//         : achievedBusiness;
//     const targetNum =
//       typeof targetAmount === "string"
//         ? Number(targetAmount.replace(/[^0-9.-]+/g, ""))
//         : targetAmount;

//     if (achievedNum <= targetNum) {
//       return achievedNum * 0.005;
//     } else {
//       const upToTarget = targetNum * 0.005;
//       const beyondTarget = (achievedNum - targetNum) * 0.01;
//       return upToTarget + beyondTarget;
//     }
//   };

//   const fetchTargetData = async (employeeId, startDate, endDate) => {
//     if (!employeeId || !startDate || !endDate) return;

//     try {
//       const abortController = new AbortController();

//       const targetRes = await api.get(`/target/agents/${employeeId}`, {
//         params: { start_date: startDate, end_date: endDate },
//         signal: abortController.signal,
//       });

//       const targetForMonth = targetRes.data?.total_target || 0;

//       const { data: comm } = await api.get(
//         `/enroll/agent/${employeeId}/commission`,
//         {
//           params: { start_date: startDate, end_date: endDate },
//           signal: abortController.signal,
//         }
//       );

//       let achieved = comm?.commissionSummary?.total_group_value || 0;
//       if (typeof achieved === "string") {
//         achieved = Number(achieved.replace(/[^0-9.-]+/g, ""));
//       }

//       const remaining = Math.max(targetForMonth - achieved, 0);
//       const difference = targetForMonth - achieved;
//       const targetCommission = calculateTargetCommission(
//         achieved,
//         targetForMonth
//       );

//       setTargetData({
//         target: Math.round(targetForMonth),
//         achieved,
//         remaining,
//         difference,
//         startDate: startDate,
//         endDate: endDate,
//         targetCommission,
//       });
//     } catch (err) {
//       if (err.name !== "AbortError") {
//         console.error("Error fetching target data:", err);
//         setTargetData({
//           target: 0,
//           achieved: 0,
//           remaining: 0,
//           difference: 0,
//           startDate: "",
//           endDate: "",
//           targetCommission: 0,
//         });
//       }
//     }
//   };

//   const fetchAllCommissionReport = async (startDate, endDate) => {
//     if (!startDate || !endDate) return;

//     const abortController = new AbortController();
//     setLoading(true);
//     try {
//       const params = {
//         start_date: startDate,
//         end_date: endDate,
//       };

//       const res = await api.get("/enroll/commission", {
//         params,
//         signal: abortController.signal,
//       });

//       setEmployeeCustomerData(res.data?.commissionData);
//       setCommissionTotalDetails({
//         actual_business: res.data?.commissionSummary?.total_group_value,
//         total_actual: res.data?.commissionSummary?.total_commission_value,
//         total_customers: res.data?.commissionSummary?.total_enrollments,
//         total_groups: res.data?.commissionSummary?.total_enrollments,
//         expected_business: res.data?.commissionSummary?.total_group_value,
//         total_estimated: res.data?.commissionSummary?.total_commission_value,
//       });
//     } catch (err) {
//       if (err.name !== "AbortError") {
//         console.error("Error fetching all commission report:", err);
//         setEmployeeCustomerData([]);
//         setCommissionTotalDetails({});
//       }
//     } finally {
//       if (!abortController.signal.aborted) {
//         setLoading(false);
//       }
//     }
//   };

//   const handleEmployeeChange = (value) => {
//     setSelectedEmployeeId(value);
//     setSelectedEmployeeDetails(null);
//     setEmployeeCustomerData([]);
//     setCommissionTotalDetails({});
//     setTargetData({
//       target: 0,
//       achieved: 0,
//       remaining: 0,
//       startDate: "",
//       endDate: "",
//       targetCommission: 0,
//     });
//     setIsFilterApplied(false);
//   };

//   const handleTempMonthChange = (e) => {
//     const selectedMonth = e.target.value;
//     setTempSelectedMonth(selectedMonth);
//     if (selectedMonth) {
//       const [year, month] = selectedMonth.split("-");
//       const firstDay = `${year}-${month}-01`;
//       const lastDay = new Date(year, month, 0).toISOString().split("T")[0];
//       setTempFromDate(firstDay);
//       setTempToDate(lastDay);
//     }
//   };

//   const applyFilter = async () => {
//     if (!selectedEmployeeId) {
//       alert("Please select an agent.");
//       return;
//     }

//     if (dateSelectionMode === "month" && !tempSelectedMonth) {
//       alert("Please select a month.");
//       return;
//     }

//     if (dateSelectionMode === "date-range" && (!tempFromDate || !tempToDate)) {
//       alert("Please select both From and To dates.");
//       return;
//     }

//     let startDate, endDate;

//     if (dateSelectionMode === "month") {
//       setSelectedMonth(tempSelectedMonth);
//       const [year, month] = tempSelectedMonth.split("-");
//       startDate = `${year}-${month}-01`;
//       endDate = new Date(year, month, 0).toISOString().split("T")[0];
//     } else {
//       startDate = tempFromDate;
//       endDate = tempToDate;
//     }

//     setAgentLoading(true);
//     setLoading(true);

//     try {
//       setIsFilterApplied(true);

//       if (selectedEmployeeId === "ALL") {
//         setSelectedEmployeeDetails(null);
//         setTargetData({
//           target: 0,
//           achieved: 0,
//           remaining: 0,
//           startDate: "",
//           endDate: "",
//           targetCommission: 0,
//         });
//         await fetchAllCommissionReport(startDate, endDate);
//       } else {
//         const emp = employees.find((e) => e._id === selectedEmployeeId);
//         setSelectedEmployeeDetails(emp || null);
//         await fetchCommissionReport(selectedEmployeeId, startDate, endDate);
//         await fetchTargetData(selectedEmployeeId, startDate, endDate);
//       }
//     } finally {
//       setAgentLoading(false);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const handleCommissionChange = (e) => {
//     const { name, value } = e.target;
//     setCommissionForm((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!commissionForm.agent_id) newErrors.agent_id = "Please select an agent";
//     if (!commissionForm.amount || isNaN(commissionForm.amount))
//       newErrors.amount = "Please enter a valid amount";
//     if (commissionForm.pay_type === "online" && !commissionForm.transaction_id)
//       newErrors.transaction_id = "Transaction ID is required";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleCommissionSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     try {
//       const payload = { ...commissionForm, admin_type: adminId };
//       await api.post("/payment-out/add-commission-payment", payload);
//       alert("Commission Paid Successfully!");
//       setShowCommissionModal(false);
//     } catch (err) {
//       alert("Failed to add payment.");
//     }
//   };

//   const processedTableData = employeeCustomerData.map((item, index) => ({
//     ...item,
//     group_value_digits: item.group_id?.group_value || 0,
//     estimated_commission_digits: item.estimated_commission || 0,
//     actual_commission_digits: item.commission_value || 0,
//     total_paid_digits: item.total_paid_amount || 0,
//     required_installment_digits: item.group_id?.monthly_installment || 0,
//     group_ticket: item?.ticket || 0,
//     net_commission_percentage: item?.group_id?.commission || 0,
//     commission_released: item.commission_released ? "Yes" : "No",
//     user_name: item.user_id?.full_name || "N/A",
//     phone_number: item.user_id?.phone_number || "N/A",
//     group_name: item.group_id?.group_name || "N/A",
//     start_date: item.group_id?.start_date
//       ? new Date(item.group_id.start_date)?.toISOString()?.split("T")?.[0]
//       : "N/A",
//   }));

//   const columns = [
//     { key: "user_name", header: "Customer Name" },
//     { key: "phone_number", header: "Phone Number" },
//     { key: "group_name", header: "Group Name" },
//     { key: "group_ticket", header: "Ticket No" },
//     { key: "group_value_digits", header: "Group Value" },
//     { key: "start_date", header: "Start Date" },
//     { key: "net_commission_percentage", header: "Net Commission Percentage" },
//     { key: "actual_commission_digits", header: "Net Commission" },
//     { key: "total_paid_digits", header: "Total Paid" },
//     { key: "required_installment_digits", header: "Required Installment" },
//     { key: "commission_released", header: "Commission Released" },
//   ];

//   const today = new Date();
//   const currentMonth = `${today.getFullYear()}-${String(
//     today.getMonth() + 1
//   ).padStart(2, "0")}`;

//   return (
//     <div className="w-screen min-h-screen bg-gray-50">
//       <div className="flex">
//         <Navbar visibility={true} />
//         <div className="flex-grow p-8">
//           {/* Header Section */}
//           <div className="mb-8">
//             <h1 className="text-4xl font-bold text-gray-900">
//               Commission Reports
//             </h1>
//             <p className="text-gray-600 mt-2">Track and manage agent commissions and performance</p>
//           </div>

//           {/* Filter Card */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
//             <h2 className="text-lg font-semibold text-gray-800 mb-6">Report Filters</h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//               {/* Agent Select */}
//               <div className="flex flex-col">
//                 <label className="block text-sm font-semibold text-gray-700 mb-3">
//                   Select Agent
//                 </label>
//                 <Select
//                   value={selectedEmployeeId || undefined}
//                   onChange={handleEmployeeChange}
//                   showSearch
//                   popupMatchSelectWidth={false}
//                   placeholder="Search by name or phone"
//                   filterOption={(input, option) =>
//                     option.children
//                       .toString()
//                       .toLowerCase()
//                       .includes(input.toLowerCase())
//                   }
//                   style={{ height: "44px" }}
//                   className="rounded"
//                 >
//                   {employees.map((emp) => (
//                     <Select.Option key={emp._id} value={emp._id}>
//                       {emp.name} - {emp.phone_number}
//                     </Select.Option>
//                   ))}
//                 </Select>
//               </div>

//               {/* Date Selection Mode */}
//               <div className="flex flex-col">
//                 <label className="block text-sm font-semibold text-gray-700 mb-3">
//                   Date Selection
//                 </label>
//                 <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg h-11">
//                   <Radio.Group
//                     value={dateSelectionMode}
//                     onChange={(e) => setDateSelectionMode(e.target.value)}
//                   >
//                     <Radio value="month" className="text-sm">Month</Radio>
//                     <Radio value="date-range" className="text-sm">Range</Radio>
//                   </Radio.Group>
//                 </div>
//               </div>

//               {/* Date Picker Fields */}
//               {dateSelectionMode === "month" ? (
//                 <div className="flex flex-col">
//                   <label className="block text-sm font-semibold text-gray-700 mb-3">
//                     Select Month
//                   </label>
//                   <input
//                     type="month"
//                     value={tempSelectedMonth || ""}
//                     max={currentMonth}
//                     onChange={handleTempMonthChange}
//                     className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
//                   />
//                 </div>
//               ) : (
//                 <>
//                   <div className="flex flex-col">
//                     <label className="block text-sm font-semibold text-gray-700 mb-3">
//                       From Date
//                     </label>
//                     <input
//                       type="date"
//                       value={tempFromDate || ""}
//                       max={tempToDate || currentMonth}
//                       onChange={(e) => setTempFromDate(e.target.value)}
//                       className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
//                     />
//                   </div>
//                   <div className="flex flex-col">
//                     <label className="block text-sm font-semibold text-gray-700 mb-3">
//                       To Date
//                     </label>
//                     <input
//                       type="date"
//                       value={tempToDate || ""}
//                       min={tempFromDate || ""}
//                       max={currentMonth}
//                       onChange={(e) => setTempToDate(e.target.value)}
//                       className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
//                     />
//                   </div>
//                 </>
//               )}
//             </div>

//             {/* Filter Button */}
//             <div className="flex justify-end">
//               <button
//                 onClick={applyFilter}
//                 className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
//               >
//                 Generate Report
//               </button>
//             </div>
//           </div>

//           {agentLoading ? (
//             <div className="flex justify-center py-20">
//               <CircularLoader isLoading={true} />
//             </div>
//           ) : (
//             <>
//               {/* Quick Links */}
//               <div className="mb-8">
//                 <Collapse
//                   items={[
//                     {
//                       key: "1",
//                       label: (
//                         <span className="font-semibold text-gray-800">
//                           Quick Links
//                         </span>
//                       ),
//                       children: (
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                           <Link
//                             to="/target-menu/target"
//                             className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
//                           >
//                             <FiTarget className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
//                             <span className="font-medium text-gray-700 group-hover:text-blue-600">Set Target</span>
//                           </Link>
//                           <Link
//                             to="/reports/target-incentive"
//                             className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
//                           >
//                             <FileTextOutlined className="text-blue-600 group-hover:scale-110 transition-transform text-lg" />
//                             <span className="font-medium text-gray-700 group-hover:text-blue-600">Incentive Report</span>
//                           </Link>
//                           <Link
//                             to="/target-commission-incentive"
//                             className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
//                           >
//                             <MdPayments className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
//                             <span className="font-medium text-gray-700 group-hover:text-blue-600">Payout</span>
//                           </Link>
//                         </div>
//                       ),
//                     },
//                   ]}
//                   defaultActiveKey={["1"]}
//                   className="border border-gray-200 bg-white rounded-lg"
//                 />
//               </div>

//               {/* Employee Details */}
//               {isFilterApplied && (
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
//                   {selectedEmployeeId !== "ALL" && selectedEmployeeDetails && (
//                     <>
//                       <h3 className="text-lg font-semibold text-gray-800 mb-4">Agent Information</h3>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                         <div>
//                           <label className="text-xs font-semibold text-gray-600 uppercase">Name</label>
//                           <input
//                             value={selectedEmployeeDetails.name || "-"}
//                             readOnly
//                             className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
//                           />
//                         </div>
//                         <div>
//                           <label className="text-xs font-semibold text-gray-600 uppercase">Email</label>
//                           <input
//                             value={selectedEmployeeDetails.email || "-"}
//                             readOnly
//                             className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
//                           />
//                         </div>
//                         <div>
//                           <label className="text-xs font-semibold text-gray-600 uppercase">Phone</label>
//                           <input
//                             value={selectedEmployeeDetails.phone_number || "-"}
//                             readOnly
//                             className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
//                           />
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                         <div>
//                           <label className="text-xs font-semibold text-gray-600 uppercase">Adhaar</label>
//                           <input
//                             value={selectedEmployeeDetails.adhaar_no || "-"}
//                             readOnly
//                             className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
//                           />
//                         </div>
//                         <div>
//                           <label className="text-xs font-semibold text-gray-600 uppercase">PAN</label>
//                           <input
//                             value={selectedEmployeeDetails.pan_no || "-"}
//                             readOnly
//                             className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
//                           />
//                         </div>
//                         <div>
//                           <label className="text-xs font-semibold text-gray-600 uppercase">Pincode</label>
//                           <input
//                             value={selectedEmployeeDetails.pincode || "-"}
//                             readOnly
//                             className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
//                           />
//                         </div>
//                       </div>
//                       <div>
//                         <label className="text-xs font-semibold text-gray-600 uppercase">Address</label>
//                         <input
//                           value={selectedEmployeeDetails.address || "-"}
//                           readOnly
//                           className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
//                         />
//                       </div>
//                       <hr className="my-6" />
//                     </>
//                   )}

//                   {/* Summary Section */}
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Commission Summary</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
//                       <label className="text-xs font-semibold text-gray-600 uppercase">Net Business</label>
//                       <input
//                         value={commissionTotalDetails?.actual_business || "-"}
//                         readOnly
//                         className="w-full bg-transparent text-2xl font-bold text-green-700 mt-2 border-0"
//                       />
//                     </div>
//                     <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
//                       <label className="text-xs font-semibold text-gray-600 uppercase">Net Commission (1% each)</label>
//                       <input
//                         value={commissionTotalDetails?.total_actual || "-"}
//                         readOnly
//                         className="w-full bg-transparent text-2xl font-bold text-blue-700 mt-2 border-0"
//                       />
//                     </div>
//                     <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
//                       <label className="text-xs font-semibold text-gray-600 uppercase">Net Customers</label>
//                       <input
//                         value={commissionTotalDetails?.total_customers || "-"}
//                         readOnly
//                         className="w-full bg-transparent text-2xl font-bold text-purple-700 mt-2 border-0"
//                       />
//                     </div>
//                     <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
//                       <label className="text-xs font-semibold text-gray-600 uppercase">Net Groups</label>
//                       <input
//                         value={commissionTotalDetails?.total_groups || "-"}
//                         readOnly
//                         className="w-full bg-transparent text-2xl font-bold text-orange-700 mt-2 border-0"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Target Details */}
//               {isFilterApplied &&
//                 selectedEmployeeId &&
//                 selectedEmployeeId !== "ALL" && (
//                   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
//                     <div className="flex items-center justify-between mb-6">
//                       <h3 className="text-lg font-semibold text-gray-800">Target Performance</h3>
//                       {targetData.achieved >= targetData.target && (
//                         <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 border border-green-300">
//                           <GiPartyPopper size={24} className="text-green-600" />
//                           <span className="text-green-700 font-semibold">Target Achieved</span>
//                         </div>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                       <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
//                         <label className="text-xs font-semibold text-gray-600 uppercase">Target Set</label>
//                         <p className="text-2xl font-bold text-blue-700 mt-2">
//                           {`${targetData.target?.toLocaleString("en-IN")}`}
//                         </p>
//                       </div>
//                       <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
//                         <label className="text-xs font-semibold text-gray-600 uppercase">Achieved</label>
//                         <p className="text-2xl font-bold text-green-700 mt-2">
//                           {`${targetData.achieved?.toLocaleString("en-IN")}`}
//                         </p>
//                       </div>
//                       <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
//                         <label className="text-xs font-semibold text-gray-600 uppercase">Difference</label>
//                         <p className="text-2xl font-bold text-amber-700 mt-2">
//                           {`${(targetData.difference?? "0")?.toLocaleString("en-IN")}`}
//                         </p>
//                       </div>
//                       <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
//                         <label className="text-xs font-semibold text-gray-600 uppercase">Total Payable Commission</label>
//                         <p className="text-2xl font-bold text-emerald-700 mt-2">
//                           {`${targetData.targetCommission.toLocaleString("en-IN", {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           })}`}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
//                       <p className="text-sm font-semibold text-blue-800 mb-3">Commission Breakdown</p>
//                       <ul className="space-y-2">
//                         <li className="text-sm text-gray-700 flex items-center gap-2">
//                           <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
//                           <span>Up to target (0.5%): {(Math.min(targetData.achieved, targetData.target) * 0.005).toLocaleString("en-IN", {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           })}</span>
//                         </li>
//                         {targetData.achieved > targetData.target && (
//                           <li className="text-sm text-gray-700 flex items-center gap-2">
//                             <span className="w-2 h-2 bg-green-600 rounded-full"></span>
//                             <span>Beyond target (1%): {((targetData.achieved - targetData.target) * 0.01).toLocaleString("en-IN", {
//                               minimumFractionDigits: 2,
//                               maximumFractionDigits: 2,
//                             })}</span>
//                           </li>
//                         )}
//                       </ul>
//                     </div>
//                   </div>
//                 )}

//               {/* Data Table */}
//               {loading ? (
//                 <div className="flex justify-center py-20">
//                   <CircularLoader isLoading={true} />
//                 </div>
//               ) : employeeCustomerData.length > 0 ? (
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//                   <DataTable
//                     data={processedTableData}
//                     columns={columns}
//                     exportedPdfName={`Commission Report`}
//                     printHeaderKeys={[
//                       "Name",
//                       "Phone Number",
//                       "Month",
//                       "Target Set",
//                       "Achieved",
//                       "Remaining",
//                       "Total Payable Commission",
//                       "Actual Business",
//                       "Actual Commission",
//                       "Gross Business",
//                       "Gross Commission",
//                       "Total Customers",
//                       "Total Groups",
//                     ]}
//                     printHeaderValues={[
//                       selectedEmployeeId === "ALL"
//                         ? "All Employees"
//                         : selectedEmployeeDetails?.name || "-",
//                       selectedEmployeeId === "ALL"
//                         ? "-"
//                         : selectedEmployeeDetails?.phone_number || "-",
//                       isFilterApplied
//                         ? dateSelectionMode === "month"
//                           ? new Date(`${selectedMonth}-01`).toLocaleString(
//                               "default",
//                               {
//                                 month: "long",
//                                 year: "numeric",
//                               }
//                             )
//                           : `${new Date(
//                               tempFromDate
//                             ).toLocaleDateString()} - ${new Date(
//                               tempToDate
//                             ).toLocaleDateString()}`
//                         : "-",
//                       `${targetData?.target?.toLocaleString("en-IN") || "0"}`,
//                       `${targetData?.achieved?.toLocaleString("en-IN") || "0"}`,
//                       `${
//                         targetData?.remaining?.toLocaleString("en-IN") || "0"
//                       }`,
//                       `${
//                         targetData?.targetCommission?.toLocaleString("en-IN", {
//                           minimumFractionDigits: 2,
//                           maximumFractionDigits: 2,
//                         }) || "0.00"
//                       }`,
//                       `${
//                         commissionTotalDetails?.actual_business?.toLocaleString(
//                           "en-IN"
//                         ) || "0"
//                       }`,
//                       `${
//                         commissionTotalDetails?.total_actual?.toLocaleString(
//                           "en-IN"
//                         ) || "0"
//                       }`,
//                       `${
//                         commissionTotalDetails?.expected_business?.toLocaleString(
//                           "en-IN"
//                         ) || "0"
//                       }`,
//                       `${
//                         commissionTotalDetails?.total_estimated?.toLocaleString(
//                           "en-IN"
//                         ) || "0"
//                       }`,
//                       commissionTotalDetails?.total_customers || "0",
//                       commissionTotalDetails?.total_groups || "0",
//                     ]}
//                     exportedFileName={`CommissionReport-${
//                       selectedEmployeeDetails?.name || "all"
//                     }-${
//                       isFilterApplied
//                         ? dateSelectionMode === "month"
//                           ? selectedMonth
//                           : `${tempFromDate}_to_${tempToDate}`
//                         : "unfiltered"
//                     }.csv`}
//                   />
//                 </div>
//               ) : (
//                 isFilterApplied &&
//                 selectedEmployeeDetails?.name && (
//                   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
//                     <p className="text-gray-500 text-lg font-medium">
//                       No commission data found for the selected period.
//                     </p>
//                   </div>
//                 )
//               )}
//             </>
//           )}

//           {/* Commission Modal */}
//           <Modal
//             isVisible={showCommissionModal}
//             onClose={() => setShowCommissionModal(false)}
//             width="max-w-md"
//           >
//             <div className="p-6">
//               <h3 className="text-xl font-bold text-gray-900 border-b pb-4 mb-6">
//                 Add Commission Payment
//               </h3>
//               <form className="space-y-5" onSubmit={handleCommissionSubmit}>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Agent Name
//                   </label>
//                   <input
//                     type="text"
//                     readOnly
//                     value={
//                       employees.find(
//                         (emp) => emp._id === commissionForm.agent_id
//                       )?.name || ""
//                     }
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 font-semibold text-gray-900"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Payment Date
//                   </label>
//                   <input
//                     type="date"
//                     name="pay_date"
//                     value={commissionForm.pay_date}
//                     onChange={handleCommissionChange}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Total Payable Commission
//                   </label>
//                   <input
//                     type="text"
//                     readOnly
//                     value={`${commissionForm.amount || "0.00"}`}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-green-700 font-bold"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Payment Mode
//                   </label>
//                   <select
//                     name="pay_type"
//                     value={commissionForm.pay_type}
//                     onChange={handleCommissionChange}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="cash">Cash</option>
//                     <option value="online">Online</option>
//                     <option value="cheque">Cheque</option>
//                     <option value="bank_transfer">Bank Transfer</option>
//                   </select>
//                 </div>
//                 {commissionForm.pay_type === "online" && (
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Transaction ID
//                     </label>
//                     <input
//                       type="text"
//                       name="transaction_id"
//                       value={commissionForm.transaction_id}
//                       onChange={handleCommissionChange}
//                       className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     {errors.transaction_id && (
//                       <p className="text-red-500 text-sm mt-1">
//                         {errors.transaction_id}
//                       </p>
//                     )}
//                   </div>
//                 )}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Note
//                   </label>
//                   <textarea
//                     name="note"
//                     value={commissionForm.note}
//                     onChange={handleCommissionChange}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                     rows="3"
//                   />
//                 </div>
//                 <div className="flex justify-end gap-3 pt-4 border-t">
//                   <button
//                     type="button"
//                     onClick={() => setShowCommissionModal(false)}
//                     className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
//                   >
//                     Save Payment
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </Modal>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TargetCommission;

import React, { useEffect, useState } from "react";
import { Select, Radio, Tabs } from "antd";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import Modal from "../components/modals/Modal";
import { GiPartyPopper } from "react-icons/gi";
import { FileTextOutlined, DollarOutlined } from "@ant-design/icons";
import { FaMoneyBill } from "react-icons/fa";
import { MdPayments } from "react-icons/md";
import { Link } from "react-router-dom";
import { FiTarget } from "react-icons/fi";

const { TabPane } = Tabs;

const TargetCommission = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [dateSelectionMode, setDateSelectionMode] = useState("month");
  const [agentLoading, setAgentLoading] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [employeeCustomerData, setEmployeeCustomerData] = useState([]);
  const [commissionTotalDetails, setCommissionTotalDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionForm, setCommissionForm] = useState({
    agent_id: "",
    pay_date: new Date().toISOString().split("T")[0],
    amount: "",
    pay_type: "cash",
    transaction_id: "",
    note: "",
    pay_for: "commission",
    admin_type: "",
  });
  const [errors, setErrors] = useState({});
  const [adminId, setAdminId] = useState("");
  const [adminName, setAdminName] = useState("");
  const [targetData, setTargetData] = useState({
    target: 0,
    achieved: 0,
    remaining: 0,
    startDate: "",
    endDate: "",
    targetCommission: 0,
  });
  const [tempSelectedMonth, setTempSelectedMonth] = useState(null);
  const [tempFromDate, setTempFromDate] = useState(null);
  const [tempToDate, setTempToDate] = useState(null);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [activeTab, setActiveTab] = useState("commission");
  const [grossCommissionData, setGrossCommissionData] = useState([]);
  const [grossCommissionSummary, setGrossCommissionSummary] = useState({
    total_gross_incentive_value: 0,
    total_gross_group_value: 0,
    total_gross_enrollments: 0,
  });

  useEffect(() => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`;
    setTempSelectedMonth(currentMonth);
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastday1 = new Date(year, month, 0).getDate();
    const lastDay = `${year}-${month}-${String(lastday1).padStart(2, "0")}`;
    setTempFromDate(firstDay);
    setTempToDate(lastDay);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setAdminId(user._id);
      setAdminName(user.name || "");
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/agent/get");
      setEmployees(res?.data?.agent);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchCommissionReport = async (employeeId, startDate, endDate) => {
    if (!employeeId || !startDate || !endDate) return;
    const abortController = new AbortController();
    setLoading(true);
    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
      };
      const res = await api.get(`/enroll/agent/${employeeId}/commission`, {
        params,
        signal: abortController.signal,
      });
      setEmployeeCustomerData(res.data?.commissionData);
      setCommissionTotalDetails({
        actual_business: res.data?.commissionSummary?.total_group_value,
        total_actual: res.data?.commissionSummary?.total_commission_value,
        total_customers: res.data?.commissionSummary?.total_enrollments,
        total_groups: res.data?.commissionSummary?.total_enrollments,
        expected_business: res.data?.commissionSummary?.total_group_value,
        total_estimated: res.data?.commissionSummary?.total_commission_value,
      });
    } catch (err) {
      if (err.name !== "AbortController") {
        console.error("Error fetching employee report:", err);
        setEmployeeCustomerData([]);
        setCommissionTotalDetails({});
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const fetchGrossIncentiveReport = async (employeeId, startDate, endDate) => {
    if (!employeeId || !startDate || !endDate) return;
    setLoading(true);
    try {
      let params = {
        start_date: startDate,
        end_date: endDate,
      };
      const res = await api.get(
        `/enroll/agent/${employeeId}/gross-commission`,
        {
          params,
        }
      );
      const commissionData = res.data?.grossCommissionInfo?.map(enrollment => ({
        user_name: enrollment?.user_id?.full_name || "N/A",
        phone_number: enrollment?.user_id?.phone_number || "N/A",
        group_name: enrollment?.group_id?.group_name || "N/A",
        group_value: enrollment?.group_id?.group_value || "N/A",
        group_commission: enrollment?.group_id?.commission || "N/A",
        group_ticket: enrollment?.tickets || "N/A",
        enrollment_date: enrollment?.createdAt?.split("T")?.[0],
        total_paid_amount: enrollment?.total_paid_amount || "0",
        group_monthly_installment: enrollment?.group_id?.monthly_installment || "N/A",


      }));
      setGrossCommissionData(commissionData || []);
      setGrossCommissionSummary(res.data.grossCommissionSummary || {
        total_gross_commission_value: 0,
        total_gross_group_value: 0,
        total_gross_enrollments: 0,
      });
    } catch (err) {
      console.error("Error fetching gross incentive report:", err);
      setGrossCommissionData([]);
      setGrossCommissionSummary({
        total_gross_commission_value: 0,
        total_gross_group_value: 0,
        total_gross_enrollments: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTargetCommission = (achievedBusiness, targetAmount) => {
    const achievedNum =
      typeof achievedBusiness === "string"
        ? Number(achievedBusiness.replace(/[^0-9.-]+/g, ""))
        : achievedBusiness;
    const targetNum =
      typeof targetAmount === "string"
        ? Number(targetAmount.replace(/[^0-9.-]+/g, ""))
        : targetAmount;
    if (achievedNum <= targetNum) {
      return achievedNum * 0.005;
    } else {
      const upToTarget = targetNum * 0.005;
      const beyondTarget = (achievedNum - targetNum) * 0.01;
      return upToTarget + beyondTarget;
    }
  };

  const fetchTargetData = async (employeeId, startDate, endDate) => {
    if (!employeeId || !startDate || !endDate) return;
    try {
      const abortController = new AbortController();
      const targetRes = await api.get(`/target/agents/${employeeId}`, {
        params: { start_date: startDate, end_date: endDate },
        signal: abortController.signal,
      });
      const targetForMonth = targetRes.data?.total_target || 0;
      const { data: comm } = await api.get(
        `/enroll/agent/${employeeId}/commission`,
        {
          params: { start_date: startDate, end_date: endDate },
          signal: abortController.signal,
        }
      );
      let achieved = comm?.commissionSummary?.total_group_value || 0;
      if (typeof achieved === "string") {
        achieved = Number(achieved.replace(/[^0-9.-]+/g, ""));
      }
      const remaining = Math.max(targetForMonth - achieved, 0);
      const difference = targetForMonth - achieved;
      const targetCommission = calculateTargetCommission(
        achieved,
        targetForMonth
      );
      setTargetData({
        target: Math.round(targetForMonth),
        achieved,
        remaining,
        difference,
        startDate: startDate,
        endDate: endDate,
        targetCommission,
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error fetching target data:", err);
        setTargetData({
          target: 0,
          achieved: 0,
          remaining: 0,
          difference: 0,
          startDate: "",
          endDate: "",
          targetCommission: 0,
        });
      }
    }
  };

  const fetchAllCommissionReport = async (startDate, endDate) => {
    if (!startDate || !endDate) return;
    const abortController = new AbortController();
    setLoading(true);
    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
      };
      const res = await api.get("/enroll/commission", {
        params,
        signal: abortController.signal,
      });
      setEmployeeCustomerData(res.data?.commissionData);
      setCommissionTotalDetails({
        actual_business: res.data?.commissionSummary?.total_group_value,
        total_actual: res.data?.commissionSummary?.total_commission_value,
        total_customers: res.data?.commissionSummary?.total_enrollments,
        total_groups: res.data?.commissionSummary?.total_enrollments,
        expected_business: res.data?.commissionSummary?.total_group_value,
        total_estimated: res.data?.commissionSummary?.total_commission_value,
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error fetching all commission report:", err);
        setEmployeeCustomerData([]);
        setCommissionTotalDetails({});
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const fetchAllGrossIncentiveReport = async (startDate, endDate) => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      let params = {
        start_date: startDate,
        end_date: endDate,
      };
      const res = await api.get("/enroll/gross-incentive", {
        params,
      });
      setGrossCommissionData(res.data.grossIncentiveInfo || []);
      setGrossCommissionSummary(res.data.grossCommissionSummary || {
        total_gross_incentive_value: 0,
        total_gross_group_value: 0,
        total_gross_enrollments: 0,
      });
    } catch (err) {
      console.error("Error fetching all gross incentive report:", err);
      setGrossCommissionData([]);
      setGrossCommissionSummary({
        total_gross_incentive_value: 0,
        total_gross_group_value: 0,
        total_gross_enrollments: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (value) => {
    setSelectedEmployeeId(value);
    setSelectedEmployeeDetails(null);
    setEmployeeCustomerData([]);
    setCommissionTotalDetails({});
    setTargetData({
      target: 0,
      achieved: 0,
      remaining: 0,
      startDate: "",
      endDate: "",
      targetCommission: 0,
    });
    setGrossCommissionData([]);
    setGrossCommissionSummary({
      total_gross_incentive_value: 0,
      total_gross_group_value: 0,
      total_gross_enrollments: 0,
    });
    setIsFilterApplied(false);
  };

  const handleTempMonthChange = (e) => {
    const selectedMonth = e.target.value;
    setTempSelectedMonth(selectedMonth);
    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-");
      const firstDay = `${year}-${month}-01`;
      const lastday1 = new Date(year, month, 0).getDate();
      const lastDay = `${year}-${month}-${String(lastday1).padStart(2, "0")}`;
      setTempFromDate(firstDay);
      setTempToDate(lastDay);
    }
  };

  const applyFilter = async () => {
    if (!selectedEmployeeId) {
      alert("Please select an agent.");
      return;
    }
    if (dateSelectionMode === "month" && !tempSelectedMonth) {
      alert("Please select a month.");
      return;
    }
    if (dateSelectionMode === "date-range" && (!tempFromDate || !tempToDate)) {
      alert("Please select both From and To dates.");
      return;
    }
    let startDate, endDate;
    if (dateSelectionMode === "month") {
      setSelectedMonth(tempSelectedMonth);
      const [year, month] = tempSelectedMonth.split("-");
      startDate = `${year}-${month}-01`;

      const lastDay = new Date(year, month, 0).getDate();
      endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

    } else {
      startDate = tempFromDate;
      endDate = tempToDate;
    }
    setAgentLoading(true);
    setLoading(true);
    setIsFilterApplied(true);

    try {
      // Always fetch both reports regardless of active tab
      if (selectedEmployeeId === "ALL") {
        setSelectedEmployeeDetails(null);
        setTargetData({
          target: 0,
          achieved: 0,
          remaining: 0,
          startDate: "",
          endDate: "",
          targetCommission: 0,
        });
        await fetchAllCommissionReport(startDate, endDate);
        await fetchAllGrossIncentiveReport(startDate, endDate);
      } else {
        const emp = employees.find((e) => e._id === selectedEmployeeId);
        setSelectedEmployeeDetails(emp || null);
        await fetchCommissionReport(selectedEmployeeId, startDate, endDate);
        await fetchTargetData(selectedEmployeeId, startDate, endDate);
        await fetchGrossIncentiveReport(selectedEmployeeId, startDate, endDate);
      }
    } finally {
      setAgentLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCommissionChange = (e) => {
    const { name, value } = e.target;
    setCommissionForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!commissionForm.agent_id) newErrors.agent_id = "Please select an agent";
    if (!commissionForm.amount || isNaN(commissionForm.amount))
      newErrors.amount = "Please enter a valid amount";
    if (commissionForm.pay_type === "online" && !commissionForm.transaction_id)
      newErrors.transaction_id = "Transaction ID is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = { ...commissionForm, admin_type: adminId };
      await api.post("/payment-out/add-commission-payment", payload);
      alert("Commission Paid Successfully!");
      setShowCommissionModal(false);
    } catch (err) {
      alert("Failed to add payment.");
    }
  };

  const processedTableData = employeeCustomerData.map((item, index) => ({
    ...item,
    group_value_digits: item.group_id?.group_value || 0,
    estimated_commission_digits: item.estimated_commission || 0,
    actual_commission_digits: item.commission_value || 0,
    total_paid_digits: item.total_paid_amount || 0,
    required_installment_digits: item.group_id?.monthly_installment || 0,
    group_ticket: item?.ticket || 0,
    net_commission_percentage: item?.group_id?.commission || 0,
    commission_released: item.commission_released ? "Yes" : "No",
    user_name: item.user_id?.full_name || "N/A",
    phone_number: item.user_id?.phone_number || "N/A",
    group_name: item.group_id?.group_name || "N/A",
    enollment_date: item.createdAt?.split("T")?.[0]
      || "N/A",
  }));

  const columns = [
    { key: "user_name", header: "Customer Name" },
    { key: "phone_number", header: "Phone Number" },
    { key: "group_name", header: "Group Name" },
    { key: "group_ticket", header: "Ticket No" },
    { key: "group_value_digits", header: "Group Value" },
    { key: "enollment_date", header: "Enrollment Date" },
    { key: "net_commission_percentage", header: "Net Commission Percentage" },
    { key: "actual_commission_digits", header: "Net Commission" },
    { key: "total_paid_digits", header: "Total Paid" },
    { key: "required_installment_digits", header: "Required Installment" },
    { key: "commission_released", header: "Commission Released" },
  ];


  const grossCommissionColumns = [
    { key: "user_name", header: "Customer Name" },
    { key: "phone_number", header: "Phone Number" },
    { key: "group_name", header: "Group Name" },
    { key: "group_value", header: "Group Value" },
    { key: "group_ticket", header: "Ticket No" },
    { key: "enrollment_date", header: "Enrollment Date" },
    { key: "group_monthly_installment", header: "First Installment Amount" },
    { key: "group_commission", header: "Commission Percentage" },
    { key: "total_paid_amount", header: "Total Paid" },

  ];


  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  return (
    <div className="w-screen min-h-screen bg-gray-50">
      <div className="flex">
        <Navbar visibility={true} />
        <div className="flex-grow p-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              Commission Reports
            </h1>
            <p className="text-gray-600 mt-2">Track and manage agent commissions and performance</p>
          </div>

          {/* Filter Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Report Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Agent Select */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Agent
                </label>
                <Select
                  value={selectedEmployeeId || undefined}
                  onChange={handleEmployeeChange}
                  showSearch
                  popupMatchSelectWidth={false}
                  placeholder="Search by name or phone"
                  filterOption={(input, option) =>
                    option.children
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  style={{ height: "44px" }}
                  className="rounded"
                >
                  {employees.map((emp) => (
                    <Select.Option key={emp._id} value={emp._id}>
                      {emp.name} - {emp.phone_number}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              {/* Date Selection Mode */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Date Selection
                </label>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg h-11">
                  <Radio.Group
                    value={dateSelectionMode}
                    onChange={(e) => setDateSelectionMode(e.target.value)}
                  >
                    <Radio value="month" className="text-sm">Month</Radio>
                    <Radio value="date-range" className="text-sm">Range</Radio>
                  </Radio.Group>
                </div>
              </div>
              {/* Date Picker Fields */}
              {dateSelectionMode === "month" ? (
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Month
                  </label>
                  <input
                    type="month"
                    value={tempSelectedMonth || ""}
                    max={currentMonth}
                    onChange={handleTempMonthChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
                  />
                </div>
              ) : (
                <>
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={tempFromDate || ""}
                      max={tempToDate || currentMonth}
                      onChange={(e) => setTempFromDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={tempToDate || ""}
                      min={tempFromDate || ""}
                      max={currentMonth}
                      onChange={(e) => setTempToDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
                    />
                  </div>
                </>
              )}
            </div>
            {/* Filter Button */}
            <div className="flex justify-end">
              <button
                onClick={applyFilter}
                className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm"
              >
                Continue
              </button>
            </div>
          </div>

          {agentLoading ? (
            <div className="flex justify-center py-20">
              <CircularLoader isLoading={true} />
            </div>
          ) : (
            <>
              {/* Quick Links */}
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link
                    to="/target-menu/target"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <FiTarget className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">Set Target</span>
                  </Link>
                  <Link
                    to="/reports/target-incentive"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <FileTextOutlined className="text-blue-600 group-hover:scale-110 transition-transform text-lg" />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">Incentive Report</span>
                  </Link>
                  {/* <Link
                    to="/target-commission-incentive"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <MdPayments className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">Incentive / Commission Payout</span>
                  </Link> */}
                  <Link
                    to="/payment-menu/payment-in-out-menu/payment-out/salary-payment"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <FaMoneyBill className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">Salary Payout</span>
                  </Link>
                </div>
              </div>

              {/* Tabbed View for Reports */}
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                {/* Commission Report Tab */}
                <TabPane tab="Net Commission Report" key="commission">
                  {/* Employee Details */}
                  {isFilterApplied && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                      {selectedEmployeeId !== "ALL" && selectedEmployeeDetails && (
                        <>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Agent Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                              <label className="text-xs font-semibold text-gray-600 uppercase">Name</label>
                              <input
                                value={selectedEmployeeDetails.name || "-"}
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 uppercase">Email</label>
                              <input
                                value={selectedEmployeeDetails.email || "-"}
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 uppercase">Phone</label>
                              <input
                                value={selectedEmployeeDetails.phone_number || "-"}
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                              <label className="text-xs font-semibold text-gray-600 uppercase">Adhaar</label>
                              <input
                                value={selectedEmployeeDetails.adhaar_no || "-"}
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 uppercase">PAN</label>
                              <input
                                value={selectedEmployeeDetails.pan_no || "-"}
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 uppercase">Pincode</label>
                              <input
                                value={selectedEmployeeDetails.pincode || "-"}
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                              <label className="text-xs font-semibold text-gray-600 uppercase">
                                Address
                              </label>
                              <input
                                value={selectedEmployeeDetails?.address || "-"}
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-gray-600 uppercase">
                                Joining Date
                              </label>
                              <input
                                value={
                                  selectedEmployeeDetails?.joining_date
                                    ? selectedEmployeeDetails.joining_date.split(
                                        "T"
                                      )[0]
                                    : "-"
                                }
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-900 font-medium mt-1"
                              />
                            </div>
                          </div>
                          <hr className="my-6" />
                        </>
                      )}
                      {/* Summary Section */}
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Commission Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                          <label className="text-xs font-semibold text-gray-600 uppercase">Net Business</label>
                          <input
                            value={commissionTotalDetails?.actual_business || "-"}
                            readOnly
                            className="w-full bg-transparent text-2xl font-bold text-green-700 mt-2 border-0"
                          />
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                          <label className="text-xs font-semibold text-gray-600 uppercase">Net Commission (1% each)</label>
                          <input
                            value={commissionTotalDetails?.total_actual || "-"}
                            readOnly
                            className="w-full bg-transparent text-2xl font-bold text-blue-700 mt-2 border-0"
                          />
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                          <label className="text-xs font-semibold text-gray-600 uppercase">Net Customers</label>
                          <input
                            value={commissionTotalDetails?.total_customers || "-"}
                            readOnly
                            className="w-full bg-transparent text-2xl font-bold text-purple-700 mt-2 border-0"
                          />
                        </div>
                        {/* <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                          <label className="text-xs font-semibold text-gray-600 uppercase">Net Groups</label>
                          <input
                            value={commissionTotalDetails?.total_groups || "-"}
                            readOnly
                            className="w-full bg-transparent text-2xl font-bold text-orange-700 mt-2 border-0"
                          />
                        </div> */}
                      </div>
                    </div>
                  )}
                  {/* Target Details */}
                  {isFilterApplied &&
                    selectedEmployeeId &&
                    selectedEmployeeId !== "ALL" && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-800">Target Performance</h3>
                          {targetData.achieved >= targetData.target && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 border border-green-300">
                              <GiPartyPopper size={24} className="text-green-600" />
                              <span className="text-green-700 font-semibold">Target Achieved</span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                            <label className="text-xs font-semibold text-gray-600 uppercase">Target Set</label>
                            <p className="text-2xl font-bold text-blue-700 mt-2">
                              {`${targetData.target?.toLocaleString("en-IN")}`}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                            <label className="text-xs font-semibold text-gray-600 uppercase">Achieved</label>
                            <p className="text-2xl font-bold text-green-700 mt-2">
                              {`${targetData.achieved?.toLocaleString("en-IN")}`}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
                            <label className="text-xs font-semibold text-gray-600 uppercase">Difference</label>
                            <p className="text-2xl font-bold text-amber-700 mt-2">
                              {`${(targetData.difference ?? "0")?.toLocaleString("en-IN")}`}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
                            <label className="text-xs font-semibold text-gray-600 uppercase">Total Payable Commission</label>
                            <p className="text-2xl font-bold text-emerald-700 mt-2">
                              {`${targetData.targetCommission.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`}
                            </p>
                          </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                          <p className="text-sm font-semibold text-blue-800 mb-3">Commission Breakdown</p>
                          <ul className="space-y-2">
                            <li className="text-sm text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              <span>Up to target (0.5%): {(Math.min(targetData.achieved, targetData.target) * 0.005).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}</span>
                            </li>
                            {targetData.achieved > targetData.target && (
                              <li className="text-sm text-gray-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                <span>Beyond target (1%): {((targetData.achieved - targetData.target) * 0.01).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  {/* Data Table */}
                  {loading ? (
                    <div className="flex justify-center py-20">
                      <CircularLoader isLoading={true} />
                    </div>
                  ) : employeeCustomerData.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <DataTable
                        data={processedTableData}
                        columns={columns}
                        exportedPdfName={`Commission Report`}
                        printHeaderKeys={[
                          "Name",
                          "Phone Number",
                          "Month",
                          "Target Set",
                          "Achieved",
                          "Remaining",
                          "Total Payable Commission",
                          "Actual Business",
                          "Actual Commission",
                          "Gross Business",
                          "Gross Commission",
                          "Total Customers",
                          "Total Groups",
                        ]}
                        printHeaderValues={[
                          selectedEmployeeId === "ALL"
                            ? "All Employees"
                            : selectedEmployeeDetails?.name || "-",
                          selectedEmployeeId === "ALL"
                            ? "-"
                            : selectedEmployeeDetails?.phone_number || "-",
                          isFilterApplied
                            ? dateSelectionMode === "month"
                              ? new Date(`${selectedMonth}-01`).toLocaleString(
                                "default",
                                {
                                  month: "long",
                                  year: "numeric",
                                }
                              )
                              : `${new Date(
                                tempFromDate
                              ).toLocaleDateString()} - ${new Date(
                                tempToDate
                              ).toLocaleDateString()}`
                            : "-",
                          `${targetData?.target?.toLocaleString("en-IN") || "0"}`,
                          `${targetData?.achieved?.toLocaleString("en-IN") || "0"}`,
                          `${targetData?.remaining?.toLocaleString("en-IN") || "0"
                          }`,
                          `${targetData?.targetCommission?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) || "0.00"
                          }`,
                          `${commissionTotalDetails?.actual_business?.toLocaleString(
                            "en-IN"
                          ) || "0"
                          }`,
                          `${commissionTotalDetails?.total_actual?.toLocaleString(
                            "en-IN"
                          ) || "0"
                          }`,
                          `${commissionTotalDetails?.expected_business?.toLocaleString(
                            "en-IN"
                          ) || "0"
                          }`,
                          `${commissionTotalDetails?.total_estimated?.toLocaleString(
                            "en-IN"
                          ) || "0"
                          }`,
                          commissionTotalDetails?.total_customers || "0",
                          commissionTotalDetails?.total_groups || "0",
                        ]}
                        exportedFileName={`CommissionReport-${selectedEmployeeDetails?.name || "all"
                          }-${isFilterApplied
                            ? dateSelectionMode === "month"
                              ? selectedMonth
                              : `${tempFromDate}_to_${tempToDate}`
                            : "unfiltered"
                          }.csv`}
                      />
                    </div>
                  ) : (
                    isFilterApplied &&
                    selectedEmployeeDetails?.name && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-lg font-medium">
                          No commission data found for the selected period.
                        </p>
                      </div>
                    )
                  )}
                </TabPane>

                {/* Gross Incentive Report Tab */}
                <TabPane tab="Gross Commission Report" key="gross-incentive">
                  {/* Gross Incentive Summary Section */}
                  {isFilterApplied && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Gross Incentive Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                          <label className="text-xs font-semibold text-gray-600 uppercase">Gross Group Value</label>
                          <input
                            value={grossCommissionSummary.total_gross_group_value?.toLocaleString("en-IN") || "-"}
                            readOnly
                            className="w-full bg-transparent text-2xl font-bold text-green-700 mt-2 border-0"
                          />
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                          <label className="text-xs font-semibold text-gray-600 uppercase">Gross Commission Value</label>
                          <input
                            value={grossCommissionSummary.total_gross_commission_value?.toLocaleString("en-IN") || "-"}
                            readOnly
                            className="w-full bg-transparent text-2xl font-bold text-blue-700 mt-2 border-0"
                          />
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                          <label className="text-xs font-semibold text-gray-600 uppercase">Gross Enrollments</label>
                          <input
                            value={grossCommissionSummary.total_gross_enrollments || "-"}
                            readOnly
                            className="w-full bg-transparent text-2xl font-bold text-purple-700 mt-2 border-0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data Table */}
                  {loading ? (
                    <div className="flex justify-center py-20">
                      <CircularLoader isLoading={true} />
                    </div>
                  ) : grossCommissionData.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <DataTable
                        data={grossCommissionData}
                        columns={grossCommissionColumns}
                        exportedPdfName={`Gross Incentive Report`}
                        printHeaderKeys={[
                          "Name",
                          "Phone Number",
                          "Period",
                          "Total Group Value",
                          "Total Incentive Value",
                          "Total Enrollments",
                        ]}
                        printHeaderValues={[
                          selectedEmployeeId === "ALL"
                            ? "All Employees"
                            : selectedEmployeeDetails?.name || "-",
                          selectedEmployeeId === "ALL"
                            ? "-"
                            : selectedEmployeeDetails?.phone_number || "-",
                          isFilterApplied
                            ? dateSelectionMode === "month"
                              ? new Date(`${selectedMonth}-01`).toLocaleString(
                                "default",
                                {
                                  month: "long",
                                  year: "numeric",
                                }
                              )
                              : `${new Date(
                                tempFromDate
                              ).toLocaleDateString()} - ${new Date(
                                tempToDate
                              ).toLocaleDateString()}`
                            : "-",
                          `${grossCommissionSummary.total_gross_group_value?.toLocaleString("en-IN") || "0"}`,
                          `${grossCommissionSummary.total_gross_incentive_value?.toLocaleString("en-IN") || "0"}`,
                          `${grossCommissionSummary.total_gross_enrollments || "0"}`,
                        ]}
                        exportedFileName={`GrossIncentiveReport-${selectedEmployeeDetails?.name || "all"
                          }-${isFilterApplied
                            ? dateSelectionMode === "month"
                              ? selectedMonth
                              : `${tempFromDate}_to_${tempToDate}`
                            : "unfiltered"
                          }.csv`}
                      />
                    </div>
                  ) : (
                    isFilterApplied &&
                    selectedEmployeeDetails?.name && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-lg font-medium">
                          No gross incentive data found for the selected period.
                        </p>
                      </div>
                    )
                  )}
                </TabPane>
              </Tabs>
            </>
          )}


        </div>
      </div>
    </div>
  );
};

export default TargetCommission;