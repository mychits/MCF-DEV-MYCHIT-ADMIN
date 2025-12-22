import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import DataTable from "../components/layouts/Datatable";
import api from "../instance/TokenInstance";
import CircularLoader from "../components/loaders/CircularLoader";

const UnapprovedLoans = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);


        const loanRes = await api.get("/loans/loan-approval-request");
        const loans = loanRes.data.data || [];

     
        const formatted = await Promise.all(
          loans.map(async (loan, index) => {
            let user = {};

            try {
              const userRes = await api.get(
                `user/get-user-by-id/${loan.user_id}`
              );
              user = userRes.data;
            } catch (err) {
              console.error("User fetch failed", err);
            }

            return {
              id: index + 1,
              customer_name: user?.full_name || "-",
              phone_number: user?.phone_number || "-",
              address: user?.address || "-",
              loan_amount: loan.loan_amount,
              loan_purpose: loan.loan_purpose,
              approval_status: (
                <span className="inline-block px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                  Pending
                </span>
              ),
            };
          })
        );

        setTableData(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const columns = [
    { key: "id", header: "SL.NO" },
    { key: "customer_name", header: "Customer Name" },
    { key: "phone_number", header: "Phone Number" },
    { key: "address", header: "Address" },
    { key: "loan_amount", header: "Loan Amount" },
    { key: "loan_purpose", header: "Loan Purpose" },
    { key: "approval_status", header: "Approval Status" },
  ];

  return (
    <div className="flex mt-20">
      <Sidebar />
      <Navbar visibility />

      <div className="flex-grow p-7">
        <h1 className="text-2xl font-semibold mb-6">
          Unapproved Loan Requests
        </h1>

        {!loading && tableData.length > 0 ? (
          <DataTable
            data={tableData}
            columns={columns}
            exportedPdfName="Unapproved Loans"
            exportedFileName="unapproved_loans.csv"
          />
        ) : (
          <CircularLoader
            isLoading={loading}
            failure={tableData.length === 0}
            data="Loan Requests"
          />
        )}
      </div>
    </div>
  );
};

export default UnapprovedLoans;
