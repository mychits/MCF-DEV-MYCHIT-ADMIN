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
const Payroll = () => {
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
    earnings: {
      basic: 0,
      hra: 0,
      travel_allowance: 0,
      medical_allowance: 0,
      basket_of_benifits: 0,
      performance_bonus: 0,
      other_allowances: 0,
      conveyance: 0,
    },
    deductions: {
      income_tax: 0,
      esi: 0,
      epf: 0,
      professional_tax: 0,
    },
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
    earnings: {
      basic: 0,
      hra: 0,
      travel_allowance: 0,
      medical_allowance: 0,
      basket_of_benifits: 0,
      performance_bonus: 0,
      other_allowances: 0,
      conveyance: 0,
    },
    deductions: {
      income_tax: 0,
      esi: 0,
      epf: 0,
      professional_tax: 0,
    },
  });
  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/employee/");
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

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;

    // support nested fields like earnings.basic
    const path = name.split(".");

    setFormData((prevData) => {
      let updated = { ...prevData };
      let temp = updated;

      for (let i = 0; i < path.length - 1; i++) {
        temp[path[i]] = { ...temp[path[i]] };
        temp = temp[path[i]];
      }

      temp[path[path.length - 1]] = value;
      return updated;
    });

    // Clear errors correctly
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
      newErrors.total_allocated_leaves =
        "Please Provide Total Allocated Leaves";
    }
    if (!selectedManagerId) {
      newErrors.designation_id = "Please Enter Designation";
    }

    if (data.deductions && data.deductions.length > 0) {
      for (let i = 0; i < data.deductions.length; i++) {
        const amount = parseFloat(data.deductions[i].deduction_amount);
        if (isNaN(amount)) {
          newErrors[`deduction_amount_${i}`] = "Deduction amount must be digit";
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
        const response = await api.post("/agent/employee", dataToSend, {
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
          earnings: {
            basic: 0,
            hra: 0,
            travel_allowance: 0,
            medical_allowance: 0,
            basket_of_benifits: 0,
            performance_bonus: 0,
            other_allowances: 0,
            conveyance: 0,
          },
          deductions: {
            income_tax: 0,
            esi: 0,
            epf: 0,
            professional_tax: 0,
          },
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
      const response = await api.get(`/agent/get-employee-by-id/${userId}`);
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
        total_allocated_leaves:
          response?.data?.employee?.total_allocated_leaves?.toString() || "2",
        earnings: {
          basic: response?.data?.employee?.earnings?.basic || "",
          hra: response?.data?.employee?.earnings?.hra || "",
          travel_allowance:
            response?.data?.employee?.earnings?.travel_allowance || "",
          medical_allowance:
            response?.data?.employee?.earnings?.medical_allowance || "",
          basket_of_benifits:
            response?.data?.employee?.earnings?.basket_of_benifits || "",
          performance_bonus:
            response?.data?.employee?.earnings?.performance_bonus || "",
          other_allowances:
            response?.data?.employee?.earnings?.other_allowances || "",
          conveyance: response?.data?.employee?.earnings?.conveyance || "",
        },

        deductions: {
          income_tax: response?.data?.employee?.deductions?.income_tax || "",
          esi: response?.data?.employee?.deductions?.esi || "",
          epf: response?.data?.employee?.deductions?.epf || "",
          professional_tax:
            response?.data?.employee?.deductions?.professional_tax || "",
        },
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
  const handleSalaryInputChange = (e) => {
    const { name, value } = e.target;

    // split name like "deductions.tds"
    const path = name.split(".");

    setUpdateFormData((prevData) => {
      let updated = { ...prevData };
      let temp = updated;

      for (let i = 0; i < path.length - 1; i++) {
        temp[path[i]] = { ...temp[path[i]] }; // clone each nested level
        temp = temp[path[i]];
      }

      temp[path[path.length - 1]] = value; // final key update

      return updated;
    });
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
                  htmlFor="name"
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
                    htmlFor="email"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    id="email"
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
                    htmlFor="phone_number"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    id="phone_number"
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
                    htmlFor="password"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    id="password"
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
                    htmlFor="pincode"
                  >
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    id="pincode"
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
                    htmlFor="adhaar_no"
                  >
                    Adhaar Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="adhaar_no"
                    value={formData.adhaar_no}
                    onChange={handleChange}
                    id="adhaar_no"
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
                    htmlFor="pan_no"
                  >
                    Pan Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="pan_no"
                    value={formData.pan_no}
                    onChange={handleChange}
                    id="pan_no"
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
                  htmlFor="address"
                >
                  Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  id="address"
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
                    htmlFor="designation_id"
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
                    {["Active", "Inactive", "Terminated"].map((stype) => (
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
                    htmlFor="joining_date"
                  >
                    Joining Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    id="joining_date"
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
                    htmlFor="leaving_date"
                  >
                    Leaving Date
                  </label>
                  <Input
                    type="date"
                    name="leaving_date"
                    value={formData.leaving_date}
                    onChange={handleChange}
                    id="leaving_date"
                    placeholder="Enter Leaving Date"
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
                    htmlFor="salary"
                  >
                    Salary <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    id="salary"
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
                    htmlFor="alternate_number"
                  >
                    Alternate Phone Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    name="alternate_number"
                    value={formData.alternate_number}
                    onChange={handleChange}
                    id="alternate_number"
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
                    Total Allocated Leaves{" "}
                    <span className="text-red-500">*</span>
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
                    htmlFor="emergency_contact_person"
                  >
                    Emergency Contact Person
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="emergency_contact_person"
                    value={formData.emergency_contact_person}
                    onChange={handleChange}
                    id="emergency_contact_person"
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
                    htmlFor="emergency_contact_number"
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
                      id="emergency_contact_number_0"
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
                          id={`emergency_contact_number_${index + 1}`}
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
              <div>
                <label
                  className="block mb-4 text-3xl font-bold text-gray-900"
                  htmlFor="earnings"
                >
                  Earnings
                </label>

                <div className="flex flex-row justify-between space-x-4 mb-6">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="basic"
                    >
                      Basic Salary
                    </label>
                    <Input
                      type="Number"
                      name="earnings.basic"
                      value={
                        formData.earnings?.basic === 0
                          ? ""
                          : formData.earnings?.basic
                      }
                      onChange={handleSalaryChange}
                      id="basic"
                      placeholder="Enter Employee Basic Salary"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="hra"
                    >
                      House Rent Allowance
                    </label>
                    <Input
                      type="number"
                      name="earnings.hra"
                      value={
                        formData.earnings?.hra === 0
                          ? ""
                          : formData.earnings?.hra
                      }
                      onChange={handleSalaryChange}
                      id="hra"
                      placeholder="Enter House Rent Allowance"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="travel_allowance"
                    >
                      Travel Allowance
                    </label>
                    <Input
                      type="number"
                      name="earnings.travel_allowance"
                      value={formData.earnings?.travel_allowance}
                      onChange={handleSalaryChange}
                      id="travel_allowance"
                      placeholder="Enter Employee Travel Allowance"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="medical_allowance"
                    >
                      Medical Allowance
                    </label>
                    <Input
                      type="number"
                      name="earnings.medical_allowance"
                      value={formData.earnings?.medical_allowance}
                      onChange={handleSalaryChange}
                      id="medical_allowance"
                      placeholder="Enter  Medical Allowance"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="basket_of_benifits"
                    >
                      Basket of Benifits <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="earnings.basket_of_benifits"
                      value={formData.earnings?.basket_of_benifits}
                      onChange={handleSalaryChange}
                      id="basket_of_benifits"
                      placeholder="Enter Employee Basket of Benifits"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="performance_bonus"
                    >
                      Performance Bonus
                    </label>
                    <Input
                      type="number"
                      name="earnings.performance_bonus"
                      value={formData.earnings?.performance_bonus}
                      onChange={handleSalaryChange}
                      id="performance_bonus"
                      placeholder="Enter Performance Bonus"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="other_allowances"
                    >
                      Other Allowance
                    </label>
                    <Input
                      type="number"
                      name="earnings.other_allowances"
                      value={formData.earnings?.other_allowances}
                      onChange={handleSalaryChange}
                      id="other_allowances"
                      placeholder="Enter Other Allowance"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="conveyance"
                    >
                      Conveyance
                    </label>
                    <Input
                      type="number"
                      name="earnings.conveyance"
                      value={formData.earnings?.conveyance}
                      onChange={handleSalaryChange}
                      id="conveyance"
                      placeholder="Enter Conveyance"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  className="block mb-4 text-2xl font-bold text-gray-900"
                  htmlFor="deductions"
                >
                  Deductions
                </label>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="income_tax"
                    >
                      Income Tax
                    </label>
                    <Input
                      type="number"
                      name="deductions.income_tax"
                      value={formData.deductions?.income_tax}
                      onChange={handleSalaryChange}
                      id="income_tax"
                      placeholder="Enter Employee Income Tax"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="esi"
                    >
                      Employees' State Insurance
                    </label>
                    <Input
                      type="number"
                      name="deductions.esi"
                      value={formData.deductions?.esi}
                      onChange={handleSalaryChange}
                      id="esi"
                      placeholder="Enter Employees' State Insurance"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="epf"
                    >
                      Employees' Provident Fund
                    </label>
                    <Input
                      type="number"
                      name="deductions.epf"
                      value={formData.deductions?.epf}
                      onChange={handleSalaryChange}
                      id="epf"
                      placeholder="Enter Employees' Provident Fund"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="professional_tax"
                    >
                      Professional Tax
                    </label>
                    <Input
                      type="number"
                      name="deductions.professional_tax"
                      value={formData.deductions?.professional_tax}
                      onChange={handleSalaryChange}
                      id="professional_tax"
                      placeholder="Enter Employees' Professional Tax"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
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
                  htmlFor="update_name"
                >
                  Full Name <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  value={updateFormData.name}
                  onChange={handleInputChange}
                  id="update_name"
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
                    htmlFor="update_email"
                  >
                    Email <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={updateFormData.email}
                    onChange={handleInputChange}
                    id="update_email"
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
                    htmlFor="update_phone_number"
                  >
                    Phone Number <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="tel"
                    name="phone_number"
                    value={updateFormData.phone_number}
                    onChange={handleInputChange}
                    id="update_phone_number"
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
                    htmlFor="update_password"
                  >
                    Password <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    name="password"
                    value={updateFormData.password}
                    onChange={handleInputChange}
                    id="update_password"
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
                    htmlFor="update_pincode"
                  >
                    Pincode <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    name="pincode"
                    value={updateFormData.pincode}
                    onChange={handleInputChange}
                    id="update_pincode"
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
                    htmlFor="update_adhaar_no"
                  >
                    Adhaar Number <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    name="adhaar_no"
                    value={updateFormData.adhaar_no}
                    onChange={handleInputChange}
                    id="update_adhaar_no"
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
                    htmlFor="update_pan_no"
                  >
                    Pan Number <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    name="pan_no"
                    value={updateFormData.pan_no}
                    onChange={handleInputChange}
                    id="update_pan_no"
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
                  htmlFor="update_address"
                >
                  Address <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="address"
                  value={updateFormData.address}
                  onChange={handleInputChange}
                  id="update_address"
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
                    htmlFor="update_designation_id"
                  >
                    Designation <span className="text-red-500 ">*</span>
                  </label>

                  <Select
                    id="update_designation_id"
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
                    htmlFor="update_status"
                  >
                    Status <span className="text-red-500">*</span>
                  </label>
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
                    htmlFor="update_joining_date"
                  >
                    Joining Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="joining_date"
                    value={updateFormData.joining_date}
                    onChange={handleInputChange}
                    id="update_joining_date"
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
                    htmlFor="update_leaving_date"
                  >
                    Leaving Date
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
                    id="update_leaving_date"
                    placeholder="Enter Leaving Date"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="update_dob"
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
                    id="update_dob"
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
                    htmlFor="update_gender"
                  >
                    Gender <span className="text-red-500">*</span>
                  </label>
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
                    htmlFor="update_salary"
                  >
                    Salary <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="salary"
                    value={updateFormData.salary}
                    onChange={handleInputChange}
                    id="update_salary"
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
                    htmlFor="update_alternate_number"
                  >
                    Alternate Phone Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    name="alternate_number"
                    value={updateFormData.alternate_number}
                    onChange={handleInputChange}
                    id="update_alternate_number"
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
                    htmlFor="update_total_allocated_leaves"
                  >
                    Total No. of Leaves <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="total_allocated_leaves"
                    value={updateFormData.total_allocated_leaves}
                    onChange={handleInputChange}
                    id="update_total_allocated_leaves"
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
                    htmlFor="update_emergency_contact_person"
                  >
                    Emergency Contact Person{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="emergency_contact_person"
                    value={updateFormData?.emergency_contact_person}
                    onChange={handleInputChange}
                    id="update_emergency_contact_person"
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
                    htmlFor="update_emergency_contact_number"
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
                      id="update_emergency_contact_number_0"
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
                          id={`update_emergency_contact_number_${index + 1}`}
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

              <div>
                <label
                  className="block mb-2 text-2xl font-medium text-gray-900 "
                  htmlFor="update_earnings"
                >
                  Earnings
                </label>

                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="update_basic"
                    >
                      Basic Salary
                    </label>
                    <Input
                      type="Number"
                      name="earnings.basic"
                      value={updateFormData.earnings?.basic}
                      onChange={handleSalaryInputChange}
                      id="update_basic"
                      placeholder="Enter Employee Basic Salary"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="update_hra"
                    >
                      House Rent Allowance
                    </label>
                    <Input
                      type="number"
                      name="earnings.hra"
                      value={updateFormData.earnings?.hra}
                      onChange={handleSalaryInputChange}
                      id="update_hra"
                      placeholder="Enter House Rent Allowance"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="update_travel_allowance"
                    >
                      Travel Allowance
                    </label>
                    <Input
                      type="number"
                      name="earnings.travel_allowance"
                      value={updateFormData.earnings?.travel_allowance}
                      onChange={handleSalaryInputChange}
                      id="update_travel_allowance"
                      placeholder="Enter Employee Travel Allowance"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="update_medical_allowance"
                    >
                      Medical Allowance
                    </label>
                    <Input
                      type="number"
                      name="earnings.medical_allowance"
                      value={updateFormData.earnings?.medical_allowance}
                      onChange={handleSalaryInputChange}
                      id="update_medical_allowance"
                      placeholder="Enter  Medical Allowance"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="update_basket_of_benifits"
                    >
                      Basket of Benifits <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="earnings.basket_of_benifits"
                      value={updateFormData.earnings?.basket_of_benifits}
                      onChange={handleSalaryInputChange}
                      id="update_basket_of_benifits"
                      placeholder="Enter Employee Basket of Benifits"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="update_performance_bonus"
                    >
                      Performance Bonus
                    </label>
                    <Input
                      type="number"
                      name="earnings.performance_bonus"
                      value={updateFormData.earnings?.performance_bonus}
                      onChange={handleSalaryInputChange}
                      id="update_performance_bonus"
                      placeholder="Enter Performance Bonus"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="update_other_allowances"
                    >
                      Other Allowance
                    </label>
                    <Input
                      type="number"
                      name="earnings.other_allowances"
                      value={updateFormData.earnings?.other_allowances}
                      onChange={handleSalaryInputChange}
                      id="update_other_allowances"
                      placeholder="Enter Other Allowance"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="update_conveyance"
                    >
                      Conveyance
                    </label>
                    <Input
                      type="number"
                      name="earnings.conveyance"
                      value={updateFormData.earnings?.conveyance}
                      onChange={handleSalaryInputChange}
                      id="update_conveyance"
                      placeholder="Enter Conveyance"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="update_deductions"
                >
                  Deduction
                </label>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="update_income_tax"
                    >
                      Income Tax
                    </label>
                    <Input
                      type="number"
                      name="deductions.income_tax"
                      value={updateFormData.deductions?.income_tax}
                      onChange={handleSalaryInputChange}
                      id="update_income_tax"
                      placeholder="Enter Employee Income Tax"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="update_esi"
                    >
                      Employees' State Insurance
                    </label>
                    <Input
                      type="number"
                      name="deductions.esi"
                      value={updateFormData.deductions?.esi}
                      onChange={handleSalaryInputChange}
                      id="update_esi"
                      placeholder="Enter Employees' State Insurance"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between space-x-4">
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="update_epf"
                    >
                      Employees' Provident Fund
                    </label>
                    <Input
                      type="number"
                      name="deductions.epf"
                      value={updateFormData.deductions?.epf}
                      onChange={handleSalaryInputChange}
                      id="update_epf"
                      placeholder="Enter Employees' Provident Fund"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                  <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="update_professional_tax"
                    >
                      Professional Tax
                    </label>
                    <Input
                      type="number"
                      name="deductions.professional_tax"
                      value={updateFormData.deductions?.professional_tax}
                      onChange={handleSalaryInputChange}
                      id="update_professional_tax"
                      placeholder="Enter Employees' Professional Tax"
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                    />
                  </div>
                </div>
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
                    htmlFor="delete_employee_name"
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
                    id="delete_employee_name"
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
export default Payroll;
