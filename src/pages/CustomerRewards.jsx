import React, { useEffect, useState, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Select, Table, Checkbox, message } from "antd";
import Navbar from "../components/layouts/Navbar";
import CircularLoader from "../components/loaders/CircularLoader";
import SettingSidebar from "../components/layouts/SettingSidebar";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { header } from "framer-motion/client";
import Sidebar from "../components/layouts/Sidebar";
// const CustomerRewards = () => {
//   const [screenLoading, setScreenLoading] = useState(true);
//   const [groupFilter, setGroupFilter] = useState("");
//   const [groups, setGroups] = useState([]);
//   const [receivedReward, setReceivedReward] = useState([]);
//   const [groupOptions, setGroupOptions] = useState([]);
//   const [enrollId, setEnrollId] = useState("");
//   const [searchText, setSearchText] = useState("");
//     const [TableEnrollsDate, setTableEnrollsDate] = useState([]);

//   const onGlobalSearchChangeHandler = (e) => {
//     const { value } = e.target;
//     setSearchText(value);
//   };

//   const [alertConfig, setAlertConfig] = useState({
//     visibility: false,
//     message: "Something went wrong!",
//     type: "info",
//   });

//   useEffect(() => {
//     const fetchGroup = async () => {
//       try {
//         const response = await api.get(`/group/get-group-admin`);
//         console.log(response.data, "respjnse hdhakhakjha");
//         setGroups(response.data);
//       } catch (error) {
//         console.error("Unable to fetch enroll data:", error);
//       }
//     };

//     fetchGroup();
//   }, []);
//   useEffect(() => {
//     const fetchCustomerRewards = async () => {
//       try {
//         setScreenLoading(true);
//         const response = await api.get(
//           `/enroll/reward/status/${groupFilter}`
//         );
//         console.info(response?.data?.reward, "hgshjfghsjkfghjksfghjksfgh");

//         const formattedData = response?.data?.reward?.map((gift, index) => ({
//           id: gift?._id,
//           slno: index + 1,
//           groupName: gift?.group_id?.group_name || "-",
//           userName: gift?.user_id?.full_name || "-",
//           tickets: gift?.tickets || "-",
//           giftReceived: gift?.gift_received || false,
//         }));
//         console.info(formattedData, "kkkkkkkkkhfsdjhfbdsjhfsjhdfv")

//         setReceivedReward(formattedData);
//         setTableEnrollsDate(formattedData);

//         // Populate group filters
//         const uniqueGroups = [
//           ...new Set(formattedData.map((item) => item.groupName)),
//         ];
//         setGroupOptions(uniqueGroups);

//         // // Totals
//         // const received = formattedData.filter((r) => r.giftReceived).length;
//         // const pending = formattedData.length - received;
//       } catch (error) {
//         console.error("Unable to fetch rewards:", error);
//         message.error("Failed to load reward data");
//       } finally {
//         setScreenLoading(false);
//       }
//     };

//     fetchCustomerRewards();
//   }, [groupFilter]);

//   const handleCheckboxChange = async (id, checked) => {
//     try {
//       await api.put(`/enroll/update-reward-gift-status/${id}`, {
//         gift_received: checked,
//       });

//       setReceivedReward((prev) =>
//         prev.map((item) =>
//           item.id === id ? { ...item, giftReceived: checked } : item
//         )
//       );

//       message.success(`Gift marked as ${checked ? "Received" : "Pending"}`);
//     } catch (error) {
//       console.error("Failed to update gift status:", error);
//       message.error("Unable to update gift status");
//     }
//   };

// const giftColumns = [
//   { key: "slno", header: "SL. No" },
//   { key: "groupName", header: "Group Name" },
//   { key: "userName", header: "User Name" },
//   { key: "tickets", header: "Tickets" },
//    {

//     key: "giftReceived",
//     render: (_, record) => (
//       <Checkbox
//         checked={record.giftReceived}
//         onChange={(e) => handleCheckboxChange(record.id, e.target.checked)}
//       />
//     ),
//     header: "CheckBox"
//   },
// ];

