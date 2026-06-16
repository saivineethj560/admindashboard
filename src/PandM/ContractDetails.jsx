import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, CheckCircle, X, AlertTriangle, AlertCircle } from 'lucide-react';
import {API_BASE_URL} from '../Config.jsx';
const ContractDetails = () => {
    const [formData, setFormData] = useState({
        plant: '',
        plantDescription: '',
        vendorName: '',
        vendorNumber: '',
        quantity: '',
        workOrderNumber: '',
        fromDate: '',
        toDate: '',
        value: '',
        durTime: ''
    });

    const [vehicleRecords, setVehicleRecords] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [plantData, setPlantData] = useState([]);
    const [isLoadingPlants, setIsLoadingPlants] = useState(true);
    const [driverCodes, setDriverCodes] = useState([]);
    const [isLoadingDriverCodes, setIsLoadingDriverCodes] = useState(false);
    const [filteredDriverCodes, setFilteredDriverCodes] = useState({});
    const [showDriverDropdown, setShowDriverDropdown] = useState({});

    // Vehicle data states
    const [vehicleData, setVehicleData] = useState([]);
    const [isLoadingVehicleData, setIsLoadingVehicleData] = useState(false);
    const [availableVehicleTypes, setAvailableVehicleTypes] = useState([]);
    const [availableVehicleNos, setAvailableVehicleNos] = useState([]);
    const [availableVehicleNames, setAvailableVehicleNames] = useState([]);

    // Fallback vehicle type options
    const vehicleTypeOptions = [

    ];

    // Vehicle quantity options
    const vehicleQuantityOptions = ['1'];

    // Function to get authentication token
    const getAuthToken = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        return userInfo.token || userInfo.access_token || userInfo.api_token;
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
            setErrorMessage(`Failed to load plant data: ${error.message}`);
        } finally {
            setIsLoadingPlants(false);
        }
    };
    const fetchDriverCodes = async () => {
        try {
            setIsLoadingDriverCodes(true);
            const token = getAuthToken();

            if (!token) {
                console.error('No authentication token found');
                return;
            }

            console.log('Fetching driver codes...');

            const response = await fetch(`${API_BASE_URL}getDrivercode`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Driver Code API Error:', errorData);
                throw new Error(`Failed to fetch driver codes: ${response.status}`);
            }

            const result = await response.json();
            console.log('Driver Code API Response:', result);

            if (result.status && result.data) {
                const codes = result.data.map(item => item.DRIVER_CODE).filter(Boolean);
                setDriverCodes(codes);
            }
        } catch (error) {
            console.error('Error fetching driver codes:', error);
            setErrorMessage(`Failed to load driver codes: ${error.message}`);
        } finally {
            setIsLoadingDriverCodes(false);
        }
    };
    const handleDriverSearch = (index, searchValue) => {
        const filtered = driverCodes.filter(code =>
            code.toLowerCase().includes(searchValue.toLowerCase())
        );

        setFilteredDriverCodes(prev => ({
            ...prev,
            [index]: filtered
        }));

        setShowDriverDropdown(prev => ({
            ...prev,
            [index]: searchValue.length > 0 && filtered.length > 0
        }));
    };

    const handleDriverSelect = (index, driverCode) => {
        handleVehicleRecordChange(index, 'driver', driverCode);
        setShowDriverDropdown(prev => ({
            ...prev,
            [index]: false
        }));
        setFilteredDriverCodes(prev => ({
            ...prev,
            [index]: []
        }));
    };
    // Function to fetch vehicle data based on selected plant
    const fetchVehicleDataByPlant = async (selectedPlant) => {
        if (!selectedPlant) {
            // Clear vehicle data when no plant is selected
            setVehicleData([]);
            setAvailableVehicleTypes([]);
            setAvailableVehicleNos([]);
            setAvailableVehicleNames([]);
            return;
        }

        try {
            setIsLoadingVehicleData(true);
            const token = getAuthToken();

            if (!token) {
                console.error('No authentication token found');
                return;
            }

            console.log('Fetching vehicle data for plant:', selectedPlant);

            const response = await fetch(`${API_BASE_URL}getPlantdata`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Vehicle API Error Response:', errorData);
                throw new Error(`Failed to fetch vehicle data: ${response.status}`);
            }

            const result = await response.json();
            console.log('Vehicle API Response:', result);

            if (result.status && result.data) {
                // Extract just the plant code from selected plant (before the dash)
                const plantCode = selectedPlant.split('-')[0].trim();

                console.log('Selected plant:', selectedPlant);
                console.log('Extracted plant code:', plantCode);
                console.log('Total vehicles in response:', result.data.length);

                // Filter vehicle data by selected plant using multiple matching strategies
                const filteredVehicleData = result.data.filter(vehicle => {
                    const vehiclePlant = vehicle.PLANT || vehicle.plant || '';

                    // Strategy 1: Exact match with full plant value
                    if (vehiclePlant === selectedPlant) {
                        return true;
                    }

                    // Strategy 2: Match with plant code only
                    if (vehiclePlant === plantCode) {
                        return true;
                    }

                    // Strategy 3: Check if vehicle plant starts with plant code
                    if (vehiclePlant && vehiclePlant.toString().startsWith(plantCode)) {
                        return true;
                    }

                    // Strategy 4: Check if vehicle plant contains plant code
                    if (vehiclePlant && vehiclePlant.toString().includes(plantCode)) {
                        return true;
                    }

                    return false;
                });

                console.log('Filtered vehicle data:', filteredVehicleData);
                console.log('Total vehicles found for plant:', filteredVehicleData.length);

                setVehicleData(filteredVehicleData);

                // Extract unique values for dropdowns
                const uniqueTypes = [...new Set(filteredVehicleData
                    .map(v => v.SUB_CATEGORY)
                    .filter(Boolean)
                )].sort();

                const uniqueVehicleNos = [...new Set(filteredVehicleData
                    .map(v => v.VEHICLE_NO)
                    .filter(Boolean)
                )].sort();

                const uniqueVehicleNames = [...new Set(filteredVehicleData
                    .map(v => v.VEHICLE_NAME)
                    .filter(Boolean)
                )].sort();

                // Set dropdown options - use fallback if no data found
                setAvailableVehicleTypes(uniqueTypes.length > 0 ? uniqueTypes : vehicleTypeOptions);
                setAvailableVehicleNos(uniqueVehicleNos);
                setAvailableVehicleNames(uniqueVehicleNames);

                console.log('Available vehicle types (SUB_CATEGORY):', uniqueTypes);
                console.log('Available vehicle numbers (VEHICLE_NO):', uniqueVehicleNos);
                console.log('Available vehicle names (VEHICLE_NAME):', uniqueVehicleNames);

                // Debug: Show some sample vehicle data
                if (filteredVehicleData.length > 0) {
                    console.log('Sample vehicle record:', filteredVehicleData[0]);
                }

            } else {
                console.error('Invalid vehicle response structure');
                setAvailableVehicleTypes(vehicleTypeOptions);
                setAvailableVehicleNos([]);
                setAvailableVehicleNames([]);
            }
        } catch (error) {
            console.error('Error fetching vehicle data:', error);
            setErrorMessage(`Failed to load vehicle data: ${error.message}`);
            setAvailableVehicleTypes(vehicleTypeOptions);
            setAvailableVehicleNos([]);
            setAvailableVehicleNames([]);
        } finally {
            setIsLoadingVehicleData(false);
        }
    };

    // Load plant data on component mount
    useEffect(() => {
        fetchPlantData();
        fetchDriverCodes();
    }, []);

    // Generate vehicle records based on quantity
    useEffect(() => {
        const qty = parseInt(formData.quantity) || 0;
        if (qty > 0) {
            const newRecords = Array.from({ length: qty }, (_, index) => ({
                id: index + 1,
                vehicleType: '',
                vehicleNo: '',
                name: '',
                vhquantity: '1',
                driver: ''
            }));
            setVehicleRecords(newRecords);
        } else {
            setVehicleRecords([]);
        }
    }, [formData.quantity]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'plant') {
            // Handle plant selection
            const selectedPlant = plantData.find(plant => {
                const plantValue = plant.plant || plant.PLANT || plant.name || plant.NAME || plant.code || plant.CODE;
                return plantValue === value;
            });

            const plantDescription = selectedPlant ?
                (selectedPlant.description || selectedPlant.DESCRIPTION || selectedPlant.desc || selectedPlant.DESC || 'No description')
                : '';

            setFormData(prev => ({
                ...prev,
                [name]: value,
                plantDescription: plantDescription
            }));

            // Clear existing vehicle records when plant changes
            setVehicleRecords(vehicleRecords.map(record => ({
                ...record,
                vehicleType: '',
                vehicleNo: '',
                name: ''
            })));

            // Fetch vehicle data for selected plant
            fetchVehicleDataByPlant(value);
        } else if (name === 'fromDate' || name === 'toDate') {
            // Handle date changes and calculate duration
            const newFromDate = name === 'fromDate' ? value : formData.fromDate;
            const newToDate = name === 'toDate' ? value : formData.toDate;
            const duration = calculateDuration(newFromDate, newToDate);

            setFormData(prev => ({
                ...prev,
                [name]: value,
                durTime: duration
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear field error if exists
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle vehicle record changes
    const handleVehicleRecordChange = (index, field, value) => {
        setVehicleRecords(prev => prev.map((record, i) =>
            i === index ? { ...record, [field]: value } : record
        ));
    };

    // Get filtered vehicle names based on selected vehicle type
    const getFilteredVehicleNames = (selectedVehicleType) => {
        if (!selectedVehicleType || vehicleData.length === 0) {
            return availableVehicleNames;
        }

        const filteredNames = vehicleData
            .filter(vehicle => vehicle.SUB_CATEGORY === selectedVehicleType)
            .map(vehicle => vehicle.VEHICLE_NAME)
            .filter(Boolean);

        return [...new Set(filteredNames)].sort();
    };

    // Get filtered vehicle numbers based on vehicle type and name
    const getFilteredVehicleNos = (selectedVehicleType, selectedVehicleName) => {
        if (!selectedVehicleType || vehicleData.length === 0) {
            return availableVehicleNos;
        }

        let filtered = vehicleData.filter(vehicle => vehicle.SUB_CATEGORY === selectedVehicleType);

        if (selectedVehicleName) {
            filtered = filtered.filter(vehicle => vehicle.VEHICLE_NAME === selectedVehicleName);
        }

        const filteredNos = filtered.map(vehicle => vehicle.VEHICLE_NO).filter(Boolean);
        return [...new Set(filteredNos)].sort();
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        const requiredFields = [
            { key: 'plant', label: 'Plant' },
            { key: 'vendorName', label: 'Vendor Name' },
            { key: 'vendorNumber', label: 'Vendor Number' },
            { key: 'quantity', label: 'Quantity' },
            { key: 'workOrderNumber', label: 'Work Order Number' },
            { key: 'fromDate', label: 'From Date' },
            { key: 'toDate', label: 'To Date' },
            { key: 'value', label: 'Value' },
            { key: 'durTime', label: 'durTime' }
        ];

        requiredFields.forEach(field => {
            if (!formData[field.key] || (typeof formData[field.key] === 'string' && formData[field.key].trim() === '')) {
                newErrors[field.key] = `${field.label} is required`;
            }
        });

        // Date validation
        if (formData.fromDate && formData.toDate) {
            if (new Date(formData.toDate) <= new Date(formData.fromDate)) {
                newErrors.toDate = 'To date must be after from date';
            }
        }

        // Quantity validation
        if (formData.quantity && (isNaN(formData.quantity) || parseInt(formData.quantity) <= 0)) {
            newErrors.quantity = 'Quantity must be a positive number';
        }

        // Vehicle records validation
        if (vehicleRecords.length > 0) {
            let hasVehicleErrors = false;
            vehicleRecords.forEach((record, index) => {
                if (!record.vehicleType || !record.vehicleNo || !record.name || !record.vhquantity || !record.driver) {
                    hasVehicleErrors = true;
                }
            });
            if (hasVehicleErrors) {
                newErrors.vehicleRecords = 'All vehicle records must be completed';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Function to calculate duration between two dates
    const calculateDuration = (fromDate, toDate) => {
        if (!fromDate || !toDate) return '';

        const start = new Date(fromDate);
        const end = new Date(toDate);

        if (end <= start) return '';

        const diffTime = end - start;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
        } else if (diffDays <= 30) {
            const weeks = Math.floor(diffDays / 7);
            const remainingDays = diffDays % 7;
            let duration = `${weeks} week${weeks > 1 ? 's' : ''}`;
            if (remainingDays > 0) {
                duration += ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
            }
            return duration;
        } else {
            const months = Math.floor(diffDays / 30);
            const remainingDays = diffDays % 30;
            const weeks = Math.floor(remainingDays / 7);
            const days = remainingDays % 7;

            let duration = `${months} month${months > 1 ? 's' : ''}`;
            if (weeks > 0) {
                duration += ` ${weeks} week${weeks > 1 ? 's' : ''}`;
            }
            if (days > 0) {
                duration += ` ${days} day${days > 1 ? 's' : ''}`;
            }
            return duration;
        }
    };
    // Submit data to API
    const submitToAPI = async (contractData) => {
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No authentication token found. Please log in again.');
            }

            const combinedPlantValue = `${contractData.plant}-${contractData.plantDescription}`;
            const submissions = [];

            for (const vehicle of contractData.vehicleRecords) {
                if (!vehicle.vehicleType || !vehicle.vehicleNo || !vehicle.name || !vehicle.vhquantity || !vehicle.driver) {
                    throw new Error('All vehicle fields must be filled');
                }

                const payload = {
                    PLANT: combinedPlantValue,
                    PLANT_DESCRIPTION: contractData.plantDescription,
                    VENDOR_NAME: contractData.vendorName,
                    VENDOR_NUMBER: contractData.vendorNumber,
                    QUANTITY: contractData.quantity,
                    WORK_ORDER_NO: contractData.workOrderNumber,
                    FROM_DATE: contractData.fromDate,
                    TO_DATE: contractData.toDate,
                    DUR_TIME: contractData.durTime,
                    VALUE: contractData.value,
                    VEHICLE_TYPE: vehicle.vehicleType.trim(),
                    VEHICLE_NO: vehicle.vehicleNo.trim(),
                    VEHICLE_NAME: vehicle.name.trim(),
                    VEHICLE_QUANTITY: vehicle.vhquantity.trim(),
                    DRIVER: vehicle.driver.trim()

                };

                console.log('Submitting payload:', payload);

                const response = await fetch(`${API_BASE_URL}contract-details`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);

                    let errorMessage = 'Server error occurred';
                    if (errorData.errors) {
                        const errors = Object.values(errorData.errors).flat();
                        errorMessage = errors.join(', ');
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    }

                    throw new Error(errorMessage);
                }

                const result = await response.json();
                submissions.push(result);
            }

            return {
                success: true,
                message: `Successfully submitted ${submissions.length} vehicle records`,
                data: submissions
            };

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    // Handle submit button click
    const handleSubmitClick = () => {
        setIsSubmitted(true);

        if (!validateForm()) {
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                const element = document.querySelector(`[name="${firstErrorField}"]`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                }
            }
            return;
        }

        setShowSuccessModal(false);
        setShowErrorModal(false);
        setIsLoading(false);
        setShowConfirmModal(true);
    };

    // Handle confirmation submit
    const handleConfirmSubmit = async () => {
        setShowConfirmModal(false);
        setIsLoading(true);

        try {
            const contractData = {
                ...formData,
                vehicleRecords: vehicleRecords
            };

            const result = await submitToAPI(contractData);
            console.log('Success:', result);
            setShowSuccessModal(true);

        } catch (error) {
            console.error('Submission error:', error);
            setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle cancel submit
    const handleCancelSubmit = () => {
        setShowConfirmModal(false);
        setIsLoading(false);
    };

    // Handle success close
    const handleSuccessClose = () => {
        setShowSuccessModal(false);

        // Reset form
        setFormData({
            plant: '',
            plantDescription: '',
            vendorName: '',
            vendorNumber: '',
            quantity: '',
            workOrderNumber: '',
            fromDate: '',
            toDate: '',
            value: '',
            durTime: ''
        });
        setVehicleRecords([]);
        setVehicleData([]);
        setAvailableVehicleTypes([]);
        setAvailableVehicleNos([]);
        setAvailableVehicleNames([]);
        setIsSubmitted(false);
    };

    // Handle error close
    const handleErrorClose = () => {
        setShowErrorModal(false);
        setErrorMessage('');
    };

    // Get input field CSS class
    const getInputClassName = (fieldName) => {
        const baseClass = "w-full px-3.5 py-2 border rounded-full focus:ring-1 focus:ring-blue-200 focus:outline-none transition-all text-xs";
        const hasError = errors[fieldName];

        if (hasError) {
            return `${baseClass} border-red-500 focus:border-red-500 bg-red-50`;
        } else {
            return `${baseClass} border-blue-700 focus:border-blue-500 bg-white`;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-4 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <FileText className="text-white text-lg" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">Contract Details Management</h1>
                                    <p className="text-blue-100 text-sm">Manage contract and vendor information</p>
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

                {/* Main Form */}
                <div className="space-y-2">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                        {/* Left - Image */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-70 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-48 h-48 bg-gradient-to-br from-white-100 to-white-200 rounded-lg flex items-center justify-center mb-2">
                                    <img
                                        src="/crane.gif"
                                        alt="Vehicle Preview"
                                        className="w-150 h-150 mb-0 mx-auto object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right - Form Fields */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-70 flex flex-col">
                                <div className="p-4 flex-1 overflow-y-auto">
                                    <div className="space-y-3">
                                        {/* First Row - Plant and Vendor Number */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Plant Selection */}
                                            <div>
                                                <label className="block text-blue-700 font-semibold text-xs mb-1">
                                                    Plant <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="plant"
                                                    value={formData.plant}
                                                    onChange={handleInputChange}
                                                    className={getInputClassName('plant')}
                                                    disabled={isLoadingPlants}
                                                >
                                                    <option value="">
                                                        {isLoadingPlants ? "Loading plants..." : "Select Plant"}
                                                    </option>
                                                    {plantData.map((plant, index) => {
                                                        const plantValue = plant.plant || plant.PLANT || plant.name || plant.NAME || plant.code || plant.CODE;
                                                        const plantName = plant.plant || plant.PLANT || plant.name || plant.NAME || `Plant ${index + 1}`;
                                                        const plantDesc = plant.description || plant.DESCRIPTION || plant.desc || plant.DESC || 'No description';

                                                        return (
                                                            <option key={index} value={plantValue}>
                                                                {plantName} - {plantDesc}
                                                            </option>
                                                        );
                                                    })}
                                                </select>

                                                {errors.plant && (
                                                    <p className="text-red-500 text-xs mt-0.5">{errors.plant}</p>
                                                )}

                                                {isLoadingVehicleData && (
                                                    <p className="text-blue-500 text-xs mt-0.5">Loading vehicle data...</p>
                                                )}


                                            </div>

                                            {/* Vendor Number */}
                                            <div>
                                                <label className="block text-blue-700 font-semibold text-xs mb-1">
                                                    Vendor Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="vendorNumber"
                                                    value={formData.vendorNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Vendor Number"
                                                    className={getInputClassName('vendorNumber')}
                                                />
                                                {errors.vendorNumber && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.vendorNumber}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Second Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {/* Vendor Name */}
                                            <div>
                                                <label className="block text-blue-700 font-semibold text-xs mb-1">
                                                    Vendor Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="vendorName"
                                                    value={formData.vendorName}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Vendor Name"
                                                    className={getInputClassName('vendorName')}
                                                />
                                                {errors.vendorName && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.vendorName}</p>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div>
                                                <label className="block text-blue-700 font-semibold text-xs mb-1">
                                                    Quantity <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    value={formData.quantity}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Quantity"
                                                    min="1"
                                                    className={getInputClassName('quantity')}
                                                />
                                                {errors.quantity && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                                                )}
                                            </div>

                                            {/* Work Order Number */}
                                            <div>
                                                <label className="block text-blue-700 font-semibold text-xs mb-1">
                                                    Work Order Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="workOrderNumber"
                                                    value={formData.workOrderNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Work Order Number"
                                                    className={getInputClassName('workOrderNumber')}
                                                />
                                                {errors.workOrderNumber && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.workOrderNumber}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Third Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            {/* From Date */}
                                            <div>
                                                <label className="block text-blue-700 font-semibold text-xs mb-1">
                                                    Contract From Date <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="fromDate"
                                                    value={formData.fromDate}
                                                    onChange={handleInputChange}
                                                    className={getInputClassName('fromDate')}
                                                />
                                                {errors.fromDate && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.fromDate}</p>
                                                )}
                                            </div>

                                            {/* To Date */}
                                            <div>
                                                <label className="block text-blue-700 font-semibold text-xs mb-1">
                                                    Contract To Date <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="toDate"
                                                    value={formData.toDate}
                                                    onChange={handleInputChange}
                                                    className={getInputClassName('toDate')}
                                                />
                                                {errors.toDate && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.toDate}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-blue-700 font-semibold text-xs mb-1">
                                                    Duration Time <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="durTime"
                                                    value={formData.durTime}
                                                    onChange={handleInputChange}
                                                    className={getInputClassName('durTime')}
                                                    readOnly
                                                    placeholder="Auto-calculated duration"
                                                />
                                                {errors.durTime && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.durTime}</p>
                                                )}
                                            </div>

                                            {/* Value */}
                                            <div>
                                                <label className="block text-blue-700 font-semibold text-xs mb-1">
                                                    Value <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="value"
                                                    value={formData.value}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Value"
                                                    step="0.01"
                                                    className={getInputClassName('value')}
                                                />
                                                {errors.value && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.value}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vehicle Records Table */}
                {vehicleRecords.length > 0 && (
                    <div className="mt-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-blue-800">Vehicle Details</h3>
                                <p className="text-blue-600 text-sm">Enter vehicle information for {formData.quantity} vehicles</p>

                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">S.No</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                                                Vehicle Type <span className="text-red-500">*</span>

                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                                                Vehicle Name <span className="text-red-500">*</span>

                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                                                Vehicle No <span className="text-red-500">*</span>

                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Vehicle Quantity <span className="text-red-500">*</span></th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Driver Code <span className="text-red-500">*</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {vehicleRecords.map((record, index) => (
                                            <tr key={record.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <select
                                                        value={record.vehicleType || ''}
                                                        onChange={(e) => {
                                                            handleVehicleRecordChange(index, 'vehicleType', e.target.value);
                                                            // Clear dependent fields when vehicle type changes
                                                            handleVehicleRecordChange(index, 'name', '');
                                                            handleVehicleRecordChange(index, 'vehicleNo', '');
                                                        }}
                                                        className="w-full px-2 py-1 border border-blue-800 rounded-full focus:ring-2 focus:ring-blue-200 focus:outline-none text-sm"
                                                        disabled={isLoadingVehicleData || (!formData.plant)}
                                                    >
                                                        <option value="">
                                                            {!formData.plant
                                                                ? "Select Plant First"
                                                                : isLoadingVehicleData
                                                                    ? "Loading..."
                                                                    : availableVehicleTypes.length === 0
                                                                        ? "No vehicle types available"
                                                                        : "Select Vehicle Type"
                                                            }
                                                        </option>
                                                        {availableVehicleTypes.map((type) => (
                                                            <option key={type} value={type}>
                                                                {type}
                                                            </option>
                                                        ))}
                                                    </select>

                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <select
                                                        value={record.name || ''}
                                                        onChange={(e) => {
                                                            handleVehicleRecordChange(index, 'name', e.target.value);
                                                            // Clear vehicle number when name changes
                                                            handleVehicleRecordChange(index, 'vehicleNo', '');
                                                        }}
                                                        className="w-full px-2 py-1 border border-blue-800 rounded-full focus:ring-2 focus:ring-blue-200 focus:outline-none text-sm"
                                                        disabled={!record.vehicleType || isLoadingVehicleData || !formData.plant}
                                                    >
                                                        <option value="">
                                                            {!formData.plant
                                                                ? "Select Plant First"
                                                                : !record.vehicleType
                                                                    ? "Select Vehicle Type First"
                                                                    : getFilteredVehicleNames(record.vehicleType).length === 0
                                                                        ? "No vehicle names available"
                                                                        : "Select Vehicle Name"
                                                            }
                                                        </option>
                                                        {getFilteredVehicleNames(record.vehicleType).map((vehicleName) => (
                                                            <option key={vehicleName} value={vehicleName}>
                                                                {vehicleName}
                                                            </option>
                                                        ))}
                                                    </select>

                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <select
                                                        value={record.vehicleNo || ''}
                                                        onChange={(e) => handleVehicleRecordChange(index, 'vehicleNo', e.target.value)}
                                                        className="w-full px-2 py-1 border border-blue-800 rounded-full focus:ring-2 focus:ring-blue-200 focus:outline-none text-sm"
                                                        disabled={!record.vehicleType || isLoadingVehicleData || !formData.plant}
                                                    >
                                                        <option value="">
                                                            {!formData.plant
                                                                ? "Select Plant First"
                                                                : !record.vehicleType
                                                                    ? "Select Vehicle Type First"
                                                                    : getFilteredVehicleNos(record.vehicleType, record.name).length === 0
                                                                        ? "No vehicle numbers available"
                                                                        : "Select Vehicle No"
                                                            }
                                                        </option>
                                                        {getFilteredVehicleNos(record.vehicleType, record.name).map((vehicleNo) => (
                                                            <option key={vehicleNo} value={vehicleNo}>
                                                                {vehicleNo}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <select
                                                        value={record.vhquantity || '1'}
                                                        onChange={(e) => handleVehicleRecordChange(index, 'vhquantity', e.target.value)}
                                                        className="w-full px-2 py-1 border border-blue-800 rounded-full focus:ring-2 focus:ring-blue-200 focus:outline-none text-sm"
                                                    >
                                                        {vehicleQuantityOptions.map((qty) => (
                                                            <option key={qty} value={qty}>
                                                                {qty}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap relative">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={record.driver || ''}
                                                            onChange={(e) => {
                                                                handleVehicleRecordChange(index, 'driver', e.target.value);
                                                                handleDriverSearch(index, e.target.value);
                                                            }}
                                                            placeholder="Enter Driver code"
                                                            className="w-full px-2 py-1 border border-blue-800 rounded-full focus:ring-2 focus:ring-blue-200 focus:outline-none text-sm"
                                                            onFocus={() => {
                                                                if (record.driver) {
                                                                    handleDriverSearch(index, record.driver);
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                // Delay hiding dropdown to allow selection
                                                                setTimeout(() => {
                                                                    setShowDriverDropdown(prev => ({
                                                                        ...prev,
                                                                        [index]: false
                                                                    }));
                                                                }, 150);
                                                            }}
                                                        />

                                                        {/* Updated Dropdown for filtered driver codes - positioned to avoid header overlap */}
                                                        {showDriverDropdown[index] && filteredDriverCodes[index] && filteredDriverCodes[index].length > 0 && (
                                                            <div className="absolute z-[9999] w-full top-full mt-1 left-0 bg-white border border-gray-200 rounded-md shadow-lg">
                                                                {/* Header with count */}
                                                                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700 rounded-t-md">
                                                                    Driver Codes ({filteredDriverCodes[index].length} found)
                                                                </div>

                                                                {/* Scrollable content - Show exactly 5 items */}
                                                                <div className="overflow-y-auto" style={{ maxHeight: '160px' }}>
                                                                    {filteredDriverCodes[index].slice(0, 50).map((code, codeIndex) => (
                                                                        <div
                                                                            key={codeIndex}
                                                                            className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors duration-150"
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault(); // Prevent input blur
                                                                                handleDriverSelect(index, code);
                                                                            }}
                                                                        >
                                                                            <span className="text-gray-800">{code}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {errors.vehicleRecords && (
                                <div className="px-6 py-2 bg-red-50 border-t border-red-200">
                                    <p className="text-red-500 text-sm">{errors.vehicleRecords}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className={`flex justify-center ${vehicleRecords.length > 0 ? 'mt-8' : 'mt-16'}`}>
                    <button
                        onClick={handleSubmitClick}
                        disabled={isLoading}
                        className={`w-48 px-8 py-3 rounded-lg font-medium transition-all duration-200 transform shadow-md hover:shadow-lg ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105'
                            } text-white`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <FileText className="text-lg" />
                            <span>{isLoading ? 'Submitting...' : 'Submit'}</span>
                        </div>
                    </button>
                </div>

                {/* Confirmation Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                                    </div>
                                </div>

                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Submission</h3>
                                    <p className="text-gray-600 text-sm">
                                        Please confirm if you want to submit this contract data for:
                                    </p>
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-blue-800 font-medium text-sm">
                                            Plant: {formData.plant}
                                        </p>
                                        <p className="text-blue-700 text-xs mt-1">
                                            Vendor: {formData.vendorName} ({formData.vendorNumber})
                                        </p>
                                        <p className="text-blue-700 text-xs mt-1">
                                            Vehicles: {formData.quantity} vehicle(s)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleCancelSubmit}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmSubmit}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Submitting...</span>
                                            </div>
                                        ) : (
                                            'Yes, Submit'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    </div>
                                </div>

                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Success!</h3>
                                    <p className="text-gray-600 text-sm">Your contract details have been submitted successfully.</p>
                                </div>

                                <div className="bg-green-50 rounded-lg p-4 mb-6">
                                    <div className="text-center">
                                        <p className="text-sm text-green-800 font-medium">
                                            Contract for "{formData.vendorName}" with {formData.quantity} vehicles has been registered successfully.
                                        </p>
                                        <p className="text-xs text-green-700 mt-1">
                                            Plant: {formData.plant} - {formData.plantDescription}
                                        </p>
                                        <p className="text-xs text-green-700 mt-1">
                                            {vehicleRecords.length} vehicle records submitted
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        onClick={handleSuccessClose}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors duration-200"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Modal */}
                {showErrorModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-red-500" />
                                    </div>
                                </div>

                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Submission Failed</h3>
                                    <p className="text-gray-600 text-sm">
                                        There was an error submitting your contract data.
                                    </p>
                                </div>

                                <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
                                    <div className="text-center">
                                        <p className="text-sm text-red-800 font-medium break-words">
                                            {errorMessage || 'An unexpected error occurred. Please try again.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        onClick={handleErrorClose}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors duration-200"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContractDetails;