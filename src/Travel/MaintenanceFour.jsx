import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, Car } from "lucide-react";
import { API_BASE_URL } from '../Config';

const MaintenanceFour = () => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: '',
    company: '',
    vehicleModel: '',
    com_plant:'',
    insuranceCompany: '',
    purchaseYear: '',
    fuelType: '',
    user: '',
    driverName: '',
    serviceDate: '',
    status: '',
    cost: '',
    description: '',
    vendorName: '',
    file: null,
    claimDropdown: '',
    claimedAmount: '',
    claimedDate: ''
  });
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [isLoadingVehicleData, setIsLoadingVehicleData] = useState(false);
  const [vehicleDataError, setVehicleDataError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Define readonly fields (vehicle-related fields)
  const readonlyFields = ['vehicleNumber', 'com_plant','vehicleType', 'company', 'vehicleModel', 'insuranceCompany', 'purchaseYear', 'fuelType', 'user', 'driverName'];
  
  // Define editable fields (maintenance-specific fields)
  const editableFields = ['serviceDate', 'status', 'cost', 'description', 'vendorName', 'file', 'claimDropdown', 'claimedAmount', 'claimedDate'];

  // Get user token from localStorage
  const getUserToken = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      return userInfo.token || userInfo.access_token || userInfo.api_token;
    } catch (error) {
      console.error('Error parsing user info:', error);
      return null;
    }
  };

  // Fetch vehicle data from API
  const fetchVehicleData = async (vehicleNumber) => {
    if (!vehicleNumber || vehicleNumber.trim() === '') {
      return;
    }

    setIsLoadingVehicleData(true);
    setVehicleDataError('');

    try {
      const token = getUserToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      console.log('Fetching vehicle data for:', vehicleNumber);
      
      const response = await fetch(`${API_BASE_URL}vehicle-data?vhno=${encodeURIComponent(vehicleNumber)}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      console.log('Vehicle data response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error('Vehicle data API error details:', errorData);
            
            if (response.status === 401) {
              localStorage.removeItem('userInfo');
              errorMessage = 'Session expired. Please log in again.';
            } else if (response.status === 404) {
              errorMessage = 'Vehicle data not found for this vehicle number.';
            } else {
              errorMessage = errorData.message || errorData.error || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('Failed to parse vehicle data API error response:', parseError);
          if (response.status === 401) {
            localStorage.removeItem('userInfo');
            errorMessage = 'Session expired. Please log in again.';
          }
        }
        
        throw new Error(errorMessage);
      }
const handleSubmit = async () => {
  setAttempted(true);
  const isValid = validateForm();

  if (!isValid) {
    setShowValidationModal(true);
    return;
  }

  setShowConfirmModal(true); // This is your actual confirm modal
};
      const result = await response.json();
      console.log("=== RAW API RESPONSE ===");
      console.log("Full response:", result);
      
      let vehicleData = result.data || result;
      
      if (Array.isArray(vehicleData)) {
        vehicleData = vehicleData[0] || {};
      }

      console.log("=== VEHICLE DATA TO PROCESS ===");
      console.log("Vehicle data object:", vehicleData);
      
      const mappedData = {
        vehicleNumber: vehicleData.VH_NUMBER || vehicleNumber,
        vehicleType: vehicleData.VH_TYPE || '',
        company: vehicleData.VH_COMPANY || '',
        vehicleModel: vehicleData.VH_MODEL || '',
        insuranceCompany: vehicleData.INSURANCE_CMP || '',
        com_plant: vehicleData.COMP_PLANT || '',
        purchaseYear: vehicleData.PUR_YEAR || '',
        fuelType: vehicleData.FUEL || '',
        user: vehicleData.VH_USER || '',
        driverName: vehicleData.VH_DRIVER || ''
      };

      console.log("=== FINAL MAPPED DATA ===");
      console.log("Mapped vehicle data:", mappedData);

      setFormData(prevData => ({
        ...prevData,
        ...mappedData,
        serviceDate: prevData.serviceDate,
        status: prevData.status,
        cost: prevData.cost,
        description: prevData.description,
        vendorName: prevData.vendorName,
        file: prevData.file,
        claimDropdown: prevData.claimDropdown,
        claimedAmount: prevData.claimedAmount,
        claimedDate: prevData.claimedDate
      }));

      setErrors(prevErrors => {
        const updatedErrors = { ...prevErrors };
        readonlyFields.forEach(field => {
          if (mappedData[field] && mappedData[field].toString().trim() !== '') {
            delete updatedErrors[field];
          }
        });
        return updatedErrors;
      });

    } catch (error) {
      console.error("Error fetching vehicle data:", error);
      setVehicleDataError(error.message);
      
      // if (error.name === 'TypeError' && error.message.includes('fetch')) {
      //   setVehicleDataError('Cannot connect to server. Please ensure the API server is running on http://172.20.0.9/laravel/myhomedashboard');
      // }
    } finally {
      setIsLoadingVehicleData(false);
    }
  };

  // Effect to handle vehicle number from URL parameters and fetch data
  useEffect(() => {
    const vehicleFromParams = searchParams.get('vehicle');
    
    if (vehicleFromParams) {
      console.log('Vehicle number from URL params:', vehicleFromParams);
      
      setFormData(prevData => ({
        ...prevData,
        vehicleNumber: vehicleFromParams
      }));
      
      fetchVehicleData(vehicleFromParams);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (!editableFields.includes(name)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'vehicleNumber', 'vehicleType', 'company', 'vehicleModel','com_plant',
      'insuranceCompany', 'purchaseYear', 'fuelType', 'user', 'driverName', 
      'serviceDate', 'status', 'cost', 'description', 'vendorName', 'file'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    });

    if (formData.status === 'Accidental Repair' && formData.claimDropdown === 'Yes') {
      if (!formData.claimedAmount) {
        newErrors.claimedAmount = 'Claimed Amount is required when claim status is Yes';
      }
      if (!formData.claimedDate) {
        newErrors.claimedDate = 'Claimed Date is required when claim status is Yes';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Initial submit handler (shows confirmation modal)
  const handleSubmit = async () => {
    setAttempted(true);
    const isValid = validateForm();
    if (!isValid) {
  setShowValidationModal(true); // Show modal instead of alert
  return;
}

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  // Confirmed submit handler (actual API submission)
  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const token = getUserToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const submitData = new FormData();
      
      submitData.append('VH_NUMBER', formData.vehicleNumber);
      submitData.append('SERVICE_DATE', formData.serviceDate);
      submitData.append('STATUS_MAIN', formData.status);
      submitData.append('COST_MAIN', formData.cost);
      submitData.append('DESC_MAIN', formData.description);
      submitData.append('VENDOR_NAME', formData.vendorName);

      if (formData.file) {
        submitData.append('MAINT_FILE', formData.file);
      }

      if (formData.status === 'Accidental Repair') {
        submitData.append('CLAIM_STATUS', formData.claimDropdown || 'No');
        
        if (formData.claimDropdown === 'Yes') {
          if (formData.claimedAmount) {
            submitData.append('CLAIM_AMT', formData.claimedAmount);
          }
          if (formData.claimedDate) {
            submitData.append('CLAIM_DT', formData.claimedDate);
          }
        }
      }

      console.log('=== SUBMITTING DATA ===');
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // const headers = {
      //   'Accept': 'application/json',
      //   'Authorization': `Bearer ${token}`,
      // };

      const response = await fetch(`${API_BASE_URL}update-maintenance`, {
        method: 'POST',
        headers:{
          'Accept': 'application/json',
          'contentType':'application/json',
        'Authorization': `Bearer ${token}`, 
        },
        body: submitData,
        
      });

      console.log('Submit response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error('Submit API error details:', errorData);
            
            if (response.status === 401) {
              localStorage.removeItem('userInfo');
              errorMessage = 'Session expired. Please log in again.';
            } else if (response.status === 422) {
              if (errorData.errors) {
                const validationErrors = Object.values(errorData.errors).flat();
                errorMessage = validationErrors.join(', ');
              } else {
                errorMessage = errorData.message || 'Validation failed';
              }
            } else {
              errorMessage = errorData.message || errorData.error || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('Failed to parse submit API error response:', parseError);
          if (response.status === 401) {
            localStorage.removeItem('userInfo');
            errorMessage = 'Session expired. Please log in again.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Submit response:', result);

      // Show success modal instead of alert
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error submitting maintenance data:', error);
      
      let errorMessage = error.message;
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // errorMessage = 'Cannot connect to server. Please ensure the API server is running on http://172.20.0.12/laravel/myhomedashboard';
      }
      
      alert(`Failed to submit maintenance data: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel confirmation modal
  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
  };

  // Close success modal
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Optional: Reset form or navigate
    // handleReset();
    // navigate('/maintenance-list');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleReset = () => {
    setFormData(prevData => ({
      ...prevData,
      serviceDate: '',
      status: '',
      cost: '',
      description: '',
      vendorName: '',
      file: null,
      claimDropdown: '',
      claimedAmount: '',
      claimedDate: ''
    }));
    
    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };
      editableFields.forEach(field => {
        delete updatedErrors[field];
      });
      return updatedErrors;
    });
    
    setAttempted(false);
  };

  const handleRefreshVehicleData = () => {
    if (formData.vehicleNumber) {
      fetchVehicleData(formData.vehicleNumber);
    }
  };

  // Styling functions
  const inputStyle = "w-full border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";
  const highlightedInputStyle = "w-full border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";
  const errorInputStyle = "w-full border border-red-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-400 bg-red-50";
  const loadingInputStyle = "w-full border border-yellow-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-yellow-50";
  const readonlyInputStyle = "w-full border border-gray-400 rounded-full p-1.5 text-sm bg-gray-100 text-gray-700 cursor-not-allowed";

  const getInputStyle = (fieldName) => {
    if (readonlyFields.includes(fieldName)) {
      if (isLoadingVehicleData) {
        return loadingInputStyle;
      }
      return readonlyInputStyle;
    }
    
    if (errors[fieldName] && attempted) {
      return errorInputStyle;
    }
    
    if (['serviceDate'].includes(fieldName)) {
      return highlightedInputStyle;
    }
    
    return inputStyle;
  };

  return (
    <div className="py-3 px-3">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow border-2 border-blue-500 overflow-hidden">
          {/* Header Section */}
          <div className="p-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img src="./img.png" alt="Logo" className="mr-4 w-40 h-12 rounded-lg" />
              </div>
              <div className="flex-grow flex justify-center">
                <div className="bg-[#5ea8bb] px-5 py-1.5 rounded-lg inline-block -ml-20">
                  <h1 className="text-xl font-bold text-white">Maintenance Creation</h1>
                </div>
              </div>
              <div>
                <button
                  onClick={handleBack}
                  className="text-white bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed] hover:from-[#c71d6f] hover:to-[#d09693] rounded-full p-1"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="h-0.5 bg-blue-600 w-[95%] mx-auto"></div>

          <div className="p-1">
            <div>
              {/* Top Layout with Image and Key Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Image Section */}
                <div className="flex justify-center">
                  <img
                    src="car1.png"
                    alt="Vehicle maintenance illustration"
                    className="max-w-full max-h-48 mb-3 mt-4 rounded-lg"
                  />
                </div>

                {/* Right Side - Key Form Fields */}
                <div className="space-y-1">
                  {/* Vehicle Number */}
                   <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-sm">
                        Vehicle Number<span className="text-red-500 ml-1">*</span>
                      </label>
                     <input
                          type="text"
                          name="vehicleNumber"
                          value={formData.vehicleNumber}
                          onChange={handleInputChange}
                          className={getInputStyle('vehicleNumber')}
                          placeholder="Enter vehicle number"
                          readOnly={readonlyFields.includes('vehicleNumber')}
                          
                        />
                    </div>
                    {errors.vehicleNumber && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.vehicleNumber}</div>
                    )}
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-sm">
                        Vehicle Type<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        className={getInputStyle('vehicleType')}
                        readOnly={readonlyFields.includes('vehicleType')}
                      />
                    </div>
                    {errors.vehicleType && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.vehicleType}</div>
                    )}
                  </div>

                  {/* Vehicle Model */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-sm">
                        Vehicle Model<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleInputChange}
                        className={getInputStyle('vehicleModel')}
                        placeholder="Enter Vehicle Model"
                        readOnly={readonlyFields.includes('vehicleModel')}
                      />
                    </div>
                    {errors.vehicleModel && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.vehicleModel}</div>
                    )}
                  </div>

                  {/* Company */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-sm">
                        Company<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className={getInputStyle('company')}
                        placeholder="Enter company"
                        readOnly={readonlyFields.includes('company')}
                      />
                    </div>
                    {errors.company && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.company}</div>
                    )}
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-sm">
                        Fuel Type<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        name="fuelType"
                        value={formData.fuelType}
                        onChange={handleInputChange}
                        className={getInputStyle('fuelType')}
                        disabled={readonlyFields.includes('fuelType')}
                      />
                       
                    </div>
                    {errors.fuelType && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.fuelType}</div>
                    )}
                  </div>

                   <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-sm">
                        Company & Plant<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        name="com_plant"
                        value={formData.com_plant}
                        onChange={handleInputChange}
                        className={getInputStyle('com_plant')}
                        disabled={readonlyFields.includes('com_plant')}
                      />
                       
                    </div>
                    {errors.com_plant && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.com_plant}</div>
                    )}
                  </div>

                  {/* Purchase Year */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-sm">
                        Purchase Year<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="date"
                        name="purchaseYear"
                        value={formData.purchaseYear}
                        onChange={handleInputChange}
                        className={getInputStyle('purchaseYear')}
                        placeholder="Enter year"
                        readOnly={readonlyFields.includes('purchaseYear')}
                      />
                    </div>
                    {errors.purchaseYear && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.purchaseYear}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* All Form Fields Section - Properly Aligned */}
              <div className="mt-1 mx-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {/* Insurance Company */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-sm mb-1">
                      Insurance Company<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="insuranceCompany"
                      value={formData.insuranceCompany}
                      onChange={handleInputChange}
                      className={getInputStyle('insuranceCompany')}
                      placeholder="Enter insurance Company"
                      readOnly={readonlyFields.includes('insuranceCompany')}
                    />
                    {errors.insuranceCompany && attempted && (
                      <div className="text-red-500 text-xs mt-0.5">{errors.insuranceCompany}</div>
                    )}
                  </div>
                  
                  {/* User */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-sm mb-1">
                      User<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="user"
                      value={formData.user}
                      onChange={handleInputChange}
                      className={getInputStyle('user')}
                      placeholder="Enter user name"
                      readOnly={readonlyFields.includes('user')}
                    />
                    {errors.user && attempted && (
                      <div className="text-red-500 text-xs mt-0.5">{errors.user}</div>
                    )}
                  </div>

                  {/* Driver Name */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-sm mb-1">
                      Driver Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="driverName"
                      value={formData.driverName}
                      onChange={handleInputChange}
                      className={getInputStyle('driverName')}
                      placeholder="Enter driver name"
                      readOnly={readonlyFields.includes('driverName')}
                    />
                    {errors.driverName && attempted && (
                      <div className="text-red-500 text-xs mt-0.5">{errors.driverName}</div>
                    )}
                  </div>

                  {/* Service Date */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-sm mb-1">
                      Service Date<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="serviceDate"
                      value={formData.serviceDate}
                      onChange={handleInputChange}
                      className={getInputStyle('serviceDate')}
                    />
                    {errors.serviceDate && attempted && (
                      <div className="text-red-500 text-xs mt-0.5">{errors.serviceDate}</div>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-sm mb-1">
                      Status<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={getInputStyle('status')}
                    >
                      <option value="">Select Status</option>
                      <option value="Repair">Repair</option>
                      <option value="Service">Service</option>
                      <option value="Accidental Repair">Accidental Repair</option>
                    </select>
                    {errors.status && attempted && (
                      <div className="text-red-500 text-xs mt-0.5">{errors.status}</div>
                    )}
                  </div>

                  {/* Cost */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-sm mb-1">
                      Cost<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      className={getInputStyle('cost')}
                      placeholder="Enter cost"
                    />
                   {errors.cost && attempted && (
                      <div className="text-red-500 text-xs mt-0.5">{errors.cost}</div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-sm mb-1">
                      Description<span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={getInputStyle('description')}
                      placeholder="Enter description"
                      rows="1"
                    />
                    {errors.description && attempted && (
                      <div className="text-red-500 text-xs mt-0.5">{errors.description}</div>
                    )}
                  </div>

                  {/* Vendor Name */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-sm mb-1">
                      Vendor Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="vendorName"
                      value={formData.vendorName}
                      onChange={handleInputChange}
                      className={getInputStyle('vendorName')}
                      placeholder="Enter vendor name"
                    />
                    {errors.vendorName && attempted && (
                      <div className="text-red-500 text-xs mt-0.5">{errors.vendorName}</div>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-sm mb-1">
                      Upload File<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="file"
                      name="file"
                      onChange={handleInputChange}
                      className={getInputStyle('file')}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    {errors.file && attempted && (
                      <div className="text-red-500 text-xs mt-0.5">{errors.file}</div>
                    )}
                  </div>

                  {/* Conditional Fields for Accidental Repair */}
                  {formData.status === 'Accidental Repair' && (
                    <>
                      {/* Claim Dropdown */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-sm mb-1">
                          Claim Status
                        </label>
                        <select
                          name="claimDropdown"
                          value={formData.claimDropdown}
                          onChange={handleInputChange}
                          className={getInputStyle('claimDropdown')}
                        >
                          <option value="">Select Claim Status</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      {/* Conditional Fields when Claim is Yes */}
                      {formData.claimDropdown === 'Yes' && (
                        <>
                          {/* Claimed Amount */}
                          <div>
                            <label className="block text-indigo-800 font-bold text-sm mb-1">
                              Claimed Amount<span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              name="claimedAmount"
                              value={formData.claimedAmount}
                              onChange={handleInputChange}
                              className={getInputStyle('claimedAmount')}
                              placeholder="Enter claimed amount"
                            />
                            {errors.claimedAmount && attempted && (
                              <div className="text-red-500 text-xs mt-0.5">{errors.claimedAmount}</div>
                            )}
                          </div>

                          {/* Claimed Date */}
                          <div>
                            <label className="block text-indigo-800 font-bold text-sm mb-1">
                              Claimed Date<span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                              type="date"
                              name="claimedDate"
                              value={formData.claimedDate}
                              onChange={handleInputChange}
                              className={getInputStyle('claimedDate')}
                            />
                            {errors.claimedDate && attempted && (
                              <div className="text-red-500 text-xs mt-0.5">{errors.claimedDate}</div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Error Messages */}
              {vehicleDataError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Error:</span>
                  </div>
                  <p className="mt-1">{vehicleDataError}</p>
                  {formData.vehicleNumber && (
                    <button
                      onClick={handleRefreshVehicleData}
                      className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isLoadingVehicleData}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>

               
              </div>
            </div>
          </div>
        </div>
      </div>
{showValidationModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-300">
    <div className="bg-white p-6 rounded-xl shadow-2xl w-[90%] max-w-md transform scale-100 transition-transform duration-300">
      
      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-4">
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
        <h2 className="text-xl font-semibold text-red-600">
          Validation Error
        </h2>
      </div>

      {/* Body Text */}
      <p className="text-gray-700 mb-6">
        Some required fields are missing. Please review the form and try again.
      </p>

      {/* Buttons */}
      <div className="flex justify-end">
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-sm transition-all duration-150"
          onClick={() => setShowValidationModal(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Submission</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit this maintenance data? Please review all information before confirming.
              </p>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleConfirmedSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
                </button>
                
                <button
                  onClick={handleConfirmCancel}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Four Wheeler Animation */}
              <div className="mb-2 flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce">
                    <Car className="w-10 h-10 text-white animate-pulse" />
                  </div>
                  {/* Exhaust smoke animation */}
                  <div className="absolute -right-8 top-2 flex space-x-1">
                   
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Success!</h3>
              
              {/* Animated success indicators */}
              <div className="flex justify-center space-x-2 mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
              </div>
              
              <p className="text-gray-600 mb-4">
                Your maintenance data has been submitted successfully for vehicle {formData.vehicleNumber}.
              </p>
              
              <button
                onClick={handleSuccessModalClose}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceFour;