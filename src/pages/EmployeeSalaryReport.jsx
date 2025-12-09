import React,{ useState, useEffect, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import CustomAlert from "../components/alerts/CustomAlert";
import moment from "moment";
import { Select, DatePicker, Spin } from "antd";
const { MonthPicker } = DatePicker;
const { Option } = Select;

// const EmployeeSalaryReport = () => {
//   const [allEmployeeSalary, setAllEmployeeSalary] = useState([]);
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [allSalaryTable, setAllSalaryTable] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [selectedMonthYear, setSelectedMonthYear] = useState(null);

//   useEffect(() => {
//     const fetchEmployee = async () => {
//       try {
//         const response = await api.get("/agent/get-employee");
//         setAllEmployees(response?.data?.employee || []);
        
//       } catch (error) {
//         console.error("unable to fetch employee")
//       }
//     }
//     fetchEmployee();
//   },[]);

//   useEffect(() => {
//     const fetchEmployeeAllSalaries = async () => {
//       try {
//         setIsLoading(true);
//         const response = await api.get("/salary-payment/all");
//         console.info(response?.data, "fgjhdsafgjhfdggdf");
//         setAllEmployeeSalary(response?.data?.data);
//         const formattedData = response?.data?.data?.map((salary, index) => ({
//           _id: salary?._id,
//           slNo: index + 1,
//           employeeCode: salary?.employee_id?.employeeCode || "N/A",
//           employeeName: salary?.employee_id?.name || "N/A",
//           employeePhone: salary?.employee_id?.phone_number || "N/A",
//           salaryMonth: salary?.salary_month || "N/A",
//           salaryYear: salary?.salary_year || "N/A",
//           totalSalaryPayable: salary?.total_salary_payable || "N/A",
//           netPayable: salary?.net_payable || "N/A",
//           paidAmount: salary?.paid_amount || "N/A",
//           remainingBalance: salary?.remaining_balance || "N/A",
//           paidDays: salary?.paid_days || "N/A",
//           paidDate: salary?.pay_date?.split("T")[0] || "N/A",
//           addPayments:
          //   salary?.additional_payments
          //     .map((ele) => `${ele?.name} : ${ele?.value}`)
          //     .join("|") || "N/A",
          // //    addPayments: salary?.additional_payments.reduce((acc, curr) => acc + curr.value, 0),
          // dedPayments:
          //   salary?.additional_deductions
          //     .map((ele) => `${ele?.name}:${ele?.value}`)
          //     .join("|") || "N/A",
//           // dedPayments: salary?.additional_deductions.reduce((acc, curr) => acc + curr.value,0),

//           earningBasic: salary?.earnings?.basic || "N/A",
//           earningHra: salary?.earnings?.hra || "N/A",
//           earningTravelAllowance: salary?.earnings?.travel_allowance || "N/A",
//           earningMedicalAllowance: salary?.earnings?.medical_allowance || "N/A",
//           earningBenifits: salary?.earnings?.basket_of_benifits || "N/A",
//           earningBonus: salary?.earnings?.performance_bonus || "N/A",
//           earningOthers: salary?.earnings?.other_allowances || "N/A",
//           earningConveyance: salary?.earnings?.conveyance || "N/A",
//           deductIT: salary?.deductions?.income_tax || "N/A",
//           deductESI: salary?.deductions?.esi || "N/A",
//           deductEPF: salary?.deductions?.epf || "N/A",
//           deductPT: salary?.deductions?.professional_tax || "N/A",
//           deductSalaryAdvance: salary?.deductions?.salary_advance || "N/A",
//           salaryPaymentMethod: salary?.payment_method || "N/A",
//           status: salary?.status || "N/A",
//         }));
//         console.info(formattedData, "hfghjdfghdgfgf");
//         setAllSalaryTable(formattedData);
//       } catch (error) {
//         console.error("unable to fetch Employee Salary Payment");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchEmployeeAllSalaries();
//   }, []);

//   useEffect(() => {
// const fetchAllEmployeeData = async () => {
//   try {
//     setIsLoading(true);
//     let query = [];
//     if(selectedEmployee) {
//       query.push(`employee_id=${selectedEmployee}`);
//     }
//     if(selectedMonthYear) {
//       query.push(`month=${selectedMonthYear.month}`);
//       query.push(`year=${selectedMonthYear.year}`);
//     }
    
//     const res = await api.get(`/salary-payment/report?${query.join("&")}`)

//     setAllSalaryTable(res?.data?.data || []);
    
//   } catch (error) {
//     console.error("unable to fetch Employees all Data")
//   }finally{
//     setIsLoading(false);
//   }
// }
// fetchAllEmployeeData();
//   },[selectedEmployee,selectedMonthYear])

// const handleMonthPick = (value) => {
//   if(!value) return setSelectedMonthYear(null);

//   const monthIndex = value.month();
//   const year = value.year();

//   const monthNames = [
// "January",
//       "February",
//       "March",
//       "April",
//       "May",
//       "June",
//       "July",
//       "August",
//       "September",
//       "October",
//       "November",
//       "December",
//   ];
//   const monthName = monthNames[monthIndex];
//   setSelectedMonthYear({
//     month: monthName,
//     year,
//   });
// };

// const handleReset = () => {
//   setSelectedEmployee(null);
//   setSelectedMonthYear(null);


// }

//     const columns = [
//     { key: "slNo", header: "SL. NO" },
//     { key: "employeeName", header: "Employee Name" },
//     { key: "employeeCode", header: "Employee Id" },
//      { key: "employeePhone", header: "Phone Number" },
//     { key: "salaryMonth", header: "Salary Month" },
//     { key: "salaryYear", header: "Year" },
//     { key: "paidDate", header: "Pay Date" },
//     { key: "netPayable", header: "Net Payable" },
//     { key: "paidAmount", header: "Paid Amount" },
    
//   ];

//   const allColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "employeeCode", header: "Employee ID" },
//     { key: "employeeName", header: "Name" },
//     { key: "employeePhone", header: "Phone Number" },
//     { key: "salaryMonth", header: "Month" },
//     { key: "salaryYear", header: "Year" },
//     { key: "totalSalaryPayable", header: "Total Salary Payable" },
//     { key: "netPayable", header: "Net Payable" },
//     { key: "paidAmount", header: "Paid Amount" },
//     { key: "remainingBalance", header: "Remaining Balance" },
//     { key: "paidDays", header: "Paid Days" },
//     { key: "paidDate", header: "Paid Date" },
//     { key: "addPayments", header: "Additional Payments" },
//     { key: "dedPayments", header: "Deduction Payments" },
//     { key: "earningBasic", header: "Basic" },
//     { key: "earningHra", header: "HRA" },
//     { key: "earningTravelAllowance", header: "Travel Allowance" },
//     { key: "earningMedicalAllowance", header: "Medical Allowance" },
//     { key: "earningBenifits", header: "Performance Benifits" },
//     { key: "earningOthers", header: "Other Allowance" },
//     { key: "earningConveyance", header: "Conveyance" },
//     { key: "deductIT", header: "Income Tax" },
//     { key: "deductESI", header: "ESI" },
//     { key: "deductEPF", header: "EPF" },
//     { key: "deductPT", header: "Professional Tax" },
//     { key: "deductSalaryAdvance", header: "SalaryAdvance" },
//     { key: "salaryPaymentMethod", header: "Payment Type" },
//     { key: "status", header: "Status" },
//   ];

//   return (
//     <div className="w-screen">
//       <div>
//         <Navbar />
//         <div className="flex-grow p-7">
//           <h1 className="font-bold text-2xl mb-4">Reports - Salary Report</h1>
//           <div className="flex gap-4 mb-6 items-center">
//             <Select
//             allowClear
//             value={selectedEmployee}
//             style={{ width: 300 }}
//             placeholder= "Select Employee"
//             onChange={(value) => setSelectedEmployee(value)}
//             >
//                {allEmployees.map((emp) => (
//               <Option key={emp._id} value={emp._id}>
//                 {emp.name} | {emp.phone_number}
//               </Option>
//             ))}
//             </Select>
//             <MonthPicker
//             style={{ width: 250 }}
//             placeholder="Select Month"
//             onChange={handleMonthPick}
//             />
//              <button
//             onClick={handleReset}
//             className="px-4 py-2 bg-red-500 text-white rounded"
//           >
//             Reset
//           </button>
      
//           </div>
//           {isLoading ? (
//             <div className="flex justify-center py-10">
//             <Spin size="large"/>  
//             </div>
//           ):(
//           <DataTable
//             columns={columns}
//             data={allSalaryTable}
//             exportCols={allColumns}
//                 isExportEnabled={true}
//             exportedPdfName="Employee Salary Payment Report"
//             exportedFileName="EmployeeSalaryReport.csv"
//           />)}
//         </div>
//       </div>
//     </div>
//   );
// };



// const EmployeeSalaryReport = () => { 
//   const [allEmployeeSalary, setAllEmployeeSalary] = useState([]);
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [allSalaryTable, setAllSalaryTable] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [selectedMonthYear, setSelectedMonthYear] = useState(null);

//   // Fetch all employees when the component mounts
//   useEffect(() => {
//     const fetchEmployee = async () => {
//       try {
//         const response = await api.get("/agent/get-employee");
//         setAllEmployees(response?.data?.employee || []); // Set the employee list
//       } catch (error) {
//         console.error("unable to fetch employee");
//       }
//     }
//     fetchEmployee();
//   },[]);

//   // Fetch all salary data on component mount to populate the table
//   useEffect(() => {
//     const fetchEmployeeAllSalaries = async () => {
//       try {
//         setIsLoading(true);
//         const response = await api.get("/salary-payment/all");
//         const formattedData = response?.data?.data?.map((salary, index) => ({
//           // Format the salary data to display it on the table
//           _id: salary?._id,
//           slNo: index + 1,
//           employeeCode: salary?.employee_id?.employeeCode || "N/A",
//           employeeName: salary?.employee_id?.name || "N/A",
//           employeePhone: salary?.employee_id?.phone_number || "N/A",
//           salaryMonth: salary?.salary_month || "N/A",
//           salaryYear: salary?.salary_year || "N/A",
//           totalSalaryPayable: salary?.total_salary_payable || "N/A",
//           netPayable: salary?.net_payable || "N/A",
//           paidAmount: salary?.paid_amount || "N/A",
//           remainingBalance: salary?.remaining_balance || "N/A",
//           paidDays: salary?.paid_days || "N/A",
//           paidDate: salary?.pay_date?.split("T")[0] || "N/A",
//         }));
//         setAllSalaryTable(formattedData); // Set the formatted salary data
//       } catch (error) {
//         console.error("unable to fetch Employee Salary Payment");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchEmployeeAllSalaries();
//   }, []);

//   // Fetch filtered salary data based on selected employee and month/year
//   useEffect(() => {
//     const fetchAllEmployeeData = async () => {
//       try {
//         setIsLoading(true);
//         let query = [];

//         // Build the query string based on selected filters (employee and month/year)
//         if (selectedEmployee) {
//           query.push(`employee_id=${selectedEmployee}`);
//         }
//         if (selectedMonthYear) {
//           query.push(`month=${selectedMonthYear.month}`);
//           query.push(`year=${selectedMonthYear.year}`);
//         }

//         const url = `/salary-payment/report?${query.join("&")}`; // Construct the query URL
//         const res = await api.get(url);

//         setAllSalaryTable(res?.data?.data || []); // Set filtered salary data based on the query
//       } catch (error) {
//         console.error("unable to fetch filtered employee data");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAllEmployeeData(); // Fetch data whenever the filters change
//   }, [selectedEmployee, selectedMonthYear]);

//   // Handle month and year selection
//   const handleMonthPick = (value) => {
//     if (!value) return setSelectedMonthYear(null); // If no month is selected, clear the filter

//     const monthIndex = value.month();
//     const year = value.year();

//     const monthNames = [
//       "January", "February", "March", "April", "May", "June", "July", "August", 
//       "September", "October", "November", "December"
//     ];
//     const monthName = monthNames[monthIndex]; // Get the full month name
//     setSelectedMonthYear({
//       month: monthName,
//       year,
//     });
//   };

//   // Reset the filters (selected employee and month/year)
//   const handleReset = () => {
//     setSelectedEmployee(null);
//     setSelectedMonthYear(null); // Clear both the employee and month/year filters
//   }

//   const columns = [
//     { key: "slNo", header: "SL. NO" },
//     { key: "employeeName", header: "Employee Name" },
//     { key: "employeeCode", header: "Employee Id" },
//     { key: "employeePhone", header: "Phone Number" },
//     { key: "salaryMonth", header: "Salary Month" },
//     { key: "salaryYear", header: "Year" },
//     { key: "paidDate", header: "Pay Date" },
//     { key: "netPayable", header: "Net Payable" },
//     { key: "paidAmount", header: "Paid Amount" },
//   ];

//   const allColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "employeeCode", header: "Employee ID" },
//     { key: "employeeName", header: "Name" },
//     { key: "employeePhone", header: "Phone Number" },
//     { key: "salaryMonth", header: "Month" },
//     { key: "salaryYear", header: "Year" },
//     { key: "totalSalaryPayable", header: "Total Salary Payable" },
//     { key: "netPayable", header: "Net Payable" },
//     { key: "paidAmount", header: "Paid Amount" },
//     { key: "remainingBalance", header: "Remaining Balance" },
//     { key: "paidDays", header: "Paid Days" },
//     { key: "paidDate", header: "Paid Date" },
//     { key: "addPayments", header: "Additional Payments" },
//     { key: "dedPayments", header: "Deduction Payments" },
//     { key: "earningBasic", header: "Basic" },
//     { key: "earningHra", header: "HRA" },
//     { key: "earningTravelAllowance", header: "Travel Allowance" },
//     { key: "earningMedicalAllowance", header: "Medical Allowance" },
//     { key: "earningBenifits", header: "Performance Benifits" },
//     { key: "earningOthers", header: "Other Allowance" },
//     { key: "earningConveyance", header: "Conveyance" },
//     { key: "deductIT", header: "Income Tax" },
//     { key: "deductESI", header: "ESI" },
//     { key: "deductEPF", header: "EPF" },
//     { key: "deductPT", header: "Professional Tax" },
//     { key: "deductSalaryAdvance", header: "SalaryAdvance" },
//     { key: "salaryPaymentMethod", header: "Payment Type" },
//     { key: "status", header: "Status" },
//   ];

//   return (
//     <div className="w-screen">
//       <div>
//         <Navbar />
//         <div className="flex-grow p-7">
//           <h1 className="font-bold text-2xl mb-4">Reports - Salary Report</h1>
//           <div className="flex gap-4 mb-6 items-center">
//             <Select
//               allowClear
//               value={selectedEmployee}
//               style={{ width: 300 }}
//               placeholder="Select Employee"
//               onChange={(value) => setSelectedEmployee(value)} // Set selected employee
//             >
//               {allEmployees.map((emp) => (
//                 <Option key={emp._id} value={emp._id}>
//                   {emp.name} | {emp.phone_number}
//                 </Option>
//               ))}
//             </Select>
//             <MonthPicker
//               style={{ width: 250 }}
//               placeholder="Select Month"
//               onChange={handleMonthPick} // Set selected month/year
//             />
//             <button
//               onClick={handleReset} // Reset the filters
//               className="px-4 py-2 bg-red-500 text-white rounded"
//             >
//               Reset
//             </button>
//           </div>

//           {isLoading ? (
//             <div className="flex justify-center py-10">
//               <Spin size="large" />  
//             </div>
//           ) : (
//             <DataTable
//               columns={columns}
//               data={allSalaryTable}
//               exportCols={allColumns}
//               isExportEnabled={true}
//               exportedPdfName="Employee Salary Payment Report"
//               exportedFileName="EmployeeSalaryReport.csv"
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };


