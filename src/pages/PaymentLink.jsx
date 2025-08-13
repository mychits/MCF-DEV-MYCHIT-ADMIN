/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Input, Select, Checkbox } from "antd";
import { FaMoneyBillWave } from "react-icons/fa";
import Navbar from "../components/layouts/Navbar";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { fieldSize } from "../data/fieldSize";

const User = () => {
  const [users, setUsers] = useState([]);
  const [TableUsers, setTableUsers] = useState([]);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [areas, setAreas] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });
  const [searchText, setSearchText] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAllCustomers, setShowAllCustomers] = useState(false);
  const [paymentLinkData, setPaymentLinkData] = useState({
    amount: "",
    purpose: "",
    expiry: "86400",
    notify_customer: true,
    send_sms: true,
    send_email: true,
  });
  const [paymentLinkLoading, setPaymentLinkLoading] = useState(false);
  
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
        console.error("Error fetching user ", error);
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
          _id: group._id,
          id: index + 1,
          name: group.full_name,
          phone_number: group.phone_number,
          email: group.email,
          address: group.address,
          pincode: group.pincode,
          customer_id: group.customer_id,
          collection_area: group.collection_area?.route_name,
          approval_status:
            group.approval_status === "true" ? (
              <div className="inline-block px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full shadow-sm">
                Approved
              </div>
            ) : group.approval_status === "false" ? (
              <div className="inline-block px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full shadow-sm">
                Pending
              </div>
            ) : (
              <div className="inline-block px-3 py-1 text-sm font-medium text-green-800 bg-green-100  rounded-full shadow-sm">
                Approved
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
        setTableUsers(fData);
      } catch (error) {
        console.error("Error fetching user ", error.message);
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
        console.error("Error fetching ", error);
      }
    };
    fetchGroupData();
  }, [reloadTrigger]);
  
  // Helper function to get complete customer details for selected IDs
  const getSelectedCustomerDetails = () => {
    return selectedCustomers
      .map(id => {
        const customer = users.find(user => user._id === id);
        return customer ? { 
          phone_number: customer.phone_number, 
          full_name: customer.full_name,
          email: customer.email,
          id: customer._id
        } : null;
      })
      .filter(customer => customer);
  };

  const columns = [
    {
      key: "select",
      header: (
        <Checkbox checked={selectAll} onChange={(e) => handleSelectAll(e)} />
      ),
    },
    { key: "id", header: "SL. NO" },
    { key: "approval_status", header: "Approval Status" },
    { key: "customer_id", header: "Customer Id" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "address", header: "Customer Address" },
    { key: "pincode", header: "Customer Pincode" },
    { key: "collection_area", header: "Area" },
  ];

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allCustomerIds = TableUsers.map((user) => user._id);
      setSelectedCustomers(allCustomerIds);
    } else {
      setSelectedCustomers([]);
    }
    setSelectAll(e.target.checked);
    setShowAllCustomers(false); // Reset show all state when selection changes
  };

  const handlePaymentLinkChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentLinkData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGeneratePaymentLink = async () => {
    if (
      !paymentLinkData.amount ||
      isNaN(paymentLinkData.amount) ||
      paymentLinkData.amount <= 0
    ) {
      setAlertConfig({
        visibility: true,
        message: "Please enter a valid amount",
        type: "error",
      });
      return;
    }
    if (!paymentLinkData.purpose.trim()) {
      setAlertConfig({
        visibility: true,
        message: "Purpose is required for payment link",
        type: "error",
      });
      return;
    }
    
    const customerDetails = getSelectedCustomerDetails();
    
    if (customerDetails.length === 0) {
      setAlertConfig({
        visibility: true,
        message: "No valid customers selected",
        type: "error",
      });
      return;
    }

    setPaymentLinkLoading(true);
    try {
      const response = await api.post("/paymentapi/create-payment", {
        customers: customerDetails,  // Now includes phone_number, full_name, and email
        amount: paymentLinkData.amount,
        purpose: paymentLinkData.purpose,
        expiry: paymentLinkData.expiry,
        notify_customer: paymentLinkData.notify_customer,
        send_sms: paymentLinkData.send_sms,
        send_email: paymentLinkData.send_email,
      });
      
      if (response.data.success) {
        setAlertConfig({
          visibility: true,
          message: `Payment links generated and sent to ${customerDetails.length} customer(s)`,
          type: "success",
        });
        setSelectedCustomers([]);
        setSelectAll(false);
        setShowPaymentLinkModal(false);
        setShowAllCustomers(false); // Reset show all state
      } else {
        throw new Error(
          response.data.message || "Failed to generate payment links"
        );
      }
    } catch (error) {
      setAlertConfig({
        visibility: true,
        message:
          error.message ||
          "Failed to generate payment links. Please try again.",
        type: "error",
      });
    } finally {
      setPaymentLinkLoading(false);
    }
  };

  return (
    <>
      <div>
        <div className="flex mt-20">
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
                <div className="flex space-x-4">
                  {selectedCustomers.length > 0 && (
                    <button
                      onClick={() => setShowPaymentLinkModal(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded shadow-md hover:bg-green-700 transition duration-200 flex items-center"
                    >
                      <FaMoneyBillWave className="mr-2" />
                      Generate Payment Links ({selectedCustomers.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
            {TableUsers?.length > 0 && !isLoading ? (
              <DataTable
                catcher="_id"
                data={TableUsers.map((user) => ({
                  ...user,
                  select: (
                    <Checkbox
                      checked={selectedCustomers.includes(user._id)}
                      onChange={() => handleSelectCustomer(user._id)}
                    />
                  ),
                }))}
                columns={columns}
                exportedPdfName="Payment Link"
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
        <Modal
          isVisible={showPaymentLinkModal}
          onClose={() => {
            setShowPaymentLinkModal(false);
            setShowAllCustomers(false);
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <div className="flex items-center mb-4">
              <FaMoneyBillWave className="text-2xl text-green-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-900">
                Generate Payment Links
              </h3>
            </div>
            
            {/* Display limited customer details initially */}
            <div className="mb-4 max-h-60 overflow-y-auto pr-2">
              <p className="text-gray-600 mb-2">
                {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected:
              </p>
              
              {/* Show limited customers (first 5) */}
              {getSelectedCustomerDetails().slice(0, showAllCustomers ? getSelectedCustomerDetails().length : 5).map((customer, index) => (
                <div 
                  key={customer.id} 
                  className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2"
                >
                  <div>
                    <div className="font-medium text-gray-800">{customer.full_name}</div>
                    <div className="text-sm text-gray-600">Phone: {customer.phone_number}</div>
                    <div className="text-sm text-gray-600">Email: {customer.email || 'Not provided'}</div>
                  </div>
                </div>
              ))}
              
              {/* Show "Show All" button if there are more than 5 customers */}
              {getSelectedCustomerDetails().length > 5 && !showAllCustomers && (
                <button 
                  onClick={() => setShowAllCustomers(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 flex items-center"
                >
                  Show all {getSelectedCustomerDetails().length} customers
                </button>
              )}
              
              {/* Show "Show Less" button if showing all customers */}
              {showAllCustomers && (
                <button 
                  onClick={() => setShowAllCustomers(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium mt-2 flex items-center"
                >
                  Show less
                </button>
              )}
            </div>
            
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleGeneratePaymentLink();
              }}
            >
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="amount"
                >
                  Amount (INR) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="amount"
                  value={paymentLinkData.amount}
                  onChange={handlePaymentLinkChange}
                  id="amount"
                  placeholder="Enter amount"
                  min="1"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="purpose"
                >
                  Purpose <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="purpose"
                  value={paymentLinkData.purpose}
                  onChange={handlePaymentLinkChange}
                  id="purpose"
                  placeholder="Enter payment purpose"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="expiry"
                >
                  Link Expiry
                </label>
                <Select
                  className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                  placeholder="Select Expiry Time"
                  value={paymentLinkData.expiry}
                  onChange={(value) =>
                    setPaymentLinkData((prev) => ({ ...prev, expiry: value }))
                  }
                >
                  <Select.Option value="86400">24 hours</Select.Option>
                  <Select.Option value="172800">48 hours</Select.Option>
                  <Select.Option value="259200">72 hours</Select.Option>
                  <Select.Option value="604800">7 days</Select.Option>
                </Select>
                <p className="mt-1 text-xs text-gray-500">
                  Payment link will expire after selected time period
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">
                  Notification Settings
                </h4>
                <div className="pl-4 space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      checked={paymentLinkData.notify_customer}
                      onChange={handlePaymentLinkChange}
                      name="notify_customer"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Notify customer about payment link
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      checked={paymentLinkData.send_sms}
                      onChange={handlePaymentLinkChange}
                      name="send_sms"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Send via SMS
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      checked={paymentLinkData.send_email}
                      onChange={handlePaymentLinkChange}
                      name="send_email"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Send via Email
                    </label>
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentLinkModal(false);
                    setShowAllCustomers(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentLinkLoading}
                  className={`w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    paymentLinkLoading
                      ? "bg-blue-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {paymentLinkLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    "Generate & Send Links"
                  )}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default User;