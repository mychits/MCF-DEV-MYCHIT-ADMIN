import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import CircularLoader from "../components/loaders/CircularLoader";

const formatDate = (date) => date.toISOString().split("T")[0];

const SalesReport = () => {
  const [formattedAgents, setFormattedAgents] = useState([]);
  const [allAgentsData, setAllAgentsData] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("all");
  const [selectedAgentDetails, setSelectedAgentDetails] = useState(null);
  const [tableReportData, setTableReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [targetData, setTargetData] = useState({
    target: 0,
    achieved: 0,
    remaining: 0,
    startDate: "",
    endDate: "",
  });

  const today = formatDate(new Date());
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/agent/get-agent");
        const agents = response?.data || [];

        setAllAgentsData(agents);

        const formatted = agents.map((agent, index) => ({
          _id: agent._id,
          id: index + 1,
          name: agent.name,
          phone: agent.phone_number,
          label: `${agent.name} (${agent.phone_number})`,
        }));

        setFormattedAgents(formatted);
      } catch (err) {
        console.error("Fetch failed:", err);
        setFormattedAgents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    fetchSalesReport();
  }, [selectedAgentId, fromDate, toDate]);

  const fetchTargetData = async (agentId) => {
    try {
      const targetRes = await api.get("/target/get-targets", {
        params: { fromDate, toDate, agentId },
      });

      const targets = targetRes.data.filter(
        (t) => (t.agentId?._id || t.agentId) === agentId
      );

      // Step 1: Monthly target mapping
      const monthMap = {};
      targets.forEach((t) => {
        const date = new Date(t.startDate);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthMap[key]) monthMap[key] = t.totalTarget || 0;
      });

      const defaultTarget =
        Object.values(monthMap).length > 0 ? Object.values(monthMap)[0] : 0;

      // Step 2: Aggregate total target between fromDate & toDate
   let total = 0;
let loop = new Date(fromDate);
const end = new Date(toDate);
while (loop <= end) {
  const year = loop.getFullYear();
  const month = loop.getMonth(); // 0-based index
  const key = `${year}-${month}`;
  const monthTarget = monthMap[key] ?? defaultTarget;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const perDayTarget = monthTarget / daysInMonth;

  total += perDayTarget;
  loop.setDate(loop.getDate() + 1);
}


      // Step 3: Get achieved value via enroll commission
      const { data: commData } = await api.get(
        `/enroll/get-detailed-commission/${agentId}`,
        {
          params: { from_date: fromDate, to_date: toDate },
        }
      );

      let achieved = commData?.summary?.actual_business || 0;
      if (typeof achieved === "string") {
        achieved = Number(achieved.replace(/[^0-9.-]+/g, ""));
      }

      const remaining = Math.max(total - achieved, 0);
      const difference = total - achieved;

      // Step 4: Get designation for incentive logic
      const designation =
        targets.find((t) => (t.agentId?._id || t.agentId) === agentId)?.agentId
          ?.designation_id?.title || "N/A";

      // Step 5: Calculate incentive
      let incentiveAmount = 0;
      let incentivePercent = "0%";
      const title = designation.toLowerCase();

      if (title === "business agent" && achieved >= total) {
        incentiveAmount = achieved * 0.005;
        incentivePercent = "0.5%";
      } else if (difference < 0) {
        incentiveAmount = Math.abs(difference) * 0.01;
        incentivePercent = "1%";
      }

      // Step 6: Earliest start and latest end from real target rows
      const startDate = targets.reduce(
        (min, t) => (t.startDate < min ? t.startDate : min),
        targets[0]?.startDate || ""
      );
      const endDate = targets.reduce(
        (max, t) => (t.endDate > max ? t.endDate : max),
        targets[0]?.endDate || ""
      );

      setTargetData({
        target: total,
        achieved,
        remaining,
        startDate: startDate.split("T")[0],
        endDate: endDate.split("T")[0],
        designation,
        incentiveAmount: `₹${incentiveAmount.toFixed(2)}`,
        incentivePercent,
      });
    } catch (err) {
      console.error("Error fetching target data:", err);
      setTargetData({
        target: 0,
        achieved: 0,
        remaining: 0,
        startDate: "",
        endDate: "",
        designation: "",
        incentiveAmount: "₹0.00",
        incentivePercent: "0%",
      });
    }
  };

  const fetchSalesReport = async () => {
    try {
      setIsLoading(true);

      const params = {
        from_date: fromDate,
        to_date: toDate,
        agentId: selectedAgentId !== "all" ? selectedAgentId : "all",
      };

      const response = await api.get("/report/sales-report", { params });
      const res = response.data;

      const formatted = res.data.map((item, idx) => {
        const groupValue = Number(item.groupValue) || 0;
        const customers =
          typeof item.customers === "number" ? item.customers : 0;

        return {
          id: idx + 1,
          name: item.name,
          phone: item.phone,
          leads: item.leads || 0,
          customers,
          date: item.date || fromDate,
          groupName: item.groupName || "-",
          groupValue,
          sales: groupValue * customers,
        };
      });

      setTableReportData(formatted);

      const totalLeadsCount = formatted.reduce(
        (sum, item) => sum + item.leads,
        0
      );
      const totalCustomersCount = formatted.reduce(
        (sum, item) => sum + item.customers,
        0
      );
      const totalSalesAmount = formatted.reduce(
        (sum, item) => sum + item.sales,
        0
      );

      setTotalLeads(totalLeadsCount);
      setTotalCustomers(totalCustomersCount);
      setTotalSales(totalSalesAmount);

      if (selectedAgentId !== "all") {
        const found = allAgentsData.find((a) => a._id === selectedAgentId);
        setSelectedAgentDetails(found || null);

        await fetchTargetData(selectedAgentId);
      } else {
        setSelectedAgentDetails(null);
        setTargetData({
          target: 0,
          achieved: 0,
          remaining: 0,
          startDate: "",
          endDate: "",
          designation: "",
          incentiveAmount: "₹0.00",
          incentivePercent: "0%",
        });
      }
    } catch (error) {
      console.error("Error fetching sales report:", error);
      setTableReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "name", header: "Agent" },
    { key: "phone", header: "Phone Number" },
    { key: "leads", header: "Leads" },
    { key: "customers", header: "Customers" },
    { key: "date", header: "Date" },
    { key: "groupName", header: "Group" },
    { key: "groupValue", header: "Group Value" },
    { key: "sales", header: "Sales" },
  ];

  return (
    <div className="w-screen min-h-screen">
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Reports - Sales</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block mb-1 font-semibold">Select Agent</label>
            <select
              className="border px-4 py-2 rounded w-full"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              <option value="all">-- All Agents --</option>
              {formattedAgents.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">From Date</label>
            <input
              type="date"
              value={fromDate}
              max={today}
              onChange={(e) => setFromDate(e.target.value)}
              className="border px-4 py-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">To Date</label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={today}
              onChange={(e) => setToDate(e.target.value)}
              className="border px-4 py-2 rounded w-full"
            />
          </div>
        </div>

        {selectedAgentDetails && (
          <>
            <div className="bg-gray-100 p-4 rounded shadow mb-6">
              <h2 className="font-bold text-lg text-blue-800 mb-3">
                Agent Details
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label>Name</label>
                  <input
                    value={selectedAgentDetails.name || "-"}
                    readOnly
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label>Phone</label>
                  <input
                    value={selectedAgentDetails.phone_number || "-"}
                    readOnly
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label>Email</label>
                  <input
                    value={selectedAgentDetails.email || "-"}
                    readOnly
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-2">
                <div>
                  <label>PAN</label>
                  <input
                    value={selectedAgentDetails.pan_no || "-"}
                    readOnly
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label>Aadhaar</label>
                  <input
                    value={selectedAgentDetails.adhaar_no || "-"}
                    readOnly
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label>Pincode</label>
                  <input
                    value={selectedAgentDetails.pincode || "-"}
                    readOnly
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label>Address</label>
                <input
                  value={selectedAgentDetails.address || "-"}
                  readOnly
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </div>

            <div className="bg-gray-200 p-4 rounded shadow mb-6">
              <h2 className="font-bold text-lg text-yellow-800 mb-3">
                Target Details
              </h2>
              {targetData.target > 0 &&
                targetData.achieved >= targetData.target && (
                  <p className="text-green-800 inline-block px-3 py-1 rounded-full text-xl font-semibold mb-2">
                    🎉 Target Achieved
                  </p>
                )}
              <div className="grid md:grid-cols-3 gap-4 text-yellow-900">
                <div>
                  <label> Target Set</label>
                  <input
                    value={`₹${targetData.target.toLocaleString("en-IN")}`}
                    readOnly
                    className="border font-semibold px-3 py-2 rounded w-full"
                  />
                </div>
                <div>
                  <label> Achieved</label>
                  <input
                    value={`₹${targetData.achieved.toLocaleString("en-IN")}`}
                    readOnly
                    className="border font-semibold px-3 py-2 rounded w-full"
                  />
                </div>
                <div>
                  <label> Remaining</label>
                  <input
                    value={`₹${targetData.remaining.toLocaleString("en-IN")}`}
                    readOnly
                    className="border font-semibold px-3 py-2 rounded w-full"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-6 mb-4 items-center px-2">
          <div className="flex flex-col">
            <label className="font-semibold text-blue-700 mb-1">
              Total Leads:
            </label>
            <input
              readOnly
              value={totalLeads.toLocaleString("en-IN")}
              className="border rounded px-3 py-1 w-[150px] text-center text-blue-700 font-medium"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-blue-700 mb-1">
              Total Customers:
            </label>
            <input
              readOnly
              value={totalCustomers.toLocaleString("en-IN")}
              className="border rounded px-3 py-1 w-[150px] text-center text-blue-700 font-medium"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-blue-700 mb-1">
              Total Sales:
            </label>
            <input
              readOnly
              value={`₹${totalSales.toLocaleString("en-IN")}`}
              className="border rounded px-3 py-1 w-[150px] text-center text-blue-700 font-medium"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center">
            <CircularLoader />
          </div>
        ) : (
          // <DataTable
          //   data={tableReportData}
          //   columns={columns}
          //   exportedFileName="SalesReport.csv"
          // />
          <DataTable
  data={tableReportData}
  columns={columns}
  exportedFileName="SalesReport.csv"
  exportedPdfName="Sales Report"
  printHeaderKeys={[
    "Agent Name",
    "From Date",
    "To Date",
    "Total Leads",
    "Total Customers",
    "Total Sales",
    "Target Set",
    "Achieved",
    "Remaining",
  ]}
  printHeaderValues={[
    selectedAgentDetails?.name || "All Agents",
    fromDate || "-",
    toDate || "-",
    totalLeads.toLocaleString("en-IN"),
    totalCustomers.toLocaleString("en-IN"),
    `₹${totalSales.toLocaleString("en-IN")}`,
    `₹${targetData.target.toLocaleString("en-IN")}`,
    `₹${targetData.achieved.toLocaleString("en-IN")}`,
    `₹${targetData.remaining.toLocaleString("en-IN")}`,
  ]}
/>
        )}
      </div>
    </div>
  );
};

export default SalesReport;
