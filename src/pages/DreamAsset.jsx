import { useEffect, useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Modal from "../components/modals/Modal";
import api from "../instance/TokenInstance";
import DataTable from "../components/layouts/Datatable";
import { Input, Select, Dropdown, Button, Table } from "antd";
import { IoMdMore } from "react-icons/io";
import Navbar from "../components/layouts/Navbar";
import filterOption from "../helpers/filterOption";
import CircularLoader from "../components/loaders/CircularLoader";

import CustomAlertDialog from "../components/alerts/CustomAlertDialog";
import { Link } from "react-router-dom";
import { fieldSize } from "../data/fieldSize";

const DreamAsset = () => {
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [TableAsset, setTableAsset] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUpdateAsset, setCurrentUpdateAsset] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [errors, setErrors] = useState({});
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
  const [formData, setFormData] = useState({
    asset_type: "",
  });
  const [updateFormData, setUpdateFormData] = useState({
    asset_type: "",
  });

  useEffect(() => {
    const fetchDreamAsset = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/asset/get-asset-info");
        const assetData = response.data?.asset || [];

        setAssets(assetData);

        const formattedData = assetData.map((group, index) => ({
          _id: group?._id,
          id: index + 1,
          //asset_type: group?.asset_type,
          asset_type: Array.isArray(group?.asset_type)
            ? group.asset_type
                .map((type) => type.charAt(0).toUpperCase() + type.slice(1))
                .join(", ")
            : group?.asset_type?.charAt(0).toUpperCase() +
              group?.asset_type?.slice(1),
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
        }));

        setTableAsset(formattedData);
      } catch (error) {
        console.error("Error fetching Asset data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDreamAsset();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/asset/add-asset-info", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setReloadTrigger((prev) => prev + 1);
      setAlertConfig({
        type: "success",
        message: "Asset Added Successfully",
        visibility: true,
      });
      setShowModal(false);
      setFormData({
        asset_type: "",
      });
    } catch (error) {
      console.error("Error adding Asset:", error);
      setAlertConfig({
        type: "error",
        message:
          error?.response?.data?.message || "An unexpected error occurred.",
        visibility: true,
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        `/asset/update-asset-info/${currentUpdateAsset?._id}`,
        updateFormData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setShowModalUpdate(false);
      setReloadTrigger((prev) => prev + 1);
      setAlertConfig({
        type: "success",
        message: "Asset Updated Successfully",
        visibility: true,
      });
    } catch (error) {
      console.error("Error updating Asset:", error);
      setAlertConfig({
        type: "error",
        message: error?.response?.data?.message || "Update failed",
        visibility: true,
      });
    }
  };

  const handleDeleteModalOpen = async (userId) => {
    try {
      const response = await api.get(`/asset/get-asset-info-by-id/${userId}`);
      setCurrentAsset(response.data?.asset);
      setShowModalDelete(true);
    } catch (error) {
      console.error("Error fetching Asset:", error);
    }
  };

  const handleUpdateModalOpen = async (userId) => {
    try {
      const response = await api.get(`/asset/get-asset-info-by-id/${userId}`);
      setUpdateFormData({
        asset_type: response.data?.asset?.asset_type,
      });

      setCurrentUpdateAsset(response.data?.asset);
      setShowModalUpdate(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching Asset:", error);
    }
  };


  
  const handleDeleteAsset = async () => {
    if (!currentAsset || !currentAsset._id) return;

    try {
      await api.delete(`/asset/delete-asset-info-by-id/${currentAsset._id}`);

      setTableAsset((prev) =>
        prev.filter((item) => item._id !== currentAsset._id)
      );

      setAlertConfig({
        visibility: true,
        message: "Asset deleted successfully",
        type: "success",
      });

      setReloadTrigger((prev) => prev + 1);
      setShowModalDelete(false);
      setCurrentAsset(null);
    } catch (error) {
      console.error("Error deleting asset:", error);
      setAlertConfig({
        visibility: true,
        type: "error",
        message: "Failed to delete asset.",
      });
    }
  };

  const columns = [
    { key: "id", header: "SL. NO" },
    { key: "asset_type", header: "Asset Name" },
    { key: "action", header: "Action" },
  ];

  return (
    <>
      <div>
        <div className="flex mt-20">
        
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
                <h1 className="text-2xl font-semibold">Dream Asset</h1>

                <button
                  onClick={() => {
                    setShowModal(true);
                    setErrors({});
                  }}
                  className="ml-4 bg-blue-950 text-white px-4 py-2 rounded shadow-md hover:bg-blue-800 transition duration-200"
                >
                  + Add Asset
                </button>
              </div>
            </div>
            {TableAsset?.length > 0 && !isLoading ? (
              <DataTable
                catcher="_id"
                updateHandler={handleUpdateModalOpen}
                data={filterOption(TableAsset, searchText)}
                columns={columns}
                exportedPdfName="Dream Asset"
                exportedFileName={`Asset-${
                  TableAsset.length > 0
                    ? TableAsset[0].name +
                      " to " +
                      TableAsset[TableAsset.length - 1].name
                    : "empty"
                }.csv`}
              />
            ) : (
              <CircularLoader
                isLoading={isLoading}
                failure={TableAsset.length <= 0}
                data="Asset Data"
              />
            )}
          </div>
        </div>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Add Asset</h3>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="referred_type"
                >
                  Asset Type <span className="text-red-500 ">*</span>
                </label>
                <Select
                 
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  placeholder="Select Asset Type"
                  popupMatchSelectWidth={false}
                  showSearch
                  name="asset_type"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={formData?.asset_type || undefined}
                  onChange={(value) => handleAntDSelect("asset_type", value)}
                >
                  {[
                    "Car",
                    "House",
                    "Bike",
                    "Travel",
                    "Health",
                    "Jewellery",
                  ].map((refType) => (
                    <Select.Option key={refType} value={refType.toLowerCase()}>
                      {refType}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 border-2 border-black
              focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Save Asset
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
              Update Asset
            </h3>
            <form className="space-y-6" onSubmit={handleUpdate} noValidate>
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="referred_type"
                >
                  Asset Type <span className="text-red-500 ">*</span>
                </label>
                <Select
                  
                  className={`bg-gray-50 border border-gray-300 ${fieldSize.height} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
                  placeholder="Select Asset Type"
                  popupMatchSelectWidth={false}
                  showSearch
                  name="asset_type"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  value={updateFormData?.asset_type || undefined}
                  onChange={(value) =>
                    handleAntInputDSelect("asset_type", value)
                  }
                >
                  {[
                    "Car",
                    "House",
                    "Bike",
                    "Travel",
                    "Health",
                    "Jewellery",
                  ].map((refType) => (
                    <Select.Option key={refType} value={refType}>
                      {refType.toLowerCase()}
                    </Select.Option>
                  ))}
                </Select>
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
            setCurrentAsset(null);
          }}
        >
          <div className="py-6 px-5 lg:px-8 text-left">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              Delete Asset
            </h3>
            {currentAsset && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeleteAsset();
                }}
                className="space-y-6"
              >
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-primary">
                    {currentAsset.asset_type}
                  </span>
                  ? This action cannot be undone.
                </p>
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

export default DreamAsset;
