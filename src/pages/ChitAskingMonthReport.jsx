import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import DataTable from "../components/layouts/Datatable";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select, Button } from "antd";
import filterOption from "../helpers/filterOption";

const ChitAskingMonthReport = () => {
  const now = new Date();

  const [selectedDate, setSelectedDate] = useState("");
  const [customers, setCustomers] = useState([]);
  const [groups, setGroups] = useState([]); // ⭐ GROUPS DATA
  const [selectedGroup, setSelectedGroup] = useState(null); // ⭐ SELECTED GROUP

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(
    now.getFullYear().toString()
  );

  // Month list
  const months = [
    { label: "January", value: "01" },
    { label: "February", value: "02" },
    { label: "March", value: "03" },
    { label: "April", value: "04" },
    { label: "May", value: "05" },
    { label: "June", value: "06" },
    { label: "July", value: "07" },
    { label: "August", value: "08" },
    { label: "September", value: "09" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  // Generate years
  const years = [];
  for (let y = 2000; y <= 2040; y++) {
    years.push({ label: y.toString(), value: y.toString() });
  }

  // ⭐ FETCH GROUPS FOR DROPDOWN
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/group/get-group-admin");
        setGroups(
          res.data?.map((g) => ({
            label: g.group_name,
            value: g._id,
          })) || []
        );
      } catch (error) {
        console.log("Error loading groups", error);
      }
    };

    fetchGroups();
  }, []);

  // FETCH CUSTOMERS
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const finalMonth = `${selectedYear}-${selectedMonth}`;

      const res = await api.get("/enroll/get-customers-by-chit-asking-month", {
        params: {
          chit_asking_month: finalMonth,
          group_id: selectedGroup || "",
        },
      });

      setCustomers(res.data?.data || []);
    } catch (error) {
      console.log("Error loading customers");
    } finally {
      setLoading(false);
    }
  };

 
  const formattedData = customers.map((item, index) => ({
    sl_no: index + 1,
    customer_name: item?.user_id?.full_name,
    customer_id: item?.user_id?.customer_id,
    phone: item?.user_id?.phone_number,
    group: item?.group_id?.group_name,
    payment_type: item?.payment_type,
    chit_asking_month: item?.chit_asking_month,

  
    referred_by:
      item?.agent?.name && item?.agent?.phone_number
        ? `${item.agent.name} | ${item.agent.phone_number}`
        : item?.referred_customer?.full_name &&
          item?.referred_customer?.phone_number
        ? `${item.referred_customer.full_name} | ${item.referred_customer.phone_number}`
        : item?.referred_lead?.lead_name && item?.referred_lead?.agent_number
        ? `${item.referred_lead.lead_name} | ${item.referred_lead.agent_number}`
        : item?.employee?.name && item?.employee?.phone_number
        ? `${item.employee.name} | ${item.employee.phone_number}`
        : "N/A",
  }));

return (
  <div className="w-screen">
    <div className="flex">
      <div className="flex-grow p-8">

        {/* ⭐ PAGE TITLE */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Reports — <span className="text-blue-600">Chit Asking Month</span>
          </h1>
        </div>

        {/* ⭐ FILTER CARD */}
        <div className="bg-white p-6 rounded-xl shadow-lg border mb-8">
          <div className="flex gap-6 items-end">

            {/* YEAR FILTER */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700">Year Filter</label>
              <Select
                style={{ width: 150 }}
                value={selectedYear}
                options={years}
                onChange={setSelectedYear}
                className="h-12"
              />
            </div>

            {/* MONTH FILTER */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700">Month Filter</label>
              <Select
                style={{ width: 150 }}
                value={selectedMonth}
                options={months}
                onChange={setSelectedMonth}
                className="h-12"
              />
            </div>

            {/* GROUP FILTER */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700">Group Filter</label>
              <Select
                style={{ width: 200 }}
                value={selectedGroup}
                options={[{ label: "All Groups", value: "" }, ...groups]}
                onChange={(val) => setSelectedGroup(val)}
                className="h-12"
                placeholder="Select Group"
              />
            </div>

            {/* CONTINUE BUTTON */}
            <div className="flex flex-col">
              <label className="mb-1 opacity-0">.</label>
              <Button
                type="primary"
                onClick={fetchCustomers}
                loading={loading}
                className="h-12"
              >
                Continue
              </Button>
            </div>

          </div>
        </div>

        {/* ⭐ TABLE */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <DataTable
            catcher="sl_no"
            data={formattedData}
            columns={[
              { key: "sl_no", header: "SL. NO" },
              { key: "customer_id", header: "Customer ID" },
              { key: "customer_name", header: "Customer Name" },
              { key: "phone", header: "Phone Number" },
              { key: "group", header: "Group Name" },
              { key: "payment_type", header: "Payment Type" },
              { key: "chit_asking_month", header: "Chit Asking Month" },
              { key: "referred_by", header: "Referred By" },
            ]}
          />
        </div>

      </div>
    </div>
  </div>
);

};

export default ChitAskingMonthReport;
