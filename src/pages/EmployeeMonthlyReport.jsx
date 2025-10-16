import { div } from "framer-motion/client";
import { useState, useEffect } from "react";
import DataTable from "../components/layouts/Datatable"
import api from "../instance/TokenInstance";
import { Select, Table, Spin, Button, Tag } from "antd";



// const { RangePicker } = DatePicker;

// const EmployeeMonthlyReport = () => {
//   const [presentCount, setPresentCount] = useState(0);
//   const [absentCount, setAbsentCount] = useState(0);
//   const [attendanceMonthlyTableReport, setAttendanceMonthlyReport] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // ✅ Fetch employee list
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await api.get(`/agent/get-employee`);
//         setEmployees(response.data.employee || []);
//       } catch (error) {
//         console.error("Unable to fetch employees:", error);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // ✅ Fetch monthly attendance for selected employee
//   useEffect(() => {
//     if (!selectedEmployee) return;

//     const fetchEmployeeMonthlyAttendance = async () => {
//       setLoading(true);
//       try {
//         const response = await api.get(
//           `/employee-attendance/employee/${selectedEmployee}`
//         );

//         const attendanceData = response.data.attendanceDataResponse || [];
//         let present = 0;
//         let absent = 0;

//         attendanceData.forEach((record) => {
//           if (record.status === "Present") present++;
//           else if (record.status === "Absent") absent++;
//         });

//         setPresentCount(present);
//         setAbsentCount(absent);

//         const formattedData = [
//           {
//             key: 1,
//             SlNo: 1,
//             EmployeeName: attendanceData[0]?.employee_id?.name || "-",
//             PresentDays: present,
//             AbsentDays: absent,
//           },
//         ];

//         setAttendanceMonthlyReport(formattedData);
//       } catch (error) {
//         console.error("Unable to fetch Employee monthly attendance:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEmployeeMonthlyAttendance();
//   }, [selectedEmployee]);

//   // ✅ Table columns
//   const attendanceColumns = [
//     { title: "Sl No", dataIndex: "SlNo", key: "SlNo" },
//     { title: "Employee Name", dataIndex: "EmployeeName", key: "EmployeeName" },
//     { title: "Present Days", dataIndex: "PresentDays", key: "PresentDays" },
//     { title: "Absent Days", dataIndex: "AbsentDays", key: "AbsentDays" },
//   ];

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold mb-4">Employee Monthly Report</h2>

//       {/* Employee Selector */}
//       <Select
//         placeholder="Select Employee"
//         style={{ width: 300, marginBottom: 20 }}
//         onChange={(value) => setSelectedEmployee(value)}
//         value={selectedEmployee}
//       >
//         {employees.map((emp) => (
//           <Select.Option key={emp._id} value={emp._id}>
//             {emp.name}
//           </Select.Option>
//         ))}
//       </Select>

//       {loading ? (
//         <div className="flex justify-center items-center h-40">
//           <Spin size="large" />
//         </div>
//       ) : (
//         <>
//           {attendanceMonthlyTableReport.length > 0 ? (
//             <>
//               <div className="mb-4">
//                 <p>
//                   <strong>Present Days:</strong> {presentCount}
//                 </p>
//                 <p>
//                   <strong>Absent Days:</strong> {absentCount}
//                 </p>
//               </div>

//               <Table
//                 columns={attendanceColumns}
//                 dataSource={attendanceMonthlyTableReport}
//                 pagination={false}
//                 bordered
//               />
//             </>
//           ) : (
//             selectedEmployee && (
//               <p className="text-gray-500">No attendance data found.</p>
//             )
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// const EmployeeMonthlyReport = () => {
//   const [attendanceData, setAttendanceData] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState("all");
//   const [selectedDate, setSelectedDate] = useState(currentYearMonth); // YYYY-MM format
//   const [loading, setLoading] = useState(false);


//   const today = new Date();
//   const currentYear = today.getFullYear();
//   const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
//   const currentYearMonth = `${currentYear}-${currentMonth}`;

 
//   function formatDate(date) {
//     const year = date.getFullYear();
//     const month = `0${date.getMonth() + 1}`.slice(-2);
//     const day = `0${date.getDate()}`.slice(-2);
//     return `${year}-${month}-${day}`;
//   }


//   function formatToYearMonth(year, month) {
//     return `${year}-${String(month).padStart(2, "0")}`;
//   }


