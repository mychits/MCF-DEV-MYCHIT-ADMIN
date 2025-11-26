import { useState, useEffect } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";

// const UserRegistrationSourceSummaryReport = () => {
//   const [trackTableData, setTracktableData] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [filterType, setFilterType] = useState("All");
//   const [selectedAgents, setSelectedAgents] = useState("All");
//   const [selectedId, setSelectedId] = useState("all");

//   useEffect(() => {
//     const fetchAgent = async () => {
//       try {
//         const response =await  api.get("/agent/get");
//         console.info(response, "agentfdadfaf");
//         setAgents(response?.data?.agent || []);
//       } catch (error) {
//         console.error("unable to fetch agents", error);
//       }
//     };
//     fetchAgent();
//   }, []);
//   useEffect(() => {
//     const fetchEmployee = async () => {
//       try {
//         const response = await api.get("/agent/get-employee");
//         console.info(response, "employeefdadfaf");
//         setEmployees(response?.data?.employee || []);
//       } catch (error) {
//         console.error("unable to fetch employee", error.message);
//       }
//     };
//     fetchEmployee();
//   }, []);
//   useEffect(() => {
//     const fetchUserRegistrationSourceSummaryReport = async () => {
//       try {
//         const params = {};

//         if (filterType === "agent" && selectedId !== "all") {
//           params.agentId = selectedId;
//         }

//         if (filterType === "employee" && selectedId !== "all") {
//           params.employeeId = selectedId;
//         }
//         const response = await api.get("/user/installed/agents", {params});

//         const formattedData = response?.data?.data?.map((item, index) => ({
//           _id: item?._id,
//           slNo: index + 1,
//           userName: item?.full_name || "-",
//           userPhone: item?.phone_number || "-",
//           referredType: item?.referral_type || "-",
//           referredBy: item?.agent?.name || item?.employee?.name || "Admin",
//         }));
//         setTracktableData(formattedData);
//       } catch (error) {
//         console.error(
//           "unable to fetch track source of registration of user",
//           error.message
//         );
//       }
//       // }finally{
//       //
//       // }
//     };
//     fetchUserRegistrationSourceSummaryReport();
//   }, [filterType, selectedId]);

//   const trackColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "userName", header: "Name" },
//     { key: "userPhone", header: "Phone Number" },
//     { key: "referredType", header: "Referred Type" },
//     { key: "referredBy", header: "Referred By" },
//   ];
//   return (
//     <div className="p-3">
//       <div className="mb-10">
//         <h1 className="text-2xl font-bold text-gray-800">
//           Reports —{" "}
//           <span className="text-blue-600">User Mobile Tracking Report</span>
//         </h1>
//       </div>

//       {/* Filters */}
//       <div className="flex gap-3 mb-5">
//         {/* Filter Type */}
//         <select
//           className="border p-2 rounded"
//           value={filterType}
//           onChange={(e) => {
//             setFilterType(e.target.value);
//             setSelectedId("all");
//           }}
//         >
//           <option value="all">All</option>
//           <option value="agent">Agent</option>
//           <option value="employee">Employee</option>
//         </select>

//         {/* Dynamic Select (Agent / Employee) */}
//         {filterType !== "all" && (
//           <select
//             className="border p-2 rounded"
//             value={selectedId}
//             onChange={(e) => setSelectedId(e.target.value)}
//           >
//             <option value="all">All</option>

//             {filterType === "agent" &&
//               agents.map((a) => (
//                 <option key={a._id} value={a._id}>
//                   {a.name}
//                 </option>
//               ))}

//             {filterType === "employee" &&
//               employees.map((emp) => (
//                 <option key={emp._id} value={emp._id}>
//                   {emp.name}
//                 </option>
//               ))}
//           </select>
//         )}
//       </div>

//       {/* Table */}
//       <DataTable columns={trackColumns} data={trackTableData} />
//     </div>
//   );
// };

// const UserRegistrationSourceSummaryReport = () => {
//   const [trackTableData, setTracktableData] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [employees, setEmployees] = useState([]);

//   const [filterType, setFilterType] = useState("all");
//   const [selectedId, setSelectedId] = useState("all");

//   // Date Filters
//   const today = new Date();
//   const formatDate = (date) => date.toLocaleDateString("en-CA");

//   const todayString = formatDate(today);
//   const [selectedFromDate, setSelectedFromDate] = useState(todayString);
//   const [selectedDate, setSelectedDate] = useState(todayString);

//   const [selectedLabel, setSelectedLabel] = useState("Today");
//   const [showFilterField, setShowFilterField] = useState(false);

//   const groupOptions = [
//     { value: "Today", label: "Today" },
//     { value: "Yesterday", label: "Yesterday" },
//     { value: "ThisMonth", label: "This Month" },
//     { value: "LastMonth", label: "Last Month" },
//     { value: "ThisYear", label: "This Year" },
//     { value: "Custom", label: "Custom" },
//   ];

//   // ---------------------------------------------------- //
//   // APPLY DATE FILTERS
//   // ---------------------------------------------------- //
//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);
//     setShowFilterField(false);

//     const today = new Date();

//     if (value === "Today") {
//       const formatted = formatDate(today);
//       setSelectedFromDate(formatted);
//       setSelectedDate(formatted);
//     } else if (value === "Yesterday") {
//       const yesterday = new Date(today);
//       yesterday.setDate(yesterday.getDate() - 1);
//       const formatted = formatDate(yesterday);
//       setSelectedFromDate(formatted);
//       setSelectedDate(formatted);
//     } else if (value === "ThisMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "LastMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//       const end = new Date(today.getFullYear(), today.getMonth(), 0);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "ThisYear") {
//       const start = new Date(today.getFullYear(), 0, 1);
//       const end = new Date(today.getFullYear(), 11, 31);
//       setSelectedFromDate(formatDate(start));
//       setSelectedDate(formatDate(end));
//     } else if (value === "Custom") {
//       setShowFilterField(true);
//     }
//   };

//   // ---------------------------------------------------- //
//   // FETCH AGENTS + EMPLOYEES
//   // ---------------------------------------------------- //

//   useEffect(() => {
//     const fetchAgent = async () => {
//       try {
//         const response = await api.get("/agent/get");
//         setAgents(response?.data?.agent || []);
//       } catch (error) {
//         console.error("unable to fetch agents", error);
//       }
//     };
//     fetchAgent();
//   }, []);

//   useEffect(() => {
//     const fetchEmployee = async () => {
//       try {
//         const response = await api.get("/agent/get-employee");
//         setEmployees(response?.data?.employee || []);
//       } catch (error) {
//         console.error("unable to fetch employee", error);
//       }
//     };
//     fetchEmployee();
//   }, []);

//   // ---------------------------------------------------- //
//   // FETCH USER MOBILE TRACK REPORT
//   // ---------------------------------------------------- //

//   useEffect(() => {
//     const fetchUserRegistrationSourceSummaryReport = async () => {
//       try {
//         let params = {
//           start_date: selectedFromDate,
//           end_date: selectedDate,
//         };

//         if (filterType === "agent" && selectedId !== "all") {
//           params.agentId = selectedId;
//         }
//         if (filterType === "employee" && selectedId !== "all") {
//           params.employeeId = selectedId;
//         }

//         const response = await api.get("/user/installed/agents", { params });

//         const formattedData = response?.data?.data?.map((item, index) => ({
//           _id: item?._id,
//           slNo: index + 1,
//           userName: item?.full_name || "-",
//           userPhone: item?.phone_number || "-",
//           referredType: item?.referral_type || "-",
//           referredBy: item?.agent?.name || item?.employee?.name || "Admin",
//         }));

//         setTracktableData(formattedData);
//       } catch (error) {
//         console.error("unable to fetch track source of registration", error);
//       }
//     };

//     fetchUserRegistrationSourceSummaryReport();
//   }, [filterType, selectedId, selectedFromDate, selectedDate]);

//   // ---------------------------------------------------- //
//   // TABLE COLUMNS
//   // ---------------------------------------------------- //

//   const trackColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "userName", header: "Name" },
//     { key: "userPhone", header: "Phone Number" },
//     { key: "referredType", header: "Referred Type" },
//     { key: "referredBy", header: "Referred By" },
//   ];

//   // ---------------------------------------------------- //
//   // UI RETURN
//   // ---------------------------------------------------- //

//   return (
//     <div className="p-3">
//       <div className="mb-10">
//         <h1 className="text-2xl font-bold text-gray-800">
//           Reports — <span className="text-blue-600">User Mobile Tracking Report</span>
//         </h1>
//       </div>

//       {/* FILTERS */}
//       <div className="flex gap-3 mb-5 items-center">

//         {/* TYPE FILTER */}
//         <select
//           className="border p-6 rounded-md"
//           value={filterType}
//           onChange={(e) => {
//             setFilterType(e.target.value);
//             setSelectedId("all");
//           }}
//         >
//           <option value="all">All</option>
//           <option value="agent">Agent</option>
//           <option value="employee">Employee</option>
//         </select>

//         {/* AGENT / EMPLOYEE DROPDOWN */}
//         {filterType !== "all" && (
//           <select
//             className="border  rounded-md p-6"
//             value={selectedId}
//             onChange={(e) => setSelectedId(e.target.value)}
//           >
//             <option value="all">All</option>

//             {filterType === "agent" &&
//               agents.map((a) => (
//                 <option key={a._id} value={a._id}>{a.name}</option>
//               ))}

//             {filterType === "employee" &&
//               employees.map((emp) => (
//                 <option key={emp._id} value={emp._id}>{emp.name}</option>
//               ))}
//           </select>
//         )}

//         {/* DATE FILTER */}
//         <select
//           className="border p-6 rounded-md"
//           value={selectedLabel}
//           onChange={(e) => handleSelectFilter(e.target.value)}
//         >
//           {groupOptions.map((o) => (
//             <option key={o.value} value={o.value}>{o.label}</option>
//           ))}
//         </select>

//         {/* CUSTOM DATE RANGE */}
//         {showFilterField && (
//           <>
//             <input
//               type="date"
//               className="border p-2 rounded"
//               value={selectedFromDate}
//               onChange={(e) => setSelectedFromDate(e.target.value)}
//             />

//             <input
//               type="date"
//               className="border p-2 rounded"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//             />
//           </>
//         )}
//       </div>

//       {/* TABLE */}
//       <DataTable columns={trackColumns} data={trackTableData} />
//     </div>
//   );
// };

