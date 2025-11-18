import { useEffect, useState, useMemo } from "react";
import { Search, FileText, Users, Calendar, IndianRupee, TrendingUp } from "lucide-react";

import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Select } from "antd";
import CircularLoader from "../components/loaders/CircularLoader";

// const CustomerLoanReport = () => {
//   const [loanReportTable, setLoanReportTable] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedLoanId, setSelectedLoanId] = useState("");
//   const [selectedCustomer, setSelectedCustomer] = useState("");

//   useEffect(() => {
//     const fetchLoanReport = async () => {
//       try {
//         const response = await api.get(`/payment/customers/loan-report`);

//         const formattedData = response.data.loanReports.map((loan, index) => ({
//   id: loan?._id,
//   slNo: index + 1,
//   loanIds: loan?.loan_id || "N/A",
//   loanAmountValue: loan?.loan_amount || 0,

//   customerId: loan?.borrower?.customer_id || "N/A",
//   customerName: loan?.borrower?.full_name || "N/A",
//   customerPhone: loan?.borrower?.phone_number || "N/A",

//   loanStartDate: loan?.start_date
//     ? new Date(loan.start_date).toLocaleDateString("en-GB")
//     : "N/A",

//   loanServiceCharges: loan?.service_charges ?? 0,
//   loanAmount: loan?.double_loan_amount ?? 0,
//   totalLoanAmount: loan?.total_paid_amount ?? 0,
//   loanBalance: loan?.balance ?? 0,

//   // ⭐ New field
//   referredBy: loan?.referredBy || "N/A",
// }));

// console.info(formattedData,"gfshdjgfjhsdfg test")

//         setLoanReportTable(formattedData);
//       } catch (error) {
//         console.error("Error fetching loan report:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLoanReport();
//   }, []);

//   const uniqueLoanCombos = useMemo(() => {
//     const map = new Map();
//     loanReportTable.forEach((loan) => {
//       const key = loan.loanIds;
//       if (!map.has(key)) {
//         map.set(key, { id: key, label: `${key} | ₹${loan.loanAmountValue}` });
//       }
//     });
//     return Array.from(map.values());
//   }, [loanReportTable]);

//   const uniqueCustomers = useMemo(
//     () =>
//       loanReportTable.map((loan) => ({
//         id: loan.id,
//         name: loan.customerName,
//         phone: loan.customerPhone,
//         custid: loan.customerId,
//       })),
//     [loanReportTable]
//   );

//   const filteredLoanReport = useMemo(() => {
//     return loanReportTable.filter((loan) => {
//       const matchLoanId = selectedLoanId
//         ? loan.loanIds === selectedLoanId
//         : true;
//       const matchCustomer = selectedCustomer
//         ? loan.id === selectedCustomer
//         : true;
//       return matchLoanId && matchCustomer;
//     });
//   }, [loanReportTable, selectedLoanId, selectedCustomer]);

//   // Calculate summary statistics
//   const summaryStats = useMemo(() => {
//     const filtered = filteredLoanReport;
//     return {
//       totalLoans: filtered.length,
//       totalAmount: filtered.reduce((sum, loan) => sum + loan.loanAmount, 0),
//       totalPaid: filtered.reduce((sum, loan) => sum + loan.totalLoanAmount, 0),
//       totalBalance: filtered.reduce((sum, loan) => sum + loan.loanBalance, 0),
//     };
//   }, [filteredLoanReport]);

//   const loanReportColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "loanIds", header: "Loan ID" },
//     { key: "customerName", header: "Customer Name" },
//     { key: "customerPhone", header: "Phone Number" },
//     { key: "loanStartDate", header: "Loan Start Date" },
//     { key: "loanServiceCharges", header: "Service Charges" },
//     { key: "loanAmount", header: "Loan Amount" },
//     { key: "totalLoanAmount", header: "Total Paid Loan Amount" },
//     { key: "referredBy", header: "Referred By" },
//     { key: "loanBalance", header: "Balance" },
//   ];

//   const StatCard = ({ icon: Icon, label, value, color }) => (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
//           <p className="text-2xl font-bold text-gray-900">{value}</p>
//         </div>
//         <div className={`p-3 rounded-lg ${color}`}>
//           <Icon className="w-6 h-6 text-white" />
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="p-2 bg-blue-600 rounded-lg">
//               <FileText className="w-6 h-6 text-white" />
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900">
//               Customer Loan Report
//             </h1>
//           </div>
//           <p className="text-gray-600 ml-14">
//             Comprehensive overview of all customer loans and payments
//           </p>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center h-96">
//             <CircularLoader />
//           </div>
//         ) : (
//           <>
//             {/* Summary Statistics */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//               <StatCard
//                 icon={FileText}
//                 label="Total Loans"
//                 value={summaryStats.totalLoans}
//                 color="bg-gradient-to-br from-blue-500 to-blue-600"
//               />
//               <StatCard
//                 icon={IndianRupee}
//                 label="Total Loan Amount"
//                 value={`₹${summaryStats.totalAmount.toLocaleString('en-IN')}`}
//                 color="bg-gradient-to-br from-purple-500 to-purple-600"
//               />
//               <StatCard
//                 icon={TrendingUp}
//                 label="Total Paid"
//                 value={`₹${summaryStats.totalPaid.toLocaleString('en-IN')}`}
//                 color="bg-gradient-to-br from-green-500 to-green-600"
//               />
//               <StatCard
//                 icon={Calendar}
//                 label="Total Balance"
//                 value={`₹${summaryStats.totalBalance.toLocaleString('en-IN')}`}
//                 color="bg-gradient-to-br from-orange-500 to-orange-600"
//               />
//             </div>

