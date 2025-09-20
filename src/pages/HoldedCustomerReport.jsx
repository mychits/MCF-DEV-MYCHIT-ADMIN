import React, { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Flex, Spin, Select, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Title } = Typography;

const HoldedCustomerReport = () => {
  const [holdedCustomers, setHoldedCustomers] = useState([]);
  const referrals = ["All","Agent", "Employee"];
  const [selectedRefferal, setSelectedRefferal] = useState("All");
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgentOrEmployee, setSelectedAgentOrEmployee] = useState("");
  // initial data
  useEffect(() => {
    (async () => {
      if(selectedRefferal === "All"){
      try {
        setIsLoading(true);
        const response = await api.get("/enroll/holdedcustomers");
        if (Array.isArray(response.data)) {
          setHoldedCustomers(
            response.data.map((c, i) => ({
              _id: c._id,
              si_no: i + 1,
              user_name: c?.user_id?.full_name,
              user_phone: c?.user_id?.phone_number,
              customer_id: c?.user_id?.customer_id,
              ticket_no: c?.tickets,
              group_name: c?.group_id?.group_name,
              agent_name: c?.agent?.name,
              agent_code: c?.agent?.employeeCode,
              agent_phone_number: c?.agent?.phone_number,
            }))
          );
        }
      } catch (err) {
        setHoldedCustomers([]);
        console.log("failed to get all customers", err);
      } finally {
        setIsLoading(false);
      }
    }
    })();
  }, [selectedRefferal]);

  // agents
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/agent/get");
        if (Array.isArray(res.data?.agent)) {
          setAgents(
            res.data.agent.map((ag) => ({
              _id: ag._id,
              agent_name: ag.name,
              agent_phone_number: ag.phone_number,
              agent_id: ag.employeeCode,
            }))
          );
        }
      } catch (err) {
        setAgents([]);
        console.log("Error fetching agent data", err);
      }
    })();
  }, []);

  // employees
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/agent/get-employee");
        if (Array.isArray(res.data?.employee)) {
          setEmployees(
            res.data.employee.map((e) => ({
              _id: e._id,
              employee_name: e.name,
              employee_phone_number: e.phone_number,
              employee_id: e.employeeCode,
            }))
          );
        }
      } catch (err) {
        console.log("Error fetching Employee data", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedAgentOrEmployee) return;
    (async () => {
      try {
        setIsLoading(true);
        const res = await api.get(
          `/enroll/holded?agent=${selectedAgentOrEmployee}`
        );
        if (Array.isArray(res.data)) {
          setHoldedCustomers(
            res.data.map((c, i) => ({
              _id: c._id,
              si_no: i + 1,
              user_name: c?.user_id?.full_name,
              user_phone: c?.user_id?.phone_number,
              customer_id: c?.user_id?.customer_id,
              ticket_no: c?.tickets,
              group_name: c?.group_id?.group_name,
              agent_name: c?.agent?.name,
              agent_code: c?.agent?.employeeCode,
              agent_phone_number: c?.agent?.phone_number,
            }))
          );
        }
      } catch (err) {
        setHoldedCustomers([]);
        console.error("Error Fetching Holded Customer", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [selectedAgentOrEmployee]);

  const columns = [
    { key: "si_no", header: "SL. NO" },
    { key: "user_name", header: "Customer Name" },
    { key: "user_phone", header: "Phone Number" },
    { key: "customer_id", header: "Customer Id" },
    { key: "ticket_no", header: "Ticket No" },
    { key: "group_name", header: "Group Name" }
  ];
  if (selectedRefferal==="All") {
    columns.push(
      { key: "agent_name", header: "Agent Name" },
      { key: "agent_code", header: "Agent Id" },
      { key: "agent_phone_number", header: "Agent Phone Number" },
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        Holded Customer Report
      </Title>

      <Flex gap="large" style={{ marginBottom: 24 }}>
        <Select
          size="large"
          showSearch
          placeholder="Select Referral Type"
          style={{ width: 300, height: 55 }}
          onChange={(v) => {
            setSelectedRefferal(v);
            setSelectedAgentOrEmployee("");
          }}
          options={referrals.map((r) => ({ label: r, value: r }))}
        />

        {selectedRefferal === "Employee" && (
          <Select
            size="large"
            showSearch
            placeholder="Select Employee"
            style={{ width: 500, height: 55 }}
            onChange={(v) => setSelectedAgentOrEmployee(v)}
            options={employees.map((e) => ({
              label: `${e.employee_name} | ${e.employee_phone_number} | ${e.employee_id}`,
              value: e._id,
            }))}
          />
        )}

        {selectedRefferal === "Agent" && (
          <Select
            size="large"
            showSearch
            placeholder="Select Agent"
            style={{ width: 500, height: 55 }}
            onChange={(v) => setSelectedAgentOrEmployee(v)}
            options={agents.map((a) => ({
              label: `${a.agent_name} | ${a.agent_phone_number} | ${a.agent_id}`,
              value: a._id,
            }))}
          />
        )}
      </Flex>

      {isLoading ? (
        <Flex
          style={{ height: "60vh" }}
          align="center"
          justify="center"
          vertical
        >
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 64 }} spin />}
            tip="Loading data..."
          />
        </Flex>
      ) : holdedCustomers.length <= 0 ? (
        <Flex
          style={{ height: "40vh" }}
          align="center"
          justify="center"
          vertical
        >
          No data found
        </Flex>
      ) : (
        <DataTable
          catcher="_id"
          data={holdedCustomers}
          columns={columns}
          exportedPdfName="HoldedCustomer"
          exportedFileName={`HoldedCustomer.csv`}
        />
      )}
    </div>
  );
};

export default HoldedCustomerReport;
