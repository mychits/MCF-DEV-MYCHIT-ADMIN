import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import imageInput from "../../assets/images/mychits.png";

//const safe = (val) => (val == null || val === "" ? "-" : String(val).trim());

const formatAmount = (amount) => {
  if (amount == null || isNaN(amount)) return "-";
  return Math.round(amount);
};

const formatAddress = (addr) => {
  if (!addr) return "-";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object" && !Array.isArray(addr)) {
    const { line1, line2, city, state, pincode } = addr;
    return [line1, line2, city, state, pincode].filter(Boolean).join(", ") || "-";
  }
  return String(addr);
};

const safe = (v) => v ?? "-";

// ====== Report Generator - Updated with Totals Section ======
// const CustomerReportPrint = (
//   group,
//   TableAuctions,
//   filteredBorrowerData,
//   filteredDisbursement,
//   totalsData, // <-- pass { TotalToBepaid, Totalprofit, NetTotalprofit, Totalpaid }
//   TableEnrolls,
//   customerTransactions 
// ) => {
//   const doc = new jsPDF("p", "mm", "a4");
//   const pageWidth = doc.internal.pageSize.width;
//   const center = pageWidth / 2;
//   const leftX = 20;
//   let yPos = 30;


//   doc.addImage(imageInput, "PNG", 95, 5, 20, 20);

//   // ====== Header ======
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(18);
//   doc.setTextColor(30, 50, 100);
//   doc.text("MyChits", center, yPos, { align: "center" });

//   yPos += 7;
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(10);
//   doc.setTextColor(80);
//   doc.text("#11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070", center, yPos, { align: "center" });

//   yPos += 12;
//   doc.setDrawColor(200, 200, 200);
//   doc.line(leftX, yPos, pageWidth - 20, yPos);
//   yPos += 10;

//   // ====== Title ======
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(15);
//   doc.setTextColor(0);
//   doc.text("Customer Report", center, yPos, { align: "center" });
//   yPos += 8;

//   const now = new Date();
//   const timestamp =
//     now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
//     " | " +
//     now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

//   doc.setFont("helvetica", "italic");
//   doc.setFontSize(9);
//   doc.setTextColor(100);
//   doc.text(`Generated on: ${timestamp}`, center, yPos, { align: "center" });
//   yPos += 15;

//   // #################################################
//   // ====== Customer Details Card ======
//   // #################################################
//   const detailYStart = yPos;
//   const cardWidth = pageWidth - 40;
//   const cardHeight = 55;
//   const innerMargin = 6;

//   const labelX1 = leftX + innerMargin;
//   const valueX1 = 55;
//   const labelX2 = center + 5;
//   const valueX2 = center + 35;
//   const rowHeight = 8;
//   let currentY = detailYStart + 10;

//   doc.setDrawColor(180, 180, 180);
//   doc.setFillColor(248, 248, 255);
//   doc.roundedRect(leftX, detailYStart, cardWidth, cardHeight, 3, 3, "FD");

//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(12);
//   doc.setTextColor(30, 50, 100);
//   doc.text("Customer Information", leftX + innerMargin, detailYStart + 5);

//   doc.setDrawColor(220, 220, 220);
//   doc.line(leftX, detailYStart + 7, pageWidth - 20, detailYStart + 7);

//  const drawCardDetail = (label, value, labelX, valueX, extraMargin = 0) => {
//   // apply extra margin if provided
//   if (extraMargin > 0) {
//     currentY += extraMargin;
//   }

//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(9);
//   doc.setTextColor(50, 50, 50);
//   doc.text(`${label}:`, labelX, currentY);

//   doc.setFont("helvetica", "normal");
//   doc.setTextColor(0);
//   const maxValWidth =
//     valueX === valueX1 ? labelX2 - valueX1 - 10 : pageWidth - 20 - valueX2 - 5;
//   doc.text(safe(value), valueX, currentY, { maxWidth: maxValWidth });
// };

//   drawCardDetail("Full Name", group?.full_name, labelX1, valueX1, 4);
//   drawCardDetail("Phone No.", group?.phone_number, labelX2, valueX2);
//   currentY += rowHeight;

//   drawCardDetail("Email", group?.email, labelX1, valueX1);
//   drawCardDetail("Date of Birth", group?.dateofbirth?.split("T")[0], labelX2, valueX2);
//   currentY += rowHeight;

//   drawCardDetail("Gender", group?.gender, labelX1, valueX1);
//   drawCardDetail("Collection Area", group?.collection_area?.route_name, labelX2, valueX2);
//   currentY += rowHeight;

