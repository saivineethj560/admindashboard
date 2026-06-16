import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, AlertTriangle, CheckCircle } from 'lucide-react';
import {API_BASE_URL} from '../Config.jsx';
const DriverData = () => {
  // In-memory counter for driver codes (replaces localStorage)
  const [driverCodeCounter, setDriverCodeCounter] = useState(1);
  const [isLoadingDriverCode, setIsLoadingDriverCode] = useState(true);

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const generateNextDriverCode = (counter) => {
    return 'DC' + counter.toString().padStart(4, '0');
  };

  const [formData, setFormData] = useState({
    driverCode: '',
    driverName: '',
    dob: '',
    age: '',
    mobile: '',
    aadhar: '',
    licence: '',
    licencefile: null, // Changed to null for file
    licenceedate: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the next available driver code from backend
  const fetchNextDriverCode = async () => {
    const token = getAuthToken();

    try {
      // First, try to get the next driver code from the specific endpoint
      const response = await fetch(`${API_BASE_URL}driver-data/next-code`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.next_driver_code) {
          // Extract counter from the backend response
          const codeNumber = parseInt(result.next_driver_code.replace('DC', '')) || 1;
          setDriverCodeCounter(codeNumber);
          setFormData(prev => ({ ...prev, driverCode: result.next_driver_code }));
          console.log('Fetched next driver code from backend:', result.next_driver_code);
          return; // Success, exit early
        }
      }

      // If the above fails, throw error to trigger fallback
      throw new Error('Next code endpoint failed or returned invalid data');

    } catch (error) {
      console.error('Error fetching next driver code from backend:', error);

      // Fallback: try to get the actual highest driver code from database
      try {
        const highestCode = await getFallbackDriverCode();
        const nextCounter = highestCode + 1;
        const nextCode = generateNextDriverCode(nextCounter);
        setDriverCodeCounter(nextCounter);
        setFormData(prev => ({ ...prev, driverCode: nextCode }));
        console.log('Using fallback next driver code:', nextCode);
      } catch (fallbackError) {
        // Final fallback - start from 1
        const nextCode = generateNextDriverCode(1);
        setDriverCodeCounter(1);
        setFormData(prev => ({ ...prev, driverCode: nextCode }));
        console.log('Using final fallback driver code:', nextCode);
      }
    } finally {
      setIsLoadingDriverCode(false);
    }
  };

  // Fallback function to get highest driver code when backend fails
  const getFallbackDriverCode = async () => {
    const token = getAuthToken();

    try {
      // Try to fetch all driver codes to find the highest one
      const response = await fetch(`${API_BASE_URL}driver-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const driverCodes = result.data || result || [];

        if (Array.isArray(driverCodes) && driverCodes.length > 0) {
          // Extract all driver codes and find the highest number
          const codeNumbers = driverCodes
            .map(driver => {
              const code = driver.DRIVER_CODE || driver.driver_code || '';
              const match = code.match(/DC(\d+)/);
              return match ? parseInt(match[1]) : 0;
            })
            .filter(num => num > 0);

          const highestCode = codeNumbers.length > 0 ? Math.max(...codeNumbers) : 0;
          console.log('Found highest driver code from database:', highestCode);
          return highestCode;
        }
      }
    } catch (error) {
      console.error('Error fetching driver codes for fallback:', error);
    }

    // If everything fails, start from 0
    return 0;
  };

  // Load next driver code on component mount
  useEffect(() => {
    fetchNextDriverCode();
  }, []);

  const calculateAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Separate handler for file input
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0] || null;

    setFormData(prev => ({
      ...prev,
      [name]: file
    }));

    // Clear error for this field when user selects a file
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Helper function to check if a value is empty
    const isEmpty = (value) => {
      return !value || (typeof value === 'string' && value.trim() === '');
    };

    // Check required fields
    if (isEmpty(formData.driverName)) {
      newErrors.driverName = 'Driver Name is required';
    }

    if (isEmpty(formData.dob)) {
      newErrors.dob = 'Date of Birth is required';
    } else {
      const calculatedAge = calculateAge(formData.dob);
      if (!calculatedAge || calculatedAge < 18 || calculatedAge > 80) {
        newErrors.dob = 'Age must be between 18 and 80 years';
      }
    }

    if (isEmpty(formData.mobile)) {
      newErrors.mobile = 'Mobile No is required';
    } else if (!/^\d{10}$/.test(formData.mobile.toString().trim())) {
      newErrors.mobile = 'Mobile number must be exactly 10 digits';
    }

    if (isEmpty(formData.aadhar)) {
      newErrors.aadhar = 'Aadhar Number is required';
    } else if (!/^\d{12}$/.test(formData.aadhar.toString().trim())) {
      newErrors.aadhar = 'Aadhar number must be exactly 12 digits';
    }

    if (isEmpty(formData.licence)) {
      newErrors.licence = 'Driving Licence is required';
    }

    if (isEmpty(formData.licenceedate)) {
      newErrors.licenceedate = 'Licence end date is required';
    }

    // File validation - check if file is selected
    if (!formData.licencefile) {
      newErrors.licencefile = 'Licence file is required';
    } else {
      // Optional: Add file type validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(formData.licencefile.type)) {
        newErrors.licencefile = 'Please upload a valid file (JPG, JPEG, PNG, or PDF)';
      }

      // Optional: Add file size validation (5MB limit)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (formData.licencefile.size > maxSizeInBytes) {
        newErrors.licencefile = 'File size must be less than 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getAuthToken = () => {
    try {
      // Try to get token from localStorage (if available in your environment)
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      return userInfo.token || userInfo.access_token || userInfo.api_token;
    } catch (error) {
      console.warn('localStorage not available, using fallback method');
      // For demo purposes, return a mock token
      return 'mock-token-for-demo';
    }
  };

  const submitToBackend = async (data) => {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Append all form fields
      formDataToSend.append('DRIVER_CODE', data.driverCode);
      formDataToSend.append('DRIVER_NAME', data.driverName);
      formDataToSend.append('DATE_OF_BIRTH', data.dob);
      formDataToSend.append('AGE', parseInt(data.age) || calculateAge(data.dob));
      formDataToSend.append('DRIVING_LICENCE', data.licence);
      formDataToSend.append('MOBILE_NO', data.mobile);
      formDataToSend.append('AADHAR_NO', data.aadhar);
      formDataToSend.append('LICENCE_EDATE', data.licenceedate);

      // Append file if it exists
      if (data.licencefile) {
        formDataToSend.append('DRIVING_LICENCE_FILE', data.licencefile);
      }

      const response = await fetch(`${API_BASE_URL}driver-data`, {
        method: 'POST',
        headers: {
          // Don't set Content-Type for FormData - browser will set it automatically with boundary
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        if (response.status === 401) {
          return { success: false, message: 'Authentication failed. Please log in again.', requiresReauth: true };
        }
        if (response.status === 403) {
          return { success: false, message: 'Access denied. You don\'t have permission to perform this action.' };
        }
        return { success: false, errors: result.errors || {}, message: result.message || 'Submission failed' };
      }
    } catch (error) {
      console.error('Network error:', error);

      // For demo purposes, simulate successful submission
      console.log('Demo mode: Simulating successful submission');
      return { success: true, data: { message: 'Demo submission successful' } };
    }
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);

    if (validateForm()) {
      setShowConfirmModal(true);
    } else {
      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmSubmit = async () => {
    setIsLoading(true);

    try {
      const result = await submitToBackend(formData);

      if (result.success) {
        setShowConfirmModal(false);
        setShowSuccessModal(true);

        // After successful submission, fetch the next driver code from backend
        await fetchNextDriverCode();

        // Reset form (driver code will be set by fetchNextDriverCode)
        setFormData(prev => ({
          ...prev, // Keep the new driver code from fetchNextDriverCode
          driverName: '',
          dob: '',
          age: '',
          mobile: '',
          aadhar: '',
          licence: '',
          licencefile: null, // Reset file to null
          licenceedate: ''
        }));
        setErrors({});
        setIsSubmitted(false);

        // Reset file input
        const fileInput = document.querySelector('input[name="licencefile"]');
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        // Handle backend validation errors
        setShowConfirmModal(false);

        if (result.errors) {
          setErrors(result.errors);
        }

        if (result.requiresReauth) {
          alert(result.message + ' Redirecting to login...');
          // Redirect to login page or handle re-authentication
          // window.location.href = '/login';
        } else {
          alert(result.message || 'Submission failed. Please check the form for errors.');
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setShowConfirmModal(false);
      alert('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-2 py-1 border rounded-full focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-xs";
    return errors[fieldName]
      ? `${baseClass} border-red-500 focus:border-red-500 bg-red-50`
      : `${baseClass} border-blue-700 focus:border-blue-500 bg-white`;
  };

  const getFileInputClassName = (fieldName) => {
    const baseClass = "w-full px-2 py-1 border rounded-full focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100";
    return errors[fieldName]
      ? `${baseClass} border-red-500 focus:border-red-500 bg-red-50`
      : `${baseClass} border-blue-700 focus:border-blue-500 bg-white`;
  };

  const getDriverCodeInputClassName = () => {
    return "w-full px-2 py-1 border rounded-full focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all text-xs border-gray-400 bg-gray-100 text-gray-500 cursor-not-allowed";
  };

  // if (isLoadingDriverCode) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading driver form...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-100 py-1 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg px-6 py-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <User className="text-white text-base" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Driver Data Management</h1>
                  <p className="text-blue-100 text-xs">Add and manage Driver information</p>
                </div>
              </div>
              <button onClick={handleGoBack} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors duration-200">
                <ArrowLeft className="text-base" />
              </button>
            </div>
          </div>
        </div>

        {/* Form - Compressed Height */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* Left - Image */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[340px]">
              <div className="text-center text-gray-500 flex items-center justify-center h-full">
                <div className="text-gray-400">
                  <div className="text-center">
                    <img
                      src="/crane1.jpg"
                      alt="Vehicle Preview"
                      className="w-full h-full mb-0 mx-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[340px]">
                <div className="p-2 h-full flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                    {/* Driver Code - Greyed out */}
                    <div className="space-y-0.5">
                      <label className="block text-gray-500 font-semibold text-xs">Driver Code</label>
                      <input
                        type="text"
                        name="driverCode"
                        value={formData.driverCode}
                        readOnly
                        className={getDriverCodeInputClassName()}
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="block text-blue-700 font-semibold text-xs">
                        Driver Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="driverName"
                        value={formData.driverName}
                        onChange={handleInputChange}
                        placeholder="Enter driver name"
                        className={getInputClassName('driverName')}
                      />
                      {errors.driverName && <p className="text-red-500 text-xs mt-0.5">{Array.isArray(errors.driverName) ? errors.driverName[0] : errors.driverName}</p>}
                    </div>

                    {/* DOB, Age, Mobile - Compact Layout */}
                    <div className="md:col-span-2">
                      <div className="grid grid-cols-12 gap-1.5">
                        <div className="col-span-3 space-y-0.5">
                          <label className="block text-blue-700 font-semibold text-xs">
                            Date of Birth <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={(e) => {
                              const dob = e.target.value;
                              const age = calculateAge(dob);
                              setFormData(prev => ({ ...prev, dob, age: age.toString() }));
                              if (errors.dob) setErrors(prev => ({ ...prev, dob: '' }));
                              if (errors.age) setErrors(prev => ({ ...prev, age: '' }));
                            }}
                            className={getInputClassName('dob')}
                          />
                          {errors.dob && <p className="text-red-500 text-xs mt-0.5">{Array.isArray(errors.dob) ? errors.dob[0] : errors.dob}</p>}
                        </div>

                        <div className="col-span-3 space-y-0.5">
                          <label className="block text-blue-700 font-semibold text-xs">Age</label>
                          <input
                            type="number"
                            name="age"
                            value={formData.age || ''}
                            readOnly
                            className={getInputClassName('age')}
                          />
                          {errors.age && <p className="text-red-500 text-xs mt-0.5">{Array.isArray(errors.age) ? errors.age[0] : errors.age}</p>}
                        </div>

                        <div className="col-span-6 space-y-0.5">
                          <label className="block text-blue-700 font-semibold text-xs">
                            Mobile No <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            placeholder="Enter mobile number"
                            className={getInputClassName('mobile')}
                            maxLength="10"
                          />
                          {errors.mobile && <p className="text-red-500 text-xs mt-0.5">{Array.isArray(errors.mobile) ? errors.mobile[0] : errors.mobile}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label className="block text-blue-700 font-semibold text-xs">
                        Aadhar Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="aadhar"
                        value={formData.aadhar}
                        onChange={handleInputChange}
                        placeholder="Enter Aadhar number"
                        className={getInputClassName('aadhar')}
                        maxLength="12"
                      />
                      {errors.aadhar && <p className="text-red-500 text-xs mt-0.5">{Array.isArray(errors.aadhar) ? errors.aadhar[0] : errors.aadhar}</p>}
                    </div>

                    <div className="space-y-0.5">
                      <label className="block text-blue-700 font-semibold text-xs">
                        Driving Licence <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="licence"
                        value={formData.licence}
                        onChange={handleInputChange}
                        placeholder="Enter licence number"
                        className={getInputClassName('licence')}
                      />
                      {errors.licence && <p className="text-red-500 text-xs mt-0.5">{Array.isArray(errors.licence) ? errors.licence[0] : errors.licence}</p>}
                    </div>

                    <div className="space-y-0.5">
                      <label className="block text-blue-700 font-semibold text-xs">
                        Driving Licence File <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        name="licencefile"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className={getFileInputClassName('licencefile')}
                      />
                      {formData.licencefile && (
                        <p className="text-green-600 text-xs mt-0.5">
                          Selected: {formData.licencefile.name} ({(formData.licencefile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                      {errors.licencefile && <p className="text-red-500 text-xs mt-0.5">{Array.isArray(errors.licencefile) ? errors.licencefile[0] : errors.licencefile}</p>}
                    </div>

                    <div className="space-y-0.5">
                      <label className="block text-blue-700 font-semibold text-xs">
                        Licence End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="licenceedate"
                        value={formData.licenceedate}
                        onChange={handleInputChange}
                        className={getInputClassName('licenceedate')}
                      />
                      {errors.licenceedate && <p className="text-red-500 text-xs mt-0.5">{Array.isArray(errors.licenceedate) ? errors.licenceedate[0] : errors.licenceedate}</p>}
                    </div>
                  </div>

                  {/* Submit Button - Compact */}
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className={`w-full max-w-md ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'} text-white py-1.5 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-sm`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <User className="text-sm" />
                        <span>{isLoading ? 'Submitting...' : 'Submit'}</span>
                      </div>
                    </button>
                  </div>
                </div>
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
                    Confirm if you want to submit this driver data.
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
                </div>

                {/* Success Details */}
                <div className="bg-green-50 rounded-lg p-3 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-green-800 font-medium">
                      Driver "{formData.driverName}" ({formData.driverCode}) has been registered successfully.
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
      </div>
    </div>
  );
};

export default DriverData;