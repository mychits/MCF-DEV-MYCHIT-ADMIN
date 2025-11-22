import React, { useEffect, useState } from "react";
import Navbar from "../components/layouts/Navbar";
import Sidebar from "../components/layouts/Sidebar";
import API from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import {
  DatePicker,
  Select,
  Dropdown,
  Drawer,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  Button,
  message,
  Typography,
  Card,
} from "antd";
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
import { IoMdMore } from "react-icons/io";
import { Link, useSearchParams } from "react-router-dom";
import {
  LoadingOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
  SafetyOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import dayjs from "dayjs";

const SuspensePayments = () => {
  const [paymentsData, setPaymentsData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [startDate, setStartDate] = useState(
    searchParams.get("start_date") || ""
  );
  const [endDate, setEndDate] = useState(searchParams.get("end_date") || "");
  const [group, setGroup] = useState(searchParams.get("group_id"));

  // States for update modal
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);
  const [updateForm] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);

  // States for delete modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [paymentIdToDelete, setPaymentIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Watch the pay_type value to conditionally render fields
  const payType = Form.useWatch("pay_type", updateForm);

  const handleViewModalOpen = () => {
    setOpen(true);
  };

  const handleUpdateModalOpen = async (paymentId) => {
    setCurrentPaymentId(paymentId);
    setUpdateModalVisible(true);
    try {
      setUpdateLoading(true);
      const response = await API.get(`/payment/${paymentId}`);
      const payment = response.data.data;

      updateForm.setFieldsValue({
        pay_date: payment.pay_date ? dayjs(payment.pay_date) : null,
        amount: payment.amount,
        pay_type: payment.pay_type,
        account_type: payment.account_type,
        transaction_id: payment.transaction_id,
        pay_for: payment.pay_for,
        cheque_number: payment.cheque_number,
        cheque_date: payment.cheque_date ? dayjs(payment.cheque_date) : null,
        cheque_bank_name: payment.cheque_bank_name,
        cheque_bank_branch: payment.cheque_bank_branch,
      });
    } catch (error) {
      message.error("Failed to fetch payment details");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdatePayment = async (values) => {
    try {
      setUpdateLoading(true);
      let formattedValues = {
        ...values,
        pay_date: values.pay_date ? values.pay_date.format("YYYY-MM-DD") : null,
        cheque_date: values.cheque_date ? values.cheque_date.format("YYYY-MM-DD") : null,
      };

      // Explicitly set fields to null based on payment type before sending to backend
      if (formattedValues.pay_type === "cash") {
        formattedValues.transaction_id = null;
        formattedValues.cheque_number = null;
        formattedValues.cheque_date = null;
        formattedValues.cheque_bank_name = null;
        formattedValues.cheque_bank_branch = null;
      } else if (formattedValues.pay_type === "online") {
        formattedValues.cheque_number = null;
        formattedValues.cheque_date = null;
        formattedValues.cheque_bank_name = null;
        formattedValues.cheque_bank_branch = null;
      } else if (formattedValues.pay_type === "cheque") {
        formattedValues.transaction_id = null;
      }
      
      await API.put(`/payment/${currentPaymentId}`, formattedValues);
      message.success("Payment updated successfully");
      setUpdateModalVisible(false);
      updateForm.resetFields();
      getPayments();
    } catch (error) {
      message.error("Failed to update payment");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateModalCancel = () => {
    setUpdateModalVisible(false);
    updateForm.resetFields();
  };

  // Function to show delete confirmation modal
  const handleDeleteModalOpen = (paymentId) => {
    setPaymentIdToDelete(paymentId);
    setDeleteModalVisible(true);
  };

  // Function to handle the actual deletion
  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await API.delete(`/delete/${paymentIdToDelete}`);
      message.success("Payment deleted successfully!");
      setDeleteModalVisible(false);
      setPaymentIdToDelete(null);
      getPayments(); // Refresh the list
    } catch (error) {
      message.error("Failed to delete payment");
    } finally {
      setDeleteLoading(false);
    }
  };

  // This function will be called whenever any form value changes
  const handleFormValuesChange = (changedValues) => {
    // Check if the pay_type field was changed
    if (changedValues.pay_type) {
      const newPayType = changedValues.pay_type;
      let fieldsToClear = {};

      // Clear fields based on the new payment type
      if (newPayType === "cash") {
        fieldsToClear = {
          transaction_id: null,
          cheque_number: null,
          cheque_date: null,
          cheque_bank_name: null,
          cheque_bank_branch: null,
        };
      } else if (newPayType === "online") {
        fieldsToClear = {
          cheque_number: null,
          cheque_date: null,
          cheque_bank_name: null,
          cheque_bank_branch: null,
        };
      } else if (newPayType === "cheque") {
        fieldsToClear = {
          transaction_id: null,
        };
      }

      // Update the form with the cleared fields
      updateForm.setFieldsValue(fieldsToClear);
    }
  };

  const dropDownItems = (paymentID) => {
    const dropDownItemList = [
      {
        key: "1",
        label: (
          <Link to={`/print/${paymentID}`} className="text-blue-600">
            Print
          </Link>
        ),
      },
      {
        key: "2",
        label: (
          <div
            className="text-green-600"
            onClick={() => handleUpdateModalOpen(paymentID)}
          >
            Update
          </div>
        ),
      },
      {
        key: "3",
        label: (
          <div
            className="text-red-600"
            onClick={() => handleDeleteModalOpen(paymentID)}
          >
            Delete
          </div>
        ),
      },
    ];

    return dropDownItemList;
  };

  async function getPayments() {
    try {
      setLoading(true);
      const payments = await API.get(
        `/payment/suspense?group_id=${group}&start_date=${startDate}&end_date=${endDate}`
      );
      const responseData = payments?.data?.data.map((payment, index) => ({
        key: payment?._id,
        payment_id: payment._id,
        slNo: index + 1,
        customerName: payment?.user_id?.full_name,
        customerId: payment?.user_id?.customer_id,
        customerPhone: payment?.user_id?.phone_number,
        adminType: payment?.admin_type?.admin_name,
        groupName: payment?.group_id?.group_name,
        ticket: payment?.ticket,
        receiptNo: payment.receipt_no,
        amount: payment.amount,
        payType: payment.pay_type,
        payDate: payment.pay_date,
        transactionDate: payment.createdAt.split("T")[0],
        action: (
          <div className="flex justify-center gap-2">
            <Dropdown
              key={payment?._id}
              trigger={["click"]}
              menu={{ items: dropDownItems(payment?._id) }}
              placement="bottomLeft"
            >
              <IoMdMore className="text-bold cursor-pointer text-xl hover:text-gray-600" />
            </Dropdown>
          </div>
        ),
      }));
      setPaymentsData(responseData);
    } catch (error) {
      setPaymentsData([]);
    } finally {
      setLoading(false);
    }
  }

  async function getGroups() {
    try {
      const response = await API.get("/group/get-group-admin");
      const filteredGroups = response?.data?.map((group) => ({
        value: group?._id,
        label: group?.group_name,
      }));
      setGroups(filteredGroups);
    } catch (error) {
      setGroups([]);
    }
  }

  useEffect(() => {
    getPayments();
  }, [group, startDate, endDate]);

  useEffect(() => {
    getGroups();
  }, []);

  const handleRangeChange = (dates, dateStrings) => {
    if (dates) {
      setStartDate(dateStrings[0]);
      setEndDate(dateStrings[1]);
      setSearchParams({
        ...Object.fromEntries(searchParams),
        start_date: dateStrings[0],
        end_date: dateStrings[1],
      });
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const columns = [
    { key: "slNo", header: "Sl No" },
    { key: "transactionDate", header: "Transaction Date" },
    { key: "payDate", header: "Pay Date" },
    { key: "customerName", header: "Customer Name" },
    { key: "customerId", header: "Customer Id" },
    { key: "customerPhone", header: "Customer Phone" },
    { key: "groupName", header: "Group Name" },
    { key: "ticket", header: "Ticket" },
    { key: "amount", header: "Amount" },
    { key: "payType", header: "Pay Type" },
    { key: "receiptNo", header: "Receipt No" },
    { key: "adminType", header: "Admin Type" },
    { key: "action", header: "Actions" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar visibility={true} />
      <Sidebar />
      <main className="flex-1 p-6 mt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Suspense Payments
          </h1>
          <p className="text-gray-600">
            Manage and track suspense payment records
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Filters</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <RangePicker
                onChange={handleRangeChange}
                className="w-64"
                size="large"
                placeholder={["Start Date", "End Date"]}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Group
              </label>
              <Select
                showSearch
                size="large"
                style={{ width: 240 }}
                placeholder="Select a group"
                optionFilterProp="label"
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? "")
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? "").toLowerCase())
                }
                value={group}
                options={groups}
                onChange={(value) => {
                  setSearchParams({
                    ...Object.fromEntries(searchParams),
                    group_id: value,
                  });
                  setGroup(value);
                }}
                allowClear
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Payment Records
            </h2>
            <div className="text-sm text-gray-600">
              Total Records:{" "}
              <span className="font-semibold">{paymentsData.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="w-full h-64 flex justify-center items-center">
              <Spin indicator={<LoadingOutlined spin />} size="large" />
            </div>
          ) : paymentsData.length > 0 ? (
            <DataTable columns={columns} data={paymentsData} />
          ) : (
            <Empty description="No Payment Records Found" />
          )}
        </div>
      </main>

      {/* View Drawer (placeholder) */}
      <Drawer
        title="Payment Details"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={500}
      >
        <p>Some contents for viewing payment details...</p>
      </Drawer>

      {/* Enhanced Professional Update Modal */}
      <Modal
        open={updateModalVisible}
        onCancel={handleUpdateModalCancel}
        footer={null}
        width={900}
        destroyOnClose
        centered
        className="professional-modal"
        styles={{
          body: { padding: 0 },
          header: { display: "none" },
        }}
      >
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
          {/* Modal Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCardOutlined className="text-white text-2xl" />
              </div>
              <div>
                <Title level={3} className="!mb-0 !text-gray-800">
                  Update Payment Details
                </Title>
                <Text className="text-gray-500 text-sm">
                  Modify payment information and transaction details
                </Text>
              </div>
            </div>
          </div>

          <Spin spinning={updateLoading} size="large">
            <Form
              form={updateForm}
              layout="vertical"
              onFinish={handleUpdatePayment}
              className="space-y-6"
              onValuesChange={handleFormValuesChange}
            >
              {/* Payment Information Section */}
              <Card
                className="shadow-sm border-0"
                styles={{ body: { padding: "24px" } }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Title level={5} className="!mb-0 !text-gray-700">
                    Payment Information
                  </Title>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    label={
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <CalendarOutlined className="text-gray-400" />
                        Payment Date
                      </span>
                    }
                    name="pay_date"
                    rules={[
                      { required: true, message: "Please select the payment date" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%", height: "46px" }}
                      format="YYYY-MM-DD"
                      placeholder="Select payment date"
                      className="rounded-lg hover:border-blue-400 focus:border-blue-500"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <RiMoneyRupeeCircleFill className="text-gray-400" />
                        Amount
                      </span>
                    }
                    name="amount"
                    rules={[
                      { required: true, message: "Please input the amount" },
                      {
                        pattern: /^\d+(\.\d{1,2})?$/,
                        message: "Please enter a valid amount",
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      prefix="₹"
                      placeholder="0.00"
                      className="rounded-lg h-[46px] hover:border-blue-400 focus:border-blue-500"
                      style={{ fontSize: "15px" }}
                    />
                  </Form.Item>
                </div>
              </Card>

              {/* Payment Method Section */}
              <Card
                className="shadow-sm border-0"
                styles={{ body: { padding: "24px" } }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Title level={5} className="!mb-0 !text-gray-700">
                    Payment Method
                  </Title>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    label={
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <CreditCardOutlined className="text-gray-400" />
                        Payment Type
                      </span>
                    }
                    name="pay_type"
                    rules={[
                      { required: true, message: "Please select a payment type" },
                    ]}
                  >
                    <Select
                      placeholder="Select payment method"
                      size="large"
                      className="professional-select"
                      suffixIcon={<CreditCardOutlined className="text-gray-400" />}
                    >
                      <Select.Option value="cash">
                        <div className="flex items-center gap-2">
                          <RiMoneyRupeeCircleFill className="text-green-600" />
                          <span>Cash Payment</span>
                        </div>
                      </Select.Option>
                      <Select.Option value="cheque">
                        <div className="flex items-center gap-2">
                          <FileTextOutlined className="text-blue-600" />
                          <span>Cheque Payment</span>
                        </div>
                      </Select.Option>
                      <Select.Option value="online">
                        <div className="flex items-center gap-2">
                          <BankOutlined className="text-purple-600" />
                          <span>Online Transfer</span>
                        </div>
                      </Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <BankOutlined className="text-gray-400" />
                        Account Type
                      </span>
                    }
                    name="account_type"
                    rules={[
                      { required: true, message: "Please select an account type" },
                    ]}
                  >
                    <Select
                      placeholder="Select account type"
                      size="large"
                      className="professional-select"
                      suffixIcon={<BankOutlined className="text-gray-400" />}
                    >
                      <Select.Option value="Suspense">Suspense</Select.Option>
                      <Select.Option value="Other">Other</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              </Card>

              {/* Conditional Payment Details */}
              {payType === "online" && (
                <Card
                  className="shadow-sm border-0 bg-gradient-to-br from-purple-50 to-blue-50"
                  styles={{ body: { padding: "24px" } }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Title level={5} className="!mb-0 !text-gray-700">
                      Online Transaction Details
                    </Title>
                  </div>

                  <Form.Item
                    label={
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Transaction ID
                      </span>
                    }
                    name="transaction_id"
                    rules={[
                      { required: true, message: "Please input the transaction ID" },
                    ]}
                  >
                    <Input
                      placeholder="Enter transaction reference number"
                      className="rounded-lg h-[46px] hover:border-purple-400 focus:border-purple-500"
                      prefix={<SafetyOutlined className="text-gray-400" />}
                    />
                  </Form.Item>
                </Card>
              )}

              {payType === "cheque" && (
                <Card
                  className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-indigo-50"
                  styles={{ body: { padding: "24px" } }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Title level={5} className="!mb-0 !text-gray-700">
                      Cheque Details
                    </Title>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Form.Item
                      label={
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FileTextOutlined className="text-gray-400" />
                          Cheque Number
                        </span>
                      }
                      name="cheque_number"
                      rules={[
                        { required: true, message: "Please input the cheque number" },
                      ]}
                    >
                      <Input
                        placeholder="Enter cheque number"
                        className="rounded-lg h-[46px] hover:border-blue-400 focus:border-blue-500"
                        prefix={<FileTextOutlined className="text-gray-400" />}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <CalendarOutlined className="text-gray-400" />
                          Cheque Date
                        </span>
                      }
                      name="cheque_date"
                      rules={[
                        { required: true, message: "Please select the cheque date" },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%", height: "46px" }}
                        format="YYYY-MM-DD"
                        placeholder="Select cheque date"
                        className="rounded-lg hover:border-blue-400 focus:border-blue-500"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <BankOutlined className="text-gray-400" />
                          Bank Name
                        </span>
                      }
                      name="cheque_bank_name"
                      rules={[
                        { required: true, message: "Please input the bank name" },
                      ]}
                    >
                      <Input
                        placeholder="Enter bank name"
                        className="rounded-lg h-[46px] hover:border-blue-400 focus:border-blue-500"
                        prefix={<BankOutlined className="text-gray-400" />}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <BankOutlined className="text-gray-400" />
                          Bank Branch
                        </span>
                      }
                      name="cheque_bank_branch"
                      rules={[
                        { required: true, message: "Please input the bank branch" },
                      ]}
                    >
                      <Input
                        placeholder="Enter branch name"
                        className="rounded-lg h-[46px] hover:border-blue-400 focus:border-blue-500"
                        prefix={<BankOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <Button
                  onClick={handleUpdateModalCancel}
                  size="large"
                  className="h-11 px-8 rounded-lg font-medium hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updateLoading}
                  size="large"
                  className="h-11 px-8 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-lg"
                  icon={<SafetyOutlined />}
                >
                  Update Payment
                </Button>
              </div>
            </Form>
          </Spin>
        </div>

        <style jsx global>{`
          .professional-modal .ant-modal-content {
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          }

          .professional-select .ant-select-selector {
            height: 46px !important;
            padding: 8px 16px !important;
            border-radius: 8px !important;
            display: flex !important;
            align-items: center !important;
          }

          .professional-select .ant-select-selection-placeholder,
          .professional-select .ant-select-selection-item {
            line-height: 30px !important;
          }

          .ant-input-affix-wrapper {
            border-radius: 8px;
          }

          .ant-picker {
            border-radius: 8px;
          }

          .ant-card {
            border-radius: 12px;
          }
        `}</style>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationCircleOutlined className="text-red-600 text-xl" />
            </div>
            <span className="text-lg font-semibold">Confirm Deletion</span>
          </div>
        }
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete Payment"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          size: "large",
          className: "h-10 rounded-lg font-medium",
        }}
        cancelButtonProps={{
          size: "large",
          className: "h-10 rounded-lg font-medium",
        }}
        confirmLoading={deleteLoading}
        centered
        width={480}
      >
        <div className="py-4">
          <p className="text-gray-600 text-base mb-3">
            Are you sure you want to delete this payment record?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm font-medium flex items-center gap-2">
              <ExclamationCircleOutlined />
              This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuspensePayments;