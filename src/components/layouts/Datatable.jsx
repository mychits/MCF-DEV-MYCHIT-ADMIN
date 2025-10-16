import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import imageInput from "../../assets/images/Agent.png";
import CircularLoader from "../loaders/CircularLoader";
import { Select } from "antd";
import logo from "../../assets/images/mychits.png";
const DataTable = ({
  updateHandler = () => {},
  printHeaderValues = [],
  printHeaderKeys = [],
  catcher = "_id",
  isExportEnabled = true,
  data = [],
  columns = [],
  exportCols = [],
  exportedFileName = "export.csv",
  exportedPdfName = "export.pdf",
}) => {
  const safeData = Array.isArray(data) ? data : [];
  const safeColumns = Array.isArray(columns) ? columns : [];
  const exportColumns =
    exportCols?.length <= 0
      ? Array.isArray(columns)
        ? columns
        : []
      : Array.isArray(exportCols)
      ? exportCols
      : [];

  const [currentPage, setCurrentPage] = useState(1);
  const [currentUserName, setCurrentUserName] = useState("System User");
  const [active, setActive] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pageSize, setPageSize] = useState(100);
  useEffect(() => {
    const tempData = {};
    data.forEach((ele, index) => {
      tempData[ele._id] = false;
    });
    setActive(tempData);
  }, [data]);
  const onSelectRow = (_id) => {
    const tempActive = active;
    if (Object.keys(active).length > 1) {
      Object.keys(active).forEach((key) => {
        tempActive[key] = false;
      });
      setActive({ ...tempActive, [_id]: true });
    }
  };
  const searchData = (data) => {
    if (!searchQuery) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const filterData = (data) => {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return String(item[key]).toLowerCase() === value.toLowerCase();
      });
    });
  };

  const sortData = (data) => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const processedData = useMemo(() => {
    let processed = [...safeData];
    processed = searchData(processed);
    processed = filterData(processed);
    processed = sortData(processed);
    return processed;
  }, [safeData, searchQuery, filters, sortConfig]);

  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportToExcel = () => {
    const date = new Date().toISOString().split("T")[0];
    const headers = exportColumns.map((col) => {if(col.header.toLowerCase() ==="action") return;
      return col.header}).join(",");
    const rows = processedData
      .map((item) => exportColumns.map((col) =>{
        if(col.key.toLowerCase() ==="action") return;
        return  item[col.key]}).join(","))
      .join("\n");
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileBaseName = exportedFileName.replace(/\.csv$/i, "").trim();
  a.download = `${fileBaseName}_${date}.csv`;
    //a.download = exportedFileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const changeColor = (index) => {
    return index % 2 === 0;
  };

    useEffect(() => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userObj = JSON.parse(user);
      const name =
        userObj?.full_name ||
        userObj?.name ||
        userObj?.user?.full_name ||
        userObj?.user?.name ||
        "System User";
      setCurrentUserName(name);
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
    }
  }
}, []);

//   const printToPDF = () => {
//     const printContent = document.createElement("div");

//     printContent.innerHTML = `
//   <style>
//     @media print {
//       body * {
//         visibility: hidden;
//       }
//       .printable, .printable * {
//         visibility: visible;
//       }
//       .printable {
//         position: absolute;
//         top: 0;
//         left: 0;
//       }
//     }
//   </style>

//   <div class="printable">
  
//     <header class="print:flex">
//     <div class="grid grid-cols-12 w-full gap-6 my-9">
//     ${printHeaderKeys
//       .map(
//         (headerKeys, index) =>
//           `<h1 class="col-span-5 text-xl"><span class="font-semibold">${headerKeys} :</span> ${printHeaderValues[index]} </h1>`
//       )
//       .join("")}
//       </div>
      
