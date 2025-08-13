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
//     from_date: "",
//     to_date: "",
//     payment_type: "",
//   });
//   const [selectedLabel, setSelectedLabel] = useState("");
//   const [showFilterField, setShowFilterField] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const reportResponse = await api.get("/user/get-daily-payments");
//         const processedData = processRawData(reportResponse.data);
//         setUsersData(processedData);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const processRawData = (rawData) => {
//     let count = 0;
//     const result = [];

//     rawData.forEach((usrData) => {
//       if (usrData?.data) {
//         usrData.data.forEach((data) => {
//           if (data?.enrollment?.group) {
//             count++;

//             const latestPaymentAmount = data.payments?.latestPaymentAmount || 0;
//             const totalPaid = data.payments?.totalPaidAmount || 0;

//             const totalPayable =
//               data.enrollment?.group?.group_type === "double"
//                 ? Number(data.enrollment?.group?.group_install) *
//                     Number(data?.auction?.auctionCount) +
//                     Number(data.enrollment?.group?.group_install) || 0
//                 : Number(data.payments?.totalPayable) +
//                     Number(data.enrollment?.group?.group_install) +
//                     Number(data?.firstAuction?.firstDividentHead) || 0;

//             const balance = totalPayable - totalPaid;

//             // ✅ Status logic
//             let status = "Not Paid";
//             if (latestPaymentAmount > 0 || balance <= 0) {
//               status = "Paid";
//             }

//             result.push({
//               sl_no: count,
//               _id: usrData._id,
//               userName: usrData.userName,
//               userPhone: usrData.phone_number,
//               customerId: usrData.customer_id,
//               amountPaid: totalPaid,
//               paymentsTicket:
//                 data.enrollments?.tickets || data.payments?.ticket || 0,
//               groupValue: data.enrollment?.group?.group_value || 0,
//               groupName: data.enrollment?.group?.group_name || "",
//               payment_type: data.enrollment?.payment_type || "",
//               latestPaymentDate: data.payments?.latestPaymentDate || null,
//               latestPaymentAmount: latestPaymentAmount,
//               latestCollectedBy: data.payments?.latestCollectedBy || "N/A",
//               amountToBePaid: totalPayable,
//               balance: balance,
//               enrollmentDate: data.enrollment?.createdAt
//                 ? new Date(data.enrollment.createdAt).toLocaleDateString()
//                 : "N/A",
//               status: status,
//             });
//           }
//         });
//       }
//     });

//     return result;
//   };

//   const filteredData = useMemo(() => {
//     const fromDate = payloads.from_date
//       ? new Date(payloads.from_date).setHours(0, 0, 0, 0)
//       : null;
//     const toDate = payloads.to_date
//       ? new Date(payloads.to_date).setHours(23, 59, 59, 999)
//       : null;

//     return usersData
//       .filter((item) => {
//         const matchPaymentType = payloads.payment_type
//           ? item.payment_type === payloads.payment_type
//           : true;
//         return matchPaymentType && filterOption([item], searchText).length > 0;
//       })
//       .map((item) => {
//         const updatedItem = { ...item };

//         const paymentDate = item.latestPaymentDate
//           ? new Date(item.latestPaymentDate).setHours(0, 0, 0, 0)
//           : null;

//         let isFilteredOut = false;

//         if (
//           (fromDate && (!paymentDate || paymentDate < fromDate)) ||
//           (toDate && paymentDate > toDate)
//         ) {
//           updatedItem.latestPaymentAmount = 0;
//           updatedItem.latestPaymentDate = payloads.from_date;
//           isFilteredOut = true;
//         }

//         const balance =
//           Number(updatedItem.amountToBePaid) - Number(updatedItem.amountPaid);
//         const latest = Number(updatedItem.latestPaymentAmount);

//         // ✅ Final payment status logic with new condition
//         let status = "Not Paid";
//         if (latest > 0 && balance <= 0) status = "Paid";
//         else if (latest > 0 && balance > 0) status = "Paid";
//         else if (latest === 0 && balance < 0)
//           status = "Paid"; // ✅ NEW condition
//         else if (latest === 0 && balance >= 0) status = "Not Paid";

//         // ✅ In filters, hide collectedBy if no real payment
//         if (isFilteredOut && latest === 0) {
//           updatedItem.latestCollectedBy = "N/A";
//         }

//         updatedItem.status = status;
//         return updatedItem;
//       });
//   }, [usersData, payloads, searchText]);

//   const handleSelectFilter = (value) => {
//     setSelectedLabel(value);
//     setShowFilterField(false);
//     const today = new Date();
//     const formatDate = (date) => date.toISOString().split("T")[0];

