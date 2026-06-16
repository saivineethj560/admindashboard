import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Car, Shield, ShieldCheck, FileText, Calendar, DollarSign, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Loader2, Wrench, CheckCircle, Settings } from "lucide-react";
import { API_BASE_URL } from '../Config';

const EditMaintChangePage = () => {
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
    costMain: '', // Only new cost entry
    descMain: '',
    vendorName: '',
    maintFile: null,
    claimStatus: '',
    claimAmt: '', // Only new claim entry
    claimDt: '',
   paymentStatus: '',
pydate:'',
vhckms:'',
  });
const [originalSubmittedData, setOriginalSubmittedData] = useState({
  totalAmount: null,
  serviceDate: null,
  paymentStatus: null
});
const isTotalAmountEditable = () => {
  // If no original data exists, it's editable (first time entry)
  if (!originalSubmittedData.totalAmount) {
    return true;
  }

  // If payment status is "Paid" and service date hasn't changed, make it non-editable
  if (originalSubmittedData.paymentStatus === "Paid" && 
      formData.serviceDate === originalSubmittedData.serviceDate) {
    return false;
  }

  // If service date has changed from original, it's always editable regardless of payment status
  if (formData.serviceDate !== originalSubmittedData.serviceDate) {
    return true;
  }

  // If payment status is "Unpaid" and service date is same, it's editable but with amount restriction
  if (originalSubmittedData.paymentStatus === "Unpaid" && 
      formData.serviceDate === originalSubmittedData.serviceDate) {
    return true;
  }

  return true;
};
const getMaxAllowedAmount = () => {
  if (originalSubmittedData.paymentStatus === "Unpaid" && 
      formData.serviceDate === originalSubmittedData.serviceDate &&
      originalSubmittedData.totalAmount) {
    return originalSubmittedData.totalAmount;
  }
  return null; // No restriction
};
  // Add state for previous values (display only, not submitted)
  const [previousValues, setPreviousValues] = useState({
    prevCostMain: '',
    prevClaimAmt: ''
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
  if (!vehicleNumber) return;
  
  setLoading(true);
  setError(null);
  
  try {
    console.log('Fetching vehicle data for:', vehicleNumber);
    
    const response = await fetch(`${API_BASE_URL}getMaintChange`, {
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
        
        // Map the API response to form data according to new structure
        setFormData({
          vehicleNumber: vehicleData.VH_NUMBER || '',
          vehicleType: vehicleData.VH_TYPE || '',
          company: vehicleData.VH_COMPANY || '',
          vehicleModel: vehicleData.VH_MODEL || '',
          purchaseYear: vehicleData.PUR_YEAR || '',
          user: vehicleData.VH_USER || '',
          drivername: vehicleData.VH_DRIVER || '',
          rc: vehicleData.RC || '',
          serviceDate: vehicleData.SERVICE_DATE || '',
          statusMain: vehicleData.STATUS_MAIN || '',
          costMain: '', // Clear for new entry
          descMain: vehicleData.DESC_MAIN || '',
          vendorName: vehicleData.VENDOR_NAME || '',
          maintFile: null,
          claimStatus: vehicleData.CLAIM_STATUS || '',
          claimAmt: '', // Clear for new entry
          claimDt: vehicleData.CLAIM_DT || '',
          paymentStatus: vehicleData.PAY_STATUS || '',
          pydate: vehicleData.PY_DATE || '',
          vhckms: vehicleData.VHC_KMS || '',
        });

        // Set previous cumulative values for display only
        setPreviousValues({
          prevCostMain: vehicleData.COST_MAIN || '0',
          prevClaimAmt: vehicleData.CLAIM_AMT || '0'
        });

        // IMPORTANT: Store the original submitted data for validation
        setOriginalSubmittedData({
          totalAmount: vehicleData.COST_MAIN || null,
          serviceDate: vehicleData.SERVICE_DATE || null,
          paymentStatus: vehicleData.PAY_STATUS || null
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
    setShowConfirmModal(true);
  };

  // Function to handle confirmed submission
  const handleConfirmedSubmit = async () => {
  // Validation before submission
  const enteredAmount = parseFloat(formData.costMain);
  const maxAmount = getMaxAllowedAmount();
  
  // Check if amount exceeds maximum for unpaid entries with same service date
  if (maxAmount && enteredAmount > parseFloat(maxAmount)) {
    setError(`Submission blocked: Amount ₹${formData.costMain} exceeds maximum allowed ₹${maxAmount} for unpaid entries with same service date.`);
    setShowConfirmModal(false);
    setIsSubmitting(false);
    return;
  }

  // Check if field should be editable
  if (!isTotalAmountEditable() && formData.costMain) {
    setError(`Submission blocked: Total amount field is locked. Payment status is "Paid" and service date hasn't changed.`);
    setShowConfirmModal(false);
    setIsSubmitting(false);
    return;
  }

  setIsSubmitting(true);
  
  try {
    // Create FormData for file uploads
    const formDataToSend = new FormData();
    
    // Map frontend field names to backend expected field names
    const fieldMapping = {
      'vehicleNumber': 'vehicleNumber',
      'vehicleType': 'vehicleType',
      'company': 'company',
      'vehicleModel': 'vehicleModel',
      'purchaseYear': 'purchaseYear',
      'user': 'user',
      'serviceDate': 'serviceDate',
      'statusMain': 'maintStatus',
      'costMain': 'maintCost',
      'descMain': 'maintDesc',
      'vendorName': 'vendorName',
      'maintFile': 'maintFile',
      'claimStatus': 'claimStatus',
      'claimAmt': 'claimAmount',
      'claimDt': 'claimDate',
      'paymentStatus': 'paymentStatus',
      'pydate': 'pydate',
      'vhckms': 'vhckms',
    };
    
    // Add form fields - only send values that were actually entered
    Object.keys(formData).forEach(key => {
      const backendFieldName = fieldMapping[key] || key;
      let value = formData[key];

      // Only send non-empty values
      if (value !== '' && value !== null && value !== undefined) {
        if (key === "maintFile") {
          if (formData[key] instanceof File) {
            formDataToSend.append(backendFieldName, formData[key]);
          }
        } else {
          formDataToSend.append(backendFieldName, value);
        }
      }
    });

    // Log the data being sent for debugging
    console.log('Form data being sent:');
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    // Updated API endpoint URL
    const response = await fetch(`${API_BASE_URL}updateMaintData`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken.token}`,
        'Accept': 'application/json',
      },
      body: formDataToSend
    });
    
    const result = await response.json();
    console.log('Update response:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    if (result.status) {
      // Store the original submitted data for future validations
      setOriginalSubmittedData({
        totalAmount: formData.costMain,
        serviceDate: formData.serviceDate,
        paymentStatus: formData.paymentStatus
      });

      // Update previous values with the new cumulative totals from the response
      setPreviousValues({
        prevCostMain: result.data?.new_total_maint_cost || previousValues.prevCostMain,
        prevClaimAmt: result.data?.new_total_claim_amount || previousValues.prevClaimAmt,
      });

      // Clear the input fields after successful submission ONLY if payment is paid
      if (formData.paymentStatus === "Paid") {
        setFormData(prev => ({
          ...prev,
          costMain: '',
          claimAmt: '',
        }));
      }

      setSuccessMessage(result.message || 'Maintenance data updated successfully!');
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } else {
      setShowConfirmModal(false);
      throw new Error(result.message || 'Failed to update maintenance data');
    }
      
  } catch (error) {
    console.error('Error updating maintenance data:', error);
    setShowConfirmModal(false);
    setError(`Error updating maintenance data: ${error.message}`);
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
      // Map incoming data to new structure
      setFormData(prev => ({
        ...prev,
        vehicleNumber: vehicleData.vehicleNo || '',
        vehicleType: vehicleData.vehicleType || '',
        company: vehicleData.vehicleCompany || '',
        vehicleModel: vehicleData.vehicleModel || '',
        purchaseYear: vehicleData.purchaseYear || '',
        user: vehicleData.userOrDept || '',
        drivername: vehicleData.driverName || '',
        rc: vehicleData.rc || '',
        serviceDate: vehicleData.serviceDate || '',
        statusMain: vehicleData.statusMain || '',
        costMain: '', // Clear for new entry
        descMain: vehicleData.descMain || '',
        vendorName: vehicleData.vendorName || '',
        claimStatus: vehicleData.claimStatus || '',
        claimAmt: '', // Clear for new entry
        claimDt: vehicleData.claimDt || '',
        paymentStatus: vehicleData.paymentStatus || '',
        pydate: vehicleData.pydate || '',
        vhckms: vehicleData.vhckms || '',
      }));

      // Set previous cumulative values
      setPreviousValues({
        prevCostMain: vehicleData.costMain || '0',
        prevClaimAmt: vehicleData.claimAmt || '0'
      });

      // Set original submitted data for validation
      setOriginalSubmittedData({
        totalAmount: vehicleData.costMain || null,
        serviceDate: vehicleData.serviceDate || null,
        paymentStatus: vehicleData.paymentStatus || null
      });
    }
  }
}, [location.state]);

  const handleInputChange = (e) => {
  const { name, value, type, files } = e.target;
  
  // Special handling for costMain (Total Amount) field
  if (name === 'costMain' && value) {
    const enteredAmount = parseFloat(value);
    const maxAmount = getMaxAllowedAmount();
    
    // Prevent entering amount above the limit for unpaid entries with same service date
    if (maxAmount && enteredAmount > parseFloat(maxAmount)) {
      // Show error message and prevent the input
      setError(`Maximum allowed amount is ₹${maxAmount} for unpaid entries with the same service date.`);
      // Don't update the state with the invalid value
      return;
    }
    
    // Clear error if amount is valid
    if (maxAmount && enteredAmount <= parseFloat(maxAmount)) {
      setError(null);
    } else if (!maxAmount) {
      setError(null);
    }
  }
  
  // Clear error for other fields or valid costMain values
  if (name !== 'costMain') {
    setError(null);
  }
  
  setFormData(prev => ({
    ...prev,
    [name]: type === 'file' ? files[0] : value
  }));
};

  // Compressed styling
  const inputStyle = "w-full border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";
  const highlightedInputStyle = "w-full border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";
  const disabledInputStyle = "w-full border border-gray-300 rounded-full px-2 py-1 text-sm bg-gray-100 text-gray-600 cursor-not-allowed";

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
                    {formData.vehicleNumber ? `Edit Maintenance - ${formData.vehicleNumber}` : 'Maintenance Change Tab'}
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
                  
                  {/* Previous Total Cost (Display Only) */}
                  {/* <div>
                    <label className="block text-gray-600 font-bold text-xs mb-0.5">
                      Previous Total Cost
                    </label>
                    <input
                      type="number"
                      value={previousValues.prevCostMain}
                      className={disabledInputStyle}
                      placeholder="No previous cost"
                      disabled
                      readOnly
                    />
                  </div> */}
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
                  {/* New Cost Entry (Editable) */}
          <div>
  <label className="block text-indigo-800 font-bold text-xs mb-0.5">
    Total Amount<span className="text-red-500 ml-1">*</span>
  </label>
  <input
    type="number"
    name="costMain"
    value={formData.costMain || ''}
    onChange={handleInputChange}
    className={isTotalAmountEditable() ? highlightedInputStyle : disabledInputStyle}
    placeholder={
      !isTotalAmountEditable() 
        ? "Amount locked (change service date to edit)" 
        : getMaxAllowedAmount() 
          ? `Enter amount (max: ₹${getMaxAllowedAmount()})` 
          : "Enter new cost for this service"
    }
    disabled={!isTotalAmountEditable()}
    max={getMaxAllowedAmount() || undefined}
    style={{
      display: 'block',
      width: '100%'
    }}
  />
  
  {/* Display current value if exists */}
  {formData.costMain && (
    <div className="text-xs text-blue-600 mt-1 font-medium">
      Current Amount: ₹{formData.costMain}
    </div>
  )}
  
  {/* Show restriction message for paid status */}
  {!isTotalAmountEditable() && originalSubmittedData.paymentStatus === "Paid" && (
    <p className="text-xs text-red-500 mt-1">
      ⚠ Field locked: Payment marked as "Paid". Change service date to edit amount.
    </p>
  )}
  
  {/* Show restriction message for unpaid status */}
  {originalSubmittedData.paymentStatus === "Unpaid" && 
   formData.serviceDate === originalSubmittedData.serviceDate && 
   getMaxAllowedAmount() && (
    <p className="text-xs text-orange-600 mt-1">
      💡 Unpaid entry: Maximum allowed amount is ₹{getMaxAllowedAmount()}
    </p>
  )}
  
  {/* Show when field becomes editable due to date change */}
  {isTotalAmountEditable() && 
   originalSubmittedData.totalAmount && 
   formData.serviceDate !== originalSubmittedData.serviceDate && (
    <p className="text-xs text-green-600 mt-1">
      ✓ Service date changed: Amount field is now editable
    </p>
  )}
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

                  {/* New Claimed Amount Entry (Editable) - Only show if claimStatus is "Yes" */}
                  {formData.claimStatus === "Yes" && (
                    <div>
                      <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                        New Claimed Amount<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        name="claimAmt"
                        value={formData.claimAmt}
                        onChange={handleInputChange}
                        className={highlightedInputStyle}
                        placeholder="Enter new claimed amount for this service"
                      />
                    </div>
                  )}

                  {/* Claimed Date - Only show if claimStatus is "Yes" */}
                  {formData.claimStatus === "Yes" && (
                    <div>
                      <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                        Claimed Date<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="date"
                        name="claimDt"
                        value={formData.claimDt}
                        onChange={handleInputChange}
                        className={highlightedInputStyle}
                      />
                    </div>
                  )}

                  {/* Maintenance File */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      Maintenance File<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="file"
                      name="maintFile"
                      onChange={handleInputChange}
                      className={highlightedInputStyle}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                   {/* Maintenance File */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                      vehicle Kms<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="vhckms"
                     value={formData.vhckms}
                        onChange={handleInputChange}
                        className={highlightedInputStyle}
                    />
                  </div>
                   {/* Payment Status*/}
                  <div>
  <label className="block text-indigo-800 font-bold text-xs mb-0.5">
    Payment Status<span className="text-red-500 ml-1">*</span>
  </label>
  <select
    name="paymentStatus"
    value={formData.paymentStatus} // Add this line
    onChange={handleInputChange}
    className={highlightedInputStyle}
    required
  >
    <option value="">-- Select Status --</option>
    <option value="Paid">Paid</option>
    <option value="Unpaid">Unpaid</option>
  </select>
</div>

                   {/* Payment Status date */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                     date<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="pydate"
                       value={formData.pydate}
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
              <p className="text-sm text-gray-500 mb-2">
                Vehicle: <span className="font-medium">{formData.vehicleNumber}</span>
              </p>
              
              {/* Show what will be updated */}
              <div className="text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                {formData.costMain && <p>New Cost: ₹{formData.costMain}</p>}
                {formData.claimAmt && <p>New Claim: ₹{formData.claimAmt}</p>}
                {formData.serviceDate && <p>Service Date: {formData.serviceDate}</p>}
              </div>

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
                <span>New entry added to maintenance history</span>
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

export default EditMaintChangePage;