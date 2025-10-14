import { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import { Dropdown, Select, Input } from "antd";
import { IoMdMore } from "react-icons/io";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { FaCalculator } from "react-icons/fa";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { fieldSize } from "../data/fieldSize";
import { header } from "framer-motion/client";


// const CustomerLoanReport = () => {

//   const [loanReportTable, setLoanReportTable] = useState("");
//   const [loading, setLoading] = useState(true);


//    useEffect(() => {
//     const fetchLoanReport = async () => {
//       try {
//         const response = await api.get(`/payment/customers/loan-report`);

//         const formattedData = response.data.loanReports.map((loan, index) => ({
//           id: loan?._id,
//           slNo: index + 1,
//           loanIds: loan?.loan_id || "N/A",
//           customerName: loan?.borrower?.full_name || "N/A",
//           customerPhone: loan?.borrower?.phone_number || "N/A",
//           loanStartDate: loan?.start_date
//             ? new Date(loan.start_date).toLocaleDateString("en-GB") // dd/mm/yyyy
//             : "N/A",
//           loanServiceCharges: loan?.service_charges ?? 0,
//           loanAmount: loan?.double_loan_amount ?? 0,
//           totalLoanAmount: loan?.total_paid_amount ?? 0,
//           loanBalance: loan?.balance ?? 0,
//         }));

//         setLoanReportTable(formattedData);
//       } catch (error) {
//         console.error("Error fetching loan report:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLoanReport();
//   }, []);

//   const loanReportColumns = [
//     {key: "slNo", header: "Sl No"},
//     {key: "loanIds", header: "loan ID"},
//     {key: "customerName", header: "Customer Name"},
//     {key: "customerPhone", header: "Phone Number"},
//     {key: "loanStartDate", header: "Loan Start Date"},
//     {key: "loanServiceCharges", header: "Service Charges"},
//     {key: "loanAmount", header: "Loan Amount"},
//     {key: "totalLoanAmount", header: "Total Paid Loan Amount"},
//     {key: "loanBalance", header: "Balance"}
//   ]
//   return (
//     <div className="p-4">
//       <h1 className="font-bold text-2xl mb-5">Loan Report</h1>

//       {loading ? (
//               <div className="flex w-screen justify-center items-center">
//                 <CircularLoader />;
//               </div>
//             ) : (
//         <DataTable columns={loanReportColumns} data={loanReportTable} 
//         exportedPdfName="Loan Report"
//         />
//       )}
//     </div>
//   );
// };

const CustomerLoanReport = () => {
  const [loanReportTable, setLoanReportTable] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    const fetchLoanReport = async () => {
      try {
        const response = await api.get(`/payment/customers/loan-report`);

        const formattedData = response.data.loanReports.map((loan, index) => ({
          id: loan?._id,
          slNo: index + 1,
          loanIds: loan?.loan_id || "N/A",
          customerName: loan?.borrower?.full_name || "N/A",
          customerPhone: loan?.borrower?.phone_number || "N/A",
          loanStartDate: loan?.start_date
            ? new Date(loan.start_date).toLocaleDateString("en-GB")
            : "N/A",
          loanServiceCharges: loan?.service_charges ?? 0,
          loanAmount: loan?.double_loan_amount ?? 0,
          totalLoanAmount: loan?.total_paid_amount ?? 0,
          loanBalance: loan?.balance ?? 0,
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

  // Get unique loan IDs and customers for filter dropdowns
  const uniqueLoanIds = useMemo(
    () => [...new Set(loanReportTable.map((loan) => loan.loanIds))],
    [loanReportTable]
  );

  const uniqueCustomers = useMemo(
    () =>
      loanReportTable.map((loan) => ({
        id: loan.id,
        name: loan.customerName,
        phone: loan.customerPhone,
      })),
    [loanReportTable]
  );

  // Filtered data based on selected filters
  const filteredLoanReport = useMemo(() => {
    return loanReportTable.filter((loan) => {
      const matchLoanId = selectedLoanId
        ? loan.loanIds === selectedLoanId
        : true;
      const matchCustomer = selectedCustomer
        ? loan.id === selectedCustomer
        : true;
      return matchLoanId && matchCustomer;
    });
  }, [loanReportTable, selectedLoanId, selectedCustomer]);

  const loanReportColumns = [
    { key: "slNo", header: "Sl No" },
    { key: "loanIds", header: "Loan ID" },
    { key: "customerName", header: "Customer Name" },
    { key: "customerPhone", header: "Phone Number" },
    { key: "loanStartDate", header: "Loan Start Date" },
    { key: "loanServiceCharges", header: "Service Charges" },
    { key: "loanAmount", header: "Loan Amount" },
    { key: "totalLoanAmount", header: "Total Paid Loan Amount" },
    { key: "loanBalance", header: "Balance" },
  ];

  return (
    <div className="p-4">
      <h1 className="font-bold text-2xl mb-5">Customer Loan Report</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        {/* Loan ID Filter */}
        <div className="w-full max-w-xs">
          <label className="block mb-1">Loan ID</label>
          <Select
            showSearch
            placeholder="Search or Select Loan ID"
            value={selectedLoanId}
            onChange={setSelectedLoanId}
            allowClear
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            className="w-full"
          >
            <Select.Option value="">All</Select.Option>
            {uniqueLoanIds.map((loanId) => (
              <Select.Option key={loanId} value={loanId}>
                {loanId}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Customer Filter */}
        <div className="w-full max-w-xs">
  <label className="block mb-1">Customer</label>
  <Select
    showSearch
    placeholder="Search or Select Customer"
    value={selectedCustomer}
    onChange={setSelectedCustomer}
    allowClear
    optionLabelProp="label" // important for search
    className="w-full"
    filterOption={(input, option) =>
      option.label.toLowerCase().includes(input.toLowerCase())
    }
  >
    <Select.Option value="" label="All">
      All
    </Select.Option>
    {uniqueCustomers.map((cust) => (
      <Select.Option
        key={cust.id}
        value={cust.id}
        label={`${cust.name} | ${cust.phone}`} // <-- used for search
      >
        {cust.name} | {cust.phone} 
      </Select.Option>
    ))}
  </Select>
</div>
      </div>

      {loading ? (
        <div className="flex w-screen justify-center items-center">
          <CircularLoader />
        </div>
      ) : (
        <DataTable
          columns={loanReportColumns}
          data={filteredLoanReport}
          exportedPdfName="Customer Loan Report"
        />
      )}
    </div>
  );
};

export default CustomerLoanReport;