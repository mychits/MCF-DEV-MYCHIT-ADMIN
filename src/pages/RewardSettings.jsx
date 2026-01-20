import {useState,useEffect} from 'react'
import api from '../instance/TokenInstance';
import Navbar from '../components/layouts/Navbar';
import DataTable from '../components/layouts/Datatable';
import Sidebar from '../components/layouts/Sidebar';
import CircularLoader from '../components/loaders/CircularLoader';
import SettingSidebar from '../components/layouts/SettingSidebar';


// const RewardSettings = () => {
//   const [settings, setSettings] = useState({
//     reward_point_value: "",
//     loan_reward_points: "",
//     pigmy_reward_points: "",
//     enrollment_divisor: "",
//   });

//   const [loading, setLoading] = useState(false);

//   /* ================= FETCH SETTINGS ================= */
//   const fetchSettings = async () => {
//     try {
//       const res = await api.get("/reward-points/reward-settings");

//       if (res.data?.success) {
//         setSettings(res.data.settings);
//       }
//     } catch (err) {
//       console.error("Failed to fetch reward settings", err);
//     }
//   };

//   useEffect(() => {
//     fetchSettings();
//   }, []);

//   /* ================= UPDATE SETTINGS ================= */
//   const updateSettings = async () => {
//     setLoading(true);
//     try {
//       const response = await api.put("/reward-points/reward-settings", {
//         reward_point_value: Number(settings.reward_point_value),
//         loan_reward_points: Number(settings.loan_reward_points),
//         pigmy_reward_points: Number(settings.pigmy_reward_points),
//         enrollment_divisor: Number(settings.enrollment_divisor),
//       });
//       console.info(response.data, "fhsgdfjhsgfsg");

//       alert("Reward settings updated successfully");
//       fetchSettings();
//     } catch (err) {
//       alert("Failed to update reward settings");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <Navbar visibility />
//       <div className="flex mt-20">
//         <SettingSidebar />

//         <div className="flex-grow p-7 max-w-xl">
//           <h1 className="text-2xl font-semibold mb-6">
//             Reward Settings
//           </h1>

//           <div className="border rounded p-6 bg-white shadow-sm space-y-4">
//             <InputField
//               label="Reward Point Value (₹)"
//               value={settings.reward_point_value}
//               onChange={(v) =>
//                 setSettings({ ...settings, reward_point_value: v })
//               }
//             />

//             <InputField
//               label="Loan Reward Points"
//               value={settings.loan_reward_points}
//               onChange={(v) =>
//                 setSettings({ ...settings, loan_reward_points: v })
//               }
//             />

//             <InputField
//               label="Pigmy Reward Points"
//               value={settings.pigmy_reward_points}
//               onChange={(v) =>
//                 setSettings({ ...settings, pigmy_reward_points: v })
//               }
//             />

//             <InputField
//               label="Enrollment Divisor"
//               value={settings.enrollment_divisor}
//               onChange={(v) =>
//                 setSettings({ ...settings, enrollment_divisor: v })
//               }
//             />

//             <button
//               onClick={updateSettings}
//               disabled={loading}
//               className="bg-blue-600 text-white px-6 py-2 rounded w-full"
//             >
//               {loading ? "Updating..." : "Update Settings"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


// const InputField = ({ label, value, onChange }) => (
//   <div>
//     <label className="text-sm text-gray-600">{label}</label>
//     <input
//       type="number"
//       className="border px-3 py-2 rounded w-full mt-1"
//       value={value ?? ""}
//       onChange={(e) => onChange(e.target.value)}
//     />
//   </div>
// );

// export default RewardSettings;


import { FiEdit2, FiSave, FiX, FiCheckCircle } from 'react-icons/fi';

// const RewardSettings = () => {
//   const [settings, setSettings] = useState({
//     reward_point_value: "",
//     loan_reward_points: "",
//     pigmy_reward_points: "",
//     enrollment_divisor: "",
//     auction_pay_reward_value: "",
//     payment_link_reward_value: "",
//     customer_referral_value: "",
//   });
  
//   const [tempSettings, setTempSettings] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [updateMessage, setUpdateMessage] = useState("");

//   /* ================= FETCH SETTINGS ================= */
//   const fetchSettings = async () => {
//     try {
//       const res = await api.get("/reward-points/reward-settings");
//       console.info(res, "gfjskgfsdgsdg");
//       if (res.data?.success) {
//         setSettings(res.data.settings);
//         setTempSettings(res.data.settings);
//       }
//     } catch (err) {
//       console.error("Failed to fetch reward settings", err);
//     }
//   };

