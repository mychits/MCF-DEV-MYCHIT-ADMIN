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
import CoApplicantPrint from "../components/printFormats/CoApplicantPrint";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { Link } from "react-router-dom";
import { fieldSize } from "../data/fieldSize";
import { IoMdClose } from "react-icons/io";

const CoApplicant = () => {
  const [users, setUsers] = useState([]);
  const [coApplicant, setCoApplicant] = useState([]);
  const [TableCoApplicant, setTableCoApplicant] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentCoApplicant, setCurrentCoApplicant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUpdateCoApplicant, setCurrentUpdateCoApplicant] =
    useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [enrollment, setEnrollment] = useState([]);
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });
  const [customRelationship, setCustomRelationship] = useState("");
  const [errors, setErrors] = useState({});
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);

  const [formData, setFormData] = useState({
    user_id: "",
    co_applicant_name: "",
    co_applicant_email: "",
    user_co_applicant: "",
    co_applicant_phone_number: "",
    co_applicant_address: "",
    co_applicant_pincode: "",
    co_applicant_adhaar_no: "",
    co_applicant_pan_no: "",
    co_applicant_gender: "",
    co_applicant_marital_status: "",
    co_applicant_dateofbirth: "",
    co_applicant_nationality: "",
    co_applicant_village: "",
    co_applicant_taluk: "",
    co_applicant_father_name: "",
    co_applicant_district: "",
    co_applicant_state: "",
    co_applicant_description: "",
    enrollment_ids: [],
    co_applicant_alternate_number: "",
    co_applicant_referred_type: "",
    co_applicant_document_name: "",
    co_applicant_document: "",
    co_applicant_photo: "",
    co_applicant_pan_document: "",
    co_applicant_aadhar_document: "",
    co_applicant_relationship_type: "",
    co_applicant_occupation: "",
    co_applicant_sector_name: "",
    co_applicant_income_document: "",
    co_applicant_consent_document: "",
    co_applicant_bank_name: "",
    co_applicant_bank_account_number: "",
    co_applicant_bank_branch: "",
    co_applicant_bank_ifsc_code: "",
    co_applicant_bank_passbook: "",
    co_applicant_bank_passbook_photo: "",
    co_applicant_bussiness_type: "",
    co_applicant_bussiness_name: "",
    co_applicant_bussiness_address: "",
    co_applicant_profession_type: "",
    co_applicant_agri_rtc_no: "",
    co_applicant_land_holdings: "",
    co_applicant_occupation_sub: "",
    co_applicant_all_document_name: "",
    co_applicant_all_document: "",
  });

  const [updateFormData, setUpdateFormData] = useState({
    user_id: "",
    co_applicant_name: "",
    co_applicant_email: "",
    user_co_applicant: "",
    co_applicant_phone_number: "",
    co_applicant_address: "",
    co_applicant_pincode: "",
    co_applicant_adhaar_no: "",
    co_applicant_pan_no: "",
    co_applicant_gender: "",
    co_applicant_marital_status: "",
    co_applicant_dateofbirth: "",
    co_applicant_nationality: "",
    co_applicant_village: "",
    co_applicant_taluk: "",
    co_applicant_father_name: "",
    co_applicant_district: "",
    co_applicant_state: "",
    co_applicant_description: "",
    co_applicant_alternate_number: "",
    enrollment_ids: [],
    co_applicant_referred_type: "",
    co_applicant_document: "",
    co_applicant_document_name: "",
    co_applicant_photo: "",
    co_applicant_pan_document: "",
    co_applicant_aadhar_document: "",
    co_applicant_relationship_type: "",
    co_applicant_occupation: "",
    co_applicant_sector_name: "",
    co_applicant_income_document: "",
    co_applicant_consent_document: "",
    co_applicant_bank_name: "",
    co_applicant_bank_account_number: "",
    co_applicant_bank_branch: "",
    co_applicant_bank_ifsc_code: "",
    co_applicant_bank_passbook: "",
    co_applicant_bank_passbook_photo: "",
    co_applicant_bussiness_type: "",
    co_applicant_bussiness_name: "",
    co_applicant_bussiness_address: "",
    co_applicant_profession_type: "",
    co_applicant_agri_rtc_no: "",
    co_applicant_land_holdings: "",
    co_applicant_occupation_sub: "",
    co_applicant_all_document_name: "",
    co_applicant_all_document: "",
  });

  const [searchText, setSearchText] = useState("");
  const GlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };
  const [extraDocs, setExtraDocs] = useState(
    formData.co_applicant_all_document || [
      { document_name: "", file: null, preview: "" },
    ]
  );
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

  const handleExtraDocNameChange = (index, e) => {
    const updated = [...extraDocs];
    updated[index].document_name = e.target.value;
    setExtraDocs(updated);
  };

  const handleExtraDocFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updated = [...extraDocs];
      updated[index].file = file;
      updated[index].preview = URL.createObjectURL(file);
      setExtraDocs(updated);
    }
  };

  //  Add/remove extra docs
  const addNewDocField = () => {
    setExtraDocs([
      ...extraDocs,
      { document_name: "", file: null, preview: "" },
    ]);
  };

  const removeDocField = (index) => {
    const updated = extraDocs.filter((_, i) => i !== index);
    setExtraDocs(updated);
    setFormData({ ...formData, co_applicant_all_document: updated });
  };

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
  const fetchCoApplicant = async () => {
    try {
      setIsLoading(true);

      // wait until users are available (important for Customer type)
      if (!users || users.length === 0) return;

      const response = await api.get("/coapplicant/get-co-applicant-info");
      const coapplicants = response.data?.coApplicant || [];

      const formattedData = coapplicants.map((group, index) => {
        // ---- Enrollment Summary ----
        const enrollmentSummary = (group?.enrollment_ids || [])
          .map((enroll) => {
            const groupName = enroll?.group_id?.group_name || "N/A";
            const ticket = enroll?.tickets || "N/A";
            return `${groupName} | Ticket: ${ticket}`;
          })
          .join(", ");

        // ---- Resolve Customer Details ----
        const customerUser =
          group?.co_applicant_referred_type === "Customer"
            ? users.find((u) => u._id === group?.user_co_applicant)
            : null;

        const coApplicantName =
          group?.co_applicant_referred_type === "Customer"
            ? customerUser?.full_name ?? "N/A"
            : group?.co_applicant_name ?? "N/A";

        const coApplicantPhone =
          group?.co_applicant_referred_type === "Customer"
            ? customerUser?.phone_number ?? "N/A"
            : group?.co_applicant_phone_number ?? "N/A";

        return {
          _id: group?._id,
          id: index + 1,
          user_id: group?.user_id?.full_name ?? "N/A",
          enrollment_summary: enrollmentSummary,
          co_applicant_referred_type: group?.co_applicant_referred_type,
          co_applicant_name: coApplicantName,
          co_applicant_phone_number: coApplicantPhone,
          co_applicant_description: group?.co_applicant_description ?? "-",

          action: (
            <div className="flex justify-center gap-2">
              <Dropdown
                trigger={["click"]}
                placement="bottomLeft"
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
                    {
                      key: "3",
                      label: (
                        <div
                          className="text-blue-600"
                          onClick={() => CoApplicantPrint(group?._id)}
                        >
                          Print
                        </div>
                      ),
                    },
                  ],
                }}
              >
                <IoMdMore className="cursor-pointer" />
              </Dropdown>
            </div>
          ),
        };
      });

      setCoApplicant(coapplicants);
      setTableCoApplicant(formattedData);
    } catch (error) {
      console.error(
        "Error fetching Co Applicant data:",
        error?.message || error
      );
    } finally {
      setIsLoading(false);
    }
  };

  fetchCoApplicant();
}, [reloadTrigger, users]);

  const handleAntDSelect = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    if (value !== "Other") {
      setCustomRelationship("");
    }

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
    const data = type === "addCoApplicant" ? formData : updateFormData;

    // Define a single regex object
    const regex = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[6-9]\d{9}$/,
      pincode: /^\d{6}$/,
      adhaar: /^\d{12}$/,
      pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    };

    // Helper function for file validation
    const validateFile = (file, name) => {
      if (!file) {
        return `${name} is required`;
      }
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (file instanceof File) {
        if (!allowedTypes.includes(file.type)) {
          return "Only JPG and PNG files are allowed";
        }
        if (file.size > 2 * 1024 * 1024) {
          return "File size must be less than 2MB";
        }
      } else if (typeof file === "string" && file.trim() === "") {
        return `${name} is required`;
      }
      return null;
    };

    // General validation for all types
    if (!data.user_id) newErrors.user_id = "Customer Name is required";
    if (!data.co_applicant_referred_type)
      newErrors.co_applicant_referred_type = "Referred Type is required";
    if (!data.enrollment_ids || data.enrollment_ids.length === 0)
      newErrors.enrollment_ids = "Enrollment is required";

    // Conditional validation based on referred type
    if (data.co_applicant_referred_type === "Customer") {
      if (!data.user_co_applicant)
        newErrors.user_co_applicant = "Referred Customer is required";
      if (!data.co_applicant_description?.trim())
        newErrors.co_applicant_description = "Description is required";
    } else if (data.co_applicant_referred_type === "Property") {
      if (!data.co_applicant_description?.trim())
        newErrors.co_applicant_description = "Description is required";
      if (!data.co_applicant_document_name?.trim())
        newErrors.co_applicant_document_name = "Document Name is required";
      let fileError = validateFile(
        data.co_applicant_document,
        "Property Document Photo"
      );
      if (fileError) newErrors.co_applicant_document = fileError;
    } else if (data.co_applicant_referred_type === "Third Party") {
      // Personal Information
      if (!data.co_applicant_name?.trim())
        newErrors.co_applicant_name = "Co Applicant Name is required";
      if (!data.co_applicant_relationship_type?.trim())
        newErrors.co_applicant_relationship_type =
          "Co Applicant Relationship is required";
      if (
        !data.co_applicant_phone_number ||
        !regex.phone.test(data.co_applicant_phone_number)
      ) {
        newErrors.co_applicant_phone_number = "Invalid Phone Number";
      }
      if (
        !data.co_applicant_email ||
        !regex.email.test(data.co_applicant_email)
      ) {
        newErrors.co_applicant_email = "Invalid Email";
      }
      if (!data.co_applicant_address?.trim())
        newErrors.co_applicant_address = "Address is required";
      if (
        !data.co_applicant_pincode ||
        !regex.pincode.test(data.co_applicant_pincode)
      ) {
        newErrors.co_applicant_pincode = "Invalid Pincode";
      }

      // KYC Documents
      if (
        !data.co_applicant_adhaar_no ||
        !regex.adhaar.test(data.co_applicant_adhaar_no)
      ) {
        newErrors.co_applicant_adhaar_no = "Invalid Aadhaar Number";
      }
      if (
        !data.co_applicant_pan_no ||
        !regex.pan.test(data.co_applicant_pan_no)
      ) {
        newErrors.co_applicant_pan_no =
          "Invalid PAN Capital Alphabet with Number";
      }
      let fileError = validateFile(data.co_applicant_photo, "Profile Photo");
      if (fileError) newErrors.co_applicant_photo = fileError;
      fileError = validateFile(
        data.co_applicant_pan_document,
        "PAN Card Photo"
      );
      if (fileError) newErrors.co_applicant_pan_document = fileError;
      fileError = validateFile(
        data.co_applicant_aadhar_document,
        "Aadhaar Card Photo"
      );
      if (fileError) newErrors.co_applicant_aadhar_document = fileError;

      // Occupation Details
      if (!data.co_applicant_occupation)
        newErrors.co_applicant_occupation = "Occupation is required";

      // Conditional validation for Occupation fields
      switch (data.co_applicant_occupation) {
        case "Self Employed":
        case "Salaried":
          if (!data.co_applicant_bussiness_type?.trim())
            newErrors.co_applicant_bussiness_type = "Business Type is required";
          if (!data.co_applicant_bussiness_name?.trim())
            newErrors.co_applicant_bussiness_name = "Business Name is required";
          if (!data.co_applicant_bussiness_address?.trim())
            newErrors.co_applicant_bussiness_address =
              "Business Address is required";
          break;
        case "Professional":
          if (!data.co_applicant_profession_type?.trim())
            newErrors.co_applicant_profession_type =
              "Profession Type is required";
          if (!data.co_applicant_bussiness_address?.trim())
            newErrors.co_applicant_bussiness_address =
              "Business Address is required";
          break;
        case "Agri Allied":
          if (!data.co_applicant_agri_rtc_no?.trim())
            newErrors.co_applicant_agri_rtc_no = "RTC Number is required";
          if (!data.co_applicant_land_holdings)
            newErrors.co_applicant_land_holdings = "Land Holdings is required";
          if (!data.co_applicant_bussiness_address?.trim())
            newErrors.co_applicant_bussiness_address =
              "Business Address is required";
          break;
        case "Other":
          if (!data.co_applicant_occupation_sub?.trim())
            newErrors.co_applicant_occupation_sub =
              "Occupation Sub-category is required";
          if (
            data.co_applicant_occupation_sub ===
              "Running an unregistered Business" &&
            !data.co_applicant_bussiness_address?.trim()
          ) {
            newErrors.co_applicant_bussiness_address =
              "Address is required for this occupation";
          }
          break;
        default:
          break;
      }
      fileError = validateFile(
        data.co_applicant_income_document,
        "Income Document Photo"
      );
      if (fileError) newErrors.co_applicant_income_document = fileError;

      // Bank Details
      if (!data.co_applicant_bank_name?.trim())
        newErrors.co_applicant_bank_name = "Bank Name is required";
      if (!data.co_applicant_bank_account_number?.trim())
        newErrors.co_applicant_bank_account_number =
          "Bank Account Number is required";
      if (!data.co_applicant_bank_branch?.trim())
        newErrors.co_applicant_bank_branch = "Bank Branch is required";
      if (!data.co_applicant_bank_ifsc_code?.trim())
        newErrors.co_applicant_bank_ifsc_code = "Bank IFSC Code is required";
      fileError = validateFile(
        data.co_applicant_bank_passbook_photo,
        "Bank Passbook Photo"
      );
      if (fileError) newErrors.co_applicant_bank_passbook_photo = fileError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isvalid = validateForm("addCoApplicant");
    if (isvalid) {
      try {
        const fmData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value instanceof File) {
            fmData.append(key, value); //  actual file
          } else if (Array.isArray(value)) {
            value.forEach((v) => fmData.append(`${key}[]`, v));
          } else if (value) {
            fmData.append(key, value);
          }
        });

        extraDocs.forEach((doc, i) => {
          if (doc.file) {
            fmData.append("co_applicant_all_document", doc.file); // file
            fmData.append(
              "document_name[]",
              doc.document_name || `Document_${i + 1}`
            ); // name separately
          }
        });

        const response = await api.post(
          "/coapplicant/add-co-applicant-info",
          //formData,
          fmData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          type: "success",
          message: "Co Applicant Added Successfully",
          visibility: true,
        });
        setShowModal(false);
        setFormData({
          user_id: "",
          co_applicant_name: "",
          co_applicant_email: "",
          user_co_applicant: "",
          co_applicant_phone_number: "",
          co_applicant_address: "",
          co_applicant_pincode: "",
          co_applicant_adhaar_no: "",
          co_applicant_pan_no: "",
          co_applicant_gender: "",
          co_applicant_marital_status: "",
          co_applicant_dateofbirth: "",
          co_applicant_nationality: "",
          co_applicant_village: "",
          co_applicant_taluk: "",
          co_applicant_father_name: "",
          co_applicant_district: "",
          co_applicant_state: "",
          co_applicant_description: "",
          enrollment_ids: [],
          co_applicant_alternate_number: "",
          co_applicant_referred_type: "",
          co_applicant_document: "",
          co_applicant_document_name: "",
          co_applicant_photo: "",
          co_applicant_pan_document: "",
          co_applicant_aadhar_document: "",
          co_applicant_relationship_type: "",
          co_applicant_occupation: "",
          co_applicant_income: "",
          co_applicant_consent_document: "",
          co_applicant_bank_name: "",
          co_applicant_bank_account_number: "",
          co_applicant_bank_branch: "",
          co_applicant_bank_ifsc_code: "",
          co_applicant_bank_passbook_photo: "",
          co_applicant_sector_name: "",
          co_applicant_income_document: "",
          co_applicant_bussiness_type: "",
          co_applicant_bussiness_name: "",
          co_applicant_bussiness_address: "",
          co_applicant_profession_type: "",
          co_applicant_agri_rtc_no: "",
          co_applicant_land_holdings: "",
          co_applicant_occupation_sub: "",
          co_applicant_all_document_name: "",
          co_applicant_all_document: "",
        });
      } catch (error) {
        console.error("Error adding Co Applicant:", error);
        setAlertConfig({
          type: "error",
          message:
            error?.response?.data?.message || "An unexpected error occurred.",
          visibility: true,
        });
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const fmData = new FormData();

      const { co_applicant_all_document, ...rest } = updateFormData;

      // Append non-file fields
      Object.entries(rest).forEach(([key, value]) => {
        if (value) fmData.append(key, value);
      });

      // Handle single file fields
      const singleFileFields = [
        "co_applicant_photo",
        "co_applicant_aadhar_document",
        "co_applicant_pan_document",
        "co_applicant_income_document",
        "co_applicant_bank_passbook_photo",
        "co_applicant_document",
      ];

      singleFileFields.forEach((field) => {
        if (updateFormData[field] instanceof File) {
          fmData.append(field, updateFormData[field]);
        }
      });

      // Handle multiple extra docs
      if (extraDocs && Array.isArray(extraDocs)) {
        extraDocs.forEach((doc, i) => {
          if (doc.file instanceof File) {
            fmData.append("co_applicant_all_document", doc.file); // file
            fmData.append(
              "document_name[]", // ✅ send as array
              doc.document_name || `Document_${i + 1}`
            );
          }
        });
      }

      await api.put(
        `/coapplicant/update-co-applicant-info/${currentUpdateCoApplicant?._id}`,
        fmData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setShowModalUpdate(false);
      setReloadTrigger((prev) => prev + 1);
      setAlertConfig({
        type: "success",
        message: "Co Applicant Updated Successfully",
        visibility: true,
      });
    } catch (error) {
      console.error("Error updating Co Applicant:", error);
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
    { key: "co_applicant_referred_type", header: "Referred Type" },
    { key: "enrollment_summary", header: "Enrollment Details" },
    { key: "co_applicant_name", header: "Co Applicant Name" },
    { key: "co_applicant_phone_number", header: "Co Applicant Phone Number" },
    { key: "action", header: "Action" },
  ];

  const filteredGuarantor = users.filter((users) =>
    users.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteModalOpen = async (userId) => {
    try {
      const response = await api.get(
        `/coapplicant/get-co-applicant-info-by-id/${userId}`
      );

      setCurrentCoApplicant(response.data?.coApplicant?._id || null);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching Co Applicant:", error);
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      setFormData((prev) => ({
        ...prev,
        [name]: file, // ✅ keep real file object
        [`${name}_preview`]: URL.createObjectURL(file), // for preview
      }));
    }
  };

    const handleInputFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      setFormData((prev) => ({
        ...prev,
        [name]: file, // ✅ keep real file object
        [`${name}_preview`]: URL.createObjectURL(file), // for preview
      }));
    }
  };

  const handleUpdateModalOpen = async (userId) => {
    try {
      const response = await api.get(
        `/coapplicant/get-co-applicant-info-by-id/${userId}`
      );
      const coapplicant = response?.data?.coApplicant;
      const matchedEnrollments = (coapplicant?.enrollment_ids || []).map(
        (e) => ({
          _id: e._id,
          group_name: e?.group_id?.group_name || "N/A",
          ticket: e?.tickets || "N/A",
        })
      );
      setFilteredEnrollments(matchedEnrollments);

      setUpdateFormData({
        user_id: coapplicant?.user_id?._id || "",
        enrollment_ids: coapplicant?.enrollment_ids?.map((e) => e._id) || [],
        co_applicant_name: coapplicant?.co_applicant_name || "",
        co_applicant_email: coapplicant?.co_applicant_email || "",
        co_applicant_phone_number: coapplicant?.co_applicant_phone_number || "",
        user_co_applicant: coapplicant?.user_co_applicant || "",
        co_applicant_address: coapplicant?.co_applicant_address || "",
        co_applicant_pincode: coapplicant?.co_applicant_pincode || "",
        co_applicant_adhaar_no: coapplicant?.co_applicant_adhaar_no || "",
        co_applicant_pan_no: coapplicant?.co_applicant_pan_no || "",
        co_applicant_gender: coapplicant?.co_applicant_gender || "",
        co_applicant_marital_status:
          coapplicant?.co_applicant_marital_status || "",
        co_applicant_dateofbirth: coapplicant?.co_applicant_dateofbirth || "",
        co_applicant_nationality: coapplicant?.co_applicant_nationality || "",
        co_applicant_village: coapplicant?.co_applicant_village || "",
        co_applicant_taluk: coapplicant?.co_applicant_taluk || "",
        co_applicant_father_name: coapplicant?.co_applicant_father_name || "",
        co_applicant_district: coapplicant?.co_applicant_district || "",
        co_applicant_state: coapplicant?.co_applicant_state || "",
        co_applicant_description: coapplicant?.co_applicant_description || "",
        co_applicant_alternate_number:
          coapplicant?.co_applicant_alternate_number,
        co_applicant_document: coapplicant?.co_applicant_document || "",
        co_applicant_document_name:
          coapplicant?.co_applicant_document_name || "",
        co_applicant_referred_type:
          coapplicant?.co_applicant_referred_type || "",
        co_applicant_photo: coapplicant?.co_applicant_photo || "",
        co_applicant_pan_document: coapplicant?.co_applicant_pan_document || "",
        co_applicant_aadhar_document:
          coapplicant?.co_applicant_aadhar_document || "",
        co_applicant_relationship_type:
          coapplicant?.co_applicant_relationship_type || "",
        co_applicant_occupation: coapplicant?.co_applicant_occupation || "",
        co_applicant_income: coapplicant?.co_applicant_income || "",
        co_applicant_consent_document:
          coapplicant?.co_applicant_consent_document || "",
        co_applicant_bank_name: coapplicant?.co_applicant_bank_name || "",
        co_applicant_bank_account_number:
          coapplicant?.co_applicant_bank_account_number || "",
        co_applicant_bank_branch: coapplicant?.co_applicant_bank_branch || "",
        co_applicant_bank_ifsc_code:
          coapplicant?.co_applicant_bank_ifsc_code || "",
        co_applicant_bank_passbook_photo:
          coapplicant?.co_applicant_bank_passbook_photo || "",
        co_applicant_income_document:
          coapplicant?.co_applicant_income_document || "",
        co_applicant_bussiness_type:
          coapplicant?.co_applicant_bussiness_type || "",
        co_applicant_bussiness_name:
          coapplicant?.co_applicant_bussiness_name || "",
        co_applicant_bussiness_address:
          coapplicant?.co_applicant_bussiness_address || "",
        co_applicant_profession_type:
          coapplicant?.co_applicant_profession_type || "",
        co_applicant_agri_rtc_no: coapplicant?.co_applicant_agri_rtc_no || "",
        co_applicant_land_holdings:
          coapplicant?.co_applicant_land_holdings || "",
        co_applicant_occupation_sub:
          coapplicant?.co_applicant_occupation_sub || "",
        co_applicant_all_document_name:
          coapplicant?.co_applicant_all_document_name || "",
        co_applicant_all_document: coapplicant?.co_applicant_all_document || "",
      });
      setExtraDocs(
        (coapplicant?.co_applicant_all_document || []).map((d) => ({
          document_name: d.document_name,
          file: null, // no new file yet
          preview: d.document_url, // show existing file preview
          existingUrl: d.document_url, // keep original in case user doesn’t replace
        }))
      );

      setCurrentUpdateCoApplicant(coapplicant);
      setShowModalUpdate(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching Co Applicant:", error);
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

  const handleDeleteCoApplicant = async () => {
    // console.log(currentCoApplicant,"current coapplicanyt")
    if (currentCoApplicant) {
      try {
        const response = await api.delete(
          `/coapplicant/delete-co-applicant-info-by-id/${currentCoApplicant}`
        );
        console.info(response, "snfbgsgb");

        setAlertConfig({
          visibility: true,
          message: "co applicant deleted successfully",
          type: "success",
        });
        setReloadTrigger((prev) => prev + 1);
        setShowModalDelete(false);
        setCurrentCoApplicant(null);
      } catch (error) {
        console.error("Error deleting Co Applicant:", error);
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
                <h1 className="text-2xl font-semibold">Co Applicant Application</h1>

                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add Co Applicant
                </button>
              </div>
            </div>
            {TableCoApplicant?.length > 0 && !isLoading ? (
              <DataTable
                catcher="_id"
                updateHandler={handleUpdateModalOpen}
                data={filterOption(TableCoApplicant, searchText)}
                columns={columns}
                exportedPdfName="CoApplicant"
                exportedFileName={`CoApplicant.csv`}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={TableCoApplicant.length <= 0}
                data="Co Applicant Data"
              />
            )}
          </div>
        </div>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Add Co Applicant
            </h3>
            <form
              className="space-y-6"
              method="POST"
              onSubmit={handleSubmit}
              enctype="multipart/form-data"
              noValidate
            >
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <Select
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  placeholder="Select Or Search Customer"
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
                    option?.children
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
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
                    if (en.group_name && en.group_name !== "N/A")
                      parts.push(en.group_name);
                    if (en.ticket && en.ticket !== "N/A")
                      parts.push(`Ticket: ${en.ticket}`);
                    return (
                      <Select.Option key={en._id} value={en._id}>
                        {parts.join(" | ")}
                      </Select.Option>
                    );
                  })}
                </Select>

                {errors.enrollment_ids && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.enrollment_ids}
                  </p>
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
                  name="co_applicant_referred_type"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={formData?.co_applicant_referred_type || undefined}
                  onChange={(value) =>
                    handleAntDSelect("co_applicant_referred_type", value)
                  }
                >
                  {["Customer", "Third Party", "Property"].map((refType) => (
                    <Select.Option key={refType} value={refType}>
                      {refType}
                    </Select.Option>
                  ))}
                </Select>
                {errors.co_applicant_referred_type && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.co_applicant_referred_type}
                  </p>
                )}
              </div>

              {formData.co_applicant_referred_type === "Customer" && (
                <div className="w-full">
                  <div className="w-full mb-4">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Select Co Applicant Customer{" "}
                      <span className="text-red-500 ">*</span>
                    </label>

                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                      placeholder="Select Or Search Referred Co Applicant"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="user_co_applicant"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={formData?.user_co_applicant || undefined}
                      onChange={(value) =>
                        handleAntDSelect("user_co_applicant", value)
                      }
                    >
                      {users.map((user) => (
                        <Select.Option key={user._id} value={user._id}>
                          {user.full_name}
                        </Select.Option>
                      ))}
                    </Select>
                    {errors.user_co_applicant && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.user_co_applicant}
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="desc"
                    >
                      Description <span className="text-red-500 ">*</span>
                    </label>
                    <Input
                      type="text"
                      name="co_applicant_description"
                      value={formData.co_applicant_description}
                      onChange={handleChange}
                      id="name"
                      placeholder="Enter the Description"
                      required
                      className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                    />
                    {errors.co_applicant_description && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.co_applicant_description}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {formData.co_applicant_referred_type === "Third Party" && (
                <div className="space-y-6 mt-6">
                  {/* Personal Information Card */}
                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      Personal Information
                    </h2>

                    {/* Guarantor Name & Phone */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Co Applicant Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_name"
                          value={formData.co_applicant_name}
                          onChange={handleChange}
                          placeholder="Enter Co Applicant Name"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                        {errors.co_applicant_name && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_name}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_phone_number"
                          value={formData.co_applicant_phone_number}
                          onChange={handleChange}
                          placeholder="Enter Phone Number"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                        {errors.co_applicant_phone_number && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_phone_number}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer Relationship */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-full">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Select Customer Relationship
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Customer Relationship"
                          showSearch
                          name="co_applicant_relationship_type"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={
                            formData.co_applicant_relationship_type || undefined
                          }
                          onChange={(value) =>
                            handleAntDSelect(
                              "co_applicant_relationship_type",
                              value
                            )
                          }
                        >
                          {["Father", "Spouse", "Other"].map((rel) => (
                            <Select.Option key={rel} value={rel}>
                              {rel}
                            </Select.Option>
                          ))}
                        </Select>
                        {errors.co_applicant_relationship_type && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_relationship_type}
                          </p>
                        )}
                      </div>

                      {formData.co_applicant_relationship_type === "Other" && (
                        <div className="w-full">
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Please specify the relationship:
                          </label>
                          <input
                            type="text"
                            className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                            placeholder="Enter custom relationship"
                            value={customRelationship}
                            onChange={(e) =>
                              setCustomRelationship(e.target.value)
                            }
                          />
                        </div>
                      )}
                    </div>

                    {/* Email & DOB */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Email
                        </label>
                        <Input
                          type="email"
                          name="co_applicant_email"
                          value={formData.co_applicant_email}
                          onChange={handleChange}
                          placeholder="Enter Email"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                        {errors.co_applicant_email && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_email}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Date of Birth
                        </label>
                        <Input
                          type="date"
                          name="co_applicant_dateofbirth"
                          value={
                            formData.co_applicant_dateofbirth
                              ? new Date(formData.co_applicant_dateofbirth)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={handleChange}
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* Marital Status & Gender */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Marital Status
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Marital Status"
                          showSearch
                          name="co_applicant_marital_status"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={
                            formData.co_applicant_marital_status || undefined
                          }
                          onChange={(value) =>
                            handleAntDSelect(
                              "co_applicant_marital_status",
                              value
                            )
                          }
                        >
                          {["Married", "Unmarried", "Widow", "Divorced"].map(
                            (status) => (
                              <Select.Option key={status} value={status}>
                                {status}
                              </Select.Option>
                            )
                          )}
                        </Select>
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Gender
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Gender"
                          showSearch
                          name="co_applicant_gender"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={formData.co_applicant_gender || undefined}
                          onChange={(value) =>
                            handleAntDSelect("co_applicant_gender", value)
                          }
                        >
                          {["Male", "Female"].map((g) => (
                            <Select.Option key={g} value={g}>
                              {g}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mt-4">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        name="co_applicant_address"
                        value={formData.co_applicant_address}
                        onChange={handleChange}
                        placeholder="Enter the Address"
                        required
                        className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                      />
                      {errors.co_applicant_address && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.co_applicant_address}
                        </p>
                      )}
                    </div>

                    {/* Village & Taluk */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Village
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_village"
                          value={formData.co_applicant_village}
                          onChange={handleChange}
                          placeholder="Enter Village"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Taluk
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_taluk"
                          value={formData.co_applicant_taluk}
                          onChange={handleChange}
                          placeholder="Enter Taluk"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* State & District */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          State
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select State"
                          showSearch
                          name="co_applicant_state"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={formData.co_applicant_state || undefined}
                          onChange={(value) =>
                            handleAntDSelect("co_applicant_state", value)
                          }
                        >
                          {["Karnataka", "Maharashtra", "Tamil Nadu"].map(
                            (state) => (
                              <Select.Option key={state} value={state}>
                                {state}
                              </Select.Option>
                            )
                          )}
                        </Select>
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          District
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_district"
                          value={formData.co_applicant_district}
                          onChange={handleChange}
                          placeholder="Enter District"
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* Pincode & Father Name */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_pincode"
                          value={formData.co_applicant_pincode}
                          onChange={handleChange}
                          placeholder="Enter Pincode"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_pincode && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_pincode}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Father Name
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_father_name"
                          value={formData.co_applicant_father_name}
                          onChange={handleChange}
                          placeholder="Enter Father Name"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* Nationality & Alternate Number */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Nationality
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Nationality"
                          showSearch
                          name="co_applicant_nationality"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={formData.co_applicant_nationality || undefined}
                          onChange={(value) =>
                            handleAntDSelect("co_applicant_nationality", value)
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
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Alternate Phone Number
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_alternate_number"
                          value={formData.co_applicant_alternate_number}
                          onChange={handleChange}
                          placeholder="Enter Alternate Number"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* KYC Documents Card */}
                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      KYC Documents
                    </h2>

                    {/* Aadhaar & PAN Number */}
                    <div className="flex flex-row justify-between space-x-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Aadhaar Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_adhaar_no"
                          value={formData.co_applicant_adhaar_no}
                          onChange={handleChange}
                          placeholder="Enter Aadhaar Number"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_adhaar_no && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_adhaar_no}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          PAN Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_pan_no"
                          value={formData.co_applicant_pan_no}
                          onChange={handleChange}
                          placeholder="Enter PAN Number"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_pan_no && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_pan_no}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Profile Photo <span className="text-red-500">*</span>
                      </label>

                      <div className="flex gap-6 items-start">
                        {/* Upload Box */}
                        <label
                          htmlFor="co_applicant_photo"
                          className="flex flex-col justify-center items-center w-56 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <svg
                            className="w-8 h-8 mb-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-5 4h.01"
                            />
                          </svg>
                          <p className="text-sm text-gray-500 text-center">
                            Click to upload <br />
                            <span className="text-xs">(PNG, JPG)</span>
                          </p>

                          <input
                            id="co_applicant_photo"
                            type="file"
                            name="co_applicant_photo"
                            onChange={handleFileChange}
                            accept="image/*"
                            required
                            className="hidden"
                          />
                        </label>

                        {/* Preview */}
                        {formData.co_applicant_photo_preview ? (
                          <Link to={formData.co_applicant_photo} download>
                            <img
                              src={formData.co_applicant_photo_preview}
                              alt="Profile Preview"
                              className="w-40 h-40 object-cover rounded-lg border shadow-sm"
                            />
                          </Link>
                        ) : (
                          <div className="w-40 h-40 flex items-center justify-center border rounded-lg text-gray-400 text-sm">
                            No Preview
                          </div>
                        )}
                      </div>

                      {/* Error */}
                      {errors.co_applicant_photo && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.co_applicant_photo}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-row justify-between space-x-4 mt-6">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          PAN Card Photo <span className="text-red-500">*</span>
                        </label>

                        <div className="flex gap-6 items-start">
                          <label
                            htmlFor="co_applicant_pan_document"
                            className="flex flex-col justify-center items-center w-56 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                          >
                            <p className="text-sm text-gray-500 text-center">
                              Click to upload <br />
                              <span className="text-xs">(PNG, JPG)</span>
                            </p>

                            <input
                              id="co_applicant_pan_document"
                              type="file"
                              name="co_applicant_pan_document"
                              onChange={handleFileChange}
                              accept="image/*"
                              required
                              className="hidden"
                            />
                          </label>

                          {formData.co_applicant_pan_document_preview ? (
                            <Link
                              to={formData.co_applicant_pan_document}
                              download
                            >
                              <img
                                src={formData.co_applicant_pan_document_preview}
                                className="w-40 h-40 object-cover rounded-lg border shadow-sm"
                              />
                            </Link>
                          ) : (
                            <div className="w-40 h-40 flex items-center justify-center border rounded-lg text-gray-400 text-sm">
                              No Preview
                            </div>
                          )}
                        </div>

                        {errors.co_applicant_pan_document && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_pan_document}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Aadhaar Card Photo{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <div className="flex gap-6 items-start">
                          <label
                            htmlFor="co_applicant_aadhar_document"
                            className="flex flex-col justify-center items-center w-56 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                          >
                            <p className="text-sm text-gray-500 text-center">
                              Click to upload <br />
                              <span className="text-xs">(PNG, JPG)</span>
                            </p>

                            <input
                              id="co_applicant_aadhar_document"
                              type="file"
                              name="co_applicant_aadhar_document"
                              onChange={handleFileChange}
                              accept="image/*"
                              required
                              className="hidden"
                            />
                          </label>

                          {formData.co_applicant_aadhar_document_preview ? (
                            <Link
                              to={formData.co_applicant_aadhar_document}
                              download
                            >
                              <img
                                src={
                                  formData.co_applicant_aadhar_document_preview
                                }
                                className="w-40 h-40 object-cover rounded-lg border shadow-sm"
                              />
                            </Link>
                          ) : (
                            <div className="w-40 h-40 flex items-center justify-center border rounded-lg text-gray-400 text-sm">
                              No Preview
                            </div>
                          )}
                        </div>

                        {errors.co_applicant_aadhar_document && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_aadhar_document}
                          </p>
                        )}
                      </div>
                    </div>

                    {/*  Extra Dynamic Documents Section */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">
                        Additional Documents
                      </h3>
                      {extraDocs.map((doc, index) => (
                        <div
                          key={index}
                          className="mb-6 p-3 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          {/* Row for inputs + remove button */}
                          <div className="flex items-center space-x-4">
                            <Input
                              type="text"
                              placeholder="Document Name (e.g. Passport, Voter ID)"
                              value={doc.document_name}
                              onChange={(e) =>
                                handleExtraDocNameChange(index, e)
                              }
                              className="w-1/2 h-12 border border-gray-300 rounded-lg p-2"
                            />
                            <input
                              type="file"
                              name="co_applicant_all_document" // ⚠️ must match multer config
                              onChange={(e) =>
                                handleExtraDocFileChange(index, e)
                              }
                              accept="image/*"
                              className="w-1/2 h-12 border border-gray-300 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeDocField(index)}
                              className="text-blue-600 font-bold text-xl"
                            >
                              <IoMdClose />
                            </button>
                          </div>

                          {/* Preview shown below */}
                          {doc.preview && (
                            <div className="mt-4">
                              <img
                                src={doc.preview}
                                alt={doc.document_name}
                                className="w-56 h-56 object-cover rounded-md shadow"
                              />
                            </div>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addNewDocField}
                        className="mt-2 px-2 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                      >
                        + Add Document
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      Occupation Details
                    </h2>

                    <div className="flex flex-row justify-between space-x-4">
                      {/* Left Column: Occupation & Dynamic Fields */}
                      <div className="w-full">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Co Applicant Occupation
                        </label>

                        {/* Main Occupation Select */}
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Occupation"
                          showSearch
                          value={formData.co_applicant_occupation || undefined}
                          onChange={(value) => {
                            // Reset related fields when occupation changes
                            setFormData((prev) => ({
                              ...prev,
                              co_applicant_occupation: value,
                              co_applicant_occupation_sub: "",
                              co_applicant_bussiness_type: "",
                              co_applicant_bussiness_name: "",
                              co_applicant_bussiness_address: "",
                              co_applicant_profession_type: "",
                              co_applicant_agri_rtc_no: "",
                              co_applicant_land_holdings: "",
                            }));
                          }}
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          {[
                            "Self Employed",
                            "Salaried",
                            "Professional",
                            "Agri Allied",
                            "Other",
                          ].map((occ) => (
                            <Select.Option key={occ} value={occ}>
                              {occ}
                            </Select.Option>
                          ))}
                        </Select>
                        {errors.co_applicant_occupation && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_occupation}
                          </p>
                        )}
                        {/* Sub-option for "Other" */}
                        {formData.co_applicant_occupation === "Other" && (
                          <>
                            <div className="mt-4 w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-900">
                                Please specify Occupation:
                              </label>
                              <Select
                                className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                placeholder="Select Sub-Category"
                                showSearch
                                value={
                                  formData.co_applicant_occupation_sub ||
                                  undefined
                                }
                                onChange={(value) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    co_applicant_occupation_sub: value,
                                  }))
                                }
                                filterOption={(input, option) =>
                                  option.children
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              >
                                {[
                                  "House Wife",
                                  "Retired",
                                  "Student",
                                  "Investment",
                                  "Running an unregistered Business",
                                ].map((sub) => (
                                  <Select.Option key={sub} value={sub}>
                                    {sub}
                                  </Select.Option>
                                ))}
                              </Select>
                              {errors.co_applicant_occupation_sub && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_occupation_sub}
                                </p>
                              )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_address"
                                value={formData.co_applicant_bussiness_address}
                                onChange={handleChange}
                                placeholder="Enter  Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_address && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_address}
                                </p>
                              )}
                            </div>
                          </>
                        )}

                        {/* Self Employed & Salaried: Business Type, Name, Address */}
                        {["Self Employed", "Salaried"].includes(
                          formData.co_applicant_occupation
                        ) && (
                          <div className="mt-4 space-y-4">
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Business Type
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_type"
                                value={formData.co_applicant_bussiness_type}
                                onChange={handleChange}
                                placeholder="e.g., Retail, Manufacturing"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_type && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_type}
                                </p>
                              )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Business Name
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_name"
                                value={formData.co_applicant_bussiness_name}
                                onChange={handleChange}
                                placeholder="Enter Business Name"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_name && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_name}
                                </p>
                              )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_address"
                                value={formData.co_applicant_bussiness_address}
                                onChange={handleChange}
                                placeholder="Enter Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_address && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_address}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Professional: Profession Type + Business Address */}
                        {formData.co_applicant_occupation ===
                          "Professional" && (
                          <div className="mt-4 space-y-4">
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Profession Type
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_profession_type"
                                value={formData.co_applicant_profession_type}
                                onChange={handleChange}
                                placeholder="e.g., Doctor, CA, Engineer"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_profession_type && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_profession_type}
                                </p>
                              )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_address"
                                value={formData.co_applicant_bussiness_address}
                                onChange={handleChange}
                                placeholder="Clinic/Office Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_address && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_address}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Agri Allied: RTC No, Land Holdings, Business Address */}
                        {formData.co_applicant_occupation === "Agri Allied" && (
                          <div className="mt-4 w-full space-y-4">
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                RTC No / Land Record ID
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_agri_rtc_no"
                                value={formData.co_applicant_agri_rtc_no}
                                onChange={handleChange}
                                placeholder="Enter RTC Number"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_agri_rtc_no && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_agri_rtc_no}
                                </p>
                              )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Land Holdings (in acres)
                              </label>
                              <Input
                                type="number"
                                name="co_applicant_land_holdings"
                                value={formData.co_applicant_land_holdings}
                                onChange={handleChange}
                                placeholder="e.g., 5.5"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_land_holdings && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_land_holdings}
                                </p>
                              )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_address"
                                value={formData.co_applicant_bussiness_address}
                                onChange={handleChange}
                                placeholder="Farm or Operation Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_address && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_address}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* For "Other" → Only show Business Address if "Running an unregistered Business" */}
                        {formData.co_applicant_occupation === "Other" &&
                          formData.co_applicant_occupation_sub ===
                            "Running an unregistered Business" && (
                            <div className=" w-full mt-4">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_address"
                                value={formData.co_applicant_bussiness_address}
                                onChange={handleChange}
                                placeholder="Enter Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_address && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_address}
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Document Upload Section */}
                    <div className="mt-6">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Salary / Income Document{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <div className="flex gap-6 items-start">
                        <label
                          htmlFor="co_applicant_income_document"
                          className="flex flex-col justify-center items-center w-56 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <p className="text-sm text-gray-500 text-center">
                            Click to upload <br />
                            <span className="text-xs">(PNG, JPG)</span>
                          </p>

                          <input
                            id="co_applicant_income_document"
                            type="file"
                            name="co_applicant_income_document"
                            onChange={handleFileChange}
                            accept="image/*"
                            required
                            className="hidden"
                          />
                        </label>

                        {formData.co_applicant_income_document_preview ? (
                          <Link
                            to={formData.co_applicant_income_document}
                            download
                          >
                            <img
                              src={
                                formData.co_applicant_income_document_preview
                              }
                              className="w-40 h-40 object-cover rounded-lg border shadow-sm"
                            />
                          </Link>
                        ) : (
                          <div className="w-40 h-40 flex items-center justify-center border rounded-lg text-gray-400 text-sm">
                            No Preview
                          </div>
                        )}
                      </div>

                      {errors.co_applicant_income_document && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.co_applicant_income_document}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bank Details Card */}
                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      Bank Details
                    </h2>

                    <div className="flex flex-row justify-between space-x-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank Name
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_bank_name"
                          value={formData.co_applicant_bank_name}
                          onChange={handleChange}
                          placeholder="Enter Bank Name"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_bank_name && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_bank_name}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank Account Number
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_bank_account_number"
                          value={formData.co_applicant_bank_account_number}
                          onChange={handleChange}
                          placeholder="Enter Account Number"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_bank_account_number && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_bank_account_number}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank Branch
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_bank_branch"
                          value={formData.co_applicant_bank_branch}
                          onChange={handleChange}
                          placeholder="Enter Branch"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_bank_branch && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_bank_branch}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank IFSC Code
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_bank_ifsc_code"
                          value={formData.co_applicant_bank_ifsc_code}
                          onChange={handleChange}
                          placeholder="Enter IFSC Code"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_bank_ifsc_code && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_bank_ifsc_code}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Bank Passbook <span className="text-red-500">*</span>
                      </label>

                      <div className="flex gap-6 items-start">
                        <label
                          htmlFor="co_applicant_bank_passbook_photo"
                          className="flex flex-col justify-center items-center w-56 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <p className="text-sm text-gray-500 text-center">
                            Click to upload <br />
                            <span className="text-xs">(PNG, JPG)</span>
                          </p>

                          <input
                            id="co_applicant_bank_passbook_photo"
                            type="file"
                            name="co_applicant_bank_passbook_photo"
                            onChange={handleFileChange}
                            accept="image/*"
                            required
                            className="hidden"
                          />
                        </label>

                        {formData.co_applicant_bank_passbook_photo_preview ? (
                          <Link
                            to={formData.co_applicant_bank_passbook_photo}
                            download
                          >
                            <img
                              src={
                                formData.co_applicant_bank_passbook_photo_preview
                              }
                              className="w-40 h-40 object-cover rounded-lg border shadow-sm"
                            />
                          </Link>
                        ) : (
                          <div className="w-40 h-40 flex items-center justify-center border rounded-lg text-gray-400 text-sm">
                            No Preview
                          </div>
                        )}
                      </div>

                      {errors.co_applicant_bank_passbook_photo && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.co_applicant_bank_passbook_photo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {formData.co_applicant_referred_type === "Property" && (
                <>
                  <div>
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="email"
                    >
                      Property Name <span className="text-red-500 ">*</span>
                    </label>
                    <Input
                      type="text"
                      name="co_applicant_document_name"
                      value={formData.co_applicant_document_name}
                      onChange={handleChange}
                      id="name"
                      placeholder="Enter the Description"
                      required
                      className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                    />
                    {errors.co_applicant_document_name && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.co_applicant_document_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Property Document <span className="text-red-500">*</span>
                    </label>

                    <div className="flex gap-6 items-start">
                      <label
                        htmlFor="co_applicant_document"
                        className="flex flex-col justify-center items-center w-56 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <p className="text-sm text-gray-500 text-center">
                          Click to upload <br />
                          <span className="text-xs">(PNG, JPG)</span>
                        </p>

                        <input
                          id="co_applicant_document"
                          type="file"
                          name="co_applicant_document"
                          onChange={handleFileChange}
                          accept="image/*"
                          required
                          className="hidden"
                        />
                      </label>

                      {formData.co_applicant_document_preview ? (
                        <Link to={formData.co_applicant_document} download>
                          <img
                            src={formData.co_applicant_document_preview}
                            className="w-40 h-40 object-cover rounded-lg border shadow-sm"
                          />
                        </Link>
                      ) : (
                        <div className="w-40 h-40 flex items-center justify-center border rounded-lg text-gray-400 text-sm">
                          No Preview
                        </div>
                      )}
                    </div>

                    {errors.co_applicant_document && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.co_applicant_document}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="email"
                    >
                      Description <span className="text-red-500 ">*</span>
                    </label>
                    <Input
                      type="text"
                      name="co_applicant_description"
                      value={formData.co_applicant_description}
                      onChange={handleChange}
                      id="name"
                      placeholder="Enter the Description"
                      required
                      className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                    />
                    {errors.co_applicant_description && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.co_applicant_description}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Save Co Applicant
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
              Update Co Applicant
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
                    if (en.group_name && en.group_name !== "N/A")
                      parts.push(en.group_name);
                    if (en.ticket && en.ticket !== "N/A")
                      parts.push(`Ticket: ${en.ticket}`);
                    return (
                      <Select.Option key={en._id} value={en._id}>
                        {parts.join(" | ")}
                      </Select.Option>
                    );
                  })}
                </Select>
                {errors.enrollment_ids && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.enrollment_ids}
                  </p>
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
                  name="co_applicant_referred_type"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={
                    updateFormData?.co_applicant_referred_type || undefined
                  }
                  onChange={(value) =>
                    handleAntInputDSelect("co_applicant_referred_type", value)
                  }
                >
                  {["Customer", "Third Party", "Property"].map((refType) => (
                    <Select.Option key={refType} value={refType}>
                      {refType}
                    </Select.Option>
                  ))}
                </Select>
                {errors.co_applicant_referred_type && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.co_applicant_referred_type}
                  </p>
                )}
              </div>

              {updateFormData.co_applicant_referred_type === "Customer" && (
                <div className="w-full">
                  <div className="w-full mb-4">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="category"
                    >
                      Select Co Applicant Customer{" "}
                      <span className="text-red-500 ">*</span>
                    </label>

                    <Select
                      className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                      placeholder="Select Or Search Referred Customer"
                      popupMatchSelectWidth={false}
                      showSearch
                      name="user_co_applicant"
                      filterOption={(input, option) =>
                        option.children
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={updateFormData?.user_co_applicant || undefined}
                      onChange={(value) =>
                        handleAntInputDSelect("user_co_applicant", value)
                      }
                    >
                      {users.map((user) => (
                        <Select.Option key={user._id} value={user._id}>
                          {user.full_name}
                        </Select.Option>
                      ))}
                    </Select>
                    {errors.user_co_applicant && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.user_co_applicant}
                      </p>
                    )}
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
                      name="co_applicant_description"
                      value={updateFormData.co_applicant_description}
                      onChange={handleInputChange}
                      id="name"
                      placeholder="Enter the Description"
                      required
                      className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                    />
                    {errors.co_applicant_description && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.co_applicant_description}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {updateFormData.co_applicant_referred_type === "Third Party" && (
                <div className="space-y-6 mt-6">
                  {/* Personal Information Card */}
                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      Personal Information
                    </h2>

                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Co Applicant Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_name"
                          value={updateFormData.co_applicant_name}
                          onChange={handleInputChange}
                          placeholder="Enter Co Applicant Name"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                        {errors.co_applicant_name && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_name}
                          </p>
                        )}
                      </div>

                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_phone_number"
                          value={updateFormData.co_applicant_phone_number}
                          onChange={handleInputChange}
                          placeholder="Enter Phone Number"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                        {errors.co_applicant_phone_number && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_phone_number}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer Relationship */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-full">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Select Customer Relationship
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Customer Relationship"
                          showSearch
                          name="co_applicant_relationship_type"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={
                            updateFormData.co_applicant_relationship_type ||
                            undefined
                          }
                          onChange={(value) =>
                            handleAntInputDSelect(
                              "co_applicant_relationship_type",
                              value
                            )
                          }
                        >
                          {["Father", "Spouse", "Other"].map((rel) => (
                            <Select.Option key={rel} value={rel}>
                              {rel}
                            </Select.Option>
                          ))}
                        </Select>
                        {errors.co_applicant_relationship_type && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_relationship_type}
                          </p>
                        )}
                      </div>

                      {updateFormData.co_applicant_relationship_type ===
                        "Other" && (
                        <div className="w-full">
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Please specify the relationship:
                          </label>
                          <input
                            type="text"
                            className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                            placeholder="Enter custom relationship"
                            value={customRelationship}
                            onChange={(e) =>
                              setCustomRelationship(e.target.value)
                            }
                          />
                        </div>
                      )}
                    </div>

                    {/* Email & DOB */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Email
                        </label>
                        <Input
                          type="email"
                          name="co_applicant_email"
                          value={updateFormData.co_applicant_email}
                          onChange={handleInputChange}
                          placeholder="Enter Email"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                        {errors.co_applicant_email && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_email}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Date of Birth
                        </label>
                        <Input
                          type="date"
                          name="co_applicant_dateofbirth"
                          value={
                            updateFormData.co_applicant_dateofbirth
                              ? new Date(
                                  updateFormData.co_applicant_dateofbirth
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={handleInputChange}
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* Marital Status & Gender */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Marital Status
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Marital Status"
                          showSearch
                          name="co_applicant_marital_status"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={
                            updateFormData.co_applicant_marital_status ||
                            undefined
                          }
                          onChange={(value) =>
                            handleAntInputDSelect(
                              "co_applicant_marital_status",
                              value
                            )
                          }
                        >
                          {["Married", "Unmarried", "Widow", "Divorced"].map(
                            (status) => (
                              <Select.Option key={status} value={status}>
                                {status}
                              </Select.Option>
                            )
                          )}
                        </Select>
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Gender
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Gender"
                          showSearch
                          name="co_applicant_gender"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={
                            updateFormData.co_applicant_gender || undefined
                          }
                          onChange={(value) =>
                            handleAntInputDSelect("co_applicant_gender", value)
                          }
                        >
                          {["Male", "Female"].map((g) => (
                            <Select.Option key={g} value={g}>
                              {g}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mt-4">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        name="co_applicant_address"
                        value={updateFormData.co_applicant_address}
                        onChange={handleInputChange}
                        placeholder="Enter the Address"
                        required
                        className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                      />
                      {errors.co_applicant_address && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.co_applicant_address}
                        </p>
                      )}
                    </div>

                    {/* Village & Taluk */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Village
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_village"
                          value={updateFormData.co_applicant_village}
                          onChange={handleInputChange}
                          placeholder="Enter Village"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Taluk
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_taluk"
                          value={updateFormData.co_applicant_taluk}
                          onChange={handleInputChange}
                          placeholder="Enter Taluk"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* State & District */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          State
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select State"
                          showSearch
                          name="co_applicant_state"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={updateFormData.co_applicant_state || undefined}
                          onChange={(value) =>
                            handleAntInputDSelect("co_applicant_state", value)
                          }
                        >
                          {["Karnataka", "Maharashtra", "Tamil Nadu"].map(
                            (state) => (
                              <Select.Option key={state} value={state}>
                                {state}
                              </Select.Option>
                            )
                          )}
                        </Select>
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          District
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_district"
                          value={updateFormData.co_applicant_district}
                          onChange={handleInputChange}
                          placeholder="Enter District"
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* Pincode & Father Name */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_pincode"
                          value={updateFormData.co_applicant_pincode}
                          onChange={handleInputChange}
                          placeholder="Enter Pincode"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_pincode && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_pincode}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Father Name
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_father_name"
                          value={updateFormData.co_applicant_father_name}
                          onChange={handleInputChange}
                          placeholder="Enter Father Name"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>

                    {/* Nationality & Alternate Number */}
                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Nationality
                        </label>
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Nationality"
                          showSearch
                          name="co_applicant_nationality"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          value={
                            updateFormData.co_applicant_nationality || undefined
                          }
                          onChange={(value) =>
                            handleAntInputDSelect(
                              "co_applicant_nationality",
                              value
                            )
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
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Alternate Phone Number
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_alternate_number"
                          value={updateFormData.co_applicant_alternate_number}
                          onChange={handleInputChange}
                          placeholder="Enter Alternate Number"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* KYC Documents Card */}
                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      KYC Documents
                    </h2>

                    {/* Aadhaar & PAN Number */}
                    <div className="flex flex-row justify-between space-x-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Aadhaar Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_adhaar_no"
                          value={updateFormData.co_applicant_adhaar_no}
                          onChange={handleInputChange}
                          placeholder="Enter Aadhaar Number"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_adhaar_no && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_adhaar_no}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          PAN Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_pan_no"
                          value={updateFormData.co_applicant_pan_no}
                          onChange={handleInputChange}
                          placeholder="Enter PAN Number"
                          required
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_pan_no && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_pan_no}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Profile Photo */}
                    <div className="mt-4 flex space-x-4">
                      <div className="w-1/2">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Profile Photo <span className="text-red-500">*</span>
                      </label>
                      <label
                          htmlFor="co_applicant_photo"
                          className="flex flex-col justify-center items-center w-56 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <svg
                            className="w-8 h-8 mb-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-5 4h.01"
                            />
                          </svg>
                          <p className="text-sm text-gray-500 text-center">
                            Click to upload <br />
                            <span className="text-xs">(PNG, JPG)</span>
                          </p>

                          <input
                            id="co_applicant_photo"
                            type="file"
                            name="co_applicant_photo"
                            onChange={handleInputFileChange}
                            accept="image/*"
                            required
                            className="hidden"
                          />
                        </label>
                      {errors.co_applicant_photo && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.co_applicant_photo}
                        </p>
                      )}
                      </div>
                      <div className="w-1/2">
                      {updateFormData.co_applicant_photo && (
                        <Link to={updateFormData.co_applicant_photo} download>
                          <img
                            src={updateFormData.co_applicant_photo}
                            alt="Profile"
                            className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                          />
                        </Link>
                      )}
                      </div>
                    </div>

                    {/* PAN & Aadhaar Docs */}
                    <div className="flex flex-row justify-between space-x-4 mt-6">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          PAN Card Photo <span className="text-red-500">*</span>
                        </label>
                       <label
                          htmlFor="co_applicant_pan_document"
                          className="flex flex-col justify-center items-center w-56 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <svg
                            className="w-8 h-8 mb-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-5 4h.01"
                            />
                          </svg>
                          <p className="text-sm text-gray-500 text-center">
                            Click to upload <br />
                            <span className="text-xs">(PNG, JPG)</span>
                          </p>

                          <input
                            id="co_applicant_pan_document"
                            type="file"
                            name="co_applicant_pan_document"
                            onChange={handleInputFileChange}
                            accept="image/*"
                            required
                            className="hidden"
                          />
                        </label>
                        {errors.co_applicant_pan_document && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_pan_document}
                          </p>
                        )}
                        {updateFormData.co_applicant_pan_document && (
                          <Link
                            to={updateFormData.co_applicant_pan_document}
                            download
                          >
                            <img
                              src={updateFormData.co_applicant_pan_document}
                              alt="PAN"
                              className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                            />
                          </Link>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Aadhaar Card Photo{" "}
                          <span className="text-red-500">*</span>
                        </label>
                       <label
                          htmlFor="co_applicant_aadhar_document"
                          className="flex flex-col justify-center items-center w-56 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <svg
                            className="w-8 h-8 mb-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-5 4h.01"
                            />
                          </svg>
                          <p className="text-sm text-gray-500 text-center">
                            Click to upload <br />
                            <span className="text-xs">(PNG, JPG)</span>
                          </p>

                          <input
                            id="co_applicant_aadhar_document"
                            type="file"
                            name="co_applicant_aadhar_document"
                            onChange={handleInputFileChange}
                            accept="image/*"
                            required
                            className="hidden"
                          />
                        </label>
                        {errors.co_applicant_aadhar_document && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_aadhar_document}
                          </p>
                        )}
                        {updateFormData.co_applicant_aadhar_document && (
                          <Link
                            to={updateFormData.co_applicant_aadhar_document}
                            download
                          >
                            <img
                              src={updateFormData.co_applicant_aadhar_document}
                              alt=""
                              className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                            />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/*  Extra Dynamic Documents Section */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">
                        Additional Documents
                      </h3>
                      {extraDocs.map((doc, index) => (
                        <div
                          key={index}
                          className="mb-6 p-3 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          {/* Row for inputs + remove button */}
                          <div className="flex items-center space-x-4">
                            <Input
                              type="text"
                              placeholder="Document Name (e.g. Passport, Voter ID)"
                              value={doc.document_name}
                              onChange={(e) =>
                                handleExtraDocNameChange(index, e)
                              }
                              className="w-1/2 h-12 border border-gray-300 rounded-lg p-2"
                            />
                            <input
                              type="file"
                              name="co_applicant_all_document" // ⚠️ must match multer config
                              onChange={(e) =>
                                handleExtraDocFileChange(index, e)
                              }
                              accept="image/*"
                              className="w-1/2 h-12 border border-gray-300 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeDocField(index)}
                              className="text-blue-600 font-bold text-xl"
                            >
                              <IoMdClose />
                            </button>
                          </div>

                          {/* Preview shown below */}
                          {doc.preview && (
                            <div className="mt-4">
                              <img
                                src={doc.preview}
                                alt={doc.document_name}
                                className="w-56 h-56 object-cover rounded-md shadow"
                              />
                            </div>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addNewDocField}
                        className="mt-2 px-2 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                      >
                        + Add Document
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      Occupation Details
                    </h2>

                    <div className="flex flex-row justify-between space-x-4">
                      {/* Left Column: Occupation & Dynamic Fields */}
                      <div className="w-full">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Co Applicant Occupation
                        </label>

                        {/* Main Occupation Select */}
                        <Select
                          className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                          placeholder="Select Occupation"
                          showSearch
                          value={
                            updateFormData.co_applicant_occupation || undefined
                          }
                          onChange={(value) => {
                            // Reset related fields when occupation changes
                            setUpdateFormData((prev) => ({
                              ...prev,
                              co_applicant_occupation: value,
                              co_applicant_occupation_sub: "",
                              co_applicant_bussiness_type: "",
                              co_applicant_bussiness_name: "",
                              co_applicant_bussiness_address: "",
                              co_applicant_profession_type: "",
                              co_applicant_agri_rtc_no: "",
                              co_applicant_land_holdings: "",
                            }));
                          }}
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          {[
                            "Self Employed",
                            "Salaried",
                            "Professional",
                            "Agri Allied",
                            "Other",
                          ].map((occ) => (
                            <Select.Option key={occ} value={occ}>
                              {occ}
                            </Select.Option>
                          ))}
                        </Select>
                        {errors.co_applicant_occupation && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_occupation}
                          </p>
                        )}

                        {/* Sub-option for "Other" */}
                        {updateFormData.co_applicant_occupation === "Other" && (
                          <>
                            <div className="mt-4 w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-900">
                                Please specify Occupation:
                              </label>
                              <Select
                                className="bg-gray-50 border h-14 border-gray-300 text-gray-900 text-sm rounded-lg w-full"
                                placeholder="Select Sub-Category"
                                showSearch
                                value={
                                  updateFormData.co_applicant_occupation_sub ||
                                  undefined
                                }
                                onChange={(value) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    co_applicant_occupation_sub: value,
                                  }))
                                }
                                filterOption={(input, option) =>
                                  option.children
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              >
                                {[
                                  "House Wife",
                                  "Retired",
                                  "Student",
                                  "Investment",
                                  "Running an unregistered Business",
                                ].map((sub) => (
                                  <Select.Option key={sub} value={sub}>
                                    {sub}
                                  </Select.Option>
                                ))}
                              </Select>
                              {errors.co_applicant_occupation_sub && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_occupation_sub}
                                </p>
                              )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_address"
                                value={
                                  updateFormData.co_applicant_bussiness_address
                                }
                                onChange={handleInputChange}
                                placeholder="Enter Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_address && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_address}
                                </p>
                              )}
                            </div>
                          </>
                        )}

                        {/* Self Employed & Salaried: Business Type, Name, Address */}
                        {["Self Employed", "Salaried"].includes(
                          updateFormData.co_applicant_occupation
                        ) && (
                          <div className="mt-4 space-y-4">
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Business Type
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_type"
                                value={
                                  updateFormData.co_applicant_bussiness_type
                                }
                                onChange={handleInputChange}
                                placeholder="e.g., Retail, Manufacturing"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_type && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_type}
                                </p>
                              )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Business Name
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_name"
                                value={
                                  updateFormData.co_applicant_bussiness_name
                                }
                                onChange={handleInputChange}
                                placeholder="Enter Business Name"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_name && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_name}
                                </p>
                              )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_address"
                                value={
                                  updateFormData.co_applicant_bussiness_address
                                }
                                onChange={handleInputChange}
                                placeholder="Enter Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_address && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_address}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Professional: Profession Type + Business Address */}
                        {updateFormData.co_applicant_occupation ===
                          "Professional" && (
                          <div className="mt-4 space-y-4">
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Profession Type
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_profession_type"
                                value={
                                  updateFormData.co_applicant_profession_type
                                }
                                onChange={handleInputChange}
                                placeholder="e.g., Doctor, CA, Engineer"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_profession_type && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_profession_type}
                                </p>
                              )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_address"
                                value={
                                  updateFormData.co_applicant_bussiness_address
                                }
                                onChange={handleInputChange}
                                placeholder="Clinic/Office Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_address && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_address}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Agri Allied: RTC No, Land Holdings, Business Address */}
                        {updateFormData.co_applicant_occupation ===
                          "Agri Allied" && (
                          <div className="mt-4 w-full space-y-4">
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                RTC No / Land Record ID
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_agri_rtc_no"
                                value={updateFormData.co_applicant_agri_rtc_no}
                                onChange={handleInputChange}
                                placeholder="Enter RTC Number"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_agri_rtc_no && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_agri_rtc_no}
                                </p>
                              )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Land Holdings (in acres)
                              </label>
                              <Input
                                type="number"
                                name="co_applicant_land_holdings"
                                value={
                                  updateFormData.co_applicant_land_holdings
                                }
                                onChange={handleInputChange}
                                placeholder="e.g., 5.5"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_land_holdings && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_land_holdings}
                                </p>
                              )}
                            </div>
                            <div className="w-full">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_address"
                                value={
                                  updateFormData.co_applicant_bussiness_address
                                }
                                onChange={handleInputChange}
                                placeholder="Farm or Operation Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_address && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_address}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* For "Other" → Only show Business Address if "Running an unregistered Business" */}
                        {updateFormData.co_applicant_occupation === "Other" &&
                          updateFormData.co_applicant_occupation_sub ===
                            "Running an unregistered Business" && (
                            <div className=" w-full mt-4">
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <Input
                                type="text"
                                name="co_applicant_bussiness_address"
                                value={
                                  updateFormData.co_applicant_bussiness_address
                                }
                                onChange={handleInputChange}
                                placeholder="Enter Address"
                                className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-3 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errors.co_applicant_bussiness_address && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.co_applicant_bussiness_address}
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Document Upload Section */}
                    <div className="mt-6 flex space-x-4">
                      <div className="w-1/2">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Salary/Income Document Photo{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <label
                          htmlFor="co_applicant_income_document"
                          className="flex flex-col justify-center items-center w-56 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <svg
                            className="w-8 h-8 mb-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-5 4h.01"
                            />
                          </svg>
                          <p className="text-sm text-gray-500 text-center">
                            Click to upload <br />
                            <span className="text-xs">(PNG, JPG)</span>
                          </p>

                          <input
                            id="co_applicant_income_document"
                            type="file"
                            name="co_applicant_income_document"
                            onChange={handleInputFileChange}
                            accept="image/*"
                            required
                            className="hidden"
                          />
                        </label>
                      {errors.co_applicant_income_document && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.co_applicant_income_document}
                        </p>
                      )}
                      </div>
                      <div className="w-1/2">
                      {updateFormData.co_applicant_income_document && (
                        <Link
                          to={updateFormData.co_applicant_income_document}
                          download
                        >
                          <img
                            src={updateFormData.co_applicant_income_document}
                            alt="Income Document"
                            className="w-56 h-56 object-cover mt-4 rounded-md shadow-md border"
                          />
                        </Link>
                      )}
                      </div>
                    </div>
                  </div>

                  {/* Bank Details Card */}
                  <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                      Bank Details
                    </h2>

                    <div className="flex flex-row justify-between space-x-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank Name
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_bank_name"
                          value={updateFormData.co_applicant_bank_name}
                          onChange={handleInputChange}
                          placeholder="Enter Bank Name"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_bank_name && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_bank_name}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank Account Number
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_bank_account_number"
                          value={
                            updateFormData.co_applicant_bank_account_number
                          }
                          onChange={handleInputChange}
                          placeholder="Enter Account Number"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_bank_account_number && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_bank_account_number}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row justify-between space-x-4 mt-4">
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank Branch
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_bank_branch"
                          value={updateFormData.co_applicant_bank_branch}
                          onChange={handleInputChange}
                          placeholder="Enter Branch"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_bank_branch && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_bank_branch}
                          </p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Bank IFSC Code
                        </label>
                        <Input
                          type="text"
                          name="co_applicant_bank_ifsc_code"
                          value={updateFormData.co_applicant_bank_ifsc_code}
                          onChange={handleInputChange}
                          placeholder="Enter IFSC Code"
                          className="bg-gray-50 border border-gray-300 h-14 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                        {errors.co_applicant_bank_ifsc_code && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.co_applicant_bank_ifsc_code}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-4">
                      <div className="w-1/2">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Bank Passbook <span className="text-red-500">*</span>
                      </label>
                     <label
                          htmlFor="co_applicant_bank_passbook_photo"
                          className="flex flex-col justify-center items-center w-56 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <svg
                            className="w-8 h-8 mb-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-5 4h.01"
                            />
                          </svg>
                          <p className="text-sm text-gray-500 text-center">
                            Click to upload <br />
                            <span className="text-xs">(PNG, JPG)</span>
                          </p>

                          <input
                            id="co_applicant_bank_passbook_photo"
                            type="file"
                            name="co_applicant_bank_passbook_photo"
                            onChange={handleInputFileChange}
                            accept="image/*"
                            required
                            className="hidden"
                          />
                        </label>
                      {errors.co_applicant_bank_passbook_photo && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.co_applicant_bank_passbook_photo}
                        </p>
                      )}
                      </div>
                      <div className="w-1/2">
                      {updateFormData.co_applicant_bank_passbook_photo && (
                        <Link
                          to={updateFormData.co_applicant_bank_passbook_photo}
                          download
                        >
                          <img
                            src={
                              updateFormData.co_applicant_bank_passbook_photo
                            }
                            alt="Passbook"
                            className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                          />
                        </Link>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {updateFormData.co_applicant_referred_type === "Property" && (
                <>
                  <div>
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="email"
                    >
                      Property Name <span className="text-red-500 ">*</span>
                    </label>
                    <Input
                      type="text"
                      name="co_applicant_document_name"
                      value={updateFormData.co_applicant_document_name}
                      onChange={handleInputChange}
                      id="name"
                      placeholder="Enter the Description"
                      required
                      className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                    />
                    {errors.co_applicant_document_name && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.co_applicant_document_name}
                      </p>
                    )}
                  </div>
                  <div className="mt-6 flex space-x-4">
                    <div className="w-1/2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="email"
                    >
                      Property Document <span className="text-red-500 ">*</span>
                    </label>
                   <label
                          htmlFor="co_applicant_document"
                          className="flex flex-col justify-center items-center w-56 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <svg
                            className="w-8 h-8 mb-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-5 4h.01"
                            />
                          </svg>
                          <p className="text-sm text-gray-500 text-center">
                            Click to upload <br />
                            <span className="text-xs">(PNG, JPG)</span>
                          </p>

                          <input
                            id="co_applicant_document"
                            type="file"
                            name="co_applicant_document"
                            onChange={handleInputFileChange}
                            accept="image/*"
                            required
                            className="hidden"
                          />
                        </label>
                    {errors.co_applicant_document && (
                      <p className="mt-2 text-sm text-red-600"> 
                        {errors.co_applicant_document}
                      </p>
                    )}
                    </div>
                    <div className="w-1/2">
                
                    {updateFormData.co_applicant_document && (
                      <Link to={updateFormData.co_applicant_document} download>
                        <img
                          src={updateFormData.co_applicant_document}
                          alt="Property"
                          className="w-56 h-56 object-cover mt-4 rounded-md shadow"
                        />
                      </Link>
                    )}
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
                      name="co_applicant_description"
                      value={updateFormData.co_applicant_description}
                      onChange={handleInputChange}
                      id="description"
                      placeholder="Enter the Description"
                      required
                      className={`bg-gray-50 border ${fieldSize.height} border-gray-300 text-gray-900 text-sm rounded-lg w-full`}
                    />
                    {errors.co_applicant_description && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.co_applicant_description}
                      </p>
                    )}
                  </div>
                </>
              )}

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
            setCurrentCoApplicant(null);
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Delete Co Applicant
            </h3>
            {currentCoApplicant && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeleteCoApplicant();
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
                      {currentCoApplicant?.co_applicant_name}
                    </span>{" "}
                    to confirm deletion.{" "}
                    <span className="text-red-500 ">*</span>
                  </label>
                  <Input
                    type="text"
                    id="groupName"
                    placeholder="Enter the Co Applicant Name"
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

export default CoApplicant;