//   drawCardDetail("Nominee", group?.nominee_name, labelX1, valueX1);
//   drawCardDetail("Relationship", group?.nominee_relationship, labelX2, valueX2);
//   currentY += rowHeight;

//   const addressText = formatAddress(group?.address);
//   const addressMaxWidth = pageWidth / 2 - valueX1 - innerMargin;

//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(9);
//   doc.setTextColor(50, 50, 50);
//   doc.text("Address:", labelX1, currentY);

//   doc.setFont("helvetica", "normal");
//   doc.setTextColor(0);
//   doc.text(addressText, valueX1, currentY, { maxWidth: addressMaxWidth });

//   drawCardDetail("Pincode", group?.pincode, labelX2, currentY);

//   yPos = detailYStart + cardHeight + 8;

//   // ====== Auction Table ======
//   // if (TableAuctions?.length > 0) {
//   //   autoTable(doc, {
//   //     startY: yPos,
//   //     head: [["Group ID", "Ticket No.", "Total Payable", "Total Paid", "Balance Due"]],
//   //     body: TableAuctions.map((i) => [
//   //       safe(i.group),
//   //       safe(i.ticket),
//   //       formatAmount(i.toBePaidAmount),
//   //       formatAmount(i.paidAmount),
//   //       formatAmount(i.balance),
//   //     ]),
//   //     theme: "grid",
//   //     headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
//   //     bodyStyles: { textColor: 50 },
//   //     alternateRowStyles: { fillColor: [245, 250, 255] },
//   //     styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
//   //   });
//   //   yPos = doc.lastAutoTable.finalY + 12;
//   // }

//   // ====== Auction Details Table ======

//    yPos += 4;
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(15);
//   doc.setTextColor(80);
//   doc.text("Chit Group", center, yPos, { align: "center" });
//   yPos += 2;

// if (TableAuctions?.length > 0) {
//   autoTable(doc, {
//     startY: yPos,
//     head: [[
//       "Customer Status",
//       "Removal Reason",
//       "Group Name",
//       "Ticket",
//       "Referrer Type",
//       "Referred By",
//       "Amount to be Paid",
//       "Profit",
//       "Net To be Paid",
//       "Amount Paid",
//       "Balance"
//     ]],
//     body: TableAuctions.map((i) => [
//       safe(i.customer_status),
//       safe(i.removal_reason),
//       safe(i.group),
//       safe(i.ticket),
//       safe(i.referred_type),
//       safe(i.referrer_name),
//       formatAmount(i.totalBePaid),
//       formatAmount(i.profit),
//       formatAmount(i.toBePaidAmount),
//       formatAmount(i.paidAmount),
//       formatAmount(i.balance),
//     ]),
//     theme: "grid",
//     headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
//     bodyStyles: { textColor: 50 },
//     alternateRowStyles: { fillColor: [245, 250, 255] },
//     styles: { font: "helvetica", fontSize: 6, cellPadding: 2 },
//   });
//   yPos = doc.lastAutoTable.finalY + 12;
// }


//   yPos += 4;
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(15);
//   doc.setTextColor(80);
//   doc.text("Loan Group", center, yPos, { align: "center" });
//   yPos += 2;
//   // ====== Loan Table ======
//   if (filteredBorrowerData?.length > 0) {
//     autoTable(doc, {
//       startY: yPos,
//       head: [["Loan ID", "Amount Sanctioned", "Tenure", "Service Charge", "Total Paid", "Balance"]],
//       body: filteredBorrowerData.map((l) => [
//         safe(l.loan),
//         formatAmount(l.loan_amount),
//         safe(l.tenure),
//         formatAmount(l.service_charge),
//         formatAmount(l.total_paid_amount),
//         formatAmount(l.balance),
//       ]),
//       theme: "grid",
//       headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: "bold" },
//       alternateRowStyles: { fillColor: [245, 250, 255] },
//       styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
//     });
//     yPos = doc.lastAutoTable.finalY + 12;
//   }

//   // ====== Pigme/Disbursement Table ======
//   // if (filteredDisbursement?.length > 0) {
//   //   autoTable(doc, {
//   //     startY: yPos,
//   //     head: [["Date", "Amount Disbursed", "Status", "Remarks"]],
//   //     body: filteredDisbursement.map((d) => [
//   //       d.disbursement_date?.split("T")[0] || "-",
//   //       formatAmount(d.amount),
//   //       safe(d.status),
//   //       safe(d.remarks),
//   //     ]),
//   //     theme: "grid",
//   //     headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
//   //     alternateRowStyles: { fillColor: [245, 250, 255] },
//   //     styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
//   //   });
//   //   yPos = doc.lastAutoTable.finalY + 12;
//   // }




