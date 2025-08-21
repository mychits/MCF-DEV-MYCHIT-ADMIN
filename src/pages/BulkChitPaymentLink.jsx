/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/layouts/Sidebar";
import api from "../instance/TokenInstance";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import { Select, Dropdown, notification, Alert } from "antd";
import { IoMdMore } from "react-icons/io";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";
import dayjs from "dayjs";

const Enroll = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [TableEnrolls, setTableEnrolls] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDataTableLoading, setIsDataTableLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [paymentLinkForm, setPaymentLinkForm] = useState({
    amount: "",
    expiry: dayjs().add(1, "day").format("YYYY-MM-DD"),
    send_sms: true,
    send_email: true,
  });
  const [paymentLinkErrors, setPaymentLinkErrors] = useState({});
  const [alert, setAlert] = useState({
    visible: false,
    message: "",
    type: "info",
  });
  const [admin, setAdmin] = useState("");
  const date = new Date().toISOString().split("T")[0];
  const [allEnrollUrl, setAllEnrollUrl] = useState(true);
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const selectAllCheckboxRef = useRef(null);

  const onGlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    const userObj = JSON.parse(user);
    const adminId = userObj._id;
    if (adminId) {
      setAdmin(userObj._id);
    } else {
      setAdmin("");
    }
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/group/get-group-admin");
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching group ", error);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    async function fetchAllEnrollmentData() {
      setAllEnrollUrl(true);
      let url = `/enroll-report/get-enroll-report?from_date=${date}&to_date=${date}`;
      try {
        setTableEnrolls([]);
        setIsDataTableLoading(true);
        const response = await api.get(url);
        if (response.data && response.data.length > 0) {
          setFilteredUsers(response.data);
          const formattedData = response.data.map((group, index) => {
            if (!group?.group_id || !group?.user_id) return {};
            return {
              select: (
                <input
                  type="checkbox"
                  checked={selectedEnrollments.includes(group._id)}
                  onChange={(e) => handleEnrollmentSelect(group._id, e)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
              ),
              _id: group?._id,
              id: index + 1,
              name: group?.user_id?.full_name,
              phone_number: group?.user_id?.phone_number,
              group_name: group?.group_id?.group_name,
              payment_type: group?.payment_type,
              enrollment_date: group?.createdAt
                ? group?.createdAt?.split("T")[0]
                : "",
              chit_asking_month: group?.chit_asking_month,
              referred_type: group?.referred_type,
              referred_by:
                group?.agent?.name && group?.agent?.phone_number
                  ? `${group.agent.name} | ${group.agent.phone_number}`
                  : group?.referred_customer?.full_name &&
                    group?.referred_customer?.phone_number
                  ? `${group.referred_customer.full_name} | ${group?.referred_customer?.phone_number}`
                  : group?.referred_lead?.lead_name &&
                    group?.referred_lead?.agent_number
                  ? `${group.referred_lead.lead_name} | ${group.referred_lead.agent_number}`
                  : "N/A",
              ticket: group.tickets,
              action: (
                <div className="flex justify-center items-center gap-2">
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "1",
                          label: (
                            <div
                              className="text-green-600"
                              onClick={() => handleViewDetails(group._id)}
                            >
                              View Details
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
            };
          });
          setTableEnrolls(formattedData);
        } else {
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        setFilteredUsers([]);
        setTableEnrolls([]);
        setAlert({
          visible: true,
          message: "Failed to load enrollment data",
          type: "error",
        });
      } finally {
        setIsDataTableLoading(false);
      }
    }
    fetchAllEnrollmentData();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user/get-user");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching user ", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get("/agent/get-agent");
        setAgents(response.data);
      } catch (err) {
        console.error("Failed to fetch Agents", err);
      }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await api.get("/lead/get-lead");
        setLeads(response.data);
      } catch (err) {
        console.error("Failed to fetch Leads", err);
      }
    };
    fetchLeads();
  }, []);

  // Sync selectAll when TableEnrolls or selectedEnrollments change
  useEffect(() => {
    if (TableEnrolls.length === 0) {
      setSelectAll(false);
      return;
    }
    const allVisibleSelected = TableEnrolls.every((enroll) =>
      selectedEnrollments.includes(enroll._id)
    );
    setSelectAll(allVisibleSelected);
  }, [TableEnrolls, selectedEnrollments]);

  // Apply indeterminate state to the "Select All" checkbox
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const totalVisible = TableEnrolls.length;
      const selectedCount = selectedEnrollments.filter((id) =>
        TableEnrolls.some((enroll) => enroll._id === id)
      ).length;

      selectAllCheckboxRef.current.indeterminate =
        selectedCount > 0 && selectedCount < totalVisible;
    }
  }, [selectedEnrollments, TableEnrolls]);

  const handleGroupChange = async (groupId) => {
    setSelectedGroup(groupId);
    if (groupId) {
      let url;
      if (groupId === "today") {
        url = `/enroll-report/get-enroll-report?from_date=${date}&to_date=${date}`;
        setAllEnrollUrl(true);
      } else {
        url = `/enroll/get-group-enroll/${groupId}`;
        setAllEnrollUrl(false);
      }
      try {
        setTableEnrolls([]);
        setIsDataTableLoading(true);
        const response = await api.get(url);
        if (response.data && response.data.length > 0) {
          setFilteredUsers(response.data);
          const formattedData = response.data.map((group, index) => {
            if (!group?.group_id || !group?.user_id) return {};
            return {
              select: (
                <input
                  type="checkbox"
                  checked={selectedEnrollments.includes(group._id)}
                  onChange={(e) => handleEnrollmentSelect(group._id, e)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
              ),
              _id: group?._id,
              id: index + 1,
              name: group?.user_id?.full_name,
              phone_number: group?.user_id?.phone_number,
              group_name: group?.group_id?.group_name,
              payment_type: group?.payment_type,
              enrollment_date: group?.createdAt?.split("T")[0],
              chit_asking_month: group?.chit_asking_month,
              referred_type: group?.referred_type,
              referred_by:
                group?.agent?.name && group?.agent?.phone_number
                  ? `${group.agent.name} | ${group.agent.phone_number}`
                  : group?.referred_customer?.full_name &&
                    group?.referred_customer?.phone_number
                  ? `${group.referred_customer.full_name} | ${group?.referred_customer?.phone_number}`
                  : group?.referred_lead?.lead_name &&
                    group?.referred_lead?.agent_number
                  ? `${group.referred_lead.lead_name} | ${group.referred_lead.agent_number}`
                  : "N/A",
              ticket: group.tickets,
              action: (
                <div className="flex justify-center items-center gap-2">
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "1",
                          label: (
                            <div
                              className="text-green-600"
                              onClick={() => handleViewDetails(group._id)}
                            >
                              View Details
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
            };
          });
          setTableEnrolls(formattedData);
        } else {
          setFilteredUsers([]);
          setTableEnrolls([]);
        }
      } catch (error) {
        console.error("Error fetching enrollment ", error);
        setFilteredUsers([]);
        setTableEnrolls([]);
      } finally {
        setIsDataTableLoading(false);
      }
    } else {
      setFilteredUsers([]);
      setTableEnrolls([]);
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      const allIds = TableEnrolls.map((enroll) => enroll._id);
      setSelectedEnrollments(allIds);
    } else {
      setSelectedEnrollments([]);
    }
    setSelectAll(isChecked);
  };

  const handleEnrollmentSelect = (enrollmentId, e) => {
    const isChecked = e.target.checked;

    setSelectedEnrollments((prev) => {
      let newSelected;
      if (isChecked) {
        newSelected = [...prev, enrollmentId];
      } else {
        newSelected = prev.filter((id) => id !== enrollmentId);
      }

      // Update selectAll based on current visible rows
      const visibleIds = TableEnrolls.map((enroll) => enroll._id);
      const allSelected =
        visibleIds.length > 0 && visibleIds.every((id) => newSelected.includes(id));
      setSelectAll(allSelected);

      return newSelected;
    });
  };

  const handleViewDetails = async (enrollmentId) => {
    try {
      const response = await api.get(`/enroll/get-enroll-by-id/${enrollmentId}`);
      const enrollment = response.data;

      notification.info({
        message: 'Enrollment Details',
        description: (
          <div>
            <p><strong>Customer:</strong> {enrollment.user_id?.full_name}</p>
            <p><strong>Phone:</strong> {enrollment.user_id?.phone_number}</p>
            <p><strong>Group:</strong> {enrollment.group_id?.group_name}</p>
            <p><strong>Ticket:</strong> {enrollment.tickets}</p>
            <p><strong>Payment Type:</strong> {enrollment.payment_type}</p>
            <p><strong>Enrollment Date:</strong> {new Date(enrollment.createdAt).toLocaleDateString()}</p>
          </div>
        ),
        duration: 5
      });
    } catch (error) {
      console.error("Error fetching enrollment details:", error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch enrollment details'
      });
    }
  };

  const handleOpenPaymentLinkModal = () => {
    if (selectedEnrollments.length === 0) {
      notification.warning({
        message: 'No Selection',
        description: 'Please select at least one enrollment to create payment links'
      });
      return;
    }
    setShowPaymentLinkModal(true);
  };

  const handlePaymentLinkChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentLinkForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setPaymentLinkErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  const validatePaymentLinkForm = () => {
    const errors = {};
    const amount = parseFloat(paymentLinkForm.amount);

    if (!paymentLinkForm.amount || isNaN(amount) || amount <= 0) {
      errors.amount = "Please enter a valid positive amount";
    }

    setPaymentLinkErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentLinkSubmit = async (e) => {
    e.preventDefault();

    if (!validatePaymentLinkForm()) {
      return;
    }

    try {
      setLoading(true);

      const selectedDetails = TableEnrolls.filter((enroll) =>
        selectedEnrollments.includes(enroll._id)
      );

      const payloads = selectedDetails.map((enrollment) => ({
        user_id: enrollment.user_id,
        group_id: enrollment.group_id?._id,
        ticket: enrollment.ticket,
        amount: parseFloat(paymentLinkForm.amount),
        expiry: paymentLinkForm.expiry,
        send_sms: paymentLinkForm.send_sms,
        send_email: paymentLinkForm.send_email,
        payment_group_tickets: [
          `chit-${enrollment.group_id?._id}|${enrollment.ticket}`
        ]
      }));

      const results = [];
      for (const payload of payloads) {
        try {
          const response = await api.post("/paymentapi/payment-link", payload);
          results.push({ success: true, enrollment: payload, response });
        } catch (error) {
          results.push({ success: false, enrollment: payload, error });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      if (successCount > 0) {
        setAlert({
          visible: true,
          message: `Successfully created ${successCount} payment link${successCount > 1 ? 's' : ''}`,
          type: "success"
        });

        setSelectAll(false);
        setSelectedEnrollments([]);
        setShowPaymentLinkModal(false);
        setPaymentLinkForm({
          amount: "",
          expiry: dayjs().add(1, "day").format("YYYY-MM-DD"),
          send_sms: true,
          send_email: true
        });
      }

      if (failureCount > 0) {
        notification.error({
          message: 'Payment Link Creation',
          description: `Failed to create ${failureCount} payment link${failureCount > 1 ? 's' : ''}`
        });
      }
    } catch (error) {
      console.error("Error creating payment links:", error);
      setAlert({
        visible: true,
        message: "Error creating payment links",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Columns configuration
  const columns = [
    {
      key: "select",
      header: (
        <input
          ref={selectAllCheckboxRef}
          type="checkbox"
          checked={selectAll && TableEnrolls.length > 0}
          onChange={handleSelectAll}
          className="form-checkbox h-4 w-4 text-blue-600"
        />
      ),
    },
    { key: "id", header: "SL. NO" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
  ];

  if (allEnrollUrl) {
    columns.push({ key: "group_name", header: "Enrolled Group" });
  }

  columns.push(
    { key: "ticket", header: "Ticket Number" },
    { key: "referred_type", header: "Referred Type" },
    { key: "payment_type", header: "Payment Type" },
    { key: "enrollment_date", header: "Enrollment Date" },
    { key: "chit_asking_month", header: "Chit Asking Month" },
    { key: "referred_by", header: "Referred By" },
    { key: "action", header: "Action" }
  );

  const selectednewGroup = groups.find((g) => g._id === selectedGroup);

  return (
    <>
      <div>
        <div className="flex mt-20">
          <Navbar onGlobalSearchChangeHandler={onGlobalSearchChangeHandler} visibility={true} />
          <Sidebar />

          {alert.visible && (
            <div className="fixed top-4 right-4 z-50 w-96">
              <Alert
                message={alert.message}
                type={alert.type}
                showIcon
                closable
                onClose={() => setAlert({ ...alert, visible: false })}
              />
            </div>
          )}

          <div className="flex-grow p-7">
            <h1 className="text-2xl font-semibold">Enrollments</h1>
            <div className="mt-6 mb-8">
              <div className="mb-2">
                <label>Search or Select Group</label>
              </div>
              <div className="flex justify-between items-center w-full mb-4">
                <Select
                  showSearch
                  popupMatchSelectWidth={false}
                  value={selectedGroup || "today"}
                  filterOption={(input, option) =>
                    option.children
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  placeholder="Search or Select Group"
                  onChange={handleGroupChange}
                  className="border h-14 w-full max-w-md"
                >
                  <Select.Option key="today" value="today">
                    Today's Enrollment
                  </Select.Option>
                  {groups.map((group) => (
                    <Select.Option key={group._id} value={group._id}>
                      {group.group_name}
                    </Select.Option>
                  ))}
                </Select>
                <div className="flex gap-4">
                  {selectedEnrollments.length > 0 && (
                    <button
                      onClick={handleOpenPaymentLinkModal}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add Payment Link ({selectedEnrollments.length})
                    </button>
                  )}
                </div>
              </div>

              {TableEnrolls?.length > 0 ? (
                <DataTable
                  data={filterOption(TableEnrolls, searchText)}
                  columns={columns}
                  exportedFileName={`Enrollments-${
                    TableEnrolls.length > 0
                      ? TableEnrolls[0].name +
                        " to " +
                        TableEnrolls[TableEnrolls.length - 1].name
                      : "empty"
                  }.csv`}
                />
              ) : (
                <CircularLoader
                  isLoading={isDataTableLoading}
                  failure={TableEnrolls?.length <= 0 && selectedGroup}
                  data={"Enrollment Data"}
                />
              )}
            </div>
          </div>
        </div>

        <Modal
          isVisible={showPaymentLinkModal}
          onClose={() => {
            setShowPaymentLinkModal(false);
            setPaymentLinkErrors({});
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-6 text-xl font-bold text-gray-900 border-b pb-2">
              Create Payment Links
            </h3>

            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-700">
                Creating payment links for {selectedEnrollments.length} selected enrollment{selectedEnrollments.length > 1 ? 's' : ''}
              </p>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {TableEnrolls.filter(enroll => selectedEnrollments.includes(enroll._id)).map((enrollment, index) => (
                  <div key={index} className="text-sm py-1 border-b border-blue-100 last:border-0">
                    {enrollment.name} | {enrollment.phone_number} | {enrollment.group_name} | Ticket {enrollment.ticket}
                  </div>
                ))}
              </div>
            </div>

            <form className="space-y-5" onSubmit={handlePaymentLinkSubmit}>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={paymentLinkForm.amount}
                  onChange={handlePaymentLinkChange}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0.01"
                  step="0.01"
                />
                {paymentLinkErrors.amount && (
                  <p className="mt-1 text-sm text-red-500">{paymentLinkErrors.amount}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiry"
                  value={paymentLinkForm.expiry}
                  min={dayjs().format("YYYY-MM-DD")}
                  onChange={handlePaymentLinkChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    id="send_sms"
                    type="checkbox"
                    name="send_sms"
                    checked={paymentLinkForm.send_sms}
                    onChange={handlePaymentLinkChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="send_sms" className="ml-2 text-sm text-gray-700">
                    Send SMS
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="send_email"
                    type="checkbox"
                    name="send_email"
                    checked={paymentLinkForm.send_email}
                    onChange={handlePaymentLinkChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="send_email" className="ml-2 text-sm text-gray-700">
                    Send Email
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-950 text-white hover:bg-blue-800"
                  }`}
                >
                  {loading ? "Creating..." : "Create Payment Links"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Enroll;