import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bike, Shield, ShieldCheck, FileText, Calendar, DollarSign, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Loader2, CreditCard, CheckCircle, Settings, Eye, Download } from "lucide-react";
import axios from "axios";
import { API_BASE_URL, FILE_PATH } from '../Config';

const EditTwoWheeler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    fuel: '',
    company: '',
    companyplant: '',
    user: '',
    empid: '', 
    regDate: '',
    validDate: '',
    year: '',
    status: '',
    mobile: '',
    cost: '',
    date: '',
    rcFile: null,
    currentRcFile: '', // To store the current RC file path/name
    rcFileUrl: '', 
    inssDate:'',
    inedate:'',
    insFile: null, // Changed from 'insfile' to 'insFile' to match form field name
    currentInsFile: '',
    insamt: '', // Current/New insurance amount
    prevInsAmt: '', // Previous insurance amount (read-only)
    prevCost: '' // Previous cost (read-only)
  });
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // State for existing insurance records
  const [existingInsuranceRecords, setExistingInsuranceRecords] = useState([]);
  const [insuranceValidationError, setInsuranceValidationError] = useState('');
  
  // New state for insurance amount editability
  const [isInsuranceAmountEditable, setIsInsuranceAmountEditable] = useState(true);
  const [shouldShowPrevInsAmt, setShouldShowPrevInsAmt] = useState(false);

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

  // Function to format date from dd-mm-yyyy to yyyy-mm-dd for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      // If it's already in yyyy-mm-dd format, return as is
      if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
        return dateString;
      }
      // If it's in dd-mm-yyyy format, convert to yyyy-mm-dd
      if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
      }
      return dateString;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Function to check if insurance amount should be editable
  const checkInsuranceAmountEditability = (vehicleData, records) => {
    console.log('Checking insurance amount editability:', { vehicleData, records });
    
    // Check if vehicle has any existing insurance amount
    const hasExistingInsAmt = vehicleData && vehicleData.INS_AMT && vehicleData.INS_AMT.toString().trim() !== '';
    
    console.log('Has existing insurance amount:', hasExistingInsAmt, 'Value:', vehicleData?.INS_AMT);
    
    // If no insurance amount exists for this vehicle, make field editable
    if (!hasExistingInsAmt) {
      console.log('No existing insurance amount - field is editable');
      setIsInsuranceAmountEditable(true);
      setShouldShowPrevInsAmt(false);
      setFormData(prev => ({
        ...prev,
        insamt: '', // Clear any previous value
        prevInsAmt: ''
      }));
      return;
    }

    // If insurance amount exists, check if it should be editable based on end date
    const insEndDate = vehicleData.INS_END;
    
    if (insEndDate) {
      const endDate = new Date(formatDateForInput(insEndDate));
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      const dayAfterEndDate = new Date(endDate);
      dayAfterEndDate.setDate(dayAfterEndDate.getDate() + 1);
      dayAfterEndDate.setHours(0, 0, 0, 0);

      console.log('Insurance end date:', endDate);
      console.log('Today:', today);
      console.log('Day after end date:', dayAfterEndDate);

      // Insurance amount is editable if today is after the insurance end date
      const isEditable = today >= dayAfterEndDate;
      
      console.log('Is insurance amount editable based on date?', isEditable);
      
      setIsInsuranceAmountEditable(isEditable);
      setShouldShowPrevInsAmt(true);
      
      // Set the current insurance amount as non-editable display value
      setFormData(prev => ({
        ...prev,
        prevInsAmt: vehicleData.INS_AMT || '',
        insamt: isEditable ? '' : vehicleData.INS_AMT || ''
      }));
    } else {
      // If no end date, assume not editable since insurance amount exists
      console.log('Insurance amount exists but no end date - making non-editable');
      setIsInsuranceAmountEditable(false);
      setShouldShowPrevInsAmt(true);
      setFormData(prev => ({
        ...prev,
        prevInsAmt: vehicleData.INS_AMT || '',
        insamt: vehicleData.INS_AMT || ''
      }));
    }
  };

  // Function to fetch existing insurance records for the vehicle
  const fetchExistingInsuranceRecords = async (vehicleNumber, vehicleData) => {
    if (!vehicleNumber) return;
    
    console.log('Fetching insurance records for vehicle:', vehicleNumber);
    console.log('Vehicle data:', vehicleData);
    
    // First, check editability based on vehicle data (which contains current insurance info)
    checkInsuranceAmountEditability(vehicleData, []);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}getInsuranceHistory/${vehicleNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${userToken.token}`,
            'Accept': 'application/json',
          }
        }
      );
      
      if (response.data && response.data.data) {
        const records = response.data.data;
        setExistingInsuranceRecords(records);
        console.log('Existing insurance records from API:', records);
      } else {
        setExistingInsuranceRecords([]);
      }
    } catch (error) {
      console.error('Error fetching insurance records:', error);
      setExistingInsuranceRecords([]);
    }
  };

  // Function to validate insurance date overlap
  const validateInsuranceDates = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    
    // Check if end date is after start date
    if (newEnd <= newStart) {
      setInsuranceValidationError('Insurance end date must be after start date');
      return false;
    }
    
    // Get the latest end date from existing records
    let latestEndDate = null;
    
    existingInsuranceRecords.forEach(record => {
      const recordEndDate = new Date(record.end_date || record.INS_END);
      if (!latestEndDate || recordEndDate > latestEndDate) {
        latestEndDate = recordEndDate;
      }
    });
    
    // If there are existing records, new start date should be after the latest end date
    if (latestEndDate && newStart <= latestEndDate) {
      const nextValidDate = new Date(latestEndDate);
      nextValidDate.setDate(nextValidDate.getDate() + 1);
      
      setInsuranceValidationError(
        `Insurance start date must be after ${latestEndDate.toLocaleDateString('en-GB')}. ` +
        `Next valid start date: ${nextValidDate.toLocaleDateString('en-GB')}`
      );
      return false;
    }
    
    setInsuranceValidationError('');
    return true;
  };

  // Function to get minimum allowed start date
  const getMinStartDate = () => {
    if (existingInsuranceRecords.length === 0) return '';
    
    let latestEndDate = null;
    existingInsuranceRecords.forEach(record => {
      const recordEndDate = new Date(record.end_date || record.INS_END);
      if (!latestEndDate || recordEndDate > latestEndDate) {
        latestEndDate = recordEndDate;
      }
    });
    
    if (latestEndDate) {
      const nextValidDate = new Date(latestEndDate);
      nextValidDate.setDate(nextValidDate.getDate() + 1);
      return nextValidDate.toISOString().split('T')[0];
    }
    
    return '';
  };

  // Function to handle RC file view/download
  const handleRcFileView = (filePath) => {
    if (!filePath) {
      alert('No file path provided');
      return;
    }
    else if (formData.currentRcFile) {
    const url = `${FILE_PATH}public/storage/${formData.currentRcFile}`;
    window.open(url, '_blank');
    }
  };
  
  const handleInsFileView = (filePath) => {
    if (!filePath) {
      alert('No file path provided');
      return;
    }
    else if (formData.currentInsFile) {
    const url = `${FILE_PATH}public/storage/${formData.currentInsFile}`;
    window.open(url, '_blank');
    }
  };

  // Function to get file name from path
  const getFileName = (filePath) => {
    if (!filePath) return '';
    return filePath.split('/').pop() || filePath;
  };

  // Effect to load data when component mounts
  useEffect(() => {
    if (location.state) {
      const { vehicleData, vehicleNumber } = location.state;
      
      console.log('Received navigation state:', location.state);
      
      if (vehicleData) {
        // Map the data from TwoWheelerChange to the form fields
        setFormData(prev => ({
          ...prev,
          vehicleNumber: vehicleData.VH_NUMBER || vehicleNumber || '',
          fuel: vehicleData.FUEL || '',
          company: vehicleData.VH_COMPANY || '',
          companyplant: vehicleData.VH_LOC || '',
          user: vehicleData.VH_USER || '',
          empid: vehicleData.EMP_ID || '',
          regDate: formatDateForInput(vehicleData.REG_DT) || '',
          validDate: formatDateForInput(vehicleData.VALID_DT) || '',
          status: vehicleData.STATUS || '',
          mobile: vehicleData.MOBILE || '',
          cost: '',  // Reset cost field for new entry
          prevCost: vehicleData.COST || '', // Store previous cost as read-only
          insamt: '', // Reset insurance amount field for new entry
          prevInsAmt: vehicleData.INS_AMT || '', // Store previous insurance amount as read-only
          date: formatDateForInput(vehicleData.DATE) || '',
          year: formatDateForInput(vehicleData.PUR_YEAR) || '',
          currentRcFile: vehicleData.RC_FILE_PATH || '',
          rcFileUrl: vehicleData.RC_FILE_URL || '',
          inedate: formatDateForInput(vehicleData.INS_END) || '',
          inssDate: formatDateForInput(vehicleData.INS_START) || '',
          currentInsFile: vehicleData.INS_FILE || '',
        }));
        
        // Fetch existing insurance records for this vehicle
        fetchExistingInsuranceRecords(vehicleData.VH_NUMBER || vehicleNumber, vehicleData);
        
        console.log('Form data set with previous values:', {
          prevInsAmt: vehicleData.INS_AMT || '',
          prevCost: vehicleData.COST || '',
          insamt: '', // New field empty
          cost: '' // New field empty
        });
      }
    }
  }, [location.state]);

  // Effect to check editability when insurance end date changes
  useEffect(() => {
    // Re-check editability when insurance end date changes, but only if we have vehicle data
    if (formData.inedate && location.state?.vehicleData) {
      checkInsuranceAmountEditability(location.state.vehicleData, existingInsuranceRecords);
    }
  }, [formData.inedate]);

  // Modified handleSubmit to show confirmation modal first
  const handleSubmit = async () => {
    // Basic validation before showing confirmation
    if (!formData.vehicleNumber || !formData.regDate) {
      setError('Please fill in all required fields (Vehicle Number, Date of Registration)');
      return;
    }

    // Validate insurance dates
    if (formData.inssDate && formData.inedate) {
      const isValid = validateInsuranceDates(formData.inssDate, formData.inedate);
      if (!isValid) {
        setError(insuranceValidationError);
        return;
      }
    }

    // Additional validation based on status
    if (formData.status === 'active' && !formData.date) {
      setError('Please select Date for active status');
      return;
    }

    if ((formData.status === 'scrap' || formData.status === 'sold') && (!formData.date || !formData.cost)) {
      setError(`Please fill in Date and Cost for ${formData.status} status`);
      return;
    }
    
    setShowConfirmModal(true);
  };

  // Function to handle confirmed submission
  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add all form fields with field names expected by backend
      formDataToSend.append('VH_NUMBER', formData.vehicleNumber);
      formDataToSend.append('FUEL', formData.fuel);
      formDataToSend.append('VH_COMPANY', formData.company);
      formDataToSend.append('VH_LOC', formData.companyplant);
      formDataToSend.append('VH_USER', formData.user);
      formDataToSend.append('EMP_ID', formData.empid);
      formDataToSend.append('REG_DT', formData.regDate);
      formDataToSend.append('VALID_DT', formData.validDate);
      formDataToSend.append('STATUS', formData.status);
      formDataToSend.append('MOBILE', formData.mobile);
      formDataToSend.append('INS_END', formData.inedate);
      formDataToSend.append('INS_START', formData.inssDate);
      formDataToSend.append('PUR_YEAR', formData.year);
      
      // Only send the new insurance amount if it has a value and is editable
      if (formData.insamt && formData.insamt.trim() !== '' && isInsuranceAmountEditable) {
        formDataToSend.append('INS_AMT', formData.insamt);
      }
      
      // Add S_DATE and COST based on status - only send new cost if it has a value
      if (formData.status === 'active' && formData.date) {
        formDataToSend.append('S_DATE', formData.date);
      } else if ((formData.status === 'scrap' || formData.status === 'sold') && formData.date) {
        formDataToSend.append('S_DATE', formData.date);
        if (formData.cost && formData.cost.trim() !== '') {
          formDataToSend.append('COST', formData.cost);
        }
      }
      
      // Add RC file if present
      if (formData.rcFile instanceof File) {
        formDataToSend.append('RC_FILE_PATH', formData.rcFile);
      }
      
      // Add Insurance file if present
      if (formData.insFile instanceof File) {
        formDataToSend.append('INS_FILE', formData.insFile);
      }
      
      // Log the data being sent for debugging
      console.log('Two wheeler form data being sent:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      const response = await fetch(`${API_BASE_URL}updatetwo_wheeler`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken.token}`,
          'Accept': 'application/json',
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formDataToSend
      });
      
      const result = await response.json();
      console.log('Two wheeler update response:', result);
      
      if (!response.ok) {
        if (result.errors) {
          // Handle validation errors
          const errorMessages = Object.values(result.errors).flat().join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        } else {
          throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }
      }
      
      if (result.message) {
        setSuccessMessage(result.message || 'Two wheeler data updated successfully!');
        setShowConfirmModal(false);
        setShowSuccessModal(true);
      } else {
        setShowConfirmModal(false);
        throw new Error(result.error || 'Failed to update two wheeler data');
      }
      
    } catch (error) {
      console.error('Error updating two wheeler data:', error);
      setShowConfirmModal(false);
      setError(`Error updating two wheeler data: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));

    // Clear insurance validation error when user changes dates
    if (name === 'inssDate' || name === 'inedate') {
      setInsuranceValidationError('');
      setError(null);
      
      // Real-time validation for insurance dates
      if (name === 'inssDate' && formData.inedate) {
        validateInsuranceDates(value, formData.inedate);
      } else if (name === 'inedate' && formData.inssDate) {
        validateInsuranceDates(formData.inssDate, value);
        
        // Check if insurance amount should be editable based on new end date
        if (value) {
          checkInsuranceAmountEditability(existingInsuranceRecords, value);
        }
      }
    }
  };

  // Function to render conditional fields based on status
  const renderConditionalFields = () => {
    if (!formData.status) return null;

    switch (formData.status) {
      case 'active':
        return (
          <div>
            <label className="block text-indigo-800 font-bold text-xs mb-0.5">
              Date<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={highlightedInputStyle}
              required
            />
          </div>
        );
      
      case 'scrap':
      case 'sold':
        return (
          <>
            <div>
              <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                Date<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={highlightedInputStyle}
                required
              />
            </div>
            {/* Previous Cost (Read-only) */}
            <div>
              <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                Previous Cost
              </label>
              <input
                type="number"
                name="prevCost"
                value={formData.prevCost}
                className={`${highlightedInputStyle} bg-gray-200 cursor-not-allowed`}
                placeholder="Previous cost"
                readOnly
              />
            </div>
            {/* New Cost (Editable) */}
            <div>
              <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                Cost<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                className={highlightedInputStyle}
                placeholder="Enter new cost"
                required
              />
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  // Compressed styling
  const inputStyle = "w-full border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";
  const highlightedInputStyle = "w-full  text-s text-gray-700 border border-blue-300 rounded-full cursor-pointer focus:outline-none py-1 px-2 flex-1";

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
                    {formData.vehicleNumber ? `Edit Two Wheeler - ${formData.vehicleNumber}` : 'Two Wheeler Change Tab'}
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
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* {insuranceValidationError && (
            <div className="p-4 mx-4 mt-4 bg-orange-100 border border-orange-400 text-orange-700 rounded">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>{insuranceValidationError}</p>
              </div>
            </div>
          )}

          {!isInsuranceAmountEditable && formData.insamt && (
            <div className="p-4 mx-4 mt-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>Insurance amount is saved and not editable until the current insurance period expires.</p>
              </div>
            </div>
          )} */}

          {loading && (
            <div className="p-4 mx-4 mt-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
              <div className="flex items-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <p>Loading vehicle data...</p>
              </div>
            </div>
          )}

          <div className="p-2">
            <div>
              {/* Top Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                {/* Image Section */}
                <div className="flex justify-center">
                  <img
                    src="bike1.png"
                    alt="Vehicle maintenance illustration"
                    className="max-w-full max-h-48 mb-3 mt-8 ml-28 rounded-lg"
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
                      className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
                      placeholder="Enter vehicle number"
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
                      className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
                      placeholder="Enter company"
                      readOnly
                    />
                  </div>

                  {/* Fuel Type */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Fuel Type<span className="text-red-200 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="fuel"
                      value={formData.fuel}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
                      readOnly
                    />
                  </div>

                   <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                     Purchase Year<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
                      readOnly
                    />
                  </div>

                  {/* Company & Plant */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Company & Plant<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyplant"
                      value={formData.companyplant}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
                      placeholder=""
                      readOnly
                    />
                  </div>

                  {/* Date of Registration */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Date of Reg<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="regDate"
                      value={formData.regDate}
                      onChange={handleInputChange}
                      className={`${inputStyle} `}
                    />
                  </div>

                  {/* Date of Valid */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                     Date of Valid<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="validDate"
                      value={formData.validDate}
                      onChange={handleInputChange}
                      className={`${inputStyle} `}
                    />
                  </div>

                  {/* RC File with Current File Display */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                     RC<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex-1 flex items-center gap-2">
                      {formData.currentRcFile && (
                        <div className="flex items-center gap-2 flex-1">
                          <div 
                            className="flex items-center gap-1 bg-blue-50 border border-blue-300 rounded-full px-3 py-1 text-sm text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors"
                            onClick={handleRcFileView}
                          >
                            <FileText className="w-4 h-4" />
                            <span className="truncate max-w-32">
                              {getFileName(formData.currentRcFile)}
                            </span>
                            <Eye className="w-4 h-4 ml-1" />
                          </div>
                          <input
                            type="file"
                            name="rcFile"
                            onChange={handleInputChange}
                            className="text-xs text-blue-600 file:mr-1 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            accept=".pdf,.jpg,.jpeg,.png"
                            title="Upload new RC file"
                          />
                        </div>
                      )}
                      {!formData.currentRcFile && (
                        <input
                          type="file"
                          name="rcFile"
                          onChange={handleInputChange}    
                          className={`${inputStyle} `}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* All Form Fields Section */}
              <div className="mx-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">

                   <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                     User/Dept<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="user"
                      value={formData.user}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                      required
                    />
                  </div>
                  
                  {/* Emp ID */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                       Emp ID<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="empid"
                      value={formData.empid}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Mobile NO<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="mobile"
                       value={formData.mobile}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                    />
                  </div>
                  
                  {/* Insurance Start Date with validation */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                     Insurance Start Date<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="inssDate"
                      value={formData.inssDate}
                      onChange={handleInputChange}
                      className={`${highlightedInputStyle} ${insuranceValidationError ? 'border-red-500' : ''}`}
                      min={getMinStartDate()}
                      required
                      title={getMinStartDate() ? `Minimum date: ${getMinStartDate()}` : ''}
                    />
                    
                  </div>
                  
                  {/* Insurance End Date */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Insurance End Date<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="inedate"
                      value={formData.inedate}
                      onChange={handleInputChange}
                      className={`${highlightedInputStyle} ${insuranceValidationError ? 'border-red-500' : ''}`}
                      min={formData.inssDate || undefined}
                      required
                    />
                  </div>

                  {/* Insurance File with Current File Display */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Insurance File<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {formData.currentInsFile && (
                        <div className="flex items-center gap-2 flex-1">
                          <div 
                            className="flex items-center gap-1 bg-blue-50 border border-blue-300 rounded-full px-3 py-1 text-sm text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors"
                            onClick={handleInsFileView}
                          >
                            <FileText className="w-4 h-4" />
                            <span className="truncate max-w-32">
                              {getFileName(formData.currentInsFile)}
                            </span>
                            <Eye className="w-4 h-4 ml-1" />
                          </div>
                          <input
                            type="file"
                            name="insFile"
                            onChange={handleInputChange}
                            className="text-xs text-blue-600 file:mr-1 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            accept=".pdf,.jpg,.jpeg,.png"
                            title="Upload new insurance file"
                          />
                        </div>
                      )}
                      {!formData.currentInsFile && (
                        <input
                          type="file"
                          name="insFile"
                          onChange={handleInputChange}    
                          className={`${inputStyle} `}
                          accept=".pdf,.jpg,.jpeg,.png"
                          title="Upload insurance file"
                        />
                      )}
                    </div>
                  </div>

                  {/* Premium Insurance Amount - Show only one field based on editability */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      {isInsuranceAmountEditable ? "Premium Insurance Amount" : "Insurance Amount"}<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="insamt"
                      value={formData.insamt}
                      onChange={handleInputChange}
                      className={`${highlightedInputStyle} ${!isInsuranceAmountEditable ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                      placeholder={isInsuranceAmountEditable ? "Enter premium insurance amount" : "Current insurance amount"}
                      readOnly={!isInsuranceAmountEditable}
                      disabled={!isInsuranceAmountEditable}
                    />
                  </div>
                  
                  {/* Status */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                     Status<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                    >
                      <option value="">Select Status</option>
                      <option value="active">Active</option>
                      <option value="scrap">Scrap</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>

                  {/* Conditional Fields Based on Status */}
                  {renderConditionalFields()}
                </div>

               
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || isSubmitting || !!insuranceValidationError}
                  className="bg-gradient-to-r from-green-800 via-green-500 to-green-600 text-white px-8 py-2 rounded-full hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isSubmitting ? 'Updating...' : 'Loading...'}
                    </>
                  ) : (
                    <>
                      <Bike className="w-4 h-4" />
                      Update Two Wheeler
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
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bike className="w-8 h-8 text-white" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Two Wheeler Update</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to update this two wheeler data?
              </p>
              
              {formData.inssDate && formData.inedate && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">
                    <strong>Insurance Period:</strong><br/>
                    {new Date(formData.inssDate).toLocaleDateString('en-GB')} to {new Date(formData.inedate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              )}
             
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition-all duration-200 disabled:opacity-50"
                >
                  No, Cancel
                </button>

                <button
                  onClick={handleConfirmedSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Bike className="w-4 h-4" />
                      <span>Yes, Update</span>
                    </>
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
              <div className="mb-3 flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-ping opacity-25"></div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Two Wheeler Updated Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                {successMessage}
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-500">
                <Bike className="w-4 h-4" />
                <span>Vehicle: {formData.vehicleNumber}</span>
              </div>
              
              <button
                onClick={handleSuccessModalClose}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <CheckCircle className="w-4 h-4" />
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTwoWheeler;