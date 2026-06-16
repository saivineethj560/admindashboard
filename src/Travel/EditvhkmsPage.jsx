import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Car, Shield, ShieldCheck, FileText, Calendar, DollarSign, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import { API_BASE_URL } from '../Config';

const EditvhkmsPage = () => {
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
    vehicleKms: '', // New field for vehicle kilometers
    fromDate: '',   // New field for from date
    toDate: '',     // New field for to date
  });
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isFirstEntry, setIsFirstEntry] = useState(true);

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

  // NEW FUNCTION: Get the latest TO_DATE for this vehicle from API
  const getLatestToDate = async (vehicleNumber) => {
    if (!vehicleNumber) return null;
    
    try {
      console.log('Fetching latest TO_DATE for vehicle:', vehicleNumber);
      
      const response = await fetch(`${API_BASE_URL}getvhkmsVehicles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken.token}`
        }
      });

      if (!response.ok) {
        console.error('Error fetching latest date:', response.statusText);
        return null;
      }

      const result = await response.json();
      
      if (result.status && result.data && Array.isArray(result.data)) {
        // Filter records for this specific vehicle
        const vehicleRecords = result.data.filter(item => 
          item.VH_NUMBER === vehicleNumber || 
          item.VH_NUMBER?.toLowerCase() === vehicleNumber?.toLowerCase()
        );
        
        if (vehicleRecords.length > 0) {
          // Sort by TO_DATE in descending order to get the latest
          const sortedRecords = vehicleRecords
            .filter(record => record.TO_DATE) // Only records with TO_DATE
            .sort((a, b) => new Date(b.TO_DATE) - new Date(a.TO_DATE));
          
          if (sortedRecords.length > 0) {
            const latestToDate = sortedRecords[0].TO_DATE;
            console.log('Latest TO_DATE found:', latestToDate);
            return latestToDate;
          }
        }
      }
      
      console.log('No previous TO_DATE found for vehicle:', vehicleNumber);
      return null;
    } catch (error) {
      console.error('Error fetching latest TO_DATE:', error);
      return null;
    }
  };

  // Fetch vehicle data function - Updated API endpoint for vehicle KMS
  const fetchVehicleData = async (vehicleNumber) => {
  if (!vehicleNumber) return;
  
  setLoading(true);
  setError(null);
  
  try {
    console.log('Fetching vehicle KMS data for:', vehicleNumber);
    
    // First, get the latest TO_DATE for this vehicle
    const latestToDate = await getLatestToDate(vehicleNumber);
    
    // Updated API endpoint for vehicle KMS data
    const response = await fetch(`${API_BASE_URL}getvhkmsVehicles`, {
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
        console.log('Found vehicle KMS data:', vehicleData);

        // 🚩 UPDATED: Determine if this is first entry based on latest TO_DATE
        const hasExistingEntries = !!latestToDate;
        setIsFirstEntry(!hasExistingEntries);

        // 🚩 UPDATED: Set form data with proper from date logic
        setFormData({
          vehicleNumber: vehicleData.VH_NUMBER || '',
          vehicleType: vehicleData.VH_TYPE || '',
          company: vehicleData.VH_COMPANY || '',
          vehicleModel: vehicleData.VH_MODEL || '',
          com_plant: vehicleData.COMP_PLANT || '',
          datereg: vehicleData.REG_DT || '',
          purchaseYear: vehicleData.PUR_YEAR || '',
          vehicleKms: '', 
          fromDate: hasExistingEntries ? latestToDate : '', // Auto-fill from date if not first entry
          toDate: '',
        });

        console.log('Is first entry:', !hasExistingEntries);
        console.log('Latest TO_DATE found:', latestToDate);

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
    console.error('Error fetching vehicle KMS data:', err);
    setError(`Error fetching vehicle KMS data: ${err.message}`);
  } finally {
    setLoading(false);
  }
};
const checkVehicleEntryStatus = async (vehicleNumber) => {
  if (!vehicleNumber) return { isFirstEntry: true, lastToDate: null };
  
  try {
    const latestToDate = await getLatestToDate(vehicleNumber);
    return {
      isFirstEntry: !latestToDate,
      lastToDate: latestToDate
    };
  } catch (error) {
    console.error('Error checking vehicle entry status:', error);
    return { isFirstEntry: true, lastToDate: null };
  }
};
  // Modified handleSubmit to show confirmation modal first
  const handleSubmit = async () => {
  // Clear any previous errors
  setError(null);
  
  // Basic validation for required fields
  if (!formData.vehicleNumber) {
    setError('Vehicle number is required.');
    return;
  }
  
  if (!formData.vehicleKms) {
    setError('Vehicle KMS is required.');
    return;
  }
  
  if (!formData.fromDate) {
    setError('From date is required.');
    return;
  }
  
  if (!formData.toDate) {
    setError('To date is required.');
    return;
  }

  // 🚩 UPDATED: Enhanced date validation
  const fromDate = new Date(formData.fromDate);
  const toDate = new Date(formData.toDate);
  
  if (fromDate >= toDate) {
    setError('To date must be after the From date.');
    return;
  }

  // 🚩 NEW: Validate that KMS is a positive number
  const kmsValue = parseFloat(formData.vehicleKms);
  if (isNaN(kmsValue) || kmsValue <= 0) {
    setError('Vehicle KMS must be a positive number.');
    return;
  }
  
  setShowConfirmModal(true);
};

  // Function to handle confirmed submission - UPDATED for Vehicle KMS
  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create FormData for submission with correct field names
      const formDataToSend = new FormData();
      
      // Map frontend fields to backend expected field names
      formDataToSend.append('vehicleNo', formData.vehicleNumber);
      formDataToSend.append('vehicleType', formData.vehicleType || '');
      formDataToSend.append('company', formData.company || '');
      formDataToSend.append('vehicleModel', formData.vehicleModel || '');
      formDataToSend.append('purchaseYear', formData.purchaseYear || '');
      
      // Fix field name mappings to match backend validation
      formDataToSend.append('vhkms', formData.vehicleKms || '');        // backend expects 'vhkms'
      formDataToSend.append('fromdate', formData.fromDate || '');       // backend expects 'fromdate' 
      formDataToSend.append('todate', formData.toDate || '');           // backend expects 'todate'
      
      // Debug: Log what we're sending
      console.log('Sending FormData with correct field names:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }
      
      // API call - ensure POST method is used
      const response = await fetch(`${API_BASE_URL}saveVehiclekms`, {
        method: 'POST',  // Keep as POST
        headers: {
          'Authorization': `Bearer ${userToken.token}`,
          'Accept': 'application/json',
          // Don't set Content-Type - let browser set it for FormData
        },
        body: formDataToSend
      });
      
      // Check if response is ok
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
        setSuccessMessage(result.message || 'Vehicle KMS data updated successfully!');
        setShowConfirmModal(false);
        setShowSuccessModal(true);
      } else {
        setShowConfirmModal(false);
        throw new Error(result.message || 'Failed to update vehicle KMS data');
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
        setFormData(prev => ({
          ...prev,
          vehicleNumber: vehicleData.vehicleNo || '',
          vehicleType: vehicleData.vehicleType || '',
          company: vehicleData.company || '',
          vehicleModel: vehicleData.vehicleModel || '',
          com_plant: vehicleData.companyPlant || '',
          datereg: vehicleData.dateOfRegistration || '',
          purchaseYear: vehicleData.purchaseYear || '',
          vehicleKms: vehicleData.vehicleKms || '', // New field
          fromDate: vehicleData.fromDate || '',     // New field
          toDate: vehicleData.toDate || '',         // New field
        }));
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

  // NEW FUNCTION: Handle manual vehicle number input to auto-populate from date
  const handleVehicleNumberChange = async (e) => {
  const vehicleNumber = e.target.value;
  
  setFormData(prev => ({
    ...prev,
    vehicleNumber: vehicleNumber,
    // Reset other fields when vehicle number changes
    vehicleKms: '',
    fromDate: '',
    toDate: ''
  }));
  
  // 🚩 UPDATED: If vehicle number is entered, check for existing entries
  if (vehicleNumber && vehicleNumber.length > 2) { // Only check after meaningful input
    try {
      setLoading(true);
      const latestToDate = await getLatestToDate(vehicleNumber);
      
      if (latestToDate) {
        // This vehicle has existing entries - not first entry
        setIsFirstEntry(false);
        setFormData(prev => ({
          ...prev,
          fromDate: latestToDate
        }));
        console.log('Auto-populated fromDate with latest TO_DATE:', latestToDate);
      } else {
        // This is the first entry for this vehicle
        setIsFirstEntry(true);
        setFormData(prev => ({
          ...prev,
          fromDate: ''
        }));
        console.log('First entry for this vehicle - fromDate editable');
      }
    } catch (error) {
      console.error('Error checking vehicle history:', error);
      // On error, assume first entry
      setIsFirstEntry(true);
    } finally {
      setLoading(false);
    }
  } else {
    // If vehicle number is too short or empty, reset to first entry mode
    setIsFirstEntry(true);
  }
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
                    {formData.vehicleNumber ? `Edit Vehicle KMS - ${formData.vehicleNumber}` : 'Vehicle KMS Edit Page'}
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
                    alt="Vehicle KMS illustration"
                    className="max-w-full max-h-48 mb-3 mt-4 rounded-lg"
                  />
                </div>

                {/* Right Side - Key Form Fields */}
                <div className="space-y-1">
                  {/* Vehicle Number - UPDATED to use new handler */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Vehicle Number<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={location.state?.editMode ? handleInputChange : handleVehicleNumberChange}
                      className={location.state?.editMode ? readOnlyInputStyle : inputStyle}
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

              {/* Vehicle KMS Form Fields Section */}
              <div className="mx-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  
                  {/* Vehicle KMS */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Vehicle KMS <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="vehicleKms"
                      value={formData.vehicleKms}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                      placeholder="Enter vehicle kilometers"
                      min="0"
                    />
                  </div>

                  {/* From Date - UPDATED with helper text */}
                 <div>
  <label className="block text-indigo-800 font-bold text-xs mb-0.5">
    From Date <span className="text-red-500 ml-1">*</span>
    {!isFirstEntry && (
      <span className="text-blue-600 text-xs ml-1">(Auto-filled from last entry)</span>
    )}
    {isFirstEntry && (
      <span className="text-green-600 text-xs ml-1">(First entry - editable)</span>
    )}
  </label>
  <input
    type="date"
    name="fromDate"
    value={formData.fromDate}
    onChange={handleInputChange}
    className={isFirstEntry ? highlightedInputStyle : readOnlyInputStyle}
    readOnly={!isFirstEntry} // 🚩 UPDATED: Only editable for first entry
    placeholder={isFirstEntry ? "Select from date" : "Auto-filled from previous entry"}
  />
  {!isFirstEntry && formData.fromDate && (
    <p className="text-xs text-gray-500 mt-1">
      This date was automatically set from your last KMS entry.
    </p>
  )}
</div>

                  {/* To Date */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      To Date <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="toDate"
                      value={formData.toDate}
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
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
                      <Car className="w-4 h-4" />
                      Update Vehicle KMS
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
                Are you sure you want to update this vehicle KMS data?
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Vehicle: <span className="font-medium">{formData.vehicleNumber}</span>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                KMS: <span className="font-medium">{formData.vehicleKms}</span>
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
                Vehicle KMS Updated Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Vehicle {formData.vehicleNumber} KMS details have been updated.
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

export default EditvhkmsPage;