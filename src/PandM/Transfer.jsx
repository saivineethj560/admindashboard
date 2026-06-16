import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Truck } from 'lucide-react';

// const Transfer = () => {
//     const [showConfirmModal, setShowConfirmModal] = useState(false);
//     const [showSuccessModal, setShowSuccessModal] = useState(false);
//     const [confirmAction, setConfirmAction] = useState(null);
//     const [successMessage, setSuccessMessage] = useState('');

//     const [transferData, setTransferData] = useState({
//         fromPlant: '',
//         vehicleType: '',
//         vehicleNumber: '',
//         toPlant: ''
//     });

//     // State for plant data from API
//     const [plantData, setPlantData] = useState([]);
//     const [isLoadingPlants, setIsLoadingPlants] = useState(true);

//     // Add contract data and vehicle types state
//     const [contractData, setContractData] = useState([]);
//     const [vehicleTypes, setVehicleTypes] = useState([]);
//     const [vehicleNumbers, setVehicleNumbers] = useState([]);
//     const [isLoadingContract, setIsLoadingContract] = useState(true);

//     // Debugging state
//     const [debugInfo, setDebugInfo] = useState([]);

//     // Add debug log function
//     const addDebugLog = (message, data = null) => {
//         const timestamp = new Date().toLocaleTimeString();
//         const logEntry = { timestamp, message, data };
//         console.log(`[${timestamp}] ${message}`, data);
//         setDebugInfo(prev => [...prev.slice(-4), logEntry]); // Keep only last 5 logs
//     };

//     // Function to fetch contract data
//     const fetchContractData = async () => {
//         try {
//             addDebugLog('Starting to fetch contract data...');
//             const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
//             addDebugLog('Retrieved userInfo from localStorage', userInfo);

//             const token = userInfo.token || userInfo.access_token || userInfo.api_token;

//             if (!token) {
//                 addDebugLog('ERROR: No authentication token found');
//                 setIsLoadingContract(false);
//                 return;
//             }

//             addDebugLog('Making contract API request with token', { tokenExists: !!token });

