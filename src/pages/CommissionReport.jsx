import React, { useEffect, useState } from "react";
import { Select } from "antd";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import CircularLoader from "../components/loaders/CircularLoader";
import Navbar from "../components/layouts/Navbar";
import Modal from "../components/modals/Modal";


const CommissionReport = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  //date filters
  const [tempFromDate, setTempFromDate] = useState();
  const [tempToDate, setTempToDate] = useState();

  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [employeeCustomerData, setEmployeeCustomerData] = useState([]);
  const [commissionTotalDetails, setCommissionTotalDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const formatDate = (date) => date.toISOString().split("T")[0];
  const today = formatDate(new Date());
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionForm, setCommissionForm] = useState({
    agent_id: "",
    pay_date: new Date().toISOString().split("T")[0],
    amount: "",
    pay_type: "cash",
    transaction_id: "",
    note: "",
    pay_for: "commission",
    admin_type: "",
  });
  const [errors, setErrors] = useState({});
  const [adminId, setAdminId] = useState("");
  const [adminName, setAdminName] = useState("");

  const [targetData, setTargetData] = useState({
    target: 0,
    achieved: 0,
    remaining: 0,
    startDate: "",
    endDate: "",
  });

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/agent/get-agent");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchCommissionReport = async (employeeId) => {
    if (!employeeId) return;
    setLoading(true);
    try {
     
      const res = await api.get(
        '/enroll/get-detailed-commission-per-month', 
        {
          params: { agent_id: employeeId, from_date: fromDate, to_date: toDate }, 
        }
      );
      setEmployeeCustomerData(res.data?.commission_data);
      setCommissionTotalDetails(res.data?.summary);
    } catch (err) {
      console.error("Error fetching employee report:", err);
      setEmployeeCustomerData([]);
      setCommissionTotalDetails({});
    } finally {
      setLoading(false);
    }
  };

  const fetchTargetData = async (employeeId) => {
    try {
      const targetRes = await api.get("/target/get-targets", {
        params: { fromDate, toDate, agentId: employeeId },
      });

      const rawTargets = targetRes.data || [];

     
      const monthMap = {};
      rawTargets.forEach((t) => {
        if ((t.agentId?._id || t.agentId) !== employeeId) return;
        const date = new Date(t.startDate);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthMap[key]) monthMap[key] = t.totalTarget || 0;
      });

      
      const defaultTarget = Object.values(monthMap)[0] || 0;
      let totalTarget = 0;
      const start = new Date(fromDate);
      const end = new Date(toDate);
      let date = new Date(start);
      while (date <= end) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${month}`;
        const monthTarget = monthMap[key] ?? defaultTarget;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const perDayTarget = monthTarget / daysInMonth;

        totalTarget += perDayTarget;
        date.setDate(date.getDate() + 1);
      }

     
      const { data: comm } = await api.get(
        '/enroll/get-detailed-commission-per-month', 
        { params: { agent_id: employeeId, from_date: fromDate, to_date: toDate } } 
      );

      let achieved = comm?.summary?.actual_business || 0;
      if (typeof achieved === "string") {
        achieved = Number(achieved.replace(/[^0-9.-]+/g, ""));
      }

      const remaining = Math.max(totalTarget - achieved, 0);
      const difference = totalTarget - achieved;

      // Step 4: Designation & incentive logic
      const designation =
        rawTargets.find(
          (t) => (t.agentId?._id || t.agentId) === employeeId
        )?.agentId?.designation_id?.title || "N/A";
      const title = designation.toLowerCase();

      let incentiveAmount = 0;
      let incentivePercent = "0%";

      if (title === "business agent" && achieved <= totalTarget) {
        incentiveAmount = difference * 0.005;
        incentivePercent = "0.5%";
      } else if (difference < 0) {
        incentiveAmount = Math.abs(difference) * 0.01;
        incentivePercent = "1%";
      }

      // Step 5: Start and End Dates
      const startDate = rawTargets.reduce(
        (min, t) => (t.startDate < min ? t.startDate : min),
        rawTargets[0]?.startDate || ""
      );
      const endDate = rawTargets.reduce(
        (max, t) => (t.endDate > max ? t.endDate : max),
        rawTargets[0]?.endDate || ""
      );

      // Step 6: Set UI state
      setTargetData({
        target: Math.round(totalTarget),
        achieved,
        remaining: Math.max(totalTarget - achieved, 0),
        difference,
        startDate: startDate?.split("T")[0] || "",
        endDate: endDate?.split("T")[0] || "",
        designation,
        incentiveAmount: `₹${incentiveAmount.toFixed(2)}`,
        incentivePercent,
      });
    } catch (err) {
      console.error("Error fetching target data:", err);
      setTargetData({
        target: 0,
        achieved: 0,
        remaining: 0,
        difference: 0,
        startDate: "",
        endDate: "",
        designation: "-",
        incentiveAmount: "₹0.00",
        incentivePercent: "0%",
      });
    }
  };


  const fetchAllCommissionReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("enroll/get-detailed-commission-all", {
        params: { from_date: fromDate, to_date: toDate },
      });
      setEmployeeCustomerData(res.data?.commission_data);
      setCommissionTotalDetails(res.data?.summary);
    } catch (err) {
      console.error("Error fetching all commission report:", err);
      setEmployeeCustomerData([]);
      setCommissionTotalDetails({});
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = async (value) => {
    setSelectedEmployeeId(value);

    if (value === "ALL") {
      setSelectedEmployeeDetails(null);
      setTargetData({
        target: 0,
        achieved: 0,
        remaining: 0,
        startDate: "",
        endDate: "",
        designation: "",
        incentiveAmount: "₹0.00",
        incentivePercent: "0%",
      });
      fetchAllCommissionReport();
    } else {
      const selectedEmp = employees.find((emp) => emp._id === value);
      setSelectedEmployeeDetails(selectedEmp || null);
      await fetchCommissionReport(value);
      // 🔥 Don't call fetchTargetData here — it's moved to useEffect
    }
  };

  // fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const todayDate = formatDate(new Date());
    setTempFromDate();
    setTempToDate();
    setFromDate();
    setToDate();
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setAdminId(user._id);
      setAdminName(user.name || "");
    }
  }, []);

  const handleCommissionChange = (e) => {
    const { name, value } = e.target;
    setCommissionForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!commissionForm.agent_id) newErrors.agent_id = "Please select an agent";
    if (!commissionForm.amount || isNaN(commissionForm.amount)) newErrors.amount = "Please enter a valid amount";
    if (commissionForm.pay_type === "online" && !commissionForm.transaction_id) newErrors.transaction_id = "Transaction ID is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = { ...commissionForm, admin_type: adminId };
      await api.post("/payment-out/add-commission-payment", payload);
      alert("Commission Paid Successfully!");
      setShowCommissionModal(false);
    } catch (err) {
      alert("Failed to add payment.");
    }
  };

  const handlePayNow = () => {
    const actual = employeeCustomerData.reduce((sum, item) => {
      // The `item.start_date` here is likely incorrect if you want to sum based on payment date.
      // Assuming `start_date` refers to the enrollment's start date and not payment date.
      // If you have a 'pay_date' or similar field in `employeeCustomerData`, use that.
      // Based on the prompt, it seems you want to sum based on 'pay_date'.
      // If `employeeCustomerData` contains a `pay_date` for each item, you should use that.
      // Otherwise, the current logic sums commission based on the enrollment `start_date`.
      const payDate = new Date(item.start_date); // This should ideally be `item.pay_date` if available.
      const f = new Date(fromDate);
      const t = new Date(toDate);
      if (payDate >= f && payDate <= t) {
        const actual = parseFloat(
          (commissionTotalDetails?.total_actual || "0").toString().replace(/[^0-9.-]+/g, "")


        );
        return sum + val;
      }
      return sum;
    }, 0);

    const incentive = parseFloat(
      (targetData?.incentiveAmount || "0").replace(/[^0-9.-]+/g, "")
    );

    const total = actual + incentive;

    setCommissionForm({
      agent_id: selectedEmployeeId,
      pay_date: new Date().toISOString().split("T")[0],
      amount: total.toFixed(2),
      pay_type: "cash",
      transaction_id: "",
      note: "", // ✅ Reset note here
      pay_for: "commission",
      admin_type: adminId,
    });

    setErrors({});
    setShowCommissionModal(true);
  };

  // re-fetch commission data when filters change
  useEffect(() => {
    if (selectedEmployeeId === "ALL") {
      fetchAllCommissionReport();
    } else if (selectedEmployeeId) {
      fetchCommissionReport(selectedEmployeeId);
    }
  }, [fromDate, toDate]);


  useEffect(() => {
    if (selectedEmployeeId && selectedEmployeeId !== "ALL") {
      fetchTargetData(selectedEmployeeId);
    }
  }, [employeeCustomerData, fromDate, toDate]);


  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId === "ALL") {
      fetchAllCommissionReport();
    } else if (selectedEmployeeId) {
      fetchCommissionReport(selectedEmployeeId);
    }
  }, [fromDate, toDate]);

  const processedTableData = employeeCustomerData.map((item, index) => ({
    ...item,
  }));

  const columns = [
    ...(selectedEmployeeId === "ALL"
      ? [{ key: "agent_name", header: "Agent Name" }]
      : []),
    { key: "user_name", header: "Customer Name" },
    { key: "phone_number", header: "Phone Number" },
    { key: "group_name", header: "Group Name" },
    { key: "group_value_digits", header: "Group Value" },
    { key: "commission_rate", header: "Commission Rate" },
    { key: "start_date", header: "Start Date" },
    { key: "estimated_commission_digits", header: "Estimated Commission" },
    { key: "actual_commission_digits", header: "Actual Commission" },
    { key: "total_paid_digits", header: "Total Paid" },
    { key: "required_installment_digits", header: "Required Installment" },
    { key: "commission_released", header: "Commission Released" },
  ];

  return (
    <div className="w-screen min-h-screen">
      <div className="flex mt-30">
        <Navbar visibility={true} />
        <div className="flex-grow p-7">
          <h1 className="text-2xl font-bold text-center ">
            Reports - Commission
          </h1>

          <div className="mt-6 mb-8">
            <div className="mb-2">
              <div className="flex justify-center items-center w-full gap-4 bg-blue-50 p-2 w-30 h-40 rounded-3xl border   space-x-2">
                <div className="mb-2">
                  <label className="block text-lg text-gray-500 text-center font-semibold mb-2">
                    Employee
                  </label>
                  <Select
                    value={selectedEmployeeId || undefined}
                    onChange={handleEmployeeChange}
                    showSearch
                    popupMatchSelectWidth={false}
                    placeholder="Search or Select Employee"
                    filterOption={(input, option) =>
                      option.children
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{ height: "50px", width: "600px" }}
                  >
                    <Select.Option value="ALL">All</Select.Option>
                    {employees.map((emp) => (
                      <Select.Option key={emp._id} value={emp._id}>
                        {emp.name} - {emp.phone_number}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <input
                  type="date"
                  value={tempFromDate || ""}
                  max={today}
                  onChange={(e) => {
                    const newFrom = e.target.value;
                    if (tempToDate && tempToDate < newFrom) setTempToDate(newFrom);
                    setTempFromDate(newFrom);
                  }}
                  className="border border-gray-300 rounded px-4 mt-7 py-2 w-[200px]"
                />

                <input
                  type="date"
                  value={tempToDate || ""}
                  min={tempFromDate || ""}
                  max={today}
                  onChange={(e) => setTempToDate(e.target.value)}
                  className="border border-gray-300 rounded px-4 mt-7 py-2 w-[200px]"
                />

                <button
                  onClick={() => {
                    setFromDate(tempFromDate);
                    setToDate(tempToDate);
                  }}
                  disabled={!tempFromDate || !tempToDate}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 mt-7 py-2 rounded"
                >
                  Filter
                </button>

              </div>
            </div>
          </div>

          {/* Employee Info */}
          {(selectedEmployeeId === "ALL" || selectedEmployeeDetails) && (
            <div className="mb-8 bg-gray-50 rounded-md shadow-md p-6 space-y-4">
              {selectedEmployeeId !== "ALL" && selectedEmployeeDetails && (
                <>
                  <div className="flex gap-4">
                    <div className="flex flex-col flex-1">
                      <label className="text-sm font-medium mb-1">Name</label>
                      <input
                        value={selectedEmployeeDetails.name || "-"}
                        readOnly
                        className="border border-gray-300 rounded px-4 py-2 bg-white"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label className="text-sm font-medium mb-1">Email</label>
                      <input
                        value={selectedEmployeeDetails.email || "-"}
                        readOnly
                        className="border border-gray-300 rounded px-4 py-2 bg-white"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label className="text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <input
                        value={selectedEmployeeDetails.phone_number || "-"}
                        readOnly
                        className="border border-gray-300 rounded px-4 py-2 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col flex-1">
                      <label className="text-sm font-medium mb-1">
                        Adhaar Number
                      </label>
                      <input
                        value={selectedEmployeeDetails.adhaar_no || "-"}
                        readOnly
                        className="border border-gray-300 rounded px-4 py-2 bg-white"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label className="text-sm font-medium mb-1">
                        PAN Number
                      </label>
                      <input
                        value={selectedEmployeeDetails.pan_no || "-"}
                        readOnly
                        className="border border-gray-300 rounded px-4 py-2 bg-white"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label className="text-sm font-medium mb-1">
                        Pincode
                      </label>
                      <input
                        value={selectedEmployeeDetails.pincode || "-"}
                        readOnly
                        className="border border-gray-300 rounded px-4 py-2 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">Address</label>
                    <input
                      value={selectedEmployeeDetails.address || "-"}
                      readOnly
                      className="border border-gray-300 rounded px-4 py-2 bg-white"
                    />
                  </div>
                </>
              )}

              {/* Summary always shown */}
              <div className="flex gap-4">
                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium mb-1">
                    Actual Business
                  </label>
                  <input
                    value={commissionTotalDetails?.actual_business || "-"}
                    readOnly
                    className="border border-gray-300 rounded px-4 py-2 bg-white text-green-700 font-bold"
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium mb-1">
                    Actual Commission
                  </label>
                  <input
                    value={commissionTotalDetails?.total_actual || "-"}
                    readOnly
                    className="border border-gray-300 rounded px-4 py-2 bg-white  text-green-700 font-bold"
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium mb-1">
                    Gross Business
                  </label>
                  <input
                    value={commissionTotalDetails?.expected_business || "-"}
                    readOnly
                    className="border border-gray-300 rounded px-4 py-2 bg-white"
                  />
                </div>

              </div>

              <div className="flex gap-4">
                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium mb-1">
                    Gross Commission
                  </label>
                  <input
                    value={commissionTotalDetails?.total_estimated || "-"}
                    readOnly
                    className="border border-gray-300 rounded px-4 py-2 bg-white"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium mb-1">
                    Total Customers
                  </label>
                  <input
                    value={commissionTotalDetails?.total_customers || "-"}
                    readOnly
                    className="border border-gray-300 rounded px-4 py-2 bg-white"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium mb-1">
                    Total Groups
                  </label>
                  <input
                    value={commissionTotalDetails?.total_groups || "-"}
                    readOnly
                    className="border border-gray-300 rounded px-4 py-2 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedEmployeeId && selectedEmployeeId !== "ALL" && fromDate && toDate && (
            <div className="bg-gray-100  p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-bold text-yellow-800 mb-2">
                Target Details
              </h2>

              {targetData.achieved >= targetData.target && (
                <div className="text-green-800 font-semibold mb-3">
                  🎉 Target Achieved
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4 bg-gray-50 ">
                <div>
                  <label className="block font-medium">Target Set</label>
                  <input
                    value={`₹${targetData.target?.toLocaleString("en-IN")}`}
                    readOnly
                    className="border px-3 py-2 rounded w-full bg-gray-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-medium">Achieved</label>
                  <input
                    value={`₹${targetData.achieved?.toLocaleString("en-IN")}`}
                    readOnly
                    className="border px-3 py-2 rounded w-full bg-gray-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-medium">Remaining</label>
                  <input
                    value={`₹${targetData.remaining?.toLocaleString("en-IN")}`}
                    readOnly
                    className="border px-3 py-2 rounded w-full bg-gray-50 font-semibold"
                  />
                </div>
              </div>



              <div className="grid md:grid-cols-2 gap-4 mt-4">

                <div>
                  <label className="block font-medium">Incentive (%)</label>
                  <input
                    value={targetData.incentivePercent || "0%"}
                    readOnly
                    className="border px-3 py-2 rounded w-full bg-gray-50 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-medium">Incentive Amount</label>
                  <input
                    value={targetData.incentiveAmount || "₹0.00"}
                    readOnly
                    className="border px-3 py-2 rounded w-full bg-gray-50 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-medium">Total Payable </label>
                  <input
                    readOnly
                    value={(() => {
                      const actual = parseFloat(
                        (commissionTotalDetails?.total_actual || "0").toString().replace(/[^0-9.-]+/g, "")
                      );

                      const incentive = parseFloat(
                        (targetData?.incentiveAmount || "0").replace(/[^0-9.-]+/g, "")
                      );

                      const total =  incentive;

                      return `₹${total.toLocaleString("en-IN")}`;
                    })()}

                    className="border px-3 py-2 rounded w-full bg-gray-50 text-green-700 font-bold"
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handlePayNow}
                    className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
                  >
                    Pay Now
                  </button>
                </div>

              </div>
            </div>
          )}

          <Modal isVisible={showCommissionModal} onClose={() => setShowCommissionModal(false)} width="max-w-md">
            <div className="py-6 px-5 text-left">
              <h3 className="mb-4 text-xl font-bold text-gray-900 border-b pb-2">Add Commission Payment</h3>
              <form className="space-y-4" onSubmit={handleCommissionSubmit}>
                <div>
                  <label className="block text-sm font-medium">Agent Name</label>
                  <input
                    type="text"
                    readOnly
                    value={
                      employees.find((emp) => emp._id === commissionForm.agent_id)?.name || ""
                    }
                    className="w-full border p-2 rounded bg-gray-100 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Payment Date</label>
                  <input
                    type="date"
                    name="pay_date"
                    value={commissionForm.pay_date}
                    onChange={handleCommissionChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Total Payable Commission</label>
                  <input
                    type="text"
                    readOnly
                    value={`₹${commissionForm.amount || "0.00"}`}
                    className="w-full border p-2 rounded bg-gray-100 text-green-700 font-semibold"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium">Payment Mode</label>
                  <select
                    name="pay_type"
                    value={commissionForm.pay_type}
                    onChange={handleCommissionChange}
                    className="w-full border p-2 rounded"
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                {commissionForm.pay_type === "online" && (
                  <div>
                    <label className="block text-sm font-medium">Transaction ID</label>
                    <input
                      type="text"
                      name="transaction_id"
                      value={commissionForm.transaction_id}
                      onChange={handleCommissionChange}
                      className="w-full border p-2 rounded"
                    />
                    {errors.transaction_id && <p className="text-red-500 text-sm">{errors.transaction_id}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium">Note</label>
                  <textarea
                    name="note"
                    value={commissionForm.note}
                    onChange={handleCommissionChange}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setShowCommissionModal(false)} className="px-4 py-2 border rounded">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                    Save Payment
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* Table Section */}
          {loading ? (
            <CircularLoader isLoading={true} />
          ) : employeeCustomerData.length > 0 ? (
            <>
              <DataTable
                data={processedTableData}
                columns={columns}
                exportedFileName={`CommissionReport-${selectedEmployeeId || "all"
                  }.csv`}
              />
            </>
          ) : (
            selectedEmployeeId && (
              <p className="text-center font-bold text-lg">
                No Commission Data found.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionReport;