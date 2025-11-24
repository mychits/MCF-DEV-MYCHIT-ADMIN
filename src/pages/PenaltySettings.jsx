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
  Divider,
  Tabs,
  Tag,
  Empty,
  Collapse,
  Progress,
  Tooltip,
  Avatar,
  Input,
} from "antd";
import { IoMdSave } from "react-icons/io";
import {
  CalculatorOutlined,
  TeamOutlined,
  EditOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
  DollarOutlined,
  CalendarOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  DollarCircleOutlined,
  WarningOutlined,
  ScheduleOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons";
import CircularLoader from "../components/loaders/CircularLoader";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Search } = Input;

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
  const [activeTab, setActiveTab] = useState("configure");
  const [additionalCharges, setAdditionalCharges] = useState([]);
  const [isAddChargeModalOpen, setIsAddChargeModalOpen] = useState(false);
  const [addChargeForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const isGroupSelected = !!selectedGroup;

  const [vacantChitPenaltyAmount, setVacantChitPenaltyAmount] = useState(0);
  const [vacantChitGraceDays, setVacantChitGraceDays] = useState(0);
  const [vacantChitPenaltyRate, setVacantChitPenaltyRate] = useState(0);


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
      const res = await api.get("/penalty/eligible-groups");
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
    setDaysLateThreshold(0);
    setAdditionalCharges([]);
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
        days_late_threshold: daysLateThreshold,
        installment_amount: installmentAmount,
        group_name: selectedGroup.group_name,
        additional_charges: additionalCharges,
        vacant_chit_penalty_amount: vacantChitPenaltyAmount,
        vacant_chit_grace_days: vacantChitGraceDays,
        vacant_chit_penalty_rate: vacantChitPenaltyRate,

      });

      message.success("Penalty saved successfully");
      fetchPenalties();
      setSelectedGroup(null);
      setPenaltyRate(0);
      setGraceDays(0);
      setPenaltyAmount(0);
      setLatePaymentAmount(0);
      setDaysLateThreshold(0);
      setAdditionalCharges([]);
      setActiveTab("records");
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
      late_payment_amount: row.late_payment_amount || 0, // Handles potentially missing field
      days_late_threshold: row.days_late_threshold || 0, // Handles potentially missing field
      // Correctly fetch and set vacant chit fields, defaulting to 0 if missing
      vacant_chit_penalty_amount: row.vacant_chit_penalty_amount || 0,
      vacant_chit_grace_days: row.vacant_chit_grace_days || 0,
      vacant_chit_penalty_rate: row.vacant_chit_penalty_rate || 0,
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
        days_late_threshold: values.days_late_threshold,
        installment_amount: values.installment_amount,
        group_name: values.group_name,
        vacant_chit_penalty_amount: values.vacant_chit_penalty_amount,
        vacant_chit_grace_days: values.vacant_chit_grace_days,
        vacant_chit_penalty_rate: values.vacant_chit_penalty_rate,
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

  const handleAddCharge = () => {
    addChargeForm.validateFields().then(values => {
      const newCharge = {
        id: Date.now(),
        name: values.charge_name,
        type: values.charge_type,
        amount: values.charge_amount,
        rate: values.charge_rate,
        description: values.charge_description,
      };
      setAdditionalCharges([...additionalCharges, newCharge]);
      addChargeForm.resetFields();
      setIsAddChargeModalOpen(false);
      message.success("Additional charge added successfully");
    });
  };

  const removeAdditionalCharge = (id) => {
    setAdditionalCharges(additionalCharges.filter(charge => charge.id !== id));
    message.success("Charge removed successfully");
  };

  const filteredPenalties = storedPenalties.filter(penalty =>
    penalty.group_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "No.",
      render: (_, __, i) => (
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar style={{
            backgroundColor: '#1890ff',
            marginRight: '12px',
            fontWeight: 'bold'
          }}>
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>{text}</Text>
        </div>
      ),
    },
    {
      title: "Installment Amount",
      dataIndex: "installment_amount",
      align: 'right',
      render: (v) => (
        <div style={{
          background: '#f0f9ff',
          padding: '4px 8px',
          borderRadius: '6px',
          display: 'inline-block'
        }}>
          <Text style={{ fontWeight: '600', fontSize: '14px', color: '#0369a1' }}>
            ₹{Number(v || 0).toLocaleString("en-IN")}
          </Text>
        </div>
      ),
    },
    {
      title: "Penalty Rate",
      dataIndex: "penalty_rate",
      align: 'center',
      render: (v) => (
        <Progress
          percent={v}
          size="small"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          format={() => `${v}%`}
        />
      ),
    },
    {
      title: "Penalty Amount",
      dataIndex: "penalty_amount",
      align: 'right',
      render: (v) => (
        <div style={{
          background: '#fff1f0',
          padding: '4px 8px',
          borderRadius: '6px',
          display: 'inline-block'
        }}>
          <Text style={{ color: '#cf1322', fontWeight: '700', fontSize: '14px' }}>
            ₹{Number(v || 0).toLocaleString("en-IN")}
          </Text>
        </div>
      ),
    },
    {
      title: "Late Fee",
      dataIndex: "late_payment_amount",
      align: 'right',
      render: (v) => (
        <div style={{
          background: '#fff7e6',
          padding: '4px 8px',
          borderRadius: '6px',
          display: 'inline-block'
        }}>
          <Text style={{ color: '#d46b08', fontWeight: '700', fontSize: '14px' }}>
            ₹{Number(v || 0).toLocaleString("en-IN")}
          </Text>
        </div>
      ),
    },
    {
      title: "Days Late Threshold",
      dataIndex: "days_late_threshold",
      align: 'center',
      render: (v) => (
        <Tag color="blue" style={{ fontWeight: '600', fontSize: '13px' }}>
          {v} days
        </Tag>
      ),
    },
    {
      title: "Grace Days",
      dataIndex: "grace_days",
      align: 'center',
      render: (v) => (
        <Tag color="green" style={{ fontWeight: '600', fontSize: '13px' }}>
          {v} days
        </Tag>
      ),
    },
    {
      title: "Actions",
      align: "center",
      width: 100,
      fixed: 'right',
      render: (_, row) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => openEditModal(row)}
          style={{
            borderRadius: '6px',
            fontWeight: '500',
            height: '32px',
            background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
            border: 'none',
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="flex mt-20" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <SettingSidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <div style={{ padding: '24px 32px', marginTop: '10px' }}>
          {/* Header Section */}
          <div style={{
            marginBottom: '24px',
            background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: '40%', background: 'rgba(255, 255, 255, 0.1)', transform: 'skewX(-15deg)' }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  backdropFilter: 'blur(4px)',
                }}>
                  <SettingOutlined style={{ fontSize: '32px', color: '#ffffff' }} />
                </div>
                <div>
                  <Title level={1} style={{ margin: 0, fontWeight: '700', color: '#ffffff', fontSize: '28px' }}>
                    Penalty Settings
                  </Title>
                  <Paragraph style={{ margin: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
                    Configure penalty rates, late fees, and grace periods for Groups
                  </Paragraph>
                </div>
              </div>
            </div>
          </div>

          <Card
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              marginBottom: '24px',
              overflow: 'hidden'
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              style={{ marginBottom: 0 }}
              tabBarStyle={{
                margin: 0,
                padding: '0 24px',
                background: '#ffffff',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              <TabPane
                tab={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <SettingOutlined style={{ marginRight: '8px' }} />
                    Configuration
                  </span>
                }
                key="configure"
              >
                <div style={{ padding: '24px', background: '#fafafa' }}>
                  {/* Stats Cards */}
                  <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={8}>
                      <Card style={{
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        height: '100%',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: '30%', background: 'rgba(255, 255, 255, 0.1)', transform: 'skewX(-15deg)' }}></div>
                        <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
                          <Statistic
                            title={
                              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '500' }}>
                                Total Groups
                              </span>
                            }
                            value={groups.length}
                            prefix={<TeamOutlined style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '24px' }} />}
                            valueStyle={{ color: '#ffffff', fontWeight: '700', fontSize: '28px' }}
                          />
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card style={{
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        height: '100%',
                        boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: '30%', background: 'rgba(255, 255, 255, 0.1)', transform: 'skewX(-15deg)' }}></div>
                        <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
                          <Statistic
                            title={
                              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '500' }}>
                                Active Penalties
                              </span>
                            }
                            value={storedPenalties.length}
                            prefix={<FileTextOutlined style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '24px' }} />}
                            valueStyle={{ color: '#ffffff', fontWeight: '700', fontSize: '28px' }}
                          />
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card style={{
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        height: '100%',
                        boxShadow: '0 4px 12px rgba(250, 112, 154, 0.3)',
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: '30%', background: 'rgba(255, 255, 255, 0.1)', transform: 'skewX(-15deg)' }}></div>
                        <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
                          <Statistic
                            title={
                              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '500' }}>
                                Avg. Late Fee
                              </span>
                            }
                            prefix="₹"
                            value={storedPenalties.length > 0
                              ? (storedPenalties.reduce((acc, p) => acc + (p.late_payment_amount || 0), 0) / storedPenalties.length).toFixed(2)
                              : 0}
                            valueStyle={{ color: '#ffffff', fontWeight: '700', fontSize: '28px' }}
                          />
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  {/* Group Selection */}
                  <Card style={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    marginBottom: '24px',
                    background: '#ffffff',
                  }}>
                    <div style={{ padding: '20px 24px' }}>
                      <Title level={4} style={{
                        marginTop: 0,
                        marginBottom: '24px',
                        color: '#1e293b',
                        fontWeight: '600',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Select Group
                      </Title>
                      <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12} md={8}>
                          <div style={{ marginBottom: '8px' }}>
                            <Text strong style={{ color: '#475569', fontSize: '14px' }}>
                              Group Name
                            </Text>
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
                          >
                            {groups.map((g) => (
                              <Select.Option key={g._id} value={g._id}>
                                {g.group_name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Col>

                        {selectedGroup && (
                          <Col xs={24}>
                            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>

                              {/* Monthly */}
                              <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: '6px' }}>
                                  <Text strong style={{ color: '#475569', fontSize: '14px' }}>
                                    Monthly
                                  </Text>
                                </div>
                                <div
                                  style={{
                                    padding: '12px 16px',
                                    background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
                                    border: '1px solid #bae6fd',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    color: '#0369a1'
                                  }}
                                >
                                  ₹{Number(selectedGroup.monthly_installment || 0).toLocaleString('en-IN')}
                                </div>
                              </div>

                              {/* Weekly */}
                              <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: '6px' }}>
                                  <Text strong style={{ color: '#475569', fontSize: '14px' }}>
                                    Weekly
                                  </Text>
                                </div>
                                <div
                                  style={{
                                    padding: '12px 16px',
                                    background: 'linear-gradient(to right, #fef9c3, #fef3c7)',
                                    border: '1px solid #fde68a',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    color: '#ca8a04'
                                  }}
                                >
                                  ₹{Number(selectedGroup.weekly_installment || 0).toLocaleString('en-IN')}
                                </div>
                              </div>

                              {/* Daily */}
                              <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: '6px' }}>
                                  <Text strong style={{ color: '#475569', fontSize: '14px' }}>
                                    Daily
                                  </Text>
                                </div>
                                <div
                                  style={{
                                    padding: '12px 16px',
                                    background: 'linear-gradient(to right, #fef2f2, #fee2e2)',
                                    border: '1px solid #fecaca',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    color: '#b91c1c'
                                  }}
                                >
                                  ₹{Number(selectedGroup.daily_installment || 0).toLocaleString('en-IN')}
                                </div>
                              </div>

                            </div>
                          </Col>
                        )}


                      </Row>
                    </div>
                  </Card>

                  {isGroupSelected && (
                    <>
                      {/* Late Charges Section */}
                      <Card style={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        marginBottom: '24px',
                        background: '#ffffff',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          background: 'linear-gradient(to right, #fff7e6, #fff2cc)',
                          padding: '16px 24px',
                          borderBottom: '1px solid #ffd591'
                        }}>
                          <Title level={4} style={{
                            margin: 0,
                            color: '#d46b08',
                            fontWeight: '600',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <ThunderboltOutlined style={{ marginRight: '8px' }} />
                            Late Charges
                          </Title>
                        </div>
                        <div style={{ padding: '24px' }}>
                          <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                              <div style={{ marginBottom: '8px' }}>
                                <Text strong style={{ color: '#475569', fontSize: '14px' }}>
                                  Days Late Threshold
                                </Text>
                                <Text type="danger"> *</Text>
                              </div>
                              <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                value={daysLateThreshold}
                                onChange={setDaysLateThreshold}
                                size="large"
                                placeholder="Enter threshold days"
                              />
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                              <div style={{ marginBottom: '8px' }}>
                                <Text strong style={{ color: '#475569', fontSize: '14px' }}>
                                  Late Fee Amount (₹)
                                </Text>
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
                              />
                            </Col>
                          </Row>
                        </div>
                      </Card>

                      {/* Overdue Charges Section */}
                      <Card style={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        marginBottom: '24px',
                        background: '#ffffff',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          background: 'linear-gradient(to right, #fff1f0, #ffccc7)',
                          padding: '16px 24px',
                          borderBottom: '1px solid #ffa39e'
                        }}>
                          <Title level={4} style={{
                            margin: 0,
                            color: '#cf1322',
                            fontWeight: '600',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <ClockCircleOutlined style={{ marginRight: '8px' }} />
                            Overdue Charges
                          </Title>
                        </div>
                        <div style={{ padding: '24px' }}>
                          <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                              <div style={{ marginBottom: '8px' }}>
                                <Text strong style={{ color: '#475569', fontSize: '14px' }}>
                                  Grace Days
                                </Text>
                                <Text type="danger"> *</Text>
                              </div>
                              <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                value={graceDays}
                                onChange={setGraceDays}
                                size="large"
                                placeholder="Enter days"
                              />
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                              <div style={{ marginBottom: '8px' }}>
                                <Text strong style={{ color: '#475569', fontSize: '14px' }}>
                                  Penalty Rate (%)
                                </Text>
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
                              />
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                              <div style={{ marginBottom: '8px' }}>
                                <Text strong style={{ color: '#475569', fontSize: '14px' }}>
                                  Penalty Amount
                                </Text>
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
                              />
                            </Col>
                          </Row>
                        </div>
                      </Card>

                      {/* Vacant Chit Penalties Section */}
                      <Card
                        style={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                          marginBottom: '24px',
                          background: '#ffffff',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            background: 'linear-gradient(to right, #ffe7cc, #ffd8a8)',
                            padding: '16px 24px',
                            borderBottom: '1px solid #ffc078',
                          }}
                        >
                          <Title
                            level={4}
                            style={{
                              margin: 0,
                              color: '#d9480f',
                              fontWeight: '600',
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <WarningOutlined style={{ marginRight: '8px' }} />
                            Overdue Charges for Vacant Chit
                          </Title>
                        </div>

                        <div style={{ padding: '24px' }}>
                          <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                              <Text strong>Vacant Chit Grace Days</Text>
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                value={vacantChitGraceDays}
                                onChange={setVacantChitGraceDays}
                                size="large"
                              />
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                              <Text strong>Vacant Chit Penalty Amount (₹)</Text>
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                value={vacantChitPenaltyAmount}
                                onChange={setVacantChitPenaltyAmount}
                                size="large"
                              />
                            </Col>



                            <Col xs={24} sm={12} md={8}>
                              <Text strong>Vacant Chit Penalty Rate (%)</Text>
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                max={100}
                                value={vacantChitPenaltyRate}
                                onChange={setVacantChitPenaltyRate}
                                size="large"
                              />
                            </Col>
                          </Row>
                        </div>
                      </Card>

                      {/* Save Button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                        <Button
                          type="primary"
                          icon={<IoMdSave />}
                          loading={saving}
                          onClick={handleSave}
                          size="large"
                          style={{
                            fontWeight: '600',
                            borderRadius: '8px',
                            background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)',
                            height: '48px',
                            paddingLeft: '24px',
                            paddingRight: '24px',
                          }}
                        >
                          Save Settings
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </TabPane>
              <TabPane
                tab={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <FileTextOutlined style={{ marginRight: '8px' }} />
                    Records
                  </span>
                }
                key="records"
              >
                <div style={{ padding: '24px', background: '#fafafa' }}>
                  <Card style={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    background: '#ffffff',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      padding: '16px 24px',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <Title level={4} style={{
                        margin: 0,
                        color: '#1e293b',
                        fontWeight: '600',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <FileTextOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Penalty Records
                      </Title>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Search
                          placeholder="Search by group name"
                          allowClear
                          enterButton
                          size="middle"
                          style={{ width: 250, marginRight: 16 }}
                          onSearch={setSearchText}
                          onChange={e => setSearchText(e.target.value)}
                        />
                        <span style={{
                          background: 'linear-gradient(to right, #e6f7ff, #bae7ff)',
                          color: '#1890ff',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '13px',
                          fontWeight: '600',
                        }}>
                          {filteredPenalties.length} records
                        </span>
                      </div>
                    </div>
                    {loading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                        <CircularLoader />
                      </div>
                    ) : (
                      <Table
                        dataSource={filteredPenalties.map((p, i) => ({
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
                </div>
              </TabPane>
            </Tabs>
          </Card>

          {/* Edit Modal */}
          <Modal
            title={
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                margin: '-24px -24px 20px -24px',
                padding: '20px 24px',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
              }}>
                <EditOutlined style={{ fontSize: '20px', color: '#ffffff' }} />
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
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
                  background: 'linear-gradient(to right, #36d1dc, #5b86e5)',
                  border: 'none',
                  color: '#ffffff',
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
                  background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                  border: 'none',
                }}
              >
                Update
              </Button>,
            ]}
          >
            <Form form={modalForm} layout="vertical" style={{ marginTop: '20px' }}>
              <Form.Item label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Group Name</Text>} name="group_name">
                <Input style={{ width: "100%" }} disabled />
              </Form.Item>

              <Form.Item label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Installment Amount (₹)</Text>} name="installment_amount">
                <InputNumber
                  style={{ width: "100%" }}
                  disabled
                  formatter={value => `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>

              <Form.Item
                label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Grace Period (Days)</Text>}
                name="grace_days"
                rules={[{ required: true, message: 'Please enter grace days' }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                />
              </Form.Item>

              <Form.Item
                label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Days Late Threshold (Days)</Text>}
                name="days_late_threshold"
                rules={[{ required: true, message: 'Please enter days late threshold' }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                />
              </Form.Item>

              <Form.Item
                label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Penalty Rate (%)</Text>}
                name="penalty_rate"
                rules={[{ required: true, message: 'Please enter penalty rate' }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={100}
                />
              </Form.Item>

              <Form.Item label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Penalty Amount (₹)</Text>} name="penalty_amount">
                <InputNumber
                  style={{ width: "100%" }}
                  disabled
                  formatter={value => `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>

              <Form.Item
                label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Late Fee Amount (₹)</Text>}
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
              <Form.Item
                label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Vacant Chit Penalty Amount (₹)</Text>}
                name="vacant_chit_penalty_amount"
                rules={[{ required: true, message: 'Please enter penalty amount' }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={value => `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\₹\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item
                label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Vacant Chit Grace Days</Text>}
                name="vacant_chit_grace_days"
                rules={[{ required: true, message: 'Please enter grace days' }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>

              <Form.Item
                label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Vacant Chit Penalty Rate (%)</Text>}
                name="vacant_chit_penalty_rate"
                rules={[{ required: true, message: 'Please enter penalty rate' }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} max={100} />
              </Form.Item>

              <Form.Item name="group_id" hidden>
                <InputNumber />
              </Form.Item>
            </Form>
          </Modal>

          {/* Add Charge Modal */}
          <Modal
            title={
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                margin: '-24px -24px 20px -24px',
                padding: '20px 24px',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
              }}>
                <PlusOutlined style={{ fontSize: '20px', color: '#ffffff' }} />
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
                  Add Additional Charge
                </span>
              </div>
            }
            open={isAddChargeModalOpen}
            onCancel={() => {
              setIsAddChargeModalOpen(false);
              addChargeForm.resetFields();
            }}
            width={600}
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setIsAddChargeModalOpen(false);
                  addChargeForm.resetFields();
                }}
                style={{
                  borderRadius: '6px',
                  fontWeight: '500',
                  height: '36px',
                }}
              >
                Cancel
              </Button>,
              <Button
                key="save"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleAddCharge}
                style={{
                  borderRadius: '6px',
                  fontWeight: '600',
                  height: '36px',
                  background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                  border: 'none',
                }}
              >
                Add Charge
              </Button>,
            ]}
          >
            <Form form={addChargeForm} layout="vertical" style={{ marginTop: '20px' }}>
              <Form.Item
                label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Charge Name</Text>}
                name="charge_name"
                rules={[{ required: true, message: 'Please enter charge name' }]}
              >
                <Input style={{ width: "100%" }} placeholder="e.g., Processing Fee" />
              </Form.Item>

              <Form.Item
                label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Charge Type</Text>}
                name="charge_type"
                rules={[{ required: true, message: 'Please select charge type' }]}
                initialValue="fixed"
              >
                <Select style={{ width: "100%" }}>
                  <Select.Option value="fixed">Fixed Amount</Select.Option>
                  <Select.Option value="percentage">Percentage</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.charge_type !== currentValues.charge_type}
              >
                {({ getFieldValue }) => {
                  const chargeType = getFieldValue('charge_type');
                  return chargeType === 'fixed' ? (
                    <Form.Item
                      label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Amount (₹)</Text>}
                      name="charge_amount"
                      rules={[{ required: true, message: 'Please enter amount' }]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        formatter={value => `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\₹\s?|(,*)/g, '')}
                        placeholder="Enter amount"
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item
                      label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Rate (%)</Text>}
                      name="charge_rate"
                      rules={[{ required: true, message: 'Please enter rate' }]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        max={100}
                        placeholder="Enter rate"
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>

              <Form.Item
                label={<Text strong style={{ fontSize: '14px', color: '#475569' }}>Description</Text>}
                name="charge_description"
              >
                <Input.TextArea rows={3} placeholder="Enter description (optional)" />
              </Form.Item>
            </Form>
          </Modal>

          <style>{`
            .ant-select-selector {
              border-radius: 8px !important;
              border: 1px solid #d9d9d9 !important;
              transition: all 0.2s ease !important;
            }
            
            .ant-select-selector:hover {
              border-color: #40a9ff !important;
            }
            
            .ant-select-focused .ant-select-selector {
              border-color: #40a9ff !important;
              box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
            }
            
            .ant-input-number {
              border-radius: 8px !important;
              border: 1px solid #d9d9d9 !important;
              transition: all 0.2s ease !important;
            }
            
            .ant-input-number:hover {
              border-color: #40a9ff !important;
            }
            
            .ant-input-number-focused {
              border-color: #40a9ff !important;
              box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
            }
            
            .ant-table {
              border-radius: 8px !important;
            }
            
            .ant-table-thead > tr > th {
              background: #fafafa !important;
              font-weight: 600 !important;
              color: #262626 !important;
              border-bottom: 1px solid #f0f0f0 !important;
              font-size: 14px !important;
              padding: 16px !important;
            }
            
            .ant-table-tbody > tr {
              transition: all 0.2s ease !important;
            }
            
            .ant-table-tbody > tr:hover > td {
              background: #f5f5f5 !important;
            }
            
            .ant-table-tbody > tr > td {
              padding: 16px !important;
              border-bottom: 1px solid #f0f0f0 !important;
            }
            
            .ant-pagination-item {
              border-radius: 6px !important;
            }
            
            .ant-pagination-item-active {
              background: #1890ff !important;
              border-color: #1890ff !important;
              font-weight: 600 !important;
            }
            
            .ant-pagination-item-active a {
              color: white !important;
            }
            
            .ant-btn-primary {
              background: #1890ff !important;
              border-color: #1890ff !important;
              border-radius: 6px !important;
            }
            
            .ant-btn-primary:hover:not(:disabled) {
              background: #40a9ff !important;
              border-color: #40a9ff !important;
            }
            
            .ant-btn {
              border-radius: 6px !important;
              transition: all 0.2s ease !important;
            }
            
            .ant-modal-header {
              border-bottom: none !important;
              padding: 0 !important;
            }
            
            .ant-modal-body {
              padding: 24px !important;
            }
            
            .ant-modal-footer {
              border-top: 1px solid #f0f0f0 !important;
              padding: 16px 24px !important;
            }
            
            .ant-card {
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
            }
            
            .ant-statistic-title {
              margin-bottom: 8px !important;
            }
            
            .ant-form-item-label > label {
              font-size: 14px !important;
              color: #262626 !important;
              font-weight: 500 !important;
            }
            
            .ant-tabs-tab {
              padding: 12px 16px !important;
              margin: 0 !important;
            }
            
            .ant-tabs-tab-active {
              color: #1890ff !important;
            }
            
            .ant-tabs-ink-bar {
              background: #1890ff !important;
            }
            
            .ant-collapse-header {
              padding: 12px 16px !important;
            }
            
            .ant-collapse-content-box {
              padding: 16px !important;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default PenaltySettings;