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
  Empty,
} from "antd";
import Navbar from "../components/layouts/Navbar";
import Sidebar from "../components/layouts/Sidebar";
import DataTable from "../components/layouts/Datatable";
import { useEffect, useState, useMemo } from "react";
import API from "../instance/TokenInstance";
import dayjs from "dayjs";
import { IoMdMore } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { MdOutlineMan } from "react-icons/md";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import moment from "moment";
const SalaryPayment = () => {
  const navigate = useNavigate();
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [allSalaryPayments, setAllSalarypayments] = useState([]);
  const [employeeDetailsLoading, setEmployeeDetailsLoading] = useState(false);
  const [currentSalaryId, setCurrentSalaryId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [alreadyPaidModalOpen, setAlreadyPaidModalOpen] = useState(false);
  const [existingSalaryRecord, setExistingSalaryRecord] = useState(null);
  const [dataTableLoading, setDataTableLoading] = useState(false);
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
    additional_deductions: [],
    advance_payments: [],
    calculated_incentive: 0,
    payment_method: "Cash",
    transaction_id: "",
    is_salary_paid: true,
    monthly_business_info: {
      target: 0,
      total_business_closed: 0,
      previous_remaining_target: 0,
      current_remaining_target: 0,
    },
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
    { key: "salaryMonth", header: "Salary Month" },
    { key: "salaryYear", header: "Year" },
    { key: "netPayable", header: "Net Payable" },
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
    additional_deductions: [],
    advance_payments: [],
    calculated_incentive: 0,
    total_salary_payable: 0,
    paid_amount: 0,
    payment_method: "Cash",
    transaction_id: "",
    target: 0,
    incentive: 0,
    status: "Paid",
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
  const fetchEmployeeTarget = async (employeeId, start_date, end_date) => {
    try {
      const response = await API.get(`/target/employees/${employeeId}`, {
        params: { start_date, end_date },
      });
      return response.data?.total_target || 0;
    } catch (err) {
      console.error("Failed to fetch target:", err);
      return 0;
    }
  };
  const fetchEmployeeIncentive = async (employeeId, start_date, end_date) => {
    try {
      const response = await API.get(
        `/enroll/employee/${employeeId}/incentive`,
        { params: { start_date, end_date } }
      );
      return response.data?.incentiveSummary?.total_incentive_value || 0;
    } catch (err) {
      console.error("Failed to fetch incentive:", err);
      return 0;
    }
  };
  useEffect(() => {
    if (!isOpenUpdateModal) {
      setAdjustmentAmount(0);
    }
  }, [isOpenUpdateModal]);
  const getValidMonths = (joiningDateStr, selectedYear) => {
    if (!joiningDateStr || !selectedYear) {
      return months.map((m) => ({ ...m, disabled: true }));
    }
    const joining = dayjs(joiningDateStr);
    const today = dayjs();
    const joinYear = joining.year();
    const currentYear = today.year();
    const selectedYearNum = Number(selectedYear);
    return months.map((month, index) => {
      const isBeforeJoining =
        selectedYearNum === joinYear && index < joining.month();
      const isAfterToday =
        selectedYearNum === currentYear && index > today.month();
      const disabled =
        selectedYearNum < joinYear ||
        selectedYearNum > currentYear ||
        isBeforeJoining ||
        isAfterToday;
      return { ...month, disabled };
    });
  };
  useEffect(() => {
    if (
      formData.employee_id &&
      formData.year &&
      employeeDetails?.joining_date
    ) {
      const validMonths = getValidMonths(
        employeeDetails.joining_date,
        formData.year
      );
      const currentMonthValid = validMonths.some(
        (m) => m.value === formData.month && !m.disabled
      );
      if (!currentMonthValid) {
        const firstValid = validMonths.find((m) => !m.disabled);
        if (firstValid) {
          setFormData((prev) => ({
            ...prev,
            month: firstValid.value,
          }));
        }
      }
    }
  }, [formData.year, formData.employee_id, employeeDetails?.joining_date]);
  const handleEdit = async (id) => {
    try {
      setUpdateLoading(true);
      setIsOpenUpdateModal(true);
      setAdjustmentAmount(0); // Reset adjustment amount
      const salaryData = await getSalaryById(id);
      if (salaryData) {
        setCurrentSalaryId(id);
        const yearAsDayjs = dayjs(salaryData.salary_year, "YYYY");

        // Ensure paid_amount defaults to total_salary_payable if not set
        const paidAmount =
          salaryData.paid_amount || salaryData.total_salary_payable || 0;

        const formData = {
          employee_id: salaryData?.employee_id?._id,
          month: salaryData?.salary_month,
          year: yearAsDayjs,
          earnings: salaryData?.earnings,
          deductions: salaryData?.deductions,
          additional_payments: salaryData?.additional_payments || [],
          additional_deductions: salaryData?.additional_deductions || [],
          advance_payments: salaryData?.advance_payments || [],
          calculated_incentive: salaryData?.calculated_incentive || 0,
          total_salary_payable: salaryData?.total_salary_payable || 0,
          paid_amount: paidAmount, // Use the defaulted value
          payment_method: salaryData?.payment_method || "Cash",
          transaction_id: salaryData?.transaction_id || "",
          pay_date: salaryData?.pay_date
            ? moment(salaryData?.pay_date)
            : moment(),
          attendance_details: salaryData?.attendance_details || {},
          monthly_business_info: salaryData?.monthly_business_info || {
            target: 0,
            total_business_closed: 0,
            previous_remaining_target: 0,
            current_remaining_target: 0,
          },
          status: "Paid",
          is_salary_paid: true,
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
      message.success("Salary Payment deleted successfully");
      setDeleteModalOpen(false);
      getAllSalary();
    } catch (error) {
      message.error("Failed to delete Salary Payment");
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleUpdateChange = (changedValues, allValues) => {
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

    // Get latest values from form
    const formValues = updateForm.getFieldsValue();
    const totalPayable = Number(formValues.total_salary_payable || 0);
    const adjAmount = adjustmentAmount; // Use your state
    const computedPaidAmount = totalPayable + adjAmount;

    const remaining_balance = totalPayable - computedPaidAmount;

    const updateData = {
      ...formValues,
      paid_amount: computedPaidAmount,
      remaining_balance,
      monthly_business_info: formValues.monthly_business_info || {
        target: 0,
        total_business_closed: 0,
        previous_remaining_target: 0,
        current_remaining_target: 0,
      },
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
  const handlePrint = (salaryPaymentId) => {
    navigate("/salary-slip-print/" + salaryPaymentId);
  };
  const dropDownItems = (salaryPayment) => {
    const dropDownItemList = [
      {
        key: "1",
        label: (
          <div
            key={salaryPayment?._id}
            className="text-green-600"
            onClick={() => handlePrint(salaryPayment?._id)}>
            Print
          </div>
        ),
      },
      {
        key: "2",
        label: (
          <div
            key={salaryPayment?._id}
            className="text-green-600"
            onClick={() => handleEdit(salaryPayment._id)}>
            Edit
          </div>
        ),
      },
      {
        key: "3",
        label: (
          <div
            key={salaryPayment?._id}
            className="text-red-600"
            onClick={() => {
              setDeleteId(salaryPayment?._id);
              setDeleteModalOpen(true);
            }}>
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
      const emp = responseData?.data?.data;
      const updatedEarnings = {
        ...earningsObject,
        ...emp?.earnings,
        salary: emp?.salary || 0,
      };
      const updatedDeductions = {
        ...deductionsObject,
        ...emp?.deductions,
      };
      setEmployeeDetails(emp);
      setFormData((prev) => ({
        ...prev,
        earnings: updatedEarnings,
        deductions: updatedDeductions,
      }));
    } catch (error) {
      setEmployeeDetails({});
    } finally {
      setEmployeeDetailsLoading(false);
    }
  }
  useEffect(() => {
    if (formData.employee_id && formData.month && formData.year) {
      loadTargetAndIncentive();
    }
  }, [formData.employee_id, formData.month, formData.year]);
  const loadTargetAndIncentive = async () => {
    try {
      const monthIndex = moment().month(formData.month).month();
      const year = formData.year;
      const start_date = moment()
        .year(year)
        .month(monthIndex)
        .startOf("month")
        .format("YYYY-MM-DD");
      const end_date = moment()
        .year(year)
        .month(monthIndex)
        .endOf("month")
        .format("YYYY-MM-DD");
      const targetValue = await fetchEmployeeTarget(
        formData.employee_id,
        start_date,
        end_date
      );
      const incentiveValue = await fetchEmployeeIncentive(
        formData.employee_id,
        start_date,
        end_date
      );
      setFormData((prev) => ({
        ...prev,
        target: targetValue,
        incentive: incentiveValue,
      }));
    } catch (err) {
      console.error("Failed to auto-load target & incentive", err);
    }
  };
  useEffect(() => {
    if (formData.employee_id) {
      fetchSalaryDetails();
    }
  }, [formData?.employee_id, formData.month, formData.month]);
  const updateTotalEarnings = useMemo(() => {
    const earnings = updateFormData?.earnings || {};
    return Object.values(earnings).reduce((sum, v) => sum + Number(v || 0), 0);
  }, [updateFormData]);
  const updateTotalDeductions = useMemo(() => {
    const deductions = updateFormData?.deductions || {};
    const additional = updateFormData?.additional_deductions || [];
    const base = Object.values(deductions).reduce(
      (sum, v) => sum + Number(v || 0),
      0
    );
    const extra = additional.reduce((sum, d) => sum + Number(d.value || 0), 0);
    return base + extra;
  }, [updateFormData]);
  async function getAllSalary() {
    try {
      setDataTableLoading(true);
      const response = await API.get("/salary-payment/status/pending");
      const responseData = response?.data?.data || [];
      const filteredData = responseData.map((data, index) => ({
        siNo: index + 1,
        _id: data?._id,
        employeeName: data?.employee_id?.name,
        employeeCode: data?.employee_id?.employeeCode,
        salaryMonth: data?.salary_month,
        salaryYear: data?.salary_year,
        netPayable: data?.total_salary_payable,
        paidAmount: data?.paid_amount,
        action: (
          <div className="flex justify-center gap-2">
            <Dropdown
              key={data?._id}
              trigger={["click"]}
              menu={{
                items: dropDownItems(data),
              }}
              placement="bottomLeft">
              <IoMdMore className="text-bold" />
            </Dropdown>
          </div>
        ),
      }));
      setAllSalarypayments([...filteredData]);
    } catch (error) {
      setAllSalarypayments([]);
    } finally {
      setDataTableLoading(false);
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
          <div className="mb-8">
            <h1 className="text-lg text-black font-bold font-mono p-2">
              Quick Navigator
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/hr-menu/salary-management"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <RiMoneyRupeeCircleFill
                  className="text-blue-600 group-hover:scale-110 transition-transform"
                  size={24}
                />
                <span className="font-medium text-gray-700 group-hover:text-blue-600">
                  HR / Salary Management
                </span>
              </Link>
              <Link
                to="/staff-menu/employee-menu/employee-statement"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <MdOutlineMan className="text-blue-600 group-hover:scale-110 transition-transform text-lg" />
                <span className="font-medium text-gray-700 group-hover:text-blue-600">
                  Employees / Employee Statement
                </span>
              </Link>
            </div>
          </div>
          <h1 className="text-2xl font-semibold">Salary Payment</h1>
          <div className="mt-6 mb-8">
            <div className="mb-10"></div>
            {dataTableLoading ? (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                className="w-full"
              />
            ) : allSalaryPayments.length > 0 ? (
              <DataTable columns={columns} data={allSalaryPayments} />
            ) : (
              <Empty description="No Salary Payment Data Found" />
            )}
          </div>
        </div>
        <Drawer
          title="Update Salary Payment"
          width={"70%"}
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
                loading={updateLoading}>
                Update Salary Payment
              </Button>
            </div>
          }>
          <Form
            form={updateForm}
            layout="vertical"
            initialValues={updateFormData}
            onValuesChange={handleUpdateChange}>
            <Form.Item
              name="employee_id"
              label="Employee ID"
              rules={[
                { required: true, message: "Please select an employee" },
              ]}>
              <Select
                disabled
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
              rules={[{ required: true, message: "Please select a month" }]}>
              <Select disabled placeholder="Select Month">
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
              getValueFromEvent={(value) =>
                value ? value.format("YYYY") : ""
              }>
              <DatePicker disabled picker="year" style={{ width: "100%" }} />
            </Form.Item>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Earnings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item name={["earnings", "basic"]} label="Basic Salary">
                  <Input disabled type="number" />
                </Form.Item>
                <Form.Item name={["earnings", "hra"]} label="HRA">
                  <Input disabled type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "travel_allowance"]}
                  label="Travel Allowance">
                  <Input disabled type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "medical_allowance"]}
                  label="Medical Allowance">
                  <Input disabled type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "basket_of_benifits"]}
                  label="Basket of Benefits">
                  <Input disabled type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "performance_bonus"]}
                  label="Performance Bonus">
                  <Input disabled type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "other_allowances"]}
                  label="Other Allowances">
                  <Input disabled type="number" />
                </Form.Item>
                <Form.Item name={["earnings", "conveyance"]} label="Conveyance">
                  <Input disabled type="number" />
                </Form.Item>
              </div>
              <div className="form-group mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Earnings
                </label>
                <Input
                  disabled
                  value={updateTotalEarnings.toFixed(2)}
                  className="bg-gray-100"
                />
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-red-800 mb-4">
                Deductions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name={["deductions", "income_tax"]}
                  label="Income Tax">
                  <Input disabled type="number" />
                </Form.Item>
                <Form.Item name={["deductions", "esi"]} label="ESI">
                  <Input disabled type="number" />
                </Form.Item>
                <Form.Item name={["deductions", "epf"]} label="EPF">
                  <Input disabled type="number" />
                </Form.Item>
                <Form.Item
                  name={["deductions", "professional_tax"]}
                  label="Professional Tax">
                  <Input disabled type="number" />
                </Form.Item>
              </div>
              <div className="form-group mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Deductions
                </label>
                <Input
                  disabled
                  value={updateTotalDeductions.toFixed(2)}
                  className="bg-gray-100"
                />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Attendance Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Form.Item
                  label="Total Days"
                  name={["attendance_details", "total_days"]}>
                  <Input type="number" disabled />
                </Form.Item>
                <Form.Item
                  label="Present Days"
                  name={["attendance_details", "present_days"]}>
                  <Input type="number" disabled />
                </Form.Item>
                <Form.Item
                  label="Paid Days"
                  name={["attendance_details", "paid_days"]}>
                  <Input type="number" disabled />
                </Form.Item>
                <Form.Item
                  label="LOP Days"
                  name={["attendance_details", "lop_days"]}>
                  <Input type="number" disabled />
                </Form.Item>
                <Form.Item
                  label="Per Day Salary"
                  name={["attendance_details", "per_day_salary"]}>
                  <Input type="number" disabled />
                </Form.Item>
                <Form.Item
                  label="Calculated Salary"
                  name={["attendance_details", "calculated_salary"]}>
                  <Input type="number" disabled />
                </Form.Item>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-lg mb-3">
                  Monthly Target & Business Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    label="Total Target (₹)"
                    name={["monthly_business_info", "target"]}>
                    <Input type="number" disabled />
                  </Form.Item>
                  <Form.Item
                    label="Previous Remaining Target (₹)"
                    name={[
                      "monthly_business_info",
                      "previous_remaining_target",
                    ]}>
                    <Input type="number" disabled />
                  </Form.Item>
                  <Form.Item
                    label="Total Business Closed (₹)"
                    name={["monthly_business_info", "total_business_closed"]}>
                    <Input type="number" disabled />
                  </Form.Item>
                  <Form.Item
                    label="Current Remaining Target (₹)"
                    name={["monthly_business_info", "current_remaining_target"]}
                    tooltip="Target minus total business closed">
                    <Input type="number" disabled />
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-lg mb-3">
                Incentive Adjustment
              </h3>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calculated Incentive
                </label>
                <Form.Item name="calculated_incentive">
                  <Input type="number" disabled />
                </Form.Item>
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-indigo-800">
                  Advance Payments
                </h3>
              </div>
              <Form.List name="advance_payments">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          label="Advance Name">
                          <Input placeholder="e.g., Festival Advance" />
                        </Form.Item>
                        <div className="flex items-end gap-2">
                          <div className="flex-grow">
                            <Form.Item
                              {...restField}
                              onWheel={(e) => {
                                e.preventDefault();
                                e.currentTarget.blur();
                              }}
                              name={[name, "value"]}
                              label="Amount">
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
            <div className="bg-purple-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-purple-800">
                  Additional Payments
                </h3>
              </div>
              <Form.List name="additional_payments">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          label="Payment Name">
                          <Input placeholder="Enter payment name" />
                        </Form.Item>
                        <div className="flex items-end gap-2">
                          <div className="flex-grow">
                            <Form.Item
                              {...restField}
                              onWheel={(e) => {
                                e.preventDefault();
                                e.currentTarget.blur();
                              }}
                              name={[name, "value"]}
                              label="Amount">
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
            <div className="bg-orange-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-orange-800">
                  Additional Deductions
                </h3>
              </div>
              <Form.List name="additional_deductions">
                {(fields, { remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          label="Deduction Name">
                          <Input placeholder="Enter deduction name" />
                        </Form.Item>
                        <div className="flex items-end gap-2">
                          <div className="flex-grow">
                            <Form.Item
                              {...restField}
                              name={[name, "value"]}
                              label="Amount">
                              <Input
                                type="number"
                                placeholder="Enter amount"
                                min={0}
                              />
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
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200 mb-6">
              <h3 className="text-xl font-bold text-blue-900 mb-6 pb-3 border-b border-blue-300">
                Payment Details
              </h3>

              <div className="space-y-6">
                {/* Salary Information Section */}
                <div className="bg-white p-5 rounded-lg shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                    Salary Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Form.Item
                      name="total_salary_payable"
                      label={
                        <span className="font-medium text-gray-700">
                          Total Salary Payable
                        </span>
                      }
                      className="mb-0">
                      <Input
                        type="number"
                        disabled
                        className="bg-gray-50 font-semibold"
                        prefix="₹"
                      />
                    </Form.Item>
                    <Form.Item
                      label={
                        <span className="font-medium text-gray-700">
                          Adjustment Amount
                        </span>
                      }
                      className="mb-0">
                      <Input
                        type="number"
                        value={adjustmentAmount}
                        prefix="₹"
                        className="font-semibold"
                        onChange={(e) => {
                          const value =
                            e.target.value === "" ? 0 : Number(e.target.value);
                          setAdjustmentAmount(value);
                          const totalPayable =
                            updateForm.getFieldValue("total_salary_payable") ||
                            0;
                          const newPayableAmount = Number(totalPayable) + value;
                          updateForm.setFieldsValue({
                            paid_amount: newPayableAmount,
                          });
                        }}
                        placeholder="Enter adjustment amount"
                      />
                      <div className="text-xs text-amber-600 mt-2 flex items-start gap-1 bg-amber-50 p-2 rounded border border-amber-200">
                        <span className="text-amber-600 font-bold">ⓘ</span>
                        <span>
                          This amount will be added to the payable amount{" "}
                        </span>
                      </div>
                    </Form.Item>
                    <Form.Item
                      name="paid_amount"
                      label={
                        <span className="font-medium text-gray-700">
                          Payable Amount
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Please enter payable amount",
                        },
                      ]}
                      className="mb-0">
                      <Input
                        type="number"
                        prefix="₹"
                        className="font-semibold"
                        onChange={(e) => {
                          const totalPayable =
                            updateForm.getFieldValue("total_salary_payable") ||
                            0;
                          const newPaidAmount = Number(e.target.value || 0);
                          const newAdjustment = newPaidAmount - totalPayable;
                          setAdjustmentAmount(newAdjustment);
                        }}
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Payment Transaction Section */}
                <div className="bg-white p-5 rounded-lg shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                    Transaction Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Form.Item
                      name="payment_method"
                      label={
                        <span className="font-medium text-gray-700">
                          Payment Mode
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Please select payment mode",
                        },
                      ]}
                      className="mb-0">
                      <Select
                        placeholder="Select payment mode"
                        size="large"
                        options={[
                          { label: "Cash", value: "Cash" },
                          { label: "Online / UPI", value: "Online/UPI" },
                          { label: "Online / NEFT", value: "Online/NEFT" },
                          { label: "Online / IMPS", value: "Online/IMPS" },
                          { label: "Online / RTGS", value: "Online/RTGS" },
                          { label: "Bank Transfer", value: "Bank Transfer" },
                          { label: "Cheque", value: "Cheque" },
                          { label: "Direct Deposit", value: "Direct Deposit" },
                        ]}
                      />
                    </Form.Item>

                    {updateForm.getFieldValue("payment_method") !== "Cash" && (
                      <Form.Item
                        name="transaction_id"
                        label={
                          <span className="font-medium text-gray-700">
                            Transaction ID
                          </span>
                        }
                        rules={[
                          {
                            required:
                              updateForm.getFieldValue("payment_method") !==
                              "Cash",
                            message: "Transaction ID is required",
                          },
                        ]}
                        className="mb-0">
                        <Input
                          placeholder="Enter transaction reference"
                          size="large"
                          className="font-mono"
                        />
                      </Form.Item>
                    )}

                    <Form.Item
                      name="pay_date"
                      label={
                        <span className="font-medium text-gray-700">
                          Pay Date
                        </span>
                      }
                      rules={[
                        { required: true, message: "Please select pay date" },
                      ]}
                      getValueProps={(value) => ({
                        value: value ? dayjs(value) : null,
                      })}
                      getValueFromEvent={(date) =>
                        date ? date.toDate() : null
                      }
                      className="mb-0">
                      <DatePicker
                        style={{ width: "100%" }}
                        size="large"
                        format="DD MMM YYYY"
                        disabledDate={(current) =>
                          current && current.isAfter(dayjs().endOf("day"))
                        }
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        </Drawer>
        <Modal
          title="Delete Salary"
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
              onClick={() => handleDeleteConfirm(deleteId)}>
              Delete
            </Button>,
          ]}>
          <p>
            Are you sure you want to delete this salary? This action cannot be
            undone.
          </p>
        </Modal>
        <Modal
          title={
            <div className="flex items-center gap-3">
              <span className="text-amber-800 text-lg font-semibold flex items-center">
                Salary Already Processed
              </span>
            </div>
          }
          open={alreadyPaidModalOpen}
          onCancel={() => setAlreadyPaidModalOpen(false)}
          width={920}
          footer={[
            <Button key="close" onClick={() => setAlreadyPaidModalOpen(false)}>
              Close
            </Button>,
            existingSalaryRecord?.status === "Pending" && (
              <Button
                key="edit"
                type="primary"
                style={{
                  backgroundColor: "#D4AF37",
                  borderColor: "#B8860B",
                  color: "#000",
                }}
                onClick={() => {
                  handleEdit(existingSalaryRecord._id);
                  setAlreadyPaidModalOpen(false);
                }}>
                Edit Record
              </Button>
            ),
          ]}
          style={{
            padding: "24px",
            maxHeight: "70vh",
            overflowY: "auto",
            backgroundColor: "#fafafa",
          }}>
          {existingSalaryRecord ? (
            <div className="space-y-6 text-sm">
              <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center text-base">
                  Salary Period
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-gray-700">
                  <div>
                    <strong>Month:</strong> {existingSalaryRecord.salary_month}{" "}
                    {existingSalaryRecord.salary_year}
                  </div>
                  <div>
                    <strong>From:</strong>{" "}
                    {moment(existingSalaryRecord.salary_from_date).format(
                      "DD MMM YYYY"
                    )}
                  </div>
                  <div>
                    <strong>To:</strong>{" "}
                    {moment(existingSalaryRecord.salary_to_date)
                      .subtract(1, "day")
                      .format("DD MMM YYYY")}
                  </div>
                </div>
              </section>
              {/* Attendance Summary */}
              <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center text-base">
                  Attendance Summary
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-gray-700">
                  <div>
                    <strong>Total Days:</strong>{" "}
                    {existingSalaryRecord.total_days || 0}
                  </div>
                  <div>
                    <strong>Paid Days:</strong>{" "}
                    {existingSalaryRecord.paid_days || 0}
                  </div>
                  <div>
                    <strong>LOP Days:</strong>{" "}
                    {existingSalaryRecord.lop_days || 0}
                  </div>
                  <div>
                    <strong>Present:</strong>{" "}
                    {existingSalaryRecord.present_days || 0}
                  </div>
                  <div>
                    <strong>Absent:</strong>{" "}
                    {existingSalaryRecord.absent_days || 0}
                  </div>
                  <div>
                    <strong>On Leave:</strong>{" "}
                    {existingSalaryRecord.leave_days || 0}
                  </div>
                  <div>
                    <strong>Half Days:</strong>{" "}
                    {existingSalaryRecord.half_days || 0}
                  </div>
                </div>
              </section>
              {/* Monthly Business Info Section */}
              <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center text-base">
                  Monthly Target & Business Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                  <div>
                    <strong>Total Target:</strong> ₹
                    {Number(
                      existingSalaryRecord.monthly_business_info?.target || 0
                    ).toLocaleString("en-IN")}
                  </div>
                  <div>
                    <strong>Previous Remaining Target:</strong> ₹
                    {Number(
                      existingSalaryRecord.monthly_business_info
                        ?.previous_remaining_target || 0
                    ).toLocaleString("en-IN")}
                  </div>
                  <div>
                    <strong>Total Business Closed:</strong> ₹
                    {Number(
                      existingSalaryRecord.monthly_business_info
                        ?.total_business_closed || 0
                    ).toLocaleString("en-IN")}
                  </div>
                  <div>
                    <strong>Current Remaining Target:</strong> ₹
                    {Number(
                      existingSalaryRecord.monthly_business_info
                        ?.current_remaining_target || 0
                    ).toLocaleString("en-IN")}
                  </div>
                </div>
              </section>
              {/* Earnings */}
              <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center text-base">
                  Earnings
                </h4>
                <ul className="space-y-2 text-gray-700">
                  {Object.entries(existingSalaryRecord.earnings || {}).map(
                    ([key, val]) => (
                      <li
                        key={key}
                        className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-medium">
                          ₹
                          {Number(val).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </section>
              {/* Deductions */}
              <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center text-base">
                  Deductions
                </h4>
                <ul className="space-y-2 text-gray-700">
                  {Object.entries(existingSalaryRecord.deductions || {}).map(
                    ([key, val]) => (
                      <li
                        key={key}
                        className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-medium">
                          ₹
                          {Number(val).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </section>
              {/* Additional Payments */}
              {existingSalaryRecord.additional_payments?.length > 0 && (
                <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center text-base">
                    Additional Payments
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    {existingSalaryRecord.additional_payments.map((pay, i) => (
                      <li
                        key={i}
                        className="flex justify-between border-b border-gray-100 pb-1">
                        <span>{pay.name || "Payment"}</span>
                        <span className="font-medium">
                          ₹
                          {Number(pay.value).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {/* Additional Deductions */}
              {existingSalaryRecord.additional_deductions?.length > 0 && (
                <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center text-base">
                    Additional Deductions
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    {existingSalaryRecord.additional_deductions.map(
                      (ded, i) => (
                        <li
                          key={i}
                          className="flex justify-between border-b border-gray-100 pb-1">
                          <span>{ded.name || "Deduction"}</span>
                          <span className="font-medium text-red-600">
                            ₹
                            {Number(ded.value).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </section>
              )}
              {existingSalaryRecord.advance_payments?.length > 0 && (
                <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center text-base">
                    Advance Payments
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    {existingSalaryRecord.advance_payments.map((pay, i) => (
                      <li
                        key={i}
                        className="flex justify-between border-b border-gray-100 pb-1">
                        <span>{pay.name || "Advance Payment"}</span>
                        <span className="font-medium">
                          ₹
                          {Number(pay.value).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {existingSalaryRecord.calculated_incentive !== 0 && (
                <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center text-base">
                    Incentive Adjustment
                  </h4>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">
                      Calculated Incentive:
                    </span>
                    <span
                      className={`font-medium ${
                        existingSalaryRecord.calculated_incentive > 0
                          ? "text-green-700"
                          : "text-red-700"
                      }`}>
                      ₹
                      {Math.abs(
                        existingSalaryRecord.calculated_incentive
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {existingSalaryRecord.calculated_incentive > 0
                        ? " (Bonus)"
                        : " (Deduction)"}
                    </span>
                  </div>
                </section>
              )}
              <section className="bg-gradient-to-r from-amber-50 to-white border border-amber-200 p-5 rounded-lg shadow-sm">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center text-base">
                  Payment Summary
                </h4>
                <div className="space-y-2 text-gray-800 font-medium">
                  <div className="flex justify-between">
                    <span>Base Calculated Salary:</span>{" "}
                    <span>
                      ₹
                      {Number(
                        existingSalaryRecord?.attendance_details
                          ?.calculated_salary
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {existingSalaryRecord.advance_payments?.length > 0 && (
                    <div className="flex justify-between">
                      <span>Advance Payments:</span>{" "}
                      <span>
                        ₹
                        {Number(
                          existingSalaryRecord.advance_payments.reduce(
                            (sum, p) => sum + Number(p.value),
                            0
                          )
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  {existingSalaryRecord.additional_payments?.length > 0 && (
                    <div className="flex justify-between">
                      <span>Additional Payments:</span>{" "}
                      <span>
                        ₹
                        {Number(
                          existingSalaryRecord.additional_payments.reduce(
                            (sum, p) => sum + Number(p.value),
                            0
                          )
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Total Base Deductions:</span>{" "}
                    <span>
                      ₹
                      {Number(
                        existingSalaryRecord.total_deductions
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {existingSalaryRecord?.additional_deductions?.length > 0 && (
                    <div className="flex justify-between">
                      <span>Additional Deductions:</span>{" "}
                      <span className="text-red-600">
                        ₹
                        {Number(
                          existingSalaryRecord.additional_deductions.reduce(
                            (sum, d) => sum + Number(d.value),
                            0
                          )
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  {existingSalaryRecord.calculated_incentive !== 0 && (
                    <div className="flex justify-between">
                      <span>Incentive Adjustment:</span>
                      <span
                        className={
                          existingSalaryRecord.calculated_incentive > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }>
                        ₹
                        {Math.abs(
                          existingSalaryRecord.calculated_incentive
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        {existingSalaryRecord.calculated_incentive > 0
                          ? ""
                          : " (Deduction)"}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2 mt-2">
                    <span>Net Payable:</span>
                    <span>
                      ₹
                      {Number(existingSalaryRecord.net_payable).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid Amount:</span>{" "}
                    <span>
                      ₹
                      {Number(existingSalaryRecord.paid_amount).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining Balance:</span>
                    <span
                      className={
                        Number(existingSalaryRecord.remaining_balance) > 0
                          ? "text-red-600 font-bold"
                          : "text-green-600"
                      }>
                      ₹
                      {Number(
                        existingSalaryRecord.remaining_balance
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span
                      className={
                        existingSalaryRecord.status === "Paid"
                          ? "text-green-700 font-bold"
                          : "text-amber-700 font-bold"
                      }>
                      {existingSalaryRecord.status}
                    </span>
                  </div>
                  {existingSalaryRecord.transaction_id && (
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>{" "}
                      <span>{existingSalaryRecord.transaction_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Payment Method:</span>{" "}
                    <span>{existingSalaryRecord.payment_method || "N/A"}</span>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              Loading salary details...
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
export default SalaryPayment;
