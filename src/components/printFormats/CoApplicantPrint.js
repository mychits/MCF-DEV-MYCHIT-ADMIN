import api from "../../instance/TokenInstance";
import jsPDF from "jspdf";
import imageInput from "../../assets/images/Agent.png";



// const handleCoApplicantPrint = async (id) => {
//   try {
//     const response = await api.get(`/coapplicant/get-co-applicant-info-by-id/${id}`);
//     const coapplicant = response?.data?.coApplicant;

//     const doc = new jsPDF("p", "mm", "a4");
//     //doc.setFillColor(201, 216, 250);

//     // doc.setFillColor(201, 216, 250); // Light blue
//     // doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

//      const setBackground = () => {
//       doc.setFillColor(201, 216, 250); // Light Blue color
//       doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F'); // Fill the whole page with color
//     };
     
//     // === UTILITY DRAW FUNCTIONS ===
//     const drawTextBox1 = (text, x, y, padding = 4, lineHeight = 12, radius = 2) => {
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const margin = 15;
//       const availableWidth = pageWidth - 2 * margin;
//       const boxWidth = availableWidth + 10;
//       const boxHeight = lineHeight;

//       doc.setDrawColor(0);
//       doc.setFillColor(0, 38, 124);
//       doc.roundedRect(x, y, boxWidth, boxHeight, radius, radius, "FD");

//       doc.setTextColor(255, 255, 255);
//       doc.text(text, x + padding, y + lineHeight - 4);
//     };

//     const drawTextBox3 = (text, x, y, padding = 4, lineHeight = 12, radius = 2) => {
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const margin = 15;
//       const availableWidth = pageWidth - 2 * margin;
//       const boxWidth = availableWidth + 10;
//       const boxHeight = lineHeight;

//       doc.setDrawColor(0);
//       doc.setFillColor(255, 255, 255);
//       doc.roundedRect(x, y, boxWidth, boxHeight, radius, radius, "FD");

//       doc.setTextColor(0, 0, 0);
//       doc.text(text, x + padding, y + lineHeight - 4);
//     };

//     const drawTextBox2 = (text, y, lineHeight = 12, radius = 2) => {
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const margin = 1;
//       const boxWidth = pageWidth - 2 * margin;
//       const boxHeight = lineHeight;
//       const x = margin;

//       doc.setDrawColor(0);
//       doc.setFillColor(0, 38, 124);
//       doc.roundedRect(x, y, boxWidth, boxHeight, radius, radius, "FD");

//       const textWidth = doc.getTextWidth(text);
//       const textX = x + (boxWidth - textWidth) / 2;

//       doc.setTextColor(255, 255, 255);
//       doc.text(text, textX, y + lineHeight - 4);
//     };

//     const drawTextBox = (text, x, y, padding = 4, lineHeight = 12, radius = 2) => {
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const margin = 15;
//       const availableWidth = pageWidth - 2 * margin;
//       const boxWidth = availableWidth / 2;
//       const boxHeight = lineHeight;

//       doc.setDrawColor(0);
//       doc.setFillColor(255, 255, 255);
//       doc.roundedRect(x, y, boxWidth, boxHeight, radius, radius, "FD");

//       doc.setTextColor(0, 0, 0);
//       doc.text(text, x + padding, y + lineHeight - 4);
//     };

//     const drawTextBoxWithMultipleLines = (y, lineHeight = 8) => {
//       const docWidth = doc.internal.pageSize.getWidth();
//       const margin = 0.1;
//       const x = margin;
//       const boxWidth = docWidth - 2 * margin;

//       const lines = [
//         {
//           text: "VIJAYA VINAYAK CHIT FUNDS PRIVATE LIMITED",
//           color: [212, 175, 55],
//         },
//         {
//           text: "#11/36-25, 3rd Floor, 2nd Main, Kathriguppe Main Road, Banshankari 3rd Stage, Bengaluru-560085",
//           color: [255, 255, 255],
//         },
//         {
//           text: "Mob: 9483900777 | Ph: 080-4979 8763 | Email: info.mychits@gmail.com | Website: www.mychits.co.in",
//           color: [255, 255, 255],
//         },
//       ];

