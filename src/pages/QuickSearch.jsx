/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import api from "../instance/TokenInstance";
import Navbar from "../components/layouts/Navbar";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { Input, Space, Table, Tag } from "antd";
import Fuse from "fuse.js";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiFilter, FiUser, FiPhone, FiMapPin, FiHash, FiCheckCircle, FiMap, FiSun, FiMoon } from "react-icons/fi";

const QuickSearch = () => {
  const { Search } = Input;
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const searchInputRef = useRef();
  const [TableUsers, setTableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [theme, setTheme] = useState('light'); // light or dark

  const filters = [
    { id: "1", filterName: "Customer ID", key: "customer_id", icon: FiHash },
    { id: "2", filterName: "Name", key: "name", icon: FiUser },
    { id: "3", filterName: "Phone", key: "phone_number", icon: FiPhone },
    { id: "4", filterName: "Address", key: "address", icon: FiMapPin },
    { id: "5", filterName: "Pincode", key: "pincode", icon: FiHash },
    { id: "6", filterName: "Area", key: "customer_area", icon: FiMap },
    { id: "7", filterName: "Status", key: "customer_status", icon: FiCheckCircle },
  ];

  const [activeFilters, setActiveFilters] = useState(filters.map((f) => f.id));

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  const [searchText, setSearchText] = useState("");
  const fil = filters
    .filter((filter) => activeFilters.includes(filter.id))
    .map((filter) => filter.key);
  const fuseSearchOptions = {
    includeScore: true,
    keys: [...fil],
  };
  const fuse = new Fuse(TableUsers, fuseSearchOptions);

  useEffect(() => {
    searchInputRef.current.focus();
  }, []);

  useEffect(() => {
    const fetchCollectionArea = async () => {
      try {
        const response = await api.get(
          "/collection-area-request/get-collection-area-data"
        );
        setAreas(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchCollectionArea();
  }, [reloadTrigger]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/user/get-user");
        setUsers(response.data);
        const formattedData = response.data.map((group, index) => ({
          _id: group?._id,
          id: index + 1,
          name: group?.full_name,
          phone_number: group?.phone_number,
          address: group?.address,
          pincode: group?.pincode,
          customer_id: group?.customer_id,
          collection_area: group?.collection_area?.route_name,
          customer_status: group?.customer_status
            ? group?.customer_status
            : "Active",
        }));
        let fData = formattedData.map((ele) => {
          if (
            ele?.address &&
            typeof ele.address === "string" &&
            ele?.address?.includes(",")
          )
            ele.address = ele.address.replaceAll(",", " ");
          return ele;
        });
        if (!fData) setTableUsers(formattedData);
        if (!fData) setTableUsers(formattedData);
        setTableUsers(fData);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [reloadTrigger]);

  const columns = [
    { 
      dataIndex: "id", 
      title: "SL. NO", 
      key: "id",
      width: 80,
      fixed: 'left'
    },
    { 
      dataIndex: "customer_id", 
      title: "Customer ID", 
      key: "customer_id",
      width: 130
    },
    { 
      dataIndex: "name", 
      title: "Customer Name", 
      key: "name",
      width: 200
    },
    {
      dataIndex: "phone_number",
      title: "Phone Number",
      key: "phone_number",
      width: 150
    },
    { 
      dataIndex: "address", 
      title: "Address", 
      key: "address",
      width: 300
    },
    { 
      dataIndex: "pincode", 
      title: "Pincode", 
      key: "pincode",
      width: 100
    },
    { 
      dataIndex: "collection_area", 
      title: "Collection Area", 
      key: "collection_area",
      width: 150
    },
    {
      dataIndex: "customer_status",
      title: "Status",
      key: "customer_status",
      width: 100,
      fixed: 'right',
      render: (text) => (
        <Tag color={text === "active" || text === "Active" ? "green" : "red"}>
          {text}
        </Tag>
      ),
    },
  ];

  const handleFilterToggle = (id) => {
    setActiveFilters((prev) =>
      prev.includes(id)
        ? prev.filter((filterId) => filterId !== id)
        : [...prev, id]
    );
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex mt-20">
        <Sidebar />
        <Navbar visibility={true} />
        <CustomAlertDialog
          type={alertConfig.type}
          isVisible={alertConfig.visibility}
          message={alertConfig.message}
          onClose={() =>
            setAlertConfig((prev) => ({ ...prev, visibility: false }))
          }
        />

        <div className="flex-grow p-6 lg:p-8 w-full">
          {/* Header with Theme Toggle */}
          <div className={`flex items-center justify-between mb-8 pb-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div>
              <h1 className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Quick Search
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Search and filter customer records efficiently
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>

          {/* Search Filters Section */}
          <div className={`rounded-xl mb-6 p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-5">
              <FiFilter className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Search Filters
              </h2>
              <span className={`ml-auto text-xs font-medium px-3 py-1 rounded-full ${
                isDark 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {activeFilters.length} / {filters.length} Active
              </span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => {
                const isActive = activeFilters.includes(filter.id);
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterToggle(filter.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? isDark
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{filter.filterName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar Section */}
          <div className={`rounded-xl mb-6 p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <FiSearch className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Search Customers
              </h2>
            </div>
            
            <Search
              placeholder="Search by customer ID, name, phone, address..."
              allowClear
              enterButton="Search"
              ref={searchInputRef}
              size="large"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
            />
          </div>

          {/* Results Table */}
          <div className={`rounded-xl overflow-hidden transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
          }`}>
            {TableUsers?.length > 0 && !isLoading ? (
              <Table
                scroll={{ x: 1300 }}
                title={() => (
                  <div className={`flex items-center justify-between p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isDark ? 'bg-blue-600' : 'bg-blue-600'
                      }`}>
                        <FiUser className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Customer Records
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {searchText 
                            ? `${fuse.search(searchText).length} results found` 
                            : `Total ${TableUsers.length} customers`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                bordered
                columns={columns}
                dataSource={
                  searchText.trim()
                    ? fuse.search(searchText).map((res) => res.item)
                    : TableUsers
                }
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                onRow={(record) => {
                  return {
                    onClick: () => {
                      const userId = record._id;
                      if (userId) {
                        navigate(`/reports/user-report/?user_id=${userId}`);
                      } else {
                        window.location.reload();
                      }
                    },
                    style: { cursor: "pointer" },
                    className: isDark 
                      ? "hover:bg-gray-700 transition-colors duration-150" 
                      : "hover:bg-blue-50 transition-colors duration-150",
                  };
                }}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={TableUsers.length <= 0}
                data="Customer Data"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSearch;