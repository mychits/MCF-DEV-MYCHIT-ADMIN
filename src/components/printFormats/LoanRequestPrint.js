import api from "../../instance/TokenInstance";
import jsPDF from "jspdf";
import imageInput from "../../assets/images/Agent.png";




const handleLoanRequestPrint = async (id) => {
  try {
    const response = await api.get(`/loans/get-borrower/${id}`);
    const loan = response?.data;

    if (!loan) {
      console.error("Loan data not found");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    /* ===================== COLORS ===================== */
    const colors = {
      primary: [0, 38, 124],
      accent: [212, 175, 55],
      text: [33, 33, 33],
      white: [255, 255, 255],
      background: [248, 250, 252],
      border: [220, 224, 230],
    };

    /* ===================== HELPERS ===================== */
    const safeText = (val) => {
      if (val === null || val === undefined) return "N/A";
      if (typeof val === "object") return "N/A";
      return String(val);
    };

    const setBackground = () => {
      doc.setFillColor(...colors.background);
      doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");
    };

    const drawHeader = (title) => {
      doc.addImage(imageInput, "PNG", 90, 8, 30, 30);

      doc.setFillColor(...colors.primary);
      doc.rect(0, 40, doc.internal.pageSize.width, 15, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...colors.white);
      doc.text(title, doc.internal.pageSize.width / 2, 49, { align: "center" });

      doc.setDrawColor(...colors.accent);
      doc.setLineWidth(0.5);
      doc.line(15, 58, doc.internal.pageSize.width - 15, 58);

      return 65;
    };

    const drawFooter = () => {
      const y = doc.internal.pageSize.height - 25;
      doc.setFillColor(...colors.primary);
      doc.rect(0, y, doc.internal.pageSize.width, 25, "F");

      doc.setFontSize(9);
      doc.setTextColor(...colors.white);
      doc.text(
        "VIJAYA VINAYAK CHIT FUNDS PRIVATE LIMITED",
        doc.internal.pageSize.width / 2,
        y + 7,
        { align: "center" }
      );
      doc.text("#11/36-25, 3rd Floor, 2nd Main, Kathriguppe Main Road, Banshankari 3rd Stage, Bengaluru-560085", 
               doc.internal.pageSize.width / 2, y + 12, { align: 'center' });
      doc.text("Mob: 9483900777 | Ph: 080-4979 8763 | Email: info.mychits@gmail.com | Website: www.mychits.co.in", 
               doc.internal.pageSize.width / 2, y + 17, { align: 'center' });
     
    };

    const drawSectionTitle = (title, y) => {
      doc.setFillColor(...colors.primary);
      doc.rect(15, y, doc.internal.pageSize.width - 30, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...colors.white);
      doc.text(title, 20, y + 5.5);

      return y + 15;
    };

    const drawField = (label, value, x, y, width) => {
      const textValue = safeText(value);

      doc.setFillColor(...colors.white);
      doc.setDrawColor(...colors.border);
      doc.rect(x, y, width, 8, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colors.primary);
      doc.text(`${label}:`, x + 3, y + 5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.text);
      doc.text(textValue, x + 40, y + 5);

      return y + 12;
    };

    const drawTwoColumn = (fields, y) => {
      const colWidth = doc.internal.pageSize.width / 2 - 20;
      const col1X = 15;
      const col2X = doc.internal.pageSize.width / 2 + 5;

      fields.forEach((f, i) => {
        if (i % 2 === 0) {
          y = drawField(f.label, f.value, col1X, y, colWidth);
        } else {
          y = drawField(f.label, f.value, col2X, y - 12, colWidth);
        }
      });

      return y;
    };

    /* ===================== PAGE CONTENT ===================== */
    setBackground();
    let y = drawHeader("Loan Request Application");

    // Loan Summary
    y = drawSectionTitle("Loan Summary", y);
    y = drawTwoColumn(
      [
        { label: "Loan ID", value: loan?.loan_id },
        { label: "Loan Amount", value: `₹ ${loan?.loan_amount}` },
        { label: "Tenure (Days)", value: loan?.tenure },
        { label: "Daily Payment", value: `₹ ${loan?.daily_payment_amount}` },
        { label: "Service Charges", value: `₹ ${loan?.service_charges}` },
        {label: "Payment Type", value: `${loan?.note}`}
      ],
      y
    );

    // Borrower Details
    y = drawSectionTitle("Borrower Details", y + 5);
    y = drawTwoColumn(
      [
        { label: "Borrower Name", value: loan?.borrower?.full_name },
        { label: "Phone Number", value: loan?.borrower?.phone_number },
        { label: "Email", value: loan?.borrower?.email },
      ],
      y
    );

    // Loan Period
    y = drawSectionTitle("Loan Period", y + 5);
    y = drawTwoColumn(
      [
        { label: "Start Date", value: loan?.start_date?.split("T")[0] },
        { label: "End Date", value: loan?.end_date?.split("T")[0] },
      ],
      y
    );

    // Referral Details
    y = drawSectionTitle("Referral Details", y + 5);
    y = drawTwoColumn(
      [
        { label: "Referred Type", value: loan?.referred_type },
        { label: "Employee Name", value: loan?.referred_employee?.name || "N/A" },
        { label: "Employee Phone", value: loan?.referred_employee?.phone_number || "N/A" },
      ],
      y
    );



    // Declaration
    y += 10;
    doc.rect(15, y, doc.internal.pageSize.width - 30, 20);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(
      "I hereby declare that the above loan information is true and correct.",
      doc.internal.pageSize.width / 2,
      y + 10,
      { align: "center" }
    );

    doc.setFont("helvetica", "bold");
    doc.text("Borrower Signature", 25, y + 18);
    doc.line(70, y + 18, 120, y + 18);

    drawFooter();

    /* ===================== SAVE ===================== */
    doc.save(`${loan?.loan_id}_Loan_Request.pdf`);
  } catch (error) {
    console.error("Loan PDF Error:", error);
  }
};





export default handleLoanRequestPrint;