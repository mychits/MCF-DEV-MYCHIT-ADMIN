/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import DataTable from "../components/layouts/Datatable";
import { Select, Drawer, Tag, Descriptions, Space, Typography } from "antd";
import {
  DollarCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  CreditCardOutlined 
} from "@ant-design/icons";
import api from "../instance/TokenInstance";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";

const { Text, Title } = Typography;

const EmployeeStatement = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [overallSummary, setOverallSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get("/employee");
        const employeeData = response.data?.employee || [];
        setEmployees(employeeData);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setAlertConfig({
          visibility: true,
          message: "Failed to load employees",
          type: "error",
        });
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchLedgerData(selectedEmployee);
    } else {
      setLedgerData([]);
      setTableData([]);
      setOverallSummary(null);
    }
  }, [selectedEmployee]);

  const fetchLedgerData = async (employeeId) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/employee/ledgertest/${employeeId}`);
      const ledger = response.data?.ledger || [];
      const summary = response.data?.overall_summary;

      const formattedData = ledger.map((item, index) => {
        const netPosition = item?.accounting?.balance ?? 0;
        const balanceColor =
          netPosition >= 0 ? "text-green-600" : "text-red-600";

        return {
          id: index + 1,
          month: item?.period?.label,
          netPayable: item?.salary?.net_payable,
          paidAmount: item?.salary?.paid_amount,
          targetAmount: item?.business?.target,
          businessClosed: item?.business?.total_business_closed,
          isTargetAchieved: item?.business?.target_achieved ? "Yes" : "No",
          incentiveEarned: item?.incentive.earned,
          incentivePaid: item?.incentive?.paid,

          salaryStatus: getStatusTag(item?.salary.status),
          incentiveStatus: getStatusTag(item?.incentive.status),

          advanceGiven: item?.advance?.given,

          debit:
            item?.accounting?.debit > 0
              ? item?.accounting?.debit?.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              : "-",

          credit:
            item?.accounting?.credit > 0
              ? item?.accounting?.credit?.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              : "-",

          balance: netPosition !== undefined ? (
  <span className={balanceColor}>
    {netPosition.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}
  </span>
) : "-",
          details: item,
        };
      });

      setTableData(formattedData);
      setLedgerData(ledger);
      setOverallSummary(summary);
    } catch (error) {
      console.error("Error fetching ledger data:", error);
      setAlertConfig({
        visibility: true,
        message: "Failed to load salary ledger",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeSelect = (value) => {
    setSelectedEmployee(value);
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "month", header: "Month" },
    { key: "netPayable", header: "Net Payable" },
    { key: "targetAmount", header: "Target" },
    { key: "businessClosed", header: "Total Business Closed" },
    { key: "paidAmount", header: "Total Paid Amount" },
    { key: "isTargetAchieved", header: "Target Achieved" },
    { key: "incentiveEarned", header: "Incentive" },
    { key: "incentivePaid", header: "Incentive Paid Amount" },
    { key: "advanceGiven", header: "Advance" },
    { key: "salaryStatus", header: "Salary Status" },
    { key: "incentiveStatus", header: "Incentive Status" },

    {
      key: "debit",
      header: "Debit (₹)",
    },
    {
      key: "credit",
      header: "Credit (₹)",
    },
    {
      key: "balance",
      header: "Balance",
      width: 150,
    },
  ];

  const getStatusTag = (status) => {
    switch (status) {
      case "Paid":
        return <Tag color="green">Paid</Tag>;
      case "Processed":
        return <Tag color="blue">Processed</Tag>;
      case "Pending":
      default:
        return <Tag color="orange">Pending</Tag>;
    }
  };

  return (
    <>
      <div>
        <Navbar
          visibility={true}
          onGlobalSearchChangeHandler={(e) => setSearchText(e.target.value)}
        />

        <CustomAlertDialog
          type={alertConfig.type}
          isVisible={alertConfig.visibility}
          message={alertConfig.message}
          onClose={() =>
            setAlertConfig((prev) => ({ ...prev, visibility: false }))
          }
        />

        <div className="flex mt-20">
          <Sidebar />

          <div className="flex-grow p-7">
            <div className="mt-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                <h1 className="text-2xl font-semibold flex items-center">
                  <TeamOutlined className="mr-2 text-blue-600" />
                  Employee Salary Ledger
                </h1>

                <div className="w-full sm:w-auto">
                  <Select
                    showSearch
                    size="large"
                    style={{ width: "100%" }}
                    placeholder="Select an employee"
                    optionFilterProp="children"
                    onChange={handleEmployeeSelect}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={employees.map((emp) => ({
                      value: emp._id,
                      label: `${emp.name} (${emp.phone_number}) ${
                        emp.employeeCode ? `– ${emp.employeeCode}` : ""
                      }`,
                      employee: emp,
                    }))}
                  />
                </div>
              </div>

              {selectedEmployee && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Space>
                    <TeamOutlined className="text-blue-600" />
                    <Text strong>
                      Showing ledger for:{" "}
                      <span className="text-blue-900">
                        {
                          employees.find((e) => e._id === selectedEmployee)
                            ?.name
                        }
                      </span>
                    </Text>
                  </Space>
                </div>
              )}
            </div>

            {selectedEmployee ? (
              <>
                {tableData.length > 0 && !isLoading ? (
                  <DataTable
                    catcher="_id"
                    data={filterOption(tableData, searchText)}
                    columns={columns}
                    exportedPdfName={`Salary_Ledger_${selectedEmployee}`}
                    exportedFileName={`Salary_Ledger_${selectedEmployee}.csv`}
                  />
                ) : (
                  <CircularLoader
                    isLoading={isLoading}
                    failure={tableData.length <= 0 && !isLoading}
                    data={"Salary Ledger Data"}
                  />
                )}

                {overallSummary && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Title level={4} className="flex items-center">
                      <DollarCircleOutlined className="mr-2 text-gray-600" />
                      Summary
                    </Title>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
                        <Text type="secondary" className="text-sm">
                          Total Credits (Outstanding)
                        </Text>
                        <Title
                          level={3}
                          className="text-green-600 mb-0 mt-1 flex items-center">
                          <PlusCircleOutlined className="mr-2" />
                          {overallSummary?.accounting?.total_credit?.toLocaleString(
                            "en-IN",
                            {
                              style: "currency",
                              currency: "INR",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }
                          )}
                        </Title>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
                        <Text type="secondary" className="text-sm">
                          Total Debits (Paid/Advanced)
                        </Text>
                        <Title
                          level={3}
                          className="text-red-600 mb-0 mt-1 flex items-center">
                          <MinusCircleOutlined className="mr-2" />
                          {overallSummary?.accounting?.total_debit?.toLocaleString(
                            "en-IN",
                            {
                              style: "currency",
                              currency: "INR",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }
                          )}
                        </Title>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
                        <Text type="secondary" className="text-sm">
                          Net Position
                        </Text>
                        <Title
                          level={3}
                          className={`mb-0 mt-1 flex items-center ${
                           ( overallSummary?.accounting?.net_position || 0) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}>
                          {(overallSummary?.accounting?.net_position || 0) >= 0 ? (
                            <PlusCircleOutlined className="mr-2" />
                          ) : (
                            <MinusCircleOutlined className="mr-2" />
                          )}
                          {(
                           ( overallSummary?.accounting?.net_position || 0)
                          ).toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </Title>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="border-2 border-dashed rounded-xl p-12 text-center text-gray-500 bg-gray-50">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <TeamOutlined className="text-blue-600 text-3xl" />
                  </div>
                </div>
                <Title level={4} className="text-gray-700">
                  Select an Employee
                </Title>
                <Text className="mt-2 block">
                  Use the dropdown above to choose an employee and view their
                  detailed salary ledger
                </Text>
              </div>
            )}

            <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-sm">
              <Space>
                <MinusCircleOutlined className="text-red-500" />
                <Text>
                  <strong>Debit:</strong> Amount paid/advanced by company |
                  <PlusCircleOutlined className="text-green-500 ml-2 mr-1" />
                  <strong>Credit:</strong> Amount owed by company |
                  <CreditCardOutlined className="ml-2 mr-1" />
                  <strong>Balance:</strong> Net position (Credit - Debit)
                </Text>
              </Space>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const filterOption = (data, searchText) => {
  if (!searchText) return data;

  return data.filter((item) =>
    Object.values(item).some(
      (val) =>
        (typeof val === "string" || typeof val === "number") &&
        val.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );
};

export default EmployeeStatement;