//             const response = await fetch('http://127.0.0.1:8000/api/getContractData', {
//                 method: 'GET',
//                 headers: {
//                     'Accept': 'application/json',
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             addDebugLog('Contract API Response received', {
//                 status: response.status,
//                 statusText: response.statusText,
//                 ok: response.ok
//             });

//             if (!response.ok) {
//                 const errorData = await response.text();
//                 addDebugLog('Contract API Error Response', errorData);
//                 throw new Error(`Failed to fetch contract data: ${response.status} - ${errorData}`);
//             }

//             const result = await response.json();
//             addDebugLog('Contract API Response parsed', result);

//             if (result.status && result.data) {
//                 setContractData(result.data);
//                 addDebugLog('Contract data received successfully', result.data);
//             } else if (Array.isArray(result)) {
//                 setContractData(result);
//                 addDebugLog('Contract data set from array result', result);
//             } else {
//                 addDebugLog('ERROR: No valid contract data found in response');
//             }
//         } catch (error) {
//             addDebugLog('ERROR: Failed to fetch contract data', error.message);
//             console.error('Error fetching contract data:', error);
//         } finally {
//             setIsLoadingContract(false);
//         }
//     };

//     // Function to fetch plant data from API
//     const fetchPlantData = async () => {
//         try {
//             addDebugLog('Starting to fetch plant data...');

//             const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
//             addDebugLog('Retrieved userInfo from localStorage', userInfo);

//             const token = userInfo.token || userInfo.access_token || userInfo.api_token;

//             if (!token) {
//                 addDebugLog('ERROR: No authentication token found');
//                 setIsLoadingPlants(false);
//                 return;
//             }

//             addDebugLog('Making API request with token', { tokenExists: !!token });

//             const response = await fetch('http://127.0.0.1:8000/api/plant-data', {
//                 method: 'GET',
//                 headers: {
//                     'Accept': 'application/json',
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             addDebugLog('API Response received', {
//                 status: response.status,
//                 statusText: response.statusText,
//                 ok: response.ok
//             });

//             if (!response.ok) {
//                 const errorData = await response.text();
//                 addDebugLog('API Error Response', errorData);
//                 throw new Error(`Failed to fetch plant data: ${response.status} - ${errorData}`);
//             }

//             const result = await response.json();
//             addDebugLog('Plant API Response parsed', result);

//             if (result.status && result.data) {
//                 addDebugLog('Plant data received successfully', result.data);
//                 setPlantData(result.data);
//             } else if (Array.isArray(result)) {
//                 addDebugLog('Using direct array result', result);
//                 setPlantData(result);
//             } else {
//                 addDebugLog('ERROR: No valid data found in response', result);
//             }
//         } catch (error) {
//             addDebugLog('ERROR: Failed to fetch plant data', error.message);
//             console.error('Failed to load plant data:', error.message);
//         } finally {
//             setIsLoadingPlants(false);
//         }
//     };

//     // Effect to fetch data on component mount
//     useEffect(() => {
//         fetchPlantData();
//         fetchContractData();
//     }, []);

//     // Effect to update vehicle types when fromPlant changes
//     useEffect(() => {
//         console.log('Vehicle types effect triggered for transfer');
//         console.log('Transfer From Plant:', transferData.fromPlant);
//         console.log('Contract Data Length:', contractData.length);
//         console.log('Plant Data Length:', plantData.length);

//         if (transferData.fromPlant && contractData.length > 0 && plantData.length > 0) {
//             const selectedPlant = plantData.find(plant => {
//                 const plantName = plant.plant || plant.PLANT ||
//                     plant.name || plant.NAME ||
//                     plant.plant_name || plant.PLANT_NAME ||
//                     plant.description || plant.DESCRIPTION;
//                 return plantName && plantName.toString() === transferData.fromPlant.toString();
//             });

//             if (selectedPlant) {
//                 const plantName = selectedPlant.plant || selectedPlant.PLANT || selectedPlant.name || selectedPlant.NAME || 'Unknown Plant';

//                 const filteredVehicleTypes = contractData
//                     .filter(contract => {
//                         const contractPlant = contract.PLANT || contract.plant ||
//                             contract.PLANT_NAME || contract.plant_name;

//                         if (!contractPlant || !plantName) return false;

//                         if (contractPlant.toString().toLowerCase().trim() === plantName.toString().toLowerCase().trim()) {
//                             return true;
//                         }

//                         return contractPlant.toString().toLowerCase().includes(plantName.toString().toLowerCase()) ||
//                             plantName.toString().toLowerCase().includes(contractPlant.toString().toLowerCase());
//                     })
//                     .map(contract => contract.VEHICLE_TYPE || contract.vehicle_type)
//                     .filter(type => type)
//                     .filter((type, index, self) => self.indexOf(type) === index);

//                 setVehicleTypes(filteredVehicleTypes);
//             } else {
//                 setVehicleTypes([]);
//             }
//         } else {
//             setVehicleTypes([]);
//         }

//         // Reset vehicle type when from plant changes
//         if (transferData.vehicleType) {
//             setTransferData(prev => ({
//                 ...prev,
//                 vehicleType: '',
//                 vehicleNumber: ''
//             }));
//         }

//         // Reset vehicle numbers when plant changes
//         setVehicleNumbers([]);
//     }, [transferData.fromPlant, contractData, plantData]);

//     // Effect to update vehicle numbers when both plant and vehicle type are selected
//     useEffect(() => {
//         if (transferData.fromPlant && transferData.vehicleType && contractData.length > 0 && plantData.length > 0) {
//             const selectedPlant = plantData.find(plant => {
//                 const plantName = plant.plant || plant.PLANT ||
//                     plant.name || plant.NAME ||
//                     plant.plant_name || plant.PLANT_NAME ||
//                     plant.description || plant.DESCRIPTION;
//                 return plantName && plantName.toString() === transferData.fromPlant.toString();
//             });

//             if (selectedPlant) {
//                 const plantName = selectedPlant.plant || selectedPlant.PLANT || selectedPlant.name || selectedPlant.NAME || 'Unknown Plant';

//                 const filteredVehicleNumbers = contractData
//                     .filter(contract => {
//                         const contractPlant = contract.PLANT || contract.plant ||
//                             contract.PLANT_NAME || contract.plant_name;
//                         const contractVehicleType = contract.VEHICLE_TYPE || contract.vehicle_type;

//                         const plantMatches = contractPlant && plantName &&
//                             (contractPlant.toString().toLowerCase().trim() === plantName.toString().toLowerCase().trim() ||
//                                 contractPlant.toString().toLowerCase().includes(plantName.toString().toLowerCase()) ||
//                                 plantName.toString().toLowerCase().includes(contractPlant.toString().toLowerCase()));

//                         return plantMatches && contractVehicleType === transferData.vehicleType;
//                     })
//                     .map(contract => ({
//                         vehicleNo: contract.VEHICLE_NO || contract.vehicle_no || 'N/A',
//                         vehicleName: contract.VEHICLE_NAME || contract.vehicle_name || 'Unknown Vehicle',
//                         driverCode: contract.DRIVER || contract.driver || 'N/A',
//                         driverName: contract.DRIVER_NAME || contract.driver_name || 'No Driver'
//                     }))
//                     .filter(vehicle => vehicle.vehicleNo !== 'N/A')
//                     .filter((vehicle, index, self) =>
//                         self.findIndex(v => v.vehicleNo === vehicle.vehicleNo) === index
//                     );

//                 setVehicleNumbers(filteredVehicleNumbers);
//             } else {
//                 setVehicleNumbers([]);
//             }
//         } else {
//             setVehicleNumbers([]);
//         }

//         // Reset vehicle number when plant or vehicle type changes
//         if (transferData.vehicleNumber) {
//             setTransferData(prev => ({
//                 ...prev,
//                 vehicleNumber: ''
//             }));
//         }
//     }, [transferData.fromPlant, transferData.vehicleType, contractData, plantData]);

//     const handleBackClick = () => {
//         console.log('Navigate back clicked');
//         window.history.back();
//     };

//     const extractPlantCode = (plantName) => {
//         if (!plantName) return '';

//         const selectedPlant = plantData.find(plant => {
//             const name = plant.plant || plant.PLANT || plant.name || plant.NAME ||
//                 plant.plant_name || plant.PLANT_NAME ||
//                 plant.description || plant.DESCRIPTION;
//             return name && name.toString() === plantName.toString();
//         });

//         if (selectedPlant) {
//             const name = selectedPlant.plant || selectedPlant.PLANT || selectedPlant.name ||
//                 selectedPlant.NAME || selectedPlant.plant_name || selectedPlant.PLANT_NAME ||
//                 `Plant ${plantData.indexOf(selectedPlant) + 1}`;
//             const description = selectedPlant.description || selectedPlant.DESCRIPTION ||
//                 selectedPlant.desc || selectedPlant.DESC || 'No description';
//             return `${name} - ${description}`;
//         }

//         return plantName;
//     };

//     const handleTransferSubmit = async () => {
//         try {
//             addDebugLog('Starting transfer submission...', transferData);

//             // Validation
//             if (!transferData.fromPlant || !transferData.vehicleType || !transferData.vehicleNumber || !transferData.toPlant) {
//                 alert('Please fill in all required fields');
//                 return;
//             }

//             // Show confirmation modal
//             setConfirmAction(() => async () => {
//                 try {
//                     const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
//                     const token = userInfo.token || userInfo.access_token || userInfo.api_token;

//                     if (!token) {
//                         alert('Authentication token not found. Please login again.');
//                         return;
//                     }

//                     const submitData = {
//                         FROM_PLANT: extractPlantCode(transferData.fromPlant),
//                         VEHICLE_TYPE: transferData.vehicleType,
//                         VEHICLE_NUMBER: transferData.vehicleNumber,
//                         TO_PLANT: extractPlantCode(transferData.toPlant)
//                     };

//                     addDebugLog('Submitting transfer data to API:', submitData);

//                     const response = await fetch('http://127.0.0.1:8000/api/store-transfer', {
//                         method: 'POST',
//                         headers: {
//                             'Accept': 'application/json',
//                             'Authorization': `Bearer ${token}`,
//                             'Content-Type': 'application/json'
//                         },
//                         body: JSON.stringify(submitData)
//                     });

//                     const result = await response.json();

//                     setShowConfirmModal(false);

//                     if (response.ok && result.success) {
//                         setSuccessMessage('Transfer record created successfully!');
//                         setShowSuccessModal(true);
//                         // Reset form data
//                         setTransferData({
//                             fromPlant: '',
//                             vehicleType: '',
//                             vehicleNumber: '',
//                             toPlant: ''
//                         });
//                         setVehicleTypes([]);
//                         setVehicleNumbers([]);
//                     } else {
//                         const errorMessage = result.message || 'Failed to create transfer record';
//                         const errors = result.errors ? Object.values(result.errors).flat().join(', ') : '';
//                         alert(`Error: ${errorMessage}${errors ? ` - ${errors}` : ''}`);
//                     }
//                 } catch (error) {
//                     setShowConfirmModal(false);
//                     console.error('Error submitting transfer:', error);
//                     alert('An error occurred while submitting the transfer. Please try again.');
//                 }
//             });
//             setShowConfirmModal(true);
//         } catch (error) {
//             console.error('Error submitting transfer:', error);
//             alert('An error occurred while submitting the transfer. Please try again.');
//         }
//     };

//     const handleTransferChange = (field, value) => {
//         setTransferData(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 py-4 px-4">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header Card */}
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//                     <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg px-6 py-4">
//                         <div className="flex justify-between items-center">
//                             <div className="flex items-center space-x-3">
//                                 <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
//                                     <Settings className="text-white w-5 h-5" />
//                                 </div>
//                                 <div>
//                                     <h1 className="text-xl font-bold text-white">Transfer/Service</h1>
//                                     <p className="text-blue-100 text-sm">Manage vehicle transfers and maintenance schedules</p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={handleBackClick}
//                                 className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors duration-200"
//                             >
//                                 <ArrowLeft className="w-5 h-5" />
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Main Content */}
//                 <div className="space-y-6">
//                     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
//                         {/* Left Column - Transfer Image */}
//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
//                             <div className="w-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
//                                 <div className="text-center">
//                                     <div className="text-8xl mb-4">🚛</div>
//                                     <p className="text-lg font-semibold text-gray-700 mb-2">Transfer & Service</p>
//                                     <p className="text-sm text-gray-500">Vehicle Management System</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Right Column - Transfer Form */}
//                         <div className="lg:col-span-3 flex">
//                             <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1">
//                                 <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 h-full">
//                                     <div className="flex items-center justify-between mb-6">
//                                         <h3 className="text-lg font-bold text-gray-900">Transfer Form</h3>
//                                         <button
//                                             onClick={handleBackClick}
//                                             className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 flex items-center"
//                                         >
//                                             <ArrowLeft className="w-4 h-4 mr-1" />
//                                             Back
//                                         </button>
//                                     </div>
                                    
//                                     <div className="space-y-4">
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                             <div>
//                                                 <label className="block text-sm font-medium text-gray-700 mb-2">From Plant</label>
//                                                 <select
//                                                     value={transferData.fromPlant}
//                                                     onChange={(e) => handleTransferChange('fromPlant', e.target.value)}
//                                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
//                                                     disabled={isLoadingPlants}
//                                                 >
//                                                     <option value="">
//                                                         {isLoadingPlants ? "Loading plants..." : "Enter from plant"}
//                                                     </option>
//                                                     {plantData.map((plant, index) => {
//                                                         const plantName = plant.plant || plant.PLANT || plant.name || plant.NAME || plant.plant_name || plant.PLANT_NAME || plant.description || plant.DESCRIPTION || `Plant ${index + 1}`;
//                                                         const plantDesc = plant.description || plant.DESCRIPTION || plant.desc || plant.DESC || 'No description';

//                                                         return (
//                                                             <option key={`from-plant-${index}`} value={plantName}>
//                                                                 {plantName} - {plantDesc}
//                                                             </option>
//                                                         );
//                                                     })}
//                                                 </select>
//                                             </div>
                                            
//                                             <div>
//                                                 <label className="block text-sm font-medium text-gray-700 mb-2">To Plant</label>
//                                                 <select
//                                                     value={transferData.toPlant}
//                                                     onChange={(e) => handleTransferChange('toPlant', e.target.value)}
//                                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
//                                                     disabled={isLoadingPlants}
//                                                 >
//                                                     <option value="">
//                                                         {isLoadingPlants ? "Loading plants..." : "Enter to plant"}
//                                                     </option>
//                                                     {plantData.map((plant, index) => {
//                                                         const plantName = plant.plant || plant.PLANT || plant.name || plant.NAME || plant.plant_name || plant.PLANT_NAME || plant.description || plant.DESCRIPTION || `Plant ${index + 1}`;
//                                                         const plantDesc = plant.description || plant.DESCRIPTION || plant.desc || plant.DESC || 'No description';

//                                                         return (
//                                                             <option key={`to-plant-${index}`} value={plantName}>
//                                                                 {plantName} - {plantDesc}
//                                                             </option>
//                                                         );
//                                                     })}
//                                                 </select>
//                                             </div>
//                                         </div>

//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                             <div>
//                                                 <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
//                                                 <select
//                                                     value={transferData.vehicleType}
//                                                     onChange={(e) => handleTransferChange('vehicleType', e.target.value)}
//                                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
//                                                     disabled={!transferData.fromPlant || isLoadingContract || vehicleTypes.length === 0}
//                                                 >
//                                                     <option value="">
//                                                         {!transferData.fromPlant
//                                                             ? "Select Plant first"
//                                                             : isLoadingContract
//                                                                 ? "Loading contract data..."
//                                                                 : vehicleTypes.length === 0
//                                                                     ? "No vehicle types available"
//                                                                     : "Enter vehicle type"
//                                                         }
//                                                     </option>
//                                                     {vehicleTypes.map((vehicleType, index) => (
//                                                         <option key={`vehicle-type-${index}`} value={vehicleType}>
//                                                             {vehicleType}
//                                                         </option>
//                                                     ))}
//                                                 </select>
//                                             </div>
                                            
//                                             <div>
//                                                 <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
//                                                 <select
//                                                     value={transferData.vehicleNumber}
//                                                     onChange={(e) => handleTransferChange('vehicleNumber', e.target.value)}
//                                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
//                                                     disabled={!transferData.fromPlant || !transferData.vehicleType || isLoadingContract || vehicleNumbers.length === 0}
//                                                 >
//                                                     <option value="">
//                                                         {!transferData.fromPlant || !transferData.vehicleType
//                                                             ? "Select Plant and Vehicle Type first"
//                                                             : isLoadingContract
//                                                                 ? "Loading vehicle data..."
//                                                                 : vehicleNumbers.length === 0
//                                                                     ? "No vehicles available"
//                                                                     : "Enter vehicle number"
//                                                         }
//                                                     </option>
//                                                     {vehicleNumbers.map((vehicle, index) => (
//                                                         <option key={`vehicle-number-${index}`} value={vehicle.vehicleNo}>
//                                                             {vehicle.vehicleNo} - {vehicle.vehicleName}
//                                                         </option>
//                                                     ))}
//                                                 </select>
//                                             </div>
//                                         </div>

//                                         <div className="flex gap-4 pt-4">
//                                             <button
//                                                 type="button"
//                                                 onClick={handleTransferSubmit}
//                                                 className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
//                                             >
//                                                 Submit
//                                             </button>
//                                             <button
//                                                 type="button"
//                                                 onClick={handleBackClick}
//                                                 className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200"
//                                             >
//                                                 Cancel
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Confirmation Modal */}
//                 {showConfirmModal && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                         <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//                             <div className="flex items-center justify-center mb-4">
//                                 <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
//                                     <Settings className="w-6 h-6 text-yellow-600" />
//                                 </div>
//                             </div>
//                             <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
//                                 Confirm Transfer Submission
//                             </h3>
//                             <p className="text-gray-600 text-center mb-6">
//                                 Are you sure you want to submit this transfer record?
//                             </p>
//                             <div className="flex gap-3 justify-end">
//                                 <button
//                                     onClick={() => setShowConfirmModal(false)}
//                                     className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors duration-200"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={confirmAction}
//                                     className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
//                                 >
//                                     Confirm
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Success Modal */}
//                 {showSuccessModal && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                         <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//                             <div className="flex items-center justify-center mb-4">
//                                 <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
//                                     <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//                                     </svg>
//                                 </div>
//                             </div>
//                             <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
//                                 Success!
//                             </h3>
//                             <p className="text-gray-600 text-center mb-6">
//                                 {successMessage}
//                             </p>
//                             <div className="flex justify-center">
//                                 <button
//                                     onClick={() => setShowSuccessModal(false)}
//                                     className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
//                                 >
//                                     OK
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Transfer;

// import React from 'react';
// import { ArrowLeft, Settings, Truck, Wrench } from 'lucide-react';

// const TransferServiceMainPage = () => {
//     const handleBackClick = () => {
//         console.log('Navigate back clicked');
//         window.history.back();
//     };

//     const handleTransferClick = () => {
//         console.log('Transfer service clicked - navigate to transfer page');
//         // Navigate to transfer page
//         window.location.href = '/Transfer';
//     };

//     const handleServiceClick = () => {
//         console.log('Service clicked - navigate to service page');
//         // Navigate to service page
//         window.location.href = '/Service';
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 py-4 px-4">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header Card */}
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//                     <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg px-6 py-4">
//                         <div className="flex justify-between items-center">
//                             <div className="flex items-center space-x-3">
//                                 <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
//                                     <Settings className="text-white w-5 h-5" />
//                                 </div>
//                                 <div>
//                                     <h1 className="text-xl font-bold text-white">Transfer/Service</h1>
//                                     <p className="text-blue-100 text-sm">Manage vehicle transfers and maintenance schedules</p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={handleBackClick}
//                                 className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors duration-200"
//                             >
//                                 <ArrowLeft className="w-5 h-5" />
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Main Content */}
//                 <div className="space-y-6">
//                     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
//                         {/* Left Column - Service Image */}
//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
//                             <div className="w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//                                 <div className="text-center">
//                                     <div className="text-8xl mb-4">🚛</div>
//                                     <p className="text-lg font-semibold text-gray-700 mb-2">Transfer & Service</p>
//                                     <p className="text-sm text-gray-500">Vehicle Management System</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Right Column - Service Options */}
//                         <div className="lg:col-span-3 flex">
//                             <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1">
//                                 <div className="p-6 h-full flex items-center">
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">

