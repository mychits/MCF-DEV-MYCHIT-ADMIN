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
//   const [payloads, setPayloads] = useState({
//     pay_date: "",
//     payment_type: "",
//   });
//   const [selectedLabel, setSelectedLabel] = useState("");
//   const [showFilterField, setShowFilterField] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const params = {};
//         if (payloads.pay_date) params.pay_date = payloads.pay_date;
//         if (payloads.payment_type) params.payment_type = payloads.payment_type;

//         const response = await api.get("/user/get-daily-payments", {
//           params,
//         });
//         const rawData = response.data;

//         let count = 0;
//         const processed = [];

//         rawData.forEach((usr) => {
//           if (usr?.data) {
//             usr.data.forEach((item) => {
//               const enroll = item.enrollment;
//               const pay = item.payments;
//               const auction = item.auction;
//               const firstAuction = item.firstAuction;

//               if (enroll?.group) {
//                 count++;

//                 const latestAmount = pay?.latestPaymentAmount || 0;
//                 const totalPaid = pay?.totalPaidAmount || 0;

//                 const totalPayable =
//                   enroll.group.group_type === "double"
//                     ? Number(enroll.group.group_install) * Number(auction?.auctionCount || 0) +
//                       Number(enroll.group.group_install)
//                     : Number(pay.totalPayable) +
//                       Number(enroll.group.group_install) +
//                       Number(firstAuction?.firstDividentHead || 0);

//                 const balance = totalPayable - totalPaid;

//                 let status = "Not Paid";
//                 if (latestAmount > 0 || balance <= 0) {
//                   status = "Paid";
//                 }

//                 processed.push({
//                   sl_no: count,
//                   _id: usr._id,
//                   userName: usr.userName,
//                   userPhone: usr.phone_number,
//                   customerId: usr.customer_id,
//                   groupName: enroll.group.group_name,
//                   groupValue: enroll.group.group_value,
//                   payment_type: enroll.payment_type,
//                   paymentsTicket: pay.ticket || 0,
//                   latestPaymentAmount: latestAmount,
//                   latestPaymentDate: pay.latestPaymentDate,
//                   latestCollectedBy: pay.latestCollectedBy || "N/A",
//                   amountPaid: totalPaid,
//                   amountToBePaid: totalPayable,
//                   balance: balance,
//                   status,
//                 });
//               }
//             });
//           }
//         });

//         setUsersData(processed);
//       } catch (error) {
//         console.error("Error fetching report:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, [payloads]);

//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);
//     setShowFilterField(false);
//     const today = new Date();
//     const formatDate = (date) => date.toISOString().split("T")[0];

//     switch (value) {
//       case "Today":
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(today) }));
//         break;
//       case "Yesterday":
//         const yest = new Date(today);
//         yest.setDate(today.getDate() - 1);
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(yest) }));
//         break;
//       case "TwoDaysAgo":
//         const twoDays = new Date(today);
//         twoDays.setDate(today.getDate() - 2);
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(twoDays) }));
//         break;
//       case "Custom":
//         setShowFilterField(true);
//         break;
//       default:
//         setPayloads((prev) => ({ ...prev, pay_date: "" }));
//     }
//   };

//   const filteredData = useMemo(() => {
//     return usersData.filter((item) =>
//       filterOption([item], searchText).length > 0
//     );
//   }, [usersData, searchText]);

//   const handlePaymentTypeChange = (value) => {
//     setPayloads((prev) => ({ ...prev, payment_type: value }));
//   };

