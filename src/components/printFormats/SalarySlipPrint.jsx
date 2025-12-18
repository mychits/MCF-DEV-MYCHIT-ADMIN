// src/components/SalarySlipPrint.jsx
import { useState, useEffect, useRef } from "react";
import { Spin, Alert, Button, Card, Divider } from "antd";
import api from "../../instance/TokenInstance";
import imageInput from "../../assets/images/Agent.png";
import { useParams } from "react-router-dom";
import { PrinterOutlined, DownloadOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// const SalarySlipPrint = () => {
//   const params = useParams();
//   const paymentId = params.id || "";
//   const [printFormat, setPrintFormat] = useState("format1");
//   const [payment, setPayment] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [previewContent, setPreviewContent] = useState("");
//   const [downloading, setDownloading] = useState(false);
//   const previewRef = useRef(null);

//   // Fetch payment details when component mounts or paymentId changes
//   useEffect(() => {
//     if (!paymentId) {
//       setError("Payment ID is required");
//       return;
//     }

//     const fetchPaymentDetails = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const response = await api.get(`/salary-payment/${paymentId}`);
//         setPayment(response.data?.data);
//       } catch (err) {
//         console.error("Error fetching payment details:", err);
//         setError("Failed to fetch payment details. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPaymentDetails();
//   }, [paymentId]);

//   // Update preview when format or payment data changes
//   useEffect(() => {
//     if (payment) {
//       const content = generateSalarySlipContent();
//       setPreviewContent(content);
//     }
//   }, [printFormat, payment]);

//   if (loading) {
//     return <div className="flex justify-center p-4"><Spin size="large" /></div>;
//   }

//   if (error) {
//     return <div className="p-4"><Alert message={error} type="error" showIcon /></div>;
//   }

//   if (!payment || typeof payment !== "object" || !payment.employee_id) {
//     return <div className="p-4"><Alert message="Payment details not found" type="warning" showIcon /></div>;
//   }

//   const generateSalarySlipContent = () => {
//     try {
//       const agent = payment.employee_id;
//       const payslipId = payment._id;
//       const payDate = payment.pay_date || payment.createdAt;
//       const fromDate = payment.salary_from_date;
//       const toDate = payment.salary_to_date;
//       const salaryMonth = payment.salary_month;
//       const salaryYear = payment.salary_year;

//       // Extract earnings and deductions from the payment data
//       const earnings = payment.earnings || {};
//       const deductions = payment.deductions || {};
//       const additionalPayments = payment.additional_payments || [];

//       // Calculate values
//       const monthlySalary = parseFloat(earnings.basic || 0);
//       const hra = parseFloat(earnings.hra || 0);
//       const travelAllowance = parseFloat(earnings.travel_allowance || 0);
//       const medicalAllowance = parseFloat(earnings.medical_allowance || 0);
//       const basketOfBenefits = parseFloat(earnings.basket_of_benifits || 0);
//       const performanceBonus = parseFloat(earnings.performance_bonus || 0);
//       const otherAllowances = parseFloat(earnings.other_allowances || 0);
//       const conveyance = parseFloat(earnings.conveyance || 0);

//       const incomeTax = parseFloat(deductions.income_tax || 0);
//       const esi = parseFloat(deductions.esi || 0);
//       const epf = parseFloat(deductions.epf || 0);
//       const professionalTax = parseFloat(deductions.professional_tax || 0);
//       const salaryAdvance = parseFloat(deductions.salary_advance || 0);

//       // Calculate additional payments total
//       const additionalPaymentsTotal = additionalPayments.reduce(
//         (sum, payment) => sum + parseFloat(payment.value || 0), 0
//       );

//       // Calculate total earnings and deductions
//       const totalEarnings = monthlySalary + hra + travelAllowance + medicalAllowance +
//                            basketOfBenefits + performanceBonus + otherAllowances +
//                            conveyance + additionalPaymentsTotal;

//       const totalDeductions = incomeTax + esi + epf + professionalTax + salaryAdvance;

//       const netPayable = parseFloat(payment.net_payable || 0);

//       // Calculate LOP (Loss of Pay)
//       const lop = totalEarnings - netPayable - totalDeductions;

//       // Format date
//       const formatDate = (date) => {
//         if (!date) return "N/A";
//         return new Date(date).toLocaleDateString("en-IN", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//         });
//       };

//       // Convert amount to words
//       const amountInWords = numToWords(netPayable);

//       // --- FORMAT 1: Classic Professional ---
//       const format1 = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//          <title>Salary Slip</title>
//         <style>
//           @page { size: A4; margin: 15mm; }
//           body { font-family: 'Times New Roman', serif; margin: 0; color: #000; background: #fff; }
//           .container { max-width: 800px; margin: 0 auto; }
//           .header { border: 3px solid #000; padding: 15px; margin-bottom: 20px; background: #f5f5f5; }
//           .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
//           .logo { width: 80px; height: 80px; }
//           .company-info { text-align: center; flex: 1; }
//           .company-name { font-size: 28px; font-weight: bold; margin: 5px 0; }
//           .company-addr { font-size: 11px; margin: 2px 0; }
//           .payslip-title { text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; margin: 15px 0; }
//           .meta-info { text-align: right; font-size: 12px; }
//           .emp-details { border: 2px solid #000; margin: 15px 0; }
//           .emp-header { background: #000; color: #fff; padding: 8px; font-weight: bold; text-align: center; }
//           .emp-grid { display: grid; grid-template-columns: 1fr 1fr; }
//           .emp-item { padding: 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 12px; }
//           .emp-item:nth-child(even) { border-right: none; }
//           .salary-table { width: 100%; border: 2px solid #000; border-collapse: collapse; margin: 15px 0; }
//           .salary-table th { background: #000; color: #fff; padding: 10px; border: 1px solid #000; font-size: 14px; }
//           .salary-table td { padding: 8px; border: 1px solid #000; font-size: 12px; }
//           .total-row { background: #e0e0e0; font-weight: bold; }
//           .net-section { border: 3px double #000; padding: 15px; text-align: center; margin: 20px 0; background: #f9f9f9; }
//           .net-amount { font-size: 24px; font-weight: bold; margin: 10px 0; }
//           .words { font-style: italic; font-size: 11px; margin-top: 10px; }
//           .footer { text-align: center; font-size: 10px; margin-top: 30px; border-top: 1px solid #000; padding-top: 10px; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <div class="header-top">
//               <img src="${imageInput}" class="logo" alt="Logo">
//               <div class="company-info">
//                 <div class="company-name">Mychits</div>
//                 <div class="company-addr">No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</div>
//                 <div class="company-addr">CIN: U65999KA2022PTC161858</div>
//               </div>
//               <div class="meta-info">
//                 Payslip ID: <strong>${payslipId}</strong><br>
//                 Date: <strong>${new Date().toLocaleDateString()}</strong>
//               </div>
//             </div>
//             <div class="payslip-title">SALARY SLIP</div>
//           </div>

//           <div class="emp-details">
//             <div class="emp-header">EMPLOYEE DETAILS</div>
//             <div class="emp-grid">
//               <div class="emp-item"><strong>Name:</strong> ${agent?.name || "N/A"}</div>
//               <div class="emp-item"><strong>Employee ID:</strong> ${agent?.employeeCode || "N/A"}</div>
//               <div class="emp-item"><strong>Designation:</strong> ${agent?.designation_id?.title || "N/A"}</div>
//               <div class="emp-item"><strong>Department:</strong> ${agent?.department || "N/A"}</div>
//               <div class="emp-item"><strong>Pay Period:</strong> ${formatDate(fromDate)} to ${formatDate(toDate)}</div>
//               <div class="emp-item"><strong>Payment Date:</strong> ${formatDate(payDate)}</div>
//             </div>
//           </div>

//           <table class="salary-table">
//             <thead><tr><th>EARNINGS</th><th>AMOUNT (₹)</th><th>DEDUCTIONS</th><th>AMOUNT (₹)</th></tr></thead>
//             <tbody>
//               <tr><td>Basic Salary</td><td>₹${monthlySalary.toFixed(2)}</td><td>EPF</td><td>₹${epf.toFixed(2)}</td></tr>
//               <tr><td>House Rent Allowance</td><td>₹${hra.toFixed(2)}</td><td>ESI</td><td>₹${esi.toFixed(2)}</td></tr>
//               <tr><td>Travel Allowance</td><td>₹${travelAllowance.toFixed(2)}</td><td>Professional Tax</td><td>₹${professionalTax.toFixed(2)}</td></tr>
//               <tr><td>Medical Allowance</td><td>₹${medicalAllowance.toFixed(2)}</td><td>Income Tax</td><td>₹${incomeTax.toFixed(2)}</td></tr>
//               <tr><td>Basket of Benefits</td><td>₹${basketOfBenefits.toFixed(2)}</td><td>Salary Advance</td><td>₹${salaryAdvance.toFixed(2)}</td></tr>
//               <tr><td>Performance Bonus</td><td>₹${performanceBonus.toFixed(2)}</td><td>LOP</td><td>₹${lop.toFixed(2)}</td></tr>
//               <tr><td>Other Allowances</td><td>₹${otherAllowances.toFixed(2)}</td></tr>
//               <tr><td>Conveyance</td><td>₹${conveyance.toFixed(2)}</td></tr>
//               ${additionalPayments.map(payment =>
//                 `<tr><td>${payment.name}</td><td>₹${parseFloat(payment.value || 0).toFixed(2)}</td></tr>`
//               ).join('')}
//               <tr class="total-row">
//                 <td><strong>GROSS EARNINGS</strong></td>
//                 <td><strong>₹${totalEarnings.toFixed(2)}</strong></td>
//                 <td><strong>TOTAL DEDUCTIONS</strong></td>
//                 <td><strong>₹${totalDeductions.toFixed(2)}</strong></td>
//               </tr>
//             </tbody>
//           </table>

//           <div class="net-section">
//             <div>NET PAYABLE AMOUNT</div>
//             <div class="net-amount">₹${netPayable.toFixed(2)}</div>
//             <div class="words">Amount in words: Indian Rupees ${amountInWords} Only</div>
//           </div>

//           <div class="footer">This is a system-generated payslip. No signature required.<br>&copy; ${new Date().getFullYear()} Mychits. Confidential.</div>
//         </div>
//       </body>
//       </html>
//     `;

//       // --- FORMAT 2: Modern Gradient (Fixed for Preview) ---
//       const format2 = `
// <!DOCTYPE html>
// <html>
// <head>
// <style>
// @page { size: A4; margin: 12mm; }
// body {
//   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//   margin: 0;
//   color: #1a202c;
//   background: #ffffff;
//   padding: 0;
//   -webkit-print-color-adjust: exact;
//   print-color-adjust: exact;
// }
// .document {
//   background: #ffffff;
//   margin: 0 auto;
//   width: 100%;
//   min-height: 100vh;
//   box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//   padding: 0;
//   box-sizing: border-box;
//   overflow: hidden;
//   display: flex;
//   flex-direction: column;
// }
// .header-band {
//   background: #667eea;
//   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//   color: #fff;
//   padding: 20px;
// }
// .header-content {
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   gap: 20px;
// }
// .logo-circle {
//   width: 70px;
//   height: 70px;
//   background: rgba(255,255,255,0.2);
//   border-radius: 6px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
// }
// .logo-circle img {
//   width: 50px;
//   height: 50px;
//   border-radius: 4px;
// }
// .header-text { flex: 1; }
// .company-title {
//   font-size: 22px;
//   font-weight: 700;
//   margin-bottom: 4px;
// }
// .company-subtitle {
//   font-size: 11px;
//   opacity: 0.9;
//   line-height: 1.4;
// }
// .header-meta {
//   text-align: right;
//   background: rgba(255,255,255,0.15);
//   padding: 12px;
//   border-radius: 10px;
//   font-size: 11px;
// }
// .meta-line { margin: 2px 0; }
// .meta-value { font-weight: 400; }
// .content {
//   flex: 1;
//   padding: 20px;
//   background: #ffffff;
// }
// .payslip-title {
//   text-align: center;
//   font-size: 24px;
//   font-weight: 500;
//   color: #4a5568;
//   margin: 20px 0;
//   letter-spacing: 2px;
// }
// .card {
//   background: #fff;
//   border: 1px solid #e2e8f0;
//   border-radius: 10px;
//   margin-bottom: 20px;
//   overflow: hidden;
//   box-shadow: 0 1px 3px rgba(0,0,0,0.1);
// }
// .card-header {
//   background: #f7fafc;
//   padding: 12px;
//   border-bottom: 1px solid #e2e8f0;
//   font-weight: 600;
//   color: #4a5568;
// }
// .card-body { padding: 15px; }
// .info-grid {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 12px;
// }
// .info-pair {
//   display: flex;
//   justify-content: space-between;
//   padding: 6px 0;
//   border-bottom: 1px dotted #e2e8f0;
//   font-size: 12px;
// }
// .info-pair:last-child { border-bottom: none; }
// .salary-grid {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 20px;
// }
// .earnings-card { border-left: 4px solid #48bb78; }
// .deductions-card { border-left: 4px solid #f56565; }
// .item-row {
//   display: flex;
//   justify-content: space-between;
//   padding: 8px 0;
//   border-bottom: 1px solid #f7fafc;
//   font-size: 12px;
// }
// .item-row:last-child { border-bottom: 2px solid #e2e8f0; }
// .item-name { color: #4a5568; }
// .item-amount { color: #2d3748; font-weight: 600; }
// .total-amount {
//   background: #edf2f7;
//   padding: 10px;
//   border-radius: 6px;
//   font-weight: 700;
//   text-align: right;
// }
// .net-section {
//   background: #4299e1;
//   background: linear-gradient(135deg, #4299e1, #3182ce);
//   color: #fff;
//   padding: 20px;
//   border-radius: 10px;
//   text-align: center;
//   margin: 25px 0;
// }
// .net-title { font-size: 14px; margin-bottom: 8px; }
// .net-figure { font-size: 28px; font-weight: 500; margin-bottom: 10px; }
// .net-words { font-size: 11px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px; }
// .signature-section {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 20px;
//   margin-top: 15px;
// }
// .signature-line {
//   border-top: 1px solid #cbd5e0;
//   margin-top: 40px;
//   padding-top: 8px;
//   font-size: 11px;
//   color: #718096;
// }
// .footer-text {
//   text-align: center;
//   color: #a0aec0;
//   font-size: 9px;
//   margin: 25px 0;
// }
// @media print {
//   body { background: #fff; }
//   .document { box-shadow: none; page-break-after: avoid; }
// }
// </style>
// </head>
// <body>
// <div class="document">
//   <div class="header-band">
//     <div class="header-content">
//       <div class="logo-circle">
//         <img src="${imageInput}" alt="Logo">
//       </div>
//       <div class="header-text">
//         <div class="company-title">Mychits</div>
//         <div class="company-subtitle">No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</div>
//       </div>
//       <div class="header-meta">
//         <div class="meta-line">Payslip ID: <span class="meta-value">${payslipId}</span></div>
//         <div class="meta-line">Period: <span class="meta-value">${salaryMonth} ${salaryYear}</span></div>
//         <div class="meta-line">Date: <span class="meta-value">${formatDate(payDate)}</span></div>
//       </div>
//     </div>
//   </div>
//   <div class="content">
//     <div class="payslip-title">PAYSLIP</div>
//     <div class="card">
//       <div class="card-header">Employee Information</div>
//       <div class="card-body">
//         <div class="info-grid">
//           <div class="info-pair"><span>Employee Name</span><span>${agent?.name || "N/A"}</span></div>
//           <div class="info-pair"><span>Employee ID</span><span>${agent?.employeeCode || "N/A"}</span></div>
//           <div class="info-pair"><span>Designation</span><span>${agent?.designation_id?.title || "N/A"}</span></div>
//           <div class="info-pair"><span>Department</span><span>${agent?.department || "N/A"}</span></div>
//           <div class="info-pair"><span>Pay Period</span><span>${formatDate(fromDate)} to ${formatDate(toDate)}</span></div>
//           <div class="info-pair"><span>Payment Method</span><span>${payment.payment_method || "N/A"}</span></div>
//         </div>
//       </div>
//     </div>
//     <div class="salary-grid">
//       <div class="card earnings-card">
//         <div class="card-header" style="color: #48bb78;">Earnings</div>
//         <div class="card-body">
//           <div class="item-row"><div class="item-name">Basic Salary</div><div class="item-amount">₹${monthlySalary.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">HRA</div><div class="item-amount">₹${hra.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Travel Allowance</div><div class="item-amount">₹${travelAllowance.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Medical Allowance</div><div class="item-amount">₹${medicalAllowance.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Basket of Benefits</div><div class="item-amount">₹${basketOfBenefits.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Performance Bonus</div><div class="item-amount">₹${performanceBonus.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Other Allowances</div><div class="item-amount">₹${otherAllowances.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Conveyance</div><div class="item-amount">₹${conveyance.toFixed(2)}</div></div>
//           ${additionalPayments.map(payment =>
//             `<div class="item-row"><div class="item-name">${payment.name}</div><div class="item-amount">₹${parseFloat(payment.value || 0).toFixed(2)}</div></div>`
//           ).join('')}
//           <div class="total-amount">Total: ₹${totalEarnings.toFixed(2)}</div>
//         </div>
//       </div>
//       <div class="card deductions-card">
//         <div class="card-header" style="color: #f56565;">Deductions</div>
//         <div class="card-body">
//           <div class="item-row"><div class="item-name">Loss of Pay</div><div class="item-amount">₹${lop.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">EPF</div><div class="item-amount">₹${epf.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">ESI</div><div class="item-amount">₹${esi.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Professional Tax</div><div class="item-amount">₹${professionalTax.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Income Tax</div><div class="item-amount">₹${incomeTax.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Salary Advance</div><div class="item-amount">₹${salaryAdvance.toFixed(2)}</div></div>
//           <div class="total-amount">Total: ₹${totalDeductions.toFixed(2)}</div>
//         </div>
//       </div>
//     </div>
//     <div class="net-section">
//       <div class="net-title">Net Payable Amount</div>
//       <div class="net-figure">₹${netPayable.toFixed(2)}</div>
//       <div class="net-words">Amount in Words: Indian Rupees ${amountInWords} Only</div>
//     </div>
//     <div class="signature-section">
//       <div class="signature-line">Employee Signature</div>
//       <div class="signature-line">Authorized Signatory</div>
//     </div>
//     <div class="footer-text">
//       This is a computer generated payslip and does not require signature.<br>
//       &copy; ${new Date().getFullYear()} Mychits.
//     </div>
//   </div>
// </div>
// </body>
// </html>`;

//       return printFormat === "format1" ? format1 : format2;
//     } catch (err) {
//       console.error("Error generating salary slip content:", err);
//       return "<div>Error generating salary slip content</div>";
//     }
//   };

//   const handlePrint = () => {
//     try {
//       const htmlContent = generateSalarySlipContent();
//       const agent = payment.employee_id;
//       const salaryMonth = payment.salary_month;
//       const salaryYear = payment.salary_year;
//       const fileName = `${agent?.name || "Employee"}_${salaryMonth}_${salaryYear} Slip`;

//       const printWindow = window.open("", "_blank");
//       printWindow.document.write(htmlContent);
//       printWindow.document.title = fileName;
//       printWindow.document.close();
//       printWindow.print();
//     } catch (err) {
//       console.error("Error printing salary slip:", err);
//       alert("Failed to generate salary slip. Check console for details.");
//     }
//   };

//   const handleDownloadPDF = async () => {
//     try {
//       setDownloading(true);
//       const element = previewRef.current;
//       const agent = payment.employee_id;
//       const salaryMonth = payment.salary_month;
//       const salaryYear = payment.salary_year;
//       const fileName = `${agent?.name || "Employee"}_${salaryMonth}_${salaryYear}_Payslip.pdf`;

//       // Create canvas from preview element
//       const canvas = await html2canvas(element, {
//         scale: 2,
//         useCORS: true,
//         logging: false,
//         backgroundColor: '#ffffff',
//         width: element.scrollWidth,
//         height: element.scrollHeight
//       });

//       // Get image data
//       const imgData = canvas.toDataURL('image/png');

//       // Calculate PDF dimensions
//       const imgWidth = 210; // A4 width in mm
//       const pageHeight = 297; // A4 height in mm
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;
//       let heightLeft = imgHeight;
//       let position = 0;

//       // Create PDF
//       const pdf = new jsPDF('p', 'mm', 'a4');

//       // Add image to PDF
//       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//       heightLeft -= pageHeight;

//       // Add new page if content is longer than one page
//       while (heightLeft >= 0) {
//         position = heightLeft - imgHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//         heightLeft -= pageHeight;
//       }

//       // Save PDF
//       pdf.save(fileName);
//     } catch (err) {
//       console.error("Error downloading PDF:", err);
//       alert("Failed to download PDF. Check console for details.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const numToWords = (num) => {
//     if (isNaN(num) || num === 0) return "Zero";

//     const a = [
//       "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
//       "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
//     ];
//     const b = [
//       "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
//     ];

//     num = Math.round(num);
//     if ((num = num.toString()).length > 9) return "Overflow";

//     const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
//     if (!n) return "";

//     let str = "";
//     str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore " : "";
//     str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh " : "";
//     str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand " : "";
//     str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred " : "";
//     str += n[5] != 0 ? (str != "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) + " " : "";

//     return str.trim() || "Zero";
//   };

//   const formatButtons = [
//     { key: 'format1', label: 'Classic Professional', description: 'Traditional formal style' },
//     { key: 'format2', label: 'Modern Gradient', description: 'Contemporary colorful design' }
//   ];

//   return (
//     <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
//       {/* Format Selection Buttons */}
//       <Card className="shadow-lg border-0">
//         <div className="mb-4">
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Salary Slip Generator</h2>
//           <p className="text-gray-600">Select a format and preview your payslip</p>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {formatButtons.map((format) => (
//             <button
//               key={format.key}
//               onClick={() => setPrintFormat(format.key)}
//               className={`p-4 rounded-xl border-2 transition-all duration-300 ${
//                 printFormat === format.key
//                   ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
//                   : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
//               }`}
//             >
//               <div className="font-semibold text-lg mb-1">{format.label}</div>
//               <div className="text-sm text-gray-500">{format.description}</div>
//             </button>
//           ))}
//         </div>
//       </Card>

//       {/* Preview Section */}
//       <Card
//         title={`Preview: ${formatButtons.find(f => f.key === printFormat)?.label}`}
//         className="shadow-lg border-0"
//         extra={
//           <div className="flex gap-3">
//             <Button
//               type="primary"
//               icon={<PrinterOutlined />}
//               onClick={handlePrint}
//               className="bg-blue-600 hover:bg-blue-700"
//             >
//               Print
//             </Button>
//             <Button
//               type="primary"
//               icon={<DownloadOutlined />}
//               onClick={handleDownloadPDF}
//               loading={downloading}
//               className="bg-green-600 hover:bg-green-700"
//             >
//               Download PDF
//             </Button>
//           </div>
//         }
//       >
//         <div className="bg-gray-100 rounded-lg p-4">
//           <div
//             ref={previewRef}
//             className="bg-white rounded shadow-md overflow-auto"
//             style={{
//               height: '75vh',
//               transform: 'scale(0.85)',
//               transformOrigin: 'top left',
//               width: '117.65%' // 100 / 0.85 to compensate for scaling
//             }}
//           >
//             {previewContent ? (
//               <div dangerouslySetInnerHTML={{ __html: previewContent }} />
//             ) : (
//               <div className="flex items-center justify-center h-full">
//                 <Spin size="large" tip="Generating preview..." />
//               </div>
//             )}
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// src/components/SalarySlipPrint.jsx

// const SalarySlipPrint = () => {
//   const params = useParams();
//   const paymentId = params.id || "";
//   const [printFormat, setPrintFormat] = useState("format1");
//   const [payment, setPayment] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [previewContent, setPreviewContent] = useState("");
//   const [downloading, setDownloading] = useState(false);
//   const previewRef = useRef(null);

//   // Fetch payment details when component mounts or paymentId changes
//   useEffect(() => {
//     if (!paymentId) {
//       setError("Payment ID is required");
//       return;
//     }

//     const fetchPaymentDetails = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const response = await api.get(`/salary-payment/${paymentId}`);
//         setPayment(response.data?.data);
//       } catch (err) {
//         console.error("Error fetching payment details:", err);
//         setError("Failed to fetch payment details. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPaymentDetails();
//   }, [paymentId]);

//   // Update preview when format or payment data changes
//   useEffect(() => {
//     if (payment) {
//       const content = generateSalarySlipContent();
//       setPreviewContent(content);
//     }
//   }, [printFormat, payment]);

//   if (loading) {
//     return <div className="flex justify-center p-4"><Spin size="large" /></div>;
//   }

//   if (error) {
//     return <div className="p-4"><Alert message={error} type="error" showIcon /></div>;
//   }

//   if (!payment || typeof payment !== "object" || !payment.employee_id) {
//     return <div className="p-4"><Alert message="Payment details not found" type="warning" showIcon /></div>;
//   }

//   const generateSalarySlipContent = () => {
//     try {
//       const agent = payment.employee_id;
//       console.info(agent, "test 123");
//       console.info(agent?.designation_id?.title, "test 124");
//       const payslipId = payment._id;
//       const payDate = payment.pay_date || payment.createdAt;
//       const fromDate = payment.salary_from_date;
//       const toDate = payment.salary_to_date;
//       const salaryMonth = payment.salary_month;
//       const salaryYear = payment.salary_year;

//       // Extract earnings and deductions from the payment data
//       const earnings = payment.earnings || {};
//       const deductions = payment.deductions || {};
//       const additionalPayments = payment.additional_payments || [];

//       // Calculate values
//       const monthlySalary = parseFloat(earnings.basic || 0);
//       const hra = parseFloat(earnings.hra || 0);
//       const travelAllowance = parseFloat(earnings.travel_allowance || 0);
//       const medicalAllowance = parseFloat(earnings.medical_allowance || 0);
//       const basketOfBenefits = parseFloat(earnings.basket_of_benifits || 0);
//       const performanceBonus = parseFloat(earnings.performance_bonus || 0);
//       const otherAllowances = parseFloat(earnings.other_allowances || 0);
//       const conveyance = parseFloat(earnings.conveyance || 0);

//       const incomeTax = parseFloat(deductions.income_tax || 0);
//       const esi = parseFloat(deductions.esi || 0);
//       const epf = parseFloat(deductions.epf || 0);
//       const professionalTax = parseFloat(deductions.professional_tax || 0);
//       const salaryAdvance = parseFloat(deductions.salary_advance || 0);

//       // Calculate additional payments total
//       const additionalPaymentsTotal = additionalPayments.reduce(
//         (sum, payment) => sum + parseFloat(payment.value || 0), 0
//       );

//       // Calculate total earnings and deductions
//       const totalEarnings = monthlySalary + hra + travelAllowance + medicalAllowance +
//                            basketOfBenefits + performanceBonus + otherAllowances +
//                            conveyance + additionalPaymentsTotal;

//       const totalDeductions = incomeTax + esi + epf + professionalTax + salaryAdvance;

//       const netPayable = parseFloat(payment.net_payable || 0);

//       // Calculate LOP (Loss of Pay)
//       const lop = totalEarnings - netPayable - totalDeductions;

//       // Format date
//       const formatDate = (date) => {
//         if (!date) return "N/A";
//         return new Date(date).toLocaleDateString("en-IN", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//         });
//       };

//       // Convert amount to words
//       const amountInWords = numToWords(netPayable);

//       // --- FORMAT 1: Classic Professional ---
//       const format1 = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//          <title>Salary Slip</title>
//         <style>
//           @page { size: A4; margin: 15mm; }
//           body { font-family: 'Times New Roman', serif; margin: 0; color: #000; background: #fff; }
//           .container { max-width: 800px; margin: 0 auto; }
//           .header { border: 3px solid #000; padding: 15px; margin-bottom: 20px; background: #f5f5f5; }
//           .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
//           .logo { width: 80px; height: 80px; }
//           .company-info { text-align: center; flex: 1; }
//           .company-name { font-size: 28px; font-weight: bold; margin: 5px 0; }
//           .company-addr { font-size: 11px; margin: 2px 0; }
//           .payslip-title { text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; margin: 15px 0; }
//           .meta-info { text-align: right; font-size: 12px; }
//           .emp-details { border: 2px solid #000; margin: 15px 0; }
//           .emp-header { background: #000; color: #fff; padding: 8px; font-weight: bold; text-align: center; }
//           .emp-grid { display: grid; grid-template-columns: 1fr 1fr; }
//           .emp-item { padding: 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 12px; }
//           .emp-item:nth-child(even) { border-right: none; }
//           .salary-table { width: 100%; border: 2px solid #000; border-collapse: collapse; margin: 15px 0; }
//           .salary-table th { background: #000; color: #fff; padding: 10px; border: 1px solid #000; font-size: 14px; }
//           .salary-table td { padding: 8px; border: 1px solid #000; font-size: 12px; }
//           .total-row { background: #e0e0e0; font-weight: bold; }
//           .net-section { border: 3px double #000; padding: 15px; text-align: center; margin: 20px 0; background: #f9f9f9; }
//           .net-amount { font-size: 24px; font-weight: bold; margin: 10px 0; }
//           .words { font-style: italic; font-size: 11px; margin-top: 10px; }
//           .footer { text-align: center; font-size: 10px; margin-top: 30px; border-top: 1px solid #000; padding-top: 10px; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <div class="header-top">
//               <img src="${imageInput}" class="logo" alt="Logo">
//               <div class="company-info">
//                 <div class="company-name">Mychits</div>
//                 <div class="company-addr">No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</div>
//                 <div class="company-addr">CIN: U65999KA2022PTC161858</div>
//               </div>
//               <div class="meta-info">
//                 Payslip ID: <strong>${payslipId}</strong><br>
//                 Date: <strong>${new Date().toLocaleDateString()}</strong>
//               </div>
//             </div>
//             <div class="payslip-title">SALARY SLIP</div>
//           </div>

//           <div class="emp-details">
//             <div class="emp-header">EMPLOYEE DETAILS</div>
//             <div class="emp-grid">
//               <div class="emp-item"><strong>Name:</strong> ${agent?.name || "N/A"}</div>
//               <div class="emp-item"><strong>Employee ID:</strong> ${agent?.employeeCode || "N/A"}</div>
//               <div class="emp-item"><strong>Designation:</strong> ${agent?.designation_id?.title || "N/A"}</div>
//               <div class="emp-item"><strong>Department:</strong> ${agent?.department || "N/A"}</div>
//               <div class="emp-item"><strong>Pay Period:</strong> ${formatDate(fromDate)} to ${formatDate(toDate)}</div>
//               <div class="emp-item"><strong>Payment Date:</strong> ${formatDate(payDate)}</div>
//             </div>
//           </div>

//           <table class="salary-table">
//             <thead><tr><th>EARNINGS</th><th>AMOUNT (₹)</th><th>DEDUCTIONS</th><th>AMOUNT (₹)</th></tr></thead>
//             <tbody>
//               <tr><td>Basic Salary</td><td>₹${monthlySalary.toFixed(2)}</td><td>EPF</td><td>₹${epf.toFixed(2)}</td></tr>
//               <tr><td>House Rent Allowance</td><td>₹${hra.toFixed(2)}</td><td>ESI</td><td>₹${esi.toFixed(2)}</td></tr>
//               <tr><td>Travel Allowance</td><td>₹${travelAllowance.toFixed(2)}</td><td>Professional Tax</td><td>₹${professionalTax.toFixed(2)}</td></tr>
//               <tr><td>Medical Allowance</td><td>₹${medicalAllowance.toFixed(2)}</td><td>Income Tax</td><td>₹${incomeTax.toFixed(2)}</td></tr>
//               <tr><td>Basket of Benefits</td><td>₹${basketOfBenefits.toFixed(2)}</td><td>Salary Advance</td><td>₹${salaryAdvance.toFixed(2)}</td></tr>
//               <tr><td>Performance Bonus</td><td>₹${performanceBonus.toFixed(2)}</td><td>LOP</td><td>₹${lop.toFixed(2)}</td></tr>
//               <tr><td>Other Allowances</td><td>₹${otherAllowances.toFixed(2)}</td></tr>
//               <tr><td>Conveyance</td><td>₹${conveyance.toFixed(2)}</td></tr>
//               ${additionalPayments.map(payment =>
//                 `<tr><td>${payment.name}</td><td>₹${parseFloat(payment.value || 0).toFixed(2)}</td></tr>`
//               ).join('')}
//               <tr class="total-row">
//                 <td><strong>GROSS EARNINGS</strong></td>
//                 <td><strong>₹${totalEarnings.toFixed(2)}</strong></td>
//                 <td><strong>TOTAL DEDUCTIONS</strong></td>
//                 <td><strong>₹${totalDeductions.toFixed(2)}</strong></td>
//               </tr>
//             </tbody>
//           </table>

//           <div class="net-section">
//             <div>NET PAYABLE AMOUNT</div>
//             <div class="net-amount">₹${netPayable.toFixed(2)}</div>
//             <div class="words">Amount in words: Indian Rupees ${amountInWords} Only</div>
//           </div>

//           <div class="footer">This is a system-generated payslip. No signature required.<br>&copy; ${new Date().getFullYear()} Mychits. Confidential.</div>
//         </div>
//       </body>
//       </html>
//     `;

//       // --- FORMAT 2: Modern Gradient (Fixed for Preview) ---
//       const format2 = `
// <!DOCTYPE html>
// <html>
// <head>
// <style>
// @page { size: A4; margin: 12mm; }
// body {
//   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//   margin: 0;
//   color: #1a202c;
//   background: #ffffff;
//   padding: 0;
//   -webkit-print-color-adjust: exact;
//   print-color-adjust: exact;
// }
// .document {
//   background: #ffffff;
//   margin: 0 auto;
//   width: 100%;
//   min-height: 100vh;
//   box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//   padding: 0;
//   box-sizing: border-box;
//   overflow: hidden;
//   display: flex;
//   flex-direction: column;
// }
// .header-band {
//   background: #667eea;
//   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//   color: #fff;
//   padding: 20px;
// }
// .header-content {
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   gap: 20px;
// }
// .logo-circle {
//   width: 70px;
//   height: 70px;
//   background: rgba(255,255,255,0.2);
//   border-radius: 6px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
// }
// .logo-circle img {
//   width: 50px;
//   height: 50px;
//   border-radius: 4px;
// }
// .header-text { flex: 1; }
// .company-title {
//   font-size: 22px;
//   font-weight: 700;
//   margin-bottom: 4px;
// }
// .company-subtitle {
//   font-size: 11px;
//   opacity: 0.9;
//   line-height: 1.4;
// }
// .header-meta {
//   text-align: right;
//   background: rgba(255,255,255,0.15);
//   padding: 12px;
//   border-radius: 10px;
//   font-size: 11px;
// }
// .meta-line { margin: 2px 0; }
// .meta-value { font-weight: 400; }
// .content {
//   flex: 1;
//   padding: 20px;
//   background: #ffffff;
// }
// .payslip-title {
//   text-align: center;
//   font-size: 24px;
//   font-weight: 500;
//   color: #4a5568;
//   margin: 20px 0;
//   letter-spacing: 2px;
// }
// .card {
//   background: #fff;
//   border: 1px solid #e2e8f0;
//   border-radius: 10px;
//   margin-bottom: 20px;
//   overflow: hidden;
//   box-shadow: 0 1px 3px rgba(0,0,0,0.1);
// }
// .card-header {
//   background: #f7fafc;
//   padding: 12px;
//   border-bottom: 1px solid #e2e8f0;
//   font-weight: 600;
//   color: #4a5568;
// }
// .card-body { padding: 15px; }
// .info-grid {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 12px;
// }
// .info-pair {
//   display: flex;
//   justify-content: space-between;
//   padding: 6px 0;
//   border-bottom: 1px dotted #e2e8f0;
//   font-size: 12px;
// }
// .info-pair:last-child { border-bottom: none; }
// .salary-grid {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 20px;
// }
// .earnings-card { border-left: 4px solid #48bb78; }
// .deductions-card { border-left: 4px solid #f56565; }
// .item-row {
//   display: flex;
//   justify-content: space-between;
//   padding: 8px 0;
//   border-bottom: 1px solid #f7fafc;
//   font-size: 12px;
// }
// .item-row:last-child { border-bottom: 2px solid #e2e8f0; }
// .item-name { color: #4a5568; }
// .item-amount { color: #2d3748; font-weight: 600; }
// .total-amount {
//   background: #edf2f7;
//   padding: 10px;
//   border-radius: 6px;
//   font-weight: 700;
//   text-align: right;
// }
// .net-section {
//   background: #4299e1;
//   background: linear-gradient(135deg, #4299e1, #3182ce);
//   color: #fff;
//   padding: 20px;
//   border-radius: 10px;
//   text-align: center;
//   margin: 25px 0;
// }
// .net-title { font-size: 14px; margin-bottom: 8px; }
// .net-figure { font-size: 28px; font-weight: 500; margin-bottom: 10px; }
// .net-words { font-size: 11px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px; }
// .signature-section {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 20px;
//   margin-top: 15px;
// }
// .signature-line {
//   border-top: 1px solid #cbd5e0;
//   margin-top: 40px;
//   padding-top: 8px;
//   font-size: 11px;
//   color: #718096;
// }
// .footer-text {
//   text-align: center;
//   color: #a0aec0;
//   font-size: 9px;
//   margin: 25px 0;
// }
// @media print {
//   body { background: #fff; }
//   .document { box-shadow: none; page-break-after: avoid; }
// }
// </style>
// </head>
// <body>
// <div class="document">
//   <div class="header-band">
//     <div class="header-content">
//       <div class="logo-circle">
//         <img src="${imageInput}" alt="Logo">
//       </div>
//       <div class="header-text">
//         <div class="company-title">Mychits</div>
//         <div class="company-subtitle">No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</div>
//       </div>
//       <div class="header-meta">
//         <div class="meta-line">Payslip ID: <span class="meta-value">${payslipId}</span></div>
//         <div class="meta-line">Period: <span class="meta-value">${salaryMonth} ${salaryYear}</span></div>
//         <div class="meta-line">Date: <span class="meta-value">${formatDate(payDate)}</span></div>
//       </div>
//     </div>
//   </div>
//   <div class="content">
//     <div class="payslip-title">PAYSLIP</div>
//     <div class="card">
//       <div class="card-header">Employee Information</div>
//       <div class="card-body">
//         <div class="info-grid">
//           <div class="info-pair"><span>Employee Name</span><span>${agent?.name || "N/A"}</span></div>
//           <div class="info-pair"><span>Employee ID</span><span>${agent?.employeeCode || "N/A"}</span></div>
//           <div class="info-pair"><span>Designation</span><span>${agent?.designation_id?.title || "N/A"}</span></div>
//           <div class="info-pair"><span>Department</span><span>${agent?.department || "N/A"}</span></div>
//           <div class="info-pair"><span>Pay Period</span><span>${formatDate(fromDate)} to ${formatDate(toDate)}</span></div>
//           <div class="info-pair"><span>Payment Method</span><span>${payment.payment_method || "N/A"}</span></div>
//         </div>
//       </div>
//     </div>
//     <div class="salary-grid">
//       <div class="card earnings-card">
//         <div class="card-header" style="color: #48bb78;">Earnings</div>
//         <div class="card-body">
//           <div class="item-row"><div class="item-name">Basic Salary</div><div class="item-amount">₹${monthlySalary.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">HRA</div><div class="item-amount">₹${hra.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Travel Allowance</div><div class="item-amount">₹${travelAllowance.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Medical Allowance</div><div class="item-amount">₹${medicalAllowance.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Basket of Benefits</div><div class="item-amount">₹${basketOfBenefits.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Performance Bonus</div><div class="item-amount">₹${performanceBonus.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Other Allowances</div><div class="item-amount">₹${otherAllowances.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Conveyance</div><div class="item-amount">₹${conveyance.toFixed(2)}</div></div>
//           ${additionalPayments.map(payment =>
//             `<div class="item-row"><div class="item-name">${payment.name}</div><div class="item-amount">₹${parseFloat(payment.value || 0).toFixed(2)}</div></div>`
//           ).join('')}
//           <div class="total-amount">Total: ₹${totalEarnings.toFixed(2)}</div>
//         </div>
//       </div>
//       <div class="card deductions-card">
//         <div class="card-header" style="color: #f56565;">Deductions</div>
//         <div class="card-body">
//           <div class="item-row"><div class="item-name">Loss of Pay</div><div class="item-amount">₹${lop.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">EPF</div><div class="item-amount">₹${epf.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">ESI</div><div class="item-amount">₹${esi.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Professional Tax</div><div class="item-amount">₹${professionalTax.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Income Tax</div><div class="item-amount">₹${incomeTax.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Salary Advance</div><div class="item-amount">₹${salaryAdvance.toFixed(2)}</div></div>
//           <div class="total-amount">Total: ₹${totalDeductions.toFixed(2)}</div>
//         </div>
//       </div>
//     </div>
//     <div class="net-section">
//       <div class="net-title">Net Payable Amount</div>
//       <div class="net-figure">₹${netPayable.toFixed(2)}</div>
//       <div class="net-words">Amount in Words: Indian Rupees ${amountInWords} Only</div>
//     </div>
//     <div class="signature-section">
//       <div class="signature-line">Employee Signature</div>
//       <div class="signature-line">Authorized Signatory</div>
//     </div>
//     <div class="footer-text">
//       This is a computer generated payslip and does not require signature.<br>
//       &copy; ${new Date().getFullYear()} Mychits.
//     </div>
//   </div>
// </div>
// </body>
// </html>`;

//       return printFormat === "format1" ? format1 : format2;
//     } catch (err) {
//       console.error("Error generating salary slip content:", err);
//       return "<div>Error generating salary slip content</div>";
//     }
//   };

//   const handlePrint = () => {
//     try {
//       const htmlContent = generateSalarySlipContent();
//       const agent = payment.employee_id;
//       const salaryMonth = payment.salary_month;
//       const salaryYear = payment.salary_year;
//       const fileName = `${agent?.name || "Employee"}_${salaryMonth}_${salaryYear} Slip`;

//       const printWindow = window.open("", "_blank");
//       printWindow.document.write(htmlContent);
//       printWindow.document.title = fileName;
//       printWindow.document.close();
//       printWindow.print();
//     } catch (err) {
//       console.error("Error printing salary slip:", err);
//       alert("Failed to generate salary slip. Check console for details.");
//     }
//   };

// const handleDownloadPDF = async () => {
//   try {
//     setDownloading(true);
//     const element = previewRef.current;

//     const agent = payment.employee_id;
//     const salaryMonth = payment.salary_month;
//     const salaryYear = payment.salary_year;
//     const fileName = `${agent?.name || "Employee"}_${salaryMonth}_${salaryYear}_Payslip.pdf`;

//     // Create a hidden container to render the printable version
//     const printContainer = document.createElement('div');
//     printContainer.style.position = 'absolute';
//     printContainer.style.left = '-9999px';
//     printContainer.style.top = '-9999px';
//     printContainer.style.width = '210mm'; // A4 width
//     printContainer.style.padding = '10mm'; // Add padding as margin
//     printContainer.style.boxSizing = 'border-box';
//     printContainer.innerHTML = generatePrintableSalarySlipContent(); // Use a modified version for print
//     document.body.appendChild(printContainer);

//     // Capture canvas from the print container
//     const canvas = await html2canvas(printContainer, {
//       scale: 2, // Higher DPI for better quality
//       useCORS: true,
//       backgroundColor: "#ffffff",
//       width: 800, // Set a fixed width for consistent rendering
//       logging: false
//     });

//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "mm", "a4");

//     // Calculate dimensions for A4 page (210mm x 297mm)
//     const pageWidth = 210;
//     const pageHeight = 297;

//     // Calculate image dimensions based on A4 size and canvas aspect ratio
//     const imgWidth = pageWidth - 20; // Subtract 20mm for margins (10mm each side)
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;

//     let position = 0;
//     let heightLeft = imgHeight;

//     // Add first page
//     pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight); // Start at (10,10) for 10mm margin

//     // Add subsequent pages if needed
//     while (heightLeft > pageHeight - 20) { // -20 for top/bottom margins
//       position += pageHeight - 20;
//       heightLeft -= pageHeight - 20;
//       pdf.addPage();
//       pdf.addImage(imgData, "PNG", 10, 10 - position, imgWidth, imgHeight);
//     }

//     // Clean up
//     document.body.removeChild(printContainer);

//     pdf.save(fileName);
//   } catch (err) {
//     console.error("PDF error:", err);
//     alert("Failed to download PDF. Please try again.");
//   } finally {
//     setDownloading(false);
//   }
// };

// // Add this function to generate a printable version of the content
// const generatePrintableSalarySlipContent = () => {
//   try {
//     const agent = payment.employee_id;
//     const payslipId = payment._id;
//     const payDate = payment.pay_date || payment.createdAt;
//     const fromDate = payment.salary_from_date;
//     const toDate = payment.salary_to_date;
//     const salaryMonth = payment.salary_month;
//     const salaryYear = payment.salary_year;

//     const earnings = payment.earnings || {};
//     const deductions = payment.deductions || {};
//     const additionalPayments = payment.additional_payments || [];

//     const monthlySalary = parseFloat(earnings.basic || 0);
//     const hra = parseFloat(earnings.hra || 0);
//     const travelAllowance = parseFloat(earnings.travel_allowance || 0);
//     const medicalAllowance = parseFloat(earnings.medical_allowance || 0);
//     const basketOfBenefits = parseFloat(earnings.basket_of_benifits || 0);
//     const performanceBonus = parseFloat(earnings.performance_bonus || 0);
//     const otherAllowances = parseFloat(earnings.other_allowances || 0);
//     const conveyance = parseFloat(earnings.conveyance || 0);

//     const incomeTax = parseFloat(deductions.income_tax || 0);
//     const esi = parseFloat(deductions.esi || 0);
//     const epf = parseFloat(deductions.epf || 0);
//     const professionalTax = parseFloat(deductions.professional_tax || 0);
//     const salaryAdvance = parseFloat(deductions.salary_advance || 0);

//     const additionalPaymentsTotal = additionalPayments.reduce(
//       (sum, payment) => sum + parseFloat(payment.value || 0), 0
//     );

//     const totalEarnings = monthlySalary + hra + travelAllowance + medicalAllowance +
//                          basketOfBenefits + performanceBonus + otherAllowances +
//                          conveyance + additionalPaymentsTotal;

//     const totalDeductions = incomeTax + esi + epf + professionalTax + salaryAdvance;

//     const netPayable = parseFloat(payment.net_payable || 0);

//     const lop = totalEarnings - netPayable - totalDeductions;

//     const formatDate = (date) => {
//       if (!date) return "N/A";
//       return new Date(date).toLocaleDateString("en-IN", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//     };

//     const amountInWords = numToWords(netPayable);

//     // Generate the printable HTML content (using format1 style for consistency)
//     const printableContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <title>Salary Slip</title>
//         <style>
//           @page { size: A4; margin: 10mm; }
//           body {
//             font-family: 'Times New Roman', serif;
//             margin: 0;
//             color: #000;
//             background: #fff;
//             padding: 0;
//             box-sizing: border-box;
//           }
//           .container {
//             max-width: 200mm;
//             margin: 0 auto;
//             padding: 5mm;
//           }
//           .header {
//             border: 2px solid #000;
//             padding: 8px;
//             margin-bottom: 10px;
//             background: #f5f5f5;
//           }
//           .header-top {
//             display: flex;
//             align-items: center;
//             justify-content: space-between;
//             margin-bottom: 5px;
//           }
//           .logo {
//             width: 60px;
//             height: 60px;
//           }
//           .company-info {
//             text-align: center;
//             flex: 1;
//           }
//           .company-name {
//             font-size: 18px;
//             font-weight: bold;
//             margin: 2px 0;
//           }
//           .company-addr {
//             font-size: 8px;
//             margin: 1px 0;
//           }
//           .payslip-title {
//             text-align: center;
//             font-size: 16px;
//             font-weight: bold;
//             text-decoration: underline;
//             margin: 10px 0;
//           }
//           .meta-info {
//             text-align: right;
//             font-size: 10px;
//           }
//           .emp-details {
//             border: 1px solid #000;
//             margin: 10px 0;
//           }
//           .emp-header {
//             background: #000;
//             color: #fff;
//             padding: 5px;
//             font-weight: bold;
//             text-align: center;
//           }
//           .emp-grid {
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//           }
//           .emp-item {
//             padding: 5px;
//             border-right: 1px solid #000;
//             border-bottom: 1px solid #000;
//             font-size: 10px;
//           }
//           .emp-item:nth-child(even) {
//             border-right: none;
//           }
//           .salary-table {
//             width: 100%;
//             border: 1px solid #000;
//             border-collapse: collapse;
//             margin: 10px 0;
//           }
//           .salary-table th {
//             background: #000;
//             color: #fff;
//             padding: 5px;
//             border: 1px solid #000;
//             font-size: 10px;
//           }
//           .salary-table td {
//             padding: 5px;
//             border: 1px solid #000;
//             font-size: 10px;
//           }
//           .total-row {
//             background: #e0e0e0;
//             font-weight: bold;
//           }
//           .net-section {
//             border: 2px double #000;
//             padding: 10px;
//             text-align: center;
//             margin: 15px 0;
//             background: #f9f9f9;
//           }
//           .net-amount {
//             font-size: 18px;
//             font-weight: bold;
//             margin: 5px 0;
//           }
//           .words {
//             font-style: italic;
//             font-size: 8px;
//             margin-top: 5px;
//           }
//           .footer {
//             text-align: center;
//             font-size: 8px;
//             margin-top: 20px;
//             border-top: 1px solid #000;
//             padding-top: 5px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <div class="header-top">
//               <img src="${imageInput}" class="logo" alt="Logo">
//               <div class="company-info">
//                 <div class="company-name">Mychits</div>
//                 <div class="company-addr">No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</div>
//                 <div class="company-addr">CIN: U65999KA2022PTC161858</div>
//               </div>
//               <div class="meta-info">
//                 Payslip ID: <strong>${payslipId}</strong><br>
//                 Date: <strong>${new Date().toLocaleDateString()}</strong>
//               </div>
//             </div>
//             <div class="payslip-title">SALARY SLIP</div>
//           </div>

//           <div class="emp-details">
//             <div class="emp-header">EMPLOYEE DETAILS</div>
//             <div class="emp-grid">
//               <div class="emp-item"><strong>Name:</strong> ${agent?.name || "N/A"}</div>
//               <div class="emp-item"><strong>Employee ID:</strong> ${agent?.employeeCode || "N/A"}</div>
//               <div class="emp-item"><strong>Designation:</strong> ${agent?.designation_id?.title || "N/A"}</div>
//               <div class="emp-item"><strong>Department:</strong> ${agent?.department || "N/A"}</div>
//               <div class="emp-item"><strong>Pay Period:</strong> ${formatDate(fromDate)} to ${formatDate(toDate)}</div>
//               <div class="emp-item"><strong>Payment Date:</strong> ${formatDate(payDate)}</div>
//             </div>
//           </div>

//           <table class="salary-table">
//             <thead><tr><th>EARNINGS</th><th>AMOUNT (₹)</th><th>DEDUCTIONS</th><th>AMOUNT (₹)</th></tr></thead>
//             <tbody>
//               <tr><td>Basic Salary</td><td>₹${monthlySalary.toFixed(2)}</td><td>EPF</td><td>₹${epf.toFixed(2)}</td></tr>
//               <tr><td>House Rent Allowance</td><td>₹${hra.toFixed(2)}</td><td>ESI</td><td>₹${esi.toFixed(2)}</td></tr>
//               <tr><td>Travel Allowance</td><td>₹${travelAllowance.toFixed(2)}</td><td>Professional Tax</td><td>₹${professionalTax.toFixed(2)}</td></tr>
//               <tr><td>Medical Allowance</td><td>₹${medicalAllowance.toFixed(2)}</td><td>Income Tax</td><td>₹${incomeTax.toFixed(2)}</td></tr>
//               <tr><td>Basket of Benefits</td><td>₹${basketOfBenefits.toFixed(2)}</td><td>Salary Advance</td><td>₹${salaryAdvance.toFixed(2)}</td></tr>
//               <tr><td>Performance Bonus</td><td>₹${performanceBonus.toFixed(2)}</td><td>LOP</td><td>₹${lop.toFixed(2)}</td></tr>
//               <tr><td>Other Allowances</td><td>₹${otherAllowances.toFixed(2)}</td></tr>
//               <tr><td>Conveyance</td><td>₹${conveyance.toFixed(2)}</td></tr>
//               ${additionalPayments.map(payment =>
//                 `<tr><td>${payment.name}</td><td>₹${parseFloat(payment.value || 0).toFixed(2)}</td></tr>`
//               ).join('')}
//               <tr class="total-row">
//                 <td><strong>GROSS EARNINGS</strong></td>
//                 <td><strong>₹${totalEarnings.toFixed(2)}</strong></td>
//                 <td><strong>TOTAL DEDUCTIONS</strong></td>
//                 <td><strong>₹${totalDeductions.toFixed(2)}</strong></td>
//               </tr>
//             </tbody>
//           </table>

//           <div class="net-section">
//             <div>NET PAYABLE AMOUNT</div>
//             <div class="net-amount">₹${netPayable.toFixed(2)}</div>
//             <div class="words">Amount in words: Indian Rupees ${amountInWords} Only</div>
//           </div>

//           <div class="footer">This is a system-generated payslip. No signature required.<br>&copy; ${new Date().getFullYear()} Mychits. Confidential.</div>
//         </div>
//       </body>
//       </html>
//     `;

//     return printableContent;
//   } catch (err) {
//     console.error("Error generating printable content:", err);
//     return "<div>Error generating printable content</div>";
//   }
// };

//   const numToWords = (num) => {
//     if (isNaN(num) || num === 0) return "Zero";

//     const a = [
//       "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
//       "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
//     ];
//     const b = [
//       "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
//     ];

//     num = Math.round(num);
//     if ((num = num.toString()).length > 9) return "Overflow";

//     const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
//     if (!n) return "";

//     let str = "";
//     str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore " : "";
//     str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh " : "";
//     str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand " : "";
//     str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred " : "";
//     str += n[5] != 0 ? (str != "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) + " " : "";

//     return str.trim() || "Zero";
//   };

//   const formatButtons = [
//     { key: 'format1', label: 'Classic Professional', description: 'Traditional formal style' },
//     { key: 'format2', label: 'Modern Gradient', description: 'Contemporary colorful design' }
//   ];

//   return (
//     <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
//       {/* Format Selection Buttons */}
//       <Card className="shadow-lg border-0">
//         <div className="mb-4">
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Salary Slip Generator</h2>
//           <p className="text-gray-600">Select a format and preview your payslip</p>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {formatButtons.map((format) => (
//             <button
//               key={format.key}
//               onClick={() => setPrintFormat(format.key)}
//               className={`p-4 rounded-xl border-2 transition-all duration-300 ${
//                 printFormat === format.key
//                   ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
//                   : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
//               }`}
//             >
//               <div className="font-semibold text-lg mb-1">{format.label}</div>
//               <div className="text-sm text-gray-500">{format.description}</div>
//             </button>
//           ))}
//         </div>
//       </Card>

//       {/* Preview Section */}
//       <Card
//         title={`Preview: ${formatButtons.find(f => f.key === printFormat)?.label}`}
//         className="shadow-lg border-0"
//         extra={
//           <div className="flex gap-3">
//             <Button
//               type="primary"
//               icon={<PrinterOutlined />}
//               onClick={handlePrint}
//               className="bg-blue-600 hover:bg-blue-700"
//             >
//               Print
//             </Button>
//             <Button
//               type="primary"
//               icon={<DownloadOutlined />}
//               onClick={handleDownloadPDF}
//               loading={downloading}
//               className="bg-green-600 hover:bg-green-700"
//             >
//               Download PDF
//             </Button>
//           </div>
//         }
//       >
//         <div className="bg-gray-100 rounded-lg p-4">
//           <div
//             ref={previewRef}
//             className="bg-white rounded shadow-md overflow-auto"
//             style={{
//               height: '75vh',
//               transform: 'scale(0.85)',
//               transformOrigin: 'top left',
//               width: '117.65%' // 100 / 0.85 to compensate for scaling
//             }}
//           >
//             {previewContent ? (
//               <div dangerouslySetInnerHTML={{ __html: previewContent }} />
//             ) : (
//               <div className="flex items-center justify-center h-full">
//                 <Spin size="large" tip="Generating preview..." />
//               </div>
//             )}
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// const SalarySlipPrint = () => {
//   const params = useParams();
//   const paymentId = params.id || "";
//   const [printFormat, setPrintFormat] = useState("format1");
//   const [payment, setPayment] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [previewContent, setPreviewContent] = useState("");
//   const [downloading, setDownloading] = useState(false);
//   const previewRef = useRef(null);

//   // Fetch payment details when component mounts or paymentId changes
//   useEffect(() => {
//     if (!paymentId) {
//       setError("Payment ID is required");
//       return;
//     }

//     const fetchPaymentDetails = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const response = await api.get(`/salary-payment/${paymentId}`);
//         setPayment(response.data?.data);
//       } catch (err) {
//         console.error("Error fetching payment details:", err);
//         setError("Failed to fetch payment details. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPaymentDetails();
//   }, [paymentId]);

//   // Update preview when format or payment data changes
//   useEffect(() => {
//     if (payment) {
//       const content = generateSalarySlipContent();
//       setPreviewContent(content);
//     }
//   }, [printFormat, payment]);

//   if (loading) {
//     return <div className="flex justify-center p-4"><Spin size="large" /></div>;
//   }

//   if (error) {
//     return <div className="p-4"><Alert message={error} type="error" showIcon /></div>;
//   }

//   if (!payment || typeof payment !== "object" || !payment.employee_id) {
//     return <div className="p-4"><Alert message="Payment details not found" type="warning" showIcon /></div>;
//   }

//   const generateSalarySlipContent = () => {
//     try {
//       const agent = payment.employee_id;
//       console.info(agent, "test 123");
//       console.info(agent?.designation_id?.title, "test 124");
//       const payslipId = payment._id;
//       const payDate = payment.pay_date || payment.createdAt;
//       const fromDate = payment.salary_from_date;
//       const toDate = payment.salary_to_date;
//       const salaryMonth = payment.salary_month;
//       const salaryYear = payment.salary_year;

//       // Extract earnings and deductions from the payment data
//       const earnings = payment.earnings || {};
//       const deductions = payment.deductions || {};
//       const additionalPayments = payment.additional_payments || [];
//       const additionalDeductions = payment.additional_deductions || [];

//       // Calculate values
//       const monthlySalary = parseFloat(earnings.basic || 0);
//       const hra = parseFloat(earnings.hra || 0);
//       const travelAllowance = parseFloat(earnings.travel_allowance || 0);
//       const medicalAllowance = parseFloat(earnings.medical_allowance || 0);
//       const basketOfBenefits = parseFloat(earnings.basket_of_benifits || 0);
//       const performanceBonus = parseFloat(earnings.performance_bonus || 0);
//       const otherAllowances = parseFloat(earnings.other_allowances || 0);
//       const conveyance = parseFloat(earnings.conveyance || 0);

//       const incomeTax = parseFloat(deductions.income_tax || 0);
//       const esi = parseFloat(deductions.esi || 0);
//       const epf = parseFloat(deductions.epf || 0);
//       const professionalTax = parseFloat(deductions.professional_tax || 0);
//       const salaryAdvance = parseFloat(deductions.salary_advance || 0);

//       // Calculate additional payments total
//       const additionalPaymentsTotal = additionalPayments.reduce(
//         (sum, payment) => sum + parseFloat(payment.value || 0), 0
//       );

//       // Calculate additional deductions total
//       const additionalDeductionsTotal = additionalDeductions.reduce(
//         (sum, deduction) => sum + parseFloat(deduction.value || 0), 0
//       );

//       // Calculate total earnings and deductions
//       const totalEarnings = monthlySalary + hra + travelAllowance + medicalAllowance +
//                            basketOfBenefits + performanceBonus + otherAllowances +
//                            conveyance + additionalPaymentsTotal;

//       const totalDeductions = incomeTax + esi + epf + professionalTax + salaryAdvance + additionalDeductionsTotal;

//       const netPayable = parseFloat(payment.net_payable || 0);

//       // Calculate LOP (Loss of Pay)
//       const lop = totalEarnings - netPayable - totalDeductions;

//       // Format date
//       const formatDate = (date) => {
//         if (!date) return "N/A";
//         return new Date(date).toLocaleDateString("en-IN", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//         });
//       };

//       // Convert amount to words
//       const amountInWords = numToWords(netPayable);

//       // --- FORMAT 1: Classic Professional ---
//       const format1 = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//          <title>Salary Slip</title>
//         <style>
//           @page { size: A4; margin: 15mm; }
//           body { font-family: 'Times New Roman', serif; margin: 0; color: #000; background: #fff; }
//           .container { max-width: 800px; margin: 0 auto; }
//           .header { border: 3px solid #000; padding: 15px; margin-bottom: 20px; background: #f5f5f5; }
//           .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
//           .logo { width: 80px; height: 80px; }
//           .company-info { text-align: center; flex: 1; }
//           .company-name { font-size: 28px; font-weight: bold; margin: 5px 0; }
//           .company-addr { font-size: 11px; margin: 2px 0; }
//           .payslip-title { text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; margin: 15px 0; }
//           .meta-info { text-align: right; font-size: 12px; }
//           .emp-details { border: 2px solid #000; margin: 15px 0; }
//           .emp-header { background: #000; color: #fff; padding: 8px; font-weight: bold; text-align: center; }
//           .emp-grid { display: grid; grid-template-columns: 1fr 1fr; }
//           .emp-item { padding: 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 12px; }
//           .emp-item:nth-child(even) { border-right: none; }
//           .salary-table { width: 100%; border: 2px solid #000; border-collapse: collapse; margin: 15px 0; }
//           .salary-table th { background: #000; color: #fff; padding: 10px; border: 1px solid #000; font-size: 14px; }
//           .salary-table td { padding: 8px; border: 1px solid #000; font-size: 12px; }
//           .total-row { background: #e0e0e0; font-weight: bold; }
//           .net-section { border: 3px double #000; padding: 15px; text-align: center; margin: 20px 0; background: #f9f9f9; }
//           .net-amount { font-size: 24px; font-weight: bold; margin: 10px 0; }
//           .words { font-style: italic; font-size: 11px; margin-top: 10px; }
//           .footer { text-align: center; font-size: 10px; margin-top: 30px; border-top: 1px solid #000; padding-top: 10px; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <div class="header-top">
//               <img src="${imageInput}" class="logo" alt="Logo">
//               <div class="company-info">
//                 <div class="company-name">Mychits</div>
//                 <div class="company-addr">No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</div>
//                 <div class="company-addr">CIN: U65999KA2022PTC161858</div>
//               </div>
//               <div class="meta-info">
//                 Payslip ID: <strong>${payslipId}</strong><br>
//                 Date: <strong>${new Date().toLocaleDateString()}</strong>
//               </div>
//             </div>
//             <div class="payslip-title">SALARY SLIP</div>
//           </div>

//           <div class="emp-details">
//             <div class="emp-header">EMPLOYEE DETAILS</div>
//             <div class="emp-grid">
//               <div class="emp-item"><strong>Name:</strong> ${agent?.name || "N/A"}</div>
//               <div class="emp-item"><strong>Employee ID:</strong> ${agent?.employeeCode || "N/A"}</div>
//               <div class="emp-item"><strong>Designation:</strong> ${agent?.designation_id?.title || "N/A"}</div>
//               <div class="emp-item"><strong>Department:</strong> ${agent?.department || "N/A"}</div>
//               <div class="emp-item"><strong>Pay Period:</strong> ${formatDate(fromDate)} to ${formatDate(toDate)}</div>
//               <div class="emp-item"><strong>Payment Date:</strong> ${formatDate(payDate)}</div>
//             </div>
//           </div>

//           <table class="salary-table">
//             <thead><tr><th>EARNINGS</th><th>AMOUNT (₹)</th><th>DEDUCTIONS</th><th>AMOUNT (₹)</th></tr></thead>
//             <tbody>
//               <tr><td>Basic Salary</td><td>₹${monthlySalary.toFixed(2)}</td><td>EPF</td><td>₹${epf.toFixed(2)}</td></tr>
//               <tr><td>House Rent Allowance</td><td>₹${hra.toFixed(2)}</td><td>ESI</td><td>₹${esi.toFixed(2)}</td></tr>
//               <tr><td>Travel Allowance</td><td>₹${travelAllowance.toFixed(2)}</td><td>Professional Tax</td><td>₹${professionalTax.toFixed(2)}</td></tr>
//               <tr><td>Medical Allowance</td><td>₹${medicalAllowance.toFixed(2)}</td><td>Income Tax</td><td>₹${incomeTax.toFixed(2)}</td></tr>
//               <tr><td>Basket of Benefits</td><td>₹${basketOfBenefits.toFixed(2)}</td><td>Salary Advance</td><td>₹${salaryAdvance.toFixed(2)}</td></tr>
//               <tr><td>Performance Bonus</td><td>₹${performanceBonus.toFixed(2)}</td><td>LOP</td><td>₹${lop.toFixed(2)}</td></tr>
//               <tr><td>Other Allowances</td><td>₹${otherAllowances.toFixed(2)}</td></tr>
//               <tr><td>Conveyance</td><td>₹${conveyance.toFixed(2)}</td></tr>
//               ${additionalPayments.map(payment =>
//                 `<tr><td>${payment.name}</td><td>₹${parseFloat(payment.value || 0).toFixed(2)}</td></tr>`
//               ).join('')}
//               ${additionalDeductions.map(deduction =>
//                 `<tr><td></td><td></td><td>${deduction.name}</td><td>₹${parseFloat(deduction.value || 0).toFixed(2)}</td></tr>`
//               ).join('')}
//               <tr class="total-row">
//                 <td><strong>GROSS EARNINGS</strong></td>
//                 <td><strong>₹${totalEarnings.toFixed(2)}</strong></td>
//                 <td><strong>TOTAL DEDUCTIONS</strong></td>
//                 <td><strong>₹${totalDeductions.toFixed(2)}</strong></td>
//               </tr>
//             </tbody>
//           </table>

//           <div class="net-section">
//             <div>NET PAYABLE AMOUNT</div>
//             <div class="net-amount">₹${netPayable.toFixed(2)}</div>
//             <div class="words">Amount in words: Indian Rupees ${amountInWords} Only</div>
//           </div>

//           <div class="footer">This is a system-generated payslip. No signature required.<br>&copy; ${new Date().getFullYear()} Mychits. Confidential.</div>
//         </div>
//       </body>
//       </html>
//     `;

//       // --- FORMAT 2: Modern Gradient (Fixed for Preview) ---
//       const format2 = `
// <!DOCTYPE html>
// <html>
// <head>
// <style>
// @page { size: A4; margin: 12mm; }
// body {
//   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//   margin: 0;
//   color: #1a202c;
//   background: #ffffff;
//   padding: 0;
//   -webkit-print-color-adjust: exact;
//   print-color-adjust: exact;
// }
// .document {
//   background: #ffffff;
//   margin: 0 auto;
//   width: 100%;
//   min-height: 100vh;
//   box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//   padding: 0;
//   box-sizing: border-box;
//   overflow: hidden;
//   display: flex;
//   flex-direction: column;
// }
// .header-band {
//   background: #667eea;
//   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//   color: #fff;
//   padding: 20px;
// }
// .header-content {
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   gap: 20px;
// }
// .logo-circle {
//   width: 70px;
//   height: 70px;
//   background: rgba(255,255,255,0.2);
//   border-radius: 6px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
// }
// .logo-circle img {
//   width: 50px;
//   height: 50px;
//   border-radius: 4px;
// }
// .header-text { flex: 1; }
// .company-title {
//   font-size: 22px;
//   font-weight: 700;
//   margin-bottom: 4px;
// }
// .company-subtitle {
//   font-size: 11px;
//   opacity: 0.9;
//   line-height: 1.4;
// }
// .header-meta {
//   text-align: right;
//   background: rgba(255,255,255,0.15);
//   padding: 12px;
//   border-radius: 10px;
//   font-size: 11px;
// }
// .meta-line { margin: 2px 0; }
// .meta-value { font-weight: 400; }
// .content {
//   flex: 1;
//   padding: 20px;
//   background: #ffffff;
// }
// .payslip-title {
//   text-align: center;
//   font-size: 24px;
//   font-weight: 500;
//   color: #4a5568;
//   margin: 20px 0;
//   letter-spacing: 2px;
// }
// .card {
//   background: #fff;
//   border: 1px solid #e2e8f0;
//   border-radius: 10px;
//   margin-bottom: 20px;
//   overflow: hidden;
//   box-shadow: 0 1px 3px rgba(0,0,0,0.1);
// }
// .card-header {
//   background: #f7fafc;
//   padding: 12px;
//   border-bottom: 1px solid #e2e8f0;
//   font-weight: 600;
//   color: #4a5568;
// }
// .card-body { padding: 15px; }
// .info-grid {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 12px;
// }
// .info-pair {
//   display: flex;
//   justify-content: space-between;
//   padding: 6px 0;
//   border-bottom: 1px dotted #e2e8f0;
//   font-size: 12px;
// }
// .info-pair:last-child { border-bottom: none; }
// .salary-grid {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 20px;
// }
// .earnings-card { border-left: 4px solid #48bb78; }
// .deductions-card { border-left: 4px solid #f56565; }
// .item-row {
//   display: flex;
//   justify-content: space-between;
//   padding: 8px 0;
//   border-bottom: 1px solid #f7fafc;
//   font-size: 12px;
// }
// .item-row:last-child { border-bottom: 2px solid #e2e8f0; }
// .item-name { color: #4a5568; }
// .item-amount { color: #2d3748; font-weight: 600; }
// .total-amount {
//   background: #edf2f7;
//   padding: 10px;
//   border-radius: 6px;
//   font-weight: 700;
//   text-align: right;
// }
// .net-section {
//   background: #4299e1;
//   background: linear-gradient(135deg, #4299e1, #3182ce);
//   color: #fff;
//   padding: 20px;
//   border-radius: 10px;
//   text-align: center;
//   margin: 25px 0;
// }
// .net-title { font-size: 14px; margin-bottom: 8px; }
// .net-figure { font-size: 28px; font-weight: 500; margin-bottom: 10px; }
// .net-words { font-size: 11px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px; }
// .signature-section {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 20px;
//   margin-top: 15px;
// }
// .signature-line {
//   border-top: 1px solid #cbd5e0;
//   margin-top: 40px;
//   padding-top: 8px;
//   font-size: 11px;
//   color: #718096;
// }
// .footer-text {
//   text-align: center;
//   color: #a0aec0;
//   font-size: 9px;
//   margin: 25px 0;
// }
// @media print {
//   body { background: #fff; }
//   .document { box-shadow: none; page-break-after: avoid; }
// }
// </style>
// </head>
// <body>
// <div class="document">
//   <div class="header-band">
//     <div class="header-content">
//       <div class="logo-circle">
//         <img src="${imageInput}" alt="Logo">
//       </div>
//       <div class="header-text">
//         <div class="company-title">Mychits</div>
//         <div class="company-subtitle">No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</div>
//       </div>
//       <div class="header-meta">
//         <div class="meta-line">Payslip ID: <span class="meta-value">${payslipId}</span></div>
//         <div class="meta-line">Period: <span class="meta-value">${salaryMonth} ${salaryYear}</span></div>
//         <div class="meta-line">Date: <span class="meta-value">${formatDate(payDate)}</span></div>
//       </div>
//     </div>
//   </div>
//   <div class="content">
//     <div class="payslip-title">PAYSLIP</div>
//     <div class="card">
//       <div class="card-header">Employee Information</div>
//       <div class="card-body">
//         <div class="info-grid">
//           <div class="info-pair"><span>Employee Name</span><span>${agent?.name || "N/A"}</span></div>
//           <div class="info-pair"><span>Employee ID</span><span>${agent?.employeeCode || "N/A"}</span></div>
//           <div class="info-pair"><span>Designation</span><span>${agent?.designation_id?.title || "N/A"}</span></div>
//           <div class="info-pair"><span>Department</span><span>${agent?.department || "N/A"}</span></div>
//           <div class="info-pair"><span>Pay Period</span><span>${formatDate(fromDate)} to ${formatDate(toDate)}</span></div>
//           <div class="info-pair"><span>Payment Method</span><span>${payment.payment_method || "N/A"}</span></div>
//         </div>
//       </div>
//     </div>
//     <div class="salary-grid">
//       <div class="card earnings-card">
//         <div class="card-header" style="color: #48bb78;">Earnings</div>
//         <div class="card-body">
//           <div class="item-row"><div class="item-name">Basic Salary</div><div class="item-amount">₹${monthlySalary.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">HRA</div><div class="item-amount">₹${hra.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Travel Allowance</div><div class="item-amount">₹${travelAllowance.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Medical Allowance</div><div class="item-amount">₹${medicalAllowance.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Basket of Benefits</div><div class="item-amount">₹${basketOfBenefits.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Performance Bonus</div><div class="item-amount">₹${performanceBonus.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Other Allowances</div><div class="item-amount">₹${otherAllowances.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Conveyance</div><div class="item-amount">₹${conveyance.toFixed(2)}</div></div>
//           ${additionalPayments.map(payment =>
//             `<div class="item-row"><div class="item-name">${payment.name}</div><div class="item-amount">₹${parseFloat(payment.value || 0).toFixed(2)}</div></div>`
//           ).join('')}
//           <div class="total-amount">Total: ₹${totalEarnings.toFixed(2)}</div>
//         </div>
//       </div>
//       <div class="card deductions-card">
//         <div class="card-header" style="color: #f56565;">Deductions</div>
//         <div class="card-body">
//           <div class="item-row"><div class="item-name">Loss of Pay</div><div class="item-amount">₹${lop.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">EPF</div><div class="item-amount">₹${epf.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">ESI</div><div class="item-amount">₹${esi.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Professional Tax</div><div class="item-amount">₹${professionalTax.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Income Tax</div><div class="item-amount">₹${incomeTax.toFixed(2)}</div></div>
//           <div class="item-row"><div class="item-name">Salary Advance</div><div class="item-amount">₹${salaryAdvance.toFixed(2)}</div></div>
//           ${additionalDeductions.map(deduction =>
//             `<div class="item-row"><div class="item-name">${deduction.name}</div><div class="item-amount">₹${parseFloat(deduction.value || 0).toFixed(2)}</div></div>`
//           ).join('')}
//           <div class="total-amount">Total: ₹${totalDeductions.toFixed(2)}</div>
//         </div>
//       </div>
//     </div>
//     <div class="net-section">
//       <div class="net-title">Net Payable Amount</div>
//       <div class="net-figure">₹${netPayable.toFixed(2)}</div>
//       <div class="net-words">Amount in Words: Indian Rupees ${amountInWords} Only</div>
//     </div>
//     <div class="signature-section">
//       <div class="signature-line">Employee Signature</div>
//       <div class="signature-line">Authorized Signatory</div>
//     </div>
//     <div class="footer-text">
//       This is a computer generated payslip and does not require signature.<br>
//       &copy; ${new Date().getFullYear()} Mychits.
//     </div>
//   </div>
// </div>
// </body>
// </html>`;

//       return printFormat === "format1" ? format1 : format2;
//     } catch (err) {
//       console.error("Error generating salary slip content:", err);
//       return "<div>Error generating salary slip content</div>";
//     }
//   };

//   const handlePrint = () => {
//     try {
//       const htmlContent = generateSalarySlipContent();
//       const agent = payment.employee_id;
//       const salaryMonth = payment.salary_month;
//       const salaryYear = payment.salary_year;
//       const fileName = `${agent?.name || "Employee"}_${salaryMonth}_${salaryYear} Slip`;

//       const printWindow = window.open("", "_blank");
//       printWindow.document.write(htmlContent);
//       printWindow.document.title = fileName;
//       printWindow.document.close();
//       printWindow.print();
//     } catch (err) {
//       console.error("Error printing salary slip:", err);
//       alert("Failed to generate salary slip. Check console for details.");
//     }
//   };

// const handleDownloadPDF = async () => {
//   try {
//     setDownloading(true);
//     const element = previewRef.current;

//     const agent = payment.employee_id;
//     const salaryMonth = payment.salary_month;
//     const salaryYear = payment.salary_year;
//     const fileName = `${agent?.name || "Employee"}_${salaryMonth}_${salaryYear}_Payslip.pdf`;

//     // Create a hidden container to render the printable version
//     const printContainer = document.createElement('div');
//     printContainer.style.position = 'absolute';
//     printContainer.style.left = '-9999px';
//     printContainer.style.top = '-9999px';
//     printContainer.style.width = '210mm'; // A4 width
//     printContainer.style.padding = '10mm'; // Add padding as margin
//     printContainer.style.boxSizing = 'border-box';
//     printContainer.innerHTML = generatePrintableSalarySlipContent(); // Use a modified version for print
//     document.body.appendChild(printContainer);

//     // Capture canvas from the print container
//     const canvas = await html2canvas(printContainer, {
//       scale: 2, // Higher DPI for better quality
//       useCORS: true,
//       backgroundColor: "#ffffff",
//       width: 800, // Set a fixed width for consistent rendering
//       logging: false
//     });

//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "mm", "a4");

//     // Calculate dimensions for A4 page (210mm x 297mm)
//     const pageWidth = 210;
//     const pageHeight = 297;

//     // Calculate image dimensions based on A4 size and canvas aspect ratio
//     const imgWidth = pageWidth - 20; // Subtract 20mm for margins (10mm each side)
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;

//     let position = 0;
//     let heightLeft = imgHeight;

//     // Add first page
//     pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight); // Start at (10,10) for 10mm margin

//     // Add subsequent pages if needed
//     while (heightLeft > pageHeight - 20) { // -20 for top/bottom margins
//       position += pageHeight - 20;
//       heightLeft -= pageHeight - 20;
//       pdf.addPage();
//       pdf.addImage(imgData, "PNG", 10, 10 - position, imgWidth, imgHeight);
//     }

//     // Clean up
//     document.body.removeChild(printContainer);

//     pdf.save(fileName);
//   } catch (err) {
//     console.error("PDF error:", err);
//     alert("Failed to download PDF. Please try again.");
//   } finally {
//     setDownloading(false);
//   }
// };

// // Add this function to generate a printable version of the content
// const generatePrintableSalarySlipContent = () => {
//   try {
//     const agent = payment.employee_id;
//     const payslipId = payment._id;
//     const payDate = payment.pay_date || payment.createdAt;
//     const fromDate = payment.salary_from_date;
//     const toDate = payment.salary_to_date;
//     const salaryMonth = payment.salary_month;
//     const salaryYear = payment.salary_year;

//     const earnings = payment.earnings || {};
//     const deductions = payment.deductions || {};
//     const additionalPayments = payment.additional_payments || [];
//     const additionalDeductions = payment.additional_deductions || [];

//     const monthlySalary = parseFloat(earnings.basic || 0);
//     const hra = parseFloat(earnings.hra || 0);
//     const travelAllowance = parseFloat(earnings.travel_allowance || 0);
//     const medicalAllowance = parseFloat(earnings.medical_allowance || 0);
//     const basketOfBenefits = parseFloat(earnings.basket_of_benifits || 0);
//     const performanceBonus = parseFloat(earnings.performance_bonus || 0);
//     const otherAllowances = parseFloat(earnings.other_allowances || 0);
//     const conveyance = parseFloat(earnings.conveyance || 0);

//     const incomeTax = parseFloat(deductions.income_tax || 0);
//     const esi = parseFloat(deductions.esi || 0);
//     const epf = parseFloat(deductions.epf || 0);
//     const professionalTax = parseFloat(deductions.professional_tax || 0);
//     const salaryAdvance = parseFloat(deductions.salary_advance || 0);

//     const additionalPaymentsTotal = additionalPayments.reduce(
//       (sum, payment) => sum + parseFloat(payment.value || 0), 0
//     );

//     const additionalDeductionsTotal = additionalDeductions.reduce(
//       (sum, deduction) => sum + parseFloat(deduction.value || 0), 0
//     );

//     const totalEarnings = monthlySalary + hra + travelAllowance + medicalAllowance +
//                          basketOfBenefits + performanceBonus + otherAllowances +
//                          conveyance + additionalPaymentsTotal;

//     const totalDeductions = incomeTax + esi + epf + professionalTax + salaryAdvance + additionalDeductionsTotal;

//     const netPayable = parseFloat(payment.net_payable || 0);

//     const lop = totalEarnings - netPayable - totalDeductions;

//     const formatDate = (date) => {
//       if (!date) return "N/A";
//       return new Date(date).toLocaleDateString("en-IN", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//     };

//     const amountInWords = numToWords(netPayable);

//     // Generate the printable HTML content (using format1 style for consistency)
//     const printableContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <title>Salary Slip</title>
//         <style>
//           @page { size: A4; margin: 10mm; }
//           body {
//             font-family: 'Times New Roman', serif;
//             margin: 0;
//             color: #000;
//             background: #fff;
//             padding: 0;
//             box-sizing: border-box;
//           }
//           .container {
//             max-width: 200mm;
//             margin: 0 auto;
//             padding: 5mm;
//           }
//           .header {
//             border: 2px solid #000;
//             padding: 8px;
//             margin-bottom: 10px;
//             background: #f5f5f5;
//           }
//           .header-top {
//             display: flex;
//             align-items: center;
//             justify-content: space-between;
//             margin-bottom: 5px;
//           }
//           .logo {
//             width: 60px;
//             height: 60px;
//           }
//           .company-info {
//             text-align: center;
//             flex: 1;
//           }
//           .company-name {
//             font-size: 18px;
//             font-weight: bold;
//             margin: 2px 0;
//           }
//           .company-addr {
//             font-size: 8px;
//             margin: 1px 0;
//           }
//           .payslip-title {
//             text-align: center;
//             font-size: 16px;
//             font-weight: bold;
//             text-decoration: underline;
//             margin: 10px 0;
//           }
//           .meta-info {
//             text-align: right;
//             font-size: 10px;
//           }
//           .emp-details {
//             border: 1px solid #000;
//             margin: 10px 0;
//           }
//           .emp-header {
//             background: #000;
//             color: #fff;
//             padding: 5px;
//             font-weight: bold;
//             text-align: center;
//           }
//           .emp-grid {
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//           }
//           .emp-item {
//             padding: 5px;
//             border-right: 1px solid #000;
//             border-bottom: 1px solid #000;
//             font-size: 10px;
//           }
//           .emp-item:nth-child(even) {
//             border-right: none;
//           }
//           .salary-table {
//             width: 100%;
//             border: 1px solid #000;
//             border-collapse: collapse;
//             margin: 10px 0;
//           }
//           .salary-table th {
//             background: #000;
//             color: #fff;
//             padding: 5px;
//             border: 1px solid #000;
//             font-size: 10px;
//           }
//           .salary-table td {
//             padding: 5px;
//             border: 1px solid #000;
//             font-size: 10px;
//           }
//           .total-row {
//             background: #e0e0e0;
//             font-weight: bold;
//           }
//           .net-section {
//             border: 2px double #000;
//             padding: 10px;
//             text-align: center;
//             margin: 15px 0;
//             background: #f9f9f9;
//           }
//           .net-amount {
//             font-size: 18px;
//             font-weight: bold;
//             margin: 5px 0;
//           }
//           .words {
//             font-style: italic;
//             font-size: 8px;
//             margin-top: 5px;
//           }
//           .footer {
//             text-align: center;
//             font-size: 8px;
//             margin-top: 20px;
//             border-top: 1px solid #000;
//             padding-top: 5px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <div class="header-top">
//               <img src="${imageInput}" class="logo" alt="Logo">
//               <div class="company-info">
//                 <div class="company-name">Mychits</div>
//                 <div class="company-addr">No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</div>
//                 <div class="company-addr">CIN: U65999KA2022PTC161858</div>
//               </div>
//               <div class="meta-info">
//                 Payslip ID: <strong>${payslipId}</strong><br>
//                 Date: <strong>${new Date().toLocaleDateString()}</strong>
//               </div>
//             </div>
//             <div class="payslip-title">SALARY SLIP</div>
//           </div>

//           <div class="emp-details">
//             <div class="emp-header">EMPLOYEE DETAILS</div>
//             <div class="emp-grid">
//               <div class="emp-item"><strong>Name:</strong> ${agent?.name || "N/A"}</div>
//               <div class="emp-item"><strong>Employee ID:</strong> ${agent?.employeeCode || "N/A"}</div>
//               <div class="emp-item"><strong>Designation:</strong> ${agent?.designation_id?.title || "N/A"}</div>
//               <div class="emp-item"><strong>Department:</strong> ${agent?.department || "N/A"}</div>
//               <div class="emp-item"><strong>Pay Period:</strong> ${formatDate(fromDate)} to ${formatDate(toDate)}</div>
//               <div class="emp-item"><strong>Payment Date:</strong> ${formatDate(payDate)}</div>
//             </div>
//           </div>

//           <table class="salary-table">
//             <thead><tr><th>EARNINGS</th><th>AMOUNT (₹)</th><th>DEDUCTIONS</th><th>AMOUNT (₹)</th></tr></thead>
//             <tbody>
//               <tr><td>Basic Salary</td><td>₹${monthlySalary.toFixed(2)}</td><td>EPF</td><td>₹${epf.toFixed(2)}</td></tr>
//               <tr><td>House Rent Allowance</td><td>₹${hra.toFixed(2)}</td><td>ESI</td><td>₹${esi.toFixed(2)}</td></tr>
//               <tr><td>Travel Allowance</td><td>₹${travelAllowance.toFixed(2)}</td><td>Professional Tax</td><td>₹${professionalTax.toFixed(2)}</td></tr>
//               <tr><td>Medical Allowance</td><td>₹${medicalAllowance.toFixed(2)}</td><td>Income Tax</td><td>₹${incomeTax.toFixed(2)}</td></tr>
//               <tr><td>Basket of Benefits</td><td>₹${basketOfBenefits.toFixed(2)}</td><td>Salary Advance</td><td>₹${salaryAdvance.toFixed(2)}</td></tr>
//               <tr><td>Performance Bonus</td><td>₹${performanceBonus.toFixed(2)}</td><td>LOP</td><td>₹${lop.toFixed(2)}</td></tr>
//               <tr><td>Other Allowances</td><td>₹${otherAllowances.toFixed(2)}</td></tr>
//               <tr><td>Conveyance</td><td>₹${conveyance.toFixed(2)}</td></tr>
//               ${additionalPayments.map(payment =>
//                 `<tr><td>${payment.name}</td><td>₹${parseFloat(payment.value || 0).toFixed(2)}</td></tr>`
//               ).join('')}
//               ${additionalDeductions.map(deduction =>
//                 `<tr><td></td><td></td><td>${deduction.name}</td><td>₹${parseFloat(deduction.value || 0).toFixed(2)}</td></tr>`
//               ).join('')}
//               <tr class="total-row">
//                 <td><strong>GROSS EARNINGS</strong></td>
//                 <td><strong>₹${totalEarnings.toFixed(2)}</strong></td>
//                 <td><strong>TOTAL DEDUCTIONS</strong></td>
//                 <td><strong>₹${totalDeductions.toFixed(2)}</strong></td>
//               </tr>
//             </tbody>
//           </table>

//           <div class="net-section">
//             <div>NET PAYABLE AMOUNT</div>
//             <div class="net-amount">₹${netPayable.toFixed(2)}</div>
//             <div class="words">Amount in words: Indian Rupees ${amountInWords} Only</div>
//           </div>

//           <div class="footer">This is a system-generated payslip. No signature required.<br>&copy; ${new Date().getFullYear()} Mychits. Confidential.</div>
//         </div>
//       </body>
//       </html>
//     `;

//     return printableContent;
//   } catch (err) {
//     console.error("Error generating printable content:", err);
//     return "<div>Error generating printable content</div>";
//   }
// };

//   const numToWords = (num) => {
//     if (isNaN(num) || num === 0) return "Zero";

//     const a = [
//       "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
//       "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
//     ];
//     const b = [
//       "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
//     ];

//     num = Math.round(num);
//     if ((num = num.toString()).length > 9) return "Overflow";

//     const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
//     if (!n) return "";

//     let str = "";
//     str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore " : "";
//     str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh " : "";
//     str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand " : "";
//     str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred " : "";
//     str += n[5] != 0 ? (str != "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) + " " : "";

//     return str.trim() || "Zero";
//   };

//   const formatButtons = [
//     { key: 'format1', label: 'Classic Professional', description: 'Traditional formal style' },
//     { key: 'format2', label: 'Modern Gradient', description: 'Contemporary colorful design' }
//   ];

//   return (
//     <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
//       {/* Format Selection Buttons */}
//       <Card className="shadow-lg border-0">
//         <div className="mb-4">
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Salary Slip Generator</h2>
//           <p className="text-gray-600">Select a format and preview your payslip</p>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {formatButtons.map((format) => (
//             <button
//               key={format.key}
//               onClick={() => setPrintFormat(format.key)}
//               className={`p-4 rounded-xl border-2 transition-all duration-300 ${
//                 printFormat === format.key
//                   ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
//                   : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
//               }`}
//             >
//               <div className="font-semibold text-lg mb-1">{format.label}</div>
//               <div className="text-sm text-gray-500">{format.description}</div>
//             </button>
//           ))}
//         </div>
//       </Card>

//       {/* Preview Section */}
//       <Card
//         title={`Preview: ${formatButtons.find(f => f.key === printFormat)?.label}`}
//         className="shadow-lg border-0"
//         extra={
//           <div className="flex gap-3">
//             <Button
//               type="primary"
//               icon={<PrinterOutlined />}
//               onClick={handlePrint}
//               className="bg-blue-600 hover:bg-blue-700"
//             >
//               Print
//             </Button>
//             <Button
//               type="primary"
//               icon={<DownloadOutlined />}
//               onClick={handleDownloadPDF}
//               loading={downloading}
//               className="bg-green-600 hover:bg-green-700"
//             >
//               Download PDF
//             </Button>
//           </div>
//         }
//       >
//         <div className="bg-gray-100 rounded-lg p-4">
//           <div
//             ref={previewRef}
//             className="bg-white rounded shadow-md overflow-auto"
//             style={{
//               height: '75vh',
//               transform: 'scale(0.85)',
//               transformOrigin: 'top left',
//               width: '117.65%' // 100 / 0.85 to compensate for scaling
//             }}
//           >
//             {previewContent ? (
//               <div dangerouslySetInnerHTML={{ __html: previewContent }} />
//             ) : (
//               <div className="flex items-center justify-center h-full">
//                 <Spin size="large" tip="Generating preview..." />
//               </div>
//             )}
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

const SalarySlipPrint = () => {
  const params = useParams();
  const paymentId = params.id || "";
  const [printFormat, setPrintFormat] = useState("format1");
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef(null);

  // Fetch payment details when component mounts or paymentId changes
  useEffect(() => {
    if (!paymentId) {
      setError("Payment ID is required");
      return;
    }

    const fetchPaymentDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/salary-payment/${paymentId}`);
        setPayment(response.data?.data);
        console.info(response.data?.data, "gfjhdsfgjhsdfgjhsdfggf");
      } catch (err) {
        console.error("Error fetching payment details:", err);
        setError("Failed to fetch payment details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  // Update preview when format or payment data changes
  useEffect(() => {
    if (payment) {
      const content = generateSalarySlipContent();
      setPreviewContent(content);
    }
  }, [printFormat, payment]);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

  if (!payment || typeof payment !== "object" || !payment.employee_id) {
    return (
      <div className="p-4">
        <Alert message="Payment details not found" type="warning" showIcon />
      </div>
    );
  }

  //   const generateSalarySlipContent = () => {
  //     try {
  //       const agent = payment.employee_id;
  //       console.info(agent, "test 123");
  //       console.info(agent?.designation_id?.title, "test 124");
  //       const payslipId = payment._id;
  //       const payDate = payment.pay_date || payment.createdAt;
  //       const fromDate = payment.salary_from_date;
  //       const toDate = payment.salary_to_date;
  //       console.info(fromDate, "fromdate");
  //       console.info(toDate, "todate");
  //       const salaryMonth = payment.salary_month;
  //       const salaryYear = payment.salary_year;
  //       const lossOfPay = payment?.lop_days;
  //       const presentPay = payment?.paid_days;

  //       // Extract earnings and deductions from the payment data
  //       const earnings = payment.earnings || {};
  //       const deductions = payment.deductions || {};
  //       const additionalPayments = payment.additional_payments || [];
  //       const additionalDeductions = payment.additional_deductions || [];

  //       // Calculate values
  //       const monthlySalary = parseFloat(earnings.basic || 0);
  //       const hra = parseFloat(earnings.hra || 0);
  //       const travelAllowance = parseFloat(earnings.travel_allowance || 0);
  //       const medicalAllowance = parseFloat(earnings.medical_allowance || 0);
  //       const basketOfBenefits = parseFloat(earnings.basket_of_benifits || 0);
  //       const performanceBonus = parseFloat(earnings.performance_bonus || 0);
  //       const otherAllowances = parseFloat(earnings.other_allowances || 0);
  //       const conveyance = parseFloat(earnings.conveyance || 0);

  //       const incomeTax = parseFloat(deductions.income_tax || 0);
  //       const esi = parseFloat(deductions.esi || 0);
  //       const epf = parseFloat(deductions.epf || 0);
  //       const professionalTax = parseFloat(deductions.professional_tax || 0);
  //       const salaryAdvance = parseFloat(deductions.salary_advance || 0);

  //       // Calculate additional payments total
  //       const additionalPaymentsTotal = additionalPayments.reduce(
  //         (sum, payment) => sum + parseFloat(payment.value || 0),
  //         0
  //       );

  //       // Calculate additional deductions total
  //       const additionalDeductionsTotal = additionalDeductions.reduce(
  //         (sum, deduction) => sum + parseFloat(deduction.value || 0),
  //         0
  //       );

  //       // Calculate total earnings and deductions
  //       const totalEarnings =
  //         monthlySalary +
  //         hra +
  //         travelAllowance +
  //         medicalAllowance +
  //         basketOfBenefits +
  //         performanceBonus +
  //         otherAllowances +
  //         conveyance +
  //         additionalPaymentsTotal;
  //       const lopaddcal =
  //         monthlySalary +
  //         hra +
  //         travelAllowance +
  //         medicalAllowance +
  //         basketOfBenefits +
  //         performanceBonus +
  //         otherAllowances +
  //         conveyance;
  //       const lop =
  //         (lopaddcal / (parseFloat(lossOfPay) + parseFloat(presentPay))) *
  //           parseFloat(lossOfPay) || 0;
  //       // console.info(lop, "fhjdfgjhdfgjhfdgdf check123");
  //       const totalDeductions =
  //         incomeTax +
  //         esi +
  //         epf +
  //         professionalTax +
  //         salaryAdvance +
  //         additionalDeductionsTotal +
  //         lop;

  //       const netPayable = parseFloat(payment?.paid_amount || 0);
  //       let deduct = 0;
  //       let addition = 0;
  //       console.info(netPayable);
  //       if (netPayable > totalEarnings) {
  //         // If netPayable is greater than totalEarnings, calculate the amount to deduct
  //         deduct = netPayable - totalEarnings;
  //       } else if (netPayable > totalDeductions) {
  //         // If netPayable is greater than totalDeductions, calculate the amount to add
  //         addition = netPayable - totalDeductions;
  //       }

  //       // Set paidAmount based on the condition
  //       const paidAmount = deduct > 0 ? deduct : addition;

  //       // Calculate LOP (Loss of Pay)

  //       // Format date
  //       const formatDate = (date) => {
  //         if (!date) return "N/A";
  //         return new Date(date).toLocaleDateString("en-IN", {
  //           year: "numeric",
  //           month: "short",
  //           day: "numeric",
  //           timeZone: "UTC",
  //         });
  //       };

  //       // Convert amount to words
  //       const amountInWords = numToWords(paidAmount);

  //       // --- FORMAT 1: Classic Professional ---
  //       const format1 = `
  //       <!DOCTYPE html>
  //       <html>
  //       <head>
  //         <meta charset="UTF-8">
  //          <title>Salary Slip</title>
  //         <style>
  //           @page { size: A4; margin: 15mm; }
  //           body { font-family: 'Times New Roman', serif; margin: 0; color: #000; background: #fff; }
  //           .container { max-width: 800px; margin: 0 auto; }
  //           .header { border: 3px solid #000; padding: 15px; margin-bottom: 20px; background: #f5f5f5; }
  //           .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  //           .logo { width: 80px; height: 80px; }
  //           .company-info { text-align: center; flex: 1; }
  //           .company-name { font-size: 28px; font-weight: bold; margin: 5px 0; }
  //           .company-addr { font-size: 11px; margin: 2px 0; }
  //           .payslip-title { text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; margin: 15px 0; }
  //           .meta-info { text-align: right; font-size: 12px; }
  //           .emp-details { border: 2px solid #000; margin: 15px 0; }
  //           .emp-header { background: #000; color: #fff; padding: 8px; font-weight: bold; text-align: center; }
  //           .emp-grid { display: grid; grid-template-columns: 1fr 1fr; }
  //           .emp-item { padding: 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 12px; }
  //           .emp-item:nth-child(even) { border-right: none; }
  //           .salary-table { width: 100%; border: 2px solid #000; border-collapse: collapse; margin: 15px 0; }
  //           .salary-table th { background: #000; color: #fff; padding: 10px; border: 1px solid #000; font-size: 14px; }
  //           .salary-table td { padding: 8px; border: 1px solid #000; font-size: 12px; }
  //           .total-row { background: #e0e0e0; font-weight: bold; }
  //           .net-section { border: 3px double #000; padding: 15px; text-align: center; margin: 20px 0; background: #f9f9f9; }
  //           .net-amount { font-size: 24px; font-weight: bold; margin: 10px 0; }
  //           .words { font-style: italic; font-size: 11px; margin-top: 10px; }
  //           .footer { text-align: center; font-size: 10px; margin-top: 30px; border-top: 1px solid #000; padding-top: 10px; }
  //           .sub-header { background: #f0f0f0; font-weight: bold; text-align: center; }
  //           .sub-header td { border-right: none; border-left: none; }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="container">
  //           <div class="header">
  //             <div class="header-top">
  //               <img src="${imageInput}" class="logo" alt="Logo">
  //               <div class="company-info">
  //                 <div class="company-name">Mychits</div>
  //                 <div class="company-addr">No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</div>
  //                 <div class="company-addr">CIN: U65999KA2022PTC161858</div>
  //               </div>
  //               <div class="meta-info">

  //                 Date: <strong>${new Date().toLocaleDateString()}</strong>
  //               </div>
  //             </div>
  //             <div class="payslip-title">SALARY SLIP</div>
  //           </div>

  //           <div class="emp-details">
  //             <div class="emp-header">EMPLOYEE DETAILS</div>
  //             <div class="emp-grid">
  //               <div class="emp-item"><strong>Name:</strong> ${
  //                 agent?.name || "N/A"
  //               }</div>
  //               <div class="emp-item"><strong>Employee ID:</strong> ${
  //                 agent?.employeeCode || "N/A"
  //               }</div>
  //               <div class="emp-item"><strong>Designation:</strong> ${
  //                 agent?.designation_id?.title || "N/A"
  //               }</div>
  //               <div class="emp-item"><strong>Department:</strong> ${
  //                 agent?.department || "N/A"
  //               }</div>
  //               <div class="emp-item"><strong>Pay Period:</strong> ${formatDate(
  //                 fromDate
  //               )} to ${formatDate(toDate)}</div>
  //               <div class="emp-item"><strong>Payment Date:</strong> ${formatDate(
  //                 payDate
  //               )}</div>
  //             </div>
  //           </div>

  //         <table class="salary-table">
  //   <thead>
  //     <tr>
  //       <th>EARNINGS</th>
  //       <th>AMOUNT (₹)</th>
  //       <th>DEDUCTIONS</th>
  //       <th>AMOUNT (₹)</th>
  //     </tr>
  //   </thead>
  //   <tbody>

  //     <!-- BASE EARNINGS + DEDUCTIONS -->
  //     <tr>
  //       <td>Basic Salary</td><td>₹${monthlySalary.toFixed(2)}</td>
  //       <td>EPF</td><td>₹${epf.toFixed(2)}</td>
  //     </tr>

  //     <tr>
  //       <td>House Rent Allowance</td><td>₹${hra.toFixed(2)}</td>
  //       <td>ESI</td><td>₹${esi.toFixed(2)}</td>
  //     </tr>

  //     <tr>
  //       <td>Travel Allowance</td><td>₹${travelAllowance.toFixed(2)}</td>
  //       <td>Professional Tax</td><td>₹${professionalTax.toFixed(2)}</td>
  //     </tr>

  //     <tr>
  //       <td>Medical Allowance</td><td>₹${medicalAllowance.toFixed(2)}</td>
  //       <td>Income Tax</td><td>₹${incomeTax.toFixed(2)}</td>
  //     </tr>

  //     <tr>
  //       <td>Basket of Benefits</td><td>₹${basketOfBenefits.toFixed(2)}</td>
  //       <td>Salary Advance</td><td>₹${salaryAdvance.toFixed(2)}</td>
  //     </tr>

  //     <tr>
  //       <td>Performance Bonus</td><td>₹${performanceBonus.toFixed(2)}</td>
  //       <td>LOP</td><td>₹${lop.toFixed(2)}</td>
  //     </tr>
  //     <tr>
  //   <td>
  //     ${(() => {
  //       const totalExtraPayments = additionalPayments.reduce(
  //         (sum, p) => sum + parseFloat(p.value || 0),
  //         0
  //       );

  //       // If no extra values, return empty string
  //       if (totalExtraPayments === 0) return "";

  //       return totalExtraPayments > 0 ? "Others" : "";
  //     })()}
  //   </td>
  //   <td>
  //     ${(() => {
  //       const totalExtraPayments = additionalPayments.reduce(
  //         (sum, p) => sum + parseFloat(p.value || 0),
  //         0
  //       );

  //       // If no extra values, return empty string
  //       if (totalExtraPayments === 0) return "";

  //       return totalExtraPayments > 0 ? `₹${totalExtraPayments.toFixed(2)}` : "";
  //     })()}
  //   </td>
  //   <td>
  //     ${(() => {
  //       const totalExtraDeductions = additionalDeductions.reduce(
  //         (sum, p) => sum + parseFloat(p.value || 0),
  //         0
  //       );

  //       // If no extra values, return empty string
  //       if (totalExtraDeductions === 0) return "";

  //       return totalExtraDeductions > 0 ? "Others" : "";
  //     })()}
  //   </td>
  //   <td>
  //     ${(() => {
  //       const totalExtraDeductions = additionalDeductions.reduce(
  //         (sum, p) => sum + parseFloat(p.value || 0),
  //         0
  //       );

  //       // If no extra values, return empty string
  //       if (totalExtraDeductions === 0) return "";

  //       return totalExtraDeductions > 0
  //         ? `₹${totalExtraDeductions.toFixed(2)}`
  //         : "";
  //     })()}
  //   </td>
  // </tr>

  //    <tr>
  //   <td>Other Allowances</td>
  //   <td>₹${otherAllowances.toFixed(2)}</td>

  // </tr>

  //     <tr>
  //       <td>Conveyance</td><td>₹${conveyance.toFixed(2)}</td>
  //       <td></td><td></td>
  //     </tr>

  //     <!-- ⭐ MERGED SUM OF ADDITIONAL PAYMENTS + DEDUCTIONS -->

  //     <!-- TOTALS -->
  //     <tr class="total-row">
  //       <td><strong>GROSS EARNINGS</strong></td>
  //       <td><strong>₹${totalEarnings.toFixed(2)}</strong></td>
  //       <td><strong>TOTAL DEDUCTIONS</strong></td>
  //       <td><strong>₹${totalDeductions.toFixed(2)}</strong></td>
  //     </tr>

  //   </tbody>
  // </table>

  //           <div class="net-section">
  //             <div>NET PAID AMOUNT</div>
  //             <div class="net-amount">₹${paidAmount.toFixed(2)}</div>
  //             <div class="words">Amount in words: Indian Rupees ${amountInWords} Only</div>
  //           </div>

  //           <div class="footer">This is a system-generated payslip. No signature required.<br>&copy; ${new Date().getFullYear()} Mychits. Confidential.</div>
  //         </div>
  //       </body>
  //       </html>
  //     `;

  //       // --- FORMAT 2: Modern Gradient (Fixed for Preview) ---
  //       const format2 = `
  // <!DOCTYPE html>
  // <html>
  // <head>
  // <style>
  // @page { size: A4; margin: 12mm; }
  // body {
  //   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  //   margin: 0;
  //   color: #1a202c;
  //   background: #ffffff;
  //   padding: 0;
  //   -webkit-print-color-adjust: exact;
  //   print-color-adjust: exact;
  // }
  // .document {
  //   background: #ffffff;
  //   margin: 0 auto;
  //   width: 100%;
  //   min-height: 100vh;
  //   box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  //   padding: 0;
  //   box-sizing: border-box;
  //   overflow: hidden;
  //   display: flex;
  //   flex-direction: column;
  // }
  // .header-band {
  //   background: #667eea;
  //   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  //   color: #fff;
  //   padding: 20px;
  // }
  // .header-content {
  //   display: flex;
  //   align-items: center;
  //   justify-content: space-between;
  //   gap: 20px;
  // }
  // .logo-circle {
  //   width: 70px;
  //   height: 70px;
  //   background: rgba(255,255,255,0.2);
  //   border-radius: 6px;
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  // }
  // .logo-circle img {
  //   width: 50px;
  //   height: 50px;
  //   border-radius: 4px;
  // }
  // .header-text { flex: 1; }
  // .company-title {
  //   font-size: 22px;
  //   font-weight: 700;
  //   margin-bottom: 4px;
  // }
  // .company-subtitle {
  //   font-size: 11px;
  //   opacity: 0.9;
  //   line-height: 1.4;
  // }
  // .header-meta {
  //   text-align: right;
  //   background: rgba(255,255,255,0.15);
  //   padding: 12px;
  //   border-radius: 10px;
  //   font-size: 11px;
  // }
  // .meta-line { margin: 2px 0; }
  // .meta-value { font-weight: 400; }
  // .content {
  //   flex: 1;
  //   padding: 20px;
  //   background: #ffffff;
  // }
  // .payslip-title {
  //   text-align: center;
  //   font-size: 24px;
  //   font-weight: 500;
  //   color: #4a5568;
  //   margin: 20px 0;
  //   letter-spacing: 2px;
  // }
  // .card {
  //   background: #fff;
  //   border: 1px solid #e2e8f0;
  //   border-radius: 10px;
  //   margin-bottom: 20px;
  //   overflow: hidden;
  //   box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  // }
  // .card-header {
  //   background: #f7fafc;
  //   padding: 12px;
  //   border-bottom: 1px solid #e2e8f0;
  //   font-weight: 600;
  //   color: #4a5568;
  // }
  // .card-body { padding: 15px; }
  // .info-grid {
  //   display: grid;
  //   grid-template-columns: 1fr 1fr;
  //   gap: 12px;
  // }
  // .info-pair {
  //   display: flex;
  //   justify-content: space-between;
  //   padding: 6px 0;
  //   border-bottom: 1px dotted #e2e8f0;
  //   font-size: 12px;
  // }
  // .info-pair:last-child { border-bottom: none; }
  // .salary-grid {
  //   display: grid;
  //   grid-template-columns: 1fr 1fr;
  //   gap: 20px;
  // }
  // .earnings-card { border-left: 4px solid #48bb78; }
  // .deductions-card { border-left: 4px solid #f56565; }
  // .item-row {
  //   display: flex;
  //   justify-content: space-between;
  //   padding: 8px 0;
  //   border-bottom: 1px solid #f7fafc;
  //   font-size: 12px;
  // }
  // .item-row:last-child { border-bottom: 2px solid #e2e8f0; }
  // .item-name { color: #4a5568; }
  // .item-amount { color: #2d3748; font-weight: 600; }
  // .total-amount {
  //   background: #edf2f7;
  //   padding: 10px;
  //   border-radius: 6px;
  //   font-weight: 700;
  //   text-align: right;
  // }
  // .net-section {
  //   background: #4299e1;
  //   background: linear-gradient(135deg, #4299e1, #3182ce);
  //   color: #fff;
  //   padding: 20px;
  //   border-radius: 10px;
  //   text-align: center;
  //   margin: 25px 0;
  // }
  // .net-title { font-size: 14px; margin-bottom: 8px; }
  // .net-figure { font-size: 28px; font-weight: 500; margin-bottom: 10px; }
  // .net-words { font-size: 11px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px; }
  // .signature-section {
  //   display: grid;
  //   grid-template-columns: 1fr 1fr;
  //   gap: 20px;
  //   margin-top: 15px;
  // }
  // .signature-line {
  //   border-top: 1px solid #cbd5e0;
  //   margin-top: 40px;
  //   padding-top: 8px;
  //   font-size: 11px;
  //   color: #718096;
  // }
  // .footer-text {
  //   text-align: center;
  //   color: #a0aec0;
  //   font-size: 9px;
  //   margin: 25px 0;
  // }
  // .sub-header {
  //   background: #f0f0f0;
  //   font-weight: bold;
  //   text-align: center;
  //   padding: 6px 0;
  //   margin-top: 10px;
  //   border-radius: 4px;
  // }
  // @media print {
  //   body { background: #fff; }
  //   .document { box-shadow: none; page-break-after: avoid; }
  // }
  // </style>
  // </head>
  // <body>
  // <div class="document">
  //   <div class="header-band">
  //     <div class="header-content">
  //       <div class="logo-circle">
  //         <img src="${imageInput}" alt="Logo">
  //       </div>
  //       <div class="header-text">
  //         <div class="company-title">Mychits</div>
  //         <div class="company-subtitle">No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</div>
  //       </div>
  //       <div class="header-meta">
  //         <div class="meta-line">Payslip ID: <span class="meta-value">${payslipId}</span></div>
  //         <div class="meta-line">Period: <span class="meta-value">${salaryMonth} ${salaryYear}</span></div>
  //         <div class="meta-line">Date: <span class="meta-value">${formatDate(
  //           payDate
  //         )}</span></div>
  //       </div>
  //     </div>
  //   </div>
  //   <div class="content">
  //     <div class="payslip-title">PAYSLIP</div>
  //     <div class="card">
  //       <div class="card-header">Employee Information</div>
  //       <div class="card-body">
  //         <div class="info-grid">
  //           <div class="info-pair"><span>Employee Name</span><span>${
  //             agent?.name || "N/A"
  //           }</span></div>
  //           <div class="info-pair"><span>Employee ID</span><span>${
  //             agent?.employeeCode || "N/A"
  //           }</span></div>
  //           <div class="info-pair"><span>Designation</span><span>${
  //             agent?.designation_id?.title || "N/A"
  //           }</span></div>
  //           <div class="info-pair"><span>Department</span><span>${
  //             agent?.department || "N/A"
  //           }</span></div>
  //           <div class="info-pair"><span>Pay Period</span><span>${formatDate(
  //             fromDate
  //           )} to ${formatDate(toDate)}</span></div>
  //           <div class="info-pair"><span>Payment Method</span><span>${
  //             payment.payment_method || "N/A"
  //           }</span></div>
  //         </div>
  //       </div>
  //     </div>
  //     <div class="salary-grid">
  //       <div class="card earnings-card">
  //         <div class="card-header" style="color: #48bb78;">Earnings</div>
  //         <div class="card-body">
  //           <div class="item-row"><div class="item-name">Basic Salary</div><div class="item-amount">₹${monthlySalary.toFixed(
  //             2
  //           )}</div></div>
  //           <div class="item-row"><div class="item-name">HRA</div><div class="item-amount">₹${hra.toFixed(
  //             2
  //           )}</div></div>
  //           <div class="item-row"><div class="item-name">Travel Allowance</div><div class="item-amount">₹${travelAllowance.toFixed(
  //             2
  //           )}</div></div>
  //           <div class="item-row"><div class="item-name">Medical Allowance</div><div class="item-amount">₹${medicalAllowance.toFixed(
  //             2
  //           )}</div></div>
  //           <div class="item-row"><div class="item-name">Basket of Benefits</div><div class="item-amount">₹${basketOfBenefits.toFixed(
  //             2
  //           )}</div></div>
  //           <div class="item-row"><div class="item-name">Performance Bonus</div><div class="item-amount">₹${performanceBonus.toFixed(
  //             2
  //           )}</div></div>

  //           <div class="item-row"><div class="item-name">Other Allowances</div><div class="item-amount">₹${otherAllowances.toFixed(
  //             2
  //           )}</div></div>
  //           <div class="item-row"><div class="item-name">Conveyance</div><div class="item-amount">₹${conveyance.toFixed(
  //             2
  //           )}</div></div>
  //           ${
  //             additionalPayments.length > 0
  //               ? `<div class="sub-header">Additional Payments</div>`
  //               : ""
  //           }
  //           ${additionalPayments
  //             .map(
  //               (payment) =>
  //                 `<div class="item-row"><div class="item-name">Others</div><div class="item-amount">₹${parseFloat(
  //                   payment.value || 0
  //                 ).toFixed(2)}</div></div>`
  //             )
  //             .join("")}
  //           <div class="total-amount">Total: ₹${totalEarnings.toFixed(2)}</div>
  //         </div>
  //       </div>
  //       <div class="card deductions-card">
  //         <div class="card-header" style="color: #f56565;">Deductions</div>
  //         <div class="card-body">
  //           <div class="item-row"><div class="item-name">Loss of Pay</div><div class="item-amount">₹${lop.toFixed(
  //             2
  //           )}</div></div>
  //           <div class="item-row"><div class="item-name">EPF</div><div class="item-amount">₹${epf.toFixed(
  //             2
  //           )}</div></div>
  //           <div class="item-row"><div class="item-name">ESI</div><div class="item-amount">₹${esi.toFixed(
  //             2
  //           )}</div></div>
  //           <div class="item-row"><div class="item-name">Professional Tax</div><div class="item-amount">₹${professionalTax.toFixed(
  //             2
  //           )}</div></div>
  //           <div class="item-row"><div class="item-name">Income Tax</div><div class="item-amount">₹${incomeTax.toFixed(
  //             2
  //           )}</div></div>
  //           <div class="item-row"><div class="item-name">Salary Advance</div><div class="item-amount">₹${salaryAdvance.toFixed(
  //             2
  //           )}</div></div>
  //           ${
  //             additionalDeductions.length > 0
  //               ? `<div class="sub-header">Additional Deductions</div>`
  //               : ""
  //           }
  //           ${additionalDeductions
  //             .map(
  //               (deduction) =>
  //                 `<div class="item-row"><div class="item-name">Others</div><div class="item-amount">₹${parseFloat(
  //                   deduction.value || 0
  //                 ).toFixed(2)}</div></div>`
  //             )
  //             .join("")}
  //           <div class="total-amount">Total: ₹${totalDeductions.toFixed(2)}</div>
  //         </div>
  //       </div>
  //     </div>
  //     <div class="net-section">
  //       <div class="net-title">Net Paid Amount</div>
  //       <div class="net-figure">₹${netPayable.toFixed(2)}</div>
  //       <div class="net-words">Amount in Words: Indian Rupees ${amountInWords} Only</div>
  //     </div>
  //     <div class="signature-section">
  //       <div class="signature-line">Employee Signature</div>
  //       <div class="signature-line">Authorized Signatory</div>
  //     </div>
  //     <div class="footer-text">
  //       This is a computer generated payslip and does not require signature.<br>
  //       &copy; ${new Date().getFullYear()} Mychits.
  //     </div>
  //   </div>
  // </div>
  // </body>
  // </html>`;

  //       return printFormat === "format1" ? format1 : format2;
  //     } catch (err) {
  //       console.error("Error generating salary slip content:", err);
  //       return "<div>Error generating salary slip content</div>";
  //     }
  //   };

  const generateSalarySlipContent = () => {
    try {
      console.info();
      const agent = payment.employee_id;
      console.info(agent, "test 123");
      console.info(agent?.designation_id?.title, "test 124");

      const payslipId = payment._id;
      const payDate = payment.pay_date || payment.createdAt;
      const fromDate = payment.salary_from_date;
      const toDate = payment.salary_to_date;

      const salaryMonth = payment.salary_month;
      const salaryYear = payment.salary_year;

      const lossOfPay = Number(payment?.attendance_details?.lop_days || 0);
      console.info(lossOfPay, "loss of pay");
      const presentPay = Number(payment?.attendance_details?.paid_days || 0);
      console.info(presentPay, "present of pay");
      const earnings = payment.earnings || {};
      const deductions = payment.deductions || {};
      const additionalPayments = payment.additional_payments || [];
      const additionalDeductions = payment.additional_deductions || [];
      console.info(additionalDeductions, "testing adjustment");

      // ================= EARNINGS =================
      const monthlySalary = Number(earnings.basic || 0);
      const hra = Number(earnings.hra || 0);
      const travelAllowance = Number(earnings.travel_allowance || 0);
      const medicalAllowance = Number(earnings.medical_allowance || 0);
      const basketOfBenefits = Number(earnings.basket_of_benifits || 0);
      const performanceBonus = Number(earnings.performance_bonus || 0);
      const otherAllowances = Number(earnings.other_allowances || 0);
      const conveyance = Number(earnings.conveyance || 0);

      // ================= DEDUCTIONS =================
      const incomeTax = Number(deductions.income_tax || 0);
      const esi = Number(deductions.esi || 0);
      const epf = Number(deductions.epf || 0);
      const professionalTax = Number(deductions.professional_tax || 0);
      const salaryAdvance = Number(deductions.salary_advance || 0);

      // ================= ADDITIONALS =================
      const additionalPaymentsTotal = additionalPayments.reduce(
        (sum, p) => sum + Number(p.value || 0),
        0
      );

      // ================= TOTAL EARNINGS =================
      const fixedEarningsTotal =
        monthlySalary +
        hra +
        travelAllowance +
        medicalAllowance +
        basketOfBenefits +
        performanceBonus +
        otherAllowances +
        conveyance;
      console.info(fixedEarningsTotal, "total earning");

      // const totalEarnings = fixedEarningsTotal + additionalPaymentsTotal;
      const totalEarnings = fixedEarningsTotal;

      // ================= LOP =================
      const lop =
        lossOfPay > 0 && presentPay + lossOfPay > 0
          ? (fixedEarningsTotal / (presentPay + lossOfPay)) * lossOfPay
          : 0;
      const totalDeductions =
        incomeTax + esi + epf + professionalTax + salaryAdvance + lop;
      // let paidAmount = Number(payment?.paid_amount || 0);

      // if(paidAmount > (fixedEarningsTotal - totalDeductions) ){
      //  paidAmount = fixedEarningsTotal - totalDeductions
      // }

    const originalPaidAmount = Number(payment?.paid_amount || 0);
const netSalary = totalEarnings - totalDeductions;

const paidAmount = Math.min(originalPaidAmount, netSalary);

// Differences
const underPaidAmount = Math.max(netSalary - originalPaidAmount, 0);
const excessPaid = Math.max(originalPaidAmount - netSalary, 0);
const totalOtherEarnings = totalEarnings + excessPaid;
const totalOtherDeduction = totalDeductions + underPaidAmount;

      const additionalDeductionsTotal = additionalDeductions.reduce(
        (sum, d) => sum + Number(d.value || 0),
        0
      );

      // ================= UTIL =================
      const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        });
      };

      const amountInWords = numToWords(originalPaidAmount);

      // ================= FORMAT 1 =================
      const format1 = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
         <title>Salary Slip</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Times New Roman', serif; margin: 0; color: #000; background: #fff; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { border: 3px solid #000; padding: 15px; margin-bottom: 20px; background: #f5f5f5; }
          .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
          .logo { width: 80px; height: 80px; }
          .company-info { text-align: center; flex: 1; }
          .company-name { font-size: 28px; font-weight: bold; margin: 5px 0; }
          .company-addr { font-size: 11px; margin: 2px 0; }
          .payslip-title { text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; margin: 15px 0; }
          .meta-info { text-align: right; font-size: 12px; }
          .emp-details { border: 2px solid #000; margin: 15px 0; }
          .emp-header { background: #000; color: #fff; padding: 8px; font-weight: bold; text-align: center; }
          .emp-grid { display: grid; grid-template-columns: 1fr 1fr; }
          .emp-item { padding: 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 12px; }
          .emp-item:nth-child(even) { border-right: none; }
          .salary-table { width: 100%; border: 2px solid #000; border-collapse: collapse; margin: 15px 0; }
          .salary-table th { background: #000; color: #fff; padding: 10px; border: 1px solid #000; font-size: 14px; }
          .salary-table td { padding: 8px; border: 1px solid #000; font-size: 12px; }
          .total-row { background: #e0e0e0; font-weight: bold; }
          .net-section { border: 3px double #000; padding: 15px; text-align: center; margin: 20px 0; background: #f9f9f9; }
          .net-amount { font-size: 24px; font-weight: bold; margin: 10px 0; }
          .words { font-style: italic; font-size: 11px; margin-top: 10px; }
          .footer { text-align: center; font-size: 10px; margin-top: 30px; border-top: 1px solid #000; padding-top: 10px; }
          .sub-header { background: #f0f0f0; font-weight: bold; text-align: center; }
          .sub-header td { border-right: none; border-left: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-top">
              <img src="${imageInput}" class="logo" alt="Logo">
              <div class="company-info">
                <div class="company-name">Mychits</div>
                <div class="company-addr">No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</div>
                <div class="company-addr">CIN: U65999KA2022PTC161858</div>
              </div>
              <div class="meta-info">
              
                Date: <strong>${new Date().toLocaleDateString()}</strong>
              </div>
            </div>
            <div class="payslip-title">SALARY SLIP</div>
          </div>

          <div class="emp-details">
            <div class="emp-header">EMPLOYEE DETAILS</div>
            <div class="emp-grid">
              <div class="emp-item"><strong>Name:</strong> ${
                agent?.name || "N/A"
              }</div>
              <div class="emp-item"><strong>Employee ID:</strong> ${
                agent?.employeeCode || "N/A"
              }</div>
              <div class="emp-item"><strong>Designation:</strong> ${
                agent?.designation_id?.title || "N/A"
              }</div>
              <div class="emp-item"><strong>Department:</strong> ${
                agent?.department || "N/A"
              }</div>
              <div class="emp-item"><strong>Pay Period:</strong> ${formatDate(
                fromDate
              )} to ${formatDate(toDate)}</div>
              <div class="emp-item"><strong>Payment Date:</strong> ${formatDate(
                payDate
              )}</div>
            </div>
          </div>

        <table class="salary-table">
  <thead>
    <tr>
      <th>EARNINGS</th>
      <th>AMOUNT (₹)</th>
      <th>DEDUCTIONS</th>
      <th>AMOUNT (₹)</th>
    </tr>
  </thead>
  <tbody>

    <!-- BASE EARNINGS + DEDUCTIONS -->
    <tr>
      <td>Basic Salary</td><td>₹${monthlySalary.toFixed(2)}</td>
      <td>EPF</td><td>₹${epf.toFixed(2)}</td>
    </tr>

    <tr>
      <td>House Rent Allowance</td><td>₹${hra.toFixed(2)}</td>
      <td>ESI</td><td>₹${esi.toFixed(2)}</td>
    </tr>

    <tr>
      <td>Travel Allowance</td><td>₹${travelAllowance.toFixed(2)}</td>
      <td>Professional Tax</td><td>₹${professionalTax.toFixed(2)}</td>
    </tr>

    <tr>
      <td>Medical Allowance</td><td>₹${medicalAllowance.toFixed(2)}</td>
      <td>Income Tax</td><td>₹${incomeTax.toFixed(2)}</td>
    </tr>

    <tr>
      <td>Basket of Benefits</td><td>₹${basketOfBenefits.toFixed(2)}</td>
      <td>Salary Advance</td><td>₹${salaryAdvance.toFixed(2)}</td>
    </tr>

    <tr>
      <td>Performance Bonus</td><td>₹${performanceBonus.toFixed(2)}</td>
      <td>LOP</td><td>₹${lop.toFixed(2)}</td>
    </tr>
   <tr>
  <td>Other Allowances</td>
  <td>₹${otherAllowances.toFixed(2)}</td>
  <td>Others</td>
 <td>

₹${underPaidAmount > 0 ? underPaidAmount.toFixed(2) : "0.00"}

</td>

</tr>


    <tr>
      <td>Conveyance</td><td>₹${conveyance.toFixed(2)}</td>
      <td></td><td></td>
    </tr>
    <tr>
    <td>Others</td>
    <td>


₹${excessPaid > 0 ? excessPaid.toFixed(2) : "0.00"}


</td>
    </tr>

    <!-- ⭐ MERGED SUM OF ADDITIONAL PAYMENTS + DEDUCTIONS -->
    

    <!-- TOTALS -->
    <tr class="total-row">
      <td><strong>GROSS EARNINGS</strong></td>
      <td><strong>₹${totalOtherEarnings.toFixed(2)}</strong></td>
      <td><strong>TOTAL DEDUCTIONS</strong></td>
      <td><strong>₹${totalOtherDeduction.toFixed(2)}</strong></td>
    </tr>

  </tbody>
</table>



          <div class="net-section">
            <div>NET PAID AMOUNT</div>
            <div class="net-amount">₹${originalPaidAmount.toFixed(2)}</div>
            <div class="words">Amount in words: Indian Rupees ${amountInWords} Only</div>
          </div>

          <div class="footer">This is a system-generated payslip. No signature required.<br>&copy; ${new Date().getFullYear()} Mychits. Confidential.</div>
        </div>
      </body>
      </html>
    `;

      // ================= FORMAT 2 (FIXED) =================
      const format2 = format1.replace(
        `₹${paidAmount.toFixed(2)}`,
        `₹${paidAmount.toFixed(2)}`
      );

      return printFormat === "format1" ? format1 : format2;
    } catch (err) {
      console.error("Error generating salary slip content:", err);
      return "<div>Error generating salary slip content</div>";
    }
  };

  const handlePrint = () => {
    try {
      const htmlContent = generateSalarySlipContent();
      const agent = payment.employee_id;
      const salaryMonth = payment.salary_month;
      const salaryYear = payment.salary_year;
      const fileName = `${
        agent?.name || "Employee"
      }_${salaryMonth}_${salaryYear} Slip`;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(htmlContent);
      printWindow.document.title = fileName;
      printWindow.document.close();
      printWindow.print();
    } catch (err) {
      console.error("Error printing salary slip:", err);
      alert("Failed to generate salary slip. Check console for details.");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const element = previewRef.current;

      const agent = payment.employee_id;
      const salaryMonth = payment.salary_month;
      const salaryYear = payment.salary_year;
      const fileName = `${
        agent?.name || "Employee"
      }_${salaryMonth}_${salaryYear}_Payslip.pdf`;

      // Create a hidden container to render the printable version
      const printContainer = document.createElement("div");
      printContainer.style.position = "absolute";
      printContainer.style.left = "-9999px";
      printContainer.style.top = "-9999px";
      printContainer.style.width = "210mm"; // A4 width
      printContainer.style.padding = "10mm"; // Add padding as margin
      printContainer.style.boxSizing = "border-box";
      printContainer.innerHTML = generatePrintableSalarySlipContent(); // Use a modified version for print
      document.body.appendChild(printContainer);

      // Capture canvas from the print container
      const canvas = await html2canvas(printContainer, {
        scale: 2, // Higher DPI for better quality
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 800, // Set a fixed width for consistent rendering
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      // Calculate dimensions for A4 page (210mm x 297mm)
      const pageWidth = 210;
      const pageHeight = 297;

      // Calculate image dimensions based on A4 size and canvas aspect ratio
      const imgWidth = pageWidth - 20; // Subtract 20mm for margins (10mm each side)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      let heightLeft = imgHeight;

      // Add first page
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight); // Start at (10,10) for 10mm margin

      // Add subsequent pages if needed
      while (heightLeft > pageHeight - 20) {
        // -20 for top/bottom margins
        position += pageHeight - 20;
        heightLeft -= pageHeight - 20;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, 10 - position, imgWidth, imgHeight);
      }

      // Clean up
      document.body.removeChild(printContainer);

      pdf.save(fileName);
    } catch (err) {
      console.error("PDF error:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Add this function to generate a printable version of the content
  const generatePrintableSalarySlipContent = () => {
    try {
      const agent = payment.employee_id;
      const payslipId = payment._id;
      const payDate = payment.pay_date || payment.createdAt;
      const fromDate = payment.salary_from_date;
      const toDate = payment.salary_to_date;
      const salaryMonth = payment.salary_month;
      const salaryYear = payment.salary_year;

      const earnings = payment.earnings || {};
      const deductions = payment.deductions || {};
      const additionalPayments = payment.additional_payments || [];
      const additionalDeductions = payment.additional_deductions || [];

      const monthlySalary = parseFloat(earnings.basic || 0);
      const hra = parseFloat(earnings.hra || 0);
      const travelAllowance = parseFloat(earnings.travel_allowance || 0);
      const medicalAllowance = parseFloat(earnings.medical_allowance || 0);
      const basketOfBenefits = parseFloat(earnings.basket_of_benifits || 0);
      const performanceBonus = parseFloat(earnings.performance_bonus || 0);
      const otherAllowances = parseFloat(earnings.other_allowances || 0);
      const conveyance = parseFloat(earnings.conveyance || 0);

      const incomeTax = parseFloat(deductions.income_tax || 0);
      const esi = parseFloat(deductions.esi || 0);
      const epf = parseFloat(deductions.epf || 0);
      const professionalTax = parseFloat(deductions.professional_tax || 0);
      const salaryAdvance = parseFloat(deductions.salary_advance || 0);

      const additionalPaymentsTotal = additionalPayments.reduce(
        (sum, payment) => sum + parseFloat(payment.value || 0),
        0
      );

      const additionalDeductionsTotal = additionalDeductions.reduce(
        (sum, deduction) => sum + parseFloat(deduction.value || 0),
        0
      );

      const totalEarnings =
        monthlySalary +
        hra +
        travelAllowance +
        medicalAllowance +
        basketOfBenefits +
        performanceBonus +
        otherAllowances +
        conveyance +
        additionalPaymentsTotal;

      const totalDeductions =
        incomeTax +
        esi +
        epf +
        professionalTax +
        salaryAdvance +
        additionalDeductionsTotal;

      const netPayable = parseFloat(payment.net_payable || 0);

      // const lop = totalEarnings - netPayable - totalDeductions;

      const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      };

      const amountInWords = numToWords(netPayable);

      // Generate the printable HTML content (using format1 style for consistency)
      const printableContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Salary Slip</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { 
            font-family: 'Times New Roman', serif; 
            margin: 0; 
            color: #000; 
            background: #fff; 
            padding: 0;
            box-sizing: border-box;
          }
          .container { 
            max-width: 200mm; 
            margin: 0 auto; 
            padding: 5mm;
          }
          .header { 
            border: 2px solid #000; 
            padding: 8px; 
            margin-bottom: 10px; 
            background: #f5f5f5; 
          }
          .header-top { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            margin-bottom: 5px; 
          }
          .logo { 
            width: 60px; 
            height: 60px; 
          }
          .company-info { 
            text-align: center; 
            flex: 1; 
          }
          .company-name { 
            font-size: 18px; 
            font-weight: bold; 
            margin: 2px 0; 
          }
          .company-addr { 
            font-size: 8px; 
            margin: 1px 0; 
          }
          .payslip-title { 
            text-align: center; 
            font-size: 16px; 
            font-weight: bold; 
            text-decoration: underline; 
            margin: 10px 0; 
          }
          .meta-info { 
            text-align: right; 
            font-size: 10px; 
          }
          .emp-details { 
            border: 1px solid #000; 
            margin: 10px 0; 
          }
          .emp-header { 
            background: #000; 
            color: #fff; 
            padding: 5px; 
            font-weight: bold; 
            text-align: center; 
          }
          .emp-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
          }
          .emp-item { 
            padding: 5px; 
            border-right: 1px solid #000; 
            border-bottom: 1px solid #000; 
            font-size: 10px; 
          }
          .emp-item:nth-child(even) { 
            border-right: none; 
          }
          .salary-table { 
            width: 100%; 
            border: 1px solid #000; 
            border-collapse: collapse; 
            margin: 10px 0; 
          }
          .salary-table th { 
            background: #000; 
            color: #fff; 
            padding: 5px; 
            border: 1px solid #000; 
            font-size: 10px; 
          }
          .salary-table td { 
            padding: 5px; 
            border: 1px solid #000; 
            font-size: 10px; 
          }
          .total-row { 
            background: #e0e0e0; 
            font-weight: bold; 
          }
          .net-section { 
            border: 2px double #000; 
            padding: 10px; 
            text-align: center; 
            margin: 15px 0; 
            background: #f9f9f9; 
          }
          .net-amount { 
            font-size: 18px; 
            font-weight: bold; 
            margin: 5px 0; 
          }
          .words { 
            font-style: italic; 
            font-size: 8px; 
            margin-top: 5px; 
          }
          .footer { 
            text-align: center; 
            font-size: 8px; 
            margin-top: 20px; 
            border-top: 1px solid #000; 
            padding-top: 5px; 
          }
          .sub-header { 
            background: #f0f0f0; 
            font-weight: bold; 
            text-align: center; 
          }
          .sub-header td { border-right: none; border-left: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-top">
              <img src="${imageInput}" class="logo" alt="Logo">
              <div class="company-info">
                <div class="company-name">Mychits</div>
                <div class="company-addr">No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</div>
                <div class="company-addr">CIN: U65999KA2022PTC161858</div>
              </div>
              <div class="meta-info">
                
                Date: <strong>${new Date().toLocaleDateString()}</strong>
              </div>
            </div>
            <div class="payslip-title">SALARY SLIP</div>
          </div>

          <div class="emp-details">
            <div class="emp-header">EMPLOYEE DETAILS</div>
            <div class="emp-grid">
              <div class="emp-item"><strong>Name:</strong> ${
                agent?.name || "N/A"
              }</div>
              <div class="emp-item"><strong>Employee ID:</strong> ${
                agent?.employeeCode || "N/A"
              }</div>
              <div class="emp-item"><strong>Designation:</strong> ${
                agent?.designation_id?.title || "N/A"
              }</div>
              <div class="emp-item"><strong>Department:</strong> ${
                agent?.department || "N/A"
              }</div>
              <div class="emp-item"><strong>Pay Period:</strong> ${formatDate(
                fromDate
              )} to ${formatDate(toDate)}</div>
              <div class="emp-item"><strong>Payment Date:</strong> ${formatDate(
                payDate
              )}</div>
            </div>
          </div>

          <table class="salary-table">
            <thead><tr><th>EARNINGS</th><th>AMOUNT (₹)</th><th>DEDUCTIONS</th><th>AMOUNT (₹)</th></tr></thead>
            <tbody>
              <tr><td>Basic Salary</td><td>₹${monthlySalary.toFixed(
                2
              )}</td><td>EPF</td><td>₹${epf.toFixed(2)}</td></tr>
              <tr><td>House Rent Allowance</td><td>₹${hra.toFixed(
                2
              )}</td><td>ESI</td><td>₹${esi.toFixed(2)}</td></tr>
              <tr><td>Travel Allowance</td><td>₹${travelAllowance.toFixed(
                2
              )}</td><td>Professional Tax</td><td>₹${professionalTax.toFixed(
        2
      )}</td></tr>
              <tr><td>Medical Allowance</td><td>₹${medicalAllowance.toFixed(
                2
              )}</td><td>Income Tax</td><td>₹${incomeTax.toFixed(2)}</td></tr>
              <tr><td>Basket of Benefits</td><td>₹${basketOfBenefits.toFixed(
                2
              )}</td><td>Salary Advance</td><td>₹${salaryAdvance.toFixed(
        2
      )}</td></tr>
              <tr><td>Performance Bonus</td><td>₹${performanceBonus.toFixed(
                2
              )}</td><td>LOP</td><td>₹${lop.toFixed(2)}</td></tr>
              <tr><td>Other Allowances</td><td>₹${otherAllowances.toFixed(
                2
              )}</td></tr>
              <tr><td>Conveyance</td><td>₹${conveyance.toFixed(2)}</td></tr>
             
              ${additionalPayments
                .map(
                  (payment) =>
                    `<tr><td>Others</td><td>₹${parseFloat(
                      payment.value || 0
                    ).toFixed(2)}</td><td></td><td></td></tr>`
                )
                .join("")}
              ${additionalDeductions
                .map(
                  (deduction) =>
                    `<tr><td>Others</td><td>₹${parseFloat(
                      deduction.value || 0
                    ).toFixed(2)}</td></tr>`
                )
                .join("")}
              <tr class="total-row">
                <td><strong>GROSS EARNINGS</strong></td>
                <td><strong>₹${totalEarnings.toFixed(2)}</strong></td>
                <td><strong>TOTAL DEDUCTIONS</strong></td>
                <td><strong>₹${totalDeductions.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="net-section">
            <div>NET PAID AMOUNT</div>
            <div class="net-amount">₹${netPayable.toFixed(2)}</div>
            <div class="words">Amount in words: Indian Rupees ${amountInWords} Only</div>
          </div>

          <div class="footer">This is a system-generated payslip. No signature required.<br>&copy; ${new Date().getFullYear()} Mychits. Confidential.</div>
        </div>
      </body>
      </html>
    `;

      return printableContent;
    } catch (err) {
      console.error("Error generating printable content:", err);
      return "<div>Error generating printable content</div>";
    }
  };

  const numToWords = (num) => {
    if (isNaN(num) || num === 0) return "Zero";

    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    num = Math.round(num);
    if ((num = num.toString()).length > 9) return "Overflow";

    const n = ("000000000" + num)
      .substr(-9)
      .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";

    let str = "";
    str +=
      n[1] != 0
        ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore "
        : "";
    str +=
      n[2] != 0
        ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh "
        : "";
    str +=
      n[3] != 0
        ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand "
        : "";
    str +=
      n[4] != 0
        ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred "
        : "";
    str +=
      n[5] != 0
        ? (str != "" ? "and " : "") +
          (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) +
          " "
        : "";

    return str.trim() || "Zero";
  };

  const formatButtons = [
    {
      key: "format1",
      label: "Classic Professional",
      description: "Traditional formal style",
    },
    // {
    //   key: "format2",
    //   label: "Modern Gradient",
    //   description: "Contemporary colorful design",
    // },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Format Selection Buttons */}
      <Card className="shadow-lg border-0">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Salary Slip Generator
          </h2>
          <p className="text-gray-600">
            Select a format and preview your payslip
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formatButtons.map((format) => (
            <button
              key={format.key}
              onClick={() => setPrintFormat(format.key)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                printFormat === format.key
                  ? "border-blue-500 bg-blue-50 shadow-md transform scale-105"
                  : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
              }`}
            >
              <div className="font-semibold text-lg mb-1">{format.label}</div>
              <div className="text-sm text-gray-500">{format.description}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card
        title={`Preview: ${
          formatButtons.find((f) => f.key === printFormat)?.label
        }`}
        className="shadow-lg border-0"
        extra={
          <div className="flex gap-3">
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Print
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadPDF}
              loading={downloading}
              className="bg-green-600 hover:bg-green-700"
            >
              Download PDF
            </Button>
          </div>
        }
      >
        <div className="bg-gray-100 rounded-lg p-4">
          <div
            ref={previewRef}
            className="bg-white rounded shadow-md overflow-auto"
            style={{
              height: "75vh",
              transform: "scale(0.85)",
              transformOrigin: "top left",
              width: "117.65%", // 100 / 0.85 to compensate for scaling
            }}
          >
            {previewContent ? (
              <div dangerouslySetInnerHTML={{ __html: previewContent }} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Spin size="large" tip="Generating preview..." />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SalarySlipPrint;
