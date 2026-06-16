import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Car, Shield, ShieldCheck, FileText, Calendar, DollarSign, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import { API_BASE_URL } from '../Config';

const ModifyInsurancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: '',
    company: '',
    vehicleModel: '',
    com_plant: '',
    datereg: '',
    purchaseYear: '',
    fuelType: '',
    datevalid: '',
    user: '',
    drivername: '',
    mobileno: '',
   
    insStartDate: '',
    insEndDate: '',
    insAmount: '',
    inscomp: '',
    insInvoice: null,
    // New fields for previous amounts (display only)
   
    prevInsAmount: ''
  });
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Insurance section toggle state
  const [showInsuranceSection, setShowInsuranceSection] = useState(false);

  // Handle navigation back
  const handleBack = () => {
    navigate(-1);
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate(-1);
  };

  // Handle confirmation modal close
  const handleConfirmModalClose = () => {
    setShowConfirmModal(false);
  };
//--------------------------------------------------------------------20-12-2025-----------------------------------
  // Additional fixes for the fetchVehicleData function
const fetchVehicleData = async (vehicleNumber) => {
  if (!vehicleNumber) return;
  
  setLoading(true);
  setError(null);
  
  try {
    console.log('Fetching vehicle data for:', vehicleNumber);
    
    const response = await fetch(`${API_BASE_URL}getInsuChangeData`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${userToken.token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.status && result.data && Array.isArray(result.data)) {
      const vehicleData = result.data.find(item => 
        item.VH_NUMBER === vehicleNumber || 
        item.VH_NUMBER?.toLowerCase() === vehicleNumber?.toLowerCase()
      );
      
      if (vehicleData) {
        console.log('Found vehicle data:', vehicleData);
        
        // ✅ ADD THIS HELPER FUNCTION
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          
          try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            return `${year}-${month}-${day}`;
          } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return '';
          }
        };
        
        // ✅ UPDATE setFormData to use formatDateForInput
        setFormData({
          vehicleNumber: vehicleData.VH_NUMBER || '',
          vehicleType: vehicleData.VH_TYPE || '',
          company: vehicleData.VH_COMPANY || '',
          vehicleModel: vehicleData.VH_MODEL || '',
          com_plant: vehicleData.COMP_PLANT || '',
          datereg: formatDateForInput(vehicleData.REG_DT),           // ✅ CHANGED
          purchaseYear: formatDateForInput(vehicleData.PUR_YEAR),    // ✅ CHANGED
          fuelType: vehicleData.FUEL || '',
          datevalid: formatDateForInput(vehicleData.REG_VALID),      // ✅ CHANGED
          user: vehicleData.VH_USER || '',
          drivername: vehicleData.VH_DRIVER || '',
          mobileno: vehicleData.MOBILE || '',
          insStartDate: formatDateForInput(vehicleData.INSURANCE_START_DATE), // ✅ CHANGED
          insEndDate: formatDateForInput(vehicleData.INSURANCE_END_DATE),     // ✅ CHANGED
          insAmount: vehicleData.AMT || '',
          inscomp: vehicleData.INSURANCE_CMP || '',
          insInvoice: null,
          prevInsAmount: vehicleData.AMT || ''
        });
        
        console.log('Formatted dates:', {
          purchaseYear: formatDateForInput(vehicleData.PUR_YEAR),
          datereg: formatDateForInput(vehicleData.REG_DT),
          datevalid: formatDateForInput(vehicleData.REG_VALID),
          insStartDate: formatDateForInput(vehicleData.INSURANCE_START_DATE),
          insEndDate: formatDateForInput(vehicleData.INSURANCE_END_DATE)
        });
        
        if (vehicleData.INSURANCE_START_DATE || vehicleData.INSURANCE_END_DATE || vehicleData.INSURANCE_CMP) {
          setShowInsuranceSection(true);
        }
        
        setError(null);
      } else {
        console.error('Vehicle not found:', vehicleNumber);
        setError(`Vehicle with number "${vehicleNumber}" not found in the database.`);
      }
    } else {
      console.error('Invalid response structure:', result);
      setError('Invalid data format received from server');
    }
  } catch (err) {
    console.error('Error fetching vehicle data:', err);
    setError(`Error fetching vehicle data: ${err.message}`);
  } finally {
    setLoading(false);
  }
};
//--------------------------------------------------------------------20-12-2025-----------------------------------

  // Modified handleSubmit to show confirmation modal first
  const handleSubmit = async () => {
    setShowConfirmModal(true);
  };

  // Enhanced handleConfirmedSubmit function with better debugging and validation
  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Enhanced validation before sending
      if (!formData.vehicleNumber || formData.vehicleNumber.trim() === '') {
        throw new Error('Vehicle Number is required');
      }

      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Use 'vhNumber' to match backend validation exactly
      formDataToSend.append('vhNumber', formData.vehicleNumber.trim());
      
      // Enhanced field mapping with better null/undefined handling
      // Note: Excluded prevAmount and prevInsAmount as they are display-only
      const fieldMapping = {
        'vehicleType': 'vehicleType',
        'company': 'company', 
        'vehicleModel': 'vehicleModel',
        'com_plant': 'com_plant',
        'datereg': 'datereg',
        'purchaseYear': 'purchaseYear', 
        'fuelType': 'fuelType',
        'datevalid': 'datevalid',
        'user': 'user',
        'drivername': 'drivername',
        'mobileno': 'mobileno', 
        
        'insStartDate': 'insStartDate',
        'insEndDate': 'insEndDate', 
        'insAmount': 'insAmount',
        'inscomp': 'inscomp'
        // prevAmount and prevInsAmount are intentionally excluded - display only
      };
      
      // Add fields with enhanced validation and formatting
      Object.entries(fieldMapping).forEach(([frontendKey, backendKey]) => {
        const value = formData[frontendKey];
        
        // Skip null, undefined, or empty string values
        if (value !== null && value !== undefined && value !== '') {
          // Special handling for numeric fields
          if (['insAmount'].includes(backendKey)) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue > 0) {
              formDataToSend.append(backendKey, numValue.toString());
            }
          }
          // Special handling for date fields - ensure proper format
          else if (['datereg', 'datevalid',  'insStartDate', 'insEndDate', 'purchaseYear'].includes(backendKey)) {
            const dateValue = value.toString().trim();
            if (dateValue && dateValue !== '') {
              formDataToSend.append(backendKey, dateValue);
            }
          }
          // Handle string fields
          else {
            const stringValue = value.toString().trim();
            if (stringValue !== '') {
              formDataToSend.append(backendKey, stringValue);
            }
          }
        }
      });
      
      // Enhanced file handling with validation
      if (formData.file && formData.file instanceof File) {
        // Validate file size (5MB = 5 * 1024 * 1024 bytes)
        if (formData.file.size > 5 * 1024 * 1024) {
          throw new Error('RC file size must be less than 5MB');
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(formData.file.type)) {
          throw new Error('RC file must be JPEG, PNG, or PDF format');
        }
        
        formDataToSend.append('rcFile', formData.file);
        console.log('RC File added:', formData.file.name, formData.file.size, formData.file.type);
      }
      
      if (formData.insInvoice && formData.insInvoice instanceof File) {
        // Validate file size
        if (formData.insInvoice.size > 5 * 1024 * 1024) {
          throw new Error('Insurance file size must be less than 5MB');
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(formData.insInvoice.type)) {
          throw new Error('Insurance file must be JPEG, PNG, or PDF format');
        }
        
        formDataToSend.append('insFile', formData.insInvoice);
        console.log('Insurance File added:', formData.insInvoice.name, formData.insInvoice.size, formData.insInvoice.type);
      }
      
      // Enhanced debugging - log exactly what we're sending
      console.log('=== FORM DATA BEING SENT ===');
      console.log('Vehicle Number:', formData.vehicleNumber);
      console.log('User Token:', userToken.token ? 'Present' : 'Missing');
      
      // Log all FormData entries
      const formDataEntries = [];
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          formDataEntries.push(`${key}: [FILE] ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          formDataEntries.push(`${key}: ${value}`);
        }
      }
      console.log('FormData entries:', formDataEntries);
      
      // Enhanced API call with better error handling
      console.log('Making API call to ModifyInsuranceData...');
      const response = await fetch(`${API_BASE_URL}ModifyInsuranceData`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken.token}`,
          'Accept': 'application/json',
          // IMPORTANT: Don't set Content-Type header for FormData
          // The browser will set it automatically with the boundary
        },
        body: formDataToSend
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Enhanced error response handling
      if (!response.ok) {
        let errorText = `HTTP ${response.status}: ${response.statusText}`;
        let errorDetails = '';
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error('Error response JSON:', errorData);
            
            if (errorData.message) {
              errorText = errorData.message;
            }
            
            // Handle Laravel validation errors
            if (errorData.errors) {
              const validationErrors = Object.values(errorData.errors).flat();
              errorDetails = validationErrors.join(', ');
              errorText = `Validation Error: ${errorDetails}`;
            }
            
            if (errorData.error) {
              errorText = errorData.error;
            }
          } else {
            // Try to get text response for non-JSON errors
            const errorText_raw = await response.text();
            console.error('Error response text:', errorText_raw);
            errorDetails = errorText_raw.substring(0, 200) + '...'; // Limit length
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorDetails = 'Unable to parse error response';
        }
        
        throw new Error(`${errorText}${errorDetails ? ` - ${errorDetails}` : ''}`);
      }
      
      // Parse successful response
      const result = await response.json();
      console.log('Success response:', result);
      
      // Handle success - Laravel returns different success formats
     if (result.message && !result.error) {
  setSuccessMessage(result.message || 'Insurance data updated successfully!');
  setShowConfirmModal(false);
  setShowSuccessModal(true);
} else if (result.error) {
  setShowConfirmModal(false);
  throw new Error(result.error);
} else {
  setShowConfirmModal(false);
  throw new Error('Unexpected response format');
}

      
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      setShowConfirmModal(false);
      
      // Enhanced error message for user
      let userFriendlyMessage = error.message;
      
      if (error.message.includes('HTTP 500')) {
        userFriendlyMessage = 'Server error occurred. Please check the console for details and contact support.';
      } else if (error.message.includes('HTTP 422')) {
        userFriendlyMessage = 'Validation error: ' + error.message;
      } else if (error.message.includes('HTTP 401')) {
        userFriendlyMessage = 'Authentication error. Please login again.';
      } else if (error.message.includes('HTTP 404')) {
        userFriendlyMessage = 'Vehicle not found. Please check the vehicle number.';
      }
      
      setError(`Error updating data: ${userFriendlyMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effect to load data when component mounts
 // Effect to load data when component mounts
useEffect(() => {
  console.log('=== MODIFY INSURANCE PAGE - USE EFFECT TRIGGERED ===');
  console.log('Full location object:', location);
  console.log('Location state:', location.state);
  
  if (location.state) {
    // ✅ Get BOTH editMode AND modifyMode
    const { vehicleNumber, vehicleData, editMode, modifyMode } = location.state;
    
    console.log('Parsed navigation state:', { 
      vehicleNumber, 
      vehicleData, 
      editMode,
      modifyMode,
      hasVehicleNumber: !!vehicleNumber,
      hasVehicleData: !!vehicleData
    });
    
    // ✅ Check for EITHER editMode OR modifyMode
    if ((editMode || modifyMode) && vehicleNumber) {
      console.log('✅ MODE DETECTED - Calling fetchVehicleData');
      console.log('Mode:', editMode ? 'EDIT' : 'MODIFY');
      console.log('Vehicle Number for fetch:', vehicleNumber);
      fetchVehicleData(vehicleNumber);
    } 
    //---------------------------------------------20-12-2025-----------------------------------------------------
    // If vehicleData is passed directly-------------------20-12-2025
   else if (vehicleData) {
  console.log('Setting form data from passed vehicleData object');
  
  // ✅ ADD THIS HELPER FUNCTION
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      // Handle DD-MM-YYYY format from table display
      if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
      }
      // Handle ISO date format
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '';
    }
  };
  
  // ✅ UPDATE setFormData to use formatDateForInput
  setFormData(prev => ({
    ...prev,
    vehicleNumber: vehicleData.vehicleNo || '',
    vehicleType: vehicleData.vehicleType || '',
    company: vehicleData.vehicleCompany || '',
    vehicleModel: vehicleData.vehicleModel || '',
    com_plant: vehicleData.companyPlant || '',
    datereg: formatDateForInput(vehicleData.dateOfRegistration),      // ✅ CHANGED
    purchaseYear: formatDateForInput(vehicleData.purchaseYear),       // ✅ CHANGED
    fuelType: vehicleData.fuelType || '',
    datevalid: formatDateForInput(vehicleData.validOfRegistration),   // ✅ CHANGED
    user: vehicleData.userOrDept || '',
    drivername: vehicleData.driverName || '',
    mobileno: vehicleData.driverMobile || '',
    insStartDate: formatDateForInput(vehicleData.insuranceStartDate), // ✅ CHANGED
    insEndDate: formatDateForInput(vehicleData.insuranceEndDate),     // ✅ CHANGED
    insAmount: vehicleData.insuranceAmount || '',
    inscomp: vehicleData.insuranceCompany || '',
    prevInsAmount: vehicleData.insuranceAmount || ''
  }));
  
  if (vehicleData.insuranceStartDate || vehicleData.insuranceEndDate || vehicleData.insuranceCompany) {
    setShowInsuranceSection(true);
  }
}
//------------------------------------------------------------------------------------------------------------------
    else {
      console.log('❌ No valid conditions met for data fetching');
      console.log('- editMode:', editMode);
      console.log('- modifyMode:', modifyMode);
      console.log('- vehicleNumber:', vehicleNumber);
      console.log('- hasVehicleData:', !!vehicleData);
    }
  } else {
    console.log('❌ No location.state found');
  }
}, [location.state]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const toggleInsuranceSection = () => {
    setShowInsuranceSection(!showInsuranceSection);
  };

  // Compressed styling
  const inputStyle = "w-full border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";
  const highlightedInputStyle = "w-full border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";
  const readOnlyInputStyle = "w-full border border-blue-500 rounded-full px-2 py-1 text-sm bg-gray-200 cursor-not-allowed";

  return (
    <div className="py-2 px-3">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow border-2 border-blue-500 overflow-hidden">
          {/* Header Section */}
          <div className="p-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img src="./img.png" alt="Logo" className="mr-4 w-32 h-8 rounded-lg" />
              </div>
              <div className="flex-grow flex justify-center">
                <div className="bg-[#5ea8bb] px-4 py-1 rounded-lg inline-block -ml-20">
                  <h1 className="text-lg font-bold text-white">
                    {formData.vehicleNumber ? `Modify Insurance - ${formData.vehicleNumber}` : 'Insurance Change Tab'}
                  </h1>
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

          {error && (
            <div className="p-4 mx-4 mt-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p>{error}</p>
            </div>
          )}

          <div className="p-2">
            <div>
              {/* Top Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                {/* Image Section */}
                <div className="flex justify-center">
                  <img
                    src="car3.png"
                    alt="Vehicle maintenance illustration"
                    className="max-w-full max-h-48 mb-3 mt-4 rounded-lg"
                  />
                </div>

                {/* Right Side - Key Form Fields */}
                <div className="space-y-1">
                  {/* Vehicle Number */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Vehicle Number<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                      placeholder="Enter vehicle number"
                      readOnly={!!location.state?.editMode}
                    />
                  </div>

                  {/* Vehicle Type */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Vehicle Type<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                      readOnly
                    />
                  </div>

                  {/* Vehicle Model */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Vehicle Model<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                      placeholder="Enter Vehicle Model"
                      readOnly
                    />
                  </div>

                  {/* Company */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Company<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                      placeholder="Enter company"
                      readOnly
                    />
                  </div>

                  {/* Fuel Type */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Fuel Type<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                      readOnly
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Company & Plant<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      name="com_plant"
                      value={formData.com_plant}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                      readOnly
                    />
                  </div>

                  {/* Pu.hase Year */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Purchase Year<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="purchaseYear"
                      value={formData.purchaseYear}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                      placeholder="Enter year"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* All Form Fields Section */}
              <div className="mx-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {/* Date Of Reg */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Date Of Reg<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="datereg"
                      value={formData.datereg}
                      onChange={handleInputChange}
                      className={inputStyle}
                    />
                  </div>
                  
                  {/* Valid Of Reg */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Valid Of Reg<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="datevalid"
                      value={formData.datevalid}
                      onChange={handleInputChange}
                      className={inputStyle}
                    />
                  </div>

                  {/* User */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      User / Dept<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="user"
                      value={formData.user}
                      onChange={handleInputChange}
                      className={inputStyle}
                      placeholder="Enter name / dept"
                    />
                  </div>

                  {/* Driver Name */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Driver Name:<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="drivername"
                      value={formData.drivername}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Driver Mobile NO<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="mobileno"
                      value={formData.mobileno}
                      onChange={handleInputChange}
                      className={inputStyle}
                    />
                  </div>

                 

                  
                </div>

                {/* Insurance Toggle Button */}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={toggleInsuranceSection}
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Insurance Details</span>
                    {showInsuranceSection ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Insurance Details Section - Collapsible */}
                {showInsuranceSection && (
                  <div className="mt-4 border-2 border-blue-500 rounded-lg p-3 shadow-sm bg-blue-50 transform transition-all duration-300 ease-in-out">
                    {/* Insurance Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Insurance Start Date */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Insurance Start Date <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="date"
                          name="insStartDate"
                          value={formData.insStartDate || ""}
                          onChange={handleInputChange}
                          className={inputStyle}
                        />
                      </div>

                      {/* Insurance End Date */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Insurance End Date <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="date"
                          name="insEndDate"
                          value={formData.insEndDate || ""}
                          onChange={handleInputChange}
                          className={inputStyle}
                        />
                      </div>

                      {/* Previous Insurance Amount - Display Only */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          <DollarSign className="w-3 h-3 inline mr-1" />
                          Previous Insurance Amount
                        </label>
                        <input
                          type="number"
                          value={formData.prevInsAmount || ""}
                          className={readOnlyInputStyle}
                          placeholder="Previous insurance amount"
                          readOnly
                        />
                      </div>

                      {/* Insurance Amount */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          <DollarSign className="w-3 h-3 inline mr-1" />
                          Insurance premium Amount <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="number"
                          name="insAmount"
                          onChange={handleInputChange}
                          className={highlightedInputStyle}
                          placeholder="Enter new insurance amount"
                        />
                      </div>

                      {/* Insurance Company */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          <FileText className="w-3 h-3 inline mr-1" />
                          Insurance Company<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="inscomp"
                          value={formData.inscomp || ""}
                          onChange={handleInputChange}
                          className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                          readOnly
                        />
                      </div>

                      {/* Invoice Upload */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          <FileText className="w-3 h-3 inline mr-1" />
                          Invoice Upload <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="file"
                          name="insInvoice"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleInputChange}
                          className="block w-full text-xs text-gray-700 border border-blue-500 rounded-full cursor-pointer file:mr-2 file:py-0.5 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {formData.insInvoice && (
                          <p className="text-green-600 text-xs mt-0.5">
                            Selected: {formData.insInvoice.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-800 via-green-500 to-green-600 text-white px-8 py-2 rounded-full hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Update Insurance
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              <p className="text-gray-600 mb-2">
                Are you sure you want to update this insurance data?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Vehicle: <span className="font-medium">{formData.vehicleNumber}</span>
              </p>

              <div className="flex justify-center gap-4">
                {/* No, Cancel */}
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition-all duration-200"
                >
                  No, Cancel
                </button>

                {/* Yes, Submit */}
                <button
                  onClick={handleConfirmedSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Yes, Submit</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              {/* Enhanced Success Animation */}
              <div className="mb-3 flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                    <ShieldCheck className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-ping opacity-25"></div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Insurance Updated Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Vehicle {formData.vehicleNumber} insurance details have been updated.
              </p>
              
              <button
                onClick={handleSuccessModalClose}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModifyInsurancePage;