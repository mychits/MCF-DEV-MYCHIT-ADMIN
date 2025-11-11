import { useEffect, useState, useMemo } from "react";

import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";

import { Select } from "antd";

import CircularLoader from "../components/loaders/CircularLoader";

const PigmySummaryReport = () => {
  const [pigmyReportTable, setPigmyReportTable] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPigmyId, setSelectedPigmyId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    const fetchPigmyReport = async () => {
      try {
        const response = await api.get(`/payment/pigme/customers`);

        const formattedData = response.data.data.map((pigmy, index) => ({
          id: pigmy?._id,
          slNo: index + 1,
          pigmyIds: pigmy?.pigme_id || "N/A",
          Duration: pigmy?.duration || "N/A",
          referredType: pigmy?.referred_type || "N/A",
          referredBy: pigmy?.referred_employee
            ? pigmy?.referred_employee?.name
            : pigmy?.referred_agent
            ? pigmy?.referred_agent
            : pigmy?.referred_customer
            ? pigmy?.referred_customer?.full_name
            : "N/A",
          customerId: pigmy?.customer?.customer_id || "N/A",
          customerName: pigmy?.customer?.full_name || "N/A",
          customerPhone: pigmy?.customer?.phone_number || "N/A",
          pigmyStartDate: pigmy?.start_date
            ? new Date(pigmy.start_date).toLocaleDateString("en-GB")
            : "N/A",
          totalpigmyAmount: pigmy?.total_paid_amount ?? 0,
        }));

        setPigmyReportTable(formattedData);
      } catch (error) {
        console.error("Error fetching Pigmy report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPigmyReport();
  }, []);

  const uniquePigmyCombos = useMemo(() => {
    const map = new Map();
    pigmyReportTable.forEach((pigmy) => {
      const key = pigmy.pigmyIds;
      if (!map.has(key)) {
        map.set(key, { id: key, label: `${key}` });
      }
    });
    return Array.from(map.values());
  }, [pigmyReportTable]);

  const uniqueCustomers = useMemo(
    () =>
      pigmyReportTable.map((pigmy) => ({
        id: pigmy?.id,
        name: pigmy?.customerName,
        phone: pigmy?.customerPhone,
        custid: pigmy?.customerId,
      })),
    [pigmyReportTable]
  );

  const filteredPigmyReport = useMemo(() => {
    return pigmyReportTable.filter((pigmy) => {
      const matchPigmyId = selectedPigmyId
        ? pigmy.pigmyIds === selectedPigmyId
        : true;
      const matchCustomer = selectedCustomer
        ? pigmy.id === selectedCustomer
        : true;
      return matchPigmyId && matchCustomer;
    });
  }, [pigmyReportTable, selectedPigmyId, selectedCustomer]);

  const PigmyReportColumns = [
    { key: "slNo", header: "Sl No" },
    { key: "customerId", header: "Customer Id" },
    { key: "customerName", header: "Customer Name" },
    { key: "customerPhone", header: "Phone Number" },
    { key: "pigmyIds", header: "Pigmy ID" },
    { key: "pigmyStartDate", header: "Start Date" },
    { key: "Duration", header: "Duration (months)" },
    { key: "referredType", header: "Referred Type" },
    { key: "referredBy", header: "Referred By" },
    { key: "totalpigmyAmount", header: "Total Paid Amount" },
  ];

  return (
    <div className="p-4">
      <h1 className="font-bold text-2xl mb-5">Pigmy Summary Report</h1>

      <div className="flex gap-4 mb-4">
        <div className="w-full max-w-xs">
          <label className="block mb-1">Pigmy ID & Amount</label>
          <Select
            showSearch
            placeholder="Search or Select Pigmy"
            value={selectedPigmyId}
            onChange={setSelectedPigmyId}
            allowClear
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            optionLabelProp="label"
            className="w-full"
          >
            <Select.Option value="" label="All">
              All
            </Select.Option>
            {uniquePigmyCombos.map((pigmy) => (
              <Select.Option key={pigmy?.id} value={pigmy?.id} label={pigmy?.label}>
                {pigmy?.label}
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
            optionLabelProp="label"
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
                key={cust?.id}
                value={cust?.id}
                label={`${cust?.custid} | ${cust?.name} | ${cust?.phone}`}
              >
                {cust?.custid} | {cust?.name} | {cust?.phone}
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
          columns={PigmyReportColumns}
          data={filteredPigmyReport}
          exportedPdfName="Pigmy Summary Report"
        />
      )}
    </div>
  );
};

export default PigmySummaryReport;
