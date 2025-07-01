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

function formatDate(date) {
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
}

const firstDay = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
const lastDay = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));

const Target = () => {
  const [selectedType, setSelectedType] = useState("agents");
  const [type, setType] = useState("");
  const [selectedId, setSelectedId] = useState("all");
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [targets, setTargets] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [virtualTargets, setVirtualTargets] = useState([]);

  const [formData, setFormData] = useState({
    agentId: "",
    designationId: "",
    startDate: "",
    endDate: "",
    totalTarget: "",
    incentive: 0,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null);
  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);
  const [tableData, setTableData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "",
    type: "",
  });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [agentRes, designationRes] = await Promise.all([
        api.get("/agent/get-agent"),
        api.get("/target/get-designation"),
      ]);

      const all = agentRes.data || [];
      console.info(agentRes.data);
      setAgents(
        all.filter((a) => a.agent_type === "agent" || a.agent_type === "both")
      );
      setEmployees(
        all.filter(
          (a) => a.agent_type === "employee" || a.agent_type === "both"
        )
      );
      setDesignations(designationRes.data || []);
    };

    fetchData();
  }, [reload]);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const res = await api.get("/target/get-targets", {
          params: {
            fromDate,
            toDate,
            ...(selectedId !== "all" &&
              type === "agent" && { agentId: selectedId }),
            ...(selectedId !== "all" &&
              type === "employee" && { agentId: selectedId }),
            ...(selectedId !== "all" &&
              type === "designation" && { designationId: selectedId }),
          },
        });
        console.info(res.data);

        const originalTargets = res.data || [];
        const extendedTargets = [...originalTargets];

        if (type === "agent" || type === "employee") {
          const list = type === "agent" ? agents : employees;

          for (const person of list) {
            const personId = person._id;
            const allTargets = originalTargets.filter((t) => {
              const id = t.agentId?._id || t.agentId;
              return id === personId;
            });

            if (allTargets.length === 0) {
              // Use designation-level fallback if available
              const designationId = person.designation_id?._id || person.designation_id;
              const desigTargets = originalTargets.filter((t) => {
                const id = t.designationId?._id || t.designationId;
                return id === designationId;
              });

              if (desigTargets.length > 0) {
                const sortedTargets = [...desigTargets].sort(
                  (a, b) => new Date(a.startDate) - new Date(b.startDate)
                );

                const loop = new Date(fromDate);
                const to = new Date(toDate);

                while (loop <= to) {
                  const key = `${loop.getFullYear()}-${loop.getMonth()}`;

                  const existing = desigTargets.find((t) => {
                    const d = new Date(t.startDate);
                    return d.getFullYear() === loop.getFullYear() && d.getMonth() === loop.getMonth();
                  });

                  const closest = sortedTargets.reduce((closest, curr) => {
                    const diff = Math.abs(new Date(curr.startDate) - loop);
                    const currClosest = closest
                      ? Math.abs(new Date(closest.startDate) - loop)
                      : Infinity;
                    return diff < currClosest ? curr : closest;
                  }, null);

                  if (closest) {
                    extendedTargets.push({
                      ...closest,
                      startDate: new Date(loop.getFullYear(), loop.getMonth(), 1).toISOString(),
                      endDate: new Date(loop.getFullYear(), loop.getMonth() + 1, 0).toISOString(),
                      agentId: person,
                      isVirtual: true,
                    });
                  }

                  loop.setMonth(loop.getMonth() + 1);
                }
              }

              continue;
            }


            const sortedTargets = [...allTargets].sort(
              (a, b) => new Date(a.startDate) - new Date(b.startDate)
            );

            const loop = new Date(fromDate);
            const to = new Date(toDate);

            while (loop <= to) {
              const key = `${loop.getFullYear()}-${loop.getMonth()}`;

              const alreadyExists = allTargets.find((t) => {
                const d = new Date(t.startDate);
                return (
                  d.getFullYear() === loop.getFullYear() &&
                  d.getMonth() === loop.getMonth()
                );
              });

              if (!alreadyExists) {
                const loopTime = new Date(loop);

                const closest = sortedTargets.reduce((closest, curr) => {
                  const currDiff = Math.abs(
                    new Date(curr.startDate) - loopTime
                  );
                  const closestDiff = closest
                    ? Math.abs(new Date(closest.startDate) - loopTime)
                    : Infinity;
                  return currDiff < closestDiff ? curr : closest;
                }, null);

                if (closest) {
                  extendedTargets.push({
                    ...closest,
                    startDate: new Date(
                      loop.getFullYear(),
                      loop.getMonth(),
                      1
                    ).toISOString(),
                    endDate: new Date(
                      loop.getFullYear(),
                      loop.getMonth() + 1,
                      0
                    ).toISOString(),
                    isVirtual: true,
                  });
                }
              }

              loop.setMonth(loop.getMonth() + 1);
            }
          }
        }


        const monthFiltered = extendedTargets.filter((t) => {
          const s = new Date(t.startDate);
          const start = new Date(fromDate);
          const end = new Date(toDate);
          return (
            s.getFullYear() === start.getFullYear() &&
            s.getMonth() === start.getMonth()
          );
        });

        setTargets(monthFiltered);
        setVirtualTargets(monthFiltered);
        setLoading(false);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching targets:", err);
      }
    };

    if (fromDate && toDate && type) {
      fetchTargets();
    }
  }, [fromDate, toDate, type, selectedId, reload]);


  useEffect(() => {
    const sourceList =
      type === "agent"
        ? agents
        : type === "employee"
          ? employees
          : designations;

    const buildRows = async () => {
      const rows = await Promise.all(
        sourceList
          .filter((p) => selectedId === "all" || p._id === selectedId)
          .map(async (person) => {
            const relatedTargets = virtualTargets.filter(
              (t) =>
                (t.agentId?._id || t.agentId) === person._id ||
                (t.designationId?._id || t.designationId) === person._id
            );

            if (relatedTargets.length === 0) {
              let designation = person.title || "N/A";
              if (type !== "designation") {
                try {
                  const { data: empData } = await api.get(
                    `/agent/get-additional-employee-info-by-id/${person._id}`
                  );
                  designation =
                    empData?.employee?.designation_id?.title || designation;
                } catch (err) {
                  console.error(
                    "Error fetching designation for placeholder row:",
                    err
                  );
                }
              }
              return [
                {
                  name: person.name || person.title,
                  phone: person.phone_number || "-",
                  designation,
                  target: "-",
                  achieved: "-",
                  remaining: "-",
                  difference: "-",
                  incentive_percent: "-",
                  incentive_amount: "-",
                  action: (
                    <Dropdown
                      trigger={["click"]}
                      menu={{
                        items: [{ key: "set", label: "Set Target" }],
                        onClick: ({ key }) => {
                          if (key === "set") openSetModal(person, type);
                        },
                      }}
                    >
                      <IoMdMore className="cursor-pointer" />
                    </Dropdown>
                  ),
                },
              ];
            }

            const row = await formatRow(person, relatedTargets, type);
            return [row];
          })
      );
      setTableData(rows.flat());
    };

    if (type && selectedId) buildRows();
  }, [type, selectedId, targets, fromDate, toDate]);

 const formatRow = async (person, targets, currentType) => {
    let designation = "N/A";
    let achieved = 0;
    const personIdStr = person._id?.toString();

    const allTargets = targets.filter(
      (t) =>
        (t.agentId?._id?.toString() === personIdStr ||
          t.agentId?.toString() === personIdStr ||
          t.designationId?._id?.toString() === personIdStr ||
          t.designationId?.toString() === personIdStr)
    );

    const monthMap = {};
    allTargets.forEach((t) => {
      const date = new Date(t.startDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthMap[key]) monthMap[key] = t.totalTarget || 0;
    });

    const defaultTarget =
      Object.values(monthMap).length > 0 ? Object.values(monthMap)[0] : 0;

    let total = 0;
    let loop = new Date(fromDate);
    const end = new Date(toDate);
    while (loop <= end) {
      const key = `${loop.getFullYear()}-${loop.getMonth()}`;
      const value = monthMap[key] ?? defaultTarget;
      total += value;
      loop.setMonth(loop.getMonth() + 1);
    }

    if (currentType !== "designation") {
      try {
        const { data: commData } = await api.get(
          `/enroll/get-detailed-commission/${person._id}`,
          {
            params: {
              from_date: fromDate,
              to_date: toDate,
            },
          }
        );
        achieved = commData?.summary?.actual_business || 0;
        if (typeof achieved === "string") {
          achieved = Number(achieved.replace(/[^0-9.-]+/g, ""));
        }
      } catch (err) {
        console.error("Error fetching actual business (achieved):", err);
      }
    }

    designation = person.designationTitle || person.title || "N/A";

    let isDesignationFallback = false;
    if ((currentType === "agent" || currentType === "employee") && person._id) {
      try {
        const { data: empData } = await api.get(
          `/agent/get-additional-employee-info-by-id/${person._id}`
        );
        const fetchedTitle = empData?.employee?.designation_id?.title;
        if (fetchedTitle) {
          designation = fetchedTitle;
          const allDirect = allTargets.filter(
            (t) => (t.agentId?._id || t.agentId) === person._id
          );
          if (allDirect.length === 0) {
            isDesignationFallback = true;
          }
        }
      } catch (err) {
        console.error("Error fetching designation for row:", err);
      }
    }

    if (isDesignationFallback) {
      designation += " (default)";
    }

    const difference = total - achieved;
    const remaining = difference > 0 ? difference : 0;
    let incentiveAmount = 0;
    let incentivePercent = "0%";
    const title = designation.toLowerCase();

    if (title === "business agent" && achieved >= total) {
      incentiveAmount = achieved * 0.01;
      incentivePercent = "1%";
    } else if (difference < 0) {
      incentiveAmount = Math.abs(difference) * 0.01;
      incentivePercent = "1%";
    }
    
    // This is the key logic. Find a real, agent-specific target, not a virtual one.
    const hasAgentSpecificTarget = targets.find((t) => {
      const agentMatch = (t.agentId?._id?.toString() === personIdStr || t.agentId?.toString() === personIdStr);
      return agentMatch && !t.isVirtual;
    });

    const dropdownItems = [];
    
    // If a real agent-specific target exists, allow viewing and updating it.
    if (hasAgentSpecificTarget) {
      dropdownItems.push({ key: "update", label: "View" });
      dropdownItems.push({ key: "delete", label: "Delete Target" });
    } else {
      // If there's no agent-specific target, only allow setting a new one.
      dropdownItems.push({ key: "set", label: "Set Target" });
    }

    const actionDropdown = (
      <Dropdown
        trigger={["click"]}
        menu={{
          items: dropdownItems,
          onClick: ({ key }) => {
            if (key === "set") openSetModal(person, currentType);
            // Only call openEditModal if a real agent target exists
            if (key === "update" && hasAgentSpecificTarget) openEditModal(hasAgentSpecificTarget);
            if (key === "delete" && hasAgentSpecificTarget) handleDeleteTarget(hasAgentSpecificTarget._id);
          },
        }}
      >
        <IoMdMore className="cursor-pointer" />
      </Dropdown>
    );

    return {
      name: person.name || person.title,
      phone: person.phone_number || "-",
      designation,
      target: total,
      achieved,
      remaining,
      difference,
      incentive_percent: incentivePercent,
      incentive_amount: `₹${incentiveAmount.toFixed(2)}`,
      action: actionDropdown,
    };
  };

  const openSetModal = (person, selectedType) => {
    const isDesig = selectedType === "designation";
    setFormData({
      agentId: isDesig ? "" : person._id,
      designationId: isDesig ? person._id : "",
      startDate: firstDay,
      endDate: lastDay,
      totalTarget: "",
      incentive: 0,
    });
    setSelectedName(person.name || person.title || "");
    setModalVisible(true);
    setIsEditMode(false);
    setEditTargetId(null);
  };

  const openEditModal = (target) => {
    const isAgentBased = !!target.agentId;
    const isDesignationBased = !!target.designationId;

    const rawStart = new Date(target.startDate);
    const correctedStart = new Date(rawStart.getFullYear(), rawStart.getMonth(), 1);
    const correctedEnd = new Date(new Date(target.endDate).getFullYear(), new Date(target.endDate).getMonth() + 1, 0);

    setFormData({
      agentId: isAgentBased ? target.agentId?._id || target.agentId || "" : "",
      designationId: isDesignationBased ? target.designationId?._id || target.designationId || "" : "",
      startDate: formatDate(correctedStart),
      endDate: formatDate(correctedEnd),
      totalTarget: target.totalTarget,
      incentive: target.incentive || 0,
    });


    setSelectedName(
      isAgentBased
        ? target.agentId?.name || "-"
        : target.designationId?.title || "-"
    );

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

    // ✅ Trigger reload to update table
    setReload((prev) => prev + 1);
  } catch (err) {
    console.error("Delete failed", err);

    const isProtected =
      err?.response?.status === 403 &&
      err?.response?.data?.message?.includes("designation-level");

    setAlertConfig({
      visibility: true,
      message: isProtected
        ? "Cannot delete fallback designation-level target. Please set a personal target instead."
        : "Delete failed. Please try again.",
      type: "error",
    });
  }

  setTimeout(() => {
    setAlertConfig((prev) => ({ ...prev, visibility: false }));
  }, 4000);
};



  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    if (name === "totalTarget") {
      const val = parseInt(value);
      if (val > 2000000 && val <= 5000000) updated.incentive = 1;
      else if (val > 5000000 && val <= 10000000) updated.incentive = 2;
      else if (val > 10000000 && val <= 20000000) updated.incentive = 3;
      else if (val > 20000000) updated.incentive = 4;
      else updated.incentive = 0;
    }
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      agentId: formData.agentId || null,
      designationId: formData.designationId || null,
      totalTarget: parseInt(formData.totalTarget),
      incentive: formData.incentive || 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
    };
    
    try {
      if (isEditMode) {
        await api.put(`/target/update-target/${editTargetId}`, payload);
        setAlertConfig({ visibility: true, message: "Target updated successfully", type: "success" });
      } else {
        await api.post("/target/add-target", payload);
        setAlertConfig({ visibility: true, message: "Target set successfully", type: "success" });
      }

      setModalVisible(false);
      setIsEditMode(false);
      setEditTargetId(null);

      const dt = new Date(payload.startDate);
      setFromDate(formatDate(new Date(dt.getFullYear(), dt.getMonth(), 1)));
      setToDate(formatDate(new Date(dt.getFullYear(), dt.getMonth() + 1, 0)));
      setTimeout(() => setReload((prev) => prev + 1), 300);
    } catch (err) {
      console.error("Submit failed", err);
      setAlertConfig({ visibility: true, message: isEditMode ? "Update failed" : "Add failed", type: "error" });
    }
  };


  const getColumns = () => {
    const baseColumns = [
      { key: "name", header: "Name" },

      { key: "target", header: "Target" },
      { key: "action", header: "Action" },
    ];

    const fullColumns = [
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

    if (type === "designation") {
      return baseColumns;
    }

    return fullColumns;
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
          <h1 className="text-2xl font-semibold mb-4">Targets</h1>
          <div className="flex gap-2 flex-wrap mb-6">
            <select
              className={`lp-2 border rounded pl-5 py-2 ${!type ? "text-gray-400" : "text-black"
                }`}
              value={type}
              onChange={(e) => {
                const selected = e.target.value;
                setLoading(true);

                setTableData([]);
                setType(selected);
                setSelectedId("all");
              }}
            >
              <option value="" hidden>
                Select type
              </option>
              <option value="agent" className="text-black">
                Agent
              </option>
              <option value="employee" className="text-black">
                Employee
              </option>
              {/* <option value="designation" className="text-black">
                Designation
              </option> */}
            </select>
            {type && (
              <select
                className="p-2 border rounded"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="all">All</option>
                {(type === "agent"
                  ? agents
                  : type === "employee"
                    ? employees
                    : designations
                ).map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name || p.title}
                  </option>
                ))}
              </select>
            )}

            <input
              type="month"
              className="p-2 border rounded"
              value={fromDate.slice(0, 7)}
              onChange={(e) => {
                const selected = new Date(e.target.value);
                const first = formatDate(new Date(selected.getFullYear(), selected.getMonth(), 1));
                const last = formatDate(new Date(selected.getFullYear(), selected.getMonth() + 1, 0));
                setFromDate(first);
                setToDate(last);
              }}
            />


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
                exportedFileName="Target-Report.csv"
              />
            )}
          </div>
        </div>
      </div>

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
            {isEditMode ? "Targets" : "Set Target"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedName && (
              <>
                <label className="block font-medium">Target For</label>
                <input
                  type="text"
                  value={selectedName}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </>
            )}
            <label className="block font-medium">Month</label>
            <input
              type="month"
              name="startDate"
              value={formData.startDate.slice(0, 7)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                const first = formatDate(new Date(date.getFullYear(), date.getMonth(), 1));
                const last = formatDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
                setFormData((prev) => ({
                  ...prev,
                  startDate: first,
                  endDate: last,
                }));
              }}
              className="w-full p-2 border rounded bg-gray-100"
            />

            <label className="block font-medium">Target Amount</label>
            <input
              type="number"
              name="totalTarget"
              value={formData.totalTarget}
              onChange={handleFormChange}
              className="w-full p-2 border rounded"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              {isEditMode ? "Update Target" : "Save Target"}
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};




export default Target;


