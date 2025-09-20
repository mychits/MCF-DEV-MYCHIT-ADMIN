import { useState, useEffect } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select } from "antd";

const MonthlyInstallmentTurnoverReport = () => {

  const [isLoading, setIsLoading] = useState(false);

  const [monthlyInstallmentTable, setMonthlyInstallmentTable] = useState([]);
  const [year, setYear] = useState([]);
  const [isDataTableLoading, setIsDataTableLoading] = useState(false);
  const [month, setMonth] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [agents, setAgents] = useState([]);
  const [agent, setAgent] = useState("");
  const [summaryData, setSummaryData]= useState({});
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`; // e.g., "2025-09"
  });
  const onGlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };

  const monthOptions = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get(`/agent/get-employee/`);
        setAgents(response.data?.employee);
      } catch (error) {
        console.error("Unable to fetch Employee", error);
      }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    const fetchMonthlyTurnover = async () => {
      if (!agent) return;

      const [year, month] = selectedMonth.split("-");
      const numericYear = Number(year);
      const numericMonth = Number(month);

      // Validate month range
      if (numericMonth < 1 || numericMonth > 12) {
        console.error("Invalid month selected.");
        return;
      }
      try {
        setIsLoading(true);
        setIsDataTableLoading(true);
        const response = await api.get(
          `/user/agent-monthly-turnover-by-id/${agent}`,
          { params: { year: numericYear, month: numericMonth } }
        );
        const agentData =response?.data?.agentData;
        setSummaryData(agentData? agentData:{});

        const formattedData = response.data?.agentData?.payingCustomers?.map(
          (group, index) => ({
            _id: group?._id,
            id: index + 1,
            group: group?.group_id?.group_name,
            monthlyInstallment: group?.group_id?.monthly_installment,
            userName: group?.user_id?.full_name,
            ticket: group?.ticket,
            totalPaid: group?.totalPaid,
            status: group?.status === "true" ? "Paid" : "Not Paid",
          })
        );
        setMonthlyInstallmentTable(formattedData);
      } catch (error) {
        console.error("Error in fetching Monthly Installment Data", error);
      }finally{
        setIsLoading(false);
      }
    };
    fetchMonthlyTurnover();
  }, [agent, selectedMonth, year]);

  const columns = [
    { key: "id", header: "SL No" },
     { key: "userName", header: "Customer Name" },
    { key: "group", header: "Group Name" },
    { key: "ticket", header: "Ticket" },
    { key: "monthlyInstallment", header: "Monthly Installment Turnover" },
   
    { key: "totalPaid", header: "Total Paid" },
    { key: "status", header: "Status" },
  ];

 return (
  <>
    <div className="min-h-screen w-screen bg-gray-50">
      <div className="flex">
        <Navbar onGlobalSearchChangeHandler={onGlobalSearchChangeHandler} />

        <div className="flex-grow p-6">
          <h1 className="text-3xl font-bold mb-6">Reports - Monthly Installment Turnover</h1>

          {/* Filters & Summary */}
          
          <div className="flex flex-wrap gap-4">
            {/* 🎯 Filters */}
            <div className="w-1/4 min-w-[100px] p-6">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>

              <div className="mb-4">
                <label className="block mb-1 font-medium">Select Agent</label>
                <Select
                  showSearch
                  popupMatchSelectWidth={false}
                  placeholder="Search or Select Filter"
                  onChange={(agent) => setAgent(agent)}
                  filterOption={(input, option) =>
                    option.children.toString().toLowerCase().includes(input.toLowerCase())
                  }
                  className="w-full h-11"
                >
                  <Select.Option value="">Select Agent</Select.Option>
                  {agents.map((agent) => (
                    <Select.Option key={agent._id} value={agent._id}>
                      {agent.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Select Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-11 px-3 rounded border border-gray-300"
                />
              </div>
            </div>
            </div>
            <div className="w-1/4 min-w-[500px] p-6">
           
            {!!agent && summaryData && (
              <div className="bg-white p-6 rounded  shadow">
                <h2 className="text-xl font-semibold text-center mb-4">Summary</h2>
                <div className="space-y-3 text-base">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{summaryData.agentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{summaryData.phone_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Expected Turnover:</span>
                    <span>₹{summaryData.expectedTurnover}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Turnover:</span>
                    <span>₹{summaryData.totalTurnover}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Customers:</span>
                    <span>{summaryData.totalCustomers}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* 🧾 Table */}
          {!isLoading ? (
            <DataTable data={monthlyInstallmentTable} columns={columns}
            exportedPdfName="Monthly Installment Turnover "
            printHeaderKeys={[
              "Name","Phone Number","Expected Turnover","Total Turnover","Total Customers",
            ]}
            printHeaderValues={[summaryData.agentName,summaryData.phone_number,summaryData.expectedTurnover,summaryData.totalTurnover,summaryData.totalCustomers]}
            exportedFileName={`Monthly Installment Turnover ${summaryData.agentName}`}
            />
          ) : (
            <div className="w-full h-40 flex justify-center items-center text-lg font-semibold">
              <CircularLoader isLoading={isDataTableLoading} 
              data={"Monthly Installment Turnover Data"}
              />

            </div>
          )}
        </div>
      </div>
    </div>
  </>
);

};

export default MonthlyInstallmentTurnoverReport;
