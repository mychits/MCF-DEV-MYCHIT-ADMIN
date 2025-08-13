/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Input, Select, Dropdown, Checkbox } from "antd";
import { IoMdMore } from "react-icons/io";
import {  FaExclamationTriangle, FaRedo } from "react-icons/fa";
import Navbar from "../components/layouts/Navbar";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { fieldSize } from "../data/fieldSize";

const FailedPaymentLinks = () => {
  const [failedPayments, setFailedPayments] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [retryData, setRetryData] = useState({
    amount: "",
    purpose: "",
    expiry: "86400",
    notify_customer: true,
    send_sms: true,
    send_email: true
  });
  const [retryLoading, setRetryLoading] = useState(false);
  
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  useEffect(() => {
    fetchFailedPayments();
  }, []);

  const fetchFailedPayments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/payment/failed-links");
      const formattedData = response.data.map((payment, index) => ({
        _id: payment._id,
        id: index + 1,
        customer_id: payment.customer_id,
        customer_name: payment.customer?.full_name || "N/A",
        customer_phone: payment.customer?.phone_number || "N/A",
        amount: payment.amount,
        purpose: payment.purpose,
        failure_reason: (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded">
            {payment.failure_reason || "Unknown error"}
          </span>
        ),
        failed_at: new Date(payment.failed_at).toLocaleString(),
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
                        className="text-blue-600"
                        onClick={() => handleRetrySingle(payment._id)}
                      >
                        Retry Payment Link
                      </div>
                    ),
                  },
                  {
                    key: "2",
                    label: (
                      <div
                        className="text-gray-600"
                        onClick={() => handleViewDetails(payment)}
                      >
                        View Details
                      </div>
                    ),
                  }
                ],
              }}
              placement="bottomLeft"
            >
              <IoMdMore className="text-bold" />
            </Dropdown>
          </div>
        ),
      }));
      
      setFailedPayments(response.data);
      setTableData(formattedData);
    } catch (error) {
      console.error("Error fetching failed payment links:", error);
      setAlertConfig({
        visibility: true,
        message: "Failed to load failed payment links",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId) 
        : [...prev, paymentId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allPaymentIds = tableData.map(payment => payment._id);
      setSelectedPayments(allPaymentIds);
    } else {
      setSelectedPayments([]);
    }
    setSelectAll(e.target.checked);
  };

  const handleRetrySingle = (paymentId) => {
    const payment = failedPayments.find(p => p._id === paymentId);
    if (payment) {
      setRetryData({
        amount: payment.amount,
        purpose: payment.purpose,
        expiry: "86400",
        notify_customer: true,
        send_sms: true,
        send_email: true
      });
      setSelectedPayments([paymentId]);
      setShowRetryModal(true);
    }
  };

  const handleViewDetails = (payment) => {
    setAlertConfig({
      visibility: true,
      message: `Payment Link Details:\n\nCustomer: ${payment.customer?.full_name}\nAmount: ₹${payment.amount}\nPurpose: ${payment.purpose}\nFailure Reason: ${payment.failure_reason || "Unknown error"}\nFailed At: ${new Date(payment.failed_at).toLocaleString()}`,
      type: "info"
    });
  };

  const handleRetryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRetryData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRetryPaymentLinks = async () => {
    if (!retryData.amount || isNaN(retryData.amount) || retryData.amount <= 0) {
      setAlertConfig({
        visibility: true,
        message: "Please enter a valid amount",
        type: "error"
      });
      return;
    }

    if (!retryData.purpose.trim()) {
      setAlertConfig({
        visibility: true,
        message: "Purpose is required for payment link",
        type: "error"
      });
      return;
    }

    setRetryLoading(true);
    try {
      const response = await api.post("/payment/retry-failed-links", {
        paymentIds: selectedPayments,
        amount: retryData.amount,
        purpose: retryData.purpose,
        expiry: retryData.expiry,
        notify_customer: retryData.notify_customer,
        send_sms: retryData.send_sms,
        send_email: retryData.send_email
      });

      if (response.data.success) {
        setAlertConfig({
          visibility: true,
          message: `Successfully retried payment links for ${response.data.retryCount} customer(s)`,
          type: "success"
        });
        
        // Refresh the failed payments list
        fetchFailedPayments();
        setSelectedPayments([]);
        setSelectAll(false);
        setShowRetryModal(false);
      } else {
        throw new Error(response.data.message || "Failed to retry payment links");
      }
    } catch (error) {
      setAlertConfig({
        visibility: true,
        message: error.message || "Failed to retry payment links. Please try again.",
        type: "error"
      });
    } finally {
      setRetryLoading(false);
    }
  };

  const columns = [
    { 
      key: "select", 
      header: (
        <Checkbox 
          checked={selectAll} 
          onChange={handleSelectAll} 
        />
      ) 
    },
    { key: "id", header: "SL. NO" },
    { key: "customer_id", header: "Customer ID" },
    { key: "customer_name", header: "Customer Name" },
    { key: "customer_phone", header: "Phone Number" },
    { key: "amount", header: "Amount (₹)" },
    { key: "purpose", header: "Purpose" },
    { key: "failure_reason", header: "Failure Reason" },
    { key: "failed_at", header: "Failed At" },
    { key: "action", header: "Action" },
  ];

  return (
    <>
      <div>
        <div className="flex mt-20">
          <Sidebar />
          <Navbar 
            onGlobalSearchChangeHandler={(e) => setSearchTerm(e.target.value)} 
            visibility={true}
          />
          <CustomAlertDialog
            type={alertConfig.type}
            isVisible={alertConfig.visibility}
            message={alertConfig.message}
            onClose={() => 
              setAlertConfig(prev => ({ ...prev, visibility: false }))
            }
          />
          <div className="flex-grow p-7">
            <div className="mt-6 mb-8">
              <div className="flex justify-between items-center w-full">
                <div>
                  <h1 className="text-2xl font-semibold flex items-center">
                    <FaExclamationTriangle className="text-yellow-500 mr-2" />
                    Failed Payment Links
                  </h1>
                  <p className="text-gray-600 mt-1">
                    View and retry payment links that failed to send
                  </p>
                </div>
                {selectedPayments.length > 0 && (
                  <button
                    onClick={() => setShowRetryModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow-md hover:bg-blue-700 transition duration-200 flex items-center"
                  >
                    <FaRedo className="mr-2" />
                    Retry Selected ({selectedPayments.length})
                  </button>
                )}
              </div>
            </div>

            {tableData?.length > 0 && !isLoading ? (
              <DataTable
                catcher="_id"
                data={tableData.map(payment => ({
                  ...payment,
                  select: (
                    <Checkbox 
                      checked={selectedPayments.includes(payment._id)} 
                      onChange={() => handleSelectPayment(payment._id)} 
                    />
                  )
                }))}
                columns={columns}
                exportedPdfName="Payment Failed Link"
                exportedFileName={`Failed-Payment-Links-${new Date().toISOString().split('T')[0]}.csv`}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={tableData.length <= 0}
                data="Failed Payment Links"
              />
            )}
          </div>
        </div>
        
        {/* Retry Payment Links Modal */}
        <Modal isVisible={showRetryModal} onClose={() => setShowRetryModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <div className="flex items-center mb-4">
              <FaRedo className="text-2xl text-blue-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-900">Retry Payment Links</h3>
            </div>
            
            <p className="mb-4 text-gray-600">
              {selectedPayments.length} failed payment link{selectedPayments.length !== 1 ? 's' : ''} selected
            </p>
            
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              handleRetryPaymentLinks();
            }}>
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
                  value={retryData.amount}
                  onChange={handleRetryChange}
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
                  value={retryData.purpose}
                  onChange={handleRetryChange}
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
                  value={retryData.expiry}
                  onChange={(value) => setRetryData(prev => ({ ...prev, expiry: value }))}
                >
                  <Select.Option value="86400">24 hours</Select.Option>
                  <Select.Option value="172800">48 hours</Select.Option>
                  <Select.Option value="259200">72 hours</Select.Option>
                  <Select.Option value="604800">7 days</Select.Option>
                </Select>
                <p className="mt-1 text-xs text-gray-500">Payment link will expire after selected time period</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Notification Settings</h4>
                <div className="pl-4 space-y-2">
                  <div className="flex items-center">
                    <Checkbox 
                      checked={retryData.notify_customer} 
                      onChange={handleRetryChange}
                      name="notify_customer"
                    />
                    <label className="ml-2 text-sm text-gray-700">Notify customer about payment link</label>
                  </div>
                  
                  <div className="flex items-center">
                    <Checkbox 
                      checked={retryData.send_sms} 
                      onChange={handleRetryChange}
                      name="send_sms"
                    />
                    <label className="ml-2 text-sm text-gray-700">Send via SMS</label>
                  </div>
                  
                  <div className="flex items-center">
                    <Checkbox 
                      checked={retryData.send_email} 
                      onChange={handleRetryChange}
                      name="send_email"
                    />
                    <label className="ml-2 text-sm text-gray-700">Send via Email</label>
                  </div>
                </div>
              </div>
              
              <div className="w-full flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRetryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={retryLoading}
                  className={`w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    retryLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {retryLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Retrying...
                    </span>
                  ) : (
                    "Retry Payment Links"
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

export default FailedPaymentLinks;