//   const columns = [
//     { key: "sl_no", header: "SL. NO" },
//     { key: "latestPaymentDate", header: "Payment Date" },
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
//       key: "status",
//       header: "Status",
//       render: (row) => (
//         <span
//           className={`px-3 py-1 rounded-full text-white ${
//             row.status === "Paid" ? "bg-green-500" : "bg-red-500"
//           }`}
//         >
//           {row.status}
//         </span>
//       ),
//     },
//     { key: "latestCollectedBy", header: "Collected By" },
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
//               <div className="flex flex-wrap items-center gap-4 mb-6">
//                 <div>
//                   <label>Filter Date</label>
//                   <Select
//                     showSearch
//                     popupMatchSelectWidth={false}
//                     onChange={handleSelectFilter}
//                     value={selectedLabel || undefined}
//                     placeholder="Select Date"
//                     className="w-full max-w-xs h-11"
//                   >
//                     {["Today", "Yesterday", "TwoDaysAgo", "Custom"].map((option) => (
//                       <Select.Option key={option} value={option}>
//                         {option}
//                       </Select.Option>
//                     ))}
//                   </Select>
//                 </div>
//                 {showFilterField && (
//                   <div>
//                     <label>Select Custom Date</label>
//                     <input
//                       type="date"
//                       value={payloads.pay_date}
//                       onChange={(e) =>
//                         setPayloads((prev) => ({
//                           ...prev,
//                           pay_date: e.target.value,
//                         }))
//                       }
//                       className="w-full max-w-xs h-11 rounded-md"
//                     />
//                   </div>
//                 )}
//                 <div className="text-md font-semibold text-blue-700">
//                   <label>Total Amount</label>
//                   <input
//                     readOnly
//                     className="w-full max-w-xs h-11 rounded-md"
//                     value={`₹ ${filteredData
//                       .reduce((sum, u) => sum + (u.latestPaymentAmount || 0), 0)
//                       .toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
//                   />
//                 </div>
//               </div>
//               <DataTable
//                 data={filteredData}
//                 columns={columns}
//                 exportedPdfName="Payment Summary Report"
//                 printHeaderKeys={["Total Amount Paid",]}
//                 printHeaderValues={[filteredData
//                       .reduce((sum, u) => sum + (u.latestPaymentAmount || 0), 0)
//                       .toLocaleString("en-IN", { minimumFractionDigits: 2 }),]}
//                 exportedFileName={`PaymentSummaryReport.csv`}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const PaymentSummary = () => {
//   const [searchText, setSearchText] = useState("");
//   const [usersData, setUsersData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [payloads, setPayloads] = useState({
//     pay_date: "",
//     payment_type: "",
//   });
//   const [selectedLabel, setSelectedLabel] = useState("");
//   const [showFilterField, setShowFilterField] = useState(false);

//   const option = [{ key: "Today", value: "Today"},
//                     {key: "Yesterday", value: "Yesterday"},
//                     {key: "TwoDaysAgo", value: "Two Days Ago"},
//                     {key: "Custom", value: "Custom"},
//   ]

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const params = {};
//         if (payloads.pay_date) params.pay_date = payloads.pay_date;
//         if (payloads.payment_type) params.payment_type = payloads.payment_type;

//         const response = await api.get("/user/get-daily-payments", {
//           params,
//         });
//         const rawData = response.data;

//         let count = 0;
//         const processed = [];

//         rawData.forEach((usr) => {
//           if (usr?.data) {
//             usr.data.forEach((item) => {
//               const enroll = item.enrollment;
//               const pay = item.payments;
//               const auction = item.auction;
//               const firstAuction = item.firstAuction;

//               if (enroll?.group) {
//                 count++;

//                 // **UPDATED:** Use totalPaidOnFilteredDate for the daily sum
//                 const dailyPaymentTotal = pay?.totalPaidOnFilteredDate || 0;
//                 // latestPaymentAmount is the amount of the single 'latest' transaction
//                 const latestAmount = pay?.latestPaymentAmount || 0;
//                 const totalPaid = pay?.totalPaidAmount || 0;

//                 const totalPayable =
//                   enroll.group.group_type === "double"
//                     ? Number(enroll.group.group_install) *
//                         Number(auction?.auctionCount || 0) +
//                       Number(enroll.group.group_install)
//                     : Number(pay.totalPayable) +
//                       Number(enroll.group.group_install) +
//                       Number(firstAuction?.firstDividentHead || 0);

//                 const balance = totalPayable - totalPaid;

//                 let status = "Not Paid";
//                 // **LOGIC UPDATE:** Use dailyPaymentTotal instead of latestAmount for daily payment check
//                 if (dailyPaymentTotal > 0 || balance <= 0) {
//                   status = "Paid";
//                 }

//                 processed.push({
//                   sl_no: count,
//                   _id: usr._id,
//                   userName: usr.userName,
//                   userPhone: usr.phone_number,
//                   customerId: usr.customer_id,
//                   groupName: enroll.group.group_name,
//                   groupValue: enroll.group.group_value,
//                   payment_type: enroll.payment_type,
//                   paymentsTicket: pay.ticket || 0,

//                   // **NEW FIELD** for the sum of all payments on the filtered date
//                   dailyPaymentTotal: dailyPaymentTotal,

//                   // Keep latestPaymentAmount for the individual transaction amount
//                   latestPaymentAmount: latestAmount,

//                   latestPaymentDate: pay.latestPaymentDate,
//                   latestCollectedBy: pay.latestCollectedBy || "N/A",
//                   amountPaid: totalPaid,
//                   amountToBePaid: totalPayable,
//                   balance: balance,
//                   status,
//                 });
//               }
//             });
//           }
//         });

//         setUsersData(processed);
//       } catch (error) {
//         console.error("Error fetching report:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, [payloads]);

//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);
//     setShowFilterField(false);
//     const today = new Date();
//     const formatDate = (date) => date.toISOString().split("T")[0];

//     switch (value) {
//       case "Today":
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(today) }));
//         break;
//       case "Yesterday":
//         const yest = new Date(today);
//         yest.setDate(today.getDate() - 1);
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(yest) }));
//         break;
//       case "TwoDaysAgo":
//         const twoDays = new Date(today);
//         twoDays.setDate(today.getDate() - 2);
//         setPayloads((prev) => ({ ...prev, pay_date: formatDate(twoDays) }));
//         break;
//       case "Custom":
//         setShowFilterField(true);
//         break;
//       default:
//         setPayloads((prev) => ({ ...prev, pay_date: "" }));
//     }
//   };

//   const filteredData = useMemo(() => {
//     return usersData.filter(
//       (item) => filterOption([item], searchText).length > 0
//     );
//   }, [usersData, searchText]);

//   const handlePaymentTypeChange = (value) => {
//     setPayloads((prev) => ({ ...prev, payment_type: value }));
//   };

//   const columns = [
//     { key: "sl_no", header: "SL. NO" },
//     { key: "latestPaymentDate", header: "Payment Date" },
//     { key: "userName", header: "Customer Name" },
//     { key: "userPhone", header: "Phone Number" },
//     { key: "groupName", header: "Group Name" },
//     { key: "groupValue", header: "Group Value" },
//     { key: "payment_type", header: "Payment Type" },
//     { key: "paymentsTicket", header: "Ticket" },

//     { key: "dailyPaymentTotal", header: "Daily Total Paid" },

//     { key: "latestPaymentAmount", header: "Latest Amount" },

//     { key: "amountToBePaid", header: "Amount To be Paid" },
//     { key: "amountPaid", header: "Total Paid (All-Time)" },
//     { key: "balance", header: "Balance" },
//     {
//       key: "status",
//       header: "Status",
//       render: (row) => (
//         <span
//           className={`px-3 py-1 rounded-full text-white ${
//             row.status === "Paid" ? "bg-green-500" : "bg-red-500"
//           }`}
//         >
//           {row.status}
//         </span>
//       ),
//     },
//     { key: "latestCollectedBy", header: "Collected By" },
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
//               <div className="flex flex-wrap items-center gap-4 mb-6">
//                 <div>
//                   <label>Filter Date</label>
//                   <Select
//                     showSearch
//                     popupMatchSelectWidth={false}
//                     onChange={handleSelectFilter}
//                     value={selectedLabel || undefined}
//                     placeholder="Select Date"
//                     className="w-full max-w-xs h-11"
//                   >
//                     {option.map(
//                       (option) => (
//                         <Select.Option key={option.key} value={option.key}>
//                           {option.value}
//                         </Select.Option>
//                       )
//                     )}
//                   </Select>
//                 </div>
//                 {showFilterField && (
//                   <div>
//                     <label>Select Custom Date</label>
//                     <input
//                       type="date"
//                       value={payloads.pay_date}
//                       onChange={(e) =>
//                         setPayloads((prev) => ({
//                           ...prev,
//                           pay_date: e.target.value,
//                         }))
//                       }
//                       className="w-full max-w-xs h-11 rounded-md"
//                     />
//                   </div>
//                 )}
//                 <div className="text-md font-semibold text-blue-700">
//                   <label>Total Amount (Filtered Date)</label>
//                   <input
//                     readOnly
//                     className="w-full max-w-xs h-11 rounded-md"
                   
