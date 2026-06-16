import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Car, Shield, ShieldCheck, FileText, Calendar, DollarSign, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Loader2, CreditCard, CheckCircle, Settings } from "lucide-react";
import { API_BASE_URL } from '../Config';

const EditRoadTaxPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the actual token from localStorage or your auth system
  const [userToken] = useState(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      return userInfo || { token: null };
    } catch (e) {
      console.error('Error parsing userInfo from localStorage:', e);
      return { token: null };
    }
  });

  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: '',
    company: '',
    vehicleModel: '',
    purchaseYear: '',
    user: '',
    driver: '',
    taxStartDate: '',
    taxRemainderDate: '',
    status: '',
    taxCost: '',
    description: '',
    reportType: '', // ADD THIS LINE
    taxFile: null,
    reportType:'',
  });

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // New state for tax cost editability conditions
  const [isTaxCostEditable, setIsTaxCostEditable] = useState(true);
  const [originalTaxCost, setOriginalTaxCost] = useState('');

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

  // Function to check tax cost editability based on conditions
  const checkTaxCostEditability = (vehicleData, currentTaxRemainderDate) => {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Condition 1: If tax cost value exists against vehicle number
    if (vehicleData.COST && parseFloat(vehicleData.COST) > 0) {
      // Condition 3: Check if tax remainder date is different from today
      if (currentTaxRemainderDate && currentTaxRemainderDate !== today) {
        setIsTaxCostEditable(true);
        // setTaxCostReason('Tax cost is editable because tax remainder date is different from today');
        return true;
      } else {
        setIsTaxCostEditable(false);
        // setTaxCostReason('Tax cost is not editable because value exists and tax remainder date is today');
        return false;
      }
    } else {
      // Condition 2: If tax cost value is not there, it's editable
      setIsTaxCostEditable(true);
      // setTaxCostReason('Tax cost is editable because no existing value found');
      return true;
    }
  };

  // Updated fetchVehicleData function with correct column mapping
  const fetchVehicleData = async (vehicleNumber) => {
    if (!vehicleNumber) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching road tax data for:', vehicleNumber);

      const response = await fetch(`${API_BASE_URL}getTaxChange`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken.token}`
        }
      });

      // console.log(userToken?.token,"token is null!");

      console.log('Road Tax Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('Road Tax Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text);
        throw new Error('Server returned non-JSON response');
      }

      const result = await response.json();
      console.log('Road Tax API Response:', result);

      if (result.status && result.data && Array.isArray(result.data)) {
        console.log('Road Tax data received:', result.data.length, 'records');

        const vehicleData = result.data.find(item =>
          item.VH_NUMBER === vehicleNumber ||
          item.VH_NUMBER?.toLowerCase() === vehicleNumber?.toLowerCase()
        );

        if (vehicleData) {
          console.log('Found road tax vehicle data:', vehicleData);

          // Store original tax cost
          setOriginalTaxCost(vehicleData.COST || '');

          // Map the API response to form data - FIXED column mapping
          const newFormData = {
            vehicleNumber: vehicleData.VH_NUMBER || '',
            vehicleType: vehicleData.VH_TYPE || '',
            company: vehicleData.VH_COMPANY || '',
            vehicleModel: vehicleData.VH_MODEL || '',
            purchaseYear: vehicleData.PUR_YEAR || '',
            user: vehicleData.VH_USER || '',
            driver: vehicleData.VH_DRIVER || '',
            taxStartDate: vehicleData.TAX_START_DATE || '',
            taxRemainderDate: vehicleData.TAX_REMAINDER_DATE || '',
            status: vehicleData.STATUS || '',
            taxCost: vehicleData.COST || '',
            description: vehicleData.DESCRIPTION || '',
            reportType: vehicleData.TAX_YR || '', // ADD THIS LINE
            taxFile: null,
             reportType:vehicleData.TAX_YR || '',
          };

          setFormData(newFormData);

          // Check tax cost editability
          checkTaxCostEditability(vehicleData, newFormData.taxRemainderDate);

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
      console.error('Error fetching road tax data:', err);
      setError(`Error fetching road tax data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes with special logic for tax remainder date
 const handleInputChange = (e) => {
  const { name, value, type, files } = e.target;

  setFormData(prev => {
    const newFormData = {
      ...prev,
      [name]: type === 'file' ? files[0] : value
    };

    // AUTO-CALCULATE TAX END DATE when start date or report type changes
    if (name === 'taxStartDate' || name === 'reportType') {
      const startDate = name === 'taxStartDate' ? value : prev.taxStartDate;
      const reportType = name === 'reportType' ? value : prev.reportType;
      
      if (startDate && reportType) {
        newFormData.taxRemainderDate = calculateEndDate(startDate, reportType);
      } else if (name === 'reportType' && !value) {
        // Clear end date if report type is cleared
        newFormData.taxRemainderDate = '';
      }
    }

    // If tax remainder date changes, re-check tax cost editability
    if (name === 'taxRemainderDate' || (name === 'reportType' && newFormData.taxRemainderDate)) {
      const today = new Date().toISOString().split('T')[0];
      const endDate = newFormData.taxRemainderDate;

      // Check if there's an original tax cost value
      if (originalTaxCost && parseFloat(originalTaxCost) > 0) {
        if (endDate !== today) {
          setIsTaxCostEditable(true);
        } else {
          setIsTaxCostEditable(false);
          // Reset tax cost to original value when not editable
          newFormData.taxCost = originalTaxCost;
        }
      } else {
        setIsTaxCostEditable(true);
      }
    }

    return newFormData;
  });
};

  // Modified handleSubmit to show confirmation modal first
  const handleSubmit = async () => {
    // Basic validation before showing confirmation
    if (!formData.vehicleNumber || !formData.taxStartDate) {
      setError('Please fill in all required fields (Vehicle Number, Tax Start Date)');
      return;
    }

    // If tax cost is editable but empty, require it
    if (isTaxCostEditable && (!formData.taxCost || formData.taxCost === '')) {
      setError('Please enter the tax cost');
      return;
    }

    setShowConfirmModal(true);
  };

  // Function to handle confirmed submission
 // Updated handleConfirmedSubmit function for EditRoadTaxPage.js

const handleConfirmedSubmit = async () => {
  setIsSubmitting(true);
  setError(null);

  try {
    // Create FormData for file uploads
    const formDataToSend = new FormData();

    // Add all form fields with EXACT field names expected by backend validation rules
    formDataToSend.append('vehicleNumber', formData.vehicleNumber);
    formDataToSend.append('vehicleType', formData.vehicleType);
    formDataToSend.append('company', formData.company);
    formDataToSend.append('vehicleModel', formData.vehicleModel);
    formDataToSend.append('purchaseYear', formData.purchaseYear);
    formDataToSend.append('user', formData.user);
    formDataToSend.append('driver', formData.driver);
    formDataToSend.append('taxStartDate', formData.taxStartDate);
    formDataToSend.append('taxRemainderDate', formData.taxRemainderDate);
    formDataToSend.append('status', formData.status);
 formDataToSend.append('reportType', formData.reportType);

    // Tax cost logic based on editability
    if (isTaxCostEditable) {
      formDataToSend.append('taxCost', formData.taxCost);
    } else {
      // Send the original cost when not editable
      formDataToSend.append('taxCost', originalTaxCost);
    }

    formDataToSend.append('description', formData.description);
    formDataToSend.append('reportType', formData.reportType || '');
    formDataToSend.append('isEditable', isTaxCostEditable ? 'true' : 'false');
    
    // IMPORTANT: Send original tax cost for comparison
    formDataToSend.append('originalTaxCost', originalTaxCost);

    // Add file if present
    if (formData.taxFile instanceof File) {
      formDataToSend.append('taxFile', formData.taxFile);
    }

    // Log the data being sent for debugging
    console.log('Road tax form data being sent:');
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await fetch(`${API_BASE_URL}updateTaxData`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken.token}`,
        'Accept': 'application/json',
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formDataToSend
    });
    
      // console.log(userToken?.token,"token is null!");

    const result = await response.json();
    console.log('Road tax update response:', result);

    if (!response.ok) {
      if (result.errors) {
        // Handle validation errors
        const errorMessages = Object.values(result.errors).flat().join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      } else {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
    }

    if (result.status) {
      setSuccessMessage(result.message || 'Road tax data updated successfully!');
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } else {
      setShowConfirmModal(false);
      throw new Error(result.message || 'Failed to update road tax data');
    }

  } catch (error) {
    console.error('Error updating road tax data:', error);
    setShowConfirmModal(false);
    setError(`Error updating road tax data: ${error.message}`);
  } finally {
    setIsSubmitting(false);
  }
};
const calculateEndDate = (startDate, reportType) => {
  if (!startDate || !reportType) return '';
  
  const start = new Date(startDate);
  let endDate = new Date(start);
  
  switch (reportType) {
    case 'quarterly':
      // Add 3 months
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'half-yearly':
      // Add 6 months
      endDate.setMonth(endDate.getMonth() + 6);
      break;
    case 'yearly':
      // Add 1 year
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      return '';
  }
  
  // Format as YYYY-MM-DD for input field
  return endDate.toISOString().split('T')[0];
};

  // Effect to load data when component mounts
  useEffect(() => {
    if (location.state) {
      const { vehicleNumber, vehicleData, editMode } = location.state;

      console.log('Received navigation state:', { vehicleNumber, vehicleData, editMode });

      if (editMode && vehicleNumber) {
        fetchVehicleData(vehicleNumber);
      } else if (vehicleData) {
        // Map incoming data to road tax structure
        const mappedData = {
          vehicleNumber: vehicleData.vehicleNo || '',
          vehicleType: vehicleData.vehicleType || '',
          company: vehicleData.company || '',
          vehicleModel: vehicleData.vehicleModel || '',
          purchaseYear: vehicleData.purchaseYear || '',
          user: vehicleData.user || '',
          driver: vehicleData.driverName || '',
          taxStartDate: vehicleData.taxStartDate || '',
          taxRemainderDate: vehicleData.taxRemainderDate || '',
          status: vehicleData.status || '',
          taxCost: vehicleData.cost || '',
          description: vehicleData.description || '',
          reportType: vehicleData.reportType || '', // ADD THIS LINE
   taxFile: vehicleData.taxFile || '',

        };

        setFormData(mappedData);
        setOriginalTaxCost(vehicleData.cost || '');

        // Check editability for passed data
        checkTaxCostEditability({ COST: vehicleData.cost }, mappedData.taxRemainderDate);
      }
    }
  }, [location.state]);

  // Compressed styling
  const inputStyle = "w-full border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";
  const highlightedInputStyle = "w-full border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";
  const nonEditableInputStyle = "w-full border border-gray-400 rounded-full px-2 py-1 text-sm bg-gray-100 cursor-not-allowed";

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
                    {formData.vehicleNumber ? `Edit Road Tax - ${formData.vehicleNumber}` : 'Road Tax Change Tab'}
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
                    src="car3.png"
                    alt="Road tax management illustration"
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
                      readOnly
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

                  {/* Purchase Year */}
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

                  {/* User/Dept */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      User/Dept<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="user"
                      value={formData.user}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* All Form Fields Section */}
              <div className="mx-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Driver Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="driver"
                      value={formData.driver}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                      placeholder="Enter driver name"
                    />
                  </div>

                  {/* Tax Start Date */}
                   <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Tax Start Date<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="taxStartDate"
                      value={formData.taxStartDate}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                      required
                    />
                  </div>


                     <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Tax End Date<span className="text-gray-500 ml-1">(Auto-calculated)</span>
                    </label>
                    <input
                      type="date"
                      name="taxRemainderDate"
                      value={formData.taxRemainderDate}
                      onChange={handleInputChange}
                      className={`${highlightedInputStyle} bg-blue-50`}
                      readOnly
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Tax Status<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                    >
                      <option value="">Select Status</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>

                  {/* Tax Cost - WITH CONDITIONAL EDITABILITY */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Tax Cost
                      {isTaxCostEditable && <span className="text-red-500 ml-1">*</span>}
                      {!isTaxCostEditable && <span className="text-gray-500 ml-1">(Non-editable)</span>}
                    </label>
                    <input
                      type="number"
                      name="taxCost"
                      value={formData.taxCost}
                      onChange={handleInputChange}
                      className={isTaxCostEditable ? highlightedInputStyle : nonEditableInputStyle}
                      placeholder={isTaxCostEditable ? "Enter tax cost" : "Not editable"}
                      step="0.01"
                      min="0"
                      required={isTaxCostEditable}
                      readOnly={!isTaxCostEditable}
                      disabled={!isTaxCostEditable}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Description<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                      placeholder="Enter description"
                    />
                  </div>

                  {/* Tax File */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Tax Document
                    </label>
                    <input
                      type="file"
                      name="taxFile"
                      onChange={handleInputChange}
                      className={`${highlightedInputStyle} text-xs`}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
   <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Select Tax Time Type<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="reportType"
                      value={formData.reportType}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                      required
                    >
                      <option value="">-- Select --</option>
                      <option value="quarterly">Quarterly (3 months)</option>
                      <option value="half-yearly">Half Yearly (6 months)</option>
                      <option value="yearly">One Year</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || isSubmitting}
                  className="bg-gradient-to-r from-green-800 via-green-500 to-green-600 text-white px-8 py-2 rounded-full hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isSubmitting ? 'Updating...' : 'Loading...'}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Update Road Tax
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
                <Settings className="w-16 h-16 text-blue-500" />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Confirm Road Tax Update
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to update the road tax information for vehicle {formData.vehicleNumber}?
              </p>

              <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-500">
                <CreditCard className="w-4 h-4" />
                <span>Tax Cost: {isTaxCostEditable ? `₹${formData.taxCost}` : 'Not editable'}</span>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleConfirmModalClose}
                  className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmedSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirm Update
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
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
                Road Tax Updated Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                {successMessage}
              </p>

              <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-500">
                <CreditCard className="w-4 h-4" />
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

export default EditRoadTaxPage;