//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await api.get("/agent/get-employee");
//         setEmployees(res.data.employee || []);
//       } catch (err) {
//         console.error("Error fetching employees:", err);
//       }
//     };
//     fetchEmployees();
//   }, []);


//   const fetchAttendanceData = async () => {
//     if (!selectedDate) return alert("Please select a month first!");

//     setLoading(true);
//     try {
//       const [year, month] = selectedDate.split("-");
//       const fromDate = `${year}-${month}-01`;
//       const toDate = formatDate(new Date(year, month, 0)); // last day of month

//       const params = {
//         from_date: fromDate,
//         to_date: toDate,
//         employee_id: selectedEmployee !== "all" ? selectedEmployee : "",
//       };

//       const res = await api.get("/employee-attendance/monthly-report", { params });
//       const attendanceResponse = res.data.attendanceDataResponse || [];

      
//       const groupedData = {};
//       attendanceResponse.forEach((record) => {
//         const emp = record.employee_id;
//         if (!groupedData[emp._id]) {
//           groupedData[emp._id] = {
//             key: emp._id,
//             EmployeeName: emp.name,
//             PresentDays: 0,
//             AbsentDays: 0,
//           };
//         }

//         if (record.status === "Present") groupedData[emp._id].PresentDays++;
//         else if (record.status === "Absent") groupedData[emp._id].AbsentDays++;
//       });

//       setAttendanceData(Object.values(groupedData));
//     } catch (err) {
//       console.error("Error fetching attendance:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

 
//   const columns = [
//     { title: "Sl No", render: (_, __, index) => index + 1 },
//     { title: "Employee Name", dataIndex: "EmployeeName" },
//     { title: "Present Days", dataIndex: "PresentDays", align: "center" },
//     { title: "Absent Days", dataIndex: "AbsentDays", align: "center" },
//   ];

//   return (
//     <div className="p-4 bg-white rounded-lg shadow-md">
//       <h2 className="text-xl font-semibold mb-4">Monthly Attendance Report</h2>

     
//       <div className="flex flex-wrap gap-3 mb-4 items-end">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Target Month
//           </label>
//           <input
//             type="month"
//             className="p-2 border rounded w-full min-w-[150px]"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             max={formatToYearMonth(currentYear, currentMonth)}
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Employee
//           </label>
//           <Select
//             showSearch
//             placeholder="Select Employee"
//             style={{ width: 250 }}
//             value={selectedEmployee}
//             onChange={setSelectedEmployee}
//           >
//             <Select.Option value="all">All Employees</Select.Option>
//             {employees.map((emp) => (
//               <Select.Option key={emp._id} value={emp._id}>
//                 {emp.name}
//               </Select.Option>
//             ))}
//           </Select>
//         </div>

//         <Button type="primary" onClick={fetchAttendanceData}>
//           Show Report
//         </Button>
//       </div>

//       {/* 📊 Attendance Table */}
//       {loading ? (
//         <div className="flex justify-center items-center h-40">
//           <Spin size="large" />
//         </div>
//       ) : (
//         <Table
//           columns={columns}
//           dataSource={attendanceData}
//           pagination={{ pageSize: 10 }}
//           bordered
//         />
//       )}
//     </div>
//   );
// };

// const EmployeeMonthlyReport = () => {
//   const today = new Date();
//   const currentYear = today.getFullYear();
//   const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
//   const currentYearMonth = `${currentYear}-${currentMonth}`; // e.g., "2025-10"

//   // ✅ format helper
//   const formatDate = (date) => {
//     const year = date.getFullYear();
//     const month = `0${date.getMonth() + 1}`.slice(-2);
//     const day = `0${date.getDate()}`.slice(-2);
//     return `${year}-${month}-${day}`;
//   };

//   // ✅ state
//   const [selectedDate, setSelectedDate] = useState(currentYearMonth); // default current month
//   const [attendanceData, setAttendanceData] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState("all");
//   const [loading, setLoading] = useState(false);

//   // ✅ get first and last day of month
//   const getMonthRange = (yearMonth) => {
//     const [year, month] = yearMonth.split("-");
//     const firstDay = new Date(year, month - 1, 1);
//     const lastDay = new Date(year, month, 0);
//     return {
//       from_date: formatDate(firstDay),
//       to_date: formatDate(lastDay),
//     };
//   };