//                                         {/* Transfer Tile */}
//                                         <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg transition-all duration-300">
//                                             <div
//                                                 onClick={handleTransferClick}
//                                                 className="p-4 cursor-pointer hover:shadow-md hover:border-green-300 transition-all duration-200 group"
//                                             >
//                                                 <div className="flex flex-col items-center text-center space-y-3">
//                                                     <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors duration-200">
//                                                         <Truck className="w-6 h-6 text-white" />
//                                                     </div>
//                                                     <div>
//                                                         <h3 className="text-lg font-bold text-gray-900 mb-1">Transfer</h3>
//                                                         <p className="text-xs text-gray-600">Relocate vehicles between locations</p>
//                                                     </div>
//                                                     <div className="w-full pt-1">
//                                                         <div className="bg-green-500 text-white px-3 py-1.5 rounded text-xs font-medium group-hover:bg-green-600 transition-colors duration-200">
//                                                             Click Here
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         {/* Service Tile */}
//                                         <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg transition-all duration-300">
//                                             <div
//                                                 onClick={handleServiceClick}
//                                                 className="p-4 cursor-pointer hover:shadow-md hover:border-orange-300 transition-all duration-200 group"
//                                             >
//                                                 <div className="flex flex-col items-center text-center space-y-3">
//                                                     <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center group-hover:bg-orange-600 transition-colors duration-200">
//                                                         <Wrench className="w-6 h-6 text-white" />
//                                                     </div>
//                                                     <div>
//                                                         <h3 className="text-lg font-bold text-gray-900 mb-1">Service</h3>
//                                                         <p className="text-xs text-gray-600">Schedule maintenance and repairs</p>
//                                                     </div>
//                                                     <div className="w-full pt-1">
//                                                         <div className="bg-orange-500 text-white px-3 py-1.5 rounded text-xs font-medium group-hover:bg-orange-600 transition-colors duration-200">
//                                                             Click Here
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TransferServiceMainPage;