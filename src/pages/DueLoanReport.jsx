import { useEffect, useState, useMemo } from "react";
import { Search, FileText, Users, Calendar, IndianRupee, TrendingUp } from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";

import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Select } from "antd";
import CircularLoader from "../components/loaders/CircularLoader";

const { RangePicker } = DatePicker;

const DueLoanReport = () => {
  const [loanReportTable, setLoanReportTable] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedReferredBy, setSelectedReferredBy] = useState("");
  const [dateRange, setDateRange] = useState(null); // NEW STATE for date range

  useEffect(() => {
    const fetchLoanReport = async () => {
      try {
        const response = await api.get(`/payment/customers/due-loan-report`);
        console.info(response.data)

        const formattedData = response.data.loanReports.filter((loan) => (loan?.balance ?? 0) > 0).map((loan, index) => ({
          id: loan?._id,
          slNo: index + 1,
          loanIds: loan?.loan_id || "N/A",
          loanAmountValue: loan?.loan_amount || 0,

          customerId: loan?.borrower?.customer_id || "N/A",
          customerName: loan?.borrower?.full_name || "N/A",
          customerPhone: loan?.borrower?.phone_number || "N/A",
          daily_payment_amount: loan?.daily_payment_amount || "N/A",
          loanStartDate: loan?.start_date
            ? new Date(loan.start_date).toLocaleDateString("en-GB")
            : "N/A",
          // Store the original date for filtering
          loanStartDateObj: loan?.start_date ? new Date(loan.start_date) : null,
         // loanStartDateObj: loan?.start_date ? new Date(loan.start_date) : null,
          loanEndDate: loan?.end_date ? `${loan?.end_date}`.split("T")[0]
            : "N/A",
          loanSanctionDate: loan?.loan_sanction_date ? `${loan?.loan_sanction_date}`.split("T")[0] : "N/A",
          last_payment_date: loan?.last_payment_date ? `${loan?.last_payment_date}`.split("T")[0]: "N/A",
          last_payment_amount: loan?.last_payment_amount ?? 0,
          second_last_payment_date: loan?.second_last_payment_date ? `${loan?.second_last_payment_date}`.split("T")[0]: "N/A",
          second_last_payment_amount: loan?.second_last_payment_amount ?? 0,
          third_last_payment_date: loan?.third_last_payment_date ? `${loan?.third_last_payment_date}`.split("T")[0]: "N/A",
          third_last_payment_amount: loan?.third_last_payment_amount ?? 0,
        
          loanDocumentCharges: loan?.document_charges ?? 0,
          payableLoanDays: loan?.daysCount,
          duedaysCount: loan?.duedaysCount,
          loanServiceCharges: loan?.service_charges ?? 0,
          loanAmount: loan?.double_loan_amount ?? 0,
          payableAmount: loan?.amount_payable ?? 0,
          totalLoanAmount: loan?.total_paid_amount ?? 0,
          loanBalance: loan?.outstanding ?? 0,
          remainingBalance: loan?.balance ?? 0,
          status: loan?.status || "-",
          referredBy: loan?.referredBy || "N/A",
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

  const uniqueReferredBy = useMemo(() => {
    const set = new Set();
    loanReportTable.forEach((loan) => {
      if (loan.referredBy && loan.referredBy !== "N/A") {
        set.add(loan.referredBy);
      }
    });
    return Array.from(set);
  }, [loanReportTable]);

  const filteredLoanReport = useMemo(() => {
    return loanReportTable.filter((loan) => {
      const matchLoanId = selectedLoanId ? loan.loanIds === selectedLoanId : true;
      const matchCustomer = selectedCustomer ? loan.id === selectedCustomer : true;
      const matchReferredBy = selectedReferredBy ? loan.referredBy === selectedReferredBy : true;

      // NEW: Date range filtering
      let matchDateRange = true;
      if (dateRange && dateRange.length === 2 && loan.loanStartDateObj) {
        const startDate = dayjs(dateRange[0]).startOf('day');
        const endDate = dayjs(dateRange[1]).endOf('day');
        const loanDate = dayjs(loan.loanStartDateObj);
        matchDateRange = loanDate.isAfter(startDate) && loanDate.isBefore(endDate);
      }

      return matchLoanId && matchCustomer && matchReferredBy && matchDateRange;
    });
  }, [loanReportTable, selectedLoanId, selectedCustomer, selectedReferredBy, dateRange]);

  const summaryStats = useMemo(() => {
    const filtered = filteredLoanReport;
    return {
      totalLoans: filtered.length,
      totalAmount: filtered.reduce((sum, loan) => sum + loan.loanAmount, 0),
      totalPayable: filtered.reduce((sum, loan) => sum + loan.payableAmount, 0),
      totalPaid: filtered.reduce((sum, loan) => sum + loan.totalLoanAmount, 0),
      totalBalance: filtered.reduce((sum, loan) => sum + loan.loanBalance, 0),
    };
  }, [filteredLoanReport]);

  const loanReportColumns = [
    { key: "slNo", header: "Sl No" },
    { key: "loanIds", header: "Loan ID" },
    { key: "customerName", header: "Customer Name" },
    { key: "customerPhone", header: "Phone Number" },
    { key: "referredBy", header: "Referred By" },
    {key: "loanSanctionDate", header: "Sanction Date"},
    { key: "loanStartDate", header: "Loan Start Date" },
    {key: "loanEndDate", header: "Loan End Date"},
    { key: "loanServiceCharges", header: "Service Charges" },
    {key: "loanDocumentCharges", header: "Documentation Charges"},
    {key: "daily_payment_amount", header: "Daily Installment"},
    { key: "loanAmount", header: "Loan Amount" },
    {key: "payableLoanDays", header: "Loan Age (in Days)"},
   {key: "third_last_payment_date", header: "Payment Date - 3nd Previous"},
     {key: "third_last_payment_amount", header: "Paid Amount - 3nd Previous  "},
    {key: "second_last_payment_date", header: "Payment Date - 2nd Previous"},
    {key: "second_last_payment_amount", header: "  Paid Amount - 2nd Previous"},
      {key: "last_payment_date", header: "Payment Date - Latest"},
    {key: "last_payment_amount", header: " Payment Amount – Latest"},
    {key: "duedaysCount", header: "Days Since Last Payment"},
    { key: "payableAmount", header: "Loan Payable" },
    { key: "totalLoanAmount", header: "Total Paid" },
    {key: "remainingBalance", header: "Balance"},
    { key: "loanBalance", header: "OutStanding" },
    {key: "status", header: "Status"},

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

  return (
    <div className="max-w-screen">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" /> Customer OutStanding Loan Report
          </h1>
          <p className="text-gray-600 ml-10">
            Overview of customer outstanding loans, payments & referral details
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
              <StatCard icon={TrendingUp} label="Total Payable" value={`₹${summaryStats.totalPayable}`} color="bg-blue-600" />
              <StatCard icon={TrendingUp} label="Total Paid" value={`₹${summaryStats.totalPaid}`} color="bg-green-600" />
              <StatCard icon={Calendar} label="Total Balance" value={`₹${summaryStats.totalBalance}`} color="bg-orange-600" />
            </div>

            {/* FILTERS */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Search className="w-5 h-5" /> Filter Options
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                {/* Referred By Filter */}
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

                {/* NEW: Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date Range</label>
                  <RangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className="w-full"
                    format="DD/MM/YYYY"
                  />
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="max-w-screen">
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

export default DueLoanReport;