//   // ✅ fetch employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await api.get("/agent/get-employee");
//         setEmployees(res.data.employee || []);
//       } catch (err) {
//         console.error("Error fetching employees:", err);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // ✅ fetch attendance for current month or selected month
//   const fetchAttendanceData = async () => {
//     setLoading(true);
//     try {
//       const { from_date, to_date } = getMonthRange(selectedDate);
//       const params = {
//         from_date,
//         to_date,
//         employee_id: selectedEmployee !== "all" ? selectedEmployee : "",
//       };

//       const res = await api.get("/employee-attendance/monthly-report", { params });
//       const attendanceResponse = res.data.attendanceDataResponse || [];

//       // ✅ group by employee
//       const grouped = {};
//       attendanceResponse.forEach((record) => {
//         const emp = record.employee_id;
//         if (!grouped[emp._id]) {
//           grouped[emp._id] = {
//             key: emp._id,
//             EmployeeName: emp.name,
//             PresentDays: 0,
//             AbsentDays: 0,
//           };
//         }
//         if (record.status === "Present") grouped[emp._id].PresentDays++;
//         if (record.status === "Absent") grouped[emp._id].AbsentDays++;
//       });

//       setAttendanceData(Object.values(grouped));
//     } catch (err) {
//       console.error("Error fetching attendance:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ auto fetch on mount or filter change
//   useEffect(() => {
//     fetchAttendanceData();
//   }, [selectedEmployee, selectedDate]);

//   // ✅ table columns
//   const columns = [
//     { title: "Sl No", render: (_, __, i) => i + 1 },
//     { title: "Employee Name", dataIndex: "EmployeeName" },
//     { title: "Present Days", dataIndex: "PresentDays", align: "center" },
//     { title: "Absent Days", dataIndex: "AbsentDays", align: "center" },
//   ];

//   return (
//     <div className="p-4 bg-white rounded-lg shadow-md">
//       <h2 className="text-xl font-semibold mb-4">Monthly Attendance Report</h2>

//       {/* 🔍 Filters */}
//       <div className="flex flex-wrap gap-4 mb-4 items-end">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Target Month
//           </label>
//           <input
//             type="month"
//             className="p-2 border rounded w-full min-w-[150px]"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             max={currentYearMonth}
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Employee
//           </label>
//           <Select
//             showSearch
//             style={{ width: 250 }}
//             value={selectedEmployee}
//             onChange={setSelectedEmployee}
//           >
//             <Select.Option value="all">All Employees</Select.Option>
//             {employees.map((emp) => (
//               <Select.Option key={emp._id} value={emp._id}>
//                 {emp.name}
//               </Select.Option>
//             ))}
//           </Select>
//         </div>

//         <Button type="primary" onClick={fetchAttendanceData}>
//           Filter
//         </Button>
//       </div>

//       {/* 📊 Table */}
//       {loading ? (
//         <div className="flex justify-center items-center h-40">
//           <Spin size="large" />
//         </div>
//       ) : (
//         <Table
//           columns={columns}
//           dataSource={attendanceData}
//           pagination={{ pageSize: 10 }}
//           bordered
//         />
//       )}

//       {/* 🗓️ Summary */}
//       <div className="mt-3 text-gray-600">
//         Showing attendance for <strong>{selectedDate}</strong>
//       </div>
//     </div>
//   );
// };


// const EmployeeMonthlyReport = () => {
//   const today = new Date();
//   const currentYear = today.getFullYear();
//   const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
//   const currentYearMonth = `${currentYear}-${currentMonth}`; // e.g. 2025-10

//   const formatDate = (date) => {
//     const year = date.getFullYear();
//     const month = `0${date.getMonth() + 1}`.slice(-2);
//     const day = `0${date.getDate()}`.slice(-2);
//     return `${year}-${month}-${day}`;
//   };

//   const [selectedDate, setSelectedDate] = useState(currentYearMonth);
//   const [attendanceData, setAttendanceData] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState("all");
//   const [loading, setLoading] = useState(false);

//   const getMonthRange = (yearMonth) => {
//     const [year, month] = yearMonth.split("-");
//     const firstDay = new Date(year, month - 1, 1);
//     const lastDay = new Date(year, month, 0);
//     return {
//       from_date: formatDate(firstDay),
//       to_date: formatDate(lastDay),
//     };
//   };

