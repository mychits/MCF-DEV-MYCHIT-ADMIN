import React, { useEffect, useState, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select } from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { FaWhatsapp } from "react-icons/fa";
import { notification } from "antd";
import { MdMarkEmailRead } from "react-icons/md";
// const OverDueMessage = () => {
//   const [searchText, setSearchText] = useState("");
//   const [usersData, setUsersData] = useState([]);
//   const [groupFilter, setGroupFilter] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [activeUserData, setActiveUserData] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [notifier, contextHolder] = notification.useNotification();

//   const groupOptions = [...new Set(usersData.map((u) => u.groupName))];

//   const filteredUsers = useMemo(() => {
//     const filtered = filterOption(
//       usersData.filter((u) => {
//         const matchGroup = groupFilter ? u.groupName === groupFilter : true;
//         const enrollmentDate = new Date(u.enrollmentDate);
//         const matchFromDate = fromDate
//           ? enrollmentDate >= new Date(fromDate)
//           : true;
//         const matchToDate = toDate ? enrollmentDate <= new Date(toDate) : true;
//         return matchGroup && matchFromDate && matchToDate;
//       }),
//       searchText
//     );

//     return filtered.map((user, index) => {
//       const isSelected = !!activeUserData[user._id]?.info?.status;

//       return {
//         ...user,
//         sl_no: index + 1,
//         checkBoxs: (
//           <input
//             type="checkbox"
//             checked={isSelected}
//             onChange={(e) => {
//               setActiveUserData((prev) => ({
//                 ...prev,
//                 [user._id]: {
//                   info: {
//                     status: e.target.checked,
//                     balance: user.balance,
//                     userPhone: user.userPhone,
//                     paymentsTicket: user.paymentsTicket,
//                     groupName: user.groupName,
//                     userName: user.userName,
//                     groupId: user.groupId,
//                     userId: user.userId,
//                     amountPaid: user.amountPaid,
//                     amountToBePaid: user.totalToBePaid,
//                   },
//                 },
//               }));
//             }}
//           />
//         ),
//         isSelected,
//       };
//     });
//   }, [usersData, groupFilter, fromDate, toDate, searchText, activeUserData]);

//   const visibleSelectedCount = useMemo(() => {
//     return filteredUsers.filter((user) => user.isSelected).length;
//   }, [filteredUsers]);

//   const sendWhatsapp = async () => {
//     const key = "updatable";
//     try {
//       notifier.open({
//         key,
//         message: "Sending Messages Via Whatsapp..",
//         description: "Processing...",
//         className: "bg-green-300 rounded-lg font-bold",
//         duration: 2,
//       });

//       const visibleActiveUsers = {};
//       filteredUsers.forEach((user) => {
//         if (user.isSelected && activeUserData[user._id]) {
//           visibleActiveUsers[user._id] = activeUserData[user._id];
//         }
//       });

//       await api.post("/whatsapp/over-due-message", visibleActiveUsers);

//       const newActiveUserData = { ...activeUserData };
//       filteredUsers.forEach((user) => {
//         if (user.isSelected) {
//           delete newActiveUserData[user._id];
//         }
//       });
//       setActiveUserData(newActiveUserData);

//       notifier.open({
//         key,
//         message: "Whatsapp Messages Has Been Sent Successfully",
//         description: "Success",
//         className: "bg-green-300 rounded-lg font-bold",
//         duration: 2,
//       });
//     } catch (err) {
//       notifier.open({
//         key,
//         message: "Failed to Send Whatsapp",
//         description: err.message || "Something went wrong",
//         className: "bg-red-300 rounded-lg font-bold",
//         duration: 2,
//       });
//     }
//   };

//  const fetchData = async () => {
//   try {
//     setIsLoading(true);
//     const reportResponse = await api.get("/user/get-overdue-payments");
//     const usersList = [];
//     const tempActive = {};

//     reportResponse.data.forEach((usrData) => {
//       if (usrData?.data?.length) {
//         usrData.data.forEach((entry, idx) => {
//           if (entry.latestPaymentAmount <= 0) return;

