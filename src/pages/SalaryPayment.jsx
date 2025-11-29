import { DatePicker, Drawer } from "antd";
import Navbar from "../components/layouts/Navbar";
import Sidebar from "../components/layouts/Sidebar";
import DataTable from "../components/layouts/Datatable";
import { useEffect, useState } from "react";
import API from "../instance/TokenInstance";
import { Select, Segmented, Button } from "antd";
const columns = [
  { key: "id", header: "SL. NO" },
  { key: "date", header: "Paid Date" },
  { key: "transaction_date", header: "Transaction Date" },
  { key: "name", header: "Customer Name" },
  { key: "phone_number", header: "Customer Phone Number" },
  { key: "group_name", header: "Group Name" },
  { key: "ticket", header: "Ticket Number" },
  { key: "old_receipt", header: "Old Receipt" },
  { key: "receipt", header: "Receipt" },
  { key: "amount", header: "Amount" },
  { key: "pay_type", header: "Payment Type" },
  { key: "collection_time", header: "Collection Time" },
  { key: "collected_by", header: "Collected By" },
  { key: "action", header: "Action" },
];

const SalaryPayment = () => {
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [employeeDetailsLoading, setEmployeeDetailsLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    month: "",
    year:"",
    earnings: {
      basic: 0,
      hra: 0,
      travel_allowance: 0,
      medical_allowance: 0,
      basket_of_benifits: 0,
      performance_bonus: 0,
      other_allowances: 0,
      conveyance: 0,
    },
    deductions: {
      income_tax: 0,
      esi: 0,
      epf: 0,
      professional_tax: 0,
    },
  });

  async function fetchEmployees() {
    try {
      const responseData = await API.get("/employee");

      const filteredEmployee = responseData?.data?.employee?.map((emp) => ({
        value: emp?._id,
        label: `${emp?.name} | ${emp?.phone_number}` || "Unknown Employee",
      }));
      setEmployees(filteredEmployee || []);
    } catch (error) {
      setEmployees([]);
    }
  }
  useEffect(() => {
    fetchEmployees();
  }, []);
  async function fetchSalaryDetails() {
    try {
      setEmployeeDetailsLoading(true);
      const responseData = await API.get(`/employee/${formData.employee_id}`);
      const filteredEmployeeDetails = responseData?.data?.data;
      const {deductions,earnings} = filteredEmployeeDetails;
      setEmployeeDetails(filteredEmployeeDetails);
      setFormData((prev)=>({...prev,deductions,earnings}));
    } catch (error) {
      setEmployeeDetails({});
    } finally {
      setEmployeeDetailsLoading(false);
    }
  }
  useEffect(() => {
    fetchSalaryDetails();
  }, [formData?.employee_id]);
  const handleChange = (name, value) => {
    // setEmployeeDetails({});
    setFormData((prev) => ({ ...prev, [name]: value }));
  
  };
  const handleDeductionChange = (name, value) => {
    setFormData((prev) => ({ ...prev, deductions: { [name]: value } }));
  };
  const handleEarningsChange = (name, value) => {
    setFormData((prev) => ({ ...prev, earnings: { [name]: value } }));
  };
  async function handleCalculateSalary() {
    try {
    //  await API.get("/salary-payment/calculate");
    console.log(formData,"this s")
    } catch (error) {}
  }

  return (
    <div>
      <div className="flex mt-20">
        <Navbar visibility={true} />
        <Sidebar />
        <div className="flex-grow p-7">
          <h1 className="text-2xl font-semibold">Salary Payment</h1>
          <div className="mt-6 mb-8">
            <div className="mb-10">
              <div className="flex justify-end items-center w-full">
                <div>
                  <button
                    onClick={() => setIsOpenAddModal(true)}
                    className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                  >
                    + Add Salary Payment
                  </button>
                </div>
              </div>
            </div>

            {/* <DataTable columns={columns} data={sampleData} /> */}
          </div>
        </div>

        <Drawer
          title="Add New Salary Payment"
          width={"100%"}
          className="payment-drawer"
          open={isOpenAddModal}
          onClose={() => setIsOpenAddModal(false)}
          closable={true}
        >
          <div>
            <label>
              Select Employee <span className="text-red-600">*</span>
            </label>
            <Select
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? "")
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? "").toLowerCase())
              }
              style={{ width: 200 }}
              placeholder="Search to Select Employee"
              options={employees}
              onChange={(value) => handleChange("employee_id", value)}
            />
          </div>
          {!employeeDetailsLoading ? (
            formData.employee_id &&
            Object.values(employeeDetails).length > 0 && (
              <>
                <div>
                   <DatePicker value={formData?.year} onChange={(date,dateString)=>handleChange("year",dateString)} picker="year" />
                  <label>
                    Select Month <span className="text-red-600">*</span>
                  </label>
                  <Segmented
                    options={[
                      { label: "January", value: "January", disabled: false },
                      { label: "February", value: "February", disabled: false },
                      { label: "March", value: "March", disabled: false },
                      { label: "April", value: "April", disabled: false },
                      { label: "May", value: "May", disabled: false },
                      { label: "June", value: "June", disabled: false },
                      { label: "July", value: "July", disabled: false },
                      { label: "August", value: "August", disabled: false },
                      {
                        label: "September",
                        value: "September",
                        disabled: false,
                      },
                      { label: "October", value: "October", disabled: false },
                      { label: "November", value: "November", disabled: false },
                      { label: "December", value: "December", disabled: false },
                    ]}
                    onChange={(value) => handleChange("month",value)}
                  />
                </div>
                <main>
                  <input
                    type="text"
                    placeholder="Name"
                    value={employeeDetails?.name}
                    disabled

                  />
                  <input
                    type="text"
                    placeholder="Email"
                    value={employeeDetails?.email}
                    disabled

                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={employeeDetails?.phone_number}
                    disabled

                  /> <input
                    type="text"
                    placeholder="Joining Date"
                    value={employeeDetails?.joining_date?.split("T")[0]}
                    disabled

                  />

                  <input
                    type="text"
                    placeholder="Employee Id"
                    value={employeeDetails?.employeeCode}
                    disabled
                  />
                  <div>
                    <input
                      placeholder="Enter Basic Salary"
                      onChange={(e) =>
                        handleEarningsChange(e.target.name, e.target.value)
                      }
                      type="text"
                      name="basic"
                      id="basic"
                      value={formData?.earnings?.basic}
                    />
                    <input
                      placeholder="Enter House Rent Allowance"
                      onChange={(e) =>
                        handleEarningsChange(e.target.name, e.target.value)
                      }
                      type="text"
                      name="hra"
                      id="hra"
                       value={formData?.earnings?.hra}
                    />
                    <input
                      placeholder="Enter Travel Allowance"
                      onChange={(e) =>
                        handleEarningsChange(e.target.name, e.target.value)
                      }
                      type="text"
                      name="travel_allowance"
                      id="travel_allowance"
                      value={formData?.earnings?.travel_allowance}
                    />
                    <input
                      placeholder="Enter Medical Allowance"
                      onChange={(e) =>
                        handleEarningsChange(e.target.name, e.target.value)
                      }
                      type="text"
                      name="medical_allowance"
                      id="medical_allowance"
                        value={formData?.earnings?.medical_allowance}
                    />
                    <input
                      placeholder="Enter Basket Of Benifits"
                      onChange={(e) =>
                        handleEarningsChange(e.target.name, e.target.value)
                      }
                      type="text"
                      name="basket_of_benifits"
                      id="basket_of_benifits"
                      value={formData?.earnings?.basket_of_benifits}
                    />
                    <input
                      placeholder="Enter Performance Bonus"
                      onChange={(e) =>
                        handleEarningsChange(e.target.name, e.target.value)
                      }
                      type="text"
                      name="performance_bonus"
                      id="performance_bonus"
                       value={formData?.earnings?.performance_bonus}
                    />
                    <input
                      placeholder="Enter Other Allowances"
                      onChange={(e) =>
                        handleEarningsChange(e.target.name, e.target.value)
                      }
                      type="text"
                      name="other_allowances"
                      id="other_allowances"
                       value={formData?.earnings?.other_allowances}
                    />
                    <input
                      placeholder="Enter Conveyance"
                      onChange={(e) =>
                        handleEarningsChange(e.target.name, e.target.value)
                      }
                      type="text"
                      name="conveyance"
                      id="conveyance"
                      value={formData?.earnings?.conveyance}
                    />
                  </div>
                  <div>
                    <input
                      placeholder="Enter Income Tax"
                      onChange={(e) =>
                        handleDeductionChange(e.target.name, e.target.value)
                      }
                      type="text"
                      name="income_tax"
                      id="income_tax"
                      value={formData?.deductions?.income_tax}
                    />
                    <input
                      placeholder="Employees' State Insurance"
                      onChange={(e) =>
                        handleDeductionChange(e.target.name, e.target.value)
                      }
                      type="text"
                      name="esi"
                      id="esi"
                      value={formData?.deductions?.esi}

                    />
                    <input
                      placeholder="Employees' Provident Fund"
                      onChange={(e) =>
                        handleDeductionChange(e.target.name, e.target.value)
                      }
                      type="text"
                      name="epf"
                      id="epf"
                      value={formData?.deductions?.epf}
                    />
                    <input
                      placeholder="Enter Professional Tax"
                      onChange={(e) =>
                        handleDeductionChange(e.target.name, e.target.value)
                      }
                      type="text"
                      name="professional_tax"
                      id="professional_tax"
                       value={formData?.deductions?.professional_tax}
                    />
                  </div>
                </main>

                <div>
                  <Button type="primary" onClick={handleCalculateSalary}>
                    Calculate Salary
                  </Button>
                </div>
              </>
            )
          ) : (
            <div>loading....</div>
          )}
        </Drawer>
      </div>
    </div>
  );
};

export default SalaryPayment;
