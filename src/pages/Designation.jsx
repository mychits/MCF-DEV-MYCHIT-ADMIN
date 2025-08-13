/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import SettingSidebar from "../components/layouts/SettingSidebar";
import { IoMdMore } from "react-icons/io";
import { Input, Dropdown } from "antd";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { fieldSize } from "../data/fieldSize";

const Designation = () => {
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
  const [manager, setManagers] = useState([]);
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
    permission: {
      collection: true,
      daybook: true,
      targets: true,
      leads: true,
      commission: true,
      reports: true,
    },
  });

  const [updateFormData, setUpdateFormData] = useState({
    title: "",
    permission: {
      collection: true,
      daybook: true,
      targets: true,
      leads: true,
      commission: true,
      reports: true,
    },
  });

    useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/designation/get-designation");
      
        setUsers(response.data);
        const formattedData = response.data.map((group, index) => ({
          _id: group._id,
          id: index + 1,
          title: group.title,
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
    fetchUsers();
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
    const data = type === "addDesignation" ? formData : updateFormData;
    const regex = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[6-9]\d{9}$/,
    };

    if (!data.title.trim()) {
      newErrors.name = "Title is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValidate = validateForm("addDesignation");

    try {
      if (isValidate) {
        const response = await api.post(
          "/designation/add-designation",
          formData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setShowModal(false);
        setFormData({
          title: "",
          permission: {
            collection: true,
            daybook: true,
            targets: true,
            leads: true,
            commission: true,
            reports: true,
          },
        });
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Designation Added Successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error adding Designation:", error);
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



  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "title", header: "Designation Title" },
    { key: "action", header: "Action" },
  ];

  const filteredUsers = users.filter((user) =>
    user.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteModalOpen = async (userId) => {
    try {
      const response = await api.get(
        `/designation/get-designation-by-id/${userId}`
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
        `/designation/get-designation-by-id/${userId}`
      );
      setCurrentUpdateUser(response.data);
      setUpdateFormData({
        title: response.data.title,
        permission: {
          collection:
            response.data?.permission?.collection === true ||
            response.data?.permission?.collection === "true",
          daybook:
            response.data?.permission?.daybook === true ||
            response.data?.permission?.daybook === "true",
          targets:
            response.data?.permission?.targets === true ||
            response.data?.permission?.targets === "true",
          leads:
            response.data?.permission?.leads === true ||
            response.data?.permission?.leads === "true",
          commission:
            response.data?.permission?.commission === true ||
            response.data?.permission?.commission === "true",
          reports:
            response.data?.permission?.reports === true ||
            response.data?.permission?.reports === "true",
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
        await api.delete(`/designation/delete-designation/${currentUser._id}`);
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
          `/designation/update-designation/${currentUpdateUser._id}`,
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
                <h1 className="text-2xl font-semibold">Designations</h1>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add designation
                </button>
              </div>
            </div>
            {(TableAgents.length > 0 && !isLoading) ? (
              <DataTable
                updateHandler={handleUpdateModalOpen}
                data={filterOption(TableAgents, searchText)}
                columns={columns}
                exportedPdfName="Designation"
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
                data="Designation Data"
              />
            )}
          </div>
        </div>

        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Add designation
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
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
              <div className="mt-10">
                <label className="text-lg font-bold">Permissions</label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Collection
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.permission.collection}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permission: {
                          ...formData.permission,
                          collection: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4
                              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.permission.collection ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Daybook
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.permission.daybook}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permission: {
                          ...formData.permission,
                          daybook: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4
                              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.permission.daybook ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Targets
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.permission.targets}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permission: {
                          ...formData.permission,
                          targets: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4
                              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.permission.targets ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Leads</span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.permission.leads}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permission: {
                          ...formData.permission,
                          leads: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4
                              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.permission.leads ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Commission
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.permission.commission}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permission: {
                          ...formData.permission,
                          commission: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4
                              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.permission.commission ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Reports
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.permission.reports}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permission: {
                          ...formData.permission,
                          reports: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4
                              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.permission.reports ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
                >
                  Save designation
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
              Update designation
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
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
              <div className="mt-10">
                <label className="text-lg font-bold">Permissions</label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Collection
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.permission.collection}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        permission: {
                          ...updateFormData.permission,
                          collection: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4
                              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.permission.collection ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Daybook
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.permission.daybook}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        permission: {
                          ...updateFormData.permission,
                          daybook: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4
                              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.permission.daybook ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Targets
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.permission.targets}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        permission: {
                          ...updateFormData.permission,
                          targets: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4
                              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.permission.targets ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Leads</span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.permission.leads}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        permission: {
                          ...updateFormData.permission,
                          leads: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4
                              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.permission.leads ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Commission
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.permission.commission}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        permission: {
                          ...updateFormData.permission,
                          commission: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4
                              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.permission.commission ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Reports
                </span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={updateFormData.permission.reports}
                    onChange={(e) =>
                      setUpdateFormData({
                        ...updateFormData,
                        permission: {
                          ...updateFormData.permission,
                          reports: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4
                              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {updateFormData.permission.reports ? "Yes" : "No"}
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
              Delete designation
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
                    to confirm deletion.{" "}
                    <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    id="groupName"
                    placeholder="Enter the designation"
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

export default Designation;