//     switch (value) {
//       case "Today": {
//         const dateStr = formatDate(today);
//         setPayloads((prev) => ({
//           ...prev,
//           from_date: dateStr,
//           to_date: dateStr,
//         }));
//         break;
//       }
//       case "Yesterday": {
//         const yest = new Date(today);
//         yest.setDate(today.getDate() - 1);
//         const dateStr = formatDate(yest);
//         setPayloads((prev) => ({
//           ...prev,
//           from_date: dateStr,
//           to_date: dateStr,
//         }));
//         break;
//       }
//       case "ThisMonth": {
//         const start = new Date(today.getFullYear(), today.getMonth(), 1);
//         const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//         setPayloads((prev) => ({
//           ...prev,
//           from_date: formatDate(start),
//           to_date: formatDate(end),
//         }));
//         break;
//       }
//       case "LastMonth": {
//         const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//         const end = new Date(today.getFullYear(), today.getMonth(), 0);
//         setPayloads((prev) => ({
//           ...prev,
//           from_date: formatDate(start),
//           to_date: formatDate(end),
//         }));
//         break;
//       }
//       case "ThisWeek": {
//         const start = new Date(today);
//         const diff = start.getDay() === 0 ? -6 : 1 - start.getDay();
//         start.setDate(start.getDate() + diff);
//         const end = new Date(start);
//         end.setDate(start.getDate() + 6);
//         setPayloads((prev) => ({
//           ...prev,
//           from_date: formatDate(start),
//           to_date: formatDate(end),
//         }));
//         break;
//       }
//       case "LastWeek": {
//         const start = new Date(today);
//         const diff = start.getDay() === 0 ? -6 : 1 - start.getDay();
//         start.setDate(start.getDate() + diff - 7);
//         const end = new Date(start);
//         end.setDate(start.getDate() + 6);
//         setPayloads((prev) => ({
//           ...prev,
//           from_date: formatDate(start),
//           to_date: formatDate(end),
//         }));
//         break;
//       }
//       case "ThisYear": {
//         const start = new Date(today.getFullYear(), 0, 1);
//         const end = new Date(today.getFullYear(), 11, 31);
//         setPayloads((prev) => ({
//           ...prev,
//           from_date: formatDate(start),
//           to_date: formatDate(end),
//         }));
//         break;
//       }
//       case "All": {
//         const start = new Date(2000, 0, 1);
//         const end = new Date(today);
//         setPayloads((prev) => ({
//           ...prev,
//           from_date: formatDate(start),
//           to_date: formatDate(end),
//         }));
//         break;
//       }
//       case "Custom":
//         setShowFilterField(true);
//         break;
//     }
//   };

//   const handlePaymentTypeChange = (value) => {
//     setPayloads((prev) => ({ ...prev, payment_type: value }));
//   };

//   const Auctioncolumns = [
//     { key: "sl_no", header: "SL. NO" },
//     {
//       key: "latestPaymentDate",
//       header: "Payment Date",
//       render: (row) =>
//         row.latestPaymentDate
//           ? new Date(row.latestPaymentDate).toLocaleDateString()
//           : "N/A",
//     },
//     { key: "userName", header: "Customer Name" },
//     { key: "userPhone", header: "Phone Number" },
//     { key: "groupName", header: "Group Name" },
//     { key: "groupValue", header: "Group Value" },
//     { key: "payment_type", header: "Payment Type" },
//     { key: "paymentsTicket", header: "Ticket" },
//     {
//       key: "latestPaymentAmount",
//       header: "Latest Amount",
//       render: (row) =>
//         Number(row.latestPaymentAmount) === 0
//           ? "Not Paid"
//           : row.latestPaymentAmount,
//     },
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
//                 <div className="mb-2">
//                   <label>Filter Option</label>
//                   <Select
//                     showSearch
//                     popupMatchSelectWidth={false}
//                     onChange={handleSelectFilter}
//                     value={selectedLabel || undefined}
//                     placeholder="Search Or Select Filter"
//                     className="w-full max-w-xs h-11"
//                   >
//                     {[
//                       { value: "All", label: "All" },
//                       { value: "Today", label: "Today" },
//                       { value: "Yesterday", label: "Yesterday" },
//                       { value: "ThisWeek", label: "This Week" },
//                       { value: "LastWeek", label: "Last Week" },
//                       { value: "ThisMonth", label: "This Month" },
//                       { value: "LastMonth", label: "Last Month" },
//                       { value: "ThisYear", label: "This Year" },
//                       { value: "Custom", label: "Custom" },
//                     ].map((option) => (
//                       <Select.Option key={option.value} value={option.value}>
//                         {option.label}
//                       </Select.Option>
//                     ))}
//                   </Select>
//                 </div>

//                 {showFilterField && (
//                   <>
//                     <div className="mb-2">
//                       <label>From Date</label>
//                       <input
//                         type="date"
//                         value={payloads.from_date}
//                         onChange={(e) =>
//                           setPayloads((prev) => ({
//                             ...prev,
//                             from_date: e.target.value,
//                           }))
//                         }
//                         className="w-full max-w-xs h-11 rounded-md"
//                       />
//                     </div>
//                     <div className="mb-2">
//                       <label>To Date</label>
//                       <input
//                         type="date"
//                         value={payloads.to_date}
//                         onChange={(e) =>
//                           setPayloads((prev) => ({
//                             ...prev,
//                             to_date: e.target.value,
//                           }))
//                         }
//                         className="w-full max-w-xs h-11 rounded-md"
//                       />
//                     </div>
//                   </>
//                 )}

