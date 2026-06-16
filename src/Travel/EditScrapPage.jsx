import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Car, Shield, ShieldCheck, FileText, Calendar, DollarSign, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import { API_BASE_URL } from '../Config';

const EditScrapPage = () => {
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
  
   
    status: '',
    statusDate: '',
    statusAmount: '',
   
    amount: '', // New amount (editable, only saved if entered)
    statusReason: '',
   
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
  
  // Conditional editability states
  const [isInsAmountEditable, setIsInsAmountEditable] = useState(false);
  const [insAmountEditReason, setInsAmountEditReason] = useState('');

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

  // Check if insurance amount should be editable
  const checkInsuranceEditability = (endDate, existingAmount) => {
    // If no existing amount or amount is 0, it's always editable
    if (!existingAmount || parseFloat(existingAmount) === 0) {
      setInsAmountEditReason('No existing insurance amount');
      return true;
    }
    
    // If no end date, not editable
    if (!endDate) {
      setInsAmountEditReason('No insurance end date available');
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
    
    const insuranceEndDate = new Date(endDate);
    insuranceEndDate.setHours(0, 0, 0, 0);
    
    // Make editable if insurance has expired (today > end date)
    if (today > insuranceEndDate) {
      setInsAmountEditReason('Insurance has expired');
      return true;
    } else {
      setInsAmountEditReason(`Insurance expires on ${insuranceEndDate.toLocaleDateString()}`);
      return false;
    }
  };



  // Fetch vehicle data function
  const fetchVehicleData = async (vehicleNumber) => {
    if (!vehicleNumber) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching vehicle data for:', vehicleNumber);
      
      const response = await fetch(`${API_BASE_URL}getScrapVehicles`, {
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
          
          // Check insurance amount editability
          const isInsEditable = checkInsuranceEditability(
            vehicleData.INSURANCE_END_DATE, 
            vehicleData.AMT
          );
          
          // Debug: Log the entire vehicleData to see all available fields
          console.log('All vehicle data fields:', Object.keys(vehicleData));
          console.log('Vehicle data:', vehicleData);
          
          setFormData({
            vehicleNumber: vehicleData.VH_NUMBER || '',
            vehicleType: vehicleData.VH_TYPE || '',
            company: vehicleData.VH_COMPANY || '',
            vehicleModel: vehicleData.VH_MODEL || '',
            com_plant: vehicleData.COMP_PLANT || '',
            datereg: vehicleData.REG_DT || '',
            purchaseYear: vehicleData.PUR_YEAR || '',
           
          
            status: vehicleData.INS_STATUS || '',
            statusDate: vehicleData.STAT_DT || '',
            statusAmount: '',
          
           
            statusReason: vehicleData.STATUS_RE || '',
          
          });
          
       
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

  // Modified handleSubmit to show confirmation modal first
  const handleSubmit = async () => {
    // Clear any previous errors
    setError(null);
    
    // Basic validation for required fields based on status
    if (!formData.status) {
      setError('Please select a status.');
      return;
    }
    
    // For Scrap/Sold status, validate required fields
    if (['Scrap', 'Sold'].includes(formData.status)) {
      if (!formData.statusDate) {
        setError('Please enter a date for the selected status.');
        return;
      }
      if (!formData.statusReason) {
        setError('Please enter a reason for the selected status.');
        return;
      }
    }
    
    // For Active/Repair status, validate date
    if (['Active', 'Repair'].includes(formData.status) && !formData.statusDate) {
      setError('Please enter a date for the selected status.');
      return;
    }
    
    setShowConfirmModal(true);
  };

  // Function to handle confirmed submission - UPDATED
  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add vehicleNo first (required field) - matches backend validation
      formDataToSend.append('vehicleNo', formData.vehicleNumber);
      
      // Add all fields, but handle empty values properly
      const fieldMapping = {
        'vehicleType': 'vehicleType',
        'company': 'company', 
        'vehicleModel': 'vehicleModel',
        'purchaseYear': 'purchaseYear',
        'status': 'status',
        'statusDate': 'statusDate'
      };
      
      // Add basic fields
      Object.entries(fieldMapping).forEach(([frontendKey, backendKey]) => {
        const value = formData[frontendKey];
        if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(backendKey, value);
        }
      });
      
      // Always send statusReason and statusAmount to avoid "Undefined array key" errors
      formDataToSend.append('statusReason', formData.statusReason || '');
      formDataToSend.append('statusAmount', formData.amount || '');
      
    
      
      // Debug: Log what we're sending
      console.log('Sending FormData with fields:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await fetch(`${API_BASE_URL}saveScrapVehicle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken.token}`,
          'Accept': 'application/json',
          // Don't set Content-Type - let browser set it for FormData
        },
        body: formDataToSend
      });
      
      // First check if response is ok
      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
          console.error('Error response:', errorData);
        } catch (e) {
          errorText = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorText);
      }
      
      // Parse successful response
      const result = await response.json();
      console.log('Success response:', result);
      
      if (result.status) {
        setSuccessMessage(result.message || 'Insurance data updated successfully!');
        setShowConfirmModal(false);
        setShowSuccessModal(true);
      } else {
        setShowConfirmModal(false);
        throw new Error(result.message || 'Failed to update insurance data');
      }
      
    } catch (error) {
      console.error('Error updating data:', error);
      setShowConfirmModal(false);
      setError(`Error updating data: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effect to load data when component mounts
  useEffect(() => {
    if (location.state) {
      const { vehicleNumber, vehicleData, editMode } = location.state;
      
      console.log('Received navigation state:', { vehicleNumber, vehicleData, editMode });
      
      if (editMode && vehicleNumber) {
        fetchVehicleData(vehicleNumber);
      } else if (vehicleData) {
        // Check insurance amount editability
        const isInsEditable = checkInsuranceEditability(
          vehicleData.insuranceEndDate, 
          vehicleData.insuranceAmount
        );
        
        setFormData(prev => ({
          ...prev,
          vehicleNumber: vehicleData.vehicleNo || '',
          vehicleType: vehicleData.vehicleType || '',
          company: vehicleData.vehicleCompany || '',
          vehicleModel: vehicleData.vehicleModel || '',
          com_plant: vehicleData.companyPlant || '',
          datereg: vehicleData.dateOfRegistration || '',
          purchaseYear: vehicleData.purchaseYear || '',
          // fuelType: vehicleData.fuelType || '',
         
          status: vehicleData.status || '',
          statusDate: vehicleData.statusDate || '',
          statusAmount: '',
         
         
          statusReason: vehicleData.statusReason || ''
         
        }));
        
        setIsInsAmountEditable(isInsEditable);
        
        if (vehicleData.insuranceStartDate || vehicleData.insuranceEndDate || vehicleData.insuranceCompany) {
          setShowInsuranceSection(true);
        }
      }
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
  const readOnlyInputStyle = "w-full border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-100 cursor-not-allowed";

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
                    {formData.vehicleNumber ? `Edit Scrap/Sold - ${formData.vehicleNumber}` : 'Scrap/Sold Change Tab'}
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
                      className={readOnlyInputStyle}
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
                      className={readOnlyInputStyle}
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
                      className={readOnlyInputStyle}
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
                      className={readOnlyInputStyle}
                      placeholder="Enter company"
                      readOnly
                    />
                  </div>

                  {/* Fuel Type */}
                  {/* <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Fuel Type<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      className={readOnlyInputStyle}
                      readOnly
                    />
                  </div> */}

                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Company & Plant<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      name="com_plant"
                      value={formData.com_plant}
                      onChange={handleInputChange}
                      className={readOnlyInputStyle}
                      readOnly
                    />
                  </div>

                  {/* Purchase Year */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Purchase Date<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="purchaseYear"
                      value={formData.purchaseYear}
                      onChange={handleInputChange}
                      className={inputStyle}
                      placeholder="Select purchase date"
                    />
                  </div>
                </div>
              </div>

              {/* All Form Fields Section */}
              <div className="mx-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  
                {/* Status */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Status <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={inputStyle}
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      {/* <option value="Repair">Repair</option> */}
                      <option value="Scrap">Scrap</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>

                  {/* Previous Amount and Amount - Only show when status is NOT Active */}
                  {formData.status !== "Active" && (
                    <>
                      {/* Previous Amount - Display only, not saved */}
                      {/* <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Previous Amount
                          <span className="text-xs text-gray-500 ml-1">(Display Only)</span>
                        </label>
                        <input
                          type="number"
                          name="prevAmount"
                          value={formData.prevAmount}
                          className={readOnlyInputStyle}
                          readOnly
                          placeholder="Previous amount"
                        />
                      </div> */}

                      {/* Amount - Editable, only saved if entered */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Amount
                          <span className="text-xs text-green-600 ml-1"></span>
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          className={highlightedInputStyle}
                          placeholder="Enter new amount"
                        />
                      </div>
                    </>
                  )}

                  {/* Date field for Active and Repair status */}
                  {["Active", "Repair"].includes(formData.status) && (
                    <div>
                      <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                        Date <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="date"
                        name="statusDate"
                        value={formData.statusDate || ""}
                        onChange={handleInputChange}
                        className={inputStyle}
                      />
                    </div>
                  )}

                  {/* Date and Reason fields for Scrap and Sold status */}
                  {["Scrap", "Sold"].includes(formData.status) && (
                    <>
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Date <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="date"
                          name="statusDate"
                          value={formData.statusDate || ""}
                          onChange={handleInputChange}
                          className={inputStyle}
                        />
                      </div>

                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Reason <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                          name="statusReason"
                          value={formData.statusReason || ""}
                          onChange={handleInputChange}
                          className={inputStyle}
                          placeholder="Enter reason"
                          rows="1"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Insurance Toggle Button */}
               

              
                     
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
                      Update scrap/sold
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
                Are you sure you want to update this scarp/sold data?
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Vehicle: <span className="font-medium">{formData.vehicleNumber}</span>
              </p>
              
              <div className="flex justify-center gap-4">
                {/* Cancel Button */}
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition-all duration-200"
                >
                  No, Cancel
                </button>

                {/* Submit Button */}
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
                Scrap/Sold Updated Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Vehicle {formData.vehicleNumber} scrap/sold details have been updated.
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


export default EditScrapPage;