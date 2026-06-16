import React, { useState, useEffect } from "react";
import { API_BASE_URL } from '../config';
import { Shield, Wrench, Calculator, Car, Check, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { X, AlertTriangle } from 'lucide-react';

const Creation1 = () => {
  const [activeTab, setActiveTab] = useState("insurance");
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateVehicleInfo, setDuplicateVehicleInfo] = useState({});
  const [currentCarImage, setCurrentCarImage] = useState(0);
  const [vehicleNumbers, setVehicleNumbers] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [vehicleError, setVehicleError] = useState('');

  const [searchStates, setSearchStates] = useState({
    insurance: { isSearching: false, showDropdown: false, filteredVehicles: [] },
    maintenance: { isSearching: false, showDropdown: false, filteredVehicles: [] },
    tax: { isSearching: false, showDropdown: false, filteredVehicles: [] }
  });
  
  // Get user token from localStorage
  const [userToken, setToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo')) || {};
  });

  // Initialize form data with user information from token
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    request_for: userToken.Is_Employee === 0 ? "Standard" : "Self",
    name: userToken.employee || "",
    // Initialize vehicle number fields
    vhno: "",
    vhtype: "",
    fuel: "",
    vhcmpny: "",
    vhmodel: "",
    companyplant: "",
    puryear: "",
    regdt: "",
    regvd: "",
    user: "",
    drivername: "",
    mobile: "",
    instartdate: "",
    inenddate: "",
    inscmpny: "",
    insamt: "",
    file: null,
    filerc: null,
    filedoc: null,
    // vhkms:"",
    maintenanceVhno: "",
    taxVhno: ""
  });

  const navigate = useNavigate();

  // Validation function
  const validateRegistrationDate = (regDate, purchaseDate) => {
    if (!regDate || !purchaseDate) return true;
    const regDateObj = new Date(regDate);
    const purchaseDateObj = new Date(purchaseDate);
    return regDateObj >= purchaseDateObj;
  };

  // Vehicle search functionality
  const handleVehicleSearch = (searchValue, fieldName) => {
    console.log('Search triggered:', searchValue, 'Field:', fieldName);
    
    let tabType = 'insurance';
    if (fieldName === 'maintenanceVhno') tabType = 'maintenance';
    if (fieldName === 'taxVhno') tabType = 'tax';
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: searchValue
    }));

    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }

    if (!searchValue || searchValue.length < 1) {
      setSearchStates(prev => ({
        ...prev,
        [tabType]: { isSearching: false, showDropdown: false, filteredVehicles: [] }
      }));
      return;
    }

    setSearchStates(prev => ({
      ...prev,
      [tabType]: { ...prev[tabType], isSearching: true }
    }));
    
    const filtered = vehicleNumbers.filter(vehicle => {
      let vehicleNumber = '';
      
      if (typeof vehicle === 'string') {
        vehicleNumber = vehicle;
      } else if (typeof vehicle === 'object' && vehicle !== null) {
        vehicleNumber = vehicle.vhno || 
                      vehicle.vehicle_number || 
                      vehicle.number || 
                      vehicle.vehicleNumber ||
                      vehicle.vehicle_no ||
                      vehicle.registration_number ||
                      '';
      }
      
      return vehicleNumber.toString().toUpperCase().includes(searchValue.toUpperCase());
    });
    
    setSearchStates(prev => ({
      ...prev,
      [tabType]: {
        isSearching: false,
        showDropdown: filtered.length > 0,
        filteredVehicles: filtered
      }
    }));
  };

  const handleVehicleSelect = (vehicle, fieldName) => {
    let vehicleNumber = '';
    
    if (typeof vehicle === 'string') {
      vehicleNumber = vehicle;
    } else if (typeof vehicle === 'object' && vehicle !== null) {
      vehicleNumber = vehicle.vhno || 
                    vehicle.vehicle_number || 
                    vehicle.number || 
                    vehicle.vehicleNumber ||
                    vehicle.vehicle_no ||
                    vehicle.registration_number ||
                    '';
    }

    setFormData(prev => ({
      ...prev,
      [fieldName]: vehicleNumber
    }));

    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }

    let tabType = 'insurance';
    if (fieldName === 'maintenanceVhno') tabType = 'maintenance';
    if (fieldName === 'taxVhno') tabType = 'tax';

    setSearchStates(prev => ({
      ...prev,
      [tabType]: { isSearching: false, showDropdown: false, filteredVehicles: [] }
    }));
  };

  const handleTabSubmit = (vehicleNumber, tabType) => {
    if (!vehicleNumber || vehicleNumber.trim() === '') {
      const errorField = tabType === 'maintenance' ? 'maintenanceVhno' : 'taxVhno';
      setErrors(prev => ({
        ...prev,
        [errorField]: 'Vehicle Number is required'
      }));
      return;
    }
    
    console.log(`Navigating to ${tabType} page for vehicle: ${vehicleNumber}`);
    
    if (tabType === 'maintenance') {
      navigate(`/MaintenanceFour?vehicle=${vehicleNumber}`);
    } else if (tabType === 'tax') {
      navigate(`/TaxFour?vehicle=${vehicleNumber}`);
    }
  };

  const fetchVehicleNumbers = async () => {
    setIsLoadingVehicles(true);
    setVehicleError('');
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = userInfo.token || userInfo.access_token || userInfo.api_token;

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(`${API_BASE_URL}vehicle-numbers`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            
            if (response.status === 401) {
              localStorage.removeItem('userInfo');
              setToken({});
              errorMessage = 'Session expired. Please log in again.';
            } else {
              errorMessage = errorData.message || errorData.error || errorMessage;
            }
          }
        } catch (parseError) {
          if (response.status === 401) {
            localStorage.removeItem('userInfo');
            setToken({});
            errorMessage = 'Session expired. Please log in again.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (Array.isArray(result)) {
        setVehicleNumbers(result);
      } else if (result.data && Array.isArray(result.data)) {
        setVehicleNumbers(result.data);
      } else if (result.vehicles && Array.isArray(result.vehicles)) {
        setVehicleNumbers(result.vehicles);
      } else {
        setVehicleNumbers([]);
        setVehicleError('Unexpected response format from vehicle API');
      }

    } catch (error) {
      console.error("Error fetching vehicle numbers:", error);
      setVehicleError(error.message);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setVehicleError('Cannot connect to server. Please ensure the API server is running.');
      }
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.vehicle-search-container')) {
        setSearchStates(prev => ({
          insurance: { ...prev.insurance, showDropdown: false },
          maintenance: { ...prev.maintenance, showDropdown: false },
          tax: { ...prev.tax, showDropdown: false }
        }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (userToken.token || userToken.access_token || userToken.api_token) {
      fetchVehicleNumbers();
    }
  }, [userToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCarImage(prev => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'vhno' || name === 'maintenanceVhno' || name === 'taxVhno') {
      handleVehicleSearch(value, name);
    } else {
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

      if (name === 'regdt' && formData.puryear) {
        if (!validateRegistrationDate(value, formData.puryear)) {
          setErrors(prev => ({
            ...prev,
            regdt: 'Registration date cannot be before purchase date'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            regdt: ''
          }));
        }
      }

      if (name === 'puryear' && formData.regdt) {
        if (!validateRegistrationDate(formData.regdt, value)) {
          setErrors(prev => ({
            ...prev,
            regdt: 'Registration date cannot be before purchase date'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            regdt: ''
          }));
        }
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (activeTab === "insurance") {
      const requiredFields = {
        vhno: "Vehicle Number",
        vhtype: "Vehicle Type",
        fuel: "Fuel Type",
        vhcmpny: "Vehicle Company",
        vhmodel: "Vehicle Model",
        companyplant: "Company & Plant",
        puryear: "Purchase Year",
        user: "User / Dept",
        drivername: "Driver Name",
        mobile: "Mobile No",
        insamt: "Insurance Amount",
        file: "Invoice Upload",
        filerc: "RC Upload",
        
      };

      Object.entries(requiredFields).forEach(([field, label]) => {
        if (field === 'file' || field === 'filerc') {
          if (!formData[field] || !(formData[field] instanceof File)) {
            newErrors[field] = `${label} is required`;
          }
        } else {
          if (!formData[field] || formData[field].toString().trim() === '') {
            newErrors[field] = `${label} is required`;
          }
        }
      });

      if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
        newErrors.mobile = "Mobile number must be 10 digits";
      }

      if (formData.vhno && formData.vhno.length < 4) {
        newErrors.vhno = "Vehicle number must be at least 4 characters";
      }

      if (formData.regdt && formData.puryear) {
        if (!validateRegistrationDate(formData.regdt, formData.puryear)) {
          newErrors.regdt = 'Registration date cannot be before purchase date';
        }
      }
    } else if (activeTab === "maintenance") {
      if (!formData.maintenanceVhno || formData.maintenanceVhno.trim() === '') {
        newErrors.maintenanceVhno = "Vehicle Number is required";
      }
    } else if (activeTab === "tax") {
      if (!formData.taxVhno || formData.taxVhno.trim() === '') {
        newErrors.taxVhno = "Vehicle Number is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // FIXED: Main submission function
  const submitInsuranceData = async () => {
    try {
      console.log('Starting form submission...');
      console.log('Form data before submission:', formData);

      const formDataToSend = new FormData();
      
      // CRITICAL: Map field names correctly to match Laravel validation
      const fieldMapping = {
        vhno: 'vhno',
        vhtype: 'vhtype',
        fuel: 'fuel',
        vhcmpny: 'vhcmpny',
        vhmodel: 'vhmodel',
        companyplant: 'companyplant',
        puryear: 'puryear',
        user: 'user',
        drivername: 'drivername',
        mobile: 'mobile',
        regdt: 'regdt',
        regvd: 'regvd',
        instartdate: 'instartdate',
        inenddate: 'inenddate',
        inscmpny: 'inscmpny',
        insamt: 'insamt',
        // vhkms:'vhkms'
      };

      // Add regular form fields - ONLY if they have values
      Object.keys(fieldMapping).forEach(key => {
        const value = formData[key];
        if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(fieldMapping[key], value);
          console.log(`Added field: ${key} = ${value}`);
        }
      });

      // CRITICAL: Handle file uploads
      if (formData.file && formData.file instanceof File) {
        formDataToSend.append('file', formData.file);
        console.log('Invoice file added:', formData.file.name, 'Size:', formData.file.size);
      } else {
        console.error('Invoice file missing or invalid');
        throw new Error('Invoice file is required');
      }

      if (formData.filerc && formData.filerc instanceof File) {
        formDataToSend.append('filerc', formData.filerc);
        console.log('RC file added:', formData.filerc.name, 'Size:', formData.filerc.size);
      } else {
        console.error('RC file missing or invalid');
        throw new Error('RC file is required');
      }

      if (formData.filedoc && formData.filedoc instanceof File) {
        formDataToSend.append('filedoc', formData.filedoc);
        console.log('Document file added:', formData.filedoc.name, 'Size:', formData.filedoc.size);
      }

      // Debug: Log all form data being sent
      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(key, `File: ${value.name}, Size: ${value.size}, Type: ${value.type}`);
        } else {
          console.log(key, value);
        }
      }

      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = userInfo.token || userInfo.access_token || userInfo.api_token;

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Sending request to:', `${API_BASE_URL}four-wheeler-post`);

      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let browser set it for FormData
      };

      const response = await fetch(`${API_BASE_URL}four-wheeler-post`, {
        method: 'POST',
        body: formDataToSend,
        headers: headers,
       
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        let errorDetails = null;
        
        try {
          const responseText = await response.text();
          console.log('Error response text:', responseText);
          
          if (contentType && contentType.includes('application/json')) {
            const errorData = JSON.parse(responseText);
            console.error('Server error details:', errorData);
            errorDetails = errorData;
            
            // Check for duplicate vehicle error
            if (response.status === 409 || 
                (errorData.duplicate_vehicle === true) ||
                (errorData.message && errorData.message.toLowerCase().includes('already exists')) ||
                (errorData.error && errorData.error.toLowerCase().includes('duplicate'))) {
              
              setDuplicateVehicleInfo({
                vehicleNumber: formData.vhno,
                message: errorData.message || errorData.error || 'This vehicle number already exists in the system.',
                existingData: errorData.existing_vehicle || errorData.existingData || null
              });
              setShowDuplicateModal(true);
              
              return { success: false, isDuplicate: true };
            }
            
            if (response.status === 401) {
              localStorage.removeItem('userInfo');
              setToken({});
              errorMessage = 'Session expired. Please log in again.';
            } else if (errorData.errors) {
              // Laravel validation errors
              const validationErrors = Object.values(errorData.errors).flat();
              errorMessage = validationErrors.join(', ');
            } else {
              errorMessage = errorData.message || errorData.error || errorMessage;
            }
          } else {
            console.error('Non-JSON server error response:', responseText);
            
            if (responseText.toLowerCase().includes('already exists') || 
                responseText.toLowerCase().includes('duplicate')) {
              setDuplicateVehicleInfo({
                vehicleNumber: formData.vhno,
                message: 'This vehicle number already exists in the system.',
                existingData: null
              });
              setShowDuplicateModal(true);
              
              return { success: false, isDuplicate: true };
            }
            
            if (response.status === 401) {
              localStorage.removeItem('userInfo');
              setToken({});
              errorMessage = 'Session expired. Please log in again.';
            } else if (response.status === 500) {
              errorMessage = 'Server error occurred. Please check the server logs for details.';
            } else {
              errorMessage = `Server returned ${response.status}: ${responseText.substring(0, 200)}`;
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          if (response.status === 401) {
            localStorage.removeItem('userInfo');
            setToken({});
            errorMessage = 'Session expired. Please log in again.';
          } else {
            errorMessage = `Server error (${response.status}) - Unable to parse response`;
          }
        }
        
        if (errorDetails) {
          console.error('Full error details for debugging:', errorDetails);
        }
        
        throw new Error(errorMessage);
      }

      // Success case
      let result;
      try {
        const responseText = await response.text();
        console.log('Success response text:', responseText);
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        result = { message: 'Request processed successfully' };
      }
      
      console.log("API Success:", result);
      return { success: true, data: result };

    } catch (error) {
      console.error("Error submitting data:", error);
      console.error("Error stack:", error.stack);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please ensure the API server is running and accessible.'
        };
      }
      
      return { success: false, error: error.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission started, active tab:', activeTab);
    console.log('Current form data:', formData);
    
    // Check authentication
    if (!userToken.token && !userToken.access_token && !userToken.api_token) {
      alert('You are not logged in. Please log in first.');
      return;
    }
    
    if (activeTab === "insurance") {
      console.log('Validating insurance form...');
      if (validateForm()) {
        console.log('Validation passed, showing confirmation modal');
        setShowConfirmModal(true);
      } else {
        console.log('Validation failed, errors:', errors);
      }
    } else {
      let vehicleNumber = '';
      let errorField = '';
      
      if (activeTab === "maintenance") {
        vehicleNumber = formData.maintenanceVhno;
        errorField = 'maintenanceVhno';
      } else if (activeTab === "tax") {
        vehicleNumber = formData.taxVhno;
        errorField = 'taxVhno';
      }
      
      if (!vehicleNumber || vehicleNumber.trim() === '') {
        setErrors(prev => ({
          ...prev,
          [errorField]: 'Vehicle Number is required'
        }));
        return;
      }
      
      setErrors(prev => ({
        ...prev,
        [errorField]: ''
      }));
      
      handleTabSubmit(vehicleNumber, activeTab);
    }
  };

  const handleConfirmedSubmit = async () => {
    console.log('Confirmed submission started');
    setIsSubmitting(true);
    
    try {
      const result = await submitInsuranceData();
      
      if (result.success) {
        console.log('Submission successful');
        setShowConfirmModal(false);
        setShowSuccessModal(true);
      } else if (result.isDuplicate) {
        console.log('Duplicate vehicle detected');
        setShowConfirmModal(false);
      } else {
        console.log('Submission failed:', result.error);
        setShowConfirmModal(false);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setShowConfirmModal(false);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
  };

  const handleDuplicateModalClose = () => {
    setShowDuplicateModal(false);
    setDuplicateVehicleInfo({});
  };

  const handleDuplicateModalContinue = () => {
    setShowDuplicateModal(false);
    setDuplicateVehicleInfo({});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fieldName = e.target.name;
    
    console.log('File selected:', file ? file.name : 'none', 'for field:', fieldName);
    
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: 'File size should be less than 5MB'
        }));
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: 'Only JPG, PNG, and PDF files are allowed'
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
    
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      request_for: userToken.Is_Employee === 0 ? "Standard" : "Self",
      name: userToken.employee || "",
      vhno: "",
      vhtype: "",
      fuel: "",
      vhcmpny: "",
      vhmodel: "",
      companyplant: "",
      puryear: "",
      regdt: "",
      regvd: "",
      user: "",
      drivername: "",
      mobile: "",
      instartdate: "",
      inenddate: "",
      inscmpny: "",
      insamt: "",
      file: null,
      filerc: null,
      filedoc: null,
      // vhkms:"",
      maintenanceVhno: "",
      taxVhno: ""
    });
    setErrors({});
    setSearchStates({
      insurance: { isSearching: false, showDropdown: false, filteredVehicles: [] },
      maintenance: { isSearching: false, showDropdown: false, filteredVehicles: [] },
      tax: { isSearching: false, showDropdown: false, filteredVehicles: [] }
    });
  };

  const renderVehicleDropdown = (tabType, fieldName) => {
    const currentState = searchStates[tabType];
    
    if (!currentState.showDropdown || currentState.filteredVehicles.length === 0) {
      return null;
    }

    return (
      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
        {currentState.isSearching ? (
          <div className="p-3 text-center text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            Searching...
          </div>
        ) : (
          currentState.filteredVehicles.map((vehicle, index) => {
            let vehicleNumber = '';
            
            if (typeof vehicle === 'string') {
              vehicleNumber = vehicle;
            } else if (typeof vehicle === 'object' && vehicle !== null) {
              vehicleNumber = vehicle.vhno || 
                            vehicle.vehicle_number || 
                            vehicle.number || 
                            vehicle.vehicleNumber ||
                            vehicle.vehicle_no ||
                            vehicle.registration_number ||
                            '';
            }

            return (
              <div
                key={`${fieldName}-${index}`}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                onClick={() => handleVehicleSelect(vehicle, fieldName)}
              >
                <div className="font-medium text-gray-900">{vehicleNumber}</div>
                {typeof vehicle === 'object' && vehicle.model && (
                  <div className="text-sm text-gray-500">{vehicle.model}</div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  if (!userToken.token && !userToken.access_token && !userToken.api_token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Required</h2>
          <p className="text-gray-700 mb-4">You need to be logged in to access this page.</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "insurance",
      name: "Insurance",
      icon: Shield,
      color: "from-blue-500 to-blue-600",
      hoverColor: "from-blue-600 to-blue-700",
      borderColor: "border-blue-500",
      content: (
        <div className="bg-blue-50 p-2 rounded-lg shadow-sm space-y-1">
          <h3 className="text-lg font-semibold text-blue-700">Insurance Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">
                Vehicle Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="vhno"
                maxLength={15}
                value={formData.vhno || ''}
                className={`w-full px-3 py-0.5 border-2 rounded-full ${
                  errors.vhno ? 'border-red-500' : 'border-blue-600'
                }`}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
                  handleInputChange(e);
                }}
              />
              {errors.vhno && <p className="text-red-500 text-xs mt-1">{errors.vhno}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">
                Vehicle Type <span className="text-red-600">*</span>
              </label>
              <select 
                name="vhtype" 
                value={formData.vhtype || ''}
                className={`w-full px-3 py-0.5 border-2 rounded-full ${
                  errors.vhtype ? 'border-red-500' : 'border-blue-600'
                }`}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="NON-COMMERCIAL">Non Commercial</option>
              </select>
              {errors.vhtype && <p className="text-red-500 text-xs mt-1">{errors.vhtype}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">
                Fuel Type <span className="text-red-600">*</span>
              </label>
              <select 
                name="fuel" 
                value={formData.fuel || ''}
                className={`w-full px-3 py-0.5 border-2 rounded-full ${
                  errors.fuel ? 'border-red-500' : 'border-blue-600'
                }`}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electrical">Electrical</option>
                <option value="CNG">CNG</option>
              </select>
              {errors.fuel && <p className="text-red-500 text-xs mt-1">{errors.fuel}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">
                Vehicle Company <span className="text-red-600">*</span>
              </label>
              <input 
                type="text" 
                name="vhcmpny"
                value={formData.vhcmpny || ''}
                className={`w-full px-3 py-0.5 border-2 rounded-full ${
                  errors.vhcmpny ? 'border-red-500' : 'border-blue-600'
                }`}
                onChange={handleInputChange}
              />
              {errors.vhcmpny && <p className="text-red-500 text-xs mt-1">{errors.vhcmpny}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">
                Vehicle Model <span className="text-red-600">*</span>
              </label>
              <input 
                type="text" 
                name="vhmodel"
                value={formData.vhmodel || ''}
                className={`w-full px-3 py-0.5 border-2 rounded-full ${
                  errors.vhmodel ? 'border-red-500' : 'border-blue-600'
                }`}
                onChange={handleInputChange}
              />
              {errors.vhmodel && <p className="text-red-500 text-xs mt-1">{errors.vhmodel}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">
                Reg Company & Plant <span className="text-red-600">*</span>
              </label>
              <input 
                type="text" 
                name="companyplant"
                value={formData.companyplant || ''}
                className={`w-full px-3 py-0.5 border-2 rounded-full ${
                  errors.companyplant ? 'border-red-500' : 'border-blue-600'
                }`}
                onChange={handleInputChange}
              />
              {errors.companyplant && <p className="text-red-500 text-xs mt-1">{errors.companyplant}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">
                Purchase Year <span className="text-red-600">*</span>
              </label>
              <input 
                type="date" 
                name="puryear"
                value={formData.puryear || ''}
                className={`w-full px-3 py-0.5 border-2 rounded-full ${
                  errors.puryear ? 'border-red-500' : 'border-blue-600'
                }`}
                onChange={handleInputChange}
              />
              {errors.puryear && <p className="text-red-500 text-xs mt-1">{errors.puryear}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">Date of Registration</label>
              <input 
                type="date" 
                name="regdt"
                value={formData.regdt || ''}
                min={formData.puryear || ''}
                className={`w-full px-3 py-0.5 border-2 rounded-full ${
                  errors.regdt ? 'border-red-500' : 'border-blue-600'
                }`}
                onChange={handleInputChange}
              />
              {errors.regdt && <p className="text-red-500 text-xs mt-1">{errors.regdt}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">Reg. Valid Till</label>
              <input 
                type="date" 
                name="regvd"
                value={formData.regvd || ''}
                className="w-full px-3 py-0.5 border-2 border-blue-600 rounded-full"
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">
                User / Dept <span className="text-red-600">*</span>
              </label>
              <input 
                type="text" 
                name="user"
                value={formData.user || ''}
                className={`w-full px-3 py-0.5 border-2 rounded-full ${
                  errors.user ? 'border-red-500' : 'border-blue-600'
                }`}
                onChange={handleInputChange}
              />
              {errors.user && <p className="text-red-500 text-xs mt-1">{errors.user}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">
                Driver Name <span className="text-red-600">*</span>
              </label>
              <input 
                type="text" 
                name="drivername"
                value={formData.drivername || ''}
                className={`w-full px-3 py-0.5 border-2 rounded-full ${
                  errors.drivername ? 'border-red-500' : 'border-blue-600'
                }`}
                onChange={handleInputChange}
              />
              {errors.drivername && <p className="text-red-500 text-xs mt-1">{errors.drivername}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">
                Mobile No <span className="text-red-600">*</span>
              </label>
              <input 
                type="text" 
                name="mobile"
                value={formData.mobile || ''}
                maxLength={10}
                className={`w-full px-3 py-0.5 border-2 rounded-full ${
                  errors.mobile ? 'border-red-500' : 'border-blue-600'
                }`}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                  handleInputChange(e);
                }}
              />
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">Insurance Start</label>
              <input 
                type="date" 
                name="instartdate"
                value={formData.instartdate || ''}
                className="w-full px-3 py-0.5 border-2 border-blue-600 rounded-full"
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">Insurance End</label>
              <input 
                type="date" 
                name="inenddate"
                value={formData.inenddate || ''}
                className="w-full px-3 py-0.5 border-2 border-blue-600 rounded-full"
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">Ins. Company</label>
              <input 
                type="text" 
                name="inscmpny"
                value={formData.inscmpny || ''}
                className="w-full px-3 py-0.5 border-2 border-blue-600 rounded-full"
                onChange={handleInputChange}
              />
            </div>
             
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">
                Premium Ins Amt <span className="text-red-600">*</span>
              </label>
              <input 
                type="text" 
                name="insamt"
                value={formData.insamt || ''}
                className={`w-full px-3 py-0.5 border-2 rounded-full ${
                  errors.insamt ? 'border-red-500' : 'border-blue-600'
                }`}
                onChange={handleInputChange}
              />
              {errors.insamt && <p className="text-red-500 text-xs mt-1">{errors.insamt}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">
                Insurance Upload <span className="text-red-600">*</span>
              </label>
              <input
                type="file"
                name="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className={`w-full px-3 py-0.5 border-2 rounded-full text-sm
                  file:mr-3 file:py-1 file:px-2 file:rounded-full file:border-0
                  file:bg-blue-100 file:text-blue-700 ${
                    errors.file ? 'border-red-500' : 'border-blue-600'
                  }`}
                onChange={handleFileChange}
              />
              {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
              <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG/PDF only</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">
                RC Upload <span className="text-red-600">*</span>
              </label>
              <input
                type="file"
                name="filerc"
                accept=".jpg,.jpeg,.png,.pdf"
                className={`w-full px-3 py-0.5 border-2 rounded-full text-sm
                  file:mr-3 file:py-1 file:px-2 file:rounded-full file:border-0
                  file:bg-blue-100 file:text-blue-700 ${
                    errors.filerc ? 'border-red-500' : 'border-blue-600'
                  }`}
                onChange={handleFileChange}
              />
              {errors.filerc && <p className="text-red-500 text-xs mt-1">{errors.filerc}</p>}
              <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG/PDF only</p>
            </div>
              
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">Vehicle Document</label>
              <input
                type="file"
                name="filedoc"
                accept=".jpg,.jpeg,.png,.pdf"
                className={`w-full px-3 py-0.5 border-2 rounded-full text-sm
                  file:mr-3 file:py-1 file:px-2 file:rounded-full file:border-0
                  file:bg-blue-100 file:text-blue-700 ${
                    errors.filedoc ? 'border-red-500' : 'border-blue-600'
                  }`}
                onChange={handleFileChange}
              />
              {errors.filedoc && <p className="text-red-500 text-xs mt-1">{errors.filedoc}</p>}
              <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG/PDF only</p>
            </div>

              {/* <div>
              <label className="block text-sm font-bold text-gray-800 mb-0.5">Vehicle Kms</label>
              <input 
                type="text" 
                name="vhkms"
                value={formData.vhkms || ''}
                className="w-full px-3 py-0.5 border-2 border-blue-600 rounded-full"
                onChange={handleInputChange}
              />
            </div> */}
          </div>
        </div>
      )
    },
    {
      id: "maintenance",
      name: "Maintenance",
      icon: Wrench,
      color: "from-green-500 to-green-600",
      hoverColor: "from-green-600 to-green-700",
      borderColor: "border-green-500",
      content: (
        <div className="bg-green-100 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Maintenance Request</h3>
          <div className="vehicle-search-container relative">
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Vehicle Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="maintenanceVhno"
              maxLength={15}
              value={formData.maintenanceVhno || ''}
              className={`w-full px-4 py-2 border-2 rounded-full ${
                errors.maintenanceVhno ? 'border-red-500' : 'border-green-600'
              }`}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
                handleInputChange(e);
              }}
              placeholder="Type or select vehicle number..."
              autoComplete="off"
            />
            {renderVehicleDropdown('maintenance', 'maintenanceVhno')}
            {errors.maintenanceVhno && <p className="text-red-500 text-xs mt-1">{errors.maintenanceVhno}</p>}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Enter the vehicle number to proceed with maintenance request.
          </p>
        </div>
      )
    },
    {
      id: "tax",
      name: "Tax",
      icon: Calculator,
      color: "from-purple-500 to-purple-600",
      hoverColor: "from-purple-600 to-purple-700",
      borderColor: "border-purple-500",
      content: (
        <div className="bg-purple-100 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-purple-700 mb-4">Tax Information</h3>
          <div className="vehicle-search-container relative">
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Vehicle Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="taxVhno"
              maxLength={15}
              value={formData.taxVhno || ''}
              className={`w-full px-4 py-2 border-2 rounded-full ${
                errors.taxVhno ? 'border-red-500' : 'border-purple-600'
              }`}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
                handleInputChange(e);
              }}
              placeholder="Type or select vehicle number..."
              autoComplete="off"
            />
            {renderVehicleDropdown('tax', 'taxVhno')}
            {errors.taxVhno && <p className="text-red-500 text-xs mt-1">{errors.taxVhno}</p>}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Enter the vehicle number to proceed with tax information.
          </p>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="py-3 px-3">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow border-2 border-blue-500 overflow-hidden">
            {/* Header */}
            <div className="p-2 flex items-center justify-between">
              <img src="./img.png" alt="Logo" className="w-40 h-12 rounded-lg" />
              <div className="bg-[#5ea8bb] px-5 py-1.5 rounded-lg text-white text-xl font-bold -ml-20">
                Four Wheeler Creation
              </div>
        
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(-1)}
                  className="text-white bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed] hover:from-[#c71d6f] hover:to-[#d09693] rounded-full p-1"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="h-0.5 bg-blue-600 w-[95%] mx-auto"></div>

            <div className="flex min-h-[400px]">
              {/* Sidebar */}
              <div className="w-64 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200 border-r border-gray-400 shadow-inner p-4 rounded-l-lg">
                <h2 className="text-lg font-bold text-center bg-gradient-to-r from-blue-900 to-purple-600 bg-clip-text text-transparent mb-4">
                  Four Wheeler
                </h2>
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                          isActive
                            ? `bg-gradient-to-r ${tab.color} text-white shadow-md border ${tab.borderColor}`
                            : `text-gray-600 hover:bg-gradient-to-r ${tab.hoverColor} hover:text-white bg-white border border-gray-200`
                        }`}
                      >
                        <div className={`p-1.5 rounded-full mr-3 ${isActive ? 'bg-white bg-opacity-20' : 'bg-gray-100'}`}>
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <span className="font-medium">{tab.name}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-10 border-t border-gray-300 text-center">
                  {/* Car Images Slideshow */}
                  <div className="flex justify-center items-center h-38 relative overflow-hidden">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-md">
                      <img
                        src="car1.png"
                        alt="Car 1"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                          currentCarImage === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                      />
                      <img
                        src="car2.png"
                        alt="Car 2"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                          currentCarImage === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                      />
                      <img
                        src="car3.png"
                        alt="Car 3"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                          currentCarImage === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center space-x-2 mt-2">
                    {[0, 1, 2].map((index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentCarImage(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentCarImage === index
                            ? 'bg-blue-500 scale-125'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-6">
                {/* Vehicle Loading Error */}
                {vehicleError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-10">
                    <div className="flex items-center">
                      <div className="text-red-600 mr-3">⚠️</div>
                      <div>
                        <p className="text-red-800 font-medium">Vehicle Loading Error</p>
                        <p className="text-red-700 text-sm">{vehicleError}</p>
                        <button 
                          onClick={fetchVehicleNumbers}
                          className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          disabled={isLoadingVehicles}
                        >
                          {isLoadingVehicles ? 'Retrying...' : 'Retry'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-2 bg-blue-50">
                    <form onSubmit={handleSubmit}>
                      {tabs.find(tab => tab.id === activeTab)?.content}

                      {/* Submit Button Centered */}
                      <div className="flex justify-center mt-6">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium text-white transition-all duration-300 transform hover:scale-105 ${
                            isSubmitting
                              ? 'bg-gray-400 cursor-not-allowed'
                              : `bg-gradient-to-r ${tabs.find(tab => tab.id === activeTab)?.color} shadow-lg hover:shadow-xl`
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-5 h-5" />
                              <span>Submit</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Duplicate Modal */}
        {showDuplicateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Vehicle Already Exists</h3>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 mb-2">
                    <strong>Vehicle Number:</strong> {duplicateVehicleInfo.vehicleNumber}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {duplicateVehicleInfo.message}
                  </p>
                </div>
                
                {duplicateVehicleInfo.existingData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 font-medium mb-2">Existing Vehicle Details:</p>
                    <div className="text-sm text-blue-700">
                      {duplicateVehicleInfo.existingData.vhtype && (
                        <p><strong>Type:</strong> {duplicateVehicleInfo.existingData.vhtype}</p>
                      )}
                      {duplicateVehicleInfo.existingData.vhcmpny && (
                        <p><strong>Company:</strong> {duplicateVehicleInfo.existingData.vhcmpny}</p>
                      )}
                      {duplicateVehicleInfo.existingData.vhmodel && (
                        <p><strong>Model:</strong> {duplicateVehicleInfo.existingData.vhmodel}</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleDuplicateModalClose}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
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
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Submission</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to submit this {activeTab} data? Please review all information before confirming.
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
                <div className="mb-2 flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce">
                      <Car className="w-10 h-10 text-white animate-pulse" />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">Success!</h3>
                
                <div className="flex justify-center space-x-2 mb-6">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                </div>

                <p className="text-gray-600 mb-4">
                  Your {activeTab} request has been submitted successfully.
                </p>
                <button
                  onClick={handleModalClose}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Creation1;