//                 <div className="mb-2">
//                   <label>Payment Type</label>
//                   <Select
//                     showSearch
//                     popupMatchSelectWidth={false}
//                     placeholder="Search Or Select Payment Type"
//                     className="w-full max-w-xs h-11"
//                     value={payloads.payment_type || undefined}
//                     onChange={handlePaymentTypeChange}
//                   >
//                     <Select.Option value="">All</Select.Option>
//                     {["Daily", "Weekly", "Monthly"].map((type) => (
//                       <Select.Option key={type} value={type}>
//                         {type}
//                       </Select.Option>
//                     ))}
//                   </Select>
//                 </div>
//                 <div className="text-md font-semibold text-blue-700 mb-2">
//                   <label>Total Amount</label>
//                   <div>
//                     <input
//                       className="w-full max-w-xs h-11 rounded-md"
//                       readOnly
//                       value={`₹ ${filteredData
//                         .reduce(
//                           (sum, user) => sum + (user.latestPaymentAmount || 0),
//                           0
//                         )
//                         .toLocaleString("en-IN", {
//                           minimumFractionDigits: 2,
//                         })}`}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <DataTable
//                 data={filteredData}
//                 columns={Auctioncolumns}
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = {};
        if (payloads.pay_date) params.pay_date = payloads.pay_date;
        if (payloads.payment_type) params.payment_type = payloads.payment_type;

        const response = await api.get("/user/get-daily-payments", {
          params,
        });
        const rawData = response.data;

        let count = 0;
        const processed = [];

        rawData.forEach((usr) => {
          if (usr?.data) {
            usr.data.forEach((item) => {
              const enroll = item.enrollment;
              const pay = item.payments;
              const auction = item.auction;
              const firstAuction = item.firstAuction;

              if (enroll?.group) {
                count++;

                const latestAmount = pay?.latestPaymentAmount || 0;
                const totalPaid = pay?.totalPaidAmount || 0;

                const totalPayable =
                  enroll.group.group_type === "double"
                    ? Number(enroll.group.group_install) * Number(auction?.auctionCount || 0) +
                      Number(enroll.group.group_install)
                    : Number(pay.totalPayable) +
                      Number(enroll.group.group_install) +
                      Number(firstAuction?.firstDividentHead || 0);

                const balance = totalPayable - totalPaid;

                let status = "Not Paid";
                if (latestAmount > 0 || balance <= 0) {
                  status = "Paid";
                }

                processed.push({
                  sl_no: count,
                  _id: usr._id,
                  userName: usr.userName,
                  userPhone: usr.phone_number,
                  customerId: usr.customer_id,
                  groupName: enroll.group.group_name,
                  groupValue: enroll.group.group_value,
                  payment_type: enroll.payment_type,
                  paymentsTicket: pay.ticket || 0,
                  latestPaymentAmount: latestAmount,
                  latestPaymentDate: pay.latestPaymentDate,
                  latestCollectedBy: pay.latestCollectedBy || "N/A",
                  amountPaid: totalPaid,
                  amountToBePaid: totalPayable,
                  balance: balance,
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
    return usersData.filter((item) =>
      filterOption([item], searchText).length > 0
    );
  }, [usersData, searchText]);

  const handlePaymentTypeChange = (value) => {
    setPayloads((prev) => ({ ...prev, payment_type: value }));
  };

  const columns = [
    { key: "sl_no", header: "SL. NO" },
    { key: "latestPaymentDate", header: "Payment Date" },
    { key: "userName", header: "Customer Name" },
    { key: "userPhone", header: "Phone Number" },
    { key: "groupName", header: "Group Name" },
    { key: "groupValue", header: "Group Value" },
    { key: "payment_type", header: "Payment Type" },
    { key: "paymentsTicket", header: "Ticket" },
    { key: "latestPaymentAmount", header: "Latest Amount" },
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
                    {["Today", "Yesterday", "TwoDaysAgo", "Custom"].map((option) => (
                      <Select.Option key={option} value={option}>
                        {option}
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
                      onChange={(e) =>
                        setPayloads((prev) => ({
                          ...prev,
                          pay_date: e.target.value,
                        }))
                      }
                      className="w-full max-w-xs h-11 rounded-md"
                    />
                  </div>
                )}
                <div className="text-md font-semibold text-blue-700">
                  <label>Total Amount</label>
                  <input
                    readOnly
                    className="w-full max-w-xs h-11 rounded-md"
                    value={`₹ ${filteredData
                      .reduce((sum, u) => sum + (u.latestPaymentAmount || 0), 0)
                      .toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                  />
                </div>
              </div>
              <DataTable
                data={filteredData}
                columns={columns}
                exportedPdfName="Payment Summary Report"
                printHeaderKeys={["Total Amount Paid",]}
                printHeaderValues={[filteredData
                      .reduce((sum, u) => sum + (u.latestPaymentAmount || 0), 0)
                      .toLocaleString("en-IN", { minimumFractionDigits: 2 }),]}
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
