import React, { useEffect, useState, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select } from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { FaWhatsapp } from "react-icons/fa";
import { notification } from "antd";
import Sidebar from "../components/layouts/Sidebar";
import { FaUsers, FaCheckCircle } from "react-icons/fa";


const DueMessage = () => {
  const [searchText, setSearchText] = useState("");
  const [usersData, setUsersData] = useState([]);
  const [groupFilter, setGroupFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeUserData, setActiveUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [notifier, contextHolder] = notification.useNotification();
  const [selectAll, setSelectAll] = useState(false);
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
  useEffect(() => {
    if (filteredUsers.length > 0) {
      const allSelected = filteredUsers.every((user) => user.isSelected);
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [filteredUsers]);

  const visibleSelectedCount = useMemo(() => {
    return filteredUsers.filter((user) => user.isSelected).length;
  }, [filteredUsers]);

  const sendWhatsapp = async () => {
    const key = "updatable";
    try {
      notifier.open({
        key,
        message: "Sending Messages Via Whatsapp..",
        description: "Processing...",
        className: "bg-green-300 rounded-lg font-bold",
        duration: 2,
      });

      const visibleActiveUsers = {};
      filteredUsers.forEach((user) => {
        if (user.isSelected && activeUserData[user._id]) {
          visibleActiveUsers[user._id] = activeUserData[user._id];
        }
      });

      await api.post("/whatsapp/due-message", visibleActiveUsers);

      const newActiveUserData = { ...activeUserData };
      filteredUsers.forEach((user) => {
        if (user.isSelected) {
          delete newActiveUserData[user._id];
        }
      });
      setActiveUserData(newActiveUserData);

      notifier.open({
        key,
        message: "Whatsapp Messages Has Been Sent Successfully",
        description: "Success",
        className: "bg-green-300 rounded-lg font-bold",
        duration: 2,
      });
    } catch (err) {
      notifier.open({
        key,
        message: "Failed to Send Whatsapp",
        description: err.message || "Something went wrong",
        className: "bg-red-300 rounded-lg font-bold",
        duration: 2,
      });
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const reportResponse = await api.get("/user/all-customers-report");
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
              const paymentsTicket = data.payments.ticket;
              const groupName = data.enrollment.group.group_name;
              const totalToBePaid =
                groupType === "double"
                  ? groupInstall * auctionCount + groupInstall
                  : totalPayable + groupInstall + totalProfit;
              const amountToBePaid =
                groupType === "double"
                  ? groupInstall * auctionCount + groupInstall
                  : totalPayable + groupInstall + totalProfit;
              const balance =
                groupType === "double"
                  ? groupInstall * auctionCount + groupInstall - totalPaidAmount
                  : totalPayable +
                    groupInstall +
                    firstDividentHead -
                    totalPaidAmount;

              if (balance <= 0) return;

              const userName = usrData.userName;
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
                customerId: usrData.customer_id,
                amountPaid: totalPaidAmount,
                paymentsTicket,
                amountToBePaid,
                groupName,
                payment_type: data?.enrollment?.payment_type,
                totalToBePaid: totalToBePaid,
                balance,
                groupId: groupId,
                userId: usrData?._id,
              };
              usersList.push(tempUsr);
            }
          });
        }
      });

      setUsersData(usersList);
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
    { key: "payment_type", header: "Payment Type" },
    { key: "paymentsTicket", header: "Ticket" },
    { key: "totalToBePaid", header: "Amount to be Paid" },
    { key: "amountPaid", header: "Paid Amount" },
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
        <Sidebar />
        <div className="flex-grow p-7 mt-32">
          <h1 className="text-2xl font-bold text-center">
            Whatsapp Outstanding Messages
          </h1>
          {contextHolder}

          <div className="mt-6 mb-8">
            <div className="flex justify-start border-b border-gray-300 mb-4"></div>
            {isLoading ? (
              <div className="w-full">
                <CircularLoader color="text-green-600" />
              </div>
            ) : (
              <div className="mt-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 mb-6">
  <div className="bg-blue-100 rounded-xl p-6 shadow flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600">Total Customers</p>
      <p className="text-3xl font-bold text-blue-700">
        {filteredUsers.length}
      </p>
    </div>
    <FaUsers className="text-blue-600 text-4xl" />
  </div>

  <div className="bg-green-100 rounded-xl p-6 shadow flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600">Selected Customers</p>
      <p className="text-3xl font-bold text-green-700">
        {visibleSelectedCount}
      </p>
    </div>
    <FaCheckCircle className="text-green-600 text-4xl" />
  </div>
</div>
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
                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setSelectAll(isChecked);

                        // Update all filtered users
                        setActiveUserData((prev) => {
                          const updated = { ...prev };
                          filteredUsers.forEach((user) => {
                            updated[user._id] = {
                              info: {
                                ...updated[user._id]?.info,
                                status: isChecked,
                                balance: user.balance,
                                userPhone: user.userPhone,
                                paymentsTicket: user.paymentsTicket,
                                groupName: user.groupName,
                                userName: user.userName,
                                groupId: user.groupId,
                                userId: user.userId,
                                amountPaid: user.amountPaid,
                                amountToBePaid: user.totalToBePaid,
                              },
                            };
                          });
                          return updated;
                        });
                      }}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Select All
                    </label>
                  </div>
                </div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={sendWhatsapp}
                    className="relative bg-green-600 text-white px-4 py-2 rounded shadow-md hover:bg-green-700 transition duration-200 flex items-center"
                  >
                    {visibleSelectedCount > 0 && (
                      <div
                        className="min-w-6 h-6 absolute -right-3 -top-2 shadow-lg hover:bg-red-600 bg-red-400 rounded-full text-white flex items-center justify-center text-xs"
                        title={`Message will be sent to total ${visibleSelectedCount} customers`}
                      >
                        <span>{visibleSelectedCount}</span>
                      </div>
                    )}
                    <FaWhatsapp className="mr-2" size={20} />
                    WhatsApp
                  </button>
                </div>
                <DataTable
                  data={filteredUsers}
                  columns={Auctioncolumns}
                  catcher="_id"
                  exportedPdfName="Due Message"
                  printHeaderKeys={["Group Name"]}
                  printHeaderValues={[groupFilter]}
                  exportedFileName={`Due Message.csv`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DueMessage;
