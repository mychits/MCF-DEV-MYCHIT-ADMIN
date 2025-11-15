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

const HardTransfer = () => {
  const [loader, setLoader] = useState(false);
  const [allGroups, setAllGroups] = useState([]);
  const [transferData, setTransferData] = useState([]);
  const [isDataTableLoading, setIsDataTableLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);
  const [transferAmount, setTransferAmount] = useState("");

  const [sourceEnrollment, setSourceEnrollment] = useState([]);
  const [destinationEnrollment, setDestinationEnrollment] = useState([]);
  //known enollments
  const [deletedEnrollments, setDeletedEnrollments] = useState([]);
  const getGroupNameById = (groupId) => {
    const group = allGroups.find((g) => g._id === groupId);
    return group?.group_name || "Unknown Group";
  };

  const fetchTransfers = async () => {
    try {
      setIsDataTableLoading(true);
      const res = await api.get("/enroll/transfer/get-all/Hard");

      const formattedData = (res.data || []).map((transfer, index) => {
        const fromGroupName =
          transfer?.fromGroup?.group_name || transfer?.fromGroup;
        const toGroupName = transfer?.toGroup?.group_name || transfer?.toGroup;
        const fromUser = transfer?.fromUser || {};
        const toUser = transfer?.toUser || {};

        return {
          _id: transfer._id,
          id: index + 1,
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

  const fetchDeletedEnrollments = async () => {
    try {
      const res = await api.get("/enroll/deleted");

      const formattedData = (res.data?.data || []).map((enrollment, index) => {
        return {
          enroll_id:enrollment?._id,
          customer_name: enrollment?.user_id?.full_name,
          customer_phone: enrollment?.user_id?.phone_number,
          customer_id: enrollment?.user_id?.customer_id,
          group_name: enrollment.group_id?.group_name,
          ticket: enrollment.tickets,
        };
      });
      setDeletedEnrollments(formattedData);
    } catch (err) {
      console.error("Failed to fetch transfers", err);
      setDeletedEnrollments([]);
    } finally {
    }
  };

  useEffect(() => {
    fetchDeletedEnrollments();
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, []);
  const handleAddTransferClick = () => {
    setShowModal(true);
  };
  const handleChange = (key, value) => {
    switch (key) {
      case "sourceEnrollment":
        setSourceEnrollment(value);
        break;
      case "destinationEnrollment":
        setDestinationEnrollment(value);
        break;
    }
  };

  const fetchAmountPaid = async () => {
    if (!sourceEnrollment) {
      alert("Please select Group, Enrolled Customer, and Ticket first.");
      return;
    }
    try {
      const res = await api.get("/enroll/get-exact-amount-paid", {
        params: {
          enroll_id: sourceEnrollment,
          ticket: sourceTicket,
        },
      });
      setAmountPaid(res.data.amountPaid || 0);
      setTransferAmount(res.data.amountPaid || 0);
    } catch (error) {
      setAmountPaid(0);
      console.error("Failed to fetch amount paid", error);
      alert("Could not fetch amount paid.");
    }
  };

  const handleTransfer = async () => {
    if (
      !sourceEnrollment ||
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
        fromEnrollId: sourceEnrollment,
        toEnrollId: destinationEnrollment,
        amountPaid,
        transferAmount: parseFloat(transferAmount),
        transferType: "Hard",
      };
      const res = await api.post("/enroll/hard-transfer-customer", payload);
      if (res.status === 200 || res.status === 201) {
        const transfer = res.data;
        const formatted = {
          _id: transfer._id,
          id: transferData.length + 1,
          transfer_id: `TRAN-${transferData.length + 1}`,
          from_enrollment:sourceEnrollment,
          to_enrollment:destinationEnrollment,
          transfer_amount: parseFloat(transferAmount),
          amount_paid: amountPaid,
          transfer_type: "Hard",
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
            <h1 className="text-2xl font-semibold">Hard Transfer</h1>
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
              exportedPdfName="Hard Amount Transfer"
              exportedFileName="Hard Amount Transfer.csv"
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
        title="Add Hard Transfer"
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
                label={
                  <span className="font-medium">From Customer | Group </span>
                }
              >
                <Select
                  size="large"
                  placeholder="Select Customer | Group | Ticket"
                  onChange={(value) => handleChange("sourceEnrollment", value)}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ fontSize: "16px", height: "52px" }}
                >
                  {deletedEnrollments
                    .filter((e) => e.customer_phone && e.group_name)
                    .map((e) => (
                      <Select.Option
                        className={`${
                          e.deleted ? "text-red-500" : "text-black"
                        }`}
                        key={e?.enroll_id}
                        value={`${e?.enroll_id}`}
                      >
                        {`${e.customer_name} | ${e.customer_phone} | ${e.customer_id} | ${e.group_name} | Ticket: ${e.ticket}`}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <span className="font-medium">
                    To Customer | Group | Ticket
                  </span>
                }
              >
                <Select
                  size="large"
                  placeholder="Select Customer | Group | Ticket"
                  onChange={(value) =>
                    handleChange("destinationEnrollment", value)
                  }
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ fontSize: "16px", height: "52px" }}
                >
                  {deletedEnrollments
                    .filter((e) => e.customer_phone && e.group_name)
                    .map((e) => (
                      <Select.Option
                        className={`${
                          e.deleted ? "text-red-500" : "text-black"
                        }`}
                        key={e?.enroll_id}
                        value={`${e?.enroll_id}`}
                      >
                        {`${e.customer_name} | ${e.customer_phone} | ${e.customer_id} | ${e.group_name} | Ticket: ${e.ticket}`}
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
                  placeholder="Transfer Amount"
                  value={transferAmount || 0}
                  onChange={(e) =>
                    handleChange("transfer_amount", e.target.value)
                  }
                  style={{ fontSize: "16px", height: "52px" }}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default HardTransfer;