//       const boxHeight = lineHeight * lines.length;

//       doc.setDrawColor(180);
//       doc.setFillColor(128, 128, 128);
//       doc.rect(x + 1.5, y + 1.5, boxWidth, boxHeight, "F");

//       doc.setDrawColor(0);
//       doc.setFillColor(0, 38, 124);
//       doc.rect(x, y, boxWidth, boxHeight, "FD");

//       lines.forEach((line, index) => {
//         doc.setTextColor(...line.color);
//         const textWidth = doc.getTextWidth(line.text);
//         const textX = x + (boxWidth - textWidth) / 2;
//         const textY = y + index * lineHeight;
//         doc.text(line.text, textX, textY + lineHeight * 0.75);
//       });
//     };
//    setBackground();
//     // ================= PAGE 1 =================
//     doc.addImage(imageInput, "PNG", 90, 3, 30, 30);
//     doc.setFontSize(20);
//     doc.setFont("helvetica", "bold");
//     drawTextBox2("Co Applicant Application INFORMATION FORM", 35);

//     doc.setFontSize(12);
//     drawTextBox(`Customer Name: ${coapplicant?.user_id?.full_name || ""}`, 10, 50);
//     drawTextBox(`Date: ${new Date().toLocaleDateString("en-GB")}`, 110, 50);
//     drawTextBox3(
//       `Enrollment : ${(coapplicant?.enrollment_ids || [])
//         .map(e => `${e.group_id?.group_name || "N/A"} | Ticket: ${e.tickets || "N/A"}`)
//         .join(", ") || "N/A"}`,
//       10,
//       65
//     );

//     doc.setFontSize(15);
//     drawTextBox1("Personal / KYC Details:", 10, 85);
//     doc.setFontSize(12);

//     // Personal
//     drawTextBox(`Name: ${coapplicant?.co_applicant_name || ""}`, 10, 100);
//     drawTextBox(`Phone: ${coapplicant?.co_applicant_phone_number || ""}`, 110, 100);
//     drawTextBox(`Email: ${coapplicant?.co_applicant_email || ""}`, 10, 115);
//     drawTextBox(`Alternate No: ${coapplicant?.co_applicant_alternate_number || ""}`, 110, 115);
//     drawTextBox(`DOB: ${coapplicant?.co_applicant_dateofbirth?.split("T")[0] || ""}`, 10, 130);
//     drawTextBox(`Gender: ${coapplicant?.co_applicant_gender || ""}`, 110, 130);
//     drawTextBox(`Marital Status: ${coapplicant?.co_applicant_marital_status || ""}`, 10, 145);
//     drawTextBox(`Nationality: ${coapplicant?.co_applicant_nationality || ""}`, 110, 145);
//     drawTextBox(`Father Name: ${coapplicant?.co_applicant_father_name || ""}`, 10, 160);
//     drawTextBox(`Referred Type: ${coapplicant?.co_applicant_referred_type || ""}`, 110, 160);

//     drawTextBox3(`Address: ${coapplicant?.co_applicant_address || ""}`, 10, 175);
//     drawTextBox(`Village: ${coapplicant?.co_applicant_village || ""}`, 10, 190);
//     drawTextBox(`Taluk: ${coapplicant?.co_applicant_taluk || ""}`, 110, 190);
//     drawTextBox(`District: ${coapplicant?.co_applicant_district || ""}`, 10, 205);
//     drawTextBox(`State: ${coapplicant?.co_applicant_state || ""}`, 110, 205);
//     drawTextBox(`Pincode: ${coapplicant?.co_applicant_pincode || ""}`, 10, 220);