//   if (filteredDisbursement?.length > 0) {
//   yPos += 10;
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(15);
//   doc.setTextColor(80);
//   doc.text("PayOut / Disbursement", center, yPos, { align: "center" });
//   yPos += 4;

//   autoTable(doc, {
//     startY: yPos,
//     head: [[
//       "SL. NO",
//       "Disbursed Date",
//       "Transaction Date",
//       "Ticket",
//       "Amount",
//       "Receipt No",
//       "Payment Type",
//       "Disbursement Type",
//       "Disbursed By",
//       "Balance"
//     ]],
//     body: filteredDisbursement.map((d, index) => [
//       index + 1,
//       safe(d.pay_date),
//       safe(d.transaction_date),
//       safe(d.ticket),
//       formatAmount(d.amount),
//       safe(d.receipt_no),
//       safe(d.pay_type),
//       safe(d.disbursement_type),
//       safe(d.disbursed_by),
//       formatAmount(d.balance)
//     ]),
//     theme: "grid",
//     headStyles: { fillColor: [52, 73, 94], textColor: 255, fontStyle: "bold" },
//     bodyStyles: { textColor: 50 },
//     alternateRowStyles: { fillColor: [245, 250, 255] },
//     styles: { font: "helvetica", fontSize: 8, cellPadding: 3 },
//   });

//   yPos = doc.lastAutoTable.finalY + 12;
// }

// //     yPos += 10;
// //   doc.setFont("helvetica", "normal");
// //   doc.setFontSize(15);
// //   doc.setTextColor(80);
// //   doc.text("Overview", center, yPos, { align: "center" });
// // yPos += 2;
//   // ====== Totals Section (after Loan & Pigme) ======
//   if (totalsData) {
//     const { TotalToBepaid, Totalprofit, NetTotalprofit, Totalpaid } = totalsData;
//     const balance =
//       NetTotalprofit && Totalpaid ? NetTotalprofit - Totalpaid : "-";

//     autoTable(doc, {
//       startY: yPos,
//       head: [["Total To be Paid", "Total Profit", "Net Total To be Paid", "Total Paid", "Balance"]],
//       body: [
//         [
//           formatAmount(TotalToBepaid),
//           formatAmount(Totalprofit),
//           formatAmount(NetTotalprofit),
//           formatAmount(Totalpaid),
//           formatAmount(balance),
//         ],
//       ],
//       theme: "grid",
//       headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: "bold" },
//       bodyStyles: { textColor: 50 },
//       styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
//     });
//     yPos = doc.lastAutoTable.finalY + 12;
//   }
//   if (TableEnrolls?.length > 0){

//   // if (group?.TableEnrolls && group.TableEnrolls.length > 0) {
//     yPos += 8;
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(15);
//     doc.setTextColor(80);
//     doc.text("Customer Ledger (All Groups & Tickets)", center, yPos, { align: "center" });
//     yPos += 4;

//     autoTable(doc, {
//       startY: yPos,
//       head: [["SL. NO", "Date", "Amount", "Receipt No", "Old Receipt No", "Payment Type", "Balance"]],
//       body: TableEnrolls.map((entry, index) => [
//         index + 1,
//         safe(entry.date),
//         formatAmount(entry.amount),
//         safe(entry.receipt),
//         safe(entry.old_receipt),
//         safe(entry.type),
//         formatAmount(entry.balance),
//       ]),
//       theme: "grid",
//       headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: "bold" },
//       bodyStyles: { textColor: 50 },
//       alternateRowStyles: { fillColor: [245, 250, 255] },
//       styles: { font: "helvetica", fontSize: 8, cellPadding: 3 },
//     });

//     yPos = doc.lastAutoTable.finalY + 12;
//   }

//   // if (customerTransactions) {
//   //   doc.setFontSize(10);
//   //   yPos += 8;
//   //   doc.text("Payment Transactions", 14, yPos);
//   //   yPos += 6;

//   //   const { chit, loan, pigme } = customerTransactions[0] || {};

//   //   // Helper function to draw section
//   //   const drawSection = (title, data) => {
//   //     if (!data?.length) return;
//   //     yPos += 6;
//   //     doc.setFont("helvetica", "bold");
//   //     doc.text(title, 14, yPos);
//   //     yPos += 4;

//   //     data.forEach((item, i) => {
//   //       const user = item._id.user_id?.full_name || "-";
//   //       const date = item._id.payments?.pay_date || "-";
//   //       const receiptNo = item._id?.payments?.receipt_no || "-";