// const EmployeeSalaryReport = () => {
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [selectedMonthYear, setSelectedMonthYear] = useState(null);

//   const [allSalaryTable, setAllSalaryTable] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

 
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await api.get("/agent/get-employee");
//         setAllEmployees(res?.data?.employee || []);
//       } catch (err) {
//         console.error("Unable to fetch employees");
//       }
//     };
//     fetchEmployees();
//   }, []);

 
//   const formatTableData = (data) => {
//     return data.map((salary, index) => ({
//       _id: salary?._id,
//       slNo: index + 1,
//       employeeCode: salary?.employee_id?.employeeCode || "N/A",
//       employeeName: salary?.employee_id?.name || "N/A",
//       employeePhone: salary?.employee_id?.phone_number || "N/A",
//       salaryMonth: salary?.salary_month || "N/A",
//       salaryYear: salary?.salary_year || "N/A",
//       netPayable: salary?.net_payable || "N/A",
//       paidAmount: salary?.paid_amount || "N/A",
//       paidDate: salary?.pay_date?.split("T")[0] || "N/A",
//     }));
//   };

 
//   const fetchFilteredSalary = async () => {
//     try {
//       setIsLoading(true);

//       let query = [];

//       if (selectedEmployee) {
//         query.push(`employee_id=${selectedEmployee}`);
//       }

