import { useEffect, useState, useMemo } from "react";
import {
  Search,
  PiggyBank,
  Users,
  Calendar,
  TrendingUp,
  Clock,
} from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";

import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Select } from "antd";
import CircularLoader from "../components/loaders/CircularLoader";

const { RangePicker } = DatePicker;

const PigmySummaryReport = () => {
  const [pigmyReportTable, setPigmyReportTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPigmyId, setSelectedPigmyId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedReferredBy, setSelectedReferredBy] = useState("");
  const [dateRange, setDateRange] = useState(null);

  const uniqueReferredBy = useMemo(() => {
    const setRef = new Set();
    pigmyReportTable.forEach((p) => {
      if (p.referredBy && p.referredBy !== "N/A") {
        setRef.add(p.referredBy);
      }
    });
    return Array.from(setRef).map((name) => ({
      id: name,
      label: name,
    }));
  }, [pigmyReportTable]);

  useEffect(() => {
    const fetchPigmyReport = async () => {
      try {
        const response = await api.get(`/payment/pigme/customers`);

        const formattedData = response.data.data.map((pigmy, index) => ({
          id: pigmy?._id,
          slNo: index + 1,
          pigmyIds: pigmy?.pigme_id || "N/A",
          Duration: pigmy?.duration || "N/A",
          amount: pigmy?.payable_amount || "N/A",
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
          // Store the original date for filtering
          pigmyStartDateObj: pigmy?.start_date ? new Date(pigmy.start_date) : null,
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

      const matchReferredBy = selectedReferredBy
        ? pigmy.referredBy === selectedReferredBy
        : true;

      let matchDateRange = true;
      if (dateRange && dateRange.length === 2 && pigmy.pigmyStartDateObj) {
        const startDate = dayjs(dateRange[0]).startOf('day');
        const endDate = dayjs(dateRange[1]).endOf('day');
        const pigmyDate = dayjs(pigmy.pigmyStartDateObj);
        matchDateRange = pigmyDate.isAfter(startDate) && pigmyDate.isBefore(endDate);
      }

      return matchPigmyId && matchCustomer && matchReferredBy && matchDateRange;
    });
  }, [pigmyReportTable, selectedPigmyId, selectedCustomer, selectedReferredBy, dateRange]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const filtered = filteredPigmyReport;
    const totalAmount = filtered.reduce(
      (sum, pigmy) => sum + pigmy.totalpigmyAmount,
      0
    );
    const avgDuration =
      filtered.length > 0
        ? filtered.reduce((sum, pigmy) => {
            const dur = pigmy.Duration !== "N/A" ? Number(pigmy.Duration) : 0;
            return sum + dur;
          }, 0) / filtered.length
        : 0;

    return {
      totalPigmy: filtered.length,
      totalAmount: totalAmount,
      avgDuration: avgDuration.toFixed(1),
      uniqueCustomers: new Set(filtered.map((p) => p.customerId)).size,
    };
  }, [filteredPigmyReport]);

  const PigmyReportColumns = [
    { key: "slNo", header: "Sl No" },
    { key: "customerId", header: "Customer Id" },
    { key: "customerName", header: "Customer Name" },
    { key: "customerPhone", header: "Phone Number" },
    { key: "pigmyIds", header: "Pigmy ID" },
    { key: "pigmyStartDate", header: "Start Date" },
    { key: "Duration", header: "Duration (months)" },
    {key: "amount", header: "Daily Pay"},
    { key: "referredType", header: "Referred Type" },
    { key: "referredBy", header: "Referred By" },
    { key: "totalpigmyAmount", header: "Total Paid Amount" },
  ];

  const StatCard = ({ icon: Icon, label, value, color, suffix = "" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            {suffix && (
              <span className="text-lg font-normal text-gray-500 ml-1">
                {suffix}
              </span>
            )}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-600 rounded-lg">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pigmy Summary Report
            </h1>
          </div>
          <p className="text-gray-600 ml-14">
            Comprehensive overview of pigmy savings accounts and customer
            contributions
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <CircularLoader />
          </div>
        ) : (
          <>
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={PiggyBank}
                label="Total Pigmy Accounts"
                value={summaryStats.totalPigmy}
                color="bg-gradient-to-br from-pink-500 to-pink-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Total Amount Collected"
                value={`₹${summaryStats.totalAmount.toLocaleString("en-IN")}`}
                color="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatCard
                icon={Clock}
                label="Average Duration"
                value={summaryStats.avgDuration}
                suffix="months"
                color="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard
                icon={Users}
                label="Unique Customers"
                value={summaryStats.uniqueCustomers}
                color="bg-gradient-to-br from-purple-500 to-purple-600"
              />
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Filter Options
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Pigmy ID Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="w-4 h-4" />
                      Pigmy ID
                    </div>
                  </label>
                  <Select
                    showSearch
                    placeholder="Search or select pigmy account"
                    value={selectedPigmyId}
                    onChange={setSelectedPigmyId}
                    allowClear
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    optionLabelProp="label"
                    className="w-full"
                    size="large"
                  >
                    <Select.Option value="" label="All Pigmy Accounts">
                      All Pigmy Accounts
                    </Select.Option>
                    {uniquePigmyCombos.map((pigmy) => (
                      <Select.Option
                        key={pigmy?.id}
                        value={pigmy?.id}
                        label={pigmy?.label}
                      >
                        {pigmy?.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Customer Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Customer
                    </div>
                  </label>
                  <Select
                    showSearch
                    placeholder="Search or select customer"
                    value={selectedCustomer}
                    onChange={setSelectedCustomer}
                    allowClear
                    optionLabelProp="label"
                    className="w-full"
                    size="large"
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Select.Option value="" label="All Customers">
                      All Customers
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

                {/* Referred By Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Referred By
                    </div>
                  </label>

                  <Select
                    showSearch
                    placeholder="Search or select referred by"
                    value={selectedReferredBy}
                    onChange={setSelectedReferredBy}
                    allowClear
                    optionLabelProp="label"
                    className="w-full"
                    size="large"
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Select.Option value="" label="All Referred By">
                      All Referred By
                    </Select.Option>

                    {uniqueReferredBy.map((ref) => (
                      <Select.Option
                        key={ref.id}
                        value={ref.id}
                        label={ref.label}
                      >
                        {ref.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date Range
                    </div>
                  </label>
                  <RangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className="w-full"
                    size="large"
                    format="DD/MM/YYYY"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-2">
              <DataTable
                columns={PigmyReportColumns}
                data={filteredPigmyReport}
                exportedPdfName="Pigmy Summary Report"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PigmySummaryReport;