import {
  DatePicker,
  Drawer,
  Dropdown,
  Modal,
  Input,
  Form,
  Select,
  Button,
  message,
  Popconfirm,
} from "antd";
import Navbar from "../components/layouts/Navbar";
import Sidebar from "../components/layouts/Sidebar";
import DataTable from "../components/layouts/Datatable";
import { useEffect, useState } from "react";
import API from "../instance/TokenInstance";
import dayjs from "dayjs";
import { Select as AntSelect, Segmented, Button as AntButton } from "antd";
import { IoMdMore } from "react-icons/io";
import { Link } from "react-router-dom";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const SalaryPayment = () => {
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [calculateLoading, setCalculateLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [allSalaryPayments, setAllSalarypayments] = useState([]);
  const [employeeDetailsLoading, setEmployeeDetailsLoading] = useState(false);
  const [currentSalaryId, setCurrentSalaryId] = useState(null);
  const [calculatedSalary, setCalculatedSalary] = useState(null);
  const [showAdditionalPayments, setShowAdditionalPayments] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();

  const [updateFormData, setUpdateFormData] = useState({
    employee_id: "",
    month: "",
    year: "",
    earnings: {
      basic: 0,
      hra: 0,
      travel_allowance: 0,
      medical_allowance: 0,
      basket_of_benifits: 0,
      performance_bonus: 0,
      other_allowances: 0,
      conveyance: 0,
    },
    deductions: {
      income_tax: 0,
      esi: 0,
      epf: 0,
      professional_tax: 0,
    },
    additional_payments: [],
  });

  const thisYear = dayjs().format("YYYY");
  const earningsObject = {
    basic: 0,
    hra: 0,
    travel_allowance: 0,
    medical_allowance: 0,
    basket_of_benifits: 0,
    performance_bonus: 0,
    other_allowances: 0,
    conveyance: 0,
  };
  const deductionsObject = {
    income_tax: 0,
    esi: 0,
    epf: 0,
    professional_tax: 0,
  };

  const columns = [
    { key: "siNo", header: "SL. NO" },
    { key: "employeeName", header: "Employee Name" },
    { key: "employeeCode", header: "Employee Id" },
    { key: "transactionId", header: "Transaction Id" },
    { key: "salaryMonth", header: "Salary Month" },
    { key: "salaryYear", header: "Year" },
    { key: "payDate", header: "Pay Date" },
    { key: "netPayable", header: "Net Payable" },
    { key: "paidAmount", header: "Paid Amount" },
    { key: "action", header: "Action" },
  ];

  const months = [
    { label: "January", value: "January", disabled: false },
    { label: "February", value: "February", disabled: false },
    { label: "March", value: "March", disabled: false },
    { label: "April", value: "April", disabled: false },
    { label: "May", value: "May", disabled: false },
    { label: "June", value: "June", disabled: false },
    { label: "July", value: "July", disabled: false },
    { label: "August", value: "August", disabled: false },
    {
      label: "September",
      value: "September",
      disabled: false,
    },
    { label: "October", value: "October", disabled: false },
    { label: "November", value: "November", disabled: false },
    { label: "December", value: "December", disabled: false },
  ];

  const previousMonth = months[dayjs().subtract(2, "month").format("MM")].label;
  const [formData, setFormData] = useState({
    employee_id: "",
    month: previousMonth,
    year: thisYear,
    earnings: {
      basic: 0,
      hra: 0,
      travel_allowance: 0,
      medical_allowance: 0,
      basket_of_benifits: 0,
      performance_bonus: 0,
      other_allowances: 0,
      conveyance: 0,
    },
    deductions: {
      income_tax: 0,
      esi: 0,
      epf: 0,
      professional_tax: 0,
    },
    additional_payments: [],
    total_salary_payable: 0,
    paid_amount: 0,
  });

  async function fetchEmployees() {
    try {
      const responseData = await API.get("/employee");
      const filteredEmployee = responseData?.data?.employee?.map((emp) => ({
        value: emp?._id,
        label: `${emp?.name} | ${emp?.phone_number}` || "Unknown Employee",
      }));
      setEmployees(filteredEmployee || []);
    } catch (error) {
      setEmployees([]);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function getSalaryById(id) {
    try {
      const response = await API.get(`/salary-payment/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching salary by ID:", error);
      return null;
    }
  }

  const handleEdit = async (id) => {
    try {
      setUpdateLoading(true);
      setIsOpenUpdateModal(true);
      const salaryData = await getSalaryById(id);
      if (salaryData) {
        setCurrentSalaryId(id);

        // Convert year string to dayjs object for the DatePicker
        const yearAsDayjs = dayjs(salaryData.salary_year, "YYYY");

        const formData = {
          employee_id: salaryData.employee_id._id,
          month: salaryData.salary_month,
          year: yearAsDayjs, // Use dayjs object here
          earnings: salaryData.earnings,
          deductions: salaryData.deductions,
          additional_payments: salaryData.additional_payments || [],
          total_salary_payable: salaryData.total_salary_payable || 0,
          paid_amount: salaryData.paid_amount || 0,
        };

        setUpdateFormData(formData);
        updateForm.setFieldsValue(formData);
      }
    } catch (error) {
      message.error("Failed to fetch salary details");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      setDeleteLoading(true);
      await API.delete(`/salary-payment/${id}`);
      message.success("Salary payment deleted successfully");
      setDeleteModalOpen(false);
      getAllSalary();
    } catch (error) {
      message.error("Failed to delete salary payment");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateChange = (changedValues, allValues) => {
    // Handle the year field specifically
    if (changedValues.year && dayjs.isDayjs(changedValues.year)) {
      changedValues.year = changedValues.year.format("YYYY");
    }
    
    setUpdateFormData({
      ...updateFormData,
      ...changedValues,
      ...allValues,
    });
  };

  const handleUpdateSubmit = async () => {
    try {
      setUpdateLoading(true);

      // Calculate total earnings and deductions
      const totalEarnings = Object.values(updateFormData.earnings).reduce(
        (sum, value) => sum + Number(value),
        0
      );
      const totalDeductions = Object.values(updateFormData.deductions).reduce(
        (sum, value) => sum + Number(value),
        0
      );

      // Calculate additional payments total
      const additionalPaymentsTotal = updateFormData.additional_payments.reduce(
        (sum, payment) => sum + Number(payment.value),
        0
      );

      // Calculate net payable
      const netPayable = totalEarnings - totalDeductions + additionalPaymentsTotal;

      const updateData = {
        ...updateFormData,
        earnings: updateFormData.earnings, // Ensure this is an object
        deductions: updateFormData.deductions, // Ensure this is an object
        net_payable: netPayable,
        total_salary_payable: updateFormData.total_salary_payable || netPayable,
        remaining_balance: (updateFormData.total_salary_payable || netPayable) - (updateFormData.paid_amount || 0),
      };

      await API.put(`/salary-payment/${currentSalaryId}`, updateData);
      message.success("Salary updated successfully");
      setIsOpenUpdateModal(false);
      getAllSalary();
    } catch (error) {
      console.error("Error updating salary:", error);
      message.error("Failed to update salary");
    } finally {
      setUpdateLoading(false);
    }
  };

  const dropDownItems = (data) => {
    const dropDownItemList = [
      {
        key: "1",
        label: (
          <Link
            to={`/print/${data?._id}`}
            className="text-blue-600"
            key={data?._id}
          >
            Print
          </Link>
        ),
      },
      {
        key: "2",
        label: (
          <div
            key={data?._id}
            className="text-green-600"
            onClick={() => handleEdit(data._id)}
          >
            Edit
          </div>
        ),
      },
      {
        key: "3",
        label: (
          <div
            key={data?._id}
            className="text-red-600"
            onClick={() => {
              setDeleteId(data._id);
              setDeleteModalOpen(true);
            }}
          >
            Delete
          </div>
        ),
      },
    ];

    return dropDownItemList;
  };

  async function fetchSalaryDetails() {
    try {
      setEmployeeDetailsLoading(true);
      const responseData = await API.get(`/employee/${formData.employee_id}`);
      const filteredEmployeeDetails = responseData?.data?.data;
      const { deductions = deductionsObject, earnings = earningsObject } =
        filteredEmployeeDetails;
      setEmployeeDetails(filteredEmployeeDetails);
      setFormData((prev) => ({ ...prev, deductions, earnings }));
    } catch (error) {
      setEmployeeDetails({});
    } finally {
      setEmployeeDetailsLoading(false);
    }
  }

  useEffect(() => {
    if (formData.employee_id) {
      fetchSalaryDetails();
    }
  }, [formData?.employee_id]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeductionsChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      earnings: { ...prev.earnings },
      deductions: { ...prev.deductions, [name]: value },
    }));
  };

  const handleEarningsChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      earnings: { ...prev.earnings, [name]: value },
      deductions: { ...prev.deductions },
    }));
  };

  const handleAdditionalPaymentChange = (index, field, value) => {
    const updatedPayments = [...formData.additional_payments];
    updatedPayments[index] = { ...updatedPayments[index], [field]: value };
    setFormData((prev) => ({ ...prev, additional_payments: updatedPayments }));
  };

  const addAdditionalPayment = () => {
    setFormData((prev) => ({
      ...prev,
      additional_payments: [
        ...prev.additional_payments,
        { name: "", value: 0 },
      ],
    }));
  };

  const removeAdditionalPayment = (index) => {
    const updatedPayments = formData.additional_payments.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({ ...prev, additional_payments: updatedPayments }));
  };

  async function handleCalculateSalary() {
    try {
      setCalculateLoading(true);
      
      // Send earnings and deductions as objects, not JSON strings
      const response = await API.get("/salary-payment/calculate", {
        params: {
          employee_id: formData.employee_id,
          month: formData.month,
          year: formData.year,
          earnings: formData.earnings,
          deductions: formData.deductions,
        },
      });
      
      setCalculatedSalary(response.data.data);
      setShowAdditionalPayments(true);
      
      // Set the total salary payable to the calculated salary
      setFormData((prev) => ({
        ...prev,
        total_salary_payable: response.data.data.calculated_salary,
      }));
      
      message.success("Salary calculated successfully");
    } catch (error) {
      console.error("Error calculating salary:", error);
      message.error("Failed to calculate salary");
    } finally {
      setCalculateLoading(false);
    }
  }

  async function handleAddSalary() {
    try {
      // Calculate total earnings and deductions
      const totalEarnings = Object.values(formData.earnings).reduce(
        (sum, value) => sum + Number(value),
        0
      );
      const totalDeductions = Object.values(formData.deductions).reduce(
        (sum, value) => sum + Number(value),
        0
      );

      // Calculate additional payments total
      const additionalPaymentsTotal = formData.additional_payments.reduce(
        (sum, payment) => sum + Number(payment.value),
        0
      );

      // Calculate net payable (default to calculated salary if available)
      const netPayable = calculatedSalary
        ? calculatedSalary.calculated_salary
        : totalEarnings - totalDeductions + additionalPaymentsTotal;

      const salaryData = {
        employee_id: formData.employee_id,
        salary_from_date: calculatedSalary
          ? calculatedSalary.salary_from_date
          : new Date(),
        salary_to_date: calculatedSalary
          ? calculatedSalary.salary_to_date
          : new Date(),
        salary_month: formData.month,
        salary_year: formData.year,
        earnings: formData.earnings, // Ensure this is an object
        deductions: formData.deductions, // Ensure this is an object
        additional_payments: formData.additional_payments,
        paid_days: calculatedSalary ? calculatedSalary.paid_days : 30,
        lop_days: calculatedSalary ? calculatedSalary.lop_days : 0,
        net_payable: netPayable,
        paid_amount: formData.paid_amount || 0,
        remaining_balance: (formData.total_salary_payable || netPayable) - (formData.paid_amount || 0),
        total_salary_payable: formData.total_salary_payable || netPayable, // New field
        payment_method: "Bank Transfer",
        status: "Pending",
        pay_date: new Date(),
      };

      await API.post("/salary-payment/", salaryData);
      message.success("Salary added successfully");
      setIsOpenAddModal(false);
      setCalculatedSalary(null);
      setShowAdditionalPayments(false);
      getAllSalary();
    } catch (error) {
      console.error("Error adding salary:", error);
      message.error("Failed to add salary");
    }
  }

  async function getAllSalary() {
    try {
      const response = await API.get("/salary-payment/all");
      const responseData = response?.data?.data || [];
      const filteredData = responseData.map((data, index) => ({
        siNo: index + 1,
        _id: data?._id,
        employeeName: data?.employee_id?.name,
        employeeCode: data?.employee_id?.employeeCode,
        salaryMonth: data?.salary_month,
        salaryYear: data?.salary_year,
        payDate: new Date(data?.pay_date).toISOString().split("T")[0],
        netPayable: data?.net_payable,
        paidAmount: data?.paid_amount,
        transactionId: data?.transaction_id,
        action: (
          <div className="flex justify-center gap-2">
            <Dropdown
              key={data?._id}
              trigger={["click"]}
              menu={{
                items: dropDownItems(data),
              }}
              placement="bottomLeft"
            >
              <IoMdMore className="text-bold" />
            </Dropdown>
          </div>
        ),
      }));
      setAllSalarypayments([...filteredData]);
    } catch (error) {
      setAllSalarypayments([]);
    }
  }

  useEffect(() => {
    getAllSalary();
  }, []);

  return (
    <div>
      <div className="flex mt-20">
        <Navbar visibility={true} />
        <Sidebar />
        <div className="flex-grow p-7">
          <h1 className="text-2xl font-semibold">Salary Payment</h1>
          <div className="mt-6 mb-8">
            <div className="mb-10">
              <div className="flex justify-end items-center w-full">
                <div>
                  <button
                    onClick={() => setIsOpenAddModal(true)}
                    className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                  >
                    + Add Salary Payment
                  </button>
                </div>
              </div>
            </div>

            <DataTable columns={columns} data={allSalaryPayments} />
          </div>
        </div>

        {/* Add Salary Drawer */}
        <Drawer
          title="Add New Salary Payment"
          width={"87%"}
          className="payment-drawer"
          open={isOpenAddModal}
          onClose={() => {
            setIsOpenAddModal(false);
            setCalculatedSalary(null);
            setShowAdditionalPayments(false);
          }}
          closable={true}
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsOpenAddModal(false)}>Cancel</Button>
              {calculatedSalary && (
                <Button type="primary" onClick={handleAddSalary}>
                  Save Salary
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee <span className="text-red-600">*</span>
              </label>
              <Select
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? "")
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? "").toLowerCase())
                }
                style={{ width: "100%" }}
                placeholder="Search to Select Employee"
                options={employees}
                onChange={(value) => handleChange("employee_id", value)}
              />
            </div>

            {!employeeDetailsLoading ? (
              formData.employee_id &&
              Object.values(employeeDetails).length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Year <span className="text-red-600">*</span>
                      </label>
                      <DatePicker
                        value={
                          formData.year ? dayjs(formData.year, "YYYY") : null
                        }
                        onChange={(date, dateString) =>
                          handleChange("year", dateString)
                        }
                        picker="year"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Month <span className="text-red-600">*</span>
                      </label>
                      <Segmented
                        className="[&_.ant-segmented-item-selected]:!bg-green-600 [&_.ant-segmented-item-selected]:!text-white"
                        value={formData.month}
                        options={months}
                        onChange={(value) => handleChange("month", value)}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Employee Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          placeholder="Name"
                          value={employeeDetails?.name}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          placeholder="Email"
                          value={employeeDetails?.email}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          placeholder="Phone Number"
                          value={employeeDetails?.phone_number}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Joining Date
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          placeholder="Joining Date"
                          value={employeeDetails?.joining_date?.split("T")[0]}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee ID
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          placeholder="Employee Id"
                          value={employeeDetails?.employeeCode}
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">
                      Earnings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Basic Salary <span className="text-red-600">*</span>
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Basic Salary"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="basic"
                          id="basic"
                          value={formData?.earnings?.basic}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          House Rent Allowance (HRA)
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter House Rent Allowance"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="hra"
                          id="hra"
                          value={formData?.earnings?.hra}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Travel Allowance
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Travel Allowance"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="travel_allowance"
                          id="travel_allowance"
                          value={formData?.earnings?.travel_allowance}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medical Allowance
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Medical Allowance"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="medical_allowance"
                          id="medical_allowance"
                          value={formData?.earnings?.medical_allowance}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Basket of Benefits
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Basket Of Benefits"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="basket_of_benifits"
                          id="basket_of_benifits"
                          value={formData?.earnings?.basket_of_benifits}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Performance Bonus
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Performance Bonus"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="performance_bonus"
                          id="performance_bonus"
                          value={formData?.earnings?.performance_bonus}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Other Allowances
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Other Allowances"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="other_allowances"
                          id="other_allowances"
                          value={formData?.earnings?.other_allowances}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Conveyance
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Conveyance"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="text"
                          name="conveyance"
                          id="conveyance"
                          value={formData?.earnings?.conveyance}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800 mb-4">
                      Deductions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Income Tax
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter Income Tax"
                          onChange={(e) =>
                            handleDeductionsChange(
                              e.target.name,
                              e.target.value
                            )
                          }
                          type="text"
                          name="income_tax"
                          id="income_tax"
                          value={formData?.deductions?.income_tax}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ESI (Employee State Insurance)
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter ESI"
                          onChange={(e) =>
                            handleDeductionsChange(
                              e.target.name,
                              e.target.value
                            )
                          }
                          type="text"
                          name="esi"
                          id="esi"
                          value={formData?.deductions?.esi}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          EPF (Employee Provident Fund)
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter EPF"
                          onChange={(e) =>
                            handleDeductionsChange(
                              e.target.name,
                              e.target.value
                            )
                          }
                          type="text"
                          name="epf"
                          id="epf"
                          value={formData?.deductions?.epf}
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Professional Tax
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter Professional Tax"
                          onChange={(e) =>
                            handleDeductionsChange(
                              e.target.name,
                              e.target.value
                            )
                          }
                          type="text"
                          name="professional_tax"
                          id="professional_tax"
                          value={formData?.deductions?.professional_tax}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      type="primary"
                      onClick={handleCalculateSalary}
                      size="large"
                      className="px-8"
                      loading={calculateLoading}
                    >
                      Calculate Salary
                    </Button>
                  </div>

                  {/* Calculated Salary Display */}
                  {calculatedSalary && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4">
                        Calculated Salary Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Days
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            value={calculatedSalary.total_days}
                            disabled
                          />
                        </div>
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Present Days
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            value={calculatedSalary.present_days}
                            disabled
                          />
                        </div>
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Paid Days
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            value={calculatedSalary.paid_days}
                            disabled
                          />
                        </div>
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Per Day Salary
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            value={calculatedSalary.per_day_salary}
                            disabled
                          />
                        </div>
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Earnings
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            value={calculatedSalary.total_earnings}
                            disabled
                          />
                        </div>
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Deductions
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            value={calculatedSalary.total_deductions}
                            disabled
                          />
                        </div>
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Calculated Salary
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            value={calculatedSalary.calculated_salary}
                            disabled
                          />
                        </div>
                      </div>
                      
                      {/* Payment Details */}
                      <div className="bg-blue-50 p-4 rounded-lg mt-4">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4">
                          Payment Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Salary Payable
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={formData.total_salary_payable || 0}
                              onChange={(e) =>
                                handleChange(
                                  "total_salary_payable",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Paid Amount
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={formData.paid_amount || 0}
                              onChange={(e) =>
                                handleChange("paid_amount", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Payments */}
                  {showAdditionalPayments && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-purple-800">
                          Additional Payments
                        </h3>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={addAdditionalPayment}
                        >
                          Add Payment
                        </Button>
                      </div>
                      {formData.additional_payments.map((payment, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                        >
                          <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Payment Name
                            </label>
                            <Input
                              placeholder="Enter payment name"
                              value={payment.name}
                              onChange={(e) =>
                                handleAdditionalPaymentChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="form-group flex items-end gap-2">
                            <div className="flex-grow">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount
                              </label>
                              <Input
                                type="number"
                                placeholder="Enter amount"
                                value={payment.value}
                                onChange={(e) =>
                                  handleAdditionalPaymentChange(
                                    index,
                                    "value",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <Button
                              type="primary"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeAdditionalPayment(index)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Loading employee details...
                  </p>
                </div>
              </div>
            )}
          </div>
        </Drawer>

        {/* Update Salary Drawer */}
        <Drawer
          title="Update Salary"
          width={"50%"}
          className="payment-drawer"
          open={isOpenUpdateModal}
          onClose={() => setIsOpenUpdateModal(false)}
          closable={true}
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsOpenUpdateModal(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleUpdateSubmit}
                loading={updateLoading}
              >
                Update Salary
              </Button>
            </div>
          }
        >
          <Form
            form={updateForm}
            layout="vertical"
            initialValues={updateFormData}
            onValuesChange={handleUpdateChange}
          >
            <Form.Item
              name="employee_id"
              label="Employee ID"
              rules={[{ required: true, message: "Please select an employee" }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? "")
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? "").toLowerCase())
                }
                placeholder="Select Employee"
                options={employees}
              />
            </Form.Item>

            <Form.Item
              name="month"
              label="Month"
              rules={[{ required: true, message: "Please select a month" }]}
            >
              <Select placeholder="Select Month">
                {months.map((month) => (
                  <Select.Option key={month.value} value={month.value}>
                    {month.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="year"
              label="Year"
              rules={[{ required: true, message: "Please select a year" }]}
              getValueFromEvent={(value) => (value ? value.format("YYYY") : "")}
            >
              <DatePicker picker="year" style={{ width: "100%" }} />
            </Form.Item>

            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Earnings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item name={["earnings", "basic"]} label="Basic Salary">
                  <Input type="number" />
                </Form.Item>
                <Form.Item name={["earnings", "hra"]} label="HRA">
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "travel_allowance"]}
                  label="Travel Allowance"
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "medical_allowance"]}
                  label="Medical Allowance"
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "basket_of_benifits"]}
                  label="Basket of Benefits"
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "performance_bonus"]}
                  label="Performance Bonus"
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "other_allowances"]}
                  label="Other Allowances"
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item name={["earnings", "conveyance"]} label="Conveyance">
                  <Input type="number" />
                </Form.Item>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-red-800 mb-4">
                Deductions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name={["deductions", "income_tax"]}
                  label="Income Tax"
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item name={["deductions", "esi"]} label="ESI">
                  <Input type="number" />
                </Form.Item>
                <Form.Item name={["deductions", "epf"]} label="EPF">
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name={["deductions", "professional_tax"]}
                  label="Professional Tax"
                >
                  <Input type="number" />
                </Form.Item>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-purple-800">
                  Additional Payments
                </h3>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    const currentPayments =
                      updateForm.getFieldValue("additional_payments") || [];
                    updateForm.setFieldsValue({
                      additional_payments: [
                        ...currentPayments,
                        { name: "", value: 0 },
                      ],
                    });
                  }}
                >
                  Add Payment
                </Button>
              </div>
              <Form.List name="additional_payments">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          label="Payment Name"
                        >
                          <Input placeholder="Enter payment name" />
                        </Form.Item>
                        <div className="flex items-end gap-2">
                          <div className="flex-grow">
                            <Form.Item
                              {...restField}
                              name={[name, "value"]}
                              label="Amount"
                            >
                              <Input type="number" placeholder="Enter amount" />
                            </Form.Item>
                          </div>
                          <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </Form.List>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Payment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="total_salary_payable"
                  label="Total Salary Payable"
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="paid_amount" label="Paid Amount">
                  <Input type="number" />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Drawer>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Delete Salary Payment"
          open={deleteModalOpen}
          onCancel={() => setDeleteModalOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>,
            <Button
              key="delete"
              type="primary"
              danger
              loading={deleteLoading}
              onClick={() => handleDeleteConfirm(deleteId)}
            >
              Delete
            </Button>,
          ]}
        >
          <p>
            Are you sure you want to delete this salary payment? This action
            cannot be undone.
          </p>
        </Modal>
      </div>
    </div>
  );
};

export default SalaryPayment;