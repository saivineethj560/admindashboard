import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Car, Shield, ShieldCheck, FileText, Calendar, DollarSign, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import { API_BASE_URL, FILE_PATH_API} from '../Config';


const EditInsChangePage = () => {
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
   filerc:null,//added on 21-04-2026-------------by rajakumari.m---------------------------------------------
    insStartDate: '',
    insEndDate: '',
    insAmount: '', // Single insurance amount field
    inscomp: '',
    insInvoice: null,
    existingInvoice: '' // Add this field to store existing invoice path/name4a
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
      setInsAmountEditReason('');
      return true;
    } else {
      setInsAmountEditReason(``);
      return false;
    }
  };
// --------------------------------------added on 21-04-2026----by rajakumari.m-------------------------------------------
const handleViewRC = () => {
  if (formData.existingRC) {
    // ✅ same pattern as handleViewInvoice
    const fileUrl = `${FILE_PATH_API}viewInvoice?file=${encodeURIComponent(formData.existingRC)}`;
    window.open(fileUrl, '_blank');
  }
};
//----------------------------------------------------------------------------------------------------------------------
  // Handle invoice view/download
  const handleViewInvoice = () => {
    if (formData.existingInvoice) {
      // You can customize this URL based on your backend implementation
    
      const fileUrl = `${FILE_PATH_API}viewInvoice?file=${encodeURIComponent(formData.existingInvoice)}`;
      window.open(fileUrl, '_blank');
    }
  };

  // Fetch vehicle data function
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
            fuelType: vehicleData.FUEL || '',
            datevalid: vehicleData.REG_VALID || '',
            user: vehicleData.VH_USER || '',
            drivername: vehicleData.VH_DRIVER || '',
            mobileno: vehicleData.MOBILE || '',
           
            insStartDate: vehicleData.INSURANCE_START_DATE || '',
            insEndDate: vehicleData.INSURANCE_END_DATE || '',
            insAmount: vehicleData.AMT || '', // Show existing amount or empty
            inscomp: vehicleData.INSURANCE_CMP || '',
            insInvoice: null,
            // Try different possible field names for the invoice file
            existingInvoice: vehicleData.INVOICE_FILE || 
                           vehicleData.INS_FILE || 
                           vehicleData.INVOICE_PATH || 
                           vehicleData.INVOICE_NAME || 
                           vehicleData.INS_INVOICE || 
                           vehicleData.FILE_NAME || 
                           vehicleData.INSURANCE_FILE || 
                           vehicleData.DOCUMENT_PATH || '',
//-----------------------------------------added on 21-04-2026----by rajakumari.m---------------------------------------
                        existingRC: vehicleData.RC || null,   // ✅ confirmed column name from store()
filerc: null,
  //---------------------------------------------------------------------------------------------------
          });
          
          // Debug: Log what we found for the invoice
          console.log('Invoice field value:', vehicleData.INVOICE_FILE || 
                                            vehicleData.INS_FILE || 
                                            vehicleData.INVOICE_PATH || 
                                            vehicleData.INVOICE_NAME || 
                                            vehicleData.INS_INVOICE || 
                                            vehicleData.FILE_NAME || 
                                            vehicleData.INSURANCE_FILE || 
                                            vehicleData.DOCUMENT_PATH || 'NOT FOUND');
          
          setIsInsAmountEditable(isInsEditable);
          
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

  // Modified handleSubmit to show confirmation modal first
  const handleSubmit = async () => {
    // Validate that at least one of the key editable fields has a value
    if (!formData.amount && (!isInsAmountEditable || !formData.insAmount)) {
      setError('Please enter at least one amount (Amount or Insurance Amount) to update.');
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
      
      // Add vehicleNumber first (required field)
      formDataToSend.append('vehicleNumber', formData.vehicleNumber);
      
      // Add all other fields with proper handling
      const fieldsToSend = [
        'vehicleType', 'company', 'vehicleModel', 'com_plant', 'datereg', 
        'purchaseYear', 'fuelType', 'datevalid', 'user', 'drivername', 
        'mobileno', 
        'insStartDate', 'insEndDate', 'inscomp'
      ];
      
      // Add non-file fields
      fieldsToSend.forEach(key => {
        const value = formData[key];
        if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value);
        }
      });
      
      // Only send amount if it has a value (not previous amount)
      if (formData.amount && formData.amount !== '') {
        formDataToSend.append('statusAmount', formData.amount);
      }
      
      // Only send insurance amount if editable and has value
      if (isInsAmountEditable && formData.insAmount && formData.insAmount !== '') {
        formDataToSend.append('insAmount', formData.insAmount);
      }
      
      if (formData.insInvoice && formData.insInvoice instanceof File) {
        formDataToSend.append('insInvoice', formData.insInvoice);
      }
      // -------------------------------added on 21-04-2026------by rajakumari.m------------------------------------------------
