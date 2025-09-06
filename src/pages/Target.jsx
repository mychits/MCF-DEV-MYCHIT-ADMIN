import { useEffect, useState } from "react";
import Navbar from "../components/layouts/Navbar";
import SettingSidebar from "../components/layouts/SettingSidebar";
import api from "../instance/TokenInstance";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import { Dropdown } from "antd";
import { IoMdMore } from "react-icons/io";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import Loader from "../components/loaders/CircularLoader"; // Add this import for loader component

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
const currentYearMonth = `${currentYear}-${currentMonth}`;

function formatDate(date) {
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  return `${year}-${month}-${day}`;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Target = () => {
  const [selectedType, setSelectedType] = useState("agents");
  const [selectedId, setSelectedId] = useState("all");
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialDataLoading, setInitialDataLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [reload, setReload] = useState(0);
  const [targetData, setTargetData] = useState([]);
  const [monthValues, setMonthValues] = useState({
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0
  });
  const [targetExists, setTargetExists] = useState(false);

  // Fetch initial data (agents and employees)
  useEffect(() => {
    const fetchData = async () => {
      setInitialDataLoading(true);
      try {
        const [agentRes, employeeRes] = await Promise.all([
          api.get("/agent/get-agent"),
          api.get("/agent/get-employee")
        ]);

        const allAgents = agentRes.data || [];
        setAgents(
          allAgents.filter(
            (a) => a.agent_type === "agent" || a.agent_type === "both"
          )
        );

        setEmployees(employeeRes.data?.employee || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setAlertConfig({
          visibility: true,
          message: "Failed to load agents and employees",
          type: "error",
        });
      } finally {
        setInitialDataLoading(false);
      }
    };

    fetchData();
  }, [reload]);

  // Fetch targets data when type, year, or month changes
  useEffect(() => {
    const abortController = new AbortController();
    const fetchTargets = async () => {
      setLoading(true);
      try {
        const startDate = new Date(selectedYear, parseInt(selectedMonth) - 1, 1);
        const endDate = new Date(selectedYear, parseInt(selectedMonth), 0);

        let res;
        if (selectedType === "agents") {
          res = await api.get("/target/agents", {
            params: {
              from_date: formatDate(startDate),
              to_date: formatDate(endDate),
            },
            signal: abortController.signal,
          });
        } else {
          res = await api.get("/target/employee", {
            params: {
              from_date: formatDate(startDate),
              to_date: formatDate(endDate),
            },
            signal: abortController.signal
          });
        }

        if (res.data.success && res.data.summaries) {
          setTargetData(res.data.summaries);
        } else {
          setTargetData([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Error fetching targets:", err);
          setAlertConfig({
            visibility: true,
            message: "Failed to fetch targets",
            type: "error",
          });
          setTargetData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
    return () => {
      abortController.abort();
    };
  }, [selectedType, selectedYear, selectedMonth, reload]);

  // Filter data on the frontend when selectedId changes
  useEffect(() => {
    if (targetData.length > 0) {
      let filteredData = targetData;
      
      if (selectedId !== "all") {
        filteredData = targetData.filter(
          (item) => item.agent.id === selectedId
        );
      }

      const formattedData = filteredData.map((item) => {
        const hasTarget = item.agent.target.value !== "Not Set";
        setTargetExists(hasTarget);
        
        const dropdownItems = hasTarget
          ? [
              { key: "update", label: "Edit Target" },
              { key: "delete", label: "Delete Target" },
            ]
          : [{ key: "set", label: "Set Target" }];

        const actionDropdown = (
          <Dropdown
            trigger={["click"]}
            menu={{
              items: dropdownItems,
              onClick: ({ key }) => {
                if (key === "set") openSetModal(item);
                if (key === "update") openEditModal(item);
                if (key === "delete") handleDeleteTarget(item.agent.id);
              },
            }}
          >
            <IoMdMore className="cursor-pointer" />
          </Dropdown>
        );

        return {
          name: item.agent.name,
          phone_number: item.agent.phone,
          designation: item.agent.role,
          target: item.agent.target.value,
          achieved_business: item.metrics.actual_business,
          expected_business: item.metrics.expected_business,
          remaining: item.metrics.target_remaining,
          difference: item.metrics.target_difference,
          incentive_percent: item.agent.target.achievement_percent,
          incentive_amount: `₹${(
            item.metrics.actual_business_digits * 0.01
          ).toLocaleString()}`,
          achieved_commission: item.metrics.total_actual,
          expected_commission: item.metrics.total_estimated,
          action: actionDropdown,
          _item: item,
        };
      });

      setTableData(formattedData);
    } else {
      setTableData([]);
    }
  }, [selectedId, targetData]);

  const openSetModal = (item) => {
    setSelectedPerson(item);
    setIsEditMode(false);
    setEditTargetId(item.agent.id);
    
    // Initialize month values
    const monthValues = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0
    };
    
    // If there's existing target data, populate the values
    const targetItem = targetData.find(t => t.agent.id === item.agent.id);
    if (targetItem && targetItem.targetMonth) {
      Object.keys(monthValues).forEach(month => {
        monthValues[month] = targetItem.targetMonth[month] || 0;
      });
      setTargetExists(true);
    } else {
      setTargetExists(false);
    }
    
    setMonthValues(monthValues);
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    openSetModal(item); // Reuse the same logic as set modal
    setIsEditMode(true);
  };

  const handleMonthChange = (month, value) => {
    setMonthValues(prev => ({
      ...prev,
      [month]: value === '' ? '' : Number(value)
    }));
  };

  const handleDeleteTarget = async (id) => {
    try {
      setLoading(true);
      // For agents
      if (selectedType === "agents") {
        await api.delete(`/target/delete-target/${id}`);
      }
      // For employees
      else if (selectedType === "employees") {
        await api.delete(`/target/delete-employee-target/${id}`);
      }

      setAlertConfig({
        visibility: true,
        message: "Target deleted successfully",
        type: "success",
      });
      setReload(prev => prev + 1);
    } catch (err) {
      console.error("Delete failed", err);
      setAlertConfig({
        visibility: true,
        message: "Delete failed. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setAlertConfig(prev => ({ ...prev, visibility: false }));
      }, 4000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        agentId: editTargetId,
        year: selectedYear,
        monthValues: monthValues
      };

      // For agents
      if (selectedType === "agents") {
        await api.post(`/target/add-target`, payload);
      }
      // For employees
      else if (selectedType === "employees") {
        await api.post(`/target/add-employee-target`, payload);
      }

      setAlertConfig({
        visibility: true,
        message: isEditMode
          ? "Target updated successfully"
          : "Target set successfully",
        type: "success",
      });
      setModalVisible(false);
      setReload(prev => prev + 1);
    } catch (err) {
      console.error("Submit failed", err);
      setAlertConfig({
        visibility: true,
        message: isEditMode ? "Update failed" : "Add failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getColumns = () => {
    return [
      { key: "name", header: "Name" },
      { key: "phone_number", header: "Phone Number" },
      { key: "designation", header: "Designation" },
      { key: "target", header: "Target" },
      { key: "achieved_business", header: "Achieved Business" },
      { key: "expected_business", header: "Expected Business" },
      { key: "remaining", header: "Remaining" },
      { key: "difference", header: "Difference" },
      { key: "incentive_percent", header: "Incentive (%)" },
      { key: "incentive_amount", header: "Incentive (₹)" },
      { key: "achieved_commission", header: "Achieved Commission" },
      { key: "expected_commission", header: "Expected Commission" },
      { key: "action", header: "Action" },
    ];
  };

  // Generate years for the year selector (current year and 5 years back)
  const generateYears = () => {
    const years = [];
    const current = new Date().getFullYear();
    for (let i = 0; i < 6; i++) {
      years.push(current - i);
    }
    return years;
  };

  return (
    <>
      <div className="flex mt-20">
        <Navbar visibility={true} />
        <SettingSidebar />
        <CustomAlertDialog
          type={alertConfig.type}
          isVisible={alertConfig.visibility}
          message={alertConfig.message}
          onClose={() =>
            setAlertConfig((prev) => ({ ...prev, visibility: false }))
          }
        />

        <div className="flex-grow p-6">
          <h1 className="text-2xl font-semibold mb-4">Targets Management</h1>
          
          {initialDataLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <>
              <div className="flex gap-4 flex-wrap mb-6 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    className="p-2 border rounded w-full min-w-[150px]"
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setSelectedId("all");
                    }}
                  >
                    <option value="agents">Agents</option>
                    <option value="employees">Employees</option>
                  </select>
                </div>

                {selectedType === "agents" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agent
                    </label>
                    <select
                      className="p-2 border rounded w-full min-w-[200px]"
                      value={selectedId}
                      onChange={(e) => setSelectedId(e.target.value)}
                    >
                      <option value="all">All Agents</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name || "Unknown Agent"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedType === "employees" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee
                    </label>
                    <select
                      className="p-2 border rounded w-full min-w-[200px]"
                      value={selectedId}
                      onChange={(e) => setSelectedId(e.target.value)}
                    >
                      <option value="all">All Employees</option>
                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name || "Unknown Employee"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    className="p-2 border rounded w-full min-w-[120px]"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {generateYears().map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    className="p-2 border rounded w-full min-w-[150px]"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {monthNames.map((month, index) => (
                      <option key={month} value={String(index + 1).padStart(2, '0')}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative min-h-[200px]">
                {loading ? (
                  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                  </div>
                ) : (
                  <DataTable
                    data={tableData}
                    columns={getColumns()}
                    exportedPdfName="Target-Report"
                    exportedFileName="Target-Report.csv"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Single Target Modal */}
      <Modal
        isVisible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setIsEditMode(false);
          setEditTargetId(null);
        }}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {isEditMode ? "Edit Target" : "Set Target"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedPerson && (
              <div>
                <label className="block font-medium">Target For</label>
                <input
                  type="text"
                  value={selectedPerson.agent.name}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-medium">Year</label>
                <input
                  type="text"
                  value={selectedYear}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block font-medium">Month</label>
                <input
                  type="text"
                  value={monthNames[parseInt(selectedMonth) - 1]}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monthNames.map((month) => (
                <div key={month}>
                  <label className="block font-medium">{month}</label>
                  <div className="flex items-center">
                    <span className="mr-2">₹</span>
                    <input
                      type="number"
                      value={monthValues[month]}
                      onChange={(e) => handleMonthChange(month, e.target.value)}
                      className="w-full p-2 border rounded"
                      min="0"
                      placeholder={`Enter ${month} target`}
                      disabled={loading}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="border p-3 rounded">
                <div className="text-sm text-gray-500">Achieved Business</div>
                <div className="font-bold">
                  {selectedPerson?.metrics.actual_business || "₹0.00"}
                </div>
              </div>
              <div className="border p-3 rounded">
                <div className="text-sm text-gray-500">Remaining</div>
                <div className="font-bold">
                  {selectedPerson?.metrics.target_remaining || "₹0.00"}
                </div>
              </div>
              <div className="border p-3 rounded">
                <div className="text-sm text-gray-500">Achieved Commission</div>
                <div className="font-bold">
                  {selectedPerson?.metrics.total_actual || "₹0.00"}
                </div>
              </div>
              <div className="border p-3 rounded">
                <div className="text-sm text-gray-500">Expected Commission</div>
                <div className="font-bold">
                  {selectedPerson?.metrics.total_estimated || "₹0.00"}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                ? "Update Target"
                : "Save Target"}
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default Target;