//   const filteredRewards = receivedReward.filter((reward) => {
//     return groupFilter ? reward.groupName === groupFilter : true;
//   });

//   return (
//     <div className="w-screen">
//       <div className="flex mt-30">
//         <Navbar
//           onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
//           visibility={true}
//         />
//         <SettingSidebar />
//         <CustomAlertDialog
//           type={alertConfig.type}
//           isVisible={alertConfig.visibility}
//           message={alertConfig.message}
//           onClose={() =>
//             setAlertConfig((prev) => ({ ...prev, visibility: false }))
//           }
//         />
//         <div className="flex-grow p-7">
//           <div className="mt-6 mb-8">
//             <div className="flex justify-between items-center w-full">
//               <h1 className="text-2xl font-semibold">Insurance</h1>
//             </div>
//           </div>
//           {screenLoading ? (
//             <div className="w-full">
//               <CircularLoader color="text-green-600" />
//             </div>
//           ) : (
//             <div className="flex-grow p-7">
//               <h1 className="text-2xl font-bold text-center">
//                 Reports - Customer Rewards
//               </h1>

//               {/* Filters */}
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
//                       {groups.map((group) => (
//                         <Select.Option key={group?._id} value={group?._id}>
//                           {group?.group_name}
//                         </Select.Option>
//                       ))}
//                     </Select>
//                   </div>
//                 </div>

//                 {/* Summary Cards */}

//                 {/* Data Table */}
//                 <DataTable
//   columns={giftColumns}
//   data={TableEnrollsDate}
// />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const CustomerRewards = () => {
//   const [screenLoading, setScreenLoading] = useState(true);
//   const [groupFilter, setGroupFilter] = useState("");
//   const [groups, setGroups] = useState([]);
//   const [receivedReward, setReceivedReward] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [activeUserData, setActiveUserData] = useState({});
//   const [selectAll, setSelectAll] = useState(false);

//   const onGlobalSearchChangeHandler = (e) => {
//     setSearchText(e.target.value);
//   };

//   const [alertConfig, setAlertConfig] = useState({
//     visibility: false,
//     message: "Something went wrong!",
//     type: "info",
//   });

//   // Fetch groups
//   useEffect(() => {
//     const fetchGroup = async () => {
//       try {
//         const response = await api.get(`/group/get-group-admin`);
//         setGroups(response.data);
//       } catch (error) {
//         console.error("Unable to fetch group data:", error);
//       }
//     };
//     fetchGroup();
//   }, []);

//   // Fetch reward data
//   //   useEffect(() => {
//   //     const fetchCustomerRewards = async () => {
//   //       try {
//   //         setScreenLoading(true);
//   //         const response = await api.get(`/enroll/reward/status/${groupFilter}`);

//   //         const formattedData = response?.data?.reward?.map((gift, index) => ({
//   //           _id: gift?._id,
//   //           sl_no: index + 1,
//   //           groupName: gift?.group_id?.group_name || "-",
//   //           groupInstallMent: gift?.group_id?.group_installment || "-",
//   //           paymentType: gift?.payment_type,
//   //           userName: gift?.user_id?.full_name || "-",
//   //           tickets: gift?.tickets || "-",
//   //           giftReceived: gift?.gift_received || false,
//   //         }));

//   //         setReceivedReward(formattedData);

//   //         // initialize activeUserData map
//   //         const activeMap = {};
//   //         formattedData.forEach((item) => {
//   //           activeMap[item._id] = {
//   //             info: {
//   //               status: item.giftReceived,
//   //             },
//   //           };
//   //         });
//   //         setActiveUserData(activeMap);
//   //       } catch (error) {
//   //         console.error("Unable to fetch rewards:", error);
//   //         message.error("Failed to load reward data");
//   //       } finally {
//   //         setScreenLoading(false);
//   //       }
//   //     };

//   //     fetchCustomerRewards();
//   //   }, [groupFilter]);

