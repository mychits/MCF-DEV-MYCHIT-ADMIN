import { useEffect, useState, useRef } from "react";
import Navbar from "../components/layouts/Navbar";
import SettingSidebar from "../components/layouts/SettingSidebar";
import Sidebar from "../components/layouts/Sidebar";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Dropdown, Drawer } from "antd";
import { IoMdMore, IoMdAdd, IoMdClose } from "react-icons/io";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import Loader from "../components/loaders/CircularLoader";
import { Collapse } from "antd";
import { Link } from "react-router-dom";
import {
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { BiRupee } from "react-icons/bi";
import { FaMoneyBill } from "react-icons/fa";
import { MdPayments } from "react-icons/md";
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
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Target = () => {
  const [selectedType, setSelectedType] = useState("agents");
  const [selectedId, setSelectedId] = useState("all");
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "",
    type: "",
  });
  const [initialDataLoading, setInitialDataLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(currentYearMonth);
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
    December: 0,
  });
  const [targetExists, setTargetExists] = useState(false);
  const [fetchedTargetData, setFetchedTargetData] = useState(null);

  const alertShownRef = useRef({
    agents: false,
    targets: false,
  });

  const parseDate = (dateString) => {
    const [year, month] = dateString.split("-");
    return {
      year,
      month: String(parseInt(month)).padStart(2, "0"),
      monthName: monthNames[parseInt(month) - 1],
    };
  };

  const formatToYearMonth = (year, month) => {
    return `${year}-${String(month).padStart(2, "0")}`;
  };

  const getMonthDateRange = (dateString) => {
    const { year, month } = parseDate(dateString);
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0);

    return {
      from_date: formatDate(startDate),
      to_date: formatDate(endDate),
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setInitialDataLoading(true);
      try {
        const [agentRes, employeeRes] = await Promise.all([
          api.get("/agent/get-agent"),
          api.get("/agent/get-employee"),
        ]);

        const allAgents = agentRes.data || [];
        setAgents(
          allAgents.filter(
            (a) => a.agent_type === "agent" || a.agent_type === "both"
          )
        );

        setEmployees(employeeRes.data?.employee || []);

        alertShownRef.current.agents = false;
      } catch (err) {
        console.error("Error fetching agents/employees:", err);

        if (!alertShownRef.current.agents) {
          setAlertConfig({
            visibility: true,
            message: "Failed to load agents and employees",
            type: "error",
          });
          alertShownRef.current.agents = true;

          setTimeout(() => {
            alertShownRef.current.agents = false;
          }, 3000);
        }
      } finally {
        setInitialDataLoading(false);
      }
    };

    fetchData();
  }, [reload]);

  useEffect(() => {
    const abortController = new AbortController();

    setDataLoading(true);

    const fetchTargets = async () => {
      try {
        const { from_date, to_date } = getMonthDateRange(selectedDate);

        let res;
        if (selectedType === "agents") {
          res = await api.get("/target/agents", {
            params: {
              from_date,
              to_date,
            },
            signal: abortController.signal,
          });
        } else {
          res = await api.get("/target/employee", {
            params: {
              from_date,
              to_date,
            },
            signal: abortController.signal,
          });
        }

        if (res.data.success && res.data.summaries) {
          setTargetData(res.data.summaries);
          alertShownRef.current.targets = false;
        } else {
          setTargetData([]);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching targets:", err);
          if (!alertShownRef.current.targets) {
            alertShownRef.current.targets = true;

            setTimeout(() => {
              alertShownRef.current.targets = false;
            }, 3000);
          }
          setTargetData([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setDataLoading(false);
        }
      }
    };

    if (!initialDataLoading) {
      fetchTargets();
    }

    return () => {
      abortController.abort();
    };
  }, [selectedType, selectedDate, initialDataLoading, reload]);

  useEffect(() => {
    if (targetData.length > 0) {
      let filteredData = targetData;

      if (selectedId !== "all") {
        filteredData = targetData.filter(
          (item) => item.agent.id === selectedId
        );
      }

      const anyTargetExists = filteredData.some(
        (item) => item.agent.target.value !== "Not Set"
      );
      setTargetExists(anyTargetExists);

      const formattedData = filteredData.map((item) => {
        const hasTarget = item.agent.target.value !== "Not Set";
        const dropdownItems = [{ key: "update", label: "Edit Target" }];

        if (!hasTarget) {
          dropdownItems.unshift({ key: "set", label: "Set Target" });
        }

        const actionDropdown = (
          <Dropdown
            trigger={["click"]}
            menu={{
              items: dropdownItems,
              onClick: ({ key }) => {
                if (key === "set") {
                  setIsBulkMode(false);
                  setIsEditMode(false);
                  openSetDrawer(item);
                }
                if (key === "update") {
                  setIsBulkMode(false);
                  setIsEditMode(true);
                  openEditDrawer(item);
                }
              },
            }}
          >
            <IoMdMore className="cursor-pointer" />
          </Dropdown>
        );

        return {
          name: item.agent.name,
          phone_number: item.agent.phone,
          actual_business: item?.metrics?.actual_business,
          target_difference: item?.metrics?.target_difference,
          target_remaining_digits: item?.metrics?.target_remaining_digits,
          target: item.agent?.target?.value,
          action: actionDropdown,
          _item: item,
        };
      });

      setTableData(formattedData);
    } else {
      setTableData([]);
    }
  }, [selectedId, targetData]);

  const fetchTargetDetails = async (item) => {
    try {
      const { year } = parseDate(selectedDate);

      const res = await api.get(`/target/agent/${item.agent.id}`, {
        params: { year },
      });

      let monthData = null;

      if (res.data && res.data.length > 0) {
        const target = res.data[0];
        monthData = target.monthData || null;
      }

      setFetchedTargetData(monthData);
      return monthData;
    } catch (err) {
      console.error("Error fetching target details:", err);
      setFetchedTargetData(null);
      return null;
    }
  };

  const openSetDrawer = async (item) => {
    setSelectedPerson(item);
    setIsEditMode(false);
    setIsBulkMode(false);
    setEditTargetId(item.agent.id);

    const monthData = await fetchTargetDetails(item);

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
      December: 0,
    };

    if (monthData) {
      Object.keys(monthValues).forEach((month) => {
        monthValues[month] = monthData[month] || 0;
      });
    }

    setMonthValues(monthValues);
    setDrawerVisible(true);
  };

  const openEditDrawer = async (item) => {
    setSelectedPerson(item);
    setIsEditMode(true);
    setIsBulkMode(false);
    setEditTargetId(item.agent.id);

    const monthData = await fetchTargetDetails(item);

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
      December: 0,
    };

    if (monthData) {
      Object.keys(monthValues).forEach((month) => {
        monthValues[month] = monthData[month] || 0;
      });
    }

    setMonthValues(monthValues);
    setDrawerVisible(true);
  };

  const openBulkDrawer = () => {
    setIsBulkMode(true);
    setIsEditMode(false);
    setDrawerVisible(true);

    setMonthValues({
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
      December: 0,
    });
  };

  const handleMonthChange = (month, value) => {
    setMonthValues((prev) => ({
      ...prev,
      [month]: value === "" ? "" : Number(value),
    }));
  };

  const handleDeleteTarget = async (id) => {
    try {
      await api.patch(`/target/agent/${id}`, { deleted: true });

      setAlertConfig({
        visibility: true,
        message: "Target deleted successfully",
        type: "success",
      });
      setReload((prev) => prev + 1);
    } catch (err) {
      console.error("Delete failed", err);
      setAlertConfig({
        visibility: true,
        message: "Delete failed. Please try again.",
        type: "error",
      });
    } finally {
      setTimeout(() => {
        setAlertConfig((prev) => ({ ...prev, visibility: false }));
      }, 4000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { year } = parseDate(selectedDate);

      if (isBulkMode) {
        const agentIds =
          selectedType === "agents"
            ? agents.map((a) => a._id)
            : employees.map((e) => e._id);

        await api.patch(`/target/bulk`, {
          agentIds,
          year,
          monthValues,
        });
      } else {
        await api.patch(
          `/target/agent/${editTargetId}?year=${year}`,
          monthValues
        );
      }

      setAlertConfig({
        visibility: true,
        message: isBulkMode
          ? "Bulk targets updated successfully"
          : isEditMode
          ? "Target updated successfully"
          : "Target set successfully",
        type: "success",
      });
      setDrawerVisible(false);
      setReload((prev) => prev + 1);
    } catch (err) {
      console.error("Submit failed", err);
      setAlertConfig({
        visibility: true,
        message: isBulkMode
          ? "Bulk update failed"
          : isEditMode
          ? "Update failed"
          : "Add failed",
        type: "error",
      });
    }
  };

  const getColumns = () => {
    return [
      { key: "name", header: "Name" },
      { key: "phone_number", header: "Phone Number" },
      { key: "target", header: "Target" },
      { key: "actual_business", header: "Actual Business" },
      { key: "target_difference", header: "Target Difference" },
      { key: "target_remaining_digits", header: "Target Remaining Digits" },
      { key: "action", header: "Action" },
    ];
  };

  return (
    <>
      <div className="flex mt-20">
        <Navbar visibility={true} />
        <Sidebar/>
        <CustomAlertDialog
          type={alertConfig.type}
          isVisible={alertConfig.visibility}
          message={alertConfig.message}
          onClose={() => {
            setAlertConfig((prev) => ({ ...prev, visibility: false }));
          }}
        />

        <div className="flex-grow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Targets Management</h1>
            <button
              onClick={openBulkDrawer}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <IoMdAdd className="mr-2" /> Bulk Update Targets
            </button>
          </div>

          {initialDataLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <>
              <div className="my-6">
                <Collapse
                  items={[
                    {
                      key: "1",
                      label: (
                        <span className="font-semibold text-gray-800 text-base">
                          Shortcut Keys
                        </span>
                      ),
                      children: (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <Link
                            to="/reports/target-commission"
                            className="flex text-base items-center gap-2 border  border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <DollarOutlined
                              className="text-blue-500"
                              size={30}
                            />
                            Commission Report
                          </Link>

                          <Link
                            to="/reports/target-incentive"
                            className="flex text-base items-center gap-2 border  border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <FileTextOutlined
                              className="text-blue-500"
                              size={30}
                            />
                            Incentive Report
                          </Link>

                          <Link
                            to="/target-commission-incentive"
                            className="flex text-base items-center gap-2 border  border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <MdPayments className="text-blue-500" size={30} />
                            Commission or Incentive Payout
                          </Link>

                          <Link
                            to="/target-payout-salary"
                            className="flex text-base items-center gap-2 border  border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <FaMoneyBill className="text-blue-500" size={30} />
                            Salary Payout
                          </Link>
                        </div>
                      ),
                    },
                  ]}
                  defaultActiveKey={["1"]}
                  className="rounded-lg border border-gray-200 bg-white shadow-sm"
                />
              </div>
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
                    Target Month
                  </label>
                  <input
                    type="month"
                    className="p-2 border rounded w-full min-w-[150px]"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={formatToYearMonth(currentYear, currentMonth)}
                  />
                </div>
              </div>

              <div className="relative min-h-[200px]">
                {dataLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                  </div>
                )}
                <DataTable
                  data={tableData}
                  columns={getColumns()}
                  exportedPdfName="Target-Report"
                  exportedFileName="Target-Report.csv"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Target Drawer */}
      <Drawer
        title={
          <div className="flex justify-between items-center">
            <span>
              {isBulkMode
                ? "Bulk Update Targets"
                : isEditMode
                ? "Edit Target"
                : "Set Target"}
            </span>
            <button
              onClick={() => setDrawerVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <IoMdClose size={20} />
            </button>
          </div>
        }
        placement="right"
        closable={false}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={500}
        className="target-drawer"
        styles={{
          body: {
            padding: 0,
            overflow: "hidden",
          },
          header: {
            borderBottom: "1px solid #f0f0f0",
            padding: "16px 24px",
          },
        }}
      >
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isBulkMode && selectedPerson && (
              <div>
                <label className="block font-medium mb-1">Target For</label>
                <div className="w-full p-2 border rounded bg-gray-50">
                  {selectedPerson.agent.name}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-medium mb-1">Year</label>
                <div className="w-full p-2 border rounded bg-gray-50">
                  {parseDate(selectedDate).year}
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Month</label>
                <div className="w-full p-2 border rounded bg-gray-50">
                  {parseDate(selectedDate).monthName}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monthNames.map((month) => (
                <div key={month}>
                  <label className="block font-medium mb-1">{month}</label>
                  <div className="flex items-center">
                    <span className="mr-2">₹</span>
                    <input
                      type="number"
                      value={monthValues[month]}
                      onChange={(e) => handleMonthChange(month, e.target.value)}
                      className="w-full p-2 border rounded"
                      min="0"
                      placeholder={`Enter ${month} target`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mt-6"
            >
              {isBulkMode
                ? "Update All Targets"
                : isEditMode
                ? "Update Target"
                : "Save Target"}
            </button>
          </form>
        </div>
      </Drawer>
    </>
  );
};

export default Target;
