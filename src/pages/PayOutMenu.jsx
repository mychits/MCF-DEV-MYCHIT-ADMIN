import Navbar from "../components/layouts/Navbar";
import Sidebar from "../components/layouts/Sidebar";
import { HiCurrencyRupee } from "react-icons/hi2";
import { Banknote, Briefcase, TicketCheck, MoreHorizontal, ChevronRight,Zap } from "lucide-react";
import { Link } from "react-router-dom";

const PayOutMenu = () => {
  const paymentOutMenuCategories = [
    {
      id: "#1",
      title: "Chit",
      description: "Manage customer chit payment out transaction information.",
      icon: <TicketCheck size={28} className="text-blue-600" />,
       color: "from-blue-600 to-blue-700",
          lightColor: "bg-blue-50",
          borderColor: "border-blue-200",
      href:"/payment-menu/payment-in-out-menu/general-payment-out/chit",
      stats: "Chit Payment Out Information"
    },
    {
      id: "#2",
      title: "Commission / Incentive",
      description: "Manage customer Commission / Incentive  payment out transaction information.",
      icon: <HiCurrencyRupee size={28} className="text-yellow-600" />,
       color: "from-blue-600 to-blue-700",
          lightColor: "bg-blue-50",
          borderColor: "border-blue-200",
       href:"/target-commission-incentive",
       stats: "Commission / Incentive Information"
    },
    {
      id: "#3",
      title: "Salary",
      description: "Manage Employee salary information.",
      icon: <Briefcase size={28} className="text-purple-600" />,
       color: "from-blue-600 to-blue-700",
          lightColor: "bg-blue-50",
          borderColor: "border-blue-200",
       href:"/payment-menu/payment-in-out-menu/payment-out/salary",
       stats: "Employee Salary Out Information"

    },
    {
      id: "#4",
      title: "Petty Cash",
      description: "Manage Petty Cash information.",
      icon: <Banknote size={28} className="text-yellow-600" />,
       color: "from-blue-600 to-blue-700",
          lightColor: "bg-blue-50",
          borderColor: "border-blue-200",
       href:"/payment-menu/payment-in-out-menu/payment-out/petty-cash",
       stats: "Petty cash Information"

    },
    {
      id: "#5",
      title: "Others",
      description: "Manage Others information.",
      icon: <MoreHorizontal size={28} className="text-gray-600" />,
       color: "from-blue-600 to-blue-700",
          lightColor: "bg-blue-50",
          borderColor: "border-blue-200",
       href:"/payment-menu/payment-in-out-menu/payment-out/others",
       stats: "Other payment out Information"

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
                Payment-Out Management
              </h2>
              <p className="text-gray-600 mt-2">
                Manage and view payment-Out information 
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {paymentOutMenuCategories.map((category) => (
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
                <p className="text-slate-700">Use the Chit directory to manage Chit payment out transaction details and view chit payment out information all in one place.</p>
                <p className="text-slate-700">Use the Commission / Incentive directory to manage Commission / Incentive transaction details and view Commission / Incentive information all in one place.</p>
                 <p className="text-slate-700">Use the Employee Salary directory to manage Employee Salary transaction details and view Salary payment out information all in one place.</p>
                  <p className="text-slate-700">Use the Petty Cash Payment directory to manage Petty Cash Payment transaction details and view Petty Cash payment information all in one place.</p>
                 <p className="text-slate-700">Use the Others Payment directory to manage  Payment transaction details and view payment out information all in one place.</p>
                
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayOutMenu;
