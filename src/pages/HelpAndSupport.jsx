import { useEffect, useState } from "react";
import axios from "axios";
import { notification, Pagination } from "antd";
import { Link } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import { NavbarMenu } from "../data/menu";

import { Phone, Mail, MessageCircle, Headset, Clock, MapPin } from "lucide-react";

function HelpAndSupport() {
  const [api, contextHolder] = notification.useNotification();

  const [activeTab, setActiveTab] = useState(null);

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
                onClick={() => setActiveTab(null)}
                className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
              >
                ← Back
              </button>
            )}

            <h2 className="text-2xl font-bold my-5">
              Help & Support – Home
            </h2>
            <Link
              to="/help-support"
              className="text-white bg-blue-800 text-sm font-medium px-4 py-2 rounded-md
                     hover:bg-blue-300 transition mx-2"
            >
              Raise Ticket
            </Link>
          </div>
          {/* SUPPORT INFO SECTION */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* SALES SUPPORT */}
            <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="text-blue-600" />
                <h3 className="font-semibold text-lg">Sales Support</h3>
              </div>
              <p className="text-slate-600 text-sm">For new sales & enquiries</p>
              <p className="mt-2 font-medium text-slate-900">+91 95131 88246</p>
            </div>

            {/* SERVICE SUPPORT */}
            <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <Headset className="text-green-600" />
                <h3 className="font-semibold text-lg">Service Support</h3>
              </div>
              <p className="text-slate-600 text-sm">Technical & service help</p>
              <p className="mt-2 font-medium text-slate-900">+91 95131 88246</p>
            </div>

            {/* EMAIL SUPPORT */}
            <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="text-purple-600" />
                <h3 className="font-semibold text-lg">Email Support</h3>
              </div>
              <p className="text-slate-600 text-sm">Write to us anytime</p>
              <p className="mt-2 font-medium text-slate-900">
                info.mychit@gmail.com
              </p>
            </div>

            {/* WHATSAPP SUPPORT */}
            <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="text-emerald-600" />
                <h3 className="font-semibold text-lg">WhatsApp</h3>
              </div>
              <p className="text-slate-600 text-sm">Chat with our team</p>
              <p className="mt-2 font-medium text-slate-900">
                +91 80736 65236
              </p>
            </div>



          </div>
          </div>

          <div className="mt-10 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 rounded-2xl p-6">

            <h3 className="text-xl font-bold text-slate-900 mb-5">
              Contact & Office Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* TIMINGS */}
              <div className="flex gap-4">
                <Clock className="w-6 h-6 text-amber-700 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900">Working Hours</p>
                  <p className="text-slate-700 text-sm">
                    Monday – Saturday
                  </p>
                  <p className="text-slate-700 text-sm">
                    9:30 AM – 6:30 PM
                  </p>
                </div>
              </div>

              {/* CONTACT NUMBERS */}
              <div className="flex gap-4">
                <Phone className="w-6 h-6 text-amber-700 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900">Contact Numbers</p>
                  <p className="text-slate-700 text-sm">
                    9845311238 | 9483900777
                  </p>
                  <p className="text-slate-700 text-sm">
                    7669865563
                  </p>
                </div>
              </div>

              {/* OFFICE ADDRESS */}
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-amber-700 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900">Office Address</p>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    MyChits Pvt. Ltd.<br />
                    Near Sathyanarayana Arch,<br />
                    Banashankari 3rd Stage,<br />
                    Bangalore
                  </p>
                </div>
              </div>

            </div>
          </div>


        </div>
      </div>

    </>
  );
}

export default HelpAndSupport;
