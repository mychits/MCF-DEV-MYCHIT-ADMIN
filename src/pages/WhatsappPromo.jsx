/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import { FaWhatsapp } from "react-icons/fa";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import whatsappApi from "../instance/WhatsappInstance";
import CircularLoader from "../components/loaders/CircularLoader";
import moment from "moment";
const WhatsappPromo = () => {
  const [TableUsers, setTableUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const now = new Date();
  const todayString = now.toISOString().split("T")[0];
  const [selectedFromDate, setSelectedFromDate] = useState(todayString);
  const [selectedToDate, setSelectedToDate] = useState(todayString);
  const [whatsappData, setWhatsappData] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectUser, setSelectUser] = useState({});
  const [customerCount, setCustomerCount] = useState(0);
  const [selectAll, setSelectAll] = useState({ msg: "All", checked: false });
  const [formData, setFormData] = useState({
    template_name: "",
  });
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [errors, setErrors] = useState({});
  const [userType, setUserType] = useState("customer"); // State for dynamic header title
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedReferrerName, setSelectedReferrerName] = useState("");
  const [selectedReferrerType, setSelectedReferrerType] = useState(""); // Initial filter type
  const [agentList, setAgentList] = useState([]);
  const [leadList, setLeadList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [leadsMap, setLeadsMap] = useState({});
  const [groupNameFilter, setGroupNameFilter] = useState("");
  const [groupList, setGroupList] = useState([]);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [allLeads, setAllLeads] = useState([]);
  const [allEnrolls, setAllEnrolls] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState("All");

  // Effect to update the header title based on selectedReferrerType
  useEffect(() => {
    const typeMap = {
      customer: "Staff",
      agent: "Agent",
      employee: "Employee",
      lead: "Leads",
    };
    setUserType(typeMap[selectedReferrerType] || "Users"); // Default to "Users"
  }, [selectedReferrerType]);
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await api.get("/lead/get-lead");
        const data = Array.isArray(res.data) ? res.data : res.data?.leads || [];
        const map = {};
        for (const lead of data) {
          let lead_type_name = "";
          if (lead.lead_type === "customer") {
            lead_type_name = lead?.lead_customer?.full_name;
          } else if (lead.lead_type === "agent") {
            lead_type_name = lead?.lead_agent?.name;
          }
          map[lead._id] = lead_type_name?.toLowerCase();
        }
        setLeadsMap(map);
      } catch (err) {
        console.error("Failed to fetch leads", err);
      }
    };

    fetchLeads();
  }, []);

  const handleSelectFilter = (value) => {
    setSelectedLabel(value);

    const today = new Date();
    const formatDate = (date) => date.toLocaleDateString("en-CA");

    if (value === "Today") {
      const formatted = formatDate(today);
      setSelectedFromDate(formatted);
      setSelectedToDate(formatted);
    } else if (value === "Yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const formatted = formatDate(yesterday);
      setSelectedFromDate(formatted);
      setSelectedToDate(formatted);
    } else if (value === "ThisMonth") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setSelectedFromDate(formatDate(start));
      setSelectedToDate(formatDate(end));
    } else if (value === "LastMonth") {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setSelectedFromDate(formatDate(start));
      setSelectedToDate(formatDate(end));
    } else if (value === "ThisYear") {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      setSelectedFromDate(formatDate(start));
      setSelectedToDate(formatDate(end));
    } else if (value === "All") {
      const start = new Date(2000, 0, 1);
      const end = today;
      setSelectedFromDate(formatDate(start));
      setSelectedToDate(formatDate(end));
    } else if (value === "Custom") {
      //  Do NOT override dates. Allow user to select manually.
      // Just keep the currently selectedFromDate / selectedToDate
    }
  };
  useEffect(() => {
    handleSelectFilter("All");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [leadRes, enrollRes] = await Promise.all([
          api.get("/lead/get-lead"),
          api.get("/enroll-report/get-enroll-report"),
        ]);

        setAllLeads(
          Array.isArray(leadRes.data) ? leadRes.data : leadRes.data?.leads || []
        );
        setAllEnrolls(enrollRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const fetchReferrers = async () => {
      try {
        if (selectedReferrerType === "agent") {
          const res = await api.get("/agent/get");
          const allAgents = Array.isArray(res.data)
            ? res.data
            : res.data.agent || [];
          const filtered = allAgents.filter((a) => a.agent_type === "agent");
          setAgentList(filtered);
        } else if (selectedReferrerType === "employee") {
          const res = await api.get("/agent/get-employee");
          const employees = Array.isArray(res.data.employee)
            ? res.data.employee
            : [];
          setAgentList(employees);
        } else if (selectedReferrerType === "lead") {
          const res = await api.get("/lead/get-lead");
          setLeadList(
            Array.isArray(res.data) ? res.data : res.data.leads || []
          );
        } else if (selectedReferrerType === "customer") {
          // const res = await api.get("/user/get-user");
          // setCustomerList(
          //   Array.isArray(res.data) ? res.data : res.data.users || []
          // );
          try {
            //  Fetch Agents
            const agentRes = await api.get("/agent/get");
            const allAgents = Array.isArray(agentRes.data)
              ? agentRes.data
              : agentRes.data.agent || [];
            const filteredAgents = allAgents.filter(
              (a) => a.agent_type === "agent"
            );

            //  Fetch Employees
            const empRes = await api.get("/agent/get-employee");
            const employees = Array.isArray(empRes.data.employee)
              ? empRes.data.employee
              : [];

            //  Combine Agents + Employees
            setAgentList([...filteredAgents, ...employees]);
          } catch (error) {
            console.error("Error fetching agents and employees:", error);
          }
        }
      } catch (err) {
        console.error("Error fetching referrer list:", err);
      }
    };

    fetchReferrers();
  }, [selectedReferrerType]);

  const filteredUsers = useMemo(() => {
    const filtered = TableUsers.filter((u) => {
      //const enrollmentDate = new Date(u.createdAt || u.enrollmentDate);
      const enrollmentDate = u.createdAt ? new Date(u.createdAt) : null;
      const matchFrom = selectedFromDate
        ? enrollmentDate >= new Date(selectedFromDate)
        : true;
      const matchTo = selectedToDate
        ? enrollmentDate <= new Date(selectedToDate + "T23:59:59")
        : true;
      return matchFrom && matchTo;
    });

    return filtered.map((user, index) => {
      const isSelected = !!selectUser[user._id];

      return {
        ...user,
        sl_no: index + 1,
        checkBoxs: (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => handleCheckboxChange(e.target.checked, user)}
          />
        ),
        isSelected,
      };
    });
  }, [TableUsers, selectedFromDate, selectedToDate, selectUser]);

  const visibleSelectedCount = useMemo(() => {
    return filteredUsers.filter((user) => user.isSelected).length;
  }, [filteredUsers]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/group/get-group-admin");
        const groups = Array.isArray(res.data)
          ? res.data
          : res.data?.groups || [];
        setGroupList(groups);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      }
    };

    fetchGroups();
  }, []);
  const sendWhatsapp = async () => {
    //  Construct payload with 'receivers' object as backend expects
    const payload = {
      receivers: {},
    };

    whatsappData.forEach((user, index) => {
      payload.receivers[`user${index}`] = user;
    });

    // Check if there is at least one selected user
    if (Object.keys(payload.receivers).length === 0) {
      setAlertConfig({
        type: "warning",
        message: "Please select at least one user to send WhatsApp message.",
        visibility: true,
      });
      return;
    }

    try {
      const res = await api.post("/whatsapp/whatsapp-promo-message", payload);
      console.info(res, "test");

      setAlertConfig({
        type: "success",
        message: `Messages sent! Success: ${res.data.successCount}, Failed: ${res.data.errorCount}`,
        visibility: true,
      });

      //  Reset selection after sending
      const updatedSelection = { ...selectUser };
      whatsappData.forEach((entry) => {
        updatedSelection[entry.info.userId] = false;
      });
      setSelectUser(updatedSelection);
      setWhatsappData([]);
    } catch (err) {
      console.error("WhatsApp Error:", err);
      setAlertConfig({
        type: "error",
        message: "Failed to send WhatsApp messages.",
        visibility: true,
      });
    }
  };

  const filteredData = useMemo(() => {
    //  Use selectedFromDate and selectedToDate
    const from = selectedFromDate
      ? moment(selectedFromDate, "YYYY-MM-DD").startOf("day")
      : null;

    const to = selectedToDate
      ? moment(selectedToDate, "YYYY-MM-DD").endOf("day")
      : null;

    const filterFn = (item) => {
      const created = item?.createdAt ? moment(item.createdAt) : null;

      //  Only apply date range if label is not "All"
      const isWithinDateRange =
        (!from || (created && created.isSameOrAfter(from))) &&
        (!to || (created && created.isSameOrBefore(to)));

      const normalizedName = selectedReferrerName.trim().toLowerCase();

      if (selectedReferrerType === "lead") {
        if (
          !item?.lead_customer?.full_name &&
          !item?.group_id?.group_name &&
          !item?.lead_customer?.phone_number
        ) {
          return false;
        }
        const leadTypeName =
          item.lead_type === "customer"
            ? item?.lead_customer?.full_name
            : item.lead_type === "agent"
            ? item?.lead_agent?.name
            : "";

        const nameMatches =
          !normalizedName ||
          (leadTypeName || "").toLowerCase().includes(normalizedName);

        const matchesGroup =
          !selectedGroupName ||
          (item?.group_id?.group_name || "").toLowerCase() ===
            selectedGroupName.toLowerCase();

        return isWithinDateRange && nameMatches && matchesGroup;
      }

      const agentName = item?.agent?.name?.toLowerCase();
      const agentType = item?.agent?.agent_type;

      const matchesAgent =
        selectedReferrerType === "agent" &&
        agentType === "agent" &&
        agentName?.includes(normalizedName);

      const matchesEmployee =
        selectedReferrerType === "employee" &&
        agentType === "employee" &&
        agentName?.includes(normalizedName);

      const matchesCustomer =
        selectedReferrerType === "customer" &&
        item?.agent?.name?.toLowerCase().includes(normalizedName);

      const typeMatch =
        selectedReferrerType === "" ||
        matchesAgent ||
        matchesEmployee ||
        matchesCustomer;

      const matchesGroup =
        !selectedGroupName ||
        (item?.group_id?.group_name || "").toLowerCase() ===
          selectedGroupName.toLowerCase();

      return typeMatch && isWithinDateRange && matchesGroup;
    };

    return selectedReferrerType === "lead"
      ? allLeads.filter(filterFn)
      : allEnrolls.filter(filterFn);
  }, [
    allLeads,
    allEnrolls,
    selectedReferrerName,
    selectedReferrerType,
    selectedFromDate, //  FIXED
    selectedToDate, //  FIXED
    selectedGroupName,
  ]);

  useEffect(() => {
    const formatted = filteredData
      .filter((item) => {
        const fullName =
          selectedReferrerType === "lead"
            ? item?.lead_name
            : item?.user_id?.full_name;
        const phoneNumber =
          selectedReferrerType === "lead"
            ? item?.lead_phone
            : item?.user_id?.phone_number;
        const groupName = item?.group_id?.group_name;

        return fullName && phoneNumber && groupName; // keep only valid rows
      })
      .map((item, index) => ({
        _id: item._id,
        id: index + 1,
        full_name:
          selectedReferrerType === "lead"
            ? item?.lead_name || "NA"
            : item?.user_id?.full_name || "NA",
        phone_number:
          selectedReferrerType === "lead"
            ? item?.lead_phone || "NA"
            : item?.user_id?.phone_number || "NA",
        group_name: item?.group_id?.group_name || "NA",
        group_id: item?.group_id?._id || "NA",
        createdAt: item?.createdAt ? new Date(item.createdAt) : null,
        enrollment_date: item?.createdAt
          ? new Date(item.createdAt).toISOString().split("T")[0]
          : "NA",
      }));

    const newSelection = {};
    formatted.forEach((u) => (newSelection[u._id] = false));
    setSelectUser(newSelection);
    setTableUsers(formatted);
  }, [filteredData]);

  useEffect(() => {
    const selectedIds = Object.values(selectUser).filter((v) => v).length;
    const total = TableUsers.length;

    setCustomerCount(selectedIds);
    setSelectAll((prev) => ({
      ...prev,
      checked: selectedIds === total && total > 0,
      msg: selectedIds === total && total > 0 ? "No" : "All",
    }));
  }, [selectUser, TableUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.template_name.trim()) {
      newErrors.template_name = "Template name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckboxChange = (checked, user) => {
    setSelectUser((prev) => ({
      ...prev,
      [user._id]: checked,
    }));

    const userData = {
      info: {
        userId: user._id,
        userName: user.full_name || user.lead_name,
        userPhone: user.phone_number || user.lead_phone,
        groupName: user.group_name,
        groupId: user.group_id?._id || user.group_id || "NA",
      },
    };

    setWhatsappData((prev) => {
      if (checked) {
        return [...prev, userData];
      } else {
        return prev.filter((entry) => entry.info.userId !== user._id);
      }
    });
  };

  const handleSelectAll = (checked) => {
    const newSelection = {};
    const newWhatsappData = [];

    TableUsers.forEach((user) => {
      newSelection[user._id] = checked;
      if (checked) {
        newWhatsappData.push({
          info: {
            userId: user._id,
            userName: user.full_name || user.lead_name,
            userPhone: user.phone_number || user.lead_phone,
            groupName: user.group_name,
            groupId: user.group_id?._id || user.group_id || "NA",
          },
        });
        console.info(newWhatsappData, "whatsapp test");
      }
    });

    setSelectUser(newSelection);
    setWhatsappData(newWhatsappData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    try {
      if (isValid) {
        setDisabled(true);
        const response = await whatsappApi.post("/marketing", {
          selectUser,
          template_name: formData?.template_name,
        });
        if (response.status >= 400) {
          setShowModal(false);
          setDisabled(false);
          setErrors({});
          setFormData({
            template_name: "",
          });

          setAlertConfig({
            type: "error",
            message: "Whatsapp Failure",
            visibility: true,
          });
        }
        if (response.status === 201) {
          setShowModal(false);
          setErrors({});
          setFormData({
            template_name: "",
          });
          setReloadTrigger((prev) => prev + 1);
          setAlertConfig({
            type: "success",
            message: "Whatsapped Successfully",
            visibility: true,
          });
        }

        setShowModal(false);
        setErrors({});
        setFormData({
          template_name: "",
        });
      }
    } catch (err) {
      setAlertConfig({
        type: "error",
        message: "Whatsapp Failure",
        visibility: true,
      });
      setDisabled(false);
      console.error("whatsapp error", err.message);
    }
  };

  useEffect(() => {
    const countCustomer = () => {
      let counter = 0;
      Object.values(selectUser).forEach((ele) => {
        if (ele) {
          counter++;
        }
      });
      setCustomerCount(counter);
    };
    countCustomer();
  }, [selectUser, reloadTrigger]);

  const columns = [
    { key: "checkBoxs", header: "Select" },
    { key: "sl_no", header: "SL. NO" },
    { key: "enrollment_date", header: "Enrolled On" },
    { key: "full_name", header: "Name" },
    { key: "phone_number", header: "Phone Number" },
    { key: "group_name", header: "Group Name" },
  ];

  return (
    <>
      <div className="w-screen">
        <div className="flex mt-20">
          <CustomAlertDialog
            type={alertConfig.type}
            isVisible={alertConfig.visibility}
            message={alertConfig.message}
            onClose={() =>
              setAlertConfig((prev) => ({ ...prev, visibility: false }))
            }
          />

          <div className="flex-grow p-1">
            <div className="mt-2 mb-2">
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-col space-y-4">
                  <div className="flex">
                    <FaWhatsapp color="green" size="30" className="m-2 mb-10" />
                    <h1 className="text-2xl font-semibold flex items-center mb-10">
                      Whatsapp {userType}
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center space-x-4 mt-4 mb-2">
                    {/* Select Any Dropdown */}
                    <div className="flex flex-col space-y-2 mb-5">
                      <label className="font-medium">Select Any</label>
                      <select
                        className="border rounded px-10 py-2 text-sm"
                        value={selectedReferrerType}
                        onChange={(e) =>
                          setSelectedReferrerType(e.target.value)
                        }
                      >
                        <option value="">All</option>
                        <option value="agent">Agent</option>
                        <option value="lead">Lead</option>
                        <option value="customer">Customer</option>
                        <option value="employee">Employee</option>
                      </select>
                    </div>

                    {/* Select {userType} Name Dropdown */}
                    {selectedReferrerType && (
                      <div className="flex flex-col space-y-2 mb-5">
                        <label className="font-medium">
                          Select {userType} Name
                        </label>
                        <select
                          className="border p-2 px-8 rounded text-sm min-w-[200px]"
                          value={selectedReferrerName}
                          onChange={(e) =>
                            setSelectedReferrerName(e.target.value)
                          }
                        >
                          <option value="">All</option>
                          {selectedReferrerType === "agent" &&
                            agentList.map((agent) => (
                              <option key={agent._id} value={agent.name}>
                                {agent.name} ({agent.phone_number})
                              </option>
                            ))}
                          {selectedReferrerType === "employee" &&
                            agentList.map((agent) => (
                              <option key={agent._id} value={agent.name}>
                                {agent.name} ({agent.phone_number})
                              </option>
                            ))}
                          {selectedReferrerType === "lead" &&
                            leadList.map((lead) => {
                              const lead_type_name =
                                lead?.lead_type === "customer"
                                  ? lead?.lead_customer?.full_name
                                  : lead?.lead_type === "agent"
                                  ? lead?.lead_agent?.name
                                  : "";

                              return (
                                <option key={lead._id} value={lead_type_name}>
                                  {lead_type_name} ({lead?.lead_phone || "NA"})
                                </option>
                              );
                            })}
                          {/* {selectedReferrerType === "customer" &&
                            customerList.map((user) => (
                              <option key={user._id} value={user.full_name}>
                                {user.full_name} ({user.phone_number})
                              </option>
                            ))} */}
                          {selectedReferrerType === "customer" &&
                            agentList.map((person) => (
                              <option key={person._id} value={person.name}>
                                {person.name} ({person.phone_number})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    <div className="flex flex-col space-y-2 mb-5">
                      <label className="font-medium">Select Date Filter</label>
                      <select
                        className="border p-2 rounded text-sm"
                        value={selectedLabel}
                        onChange={(e) => handleSelectFilter(e.target.value)}
                      >
                        <option value="Today">Today</option>
                        <option value="Yesterday">Yesterday</option>
                        <option value="ThisMonth">This Month</option>
                        <option value="LastMonth">Last Month</option>
                        <option value="ThisYear">This Year</option>
                        <option value="All">All</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                    {selectedLabel === "Custom" && (
                      <>
                        <div className="flex flex-col space-y-2 mb-5">
                          <label className="font-medium">From Date</label>
                          <input
                            type="date"
                            className="border p-2 rounded text-sm"
                            value={selectedFromDate}
                            onChange={(e) =>
                              setSelectedFromDate(e.target.value)
                            }
                          />
                        </div>

                        <div className="flex flex-col space-y-2 mb-5">
                          <label className="font-medium">To Date</label>
                          <input
                            type="date"
                            className="border p-2 rounded text-sm"
                            value={selectedToDate}
                            onChange={(e) => setSelectedToDate(e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {/* Select Group */}
                    <div className="flex flex-col space-y-2 mb-5">
                      <label className="font-medium">Select Group</label>
                      <select
                        className="border p-2 rounded text-sm min-w-[200px]"
                        value={selectedGroupName}
                        onChange={(e) => setSelectedGroupName(e.target.value)}
                      >
                        <option value="">All</option>
                        {groupList.map((group) => (
                          <option key={group._id} value={group.group_name}>
                            {group.group_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Select All Checkbox */}
                    <div className="flex items-center space-x-2 mt-2">
                      <label className="flex items-center gap-2 font-medium">
                        <input
                          type="checkbox"
                          checked={
                            TableUsers.length > 0 &&
                            TableUsers.every((u) => selectUser[u._id])
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        Select All
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={sendWhatsapp}
                  className="relative bg-green-600 text-white px-4 py-2 rounded shadow-md hover:bg-green-700 transition duration-200 flex items-center"
                >
                  {visibleSelectedCount > 0 && (
                    <div
                      className="min-w-6 h-6 absolute -right-3 -top-2 shadow-lg hover:bg-red-600 bg-red-400 rounded-full text-white flex items-center justify-center text-xs"
                      title={`Message will be sent to total ${visibleSelectedCount} customers`}
                    >
                      <span>{visibleSelectedCount}</span>
                    </div>
                  )}
                  <FaWhatsapp className="mr-2" size={20} />
                  WhatsApp
                </button>
              </div>
            </div>
            {filteredUsers.length > 0 && !isLoading ? (
              <DataTable
                isExportEnabled={true}
                data={filteredUsers}
                columns={columns}
                exportedPdfName="Whatsapp Promo"
                printHeaderKeys={[
                  "Referrer Name",
                  "Date Filter",
                  "To Date",
                  "Group Name",
                  "From Date",
                ]}
                printHeaderValues={[
                  selectedReferrerName || "All",
                  selectedLabel || "All",
                  selectedToDate || "NA",
                  selectedGroupName || "All",
                  selectedFromDate || "NA",
                ]}
                exportedFileName={`whatsapp-${
                  filteredUsers.length > 0
                    ? filteredUsers[0].full_name +
                      " to " +
                      filteredUsers[filteredUsers.length - 1].full_name
                    : "empty"
                }.csv`}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={filteredUsers.length <= 0 && !isLoading}
                data={"Group Data"}
              />
            )}
          </div>
        </div>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Send Message
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="template"
                >
                  Template Name
                </label>
                <input
                  type="text"
                  name="template_name"
                  value={formData.template_name}
                  onChange={handleChange}
                  id="templateName"
                  placeholder="Paste template name"
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 w-full p-2.5"
                />
              </div>
              {errors.template_name && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.template_name}
                </p>
              )}
              <button
                type="submit"
                disabled={disabled}
                className="w-full text-white bg-green-700 hover:bg-green-800
             focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Send
              </button>
            </form>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default WhatsappPromo;
