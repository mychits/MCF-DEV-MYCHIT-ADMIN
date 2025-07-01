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
import { fieldSize } from "../data/fieldSize";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";

import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
const BecomeAgent = () => {
  const [becomeAgent, setBecomeAgent] = useState([]);
  const [TableBecomeAgent, setTableBecomeAgent] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentBecomeAgent, setCurrentBecomeAgent] = useState(null);
  const [currentUpdateBecomeAgent, setCurrentUpdateBecomeAgent] =
    useState(null);
  const [errors, setErrors] = useState({});
  const [searchText, setSearchText] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [selectedReportingManagerId, setSelectedReportingManagerId] =
    useState("");
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
    agent_full_name: "",
    agent_email: "",
    agent_phone_number: "",
    agent_address: "",
    agent_id_proof_type: "",
    agent_id_proof_number: "",
    agent_bank_account_number: "",
    agent_bank_account_ifsc_code: "",
    agent_experience: "",
  });

  const [updateFormData, setUpdateFormData] = useState({
    agent_full_name: "",
    agent_email: "",
    agent_phone_number: "",
    agent_address: "",
    agent_id_proof_type: "",
    agent_id_proof_number: "",
    agent_bank_account_number: "",
    agent_bank_account_ifsc_code: "",
    agent_experience: "",
  });

  useEffect(() => {
    const fetchBecomeAgent = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/become-agent/agents/become");

        setBecomeAgent(response?.data?.becomeAgent);
        const formattedData = response?.data?.becomeAgent?.map(
          (group, index) => ({
            _id: group?._id,
            id: index + 1,
            agent_full_name: group?.agent_full_name,
            agent_phone_number: group?.agent_phone_number,
            agent_address: group?.agent_address,
            action: (
              <div className="flex justify-center  gap-2">
                <Dropdown
                  trigger={["click"]}
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
          })
        );
        setTableBecomeAgent(formattedData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBecomeAgent();
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

  //   const validateForm = (type) => {
  //     const newErrors = {};
  //     const data = type === "addEmployee" ? formData : updateFormData;
  //     const regex = {
  //       email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  //       phone: /^[6-9]\d{9}$/,
  //       password:
  //         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/,
  //       pincode: /^\d{6}$/,
  //       aadhaar: /^\d{12}$/,
  //       pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  //     };

  //     if (!data.name.trim()) {
  //       newErrors.name = "Full Name is required";
  //     }

  //     if (!data.email) {
  //       newErrors.email = "Email is required";
  //     } else if (!regex.email.test(data.email)) {
  //       newErrors.email = "Invalid email format";
  //     }

  //     if (!data.phone_number) {
  //       newErrors.phone_number = "Phone number is required";
  //     } else if (!regex.phone.test(data.phone_number)) {
  //       newErrors.phone_number = "Invalid  phone number";
  //     }

  //     if (!data.password) {
  //       newErrors.password = "Password is required";
  //     } else if (!regex.password.test(data.password)) {
  //       newErrors.password =
  //         "Password must contain at least 5 characters, one uppercase, one lowercase, one number, and one special character";
  //     }

  //     if (!data.pincode) {
  //       newErrors.pincode = "Pincode is required";
  //     } else if (!regex.pincode.test(data.pincode)) {
  //       newErrors.pincode = "Invalid pincode (6 digits required)";
  //     }

  //     if (!data.adhaar_no) {
  //       newErrors.adhaar_no = "Aadhaar number is required";
  //     } else if (!regex.aadhaar.test(data.adhaar_no)) {
  //       newErrors.adhaar_no = "Invalid Aadhaar number (12 digits required)";
  //     }
  //     if (!selectedManagerId) {
  //       newErrors.reporting_manager = "Reporting Manager is required";
  //     }
  //     if (!data.pan_no) {
  //       newErrors.pan_no = "PAN number is required";
  //     } else if (!regex.pan.test(data.pan_no.toUpperCase())) {
  //       newErrors.pan_no = "Invalid PAN format (e.g., ABCDE1234F)";
  //     }

  //     if (!data.address.trim()) {
  //       newErrors.address = "Address is required";
  //     } else if (data.address.trim().length < 10) {
  //       newErrors.address = "Address should be at least 10 characters";
  //     }

  //     setErrors(newErrors);
  //     return Object.keys(newErrors).length === 0;
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const isValidate = validateForm("addEmployee");

    try {
      //   if (isValidate) {

      const response = await api.post("/become-agent/agents/become", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setShowModal(false);
      setFormData({
        agent_full_name: "",
        agent_email: "",
        agent_phone_number: "",
        agent_address: "",
        agent_id_proof_type: "",
        agent_id_proof_number: "",
        agent_bank_account_number: "",
        agent_bank_account_ifsc_code: "",
        agent_experience: "",
      });
     
      setReloadTrigger((prev) => prev + 1);
      setAlertConfig({
        visibility: true,
        message: "Agent Added Successfully",
        type: "success",
      });
      //   }
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
    { key: "agent_full_name", header: "Name" },
    { key: "agent_phone_number", header: "Phone Number" },
    { key: "agent_address", header: "Address" },
    { key: "action", header: "Action" },
  ];

//   const filteredUsers = becomeAgent.filter((user) =>
//     user.agent_full_name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

  const handleDeleteModalOpen = async (userId) => {
    try {
      const response = await api.get(`/become-agent/agents/become/${userId}`);
      setCurrentBecomeAgent(response.data?.becomeAgent);
      setShowModalDelete(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleUpdateModalOpen = async (userId) => {
    try {
      const response = await api.get(`become-agent/agents/become/${userId}`);
      setCurrentUpdateBecomeAgent(response.data?.becomeAgent);
      setUpdateFormData({
        agent_full_name: response?.data?.becomeAgent?.agent_full_name,
        agent_email: response?.data?.becomeAgent?.agent_email,
        agent_phone_number: response?.data?.becomeAgent?.agent_phone_number,
        agent_address: response?.data?.becomeAgent?.agent_address,
        agent_id_proof_type: response?.data?.becomeAgent?.agent_id_proof_type,
        agent_id_proof_number: response?.data?.becomeAgent?.agent_id_proof_number,
        agent_bank_account_number: response?.data?.becomeAgent?.agent_bank_account_number,
        agent_bank_account_ifsc_code: response?.data?.becomeAgent?.agent_bank_account_ifsc_code,
        agent_experience: response?.data?.becomeAgent?.agent_experience,
      });
      
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
    if (currentBecomeAgent) {
      try {
        await api.delete(`become-agent/agents/become/${currentBecomeAgent._id}`);
        setShowModalDelete(false);
        setCurrentBecomeAgent(null);
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
    // const isValid = validateForm();
    try {
    //   if (isValid) {
        
        const response = await api.put(
          `/become-agent/agents/become/${currentUpdateBecomeAgent._id}`,
          updateFormData
        );
        setShowModalUpdate(false);
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Become Agent Updated Successfully",
          type: "success",
        });
    //   }
    } catch (error) {
      console.error("Error updating Become agent:", error);
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

          <div className="flex-grow p-7">
            <div className="mt-6 mb-8">
              <div className="flex justify-between items-center w-full">
                <h1 className="text-2xl font-semibold">Agent Approval</h1>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add  Agent 
                </button>
              </div>
            </div>
            {TableBecomeAgent?.length > 0 && !isLoading ? (
              <DataTable
                updateHandler={handleUpdateModalOpen}
                data={filterOption(TableBecomeAgent, searchText)}
                columns={columns}
                exportedFileName={`Agent-${
                  TableBecomeAgent.length > 0
                    ? TableBecomeAgent[0].name +
                      " to " +
                      TableBecomeAgent[TableBecomeAgent.length - 1].name
                    : "empty"
                }.csv`}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={TableBecomeAgent?.length <= 0}
                data="Agent Data"
              />
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
                  name="agent_full_name"
                  value={formData.agent_full_name}
                  onChange={handleChange}
                  id="agent_full_name"
                  placeholder="Enter the Full Name"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.agent_full_name && (
                  <p className="mt-2 text-sm text-red-600">{errors.agent_full_name}</p>
                )}
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="agent_email"
                    value={formData.agent_email}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Email"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_email && (
                    <p className="mt-2 text-sm text-red-600">{errors.agent_email}</p>
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
                    type="text"
                    name="agent_phone_number"
                    value={formData.agent_phone_number}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Phone Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_phone_number && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.agent_phone_number}
                    </p>
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
                  name="agent_address"
                  value={formData.agent_address}
                  onChange={handleChange}
                  id="name"
                  placeholder="Enter the Address"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.agent_address && (
                  <p className="mt-2 text-sm text-red-600">{errors.agent_address}</p>
                )}
              </div>
              <div className="flex flex-row justify-between space-x-4">
                
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    ID Type <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="agent_id_proof_type"
                    value={formData.agent_id_proof_type}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Pincode"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_id_proof_type && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.agent_id_proof_type}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    ID Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="agent_id_proof_number"
                    value={formData.agent_id_proof_number}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter ID Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_id_proof_number && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.agent_id_proof_number}
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
                    Bank Account Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="agent_bank_account_number"
                    value={formData.agent_bank_account_number}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Bank Account Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_bank_account_number && (
                    <p className="mt-2 text-sm text-red-600">{errors.agent_bank_account_number}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Bank Account IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="agent_bank_account_ifsc_code"
                    value={formData.agent_bank_account_ifsc_code}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Bank Account Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_bank_account_ifsc_code && (
                    <p className="mt-2 text-sm text-red-600">{errors.agent_bank_account_ifsc_code}</p>
                  )}
                </div>
              </div>
              
                 
                 <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Experience  <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="agent_experience"
                    value={formData.agent_experience}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Bank Account Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_experience && (
                    <p className="mt-2 text-sm text-red-600">{errors.agent_experience}</p>
                  )}
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
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="agent_full_name"
                  value={updateFormData.agent_full_name}
                  onChange={handleInputChange}
                  id="agent_full_name"
                  placeholder="Enter the Full Name"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.agent_full_name && (
                  <p className="mt-2 text-sm text-red-600">{errors.agent_full_name}</p>
                )}
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="agent_email"
                    value={updateFormData.agent_email}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Email"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_email && (
                    <p className="mt-2 text-sm text-red-600">{errors.agent_email}</p>
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
                    type="text"
                    name="agent_phone_number"
                    value={updateFormData.agent_phone_number}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Phone Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_phone_number && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.agent_phone_number}
                    </p>
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
                  name="agent_address"
                  value={updateFormData.agent_address}
                  onChange={handleInputChange}
                  id="name"
                  placeholder="Enter the Address"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.agent_address && (
                  <p className="mt-2 text-sm text-red-600">{errors.agent_address}</p>
                )}
              </div>
              <div className="flex flex-row justify-between space-x-4">
                
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    ID Type <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="agent_id_proof_type"
                    value={updateFormData.agent_id_proof_type}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Pincode"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_id_proof_type && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.agent_id_proof_type}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    ID Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="agent_id_proof_number"
                    value={updateFormData.agent_id_proof_number}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter ID Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_id_proof_number && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.agent_id_proof_number}
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
                    Bank Account Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="agent_bank_account_number"
                    value={updateFormData.agent_bank_account_number}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Bank Account Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_bank_account_number && (
                    <p className="mt-2 text-sm text-red-600">{errors.agent_bank_account_number}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Bank Account IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="agent_bank_account_ifsc_code"
                    value={updateFormData.agent_bank_account_ifsc_code}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Bank Account Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_bank_account_ifsc_code && (
                    <p className="mt-2 text-sm text-red-600">{errors.agent_bank_account_ifsc_code}</p>
                  )}
                </div>
              </div>
              
                 
                 <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Experience  <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="agent_experience"
                    value={updateFormData.agent_experience}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Bank Account Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.agent_experience && (
                    <p className="mt-2 text-sm text-red-600">{errors.agent_experience}</p>
                  )}
                </div>
              
             
            

              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
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
            setCurrentBecomeAgent(null);
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Delete Agent
            </h3>
            {currentBecomeAgent && (
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
                      {currentBecomeAgent.agent_full_name}
                    </span>{" "}
                    to confirm deletion.{" "}
                    <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    id="groupName"
                    placeholder="Enter the Agent Full Name"
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

export default BecomeAgent;
