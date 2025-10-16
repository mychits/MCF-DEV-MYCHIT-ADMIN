import { useState, useEffect, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Select } from "antd";
import CircularLoader from "../components/loaders/CircularLoader";

// const CollectionAreaReport = () => {
//   const [collectionAreaData, setCollectionAreaData] = useState([]);
//   const [collectionAreaTable, setCollectionAreaTable] = useState([]);
//   const [employeeList, setEmployeeList] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await api.get(`/agent/get-employee`);
//         const employees = response?.data?.employee || [];
//         setEmployeeList(employees);
//       } catch (error) {
//         console.error("❌ Error fetching employees:", error);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // ✅ Fetch Collection Area Report
//   useEffect(() => {
//     if (!selectedEmployee) return;

//     const fetchCollectionAreaReport = async () => {
//       try {
//         const response = await api.get(
//           `/user/collection-area/${selectedEmployee}`
//         );

//         // handle both cases: array or object with .users
//         const users = Array.isArray(response.data)
//           ? response.data
//           : response?.data?.users || [];

//         setCollectionAreaData(users);

//         // ✅ Format safely
//         const formattedData = users.map((area, index) => ({
//           id: area?._id || index,
//           SlNo: index + 1,
//           customerId: area?.customer_id || "-",
//           customerName: area?.full_name || "-",
//           customerPhoneNo: area?.phone_number || "-",
//           collectionAreaRouteName: area?.collection_area?.route_name || "-",
//           collectionAreaRoutePincode:
//             area?.collection_area?.route_pincode || "-",
//           collectionAreaEmployeeId:
//             area?.collection_area?.agent_id
//               ?.map((agent) => agent?.employeeCode)
//               ?.join(" | ") || "-",
//           collectionEmployeeName:
//             area?.collection_area?.agent_id
//               ?.map((agent) => agent?.name)
//               ?.join(" | ") || "-",
//           collectionEmployeePhoneNo:
//             area?.collection_area?.agent_id
//               ?.map((agent) => agent?.phone_number)
//               ?.join(" | ") || "-",
//         }));

//         setCollectionAreaTable(formattedData);
//       } catch (error) {
//         console.error("❌ Error fetching Collection Area Report:", error);
//       }
//     };

//     fetchCollectionAreaReport();
//   }, [selectedEmployee]);

//   // ✅ Columns for DataTable
//   const collectionAreaColumns = [
//     { key: "SlNo", header: "Sl No" },
//     { key: "customerId", header: "Customer ID" },
//     { key: "customerName", header: "Name" },
//     { key: "customerPhoneNo", header: "Phone Number" },
//     { key: "collectionAreaRouteName", header: "Route Name" },
//     { key: "collectionAreaRoutePincode", header: "Pincode" },
//     { key: "collectionAreaEmployeeId", header: "Employee ID" },
//     { key: "collectionEmployeeName", header: "Collection Executive" },
//     { key: "collectionEmployeePhoneNo", header: "Executive Phone No" },
//   ];

//   return (
//     <div className="p-4">
//       <h1 className="font-bold text-2xl mb-5">Collection Area Report</h1>

//       <div className="mb-4 w-64">
//         <Select
//           showSearch
//           placeholder="Search or Select Employee"
//           value={selectedEmployee}
//           onChange={setSelectedEmployee}
//           allowClear
//           filterOption={(input, option) =>
//             option.children.toLowerCase().includes(input.toLowerCase())
//           }
//           className="w-full"
//         >
//           {employeeList.map((emp) => (
//             <Select.Option key={emp._id} value={emp._id}>
//               {emp.name} ({emp.phone_number})
//             </Select.Option>
//           ))}
//         </Select>
//       </div>

//       <DataTable
//         columns={collectionAreaColumns}
//         data={collectionAreaTable}
//         exportedPdfName="Collection Area Report"
//         exportedFileName={`CollefctionAreaReport.csv`}
//       />
//     </div>
//   );
// };

// const CollectionAreaReport = () => {
//   const [collectionAreaList, setCollectionAreaList] = useState([]); // All collection areas
//   const [selectedCollection, setSelectedCollection] = useState(null);
//   const [collectionAreaTable, setCollectionAreaTable] = useState([]);

//   // Fetch all collection areas for dropdown
//   useEffect(() => {
//     const fetchCollectionAreas = async () => {
//       try {
//         const res = await api.get("/collection-area-request/get-collection-area-data"); // Make an endpoint to fetch all collection areas
//         setCollectionAreaList(res.data || []);
//       } catch (error) {
//         console.error("❌ Error fetching collection areas:", error);
//       }
//     };
//     fetchCollectionAreas();
//   }, []);

//   // Fetch users for selected collection area
//   useEffect(() => {
//     if (!selectedCollection) return;

//     const fetchCollectionAreaUsers = async () => {
//       try {
//         const res = await api.get(`/user/collection-area/${selectedCollection}`);
//         const users = res.data.users || [];