//       if (selectedMonthYear) {
//         query.push(`month=${selectedMonthYear.month}`);
//         query.push(`year=${selectedMonthYear.year}`);
//       }

//       const url = `/salary-payment/report?${query.join("&")}`;

//       const res = await api.get(url);
//       setAllSalaryTable(formatTableData(res.data.data));
//     } catch (err) {
//       console.error("Error filtering salary", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchFilteredSalary();
//   }, [selectedEmployee, selectedMonthYear]);

 
//   const handleMonthPick = (value) => {
//     if (!value) return setSelectedMonthYear(null);

//     const monthIndex = value.month(); // 0 = January
//     const year = value.year();

//     const monthNames = [
//       "January",
//       "February",
//       "March",
//       "April",
//       "May",
//       "June",
//       "July",
//       "August",
//       "September",
//       "October",
//       "November",
//       "December",
//     ];

//     const monthName = monthNames[monthIndex];

//     setSelectedMonthYear({
//       month: monthName,
//       year,
//     });
//   };

 
//   const handleReset = () => {
//     setSelectedEmployee(null);
//     setSelectedMonthYear(null);
//     fetchFilteredSalary();
//   };

 
//   const columns = [
//     { key: "slNo", header: "SL. NO" },
//     { key: "employeeName", header: "Employee Name" },
//     { key: "employeeCode", header: "Employee ID" },
//     { key: "employeePhone", header: "Phone" },
//     { key: "salaryMonth", header: "Month" },
//     { key: "salaryYear", header: "Year" },
//     { key: "paidDate", header: "Pay Date" },
//     { key: "netPayable", header: "Net Payable" },
//     { key: "paidAmount", header: "Paid Amount" },
//   ];

  // const allColumns = [
  //   { key: "slNo", header: "Sl No" },
  //   { key: "employeeCode", header: "Employee ID" },
  //   { key: "employeeName", header: "Name" },
  //   { key: "employeePhone", header: "Phone Number" },
  //   { key: "salaryMonth", header: "Month" },
  //   { key: "salaryYear", header: "Year" },
  //   { key: "totalSalaryPayable", header: "Total Salary Payable" },
  //   { key: "netPayable", header: "Net Payable" },
  //   { key: "paidAmount", header: "Paid Amount" },
  //   { key: "remainingBalance", header: "Remaining Balance" },
  //   { key: "paidDays", header: "Paid Days" },
  //   { key: "paidDate", header: "Paid Date" },
  //   { key: "addPayments", header: "Additional Payments" },
  //   { key: "dedPayments", header: "Deduction Payments" },
  //   { key: "earningBasic", header: "Basic" },
  //   { key: "earningHra", header: "HRA" },
  //   { key: "earningTravelAllowance", header: "Travel Allowance" },
  //   { key: "earningMedicalAllowance", header: "Medical Allowance" },
  //   { key: "earningBenifits", header: "Performance Benifits" },
  //   { key: "earningOthers", header: "Other Allowance" },
  //   { key: "earningConveyance", header: "Conveyance" },
  //   { key: "deductIT", header: "Income Tax" },
  //   { key: "deductESI", header: "ESI" },
  //   { key: "deductEPF", header: "EPF" },
  //   { key: "deductPT", header: "Professional Tax" },
  //   { key: "deductSalaryAdvance", header: "SalaryAdvance" },
  //   { key: "salaryPaymentMethod", header: "Payment Type" },
  //   { key: "status", header: "Status" },
  // ];

