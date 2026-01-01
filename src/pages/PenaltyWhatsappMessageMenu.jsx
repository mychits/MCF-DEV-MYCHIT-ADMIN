import { Link } from "react-router-dom";
import Navbar from "../components/layouts/Navbar";
import Sidebar from "../components/layouts/Sidebar";
import { Users, Briefcase, ChevronRight,Zap  } from "lucide-react";
import { MdEmail } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { MdOutlineTextsms } from "react-icons/md";


const PenaltyWhatsappMessageMenu = () => {
  const penaltymarketingCategories = [
  
    {
      id: 1,
      title: "Penalty ",
      description: "Manage Penalty Whatsapp Message ",
      icon: <MdOutlineTextsms className="w-8 h-8" />,
      color: "from-blue-600 to-blue-700",
      lightColor: "bg-blue-50",
      borderColor: "border-blue-200",
      href: "/market-menu/whatsapp-marketing/penalty-whatsapp-marketing",
      stats: "Active penalty",
    },
   
   
     
  ];

  return (
    <div className="flex mt-20">
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Navbar visibility={true} />
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
               Penalty Whatsapp Management
              </h2>
              <p className="text-gray-600 mt-2">
                Manage and organize your Penalty Whatsapp Message Marketing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {penaltymarketingCategories.map((category) => (
                <Link key={category.id} to={category.href} className="group">
                  <div
                    className={`relative h-full overflow-hidden rounded-xl bg-white border ${category.borderColor} shadow-md hover:shadow-lg transition-all duration-300`}
                  >
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 rounded-full -mr-16 -mt-16 transition-all duration-300 blur-xl`}
                    />

                    <div className="relative p-7">
                      <div
                        className={`inline-flex items-center justify-center w-14 h-14 ${category.lightColor} rounded-lg mb-5 group-hover:scale-105 transition-transform duration-300`}
                      >
                        <div>{category.icon}</div>
                      </div>

                      <div className="mb-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-950 transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {category.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide group-hover:text-gray-700 transition-colors">
                          {category.stats}
                        </span>
                        <div
                          className={`p-1.5 rounded-lg bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition-all duration-300`}
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                    <div
                      className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                  </div>
                </Link>
              ))}
            </div>
              <div className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Zap className="w-6 h-6 text-blue-600 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Quick Tips</h3>
                <p className="text-slate-700">Manage Penalty Whatsapp Message with Marketing Management—everything in one place.</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenaltyWhatsappMessageMenu;
