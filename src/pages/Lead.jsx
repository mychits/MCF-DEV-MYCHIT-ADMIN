/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import Modal from "../components/modals/Modal";
import axios from "axios";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import Navbar from "../components/layouts/Navbar";
import { IoMdMore } from "react-icons/io";
import { Input, Select, Dropdown, Tooltip } from "antd";
import { fieldSize } from "../data/fieldSize";
import CircularLoader from "../components/loaders/CircularLoader";
import { FaWhatsappSquare } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const Lead = () => {
  const [groups, setGroups] = useState([]);
  const [TableGroups, setTableGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [currentUpdateGroup, setCurrentUpdateGroup] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const whatsappEnable = true;
  const [leadShowModal, setLeadShowModal] = useState(false);
  const [selectedLeadData, setSelectedLeadData] = useState(null);
  const onGlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });
  const handleGroupChange = async (event) => {
    const groupId = event.target.value;
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
  }, [reloadTrigger]);

//     const handleAssignTask = (leadId) => {
//   navigate("/task", { state: { leadId } }); // ✅ pass leadId
// }

const handleAssignTask = (lead) => {
  navigate("/task", {
    state: {
      leadId: lead._id,
      leadName: lead.lead_name,
      leadType: lead.lead_type,
      leadTypeName: lead.lead_type_name
    }
  });
};

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/lead/get-lead");
        setLeads(response.data);
        const formattedData = response.data.map((group, index) => ({
          _id: group._id,
          id: index + 1,
          name: group?.lead_name,
          phone: group?.lead_phone,
          profession: group?.lead_profession,
          lead_needs: group?.lead_needs,
          group_id: group?.group_id?.group_name,
          date: group?.createdAt.split("T")[0],
          lead_type:
            group.lead_type === "agent" ? "employee" : group?.lead_type,
          note: group?.note,
          lead_type_name:
            group.lead_type === "customer"
              ? group?.lead_customer?.full_name
              : group.lead_type === "agent"
                ? group?.lead_agent?.name
                : "",
          action: (
            <div className="flex justify-center gap-2">
              <Dropdown
                trigger={['click']}
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
                       
                        <Tooltip title="Lead to Customer">
                          <div
                            className="text-purple-900 cursor-pointer font-bold"
                            onClick={() =>
                              handleOpenConvertCustomerModal(group._id)
                            }
                          >
                            L ↔ C
                          </div>
                        </Tooltip>
                      ),
                    },
                     {
                      key: "3",
                      label: (
                        <div
                          className="text-blue-600"
                          onClick={() => handleAssignTask(group._id)}
                        >
                          Assign Task
                        </div>
                      ),
                    },
                    {
                      key: "4",
                      label: (
                        <div
                          className="text-rose-500"
                          onClick={() => handleSoftRemove(group._id)}
                        >
                          Remove
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
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeads();
  }, [reloadTrigger]);

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
  }, [reloadTrigger]);

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
  }, [reloadTrigger]);
  //  useEffect(() => {
  //   const fetchAgent = async () => {
  //     try {
  //       const response = await api.get("/agent/get");
  //       setAgents(response?.data?.agent);
  //     } catch (error) {
  //       console.error("Error fetching agent data:", error);
  //     }
  //   };
  //   fetchAgent();
  // }, [reloadTrigger]);
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await api.get("/agent/get-employee");
        setEmployees(response?.data?.employee);
      } catch (error) {
        console.error("Error fetching Employee data:", error);
      }
    };
    fetchEmployee();
  }, [reloadTrigger]);

  const handleAntDSelect = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: "",
    }));
  };

   const handleSoftRemove = async (leadId) => {
    try {
      await api.put(`/lead/soft-delete-lead/${leadId}`);
      setReloadTrigger((prev) => prev + 1);
      setAlertConfig({
        visibility: true,
        message: "Lead removed successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error soft removing lead:", error);
      setAlertConfig({
        visibility: true,
        message: "Failed to remove lead",
        type: "error",
      });
    }
  };

  const handleAntInputDSelect = (field, value) => {
    setUpdateFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };
  const validateForm = (type) => {
    const newErrors = {};
    const data = type === "addLead" ? formData : updateFormData;
    if (!data.lead_name.toString().trim()) {
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
    if (!data.lead_needs.toString()) {
      newErrors.lead_needs = "Lead Needs and Goals is required";
    }

    //   if (!data.note?.toString().trim()) {
    //   newErrors.note = "Note Field is Mandatory";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm("addLead");

    try {
      if (isValid) {
        setShowModal(false);
        const response = await api.post("/lead/add-lead", formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Lead added successfully",
          type: "success",
        });

        setFormData({
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
      }
    } catch (error) {
      setShowModal(false);
      setAlertConfig({
        visibility: true,
        message: "Lead added successfully",
        type: "error",
      });
    }
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
        lead_name: response?.data?.lead_name,
        lead_phone: response?.data?.lead_phone,
        lead_profession: response?.data?.lead_profession,
        group_id: response?.data?.group_id,
        lead_type: response.data.lead_type,
        lead_customer: response?.data?.lead_customer,
        lead_agent: response?.data?.lead_agent,
        lead_needs: response?.data?.lead_needs,
        note: response?.data?.note,
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
        setReloadTrigger((prev) => prev + 1);
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

  const regex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,      // Validates email format
  pincode: /^\d{6}$/,                       // Validates 6 digits for pincode
  adhaar: /^\d{12}$/                        // Validates 12 digits for Aadhar number
};

  const validateConvertToCustomer = (data) => {
    const newErrors = {};

    if (!data.full_name?.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!data.phone_number || !/^[6-9]\d{9}$/.test(data.phone_number)) {
      newErrors.phone_number = "Valid phone number is required";
    }



    if (!data.password) {
      newErrors.password = "Password is required";
    }

    if (!data.pincode || !regex.pincode.test(data.pincode)) {
      newErrors.pincode = "Invalid pincode (6 digits required)";
    }

    if (!data.adhaar_no || !regex.adhaar.test(data.adhaar_no)) {
      newErrors.adhaar_no = "Invalid Aadhar number (12 digits required)";
    }

   if (data.pan_no && data.pan_no.trim().length !== 10) {
  newErrors.pan_no = "Invalid PAN format (e.g., ABCDE1234F)";
}

    if (!data.address || data.address.trim().length < 3) {
      newErrors.address = "Address should be at least 3 characters";
    }

    if (!data.no_of_tickets) {
      newErrors.no_of_tickets = "Number of Tickets is required";
    }

    if (!data.payment_type) {
      newErrors.payment_type = "Payment type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        setReloadTrigger((prev) => prev + 1);
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

   const handleConvertCustomerSubmit = async (e) => {
    e.preventDefault();

    const valid = validateConvertToCustomer(formData);
    console.log(valid);
    if (!valid) return;
    try {
      if (valid) {
        const response = await api.post(
          "/lead/convert-lead-to-customer",
          formData
        );

        setAlertConfig({
          type: "success",
          message: response.data.message || "Lead converted successfully",
          visibility: true,
        });
        setLeadShowModal(false);
        setReloadTrigger((prev) => prev + 1);
        setErrors({});
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message;
      // Handle field-specific errors
      if (errMsg?.toLowerCase().includes("phone number")) {
        setErrors((prev) => ({
          ...prev,
          phone_number: "Phone number already exists.",
        }));
      }
      if (errMsg?.toLowerCase().includes("group is already full")) {
        setErrors((prev) => ({ ...prev, group_id: errMsg }));
      }
      if (errMsg?.toLowerCase().includes("agent already exists")) {
        setErrors((prev) => ({ ...prev, agent: errMsg }));
      }
      setAlertConfig({
        type: "error",
        message: errMsg || "Something went wrong",
        visibility: true,
      });
    }
  };

  const handleOpenConvertCustomerModal = async (leadId) => {
    try {
      const { data } = await api.get(
        `/lead/get-lead-to-customer-by-id/${leadId}`
      );

      setFormData({
        full_name: data?.lead_name || "",
        phone_number: data?.lead_phone || "",
        lead_profession: data?.lead_profession || "", //  Ensure added
        group_id: data?.group_id?._id || "", //  Ensure added
        lead_type: data?.lead_type || "", //  Ensure added
        lead_agent: data?.lead_agent?._id || "",
        email: "",
        password: "",
        lead_customer: data?.lead_customer?._id || "",
        pincode: data?.pincode || "",
        address: data?.lead_address || "",
        adhaar_no: "",
        pan_no: "",
        lead_needs: data?.lead_needs || "",
        note: data?.note || "",
        referred_type: data?.lead_type || "",
        payment_type: data?.payment_type || "",
        no_of_tickets: data?.no_of_tickets || "",
      });

      setLeadShowModal(true);
    } catch (error) {
      console.error("Error opening convert modal:", error);
      setAlertConfig({
        type: "error",
        message: "Failed to load lead details.",
        visibility: true,
      });
    }
  };

  return (
    <>
      <div>
        <div className="flex mt-20">
          <Navbar
            onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
            visibility={true}
          />
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
            <div className="mt-6 mb-8 ">
              <div className="flex justify-between items-center w-full ">
                <h1 className="text-2xl font-semibold ">Leads</h1>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add Lead
                </button>
              </div>
            </div>

            {TableGroups.length > 0 && !isLoading ? (
              <DataTable
                updateHandler={handleUpdateModalOpen}
                data={TableGroups.filter((item) =>
                  Object.values(item).some((value) =>
                    String(value)
                      .toLowerCase()
                      .includes(searchText.toLowerCase())
                  )
                )}
                columns={columns}
                exportedFileName={`Leads-${TableGroups.length > 0
                    ? TableGroups[0].date +
                    " to " +
                    TableGroups[TableGroups.length - 1].date
                    : "empty"
                  }.csv`}
              />
            ) : (
              <CircularLoader />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {/* {filteredGroups.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500 text-lg">No groups added yet</p>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="flex flex-col items-center">
                      <h2 className="text-xl font-bold mb-3 text-gray-700 text-center">
                        {group.group_name}
                      </h2>
                      <p className="">{group.group_type.charAt(0).toUpperCase() + group.group_type.slice(1)} Group</p>
                      <div className="flex gap-16 py-3">
                        <p className="text-gray-500 mb-2 text-center">
                          <span className="font-medium text-gray-700 text-lg">
                            {group.group_members}
                          </span>
                          <br />
                          <span className="font-bold text-sm">Members</span>
                        </p>
                        <p className="text-gray-500 mb-4 text-center">
                          <span className="font-medium text-gray-700 text-lg">
                            ₹{group.group_install}
                          </span>
                          <br />
                          <span className="font-bold text-sm">Installment</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleUpdateModalOpen(group._id)}
                        className="border border-green-400 text-white px-4 py-2 rounded-md shadow hover:border-green-700 transition duration-200"
                      >
                        <CiEdit color="green" />
                      </button>
                      <button
                        onClick={() => handleDeleteModalOpen(group._id)}
                        className="border border-red-400 text-white px-4 py-2 rounded-md shadow hover:border-red-700 transition duration-200"
                      >
                        <MdDelete color="red" />
                      </button>
                    </div>
                  </div>
                ))
              )} */}
            </div>
          </div>
        </div>
        <Modal
          isVisible={showModal}
          onClose={() => {
            setShowModal(false);
            setErrors({});
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Add Lead</h3>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Lead Name <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="lead_name"
                  value={formData.lead_name}
                  onChange={handleChange}
                  id="name"
                  placeholder="Enter the Lead Name"
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
                    Lead Phone Number <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="number"
                    name="lead_phone"
                    value={formData.lead_phone}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Phone Number"
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
                    Lead Work/Profession{" "}
                    <span className="text-red-500 ">*</span>
                  </label>
                 
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
                    value={formData?.lead_profession || undefined}
                    onChange={(value) =>
                      handleAntDSelect("lead_profession", value)
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
                  value={formData.group_id}
                  onChange={handleChange}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
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
                  placeholder="Select or Search Group "
                  popupMatchSelectWidth={false}
                  showSearch
                  name="group_id"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={formData?.group_id || undefined}
                  onChange={(value) => handleAntDSelect("group_id", value)}
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
                  Lead Source Type <span className="text-red-500 ">*</span>
                </label>
                {/* <select
                  name="lead_type"
                  id="category"
                  value={formData.lead_type}
                  onChange={handleChange}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                >
                  <option value="">Select Lead Source Type</option>
                  <option value="social">Social Media</option>
                  <option value="customer">Customer</option>
                  <option value="agent">Employee</option>
                  <option value="walkin">Walkin</option>
                </select> */}
                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select Lead Source Type "
                  popupMatchSelectWidth={false}
                  showSearch
                  name="lead_type"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={formData?.lead_type || undefined}
                  onChange={(value) => handleAntDSelect("lead_type", value)}
                >
                  {[
                    "Social Media",
                    "Customer",
                    "Agent",
                    "Walkin",
                  ].map((lType) => (
                    <Select.Option key={lType} value={lType.toLowerCase()}>
                      {lType}
                    </Select.Option>
                  ))}
                </Select>
                {errors.lead_type && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lead_type}
                  </p>
                )}
              </div>
              {formData.lead_type === "customer" && (
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
                      value={formData.lead_customer}
                      onChange={handleChange}
                      required
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    >
                      <option value="">Select Customer</option>
                      {users.map((user) => (
                        <option key={user?._id} value={user?._id}>
                          {user?.full_name}
                        </option>
                      ))}
                    </select> */}
                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                      placeholder="Select Or Search Customer"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="lead_customer"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={formData?.lead_customer || undefined}
                      onChange={(value) =>
                        handleAntDSelect("lead_customer", value)
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
              )}

              {formData.lead_type === "agent" && (
                <>
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Agent
                    </label>
                    {/* <select
                      name="lead_agent"
                      id="category"
                      value={formData.lead_agent}
                      onChange={handleChange}
                      required
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    >
                      <option value="">Select Agent</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name}
                        </option>
                      ))}
                    </select> */}
                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                      placeholder="Select Or Search Agent"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="lead_agent"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={formData?.lead_agent || undefined}
                      onChange={(value) =>
                        handleAntDSelect("lead_agent", value)
                      }
                    >
                      {agents.map((agent) => (
                        <Select.Option key={agent._id} value={agent._id}>
                          {agent.name}
                        </Select.Option>
                      ))}
                    </Select>
                    {errors.lead_agent && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lead_agent}
                      </p>
                    )}
                  </div>
                </>
              )}
              {/* {formData.lead_type === "employee" && (
                <>
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Employee
                    </label>
                   
                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                      placeholder="Select Or Search Employee"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="lead_agent"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={formData?.lead_agent || undefined}
                      onChange={(value) =>
                        handleAntDSelect("lead_agent", value)
                      }
                    >
                      {employees.map((emp) => (
                        <Select.Option key={emp._id} value={emp._id}>
                          {emp.name}
                        </Select.Option>
                      ))}
                    </Select>
                    {errors.lead_agent && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lead_agent}
                      </p>
                    )}
                  </div>
                </>
              )} */}
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="date"
                >
                  Note
                </label>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  id="text"
                  placeholder="Specify note if any!"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
              </div>

              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="category"
                >
                  Lead Needs and Goals <span className="text-red-500 ">*</span>
                </label>
                {/* <select
                  name="lead_needs"
                  id="category"
                  value={formData.lead_needs}
                  onChange={handleChange}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                >
                  <option value="">Select Lead Needs and Goals</option>
                  <option value="savings">Savings</option>
                  <option value="borrowings">Borrowings</option>
                </select> */}
                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select Lead Needs and Goals "
                  popupMatchSelectWidth={false}
                  showSearch
                  name="lead_needs"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={formData?.lead_needs || undefined}
                  onChange={(value) => handleAntDSelect("lead_needs", value)}
                >
                  {["Savings", "Borrowings"].map((lNeeds) => (
                    <Select.Option key={lNeeds} value={lNeeds.toLowerCase()}>
                      {lNeeds}
                    </Select.Option>
                  ))}
                </Select>
                {errors.lead_needs && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lead_needs}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-center p-4 max-w-full bg-white rounded-lg shadow-sm space-y-4">
                <div className="flex items-center space-x-3">
                  <FaWhatsappSquare color="green" className="w-10 h-10" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    WhatsApp
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={whatsappEnable}
                    className="text-green-500 checked:ring-2  checked:ring-green-700  rounded-full w-4 h-4"
                  />
                  <span className="text-gray-700">Send Via Whatsapp</span>
                </div>
              </div>

              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
                                focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </Modal>
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
                  Lead Name <span className="text-red-500 ">*</span>
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
                    Lead Phone Number <span className="text-red-500 ">*</span>
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
                    Lead Work/Profession{" "}
                    <span className="text-red-500 ">*</span>
                  </label>
                 
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
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
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
                  Lead Source Type <span className="text-red-500 ">*</span>
                </label>
                {/* <select
                  name="lead_type"
                  id="category"
                  value={updateFormData.lead_type}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
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
                  {["Social Media",
                    "Customer",
                    "Agent",
                    "Employee",
                    "Walkin",].map(
                      (type) => (
                        <Select.Option key={type} value={type.toLowerCase()}>
                          {type}
                        </Select.Option>
                      )
                    )}
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
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
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
              {updateFormData.lead_type === "agent" && (
                <>
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Agents
                    </label>
                    {/* <select
                      name="lead_agent"
                      id="category"
                      value={updateFormData.lead_agent}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    >
                      <option value="">Select Agent</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name}
                        </option>
                      ))}
                    </select> */}
                    <Select
                      className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                      placeholder="Select or Search Agent "
                      popupMatchSelectWidth={false}
                      showSearch
                      name="lead_agent"
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={updateFormData?.lead_agent || undefined}
                      onChange={(value) =>
                        handleAntInputDSelect("lead_agent", value)
                      }
                    >
                      {agents.map((agent) => (
                        <Select.Option key={agent._id} value={agent._id}>
                          {agent.name}
                        </Select.Option>
                      ))}
                    </Select>
                    {errors.lead_agent && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lead_agent}
                      </p>
                    )}
                  </div>
                </>
              )}
              {/* {updateFormData.lead_type === "employee" && (
                <>
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Employee
                    </label>
                  
                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                      placeholder="Select Or Search Employee"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="lead_agent"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={updateFormData?.lead_agent || undefined}
                      onChange={(value) =>
                        handleAntInputDSelect("lead_agent", value)
                      }
                    >
                      {employees.map((emp) => (
                        <Select.Option key={emp._id} value={emp._id}>
                          {emp.name}
                        </Select.Option>
                      ))}
                    </Select>
                    {errors.lead_agent && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lead_agent}
                      </p>
                    )}
                  </div>
                </>
              )} */}
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
                  Lead Needs and Goals <span className="text-red-500 ">*</span>
                </label>
                {/* <select
                  name="lead_needs"
                  id="category"
                  value={updateFormData.lead_needs}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
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
                  {["Savings", "Borrowings"].map(
                    (type) => (
                      <Select.Option key={type} value={type.toLowerCase()}>
                        {type}
                      </Select.Option>
                    )
                  )}
                </Select>
                {errors.lead_needs && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lead_needs}
                  </p>
                )}
              </div>

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
          isVisible={leadShowModal}
          onClose={() => setLeadShowModal(false)}
          leadData={selectedLeadData}
          setReloadTrigger={setReloadTrigger}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Convert Lead to Customer
            </h3>
            <form
              className="space-y-6"
              onSubmit={handleConvertCustomerSubmit}
              noValidate
            >
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="name"
                  >
                    Lead Name <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    id="name"
                    placeholder="Enter the Group Name"
                    readOnly
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.full_name}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Lead Email <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Email"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
               
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Lead Phone Number <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Lead Phone Number"
                    readOnly
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.phone_number && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.phone_number}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Lead Work/Profession{" "}
                    <span className="text-red-500 ">*</span>
                  </label>

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
                    value={formData?.lead_profession || undefined}
                    onChange={(value) =>
                      handleAntDSelect("lead_profession", value)
                    }
                  >
                    {["Employed", "Self Employed"].map((lProf) => (
                      <Select.Option key={lProf} value={lProf.toLowerCase()}>
                        {lProf}
                      </Select.Option>
                    ))}
                  </Select>
                  {/* {errors.lead_profession && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.lead_profession}
                    </p>
                  )} */}
                </div>
              </div>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="category"
                >
                  Group
                </label>

                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select Group "
                  popupMatchSelectWidth={false}
                  showSearch
                  name="group_id"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={formData?.group_id || undefined}
                  onChange={(value) => handleAntDSelect("group_id", value)}
                >
                  {groups.map((group) => (
                    <Select.Option key={group._id} value={group._id}>
                      {group.group_name}
                    </Select.Option>
                  ))}
                </Select>
                {errors.group_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.group_id}</p>
                )}
              </div>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="category"
                >
                  Lead Source Type <span className="text-red-500 ">*</span>
                </label>

                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select or Search Lead Source Type "
                  popupMatchSelectWidth={false}
                  showSearch
                  name="lead_type"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={formData?.lead_type || undefined}
                  onChange={(value) => handleAntDSelect("lead_type", value)}
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
              {formData.lead_type === "customer" && (
                <>
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Customers
                    </label>

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
                      value={formData?.lead_customer || undefined}
                      onChange={(value) =>
                        handleAntDSelect("lead_customer", value)
                      }
                    >
                      {users.map((user) => (
                        <Select.Option key={user._id} value={user._id}>
                          {user.full_name}
                        </Select.Option>
                      ))}
                    </Select>
                    {/* {errors.lead_customer && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lead_customer}
                      </p>
                    )} */}
                  </div>
                </>
              )}{" "}
              {formData.lead_type === "agent" && (
                <>
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Agents
                    </label>

                    <Select
                      className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                      placeholder="Select or Search Agent "
                      popupMatchSelectWidth={false}
                      showSearch
                      name="lead_agent"
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={formData?.lead_agent || undefined}
                      onChange={(value) =>
                        handleAntDSelect("lead_agent", value)
                      }
                    >
                      {agents.map((agent) => (
                        <Select.Option key={agent._id} value={agent._id}>
                          {agent.name}
                        </Select.Option>
                      ))}
                    </Select>
                    {errors.lead_agent && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lead_agent}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Password <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Password"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Pincode <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="number"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Pincode"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.pincode && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.pincode}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Address <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  id="name"
                  placeholder="Enter the Address"
                  required
                  className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                />
                {/* {errors.address && (
                  <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                )} */}
              </div>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="payment_type"
                >
                  Select Payment Type <span className="text-red-500 ">*</span>
                </label>
                <Select
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  placeholder="Select Payment Type"
                  popupMatchSelectWidth={false}
                  showSearch
                  name="payment_type"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={formData?.payment_type || undefined}
                  onChange={(value) => handleAntDSelect("payment_type", value)}
                >
                  {["Daily", "Weekly", "Monthly"].map((pType) => (
                    <Select.Option key={pType} value={pType}>
                      {pType}
                    </Select.Option>
                  ))}
                </Select>
                {errors.payment_type && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.payment_type}
                  </p>
                )}
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Adhaar Number <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="number"
                    name="adhaar_no"
                    value={formData.adhaar_no}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Adhaar Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.adhaar_no && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.adhaar_no}
                    </p>
                  )}
                </div>

                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="category"
                  >
                    Pan Number <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    name="pan_no"
                    value={formData?.pan_no}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Pan Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.pan_no && (
                    <p className="mt-2 text-sm text-red-600">{errors.pan_no}</p>
                  )}
                </div>
              </div>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="date"
                >
                  Note
                </label>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  id="text"
                  placeholder="Specify note if any!"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="no_of_tickets"
                  >
                    Number of Tickets <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="text"
                    name="no_of_tickets"
                    value={formData.no_of_tickets}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Number of Tickets"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.no_of_tickets && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.no_of_tickets}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="category"
                  >
                    Lead Needs and Goals{" "}
                    <span className="text-red-500 ">*</span>
                  </label>

                  <Select
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    placeholder="Select or Search Lead Needs and Goals "
                    popupMatchSelectWidth={false}
                    showSearch
                    name="lead_needs"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={formData?.lead_needs || undefined}
                    onChange={(value) => handleAntDSelect("lead_needs", value)}
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
              </div>
              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Convert To Customer
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
                    to confirm deletion.{" "}
                    <span className="text-red-500 ">*</span>
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
    </>
  );
};

export default Lead;
