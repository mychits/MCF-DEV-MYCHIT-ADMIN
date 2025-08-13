import { useState, useEffect } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Navbar from "../components/layouts/Navbar";
import CircularLoader from "../components/loaders/CircularLoader";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import { Input, Select, Dropdown } from "antd";
import { IoMdMore } from "react-icons/io";
import DataTable from "../components/layouts/Datatable";
import filterOption from "../helpers/filterOption";
import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { fieldSize } from "../data/fieldSize";

const CollectionAreaMapping = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCollectionAreaMapping, setCurrentCollectionAreaMapping] = useState(null);
  const [tableCollectionAreaMapping, setTableCollectionAreaMapping] = useState([]);
  const [agentOption, setAgentOption] = useState([]);
  const [areaOption, setAreaOptions] = useState([]);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [currentUpdateCollectionAreaMapping, setCurrentUpdateCollectionAreaMapping] = useState(null);

  const [collectionAreaMapping, setCollectionAreaMapping] = useState({
    area_ids: [],
    agent_ids: [],
  });
  const [alertConfig, setAlertConfig] = useState({
    visibility: false,
    message: "Something went wrong!",
    type: "info",
  });

  const [updateCollectionAreaMapping, setUpdateCollectionAreaMapping] = useState({
    area_ids: [],
    agent_ids: [],
  });

  const [searchText, setSearchText] = useState("");
  const GlobalSearchChangeHandler = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await api.get(`/agent/get-agent`);

        if (response.data) {
          const options = response.data.map((agent) => ({
            value: agent?._id,
            label: agent?.name,
          }));
          setAgentOption(options);
        }
      } catch (err) {
        console.error("failed to fetch Employee");
      }
    };
    fetchEmployee();
  }, [reloadTrigger]);

  useEffect(() => {
    const fetchCollectionArea = async () => {
      try {

        const response = await api.get(
          `/collection-area-request/get-collection-area-data`
        );

        if (response.data) {
          const options = response.data.map((area) => ({
            value: area?._id,
            label: area?.route_name,
          }));
          setAreaOptions(options);
        }

      } catch (err) {
        console.error("failed to fetch Collection Area");
      }
    };
    fetchCollectionArea();
  }, [reloadTrigger]);

  useEffect(() => {
    const fetchCollectionAreaMapping = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(
          "/collection-area-mapping/get-collection-area-mapping"
        );


        setCollectionAreaMapping(response.data);
        const collectionAreaMapping = response?.data.map(
          (collectionAreaMap, index) => {
            return {
              _id: collectionAreaMap?._id,
              id: index + 1,
              name: collectionAreaMap?.area_ids?.map((area) => area?.route_name).join(),
              Agent: collectionAreaMap?.agent_ids
                ?.map((agent) => agent?.name)
                .join(),
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
                                handleUpdateModalOpen(collectionAreaMap?._id)
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
                                handleDeleteModalOpen(collectionAreaMap?._id)
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

        setTableCollectionAreaMapping(collectionAreaMapping);
      } catch (error) {
        console.error("Error fetching collection area data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCollectionAreaMapping();
  }, [reloadTrigger]);

  const handleInputSelect = (name, arr) => {
    const values = arr.map((item) => (typeof item === "object" ? item?.value : item));
    setUpdateCollectionAreaMapping((prev) => ({ ...prev, [name]: values }));
  };

  const handleSelect = (name, arr) => {

    const values = arr.map((item) => (typeof item === "object" ? item?.value : item));
    setCollectionAreaMapping((prev) => ({
      ...prev,
      [name]: Array.isArray(arr) ? arr : [],
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/collection-area-mapping/add-collection-area-mapping",
        collectionAreaMapping,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setReloadTrigger((prev) => prev + 1);
      setAlertConfig({
        visibility: true,
        message: "Collection Area Mapping Added Successfully",
        type: "success",
      });

      setShowModal(false);

      setCollectionAreaMapping({
        area_ids: [],
        agent_ids: [],
      });
    } catch (error) {
      console.error("Error adding Mapping:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setReloadTrigger((prev) => prev + 1);
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
    { key: "Agent", header: "Agent" },
    { key: "action", header: "Action" },
  ];

  const handleDeleteModalOpen = async (Id) => {
    try {
      const response = await api.get(
        `/collection-area-mapping/get-collection-area-mapping-by-id/${Id}`
      );
      setCurrentCollectionAreaMapping(response.data);

      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching Collection area Data :", error);
    }
  };


  const handleUpdateModalOpen = async (Id) => {
    try {
      const response = await api.get(
        `/collection-area-mapping/get-collection-area-mapping-by-id/${Id}`
      );


      setUpdateCollectionAreaMapping({
        area_ids: response.data.area_ids.map(area => area?._id),
        agent_ids: response.data.agent_ids.map(agent => agent?._id),
      });

      setCurrentUpdateCollectionAreaMapping(response.data);
      setShowModalUpdate(true);
    } catch (error) {
      console.error("Error fetching collection area Mapping:", error);
    }
  };

  const handleDeleteCollectionMapping = async () => {
    if (currentCollectionAreaMapping) {
      try {
        await api.delete(
          `/collection-area-mapping/delete-collection-area-mapping-by-id/${currentCollectionAreaMapping._id}`
        );
        setReloadTrigger((prev) => prev + 1);
        setAlertConfig({
          visibility: true,
          message: "Area Mapping deleted successfully",
          type: "success",
        });
        setShowModalDelete(false);

        setCurrentCollectionAreaMapping(null);
      } catch (error) {
        console.error("Error deleting Area Mapping:", error);
      }
    }
  };


  const handleUpdate = async (e) => {
    e.preventDefault();
    try {

      const updatedData = {
        ...updateCollectionAreaMapping,
        area_ids: updateCollectionAreaMapping.area_ids.map(area => area?.value || area),
        agent_ids: updateCollectionAreaMapping.agent_ids.map(agent => agent?.value || agent),
      };

      await api.put(
        `/collection-area-mapping/update-collection-area-mapping-by-id/${currentUpdateCollectionAreaMapping._id}`,
        updatedData
      );
      setReloadTrigger((prev) => prev + 1);
      setAlertConfig({
        visibility: true,
        message: "Area Mapping updated successfully",
        type: "success",
      });
      setShowModalUpdate(false);

    } catch (error) {
      console.error("Error updating Collection Area Mapping:", error);
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
                <h1 className="text-2xl font-semibold">Collection Area Mapping</h1>

                <button
                  onClick={() => {
                    setShowModal(true);
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add Collection Area Mapping
                </button>
              </div>
            </div>
            {(tableCollectionAreaMapping?.length > 0 && !isLoading) ? (
              <DataTable
                catcher="_id"
                updateHandler={handleUpdateModalOpen}
                data={filterOption(tableCollectionAreaMapping, searchText)}
                columns={columns}
                exportedPdfName="Collection Area Mapping"
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={tableCollectionAreaMapping.length <= 0}
                data=" Collection Area Mapping Data"
              />
            )}
          </div>
        </div>


        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Add Collection Area Mapping
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="area"
                >
                  Collection Area Employee
                </label>
                <Select
                  mode="tags"
                  value={collectionAreaMapping?.agent_ids || []}
                  onChange={(value) => handleSelect("agent_ids", value)}
                  id="area_select"
                  placeholder="Please select"
                  showSearch
                  popupMatchSelectWidth={false}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  options={agentOption}
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="name"
                >
                  Collection Area Name
                </label>
                <Select
                  mode="tags"
                  value={collectionAreaMapping?.area_ids || []}
                  onChange={(value) => handleSelect("area_ids", value)}
                  id="name"
                  placeholder="Please select"
                   showSearch
                  popupMatchSelectWidth={false}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  options={areaOption}
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
              Update Collection Area Mapping
            </h3>
            <form className="space-y-6" onSubmit={handleUpdate} noValidate>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="areaids"
                >
                  Collection Area Mapping Name
                </label>
                <Select
                  mode="tags"
                  value={updateCollectionAreaMapping?.area_ids}
                  onChange={(value) => handleInputSelect("area_ids", value)}
                  id="areaids"
                  name="area_ids"
                  placeholder="Please select"
                   showSearch
                  popupMatchSelectWidth={false}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  options={areaOption}

                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                />
              </div>

              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="agent_select"
                >
                  Collection Area Agent
                </label>
                <Select
                  mode="tags"
                  onChange={(value) => handleInputSelect("agent_ids", value)}
                  value={updateCollectionAreaMapping?.agent_ids}
                  id="agent_select"
                  name="agent_id"
                  placeholder="Please select"
                   showSearch
                  popupMatchSelectWidth={false}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  options={agentOption}

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
            setCurrentCollectionAreaMapping(null);
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Delete Collection Area
            </h3>
            {currentCollectionAreaMapping && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeleteCollectionMapping();
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
                      {currentCollectionAreaMapping?.area_ids?.map(area => area?.route_name).join(",")}
                    </span>{" "}
                    to confirm deletion.
                  </label>
                  <Input
                    type="text"
                    id="areaName"
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

export default CollectionAreaMapping;
