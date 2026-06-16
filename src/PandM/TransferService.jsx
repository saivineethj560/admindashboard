import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Truck, Wrench } from 'lucide-react';
import { API_BASE_URL } from '../Config.jsx';

const TransferServicePage = () => {
    const [currentUser, setCurrentUser] = useState({});
    const [activeForm, setActiveForm] = useState(null); // 'transfer' or 'service' or null
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [transferData, setTransferData] = useState({
        // Transfer From section
        fromPlant: '',
        vehicleType: '',
        vehicleNumber: '',
        requestedDate: '',
        quantity: '',
        Comments: '', // Added comments field for Transfer From
        // Transfer To section
        toPlant: '',
        approvedDate: '',
        employeeId: '',
        employeeName: '',
        approverComments: '' // Added comments field for Transfer To
    });
    const [serviceData, setServiceData] = useState({
        plant: '',
        vehicleType: '',
        vehicleNumber: '',
        status: '',
        fromTime: '',
        toTime: '',
        date: '',
        comments: '',
        actualDate: ''
    });
    // State for plant data from API
    const [plantData, setPlantData] = useState([]);
    const [isLoadingPlants, setIsLoadingPlants] = useState(true);
    // Add contract data and vehicle types state
    const [contractData, setContractData] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [vehicleNumbers, setVehicleNumbers] = useState([]);
    const [isLoadingContract, setIsLoadingContract] = useState(true);
    // Service form specific states
    const [serviceVehicleTypes, setServiceVehicleTypes] = useState([]);
    const [serviceVehicleNumbers, setServiceVehicleNumbers] = useState([]);
    // Debugging state
    const [debugInfo, setDebugInfo] = useState([]);
    // Add debug log function
    const addDebugLog = (message, data = null) => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = { timestamp, message, data };
        console.log(`[${timestamp}] ${message}`, data);
        setDebugInfo(prev => [...prev.slice(-4), logEntry]);
    };
    // Function to fetch contract data
    const fetchContractData = async () => {
        try {
            addDebugLog('Starting to fetch contract data...');
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            addDebugLog('Retrieved userInfo from localStorage', userInfo);
            const token = userInfo.token || userInfo.access_token || userInfo.api_token;
            if (!token) {
                addDebugLog('ERROR: No authentication token found');
                setIsLoadingContract(false);
                return;
            }
            addDebugLog('Making contract API request with token', { tokenExists: !!token });
            const response = await fetch(`${API_BASE_URL}getContractData`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            addDebugLog('Contract API Response received', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            if (!response.ok) {
                const errorData = await response.text();
                addDebugLog('Contract API Error Response', errorData);
                throw new Error(`Failed to fetch contract data: ${response.status} - ${errorData}`);
            }
            const result = await response.json();
            addDebugLog('Contract API Response parsed', result);
            if (result.status && result.data) {
                setContractData(result.data);
                addDebugLog('Contract data received successfully', result.data);
            } else if (Array.isArray(result)) {
                setContractData(result);
                addDebugLog('Contract data set from array result', result);
            } else {
                addDebugLog('ERROR: No valid contract data found in response');
            }
        } catch (error) {
            addDebugLog('ERROR: Failed to fetch contract data', error.message);
            console.error('Error fetching contract data:', error);
        } finally {
            setIsLoadingContract(false);
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
            console.error('Failed to load plant data:', error.message);
        } finally {
            setIsLoadingPlants(false);
        }
    };
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        setCurrentUser(userInfo);
        addDebugLog('Current user info loaded:', userInfo);
    }, []);
    // Effect to fetch data on component mount
    useEffect(() => {
        fetchPlantData();
        fetchContractData();
    }, []);
    // Effect to update vehicle types when fromPlant changes
    useEffect(() => {
        console.log('Vehicle types effect triggered for transfer');
        console.log('Transfer From Plant:', transferData.fromPlant);
        console.log('Contract Data Length:', contractData.length);
        console.log('Plant Data Length:', plantData.length);
        if (transferData.fromPlant && contractData.length > 0 && plantData.length > 0) {
            const selectedPlant = plantData.find(plant => {
                const plantName = plant.plant || plant.PLANT ||
                    plant.name || plant.NAME ||
                    plant.plant_name || plant.PLANT_NAME ||
                    plant.description || plant.DESCRIPTION;
                return plantName && plantName.toString() === transferData.fromPlant.toString();
            });
            console.log('Selected Plant Object for transfer:', selectedPlant);
            if (selectedPlant) {
                const plantName = selectedPlant.plant || selectedPlant.PLANT || selectedPlant.name || selectedPlant.NAME || 'Unknown Plant';
                const plantDesc = selectedPlant.description || selectedPlant.DESCRIPTION || selectedPlant.desc || selectedPlant.DESC || 'No description';
                console.log('Plant Name to Match for transfer:', plantName);
                console.log('All Contract Data:', contractData);
                const filteredVehicleTypes = contractData
                    .filter(contract => {
                        const contractPlant = contract.PLANT || contract.plant ||
                            contract.PLANT_NAME || contract.plant_name;
                        console.log('Comparing Plant Names for transfer:', {
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
                console.log('Filtered Vehicle Types for transfer:', filteredVehicleTypes);
                setVehicleTypes(filteredVehicleTypes);
            } else {
                console.log('No matching plant found for transfer');
                setVehicleTypes([]);
            }
        } else {
            console.log('Missing data for transfer:', {
                hasFromPlant: !!transferData.fromPlant,
                contractDataLength: contractData.length,
                plantDataLength: plantData.length
            });
            setVehicleTypes([]);
        }
        // Reset vehicle type when from plant changes
        if (transferData.vehicleType) {
            setTransferData(prev => ({
                ...prev,
                vehicleType: '',
                vehicleNumber: ''
            }));
        }
        // Reset vehicle numbers when plant changes
        setVehicleNumbers([]);
    }, [transferData.fromPlant, contractData, plantData]);
    // Effect to update vehicle numbers when both plant and vehicle type are selected
    useEffect(() => {
        console.log('Vehicle numbers effect triggered for transfer');
        console.log('Transfer From Plant:', transferData.fromPlant);
        console.log('Transfer Vehicle Type:', transferData.vehicleType);
        console.log('Contract Data Length:', contractData.length);
        if (transferData.fromPlant && transferData.vehicleType && contractData.length > 0 && plantData.length > 0) {
            const selectedPlant = plantData.find(plant => {
                const plantName = plant.plant || plant.PLANT ||
                    plant.name || plant.NAME ||
                    plant.plant_name || plant.PLANT_NAME ||
                    plant.description || plant.DESCRIPTION;
                return plantName && plantName.toString() === transferData.fromPlant.toString();
            });
            if (selectedPlant) {
                const plantName = selectedPlant.plant || selectedPlant.PLANT || selectedPlant.name || selectedPlant.NAME || 'Unknown Plant';
                console.log('Filtering for vehicle numbers with:', {
                    plantName: plantName,
                    vehicleType: transferData.vehicleType
                });
                const filteredVehicleNumbers = contractData
                    .filter(contract => {
                        const contractPlant = contract.PLANT || contract.plant ||
                            contract.PLANT_NAME || contract.plant_name;
                        const contractVehicleType = contract.VEHICLE_TYPE || contract.vehicle_type;
                        console.log('Contract filtering:', {
                            contractPlant: contractPlant,
                            contractVehicleType: contractVehicleType,
                            plantMatch: contractPlant && plantName &&
                                (contractPlant.toString().toLowerCase().trim() === plantName.toString().toLowerCase().trim() ||
                                    contractPlant.toString().toLowerCase().includes(plantName.toString().toLowerCase()) ||
                                    plantName.toString().toLowerCase().includes(contractPlant.toString().toLowerCase())),
                            vehicleTypeMatch: contractVehicleType === transferData.vehicleType
                        });
                        const plantMatches = contractPlant && plantName &&
                            (contractPlant.toString().toLowerCase().trim() === plantName.toString().toLowerCase().trim() ||
                                contractPlant.toString().toLowerCase().includes(plantName.toString().toLowerCase()) ||
                                plantName.toString().toLowerCase().includes(contractPlant.toString().toLowerCase()));
                        return plantMatches && contractVehicleType === transferData.vehicleType;
                    })
                    .map(contract => ({
                        vehicleNo: contract.VEHICLE_NO || contract.vehicle_no || 'N/A',
                        vehicleName: contract.VEHICLE_NAME || contract.vehicle_name || 'Unknown Vehicle',
                        driverCode: contract.DRIVER || contract.driver || 'N/A',
                        driverName: contract.DRIVER_NAME || contract.driver_name || 'No Driver'
                    }))
                    .filter(vehicle => vehicle.vehicleNo !== 'N/A')
                    .filter((vehicle, index, self) =>
                        self.findIndex(v => v.vehicleNo === vehicle.vehicleNo) === index
                    );
                console.log('Filtered Vehicle Numbers for transfer:', filteredVehicleNumbers);
                setVehicleNumbers(filteredVehicleNumbers);
            } else {
                console.log('No matching plant found for vehicle numbers');
                setVehicleNumbers([]);
            }
        } else {
            console.log('Missing data for vehicle numbers:', {
                hasFromPlant: !!transferData.fromPlant,
                hasVehicleType: !!transferData.vehicleType,
                contractDataLength: contractData.length,
                plantDataLength: plantData.length
            });
            setVehicleNumbers([]);
        }
        // Reset vehicle number when plant or vehicle type changes
        if (transferData.vehicleNumber) {
            setTransferData(prev => ({
                ...prev,
                vehicleNumber: ''
            }));
        }
    }, [transferData.fromPlant, transferData.vehicleType, contractData, plantData]);
    // Effect to update service vehicle types when plant changes
    useEffect(() => {
        console.log('Service vehicle types effect triggered');
        console.log('Service Plant:', serviceData.plant);
        console.log('Contract Data Length:', contractData.length);
        console.log('Plant Data Length:', plantData.length);
        if (serviceData.plant && contractData.length > 0 && plantData.length > 0) {
            const selectedPlant = plantData.find(plant => {
                const plantName = plant.plant || plant.PLANT ||
                    plant.name || plant.NAME ||
                    plant.plant_name || plant.PLANT_NAME ||
                    plant.description || plant.DESCRIPTION;
                return plantName && plantName.toString() === serviceData.plant.toString();
            });
            console.log('Selected Plant Object for service:', selectedPlant);
            if (selectedPlant) {
                const plantName = selectedPlant.plant || selectedPlant.PLANT || selectedPlant.name || selectedPlant.NAME || 'Unknown Plant';
                console.log('Plant Name to Match for service:', plantName);
                console.log('All Contract Data:', contractData);
                const filteredVehicleTypes = contractData
                    .filter(contract => {
                        const contractPlant = contract.PLANT || contract.plant ||
                            contract.PLANT_NAME || contract.plant_name;
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
                console.log('Filtered Vehicle Types for service:', filteredVehicleTypes);
                setServiceVehicleTypes(filteredVehicleTypes);
            } else {
                console.log('No matching plant found for service');
                setServiceVehicleTypes([]);
            }
        } else {
            console.log('Missing data for service:', {
                hasPlant: !!serviceData.plant,
                contractDataLength: contractData.length,
                plantDataLength: plantData.length
            });
            setServiceVehicleTypes([]);
        }
        // Reset vehicle type when plant changes
        if (serviceData.vehicleType) {
            setServiceData(prev => ({
                ...prev,
                vehicleType: '',
                vehicleNumber: ''
            }));
        }
        // Reset vehicle numbers when plant changes
        setServiceVehicleNumbers([]);
    }, [serviceData.plant, contractData, plantData]);
    // Effect to update service vehicle numbers when both plant and vehicle type are selected
    useEffect(() => {
        console.log('Service vehicle numbers effect triggered');
        console.log('Service Plant:', serviceData.plant);
        console.log('Service Vehicle Type:', serviceData.vehicleType);
        console.log('Contract Data Length:', contractData.length);
        if (serviceData.plant && serviceData.vehicleType && contractData.length > 0 && plantData.length > 0) {
            const selectedPlant = plantData.find(plant => {
                const plantName = plant.plant || plant.PLANT ||
                    plant.name || plant.NAME ||
                    plant.plant_name || plant.PLANT_NAME ||
                    plant.description || plant.DESCRIPTION;
                return plantName && plantName.toString() === serviceData.plant.toString();
            });
            if (selectedPlant) {
                const plantName = selectedPlant.plant || selectedPlant.PLANT || selectedPlant.name || selectedPlant.NAME || 'Unknown Plant';
                console.log('Filtering for service vehicle numbers with:', {
                    plantName: plantName,
                    vehicleType: serviceData.vehicleType
                });
                const filteredVehicleNumbers = contractData
                    .filter(contract => {
                        const contractPlant = contract.PLANT || contract.plant ||
                            contract.PLANT_NAME || contract.plant_name;
                        const contractVehicleType = contract.VEHICLE_TYPE || contract.vehicle_type;
                        const plantMatches = contractPlant && plantName &&
                            (contractPlant.toString().toLowerCase().trim() === plantName.toString().toLowerCase().trim() ||
                                contractPlant.toString().toLowerCase().includes(plantName.toString().toLowerCase()) ||
                                plantName.toString().toLowerCase().includes(contractPlant.toString().toLowerCase()));
                        return plantMatches && contractVehicleType === serviceData.vehicleType;
                    })
                    .map(contract => ({
                        vehicleNo: contract.VEHICLE_NO || contract.vehicle_no || 'N/A',
                        vehicleName: contract.VEHICLE_NAME || contract.vehicle_name || 'Unknown Vehicle',
                        driverCode: contract.DRIVER || contract.driver || 'N/A',
                        driverName: contract.DRIVER_NAME || contract.driver_name || 'No Driver'
                    }))
                    .filter(vehicle => vehicle.vehicleNo !== 'N/A')
                    .filter((vehicle, index, self) =>
                        self.findIndex(v => v.vehicleNo === vehicle.vehicleNo) === index
                    );
                console.log('Filtered Vehicle Numbers for service:', filteredVehicleNumbers);
                setServiceVehicleNumbers(filteredVehicleNumbers);
            } else {
                console.log('No matching plant found for service vehicle numbers');
                setServiceVehicleNumbers([]);
            }
        } else {
            console.log('Missing data for service vehicle numbers:', {
                hasPlant: !!serviceData.plant,
                hasVehicleType: !!serviceData.vehicleType,
                contractDataLength: contractData.length,
                plantDataLength: plantData.length
            });
            setServiceVehicleNumbers([]);
        }
        // Reset vehicle number when plant or vehicle type changes
        if (serviceData.vehicleNumber) {
            setServiceData(prev => ({
                ...prev,
                vehicleNumber: ''
            }));
        }
    }, [serviceData.plant, serviceData.vehicleType, contractData, plantData]);
    const handleBackClick = () => {
        console.log('Navigate back clicked');
        window.history.back();
    };
    const handleTransferClick = () => {
        console.log('Transfer service clicked');
        setActiveForm('transfer');
    };
    const handleServiceClick = () => {
        console.log('Service clicked');
        setActiveForm('service');
    };
    const handleCloseForm = () => {
        setActiveForm(null);
        // Reset transfer data
        setTransferData({
            fromPlant: '',
            vehicleType: '',
            vehicleNumber: '',
            requestedDate: '',
            quantity: '',
            Comments: '', // Reset comments field
            toPlant: '',
            approvedDate: '',
            employeeId: '',
            employeeName: '',
            approverComments: '' // Reset comments field
        });
        // Reset service data
        setServiceData({
            plant: '',
            vehicleType: '',
            vehicleNumber: '',
            status: '',
            fromTime: '',
            toTime: '',
            date: '',
            comments: '',
            actualDate: ''
        });
        setVehicleTypes([]);
        setVehicleNumbers([]);
        setServiceVehicleTypes([]);
        setServiceVehicleNumbers([]);
    };
    const extractPlantCode = (plantName) => {
        if (!plantName) return '';
        const selectedPlant = plantData.find(plant => {
            const name = plant.plant || plant.PLANT || plant.name || plant.NAME ||
                plant.plant_name || plant.PLANT_NAME ||
                plant.description || plant.DESCRIPTION;
            return name && name.toString() === plantName.toString();
        });
        if (selectedPlant) {
            const name = selectedPlant.plant || selectedPlant.PLANT || selectedPlant.name ||
                selectedPlant.NAME || selectedPlant.plant_name || selectedPlant.PLANT_NAME ||
                `Plant ${plantData.indexOf(selectedPlant) + 1}`;
            const description = selectedPlant.description || selectedPlant.DESCRIPTION ||
                selectedPlant.desc || selectedPlant.DESC || 'No description';
            return `${name} - ${description}`;
        }
        return plantName;
    };
    const handleTransferSubmit = async () => {
        try {
            addDebugLog('Starting transfer submission...', transferData);
            // Validation - updated to include new required fields
            if (!transferData.fromPlant || !transferData.vehicleType || !transferData.vehicleNumber ||
                !transferData.toPlant || !transferData.requestedDate || !transferData.quantity ||
                !transferData.employeeId || !transferData.employeeName) {
                alert('Please fill in all required fields');
                return;
            }
            // Show confirmation modal
            setConfirmAction(() => async () => {
                try {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                    const token = userInfo.token || userInfo.access_token || userInfo.api_token;
                    if (!token) {
                        alert('Authentication token not found. Please login again.');
                        return;
                    }
                    // Prepare data with new fields
                    const submitData = {
                        FROM_PLANT: extractPlantCode(transferData.fromPlant),
                        VEHICLE_TYPE: transferData.vehicleType,
                        VEHICLE_NUMBER: transferData.vehicleNumber,
                        REQUESTED_DATE: transferData.requestedDate,
                        QUANTITY: transferData.quantity,
                        TO_PLANT: extractPlantCode(transferData.toPlant),
                        APPROVED_DATE: transferData.approvedDate || null,
                        EMPLOYEE_ID: transferData.employeeId,
                        EMPLOYEE_NAME: transferData.employeeName,
                        COMMENTS: transferData.Comments, // Added Comments
                        APPROVER_COMMENTS: transferData.approverComments // Added approverComments
                    };
                    addDebugLog('Submitting transfer data to API:', submitData);
                    const response = await fetch(`${API_BASE_URL}store-transfer`, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(submitData)
                    });
                    addDebugLog('Transfer API Response received', {
                        status: response.status,
                        statusText: response.statusText,
                        ok: response.ok
                    });
                    const result = await response.json();
                    addDebugLog('Transfer API Response parsed', result);
                    setShowConfirmModal(false);
                    if (response.ok && result.success) {
                        setSuccessMessage('Transfer request submitted successfully!');
                        setShowSuccessModal(true);
                        handleCloseForm();
                    } else {
                        const errorMessage = result.message || 'Failed to submit transfer request';
                        const errors = result.errors ? Object.values(result.errors).flat().join(', ') : '';
                        alert(`Error: ${errorMessage}${errors ? ` - ${errors}` : ''}`);
                        addDebugLog('Transfer submission error', result);
                    }
                } catch (error) {
                    setShowConfirmModal(false);
                    addDebugLog('Transfer submission error', error.message);
                    console.error('Error submitting transfer:', error);
                    alert('An error occurred while submitting the transfer request. Please try again.');
                }
            });
            setShowConfirmModal(true);
        } catch (error) {
            addDebugLog('Transfer submission error', error.message);
            console.error('Error submitting transfer:', error);
            alert('An error occurred while submitting the transfer request. Please try again.');
        }
    };
    const handleServiceSubmit = async () => {
        try {
            addDebugLog('Starting service submission...', serviceData);
            // Validation
            if (!serviceData.plant || !serviceData.vehicleType || !serviceData.vehicleNumber || !serviceData.status) {
                alert('Please fill in all required fields');
                return;
            }
            // Additional validation for service status
            if (serviceData.status === 'maintenance') {
                if (!serviceData.fromTime || !serviceData.toTime || !serviceData.actualDate) {
                    alert('Please fill in From Date, Planned Date, and Actual Date for maintenance records');
                    return;
                }
            } else if (serviceData.status === 'service') {
                if (!serviceData.fromTime || !serviceData.toTime || !serviceData.actualDate) {
                    alert('Please fill in From Date, Planned Date, and Actual Date for service records');
                    return;
                }
            }
            // Show confirmation modal
            setConfirmAction(() => async () => {
                try {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                    const token = userInfo.token || userInfo.access_token || userInfo.api_token;
                    if (!token) {
                        alert('Authentication token not found. Please login again.');
                        return;
                    }
                    // Prepare FormData for submission
                    const formData = new FormData();
                    formData.append('PLANT', extractPlantCode(serviceData.plant));
                    formData.append('VEHICLE_TYPE', serviceData.vehicleType);
                    formData.append('VEHICLE_NUMBER', serviceData.vehicleNumber);
                    formData.append('STATUS', serviceData.status);
                    formData.append('COMMENTS', serviceData.comments);
                    formData.append('ACTUAL_DATE', serviceData.actualDate);
                    if (serviceData.status === 'maintenance' || serviceData.status === 'service') {
                        formData.append('FROM_DATE', serviceData.fromTime);
                        formData.append('TO_DATE', serviceData.toTime);
                        formData.append('COST', '0');
                    }
                    addDebugLog('Submitting service data to API');
                    const response = await fetch(`${API_BASE_URL}store-service`, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });
                    addDebugLog('Service API Response received', {
                        status: response.status,
                        statusText: response.statusText,
                        ok: response.ok
                    });
                    const result = await response.json();
                    addDebugLog('Service API Response parsed', result);
                    setShowConfirmModal(false);
                    if (response.ok && result.success) {
                        setSuccessMessage('Service record created successfully!');
                        setShowSuccessModal(true);
                        handleCloseForm();
                    } else {
                        const errorMessage = result.message || 'Failed to create service record';
                        const errors = result.errors ? Object.values(result.errors).flat().join(', ') : '';
                        alert(`Error: ${errorMessage}${errors ? ` - ${errors}` : ''}`);
                        addDebugLog('Service submission error', result);
                    }
                } catch (error) {
                    setShowConfirmModal(false);
                    addDebugLog('Service submission error', error.message);
                    console.error('Error submitting service:', error);
                    alert('An error occurred while submitting the service record. Please try again.');
                }
            });
            setShowConfirmModal(true);
        } catch (error) {
            addDebugLog('Service submission error', error.message);
            console.error('Error submitting service:', error);
            alert('An error occurred while submitting the service record. Please try again.');
        }
    };
    const handleTransferChange = (field, value) => {
        setTransferData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleServiceChange = (field, value) => {
        setServiceData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const shouldShowApproverComments = () => {
        const empId = currentUser.Emp_Id || '';
        const employeeName = currentUser.employee || '';

        // Show approver comments only for mhc1024 or employee name Pravallika.A
        return empId === 'mhc1024' || employeeName === 'Pravallika.A';
    };
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
                                    <h1 className="text-xl font-bold text-white">Transfer/Service</h1>
                                    <p className="text-blue-100 text-sm">Manage vehicle transfers and maintenance schedules</p>
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
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                        {/* Left Column - Service Image */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
                            <div className="w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                                <div className="text-center">
                                    <div
                                        className="text-8xl mb-4"
                                        style={{
                                            userSelect: 'none',
                                            WebkitUserSelect: 'none',
                                            MozUserSelect: 'none',
                                            msUserSelect: 'none',
                                            pointerEvents: 'none',
                                            WebkitUserDrag: 'none',
                                            KhtmlUserDrag: 'none',
                                            MozUserDrag: 'none',
                                            OUserDrag: 'none',
                                            userDrag: 'none',
                                            draggable: false
                                        }}
                                        draggable={false}
                                        onDragStart={(e) => e.preventDefault()}
                                    >
                                        🚛
                                    </div>
                                    <p className="text-lg font-semibold text-gray-700 mb-2">Transfer & Service</p>
                                    <p className="text-sm text-gray-500">Vehicle Management System</p>
                                </div>
                            </div>
                        </div>
                        {/* Right Column - Service Options */}
                        <div className="lg:col-span-3 flex">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1">
                                <div className="p-6 h-full flex items-center">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
                                        {/* Transfer Tile */}
                                        {(activeForm === null || activeForm === 'transfer') && (
                                            <div className={`bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg ${activeForm === 'transfer' ? 'md:col-span-2' : ''} transition-all duration-300`}>
                                                {activeForm === 'transfer' ? (
                                                    <div className="p-4">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h3 className="text-lg font-bold text-gray-900">Vehicle Transfer Request</h3>
                                                            <button
                                                                onClick={handleCloseForm}
                                                                className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg text-sm transition-colors duration-200"
                                                            >
                                                                <ArrowLeft className="w-3 h-3" />
                                                                <span>Back</span>
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                            {/* Transfer From Section */}
                                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                                {/* Section for specifying the origin plant and vehicle details */}
                                                                <h4 className="text-md font-semibold text-blue-800 mb-2">Transfer From</h4>
                                                                <div className="space-y-3">
                                                                    {/* Select the plant from which the vehicle is being transferred */}
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">From Plant</label>
                                                                        <select
                                                                            value={transferData.fromPlant}
                                                                            onChange={(e) => handleTransferChange('fromPlant', e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                                                                            disabled={isLoadingPlants}
                                                                        >
                                                                            <option value="">
                                                                                {isLoadingPlants ? "Loading plants..." : "Select Plant"}
                                                                            </option>
                                                                            {plantData.map((plant, index) => {
                                                                                const plantName = plant.plant || plant.PLANT || plant.name || plant.NAME || plant.plant_name || plant.PLANT_NAME || plant.description || plant.DESCRIPTION || `Plant ${index + 1}`;
                                                                                const plantDesc = plant.description || plant.DESCRIPTION || plant.desc || plant.DESC || 'No description';
                                                                                return (
                                                                                    <option key={`from-plant-${index}`} value={plantName}>
                                                                                        {plantName} - {plantDesc}
                                                                                    </option>
                                                                                );
                                                                            })}
                                                                        </select>
                                                                    </div>
                                                                    {/* Select the type of vehicle to be transferred */}
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type</label>
                                                                        <select
                                                                            value={transferData.vehicleType}
                                                                            onChange={(e) => handleTransferChange('vehicleType', e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                                                                            disabled={!transferData.fromPlant || isLoadingContract || vehicleTypes.length === 0}
                                                                        >
                                                                            <option value="">
                                                                                {!transferData.fromPlant
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
                                                                    </div>
                                                                    {/* Select the specific vehicle number for transfer */}
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Number</label>
                                                                        <select
                                                                            value={transferData.vehicleNumber}
                                                                            onChange={(e) => handleTransferChange('vehicleNumber', e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                                                                            disabled={!transferData.fromPlant || !transferData.vehicleType || isLoadingContract || vehicleNumbers.length === 0}
                                                                        >
                                                                            <option value="">
                                                                                {!transferData.fromPlant || !transferData.vehicleType
                                                                                    ? "Select Plant and Vehicle Type first"
                                                                                    : isLoadingContract
                                                                                        ? "Loading vehicle data..."
                                                                                        : vehicleNumbers.length === 0
                                                                                            ? "No vehicles available"
                                                                                            : "Select Vehicle Number"
                                                                                }
                                                                            </option>
                                                                            {vehicleNumbers.map((vehicle, index) => (
                                                                                <option key={`vehicle-number-${index}`} value={vehicle.vehicleNo}>
                                                                                    {vehicle.vehicleNo} - {vehicle.vehicleName}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    {/* Specify the date when the transfer request is made */}
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Requested Date</label>
                                                                        <input
                                                                            type="date"
                                                                            value={transferData.requestedDate}
                                                                            onChange={(e) => handleTransferChange('requestedDate', e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                    {/* Enter the quantity of items or vehicles to be transferred */}
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                                                                        <input
                                                                            type="number"
                                                                            value={transferData.quantity}
                                                                            onChange={(e) => handleTransferChange('quantity', e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                                                                            placeholder="Enter quantity"
                                                                            min="1"
                                                                        />
                                                                    </div>
                                                                    {/* Add comments or notes about the transfer from section */}
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Comments</label>
                                                                        <input
                                                                            type="text"
                                                                            value={transferData.Comments}
                                                                            onChange={(e) => handleTransferChange('Comments', e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                                                                            placeholder="Enter comments"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Transfer To Section */}
                                                            <div className="bg-green-50 p-3 rounded-lg">
                                                                {/* Section for specifying the destination plant and related details */}
                                                                <h4 className="text-md font-semibold text-green-800 mb-2">Transfer To</h4>
                                                                <div className="space-y-3">
                                                                    {/* Select the destination plant for the vehicle transfer */}
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">To Plant</label>
                                                                        <select
                                                                            value={transferData.toPlant}
                                                                            onChange={(e) => handleTransferChange('toPlant', e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                                                                            disabled={isLoadingPlants}
                                                                        >
                                                                            <option value="">
                                                                                {isLoadingPlants ? "Loading plants..." : "Select To Plant"}
                                                                            </option>
                                                                            {plantData.map((plant, index) => {
                                                                                const plantName = plant.plant || plant.PLANT || plant.name || plant.NAME || plant.plant_name || plant.PLANT_NAME || plant.description || plant.DESCRIPTION || `Plant ${index + 1}`;
                                                                                const plantDesc = plant.description || plant.DESCRIPTION || plant.desc || plant.DESC || 'No description';
                                                                                return (
                                                                                    <option key={`to-plant-${index}`} value={plantName}>
                                                                                        {plantName} - {plantDesc}
                                                                                    </option>
                                                                                );
                                                                            })}
                                                                        </select>
                                                                    </div>
                                                                    {/* Specify the date when the transfer is approved */}
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Approved Date</label>
                                                                        <input
                                                                            type="date"
                                                                            value={transferData.approvedDate}
                                                                            onChange={(e) => handleTransferChange('approvedDate', e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                    {/* Enter the employee ID responsible for receiving the transfer */}
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Employee ID</label>
                                                                        <input
                                                                            type="text"
                                                                            value={transferData.employeeId}
                                                                            onChange={(e) => handleTransferChange('employeeId', e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                                                                            placeholder="Enter Employee ID"
                                                                        />
                                                                    </div>
                                                                    {/* Enter the name of the employee responsible for receiving the transfer */}
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Employee Name</label>
                                                                        <input
                                                                            type="text"
                                                                            value={transferData.employeeName}
                                                                            onChange={(e) => handleTransferChange('employeeName', e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                                                                            placeholder="Enter Employee Name"
                                                                        />
                                                                    </div>
                                                                    {/* Add comments or notes about the transfer to section - conditional visibility */}
                                                                    {shouldShowApproverComments() && (
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Approver Comments</label>
                                                                            <input
                                                                                type="text"
                                                                                value={transferData.approverComments}
                                                                                onChange={(e) => handleTransferChange('approverComments', e.target.value)}
                                                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                                                                                placeholder="Enter comments"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Submit and Cancel buttons for the transfer form */}
                                                        <div className="flex gap-2 pt-4">
                                                            <button
                                                                type="button"
                                                                onClick={handleTransferSubmit}
                                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 text-sm rounded-lg transition-colors duration-200"
                                                            >
                                                                Submit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleCloseForm}
                                                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-1.5 text-sm rounded-lg transition-colors duration-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={handleTransferClick}
                                                        className="p-4 cursor-pointer hover:shadow-md hover:border-green-300 transition-all duration-200 group"
                                                    >
                                                        <div className="flex flex-col items-center text-center space-y-3">
                                                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors duration-200">
                                                                <Truck className="w-6 h-6 text-white" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-bold text-gray-900 mb-1">Transfer</h3>
                                                                <p className="text-xs text-gray-600">Relocate vehicles between locations</p>
                                                            </div>
                                                            <div className="w-full pt-1">
                                                                <div className="bg-green-500 text-white px-3 py-1.5 rounded text-xs font-medium group-hover:bg-green-600 transition-colors duration-200">
                                                                    Click Here
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {/* Service Tile */}
                                        {(activeForm === null || activeForm === 'service') && (
                                            <div className={`bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg ${activeForm === 'service' ? 'md:col-span-2' : ''} transition-all duration-300`}>
                                                {activeForm === 'service' ? (
                                                    <div className="p-3">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h3 className="text-lg font-bold text-gray-900">Service Form</h3>
                                                            <button
                                                                onClick={handleCloseForm}
                                                                className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-sm transition-colors duration-200"
                                                            >
                                                                <ArrowLeft className="w-3 h-3" />
                                                                <span>Back</span>
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                                {/* Select the plant where the service will be performed */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Plant</label>
                                                                    <select
                                                                        value={serviceData.plant}
                                                                        onChange={(e) => handleServiceChange('plant', e.target.value)}
                                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                                                                        disabled={isLoadingPlants}
                                                                    >
                                                                        <option value="">
                                                                            {isLoadingPlants ? "Loading plants..." : "Select Plant"}
                                                                        </option>
                                                                        {plantData.map((plant, index) => {
                                                                            const plantName = plant.plant || plant.PLANT || plant.name || plant.NAME || plant.plant_name || plant.PLANT_NAME || plant.description || plant.DESCRIPTION || `Plant ${index + 1}`;
                                                                            const plantDesc = plant.description || plant.DESCRIPTION || plant.desc || plant.DESC || 'No description';
                                                                            return (
                                                                                <option key={`service-plant-${index}`} value={plantName}>
                                                                                    {plantName} - {plantDesc}
                                                                                </option>
                                                                            );
                                                                        })}
                                                                    </select>
                                                                </div>
                                                                {/* Select the type of vehicle to be serviced */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type</label>
                                                                    <select
                                                                        value={serviceData.vehicleType}
                                                                        onChange={(e) => handleServiceChange('vehicleType', e.target.value)}
                                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                                                                        disabled={!serviceData.plant || isLoadingContract || serviceVehicleTypes.length === 0}
                                                                    >
                                                                        <option value="">
                                                                            {!serviceData.plant
                                                                                ? "Select Plant first"
                                                                                : isLoadingContract
                                                                                    ? "Loading contract data..."
                                                                                    : serviceVehicleTypes.length === 0
                                                                                        ? "No vehicle types available"
                                                                                        : "Select Vehicle Type"
                                                                            }
                                                                        </option>
                                                                        {serviceVehicleTypes.map((vehicleType, index) => (
                                                                            <option key={`service-vehicle-type-${index}`} value={vehicleType}>
                                                                                {vehicleType}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                {/* Select the specific vehicle number for service */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Number</label>
                                                                    <select
                                                                        value={serviceData.vehicleNumber}
                                                                        onChange={(e) => handleServiceChange('vehicleNumber', e.target.value)}
                                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                                                                        disabled={!serviceData.plant || !serviceData.vehicleType || isLoadingContract || serviceVehicleNumbers.length === 0}
                                                                    >
                                                                        <option value="">
                                                                            {!serviceData.plant || !serviceData.vehicleType
                                                                                ? "Select Plant and Vehicle Type first"
                                                                                : isLoadingContract
                                                                                    ? "Loading vehicle data..."
                                                                                    : serviceVehicleNumbers.length === 0
                                                                                        ? "No vehicles available"
                                                                                        : "Select Vehicle Number"
                                                                            }
                                                                        </option>
                                                                        {serviceVehicleNumbers.map((vehicle, index) => (
                                                                            <option key={`service-vehicle-number-${index}`} value={vehicle.vehicleNo}>
                                                                                {vehicle.vehicleNo} - {vehicle.vehicleName}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                                {/* Select the status of the vehicle (service or maintenance) */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                                                    <select
                                                                        value={serviceData.status}
                                                                        onChange={(e) => handleServiceChange('status', e.target.value)}
                                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                                                                    >
                                                                        <option value="">Select status</option>
                                                                        <option value="service">Service/Repair</option>
                                                                        <option value="maintenance">Maintenance</option>
                                                                    </select>
                                                                </div>
                                                                {/* Add comments or notes about the service */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Comments</label>
                                                                    <input
                                                                        type="text"
                                                                        value={serviceData.comments}
                                                                        onChange={(e) => handleServiceChange('comments', e.target.value)}
                                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                                                                        placeholder="Enter comments"
                                                                    />
                                                                </div>
                                                            </div>
                                                            {/* Conditional fields based on status */}
                                                            {(serviceData.status === 'service' || serviceData.status === 'maintenance') && (
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                                    {/* Specify the start date for the service */}
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                                                                        <input
                                                                            type="date"
                                                                            value={serviceData.fromTime}
                                                                            onChange={(e) => handleServiceChange('fromTime', e.target.value)}
                                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                    {/* Specify the planned completion date for the service */}
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Planned Date</label>
                                                                        <input
                                                                            type="date"
                                                                            value={serviceData.toTime}
                                                                            onChange={(e) => handleServiceChange('toTime', e.target.value)}
                                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                    {/* Specify the actual completion date for the service */}
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Actual Date</label>
                                                                        <input
                                                                            type="date"
                                                                            value={serviceData.actualDate}
                                                                            onChange={(e) => handleServiceChange('actualDate', e.target.value)}
                                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {/* Submit and Cancel buttons for the service form */}
                                                            <div className="flex gap-2 pt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={handleServiceSubmit}
                                                                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 text-sm rounded-lg transition-colors duration-200"
                                                                >
                                                                    Submit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleCloseForm}
                                                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-1.5 text-sm rounded-lg transition-colors duration-200"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={handleServiceClick}
                                                        className="p-4 cursor-pointer hover:shadow-md hover:border-orange-300 transition-all duration-200 group"
                                                    >
                                                        <div className="flex flex-col items-center text-center space-y-3">
                                                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center group-hover:bg-orange-600 transition-colors duration-200">
                                                                <Wrench className="w-6 h-6 text-white" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-bold text-gray-900 mb-1">Service/Maintenance</h3>
                                                                <p className="text-xs text-gray-600">Schedule maintenance and repairs</p>
                                                            </div>
                                                            <div className="w-full pt-1">
                                                                <div className="bg-orange-500 text-white px-3 py-1.5 rounded text-xs font-medium group-hover:bg-orange-600 transition-colors duration-200">
                                                                    Click Here
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Confirmation Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <Settings className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                                Confirm Submission
                            </h3>
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to submit this {activeForm} record?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAction}
                                    className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${activeForm === 'transfer'
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-orange-500 hover:bg-orange-600'
                                        }`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                                Success!
                            </h3>
                            <p className="text-gray-600 text-center mb-6">
                                {successMessage}
                            </p>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransferServicePage;