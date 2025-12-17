/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import filterOption from "../helpers/filterOption";
import { Drawer, Form, Input, Button, Select, InputNumber, Tag } from "antd";

const AllEmployeeIncentives = () => {
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reload, setReload] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [form] = Form.useForm();

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "",
    type: "info",
  });

  const onGlobalSearchChangeHandler = (e) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    const fetchAllIncentives = async () => {
      try {
        setIsLoading(true);

        const response = await api.get("/employee/incentives/pending");

        const apiData = response.data?.data || [];
        const responseArray = apiData.map((data, index) => {
          const target = data?.monthly_business_info?.target || 0;
          const actual =
            data?.monthly_business_info?.total_business_closed || 0;
          const incentiveEarned = data?.calculated_incentive || 0;
          const incentivePaid = data?.incentive_paid_amount || 0;
          const incentiveRemaining = incentiveEarned - incentivePaid;
          const targetStatus = actual >= target ? "Achieved" : "Not Achieved";

          return {
            _id: data._id,
            id: index + 1,
            employee_name: data?.employee_id?.name || "N/A",
            employee_code: data?.employee_id?.employeeCode || "N/A",
            salary_month: data?.salary_month || "N/A",
            salary_year: data?.salary_year || "N/A",
            target_amount: target,
            actual_closed: actual,
            target_status: (
              <Tag color={targetStatus === "Achieved" ? "green" : "volcano"}>
                {targetStatus}
              </Tag>
            ),
            incentive_earned: incentiveEarned,
            incentive_paid: incentivePaid,
            incentive_remaining: incentiveRemaining,
            incentive_status: (
              <Tag
                color={data?.incentive_status === "Paid" ? "green" : "orange"}>
                {data?.incentive_status || "Pending"}
              </Tag>
            ),
            action: (
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  openDrawer({
                    salary_id: data._id,
                    employee_name: data?.employee_id?.name,
                    employee_code: data?.employee_id?.employeeCode,
                    month: data?.salary_month,
                    year: data?.salary_year,
                    remaining: incentiveRemaining,
                  });
                }}>
                Pay Incentive
              </Button>
            ),
          };
        });

        setTableData(responseArray);
      } catch (error) {
        console.error(error);
        setAlertConfig({
          visibility: true,
          message: "Failed to fetch incentive data",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllIncentives();
  }, [reload]);

  const openDrawer = (data) => {
    setSelectedRow(data);
    form.setFieldsValue({
      incentive_paid_amount: data.remaining,
      incentive_payment_method: "",
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRow(null);
    form.resetFields();
  };

  const handlePayIncentive = async (values) => {
    try {
      await api.put(
        `/employee/salaries/${selectedRow.salary_id}/pay-incentive`,
        values
      );

      setAlertConfig({
        visibility: true,
        message: "Incentive paid successfully",
        type: "success",
      });

      closeDrawer();
      setReload((p) => p + 1);
    } catch (err) {
      setAlertConfig({
        visibility: true,
        message: err.response?.data?.message || "Failed to pay incentive",
        type: "error",
      });
    }
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "employee_name", header: "Employee Name" },
    { key: "salary_month", header: "Month" },
    { key: "salary_year", header: "Year" },
    { key: "target_amount", header: "Target (₹)" },
    { key: "actual_closed", header: "Business Closed (₹)" },
    { key: "target_status", header: "Target Status" },
    { key: "incentive_earned", header: "Incentive Earned (₹)" },
    { key: "incentive_paid", header: "Paid (₹)" },
    { key: "incentive_remaining", header: "Remaining (₹)" },
    { key: "incentive_status", header: "Incentive Status" },
    { key: "action", header: "Action" },
  ];

  return (
    <>
      <Navbar
        visibility={true}
        onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
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
            <h1 className="text-2xl font-semibold">
              All Employees – Incentive & Target Report
            </h1>
          </div>

          {!isLoading ? (
            <DataTable
              catcher="_id"
              data={filterOption(tableData, searchText)}
              columns={columns}
              exportedPdfName="All Employee Incentives"
              exportedFileName="All_Employee_Incentives.csv"
            />
          ) : (
            <CircularLoader isLoading={true} />
          )}
        </div>
      </div>

      <Drawer
        title="Pay Incentive"
        placement="right"
        width={420}
        open={drawerOpen}
        onClose={closeDrawer}>
        {selectedRow && (
          <Form layout="vertical" form={form} onFinish={handlePayIncentive}>
            <Form.Item label="Employee">
              <Input
                disabled
                value={`${selectedRow.employee_name} (${selectedRow.employee_code})`}
              />
            </Form.Item>

            <Form.Item label="Period">
              <Input
                disabled
                value={`${selectedRow.month}, ${selectedRow.year}`}
              />
            </Form.Item>

            <Form.Item label="Remaining Incentive">
              <Input
                disabled
                value={`₹ ${selectedRow.remaining.toLocaleString()}`}
              />
            </Form.Item>

            <Form.Item
              label="Pay Amount"
              name="incentive_paid_amount"
              rules={[
                { required: true, message: "Please enter amount to pay" },
                {
                  validator: (_, value) =>
                    value > selectedRow.remaining
                      ? Promise.reject(
                          new Error("Amount exceeds remaining incentive")
                        )
                      : Promise.resolve(),
                },
              ]}>
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\₹\s?|(,*)/g, "")}
              />
            </Form.Item>

            <Form.Item
              label="Payment Method"
              name="incentive_payment_method"
              rules={[
                { required: true, message: "Please select payment method" },
              ]}>
              <Select placeholder="Select payment method">
                <Select.Option value="Cash">Cash</Select.Option>
                <Select.Option value="UPI">UPI</Select.Option>
                <Select.Option value="NEFT">NEFT</Select.Option>
                <Select.Option value="IMPS">IMPS</Select.Option>
                <Select.Option value="RTGS">RTGS</Select.Option>
                <Select.Option value="Cheque">Cheque</Select.Option>
              </Select>
            </Form.Item>

            <Button type="primary" htmlType="submit" block>
              Pay Incentive
            </Button>
          </Form>
        )}
      </Drawer>
    </>
  );
};

export default AllEmployeeIncentives;
