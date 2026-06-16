import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../Config.jsx';
import {
  FaCar,
  FaTimes,
  FaDatabase,
  FaUsers,
  FaArrowLeft,
  FaCogs,
  FaChartBar,
  FaSync,

} from "react-icons/fa";
import {
  // Master Data
  FaFileContract,  // Contract Details
  // Equipment Monitoring
  FaExchangeAlt   // Transfer/Service
  // View Reports
} from "react-icons/fa";

const Mainpage = () => {
  const [showMasterDataModal, setShowMasterDataModal] = useState(false);
  const [counts, setCounts] = useState({ activeVehicles: 0, activeDrivers: 0 });
  const [plantData, setPlantData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCounts();
    fetchPlantVehicleCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token =
        userInfo.token || userInfo.access_token || userInfo.api_token;

      if (!token) {
        console.error("No authentication token found in userInfo");
        setCounts({ activeVehicles: 0, activeDrivers: 0 });
        return;
      }

      const res = await axios.get(`${API_BASE_URL}getCounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      setCounts({
        activeVehicles:
          res.data.totalVehicles || res.data.activeVehicles || 0,
        activeDrivers: res.data.activeDrivers || 0,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("userInfo");
      }

      setCounts({ activeVehicles: 0, activeDrivers: 0 });
    }
  };

  const fetchPlantVehicleCounts = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token =
        userInfo.token || userInfo.access_token || userInfo.api_token;

      if (!token) {
        console.error("No authentication token found for plant data");
        setPlantData([]);
        return;
      }

      const res = await axios.get(
        `${API_BASE_URL}getPlantVhCounts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      

      if (res.data.success && res.data.data) {
        const sortedData = res.data.data.sort((a, b) =>
          a.PLANT.localeCompare(b.PLANT)
        );
        setPlantData(sortedData);
      } else {
        setPlantData([]);
      }
    } catch (error) {
      console.error("Error fetching plant vehicle counts:", error);
      setPlantData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const closeModal = () => setShowMasterDataModal(false);

  const handleNavigation = (route) => {
    navigate(route);
    setShowMasterDataModal(false);
  };

  const handleRefresh = () => {
    fetchPlantVehicleCounts(true);
    fetchCounts();
  };

  const masterDataTabs = [
    {
      name: "Vehicle Data",
      icon: FaCar,
      route: "/VehicleData",
      colorScheme: "blue",
    },
    {
      name: "Driver Data",
      icon: FaUsers,
      route: "/DriverData",
      colorScheme: "green",
    },
  ];

  const TileCard = ({ icon: Icon, title, onClick, colorScheme = "blue" }) => {
    const colorClasses = {
      blue: {
        border: "border-l-4 border-blue-500 hover:border-blue-600",
        bg: "bg-white hover:bg-blue-50",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        titleColor: "text-gray-800",
        buttonBg: "bg-blue-500 hover:bg-blue-600",
      },
      green: {
        border: "border-l-4 border-green-500 hover:border-green-600",
        bg: "bg-white hover:bg-green-50",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        titleColor: "text-gray-800",
        buttonBg: "bg-green-500 hover:bg-green-600",
      },
    };

    const colors = colorClasses[colorScheme];

    return (
      <div
        className={`${colors.border} ${colors.bg} rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer transform hover:-translate-y-1`}
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className={`${colors.iconBg} p-3 rounded-full`}>
            <Icon className={`${colors.iconColor} text-xl`} />
          </div>
          <h3 className={`text-lg font-semibold ${colors.titleColor}`}>
            {title}
          </h3>
        </div>
        <button
          onClick={onClick}
          className={`w-full ${colors.buttonBg} text-white py-2 px-4 rounded-md font-medium transition-colors duration-200`}
        >
          Manage Data
        </button>
      </div>
    );
  };

  const PlantTile = ({ plant, vehicleCount, index }) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-green-500 to-green-600",
      "bg-gradient-to-br from-purple-500 to-purple-600",
      "bg-gradient-to-br from-orange-500 to-orange-600",
      "bg-gradient-to-br from-teal-500 to-teal-600",
      "bg-gradient-to-br from-red-500 to-red-600",
      "bg-gradient-to-br from-indigo-500 to-indigo-600",
      "bg-gradient-to-br from-pink-500 to-pink-600",
      "bg-gradient-to-br from-cyan-500 to-cyan-600",
      "bg-gradient-to-br from-amber-500 to-amber-600",
    ];

    const colorIndex = index % colors.length;
    const selectedColor = colors[colorIndex];

    // Split plant → number + rest name
    const [firstPart, ...restParts] = plant.split("-");
    const restName = restParts.join("-");

    return (
      <div
        className={`${selectedColor} rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-4 text-white cursor-pointer transform hover:-translate-y-1 hover:scale-105 border border-white/20 flex flex-col items-center justify-center h-32`}
      >
        <h2 className="text-3xl font-bold">{firstPart}</h2>
        <p className="text-sm mt-1 text-center">{restName}</p>
        <p className="text-xs mt-2">
          Vehicles: <span className="font-semibold">{vehicleCount}</span>
        </p>
      </div>
    );
  };

  const TabContent = ({ tabs }) => {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tabs.map((tab, index) => (
            <TileCard
              key={index}
              icon={tab.icon}
              title={tab.name}
              colorScheme={tab.colorScheme}
              onClick={() => handleNavigation(tab.route)}
            />
          ))}
        </div>
      </div>
    );
  };

  const totalPlantVehicles = plantData.reduce(
    (sum, plant) => sum + plant.vehicleCount,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FaCogs className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Hire Vehicle Process
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Fleet Management System
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors duration-200"
              >
                <FaArrowLeft className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicles */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg">
                <div className="bg-sky-500 p-2">
                  <p className="text-white text-sm font-medium text-center">
                    Total Vehicles
                  </p>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {counts.activeVehicles}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaCar className="text-blue-600 text-xl" />
                  </div>
                </div>
              </div>

              {/* Drivers */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg">
                <div className="bg-green-500 p-2">
                  <p className="text-white text-sm font-medium text-center">
                    Active Drivers
                  </p>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {counts.activeDrivers}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaUsers className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Fleet Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Fleet Overview
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Plant-wise vehicle inventory and distribution
                    {plantData.length > 0 && (
                      <span className="ml-2 text-blue-600 font-medium">
                        ({plantData.length}{" "}
                        {plantData.length === 1 ? "plant" : "plants"})
                      </span>
                    )}
                  </p>
                </div>

              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p>Loading plant data...</p>
                    </div>
                  </div>
                ) : plantData.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {plantData.map((item, index) => (
                        <PlantTile
                          key={`${item.PLANT}-${index}`}
                          plant={item.PLANT}
                          vehicleCount={item.vehicleCount}
                          index={index}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 h-32 flex items-center justify-center">
                    <div>
                      <p className="text-lg font-semibold">
                        No Plant Data Available
                      </p>
                      <p className="text-sm">
                        No plant information found in the system
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          {/* Right Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaDatabase className="mr-2 text-blue-600" />
                  Quick Actions
                </h3>
                <p className="text-gray-500 text-sm">Manage your fleet data</p>
              </div>

              {/* Buttons */}
              <div className="p-6 space-y-4">
                <button
                  onClick={() => setShowMasterDataModal(true)}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg font-medium
                   transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <FaDatabase size={20} />
                  Master Data
                </button>

                <button
                  onClick={() => navigate("/ContractDetails")}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg font-medium
                   transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <FaFileContract size={20} />
                  Contract Details
                </button>

                <button
                  onClick={() => navigate("/EquipmentMonit")}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg font-medium
                   transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <FaCogs size={20} />
                  Equipment Monitoring
                </button>

                <button
                  onClick={() => navigate("/TransferService")}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg font-medium
                   transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <FaExchangeAlt size={20} />
                  Transfer/Service
                </button>

                <button
                  onClick={() => navigate("/Reports")}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg font-medium
                   transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <FaChartBar size={20} />
                  View Reports
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Master Data Modal */}
      {showMasterDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Master Data Management
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="bg-white/20 text-white p-2 rounded-lg"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
            </div>

            <TabContent tabs={masterDataTabs} />

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mainpage;
