/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import api from "../instance/TokenInstance";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import Modal from "../components/modals/Modal";
import { IoMdMore } from "react-icons/io";
import { BsEye } from "react-icons/bs";
import DataTable from "../components/layouts/Datatable";
import { EyeIcon } from "lucide-react";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { Dropdown, Select } from "antd";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";

const AuctionReport = () => {
  const [groups, setGroups] = useState([]);
  const [TableAuctions, setTableAuctions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedAuctionGroup, setSelectedAuctionGroup] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedAuctionGroupId, setSelectedAuctionGroupId] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredAuction, setFilteredAuction] = useState([]);
  const [groupInfo, setGroupInfo] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentUpdateGroup, setCurrentUpdateGroup] = useState(null);
  const [double, setDouble] = useState({});
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    group_id: "",
    user_id: "",
    ticket: "",
    bid_amount: "",
    commission: "",
    win_amount: "",
    divident: "",
    divident_head: "",
    payable: "",
    auction_date: "",
    next_date: "",
    group_type: "",
    auction_type: "normal",
  });

  const onGlobalSearchChangeHandler = (e) => {
    setSearchText(e.target.value);
  };
    const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });


  const totalCustomers = filteredAuction.length;
  const totalBidAmount = filteredAuction.reduce(
    (sum, item) => sum + ((parseInt(item.divident) || 0) + (parseInt(item.commission) || 0)),
    0
  );
  const totalWinAmount = filteredAuction.reduce(
    (sum, item) => sum + (parseInt(item.win_amount) || 0),
    0
  );

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/group/get-group-admin");
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchDouble = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/double/get-double/${selectedAuctionGroupId}`);
        setDouble(response.data);
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDouble();
  }, [selectedAuctionGroupId]);

  const handleGroupAuction = async (groupId) => {
    setSelectedAuctionGroupId(groupId);
    handleGroupAuctionChange(groupId);
  };
   const formatPayDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "numeric", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options).replace(",", " ");
  };
  const prevDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 10);
    const options = { day: "numeric", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options).replace(",", " ");
  };

  const handleGroupAuctionChange = async (groupId) => {
    setSelectedAuctionGroup(groupId);
    if (groupId) {
      try {
        const response = await api.get(`/auction/get-group-auction/${groupId}`);
        if (response.data && response.data.length > 0) {
          setFilteredAuction(response.data);
          const formattedData = [
            {
              id: 1,
              date: prevDate(response?.data[0]?.auction_date),
              name: "Commencement",
              phone_number: "Commencement",
              ticket: "Commencement",
              bid_amount: 0,
              amount: 0,
              auction_type: "Commencement Auction",
            },
            ...response.data.map((group, index) => ({
              _id: group._id,
              id: index + 2,
              date: formatPayDate(group.auction_date),
              name: group.user_id?.full_name,
              phone_number: group.user_id?.phone_number,
              ticket: group.ticket,
              bid_amount: parseInt(group.divident) + parseInt(group.commission),
               status: !group?.isPrized
              ? "Un Prized"
              : group?.isPrized === "true"
              ? "Prized"
              : "Un Prized",
              auction_type:
                group?.auction_type.charAt(0).toUpperCase() +
                group?.auction_type.slice(1) +
                " Auction",
              action: (
                <div className="flex justify-end gap-2">
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "1",
                          label: (
                            <div
                              className="text-green-600"
                              onClick={() => handleUpdateModalOpen(group._id)}
                            >
                              Edit
                            </div>
                          ),
                        },
                        {
                          key: "2",
                          label: (
                            <div
                              className="text-red-600"
                              onClick={() => handleDeleteModalOpen(group._id)}
                            >
                              Delete
                            </div>
                          ),
                        },
                      ],
                    }}
                    placement="bottomLeft"
                  >
                    <IoMdMore className="text-bold" />
                  </Dropdown>
                </div>
              ),
            })),
          ];
          setTableAuctions(formattedData);
        } else {
          setFilteredAuction([]);
        }
      } catch (error) {
        console.error("Error fetching auction data:", error);
        setFilteredAuction([]);
      }
    } else {
      setFilteredAuction([]);
    }
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "date", header: "Auction Date" },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Customer Phone Number" },
    { key: "ticket", header: "Ticket" },
    { key: "bid_amount", header: "Bid Amount" },
    { key: "amount", header: "Win Amount" },
    { key: "auction_type", header: "Auction Type" },
     { key: "status", header: "Status" },
    { key: "action", header: "Action" },
  ];

  const handleUpdateModalOpen = async (groupId) => {
    try {
      const response = await api.get(`/auction/get-auction-by-id/${groupId}`);
      setCurrentUpdateGroup(response.data);
      setShowModalUpdate(true);
    } catch (error) {
      console.error("Error fetching auction:", error);
    }
  };

  const handleDeleteModalOpen = async (groupId) => {
    try {
      const response = await api.get(`/auction/get-auction-by-id/${groupId}`);
      setCurrentGroup(response.data);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching enroll:", error);
    }
  };

  const handleDeleteAuction = async () => {
    if (currentGroup) {
      try {
        await api.delete(`/auction/delete-auction/${currentGroup._id}`);
        alert("Auction deleted successfully");
        setShowModalDelete(false);
        setCurrentGroup(null);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting auction:", error);
      }
    }
  };
const selectednewGroup = groups.find(g => g._id === selectedAuctionGroupId);
  return (
    <>
      <div className="w-screen min-h-screen">
        <div className="flex mt-30">
          <Navbar
            onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
            visibility={true}
          />
          <CustomAlertDialog
            type={alertConfig.type}
            isVisible={alertConfig.visibility}
            message={alertConfig.message}
            onClose={() =>
              setAlertConfig((prev) => ({ ...prev, visibility: false }))
            }
          />
          <div className="flex-grow p-7">
            <h1 className="text-2xl font-bold text-center mb-6">Reports - Auction </h1>
            <div className="mt-6 mb-8">
              <div className="flex justify-center items-center w-full gap-4 bg-blue-50 p-2 w-30 h-40  rounded-3xl  border   space-x-2 mb-10">
                <div className="mb-2">
                <label className="block text-lg text-gray-500 text-center font-semibold mb-2">
                  Auction Group
                </label>
                
                  <Select
                    showSearch
                    popupMatchSelectWidth={false}
                    value={selectedAuctionGroupId || undefined}
                    onChange={handleGroupAuction}
                    placeholder="Search or Select Auction"
                    style={{ height: "50px", width: "600px" }}
                    filterOption={(input, option) =>
                      option.children.toString().toLowerCase().includes(input.toLowerCase())
                    }
                    
                  >
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.group_name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Table and Summary */}
              {filteredAuction && filteredAuction.length > 0 && !isLoading ? (
                <>
                  <DataTable
                    updateHandler={handleUpdateModalOpen}
                    data={filterOption(TableAuctions, searchText)}
                    columns={columns}
                     exportedPdfName={`Auction Report`}
                    printHeaderKeys={["Group Name"]}
                    printHeaderValues={[
                      selectednewGroup?.group_name || "N/A",
                    ]}
                    exportedFileName={`AuctionsReport-${
                      TableAuctions.length > 0
                        ? TableAuctions[1].name + " to " + TableAuctions[TableAuctions.length - 1].name
                        : "empty"
                    }.csv`}
                  />

                  {/* ✅ Summary Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white p-6 rounded-lg shadow mt-6 text-center">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700">Total Customers</h4>
                      <p className="text-xl font-bold text-blue-700">{totalCustomers}</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700">Total Bid Amount</h4>
                      <p className="text-xl font-bold text-green-700">₹{totalBidAmount}</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700">Total Win Amount</h4>
                      <p className="text-xl font-bold text-red-700">₹{totalWinAmount}</p>
                    </div>
                  </div>
                </>
              ) : (
                <CircularLoader isLoading={isLoading} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuctionReport;