//   // useEffect(() => {
//   //   const fetchCustomerRewards = async () => {
//   //     try {
//   //       setScreenLoading(true);
//   //       const response = await api.get(`/enroll/reward/status/${groupFilter}`);
//   //       console.info(response.data.reward, "fvdsjhfvjhsdfvjhsdfv");
//   //       const formattedData = response?.data?.reward?.map((gift, index) => {
//   //         // let installmentValue = "-";

//   //         // if (gift?.payment_type === "Weekly") {
//   //         //   installmentValue = gift?.group_id?.weekly_installment || "-";
//   //         // } else if (gift?.payment_type === "Daily") {
//   //         //   installmentValue = gift?.group_id?.daily_installment || "-";
//   //         // } else if (gift?.payment_type === "Monthly") {
//   //         //   installmentValue = gift?.group_id?.monthly_installment || "-";
//   //         // } else {
//   //         //   installmentValue = gift?.group_id?.group_installment || "-";
//   //         // }

//   //         return {
//   //           _id: gift?._id,
//   //           sl_no: index + 1,
//   //           groupName: gift?.group_id?.group_name || "-",
//   //         //  groupInstallMent: installmentValue,
//   //           paidInstallment: gift?.remaining_first_installments || "",
//   //           releseGift : gift?.release_gift || "",
//   //           paymentType: gift?.payment_type,
//   //           userName: gift?.user_id?.full_name || "-",
//   //           tickets: gift?.tickets || "-",
//   //           giftReceived: gift?.gift_received || false,
//   //         };
//   //       });

//   //       setReceivedReward(formattedData);

//   //       // initialize activeUserData map
//   //       const activeMap = {};
//   //       formattedData.forEach((item) => {
//   //         activeMap[item._id] = {
//   //           info: {
//   //             status: item.giftReceived,
//   //           },
//   //         };
//   //       });
//   //       setActiveUserData(activeMap);
//   //     } catch (error) {
//   //       console.error("Unable to fetch rewards:", error);
//   //       message.error("Failed to load reward data");
//   //     } finally {
//   //       setScreenLoading(false);
//   //     }
//   //   };

//   //   fetchCustomerRewards();
//   // }, [groupFilter]);

//   useEffect(() => {
//     const fetchCustomerRewards = async () => {
//       try {
//         setScreenLoading(true);
//         const response = await api.get(`/enroll/reward/status/${groupFilter}`);
//         console.info(response.data.reward, "fvdsjhfvjhsdfvjhsdfv");

//         const formattedData = response?.data?.reward.map((gift, index) => ({
//           _id: gift?._id,
//           sl_no: index + 1,
//           groupName: gift?.group_id?.group_name || "-",
//           remainingInstallment: gift?.remaining_first_installments || "",
//           releaseGift:
//             gift?.release_gift === true ? "Eligible" : "Not Eligible",
//           TotalPaidAmount: gift?.total_paid_amount || "",
//           userName: gift?.user_id?.full_name || "-",
//           tickets: gift?.tickets || "-",
//           giftReceived: gift?.gift_received || false,
//         }));

//         setReceivedReward(formattedData);

       
//         const activeMap = {};
//         formattedData.forEach((item) => {
//           activeMap[item._id] = {
//             info: {
//               status: item.giftReceived,
//             },
//           };
//         });
//         setActiveUserData(activeMap);
//       } catch (error) {
//         console.error("Unable to fetch rewards:", error);
//         message.error("Failed to load reward data");
//       } finally {
//         setScreenLoading(false);
//       }
//     };

//     fetchCustomerRewards();
//   }, [groupFilter]);

//   // Handle individual checkbox change
//   const handleCheckboxChange = async (id, checked) => {
//     try {
//       await api.put(`/enroll/update-reward-gift-status/${id}`, {
//         gift_received: checked,
//       });

//       setActiveUserData((prev) => ({
//         ...prev,
//         [id]: {
//           info: {
//             status: checked,
//           },
//         },
//       }));

//       message.success(`Gift marked as ${checked ? "Received" : "Pending"}`);
//     } catch (error) {
//       console.error("Failed to update gift status:", error);
//       message.error("Unable to update gift status");
//     }
//   };

