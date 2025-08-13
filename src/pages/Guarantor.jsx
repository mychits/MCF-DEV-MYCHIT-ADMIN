import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Input, Select, Dropdown } from "antd";
import { IoMdMore } from "react-icons/io";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";

import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { Link } from "react-router-dom";
import { fieldSize } from "../data/fieldSize";



const Guarantor = () => {
    const [users, setUsers] = useState([]);
    const [guarantor, setGuarantor] = useState([]);
    const [TableGuarantor, setTableGuarantor] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false);
    const [currentGuarantor, setCurrentGuarantor] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUpdateGuarantor, setCurrentUpdateGuarantor] = useState(null);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const [enrollment, setEnrollment] = useState([]);
    const [alertConfig, setAlertConfig] = useState({
        visibility: false,
        message: "Something went wrong!",
        type: "info",
    });
    const [errors, setErrors] = useState({});
    const [filteredEnrollments, setFilteredEnrollments] = useState([]);
    const [formData, setFormData] = useState({
        user_id: "",
        guarantor_name: "",
        guarantor_email: "",
        user_guarantor: "",
        guarantor_phone_number: "",
        guarantor_address: "",
        guarantor_pincode: "",
        guarantor_adhaar_no: "",
        guarantor_pan_no: "",
        guarantor_gender: "",
        guarantor_marital_status: "",
        guarantor_dateofbirth: "",
        guarantor_nationality: "",
        guarantor_village: "",
        guarantor_taluk: "",
        guarantor_father_name: "",
        guarantor_district: "",
        guarantor_state: "",
        guarantor_description: "",
        enrollment_ids: [],
        guarantor_alternate_number: "",
        guarantor_referred_type: "",

    });

    const [updateFormData, setUpdateFormData] = useState({
        user_id: "",
        guarantor_name: "",
        guarantor_email: "",
        user_guarantor: "",
        guarantor_phone_number: "",
        guarantor_address: "",
        guarantor_pincode: "",
        guarantor_adhaar_no: "",
        guarantor_pan_no: "",
        guarantor_gender: "",
        guarantor_marital_status: "",
        guarantor_dateofbirth: "",
        guarantor_nationality: "",
        guarantor_village: "",
        guarantor_taluk: "",
        guarantor_father_name: "",
        guarantor_district: "",
        guarantor_state: "",
        guarantor_description: "",
        guarantor_alternate_number: "",
        enrollment_ids: [],
        guarantor_referred_type: "",
    });

    const [searchText, setSearchText] = useState("");
    const GlobalSearchChangeHandler = (e) => {
        const { value } = e.target;
        setSearchText(value);
    };
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/user/get-user");

                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchEnrollmentData = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/enroll-report/get-enroll-report`);
                if (response.data) {
                    setEnrollment(response.data);
                }
            } catch (error) {
                console.error("Error fetching Enrollment data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEnrollmentData();
    }, []);

    useEffect(() => {
        const fetchGuarantor = async () => {
            try {
                setIsLoading(true);
                const response = await api.get("/guarantor/get-guarantor-info");
                console.info("guarantor", response.data);
                const guarantors = response.data?.guarantor || [];
                console.info("guarantor", response.data);
                setGuarantor(guarantors);
                const formattedData = guarantors.map((group, index) => {
         
                    const enrollmentDetails = (group?.enrollment_ids || []).map((enroll) => {
                        const groupName = enroll?.group_id?.group_name || "N/A";
                        const ticket = enroll?.tickets || "N/A";
                        return `${groupName} | Ticket: ${ticket}`;
                    });





                    const guarantor = users.find(u => u._id === group?.user_guarantor);
                    console.info("test-test", guarantor);
                    const guarantorName = group?.guarantor_referred_type === "Customer"
                        ? guarantor?.full_name || "N/A"
                        : group?.guarantor_name;

                    const guarantorPhone = group?.guarantor_referred_type === "Customer"
                        ? guarantor?.phone_number || "N/A"
                        : group?.guarantor_phone_number;

                    return {
                        _id: group?._id,
                        id: index + 1,
                        user_id: group?.user_id?.full_name,
                        enrollment_summary: enrollmentDetails.join(", "),
                        guarantor_referred_type: group?.guarantor_referred_type,
                        guarantor_name: guarantorName,
                        guarantor_phone_number: guarantorPhone,
                        guarantor_description: group?.guarantor_description,
                        action: (
                            <div className="flex justify-center gap-2">
                                <Dropdown
                                    trigger={["click"]}
                                    menu={{
                                        items: [
                                            {
                                                key: "1",
                                                label: (
                                                    <div
                                                        className="text-green-600"
                                                        onClick={() => handleUpdateModalOpen(group?._id)}
                                                    >
                                                        Edit
                                                    </div>
                                                ),
                                            },
                                            {
                                                key: "2",
                                                label: (
                                                    <div
                                                        className="text-red-600"
                                                        onClick={() => handleDeleteModalOpen(group?._id)}
                                                    >
                                                        Delete
                                                    </div>
                                                ),
                                            },
                                        ],
                                    }}
                                    placement="bottomLeft"
                                >
                                    <IoMdMore className="text-bold" />
                                </Dropdown>
                            </div>
                        ),
                    };
                });

                let fData = formattedData.map((ele) => {
                    if (
                        ele?.guarantor_address &&
                        typeof ele.guarantor_address === "string" &&
                        ele?.guarantor_address?.includes(",")
                    )
                        ele.guarantor_address = ele.guarantor_address.replaceAll(",", " ");
                    return ele;
                });
                if (!fData) setTableGuarantor(formattedData);
                if (!fData) setTableGuarantor(formattedData);
                setTableGuarantor(fData);
            } catch (error) {
                console.error("Error fetching Guarantor data:", error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGuarantor();
    }, [reloadTrigger]);


    const handleAntDSelect = (field, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));

        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: "",
        }));
    };
    const handleAntInputDSelect = (field, value) => {
        setUpdateFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));

        setErrors({ ...errors, [field]: "" });
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
        }));
    };



    const validateForm = (type) => {
        const newErrors = {};
        const data = type === "addGuarantor" ? formData : updateFormData;

        const regex = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[6-9]\d{9}$/,
            pincode: /^\d{6}$/,
            adhaar: /^\d{12}$/,
            pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        };


        if (!data.user_id) newErrors.user_id = "Customer Name is required";
        if (!data.guarantor_referred_type) newErrors.guarantor_referred_type = "Referred Type is required";
        if (!data.enrollment_ids || data.enrollment_ids.length === 0) newErrors.enrollment_ids = "Enrollment is required";


        if (data.guarantor_referred_type === "Customer") {
            if (!data.user_guarantor) newErrors.user_guarantor = "Referred Customer is required";
        }

        if (data.guarantor_referred_type === "Third Party") {
            if (!data.guarantor_name?.trim()) newErrors.guarantor_name = "Guarantor Name is required";

            if (!data.guarantor_phone_number) newErrors.guarantor_phone_number = "Phone Number is required";
            else if (!regex.phone.test(data.guarantor_phone_number)) newErrors.guarantor_phone_number = "Invalid Phone Number";

            if (data.guarantor_email && !regex.email.test(data.guarantor_email)) newErrors.guarantor_email = "Invalid Email format";

            if (!data.guarantor_adhaar_no) newErrors.guarantor_adhaar_no = "Adhaar Number is required";
            else if (!regex.adhaar.test(data.guarantor_adhaar_no)) newErrors.guarantor_adhaar_no = "Invalid Adhaar Number";

            if (!data.guarantor_pincode) newErrors.guarantor_pincode = "Pincode is required";
            else if (!regex.pincode.test(data.guarantor_pincode)) newErrors.guarantor_pincode = "Invalid Pincode";

            if (data.guarantor_pan_no && !regex.pan.test(data.guarantor_pan_no.toUpperCase())) newErrors.guarantor_pan_no = "Invalid PAN format";

            if (!data.guarantor_address?.trim()) newErrors.guarantor_address = "Address is required";
        }

        if (data.guarantor_referred_type === "Property") {
            if (!data.guarantor_description?.trim()) newErrors.guarantor_description = "Description is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const isvalid = validateForm("addGuarantor");
        if (isvalid) {
            try {
                const response = await api.post("/guarantor/add-guarantor-info", formData, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                setReloadTrigger(prev => prev + 1);
                setAlertConfig({
                    type: "success",
                    message: "Guarantor Added Successfully",
                    visibility: true,
                });
                setShowModal(false);
                setFormData({
                    user_id: "",
                    guarantor_name: "",
                    guarantor_email: "",
                    user_guarantor: "",
                    guarantor_phone_number: "",
                    guarantor_address: "",
                    guarantor_pincode: "",
                    guarantor_adhaar_no: "",
                    guarantor_pan_no: "",
                    guarantor_gender: "",
                    guarantor_marital_status: "",
                    guarantor_dateofbirth: "",
                    guarantor_nationality: "",
                    guarantor_village: "",
                    guarantor_taluk: "",
                    guarantor_father_name: "",
                    guarantor_district: "",
                    guarantor_state: "",
                    guarantor_description: "",
                    enrollment_ids: [],
                    guarantor_alternate_number: "",
                    guarantor_referred_type: "",
                });
            } catch (error) {
                console.error("Error adding Guarantor:", error);
                setAlertConfig({
                    type: "error",
                    message: error?.response?.data?.message || "An unexpected error occurred.",
                    visibility: true,
                });
            }
        }
    };


    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/guarantor/update-guarantor-info/${currentUpdateGuarantor?._id}`, updateFormData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            setShowModalUpdate(false);
            setReloadTrigger(prev => prev + 1);
            setAlertConfig({
                type: "success",
                message: "Guarantor Updated Successfully",
                visibility: true,
            });
        } catch (error) {
            console.error("Error updating Guarantor:", error);
            setAlertConfig({
                type: "error",
                message: error?.response?.data?.message || "Update failed",
                visibility: true,
            });
        }
    };


    const columns = [
        { key: "id", header: "SL. NO" },
        { key: "user_id", header: "Customer Name" },

        { key: "guarantor_referred_type", header: "Referred Type" },
        { key: "enrollment_summary", header: "Enrollment Details" },
        { key: "guarantor_name", header: "Guarantor Name" },
        { key: "guarantor_phone_number", header: "Guarantor Phone Number" },
        // { key: "guarantor_address", header: "Guarantor Address" },
        // { key: "guarantor_pincode", header: "Guarantor Pincode" },
        { key: "guarantor_description", header: "Guarantor Description" },
        { key: "action", header: "Action" },
    ];

    const filteredGuarantor = users.filter((users) =>
        users.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteModalOpen = async (userId) => {
        try {

            const response = await api.get(`/guarantor/get-guarantor-info-by-id/${userId}`);
            setCurrentGuarantor(response.data?.guarantor);
            setShowModalDelete(true);
        } catch (error) {
            console.error("Error fetching Guarantor:", error);
        }
    };


    const handleUpdateModalOpen = async (userId) => {
        try {
            const response = await api.get(`/guarantor/get-guarantor-info-by-id/${userId}`);
            const guarantor = response?.data?.guarantor;
            const matchedEnrollments = (guarantor?.enrollment_ids || []).map((e) => ({
                _id: e._id,
                group_name: e?.group_id?.group_name || "N/A",
                ticket: e?.tickets || "N/A",
            }));
            setFilteredEnrollments(matchedEnrollments);

            setUpdateFormData({
                user_id: guarantor?.user_id?._id || "",
                enrollment_ids: guarantor?.enrollment_ids?.map((e) => e._id) || [],
                guarantor_name: guarantor?.guarantor_name || "",
                guarantor_email: guarantor?.guarantor_email || "",
                guarantor_phone_number: guarantor?.guarantor_phone_number || "",
                user_guarantor: guarantor?.user_guarantor || "",
                guarantor_address: guarantor?.guarantor_address || "",
                guarantor_pincode: guarantor?.guarantor_pincode || "",
                guarantor_adhaar_no: guarantor?.guarantor_adhaar_no || "",
                guarantor_pan_no: guarantor?.guarantor_pan_no || "",
                guarantor_gender: guarantor?.guarantor_gender || "",
                guarantor_marital_status: guarantor?.guarantor_marital_status || "",
                guarantor_dateofbirth: guarantor?.guarantor_dateofbirth || "",
                guarantor_nationality: guarantor?.guarantor_nationality || "",
                guarantor_village: guarantor?.guarantor_village || "",
                guarantor_taluk: guarantor?.guarantor_taluk || "",
                guarantor_father_name: guarantor?.guarantor_father_name || "",
                guarantor_district: guarantor?.guarantor_district || "",
                guarantor_state: guarantor?.guarantor_state || "",
                guarantor_description: guarantor?.guarantor_description || "",
                guarantor_alternate_number: guarantor?.guarantor_alternate_number,

                guarantor_referred_type: guarantor?.guarantor_referred_type || "",
            });

            setCurrentUpdateGuarantor(guarantor);
            setShowModalUpdate(true);
            setErrors({});
        } catch (error) {
            console.error("Error fetching Guarantor:", error);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdateFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setErrors((prevData) => ({
            ...prevData,
            [name]: "",
        }));
    };

    const handleDeleteGuarantor = async () => {
        if (currentGuarantor) {
            try {
                await api.delete(`/guarantor/delete-guarantor-info-by-id/${currentGuarantor._id}`);
              
                setAlertConfig({
                    visibility: true,
                    message: "guarantor deleted successfully",
                    type: "success",
                });
                setReloadTrigger((prev) => prev + 1);
                setShowModalDelete(false);
                setCurrentGuarantor(null);
            } catch (error) {
                console.error("Error deleting Guarantor:", error);
            }
        }
    };





    return (
        <>
            <div>
                <div className="flex mt-20">
                    <Sidebar />
                    <Navbar
                        onGlobalSearchChangeHandler={GlobalSearchChangeHandler}
                        visibility={true}
                    />
                    <CustomAlertDialog
                        type={alertConfig.type}
                        isVisible={alertConfig.visibility}
                        message={alertConfig.message}
                        onClose={() =>
                            setAlertConfig((prev) => ({ ...prev, visibility: false }))
                        }
                    />

                    <div className="flex-grow p-7">
                        <div className="mt-6 mb-8">
                            <div className="flex justify-between items-center w-full">
                                <h1 className="text-2xl font-semibold">Guarantor</h1>

                                <button
                                    onClick={() => {
                                        setShowModal(true);
                                        setErrors({});
                                    }}
                                    className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                                >
                                    + Add Guarantor
                                </button>
                            </div>
                        </div>
                        {TableGuarantor?.length > 0 && !isLoading ? (
                            <DataTable
                                catcher="_id"
                                updateHandler={handleUpdateModalOpen}
                                data={filterOption(TableGuarantor, searchText)}
                                columns={columns}
                                exportedPdfName="Guarantor"
                                exportedFileName={`Guarantor-${TableGuarantor.length > 0
                                    ? TableGuarantor[0].name +
                                    " to " +
                                    TableGuarantor[TableGuarantor.length - 1].name
                                    : "empty"
                                    }.csv`}
                            />
                        ) : (
                            <CircularLoader
                                isLoading={isLoading}
                                failure={TableGuarantor.length <= 0}
                                data="Guarantor Data"
                            />
                        )}
                    </div>
                </div>
                <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
                    <div className="py-6 px-5 lg:px-8 text-left">
                        <h3 className="mb-4 text-xl font-bold text-gray-900">
                            Add Guarantor
                        </h3>
                        <form className="space-y-6" onSubmit={handleSubmit} noValidate>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">
                                    Guarantor Name <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                    placeholder="Select Or Search Guarantor"
                                    showSearch
                                    value={formData.user_id || undefined}
                                    onChange={(value) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            user_id: value,
                                            enrollment_ids: [],
                                        }));

                                        const filtered = enrollment
                                            .filter((e) => e.user_id?._id === value)
                                            .map((e) => ({
                                                _id: e._id,
                                                group_name: e.group_id?.group_name,
                                                ticket: e.tickets,
                                            }));

                                        setFilteredEnrollments(filtered);
                                    }}
                                    filterOption={(input, option) =>
                                        option?.children?.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {Array.from(
                                        new Map(
                                            enrollment
                                                .filter((e) => e.user_id && e.user_id.full_name?.trim())
                                                .map((e) => [e.user_id._id, e.user_id])
                                        ).values()
                                    ).map((user) => (
                                        <Select.Option key={user._id} value={user._id}>
                                            {user.full_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                                {errors.user_id && (
                                    <p className="mt-2 text-sm text-red-600">{errors.user_id}</p>
                                )}
                            </div>
                            <div className="mt-4">
                                <label className="block mb-2 text-sm font-medium text-gray-900">
                                    Select Enrollment <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    mode="tags"
                                    allowClear
                                    placeholder="Select enrollments"
                                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                    value={formData.enrollment_ids}

                                    onChange={(selectedEnrollmentIds) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            enrollment_ids: selectedEnrollmentIds,
                                        }));
                                    }}
                                    filterOption={(input, option) =>
                                        option?.label?.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {filteredEnrollments.map((en) => {
                                        const parts = [];
                                        if (en.group_name && en.group_name !== "N/A") parts.push(en.group_name);
                                        if (en.ticket && en.ticket !== "N/A") parts.push(`Ticket: ${en.ticket}`);
                                        return (
                                            <Select.Option key={en._id} value={en._id}>
                                                {parts.join(" | ")}
                                            </Select.Option>
                                        );
                                    })}
                                </Select>

                                {errors.enrollment_ids && (
                                    <p className="mt-2 text-sm text-red-600">{errors.enrollment_ids}</p>
                                )}
                            </div>


                            <div className="w-full">
                                <label
                                    className="block mb-2 text-sm font-medium text-gray-900"
                                    htmlFor="referred_type"
                                >
                                    Select Referred Type <span className="text-red-500 ">*</span>
                                </label>
                                <Select
                                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                    placeholder="Select Referred Type"
                                    popupMatchSelectWidth={false}
                                    showSearch
                                    name="guarantor_referred_type"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                    value={formData?.guarantor_referred_type || undefined}
                                    onChange={(value) => handleAntDSelect("guarantor_referred_type", value)}
                                >
                                    {[
                                        "Customer",
                                        "Third Party",
                                        "Property"].map((refType) => (
                                            <Select.Option key={refType} value={refType}>
                                                {refType}
                                            </Select.Option>
                                        ))}
                                </Select>
                                {errors.guarantor_referred_type && (
                                    <p className="mt-2 text-sm text-red-600">{errors.guarantor_referred_type}</p>
                                )}
                            </div>

                            {formData.guarantor_referred_type === "Customer" && (
                                <div className="w-full">
                                    <div className="w-full mb-4">
                                    <label
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                        htmlFor="category"
                                    >
                                        Select Guarantor Customer{" "}
                                        <span className="text-red-500 ">*</span>
                                    </label>

                                    <Select
                                        className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        placeholder="Select Or Search Referred Guarantor"
                                        popupMatchSelectWidth={false}
                                        showSearch
                                        name="user_guarantor"
                                        filterOption={(input, option) =>
                                            option.children
                                                .toString()
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        value={formData?.user_guarantor || undefined}
                                        onChange={(value) => handleAntDSelect("user_guarantor", value)}
                                    >
                                        {users.map((user) => (
                                            <Select.Option key={user._id} value={user._id}>
                                                {user.full_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                    </div>
                                    <div className="w-full">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="email"
                                        >
                                            Description <span className="text-red-500 ">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_description"
                                            value={formData.guarantor_description}
                                            onChange={handleChange}
                                            id="name"
                                            placeholder="Enter the Description"
                                            required
                                            className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                                        />
                                        {errors.guarantor_description && (
                                            <p className="mt-2 text-sm text-red-600">{errors.guarantor_description}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {formData.guarantor_referred_type === "Third Party" && (<>
                                <div className="flex flex-row justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="date"
                                        >
                                            Guarantor Name
                                        </label>
                                        <Input
                                            type="name"
                                            name="guarantor_name"
                                            value={formData.guarantor_name}
                                            onChange={handleChange}
                                            id="text"
                                            placeholder="Enter Guarantor Name"
                                            required
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />

                                    </div>
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="date"
                                        >
                                            Phone Number <span className="text-red-500 ">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_phone_number"
                                            value={formData.guarantor_phone_number}
                                            onChange={handleChange}
                                            id="text"
                                            placeholder="Enter Phone Number"
                                            required
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                        {errors.phone_number && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.guarantor_phone_number}
                                            </p>
                                        )}
                                    </div>

                                </div>

                                <div className="flex flex-row justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="Email"
                                        >
                                            Email
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_email"
                                            value={formData.guarantor_email}
                                            onChange={handleChange}
                                            id="Email"
                                            placeholder="Enter Email"
                                            required
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                        {errors.guarantor_email && (
                                            <p className="mt-2 text-sm text-red-600">{errors.guarantor_email}</p>
                                        )}
                                    </div>
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="date"
                                        >
                                            Adhaar Number <span className="text-red-500 ">*</span>
                                        </label>
                                        <Input
                                            type="number"
                                            name="guarantor_adhaar_no"
                                            value={formData.guarantor_adhaar_no}
                                            onChange={handleChange}
                                            id="text"
                                            placeholder="Enter Adhaar Number"
                                            required
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                        {errors.adhaar_no && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.guarantor_adhaar_no}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-row justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="pincode"
                                        >
                                            Pincode <span className="text-red-500 ">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_pincode"
                                            value={formData.guarantor_pincode}
                                            onChange={handleChange}
                                            id="pincode"
                                            placeholder="Enter Pincode"
                                            required
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                        {errors.pincode && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.pincode}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="date"
                                        >
                                            Pan Number <span className="text-red-500 ">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_pan_no"
                                            value={formData?.guarantor_pan_no}
                                            onChange={handleChange}
                                            id="text"
                                            placeholder="Enter Pan Number"
                                            required
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                        {errors.guarantor_pan_no && (
                                            <p className="mt-2 text-sm text-red-600">{errors.guarantor_pan_no}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                        htmlFor="Address"
                                    >
                                        Address <span className="text-red-500 ">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="guarantor_address"
                                        value={formData.guarantor_address}
                                        onChange={handleChange}
                                        id="Address"
                                        placeholder="Enter the Address"
                                        required
                                        className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                                    />
                                    {errors.address && (
                                        <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                                    )}
                                </div>


                                <div className="flex flex-row justify-between space-x-4">

                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="email"
                                        >
                                            Father Name
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_father_name"
                                            value={formData?.guarantor_father_name}
                                            onChange={handleChange}
                                            id="father-name"
                                            placeholder="Enter the Father name"
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="marital-status"
                                        >
                                            Marital Status
                                        </label>

                                        <Select
                                            className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                            placeholder="Select Marital Status"
                                            popupMatchSelectWidth={false}
                                            showSearch
                                            name="guarantor_marital_status"
                                            filterOption={(input, option) =>
                                                option.children
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                            value={formData?.guarantor_marital_status || undefined}
                                            onChange={(value) =>
                                                handleAntDSelect("guarantor_marital_status", value)
                                            }
                                        >
                                            {["Married", "Unmarried", "Widow", "Divorced"].map(
                                                (mStatus) => (
                                                    <Select.Option key={mStatus} value={mStatus}>
                                                        {mStatus}
                                                    </Select.Option>
                                                )
                                            )}
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex flex-row justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="date"
                                        >
                                             Date of Birth
                                        </label>
                                        <Input
                                            type="date"
                                            name="guarantor_dateofbirth"
                                            value={
                                                formData?.guarantor_dateofbirth
                                                    ? new Date(formData?.guarantor_dateofbirth || "")
                                                        .toISOString()
                                                        .split("T")[0]
                                                    : ""
                                            }
                                            onChange={handleChange}
                                            id="date"
                                            placeholder="Enter the Date of Birth"
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                    </div>

                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="gender"
                                        >
                                            Gender
                                        </label>


                                        <Select
                                            className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                            placeholder="Select Gender"
                                            popupMatchSelectWidth={false}
                                            showSearch
                                            name="guarantor_gender"
                                            filterOption={(input, option) =>
                                                option.children
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                            value={formData?.guarantor_gender || undefined}
                                            onChange={(value) => handleAntDSelect("guarantor_gender", value)}
                                        >
                                            {["Male", "Female"].map((gType) => (
                                                <Select.Option key={gType} value={gType}>
                                                    {gType}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex flex-row justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="nationality"
                                        >
                                            Nationality
                                        </label>

                                        <Select
                                            className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                            placeholder="Select Nationality"
                                            popupMatchSelectWidth={false}
                                            showSearch
                                            name="guarantor_nationality"
                                            filterOption={(input, option) =>
                                                option.children
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                            value={formData?.guarantor_nationality || undefined}
                                            onChange={(value) =>
                                                handleAntDSelect("guarantor_nationality", value)
                                            }
                                        >
                                            {["Indian", "Other"].map((nation) => (
                                                <Select.Option key={nation} value={nation}>
                                                    {nation}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="alternate-number"
                                        >
                                            Alternate Phone Number
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_alternate_number"
                                            value={formData?.guarantor_alternate_number}
                                            onChange={handleChange}
                                            id="alternate-number"
                                            placeholder="Enter the Alternate Phone number"
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-row justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="village"
                                        >
                                            Village
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_village"
                                            value={formData?.guarantor_village}
                                            onChange={handleChange}
                                            id="village"
                                            placeholder="Enter the Village"
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                    </div>

                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="taluk"
                                        >
                                            Taluk
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_taluk"
                                            value={formData?.guarantor_taluk}
                                            onChange={handleChange}
                                            id="taluk"
                                            placeholder="Enter the taluk"
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                    </div>
                                </div>


                                <div className="flex flex-row justify-between space-x-4">

                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="state"
                                        >
                                            State
                                        </label>

                                        <Select
                                            className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                            placeholder="Select State"
                                            showSearch
                                            name="guarantor_state"
                                            filterOption={(input, option) =>
                                                option.children
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                            value={formData?.guarantor_state || undefined}
                                            onChange={(value) => handleAntDSelect("guarantor_state", value)}
                                        >
                                            {["Karnataka", "Maharashtra", "Tamil Nadu"].map((state) => (
                                                <Select.Option key={state} value={state}>
                                                    {state}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </div>


                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="district"
                                        >
                                            District
                                        </label>

                                        {/* {formData?.state === "Karnataka" ? (
                                            <Select
                                                className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                                placeholder="Select District"
                                                showSearch
                                                name="guarantor_district"
                                                filterOption={(input, option) =>
                                                    option.children
                                                        .toLowerCase()
                                                        .includes(input.toLowerCase())
                                                }
                                                value={formData?.guarantor_district || undefined}
                                                onChange={(value) =>
                                                    handleAntDSelect("guarantor_district", value)
                                                }
                                            >
                                                <Select.Option value="">Select District</Select.Option>
                                                {districts.map((district, index) => (
                                                    <Select.Option key={index} value={district}>
                                                        {district}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        ) : (
                                            <Input
                                                type="text"
                                                name="district"
                                                value={formData?.guarantor_district}
                                                onChange={handleChange}
                                                placeholder="Enter District"
                                                className="w-full p-2 h-14 border rounded-md sm:text-lg text-sm bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                         )
                                        } */}
                                        <Input
                                            type="text"
                                            name="guarantor_district"
                                            value={formData?.guarantor_district}
                                            onChange={handleChange}
                                            placeholder="Enter District"
                                            className="w-full p-2 h-14 border rounded-md sm:text-lg text-sm bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </>
                            )}
                            {formData.guarantor_referred_type === "Property" && (<>
                                <div>
                                    <label
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                        htmlFor="email"
                                    >
                                        Description <span className="text-red-500 ">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="guarantor_description"
                                        value={formData.guarantor_description}
                                        onChange={handleChange}
                                        id="name"
                                        placeholder="Enter the Description"
                                        required
                                        className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                                    />
                                    {errors.guarantor_description && (
                                        <p className="mt-2 text-sm text-red-600">{errors.guarantor_description}</p>
                                    )}
                                </div>
                            </>)}

                            <div className="w-full flex justify-end">
                                <button
                                    type="submit"
                                    className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    Save Guarantor
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
                <Modal
                    isVisible={showModalUpdate}
                    onClose={() => setShowModalUpdate(false)}
                >
                    <div className="py-6 px-5 lg:px-8 text-left">
                        <h3 className="mb-4 text-xl font-bold text-gray-900">
                            Update Guarantor
                        </h3>
                        <form className="space-y-6" onSubmit={handleUpdate} noValidate>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">
                                    Customer Name <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                    placeholder="Select Or Search Customer"
                                    showSearch
                                    value={updateFormData.user_id || ""}
                                    onChange={(value) => {
                                        setUpdateFormData((prev) => ({
                                            ...prev,
                                            user_id: value,
                                            enrollment_ids: [], // reset selected enrollments
                                        }));

                                        const filtered = enrollment
                                            .filter((e) => e.user_id?._id === value)
                                            .map((e) => ({
                                                _id: e._id,
                                                group_name: e.group_id?.group_name,
                                                ticket: e.tickets,
                                            }));

                                        setFilteredEnrollments(filtered);
                                    }}
                                    filterOption={(input, option) =>
                                        option?.label?.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {enrollment
                                        .filter((e) => e.user_id && e.user_id.full_name?.trim()) // removes empty or invalid names
                                        .map((e) => (
                                            <Select.Option key={e.user_id._id} value={e.user_id._id}>
                                                {e.user_id.full_name}
                                            </Select.Option>
                                        ))}
                                </Select>
                            </div>
                            <div className="mt-4">
                                <label className="block mb-2 text-sm font-medium text-gray-900">
                                    Select Enrollment <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    mode="tags"
                                    allowClear
                                    placeholder="Select enrollments"
                                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                    value={updateFormData.enrollment_ids}
                                    onChange={(selectedEnrollmentIds) => {
                                        setUpdateFormData((prev) => ({
                                            ...prev,
                                            enrollment_ids: selectedEnrollmentIds,
                                        }));
                                    }}
                                    filterOption={(input, option) =>
                                        option?.label?.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {filteredEnrollments.map((en) => {
                                        const parts = [];
                                        if (en.group_name && en.group_name !== "N/A") parts.push(en.group_name);
                                        if (en.ticket && en.ticket !== "N/A") parts.push(`Ticket: ${en.ticket}`);
                                        return (
                                            <Select.Option key={en._id} value={en._id}>
                                                {parts.join(" | ")}
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </div>


                            <div className="w-full">
                                <label
                                    className="block mb-2 text-sm font-medium text-gray-900"
                                    htmlFor="referred_type"
                                >
                                    Select Referred Type <span className="text-red-500 ">*</span>
                                </label>
                                <Select
                                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                    placeholder="Select Referred Type"
                                    popupMatchSelectWidth={false}
                                    showSearch
                                    name="guarantor_referred_type"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                    value={updateFormData?.guarantor_referred_type || undefined}
                                    onChange={(value) => handleAntInputDSelect("guarantor_referred_type", value)}
                                >
                                    {[
                                        "Customer",
                                        "Third Party",
                                        "Property"].map((refType) => (
                                            <Select.Option key={refType} value={refType}>
                                                {refType}
                                            </Select.Option>
                                        ))}
                                </Select>
                            </div>

                            {updateFormData.guarantor_referred_type === "Customer" && (
                                <div className="w-full">

                                    <div className="w-full mb-4">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="category"
                                        >
                                            Select Guarantor Customer{" "}
                                            <span className="text-red-500 ">*</span>
                                        </label>

                                        <Select
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                            placeholder="Select Or Search Referred Customer"
                                            popupMatchSelectWidth={false}
                                            showSearch
                                            name="user_guarantor"
                                            filterOption={(input, option) =>
                                                option.children
                                                    .toString()
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                            value={updateFormData?.user_guarantor || undefined}
                                            onChange={(value) => handleAntInputDSelect("user_guarantor", value)}
                                        >
                                            {users.map((user) => (
                                                <Select.Option key={user._id} value={user._id}>
                                                    {user.full_name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="w-full">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="email"
                                        >
                                            Description <span className="text-red-500 ">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_description"
                                            value={updateFormData.guarantor_description}
                                            onChange={handleInputChange}
                                            id="name"
                                            placeholder="Enter the Description"
                                            required
                                            className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                                        />
                                        {errors.guarantor_description && (
                                            <p className="mt-2 text-sm text-red-600">{errors.guarantor_description}</p>
                                        )}
                                    </div>
                                </div>












                            )}
                            {updateFormData.guarantor_referred_type === "Third Party" && (<>
                                <div className="flex flex-row justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="date"
                                        >
                                            Guarantor Name
                                        </label>
                                        <Input
                                            type="name"
                                            name="guarantor_name"
                                            value={updateFormData.guarantor_name}
                                            onChange={handleInputChange}
                                            id="text"
                                            placeholder="Enter Guarantor Name"
                                            required
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />

                                    </div>
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="date"
                                        >
                                            Phone Number <span className="text-red-500 ">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_phone_number"
                                            value={updateFormData.guarantor_phone_number}
                                            onChange={handleInputChange}
                                            id="text"
                                            placeholder="Enter Phone Number"
                                            required
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                        {errors.phone_number && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.guarantor_phone_number}
                                            </p>
                                        )}
                                    </div>

                                </div>

                                <div className="flex flex-row justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="Email"
                                        >
                                            Email
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_email"
                                            value={updateFormData.guarantor_email}
                                            onChange={handleInputChange}
                                            id="Email"
                                            placeholder="Enter Email"
                                            required
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                        {errors.email && (
                                            <p className="mt-2 text-sm text-red-600">{errors.guarantor_email}</p>
                                        )}
                                    </div>
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="date"
                                        >
                                            Adhaar Number <span className="text-red-500 ">*</span>
                                        </label>
                                        <Input
                                            type="number"
                                            name="guarantor_adhaar_no"
                                            value={updateFormData.guarantor_adhaar_no}
                                            onChange={handleInputChange}
                                            id="text"
                                            placeholder="Enter Adhaar Number"
                                            required
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                        {errors.guarantor_adhaar_no && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.guarantor_adhaar_no}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-row justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="pincode"
                                        >
                                            Pincode <span className="text-red-500 ">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_pincode"
                                            value={updateFormData.guarantor_pincode}
                                            onChange={handleInputChange}
                                            id="pincode"
                                            placeholder="Enter Pincode"
                                            required
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                        {errors.guarantor_pincode && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.guarantor_pincode}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="date"
                                        >
                                            Pan Number <span className="text-red-500 ">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_pan_no"
                                            value={updateFormData?.guarantor_pan_no}
                                            onChange={handleInputChange}
                                            id="text"
                                            placeholder="Enter Pan Number"
                                            required
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                        {errors.guarantor_pan_no && (
                                            <p className="mt-2 text-sm text-red-600">{errors.guarantor_pan_no}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                        htmlFor="Address"
                                    >
                                        Address <span className="text-red-500 ">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="guarantor_address"
                                        value={updateFormData.guarantor_address}
                                        onChange={handleInputChange}
                                        id="Address"
                                        placeholder="Enter the Address"
                                        required
                                        className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                                    />
                                    {errors.guarantor_address && (
                                        <p className="mt-2 text-sm text-red-600">{errors.guarantor_address}</p>
                                    )}
                                </div>


                                <div className="flex flex-row justify-between space-x-4">

                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="email"
                                        >
                                            Father Name
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_father_name"
                                            value={updateFormData?.guarantor_father_name}
                                            onChange={handleInputChange}
                                            id="father-name"
                                            placeholder="Enter the Father name"
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="marital-status"
                                        >
                                            Marital Status
                                        </label>

                                        <Select
                                            className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                            placeholder="Select Marital Status"
                                            popupMatchSelectWidth={false}
                                            showSearch
                                            name="guarantor_marital_status"
                                            filterOption={(input, option) =>
                                                option.children
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                            value={updateFormData?.guarantor_marital_status || undefined}
                                            onChange={(value) =>
                                                handleAntInputDSelect("guarantor_marital_status", value)
                                            }
                                        >
                                            {["Married", "Unmarried", "Widow", "Divorced"].map(
                                                (mStatus) => (
                                                    <Select.Option key={mStatus} value={mStatus}>
                                                        {mStatus}
                                                    </Select.Option>
                                                )
                                            )}
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex flex-row justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="date"
                                        >
                                            Date of Birth
                                        </label>
                                        <Input
                                            type="date"
                                            name="guarantor_dateofbirth"
                                            value={
                                                updateFormData?.guarantor_dateofbirth
                                                    ? new Date(updateFormData?.guarantor_dateofbirth || "")
                                                        .toISOString()
                                                        .split("T")[0]
                                                    : ""
                                            }
                                            onChange={handleInputChange}
                                            id="date"
                                            placeholder="Enter the Date of Birth"
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                    </div>

                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="gender"
                                        >
                                            Gender
                                        </label>


                                        <Select
                                            className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                            placeholder="Select Gender"
                                            popupMatchSelectWidth={false}
                                            showSearch
                                            name="guarantor_gender"
                                            filterOption={(input, option) =>
                                                option.children
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                            value={updateFormData?.guarantor_gender || undefined}
                                            onChange={(value) => handleAntInputDSelect("guarantor_gender", value)}
                                        >
                                            {["Male", "Female"].map((gType) => (
                                                <Select.Option key={gType} value={gType}>
                                                    {gType}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex flex-row justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="nationality"
                                        >
                                            Nationality
                                        </label>

                                        <Select
                                            className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                            placeholder="Select Nationality"
                                            popupMatchSelectWidth={false}
                                            showSearch
                                            name="guarantor_nationality"
                                            filterOption={(input, option) =>
                                                option.children
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                            value={updateFormData?.guarantor_nationality || undefined}
                                            onChange={(value) =>
                                                handleAntInputDSelect("guarantor_nationality", value)
                                            }
                                        >
                                            {["Indian", "Other"].map((nation) => (
                                                <Select.Option key={nation} value={nation}>
                                                    {nation}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="alternate-number"
                                        >
                                            Alternate Phone Number
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_alternate_number"
                                            value={updateFormData?.guarantor_alternate_number}
                                            onChange={handleInputChange}
                                            id="alternate-number"
                                            placeholder="Enter the Alternate Phone number"
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-row justify-between space-x-4">
                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="village"
                                        >
                                            Village
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_village"
                                            value={updateFormData?.guarantor_village}
                                            onChange={handleInputChange}
                                            id="village"
                                            placeholder="Enter the Village"
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                    </div>

                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="taluk"
                                        >
                                            Taluk
                                        </label>
                                        <Input
                                            type="text"
                                            name="guarantor_taluk"
                                            value={updateFormData?.guarantor_taluk}
                                            onChange={handleInputChange}
                                            id="taluk"
                                            placeholder="Enter the taluk"
                                            className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                                        />
                                    </div>
                                </div>


                                <div className="flex flex-row justify-between space-x-4">

                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="state"
                                        >
                                            State
                                        </label>

                                        <Select
                                            className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                            placeholder="Select State"
                                            showSearch
                                            name="guarantor_state"
                                            filterOption={(input, option) =>
                                                option.children
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                            value={updateFormData?.guarantor_state || undefined}
                                            onChange={(value) => handleAntInputDSelect("guarantor_state", value)}
                                        >
                                            {["Karnataka", "Maharashtra", "Tamil Nadu"].map((state) => (
                                                <Select.Option key={state} value={state}>
                                                    {state}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </div>


                                    <div className="w-1/2">
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="district"
                                        >
                                            District
                                        </label>

                                        {/* {formData?.state === "Karnataka" ? (
                                            <Select
                                                className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                                placeholder="Select District"
                                                showSearch
                                                name="guarantor_district"
                                                filterOption={(input, option) =>
                                                    option.children
                                                        .toLowerCase()
                                                        .includes(input.toLowerCase())
                                                }
                                                value={formData?.guarantor_district || undefined}
                                                onChange={(value) =>
                                                    handleAntDSelect("guarantor_district", value)
                                                }
                                            >
                                                <Select.Option value="">Select District</Select.Option>
                                                {districts.map((district, index) => (
                                                    <Select.Option key={index} value={district}>
                                                        {district}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        ) : (
                                            <Input
                                                type="text"
                                                name="district"
                                                value={formData?.guarantor_district}
                                                onChange={handleChange}
                                                placeholder="Enter District"
                                                className="w-full p-2 h-14 border rounded-md sm:text-lg text-sm bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                         )
                                        } */}
                                        <Input
                                            type="text"
                                            name="guarantor_district"
                                            value={updateFormData?.guarantor_district}
                                            onChange={handleInputChange}
                                            placeholder="Enter District"
                                            className="w-full p-2 h-14 border rounded-md sm:text-lg text-sm bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                        htmlFor="description"
                                    >
                                        Description <span className="text-red-500 ">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="guarantor_description"
                                        value={updateFormData.guarantor_description}
                                        onChange={handleInputChange}
                                        id="description"
                                        placeholder="Enter the Description"
                                        required
                                        className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                                    />
                                    {errors.guarantor_description && (
                                        <p className="mt-2 text-sm text-red-600">{errors.guarantor_description}</p>
                                    )}
                                </div>
                            </>
                            )}
                            {updateFormData.guarantor_referred_type === "Property" && (<>
                                <div>
                                    <label
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                        htmlFor="description"
                                    >
                                        Description <span className="text-red-500 ">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="guarantor_description"
                                        value={updateFormData.guarantor_description}
                                        onChange={handleInputChange}
                                        id="description"
                                        placeholder="Enter the Description"
                                        required
                                        className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                                    />
                                    {errors.guarantor_description && (
                                        <p className="mt-2 text-sm text-red-600">{errors.guarantor_description}</p>
                                    )}
                                </div>
                            </>)}

                            <div className="w-full flex justify-end">
                                <button
                                    type="submit"
                                    className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
                <Modal
                    isVisible={showModalDelete}
                    onClose={() => {
                        setShowModalDelete(false);
                        setCurrentGuarantor(null);
                    }}
                >
                    <div className="py-6 px-5 lg:px-8 text-left">
                        <h3 className="mb-4 text-xl font-bold text-gray-900">
                            Delete Guarantor
                        </h3>
                        {currentGuarantor && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleDeleteGuarantor();
                                }}
                                className="space-y-6"
                            >
                                <div>
                                    <label
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                        htmlFor="groupName"
                                    >
                                        Please enter{" "}
                                        <span className="text-primary font-bold">
                                            {currentGuarantor.guarantor_name}
                                        </span>{" "}
                                        to confirm deletion.{" "}
                                        <span className="text-red-500 ">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        id="groupName"
                                        placeholder="Enter the Guarantor Name"
                                        required
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full text-white bg-red-700 hover:bg-red-800
          focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    Delete
                                </button>
                            </form>
                        )}
                    </div>
                </Modal>
            </div>
        </>
    );
};

export default Guarantor