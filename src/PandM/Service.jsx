// import React, { useState, useEffect } from 'react';
// import { ArrowLeft, Settings, Wrench } from 'lucide-react';

// const Service = () => {
//     const [showConfirmModal, setShowConfirmModal] = useState(false);
//     const [showSuccessModal, setShowSuccessModal] = useState(false);
//     const [confirmAction, setConfirmAction] = useState(null);
//     const [successMessage, setSuccessMessage] = useState('');

//     const [serviceData, setServiceData] = useState({
//         plant: '',
//         vehicleType: '',
//         vehicleNumber: '',
//         status: '',
//         fromTime: '',
//         toTime: '',
//         cost: '',
//         file: null,
//         date: ''
//     });

//     // State for plant data from API
//     const [plantData, setPlantData] = useState([]);
//     const [isLoadingPlants, setIsLoadingPlants] = useState(true);

//     // Contract data and vehicle types state
//     const [contractData, setContractData] = useState([]);
//     const [serviceVehicleTypes, setServiceVehicleTypes] = useState([]);
//     const [serviceVehicleNumbers, setServiceVehicleNumbers] = useState([]);
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

//             const response = await fetch('http://127.0.0.1:8000/api/getContractData', {
//                 method: 'GET',
//                 headers: {
//                     'Accept': 'application/json',
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (!response.ok) {
//                 const errorData = await response.text();
//                 throw new Error(`Failed to fetch contract data: ${response.status} - ${errorData}`);
//             }

//             const result = await response.json();

//             if (result.status && result.data) {
//                 setContractData(result.data);
//             } else if (Array.isArray(result)) {
//                 setContractData(result);
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
//             const token = userInfo.token || userInfo.access_token || userInfo.api_token;

//             if (!token) {
//                 addDebugLog('ERROR: No authentication token found');
//                 setIsLoadingPlants(false);
//                 return;
//             }

//             const response = await fetch('http://127.0.0.1:8000/api/plant-data', {
//                 method: 'GET',
//                 headers: {
//                     'Accept': 'application/json',
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (!response.ok) {
//                 const errorData = await response.text();
//                 throw new Error(`Failed to fetch plant data: ${response.status} - ${errorData}`);
//             }

//             const result = await response.json();

//             if (result.status && result.data) {
//                 setPlantData(result.data);
//             } else if (Array.isArray(result)) {
//                 setPlantData(result);
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

//     // Effect to update service vehicle types when plant changes
//     useEffect(() => {
//         if (serviceData.plant && contractData.length > 0 && plantData.length > 0) {
//             const selectedPlant = plantData.find(plant => {
//                 const plantName = plant.plant || plant.PLANT ||
//                     plant.name || plant.NAME ||
//                     plant.plant_name || plant.PLANT_NAME ||
//                     plant.description || plant.DESCRIPTION;
//                 return plantName && plantName.toString() === serviceData.plant.toString();
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

//                 setServiceVehicleTypes(filteredVehicleTypes);
//             } else {
//                 setServiceVehicleTypes([]);
//             }
//         } else {
//             setServiceVehicleTypes([]);
//         }

//         // Reset vehicle type when plant changes
//         if (serviceData.vehicleType) {
//             setServiceData(prev => ({
//                 ...prev,
//                 vehicleType: '',
//                 vehicleNumber: ''
//             }));
//         }

//         // Reset vehicle numbers when plant changes
//         setServiceVehicleNumbers([]);
//     }, [serviceData.plant, contractData, plantData]);

//     // Effect to update service vehicle numbers when both plant and vehicle type are selected
//     useEffect(() => {
//         if (serviceData.plant && serviceData.vehicleType && contractData.length > 0 && plantData.length > 0) {
//             const selectedPlant = plantData.find(plant => {
//                 const plantName = plant.plant || plant.PLANT ||
//                     plant.name || plant.NAME ||
//                     plant.plant_name || plant.PLANT_NAME ||
//                     plant.description || plant.DESCRIPTION;
//                 return plantName && plantName.toString() === serviceData.plant.toString();
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

//                         return plantMatches && contractVehicleType === serviceData.vehicleType;
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

//                 setServiceVehicleNumbers(filteredVehicleNumbers);
//             } else {
//                 setServiceVehicleNumbers([]);
//             }
//         } else {
//             setServiceVehicleNumbers([]);
//         }

//         // Reset vehicle number when plant or vehicle type changes
//         if (serviceData.vehicleNumber) {
//             setServiceData(prev => ({
//                 ...prev,
//                 vehicleNumber: ''
//             }));
//         }
//     }, [serviceData.plant, serviceData.vehicleType, contractData, plantData]);

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

//     const handleServiceSubmit = async () => {
//         try {
//             addDebugLog('Starting service submission...', serviceData);

//             // Validation
//             if (!serviceData.plant || !serviceData.vehicleType || !serviceData.vehicleNumber || !serviceData.status) {
//                 alert('Please fill in all required fields');
//                 return;
//             }

//             // Additional validation for service status
//             if (serviceData.status === 'service') {
//                 if (!serviceData.fromTime || !serviceData.toTime || !serviceData.cost) {
//                     alert('Please fill in From Date, To Date, and Cost for service records');
//                     return;
//                 }
//             } else if (serviceData.status === 'idle') {
//                 if (!serviceData.date) {
//                     alert('Please fill in the Date for idle records');
//                     return;
//                 }
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

//                     // Prepare FormData for file upload
//                     const formData = new FormData();
//                     formData.append('PLANT', extractPlantCode(serviceData.plant));
//                     formData.append('VEHICLE_TYPE', serviceData.vehicleType);
//                     formData.append('VEHICLE_NUMBER', serviceData.vehicleNumber);
//                     formData.append('STATUS', serviceData.status);

//                     if (serviceData.status === 'service') {
//                         formData.append('FROM_DATE', serviceData.fromTime);
//                         formData.append('TO_DATE', serviceData.toTime);
//                         formData.append('COST', serviceData.cost);
//                         if (serviceData.file) {
//                             formData.append('FILE', serviceData.file);
//                         }
//                     } else if (serviceData.status === 'idle') {
//                         formData.append('FROM_DATE', serviceData.date);
//                         formData.append('TO_DATE', serviceData.date);
//                         formData.append('COST', '0');
//                     }

//                     const response = await fetch('http://127.0.0.1:8000/api/store-service', {
//                         method: 'POST',
//                         headers: {
//                             'Accept': 'application/json',
//                             'Authorization': `Bearer ${token}`
//                         },
//                         body: formData
//                     });

//                     const result = await response.json();

//                     setShowConfirmModal(false);

//                     if (response.ok && result.success) {
//                         setSuccessMessage('Service record created successfully!');
//                         setShowSuccessModal(true);
//                         // Reset form data
//                         setServiceData({
//                             plant: '',
//                             vehicleType: '',
//                             vehicleNumber: '',
//                             status: '',
//                             fromTime: '',
//                             toTime: '',
//                             cost: '',
//                             file: null,
//                             date: ''
//                         });
//                         setServiceVehicleTypes([]);
//                         setServiceVehicleNumbers([]);
//                     } else {
//                         const errorMessage = result.message || 'Failed to create service record';
//                         const errors = result.errors ? Object.values(result.errors).flat().join(', ') : '';
//                         alert(`Error: ${errorMessage}${errors ? ` - ${errors}` : ''}`);
//                     }
//                 } catch (error) {
//                     setShowConfirmModal(false);
//                     console.error('Error submitting service:', error);
//                     alert('An error occurred while submitting the service record. Please try again.');
//                 }
//             });
//             setShowConfirmModal(true);
//         } catch (error) {
//             console.error('Error submitting service:', error);
//             alert('An error occurred while submitting the service record. Please try again.');
//         }
//     };

//     const handleServiceChange = (field, value) => {
//         setServiceData(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     const handleFileChange = (e) => {
//         setServiceData(prev => ({
//             ...prev,
//             file: e.target.files[0]
//         }));
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 py-4 px-4">
//             <div className="max-w-4xl mx-auto">
//                 {/* Header Card */}
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//                     <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-t-lg px-6 py-4">
//                         <div className="flex justify-between items-center">
//                             <div className="flex items-center space-x-3">
//                                 <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
//                                     <Wrench className="text-white w-5 h-5" />
//                                 </div>
//                                 <div>
//                                     <h1 className="text-xl font-bold text-white">Vehicle Service</h1>
//                                     <p className="text-orange-100 text-sm">Schedule maintenance and repairs</p>
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

//                 {/* Service Form */}
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                     <h3 className="text-lg font-bold text-gray-900 mb-6">Service Form</h3>
                    
//                     <div className="space-y-4">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Plant</label>
//                                 <select
//                                     value={serviceData.plant}
//                                     onChange={(e) => handleServiceChange('plant', e.target.value)}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                                     disabled={isLoadingPlants}
//                                 >
//                                     <option value="">
//                                         {isLoadingPlants ? "Loading plants..." : "Select Plant"}
//                                     </option>
//                                     {plantData.map((plant, index) => {
//                                         const plantName = plant.plant || plant.PLANT || plant.name || plant.NAME || plant.plant_name || plant.PLANT_NAME || plant.description || plant.DESCRIPTION || `Plant ${index + 1}`;
//                                         const plantDesc = plant.description || plant.DESCRIPTION || plant.desc || plant.DESC || 'No description';

//                                         return (
//                                             <option key={`service-plant-${index}`} value={plantName}>
//                                                 {plantName} - {plantDesc}
//                                             </option>
//                                         );
//                                     })}
//                                 </select>
//                             </div>
                            
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
//                                 <select
//                                     value={serviceData.vehicleType}
//                                     onChange={(e) => handleServiceChange('vehicleType', e.target.value)}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                                     disabled={!serviceData.plant || isLoadingContract || serviceVehicleTypes.length === 0}
//                                 >
//                                     <option value="">
//                                         {!serviceData.plant
//                                             ? "Select Plant first"
//                                             : isLoadingContract
//                                                 ? "Loading contract data..."
//                                                 : serviceVehicleTypes.length === 0
//                                                     ? "No vehicle types available"
//                                                     : "Select Vehicle Type"
//                                         }
//                                     </option>
//                                     {serviceVehicleTypes.map((vehicleType, index) => (
//                                         <option key={`service-vehicle-type-${index}`} value={vehicleType}>
//                                             {vehicleType}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
                            
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
//                                 <select
//                                     value={serviceData.vehicleNumber}
//                                     onChange={(e) => handleServiceChange('vehicleNumber', e.target.value)}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                                     disabled={!serviceData.plant || !serviceData.vehicleType || isLoadingContract || serviceVehicleNumbers.length === 0}
//                                 >
//                                     <option value="">
//                                         {!serviceData.plant || !serviceData.vehicleType
//                                             ? "Select Plant and Vehicle Type first"
//                                             : isLoadingContract
//                                                 ? "Loading vehicle data..."
//                                                 : serviceVehicleNumbers.length === 0
//                                                     ? "No vehicles available"
//                                                     : "Select Vehicle Number"
//                                         }
//                                     </option>
//                                     {serviceVehicleNumbers.map((vehicle, index) => (
//                                         <option key={`service-vehicle-number-${index}`} value={vehicle.vehicleNo}>
//                                             {vehicle.vehicleNo} - {vehicle.vehicleName}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//                             <select
//                                 value={serviceData.status}
//                                 onChange={(e) => handleServiceChange('status', e.target.value)}
//                                 className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                             >
//                                 <option value="">Select status</option>
//                                 <option value="service">Service</option>
//                                 <option value="idle">Idle</option>
//                             </select>
//                         </div>

//                         {/* Conditional fields based on status */}
//                         {serviceData.status === 'service' && (
//                             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
//                                     <input
//                                         type="date"
//                                         value={serviceData.fromTime}
//                                         onChange={(e) => handleServiceChange('fromTime', e.target.value)}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
//                                     <input
//                                         type="date"
//                                         value={serviceData.toTime}
//                                         onChange={(e) => handleServiceChange('toTime', e.target.value)}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
//                                     <input
//                                         type="number"
//                                         value={serviceData.cost}
//                                         onChange={(e) => handleServiceChange('cost', e.target.value)}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                                         placeholder="Enter cost"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
//                                     <input
//                                         type="file"
//                                         onChange={handleFileChange}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                                     />
//                                 </div>
//                             </div>
//                         )}

//                         {serviceData.status === 'idle' && (
//                             <div>
//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
//                                         <input
//                                             type="date"
//                                             value={serviceData.date}
//                                             onChange={(e) => handleServiceChange('date', e.target.value)}
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         <div className="flex gap-4 pt-4">
//                             <button
//                                 type="button"
//                                 onClick={handleServiceSubmit}
//                                 className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
//                             >
//                                 Submit Service
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={handleBackClick}
//                                 className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200"
//                             >
//                                 Cancel
//                             </button>
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
//                                 Confirm Service Submission
//                             </h3>
//                             <p className="text-gray-600 text-center mb-6">
//                                 Are you sure you want to submit this service record?
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
//                                     className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
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

// export default Service;