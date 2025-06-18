/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select } from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";

// const PaymentSummary = () => {
//   const [searchText, setSearchText] = useState("");
//   const [usersData, setUsersData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isDataTableLoading, setIsDataTableLoading] = useState(false)
//   const [payloads, setPayloads] = useState({
//     from_date: "",
//     to_date: "",
//     payment_type: "",
//   });
//   const [selectedLabel, setSelectedLabel] = useState("");
//   const [showFilterField, setShowFilterField] = useState(false);
//   const [reloadTrigger, setReloadTrigger] = useState(0);
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const reportResponse = await api.get("/user/get-daily-payments");

//         const processedData = processRawData(reportResponse.data);
//         console.info(processedData)
//         setUsersData(processedData);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [reloadTrigger]);

//   const processRawData = (rawData) => {
//     let count = 0;
//     const result = [];

//     rawData.forEach(usrData => {
//       if (usrData?.data) {
//         usrData.data.forEach(data => {
//           if (data?.enrollment?.group) {
//             count++;
//             result.push({
//               sl_no: count,
//               _id: usrData._id,
//               userName: usrData.userName,
//               userPhone: usrData.phone_number,
//               customerId: usrData.customer_id,
//               amountPaid: data.payments?.totalPaidAmount || 0,
//               paymentsTicket: data.payments?.ticket || 0,
//               groupValue: data.enrollment?.group?.group_value || 0,
//               groupName: data.enrollment?.group?.group_name || "",
//               payment_type: data.enrollment?.payment_type || "",
//               latestPaymentDate: data.payments?.latestPaymentDate || null,
//               latestPaymentAmount: data.payments?.latestPaymentAmount || null,
//               amountToBePaid: data.enrollment?.group?.group_type === "double"
//                 ? (Number(data.enrollment?.group?.group_install) * Number(data?.auction?.auctionCount) + Number(data.enrollment?.group?.group_install) || 0)
//                 : (Number(data.payments?.totalPayable) + Number(data.enrollment?.group?.group_install) + Number(data?.firstAuction?.firstDividentHead) || 0),
//               balance:
//                 data.enrollment?.group?.group_type === "double"
//                   ? (Number(data.enrollment?.group?.group_install) * Number(data?.auction?.auctionCount) +
//                     Number(data.enrollment?.group?.group_install) -
//                     Number(data.payments?.totalPaidAmount) || 0)
//                   : (Number(data.payments?.totalPayable) +
//                     Number(data.enrollment?.group?.group_install) +
//                     Number(data?.firstAuction?.firstDividentHead) -
//                     Number(data?.payments?.totalPaidAmount) || 0),
//               referredBy: data.enrollment?.agent
//                 ? data.enrollment.agent
//                 : data.enrollment.referred_customer
//                   ? data.enrollment.referred_customer
//                   : data.enrollment.referred_lead
//                     ? data.enrollment.referred_lead
//                     : "N/A",
//               enrollmentDate: data.enrollment?.createdAt
//                 ? new Date(data.enrollment.createdAt).toLocaleDateString()
//                 : "N/A"
//             });
//           }
//         });
//       }
//     });

//     return result;
//   };

//   const filteredData = useMemo(() => {
//     return usersData.filter(item => {
//       if (payloads.payment_type && item.payment_type !== payloads.payment_type) {
//         return false;
//       }

//       if (payloads.from_date || payloads.to_date) {
//         const paymentDate = item.latestPaymentDate
//           ? new Date(item.latestPaymentDate).setHours(0, 0, 0, 0)
//           : null;

//         const fromDate = payloads.from_date
//           ? new Date(payloads.from_date).setHours(0, 0, 0, 0)
//           : null;

//         const toDate = payloads.to_date
//           ? new Date(payloads.to_date).setHours(23, 59, 59, 999)
//           : null;

//         if (fromDate && paymentDate < fromDate) return false;
//         if (toDate && paymentDate > toDate) return false;
//       }

//       return filterOption([item], searchText).length > 0;
//     });
//   }, [usersData, payloads, searchText]);

//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);
//     setShowFilterField(false);

//     const today = new Date();
//     const formatDate = (date) =>
//       date.toISOString().split('T')[0];

//     if (value === "Today") {
//       const todayStr = formatDate(today);
//       setPayloads(prev => ({
//         ...prev,
//         from_date: todayStr,
//         to_date: todayStr
//       }));
//     }
//     else if (value === "Yesterday") {
//       const yesterday = new Date(today);
//       yesterday.setDate(today.getDate() - 1);
//       const yesterdayStr = formatDate(yesterday);

//       setPayloads(prev => ({
//         ...prev,
//         from_date: yesterdayStr,
//         to_date: yesterdayStr
//       }));
//     }
//     else if (value === "ThisMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//       setPayloads(prev => ({
//         ...prev,
//         from_date: formatDate(start),
//         to_date: formatDate(end)
//       }));
//     }
//     else if (value === "LastMonth") {
//       const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//       const end = new Date(today.getFullYear(), today.getMonth(), 0);
//       setPayloads(prev => ({
//         ...prev,
//         from_date: formatDate(start),
//         to_date: formatDate(end)
//       }));
//     }
//     else if (value === "ThisWeek") {
//       const start = new Date(today);
//       const day = start.getDay();
//       const diffToMonday = (day === 0 ? -6 : 1 - day);
//       start.setDate(start.getDate() + diffToMonday);

//       const end = new Date(start);
//       end.setDate(start.getDate() + 6);

//       setPayloads(prev => ({
//         ...prev,
//         from_date: formatDate(start),
//         to_date: formatDate(end)
//       }));
//     }
//     else if (value === "LastWeek") {
//       const start = new Date(today);
//       const day = start.getDay();
//       const diffToMonday = (day === 0 ? -6 : 1 - day);

//       start.setDate(start.getDate() + diffToMonday - 7);
//       const end = new Date(start);
//       end.setDate(start.getDate() + 6);

//       setPayloads(prev => ({
//         ...prev,
//         from_date: formatDate(start),
//         to_date: formatDate(end)
//       }));
//     }
//     else if (value === "ThisYear") {
//       const start = new Date(today.getFullYear(), 0, 1);
//       const end = new Date(today.getFullYear(), 11, 31);
//       setPayloads(prev => ({
//         ...prev,
//         from_date: formatDate(start),
//         to_date: formatDate(end)
//       }));
//     }
//     else if (value === "All") {
//       const start = new Date(2000, 0, 1);
//       const end = new Date(
//         today.getFullYear(),
//         today.getMonth(),
//         today.getDate()
//       );
//       setPayloads(prev => ({
//         ...prev,
//         from_date: formatDate(start),
//         to_date: formatDate(end)
//       }));
//     }
//     else if (value === "Custom") {
//       setShowFilterField(true);
//     }
//   };

//   const handlePaymentTypeChange = (value) => {
//     setPayloads(prev => ({ ...prev, payment_type: value }));
//   };

//   const Auctioncolumns = [
//     { key: "sl_no", header: "SL. NO" },
//     { key: "userName", header: "Customer Name" },
//     { key: "userPhone", header: "Phone Number" },
//     { key: "groupName", header: "Group Name" },
//     { key: "groupValue", header: "Group Value" },
//     { key: "payment_type", header: "Payment Type" },
//     { key: "paymentsTicket", header: "Ticket" },
//     { key: "latestPaymentAmount", header: "Latest Amount" },
//     { key: "amountToBePaid", header: "Amount To be Paid" },
//     { key: "amountPaid", header: "Amount Paid" },
//     { key: "balance", header: "Balance" },
//     {
//       key: "latestPaymentDate",
//       header: "Payment Date",
//       render: (row) => row.latestPaymentDate
//         ? new Date(row.latestPaymentDate).toLocaleDateString()
//         : "N/A"
//     },
//     { key: "referredBy", header: "Referred By" }
//   ];

