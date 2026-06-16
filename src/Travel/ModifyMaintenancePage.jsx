import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Car, Shield, ShieldCheck, FileText, Calendar, DollarSign, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Loader2, Wrench, CheckCircle, Settings } from "lucide-react";
import axios from 'axios';
import { API_BASE_URL } from '../Config';

const ModifyMaintenancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  
const [formData, setFormData] = useState({
  vehicleNumber: '',
  vehicleType: '',
  company: '',
  vehicleModel: '',
  purchaseYear: '',
  user: '',
  drivername: '',
  rc: '',
  serviceDate: '',
  statusMain: '',
  costMain: '',           // New cost entry (editable)
  prevCost: '',           // Previous cost (read-only, grayed out)
  descMain: '',
  vendorName: '',
  maintFile: null,
  claimStatus: '',
  claimAmt: '',          // New claim amount entry (editable)
  prevClaimAmt: '',      // Previous claim amount (read-only, grayed out)
  claimDt: '',
  
});
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  // Updated fetchVehicleData function to match new API structure
  const fetchVehicleData = async (vehicleNumber) => {
    if (!vehicleNumber) {
      setError('No vehicle number provided');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching vehicle data for:', vehicleNumber);
      
      const response = await fetch(`${API_BASE_URL}getMaintChange`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken.token || ''}`
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
          setFormData(prev => ({
            ...prev,
            vehicleNumber: vehicleData.VH_NUMBER || '',
            vehicleType: vehicleData.VH_TYPE || '',
            company: vehicleData.VH_COMPANY || '',
            vehicleModel: vehicleData.VH_MODEL || '',
            purchaseYear: vehicleData.PUR_YEAR || '',
            user: vehicleData.VH_USER || '',
            serviceDate: vehicleData.SERVICE_DATE || '',
            statusMain: vehicleData.STATUS_MAIN || '',

            // New entry fields (editable - start empty)
            costMain: '',
            claimAmt: '',

            // Previous values for display only (read-only, grayed out)
            prevCost: vehicleData.COST_MAIN || vehicleData.TOTAL_MAINT_COST || 0,
            prevClaimAmt: vehicleData.CLAIM_AMT || vehicleData.TOTAL_CLAIM_AMT || 0,

            descMain: vehicleData.DESC_MAIN || '',
            vendorName: vehicleData.VENDOR_NAME || '',
            claimStatus: vehicleData.CLAIM_STATUS || '',
            claimDt: vehicleData.CLAIM_DT || '',
          
            maintFile: null
          }));

          console.log('Vehicle data loaded successfully for:', vehicleNumber);
          setError(null);
        } else {
          console.error('Vehicle not found:', vehicleNumber);
          setError(`Vehicle with number "${vehicleNumber}" not found in the database.`);
        }
      } else if (result.message) {
        setError(`API Error: ${result.message}`);
      } else {
        console.error('Invalid response structure:', result);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
      if (err.message.includes('401')) {
        setError('Authentication failed. Please login again.');
      } else if (err.message.includes('403')) {
        setError('Access denied. You do not have permission to view this data.');
      } else if (err.message.includes('404')) {
        setError('Vehicle data not found.');
      } else if (err.message.includes('500')) {
        setError('Server error. Please try again later.');
      } else {
        setError(`Error loading vehicle data: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Validation function
  const validateForm = () => {
    const errors = [];
    
    if (!formData.vehicleNumber) errors.push('Vehicle Number is required');
    if (!formData.serviceDate) errors.push('Service Date is required');
    if (!formData.statusMain) errors.push('Maintenance Status is required');
    if (!formData.costMain || formData.costMain <= 0) errors.push('Valid Maintenance Cost is required');
    if (!formData.descMain) errors.push('Description is required');
    if (!formData.vendorName) errors.push('Vendor Name is required');
    if (!formData.claimStatus) errors.push('Claim Status is required');
    
    return errors;
  };

  // Modified handleSubmit to show confirmation modal first
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError('Please fill in all required fields:\n' + validationErrors.join('\n'));
      return;
    }
    setError(null);
    setShowConfirmModal(true);
  };

  // Function to handle confirmed submission
  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);
    
    try {
      const formDataToSend = new FormData();

      // Required fields (backend expects exact names)
      formDataToSend.append('vehicleNumber', formData.vehicleNumber);
      formDataToSend.append('serviceDate', formData.serviceDate);
      formDataToSend.append('maintStatus', formData.statusMain);
      formDataToSend.append('maintCost', formData.costMain);
      formDataToSend.append('maintDesc', formData.descMain);
      formDataToSend.append('vendorName', formData.vendorName);
      formDataToSend.append('claimStatus', formData.claimStatus);

      // Optional fields (only if filled)
      if (formData.claimAmt) {
        formDataToSend.append('claimAmount', formData.claimAmt);
      }
      if (formData.claimDt) {
        formDataToSend.append('claimDate', formData.claimDt);
      }
      if (formData.maintFile) {
        formDataToSend.append('maintFile', formData.maintFile);
      }

      // ❌ DO NOT append prevCost / prevClaimAmt - they are display-only fields

      const response = await axios.post(
       `${API_BASE_URL}ModifyMaintData`,
        formDataToSend,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${userToken.token}`
          },
        }
      );

      if (response.data.status) {
        setSuccessMessage('Maintenance data updated successfully!');
        setShowSuccessModal(true);
        
        // Reset only the editable fields after saving, keep prev values for display
        setFormData((prev) => ({
          ...prev,
          costMain: '',
          claimAmt: '',
          // Update previous values if backend returns new totals
          prevCost: response.data.data?.total_maint_cost || prev.prevCost,
          prevClaimAmt: response.data.data?.total_claim_amount || prev.prevClaimAmt,
        }));
      } else {
        setError('Update failed: ' + response.data.message);
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('An error occurred while saving: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effect to load data when component mounts
  useEffect(() => {
    const initializeData = async () => {
      // Get vehicle number from location state
      const vehicleNumber = location.state?.vehicleNumber || location.state?.vehicleId;
      
      if (!vehicleNumber) {
        console.log('No vehicle number provided in location state');
        setError('No vehicle selected for maintenance modification');
        return;
      }

      console.log('Initializing data for vehicle:', vehicleNumber);

      try {
        // First, try to fetch vehicle data using the existing fetchVehicleData function
        await fetchVehicleData(vehicleNumber);
      } catch (err) {
        console.error("Error initializing maintenance data:", err);
        setError("Error loading maintenance data: " + err.message);
      }
    };

    initializeData();
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // Prevent editing of previous cost and previous claim amount
    if (name === 'prevCost' || name === 'prevClaimAmt') {
      return; // Do nothing - these fields should not be editable
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  // Compressed styling
  const inputStyle = "w-full border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";
  const highlightedInputStyle = "w-full border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";
  const readOnlyStyle = "w-full border border-gray-300 rounded-full px-2 py-1 text-sm bg-gray-100 text-gray-600 cursor-not-allowed";

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
                    {formData.vehicleNumber ? `Modify Maintenance - ${formData.vehicleNumber}` : 'Maintenance Change Tab'}
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
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Error:</strong>
                  <div className="mt-1 whitespace-pre-line">{error}</div>
                </div>
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
                    src="car2.png"
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
                      className={readOnlyStyle}
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
                      className={readOnlyStyle}
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
                      className={readOnlyStyle}
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
                      className={readOnlyStyle}
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
                      className={readOnlyStyle}
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
                      className={readOnlyStyle}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* All Form Fields Section */}
              <div className="mx-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  
                  {/* Service Date */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Service Date<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="serviceDate"
                      value={formData.serviceDate}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                    />
                  </div>
                   {/* Status */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Status<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="statusMain"
                      value={formData.statusMain}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                    >
                      <option value="">Select Status</option>
                      <option value="Repair">Repair</option>
                      <option value="Service">Service</option>
                      <option value="Accidental Repair">Accidental Repair</option>
                    </select>
                  </div>

                  {/* Previous Cost (Read-only, Grayed out) */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Previous Cost
                    </label>
                    <input
                      type="number"
                      name="prevCost"
                      value={formData.prevCost}
                      readOnly
                      className={readOnlyStyle}
                      placeholder="0.00"
                    />
                  </div>
                  


                  {/* New Cost (Editable) */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Total Amount<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="costMain"
                     
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                      placeholder="Enter new cost"
                      min="0"
                      step="0.01"
                    />
                  </div>

                 
                  {/* Description */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Description<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="descMain"
                      value={formData.descMain}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                      placeholder="Enter description"
                      maxLength="1000"
                    />
                  </div>

                  {/* Vendor Name */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Vendor Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="vendorName"
                      value={formData.vendorName}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                      placeholder="Enter vendor name"
                    />
                  </div>

                  {/* Claim Status */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Claimed Status<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="claimStatus"
                      value={formData.claimStatus}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                    >
                      <option value="">Select Claim Status</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* Previous Claimed Amount (Read-only, Grayed out) */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Previous Claimed Amount
                    </label>
                    <input
                      type="number"
                      name="prevClaimAmt"
                      value={formData.prevClaimAmt}
                      readOnly
                      className={readOnlyStyle}
                      placeholder="0.00"
                    />
                  </div>

                  {/* New Claimed Amount (Editable) */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                     Claimed Amount
                    </label>
                    <input
                      type="number"
                      name="claimAmt"
                     
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                      placeholder="Enter new claimed amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Claimed Date */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Claimed Date
                    </label>
                    <input
                      type="date"
                      name="claimDt"
                      value={formData.claimDt}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                    />
                  </div>

                  {/* Maintenance File */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Maintenance File
                    </label>
                    <input
                      type="file"
                      name="maintFile"
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>

                  
                </div>
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
                      <Wrench className="w-4 h-4" />
                      Update Maintenance
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
                  <Settings className="w-8 h-8 text-white" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Maintenance Update</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to update this maintenance data?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Vehicle: <span className="font-medium">{formData.vehicleNumber}</span>
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition-all duration-200"
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
                      <Wrench className="w-4 h-4" />
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
                Maintenance Updated Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                Vehicle {formData.vehicleNumber} maintenance details have been updated successfully.
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-500">
                <Wrench className="w-4 h-4" />
                <span>Service Date: {formData.serviceDate}</span>
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

export default ModifyMaintenancePage;