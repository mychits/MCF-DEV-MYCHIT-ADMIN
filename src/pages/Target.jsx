import { useEffect, useState } from "react";
import Navbar from "../components/layouts/Navbar";
import SettingSidebar from "../components/layouts/SettingSidebar";
import api from "../instance/TokenInstance";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import { Dropdown } from "antd";
import { IoMdMore } from "react-icons/io";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
const currentYearMonth = `${currentYear}-${currentMonth}`;

function formatDate(date) {
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
}

const Target = () => {
  const [selectedType, setSelectedType] = useState("agents");
  const [type, setType] = useState("");
  const [selectedId, setSelectedId] = useState("all");
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [targets, setTargets] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [selectedYearMonth, setSelectedYearMonth] = useState(currentYearMonth);
  const [tableData, setTableData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null);
  const [formData, setFormData] = useState({
    totalTarget: "",
    incentive: 0,
  });
  const [bulkFormData, setBulkFormData] = useState({
    totalTarget: "",
    incentive: 0,
    month: currentYearMonth
  });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentRes] = await Promise.all([
          api.get("/agent/get-agent"),
        ]);

        const all = agentRes.data || [];
        setAgents(
          all.filter((a) => a.agent_type === "agent" || a.agent_type === "both")
        );
        setEmployees(
          all.filter(
            (a) => a.agent_type === "employee" || a.agent_type === "both"
          )
        );
      } catch (err) {
        console.error("Error fetching agents:", err);
      }
    };

    fetchData();
  }, [reload]);

  useEffect(() => {
    const fetchTargets = async () => {
      if (!type || !selectedYearMonth) return;
      
      setLoading(true);
      try {
        const [year, month] = selectedYearMonth.split('-');
        const endpoint = type === "agent" ? "/target/agents" : "/target/employee";
        
        const res = await api.get(endpoint, {
          params: { year }
        });

        // Process the response to get targets for the specific month
        const processedData = res.data.map(item => {
          const targetForMonth = item.targets.find(t => 
            t.month === selectedYearMonth
          );
          
          return {
            ...item,
            targetForMonth
          };
        });

        setTargets(processedData);
        buildTableData(processedData);
      } catch (err) {
        console.error("Error fetching targets:", err);
        setAlertConfig({
          visibility: true,
          message: "Failed to fetch targets",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, [type, selectedYearMonth, selectedId, reload]);

  const buildTableData = (targetData) => {
    const sourceList = type === "agent" ? agents : employees;
    
    const filteredList = selectedId === "all" 
      ? sourceList 
      : sourceList.filter(p => p._id === selectedId);

    const rows = filteredList.map(person => {
      const targetItem = targetData.find(item => item._id === person._id);
      const targetForMonth = targetItem?.targetForMonth;
      
      return formatRow(person, targetForMonth);
    });

    setTableData(rows);
  };

  const formatRow = (person, targetForMonth) => {
    const hasTarget = !!targetForMonth;
    const targetAmount = hasTarget ? targetForMonth.totalTarget : 0;
    
    // Calculate achieved amount for the month
    let achieved = 0;
    if (targetForMonth) {
      // In a real implementation, you'd fetch actual business data
      // This is a placeholder
      achieved = Math.min(targetAmount, Math.floor(Math.random() * targetAmount * 1.2));
    }

    const difference = targetAmount - achieved;
    const remaining = difference > 0 ? difference : 0;
    
    // Calculate incentive
    let incentiveAmount = 0;
    let incentivePercent = "0%";
    const title = (person.designation_id?.title || "N/A").toLowerCase();

    if (title === "business agent" && achieved >= targetAmount) {
      incentiveAmount = achieved * 0.01;
      incentivePercent = "1%";
    } else if (difference < 0) {
      incentiveAmount = Math.abs(difference) * 0.01;
      incentivePercent = "1%";
    }

    const dropdownItems = hasTarget
      ? [
          { key: "update", label: "Edit Target" },
          { key: "delete", label: "Delete Target" }
        ]
      : [{ key: "set", label: "Set Target" }];

    const actionDropdown = (
      <Dropdown
        trigger={["click"]}
        menu={{
          items: dropdownItems,
          onClick: ({ key }) => {
            if (key === "set") openSetModal(person, type);
            if (key === "update") openEditModal(targetForMonth, person);
            if (key === "delete") handleDeleteTarget(targetForMonth._id);
          },
        }}
      >
        <IoMdMore className="cursor-pointer" />
      </Dropdown>
    );

    return {
      name: person.name || person.title || "N/A",
      phone: person.phone_number || "-",
      designation: person.designation_id?.title || "N/A",
      target: hasTarget ? targetAmount.toLocaleString() : "-",
      achieved: hasTarget ? achieved.toLocaleString() : "-",
      remaining: hasTarget ? remaining.toLocaleString() : "-",
      difference: hasTarget ? difference.toLocaleString() : "-",
      incentive_percent: incentivePercent,
      incentive_amount: hasTarget 
        ? `₹${incentiveAmount.toFixed(2)}` 
        : "-",
      action: actionDropdown,
      _person: person,
      _target: targetForMonth
    };
  };

  const openSetModal = (person, selectedType) => {
    setFormData({
      totalTarget: "",
      incentive: 0,
    });
    setSelectedName(person.name || person.title || "");
    setEditTargetId(null);
    setIsEditMode(false);
    setModalVisible(true);
  };

  const openEditModal = (target, person) => {
    setFormData({
      totalTarget: target.totalTarget,
      incentive: target.incentive || 0,
    });
    setSelectedName(person.name || person.title || "");
    setEditTargetId(target._id);
    setIsEditMode(true);
    setModalVisible(true);
  };

  const handleDeleteTarget = async (id) => {
    try {
      await api.delete(`/target/delete-target/${id}`);
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
    }

    setTimeout(() => {
      setAlertConfig(prev => ({ ...prev, visibility: false }));
    }, 4000);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    
    if (name === "totalTarget") {
      const val = parseInt(value) || 0;
      if (val > 2000000 && val <= 5000000) updated.incentive = 1;
      else if (val > 5000000 && val <= 10000000) updated.incentive = 2;
      else if (val > 10000000 && val <= 20000000) updated.incentive = 3;
      else if (val > 20000000) updated.incentive = 4;
      else updated.incentive = 0;
    }
    
    setFormData(updated);
  };

  const handleBulkFormChange = (e) => {
    const { name, value } = e.target;
    setBulkFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const [year, month] = selectedYearMonth.split('-');
      const payload = {
        totalTarget: parseInt(formData.totalTarget),
        incentive: formData.incentive || 0,
        year,
        month: selectedYearMonth
      };

      if (isEditMode) {
        await api.put(`/target/update-target/${editTargetId}`, payload);
        setAlertConfig({ 
          visibility: true, 
          message: "Target updated successfully", 
          type: "success" 
        });
      } else {
        // For new target, we need agentId
        const endpoint = type === "agent" 
          ? `/target/add-target?agentId=${editTargetId}` 
          : `/target/add-target?employeeId=${editTargetId}`;
          
        await api.post(endpoint, payload);
        setAlertConfig({ 
          visibility: true, 
          message: "Target set successfully", 
          type: "success" 
        });
      }

      setModalVisible(false);
      setReload(prev => prev + 1);
    } catch (err) {
      console.error("Submit failed", err);
      setAlertConfig({ 
        visibility: true, 
        message: isEditMode ? "Update failed" : "Add failed", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const [year, month] = bulkFormData.month.split('-');
      const payload = {
        totalTarget: parseInt(bulkFormData.totalTarget),
        incentive: bulkFormData.incentive || 0,
        year,
        month: bulkFormData.month
      };

      // Get all relevant agent IDs
      const sourceList = type === "agent" ? agents : employees;
      const agentIds = selectedId === "all" 
        ? sourceList.map(p => p._id) 
        : [selectedId];

      // Update all targets
      await Promise.all(agentIds.map(agentId => 
        api.post(`/target/add-target?agentId=${agentId}`, payload)
      ));

      setAlertConfig({ 
        visibility: true, 
        message: `Targets updated for ${agentIds.length} ${type === "agent" ? "agents" : "employees"}`, 
        type: "success" 
      });
      setBulkModalVisible(false);
      setReload(prev => prev + 1);
    } catch (err) {
      console.error("Bulk update failed", err);
      setAlertConfig({ 
        visibility: true, 
        message: "Bulk update failed", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const getColumns = () => {
    return [
      { key: "name", header: "Name" },
      { key: "phone", header: "Phone Number" },
      { key: "designation", header: "Designation" },
      { key: "target", header: "Target" },
      { key: "achieved", header: "Achieved" },
      { key: "remaining", header: "Remaining" },
      { key: "difference", header: "Difference (Target - Achieved)" },
      { key: "incentive_percent", header: "Incentive (%)" },
      { key: "incentive_amount", header: "Incentive (₹)" },
      { key: "action", header: "Action" },
    ];
  };

  const openBulkModal = () => {
    setBulkFormData({
      totalTarget: "",
      incentive: 0,
      month: selectedYearMonth
    });
    setBulkModalVisible(true);
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
            setAlertConfig(prev => ({ ...prev, visibility: false }))
          }
        />

        <div className="flex-grow p-6">
          <h1 className="text-2xl font-semibold mb-4">Targets Management</h1>
          
          <div className="flex gap-4 flex-wrap mb-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="p-2 border rounded w-full min-w-[150px]"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setSelectedId("all");
                }}
              >
                <option value="" disabled>Select type</option>
                <option value="agent">Agent</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            {type && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Person</label>
                <select
                  className="p-2 border rounded w-full min-w-[200px]"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  <option value="all">All {type === "agent" ? "Agents" : "Employees"}</option>
                  {(type === "agent" ? agents : employees).map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name || p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="month"
                className="p-2 border rounded"
                value={selectedYearMonth}
                onChange={(e) => setSelectedYearMonth(e.target.value)}
              />
            </div>

            {type && (
              <button
                onClick={openBulkModal}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Bulk Update
              </button>
            )}
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
                exportedPdfName="Target"
                exportedFileName="Target-Report.csv"
              />
            )}
          </div>
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
            {selectedName && (
              <div>
                <label className="block font-medium">Target For</label>
                <input
                  type="text"
                  value={selectedName}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
            )}
            
            <div>
              <label className="block font-medium">Month</label>
              <input
                type="month"
                value={selectedYearMonth}
                disabled
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="block font-medium">Target Amount (₹)</label>
              <input
                type="number"
                name="totalTarget"
                value={formData.totalTarget}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                min="0"
                required
                placeholder="Enter target amount"
              />
            </div>

            <div>
              <label className="block font-medium">Incentive (%)</label>
              <input
                type="number"
                name="incentive"
                value={formData.incentive}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                min="0"
                max="100"
                disabled
                placeholder="Auto-calculated based on target"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading 
                ? (isEditMode ? "Updating..." : "Saving...") 
                : (isEditMode ? "Update Target" : "Save Target")
              }
            </button>
          </form>
        </div>
      </Modal>

      {/* Bulk Update Modal */}
      <Modal
        isVisible={bulkModalVisible}
        onClose={() => setBulkModalVisible(false)}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Bulk Target Update</h2>
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Month</label>
              <input
                type="month"
                name="month"
                value={bulkFormData.month}
                onChange={handleBulkFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block font-medium">Target Amount (₹)</label>
              <input
                type="number"
                name="totalTarget"
                value={bulkFormData.totalTarget}
                onChange={handleBulkFormChange}
                className="w-full p-2 border rounded"
                min="0"
                required
                placeholder="Enter target amount"
              />
            </div>

            <div>
              <label className="block font-medium">Incentive (%)</label>
              <input
                type="number"
                name="incentive"
                value={bulkFormData.incentive}
                onChange={handleBulkFormChange}
                className="w-full p-2 border rounded"
                min="0"
                max="100"
                disabled
                placeholder="Auto-calculated based on target"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm">
                <strong>Note:</strong> This will update targets for{" "}
                {selectedId === "all" 
                  ? `all ${type === "agent" ? "agents" : "employees"}`
                  : "the selected person"
                } for the selected month.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-green-400"
            >
              {loading ? "Updating..." : "Update All Targets"}
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default Target;