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
import { useEffect, useState, useMemo } from "react";
import API from "../instance/TokenInstance";
import dayjs from "dayjs";
import { Select as AntSelect, Segmented, Button as AntButton } from "antd";
import { IoMdMore } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { numberToIndianWords } from "../helpers/numberToIndianWords";
import moment from "moment";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
const HRSalaryManagement = () => {
  console.log(navigator.get);
  const navigate = useNavigate();
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

  const [alreadyPaidModalOpen, setAlreadyPaidModalOpen] = useState(false);
  const [existingSalaryRecord, setExistingSalaryRecord] = useState(null);

  const [isEditFormDirty, setIsEditFormDirty] = useState(false);

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
    payment_method: "Cash",
    transaction_id: "",
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
    total_salary_payable: 0,
    paid_amount: 0,
    payment_method: "Cash",
    transaction_id: "",
    target: 0,
    incentive: 0,
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

  const handleRecalculateInEdit = async () => {
    const { employee_id, month, year, earnings, deductions } = updateFormData;
    if (!employee_id || !month || !year) {
      message.warning("Please select employee, month, and year.");
      return;
    }

    try {
      setUpdateLoading(true);

      const yearValue = dayjs.isDayjs(year) ? year.format("YYYY") : year;

      // 🔥 POST to new endpoint (no 406)
      const response = await API.post("/salary-payment/calculate-edit", {
        employee_id,
        month,
        year: yearValue,
        earnings,
        deductions,
      });

      const calculated = response.data.data;

      // Fetch target & incentive
      const monthIndex = moment().month(month).month();
      const start_date = moment()
        .year(yearValue)
        .month(monthIndex)
        .startOf("month")
        .format("YYYY-MM-DD");
      const end_date = moment()
        .year(yearValue)
        .month(monthIndex)
        .endOf("month")
        .format("YYYY-MM-DD");
      const [targetValue, incentiveValue] = await Promise.all([
        fetchEmployeeTarget(employee_id, start_date, end_date),
        fetchEmployeeIncentive(employee_id, start_date, end_date),
      ]);

      // 🔁 Apply incentive logic (same as Add Drawer)
      let autoAdditionalPayments = [];
      let autoAdditionalDeductions = [];
      const target = Number(targetValue || 0);
      const incentive = Number(incentiveValue || 0);
      if (target > 0) {
        const incentiveValueNum = incentive * 100;
        const diff = (incentiveValueNum - target) / 100;
        if (diff > 0) {
          autoAdditionalPayments = [{ name: "Incentive", value: diff }];
        } else if (diff < 0) {
          autoAdditionalDeductions = [
            { name: "Incentive", value: Math.abs(diff) },
          ];
        }
      }

      // Total payable = calculated_salary + additional payments - deductions
      const totalPayable =
        calculated.calculated_salary +
        autoAdditionalPayments.reduce((sum, p) => sum + Number(p.value), 0) -
        autoAdditionalDeductions.reduce((sum, d) => sum + Number(d.value), 0);

      // Update form data
      const updatedData = {
        ...updateFormData,
        year: dayjs(yearValue, "YYYY"),
        earnings,
        deductions,
        total_salary_payable: totalPayable,
        additional_payments: autoAdditionalPayments,
        additional_deductions: autoAdditionalDeductions,
        attendance_details: {
          total_days: calculated.total_days,
          present_days: calculated.present_days,
          paid_days: calculated.paid_days,
          lop_days: calculated.lop_days,
          per_day_salary: calculated.per_day_salary,
          calculated_salary: calculated.calculated_salary,
          absent_days: calculated.absent_days || 0,
          leave_days: calculated.leave_days || 0,
          half_days: calculated.half_days || 0,
          salary_from_date: calculated.salary_from_date,
          salary_to_date: calculated.salary_to_date,
        },
        monthly_business_info: {
          target: targetValue || 0,
          total_business_closed: incentiveValue || 0,
        },
      };

      setUpdateFormData(updatedData);
      updateForm.setFieldsValue(updatedData);
      setIsEditFormDirty(false);
      message.success("Salary recalculated successfully");
    } catch (error) {
      console.error("Recalculate in edit failed:", error);
      message.error("Failed to recalculate salary. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setUpdateLoading(true);
      setIsOpenUpdateModal(true);
      setIsEditFormDirty(false);
      const salaryData = await getSalaryById(id);
      if (salaryData) {
        setCurrentSalaryId(id);

        const yearAsDayjs = dayjs(salaryData.salary_year, "YYYY");

        const formData = {
          employee_id: salaryData?.employee_id?._id,
          month: salaryData?.salary_month,
          year: yearAsDayjs,
          earnings: salaryData?.earnings,
          deductions: salaryData?.deductions,
          additional_payments: salaryData?.additional_payments || [],
          additional_deductions: salaryData?.additional_deductions || [],
          total_salary_payable: salaryData?.total_salary_payable || 0,
          paid_amount: salaryData?.paid_amount || 0,
          payment_method: salaryData?.payment_method || "Cash",
          transaction_id: salaryData?.transaction_id || "",
          pay_date: salaryData?.pay_date
            ? moment(salaryData?.pay_date)
            : moment(),
          attendance_details: salaryData?.attendance_details || {},
          monthly_business_info: salaryData?.monthly_business_info || {
            target: 0,
            total_business_closed: 0,
          },
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
      message.success("Salary Management deleted successfully");
      setDeleteModalOpen(false);
      getAllSalary();
    } catch (error) {
      message.error("Failed to delete Salary Management");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateChange = (changedValues, allValues) => {
    if (changedValues.year && dayjs.isDayjs(changedValues.year)) {
      changedValues.year = changedValues.year.format("YYYY");
    }
    const currentEarnings = allValues.earnings || {};
    const currentDeductions = allValues.deductions || {};

    const originalEarnings = updateFormData.earnings || {};
    const originalDeductions = updateFormData.deductions || {};

    const earningsChanged =
      JSON.stringify(currentEarnings) !== JSON.stringify(originalEarnings);
    const deductionsChanged =
      JSON.stringify(currentDeductions) !== JSON.stringify(originalDeductions);

    if (earningsChanged || deductionsChanged) {
      setIsEditFormDirty(true);
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

      const additionalDeductionsTotal =
        updateFormData.additional_deductions.reduce(
          (sum, deduction) => sum + Number(deduction.value),
          0
        );

      // Calculate net payable
      const netPayable =
        totalEarnings -
        totalDeductions +
        additionalPaymentsTotal -
        additionalDeductionsTotal;

      const updateData = {
        ...updateFormData,
        earnings: updateFormData.earnings,
        deductions: updateFormData.deductions,
        net_payable: netPayable,
        total_salary_payable: updateFormData.total_salary_payable || netPayable,
        remaining_balance:
          (updateFormData.total_salary_payable || netPayable) -
          (updateFormData.paid_amount || 0),
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

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (["employee_id", "month", "year"].includes(name)) {
      setCalculatedSalary(null);
      setShowAdditionalPayments(false);
      setFormData((prev) => ({
        ...prev,
        paid_amount: 0,
        transaction_id: "",
        payment_method: "",
      }));
    }
  };

  const handleDeductionsChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      earnings: { ...prev.earnings },
      deductions: { ...prev.deductions, [name]: value },
      paid_amount: 0,
      transaction_id: "",
      payment_method: "",
    }));
    setCalculatedSalary(null);
    setShowAdditionalPayments(false);
  };

  const handleEarningsChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      earnings: { ...prev.earnings, [name]: value },
      deductions: { ...prev.deductions },
      paid_amount: 0,
      transaction_id: "",
      payment_method: "",
    }));
    setCalculatedSalary(null);
    setShowAdditionalPayments(false);
  };

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

  const handleAdditionalDeductionChange = (index, field, value) => {
    const updatedDeductions = [...formData.additional_deductions];
    updatedDeductions[index] = { ...updatedDeductions[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      additional_deductions: updatedDeductions,
    }));
  };

  const addAdditionalDeduction = () => {
    setFormData((prev) => ({
      ...prev,
      additional_deductions: [
        ...prev.additional_deductions,
        { name: "", value: 0 },
      ],
    }));
  };

  const removeAdditionalDeduction = (index) => {
    const updatedDeductions = formData.additional_deductions.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({
      ...prev,
      additional_deductions: updatedDeductions,
    }));
  };

  async function handleCalculateSalary() {
    try {
      setCalculateLoading(true);

      const response = await API.get("/salary-payment/calculate", {
        params: {
          employee_id: formData.employee_id,
          month: formData.month,
          year: formData.year,
          earnings: formData.earnings,
          deductions: formData.deductions,
        },
      });

      const calculated = response.data.data;
      setCalculatedSalary(calculated);
      let autoAdditionalPayments = [];
      let autoAdditionalDeductions = [];

      const target = Number(formData?.target || 0);
      const incentive = Number(formData?.incentive || 0);

      if (target > 0) {
        const incentiveValue = incentive * 100;
        const diff = (incentiveValue - target) / 100;

        if (diff > 0) {
          autoAdditionalPayments = [{ name: "Incentive", value: diff }];
        } else if (diff < 0) {
          autoAdditionalDeductions = [
            { name: "Incentive", value: Math.abs(diff) },
          ];
        }
      }

      const safeNumber = (v) => {
        if (v === null || v === undefined) return 0;
        if (typeof v === "object") {
          if (v === null) return 0;
          if ("amount" in v) return Number(v.amount) || 0;
          if ("value" in v) return Number(v.value) || 0;
          return 0;
        }
        if (v === "" || isNaN(Number(v))) return 0;
        return Number(v);
      };

      const totalEarnings = Object.entries(formData.earnings || {})
        .filter(([key]) => key !== "salary")
        .reduce((sum, [, val]) => sum + safeNumber(val), 0);

      const totalDeductions = Object.values(formData.deductions || {}).reduce(
        (sum, val) => sum + safeNumber(val),
        0
      );

      const calcSalary = safeNumber(calculated?.calculated_salary);

      const rawDefaultDifference = totalEarnings - totalDeductions - calcSalary;

      setFormData((prev) => ({
        ...prev,
        total_salary_payable: calculated.calculated_salary,
        additional_payments: autoAdditionalPayments,
        additional_deductions: autoAdditionalDeductions,
      }));
      setShowAdditionalPayments(true);
      message.success("Salary calculated successfully");
    } catch (error) {
      console.error("Error calculating salary:", error);

      if (
        error.response?.status === 406 &&
        error.response?.data?.existing_salary
      ) {
        setExistingSalaryRecord(error.response.data.existing_salary);
        setAlreadyPaidModalOpen(true);
        setCalculatedSalary(null);
        setShowAdditionalPayments(false);
        return;
      }

      message.error(
        error.response?.data?.message || "Failed to calculate salary"
      );
    } finally {
      setCalculateLoading(false);
    }
  }

  async function handleAddSalary() {
    try {
      const baseSalary = calculatedSalary
        ? calculatedSalary.calculated_salary
        : Object.values(formData.earnings).reduce(
            (sum, v) => sum + Number(v || 0),
            0
          ) -
          Object.values(formData.deductions).reduce(
            (sum, v) => sum + Number(v || 0),
            0
          );

      const additionalPaymentsTotal = formData.additional_payments.reduce(
        (sum, payment) => sum + Number(payment.value || 0),
        0
      );

      const additionalDeductionsTotal = formData.additional_deductions.reduce(
        (sum, deduction) => sum + Number(deduction.value || 0),
        0
      );

      const totalSalaryPayable =
        baseSalary + additionalPaymentsTotal - additionalDeductionsTotal;

      const paidAmount = Number(formData.paid_amount || 0);
      const remainingBalance = totalSalaryPayable - paidAmount;

      const attendanceDetails = calculatedSalary
        ? {
            total_days: calculatedSalary.total_days,
            present_days: calculatedSalary.present_days,
            paid_days: calculatedSalary.paid_days,
            lop_days: calculatedSalary.lop_days,
            per_day_salary: calculatedSalary.per_day_salary,
            calculated_salary: calculatedSalary.calculated_salary,
            absent_days: calculatedSalary.absent_days || 0,
            leave_days: calculatedSalary.leave_days || 0,
            half_days: calculatedSalary.half_days || 0,
            salary_from_date: calculatedSalary.salary_from_date,
            salary_to_date: calculatedSalary.salary_to_date,
          }
        : {};

      const monthlyTargetIncentive = {
        target: Number(formData.target || 0),
        total_business_closed: Number(formData.incentive || 0),
      };

      const salaryData = {
        employee_id: formData?.employee_id,
        salary_from_date: calculatedSalary
          ? calculatedSalary?.salary_from_date
          : new Date(),
        salary_to_date: calculatedSalary
          ? calculatedSalary.salary_to_date
          : new Date(),
        salary_month: formData.month,
        salary_year: formData.year,
        earnings: formData.earnings,
        deductions: formData.deductions,
        additional_deductions: formData.additional_deductions,
        additional_payments: formData.additional_payments,
        paid_days: calculatedSalary ? calculatedSalary.paid_days : 30,
        lop_days: calculatedSalary ? calculatedSalary.lop_days : 0,
        net_payable: totalSalaryPayable,
        paid_amount: paidAmount,
        remaining_balance: remainingBalance,
        total_salary_payable: totalSalaryPayable,
        payment_method: formData.payment_method,
        transaction_id:
          formData.payment_method === "Cash"
            ? null
            : formData.transaction_id || null,
        status: remainingBalance <= 0 ? "Paid" : "Pending",

        attendance_details: attendanceDetails,
        monthly_business_info: monthlyTargetIncentive,
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
    }
  }

  useEffect(() => {
    getAllSalary();
  }, []);

  const totalEarningsExcludingSalary = useMemo(() => {
    const earnings = formData.earnings || {};
    return Object.keys(earnings)
      .filter((key) => key !== "salary")
      .reduce((sum, key) => sum + (Number(earnings[key]) || 0), 0);
  }, [formData.earnings]);

  const totalDeductions = useMemo(() => {
    const baseDeductions = formData.deductions || {};

    const baseTotal = Object.values(baseDeductions).reduce(
      (sum, val) => sum + (Number(val) || 0),
      0
    );

    return baseTotal;
  }, [formData.deductions]);

  return (
    <div>
      <div className="flex mt-20">
        <Navbar visibility={true} />
        <Sidebar />
        <div className="flex-grow p-7">
          <h1 className="text-2xl font-semibold">Salary Management</h1>
          <div className="mt-6 mb-8">
            <div className="mb-10">
              <div className="flex justify-end items-center w-full">
                <div>
                  <button
                    onClick={() => setIsOpenAddModal(true)}
                    className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200">
                    + Add Salary
                  </button>
                </div>
              </div>
            </div>

            <DataTable columns={columns} data={allSalaryPayments} />
          </div>
        </div>

        <Drawer
          title="Add New Salary"
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
              <Button
                onClick={() => setIsOpenAddModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white">
                Cancel
              </Button>
              {calculatedSalary && (
                <Button type="primary" onClick={handleAddSalary}>
                  Save Salary
                </Button>
              )}
            </div>
          }>
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
                        disabledDate={(current) => {
                          if (!employeeDetails?.joining_date) return false;
                          const joinYear = dayjs(
                            employeeDetails.joining_date
                          ).year();
                          const currentYear = dayjs().year();
                          const year = current ? current.year() : null;
                          return year < joinYear || year > currentYear;
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Month <span className="text-red-600">*</span>
                      </label>
                      <Segmented
                        className="[&_.ant-segmented-item-selected]:!bg-green-600 [&_.ant-segmented-item-selected]:!text-white"
                        value={formData.month}
                        options={getValidMonths(
                          employeeDetails?.joining_date,
                          formData.year
                        )}
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
                  <div className="mt-6 border p-4 rounded bg-gray-50">
                    <h3 className="font-semibold text-lg mb-3">
                      Monthly Target & Incentive
                    </h3>

                    <div className="flex gap-6">
                      <div className="flex flex-col">
                        <label className="font-medium">Total Target</label>
                        <input
                          type="number"
                          value={formData.target || 0}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(formData?.target || 0)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <label className="font-medium">
                          Total Business Closed (1% Each)
                        </label>
                        <input
                          type="number"
                          value={formData.incentive || 0}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(formData?.incentive || 0)}
                        </span>
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
                          Fixed Salary
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={formData?.earnings?.salary || 0}
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Basic Salary
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter Basic Salary"
                          onChange={(e) =>
                            handleEarningsChange(e.target.name, e.target.value)
                          }
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          name="basic"
                          id="basic"
                          value={formData?.earnings?.basic}
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(formData?.earnings?.basic || 0)}
                        </span>
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
                          type="number"
                          name="hra"
                          id="hra"
                          value={formData?.earnings?.hra}
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(formData?.earnings?.hra || 0)}
                        </span>
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
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          name="travel_allowance"
                          id="travel_allowance"
                          value={formData?.earnings?.travel_allowance}
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(
                            formData?.earnings?.travel_allowance || 0
                          )}
                        </span>
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
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(
                            formData?.earnings?.medical_allowance || 0
                          )}
                        </span>
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
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          name="basket_of_benifits"
                          id="basket_of_benifits"
                          value={formData?.earnings?.basket_of_benifits}
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(
                            formData?.earnings?.basket_of_benifits || 0
                          )}
                        </span>
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
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          name="performance_bonus"
                          id="performance_bonus"
                          value={formData?.earnings?.performance_bonus}
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(
                            formData?.earnings?.performance_bonus || 0
                          )}
                        </span>
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
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          name="other_allowances"
                          id="other_allowances"
                          value={formData?.earnings?.other_allowances}
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(
                            formData?.earnings?.other_allowances || 0
                          )}
                        </span>
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
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          name="conveyance"
                          id="conveyance"
                          value={formData?.earnings?.conveyance}
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(
                            formData?.earnings?.conveyance || 0
                          )}
                        </span>
                      </div>
                      <div className="form-group mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Earnings
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={totalEarningsExcludingSalary.toFixed(2)}
                          disabled
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(totalEarningsExcludingSalary)}
                        </span>
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
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          name="income_tax"
                          id="income_tax"
                          value={formData?.deductions?.income_tax}
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(
                            formData?.deductions?.income_tax || 0
                          )}
                        </span>
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
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          name="esi"
                          id="esi"
                          value={formData?.deductions?.esi}
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(formData?.deductions?.esi || 0)}
                        </span>
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
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          name="epf"
                          id="epf"
                          value={formData?.deductions?.epf}
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(formData?.deductions?.epf || 0)}
                        </span>
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
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          name="professional_tax"
                          id="professional_tax"
                          value={formData?.deductions?.professional_tax}
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(
                            formData?.deductions?.professional_tax || 0
                          )}
                        </span>
                      </div>
                      <div className="form-group mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Deductions
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={totalDeductions.toFixed(2)}
                          disabled
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(totalDeductions.toFixed(2))}
                        </span>
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
                      disabled={
                        !formData.employee_id ||
                        !formData.month ||
                        !formData.year
                      }
                      style={{
                        backgroundColor: "#16a34a",
                      }}>
                      Continue
                    </Button>
                  </div>

                  {/* Calculated Salary Display */}
                  {calculatedSalary && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4">
                        Attendance Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Days
                          </label>
                          <input
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            value={calculatedSalary.total_days}
                            disabled
                          />
                          <span className="ml-2 font-medium font-mono text-blue-600">
                            {numberToIndianWords(
                              calculatedSalary.total_days || 0
                            )}
                          </span>
                        </div>
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Present Days
                          </label>
                          <input
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            value={calculatedSalary.present_days}
                            disabled
                          />
                          <span className="ml-2 font-medium font-mono text-blue-600">
                            {numberToIndianWords(
                              calculatedSalary.present_days || 0
                            )}
                          </span>
                        </div>
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Paid Days
                          </label>
                          <input
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            value={calculatedSalary.paid_days}
                            disabled
                          />
                          <span className="ml-2 font-medium font-mono text-blue-600">
                            {numberToIndianWords(
                              calculatedSalary.paid_days || 0
                            )}
                          </span>
                        </div>
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            LOP Days
                          </label>
                          <input
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            value={calculatedSalary.lop_days}
                            disabled
                          />
                          <span className="ml-2 font-medium font-mono text-blue-600">
                            {numberToIndianWords(
                              calculatedSalary.lop_days || 0
                            )}
                          </span>
                        </div>
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Per Day Salary
                          </label>
                          <input
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            value={calculatedSalary.per_day_salary.toFixed(2)}
                            disabled
                          />
                          <span className="ml-2 font-medium font-mono text-blue-600">
                            {numberToIndianWords(
                              calculatedSalary.per_day_salary.toFixed(2) || 0
                            )}
                          </span>
                        </div>
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Calculated Salary
                          </label>
                          <input
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            value={calculatedSalary.calculated_salary.toFixed(
                              2
                            )}
                            disabled
                          />
                          <span className="ml-2 font-medium font-mono text-blue-600">
                            {numberToIndianWords(
                              calculatedSalary.calculated_salary.toFixed(2) || 0
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 border p-4 rounded bg-gray-50">
                        <h3 className="font-semibold text-lg mb-3">
                          Monthly Target & Incentive
                        </h3>

                        <div className="flex gap-6">
                          <div className="flex flex-col">
                            <label className="font-medium">Total Target</label>
                            <input
                              type="number"
                              value={(formData.target || 0).toFixed(2)}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            />
                            <span className="ml-2 font-medium font-mono text-blue-600">
                              {numberToIndianWords(
                                (formData.target || 0).toFixed(2) || 0
                              )}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <label className="font-medium">
                              Total Business Closed (1% Each)
                            </label>
                            <input
                              type="number"
                              value={(formData.incentive || 0).toFixed(2)}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            />
                            <span className="ml-2 font-medium font-mono text-blue-600">
                              {numberToIndianWords(
                                (formData.incentive || 0).toFixed(2) || 0
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Payment Details */}
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
                          onClick={addAdditionalPayment}>
                          Add Payment
                        </Button>
                      </div>
                      {formData.additional_payments.map((payment, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                              <span className="ml-2 font-medium font-mono text-blue-600">
                                {numberToIndianWords(payment.value || 0)}
                              </span>
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

                  {showAdditionalPayments && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-orange-800">
                          Additional Deductions
                        </h3>
                        <Button
                          type="primary"
                          danger
                          icon={<PlusOutlined />}
                          onClick={addAdditionalDeduction}>
                          Add Deduction
                        </Button>
                      </div>
                      {formData.additional_deductions.map(
                        (deduction, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="form-group">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Deduction Name
                              </label>
                              <Input
                                placeholder="Enter deduction name"
                                value={deduction.name}
                                onChange={(e) =>
                                  handleAdditionalDeductionChange(
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
                                  onWheel={(e) => e.target.blur()}
                                  value={deduction.value}
                                  onChange={(e) =>
                                    handleAdditionalDeductionChange(
                                      index,
                                      "value",
                                      e.target.value
                                    )
                                  }
                                />
                                <span className="ml-2 font-medium font-mono text-green-600">
                                  {numberToIndianWords(
                                    Number(deduction.value || 0).toFixed(2)
                                  )}
                                </span>
                              </div>
                              <Button
                                type="primary"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removeAdditionalDeduction(index)}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {calculatedSalary && (
                    <div className="bg-blue-50 p-4 rounded-lg mt-4">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4">
                        Transaction Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Salary Payable
                          </label>
                          {(() => {
                            const base =
                              calculatedSalary?.calculated_salary || 0;
                            const addPayments =
                              formData.additional_payments.reduce(
                                (sum, p) => sum + Number(p.value || 0),
                                0
                              );
                            const addDeductions =
                              formData.additional_deductions.reduce(
                                (sum, d) => sum + Number(d.value || 0),
                                0
                              );
                            const total = base + addPayments - addDeductions;
                            return (
                              <>
                                <input
                                  type="number"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                                  value={total.toFixed(2)}
                                  disabled
                                />
                                <span className="ml-2 font-medium font-mono text-blue-600">
                                  {numberToIndianWords(total.toFixed(2))}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
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
                loading={updateLoading}>
                Update Salary
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
                  <Input type="number" />
                </Form.Item>
                <Form.Item name={["earnings", "hra"]} label="HRA">
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "travel_allowance"]}
                  label="Travel Allowance">
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "medical_allowance"]}
                  label="Medical Allowance">
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "basket_of_benifits"]}
                  label="Basket of Benefits">
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "performance_bonus"]}
                  label="Performance Bonus">
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name={["earnings", "other_allowances"]}
                  label="Other Allowances">
                  <Input type="number" />
                </Form.Item>
                <Form.Item name={["earnings", "conveyance"]} label="Conveyance">
                  <Input type="number" />
                </Form.Item>
              </div>
              <div className="form-group mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Earnings
                </label>
                <Input
                  value={updateTotalEarnings.toFixed(2)}
                  disabled
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
                  label="Professional Tax">
                  <Input type="number" />
                </Form.Item>
              </div>
              <div className="form-group mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Deductions
                </label>
                <Input
                  value={updateTotalDeductions.toFixed(2)}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <Button
                type="primary"
                onClick={handleRecalculateInEdit}
                loading={updateLoading}
                style={{ backgroundColor: "#16a34a" }}>
                Continue
              </Button>
            </div>

            {!isEditFormDirty && (
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
                    Monthly Target & Incentive
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      label="Total Target"
                      name={["monthly_business_info", "target"]}>
                      <Input type="number" disabled />
                    </Form.Item>
                    <Form.Item
                      label="Total Business Closed (1% Each)"
                      name={["monthly_business_info", "total_business_closed"]}
                      getValueProps={(value) => ({ value: (value || 0) / 100 })}
                      getValueFromEvent={(e) => Number(e.target.value) * 100}>
                      <Input type="number" disabled />
                    </Form.Item>
                  </div>
                </div>
              </div>
            )}

            {!isEditFormDirty && (
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
                    }}>
                    Add Payment
                  </Button>
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
                                <Input
                                  type="number"
                                  placeholder="Enter amount"
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
            )}

            {!isEditFormDirty && (
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-orange-800">
                    Additional Deductions
                  </h3>
                  <Button
                    type="primary"
                    danger
                    icon={<PlusOutlined />}
                    onClick={() => {
                      const currentDeductions =
                        updateForm.getFieldValue("additional_deductions") || [];
                      updateForm.setFieldsValue({
                        additional_deductions: [
                          ...currentDeductions,
                          { name: "", value: 0 },
                        ],
                      });
                    }}>
                    Add Deduction
                  </Button>
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
            )}

            {!isEditFormDirty && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="total_salary_payable"
                    label="Total Salary Payable">
                    <Input type="number" />
                  </Form.Item>
                  {/* <Form.Item name="paid_amount" label="Paid Amount">
                  <Input type="number" />
                </Form.Item> */}
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <Form.Item
                  name="payment_method"
                  label="Payment Mode"
                  rules={[
                    { required: true, message: "Please select payment mode" },
                  ]}>
                  <Select
                    placeholder="Select payment mode"
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
                    label="Transaction ID"
                    rules={[
                      {
                        required:
                          updateForm.getFieldValue("payment_method") !== "Cash",
                        message: "Transaction ID is required",
                      },
                    ]}>
                    <Input placeholder="Enter transaction reference" />
                  </Form.Item>
                )}

                <Form.Item
                  name="pay_date"
                  label="Pay Date"
                  rules={[
                    { required: true, message: "Please select pay date" },
                  ]}
                  getValueProps={(value) => ({
                    value: value ? moment(value) : null,
                  })}
                  getValueFromEvent={(date) => (date ? date.toDate() : null)}>
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD MMM YYYY"
                    disabledDate={(current) =>
                      current && current.isAfter(moment().endOf("day"))
                    }
                  />
                </Form.Item>
              </div> */}
              </div>
            )}
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
            Are you sure you want to delete this salary ? This action cannot be
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
            <div className="space-y-5">
              {/* Salary Period */}
              <section className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
                  <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                  Salary Period
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                      Month
                    </p>
                    <p className="text-slate-900 font-semibold text-base">
                      {existingSalaryRecord.salary_month}{" "}
                      {existingSalaryRecord.salary_year}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                      From
                    </p>
                    <p className="text-slate-900 font-semibold text-base">
                      {dayjs
                        .utc(existingSalaryRecord.salary_from_date)
                        .format("DD MMM YYYY")}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                      To
                    </p>
                    <p className="text-slate-900 font-semibold text-base">
                      {dayjs
                        .utc(existingSalaryRecord.salary_to_date)
                        .format("DD MMM YYYY")}
                    </p>
                  </div>
                </div>
              </section>

              {/* Attendance Summary */}
                <section className="bg-gradient-to-br from-purple-50 to-purple-50 p-6 rounded-xl shadow-md border border-purple-200 hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
                  <span className="w-1 h-6 bg-purple-600 rounded-full mr-3"></span>
                  Attendance Details
                </h4>
                <ul className="space-y-2">
                  {Object.entries(existingSalaryRecord.attendance_details || {}).map(
                    ([key, val]) => (
                      <li
                        key={key}
                        className="flex justify-between items-center bg-white p-4 rounded-lg border border-purple-100 hover:border-purple-200 transition-colors">
                        <span className="capitalize text-slate-700 font-medium">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-bold text-purple-700">
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

              {/* Earnings */}
              <section className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-md border border-green-200 hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
                  <span className="w-1 h-6 bg-green-600 rounded-full mr-3"></span>
                  Earnings
                </h4>
                <ul className="space-y-2">
                  {Object.entries(existingSalaryRecord.earnings || {}).map(
                    ([key, val]) => (
                      <li
                        key={key}
                        className="flex justify-between items-center bg-white p-4 rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                        <span className="capitalize text-slate-700 font-medium">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-bold text-green-700">
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
              <section className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-xl shadow-md border border-red-200 hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
                  <span className="w-1 h-6 bg-red-600 rounded-full mr-3"></span>
                  Deductions
                </h4>
                <ul className="space-y-2">
                  {Object.entries(existingSalaryRecord.deductions || {}).map(
                    ([key, val]) => (
                      <li
                        key={key}
                        className="flex justify-between items-center bg-white p-4 rounded-lg border border-red-100 hover:border-red-200 transition-colors">
                        <span className="capitalize text-slate-700 font-medium">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-bold text-red-700">
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
              <section className="bg-gradient-to-br from-blue-50 to-blue-50 p-6 rounded-xl shadow-md border border-blue-200 hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
                  <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                  Target Details
                </h4>
                <ul className="space-y-2">
                  {Object.entries(existingSalaryRecord.monthly_business_info || {}).map(
                    ([key, val]) => (
                      <li
                        key={key}
                        className="flex justify-between items-center bg-white p-4 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                        <span className="capitalize text-slate-700 font-medium">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-bold text-blue-700">
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
                <section className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl shadow-md border border-blue-200 hover:shadow-lg transition-shadow">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
                    <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                    Additional Payments
                  </h4>
                  <ul className="space-y-2">
                    {existingSalaryRecord.additional_payments.map((pay, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center bg-white p-4 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                        <span className="text-slate-700 font-medium">
                          {pay.name || "Payment"}
                        </span>
                        <span className="font-bold text-blue-700">
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
                <section className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-shadow">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
                    <span className="w-1 h-6 bg-orange-600 rounded-full mr-3"></span>
                    Additional Deductions
                  </h4>
                  <ul className="space-y-2">
                    {existingSalaryRecord.additional_deductions.map(
                      (ded, i) => (
                        <li
                          key={i}
                          className="flex justify-between items-center bg-white p-4 rounded-lg border border-orange-100 hover:border-orange-200 transition-colors">
                          <span className="text-slate-700 font-medium">
                            {ded.name || "Deduction"}
                          </span>
                          <span className="font-bold text-orange-700">
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

              {/* Payment Summary */}
              <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-xl shadow-lg border-2 border-indigo-200">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
                  <span className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>
                  Payment Summary
                </h4>
                <div className="space-y-3 bg-white p-5 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-700 font-medium">
                      Calculated Salary
                    </span>
                    <span className="text-slate-900 font-semibold text-lg">
                      ₹
                      {Number(
                       existingSalaryRecord?.attendance_details?.calculated_salary
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  {existingSalaryRecord.additional_payments?.length > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-700 font-medium">
                        Additional Payments:
                      </span>
                      <span className="text-green-700 font-semibold text-lg">
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

                

                  {existingSalaryRecord?.additional_deductions?.length > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-700 font-medium">
                        Additional Deductions:
                      </span>
                      <span className="text-red-700 font-semibold text-lg">
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

                  <div className="flex justify-between items-center py-3 border-t-2 border-slate-300 mt-3">
                    <span className="text-slate-900 font-bold text-lg">
                      Net Payable:
                    </span>
                    <span className="text-indigo-700 font-bold text-2xl">
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

                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-700 font-medium">
                      Paid Amount:
                    </span>
                    <span className="text-slate-900 font-semibold text-lg">
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

                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-700 font-medium">
                      Remaining Balance:
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        Number(existingSalaryRecord.remaining_balance) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}>
                      ₹
                      {Number(
                        existingSalaryRecord.remaining_balance
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 mt-3 pt-3 border-t border-slate-200">
                    <span className="text-slate-700 font-medium">Status:</span>
                    <span
                      className={`px-4 py-1 rounded-full font-semibold text-sm ${
                        existingSalaryRecord.status === "Paid"
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}>
                      {existingSalaryRecord.status}
                    </span>
                  </div>

                  {existingSalaryRecord.transaction_id && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-700 font-medium">
                        Transaction ID:
                      </span>
                      <span className="text-slate-900 font-mono text-sm bg-slate-100 px-3 py-1 rounded">
                        {existingSalaryRecord.transaction_id}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-700 font-medium">
                      Payment Method:
                    </span>
                    <span className="text-slate-900 font-medium">
                      {existingSalaryRecord.payment_method || "—"}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              Loading salary details…
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default HRSalaryManagement;
