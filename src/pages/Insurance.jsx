import { useEffect, useState } from "react";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import Navbar from "../components/layouts/Navbar";
import CircularLoader from "../components/loaders/CircularLoader";
import SettingSidebar from "../components/layouts/SettingSidebar";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";

const Insurance = () => {
  const [insurance, setInsurance] = useState([]);
  const [insuranceTable, setInsuarnceTable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const onGlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/insurance");

        const enquiry = response.data?.enquire
       
        const responseData = Array.isArray(enquiry)
          ? enquiry
          : [];
        setInsurance(responseData);

        const formattedData = responseData?.map((group, index) => ({
          _id: group._id,
          id: index + 1,
          customerName: group.customer_id?.full_name,
          phoneNumber: group.customer_id?.phone_number,
          insuranceType: group.insurance_type.join(", ") || [],
        }));
        setInsuarnceTable(formattedData);
      } catch (error) {
        console.error("failed to load insurance data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsurance();
  }, []);

  const column = [
    { key: "id", header: "SL No" },
    { key: "customerName", header: "Customer Name" },
    { key: "phoneNumber", header: "Phone Number" },
    { key: "insuranceType", header: "Insurance Type" },
  ];
  return (
    <>
      <div>
        <div className="flex mt-20">
          <Navbar
            onGlobalSearchChangeHandler={onGlobalSearchChangeHandler}
            visibility={true}
          />
          <SettingSidebar />
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
                <h1 className="text-2xl font-semibold">Insurance</h1>
              </div>
            </div>
            {insuranceTable && !isLoading ? (
            <DataTable data={insuranceTable} columns={column} />
          ) : (
            <CircularLoader
              isLoading={isLoading}
              failure={insuranceTable.length <= 0}
              data="insurance data"
            />
          )}
          </div>
          
        </div>
        
      </div>
    </>
  );
};

export default Insurance;
