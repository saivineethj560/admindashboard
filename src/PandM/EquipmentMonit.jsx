import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, CheckCircle, X, AlertTriangle, AlertCircle, Edit } from 'lucide-react';
import {API_BASE_URL} from '../Config.jsx';
const EquipmentMonit = () => {
    const [formData, setFormData] = useState({
        plant: '',
        vehicleType: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [vehicleData, setVehicleData] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [errorMessage, setErrorMessage] = useState('');

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isViewOnly, setIsViewOnly] = useState(false);
    const [editFormData, setEditFormData] = useState({
        shiftType: 'general',
        fromTime: '09:30',
        toTime: '18:00',
        duration: '8h 30m',
        dieselIssue: '',
        comments: ''
    });
    const [editErrors, setEditErrors] = useState({});

    const [plantData, setPlantData] = useState([]);
    const [contractData, setContractData] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [isLoadingPlants, setIsLoadingPlants] = useState(true);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
    const [isLoadingContract, setIsLoadingContract] = useState(true);

    const isBasicFormComplete = formData.plant && formData.vehicleType;

    // Helper function to get storage key for vehicle save data
    const getVehicleSaveKey = (vehicleNo, date, plant, vehicleType) => {
        return `vehicle_save_${vehicleNo}_${date}_${plant}_${vehicleType}`;
    };

    // Helper function to check if vehicle was saved today
    const isVehicleSavedToday = (vehicleNo) => {
        const today = new Date().toISOString().split('T')[0];
        const saveKey = getVehicleSaveKey(vehicleNo, today, formData.plant, formData.vehicleType);
        const savedData = JSON.parse(localStorage.getItem(saveKey) || 'null');
        return savedData !== null;
    };

    // Show Sweet Alert Success Modal
    const showSweetAlert = (message) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
    };

    // Close Sweet Alert Modal
    const closeSweetAlert = () => {
        setShowSuccessModal(false);
        setSuccessMessage('');
    };

    // Helper function to get vehicle status based on date
    const getVehicleStatus = (vehicle) => {
        const today = new Date().toISOString().split('T')[0];
        const selectedDate = formData.date;

        // If viewing today's date
        if (selectedDate === today) {
            return isVehicleSavedToday(vehicle.vehicleNo) ? 'Complete' : 'Update';
        }

        // If viewing a past date
        if (selectedDate < today) {
            const saveKey = getVehicleSaveKey(vehicle.vehicleNo, selectedDate, formData.plant, formData.vehicleType);
            const savedData = JSON.parse(localStorage.getItem(saveKey) || 'null');
            return savedData ? 'Complete' : 'Update';
        }

        // If viewing a future date
        return 'Update';
    };

    const convertTo12Hour = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const convertTo24Hour = (time12) => {
        if (!time12) return '';
        const [time, ampm] = time12.split(' ');
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);

        if (ampm === 'PM' && hour !== 12) {
            hour += 12;
        } else if (ampm === 'AM' && hour === 12) {
            hour = 0;
        }

        return `${hour.toString().padStart(2, '0')}:${minutes}`;
    };

    const getTimeRestrictions = () => {
        if (editFormData.shiftType === 'general') {
            return { min: '09:30', max: '18:00' };
        }
        return { min: '00:00', max: '23:59' };
    };

    const isTimeWithinShift = (time) => {
        if (!time || editFormData.shiftType !== 'general') return true;
        const restrictions = getTimeRestrictions();
        return time >= restrictions.min && time <= restrictions.max;
    };

    const fetchContractData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token || userInfo.access_token || userInfo.api_token;

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
                console.error('API Error Response:', errorData);
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
            setErrorMessage(`Failed to load contract data: ${error.message}`);
        } finally {
            setIsLoadingContract(false);
        }
    };

    const fetchPlantData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token || userInfo.access_token || userInfo.api_token;

            if (!token) {
                console.error('No authentication token found');
                setIsLoadingPlants(false);
                return;
            }

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
                console.error('API Error Response:', errorData);
                throw new Error(`Failed to fetch plant data: ${response.status} - ${errorData}`);
            }

            const result = await response.json();
            console.log('Plant Data Response:', result);

            if (result.status && result.data) {
                setPlantData(result.data);
                console.log('Plant Data Set:', result.data);
            } else if (Array.isArray(result)) {
                setPlantData(result);
                console.log('Plant Data Set (Array):', result);
            } else {
                console.error('No valid data found in response');
            }
        } catch (error) {
            console.error('Error fetching plant data:', error);
            setErrorMessage(`Failed to load plant data: ${error.message}`);
        } finally {
            setIsLoadingPlants(false);
        }
    };

    const fetchVehicleData = async () => {
        if (!formData.plant || !formData.vehicleType) return;

        setIsLoadingVehicles(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token || userInfo.access_token || userInfo.api_token;

            if (!token) {
                throw new Error('No authentication token found');
            }

            const filteredContracts = contractData.filter(contract => {
                const contractPlant = contract.PLANT || contract.plant;
                const contractVehicleType = contract.VEHICLE_TYPE || contract.vehicle_type;

                const plantMatches = contractPlant && formData.plant &&
                    (contractPlant.toLowerCase().trim() === formData.plant.toLowerCase().trim() ||
                        contractPlant.toLowerCase().includes(formData.plant.toLowerCase()) ||
                        formData.plant.toLowerCase().includes(contractPlant.toLowerCase()));

                return plantMatches && contractVehicleType === formData.vehicleType;
            });

            console.log('Filtered Contracts for Vehicle Data (Date Independent):', filteredContracts);

            const transformedVehicleData = filteredContracts.map((contract, index) => {
                const vehicle = {
                    id: contract.id || index + 1,
                    vehicleNo: contract.VEHICLE_NO || contract.vehicle_no || `VH${String(index + 1).padStart(3, '0')}`,
                    vehicleName: contract.VEHICLE_NAME || contract.vehicle_name || `Vehicle ${index + 1}`,
                    driverCode: contract.DRIVER || contract.driver || `DR${String(index + 1).padStart(3, '0')}`,
                    driverName: contract.DRIVER_NAME || contract.driver_name || 'No Driver Assigned',
                    originalData: contract
                };

                // Determine status based on date and save state
                vehicle.status = getVehicleStatus(vehicle);
                vehicle.saved = vehicle.status === 'Complete';

                return vehicle;
            });

            setVehicleData(transformedVehicleData);
            console.log('Transformed Vehicle Data (Date Independent):', transformedVehicleData);

        } catch (error) {
            console.error('Error fetching vehicle data:', error);
            setErrorMessage(`Failed to load vehicle data: ${error.message}`);
        } finally {
            setIsLoadingVehicles(false);
        }
    };

    useEffect(() => {
        fetchPlantData();
        fetchContractData();
    }, []);

    useEffect(() => {
        if (isBasicFormComplete && contractData.length > 0) {
            setVehicleData([]);
            fetchVehicleData();
        } else {
            setVehicleData([]);
            setIsLoadingVehicles(false);
        }
    }, [formData.plant, formData.vehicleType, formData.date, contractData]);

    useEffect(() => {
        if (formData.plant && formData.vehicleType && contractData.length > 0) {
            setVehicleData([]);
            fetchVehicleData();
        } else {
            setVehicleData([]);
            setIsLoadingVehicles(false);
        }
    }, [formData.plant, formData.vehicleType, contractData]);

    useEffect(() => {
        console.log('Vehicle types effect triggered');
        console.log('Form Data Plant:', formData.plant);
        console.log('Contract Data Length:', contractData.length);
        console.log('Plant Data Length:', plantData.length);

        if (formData.plant && contractData.length > 0 && plantData.length > 0) {
            const selectedPlant = plantData.find(plant => {
                const plantName = plant.plant || plant.PLANT ||
                    plant.name || plant.NAME ||
                    plant.plant_name || plant.PLANT_NAME ||
                    plant.description || plant.DESCRIPTION;
                return plantName && plantName.toString() === formData.plant.toString();
            });

            console.log('Selected Plant Object:', selectedPlant);

            if (selectedPlant) {
                const plantName = selectedPlant.plant || selectedPlant.PLANT || selectedPlant.name || selectedPlant.NAME || 'Unknown Plant';
                const plantDesc = selectedPlant.description || selectedPlant.DESCRIPTION || selectedPlant.desc || selectedPlant.DESC || 'No description';

                console.log('Plant Name to Match:', plantName);
                console.log('All Contract Data:', contractData);

                const filteredVehicleTypes = contractData
                    .filter(contract => {
                        const contractPlant = contract.PLANT || contract.plant ||
                            contract.PLANT_NAME || contract.plant_name;

                        console.log('Comparing Plant Names:', {
                            plantName: plantName,
                            contractPlant: contractPlant,
                            match: contractPlant && plantName &&
                                (contractPlant.toString().toLowerCase().trim() === plantName.toString().toLowerCase().trim() ||
                                    contractPlant.toString().toLowerCase().includes(plantName.toString().toLowerCase()) ||
                                    plantName.toString().toLowerCase().includes(contractPlant.toString().toLowerCase()))
                        });

                        if (!contractPlant || !plantName) return false;

                        if (contractPlant.toString().toLowerCase().trim() === plantName.toString().toLowerCase().trim()) {
                            return true;
                        }

                        return contractPlant.toString().toLowerCase().includes(plantName.toString().toLowerCase()) ||
                            plantName.toString().toLowerCase().includes(contractPlant.toString().toLowerCase());
                    })
                    .map(contract => contract.VEHICLE_TYPE || contract.vehicle_type)
                    .filter(type => type)
                    .filter((type, index, self) => self.indexOf(type) === index);

                console.log('Filtered Vehicle Types:', filteredVehicleTypes);
                setVehicleTypes(filteredVehicleTypes);
            } else {
                console.log('No matching plant found');
                setVehicleTypes([]);
            }
        } else {
            console.log('Missing data:', {
                hasPlant: !!formData.plant,
                contractDataLength: contractData.length,
                plantDataLength: plantData.length
            });
            setVehicleTypes([]);
        }

        if (formData.vehicleType) {
            setFormData(prev => ({
                ...prev,
                vehicleType: ''
            }));
        }
    }, [formData.plant, contractData, plantData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleEditVehicle = (vehicleIndex) => {
        console.log('Edit vehicle at index:', vehicleIndex);
        const vehicle = vehicleData[vehicleIndex];
        setEditingVehicle(vehicle);
        setEditingIndex(vehicleIndex);

        // Check if the vehicle data is already saved (completed) for the selected date
        const saveKey = getVehicleSaveKey(vehicle.vehicleNo, formData.date, formData.plant, formData.vehicleType);
        const savedData = JSON.parse(localStorage.getItem(saveKey) || 'null');
        const isCompleted = savedData !== null;

        if (savedData) {
            setEditFormData({
                shiftType: savedData.shiftType || 'general',
                fromTime: savedData.fromTime || '09:30',
                toTime: savedData.toTime || '18:00',
                duration: savedData.duration || '8h 30m',
                dieselIssue: savedData.dieselIssue || '',
                comments: savedData.comments || ''
            });
        } else {
            setEditFormData({
                shiftType: 'general',
                fromTime: '09:30',
                toTime: '18:00',
                duration: '8h 30m',
                dieselIssue: vehicle.dieselIssue || '',
                comments: vehicle.comments || ''
            });
        }

        setEditErrors({});
        setShowEditModal(true);

        // Store whether this is view-only mode
        setIsViewOnly(isCompleted);
    };

    const handleDeleteVehicle = (vehicleIndex) => {
        console.log('Delete vehicle at index:', vehicleIndex);
        const updatedVehicles = vehicleData.filter((_, index) => index !== vehicleIndex);
        setVehicleData(updatedVehicles);
    };

    const calculateDuration = (fromTime, toTime) => {
        if (!fromTime || !toTime) return '';

        const from = new Date(`2000-01-01T${fromTime}:00`);
        const to = new Date(`2000-01-01T${toTime}:00`);

        if (to < from) {
            to.setDate(to.getDate() + 1);
        }

        const diffMs = to - from;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${diffHours}h ${diffMinutes}m`;
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;

        setEditFormData(prev => {
            const newData = { ...prev, [name]: value };

            if (name === 'shiftType') {
                if (value === 'general') {
                    newData.fromTime = '09:30';
                    newData.toTime = '18:00';
                    newData.duration = calculateDuration('09:30', '18:00');
                } else {
                    newData.fromTime = '';
                    newData.toTime = '';
                    newData.duration = '';
                }
            }

            if (name === 'fromTime' || name === 'toTime') {
                const fromTime = name === 'fromTime' ? value : prev.fromTime;
                const toTime = name === 'toTime' ? value : prev.toTime;
                newData.duration = calculateDuration(fromTime, toTime);
            }

            return newData;
        });

        if (editErrors[name]) {
            setEditErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateEditForm = () => {
        const newErrors = {};

        if (!editFormData.shiftType.trim()) {
            newErrors.shiftType = 'Shift Type is required';
        }

        if (!editFormData.fromTime.trim()) {
            newErrors.fromTime = 'From Time is required';
        } else if (!isTimeWithinShift(editFormData.fromTime)) {
            newErrors.fromTime = 'Time must be between 9:30 AM and 6:00 PM for General Shift';
        }

        if (!editFormData.toTime.trim()) {
            newErrors.toTime = 'To Time is required';
        } else if (!isTimeWithinShift(editFormData.toTime)) {
            newErrors.toTime = 'Time must be between 9:30 AM and 6:00 PM for General Shift';
        }

        if (!editFormData.dieselIssue.trim()) {
            newErrors.dieselIssue = 'Diesel Issue is required';
        } else {
            const dieselValue = parseFloat(editFormData.dieselIssue);
            if (isNaN(dieselValue) || dieselValue < 0) {
                newErrors.dieselIssue = 'Please enter a valid diesel amount';
            }
        }

        if (editFormData.fromTime && editFormData.toTime) {
            const from = new Date(`2000-01-01T${editFormData.fromTime}:00`);
            const to = new Date(`2000-01-01T${editFormData.toTime}:00`);

            if (from >= to) {
                if (from.getTime() === to.getTime()) {
                    newErrors.toTime = 'To Time must be different from From Time';
                }
            }
        }

        setEditErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEditSubmit = async () => {
        if (!validateEditForm()) {
            return;
        }

        // Show confirmation modal instead of directly proceeding
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        setShowConfirmModal(false); // Close confirmation modal
        setIsLoading(true);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo.token || userInfo.access_token || userInfo.api_token;

            if (!token) {
                throw new Error('No authentication token found. Please log in again.');
            }

            const selectedPlant = plantData.find(plant => {
                const plantName = plant.plant || plant.PLANT ||
                    plant.name || plant.NAME ||
                    plant.plant_name || plant.PLANT_NAME ||
                    plant.description || plant.DESCRIPTION;
                return plantName && plantName.toString() === formData.plant.toString();
            });

            const plantDescription = selectedPlant ?
                (selectedPlant.description || selectedPlant.DESCRIPTION || selectedPlant.desc || selectedPlant.DESC || 'No description')
                : 'No description';
            const combinedPlantValue = `${formData.plant}-${plantDescription}`;

            const equipmentData = {
                PLANT: combinedPlantValue,
                PLANT_DESCRIPTION: plantDescription,
                VEHICLE_TYPE: formData.vehicleType,
                DATE: formData.date,
                VEHICLE_NO: editingVehicle.vehicleNo,
                VEHICLE_NAME: editingVehicle.vehicleName,
                DRIVER_CODE: editingVehicle.driverCode,
                DRIVER_NAME: editingVehicle.driverName,
                SHIFT: editFormData.shiftType,
                FROM_TIME: editFormData.fromTime,
                TO_TIME: editFormData.toTime,
                DURATION: editFormData.duration,
                DIESEL_ISSUE: parseFloat(editFormData.dieselIssue),
                COMMENTS: editFormData.comments,
                STATUS: 'Complete'
            };

            console.log('Submitting equipment data:', equipmentData);

            const response = await fetch(`${API_BASE_URL}equipment-monitoring/save`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(equipmentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);

                if (response.status === 422 && errorData.errors) {
                    const errorMessages = Object.values(errorData.errors).flat().join(', ');
                    throw new Error(`Validation Error: ${errorMessages}`);
                }

                throw new Error(errorData.message || `Server error: ${response.status}`);
            }

            const result = await response.json();
            console.log('Save Success:', result);

            // Save data to localStorage with date-specific key
            const saveKey = getVehicleSaveKey(editingVehicle.vehicleNo, formData.date, formData.plant, formData.vehicleType);
            const saveData = {
                shiftType: editFormData.shiftType,
                fromTime: editFormData.fromTime,
                toTime: editFormData.toTime,
                duration: editFormData.duration,
                dieselIssue: parseFloat(editFormData.dieselIssue),
                comments: editFormData.comments,
                savedDate: formData.date,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(saveKey, JSON.stringify(saveData));

            // Update vehicle data in state
            const updatedVehicleData = vehicleData.map((vehicle, index) => {
                if (index === editingIndex) {
                    return {
                        ...vehicle,
                        shift: editFormData.shiftType,
                        fromTime: editFormData.fromTime,
                        toTime: editFormData.toTime,
                        duration: editFormData.duration,
                        dieselIssue: parseFloat(editFormData.dieselIssue),
                        comments: editFormData.comments,
                        status: 'Complete',
                        saved: true
                    };
                }
                return vehicle;
            });

            setVehicleData(updatedVehicleData);

            // Show Sweet Alert 
            showSweetAlert(`Vehicle details for ${editingVehicle.vehicleNo} have been saved successfully!`);
            handleEditCancel();

        } catch (error) {
            console.error('Save error:', error);
            alert(`Failed to save vehicle details: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmCancel = () => {
        setShowConfirmModal(false);
    };
    const handleEditCancel = () => {
        setShowEditModal(false);
        setEditingVehicle(null);
        setEditingIndex(-1);
        setIsViewOnly(false);
        setEditFormData({
            shiftType: 'general',
            fromTime: '09:30',
            toTime: '18:00',
            duration: '8h 30m',
            dieselIssue: '',
            comments: ''
        });
        setEditErrors({});
    };

    const handleBackClick = () => {
        console.log('Navigate back clicked');
        window.history.back();
    };

    const getInputClassName = (fieldName) => {
        const baseClass = "w-full px-3 py-2 border border-blue-800 rounded-full focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-sm";
        const hasError = errors[fieldName];

        if (hasError) {
            return `${baseClass} border-red-500 focus:border-red-500 bg-red-50`;
        } else {
            return `${baseClass} border-blue-800 focus:border-blue-500 bg-white`;
        }
    };

    const getSelectedPlantLabel = () => {
        if (formData.plant && plantData.length > 0) {
            const selectedPlant = plantData.find(plant => {
                const plantName = plant.plant || plant.PLANT ||
                    plant.name || plant.NAME ||
                    plant.plant_name || plant.PLANT_NAME ||
                    plant.description || plant.DESCRIPTION;
                return plantName && plantName.toString() === formData.plant.toString();
            });
            if (selectedPlant) {
                const plantName = selectedPlant.plant || selectedPlant.PLANT || selectedPlant.name || selectedPlant.NAME || 'Unknown Plant';
                const plantDesc = selectedPlant.description || selectedPlant.DESCRIPTION || selectedPlant.desc || selectedPlant.DESC || 'No description';
                return `${plantName} - ${plantDesc}`;
            }
        }
        return formData.plant || '';
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'update':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'complete':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'active':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'inactive':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const timeRestrictions = getTimeRestrictions();

    // Get date range for date input (current day and previous 2 days)
    const getDateRange = () => {
        const today = new Date();
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(today.getDate() - 2);

        return {
            min: twoDaysAgo.toISOString().split('T')[0],
            max: today.toISOString().split('T')[0]
        };
    };

    const dateRange = getDateRange();

    return (
        <div className="min-h-screen bg-gray-100 py-4 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Settings className="text-white w-5 h-5" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">Equipment Monitoring</h1>
                                    <p className="text-blue-100 text-sm">Monitor and track equipment usage</p>
                                </div>
                            </div>
                            <button
                                onClick={handleBackClick}
                                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors duration-200"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Column - Equipment Image */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-fit">
                            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                                <div className="text-center">
                                    <div className="text-8xl mb-4">🏗️</div>
                                    <p className="text-lg font-semibold text-gray-700 mb-2">Equipment Preview</p>
                                    <p className="text-sm text-gray-500">Heavy Machinery Monitoring</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Basic Form Fields */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6">
                                    {/* Single Row: Plant, Vehicle Type, and Date */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-blue-700 font-semibold text-sm mb-2">
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
                                                    const plantName = plant.plant || plant.PLANT || plant.name || plant.NAME || plant.plant_name || plant.PLANT_NAME || plant.description || plant.DESCRIPTION || `Plant ${index + 1}`;
                                                    const plantDesc = plant.description || plant.DESCRIPTION || plant.desc || plant.DESC || 'No description';

                                                    return (
                                                        <option key={`plant-${index}`} value={plantName}>
                                                            {plantName} - {plantDesc}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            {errors.plant && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    {errors.plant}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-blue-700 font-semibold text-sm mb-2">
                                                Vehicle Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="vehicleType"
                                                value={formData.vehicleType}
                                                onChange={handleInputChange}
                                                className={getInputClassName('vehicleType')}
                                                disabled={!formData.plant || isLoadingContract || vehicleTypes.length === 0}
                                            >
                                                <option value="">
                                                    {!formData.plant
                                                        ? "Select Plant first"
                                                        : isLoadingContract
                                                            ? "Loading contract data..."
                                                            : vehicleTypes.length === 0
                                                                ? "No vehicle types available"
                                                                : "Select Vehicle Type"
                                                    }
                                                </option>
                                                {vehicleTypes.map((vehicleType, index) => (
                                                    <option key={`vehicle-type-${index}`} value={vehicleType}>
                                                        {vehicleType}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.vehicleType && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    {errors.vehicleType}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-blue-700 font-semibold text-sm mb-2">
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                className={getInputClassName('date')}
                                                min={dateRange.min}
                                                max={dateRange.max}
                                            />

                                            {errors.date && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    {errors.date}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {!isBasicFormComplete && (
                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-blue-600 text-sm mt-1">
                                                        Please select Plant and Vehicle Type to view available vehicles.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Vehicle Details Section - Embedded within the right column */}
                                    {isBasicFormComplete && (
                                        <div className="mt-6">
                                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                                        <CheckCircle className="text-white w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">Vehicle Details</h3>
                                                        <p className="text-green-100 text-sm">
                                                            Available vehicles for {formData.vehicleType}
                                                            {formData.date && ` on ${formData.date}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border border-t-0 border-gray-200 rounded-b-lg bg-white p-6">
                                                {isLoadingVehicles ? (
                                                    <div className="text-center py-12">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                                            <p className="text-gray-600 text-lg font-medium">Loading vehicle data...</p>
                                                            <p className="text-gray-500 text-sm mt-1">Please wait while we fetch available vehicles</p>
                                                        </div>
                                                    </div>
                                                ) : vehicleData.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <div className="text-6xl mb-4">🚫</div>
                                                        <p className="text-gray-600 text-lg font-medium">No Vehicles Found</p>
                                                        <p className="text-gray-500 text-sm mt-1">No vehicles available for the selected criteria</p>
                                                    </div>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border-collapse border border-gray-200">
                                                            <thead>
                                                                <tr className="bg-gray-50">
                                                                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                                        Vehicle No
                                                                    </th>
                                                                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                                        Vehicle Name
                                                                    </th>
                                                                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                                        Driver Code
                                                                    </th>
                                                                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                                        Driver Name
                                                                    </th>
                                                                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                                        Action
                                                                    </th>
                                                                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                                        Status
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {vehicleData.map((vehicle, index) => (
                                                                    <tr key={index} className={`hover:bg-gray-50 transition-colors ${vehicle.saved ? 'bg-green-50' : ''}`}>
                                                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 font-medium">
                                                                            <div className="flex items-center space-x-2">
                                                                                <span>{vehicle.vehicleNo}</span>
                                                                                {vehicle.saved && (
                                                                                    <CheckCircle className="w-4 h-4 text-green-600" title="Data saved successfully" />
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                                                                            {vehicle.vehicleName}
                                                                        </td>
                                                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800 font-mono">
                                                                            {vehicle.driverCode}
                                                                        </td>
                                                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                                                                            {vehicle.driverName}
                                                                        </td>
                                                                        <td className="border border-gray-200 px-4 py-3">
                                                                            <div className="flex items-center justify-center space-x-2">
                                                                                <button
                                                                                    onClick={() => handleEditVehicle(index)}
                                                                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors flex items-center justify-center"
                                                                                    title={vehicle.saved ? "View Vehicle Details" : "Edit Vehicle"}
                                                                                >
                                                                                    <Edit className="w-5 h-5" />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                        <td className="border border-gray-200 px-4 py-3">
                                                                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(vehicle.status)}`}>
                                                                                {vehicle.status}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>

                                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                            <p className="text-sm text-gray-600">
                                                                <strong>Total vehicles found:</strong> {vehicleData.length}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Vehicle Modal */}
                {showEditModal && editingVehicle && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                            <div className="p-4">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-6 h-6 ${isViewOnly ? 'bg-green-100' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                                            <Edit className={`w-3 h-3 ${isViewOnly ? 'text-green-600' : 'text-blue-600'}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-md font-bold text-gray-900">
                                                {isViewOnly ? 'View Vehicle Details' : 'Edit Vehicle Details'}
                                            </h3>
                                            <p className="text-gray-900 text-xs font-bold">{editingVehicle.vehicleNo} - {editingVehicle.vehicleName}</p>
                                            {isViewOnly && (
                                                <p className="text-green-600 text-xs font-medium flex items-center">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Data already saved for this date
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleEditCancel}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        <X className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>

                                {/* Vehicle Info Card */}
                                <div className="bg-gray-50 rounded p-2 mb-2 border">
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <span className="font-medium text-gray-600">Driver Code:</span>
                                            <p className="text-gray-900 font-mono text-xs">{editingVehicle.driverCode}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Driver Name:</span>
                                            <p className="text-gray-900 text-xs">{editingVehicle.driverName}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Date:</span>
                                            <p className="text-gray-900 text-xs">{formData.date}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-3">
                                    {/* Shift Type */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Shift Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="shiftType"
                                            value={editFormData.shiftType}
                                            onChange={handleEditFormChange}
                                            disabled={isViewOnly}
                                            className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-200 focus:outline-none text-sm ${isViewOnly
                                                ? 'bg-gray-100 cursor-not-allowed text-gray-600'
                                                : editErrors.shiftType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="general">General Shift (9:30 AM - 6:00 PM)</option>
                                        </select>
                                        {editErrors.shiftType && !isViewOnly && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                {editErrors.shiftType}
                                            </p>
                                        )}
                                    </div>

                                    {/* Time Fields Row */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                From Time <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                name="fromTime"
                                                value={editFormData.fromTime}
                                                onChange={handleEditFormChange}
                                                disabled={isViewOnly}
                                                min={editFormData.shiftType === 'general' ? timeRestrictions.min : undefined}
                                                max={editFormData.shiftType === 'general' ? timeRestrictions.max : undefined}
                                                className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-200 focus:outline-none text-sm ${isViewOnly
                                                    ? 'bg-gray-100 cursor-not-allowed text-gray-600'
                                                    : editErrors.fromTime ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            {editFormData.fromTime && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    {convertTo12Hour(editFormData.fromTime)}
                                                </p>
                                            )}
                                            {editFormData.shiftType === 'general' && !isViewOnly && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    9:30 AM - 6:00 PM only
                                                </p>
                                            )}
                                            {editErrors.fromTime && !isViewOnly && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    {editErrors.fromTime}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                To Time <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                name="toTime"
                                                value={editFormData.toTime}
                                                onChange={handleEditFormChange}
                                                disabled={isViewOnly}
                                                min={editFormData.shiftType === 'general' ? timeRestrictions.min : undefined}
                                                max={editFormData.shiftType === 'general' ? timeRestrictions.max : undefined}
                                                className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-200 focus:outline-none text-sm ${isViewOnly
                                                    ? 'bg-gray-100 cursor-not-allowed text-gray-600'
                                                    : editErrors.toTime ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            {editFormData.toTime && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    {convertTo12Hour(editFormData.toTime)}
                                                </p>
                                            )}
                                            {editFormData.shiftType === 'general' && !isViewOnly && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    9:30 AM - 6:00 PM only
                                                </p>
                                            )}
                                            {editErrors.toTime && !isViewOnly && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    {editErrors.toTime}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Duration Display */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Duration (Auto-calculated)
                                        </label>
                                        <div className={`px-3 py-2 border rounded ${isViewOnly ? 'bg-gray-100' : 'bg-green-50 border-green-200'}`}>
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className={`w-3 h-3 ${isViewOnly ? 'text-gray-500' : 'text-green-600'}`} />
                                                <span className={`font-medium text-sm ${isViewOnly ? 'text-gray-600' : 'text-green-800'}`}>
                                                    {editFormData.duration || 'Enter both times to calculate'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Comments
                                        </label>
                                        <textarea
                                            name="comments"
                                            value={editFormData.comments}
                                            onChange={handleEditFormChange}
                                            disabled={isViewOnly}
                                            placeholder={isViewOnly ? "" : "Enter any additional comments or notes..."}
                                            rows={3}
                                            className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-200 focus:outline-none text-sm resize-none ${isViewOnly ? 'bg-gray-100 cursor-not-allowed text-gray-600' : 'border-gray-300'
                                                }`}
                                        />
                                    </div>

                                    {/* Diesel Issue */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Diesel Issue (Liters) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className={`text-xs font-medium ${isViewOnly ? 'text-gray-400' : 'text-gray-500'}`}>L</span>
                                            </div>
                                            <input
                                                type="number"
                                                name="dieselIssue"
                                                value={editFormData.dieselIssue}
                                                onChange={handleEditFormChange}
                                                disabled={isViewOnly}
                                                placeholder={isViewOnly ? "" : "Enter diesel amount in liters"}
                                                min="0"
                                                step="0.1"
                                                className={`w-full pl-8 pr-3 py-2 border rounded focus:ring-1 focus:ring-blue-200 focus:outline-none text-sm ${isViewOnly
                                                    ? 'bg-gray-100 cursor-not-allowed text-gray-600'
                                                    : editErrors.dieselIssue ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                        </div>
                                        {editErrors.dieselIssue && !isViewOnly && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                {editErrors.dieselIssue}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="border-t border-gray-200 p-4">
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleEditCancel}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition-colors duration-200 text-sm"
                                    >
                                        {isViewOnly ? 'Close' : 'Cancel'}
                                    </button>
                                    {!isViewOnly && (
                                        <button
                                            onClick={handleEditSubmit}
                                            disabled={isLoading}
                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Saving...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <CheckCircle className="w-3 h-3" />
                                                    <span>Save Changes</span>
                                                </div>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[55] p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                            <div className="p-6 text-center">
                                {/* Question Icon */}
                                <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                {/* Confirmation Title */}
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Confirm Save Changes
                                </h3>

                                {/* Confirmation Message */}
                                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                    Are you sure you want to save the changes for vehicle <strong>{editingVehicle?.vehicleNo}</strong>?
                                    This action will update the vehicle details permanently.
                                </p>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleConfirmCancel}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200 text-sm"
                                    >
                                        No, Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmSubmit}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Saving...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center space-x-2">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Yes, Save</span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sweet Alert Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-pulse">
                            <div className="p-6 text-center">
                                {/* Success Icon with Animation */}
                                <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                                        <CheckCircle className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                {/* Success Title */}
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Success!
                                </h3>

                                {/* Success Message */}
                                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                    {successMessage}
                                </p>

                                {/* Action Button */}
                                <button
                                    onClick={closeSweetAlert}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>OK</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EquipmentMonit;