//   return (
//     <div className="w-screen">
//       <Navbar />
//       <div className="p-7">
//         <h1 className="font-bold text-2xl mb-4">Reports - Salary Report</h1>

//         <div className="flex gap-4 mb-6 items-center">
//           <Select
//             allowClear
//             style={{ width: 250 }}
//             placeholder="Select Employee"
//             value={selectedEmployee}
//             onChange={(value) => setSelectedEmployee(value)}
//           >
//             {allEmployees.map((emp) => (
//               <Option key={emp._id} value={emp._id}>
//                 {emp.name} | {emp.phone_number}
//               </Option>
//             ))}
//           </Select>

         
//           <MonthPicker
//             style={{ width: 200 }}
//             placeholder="Select Month"
//             onChange={handleMonthPick}
//           />

//           <button
//             onClick={handleReset}
//             className="px-4 py-2 bg-blue-500 text-white rounded"
//           >
//             Reset
//           </button>
//         </div>

//         {isLoading ? (
//           <div className="flex justify-center py-10">
//             <Spin size="large" />
//           </div>
//         ) : (
//           <DataTable
//             columns={columns}
//             data={allSalaryTable}
//             exportCols={allColumns}
//             isExportEnabled={true}
//             exportedPdfName="Employee Salary Payment Report"
//             exportedFileName="EmployeeSalaryReport.csv"
//           />
//         )}
//       </div>
//     </div>
//   );
// };


// const EmployeeSalaryReport = () => {
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [selectedMonthYear, setSelectedMonthYear] = useState(null);

//   const [allSalaryTable, setAllSalaryTable] = useState([]);
//   const [allEmployeeSalary, setAllEmployeeSalary] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await api.get("/agent/get-employee");
//         setAllEmployees(res?.data?.employee || []);
//       } catch (err) {
//         console.error("Unable to fetch employees");
//       }
//     };
//     fetchEmployees();
//   }, []);

//   const formatTableData = (data) => {
//     return data.map((s, index) => ({
//       _id: s?._id,
//       slNo: index + 1,
//       employeeCode: s?.employee_id?.employeeCode || "N/A",
//       employeeName: s?.employee_id?.name || "N/A",
//       employeePhone: s?.employee_id?.phone_number || "N/A",
//       salaryMonth: s?.salary_month || "N/A",
//       salaryYear: s?.salary_year || "N/A",

//       netPayable: s?.net_payable || 0,
//       paidAmount: s?.paid_amount || 0,
//       paidDate: s?.pay_date?.split("T")[0] || "N/A",

//       totalSalaryPayable: s?.total_salary_payable || 0,
//       remainingBalance: s?.remaining_balance || 0,
//       paidDays: s?.paid_days || 0,

//       addPayments: s?.add_payments || 0,
//       dedPayments: s?.ded_payments || 0,

//       earningBasic: s?.earnings?.basic || 0,
//       earningHra: s?.earnings?.hra || 0,
//       earningTravelAllowance: s?.earnings?.travel_allowance || 0,
//       earningMedicalAllowance: s?.earnings?.medical_allowance || 0,
//       earningBenifits: s?.earnings?.performance_benifits || 0,
//       earningOthers: s?.earnings?.others || 0,
//       earningConveyance: s?.earnings?.conveyance || 0,

//       deductIT: s?.deductions?.income_tax || 0,
//       deductESI: s?.deductions?.esi || 0,
//       deductEPF: s?.deductions?.epf || 0,
//       deductPT: s?.deductions?.professional_tax || 0,
//       deductSalaryAdvance: s?.deductions?.salary_advance || 0,

//       salaryPaymentMethod: s?.payment_type || "N/A",
//       status: s?.status || "N/A",
//     }));
//   };

//   const fetchFilteredSalary = async () => {
//     try {
//       setIsLoading(true);

//       let query = [];

//       if (selectedEmployee) {
//         query.push(`employee_id=${selectedEmployee}`);
//       }

//       if (selectedMonthYear) {
//         query.push(`month=${selectedMonthYear.month}`);
//         query.push(`year=${selectedMonthYear.year}`);
//       }

//       const url = `/salary-payment/report?${query.join("&")}`;

//       const res = await api.get(url);

//       const rows = formatTableData(res.data.data);
//       setAllSalaryTable(rows);
//       setAllEmployeeSalary(res.data.data || []);
//     } catch (err) {
//       console.error("Error filtering salary", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchFilteredSalary();
//   }, [selectedEmployee, selectedMonthYear]);

//   const handleMonthPick = (value) => {
//     if (!value) return setSelectedMonthYear(null);

//     const monthIndex = value.month();
//     const year = value.year();

//     const monthNames = [
//       "January","February","March","April","May","June",
//       "July","August","September","October","November","December",
//     ];

//     const monthName = monthNames[monthIndex];

//     setSelectedMonthYear({
//       month: monthName,
//       year,
//     });
//   };

//   const handleReset = () => {
//     setSelectedEmployee(null);
//     setSelectedMonthYear(null);
//     fetchFilteredSalary();
//   };

//   const columns = [
//     { key: "slNo", header: "SL. NO" },
//     { key: "employeeName", header: "Employee Name" },
//     { key: "employeeCode", header: "Employee ID" },
//     { key: "employeePhone", header: "Phone" },
//     { key: "salaryMonth", header: "Month" },
//     { key: "salaryYear", header: "Year" },
//     { key: "paidDate", header: "Pay Date" },
//     { key: "netPayable", header: "Net Payable" },
//     { key: "paidAmount", header: "Paid Amount" },
//   ];