//   // Filtered users
//   const filteredRewards = useMemo(() => {
//     return receivedReward.map((item, index) => {
//       const isSelected = !!activeUserData[item._id]?.info?.status;

//       return {
//         ...item,
//         sl_no: index + 1,
//         checkBoxs: (
//           <input
//             type="checkbox"
//             checked={isSelected}
//             onChange={(e) => handleCheckboxChange(item._id, e.target.checked)}
//           />
//         ),
//         isSelected,
//       };
//     });
//   }, [receivedReward, activeUserData]);

//   useEffect(() => {
//     if (filteredRewards.length > 0) {
//       const allSelected = filteredRewards.every((item) => item.isSelected);
//       setSelectAll(allSelected);
//     } else {
//       setSelectAll(false);
//     }
//   }, [filteredRewards]);

//   // Handle select all checkbox
//   const handleSelectAll = async (checked) => {
//     setSelectAll(checked);
//     const updated = {};

//     for (const item of filteredRewards) {
//       updated[item._id] = { info: { status: checked } };
//       try {
//         await api.put(`/enroll/update-reward-gift-status/${item._id}`, {
//           gift_received: checked,
//         });
//       } catch (err) {
//         console.error("Failed bulk update:", err);
//       }
//     }

//     setActiveUserData((prev) => ({ ...prev, ...updated }));
//   };

//   const giftColumns = [
//     { key: "sl_no", header: "SL. NO" },
//     { key: "groupName", header: "Group Name" },
//     { key: "userName", header: "User Name" },
//     { key: "tickets", header: "Tickets" },
//     // { key: "paymentType", header: "Payment Type" },
//     // { key: "groupInstallMent", header: "Installment" },
//     {key: "TotalPaidAmount", header: "Total Paid Amount"},
//     { key: "remainingInstallment", header: "Remaining Installment" },
    
//     { key: "releaseGift", header: "Release Gift" },
//     { key: "checkBoxs", header: "Gift Received" },
//   ];

//   return (
//     <div className="w-screen">
//       <div className="flex mt-30">
//         <Navbar
//           onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
//           visibility={true}
//         />
//         <SettingSidebar />
//         <CustomAlertDialog
//           type={alertConfig.type}
//           isVisible={alertConfig.visibility}
//           message={alertConfig.message}
//           onClose={() =>
//             setAlertConfig((prev) => ({ ...prev, visibility: false }))
//           }
//         />

//         <div className="flex-grow p-7">
//           <div className="mt-6 mb-8">
//             <div className="flex justify-between items-center w-full">
//               <h1 className="text-2xl font-semibold">Customer Rewards</h1>
//             </div>
//           </div>

//           {screenLoading ? (
//             <div className="w-full">
//               <CircularLoader color="text-green-600" />
//             </div>
//           ) : (
//             <div className="flex-grow p-7">
//               <h1 className="text-2xl font-bold text-center">
//                 Customer Rewards
//               </h1>

//               {/* Filters */}
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
//                       {groups.map((group) => (
//                         <Select.Option key={group?._id} value={group?._id}>
//                           {group?.group_name}
//                         </Select.Option>
//                       ))}
//                     </Select>
//                   </div>

//                   {/* Select All Checkbox */}
//                   <div className="flex items-center mt-6">
//                     <input
//                       type="checkbox"
//                       checked={selectAll}
//                       onChange={(e) => handleSelectAll(e.target.checked)}
//                       className="mr-2"
//                     />
//                     <label className="text-sm font-medium text-gray-700">
//                       Select All
//                     </label>
//                   </div>
//                 </div>

//                 {/* Show message before selecting a group */}
//                 {!groupFilter ? (
//                   <div className="mt-10 text-center text-gray-600 text-lg font-medium">
//                     Please select a group to check customer rewarded or not.
//                   </div>
//                 ) : filteredRewards.length === 0 ? (
//                   <div className="mt-10 text-center text-gray-600 text-lg font-medium">
//                     No reward data found for this group.
//                   </div>
//                 ) : (
//                   <DataTable
//                     data={filteredRewards}
//                     columns={giftColumns}
//                     catcher="_id"
//                     exportedPdfName="Customer Rewards"
//                     exportedFileName={`CustomerRewards.csv`}
//                   />
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

