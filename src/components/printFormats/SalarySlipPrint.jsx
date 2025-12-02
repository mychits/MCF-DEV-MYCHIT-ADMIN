// src/components/SalarySlipPrint.jsx
import  { useState } from "react";
import { Select } from "antd";
//import { API } from "../api"; // adjust your API import path
import api from "../../instance/TokenInstance";
import imageInput from "../../assets/images/Agent.png";
//import logoBase64 from "../assets/companyLogoBase64"; // keep your base64 logo here

const { Option } = Select;


const SalarySlipPrint = ({ payment }) => {
  const [printFormat, setPrintFormat] = useState("format1");

 
  if (!payment || typeof payment !== "object" || !payment.employee_id) {
    console.error("Payment details or agent information are missing.");
    return null; // Return null to not render anything if data is missing
  }


const handleSalaryPrint = () => {
  try {

    console.info(payment, "hagfjhdagfjhdgf");

    const agent = payment.employee_id;
    const payoutMeta = payment?.payout_metadata || {};
    console.info(payment?.employee_id?.employeeCode, "hsdgfjhgsfjhdsgfjhfdsg");
    const payslipId = payment?.payout_metadata?.receipt_no || payment._id;
    // const payDate = payment?.payout_metadata?.createdAt?.split("T")[0];
    const payDate =
  (payoutMeta.createdAt || payoutMeta.created_at)?.split("T")[0] ||
  new Date(payment?.createdAt || payment?.created_at).toISOString().split("T")[0];
    // const paidMonth = payment?.year;
    const fromDate = payoutMeta.date_range?.from?.split("T")[0] || null;
const toDate = payoutMeta.date_range?.to?.split("T")[0] || null;
    const absences = parseInt(payment.total_absences || 0); // ✅ From your data: "1"
    const adjustedAbsences = absences > 2 ? absences - 2 : 0;
    const monthlySalary = parseFloat(agent?.salary || 0);
    const monthPayment = parseFloat(payment?.payout_metadata?.total_paid_amount || 0);
    const deductionDetails = payoutMeta?.deductions_details?.[0] || {};
  
// Assign values to variables if deductionDetails exists
const deductionPFAmount = deductionDetails?.amount || 0;
const deductionPFJustification = deductionDetails?.justification || "N/A";
console.info(deductionPFJustification, "printcheck");
    const month = payment?.payout_metadata;
    const salaryMonth = month?.months_included?.[0] || null;
    
    const totalDeductions = payoutMeta?.total_deductions || 0;
    const lop = Number(monthlySalary) - Number(monthPayment) - Number(deductionPFAmount) || 0;
  

    // ❗ Validate critical data
    if (!agent) throw new Error("Agent data not found");
    if (isNaN(monthlySalary)) throw new Error("Invalid salary value");

    // Calculate days in paid month dynamically
   const monthYear = salaryMonth;


    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

    const amountInWords = numToWords(monthPayment);

    // --- FORMAT 1 ---
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
                Payslip ID: <strong>${payslipId}</strong><br>
                Date: <strong>${new Date().toLocaleDateString()}</strong>
              </div>
            </div>
            <div class="payslip-title">SALARY SLIP</div>
          </div>

          <div class="emp-details">
            <div class="emp-header">EMPLOYEE DETAILS</div>
            <div class="emp-grid">
              <div class="emp-item"><strong>Name:</strong> ${agent?.name || "N/A"}</div>
              <div class="emp-item"><strong>Employee ID:</strong> ${agent?.employeeCode || "N/A"}</div>
              <div class="emp-item"><strong>Designation:</strong> ${agent?.designation_id?.title || "N/A"}</div>
              <div class="emp-item"><strong>Department:</strong> ${agent?.department || "N/A"}</div>
              <div class="emp-item"><strong>Pay Period:</strong> ${formatDate(fromDate)} to ${formatDate(toDate)}</div>
            
             
              <div class="emp-item"><strong>Payment Date:</strong> ${formatDate(payDate)}</div>
            </div>
          </div>

          <table class="salary-table">
            <thead><tr><th>EARNINGS</th><th>AMOUNT (₹)</th><th>DEDUCTIONS</th><th>AMOUNT (₹)</th></tr></thead>
            <tbody>
              <tr><td>Basic Salary</td><td>₹${monthlySalary}</td><td>${deductionPFJustification}</td><td>₹${deductionPFAmount}</td></tr>
              <tr><td>House Rent Allowance</td><td>₹${0}</td><td>LOP</td><td>₹${lop.toFixed(2)}</td></tr>
              <tr><td>Special Allowance</td><td>₹${0}</td></tr>
              <tr><td>Conveyance Allowance</td><td>₹0.00</td></tr>
              <tr class="total-row">
                <td><strong>GROSS EARNINGS</strong></td>
                <td><strong>₹${monthlySalary.toFixed(2)}</strong></td>
                <td><strong>TOTAL DEDUCTIONS</strong></td>
                <td><strong>₹${totalDeductions}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="net-section">
            <div>NET PAYABLE AMOUNT</div>
            <div class="net-amount">₹${monthPayment.toFixed(2)}</div>
            <div class="words">Amount in words: Indian Rupees ${amountInWords} Only</div>
          </div>

          <div class="footer">This is a system-generated payslip. No signature required.<br>&copy; ${new Date().getFullYear()} Mychits. Confidential.</div>
        </div>
      </body>
      </html>
    `;

    // --- FORMAT 2 (Optional, same structure) ---
    const format2 = `
<!DOCTYPE html>
<html>
<head>
<style>
@page { 
  size: A4; 
  margin: 12mm; 
}



body { 
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
  margin: 0; 
  color: #1a202c; 
  background: #f7fafc; 
  padding: 0;
  width: 210mm;
  height: 297mm;
}
.document { 
  background: #fff; 
  margin: 0 auto; 
  width: 100%; 
  height: auto; 
  min-height: calc(297mm - 24mm);; /* A4 height minus margins */
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.header-band { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
  color: #fff; 
  padding: 20px; 
}
.header-content { 
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  gap: 20px; 
}
.logo-circle { 
  width: 70px; 
  height: 70px; 
  background: rgba(255,255,255,0.2); 
  border-radius: 6px;   /* ⬅️ small rounded box instead of circle */
  display: flex; 
  align-items: center; 
  justify-content: center; 
  backdrop-filter: blur(10px); 
}

.logo-circle img { 
  width: 50px; 
  height: 50px; 
  border-radius: 4px;   /* ⬅️ box edges (adjust/remove if you want sharp corners) */
}
.header-text { flex: 1; }
.company-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.company-subtitle { font-size: 11px; opacity: 0.9; line-height: 1.4; }
.header-meta { 
  text-align: right; 
  background: rgba(255,255,255,0.15); 
  padding: 12px; 
  border-radius: 10px; 
  font-size: 11px; 
}
.meta-line { margin: 2px 0; }
.meta-value { font-weight: 400; }
.content { 
  flex: 1;
  padding: 1px 1px; 
}
.payslip-title { 
  text-align: center; 
  font-size: 24px; 
  font-weight: 500; 
  color: #4a5568; 
  margin: 20px 0; 
  letter-spacing: 2px; 
}
.card { 
  background: #fff; 
  border: 1px solid #e2e8f0; 
  border-radius: 10px; 
  margin-bottom: 20px; 
  overflow: hidden; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
}
.card-header { 
  background: #f7fafc; 
  padding: 12px; 
  border-bottom: 1px solid #e2e8f0; 
  font-weight: 600; 
  color: #4a5568; 
}
.card-body { padding: 15px; }
.info-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 12px; 
}
.info-pair { 
  display: flex; 
  justify-content: space-between; 
  padding: 6px 0; 
  border-bottom: 1px dotted #e2e8f0; 
  font-size: 12px; 
}
.info-pair:last-child { border-bottom: none; }
.salary-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 20px; 
}
.earnings-card { border-left: 4px solid #48bb78; }
.deductions-card { border-left: 4px solid #f56565; }
.item-row { 
  display: flex; 
  justify-content: space-between; 
  padding: 8px 0; 
  border-bottom: 1px solid #f7fafc; 
  font-size: 12px;
}

@media print {
  body {
    background: #fff;
  }
  .document {
    box-shadow: none;
    page-break-after: avoid; /* 👈 prevent extra blank page */
  }
}

.item-row:last-child { border-bottom: 2px solid #e2e8f0; }
.item-name { color: #4a5568; }
.item-amount { color: #2d3748; font-weight: 600; }
.total-amount { 
  background: #edf2f7; 
  padding: 10px; 
  border-radius: 6px; 
  font-weight: 700; 
  text-align: right; 
}
.net-section { 
  background: linear-gradient(135deg, #4299e1, #3182ce); 
  color: #fff; 
  padding: 20px; 
  border-radius: 10px; 
  text-align: center; 
  margin: 25px 0; 
}
.net-title { font-size: 14px; margin-bottom: 8px; }
.net-figure { font-size: 28px; font-weight: 500; margin-bottom: 10px; }
.net-words { font-size: 11px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px; }
.signature-section { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 20px; 
  margin-top: 15px; 
}
.signature-line { 
  border-top: 1px solid #cbd5e0; 
  margin-top: 40px; 
  padding-top: 8px; 
  font-size: 11px; 
  color: #718096; 
}
.footer-text { 
  text-align: center; 
  color: #a0aec0; 
  font-size: 9px; 
  margin: 25px 0; 
}
</style>
</head>
<body>
<div class="document">
  <div class="header-band">
    <div class="header-content">
      <div class="logo-circle">
        <img src="${imageInput}" alt="Logo">
      </div>
      <div class="header-text">
        <div class="company-title">Mychits</div>
        <div class="company-subtitle">No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</div>
      </div>
      <div class="header-meta">
        <div class="meta-line">Payslip ID: <span class="meta-value">${payslipId}</span></div>
        <div class="meta-line">Period: <span class="meta-value">${monthYear}</span></div>
        <div class="meta-line">Date: <span class="meta-value">${formatDate(payDate)}</span></div>
      </div>
    </div>
  </div>
  <div class="content">
    <div class="payslip-title">PAYSLIP</div>
    <div class="card">
      <div class="card-header">Employee Information</div>
      <div class="card-body">
        <div class="info-grid">
          <div class="info-pair"><span>Employee Name</span><span>${agent?.name || "N/A"}</span></div>
          <div class="info-pair"><span>Employee ID</span><span>${agent?.employeeCode || "N/A"}</span></div>
          <div class="info-pair"><span>Designation</span><span>${agent?.designation_id?.title || "N/A"}</span></div>
          <div class="info-pair"><span>Department</span><span>${agent?.department || "N/A"}</span></div>
          <div class="info-pair"><span>Pay Period</span><span>${formatDate(fromDate)} to ${formatDate(toDate)}</span></div>
         
        </div>
      </div>
    </div>
    <div class="salary-grid">
      <div class="card earnings-card">
        <div class="card-header" style="color: #48bb78;">Earnings</div>
        <div class="card-body">
          <div class="item-row"><div class="item-name">Basic Salary</div><div class="item-amount">₹${monthlySalary.toFixed(2)}</div></div>
          <div class="item-row"><div class="item-name">HRA (40%)</div><div class="item-amount">₹${(0).toFixed(2)}</div></div>
          <div class="item-row"><div class="item-name">Special Allowance</div><div class="item-amount">₹${(0).toFixed(2)}</div></div>
          <div class="item-row"><div class="item-name">Conveyance</div><div class="item-amount">₹0.00</div></div>
          <div class="total-amount">Total: ₹${monthlySalary.toFixed(2)}</div>
        </div>
      </div>
      <div class="card deductions-card">
        <div class="card-header" style="color: #f56565;">Deductions</div>
        <div class="card-body">
          <div class="item-row"><div class="item-name">Loss of Pay</div><div class="item-amount">₹${lop.toFixed(2)}</div></div>
          <div class="item-row"><div class="item-name">PF/ESI</div><div class="item-amount">₹${deductionPFAmount}</div></div>
          
          <div class="item-row"><div class="item-name">TDS</div><div class="item-amount">₹0.00</div></div>
          <div class="total-amount">Total: ₹${(parseFloat(totalDeductions)).toFixed(2)}</div>
        </div>
      </div>
    </div>
    <div class="net-section">
      <div class="net-title">Net Payable Amount</div>
      <div class="net-figure">₹${parseFloat(monthPayment).toFixed(2)}</div>
      <div class="net-words">Amount in Words: Indian Rupees ${amountInWords} Only</div>
    </div>
    <div class="signature-section">
      <div class="signature-line">Employee Signature</div>
      <div class="signature-line">Authorized Signatory</div>
    </div>
    <div class="footer-text">
      This is a computer generated payslip and does not require signature.<br>
      &copy; ${new Date().getFullYear()} Mychits.
    </div>
  </div>
</div>
</body>
</html>`;


    const htmlContent = printFormat === "format1" ? format1 : format2;
    const fileName = `${agent?.name || "Employee"}_${monthYear} Slip`;

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


  const numToWords = (num) => {
    const a = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
      "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
    ];
    const b = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
    ];
    if ((num = num.toString()).length > 9) return "Overflow";
    const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = "";
    str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore " : "";
    str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh " : "";
    str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand " : "";
    str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred " : "";
    str += n[5] != 0 ? (str != "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) + " " : "";
    return str.trim();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleSalaryPrint}
      >
        Print Salary Slip
      </button>
      <Select
        defaultValue="format1"
        style={{ width: 120 }}
        onChange={(value) => setPrintFormat(value)}
      >
        <Option value="format1">Format 1</Option>
        <Option value="format2">Format 2</Option>
      </Select>
    </div>
  );
};

export default SalarySlipPrint;