//   const allColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "employeeCode", header: "Employee ID" },
//     { key: "employeeName", header: "Name" },
//     { key: "employeePhone", header: "Phone Number" },
//     { key: "salaryMonth", header: "Month" },
//     { key: "salaryYear", header: "Year" },
//     { key: "totalSalaryPayable", header: "Total Salary Payable" },
//     { key: "netPayable", header: "Net Payable" },
//     { key: "paidAmount", header: "Paid Amount" },
//     { key: "remainingBalance", header: "Remaining Balance" },
//     { key: "paidDays", header: "Paid Days" },
//     { key: "paidDate", header: "Paid Date" },
//     { key: "addPayments", header: "Additional Payments" },
//     { key: "dedPayments", header: "Deduction Payments" },
//     { key: "earningBasic", header: "Basic" },
//     { key: "earningHra", header: "HRA" },
//     { key: "earningTravelAllowance", header: "Travel Allowance" },
//     { key: "earningMedicalAllowance", header: "Medical Allowance" },
//     { key: "earningBenifits", header: "Performance Benifits" },
//     { key: "earningOthers", header: "Other Allowance" },
//     { key: "earningConveyance", header: "Conveyance" },
//     { key: "deductIT", header: "Income Tax" },
//     { key: "deductESI", header: "ESI" },
//     { key: "deductEPF", header: "EPF" },
//     { key: "deductPT", header: "Professional Tax" },
//     { key: "deductSalaryAdvance", header: "SalaryAdvance" },
//     { key: "salaryPaymentMethod", header: "Payment Type" },
//     { key: "status", header: "Status" },
//   ];

//   // ⬇️ TOTAL SUMMARY (your new code)
//   const totalSummary = React.useMemo(() => {
//     if (!allEmployeeSalary || allEmployeeSalary.length === 0) return {};

//     const sum = (fn) =>
//       allEmployeeSalary.reduce((acc, item) => acc + Number(fn(item) || 0), 0);

//     const count = allEmployeeSalary.length;

//     return {
//       totalSalaryPayable: sum((x) => x.total_salary_payable),
//       totalNetPayable: sum((x) => x.net_payable),
//       totalPaidAmount: sum((x) => x.paid_amount),
//       totalRemainingBalance: sum((x) => x.remaining_balance),
//       totalPaidDays: sum((x) => x.paid_days),
//       totalLopDays: sum((x) => x.lop_days),
//       totalAdditionalPayments: sum((x) =>
//         x.additional_payments?.reduce((a, b) => a + Number(b.value || 0), 0)
//       ),
//       totalAdditionalDeductions: sum((x) =>
//         x.additional_deductions?.reduce((a, b) => a + Number(b.value || 0), 0)
//       ),
//       count,
//     };
//   }, [allEmployeeSalary]);

//   return (
//     <div className="w-screen">
//       <Navbar />
//       <div className="p-7">
//         <h1 className="font-bold text-2xl mb-4">Reports - Salary Report</h1>

//         {/* Filters */}
//         <div className="flex gap-4 mb-6 items-center">
//           <Select
//             allowClear
//             style={{ width: 250 }}
//             placeholder="Select Employee"
//             value={selectedEmployee}
//             onChange={(value) => setSelectedEmployee(value)}
//           >
//             {allEmployees.map((emp) => (
//               <Option key={emp._id} value={emp._id}>
//                 {emp.name} | {emp.phone_number}
//               </Option>
//             ))}
//           </Select>

//           <MonthPicker
//             style={{ width: 200 }}
//             placeholder="Select Month"
//             onChange={handleMonthPick}
//           />

//           <button
//             onClick={handleReset}
//             className="px-4 py-2 bg-blue-500 text-white rounded"
//           >
//             Reset
//           </button>
//         </div>

//         {/* ⬇️ NEW SUMMARY BLOCK */}
//         <div className="p-4 mb-4 bg-gray-100 rounded-lg shadow">
//           <h2 className="font-bold text-lg mb-2">Salary Summary</h2>

//           <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
//             <div><strong>Total Records:</strong> {totalSummary.count}</div>
//             <div><strong>Total Salary Payable:</strong> ₹{totalSummary.totalSalaryPayable}</div>
//             <div><strong>Total Net Payable:</strong> ₹{totalSummary.totalNetPayable}</div>
//             <div><strong>Total Paid Amount:</strong> ₹{totalSummary.totalPaidAmount}</div>
//             <div><strong>Total Remaining Balance:</strong> ₹{totalSummary.totalRemainingBalance}</div>
//             <div><strong>Total Paid Days:</strong> {totalSummary.totalPaidDays}</div>
//             <div><strong>Total LOP Days:</strong> {totalSummary.totalLopDays}</div>
//             <div><strong>Total Additional Payments:</strong> ₹{totalSummary.totalAdditionalPayments}</div>
//             <div><strong>Total Additional Deductions:</strong> ₹{totalSummary.totalAdditionalDeductions}</div>
//           </div>
//         </div>

//         {/* TABLE */}
//         {isLoading ? (
//           <div className="flex justify-center py-10">
//             <Spin size="large" />
//           </div>
//         ) : (
//           <DataTable
//             columns={columns}
//             data={allSalaryTable}
//             exportCols={allColumns}
//             isExportEnabled={true}
//             exportedPdfName="Employee Salary Payment Report"
//             exportedFileName="EmployeeSalaryReport.csv"
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// const EmployeeSalaryReport = () => {
//   const [allEmployeeSalary, setAllEmployeeSalary] = useState([]);
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [allSalaryTable, setAllSalaryTable] = useState([]);
//   const [summary, setSummary] = useState({
//     totalNetPayable: 0,
//     totalPaidAmount: 0,
//     totalAdditionalPayments: 0,
//     totalAdditionalDeductions: 0,
//   });

//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [selectedMonthYear, setSelectedMonthYear] = useState(null);

//   // Fetch all employees
//   useEffect(() => {
//     const fetchEmployee = async () => {
//       try {
//         const response = await api.get("/agent/get-employee");
//         setAllEmployees(response?.data?.employee || []);
//       } catch (error) {
//         console.error("unable to fetch employee");
//       }
//     };
//     fetchEmployee();
//   }, []);

//   // Format salary rows
//   const formatSalaryData = (salaryList) => {
//     return salaryList.map((s, index) => {
//       const addTotal = Array.isArray(s?.additional_payments)
//         ? s.additional_payments.reduce((acc, cur) => acc + (cur.value || 0), 0)
//         : 0;

//       const dedTotal = Array.isArray(s?.additional_deductions)
//         ? s.additional_deductions.reduce((acc, cur) => acc + (cur.value || 0), 0)
//         : 0;

//       return {
//         _id: s?._id,
//         slNo: index + 1,
//         employeeCode: s?.employee_id?.employeeCode || "N/A",
//         employeeName: s?.employee_id?.name || "N/A",
//         employeePhone: s?.employee_id?.phone_number || "N/A",
//         salaryMonth: s?.salary_month || "N/A",
//         salaryYear: s?.salary_year || "N/A",
//         totalSalaryPayable: s?.total_salary_payable || 0,
//         netPayable: s?.net_payable || 0,
//         paidAmount: s?.paid_amount || 0,
//         remainingBalance: s?.remaining_balance || 0,
//         paidDays: s?.paid_days || 0,
//         paidDate: s?.pay_date?.split("T")[0] || "N/A",

//         // LIST VALUES → "Bonus:500 | Travel:200"
//         addPaymentsList:
//           Array.isArray(s?.additional_payments)
//             ? s.additional_payments
//                 .map((ele) => `${ele?.name}:${ele?.value}`)
//                 .join(" | ")
//             : "N/A",

//         dedPaymentsList:
//           Array.isArray(s?.additional_deductions)
//             ? s.additional_deductions
//                 .map((ele) => `${ele?.name}:${ele?.value}`)
//                 .join(" | ")
//             : "N/A",

//         // TOTAL VALUES
//         addPayments: addTotal,
//         dedPayments: dedTotal,

//         // Earnings & deductions
//        earningBasic: s?.earnings?.basic || 0,
//   earningHra: s?.earnings?.hra || 0,
//   earningTravelAllowance: s?.earnings?.travel_allowance || 0,
//   earningMedicalAllowance: s?.earnings?.medical_allowance || 0,
//   earningBenifits: s?.earnings?.basket_of_benifits || 0,
//   earningPerformanceBonus: s?.earnings?.performance_bonus || 0,
//   earningOthers: s?.earnings?.other_allowances || 0,
//   earningConveyance: s?.earnings?.conveyance || 0,

//   // Deductions
//   deductIT: s?.deductions?.income_tax || 0,
//   deductESI: s?.deductions?.esi || 0,
//   deductEPF: s?.deductions?.epf || 0,
//   deductPT: s?.deductions?.professional_tax || 0,
//   deductSalaryAdvance: s?.deductions?.salary_advance || 0,
//         salaryPaymentMethod: s?.salary_payment_method || "N/A",
//         status: s?.status || "N/A",
//       };
//     });
//   };

//   // SUMMARY CALCULATION (Based on current filtered / full data)
//   const calculateSummary = (rows) => {
//     const summaryData = {
//       totalNetPayable: 0,
//       totalPaidAmount: 0,
//       totalAdditionalPayments: 0,
//       totalAdditionalDeductions: 0,
//     };

//     rows.forEach((r) => {
//       summaryData.totalNetPayable += Number(r.netPayable) || 0;
//       summaryData.totalPaidAmount += Number(r.paidAmount) || 0;
//       summaryData.totalAdditionalPayments += Number(r.addPayments) || 0;
//       summaryData.totalAdditionalDeductions += Number(r.dedPayments) || 0;
//     });

//     setSummary(summaryData);
//   };

//   // FETCH ALL SALARIES
//   useEffect(() => {
//     const fetchEmployeeAllSalaries = async () => {
//       try {
//         setIsLoading(true);
//         const response = await api.get("/salary-payment/all");
//         const formatted = formatSalaryData(response?.data?.data || []);

//         setAllSalaryTable(formatted);
//         calculateSummary(formatted);
//       } catch (error) {
//         console.error("unable to fetch Employee Salary Payment");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchEmployeeAllSalaries();
//   }, []);

//   // FETCH FILTERED DATA
//   useEffect(() => {
//     const fetchAllEmployeeData = async () => {
//       try {
//         setIsLoading(true);

//         let query = [];
//         if (selectedEmployee) query.push(`employee_id=${selectedEmployee}`);
//         if (selectedMonthYear) {
//           query.push(`month=${selectedMonthYear.month}`);
//           query.push(`year=${selectedMonthYear.year}`);
//         }

//         const url = `/salary-payment/report?${query.join("&")}`;
//         const res = await api.get(url);

//         const formatted = formatSalaryData(res?.data?.data || []);
//         setAllSalaryTable(formatted);
//         calculateSummary(formatted); // SUMMARY APPLIED TO FILTERED RESULTS
//       } catch (err) {
//         console.log("unable to fetch filtered employee data");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAllEmployeeData();
//   }, [selectedEmployee, selectedMonthYear]);

//   // HANDLE MONTH PICKER
//   const handleMonthPick = (value) => {
//     if (!value) return setSelectedMonthYear(null);
//     const monthIndex = value.month();
//     const year = value.year();

//     const monthNames = [
//       "January","February","March","April","May","June",
//       "July","August","September","October","November","December",
//     ];

//     setSelectedMonthYear({
//       month: monthNames[monthIndex],
//       year,
//     });
//   };

//   const handleReset = () => {
//     setSelectedEmployee(null);
//     setSelectedMonthYear(null);
//   };

//   const columns = [
//     { key: "slNo", header: "SL. NO" },
//     { key: "employeeName", header: "Employee Name" },
//     { key: "employeeCode", header: "Employee Id" },
//     { key: "employeePhone", header: "Phone Number" },
//     { key: "salaryMonth", header: "Salary Month" },
//     { key: "salaryYear", header: "Year" },
//     { key: "paidDate", header: "Pay Date" },
//     { key: "netPayable", header: "Net Payable" },
//     { key: "paidAmount", header: "Paid Amount" },
//   ];

//   const allColumns = [
//     { key: "slNo", header: "Sl No" },
//     { key: "employeeCode", header: "Employee ID" },
//     { key: "employeeName", header: "Name" },
//     { key: "employeePhone", header: "Phone Number" },
//     { key: "salaryMonth", header: "Month" },
//     { key: "salaryYear", header: "Year" },
//     { key: "totalSalaryPayable", header: "Total Salary Payable" },
//     { key: "netPayable", header: "Net Payable" },
//     { key: "paidAmount", header: "Paid Amount" },
//     { key: "remainingBalance", header: "Remaining Balance" },
//     { key: "paidDays", header: "Paid Days" },
//     { key: "paidDate", header: "Paid Date" },
//     { key: "addPaymentsList", header: "Additional Payments (List)" },
//     { key: "addPayments", header: "Additional Payments (Total)" },
//     { key: "dedPaymentsList", header: "Deduction Payments (List)" },
//     { key: "dedPayments", header: "Deduction Payments (Total)" },
//     { key: "earningBasic", header: "Basic" },
//     { key: "earningHra", header: "HRA" },
//     { key: "earningTravelAllowance", header: "Travel Allowance" },
//     { key: "earningMedicalAllowance", header: "Medical Allowance" },
//     { key: "earningBenifits", header: "Performance Benifits" },
//     { key: "earningOthers", header: "Other Allowance" },
//     { key: "earningConveyance", header: "Conveyance" },
//     { key: "deductIT", header: "Income Tax" },
//     { key: "deductESI", header: "ESI" },
//     { key: "deductEPF", header: "EPF" },
//     { key: "deductPT", header: "Professional Tax" },
//     { key: "deductSalaryAdvance", header: "SalaryAdvance" },
//     { key: "salaryPaymentMethod", header: "Payment Type" },
//     { key: "status", header: "Status" },
//   ];

