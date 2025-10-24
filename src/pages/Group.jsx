/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Select, Dropdown } from "antd";
import { IoMdMore } from "react-icons/io";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";
import { fieldSize } from "../data/fieldSize";

import CustomAlertDialog from "../components/alerts/CustomAlertDialog";

const Group = () => {
  const [groups, setGroups] = useState([]);
  const [TableGroups, setTableGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [currentUpdateGroup, setCurrentUpdateGroup] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deletionGroupName,setDeletionGroupName] = useState("")
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const onGlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  const [formData, setFormData] = useState({
    group_name: "",
    group_type: "",
    group_value: "",
    group_install: "",
    group_members: "",
    group_duration: "",
    start_date: "",
    end_date: "",
    minimum_bid: "",
    maximum_bid: "",
    commission: "1",
    group_commission: "5",
    incentives: "1",
    reg_fee: "",
    monthly_installment: "",
    weekly_installment: "",
    daily_installment: "",
    relationship_manager: "",
    app_display_vacany_seat: "",
  });
  const [errors, setErrors] = useState({});
  const [employees, setEmployees] = useState([]);
  const [updateFormData, setUpdateFormData] = useState({
    group_name: "",
    group_type: "",
    group_value: "",
    group_install: "",
    group_members: "",
    group_duration: "",
    start_date: "",
    end_date: "",
    minimum_bid: "",
    maximum_bid: "",
    commission: "",
    group_commission: "",
    incentives: "",
    reg_fee: "",
    monthly_installment: "",
    weekly_installment: "",
    daily_installment: "",
    relationship_manager: "",
    app_display_vacany_seat: "",
  });
  useEffect(() => {
    async function getEmployees() {
      try {
        const response = await api.get("/agent/get-employee");
        const responseData = response.data?.employee;
        setEmployees(responseData ? responseData : []);
      } catch (error) {
        setEmployees([]);
        console.log("Error Fetching Employees");
      }
    }
    getEmployees();
  }, []);
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/group/get-group-admin");
        setGroups(response.data);
        const formattedData = response.data.map((group, index) => ({
          _id: group?._id,
          id: index + 1,
          name: group?.group_name,
          type:
            group?.group_type.charAt(0).toUpperCase() +
            group?.group_type.slice(1) +
            " Group",
          value: group?.group_value,
          monthly_installment: group.monthly_installment,
          weekly_installment: group.weekly_installment,
          daily_installment: group.daily_installment,
          relationship_manager: group.relationship_manager?.name || "N/A",
          installment: group.group_install,
          incentives: group.incentives,
          members: group?.group_members,
          app_display_vacany_seat: group?.app_display_vacany_seat,
          date: group?.createdAt,
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
                    {
                      key: "3",
                      label: (
                        <div
                          onClick={() => handleShareClick(group?._id)}
                          className=" text-blue-600 "
                        >
                          Copy
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
    fetchGroups();
  }, [reloadTrigger]);
  const handleShareClick = (groupId) => {
    if (!groupId) {
      console.error("Missing or invalid groupId");
      return;
    }
    // window.open(`/enrollment-request-form/?group_id=${groupId}`, "_blank");
    // navigator.clipboard.writeText(
    //   location.origin + `/enrollment-request-form/?group_id=${groupId}`
    // );
    const baseUrl = "http://prod-chit.s3-website.eu-north-1.amazonaws.com";
    const fullUrl = `${baseUrl}/enrollment-request-form/?group_id=${groupId}`;
    // navigator.clipboard.writeText(fullUrl);
    window.open(fullUrl, "_blank");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // apply validation here
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

    const data = type === "addGroup" ? formData : updateFormData;

    if (!data.group_name.trim()) {
      newErrors.group_name = "Group Name is required";
    }

    if (!data.group_type) {
      newErrors.group_type = "Group Type is required";
    }
    if (!data.group_value) {
      newErrors.group_value = "Group Value is required";
    } else if (isNaN(data.group_value) || data.group_value <= 0) {
      newErrors.group_value = "Group Value must be greater than zero (no";
    }

    if (!data.group_install) {
      newErrors.group_install = "Group Installment Amount is required";
    } else if (
      !data.group_install ||
      isNaN(data.group_install) ||
      data.group_install <= 0
    ) {
      newErrors.group_install =
        "Group Installment Amount must be greater than zero (no symbols).";
    }

    if (!data.group_members) {
      newErrors.group_members = "Group Members is required";
    } else if (
      !data.group_members ||
      isNaN(data.group_members) ||
      data.group_members <= 0
    ) {
      newErrors.group_members =
        "Group Members must be greater than zero (no symbols).";
    }
    if (!data.relationship_manager) {
      newErrors.relationship_manager = "Relationship Manager is required";
    }
    if (!data.monthly_installment) {
      newErrors.monthly_installment = "Monthly Installment is required";
    }
    if (!data.weekly_installment) {
      newErrors.weekly_installment = "Weekly Installment is required";
    }
    if (!data.daily_installment) {
      newErrors.daily_installment = "Daily Installment is required";
    }
    if (!data.group_duration) {
      newErrors.group_duration = "Group Duration is required";
    } else if (
      !data.group_duration ||
      isNaN(data.group_duration) ||
      data.group_duration <= 0
    ) {
      newErrors.group_duration =
        "Group Duration must be greater than zero (no symbols).";
    }

    if (!data.reg_fee) {
      newErrors.reg_fee = "Registration Fee is required";
    } else if (!data.reg_fee || isNaN(data.reg_fee) || data.reg_fee < 0) {
      newErrors.reg_fee =
        "Registration Fee must be a zero or greater than zero (no symbols).";
    }

    if (!data.start_date) {
      newErrors.start_date = "Start Date is required";
    }
    if(!data.app_display_vacany_seat){
      newErrors.app_display_vacany_seat = "Please Enter Vacant Seat" 
    }

    if (formData.end_date && !data.end_date) {
      newErrors.end_date = "End Date is required";
    } else if (
      formData.end_date &&
      new Date(data.end_date) < new Date(data.start_date)
    ) {
      newErrors.end_date = "End Date cannot be earlier than Start Date";
    }

    if (!data.minimum_bid) {
      newErrors.minimum_bid = "Minimum Bid is required";
    } else if (
      !data.minimum_bid ||
      isNaN(data.minimum_bid) ||
      data.minimum_bid <= 0
    ) {
      newErrors.minimum_bid =
        "Minimum Bid must be greater than zero (no symbols).";
    }

    if (!data.maximum_bid) {
      newErrors.maximum_bid = "Maximum Bid is required";
    } else if (
      !data.maximum_bid ||
      isNaN(data.maximum_bid) ||
      data.maximum_bid <= 0
    ) {
      newErrors.maximum_bid =
        "Maximum Bid must be greater than zero (no symbols).";
    } else if (parseFloat(data.maximum_bid) < parseFloat(data.minimum_bid)) {
      newErrors.maximum_bid =
        "Maximum Bid must be greater than or equal to Minimum Bid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm("addGroup");
    try {
      if (isValid) {
        const response = await api.post("/group/add-group", formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Group Added Successfully",
          type: "success",
        });

        setShowModal(false);
        setFormData({
          group_name: "",
          group_type: "",
          group_value: "",
          group_install: "",
          group_members: "",
          group_duration: "",
          group_commission: "5",
          start_date: "",
          end_date: "",
          minimum_bid: "",
          maximum_bid: "",
          commission: "",
          incentives: "",
          relationship_manager: "",
          monthly_installment: "",
          app_display_vacany_seat: "",
        });
      } else {
        console.log(errors);
      }
    } catch (error) {
      console.error("Error adding group:", error);
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteModalOpen = async (groupId) => {
    try {
      const response = await api.get(`/group/get-by-id-group/${groupId}`);
      setCurrentGroup(response.data);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching group:", error);
    }
  };

  const handleUpdateModalOpen = async (groupId) => {
    try {
      const response = await api.get(`/group/get-by-id-group/${groupId}`);
      const groupData = response.data;
      const formattedStartDate = groupData?.start_date?.split("T")[0];
      const formattedEndDate = groupData?.end_date?.split("T")[0];
      setCurrentUpdateGroup(response.data);
      setUpdateFormData({
        group_name: response?.data?.group_name,
        group_type: response?.data?.group_type,
        group_value: response?.data?.group_value,
        group_install: response?.data?.group_install,
        group_members: response?.data?.group_members,
        group_duration: response?.data?.group_duration,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        minimum_bid: response?.data?.minimum_bid,
        maximum_bid: response?.data?.maximum_bid,
        commission: response?.data?.commission,
        group_commission: response?.data?.group_commission,
        incentives: response?.data?.incentives,
        reg_fee: response?.data?.reg_fee,
        relationship_manager: response?.data?.relationship_manager?._id,
        monthly_installment: response?.data?.monthly_installment,
        weekly_installment: response?.data?.weekly_installment,
        daily_installment: response?.data?.daily_installment,
        app_display_vacany_seat: response?.data?.app_display_vacany_seat,
      });
      setShowModalUpdate(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching group:", error);
    }
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

  const handleAntInputDSelect = (field, value) => {
    setUpdateFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    setErrors({ ...errors, [field]: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUpdateFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors({ ...errors, [name]: "" });
  };

  const handleDeleteGroup = async (e) => {
    
  console.log(currentGroup.group_name,"hhkkljl" ,deletionGroupName)
    if (currentGroup && deletionGroupName.toString().trim() === currentGroup.group_name ) {
      try {
        await api.delete(`/group/delete-group/${currentGroup._id}`);
        setAlertConfig({
          message: "Group deleted successfully",
          type: "success",
          visibility: true,
        });
        setReloadTrigger((prev) => prev + 1);
        setShowModalDelete(false);
        setCurrentGroup(null);
      } catch (error) {
        console.error("Error deleting group:", error);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const isValid = validateForm();

    try {
      if (isValid) {
        await api.put(
          `/group/update-group/${currentUpdateGroup._id}`,
          updateFormData
        );
        setShowModalUpdate(false);
        setAlertConfig({
          message: "Group updated successfully",
          type: "success",
          visibility: true,
        });
        setReloadTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "name", header: "Group Name" },
    { key: "type", header: "Group Type" },
    { key: "value", header: "Group Value" },
    { key: "members", header: "Group Members" },
    { key: "installment", header: "Group Installment" },
    { key: "daily_installment", header: "Daily Installment" },
    {key: "app_display_vacany_seat", header: "Vacant Seat"},
    { key: "weekly_installment", header: "Weekly Installment" },
    { key: "monthly_installment", header: "Monthly Installment" },
    { key: "relationship_manager", header: "Relationship Manager" },
    { key: "action", header: "Action" },
  ];

  return (
    <>
      <div>
        <Navbar
          visibility={true}
          onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
        />

        <CustomAlertDialog
          type={alertConfig.type}
          isVisible={alertConfig.visibility}
          message={alertConfig.message}
          onClose={() =>
            setAlertConfig((prev) => ({ ...prev, visibility: false }))
          }
        />
        <div className="flex mt-20">
          <Sidebar />

          <div className="flex-grow p-7">
            <div className="mt-6 mb-8">
              <div className="flex justify-between items-center w-full">
                <h1 className="text-2xl font-semibold">Groups</h1>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add Group
                </button>
              </div>
            </div>

            {TableGroups.length > 0 && !isLoading ? (
              <DataTable
                catcher="_id"
                updateHandler={handleUpdateModalOpen}
                data={filterOption(TableGroups, searchText)}
                columns={columns}
                exportedPdfName={`Groups`}
                exportedFileName={`Groups.csv`}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={TableGroups.length <= 0}
                data={"Group Data"}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"></div>
          </div>
        </div>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Add Group</h3>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Group Name <span className="text-red-500 ">*</span>
                </label>
                <input
                  type="text"
                  name="group_name"
                  value={formData.group_name}
                  onChange={handleChange}
                  id="name"
                  placeholder="Enter the Group Name"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.group_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.group_name}
                  </p>
                )}
              </div>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="category"
                >
                  Group Type <span className="text-red-500 ">*</span>
                </label>
                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select or Search Group Type"
                  popupMatchSelectWidth={false}
                  showSearch
                  name="group_type"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={formData?.group_type || undefined}
                  onChange={(value) => handleAntDSelect("group_type", value)}
                >
                  {["Divident", "Double"].map((gType) => (
                    <Select.Option key={gType} value={gType.toLowerCase()}>
                      {gType}
                    </Select.Option>
                  ))}
                </Select>
                {errors.group_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.group_type}
                  </p>
                )}
              </div>
              <div className="flex flex-row justify-between space-x-4">
              <div className="w-1/2">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="category"
                >
                  Relationship Manager <span className="text-red-500 ">*</span>
                </label>
                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select or Search Relationship Manager"
                  popupMatchSelectWidth={false}
                  showSearch
                  name="relationship_manager"
                  filterOption={(input, option) => {
                    const text = `${option.children}`; // Coerce children to string
                    return text.toLowerCase().includes(input.toLowerCase());
                  }}
                  value={formData?.relationship_manager || undefined}
                  onChange={(value) =>
                    handleAntDSelect("relationship_manager", value)
                  }
                >
                  {(Array.isArray(employees) ? employees : []).map(
                    (employee) => (
                      <Select.Option key={employee?._id} value={employee?._id}>
                        {employee?.name} | {employee?.phone_number}
                      </Select.Option>
                    )
                  )}
                </Select>
                {errors.relationship_manager && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.relationship_manager}
                  </p>
                )}
              </div>
              <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Vacant Seat <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="app_display_vacany_seat"
                    value={formData.app_display_vacany_seat}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Vacant Seat"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.app_display_vacany_seat && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.app_display_vacany_seat}
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
                    Group Value <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="group_value"
                    value={formData.group_value}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Group Value"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.group_value && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.group_value}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Group Installment Amount{" "}
                    <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="group_install"
                    value={formData.group_install}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Group Installment Amount"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.group_install && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.group_install}
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
                    Group Members <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="group_members"
                    value={formData.group_members}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Group Members"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.group_members && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.group_members}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Group Duration <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="group_duration"
                    value={formData.group_duration}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Group Duration"
                    required
                    className={` no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.group_duration && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.group_duration}
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
                    Daily Installment <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="daily_installment"
                    value={formData.daily_installment}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Daily Installment"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.daily_installment && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.daily_installment}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Weekly Installment <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="weekly_installment"
                    value={formData.weekly_installment}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Weekly Installment"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.weekly_installment && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.weekly_installment}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="monthly_install"
                  >
                    Monthly Installment <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="text"
                    name="monthly_installment"
                    value={formData.monthly_installment}
                    onChange={handleChange}
                    id="monthly_install"
                    placeholder="Enter Monthly Installment"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.monthly_installment && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.monthly_installment}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Registration Fee <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="reg_fee"
                    value={formData.reg_fee}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Registration Fee"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.reg_fee && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.reg_fee}
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
                    Start Date <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    id="date"
                    placeholder="Enter the Date"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.start_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.start_date}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    id="date"
                    placeholder="Enter the Date"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.end_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.end_date}
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
                    Minimum Bid <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="minimum_bid"
                    value={formData.minimum_bid}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Minimum Bid"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.minimum_bid && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.minimum_bid}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Maximum Bid <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="maximum_bid"
                    value={formData.maximum_bid}
                    onChange={handleChange}
                    id="text"
                    placeholder="Enter Maximum Bid"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.maximum_bid && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.maximum_bid}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Agent Commission %
                  </label>
                  <input
                    type="number"
                    name="commission"
                    value={formData.commission}
                    onChange={handleChange}
                    placeholder="Enter Commission"
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>

                <div className="w-1/2">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Company Commission %
                  </label>
                  <input
                    type="number"
                    name="group_commission"
                    value={formData.group_commission}
                    onChange={handleChange}
                    placeholder="Enter Group Commission"
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>

                <div className="w-1/2">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Employee Incentives %
                  </label>
                  <input
                    type="text"
                    name="incentives"
                    value={formData.incentives}
                    onChange={handleChange}
                    placeholder="Enter Incentives"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
              </div>

              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
                >
                  Save Group
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
              Update Group
            </h3>
            <form className="space-y-6" onSubmit={handleUpdate} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Group Name <span className="text-red-500 ">*</span>
                </label>
                <input
                  type="text"
                  name="group_name"
                  value={updateFormData.group_name}
                  onChange={handleInputChange}
                  id="name"
                  placeholder="Enter the Group Name"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.group_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.group_name}
                  </p>
                )}
              </div>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="category"
                >
                  Group Type <span className="text-red-500 ">*</span>
                </label>

                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select or Search Group Type"
                  popupMatchSelectWidth={false}
                  showSearch
                  name="group_type"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={updateFormData?.group_type || undefined}
                  onChange={(value) =>
                    handleAntInputDSelect("group_type", value)
                  }
                >
                  {["Divident", "Double"].map((gType) => (
                    <Select.Option key={gType} value={gType.toLowerCase()}>
                      {gType}
                    </Select.Option>
                  ))}
                </Select>
                {errors.group_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.group_type}
                  </p>
                )}
              </div>
              <div className="flex flex-row justify-between space-x-4">
              <div className="w-1/2">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="category"
                >
                  Relationship Manager <span className="text-red-500 ">*</span>
                </label>
                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select or Search Relationship Manager"
                  popupMatchSelectWidth={false}
                  showSearch
                  name="relationship_manager"
                  filterOption={(input, option) => {
                    const text = `${option.children}`; // Coerce children to string
                    return text.toLowerCase().includes(input.toLowerCase());
                  }}
                  value={updateFormData?.relationship_manager || undefined}
                  onChange={(value) =>
                    handleAntInputDSelect("relationship_manager", value)
                  }
                >
                  {(Array.isArray(employees) ? employees : []).map(
                    (employee) => (
                      <Select.Option key={employee?._id} value={employee?._id}>
                        {employee?.name} | {employee?.phone_number}
                      </Select.Option>
                    )
                  )}
                </Select>
                {errors.relationship_manager && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.relationship_manager}
                  </p>
                )}
              </div>
              <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Vacant Seat <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="app_display_vacany_seat"
                    value={updateFormData.app_display_vacany_seat}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter vacant seat"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.app_display_vacany_seat && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.app_display_vacany_seat}
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
                    Group Value <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="group_value"
                    value={updateFormData.group_value}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Group Value"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.group_value && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.group_value}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Group Installment Amount{" "}
                    <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="group_install"
                    value={updateFormData.group_install}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Group Installment Amount"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.group_install && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.group_install}
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
                    Group Members <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="group_members"
                    value={updateFormData.group_members}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Group Members"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.group_members && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.group_members}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Group Duration <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="group_duration"
                    value={updateFormData.group_duration}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Group Duration"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.group_duration && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.group_duration}
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
                    Daily Installment <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="daily_installment"
                    value={updateFormData.daily_installment}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Group Members"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.daily_installment && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.daily_installment}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Weekly Installment <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="weekly_installment"
                    value={updateFormData.weekly_installment}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Group Duration"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.weekly_installment && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.weekly_installment}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="monthly_install"
                  >
                    Monthly Installment <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="text"
                    name="monthly_installment"
                    value={updateFormData.monthly_installment}
                    onChange={handleInputChange}
                    id="monthly_install"
                    placeholder="Enter Monthly Installment"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.monthly_installment && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.monthly_installment}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="email"
                  >
                    Registration Fee <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="reg_fee"
                    value={updateFormData.reg_fee}
                    onChange={handleInputChange}
                    id="name"
                    placeholder="Enter the Registration Fee"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.reg_fee && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.reg_fee}
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
                    Start Date <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={updateFormData.start_date}
                    onChange={handleInputChange}
                    id="date"
                    placeholder="Enter the Date"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.start_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.start_date}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={updateFormData.end_date}
                    onChange={handleInputChange}
                    id="date"
                    placeholder="Enter the Date"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.end_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.end_date}
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
                    Minimum Bid % <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="minimum_bid"
                    value={updateFormData.minimum_bid}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Minimum Bid"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.minimum_bid && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.minimum_bid}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Maximum Bid % <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="maximum_bid"
                    value={updateFormData.maximum_bid}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Maximum Bid"
                    required
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                  {errors.maximum_bid && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.maximum_bid}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Agent Commission %
                  </label>
                  <input
                    type="number"
                    name="commission"
                    value={updateFormData.commission}
                    onChange={handleInputChange}
                    placeholder="Enter Commission"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>

                <div className="w-1/2">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Company Commission %
                  </label>
                  <input
                    type="number"
                    name="group_commission"
                    value={updateFormData.group_commission}
                    onChange={handleInputChange}
                    placeholder="Enter Group Commission"
                    className={`no-spinner bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Employee Incentives %
                  </label>
                  <input
                    type="text"
                    name="incentives"
                    value={updateFormData.incentives}
                    onChange={handleInputChange}
                    placeholder="Enter Incentives"
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  />
                </div>
              </div>

              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
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
              Delete Group
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
                      {currentGroup.group_name}
                    </span>{" "}
                    to confirm deletion.{" "}
                    <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="text"
                    id="groupName"
                    placeholder="Enter the Group Name"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    onChange={(e)=>setDeletionGroupName(e.target.value)}
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

export default Group;
