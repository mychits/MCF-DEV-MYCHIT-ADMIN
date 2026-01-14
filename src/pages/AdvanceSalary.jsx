/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import Navbar from "../components/layouts/Navbar";
import { Select, Dropdown, Drawer, Modal, Empty, Alert } from "antd";
import { IoMdMore } from "react-icons/io";
import BackdropBlurLoader from "../components/loaders/BackdropBlurLoader";
import { numberToIndianWords } from "../helpers/numberToIndianWords";
import { FiCalendar, FiCreditCard, FiHash } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
const EmployeeAdvancePayment = () => {
  const [employees, setEmployees] = useState([]);
  const [tablePayments, setTablePayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [openBackdropLoader, setOpenBackdropLoader] = useState(false);
  const [editId, setEditId] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const initialForm = {
    employee_id: "",
    pay_date: today,
    month: new Date().toLocaleString("default", { month: "long" }),
    pay_type: "cash",
    transaction_id: "",
    amount: 0,
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "",
    type: "info",
    noReload: true,
  });
useEffect(() => {
  if (alertConfig.visibility) {
    const timer = setTimeout(() => {
      setAlertConfig((prev) => ({ ...prev, visibility: false }));
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [alertConfig.visibility]);
  useEffect(() => {
    fetchEmployees();
    fetchAdvanceHistory();
  }, []);

  const fetchEmployees = async () => {
    const res = await api.get("/employee");
    if (res.data.status) setEmployees(res.data.employee);
  };

  const fetchAdvanceHistory = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/advance-payment/get-advances");
      const formatted = response.data.map((item, index) => ({
        ...item,
        id: index + 1,
        date: item.pay_date?.split("T")[0],
        employeeName: item.employee_id?.name || "N/A",
        action: (
          <Dropdown
            menu={{
              items: [
                { key: "1", label: "Edit", onClick: () => handleEdit(item) },
                {
                  key: "2",
                  label: <span className="text-red-500">Delete</span>,
                  onClick: () => showDeleteConfirm(item._id),
                },
              ],
            }}
            trigger={["click"]}>
            <IoMdMore className="cursor-pointer text-xl" />
          </Dropdown>
        ),
      }));
      setTablePayments(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this record?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      onOk() {
        handleDelete(id);
      },
    });
  };

  const handleEdit = (item) => {
    const employeeId =
      typeof item.employee_id === "object"
        ? item.employee_id._id
        : item.employee_id;

    setEditId(item._id);
    setFormData({
      employee_id: employeeId,
      pay_date: item.pay_date?.split("T")[0],
      month:
        item.month || new Date().toLocaleString("default", { month: "long" }),
      pay_type: item.pay_type,
      transaction_id: item.transaction_id || "",
      amount: item.amount,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      setOpenBackdropLoader(true);
      await api.delete(`/advance-payment/delete-advance/${id}`);
      setAlertConfig({
        visibility: true,
        message: "Data Deleted Successfully!",
        type: "success",
        noReload: true,
      });
      fetchAdvanceHistory();
    } catch (error) {
      setAlertConfig({
        visibility: true,
        message: "Delete failed",
        type: "error",
        noReload: true,
      });
    } finally {
      setOpenBackdropLoader(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    console.log(editId, "this is editId", formData);

    try {
      setOpenBackdropLoader(true);
      if (editId) {
        await api.put(`/advance-payment/update-advance/${editId}`, formData);
      } else {
        await api.post("/advance-payment/add-advance", formData);
      }
      setAlertConfig({
        visibility: true,
        message: editId ? "Data Updated Successfully!" : "Data Added Successfully!",
        type: "success",
        noReload: true,
      });
      closeDrawer();
      fetchAdvanceHistory();
    } catch (error) {
      setAlertConfig({
        visibility: true,
        message: "Error saving data",
        type: "error",
        noReload: true,
      });
    } finally {
      setOpenBackdropLoader(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.employee_id) errs.employee = "Required";
    if (!formData.amount || formData.amount <= 0)
      errs.amount = "Enter valid amount";
    if (!formData.month) errs.month = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const closeDrawer = () => {
    setShowModal(false);
    setEditId(null);
    setFormData(initialForm);
    setErrors({});
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "date", header: "Paid Date" },
    { key: "employeeName", header: "Employee" },
    { key: "month", header: "Month" },
    { key: "amount", header: "Amount" },
    { key: "pay_type", header: "Mode" },
    { key: "action", header: "Action" },
  ];

  return (
    <>
      {openBackdropLoader && <BackdropBlurLoader title={"Processing..."} />}
      <div className="flex mt-20">
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        <Sidebar />
        {alertConfig.visibility && (
  <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
    <Alert
      message={alertConfig.message}
      type={alertConfig.type} // success, info, warning, error
      showIcon
      closable
      onClose={() => setAlertConfig({ ...alertConfig, visibility: false })}
    />
  </div>
)}

        <div className="flex-grow p-7">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Employee Advances</h1>
            <button
              onClick={() => {
                setEditId(null);
                setFormData(initialForm);
                setShowModal(true);
              }}
              className="bg-blue-950 text-white px-4 py-2 rounded">
              + Add Advance
            </button>
          </div>

          {tablePayments.length <= 0 ? (
            <Empty description="No Advance Payment Data Found" />
          ) : (
            <DataTable
              data={tablePayments.filter((item) =>
                item.employeeName
                  ?.toLowerCase()
                  .includes(searchText.toLowerCase())
              )}
              columns={columns}
            />
          )}
        </div>

        <Drawer
          title={
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaRupeeSign className="text-blue-600" />
              </div>
              <span className="text-lg font-semibold">
                {editId ? "Edit Advance Payment" : "New Advance Payment"}
              </span>
            </div>
          }
          open={showModal}
          onClose={closeDrawer}
          width={480}>
          <form onSubmit={handleSubmit} className="space-y-6 p-1">
            {/* Employee Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Employee <span className="text-red-500">*</span>
              </label>
              <Select
                showSearch
                size="large"
                className="w-full"
                placeholder="Search and select employee"
                value={formData.employee_id || undefined}
                optionFilterProp="label"
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
                onChange={(val) =>
                  setFormData({ ...formData, employee_id: val })
                }>
                {employees.map((emp) => (
                  <Select.Option
                    key={emp._id}
                    value={emp._id}
                    label={`${emp.name} ${emp.employeeCode}`} // 🔑 searchable text
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      {emp.name} | {emp.employeeCode}
                    </div>
                  </Select.Option>
                ))}
              </Select>

              {errors.employee && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.employee}
                </p>
              )}
            </div>

            {/* Payment Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FiCalendar className="w-4 h-4 text-gray-500" />
                Payment Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={formData.pay_date}
                  onChange={(e) =>
                    setFormData({ ...formData, pay_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaRupeeSign className="w-4 h-4 text-gray-500" />
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
              {formData.amount && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <p className="text-blue-700 text-xs font-medium uppercase tracking-wide">
                    {numberToIndianWords(formData.amount)}
                  </p>
                </div>
              )}
              {errors.amount && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Payment Mode */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FiCreditCard className="w-4 h-4 text-gray-500" />
                Payment Mode
              </label>
              <Select
                size="large"
                className="w-full"
                value={formData.pay_type}
                onChange={(val) => setFormData({ ...formData, pay_type: val })}>
                <Select.Option value="cash">
                  <div className="flex items-center gap-2">Cash</div>
                </Select.Option>
                <Select.Option value="online">
                  <div className="flex items-center gap-2">Online/UPI</div>
                </Select.Option>
                <Select.Option value="cheque">
                  <div className="flex items-center gap-2">Cheque</div>
                </Select.Option>
              </Select>
            </div>

            {/* Transaction/Cheque ID */}
            {formData.pay_type !== "cash" && (
              <div className="space-y-2 animate-fadeIn">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiHash className="w-4 h-4 text-gray-500" />
                  {formData.pay_type === "cheque"
                    ? "Cheque Number"
                    : "Transaction ID"}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={
                    formData.pay_type === "cheque"
                      ? "Enter cheque number"
                      : "Enter transaction/UPI ID"
                  }
                  value={formData.transaction_id}
                  onChange={(e) =>
                    setFormData({ ...formData, transaction_id: e.target.value })
                  }
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                {editId ? "Update Advance Payment" : "Save Advance Payment"}
              </button>
            </div>
          </form>
        </Drawer>
      </div>
    </>
  );
};

export default EmployeeAdvancePayment;
