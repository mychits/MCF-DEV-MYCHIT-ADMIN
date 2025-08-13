/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { Dropdown } from "antd";
import { IoMdMore } from "react-icons/io";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import { FaCalculator } from "react-icons/fa";
import CircularLoader from "../components/loaders/CircularLoader";
const Pigme = () => {
  const [users, setUsers] = useState([]);
  const [pigmeCustomers, setPigmeCustomers] = useState([]);
  const [tableBorrowers, setTableBorrowers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [currentUpdateCustomer, setCurrentUpdateCustomer] = useState(null);
  const [searchText, setSearchText] = useState("");
    const [reloadTrigger, setReloadTrigger] = useState(0);
  const [isLoading,setIsLoading] = useState(false);
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
    customer: "",
    maturity_period: "",
    maturity_interest: "",
    payable_amount: "",
    start_date: "",
    end_date: "",
    note: "",
  });
  const [errors, setErrors] = useState({});

  const [updateFormData, setUpdateFormData] = useState({
    customer: "",
    maturity_period: "",
    maturity_interest: "",
    payable_amount: "",
    start_date: "",
    end_date: "",
    note: "",
  });


    useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get("/user/get-user");
        if (response.status >= 400)
          throw new Error("Failed to fetch Customers");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching  Customer Data:", error);
      }
    };
    fetchCustomers();
  }, [reloadTrigger]);

  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/pigme/get-all-pigme-customers");
        setPigmeCustomers(response.data);
        const formattedData = response.data.map((pigmeCustomer, index) => ({
          _id: pigmeCustomer?._id,
          id: index + 1,
          pigme_id: pigmeCustomer?.pigme_id,
          customer_name: pigmeCustomer?.customer?.full_name,
          date: pigmeCustomer?.createdAt,
          maturity_period: pigmeCustomer?.maturity_period,
          maturity_interest: pigmeCustomer?.maturity_interest,
          payable_amount: pigmeCustomer?.payable_amount,
          start_date: pigmeCustomer?.start_date?.split("T")[0],
          end_date: pigmeCustomer?.end_date?.split("T")[0],
          note: pigmeCustomer?.note,
          action: (
            <div className="flex justify-center gap-2" key={pigmeCustomer._id}>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "1",
                      label: (
                        <div
                          className="text-green-600"
                          onClick={() =>
                            handleUpdateModalOpen(pigmeCustomer._id)
                          }
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
                          onClick={() =>
                            handleDeleteModalOpen(pigmeCustomer._id)
                          }
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
        setTableBorrowers(formattedData);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }finally{
        setIsLoading(false);
      }
    };
    fetchBorrowers();
  }, [reloadTrigger]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (type) => {
    const newErrors = {};

    const data = type === "addCustomer" ? formData : updateFormData;

    if (!data.customer) {
      newErrors.customer = "Customer Name is required";
    }

    if (!data.maturity_period) {
      newErrors.maturity_period = "Maturity Period is Required";
    }

     if (
      !data.payable_amount 
    ) {
      newErrors.payable_amount = "Payable Amount is required";
    }
   
   else if (
      !data.payable_amount ||
      isNaN(data.payable_amount) ||
      data.payable_amount <= 0
    ) {
      newErrors.payable_amount = "Payable Amount must be a positive number";
    }

    if (!data.start_date) {
      newErrors.start_date = "Start Date is required";
    }
    if (!data.end_date) {
      newErrors.end_date = "End Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm("addCustomer");
    try {
    
      if (isValid) {
        const response = await api.post("/pigme/add-pigme-customer", formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.status >= 400) throw new Error("failed to add Customer");
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Customer Added Successfully",
          type: "success",
        });

        setShowModal(false);
        setFormData({
          customer: "",
          maturity_period: "",
          maturity_interest: "",
          payable_amount: "",
          start_date: "",
          end_date: "",
          note: "",
        });
      } 
    } catch (error) {
      console.error("Error adding Customer:", error);
    }
  };



  const handleDeleteModalOpen = async (pigmeId) => {
    try {
      const response = await api.get(`pigme/get-pigme/${pigmeId}`);
      setCurrentCustomer(response.data);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching Pigme:", error);
    }
  };

  const handleUpdateModalOpen = async (pigmeId) => {
    try {
      const response = await api.get(`pigme/get-pigme/${pigmeId}`);
      const PigmeData = response.data;
      const formattedStartDate = PigmeData?.start_date?.split("T")[0];
      const formattedEndDate = PigmeData?.end_date?.split("T")[0];
      setCurrentUpdateCustomer(response.data);
      setUpdateFormData({
        customer: response?.data?.customer._id,
        maturity_period: response?.data?.maturity_period,
        maturity_interest: response?.data?.maturity_interest,
        payable_amount: response?.data?.payable_amount,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        note: response?.data?.note,
      });
      setShowModalUpdate(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching pigme Customer by ID:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDeletePigme = async () => {
    if (currentCustomer) {
      try {
        await api.delete(`/pigme/delete-pigme-customer/${currentCustomer._id}`);
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          message: "Pigme User deleted successfully",
          type: "success",
          visibility: true,
        });
        setShowModalDelete(false);
        setCurrentCustomer(null);
      } catch (error) {
        console.error("Error deleting pigme User:", error);
      }
    }
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    try {
      if (isValid) {
        await api.patch(
          `/pigme/update-pigme-customer/${currentUpdateCustomer._id}`,
          updateFormData
        );
        setShowModalUpdate(false);
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          message: "Borrower updated successfully",
          type: "success",
          visibility: true,
        });
      }
    } catch (error) {
      console.error("Error updating Borrower:", error);
    }
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "customer_name", header: "Customer Name" },
    { key: "maturity_period", header: "Maturity Period" },
    { key: "maturity_interest", header: "Maturity Interest" },
    { key: "start_date", header: "Start Date" },
    { key: "end_date", header: "Due Date" },
    { key: "note", header: "Note" },
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
                <h1 className="text-2xl font-semibold">Pigme</h1>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add Pigme
                </button>
              </div>
            </div>

          {(tableBorrowers?.length>0 && !isLoading) ?  (<DataTable
              catcher="_id"
              updateHandler={handleUpdateModalOpen}
              data={filterOption(tableBorrowers, searchText)}
              columns={columns}
              exportedPdfName="Pigme"
              exportedFileName={`Groups-${
                tableBorrowers.length > 0
                  ? tableBorrowers[0].date +
                    " to " +
                    tableBorrowers[tableBorrowers.length - 1].date
                  : "empty"
              }.csv`}
            />):<CircularLoader isLoading={isLoading} data="Pigme Data" failure={tableBorrowers?.length<=0}/>}
          </div>
        </div>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Add Pigme</h3>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="customer"
                >
                  Select customer Name  <span className="text-red-500 ">*</span>
                </label>
                <select
                  name="customer"
                  id="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                >
                  <option value="" selected hidden>
                    Select Customer Name
                  </option>
                  {users.map((user) => (
                    <option value={user._id}>{user.full_name}</option>
                  ))}
                </select>
                {errors.customer && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
                )}
              </div>

              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="maturity_period"
                >
                  Select Maturity period  <span className="text-red-500 ">*</span>
                </label>
                <select
                  name="maturity_period"
                  id="maturity_period"
                  value={formData.maturity_period}
                  onChange={handleChange}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                >
                  <option value="" selected hidden>
                    Select Maturity Period
                  </option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                {errors.maturity_period && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.maturity_period}
                  </p>
                )}
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="maturity_interest"
                  >
                    Maturity Interest
                  </label>
                  <input
                    type="number"
                    name="maturity_interest"
                    value={formData.maturity_interest}
                    onChange={handleChange}
                    id="maturity_interest"
                    placeholder="Enter Maturity Interest"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="payable_amount"
                  >
                   Payable Amount  <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="payable_amount"
                    value={formData.payable_amount}
                    onChange={handleChange}
                    id="tenure"
                    placeholder="Enter Payable Amount"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                  {errors.payable_amount && (
                    <p className="text-red-500 text-sm mt-1">{errors.payable_amount}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="start_date"
                  >
                    Start Date  <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    id="start_date"
                    placeholder="Enter the Date"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
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
                    htmlFor="end_date"
                  >
                    End Date  <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    id="end_date"
                    placeholder="Enter End Date"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                  {errors.end_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.end_date}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="note"
                >
                  Note
                </label>
                <div className="flex w-full gap-2">
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    id="note"
                    placeholder="Specify Note if any!"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full  p-2.5"
                  />
                  <div
                    className="bg-blue-700 hover:bg-blue-800 w-10 h-10 flex justify-center items-center rounded-md"
                    onClick={() => {
                      window.open("Calculator:///");
                    }}
                  >
                    <FaCalculator color="white" />
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
                >
                  Save Pigme
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
              Update Pigme
            </h3>
            <form className="space-y-6" onSubmit={handleUpdate} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="customer"
                >
                  Select customer Name <span className="text-red-500 ">*</span>
                </label>
                <select
                  name="customer"
                  id="customer"
                  value={updateFormData.customer}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                >
                  <option value="" selected hidden>
                    Select Customer Name
                  </option>
                  {users.map((user) => (
                    <option value={user._id}>{user.full_name}</option>
                  ))}
                </select>
                {errors.customer && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
                )}
              </div>

              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="maturity_period"
                >
                  Select Maturity period <span className="text-red-500 ">*</span>
                </label>
                <select
                  name="maturity_period"
                  id="maturity_period"
                  value={updateFormData.maturity_period}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                >
                  <option value="" selected hidden>
                    Select Maturity Period
                  </option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                {errors.maturity_period && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.maturity_period}
                  </p>
                )}
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="maturity_interest"
                  >
                    Maturity Interest
                  </label>
                  <input
                    type="number"
                    name="maturity_interest"
                    value={updateFormData.maturity_interest}
                    onChange={handleInputChange}
                    id="maturity_interest"
                    placeholder="Enter Maturity Interest"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                
                </div>
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="payable_amount"
                  >
                   Payable Amount <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="number"
                    name="payable_amount"
                    value={updateFormData.payable_amount}
                    onChange={handleInputChange}
                    id="tenure"
                    placeholder="Enter Payable Amount"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                  {errors.payable_amount && (
                    <p className="text-red-500 text-sm mt-1">{errors.payable_amount}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-row justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900"
                    htmlFor="start_date"
                  >
                    Start Date <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={updateFormData.start_date}
                    onChange={handleInputChange}
                    id="start_date"
                    placeholder="Enter the Date"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
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
                    htmlFor="end_date"
                  >
                    End Date <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={updateFormData.end_date}
                    onChange={handleInputChange}
                    id="end_date"
                    placeholder="Enter End Date"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                  {errors.end_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.end_date}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="note"
                >
                  Note
                </label>
                <div className="flex w-full gap-2">
                  <input
                    type="text"
                    name="note"
                    value={updateFormData.note}
                    onChange={handleInputChange}
                    id="note"
                    placeholder="Specify Note if any!"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full  p-2.5"
                  />
                  <div
                    className="bg-blue-700 hover:bg-blue-800 w-10 h-10 flex justify-center items-center rounded-md"
                    onClick={() => {
                      window.open("Calculator:///");
                    }}
                  >
                    <FaCalculator color="white" />
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black"
                >
                  Update Pigme
                </button>
              </div>
            </form>
          </div>
        </Modal>
        
        <Modal
          isVisible={showModalDelete}
          onClose={() => {
            setShowModalDelete(false);
            setCurrentCustomer(null);
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Delete Pigme Customer
            </h3>
            {currentCustomer && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeletePigme();
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
                      {currentCustomer.customer.full_name}
                    </span>{" "}
                    to confirm deletion. <span className="text-red-500 ">*</span>
                  </label>
                  <input
                    type="text"
                    id="borrowerName"
                    placeholder="Enter the Pigme Customer Name"
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

export default Pigme;
