import React, { useState } from "react";

import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import CircularLoader from "../components/loaders/CircularLoader";
import Sidebar from "../components/layouts/Sidebar";
import API from "../instance/TokenInstance";
import { useEffect } from "react";
import { Tag } from 'antd';
import dayjs from "dayjs";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
const PaymentLinkTransactions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tableTransactions, setTableTransactions] = useState([]);
  async function getTransactions() {
    try {
      setIsLoading(true);
      const response = await API.get("/cashfree-pg-orders");
      const transactionsData = response.data?.data;
      const filteredData = transactionsData.map((order, index) => {
        const status = order?.status;
        const color = status === "ACTIVE" ? "blue" : status === "PAID" ? "green" : "red"
        const icon = status === "ACTIVE" ? <ClockCircleOutlined /> : status === "PAID" ? <CheckCircleOutlined /> : <CloseCircleOutlined />;
        const groups = order?.groups;
        const pigmys = order.pigmys;
        const loans = order?.loans;
        const groupsString = (groups?.map(group => `${group?.group_id?.group_name} | ${group?.ticket}`) || []).join(" | ");
        const  pigmysString =(pigmys?.map(pigmy => `${pigmy?.payable_amount} | ${pigmy?.pigme_id}`) || []).join(" | ");
        const  loansString = (loans?.map(loan => `${loan?.loan_amount} | ${loan?.loan_id}`) || []).join(" | ");
        return ({
          id: index + 1,
          orderType: order?.order_type,
          user_name: order?.user_id?.full_name,
          phone_number: order?.user_id?.phone_number,
          groups: (groups?.map(group => `${group?.group_id?.group_name} | ${group?.ticket}`) || []).join(" | "),
          pigmys:(pigmys?.map(pigmy => `${pigmy?.payable_amount} | ${pigmy?.pigme_id}`) || []).join(" | "),
          loans: (loans?.map(loan => `${loan?.loan_amount} | ${loan?.loan_id}`) || []).join(" | "),
          others : groupsString + pigmysString + loansString,
          status: <Tag key={"success"} color={color} icon={icon} variant={"filled"}>
            {status}
          </Tag>,
          statusRaw: status,
          collectedBy: order?.collected_by,
     
        })
      });
      setTableTransactions(filteredData);
    } catch (error) {
      setTableTransactions([]);
    }finally{
      setIsLoading(false);
    }
  }
  useEffect(() => {
    getTransactions();
  }, []);

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "createdAt", header: "Transaction Date" },
    { key: "orderType", header: "Order Type" },
    { key: "user_name", header: "User Name" },
    { key: "others", header: "Groups / Others" },
    { key: "phone_number", header: "Phone Number" },
    { key: "status", header: "Status" },
    { key: "collectedBy", header: "Collected By" }
  ];
  const exportColumns = [
    { key: "id", header: "SL. NO" },
    { key: "createdAt", header: "Transaction Date" },
    { key: "orderType", header: "Order Type" },
    { key: "user_name", header: "User Name" },
    { key: "others", header: "Groups / Others" },
    { key: "phone_number", header: "Phone Number" },
    { key: "statusRaw", header: "Status" },
    { key: "collectedBy", header: "Collected By" }
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
              exportCols={exportColumns}
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