//   // ✅ Fetch employee list
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await api.get("/agent/get-employee");
//         setEmployees(res.data.employee || []);
//       } catch (err) {
//         console.error("Error fetching employees:", err);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // ✅ Fetch attendance report
//   const fetchAttendanceData = async () => {
//     setLoading(true);
//     try {
//       const { from_date, to_date } = getMonthRange(selectedDate);
//       const params = {
//         from_date,
//         to_date,
//         employee_id: selectedEmployee !== "all" ? selectedEmployee : "",
//       };

//       const res = await api.get("/employee-attendance/monthly-report", { params });
//       const attendanceResponse = res.data.attendanceDataResponse || [];

//       if (selectedEmployee !== "all") {
//         // For individual employee → Date-wise records
//         const formatted = attendanceResponse.map((rec) => ({
//           key: rec._id,
//           date: rec.date.split("T")[0],
//           time: rec.time,
//           day: new Date(rec.date).toLocaleDateString("en-US", { weekday: "short" }),
//           status: rec.status,
//         }));
//         setAttendanceData(formatted);
//       } else {
//         // For all employees → Summary
//         const grouped = {};
//         attendanceResponse.forEach((record) => {
//           const emp = record.employee_id;
//           if (!grouped[emp._id]) {
//             grouped[emp._id] = {
//               key: emp._id,
//               EmployeeName: emp.name,
//               PresentDays: 0,
//               AbsentDays: 0,
//             };
//           }
//           if (record.status === "Present") grouped[emp._id].PresentDays++;
//           if (record.status === "Absent") grouped[emp._id].AbsentDays++;
//         });
//         setAttendanceData(Object.values(grouped));
//       }
//     } catch (err) {
//       console.error("Error fetching attendance:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAttendanceData();
//   }, [selectedEmployee, selectedDate]);

//   // ✅ Columns for all employees
//   const allEmployeesColumns = [
//     { title: "Sl No", render: (_, __, i) => i + 1 },
//     { title: "Employee Name", dataIndex: "EmployeeName" },
//     { title: "Present Days", dataIndex: "PresentDays", align: "center" },
//     { title: "Absent Days", dataIndex: "AbsentDays", align: "center" },
//   ];

//   // ✅ Columns for single employee (date-wise)
//   const individualColumns = [
//     { title: "Sl No", render: (_, __, i) => i + 1 },
//     { title: "Date", dataIndex: "date", align: "center" },
//     {title: "Time", dataIndex: "time", align: "center"},
//     { title: "Day", dataIndex: "day", align: "center" },
//     {
//       title: "Status",
//       dataIndex: "status",
//       align: "center",
//       render: (status) =>
//         status === "Present" ? (
//           <Tag color="green">Present</Tag>
//         ) : (
//           <Tag color="red">Absent</Tag>
//         ),
//     },
//   ];

//   return (
//     <div className="p-4 bg-white rounded-lg shadow-md">
//       <h2 className="text-xl font-semibold mb-4">Monthly Attendance Report</h2>

//       {/* 🔍 Filters */}
//       <div className="flex flex-wrap gap-4 mb-4 items-end">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Target Month
//           </label>
//           <input
//             type="month"
//             className="p-2 border rounded w-full min-w-[150px]"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             max={currentYearMonth}
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Employee
//           </label>
//           <Select
//             showSearch
//             style={{ width: 250 }}
//             value={selectedEmployee}
//             onChange={setSelectedEmployee}
//           >
//             <Select.Option value="all">All Employees</Select.Option>
//             {employees.map((emp) => (
//               <Select.Option key={emp._id} value={emp._id}>
//                 {emp.name}
//               </Select.Option>
//             ))}
//           </Select>
//         </div>

//         <Button type="primary" onClick={fetchAttendanceData}>
//           Filter
//         </Button>
//       </div>

//       {/* 📊 Table Section */}
//       {loading ? (
//         <div className="flex justify-center items-center h-40">
//           <Spin size="large" />
//         </div>
//       ) : selectedEmployee === "all" ? (
//         <Table
//           columns={allEmployeesColumns}
//           dataSource={attendanceData}
//           pagination={{ pageSize: 10 }}
//           bordered
//         />
//       ) : (
//         <Table
//           columns={individualColumns}
//           dataSource={attendanceData}
//           pagination={{ pageSize: 31 }}
//           bordered
//         />
//       )}

//       {/* 📅 Summary */}
//       <div className="mt-3 text-gray-600">
//         Showing attendance for <strong>{selectedDate}</strong>{" "}
//         {selectedEmployee !== "all" &&
//           `– ${
//             employees.find((e) => e._id === selectedEmployee)?.name || ""
//           }`}
//       </div>
//     </div>
//   );
// };

