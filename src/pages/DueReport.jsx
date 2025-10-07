/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select } from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { useMemo } from "react";

const DueReport = () => {
  const [searchText, setSearchText] = useState("");
  const [screenLoading, setScreenLoading] = useState(true);
  const [auctionTableData, setAuctionTableData] = useState([]);
  const [usersData, SetUsersData] = useState([]);
  const [groupFilter, setGroupFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const groupOptions = [...new Set(usersData.map((u) => u.groupName))];

  const [totals, setTotals] = useState({
    totalCustomers: 0,
    totalGroups: 0,
    totalToBePaid: 0,
    totalProfit: 0,
    totalPaid: 0,
    totalBalance: 0,
  });

  const filteredUsers = useMemo(() => {
    return filterOption(
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
  }, [usersData, groupFilter, fromDate, toDate, searchText]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setScreenLoading(true);
        const reportResponse = await api.get("/user/all-customers-report");
        const usersList = [];
        const tempActive = {};

        let count = 1;
        reportResponse.data?.forEach((usrData, index) => {
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
                    ? groupInstall * auctionCount +
                      groupInstall -
                      totalPaidAmount
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
                  sl_no: count,
                  userName,
                  userPhone,
                  customerId: usrData.customer_id,
                  amountPaid: totalPaidAmount,
                  paymentsTicket,
                  amountToBePaid,
                  groupName,
                  groupValue: data?.enrollment?.group?.group_value,
                  enrollmentDate: data?.enrollment?.createdAt
                    ? data.enrollment.createdAt.split("T")[0]
                    : "",
                  payment_type: data?.enrollment?.payment_type,
                  totalToBePaid: totalToBePaid,
                  relationshipManager:
                    data?.enrollment?.relationship_manager?.name || "N/A",
                  collectionExecutive: usrData.collection_executive || "N/A",
                  collectionArea: usrData.collection_area || "N/A",
                  referred_type: data?.enrollment?.referred_type,
                  reffered_by: data?.enrollment?.agent
                    ? data.enrollment.agent
                    : data?.enrollment?.reffered_customer
                    ? data.enrollment.reffered_customer
                    : data?.enrollment?.reffered_lead
                    ? data.enrollment.reffered_lead
                    : "N/A",
                  balance,

                  status: data.isPrized === "true" ? "Prized" : "Un Prized",
                  groupId: groupId,
                  userId: usrData?._id,
                  statusDiv:
                    data.isPrized === "true" ? (
                      <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full shadow-sm border border-green-300">
                        <span className="font-semibold text-sm">Prized</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full shadow-sm border border-red-300">
                        <span className="font-semibold text-sm">Un Prized</span>
                      </div>
                    ),
                };
                usersList.push(tempUsr);
                count++;
              }
            });
          }
        });

        SetUsersData(usersList);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setScreenLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const totalCustomers = filteredUsers.length;
    const groupSet = new Set(filteredUsers.map((user) => user.groupName));
    const totalGroups = groupFilter ? 1 : groupSet.size;

    const totalToBePaid = filteredUsers.reduce(
      (sum, u) => sum + (u.totalToBePaid || 0),
      0
    );
    const totalProfit = filteredUsers.reduce(
      (sum, u) => sum + (u.profit || 0),
      0
    );
    const totalPaid = filteredUsers.reduce(
      (sum, u) => sum + (u.amountPaid || 0),
      0
    );
    const totalBalance = filteredUsers.reduce(
      (sum, u) => sum + (u.balance || 0),
      0
    );

    setTotals({
      totalCustomers,
      totalGroups,
      totalToBePaid,
      totalProfit,
      totalPaid,
      totalBalance,
    });
  }, [filteredUsers, groupFilter]);

  const Auctioncolumns = [
    { key: "sl_no", header: "SL. NO" },
    { key: "userName", header: "Customer Name" },
    { key: "userPhone", header: "Phone Number" },
    { key: "customerId", header: "Customer Id" },
    { key: "groupName", header: "Group Name" },
    { key: "groupValue", header: "Group Value" },
    { key: "enrollmentDate", header: "Enrollment Date" },
    { key: "referred_type", header: "Referred Type" },
    { key: "reffered_by", header: "Referred By" },
    { key: "payment_type", header: "Payment Type" },
    { key: "paymentsTicket", header: "Ticket" },
    { key: "totalToBePaid", header: "Amount to be Paid" },
    { key: "relationshipManager", header: "Relationship Manager" },
    { key: "collectionExecutive", header: "Collection Executive" },
    { key: "collectionArea", header: "Collection Area" },
    { key: "amountPaid", header: "Amount Paid" },
    { key: "balance", header: "Due Amount" },
    { key: "statusDiv", header: "Status" },
  ];
  const ExcelColumns = [
    { key: "sl_no", header: "SL. NO" },
    { key: "userName", header: "Customer Name" },
    { key: "userPhone", header: "Phone Number" },
    { key: "customerId", header: "Customer Id" },
    { key: "groupName", header: "Group Name" },
    { key: "groupValue", header: "Group Value" },
    { key: "enrollmentDate", header: "Enrollment Date" },
    { key: "referred_type", header: "Referred Type" },
    { key: "reffered_by", header: "Referred By" },
    { key: "payment_type", header: "Payment Type" },
    { key: "paymentsTicket", header: "Ticket" },
    { key: "totalToBePaid", header: "Amount to be Paid" },
    { key: "profit", header: "Profit" },
    { key: "relationshipManager", header: "Relationship Manager" },
    { key: "collectionExecutive", header: "Collection Executive" },
    { key: "collectionArea", header: "Collection Area" },
    { key: "amountPaid", header: "Amount Paid" },
    { key: "balance", header: "Due Amount" },
    { key: "status", header: "Status" },
  ];
  const filteredTableData = filterOption(
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

  const total = {
    totalCustomers: filteredTableData.length,
    totalGroups: new Set(filteredTableData.map((u) => u.groupName)).size,
    totalToBePaid: filteredTableData.reduce(
      (sum, u) => sum + (u.toBePaid || 0),
      0
    ),
    totalProfit: filteredTableData.reduce((sum, u) => sum + (u.profit || 0), 0),
    totalPaid: filteredTableData.reduce((sum, u) => sum + (u.paid || 0), 0),
    totalBalance: filteredTableData.reduce(
      (sum, u) => sum + (u.balance || 0),
      0
    ),
  };
  const selectednewGroup =
    groupOptions.find((g) => g._id === groupFilter) || "—";
  return (
    <div className="w-screen">
      <div className="flex mt-30">
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        {screenLoading ? (
          <div className="w-full">
            <CircularLoader color="text-green-600" />
          </div>
        ) : (
          <div className="flex-grow p-7">
            <h1 className="text-2xl font-bold text-center">Reports - Due</h1>

            <div className="mt-6 mb-8">
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border rounded px-2 py-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border rounded px-2 py-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-8 mb-8">
                    <div className="flex flex-col border p-4 rounded shadow">
                      <span className="text-xl font-bold text-gray-700">
                        Total Customers
                      </span>
                      <span className="text-lg font-bold  text-blue-600">
                        {totals.totalCustomers}
                      </span>
                    </div>
                    <div className="flex flex-col border p-4 rounded shadow">
                      <span className="text-xl font-bold text-gray-700">
                        Total Groups
                      </span>
                      <span className="text-lg font-bold  text-green-600">
                        {totals.totalGroups}
                      </span>
                    </div>
                    <div className="flex flex-col border p-4 rounded shadow">
                      <span className="text-xl font-bold text-gray-700">
                        Amount to be Paid
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ₹{totals.totalToBePaid}
                      </span>
                    </div>

                    <div className="flex flex-col border p-4 rounded shadow">
                      <span className="text-xl font-semibold text-gray-700">
                        Total Amount Paid
                      </span>
                      <span className="text-lg font-bold text-indigo-600">
                        ₹{totals.totalPaid}
                      </span>
                    </div>
                    <div className="flex flex-col border p-4 rounded shadow">
                      <span className="text-xl font-bold text-gray-700">
                        Total Balance
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        ₹{totals.totalBalance}
                      </span>
                    </div>
                  </div>

                  {/* <DataTable
                    data={filteredTableData}
                    columns={Auctioncolumns}
                    exportCols={ExcelColumns}
                    exportedPdfName={"Due Report"}
                    printHeaderKeys={[
                      "From Date",
                      "Group Name",
                      "To Date",
                      "Total Customers",
                      "Total Groups",
                      "Amount to be Paid",
                      "Total Profit",
                      "Total Amount Paid",
                      "Total Balance",
                    ]}
                    printHeaderValues={[
                      fromDate
                        ? new Date(fromDate).toLocaleDateString("en-GB")
                        : "—",
                      groupFilter || "All Groups",
                      toDate
                        ? new Date(toDate).toLocaleDateString("en-GB")
                        : "—",
                      total.totalCustomers,
                      total.totalGroups,
                      `₹${total.totalToBePaid.toLocaleString("en-IN")}`,
                      `₹${total.totalProfit.toLocaleString("en-IN")}`,
                      `₹${total.totalPaid.toLocaleString("en-IN")}`,
                      `₹${total.totalBalance.toLocaleString("en-IN")}`,
                    ]}
                    exportedFileName={`CustomerReport.csv`}
                  /> */}

                  <DataTable
                    data={filteredTableData}
                    columns={Auctioncolumns}
                    exportCols={ExcelColumns}
                    exportedPdfName="Due Report"
                    printHeaderKeys={[
                      "From Date",
                      "To Date",
                      "Group Name",
                      "Total Customers",
                      "Total Groups",
                      "Amount to be Paid",
                      "Total Amount Paid",
                      "Total Balance",
                    ]}
                    printHeaderValues={[
                      fromDate
                        ? new Date(fromDate).toLocaleDateString("en-GB")
                        : "—",
                      toDate
                        ? new Date(toDate).toLocaleDateString("en-GB")
                        : "—",
                      groupFilter || "All Groups",
                      totals.totalCustomers,
                      totals.totalGroups,
                      `₹${totals.totalToBePaid.toLocaleString("en-IN")}`,
                      `₹${totals.totalPaid.toLocaleString("en-IN")}`,
                      `₹${totals.totalBalance.toLocaleString("en-IN")}`,
                    ]}
                    exportedFileName="DueReport.csv"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DueReport;
