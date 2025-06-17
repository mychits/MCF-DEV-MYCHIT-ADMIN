import { useEffect, useState } from "react";
import Navbar from "../components/layouts/Navbar";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import api from "../instance/TokenInstance";
import CircularLoader from "../components/loaders/CircularLoader";
import { Dropdown, Progress } from "antd";
import { IoMdMore } from "react-icons/io";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import SettingSidebar from "../components/layouts/SettingSidebar";

const Target = () => {
  const [type, setType] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [targets, setTargets] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null);
  const [fixedTargetModal, setFixedTargetModal] = useState(false);

  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [formData, setFormData] = useState({
    agentId: "",
    designationId: "",
    startDate: "",
    endDate: "",
    target: "",
    incentive: 0,
    achieved: 0,
  });

  const [fixedTargetForm, setFixedTargetForm] = useState({
    designationId: "",
    fixedTarget: "",
  });

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "",
    type: "info",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [agentRes, desigRes, targetRes] = await Promise.all([
        api.get("/agent/get-agent"),
        api.get("/target/get-designation"),
        api.get("/target/get-targets"),
      ]);

      const allAgents = agentRes.data || [];
      setAgents(allAgents.filter(a => a.agent_type === "agent" || a.agent_type === "both"));
      setEmployees(allAgents.filter(a => a.agent_type === "employee" || a.agent_type === "both"));

      setDesignations(desigRes.data || []);
      setTargets(targetRes.data || []);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [reloadTrigger]);

  useEffect(() => {
    const getTargetById = (id) => {
      return targets.find((t) => {
        return String(t.agentId?._id || t.agentId || "") === String(id) ||
          String(t.designationId?._id || t.designationId || "") === String(id);
      });
    };

    const sourceList =
      type === "agent"
        ? agents
        : type === "employee"
          ? employees
          : designations;

    const fetchAllRows = async () => {
      const list = await Promise.all(
        sourceList
          .filter((p) => selectedId === "all" || p._id === selectedId)
          .map(async (person) => {
            const target = getTargetById(person._id);
            return await formatRow(person, target);
          })
      );
      setTableData(list);
    };

    if (type && (selectedId || selectedId === "all")) {
      fetchAllRows();
    }
  }, [type, selectedId, targets, filterStartDate, filterEndDate]);

  const formatRow = async (person, target) => {
    let total = type === "designation" ? person.fixedTarget || 0 : target?.totalTarget || 0;
    let achieved = "Target not set";

    const personType = person.agent_type || (type === "designation" ? "designation" : "unknown");

    if (target) {
      const defaultStart = target.startDate?.substring(0, 10);
      const defaultEnd = target.endDate?.substring(0, 10);

      const startDate = filterStartDate || defaultStart;
      const endDate = filterEndDate || defaultEnd;

      try {
        const agentId = target?.agentId?._id || target?.agentId || person._id;

        const params = {
          agentId,
          startDate,
          endDate,
        };

        const res = await api.get("/target/get-achieved", { params });
        achieved = res.data?.achieved || 0;
      } catch (err) {
        console.error("Failed to fetch achieved for row", err);
      }
    }

    const numericAchieved = typeof achieved === "number" ? achieved : 0;
    const remaining = typeof total === "number" ? total - numericAchieved : 0;
    const percent = total ? Math.round((numericAchieved / total) * 100) : 0;

    return {
      name: `${person.title || person.name}`,
      phone: person.phone_number || "-",
      type: personType,
      target: total,
      startDate: target?.startDate?.substring(0, 10) || "-",
      achieved,
      remaining: remaining > 0 ? remaining : 0,
      progress: typeof achieved === "number" ? (
        <Progress percent={percent} size="small" strokeColor="#3b82f6" />
      ) : (
        "-"
      ),
      incentive: target?.incentive || "N/A",
      action: (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              type !== "designation" && {
                key: "set",
                label: (
                  <div className="text-blue-600" onClick={() => openSetTargetModal(person._id)}>
                    Set Target
                  </div>
                ),
              },
              target && {
                key: "update",
                label: (
                  <div className="text-green-600" onClick={() => openUpdateModal(target)}>
                    Update Achieved
                  </div>
                ),
              },
            ].filter(Boolean),
          }}
          placement="bottomLeft"
        >
          <IoMdMore className="cursor-pointer" />
        </Dropdown>
      ),
    };
  };

  const openSetTargetModal = (id) => {
    setFormData({
      agentId: type !== "designation" ? id : "",
      designationId: type === "designation" ? id : "",
      startDate: "",
      endDate: "",
      target: "",
      incentive: 0,
      achieved: 0,
    });
    setEditMode(false);
    setModalVisible(true);
  };

  const openUpdateModal = (target) => {
    setFormData({
      agentId: target.agentId?._id || target.agentId || "",
      designationId: target.designationId?._id || target.designationId || "",
      startDate: target.startDate?.substring(0, 10) || "",
      endDate: target.endDate?.substring(0, 10) || "",
      target: target.totalTarget,
      incentive: target.incentive,
      achieved: target.achieved,
    });

    setEditTargetId(target._id);
    setEditMode(true);
    setModalVisible(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === "target") {
      const targetVal = parseInt(value || "0", 10);
      let incentive = 0;
      if (targetVal > 2000000 && targetVal <= 5000000) incentive = 1;
      else if (targetVal > 5000000 && targetVal <= 10000000) incentive = 2;
      else if (targetVal > 10000000 && targetVal <= 20000000) incentive = 3;
      else if (targetVal > 20000000) incentive = 4;
      updated.incentive = incentive;
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode && editTargetId) {
        await api.put(`/target/update-target/${editTargetId}`);
        setAlertConfig({ visibility: true, message: "Target updated", type: "success" });
      } else {
        const payload = {
          agentId: formData.agentId,
          designationId: formData.designationId,
          totalTarget: parseInt(formData.target),
          incentive: formData.incentive,
          startDate: formData.startDate,
          endDate: formData.endDate,
        };

        await api.post("/target/add-target", payload);
        setAlertConfig({ visibility: true, message: "Target saved", type: "success" });
      }

      setModalVisible(false);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Save error:", err);
      setAlertConfig({ visibility: true, message: "Failed to save target", type: "error" });
    }
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "phone", header: "Phone Number" },
    { key: "type", header: "Type" },
    { key: "target", header: "Target" },
    { key: "startDate", header: "Target Start" },
    { key: "achieved", header: "Achieved" },
    { key: "remaining", header: "Remaining" },
    { key: "progress", header: "Progress" },
    { key: "incentive", header: "Incentive (%)" },
    { key: "action", header: "Action" },
  ];

  return (
    <>
      <div className="flex mt-20">
        <Navbar visibility={true} />
        <CustomAlertDialog
          type={alertConfig.type}
          isVisible={alertConfig.visibility}
          message={alertConfig.message}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visibility: false }))}
        />
        <SettingSidebar />

        <div className="flex-grow p-7">
          <h1 className="text-2xl font-semibold mb-6">Targets</h1>
          <div className="flex gap-4 mb-6 flex-wrap">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setSelectedId("");
              }}
              className="p-2 border rounded w-48"
            >
              <option value="">Select Type</option>
              <option value="agent">Agent</option>
              <option value="employee">Employee</option>
              <option value="designation">Designation</option>
            </select>

            {type && (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="p-2 border rounded w-60"
              >
                <option value="">Select {type}</option>
                <option value="all">All</option>
                {(type === "agent"
                  ? agents
                  : type === "employee"
                    ? employees
                    : designations
                ).map((item) => (
                  <option key={item._id} value={item._id}>
                    {type === "designation"
                      ? item.title
                      : `${item.name} (${item.phone_number})`}
                  </option>
                ))}
              </select>
            )}

            {type === "designation" && selectedId && selectedId !== "all" && (
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => {
                  setFixedTargetForm({
                    designationId: selectedId,
                    fixedTarget: "",
                  });
                  setFixedTargetModal(true);
                }}
              >
                Set Fixed Target
              </button>
            )}


            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="p-2 border rounded"
            />
          </div>

          {tableData.length > 0 && !isLoading ? (
            <DataTable data={tableData} columns={columns} exportedFileName="Target-Report.csv" />
          ) : (
            <CircularLoader isLoading={isLoading} failure={!isLoading} data="Target Data" />
          )}
        </div>
      </div>

   
      <Modal isVisible={modalVisible} onClose={() => setModalVisible(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{editMode ? "Update Achieved" : "Set Target"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editMode && (
              <>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleFormChange} className="w-full p-2 border rounded" required />
                <input type="date" name="endDate" value={formData.endDate} onChange={handleFormChange} className="w-full p-2 border rounded" required />
                <input type="number" name="target" value={formData.target} onChange={handleFormChange} className="w-full p-2 border rounded" required />
              </>
            )}
            <input type="number" name="achieved" value={formData.achieved} onChange={handleFormChange} className="w-full p-2 border rounded" />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              {editMode ? "Update" : "Save"}
            </button>
          </form>
        </div>
      </Modal>

      <Modal isVisible={fixedTargetModal} onClose={() => setFixedTargetModal(false)}>
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Set Fixed Target for Designation</h2>
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await api.put("/target/update-fixed-target", fixedTargetForm);
          setFixedTargetModal(false);
          setReloadTrigger((prev) => prev + 1);
          setAlertConfig({ visibility: true, message: "Fixed target updated", type: "success" });
        } catch (err) {
          console.error("Error updating fixed target", err);
          setAlertConfig({ visibility: true, message: "Failed to update", type: "error" });
        }
      }}
      className="space-y-4"
    >
      <select
        className="w-full p-2 border rounded"
        value={fixedTargetForm.designationId}
        required
        onChange={(e) =>
          setFixedTargetForm({
            ...fixedTargetForm,
            designationId: e.target.value,
          })
        }
      >
        <option value="">Select Designation</option>
        {designations.map((d) => (
          <option key={d._id} value={d._id}>
            {d.title}
          </option>
        ))}
      </select>
      <input
        type="number"
        className="w-full p-2 border rounded"
        required
        value={fixedTargetForm.fixedTarget}
        onChange={(e) =>
          setFixedTargetForm({
            ...fixedTargetForm,
            fixedTarget: e.target.value,
          })
        }
      />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        Save Fixed Target
      </button>
    </form>
  </div>
</Modal>

    </>
  );
};

export default Target;
