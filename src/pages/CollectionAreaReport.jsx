import { useState, useEffect, useMemo } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Select } from "antd";
import CircularLoader from "../components/loaders/CircularLoader";


// const CollectionAreaReport = () => {
//   const [collectionAreaList, setCollectionAreaList] = useState([]); // All collection areas
//   const [selectedCollection, setSelectedCollection] = useState(null); // Selected collection area
//   const [collectionAreaTable, setCollectionAreaTable] = useState([]); // Table data
//   const [loading, setLoading] = useState(false); // Loading state
//   const [selectedEmployees, setSelectedEmployees] = useState([]);
// const [employeeOptions, setEmployeeOptions] = useState([]);

 

//   useEffect(() => {
//   const fetchCollectionAreas = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get(
//         "/collection-area-request/get-collection-area-data"
//       );
//       const list = res.data || [];
//       setCollectionAreaList(list);

//       // ⭐ Extract unique employee names & phone numbers
//       const employeesSet = new Map();

//       list.forEach((area) => {
//         area.agent_id?.forEach((a) => {
//           if (!employeesSet.has(a._id)) {
//             employeesSet.set(a._id, {
//               label: `${a.name} | ${a.phone_number}`,
//               value: a._id,
//             });
//           }
//         });
//       });

//       setEmployeeOptions([...employeesSet.values()]);
//     } catch (error) {
//       console.error("❌ Error fetching collection areas:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   fetchCollectionAreas();
// }, []);

//   // Fetch users for selected collection area
//   // useEffect(() => {
//   //   if (!selectedCollection) {
//   //     setCollectionAreaTable([]); // Clear table if no collection area selected
//   //     return;
//   //   }

//   //   const fetchCollectionAreaUsers = async () => {
//   //     setLoading(true);
//   //     try {
//   //       const res = await api.get(
//   //         `/user/collection-area/${selectedCollection}`
//   //       );
//   //       const users = res.data.users || [];

//   //       // Filter users whose collection_area._id matches selectedCollection
//   //       const filteredUsers = users.filter(
//   //         (user) => user.collection_area?._id === selectedCollection
//   //       );

//   //       const formattedData = filteredUsers.map((area, index) => ({
//   //         id: area._id || index,
//   //         SlNo: index + 1,
//   //         customerId: area.customer_id || "-",
//   //         customerName: area.full_name || "-",
//   //         customerPhoneNo: area.phone_number || "-",
//   //         collectionAreaRouteName: area.collection_area?.route_name || "-",
//   //         collectionAreaRoutePincode:
//   //           area.collection_area?.route_pincode || "-",
//   //         collectionEmployeeName:
//   //           area.collection_area?.agent_id?.map((a) => a.name)?.join(" | ") ||
//   //           "-",
//   //         collectionEmployeePhoneNo:
//   //           area.collection_area?.agent_id
//   //             ?.map((a) => a.phone_number)
//   //             ?.join(" | ") || "-",
//   //       }));

//   //       setCollectionAreaTable(formattedData);
//   //     } catch (error) {
//   //       console.error("❌ Error fetching collection area users:", error);
//   //       setCollectionAreaTable([]);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchCollectionAreaUsers();
//   // }, [selectedCollection]);


//   useEffect(() => {
//   if (!selectedCollection) {
//     setCollectionAreaTable([]);
//     return;
//   }

//   const fetchCollectionAreaUsers = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get(`/user/collection-area/${selectedCollection}`);
//       let users = res.data.users || [];

//       // Filter by collection area
//       users = users.filter(
//         (user) => user.collection_area?._id === selectedCollection
//       );

//       // ⭐ Filter by selected employees (if any selected)
//       if (selectedEmployees.length > 0) {
//         users = users.filter((user) =>
//           user.collection_area?.agent_id?.some((agent) =>
//             selectedEmployees.includes(agent._id)
//           )
//         );
//       }

//       const formattedData = users.map((area, index) => ({
//         id: area._id || index,
//         SlNo: index + 1,
//         customerId: area.customer_id || "-",
//         customerName: area.full_name || "-",
//         customerPhoneNo: area.phone_number || "-",
//         collectionAreaRouteName: area.collection_area?.route_name || "-",
//         collectionAreaRoutePincode:
//           area.collection_area?.route_pincode || "-",
//         collectionEmployeeName:
//           area.collection_area?.agent_id
//             ?.map((a) => a.name)
//             ?.join(" | ") || "-",
//         collectionEmployeePhoneNo:
//           area.collection_area?.agent_id
//             ?.map((a) => a.phone_number)
//             ?.join(" | ") || "-",
//       }));

//       setCollectionAreaTable(formattedData);
//     } catch (error) {
//       console.error("❌ Error fetching collection area users:", error);
//       setCollectionAreaTable([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchCollectionAreaUsers();
// }, [selectedCollection, selectedEmployees]);


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