const UserRegistrationSourceSummaryReport = () => {
  const [trackTableData, setTracktableData] = useState([]);
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [filterType, setFilterType] = useState("all");
  const [selectedId, setSelectedId] = useState("all");

  // ---------------------------------------- //
  // DATE FILTERS
  // ---------------------------------------- //
  const today = new Date();
  const formatDate = (date) => date.toLocaleDateString("en-CA");

  const todayStr = formatDate(today);
  const [selectedFromDate, setSelectedFromDate] = useState(todayStr);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [selectedLabel, setSelectedLabel] = useState("Today");
  const [showFilterField, setShowFilterField] = useState(false);

  const dateOptions = [
    { value: "Today", label: "Today" },
    { value: "Yesterday", label: "Yesterday" },
    { value: "ThisMonth", label: "This Month" },
    { value: "LastMonth", label: "Last Month" },
    { value: "ThisYear", label: "This Year" },
    { value: "Custom", label: "Custom" },
  ];

  const handleSelectFilter = (value) => {
    setSelectedLabel(value);
    setShowFilterField(false);

    const today = new Date();

    if (value === "Today") {
      const formatted = formatDate(today);
      setSelectedFromDate(formatted);
      setSelectedDate(formatted);
    } else if (value === "Yesterday") {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const formatted = formatDate(y);
      setSelectedFromDate(formatted);
      setSelectedDate(formatted);
    } else if (value === "ThisMonth") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setSelectedFromDate(formatDate(start));
      setSelectedDate(formatDate(end));
    } else if (value === "LastMonth") {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setSelectedFromDate(formatDate(start));
      setSelectedDate(formatDate(end));
    } else if (value === "ThisYear") {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      setSelectedFromDate(formatDate(start));
      setSelectedDate(formatDate(end));
    } else if (value === "Custom") {
      setShowFilterField(true);
    }
  };

  // ---------------------------------------- //
  // FETCH AGENTS + EMPLOYEES
  // ---------------------------------------- //
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const resp = await api.get("/agent/get");
        setAgents(resp?.data?.agent || []);
      } catch (err) {
        console.error("Unable to fetch agents", err);
      }
    };
    fetchAgent();
  }, []);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const resp = await api.get("/agent/get-employee");
        setEmployees(resp?.data?.employee || []);
      } catch (err) {
        console.error("Unable to fetch employees", err);
      }
    };
    fetchEmployee();
  }, []);

  // ---------------------------------------- //
  // FETCH USER TRACKING REPORT
  // ---------------------------------------- //
  useEffect(() => {
    const fetchReport = async () => {
      try {
        let params = {
          start_date: selectedFromDate,
          end_date: selectedDate,
        };

        // 🟦 IMPORTANT: Send correct param to backend
        if (filterType === "agent" && selectedId !== "all") {
          params.agentId = selectedId;
        }
        if (filterType === "employee" && selectedId !== "all") {
          params.employeeId = selectedId;
        }

        const response = await api.get("/user/installed/agents", { params });

        const formatted = response?.data?.data?.map((item, index) => ({
          _id: item?._id,
          slNo: index + 1,
          userName: item?.full_name || "-",
          userPhone: item?.phone_number || "-",
          referredType: item?.referral_type || "-",
          referredBy:
            item?.agent?.name ||
            item?.employee?.name ||
            "Admin",
        }));

        setTracktableData(formatted);
      } catch (err) {
        console.error("Error fetching report", err);
      }
    };

    fetchReport();
  }, [filterType, selectedId, selectedFromDate, selectedDate]);

  // ---------------------------------------- //
  // TABLE COLUMNS
  // ---------------------------------------- //
  const trackColumns = [
    { key: "slNo", header: "Sl No" },
    { key: "userName", header: "Name" },
    { key: "userPhone", header: "Phone Number" },
    { key: "referredType", header: "Referred Type" },
    { key: "referredBy", header: "Referred By" },
  ];

  // ---------------------------------------- //
  // UI RETURN
  // ---------------------------------------- //

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        Reports — <span className="text-blue-600">User Mobile Tracking Report</span>
      </h1>

      {/* FILTERS */}
      <div className="flex gap-3 mb-6 items-center">
        {/* TYPE FILTER */}
        <select
          className="border p-2 rounded-md"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setSelectedId("all");
          }}
        >
          <option value="all">All</option>
          <option value="agent">Agent</option>
          <option value="employee">Employee</option>
        </select>

        {/* AGENT / EMPLOYEE FILTER */}
        {filterType !== "all" && (
          <select
            className="border p-2 rounded-md"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="all">All</option>

            {filterType === "agent" &&
              agents.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}

            {filterType === "employee" &&
              employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
          </select>
        )}

        {/* DATE FILTER */}
        <select
          className="border p-2 rounded-md"
          value={selectedLabel}
          onChange={(e) => handleSelectFilter(e.target.value)}
        >
          {dateOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* CUSTOM DATE RANGE */}
        {showFilterField && (
          <>
            <input
              type="date"
              className="border p-2 rounded"
              value={selectedFromDate}
              onChange={(e) => setSelectedFromDate(e.target.value)}
            />

            <input
              type="date"
              className="border p-2 rounded"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </>
        )}
      </div>

      {/* TABLE */}
      <DataTable columns={trackColumns} data={trackTableData} />
    </div>
  );
};

export default UserRegistrationSourceSummaryReport;