//     // KYC
//     drawTextBox1("KYC Information:", 10, 240);
//     drawTextBox(`Aadhaar No: ${coapplicant?.co_applicant_adhaar_no || ""}`, 10, 255);
//     drawTextBox(`PAN No: ${coapplicant?.co_applicant_pan_no || ""}`, 110, 255);
//     drawTextBox(`Document Name: ${coapplicant?.co_applicant_document_name || ""}`, 10, 270);
//     drawTextBox(`Relationship Type: ${coapplicant?.co_applicant_relationship_type || ""}`, 110, 270);

//     // PAGE BREAK
//     doc.addPage();
//      setBackground();

//     // ================= PAGE 2 =================
//     doc.addImage(imageInput, "PNG", 90, 3, 30, 30);
//     doc.setFontSize(20);
//     doc.setFont("helvetica", "bold");
//     drawTextBox2("Co Applicant Application INFORMATION FORM (Contd.)", 35);

//     doc.setFontSize(15);
//     drawTextBox1("Bank Details:", 10, 55);
//     doc.setFontSize(12);
//     drawTextBox(`Bank Name: ${coapplicant?.co_applicant_bank_name || ""}`, 10, 70);
//     drawTextBox(`Account No: ${coapplicant?.co_applicant_bank_account_number || ""}`, 110, 70);
//     drawTextBox(`Branch: ${coapplicant?.co_applicant_bank_branch || ""}`, 10, 85);
//     drawTextBox(`IFSC: ${coapplicant?.co_applicant_bank_ifsc_code || ""}`, 110, 85);

//     doc.setFontSize(15);
//     drawTextBox1("Occupation / Business:", 10, 105);
//     doc.setFontSize(12);
//     drawTextBox(`Occupation: ${coapplicant?.co_applicant_occupation || ""}`, 10, 120);
//     drawTextBox(`Sector: ${coapplicant?.co_applicant_sector_name || ""}`, 110, 120);
//     drawTextBox(`Sub Occupation: ${coapplicant?.co_applicant_occupation_sub || ""}`, 10, 135);
//     drawTextBox(`Profession Type: ${coapplicant?.co_applicant_profession_type || ""}`, 110, 135);
//     drawTextBox(`Business Type: ${coapplicant?.co_applicant_bussiness_type || ""}`, 10, 150);
//     drawTextBox(`Business Name: ${coapplicant?.co_applicant_bussiness_name || ""}`, 110, 150);
//     drawTextBox3(`Business Address: ${coapplicant?.co_applicant_bussiness_address || ""}`, 10, 165);

//     doc.setFontSize(15);
//     drawTextBox1("Property / Agriculture:", 10, 185);
//     doc.setFontSize(12);
//     drawTextBox(`Agri RTC No: ${coapplicant?.co_applicant_agri_rtc_no || ""}`, 10, 200);
//     drawTextBox(`Land Holdings: ${coapplicant?.co_applicant_land_holdings || ""}`, 110, 200);
//     drawTextBox(`All Docs Name: ${coapplicant?.co_applicant_all_document_name || ""}`, 10, 215);
//     drawTextBox(`Consent Document: ${coapplicant?.co_applicant_consent_document || ""}`, 110, 215);
//     drawTextBox3(`Description: ${coapplicant?.co_applicant_description || ""}`, 10, 230);

//     // Footer
//     doc.setFontSize(11);
//     doc.text("I / We hereby confirm the above co-applicant details are true to the best of my knowledge.", 12, 260);
//     doc.text("Signature of the Subscriber", 10, 280);

//     drawTextBoxWithMultipleLines(282);

//     // Save
//     const name = coapplicant?.co_applicant_name || coapplicant?.user_co_applicant || "Co Applicant";
//     doc.save(`${name.replace(/\s+/g, "_")}_Co_ApplicantForm.pdf`);
//   } catch (error) {
//     console.error("Error generating Co_Applicant PDF:", error);
//   }
// };

