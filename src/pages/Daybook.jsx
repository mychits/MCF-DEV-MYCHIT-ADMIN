/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import Modal from "../components/modals/Modal";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import { Select, Dropdown, Input, Tag, Card, Statistic, Row, Col, Empty } from "antd";
import Navbar from "../components/layouts/Navbar";
import { IoMdMore } from "react-icons/io";
import { ArrowUpOutlined, ArrowDownOutlined, WalletOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import filterOption from "../helpers/filterOption";
import { numberToIndianWords } from "../helpers/numberToIndianWords"

const Daybook = () => {
  const [groups, setGroups] = useState([]);
  const [TableDaybook, setTableDaybook] = useState([]);
  const [selectedAuctionGroupId, setSelectedAuctionGroupId] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredAuction, setFilteredAuction] = useState([]);
  const todayString = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [showFilterField, setShowFilterField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState([]);
  const [selectedPaymentFor, setSelectedPaymentFor] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [collectionAgent, setCollectionAgent] = useState("");
  const [collectionAdmin, setCollectionAdmin] = useState("");
  const [agents, setAgents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("Today");
  const [showAllPaymentModes, setShowAllPaymentModes] = useState(false);

  // New States for IN/OUT
  const [selectedTransactionType, setSelectedTransactionType] = useState("All");
  const [totals, setTotals] = useState({ in: 0, out: 0, net: 0 });

  const onGlobalSearchChangeHandler = (e) => setSearchText(e.target.value);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.admin_access_right_id?.access_permissions?.edit_payment) {
      setShowAllPaymentModes(user.admin_access_right_id.access_permissions.edit_payment === "true");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, groupsRes, agentsRes, adminsRes] = await Promise.all([
          api.get("/user/get-user"),
          api.get("/group/get-group-admin"),
          api.get("/employee"),
          api.get("/admin/get-sub-admins")
        ]);
        setFilteredUsers(usersRes.data);
        setGroups(groupsRes.data);
        setAgents(agentsRes.data.employee.map(e => ({ ...e, full_name: e.name, selected_type: "agent_type" })));
        setAdmins(adminsRes.data.map(a => ({ ...a, full_name: a.name, selected_type: "admin_type" })));
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const handleSelectFilter = (value) => {
    setSelectedLabel(value);
    setShowFilterField(value === "Custom");
    const today = new Date();
    const fmt = (d) => d.toISOString().slice(0, 10);
    if (value === "Today") setSelectedDate(fmt(today));
    else if (value === "Yesterday") setSelectedDate(fmt(new Date(today.setDate(today.getDate() - 1))));
    else if (value === "Twodaysago") setSelectedDate(fmt(new Date(today.setDate(today.getDate() - 2))));
  };

  useEffect(() => {
    const abortController = new AbortController();
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/payment/daybook`, {
          params: {
            pay_date: selectedDate,
            groupId: selectedAuctionGroupId,
            userId: selectedCustomers,
            pay_type: selectedPaymentMode,
            account_type: selectedAccountType,
            collected_by: collectionAgent,
            admin_type: collectionAdmin,
            pay_for: selectedPaymentFor,
          },
          signal: abortController.signal,
        });

        if (response.data) {
          let tin = 0, tout = 0;

          const formattedData = response.data.map((item, index) => {
            const amt = Number(item.amount || 0);
            if (item.type === "IN") tin += amt;
            else tout += Math.abs(amt);

            return {
              _id: item._id,
              id: index + 1,
              type: <Tag color={item?.type === "IN" ? "green" : "volcano"}>{item?.type ?? "Unknown"}</Tag>,
              type_raw: item?.type,
              group: item?.group_id?.group_name || item?.pay_for || "N/A",
              name: item?.user_id?.full_name || "N/A",
              ticket: item?.ticket || "-",
              receipt: item?.receipt_no || "-",
              amount: <span className={item?.type === "IN" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                ₹ {Math.abs(amt).toLocaleString("en-IN")}
              </span>,
              amount_raw: amt,
              pay_date: item.pay_date,
              category:item.pay_for  ? item.pay_for : "Chit",
              transaction_date: item.createdAt?.split("T")?.[0],
              mode: item?.pay_type,
              account_type: item?.account_type,
              payment_type: item?.payment_type,
              collected_by: item?.collected_by?.name || item?.admin_type?.admin_name || "Super Admin",
              action: (
                <Link target="_blank" to={`/print/${item._id}`} className="text-blue-600">Print</Link>
              ),
            };
          });

          setTotals({ in: tin, out: tout, net: tin - tout });
          setFilteredAuction(response.data);

          const finalTable = selectedTransactionType === "All"
            ? formattedData
            : formattedData.filter(i => i?.category === selectedTransactionType);

          setTableDaybook(finalTable);
        }
      } catch (error) {
        setTableDaybook([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
    return () => abortController.abort();
  }, [selectedAuctionGroupId, selectedDate, selectedPaymentMode, selectedCustomers, selectedAccountType, collectionAgent, collectionAdmin, selectedPaymentFor, selectedTransactionType]);

  const columns = [
    { key: "id", header: "SL" },
    { key: "transaction_date", header: "Transaction Date" },
    { key: "payment_type", header: "Payment Type" },
    { key: "pay_date", header: "Payment Date" },
    {
      key: "type",
      header: "Type",

    },
     {
      key: "category",
      header: "Category",

    },
    { key: "group", header: "Group/Reason" },
    { key: "name", header: "Customer" },
    { key: "ticket", header: "Ticket" },
    { key: "receipt", header: "Receipt" },
    {
      key: "amount",
      header: "Amount",

    },
    { key: "mode", header: "Mode" },
    { key: "collected_by", header: "Collected By" },
    { key: "action", header: "Action" },
  ];
  const exportCols = [

 { key: "id", header: "SL" },
    { key: "transaction_date", header: "Transaction Date" },
    { key: "payment_type", header: "Payment Type" },
    { key: "pay_date", header: "Payment Date" },
    {
      key: "type_raw",
      header: "Type",

    },
    { key: "group", header: "Group/Reason" },
    { key: "name", header: "Customer" },
    { key: "ticket", header: "Ticket" },
    { key: "receipt", header: "Receipt" },
    {
      key: "amount_raw",
      header: "Amount",

    },
    { key: "mode", header: "Mode" },
     {
      key: "category",
      header: "Category",

    },
    { key: "collected_by", header: "Collected By" },
    

  ]

  return (
    <div className="w-screen flex">
      <Navbar onGlobalSearchChangeHandler={onGlobalSearchChangeHandler} visibility={true} />
      <div className="flex-grow p-8 bg-slate-50 min-h-screen">

        {/* Professional Header & Summary Dashboard */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Daybook Report</h1>
          <p className="text-slate-500">Comprehensive view of daily collections and disbursements</p>
        </div>

        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} md={8}>
            <Card className="shadow-sm border-l-4 border-green-500">
              <Statistic title="Total IN (Collections)" value={totals.in} precision={2} prefix={<>

                <ArrowUpOutlined />₹

              </>} valueStyle={{ color: '#3f8600' }} />
             

            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="shadow-sm border-l-4 border-red-500">
              <Statistic title="Total OUT (Payouts)" value={totals.out} precision={2} prefix={<>

                <ArrowDownOutlined /> ₹

              </>} valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="shadow-sm border-l-4 border-blue-500 bg-blue-50/20">
              <Statistic title="Net Balance" value={totals.net} precision={2} prefix={<>

                <WalletOutlined />
                ₹
              </>} valueStyle={{ color: '#096dd9' }} />
            </Card>
          </Col>
        </Row>

        {/* Existing Filters Card */}
        <div className="bg-white rounded-xl shadow-md border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* New IN/OUT Filter */}
            {/* <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">TRANSACTION TYPE</label>
              <Select className="w-full h-10" value={selectedTransactionType} onChange={setSelectedTransactionType}>
                <Select.Option value="All">All (IN & OUT)</Select.Option>
                <Select.Option value="IN">Payment IN Only</Select.Option>
                <Select.Option value="OUT">Payment OUT Only</Select.Option>
              </Select>
            </div> */}



            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">DATE RANGE</label>
              <Select className="w-full h-10" value={selectedLabel} onChange={handleSelectFilter} options={[{ value: "Today", label: "Today" }, { value: "Yesterday", label: "Yesterday" }, { value: "Twodaysago", label: "Two Days Ago" }, { value: "Custom", label: "Custom" }]} />
            </div>

            {showFilterField && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ">CUSTOM DATE</label>
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-10 rounded-md" />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">GROUP</label>
              <Select className="w-full h-10" showSearch value={selectedAuctionGroupId} onChange={setSelectedAuctionGroupId} placeholder="Select Group"
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }



              >
                <Select.Option value="">All Groups</Select.Option>
                {groups.map(g => <Select.Option key={g._id} value={g._id}>{g.group_name}</Select.Option>)}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">CUSTOMER</label>
              <Select className="w-full h-10" showSearch value={selectedCustomers} onChange={setSelectedCustomers} placeholder="Select Customer"
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }


              >
                <Select.Option value="">All Customers</Select.Option>
                {filteredUsers.map(u => <Select.Option key={u._id} value={u?._id}>{u?.full_name} - {u?.phone_number}</Select.Option>)}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">PAYMENT FOR</label>
              <Select mode="multiple" className="w-full min-h-10" value={selectedPaymentFor} onChange={setSelectedPaymentFor} placeholder="Chit, Loan, etc.">
                <Select.Option value="Chit">Chit</Select.Option>
                <Select.Option value="Pigme">Pigme</Select.Option>
                <Select.Option value="Loan">Loan</Select.Option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">PAYMENT MODE</label>
              <Select mode="multiple" className="w-full min-h-10" value={selectedPaymentMode} onChange={setSelectedPaymentMode} options={[{ label: 'Cash', value: 'cash' }, { label: 'Online', value: 'online' }, { label: 'Payment Link', value: 'Payment Link' }]} placeholder="Cash, Online, etc." />
            </div>

            {showAllPaymentModes && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">ACCOUNT TYPE</label>
                <Select className="w-full h-10" value={selectedAccountType} onChange={setSelectedAccountType} options={[{ label: 'All', value: '' }, { label: 'Suspense', value: 'suspense' }, { label: 'Credit', value: 'credit' }]} />
              </div>
            )}


             <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Collection Employee
                    </label>
                    <Select
                      showSearch
                      placeholder="Select employee"
                      popupMatchSelectWidth={false}
                      onChange={(selection) => {
                        const [id, type] = selection.split("|") || [];
                        if (type === "admin_type") {
                          setCollectionAdmin(id);
                          setCollectionAgent("");
                        } else if (type === "agent_type") {
                          setCollectionAgent(id);
                          setCollectionAdmin("");
                        } else {
                          setCollectionAdmin("");
                          setCollectionAgent("");
                        }
                      }}
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className="w-full"
                      style={{ height: "44px" }}>
                      <Select.Option value="">All Employees</Select.Option>
                      {[...new Set(agents), ...new Set(admins)].map((dt) => (
                        <Select.Option
                          key={dt?._id}
                          value={`${dt._id}|${dt.selected_type}`}>
                          {dt.selected_type === "admin_type"
                            ? "Admin | "
                            : "Employee | "}
                          {dt.full_name} | {dt.phone_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>


            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">TOTAL DISPLAYED</label>
              <div className="h-10 px-3 flex items-center bg-blue-50 border border-blue-200 rounded text-blue-700 font-bold">
                ₹ {totals?.net.toLocaleString("en-IN")}
              </div>
              <span className={`text-sm font-mono ${totals?.net < 0 ? "text-red-700" : "text-green-700"}`}>
                {numberToIndianWords(totals?.net || 0)}
              </span>
            </div>
          </div>
        </div>


        <div className="bg-white rounded-xl shadow-md border p-4">
          {isLoading ? (
            <div className="py-20 flex justify-center"><CircularLoader isLoading={true} /></div>
          ) : TableDaybook?.length <= 0 ? <Empty description="Daybook Data is not found" /> : (
            <DataTable data={filterOption(TableDaybook, searchText)} columns={columns} exportCols={exportCols} exportedPdfName={`Daybook_${selectedDate}`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Daybook;