const EmployeeMonthlyReport = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
  const currentYearMonth = `${currentYear}-${currentMonth}`;

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(currentYearMonth);
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [loading, setLoading] = useState(false);

  const getMonthRange = (yearMonth) => {
    const [year, month] = yearMonth.split("-");
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    return {
      from_date: formatDate(firstDay),
      to_date: formatDate(lastDay),
    };
  };

  // ✅ Fetch employee list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/agent/get-employee");
        setEmployees(res.data.employee || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  // ✅ Fetch attendance report
  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const { from_date, to_date } = getMonthRange(selectedDate);
      const params = {
        from_date,
        to_date,
        employee_id: selectedEmployee !== "all" ? selectedEmployee : "",
      };

      const res = await api.get("/employee-attendance/monthly-report", { params });
      const attendanceResponse = res.data.attendanceDataResponse || [];

      if (selectedEmployee !== "all") {
        // For individual employee → Date-wise records
        const formatted = attendanceResponse.map((rec, index) => ({
          slNo: index + 1,
          key: rec._id || index,
          date: rec?.date ? rec.date.split("T")[0] : "",
          time: rec?.time || "",
          day: rec?.date
            ? new Date(rec.date).toLocaleDateString("en-US", { weekday: "short" })
            : "",
          status: rec?.status || "",
        }));
        setAttendanceData(formatted);
      } else {
        // For all employees → Summary
        const grouped = {};
        attendanceResponse.forEach((record, index) => {
          const emp = record?.employee_id;
          if (!emp?._id) return;

          if (!grouped[emp._id]) {
            grouped[emp._id] = {
              slNo: index + 1,
              key: emp._id,
              EmployeeName: emp?.name || "",
              PresentDays: 0,
              AbsentDays: 0,
            };
          }
          if (record?.status === "Present") grouped[emp._id].PresentDays++;
          if (record?.status === "Absent") grouped[emp._id].AbsentDays++;
        });
        setAttendanceData(Object.values(grouped));
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedEmployee, selectedDate]);

  // ✅ Columns for all employees
  const allEmployeesColumns = [
    { header: "Sl No", key: "slNo", },
    { header: "Employee Name", key: "EmployeeName" },
    { header: "Present Days", key: "PresentDays" },
    { header: "Absent Days", key: "AbsentDays"},
  ];

  // ✅ Columns for single employee (date-wise)
  const individualColumns = [
    { header: "Sl No", key: "slNo" },
    { header: "Date", key: "date" },
    { header: "Time", key: "time" },
    { header: "Day", key: "day" },
    {
      header: "Status",
      key: "status",
      
      // render: (status) =>
      //   status?.toLowerCase() === "present" ? (
      //     <Tag color="green">Present</Tag>
      //   ) : status?.toLowerCase() === "absent" ? (
      //     <Tag color="red">Absent</Tag>
      //   ) : (
      //     ""
      //   ),
    },
  ];


  const safeData = attendanceData.map((row) => {
    const clean = {};
    Object.keys(row).forEach((key) => {
      clean[key] =
        row[key] === null || row[key] === undefined ? "" : String(row[key]);
    });
    return clean;
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Monthly Attendance Report</h2>

      {/* 🔍 Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Month
          </label>
          <input
            type="month"
            className="p-2 border rounded w-full min-w-[150px]"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={currentYearMonth}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee
          </label>
          <Select
            showSearch
            style={{ width: 250 }}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
          >
            <Select.Option value="all">All Employees</Select.Option>
            {employees.map((emp) => (
              <Select.Option key={emp._id} value={emp._id}>
                {emp.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Button type="primary" onClick={fetchAttendanceData}>
          Filter
        </Button>
      </div>

     
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : (
        <DataTable
          columns={selectedEmployee === "all" ? allEmployeesColumns : individualColumns}
          data={safeData}
         exportedPdfName="Employee Monthly Attendence Report"
                exportedFileName={`EmployeeMonthlyAttendenceReport.csv`}
          loading={loading}
        />
      )}

    
      <div className="mt-3 text-gray-600">
        Showing attendance for <strong>{selectedDate}</strong>{" "}
        {selectedEmployee !== "all" &&
          `– ${
            employees.find((e) => e._id === selectedEmployee)?.name || ""
          }`}
      </div>
    </div>
  );
};






export default EmployeeMonthlyReport;
