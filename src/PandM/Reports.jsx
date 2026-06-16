import React, { useState, useEffect } from "react";
import {
    BarChart3,
    ArrowLeft,
    Settings,
    FileText,
    Calendar,
    Download,
    Printer,
    Filter,
    Search,
    Eye,
    Plus
} from "lucide-react";
// Add this import at the top with your other imports
import ActionPage from './ActionPage';
import { API_BASE_URL } from '../Config.jsx';

const Reports = () => {
    const [equipmentData, setEquipmentData] = useState([]);
    const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [plantData, setPlantData] = useState([]);
    const [isLoadingPlants, setIsLoadingPlants] = useState(true);
    const [selectedPlant, setSelectedPlant] = useState("");
    const [plantSubcategoryCounts, setPlantSubcategoryCounts] = useState({});
    const [isLoadingCounts, setIsLoadingCounts] = useState(true);
    // Add these state variables after your existing state declarations
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedVehicleForAction, setSelectedVehicleForAction] = useState(null);
    const [selectedPlantForAction, setSelectedPlantForAction] = useState('');
    // Contract data and vehicle types
    const [contractData, setContractData] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [isLoadingContract, setIsLoadingContract] = useState(true);
    // Vehicle category data
    const [vehicleCategoryData, setVehicleCategoryData] = useState([]);
    const [isLoadingVehicleCategories, setIsLoadingVehicleCategories] = useState(true);

    // Driver Reports filters
    const [selectedDriverPlant, setSelectedDriverPlant] = useState("");
    const [selectedVehicleType, setSelectedVehicleType] = useState("");
    const [selectedDays, setSelectedDays] = useState(7);

    // 
    const [selectedFinancialPlant, setSelectedFinancialPlant] = useState("");
    const [selectedFinancialVehicleType, setSelectedFinancialVehicleType] = useState("");
    const [selectedFinancialYear, setSelectedFinancialYear] = useState(new Date().getFullYear());
    const [financialVehicleTypes, setFinancialVehicleTypes] = useState([]);

    // Add these new state variables for Equipment Monitoring Reports
    const [equipmentReportData, setEquipmentReportData] = useState([]);
    const [isLoadingEquipmentReport, setIsLoadingEquipmentReport] = useState(false);
    const [equipmentPlantVehicleTypes, setEquipmentPlantVehicleTypes] = useState([]);
    const [selectedReportType, setSelectedReportType] = useState('monthly');
    const fetchPlantSubcategoryCounts = async () => {
        try {
            setIsLoadingCounts(true);
            const token = getAuthToken();
            if (!token) {
                console.error('No authentication token found');
                setIsLoadingCounts(false);
                return;
            }

            console.log('Fetching plant and subcategory counts...');

            const response = await fetch(`${API_BASE_URL}getPlantAndSubcategory`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Plant Subcategory Counts API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                throw new Error(`Failed to fetch counts: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Plant Subcategory Counts Response:', result);

            // Handle different response structures with better error checking
            let countsData = {};

            if (result.success && result.counts) {
                countsData = result.counts;
            } else if (result.counts) {
                countsData = result.counts;
            } else if (result.data && typeof result.data === 'object') {
                countsData = result.data;
            } else if (result.rawCounts && Array.isArray(result.rawCounts)) {
                const formattedCounts = {};
                result.rawCounts.forEach(item => {
                    const plant = item.PLANT;
                    const subcategory = item.SUB_CATEGORY;
                    const count = item.count;

                    if (plant && subcategory && count !== undefined) {
                        if (!formattedCounts[plant]) {
                            formattedCounts[plant] = {};
                        }
                        formattedCounts[plant][subcategory] = count;
                    }
                });
                countsData = formattedCounts;
            } else if (Array.isArray(result)) {
                // Handle direct array response
                const formattedCounts = {};
                result.forEach(item => {
                    const plant = item.PLANT || item.plant;
                    const subcategory = item.SUB_CATEGORY || item.sub_category;
                    const count = item.count || item.COUNT;

                    if (plant && subcategory && count !== undefined) {
                        if (!formattedCounts[plant]) {
                            formattedCounts[plant] = {};
                        }
                        formattedCounts[plant][subcategory] = count;
                    }
                });
                countsData = formattedCounts;
            } else {
                console.warn('Unexpected counts response structure:', result);
                countsData = {};
            }

            console.log('Processed Plant Subcategory Counts:', {
                totalPlants: Object.keys(countsData).length,
                sampleData: Object.keys(countsData).slice(0, 3).reduce((obj, key) => {
                    obj[key] = countsData[key];
                    return obj;
                }, {}),
                allPlants: Object.keys(countsData)
            });

            setPlantSubcategoryCounts(countsData);

        } catch (error) {
            console.error('Error fetching plant subcategory counts:', error);
            setPlantSubcategoryCounts({});
            // Show user-friendly error message
            alert(`Failed to load vehicle counts: ${error.message}`);
        } finally {
            setIsLoadingCounts(false);
        }
    };

    const handleBack = () => {
        console.log("Navigate back");
    };

    // Function to get authentication token
    const getAuthToken = () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            return userInfo.token || userInfo.access_token || userInfo.api_token;
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    };
    const fetchEquipmentMonitoringData = async (plant, vehicleType, year, reportType) => {
        try {
            setIsLoadingEquipmentReport(true);
            const token = getAuthToken();

            if (!token) {
                throw new Error('No authentication token found');
            }

            // Build query parameters
            const params = new URLSearchParams();
            if (plant) params.append('plant', plant);

            // Handle "All Vehicle Types" selection - CORRECTED LOGIC
            if (vehicleType === "All Vehicle Types") {
                // Get all vehicle types for the selected plant and send them to backend
                const selectedPlantObj = plantData.find(p => {
                    const plantCode = p.PLANT || p.plant || p.name || p.NAME;
                    return plantCode && plantCode.toString() === plant.toString();
                });

                if (selectedPlantObj) {
                    const plantCode = selectedPlantObj.PLANT || selectedPlantObj.plant;
                    const allVehicleTypes = contractData
                        .filter(contract => {
                            const contractPlant = contract.PLANT || contract.plant;
                            return contractPlant && contractPlant.toString().includes(plantCode.toString());
                        })
                        .map(contract => contract.VEHICLE_TYPE || contract.vehicle_type)
                        .filter(type => type)
                        .filter((type, index, self) => self.indexOf(type) === index);

                    console.log('All Vehicle Types - sending to backend:', allVehicleTypes);

                    // Add all vehicle types as comma-separated string
                    params.append('all_vehicle_types', allVehicleTypes.join(','));
                }
            } else if (vehicleType && vehicleType !== "All Vehicle Types") {
                // Single vehicle type
                params.append('vehicle_type', vehicleType);
            }

            if (year) params.append('year', year);
            if (reportType) params.append('report_type', reportType);

            console.log('Fetching equipment monitoring report data with params:', {
                plant,
                vehicleType,
                year,
                reportType,
                url: `${API_BASE_URL}equipment-monitoring-reports?${params.toString()}`
            });

            const response = await fetch(`${API_BASE_URL}equipment-monitoring-reports?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                try {
                    const errorData = await response.text();
                    console.error('Equipment Monitoring Report API Error Response:', errorData);

                    try {
                        const jsonError = JSON.parse(errorData);
                        errorMessage = jsonError.message || jsonError.error || errorMessage;
                    } catch (e) {
                        if (errorData) {
                            errorMessage = errorData.substring(0, 200);
                        }
                    }
                } catch (e) {
                    console.error('Failed to read error response:', e);
                }

                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('Equipment Monitoring Report Response:', result);

            let equipmentReportRecords = [];

            if (result.success && result.data) {
                equipmentReportRecords = Array.isArray(result.data) ? result.data : [];
            } else if (result.status && result.data) {
                equipmentReportRecords = Array.isArray(result.data) ? result.data : [];
            } else if (Array.isArray(result)) {
                equipmentReportRecords = result;
            } else {
                console.warn('Unexpected equipment monitoring report response structure:', result);
                equipmentReportRecords = [];
            }

            console.log('Processed equipment monitoring report records:', {
                count: equipmentReportRecords.length,
                sample: equipmentReportRecords.slice(0, 3),
                filters: { plant, vehicleType, year, reportType }
            });

            setEquipmentReportData(equipmentReportRecords);

        } catch (error) {
            console.error('Error fetching equipment monitoring report data:', {
                error: error.message,
                plant,
                vehicleType,
                year,
                reportType
            });

            setEquipmentReportData([]);
            alert(`Failed to fetch equipment monitoring report data: ${error.message}`);
        } finally {
            setIsLoadingEquipmentReport(false);
        }
    };

    // useEffect(() => {
    //     if (plantData?.length > 0 && vehicleData?.length > 0) {
    //         debugDataStructure();
    //     }
    // }, [plantData, vehicleData, plantSubcategoryCounts]);
    // Add this to your existing useEffect that loads data on component mount
    useEffect(() => {
        fetchPlantData();
        fetchContractData();
        fetchVehicleCategoryData();
        fetchPlantSubcategoryCounts(); // Add this line
    }, []);
    const fetchEquipmentData = async (plant, vehicleType, fromDate, toDate) => {
        try {
            setIsLoadingEquipment(true);
            const token = getAuthToken();

            if (!token) {
                console.error('No authentication token found');
                return;
            }

            // Build query parameters
            const params = new URLSearchParams();
            if (plant) params.append('plant', plant);
            if (vehicleType) params.append('vehicle_type', vehicleType);
            if (fromDate) params.append('from_date', fromDate);
            if (toDate) params.append('to_date', toDate);

            console.log('Fetching equipment data with params:', {
                plant,
                vehicleType,
                fromDate,
                toDate,
                url: `${API_BASE_URL}equipment-monitoring?${params.toString()}`
            });

            const response = await fetch(`${API_BASE_URL}equipment-monitoring?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Equipment API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                throw new Error(`Failed to fetch equipment data: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Equipment Data Response:', result);

            // Handle the response based on your API structure
            let equipmentRecords = [];

            if (result.success && result.data) {
                equipmentRecords = Array.isArray(result.data) ? result.data : [];
            } else if (result.status && result.data) {
                equipmentRecords = Array.isArray(result.data) ? result.data : [];
            } else if (Array.isArray(result)) {
                equipmentRecords = result;
            } else {
                console.error('Invalid equipment data response structure:', result);
                equipmentRecords = [];
            }

            console.log('Processed equipment records:', {
                count: equipmentRecords.length,
                sample: equipmentRecords.slice(0, 3),
                plant,
                vehicleType
            });

            setEquipmentData(equipmentRecords);

        } catch (error) {
            console.error('Error fetching equipment data:', {
                error: error.message,
                plant,
                vehicleType,
                fromDate,
                toDate
            });
            setEquipmentData([]);
            // Show user-friendly error message
            alert(`Failed to fetch equipment data: ${error.message}`);
        } finally {
            setIsLoadingEquipment(false);
        }
    };

    // Enhanced ActionPage integration
    const ActionPageWithErrorHandling = () => (
        <ActionPage
            isOpen={isActionModalOpen}
            onClose={handleCloseActionModal}
            vehicleData={selectedVehicleForAction}
            plantData={plantData}
            selectedPlant={selectedPlantForAction}
            plantSubcategoryCounts={plantSubcategoryCounts}
        />
    );
    useEffect(() => {
        if (equipmentData.length > 0) {
            console.log('Sample equipment record structure:', equipmentData[0]);
            console.log('All equipment dates:', equipmentData.map(record => ({
                date: record.DATE,
                driver: record.DRIVER_CODE,
                vehicle: record.VEHICLE_NO,
                plant: record.PLANT,
                duration: record.DURATION,
                diesel: record.DIESEL_ISSUE
            })));
        }
    }, [equipmentData]);

    // Function to fetch contract data from API
    const fetchContractData = async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                console.error('No authentication token found');
                setIsLoadingContract(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}getContractData`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Contract API Error Response:', errorData);
                throw new Error(`Failed to fetch contract data: ${response.status} - ${errorData}`);
            }

            const result = await response.json();
            console.log('Contract Data Response:', result);

            if (result.status && result.data) {
                setContractData(result.data);
                console.log('Contract Data Set:', result.data);
            } else if (Array.isArray(result)) {
                setContractData(result);
                console.log('Contract Data Set (Array):', result);
            } else {
                console.error('No valid contract data found in response');
            }
        } catch (error) {
            console.error('Error fetching contract data:', error);
        } finally {
            setIsLoadingContract(false);
        }
    };

    // Function to fetch vehicle category data from API
    const fetchVehicleCategoryData = async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                console.error('No authentication token found');
                setIsLoadingVehicleCategories(false);
                return;
            }

            console.log('Fetching vehicle category data...');

            const response = await fetch(`${API_BASE_URL}getvehicategory`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Vehicle Category API Error:', errorData);
                throw new Error(`Failed to fetch vehicle category data: ${response.status}`);
            }

            const result = await response.json();
            console.log('Vehicle Category API Response:', result);

            if (result.status && result.data) {
                setVehicleCategoryData(result.data);
                console.log('Vehicle Category Data Set:', result.data);
            } else if (Array.isArray(result)) {
                setVehicleCategoryData(result);
                console.log('Vehicle Category Data Set (Array):', result);
            } else {
                console.error('Invalid vehicle category data response structure');
            }
        } catch (error) {
            console.error('Error fetching vehicle category data:', error);
            setVehicleCategoryData([]);
        } finally {
            setIsLoadingVehicleCategories(false);
        }
    };

    // Function to fetch plant data from API
    const fetchPlantData = async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                console.error('No authentication token found');
                setIsLoadingPlants(false);
                return;
            }

            console.log('Fetching plant data...');

            const response = await fetch(`${API_BASE_URL}plant-data`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Plant API Error:', errorData);
                throw new Error(`Failed to fetch plant data: ${response.status}`);
            }

            const result = await response.json();
            console.log('Plant API Response:', result);

            if (result.status && result.data) {
                setPlantData(result.data);
            } else if (Array.isArray(result)) {
                setPlantData(result);
            } else {
                console.error('Invalid plant data response structure');
            }
        } catch (error) {
            console.error('Error fetching plant data:', error);
            setPlantData([]);
        } finally {
            setIsLoadingPlants(false);
        }
    };
    useEffect(() => {
        console.log('Equipment fetch effect triggered:', {
            selectedDriverPlant,
            selectedVehicleType,
            selectedDate,
            selectedDays
        });

        if (selectedDriverPlant && selectedVehicleType && selectedDate) {
            // Calculate date range based on selectedDate and selectedDays
            const endDate = new Date(selectedDate);
            const startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - (selectedDays - 1));

            const fromDate = startDate.toISOString().split('T')[0];
            const toDate = endDate.toISOString().split('T')[0];

            console.log('Calculated date range:', {
                plant: selectedDriverPlant,
                vehicleType: selectedVehicleType,
                fromDate,
                toDate,
                selectedDays
            });

            fetchEquipmentData(selectedDriverPlant, selectedVehicleType, fromDate, toDate);
        } else {
            console.log('Missing required filters, clearing equipment data');
            setEquipmentData([]);
        }
    }, [selectedDriverPlant, selectedVehicleType, selectedDate, selectedDays]);

    useEffect(() => {
        if (selectedFinancialPlant && selectedFinancialVehicleType && selectedFinancialYear && selectedReportType) {
            fetchEquipmentMonitoringData(
                selectedFinancialPlant,
                selectedFinancialVehicleType,
                selectedFinancialYear,
                selectedReportType
            );
        } else {
            setEquipmentReportData([]);
        }
    }, [selectedFinancialPlant, selectedFinancialVehicleType, selectedFinancialYear, selectedReportType]);
    // Load plant data and contract data on component mount
    useEffect(() => {
        fetchPlantData();
        fetchContractData();
        fetchVehicleCategoryData();
    }, []);

    // Effect to update vehicle types based on selected driver plant
    useEffect(() => {
        console.log('Driver Plant Vehicle types effect triggered');
        console.log('Selected Driver Plant:', selectedDriverPlant);
        console.log('Contract Data Length:', contractData.length);
        console.log('Plant Data Length:', plantData.length);

        if (selectedDriverPlant && contractData.length > 0 && plantData.length > 0) {
            const selectedPlantObj = plantData.find(plant => {
                const plantCode = plant.PLANT || plant.plant || plant.name || plant.NAME || plant.plant_name || plant.PLANT_NAME;
                return plantCode && plantCode.toString() === selectedDriverPlant.toString();
            });

            console.log('Selected Driver Plant Object:', selectedPlantObj);

            if (selectedPlantObj) {
                const plantCode = selectedPlantObj.PLANT || selectedPlantObj.plant || selectedPlantObj.name || selectedPlantObj.NAME || 'Unknown Plant';

                console.log('Driver Plant Code to Match:', plantCode);

                const filteredVehicleTypes = contractData
                    .filter(contract => {
                        const contractPlant = contract.PLANT || contract.plant || contract.PLANT_NAME || contract.plant_name;

                        console.log('Comparing Driver Plant Codes:', {
                            plantCode: plantCode,
                            contractPlant: contractPlant,
                            match: contractPlant && plantCode &&
                                (contractPlant.toString().toLowerCase().trim() === plantCode.toString().toLowerCase().trim() ||
                                    contractPlant.toString().toLowerCase().includes(plantCode.toString().toLowerCase()) ||
                                    plantCode.toString().toLowerCase().includes(contractPlant.toString().toLowerCase()))
                        });

                        if (!contractPlant || !plantCode) return false;

                        if (contractPlant.toString().toLowerCase().trim() === plantCode.toString().toLowerCase().trim()) {
                            return true;
                        }

                        return contractPlant.toString().toLowerCase().includes(plantCode.toString().toLowerCase()) ||
                            plantCode.toString().toLowerCase().includes(contractPlant.toString().toLowerCase());
                    })
                    .map(contract => contract.VEHICLE_TYPE || contract.vehicle_type)
                    .filter(type => type)
                    .filter((type, index, self) => self.indexOf(type) === index);

                console.log('Filtered Driver Vehicle Types:', filteredVehicleTypes);
                setVehicleTypes(filteredVehicleTypes);
            } else {
                console.log('No matching driver plant found');
                setVehicleTypes([]);
            }
        } else {
            console.log('Missing driver data:', {
                hasDriverPlant: !!selectedDriverPlant,
                contractDataLength: contractData.length,
                plantDataLength: plantData.length
            });
            setVehicleTypes([]);
        }

        // Reset vehicle type selection when driver plant changes
        if (selectedVehicleType) {
            setSelectedVehicleType('');
        }
    }, [selectedDriverPlant, contractData, plantData]);

    useEffect(() => {
        if (selectedFinancialPlant && contractData.length > 0 && plantData.length > 0) {
            const selectedPlantObj = plantData.find(plant => {
                const plantCode = plant.PLANT || plant.plant || plant.name || plant.NAME;
                return plantCode && plantCode.toString() === selectedFinancialPlant.toString();
            });

            if (selectedPlantObj) {
                const plantCode = selectedPlantObj.PLANT || selectedPlantObj.plant;

                const filteredVehicleTypes = contractData
                    .filter(contract => {
                        const contractPlant = contract.PLANT || contract.plant;
                        return contractPlant && contractPlant.toString().includes(plantCode.toString());
                    })
                    .map(contract => contract.VEHICLE_TYPE || contract.vehicle_type)
                    .filter(type => type)
                    .filter((type, index, self) => self.indexOf(type) === index);

                // Add "All Vehicle Types" option if there are 2 or more vehicle types
                let vehicleTypesWithAll = [...filteredVehicleTypes];
                if (filteredVehicleTypes.length >= 2) {
                    vehicleTypesWithAll.unshift("All Vehicle Types");
                }

                setEquipmentPlantVehicleTypes(vehicleTypesWithAll);
            }
        } else {
            setEquipmentPlantVehicleTypes([]);
        }
    }, [selectedFinancialPlant, contractData, plantData]);
    // Generate sample vehicle data based on available plants
    const generateVehicleData = () => {
        if (vehicleCategoryData.length === 0) {
            return [];
        }

        // Group subcategories by category
        const groupedCategories = {};
        vehicleCategoryData.forEach(item => {
            const category = item.CATEGORY || item.category || 'Unknown Category';
            const subCategory = item.SUB_CATEGORY || item.sub_category || 'Unknown Sub Category';

            if (!groupedCategories[category]) {
                groupedCategories[category] = [];
            }
            if (!groupedCategories[category].includes(subCategory)) {
                groupedCategories[category].push(subCategory);
            }
        });

        // Create vehicle data array with unique sub categories
        const vehicleDataArray = [];
        let id = 1;

        Object.keys(groupedCategories).forEach(category => {
            groupedCategories[category].forEach(subCategory => {
                vehicleDataArray.push({
                    id: id++,
                    vehicleType: subCategory,
                    category: category
                });
            });
        });

        return vehicleDataArray;
    };

    // const vehicleData = vehicleCategoryData.length > 0 ? generateVehicleData() : [];

    // Generate sample driver data
    const generateDriverData = () => {
        // Return empty array when no real data
        return [];
    };

    const driverData = generateDriverData();

    // Sample report data
    const reportCategories = [
        {
            name: "Plant-wise Vehicle Reports",
            icon: FileText,
            reports: []
        },

        {
            name: "Equipment Monitoring Reports",
            icon: FileText,
            reports: []
        },
        {
            name: "Vehicle Reports",
            icon: FileText,
            reports: []
        },

    ];

    // Add this VehicleReportsTable component definition
    const VehicleReportsTable = () => {
        const handleAddAction = (vehicleId) => {
            console.log(`=== ADD ACTION TRIGGERED ===`);
            console.log(`Vehicle ID: ${vehicleId}`);

            // Find the vehicle data
            const vehicle = vehicleData.find(v => v.id === vehicleId);

            if (vehicle) {
                console.log('Selected vehicle for action:', vehicle);
                console.log('Available plant data count:', plantData?.length || 0);
                console.log('Plant subcategory counts available:', Object.keys(plantSubcategoryCounts || {}).length > 0);

                setSelectedVehicleForAction(vehicle);
                setSelectedPlantForAction('');
                setIsActionModalOpen(true);

                console.log('Action modal should open with real API calls');
            } else {
                console.error('❌ Vehicle not found:', vehicleId);
            }
        };

        const getPlantsWithVehicleType = () => {
            if (!plantData || !selectedVehicleForAction?.vehicleType) {
                console.log('Missing data for plant filtering:', {
                    hasPlantData: !!plantData,
                    hasSelectedVehicle: !!selectedVehicleForAction,
                    vehicleType: selectedVehicleForAction?.vehicleType
                });
                return [];
            }

            console.log('=== FILTERING PLANTS ===');
            console.log('Vehicle type to filter by:', selectedVehicleForAction.vehicleType);
            console.log('Total plants to check:', plantData.length);

            const filtered = plantData.filter(plant => {
                const count = getCountForPlantSubcategory(plant, selectedVehicleForAction.vehicleType);
                const hasVehicleType = count > 0;

                console.log(`Plant ${plant.PLANT || plant.plant}: count = ${count}, included = ${hasVehicleType}`);

                return hasVehicleType;
            });

            console.log('Filtered plants result:', {
                totalChecked: plantData.length,
                filtered: filtered.length,
                filteredPlants: filtered.map(p => ({
                    plant: p.PLANT || p.plant,
                    count: getCountForPlantSubcategory(p, selectedVehicleForAction.vehicleType)
                }))
            });

            return filtered;
        };
        // Function to get count for specific plant-subcategory combination
        const getCountForPlantSubcategory = (plant, subcategory) => {
            if (!plantSubcategoryCounts || Object.keys(plantSubcategoryCounts).length === 0) {
                console.log('No plant subcategory counts available');
                return 0;
            }

            console.log('=== ENHANCED COUNT MATCHING DEBUG ===');
            console.log('Input plant object:', plant);
            console.log('Input subcategory:', subcategory);
            console.log('Available counts keys:', Object.keys(plantSubcategoryCounts));

            // Get plant identifier with more variations
            const plantCode = plant.PLANT || plant.plant || plant.name || plant.NAME;
            const plantDesc = plant.DESCRIPTION || plant.description || plant.desc || plant.DESC;

            console.log('Extracted plant identifiers:', { plantCode, plantDesc });

            // Create comprehensive list of possible plant keys to match your data
            const possiblePlantKeys = [
                plantCode,
                plantDesc,
                `${plantCode}-${plantDesc}`,
                `${plantCode} ${plantDesc}`,
                `${plantCode} - ${plantDesc}`,
                plantCode?.split('-')[0]?.trim(), // Extract just the numeric part like "2001"
                plantCode?.replace(/[()]/g, '').trim(), // Remove parentheses
                plantCode?.replace(/[-()]/g, ' ').trim(), // Replace with spaces
                plantCode?.toLowerCase(),
                plantCode?.toUpperCase(),
            ].filter(key => key && key.toString().trim() !== '');

            console.log('Possible plant keys to try:', possiblePlantKeys);

            // Normalize strings for better matching
            const normalizeString = (str) => {
                if (!str) return '';
                return str.toString()
                    .replace(/\s*-\s*/g, '-')  // Normalize dashes
                    .replace(/\s+/g, ' ')      // Normalize spaces
                    .trim()
                    .toLowerCase();
            };

            const normalizedInputSubcategory = normalizeString(subcategory);
            console.log('Normalized input subcategory:', normalizedInputSubcategory);

            // STEP 1: Try exact matches first
            for (const plantKey of possiblePlantKeys) {
                if (plantSubcategoryCounts[plantKey] && plantSubcategoryCounts[plantKey][subcategory]) {
                    console.log(`✓ Exact match found: ${plantKey}[${subcategory}] = ${plantSubcategoryCounts[plantKey][subcategory]}`);
                    return plantSubcategoryCounts[plantKey][subcategory];
                }
            }

            // STEP 2: Try normalized subcategory matches
            for (const plantKey of possiblePlantKeys) {
                if (plantSubcategoryCounts[plantKey]) {
                    console.log(`✓ Found plant key: ${plantKey}, checking subcategories...`);
                    console.log('Available subcategories:', Object.keys(plantSubcategoryCounts[plantKey]));

                    for (const availableSubcat of Object.keys(plantSubcategoryCounts[plantKey])) {
                        const normalizedAvailableSubcat = normalizeString(availableSubcat);
                        console.log(`Comparing normalized: "${normalizedInputSubcategory}" vs "${normalizedAvailableSubcat}"`);

                        if (normalizedInputSubcategory === normalizedAvailableSubcat) {
                            console.log(`✓ Normalized match found: ${availableSubcat} = ${plantSubcategoryCounts[plantKey][availableSubcat]}`);
                            return plantSubcategoryCounts[plantKey][availableSubcat];
                        }
                    }
                }
            }

            // STEP 3: Try fuzzy matching for plant keys
            const availablePlantKeys = Object.keys(plantSubcategoryCounts);
            console.log('Trying fuzzy matching with available keys:', availablePlantKeys);

            for (const plantKey of possiblePlantKeys) {
                for (const availablePlantKey of availablePlantKeys) {
                    // Normalize both keys for comparison
                    const normalizedPlantKey = normalizeString(plantKey);
                    const normalizedAvailableKey = normalizeString(availablePlantKey);

                    // Check if plant keys are related (handle cases like "2001" matches "2001-My Home Cons.(Kodad)")
                    const isRelated = normalizedAvailableKey.includes(normalizedPlantKey) ||
                        normalizedPlantKey.includes(normalizedAvailableKey) ||
                        // Check if the first part before dash matches (handle "2001-..." patterns)
                        (normalizedPlantKey.includes('-') && normalizedAvailableKey.startsWith(normalizedPlantKey.split('-')[0])) ||
                        (normalizedAvailableKey.includes('-') && normalizedPlantKey.startsWith(normalizedAvailableKey.split('-')[0]));

                    if (isRelated) {
                        console.log(`✓ Found related plant key: ${availablePlantKey} (fuzzy matches ${plantKey})`);

                        // Check subcategories with normalization
                        for (const availableSubcat of Object.keys(plantSubcategoryCounts[availablePlantKey])) {
                            const normalizedAvailableSubcat = normalizeString(availableSubcat);

                            if (normalizedInputSubcategory === normalizedAvailableSubcat) {
                                console.log(`✓ Fuzzy plant + normalized subcat match: ${availableSubcat} = ${plantSubcategoryCounts[availablePlantKey][availableSubcat]}`);
                                return plantSubcategoryCounts[availablePlantKey][availableSubcat];
                            }
                        }
                    }
                }
            }

            // STEP 4: Try partial subcategory matches (for cases like "RMC" matching "RMCPLNT")
            for (const plantKey of possiblePlantKeys) {
                if (plantSubcategoryCounts[plantKey]) {
                    for (const availableSubcat of Object.keys(plantSubcategoryCounts[plantKey])) {
                        const normalizedAvailableSubcat = normalizeString(availableSubcat);

                        // Check if either contains the other (partial match)
                        if (normalizedInputSubcategory.includes(normalizedAvailableSubcat) ||
                            normalizedAvailableSubcat.includes(normalizedInputSubcategory)) {
                            console.log(`✓ Partial subcategory match: ${availableSubcat} = ${plantSubcategoryCounts[plantKey][availableSubcat]}`);
                            return plantSubcategoryCounts[plantKey][availableSubcat];
                        }
                    }
                }
            }

            // STEP 5: Try fuzzy plant + partial subcategory match
            for (const plantKey of possiblePlantKeys) {
                for (const availablePlantKey of availablePlantKeys) {
                    const normalizedPlantKey = normalizeString(plantKey);
                    const normalizedAvailableKey = normalizeString(availablePlantKey);

                    const isRelated = normalizedAvailableKey.includes(normalizedPlantKey) ||
                        normalizedPlantKey.includes(normalizedAvailableKey);

                    if (isRelated) {
                        for (const availableSubcat of Object.keys(plantSubcategoryCounts[availablePlantKey])) {
                            const normalizedAvailableSubcat = normalizeString(availableSubcat);

                            if (normalizedInputSubcategory.includes(normalizedAvailableSubcat) ||
                                normalizedAvailableSubcat.includes(normalizedInputSubcategory)) {
                                console.log(`✓ Full fuzzy match (plant + subcat): ${availableSubcat} = ${plantSubcategoryCounts[availablePlantKey][availableSubcat]}`);
                                return plantSubcategoryCounts[availablePlantKey][availableSubcat];
                            }
                        }
                    }
                }
            }

            console.log('✗ No match found after all attempts');
            return 0;
        };
        // Generate vehicle data based on available plants
        // const generateVehicleData = () => {
        //     if (vehicleCategoryData.length === 0) {
        //         return [];
        //     }

        //     // Group subcategories by category
        //     const groupedCategories = {};
        //     vehicleCategoryData.forEach(item => {
        //         const category = item.CATEGORY || item.category || 'Unknown Category';
        //         const subCategory = item.SUB_CATEGORY || item.sub_category || 'Unknown Sub Category';

        //         if (!groupedCategories[category]) {
        //             groupedCategories[category] = [];
        //         }
        //         if (!groupedCategories[category].includes(subCategory)) {
        //             groupedCategories[category].push(subCategory);
        //         }
        //     });

        //     // Create vehicle data array with unique sub categories
        //     const vehicleDataArray = [];
        //     let id = 1;

        //     Object.keys(groupedCategories).forEach(category => {
        //         groupedCategories[category].forEach(subCategory => {
        //             vehicleDataArray.push({
        //                 id: id++,
        //                 vehicleType: subCategory,
        //                 category: category
        //             });
        //         });
        //     });

        //     return vehicleDataArray;
        // };

        const vehicleData = vehicleCategoryData.length > 0 ? generateVehicleData() : [];
        // Handle saving data from the modal
        const handleSaveActionData = async (formData) => {
            try {
                console.log('Saving action data:', formData);

                const token = getAuthToken();
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Adjust this API endpoint according to your backend
                const response = await fetch(`${API_BASE_URL}vehicle-action`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        vehicle_type: formData.vehicleType,
                        plant_id: formData.plantId,
                        quantity: formData.quantity,
                        date: formData.date,
                        notes: formData.notes,
                        location: formData.location,
                        operating_hours: formData.operatingHours,
                        fuel_consumption: formData.fuelConsumption
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(`Failed to save: ${response.status} - ${errorData}`);
                }

                const result = await response.json();
                console.log('Saved successfully:', result);

                // Refresh data if needed
                fetchPlantSubcategoryCounts();

                alert('Action data saved successfully!');

            } catch (error) {
                console.error('Error saving:', error);
                alert('Failed to save: ' + error.message);
                throw error;
            }
        };

        // Handle modal close
        const handleCloseActionModal = () => {
            setIsActionModalOpen(false);
            setSelectedVehicleForAction(null);
            setSelectedPlantForAction('');
        };
        return (
            <div className="w-full">
                {vehicleCategoryData.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">
                            {isLoadingVehicleCategories || isLoadingPlants || isLoadingCounts
                                ? "Loading data..."
                                : "No vehicle category or plant data available"}
                        </p>
                    </div>
                ) : (
                    <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
                        <div className="overflow-x-auto overflow-y-auto max-h-96">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 z-20 bg-gray-50">
                                    <tr>
                                        <th className="sticky left-0 z-30 bg-gray-50 border-b border-r border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                                            <span className="text-sm">Action</span>
                                        </th>
                                        <th className="sticky left-24 z-30 bg-gray-50 border-b border-r border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                                            <span className="text-sm">Vehicle Type (Sub Category)</span>
                                        </th>
                                        {plantData.map((plant, index) => (
                                            <th
                                                key={index}
                                                className="border-b border-gray-300 px-1.5 py-1 text-center min-w-28 bg-gray-50"
                                            >
                                                <div className="flex flex-col items-center justify-center leading-tight">
                                                    <div className="font-bold text-gray-900 text-xs">
                                                        {plant.PLANT || plant.plant || plant.name || `Plant ${index + 1}`}
                                                    </div>
                                                    <div className="font-semibold text-gray-700 text-[10px]">
                                                        {(plant.DESCRIPTION || plant.description || 'No description').substring(0, 15)}...
                                                    </div>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {vehicleData.map((vehicle, index) => (
                                        <tr
                                            key={vehicle.id}
                                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors duration-150`}
                                        >
                                            <td className="sticky left-0 z-20 bg-white border-b border-r border-gray-300 px-4 py-3 w-24 text-center">
                                                <button
                                                    onClick={() => handleAddAction(vehicle.id)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center justify-center mx-auto"
                                                    title="Add Action"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </td>
                                            <td
                                                className={`sticky left-24 z-20 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-r border-gray-300 px-4 py-3 w-32 text-center text-gray-900 font-medium`}
                                            >
                                                <span className="text-xs font-medium">{vehicle.vehicleType}</span>
                                            </td>
                                            {plantData.map((plant, plantIndex) => {
                                                const count = getCountForPlantSubcategory(plant, vehicle.vehicleType);
                                                return (
                                                    <td
                                                        key={plantIndex}
                                                        className="border-b border-gray-300 px-1.5 py-1 text-center min-w-28"
                                                    >
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border-2 ${count > 0
                                                            ? 'bg-green-200 text-green-900 border-green-400 shadow-sm'
                                                            : 'bg-gray-200 text-gray-700 border-gray-400'
                                                            }`}>
                                                            {isLoadingCounts ? '...' : count}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Action Modal */}
                            {/* Action Modal - Update this part in your VehicleReportsTable component */}
                            <ActionPage
                                isOpen={isActionModalOpen}
                                onClose={handleCloseActionModal}
                                vehicleData={selectedVehicleForAction}
                                plantData={plantData}
                                selectedPlant={selectedPlantForAction}
                                plantSubcategoryCounts={plantSubcategoryCounts}  // Add this line
                            />
                        </div>

                        {/* Summary Section */}
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">
                                    Total Vehicle Types: {vehicleData.length}
                                </span>
                                <span className="text-gray-600">
                                    Total Plants: {plantData.length}
                                </span>
                                <span className="text-gray-600">
                                    {isLoadingCounts ? 'Loading counts...' : `Total Records: ${Object.values(plantSubcategoryCounts).reduce((total, plantCounts) => {
                                        return total + Object.values(plantCounts || {}).reduce((sum, count) => sum + (count || 0), 0);
                                    }, 0)}`}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const DriverReportsTable = () => {
        const dayOptions = [7, 15, 30, 60, 90];

        // Get driver data based on selected plant and vehicle type
        const getFilteredDriverData = () => {
            if (!selectedDriverPlant || !selectedVehicleType || contractData.length === 0) {
                return [];
            }

            // Find the selected plant object
            const selectedPlantObj = plantData.find(plant => {
                const plantCode = plant.PLANT || plant.plant || plant.name || plant.NAME || plant.plant_name || plant.PLANT_NAME;
                return plantCode && plantCode.toString() === selectedDriverPlant.toString();
            });

            if (!selectedPlantObj) {
                return [];
            }

            const plantCode = selectedPlantObj.PLANT || selectedPlantObj.plant || selectedPlantObj.name || selectedPlantObj.NAME || 'Unknown Plant';

            // Filter contract data based on plant and vehicle type combination
            const filteredContracts = contractData.filter(contract => {
                const contractPlant = contract.PLANT || contract.plant || contract.PLANT_NAME || contract.plant_name;
                const contractVehicleType = contract.VEHICLE_TYPE || contract.vehicle_type;

                const plantMatches = contractPlant && plantCode &&
                    (contractPlant.toString().toLowerCase().trim() === plantCode.toString().toLowerCase().trim() ||
                        contractPlant.toString().toLowerCase().includes(plantCode.toString().toLowerCase()) ||
                        plantCode.toString().toLowerCase().includes(contractPlant.toString().toLowerCase()));

                return plantMatches && contractVehicleType === selectedVehicleType;
            });

            console.log('Filtered Contracts for Driver Data:', filteredContracts);

            // Transform contract data to driver data
            return filteredContracts.map((contract, index) => ({
                id: contract.id || index + 1,
                code: contract.DRIVER || contract.driver || `DR${String(index + 1).padStart(3, '0')}`,
                name: contract.DRIVER_NAME || contract.driver_name || 'No Driver Assigned',
                vehicleNo: contract.VEHICLE_NO || contract.vehicle_no || `VH${String(index + 1).padStart(3, '0')}`,
                vehicleName: contract.VEHICLE_NAME || contract.vehicle_name || `Vehicle ${index + 1}`,
                originalData: contract
            }));
        };

        // Generate date columns based on selected date and days
        const generateDateColumns = () => {
            const baseDate = new Date(selectedDate);
            const columns = [];

            for (let i = 0; i < selectedDays; i++) {
                const currentDate = new Date(baseDate);
                currentDate.setDate(baseDate.getDate() - i);

                columns.push({
                    dayNumber: String(i + 1).padStart(2, '0'),
                    date: currentDate.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit'
                    }),
                    fullDate: currentDate.toISOString().split('T')[0]
                });
            }

            return columns;
        };

        // Function to get equipment data for specific driver and date
        const getEquipmentDataForDriverAndDate = (driverCode, vehicleNo, date) => {
            if (!equipmentData || equipmentData.length === 0) {
                return { duration: '0h', diesel: '0L' };
            }

            console.log('Looking for equipment data:', {
                driverCode,
                vehicleNo,
                date,
                availableRecords: equipmentData.length
            });

            const matchingRecord = equipmentData.find(record => {
                const recordDate = record.DATE;
                const recordDriverCode = record.DRIVER_CODE;
                const recordVehicleNo = record.VEHICLE_NO;
                const recordPlant = record.PLANT;

                console.log('Comparing record:', {
                    recordDate,
                    recordDriverCode,
                    recordVehicleNo,
                    recordPlant,
                    targetDate: date,
                    targetDriverCode: driverCode,
                    targetVehicleNo: vehicleNo
                });

                // Match by date first
                const dateMatches = recordDate === date;

                // Match by driver code OR vehicle number
                const driverMatches = recordDriverCode && driverCode &&
                    (recordDriverCode.toString().trim() === driverCode.toString().trim());
                const vehicleMatches = recordVehicleNo && vehicleNo &&
                    (recordVehicleNo.toString().trim() === vehicleNo.toString().trim());

                // Plant matching - check if record plant matches selected plant
                let plantMatches = true;
                if (selectedDriverPlant && recordPlant) {
                    // Handle plant names like "2001-My Home Cons.(Kodad)" vs "2001"
                    const plantMatches1 = recordPlant.toString().includes(selectedDriverPlant.toString());
                    const plantMatches2 = selectedDriverPlant.toString().includes(recordPlant.toString());
                    plantMatches = plantMatches1 || plantMatches2;
                }

                const isMatch = dateMatches && (driverMatches || vehicleMatches) && plantMatches;

                if (isMatch) {
                    console.log('Found matching record:', record);
                }

                return isMatch;
            });

            if (matchingRecord) {
                const duration = matchingRecord.DURATION || '0h';
                const dieselIssue = matchingRecord.DIESEL_ISSUE || '0';

                return {
                    duration: duration,
                    diesel: `${dieselIssue}L`
                };
            }

            console.log('No matching record found');
            return { duration: '0h', diesel: '0L' };
        };
        // Function to calculate totals for a driver
        const calculateDriverTotals = (driverCode, vehicleNo, dateColumns) => {
            let totalHours = 0;
            let totalDiesel = 0;

            dateColumns.forEach(dateCol => {
                const data = getEquipmentDataForDriverAndDate(driverCode, vehicleNo, dateCol.fullDate);

                // Parse duration (handle formats like "8h 30m", "8h", "8.5h", "8 h 30 m")
                const durationStr = data.duration.replace(/[^\d.:hm\s]/g, '');

                // Extract hours
                const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)\s*h/);
                const hours = hoursMatch ? parseFloat(hoursMatch[1]) : 0;

                // Extract minutes
                const minutesMatch = durationStr.match(/(\d+)\s*m/);
                const minutes = minutesMatch ? parseFloat(minutesMatch[1]) / 60 : 0;

                totalHours += hours + minutes;

                // Parse diesel (assuming format like "50L", "50.5L", or just "50")
                const dieselStr = data.diesel.replace(/[^\d.]/g, '');
                const dieselValue = dieselStr ? parseFloat(dieselStr) : 0;
                totalDiesel += dieselValue;
            });

            return {
                totalHours: `${totalHours.toFixed(1)}h`,
                totalDiesel: `${totalDiesel.toFixed(1)}L`
            };
        };

        const dateColumns = generateDateColumns();
        const filteredDriverData = getFilteredDriverData();

        return (
            <div className="w-full">
                {/* Compact Filters */}
                <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Plant Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Plant
                            </label>
                            <select
                                value={selectedDriverPlant}
                                onChange={(e) => setSelectedDriverPlant(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={isLoadingPlants}
                            >
                                <option value="">
                                    {isLoadingPlants ? "Loading plants..." : "All Plants"}
                                </option>
                                {plantData.map((plant, index) => {
                                    const plantCode = plant.PLANT || plant.plant || plant.name || plant.NAME || plant.plant_name || plant.PLANT_NAME || `Plant ${index + 1}`;
                                    const plantDesc = plant.DESCRIPTION || plant.description || plant.desc || plant.DESC || 'No description';

                                    return (
                                        <option key={index} value={plantCode}>
                                            {plantCode} - {plantDesc}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Vehicle Type Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Vehicle Type
                            </label>
                            <select
                                value={selectedVehicleType}
                                onChange={(e) => setSelectedVehicleType(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={!selectedDriverPlant || isLoadingContract}
                            >
                                <option value="">
                                    {!selectedDriverPlant
                                        ? "Select Plant first"
                                        : isLoadingContract
                                            ? "Loading vehicle types..."
                                            : vehicleTypes.length === 0
                                                ? "No vehicle types available"
                                                : "All Vehicle Types"
                                    }
                                </option>
                                {selectedDriverPlant && vehicleTypes.map((vehicleType, index) => (
                                    <option key={index} value={vehicleType}>
                                        {vehicleType}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* Days Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Days
                            </label>
                            <select
                                value={selectedDays}
                                onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                {dayOptions.map((days) => (
                                    <option key={days} value={days}>
                                        {days} Days
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading Indicator */}
                {/* {isLoadingEquipment && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-blue-700 text-sm">Loading equipment data...</p>
                    </div>
                )} */}

                {/* Driver Reports Table */}
                <div className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full border-collapse min-w-max text-sm">
                            <thead className="sticky top-0 z-20 bg-gray-50">
                                <tr>
                                    <th className="sticky left-0 z-30 bg-gray-50 border-b border-r border-gray-300 px-3 py-2 text-center font-semibold text-gray-900 w-24">
                                        Driver Code
                                    </th>
                                    <th className="sticky left-0 z-30 bg-gray-50 border-b border-r border-gray-300 px-3 py-2 text-center font-semibold text-gray-900 w-24">
                                        Vehicle Number
                                    </th>
                                    {/* Date columns */}
                                    {dateColumns.map((dateCol, i) => (
                                        <th
                                            key={i}
                                            className="border-b border-r border-gray-300 px-1 py-2 text-center font-semibold text-gray-900 min-w-16"
                                        >
                                            <div className="text-xs">
                                                <div className="font-bold">{dateCol.dayNumber}</div>
                                                <div className="text-[10px] text-gray-600">{dateCol.date}</div>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="sticky right-16 z-30 bg-gray-50 border-b border-r border-gray-300 px-2 py-2 text-center font-semibold text-gray-900 w-20">
                                        <div className="text-xs">Total Hours</div>
                                    </th>
                                    <th className="sticky right-0 z-30 bg-gray-50 border-b border-gray-300 px-2 py-2 text-center font-semibold text-gray-900 w-20">
                                        <div className="text-xs">Total Diesel</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDriverData.length === 0 ? (
                                    <tr>
                                        <td colSpan={selectedDays + 3} className="text-center py-8 text-gray-500">
                                            {!selectedDriverPlant || !selectedVehicleType
                                                ? "Please select both Plant and Vehicle Type to view driver data"
                                                : "No driver data available for the selected combination"
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDriverData.map((driver, index) => {
                                        const driverTotals = calculateDriverTotals(driver.code, driver.vehicleNo, dateColumns);

                                        return (
                                            <tr
                                                key={index}
                                                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors duration-150`}
                                            >
                                                {/* Driver Code */}
                                                <td className="sticky left-0 z-20 bg-white border-b border-r border-gray-300 px-3 py-2 w-24 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-mono text-xs font-medium text-gray-800">{driver.code}</span>
                                                        <span className="text-[10px] text-gray-500 truncate max-w-20" title={driver.name}>
                                                            {driver.name}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Vehicle Number */}
                                                <td className="sticky left-24 z-20 bg-white border-b border-r border-gray-300 px-3 py-2 w-28 text-center">
                                                    <span className="font-mono text-xs font-medium text-gray-800">{driver.vehicleNo}</span>
                                                </td>

                                                {/* Daily records */}
                                                {dateColumns.map((dateCol, dayIndex) => {
                                                    const equipmentInfo = getEquipmentDataForDriverAndDate(driver.code, driver.vehicleNo, dateCol.fullDate);

                                                    return (
                                                        <td
                                                            key={dayIndex}
                                                            className="border-b border-r border-gray-300 px-1 py-2 text-center min-w-16"
                                                        >
                                                            <div className="text-xs">
                                                                <div className="font-medium text-gray-800">{equipmentInfo.duration}</div>
                                                                <div className="text-[10px] text-gray-600">{equipmentInfo.diesel}</div>
                                                            </div>
                                                        </td>
                                                    );
                                                })}

                                                {/* Totals */}
                                                <td className="sticky right-16 z-20 bg-white border-b border-r border-gray-300 px-2 py-2 w-20 text-center">
                                                    <span className="text-xs font-medium text-gray-800">{driverTotals.totalHours}</span>
                                                </td>
                                                <td className="sticky right-0 z-20 bg-white border-b border-gray-300 px-2 py-2 w-20 text-center">
                                                    <span className="text-xs font-medium text-gray-800">{driverTotals.totalDiesel}</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>
        );
    };
    const EquipmentMonitoringReportsTable = ({ selectedReportType, setSelectedReportType }) => {
        const yearOptions = [];
        const currentYear = new Date().getFullYear();
        for (let i = currentYear - 5; i <= currentYear + 2; i++) {
            yearOptions.push(i);
        }

        const reportTypeOptions = [
            { value: 'monthly', label: 'Monthly' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'half-yearly', label: 'Half Yearly' },
            { value: 'annually', label: 'Annually' }
        ];


        const generateReportColumns = () => {
            switch (selectedReportType) {
                case 'monthly':
                    return [
                        { key: 'jan', label: 'January', shortLabel: 'Jan', period: '01' },
                        { key: 'feb', label: 'February', shortLabel: 'Feb', period: '02' },
                        { key: 'mar', label: 'March', shortLabel: 'Mar', period: '03' },
                        { key: 'apr', label: 'April', shortLabel: 'Apr', period: '04' },
                        { key: 'may', label: 'May', shortLabel: 'May', period: '05' },
                        { key: 'jun', label: 'June', shortLabel: 'Jun', period: '06' },
                        { key: 'jul', label: 'July', shortLabel: 'Jul', period: '07' },
                        { key: 'aug', label: 'August', shortLabel: 'Aug', period: '08' },
                        { key: 'sep', label: 'September', shortLabel: 'Sep', period: '09' },
                        { key: 'oct', label: 'October', shortLabel: 'Oct', period: '10' },
                        { key: 'nov', label: 'November', shortLabel: 'Nov', period: '11' },
                        { key: 'dec', label: 'December', shortLabel: 'Dec', period: '12' }
                    ];
                case 'quarterly':
                    return [
                        { key: 'q1', label: 'Q1 (Jan-Mar)', shortLabel: 'Q1', period: 'Q1(Jan-Mar)' },
                        { key: 'q2', label: 'Q2 (Apr-Jun)', shortLabel: 'Q2', period: 'Q2(Apr-Jun)' },
                        { key: 'q3', label: 'Q3 (Jul-Sep)', shortLabel: 'Q3', period: 'Q3(Jul-Sep)' },
                        { key: 'q4', label: 'Q4 (Oct-Dec)', shortLabel: 'Q4', period: 'Q4(Oct-Dec)' }
                    ];
                case 'half-yearly':
                    return [
                        { key: 'h1', label: 'H1 (Jan-Jun)', shortLabel: 'H1', period: 'H1(Jan-Jun)' },
                        { key: 'h2', label: 'H2 (Jul-Dec)', shortLabel: 'H2', period: 'H2(Jul-Dec)' }
                    ];
                case 'annually':
                    return [
                        { key: 'annual', label: 'Annual', shortLabel: 'Annual', period: 'ANNUAL' }
                    ];
                default:
                    return [];
            }
        };



        const getEquipmentDataForPeriod = (vehicleNumber, periodKey, period) => {
            if (!equipmentReportData || equipmentReportData.length === 0) {
                return { totalHours: 0, totalDiesel: 0, records: 0 };
            }

            console.log('Getting data for period - ALL VEHICLE TYPES FIX:', {
                vehicleNumber,
                periodKey,
                period,
                selectedReportType,
                selectedFinancialYear,
                selectedFinancialVehicleType,
                totalAvailableRecords: equipmentReportData.length
            });

            // Filter records for the specific vehicle and period
            // IMPORTANT: Even when "All Vehicle Types" is selected, each row should show its individual vehicle data
            const filteredRecords = equipmentReportData.filter(record => {
                const recordVehicle = record.VEHICLE_NO || record.vehicle_no;
                const recordDate = new Date(record.updated_at || record.DATE);
                const recordYear = recordDate.getFullYear();
                const recordMonth = recordDate.getMonth() + 1;

                console.log('Checking record for vehicle match:', {
                    recordVehicle,
                    targetVehicle: vehicleNumber,
                    vehicleMatches: recordVehicle && vehicleNumber &&
                        recordVehicle.toString().trim() === vehicleNumber.toString().trim(),
                    recordDate: recordDate.toISOString().split('T')[0],
                    recordYear,
                    recordMonth,
                    recordDuration: record.DURATION,
                    recordDiesel: record.DIESEL_ISSUE,
                    selectedFinancialVehicleType
                });

                // Exact vehicle match is critical - this works for both individual and "All Vehicle Types"
                const vehicleMatches = recordVehicle && vehicleNumber &&
                    recordVehicle.toString().trim() === vehicleNumber.toString().trim();

                const yearMatches = recordYear === selectedFinancialYear;

                if (!vehicleMatches || !yearMatches) {
                    return false;
                }

                // Period matching logic
                switch (selectedReportType) {
                    case 'monthly':
                        const monthPeriod = period.toString().padStart(2, '0');
                        const recordMonthFormatted = recordMonth.toString().padStart(2, '0');
                        const matches = recordMonthFormatted === monthPeriod;
                        console.log('Monthly match check:', {
                            period: monthPeriod,
                            recordMonth: recordMonthFormatted,
                            matches
                        });
                        return matches;

                    case 'quarterly':
                        let quarterMatch = false;
                        if (period === 'Q1(Jan-Mar)') {
                            quarterMatch = recordMonth >= 1 && recordMonth <= 3;
                        } else if (period === 'Q2(Apr-Jun)') {
                            quarterMatch = recordMonth >= 4 && recordMonth <= 6;
                        } else if (period === 'Q3(Jul-Sep)') {
                            quarterMatch = recordMonth >= 7 && recordMonth <= 9;
                        } else if (period === 'Q4(Oct-Dec)') {
                            quarterMatch = recordMonth >= 10 && recordMonth <= 12;
                        }
                        return quarterMatch;

                    case 'half-yearly':
                        let halfYearMatch = false;
                        if (period === 'H1(Jan-Jun)') {
                            halfYearMatch = recordMonth >= 1 && recordMonth <= 6;
                        } else if (period === 'H2(Jul-Dec)') {
                            halfYearMatch = recordMonth >= 7 && recordMonth <= 12;
                        }
                        return halfYearMatch;

                    case 'annually':
                        return true;

                    default:
                        return false;
                }
            });

            console.log('Filtered records for vehicle:', {
                vehicleNumber,
                period,
                filteredCount: filteredRecords.length,
                recordDetails: filteredRecords.map(r => ({
                    vehicle: r.VEHICLE_NO,
                    date: r.DATE || r.updated_at,
                    duration: r.DURATION,
                    diesel: r.DIESEL_ISSUE
                }))
            });

            let totalHours = 0;
            let totalDiesel = 0;

            filteredRecords.forEach(record => {
                // Parse duration carefully
                const duration = record.DURATION || record.duration || '0h';
                const durationStr = duration.toString().replace(/[^\d.:hm\s]/g, '');

                // Extract hours
                const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)\s*h/);
                const hours = hoursMatch ? parseFloat(hoursMatch[1]) : 0;

                // Extract minutes and convert to hours
                const minutesMatch = durationStr.match(/(\d+)\s*m/);
                const minutes = minutesMatch ? parseFloat(minutesMatch[1]) / 60 : 0;

                const recordHours = hours + minutes;
                totalHours += recordHours;

                // Parse diesel - use the exact value from database
                const diesel = record.DIESEL_ISSUE || record.diesel_issue || 0;
                const dieselValue = parseFloat(diesel) || 0;
                totalDiesel += dieselValue;

                console.log('Processing individual record:', {
                    vehicle: record.VEHICLE_NO,
                    duration: duration,
                    parsedHours: recordHours,
                    diesel: diesel,
                    parsedDiesel: dieselValue
                });
            });

            const result = {
                totalHours: Math.round(totalHours * 10) / 10,
                totalDiesel: Math.round(totalDiesel * 10) / 10,
                records: filteredRecords.length
            };

            console.log('Final calculation result:', {
                vehicleNumber,
                period,
                selectedFinancialVehicleType,
                result
            });

            return result;
        };

        const getFilteredEquipmentData = () => {
            if (!selectedFinancialPlant || !selectedFinancialVehicleType || contractData.length === 0) {
                return [];
            }

            const selectedPlantObj = plantData.find(plant => {
                const plantCode = plant.PLANT || plant.plant;
                return plantCode && plantCode.toString() === selectedFinancialPlant.toString();
            });

            if (!selectedPlantObj) return [];

            const plantCode = selectedPlantObj.PLANT || selectedPlantObj.plant;
            const plantDescription = selectedPlantObj.DESCRIPTION || selectedPlantObj.description || 'No description';

            let filteredContracts;

            if (selectedFinancialVehicleType === "All Vehicle Types") {
                // Get all vehicles for this plant grouped by vehicle type
                filteredContracts = contractData.filter(contract => {
                    const contractPlant = contract.PLANT || contract.plant;
                    return contractPlant && contractPlant.toString().includes(plantCode.toString());
                });

                console.log('All Vehicle Types - Found contracts:', filteredContracts.length);

                // Group by vehicle type for better display
                const groupedByType = {};
                filteredContracts.forEach(contract => {
                    const vehicleType = contract.VEHICLE_TYPE || contract.vehicle_type;
                    if (!groupedByType[vehicleType]) {
                        groupedByType[vehicleType] = [];
                    }
                    groupedByType[vehicleType].push(contract);
                });

                // Flatten back to array but maintain grouping info
                const result = [];
                Object.keys(groupedByType).forEach(vehicleType => {
                    groupedByType[vehicleType].forEach((contract, index) => {
                        result.push({
                            id: contract.id || `${vehicleType}_${index}`,
                            plant: plantCode,
                            plantDescription: plantDescription,
                            vehicleType: vehicleType, // Show actual vehicle type, not "All Vehicle Types"
                            vehicleNumber: contract.VEHICLE_NO || contract.vehicle_no || `VH${index + 1}`,
                            driverName: contract.DRIVER_NAME || contract.driver_name || 'No Driver',
                            originalData: contract,
                            isAllVehicleTypesMode: true // Flag to identify this mode
                        });
                    });
                });

                console.log('All Vehicle Types - Final result:', {
                    totalVehicles: result.length,
                    vehicleTypes: Object.keys(groupedByType),
                    sample: result.slice(0, 2)
                });

                return result;
            } else {
                // Get specific vehicle type (original logic)
                filteredContracts = contractData.filter(contract => {
                    const contractPlant = contract.PLANT || contract.plant;
                    const contractVehicleType = contract.VEHICLE_TYPE || contract.vehicle_type;

                    const plantMatches = contractPlant && plantCode &&
                        contractPlant.toString().includes(plantCode.toString());

                    return plantMatches && contractVehicleType === selectedFinancialVehicleType;
                });

                return filteredContracts.map((contract, index) => ({
                    id: contract.id || index + 1,
                    plant: plantCode,
                    plantDescription: plantDescription,
                    vehicleType: contract.VEHICLE_TYPE || contract.vehicle_type || selectedFinancialVehicleType,
                    vehicleNumber: contract.VEHICLE_NO || contract.vehicle_no || `VH${index + 1}`,
                    driverName: contract.DRIVER_NAME || contract.driver_name || 'No Driver',
                    originalData: contract,
                    isAllVehicleTypesMode: false
                }));
            }
        };

        const reportColumns = generateReportColumns();
        const filteredEquipmentData = getFilteredEquipmentData();

        return (
            <div className="w-full">
                {/* Filters */}
                <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Plant</label>
                            <select
                                value={selectedFinancialPlant}
                                onChange={(e) => setSelectedFinancialPlant(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={isLoadingPlants}
                            >
                                <option value="">{isLoadingPlants ? "Loading..." : "Select Plant"}</option>
                                {plantData.map((plant, index) => {
                                    const plantCode = plant.PLANT || plant.plant;
                                    const plantDesc = plant.DESCRIPTION || plant.description || 'No description';
                                    return (
                                        <option key={index} value={plantCode}>
                                            {plantCode} - {plantDesc}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type</label>
                            <select
                                value={selectedFinancialVehicleType}
                                onChange={(e) => setSelectedFinancialVehicleType(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={!selectedFinancialPlant || isLoadingContract}
                            >
                                <option value="">
                                    {!selectedFinancialPlant ? "Select Plant first" : "Select Vehicle Type"}
                                </option>
                                {equipmentPlantVehicleTypes.map((vehicleType, index) => (
                                    <option key={index} value={vehicleType}>{vehicleType}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                            <select
                                value={selectedFinancialYear}
                                onChange={(e) => setSelectedFinancialYear(parseInt(e.target.value))}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Report Type</label>
                            <select
                                value={selectedReportType}
                                onChange={(e) => setSelectedReportType(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                {reportTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {isLoadingEquipmentReport && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-blue-700 text-sm">Loading equipment monitoring data...</p>
                    </div>
                )}

                {/* Table */}
                <div className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full border-collapse min-w-max text-sm">
                            <thead className="sticky top-0 z-20 bg-gray-50">
                                <tr>
                                    <th className="sticky left-0 z-30 bg-gray-50 border-b border-r border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-48">Plant</th>
                                    <th className="sticky left-48 z-30 bg-gray-50 border-b border-r border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">Vehicle Type</th>
                                    <th className="sticky left-80 z-30 bg-gray-50 border-b border-r border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">Vehicle Number</th>

                                    {reportColumns.map((column, index) => (
                                        <th key={column.key} className={`border-b border-gray-300 px-3 py-3 text-center font-semibold text-gray-900 min-w-32 ${index === reportColumns.length - 1 ? '' : 'border-r'}`}>
                                            <div className="text-xs">
                                                <div className="font-bold">{column.shortLabel}</div>
                                                <div className="text-[10px] text-gray-500"></div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEquipmentData.length === 0 ? (
                                    <tr>
                                        <td colSpan={3 + reportColumns.length} className="text-center py-8 text-gray-500">
                                            {!selectedFinancialPlant || !selectedFinancialVehicleType
                                                ? "Please select both Plant and Vehicle Type"
                                                : "No data available"}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEquipmentData.map((item, index) => (
                                        <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
                                            <td className="sticky left-0 z-20 bg-white border-b border-r border-gray-300 px-4 py-3 w-48 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-medium">{item.plant}</span>
                                                    <span className="text-xs text-gray-600">{item.plantDescription}</span>
                                                </div>
                                            </td>
                                            <td className={`sticky left-48 z-20 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-r border-gray-300 px-4 py-3 w-32 text-center`}>
                                                <span className="text-sm font-medium">{item.vehicleType}</span>
                                            </td>
                                            <td className={`sticky left-80 z-20 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-r border-gray-300 px-4 py-3 w-32 text-center`}>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-medium">{item.vehicleNumber}</span>
                                                    <span className="text-xs text-gray-600">{item.driverName}</span>
                                                </div>
                                            </td>

                                            {reportColumns.map((column, columnIndex) => {
                                                const data = getEquipmentDataForPeriod(item.vehicleNumber, column.key, column.period);
                                                return (
                                                    <td key={column.key} className={`border-b border-gray-300 px-3 py-3 min-w-32 text-center ${columnIndex === reportColumns.length - 1 ? '' : 'border-r'}`}>
                                                        <div className="text-xs">
                                                            <div className="font-medium text-gray-800">{data.totalHours}h</div>
                                                            <div className="font-medium text-blue-600">{data.totalDiesel}L</div>
                                                            <div className="text-[10px] text-gray-500">({data.records} records)</div>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Section */}
                    {filteredEquipmentData.length > 0 && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">
                                    Total Vehicles: {filteredEquipmentData.length}
                                </span>
                                <span className="text-gray-600">
                                    Report Period: {selectedReportType} - {selectedFinancialYear}
                                </span>
                                <span className="text-gray-600">
                                    {isLoadingEquipmentReport ? 'Loading...' : `Total Records: ${equipmentReportData.length}`}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    const ReportCard = ({ report, colorScheme }) => {
        const colorClasses = {
            blue: {
                border: "border-l-4 border-blue-500 hover:border-blue-600",
                bg: "bg-white hover:bg-blue-50",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
                buttonBg: "bg-blue-500 hover:bg-blue-600"
            },
            green: {
                border: "border-l-4 border-green-500 hover:border-green-600",
                bg: "bg-white hover:bg-green-50",
                iconBg: "bg-green-100",
                iconColor: "text-green-600",
                buttonBg: "bg-green-500 hover:bg-green-600"
            },
            purple: {
                border: "border-l-4 border-purple-500 hover:border-purple-600",
                bg: "bg-white hover:bg-purple-50",
                iconBg: "bg-purple-100",
                iconColor: "text-purple-600",
                buttonBg: "bg-purple-500 hover:bg-purple-600"
            }
        };

        const colors = colorClasses[colorScheme];

        return (
            <div className={`${colors.border} ${colors.bg} rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 transform hover:-translate-y-1`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className={`${colors.iconBg} p-3 rounded-full`}>
                            <FileText className={`${colors.iconColor} text-xl`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{report.name}</h3>
                            <p className="text-gray-600 text-sm">{report.description}</p>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button className={`flex-1 ${colors.buttonBg} text-white py-2 px-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2`}>
                        <Eye className="text-sm" />
                        <span>View</span>
                    </button>
                    <button className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center">
                        <Download className="text-sm" />
                    </button>
                    <button className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center">
                        <Printer className="text-sm" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 py-4 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="text-white text-lg" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">Reports Dashboard</h1>
                                    <p className="text-blue-100 text-sm">Fleet Management Reports</p>
                                </div>
                            </div>
                            <button
                                onClick={() => window.history.back()}
                                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors duration-200"
                            >
                                <ArrowLeft className="text-lg" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reports Categories */}
                {reportCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 bg-[#F0DBDB]">

                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <category.icon className="mr-2 text-black-600" />
                                    {category.name}
                                </h3>
                            </div>

                            <div className="p-6">
                                {category.name === "Plant-wise Vehicle Reports" ? (
                                    <VehicleReportsTable />
                                ) : category.name === "Vehicle Reports" ? (
                                    <DriverReportsTable />
                                ) : category.name === "Equipment Monitoring Reports" ? (
                                    <EquipmentMonitoringReportsTable
                                        selectedReportType={selectedReportType}
                                        setSelectedReportType={setSelectedReportType}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {category.reports.map((report, reportIndex) => (
                                            <ReportCard
                                                key={reportIndex}
                                                report={report}
                                                colorScheme={report.colorScheme}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;