//   //       const totalPaid = item.total_paid_amount || 0;
//   //       const groupName = item._id.group_id?.group_name || item._id.loan?.loan_no || item._id.pigme?.pigme_no || "-";
//   //       const Ticket = item._id?.payments?.ticket;
//   //       const amount = item._id?.payments?.amount;
//   //       doc.setFont("helvetica", "normal");
//   //       doc.text(`${i + 1}. Ref: ${groupName}`, 14, yPos);
//   //       doc.text(`Total Paid: ₹${totalPaid}`, 100, yPos);
//   //       yPos += 6;

//   //       if (yPos > 270) {  // handle page overflow
//   //         doc.addPage();
//   //         yPos = 20;
//   //       }
//   //     });
//   //   };

//   //   drawSection("Chit Transactions", chit);
//   //   drawSection("Loan Transactions", loan);
//   //   drawSection("Pigme Transactions", pigme);
//   // }

//   // ====== Footer ======

// if (customerTransactions && Array.isArray(customerTransactions) && customerTransactions.length > 0) {
//   doc.setFontSize(10);
//   yPos += 8;
//   doc.text("Payment Transactions", 14, yPos);
//   yPos += 4;

//   const { chit = [], loan = [], pigme = [] } = customerTransactions[0] || {};

//   // Helper function to safely draw a section
//   const drawTableSection = (title, data = []) => {
//     if (!Array.isArray(data) || data.length === 0) return;

//     // Section title
//     yPos += 8;
//     doc.setFont("helvetica", "bold");
//     doc.text(title, 14, yPos);
//     yPos += 2;

//     // Prepare table rows safely
//     const tableData = [];

//     data.forEach((item, i) => {
//       const groupName =
//         item._id?.group_id?.group_name ||
//         item._id?.loan?.loan_no ||
//         item._id?.pigme?.pigme_no ||
//         "-";

//       const payments = Array.isArray(item._id?.payments) ? item._id.payments : [];

//       payments.forEach((p, index) => {
//         tableData.push([
//           `${i + 1}.${index + 1}`,
//           item._id?.user_id?.full_name || "-",
//           groupName,
//           p.ticket || "-",
//           p.receipt_no || "-",
//           p.pay_date || "-",
//           p.pay_type || "-",
//           p.amount ? `₹${p.amount}` : "-",
//         ]);
//       });
//     });

//     if (tableData.length === 0) return;

//     // Render table
//     doc.autoTable({
//       startY: yPos + 4,
//       head: [["#", "Customer", "Group / Loan / Pigme", "Ticket", "Receipt No", "Pay Date", "Pay Type", "Amount"]],
//       body: tableData,
//       styles: {
//         fontSize: 8,
//         cellPadding: 2,
//       },
//       headStyles: {
//         fillColor: [240, 248, 255], // Light blue header
//         textColor: [0, 0, 0],
//         fontStyle: "bold",
//       },
//       alternateRowStyles: { fillColor: [250, 250, 250] },
//       margin: { left: 14, right: 14 },
//       didDrawPage: (data) => {
//         yPos = data.cursor.y + 10;
//       },
//     });

//     yPos = doc.lastAutoTable?.finalY || yPos + 10;
//   };

//   // --- Draw each section safely ---
//   drawTableSection("Chit Transactions", chit);
//   drawTableSection("Loan Transactions", loan);
//   drawTableSection("Pigme Transactions", pigme);
// }



//   const finalY = doc.internal.pageSize.height - 20;
//   doc.setDrawColor(220);
//   doc.line(leftX, finalY - 5, pageWidth - 20, finalY - 5);

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(9);
//   doc.setTextColor(80);
//   doc.text("Issued By: Super Admin", leftX, finalY);

//   doc.setFontSize(8);
//   doc.setTextColor(120);
//   doc.text("*** This is a computer generated document, no signature is required ***", center, finalY, {
//     align: "center",
//   });

//   const name = group?.full_name ? group.full_name.replace(/\s+/g, "_") : "Customer";
//   doc.save(`CustomerReport_${name}_${new Date().toISOString().split("T")[0]}.pdf`);
// };