//           const id = `${usrData._id}-${entry.groupName}-${entry.ticket}`;
//           const userName = usrData.userName;
//           const userPhone = usrData.phone_number;
//           const customerId = usrData.customer_id;
//           const groupName = entry.groupName;
//           const paymentsTicket = entry.ticket;
//           const latestPaymentAmount = entry.latestPaymentAmount;
//           const latestPaymentDate = entry.latestPaymentDate;
//           const payment_type = entry.payment_type || "N/A";
//           const amountPaid = entry.latestPaymentAmount;
//           const totalToBePaid = entry.totalToBePaid; // 🔧 Or fetch from backend if available
//           const balance = totalToBePaid - amountPaid;

//           if (balance <= 0) return;

//           tempActive[id] = {
//             info: {
//               status: false,
//               balance,
//             },
//           };

//           usersList.push({
//             _id: id,
//             userName,
//             userPhone,
//             customerId,
//             groupName,
//             payment_type,
//             paymentsTicket,
//             latestPaymentAmount,
//             latestPaymentDate,
//             amountPaid,

//             balance,
//             groupId: null,
//             userId: usrData._id,
//           });
//         });
//       }
//     });

//     setUsersData(usersList);
//     setActiveUserData(tempActive);
//     setTotalUsers(usersList.length);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   } finally {
//     setIsLoading(false);
//   }
// };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const Auctioncolumns = [
//     { key: "sl_no", header: "SL. NO" },
//     { key: "userName", header: "Customer Name" },
//     { key: "userPhone", header: "Phone Number" },
//     { key: "customerId", header: "Customer Id" },
//     { key: "groupName", header: "Group Name" },
//     { key: "payment_type", header: "Payment Type" },
//     { key: "paymentsTicket", header: "Ticket" },
//     { key: "totalToBePaid", header: "Amount to be Paid" },
//     { key: "amountPaid", header: "Paid Amount" },
//     { key: "latestPaymentAmount", header: "Last Payment Amount" }, // ✅ NEW
//     {
//       key: "latestPaymentDate",
//       header: "Last Payment Date",
//       render: (value) =>
//         value ? new Date(value).toLocaleDateString("en-IN") : "N/A", // ✅ NEW
//     },
//     { key: "balance", header: "Balance" },
//     { key: "checkBoxs", header: "Select User" },
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
//               Whatsapp Over Due Messages
//             </h1>
//             {contextHolder}
//             <div className="mt-6 mb-8">
//               <div className="flex justify-start border-b border-gray-300 mb-4"></div>
//               <div className="mt-10">
//                 <div className="flex flex-wrap items-center gap-4 mb-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Group Filter
//                     </label>
//                     <Select
//                       style={{ width: 200 }}
//                       allowClear
//                       placeholder="--All groups--"
//                       onChange={(value) => setGroupFilter(value)}
//                       value={groupFilter || undefined}
//                     >
//                       {groupOptions.map((group) => (
//                         <Select.Option key={group} value={group}>
//                           {group}
//                         </Select.Option>
//                       ))}
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="flex justify-end mb-4">
//                   <button
//                     onClick={sendWhatsapp}
//                     className="relative bg-green-600 text-white px-4 py-2 rounded shadow-md hover:bg-green-700 transition duration-200 flex items-center"
//                   >
//                     {visibleSelectedCount > 0 && (
//                       <div
//                         className="min-w-6 h-6 absolute -right-3 -top-2 shadow-lg hover:bg-red-600 bg-red-400 rounded-full text-white flex items-center justify-center text-xs"
//                         title={`Message will be sent to total ${visibleSelectedCount} customers`}
//                       >
//                         <span>{visibleSelectedCount}</span>
//                       </div>
//                     )}
//                     <FaWhatsapp className="mr-2" size={20} />
//                     WhatsApp
//                   </button>
//                 </div>
//                 <DataTable
//                   data={filteredUsers}
//                   columns={Auctioncolumns}
//                   catcher="_id"
//                   exportedFileName={`CustomerReport.csv`}
//                 />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

