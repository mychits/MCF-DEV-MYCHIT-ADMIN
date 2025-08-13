/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import { IoMdMore } from "react-icons/io";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { Dropdown, Select } from "antd";

const EnrollmentReport = () => {
  const [groups, setGroups] = useState([]);
  const [TableGroups, setTableGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [showFilterField, setShowFilterField] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Today")
  const [searchText, setSearchText] = useState("");
  const onGlobalSearchChangeHandler = (e) => {
    setSearchText(e.target.value);
  };
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });
  // const handleGroupChange = async (event) => {
  //   const groupId = event.target.value;
  //   setSelectedGroup(groupId);
  // };
  const handleGroupChange = (value) => {
    setSelectedGroup(value);
  };
  const now = new Date()
  const todayString = now.toISOString().split("T")[0]
  const [selectedFromDate, setSelectedFromDate] = useState(todayString);
  const [selectedToDate, setSelectedToDate] = useState(todayString);
  const [selectedLeadSourceName, setSelectedLeadSourceName] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState("");
  const [selectedNote, setSelectedNote] = useState("");

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

  useEffect(() => {
    const fetchEnrollmentData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(
          `/enroll-report/get-enroll-report?from_date=${selectedFromDate}&to_date=${selectedToDate}&group_id=${selectedGroup}`
        );
        if (response.data) {
          setLeads(response.data);
          const formattedData = response.data.map((group, index) => {
            if(!group.group_id || !group.user_id) return {};
            return ({
            _id: group?._id,
            id: index + 1,
            name: group?.user_id?.full_name,
            phone_number: group?.user_id?.phone_number,
            group_name: group?.group_id?.group_name,
            group_value: group?.group_id?.group_value,
            payment_type: group?.payment_type,
            enrollment_date: group?.createdAt
              ? group?.createdAt?.split("T")[0]
              : "",
            chit_asking_month: group?.chit_asking_month,
            ticket: group.tickets,
            referred_type: group?.referred_type,
            // referred_agent: group?.agent?.name,
            // referred_customer: group?.referred_customer?.full_name,
            // referred_lead: group?.referred_lead?.lead_name,
            referred_by: group?.agent?.name && group?.agent?.phone_number
              ? `${group.agent.name} | ${group.agent.phone_number}`
              : group?.referred_customer?.full_name && group?.referred_customer?.phone_number
                ? `${group.referred_customer.full_name} | ${group?.referred_customer?.phone_number}`
                : group?.referred_lead?.lead_name && group?.referred_lead?.agent_number
                  ? `${group.referred_lead.lead_name} | ${group.referred_lead.agent_number}`
                  : "N/A",
            action: (
              <div className="flex justify-center items-center gap-2">
                <Dropdown
                  key={group?._id}
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
          })});
          setTableGroups(formattedData);
        }
      } catch (error) {
        console.error("Error fetching Enrollment data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnrollmentData();
  }, [selectedFromDate, selectedToDate, selectedGroup]);


  const groupOptions = [
    { value: "Today", label: "Today" },
    { value: "Yesterday", label: "Yesterday" },
    { value: "ThisMonth", label: "This Month" },
    { value: "LastMonth", label: "Last Month" },
    { value: "ThisYear", label: "This Year" },
    { value: "Custom", label: "Custom" },
    { value: "All", label: "All" }
  ];

  const handleSelectFilter = (value) => {
    // const { value } = e.target;
    setSelectedLabel(value)
    setShowFilterField(false);

    const today = new Date();
    const formatDate = (date) => date.toLocaleDateString('en-CA');

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
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      setSelectedFromDate(formatDate(start));
      setSelectedToDate(formatDate(end));
    } else if (value === "Custom") {
      setShowFilterField(true)
    }

  };
  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Phone Number" },
    { key: "group_name", header: "Group Name" },
    { key: "ticket", header: "Ticket" },
    { key: "group_value", header: "Group Value" },
    { key: "payment_type", header: "payment Type" },
    { key: "enrollment_date", header: "Enrollment Date" },
    { key: "chit_asking_month", header: "Chit Asking Month" },
    { key: "referred_type", header: "Referred Type" },
    // { key: "referred_agent", header: "Referred Agent" },
    // { key: "referred_customer", header: "Referred Customer" },
    //{ key: "referred_lead", header: "Referred Lead" },
    { key: "referred_by", header: "Referred By" },

  ];

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
            <h1 className="font-bold text-2xl"> Reports - Enrollment </h1>
            <div className="mt-6 mb-8">
              <div className="mb-2">
                <div className="flex justify-start items-center w-screen gap-4">
                  <div className="mb-2">
                    <label>Filter Option</label>
                    {/* <select
                      onChange={handleSelectFilter}
                      
                      className="border border-gray-300 rounded px-6 shadow-sm outline-none w-full max-w-md"
                    >
                      <option value="Today">Today</option>
                      <option value="Yesterday">Yesterday</option>
                      <option value="ThisMonth">This Month</option>
                      <option value="LastMonth">Last Month</option>
                      <option value="ThisYear">This Year</option>
                      <option value="Custom">Custom</option>
                    </select> */}
                    <Select
                      showSearch
                      popupMatchSelectWidth={false}
                      onChange={handleSelectFilter}
                      value={selectedLabel || undefined}
                      placeholder="Search Or Select Filter"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full max-w-xs h-11"
                    >
                      {groupOptions.map((time) => (
                        <Select.Option key={time.value} value={time.value}>
                          {time.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {showFilterField && (
                    <div className="flex gap-4">
                      <div className="mb-2 ">
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
                      placeholder="Search Or Select Group"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full max-w-xs h-11"
                      value={selectedGroup}
                      onChange={handleGroupChange}
                    >
                      <Select.Option value="">All</Select.Option>
                      {groups.map((group) => (
                        <Select.Option key={group._id} value={group._id}>
                          {group.group_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  {/* <div className="mb-2">
                    <label>Payment Type</label>
                    <select
                      value={selectedLeadSourceName}
                      onChange={(e) =>
                        setSelectedLeadSourceName(e.target.value)
                      }
                      className="border border-gray-300 rounded px-6 py-2 shadow-sm outline-none w-full max-w-md"
                    >
                      <option value="">All</option>
                      {leads
                        .filter(
                          (lead) => lead?.lead_agent || lead?.lead_customer
                        )
                        .map((lead) => {
                          return (
                            <option
                              key={lead?._id}
                              value={
                                lead?.lead_agent?._id ||
                                lead?.lead_customer?._id
                              }
                            >
                              {lead?.lead_agent?.name ||
                                lead?.lead_customer?.full_name}
                            </option>
                          );
                        })}
                    </select>
                  </div> */}
                  {/* <div className="mb-2">
                    <label>Note</label>
                    <select
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
                    </select>
                  </div> */}
                </div>
              </div>
            </div>
            {TableGroups && TableGroups.length > 0 && !isLoading ? (
              <DataTable
                data={filterOption(TableGroups, searchText)}
                columns={columns}
                exportedPdfName={`Enrollment Report`}
                exportedFileName={`Leads-${TableGroups.length > 0
                  ? TableGroups[0].date +
                  " to " +
                  TableGroups[TableGroups.length - 1].date
                  : "empty"
                  }.csv`}
              />
            ) : (
              <div className="flex w-full justify-center items-center">
                <CircularLoader
                  isLoading={isLoading}
                  failure={TableGroups.length <= 0}
                  data="Enrollment Data" />;
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentReport;