//   useEffect(() => {
//     fetchSettings();
//   }, []);

//   /* ================= UPDATE SETTINGS ================= */
//   const updateSettings = async () => {
//     setLoading(true);
//     try {
//       const response = await api.put("/reward-points/reward-settings", {
//         reward_point_value: Number(tempSettings.reward_point_value),
//         loan_reward_points: Number(tempSettings.loan_reward_points),
//         pigmy_reward_points: Number(tempSettings.pigmy_reward_points),
//         enrollment_divisor: Number(tempSettings.enrollment_divisor),
//         auction_pay_reward_value: Number(tempSettings.auction_pay_reward_value),
//         payment_link_reward_value: Number(tempSettings.payment_link_reward_value),
//         customer_referral_value: Number(tempSettings.customer_referral_value),
//       });
      
//       if (response.data?.success) {
//         setSettings(tempSettings);
//         setIsEditing(false);
//         setUpdateMessage("Reward settings updated successfully!");
//         setShowSuccess(true);
//         setTimeout(() => setShowSuccess(false), 3000);
//       }
//     } catch (err) {
//       setUpdateMessage("Failed to update reward settings");
//       setShowSuccess(true);
//       setTimeout(() => setShowSuccess(false), 3000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = () => {
//     setTempSettings(settings);
//     setIsEditing(true);
//   };

//   const handleCancel = () => {
//     setTempSettings(settings);
//     setIsEditing(false);
//   };

//   const handleInputChange = (field, value) => {
//     setTempSettings({ ...tempSettings, [field]: value });
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <Navbar visibility />
//       <div className="flex mt-20">
//         <SettingSidebar />

//         <div className="flex-grow p-7">
//           <div className="max-w-5xl mx-auto">
//             <div className="flex justify-between items-center mb-6">
//               <h1 className="text-3xl font-bold text-gray-800">
//                 Reward Points 
//               </h1>
//               {!isEditing && (
//                 <button
//                   onClick={handleEdit}
//                   className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   <FiEdit2 />
//                   Edit Settings
//                 </button>
//               )}
//             </div>

//             {/* Success Message */}
//             {showSuccess && (
//               <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
//                 updateMessage.includes("successfully") 
//                   ? "bg-green-100 text-green-700 border border-green-200" 
//                   : "bg-red-100 text-red-700 border border-red-200"
//               }`}>
//                 <FiCheckCircle />
//                 {updateMessage}
//               </div>
//             )}

//             {/* Reward Points Table */}
//             <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//               <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5">
//                 <h2 className="text-xl font-semibold">Current Reward Points Settings</h2>
//                 <p className="text-blue-100 mt-1">Manage your reward points configuration</p>
//               </div>
              
//               <div className="p-6">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b border-gray-200">
//                       <th className="text-left py-3 px-4 font-semibold text-gray-700">Setting</th>
//                       <th className="text-left py-3 px-4 font-semibold text-gray-700">Value</th>
//                       <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr className="border-b border-gray-100 hover:bg-gray-50">
//                       <td className="py-4 px-4 font-medium text-gray-800">Pigmy Reward Points</td>
//                       <td className="py-4 px-4">
//                         {isEditing ? (
//                           <input
//                             type="number"
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             value={tempSettings.pigmy_reward_points ?? ""}
//                             onChange={(e) => handleInputChange("pigmy_reward_points", e.target.value)}
//                           />
//                         ) : (
//                           <span className="text-xl font-bold text-blue-600">{settings.pigmy_reward_points}</span>
//                         )}
//                       </td>
//                       <td className="py-4 px-4 text-gray-600">Points awarded for pigmy enrollments</td>
//                     </tr>
                    
//                     <tr className="border-b border-gray-100 hover:bg-gray-50">
//                       <td className="py-4 px-4 font-medium text-gray-800">Loan Reward Points</td>
//                       <td className="py-4 px-4">
//                         {isEditing ? (
//                           <input
//                             type="number"
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             value={tempSettings.loan_reward_points ?? ""}
//                             onChange={(e) => handleInputChange("loan_reward_points", e.target.value)}
//                           />
//                         ) : (
//                           <span className="text-xl font-bold text-blue-600">{settings.loan_reward_points}</span>
//                         )}
//                       </td>
//                       <td className="py-4 px-4 text-gray-600">Points awarded for each loan join</td>
//                     </tr>
                    
