/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select, message } from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";

const AllUserReport = () => {
  const [searchText, setSearchText] = useState("");
  const [screenLoading, setScreenLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [filters, setFilters] = useState({
    groupFilter: "",
    fromDate: "",
    toDate: ""
  });

  const transformUserData = (userInfo, index) => {
    const groupInstall = parseInt(userInfo?.group_id?.group_install) || 0;
    const groupType = userInfo?.group_id?.group_type;
    const firstInstallment = userInfo?.group_id?.monthly_installment || 0;
    const totalPaidAmount = userInfo?.payments?.totalPaidAmount || 0;
    const auctionCount = parseInt(userInfo?.auctions?.counts) || 0;
    const totalPayable = userInfo?.auctions?.payable || 0;
    const totalProfit = userInfo?.auctions?.profit || 0;
    const firstDividentHead = userInfo?.auctions?.firstDiv || 0;

    return {
      sl_no: index + 1,
      _id: userInfo._id,
      userName: userInfo?.user_id?.full_name || "N/A",
      firstInstallment,
      userPhone: userInfo?.user_id?.phone_number || "N/A",
      customerId: userInfo?.user_id?.customer_id || "N/A",
      collectionArea: userInfo?.user_id?.collection_area?.route_name || "N/A",
      collectionExecutive: userInfo?.user_id?.collection_area?.agent_id
        ?.map(agent => agent.name).join(" | ") || "N/A",
      amountPaid: totalPaidAmount,
      firstInstallmentStatus: (Number(totalPaidAmount) - Number(firstInstallment)) > 0 ? "Paid" : "Not Paid",
      paymentsTicket: userInfo?.tickets || "N/A",
      groupValue: userInfo?.group_id?.group_value || 0,
      groupName: userInfo?.group_id?.group_name || "N/A",
      profit: totalProfit,
      relationshipManager: userInfo?.group_id?.relationship_manager?.name || "N/A",
      reffered_by: userInfo?.agent
        ? userInfo.agent?.name
        : userInfo?.referred_customer
          ? userInfo?.referred_customer?.full_name
          : "N/A",
      payment_type: userInfo?.payment_type || "N/A",
      referred_type: userInfo?.referred_type || "N/A",
      enrollmentDate: userInfo?.createdAt
        ? userInfo?.createdAt.split("T")[0]
        : "",
      totalToBePaid: groupType === "double"
        ? groupInstall * auctionCount + groupInstall
        : totalPayable + groupInstall + totalProfit,
      toBePaidAmount: groupType === "double"
        ? groupInstall * auctionCount + groupInstall
        : totalPayable + groupInstall + firstDividentHead,
      balance: groupType === "double"
        ? groupInstall * auctionCount + groupInstall - totalPaidAmount
        : totalPayable + groupInstall + firstDividentHead - totalPaidAmount,
      chit_asking_month: userInfo?.chit_asking_month || "N/A",
      status: userInfo?.auctions?.isPrized === "true" ? "Prized" : "Un Prized",
      statusDiv: userInfo?.auctions?.isPrized === "true" ? (
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg shadow-sm border border-emerald-200">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold text-sm">Prized</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg shadow-sm border border-amber-200">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold text-sm">Un Prized</span>
        </div>
      ),
    };
  };

  const groupOptions = useMemo(() => 
    [...new Set(usersData.map((u) => u.groupName))], 
    [usersData]
  );

  const filteredUsers = useMemo(() => {
    return filterOption(
      usersData.filter((u) => {
        const matchGroup = filters.groupFilter ? u.groupName === filters.groupFilter : true;
        const enrollmentDate = new Date(u.enrollmentDate);
        const matchFromDate = filters.fromDate
          ? enrollmentDate >= new Date(filters.fromDate)
          : true;
        const matchToDate = filters.toDate ? enrollmentDate <= new Date(filters.toDate) : true;
        return matchGroup && matchFromDate && matchToDate;
      }),
      searchText
    );
  }, [usersData, filters, searchText]);

  const totals = useMemo(() => {
    const totalCustomers = filteredUsers.length;
    const groupSet = new Set(filteredUsers.map((user) => user.groupName));
    const totalGroups = filters.groupFilter ? 1 : groupSet.size;

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

    return {
      totalCustomers,
      totalGroups,
      totalToBePaid,
      totalProfit,
      totalPaid,
      totalBalance,
    };
  }, [filteredUsers, filters.groupFilter]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setScreenLoading(true);
        setError(null);
        
        const reportResponse = await api.get("/user");
        const reportData = reportResponse.data.data.map(transformUserData);
        
        setUsersData(reportData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
        message.error("Failed to load data. Please try again later.");
      } finally {
        setScreenLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const Auctioncolumns = [
    { key: "sl_no", header: "SL. NO" },
    { key: "customerId", header: "Customer Id" },
    { key: "userName", header: "Customer Name" },
    { key: "userPhone", header: "Phone Number" },
    { key: "groupName", header: "Group Name" },
    { key: "groupValue", header: "Group Value" },
    { key: "paymentsTicket", header: "Ticket" },
    { key: "enrollmentDate", header: "Enrollment Date" },
    { key: "referred_type", header: "Referred Type" },
    { key: "reffered_by", header: "Referred By" },
    { key: "chit_asking_month", header: "Chit Asking Month" },
    { key: "relationshipManager", header: "Relationship Manager" },
    { key: "payment_type", header: "Payment Type" },
    { key: "firstInstallment", header: "First Installment" },
    { key: "firstInstallmentStatus", header: "First Installment Status" },
    { key: "amountPaid", header: "Amount Paid" },
    { key: "totalToBePaid", header: "Amount to be Paid" },
    { key: "balance", header: "Balance" },
    { key: "collectionArea", header: "Collection Area" },
    { key: "collectionExecutive", header: "Collection Executive" },
    { key: "statusDiv", header: "Status" },
  ];

  const ExcelColumns = [
    { key: "sl_no", header: "SL. NO" },
    { key: "customerId", header: "Customer Id" },
    { key: "userName", header: "Customer Name" },
    { key: "userPhone", header: "Phone Number" },
    { key: "groupName", header: "Group Name" },
    { key: "groupValue", header: "Group Value" },
    { key: "paymentsTicket", header: "Ticket" },
    { key: "enrollmentDate", header: "Enrollment Date" },
    { key: "referred_type", header: "Referred Type" },
    { key: "reffered_by", header: "Referred By" },
    { key: "relationshipManager", header: "Relationship Manager" },
    { key: "payment_type", header: "Payment Type" },
    { key: "firstInstallment", header: "First Installment" },
    { key: "amountPaid", header: "Amount Paid" },
    { key: "totalToBePaid", header: "Amount to be Paid" },
    { key: "balance", header: "Balance" },
    { key: "collectionArea", header: "Collection Area" },
    { key: "collectionExecutive", header: "Collection Executive" },
    { key: "status", header: "Status" },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex mt-30">
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        {screenLoading ? (
          <div className="w-full flex flex-col justify-center items-center min-h-screen">
            <CircularLoader color="text-indigo-600" />
            <p className="mt-6 text-lg text-gray-600 font-medium">Loading user data...</p>
          </div>
        ) : error ? (
          <div className="w-full flex justify-center items-center p-8 min-h-screen">
            <div className="bg-white border-l-4 border-red-500 text-red-700 px-6 py-5 rounded-lg shadow-lg max-w-md">
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Error Loading Data</h3>
                  <p className="text-sm">{error}</p>
                  <button 
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                    onClick={() => window.location.reload()}
                  >
                    Retry Loading
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow max-w-screen p-4">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
              <div className="flex items-center justify-center gap-3 mb-2">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  All Customer Reports
                </h1>
              </div>
              <p className="text-center text-gray-500 text-sm">Comprehensive overview of customer data and analytics</p>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
              </div>
              
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Group Filter
                  </label>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    allowClear
                    placeholder="Select group or view all"
                    onChange={(value) => handleFilterChange("groupFilter", value)}
                    value={filters.groupFilter || undefined}
                    className="rounded-lg"
                  >
                    {groupOptions.map((group) => (
                      <Select.Option key={group} value={group}>
                        {group}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors duration-200"
                  />
                </div>

                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => handleFilterChange("toDate", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-white bg-opacity-20 rounded-lg p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-medium opacity-90 block mb-1">Total Customers</span>
                <span className="text-2xl font-bold">{totals.totalCustomers}</span>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-white bg-opacity-20 rounded-lg p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-medium opacity-90 block mb-1">Total Groups</span>
                <span className="text-2xl font-bold">{totals.totalGroups}</span>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-white bg-opacity-20 rounded-lg p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-medium opacity-90 block mb-1">Amount to be Paid</span>
                <span className="text-2xl font-bold">₹{totals.totalToBePaid.toLocaleString("en-IN")}</span>
              </div>

              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-white bg-opacity-20 rounded-lg p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-medium opacity-90 block mb-1">Total Profit</span>
                <span className="text-2xl font-bold">₹{totals.totalProfit.toLocaleString("en-IN")}</span>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-white bg-opacity-20 rounded-lg p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-medium opacity-90 block mb-1">Total Amount Paid</span>
                <span className="text-2xl font-bold">₹{totals.totalPaid.toLocaleString("en-IN")}</span>
              </div>

              <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-white bg-opacity-20 rounded-lg p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-medium opacity-90 block mb-1">Total Balance</span>
                <span className="text-2xl font-bold">₹{totals.totalBalance.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Data Table Section */}
            <div >
              <DataTable
                data={filteredUsers}
                columns={Auctioncolumns}
                exportCols={ExcelColumns}
                exportedPdfName={`All Customer Report`}
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
                  filters.fromDate
                    ? new Date(filters.fromDate).toLocaleDateString("en-GB")
                    : "—",
                  filters.groupFilter || "All Groups",
                  filters.toDate
                    ? new Date(filters.toDate).toLocaleDateString("en-GB")
                    : "—",
                  totals.totalCustomers,
                  totals.totalGroups,
                  `₹${totals.totalToBePaid.toLocaleString("en-IN")}`,
                  `₹${totals.totalProfit.toLocaleString("en-IN")}`,
                  `₹${totals.totalPaid.toLocaleString("en-IN")}`,
                  `₹${totals.totalBalance.toLocaleString("en-IN")}`,
                ]}
                exportedFileName={`CustomerReport.csv`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUserReport;