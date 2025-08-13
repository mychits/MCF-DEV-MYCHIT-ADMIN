/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import { Input, Dropdown, Select } from "antd";
import { IoMdMore } from "react-icons/io";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";
import SettingSidebar from "../components/layouts/SettingSidebar";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { fieldSize } from "../data/fieldSize";

const AdministrativePrivileges = () => {
  const [admins, setAdmins] = useState([]);
  const [TableGroups, setTableGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [currentUpdateAdmin, setCurrentUpdateAdmin] = useState(null);
  const [allAccessRights, setAllAccessRights] = useState([]);
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
    name: "",
    password: "",
    phoneNumber: "",
    admin_access_right_id: "",
  });
  const [errors, setErrors] = useState({});

  const [updateFormData, setUpdateFormData] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    admin_access_right_id: "",
  });

    useEffect(() => {
    const fetchAllAdminRights = async () => {
      try {
        const response = await api.get("/admin-access-rights/get-all");
        setAllAccessRights(response.data);
      } catch (err) {
        console.error("Failed to fetch Access Rights");
        setAllAccessRights([]);
      }
    };
    fetchAllAdminRights();
  }, [reloadTrigger]);
  useEffect(() => {
    const fetchSubAdmins = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/admin/get-sub-admins");
        setAdmins(response.data);
        const formattedData = response.data.map((admin, index) => ({
          _id: admin?._id,
          id: index + 1,
          name: admin?.name,
          phoneNumber: admin?.phoneNumber,
          password: admin?.password,
          admin_access_right: admin?.admin_access_right_id?.title,
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
                          onClick={() => handleUpdateModalOpen(admin?._id)}
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
                          onClick={() => handleDeleteModalOpen(admin?._id)}
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
        setTableGroups(formattedData);
      } catch (error) {
        console.error("Error fetching Admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubAdmins();
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

    setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
  };
  const validateForm = (type) => {
    const newErrors = {};

    const data = type === "addAdmin" ? formData : updateFormData;

    if (!data.name.trim()) {
      newErrors.name = "Admin Name is required";
    }

    if (!data.password) {
      newErrors.password = "Password is required";
    }

    if (!data.phoneNumber || isNaN(data.phoneNumber)) {
      newErrors.phoneNumber = "Phone Number is required";
    }
    if (!data.admin_access_right_id) {
      newErrors.admin_access_right_id = "Select Admin Access Right";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    
    e.preventDefault();

    const isValid = validateForm("addAdmin");
    try {
      if (isValid) {
        const response = await api.post("/admin/add-sub-admin", formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Sub Admin Added Successfully",
          type: "success",
        });

        setShowModal(false);
        setFormData({
          name: "",
          phoneNumber: "",
          password: "",
          admin_access_right_id: "",
        });
      } else {
        console.log(errors);
      }
    } catch (error) {
  console.error("Error adding sub admin:", error);

  if (
    error.response &&
    error.response.data &&
    error.response.data.message &&
    error.response.data.message.toLowerCase().includes("phone")
  ) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      phoneNumber: "Phone number already exists",
    }));
  }
}
    
  };


  const handleDeleteModalOpen = async (adminId) => {
    try {
      console.info(adminId,"adminid")
      const response = await api.get(`/admin/get-admin/${adminId}`);
      setCurrentAdmin(response.data);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error deleting Sub Admin:", error);
    }
  };

  const handleUpdateModalOpen = async (adminId) => {
    try {
      const response = await api.get(`/admin/get-admin/${adminId}`);

      setCurrentUpdateAdmin(response.data);
      setUpdateFormData({
        name: response?.data?.name,
        phoneNumber: response?.data?.phoneNumber,
        password: response?.data?.password,
        admin_access_right_id: response?.data?.admin_access_right_id?._id,
      });
      setShowModalUpdate(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching admin:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUpdateFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors({ ...errors, [name]: "" });
  };

  const handleDeleteAdmin = async () => {
  
    if (currentAdmin) {
      
      try {
        await api.delete(`/admin/delete-admin/${currentAdmin._id}`);
        // alert("Group deleted successfully");
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          message: "Admin deleted successfully",
          type: "success",
          visibility: true,
        });
        setShowModalDelete(false);
        setCurrentAdmin(null);
      } catch (error) {
        console.error("Error deleting admin:", error);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const isValid = validateForm();

    try {
      if (isValid) {
        console.info(currentUpdateAdmin,updateFormData,"updation form")
        await api.put(
          `/admin/update-admin/${currentUpdateAdmin._id}`,
          updateFormData
        );
        setShowModalUpdate(false);
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          message: "Admin updated successfully",
          type: "success",
          visibility: true,
        });

        //
      }
    } catch (error) {
      console.error("Error updating Admin:", error);
    }
  };

  const columns = [
    { key: "name", header: "Admin Name" },
    { key: "password", header: "Password" },
    { key: "phoneNumber", header: "Phone Number" },
    { key: "admin_access_right", header: "Admin Access Role" },
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
          <SettingSidebar />

          <div className="flex-grow p-7">
            <div className="mt-6 mb-8">
              <div className="flex justify-between items-center w-full">
                <h1 className="text-2xl font-semibold">
                  Administrative Privileges
                </h1>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add Sub Admin
                </button>
              </div>
            </div>

            {(TableGroups.length > 0 && !isLoading) ? (
              <DataTable
                catcher="_id"
                updateHandler={handleUpdateModalOpen}
                data={filterOption(TableGroups, searchText)}
                columns={columns}
                exportedPdfName={`Administrative Privileges`}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={TableGroups.length <= 0}
                data={"Sub Admin Data"}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {" "}
            </div>
          </div>
        </div>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Add Sub Admin
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="name"
                >
                  Sub Admin Name <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  id="name"
                  placeholder="Enter Sub Admin Name"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="phoneNumber"
                >
                  Phone Number <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  id="phoneNumber"
                  placeholder="Enter Sub Admin Phone Number"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="password"
                >
                  Password <span className="text-red-500 ">*</span>
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
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Admin Access Rights <span className="text-red-500 ">*</span>
                </label>
                {/* <select
                  value={formData?.admin_access_right_id}
                  onChange={handleChange}
                  name="admin_access_right_id"
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                >
                  <option value="">Select Admin Role</option>
                  {allAccessRights.map((adminRole) => (
                    <option value={adminRole._id}>{adminRole.title}</option>
                  ))}
                </select> */}
                 <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select Admin Access Role"
                  popupMatchSelectWidth={false}
                  showSearch
                  name="admin_access_right_id"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={formData?.admin_access_right_id || undefined}
                  onChange={(value) =>
                    handleAntDSelect("admin_access_right_id", value)
                  }
                >
                   {allAccessRights.map((accessRight) => (
                    <Select.Option value={accessRight?._id}>
                      {accessRight?.title}
                    </Select.Option>
                  ))}
                </Select>
                {errors.admin_access_right_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.admin_access_right_id}
                  </p>
                )}
              </div>

              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
                >
                  Save Sub Admin
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
              Update Sub Admin
            </h3>
            <form className="space-y-6" onSubmit={handleUpdate} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="name"
                >
                  Admin Name <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  value={updateFormData.name}
                  onChange={handleInputChange}
                  id="name"
                  placeholder="Enter the Admin Name"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="phone_number"
                >
                  Phone Number <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="phoneNumber"
                  value={updateFormData.phoneNumber}
                  onChange={handleInputChange}
                  id="phone_number"
                  placeholder="Enter Sub Admin Phone Number"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="password"
                >
                  Password <span className="text-red-500 ">*</span>
                </label>
                <Input
                  type="text"
                  name="password"
                  value={updateFormData.password}
                  onChange={handleInputChange}
                  id="password"
                  placeholder="Enter Password"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Admin Access Role <span className="text-red-500 ">*</span>
                </label>
                {/* <select
                  value={updateFormData?.admin_access_right_id || ""}
                  onChange={handleInputChange}
                  name="admin_access_right_id"
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}

                >
                  <option value={""}>Select Admin Access Role</option>
                  {allAccessRights.map((accessRight) => (
                    <option value={accessRight?._id}>
                      {accessRight?.title}
                    </option>
                  ))}
                </select> */}
                 <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select Admin Access Role"
                  popupMatchSelectWidth={false}
                  showSearch
                  name="admin_access_right_id"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={updateFormData?.admin_access_right_id || undefined}
                  onChange={(value) =>
                    handleAntInputDSelect("admin_access_right_id", value)
                  }
                >
                   {allAccessRights.map((accessRight) => (
                    <Select.Option value={accessRight?._id}>
                      {accessRight?.title}
                    </Select.Option>
                  ))}
                </Select>
                {errors.admin_access_right_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.admin_access_right_id}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
              >
                Update
              </button>
            </form>
          </div>
        </Modal>
        <Modal
          isVisible={showModalDelete}
          onClose={() => {
            setShowModalDelete(false);
            setCurrentAdmin(null);
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Delete Sub Admin
            </h3>
            {currentAdmin && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeleteAdmin();
                }}
                className="space-y-6"
              >
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="adminname"
                  >
                    Please enter{" "}
                    <span className="text-primary font-bold">
                      {currentAdmin.name}
                    </span>{" "}
                    to confirm deletion. <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    id="adminname"
                    placeholder="Enter the Admin Name"
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

export default AdministrativePrivileges;