//             {/* Filters Section */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
//               <div className="flex items-center gap-2 mb-4">
//                 <Search className="w-5 h-5 text-gray-600" />
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Filter Options
//                 </h2>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Loan ID & Amount Filter */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     <div className="flex items-center gap-2">
//                       <FileText className="w-4 h-4" />
//                       Loan ID & Amount
//                     </div>
//                   </label>
//                   <Select
//                     showSearch
//                     placeholder="Search or select loan"
//                     value={selectedLoanId}
//                     onChange={setSelectedLoanId}
//                     allowClear
//                     filterOption={(input, option) =>
//                       option.label.toLowerCase().includes(input.toLowerCase())
//                     }
//                     optionLabelProp="label"
//                     className="w-full"
//                     size="large"
//                   >
//                     <Select.Option value="" label="All Loans">
//                       All Loans
//                     </Select.Option>
//                     {uniqueLoanCombos.map((loan) => (
//                       <Select.Option
//                         key={loan.id}
//                         value={loan.id}
//                         label={loan.label}
//                       >
//                         {loan.label}
//                       </Select.Option>
//                     ))}
//                   </Select>
//                 </div>

//                 {/* Customer Filter */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     <div className="flex items-center gap-2">
//                       <Users className="w-4 h-4" />
//                       Customer
//                     </div>
//                   </label>
//                   <Select
//                     showSearch
//                     placeholder="Search or select customer"
//                     value={selectedCustomer}
//                     onChange={setSelectedCustomer}
//                     allowClear
//                     optionLabelProp="label"
//                     className="w-full"
//                     size="large"
//                     filterOption={(input, option) =>
//                       option.label.toLowerCase().includes(input.toLowerCase())
//                     }
//                   >
//                     <Select.Option value="" label="All Customers">
//                       All Customers
//                     </Select.Option>
//                     {uniqueCustomers.map((cust) => (
//                       <Select.Option
//                         key={cust.id}
//                         value={cust.id}
//                         label={`${cust.custid} | ${cust.name} | ${cust.phone}`}
//                       >
//                         {cust.custid} | {cust.name} | {cust.phone}
//                       </Select.Option>
//                     ))}
//                   </Select>
//                 </div>
//               </div>
//             </div>

//             {/* Data Table Section */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-2">
//               <DataTable
//                 columns={loanReportColumns}
//                 data={filteredLoanReport}
//                 exportedPdfName="Customer Loan Report"
//               />
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

