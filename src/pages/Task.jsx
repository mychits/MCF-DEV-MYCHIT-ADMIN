import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import api from "../instance/TokenInstance";
import CircularLoader from "../components/loaders/CircularLoader";
import { Dropdown } from "antd";
import { IoMdMore } from "react-icons/io";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { useLocation } from "react-router-dom";
const Task = () => {
  const [agents, setAgents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tableTasks, setTableTasks] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    taskTitle: "Pending  Lead Visit",
    taskDescription: "",
    startDate: new Date().toISOString().slice(0, 16),
    endDate: "",
    status: "Pending",
    lead: "",
  });
  const location = useLocation();
  const leadIdFromLocation = location?.state?.leadId || null;
  const [modalVisible, setModalVisible] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [currentTask, setCurrentTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [agentRes, leadRes, taskRes] = await Promise.all([
        api.get("/agent/get-agent"),
        api.get("/lead/get-lead"),
        api.get("/task/get-tasks"),
      ]);

      const agentData = agentRes.data;
      const leadData = leadRes.data;
      const taskData = taskRes.data;

      setAgents(agentData);
      setLeads(leadData);
      if (leadIdFromLocation) {
        setFormData((prev) => ({
          ...prev,
          lead: leadIdFromLocation,
        }));
        setModalVisible(true); // opens modal with lead selected
      }
      setTasks(taskData);

      const formatted = taskData.map((task, index) => {
        const emp = agentData.find((a) => a._id === task.employeeId);
        

        return {
          _id: task._id,
          id: index + 1,
          employeeName:  emp?.name || "N/A",
          employeeCode: emp?.employeeCode || "N/A",
          taskTitle: task.taskTitle,
          status: task.status,
          lead:
            task.lead?.name && task.lead?.phone
              ? `${task.lead.name} (${task.lead.phone})`
              : "N/A",

          action: (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "1",
                    label: (
                      <div
                        className="text-green-600"
                        onClick={() => openEdit(task)}
                      >
                        Edit
                      </div>
                    ),
                  },
                  {
                    key: "2",
                    label: (
                      <div
                        className="text-red-600"
                        onClick={() => handleDelete(task._id)}
                      >
                        Delete
                      </div>
                    ),
                  },
                ],
              }}
              placement="bottomLeft"
            >
              <IoMdMore className="cursor-pointer" />
            </Dropdown>
          ),
        };
      });

      setTableTasks(formatted);
    } catch (err) {
      console.error("Error fetching all data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [reloadTrigger]);
useEffect(() => {
  if (leadIdFromLocation && leads.length > 0) {
    const selectedLead = leads.find((l) => l._id === leadIdFromLocation);
    setFormData((prev) => ({
      ...prev,
      lead: leadIdFromLocation,
      startDate: new Date().toISOString().slice(0, 16),
    }));
    setModalVisible(true);
  }
}, [leadIdFromLocation, leads])
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
      };

      if (currentTask) {
        await api.put(`/task/update-task/${currentTask}`, payload);

        setAlertConfig({
          visibility: true,
          message: "Task updated successfully",
          type: "success",
        });
        setReloadTrigger((prev) => prev + 1);
      } else {
        await api.post("/task/add-task", payload);
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Task created successfully",
          type: "success",
        });
      }

      setModalVisible(false);
      setFormData({
        employeeId: "",
        taskTitle: "Pending Lead Visit",
        taskDescription: "",
        startDate: new Date().toISOString().slice(0, 16),
        endDate: "",
        status: "Pending",
        lead: "",
      });
      setCurrentTask(null);
      fetchAllData();
    } catch (err) {
      console.error("Task creation error:", err.response?.data || err.message);
      setAlertConfig({
        visibility: true,
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const openEdit = (task) => {
    setCurrentTask(task._id);
    setFormData({
      employeeId:
        typeof task.employeeId === "object"
          ? task.employeeId._id
          : task.employeeId || "",
      taskTitle: task.taskTitle,
      taskDescription: task.taskDescription,
      startDate: task.startDate?.slice(0, 16) || "",
      endDate: task.endDate?.slice(0, 16) || "",
      status: task.status || "Pending",
      lead: typeof task.lead === "object" ? task.lead._id : task.lead || "",
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/task/delete-task/${id}`);
      //fetchAllData();
      setReloadTrigger((prev) => prev + 1);
      setAlertConfig({
        visibility: true,
        message: "Task deleted",
        type: "success",
      });
    } catch (err) {
      setAlertConfig({
        visibility: true,
        message: "Delete failed",
        type: "error",
      });
    }
  };

  const columns = [
    { key: "employeeName", header: "Employee Name" },
    { key: "employeeCode", header: "Employee ID" },
    { key: "taskTitle", header: "Task Name" },
    { key: "status", header: "Task Status" },
    { key: "lead", header: "Lead" },
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
          onClose={() =>
            setAlertConfig((prev) => ({ ...prev, visibility: false }))
          }
        />
        <Sidebar />

        <div className="flex-grow p-7">
          <div className="mt-6 mb-8">
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl font-semibold">Tasks</h1>
              <button
                onClick={() => {
                  setModalVisible(true);
                  setFormData({
                    employeeId: "",
                    taskTitle: "",
                    taskDescription: "",
                    startDate: "",
                    endDate: "",
                    status: "Pending",
                    lead: "",
                  });
                  setCurrentTask(null);
                }}
                className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
              >
                + Add Task
              </button>
            </div>
          </div>

          {tableTasks.length > 0 && !isLoading ? (
            <DataTable
              updateHandler={(id) => openEdit(tasks.find((t) => t._id === id))}
              data={tableTasks}
              columns={columns}
              exportedFileName="Tasks.csv"
            />
          ) : (
            <CircularLoader
              isLoading={isLoading}
              failure={!isLoading}
              data="Task Data"
            />
          )}
        </div>
      </div>

      <Modal isVisible={modalVisible} onClose={() => setModalVisible(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {currentTask ? "Edit Task" : "Add Task"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Lead</label>
              <select
                name="lead"
                value={formData.lead}
                onChange={handleInput}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Lead</option>
                {leads.map((lead) => (
                  <option key={lead._id} value={lead._id}>
                    {`${lead?.lead_name} - ${lead?.lead_phone}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">
                Employee <span className="text-red-500 ">*</span>{" "}
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInput}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Employee</option>
                {agents.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">
                Task Title
                <span className="text-red-500 ">*</span>
              </label>
              <input
                type="text"
                name="taskTitle"
                value={formData.taskTitle || "Pending Lead Visit"}
                onChange={handleInput}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Task Description
                <span className="text-red-500 ">*</span>
              </label>
              <textarea
                name="taskDescription"
                value={formData.taskDescription}
                onChange={handleInput}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Start Date & Time
                <span className="text-red-500 ">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInput}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                End Date & Time
                <span className="text-red-500 ">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInput}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Task Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInput}
                className="w-full p-2 border rounded"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Task
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default Task;
