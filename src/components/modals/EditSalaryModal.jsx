import React, { useState, useEffect } from "react";
import API from "../../instance/TokenInstance";
import { notification } from "antd";

const EditSalaryModal = ({ isVisible, onClose, salary, onEditSuccess }) => {
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    total_paid_amount: "",
    note: "",
    pay_type: "",
    transaction_id: "",
  });
  const [originalValues, setOriginalValues] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isVisible && salary) {
      const metadata = salary.payout_metadata;
      const initialValues = {
        total_paid_amount: metadata.total_paid_amount,
        note: metadata.note,
        pay_type: metadata.pay_type,
        transaction_id: metadata.transaction_id || "",
      };
      setFormValues(initialValues);
      setOriginalValues(initialValues);
      setHasChanges(false);
      setErrors({});
    }
  }, [isVisible, salary]);

  useEffect(() => {
    if (originalValues) {
      const changed = Object.keys(originalValues).some(key => {
        return formValues[key] !== originalValues[key];
      });
      setHasChanges(changed);
    }
  }, [formValues, originalValues]);

  const validateForm = () => {
    const newErrors = {};
    if (formValues.total_paid_amount !== "" && (isNaN(formValues.total_paid_amount) || formValues.total_paid_amount < 0)) {
      newErrors.total_paid_amount = "Amount must be a positive number";
    }
    if (formValues.pay_type === "online" && !formValues.transaction_id) {
      newErrors.transaction_id = "Transaction ID is required for online payments";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const payload = {};
      
      // Only include fields that have changed
      if (formValues.total_paid_amount !== originalValues.total_paid_amount) {
        payload.total_paid_amount = parseFloat(formValues.total_paid_amount);
      }
      if (formValues.note !== originalValues.note) {
        payload.note = formValues.note;
      }
      if (formValues.pay_type !== originalValues.pay_type) {
        payload.pay_type = formValues.pay_type;
      }
      if (formValues.transaction_id !== originalValues.transaction_id) {
        payload.transaction_id = formValues.transaction_id;
      }
      
      if (Object.keys(payload).length === 0) {
        api.open({
          message: "No changes made",
          description: "No fields were changed",
          className: "bg-blue-500 rounded-lg font-semibold text-white",
        });
        return;
      }
      
      const res = await API.put(`/salary/edit/${salary._id}`, payload);
      
      api.open({
        message: "Salary Payment Updated",
        description: "Salary payment has been updated successfully",
        className: "bg-green-500 rounded-lg font-semibold text-white",
      });
      
      if (onEditSuccess) onEditSuccess();
    } catch (error) {
      const message = error.response?.data?.error || "Failed to update salary payment";
      api.open({
        message: "Update Failed",
        description: message,
        className: "bg-red-500 rounded-lg font-semibold text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!salary) return null;

  return (
    <>
      {contextHolder}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto transform transition-all duration-300 relative"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Salary Payment</h2>
            
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="font-semibold text-gray-700">Employee:</span>
                <span className="ml-2">{salary.employee_id?.name || "N/A"}</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="font-semibold text-gray-700">Period:</span>
                <span className="ml-2">
                  {new Date(salary.payout_metadata.date_range.from).toLocaleDateString()} to 
                  {new Date(salary.payout_metadata.date_range.to).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700">Original Amount:</span>
                <span className="ml-2 text-green-600">₹{salary.payout_metadata.total_paid_amount}</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actual Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formValues.total_paid_amount}
                    onChange={(e) => setFormValues({...formValues, total_paid_amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter new amount"
                  />
                  {errors.total_paid_amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.total_paid_amount}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type
                  </label>
                  <select
                    value={formValues.pay_type}
                    onChange={(e) => setFormValues({...formValues, pay_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                
                {formValues.pay_type === "online" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={formValues.transaction_id}
                      onChange={(e) => setFormValues({...formValues, transaction_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter transaction ID"
                    />
                    {errors.transaction_id && (
                      <p className="text-red-500 text-xs mt-1">{errors.transaction_id}</p>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formValues.note}
                    onChange={(e) => setFormValues({...formValues, note: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="Add any notes about this payment"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!hasChanges || loading}
                  className={`px-4 py-2 rounded-md text-white ${
                    hasChanges && !loading 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditSalaryModal;