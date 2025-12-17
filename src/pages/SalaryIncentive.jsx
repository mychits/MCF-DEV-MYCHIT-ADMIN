/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Select, Dropdown, Drawer, Form, Input, Button, DatePicker, InputNumber } from "antd";
import { IoMdMore } from "react-icons/io";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";
import { fieldSize } from "../data/fieldSize";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import dayjs from "dayjs";

const SalaryIncentive = () => {
  const [salaries, setSalaries] = useState([]);
  const [tableSalaries, setTableSalaries] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [form] = Form.useForm();

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  const onGlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };

  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/employee/salaries/pending-incentives");
        setSalaries(response.data);
        
        const formattedData = response.data.map((salary, index) => ({
          _id: salary?._id,
          id: index + 1,
          employee_name: salary?.employee_id?.name || "N/A",
          employee_id: salary?.employee_id?.employee_id || "N/A",
          salary_month: salary?.salary_month,
          salary_year: salary?.salary_year,
          calculated_incentive: salary?.calculated_incentive || 0,
          incentive_status: salary?.incentive_status || "Pending",
          payment_method: salary?.incentive_payment_method || "Not Selected",
          action: (
            <div className="flex justify-center gap-2">
              <Button
                type="primary"
                size="small"
                onClick={() => handleEditIncentive(salary._id)}
              >
                Edit Incentive
              </Button>
            </div>
          ),
        }));
        setTableSalaries(formattedData);
      } catch (error) {
        console.error("Error fetching salary data:", error);
        setAlertConfig({
          visibility: true,
          message: "Error fetching salary data",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSalaries();
  }, [reloadTrigger]);

  const handleEditIncentive = async (salaryId) => {
    try {
      const response = await api.get(`/employee/salaries/${salaryId}`);
      const salaryData = response.data;
      setCurrentSalary(salaryData);
      
      // Set form values
      form.setFieldsValue({
        calculated_incentive: salaryData.calculated_incentive || 0,
        incentive_payment_method: salaryData.incentive_payment_method || "",
        incentive_status: salaryData.incentive_status || "Pending",
      });
      
      setDrawerVisible(true);
    } catch (error) {
      console.error("Error fetching salary details:", error);
      setAlertConfig({
        visibility: true,
        message: "Error fetching salary details",
        type: "error",
      });
    }
  };

  const handleUpdateIncentive = async (values) => {
    try {
      await api.put(`/employee/salaries/${currentSalary._id}/incentive`, values);
      setAlertConfig({
        visibility: true,
        message: "Incentive updated successfully",
        type: "success",
      });
      setDrawerVisible(false);
      setReloadTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating incentive:", error);
      setAlertConfig({
        visibility: true,
        message: "Error updating incentive",
        type: "error",
      });
    }
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
    setCurrentSalary(null);
    form.resetFields();
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "employee_name", header: "Employee Name" },
    { key: "employee_id", header: "Employee ID" },
    { key: "salary_month", header: "Salary Month" },
    { key: "salary_year", header: "Salary Year" },
    { key: "calculated_incentive", header: "Calculated Incentive" },
    { key: "incentive_status", header: "Incentive Status" },
    { key: "payment_method", header: "Payment Method" },
    { key: "action", header: "Action" },
  ];

  return (
    <>
      <div>
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
              <div className="flex justify-between items-center w-full">
                <h1 className="text-2xl font-semibold">Salary Incentives</h1>
              </div>
            </div>

            {tableSalaries.length > 0 && !isLoading ? (
              <DataTable
                catcher="_id"
                data={filterOption(tableSalaries, searchText)}
                columns={columns}
                exportedPdfName={`Salary Incentives`}
                exportedFileName={`Salary Incentives.csv`}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={tableSalaries.length <= 0}
                data={"Salary Incentive Data"}
              />
            )}
          </div>
        </div>

        <Drawer
          title="Edit Incentive Details"
          placement="right"
          onClose={onCloseDrawer}
          open={drawerVisible}
          width={500}
        >
          {currentSalary && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateIncentive}
              initialValues={{
                calculated_incentive: currentSalary.calculated_incentive || 0,
                incentive_payment_method: currentSalary.incentive_payment_method || "",
                incentive_status: currentSalary.incentive_status || "Pending",
              }}
            >
              <Form.Item
                label="Employee Name"
                name="employee_name"
              >
                <Input disabled value={currentSalary.employee_id?.name || "N/A"} />
              </Form.Item>

              <Form.Item
                label="Employee ID"
                name="employee_id"
              >
                <Input disabled value={currentSalary.employee_id?.employee_id || "N/A"} />
              </Form.Item>

              <Form.Item
                label="Salary Month"
                name="salary_month"
              >
                <Input disabled value={currentSalary.salary_month} />
              </Form.Item>

              <Form.Item
                label="Salary Year"
                name="salary_year"
              >
                <Input disabled value={currentSalary.salary_year} />
              </Form.Item>

              <Form.Item
                label="Calculated Incentive"
                name="calculated_incentive"
                rules={[{ required: true, message: 'Please enter calculated incentive' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  min={0}
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="Incentive Status"
                name="incentive_status"
                rules={[{ required: true, message: 'Please select incentive status' }]}
              >
                <Select placeholder="Select Incentive Status">
                  <Select.Option value="Pending">Pending</Select.Option>
                  <Select.Option value="Processed">Processed</Select.Option>
                  <Select.Option value="Paid">Paid</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Payment Method"
                name="incentive_payment_method"
                rules={[{ required: true, message: 'Please select payment method' }]}
              >
                <Select placeholder="Select Payment Method">
                  <Select.Option value="Cash">Cash</Select.Option>
                  <Select.Option value="Online/UPI">Online/UPI</Select.Option>
                  <Select.Option value="Online/NEFT">Online/NEFT</Select.Option>
                  <Select.Option value="Online/IMPS">Online/IMPS</Select.Option>
                  <Select.Option value="Online/RTGS">Online/RTGS</Select.Option>
                  <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
                  <Select.Option value="Cheque">Cheque</Select.Option>
                  <Select.Option value="Direct Deposit">Direct Deposit</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                  Update Incentive
                </Button>
                <Button onClick={onCloseDrawer}>
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          )}
        </Drawer>
      </div>
    </>
  );
};

export default SalaryIncentive;