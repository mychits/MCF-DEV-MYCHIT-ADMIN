import {useState, useEffect} from 'react'
import api from '../instance/TokenInstance';
import Navbar from '../components/layouts/Navbar';
import DataTable from '../components/layouts/Datatable';
import Sidebar from '../components/layouts/Sidebar';
import CircularLoader from '../components/loaders/CircularLoader';
import SettingSidebar from '../components/layouts/SettingSidebar';
const EmployeeRewardPoints = () => {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");

  const [rewardTable, setRewardTable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /* ================= REDEEM STATES ================= */
  const [redeemPoints, setRedeemPoints] = useState("");
  const [redeemType, setRedeemType] = useState("Cash");
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [redeemDesc, setRedeemDesc] = useState("");

  const POINT_VALUE = 10; // Optional: fetch dynamically later

  /* ================= FETCH EMPLOYEES ================= */
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/agent/get-employee");
      setEmployees(res.data?.employee || []);
    } catch {
      console.error("Failed to fetch employees");
    }
  };

  /* ================= FETCH REWARD LIST ================= */
  const fetchRewardPoints = async (empId) => {
    if (!empId) return;

    setIsLoading(true);
    try {
      const res = await api.get(`/reward-points/list/${empId}`);

      const formatted = res.data?.data?.map((reward, index) => ({
        _id: reward?._id,
        slNo: index + 1,
        userName: reward?.user_id?.full_name || "-",
        userPhone: reward?.user_id?.phone_number || "-",
        groupName: reward?.group_id?.group_name || "-",
        groupValue: reward?.group_id?.group_value || "-",
        ticket: reward?.ticket || "-",
        sourceType: reward?.source_type || "-",
        rewardPoints: reward?.reward_points || 0,
        rewardAmount: reward?.rewarded_amount || 0,
        status: reward?.status || "N/A",
        remarks: reward?.remarks || "-",
      }));

      setRewardTable(formatted);
    } catch (err) {
      console.error("Failed to fetch reward list", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= CREATE REWARD ================= */
  const createRewardPoints = async () => {
    if (!employeeId) return alert("Select employee");

    setIsLoading(true);
    try {
      await api.post("/reward-points/employee-reward-points", {
        employee_id: employeeId,
      });
      await fetchRewardPoints(employeeId);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= AUTO CALCULATE AMOUNT ================= */
  useEffect(() => {
    if (redeemType === "Cash") {
      setRedeemAmount(Number(redeemPoints || 0) * POINT_VALUE);
    } else {
      setRedeemAmount(0);
    }
  }, [redeemPoints, redeemType]);

  /* ================= REDEEM POINTS ================= */
  const redeemRewardPoints = async () => {
    if (!employeeId) return alert("Select employee");
    if (!redeemPoints) return alert("Enter reward points");

    setIsLoading(true);
    try {
      await api.post("/reward-points/employee-reward-points/redeem", {
        employee_id: employeeId,
        points_to_redeem: Number(redeemPoints),
        redemption_type: redeemType,
        description: redeemDesc,
      });

      setRedeemPoints("");
      setRedeemDesc("");

      await fetchRewardPoints(employeeId);
    } catch (err) {
      alert(err.response?.data?.message || "Redeem failed");
    } finally {
      setIsLoading(false);
    }
  };

  const rewardColumns = [
    { key: "slNo", header: "Sl No" },
    { key: "userName", header: "Name" },
    { key: "userPhone", header: "Phone" },
    { key: "groupName", header: "Group" },
    { key: "groupValue", header: "Group Value" },
    { key: "ticket", header: "Ticket" },
    { key: "sourceType", header: "Type" },
    { key: "rewardPoints", header: "Points" },
    { key: "rewardAmount", header: "Amount" },
    { key: "status", header: "Status" },
    { key: "remarks", header: "Remarks" },
  ];

  return (
    <div>
      <Navbar visibility />

      <div className="flex mt-20">
        <SettingSidebar />

        <div className="flex-grow p-7">
          <h1 className="text-2xl font-semibold mb-6">
            Employee Reward Points
          </h1>

          {/* ================= SELECT EMPLOYEE ================= */}
          <div className="flex gap-4 mb-6">
            <select
              className="border px-4 py-2 rounded w-64"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setRewardTable([]);
              }}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>

            <button
              onClick={createRewardPoints}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Create Reward Points
            </button>
          </div>

          {/* ================= REDEEM SECTION ================= */}
          {employeeId && (
            <div className="border rounded p-4 mb-6">
              <h2 className="font-semibold mb-4">
                Redeem Reward Points
              </h2>

              <div className="grid grid-cols-4 gap-4">
                <input
                  type="number"
                  placeholder="Reward Points"
                  className="border px-3 py-2 rounded"
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                />

                <select
                  className="border px-3 py-2 rounded"
                  value={redeemType}
                  onChange={(e) => setRedeemType(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Gift">Gift</option>
                  <option value="Other">Other</option>
                </select>

                {redeemType === "Cash" && (
                  <input
                    disabled
                    className="border px-3 py-2 rounded bg-gray-100"
                    value={`₹ ${redeemAmount}`}
                  />
                )}

                <input
                  type="text"
                  placeholder="Description"
                  className="border px-3 py-2 rounded col-span-2"
                  value={redeemDesc}
                  onChange={(e) => setRedeemDesc(e.target.value)}
                />
              </div>

              <button
                onClick={redeemRewardPoints}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded"
              >
                Redeem Points
              </button>
            </div>
          )}

          {/* ================= TABLE ================= */}
          {rewardTable.length > 0 && !isLoading ? (
            <DataTable
              columns={rewardColumns}
              data={rewardTable}
            />
          ) : (
            <CircularLoader
              isLoading={isLoading}
              data="Employee Reward"
              failure={!isLoading && rewardTable.length === 0}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeRewardPoints;