const CustomerLoanReport = () => {
  const [loanReportTable, setLoanReportTable] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedReferredBy, setSelectedReferredBy] = useState(""); // ⭐ NEW STATE

  // -----------------------------------------
  // FETCH LOAN REPORT DATA
  // -----------------------------------------
  useEffect(() => {
    const fetchLoanReport = async () => {
      try {
        const response = await api.get(`/payment/customers/loan-report`);

        const formattedData = response.data.loanReports.map((loan, index) => ({
          id: loan?._id,
          slNo: index + 1,
          loanIds: loan?.loan_id || "N/A",
          loanAmountValue: loan?.loan_amount || 0,

          customerId: loan?.borrower?.customer_id || "N/A",
          customerName: loan?.borrower?.full_name || "N/A",
          customerPhone: loan?.borrower?.phone_number || "N/A",

          loanStartDate: loan?.start_date
            ? new Date(loan.start_date).toLocaleDateString("en-GB")
            : "N/A",

          loanServiceCharges: loan?.service_charges ?? 0,
          loanAmount: loan?.double_loan_amount ?? 0,
          totalLoanAmount: loan?.total_paid_amount ?? 0,
          loanBalance: loan?.balance ?? 0,

          referredBy: loan?.referredBy || "N/A", // ⭐ IMPORTANT
        }));

        setLoanReportTable(formattedData);
      } catch (error) {
        console.error("Error fetching loan report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanReport();
  }, []);

  // -----------------------------------------
  // UNIQUE DROPDOWNS
  // -----------------------------------------
  const uniqueLoanCombos = useMemo(() => {
    const map = new Map();
    loanReportTable.forEach((loan) => {
      const key = loan.loanIds;
      if (!map.has(key)) {
        map.set(key, { id: key, label: `${key} | ₹${loan.loanAmountValue}` });
      }
    });
    return Array.from(map.values());
  }, [loanReportTable]);

  const uniqueCustomers = useMemo(
    () =>
      loanReportTable.map((loan) => ({
        id: loan.id,
        name: loan.customerName,
        phone: loan.customerPhone,
        custid: loan.customerId,
      })),
    [loanReportTable]
  );

  // ⭐ NEW → UNIQUE ReferredBy List
  const uniqueReferredBy = useMemo(() => {
    const set = new Set();
    loanReportTable.forEach((loan) => {
      if (loan.referredBy && loan.referredBy !== "N/A") {
        set.add(loan.referredBy);
      }
    });
    return Array.from(set);
  }, [loanReportTable]);

  // -----------------------------------------
  // FILTER LOGIC
  // -----------------------------------------
  const filteredLoanReport = useMemo(() => {
    return loanReportTable.filter((loan) => {
      const matchLoanId = selectedLoanId ? loan.loanIds === selectedLoanId : true;
      const matchCustomer = selectedCustomer ? loan.id === selectedCustomer : true;
      const matchReferredBy = selectedReferredBy ? loan.referredBy === selectedReferredBy : true;

      return matchLoanId && matchCustomer && matchReferredBy;
    });
  }, [loanReportTable, selectedLoanId, selectedCustomer, selectedReferredBy]);

  // -----------------------------------------
  // SUMMARY CARDS
  // -----------------------------------------
  const summaryStats = useMemo(() => {
    const filtered = filteredLoanReport;
    return {
      totalLoans: filtered.length,
      totalAmount: filtered.reduce((sum, loan) => sum + loan.loanAmount, 0),
      totalPaid: filtered.reduce((sum, loan) => sum + loan.totalLoanAmount, 0),
      totalBalance: filtered.reduce((sum, loan) => sum + loan.loanBalance, 0),
    };
  }, [filteredLoanReport]);

  // -----------------------------------------
  // TABLE COLUMNS
  // -----------------------------------------
  const loanReportColumns = [
    { key: "slNo", header: "Sl No" },
    { key: "loanIds", header: "Loan ID" },
    { key: "customerName", header: "Customer Name" },
    { key: "customerPhone", header: "Phone Number" },
    { key: "loanStartDate", header: "Loan Start Date" },
    { key: "loanServiceCharges", header: "Service Charges" },
    { key: "loanAmount", header: "Loan Amount" },
    { key: "totalLoanAmount", header: "Total Paid Loan Amount" },
    { key: "referredBy", header: "Referred By" },
    { key: "loanBalance", header: "Balance" },
  ];

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" /> Customer Loan Report
          </h1>
          <p className="text-gray-600 ml-10">
            Overview of customer loans, payments & referral details
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <CircularLoader />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon={FileText} label="Total Loans" value={summaryStats.totalLoans} color="bg-blue-600" />
              <StatCard icon={IndianRupee} label="Total Loan Amount" value={`₹${summaryStats.totalAmount}`} color="bg-purple-600" />
              <StatCard icon={TrendingUp} label="Total Paid" value={`₹${summaryStats.totalPaid}`} color="bg-green-600" />
              <StatCard icon={Calendar} label="Total Balance" value={`₹${summaryStats.totalBalance}`} color="bg-orange-600" />
            </div>

            {/* FILTERS */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Search className="w-5 h-5" /> Filter Options
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Loan Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Loan ID & Amount</label>
                  <Select
                    showSearch
                    placeholder="Select loan"
                    value={selectedLoanId}
                    onChange={setSelectedLoanId}
                    allowClear
                    className="w-full"
                  >
                    <Select.Option value="">All Loans</Select.Option>
                    {uniqueLoanCombos.map((loan) => (
                      <Select.Option key={loan.id} value={loan.id}>
                        {loan.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Customer Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Customer</label>
                  <Select
                    showSearch
                    placeholder="Select customer"
                    value={selectedCustomer}
                    onChange={setSelectedCustomer}
                    allowClear
                    className="w-full"
                  >
                    <Select.Option value="">All Customers</Select.Option>
                    {uniqueCustomers.map((cust) => (
                      <Select.Option
                        key={cust.id}
                        value={cust.id}
                      >
                        {cust.custid} | {cust.name} | {cust.phone}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* ⭐ NEW Referred By Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Referred By</label>
                  <Select
                    showSearch
                    placeholder="Select referrer"
                    value={selectedReferredBy}
                    onChange={setSelectedReferredBy}
                    allowClear
                    className="w-full"
                  >
                    <Select.Option value="">All Referred By</Select.Option>
                    {uniqueReferredBy.map((ref) => (
                      <Select.Option key={ref} value={ref}>
                        {ref}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border p-2">
              <DataTable
                columns={loanReportColumns}
                data={filteredLoanReport}
                exportedPdfName="Customer Loan Report"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerLoanReport;