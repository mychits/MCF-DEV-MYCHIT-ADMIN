import { useState, useEffect, useMemo } from "react";
import DataTable from "../components/layouts/Datatable"
import api from "../instance/TokenInstance";
import { Select, Spin, Button, Tag } from "antd";
import { CalendarOutlined, UserOutlined, FilterOutlined } from '@ant-design/icons';

const EmployeeMonthlyReport = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
  const currentYearMonth = `${currentYear}-${currentMonth}`;

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(currentYearMonth);
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [loading, setLoading] = useState(false);

  const getMonthRange = (yearMonth) => {
    const [year, month] = yearMonth.split("-");
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    return {
      from_date: formatDate(firstDay),
      to_date: formatDate(lastDay),
    };
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employee");
        setEmployees(res.data.employee || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const { from_date, to_date } = getMonthRange(selectedDate);
      const params = {
        from_date,
        to_date,
        employee_id: selectedEmployee !== "all" ? selectedEmployee : "",
      };

      const res = await api.get("/employee-attendance/monthly-report", { params });
      const attendanceResponse = res.data.attendanceDataResponse || [];

      if (selectedEmployee !== "all") {
        const formatted = attendanceResponse.map((rec, index) => ({
          slNo: index + 1,
          key: rec._id || index,
          date: rec?.date ? rec.date.split("T")[0] : "",
          time: rec?.time || "",
          outTime: rec?.logout_time || "",
          day: rec?.date
            ? new Date(rec.date).toLocaleDateString("en-US", { weekday: "short" })
            : "",
          Note: rec?.note || "",
          status: rec?.status || "",
        }));
        setAttendanceData(formatted);
      } else {
        const grouped = {};
        attendanceResponse.forEach((record, index) => {
          const emp = record?.employee_id;
          if (!emp?._id) return;

          if (!grouped[emp._id]) {
            grouped[emp._id] = {
              slNo: index + 1,
              key: emp._id,
              EmployeeName: emp?.name || "",
              PresentDays: 0,
              AbsentDays: 0,
              HalfDays: 0,
            };
          }
          if (record?.status === "Present") grouped[emp._id].PresentDays++;
          if (record?.status === "Absent") grouped[emp._id].AbsentDays++;
          if (record?.status === "Half Day") grouped[emp._id].HalfDays++;
        });
        setAttendanceData(Object.values(grouped));
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedEmployee, selectedDate]);

  const allEmployeesColumns = [
    { header: "Sl No", key: "slNo", },
    { header: "Employee Name", key: "EmployeeName" },
    { header: "Present Days", key: "PresentDays" },
    { header: "Absent Days", key: "AbsentDays"},
    { header: "Half Days", key: "HalfDays"},
  ];

  const individualColumns = [
    { header: "Sl No", key: "slNo" },
    { header: "Date", key: "date" },
    { header: "in-Time", key: "time" },
    {header: "out-Time", key: "outTime"},
    { header: "Day", key: "day" },
    {header: "Note", key: "Note"},
    {
      header: "Status",
      key: "status",
      render: (status) => {
        if (status?.toLowerCase() === "present") {
          return <Tag color="green">Present</Tag>;
        } else if (status?.toLowerCase() === "absent") {
          return <Tag color="red">Absent</Tag>;
        } else if (status?.toLowerCase() === "half day") {
          return <Tag color="orange">Half Day</Tag>;
        }
        return status || "";
      },
    },
  ];

  const safeData = attendanceData.map((row) => {
    const clean = {};
    Object.keys(row).forEach((key) => {
      clean[key] =
        row[key] === null || row[key] === undefined ? "" : String(row[key]);
    });
    return clean;
  });

  const summaryStats = useMemo(() => {
    const total = attendanceData.length;

    if (selectedEmployee === "all") {
      const totalPresent = attendanceData.reduce((sum, e) => sum + (e.PresentDays || 0), 0);
      const totalAbsent = attendanceData.reduce((sum, e) => sum + (e.AbsentDays || 0), 0);
      const totalHalfDays = attendanceData.reduce((sum, e) => sum + (e.HalfDays || 0), 0);

      return {
        totalEmployees: total,
        totalPresent,
        totalAbsent,
        totalHalfDays,
        presentPercent: total ? ((totalPresent / (totalPresent + totalAbsent + totalHalfDays)) * 100).toFixed(1) : 0,
      };
    }

    const present = attendanceData.filter((r) => r.status === "Present").length;
    const absent = attendanceData.filter((r) => r.status === "Absent").length;
    const halfDays = attendanceData.filter((r) => r.status === "Half Day").length;

    return {
      totalDays: total,
      present,
      absent,
      halfDays,
      presentPercent: total ? ((present / total) * 100).toFixed(1) : 0,
    };
  }, [attendanceData, selectedEmployee]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <CalendarOutlined className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Monthly Attendance Report</h1>
              <p className="text-slate-500 text-sm mt-1">Track and analyze employee attendance patterns</p>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <FilterOutlined className="text-blue-600 text-lg" />
            <h3 className="text-lg font-semibold text-slate-700">Filters</h3>
          </div>
          
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Target Month
              </label>
              <input
                type="month"
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 bg-slate-50 hover:bg-white"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={currentYearMonth}
              />
            </div>

            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Employee
              </label>
              <Select
                showSearch
                className="w-full"
                style={{ width: '100%' }}
                value={selectedEmployee}
                onChange={setSelectedEmployee}
                placeholder="Search employee"
                size="large"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                <Select.Option value="all">All Employees</Select.Option>
                {employees.map((emp) => (
                  <Select.Option key={emp._id} value={emp._id}>
                    {emp.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <Button 
              type="primary" 
              size="large"
              onClick={fetchAttendanceData}
              className="px-8 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Total Employees / Total Days */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <UserOutlined className="text-3xl opacity-80" />
            </div>
            <p className="text-slate-300 text-sm font-medium mb-1">
              {selectedEmployee === "all" ? "Total Employees" : "Total Days"}
            </p>
            <p className="text-4xl font-bold">
              {selectedEmployee === "all"
                ? summaryStats.totalEmployees
                : summaryStats.totalDays}
            </p>
          </div>

          {/* Present */}
          {selectedEmployee !== "all" && (
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Present</p>
              <p className="text-4xl font-bold">{summaryStats.present}</p>
            </div>
          )}

          {/* Absent */}
          {selectedEmployee !== "all" && (
            <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✕</span>
                </div>
              </div>
              <p className="text-rose-100 text-sm font-medium mb-1">Absent</p>
              <p className="text-4xl font-bold">{summaryStats.absent}</p>
            </div>
          )}

          {/* Half Day */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">½</span>
              </div>
            </div>
            <p className="text-amber-100 text-sm font-medium mb-1">Half Day</p>
            <p className="text-4xl font-bold">
              {selectedEmployee === "all" ? summaryStats.totalHalfDays : summaryStats.halfDays}
            </p>
          </div>

          {/* Present % */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">%</span>
              </div>
            </div>
            <p className="text-blue-100 text-sm font-medium mb-1">Present Rate</p>
            <p className="text-4xl font-bold">{summaryStats.presentPercent}%</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <Spin size="large" />
              <p className="text-slate-500 mt-4">Loading attendance data...</p>
            </div>
          ) : (
            <>
              <DataTable
                columns={selectedEmployee === "all" ? allEmployeesColumns : individualColumns}
                data={safeData}
                exportedPdfName="Employee Monthly Attendence Report"
                exportedFileName={`EmployeeMonthlyAttendenceReport.csv`}
                loading={loading}
              />
              
              <div className="mt-6 pt-4 border-t border-slate-200">
                <p className="text-slate-600 text-sm">
                  <span className="font-medium">Showing attendance for:</span>{" "}
                  <span className="text-blue-600 font-semibold">{selectedDate}</span>
                  {selectedEmployee !== "all" &&
                    ` • ${employees.find((e) => e._id === selectedEmployee)?.name || ""}`}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeMonthlyReport;