/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select } from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import moment from "moment";

const OutstandingReport = () => {
  const [searchText, setSearchText] = useState("");
  const [screenLoading, setScreenLoading] = useState(true);
  const [usersData, SetUsersData] = useState([]);
  const [groupFilter, setGroupFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const groupOptions = [...new Set(usersData.map((u) => u.groupName))];

  const [totals, setTotals] = useState({
    totalCustomers: 0,
    totalGroups: 0,
    totalToBePaid: 0,
    totalPaid: 0,
    totalBalance: 0,
    totalPenalty: 0,
    totalLateFee: 0,
    totalRegularPenalty: 0,
    totalVcPenalty: 0,
    totalOverdueCharges: 0,
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
        const [reportResponse, penaltyResponse] = await Promise.all([
          api.get("/user/all-customers-report"),
          api.get("/penalty/get-penalty-report"),
        ]);

        const allPenaltyData = penaltyResponse.data?.data || [];
        const penaltyMap = new Map();
        allPenaltyData.forEach((penalty) => {
          const key = `${penalty.user_id}_${penalty.group_id}`;
          penaltyMap.set(key, penalty);
        });

        const usersList = [];
        let count = 1;

        for (const usrData of reportResponse.data || []) {
          if (usrData?.data) {
            for (const data of usrData.data) {
              if (data?.enrollment?.group) {
                const groupId = data.enrollment.group._id;
                const userId = usrData._id;
                const penaltyKey = `${userId}_${groupId}`;
                const penaltyData = penaltyMap.get(penaltyKey) || {
                  summary: {
                    total_penalty: 0,
                    total_late_payment_charges: 0,
                    grand_total_due_with_penalty: 0,
                  },
                };

                const summary = penaltyData.summary || {};
                let vcPenalty = summary.total_vacant_chit_penalty || 0;
                let regularPenalty = Math.max(0, (summary.total_penalty || 0) - vcPenalty);
                let totalLateFee = summary.total_late_payment_charges || 0;
                const totalPenalty = regularPenalty + vcPenalty;
                const totalOverdueCharges = totalPenalty + totalLateFee;

                const amountToBePaid = summary.total_expected || 0;
                const amountPaid = summary.total_paid || 0;
                const balanceWithoutPenalty = amountToBePaid - amountPaid;
                const balanceWithPenalty = summary.grand_total_due_with_penalty || 0;

                // ❌ Skip only if fully paid AND no penalties
                if (balanceWithPenalty <= 0 && totalOverdueCharges === 0) continue;

                const enrollmentDateStr = data.enrollment.createdAt
                  ? data.enrollment.createdAt.split("T")[0]
                  : "";

                usersList.push({
                  _id: data.enrollment._id,
                  sl_no: count,
                  userName: usrData.userName,
                  userPhone: usrData.phone_number,
                  customerId: usrData.customer_id,
                  amountPaid,
                  paymentsTicket: data.payments.ticket,
                  amountToBePaid,
                  groupName: data.enrollment.group.group_name,
                  groupValue: data?.enrollment?.group?.group_value,
                  enrollmentDate: enrollmentDateStr,
                  payment_type: data?.enrollment?.payment_type,
                  relationshipManager:
                    data?.enrollment?.relationship_manager?.name || "N/A",
                  collectionExecutive: usrData?.collection_executive?.join(" | ") || "N/A",
                  collectionArea: usrData.collection_area || "N/A",
                  referred_type: data?.enrollment?.referred_type,
                  reffered_by: data?.enrollment?.agent
                    ? data.enrollment.agent
                    : data?.enrollment?.reffered_customer
                    ? data.enrollment.reffered_customer
                    : data?.enrollment?.reffered_lead
                    ? data.enrollment.reffered_lead
                    : "N/A",
                  balance: balanceWithPenalty,
                  balanceWithoutPenalty,
                  status: data.isPrized === "true" ? "Prized" : "Un Prized",
                  statusDiv: data.isPrized === "true" ? (
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full shadow-sm border border-green-300">
                      <span className="font-semibold text-sm">Prized</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full shadow-sm border border-red-300">
                      <span className="font-semibold text-sm">Un Prized</span>
                    </div>
                  ),

                  // 🔹 Penalty fields
                  regularPenalty,
                  vcPenalty,
                  totalPenalty,
                  totalLateFee,
                  totalOverdueCharges,
                });
                count++;
              }
            }
          }
        }

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

    const totalToBePaid = filteredUsers.reduce((sum, u) => sum + (u.amountToBePaid || 0), 0);
    const totalPaid = filteredUsers.reduce((sum, u) => sum + (u.amountPaid || 0), 0);
    const totalBalance = filteredUsers.reduce((sum, u) => sum + (u.balance || 0), 0);

    const totalPenalty = filteredUsers.reduce((sum, u) => sum + (u.totalPenalty || 0), 0);
    const totalLateFee = filteredUsers.reduce((sum, u) => sum + (u.totalLateFee || 0), 0);
    const totalRegularPenalty = filteredUsers.reduce((sum, u) => sum + (u.regularPenalty || 0), 0);
    const totalVcPenalty = filteredUsers.reduce((sum, u) => sum + (u.vcPenalty || 0), 0);
    const totalOverdueCharges = filteredUsers.reduce((sum, u) => sum + (u.totalOverdueCharges || 0), 0);

    setTotals({
      totalCustomers,
      totalGroups,
      totalToBePaid,
      totalPaid,
      totalBalance,
      totalPenalty,
      totalLateFee,
      totalRegularPenalty,
      totalVcPenalty,
      totalOverdueCharges,
    });
  }, [filteredUsers, groupFilter]);

  // 🔹 Table Columns
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
    {
      key: "amountToBePaid",
      header: "Amount to be Paid",
      render: (text) => (
        <span className="font-semibold text-green-600">
          ₹{Number(text || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    { key: "relationshipManager", header: "Relationship Manager" },
    { key: "collectionExecutive", header: "Collection Executive" },
    { key: "collectionArea", header: "Collection Area" },
    {
      key: "amountPaid",
      header: "Amount Paid",
      render: (text) => (
        <span className="font-semibold text-indigo-600">
          ₹{Number(text || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "balanceWithoutPenalty",
      header: "Balance",
      render: (text, record) => {
        const val = Number(record.balanceWithoutPenalty || 0);
        return (
          <span className={`font-semibold ${val > 0 ? "text-red-600" : "text-green-600"}`}>
            ₹{val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    
    {
      key: "totalPenalty",
      header: "Penalty",
      render: (text, record) => (
        <span className="font-semibold text-purple-800">
          ₹{Number(record.totalPenalty || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "totalLateFee",
      header: "Late Fee",
      render: (text, record) => (
        <span className="font-semibold text-orange-600">
          ₹{Number(record.totalLateFee || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "totalOverdueCharges",
      header: "Total Overdue Charges",
      render: (text, record) => (
        <span className="font-semibold text-red-700">
          ₹{Number(record.totalOverdueCharges || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Outstanding (with Penalty)",
      render: (text, record) => {
        const val = Number(record.balance || 0);
        return (
          <span className={`font-semibold ${val > 0 ? "text-red-600" : "text-green-600"}`}>
            ₹{val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
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
    { key: "amountToBePaid", header: "Amount to be Paid" },
    { key: "amountPaid", header: "Amount Paid" },
    { key: "balanceWithoutPenalty", header: "Balance" },
    { key: "regularPenalty", header: "Regular Penalty" },
    { key: "vcPenalty", header: "VC Penalty" },
    { key: "totalPenalty", header: "Total Penalty" },
    { key: "totalLateFee", header: "Late Fee" },
    { key: "totalOverdueCharges", header: "Total Overdue Charges" },
    { key: "balance", header: "Outstanding with Penalty" },
    { key: "status", header: "Status" },
  ];

  const filteredTableData = useMemo(() => {
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

  return (
    <div className="w-screen">
      <div className="flex mt-20">
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        {screenLoading ? (
          <div className="w-full">
            <CircularLoader color="text-green-600" />
          </div>
        ) : (
          <div className="flex-grow p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Reports - Outstanding</h1>

            {/* Filters */}
            <div className="mb-6 p-4 bg-white rounded shadow">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Filter</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
              <div className="flex flex-col border p-4 rounded shadow">
                <span className="text-sm font-medium text-gray-600">Total Customers</span>
                <span className="text-lg font-bold text-blue-600">{totals.totalCustomers}</span>
              </div>
              <div className="flex flex-col border p-4 rounded shadow">
                <span className="text-sm font-medium text-gray-600">Total Groups</span>
                <span className="text-lg font-bold text-green-600">{totals.totalGroups}</span>
              </div>
              <div className="flex flex-col border p-4 rounded shadow">
                <span className="text-sm font-medium text-gray-600">Amount to be Paid</span>
                <span className="text-lg font-bold text-green-600">
                  ₹{totals.totalToBePaid.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex flex-col border p-4 rounded shadow">
                <span className="text-sm font-medium text-gray-600">Total Paid</span>
                <span className="text-lg font-bold text-indigo-600">
                  ₹{totals.totalPaid.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex flex-col border p-4 rounded shadow">
                <span className="text-sm font-medium text-gray-600">Total Balance</span>
                <span className="text-lg font-bold text-red-600">
                  ₹{totals.totalBalance.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex flex-col border p-4 rounded shadow">
                <span className="text-sm font-medium text-gray-600">Total Overdue Charges</span>
                <span className="text-lg font-bold text-pink-600">
                  ₹{totals.totalOverdueCharges.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Table */}
            <DataTable
              data={filteredTableData}
              columns={Auctioncolumns}
              exportCols={ExcelColumns}
              exportedPdfName="Outstanding Report with Penalties"
              printHeaderKeys={[
                "From Date",
                "To Date",
                "Group",
                "Total Customers",
                "Total Overdue Charges",
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
                `₹${totals.totalOverdueCharges.toLocaleString("en-IN")}`,
                `₹${totals.totalBalance.toLocaleString("en-IN")}`,
              ]}
              exportedFileName="OutstandingReport.csv"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OutstandingReport;