//   return (
//     <div className="w-screen">
//       <Navbar />
//       <div className="flex-grow p-7">

//         <h1 className="font-bold text-2xl mb-4">Reports - Salary Report</h1>

//         {/* FILTERS */}
//         <div className="flex gap-4 mb-6 items-center">
//           <Select
//             allowClear
//             style={{ width: 300 }}
//             value={selectedEmployee}
//             placeholder="Select Employee"
//             onChange={(value) => setSelectedEmployee(value)}
//           >
//             {allEmployees.map((emp) => (
//               <Option key={emp._id} value={emp._id}>
//                 {emp.name} | {emp.phone_number}
//               </Option>
//             ))}
//           </Select>

//           <MonthPicker
//             style={{ width: 250 }}
//             placeholder="Select Month"
//             onChange={handleMonthPick}
//           />

//           <button
//             onClick={handleReset}
//             className="px-4 py-2 bg-red-500 text-white rounded"
//           >
//             Reset
//           </button>
//         </div>

//         {/* SUMMARY BOX */}
//         <div className="grid grid-cols-4 gap-4 bg-gray-100 p-4 mb-5 rounded">
//           <div><b>Total Net Payable:</b> ₹{summary.totalNetPayable}</div>
//           <div><b>Total Paid Amount:</b> ₹{summary.totalPaidAmount}</div>
//           <div><b>Total Add. Payments:</b> ₹{summary.totalAdditionalPayments}</div>
//           <div><b>Total Add. Deductions:</b> ₹{summary.totalAdditionalDeductions}</div>
//         </div>

//         {isLoading ? (
//           <div className="flex justify-center py-10">
//             <Spin size="large" />
//           </div>
//         ) : (
//           <DataTable
//             columns={columns}
//             data={allSalaryTable}
//             exportCols={allColumns}
//             isExportEnabled={true}
//             exportedPdfName="Employee Salary Report"
//             exportedFileName="EmployeeSalaryReport.csv"
//           />
//         )}
//       </div>
//     </div>
//   );
// };

