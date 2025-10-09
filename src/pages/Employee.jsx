/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import { IoMdMore } from "react-icons/io";
import { Input, Select, Dropdown } from "antd";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { fieldSize } from "../data/fieldSize";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
const Employee = () => {
  const [users, setUsers] = useState([]);
  const [TableEmployees, setTableEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUpdateUser, setCurrentUpdateUser] = useState(null);
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
    name: "",
    email: "",
    phone_number: "",
    password: "",
    address: "",
    pincode: "",
    adhaar_no: "",
    designation_id: "",
    pan_no: "",
    agent_type: "employee",
    joining_date: "",
    status: "",
    dob: "",
    gender: "",
    alternate_number: "",
    salary: "",
    leaving_date: "",
    emergency_contact_person: "",
    emergency_contact_number: [""],
    total_allocated_leaves: "2",

    deductions: [
      {
        deduction_amount: "",
        deduction_justification: "",
        note: "",
      },
    ],

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
    joining_date: "",
    status: "",
    dob: "",
    gender: "",
    alternate_number: "",
    salary: "",
    leaving_date: "",
    emergency_contact_person: "",
    emergency_contact_number: [""],
    total_allocated_leaves: "2",

    deductions: [
      {
        deduction_amount: "",
        deduction_justification: "",
        note: "",
      },
    ],

  });
  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/agent/get-additional-employee-info");
        const employeeData = response.data?.employee || [];
        setUsers(employeeData);
        const formattedData = employeeData.map((group, index) => ({
          _id: group?._id,
          id: index + 1,
          name: group?.name || "N/A",
          employeeCode: group?.employeeCode || "N/A",
          phone_number: group?.phone_number || "N/A",
          password: group?.password || "N/A",
          designation: group?.designation_id?.title || "N/A",
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
        setTableEmployees(formattedData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployeeProfile();
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
  const handleAntInputDSelect = (field, value) => {
    setUpdateFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
  };
  const handleAntDSelectReportingManager = (reportingId) => {
    setSelectedReportingManagerId(reportingId);
    setFormData((prev) => ({
      ...prev,
      reportingManagerId: reportingId,
    }));
    setErrors((prev) => ({
      ...prev,
      reportingManagerId: "",
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
      alternate_number: /^[6-9]\d{9}$/,
    };
    if (!data.name || !data.name.trim()) {
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
    if (!data.alternate_number) {
      newErrors.alternate_number = "Alternate Phone number is required";
    } else if (!regex.alternate_number.test(data.alternate_number)) {
      newErrors.alternate_number = "Invalid Alternate  phone number";
    }
    if (!data.password) {
      newErrors.password = "Password is required";
    } else if (!regex.password.test(data.password)) {
      newErrors.password =
        "Password must contain at least 5 characters, one uppercase, one lowercase, one number, and one special character";
    }
    if (!data.status) {
      newErrors.status = "Status is required";
    }
    if (!data.dob) {
      newErrors.dob = "Date of Birth is required";
    }
    if (!data.joining_date) {
      newErrors.joining_date = "Joining Date is required";
    }
    if (!data.gender) {
      newErrors.gender = "Please Select Gender";
    }
    if (!data.salary) {
      newErrors.salary = "Salary is required";
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
  
    if (!data.pan_no) {
      newErrors.pan_no = "PAN number is required";
    } else if (!regex.pan.test(data.pan_no.toUpperCase())) {
      newErrors.pan_no = "Invalid PAN format (e.g., ABCDE1234F)";
    }
    if (!data.address || !data.address.trim()) {
      newErrors.address = "Address is required";
    } else if (data.address.trim().length < 10) {
      newErrors.address = "Address should be at least 10 characters";
    }
    if (!data.emergency_contact_person) {
      newErrors.emergency_contact_person = "Contact Person Name is Required";
    }
    if (!data.total_allocated_leaves) {
      newErrors.total_allocated_leaves = "Please Provide Total Allocated Leaves";
    }
    if(!selectedManagerId){
      newErrors.designation_id = "Please Enter Designation";  
    }

    if (data.deductions && data.deductions.length > 0) {
      for (let i = 0; i < data.deductions.length; i++) {
        const amount = parseFloat(data.deductions[i].deduction_amount);
        if (isNaN(amount) || amount <= 0) {
          newErrors[`deduction_amount_${i}`] = "Deduction amount must be greater than 0";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const addPhoneField = (formState, setFormState) => {
    const phones = [...(formState.emergency_contact_number || [])];
    const lastPhone = phones[phones.length - 1];
    if (phones.length > 0 && (!lastPhone || lastPhone.trim() === "")) {
      alert(
        "Please fill in the last emergency contact number before adding a new one."
      );
      return;
    }
    setFormState({
      ...formState,
      emergency_contact_number: [...phones, ""],
    });
  };
  const handlePhoneChange = (formState, setFormState, index, e) => {
    const value = e.target.value;
    let phones =
      formState.emergency_contact_number &&
        formState.emergency_contact_number.length > 0
        ? [...formState.emergency_contact_number]
        : [""];
    while (phones.length <= index) {
      phones.push("");
    }
    phones[index] = value;
    const lastIndex = phones.reduceRight((lastNonEmpty, phone, i) => {
      return lastNonEmpty !== -1 ? lastNonEmpty : phone.trim() !== "" ? i : -1;
    }, -1);
    phones = lastIndex === -1 ? [""] : phones.slice(0, lastIndex + 1);
    setFormState({
      ...formState,
      emergency_contact_number: phones,
    });
  };
  const removePhoneField = (formState, setFormState, index) => {
    const phones = Array.isArray(formState.emergency_contact_number)
      ? [...formState.emergency_contact_number]
      : [];
    const updatedPhones = phones.filter((_, i) => i !== index);
    setFormState({
      ...formState,
      emergency_contact_number: updatedPhones,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValidate = validateForm("addEmployee");
    try {
      if (isValidate) {
        const dataToSend = {
          ...formData,
          designation_id: selectedManagerId,
          reporting_manager_id: selectedReportingManagerId,
        };
        const response = await api.post(
          "/agent/add-addtional-employee-info",
          dataToSend,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
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
          joining_date: "",
          status: "",
          dob: "",
          gender: "",
          alternate_number: "",
          salary: "",
          leaving_date: "",
          emergency_contact_person: "",
          emergency_contact_number: [""],
          total_allocated_leaves: "2",

          deduction_amount: "",
          deduction_justification: "",
          deduction_processed_on: "",
          deduction_remarks: "",
        });
        setSelectedManagerId("");
        setSelectedReportingManagerId("");
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Employee Added Successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error adding Employee:", error);
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
    { key: "name", header: "Employee Name" },
    { key: "employeeCode", header: "Employee ID" },
    { key: "phone_number", header: "Employee Phone Number" },
    { key: "designation", header: "Designation" },
    { key: "password", header: "Employee Password" },
    { key: "action", header: "Action" },
  ];
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleDeleteModalOpen = async (userId) => {
    try {
      const response = await api.get(
        `/agent/get-additional-employee-info-by-id/${userId}`
      );
      setCurrentUser(response.data?.employee);
      setShowModalDelete(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  const handleUpdateModalOpen = async (userId) => {
    try {
      const response = await api.get(
        `/agent/get-additional-employee-info-by-id/${userId}`
      );
      setCurrentUpdateUser(response.data?.employee);
      setUpdateFormData({
        name: response?.data?.employee?.name,
        email: response?.data?.employee?.email,
        phone_number: response?.data?.employee?.phone_number,
        password: response?.data?.employee?.password,
        pincode: response?.data?.employee?.pincode,
        adhaar_no: response?.data?.employee?.adhaar_no,
        pan_no: response?.data?.employee?.pan_no,
        address: response?.data?.employee?.address,
        joining_date: response?.data?.employee?.joining_date?.split("T")[0],
        status: response?.data?.employee?.status,
        dob: response?.data?.employee?.dob?.split("T")[0],
        gender: response?.data?.employee?.gender,
        alternate_number: response?.data?.employee?.alternate_number,
        salary: response?.data?.employee?.salary,
        leaving_date: response?.data?.employee?.leaving_date?.split("T")[0],
        emergency_contact_number: response?.data?.employee
          ?.emergency_contact_number || [""],
        emergency_contact_person:
          response?.data?.employee?.emergency_contact_person,
        total_allocated_leaves: response?.data?.employee?.total_allocated_leaves?.toString() || "2",

        deductions:
          response?.data?.employee?.deductions?.length > 0
            ? response.data.employee.deductions
            : [
              {
                deduction_amount: response?.data?.employee?.deduction_amount || "",
                deduction_justification:
                  response?.data?.employee?.deduction_justification || "",
                note: response?.data?.employee?.deduction_remarks || "",
              },
            ],

      });
      setSelectedManagerId(response.data?.employee?.designation_id?._id || "");
      setSelectedReportingManagerId(
        response.data?.employee?.reporting_manager_id || ""
      );
      setSelectedManagerTitle(response.data?.employee?.designation_id?.title);
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
        await api.delete(
          `/agent/delete-additional-employee-info-by-id/${currentUser._id}`
        );
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
          reporting_manager_id: selectedReportingManagerId,
        };
        const response = await api.put(
          `/agent/update-additional-employee-info/${currentUpdateUser._id}`,
          dataToSend
        );
        setShowModalUpdate(false);
        setSelectedManagerId("");
        setSelectedReportingManagerId("");
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Employee Details Updated Successfully",
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
  const handleReportingManager = async (event) => {
    const reportingId = event.target.value;
    setSelectedReportingManagerId(reportingId);
  };

  const handleDeductionChange = (index, field, value, isUpdate = false) => {
    if (isUpdate) {
      const updatedDeductions = [...updateFormData.deductions];
      updatedDeductions[index][field] = value;
      setUpdateFormData({ ...updateFormData, deductions: updatedDeductions });
    } else {
      const updatedDeductions = [...formData.deductions];
      updatedDeductions[index][field] = value;
      setFormData({ ...formData, deductions: updatedDeductions });
    }
  };

  const addDeductionField = (isUpdate = false) => {
    const newDeduction = { deduction_amount: "", deduction_justification: "", note: "" };
    if (isUpdate) {
      setUpdateFormData({
        ...updateFormData,
        deductions: [...updateFormData.deductions, newDeduction],
      });
    } else {
      setFormData({
        ...formData,
        deductions: [...formData.deductions, newDeduction],
      });
    }
  };

  const removeDeductionField = (index, isUpdate = false) => {
    if (isUpdate) {
      const updated = updateFormData.deductions.filter((_, i) => i !== index);
      setUpdateFormData({ ...updateFormData, deductions: updated });
    } else {
      const updated = formData.deductions.filter((_, i) => i !== index);
      setFormData({ ...formData, deductions: updated });
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
                <h1 className="text-2xl font-semibold">Employee</h1>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add Employee
                </button>
              </div>
            </div>
            {TableEmployees?.length > 0 && !isLoading ? (
              <DataTable
                updateHandler={handleUpdateModalOpen}
                data={filterOption(TableEmployees, searchText)}
                columns={columns}
                exportedPdfName="Employee"
                exportedFileName={`Employees.csv`}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={TableEmployees?.length <= 0}
                data="Employee Data"
              />
            )}
          </div>
        </div>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Add Employee
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
                    Email <span className="text-red-500">*</span>
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
                    htmlFor="pass"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="pass"
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
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="category"
                  >
                    Designation <span className="text-red-500 ">*</span>
                  </label>
                  <Select
                    id="designation_id"
                    name="designation_id"
                    value={selectedManagerId || undefined}
                    onChange={handleAntDSelectManager}
                    placeholder="Select Designation"
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    showSearch
                    popupMatchSelectWidth={false}
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {managers.map((mgr) => (
                      <Select.Option key={mgr._id} value={mgr._id}>
                        {mgr.title}
                      </Select.Option>
                    ))}
                  </Select>
                  { errors.designation_id && (
                    <p className="mt-2 text-sm text-red-600">{errors.designation_id}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="status"
                  >
                    Status <span className="text-red-500">*</span>
                  </label>
                  {/* <select
                    name="status"
                    value={formData?.status}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                  </select> */}
                  <Select
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    placeholder="Select Status"
                    popupMatchSelectWidth={false}
                    showSearch
                    name="status"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={formData?.status || undefined}
                    onChange={(value) => handleAntDSelect("status", value)}
                  >
                    {["Active", "Inactive", "Terminated",].map((stype) => (
                      <Select.Option key={stype} value={stype.toLowerCase()}>
                        {stype}
                      </Select.Option>
                    ))}
                  </Select>
                  {errors.status && (
                    <p className="mt-2 text-sm text-red-600">{errors.status}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="joiningdate"
                  >
                    Joining Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    id="joiningdate"
                    placeholder="Enter Employee Joining Date"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.joining_date && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.joining_date}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="ld"
                  >
                    Leaving Date <span className="text-red-500"></span>
                  </label>
                  <Input
                    type="date"
                    name="leaving_date"
                    value={formData.leaving_date}
                    onChange={handleChange}
                    id="ld"
                    placeholder="Enter Leaving Date"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="dob"
                  >
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    id="dob"
                    placeholder="Enter Employee Date of Birth"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.dob && (
                    <p className="mt-2 text-sm text-red-600">{errors.dob}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="gender"
                  >
                    Gender <span className="text-red-500">*</span>
                  </label>
                  {/* <select
                    name="gender"
                    value={formData?.gender}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select> */}
                  <Select
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    placeholder="Select Gender"
                    popupMatchSelectWidth={false}
                    showSearch
                    name="gender"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={formData?.gender || undefined}
                    onChange={(value) => handleAntDSelect("gender", value)}
                  >
                    {["Male", "Female", "Others"].map((gender) => (
                      <Select.Option key={gender} value={gender.toLowerCase()}>
                        {gender}
                      </Select.Option>
                    ))}
                  </Select>
                  {errors.gender && (
                    <p className="mt-2 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="sal"
                  >
                    Salary <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    id="sal"
                    placeholder="Enter Your Salary"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.salary && (
                    <p className="mt-2 text-sm text-red-600">{errors.salary}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="alternate"
                  >
                    Alternate Phone Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="alternate_number"
                    value={formData.alternate_number}
                    onChange={handleChange}
                    id="alternate"
                    placeholder="Enter Alternate Phone Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.alternate_number && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.alternate_number}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="total_allocated_leaves"
                  >
                    Total Allocated Leaves <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="total_allocated_leaves"
                    value={formData.total_allocated_leaves}
                    onChange={handleChange}
                    id="total_allocated_leaves"
                    placeholder="Enter total allocated leaves"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.total_allocated_leaves && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.total_allocated_leaves}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="cp"
                  >
                    Emergency Contact Person
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="emergency_contact_person"
                    value={formData.emergency_contact_person}
                    onChange={handleChange}
                    id="cp"
                    placeholder="Enter Emergency Contact Person Name"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.emergency_contact_person && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.emergency_contact_person}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="emergency"
                  >
                    Emergency Phone Number{" "}
                    
                  </label>
                  <div className="flex items-center mb-2 gap-2">
                    <Input
                      type="tel"
                      name="emergency_contact_number"
                      value={formData.emergency_contact_number?.[0] || ""}
                      onChange={(e) =>
                        handlePhoneChange(formData, setFormData, 0, e)
                      }
                      id="emergency_0"
                      placeholder="Enter Default Emergency Phone Number"
                      required
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  {formData.emergency_contact_number
                    ?.slice(1)
                    .map((phone, index) => (
                      <div key={index} className="flex items-center mb-2 gap-2">
                        <Input
                          type="tel"
                          name={`emergency_phone_${index + 1}`}
                          value={phone}
                          onChange={(e) =>
                            handlePhoneChange(
                              formData,
                              setFormData,
                              index + 1,
                              e
                            )
                          }
                          id={`emergency_${index + 1}`}
                          placeholder="Enter Additional Emergency Phone Number"
                          className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              removePhoneField(formData, setFormData, index + 1)
                            }
                            className="text-red-600 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  <button
                    type="button"
                    onClick={() => addPhoneField(formData, setFormData)}
                    className="mt-2 text-blue-600 text-sm"
                  >
                    + Add Another
                  </button>
                </div>
              </div>


              <div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Deduction Details
                </h4>

                {Array.isArray(formData?.deductions) &&
                  formData.deductions.map((deduction, index) => (

                    <div key={index} className="mb-8 p-4 ">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Deduction Amount <span className="text-gray-500">(in ₹)</span>
                          </label>
                          <Input
                            type="number"
                            name={`deduction_amount_${index}`}
                            value={deduction.deduction_amount}
                            onChange={(e) => {
                              const val = e.target.value;

                              if (val < 0) return;
                              handleDeductionChange(index, "deduction_amount", val);
                            }}
                            placeholder="e.g., 2500"
                            className="bg-gray-50 border border-gray-300 h-12 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                          />
                          {errors[`deduction_amount_${index}`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`deduction_amount_${index}`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Justification
                          </label>
                          <Input
                            type="text"
                            name={`deduction_justification_${index}`}
                            value={deduction.deduction_justification}
                            onChange={(e) =>
                              handleDeductionChange(index, "deduction_justification", e.target.value)
                            }
                            placeholder="e.g., Non-compliance with attendance policy"
                            className="bg-gray-50 border border-gray-300 h-12 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                          />
                        </div>
                      </div>

                      <div className="w-full mt-6">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Note
                        </label>
                        <textarea
                          rows={2}
                          name={`note_${index}`}
                          value={deduction.note}
                          onChange={(e) =>
                            handleDeductionChange(index, "note", e.target.value)
                          }
                          placeholder="Note if any?"
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeDeductionField(index)}
                          className="mt-4 text-red-600 text-sm underline"
                        >
                          Remove Deduction
                        </button>
                      )}
                    </div>
                  ))}

                <button
                  type="button"
                  onClick={() => addDeductionField()}
                  className="text-blue-700 text-sm font-medium underline"
                >
                  + Add Another Deduction
                </button>
              </div>



              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
                >
                  Save Employee
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
              Update Employee
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
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="category"
                  >
                    Designation <span className="text-red-500 ">*</span>
                  </label>
                 
                  <Select
                    id="designation_id"
                    name="designation_id"
                    value={selectedManagerId || undefined}
                    onChange={handleAntDSelectManager}
                    placeholder="Select Designation"
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    showSearch
                    popupMatchSelectWidth={false}
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {managers.map((manager) => (
                      <Select.Option key={manager._id} value={manager._id}>
                        {manager.title}
                      </Select.Option>
                    ))}
                  </Select>
                  {errors.designation_id && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.designation_id}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="status"
                  >
                    Status <span className="text-red-500">*</span>
                  </label>
                  {/* <select
                    name="status"
                    value={updateFormData?.status}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                  </select> */}
                  <Select
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    placeholder="Select Status"
                    popupMatchSelectWidth={false}
                    showSearch
                    name="status"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={updateFormData?.status || undefined}
                    onChange={(value) => handleAntInputDSelect("status", value)}
                  >
                    {["Active", "Inactive", "Terminated"].map((status) => (
                      <Select.Option key={status} value={status.toLowerCase()}>
                        {status}
                      </Select.Option>
                    ))}
                  </Select>
                  {errors.status && (
                    <p className="mt-2 text-sm text-red-600">{errors.status}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="joiningdate"
                  >
                    Joining Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="joining_date"
                    value={updateFormData.joining_date}
                    onChange={handleInputChange}
                    id="joiningdate"
                    placeholder="Enter Employee Joining Date"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.joining_date && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.joining_date}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="ld"
                  >
                    Leaving Date <span className="text-red-500"></span>
                  </label>
                  <Input
                    type="date"
                    name="leaving_date"
                    value={
                      updateFormData?.leaving_date
                        ? new Date(updateFormData?.leaving_date || "")
                          .toISOString()
                          .split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                    id="ld"
                    placeholder="Enter Leaving Date"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="doB"
                  >
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="dob"
                    value={
                      updateFormData?.dob
                        ? new Date(updateFormData?.dob || "")
                          .toISOString()
                          .split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                    id="doB"
                    placeholder="Enter Employee Date of Birth"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.dob && (
                    <p className="mt-2 text-sm text-red-600">{errors.dob}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="gender"
                  >
                    Gender <span className="text-red-500">*</span>
                  </label>
                  {/* <select
                    name="gender"
                    value={updateFormData?.gender}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select> */}
                  <Select
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    placeholder="Select Gender"
                    popupMatchSelectWidth={false}
                    showSearch
                    name="gender"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={updateFormData?.gender || undefined}
                    onChange={(value) => handleAntInputDSelect("gender", value)}
                  >
                    {["Male", "Female", "Others"].map((gender) => (
                      <Select.Option key={gender} value={gender.toLowerCase()}>
                        {gender}
                      </Select.Option>
                    ))}
                  </Select>
                  {errors.gender && (
                    <p className="mt-2 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="sal"
                  >
                    Salary <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="salary"
                    value={updateFormData.salary}
                    onChange={handleInputChange}
                    id="sal"
                    placeholder="Enter Salary"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.salary && (
                    <p className="mt-2 text-sm text-red-600">{errors.salary}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="alternate"
                  >
                    Alternate Phone Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="alternate_number"
                    value={updateFormData.alternate_number}
                    onChange={handleInputChange}
                    id="alternate"
                    placeholder="Enter Alternate Phone Number"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.alternate_number && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.alternate_number}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="total_allocated_leaves"
                  >
                    Total No. of Leaves <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="total_allocated_leaves"
                    value={updateFormData.total_allocated_leaves}
                    onChange={handleInputChange}
                    id="total_allocated_leaves"
                    placeholder="Enter total leaves"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.total_allocated_leaves && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.total_allocated_leaves}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="cp"
                  >
                    Emergency Contact Person{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="emergency_contact_person"
                    value={updateFormData?.emergency_contact_person}
                    onChange={handleInputChange}
                    id="ld"
                    placeholder="Enter Emergency Contact Person Name"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.emergency_contact_person && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.emergency_contact_person}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="emergency"
                  >
                    Emergency Phone Number{" "}
                  
                  </label>
                  <div className="flex items-center mb-2 gap-2">
                    <Input
                      type="tel"
                      name="emergency_contact_number"
                      value={updateFormData.emergency_contact_number?.[0] || ""}
                      onChange={(e) =>
                        handlePhoneChange(
                          updateFormData,
                          setUpdateFormData,
                          0,
                          e
                        )
                      }
                      id="emergency_0"
                      placeholder="Enter Default Emergency Phone Number"
                      required
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  {updateFormData.emergency_contact_number
                    ?.slice(1)
                    .map((phone, index) => (
                      <div
                        key={index + 1}
                        className="flex items-center mb-2 gap-2"
                      >
                        <Input
                          type="tel"
                          name={`emergency_phone_${index + 1}`}
                          value={phone}
                          onChange={(e) =>
                            handlePhoneChange(
                              updateFormData,
                              setUpdateFormData,
                              index + 1,
                              e
                            )
                          }
                          id={`emergency_${index + 1}`}
                          placeholder="Enter Additional Emergency Phone Number"
                          className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removePhoneField(
                              updateFormData,
                              setUpdateFormData,
                              index + 1
                            )
                          }
                          className="text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  <button
                    type="button"
                    onClick={() =>
                      addPhoneField(updateFormData, setUpdateFormData)
                    }
                    className="mt-2 text-blue-600 text-sm"
                  >
                    + Add Another
                  </button>
                </div>
              </div>


              <div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Deduction Details
                </h4>

                {Array.isArray(updateFormData?.deductions) &&
                  updateFormData.deductions.map((deduction, index) => (

                    <div key={index} className="mb-8  p-4 ">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Deduction Amount <span className="text-gray-500">(in ₹)</span>
                          </label>
                          <Input
                            type="number"
                            name={`deduction_amount_${index}`}
                            value={deduction.deduction_amount}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val < 0) return;
                              handleDeductionChange(index, "deduction_amount", val, true);
                            }}
                            placeholder="e.g., 2500"
                            className="bg-gray-50 border border-gray-300 h-12 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                          />
                          {errors[`deduction_amount_${index}`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`deduction_amount_${index}`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Justification
                          </label>
                          <Input
                            type="text"
                            name={`deduction_justification_${index}`}
                            value={deduction.deduction_justification}
                            onChange={(e) =>
                              handleDeductionChange(index, "deduction_justification", e.target.value, true)
                            }
                            placeholder="e.g., Non-compliance with attendance policy"
                            className="bg-gray-50 border border-gray-300 h-12 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                          />
                        </div>
                      </div>

                      <div className="w-full mt-6">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Note
                        </label>
                        <textarea
                          rows={2}
                          name={`note_${index}`}
                          value={deduction.note}
                          onChange={(e) =>
                            handleDeductionChange(index, "note", e.target.value, true)
                          }
                          placeholder="Note if any?"
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeDeductionField(index, true)}
                          className="mt-4 text-red-600 text-sm underline"
                        >
                          Remove Deduction
                        </button>
                      )}
                    </div>
                  ))}

                <button
                  type="button"
                  onClick={() => addDeductionField(true)}
                  className="text-blue-700 text-sm font-medium underline"
                >
                  + Add Another Deduction
                </button>
              </div>

              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Update Employee
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
              Delete Employee
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
                    to confirm deletion.{" "}
                    <span className="text-red-500 ">*</span>
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
export default Employee;