//                     <tr className="border-b border-gray-100 hover:bg-gray-50">
//                       <td className="py-4 px-4 font-medium text-gray-800">Reward Point Value</td>
//                       <td className="py-4 px-4">
//                         {isEditing ? (
//                           <div className="flex items-center">
//                             <span className="mr-2 text-gray-600">₹</span>
//                             <input
//                               type="number"
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                               value={tempSettings.reward_point_value ?? ""}
//                               onChange={(e) => handleInputChange("reward_point_value", e.target.value)}
//                             />
//                           </div>
//                         ) : (
//                           <div className="flex items-center">
//                             <span className="text-xl font-bold text-green-600">₹{settings.reward_point_value}</span>
//                             <span className="ml-2 text-sm text-gray-500">per point</span>
//                           </div>
//                         )}
//                       </td>
//                       <td className="py-4 px-4 text-gray-600">Monetary value of each reward point</td>
//                     </tr>
                    
//                     <tr className="hover:bg-gray-50">
//                       <td className="py-4 px-4 font-medium text-gray-800">Enrollment Divisor</td>
//                       <td className="py-4 px-4">
//                         {isEditing ? (
//                           <input
//                             type="number"
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             value={tempSettings.enrollment_divisor ?? ""}
//                             onChange={(e) => handleInputChange("enrollment_divisor", e.target.value)}
//                           />
//                         ) : (
//                           <span className="text-xl font-bold text-blue-600">{settings.enrollment_divisor}</span>
//                         )}
//                       </td>
//                       <td className="py-4 px-4 text-gray-600">Reward Points are awarded at the rate of one point for every ₹1 lakh of chit enrollment value, calculated as: (Chit Enrollment Group Value ÷ Enrollment Divisor).</td>
//                     </tr>
//                   </tbody>
//                 </table>
                
//                 {isEditing && (
//                   <div className="mt-6 flex justify-end gap-3">
//                     <button
//                       onClick={handleCancel}
//                       className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                     >
//                       <FiX />
//                       Cancel
//                     </button>
//                     <button
//                       onClick={updateSettings}
//                       disabled={loading}
//                       className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
//                     >
//                       <FiSave />
//                       {loading ? "Saving..." : "Save Changes"}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Additional Information Card */}
//             <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4">Reward Points Information</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h4 className="font-medium text-gray-700 mb-2">How Reward Points Work</h4>
//                   <p className="text-gray-600 text-sm leading-relaxed">
//                     Reward points are automatically credited to users when they meet specific criteria such as joining a loan group or opening a pigmy account. The point value determines the monetary equivalent of each point.
//                   </p>
//                 </div>
//                 <div>
//                   <h4 className="font-medium text-gray-700 mb-2">Current Configuration Summary</h4>
//                   <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-gray-600">Pigmy Points:</span>
//                       <span className="font-bold text-blue-600">{settings.pigmy_reward_points} pts</span>
//                     </div>
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-gray-600">Loan Points:</span>
//                       <span className="font-bold text-blue-600">{settings.loan_reward_points} pts</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Point Value:</span>
//                       <span className="font-bold text-green-600">₹{settings.reward_point_value}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

const RewardSettings = () => {
  const [settings, setSettings] = useState({
    reward_point_value: "",
    loan_reward_points: "",
    pigmy_reward_points: "",
    enrollment_divisor: "",
    auction_pay_reward_value: "",
    payment_link_reward_value: "",
    customer_referral_value: "",
    // New fields
    milestone_reward_value: "",
    referral_bonus_points: "",
    anniversary_reward_points: "",
  });
  
  const [tempSettings, setTempSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  /* ================= FETCH SETTINGS ================= */
  const fetchSettings = async () => {
    try {
      const res = await api.get("/reward-points/reward-settings");
      console.info(res, "gfjskgfsdgsdg");
      if (res.data?.success) {
        setSettings(res.data.settings);
        setTempSettings(res.data.settings);
      }
    } catch (err) {
      console.error("Failed to fetch reward settings", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  /* ================= UPDATE SETTINGS ================= */
  const updateSettings = async () => {
    setLoading(true);
    try {
      const response = await api.put("/reward-points/reward-settings", {
        reward_point_value: Number(tempSettings.reward_point_value),
        loan_reward_points: Number(tempSettings.loan_reward_points),
        pigmy_reward_points: Number(tempSettings.pigmy_reward_points),
        enrollment_divisor: Number(tempSettings.enrollment_divisor),
        auction_pay_reward_value: Number(tempSettings.auction_pay_reward_value),
        payment_link_reward_value: Number(tempSettings.payment_link_reward_value),
        customer_referral_value: Number(tempSettings.customer_referral_value),
      });
      
      if (response.data?.success) {
        setSettings(tempSettings);
        setIsEditing(false);
        setUpdateMessage("Reward settings updated successfully!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      setUpdateMessage("Failed to update reward settings");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setTempSettings(settings);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempSettings({ ...tempSettings, [field]: value });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar visibility />
      <div className="flex mt-20">
        <SettingSidebar />

        <div className="flex-grow p-7">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Reward Points 
              </h1>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiEdit2 />
                  Edit Settings
                </button>
              )}
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                updateMessage.includes("successfully") 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}>
                <FiCheckCircle />
                {updateMessage}
              </div>
            )}

            {/* Reward Points Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5">
                <h2 className="text-xl font-semibold">Current Reward Points Settings</h2>
                <p className="text-blue-100 mt-1">Manage your reward points configuration</p>
              </div>
              
              <div className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Setting</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Value</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-800">Reward Point Value</td>
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <div className="flex items-center">
                            <span className="mr-2 text-gray-600">₹</span>
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={tempSettings.reward_point_value ?? ""}
                              onChange={(e) => handleInputChange("reward_point_value", e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-xl font-bold text-green-600">₹{settings.reward_point_value}</span>
                            <span className="ml-2 text-sm text-gray-500">per point</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">Monetary value of each reward point</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-800">Pigmy Reward Points</td>
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={tempSettings.pigmy_reward_points ?? ""}
                            onChange={(e) => handleInputChange("pigmy_reward_points", e.target.value)}
                          />
                        ) : (
                          <span className="text-xl font-bold text-blue-600">{settings.pigmy_reward_points}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">Points awarded for pigmy enrollments</td>
                    </tr>
                    
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-800">Loan Reward Points</td>
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={tempSettings.loan_reward_points ?? ""}
                            onChange={(e) => handleInputChange("loan_reward_points", e.target.value)}
                          />
                        ) : (
                          <span className="text-xl font-bold text-blue-600">{settings.loan_reward_points}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">Points awarded for each loan join</td>
                    </tr>
                    
                    
                    
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-800">Enrollment Divisor</td>
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={tempSettings.enrollment_divisor ?? ""}
                            onChange={(e) => handleInputChange("enrollment_divisor", e.target.value)}
                          />
                        ) : (
                          <span className="text-xl font-bold text-blue-600">{settings.enrollment_divisor}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">Reward Points are awarded at the rate of one point for every ₹1 lakh of chit enrollment value</td>
                    </tr>
                    
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-800">No Due Reward Value</td>
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={tempSettings.auction_pay_reward_value ?? ""}
                            onChange={(e) => handleInputChange("auction_pay_reward_value", e.target.value)}
                          />
                        ) : (
                          <span className="text-xl font-bold text-blue-600">{settings.auction_pay_reward_value}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">Points awarded for successful auction payments</td>
                    </tr>
                    
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-800">Payment Link Reward Value</td>
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={tempSettings.payment_link_reward_value ?? ""}
                            onChange={(e) => handleInputChange("payment_link_reward_value", e.target.value)}
                          />
                        ) : (
                          <span className="text-xl font-bold text-blue-600">{settings.payment_link_reward_value}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">Points awarded for payments made through payment links</td>
                    </tr>
                    
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-800">Customer Referral Value</td>
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={tempSettings.customer_referral_value ?? ""}
                            onChange={(e) => handleInputChange("customer_referral_value", e.target.value)}
                          />
                        ) : (
                          <span className="text-xl font-bold text-blue-600">{settings.customer_referral_value}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">Points awarded for successful customer referrals</td>
                    </tr>
                    
                   
                  </tbody>
                </table>
                
                {isEditing && (
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiX />
                      Cancel
                    </button>
                    <button
                      onClick={updateSettings}
                      disabled={loading}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <FiSave />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information Card */}
            {/* <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Reward Points Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">How Reward Points Work</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Reward points are automatically credited to users when they meet specific criteria such as joining a loan group, opening a pigmy account, or reaching milestones. The point value determines the monetary equivalent of each point.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Current Configuration Summary</h4>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Pigmy Points:</span>
                      <span className="font-bold text-blue-600">{settings.pigmy_reward_points} pts</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Loan Points:</span>
                      <span className="font-bold text-blue-600">{settings.loan_reward_points} pts</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Referral Value:</span>
                      <span className="font-bold text-blue-600">{settings.customer_referral_value} pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Point Value:</span>
                      <span className="font-bold text-green-600">₹{settings.reward_point_value}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardSettings;
