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
import {
  TrendingUp,
  Target,
  CheckCircle,
  BarChart3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import API from "../instance/TokenInstance";
import dayjs from "dayjs";
import {
  Select as AntSelect,
  Segmented,
  Button as AntButton,
  Flex,
  Spin,
} from "antd";
import { IoMdMore } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { numberToIndianWords } from "../helpers/numberToIndianWords";
import moment from "moment";
import utc from "dayjs/plugin/utc";
import { LoadingOutlined } from "@ant-design/icons";
import { MdOutlineMan } from "react-icons/md";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
dayjs.extend(utc);

const HRSalaryManagement = () => {
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
  const [showComponents, setShowComponents] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form] = Form.useForm();
  const [dataTableLoading, setDataTableLoading] = useState(false);
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
    advance_payments: [],
    calculated_incentive: 0,
    payment_method: "",
    transaction_id: "",
    monthly_business_info: {
      target: 0,
      previous_remaining_target: 0,
      total_target: 0,
      total_business_closed: 0,
      current_remaining_target: 0,
    },
    status: "",
  });

  // New state for confirmation modals
  const [payAsSalaryModalOpen, setPayAsSalaryModalOpen] = useState(false);
  const [payAsIncentiveModalOpen, setPayAsIncentiveModalOpen] = useState(false);

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
    { key: "paidAmount", header: "Paid Amount" },
    { key: "status", header: "Payment Status" },
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
    payment_method: "",
    transaction_id: "",
    monthly_business_info: {
      target: 0,
      previous_remaining_target: 0,
      total_target: 0,
      total_business_closed: 0,
      current_remaining_target: 0,
    },
    total_salary: 0,
    pigmy_perc: 0,
    loan_perc: 0,
    pigmy_collection_incentive: 0,
    loan_collection_incentive: 0,
  });
  const [showCollectionContinue, setShowCollectionContinue] = useState(false);
  const [collectionLoading, setCollectionLoading] = useState(false);
  // Handler for Pay as Salary button
  const handlePayAsSalary = () => {
    setPayAsSalaryModalOpen(true);
  };

  // Handler for Pay as Incentive button
  const handlePayAsIncentive = () => {
    setPayAsIncentiveModalOpen(true);
  };

  // Confirm Pay as Salary
  const confirmPayAsSalary = () => {
    const totalTarget = Number(
      formData.monthly_business_info.total_target || 0
    );
    const totalBusinessClosed = Number(
      formData.monthly_business_info.total_business_closed || 0
    );
    const currentRemainingTarget = Number(
      formData.monthly_business_info.current_remaining_target || 0
    );

    // Calculate raw incentive as per requirements
    const rawIncentive = (totalTarget - totalBusinessClosed) / 100;

    let incentiveAmount = 0;
    if (rawIncentive > 0) {
      // If rawIncentive > 0, calculatedIncentive = totalBusinessClosed / 100
      incentiveAmount = totalBusinessClosed / 100;
    } else if (rawIncentive < 0) {
      // If rawIncentive < 0, calculatedIncentive = abs(rawIncentive)
      incentiveAmount = Math.abs(rawIncentive);
    }

    // Handle current_remaining_target based on requirement
    // If currentRemainingTarget < 0, set to 0; else, keep as is
    const updatedRemainingTarget =
      currentRemainingTarget < 0 ? 0 : currentRemainingTarget;

    setFormData((prev) => ({
      ...prev,
      additional_payments: [
        ...prev.additional_payments,
        {
          name: "Salary Payable",
          value: incentiveAmount,
        },
      ],
      monthly_business_info: {
        ...prev.monthly_business_info,
        current_remaining_target: updatedRemainingTarget,
      },
      calculated_incentive: 0, // Reset calculated incentive
    }));

    message.success("Salary payable amount added successfully");
    setPayAsSalaryModalOpen(false);
  };

  // Confirm Pay as Incentive
  const confirmPayAsIncentive = () => {
    const totalTarget = Number(
      formData.monthly_business_info.total_target || 0
    );
    const totalBusinessClosed = Number(
      formData.monthly_business_info.total_business_closed || 0
    );

    // Calculate raw incentive
    const rawIncentive = (totalTarget - totalBusinessClosed) / 100;
    let incentiveAmount = 0;

    if (rawIncentive > 0) {
      // If rawIncentive > 0, calculatedIncentive = totalBusinessClosed / 100
      incentiveAmount = totalBusinessClosed / 100;
    } else if (rawIncentive < 0) {
      // If rawIncentive < 0, calculatedIncentive = abs(rawIncentive)
      incentiveAmount = Math.abs(rawIncentive);
    }

    setFormData((prev) => ({
      ...prev,
      calculated_incentive: incentiveAmount,
      monthly_business_info: {
        ...prev.monthly_business_info,
        current_remaining_target: 0,
      },
    }));

    message.success("Incentive payable amount added successfully");
    setPayAsIncentiveModalOpen(false);
  };

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
      return response?.data?.data;
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

  const fetchPreviousRemainingTarget = async (employeeId) => {
    try {
      const response = await API.get(
        `/salary-payment/employees/${employeeId}?month=${formData.month}&year=${formData.year}`
      );
      return response.data?.data.remainingTarget || 0;
    } catch (err) {
      console.error("Failed to fetch Remaining Target:", err);
      return 0;
    }
  };

  const fetchEmployeeBusinessClosed = async (
    employeeId,
    start_date,
    end_date
  ) => {
    try {
      const response = await API.get(
        `/enroll/employee/${employeeId}/incentive`,
        { params: { start_date, end_date } }
      );
      return response.data?.incentiveSummary?.total_group_value || 0;
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
          advance_payments: salaryData?.advance_payments || [],
          calculated_incentive: salaryData?.calculated_incentive || 0,
          total_salary_payable: salaryData?.total_salary_payable || 0,
          paid_amount: salaryData?.paid_amount || 0,
          payment_method: salaryData?.payment_method,
          transaction_id: salaryData?.transaction_id || "",
          pay_date: salaryData?.pay_date
            ? moment(salaryData?.pay_date)
            : moment(),
          attendance_details: salaryData?.attendance_details || {},
          monthly_business_info: salaryData?.monthly_business_info || {
            target: 0,
            previous_remaining_target: 0,
            total_target: 0,
            total_business_closed: 0,
            current_remaining_target: 0,
          },
          status: salaryData?.status,
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
  const handleFetchCollectionIncentive = async () => {
    try {
      setCollectionLoading(true);
      const monthIndex = moment().month(formData.month).month();
      const start_date = moment()
        .year(formData.year)
        .month(monthIndex)
        .startOf("month")
        .format("YYYY-MM-DD");
      const end_date = moment()
        .year(formData.year)
        .month(monthIndex)
        .endOf("month")
        .format("YYYY-MM-DD");

      const response = await API.get(
        `/payment/pigmy-loan/collection/${formData.employee_id}/pigmy-perc/${formData.pigmy_perc}/loan-perc/${formData.loan_perc}`,
        { params: { from_date: start_date, to_date: end_date } }
      );

      const { total_loan_collections_perc, total_pigmy_collections_perc } =
        response.data.data;

      setFormData((prev) => ({
        ...prev,
        loan_collection_incentive: total_loan_collections_perc || 0,
        pigmy_collection_incentive: total_pigmy_collections_perc || 0,
      }));

      setShowCollectionContinue(false); // Hide button after fetching
      message.success("Collection data fetched successfully");
    } catch (error) {
      message.error("Failed to fetch collection data");
    } finally {
      setCollectionLoading(false);
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
            className="text-blue-600"
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
            View
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
        total_salary: emp?.salary || 0,
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
      fetchSalaryDetails();
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
      const businessClosedValue = await fetchEmployeeBusinessClosed(
        formData.employee_id,
        start_date,
        end_date
      );
      const employeePreviousRemainingTarget =
        await fetchPreviousRemainingTarget(formData.employee_id);
      const totalTarget =
        (targetValue || 0) + (employeePreviousRemainingTarget || 0);
      const remainingTarget = (totalTarget || 0) - (businessClosedValue || 0);
      setFormData((prev) => ({
        ...prev,
        monthly_business_info: {
          target: targetValue ?? 0,
          previous_remaining_target: employeePreviousRemainingTarget ?? 0,
          total_target: totalTarget ?? 0,
          total_business_closed: businessClosedValue ?? 0,
          current_remaining_target: remainingTarget ?? 0,
        },
      }));
    } catch (err) {
      console.error("Failed to auto-load target & incentive", err);
    }
  };

  useEffect(() => {
    if (formData.employee_id) {
      fetchSalaryDetails();
    }
  }, [formData?.employee_id]);

  const handleChange = (name, value) => {
    setFormData((prev) => {
      let updatedFormData = { ...prev, [name]: value };

      // Reset calculated_incentive when month changes
      if (name === "month") {
        updatedFormData = {
          ...updatedFormData,
          calculated_incentive: 0,
        };
      }

      if (["employee_id", "month", "year", "target"].includes(name)) {
        setCalculatedSalary(null);
        setShowComponents(false);
        updatedFormData = {
          ...updatedFormData,
          paid_amount: 0,
          transaction_id: "",
          payment_method: "",
        };
      }

      return updatedFormData;
    });
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
    setShowComponents(false);
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
    setShowComponents(false);
  };

  const handleAdvancePaymentChange = (index, field, value) => {
    const updatedPayments = [...formData.advance_payments];
    updatedPayments[index] = { ...updatedPayments[index], [field]: value };
    setFormData((prev) => ({ ...prev, advance_payments: updatedPayments }));
  };

  const addAdvancePayment = () => {
    setFormData((prev) => ({
      ...prev,
      advance_payments: [...prev.advance_payments, { name: "", value: 0 }],
    }));
  };

  const removeAdvancePayment = (index) => {
    const updatedPayments = formData.advance_payments.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({ ...prev, advance_payments: updatedPayments }));
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

  const updateTotalEarnings = useMemo(() => {
    const earnings = updateFormData?.earnings || {};
    return Object.values(earnings).reduce((sum, v) => sum + Number(v || 0), 0);
  }, [updateFormData]);

  const updateTotalDeductions = useMemo(() => {
    const deductions = updateFormData?.deductions || {};
    const base = Object.values(deductions).reduce(
      (sum, v) => sum + Number(v || 0),
      0
    );
    return base;
  }, [updateFormData]);

async function handleCalculateSalary() {
  try {
    setCalculateLoading(true);
    
    // Reset specific dynamic fields
    setFormData((prev) => ({
      ...prev,
      additional_payments: [],
      additional_deductions: [],
      advance_payments: [],
    }));

    // 1. Prepare Dates for Collection API
    const monthIndex = moment().month(formData.month).month();
    const start_date = moment().year(formData.year).month(monthIndex).startOf("month").format("YYYY-MM-DD");
    const end_date = moment().year(formData.year).month(monthIndex).endOf("month").format("YYYY-MM-DD");

    // 2. Run both API calls in parallel for better performance
    const [salaryRes, collectionRes] = await Promise.all([
      API.get("/salary-payment/calculate", {
        params: {
          employee_id: formData.employee_id,
          month: formData.month,
          year: formData.year,
          earnings: formData.earnings,
          deductions: formData.deductions,
        },
      }),
      API.get(
        `/payment/pigmy-loan/collection/${formData.employee_id}/pigmy-perc/${formData.pigmy_perc}/loan-perc/${formData.loan_perc}`,
        { params: { from_date: start_date, to_date: end_date } }
      )
    ]);

    const calculated = salaryRes.data.data;
    const { total_loan_collections_perc, total_pigmy_collections_perc } = collectionRes.data.data;

    // 3. Update state with all results
    setCalculatedSalary(calculated);
    setFormData((prev) => ({
      ...prev,
      total_salary_payable: calculated.calculated_salary,
      loan_collection_incentive: total_loan_collections_perc || 0,
      pigmy_collection_incentive: total_pigmy_collections_perc || 0,
    }));

    setShowComponents(true);
    message.success("Salary and Collections calculated successfully");
  } catch (error) {
    console.error("Error in calculation:", error);
    if (error.response?.status === 406 && error.response?.data?.existing_salary) {
      setExistingSalaryRecord(error.response.data.existing_salary);
      setAlreadyPaidModalOpen(true);
      setCalculatedSalary(null);
      setShowComponents(false);
      return;
    }
    message.error(error.response?.data?.message || "Failed to calculate details");
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

      const advanceTotal = formData.advance_payments.reduce(
        (sum, a) => sum + Number(a.value || 0),
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

      // Apply business condition - New logic according to requirements
      let totalSalaryPayable = 0;
      let finalCalculatedIncentive = formData.calculated_incentive || 0;

      const totalTarget = Number(
        formData.monthly_business_info.total_target || 0
      );
      const totalBusinessClosed = Number(
        formData.monthly_business_info.total_business_closed || 0
      );

      // Calculate raw incentive
      const rawIncentive = (totalTarget - totalBusinessClosed) / 100;

      if (rawIncentive > 0) {
        totalSalaryPayable = 0;
        totalSalaryPayable += advanceTotal;
        totalSalaryPayable +=
          additionalPaymentsTotal - additionalDeductionsTotal;
        totalSalaryPayable -= totalDeductions;
      } else if (rawIncentive < 0) {
        totalSalaryPayable = baseSalary;
        totalSalaryPayable += advanceTotal;
        totalSalaryPayable +=
          additionalPaymentsTotal - additionalDeductionsTotal;
      } else {
        totalSalaryPayable = baseSalary;
        totalSalaryPayable += advanceTotal;
        totalSalaryPayable +=
          additionalPaymentsTotal - additionalDeductionsTotal;
      }

      // Add calculated incentive if it's been set (Pay as Incentive was confirmed)
      // totalSalaryPayable += finalCalculatedIncentive;

      const paidAmount = Number(formData.paid_amount || 0);
      const remainingBalance = totalSalaryPayable - paidAmount;

      const attendanceDetails = calculatedSalary
        ? {
            total_days: calculatedSalary.total_days,
            present_days: calculatedSalary.present_days,
            paid_days: calculatedSalary.paid_days,
            lop_days: calculatedSalary.lop_days,
            lop: calculatedSalary.lop,
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
        target: Number(formData.monthly_business_info.target || 0),
        total_business_closed: Number(
          formData.monthly_business_info.total_business_closed || 0
        ),
        previous_remaining_target:
          formData.monthly_business_info.previous_remaining_target,
        total_target: formData.monthly_business_info.total_target,
        current_remaining_target:
          formData.monthly_business_info.current_remaining_target,
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
        additional_payments: formData.additional_payments,
        additional_deductions: formData.additional_deductions,
        advance_payments: formData.advance_payments,
        calculated_incentive: finalCalculatedIncentive,
        paid_days: calculatedSalary ? calculatedSalary.paid_days : 30,
        lop: calculatedSalary ? calculatedSalary.lop : 0,
        lop_days: calculatedSalary ? calculatedSalary.lop_days : 0,
        net_payable: totalSalaryPayable,
        paid_amount: paidAmount,
        remaining_balance: remainingBalance,
        total_salary_payable: totalSalaryPayable,
        payment_method: formData.payment_method,
        status: "Pending",
        attendance_details: attendanceDetails,
        monthly_business_info: monthlyTargetIncentive,
      };

      await API.post("/salary-payment/", salaryData);
      message.success("Salary added successfully");
      setIsOpenAddModal(false);
      setCalculatedSalary(null);
      setShowComponents(false);
      getAllSalary();
    } catch (error) {
      console.error("Error adding salary:", error);
      message.error(error?.response?.data?.message ?? "Failed to add Salary");
    }
  }

  async function getAllSalary() {
    try {
      setDataTableLoading(true);
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
        status: data?.status,
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

  const calculatedIncentive = useMemo(() => {
    const totalTarget = Number(
      formData.monthly_business_info.total_target || 0
    );
    const totalBusinessClosed = Number(
      formData.monthly_business_info.total_business_closed || 0
    );

    const rawIncentive = (totalTarget - totalBusinessClosed) / 100;

    if (rawIncentive > 0) {
      return totalBusinessClosed / 100;
    } else if (rawIncentive < 0) {
      return Math.abs(rawIncentive);
    } else {
      return 0;
    }
  }, [
    formData.monthly_business_info.total_target,
    formData.monthly_business_info.total_business_closed,
  ]);

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
              <div className="mb-8">
                <h1 className="text-lg text-black font-bold font-mono p-2">
                  Quick Navigator
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link
                    to="/payment-menu/payment-in-out-menu/payment-out/salary-payment"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                    <RiMoneyRupeeCircleFill
                      className="text-blue-600 group-hover:scale-110 transition-transform"
                      size={24}
                    />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">
                      Accounts / Salary Payment
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
            </div>
            {dataTableLoading ? (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                className="w-full"
              />
            ) : (allSalaryPayments || []).length > 0 ? (
              <DataTable columns={columns} data={allSalaryPayments} />
            ) : (
              <Empty description="No Salary Data Found" />
            )}
          </div>
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
          setShowComponents(false);
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

                  {/* === Earnings Subsection (Inside Employee Details) === */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Earnings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gross Salary
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
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={formData?.earnings?.basic || 0}
                          disabled
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
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={formData?.earnings?.hra || 0}
                          disabled
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
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={formData?.earnings?.travel_allowance || 0}
                          disabled
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
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={formData?.earnings?.medical_allowance || 0}
                          disabled
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
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={formData?.earnings?.basket_of_benifits || 0}
                          disabled
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
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={formData?.earnings?.performance_bonus || 0}
                          disabled
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
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={formData?.earnings?.other_allowances || 0}
                          disabled
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
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={formData?.earnings?.conveyance || 0}
                          disabled
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(
                            formData?.earnings?.conveyance || 0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* === Deductions Subsection (Inside Employee Details) === */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold  mb-4">Deductions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Income Tax
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={formData?.deductions?.income_tax || 0}
                          disabled
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
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={formData?.deductions?.esi || 0}
                          disabled
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
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={formData?.deductions?.epf || 0}
                          disabled
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
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={formData?.deductions?.professional_tax || 0}
                          disabled
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(
                            formData?.deductions?.professional_tax || 0
                          )}
                        </span>
                      </div>
                      <div className="form-group mt-2">
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
                </div>
                <div className="mt-6 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-8 shadow-sm">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-xl text-gray-900">
                        Monthly Target & Incentive
                      </h3>
                    </div>
                  </div>
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Monthly Target */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <label className="font-semibold text-gray-700 text-sm">
                          Current Month Target
                        </label>
                      </div>
                      <input
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        value={formData?.monthly_business_info?.target || 0}
                        disabled
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg text-gray-900 font-semibold bg-slate-50 focus:bg-white focus:border-blue-300 focus:outline-none transition-colors disabled:cursor-not-allowed"
                      />
                      <span className="mt-2 font-medium font-mono text-blue-600 text-sm">
                        {numberToIndianWords(
                          formData?.monthly_business_info?.target ?? 0
                        )}
                      </span>
                    </div>
                    {/* Remaining Target */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        <label className="font-semibold text-gray-700 text-sm">
                          Previous Remaining Target
                        </label>
                      </div>
                      <input
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        value={
                          formData?.monthly_business_info
                            ?.previous_remaining_target || 0
                        }
                        disabled
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg text-gray-900 font-semibold bg-slate-50 focus:bg-white focus:border-amber-300 focus:outline-none transition-colors disabled:cursor-not-allowed"
                      />
                      <span className="mt-2 font-medium font-mono text-amber-600 text-sm">
                        {numberToIndianWords(
                          formData?.monthly_business_info
                            ?.previous_remaining_target ?? 0
                        )}
                      </span>
                    </div>
                    {/* Total Target */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        <label className="font-semibold text-gray-700 text-sm">
                          Total Target
                        </label>
                      </div>
                      <input
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        value={
                          formData?.monthly_business_info?.total_target || 0
                        }
                        disabled
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg text-gray-900 font-semibold bg-slate-50 focus:bg-white focus:border-purple-300 focus:outline-none transition-colors disabled:cursor-not-allowed"
                      />
                      <span className="mt-2 font-medium font-mono text-purple-600 text-sm">
                        {numberToIndianWords(
                          formData?.monthly_business_info?.total_target ?? 0
                        )}
                      </span>
                    </div>
                    {/* Total Business Closed */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <label className="font-semibold text-gray-700 text-sm">
                          Total Business Closed (Current Month)
                        </label>
                      </div>
                      <input
                        type="number"
                        value={
                          formData?.monthly_business_info
                            ?.total_business_closed ?? 0
                        }
                        readOnly
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg text-gray-900 font-semibold bg-emerald-50 cursor-not-allowed"
                      />
                      <span className="mt-2 font-medium font-mono text-emerald-600 text-sm">
                        {numberToIndianWords(
                          formData?.monthly_business_info
                            ?.total_business_closed || 0
                        )}
                      </span>
                    </div>
                    {/* Current Remaining Target */}
                  </div>

                  {/* === Target Achievement Badge === */}
                  <div className="mt-4 flex justify-start">
                    {(() => {
                      const totalTarget = Number(
                        formData.monthly_business_info.total_target || 0
                      );
                      const totalBusinessClosed = Number(
                        formData.monthly_business_info.total_business_closed ||
                          0
                      );
                      const variance = totalBusinessClosed - totalTarget;

                      // Configuration for different status states
                      const statusConfig = {
                        exceeded: {
                          icon: (
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                          ),
                          container:
                            "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100/50",
                          label: `Business Exceeded by ₹${variance.toLocaleString(
                            "en-IN"
                          )}`,
                        },
                        achieved: {
                          icon: (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ),
                          container:
                            "bg-green-50 text-green-700 border-green-200 shadow-sm shadow-blue-100/50",
                          label: "Target Achieved",
                        },
                        shortfall: {
                          icon: (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          ),
                          container:
                            "bg-red-50 text-red-700 border-red-200 shadow-sm shadow-red-100/50",
                          label: `Business Shortfall: ₹${Math.abs(
                            variance
                          ).toLocaleString("en-IN")}`,
                        },
                      };

                      let currentStatus = statusConfig.shortfall;
                      if (variance > 0) currentStatus = statusConfig.exceeded;
                      else if (variance === 0)
                        currentStatus = statusConfig.achieved;

                      return (
                        <div
                          className={`
        inline-flex items-center gap-2.5 px-4 py-1.5 
        rounded-xl border font-bold text-xs tracking-tight
        transition-all duration-300 ease-in-out
        ${currentStatus.container}
      `}>
                          <div className="flex items-center justify-center">
                            {currentStatus.icon}
                          </div>
                          <span className="uppercase">
                            {currentStatus.label}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="mt-6 bg-slate-50 rounded-2xl border border-slate-200 p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-xl text-gray-900">
                        Collection Incentive
                      </h3>
                    </div>

                    {/* Continue Button - Shows only when values are updated */}
                    {showCollectionContinue && (
                      <Button
                        type="primary"
                        onClick={handleFetchCollectionIncentive}
                        loading={collectionLoading}
                        style={{
                          backgroundColor: "#16a34a",
                          borderColor: "#16a34a",
                        }}
                        className="px-8 shadow-md">
                        Continue
                      </Button>
                    )}
                  </div>

             <div className="mt-6 bg-slate-50 rounded-2xl border border-slate-200 p-8 shadow-sm">
  <div className="flex items-center gap-3 mb-6">
   
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="flex flex-col">
      <label className="font-semibold text-gray-700 text-sm mb-2 text-blue-600">
        Pigmy Collection Percentage (%)
      </label>
      <Input
        type="number"
        placeholder="Enter %"
        value={formData.pigmy_perc}
        onChange={(e) => setFormData(prev => ({ ...prev, pigmy_perc: e.target.value }))}
        className="h-11 font-bold text-lg"
        suffix="%"
      />
    </div>

    <div className="flex flex-col">
      <label className="font-semibold text-gray-700 text-sm mb-2 text-blue-600">
        Loan Collection Percentage (%)
      </label>
      <Input
        type="number"
        placeholder="Enter %"
        value={formData.loan_perc}
        onChange={(e) => setFormData(prev => ({ ...prev, loan_perc: e.target.value }))}
        className="h-11 font-bold text-lg"
        suffix="%"
      />
    </div>
  </div>
  <p className="mt-4 text-xs text-gray-400 italic">* Values will be fetched when you press the main "Continue" button below.</p>
</div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    type="primary"
                    onClick={handleCalculateSalary}
                    size="large"
                    className="px-8"
                    loading={calculateLoading}
                    disabled={
                      !formData.employee_id || !formData.month || !formData.year
                    }
                    style={{
                      backgroundColor: "#16a34a",
                    }}>
                    Continue
                  </Button>
                </div>

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
                          {numberToIndianWords(calculatedSalary.paid_days || 0)}
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
                          {numberToIndianWords(calculatedSalary.lop_days || 0)}
                        </span>
                      </div>

                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LOP
                        </label>
                        <input
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                          value={(calculatedSalary.lop || 0).toFixed(2)}
                          disabled
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(calculatedSalary.lop_days || 0)}
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
                          value={calculatedSalary.calculated_salary.toFixed(2)}
                          disabled
                        />
                        <span className="ml-2 font-medium font-mono text-blue-600">
                          {numberToIndianWords(
                            calculatedSalary.calculated_salary.toFixed(2) || 0
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-xl text-gray-900">
                            Monthly Target & Incentive
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          {calculatedIncentive > 0 && (
                            <>
                              <Button
                                type="primary"
                                onClick={handlePayAsSalary}
                                className="bg-blue-600 hover:bg-blue-700">
                                Pay as Salary
                              </Button>
                              <Button
                                type="primary"
                                onClick={handlePayAsIncentive}
                                className="bg-purple-600 hover:bg-purple-700">
                                Pay as Incentive
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Monthly Target */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <label className="font-semibold text-gray-700 text-sm">
                              Current Month Target
                            </label>
                          </div>
                          <input
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            value={formData?.monthly_business_info?.target || 0}
                            disabled
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-gray-900 font-semibold bg-slate-50 focus:bg-white focus:border-blue-300 focus:outline-none transition-colors disabled:cursor-not-allowed"
                          />
                          <span className="mt-2 font-medium font-mono text-blue-600 text-sm">
                            {numberToIndianWords(
                              formData?.monthly_business_info?.target ?? 0
                            )}
                          </span>
                        </div>
                        {/* Remaining Target */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                            <label className="font-semibold text-gray-700 text-sm">
                              Previous Remaining Target
                            </label>
                          </div>
                          <input
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            value={
                              formData?.monthly_business_info
                                ?.previous_remaining_target || 0
                            }
                            disabled
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-gray-900 font-semibold bg-slate-50 focus:bg-white focus:border-amber-300 focus:outline-none transition-colors disabled:cursor-not-allowed"
                          />
                          <span className="mt-2 font-medium font-mono text-amber-600 text-sm">
                            {numberToIndianWords(
                              formData?.monthly_business_info
                                ?.previous_remaining_target ?? 0
                            )}
                          </span>
                        </div>
                        {/* Total Target */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-purple-600" />
                            <label className="font-semibold text-gray-700 text-sm">
                              Total Target
                            </label>
                          </div>
                          <input
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            value={
                              formData?.monthly_business_info?.total_target || 0
                            }
                            disabled
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-gray-900 font-semibold bg-slate-50 focus:bg-white focus:border-purple-300 focus:outline-none transition-colors disabled:cursor-not-allowed"
                          />
                          <span className="mt-2 font-medium font-mono text-purple-600 text-sm">
                            {numberToIndianWords(
                              formData?.monthly_business_info?.total_target ?? 0
                            )}
                          </span>
                        </div>
                        {/* Total Business Closed */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <label className="font-semibold text-gray-700 text-sm">
                              Total Business Closed (Current Month)
                            </label>
                          </div>
                          <input
                            type="number"
                            value={
                              formData?.monthly_business_info
                                ?.total_business_closed ?? 0
                            }
                            readOnly
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-gray-900 font-semibold bg-emerald-50 cursor-not-allowed"
                          />
                          <span className="mt-2 font-medium font-mono text-emerald-600 text-sm">
                            {numberToIndianWords(
                              formData?.monthly_business_info
                                ?.total_business_closed || 0
                            )}
                          </span>
                        </div>
                      </div>

                      {/* === Target Achievement Badge === */}
                      <div className="mt-4 flex justify-start">
                        {(() => {
                          const totalTarget = Number(
                            formData.monthly_business_info.total_target || 0
                          );
                          const totalBusinessClosed = Number(
                            formData.monthly_business_info
                              .total_business_closed || 0
                          );
                          const variance = totalBusinessClosed - totalTarget;

                          // Configuration for different status states
                          const statusConfig = {
                            exceeded: {
                              icon: (
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                              ),
                              container:
                                "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100/50",
                              label: `Target Exceeded by ₹${variance.toLocaleString(
                                "en-IN"
                              )}`,
                            },
                            achieved: {
                              icon: (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ),
                              container:
                                "bg-green-50 text-green-700 border-green-200 shadow-sm shadow-blue-100/50",
                              label: "Target Achieved",
                            },
                            shortfall: {
                              icon: (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              ),
                              container:
                                "bg-red-50 text-red-700 border-red-200 shadow-sm shadow-red-100/50",
                              label: `Target Shortfall: ₹${Math.abs(
                                variance
                              ).toLocaleString("en-IN")}`,
                            },
                          };

                          let currentStatus = statusConfig.shortfall;
                          if (variance > 0)
                            currentStatus = statusConfig.exceeded;
                          else if (variance === 0)
                            currentStatus = statusConfig.achieved;

                          return (
                            <div
                              className={`
        inline-flex items-center gap-2.5 px-4 py-1.5 
        rounded-xl border font-bold text-xs tracking-tight
        transition-all duration-300 ease-in-out
        ${currentStatus.container}
      `}>
                              <div className="flex items-center justify-center">
                                {currentStatus.icon}
                              </div>
                              <span className="uppercase">
                                {currentStatus.label}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
                {/* Incentive Adjustment Display */}

                {showComponents && (
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
                {showComponents && (
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
                    {formData.additional_deductions.map((deduction, index) => (
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
                    ))}
                  </div>
                )}
                {calculatedSalary && showComponents && (
  <div className="bg-blue-50 p-6 rounded-xl mt-4 border border-blue-100 shadow-inner">
    <h3 className="text-lg font-semibold text-blue-800 mb-6 flex items-center gap-2">
      <RiMoneyRupeeCircleFill /> Final Transaction Adjustments
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* Target Incentive (Read Only) */}
      <div className="form-group">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Target Incentive</label>
        <Input 
          value={formData.calculated_incentive} 
          disabled 
          prefix="₹"
          className="font-bold !text-blue-600 !bg-white"
        />
      </div>

      {/* Pigmy Collection Incentive (Editable) */}
      <div className="form-group">
        <label className="block text-xs font-bold text-blue-500 uppercase mb-2 tracking-wider">Pigmy Incentive (Edit)</label>
        <Input 
          type="number"
          value={formData.pigmy_collection_incentive} 
          onChange={(e) => setFormData(prev => ({ ...prev, pigmy_collection_incentive: Number(e.target.value) }))}
          prefix="₹"
          className="font-bold border-blue-300 bg-white hover:border-blue-500"
        />
      </div>

      {/* Loan Collection Incentive (Editable) */}
      <div className="form-group">
        <label className="block text-xs font-bold text-blue-500 uppercase mb-2 tracking-wider">Loan Incentive (Edit)</label>
        <Input 
          type="number"
          value={formData.loan_collection_incentive} 
          onChange={(e) => setFormData(prev => ({ ...prev, loan_collection_incentive: Number(e.target.value) }))}
          prefix="₹"
          className="font-bold border-blue-300 bg-white hover:border-blue-500"
        />
      </div>

      {/* Final Net Payable (Total Sum) */}
      <div className="form-group">
        <label className="block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wider">Final Net Payable</label>
        {(() => {
          const basePay = Number(formData.total_salary_payable || 0);
          const total = basePay + 
                        Number(formData.calculated_incentive || 0) + 
                        Number(formData.pigmy_collection_incentive || 0) + 
                        Number(formData.loan_collection_incentive || 0);
          return (
            <div className="flex flex-col">
              <Input 
                value={total.toFixed(2)} 
                disabled 
                prefix="₹" 
                className="font-black !text-gray-900 !bg-gray-200 border-none text-lg h-10"
              />
              <span className="text-[10px] text-gray-500 mt-1 font-mono uppercase">
                {numberToIndianWords(total.toFixed(2))}
              </span>
            </div>
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

      {/* Pay as Salary Confirmation Modal */}
      <Modal
        title="Confirm Pay as Salary"
        open={payAsSalaryModalOpen}
        onCancel={() => setPayAsSalaryModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setPayAsSalaryModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" onClick={confirmPayAsSalary}>
            Confirm
          </Button>,
        ]}>
        <p className="text-lg font-medium mb-4">
          Are you sure you want to add the incentive amount as salary?
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">Incentive Amount:</span>
            <span className="font-bold text-blue-700 text-lg">
              ₹{Number(calculatedIncentive).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">
              This amount will be added to the salary payable
            </span>
          </div>
        </div>
      </Modal>

      {/* Pay as Incentive Confirmation Modal */}
      <Modal
        title="Confirm Pay as Incentive"
        open={payAsIncentiveModalOpen}
        onCancel={() => setPayAsIncentiveModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setPayAsIncentiveModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" onClick={confirmPayAsIncentive}>
            Confirm
          </Button>,
        ]}>
        <p className="text-lg font-medium mb-4">
          Are you sure you want to add the incentive amount as incentive
          payable?
        </p>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">Incentive Amount:</span>
            <span className="font-bold text-purple-700 text-lg">
              ₹{Number(calculatedIncentive).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">
              This amount will be added to the incentive payable
            </span>
          </div>
        </div>
      </Modal>

      <Drawer
        title="View Salary Details"
        width={"80%"}
        className="payment-drawer"
        open={isOpenUpdateModal}
        onClose={() => setIsOpenUpdateModal(false)}
        closable={true}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setIsOpenUpdateModal(false)}>Close</Button>
          </div>
        }>
        <div className="space-y-6">
          {/* Employee Info */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee
            </label>
            <Input
              value={
                employees.find((e) => e.value === updateFormData.employee_id)
                  ?.label || "—"
              }
              readOnly
              className="!bg-gray-100 !text-gray-800 !cursor-default"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <Input
                value={updateFormData.month || "—"}
                readOnly
                className="!bg-gray-100 !text-gray-800 !cursor-default"
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <Input
                value={
                  dayjs.isDayjs(updateFormData.year)
                    ? updateFormData.year.format("YYYY")
                    : updateFormData.year || "—"
                }
                readOnly
                className="!bg-gray-100 !text-gray-800 !cursor-default"
              />
            </div>
          </div>
          {/* Earnings */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              Earnings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(updateFormData.earnings || {}).map(
                ([key, value]) => (
                  <div key={key} className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                    <Input
                      value={Number(value || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      readOnly
                      className="!bg-gray-100 !text-gray-800 !cursor-default"
                    />
                  </div>
                )
              )}
            </div>
          </div>
          {/* Deductions */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-4">
              Deductions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(updateFormData.deductions || {}).map(
                ([key, value]) => (
                  <div key={key} className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                    <Input
                      value={Number(value || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      readOnly
                      className="!bg-gray-100 !text-gray-800 !cursor-default"
                    />
                  </div>
                )
              )}
            </div>
            <div className="form-group mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Deductions
              </label>
              <Input
                value={updateTotalDeductions.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                readOnly
                className="!bg-gray-100 !text-gray-800 !cursor-default font-semibold"
              />
            </div>
          </div>
          {/* Monthly Business Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              Monthly Business Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target
                </label>
                <Input
                  value={Number(
                    updateFormData.monthly_business_info?.target || 0
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                  readOnly
                  className="!bg-gray-100 !text-gray-800 !cursor-default"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Business Closed
                </label>
                <Input
                  value={Number(
                    updateFormData.monthly_business_info
                      ?.total_business_closed || 0
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                  readOnly
                  className="!bg-gray-100 !text-gray-800 !cursor-default"
                />
              </div>
            </div>
          </div>
          {/* Incentive */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              Calculated Incentive
            </h3>
            <Input
              value={Number(
                updateFormData.calculated_incentive || 0
              ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
              readOnly
              className="!bg-gray-100 !text-gray-800 !cursor-default font-semibold text-lg"
            />
          </div>
          {/* Advance Payments */}
          {updateFormData.advance_payments?.length > 0 && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-800 mb-4">
                Advance Payments
              </h3>
              {updateFormData.advance_payments.map((pay, i) => (
                <div key={i} className="flex gap-4 mb-2">
                  <Input
                    value={pay.name || "Advance"}
                    readOnly
                    className="!bg-gray-100 !text-gray-800 !cursor-default flex-1"
                  />
                  <Input
                    value={`₹${Number(pay.value).toLocaleString("en-IN")}`}
                    readOnly
                    className="!bg-gray-100 !text-gray-800 !cursor-default w-40 text-right"
                  />
                </div>
              ))}
            </div>
          )}
          {/* Additional Payments */}
          {updateFormData.additional_payments?.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">
                Additional Payments
              </h3>
              {updateFormData.additional_payments.map((pay, i) => (
                <div key={i} className="flex gap-4 mb-2">
                  <Input
                    value={pay.name || "Payment"}
                    readOnly
                    className="!bg-gray-100 !text-gray-800 !cursor-default flex-1"
                  />
                  <Input
                    value={`₹${Number(pay.value).toLocaleString("en-IN")}`}
                    readOnly
                    className="!bg-gray-100 !text-gray-800 !cursor-default w-40 text-right"
                  />
                </div>
              ))}
            </div>
          )}
          {/* Additional Deductions */}
          {updateFormData.additional_deductions?.length > 0 && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">
                Additional Deductions
              </h3>
              {updateFormData.additional_deductions.map((ded, i) => (
                <div key={i} className="flex gap-4 mb-2">
                  <Input
                    value={ded.name || "Deduction"}
                    readOnly
                    className="!bg-gray-100 !text-gray-800 !cursor-default flex-1"
                  />
                  <Input
                    value={`₹${Number(ded.value).toLocaleString("en-IN")}`}
                    readOnly
                    className="!bg-gray-100 !text-gray-800 !cursor-default w-40 text-right"
                  />
                </div>
              ))}
            </div>
          )}
          {/* Total Payable */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Total Salary Payable
            </h3>
            <Input
              value={Number(
                updateFormData.total_salary_payable || 0
              ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
              readOnly
              className="!bg-gray-100 !text-gray-800 !cursor-default font-bold text-xl"
            />
          </div>
          {/* Payment Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid Amount
                </label>
                <Input
                  value={Number(updateFormData.paid_amount || 0).toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                  readOnly
                  className="!bg-gray-100 !text-gray-800 !cursor-default"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <Input
                  value={updateFormData?.payment_method || "N/A"}
                  readOnly
                  className="!bg-gray-100 !text-gray-800 !cursor-default"
                />
              </div>
              {updateFormData.transaction_id && (
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID
                  </label>
                  <Input
                    value={updateFormData.transaction_id}
                    readOnly
                    className="!bg-gray-100 !text-gray-800 !cursor-default font-mono"
                  />
                </div>
              )}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Input
                  value={updateFormData.status}
                  readOnly
                  className="!bg-gray-100 !text-gray-800 !cursor-default"
                />
              </div>
            </div>
          </div>
        </div>
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
            {/* Added 'flex flex-col' so that 'gap-4' actually works */}
            <section className="flex flex-col gap-4 bg-gradient-to-br from-purple-50 to-purple-50 p-6 rounded-xl shadow-md border border-purple-200 hover:shadow-lg transition-shadow">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center text-lg">
                <span className="w-1 h-6 bg-purple-600 rounded-full mr-3"></span>
                Attendance Details
              </h4>

              {Object.entries(
                existingSalaryRecord.attendance_details || {}
              ).map(([key, val]) => {
                const isCurrency =
                  key.includes("salary") || key.includes("calculated");
                const isDate = key.includes("date");

                let displayValue;
                if (isDate) {
                  // Improved dayjs safety check
                  displayValue = val ? dayjs(val).format("YYYY-MM-DD") : "N/A";
                } else if (isCurrency) {
                  displayValue = `₹${Number(val).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`;
                } else {
                  displayValue = val;
                }

                return (
                  <div // Changed to div for semantic correctness since we aren't using a <ul> wrapper
                    key={key}
                    className="flex justify-between items-center bg-white p-4 rounded-lg border border-purple-100 hover:border-purple-200 transition-colors">
                    <span className="capitalize text-slate-700 font-medium">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`font-bold ${
                        isCurrency ? "text-purple-700" : "text-slate-600"
                      }`}>
                      {displayValue}
                    </span>
                  </div>
                );
              })}
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
                {Object.entries(
                  existingSalaryRecord.monthly_business_info || {}
                ).map(([key, val]) => (
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
                ))}
              </ul>
            </section>
            {/* Advance Payments */}
            {existingSalaryRecord.advance_payments?.length > 0 && (
              <section className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl shadow-md border border-blue-200 hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
                  <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                  Advance Payments
                </h4>
                <ul className="space-y-2">
                  {existingSalaryRecord.advance_payments.map((pay, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-white p-4 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                      <span className="text-slate-700 font-medium">
                        {pay.name || "Advance Payment"}
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
                  {existingSalaryRecord.additional_deductions.map((ded, i) => (
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
                  ))}
                </ul>
              </section>
            )}
            {/* Incentive Adjustment */}
            {existingSalaryRecord.calculated_incentive !== 0 && (
              <section className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl shadow-md border border-amber-200 hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center text-lg">
                  <span className="w-1 h-6 bg-amber-600 rounded-full mr-3"></span>
                  Incentive Adjustment
                </h4>
                <div className="bg-white p-4 rounded-lg border border-amber-100 hover:border-amber-200 transition-colors">
                  <span className="text-slate-700 font-medium">
                    Calculated Incentive:
                  </span>
                  <span
                    className={`font-bold ml-2 ${
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
                      existingSalaryRecord?.attendance_details
                        ?.calculated_salary
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {existingSalaryRecord.advance_payments?.length > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-700 font-medium">
                      Advance Payments:
                    </span>
                    <span className="text-green-700 font-semibold text-lg">
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
                {existingSalaryRecord.additional_deductions?.length > 0 && (
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
                {existingSalaryRecord.calculated_incentive !== 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-700 font-medium">
                      Incentive Adjustment:
                    </span>
                    <span
                      className={`font-semibold text-lg ${
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
                        ? ""
                        : " (Deduction)"}
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
                    {existingSalaryRecord.payment_method || "N/A"}
                  </span>
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
  );
};

export default HRSalaryManagement;

