import React, { useState, useEffect } from "react";
import API from "../../instance/TokenInstance";
import { notification } from "antd";
import { FaCalendar } from "react-icons/fa";
import { FaRupeeSign } from "react-icons/fa";
import { Select } from "antd";
const EditSalaryModal = ({ isVisible, onClose, salary, onEditSuccess }) => {
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    pay_date: "",
    total_paid_amount: "",
    other_payments: "",
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
        pay_date: new Date(metadata.date_range.from)
          .toISOString()
          .split("T")[0],
        total_paid_amount: metadata.total_paid_amount,
        other_payments: metadata.other_payments || "",
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
      const changed = Object.keys(originalValues).some((key) => {
        return formValues[key] !== originalValues[key];
      });
      setHasChanges(changed);
    }
  }, [formValues, originalValues]);

  const validateForm = () => {
    const newErrors = {};
    if (
      formValues.total_paid_amount !== "" &&
      (isNaN(formValues.total_paid_amount) || formValues.total_paid_amount < 0)
    ) {
      newErrors.total_paid_amount = "Amount must be a positive number";
    }
    if (
      formValues.other_payments !== "" &&
      (isNaN(formValues.other_payments) || formValues.other_payments < 0)
    ) {
      newErrors.other_payments = "Other payments must be a positive number";
    }
    if (formValues.pay_type === "online" && !formValues.transaction_id) {
      newErrors.transaction_id =
        "Transaction ID is required for online payments";
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
      if (formValues.pay_date !== originalValues.pay_date) {
        payload.pay_date = formValues.pay_date;
      }
      if (formValues.total_paid_amount !== originalValues.total_paid_amount) {
        payload.total_paid_amount = parseFloat(formValues.total_paid_amount);
      }
      if (formValues.other_payments !== originalValues.other_payments) {
        payload.other_payments = parseFloat(formValues.other_payments);
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
      const message =
        error.response?.data?.error || "Failed to update salary payment";
      api.open({
        message: "Update Failed",
        description: message,
        className: "bg-red-500 rounded-lg font-semibold text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!salary || !isVisible) return null;

  return (
    <>
      {contextHolder}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 relative shadow-2xl border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  Edit Salary Payment
                </h2>
                <p className="text-gray-600 text-sm">
                  Update payment details for{" "}
                  {salary.employee_id?.name || "this employee"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-100 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Payment Summary
                  </h3>
                  <p className="text-xs text-blue-600 mt-1">
                    Period:{" "}
                    {new Date(
                      salary.payout_metadata.date_range.from
                    ).toLocaleDateString()}{" "}
                    to
                    {new Date(
                      salary.payout_metadata.date_range.to
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-900">
                    ₹
                    {(
                      parseFloat(
                        salary.payout_metadata.total_paid_amount || 0
                      ) + parseFloat(salary.payout_metadata.other_payments || 0)
                    ).toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-600">Total Payment Amount</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Date Section */}
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FaCalendar className="mr-2 text-blue-500" />
                  Payment Date
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Payment Date
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {originalValues?.pay_date || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Payment Date
                    </label>
                    <input
                      type="date"
                      value={formValues.pay_date}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          pay_date: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.pay_date
                          ? "border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      min={salary.payout_metadata.date_range.from}
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {errors.pay_date && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.pay_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Section */}
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FaRupeeSign className="mr-2 text-green-500" />
                  Payment Amount
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Salary Amount
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        ₹{salary.payout_metadata.total_salary.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Paid Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formValues.total_paid_amount}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          total_paid_amount: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.total_paid_amount
                          ? "border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="Enter payment amount"
                    />
                    {errors.total_paid_amount && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.total_paid_amount}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Payments (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formValues.other_payments}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        other_payments: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.other_payments
                        ? "border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="Enter additional payments"
                  />
                  {errors.other_payments && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.other_payments}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Additional payments will be added to the base amount
                  </p>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  Payment Method
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col justify-between  p-3 rounded">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Payment Method
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900 capitalize">
                        {originalValues?.pay_type || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between  p-3 rounded">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Payment Method
                    </label>
                    <Select
                      value={formValues.pay_type}
                      onChange={(value) =>
                        setFormValues({ ...formValues, pay_type: value })
                      }
                      className="w-full h-[42px]"
                    >
                      <Select.Option value="cash">Cash</Select.Option>
                      <Select.Option value="online">
                        Online Transfer
                      </Select.Option>
                      <Select.Option value="cheque">Cheque</Select.Option>
                      <Select.Option value="bank_transfer">
                        Bank Transfer
                      </Select.Option>
                    </Select>
                  </div>
                </div>

                {formValues.pay_type === "online" && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={formValues.transaction_id}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          transaction_id: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.transaction_id
                          ? "border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="Enter transaction ID"
                    />
                    {errors.transaction_id && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.transaction_id}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  Additional Notes
                </h3>
                <textarea
                  value={formValues.note}
                  onChange={(e) =>
                    setFormValues({ ...formValues, note: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.note
                      ? "border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  rows="3"
                  placeholder="Add any notes about this payment..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  These notes will be visible on the salary slip
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!hasChanges || loading}
                  className={`px-5 py-2.5 rounded-lg text-white font-medium transition-colors ${
                    hasChanges && !loading
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
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
