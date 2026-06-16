import React, { useState, useEffect } from 'react';
import { ArrowLeft, Car, CheckCircle, X, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../Config.jsx';

const VehicleData = () => {
    const [formData, setFormData] = useState({
        plant: '',
        category: '',
        subCategory: '',
        vehicleNo: '',
        vehicleName: '',
        modelNo: '',
        rcNo: '',
        insurancestart: '',
        insuranceend: '',
        insurancefile: null,
        permitstart: '',
        permitend: '',
        permitfile: null,
        pollutionstart: '',
        pollutionend: '',
        pollutionfile: null
    });

    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // State for plant data from API
    const [plantData, setPlantData] = useState([]);
    const [isLoadingPlants, setIsLoadingPlants] = useState(true);

    // Debugging state
    const [debugInfo, setDebugInfo] = useState([]);

    // Add debug log function
    const addDebugLog = (message, data = null) => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = { timestamp, message, data };
        console.log(`[${timestamp}] ${message}`, data);
        setDebugInfo(prev => [...prev.slice(-4), logEntry]); // Keep only last 5 logs
    };

    // Subcategories based on main category
    const categoryMap = {
        CONCRETE_PRODUCTION: {
            label: "CONCRETE PRODUCTION",
            subcategories: [
                { code: "RMCPLNT", desc: "RMC BATCHING PLANT" }
            ]
        },
        weigh_bridge: {
            label: "WEIGH BRIDGE & CONCRETE EQUIPMENTS",
            subcategories: [
                { code: "WBRIDGE", desc: "WEIGH BRIDGE" },
                { code: "CPUMP", desc: "CONCRETE PUMP" },
                { code: "SPBOOM", desc: "STATIC PLACING BOOM" }
            ]
        },
        vertical_lifting: {
            label: "VERTICAL LIFTING EQUIPMENTS",
            subcategories: [
                { code: "PM HOIST", desc: "PM HOIST" },
                { code: "TCRANE", desc: "TOWER CRANE" },
                { code: "SRP", desc: "SUSPENDED ROPE PLATFRM" },
                { code: "DDSRP", desc: "DOUBLE DECK PLATFRM" },
                { code: "WORKPLTFM", desc: "AERIAL WORK PLATFORM" },
                { code: "EOTCRANE", desc: "EOT CRANES" }
            ]
        },
        mobile_equipments: {
            label: "MOBILE EQUIPMENTS",
            subcategories: [
                { code: "MOBLCRANE", desc: "MOBILE CRANE HYDRA" },
                { code: "JCB", desc: "BACKHOE LOADER JCB" },
                { code: "SKID STEER", desc: "SKID STEER BOBCAT" },
                { code: "WLOADER", desc: "WHEEL LOADER" },
                { code: "EXCAVATOR", desc: "EXCAVATOR" },
                { code: "DRUMROLLER", desc: "DRUM ROLLER" }
            ]
        },
        miscellanous_machinery: {
            label: "MISCELLANEOUS MACHINERY - (Major & Minor)",
            subcategories: [
                { code: "PWRGEN", desc: "POWER GENERATOR" },
                { code: "WLKBROLLER", desc: "WALK BEHIND ROLLER" },
                { code: "BARSTGHTNR", desc: "BAR STRAIGHTENING" },
                { code: "PLATCOMPCT", desc: "PLATE COMPACTOR" },
                { code: "WELDMC", desc: "WELDING MACHINE" },
                { code: "AIRCOMP", desc: "AIR COMPRESSOR" },
                { code: "WASHPUMP", desc: "WASH PUMP" },
                { code: "GRSPUMP", desc: "GREASE PUMP" },
                { code: "PWRTOOL", desc: "POWER TOOLS (P&M)" },
                { code: "SWEEPERMC", desc: "SWEEPER MACHINE" },
                { code: "BARBEND", desc: "BAR BENDING MACHINE" },
                { code: "BARCUT", desc: "BAR CUTTING MACHINE" },
                { code: "Ball Passing", desc: "Pipe Line Ball Passing Unit" }
            ]
        },
        hd_vehciles: {
            label: "P&M  HD VEHICLES",
            subcategories: [
                { code: "TMIXER", desc: "TRANSIT MIXER" },
                { code: "TRUKBOOM", desc: "TRUCK BOOM PUMP" },
                { code: "TRACTOR", desc: "TRACTOR" },
                { code: "WTANKER", desc: "WATER TANKER" },
                { code: "BOLERO", desc: "BOLERO PICK UP TRUCK" },
                { code: "DTANKER", desc: "DIESEL TANKER" }
            ]
        }
    };

    // Enhanced function to fetch plant data from API
    const fetchPlantData = async () => {
        try {
            addDebugLog('Starting to fetch plant data...');

            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            addDebugLog('Retrieved userInfo from localStorage', userInfo);

            const token = userInfo.token || userInfo.access_token || userInfo.api_token;

            if (!token) {
                addDebugLog('ERROR: No authentication token found');
                setIsLoadingPlants(false);
                return;
            }

            addDebugLog('Making API request with token', { tokenExists: !!token });

            const response = await fetch(`${API_BASE_URL}plant-data`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            addDebugLog('API Response received', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const errorData = await response.text();
                addDebugLog('API Error Response', errorData);
                throw new Error(`Failed to fetch plant data: ${response.status} - ${errorData}`);
            }

            const result = await response.json();
            addDebugLog('Plant API Response parsed', result);

            if (result.status && result.data) {
                addDebugLog('Plant data received successfully', result.data);
                setPlantData(result.data);
            } else if (Array.isArray(result)) {
                addDebugLog('Using direct array result', result);
                setPlantData(result);
            } else {
                addDebugLog('ERROR: No valid data found in response', result);
            }
        } catch (error) {
            addDebugLog('ERROR: Failed to fetch plant data', error.message);
            setErrorMessage(`Failed to load plant data: ${error.message}`);
        } finally {
            setIsLoadingPlants(false);
        }
    };

    useEffect(() => {
        fetchPlantData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset subcategory when category changes
            ...(name === 'category' && { subCategory: '' })
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const { name } = e.target;
        const file = e.target.files[0];
        addDebugLog('File selected', {
            field: name,
            name: file?.name,
            type: file?.type,
            size: file?.size
        });

        setFormData(prev => ({
            ...prev,
            [name]: file
        }));

        // Clear error when file is selected
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        addDebugLog('Starting form validation...');
        const newErrors = {};

        // Required field validation
        const requiredFields = [
            { key: 'plant', label: 'Plant' },
            { key: 'category', label: 'Category' },
            { key: 'subCategory', label: 'Sub Category' },
            { key: 'vehicleNo', label: 'Vehicle No' },
            { key: 'vehicleName', label: 'Vehicle Name' },
            { key: 'modelNo', label: 'Model No' },
            { key: 'rcNo', label: 'RC No' },
            { key: 'insurancestart', label: 'Insurance start date' },
            { key: 'insuranceend', label: 'Insurance end date' },
            { key: 'insurancefile', label: 'Insurance file' },
            { key: 'permitstart', label: 'Permit start date' },
            { key: 'permitend', label: 'Permit end date' },
            { key: 'permitfile', label: 'Permit file' },
            { key: 'pollutionstart', label: 'Pollution start date' },
            { key: 'pollutionend', label: 'Pollution end date' }
        ];

        requiredFields.forEach(field => {
            if (!formData[field.key] || (typeof formData[field.key] === 'string' && formData[field.key].trim() === '')) {
                newErrors[field.key] = `${field.label} is required`;
            }
        });

        // Date validation - end dates should be after start dates
        if (formData.insurancestart && formData.insuranceend) {
            if (new Date(formData.insuranceend) <= new Date(formData.insurancestart)) {
                newErrors.insuranceend = 'Insurance end date must be after start date';
            }
        }

        if (formData.permitstart && formData.permitend) {
            if (new Date(formData.permitend) <= new Date(formData.permitstart)) {
                newErrors.permitend = 'Permit end date must be after start date';
            }
        }

        if (formData.pollutionstart && formData.pollutionend) {
            if (new Date(formData.pollutionend) <= new Date(formData.pollutionstart)) {
                newErrors.pollutionend = 'Pollution end date must be after start date';
            }
        }

        addDebugLog('Form validation completed', {
            errorCount: Object.keys(newErrors).length,
            errors: newErrors
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Enhanced API submission function with better debugging
    const submitToAPI = async (formDataToSend) => {
        try {
            addDebugLog('Starting API submission...');

            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token || userInfo.access_token || userInfo.api_token;

            if (!token) {
                throw new Error('No authentication token found. Please log in again.');
            }

            addDebugLog('Preparing API request', {
                url: `${API_BASE_URL}vehicle-data`,
                method: 'POST',
                hasToken: !!token,
                formDataKeys: Array.from(formDataToSend.keys())
            });

            // Log all form data being sent
            for (let [key, value] of formDataToSend.entries()) {
                addDebugLog(`FormData ${key}:`, value instanceof File ? `File: ${value.name}` : value);
            }

            const response = await fetch(`${API_BASE_URL}vehicle-data`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type - let browser set it for FormData
                },
                body: formDataToSend,
            });

            addDebugLog('API submission response received', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });

            // Get response text first for debugging
            const responseText = await response.text();
            addDebugLog('Raw API response', responseText);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch {
                    errorData = { message: responseText };
                }

                addDebugLog('API Error Response parsed', errorData);

                // Handle validation errors specifically
                if (response.status === 422 && errorData.errors) {
                    const errorMessages = Object.values(errorData.errors).flat().join(', ');
                    throw new Error(`Validation Error: ${errorMessages}`);
                }

                throw new Error(errorData.message || `Server error: ${response.status} - ${responseText}`);
            }

            let result;
            try {
                result = JSON.parse(responseText);
                addDebugLog('API success response parsed', result);
            } catch {
                addDebugLog('Response was not JSON, treating as success');
                result = { success: true, message: 'Data submitted successfully' };
            }

            return result;
        } catch (error) {
            addDebugLog('API submission error', error.message);
            throw error;
        }
    };

    const handleSubmitClick = () => {
        addDebugLog('Submit button clicked');
        setIsSubmitted(true);

        if (!validateForm()) {
            addDebugLog('Form validation failed, scrolling to first error');
            // Scroll to first error
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

        addDebugLog('Form validation passed, showing confirmation modal');
        // Show confirmation modal
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        addDebugLog('User confirmed submission');
        setShowConfirmModal(false);
        setIsLoading(true);

        try {
            addDebugLog('Creating FormData object...');
            // Create FormData object to handle file upload
            const apiFormData = new FormData();

            // Map React form fields to Laravel expected field names (UPPERCASE)
            const fieldMapping = {
                'PLANT': formData.plant,
                'CATEGORY': formData.category,
                'SUB_CATEGORY': formData.subCategory,
                'VEHICLE_NO': formData.vehicleNo,
                'VEHICLE_NAME': formData.vehicleName,
                'MODEL_NO': formData.modelNo,
                'RC_NO': formData.rcNo,
                'INSURANCE_START_DATE': formData.insurancestart,
                'INSURANCE_END_DATE': formData.insuranceend,
                'PERMIT_START_DATE': formData.permitstart,
                'PERMIT_END_DATE': formData.permitend,
                'POLLUTION_START_DATE': formData.pollutionstart,
                'POLLUTION_END_DATE': formData.pollutionend
            };

            // Add all form fields
            Object.entries(fieldMapping).forEach(([key, value]) => {
                apiFormData.append(key, value);
                addDebugLog(`Added field ${key}`, value);
            });

            // Add files if present
            if (formData.insurancefile) {
                apiFormData.append('INSURANCE_FILE', formData.insurancefile);
                addDebugLog('Added insurance file', formData.insurancefile.name);
            }
            
            if (formData.permitfile) {
                apiFormData.append('PERMIT_FILE', formData.permitfile);
                addDebugLog('Added permit file', formData.permitfile.name);
            }
            
            if (formData.pollutionfile) {
                apiFormData.append('POLLUTION_FILE', formData.pollutionfile);
                addDebugLog('Added pollution file', formData.pollutionfile.name);
            }

            const result = await submitToAPI(apiFormData);

            addDebugLog('Submission successful!', result);

            // Show success modal
            setShowSuccessModal(true);

        } catch (error) {
            addDebugLog('Submission failed', error.message);

            // Show error modal instead of window alert
            setErrorMessage(error.message);
            setShowErrorModal(true);

        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelSubmit = () => {
        addDebugLog('User cancelled submission');
        setShowConfirmModal(false);
    };

    const handleSuccessClose = () => {
        addDebugLog('Success modal closed, resetting form');
        setShowSuccessModal(false);

        // Reset form after successful submission
        setFormData({
            plant: '',
            category: '',
            subCategory: '',
            vehicleNo: '',
            vehicleName: '',
            modelNo: '',
            rcNo: '',
            insurancestart: '',
            insuranceend: '',
            insurancefile: null,
            permitstart: '',
            permitend: '',
            permitfile: null,
            pollutionstart: '',
            pollutionend: '',
            pollutionfile: null
        });
        setIsSubmitted(false);
        setDebugInfo([]); // Clear debug info on success
    };

    const handleErrorClose = () => {
        setShowErrorModal(false);
        setErrorMessage('');
    };

    const navigate = useNavigate();

    const getInputClassName = (fieldName) => {
        const baseClass = "w-full px-2.5 py-1 border rounded-full focus:ring-1 focus:ring-blue-200 focus:outline-none transition-all text-xs";
        const hasError = errors[fieldName];

        if (hasError) {
            return `${baseClass} border-red-500 focus:border-red-500 bg-red-50`;
        } else {
            return `${baseClass} border-blue-700 focus:border-blue-500 bg-white`;
        }
    };

    // Get selected category and subcategory labels for confirmation modal
    const getSelectedCategoryLabel = () => {
        if (formData.category && categoryMap[formData.category]) {
            return categoryMap[formData.category].label;
        }
        return '';
    };

    const getSelectedSubCategoryLabel = () => {
        if (formData.category && formData.subCategory && categoryMap[formData.category]) {
            const subCat = categoryMap[formData.category].subcategories.find(
                sub => sub.code === formData.subCategory
            );
            return subCat ? `${subCat.code} - ${subCat.desc}` : '';
        }
        return '';
    };

    // Function to get selected plant label for display
    const getSelectedPlantLabel = () => {
        if (formData.plant && plantData.length > 0) {
            const selectedPlant = plantData.find(plant => {
                const plantId = plant.id || plant.ID;
                const plantName = plant?.plant || plant?.PLANT || plant?.name || plant?.NAME;
                const plantDesc = plant?.description || plant?.DESCRIPTION || plant?.desc || plant?.DESC;
                const plantValue = plantId || `${plantName}-${plantDesc}`;

                return plantValue === formData.plant;
            });

            if (selectedPlant) {
                const plantName = selectedPlant.plant || selectedPlant.PLANT || selectedPlant.name || selectedPlant.NAME || 'Unknown Plant';
                const plantDesc = selectedPlant.description || selectedPlant.DESCRIPTION || selectedPlant.desc || selectedPlant.DESC || 'No description';
                return `${plantName} - ${plantDesc}`;
            }
        }
        return formData.plant || ''; // Return the stored value if plant not found in data
    };

    return (
        <div className="min-h-screen bg-gray-100 py-1 px-2">
            <div className="max-w-7xl mx-auto">

                {/* Header Card - Compressed */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg px-4 py-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Car className="text-white text-sm" />
                                </div>
                                <div>
                                    <h1 className="text-base font-bold text-white">Vehicle Data Management</h1>
                                    <p className="text-blue-100 text-xs">Add and manage vehicle information</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(-1)}
                                className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg transition-colors duration-200"
                            >
                                <ArrowLeft className="text-sm" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-2">
                    {/* Top Row - Vehicle Image and Basic Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                        {/* Left Column - Vehicle Image */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-64">
                            <div className="text-center text-gray-500 p-2">
                                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <img
                                            src="/crane.gif"
                                            alt="Vehicle Preview"
                                            className="w-full h-100 mb-0 mx-auto object-contain"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Basic Vehicle Info */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-64">
                                <div className="p-2 space-y-1">
                                    {/* Plant - Full width row */}
                                    <div>
                                        <label className="block text-blue-700 font-semibold text-xs mb-0.5">
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
                                                // Try different possible field names with safe access
                                                const plantId = plant?.id || plant?.ID;
                                                const plantName = plant?.plant || plant?.PLANT || plant?.name || plant?.NAME || `Plant ${index + 1}`;
                                                const plantDesc = plant?.description || plant?.DESCRIPTION || plant?.desc || plant?.DESC || 'No description';

                                                // Use the actual plant identifier (like "2001-jebdjkcfsn") as the value
                                                // If no proper ID exists, fallback to a constructed value
                                                const plantValue = plantId || `${plantName}-${plantDesc}` || `plant_${index}`;

                                                return (
                                                    <option key={plantValue} value={plantValue}>
                                                        {plantName} - {plantDesc}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        {errors.plant && (
                                            <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.plant}</p>
                                        )}
                                    </div>

                                    {/* Category and other fields in 2-column grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                        {/* Category */}
                                        <div>
                                            <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                                Category <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className={getInputClassName('category')}
                                            >
                                                <option value="">Select Category</option>
                                                {Object.entries(categoryMap).map(([key, value]) => (
                                                    <option key={key} value={key}>{value.label}</option>
                                                ))}
                                            </select>
                                            {errors.category && (
                                                <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.category}</p>
                                            )}
                                        </div>

                                        {/* Sub Category - Only show when category is selected */}
                                        {formData.category && (
                                            <div>
                                                <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                                    Sub Category <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="subCategory"
                                                    value={formData.subCategory}
                                                    onChange={handleInputChange}
                                                    className={getInputClassName('subCategory')}
                                                >
                                                    <option value="">Select Subcategory</option>
                                                    {categoryMap[formData.category].subcategories.map((item, index) => (
                                                        <option key={index} value={`${item.code}-${item.desc}`}>
                                                            {item.code} - {item.desc}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.subCategory && (
                                                    <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.subCategory}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Vehicle No */}
                                        <div>
                                            <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                                Vehicle No <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="vehicleNo"
                                                value={formData.vehicleNo}
                                                onChange={(e) => {
                                                    const value = e.target.value.toUpperCase(); // Force uppercase
                                                    const filteredValue = value.replace(/[^A-Z0-9]/g, ''); // Remove non-alphanumeric characters
                                                    setFormData(prev => ({ ...prev, vehicleNo: filteredValue }));

                                                    // Clear error when user types
                                                    if (errors.vehicleNo) {
                                                        setErrors(prev => ({ ...prev, vehicleNo: '' }));
                                                    }
                                                }}
                                                placeholder="Enter Vehicle Number"
                                                className={getInputClassName('vehicleNo')}
                                                required
                                            />
                                            {errors.vehicleNo && (
                                                <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.vehicleNo}</p>
                                            )}
                                        </div>

                                        {/* Vehicle Name */}
                                        <div>
                                            <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                                Vehicle Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="vehicleName"
                                                value={formData.vehicleName}
                                                onChange={handleInputChange}
                                                placeholder="Enter Vehicle Name"
                                                className={getInputClassName('vehicleName')}
                                                required
                                            />
                                            {errors.vehicleName && (
                                                <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.vehicleName}</p>
                                            )}
                                        </div>

                                        {/* Model No */}
                                        <div>
                                            <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                                Model No <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="modelNo"
                                                value={formData.modelNo}
                                                onChange={handleInputChange}
                                                placeholder="Enter Model Number"
                                                className={getInputClassName('modelNo')}
                                                required
                                            />
                                            {errors.modelNo && (
                                                <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.modelNo}</p>
                                            )}
                                        </div>

                                        {/* RC No */}
                                        <div>
                                            <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                                RC No <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="rcNo"
                                                value={formData.rcNo}
                                                onChange={handleInputChange}
                                                placeholder="Enter RC Number"
                                                className={getInputClassName('rcNo')}
                                                required
                                            />
                                            {errors.rcNo && (
                                                <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.rcNo}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section - Compressed Dates and Submit Button */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-3">
                            <div className="space-y-3 mb-3">
                                {/* Row 1: Insurance fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Insurance Start Date */}
                                    <div>
                                        <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                            Insurance start date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="insurancestart"
                                            value={formData.insurancestart}
                                            onChange={handleInputChange}
                                            className={getInputClassName('insurancestart')}
                                            required
                                        />
                                        {errors.insurancestart && (
                                            <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.insurancestart}</p>
                                        )}
                                    </div>

                                    {/* Insurance End Date */}
                                    <div>
                                        <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                            Insurance end date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="insuranceend"
                                            value={formData.insuranceend}
                                            onChange={handleInputChange}
                                            className={getInputClassName('insuranceend')}
                                            required
                                        />
                                        {errors.insuranceend && (
                                            <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.insuranceend}</p>
                                        )}
                                    </div>

                                    {/* Insurance File */}
                                    <div>
                                        <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                            Insurance file <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="file"
                                            name="insurancefile"
                                            onChange={handleFileChange}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className={getInputClassName('insurancefile')}
                                            required
                                        />
                                        {formData.insurancefile && (
                                            <p className="text-green-600 text-xs mt-0.5 leading-none">
                                                Selected: {formData.insurancefile.name}
                                            </p>
                                        )}
                                        {errors.insurancefile && (
                                            <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.insurancefile}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Row 2: Permit fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Permit Start Date */}
                                    <div>
                                        <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                            Permit start date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="permitstart"
                                            value={formData.permitstart}
                                            onChange={handleInputChange}
                                            className={getInputClassName('permitstart')}
                                            required
                                        />
                                        {errors.permitstart && (
                                            <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.permitstart}</p>
                                        )}
                                    </div>

                                    {/* Permit End Date */}
                                    <div>
                                        <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                            Permit end date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="permitend"
                                            value={formData.permitend}
                                            onChange={handleInputChange}
                                            className={getInputClassName('permitend')}
                                            required
                                        />
                                        {errors.permitend && (
                                            <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.permitend}</p>
                                        )}
                                    </div>

                                    {/* Permit File */}
                                    <div>
                                        <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                            Permit file <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="file"
                                            name="permitfile"
                                            onChange={handleFileChange}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className={getInputClassName('permitfile')}
                                            required
                                        />
                                        {formData.permitfile && (
                                            <p className="text-green-600 text-xs mt-0.5 leading-none">
                                                Selected: {formData.permitfile.name}
                                            </p>
                                        )}
                                        {errors.permitfile && (
                                            <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.permitfile}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Row 3: Pollution fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Pollution Start Date */}
                                    <div>
                                        <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                            Pollution start date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="pollutionstart"
                                            value={formData.pollutionstart}
                                            onChange={handleInputChange}
                                            className={getInputClassName('pollutionstart')}
                                            required
                                        />
                                        {errors.pollutionstart && (
                                            <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.pollutionstart}</p>
                                        )}
                                    </div>

                                    {/* Pollution End Date */}
                                    <div>
                                        <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                            Pollution end date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="pollutionend"
                                            value={formData.pollutionend}
                                            onChange={handleInputChange}
                                            className={getInputClassName('pollutionend')}
                                            required
                                        />
                                        {errors.pollutionend && (
                                            <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.pollutionend}</p>
                                        )}
                                    </div>

                                    {/* Pollution File (Optional) */}
                                    <div>
                                        <label className="block text-blue-700 font-semibold text-xs mb-0.5">
                                            Pollution file
                                        </label>
                                        <input
                                            type="file"
                                            name="pollutionfile"
                                            onChange={handleFileChange}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className={getInputClassName('pollutionfile')}
                                        />
                                        {formData.pollutionfile && (
                                            <p className="text-green-600 text-xs mt-0.5 leading-none">
                                                Selected: {formData.pollutionfile.name}
                                            </p>
                                        )}
                                        {errors.pollutionfile && (
                                            <p className="text-red-500 text-xs mt-0.5 leading-none">{errors.pollutionfile}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={handleSubmitClick}
                                    disabled={isLoading}
                                    className={`w-full max-w-md py-2 px-6 rounded-lg font-medium transition-all duration-200 transform shadow-md hover:shadow-lg ${isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105'
                                        } text-white`}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <Car className="text-sm" />
                                        <span className="text-sm">{isLoading ? 'Submitting...' : 'Submit'}</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirmation Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-4">
                                {/* Modal Header */}
                                <div className="flex items-center justify-center mb-3">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                                    </div>
                                </div>

                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Confirm Submission</h3>
                                    <p className="text-gray-600 text-sm">
                                        Please confirm if you want to submit this data.
                                    </p>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={handleCancelSubmit}
                                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmSubmit}
                                        disabled={isLoading}
                                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                            <div className="p-4">
                                {/* Success Icon */}
                                <div className="flex items-center justify-center mb-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    </div>
                                </div>

                                <div className="text-center mb-3">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Success!</h3>
                                    <p className="text-gray-600 text-sm">Your vehicle data has been submitted successfully.</p>
                                </div>

                                {/* Success Details */}
                                <div className="bg-green-50 rounded-lg p-3 mb-4">
                                    <div className="text-center">
                                        <p className="text-sm text-green-800 font-medium">
                                            Vehicle "{formData.vehicleName}" ({formData.vehicleNo}) has been registered successfully.
                                        </p>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleSuccessClose}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors duration-200 min-w-24 text-sm"
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
                            <div className="p-4">
                                {/* Error Icon */}
                                <div className="flex items-center justify-center mb-3">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-red-500" />
                                    </div>
                                </div>

                                <div className="text-center mb-3">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Submission Failed</h3>
                                    <p className="text-gray-600 text-sm">
                                        There was an error submitting your vehicle data.
                                    </p>
                                </div>

                                {/* Error Details */}
                                <div className="bg-red-50 rounded-lg p-3 mb-4 border border-red-200">
                                    <div className="text-center">
                                        <p className="text-sm text-red-800 font-medium break-words">
                                            {errorMessage}
                                        </p>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleErrorClose}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors duration-200 min-w-24 text-sm"
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

export default VehicleData;