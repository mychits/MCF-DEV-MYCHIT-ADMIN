
import { useState, useEffect } from "react";
import API from "../instance/TokenInstance";
import { notification } from "antd";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import { NavbarMenu } from "../data/menu";
import { CloudUpload } from "lucide-react";

function ComplaintForm() {
  const [api, contextHolder] = notification.useNotification();
  // const [designations, setDesignations] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const navigate = useNavigate();


  const designationCategories = {
    "Management & Leadership": [
      "Director",
      "Sales Manager",
      "Assistant Office Manager",
      "Senior Coordinator"
    ],
    "Sales & Collection": [
      "Sales with Collection",
      "Collection Procurement Executive"
    ],
    "Office & Administration": [
      "Front Office Executive",
      "Office Assistant"
    ],
    "Technical / IT": [
      "Full Stack Developer"
    ],
    "Creative": [
      "Graphic Designer"
    ],
    "OTHERS": [
      "others"
    ],
  };

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    subject: "",
    designation: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
    ];

    const validFiles = [];

    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        notify("warning", "Invalid File", "Only PDF, PNG, JPG allowed");
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        notify("warning", "File Too Large", "Max size 5MB");
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length) {
      setAttachments((prev) => [...prev, ...validFiles]);
    }
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

  /* ---------------- VALIDATION ---------------- */
  const validateForm = (existingData = []) => {
    const newErrors = {};
    if (!/^[A-Za-z\s]{1,15}$/.test(formData.name.trim())) {
      newErrors.name = "Name must contain only alphabets and max 15 characters";
    }


    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must start with 6-9 and be exactly 10 digits";
    }

    if (formData.subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters";
    }

    if (formData.message.trim().length < 5) {
      newErrors.message = "Description must be at least 5 characters";
    }

    const isDuplicate = existingData.some(
      (item) =>
        item.name === formData.name &&
        item.mobile === formData.mobile &&
        item.subject === formData.subject &&
        item.message === formData.message
    );

    if (isDuplicate) {
      alert("❌ Data already stored");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const submitComplaint = async (e) => {
    e.preventDefault();

    // 🚫 Prevent multiple clicks
    if (isSubmitting) return;

    if (!validateForm(submissions)) {
      notify("warning", "Invalid Input", "Please fix the highlighted fields");
      return;
    }

    try {
      setIsSubmitting(true); // 🔒 LOCK SUBMIT

      // await API.post('complaints/create', {
      //   userId: "123456",
      //   ...formData,
      // });

      const formPayload = new FormData();

      formPayload.append("userId", "123456");
      formPayload.append("name", formData.name);
      formPayload.append("mobile", formData.mobile);
      formPayload.append("subject", formData.subject);
      formPayload.append("designation", formData.designation);
      formPayload.append("message", formData.message);

      attachments.forEach((file) => {
        formPayload.append("attachments", file);
      });

      await API.post("complaints/create", formPayload);



      // Store locally to prevent frontend duplicates
      setSubmissions((prev) => [...prev, formData]);

      notify(
        "success",
        "Complaint Submitted",
        "Our support team will reply as soon as possible."
      );

      setFormData({
        name: "",
        mobile: "",
        subject: "",
        designation: "",
        message: "",
      });


      setErrors({});

      setTimeout(() => navigate("/help&support"), 1500);
    } catch (error) {
      if (error.response?.status === 409) {
        notify(
          "warning",
          "Duplicate Complaint",
          "This complaint has already been submitted"
        );
      } else {
        notify(
          "error",
          "Submission Failed",
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false); // 🔓 UNLOCK SUBMIT
    }
  };



  // useEffect(() => {
  //   const fetchDesignations = async () => {
  //     try {
  //       const res = await API.get("/designation/get-designation");
  //       setDesignations(res.data);
  //     } catch (error) {
  //       console.error("Failed to load designations", error);
  //     }
  //   };

  //   fetchDesignations();
  // }, []);


  return (
    <>
      {contextHolder}
      <Navbar />
      <div className="flex w-screen mt-14">
        <Sidebar />

        <div className="flex-col w-full p-4">

          {/* ---------------- FORM ---------------- */}
          <div className="min-h-screen flex items-start justify-center bg-gray-100 px-4 py-24">
            <div className="w-full max-w-xl bg-white rounded-xl shadow-md border p-8">
              <form onSubmit={submitComplaint} className="space-y-6">
                <h2 className="text-2xl font-semibold text-indigo-800 text-center">
                  Raise a Support Ticket
                </h2>

                {/* NAME */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="text-gray-600">Name</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={formData.name}
                      placeholder="Enter your Full Name"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value.replace(/[^A-Za-z\s]/g, ""),
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                </div>

                {/* MOBILE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="text-gray-600">Mobile</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="Enter your Mobile Number"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobile: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                    {errors.mobile && (
                      <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                    )}
                  </div>
                </div>

                {/* SUBJECT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="text-gray-600">Subject</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Enter your Subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                    {errors.subject && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.subject}
                      </p>
                    )}
                  </div>
                </div>

                {/* DESIGNATION / DEPARTMENT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="text-gray-600">Department</label>

                  <div className="col-span-2">
                    <select
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({ ...formData, designation: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2
                               focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      required
                    >
                      <option value="">Select Department</option>

                      {Object.keys(designationCategories).map((category) => (
                        <option
                          key={category}
                          value={category}
                          className="font-semibold"
                        >
                          {category}
                        </option>
                      ))}
                    </select>



                    {errors.designation && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.designation}
                      </p>
                    )}
                  </div>
                </div>


                {/* MESSAGE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="text-gray-600">Description</label>
                  <div className="col-span-2">
                    <textarea
                      rows="4"
                      placeholder="Describe your issue in detail"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* ATTACH DOCUMENT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="text-gray-600">Attachment</label>

                  <div className="col-span-2">
                    <label
                      htmlFor="attachment"
                      className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <CloudUpload size={40} className="text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700">Attach Documents</p>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG, JPEG (Max 5MB)
                      </p>

                      <input
                        id="attachment"
                        type="file"
                        multiple
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                      />
                    </label>

                    {attachments.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {attachments.map((file, index) => (
                          <li key={index} className="text-sm text-green-600">
                            📎 {file.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>



                {/* SUBMIT */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-2 rounded-lg font-medium transition
                                               ${isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"}`} >

                    {isSubmitting ? "Submitting..." : "Submit"}

                  </button>
                </div>
              </form>
            </div>
          </div>
        </div >
      </div >
    </>
  );
}

export default ComplaintForm;
