// PenaltySettings.jsx
import { useEffect, useState } from "react";
import SettingSidebar from "../components/layouts/SettingSidebar";
import Navbar from "../components/layouts/Navbar";
import api from "../instance/TokenInstance";
import {
  Select,
  InputNumber,
  Button,
  message,
  Card,
  Row,
  Col,
  Table,
  Modal,
  Form,
  Space,
  Typography,
  Statistic,
  // Removed Switch as 'useMultiple' is gone
} from "antd";
import { IoMdSave } from "react-icons/io";
import {
  CalculatorOutlined,
  // Removed unused icons
  TeamOutlined,
  EditOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import CircularLoader from "../components/loaders/CircularLoader";

const { Title, Text } = Typography;

const PenaltySettings = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [penaltyRate, setPenaltyRate] = useState(0);
  const [graceDays, setGraceDays] = useState(0);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [latePaymentAmount, setLatePaymentAmount] = useState(0); 
  const [daysLateThreshold, setDaysLateThreshold] = useState(0); 
  const [saving, setSaving] = useState(false);
  const [storedPenalties, setStoredPenalties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm] = Form.useForm();
  const isGroupSelected = !!selectedGroup;


  useEffect(() => {
    if (selectedGroup && penaltyRate >= 0) {
      const installment = getInstallmentAmount(selectedGroup);
      const penalty = parseFloat(((installment * penaltyRate) / 100).toFixed(2));
      setPenaltyAmount(penalty);
    } else {
      setPenaltyAmount(0);
    }
  }, [penaltyRate, selectedGroup]);

  useEffect(() => {
    fetchGroups();
    fetchPenalties();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get("/group/get-group-admin");
      setGroups(res.data || []);
    } catch (err) {
      message.error("Failed to load groups");
    }
  };

  const fetchPenalties = async () => {
    try {
      setLoading(true);
      const res = await api.get("/penalty/penalty-settings");
      const penalties = (res.data || []).map((p) => {
        const group = groups.find((g) => g._id === p.group_id);
        return {
          ...p,
          group_name: group?.group_name || p.group_name || "N/A",
          installment_amount: group
            ? group.monthly_installment ||
            group.group_installment ||
            group.group_install ||
            group.weekly_installment ||
            group.daily_installment ||
            0
            : p.installment_amount || 0,
        };
      });
      setStoredPenalties(penalties);
    } catch (err) {
      message.error("Failed to load penalty settings");
    } finally {
      setLoading(false);
    }
  };

  const getInstallmentAmount = (group) => {
    if (!group) return 0;
    return (
      group.monthly_installment ||
      group.group_installment ||
      group.group_install ||
      group.weekly_installment ||
      group.daily_installment ||
      0
    );
  };

  const handleGroupChange = (value) => {
    const group = groups.find((g) => g._id === value);
    setSelectedGroup(group);
    setPenaltyRate(0);
    setGraceDays(0);
    setPenaltyAmount(0);
    setLatePaymentAmount(0);
    setDaysLateThreshold(0); // Reset days late threshold
  };

  const handleSave = async () => {
    if (!selectedGroup) return message.warning("Select a group");

    try {
      setSaving(true);
      const installmentAmount = getInstallmentAmount(selectedGroup);

      await api.post(`/penalty/penalty-settings/${selectedGroup._id}`, {
        penalty_type: "percentage",
        penalty_rate: penaltyRate,
        grace_days: graceDays,
        penalty_amount: penaltyAmount,
        late_payment_amount: latePaymentAmount,
        days_late_threshold: daysLateThreshold, // Send the new threshold
        installment_amount: installmentAmount,
        group_name: selectedGroup.group_name,
      });

      message.success("Penalty saved successfully");
      fetchPenalties();
      setSelectedGroup(null);
      setPenaltyRate(0);
      setGraceDays(0);
      setPenaltyAmount(0);
      setLatePaymentAmount(0);
      setDaysLateThreshold(0); // Reset threshold
    } catch (err) {
      console.error(err);
      message.error("Failed to save penalty");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (row) => {
    modalForm.setFieldsValue({
      group_name: row.group_name,
      installment_amount: row.installment_amount,
      penalty_rate: row.penalty_rate,
      grace_days: row.grace_days,
      penalty_amount: row.penalty_amount,
      late_payment_amount: row.late_payment_amount || 0,
      days_late_threshold: row.days_late_threshold || 0, // Load threshold for edit
      group_id: row.group_id,
    });
    setIsModalOpen(true);
  };

  const handleModalSave = async (values) => {
    try {
      await api.post(`/penalty/penalty-settings/${values.group_id}`, {
        penalty_type: "percentage",
        penalty_rate: values.penalty_rate,
        grace_days: values.grace_days,
        penalty_amount: values.penalty_amount,
        late_payment_amount: values.late_payment_amount,
        days_late_threshold: values.days_late_threshold, // Send the new threshold
        installment_amount: values.installment_amount,
        group_name: values.group_name,
      });
      message.success("Penalty updated successfully");
      setIsModalOpen(false);
      fetchPenalties();
    } catch (err) {
      message.error("Failed to update penalty");
    }
  };

  const handleModalCalculate = () => {
    const values = modalForm.getFieldsValue();
    const penalty = parseFloat(((values.installment_amount * values.penalty_rate) / 100).toFixed(2));
    modalForm.setFieldsValue({ penalty_amount: penalty });
  };

  const columns = [
    {
      title: "No.",
      render: (_, __, i) => (
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#475569',
          fontWeight: '600',
          fontSize: '14px',
        }}>
          {String(i + 1).padStart(2, '0')}
        </div>
      ),
      width: 80,
      align: 'center',
    },
    {
      title: "Group Name",
      dataIndex: "group_name",
      render: (text) => (
        <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>{text}</Text>
      ),
    },
    {
      title: "Installment Amount",
      dataIndex: "installment_amount",
      align: 'right',
      render: (v) => (
        <Text style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
          ₹{Number(v || 0).toLocaleString("en-IN")}
        </Text>
      ),
    },
    {
      title: "Penalty Rate",
      dataIndex: "penalty_rate",
      align: 'center',
      render: (v) => (
        <span style={{
          background: '#fef3c7',
          color: '#92400e',
          padding: '4px 12px',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '13px',
        }}>
          {v}%
        </span>
      ),
    },
    {
      title: "Penalty Amount",
      dataIndex: "penalty_amount",
      align: 'right',
      render: (v) => (
        <Text style={{ color: '#dc2626', fontWeight: '700', fontSize: '14px' }}>
          ₹{Number(v || 0).toLocaleString("en-IN")}
        </Text>
      ),
    },
    {
      title: "Late Fee",
      dataIndex: "late_payment_amount",
      align: 'right',
      render: (v) => (
        <Text style={{ color: '#f97316', fontWeight: '700', fontSize: '14px' }}>
          ₹{Number(v || 0).toLocaleString("en-IN")}
        </Text>
      ),
    },
    {
      title: "Days Late Threshold",
      dataIndex: "days_late_threshold", // Add column for threshold
      align: 'center',
      render: (v) => (
        <span style={{
          background: '#dbeafe',
          color: '#1d4ed8',
          padding: '4px 12px',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '13px',
        }}>
          {v} days
        </span>
      ),
    },
    {
      title: "Grace Days",
      dataIndex: "grace_days",
      align: 'center',
      render: (v) => (
        <span style={{
          background: '#f1f5f9',
          color: '#475569',
          padding: '4px 12px',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '13px',
        }}>
          {v} days
        </span>
      ),
    },
    {
      title: "Actions",
      align: "center",
      width: 100,
      fixed: 'right',
      render: (_, row) => (
        <Button
          type="default"
          icon={<EditOutlined />}
          onClick={() => openEditModal(row)}
          style={{
            borderRadius: '6px',
            fontWeight: '500',
            height: '32px',
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="flex mt-20" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <SettingSidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <div style={{ padding: '32px 40px', marginTop: '10px' }}>

          {/* Header Section */}
          <div style={{
            marginBottom: '32px',
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            border: '1px solid #e2e8f0',
          }}>
            <Title level={2} style={{ margin: 0, fontWeight: '600', color: '#1e293b', fontSize: '28px' }}>
              Penalty Settings
            </Title>
            <Text style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', display: 'block' }}>
              Configure penalty rates, late fees, days late threshold, and grace periods for group installments
            </Text>
          </div>

          {/* Stats Cards */}
          <Row gutter={[20, 20]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} md={8}>
              <Card style={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: 'white',
              }}>
                <Statistic
                  title={<span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>Total Groups</span>}
                  value={groups.length}
                  prefix={<TeamOutlined style={{ color: '#64748b', fontSize: '20px' }} />}
                  valueStyle={{ color: '#1e293b', fontWeight: '600', fontSize: '28px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card style={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: 'white',
              }}>
                <Statistic
                  title={<span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>Active Penalties</span>}
                  value={storedPenalties.length}
                  prefix={<FileTextOutlined style={{ color: '#64748b', fontSize: '20px' }} />}
                  valueStyle={{ color: '#1e293b', fontWeight: '600', fontSize: '28px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card style={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: 'white',
              }}>
                <Statistic
                  title={<span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>Avg. Late Fee</span>}
                  value={storedPenalties.length > 0
                    ? (storedPenalties.reduce((acc, p) => acc + (p.late_payment_amount || 0), 0) / storedPenalties.length).toFixed(2)
                    : 0}
                  suffix="₹"
                  prefix={<ThunderboltOutlined style={{ color: '#64748b', fontSize: '20px' }} />}
                  valueStyle={{ color: '#1e293b', fontWeight: '600', fontSize: '28px' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Simplified Configuration Card */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CalculatorOutlined style={{ fontSize: '20px', color: '#475569' }} />
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Configure Penalty</span>
              </div>
            }
            style={{
              marginBottom: '32px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
            headStyle={{
              borderBottom: '1px solid #e2e8f0',
              fontWeight: 600,
              padding: '20px 24px'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong style={{ color: '#475569', fontSize: '13px' }}>Group Name</Text>
                  <Text type="danger"> *</Text>
                </div>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select a group"
                  loading={!groups.length}
                  onChange={handleGroupChange}
                  value={selectedGroup?._id}
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  disabled={false}
                >
                  {groups.map((g) => (
                    <Select.Option key={g._id} value={g._id}>
                      {g.group_name}
                    </Select.Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong style={{ color: '#475569', fontSize: '13px' }}>Installment Amount</Text>
                </div>
                <InputNumber
                  style={{ width: "100%" }}
                  value={getInstallmentAmount(selectedGroup)}
                  disabled
                  size="large"
                  formatter={value => `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\₹\s?|(,*)/g, '')}
                />
              </Col>

              <Col xs={24} sm={12} lg={4}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong style={{ color: '#475569', fontSize: '13px' }}>Grace Days</Text>
                  <Text type="danger"> *</Text>
                </div>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  value={graceDays}
                  onChange={setGraceDays}
                  size="large"
                  placeholder="Enter days"
                  disabled={!isGroupSelected}
                />
              </Col>

              <Col xs={24} sm={12} lg={4}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong style={{ color: '#475569', fontSize: '13px' }}>Days Late Threshold</Text>
                  <Text type="danger"> *</Text>
                </div>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  value={daysLateThreshold}
                  onChange={setDaysLateThreshold} // Handle threshold change
                  size="large"
                  placeholder="Enter threshold days"
                  disabled={!isGroupSelected}
                />
              </Col>

              <Col xs={24} sm={12} lg={4}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong style={{ color: '#475569', fontSize: '13px' }}>Penalty Rate (%)</Text>
                  <Text type="danger"> *</Text>
                </div>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={100}
                  value={penaltyRate}
                  onChange={(val) => {
                    setPenaltyRate(val || 0);
                    if (selectedGroup) {
                      const amount = getInstallmentAmount(selectedGroup);
                      const penalty = amount > 0 ? parseFloat(((amount * (val || 0)) / 100).toFixed(2)) : 0;
                      setPenaltyAmount(penalty);
                    }
                  }}
                  size="large"
                  placeholder="Enter rate"
                  disabled={!isGroupSelected}
                />
              </Col>

              <Col xs={24} sm={12} lg={4}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong style={{ color: '#475569', fontSize: '13px' }}>Penalty Amount</Text>
                  <Text type="danger"> *</Text>
                </div>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  value={penaltyAmount}
                  onChange={(val) => {
                    setPenaltyAmount(val || 0);
                    if (selectedGroup) {
                      const amount = getInstallmentAmount(selectedGroup);
                      const rate = amount > 0 ? parseFloat(((val || 0) / amount) * 100).toFixed(2) : 0;
                      setPenaltyRate(parseFloat(rate));
                    }
                  }}
                  size="large"
                  formatter={value => `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\₹\s?|(,*)/g, '')}
                  placeholder="Enter amount"
                  disabled={!isGroupSelected}
                />
              </Col>

              <Col xs={24} sm={12} lg={4}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong style={{ color: '#475569', fontSize: '13px' }}>Late Fee Amount (₹)</Text>
                  <Text type="danger"> *</Text>
                </div>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  value={latePaymentAmount}
                  onChange={setLatePaymentAmount}
                  size="large"
                  formatter={value => `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\₹\s?|(,*)/g, '')}
                  placeholder="Enter late fee"
                  disabled={!isGroupSelected}
                />
              </Col>

              <Col xs={24} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Space size="middle">
                  <Button
                    type="primary"
                    icon={<IoMdSave />}
                    loading={saving}
                    onClick={handleSave}
                    size="large"
                    style={{ fontWeight: '600' }}
                    disabled={!isGroupSelected}
                  >
                    Save Settings
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Records Table */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileTextOutlined style={{ fontSize: '20px', color: '#475569' }} />
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Penalty Records</span>
                </div>
                <span style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                }}>
                  {storedPenalties.length} records
                </span>
              </div>
            }
            style={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
            headStyle={{
              borderBottom: '1px solid #e2e8f0',
              fontWeight: 600,
              padding: '20px 24px'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <CircularLoader />
              </div>
            ) : (
              <Table
                dataSource={storedPenalties.map((p, i) => ({
                  ...p,
                  key: p._id || i,
                }))}
                columns={columns}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => (
                    <span style={{ color: '#64748b', fontWeight: '500', fontSize: '13px' }}>
                      Showing {range[0]}-{range[1]} of {total} records
                    </span>
                  ),
                  position: ['bottomCenter'],
                }}
                scroll={{ x: 1000 }}
              />
            )}
          </Card>

          {/* Edit Modal */}
          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <EditOutlined style={{ fontSize: '18px', color: '#475569' }} />
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                  Edit Penalty Configuration
                </span>
              </div>
            }
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            width={600}
            footer={[
              <Button
                key="cancel"
                onClick={() => setIsModalOpen(false)}
                style={{
                  borderRadius: '6px',
                  fontWeight: '500',
                  height: '36px',
                }}
              >
                Cancel
              </Button>,
              <Button
                key="calculate"
                icon={<CalculatorOutlined />}
                onClick={handleModalCalculate}
                style={{
                  borderRadius: '6px',
                  fontWeight: '500',
                  height: '36px',
                }}
              >
                Calculate
              </Button>,
              <Button
                key="save"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  modalForm.validateFields().then((values) => handleModalSave(values));
                }}
                style={{
                  borderRadius: '6px',
                  fontWeight: '600',
                  height: '36px',
                }}
              >
                Update
              </Button>,
            ]}
          >
            <Form form={modalForm} layout="vertical" style={{ marginTop: '20px' }}>
              <Form.Item label={<Text strong style={{ fontSize: '13px', color: '#475569' }}>Group Name</Text>} name="group_name">
                <InputNumber style={{ width: "100%" }} disabled />
              </Form.Item>

              <Form.Item label={<Text strong style={{ fontSize: '13px', color: '#475569' }}>Installment Amount (₹)</Text>} name="installment_amount">
                <InputNumber
                  style={{ width: "100%" }}
                  disabled
                  formatter={value => `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>

              <Form.Item
                label={<Text strong style={{ fontSize: '13px', color: '#475569' }}>Grace Period (Days)</Text>}
                name="grace_days"
                rules={[{ required: true, message: 'Please enter grace days' }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                />
              </Form.Item>

              <Form.Item
                label={<Text strong style={{ fontSize: '13px', color: '#475569' }}>Days Late Threshold (Days)</Text>}
                name="days_late_threshold"
                rules={[{ required: true, message: 'Please enter days late threshold' }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                />
              </Form.Item>

              <Form.Item
                label={<Text strong style={{ fontSize: '13px', color: '#475569' }}>Penalty Rate (%)</Text>}
                name="penalty_rate"
                rules={[{ required: true, message: 'Please enter penalty rate' }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={100}
                />
              </Form.Item>

              <Form.Item label={<Text strong style={{ fontSize: '13px', color: '#475569' }}>Penalty Amount (₹)</Text>} name="penalty_amount">
                <InputNumber
                  style={{ width: "100%" }}
                  disabled
                  formatter={value => `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>

              <Form.Item
                label={<Text strong style={{ fontSize: '13px', color: '#475569' }}>Late Fee Amount (₹)</Text>}
                name="late_payment_amount"
                rules={[{ required: true, message: 'Please enter late fee amount' }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={value => `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\₹\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item name="group_id" hidden>
                <InputNumber />
              </Form.Item>
            </Form>
          </Modal>

          <style>{`
            .ant-select-selector {
              border-radius: 8px !important;
              border: 1px solid #e2e8f0 !important;
              transition: all 0.2s ease !important;
            }
            
            .ant-select-selector:hover {
              border-color: #cbd5e0 !important;
            }
            
            .ant-select-focused .ant-select-selector {
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            }
            
            .ant-input-number {
              border-radius: 8px !important;
              border: 1px solid #e2e8f0 !important;
              transition: all 0.2s ease !important;
            }
            
            .ant-input-number:hover {
              border-color: #cbd5e0 !important;
            }
            
            .ant-input-number-focused {
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            }
            
            .ant-table {
              border-radius: 8px !important;
            }
            
            .ant-table-thead > tr > th {
              background: #f8fafc !important;
              font-weight: 600 !important;
              color: #475569 !important;
              border-bottom: 1px solid #e2e8f0 !important;
              font-size: 13px !important;
              padding: 16px !important;
            }
            
            .ant-table-tbody > tr {
              transition: all 0.2s ease !important;
            }
            
            .ant-table-tbody > tr:hover > td {
              background: #f8fafc !important;
            }
            
            .ant-table-tbody > tr > td {
              padding: 16px !important;
              border-bottom: 1px solid #f1f5f9 !important;
            }
            
            .ant-pagination-item {
              border-radius: 6px !important;
            }
            
            .ant-pagination-item-active {
              background: #3b82f6 !important;
              border-color: #3b82f6 !important;
              font-weight: 600 !important;
            }
            
            .ant-pagination-item-active a {
              color: white !important;
            }
            
            .ant-btn-primary {
              background: #3b82f6 !important;
              border-color: #3b82f6 !important;
              border-radius: 6px !important;
            }
            
            .ant-btn-primary:hover:not(:disabled) {
              background: #2563eb !important;
              border-color: #2563eb !important;
            }
            
            .ant-btn {
              border-radius: 6px !important;
              transition: all 0.2s ease !important;
            }
            
            .ant-modal-header {
              border-bottom: 1px solid #e2e8f0 !important;
              padding: 20px 24px !important;
            }
            
            .ant-modal-body {
              padding: 24px !important;
            }
            
            .ant-modal-footer {
              border-top: 1px solid #e2e8f0 !important;
              padding: 16px 24px !important;
            }
            
            .ant-card {
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
            }
            
            .ant-statistic-title {
              margin-bottom: 8px !important;
            }
            
            .ant-form-item-label > label {
              font-size: 13px !important;
              color: #475569 !important;
              font-weight: 500 !important;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default PenaltySettings;