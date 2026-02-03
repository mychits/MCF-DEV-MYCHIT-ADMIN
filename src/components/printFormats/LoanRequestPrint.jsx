import api from "../../instance/TokenInstance";
import jsPDF from "jspdf";
import imageInput from "../../assets/images/Agent.png";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { useEffect, useState, useRef } from "react";





const LoanRequestPrint = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchLoan = async () => {
      const res = await api.get(`/loans/get-borrower/${id}`);
      setLoan(res.data);
    };

    fetchLoan();
  }, [id]);

  if (!loan) return null;

  // Common data structure for the PDF
  const sections = [
    {
      title: "Customer Details",
      fields: [
        { label: "Customer Name", value: loan?.borrower?.full_name },
        { label: "Phone Number", value: loan?.borrower?.phone_number },
        { label: "Email", value: loan?.borrower?.email },
      ],
    },
    {
      title: "Loan Summary",
      fields: [
        { label: "Loan ID", value: loan?.loan_id },
        { label: "Sanction Date", value: loan?.loan_sanction_date?.split("T")[0] },
        { label: "Loan Amount", value: loan?.loan_amount },
        { label: "Tenure (Days)", value: loan?.tenure },
        { label: "Start Date", value: loan?.start_date?.split("T")[0] },
        { label: "End Date", value: loan?.end_date?.split("T")[0] },
        { label: "Daily Payment", value: loan?.daily_payment_amount },
        { label: "Service Charges", value: loan?.service_charges },
        { label: "Documentation Charges", value: loan?.document_charges },
        { label: "Description", value: loan?.note },
      ],
    },
    {
      title: "Referral Details",
      fields: [
        { label: "Referred Type", value: loan?.referred_type },
        { label: "Employee Name", value: loan?.referred_employee?.name || "N/A" },
        { label: "Employee Phone", value: loan?.referred_employee?.phone_number || "N/A" },
      ],
    },
  ];

  const generateAndOpenPDF = (downloadOnly = false) => {
    const doc = new jsPDF("p", "mm", "a4");

    const safeText = (v) => (v ? String(v) : "N/A");

    let y = 65;

    doc.addImage(imageInput, "PNG", 90, 8, 30, 30);

    doc.setFillColor(0, 38, 124);
    doc.rect(0, 40, 210, 15, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Loan Request Application", 105, 49, { align: "center" });

    const drawField = (label, value, x, y) => {
      doc.setDrawColor(220, 224, 230);
      doc.rect(x, y, 80, 8);

      doc.setTextColor(0, 38, 124);
      doc.setFontSize(9);
      doc.text(label + ":", x + 2, y + 5);

      doc.setTextColor(33, 33, 33);
      doc.text(safeText(value), x + 40, y + 5);

      return y + 12;
    };

    sections.forEach((sec) => {
      doc.setFillColor(0, 38, 124);
      doc.rect(15, y, 180, 8, "F");

      doc.setTextColor(255, 255, 255);
      doc.text(sec.title, 20, y + 5);

      y += 15;

      sec.fields.forEach((f, i) => {
        const x = i % 2 === 0 ? 15 : 110;
        y = drawField(f.label, f.value, x, i % 2 ? y - 12 : y);
      });

      y += 5;
    });

    // Add declaration and signature
    doc.setFontSize(10);
    doc.text("I hereby declare that the above loan information is true and correct.", 105, y + 10, { align: "center" });
    
    // Signature box
    doc.setDrawColor(0, 0, 0);
    doc.rect(80, y + 20, 50, 20);
    doc.text("Customer Signature", 105, y + 33, { align: "center" });

    // Footer
    doc.setFillColor(0, 38, 124);
    doc.rect(0, 280, 210, 15, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("VIJAYA VINAYAK CHIT FUNDS PRIVATE LIMITED", 105, 288, { align: "center" });

    if (downloadOnly) {
      // Direct download
      doc.save(`${loan?.loan_id}_Loan_Request.pdf`);
    } else {
      // Open in new window for preview and print
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Open in new window
      const printWindow = window.open(pdfUrl, "_blank");
      
      // Set title
      if (printWindow) {
        printWindow.document.title = `${loan?.loan_id}_Loan_Request.pdf`;
        
        // Optional: Auto-trigger print dialog
       
      }
    }
  };

  const styles = {
    page: { 
      padding: 20, 
      background: "#e5e7eb",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh"
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "10px",
      marginTop: 20,
    },
    btn: {
      padding: "10px 20px",
      background: "#00267c",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      borderRadius: "4px",
      fontSize: "16px",
      fontWeight: "bold",
    }
  };

  return (
     <div className="bg-gray-200 p-5 min-h-screen flex flex-col items-center">
      {/* PDF Preview Container */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-4xl mb-5">
        {/* Header */}
        <div className="bg-blue-900 text-white p-4 flex flex-col items-center">
          <img src={imageInput} alt="Company Logo" className="w-20 h-20 mb-2" />
          <h2 className="text-xl font-bold">Loan Request Application</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <div className="bg-blue-900 text-white p-2 mb-3">
                <h3 className="font-semibold">{section.title}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="border border-gray-300 p-2 rounded">
                    <div className="text-blue-900 text-sm font-medium">{field.label}:</div>
                    <div className="text-gray-800">{field.value || "N/A"}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Declaration */}
          <div className="text-center my-6">
            <p className="text-gray-700">
              I hereby declare that the above loan information is true and correct.
            </p>
          </div>

          {/* Signature Box */}
          <div className="flex justify-center my-6">
            <div className="border border-black w-48 h-16 flex items-center justify-center">
              <span className="text-gray-700">Customer Signature</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-blue-900 text-white text-center p-3 text-sm">
          VIJAYA VINAYAK CHIT FUNDS PRIVATE LIMITED
        </div>
      </div>

      {/* Button Container */}
      <div className="flex justify-center gap-4">
        <button 
          className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          onClick={() => generateAndOpenPDF(false)}
        >
          Preview & Print
        </button>
      </div>
    </div>
  );
};

export default LoanRequestPrint;









