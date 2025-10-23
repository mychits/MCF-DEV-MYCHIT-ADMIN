import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import API from "../instance/TokenInstance";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import { Select, Tooltip, notification, Dropdown, Button, DatePicker, } from "antd";
import SettingSidebar from "../components/layouts/SettingSidebar";
import SalarySlipPrint from "../components/printFormats/SalarySlipPrint";
import { IoMdMore } from "react-icons/io";
import EditSalaryModal from "../components/modals/EditSalaryModal";
const { RangePicker } = DatePicker;
const { Option } = Select;

// const PayoutSalaryReport = () => {
//   const paymentFor = "salary";
//   const [api, contextHolder] = notification.useNotification();

//   const [showSalaryModal, setShowSalaryModal] = useState(false);
//   const [modifyPayment, setModifyPayment] = useState(false);
//   const [adminId, setAdminId] = useState("");
//   const [adminName, setAdminName] = useState("");
//   const [filterEmp, setFilterEmp] = useState("");
//   const [filterMonth, setFilterMonth] = useState("");
//   const [salaryPayments, setSalaryPayments] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [reRender, setReRender] = useState(0);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingSalary, setEditingSalary] = useState(null);

//   const [alertConfig, setAlertConfig] = useState({
//     visibility: false,
//     message: "",
//     type: "info",
//     noReload: false,
//   });

//   // ✅ Fetch employee list
//   const fetchAgents = async () => {
//     try {
//       const response = await API.get("/agent/get-employee");
//       setAgents(response.data?.employee || []);
//     } catch (error) {
//       console.error("Failed to fetch Agents", error);
//     }
//   };

//   // ✅ Fetch salary payments with month filter (from months_included)
//   // const fetchSalaryPayments = async () => {
//   //   setIsLoading(true);
//   //   try {
//   //     const response = await API.get("/salary/get-salary-report");
//   //     const salaryArray = Array.isArray(response.data)
//   //       ? response.data
//   //       : response.data.data || [];

//   //     // ✅ Transform data
//   //     let filtered = salaryArray.map((payment, index) => {
//   //       const meta = payment.payout_metadata || {};
//   //       const salaryMonth = meta?.months_included?.[0] || null;
//   //       return {
//   //         id: index + 1,
//   //         _id: payment._id,
//   //         pay_date:
//   //           meta?.date_range?.from?.split("T")[0] ||
//   //           payment.pay_date?.split("T")[0] ||
//   //           "-",
//   //         agent_name:
//   //           payment.employee_id?.name ||
//   //           payment.employee_id?.full_name ||
//   //           "N/A",
//   //         from_date: meta?.date_range?.from?.split("T")[0] || "-",
//   //         to_date: meta?.date_range?.to?.split("T")[0] || "-",
//   //         total_salary: meta?.total_salary || 0,
//   //         total_paid_amount: meta?.total_paid_amount || 0,
//   //         months_included: meta?.months_included?.join(", ") || "-",
//   //         pay_type: meta?.pay_type || "N/A",
//   //         receipt_no: meta?.receipt_no || payment.receipt_no || "-",
//   //         disbursed_by: meta?.disbursed_by || payment.disbursed_by || "Admin",
//   //         salaryMonth,
//   //         note: meta?.note || "-",
//   //       };
//   //     });

//   //     // ✅ Apply filters
//   //     if (filterEmp) {
//   //       filtered = filtered.filter((p) => p._id && p._id === filterEmp);
//   //     }
//   //     if (filterMonth) {
//   //       filtered = filtered.filter(
//   //         (p) =>
//   //           p.salaryMonth &&
//   //           p.salaryMonth.toLowerCase() === filterMonth.toLowerCase()
//   //       );
//   //     }

