import React, { useState } from "react";

import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import CircularLoader from "../components/loaders/CircularLoader";
import Sidebar from "../components/layouts/Sidebar";
import API from "../instance/TokenInstance";
import { useEffect } from "react";

const PaymentLinkTransactions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tableTransactions, setTableTransactions] = useState([]);
  async function getTransactions() {
    try {
      const response = await API.get("/cashfree-pg-orders");
      const transactionsData = response.data?.data;
      const filteredData = transactionsData.map((order,index) => ({
        id:index+1,
        orderType:order?.order_type,
        user_name: order?.user_id?.full_name,
        phone_number: order?.user_id?.phone_number,
        groups: order?.groups,
        pigmys: order?.pigmys,
        loans: order?.loans,
        status:order?.status,
        collectedBy:order?.collected_by
      }));
      setTableTransactions(filteredData);
    } catch (error) {
      setTableTransactions([]); 
    }
  }
  useEffect(() => {
    getTransactions();
  }, []);

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "orderType", header: "Order Type" },
    { key: "user_name", header: "User Name" },
    { key: "phone_number", header: "Phone Number" },
    { key: "status", header: "Status" },
    {key:"collectedBy",header:"Collected By"}
  ];
  return (
    <div>
      <Navbar visibility={true} />

      <div className="flex mt-20">
        <Sidebar />

        <div className="flex-grow p-7">
          <div className="mt-6 mb-8">
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl font-semibold">
                Payment Link Transactions
              </h1>
            </div>
          </div>

          {tableTransactions.length > 0 && !isLoading ? (
            <DataTable
              catcher="_id"
              data={tableTransactions}
              columns={columns}
              exportedPdfName="Payment_Link_Transactions"
              exportedFileName={`Loans.csv`}
            />
          ) : (
            <CircularLoader
              isLoading={isLoading}
              data="Payment Link Transaction Data"
              failure={tableTransactions?.length <= 0}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentLinkTransactions;
