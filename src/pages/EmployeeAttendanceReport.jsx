import { useEffect, useState, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import { Button, message } from "antd";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import Sidebar from "../components/layouts/Sidebar";
import { CheckCircle2, XCircle, Calendar, Search, Clock } from "lucide-react";

// const EmployeeAttendanceReport = () => {
//   const [tableAttendanceData, setTableAttendanceData] = useState([]);
//   const [screenLoading, setScreenLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState("");
//   const [searchText, setSearchText] = useState("");
//   const [activeUserData, setActiveUserData] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [selectAll, setSelectAll] = useState(false);
//   //const [reloadTrigger, setReloadTrigger] = useState(0);
//     const [alertConfig, setAlertConfig] = useState({
//       visibility: false,
//       message: "Something went wrong!",
//       type: "info",
//     });

//  const formatDate = (date) => {
//   if (!date) return "-";
//   const d = new Date(date);
//   const day = String(d.getDate()).padStart(2, "0");
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const year = d.getFullYear();
//   return `${day}-${month}-${year}`;
// };

//   const filterOption = (data, searchText) => {
//     if (!searchText) return data;
//     return data.filter((item) =>
//       item.EmployeeName.toLowerCase().includes(searchText.toLowerCase())
//     );
//   };

//   // Fetch attendance
//   useEffect(() => {
//     const fetchAttendanceReport = async () => {
//       setScreenLoading(true);
//       try {

//         const getISODate = (date) => {
//   const d = new Date(date);
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// const currentDate = getISODate(selectedDate || new Date());

//         //const currentDate = new Date(selectedDate).toISOString().split("T")[0]

//         const response = await api.get(
//           `/employee-attendance/employees/date/${currentDate}`
//         );

//         const formattedData =
//           response?.data?.agentAttendanceData?.map((attend, index) => {
//             const details = attend?.attendance_details || {};
//             const isApproved =
//               details?.approval_status?.toLowerCase() === "approved";

//             return {
//               _id: attend?._id,
//               id: index + 1,
//               EmployeeName: attend?.employee_name || "-",
//               Status: details?.status || "Absent",
//               ApprovalStatus: details?.approval_status || "Pending",
//               // Date: details?.date
//               //   ? new Date(details.date).toLocaleDateString("en-GB")
//               //   : "-",
//               Date: details?.date ? formatDate(details.date) : "-",
//               Time: details?.time || "-",
//               attendanceId: details?._id,
//               Approved: isApproved,
//             };
//           }) || [];

//         setTableAttendanceData(formattedData);

//         const activeMap = {};
//         formattedData.forEach((item) => {
//           activeMap[item._id] = { info: { status: item.Approved } };
//         });
//         setActiveUserData(activeMap);
//       } catch (error) {
//         console.error("Failed to load attendance data", error);
//         //  message.error("Failed to load attendance data");
//       } finally {
//         setScreenLoading(false);
//       }
//     };

//     fetchAttendanceReport();
//   }, [selectedDate]);

//   // Toggle employee status
//   const handleStatusToggle = (id) => {
//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         item._id === id
//           ? {
//               ...item,
//               Status: item.Status === "Present" ? "Absent" : "Present",
//             }
//           : item
//       )
//     );
//   };

//   const handleCheckboxChange = (id, checked) => {
//     setActiveUserData((prev) => ({
//       ...prev,
//       [id]: { info: { status: checked } },
//     }));

//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         item._id === id
//           ? {
//               ...item,
//               Approved: checked,
//               ApprovalStatus: checked ? "Approved" : "Pending",
//             }
//           : item
//       )
//     );
//   };

//   const filteredAttendance = useMemo(() => {
//     return filterOption(tableAttendanceData, searchText).map((item, index) => {
//       return {
//         ...item,
//         id: index + 1,
//         ApprovalStatus: (
//           <span
//             className={`px-3 py-1 rounded-full text-sm font-semibold ${
//               item.ApprovalStatus === "Approved"
//                 ? "bg-green-100 text-green-700"
//                 : "bg-red-100 text-red-700"
//             }`}
//           >
//             {item.ApprovalStatus}
//           </span>
//         ),
//         checkBox: (
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => handleStatusToggle(item._id)}
//               className={`px-5 py-2 rounded-lg font-medium text-white text-sm shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl ${
//                 item.Status === "Present"
//                   ? "bg-gradient-to-r from-green-500 to-green-500"
//                   : "bg-gradient-to-r from-red-500 to-red-500"
//               }`}
//             >
//               {item.Status}
//             </button>

//             {/* Approval checkbox */}
//             <input
//               type="checkbox"
//               checked={item.Approved}
//               disabled={item.ApprovalStatus === "Approved"}
//               onChange={(e) => handleCheckboxChange(item._id, e.target.checked)}
//               className={`w-5 h-5 accent-green-600 ${
//                 item.ApprovalStatus === "Approved"
//                   ? "cursor-not-allowed opacity-50"
//                   : "cursor-pointer"
//               }`}
//             />
//           </div>
//         ),
//       };
//     });
//   }, [tableAttendanceData, activeUserData, searchText]);

//   const handleSelectAll = (checked) => {
//     setSelectAll(checked);
//     const updated = {};
//     filteredAttendance.forEach((item) => {
//       updated[item._id] = { info: { status: checked } };
//     });
//     setActiveUserData((prev) => ({ ...prev, ...updated }));

//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         filteredAttendance.find((f) => f._id === item._id)
//           ? {
//               ...item,
//               Approved: checked,
//               ApprovalStatus: checked ? "Approved" : "Pending",
//             }
//           : item
//       )
//     );
//   };

//   // const handleSubmit = async () => {
//   //   setIsSubmitting(true);
//   //   try {
//   //     const currentUser = JSON.parse(localStorage.getItem("user")) || {};
//   //     const approvedBy = currentUser?._id;

//   //     const updatedData = tableAttendanceData.map((row) => ({
//   //       employee_id: row._id,
//   //       attendance_id: row.attendanceId,
//   //       status: row.Status,
//   //       approval_status: row.ApprovalStatus,
//   //       approved_by: row.Approved ? approvedBy : null,
//   //     }));

//   //     const response = await api.put("/employee-attendance/update-approvals", {
//   //       updates: updatedData,
//   //     });

//   //     if (response.status === 200) {
//   //      // message.success(" Attendance updated successfully!");
//   //       // refresh table
//   //       setSelectedDate(selectedDate); // triggers useEffect reload
//   //      // setReloadTrigger((prev) => prev + 1);
//   //     } else {
//   //       console.warning(" Failed to update attendance.");
//   //     }
//   //     setAlertConfig({
//   //         visibility: true,
//   //         message: "Employee Attendance Added Successfully",
//   //         type: "success",
//   //       });
//   //   } catch (error) {
//   //     console.error(" Something went wrong!", error);
//   //    // message.error(" Something went wrong!");
//   //   } finally {
//   //     setIsSubmitting(false);
//   //   }
//   // };

// const handleSubmit = async () => {
//   setIsSubmitting(true);
//   try {
//     const currentUser = JSON.parse(localStorage.getItem("user")) || {};
//     const approvedBy = currentUser?._id;
//     const formattedDate = selectedDate || new Date().toISOString().split("T")[0];

//     // ✅ 1️⃣ Only selected (checked) employees
//     const selectedEmployees = tableAttendanceData.filter((row) => row.Approved === true);

//     if (selectedEmployees.length === 0) {
//       setAlertConfig({
//         visibility: true,
//         message: "Please select at least one employee to approve.",
//         type: "info",
//       });
//       setIsSubmitting(false);
//       return;
//     }

//     // ✅ 2️⃣ Separate new absentees (no attendanceId) and existing records
//     const newAbsentees = selectedEmployees.filter((row) => !row.attendanceId);
//     const existingUpdates = selectedEmployees.filter((row) => row.attendanceId);

//     // ✅ 3️⃣ Save new absent employees only if selected
//     if (newAbsentees.length > 0) {
//       await api.post("/employee-attendance/save-selected-absent", {
//         absentees: newAbsentees.map((row) => ({
//           employee_id: row._id,
//           status: "Absent",
//           approval_status: "Approved",
//           approved_by: approvedBy,
//           date: formattedDate,
//         })),
//       });
//     }

//     // ✅ 4️⃣ Update existing attendance (punched) if selected
//     if (existingUpdates.length > 0) {
//       const updatedData = existingUpdates.map((row) => ({
//         employee_id: row._id,
//         attendance_id: row.attendanceId,
//         status: row.Status,
//         approval_status: "Approved",
//         approved_by: approvedBy,
//       }));

//       await api.put("/employee-attendance/update-approvals", {
//         updates: updatedData,
//       });
//     }

//     // ✅ 5️⃣ Final message
//     setAlertConfig({
//       visibility: true,
//       message: "Selected employees updated successfully.",
//       type: "success",
//     });

//     // Refresh table
//     setSelectedDate(formattedDate);
//   } catch (error) {
//     console.error("Something went wrong while submitting attendance:", error);
//     setAlertConfig({
//       visibility: true,
//       message: "Error updating selected employees!",
//       type: "error",
//     });
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   const AttendanceColumns = [
//     { key: "id", header: "Sl No" },
//     { key: "EmployeeName", header: "Employee Name" },
//     { key: "Status", header: "Status" },
//     { key: "ApprovalStatus", header: "Approval Status" },
//     { key: "Date", header: "Date" },
//     { key: "Time", header: "Time" },
//     { key: "checkBox", header: "Admin Actions" },
//   ];

//   return (
//     <div className="w-screen">
//       <div className="flex mt-30">
//         <Navbar
//           onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
//           visibility={true}
//         />
//         <Sidebar />
//         <CustomAlertDialog
//           type={alertConfig.type}
//           isVisible={alertConfig.visibility}
//           message={alertConfig.message}
//           onClose={() =>
//             setAlertConfig((prev) => ({ ...prev, visibility: false }))
//           }
//         />
//         {screenLoading ? (
//           <div className="w-full flex justify-center items-center h-[70vh]">
//             <CircularLoader color="text-green-600" />
//           </div>
//         ) : (
//           <div className="flex-grow p-7 mt-16">
//             <h1 className="text-2xl font-bold text-center mb-6">
//               Employee Attendance
//             </h1>

//             <div className="flex flex-wrap items-center gap-4 mb-6 border-b border-gray-300 pb-4 justify-between">
//               <div className="flex items-center gap-4">
//                 {/* <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Date Filter
//                   </label>
//                   <input
//                     type="date"
//                     value={
//                       selectedDate || new Date().toISOString().split("T")[0]
//                     }
//                     max={new Date().toISOString().split("T")[0]}
//                     onChange={(e) => setSelectedDate(e.target.value)}
//                     className="border rounded px-4 py-2"
//                   />
//                 </div> */}
//                 <div className="flex items-center gap-2">
//   <input
//     type="date"
//     value={selectedDate || new Date().toISOString().split("T")[0]}
//     max={new Date().toISOString().split("T")[0]}
//     onChange={(e) => setSelectedDate(e.target.value)}
//     className="border rounded px-4 py-2"
//   />
//   <span className="text-gray-600 text-sm">
//     (
//     {selectedDate
//       ? `${selectedDate.split("-")[2]}-${selectedDate.split("-")[1]}-${selectedDate.split("-")[0]}`
//       : (() => {
//           const d = new Date();
//           const dd = String(d.getDate()).padStart(2, "0");
//           const mm = String(d.getMonth() + 1).padStart(2, "0");
//           const yyyy = d.getFullYear();
//           return `${dd}-${mm}-${yyyy}`;
//         })()}
//     )
//   </span>
// </div>

//                 <div className="flex items-center mt-6">
//                   <input
//                     type="checkbox"
//                     checked={selectAll}
//                     onChange={(e) => handleSelectAll(e.target.checked)}
//                     className="mr-2"
//                   />
//                   <label className="text-sm font-medium text-gray-700">
//                     Select All
//                   </label>
//                 </div>
//               </div>

//               <div className="flex items-center mt-6">
//                 <Button
//                   type="primary"
//                   loading={isSubmitting}
//                   onClick={handleSubmit}
//                   className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 rounded-lg"
//                 >
//                   Submit Updates
//                 </Button>
//               </div>
//             </div>

//             <DataTable columns={AttendanceColumns} data={filteredAttendance} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

//working
// const EmployeeAttendanceReport = () => {
//   const [tableAttendanceData, setTableAttendanceData] = useState([]);
//   const [screenLoading, setScreenLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState("");
//   const [searchText, setSearchText] = useState("");
//   const [activeUserData, setActiveUserData] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [selectAll, setSelectAll] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     visibility: false,
//     message: "Something went wrong!",
//     type: "info",
//   });

//   // Format date for user display (dd-mm-yyyy)
//   const formatDateForDisplay = (date) => {
//     if (!date) return "-";

//     let d;
//     if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
//       const [year, month, day] = date.split('-');
//       d = new Date(year, month - 1, day);
//     } else if (typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
//       return date;
//     } else {
//       d = new Date(date);
//     }

//     if (isNaN(d.getTime())) {
//       return "-";
//     }

//     const day = String(d.getDate()).padStart(2, "0");
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const year = d.getFullYear();
//     return `${day}-${month}-${year}`;
//   };

//   // Format date for backend (yyyy-mm-dd)
//   const formatDateForBackend = (date) => {
//     if (!date) {
//       const today = new Date();
//       return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
//     }

//     let d;
//     if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
//       return date;
//     } else if (typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
//       const [day, month, year] = date.split('-');
//       return `${year}-${month}-${day}`;
//     } else {
//       d = new Date(date);
//       if (isNaN(d.getTime())) return null;
//     }

//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const day = String(d.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const filterOption = (data, searchText) => {
//     if (!searchText) return data;
//     return data.filter((item) =>
//       item.EmployeeName.toLowerCase().includes(searchText.toLowerCase())
//     );
//   };

//   // Fetch attendance
//   useEffect(() => {
//     const fetchAttendanceReport = async () => {
//       setScreenLoading(true);
//       try {
//         const currentDate = formatDateForBackend(selectedDate || new Date());

//         const response = await api.get(
//           `/employee-attendance/employees/date/${currentDate}`
//         );

//         const formattedData =
//           response?.data?.agentAttendanceData?.map((attend, index) => {
//             const details = attend?.attendance_details || {};
//             const isApproved =
//               details?.approval_status?.toLowerCase() === "approved";

//             return {
//               _id: attend?._id,
//               id: index + 1,
//               EmployeeName: attend?.employee_name || "-",
//               Status: details?.status || "Absent",
//               ApprovalStatus: details?.approval_status || "Pending",
//               Date: details?.date ? formatDateForDisplay(details.date) : "-",
//               Time: details?.time || "-",
//               attendanceId: details?._id,
//               Approved: isApproved,
//             };
//           }) || [];

//         setTableAttendanceData(formattedData);

//         const activeMap = {};
//         formattedData.forEach((item) => {
//           activeMap[item._id] = { info: { status: item.Approved } };
//         });
//         setActiveUserData(activeMap);
//       } catch (error) {
//         console.error("Failed to load attendance data", error);
//       } finally {
//         setScreenLoading(false);
//       }
//     };

//     fetchAttendanceReport();
//   }, [selectedDate]);

//   // Toggle employee status
//   const handleStatusToggle = (id) => {
//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         item._id === id
//           ? {
//               ...item,
//               Status: item.Status === "Present" ? "Absent" : "Present",
//             }
//           : item
//       )
//     );
//   };

//   const handleCheckboxChange = (id, checked) => {
//     setActiveUserData((prev) => ({
//       ...prev,
//       [id]: { info: { status: checked } },
//     }));

//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         item._id === id
//           ? {
//               ...item,
//               Approved: checked,
//               // Set ApprovalStatus locally based on checkbox state
//               ApprovalStatus: checked ? "Approved" : "Pending",
//             }
//           : item
//       )
//     );
//   };

//   const filteredAttendance = useMemo(() => {
//     return filterOption(tableAttendanceData, searchText).map((item, index) => {
//       return {
//         ...item,
//         id: index + 1,
//         ApprovalStatus: (
//           <div className="flex justify-center">
//             {item.ApprovalStatus === "Approved" ? (
//               <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
//                 <CheckCircle2 size={14} />
//                 Approved
//               </span>
//             ) : (
//               <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
//                 <Clock size={14} />
//                 Pending
//               </span>
//             )}
//           </div>
//         ),
//         checkBox: (
//           <div className="flex items-center justify-center gap-3">
//             <button
//               onClick={() => handleStatusToggle(item._id)}
//               className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
//                 item.Status === "Present"
//                   ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
//                   : "bg-red-100 text-red-700 hover:bg-red-200"
//               }`}
//             >
//               {item.Status === "Present" ? (
//                 <CheckCircle2 size={16} />
//               ) : (
//                 <XCircle size={16} />
//               )}
//               {item.Status}
//             </button>

//             {/* Checkbox: Remove 'disabled' so approval status can be toggled (Approved/Pending) */}
//             <input
//               type="checkbox"
//               checked={item.Approved}
//               // Removed: disabled={item.ApprovalStatus === "Approved"}
//               onChange={(e) => handleCheckboxChange(item._id, e.target.checked)}
//               className={`w-5 h-5 rounded accent-emerald-600 transition-all cursor-pointer hover:accent-emerald-700`}
//             />
//           </div>
//         ),
//       };
//     });
//   }, [tableAttendanceData, activeUserData, searchText]);

//   const handleSelectAll = (checked) => {
//     setSelectAll(checked);
//     const updated = {};
//     filteredAttendance.forEach((item) => {
//       updated[item._id] = { info: { status: checked } };
//     });
//     setActiveUserData((prev) => ({ ...prev, ...updated }));

//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         filteredAttendance.find((f) => f._id === item._id)
//           ? {
//               ...item,
//               Approved: checked,
//               ApprovalStatus: checked ? "Approved" : "Pending",
//             }
//           : item
//       )
//     );
//   };

//   const handleSubmit = async () => {
//     setIsSubmitting(true);
//     try {
//       const currentUser = JSON.parse(localStorage.getItem("user")) || {};
//       const approvedBy = currentUser?._id;
//       const formattedDate = formatDateForBackend(selectedDate || new Date());

//       // 1️⃣ Updates for existing records (attendanceId exists)
//       const existingUpdates = tableAttendanceData.filter((row) => row.attendanceId);

//       if (existingUpdates.length > 0) {
//         const updatedData = existingUpdates.map((row) => ({
//           employee_id: row._id,
//           attendance_id: row.attendanceId,
//           status: row.Status,
//           // Crucial Logic Change: Determine approval_status based on the current 'Approved' state in the row
//           approval_status: row.Approved ? "Approved" : "Pending",
//           // Set approved_by only if it's being approved, otherwise set to null
//           approved_by: row.Approved ? approvedBy : null,
//         }));

//         await api.put("/employee-attendance/update-approvals", {
//           updates: updatedData,
//         });
//       }

//       // 2️⃣ New records for absentees (attendanceId does not exist)
//       // Only include if they are marked 'Approved' AND are 'Absent' AND have no existing record.
//       const newAbsentees = tableAttendanceData.filter((row) => !row.attendanceId && row.Approved);

//       if (newAbsentees.length > 0) {
//         // NOTE: New records can only be saved as 'Approved' (checked) absentees in the current backend logic
//         // If the admin unchecks a non-existent record, we don't send anything for it.
//         await api.post("/employee-attendance/save-selected-absent", {
//           absentees: newAbsentees.map((row) => ({
//             employee_id: row._id,
//             status: row.Status || "Absent", // Should be 'Absent' if new record is needed
//             approval_status: "Approved",
//             approved_by: approvedBy,
//             date: formattedDate,
//           })),
//         });
//       }

//       // 3️⃣ Final message
//       setAlertConfig({
//         visibility: true,
//         message: "Employee Attendance Updated Successfully",
//         type: "success",
//       });

//       // Refresh table by re-fetching data
//       setSelectedDate(selectedDate);
//     } catch (error) {
//       console.error("Something went wrong while submitting attendance:", error);
//       setAlertConfig({
//         visibility: true,
//         message: "Error updating selected employees!",
//         type: "error",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const AttendanceColumns = [
//     { key: "id", header: "Sl No" },
//     { key: "EmployeeName", header: "Employee Name" },
//     { key: "Status", header: "Status" },
//     { key: "ApprovalStatus", header: "Approval Status" },
//     { key: "Date", header: "Date" },
//     { key: "Time", header: "Time" },
//     { key: "checkBox", header: "Actions" },
//   ];

//   return (
//     <div className="w-screen bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
//       <div className="flex">
//         <Navbar
//           onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
//           visibility={true}
//         />
//         <Sidebar />
//         <CustomAlertDialog
//           type={alertConfig.type}
//           isVisible={alertConfig.visibility}
//           message={alertConfig.message}
//           onClose={() =>
//             setAlertConfig((prev) => ({ ...prev, visibility: false }))
//           }
//         />
//         {screenLoading ? (
//           <div className="w-full flex justify-center items-center h-screen">
//             <CircularLoader color="text-emerald-600" />
//           </div>
//         ) : (
//           <div className="flex-grow p-8 mt-20">
//             {/* Header Section */}
//             <div className="mb-8">
//               <h1 className="text-4xl font-bold text-slate-900 mb-2">
//                 Employee Attendance
//               </h1>
//               <p className="text-slate-500">Manage and approve employee attendance records</p>
//             </div>

//             {/* Controls Section */}
//             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
//               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//                 {/* Left Controls */}
//                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
//                   {/* Date Picker */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-semibold text-slate-700">
//                       Select Date
//                     </label>
//                     <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
//                       <Calendar size={18} className="text-slate-400" />
//                       <input
//                         type="date"
//                         value={selectedDate || new Date().toISOString().split("T")[0]}
//                         max={new Date().toISOString().split("T")[0]}
//                         onChange={(e) => setSelectedDate(e.target.value)}
//                         className="bg-transparent border-none outline-none text-slate-700 font-medium"
//                       />
//                     </div>

//                   </div>

//                   {/* Select All */}
//                   <div className="flex items-center gap-3 pt-2 sm:pt-6">
//                     <input
//                       type="checkbox"
//                       id="selectAll"
//                       checked={selectAll}
//                       onChange={(e) => handleSelectAll(e.target.checked)}
//                       className="w-5 h-5 rounded accent-emerald-600 cursor-pointer"
//                     />
//                     <label
//                       htmlFor="selectAll"
//                       className="text-sm font-medium text-slate-700 cursor-pointer"
//                     >
//                       Select All
//                     </label>
//                   </div>
//                 </div>

//                 {/* Right Controls */}
//                 <Button
//                   type="primary"
//                   loading={isSubmitting}
//                   onClick={handleSubmit}
//                   className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold px-8 py-6 rounded-lg border-0 shadow-md hover:shadow-lg transition-all"
//                 >
//                   {isSubmitting ? "Updating..." : "Submit Attendance"}
//                 </Button>
//               </div>
//             </div>

//             {/* Table Section */}
//             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-4">
//               <DataTable columns={AttendanceColumns} data={filteredAttendance} />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const EmployeeAttendanceReport = () => {
//   const [tableAttendanceData, setTableAttendanceData] = useState([]);
//   const [screenLoading, setScreenLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState("");
//   const [searchText, setSearchText] = useState("");
//   const [activeUserData, setActiveUserData] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [selectAll, setSelectAll] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     visibility: false,
//     message: "Something went wrong!",
//     type: "info",
//   });

//   // Format date for user display (dd-mm-yyyy)
//   const formatDateForDisplay = (date) => {
//     if (!date) return "-";

//     let d;
//     if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
//       const [year, month, day] = date.split('-');
//       d = new Date(year, month - 1, day);
//     } else if (typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
//       return date;
//     } else {
//       d = new Date(date);
//     }

//     if (isNaN(d.getTime())) {
//       return "-";
//     }

//     const day = String(d.getDate()).padStart(2, "0");
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const year = d.getFullYear();
//     return `${day}-${month}-${year}`;
//   };

//   // Format date for backend (yyyy-mm-dd)
//   const formatDateForBackend = (date) => {
//     if (!date) {
//       const today = new Date();
//       return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
//     }

//     let d;
//     if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
//       return date;
//     } else if (typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
//       const [day, month, year] = date.split('-');
//       return `${year}-${month}-${day}`;
//     } else {
//       d = new Date(date);
//       if (isNaN(d.getTime())) return null;
//     }

//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const day = String(d.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const filterOption = (data, searchText) => {
//     if (!searchText) return data;
//     return data.filter((item) =>
//       item.EmployeeName.toLowerCase().includes(searchText.toLowerCase())
//     );
//   };

//   // Fetch attendance
//   useEffect(() => {
//     const fetchAttendanceReport = async () => {
//       setScreenLoading(true);
//       try {
//         const currentDate = formatDateForBackend(selectedDate || new Date());

//         const response = await api.get(
//           `/employee-attendance/employees/date/${currentDate}`
//         );

//         const formattedData =
//           response?.data?.agentAttendanceData?.map((attend, index) => {
//             const details = attend?.attendance_details || {};
//             const isApproved =
//               details?.approval_status?.toLowerCase() === "approved";

//             return {
//               _id: attend?._id,
//               id: index + 1,
//               EmployeeName: attend?.employee_name || "-",
//               EmployeeId : attend?.employeeCode || "-",
//               Status: details?.status || "Absent",
//               ApprovalStatus: details?.approval_status || "Pending",
//               Date: details?.date ? formatDateForDisplay(details.date) : "-",
//               Time: details?.time || "-",
//               attendanceId: details?._id,
//               Approved: isApproved, // This is the mutable state
//               InitialApproved: isApproved, // This is the state from the backend (used for disabling)
//             };
//           }) || [];

//         setTableAttendanceData(formattedData);

//         const activeMap = {};
//         formattedData.forEach((item) => {
//           activeMap[item._id] = { info: { status: item.Approved } };
//         });
//         setActiveUserData(activeMap);
//       } catch (error) {
//         console.error("Failed to load attendance data", error);
//       } finally {
//         setScreenLoading(false);
//       }
//     };

//     fetchAttendanceReport();
//   }, [selectedDate]);

//   // Toggle employee status
//   const handleStatusToggle = (id) => {
//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         item._id === id
//           ? {
//               ...item,
//               Status: item.Status === "Present" ? "Absent" : "Present",
//             }
//           : item
//       )
//     );
//   };

//   const handleCheckboxChange = (id, checked) => {
//     // Only allow changes if the record was not previously approved from the backend
//     const record = tableAttendanceData.find(item => item._id === id);
//     if (record && record.InitialApproved) {
//         // Prevent local state change if it was already approved in the database
//         setAlertConfig({
//             visibility: true,
//             message: "Cannot unapprove a previously approved record.",
//             type: "info",
//         });
//         return;
//     }

//     setActiveUserData((prev) => ({
//       ...prev,
//       [id]: { info: { status: checked } },
//     }));

//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         item._id === id
//           ? {
//               ...item,
//               Approved: checked,
//               ApprovalStatus: checked ? "Approved" : "Pending",
//             }
//           : item
//       )
//     );
//   };

//   const filteredAttendance = useMemo(() => {
//     return filterOption(tableAttendanceData, searchText).map((item, index) => {
//       // Determine if the checkbox should be disabled
//       const isPermanentlyApproved = item.InitialApproved === true;

//       return {
//         ...item,
//         id: index + 1,
//         ApprovalStatus: (
//           <div className="flex justify-center">
//             {item.ApprovalStatus === "Approved" ? (
//               <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
//                 <CheckCircle2 size={14} />
//                 Approved
//               </span>
//             ) : (
//               <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
//                 <Clock size={14} />
//                 Pending
//               </span>
//             )}
//           </div>
//         ),
//         checkBox: (
//           <div className="flex items-center justify-center gap-3">
//             <button
//               onClick={() => handleStatusToggle(item._id)}
//               className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
//                 item.Status === "Present"
//                   ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
//                   : "bg-red-100 text-red-700 hover:bg-red-200"
//               }`}
//             >
//               {item.Status === "Present" ? (
//                 <CheckCircle2 size={16} />
//               ) : (
//                 <XCircle size={16} />
//               )}
//               {item.Status}
//             </button>

//             {/* Checkbox: Disabled if InitialApproved (from database) is true */}
//             <input
//               type="checkbox"
//               checked={item.Approved}
//               disabled={isPermanentlyApproved}
//               onChange={(e) => handleCheckboxChange(item._id, e.target.checked)}
//               className={`w-5 h-5 rounded accent-emerald-600 transition-all ${
//                 isPermanentlyApproved
//                 ? "cursor-not-allowed opacity-40"
//                 : "cursor-pointer hover:accent-emerald-700"
//               }`}
//             />
//           </div>
//         ),
//       };
//     });
//   }, [tableAttendanceData, activeUserData, searchText]);

//   const handleSelectAll = (checked) => {
//     setSelectAll(checked);
//     const updated = {};

//     // Only update items that are NOT permanently approved
//     filteredAttendance.forEach((item) => {
//       if (!item.InitialApproved) {
//         updated[item._id] = { info: { status: checked } };
//       }
//     });

//     setActiveUserData((prev) => ({ ...prev, ...updated }));

//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         filteredAttendance.find((f) => f._id === item._id) && !item.InitialApproved // Check existence in filter and if not approved
//           ? {
//               ...item,
//               Approved: checked,
//               ApprovalStatus: checked ? "Approved" : "Pending",
//             }
//           : item
//       )
//     );
//   };

//   const handleSubmit = async () => {
//     setIsSubmitting(true);
//     try {
//       const currentUser = JSON.parse(localStorage.getItem("user")) || {};
//       const approvedBy = currentUser?._id;
//       const formattedDate = formatDateForBackend(selectedDate || new Date());

//       // 1️⃣ Filter records that are being newly approved OR modified
//       const recordsToUpdate = tableAttendanceData.filter((row) =>
//           row.Approved !== row.InitialApproved || // State changed (Pending -> Approved)
//           (row.Approved && row.Status !== row.InitialStatus) // Approved but status was toggled
//       );

//       // Separate into existing records (update) and new absentees (create)
//       const existingUpdates = recordsToUpdate.filter((row) => row.attendanceId && row.Approved);
//       const newAbsentees = recordsToUpdate.filter((row) => !row.attendanceId && row.Approved);

//       // The requirement is that once approved, it cannot be changed back to Pending.
//       // Therefore, we only submit Approved status. Un-approved records are ignored by this submit.

//       // 2️⃣ Update existing attendance records
//       if (existingUpdates.length > 0) {
//         const updatedData = existingUpdates.map((row) => ({
//           employee_id: row._id,
//           attendance_id: row.attendanceId,
//           status: row.Status,
//           approval_status: "Approved", // Only submit as Approved
//           approved_by: approvedBy,
//         }));

//         await api.put("/employee-attendance/update-approvals", {
//           updates: updatedData,
//         });
//       }

//       // 3️⃣ Save new absent employees (must be Approved to be saved)
//       if (newAbsentees.length > 0) {
//         await api.post("/employee-attendance/save-selected-absent", {
//           absentees: newAbsentees.map((row) => ({
//             employee_id: row._id,
//             status: row.Status || "Absent",
//             approval_status: "Approved",
//             approved_by: approvedBy,
//             date: formattedDate,
//           })),
//         });
//       }

//       // 4️⃣ Final message and Refresh
//       setAlertConfig({
//         visibility: true,
//         message: "Attendance updates submitted successfully.",
//         type: "success",
//       });

//       // Refresh table by re-fetching data to apply the new 'InitialApproved' lock status
//       setSelectedDate(selectedDate);
//     } catch (error) {
//       console.error("Something went wrong while submitting attendance:", error);
//       setAlertConfig({
//         visibility: true,
//         message: "Error updating selected employees!",
//         type: "error",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const AttendanceColumns = [
//     { key: "id", header: "Sl No" },
//     {key: "EmployeeId", header: "Employee Id"},
//     { key: "EmployeeName", header: "Employee Name" },
//     { key: "Status", header: "Status" },
//     { key: "ApprovalStatus", header: "Approval Status" },
//     { key: "Date", header: "Date" },
//     { key: "Time", header: "Time" },
//     { key: "checkBox", header: "Actions" },
//   ];

//   return (
//     <div className="w-screen bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
//       <div className="flex">
//         <Navbar
//           onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
//           visibility={true}
//         />
//         <Sidebar />
//         <CustomAlertDialog
//           type={alertConfig.type}
//           isVisible={alertConfig.visibility}
//           message={alertConfig.message}
//           onClose={() =>
//             setAlertConfig((prev) => ({ ...prev, visibility: false }))
//           }
//         />
//         {screenLoading ? (
//           <div className="w-full flex justify-center items-center h-screen">
//             <CircularLoader color="text-emerald-600" />
//           </div>
//         ) : (
//           <div className="flex-grow p-8 mt-20">
//             {/* Header Section */}
//             <div className="mb-8">
//               <h1 className="text-4xl font-bold text-slate-900 mb-2">
//                 Employee Attendance
//               </h1>
//               <p className="text-slate-500">Manage and approve employee attendance records</p>
//             </div>

//             {/* Controls Section */}
//             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
//               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//                 {/* Left Controls */}
//                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
//                   {/* Date Picker */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-semibold text-slate-700">
//                       Select Date
//                     </label>
//                     <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
//                       <Calendar size={18} className="text-slate-400" />
//                       <input
//                         type="date"
//                         value={selectedDate || new Date().toISOString().split("T")[0]}
//                         max={new Date().toISOString().split("T")[0]}
//                         onChange={(e) => setSelectedDate(e.target.value)}
//                         className="bg-transparent border-none outline-none text-slate-700 font-medium"
//                       />
//                     </div>
//                     {/* <span className="text-xs text-slate-500 mt-1">
//                       {selectedDate
//                         ? formatDateForDisplay(selectedDate)
//                         : formatDateForDisplay(new Date())}
//                     </span> */}
//                   </div>

//                   {/* Select All */}
//                   <div className="flex items-center gap-3 pt-2 sm:pt-6">
//                     <input
//                       type="checkbox"
//                       id="selectAll"
//                       checked={selectAll}
//                       onChange={(e) => handleSelectAll(e.target.checked)}
//                       className="w-5 h-5 rounded accent-emerald-600 cursor-pointer"
//                     />
//                     <label
//                       htmlFor="selectAll"
//                       className="text-sm font-medium text-slate-700 cursor-pointer"
//                     >
//                       Select All
//                     </label>
//                   </div>
//                 </div>

//                 {/* Right Controls */}
//                 <Button
//                   type="primary"
//                   loading={isSubmitting}
//                   onClick={handleSubmit}
//                   className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold px-8 py-6 rounded-lg border-0 shadow-md hover:shadow-lg transition-all"
//                 >
//                   {isSubmitting ? "Updating..." : "Submit Attendance"}
//                 </Button>
//               </div>
//             </div>

//             {/* Table Section */}
//             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-4">
//               <DataTable columns={AttendanceColumns} data={filteredAttendance}
//                exportedPdfName="Employee Attendence"
//                 exportedFileName={`EmployeeAttendence.csv`}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const EmployeeAttendanceReport = () => {
//   const [tableAttendanceData, setTableAttendanceData] = useState([]);
//   const [screenLoading, setScreenLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState("");
//   const [searchText, setSearchText] = useState("");
//   const [activeUserData, setActiveUserData] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [selectAll, setSelectAll] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     visibility: false,
//     message: "Something went wrong!",
//     type: "info",
//   });

//   // Format date for user display (dd-mm-yyyy)
//   const formatDateForDisplay = (date) => {
//     if (!date) return "-";

//     let d;
//     if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
//       const [year, month, day] = date.split("-");
//       d = new Date(year, month - 1, day);
//     } else if (typeof date === "string" && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
//       return date;
//     } else {
//       d = new Date(date);
//     }

//     if (isNaN(d.getTime())) {
//       return "-";
//     }

//     const day = String(d.getDate()).padStart(2, "0");
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const year = d.getFullYear();
//     return `${day}-${month}-${year}`;
//   };

//   // Format date for backend (yyyy-mm-dd)
//   const formatDateForBackend = (date) => {
//     if (!date) {
//       const today = new Date();
//       return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
//         2,
//         "0"
//       )}-${String(today.getDate()).padStart(2, "0")}`;
//     }

//     let d;
//     if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
//       return date;
//     } else if (typeof date === "string" && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
//       const [day, month, year] = date.split("-");
//       return `${year}-${month}-${day}`;
//     } else {
//       d = new Date(date);
//       if (isNaN(d.getTime())) return null;
//     }

//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const day = String(d.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const filterOption = (data, searchText) => {
//     if (!searchText) return data;
//     return data.filter((item) =>
//       item.EmployeeName.toLowerCase().includes(searchText.toLowerCase())
//     );
//   };

//   // Fetch attendance
//   // useEffect(() => {
//   //   const fetchAttendanceReport = async () => {
//   //     setScreenLoading(true);
//   //     try {
//   //       const currentDate = formatDateForBackend(selectedDate || new Date());

//   //       const response = await api.get(
//   //         `/employee-attendance/employees/date/${currentDate}`
//   //       );

//   //       const formattedData =
//   //         response?.data?.agentAttendanceData?.map((attend, index) => {
//   //           const details = attend?.attendance_details || {};
//   //           const isApproved =
//   //             details?.approval_status?.toLowerCase() === "approved";

//   //           return {
//   //             _id: attend?._id,
//   //             id: index + 1,
//   //             EmployeeName: attend?.employee_name || "-",
//   //             EmployeeId: attend?.employeeCode || "-",
//   //             Status: details?.status || "Absent",
//   //             ApprovalStatus: details?.approval_status || "Pending",
//   //             Date: details?.date ? formatDateForDisplay(details.date) : "-",
//   //             Time: details?.time || "-",
//   //             attendanceId: details?._id,
//   //             Approved: isApproved, // This is the mutable state
//   //             InitialApproved: isApproved, // This is the state from the backend (used for disabling)
//   //           };
//   //         }) || [];

//   //       setTableAttendanceData(formattedData);

//   //       const activeMap = {};
//   //       formattedData.forEach((item) => {
//   //         activeMap[item._id] = { info: { status: item.Approved } };
//   //       });
//   //       setActiveUserData(activeMap);
//   //     } catch (error) {
//   //       console.error("Failed to load attendance data", error);
//   //     } finally {
//   //       setScreenLoading(false);
//   //     }
//   //   };

//   //   fetchAttendanceReport();
//   // }, [selectedDate]);

//   const fetchAttendanceReport = async (date) => {
//   setScreenLoading(true);
//   try {
//     const currentDate = formatDateForBackend(date || new Date());
//     const response = await api.get(
//       `/employee-attendance/employees/date/${currentDate}`
//     );

//     const formattedData =
//       response?.data?.agentAttendanceData?.map((attend, index) => {
//         const details = attend?.attendance_details || {};
//         const isApproved =
//           details?.approval_status?.toLowerCase() === "approved";

//         return {
//           _id: attend?._id,
//           id: index + 1,
//           EmployeeName: attend?.employee_name || "-",
//           EmployeeId: attend?.employeeCode || "-",
//           Status: details?.status || "Absent",
//           ApprovalStatus: details?.approval_status || "Pending",
//           Date: details?.date ? formatDateForDisplay(details.date) : "-",
//           Time: details?.time || "-",
//           attendanceId: details?._id,
//           Approved: isApproved,
//           InitialApproved: isApproved,
//         };
//       }) || [];

//     setTableAttendanceData(formattedData);

//     const activeMap = {};
//     formattedData.forEach((item) => {
//       activeMap[item._id] = { info: { status: item.Approved } };
//     });
//     setActiveUserData(activeMap);
//   } catch (error) {
//     console.error("Failed to load attendance data", error);
//   } finally {
//     setScreenLoading(false);
//   }
// };


// useEffect(() => {
//   fetchAttendanceReport(selectedDate);
// }, [selectedDate]);

//   // Toggle employee status
//   const handleStatusToggle = (id) => {
//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         item._id === id
//           ? {
//               ...item,
//               Status: item.Status === "Present" ? "Absent" : "Present",
//             }
//           : item
//       )
//     );
//   };

//   const handleCheckboxChange = (id, checked) => {
//     // Only allow changes if the record was not previously approved from the backend
//     const record = tableAttendanceData.find((item) => item._id === id);
//     if (record && record.InitialApproved) {
//       // Prevent local state change if it was already approved in the database
//       setAlertConfig({
//         visibility: true,
//         message: "Cannot unapprove a previously approved record.",
//         type: "info",
//       });
//       return;
//     }

//     setActiveUserData((prev) => ({
//       ...prev,
//       [id]: { info: { status: checked } },
//     }));

//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         item._id === id
//           ? {
//               ...item,
//               Approved: checked,
//               ApprovalStatus: checked ? "Approved" : "Pending",
//             }
//           : item
//       )
//     );
//   };

//   const filteredAttendance = useMemo(() => {
//     return filterOption(tableAttendanceData, searchText).map((item, index) => {
//       // Determine if the checkbox should be disabled
//       const isPermanentlyApproved = item.InitialApproved === true;

//       return {
//         ...item,
//         id: index + 1,
//         ApprovalStatus: (
//           <div className="flex justify-center">
//             {item.ApprovalStatus === "Approved" ? (
//               <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
//                 <CheckCircle2 size={14} />
//                 Approved
//               </span>
//             ) : (
//               <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
//                 <Clock size={14} />
//                 Pending
//               </span>
//             )}
//           </div>
//         ),
//         checkBox: (
//           <div className="flex items-center justify-center gap-3">
//             <button
//               onClick={() => handleStatusToggle(item._id)}
//               className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
//                 item.Status === "Present"
//                   ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
//                   : "bg-red-100 text-red-700 hover:bg-red-200"
//               }`}
//             >
//               {item.Status === "Present" ? (
//                 <CheckCircle2 size={16} />
//               ) : (
//                 <XCircle size={16} />
//               )}
//               {item.Status}
//             </button>

//             {/* Checkbox: Disabled if InitialApproved (from database) is true */}
//             <input
//               type="checkbox"
//               checked={item.Approved}
//               disabled={isPermanentlyApproved}
//               onChange={(e) => handleCheckboxChange(item._id, e.target.checked)}
//               className={`w-5 h-5 rounded accent-emerald-600 transition-all ${
//                 isPermanentlyApproved
//                   ? "cursor-not-allowed opacity-40"
//                   : "cursor-pointer hover:accent-emerald-700"
//               }`}
//             />
//           </div>
//         ),
//       };
//     });
//   }, [tableAttendanceData, activeUserData, searchText]);

//   const handleSelectAll = (checked) => {
//     setSelectAll(checked);
//     const updated = {};

//     // Only update items that are NOT permanently approved
//     filteredAttendance.forEach((item) => {
//       if (!item.InitialApproved) {
//         updated[item._id] = { info: { status: checked } };
//       }
//     });

//     setActiveUserData((prev) => ({ ...prev, ...updated }));

//     setTableAttendanceData((prevData) =>
//       prevData.map((item) =>
//         filteredAttendance.find((f) => f._id === item._id) &&
//         !item.InitialApproved // Check existence in filter and if not approved
//           ? {
//               ...item,
//               Approved: checked,
//               ApprovalStatus: checked ? "Approved" : "Pending",
//             }
//           : item
//       )
//     );
//   };

//   const handleSubmit = async () => {
//     setIsSubmitting(true);
//     try {
//       const currentUser = JSON.parse(localStorage.getItem("user")) || {};
//       const approvedBy = currentUser?._id;
//       const formattedDate = formatDateForBackend(selectedDate || new Date());

//       // 1️⃣ Filter records that are being newly approved OR modified
//       const recordsToUpdate = tableAttendanceData.filter(
//         (row) =>
//           row.Approved !== row.InitialApproved || // State changed (Pending -> Approved)
//           (row.Approved && row.Status !== row.InitialStatus) // Approved but status was toggled
//       );

//       // Separate into existing records (update) and new absentees (create)
//       const existingUpdates = recordsToUpdate.filter(
//         (row) => row.attendanceId && row.Approved
//       );
//       const newAbsentees = recordsToUpdate.filter(
//         (row) => !row.attendanceId && row.Approved
//       );

//       // The requirement is that once approved, it cannot be changed back to Pending.
//       // Therefore, we only submit Approved status. Un-approved records are ignored by this submit.

//       // 2️⃣ Update existing attendance records
//       if (existingUpdates.length > 0) {
//         const updatedData = existingUpdates.map((row) => ({
//           employee_id: row._id,
//           attendance_id: row.attendanceId,
//           status: row.Status,
//           approval_status: "Approved", // Only submit as Approved
//           approved_by: approvedBy,
//         }));

//         await api.put("/employee-attendance/update-approvals", {
//           updates: updatedData,
//         });
//       }

//       // 3️⃣ Save new absent employees (must be Approved to be saved)
//       if (newAbsentees.length > 0) {
//         await api.post("/employee-attendance/save-selected-absent", {
//           absentees: newAbsentees.map((row) => ({
//             employee_id: row._id,
//             status: row.Status || "Absent",
//             approval_status: "Approved",
//             approved_by: approvedBy,
//             date: formattedDate,
//           })),
//         });
//       }

//       // 4️⃣ Final message and Refresh
//       await fetchAttendanceReport(selectedDate);
//       setAlertConfig({
//         visibility: true,
//         message: "Attendance updates submitted successfully.",
//         type: "success",
//       });

//       // Refresh table by re-fetching data to apply the new 'InitialApproved' lock status
//       setSelectedDate(selectedDate);
//     } catch (error) {
//       console.error("Something went wrong while submitting attendance:", error);
//       setAlertConfig({
//         visibility: true,
//         message: "Error updating selected employees!",
//         type: "error",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const AttendanceColumns = [
//     { key: "id", header: "Sl No" },
//     { key: "EmployeeId", header: "Employee Id" },
//     { key: "EmployeeName", header: "Employee Name" },
//     { key: "Status", header: "Status" },
//     { key: "ApprovalStatus", header: "Approval Status" },
//     { key: "Date", header: "Date" },
//     { key: "Time", header: "Time" },
//     { key: "checkBox", header: "Actions" },
//   ];

//   return (
//     <div className="w-screen bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
//       <div className="flex">
//         <Navbar
//           onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
//           visibility={true}
//         />
//         <Sidebar />
//         <CustomAlertDialog
//           type={alertConfig.type}
//           isVisible={alertConfig.visibility}
//           message={alertConfig.message}
//           onClose={() =>
//             setAlertConfig((prev) => ({ ...prev, visibility: false }))
//           }
//         />
//           <div className="flex-grow p-8 mt-20">
//             {/* Header Section */}
//             <div className="mb-8">
//               <h1 className="text-4xl font-bold text-slate-900 mb-2">
//                 Employee Attendance
//               </h1>
//               <p className="text-slate-500">
//                 Manage and approve employee attendance records
//               </p>
//             </div>

//             {/* Controls Section */}
//             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
//               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//                 {/* Left Controls */}
//                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
//                   {/* Date Picker */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-semibold text-slate-700">
//                       Select Date
//                     </label>
//                     <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
//                       <Calendar size={18} className="text-slate-400" />
//                       <input
//                         type="date"
//                         value={
//                           selectedDate || new Date().toISOString().split("T")[0]
//                         }
//                         max={new Date().toISOString().split("T")[0]}
//                         onChange={(e) => setSelectedDate(e.target.value)}
//                         className="bg-transparent border-none outline-none text-slate-700 font-medium"
//                       />
//                     </div>
//                     {/* <span className="text-xs text-slate-500 mt-1">
//                       {selectedDate
//                         ? formatDateForDisplay(selectedDate)
//                         : formatDateForDisplay(new Date())}
//                     </span> */}
//                   </div>

//                   {/* Select All */}
//                   <div className="flex items-center gap-3 pt-2 sm:pt-6">
//                     <input
//                       type="checkbox"
//                       id="selectAll"
//                       checked={selectAll}
//                       onChange={(e) => handleSelectAll(e.target.checked)}
//                       className="w-5 h-5 rounded accent-emerald-600 cursor-pointer"
//                     />
//                     <label
//                       htmlFor="selectAll"
//                       className="text-sm font-medium text-slate-700 cursor-pointer"
//                     >
//                       Select All
//                     </label>
//                   </div>
//                 </div>

//                 {screenLoading ? (
//                 <CircularLoader color="text-emerald-600" />
                  
//                 ): ( <Button
//                   type="primary"
//                   loading={isSubmitting}
//                   onClick={handleSubmit}
//                   className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold px-8 py-6 rounded-lg border-0 shadow-md hover:shadow-lg transition-all"
//                 >
//                   {isSubmitting ? "Updating..." : "Submit Attendance"}
//                 </Button>)}
               
//               </div>
//             </div>

//             {/* Table Section */}
//             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-4 min-h-[300px] flex justify-center items-center">
//               {screenLoading ? (
//                 <CircularLoader color="text-emerald-600" />
//               ) : (
//                 <DataTable
//                   columns={AttendanceColumns}
//                   data={filteredAttendance}
//                   exportedPdfName="Employee Attendence"
//                   exportedFileName={`EmployeeAttendence.csv`}
//                 />
//               )}
//             </div>
//           </div>
        
//       </div>
//     </div>
//   );
// };

const EmployeeAttendanceReport = () => {
  const [tableAttendanceData, setTableAttendanceData] = useState([]);
  const [screenLoading, setScreenLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [activeUserData, setActiveUserData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  // Format date for user display (dd-mm-yyyy)
  const formatDateForDisplay = (date) => {
    if (!date) return "-";

    let d;
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split("-");
      d = new Date(year, month - 1, day);
    } else if (typeof date === "string" && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
      return date;
    } else {
      d = new Date(date);
    }

    if (isNaN(d.getTime())) {
      return "-";
    }

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format date for backend (yyyy-mm-dd)
  const formatDateForBackend = (date) => {
    if (!date) {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(today.getDate()).padStart(2, "0")}`;
    }

    let d;
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    } else if (typeof date === "string" && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
      const [day, month, year] = date.split("-");
      return `${year}-${month}-${day}`;
    } else {
      d = new Date(date);
      if (isNaN(d.getTime())) return null;
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const filterOption = (data, searchText) => {
    if (!searchText) return data;
    return data.filter((item) =>
      item.EmployeeName.toLowerCase().includes(searchText.toLowerCase())
    );
  };

    const handleNoteChange = (id, value) => {
    setTableAttendanceData((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, Note: value } : item
      )
    );
  };


  const fetchAttendanceReport = async (date) => {
  setScreenLoading(true);
  try {
    const currentDate = formatDateForBackend(date || new Date());
    const response = await api.get(
      `/employee-attendance/employees/date/${currentDate}`
    );

    const formattedData =
      response?.data?.agentAttendanceData?.map((attend, index) => {
        const details = attend?.attendance_details || {};
        const isApproved =
          details?.approval_status?.toLowerCase() === "approved";

        return {
          _id: attend?._id,
          id: index + 1,
          EmployeeName: attend?.employee_name || "-",
          EmployeeId: attend?.employeeCode || "-",
          Status: details?.status || "Absent",
          ApprovalStatus: details?.approval_status || "Pending",
          Date: details?.date ? formatDateForDisplay(details.date) : "-",
          Time: details?.time || "-",
          Note: details?.note || "",
          attendanceId: details?._id,
          Approved: isApproved,
          InitialApproved: isApproved,
        };
      }) || [];

    setTableAttendanceData(formattedData);

    const activeMap = {};
    formattedData.forEach((item) => {
      activeMap[item._id] = { info: { status: item.Approved } };
    });
    setActiveUserData(activeMap);
  } catch (error) {
    console.error("Failed to load attendance data", error);
  } finally {
    setScreenLoading(false);
  }
};


useEffect(() => {
  fetchAttendanceReport(selectedDate);
}, [selectedDate]);

  // Toggle employee status
  const handleStatusToggle = (id) => {
    setTableAttendanceData((prevData) =>
      prevData.map((item) =>
        item._id === id
          ? {
              ...item,
              Status: item.Status === "Present" ? "Absent" : "Present",
            }
          : item
      )
    );
  };

  const handleCheckboxChange = (id, checked) => {
    // Only allow changes if the record was not previously approved from the backend
    const record = tableAttendanceData.find((item) => item._id === id);
    if (record && record.InitialApproved) {
      // Prevent local state change if it was already approved in the database
      setAlertConfig({
        visibility: true,
        message: "Cannot unapprove a previously approved record.",
        type: "info",
      });
      return;
    }

    setActiveUserData((prev) => ({
      ...prev,
      [id]: { info: { status: checked } },
    }));

    setTableAttendanceData((prevData) =>
      prevData.map((item) =>
        item._id === id
          ? {
              ...item,
              Approved: checked,
              ApprovalStatus: checked ? "Approved" : "Pending",
            }
          : item
      )
    );
  };

  // const filteredAttendance = useMemo(() => {
  //   return filterOption(tableAttendanceData, searchText).map((item, index) => {
  //     // Determine if the checkbox should be disabled
  //     const isPermanentlyApproved = item.InitialApproved === true;

  //     return {
  //       ...item,
  //       id: index + 1,
  //       ApprovalStatus: (
  //         <div className="flex justify-center">
  //           {item.ApprovalStatus === "Approved" ? (
  //             <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
  //               <CheckCircle2 size={14} />
  //               Approved
  //             </span>
  //           ) : (
  //             <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
  //               <Clock size={14} />
  //               Pending
  //             </span>
  //           )}
  //         </div>
  //       ),
  //       checkBox: (
  //         <div className="flex items-center justify-center gap-3">
  //           <button
  //             onClick={() => handleStatusToggle(item._id)}
  //             className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
  //               item.Status === "Present"
  //                 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
  //                 : "bg-red-100 text-red-700 hover:bg-red-200"
  //             }`}
  //           >
  //             {item.Status === "Present" ? (
  //               <CheckCircle2 size={16} />
  //             ) : (
  //               <XCircle size={16} />
  //             )}
  //             {item.Status}
  //           </button>

  //           {/* Checkbox: Disabled if InitialApproved (from database) is true */}
  //           <input
  //             type="checkbox"
  //             checked={item.Approved}
  //             disabled={isPermanentlyApproved}
  //             onChange={(e) => handleCheckboxChange(item._id, e.target.checked)}
  //             className={`w-5 h-5 rounded accent-emerald-600 transition-all ${
  //               isPermanentlyApproved
  //                 ? "cursor-not-allowed opacity-40"
  //                 : "cursor-pointer hover:accent-emerald-700"
  //             }`}
  //           />
  //         </div>
  //       ),
  //     };
  //   });
  // }, [tableAttendanceData, activeUserData, searchText]);

const filteredAttendance = useMemo(() => {
  return filterOption(tableAttendanceData, searchText).map((item, index) => {
    const isPermanentlyApproved = item.InitialApproved === true;

    return {
      ...item,
      id: index + 1,

      ApprovalStatus: (
        <div className="flex justify-center">
          {item.ApprovalStatus === "Approved" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={14} />
              Approved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock size={14} />
              Pending
            </span>
          )}
        </div>
      ),

      // 🟢 Editable Note (disabled once approved)
      Note: (
        <input
          type="text"
          value={item.Note || ""}
          disabled={isPermanentlyApproved}
          onChange={(e) => handleNoteChange(item._id, e.target.value)}
          placeholder="Enter Reason"
          className={`w-full px-3 py-1 border rounded-md text-sm focus:outline-none ${
            isPermanentlyApproved
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "border-emerald-300 focus:border-emerald-500"
          }`}
        />
      ),

      // 🟢 Actions: disable both checkbox & status toggle if already approved
      checkBox: (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => !isPermanentlyApproved && handleStatusToggle(item._id)}
            disabled={isPermanentlyApproved}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              isPermanentlyApproved
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : item.Status === "Present"
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            {item.Status === "Present" ? (
              <CheckCircle2 size={16} />
            ) : (
              <XCircle size={16} />
            )}
            {item.Status}
          </button>

          <input
            type="checkbox"
            checked={item.Approved}
            disabled={isPermanentlyApproved}
            onChange={(e) => handleCheckboxChange(item._id, e.target.checked)}
            className={`w-5 h-5 rounded accent-emerald-600 transition-all ${
              isPermanentlyApproved
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer hover:accent-emerald-700"
            }`}
          />
        </div>
      ),
    };
  });
}, [tableAttendanceData, activeUserData, searchText]);


  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    const updated = {};

    // Only update items that are NOT permanently approved
    filteredAttendance.forEach((item) => {
      if (!item.InitialApproved) {
        updated[item._id] = { info: { status: checked } };
      }
    });

    setActiveUserData((prev) => ({ ...prev, ...updated }));

    setTableAttendanceData((prevData) =>
      prevData.map((item) =>
        filteredAttendance.find((f) => f._id === item._id) &&
        !item.InitialApproved // Check existence in filter and if not approved
          ? {
              ...item,
              Approved: checked,
              ApprovalStatus: checked ? "Approved" : "Pending",
            }
          : item
      )
    );
  };

  // const handleSubmit = async () => {
  //   setIsSubmitting(true);
  //   try {
  //     const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  //     const approvedBy = currentUser?._id;
  //     const formattedDate = formatDateForBackend(selectedDate || new Date());

  //     // 1️⃣ Filter records that are being newly approved OR modified
  //     const recordsToUpdate = tableAttendanceData.filter(
  //       (row) =>
  //         row.Approved !== row.InitialApproved || // State changed (Pending -> Approved)
  //         (row.Approved && row.Status !== row.InitialStatus) // Approved but status was toggled
  //     );

  //     // Separate into existing records (update) and new absentees (create)
  //     const existingUpdates = recordsToUpdate.filter(
  //       (row) => row.attendanceId && row.Approved
  //     );
  //     const newAbsentees = recordsToUpdate.filter(
  //       (row) => !row.attendanceId && row.Approved
  //     );

  //     // The requirement is that once approved, it cannot be changed back to Pending.
  //     // Therefore, we only submit Approved status. Un-approved records are ignored by this submit.

  //     // 2️⃣ Update existing attendance records
  //     if (existingUpdates.length > 0) {
  //       const updatedData = existingUpdates.map((row) => ({
  //         employee_id: row._id,
  //         attendance_id: row.attendanceId,
  //         status: row.Status,
  //         approval_status: "Approved", // Only submit as Approved
  //         approved_by: approvedBy,
  //       }));

  //       await api.put("/employee-attendance/update-approvals", {
  //         updates: updatedData,
  //       });
  //     }

  //     // 3️⃣ Save new absent employees (must be Approved to be saved)
  //     if (newAbsentees.length > 0) {
  //       await api.post("/employee-attendance/save-selected-absent", {
  //         absentees: newAbsentees.map((row) => ({
  //           employee_id: row._id,
  //           status: row.Status || "Absent",
  //           approval_status: "Approved",
  //           approved_by: approvedBy,
  //           date: formattedDate,
  //         })),
  //       });
  //     }

  //     // 4️⃣ Final message and Refresh
  //     await fetchAttendanceReport(selectedDate);
  //     setAlertConfig({
  //       visibility: true,
  //       message: "Attendance updates submitted successfully.",
  //       type: "success",
  //     });

  //     // Refresh table by re-fetching data to apply the new 'InitialApproved' lock status
  //     setSelectedDate(selectedDate);
  //   } catch (error) {
  //     console.error("Something went wrong while submitting attendance:", error);
  //     setAlertConfig({
  //       visibility: true,
  //       message: "Error updating selected employees!",
  //       type: "error",
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

   const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem("user")) || {};
      const approvedBy = currentUser?._id;
      const formattedDate = formatDateForBackend(selectedDate || new Date());

      const recordsToUpdate = tableAttendanceData.filter(
        (row) =>
          row.Approved !== row.InitialApproved ||
          (row.Approved && row.Status !== row.InitialStatus) ||
          (row.Approved && row.Note && row.Note.trim() !== "")
      );

      const existingUpdates = recordsToUpdate.filter(
        (row) => row.attendanceId && row.Approved
      );
      const newAbsentees = recordsToUpdate.filter(
        (row) => !row.attendanceId && row.Approved
      );

      if (existingUpdates.length > 0) {
        const updatedData = existingUpdates.map((row) => ({
          employee_id: row._id,
          attendance_id: row.attendanceId,
          status: row.Status,
          approval_status: "Approved",
          approved_by: approvedBy,
          note: row.Note || "", // ✅ Include note in update
        }));

        await api.put("/employee-attendance/update-approvals", {
          updates: updatedData,
        });
      }

      if (newAbsentees.length > 0) {
        await api.post("/employee-attendance/save-selected-absent", {
          absentees: newAbsentees.map((row) => ({
            employee_id: row._id,
            status: row.Status || "Absent",
            approval_status: "Approved",
            approved_by: approvedBy,
            date: formattedDate,
            note: row.Note || "", // ✅ Include note in create
          })),
        });
      }

      await fetchAttendanceReport(selectedDate);
      setAlertConfig({
        visibility: true,
        message: "Attendance updates submitted successfully.",
        type: "success",
      });

      setSelectedDate(selectedDate);
    } catch (error) {
      console.error("Error while submitting attendance:", error);
      setAlertConfig({
        visibility: true,
        message: "Error updating selected employees!",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const AttendanceColumns = [
    { key: "id", header: "Sl No" },
    { key: "EmployeeId", header: "Employee Id" },
    { key: "EmployeeName", header: "Employee Name" },
    { key: "Status", header: "Status" },
    { key: "ApprovalStatus", header: "Approval Status" },
    { key: "Date", header: "Date" },
    { key: "Time", header: "Time" },
    {key: "Note", header: "Reason"},
    { key: "checkBox", header: "Actions" },
  ];

  return (
    <div className="w-screen bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="flex">
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        <Sidebar />
        <CustomAlertDialog
          type={alertConfig.type}
          isVisible={alertConfig.visibility}
          message={alertConfig.message}
          onClose={() =>
            setAlertConfig((prev) => ({ ...prev, visibility: false }))
          }
        />
          <div className="flex-grow p-8 mt-20">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Employee Attendance
              </h1>
              <p className="text-slate-500">
                Manage and approve employee attendance records
              </p>
            </div>

            {/* Controls Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                {/* Left Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
                  {/* Date Picker */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Select Date
                    </label>
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                      <Calendar size={18} className="text-slate-400" />
                      <input
                        type="date"
                        value={
                          selectedDate || new Date().toISOString().split("T")[0]
                        }
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent border-none outline-none text-slate-700 font-medium"
                      />
                    </div>
                    {/* <span className="text-xs text-slate-500 mt-1">
                      {selectedDate
                        ? formatDateForDisplay(selectedDate)
                        : formatDateForDisplay(new Date())}
                    </span> */}
                  </div>

                  {/* Select All */}
                  <div className="flex items-center gap-3 pt-2 sm:pt-6">
                    <input
                      type="checkbox"
                      id="selectAll"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-5 h-5 rounded accent-emerald-600 cursor-pointer"
                    />
                    <label
                      htmlFor="selectAll"
                      className="text-sm font-medium text-slate-700 cursor-pointer"
                    >
                      Select All
                    </label>
                  </div>
                </div>

                {screenLoading ? (
                <CircularLoader color="text-emerald-600" />
                  
                ): ( <Button
                  type="primary"
                  loading={isSubmitting}
                  onClick={handleSubmit}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold px-8 py-6 rounded-lg border-0 shadow-md hover:shadow-lg transition-all"
                >
                  {isSubmitting ? "Updating..." : "Submit Attendance"}
                </Button>)}
               
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-4 min-h-[300px] flex justify-center items-center">
              {screenLoading ? (
                <CircularLoader color="text-emerald-600" />
              ) : (
                <DataTable
                  columns={AttendanceColumns}
                  data={filteredAttendance}
                  exportedPdfName="Employee Attendence"
                  exportedFileName={`EmployeeAttendence.csv`}
                />
              )}
            </div>
          </div>
        
      </div>
    </div>
  );
};

export default EmployeeAttendanceReport;
