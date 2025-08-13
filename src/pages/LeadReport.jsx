/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import { IoMdMore } from "react-icons/io";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { Select, Dropdown } from "antd";
import { fieldSize } from "../data/fieldSize";
const LeadReport = () => {
  const [groups, setGroups] = useState([]);
  const [TableGroups, setTableGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [currentUpdateGroup, setCurrentUpdateGroup] = useState(null);
  const [loader, setLoader] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [errors, setErrors] = useState({});
  const [showFilterField, setShowFilterField] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [leadSourceOptions, setLeadSourceOptions] = useState([]);
  const [selectedLabel,setSelectedLabel] = useState("Today")
  const onGlobalSearchChangeHandler = (e) => {
    setSearchText(e.target.value);
  };
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });
  const handleGroupChange = async (groupId) => {
    //const groupId = event.target.value;
    setSelectedGroup(groupId);
  };
  const [formData, setFormData] = useState({
    lead_name: "",
    lead_phone: "",
    lead_profession: "",
    group_id: "",
    lead_type: "",
    lead_customer: "",
    lead_needs: "",
    note: "",
  });
  const [showContextMenu, setShowContextMenu] = useState({});
  const [updateFormData, setUpdateFormData] = useState({
    lead_name: "",
    lead_phone: "",
    lead_profession: "",
    group_id: "",
    lead_type: "",
    lead_customer: "",
    lead_agent: "",
    lead_needs: "",
    note: "",
  });

  const groupTime = [
    { value: "Today", label: "Today" },
    { value: "Yesterday", label: "Yesterday" },
    { value: "ThisMonth", label: "This Month" },
    { value: "LastMonth", label: "Last Month" },
    { value: "ThisYear", label: "This Year" },
    { value: "Custom", label: "Custom" },
  ];
  const now = new Date();
  const formatToday = (date) => now.toLocaleDateString("en-CA");
  const formatString = formatToday(now);

  const [selectedFromDate, setSelectedFromDate] = useState(formatString);
  const [selectedToDate, setSelectedToDate] = useState(formatString);

  const [selectedLeadSourceName, setSelectedLeadSourceName] = useState("");
  const [selectedNote, setSelectedNote] = useState("");

  const validateForm = (type) => {
    const newErrors = {};
    const data = type === "addLead" ? formData : updateFormData;
    if (!data.lead_name.trim()) {
      newErrors.lead_name = "Lead Name is required";
    }

    if (!data.lead_phone) {
      newErrors.lead_phone = "Phone Number is required";
    } else if (!/^[6-9]\d{9}$/.test(data.lead_phone)) {
      newErrors.lead_phone = "Invalid phone number (must be 10 digits)";
    }

    if (!data.lead_profession) {
      newErrors.lead_profession = "Profession is required";
    }

    if (!data.lead_type) {
      newErrors.lead_type = "Lead Source Type is required";
    }

    if (data.lead_type === "customer" && !data.lead_customer) {
      newErrors.lead_customer = "Customer selection is required";
    }

    if (data.lead_type === "agent" && !data.lead_agent) {
      newErrors.lead_agent = "Agent selection is required";
    }
    if (!data.lead_needs.trim()) {
      newErrors.lead_needs = "Lead Needs and Goals is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uniqueLeadSources = () => {
    const sourceMap = new Map();

    leads.forEach((lead) => {
      // Agent
      if (lead.lead_agent?._id && lead.lead_agent?.name) {
        sourceMap.set(`agent-${lead.lead_agent._id}`, {
          id: lead?.lead_agent?._id,
          name: lead?.lead_agent?.name,
          type: "Agent",
        });
      }

      // if (lead.lead_customer?._id && lead.lead_customer?.full_name) {
      //   sourceMap.set(`customer-${lead?.lead_customer?._id}`, {
      //     id: lead?.lead_customer?._id,
      //     name: lead?.lead_customer?.full_name,
      //     type: "Customer",
      //   });
      // }
    });

    return Array.from(sourceMap.values());
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/group/get-group-admin");

        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, []);
  const onContextMenuPressed = (id) => {
    setShowContextMenu((prev) => ({ ...prev, [id]: true }));
    console.log(showContextMenu);
  };

  const filteredGroups = groups.filter((group) =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteModalOpen = async (groupId) => {
    try {
      const response = await api.get(`/lead/get-lead-by-id/${groupId}`);
      setCurrentGroup(response.data);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching lead:", error);
    }
  };

  const handleUpdateModalOpen = async (groupId) => {
    try {
      const response = await api.get(`/lead/get-lead-by-id/${groupId}`);
      const groupData = response.data;
      setCurrentUpdateGroup(response.data);
      setUpdateFormData({
        lead_name: response.data.lead_name,
        lead_phone: response.data.lead_phone,
        lead_profession: response.data.lead_profession,
        group_id: response.data.group_id,
        lead_type: response.data.lead_type,
        lead_customer: response.data.lead_customer,
        lead_agent: response.data.lead_agent,
        lead_needs: response.data?.lead_needs,
        note: response.data.note,
      });
      setShowModalUpdate(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching group:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleDeleteGroup = async () => {
    if (currentGroup) {
      try {
        await api.delete(`/lead/delete-lead/${currentGroup._id}`);
        setShowModalDelete(false);
        setCurrentGroup(null);

        setAlertConfig({
          visibility: true,
          message: "Lead deleted successfully",
          type: "success",
        });
      } catch (error) {
        console.error("Error deleting lead:", error);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const isValid = validateForm();

    try {
      if (isValid) {
        await api.put(
          `/lead/update-lead/${currentUpdateGroup._id}`,
          updateFormData
        );
        setShowModalUpdate(false);
        setAlertConfig({
          visibility: true,
          message: "Lead Updated Successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "name", header: "Lead Name" },
    { key: "phone", header: "Lead Phone Number" },
    { key: "profession", header: "Lead Profession" },
    { key: "date", header: "Date" },
    { key: "group_id", header: "Group Name" },
    { key: "lead_type", header: "Lead Source Type" },
    { key: "lead_needs", header: "Lead Needs And Goals" },
    { key: "lead_type_name", header: "Lead Source Name" },
    { key: "note", header: "Note" },
    { key: "action", header: "Action" },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user/get-user");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get("/agent/get-agent");
        setAgents(response.data);
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
    };
    fetchAgents();
  }, []);
  // useEffect(() => {
  //   const fetchFilteredLead = async () => {
  //     setLoader(true);
  //     try {
  //       console.info("fromdate", selectedFromDate, selectedToDate);
  //       const response = await api.get("/lead-report/get-lead-report", {
  //         params: {
  //           from_date: selectedFromDate,
  //           to_date: selectedToDate,
  //           lead_source_name: selectedLeadSourceName,
  //           group_id: selectedGroup,
  //           note: selectedNote,
  //         },
  //       });
  //       setLoader(false);

  //       const formattedData = response.data.map((group, index) => ({
  //         _id: group._id,
  //         id: index + 1,
  //         name: group.lead_name,
  //         phone: group.lead_phone,
  //         profession: group.lead_profession,
  //         lead_needs: group?.lead_needs,
  //         group_id: group?.group_id?.group_name,
  //         date: group?.createdAt.split("T")[0],
  //         lead_type: group.lead_type === "agent" ? "employee" : group.lead_type,
  //         note: group?.note,
  //         lead_type_name:
  //           group.lead_type === "customer"
  //             ? group?.lead_customer?.full_name
  //             : group.lead_type === "agent"
  //             ? group?.lead_agent?.name
  //             : "",
  //         action: (
  //           <div className="flex justify-center gap-2 relative">
  //             <Dropdown
  //               menu={{
  //                 items: [
  //                   {
  //                     key: "1",
  //                     label: (
  //                       <div
  //                         className="text-green-600"
  //                         onClick={() => handleUpdateModalOpen(group._id)}
  //                       >
  //                         Edit
  //                       </div>
  //                     ),
  //                   },
  //                   {
  //                     key: "2",
  //                     label: (
  //                       <div
  //                         className="text-red-600"
  //                         onClick={() => handleDeleteModalOpen(group._id)}
  //                       >
  //                         Delete
  //                       </div>
  //                     ),
  //                   },
  //                 ],
  //               }}
  //               placement="bottomLeft"
  //             >
  //               <IoMdMore className="text-bold" />
  //             </Dropdown>
  //           </div>
  //         ),
  //       }));
  //       setTableGroups(formattedData);
  //     } catch (err) {
  //       setTableGroups([]);
  //       console.error("Failed to fetch Data", err.message);
  //     } finally {
  //       setLoader(false);
  //     }
  //   };

  //   fetchFilteredLead();
  // }, [
  //   selectedFromDate,
  //   selectedToDate,
  //   selectedLeadSourceName,
  //   selectedGroup,
  //   selectedNote,
  // ]);
  useEffect(() => {
    const fetchFilteredLead = async () => {
      setLoader(true);
      try {
        console.info("fromdate", selectedFromDate, selectedToDate);

        const response = await api.get("/lead-report/get-lead-report", {
          params: {
            from_date: selectedFromDate,
            to_date: selectedToDate,
            lead_source_name: selectedLeadSourceName,
            group_id: selectedGroup,
            note: selectedNote,
          },
        });

        const rawData = response.data;

        const uniqueSources = [
          ...new Map(
            rawData
              .map((lead) => {
                const source =
                  lead.lead_type === "customer"
                    ? lead.lead_customer
                    : lead.lead_type === "agent"
                    ? lead.lead_agent
                    : null;
                if (!source || !source._id) return null;

                return {
                  id: source._id,
                  name: source.full_name || source.name || "Unnamed",
                };
              })
              .filter(Boolean)
              .map((item) => [item.id, item])
          ).values(),
        ];

        setLeadSourceOptions(uniqueSources);

        const formattedData = rawData.map((group, index) => ({
          _id: group._id,
          id: index + 1,
          name: group.lead_name,
          phone: group.lead_phone,
          profession: group.lead_profession,
          lead_needs: group?.lead_needs,
          group_id: group?.group_id?.group_name,
          date: group?.createdAt?.split("T")[0],
          lead_type: group.lead_type === "agent" ? "employee" : group.lead_type,
          note: group?.note,
          lead_type_name:
            group.lead_type === "customer"
              ? group?.lead_customer?.full_name
              : group.lead_type === "agent"
              ? group?.lead_agent?.name
              : "",
          action: (
            <div className="flex justify-center gap-2 relative">
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "1",
                      label: (
                        <div
                          className="text-green-600"
                          onClick={() => handleUpdateModalOpen(group._id)}
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
                          onClick={() => handleDeleteModalOpen(group._id)}
                        >
                          Delete
                        </div>
                      ),
                    },
                  ],
                }}
                placement="bottomLeft"
              >
                <IoMdMore className="text-bold" />
              </Dropdown>
            </div>
          ),
        }));

        setTableGroups(formattedData);
      } catch (err) {
        setTableGroups([]);
        console.error("Failed to fetch Data", err.message);
      } finally {
        setLoader(false);
      }
    };

    fetchFilteredLead();
  }, [
    selectedFromDate,
    selectedToDate,
    selectedLeadSourceName,
    selectedGroup,
    selectedNote,
  ]);

  const handleSelectFilter = (value) => {
    //const { value } = e.target;
    setSelectedLabel(value)
    setShowFilterField(false);

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
    } else if (value === "Custom") {
      setShowFilterField(true);
    }
  };
  return (
    <div className="w-screen">
      <div>
        <Navbar
          onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
          visibility={true}
        />
        <div className=" flex mt-30">
          <CustomAlert
            type={alertConfig.type}
            isVisible={alertConfig.visibility}
            message={alertConfig.message}
          />
          <div className="flex-grow p-7">
            <h1 className="font-bold text-2xl">Reports - Lead </h1>
            <div className="mt-6 mb-8">
              <div className="mb-2">
                <div className="flex justify-start items-center w-screen gap-4">
                  <div className="mb-2">
                    <label>Filter Option</label>
                    <Select
                      showSearch
                      popupMatchSelectWidth={false}
                      onChange={handleSelectFilter}
                      placeholder="Search Or Select Filter"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full max-w-xs h-11"
                      value={selectedLabel || undefined}
                    >
                      {groupTime.map((time) => (
                        <Select.Option key={time.value} value={time.value}>
                          {time.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  {showFilterField && (
                    <div className="flex gap-4">
                      <div className="mb-2">
                        <label>From Date</label>
                        <input
                          type="date"
                          value={selectedFromDate}
                          onChange={(e) => setSelectedFromDate(e.target.value)}
                          className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full max-w-xs"
                        />
                      </div>
                      <div className="mb-2">
                        <label>To Date</label>
                        <input
                          type="date"
                          value={selectedToDate}
                          onChange={(e) => setSelectedToDate(e.target.value)}
                          className="border border-gray-300 rounded px-4 py-2 shadow-sm outline-none w-full max-w-xs"
                        />
                      </div>
                    </div>
                  )}
                  <div className="mb-2">
                    <label>Group</label>
                    {/* <select
                      value={selectedGroup}
                      onChange={handleGroupChange}
                      className="border border-gray-300 rounded px-6 py-2 shadow-sm outline-none w-full max-w-md"
                    >
                      <option value="">All</option>
                      {groups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.group_name}
                        </option>
                      ))}
                    </select> */}
                    <Select
                      showSearch
                      popupMatchSelectWidth={false}
                      value={selectedGroup}
                      onChange={handleGroupChange}
                      placeholder="Search Or Select Group"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full max-w-xs h-11"
                    >
                      <Select.Option value="">All</Select.Option>
                      {groups.map((group) => (
                        <Select.Option key={group._id} value={group._id}>
                          {group.group_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="mb-2">
                    <label>Lead Source Name</label>

                    {/* <select
                      value={selectedLeadSourceName}
                      onChange={(e) =>
                        setSelectedLeadSourceName(e.target.value)
                      }
                      className="border border-gray-300 rounded px-6 py-2 shadow-sm outline-none w-full max-w-md"
                    >
                      <option value="">All</option>
                      {leadSourceOptions.map((source) => (
                        <option key={source.id} value={source.id}>
                          {source.name}
                        </option>
                      ))}
                    </select> */}
                    <Select
                      showSearch
                      popupMatchSelectWidth={false}
                      value={selectedLeadSourceName}
                      onChange={(value) => setSelectedLeadSourceName(value)}
                      placeholder="Search Or Select Lead Source Name"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full max-w-xs h-11"
                    >
                      <Select.Option value="">All</Select.Option>
                      {leadSourceOptions.map((source) => (
                        <Select.Option key={source.id} value={source.id}>
                          {source.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  <div className="mb-2">
                    <label>Note</label>
                    {/* <select
                      value={selectedNote}
                      onChange={(e) => setSelectedNote(e.target.value)}
                      className="border border-gray-300 rounded px-6 py-2 shadow-sm outline-none w-full max-w-md"
                    >
                      <option value="">All</option>
                      {leads
                        .filter((lead) => lead?.note)
                        .map((lead) => (
                          <option key={lead?._id} value={lead?.note}>
                            {lead.note}
                          </option>
                        ))}
                    </select> */}
                    <Select
                      showSearch
                      value={selectedNote}
                      popupMatchSelectWidth={false}
                      onChange={(value) => setSelectedNote(value)}
                      placeholder="Search Or Select Note"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full max-w-xs h-11"
                    >
                      <Select.Option value="">All</Select.Option>
                      {leads
                        .filter((lead) => lead?.note)
                        .map((lead) => (
                          <Select.Option key={lead?._id} value={lead?.note}>
                            {lead.note}
                          </Select.Option>
                        ))}
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            {loader ? (
              <div className="flex w-full justify-center items-center">
                <CircularLoader />;
              </div>
            ) : (
              <DataTable
                updateHandler={handleUpdateModalOpen}
                data={filterOption(TableGroups, searchText)}
                columns={columns}
                exportedPdfName="Lead Report"
                exportedFileName={`Leads-${
                  TableGroups.length > 0
                    ? TableGroups[0].date +
                      " to " +
                      TableGroups[TableGroups.length - 1].date
                    : "empty"
                }.csv`}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"></div>
          </div>
        </div>

        <Modal
          isVisible={showModalUpdate}
          onClose={() => {
            setShowModalUpdate(false);
            setErrors({});
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Update Lead
            </h3>

            <form className="space-y-6" onSubmit={handleUpdate} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Lead Name
                </label>
                <input
                  type="text"
                  name="lead_name"
                  value={updateFormData.lead_name}
                  onChange={handleInputChange}
                  id="name"
                  placeholder="Enter the Group Name"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.lead_name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lead_name}
                  </p>
                )}
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Lead Phone Number
                  </label>
                  <input
                    type="text"
                    name="lead_phone"
                    value={updateFormData.lead_phone}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Lead Phone Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.lead_phone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.lead_phone}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Lead Work/Profession
                  </label>
                  {/* <select
                    name="lead_profession"
                    id="category"
                    value={updateFormData.lead_profession}
                    onChange={handleInputChange}
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  >
                    <option value="">Select Work/Profession</option>
                    <option value="employed">Employed</option>
                    <option value="self_employed">Self Employed</option>
                  </select> */}
                  <Select
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    placeholder="Select Lead Work/Profession "
                    popupMatchSelectWidth={false}
                    showSearch
                    name="lead_profession"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={updateFormData?.lead_profession || undefined}
                    onChange={(value) =>
                      handleAntInputDSelect("lead_profession", value)
                    }
                  >
                    {["Employed", "Self Employed"].map((lProf) => (
                      <Select.Option key={lProf} value={lProf.toLowerCase()}>
                        {lProf}
                      </Select.Option>
                    ))}
                  </Select>
                  {errors.lead_profession && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.lead_profession}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="category"
                >
                  Group
                </label>
                {/* <select
                  name="group_id"
                  id="category"
                  value={updateFormData.group_id}
                  onChange={handleInputChange}
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                >
                  <option value="">Select Group</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.group_name}
                    </option>
                  ))}
                </select> */}
                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select Group "
                  popupMatchSelectWidth={false}
                  showSearch
                  name="group_id"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={updateFormData?.group_id || undefined}
                  onChange={(value) => handleAntInputDSelect("group_id", value)}
                >
                  {groups.map((group) => (
                    <Select.Option key={group._id} value={group._id}>
                      {group.group_name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="category"
                >
                  Lead Source Type
                </label>
                {/* <select
                  name="lead_type"
                  id="category"
                  value={updateFormData.lead_type}
                  onChange={handleInputChange}
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                >
                  <option value="">Select Lead Source Type</option>
                  <option value="social">Social Media</option>
                  <option value="customer">Customer</option>
                  <option value="agent">Employee</option>
                  <option value="walkin">Walkin</option>
                </select> */}
                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select or Search Lead Source Type "
                  popupMatchSelectWidth={false}
                  showSearch
                  name="lead_type"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={updateFormData?.lead_type || undefined}
                  onChange={(value) =>
                    handleAntInputDSelect("lead_type", value)
                  }
                >
                  {[
                    "Social Media",
                    "Customer",
                    "Agent",
                    "Employee",
                    "Walkin",
                  ].map((type) => (
                    <Select.Option key={type} value={type.toLowerCase()}>
                      {type}
                    </Select.Option>
                  ))}
                </Select>
                {errors.lead_type && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lead_type}
                  </p>
                )}
              </div>
              {updateFormData.lead_type === "customer" && (
                <>
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Customers
                    </label>
                    {/* <select
                      name="lead_customer"
                      id="category"
                      value={updateFormData.lead_customer}
                      onChange={handleInputChange}
                      required
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    >
                      <option value="">Select Customer</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.full_name}
                        </option>
                      ))}
                    </select> */}
                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                      placeholder="Select Or Search Customers"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="lead_customer"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={updateFormData?.lead_customer || undefined}
                      onChange={(value) =>
                        handleAntInputDSelect("lead_customer", value)
                      }
                    >
                      {users.map((user) => (
                        <Select.Option key={user._id} value={user._id}>
                          {user.full_name}
                        </Select.Option>
                      ))}
                    </Select>
                    {errors.lead_customer && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lead_customer}
                      </p>
                    )}
                  </div>
                </>
              )}{" "}
              <label
                className="block mb-2 text-sm font-medium text-gray-900"
                htmlFor="date"
              >
                Note
              </label>
              <input
                type="text"
                name="note"
                value={updateFormData.note}
                onChange={handleInputChange}
                id="text"
                placeholder="Specify note if any!"
                required
                className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
              />
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="category"
                >
                  Lead Needs and Goals
                </label>
                {/* <select
                  name="lead_needs"
                  id="category"
                  value={updateFormData.lead_needs}
                  onChange={handleInputChange}
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                >
                  <option value="">Select Lead Needs and Goals</option>
                  <option value="savings">Savings</option>
                  <option value="borrowings">Borrowings</option>
                </select> */}
                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select or Search Lead Needs and Goals "
                  popupMatchSelectWidth={false}
                  showSearch
                  name="lead_needs"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={updateFormData?.lead_needs || undefined}
                  onChange={(value) =>
                    handleAntInputDSelect("lead_needs", value)
                  }
                >
                  {["Savings", "Borrowings"].map((type) => (
                    <Select.Option key={type} value={type.toLowerCase()}>
                      {type}
                    </Select.Option>
                  ))}
                </Select>
                {errors.lead_needs && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lead_needs}
                  </p>
                )}
              </div>
              {updateFormData.lead_type === "agent" && (
                <>
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Agents
                    </label>
                    <select
                      name="lead_agent"
                      id="category"
                      value={updateFormData.lead_agent}
                      onChange={handleInputChange}
                      required
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    >
                      <option value="">Select Agent</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    {errors.lead_agent && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lead_agent}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </Modal>
        <Modal
          isVisible={showModalDelete}
          onClose={() => {
            setShowModalDelete(false);
            setCurrentGroup(null);
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Delete Lead
            </h3>
            {currentGroup && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeleteGroup();
                }}
                className="space-y-6"
              >
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="groupName"
                  >
                    Please enter{" "}
                    <span className="text-primary font-bold">
                      {currentGroup.lead_name}
                    </span>{" "}
                    to confirm deletion.
                  </label>
                  <input
                    type="text"
                    id="groupName"
                    placeholder="Enter the Lead Name"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-red-700 hover:bg-red-800
          focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Delete
                </button>
              </form>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default LeadReport;
