/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Input, Select, Dropdown } from "antd";
import { IoMdMore } from "react-icons/io";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";
import handleEnrollmentRequestPrint from "../components/printFormats/enrollmentRequestPrint";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { Link } from "react-router-dom";
import { fieldSize } from "../data/fieldSize";
const User = () => {
  const [users, setUsers] = useState([]);
  const [TableUsers, setTableUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUpdateUser, setCurrentUpdateUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState({});
  const [groups, setGroups] = useState([]);
  const [areas, setAreas] = useState([]);
  const [files, setFiles] = useState({});
  const [districts, setDistricts] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    address: "",
    pincode: "",
    adhaar_no: "",
    pan_no: "",
    customer_status: "inactive",
    track_source: "admin_panel",
    collection_area: "",
  });

  const [updateFormData, setUpdateFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    address: "",
    pincode: "",
    adhaar_no: "",
    pan_no: "",
    customer_status: "",
    title: "",
    gender: "",
    marital_status: "",
    dateofbirth: "",
    nationality: "",
    village: "",
    taluk: "",
    father_name: "",
    district: "",
    state: "",
    collection_area: "",
    alternate_number: "",
    referral_name: "",
    nominee_name: "",
    nominee_dateofbirth: "",
    nominee_phone_number: "",
    nominee_relationship: "",
    aadhar_frontphoto: "",
    aadhar_backphoto: "",
    pan_frontphoto: "",
    pan_backphoto: "",
    profilephoto: "",
    bank_name: "",
    bank_branch_name: "",
    bank_account_number: "",
    bank_IFSC_code: "",
    selected_plan: "",
  });

  const [searchText, setSearchText] = useState("");
  const GlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };

  useEffect(() => {
    const fetchCollectionArea = async () => {
      try {
        const response = await api.get(
          "/collection-area-request/get-collection-area-data"
        );

        setAreas(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchCollectionArea();
  }, [reloadTrigger]);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await api.get("/user/district");
        setDistricts(response.data?.data?.districts);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };

    fetchDistricts();
  }, [reloadTrigger]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/user/get-user");
        setUsers(response.data);
        const formattedData = response.data.map((group, index) => ({
          _id: group?._id,
          id: index + 1,
          name: group?.full_name,
          phone_number: group?.phone_number,
          address: group?.address,
          pincode: group?.pincode,
          customer_id: group?.customer_id,
          collection_area: group?.collection_area?.route_name,
          customer_status: group?.customer_status,
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
                          onClick={() => handleUpdateModalOpen(group?._id)}
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
                          onClick={() => handleDeleteModalOpen(group?._id)}
                        >
                          Delete
                        </div>
                      ),
                    },
                    {
                      key: "3",
                      label: (
                        <div
                          onClick={() =>
                            handleEnrollmentRequestPrint(group?._id)
                          }
                          className=" text-blue-600 "
                        >
                          Print
                        </div>
                      ),
                    },
                    {
                      key: "4",
                      label: (
                        <div
                          className={`cursor-pointer ${
                            group?.customer_status === "active"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                          onClick={() =>
                            handleCustomerStatus(
                              group?._id,
                              group?.customer_status
                            )
                          }
                        >
                          {group?.customer_status === "active"
                            ? "Deactivate"
                            : "Activate"}
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
        let fData = formattedData.map((ele) => {
          if (
            ele?.address &&
            typeof ele.address === "string" &&
            ele?.address?.includes(",")
          )
            ele.address = ele.address.replaceAll(",", " ");
          return ele;
        });
        if (!fData) setTableUsers(formattedData);
        if (!fData) setTableUsers(formattedData);
        setTableUsers(fData);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [reloadTrigger]);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const res = await api.get("group/get-group-admin");
        setGroups(res.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchGroupData();
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
  const handleAntInputDSelect = (field, value) => {
    setUpdateFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    setErrors({ ...errors, [field]: "" });
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
  const handleAntDSelectGroup = async (groupId) => {
    try {
      const response = await api.get(`/group/get-by-id-group/${groupId}`);
      setSelectedGroup(response.data);
    } catch (err) {
      console.error("Failed to fetch group:", err);
    }
  };
  const validateForm = (type) => {
    const newErrors = {};
    const data = type === "addCustomer" ? formData : updateFormData;
    const regex = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[6-9]\d{9}$/,
      pincode: /^\d{6}$/,
      adhaar: /^\d{12}$/,
      pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    };

    if (!data.full_name.trim()) {
      newErrors.full_name = "Full Name is required";
    }

    // if (!data.email) {
    //   newErrors.email = "Email is required";
    // } else
    if (data.email && !regex.email.test(data.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!data.phone_number) {
      newErrors.phone_number = "Phone number is required";
    } else if (!regex.phone.test(data.phone_number)) {
      newErrors.phone_number = "Invalid  phone number";
    }

    if (!data.password) {
      newErrors.password = "Password is required";
    }
    // else if (!regex.password.test(data.password)) {
    //   newErrors.password =
    //     "Password must contain at least 5 characters, one uppercase, one lowercase, one number, and one special character";
    // }

    if (!data.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!regex.pincode.test(data.pincode)) {
      newErrors.pincode = "Invalid pincode (6 digits required)";
    }

    if (!data.adhaar_no) {
      newErrors.adhaar_no = "Aadhar number is required";
    } else if (!regex.adhaar.test(data.adhaar_no)) {
      newErrors.adhaar_no = "Invalid Aadhar number (12 digits required)";
    }
    if (data.pan_no && !regex.pan.test(data.pan_no.toUpperCase())) {
      newErrors.pan_no = "Invalid PAN format (e.g., ABCDE1234F)";
    }

    if (!data.address.trim()) {
      newErrors.address = "Address is required";
    } else if (data.address.trim().length < 3) {
      newErrors.address = "Address should be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm("addCustomer");
    if (isValid) {
      try {
        const response = await api.post("/user/add-user", formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          type: "success",
          message: "User Added Successfully",
          visibility: true,
        });

        setShowModal(false);
        setErrors({});
        setFormData({
          full_name: "",
          email: "",
          phone_number: "",
          password: "",
          address: "",
          pincode: "",
          adhaar_no: "",
          pan_no: "",
          customer_status: "inactive",
          track_source: "admin-panel",
        });
      } catch (error) {
        console.error("Error adding user:", error);

        if (
          error.response &&
          error.response.data &&
          error.response.data.message &&
          error.response.data.message.toLowerCase().includes("phone number")
        ) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            phone_number: "Phone number already exists",
          }));
        }

        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          setAlertConfig({
            type: "error",
            message: `${error?.response?.data?.message}`,
            visibility: true,
          });
        } else {
          setAlertConfig({
            type: "error",
            message: "An unexpected error occurred. Please try again.",
            visibility: true,
          });
        }
      }
    }
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "customer_id", header: "Customer Id" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "address", header: "Customer Address" },
    { key: "pincode", header: "Customer Pincode" },
    { key: "collection_area", header: "Area" },
    { key: "customer_status", header: "Customer Status" },
    { key: "action", header: "Action" },
  ];

  const filteredUsers = users.filter((user) =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteModalOpen = async (userId) => {
    try {
      const response = await api.get(`/user/get-user-by-id/${userId}`);
      setCurrentUser(response.data);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleUpdateModalOpen = async (userId) => {
    try {
      const response = await api.get(`/user/get-user-by-id/${userId}`);
      setCurrentUpdateUser(response.data);
      setSelectedGroup(response?.data?.selected_plan);
      setUpdateFormData({
        full_name: response?.data?.full_name,
        email: response?.data?.email,
        phone_number: response?.data?.phone_number,
        password: response?.data?.password,
        pincode: response?.data?.pincode,
        adhaar_no: response?.data?.adhaar_no,
        pan_no: response?.data?.pan_no,
        address: response?.data?.address,
        selected_plan: response?.data?.selected_plan?._id || "",
        title: response?.data?.title,
        father_name: response?.data?.father_name,
        gender: response?.data?.gender,
        marital_status: response?.data?.marital_status,
        dateofbirth: response?.data?.dateofbirth?.split("T")[0],
        nationality: response?.data?.nationality,
        village: response?.data?.village,
        taluk: response?.data?.taluk,
        district: response?.data?.district,
        state: response?.data?.state,
        collection_area: response?.data?.collection_area?._id || "",
        alternate_number: response?.data?.alternate_number,
        referral_name: response?.data?.referral_name,
        nominee_name: response?.data?.nominee_name,
        nominee_dateofbirth: response?.data?.nominee_dateofbirth?.split("T")[0],
        nominee_relationship: response?.data?.nominee_relationship,
        nominee_phone_number: response?.data?.nominee_phone_number,
        bank_name: response?.data?.bank_name,
        bank_branch_name: response?.data?.bank_branch_name,
        bank_account_number: response?.data?.bank_account_number,
        bank_IFSC_code: response?.data?.bank_IFSC_code,
        aadhar_frontphoto: response?.data?.aadhar_frontphoto,
        aadhar_backphoto: response?.data?.aadhar_backphoto,
        pan_frontphoto: response?.data?.pan_frontphoto,
        pan_backphoto: response?.data?.pan_backphoto,
        profilephoto: response?.data?.profilephoto,
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
    setErrors((prevData) => ({
      ...prevData,
      [name]: "",
    }));
  };

  const handleDeleteUser = async () => {
    if (currentUser) {
      try {
        await api.delete(`/user/delete-user/${currentUser._id}`);

        setAlertConfig({
          visibility: true,
          message: "User deleted successfully",
          type: "success",
        });
        setReloadTrigger((prev) => prev + 1);
        setShowModalDelete(false);
        setCurrentUser(null);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      setUpdateFormData((prevState) => ({
        ...prevState,
        [name]: file,
      }));
    }
  };

  const handleCustomerStatus = async (id, currentStatus) => {
    try {
      if (!id) {
        console.warn("No user ID provided");
        return;
      }

      const newStatus = currentStatus === "active" ? "inactive" : "active";

      const response = await api.put(`/user/update-user/${id}`, {
        customer_status: newStatus,
      });

      if (response.status === 200) {
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: `User status has been successfully updated to ${newStatus}`,
          type: "success",
        });
        console.info(
          `Customer status updated to ${newStatus} for user ID:`,
          id
        );
      } else {
        console.warn("Failed to update customer status:", response?.data);
      }
    } catch (err) {
      console.error("Error updating customer status:", err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const fmData = new FormData();

      Object.entries(updateFormData).forEach(([key, value]) => {
        if (key === "selected_plan" && selectedGroup?._id) {
          fmData.append("selected_plan", selectedGroup._id);
        } else if (value) {
          fmData.append(key, value);
        }
      });

      await api.put(`/user/update-user/${currentUpdateUser?._id}`, fmData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowModalUpdate(false);
      setReloadTrigger((prev) => prev + 1);
      setAlertConfig({
        visibility: true,
        message: "User Updated Successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      setAlertConfig({
        visibility: true,
        message:
          error?.response?.data?.message ||
          "An unexpected error occurred. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <>
      <div>
        <div className="flex mt-20">
          <Sidebar />
          <Navbar
            onGlobalSearchChangeHandler={GlobalSearchChangeHandler}
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
                <h1 className="text-2xl font-semibold">Customers</h1>

                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add Customer
                </button>
              </div>
            </div>
            {TableUsers?.length > 0 && !isLoading ? (
              <DataTable
                catcher="_id"
                updateHandler={handleUpdateModalOpen}
                data={filterOption(TableUsers, searchText)}
                columns={columns}
                exportedFileName={`Customers-${
                  TableUsers.length > 0
                    ? TableUsers[0].name +
                      " to " +
                      TableUsers[TableUsers.length - 1].name
                    : "empty"
                }.csv`}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={TableUsers.length <= 0}
                data="Customer Data"
              />
            )}
          </div>
        </div>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Add Customer
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Full Name <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="full_name"
                  value={formData?.full_name}
                  onChange={handleChange}
                  id="name"
                  placeholder="Enter the Full Name"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.full_name && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.full_name}
                  </p>
                )}
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Email
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
                    Phone Number <span className="text-red-500 ">*</span>
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
                    htmlFor="date"
                  >
                    Pan Number
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
                {errors.address && (
                  <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="area"
                >
                  Collection Area
                </label>
                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select Or Search Collection Area"
                  popupMatchSelectWidth={false}
                  name="collection_area"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  value={formData?.collection_area || undefined}
                  onChange={(value) =>
                    handleAntDSelect("collection_area", value)
                  }
                >
                  {areas.map((area) => (
                    <Select.Option key={area._id} value={area._id}>
                      {area.route_name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Save Customer
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
              Update Customer
            </h3>
            <form className="space-y-6" onSubmit={handleUpdate} noValidate>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="group-plan"
                >
                  Change Group name
                </label>

                <Select
                  id="group-plan"
                  name="selectedPlan"
                  value={selectedGroup?._id || undefined}
                  onChange={handleAntDSelectGroup}
                  placeholder="Select Group"
                  className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                  showSearch
                  popupMatchSelectWidth={false}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {groups.map((group) => (
                    <Select.Option key={group._id} value={group._id}>
                      {group.group_name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor=""
                  >
                    Group Type
                  </label>
                  <Input
                    type="text"
                    value={selectedGroup?.group_type || ""}
                    id="name"
                    placeholder="Group Type"
                    readOnly
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>

                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor=""
                  >
                    Group Value
                  </label>
                  <Input
                    type="text"
                    name=""
                    value={selectedGroup?.group_value}
                    id="name"
                    placeholder="Group Value"
                    required
                    readOnly
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor=""
                  >
                    Group Installment
                  </label>
                  <Input
                    type="text"
                    name=""
                    value={selectedGroup?.group_install}
                    onChange={handleInputChange}
                    id="name"
                    placeholder="Group Installment"
                    required
                    readOnly
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>

                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor=""
                  >
                    Group Duration
                  </label>
                  <Input
                    type="text"
                    name=""
                    value={selectedGroup?.group_duration}
                    onChange={handleInputChange}
                    id="name"
                    placeholder="Chit Period"
                    required
                    readOnly
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="title"
                >
                  Title
                </label>

                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select Title"
                  popupMatchSelectWidth={false}
                  showSearch
                  name="title"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={updateFormData?.title || undefined}
                  onChange={(value) => handleAntInputDSelect("title", value)}
                >
                  <Select.Option value="">Select Title</Select.Option>
                  {["Mr", "Ms", "Mrs", "M/S", "Dr"].map((cTitle) => (
                    <Select.Option key={cTitle} value={cTitle}>
                      {cTitle}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Full Name <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="full_name"
                  value={updateFormData?.full_name}
                  onChange={handleInputChange}
                  id="name"
                  placeholder="Enter the Full Name"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.full_name && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={updateFormData?.email}
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
                    value={updateFormData?.phone_number}
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
               
                {/* <div className="w-1/2">
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
                </div> */}
               
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Pincode <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    name="pincode"
                    value={updateFormData?.pincode}
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
                    Aadhar Number <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    name="adhaar_no"
                    value={updateFormData?.adhaar_no}
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
                    Pan Number
                  </label>
                  <Input
                    type="text"
                    name="pan_no"
                    value={updateFormData?.pan_no}
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
                  htmlFor="address"
                >
                  Address <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="address"
                  value={updateFormData?.address}
                  onChange={handleInputChange}
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
                    htmlFor="email"
                  >
                    Father Name
                  </label>
                  <Input
                    type="text"
                    name="father_name"
                    value={updateFormData?.father_name}
                    onChange={handleInputChange}
                    id="father-name"
                    placeholder="Enter the Father name"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="area"
                  >
                    Collection Area
                  </label>

                  <Select
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    placeholder="Select Or Search Collection Area"
                    popupMatchSelectWidth={false}
                    showSearch
                    name="collection_area"
                    filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={updateFormData?.collection_area || undefined}
                    onChange={(value) =>
                      handleAntInputDSelect("collection_area", value)
                    }
                  >
                    <Select.Option value="">
                      Select or Search Collection Area
                    </Select.Option>
                    {areas.map((area) => (
                      <Select.Option key={area._id} value={area._id}>
                        {area.route_name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Customer Date of Birth
                  </label>
                  <Input
                    type="date"
                    name="dateofbirth"
                    value={
                      updateFormData?.dateofbirth
                        ? new Date(updateFormData?.dateofbirth || "")
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                    id="date"
                    placeholder="Enter the Date of Birth"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>

                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="gender"
                  >
                    Gender
                  </label>
                  {/* <select
                    name="gender"
                    value={updateFormData?.gender || ""}
                    onChange={handleInputChange}
                    id="gender"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
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
                    {["Male", "Female"].map((gType) => (
                      <Select.Option key={gType} value={gType}>
                        {gType}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="marital-status"
                  >
                    Marital Status
                  </label>
                  {/* <select
                    name="marital_status"
                    value={updateFormData?.marital_status || ""}
                    onChange={handleInputChange}
                    id="marital-status"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  >
                    <option value="">Select Marital Status</option>
                    <option value="Married">Married</option>
                    <option value="Unmarried">Unmarried</option>
                  </select> */}
                  <Select
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    placeholder="Select Marital Status"
                    popupMatchSelectWidth={false}
                    showSearch
                    name="marital_status"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={updateFormData?.marital_status || undefined}
                    onChange={(value) =>
                      handleAntInputDSelect("marital_status", value)
                    }
                  >
                    {["Married", "Unmarried", "Widow", "Divorced"].map(
                      (mStatus) => (
                        <Select.Option key={mStatus} value={mStatus}>
                          {mStatus}
                        </Select.Option>
                      )
                    )}
                  </Select>
                </div>

                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="referral-name"
                  >
                    Referral Name
                  </label>
                  <Input
                    type="text"
                    name="referral_name"
                    value={updateFormData?.referral_name}
                    onChange={handleInputChange}
                    id="referral-name"
                    placeholder="Enter the Referral Name"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="nationality"
                  >
                    Nationality
                  </label>

                  <Select
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    placeholder="Select Nationality"
                    popupMatchSelectWidth={false}
                    showSearch
                    name="nationality"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={updateFormData?.nationality || undefined}
                    onChange={(value) =>
                      handleAntInputDSelect("nationality", value)
                    }
                  >
                    {["Indian", "Other"].map((nation) => (
                      <Select.Option key={nation} value={nation}>
                        {nation}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="alternate-number"
                  >
                    Alternate Phone Number
                  </label>
                  <Input
                    type="number"
                    name="alternate_number"
                    value={updateFormData?.alternate_number}
                    onChange={handleInputChange}
                    id="alternate-number"
                    placeholder="Enter the Alternate Phone number"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="village"
                  >
                    Village
                  </label>
                  <Input
                    type="text"
                    name="village"
                    value={updateFormData?.village}
                    onChange={handleInputChange}
                    id="village"
                    placeholder="Enter the Village"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>

                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="taluk"
                  >
                    Taluk
                  </label>
                  <Input
                    type="text"
                    name="taluk"
                    value={updateFormData?.taluk}
                    onChange={handleInputChange}
                    id="taluk"
                    placeholder="Enter the taluk"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
              </div>

           
              <div className="flex flex-row justify-between space-x-4">
     
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="state"
                  >
                    State
                  </label>

                  <Select
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    placeholder="Select State"
                    showSearch
                    name="state"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={updateFormData?.state || undefined}
                    onChange={(value) => handleAntInputDSelect("state", value)}
                  >
                    {["Karnataka", "Maharashtra", "Tamil Nadu"].map((state) => (
                      <Select.Option key={state} value={state}>
                        {state}
                      </Select.Option>
                    ))}
                  </Select>
                </div>


                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="district"
                  >
                    District
                  </label>

                  {updateFormData?.state === "Karnataka" ? (
                    <Select
                      className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                      placeholder="Select District"
                      showSearch
                      name="district"
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={updateFormData?.district || undefined}
                      onChange={(value) =>
                        handleAntInputDSelect("district", value)
                      }
                    >
                      <Select.Option value="">Select District</Select.Option>
                      {districts.map((district, index) => (
                        <Select.Option key={index} value={district}>
                          {district}
                        </Select.Option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      type="text"
                      name="district"
                      value={updateFormData?.district}
                      onChange={handleInputChange}
                      placeholder="Enter District"
                      className="w-full p-2 h-14 border rounded-md sm:text-lg text-sm bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="nominee"
                  >
                    Nominee Name
                  </label>
                  <Input
                    type="text"
                    name="nominee_name"
                    value={updateFormData?.nominee_name}
                    onChange={handleInputChange}
                    id="nominee"
                    placeholder="Enter the Nominee Name"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>

                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="nominee-date"
                  >
                    Nominee Date of Birth
                  </label>
                  <Input
                    type="date"
                    name="nominee_dateofbirth"
                    value={
                      updateFormData?.nominee_dateofbirth
                        ? new Date(updateFormData?.nominee_dateofbirth)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                    id="nominee-date"
                    placeholder="Enter the Nominee Date of Birth"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="nominee-relationship"
                  >
                    Nominee Relationship
                  </label>

                  <Select
                    className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                    placeholder="Select Nominee Relationship"
                    popupMatchSelectWidth={false}
                    showSearch
                    name="nominee_relationship"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={updateFormData?.nominee_relationship || undefined}
                    onChange={(value) =>
                      handleAntInputDSelect("nominee_relationship", value)
                    }
                  >
                    {[
                      "Father",
                      "Mother",
                      "Brother/Sister",
                      "Spouse",
                      "Son/Daughter",
                      "Other",
                    ].map((nominee) => (
                      <Select.Option key={nominee} value={nominee}>
                        {nominee}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="nominee-phone-number"
                  >
                    Nominee Phone Number
                  </label>
                  <Input
                    type="number"
                    name="nominee_phone_number"
                    value={updateFormData?.nominee_phone_number}
                    onChange={handleInputChange}
                    id="nominee-phone-number"
                    placeholder="Enter the Nominee Phone number"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="aadhar-photo"
                  >
                    Aadhaar Front Photo
                  </label>
                  <Input
                    type="file"
                    name="aadhar_frontphoto"
                    onChange={handleFileChange}
                    id="aadhar-photo"
                    accept="image/*"
                    placeholder=" Upload Aadhaar Front Photo"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  <Link to={updateFormData?.aadhar_frontphoto} download>
                    <img
                      src={updateFormData?.aadhar_frontphoto}
                      alt="Aadhar Front"
                      className="w-56 mx-2 my-4 h-56"
                    />
                  </Link>
                </div>

                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="aadhar-backphoto"
                  >
                    Aadhaar Back Photo
                  </label>
                  <Input
                    type="file"
                    name="aadhar_backphoto"
                    onChange={handleFileChange}
                    id="aadhar-backphoto"
                    accept="image/*"
                    placeholder=" Upload Aadhaar Back Photo"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  <Link to={updateFormData?.aadhar_backphoto} download>
                    <img
                      src={updateFormData?.aadhar_backphoto}
                      alt="Aadhar Back"
                      className="w-56 mx-2 my-4 h-56"
                    />
                  </Link>
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="pan-photo"
                  >
                    Pan Front Photo
                  </label>
                  <Input
                    type="file"
                    name="pan_frontphoto"
                    onChange={handleFileChange}
                    id="pan-photo"
                    accept="image/*"
                    placeholder=" Upload Pan Front Photo"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  <Link to={updateFormData?.pan_frontphoto} download>
                    <img
                      src={updateFormData?.pan_frontphoto}
                      alt="Pan Front"
                      className="w-56 mx-2 my-4 h-56"
                    />
                  </Link>
                </div>

                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="pan-backphoto"
                  >
                    Pan Back Photo
                  </label>
                  <Input
                    type="file"
                    name="pan_backphoto"
                    onChange={handleFileChange}
                    id="pan-backphoto"
                    accept="image/*"
                    placeholder=" Upload Pan Back Photo"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  <Link to={updateFormData?.pan_backphoto} download>
                    <img
                      src={updateFormData?.pan_backphoto}
                      alt="Pan Back"
                      className="w-56 mx-2 my-4 h-56"
                    />
                  </Link>
                </div>
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="profile-photo"
                  >
                    Upload Profile Photo
                  </label>
                  <Input
                    type="file"
                    name="profilephoto"
                    onChange={handleFileChange}
                    id="profile-photo"
                    accept="image/*"
                    placeholder=" Upload Profile Photo"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  <Link to={updateFormData?.profilephoto} download>
                    <img
                      src={updateFormData?.profilephoto}
                      alt="Profile Photo"
                      className="w-full my-4 h-56 p-2"
                    />
                  </Link>
                </div>
                
              </div>

              <label
                className="block mb-2 text-sm font-medium text-gray-900"
                htmlFor=""
              >
                Bank Details
              </label>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="bank-name"
                  >
                    Bank Name
                  </label>
                  <Input
                    type="text"
                    name="bank_name"
                    value={updateFormData?.bank_name}
                    onChange={handleInputChange}
                    id="bank-name"
                    placeholder="Enter the Customer Bank Name"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>

                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="bank-branch-name"
                  >
                    Bank Branch Name
                  </label>
                  <Input
                    type="text"
                    name="bank_branch_name"
                    value={updateFormData?.bank_branch_name}
                    onChange={handleInputChange}
                    id="bank-branch-name"
                    placeholder="Enter the Bank Branch Name"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="account-number"
                  >
                    Bank Account Number
                  </label>
                  <Input
                    type="text"
                    name="bank_account_number"
                    value={updateFormData?.bank_account_number}
                    onChange={handleInputChange}
                    id="account-number"
                    placeholder="Enter the Customer Bank Account Number"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>

                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="ifsc"
                  >
                    Bank IFSC Code
                  </label>
                  <Input
                    type="text"
                    name="bank_IFSC_code"
                    value={updateFormData?.bank_IFSC_code}
                    onChange={handleInputChange}
                    id="ifsc"
                    placeholder="Enter the Bank IFSC Code"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
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
          isVisible={showModalDelete}
          onClose={() => {
            setShowModalDelete(false);
            setCurrentUser(null);
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Delete Customer
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
                      {currentUser.full_name}
                    </span>{" "}
                    to confirm deletion.{" "}
                    <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    id="groupName"
                    placeholder="Enter the User Full Name"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
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

export default User;