const EmployeeSalaryReport = () => {
  const [allEmployeeSalary, setAllEmployeeSalary] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [allSalaryTable, setAllSalaryTable] = useState([]);
  const [summary, setSummary] = useState({
    totalNetPayable: 0,
    totalPaidAmount: 0,
    totalPaidDays: 0,
    totalAdditionalPayments: 0,
    totalAdditionalDeductions: 0,
    addPaymentsListSummary: "",
    dedPaymentsListSummary: "",
    totalRemainingBalance: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);

  // Fetch all employees
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await api.get("/agent/get-employee");
        setAllEmployees(response?.data?.employee || []);
      } catch (error) {
        console.error("unable to fetch employee");
      }
    };
    fetchEmployee();
  }, []);

  // Format salary rows
  const formatSalaryData = (salaryList) => {
    return salaryList.map((s, index) => {
      const addTotal = Array.isArray(s?.additional_payments)
        ? s.additional_payments.reduce((acc, cur) => acc + (cur.value || 0), 0)
        : 0;

      const dedTotal = Array.isArray(s?.additional_deductions)
        ? s.additional_deductions.reduce((acc, cur) => acc + (cur.value || 0), 0)
        : 0;

      const addListStr = Array.isArray(s?.additional_payments)
        ? s.additional_payments.map((ele) => `${ele.name}:${ele.value}`).join(" | ")
        : "N/A";

      const dedListStr = Array.isArray(s?.additional_deductions)
        ? s.additional_deductions.map((ele) => `${ele.name}:${ele.value}`).join(" | ")
        : "N/A";

      return {
        _id: s?._id,
        slNo: index + 1,
        employeeCode: s?.employee_id?.employeeCode || "N/A",
        employeeName: s?.employee_id?.name || "N/A",
        employeePhone: s?.employee_id?.phone_number || "N/A",
        salaryMonth: s?.salary_month || "N/A",
        salaryYear: s?.salary_year || "N/A",
        totalSalaryPayable: s?.total_salary_payable || 0,
        netPayable: s?.net_payable || 0,
        paidAmount: s?.paid_amount || 0,
        remainingBalance: s?.remaining_balance || 0,
        paidDays: s?.paid_days || 0,
        paidDate: s?.pay_date?.split("T")[0] || "N/A",
        addPaymentsList: addListStr,
        dedPaymentsList: dedListStr,
        addPayments: addTotal,
        dedPayments: dedTotal,
        earningBasic: s?.earnings?.basic || 0,
        earningHra: s?.earnings?.hra || 0,
        earningTravelAllowance: s?.earnings?.travel_allowance || 0,
        earningMedicalAllowance: s?.earnings?.medical_allowance || 0,
        earningBenifits: s?.earnings?.basket_of_benifits || 0,
        earningPerformanceBonus: s?.earnings?.performance_bonus || 0,
        earningOthers: s?.earnings?.other_allowances || 0,
        earningConveyance: s?.earnings?.conveyance || 0,
        deductIT: s?.deductions?.income_tax || 0,
        deductESI: s?.deductions?.esi || 0,
        deductEPF: s?.deductions?.epf || 0,
        deductPT: s?.deductions?.professional_tax || 0,
        deductSalaryAdvance: s?.deductions?.salary_advance || 0,
        salaryPaymentMethod: s?.salary_payment_method || "N/A",
        status: s?.status || "N/A",
      };
    });
  };

  // SUMMARY CALCULATION (Based on current filtered / full data)
  const calculateSummary = (rows) => {
    const summaryData = {
      totalNetPayable: 0,
      totalPaidAmount: 0,
      totalPaidDays: 0,
      totalAdditionalPayments: 0,
      totalAdditionalDeductions: 0,
      totalRemainingBalance: 0,
      addPaymentsListSummary: "",
      dedPaymentsListSummary: "",
    };

    const addListArr = [];
    const dedListArr = [];

    rows.forEach((r) => {
      summaryData.totalNetPayable += Number(r.netPayable) || 0;
      summaryData.totalPaidAmount += Number(r.paidAmount) || 0;
      summaryData.totalPaidDays += Number(r.paidDays) || 0;
      summaryData.totalAdditionalPayments += Number(r.addPayments) || 0;
      summaryData.totalAdditionalDeductions += Number(r.dedPayments) || 0;
      summaryData.totalRemainingBalance += Number(r.remainingBalance)

      if (r.addPaymentsList && r.addPaymentsList !== "N/A") addListArr.push(r.addPaymentsList);
      if (r.dedPaymentsList && r.dedPaymentsList !== "N/A") dedListArr.push(r.dedPaymentsList);
    });

    summaryData.addPaymentsListSummary = addListArr.join(" | ");
    summaryData.dedPaymentsListSummary = dedListArr.join(" | ");

    setSummary(summaryData);
  };

  // FETCH ALL SALARIES
  useEffect(() => {
    const fetchEmployeeAllSalaries = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/salary-payment/all");
        const formatted = formatSalaryData(response?.data?.data || []);
        setAllSalaryTable(formatted);
        calculateSummary(formatted);
      } catch (error) {
        console.error("unable to fetch Employee Salary Payment");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployeeAllSalaries();
  }, []);

  // FETCH FILTERED DATA
  useEffect(() => {
    const fetchAllEmployeeData = async () => {
      try {
        setIsLoading(true);
        let query = [];
        if (selectedEmployee) query.push(`employee_id=${selectedEmployee}`);
        if (selectedMonthYear) {
          query.push(`month=${selectedMonthYear.month}`);
          query.push(`year=${selectedMonthYear.year}`);
        }

        const url = `/salary-payment/report?${query.join("&")}`;
        const res = await api.get(url);

        const formatted = formatSalaryData(res?.data?.data || []);
        setAllSalaryTable(formatted);
        calculateSummary(formatted);
      } catch (err) {
        console.log("unable to fetch filtered employee data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEmployeeData();
  }, [selectedEmployee, selectedMonthYear]);

  // HANDLE MONTH PICKER
  const handleMonthPick = (value) => {
    if (!value) return setSelectedMonthYear(null);
    const monthIndex = value.month();
    const year = value.year();

    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ];

    setSelectedMonthYear({
      month: monthNames[monthIndex],
      year,
    });
  };

  const handleReset = () => {
    setSelectedEmployee(null);
    setSelectedMonthYear(null);
  };

    const columns = [
    { key: "slNo", header: "SL. NO" },
    { key: "employeeName", header: "Employee Name" },
    { key: "employeeCode", header: "Employee ID" },
    { key: "employeePhone", header: "Phone" },
    { key: "salaryMonth", header: "Month" },
    { key: "salaryYear", header: "Year" },
    { key: "paidDate", header: "Pay Date" },
    { key: "netPayable", header: "Net Payable" },
    { key: "paidAmount", header: "Paid Amount" },
  ];

  const allColumns = [
    { key: "slNo", header: "Sl No" },
    { key: "employeeCode", header: "Employee ID" },
    { key: "employeeName", header: "Name" },
    { key: "employeePhone", header: "Phone Number" },
    { key: "salaryMonth", header: "Month" },
    { key: "salaryYear", header: "Year" },
    { key: "totalSalaryPayable", header: "Total Salary Payable" },
    { key: "netPayable", header: "Net Payable" },
    { key: "paidAmount", header: "Paid Amount" },
    { key: "remainingBalance", header: "Remaining Balance" },
    { key: "paidDays", header: "Paid Days" },
    { key: "paidDate", header: "Paid Date" },
    { key: "addPayments", header: "Additional Payments" },
    { key: "dedPayments", header: "Deduction Payments" },
    { key: "earningBasic", header: "Basic" },
    { key: "earningHra", header: "HRA" },
    { key: "earningTravelAllowance", header: "Travel Allowance" },
    { key: "earningMedicalAllowance", header: "Medical Allowance" },
    { key: "earningBenifits", header: "Performance Benifits" },
    { key: "earningOthers", header: "Other Allowance" },
    { key: "earningConveyance", header: "Conveyance" },
    { key: "deductIT", header: "Income Tax" },
    { key: "deductESI", header: "ESI" },
    { key: "deductEPF", header: "EPF" },
    { key: "deductPT", header: "Professional Tax" },
    { key: "deductSalaryAdvance", header: "SalaryAdvance" },
    { key: "salaryPaymentMethod", header: "Payment Type" },
    { key: "status", header: "Status" },
  ];

  return (
    <div className="w-screen">
      <Navbar />
      <div className="flex-grow p-7">
        <h1 className="font-bold text-2xl mb-4">Reports - Salary Report</h1>

        {/* FILTERS */}
        <div className="flex gap-4 mb-6 items-center">
          <Select
            allowClear
            style={{ width: 300 }}
            value={selectedEmployee}
            placeholder="Select Employee"
            onChange={(value) => setSelectedEmployee(value)}
          >
            {allEmployees.map((emp) => (
              <Option key={emp._id} value={emp._id}>
                {emp.name} | {emp.phone_number}
              </Option>
            ))}
          </Select>

          <MonthPicker
            style={{ width: 250 }}
            placeholder="Select Month"
            onChange={handleMonthPick}
          />

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Reset
          </button>
        </div>

        {/* SUMMARY BOX */}
        <div className="grid grid-cols-2 gap-4 bg-gray-100 p-4 mb-5 rounded">
          <div><b>Total Net Payable:</b> ₹{summary.totalNetPayable}</div>
          <div><b>Total Paid Amount:</b> ₹{summary.totalPaidAmount}</div>
          <div><b>Total Paid Days:</b> {summary.totalPaidDays}</div>
          <div><b>Total Add. Payments:</b> ₹{summary.totalAdditionalPayments}</div>
          <div><b>Total Add. Deductions:</b> ₹{summary.totalAdditionalDeductions}</div>
          <div><b>All Additional Payments:</b> {summary.addPaymentsListSummary}</div>
          <div><b>All Deduction Payments:</b> {summary.dedPaymentsListSummary}</div>
          <div><b>All Remaining:</b> {summary.totalRemainingBalance}</div>

        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={allSalaryTable}
            exportCols={allColumns}
            isExportEnabled={true}
            exportedPdfName="Employee Salary Report"
            exportedFileName="EmployeeSalaryReport.csv"
          />
        )}
      </div>
    </div>
  );
};









export default EmployeeSalaryReport;
