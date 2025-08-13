import { useState, useEffect } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import CustomAlert from "../components/alerts/CustomAlert";
import CircularLoader from "../components/loaders/CircularLoader";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import { Input,Dropdown } from "antd";
import { IoMdMore } from "react-icons/io";
import DataTable from "../components/layouts/Datatable";
import filterOption from "../helpers/filterOption";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { fieldSize } from "../data/fieldSize";

const CollectionArea = () => {
  const [currentCollectionArea, setCurrentCollectionArea] = useState(null);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [currentUpdateCollectionArea, setCurrentUpdateCollectionArea] =
    useState(null);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [tableCollectionArea, setTableCollectionArea] = useState([]);
  const [collectionArea, setCollectionArea] = useState([]);
  const [collectionAreaData, setCollectionAreaData] = useState({
    route_name: "",
    route_pincode: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
const [reloadTrigger, setReloadTrigger] = useState(0);
 
  const [updateCollectionAreaData, setUpdateCollectionAreaData] = useState({
    route_name: "",
    route_pincode: "",

  });

  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  const [searchText, setSearchText] = useState("");
  const GlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };

    useEffect(() => {
    const fetchAreaCollection = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(
          "/collection-area-request/get-collection-area-data"
        );

        setCollectionArea(response.data);
        const collectionAreaData = response?.data.map(
          (collectionArea, index) => {
            return {
              _id: collectionArea?._id,
              id: index + 1,
              name: collectionArea?.route_name,
              pincode: collectionArea?.route_pincode,
              action: (
                <div className="flex justify-center gap-2">
                  <Dropdown
                   trigger={['click']}
                    menu={{
                      items: [
                        {
                          key: "1",
                          label: (
                            <div
                              className="text-green-600"
                              onClick={() =>
                                handleUpdateModalOpen(collectionArea?._id)
                              }
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
                              onClick={() =>
                                handleDeleteModalOpen(collectionArea?._id)
                              }
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
          }
        );
   
        setTableCollectionArea(collectionAreaData);
      } catch (error) {
        console.error("Error fetching collection area data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAreaCollection();
  }, [reloadTrigger]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCollectionAreaData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };





  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateCollectionAreaData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/collection-area-request/add-collection-area-data",
        collectionAreaData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setReloadTrigger((prev) => prev + 1);
      setAlertConfig({
        type: "success",
        message: "Collection Area Added Successfully",
        visibility: true,
      });

      setShowModal(false);

      setCollectionAreaData({
        route_name: "",
        agent_id: [],
      });
    } catch (error) {
      console.error("Error adding user:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setAlertConfig({
          type: "error",
          message: `${error?.response?.data?.message}`,
          visibility: true,
        });
      } else {
        setAlertConfig({
          type: "error",
          message: "An unexpected error occurred. Please try again.",
          visibility: true,
        });
      }
    }
  };




  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "name", header: "Collection Area Name" },
    { key: "pincode", header: "pincode"},   
    { key: "action", header: "Action" },
  ];

  const handleDeleteModalOpen = async (Id) => {
    try {
      const response = await api.get(
        `/collection-area-request/get-collection-area-data-by-id/${Id}`
      );
      setCurrentCollectionArea(response.data);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching Collection area Data :", error);
    }
  };

  const handleUpdateModalOpen = async (Id) => {
    try {
      const response = await api.get(
        `/collection-area-request/get-collection-area-data-by-id/${Id}`
      );
      setCurrentUpdateCollectionArea(response?.data);
      setUpdateCollectionAreaData({
        route_name: response?.data?.route_name,
        route_pincode: response?.data?.route_pincode,
      });
      setShowModalUpdate(true);
    } catch (error) {
      console.error("Error fetching collection area data:", error);
    }
  };

  const filteredRoute = collectionArea.filter((area) =>
    area.route_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCollectionArea = async () => {
    if (currentCollectionArea) {
      try {
        await api.delete(
          `/collection-area-request/delete-collection-area-data-by-id/${currentCollectionArea._id}`
        );
        setAlertConfig({
          visibility: true,
          message: "Collection Area deleted successfully",
          type: "success",
        });
        setReloadTrigger((prev) => prev + 1);
        setShowModalDelete(false);
        setCurrentCollectionArea(null);
      } catch (error) {
        console.error("Error deleting Collection Area:", error);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        `/collection-area-request/update-collection-area-data-by-id/${currentUpdateCollectionArea._id}`,
        updateCollectionAreaData
      );
      setShowModalUpdate(false);
      setReloadTrigger((prev) => prev + 1);

      setAlertConfig({
        visibility: true,
        message: "Collection Area Updated Successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating Collection Area:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          setAlertConfig({
            visibility: true,
            message: `${error?.response?.data?.message}`,
            type: "error",
          });
        } else {
          setAlertConfig({
            visibility: true,
            message: "An unexpected error occurred. Please try again.",
            type: "error",
          });
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
                <h1 className="text-2xl font-semibold">Collection Area</h1>

                <button
                  onClick={() => {
                    setShowModal(true);
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add Collection Area
                </button>
              </div>
            </div>
            {(tableCollectionArea?.length > 0 && !isLoading) ? (
              <DataTable
                catcher="_id"
                updateHandler={handleUpdateModalOpen}
                data={filterOption(tableCollectionArea, searchText)}
                columns={columns}
                exportedPdfName="Collection Area"
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={tableCollectionArea.length <= 0}
                data=" Collection Area Data"
              />
            )}
          </div>
        </div>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Add Collection Area
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="name"
                >
                  Collection Area Name
                </label>
                <Input
                  type="text"
                  name="route_name"
                  value={collectionAreaData?.route_name}
                  onChange={handleChange}
                  id="name"
                  placeholder="Enter the Collection Area Name"
             
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
              </div>
               <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="apincode"
                >
                  Collection Area Pincode
                </label>
                <Input
                  type="text"
                  name="route_pincode"
                  value={collectionAreaData?.route_pincode}
                  onChange={handleChange}
                  id="apincode"
                  placeholder="Enter the Collection Area Pincode"
             
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
              </div>
              
              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Save Collection Area
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
              Update Collection Area
            </h3>
            <form className="space-y-6" onSubmit={handleUpdate} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="rname"
                >
                  Collection Area Name
                </label>
                <Input
                  type="text"
                  name="route_name"
                  value={updateCollectionAreaData?.route_name}
                  onChange={handleInputChange}
                  id="rname"
                  placeholder="Enter the Collection Area Name"
                  required
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="pincode"
                >
                  Collection Area Pincode
                </label>
                <Input
                  type="text"
                  name="route_pincode"
                  value={updateCollectionAreaData?.route_pincode}
                  onChange={handleInputChange}
                  id="pincode"
                  placeholder="Enter the Collection Area Pincode"
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
              </div>
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
            setCurrentCollectionArea(null);
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Delete Collection Area
            </h3>
            {currentCollectionArea && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeleteCollectionArea();
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
                      {currentCollectionArea?.route_name}
                    </span>{" "}
                    to confirm deletion.
                  </label>
                  <Input
                    type="text"
                    id="routeName"
                    placeholder="Enter the Collection Area Name"
                    required
                    className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
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
export default CollectionArea;
