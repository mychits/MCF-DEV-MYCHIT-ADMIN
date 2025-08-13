/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import SettingSidebar from "../components/layouts/SettingSidebar";
import { IoMdMore } from "react-icons/io";
import { Input,Dropdown } from "antd";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { fieldSize } from "../data/fieldSize";


const AdminAccessRights = () => {
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
  const [isLoading, setIsLoading] = useState(false);
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
    title: "",
    access_permissions: {
      view_dashboard: "",
      view_analytics: "",
      add_group: "",
      view_group: "",
      edit_group: "",
      delete_group: "",
      add_customer: "",
      view_customer: "",
      edit_customer: "",
      delete_customer: "",
      add_enrollment: "",
      delete_enrollment: "",
      view_enrollment: "",
      edit_enrollment: "",
      add_employee: "",
      view_employee: "",
      edit_employee: "",
      delete_employee: "",
      modify_payment_date: "",
      add_lead: "",
      view_lead: "",
      edit_lead: "",
      delete_lead: "",
      add_loan: "",
      view_loan: "",
      edit_loan: "",
      delete_loan: "",
      add_pigme: "",
      view_pigme: "",
      edit_pigme: "",
      delete_pigme: "",
      add_auction: "",
      view_auction: "",
      edit_auction: "",
      delete_auction: "",
      add_payment: "",
      view_payment: "",
      edit_payment: "",
      delete_payment: "",
      view_reports: "",
      view_daybook: "",
      view_group_report: "",
      view_all_customer_report: "",
      view_customer_report: "",
      view_receipt_report: "",
      view_auction_report: "",
      view_lead_report: "",
      view_pigme_report: "",
      view_loan_report: "",
      view_agent_report: "",
    },
  });

  const [updateFormData, setUpdateFormData] = useState({
    title: "",
    access_permissions: {
      view_dashboard: "",
      view_analytics: "",
      add_group: "",
      view_group: "",
      edit_group: "",
      delete_group: "",
      add_customer: "",
      view_customer: "",
      edit_customer: "",
      delete_customer: "",
      add_enrollment: "",
      delete_enrollment: "",
      view_enrollment: "",
      edit_enrollment: "",
      add_employee: "",
      view_employee: "",
      edit_employee: "",
      delete_employee: "",
      modify_payment_date: "",
      add_lead: "",
      view_lead: "",
      edit_lead: "",
      delete_lead: "",
      add_loan: "",
      view_loan: "",
      edit_loan: "",
      delete_loan: "",
      add_pigme: "",
      view_pigme: "",
      edit_pigme: "",
      delete_pigme: "",
      add_auction: "",
      view_auction: "",
      edit_auction: "",
      delete_auction: "",
      add_payment: "",
      view_payment: "",
      edit_payment: "",
      delete_payment: "",
      view_reports: "",
      view_daybook: "",
      view_group_report: "",
      view_all_customer_report: "",
      view_customer_report: "",
      view_receipt_report: "",
      view_auction_report: "",
      view_lead_report: "",
      view_pigme_report: "",
      view_loan_report: "",
      view_agent_report: "",
    },
  });
 useEffect(() => {
    const fetchAdminRights = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/admin-access-rights/get-all");
        setUsers(response.data);
        const formattedData = response.data.map((adminAccess, index) => ({
          _id: adminAccess?._id,
          id: index + 1,
          title: adminAccess?.title,
          action: (
            <div className="flex justify-center  gap-2">
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "1",
                      label: (
                        <div
                          className="text-green-600"
                          onClick={() => handleUpdateModalOpen(adminAccess?._id)}
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
                          onClick={() => handleDeleteModalOpen(adminAccess?._id)}
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
        console.error("Error fetching Admin Access data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminRights();
  }, [reloadTrigger]);

    useEffect(() => {
    const fetchAdminAccessRights = async () => {
      try {
        const response = await api.get(
          "/admin-access-rights/admin-access-rights"
        );
        setManagers(response.data);
      } catch (error) {
        console.error("Error fetching admin access rights:", error);
      }
    };
    fetchAdminAccessRights();
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
    const data = type === "addAccessRights" ? formData : updateFormData;

    if (!data.title.trim()) {
      newErrors.name = "Title is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValidate = validateForm("addAccessRights");

    try {
      if (isValidate) {
        const response = await api.post("/admin-access-rights/add", formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setShowModal(false);
        setReloadTrigger((prev) => prev + 1);
        setFormData({
          title: "",
          access_permissions: {
            view_dashboard: "",
            view_analytics: "",
            add_group: "",
            view_group: "",
            edit_group: "",
            delete_group: "",
            add_customer: "",
            view_customer: "",
            edit_customer: "",
            delete_customer: "",
            add_enrollment: "",
            view_enrollment: "",
            edit_enrollment: "",
            delete_enrollment: "",
            add_employee: "",
            view_employee: "",
            edit_employee: "",
            delete_employee: "",
            modify_payment_date: "",
            add_lead: "",
            view_lead: "",
            edit_lead: "",
            delete_lead: "",
            add_loan: "",
            view_loan: "",
            edit_loan: "",
            delete_loan: "",
            add_pigme: "",
            view_pigme: "",
            edit_pigme: "",
            delete_pigme: "",
            add_auction: "",
            view_auction: "",
            edit_auction: "",
            delete_auction: "",
            add_payment: "",
            view_payment: "",
            edit_payment: "",
            delete_payment: "",
            view_reports: "",
            view_daybook: "",
            view_group_report: "",
            view_all_customer_report: "",
            view_customer_report: "",
            view_receipt_report: "",
            view_auction_report: "",
            view_lead_report: "",
            view_pigme_report: "",
            view_loan_report: "",
            view_agent_report: "",
          },
        });

        setAlertConfig({
          visibility: true,
          message: "Access Rights Added Successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error adding Access Rights:", error);
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

  useEffect(() => {
    const fetchAdminRights = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/admin-access-rights/get-all");
        setUsers(response.data);
        const formattedData = response.data.map((adminAccess, index) => ({
          _id: adminAccess?._id,
          id: index + 1,
          title: adminAccess?.title,
          action: (
            <div className="flex justify-center  gap-2">
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "1",
                      label: (
                        <div
                          className="text-green-600"
                          onClick={() => handleUpdateModalOpen(adminAccess?._id)}
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
                          onClick={() => handleDeleteModalOpen(adminAccess?._id)}
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
        console.error("Error fetching Admin Access data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminRights();
  }, [reloadTrigger]);

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "title", header: "Admin Access Title" },
    { key: "action", header: "Action" },
  ];

  const filteredUsers = users.filter((user) =>
    user.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteModalOpen = async (userId) => {
    try {
      const response = await api.get(
        `/admin-access-rights/get-by-id/${userId}`
      );
      setCurrentUser(response.data);
      setShowModalDelete(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleUpdateModalOpen = async (userId) => {
    try {
      const response = await api.get(
        `/admin-access-rights/get-by-id/${userId}`
      );
      
      setCurrentUpdateUser(response.data);
      setUpdateFormData({
        title: response.data.title,
        access_permissions: {
          view_dashboard:
            response.data?.access_permissions?.view_dashboard === "true" ||
            response.data?.access_permission?.view_dashboard === true,
          view_analytics:
            response.data?.access_permissions?.view_analytics === "true" ||
            response.data?.access_permission?.view_analytics === true,
          add_group:
            response.data?.access_permissions?.add_group === "true" ||
            response.data?.access_permission?.add_group === true,
          view_group:
            response.data?.access_permissions?.view_group === "true" ||
            response.data?.access_permission?.view_group === true,
          edit_group:
            response.data?.access_permissions?.edit_group === "true" ||
            response.data?.access_permission?.edit_group === true,
          delete_group:
            response.data?.access_permissions?.delete_group === "true" ||
            response.data?.access_permission?.delete_group === true,
          add_customer:
            response.data?.access_permissions?.add_customer === "true" ||
            response.data?.access_permission?.add_customer === true,
          view_customer:
            response.data?.access_permissions?.view_customer === "true" ||
            response.data?.access_permission?.view_customer === true,
          edit_customer:
            response.data?.access_permissions?.edit_customer === "true" ||
            response.data?.access_permission?.edit_customer === true,
          delete_customer:
            response.data?.access_permissions?.delete_customer === "true" ||
            response.data?.access_permission?.delete_customer === true,
          add_enrollment:
            response.data?.access_permissions?.add_enrollment === "true" ||
            response.data?.access_permission?.add_enrollment === true,
          delete_enrollment:
            response.data?.access_permissions?.delete_enrollment === "true" ||
            response.data?.access_permission?.delete_enrollment === true,
          view_enrollment:
            response.data?.access_permissions?.view_enrollment === "true" ||
            response.data?.access_permission?.view_enrollment === true,
          edit_enrollment:
            response.data?.access_permissions?.edit_enrollment === "true" ||
            response.data?.access_permission?.edit_enrollment === true,
          add_employee:
            response.data?.access_permissions?.add_employee === "true" ||
            response.data?.access_permission?.add_employee === true,
          view_employee:
            response.data?.access_permissions?.view_employee === "true" ||
            response.data?.access_permission?.view_employee === true,
          edit_employee:
            response.data?.access_permissions?.edit_employee === "true" ||
            response.data?.access_permission?.edit_employee === true,
          delete_employee:
            response.data?.access_permissions?.delete_employee === "true" ||
            response.data?.access_permission?.delete_employee === true,
          modify_payment_date:
            response.data?.access_permissions?.modify_payment_date === "true" ||
            response.data?.access_permission?.modify_payment_date === true,
          add_lead:
            response.data?.access_permissions?.add_lead === "true" ||
            response.data?.access_permission?.add_lead === true,
          view_lead:
            response.data?.access_permissions?.view_lead === "true" ||
            response.data?.access_permission?.view_lead === true,
          edit_lead:
            response.data?.access_permissions?.edit_lead === "true" ||
            response.data?.access_permission?.edit_lead === true,
          delete_lead:
            response.data?.access_permissions?.delete_lead === "true" ||
            response.data?.access_permission?.delete_lead === true,
          add_loan:
            response.data?.access_permissions?.add_loan === "true" ||
            response.data?.access_permission?.add_loan === true,
          view_loan:
            response.data?.access_permissions?.view_loan === "true" ||
            response.data?.access_permission?.view_loan === true,
          edit_loan:
            response.data?.access_permissions?.edit_loan === "true" ||
            response.data?.access_permission?.edit_loan === true,
          delete_loan:
            response.data?.access_permissions?.delete_loan === "true" ||
            response.data?.access_permission?.delete_loan === true,
          add_pigme:
            response.data?.access_permissions?.add_pigme === "true" ||
            response.data?.access_permission?.add_pigme === true,
          view_pigme:
            response.data?.access_permissions?.view_pigme === "true" ||
            response.data?.access_permission?.view_pigme === true,
          edit_pigme:
            response.data?.access_permissions?.edit_pigme === "true" ||
            response.data?.access_permission?.edit_pigme === true,
          delete_pigme:
            response.data?.access_permissions?.delete_pigme === "true" ||
            response.data?.access_permission?.delete_pigme === true,
          add_auction:
            response.data?.access_permissions?.add_auction === "true" ||
            response.data?.access_permission?.add_auction === true,
          view_auction:
            response.data?.access_permissions?.view_auction === "true" ||
            response.data?.access_permission?.view_auction === true,
          edit_auction:
            response.data?.access_permissions?.edit_auction === "true" ||
            response.data?.access_permission?.edit_auction === true,
          delete_auction:
            response.data?.access_permissions?.delete_auction === "true" ||
            response.data?.access_permission?.delete_auction === true,
          add_payment:
            response.data?.access_permissions?.add_payment === "true" ||
            response.data?.access_permission?.add_payment === true,
          view_payment:
            response.data?.access_permissions?.view_payment === "true" ||
            response.data?.access_permission?.view_payment === true,
          edit_payment:
            response.data?.access_permissions?.edit_payment === "true" ||
            response.data?.access_permission?.edit_payment === true,
          delete_payment:
            response.data?.access_permissions?.delete_payment === "true" ||
            response.data?.access_permission?.delete_payment === true,
          view_reports:
            response.data?.access_permissions?.view_reports === "true" ||
            response.data?.access_permission?.view_reports === true,
          view_daybook:
            response.data?.access_permissions?.view_daybook === "true" ||
            response.data?.access_permission?.view_daybook === true,
          view_group_report:
            response.data?.access_permissions?.view_group_report === "true" ||
            response.data?.access_permission?.view_group_report === true,
          view_all_customer_report:
            response.data?.access_permissions?.view_all_customer_report ===
              "true" ||
            response.data?.access_permission?.view_all_customer_report === true,
          view_customer_report:
            response.data?.access_permissions?.view_customer_report ===
              "true" ||
            response.data?.access_permission?.view_customer_report === true,
          view_receipt_report:
            response.data?.access_permissions?.view_receipt_report === "true" ||
            response.data?.access_permission?.view_receipt_report === true,
          view_auction_report:
            response.data?.access_permissions?.view_auction_report === "true" ||
            response.data?.access_permission?.view_auction_report === true,
          view_lead_report:
            response.data?.access_permissions?.view_lead_report === "true" ||
            response.data?.access_permission?.view_lead_report === true,
          view_pigme_report:
            response.data?.access_permissions?.view_pigme_report === "true" ||
            response.data?.access_permission?.view_pigme_report === true,
          view_loan_report:
            response.data?.access_permissions?.view_loan_report === "true" ||
            response.data?.access_permission?.view_loan_report === true,
          view_agent_report:
            response.data?.access_permissions?.view_agent_report === "true" ||
            response.data?.access_permission?.view_agent_report === true,
        },
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
    if (currentUser) {
      try {
        await api.delete(
          `/admin-access-rights/delete-by-id/${currentUser._id}`
        );
        setShowModalDelete(false);
        setCurrentUser(null);
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Manager deleted successfully",
          type: "success",
        });
      } catch (error) {
        console.error("Error deleting manager:", error);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    try {
      if (isValid) {
        const response = await api.put(
          `/admin-access-rights/update-by-id/${currentUpdateUser._id}`,
          updateFormData
        );
        setShowModalUpdate(false);
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Designation Updated Successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error updating Designation:", error);
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

  useEffect(() => {
    const fetchAdminAccessRights = async () => {
      try {
        const response = await api.get(
          "/admin-access-rights/admin-access-rights"
        );
        setManagers(response.data);
      } catch (error) {
        console.error("Error fetching admin access rights:", error);
      }
    };
    fetchAdminAccessRights();
  }, [reloadTrigger]);

  return (
    <>
      <div>
        <div className="flex mt-20">
          <Navbar
            onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
            visibility={true}
          />
          <SettingSidebar />
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
                <h1 className="text-2xl font-semibold">Admin Access Rights</h1>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Create Access Role
                </button>
              </div>
            </div>
            {(TableAgents.length > 0 && !isLoading)? (
              <DataTable
                updateHandler={handleUpdateModalOpen}
                data={filterOption(TableAgents, searchText)}
                columns={columns}
                exportedPdfName={`Admin Access Rights`}
                exportedFileName={`Employees-${
                  TableAgents.length > 0
                    ? TableAgents[0].name +
                      " to " +
                      TableAgents[TableAgents.length - 1].name
                    : "empty"
                }.csv`}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={TableAgents.length <= 0}
                data="Admin Access Role Data"
              />
            )}
          </div>
        </div>

        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Create Access Role
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Title <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  id="title"
                  placeholder="Enter the title"
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
              <div className="mt-10">
                <label className="text-lg font-bold">Access Permissions</label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Dashboard
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_dashboard}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_dashboard: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_dashboard ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Analytics
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_analytics}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_analytics: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_analytics ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Add Group
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.add_group}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          add_group: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.add_group ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Group
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_group}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_group: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_group ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Edit Group
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.edit_group}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          edit_group: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.edit_group ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Delete Group
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.delete_group}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          delete_group: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.delete_group ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Add Customer
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.add_customer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          add_customer: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.add_customer ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Customer
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_customer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_customer: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_customer ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Edit Customer
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.edit_customer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          edit_customer: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.edit_customer ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Delete Customer
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.delete_customer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          delete_customer: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.delete_customer ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Add Enrollment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.add_enrollment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          add_enrollment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.add_enrollment ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Enrollment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_enrollment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_enrollment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_enrollment ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Edit Enrollment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.edit_enrollment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          edit_enrollment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.edit_enrollment ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Delete Enrollment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.delete_enrollment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          delete_enrollment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.delete_enrollment
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Add Employee
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.add_employee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          add_employee: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.add_employee ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Employee
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_employee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_employee: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_employee ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Edit Employee
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.edit_employee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          edit_employee: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.edit_employee ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Delete Employee
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.delete_employee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          delete_employee: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.delete_employee ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Modify Payment Date
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.modify_payment_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          modify_payment_date: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.modify_payment_date
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Add Lead
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.add_lead}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          add_lead: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.add_lead ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Lead
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_lead}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_lead: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_lead ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Edit Lead
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.edit_lead}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          edit_lead: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.edit_lead ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Delete Lead
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.delete_lead}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          delete_lead: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.delete_lead ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Add Loan
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.add_loan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          add_loan: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.add_loan ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Loan
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_loan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_loan: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_loan ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Edit Loan
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.edit_loan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          edit_loan: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.edit_loan ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Delete Loan
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.delete_loan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          delete_loan: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.delete_loan ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Add Pigme
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.add_pigme}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          add_pigme: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.add_pigme ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Pigme
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_pigme}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_pigme: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_pigme ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Edit Pigme
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.edit_pigme}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          edit_pigme: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.edit_pigme ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Delete Pigme
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.delete_pigme}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          delete_pigme: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.delete_pigme ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Add Auction
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.add_auction}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          add_auction: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.add_auction ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Auction
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_auction}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_auction: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_auction ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Edit Auction
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.edit_auction}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          edit_auction: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.edit_auction ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Delete Auction
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.delete_auction}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          delete_auction: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.delete_auction ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Add Payment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.add_payment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          add_payment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.add_payment ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Payment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_payment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_payment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_payment ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Edit Payment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.edit_payment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          edit_payment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.edit_payment ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  Delete Payment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.delete_payment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          delete_payment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.delete_payment ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Reports
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_reports}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_reports: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_reports ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Daybook
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_daybook}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_daybook: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_daybook ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Group Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_group_report}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_group_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_group_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View All Customer Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={
                      formData.access_permissions.view_all_customer_report
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_all_customer_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_all_customer_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Customer Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_customer_report}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_customer_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_customer_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Receipt Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_receipt_report}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_receipt_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_receipt_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Auction Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_auction_report}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_auction_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_auction_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Lead Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_lead_report}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_lead_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_lead_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Pigme Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_pigme_report}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_pigme_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_pigme_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Loan Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_loan_report}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_loan_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_loan_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-900">
                  View Agent Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.access_permissions.view_agent_report}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_permissions: {
                          ...formData.access_permissions,
                          view_agent_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.access_permissions.view_agent_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
                >
                  Save Access Roles
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
              Update Access Rights
            </h3>

            <form className="space-y-6" onSubmit={handleUpdate} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Title <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="title"
                  value={updateFormData.title}
                  onChange={handleInputChange}
                  id="title"
                  placeholder="Enter the Title"
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Dashboard
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_dashboard}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_dashboard: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_dashboard
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Analytics
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_analytics}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_analytics: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_analytics
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Add Group
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.add_group}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          add_group: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.add_group ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Group
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_group}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_group: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_group
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Edit Group
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.edit_group}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          edit_group: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.edit_group
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Delete Group
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.delete_group}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          delete_group: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.delete_group
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Add Customer
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.add_customer}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          add_customer: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.add_customer
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Customer
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_customer}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_customer: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_customer
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Edit Customer
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.edit_customer}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          edit_customer: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.edit_customer
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Delete Customer
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.delete_customer}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          delete_customer: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.delete_customer
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Add Enrollment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.add_enrollment}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          add_enrollment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.add_enrollment
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Delete Enrollment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={
                      updateFormData.access_permissions.delete_enrollment
                    }
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          delete_enrollment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.delete_enrollment
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Enrollment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_enrollment}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_enrollment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_enrollment
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Edit Enrollment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.edit_enrollment}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          edit_enrollment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.edit_enrollment
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Add Employee
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.add_employee}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          add_employee: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.add_employee
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Employee
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_employee}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_employee: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_employee
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Edit Employee
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.edit_employee}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          edit_employee: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.edit_employee
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Delete Employee
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.delete_employee}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          delete_employee: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.delete_employee
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Modify Payment Date
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={
                      updateFormData.access_permissions.modify_payment_date
                    }
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          modify_payment_date: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.modify_payment_date
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Add Lead
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.add_lead}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          add_lead: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.add_lead ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Lead
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_lead}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_lead: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_lead ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Edit Lead
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.edit_lead}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          edit_lead: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.edit_lead ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Delete Lead
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.delete_lead}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          delete_lead: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.delete_lead
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Add Loan
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.add_loan}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          add_loan: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.add_loan ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Loan
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_loan}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_loan: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_loan ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Edit Loan
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.edit_loan}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          edit_loan: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.edit_loan ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Delete Loan
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.delete_loan}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          delete_loan: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.delete_loan
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Add Pigme
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.add_pigme}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          add_pigme: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.add_pigme ? "Yes" : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Pigme
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_pigme}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_pigme: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_pigme
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Edit Pigme
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.edit_pigme}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          edit_pigme: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.edit_pigme
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Delete Pigme
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.delete_pigme}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          delete_pigme: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.delete_pigme
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Add Auction
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.add_auction}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          add_auction: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.add_auction
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Auction
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_auction}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_auction: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_auction
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Edit Auction
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.edit_auction}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          edit_auction: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.edit_auction
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Delete Auction
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.delete_auction}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          delete_auction: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.delete_auction
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Add Payment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.add_payment}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          add_payment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.add_payment
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Payment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_payment}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_payment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_payment
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Edit Payment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.edit_payment}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          edit_payment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.edit_payment
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Delete Payment
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.delete_payment}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          delete_payment: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.delete_payment
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Reports
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_reports}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_reports: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_reports
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Daybook
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_daybook}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_daybook: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_daybook
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Group Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={
                      updateFormData.access_permissions.view_group_report
                    }
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_group_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_group_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View All Customer Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={
                      updateFormData.access_permissions.view_all_customer_report
                    }
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_all_customer_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_all_customer_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Customer Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={
                      updateFormData.access_permissions.view_customer_report
                    }
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_customer_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_customer_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Receipt Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={
                      updateFormData.access_permissions.view_receipt_report
                    }
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_receipt_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_receipt_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Auction Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={
                      updateFormData.access_permissions.view_auction_report
                    }
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_auction_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_auction_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Lead Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_lead_report}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_lead_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_lead_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Pigme Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={
                      updateFormData.access_permissions.view_pigme_report
                    }
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_pigme_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_pigme_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Loan Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.access_permissions.view_loan_report}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_loan_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_loan_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  View Agent Report
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={
                      updateFormData.access_permissions.view_agent_report
                    }
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        access_permissions: {
                          ...updateFormData.access_permissions,
                          view_agent_report: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.access_permissions.view_agent_report
                      ? "Yes"
                      : "No"}
                  </span>
                </label>
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
              Delete Access Role
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
                      {currentUser.title}
                    </span>{" "}
                    to confirm deletion. <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    id="groupName"
                    placeholder="Enter the designation"
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

export default AdminAccessRights;
