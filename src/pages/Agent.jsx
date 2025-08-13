/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { IoMdMore } from "react-icons/io";
import { Input, Select, Dropdown } from "antd";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";
import { fieldSize } from "../data/fieldSize"
const Agent = () => {
  const [users, setUsers] = useState([]);
  const [TableAgents, setTableAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUpdateUser, setCurrentUpdateUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [searchText, setSearchText] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [selectedReportingManagerId, setSelectedReportingManagerId] = useState("");
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const onGlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };
  const [selectedManagerTitle, setSelectedManagerTitle] = useState("");

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    address: "",
    pincode: "",
    adhaar_no: "",
    designation_id: "",
    pan_no: "",
    agent_type: "agent"
  });

  const [updateFormData, setUpdateFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    address: "",
    pincode: "",
    adhaar_no: "",
    designation_id: "",
    pan_no: "",
  });


  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/agent/get");
        setUsers(response?.data?.agent);
        const formattedData = response.data?.agent?.map((group, index) => ({
          _id: group?._id,
          id: index + 1,
          name: group?.name,
          employeeCode: group?.employeeCode || "N/A",
          phone_number: group?.phone_number,
          password: group?.password,
          designation: group?.designation_id?.title,
          action: (
            <div className="flex justify-center  gap-2">
              {/* <button
                onClick={() => handleUpdateModalOpen(group._id)}
                className="border border-green-400 text-white px-4 py-2 rounded-md shadow hover:border-green-700 transition duration-200"
              >
                <CiEdit color="green" />
              </button> */}
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
        setTableAgents(formattedData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, [reloadTrigger]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await api.get("/designation/get-designation");
        setManagers(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchManagers();
  }, [reloadTrigger]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevData) => ({
      ...prevData,
      [name]: "",
    }));
  };

  const validateForm = (type) => {
    const newErrors = {};
    const data = type === "addEmployee" ? formData : updateFormData;
    const regex = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[6-9]\d{9}$/,
      password:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/,
      pincode: /^\d{6}$/,
      aadhaar: /^\d{12}$/,
      pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    };

    if (!data.name.trim()) {
      newErrors.name = "Full Name is required";
    }

    if (!data.email) {
      newErrors.email = "Email is required";
    } else if (!regex.email.test(data.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!data.phone_number) {
      newErrors.phone_number = "Phone number is required";
    } else if (!regex.phone.test(data.phone_number)) {
      newErrors.phone_number = "Invalid  phone number";
    }

    if (!data.password) {
      newErrors.password = "Password is required";
    } else if (!regex.password.test(data.password)) {
      newErrors.password =
        "Password must contain at least 5 characters, one uppercase, one lowercase, one number, and one special character";
    }

    if (!data.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!regex.pincode.test(data.pincode)) {
      newErrors.pincode = "Invalid pincode (6 digits required)";
    }

    if (!data.adhaar_no) {
      newErrors.adhaar_no = "Aadhaar number is required";
    } else if (!regex.aadhaar.test(data.adhaar_no)) {
      newErrors.adhaar_no = "Invalid Aadhaar number (12 digits required)";
    }
    if (!selectedManagerId) {
      newErrors.reporting_manager = "Reporting Manager is required";
    }
    if (!data.pan_no) {
      newErrors.pan_no = "PAN number is required";
    } else if (!regex.pan.test(data.pan_no.toUpperCase())) {
      newErrors.pan_no = "Invalid PAN format (e.g., ABCDE1234F)";
    }

    if (!data.address.trim()) {
      newErrors.address = "Address is required";
    } else if (data.address.trim().length < 10) {
      newErrors.address = "Address should be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAntDSelectManager = (managerId) => {
    setSelectedManagerId(managerId);

    const selected = managers.find((mgr) => mgr._id === managerId);
    const title = selected?.title || "";

    setSelectedManagerTitle(title);


    setFormData((prev) => ({
      ...prev,
      managerId,
      managerTitle: title,
    }));

    setErrors((prev) => ({
      ...prev,
      managerId: "",
      managerTitle: "",
    }));
  };
  const handleAntInputDSelectManager = (managerId) => {
    setSelectedManagerId(managerId);

    const selected = managers.find((mgr) => mgr._id === managerId);
    const title = selected?.title || "";

    setSelectedManagerTitle(title);


    setUpdateFormData((prev) => ({
      ...prev,
      managerId,
      managerTitle: title,
    }));

    setErrors((prev) => ({
      ...prev,
      managerId: "",
      managerTitle: "",
    }));
  };


  const handleAntDSelectReportingManager = (reportingId) => {
    setSelectedReportingManagerId(reportingId);


    setUpdateFormData((prev) => ({
      ...prev,
      reportingManagerId: reportingId,
    }));


    setErrors((prev) => ({
      ...prev,
      reportingManagerId: "",
    }));
  };

  const handleReportingManager = (value) => {
    setSelectedReportingManagerId(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValidate = validateForm("addEmployee");

    try {
      if (isValidate) {
        const dataToSend = {
          ...formData,
          designation_id: selectedManagerId,
          reporting_manager_id: selectedReportingManagerId
        };

        const response = await api.post("/agent/add", dataToSend, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setShowModal(false);
        setFormData({
          name: "",
          email: "",
          phone_number: "",
          password: "",
          address: "",
          pincode: "",
          adhaar_no: "",
          pan_no: "",
        });
        setSelectedManagerId("");
        setSelectedReportingManagerId("")
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Agent Added Successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error adding agent:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        const errMsg = error.response.data.message.toLowerCase();

        if (errMsg.includes("phone number")) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            phone_number: "Phone number already exists",
          }));
        } else {
          setAlertConfig({
            visibility: true,
            message: error.response.data.message,
            type: "error",
          });
        }
      } else {
        setAlertConfig({
          visibility: true,
          message: "An unexpected error occurred. Please try again.",
          type: "error",
        });
      }
    }
  };



  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "name", header: "Agent Name" },
    { key: "employeeCode", header: "Employee ID" },
    { key: "phone_number", header: "Agent Phone Number" },
    { key: "designation", header: "Designation" },
    { key: "password", header: "Agent Password" },
    { key: "action", header: "Action" },
  ];

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteModalOpen = async (userId) => {
    try {
      const response = await api.get(`/agent/get-by-id/${userId}`);
      setCurrentUser(response.data?.agent);
      setShowModalDelete(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleUpdateModalOpen = async (userId) => {
    try {
      const response = await api.get(`/agent/get-by-id/${userId}`);
      setCurrentUpdateUser(response.data?.agent);
      setUpdateFormData({
        name: response?.data?.agent?.name,
        email: response?.data?.agent?.email,
        phone_number: response?.data?.agent?.phone_number,
        password: response?.data?.agent?.password,
        pincode: response?.data?.agent?.pincode,
        adhaar_no: response?.data?.agent?.adhaar_no,
        pan_no: response?.data?.agent?.pan_no,
        address: response?.data?.agent?.address,
      });
      setSelectedManagerId(response.data?.agent?.designation_id?._id || "");
      setSelectedReportingManagerId(response.data?.agent?.reporting_manager_id || "");
      setSelectedManagerTitle(response.data?.agent?.designation_id?.title)
      setShowModalUpdate(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDeleteUser = async () => {
    if (currentUser) {
      try {
        await api.delete(`/agent/delete/${currentUser._id}`);
        setShowModalDelete(false);
        setCurrentUser(null);
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Agent deleted successfully",
          type: "success",
        });
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    try {
      if (isValid) {
        const dataToSend = {
          ...updateFormData,
          designation_id: selectedManagerId,
          reporting_manager_id: selectedReportingManagerId
        };
        const response = await api.put(
          `/agent/update/${currentUpdateUser._id}`,
          dataToSend
        );
        setShowModalUpdate(false);
        setSelectedManagerId("");
        setSelectedReportingManagerId("")
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Agent Updated Successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error updating agent:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setAlertConfig({
          visibility: true,
          message: `${error.response.data.message}`,
          type: "error",
        });
      } else {
        setAlertConfig({
          visibility: true,
          message: "An unexpected error occurred. Please try again.",
          type: "error",
        });
      }
    }
  };



  const handleManager = async (event) => {
    const groupId = event.target.value;
    setSelectedManagerId(groupId);
    const selected = managers.find((mgr) => mgr._id === groupId);
    setSelectedManagerTitle(selected?.title || "");
  };

  // const handleReportingManager = async (event) => {
  //   const reportingId = event.target.value;
  //   setSelectedReportingManagerId(reportingId);
  // };

  return (
    <>
      <div>
        <div className="flex mt-20">
          <Navbar
            onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
            visibility={true}
          />
          <Sidebar />
          <CustomAlertDialog
            type={alertConfig.type}
            isVisible={alertConfig.visibility}
            message={alertConfig.message}
            onClose={() =>
              setAlertConfig((prev) => ({ ...prev, visibility: false }))
            }
          />

          <div className="flex-grow p-7">
            <div className="mt-6 mb-8">
              <div className="flex justify-between items-center w-full">
                <h1 className="text-2xl font-semibold">Agents</h1>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add Agent
                </button>
              </div>
            </div>
            {(TableAgents?.length > 0 && !isLoading) ? (
              <DataTable
                updateHandler={handleUpdateModalOpen}
                data={filterOption(TableAgents, searchText)}
                columns={columns}
                exportedPdfName={`Agents`}
                exportedFileName={`Employees-${TableAgents.length > 0
                  ? TableAgents[0].name +
                  " to " +
                  TableAgents[TableAgents.length - 1].name
                  : "empty"
                  }.csv`}
              />
            ) : (
              <CircularLoader isLoading={isLoading} failure={TableAgents?.length <= 0} data="Employee Data" />
            )}
          </div>
        </div>

        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Add Agent
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  id="name"
                  placeholder="Enter the Full Name"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Email  <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Email"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Phone Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.phone_number && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.phone_number}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Password <span className="text-red-500">*</span>
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
                    Pincode <span className="text-red-500">*</span>
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
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Adhaar Number <span className="text-red-500">*</span>
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
                    htmlFor="date"
                  >
                    Pan Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="pan_no"
                    value={formData.pan_no}
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
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  id="name"
                  placeholder="Enter the Address"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.address && (
                  <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="category"
                >
                  Designation <span className="text-red-500 ">*</span>
                </label>
                {/* <select
                  value={selectedManagerId}
                  onChange={handleManager}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                >
                  <option value="" hidden>
                    Select Designation
                  </option>
                  {managers.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.title}
                    </option>
                  ))}
                </select> */}
                <Select
                  id="manager-select"
                  name="managerId"
                  value={selectedManagerId || undefined}
                  onChange={handleAntDSelectManager}
                  placeholder="Select Designation"
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  showSearch
                  popupMatchSelectWidth={false}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {managers.map((mgr) => (
                    <Select.Option key={mgr._id} value={mgr._id}>
                      {mgr.title}
                    </Select.Option>
                  ))}
                </Select>

              </div>

              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
                >
                  Save Agent
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal
          isVisible={showModalUpdate}
          onClose={() => setShowModalUpdate(false)}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Update Agent
            </h3>
            <form className="space-y-6" onSubmit={handleUpdate} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Full Name <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  value={updateFormData.name}
                  onChange={handleInputChange}
                  id="name"
                  placeholder="Enter the Full Name"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Email <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={updateFormData.email}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Email"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Phone Number <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="number"
                    name="phone_number"
                    value={updateFormData.phone_number}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Phone Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.phone_number && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.phone_number}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-full">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Password <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    name="password"
                    value={updateFormData.password}
                    onChange={handleInputChange}
                    id="update-password"
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
                <div className="w-full">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Pincode <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    name="pincode"
                    value={updateFormData.pincode}
                    onChange={handleInputChange}
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
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Adhaar Number <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    name="adhaar_no"
                    value={updateFormData.adhaar_no}
                    onChange={handleInputChange}
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
                    htmlFor="date"
                  >
                    Pan Number <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    name="pan_no"
                    value={updateFormData.pan_no}
                    onChange={handleInputChange}
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
                  value={updateFormData.address}
                  onChange={handleInputChange}
                  id="name"
                  placeholder="Enter the Address"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.address && (
                  <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="category"
                >
                  Designation <span className="text-red-500 ">*</span>
                </label>
                {/* <select
                  value={selectedManagerId}
                  onChange={handleManager}
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                >
                  <option value="" hidden>
                    Select Designation
                  </option>
                  {managers.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.title}
                    </option>
                  ))}
                </select> */}
                <Select
                  id="selectedManagerId"
                  name="selectedManagerId"
                  value={selectedManagerId || undefined}
                  onChange={handleAntInputDSelectManager}
                  placeholder="Select Designation"
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  showSearch
                  popupMatchSelectWidth={false}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {managers.map((manager) => (
                    <Select.Option key={manager._id} value={manager._id}>
                      {manager.title}
                    </Select.Option>
                  ))}
                </Select>

                {errors.designation_id && (
                  <p className="mt-2 text-sm text-red-600">{errors.designation_id}</p>
                )}
              </div>
              {(selectedManagerTitle === "Sales Excecutive" ||
                selectedManagerTitle === "Business Agent" ||
                selectedManagerTitle === "Office Executive")
                && (
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Reporting Manager
                    </label>
                    <Select
                      value={selectedReportingManagerId || undefined}
                      id="selectedReportingManagerId"
                      onChange={handleReportingManager}
                      placeholder="Select Reporting Manager"
                      className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                      showSearch
                      popupMatchSelectWidth={false}
                      filterOption={(input, option) =>
                        option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      <Select.Option value="" hidden>
                        Select Reporting Manager
                      </Select.Option>
                      {users.map((group) => (
                        <Select.Option key={group._id} value={group._id}>
                          {group.name} - {group?.designation_id?.title}
                        </Select.Option>
                      ))}
                    </Select>
                    {errors.reporting_manager && (
                      <p className="mt-2 text-sm text-red-600">{errors.reporting_manager}</p>
                    )}
                  </div>
                )}
              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Update Agent
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal
          isVisible={showModalDelete}
          onClose={() => {
            setShowModalDelete(false);
            setCurrentUser(null);
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Delete Agent
            </h3>
            {currentUser && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeleteUser();
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
                      {currentUser.name}
                    </span>{" "}
                    to confirm deletion. <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    id="groupName"
                    placeholder="Enter the employee Full Name"
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

export default Agent;
