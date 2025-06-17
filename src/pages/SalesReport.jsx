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
        console.error(" Fetch failed:", err);
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

  const fetchSalesReport = async () => {
    try {
      setIsLoading(true);

      const params = {
        from_date: fromDate,
        to_date: toDate,
        agentId: selectedAgentId && selectedAgentId !== "all" ? selectedAgentId : "all",
      };

      const response = await api.get("/report/sales-report", { params });

      if (response.status >= 400) throw new Error("Failed to fetch report");

      const res = response.data;

      const formatted = res.data.map((item, idx) => {
        const groupValue = Number(item.groupValue) || 0;
        const customers = typeof item.customers === "number" ? item.customers : 0;

        return {
          id: idx + 1,
          name: item.name,
          phone: item.phone,
          leads: typeof item.leads === "number" ? item.leads : 0,
          customers,
          date: item.date || fromDate,
          groupName: item.groupName || "-",
          groupValue,
          sales: groupValue * customers,
        };
      });

      setTableReportData(formatted);

      
      const uniqueLeadsMap = new Map();
      formatted.forEach((item) => {
        if (!uniqueLeadsMap.has(item.phone)) {
          uniqueLeadsMap.set(item.phone, item.leads);
        }
      });
      const totalLeadsCount = Array.from(uniqueLeadsMap.values()).reduce((sum, val) => sum + val, 0);
      const totalCustomersCount = formatted.reduce((sum, item) => sum + item.customers, 0);
      const totalSalesAmount = formatted.reduce((sum, item) => sum + item.sales, 0);

      setTotalLeads(totalLeadsCount);
      setTotalCustomers(totalCustomersCount);
      setTotalSales(totalSalesAmount);
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

     
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block mb-1 font-semibold">Select Agent</label>
            <select
              className="border px-4 py-2 rounded w-full"
              value={selectedAgentId}
              onChange={(e) => {
                const agentId = e.target.value;
                setSelectedAgentId(agentId);

                if (agentId === "all") {
                  setSelectedAgentDetails(null);
                } else {
                  const found = allAgentsData.find((a) => a._id === agentId);
                  setSelectedAgentDetails(found || null);
                }
              }}
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
              onChange={(e) => {
                const selectedFromDate = e.target.value;
                if (toDate < selectedFromDate) {
                  setToDate(selectedFromDate);
                }
                setFromDate(selectedFromDate);
              }}
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

      
        {selectedAgentId !== "all" && selectedAgentDetails && (
          <div className="mb-8 bg-gray-50 rounded-md shadow-md p-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium mb-1">Name</label>
                <input
                  value={selectedAgentDetails.name || "-"}
                  readOnly
                  className="border border-gray-300 rounded px-4 py-2 bg-white"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium mb-1">Phone Number</label>
                <input
                  value={selectedAgentDetails.phone_number || "-"}
                  readOnly
                  className="border border-gray-300 rounded px-4 py-2 bg-white"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium mb-1">Email</label>
                <input
                  value={selectedAgentDetails.email || "-"}
                  readOnly
                  className="border border-gray-300 rounded px-4 py-2 bg-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium mb-1">PAN Number</label>
                <input
                  value={selectedAgentDetails.pan_no || "-"}
                  readOnly
                  className="border border-gray-300 rounded px-4 py-2 bg-white"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium mb-1">Adhaar Number</label>
                <input
                  value={selectedAgentDetails.adhaar_no || "-"}
                  readOnly
                  className="border border-gray-300 rounded px-4 py-2 bg-white"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium mb-1">Pincode</label>
                <input
                  value={selectedAgentDetails.pincode || "-"}
                  readOnly
                  className="border border-gray-300 rounded px-4 py-2 bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Address</label>
              <input
                value={selectedAgentDetails.address || "-"}
                readOnly
                className="border border-gray-300 rounded px-4 py-2 bg-white"
              />
            </div>
          </div>
        )}

       
        <div className="flex justify-start gap-12 text-md font-semibold text-blue-700 mb-6 ml-2">
          <div>
            <label>Total Leads:</label>
            <div className="mt-2">
              <input
                className="rounded-md px-3 py-1 border border-gray-300"
                readOnly
                value={totalLeads}
              />
            </div>
          </div>
          <div>
            <label>Total Customers:</label>
            <div className="mt-2">
              <input
                className="rounded-md px-3 py-1 border border-gray-300"
                readOnly
                value={totalCustomers}
              />
            </div>
          </div>
          <div>
            <label>Total Sales:</label>
            <div className="mt-2">
              <input
                className="rounded-md px-3 py-1 border border-gray-300"
                readOnly
                value={`₹${totalSales.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}`}
              />
            </div>
          </div>
        </div>


        {isLoading ? (
          <div className="flex justify-center items-center">
            <CircularLoader />
          </div>
        ) : (
          <DataTable
            data={tableReportData}
            columns={columns}
            exportedFileName="SalesReport.csv"
          />
        )}
      </div>
    </div>
  );
};

export default SalesReport;