//         const formattedData = users.map((area, index) => ({
//           id: area?._id || index,
//           SlNo: index + 1,
//           customerId: area?.customer_id || "-",
//           customerName: area?.full_name || "-",
//           customerPhoneNo: area?.phone_number || "-",
//           collectionAreaRouteName: area?.collection_area?.route_name || "-",
//           collectionAreaRoutePincode: area?.collection_area?.route_pincode || "-",
//           collectionEmployeeName:
//             area?.collection_area?.agent_id?.map((a) => a.name)?.join(" | ") || "-",
//           collectionEmployeePhoneNo:
//             area?.collection_area?.agent_id?.map((a) => a.phone_number)?.join(" | ") || "-",
//         }));

//         setCollectionAreaTable(formattedData);
//       } catch (error) {
//         console.error("❌ Error fetching collection area users:", error);
//       }
//     };

//     fetchCollectionAreaUsers();
//   }, [selectedCollection]);

//   const collectionAreaColumns = [
//     { key: "SlNo", header: "Sl No" },
//     { key: "customerId", header: "Customer ID" },
//     { key: "customerName", header: "Name" },
//     { key: "customerPhoneNo", header: "Phone Number" },
//     { key: "collectionAreaRouteName", header: "Route Name" },
//     { key: "collectionAreaRoutePincode", header: "Pincode" },
//     { key: "collectionEmployeeName", header: "Collection Executive" },
//     { key: "collectionEmployeePhoneNo", header: "Executive Phone No" },
//   ];

//   return (
//     <div className="p-4">
//       <h1 className="font-bold text-2xl mb-5">Collection Area Report</h1>

//       <div className="mb-4 w-64">
//         <Select
//           showSearch
//           placeholder="Search or Select Collection Area"
//           value={selectedCollection}
//           onChange={setSelectedCollection}
//           allowClear
//           filterOption={(input, option) =>
//             option.children.toLowerCase().includes(input.toLowerCase())
//           }
//           className="w-full"
//         >
//           {collectionAreaList.map((area) => (
//             <Select.Option key={area._id} value={area._id}>
//               {area.route_name} | {area.route_pincode}
//             </Select.Option>
//           ))}
//         </Select>
//       </div>

//       <DataTable
//         columns={collectionAreaColumns}
//         data={collectionAreaTable}
//         exportedPdfName="Collection Area Report"
//         exportedFileName="CollectionAreaReport.csv"
//       />
//     </div>
//   );
// };

// const CollectionAreaReport = () => {
//   const [collectionAreaList, setCollectionAreaList] = useState([]); // All collection areas
//   const [selectedCollection, setSelectedCollection] = useState(null); // Selected collection area
//   const [collectionAreaTable, setCollectionAreaTable] = useState([]); // Table data

//   // Fetch all collection areas for dropdown
//   useEffect(() => {
//     const fetchCollectionAreas = async () => {
//       try {
//         const res = await api.get("/collection-area-request/get-collection-area-data");
//         setCollectionAreaList(res.data || []);
//       } catch (error) {
//         console.error("❌ Error fetching collection areas:", error);
//       }
//     };
//     fetchCollectionAreas();
//   }, []);

//   // Fetch users for selected collection area
//   useEffect(() => {
//     if (!selectedCollection) {
//       setCollectionAreaTable([]); // Clear table if no collection area selected
//       return;
//     }

//     const fetchCollectionAreaUsers = async () => {
//       try {
//         const res = await api.get(`/user/collection-area/${selectedCollection}`);
//         const users = res.data.users || [];

//         // Only include users whose collection_area._id matches selectedCollection
//         const filteredUsers = users.filter(
//           (user) => user.collection_area?._id === selectedCollection
//         );

//         const formattedData = filteredUsers.map((area, index) => ({
//           id: area._id || index,
//           SlNo: index + 1,
//           customerId: area.customer_id || "-",
//           customerName: area.full_name || "-",
//           customerPhoneNo: area.phone_number || "-",
//           collectionAreaRouteName: area.collection_area?.route_name || "-",
//           collectionAreaRoutePincode: area.collection_area?.route_pincode || "-",
//           collectionEmployeeName:
//             area.collection_area?.agent_id?.map((a) => a.name)?.join(" | ") || "-",
//           collectionEmployeePhoneNo:
//             area.collection_area?.agent_id?.map((a) => a.phone_number)?.join(" | ") || "-",
//         }));

//         setCollectionAreaTable(formattedData);
//       } catch (error) {
//         console.error("❌ Error fetching collection area users:", error);
//         setCollectionAreaTable([]);
//       }
//     };

//     fetchCollectionAreaUsers();
//   }, [selectedCollection]);

//   // Columns for DataTable
//   const collectionAreaColumns = [
//     { key: "SlNo", header: "Sl No" },
//     { key: "customerId", header: "Customer ID" },
//     { key: "customerName", header: "Name" },
//     { key: "customerPhoneNo", header: "Phone Number" },
//     { key: "collectionAreaRouteName", header: "Route Name" },
//     { key: "collectionAreaRoutePincode", header: "Pincode" },
//     { key: "collectionEmployeeName", header: "Collection Executive" },
//     { key: "collectionEmployeePhoneNo", header: "Executive Phone No" },
//   ];