const handleCoApplicantPrint = async (id) => {
  try {
    const response = await api.get(`/coapplicant/get-co-applicant-info-by-id/${id}`);
    const coapplicant = response?.data?.coApplicant;

    const doc = new jsPDF("p", "mm", "a4");
    
    // Color scheme
    const colors = {
      primary: [0, 38, 124],        // Deep blue
      secondary: [201, 216, 250],   // Light blue
      accent: [212, 175, 55],       // Gold
      text: [33, 33, 33],           // Dark gray
      lightText: [100, 100, 100],   // Light gray
      white: [255, 255, 255],
      background: [248, 250, 252],  // Very light blue
      border: [220, 224, 230]       // Light gray border
    };
    
    // Set background for all pages
    const setBackground = () => {
      doc.setFillColor(...colors.background);
      doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
    };
    
    // Header design
    const drawHeader = (title) => {
      // Logo
      doc.addImage(imageInput, "PNG", 90, 8, 30, 30);
      
      // Header bar
      doc.setFillColor(...colors.primary);
      doc.rect(0, 40, doc.internal.pageSize.width, 15, 'F');
      
      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...colors.white);
      doc.text(title, doc.internal.pageSize.width / 2, 49, { align: 'center' });
      
      // Decorative line
      doc.setDrawColor(...colors.accent);
      doc.setLineWidth(0.5);
      doc.line(15, 58, doc.internal.pageSize.width - 15, 58);
      
      return 65; // Return Y position for next element
    };
    
    // Footer design
    const drawFooter = () => {
      const footerY = doc.internal.pageSize.height - 25;
      
      // Footer bar
      doc.setFillColor(...colors.primary);
      doc.rect(0, footerY, doc.internal.pageSize.width, 25, 'F');
      
      // Company information
      doc.setFontSize(9);
      doc.setTextColor(...colors.white);
      doc.text("VIJAYA VINAYAK CHIT FUNDS PRIVATE LIMITED", doc.internal.pageSize.width / 2, footerY + 7, { align: 'center' });
      doc.text("#11/36-25, 3rd Floor, 2nd Main, Kathriguppe Main Road, Banshankari 3rd Stage, Bengaluru-560085", 
               doc.internal.pageSize.width / 2, footerY + 12, { align: 'center' });
      doc.text("Mob: 9483900777 | Ph: 080-4979 8763 | Email: info.mychits@gmail.com | Website: www.mychits.co.in", 
               doc.internal.pageSize.width / 2, footerY + 17, { align: 'center' });
    };
    
    // Section title
    const drawSectionTitle = (title, y) => {
      // Section title background
      doc.setFillColor(...colors.primary);
      doc.rect(15, y, doc.internal.pageSize.width - 30, 8, 'F');
      
      // Section title text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...colors.white);
      doc.text(title, 20, y + 5.5);
      
      return y + 15; // Return Y position for next element
    };

   const drawSectioncusTitle = (title, y) => {
  const pageWidth = doc.internal.pageSize.width;
  const centerX = pageWidth / 2;

  // Section title background
  doc.setFillColor(...colors.primary);
  doc.rect(15, y, pageWidth - 30, 8, 'F');

  // Section title text (centered)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...colors.white);
  doc.text(title, centerX, y + 5.5, { align: 'center' });

  return y + 15;
};
    
    // Form field - single line
    const drawFormField = (label, value, x, y, width) => {
      // Field background
      doc.setFillColor(...colors.white);
      doc.setDrawColor(...colors.border);
      doc.rect(x, y, width, 8, 'FD');
      
      // Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colors.primary);
      doc.text(label + ":", x + 3, y + 5);
      
      // Value
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...colors.text);
      doc.text(value || "N/A", x + 35, y + 5);
      
      return y + 12; // Return Y position for next element
    };
    
    // Form field - full width
    const drawFullWidthFormField = (label, value, x, y) => {
      const width = doc.internal.pageSize.width - 30;
      
      // Field background
      doc.setFillColor(...colors.white);
      doc.setDrawColor(...colors.border);
      doc.rect(x, y, width, 8, 'FD');
      
      // Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colors.primary);
      doc.text(label + ":", x + 3, y + 5);
      
      // Value
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...colors.text);
      const valueX = x + 35;
      const maxWidth = width - 38;
      
      // Handle long text
      if (doc.getTextWidth(value || "N/A") > maxWidth) {
        const splitText = doc.splitTextToSize(value || "N/A", maxWidth);
        doc.text(splitText, valueX, y + 5);
        return y + 8 + (splitText.length - 1) * 4;
      } else {
        doc.text(value || "N/A", valueX, y + 5);
        return y + 12;
      }
    };
    
    // Two column form fields
    const drawTwoColumnFields = (fields, startY) => {
      let y = startY;
      const col1X = 15;
      const col2X = doc.internal.pageSize.width / 2 + 5;
      const colWidth = doc.internal.pageSize.width / 2 - 20;
      
      fields.forEach((field, index) => {
        if (index % 2 === 0) {
          y = drawFormField(field.label, field.value, col1X, y, colWidth);
        } else {
          y = drawFormField(field.label, field.value, col2X, y - 12, colWidth);
        }
      });
      
      return y;
    };
    
    // ================= PAGE 1 =================
    setBackground();
    let currentY = drawHeader("Co-Applicant Application Form");
    
    // Customer information section
    doc.setFillColor(...colors.secondary);
    // FIX: Corrected the roundedRect call here
    // doc.roundedRect(15, currentY - 5, doc.internal.pageSize.width - 30, 8, 2, 2, 'F'); 
    // doc.setFont("helvetica", "bold");
    // doc.setFontSize(10);
    // doc.setTextColor(...colors.primary);
    // doc.text("Customer Information", 20, currentY);
    currentY = drawSectioncusTitle("Customer Information", currentY)
    currentY += 10;
    // currentY = drawSectionTitle("Customer Information", currentY + 5)

    
    currentY = drawTwoColumnFields([
      { label: "Customer Name", value: coapplicant?.user_id?.full_name || "" },
      { label: "Date", value: new Date().toLocaleDateString("en-GB") },
      { label: "Enrollment", value: (coapplicant?.enrollment_ids || [])
        .map(e => `${e.group_id?.group_name || "N/A"} | Ticket: ${e.tickets || "N/A"}`)
        .join(", ") || "N/A" }
    ], currentY);
    
    // Personal/KYC Details section
    currentY = drawSectionTitle("Personal / KYC Details", currentY + 5);
    
    currentY = drawTwoColumnFields([
      { label: "Name", value: coapplicant?.co_applicant_name || "" },
      { label: "Phone", value: coapplicant?.co_applicant_phone_number || "" },
      { label: "Email", value: coapplicant?.co_applicant_email || "" },
      { label: "Alternate No", value: coapplicant?.co_applicant_alternate_number || "" },
      { label: "DOB", value: coapplicant?.co_applicant_dateofbirth?.split("T")[0] || "" },
      { label: "Gender", value: coapplicant?.co_applicant_gender || "" },
      { label: "Marital Status", value: coapplicant?.co_applicant_marital_status || "" },
      { label: "Nationality", value: coapplicant?.co_applicant_nationality || "" },
      { label: "Father Name", value: coapplicant?.co_applicant_father_name || "" },
      { label: "Referred Type", value: coapplicant?.co_applicant_referred_type || "" }
    ], currentY);
    
    currentY = drawFullWidthFormField("Address", coapplicant?.co_applicant_address || "", 15, currentY);
    
    currentY = drawTwoColumnFields([
      { label: "Village", value: coapplicant?.co_applicant_village || "" },
      { label: "Taluk", value: coapplicant?.co_applicant_taluk || "" },
      { label: "District", value: coapplicant?.co_applicant_district || "" },
      { label: "State", value: coapplicant?.co_applicant_state || "" },
      { label: "Pincode", value: coapplicant?.co_applicant_pincode || "" }
    ], currentY);
    
    // KYC Information section
    currentY = drawSectionTitle("KYC Information", currentY + 5);
    
    currentY = drawTwoColumnFields([
      { label: "Aadhaar No", value: coapplicant?.co_applicant_adhaar_no || "" },
      { label: "PAN No", value: coapplicant?.co_applicant_pan_no || "" },
      { label: "Document Name", value: coapplicant?.co_applicant_document_name || "" },
      { label: "Relationship Type", value: coapplicant?.co_applicant_relationship_type || "" }
    ], currentY);
    
    drawFooter();
    
    // ================= PAGE 2 =================
    doc.addPage();
    setBackground();
    currentY = drawHeader("Co-Applicant Application Form (Contd.)");
    
    // Bank Details section
    currentY = drawSectionTitle("Bank Details", currentY);
    
    currentY = drawTwoColumnFields([
      { label: "Bank Name", value: coapplicant?.co_applicant_bank_name || "" },
      { label: "Account No", value: coapplicant?.co_applicant_bank_account_number || "" },
      { label: "Branch", value: coapplicant?.co_applicant_bank_branch || "" },
      { label: "IFSC", value: coapplicant?.co_applicant_bank_ifsc_code || "" }
    ], currentY);
    
    // Occupation/Business section
    currentY = drawSectionTitle("Occupation / Business", currentY + 5);
    
    currentY = drawTwoColumnFields([
      { label: "Occupation", value: coapplicant?.co_applicant_occupation || "" },
      { label: "Sector", value: coapplicant?.co_applicant_sector_name || "" },
      { label: "Sub Occupation", value: coapplicant?.co_applicant_occupation_sub || "" },
      { label: "Profession Type", value: coapplicant?.co_applicant_profession_type || "" },
      { label: "Business Type", value: coapplicant?.co_applicant_bussiness_type || "" },
      { label: "Business Name", value: coapplicant?.co_applicant_bussiness_name || "" }
    ], currentY);
    
    currentY = drawFullWidthFormField("Business Address", coapplicant?.co_applicant_bussiness_address || "", 15, currentY);
    
    // Property/Agriculture section
    currentY = drawSectionTitle("Property / Agriculture", currentY + 5);
    
    currentY = drawTwoColumnFields([
      { label: "Agri RTC No", value: coapplicant?.co_applicant_agri_rtc_no || "" },
      { label: "Land Holdings", value: coapplicant?.co_applicant_land_holdings || "" },
      { label: "Document Name", value: coapplicant?.co_applicant_all_document_name || "" },
      { label: "Consent Document", value: coapplicant?.co_applicant_consent_document || "" }
    ], currentY);
    
    currentY = drawFullWidthFormField("Description", coapplicant?.co_applicant_description || "", 15, currentY);
    
    // Declaration section
    currentY += 10;
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.rect(15, currentY, doc.internal.pageSize.width - 30, 25);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...colors.text);
    doc.text("I / We hereby confirm the above co-applicant details are true to the best of my knowledge.", 
             doc.internal.pageSize.width / 2, currentY + 10, { align: 'center' });
    
    doc.setFont("helvetica", "bold");
    doc.text("Signature of the Subscriber", 20, currentY + 20);
    
    // Signature line
    doc.setDrawColor(...colors.text);
    doc.setLineWidth(0.3);
    doc.line(70, currentY + 20, 120, currentY + 20);
    
    drawFooter();
    
    // Save the PDF
    const name = coapplicant?.co_applicant_name || coapplicant?.user_co_applicant || "Co Applicant";
    doc.save(`${name.replace(/\s+/g, "_")}_Co_ApplicantForm.pdf`);
  } catch (error) {
    console.error("Error generating Co_Applicant PDF:", error);
  }
};

export default handleCoApplicantPrint;
