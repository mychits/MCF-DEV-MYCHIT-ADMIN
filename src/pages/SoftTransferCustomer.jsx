import {
  Button,
  Select,
  Input,
  Drawer,
  Space,
  Form,
  Row,
  Col,
  Spin,
} from "antd";
import Sidebar from "../components/layouts/Sidebar";
import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import Navbar from "../components/layouts/Navbar";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import filterOption from "../helpers/filterOption";
import { LoadingOutlined } from "@ant-design/icons";

const SoftTransferCustomer = () => {
  const [loader, setLoader] = useState(false);
  const [allGroups, setAllGroups] = useState([]);
  const [transferData, setTransferData] = useState([]);
  const [isDataTableLoading, setIsDataTableLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);
  const [destinationGroup, setDestinationGroup] = useState("");
  const [destinationCustomer, setDestinationCustomer] = useState("");
  const [destinationTicket, setDestinationTicket] = useState("");
  const [sourceGroup, setSourceGroup] = useState("");
  const [sourceTicket, setSourceTicket] = useState("");
  const [sourceCustomer, setSourceCustomer] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [destinationCustomers, setDestinationCustomers] = useState([]);
  const [sourceCustomers, setSourceCustomers] = useState([]);

  const getGroupNameById = (groupId) => {
    const group = allGroups.find((g) => g._id === groupId);
    return group?.group_name || "Unknown Group";
  };

  const fetchTransfers = async () => {
    try {
      setIsDataTableLoading(true);
      const res = await api.get("/enroll/transfer/get-all/Soft");
      console.log(res.data, "response data");
      const formattedData = (res.data || []).map((transfer, index) => {
        const fromGroupName =
          transfer?.fromGroup?.group_name || transfer?.fromGroup;
        const toGroupName = transfer?.toGroup?.group_name || transfer?.toGroup;
        const fromUser = transfer?.fromUser || {};
        const toUser = transfer?.toUser || {};

        return {
          _id: transfer._id,
          id: index + 1,
          transfer_id: `TRAN-${index + 1}`,
          from_group: fromGroupName,
          to_group: toGroupName,
          from_customer: fromUser.full_name || "-",
          from_phone: fromUser.phone_number || "-",
          from_ticket: transfer?.fromTicket || "-",
          to_customer: toUser.full_name || "-",
          to_phone: toUser.phone_number || "-",
          to_ticket: transfer?.toTicket || "-",
          transfer_amount: transfer?.transferAmount ?? 0,

          transfer_type: transfer?.transferType || "-",
          date: transfer?.createdAt?.split("T")[0] || "-",
        };
      });
      setTransferData(formattedData);
    } catch (err) {
      console.error("Failed to fetch transfers", err);
    } finally {
      setIsDataTableLoading(false);
    }
  };

  const handleAddTransferClick = async () => {
    try {
      setLoader(true);
      const response = await api.get("/group/get-group");
      setAllGroups(response.data);
      setShowModal(true);
    } catch (err) {
      setAllGroups([]);
      console.error("Error loading groups", err);
      alert("Could not load group data.");
    } finally {
      setLoader(false);
    }
  };

  const handleSourceCustomers = async () => {
    if (!sourceGroup) return;
    try {
      const response = await api.get(
        `/enroll/get-group-all-enroll/${sourceGroup}`
      );
      setSourceCustomers(response.data);
    } catch (error) {
      setSourceCustomers([]);
      console.log("Failed to get Source Customers", error);
    }
  };

  const handleDestinationCustomers = async () => {
    if (!destinationGroup) return;
    try {
      const response = await api.get(
        `/enroll/get-group-all-enroll/${destinationGroup}`
      );
      setDestinationCustomers(response.data);
    } catch (error) {
      setDestinationCustomers([]);
      console.log("Failed to get Destination Customers", error);
    }
  };

  useEffect(() => {
    if (sourceGroup) {
      handleSourceCustomers();
    }
  }, [sourceGroup]);

  useEffect(() => {
    if (destinationGroup) {
      handleDestinationCustomers();
    }
  }, [destinationGroup]);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleChange = (key, value) => {
    switch (key) {
      case "sourceGroup":
        setSourceGroup(value);
        setSourceCustomer("");
        setSourceTicket("");
        setAmountPaid(0);
        break;
      case "sourceCustomer":
        const [userId, ticket] = value.split("|");
        setSourceCustomer(userId);
        setSourceTicket(ticket);
        setAmountPaid(0);
        break;
      case "destinationGroup":
        setDestinationGroup(value);
        setDestinationCustomer("");
        setDestinationTicket("");
        break;
      case "destinationCustomer":
        const [toUserId, toTicket] = value.split("|");
        setDestinationCustomer(toUserId);
        setDestinationTicket(toTicket);
        break;
      case "transfer_amount":
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
          setTransferAmount(value);
        }
        break;
      default:
        break;
    }
  };

  const fetchAmountPaid = async () => {
    if (!sourceGroup || !sourceCustomer || !sourceTicket) {
      alert("Please select Group, Enrolled Customer, and Ticket first.");
      return;
    }
    try {
      const res = await api.get("/enroll/get-amount-paid", {
        params: {
          group_id: sourceGroup,
          user_id: sourceCustomer,
          ticket: sourceTicket,
        },
      });
      setAmountPaid(res.data.amountPaid || 0);
    } catch (error) {
      setAmountPaid(0);
      console.error("Failed to fetch amount paid", error);
      alert("Could not fetch amount paid.");
    }
  };

  const handleTransfer = async () => {
    if (
      !sourceGroup ||
      !sourceCustomer ||
      !sourceTicket ||
      !destinationGroup ||
      !destinationCustomer ||
      !destinationTicket ||
      !transferAmount ||
      parseFloat(transferAmount) <= 0
    ) {
      alert("Please fill all fields and enter a valid transfer amount.");
      return;
    }

    if (parseFloat(transferAmount) > amountPaid) {
      alert("Transfer amount cannot exceed amount paid.");
      return;
    }

    try {
      const payload = {
        fromGroup: sourceGroup,
        fromUserId: sourceCustomer,
        fromTicket: Number(sourceTicket),
        amountPaid,
        transferAmount: parseFloat(transferAmount),
        toGroup: destinationGroup,
        toUser: destinationCustomer,
        toTicket: Number(destinationTicket),
        transferType: "Soft",
      };
      const res = await api.post("/enroll/transfer-customer", payload);
      if (res.status === 200 || res.status === 201) {
        const transfer = res.data;
        const formatted = {
          _id: transfer._id,
          id: transferData.length + 1,
          transfer_id: `TRAN-${transferData.length + 1}`,
          from_group: getGroupNameById(sourceGroup),
          to_group: getGroupNameById(destinationGroup),
          from_customer:
            sourceCustomers.find((c) => c.user_id?._id === sourceCustomer)
              ?.user_id?.full_name || "-",
          from_phone:
            sourceCustomers.find((c) => c.user_id?._id === sourceCustomer)
              ?.user_id?.phone_number || "-",
          from_ticket: sourceTicket,
          to_customer:
            destinationCustomers.find(
              (c) => c.user_id?._id === destinationCustomer
            )?.user_id?.full_name || "-",
          to_phone:
            destinationCustomers.find(
              (c) => c.user_id?._id === destinationCustomer
            )?.user_id?.phone_number || "-",
          to_ticket: destinationTicket,
          transfer_amount: parseFloat(transferAmount),
          amount_paid: amountPaid,
          transfer_type: "Soft",
          date: new Date().toISOString().split("T")[0],
        };
        setTransferData((prev) => [...prev, formatted]);
        alert("Transfer successful!");
        resetForm();
        setShowModal(false);
      } else {
        alert("Transfer failed.");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      alert("Transfer failed. Check console for details.");
    }
  };

  const resetForm = () => {
    setSourceGroup("");
    setSourceCustomer("");
    setSourceTicket("");
    setDestinationGroup("");
    setDestinationCustomer("");
    setDestinationTicket("");
    setTransferAmount("");
    setAmountPaid(0);
  };

  const columns = [
    { key: "id", header: "Sl No" },
    { key: "transfer_id", header: "Transfer ID" },
    { key: "from_group", header: "From Group" },
    { key: "from_customer", header: "From Customer" },
    { key: "from_ticket", header: "From Ticket" },
    { key: "to_group", header: "To Group" },
    { key: "to_customer", header: "To Customer" },
    { key: "to_ticket", header: "To Ticket" },
    { key: "transfer_amount", header: "Transfer Amount" },
    { key: "transfer_type", header: "Transfer Type" },
    { key: "date", header: "Transfer Date" },
  ];

  return (
    <>
      <div className="flex mt-20">
        <Navbar
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
          visibility={true}
        />
        <Sidebar />
        <div className="flex-grow p-7">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Soft Transfer</h1>
            <Button
              onClick={handleAddTransferClick}
               className="bg-blue-950 text-white px-5 py-5 rounded shadow-md hover:bg-blue-800 transition duration-200 text-lg"

              disabled={loader}
            >
              {loader ? (
                <Spin indicator={<LoadingOutlined spin />} />
              ) : (
                "+ Add Transfer"
              )}
            </Button>
          </div>
          {transferData?.length > 0 ? (
            <DataTable
              data={filterOption(transferData, searchText)}
              columns={columns}
              exportedPdfName="Soft Amount Transfer Customer"
            />
          ) : (
            <CircularLoader
              isLoading={isDataTableLoading}
              failure={transferData?.length === 0}
              data="Transfers"
            />
          )}
        </div>
      </div>

      <Drawer
        title="Add Soft Transfer"
        width={840}
        onClose={() => setShowModal(false)}
        open={showModal}
        styles={{
          body: { paddingBottom: 80, paddingTop: 16, fontSize: "16px" },
          header: { fontSize: "18px", fontWeight: "600" },
        }}
        extra={
          <Space>
            <Button size="large" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button size="large" type="primary" onClick={handleTransfer}>
              Submit
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" size="large">
          <Row gutter={[16, 24]} className="px-2">
            <Col span={24}>
              <Form.Item
                label={<span className="font-medium">From Group</span>}
              >
                <Select
                  size="large"
                  placeholder="Select Group"
                  onChange={(value) => handleChange("sourceGroup", value)}
                  value={sourceGroup || undefined}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ fontSize: "16px", height: "52px" }}
                >
                  {allGroups
                    .filter((g) => g.group_name)
                    .map((group) => (
                      <Select.Option key={group._id} value={group._id}>
                        {group.group_name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={<span className="font-medium">From Customer</span>}
              >
                <Select
                  size="large"
                  placeholder="Select Customer"
                  onChange={(value) => handleChange("sourceCustomer", value)}
                  value={
                    sourceCustomer && sourceTicket
                      ? `${sourceCustomer}|${sourceTicket}`
                      : undefined
                  }
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ fontSize: "16px", height: "52px" }}
                >
                  {sourceCustomers
                    .filter((e) => e.user_id?._id && e.tickets)
                    .map((e) => (
                      <Select.Option
                        key={e._id}
                        value={`${e.user_id._id}|${e.tickets}`}
                      >
                        {`${e.user_id.full_name} | ${e.user_id.phone_number} | Ticket: ${e.tickets}`}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Button
                onClick={fetchAmountPaid}
                size="large"
                type="primary"
                style={{
                  width: "100%",
                  height: "52px",
                  fontSize: "16px",
                  fontWeight: "500",
                  backgroundColor: "#1e40af",
                }}
              >
                Check Total Amount Paid
              </Button>
            </Col>

            <Col span={24}>
              <Form.Item
                label={<span className="font-medium">Amount Paid</span>}
              >
                <Input
                  disabled
                  size="large"
                  value={amountPaid}
                  style={{
                    fontSize: "16px",
                    height: "52px",
                    fontWeight: "500",
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={<span className="font-medium">Transfer Amount</span>}
              >
                <Input
                  size="large"
                  placeholder="Enter Amount to Transfer"
                  value={transferAmount}
                  onChange={(e) =>
                    handleChange("transfer_amount", e.target.value)
                  }
                  style={{ fontSize: "16px", height: "52px" }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label={<span className="font-medium">To Group</span>}>
                <Select
                  size="large"
                  placeholder="Select Destination Group"
                  onChange={(value) => handleChange("destinationGroup", value)}
                  value={destinationGroup || undefined}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ fontSize: "16px", height: "52px" }}
                >
                  {allGroups
                    .filter((g) => g.group_name)
                    .map((group) => (
                      <Select.Option key={group._id} value={group._id}>
                        {group.group_name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={<span className="font-medium">To Customer</span>}
              >
                <Select
                  size="large"
                  placeholder="Select Destination Customer"
                  onChange={(value) =>
                    handleChange("destinationCustomer", value)
                  }
                  value={
                    destinationCustomer && destinationTicket
                      ? `${destinationCustomer}|${destinationTicket}`
                      : undefined
                  }
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ fontSize: "16px", height: "52px" }}
                >
                  {destinationCustomers
                    .filter((e) => e.user_id?._id && e.tickets)
                    .map((e) => (
                      <Select.Option
                        key={e._id}
                        value={`${e.user_id._id}|${e.tickets}`}
                      >
                        {`${e.user_id.full_name} | ${e.user_id.phone_number} | Ticket: ${e.tickets}`}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default SoftTransferCustomer;