//   return (
//     <div className="p-4">
//       <h1 className="font-bold text-2xl mb-5">Collection Area Report</h1>

//       {/* Collection Area Dropdown */}
//       <div className="mb-4 w-64">
//         <label
//                     className="block mb-2 text-sm font-medium text-gray-900"
//                     htmlFor="gender"
//                   >
//                     Select Collection Area
//                   </label>
//         <Select
//           showSearch
//           placeholder="Search or Select Collection Area"
//           value={selectedCollection}
//           onChange={setSelectedCollection}
//           allowClear
//           filterOption={(input, option) =>
//             option.label.toLowerCase().includes(input.toLowerCase())
//           }
//           className="w-full"
//         >
//           {collectionAreaList.map((area) => (
//             <Select.Option
//               key={area._id}
//               value={area._id}
//               label={`${area.route_name} | ${area.route_pincode}`} // Important for filter
//             >
//               {area.route_name} | {area.route_pincode}
//             </Select.Option>
//           ))}
//         </Select>
//       </div>

//       {/* DataTable */}
//       <DataTable
//         columns={collectionAreaColumns}
//         data={collectionAreaTable} // Only users matching selected collection area
//         exportedPdfName="Collection Area Report"
//         exportedFileName="CollectionAreaReport.csv"
//         noDataMessage="Please select a collection area to view data"
//       />
//     </div>
//   );
// };

const CollectionAreaReport = () => {
  const [collectionAreaList, setCollectionAreaList] = useState([]); // All collection areas
  const [selectedCollection, setSelectedCollection] = useState(null); // Selected collection area
  const [collectionAreaTable, setCollectionAreaTable] = useState([]); // Table data
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch all collection areas for dropdown
  useEffect(() => {
    const fetchCollectionAreas = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          "/collection-area-request/get-collection-area-data"
        );
        setCollectionAreaList(res.data || []);
      } catch (error) {
        console.error("❌ Error fetching collection areas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollectionAreas();
  }, []);

  // Fetch users for selected collection area
  useEffect(() => {
    if (!selectedCollection) {
      setCollectionAreaTable([]); // Clear table if no collection area selected
      return;
    }

    const fetchCollectionAreaUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/user/collection-area/${selectedCollection}`
        );
        const users = res.data.users || [];

        // Filter users whose collection_area._id matches selectedCollection
        const filteredUsers = users.filter(
          (user) => user.collection_area?._id === selectedCollection
        );

        const formattedData = filteredUsers.map((area, index) => ({
          id: area._id || index,
          SlNo: index + 1,
          customerId: area.customer_id || "-",
          customerName: area.full_name || "-",
          customerPhoneNo: area.phone_number || "-",
          collectionAreaRouteName: area.collection_area?.route_name || "-",
          collectionAreaRoutePincode:
            area.collection_area?.route_pincode || "-",
          collectionEmployeeName:
            area.collection_area?.agent_id?.map((a) => a.name)?.join(" | ") ||
            "-",
          collectionEmployeePhoneNo:
            area.collection_area?.agent_id
              ?.map((a) => a.phone_number)
              ?.join(" | ") || "-",
        }));

        setCollectionAreaTable(formattedData);
      } catch (error) {
        console.error("❌ Error fetching collection area users:", error);
        setCollectionAreaTable([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionAreaUsers();
  }, [selectedCollection]);

  // Columns for DataTable
  const collectionAreaColumns = [
    { key: "SlNo", header: "Sl No" },
    { key: "customerId", header: "Customer ID" },
    { key: "customerName", header: "Name" },
    { key: "customerPhoneNo", header: "Phone Number" },
    { key: "collectionAreaRouteName", header: "Route Name" },
    { key: "collectionAreaRoutePincode", header: "Pincode" },
    { key: "collectionEmployeeName", header: "Collection Executive" },
    { key: "collectionEmployeePhoneNo", header: "Executive Phone No" },
  ];

  if (loading) {
    return <CircularLoader />; // Show loader while fetching data
  }

  return (
    <div className="p-4">
      <h1 className="font-bold text-2xl mb-5">Collection Area Report</h1>

      {/* Collection Area Dropdown */}
      <div className="mb-4 w-64">
        <label
          className="block mb-2 text-sm font-medium text-gray-900"
          htmlFor="gender"
        >
          Select Collection Area
        </label>
        <Select
          showSearch
          placeholder="Search or Select Collection Area"
          value={selectedCollection}
          onChange={setSelectedCollection}
          allowClear
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          className="w-full"
        >
          {collectionAreaList.map((area) => (
            <Select.Option
              key={area._id}
              value={area._id}
              label={`${area.route_name} | ${area.route_pincode}`}
            >
              {area.route_name} | {area.route_pincode}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* DataTable */}
      <DataTable
        columns={collectionAreaColumns}
        data={collectionAreaTable}
        exportedPdfName="Collection Area Report"
        exportedFileName="CollectionAreaReport.csv"
        noDataMessage="Please select a collection area to view data"
      />
    </div>
  );
};

export default CollectionAreaReport;
