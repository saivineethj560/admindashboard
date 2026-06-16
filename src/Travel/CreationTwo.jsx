import React, { useState, useEffect } from "react";
import { Check, Loader2, AlertCircle, Bike, Bug, X } from "lucide-react";
import { API_BASE_URL } from '../Config';

const TwoWheelerChange = () => {
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateVehicleData, setDuplicateVehicleData] = useState(null);

  const [formData, setFormData] = useState({
    vhno: "",
    company: "",
    regdt: "",
    regvd: "",
    fuel: "",
    location: "",
    empid: "",
    user: "",
    mobile: "",
    file: null,
    year: ""
  });

  // Get user token from localStorage
  const [userToken, setToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo') || '{}');
  });

  // Helper function to get authentication headers
  const getAuthHeaders = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token || userInfo.access_token || userInfo.api_token;
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    return {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest',
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Special handling for vehicle number - only allow alphanumeric characters (no spaces or special chars)
    if (name === 'vhno') {
      newValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    } else {
      // Other fields that should be uppercase
      const upperCaseFields = ['company', 'location', 'empid', 'user'];
      newValue = upperCaseFields.includes(name) ? value.toUpperCase() : value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // If purchase year is changed, clear registration dates to force re-validation
    if (name === 'year') {
      setFormData((prev) => ({
        ...prev,
        regdt: "",
        regvd: ""
      }));
      // Clear errors for registration dates
      setErrors((prev) => ({
        ...prev,
        regdt: '',
        regvd: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const requiredFields = {
      vhno: "Vehicle Number",
      company: "Company",
      regdt: "Date of Registration",
      regvd: "Reg Valid Date",
      fuel: "Fuel Type",
      location: "Vehicle Location",
      empid: "Emp ID",
      user: "User",
      mobile: "Mobile NO",
      file: "RC Upload",
      year: "Purchase Year"
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = `${label} is required`;
      }
    });

    // Additional validation for mobile number
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    // Additional validation for vehicle number
    if (formData.vhno && !/^[A-Z0-9]+$/.test(formData.vhno)) {
      newErrors.vhno = "Vehicle number should only contain letters and numbers";
    }

    // Date validation: regdt and regvd should be >= purchase year date
    if (formData.year && formData.regdt) {
      const purchaseDate = new Date(formData.year);
      const regDate = new Date(formData.regdt);
      
      if (regDate < purchaseDate) {
        newErrors.regdt = "Date of Registration cannot be before Purchase Year date";
      }
    }

    if (formData.year && formData.regvd) {
      const purchaseDate = new Date(formData.year);
      const regValidDate = new Date(formData.regvd);
      
      if (regValidDate < purchaseDate) {
        newErrors.regvd = "Reg Valid Date cannot be before Purchase Year date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    setDebugInfo(null);

    try {
      // Check authentication token before making request
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = userInfo.token || userInfo.access_token || userInfo.api_token;
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Prepare form data for API submission
      const apiFormData = new FormData();
      
      // Map form fields to API expected field names
      apiFormData.append('VH_NUMBER', formData.vhno);
      apiFormData.append('WHEEL_TYPE', 'Two'); // Default value for two-wheeler
      apiFormData.append('VH_COMPANY', formData.company);
      apiFormData.append('VH_LOC', formData.location);
      apiFormData.append('VH_USER', formData.user);
      apiFormData.append('EMP_ID', formData.empid);
      apiFormData.append('MOBILE', formData.mobile);
      apiFormData.append('VALID_DT', formData.regvd);
      apiFormData.append('REG_DT', formData.regdt);
      apiFormData.append('FUEL', formData.fuel);
      apiFormData.append('PUR_YEAR', formData.year);
      
      // Append file if exists
      if (formData.file) {
        apiFormData.append('RC_FILE_PATH', formData.file);
      }

      // Debug: Log what we're sending
      console.log('Sending data:', {
        VH_NUMBER: formData.vhno,
        WHEEL_TYPE: 'Two',
        VH_COMPANY: formData.company,
        VH_LOC: formData.location,
        VH_USER: formData.user,
        EMP_ID: formData.empid,
        MOBILE: formData.mobile,
        VALID_DT: formData.regvd,
        REG_DT: formData.regdt,
        FUEL: formData.fuel,
        PUR_YEAR: formData.year,
        file: formData.file ? formData.file.name : 'No file',
        token: token ? 'Present' : 'Missing'
      });

      const API_URL = `${API_BASE_URL}store`;
      
      // Check if server is reachable first
      let response;
      try {
        response = await fetch(API_URL, {
          method: 'POST',
          body: apiFormData,
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest',
            // Don't set Content-Type header - let browser set it automatically for FormData
          },
          credentials: 'include', // Include cookies if needed
        });
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        setDebugInfo({
          error: 'Network Error',
          message: fetchError.message,
          stack: fetchError.stack,
          type: 'fetch_error',
          url: API_URL
        });
        throw new Error(`Network error: ${fetchError.message}`);
      }

      // Debug: Log response details
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response ok:', response.ok);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          result = await response.json();
          console.log('Response data:', result);
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          const textResult = await response.text();
          console.log('Raw response:', textResult);
          setDebugInfo({
            error: 'JSON Parse Error',
            message: 'Server returned invalid JSON',
            rawResponse: textResult,
            contentType: contentType,
            status: response.status
          });
          throw new Error('Server returned invalid JSON response');
        }
      } else {
        // If response is not JSON, get text content
        const textResult = await response.text();
        console.error('Non-JSON response:', textResult);
        setDebugInfo({
          error: 'Non-JSON Response',
          message: 'Server returned non-JSON response',
          rawResponse: textResult,
          contentType: contentType,
          status: response.status
        });
        throw new Error('Server returned non-JSON response');
      }

      if (response.ok) {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
      } else {
        // Handle API errors
        setShowConfirmModal(false);
        console.error('API Error:', result);
        
        // Handle authentication errors
        if (response.status === 401) {
          localStorage.removeItem('userInfo');
          setToken({});
          throw new Error('Session expired. Please log in again.');
        }
        
        // Check if this is a duplicate vehicle error
        if (result.error && result.error.includes('already exists') || 
            result.message && result.message.includes('already exists') ||
            result.duplicate_vehicle) {
          // Handle duplicate vehicle case
          setDuplicateVehicleData(result.existing_vehicle || result.vehicle_data || {
            vehicle_number: formData.vhno,
            company: result.existing_company || 'Unknown',
            location: result.existing_location || 'Unknown',
            user: result.existing_user || 'Unknown',
            created_at: result.created_at || 'Unknown'
          });
          setShowDuplicateModal(true);
          return;
        }
        
        if (result.errors) {
          // Handle validation errors from Laravel
          const apiErrors = {};
          Object.keys(result.errors).forEach(key => {
            // Map API field names back to form field names
            const fieldMap = {
              'VH_NUMBER': 'vhno',
              'VH_COMPANY': 'company',
              'VH_LOC': 'location',
              'VH_USER': 'user',
              'EMP_ID': 'empid',
              'MOBILE': 'mobile',
              'VALID_DT': 'regvd',
              'REG_DT': 'regdt',
              'FUEL': 'fuel',
              'PUR_YEAR': 'year',
              'RC_FILE_PATH': 'file'
            };
            const formField = fieldMap[key] || key;
            apiErrors[formField] = result.errors[key][0];
          });
          setErrors(apiErrors);
        } else {
          setDebugInfo({
            error: 'API Error',
            message: result.error || result.message || 'Unknown API error',
            status: response.status,
            responseData: result
          });
          alert(result.error || result.message || "An error occurred. Please try again.");
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      setShowConfirmModal(false);
      
      // Set debug info if not already set
      if (!debugInfo) {
        setDebugInfo({
          error: error.name || 'Unknown Error',
          message: error.message,
          stack: error.stack,
          type: 'catch_error'
        });
      }
      
      // More specific error handling
      if (error.message.includes('No authentication token found') || error.message.includes('Session expired')) {
        alert(error.message);
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert("Network error: Unable to connect to server. Please check if the server is running and try again.");
      } else if (error.message.includes('CORS')) {
        alert("CORS error: Please ensure your Laravel backend has CORS properly configured.");
      } else if (error.message.includes('Network error')) {
        alert("Network error: " + error.message);
      } else {
        alert("An error occurred: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          file: 'File size should be less than 5MB'
        }));
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          file: 'Only JPG, PNG, and PDF files are allowed'
        }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      file: file
    }));

    if (errors.file) {
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Reset form
    setFormData({
      vhno: "",
      company: "",
      regdt: "",
      regvd: "",
      fuel: "",
      location: "",
      empid: "",
      user: "",
      mobile: "",
      year: "",
      file: null
    });
    setErrors({});
    setDebugInfo(null);
  };

  const handleGoBack = () => {
    // Navigate back functionality
    window.history.back();
  };

  const showDebugInfo = () => {
    if (debugInfo) {
      setShowDebugModal(true);
    }
  };

  const handleDuplicateModalClose = () => {
    setShowDuplicateModal(false);
    setDuplicateVehicleData(null);
  };

  const handleClearVehicleNumber = () => {
    setFormData(prev => ({
      ...prev,
      vhno: ""
    }));
    setShowDuplicateModal(false);
    setDuplicateVehicleData(null);
  };

  // Check if user is authenticated on component mount
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token || userInfo.access_token || userInfo.api_token;
    
    if (!token) {
      console.warn('No authentication token found. User may need to log in.');
    }
  }, []);

  return (
    <div className="py-2 px-3">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-500 overflow-hidden">
          {/* Header */}
          <div className="p-2 flex items-center justify-between">
            <img src="./img.png" alt="Logo" className="w-32 h-10 rounded-lg" />
            <div className="px-4 py-1 rounded-lg text-white text-lg font-bold" style={{backgroundColor: '#5ea8bb'}}>
              Two Wheeler Creation
            </div>
            <div className="flex items-center space-x-2">
              {debugInfo && (
                <button
                  onClick={showDebugInfo}
                  className="text-white bg-red-500 hover:bg-red-600 rounded-full p-2"
                  title="Show Debug Info"
                >
                  <Bug className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleGoBack}
                className="text-white bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed] hover:from-[#c71d6f] hover:to-[#d09693] rounded-full p-2"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="h-0.5 bg-blue-600 w-[95%] mx-auto rounded-full"></div>

          {/* Form Content */}
          <div className="p-3">
            <form onSubmit={handleSubmit}>
              {/* Main Layout with Image on Left (6/12) and Form on Right (6/12) */}
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Vehicle Illustration - Left Side (6/12 width) */}
                <div className="lg:w-6/12 flex justify-center lg:justify-start">
                   <div className="flex justify-center">
                  <img
                    src="bike1.png"
                    alt="Vehicle maintenance illustration"
                    className="max-w-full max-h-48 mb-3 mt-8 ml-28 rounded-lg"
                  />
                </div>
                </div>

                {/* Form Fields - Right Side (6/12 width) - 7 inputs */}
                <div className="lg:w-6/12">
                  <div className="space-y-0.5">
                    {/* Vehicle Number */}
                    <div className="flex items-center space-x-3">
                      <label className="text-blue-700 font-semibold text-sm w-32 text-left whitespace-nowrap">
                        Vehicle Number <span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="vhno"
                          value={formData.vhno}
                          onChange={handleInputChange}
                          placeholder="Enter Vehicle Number (Letters and Numbers only)"
                          className={`w-full px-3 py-1.5 border-2 rounded-full ${
                            errors.vhno ? 'border-red-500' : 'border-blue-400'
                          } focus:border-blue-500 focus:outline-none text-sm`}
                        />
                        {errors.vhno && <p className="text-red-500 text-xs mt-0.5">{errors.vhno}</p>}
                       
                      </div>
                    </div>

                    {/* Company */}
                    <div className="flex items-center space-x-3">
                      <label className="text-blue-700 font-semibold text-sm w-32 text-left whitespace-nowrap">
                        Company<span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="Enter Company"
                          className={`w-full px-3 py-1.5 border-2 rounded-full ${
                            errors.company ? 'border-red-500' : 'border-blue-400'
                          } focus:border-blue-500 focus:outline-none text-sm`}
                        />
                        {errors.company && <p className="text-red-500 text-xs mt-0.5">{errors.company}</p>}
                      </div>
                    </div>

                    {/* Purchase Year */}
                    <div className="flex items-center space-x-3">
                      <label className="text-blue-700 font-semibold text-sm w-32 text-left whitespace-nowrap">
                       Purchase Year<span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="date"
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-1.5 border-2 rounded-full ${
                            errors.year ? 'border-red-500' : 'border-blue-400'
                          } focus:border-blue-500 focus:outline-none text-sm`}
                        />
                        {errors.year && <p className="text-red-500 text-xs mt-0.5">{errors.year}</p>}
                      </div>
                    </div>

                    {/* Date of Registration */}
                    <div className="flex items-center space-x-3">
                      <label className="text-blue-700 font-semibold text-sm w-32 text-left whitespace-nowrap">
                        Date of Registration<span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="date"
                          name="regdt"
                          value={formData.regdt}
                          onChange={handleInputChange}
                          min={formData.year || undefined}
                          disabled={!formData.year}
                          className={`w-full px-3 py-1.5 border-2 rounded-full ${
                            errors.regdt ? 'border-red-500' : 'border-blue-400'
                          } focus:border-blue-500 focus:outline-none text-sm ${
                            !formData.year ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                        {errors.regdt && <p className="text-red-500 text-xs mt-0.5">{errors.regdt}</p>}
                        {/* {!formData.year && (
                          <p className="text-gray-500 text-xs mt-0.5">Please select Purchase Year first</p>
                        )} */}
                      </div>
                    </div>

                    {/* Reg Valid Date */}
                    <div className="flex items-center space-x-3">
                      <label className="text-blue-700 font-semibold text-sm w-32 text-left whitespace-nowrap">
                        Reg Valid Date<span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="date"
                          name="regvd"
                          value={formData.regvd}
                          onChange={handleInputChange}
                          min={formData.year || undefined}
                          disabled={!formData.year}
                          className={`w-full px-3 py-1.5 border-2 rounded-full ${
                            errors.regvd ? 'border-red-500' : 'border-blue-400'
                          } focus:border-blue-500 focus:outline-none text-sm ${
                            !formData.year ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                        {errors.regvd && <p className="text-red-500 text-xs mt-0.5">{errors.regvd}</p>}
                        {/* {!formData.year && (
                          <p className="text-gray-500 text-xs mt-0.5">Please select Purchase Year first</p>
                        )} */}
                      </div>
                    </div>

                    {/* Fuel Type */}
                    <div className="flex items-center space-x-3">
                      <label className="text-blue-700 font-semibold text-sm w-32 text-left whitespace-nowrap">
                        Fuel Type<span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <select
                          name="fuel"
                          value={formData.fuel}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-1.5 border-2 rounded-full ${
                            errors.fuel ? 'border-red-500' : 'border-blue-400'
                          } focus:border-blue-500 focus:outline-none text-sm`}
                        >
                          <option value="">Select Fuel Type</option>
                          <option value="petrol">Petrol</option>
                          <option value="electric">Electric</option>
                        </select>
                        {errors.fuel && <p className="text-red-500 text-xs mt-0.5">{errors.fuel}</p>}
                      </div>
                    </div>

                    {/* Vehicle Location */}
                    <div className="flex items-center space-x-3">
                      <label className="text-blue-700 font-semibold text-sm w-32 text-left whitespace-nowrap">
                        Vehicle Location <span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Enter Vehicle Location"
                          className={`w-full px-3 py-1.5 border-2 rounded-full ${
                            errors.location ? 'border-red-500' : 'border-blue-400'
                          } focus:border-blue-500 focus:outline-none text-sm`}
                        />
                        {errors.location && <p className="text-red-500 text-xs mt-0.5">{errors.location}</p>}
                      </div>
                    </div>

                    {/* Emp ID */}
                    <div className="flex items-center space-x-3">
                      <label className="text-blue-700 font-semibold text-sm w-32 text-left whitespace-nowrap">
                        Emp ID <span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="empid"
                          value={formData.empid}
                          onChange={handleInputChange}
                          placeholder="Enter Employee ID"
                          className={`w-full px-3 py-1.5 border-2 rounded-full ${
                            errors.empid ? 'border-red-500' : 'border-blue-400'
                          } focus:border-blue-500 focus:outline-none text-sm`}
                        />
                        {errors.empid && <p className="text-red-500 text-xs mt-0.5">{errors.empid}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row Fields - User, Mobile NO, RC Upload (3 fields in one row) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* User */}
                <div className="flex flex-col space-y-1">
                  <label className="text-blue-700 font-semibold text-sm whitespace-nowrap">
                    User<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="user"
                    value={formData.user}
                    onChange={handleInputChange}
                    placeholder="Enter User Name"
                    className={`w-full px-3 py-1.5 border-2 rounded-full ${
                      errors.user ? 'border-red-500' : 'border-blue-400'
                    } focus:border-blue-500 focus:outline-none text-sm`}
                  />
                  {errors.user && <p className="text-red-500 text-xs mt-0.5">{errors.user}</p>}
                </div>

                {/* Mobile NO */}
                <div className="flex flex-col space-y-1">
                  <label className="text-blue-700 font-semibold text-sm whitespace-nowrap">
                    Mobile NO <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="Enter Mobile Number"
                    className={`w-full px-3 py-1.5 border-2 rounded-full ${
                      errors.mobile ? 'border-red-500' : 'border-blue-400'
                    } focus:border-blue-500 focus:outline-none text-sm`}
                  />
                  {errors.mobile && <p className="text-red-500 text-xs mt-0.5">{errors.mobile}</p>}
                </div>

                {/* RC Upload */}
                <div className="flex flex-col space-y-1">
                  <label className="text-blue-700 font-semibold text-sm whitespace-nowrap">
                    RC Upload<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="file"
                    name="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className={`w-full px-3 py-1.5 border-2 rounded-full ${
                      errors.file ? 'border-red-500' : 'border-blue-400'
                    } focus:border-blue-500 focus:outline-none file:mr-2 file:py-0.5 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-sm`}
                  />
                  {errors.file && <p className="text-red-500 text-xs mt-0.5">{errors.file}</p>}
                  <p className="text-xs text-gray-500">Max 5MB, JPG/PNG/PDF only</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-full font-medium text-white transition-all duration-300 transform hover:scale-105 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Duplicate Vehicle Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 border-2 border-red-500">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-red-600 mb-4">Vehicle Already Exists!</h3>
              <p className="text-gray-600 mb-4">
                The vehicle number <strong>{formData.vhno}</strong> already exists in the database.
              </p>
              
              <p className="text-sm text-gray-600 mb-6">
                Please clear the vehicle number field and enter a different vehicle number.
              </p>
              
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={handleDuplicateModalClose}
                  className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Bike className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Submission</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit this two-wheeler information?
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={handleConfirmedSubmit}
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-full font-medium text-white transition-all duration-300 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Yes, Submit'
                  )}
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors font-medium"
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
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-green-600 mb-4">Success!</h3>
              <p className="text-gray-600 mb-6">
                Two-wheeler information has been successfully submitted.
              </p>
              <button
                onClick={handleModalClose}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Modal */}
      {showDebugModal && debugInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-red-600">Debug Information</h3>
              <button
                onClick={() => setShowDebugModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowDebugModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoWheelerChange;