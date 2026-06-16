import React, { useState, useEffect } from "react";
import { X, FileText, MapPin, Loader, AlertCircle, User, Fuel, Clock, Car, RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { API_BASE_URL } from '../Config.jsx';
const ActionPage = ({
    isOpen,
    onClose,
    vehicleData,
    plantData,
    selectedPlant,
    plantSubcategoryCounts
}) => {
    const [equipmentDetailsByPlant, setEquipmentDetailsByPlant] = useState({});
    const [loadingPlants, setLoadingPlants] = useState({});
    const [errors, setErrors] = useState({});
    const [debugInfo, setDebugInfo] = useState({});

    // Add maximize state
    const [isMaximized, setIsMaximized] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
    });

    // Update screen size on resize
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Toggle between normal (80%) and maximized (100%)
    const toggleMaximize = () => {
        setIsMaximized(prev => !prev);
    };

    // Function to get authentication token
    const getAuthToken = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        return userInfo.token || userInfo.access_token || userInfo.api_token;
    };

    // FIXED: Updated API fetch function with better parameter handling
    const fetchEquipmentDetailsForPlant = async (plantCode, vehicleType) => {
        const loadingKey = `${plantCode}-${vehicleType}`;

        try {
            setLoadingPlants(prev => ({ ...prev, [loadingKey]: true }));
            setErrors(prev => ({ ...prev, [loadingKey]: null }));

            const token = getAuthToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('=== FETCHING EQUIPMENT DATA ===');
            console.log('Plant Code:', plantCode);
            console.log('Vehicle Type:', vehicleType);

            // FIXED: Create proper search parameters
            const params = new URLSearchParams();

            // For plant parameter - try the exact plant code first
            params.append('PLANT', plantCode);

            // For vehicle type - try the exact vehicle type 
            params.append('VEHICLE_TYPE', vehicleType);

            console.log('API Request URL:', `${API_BASE_URL}getEquipmentDataReport?${params.toString()}`);

            const response = await fetch(`${API_BASE_URL}getEquipmentDataReport?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();
            console.log('=== EQUIPMENT API RESPONSE ===', result);

            let equipmentData = [];

            // Handle your Laravel API response structure
            if (result.success && result.data) {
                equipmentData = Array.isArray(result.data) ? result.data : [];
            } else if (result.data) {
                equipmentData = Array.isArray(result.data) ? result.data : [];
            } else if (Array.isArray(result)) {
                equipmentData = result;
            }

            console.log('Processed Equipment Data:', {
                count: equipmentData.length,
                sample: equipmentData.slice(0, 2),
                searchParams: { plantCode, vehicleType }
            });

            // Store debug info from Laravel response
            if (result.debug_info) {
                setDebugInfo(prev => ({
                    ...prev,
                    [loadingKey]: result.debug_info
                }));
            }

            // Set the result
            setEquipmentDetailsByPlant(prev => ({
                ...prev,
                [loadingKey]: equipmentData
            }));

            if (equipmentData.length === 0) {
                const errorMessage = result.message || `No equipment data found for Plant: "${plantCode}", Vehicle: "${vehicleType}"`;
                console.log('❌ No data found:', errorMessage);
                setErrors(prev => ({
                    ...prev,
                    [loadingKey]: errorMessage
                }));
            } else {
                setErrors(prev => ({ ...prev, [loadingKey]: null }));
                console.log(`✅ Successfully loaded ${equipmentData.length} records`);
            }

        } catch (error) {
            console.error('=== EQUIPMENT FETCH ERROR ===');
            console.error('Error details:', error);
            setErrors(prev => ({
                ...prev,
                [loadingKey]: `Failed to fetch equipment data: ${error.message}`
            }));
            setEquipmentDetailsByPlant(prev => ({
                ...prev,
                [loadingKey]: []
            }));
        } finally {
            setLoadingPlants(prev => ({
                ...prev,
                [loadingKey]: false
            }));
        }
    };

    // Function to get count for specific plant-subcategory combination
    const getCountForPlantSubcategory = (plant, subcategory) => {
        if (!plantSubcategoryCounts || Object.keys(plantSubcategoryCounts).length === 0) {
            return 0;
        }

        const plantCode = plant.PLANT || plant.plant || plant.name || plant.NAME;
        const plantDesc = plant.DESCRIPTION || plant.description || plant.desc || plant.DESC;

        const possiblePlantKeys = [
            plantCode,
            plantDesc,
            `${plantCode}-${plantDesc}`,
            plantCode?.split('-')[0],
            plantCode?.replace(/[()]/g, '').trim(),
        ].filter(key => key && key.toString().trim() !== '');

        console.log('Searching for count:', {
            plant: plantCode,
            subcategory: subcategory,
            possibleKeys: possiblePlantKeys,
            availableKeys: Object.keys(plantSubcategoryCounts)
        });

        for (const plantKey of possiblePlantKeys) {
            if (plantSubcategoryCounts[plantKey] && plantSubcategoryCounts[plantKey][subcategory]) {
                return plantSubcategoryCounts[plantKey][subcategory];
            }
        }

        const availableKeys = Object.keys(plantSubcategoryCounts);
        for (const plantKey of possiblePlantKeys) {
            for (const availableKey of availableKeys) {
                if (availableKey.includes(plantKey) || plantKey.includes(availableKey)) {
                    if (plantSubcategoryCounts[availableKey] && plantSubcategoryCounts[availableKey][subcategory]) {
                        return plantSubcategoryCounts[availableKey][subcategory];
                    }
                }
            }
        }

        return 0;
    };

    // Get filtered plants that have this vehicle type
    const getPlantsWithVehicleType = () => {
        if (!plantData || !vehicleData?.vehicleType) {
            return [];
        }

        const filtered = plantData.filter(plant => {
            const count = getCountForPlantSubcategory(plant, vehicleData.vehicleType);
            return count > 0;
        });

        console.log('Plants with vehicle type:', {
            vehicleType: vehicleData.vehicleType,
            totalPlants: plantData.length,
            filteredCount: filtered.length,
            filtered: filtered.map(p => ({
                plant: p.PLANT || p.plant,
                count: getCountForPlantSubcategory(p, vehicleData.vehicleType)
            }))
        });

        return filtered;
    };

    // Function to retry fetching data for a specific plant
    const retryFetchForPlant = (plantCode, vehicleType) => {
        console.log('Retrying fetch for:', { plantCode, vehicleType });
        fetchEquipmentDetailsForPlant(plantCode, vehicleType);
    };

    // FIXED: Load equipment details when modal opens - Updated to use exact vehicle type
    useEffect(() => {
        if (isOpen && vehicleData?.vehicleType) {
            console.log('=== ACTIONPAGE LOADING DATA ===');
            console.log('Selected Vehicle Type:', vehicleData.vehicleType);
            console.log('Available Plants:', plantData?.length || 0);

            // Clear previous data
            setEquipmentDetailsByPlant({});
            setLoadingPlants({});
            setErrors({});
            setDebugInfo({});

            const plantsWithVehicleType = getPlantsWithVehicleType();
            console.log('Plants to fetch data for:', plantsWithVehicleType.length);

            // FIXED: Fetch details for each plant with the selected vehicle type
            plantsWithVehicleType.forEach(plant => {
                const plantCode = plant.PLANT || plant.plant || plant.name || plant.NAME;
                if (plantCode && vehicleData.vehicleType) {
                    console.log('🚀 Fetching equipment data for:', {
                        plant: plantCode,
                        vehicleType: vehicleData.vehicleType,
                        plantDescription: plant.DESCRIPTION || plant.description
                    });

                    // Use the exact vehicle type from the vehicleData
                    fetchEquipmentDetailsForPlant(plantCode, vehicleData.vehicleType);
                }
            });
        }
    }, [isOpen, vehicleData, plantData, plantSubcategoryCounts]);

    // Don't render if modal is not open
    if (!isOpen) return null;

    const plantsWithVehicleType = getPlantsWithVehicleType();
    const totalEquipmentRecords = Object.values(equipmentDetailsByPlant).reduce(
        (total, records) => total + (Array.isArray(records) ? records.length : 0),
        0
    );

    // Calculate modal dimensions based on maximize state
    const modalWidth = isMaximized ? windowSize.width : Math.min(windowSize.width * 0.8, 1400); // 80% for normal
    const modalHeight = isMaximized ? windowSize.height : Math.min(windowSize.height * 0.8, 800); // 80% for normal

    return (
        <div className="fixed inset-0 bg-black  bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div

                className="bg-white rounded-full shadow-xl overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    width: modalWidth,
                    height: modalHeight,
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    margin: isMaximized ? '0' : 'auto',
                    borderRadius: isMaximized ? '0' : '8px'
                }}
            >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <FileText className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Equipment Details Report</h2>
                            <p className="text-blue-100 text-sm">
                                {vehicleData?.vehicleType ? `${vehicleData.vehicleType} - Equipment Operations Data` : 'Vehicle Distribution'}
                            </p>
                        </div>
                    </div>

                    {/* Header Controls */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleMaximize}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
                            title={isMaximized ? "Normal Size" : "Maximize"}
                        >
                            {isMaximized ? (
                                <Minimize2 className="w-5 h-5" />
                            ) : (
                                <Maximize2 className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div
                    className="p-6 overflow-y-auto"
                    style={{
                        maxHeight: `${modalHeight - 140}px`
                    }}
                >
                    {vehicleData ? (
                        <div className="space-y-6">
                            {/* Vehicle Type Summary */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <Car className="text-white w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {vehicleData.vehicleType}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Category: {vehicleData.category} | Active across {plantsWithVehicleType.length} plants
                                            </p>
                                        </div>
                                    </div>

                                    {/* Display current view mode */}

                                </div>
                            </div>

                            {/* Equipment Details Table */}
                            <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <FileText className="mr-2 text-blue-600 w-5 h-5" />
                                        Equipment Operations Data for "{vehicleData.vehicleType}"
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Driver assignments, working hours, and fuel consumption records from equipment_monit table
                                    </p>
                                </div>

                                <div
                                    className="overflow-x-auto"
                                    style={{
                                        maxHeight: isMaximized ? `${modalHeight - 350}px` : '400px'
                                    }}
                                >
                                    <table className="w-full border-collapse">
                                        <thead className="sticky top-0 z-20 bg-gray-50">
                                            <tr>
                                                <th className="sticky left-0 z-30 bg-gray-50 border-b border-r border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 w-40">
                                                    <div className="flex items-center">
                                                        <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                                                        Plant
                                                    </div>
                                                </th>
                                                <th className="border-b border-r border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                                                    <div className="flex items-center justify-center">
                                                        <Car className="w-4 h-4 mr-1 text-gray-500" />
                                                        Vehicle No
                                                    </div>
                                                </th>
                                                <th className="border-b border-r border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-40">
                                                    <div className="flex items-center justify-center">
                                                        <User className="w-4 h-4 mr-1 text-gray-500" />
                                                        Driver Name
                                                    </div>
                                                </th>
                                                <th className="border-b border-r border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-28">
                                                    Driver Code
                                                </th>
                                                <th className="border-b border-r border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                                                    <div className="flex items-center justify-center">
                                                        <Clock className="w-4 h-4 mr-1 text-gray-500" />
                                                        Duration
                                                    </div>
                                                </th>
                                                <th className="border-b border-r border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-28">
                                                    <div className="flex items-center justify-center">
                                                        <Fuel className="w-4 h-4 mr-1 text-gray-500" />
                                                        Diesel (Liters)
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {plantsWithVehicleType.length > 0 ? (
                                                plantsWithVehicleType.map((plant, plantIndex) => {
                                                    const plantCode = plant.PLANT || plant.plant || plant.name || plant.NAME || `Plant ${plantIndex + 1}`;
                                                    const plantDesc = plant.DESCRIPTION || plant.description || plant.desc || plant.DESC || 'No description';
                                                    const count = getCountForPlantSubcategory(plant, vehicleData.vehicleType);

                                                    const loadingKey = `${plantCode}-${vehicleData.vehicleType}`;
                                                    const isLoading = loadingPlants[loadingKey];
                                                    const error = errors[loadingKey];
                                                    const equipmentDetails = equipmentDetailsByPlant[loadingKey] || [];

                                                    if (isLoading) {
                                                        return (
                                                            <tr key={`loading-${plantIndex}`} className="bg-blue-50">
                                                                <td className="sticky left-0 z-20 bg-blue-50 border-b border-r border-gray-300 px-4 py-4">
                                                                    <div>
                                                                        <div className="font-semibold text-gray-900 text-sm">{plantCode}</div>
                                                                        <div className="text-xs text-gray-600">{plantDesc}</div>
                                                                        <div className="text-xs text-blue-600 mt-1">Expected Count: {count}</div>
                                                                    </div>
                                                                </td>
                                                                <td colSpan="6" className="border-b border-gray-300 px-4 py-4 text-center">
                                                                    <div className="flex items-center justify-center space-x-3">
                                                                        <Loader className="w-5 h-5 animate-spin text-blue-500" />
                                                                        <span className="text-gray-600">Loading equipment data for "{vehicleData.vehicleType}"...</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }

                                                    if (error) {
                                                        return (
                                                            <tr key={`error-${plantIndex}`} className="bg-red-50">
                                                                <td className="sticky left-0 z-20 bg-red-50 border-b border-r border-gray-300 px-4 py-4">
                                                                    <div>
                                                                        <div className="font-semibold text-gray-900 text-sm">{plantCode}</div>
                                                                        <div className="text-xs text-gray-600">{plantDesc}</div>
                                                                        <div className="text-xs text-blue-600 mt-1">Expected Count: {count}</div>
                                                                    </div>
                                                                </td>
                                                                <td colSpan="6" className="border-b border-gray-300 px-4 py-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-2 text-red-600">
                                                                            <div>
                                                                                <div className="text-xs text-red-500">{error}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }

                                                    if (equipmentDetails.length === 0) {
                                                        return (
                                                            <tr key={`no-data-${plantIndex}`} className="bg-yellow-50">
                                                                <td className="sticky left-0 z-20 bg-yellow-50 border-b border-r border-gray-300 px-4 py-4">
                                                                    <div>
                                                                        <div className="font-semibold text-gray-900 text-sm">{plantCode}</div>
                                                                        <div className="text-xs text-gray-600">{plantDesc}</div>
                                                                        <div className="text-xs text-blue-600 mt-1">Expected Count: {count}</div>
                                                                    </div>
                                                                </td>
                                                                <td colSpan="6" className="border-b border-gray-300 px-4 py-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-2 text-yellow-700">
                                                                            <AlertCircle className="w-4 h-4" />
                                                                            <div>
                                                                                <div className="text-sm">No equipment monitoring records found</div>
                                                                                <div className="text-xs">Check equipment_monit table for plant "{plantCode}" and vehicle type "{vehicleData.vehicleType}"</div>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => retryFetchForPlant(plantCode, vehicleData.vehicleType)}
                                                                            className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded text-xs transition-colors"
                                                                        >
                                                                            <RefreshCw className="w-3 h-3" />
                                                                            <span>Retry</span>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }

                                                    // Display equipment records for this plant
                                                    return equipmentDetails.map((equipment, equipmentIndex) => (
                                                        <tr
                                                            key={`${plantIndex}-${equipmentIndex}`}
                                                            className={`${equipmentIndex % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-50 transition-colors duration-150`}
                                                        >
                                                            <td className={`sticky left-0 z-20 ${equipmentIndex % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-r border-gray-300 px-4 py-4`}>
                                                                {equipmentIndex === 0 ? (
                                                                    <div>
                                                                        <div className="font-semibold text-gray-900 text-sm">{plantCode}</div>
                                                                        <div className="text-xs text-gray-600">{plantDesc}</div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-xs text-gray-400 pl-4">
                                                                        └ Same plant
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="border-b border-r border-gray-300 px-4 py-4 text-center">
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-sm font-mono font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                                                                    {equipment.VEHICLE_NO || equipment.vehicle_no || equipment.VEHICLE_NUMBER || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="border-b border-r border-gray-300 px-4 py-4 text-center">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {equipment.DRIVER_NAME || equipment.driver_name || equipment.DRIVERNAME || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="border-b border-r border-gray-300 px-4 py-4 text-center">
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-sm font-mono font-semibold bg-purple-50 text-purple-900 border border-purple-200">
                                                                    {equipment.DRIVER_CODE || equipment.driver_code || equipment.DRIVER || equipment.DRIVERCODE || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="border-b border-r border-gray-300 px-4 py-4 text-center">
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-sm font-semibold bg-orange-50 text-orange-800 border border-orange-200">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    {equipment.DURATION || equipment.duration || equipment.WORKINGHOURS || '0h'}
                                                                </span>
                                                            </td>
                                                            <td className="border-b border-r border-gray-300 px-4 py-4 text-center">
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-sm font-semibold bg-green-50 text-green-800 border border-green-200">
                                                                    <Fuel className="w-3 h-3 mr-1" />
                                                                    {equipment.DIESEL_ISSUE || equipment.diesel_issue || equipment.DIESELCONSUMPTION || equipment.DIESEL || '0'}L
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ));
                                                })
                                                    .flat()
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-12 text-gray-500">
                                                        <div className="flex flex-col items-center space-y-3">
                                                            <FileText className="w-12 h-12 text-gray-300" />
                                                            <div className="text-lg font-medium">No Equipment Data Found</div>
                                                            <div className="text-sm text-gray-400 max-w-md text-center">
                                                                No plants currently have operational data for "{vehicleData.vehicleType}".
                                                                Check if data exists in equipment_monit table.
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No vehicle data selected</p>
                            <p className="text-gray-400 text-sm">Please select a vehicle type to view detailed information</p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionPage