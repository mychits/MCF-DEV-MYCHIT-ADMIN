// export default GeneralPaymentOut;
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import api from "../instance/TokenInstance";
import { Button, Drawer, Modal } from "antd";
import { Dropdown } from "antd";
import DataTable from "../components/layouts/Datatable";
import CustomAlert from "../components/alerts/CustomAlert";
import Navbar from "../components/layouts/Navbar";
import { Select } from "antd";
import { IoMdMore } from "react-icons/io";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";
import { Space } from "lucide-react";

const GeneralPaymentOut = () => {
  const [groups, setGroups] = useState([]);
  const [TableAuctions, setTableAuctions] = useState([]);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [selectedAuctionGroup, setSelectedAuctionGroup] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedAuctionGroupId, setSelectedAuctionGroupId] = useState("");
  const [filteredAuction, setFilteredAuction] = useState([]);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentUpdateGroup, setCurrentUpdateGroup] = useState(null);
  const [double, setDouble] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [modifyPayment, setModifyPayment] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [openBackdropLoader, setOpenBackdropLoader] = useState(false);
  const [paymentGroupTickets, setPaymentGroupTickets] = useState([]);
  const [disbursementType, setDisbursementType] = useState("");
  const [showOthersField, setShowOthersField] = useState(false);
  const [paymentType, setPaymentType] = useState("Auction Winning Payout");
  const [rerender, setRerender] = useState(0);

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  const [formData, setFormData] = useState({
    group_id:"",
    user_id: "",
    pay_date: today,
    ticket: "",
    amount: "",
    pay_type: "cash",
    transaction_id: "",
    disbursement_type: "Auction Winning Payout",
    note: "",
  });

  const onGlobalSearchChangeHandler = (e) => {
    setSearchText(e.target.value);
  };

  const handlePaymentModeChange = (e) => {
    const selectedMode = e.target.value;
    setPaymentMode(selectedMode);
    setFormData((prev) => ({
      ...prev,
      pay_type: selectedMode,
      transaction_id: selectedMode === "online" ? prev.transaction_id : "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "disbursement_type") {
      if (value === "Others") {
        setShowOthersField(true);
        setDisbursementType("");
      } else {
        setShowOthersField(false);
        setDisbursementType(value);
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedGroupId) newErrors.customer = "Please select a customer";
    if (!formData.ticket)
      newErrors.payment_group_tickets = "Please Provide ticket";
    if (!formData.pay_date) newErrors.pay_date = "Payment date is required";

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0)
      newErrors.amount = "Please enter a valid positive amount";

    if (paymentMode === "online" && !formData.transaction_id?.trim())
      newErrors.transaction_id =
        "Transaction ID is required for online payments";
    if (!formData.disbursement_type)
      newErrors.disbursement_type = "Disbursement Type is Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data } = await api.get("/group/get-group-admin");
        setGroups(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setAdminName(user.name || "");
    const canEdit =
      user?.admin_access_right_id?.access_permissions?.edit_payment === "true";
    setModifyPayment(canEdit);
  }, []);

  useEffect(() => {
    if (!selectedAuctionGroupId) return;
    const fetchDouble = async () => {
      try {
        const { data } = await api.get(
          `/double/get-double/${selectedAuctionGroupId}`
        );
        setDouble(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDouble();
  }, [selectedAuctionGroupId]);

  const handleGroupAuction = (groupId) => {
    setSelectedAuctionGroupId(groupId);
    handleGroupAuctionChange(groupId);
  };

  const handleGroupAuctionChange = async (groupId) => {
    setSelectedAuctionGroup(groupId);
    if (!groupId) {
      setFilteredAuction([]);
      return;
    }

    setTableAuctions([]);
    setIsLoading(true);
    try {
      const { data } = await api.get(`/auction/get-group-auction/${groupId}`);
      if (data?.length) {
        setFilteredAuction(data);
        const formatted = [
          {
            id: 1,
            date: new Date(
              new Date(data[0].auction_date).getTime() - 10 * 86400000
            )
              .toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              .replace(",", ""),
            name: "Commencement",
            phone_number: "Commencement",
            ticket: "Commencement",
            bid_amount: 0,
            amount: 0,
            auction_type: "Commencement Auction",
          },
          ...data.map((g, idx) => ({
            _id: g._id,
            id: idx + 2,
            date: new Date(g.auction_date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            name: g.user_id?.full_name,
            phone_number: g.user_id?.phone_number,
            ticket: g.ticket,
            bid_amount: Number(g.divident) + Number(g.commission),
            amount: g.win_amount,
            auction_type:
              g.auction_type.charAt(0).toUpperCase() +
              g.auction_type.slice(1) +
              " Auction",
            status: !g?.isPrized
              ? "Un Prized"
              : g?.isPrized === "true"
              ? "Prized"
              : "Un Prized",
            action: (
              <div className="flex justify-center gap-2">
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: [
                      {
                        key: "1",
                        label: (
                          <div
                            className="text-green-600"
                            onClick={() =>
                              handlePaymentOut(
                                g.group_id?._id,
                                g.user_id?._id,
                                g.ticket
                              )
                            }
                          >
                            Payment out
                          </div>
                        ),
                      },
                      {
                        key: "2",
                        label: (
                          <div
                            className="text-blue-600"
                            onClick={() =>
                              handleUpdateModalOpen(g._id, idx + 2)
                            }
                          >
                            View
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
        setTableAuctions(formatted);
      } else {
        setFilteredAuction([]);
      }
    } catch (err) {
      console.error(err);
      setFilteredAuction([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentOut = async (groupId, userId, ticket) => {
    if (!userId || !groupId || !ticket) return;
    try {
      const { data } = await api.get(
        "/auction/get-auction-by-user-group-ticket",
        { params: { user_id: userId, group_id: groupId, ticket } }
      );
      setPaymentDetails({
        customerName: data.user_id?.full_name,
        groupName: data.group_id?.group_name,
        winAmount: data.win_amount,
      });
      setFormData((prev) => ({
        ...prev,
        group_id:data.group_id?._id,
        user_id: userId,
        amount: data.win_amount,
        ticket,
      }));
      setSelectedGroupId(groupId);
      setShowPaymentModal(true);
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (error.response?.status === 404 && msg === "Auction not found") {
        Modal.warning({
          title: "Auction Not Found",
          content:
            "No auction was found for the selected user, group, and ticket.",
        });
      } else {
        Modal.error({
          title: "Error Fetching Win Amount",
          content: "Something went wrong while trying to fetch win amount.",
        });
      }
    }
  };

  const handleUpdateModalOpen = async (groupId, si) => {
    try {
      const { data } = await api.get(`/auction/get-auction-by-id/${groupId}`);
      setCurrentUpdateGroup({ ...data, SI_number: si });
      setShowModalUpdate(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    const isValid = validateForm();
  

    if (!isValid) return;

    try {
      setDisabled(true);
      setShowPaymentModal(false);
      setAlertConfig((prev) => ({ ...prev, visibility: false }));

      const usr = localStorage.getItem("user");
      let admin_type = null;

      if (usr) {
        try {
          admin_type = JSON.parse(usr);
        } catch (e) {
          console.error("Failed to parse user from localStorage:", e);
        }
      }

      if (formData.disbursement_type === "Others" && disbursementType) {
        formData.disbursement_type = disbursementType;
      }

      const formattedTickets = paymentGroupTickets.map(
        ({ group_id, ticket }) => ({
          group_id,
          ticket_number: ticket,
        })
      );

      const payload = {
        ...formData,
        payment_group_tickets: formattedTickets,
        admin_type: admin_type?._id,
        pay_for: paymentType,
      };

      if (
        !formattedTickets.length &&
        selectedGroupId &&
        paymentGroupTickets[0]?.ticket
      ) {
        payload.group_id = selectedGroupId;
        payload.ticket = paymentGroupTickets[0].ticket;
      }

      setOpenBackdropLoader(true);

      const response = await api.post(
        "/payment-out/add-payments-and-mark-prized",
        payload
      );

      if (response.status >= 200 && response.status < 300) {
        console.log(" Payment out successful & auction updated");

        setSelectedGroupId("");
        setPaymentGroupTickets([]);
        setFormData({
          group_id:"",
          user_id: "",
          pay_date: today,
          amount: "",
          pay_type: "cash",
          transaction_id: "",
          ticket: "",
          disbursement_type: "Auction Winning Payout",
          note: "",
        });
      }
      window.location.reload();
    } catch (error) {
      console.error(" Error submitting payment data:", error);
      setShowPaymentModal(false);
      setSelectedGroupId("");
      setFormData({
         group_id:"",
        user_id: "",
        pay_date: today,
        amount: "",
        pay_type: "cash",
        transaction_id: "",
        ticket: "",
        disbursement_type: "Auction Winning Payout",
        note: "",
      });
      
    } finally {
      setOpenBackdropLoader(false);
      setRerender((prev) => prev + 1);
      setDisabled(false);
       window.location.reload();
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
const selectednewGroup = groups.find(g => g._id === selectedAuctionGroupId);
  return (
    <>
      <div className="flex mt-20">
        <Navbar
          onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
          visibility={true}
        />
        <Sidebar />

        <CustomAlert
          type={alertConfig.type}
          isVisible={alertConfig.visibility}
          message={alertConfig.message}
        />

        <div className="flex-grow p-7">
          <h1 className="text-2xl font-semibold">
            <span className="font-bold text-red-600">CHIT</span> Payment Out
          </h1>

          <div className="mt-6 mb-8">
            <div className="mb-10">
              <label>Select or Search Group</label>
              <div className="flex justify-between items-center w-full">
                <Select
                  value={selectedAuctionGroupId || undefined}
                  onChange={handleGroupAuction}
                  popupMatchSelectWidth={false}
                  showSearch
                  className="w-full max-w-md"
                  placeholder="Search or Select Group"
                  filterOption={(input, option) =>
                    option.children
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {groups.map((g) => (
                    <Select.Option key={g._id} value={g._id}>
                      {g.group_name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {filteredAuction[0]?.group_id?.group_type && (
                <p className="text-xl mt-5">Balance: {double.amount}</p>
              )}
            </div>

            <div>
              {TableAuctions.length ? (
                <DataTable
                  updateHandler={handleUpdateModalOpen}
                  data={filterOption(TableAuctions, searchText)}
                  columns={columns}
                  exportedPdfName="General Payment Out"
                  printHeaderKeys={[
                    "Group Name",
                    "Balance"
                  ]}
                  printHeaderValues={[
                    selectednewGroup?.group_name,
                    double.amount
                  ]}
                  exportedFileName={`General Payment Out.csv`}
                />
              ) : (
                <CircularLoader
                  isLoading={isLoading}
                  data="Auction Data"
                  failure={
                    TableAuctions.length === 0 && !!selectedAuctionGroupId
                  }
                />
              )}
            </div>
          </div>
        </div>

        <Drawer
         title="Chit Payment Out"
          open={showPaymentModal}
       
          okText="Submit"
          onClose={() => setShowPaymentModal(false)}
          
        >
          {paymentDetails ? (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium">
                  Customer Name
                </label>
                <input
                  value={paymentDetails.customerName}
                  readOnly
                  className="border bg-gray-100 rounded w-full p-2 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Group Name</label>
                <input
                  value={paymentDetails.groupName}
                  readOnly
                  className="border bg-gray-100 rounded w-full p-2 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Ticket</label>
                <input
                  name="ticket"
                  value={formData.ticket}
                  readOnly
                  className="bg-gray-100 border rounded w-full p-2 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Win Amount</label>
                <input
                  type="number"
                  value={paymentDetails.winAmount}
                  onChange={(e) =>
                    setPaymentDetails((p) => ({
                      ...p,
                      winAmount: e.target.value,
                    }))
                  }
                  className="border bg-gray-100 rounded w-full p-2 cursor-not-allowed"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Disbursement Type
                </label>
                <input
                  name="disbursement_type"
                  value={formData.disbursement_type}
                  readOnly
                  className="bg-gray-100 border rounded w-full p-2 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={formData.pay_date}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, pay_date: e.target.value }))
                  }
                  className="border rounded w-full p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Payment Mode
                </label>
                <select
                  name="pay_mode"
                  value={paymentMode}
                  onChange={handlePaymentModeChange}
                  className="border rounded w-full p-2"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                  {modifyPayment && (
                    <>
                      <option value="suspense">Suspense</option>
                      <option value="credit">Credit</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="others">Others</option>
                    </>
                  )}
                </select>
              </div>
              {paymentMode === "online" && (
                <div>
                  <label className="block text-sm font-medium">
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    name="transaction_id"
                    value={formData.transaction_id}
                    onChange={handleChange}
                    className="border rounded w-full p-2"
                  />
                  {errors.transaction_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.transaction_id}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium">Note</label>
                <textarea
                  value={paymentDetails.note || ""}
                  onChange={(e) =>
                    setPaymentDetails((p) => ({ ...p, note: e.target.value }))
                  }
                  className="border rounded w-full p-2"
                  rows={2}
                />
              </div>
              <div className="flex justify-between">
            <Button  onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit} type="primary">
              Submit
            </Button>
          </div>
            </form>
          ) : (
            <p>Loading payment details…</p>
          )}
        </Drawer>

        <Modal
          open={showModalUpdate}
          footer={null}
          onCancel={() => setShowModalUpdate(false)}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold">View Auction</h3>
            <form className="space-y-6">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block mb-2 text-sm">SI No</label>
                  <input
                    value={currentUpdateGroup?.SI_number}
                    readOnly
                    className="bg-gray-50 border rounded w-full p-2"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block mb-2 text-sm">Group *</label>
                  <input
                    value={currentUpdateGroup?.group_id?.group_name}
                    readOnly
                    className="bg-gray-50 border rounded w-full p-2"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block mb-2 text-sm">Group Value</label>
                  <input
                    value={currentUpdateGroup?.group_id?.group_value}
                    readOnly
                    className="bg-gray-50 border rounded w-full p-2"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block mb-2 text-sm">
                    Group Installment
                  </label>
                  <input
                    value={currentUpdateGroup?.group_id?.group_install}
                    readOnly
                    className="bg-gray-50 border rounded w-full p-2"
                  />
                </div>
              </div>
              {currentUpdateGroup?.group_id?.group_type === "double" && (
                <div>
                  <label className="block mb-2 text-sm">Auction Type</label>
                  <input
                    value={
                      currentUpdateGroup?.auction_type.charAt(0).toUpperCase() +
                      currentUpdateGroup?.auction_type.slice(1) +
                      " Auction"
                    }
                    readOnly
                    className="bg-gray-50 border rounded w-full p-2"
                  />
                </div>
              )}
              <div>
                <label className="block mb-2 text-sm">Customer *</label>
                <input
                  value={`${currentUpdateGroup?.user_id?.full_name} | ${currentUpdateGroup?.ticket}`}
                  readOnly
                  className="bg-gray-50 border rounded w-full p-2"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm">Bid Amount *</label>
                <input
                  value={
                    currentUpdateGroup?.group_id?.group_value -
                    currentUpdateGroup?.win_amount
                  }
                  readOnly
                  className="bg-gray-50 border rounded w-full p-2"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block mb-2 text-sm">Commission</label>
                  <input
                    value={currentUpdateGroup?.commission}
                    readOnly
                    className="bg-gray-50 border rounded w-full p-2"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block mb-2 text-sm">Winning Amount</label>
                  <input
                    value={currentUpdateGroup?.win_amount}
                    readOnly
                    className="bg-gray-50 border rounded w-full p-2"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block mb-2 text-sm">Divident</label>
                  <input
                    value={currentUpdateGroup?.divident}
                    readOnly
                    className="bg-gray-50 border rounded w-full p-2"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block mb-2 text-sm">
                    Divident per Head
                  </label>
                  <input
                    value={currentUpdateGroup?.divident_head}
                    readOnly
                    className="bg-gray-50 border rounded w-full p-2"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block mb-2 text-sm">Next Payable</label>
                  <input
                    value={currentUpdateGroup?.payable}
                    readOnly
                    className="bg-gray-50 border rounded w-full p-2"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block mb-2 text-sm">Auction Date *</label>
                  <input
                    type="date"
                    value={currentUpdateGroup?.auction_date}
                    readOnly
                    className="bg-gray-50 border rounded w-full p-2"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block mb-2 text-sm">Next Date *</label>
                  <input
                    type="date"
                    value={currentUpdateGroup?.next_date}
                    readOnly
                    className="bg-gray-50 border rounded w-full p-2"
                  />
                </div>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default GeneralPaymentOut;