const CustomerRewards = () => {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");

  /* ================= DATE RANGE ================= */
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [rewardTable, setRewardTable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /* ================= SUMMARY ================= */
  const [summary, setSummary] = useState({
    point_value: 1,
  //  total_earned_points: 0,
    total_earned_points: 0, // wallet earned (after redemption)
    total_redeemed_points: 0,
    balance_points: 0,
     total_redeemed_amount: 0,
    sum_previous_earned_points: 0, // lifetime
    sum_previous_redeemed_points: 0,
  });

    const handleAntInputDSelect = (field, value) => {
    setUpdateFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    setErrors({ ...errors, [field]: "" });
  };

  /* ================= REDEEM ================= */
  const [redeemPoints, setRedeemPoints] = useState("");
  const [redeemType, setRedeemType] = useState("Cash");
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [redeemDesc, setRedeemDesc] = useState("");

  /* ================= FETCH CUSTOMERS ================= */
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/user/get-user");
      setCustomers(res.data || []);
    } catch {
      console.error("Failed to fetch customers");
    }
  };

  /* ================= FETCH SUMMARY ================= */
  const fetchRewardSummary = async (custId) => {
    try {
      const res = await api.get(
        `/customer-rewards/customer-reward-points/${custId}`
      );
      if (res.data?.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch reward summary", err);
    }
  };

  /* ================= FETCH REWARD LIST ================= */
  const fetchRewardPoints = async (custId) => {
    if (!custId) return;

    setIsLoading(true);
    try {
      const res = await api.get(
        `/customer-rewards/customer-reward-list/${custId}`
      );

      const formatted = res.data?.data?.map((reward, index) => ({
        _id: reward._id,
        slNo: index + 1,
        customerName: reward?.customer_name || "-",
        phone: reward?.customer_phone || "-",
        groupName: reward?.group_name || "-",
        sourceType: reward?.source_type || "-",
        rewardPoints: reward?.reward_points || 0,
        rewardAmount: reward?.rewarded_amount || 0,
        status: reward?.status || "Active",
        remarks: reward?.remarks || "-",
      }));

      setRewardTable(formatted);
    } catch (err) {
      console.error("Failed to fetch reward list", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= CREATE REWARD ================= */
  const createRewardPoints = async () => {
    if (!customerId) return alert("Select customer");
    if (!fromDate || !toDate) return alert("Select From & To dates");
    if (new Date(fromDate) > new Date(toDate)) {
      return alert("From Date cannot be after To Date");
    }

    setIsLoading(true);
    try {
      await api.post("/customer-rewards/customer-reward-points/create", {
        customer_id: customerId,
        from_date: fromDate,
        to_date: toDate,
        remarks: "",
      });

      await fetchRewardSummary(customerId);
      await fetchRewardPoints(customerId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create rewards");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= AUTO CALCULATE CASH ================= */
  useEffect(() => {
    if (redeemType === "Cash") {
      setRedeemAmount(
        Number(redeemPoints || 0) * summary.point_value
      );
    } else {
      setRedeemAmount(0);
    }
  }, [redeemPoints, redeemType, summary.point_value]);

  /* ================= REDEEM ================= */
  const redeemRewardPoints = async () => {
    if (!customerId) return alert("Select customer");
    if (!redeemPoints) return alert("Enter points");

    if (Number(redeemPoints) > summary.balance_points) {
      return alert("Redeem points exceed available balance");
    }

    setIsLoading(true);
    try {
      await api.post("/customer-rewards/customer-reward-points/redeem", {
        customer_id: customerId,
        redeem_points: Number(redeemPoints),
        redemption_type: redeemType,
        description: redeemDesc,
      });

      setRedeemPoints("");
      setRedeemDesc("");

      await fetchRewardSummary(customerId);
      await fetchRewardPoints(customerId);
    } catch (err) {
      alert(err.response?.data?.message || "Redeem failed");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const rewardColumns = [
    { key: "slNo", header: "Sl No" },
    { key: "customerName", header: "Customer Name" },
    { key: "phone", header: "Phone" },
    { key: "groupName", header: "Group" },
    { key: "sourceType", header: "Source" },
    { key: "rewardPoints", header: "Points" },
    { key: "rewardAmount", header: "Amount" },
    { key: "status", header: "Status" },
    { key: "remarks", header: "Remarks" },
  ];

  return (
    <div>
      <Navbar visibility />
      <div className="flex mt-20">
        <Sidebar />

        <div className="flex-grow p-7">
          <h1 className="text-2xl font-semibold mb-6">
            Customer Reward Points
          </h1>

          {/* ================= FILTER ================= */}
          <div className="flex flex-wrap gap-4 mb-6 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">
                Customer
              </label>

              <Select
  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-64"
  placeholder="Select Customer"
  popupMatchSelectWidth={false}
  showSearch
  optionFilterProp="children"
  filterOption={(input, option) =>
    option.children
      .toString()
      .toLowerCase()
      .includes(input.toLowerCase())
  }
  value={customerId || undefined}
  onChange={(value) => {
    setCustomerId(value);
    setRewardTable([]);

    if (value) {
      fetchRewardSummary(value);
      fetchRewardPoints(value);
    }
  }}
>
  {customers.map((c) => (
    <Select.Option key={c._id} value={c._id}>
      {c.full_name} - {c.phone_number}
    </Select.Option>
  ))}
</Select>

            </div>

            <div>
              <label className="block text-sm mb-1">From Date</label>
              <input
                type="date"
                className="border px-4 py-2 rounded"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">To Date</label>
              <input
                type="date"
                className="border px-4 py-2 rounded"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <button
              onClick={createRewardPoints}
              disabled={isLoading}
              className={`px-6 py-2 rounded ${
                isLoading
                  ? "bg-gray-400"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Processing..." : "Create Reward"}
            </button>
          </div>

          {/* ================= SUMMARY ================= */}
          {customerId && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <SummaryCard
                label="Earned Points"
                value={summary.total_earned_points}
              />
              <SummaryCard
                label="Redeemed Points"
                value={summary.total_redeemed_points}
              />
              <SummaryCard
                label="Redeemed Amount"
                value={summary.total_redeemed_amount}
              />
            </div>
          )}

          {/* ================= REDEEM ================= */}
          {customerId && (
            <div className="border rounded p-4 mb-6">
              <h2 className="font-semibold mb-4">Redeem Reward Points</h2>

              <div className="grid grid-cols-4 gap-4">
                <input
                  type="number"
                  placeholder="Reward Points"
                  className="border px-3 py-2 rounded"
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                />

                <select
                  className="border px-3 py-2 rounded"
                  value={redeemType}
                  onChange={(e) => setRedeemType(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Gift">Gift</option>
                  <option value="Other">Other</option>
                </select>

                {redeemType === "Cash" && (
                  <input
                    disabled
                    className="border px-3 py-2 rounded bg-gray-100"
                    value={`₹ ${redeemAmount}`}
                  />
                )}

                <input
                  type="text"
                  placeholder="Remarks"
                  className="border px-3 py-2 rounded col-span-2"
                  value={redeemDesc}
                  onChange={(e) => setRedeemDesc(e.target.value)}
                />
              </div>

              <button
                disabled={summary.balance_points <= 0}
                onClick={redeemRewardPoints}
                className={`mt-4 px-6 py-2 rounded ${
                  summary.balance_points <= 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white"
                }`}
              >
                Redeem Points
              </button>
            </div>
          )}

          {/* ================= TABLE ================= */}
          {rewardTable.length > 0 && !isLoading ? (
            <DataTable columns={rewardColumns} data={rewardTable} />
          ) : (
            <CircularLoader
              isLoading={isLoading}
              data="Customer Reward"
              failure={!isLoading && rewardTable.length === 0}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value }) => (
  <div className="border rounded p-4 bg-white shadow-sm">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-xl font-semibold mt-1">{value}</p>
  </div>
);

export default CustomerRewards;
