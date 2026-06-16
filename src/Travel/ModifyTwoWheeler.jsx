import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bike, Shield, ShieldCheck, FileText, Calendar, DollarSign, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Loader2, CreditCard, CheckCircle, Settings, Eye, Download } from "lucide-react";
import { API_BASE_URL, FILE_PATH } from '../Config';

const ModifyTwoWheeler = () => {
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
  currentRcFile: '',
  rcFileUrl: '', 
  inssDate:'',
  inedate:'',
  insFile: null,
  currentInsFile: '',
  insamt: '',
  prevInsAmt: '', // Previous insurance amount (read-only)
  prevCost: '',   // Previous cost (read-only)
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
     const handleInsFileView = () => {
  if (!formData.currentInsFile) {
    alert('No insurance file available to view');
    return;
  }
  
  const url = `${FILE_PATH}public/storage/${formData.currentInsFile}`;
  window.open(url, '_blank');
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
        cost: '', // Keep empty for new cost entry
        prevCost: vehicleData.COST || '', // Set previous cost
        insamt: '', // Keep empty for new premium entry  
        prevInsAmt: vehicleData.INS_AMT || '', // Set previous insurance amount
        date: formatDateForInput(vehicleData.DATE) || '',
        year: formatDateForInput(vehicleData.PUR_YEAR) || '',
        currentRcFile: vehicleData.RC_FILE_PATH || '',
        rcFileUrl: vehicleData.RC_FILE_URL || '',
        inedate: formatDateForInput(vehicleData.INS_END) || '',
        inssDate: formatDateForInput(vehicleData.INS_START) || '',
        currentInsFile: vehicleData.INS_FILE || '',
      }));
    }
  }
}, [location.state]);

  // Modified handleSubmit to show confirmation modal first
  const handleSubmit = async () => {
    // Basic validation before showing confirmation
    if (!formData.vehicleNumber || !formData.regDate) {
      setError('Please fill in all required fields (Vehicle Number, Date of Registration)');
      return;
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
    
    // Only send new premium insurance amount if entered
    if (formData.insamt) {
      formDataToSend.append('INS_AMT', formData.insamt);
    }
    
    // Add S_DATE and COST based on status - only new cost if entered
    if (formData.status === 'active' && formData.date) {
      formDataToSend.append('S_DATE', formData.date);
    } else if ((formData.status === 'scrap' || formData.status === 'sold') && formData.date) {
      formDataToSend.append('S_DATE', formData.date);
      if (formData.cost) { // Only send new cost
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
    
    const response = await fetch(`${API_BASE_URL}ModifyTwoWheeler`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken.token}`,
        'Accept': 'application/json',
      },
      body: formDataToSend
    });
    
    const result = await response.json();
    console.log('Two wheeler modify response:', result);
    
    if (!response.ok) {
      if (result.errors) {
        const errorMessages = Object.values(result.errors).flat().join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      } else {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }
    }
    
    if (result.message) {
      setSuccessMessage(result.message || 'Two wheeler data Modified successfully!');
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } else {
      setShowConfirmModal(false);
      throw new Error(result.error || 'Failed to Modify two wheeler data');
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
          {/* Previous Cost Field - Read Only */}
          <div>
            <label className="block text-indigo-800 font-bold text-xs mb-0.5">
              Previous Cost
            </label>
            <input
              type="number"
              name="prevCost"
              value={formData.prevCost}
              className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
              placeholder="Previous cost"
              readOnly
            />
          </div>
          {/* New Cost Field - Editable */}
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
  const highlightedInputStyle = "w-full  bg-white  border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";

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
                    {formData.vehicleNumber ? `Modify Two Wheeler - ${formData.vehicleNumber}` : 'Two Wheeler Change Tab'}
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
                      Fuel Type<span className="text-red-500 ml-1">*</span>
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
                       className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
                       readOnly
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
                       className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
                       readOnly
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
                          className={`${inputStyle} bg-gray-100`}
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
                    className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
                      readOnly
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
                      className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
                      readOnly
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
                     className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
                     readOnly
                    />
                  </div>
                  
                  {/* Insurance Start Date */}
                  <div>
                    <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                     Insurance Start Date<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      name="inssDate"
                      value={formData.inssDate}
                      onChange={handleInputChange}
                     className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
                      readOnly
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
                     className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
                     readOnly
                    />
                  </div>

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
        className={`${inputStyle} bg-gray-100`}
        accept=".pdf,.jpg,.jpeg,.png"
        title="Upload insurance file"
      />
    )}
  </div>
</div>

{/* Previous Insurance Amount - Read Only */}
<div>
  <label className="block text-indigo-800 font-bold text-xs mb-0.5">
    Previous Insurance Amount
  </label>
  <input
    type="number"
    name="prevInsAmt"
    value={formData.prevInsAmt}
    className={`${inputStyle} bg-gray-200 cursor-not-allowed`}
    placeholder="Previous insurance amount"
    readOnly
  />
</div>

{/* Premium Insurance Amount - Editable */}
<div>
  <label className="block text-indigo-800 font-bold text-xs mb-0.5">
    Premium Insurance Amount<span className="text-red-500 ml-1">*</span>
  </label>
  <input
    type="number"
    name="insamt"
    value={formData.insamt}
    onChange={handleInputChange}
    className={highlightedInputStyle}
    placeholder="Enter new premium amount"
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
                  type="button flex"
                  onClick={handleSubmit}
                  disabled={loading || isSubmitting}
                  className="bg-gradient-to-r from-green-800 via-green-500 to-green-600 text-white px-8 py-2 rounded-full hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isSubmitting ? 'Modifying...' : 'Loading...'}
                    </>
                  ) : (
                    <>
                      <Bike className="w-4 h-4" />
                    Modify Two Wheeler
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

              <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Two Wheeler Modify</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to Modify this two wheeler data?
              </p>
             
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
                      <span>Modifying...</span>
                    </>
                  ) : (
                    <>
                      <Bike className="w-4 h-4" />
                      <span>Yes, Modify</span>
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
                Two Wheeler Modified Successfully!
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

export default ModifyTwoWheeler;