//                     value={`₹ ${filteredData
//                       .reduce((sum, u) => sum + (u.dailyPaymentTotal || 0), 0)
//                       .toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
//                   />
//                 </div>
//               </div>
//               <DataTable
//                 data={filteredData}
//                 columns={columns}
//                 exportedPdfName="Payment Summary Report"
//                 printHeaderKeys={["Total Amount Paid (Filtered Date)"]}
//                 printHeaderValues={[
//                   filteredData
//                     .reduce((sum, u) => sum + (u.dailyPaymentTotal || 0), 0)
//                     .toLocaleString("en-IN", { minimumFractionDigits: 2 }),
//                 ]}
//                 exportedFileName={`PaymentSummaryReport.csv`}
//               />
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
    pay_date: "",
    payment_type: "",
  });
  const [selectedLabel, setSelectedLabel] = useState("");
  const [showFilterField, setShowFilterField] = useState(false);

  const option = [
    { key: "Today", value: "Today" },
    { key: "Yesterday", value: "Yesterday" },
    { key: "TwoDaysAgo", value: "Two Days Ago" },
    { key: "Custom", value: "Custom" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = {};
        if (payloads.pay_date) params.pay_date = payloads.pay_date;
        if (payloads.payment_type) params.payment_type = payloads.payment_type;

        const response = await api.get("/user/get-daily-payments", { params });
        const rawData = response.data;

        let count = 0;
        const processed = [];

        rawData.forEach((usr) => {
          if (usr?.data) {
            usr.data.forEach((item) => {
              const enroll = item.enrollment;
              const pay = item.payments || {};
              const auction = item.auction || {};
              const firstAuction = item.firstAuction || {};

              // increment row number for every record (group or loan)
              count++;

              if (enroll?.type === "Group") {
                const dailyPaymentTotal = pay?.totalPaidOnFilteredDate || 0;
                const latestAmount = pay?.latestPaymentAmount || 0;
                const totalPaid = pay?.totalPaidAmount || 0;

                // derive totalPayable from returned payments.totalPayable (preferred) else compute
                let totalPayable = Number(pay.totalPayable || 0);
                if (!totalPayable) {
                  // compute using group + auction info (fallback)
                  const groupInstall = Number(enroll.group?.group_install || 0);
                  const auctionCount = Number(auction?.auctionCount || 0);
                  const firstDiv = Number(firstAuction?.firstDividentHead || 0);
                  if (enroll.group?.group_type === "double") {
                    totalPayable = groupInstall * auctionCount + groupInstall;
                  } else {
                    totalPayable = Number(auction?.totalPayable || 0) + groupInstall + firstDiv;
                  }
                }

                const balance = totalPayable - totalPaid;
                let status = "Not Paid";
                if (dailyPaymentTotal > 0 || balance <= 0) status = "Paid";

                processed.push({
                  sl_no: count,
                  _id: usr._id,
                  userName: usr.userName,
                  userPhone: usr.phone_number,
                  customerId: usr.customer_id,
                  recordType: "Group",
                  groupName: enroll.group?.group_name || "-",
                  groupValue: enroll.group?.group_value || "-",
                  payment_type: enroll.payment_type,
                  paymentsTicket: pay.ticket || enroll.tickets || "-",
                  dailyPaymentTotal,
                  latestPaymentAmount: latestAmount,
                  latestPaymentDate: pay.latestPaymentDate || null,
                  latestCollectedBy: pay.latestCollectedBy || "N/A",
                  amountPaid: totalPaid,
                  amountToBePaid: totalPayable,
                  balance,
                  status,
                });
              } else if (enroll?.type === "Loan") {
                const dailyPaymentTotal = pay?.totalPaidOnFilteredDate || 0;
                const latestAmount = pay?.latestPaymentAmount || 0;
                const totalPaid = pay?.totalPaidAmount || 0;
                // backend sets payments.totalPayable for loans, fallback to loan_amount + service_charges
                const totalPayable =
                  Number(pay.totalPayable || 0) ||
                  (Number(enroll.loan_amount || 0) + Number(enroll.service_charges || 0));
                const balance = Number(pay.balance ?? (totalPayable - totalPaid));

                let status = "Not Paid";
                if (dailyPaymentTotal > 0 || balance <= 0) status = "Paid";

                processed.push({
                  sl_no: count,
                  _id: usr._id,
                  userName: usr.userName,
                  userPhone: usr.phone_number,
                  customerId: usr.customer_id,
                  recordType: "Loan",
                  loanId: enroll.loan_id,
                  groupName: `Loan: ${enroll.loan_id}`,
                  groupValue: enroll.loan_amount,
                  loanAmount: enroll.loan_amount,
                  tenure: enroll.tenure,
                  service_charges: enroll.service_charges,
                  payment_type: "Loan",
                  paymentsTicket: "-",
                  dailyPaymentTotal,
                  latestPaymentAmount: latestAmount,
                  latestPaymentDate: pay.latestPaymentDate || null,
                  latestCollectedBy: pay.latestCollectedBy || "N/A",
                  amountPaid: totalPaid,
                  amountToBePaid: totalPayable,
                  balance,
                  status,
                });
              }
            });
          }
        });

        setUsersData(processed);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [payloads]);

  const handleSelectFilter = (value) => {
    setSelectedLabel(value);
    setShowFilterField(false);
    const today = new Date();
    const formatDate = (date) => date.toISOString().split("T")[0];

    switch (value) {
      case "Today":
        setPayloads((prev) => ({ ...prev, pay_date: formatDate(today) }));
        break;
      case "Yesterday":
        const yest = new Date(today);
        yest.setDate(today.getDate() - 1);
        setPayloads((prev) => ({ ...prev, pay_date: formatDate(yest) }));
        break;
      case "TwoDaysAgo":
        const twoDays = new Date(today);
        twoDays.setDate(today.getDate() - 2);
        setPayloads((prev) => ({ ...prev, pay_date: formatDate(twoDays) }));
        break;
      case "Custom":
        setShowFilterField(true);
        break;
      default:
        setPayloads((prev) => ({ ...prev, pay_date: "" }));
    }
  };

  const filteredData = useMemo(() => {
    return usersData.filter((item) => filterOption([item], searchText).length > 0);
  }, [usersData, searchText]);

  const handlePaymentTypeChange = (value) => {
    setPayloads((prev) => ({ ...prev, payment_type: value }));
  };

  const columns = [
    { key: "sl_no", header: "SL. NO" },
    { key: "latestPaymentDate", header: "Payment Date" },
    { key: "userName", header: "Customer Name" },
    { key: "userPhone", header: "Phone Number" },
    // { key: "recordType", header: "Record Type" },
    { key: "groupName", header: "Group / Loan" },
    { key: "groupValue", header: "Group Value " },
  //  { key: "loanAmount", header: "Loan Amount" },
    { key: "payment_type", header: "Payment Type" },
    { key: "paymentsTicket", header: "Ticket" },
    { key: "dailyPaymentTotal", header: "Daily Total Paid" },
    { key: "latestPaymentAmount", header: "Latest Amount" },
    { key: "amountToBePaid", header: "Amount To be Paid" },
    { key: "amountPaid", header: "Total Paid (All-Time)" },
    { key: "balance", header: "Balance" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-white ${row.status === "Paid" ? "bg-green-500" : "bg-red-500"}`}>
          {row.status}
        </span>
      ),
    },
    { key: "latestCollectedBy", header: "Collected By" },
  ];

  return (
    <div className="w-screen">
      <div className="flex mt-30">
        <Navbar onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)} visibility={true} />
        {isLoading ? (
          <div className="w-full">
            <CircularLoader color="text-green-600" />
          </div>
        ) : (
          <div className="flex-grow p-7">
            <h1 className="text-2xl font-bold text-center">Reports - Payment Summary</h1>
            <div className="mt-6 mb-8">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div>
                  <label>Filter Date</label>
                  <Select
                    showSearch
                    popupMatchSelectWidth={false}
                    onChange={handleSelectFilter}
                    value={selectedLabel || undefined}
                    placeholder="Select Date"
                    className="w-full max-w-xs h-11"
                  >
                    {option.map((option) => (
                      <Select.Option key={option.key} value={option.key}>
                        {option.value}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                {showFilterField && (
                  <div>
                    <label>Select Custom Date</label>
                    <input
                      type="date"
                      value={payloads.pay_date}
                      onChange={(e) => setPayloads((prev) => ({ ...prev, pay_date: e.target.value }))}
                      className="w-full max-w-xs h-11 rounded-md"
                    />
                  </div>
                )}
                <div className="text-md font-semibold text-blue-700">
                  <label>Total Amount </label>
                  <input
                    readOnly
                    className="w-full max-w-xs h-11 rounded-md"
                    value={`₹ ${filteredData.reduce((sum, u) => sum + (u.dailyPaymentTotal || 0), 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}`}
                  />
                </div>
              </div>

              <DataTable
                data={filteredData}
                columns={columns}
                exportedPdfName="Payment Summary Report"
                printHeaderKeys={["Total Amount Paid (Filtered Date)"]}
                printHeaderValues={[
                  filteredData.reduce((sum, u) => sum + (u.dailyPaymentTotal || 0), 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  }),
                ]}
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