//   if (loading) {
//     return <CircularLoader />; // Show loader while fetching data
//   }

//   return (
//     <div className="p-4">
//       <h1 className="font-bold text-2xl mb-5">Collection Area Report</h1>

//       {/* Collection Area Dropdown */}
//       <div className="mb-4 w-64">
//         <label
//           className="block mb-2 text-sm font-medium text-gray-900"
//           htmlFor="gender"
//         >
//           Select Collection Area
//         </label>
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
//               label={`${area.route_name} | ${area.route_pincode}`}
//             >
//               {area.route_name} | {area.route_pincode}
//             </Select.Option>
//           ))}
//         </Select>
//       </div>
//       <div className="mb-4 w-80">
//   <label className="block mb-2 text-sm font-medium text-gray-900">
//     Filter by Collection Employee
//   </label>

//   <Select
//     mode="multiple"
//     allowClear
//     placeholder="Select Collection Employee"
//     value={selectedEmployees}
//     onChange={setSelectedEmployees}
//     options={employeeOptions}
//     className="w-full"
//   />
// </div>

//       {/* DataTable */}
//       <DataTable
//         columns={collectionAreaColumns}
//         data={collectionAreaTable}
//         exportedPdfName="Collection Area Report"
//         exportedFileName="CollectionAreaReport.csv"
//         noDataMessage="Please select a collection area to view data"
//       />
//     </div>
//   );
// };


const CollectionAreaReport = () => {
  const [collectionAreaList, setCollectionAreaList] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionAreaTable, setCollectionAreaTable] = useState([]);
  const [loading, setLoading] = useState(false);

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // ⭐ SINGLE SELECT

  // Fetch all Collection Areas
  useEffect(() => {
    const fetchCollectionAreas = async () => {
      setLoading(true);
      try {
        const res = await api.get("/collection-area-request/get-collection-area-data");
        const list = res.data || [];
        setCollectionAreaList(list);

        // Extract unique employees
        const employeesSet = new Map();
        list.forEach((area) => {
          area.agent_id?.forEach((a) => {
            if (!employeesSet.has(a._id)) {
              employeesSet.set(a._id, {
                label: `${a.name} | ${a.phone_number}`,
                value: a._id,
              });
            }
          });
        });

        setEmployeeOptions([...employeesSet.values()]);
      } catch (error) {
        console.error("❌ Error fetching collection areas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollectionAreas();
  }, []);

  // Fetch Users
  useEffect(() => {
    if (!selectedCollection) {
      setCollectionAreaTable([]);
      return;
    }

    const fetchCollectionAreaUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/user/collection-area/${selectedCollection}`);
        let users = res.data.users || [];

        // Filter by Collection Area
        users = users.filter(
          (user) => user.collection_area?._id === selectedCollection
        );

        // ⭐ SINGLE EMPLOYEE FILTER
        if (selectedEmployee) {
          users = users.filter((user) =>
            user.collection_area?.agent_id?.some(
              (agent) => agent._id === selectedEmployee
            )
          );
        }

        const formattedData = users.map((area, index) => ({
          id: area._id || index,
          SlNo: index + 1,
          customerId: area.customer_id || "-",
          customerName: area.full_name || "-",
          customerPhoneNo: area.phone_number || "-",
          collectionAreaRouteName: area.collection_area?.route_name || "-",
          collectionAreaRoutePincode: area.collection_area?.route_pincode || "-",
          collectionEmployeeName:
            area.collection_area?.agent_id?.map((a) => a.name)?.join(" | ") || "-",
          collectionEmployeePhoneNo:
            area.collection_area?.agent_id?.map((a) => a.phone_number)?.join(" | ") || "-",
        }));

        setCollectionAreaTable(formattedData);
      } catch (error) {
        console.error("❌ Error fetching collection area users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionAreaUsers();
  }, [selectedCollection, selectedEmployee]);

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

  if (loading) return <CircularLoader />;

  return (
    <div className="p-4 w-full">
      <h1 className="font-bold text-2xl mb-5">Collection Area Report</h1>

      {/* --- FILTER SECTION (like Chit Asking UI) --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border mb-6">
        <div className="grid grid-cols-3 gap-6">

          {/* Collection Area Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Select Collection Area
            </label>

            <Select
              showSearch
              placeholder="Search Collection Area"
              value={selectedCollection}
              onChange={setSelectedCollection}
              allowClear
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              className="w-full h-12"
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

          {/* Employee Filter (single select) */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Collection Employee
            </label>

            <Select
              showSearch
              placeholder="Search Employee"
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              allowClear
              options={employeeOptions}
              className="w-full h-12"
            />
          </div>
        </div>
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
