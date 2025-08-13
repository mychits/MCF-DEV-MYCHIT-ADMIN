/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import { FaWhatsapp } from "react-icons/fa";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import whatsappApi from "../instance/WhatsappInstance";
import CircularLoader from "../components/loaders/CircularLoader";
const WhatsappAdd = () => {
  const [users, setUsers] = useState([]);
  const [TableUsers, setTableUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectUser, setSelectUser] = useState({});
  const [customerCount, setCustomerCount] = useState(0);
  const [selectAll, setSelectAll] = useState({ msg: "No", checked: false });
  const [formData, setFormData] = useState({
    template_name: "",
  });
   const [reloadTrigger, setReloadTrigger] = useState(0);
  const [errors, setErrors] = useState({});


    useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/user/get-user");
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

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const validateForm = (type) => {
    const newErrors = {};

    if (!formData.template_name.trim()) {
      newErrors.template_name = "Template name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    try {
      if (isValid) {
        setDisabled(true);
        const response = await whatsappApi.post("/marketing", {
          selectUser,
          template_name: formData?.template_name,
        });
        if (response.status >= 400) {
          setShowModal(false);
          setDisabled(false);
          setErrors({});
          setFormData({
            template_name: "",
          });

          setAlertConfig({
            type: "error",
            message: "Whatsapp Failure",
            visibility: true,
          });
          
        }
        if (response.status === 201) {
       
        
          setShowModal(false);
          setErrors({});
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

        setShowModal(false);
        setErrors({});
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
      setDisabled(false);
      console.error("whatsapp error", err.message);
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

  useEffect(() => {
    const updateUI = () => {
      const formattedData = users.map((group, index) => ({
        id: index + 1,
        name: group.full_name,
        phone_number: group.phone_number,
        customer_id: group.customer_id || `Updating soon...`,
        action: (
          <div key={group._id} className="flex justify-center gap-2">
            <button
              className="border border-green-400 text-white px-4 py-2 rounded-md shadow hover:border-green-700 transition duration-200"
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
                className="checked:text-green-600 focus:ring-0  rounded-lg p-2"
              />
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

  const columns = [
    { key: "action", header: "Action" },
    { key: "id", header: "SL. NO" },
    { key: "customer_id", header: "Customer Id" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
  ];

  return (
    <>
      <div className="w-screen">
        <div className=" flex mt-20">
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
                    <FaWhatsapp color="green" size="30" className="m-2" />
                    <h1 className="text-2xl font-semibold flex items-center">
                      Whatsapp Customers
                    </h1>
                  </div>

                  <div
                    className="flex items-center my-2 cursor-pointer select-none"
                    onClick={handleSelectAll}
                  >
                    <input
                      type="checkbox"
                      checked={selectAll.checked}
                      className="rounded-sm mx-2 text-green-400 focus:outline-none cursor-pointer "
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
                    Whatsapp
                  </div>
                </button>
              </div>
            </div>
            {(TableUsers.length > 0 && !isLoading) ? (
            <DataTable
              isExportEnabled={false}
              data={TableUsers}
              columns={columns}
              exportedPdfName="Whatsapp Add"
              exportedFileName={`whatsapp-${
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
              {errors.template_name && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.template_name}
                </p>
              )}
              <button
                type="submit"
                disabled={disabled}
                className="w-full text-white bg-green-700 hover:bg-green-800
              focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Send
              </button>
            </form>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default WhatsappAdd;