const CustomerReportPrint = (
  group,
  TableAuctions = [],
  filteredBorrowerData = [],
  filteredDisbursement = [],
  totalsData = {},
  TableEnrolls = [],
  customerTransactions = []
) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.width;
  const center = pageWidth / 2;
  const leftX = 20;
  let yPos = 30;

  // ========== HEADER ==========
  try {
    // Add logo if available
    if (typeof imageInput !== "undefined" && imageInput)
      doc.addImage(imageInput, "PNG", 95, 5, 20, 20);
  } catch (err) {
    console.warn("Image not found, skipping logo:", err.message);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(35, 50, 100);
  yPos +=2
  doc.text("MyChits", center, yPos, { align: "center" });

  yPos += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(
    "#11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070",
    center,
    yPos,
    { align: "center" }
  );

  yPos += 12;
  doc.setDrawColor(200, 200, 200);
  doc.line(leftX, yPos, pageWidth - 20, yPos);
  yPos += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(0);
  doc.text("Customer Report", center, yPos, { align: "center" });
  yPos += 8;

  const now = new Date();
  const timestamp =
    now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " | " +
    now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated on: ${timestamp}`, center, yPos, { align: "center" });
  yPos += 50;

  // ========== CUSTOMER CARD ==========
  const detailYStart = yPos;
  const cardWidth = pageWidth - 40;
  const cardHeight = 55;
  const innerMargin = 6;
  const labelX1 = leftX + innerMargin;
  const valueX1 = 55;
  const labelX2 = center + 5;
  const valueX2 = center + 35;
  const rowHeight = 8;
  let currentY = detailYStart + 10;

  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(248, 248, 255);
  doc.roundedRect(leftX, detailYStart, cardWidth, cardHeight, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 50, 100);
  doc.text("Customer Information", leftX + innerMargin, detailYStart + 5);

  const drawCardDetail = (label, value, labelX, valueX, extraMargin = 0) => {
    if (extraMargin > 0) currentY += extraMargin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`${label}:`, labelX, currentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(safe(value), valueX, currentY);
  };

  drawCardDetail("Full Name", group?.full_name, labelX1, valueX1, 4);
  drawCardDetail("Phone No.", group?.phone_number, labelX2, valueX2);
  currentY += rowHeight;

  drawCardDetail("Email", group?.email, labelX1, valueX1);
  drawCardDetail("Date of Birth", group?.dateofbirth?.split("T")[0], labelX2, valueX2);
  currentY += rowHeight;

  drawCardDetail("Gender", group?.gender, labelX1, valueX1);
  drawCardDetail("Collection Area", group?.collection_area?.route_name, labelX2, valueX2);
  currentY += rowHeight;

  drawCardDetail("Nominee", group?.nominee_name, labelX1, valueX1);
  drawCardDetail("Relationship", group?.nominee_relationship, labelX2, valueX2);
  currentY += rowHeight;

  doc.setFont("helvetica", "bold");
  doc.text("Address:", labelX1, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(formatAddress(group?.address), valueX1, currentY);
  drawCardDetail("Pincode", group?.pincode, labelX2, valueX2);

  yPos = detailYStart + cardHeight + 8;

  // ========== CHIT GROUP TABLE ==========
  if (Array.isArray(TableAuctions) && TableAuctions.length > 0) {
    doc.setFontSize(15);
    doc.text("Chit Group", center, yPos, { align: "center" });
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [
        [
          "Customer Status",
          "Removal Reason",
          "Group Name",
          "Ticket",
          "Referrer Type",
          "Referred By",
          "Amount to be Paid",
          "Profit",
          "Net To be Paid",
          "Amount Paid",
          "Balance",
        ],
      ],
      body: TableAuctions.map((i) => [
        safe(i.customer_status),
        safe(i.removal_reason),
        safe(i.group),
        safe(i.ticket),
        safe(i.referred_type),
        safe(i.referrer_name),
        formatAmount(i.totalBePaid),
        formatAmount(i.profit),
        formatAmount(i.toBePaidAmount),
        formatAmount(i.paidAmount),
        formatAmount(i.balance),
      ]),
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      bodyStyles: { textColor: 50 },
      styles: { font: "helvetica", fontSize: 7, cellPadding: 2 },
    });
    yPos = doc.lastAutoTable.finalY + 12;
  }

  // ========== LOAN TABLE ==========
  if (Array.isArray(filteredBorrowerData) && filteredBorrowerData.length > 0) {
    doc.setFontSize(15);
    doc.text("Loan Group", center, yPos, { align: "center" });
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [["Loan ID", "Amount Sanctioned", "Tenure", "Service Charge", "Total Paid", "Balance"]],
      body: filteredBorrowerData.map((l) => [
        safe(l.loan),
        formatAmount(l.loan_amount),
        safe(l.tenure),
        formatAmount(l.service_charge),
        formatAmount(l.total_paid_amount),
        formatAmount(l.balance),
      ]),
      theme: "grid",
      headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: "bold" },
      styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
    });
    yPos = doc.lastAutoTable.finalY + 12;
  }

  // ========== DISBURSEMENT ==========
  if (Array.isArray(filteredDisbursement) && filteredDisbursement.length > 0) {
    doc.setFontSize(15);
    doc.text("PayOut / Disbursement", center, yPos, { align: "center" });
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [
        [
          "SL. NO",
          "Disbursed Date",
          "Transaction Date",
          "Ticket",
          "Amount",
          "Receipt No",
          "Payment Type",
          "Disbursement Type",
          "Disbursed By",
          "Balance",
        ],
      ],
      body: filteredDisbursement.map((d, i) => [
        i + 1,
        safe(d.pay_date),
        safe(d.transaction_date),
        safe(d.ticket),
        formatAmount(d.amount),
        safe(d.receipt_no),
        safe(d.pay_type),
        safe(d.disbursement_type),
        safe(d.disbursed_by),
        formatAmount(d.balance),
      ]),
      theme: "grid",
      headStyles: { fillColor: [52, 73, 94], textColor: 255, fontStyle: "bold" },
      styles: { font: "helvetica", fontSize: 8, cellPadding: 3 },
    });
    yPos = doc.lastAutoTable.finalY + 12;
  }

  // ========== TOTALS ==========
  if (totalsData && Object.keys(totalsData).length > 0) {
    const { TotalToBepaid, Totalprofit, NetTotalprofit, Totalpaid } = totalsData;
    const balance = NetTotalprofit && Totalpaid ? NetTotalprofit - Totalpaid : "-";

    autoTable(doc, {
      startY: yPos,
      head: [["Total To be Paid", "Total Profit", "Net Total To be Paid", "Total Paid", "Balance"]],
      body: [
        [
          formatAmount(TotalToBepaid),
          formatAmount(Totalprofit),
          formatAmount(NetTotalprofit),
          formatAmount(Totalpaid),
          formatAmount(balance),
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: "bold" },
      styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
    });
    yPos = doc.lastAutoTable.finalY + 12;
  }

  // ========== LEDGER ==========
  if (Array.isArray(TableEnrolls) && TableEnrolls.length > 0) {
    doc.setFontSize(15);
    doc.text("Customer Ledger (All Groups & Tickets)", center, yPos, { align: "center" });
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [["SL. NO", "Date", "Amount", "Receipt No", "Old Receipt No", "Payment Type", "Balance"]],
      body: TableEnrolls.map((e, i) => [
        i + 1,
        safe(e.date),
        formatAmount(e.amount),
        safe(e.receipt),
        safe(e.old_receipt),
        safe(e.type),
        formatAmount(e.balance),
      ]),
      theme: "grid",
      headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: "bold" },
      styles: { font: "helvetica", fontSize: 8, cellPadding: 3 },
    });
    yPos = doc.lastAutoTable.finalY + 12;
  }

  // ========== TRANSACTIONS ==========


  // if (Array.isArray(customerTransactions) && customerTransactions.length > 0) {
  //   doc.setFontSize(10);
  //   yPos += 8;
  //   doc.text("Payment Transactions", 14, yPos);
  //   yPos += 4;

  //   const { chit = [], loan = [], pigme = [] } = customerTransactions[0] || {};

  //   const drawTableSection = (title, data = []) => {
  //     if (!Array.isArray(data) || data.length === 0) return;
  //     yPos += 8;
  //     doc.setFont("helvetica", "bold");
  //     doc.text(title, 14, yPos);
  //     yPos += 2;

  //     const tableData = [];

  //     data.forEach((item, i) => {
  //       const groupName =
  //         item._id?.group_id?.group_name ||
  //         item._id?.loan?.loan_no ||
  //         item._id?.pigme?.pigme_no ||
  //         "-";

  //       const payments = Array.isArray(item._id?.payments) ? item._id.payments : [];

  //       payments.forEach((p, index) => {
  //         tableData.push([
  //           `${i + 1}.${index + 1}`,
  //           safe(item._id?.user_id?.full_name),
  //           groupName,
  //           safe(p.ticket),
  //           safe(p.receipt_no),
  //           safe(p.pay_date),
  //           safe(p.pay_type),
  //           formatAmount(p.amount),
  //         ]);
  //       });

  //       // Show total paid using total_paid_amount
  //       if (item.total_paid_amount) {
  //         doc.setFont("helvetica", "bold");
  //         doc.setFontSize(9);
  //         doc.text(
  //           `Total Paid for Ticket ${item._id?.ticket} (${groupName}): ${formatAmount(item.total_paid_amount)}`,
  //           14,
  //           yPos + 4
  //         );
  //         yPos += 10;
  //       }
  //     });

  //     if (tableData.length > 0) {
  //       autoTable(doc, {
  //         startY: yPos + 4,
  //         head: [
  //           ["#", "Customer", "Group / Loan / Pigme", "Ticket", "Receipt No", "Pay Date", "Pay Type", "Amount"],
  //         ],
  //         body: tableData,
  //         styles: { fontSize: 8, cellPadding: 2 },
  //         headStyles: {
  //           fillColor: [240, 248, 255],
  //           textColor: [0, 0, 0],
  //           fontStyle: "bold",
  //         },
  //         alternateRowStyles: { fillColor: [250, 250, 250] },
  //         margin: { left: 14, right: 14 },
  //       });
  //       yPos = doc.lastAutoTable.finalY + 4;
  //     }
  //   };

  //   drawTableSection("Chit Transactions", chit);
  //   drawTableSection("Loan Transactions", loan);
  //   drawTableSection("Pigme Transactions", pigme);
  // }

  // if (Array.isArray(customerTransactions) && customerTransactions.length > 0) {
  //   doc.setFontSize(10);
  //   yPos += 8;
  //   doc.text("Payment Transactions", 14, yPos);
  //   yPos += 4;

  //   const { chit = [], loan = [], pigme = [] } = customerTransactions[0] || {};

  //   const drawTableSection = (title, data = []) => {
  //     if (!Array.isArray(data) || data.length === 0) return;
  //     yPos += 8;
  //     doc.setFont("helvetica", "bold");
  //     doc.text(title, 14, yPos);
  //     yPos += 4; // Extra space before first group starts

  //     data.forEach((item, i) => {
  //       const groupName =
  //         item._id?.group_id?.group_name ||
  //         item._id?.loan?.loan_no ||
  //         item._id?.pigme?.pigme_no ||
  //         "-";
  //       const ticket = safe(item._id?.ticket);
  //       const payments = Array.isArray(item._id?.payments) ? item._id.payments : [];

  //       // --- Group/Ticket Header ---
  //       doc.setFont("helvetica", "bold");
  //       doc.setFontSize(10);
  //       doc.text(`Group/Loan/Pigme: ${groupName} | Ticket: ${ticket}`, 14, yPos);
  //       yPos += 4;

  //       const tableData = [];

  //       payments.forEach((p, index) => {
  //         tableData.push([
  //           `${index + 1}`, // Changed from i+1.index+1 to just index+1 for sequential numbering within the ticket
  //           safe(item._id?.user_id?.full_name),
  //           groupName, // Included group_name explicitly
  //           ticket, // Included ticket explicitly
  //           safe(p.receipt_no),
  //           safe(p.pay_date),
  //           safe(p.pay_type),
  //           formatAmount(p.amount),
  //         ]);
  //       });

  //       if (tableData.length > 0) {
  //         autoTable(doc, {
  //           startY: yPos,
  //           head: [
  //             ["#", "Customer", "Group / Loan / Pigme", "Ticket", "Receipt No", "Pay Date", "Pay Type", "Amount"],
  //           ],
  //           body: tableData,
  //           styles: { fontSize: 8, cellPadding: 2 },
  //           headStyles: {
  //             fillColor: [240, 248, 255],
  //             textColor: [0, 0, 0],
  //             fontStyle: "bold",
  //           },
  //           alternateRowStyles: { fillColor: [250, 250, 250] },
  //           margin: { left: 14, right: 14 },
  //         });

  //         yPos = doc.lastAutoTable.finalY + 1; // Start below the table

  //         // --- Total Paid Amount for Group/Ticket ---
  //         if (item.total_paid_amount) {
  //           doc.setFont("helvetica", "bold");
  //           doc.setFontSize(10);
  //           // Using doc.lastAutoTable.finalY to align the total nicely
  //           doc.text(
  //             `Total Paid for Ticket ${ticket} (${groupName}): ${formatAmount(item.total_paid_amount)}`,
  //             doc.internal.pageSize.width - 14, // Aligned to the right
  //             yPos + 2,
  //             { align: "right" }
  //           );
  //           yPos += 8;
  //         }

  //         // --- 5cm (50mm) space after each group/ticket transactions ---
  //         yPos += 50; // Add 50mm of space for the next group
  //       }
  //     });
  //   };

  //   drawTableSection("Chit Transactions", chit);
  //   drawTableSection("Loan Transactions", loan);
  //   drawTableSection("Pigme Transactions", pigme);
  // }

  if (Array.isArray(customerTransactions) && customerTransactions.length > 0) {
  doc.setFontSize(15);
  doc.text("Payment Transactions", center, yPos, { align: "center" });
  yPos += 6;

  // ✅ Safe helper functions
  const safe = (value) => (value !== undefined && value !== null ? String(value) : "");
  const formatAmount = (value) => {
    if (isNaN(value)) return "0";
    return String(Number(value).toLocaleString("en-IN"));
  };

  const { chit = [], loan = [], pigme = [] } = customerTransactions[0] || {};

  const drawTableSection = (title, data = []) => {
    if (!Array.isArray(data) || data.length === 0) return;

    yPos += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(String(title), leftX, yPos);
    yPos += 5;

    data.forEach((item, i) => {
      const groupName =
        item._id?.group_id?.group_name ||
        item._id?.loan?.loan_no ||
        item._id?.pigme?.pigme_no ||
        "N/A Group";
      const ticket = safe(item._id?.ticket) || "N/A Ticket";
      const payments = Array.isArray(item._id?.payments) ? item._id.payments : [];

      if (payments.length === 0) return;

      // --- Group/Ticket Header ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
     // doc.text(`Group/Ticket: ${String(groupName)} - ${String(ticket)}`, leftX, yPos);
      yPos += 4;

      const tableData = payments.map((p, index) => [
        String(index + 1),
        String(groupName), // Group Name explicitly
        String(ticket), // Ticket explicitly
        safe(p.receipt_no),
        safe(p.pay_date),
        safe(p.pay_type),
        formatAmount(p.amount),
      ]);

      // Transaction Table with fixed columns
      autoTable(doc, {
        startY: yPos,
        head: [
          ["#", "Group / Loan / Pigme", "Ticket", "Receipt No", "Pay Date", "Pay Type", "Amount"],
        ],
        body: tableData,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: {
          fillColor: [230, 245, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: leftX, right: 20 },
      });

      yPos = doc.lastAutoTable.finalY + 3;

      // --- Total Paid Amount Card (Centered) ---
      if (item.total_paid_amount) {
        const totalCardW = 100; // Width of the card
        const totalCardH = 18; // Height of the card
        const totalCardX = center - totalCardW / 2;
        const totalCardY = yPos;

        // Draw Card Background
        doc.setDrawColor(180, 180, 180); // Border color
        doc.setFillColor(240, 255, 240); // Light green background
        doc.roundedRect(totalCardX, totalCardY, totalCardW, totalCardH, 2, 2, "FD");

        // Add Label Text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        doc.text(
          `Total Paid for Ticket ${String(ticket)} (${String(groupName)}):`,
          center,
          totalCardY + 5,
          { align: "center" }
        );

        // Add Amount Text ( always string)
        doc.setFontSize(14);
        doc.setTextColor(0, 100, 0);
        doc.text(String(formatAmount(item.total_paid_amount)), center, totalCardY + 14, {
          align: "center",
        });

        yPos = totalCardY + totalCardH + 5;
      }

      // --- 5cm (50mm) space after each group/ticket transactions ---
      yPos += 10;
    });

    // Adjust yPos between (Chit, Loan, Pigme)
    yPos -= 40;
  };

  drawTableSection("Chit Transactions", chit);
  drawTableSection("Loan Transactions", loan);
  drawTableSection("Pigme Transactions", pigme);

  // Final Y position after all tables
  yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : yPos + 20;
}


  // ========== FOOTER ==========
  const finalY = doc.internal.pageSize.height - 20;
  doc.setDrawColor(220);
  doc.line(leftX, finalY - 5, pageWidth - 20, finalY - 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text("Issued By: Super Admin", leftX, finalY);
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("*** This is a computer generated document, no signature is required ***", center, finalY, {
    align: "center",
  });

  const name = group?.full_name ? group.full_name.replace(/\s+/g, "_") : "Customer";
  const pdfBlobUrl = doc.output("bloburl");

  // Open preview in new tab
  window.open(pdfBlobUrl);

  // Optional: if you want to let user confirm saving after preview
  setTimeout(() => {
    if (window.confirm("Do you want to download this Customer Report PDF?")) {
      doc.save(`CustomerReport_${name}_${new Date().toISOString().split("T")[0]}.pdf`);
    }
  }, 1500);

  // const name = group?.full_name ? group.full_name.replace(/\s+/g, "_") : "Customer";
  // doc.save(`CustomerReport_${name}_${new Date().toISOString().split("T")[0]}.pdf`);
};

export default CustomerReportPrint;
