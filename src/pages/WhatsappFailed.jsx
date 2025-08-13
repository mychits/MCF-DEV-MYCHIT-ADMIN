/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import { FaWhatsapp } from "react-icons/fa";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import whatsappApi from "../instance/WhatsappInstance";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import CircularLoader from "../components/loaders/CircularLoader";
const WhatsappFailed = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [TableUsers, setTableUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });
  const [selectUser, setSelectUser] = useState({});
  const [customerCount, setCustomerCount] = useState(0);
  const [selectAll, setSelectAll] = useState({ msg: "No", checked: false });
  const [formData, setFormData] = useState({
    template_name: "",
  });
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    full_name: "",
    phone_number: "",
  });
  const [currentUpdateUser, setCurrentUpdateUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [templateErrors, setTemplateErrors] = useState({});
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/whatsapp/get-failed-users");
        setUsers(response.data);
        const initialSelected = {};
        response.data.forEach((user) => {
          initialSelected[user._id] = false;
        });
        setSelectUser(initialSelected);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [reloadTrigger]);
  useEffect(() => {
    const updateUI = () => {
      const formattedData = users.map((group, index) => ({
        id: index + 1,
        name: group.full_name,
        phone_number: group.phone_number,
        customer_id: group.customer_id || `Updating soon...`,
        template_name: group.template_name,
        valid_mobile_number: group.phone_number?.match(/^[7-9][0-9]{9}$/) ? (
          <div className="font-bold text-green-700">Valid</div>
        ) : (
          <div className="font-bold text-red-700">InValid</div>
        ),
        select_customer: (
          <div key={group._id} className="flex justify-center gap-2">
            <button
              className="border border-red-400 text-white px-4 py-2 rounded-md shadow hover:border-red-700 transition duration-200"
              onClick={() => {
                setSelectUser((prevSelectedUser) => ({
                  ...prevSelectedUser,
                  [group._id]: !prevSelectedUser[group._id],
                }));
              }}
            >
              <input
                type="checkbox"
                checked={selectUser[group?._id] ?? false}
                className="checked:text-red-600 focus:ring-0  rounded-lg p-2"
              />
            </button>
          </div>
        ),
        action: (
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
        ),
      }));
      setTableUsers(formattedData);
    };
    updateUI();
  }, [selectUser, reloadTrigger]);
  useEffect(() => {
    const countCustomer = () => {
      let counter = 0;
      Object.values(selectUser).forEach((ele) => {
        if (ele) {
          counter++;
        }
      });
      setCustomerCount(counter);
    };
    countCustomer();
  }, [selectUser, reloadTrigger]);

  const validateTemplate = (type) => {
    const newErrors = {};

    if (!formData.template_name.trim()) {
      newErrors.template_name = "Template name is required";
    }

    setTemplateErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateTemplate();
    try {
      if (isValid) {
        setDisabled(true);
        const response = await whatsappApi.post("/failed-customers", {
          selectUser,
          template_name:formData.template_name
        });
        if (response.status === 201) {
          setShowModal(false);
          setTemplateErrors({});
          setFormData({
            template_name: "",
          });
          setReloadTrigger((prev) => prev + 1);
          setAlertConfig({
            type: "success",
            message: "Whatsapped Successfully",
            visibility: true,
          });
        }
        if (response.status >= 400) {
          setShowModal(false);
          setDisabled(false);
          setTemplateErrors({});
          setFormData({
            template_name: "",
          });
          setAlertConfig({
            type: "error",
            message: "Whatsapp Failure",
            visibility: true,
          });
        }

        setShowModal(false);
        setTemplateErrors({});
        setFormData({
          template_name: "",
        });
      }
    } catch (err) {
      setAlertConfig({
        type: "error",
        message: "Whatsapp Failure",
        visibility: true,
      });
    }
  };
  const handleSelectAll = () => {
    const checked = !selectAll.checked;
    setSelectAll({
      ...selectAll,
      msg: selectAll.msg === "All" ? "No" : "All",
      checked: !selectAll.checked,
    });
    const tempSelectUser = {};
    Object.keys(selectUser).forEach((user_id) => {
      tempSelectUser[user_id] = checked;
    });
    setSelectUser(tempSelectUser);
  };
  const validateForm = (type) => {
    const newErrors = {};
    const data = type === "addCustomer" ? formData : updateFormData;
    const regex = {
      phone: /^[6-9]\d{9}$/,
    };

    if (!data.full_name.trim()) {
      newErrors.full_name = "Full Name is required";
    }

    if (!data.phone_number) {
      newErrors.phone_number = "Phone number is required";
    } else if (!regex.phone.test(data.phone_number)) {
      newErrors.phone_number = "Invalid  phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const isValid = validateForm();

    try {
      if (isValid) {
       
        await api.patch(
          `/whatsapp/update-failed-user-by-id/${currentUpdateUser._id}`,
          updateFormData
        );
        setShowModalUpdate(false);
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "User Updated Successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error.message);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setAlertConfig({
          visibility: true,
          message: `${error?.response?.data?.message}`,
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
  const handleUpdateModalOpen = async (userId) => {
    try {
      const response = await api.get(
        `/whatsapp/get-failed-user-by-id/${userId}`
      );
      setCurrentUpdateUser(response.data);
      setUpdateFormData({
        full_name: response.data.full_name,
        phone_number: response.data.phone_number,
      });
      setShowModalUpdate(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  const handleDeleteModalOpen = async (userId) => {
    try {
      const response = await api.get(
        `/whatsapp/get-failed-user-by-id/${userId}`
      );
      setCurrentUser(response.data);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  const handleDeleteUser = async () => {
    if (currentUser) {
      try {
        await api.delete(
          `/whatsapp/delete-failed-user-by-id/${currentUser._id}`
        );
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "User deleted successfully",
          type: "success",
        });
        setShowModalDelete(false);
        setCurrentUser(null);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const columns = [
    { key: "select_customer", header: "Select Customer" },
    { key: "id", header: "SL. NO" },
    { key: "customer_id", header: "Customer Id" },
    { key: "name", header: "Customer Name" },
    { key: "template_name", header: "Template Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "valid_mobile_number", header: "Valid Mobile Number" },
    { key: "action", header: "Action" },
  ];

  return (
    <>
      <div className="w-screen">
        <div className="flex mt-20">
          {/* <Sidebar /> */}
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
                <div className="flex flex-col">
                  <div className="flex">
                    <FaWhatsapp
                      size="30"
                      className="m-2 text-red-600 font-bold"
                    />
                    <h1 className="text-2xl font-semibold flex items-center">
                      Whatsapp Failed Customers
                    </h1>
                  </div>

                  <div
                    className="flex items-center my-2 cursor-pointer select-none"
                    onClick={handleSelectAll}
                  >
                    <input
                      type="checkbox"
                      checked={selectAll.checked}
                      className="rounded-sm mx-2 text-red-400 focus:outline-none cursor-pointer "
                    />
                    <h2 className="font-medium">{`Select ${selectAll.msg} Customers`}</h2>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowModal(true);
                  }}
                  className="relative ml-4 bg-green-600 text-white px-4 py-2 rounded shadow-md hover:bg-green-700 transition duration-200"
                >
                  <div className="flex items-center">
                    {customerCount > 0 && (
                      <div
                        className="min-w-10 min-h-10 absolute -right-4 bottom-6 shadow-lg hover:bg-red-600 bg-red-400 rounded-full text-white p-2"
                        title={`Message will be sent to total ${customerCount} customers`}
                      >
                        <span className="shadow-sm font-medium">
                          {customerCount}
                        </span>
                      </div>
                    )}
                    <FaWhatsapp className="mx-1" size={20} />
                    Whatsapp Again
                  </div>
                </button>
              </div>
            </div>
           {(TableUsers.length > 0 && !isLoading) ? (
            <DataTable
              data={TableUsers}
              columns={columns}
              exportedPdfName="Whatsapp Failed"
              exportedFileName={`WhatsappFailedCustomers-${
                TableUsers.length > 0
                  ? TableUsers[0].name +
                    " to " +
                    TableUsers[TableUsers.length - 1].name
                  : "empty"
              }.csv`}
            />): (
              <CircularLoader
                isLoading={isLoading}
                failure={TableUsers.length <= 0}
                data={"Group Data"}
              />
            )}
          </div>
        </div>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Send Message
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="template"
                >
                  Template Name
                </label>
                <input
                  type="text"
                  name="template_name"
                  value={formData.template_name}
                  onChange={handleChange}
                  id="templateName"
                  placeholder="Paste template name"
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 w-full p-2.5"
                />
              </div>
              {templateErrors.template_name && (
                <p className="mt-2 text-sm text-red-600">
                  {templateErrors.template_name}
                </p>
              )}
              <button
                type="submit"
                className="w-full text-white bg-green-700 hover:bg-green-800
              focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Send
              </button>
            </form>
          </div>
        </Modal>

        {/* inserted from here */}
        <Modal
          isVisible={showModalUpdate}
          onClose={() => setShowModalUpdate(false)}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Update Customer
            </h3>
            <form className="space-y-6" onSubmit={handleUpdate} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="email"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={updateFormData.full_name}
                  onChange={handleInputChange}
                  id="name"
                  placeholder="Enter the Full Name"
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                />
                {errors.full_name && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.full_name}
                  </p>
                )}
              </div>
              <div className="flex flex-row justify-between space-x-4">
                <div className="w-full">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="date"
                  >
                    Phone Number
                  </label>
                  <input
                    type="number"
                    name="phone_number"
                    value={updateFormData.phone_number}
                    onChange={handleInputChange}
                    id="text"
                    placeholder="Enter Phone Number"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                  {errors.phone_number && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.phone_number}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Update
              </button>
            </form>
          </div>
        </Modal>
        {/* delete customer */}
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
                    to confirm deletion.
                  </label>
                  <input
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

export default WhatsappFailed;
