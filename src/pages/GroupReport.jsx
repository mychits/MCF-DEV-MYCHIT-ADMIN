/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import {Select} from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";

const GroupReport = () => {
  const [groups, setGroups] = useState([]);
  const [TableDaybook, setTableDaybook] = useState([]);
  const [TableAuctions, setTableAuctions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [group, setGroup] = useState([]);
  const [commission, setCommission] = useState("");
  const [TableEnrolls, setTableEnrolls] = useState([]);
  const [TableEnrollsDate, setTableEnrollsDate] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [groupPaid, setGroupPaid] = useState("");
  const [groupToBePaid, setGroupToBePaid] = useState("");
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [groupPaidDate, setGroupPaidDate] = useState("");
  const [groupToBePaidDate, setGroupToBePaidDate] = useState("");
  const [detailsLoading, setDetailLoading] = useState(false);
  const [basicLoading, setBasicLoading] = useState(false);
  const [screenLoading, setScreenLoading] = useState(true);
  const [selectedAuctionGroupId, setSelectedAuctionGroupId] = useState("");
  const [filteredAuction, setFilteredAuction] = useState([]);
  const [groupInfo, setGroupInfo] = useState({});
  const [receiptNo, setReceiptNo] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState("");
  const [payments, setPayments] = useState([]);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("groupDetails");
  const [searchText,setSearchText] = useState("");
  const [isLoading,setIsLoading] = useState(false);
  const [isDateFilterLoading,setIsDateFilterLoading] = useState(true)
  const onGlobalSearchChangeHandler = (e)=>{
    setSearchText(e.target.value)

  }
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const [formData, setFormData] = useState({
    group_id: "",
    user_id: "",
    ticket: "",
    receipt_no: "",
    pay_date: "",
    amount: "",
    pay_type: "cash",
    transaction_id: "",
  });



  useEffect(() => {
    setScreenLoading(true);
    const fetchGroups = async () => {
      setDetailLoading(true);
      try {
        const response = await api.get("/group/get-group-admin");
        setGroups(response.data);
        setDetailLoading(false);
        setScreenLoading(false);
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      
      try {
        const response = await api.get(
          `/group/get-by-id-group/${selectedGroup}`
        );
        setGroup(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, [selectedGroup]);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await api.get("/payment/get-latest-receipt");
        setReceiptNo(response.data);
      } catch (error) {
        console.error("Error fetching receipt data:", error);
      }
    };
    fetchReceipt();
  }, []);

  useEffect(() => {
    if (receiptNo) {
      setFormData((prevData) => ({
        ...prevData,
        receipt_no: receiptNo.receipt_no,
      }));
    }
  }, [receiptNo]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/user/get-user");
        setFilteredUsers(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, []);

  const handleGroupPayment = async (groupId) => {
   
    setSelectedAuctionGroupId(groupId);
    //handleGroupChange(groupId);
    setSelectedGroup(groupId);
    handleGroupAuctionChange(groupId);
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
      
        const response = await api.get(`/payment/get-report-daybook`, {
          params: {
            pay_date: selectedDate,
            groupId: selectedAuctionGroupId,
            userId: selectedCustomers,
            pay_type: selectedPaymentMode,
          },
        });
        if (response.data && response.data.length > 0) {
          setFilteredAuction(response.data);
          const paymentData = response.data;
          const totalAmount = paymentData.reduce(
            (sum, payment) => sum + Number(payment.amount || 0),
            0
          );
          setPayments(totalAmount);
          const formattedData = response.data.map((group, index) => ({
            
            id: index + 1,
            group: group.group_id.group_name,
            name: group.user_id?.full_name,
            phone_number: group.user_id.phone_number,
            ticket: group.ticket,
            amount: group.amount,
            mode: group.pay_type,
          }));
          setTableDaybook(formattedData);
        } else {
          setFilteredAuction([]);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setFilteredAuction([]);
        setPayments(0);
      }
    };

    fetchPayments();
  }, [
    selectedAuctionGroupId,
    selectedDate,
    selectedPaymentMode,
    selectedCustomers,
  ]);

    const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "group", header: "Group Name" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "ticket", header: "Ticket" },
    { key: "amount", header: "Amount" },
    { key: "mode", header: "Payment Mode" },
  ];

  const handleGroupAuctionChange = async (groupId) => {
    if (groupId) {
      try {
        setIsLoading(true)
        const response = await api.get(`/auction/get-group-auction/${groupId}`);
        if (response.data && response.data.length > 0) {
          setFilteredAuction(response.data);

          const totalCommission = response.data.reduce((sum, group) => {
            return sum + (parseFloat(group.commission) || 0);
          }, 0);

          const formattedData = response.data.map((group, index) => ({
            _id:group._id,
            id: index + 1,
            date: group.auction_date,
            name: group.user_id?.full_name,
            phone_number: group.user_id?.phone_number,
            ticket: group.ticket,
            bid_amount:
              parseFloat(group.divident) + parseFloat(group.commission),
            win_amount: group.win_amount,
            next_payable: group.payable,
            divident: group.divident_head,
            auction_type:
              group.auction_type.charAt(0).toUpperCase() +
              group.auction_type.slice(1) +
              " Auction",
          }));
          setTableAuctions(formattedData);
          setCommission(totalCommission);
        } else {
          setFilteredAuction([]);
          setCommission(0);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        setFilteredAuction([]);
        setCommission(0);
      }finally{
        setIsLoading(false)
      }
    } else {
      setFilteredAuction([]);
      setCommission(0);
    }
  };

  const Auctioncolumns = [
    { key: "id", header: "SL. NO" },
    { key: "date", header: "Auction Date" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "ticket", header: "Ticket" },
    { key: "bid_amount", header: "Bid Amount" },
    { key: "win_amount", header: "Win Amount" },
    { key: "next_payable", header: "Next Payable" },
    { key: "divident", header: "Divident" },
    { key: "auction_type", header: "Auction Type" },
  ];

  useEffect(() => {
    const fetchEnroll = async () => {
      setBasicLoading(true);
      try {
        const response = await api.get(
          `/group-report/get-group-enroll/${selectedGroup}`
        );
        if (response.data && response.data.length > 0) {
          setFilteredUsers(response.data);

          const Paid = response.data;
          setGroupPaid(Paid[0].groupPaidAmount);

          const toBePaid = response.data;
          setGroupToBePaid(toBePaid[0].totalToBePaidAmount);

          const formattedData = response.data.map((group, index) => ({
            id: index + 1,
            name: group?.user?.full_name,
            phone_number: group?.user?.phone_number,
            ticket: group.ticket,

            amount_to_be_paid:
              group?.group?.group_type === "double"
                ? parseInt(group?.group?.group_install) *
                    parseInt(group.auctionCount) +
                  parseInt(group?.group?.group_install)
                : parseInt(group?.group?.group_install) +
                  group.totalToBePaidAmount +
                  parseInt(group.dividentHead),

            amount_paid: group.totalPaidAmount,
            amount_balance:
              group?.group?.group_type === "double"
                ? parseInt(group?.group?.group_install) *
                    parseInt(group.auctionCount) +
                  parseInt(group?.group?.group_install) -
                  group.totalPaidAmount
                : parseInt(group?.group?.group_install) +
                  group.totalToBePaidAmount +
                  parseInt(group.dividentHead) -
                  group.totalPaidAmount,
          }));
          setTableEnrolls(formattedData);
          setBasicLoading(false);
        } else {
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        setFilteredUsers([]);
      } finally {
        setBasicLoading(false);
      }
    };
    fetchEnroll();
  }, [selectedGroup]);

  const Basiccolumns = [
    { key: "id", header: "SL. NO" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "ticket", header: "Ticket" },
    { key: "amount_to_be_paid", header: "Amount to be Paid" },
    { key: "amount_paid", header: "Amount Paid" },
    { key: "amount_balance", header: "Amount Balance" },
  ];

  const formatDate = (dateString) => {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  };
  const formattedFromDate = formatDate(fromDate);
  const formattedToDate = formatDate(toDate);

  useEffect(() => {
    const fetchEnroll = async () => {
     
      try {
        setIsDateFilterLoading(true)
        const response = await api.get(
          `/group-report/get-group-enroll-date/${selectedGroup}?fromDate=${formattedFromDate}&toDate=${formattedToDate}`
        );
        if (response.data && response.data.length > 0) {
          setFilteredUsers(response.data);

          const Paid = response.data;
          setGroupPaidDate(Paid[0].groupPaidAmount || 0);

          const toBePaid = response.data;
          setGroupToBePaidDate(toBePaid[0].totalToBePaidAmount);

          const formattedData = response.data.map((group, index) => ({
            id: index + 1,
            name: group?.user?.full_name,
            phone_number: group?.user?.phone_number,
            ticket: group.ticket,
            amount_to_be_paid:
              group?.group?.group_type === "double"
                ? parseInt(group?.group?.group_install) *
                    parseInt(group.auctionCount) +
                  parseInt(group?.group?.group_install)
                : parseInt(group?.group?.group_install) +
                  group.totalToBePaidAmount +
                  parseInt(group.dividentHead),
            amount_paid: group.totalPaidAmount,
            amount_balance:
              group?.group?.group_type === "double"
                ? parseInt(group?.group?.group_install) *
                    parseInt(group.auctionCount) +
                  parseInt(group?.group?.group_install) -
                  group.totalPaidAmount
                : parseInt(group?.group?.group_install) +
                  group.totalToBePaidAmount +
                  parseInt(group.dividentHead) -
                  group.totalPaidAmount,
          }));
          setTableEnrollsDate(formattedData);
        } else {
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        setFilteredUsers([]);
        setTableEnrollsDate([]);
      }finally{
        setIsDateFilterLoading(false)
      }
    };
    fetchEnroll();
  }, [selectedGroup, formattedFromDate, formattedToDate]);

  const Datecolumns = [
    { key: "id", header: "SL. NO" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "ticket", header: "Ticket" },
    { key: "amount_to_be_paid", header: "Amount to be Paid" },
    { key: "amount_paid", header: "Amount Paid" },
    { key: "amount_balance", header: "Amount Balance" },
  ];

  useEffect(() => {
    if (groupInfo && formData.bid_amount) {
      const commission = (groupInfo.group_value * 5) / 100 || 0;
      const win_amount =
        (groupInfo.group_value || 0) - (formData.bid_amount || 0);
      const divident = (formData.bid_amount || 0) - commission;
      const divident_head = groupInfo.group_members
        ? divident / groupInfo.group_members
        : 0;
      const payable = (groupInfo.group_install || 0) - divident_head;

      setFormData((prevData) => ({
        ...prevData,
        group_id: groupInfo._id,
        commission,
        win_amount,
        divident,
        divident_head,
        payable,
      }));
    }
  }, [groupInfo, formData.bid_amount]);

  useEffect(() => {
    if (selectedGroup) {
      api
        .post(`/enroll/get-next-tickets/${selectedGroup}`)
        .then((response) => {
          setAvailableTickets(response.data.availableTickets || []);
        })
        .catch((error) => {
          console.error("Error fetching available tickets:", error);
        });
    } else {
      setAvailableTickets([]);
    }
  }, [selectedGroup]);
  if (screenLoading)
    return (
      <div className="w-screen m-28">
        <CircularLoader color="text-green-600" />
      </div>
    );
  return (
    <>
      <div className="w-screen min-h-screen">
        <div className="flex mt-30">
          {/* <Sidebar /> */}
           <Navbar onGlobalSearchChangeHandler={onGlobalSearchChangeHandler} visibility={true} />
         
          <div className="flex-grow p-7">
            <h1 className="text-2xl font-bold text-center mb-6">Reports - Group</h1>

            <div className="mt-6 mb-8">
              <div className="flex justify-center items-center w-full gap-4 bg-blue-50 p-2 w-30 h-40  rounded-3xl  border   space-x-2">
              <div className="mb-2">
                 
                    <label className="block text-lg text-gray-500 text-center font-semibold mb-2" htmlFor={"SS"}>
                      Group</label>
                    <Select
                   id="SS"
                    showSearch
                    popupMatchSelectWidth={false}
                    style={{height:"50px",width:"600px"}}
                    placeholder="Search Or Select Group"
                      value={selectedAuctionGroupId || undefined}
                      filterOption={(input, option) =>
                        option.children.toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      onChange={handleGroupPayment}
                      // className="border border-gray-300 px-6 py-2 shadow-sm outline-none w-full max-w-md"
                      className="cursor-pointer"
                      
                    >
                      
                      {groups.map((group) => (
                        <Select.Option key={group._id} value={group._id} >
                          {group.group_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
              {selectedGroup && (
                <>
                  <div className="mt-6 mb-8">
                    <div className="flex justify-start border-b border-gray-300 mb-4">
                      <button
                        className={`px-6 py-2 font-medium ${
                          activeTab === "groupDetails"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleTabChange("groupDetails")}
                      >
                        Group Details
                      </button>
                      <button
                        className={`px-6 py-2 font-medium ${
                          activeTab === "basicReport"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleTabChange("basicReport")}
                      >
                        Basic Group Report
                      </button>
                      <button
                        className={`px-6 py-2 font-medium ${
                          activeTab === "dateWiseReport"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleTabChange("dateWiseReport")}
                      >
                        Date-wise Group Report
                      </button>
                    </div>

                    {activeTab === "groupDetails" && (
                      <>
                        {detailsLoading ? (
                          <p>loading...</p>
                        ) : (
                          <div className="mt-10">
                            <div className="flex gap-4">
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Group Name
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Group Name"
                                  value={group.group_name}
                                  readonly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Group Type
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Group Type"
                                  value={
                                    group?.group_type?.charAt(0).toUpperCase() +
                                    group?.group_type?.slice(1) +
                                    " Auction"
                                  }
                                  readonly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Group Value
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Group Value"
                                  value={group.group_value}
                                  readonly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                            </div>
                            <div className="flex gap-4 mt-5">
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Group Installment Amount
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Group Installment Amount"
                                  value={group.group_install}
                                  readonly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Group Members
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Group Members"
                                  value={group.group_members}
                                  readonly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Group Duration
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Group Duration"
                                  value={group.group_duration}
                                  readonly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                            </div>
                            <div className="flex gap-4 mt-5">
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Earned Commission
                                </label>
                                <input
                                  type="text"
                                  placeholder="Earned Commission"
                                  value={commission || "-"}
                                  readonly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Fullfilled
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Fullfilled"
                                  value={
                                    group.group_members -
                                      availableTickets.length || "-"
                                  }
                                  readonly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="mb-1 text-sm font-medium text-gray-700">
                                  Vacant
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Vacant"
                                  value={availableTickets.length || "-"}
                                  readonly
                                  className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                                />
                              </div>
                            </div>
                            <div className="mt-10">
                              <h3 className="text-lg font-medium mb-4">
                                Auctions
                              </h3>
                              {filteredAuction && (filteredAuction.length > 0) && (!isLoading)? (
                                <div className="mt-10">
                                  <DataTable
                                    data={filterOption(TableAuctions,searchText)}
                                    columns={Auctioncolumns}
                                    exportedPdfName={`Group Details Report`}
                                  printHeaderKeys={[
                                  "Group Name",
                                  "Group Type",
                                  "Group Value",
                                  "Group Installment Amount",
                                  "Group Members",
                                  "Group Duration",
                                  "Earned Commission",
                                  "Fullfilled",
                                  "Vacant",
                                ]}
                                printHeaderValues={[
                                  group?.group_name,
                                  group?.group_type?.charAt(0).toUpperCase() +
                                    group?.group_type?.slice(1) +
                                    " Auction",
                                  group.group_value,
                                  group?.group_install,
                                  group?.group_members,
                                  group?.group_duration,
                                  commission,
                                 group.group_members -
                                      availableTickets.length || "-",
                                  availableTickets.length || "-",
                                  
                                ]}
                                    exportedFileName={`GroupReport-${
                                      TableAuctions.length > 0
                                        ? TableAuctions[0].name +
                                          " to " +
                                          TableAuctions[
                                            TableAuctions.length - 1
                                          ].name
                                        : "empty" 
                                    }.csv`}
                                  />
                                </div>
                              ) : (
                                <CircularLoader isLoading={isLoading} />
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* {activeTab === "basicReport" && (
                      <>
                        <div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 mb-10">
                            <div className="bg-blue-300 shadow-md rounded-lg p-4">
                              <h3 className="text-2xl font-semibold text-start mb-2">
                                ₹
                                {filteredUsers[0]?.group?.group_type ===
                                "double" ? (
                                  <>
                                    {parseInt(
                                      filteredUsers[0]?.group?.group_install
                                    ) *
                                      parseInt(
                                        filteredUsers[0]?.group?.group_members
                                      ) *
                                      parseInt(filteredUsers[0]?.auctionCount) +
                                      parseInt(
                                        filteredUsers[0]?.group?.group_install
                                      ) *
                                        parseInt(
                                          filteredUsers[0]?.group?.group_members
                                        )}
                                  </>
                                ) : (
                                  <>
                                    {groupToBePaid
                                      ? groupToBePaid *
                                          parseInt(
                                            filteredUsers[0]?.group
                                              ?.group_members
                                          ) +
                                        parseInt(
                                          filteredUsers[0]?.group?.group_install
                                        ) *
                                          parseInt(
                                            filteredUsers[0]?.group
                                              ?.group_members
                                          ) +
                                        parseInt(TableAuctions[0]?.divident) *
                                          parseInt(
                                            filteredUsers[0]?.group
                                              ?.group_members
                                          )
                                      : parseInt(group?.group_install) *
                                        parseInt(group?.group_members)}
                                  </>
                                )}
                              </h3>
                              <div className="text-gray-700">
                                <p className="mb-2 font-bold">
                                  Amount to be Paid
                                </p>
                              </div>
                            </div>
                            <div className="bg-yellow-300 shadow-md rounded-lg p-4">
                              <h3 className="text-2xl font-semibold text-start mb-2">
                                ₹ {groupPaid || 0}
                              </h3>
                              <div className="text-gray-700">
                                <p className="mb-2 font-bold">Paid Amount</p>
                              </div>
                            </div>
                            <div className="bg-red-400 shadow-md rounded-lg p-4">
                              <h3 className="text-2xl font-semibold text-start mb-2">
                                ₹{" "}
                                {filteredUsers[0]?.group?.group_type ===
                                "double" ? (
                                  <>
                                    {parseInt(
                                      filteredUsers[0]?.group?.group_install
                                    ) *
                                      parseInt(
                                        filteredUsers[0]?.group?.group_members
                                      ) *
                                      parseInt(filteredUsers[0]?.auctionCount) +
                                      parseInt(
                                        filteredUsers[0]?.group?.group_install
                                      ) *
                                        parseInt(
                                          filteredUsers[0]?.group?.group_members
                                        ) -
                                      groupPaid}
                                  </>
                                ) : (
                                  <>
                                    {groupToBePaid
                                      ? groupToBePaid *
                                          parseInt(
                                            filteredUsers[0]?.group
                                              ?.group_members
                                          ) +
                                        parseInt(
                                          filteredUsers[0]?.group?.group_install
                                        ) *
                                          parseInt(group?.group_members) +
                                        parseInt(TableAuctions[0]?.divident) *
                                          parseInt(
                                            filteredUsers[0]?.group
                                              ?.group_members
                                          ) -
                                        groupPaid
                                      : parseInt(group?.group_install) *
                                          parseInt(group?.group_members) -
                                        groupPaid}
                                  </>
                                )}
                              </h3>
                              <div className="text-gray-700">
                                <p className="font-bold">Balance Amount</p>
                              </div>
                            </div>
                          </div>
                          {TableEnrolls && (TableEnrolls.length > 0)&& !isDateFilterLoading ? (
                            <div className="mt-10">
                              <DataTable
                                data={TableEnrolls}
                                columns={Basiccolumns}
                                
                                exportedFileName={`Employees-${
                                  TableEnrolls.length > 0
                                    ? TableEnrolls[0].date +
                                      " to " +
                                      TableEnrolls[TableEnrolls.length - 1].date
                                    : "empty"
                                }.csv`}
                              />
                            </div>
                          ) : (
                            <div className="mt-10 text-center text-gray-500">
                               <CircularLoader isLoading={isDateFilterLoading} />
                            </div>
                          )}
                        </div>
                      </>
                    )} */}
                    {activeTab === "basicReport" &&
                    (() => {
                      // Precompute values
                      const members = parseInt(
                        filteredUsers[0]?.group?.group_members || 0
                      );
                      const install = parseInt(
                        filteredUsers[0]?.group?.group_install || 0
                      );
                      const auctionCount = parseInt(
                        filteredUsers[0]?.auctionCount || 0
                      );
                      const divident = parseInt(
                        TableAuctions[0]?.divident || 0
                      );

                      let amountToBePaid = 0;
                      if (filteredUsers[0]?.group?.group_type === "double") {
                        amountToBePaid =
                          install * members * auctionCount + install * members;
                      } else {
                        amountToBePaid = groupToBePaid
                          ? groupToBePaid * members +
                            install * members +
                            divident * members
                          : install * members;
                      }

                      const paidAmount = groupPaid || 0;

                      let balanceAmount = 0;
                      if (filteredUsers[0]?.group?.group_type === "double") {
                        balanceAmount =
                          install * members * auctionCount +
                          install * members -
                          groupPaid;
                      } else {
                        balanceAmount = groupToBePaid
                          ? groupToBePaid * members +
                            install * members +
                            divident * members -
                            groupPaid
                          : install * members - groupPaid;
                      }

                      return (
                        <div>
                          {/* Summary Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 mb-10">
                            {/* Amount to be Paid */}
                            <div className="bg-blue-300 shadow-md rounded-lg p-4">
                              <h3 className="text-2xl font-semibold text-start mb-2">
                                ₹{amountToBePaid}
                              </h3>
                              <p className="mb-2 font-bold text-gray-700">
                                Amount to be Paid
                              </p>
                            </div>

                            {/* Paid Amount */}
                            <div className="bg-yellow-300 shadow-md rounded-lg p-4">
                              <h3 className="text-2xl font-semibold text-start mb-2">
                                ₹{paidAmount}
                              </h3>
                              <p className="mb-2 font-bold text-gray-700">
                                Paid Amount
                              </p>
                            </div>

                            {/* Balance Amount */}
                            <div className="bg-red-400 shadow-md rounded-lg p-4">
                              <h3 className="text-2xl font-semibold text-start mb-2">
                                ₹{balanceAmount}
                              </h3>
                              <p className="font-bold text-gray-700">
                                Balance Amount
                              </p>
                            </div>
                          </div>

                          {/* Table */}
                          {TableEnrolls &&
                          TableEnrolls.length > 0 &&
                          !isDateFilterLoading ? (
                            <div className="mt-10">
                              <DataTable
                                data={TableEnrolls}
                                columns={Basiccolumns}
                                exportedPdfName="Basic Group Report"
                                printHeaderKeys={[
                                  "Group Name",
                                  "Amount to be Paid",
                                  "Paid Amount",
                                  "Balance Amount",
                                ]}
                                printHeaderValues={[
                                  group?.group_name,
                                  `₹${amountToBePaid}`,
                                  `₹${paidAmount}`,
                                  `₹${balanceAmount}`,
                                ]}
                                exportedFileName={`Employees-${
                                  TableEnrolls.length > 0
                                    ? TableEnrolls[0].date +
                                      " to " +
                                      TableEnrolls[TableEnrolls.length - 1].date
                                    : "empty"
                                }.csv`}
                              />
                            </div>
                          ) : (
                            <div className="mt-10 text-center text-gray-500">
                              <CircularLoader isLoading={isDateFilterLoading} />
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* {activeTab === "dateWiseReport" && (
                      <div className="mt-7">
                        <div className="flex gap-4">
                          <div className="flex flex-col flex-1">
                            <label className="mb-1 text-sm font-medium text-gray-700">
                              From Date
                            </label>
                            <input
                              type="date"
                              value={fromDate}
                              onChange={handleFromDateChange}
                              className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label className="mb-1 text-sm font-medium text-gray-700">
                              To Date
                            </label>
                            <input
                              type="date"
                              value={toDate}
                              onChange={handleToDateChange}
                              className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 mb-10">
                          <div className="bg-blue-300 shadow-md rounded-lg p-4">
                            <h3 className="text-2xl font-semibold text-start mb-2">
                              ₹
                              {filteredUsers[0]?.group?.group_type ===
                              "double" ? (
                                <>
                                  {parseInt(
                                    filteredUsers[0]?.group?.group_install
                                  ) *
                                    parseInt(
                                      filteredUsers[0]?.group?.group_members
                                    ) *
                                    parseInt(filteredUsers[0]?.auctionCount) +
                                    parseInt(
                                      filteredUsers[0]?.group?.group_install
                                    ) *
                                      parseInt(
                                        filteredUsers[0]?.group?.group_members
                                      )}
                                </>
                              ) : (
                                <>
                                  {groupToBePaid
                                    ? groupToBePaid *
                                        parseInt(
                                          filteredUsers[0]?.group?.group_members
                                        ) +
                                      parseInt(
                                        filteredUsers[0]?.group?.group_install
                                      ) *
                                        parseInt(
                                          filteredUsers[0]?.group?.group_members
                                        ) +
                                      parseInt(TableAuctions[0]?.divident) *
                                        parseInt(
                                          filteredUsers[0]?.group?.group_members
                                        )
                                    : parseInt(group?.group_install) *
                                      parseInt(group?.group_members)}
                                </>
                              )}
                            </h3>
                            <div className="text-gray-700">
                              <p className="mb-2 font-bold">
                                Amount to be Paid
                              </p>
                            </div>
                          </div>
                          <div className="bg-yellow-300 shadow-md rounded-lg p-4">
                            <h3 className="text-2xl font-semibold text-start mb-2">
                              ₹ {groupPaidDate || 0}
                            </h3>
                            <div className="text-gray-700">
                              <p className="mb-2 font-bold">Paid Amount</p>
                            </div>
                          </div>
                          <div className="bg-red-400 shadow-md rounded-lg p-4">
                            <h3 className="text-2xl font-semibold text-start mb-2">
                              ₹
                              {filteredUsers[0]?.group?.group_type ===
                              "double" ? (
                                <>
                                  {parseInt(
                                    filteredUsers[0]?.group?.group_install
                                  ) *
                                    parseInt(
                                      filteredUsers[0]?.group?.group_members
                                    ) *
                                    parseInt(filteredUsers[0]?.auctionCount) +
                                    parseInt(
                                      filteredUsers[0]?.group?.group_install
                                    ) *
                                      parseInt(
                                        filteredUsers[0]?.group?.group_members
                                      ) -
                                    groupPaid}
                                </>
                              ) : (
                                <>
                                  {groupToBePaid
                                    ? groupToBePaid *
                                        parseInt(
                                          filteredUsers[0]?.group?.group_members
                                        ) +
                                      parseInt(
                                        filteredUsers[0]?.group?.group_install
                                      ) *
                                        parseInt(group?.group_members) +
                                      parseInt(TableAuctions[0]?.divident) *
                                        parseInt(
                                          filteredUsers[0]?.group?.group_members
                                        ) -
                                      groupPaid
                                    : parseInt(group?.group_install) *
                                        parseInt(group?.group_members) -
                                      groupPaid}
                                </>
                              )}
                            </h3>
                            <div className="text-gray-700">
                              <p className="font-bold">Balance Amount</p>
                            </div>
                          </div>
                        </div>
                        {TableEnrollsDate && (TableEnrollsDate.length > 0)&&(!basicLoading) ? (
                          <div className="mt-10">
                            <DataTable
                              data={TableEnrollsDate}
                              columns={Datecolumns}
                              exportedFileName={`Employees-${
                                TableEnrollsDate.length > 0
                                  ? TableEnrollsDate[0].name +
                                    " to " +
                                    TableEnrollsDate[
                                      TableEnrollsDate.length - 1
                                    ].name
                                  : "empty"
                              }.csv`}
                            />
                          </div>
                        ) : (
                          <div className="mt-10 text-center text-gray-500">
                            <CircularLoader isLoading={basicLoading}/>
                          </div>
                        )}
                      </div>
                    )} */}
                     {activeTab === "dateWiseReport" &&
                    (() => {
                      // Precompute amounts for both UI and PDF
                      const members = parseInt(
                        filteredUsers[0]?.group?.group_members || 0
                      );
                      const install = parseInt(
                        filteredUsers[0]?.group?.group_install || 0
                      );
                      const auctionCount = parseInt(
                        filteredUsers[0]?.auctionCount || 0
                      );
                      const divident = parseInt(
                        TableAuctions[0]?.divident || 0
                      );

                      let amountToBePaid = 0;
                      if (filteredUsers[0]?.group?.group_type === "double") {
                        amountToBePaid =
                          install * members * auctionCount + install * members;
                      } else {
                        amountToBePaid = groupToBePaid
                          ? groupToBePaid * members +
                            install * members +
                            divident * members
                          : install * members;
                      }

                      const paidAmount = groupPaidDate || 0;

                      let balanceAmount = 0;
                      if (filteredUsers[0]?.group?.group_type === "double") {
                        balanceAmount =
                          install * members * auctionCount +
                          install * members -
                          groupPaid;
                      } else {
                        balanceAmount = groupToBePaid
                          ? groupToBePaid * members +
                            install * members +
                            divident * members -
                            groupPaid
                          : install * members - groupPaid;
                      }

                      return (
                        <div className="mt-7">
                          {/* Date inputs */}
                          <div className="flex gap-4">
                            <div className="flex flex-col flex-1">
                              <label className="mb-1 text-sm font-medium text-gray-700">
                                From Date
                              </label>
                              <input
                                type="date"
                                value={fromDate}
                                onChange={handleFromDateChange}
                                className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                              />
                            </div>
                            <div className="flex flex-col flex-1">
                              <label className="mb-1 text-sm font-medium text-gray-700">
                                To Date
                              </label>
                              <input
                                type="date"
                                value={toDate}
                                onChange={handleToDateChange}
                                className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full"
                              />
                            </div>
                          </div>

                          {/* Summary cards */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 mb-10">
                            <div className="bg-blue-300 shadow-md rounded-lg p-4">
                              <h3 className="text-2xl font-semibold text-start mb-2">
                                ₹{amountToBePaid}
                              </h3>
                              <p className="mb-2 font-bold text-gray-700">
                                Amount to be Paid
                              </p>
                            </div>
                            <div className="bg-yellow-300 shadow-md rounded-lg p-4">
                              <h3 className="text-2xl font-semibold text-start mb-2">
                                ₹{paidAmount}
                              </h3>
                              <p className="mb-2 font-bold text-gray-700">
                                Paid Amount
                              </p>
                            </div>
                            <div className="bg-red-400 shadow-md rounded-lg p-4">
                              <h3 className="text-2xl font-semibold text-start mb-2">
                                ₹{balanceAmount}
                              </h3>
                              <p className="font-bold text-gray-700">
                                Balance Amount
                              </p>
                            </div>
                          </div>

                          {/* Table */}
                          {TableEnrollsDate &&
                          TableEnrollsDate.length > 0 &&
                          !basicLoading ? (
                            <div className="mt-10">
                              <DataTable
                                data={TableEnrollsDate}
                                columns={Datecolumns}
                                exportedPdfName={`Date-wise Group Report`}
                                printHeaderKeys={[
                                  "From Date",
                                  "Group Name",
                                  "To Date",
                                  "Amount to be Paid",
                                  "Paid Amount",
                                  "Balance Amount",
                                ]}
                                printHeaderValues={[
                                  new Date(fromDate).toLocaleDateString(
                                    "en-GB"
                                  ),
                                  group?.group_name,
                                  new Date(toDate).toLocaleDateString("en-GB"),
                                  `₹${amountToBePaid}`,
                                  `₹${paidAmount}`,
                                  `₹${balanceAmount}`,
                                ]}
                                exportedFileName={`Employees-${
                                  TableEnrollsDate.length > 0
                                    ? TableEnrollsDate[0].name +
                                      " to " +
                                      TableEnrollsDate[
                                        TableEnrollsDate.length - 1
                                      ].name
                                    : "empty"
                                }.csv`}
                              />
                            </div>
                          ) : (
                            <div className="mt-10 text-center text-gray-500">
                              <CircularLoader isLoading={basicLoading} />
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        
      </div>
    </>
  );
};

export default GroupReport;