//       </header>
//     <table class="print:w-full print:h-full">
//       <thead>
//         <tr class="print:border-[1px] print:border-gray-700 print:bg-gray-100">
//           ${safeColumns
//             .map((column) =>
//               column.header.toLowerCase() === "action"
//                 ? ""
//                 : `
//                 <th class="p-[8px] border-[1px] border-gray-700">${column.header}</th>
//               `
//             )
//             .join("")}
//         </tr>
//       </thead>
//       <tbody>
//         ${processedData
//           .map(
//             (row) => `
//               <tr class="border-[1px] border-gray-700">
//                 ${safeColumns
//                   .map((column) =>
//                     column.key.toLowerCase() === "action"
//                       ? ""
//                       : `
//                       <td class="p-[8px] border-[1px] border-gray-700">${
//                         row[column.key] || " - "
//                       }</td>
//                     `
//                   )
//                   .join("")}
//               </tr>
//             `
//           )
//           .join("")}
//       </tbody>
//     </table>
//   </div>
// `;

//     document.body.appendChild(printContent);
//     window.print();
//     document.body.removeChild(printContent);
//   };
const printToPDF = () => {
  // Default settings for all reports
  let showSummaryCards = true;
  let showCountCards = true;
  const date = new Date().toISOString().split("T")[0];
const reportType = String(exportedPdfName || "").trim();
const fileName = `${reportType}_${date}`;
//  const reportType = String(exportedPdfName || "").trim();
  // Customize visibility based on report type
  switch (reportType) {
     case "Groups":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Customers":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "UnApproved Customer":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Enrollments":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Staff":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Agents":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Employees":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Leads":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Loans":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Pigme":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Auction":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Chit Payments":
      showSummaryCards = false;
      showCountCards = false;
      break;
  case "Mobile App Enrollments":
      showSummaryCards = false;
      showCountCards = false;
      break;
     case "Guarantor":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Tasks":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Daybook Report":
      showSummaryCards = true;
      showCountCards = true;
      break;
    case "All Customer Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Group Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Basic Group Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Enrollment Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Customer Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Customer Ledger Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Customer Payout Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Employee Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Commission Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
     case "Receipt Report":
      showSummaryCards = true;
      showCountCards = true;
      break;
    case "Auction Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Lead Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
     case "Pigme Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
      case "Loan Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
      case "Sales Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Date-wise Group Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Payment Summary Report":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Collection Area":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Dream Asset":
      showSummaryCards = false;
      showCountCards = false;
      break;
    case "Agent Approval":
      showSummaryCards = false;
      showCountCards = false;
      break;
    default:
       showSummaryCards = false;
      showCountCards = false;
      break;
  }

  const printContent = document.createElement("div");
  const now = new Date();
  const dateTimeString = now.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const totalAmount = processedData.reduce((sum, row) => {
    const amount = parseFloat(row.amount || row.Amount || 0);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalCash = processedData
    .filter((row) => row.mode?.toLowerCase() === "cash")
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const totalOnline = processedData
    .filter((row) => row.mode?.toLowerCase() === "online")
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const totalCustomers = new Set(
    processedData.map((row) => row.name || row.user_id?.full_name)
  ).size;

  const totalOnlineCount = processedData.filter(
    (row) => row.mode?.toLowerCase() === "online"
  ).length;

  const totalCashCount = processedData.filter(
    (row) => row.mode?.toLowerCase() === "cash"
  ).length;

  printContent.innerHTML = `
    <style>
      /* --- styles unchanged --- */
      @media print {
        body * { visibility: hidden; }
        .printable, .printable * { visibility: visible; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #333; margin: 0; }
        .printable { position: absolute; top: 0; left: 0; width: 100%; padding: 30px 40px; background: #fff; box-sizing: border-box; }
        .a4-border { border: 1px solid #d2d6dc; border-radius: 10px; padding: 20px; height: 100%; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .header-wrapper { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
        .logo-image { width: 260px; height: 130px; object-fit: contain; border-radius: 6px; }
        .title-block { display: flex; flex-direction: column; align-items: flex-end; }
        .title { font-weight: 700; font-size: 40px; color: #1e3a8a; margin: 0; line-height: 1.3; }
        .sub-title { font-size: 22px; color: #4b5563; margin: 4px 0 0 0; }
        .report-heading { text-align: center; font-size: 22px; font-weight: 600; color: #111827; margin: 20px 0 6px; padding: 10px 0; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; letter-spacing: 0.8px; }
        .report-date { text-align: center; font-size: 12px; color: #6b7280; margin-bottom: 20px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 20px; }
        .info-grid h3 { font-size: 13px; margin: 4px 0; color: #374151; font-weight: 500; }
        .summary-cards { display: flex; gap: 14px; margin: 10px 0 24px; }
        .card { flex: 1; border-radius: 8px; text-align: center; padding: 14px 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .card-title { font-size: 14px; color: #4b5563; margin: 0; font-weight: 600; }
        .card-value { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px; }
        .count-summary-cards { display: flex; gap: 14px; margin: 16px 0 20px; }
        .count-card { flex: 1; padding: 14px 12px; border-radius: 8px; text-align: center; font-weight: 600; background: #f8fafc; border: 1px solid #e2e8f0; }
        .count-card.customer { background-color: #fef3c7; color: #92400e; }
        .count-card.cash { background-color: #bbf7d0; color: #047857; }
        .count-card.online { background-color: #dbeafe; color: #1e40af; }
        .count-card span { font-size: 18px; font-weight: bold; display: block; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12.5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 6px; overflow: hidden; }
        th { background-color: #eff6ff; color: #1e40af; font-weight: 600; padding: 10px 8px; border-bottom: 2px solid #bfdbfe; }
        td { padding: 8px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        tr:nth-child(even) { background-color: #f9fafb; }
        tr:hover { background-color: #f1f5f9; }
        .signatures { margin-top: 36px; display: flex; justify-content: space-between; font-size: 13px; color: #1f2937; }
        .footer { font-size: 11px; color: #6b7280; text-align: center; margin-top: 30px; font-style: italic; }
      }
    </style>

    <div class="printable">
      <div class="a4-border">
        <div class="header-wrapper">
          ${imageInput ? `<img src="${imageInput}" class="logo-image" alt="Logo" />` : ""}
          <div class="title-block">
            <div class="title">MyChits Pvt Ltd</div>
            <div class="sub-title">#123, Main Road, Bengaluru, Karnataka – 560001</div>
          </div>
        </div>

        <div class="report-heading">${reportType || "Transaction Summary Report"}</div>
        <div class="report-date">${dateTimeString}</div>

        <div class="info-grid">
         
          ${printHeaderKeys.map((key, i) => `
  <div class="card">
    <div class="card-title">${key}</div>
    <div class="card-value">${printHeaderValues[i]}</div>
  </div>
`).join("")}
        </div>

        ${showSummaryCards ? `
        <div class="summary-cards">
          <div class="card"><div class="card-title">Total Cash</div><div class="card-value">₹ ${totalCash.toLocaleString("en-IN")}</div></div>
          <div class="card"><div class="card-title">Total Online</div><div class="card-value">₹ ${totalOnline.toLocaleString("en-IN")}</div></div>
          <div class="card"><div class="card-title">Total Amount</div><div class="card-value">₹ ${totalAmount.toLocaleString("en-IN")}</div></div>
        </div>` : ""}

        ${showCountCards ? `
        <div class="count-summary-cards">
          <div class="count-card customer">Total Customers<br /><span>${totalCustomers}</span></div>
          <div class="count-card cash">Cash Payments<br /><span>${totalCashCount}</span></div>
          <div class="count-card online">Online Payments<br /><span>${totalOnlineCount}</span></div>
        </div>` : ""}

       <table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr>
      ${safeColumns
        .filter(col => col.key.toLowerCase() !== "action")
        .map(col => `<th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left;">${col.header}</th>`)
        .join("")}
    </tr>
  </thead>
  <tbody>
    ${processedData
      .map(row => `
        <tr>
          ${safeColumns
            .filter(col => col.key.toLowerCase() !== "action")
            .map(col => `<td style="border: 1px solid #e2e8f0; padding: 6px;">${row[col.key] || "-"}</td>`)
            .join("")}
        </tr>`)
      .join("")}
  </tbody>
</table>


        <div class="signatures">
          <div><strong>Issued By: </strong>${currentUserName}</div>
        </div>

        <div class="footer">
          <span class="auto-note">*** This is a computer generated document, no signature is required ***</span>
        </div>
      </div>
    </div>
  `;

  if (imageInput) {
    const img = new Image();
    img.src = imageInput;
    img.onload = () => {
      document.body.appendChild(printContent);
      document.title = fileName || "MyChits";
      window.print();
      document.body.removeChild(printContent);
      document.title = "MyChits";
    };
  } else {
    document.body.appendChild(printContent);
    document.title = fileName || "MyChits";
    window.print();
    document.body.removeChild(printContent);
    document.title = "MyChits";
  }
};
  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (!safeData.length || !safeColumns.length) {
    return <></>;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2 relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-gray-500 absolute right-3" />
        </div>

        {isExportEnabled && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 rounded-md 
    bg-[#217346] hover:bg-[#1a5c38] text-white 
    transition-colors duration-200 
    shadow-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={printToPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-700 hover:bg-green-900 text-white 
    transition-colors duration-200 
    shadow-sm font-medium"
            >
              <Printer className="w-4 h-4" />
              Print PDF
            </button>
          </div>
        )}
      </div>

      {/* <div className="border rounded-lg overflow-hidden whitespace-normal">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {safeColumns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {sortConfig.key === column.key && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-gray-50">
              {safeColumns.map((column) => (
                <td key={`filter-${column.key}`} className="px-6 py-2">
                  {column.key.toLowerCase() !== "action" && (
                    <Select
                      className="w-full max-w-xs "
                      popupMatchSelectWidth={false}
                      showSearch
                      value={filters[column.key] || ""}
                      onChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          [column.key]: value,
                        }))
                      }
                      // filterOption={(input, option) =>
                      //   option.children
                      //     .toString()
                      //     .toLowerCase()
                      //     .includes(input.toLowerCase())
                      // }
                      filterOption={(input, option) => {
                        const label =
                          option?.children?.toString().toLowerCase() || "";
                        return label.includes(input.toLowerCase());
                      }}
                    >
                      <Select.Option value="">All</Select.Option>
                      {[
                        ...new Set(safeData.map((item) => item[column.key])),
                      ].map((value) => {
                        return (
                          <Select.Option
                            key={String(value)}
                            value={String(value)}
                          >
                            {value}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                </td>
              ))}
            </tr>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onSelectRow(row._id)}
                className={`${
                  active[row._id]
                    ? "bg-blue-200"
                    : changeColor(index)
                    ? "hover:bg-gray-200 bg-gray-100"
                    : " hover:bg-gray-200 bg-white" //
                } cursor-pointer `}
              >
                {safeColumns.map((column) => (
                  <td
                    key={`${index}-${column.key}`}
                    className="px-6 py-4"
                    onDoubleClick={() => {
                      console.log("row", row);
                      updateHandler(row[catcher]);
                    }}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      <div className="border rounded-lg overflow-hidden whitespace-normal">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {safeColumns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {sortConfig.key === column.key && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-gray-50">
              {safeColumns.map((column) => (
                <td key={`filter-${column.key}`} className="px-6 py-2">
                  {column.key.toLowerCase() !== "action" && (
                    <Select
                      className="w-full max-w-xs "
                      popupMatchSelectWidth={false}
                      showSearch
                      value={filters[column.key] || ""}
                      onChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          [column.key]: value,
                        }))
                      }
                      // filterOption={(input, option) =>
                      //   option.children
                      //     .toString()
                      //     .toLowerCase()
                      //     .includes(input.toLowerCase())
                      // }
                      filterOption={(input, option) => {
                        const label =
                          option?.children?.toString().toLowerCase() || "";
                        return label.includes(input.toLowerCase());
                      }}
                    >
                      <Select.Option value="">All</Select.Option>
                      {[
                        ...new Set(safeData.map((item) => item[column.key])),
                      ].map((value) => {
                        return (
                          <Select.Option
                            key={String(value)}
                            value={String(value)}
                          >
                            {value}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                </td>
              ))}
            </tr>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onSelectRow(row._id)}
                className={`${
                  active[row._id]
                    ? "bg-blue-200"
                    : changeColor(index)
                    ? "hover:bg-gray-200 bg-gray-100"
                    : " hover:bg-gray-200 bg-white" //
                } cursor-pointer `}
              >
                {safeColumns.map((column) => (
                  <td
                    key={`${index}-${column.key}`}
                    className="px-6 py-4"
                    onDoubleClick={() => {
                      console.log("row", row);
                      updateHandler(row[catcher]);
                    }}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-7 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[5, 10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm">
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