//   //     setSalaryPayments(filtered);
//   //   } catch (error) {
//   //     console.error("Failed to fetch salary payments", error);
//   //     setSalaryPayments([]);
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   const fetchSalaryPayments = async () => {
//   setIsLoading(true);
//   try {
//     const params = {};
//     if (filterEmp) params.empId = filterEmp;
//     if (filterMonth) params.month = filterMonth;

//     const response = await API.get("/salary/get-salary-report", { params });
//     const salaryArray = Array.isArray(response.data.data) ? response.data.data : [];

//     const filtered = salaryArray.map((payment, index) => {
//       const meta = payment.payout_metadata || {};
//       const salaryMonth = meta?.months_included?.[0] || null;
//       return {
//         id: index + 1,
//         _id: payment._id,
//         employee_id: payment.employee_id?._id,
//         pay_date: meta?.date_range?.from?.split("T")[0] || payment.pay_date?.split("T")[0] || "-",
//         agent_name: payment.employee_id?.name || payment.employee_id?.full_name || "N/A",
//         from_date: meta?.date_range?.from?.split("T")[0] || "-",
//         to_date: meta?.date_range?.to?.split("T")[0] || "-",
//         total_salary: meta?.total_salary || 0,
//         total_paid_amount: meta?.total_paid_amount || 0,
//         months_included: meta?.months_included?.join(", ") || "-",
//         pay_type: meta?.pay_type || "N/A",
//         receipt_no: meta?.receipt_no || payment.receipt_no || "-",
//         disbursed_by: meta?.disbursed_by || payment.disbursed_by || "Admin",
//         salaryMonth,
//         note: meta?.note || "-",
//       };
//     });

//     setSalaryPayments(filtered);
//   } catch (error) {
//     console.error("Failed to fetch salary payments", error);
//     setSalaryPayments([]);
//   } finally {
//     setIsLoading(false);
//   }
// };

//   // ✅ Initial setup
//   useEffect(() => {
//     const user = localStorage.getItem("user");
//     const userObj = user ? JSON.parse(user) : {};
//     setAdminId(userObj._id);
//     setAdminName(userObj.name || "");
//     if (userObj?.admin_access_right_id?.access_permissions?.edit_payment) {
//       setModifyPayment(
//         userObj.admin_access_right_id.access_permissions.edit_payment === "true"
//       );
//     }
//   }, []);

//   // ✅ Auto-hide alert
//   useEffect(() => {
//     if (alertConfig.visibility && alertConfig.noReload) {
//       const timer = setTimeout(() => {
//         setAlertConfig((prev) => ({ ...prev, visibility: false }));
//       }, 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [alertConfig.visibility]);

//   // ✅ Fetch on mount or filters
//   useEffect(() => {
//     fetchAgents();
//   }, []);

//   useEffect(() => {
//     fetchSalaryPayments();
//   }, [filterEmp, filterMonth, reRender]);

//   // ✅ Table Columns
//   const salaryColumns = [
//     { key: "id", header: "SL. NO" },
//     { key: "pay_date", header: "Pay Date" },
//     { key: "agent_name", header: "Agent" },
//     { key: "total_paid_amount", header: "Total Paid Amount (₹)" },
//     { key: "total_salary", header: "Total Salary Amount (₹)" },
//     { key: "pay_type", header: "Payment Mode" },
//     { key: "receipt_no", header: "Receipt No" },
//     { key: "from_date", header: "From Date" },
//     { key: "to_date", header: "To Date" },
//     { key: "salaryMonth", header: "Month" },
//     { key: "note", header: "Note" },
//     { key: "disbursed_by", header: "Disbursed by" },
//   ];

//   return (
//     <>
//       {contextHolder}
//       <div className="flex mt-20">
//         <div className="flex-grow p-7">
//           {/* Header */}
//           <h1 className="text-2xl font-semibold mb-4">
//             Payout Salary Report
//           </h1>

//           {/* Filters */}
//           <div className="flex items-end gap-4 mb-6">
//             {/* Employee Filter */}
//             <div>
//               <label className="block text-sm text-gray-700">Employee</label>
//               <select
//                 value={filterEmp}
//                 onChange={(e) => setFilterEmp(e.target.value)}
//                 className="border rounded px-3 py-2 w-56"
//               >
//                 <option value="">All Employees</option>
//                 {agents.map((emp) => (
//                   <option key={emp._id} value={emp._id}>
//                     {emp.name || emp.full_name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Month Filter */}
//             <div>
//               <label className="block text-sm text-gray-700">Month</label>
//               <select
//                 value={filterMonth}
//                 onChange={(e) => setFilterMonth(e.target.value)}
//                 className="border rounded px-3 py-2 w-40"
//               >
//                 <option value="">All Months</option>
//                 {[
//                   "January",
//                   "February",
//                   "March",
//                   "April",
//                   "May",
//                   "June",
//                   "July",
//                   "August",
//                   "September",
//                   "October",
//                   "November",
//                   "December",
//                 ].map((m) => (
//                   <option key={m} value={m}>
//                     {m}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Filter Button */}
//             <button
//               onClick={fetchSalaryPayments}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//             >
//               Filter
//             </button>
//           </div>

//           {/* Salary Payments Table */}
//           <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            

//             {salaryPayments.length > 0 ? (
//               <DataTable
//                 data={salaryPayments}
//                 columns={salaryColumns}
//                 exportedPdfName="PayOut Salary"
//                 exportedFileName="PayOut Salary.csv"
//               />
//             ) : (
//               <div className="mt-10 text-center text-gray-500">
//                 <CircularLoader
//                   isLoading={isLoading}
//                   data="Salary Payments"
//                   failure={salaryPayments.length === 0}
//                 />
//               </div>
//             )}
//           </div>

//           {/* Edit Salary Modal */}
//           <EditSalaryModal
//             isVisible={isEditing}
//             onClose={() => {
//               setIsEditing(false);
//               setEditingSalary(null);
//             }}
//             salary={editingSalary}
//             onEditSuccess={() => {
//               setIsEditing(false);
//               setEditingSalary(null);
//               setReRender((prev) => prev + 1);
//               fetchSalaryPayments();
//             }}
//           />
//         </div>
//       </div>
//     </>
//   );
// };

// const PayoutSalaryReport = () => {
//   const paymentFor = "salary";
//   const [api, contextHolder] = notification.useNotification();

//   const [showSalaryModal, setShowSalaryModal] = useState(false);
//   const [modifyPayment, setModifyPayment] = useState(false);
//   const [adminId, setAdminId] = useState("");
//   const [adminName, setAdminName] = useState("");
//   const [filterEmp, setFilterEmp] = useState("");
//   const [filterMonth, setFilterMonth] = useState("");
//   const [customFromDate, setCustomFromDate] = useState("");
//   const [customToDate, setCustomToDate] = useState("");

//   const [salaryPayments, setSalaryPayments] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [reRender, setReRender] = useState(0);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingSalary, setEditingSalary] = useState(null);

//   const [alertConfig, setAlertConfig] = useState({
//     visibility: false,
//     message: "",
//     type: "info",
//     noReload: false,
//   });

//   // ✅ Fetch employee list
//   const fetchAgents = async () => {
//     try {
//       const response = await API.get("/agent/get-employee");
//       setAgents(response.data?.employee || []);
//     } catch (error) {
//       console.error("Failed to fetch Agents", error);
//     }
//   };

//   // ✅ Fetch salary payments with month + custom date filters
//   const fetchSalaryPayments = async () => {
//     setIsLoading(true);
//     try {
//       const params = {};
//       if (filterEmp) params.empId = filterEmp;
//       if (filterMonth && !customFromDate && !customToDate) params.month = filterMonth;
//       if (customFromDate) params.from_date = customFromDate;
//       if (customToDate) params.to_date = customToDate;

//       const response = await API.get("/salary/get-salary-report", { params });
//       const salaryArray = Array.isArray(response.data.data) ? response.data.data : [];

//       const filtered = salaryArray.map((payment, index) => {
//         const meta = payment.payout_metadata || {};
//         const salaryMonth = meta?.months_included?.[0] || null;
//         return {
//           id: index + 1,
//           _id: payment._id,
//           employee_id: payment.employee_id?._id,
//           pay_date: meta?.date_range?.from?.split("T")[0] || payment.pay_date?.split("T")[0] || "-",
//           agent_name: payment.employee_id?.name || payment.employee_id?.full_name || "N/A",
//           from_date: meta?.date_range?.from?.split("T")[0] || "-",
//           to_date: meta?.date_range?.to?.split("T")[0] || "-",
//           total_salary: meta?.total_salary || 0,
//           total_paid_amount: meta?.total_paid_amount || 0,
//           months_included: meta?.months_included?.join(", ") || "-",
//           pay_type: meta?.pay_type || "N/A",
//           receipt_no: meta?.receipt_no || payment.receipt_no || "-",
//           disbursed_by: meta?.disbursed_by || payment.disbursed_by || "Admin",
//           salaryMonth,
//           note: meta?.note || "-",
//         };
//       });

//       setSalaryPayments(filtered);
//     } catch (error) {
//       console.error("Failed to fetch salary payments", error);
//       setSalaryPayments([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ✅ Initial setup
//   useEffect(() => {
//     const user = localStorage.getItem("user");
//     const userObj = user ? JSON.parse(user) : {};
//     setAdminId(userObj._id);
//     setAdminName(userObj.name || "");
//     if (userObj?.admin_access_right_id?.access_permissions?.edit_payment) {
//       setModifyPayment(
//         userObj.admin_access_right_id.access_permissions.edit_payment === "true"
//       );
//     }
//   }, []);

//   // ✅ Auto-hide alert
//   useEffect(() => {
//     if (alertConfig.visibility && alertConfig.noReload) {
//       const timer = setTimeout(() => {
//         setAlertConfig((prev) => ({ ...prev, visibility: false }));
//       }, 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [alertConfig.visibility]);

//   // ✅ Fetch on mount or filters
//   useEffect(() => {
//     fetchAgents();
//   }, []);

//   useEffect(() => {
//     fetchSalaryPayments();
//   }, [filterEmp, filterMonth, customFromDate, customToDate, reRender]);

//   // ✅ Table Columns
//   const salaryColumns = [
//     { key: "id", header: "SL. NO" },
//     { key: "pay_date", header: "Pay Date" },
//     { key: "agent_name", header: "Agent" },
//     { key: "total_paid_amount", header: "Total Paid Amount (₹)" },
//     { key: "total_salary", header: "Total Salary Amount (₹)" },
//     { key: "pay_type", header: "Payment Mode" },
//     { key: "receipt_no", header: "Receipt No" },
//     { key: "from_date", header: "From Date" },
//     { key: "to_date", header: "To Date" },
//     { key: "salaryMonth", header: "Month" },
//     { key: "note", header: "Note" },
//     { key: "disbursed_by", header: "Disbursed by" },
//   ];

//   return (
//     <>
//       {contextHolder}
//       <div className="flex mt-20">
//         <div className="flex-grow p-7">
//           <h1 className="text-2xl font-semibold mb-4">Payout Salary Report</h1>

//           {/* Filters */}
//           <div className="flex flex-wrap items-end gap-4 mb-6">
//             {/* Employee Filter */}
//             <div>
//               <label className="block text-sm text-gray-700">Employee</label>
//               <select
//                 value={filterEmp}
//                 onChange={(e) => setFilterEmp(e.target.value)}
//                 className="border rounded px-3 py-2 w-56"
//               >
//                 <option value="">All Employees</option>
//                 {agents.map((emp) => (
//                   <option key={emp._id} value={emp._id}>
//                     {emp.name || emp.full_name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Month Filter */}
//             <div>
//               <label className="block text-sm text-gray-700">Month</label>
//               <select
//                 value={filterMonth}
//                 onChange={(e) => setFilterMonth(e.target.value)}
//                 className="border rounded px-3 py-2 w-40"
//                 disabled={customFromDate || customToDate} // Disable month filter if custom date selected
//               >
//                 <option value="">All Months</option>
//                 {[
//                   "January",
//                   "February",
//                   "March",
//                   "April",
//                   "May",
//                   "June",
//                   "July",
//                   "August",
//                   "September",
//                   "October",
//                   "November",
//                   "December",
//                 ].map((m) => (
//                   <option key={m} value={m}>
//                     {m}
//                   </option>
                  
//                 ))}
//                 <option value="custom">Custom</option>
//               </select>
//             </div>

//             {/* Custom From Date */}
//             <div>
//               <label className="block text-sm text-gray-700">From Date</label>
//               <input
//                 type="date"
//                 value={customFromDate}
//                 onChange={(e) => setCustomFromDate(e.target.value)}
//                 className="border rounded px-3 py-2 w-40"
//               />
//             </div>

//             {/* Custom To Date */}
//             <div>
//               <label className="block text-sm text-gray-700">To Date</label>
//               <input
//                 type="date"
//                 value={customToDate}
//                 onChange={(e) => setCustomToDate(e.target.value)}
//                 className="border rounded px-3 py-2 w-40"
//               />
//             </div>

//             {/* Filter Button */}
//             {/* <button
//               onClick={fetchSalaryPayments}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//             >
//               Filter
//             </button> */}

           
//             <button
//               onClick={() => {
//                 setFilterEmp("");
//                 setFilterMonth("");
//                 setCustomFromDate("");
//                 setCustomToDate("");
//                 fetchSalaryPayments();
//               }}
//               className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
//             >
//               Clear
//             </button>
//           </div>

//           {/* Salary Payments Table */}
//           <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
//             {salaryPayments.length > 0 ? (
//               <DataTable
//                 data={salaryPayments}
//                 columns={salaryColumns}
//                 exportedPdfName="PayOut Salary"
//                 exportedFileName="PayOut Salary.csv"
//               />
//             ) : (
//               <div className="mt-10 text-center text-gray-500">
//                 <CircularLoader
//                   isLoading={isLoading}
//                   data="Salary Payments"
//                   failure={salaryPayments.length === 0}
//                 />
//               </div>
//             )}
//           </div>

//           {/* Edit Salary Modal */}
//           <EditSalaryModal
//             isVisible={isEditing}
//             onClose={() => {
//               setIsEditing(false);
//               setEditingSalary(null);
//             }}
//             salary={editingSalary}
//             onEditSuccess={() => {
//               setIsEditing(false);
//               setEditingSalary(null);
//               setReRender((prev) => prev + 1);
//               fetchSalaryPayments();
//             }}
//           />
//         </div>
//       </div>
//     </>
//   );
// };

const PayoutSalaryReport = () => {
  const paymentFor = "salary";
  const [api, contextHolder] = notification.useNotification();

  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [modifyPayment, setModifyPayment] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [adminName, setAdminName] = useState("");
  const [filterEmp, setFilterEmp] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");

  const [salaryPayments, setSalaryPayments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reRender, setReRender] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "",
    type: "info",
    noReload: false,
  });


  const fetchAgents = async () => {
    try {
      const response = await API.get("/agent/get-employee");
      setAgents(response.data?.employee || []);
    } catch (error) {
      console.error("Failed to fetch Agents", error);
    }
  };


  const fetchSalaryPayments = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterEmp) params.empId = filterEmp;
      if (filterMonth && filterMonth !== "custom" && !customFromDate && !customToDate)
        params.month = filterMonth;
      if (customFromDate) params.from_date = customFromDate;
      if (customToDate) params.to_date = customToDate;

      const response = await API.get("/salary/get-salary-report", { params });
      const salaryArray = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      const filtered = salaryArray.map((payment, index) => {
        const meta = payment.payout_metadata || {};
        const salaryMonth = meta?.months_included?.[0] || null;
        return {
          id: index + 1,
          _id: payment._id,
          employee_id: payment.employee_id?._id,
          pay_date:
            meta?.date_range?.from?.split("T")[0] ||
            payment.pay_date?.split("T")[0] ||
            "-",
          agent_name:
            payment.employee_id?.name ||
            payment.employee_id?.full_name ||
            "N/A",
          from_date: meta?.date_range?.from?.split("T")[0] || "-",
          to_date: meta?.date_range?.to?.split("T")[0] || "-",
          total_salary: meta?.total_salary || 0,
          total_paid_amount: meta?.total_paid_amount || 0,
          months_included: meta?.months_included?.join(", ") || "-",
          pay_type: meta?.pay_type || "N/A",
          receipt_no: meta?.receipt_no || payment.receipt_no || "-",
          disbursed_by: meta?.disbursed_by || payment.disbursed_by || "Admin",
          salaryMonth,
          note: meta?.note || "-",
        };
      });

      setSalaryPayments(filtered);
    } catch (error) {
      console.error("Failed to fetch salary payments", error);
      setSalaryPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

 
  useEffect(() => {
    const user = localStorage.getItem("user");
    const userObj = user ? JSON.parse(user) : {};
    setAdminId(userObj._id);
    setAdminName(userObj.name || "");
    if (userObj?.admin_access_right_id?.access_permissions?.edit_payment) {
      setModifyPayment(
        userObj.admin_access_right_id.access_permissions.edit_payment === "true"
      );
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchSalaryPayments();
  }, [filterEmp, filterMonth, customFromDate, customToDate, reRender]);

  
  const salaryColumns = [
    { key: "id", header: "SL. NO" },
    { key: "pay_date", header: "Pay Date" },
    { key: "agent_name", header: "Agent" },
    { key: "total_paid_amount", header: "Total Paid Amount (₹)" },
    { key: "total_salary", header: "Total Salary Amount (₹)" },
    { key: "pay_type", header: "Payment Mode" },
    { key: "receipt_no", header: "Receipt No" },
    { key: "from_date", header: "From Date" },
    { key: "to_date", header: "To Date" },
    { key: "salaryMonth", header: "Month" },
    { key: "note", header: "Note" },
    { key: "disbursed_by", header: "Disbursed by" },
  ];

  return (
    <>
      {contextHolder}
      <div className="flex mt-20">
        <div className="flex-grow p-7">
          <h1 className="text-2xl font-semibold mb-4">Payout Salary Report</h1>

          <div className="flex flex-wrap items-end gap-4 mb-6">
          
            <div>
              <label className="block text-sm text-gray-700">Employee</label>
              <Select
                showSearch
                placeholder="Select Employee"
                value={filterEmp || undefined}
                onChange={setFilterEmp}
                className="w-56"
                optionFilterProp="children"
                allowClear
              >
                <Option value="">All Employees</Option>
                {agents.map((emp) => (
                  <Option key={emp._id} value={emp._id}>
                    {emp.name || emp.full_name}
                  </Option>
                ))}
              </Select>
            </div>

       
            <div>
              <label className="block text-sm text-gray-700">Month</label>
              <Select
                showSearch
                placeholder="Select Month"
                value={filterMonth || undefined}
                onChange={(value) => {
                  setFilterMonth(value);
                  if (value !== "custom") {
                    setCustomFromDate("");
                    setCustomToDate("");
                  }
                }}
                className="w-40"
                optionFilterProp="children"
                allowClear
              >
                <Option value="">All Months</Option>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((m) => (
                  <Option key={m} value={m}>
                    {m}
                  </Option>
                ))}
                <Option value="custom">Custom</Option>
              </Select>
            </div>

        
            {filterMonth === "custom" && (
              <>
                <div>
                  <label className="block text-sm text-gray-700">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={customFromDate}
                    onChange={(e) => setCustomFromDate(e.target.value)}
                    className="border rounded px-3 py-2 w-40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">To Date</label>
                  <input
                    type="date"
                    value={customToDate}
                    onChange={(e) => setCustomToDate(e.target.value)}
                    className="border rounded px-3 py-2 w-40"
                  />
                </div>
              </>
            )}

         
            <Button
              onClick={() => {
                setFilterEmp("");
                setFilterMonth("");
                setCustomFromDate("");
                setCustomToDate("");
                fetchSalaryPayments();
              }}
            >
              Clear
            </Button>
          </div>

       
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            {salaryPayments.length > 0 ? (
              <DataTable
                data={salaryPayments}
                columns={salaryColumns}
                exportedPdfName="PayOut Salary"
                exportedFileName="PayOut Salary.csv"
              />
            ) : (
              <div className="mt-10 text-center text-gray-500">
                <CircularLoader
                  isLoading={isLoading}
                  data="Salary Payments"
                  failure={salaryPayments.length === 0}
                />
              </div>
            )}
          </div>

        
          <EditSalaryModal
            isVisible={isEditing}
            onClose={() => {
              setIsEditing(false);
              setEditingSalary(null);
            }}
            salary={editingSalary}
            onEditSuccess={() => {
              setIsEditing(false);
              setEditingSalary(null);
              setReRender((prev) => prev + 1);
              fetchSalaryPayments();
            }}
          />
        </div>
      </div>
    </>
  );
};

export default PayoutSalaryReport;