if (formData.filerc && formData.filerc instanceof File) {
  formDataToSend.append('filerc', formData.filerc);
}
//-------------------------------------------------------------------------------------------------------------------------------
      // Debug: Log what we're sending
      console.log('Sending FormData with fields:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await fetch(`${API_BASE_URL}updateInsuranceData`, {
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
          fuelType: vehicleData.fuelType || '',
          datevalid: vehicleData.validOfRegistration || '',
          user: vehicleData.userOrDept || '',
          drivername: vehicleData.driverName || '',
          mobileno: vehicleData.driverMobile || '',
          
          insStartDate: vehicleData.insuranceStartDate || '',
          insEndDate: vehicleData.insuranceEndDate || '',
          insAmount: vehicleData.insuranceAmount || '', // Single field showing existing amount
          inscomp: vehicleData.insuranceCompany || '',
          existingInvoice: vehicleData.invoicePath || vehicleData.invoiceName || '', // Add this line
          insInvoice: null
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
                    {formData.vehicleNumber ? `Edit Insurance - ${formData.vehicleNumber}` : 'Insurance Change Tab'}
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
                  <div className="flex items-center gap-2">
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
                      Purchase Year<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="purchaseYear"
                      value={formData.purchaseYear}
                      onChange={handleInputChange}
                      className={readOnlyInputStyle}
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
 {/* //------------------------------------------------added on 21-04-2026 by rajakumari.m------------------------------------------- */}
 <div>
  <label className="block text-indigo-800 font-bold text-xs mb-0.5">
    RC Upload <span className="text-red-500 ml-1">*</span>
  </label>

  <div className="flex items-center gap-2">
    {/* Display existing RC file */}
    {formData.existingRC ? (
      <div className="flex items-center bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 flex-1">
        <FileText className="w-4 h-4 text-blue-600 mr-2" />
        <span className="text-sm text-blue-800 truncate flex-1" title={formData.existingRC}>
          {formData.existingRC.split('/').pop() || formData.existingRC}
        </span>
        <button
          type="button"
          onClick={handleViewRC}
          className="ml-2 p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
          title="View RC"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>
    ) : (
      <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 flex-1">
        <FileText className="w-4 h-4 text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">No RC file</span>
      </div>
    )}

    {/* Choose File Button */}
    <div className="relative">
      <input
        type="file"
        name="filerc"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <button
        type="button"
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors duration-200"
      >
        Choose File
      </button>
    </div>
  </div>

  {/* Show selected new file name */}
  {formData.filerc && (
    <div className="mt-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
      <span className="font-medium">New file selected:</span> {formData.filerc.name}
    </div>
  )}

  <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG/PDF only</p>
</div>
{/* //---------------------------------------------------------------end---------------------------------------------------------------------- */}
               
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

                      {/* Single Insurance Amount Field - Conditionally editable */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          <DollarSign className="w-3 h-3 inline mr-1" />
                          Premium Insurance Amount
                         
                        </label>
                        <input
                          type="number"
                          name="insAmount"
                          value={formData.insAmount}
                          onChange={handleInputChange}
                          className={isInsAmountEditable ? highlightedInputStyle : readOnlyInputStyle}
                          placeholder={isInsAmountEditable ? "Enter insurance amount" : "Insurance amount exists and not expired"}
                          readOnly={!isInsAmountEditable}
                        />
                        {!isInsAmountEditable && formData.insEndDate && (
                          <p className="text-xs text-orange-600 mt-1">
                            {insAmountEditReason}
                          </p>
                        )}
                        {isInsAmountEditable && (
                          <p className="text-xs text-green-600 mt-1">
                            {insAmountEditReason}
                          </p>
                        )}
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
                          className="w-full border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                         
                        />
                      </div>

                      {/* Invoice Upload - Style matching your image */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Insurance File <span className="text-red-500 ml-1">*</span>
                        </label>
                        
                        <div className="flex items-center gap-2">
                          {/* Display existing invoice with matching style */}
                          {formData.existingInvoice ? (
                            <div className="flex items-center bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 flex-1">
                              <FileText className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="text-sm text-blue-800 truncate flex-1" title={formData.existingInvoice}>
                                {formData.existingInvoice.split('/').pop() || formData.existingInvoice}
                              </span>
                              <button
                                type="button"
                                onClick={handleViewInvoice}
                                className="ml-2 p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                title="View Invoice"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 flex-1">
                              <FileText className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-500">No invoice file</span>
                            </div>
                          )}
                          
                          {/* Choose File Button */}
                          <div className="relative">
                            <input
                              type="file"
                              name="insInvoice"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleInputChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <button
                              type="button"
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors duration-200"
                            >
                              Choose File
                            </button>
                          </div>
                        </div>
                        
                        {/* Show selected new file name below */}
                        {formData.insInvoice && (
                          <div className="mt-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            <span className="font-medium">New file selected:</span> {formData.insInvoice.name}
                          </div>
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
              <p className="text-sm text-gray-500 mb-2">
                Vehicle: <span className="font-medium">{formData.vehicleNumber}</span>
              </p>
              {formData.amount && (
                <p className="text-sm text-gray-500 mb-2">
                  New Amount: <span className="font-medium">₹{formData.amount}</span>
                </p>
              )}
              {isInsAmountEditable && formData.insAmount && (
                <p className="text-sm text-gray-500 mb-2">
                  Insurance Amount: <span className="font-medium">₹{formData.insAmount}</span>
                </p>
              )}
              {formData.insInvoice && (
                <p className="text-sm text-gray-500 mb-6">
                  New Invoice: <span className="font-medium">{formData.insInvoice.name}</span>
                </p>
              )}

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

export default EditInsChangePage;