const OverDueEmail = () => {
  const [searchText, setSearchText] = useState("");
  const [usersData, setUsersData] = useState([]);
  const [groupFilter, setGroupFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeUserData, setActiveUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [notifier, contextHolder] = notification.useNotification();

  const groupOptions = [...new Set(usersData.map((u) => u.groupName))];

  const filteredUsers = useMemo(() => {
    const filtered = filterOption(
      usersData.filter((u) => {
        const matchGroup = groupFilter ? u.groupName === groupFilter : true;
        const enrollmentDate = new Date(u.enrollmentDate);
        const matchFromDate = fromDate
          ? enrollmentDate >= new Date(fromDate)
          : true;
        const matchToDate = toDate ? enrollmentDate <= new Date(toDate) : true;
        return matchGroup && matchFromDate && matchToDate;
      }),
      searchText
    );

    return filtered.map((user, index) => {
      const isSelected = !!activeUserData[user._id]?.info?.status;

      return {
        ...user,
        sl_no: index + 1,
        checkBoxs: (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              setActiveUserData((prev) => ({
                ...prev,
                [user._id]: {
                  info: {
                    status: e.target.checked,
                    balance: user.balance,
                    userPhone: user.userPhone,
                    paymentsTicket: user.paymentsTicket,
                    groupName: user.groupName,
                    userName: user.userName,
                    groupId: user.groupId,
                    userId: user.userId,
                    amountPaid: user.amountPaid,
                    amountToBePaid: user.totalToBePaid,
                    userEmail: user.userEmail,
                    latestPaymentDate: user.latestPaymentDate, // ✅ added
                    latestPaymentAmount: user.latestPaymentAmount, // ✅ added
                    paymentType: user.payment_type, // ✅ added
                  },
                },
              }));
            }}
          />
        ),
        isSelected,
      };
    });
  }, [usersData, groupFilter, fromDate, toDate, searchText, activeUserData]);

  const visibleSelectedCount = useMemo(() => {
    return filteredUsers.filter((user) => user.isSelected).length;
  }, [filteredUsers]);

 const sendEmail = async () => {
  const key = "updatable";
  try {
    notifier.open({
      key,
      message: "Sending Emails..",
      description: "Processing...",
      className: "bg-blue-300 rounded-lg font-bold",
      duration: 2,
    });

    // Prepare selected users
    const selectedUsers = {};
    filteredUsers.forEach((user) => {
      if (user.isSelected && activeUserData[user._id]) {
        selectedUsers[user._id] = activeUserData[user._id];
      }
    });

    await api.post("/email/over-due-email", selectedUsers);

    // Cleanup after sending
    const updatedActiveUserData = { ...activeUserData };
    filteredUsers.forEach((user) => {
      if (user.isSelected) {
        delete updatedActiveUserData[user._id];
      }
    });
    setActiveUserData(updatedActiveUserData);

    notifier.open({
      key,
      message: "Emails Sent Successfully",
      description: "Success",
      className: "bg-green-300 rounded-lg font-bold",
      duration: 2,
    });
  } catch (err) {
    notifier.open({
      key,
      message: "Failed to Send Emails",
      description: err.message || "Something went wrong",
      className: "bg-red-300 rounded-lg font-bold",
      duration: 2,
    });
  }
};

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const reportResponse = await api.get("/user/get-overdue-payments");
      const usersList = [];
      const tempActive = {};

      reportResponse.data.forEach((usrData) => {
        if (usrData?.data) {
          usrData.data.forEach((data) => {
            if (data?.enrollment?.group) {
              const groupInstall = parseInt(
                data.enrollment.group.group_install
              );
              const groupId = data.enrollment.group._id;
              const groupType = data.enrollment.group.group_type;
              const totalPaidAmount = data.payments.totalPaidAmount;
              const auctionCount = parseInt(data?.auction?.auctionCount);
              const totalPayable = data.payable.totalPayable;
              const totalProfit = data.profit.totalProfit;
              const firstDividentHead = data.firstAuction.firstDividentHead;
              const id = data?.enrollment?._id;
              const userPhone = usrData.phone_number;
              const userEmail = usrData.email;
              const paymentsTicket = data.payments.ticket;
              const groupName = data.enrollment.group.group_name;

              // 🟡 CHANGE 1: Handle amountToBePaid and totalToBePaid consistently
              const totalToBePaid =
                groupType === "double"
                  ? groupInstall * auctionCount + groupInstall
                  : totalPayable + groupInstall + totalProfit;
              const amountToBePaid = totalToBePaid;

              const balance =
                groupType === "double"
                  ? totalToBePaid - totalPaidAmount
                  : totalPayable +
                    groupInstall +
                    firstDividentHead -
                    totalPaidAmount;

              if (balance <= 0) return;

              const userName = usrData.userName;

              // 🟡 CHANGE 2: New fields from latestPayment info
              const latestPaymentAmount = data.latestPaymentAmount || 0; // ⬅ Added for clarity
              const latestPaymentDate = data.latestPaymentDate || ""; // ⬅ Added for clarity

              tempActive[id] = {
                info: {
                  status: false,
                  balance,
                },
              };

              const tempUsr = {
                _id: id,
                userName,
                userPhone,
                userEmail,
                customerId: usrData.customer_id,
                amountPaid: totalPaidAmount,
                paymentsTicket,
                amountToBePaid,
                groupName,
                payment_type: data?.enrollment?.payment_type,
                totalToBePaid,
                balance,
                groupId: groupId,
                userId: usrData?._id,
                latestPaymentAmount, // ⬅ New field
                latestPaymentDate, // ⬅ New field
              };
              console.info("tempUsr", tempUsr);
              usersList.push(tempUsr);
            }
          });
        }
      });

      setUsersData(usersList);
      setActiveUserData(tempActive); // ✅ Match structure from second snippet
      setTotalUsers(usersList.length);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const Auctioncolumns = [
    { key: "sl_no", header: "SL. NO" },
    { key: "userName", header: "Customer Name" },
    { key: "userPhone", header: "Phone Number" },
    { key: "customerId", header: "Customer Id" },
    { key: "groupName", header: "Group Name" },
    {key: "userEmail", header: "Email"},
    { key: "payment_type", header: "Payment Type" },
    { key: "paymentsTicket", header: "Ticket" },
    { key: "totalToBePaid", header: "Amount to be Paid" },
    { key: "amountPaid", header: "Paid Amount" },
    { key: "latestPaymentAmount", header: "Last Payment Amount" }, // ✅ NEW
    {
      key: "latestPaymentDate",
      header: "Last Payment Date",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("en-IN") : "N/A", // ✅ NEW
    },
    { key: "balance", header: "Balance" },
    { key: "checkBoxs", header: "Select User" },
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
              Email Over Due Messages
            </h1>
            {contextHolder}
            <div className="mt-6 mb-8">
              <div className="flex justify-start border-b border-gray-300 mb-4"></div>
              <div className="mt-10">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group Filter
                    </label>
                    <Select
                      style={{ width: 200 }}
                      allowClear
                      placeholder="--All groups--"
                      onChange={(value) => setGroupFilter(value)}
                      value={groupFilter || undefined}
                    >
                      {groupOptions.map((group) => (
                        <Select.Option key={group} value={group}>
                          {group}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={sendEmail}
                    className="relative bg-blue-600 text-white px-4 py-2 rounded shadow-md hover:bg-blue-700 transition duration-200 flex items-center"
                  >
                    {visibleSelectedCount > 0 && (
                      <div
                        className="min-w-6 h-6 absolute -right-3 -top-2 shadow-lg hover:bg-red-600 bg-red-400 rounded-full text-white flex items-center justify-center text-xs"
                        title={`Message will be sent to total ${visibleSelectedCount} customers`}
                      >
                        <span>{visibleSelectedCount}</span>
                      </div>
                    )}
                    <MdMarkEmailRead className="mr-2" size={20} />
                    Email
                  </button>
                </div>
                <DataTable
                  data={filteredUsers}
                  columns={Auctioncolumns}
                  catcher="_id"
                  exportedPdfName="Overdue Email"
                  exportedFileName={`CustomerReport.csv`}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default OverDueEmail;