//   return (
//     <div className="w-screen">
//       <div className="flex mt-30">
//         <Navbar
//           onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
//           visibility={true}
//         />
//         {isLoading ? (
//           <div className="w-full">
//             <CircularLoader color="text-green-600" />
//           </div>
//         ) : (
//           <div className="flex-grow p-7">
//             <h1 className="text-2xl font-bold text-center">
//               Reports - Payment Summary
//             </h1>
//             <div className="mt-6 mb-8">
//               <div className="flex justify-start border-b border-gray-300 mb-4"></div>
//               <div className="mt-10">
//                 <div className="flex flex-wrap items-center gap-4 mb-6">
//                   <div className="mb-2">
//                     <label>Filter Option</label>
//                     <Select
//                       showSearch
//                       popupMatchSelectWidth={false}
//                       onChange={handleSelectFilter}
//                       value={selectedLabel || undefined}
//                       placeholder="Search Or Select Filter"
//                       filterOption={(input, option) =>
//                         option.children
//                           .toString()
//                           .toLowerCase()
//                           .includes(input.toLowerCase())
//                       }
//                       className="w-full max-w-xs h-11"
//                     >
//                       {[
//                         { value: "All", label: "All" },
//                         { value: "Today", label: "Today" },
//                         { value: "Yesterday", label: "Yesterday" },
//                         { value: "ThisWeek", label: "This Week" },
//                         { value: "LastWeek", label: "Last Week" },
//                         { value: "ThisMonth", label: "This Month" },
//                         { value: "LastMonth", label: "Last Month" },
//                         { value: "ThisYear", label: "This Year" },
//                         { value: "Custom", label: "Custom" }
//                       ].map((time) => (
//                         <Select.Option key={time.value} value={time.value}>
//                           {time.label}
//                         </Select.Option>
//                       ))}
//                     </Select>
//                   </div>
//                   {showFilterField && (
//                     <section className="flex gap-4">
//                       <div className="mb-2">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           From Date
//                         </label>
//                         <input
//                           type="date"
//                           value={payloads.from_date}
//                           onChange={(e) =>
//                             setPayloads((prev) => ({
//                               ...prev,
//                               from_date: e.target.value,
//                             }))
//                           }
//                           className="w-full max-w-xs h-11 rounded-md"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           To Date
//                         </label>
//                         <input
//                           type="date"
//                           value={payloads.to_date}
//                           onChange={(e) =>
//                             setPayloads((prev) => ({
//                               ...prev,
//                               to_date: e.target.value,
//                             }))
//                           }
//                           className="w-full max-w-xs h-11 rounded-md"
//                         />
//                       </div>
//                     </section>
//                   )}
//                   <div className="mb-2">
//                     <label>Payment Type</label>
//                     <Select
//                       showSearch
//                       popupMatchSelectWidth={false}
//                       placeholder="Search Or Select Payment Type"
//                       filterOption={(input, option) =>
//                         option.children
//                           .toString()
//                           .toLowerCase()
//                           .includes(input.toLowerCase())
//                       }
//                       className="w-full max-w-xs h-11"
//                       value={payloads.payment_type || undefined}
//                       onChange={handlePaymentTypeChange}
//                     >
//                       <Select.Option value="">All</Select.Option>
//                       {["Daily", "Weekly", "Monthly"].map((payType) => (
//                         <Select.Option key={payType} value={payType}>
//                           {payType}
//                         </Select.Option>
//                       ))}
//                     </Select>
//                   </div>
//                 </div>
//                 <DataTable
//                   data={filteredData}
//                   columns={Auctioncolumns}
//                   exportedFileName={`PaymentSummaryReport.csv`}
//                 />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
const PaymentSummary = () => {
  const [searchText, setSearchText] = useState("");
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [payloads, setPayloads] = useState({
    from_date: "",
    to_date: "",
    payment_type: "",
  });
  const [selectedLabel, setSelectedLabel] = useState("");
  const [showFilterField, setShowFilterField] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const reportResponse = await api.get("/user/get-daily-payments");
        const processedData = processRawData(reportResponse.data);
        setUsersData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // const processRawData = (rawData) => {
  //   let count = 0;
  //   const result = [];

  //   rawData.forEach(usrData => {
  //     if (usrData?.data) {
  //       usrData.data.forEach(data => {
  //         if (data?.enrollment?.group) {
  //           count++;
  //           result.push({
  //             sl_no: ++count,
  //             _id: usrData._id,
  //             userName: usrData.userName,
  //             userPhone: usrData.phone_number,
  //             customerId: usrData.customer_id,
  //             amountPaid: data.payments?.totalPaidAmount || 0,
  //             paymentsTicket: data.payments?.ticket || 0,
  //             groupValue: data.enrollment?.group?.group_value || 0,
  //             groupName: data.enrollment?.group?.group_name || "",
  //             payment_type: data.enrollment?.payment_type || "",
  //             latestPaymentDate: data.payments?.latestPaymentDate || null,
  //             latestPaymentAmount: data.payments?.latestPaymentAmount || 0,
  //             latestCollectedBy: data.payments?.latestCollectedBy,
  //             amountToBePaid: data.enrollment?.group?.group_type === "double"
  //               ? (Number(data.enrollment?.group?.group_install) * Number(data?.auction?.auctionCount) + Number(data.enrollment?.group?.group_install) || 0)
  //               : (Number(data.payments?.totalPayable) + Number(data.enrollment?.group?.group_install) + Number(data?.firstAuction?.firstDividentHead) || 0),
  //             balance: data.enrollment?.group?.group_type === "double"
  //               ? (Number(data.enrollment?.group?.group_install) * Number(data?.auction?.auctionCount) +
  //                 Number(data.enrollment?.group?.group_install) -
  //                 Number(data.payments?.totalPaidAmount) || 0)
  //               : (Number(data.payments?.totalPayable) +
  //                 Number(data.enrollment?.group?.group_install) +
  //                 Number(data?.firstAuction?.firstDividentHead) -
  //                 Number(data?.payments?.totalPaidAmount) || 0),
  //             referredBy: data.payments?.collected_by
  //               ? data.payments.collected_by

  //                   : "N/A",
  //             enrollmentDate: data.enrollment?.createdAt
  //               ? new Date(data.enrollment.createdAt).toLocaleDateString()
  //               : "N/A"
  //           });
  //         }
  //       });
  //     }
  //   });

  //   return result;
  // };

  const processRawData = (rawData) => {
    let count = 0;
    const result = [];

    rawData.forEach((usrData) => {
      if (usrData?.data) {
        usrData.data.forEach((data) => {
          if (data?.enrollment?.group) {
            count++;

            const latestPaymentAmount = data.payments?.latestPaymentAmount || 0;
            const totalPaid = data.payments?.totalPaidAmount || 0;

            const totalPayable =
              data.enrollment?.group?.group_type === "double"
                ? Number(data.enrollment?.group?.group_install) *
                    Number(data?.auction?.auctionCount) +
                    Number(data.enrollment?.group?.group_install) || 0
                : Number(data.payments?.totalPayable) +
                    Number(data.enrollment?.group?.group_install) +
                    Number(data?.firstAuction?.firstDividentHead) || 0;

            const balance = totalPayable - totalPaid;

            // ✅ Status logic
            let status = "Not Paid";
            if (latestPaymentAmount > 0 || balance <= 0) {
              status = "Paid";
            }

            result.push({
              sl_no: count,
              _id: usrData._id,
              userName: usrData.userName,
              userPhone: usrData.phone_number,
              customerId: usrData.customer_id,
              amountPaid: totalPaid,
              paymentsTicket:
                data.enrollments?.tickets || data.payments?.ticket || 0,
              groupValue: data.enrollment?.group?.group_value || 0,
              groupName: data.enrollment?.group?.group_name || "",
              payment_type: data.enrollment?.payment_type || "",
              latestPaymentDate: data.payments?.latestPaymentDate || null,
              latestPaymentAmount: latestPaymentAmount,
              latestCollectedBy: data.payments?.latestCollectedBy || "N/A", 
              amountToBePaid: totalPayable,
              balance: balance,
              enrollmentDate: data.enrollment?.createdAt
                ? new Date(data.enrollment.createdAt).toLocaleDateString()
                : "N/A",
              status: status,
            });
          }
        });
      }
    });

    return result;
  };

const filteredData = useMemo(() => {
  const fromDate = payloads.from_date
    ? new Date(payloads.from_date).setHours(0, 0, 0, 0)
    : null;
  const toDate = payloads.to_date
    ? new Date(payloads.to_date).setHours(23, 59, 59, 999)
    : null;

  return usersData
    .filter((item) => {
      const matchPaymentType = payloads.payment_type
        ? item.payment_type === payloads.payment_type
        : true;
      return matchPaymentType && filterOption([item], searchText).length > 0;
    })
    .map((item) => {
      const updatedItem = { ...item };

      const paymentDate = item.latestPaymentDate
        ? new Date(item.latestPaymentDate).setHours(0, 0, 0, 0)
        : null;

      let isFilteredOut = false;

      if (
        (fromDate && (!paymentDate || paymentDate < fromDate)) ||
        (toDate && paymentDate > toDate)
      ) {
        updatedItem.latestPaymentAmount = 0;
        updatedItem.latestPaymentDate = payloads.from_date;
        isFilteredOut = true;
      }

      const balance =
        Number(updatedItem.amountToBePaid) - Number(updatedItem.amountPaid);
      const latest = Number(updatedItem.latestPaymentAmount);

      // ✅ Final payment status logic with new condition
      let status = "Not Paid";
      if (latest > 0 && balance <= 0) status = "Paid";
      else if (latest > 0 && balance > 0) status = "Paid";
      else if (latest === 0 && balance < 0) status = "Paid"; // ✅ NEW condition
      else if (latest === 0 && balance >= 0) status = "Not Paid";

      // ✅ In filters, hide collectedBy if no real payment
      if (isFilteredOut && latest === 0) {
        updatedItem.latestCollectedBy = "N/A";
      }

      updatedItem.status = status;
      return updatedItem;
    });
}, [usersData, payloads, searchText]);




  const handleSelectFilter = (value) => {
    setSelectedLabel(value);
    setShowFilterField(false);
    const today = new Date();
    const formatDate = (date) => date.toISOString().split("T")[0];

    switch (value) {
      case "Today": {
        const dateStr = formatDate(today);
        setPayloads((prev) => ({
          ...prev,
          from_date: dateStr,
          to_date: dateStr,
        }));
        break;
      }
      case "Yesterday": {
        const yest = new Date(today);
        yest.setDate(today.getDate() - 1);
        const dateStr = formatDate(yest);
        setPayloads((prev) => ({
          ...prev,
          from_date: dateStr,
          to_date: dateStr,
        }));
        break;
      }
      case "ThisMonth": {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setPayloads((prev) => ({
          ...prev,
          from_date: formatDate(start),
          to_date: formatDate(end),
        }));
        break;
      }
      case "LastMonth": {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        setPayloads((prev) => ({
          ...prev,
          from_date: formatDate(start),
          to_date: formatDate(end),
        }));
        break;
      }
      case "ThisWeek": {
        const start = new Date(today);
        const diff = start.getDay() === 0 ? -6 : 1 - start.getDay();
        start.setDate(start.getDate() + diff);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        setPayloads((prev) => ({
          ...prev,
          from_date: formatDate(start),
          to_date: formatDate(end),
        }));
        break;
      }
      case "LastWeek": {
        const start = new Date(today);
        const diff = start.getDay() === 0 ? -6 : 1 - start.getDay();
        start.setDate(start.getDate() + diff - 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        setPayloads((prev) => ({
          ...prev,
          from_date: formatDate(start),
          to_date: formatDate(end),
        }));
        break;
      }
      case "ThisYear": {
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear(), 11, 31);
        setPayloads((prev) => ({
          ...prev,
          from_date: formatDate(start),
          to_date: formatDate(end),
        }));
        break;
      }
      case "All": {
        const start = new Date(2000, 0, 1);
        const end = new Date(today);
        setPayloads((prev) => ({
          ...prev,
          from_date: formatDate(start),
          to_date: formatDate(end),
        }));
        break;
      }
      case "Custom":
        setShowFilterField(true);
        break;
    }
  };

  const handlePaymentTypeChange = (value) => {
    setPayloads((prev) => ({ ...prev, payment_type: value }));
  };

  const Auctioncolumns = [
    { key: "sl_no", header: "SL. NO" },
    {
      key: "latestPaymentDate",
      header: "Payment Date",
      render: (row) =>
        row.latestPaymentDate
          ? new Date(row.latestPaymentDate).toLocaleDateString()
          : "N/A",
    },
    { key: "userName", header: "Customer Name" },
    { key: "userPhone", header: "Phone Number" },
    { key: "groupName", header: "Group Name" },
    { key: "groupValue", header: "Group Value" },
    { key: "payment_type", header: "Payment Type" },
    { key: "paymentsTicket", header: "Ticket" },
    {
      key: "latestPaymentAmount",
      header: "Latest Amount",
      render: (row) =>
        Number(row.latestPaymentAmount) === 0
          ? "Not Paid"
          : row.latestPaymentAmount,
    },
    { key: "amountToBePaid", header: "Amount To be Paid" },
    { key: "amountPaid", header: "Amount Paid" },
    { key: "balance", header: "Balance" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-white ${
            row.status === "Paid" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    { key: "latestCollectedBy", header: "Collected By" },
  ];

  return (
    <div className="w-screen">
      <div className="flex mt-30">
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        {isLoading ? (
          <div className="w-full">
            <CircularLoader color="text-green-600" />
          </div>
        ) : (
          <div className="flex-grow p-7">
            <h1 className="text-2xl font-bold text-center">
              Reports - Payment Summary
            </h1>
            <div className="mt-6 mb-8">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="mb-2">
                  <label>Filter Option</label>
                  <Select
                    showSearch
                    popupMatchSelectWidth={false}
                    onChange={handleSelectFilter}
                    value={selectedLabel || undefined}
                    placeholder="Search Or Select Filter"
                    className="w-full max-w-xs h-11"
                  >
                    {[
                      { value: "All", label: "All" },
                      { value: "Today", label: "Today" },
                      { value: "Yesterday", label: "Yesterday" },
                      { value: "ThisWeek", label: "This Week" },
                      { value: "LastWeek", label: "Last Week" },
                      { value: "ThisMonth", label: "This Month" },
                      { value: "LastMonth", label: "Last Month" },
                      { value: "ThisYear", label: "This Year" },
                      { value: "Custom", label: "Custom" },
                    ].map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {showFilterField && (
                  <>
                    <div className="mb-2">
                      <label>From Date</label>
                      <input
                        type="date"
                        value={payloads.from_date}
                        onChange={(e) =>
                          setPayloads((prev) => ({
                            ...prev,
                            from_date: e.target.value,
                          }))
                        }
                        className="w-full max-w-xs h-11 rounded-md"
                      />
                    </div>
                    <div className="mb-2">
                      <label>To Date</label>
                      <input
                        type="date"
                        value={payloads.to_date}
                        onChange={(e) =>
                          setPayloads((prev) => ({
                            ...prev,
                            to_date: e.target.value,
                          }))
                        }
                        className="w-full max-w-xs h-11 rounded-md"
                      />
                    </div>
                  </>
                )}

                <div className="mb-2">
                  <label>Payment Type</label>
                  <Select
                    showSearch
                    popupMatchSelectWidth={false}
                    placeholder="Search Or Select Payment Type"
                    className="w-full max-w-xs h-11"
                    value={payloads.payment_type || undefined}
                    onChange={handlePaymentTypeChange}
                  >
                    <Select.Option value="">All</Select.Option>
                    {["Daily", "Weekly", "Monthly"].map((type) => (
                      <Select.Option key={type} value={type}>
                        {type}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>

              <DataTable
                data={filteredData}
                columns={Auctioncolumns}
                exportedFileName={`PaymentSummaryReport.csv`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSummary;
