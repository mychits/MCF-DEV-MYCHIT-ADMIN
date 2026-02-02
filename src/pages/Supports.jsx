import { useEffect, useState } from "react";
import API from "../instance/TokenInstance";
import { notification, Pagination } from "antd";
import { Link } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import { NavbarMenu } from "../data/menu";
import { Users, IndianRupee, ChevronRight, Zap, ClipboardCheck } from "lucide-react";
import DataTable from "../components/layouts/Datatable";
import BaseURL from "../instance/BaseUrl";


function Supports() {
    const [api, contextHolder] = notification.useNotification();

    const [complaints, setComplaints] = useState([]);
    const [totalComplaints, setTotalComplaints] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState(null);
    const [agents, setAgents] = useState([]);
    const [assignListModalOpen, setAssignListModalOpen] = useState(false); // Assign list modal
    const [assignMode, setAssignMode] = useState(false);
    const [openActionId, setOpenActionId] = useState(null);
    const [viewMode, setViewMode] = useState("view");  // "view" | "assign"
    const [viewEditModalOpen, setViewEditModalOpen] = useState(false);  // View/Edit modal
    const [assignModalOpen, setAssignModalOpen] = useState(false); // Small modal
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState("");


    const [filters, setFilters] = useState({
        subject: "",
        department: "",
        assignedTo: "",
        status: "",
        fromDate: "",
        toDate: "",
    });

    const designationCategories = {
        "Management & Leadership": [
            "Director",
            "Sales Manager",
            "Assistant Office Manager",
            "Senior Coordinator",
        ],
        "Sales & Collection": [
            "Sales with Collection",
            "Collection Procurement Executive",
        ],
        "Office & Administration": [
            "Front Office Executive",
            "Office Assistant",
        ],
        "Technical / IT": [
            "Full Stack Developer",
        ],
        "Creative": [
            "Graphic Designer",
        ],
        "OTHERS": [
            "others",
        ],
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
        }));
        setCurrentPage(1); // reset page when filtering
    };

    const columns = [
        {
            key: "sl",
            header: "SL",
        },
        {
            key: "name",
            header: "Name",
        },
        {
            key: "mobile",
            header: "Mobile",
        },
        {
            key: "subject",
            header: "Subject",
        },
        {
            key: "assignedName",
            header: "Assigned To",
        },
        {
            key: "status",
            header: "Status",
        },
        {
            key: "createdAtFormatted",
            header: "Date",
        },
    ];


    const tablecolumns = [
        { key: "sl", header: "SL" },
        { key: "name", header: "Name" },
        { key: "subject", header: "Subject" },
        { key: "assignedName", header: "Assigned To" },
        { key: "status", header: "Status" },
        { key: "date", header: "Date" },
        { key: "action", header: "Action" },
    ];

    const filteredComplaints = complaints.filter(item => {
        /* ---------- SUBJECT ---------- */
        if (filters.subject && item.subject !== filters.subject) {
            return false;
        }

        /* ---------- DEPARTMENT (FIXED) ---------- */
        if (filters.department) {
            const designationTitle =
                typeof item.designation === "object"
                    ? item.designation?.title
                    : item.designation;

            const allowedDesignations = designationCategories[filters.department] || [];

            if (!allowedDesignations.includes(designationTitle)) {
                return false;
            }
        }

        /* ---------- ASSIGNED TO (FIXED) ---------- */
        if (filters.assignedTo) {
            if (filters.assignedTo === "Unassigned") {
                if (item.assignedTo) return false;
            } else {
                const assignedId =
                    typeof item.assignedTo === "object"
                        ? item.assignedTo?._id
                        : item.assignedTo;

                if (assignedId !== filters.assignedTo) {
                    return false;
                }
            }
        }

        /* ---------- STATUS (FIXED) ---------- */
        if (filters.status && item.status !== filters.status) {
            return false;
        }

        /* ---------- DATE RANGE ---------- */
        const itemDate = new Date(item.createdAt).setHours(0, 0, 0, 0);

        if (filters.fromDate) {
            const from = new Date(filters.fromDate).setHours(0, 0, 0, 0);
            if (itemDate < from) return false;
        }

        if (filters.toDate) {
            const to = new Date(filters.toDate).setHours(23, 59, 59, 999);
            if (itemDate > to) return false;
        }

        return true;
    });

    const assignedCount = complaints.filter(c => c.assignedTo).length;
    const unassignedCount = complaints.filter(c => !c.assignedTo).length;

    const tableData1 = filteredComplaints.map((item, index) => ({
        _id: item._id,

        sl: (currentPage - 1) * 10 + index + 1,

        name: item.name,

        subject: item.subject,

        assignedName: item.assignedTo?.name || "Unassigned",

        status: item.status,

        date: new Date(item.createdAt).toLocaleDateString(),

        action: (
            <div className="relative text-center">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenActionId(openActionId === item._id ? null : item._id);
                    }}
                    className="p-2 rounded-full hover:bg-gray-200"
                >
                    ⋮
                </button>

                {openActionId === item._id && (
                    <div className="absolute right-6 top-10 bg-white border rounded-lg shadow-lg w-40 z-50">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleView(item._id);
                                setOpenActionId(null);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                            👁️ View
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComplaint(item);
                                setSelectedAgent("");
                                setViewMode("assign");
                                setViewEditModalOpen(true);
                                setOpenActionId(null);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-600"
                        >
                            🔄 Assign
                        </button>
                    </div>
                )}
            </div>
        ),
    }));

    const tableData = complaints.map((item, index) => ({
        _id: item._id, // IMPORTANT (used for row selection)

        sl: (currentPage - 1) * 10 + index + 1,

        name: item.name,
        mobile: item.mobile,
        subject: item.subject,

        assignedName: item.assignedTo?.name || "Unassigned",

        status: item.status,

        createdAtFormatted: new Date(item.createdAt).toLocaleDateString(),
    }));

    const openAssignModal = (complaint) => {
        setSelectedComplaint(complaint);
        setAssignModalOpen(true);

    };

    const confirmAssign = async () => {
        if (!selectedComplaint || !selectedAgent) return;

        const agent = agents.find(a => a._id === selectedAgent);

        await updateComplaint(selectedComplaint._id, {
            assignedTo: selectedAgent,
            assignedToName: agent?.name,
            status: "is Pending",
        });

        notify(
            "success",
            "Assigned",
            `Complaint assigned to ${agent?.name}`
        );

        setAssignModalOpen(false);   // close small modal
        setSelectedAgent("");
        setSelectedComplaint(null);

        fetchComplaints(currentPage); // refresh table
    };

    /* ---------------- NOTIFICATION HELPER ---------------- */
    const notify = (type, title, description) => {
        api[type]({
            title,
            description,
            placement: "top",
            duration: 2,
            getContainer: () => document.body,
            style: {
                lineHeight: "1.2",
            },

        });
    };

    /* ---------------- FETCH COMPLAINTS ---------------- */
    const fetchComplaints = async (page = 1, isModal = false) => {
        try {
            const res = await API.get(`complaints/all?page=${page}`);
            setComplaints(res.data.data);
            // setComplaints(res.data.complaints || []);
            setTotalComplaints(res.data.total);


            if (isModal) {
                setModalTotal(res.data.total || 0);
                setModalPage(res.data.currentPage || 1);
            } else {
                setTotalComplaints(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
                setCurrentPage(res.data.currentPage || 1);
            }
        } catch (error) {
            notify("error", "Error", "Failed to load complaints");
        }
    };

    useEffect(() => {
        if (assignListModalOpen) {
            fetchComplaints(1, true); // load first page for modal
        }
    }, [assignListModalOpen]);

    useEffect(() => {
        fetchComplaints(currentPage);
    }, [currentPage]);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const res = await API.get("/employee");

                setAgents(res?.data?.employee || []);
            } catch (error) {
                console.error("Fetch agents error:", error.response?.status);
                setAgents([]); // prevent crash
            }
        };
        fetchAgents();
    }, []);

    /* ---------------- UPDATE COMPLAINT ---------------- */

    const updateComplaint = async (id, data) => {
        try {
            const res = await API.put(
                `complaints/update/${id}`,
                data
            );
            return res.data;
        } catch (error) {
            console.error(
                "Update Complaint Error:",
                error?.response?.data || error.message
            );
            throw error;
        }
    };


    const handleView = async (id) => {
        try {
            const res = await API.get(`/complaints/${id}`);

            setSelectedComplaint(res.data);   // ✅ FULL DATA
            setViewMode("view");
            setViewEditModalOpen(true);
        } catch (err) {
            console.error("Fetch complaint failed", err);
        }
    };

    return (
        <>
            {contextHolder}
            <Navbar />

            {/* ---------------- LAYOUT ---------------- */}
            <div className="flex w-screen mt-14">
                <Sidebar />

                <div className="flex-col w-full p-4">

                    <div className="flex items-center gap-3 mb-4 justify-between">
                        {activeTab && (
                            <button
                                // onClick={() => setActiveTab(null)}
                                onClick={() => {
                                    if (assignMode) {
                                        setAssignMode(false);
                                    } else {
                                        setActiveTab(null);
                                    }
                                }}
                                className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
                            >
                                ← Back
                            </button>
                        )}

                        <h2 className="text-2xl font-bold my-5">
                            Admin Support
                        </h2>

                    </div>

                    {!activeTab && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">

                            {/* SUPPORTS CARD */}
                            <div
                                onClick={() => setActiveTab("complaints")}
                                className="group cursor-pointer"
                            >
                                <div className="relative overflow-hidden rounded-xl bg-white border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 opacity-5 group-hover:opacity-10 rounded-full -mr-16 -mt-16 blur-xl" />

                                    <div className="relative p-7">
                                        <div className="flex items-center justify-between">

                                            {/* LEFT SIDE */}
                                            <div className="flex items-center gap-4">
                                                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-lg">
                                                    <span className="text-3xl">📝</span>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        Tickets
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        View all tickets
                                                    </p>
                                                </div>
                                            </div>

                                            {/* RIGHT SIDE (COUNT) */}
                                            <div className="text-right">
                                                <p className="text-4xl font-bold text-blue-600">
                                                    {complaints.length}
                                                </p>
                                                <p className="text-xs text-gray-500 uppercase">
                                                    Tickets
                                                </p>
                                            </div>

                                        </div>

                                        {/* FOOTER */}
                                        <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
                                            <span className="text-xs font-medium text-gray-500 uppercase">
                                                Open Tickets
                                            </span>

                                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition">
                                                <ChevronRight className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition" />
                                </div>
                            </div>

                            {/* ASSIGN CARD */}
                            <div
                                onClick={() => setActiveTab("assign")}
                                className="group cursor-pointer"
                            >
                                <div className="relative overflow-hidden rounded-xl bg-white border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-600 to-green-700 opacity-5 group-hover:opacity-10 rounded-full -mr-16 -mt-16 blur-xl" />

                                    <div className="relative p-9">
                                        <div className="flex items-center justify-between">

                                            {/* LEFT SIDE */}
                                            <div className="flex items-center gap-4">
                                                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg">
                                                    <span className="text-2xl">👤</span>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        Assign
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Assign tickets to staff
                                                    </p>
                                                </div>
                                            </div>

                                            {/* RIGHT SIDE (COUNTS) */}
                                            <div className="flex gap-6 text-right">

                                                {/* Assigned */}
                                                <div>
                                                    <p className="text-3xl font-bold text-green-600">
                                                        {assignedCount}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Assigned
                                                    </p>
                                                </div>

                                                {/* Unassigned */}
                                                <div>
                                                    <p className="text-3xl font-bold text-red-500">
                                                        {unassignedCount}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Unassigned
                                                    </p>
                                                </div>

                                            </div>

                                        </div>

                                        {/* FOOTER */}
                                        <div className="flex items-center justify-between pt-3 mt-4 border-t border-gray-100">
                                            <span className="text-xs font-medium text-gray-500 uppercase">
                                                Staff Assignment
                                            </span>

                                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition">
                                                <ChevronRight className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    </div>


                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition" />
                                </div>
                            </div>

                            <div className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <Zap className="w-6 h-6 text-blue-600 mt-1" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 ">
                                            Quick Tips
                                        </h3>

                                        <ul className="list-disc list-inside text-slate-700 space-y-1">
                                            <li className="flex gap-2">
                                                <span>👉</span> View and manage all support requests in one place
                                            </li>
                                            <li className="flex gap-2">
                                                <span>👉</span> Assign complaints to staff easily
                                            </li>
                                            <li className="flex gap-2">
                                                <span>👉</span> Track complaint status and resolution progress
                                            </li>
                                            <li className="flex gap-2">
                                                <span>👉</span> Improve response time and customer satisfaction
                                            </li>
                                            <li className="flex gap-2">
                                                <span>👉</span> Centralize all help & support operations
                                            </li>

                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {activeTab === "complaints" && (
                        <div className="bg-white rounded-xl shadow border border-gray-300 w-full overflow-x-auto p-4">
                            <p className="text-gray-500 text-sm mb-4">
                                Showing {filteredComplaints.length} of {complaints.length} complaints
                            </p>

                            <DataTable
                                data={tableData}
                                columns={columns}
                                catcher="_id"
                                exportedFileName="Complaints"
                                exportedPdfName="Complaints Report"
                                isExportEnabled={true}
                            />

                        </div>
                    )}

                    {activeTab === "assign" && (
                        <div className="mb-4 border rounded-lg p-4 bg-gray-50">

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                                {/* Subject */}
                                <div className="flex flex-col ">
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 pb-2">
                                        Subject
                                    </label>
                                    <select
                                        name="subject"
                                        value={filters.subject}
                                        onChange={handleFilterChange}
                                        className="border rounded px-3 py-2 text-sm"
                                    >
                                        <option value="">All Subjects</option>
                                        {[...new Set(complaints.map(c => c.subject))].map(subject => (
                                            <option key={subject} value={subject}>{subject}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Department */}
                                {/* <select
                                    name="department"
                                    value={filters.department}
                                    onChange={handleFilterChange}
                                    className="border rounded px-3 py-2 text-sm"
                                >
                                    <option value="">All Departments</option>

                                    {Object.keys(designationCategories).map(dep => (
                                        <option key={dep} value={dep}>
                                            {dep}
                                        </option>
                                    ))}
                                </select> */}

                                {/* Assigned To */}
                                <div className="flex flex-col ">
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 pb-2">
                                        Assigned To
                                    </label>
                                    <select
                                        name="assignedTo"
                                        value={filters.assignedTo}
                                        onChange={handleFilterChange}
                                        className="border rounded px-3 py-2 text-sm"
                                    >
                                        <option value="">All Assignees</option>
                                        <option value="Unassigned">Unassigned</option>
                                        {agents.map(agent => (
                                            <option key={agent._id} value={agent._id}>
                                                {agent.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div className="flex flex-col ">
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 pb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                        className="border rounded px-3 py-2 text-sm"
                                    >
                                        <option value="">All Status</option>
                                        <option value="Open">Open</option>
                                        <option value="is Pending">Pending</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>

                                {/* From Date */}
                                <div className="flex flex-col">
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 pb-2">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        name="fromDate"
                                        value={filters.fromDate}
                                        onChange={handleFilterChange}
                                        className="border rounded px-3 py-2 text-sm"
                                    />
                                </div>

                                {/* To Date */}
                                <div className="flex flex-col ">
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 pb-2">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        name="toDate"
                                        value={filters.toDate}
                                        onChange={handleFilterChange}
                                        className="border rounded px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="mt-3">
                                <button
                                    onClick={() =>
                                        setFilters({
                                            subject: "",
                                            department: "",
                                            assignedTo: "",
                                            status: "",
                                            fromDate: "",
                                            toDate: "",
                                        })
                                    }
                                    className="px-4 py-2 bg-blue-200 rounded text-sm hover:bg-blue-300"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    )}


                    {/* TABLE */}
                    {activeTab === "assign" && (
                        <div className="bg-white rounded-xl shadow border border-gray-300 w-full overflow-x-auto p-4">

                            <p className="text-gray-500 text-sm mb-4">
                                Total {totalComplaints} complaints
                            </p>
                            <p className="text-gray-500 text-sm mb-4">

                                Current Page {filteredComplaints.length} complaints
                            </p>

                            <DataTable
                                data={tableData1}
                                columns={tablecolumns}
                                catcher="_id"
                                isExportEnabled={true}
                                exportedFileName="Complaints"
                                exportedPdfName="Complaints Report"
                            />

                        </div>
                    )}

                    {assignModalOpen && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-[400px]">
                                <h3 className="text-lg font-bold mb-4">Assign Complaint</h3>

                                <select
                                    className="w-full border rounded px-3 py-2 mb-4"
                                    value={selectedAgent}
                                    onChange={(e) => setSelectedAgent(e.target.value)}
                                >
                                    <option value="">Select Employee</option>
                                    {agents.map((agent) => (
                                        <option key={agent._id} value={agent._id}>
                                            {agent.name} | {agent.email}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setAssignModalOpen(false)}
                                        className="px-4 py-2 bg-gray-200 rounded"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={confirmAssign}
                                        className="px-4 py-2 bg-blue-600 text-white rounded"
                                        disabled={!selectedAgent}
                                    >
                                        Assign
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewEditModalOpen && selectedComplaint && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl shadow-lg w-[95%] max-w-4xl max-h-[90vh] overflow-auto p-6">

                                {/* HEADER */}
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        Complaint Details
                                    </h3>
                                    <button onClick={() => setViewEditModalOpen(false)}>✕</button>
                                </div>

                                {/* FORM */}
                                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name
                                        </label>
                                        <input
                                            value={selectedComplaint.name || ""}
                                            readOnly
                                            className="w-full border rounded-md px-3 py-2 
                                            bg-gray-100 text-gray-700 
                                            cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Mobile */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mobile
                                        </label>
                                        <input
                                            value={selectedComplaint.mobile || ""}
                                            readOnly
                                            className="w-full border rounded-md px-3 py-2 
                                            bg-gray-100 text-gray-700 
                                            cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Subject
                                        </label>
                                        <input
                                            value={selectedComplaint.subject || ""}
                                            readOnly
                                            className="w-full border rounded-md px-3 py-2 
                                        bg-gray-100 text-gray-700 
                                        cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Department */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Department
                                        </label>
                                        <input
                                            value={selectedComplaint.designation?.title || selectedComplaint.designation || ""}
                                            readOnly
                                            className="w-full border rounded-md px-3 py-2 
                                            bg-gray-100 text-gray-700 
                                            cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Assigned To */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Assigned To
                                        </label>
                                        <input
                                            value={selectedComplaint.assignedTo?.name || "Unassigned"}
                                            readOnly
                                            className="w-full border rounded-md px-3 py-2 
                                              bg-gray-100 text-gray-700 
                                                cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <input
                                            value={selectedComplaint.status || ""}
                                            readOnly
                                            className="w-full border rounded-md px-3 py-2 
                                        bg-gray-100 text-gray-700 
                                        cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date
                                        </label>
                                        <input
                                            value={new Date(selectedComplaint.createdAt).toLocaleDateString()}
                                            readOnly
                                            className="w-full border rounded-md px-3 py-2 
                                            bg-gray-100 text-gray-700 
                                            cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Empty spacer for alignment */}
                                    <div></div>

                                    {/* Message */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Message
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={selectedComplaint.message || ""}
                                            readOnly
                                            className="w-full border rounded-md px-3 py-2 
                                        bg-gray-100 text-gray-700 
                                        cursor-not-allowed"
                                        />
                                    </div>


                                    {/* Attachments */}
                                    {selectedComplaint.attachments?.length > 0 && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Attachments
                                            </label>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                {selectedComplaint.attachments.map((file, index) => (
                                                    <div
                                                        key={index}
                                                        className="border rounded-lg p-3 bg-gray-50 flex flex-col items-center"
                                                    >
                                                        {/* IMAGE */}
                                                        <img
                                                            src={`${BaseURL}/complaints/${selectedComplaint._id}/attachment/${index}`}
                                                            alt={file.originalName}
                                                            className="h-32 object-contain rounded mb-2"
                                                        />

                                                        {/* FILE NAME */}
                                                        <p
                                                            className="text-sm text-gray-700 truncate w-full text-center"
                                                            title={file.originalName}
                                                        >
                                                            📎 {file.originalName}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {viewMode === "assign" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Assign To
                                            </label>

                                            <select
                                                value={selectedAgent}
                                                onChange={(e) => setSelectedAgent(e.target.value)}
                                                className="w-full border rounded-md px-3 py-2"
                                            >
                                                <option value="">Select Employee</option>
                                                {agents.map(agent => (
                                                    <option key={agent._id} value={agent._id}>
                                                        {agent.name} | {agent.email}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                </form>



                                {/* ACTIONS */}
                                <div className="flex justify-end mt-6 gap-3">
                                    <button

                                        onClick={() => setViewEditModalOpen(false)}
                                        className="px-4 py-2 border rounded-md hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    {/* <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                    onClick={handleUpdate}
                                >
                                    Update
                                </button> */}

                                    {viewMode === "assign" && (
                                        <button
                                            onClick={confirmAssign}
                                            disabled={!selectedAgent}
                                            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                                        >
                                            Assign
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}

                </div>
            </div>

        </>
    );
}

export default Supports
