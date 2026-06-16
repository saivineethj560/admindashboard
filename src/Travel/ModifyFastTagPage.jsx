import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Car, Shield, ShieldCheck, FileText, Calendar, DollarSign, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Loader2, CreditCard, Receipt } from "lucide-react";
import { ReceiptText } from 'lucide-react';
import { API_BASE_URL } from '../Config';

const ModifyFastTagPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: '',
    fuel: '',
    company: '',
    vehicleModel: '',
    purchaseYear: '',
    plant: '',
    user: '',
    driver: '',
    mobile: '',
    fastFile: null,
    challanFile: null,
    // trafficChallan: '',
    challanAmt: '',
    fastAmt: '',
    trafDt: '',
    fastDt: '',
    tagNo: '',
    tagBank: '',
    tagRegMobile: '',
  });
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fast tag and challan states
  const [showFastTagSection, setShowFastTagSection] = useState(false);
  const [showChallanSection, setShowChallanSection] = useState(false);

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

  // Fetch vehicle data function
  const fetchVehicleData = async (vehicleNumber) => {
    if (!vehicleNumber) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching vehicle data for:', vehicleNumber);
      
      const response = await fetch(`${API_BASE_URL}getFastChange`, {
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
          
          setFormData({
            vehicleNumber: vehicleData.VH_NUMBER || '',
            vehicleType: vehicleData.VH_TYPE || '',
            fuel: vehicleData.FUEL || '',
            company: vehicleData.VH_COMPANY || '',
            vehicleModel: vehicleData.VH_MODEL || '',
            purchaseYear: vehicleData.PUR_YEAR || '',
            plant: vehicleData.COMP_PLANT || '',
            user: vehicleData.VH_USER || '',
            driver: vehicleData.VH_DRIVER || '',
            mobile: vehicleData.MOBILE || '',
            fastFile: null,
            challanFile: null,
            // trafficChallan: vehicleData.TRAFFIC_CHALLAN || '',
            challanAmt:vehicleData.CHALLAN_AMT || '',
            fastAmt: vehicleData.FAST_AMT || '',
            trafDt: vehicleData.TRAF_DT || '',
            fastDt: vehicleData.FAST_DT || '',
            tagNo: vehicleData.TAG_NO || '',
            tagBank: vehicleData.TAG_BANK || '',
            tagRegMobile: vehicleData.TAG_REG_MOBILE || '',
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

  // Handle submit - show confirmation modal
  const handleSubmit = async () => {
    setShowConfirmModal(true);
  };

  // Handle confirmed submission
  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add all form fields - make sure field names match PHP expectations
      formDataToSend.append('vehicleNumber', formData.vehicleNumber);
      formDataToSend.append('vehicleType', formData.vehicleType);
      formDataToSend.append('fuel', formData.fuel);
      formDataToSend.append('company', formData.company);
      formDataToSend.append('vehicleModel', formData.vehicleModel);
      formDataToSend.append('purchaseYear', formData.purchaseYear);
      formDataToSend.append('plant', formData.plant);
      formDataToSend.append('user', formData.user);
      formDataToSend.append('driver', formData.driver);
      formDataToSend.append('mobile', formData.mobile);
      // formDataToSend.append('trafficChallan', formData.trafficChallan);
      formDataToSend.append('challanAmt', formData.challanAmt || '0');
      formDataToSend.append('fastAmt', formData.fastAmt || '0');
      formDataToSend.append('trafDt', formData.trafDt);
      formDataToSend.append('fastDt', formData.fastDt);
      formDataToSend.append('tagNo', formData.tagNo);
      formDataToSend.append('tagBank', formData.tagBank);
      formDataToSend.append('tagRegMobile', formData.tagRegMobile);
      
      // Add files if they exist
      if (formData.fastFile) {
        formDataToSend.append('fastFile', formData.fastFile);
      }
      if (formData.challanFile) {
        formDataToSend.append('challanFile', formData.challanFile);
      }
      
      console.log('Submitting FastTag data:', formData);
      
      const response = await fetch(`${API_BASE_URL}ModifyFastTagData`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken.token}`,
          'Accept': 'application/json',
          // Don't set Content-Type header - let browser set it for FormData
        },
        body: formDataToSend
      });
      
      // Get response text first to debug
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
      
      console.log('Update response:', result);
      
      if (result.status) {
        setSuccessMessage(result.message || 'FastTag and Challan data updated successfully!');
        setShowConfirmModal(false);
        setShowSuccessModal(true);
      } else {
        setShowConfirmModal(false);
        throw new Error(result.message || 'Failed to update FastTag data');
      }
      
    } catch (error) {
      console.error('Error updating FastTag data:', error);
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
          fuel: vehicleData.fuelType || '',
          company: vehicleData.vehicleCompany || '',
          vehicleModel: vehicleData.vehicleModel || '',
          purchaseYear: vehicleData.purchaseYear || '',
          plant: vehicleData.companyPlant || '',
          user: vehicleData.userOrDept || '',
          driver: vehicleData.driverName || '',
          mobile: vehicleData.driverMobile || '',
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

  const toggleFastTagSection = () => {
    setShowFastTagSection(!showFastTagSection);
    if (!showFastTagSection) {
      setShowChallanSection(false);
    }
  };

  const toggleChallanSection = () => {
    setShowChallanSection(!showChallanSection);
    if (!showChallanSection) {
      setShowFastTagSection(false);
    }
  };

  // Styling
  const inputStyle = "w-full border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";
  const highlightedInputStyle = "w-full border border-blue-500 rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";

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
                    {formData.vehicleNumber ? `Modify Fast Tag / Challan - ${formData.vehicleNumber}` : 'Fast Tag / Challan Change Tab'}
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

                {/* Key Form Fields */}
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

                  {/* Fuel Type */}
                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Fuel Type<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      name="fuel"
                      value={formData.fuel}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                      readOnly
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="w-1/3 text-indigo-800 font-bold text-xs">
                      Company & Plant<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      name="plant"
                      value={formData.plant}
                      onChange={handleInputChange}
                      className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
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
                </div>
              </div>

              {/* All Form Fields Section */}
              <div className="mx-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
                      name="driver"
                      value={formData.driver}
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
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={inputStyle}
                    />
                  </div>
                </div>

                {/* Fast Tag and Challan Toggle Buttons */}
                <div className="mt-4 flex justify-center gap-4">
                  {/* Fast Tag Button */}
                  <button
                    onClick={toggleFastTagSection}
                    className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-600 text-white px-8 py-3 rounded-full hover:from-blue-600 hover:via-cyan-600 hover:to-teal-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="font-semibold">Fast Tag</span>
                    {showFastTagSection ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>

                  {/* Challan Button */}
                  <button
                    onClick={toggleChallanSection}
                    className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white px-8 py-3 rounded-full hover:from-red-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Receipt className="w-5 h-5" />
                    <span className="font-semibold">Challan</span>
                    {showChallanSection ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Fast Tag Section - Collapsible */}
                {showFastTagSection && (
                  <div className="mt-4 border-2 border-blue-500 rounded-lg p-3 shadow-sm bg-blue-50 transform transition-all duration-300 ease-in-out">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Fast Tag Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Fast Tag ID */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Fast Tag ID <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="tagNo"
                          value={formData.tagNo}
                          onChange={handleInputChange}
                          className={inputStyle}
                          placeholder="Enter Fast Tag ID"
                        />
                      </div>

                      {/* Fast Tag Mobile */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Fast Tag Mobile No <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="number"
                          name="tagRegMobile"
                          value={formData.tagRegMobile}
                          onChange={handleInputChange}
                          className={inputStyle}
                          placeholder="Enter mobile no"
                        />
                      </div>

                      {/* Fast Tag Bank */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Fast Tag Bank<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="tagBank"
                          value={formData.tagBank}
                          onChange={handleInputChange}
                          className={inputStyle}
                          placeholder="Enter bank name"
                        />
                      </div>

                      {/* Fast Tag Date */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Fast Tag Date <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="date"
                          name="fastDt"
                          value={formData.fastDt}
                          onChange={handleInputChange}
                          className={inputStyle}
                        />
                      </div>

                      {/* Fast Tag Amount */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Fast Tag Amt<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="number"
                          name="fastAmt"
                          value={formData.fastAmt}
                          onChange={handleInputChange}
                          className={inputStyle}
                          placeholder="Enter amount"
                        />
                      </div>

                      {/* Fast Tag Document Upload */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Fast tag Upload <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="file"
                          name="fastFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleInputChange}
                          className="block w-full text-xs text-gray-700 border border-blue-500 rounded-full cursor-pointer file:mr-2 file:py-0.5 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Challan Section - Collapsible */}
                {showChallanSection && (
                  <div className="mt-4 border-2 border-red-500 rounded-lg p-3 shadow-sm bg-red-50 transform transition-all duration-300 ease-in-out">
                    <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <Receipt className="w-5 h-5" />
                      Challan Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Challan Number */}
                      {/* <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Number of Challan  <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="trafficChallan"
                          value={formData.trafficChallan}
                          onChange={handleInputChange}
                          className={inputStyle}
                          placeholder="Enter Challan Number"
                        />
                      </div> */}

                      {/* Challan Amount */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                         Total Amount of Challan  <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="number"
                          name="challanAmt"
                          value={formData.challanAmt}
                          onChange={handleInputChange}
                          className={inputStyle}
                          placeholder="Enter amount"
                        />
                      </div>

                      {/* Challan Date */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Challan Check Date <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="date"
                          name="trafDt"
                          value={formData.trafDt}
                          onChange={handleInputChange}
                          className={inputStyle}
                        />
                      </div>

                      {/* Challan Document Upload */}
                      <div>
                        <label className="block text-indigo-800 font-bold text-xs mb-0.5">
                          Challan Document <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="file"
                          name="challanFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleInputChange}
                          className="block w-full text-xs text-gray-700 border border-blue-500 rounded-full cursor-pointer file:mr-2 file:py-0.5 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                        />
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
                      Update Details
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal - Updated Style */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Warning Icon */}
            {/* Warning Icon */}
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Submission</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to update this FastTag/Challan data?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Vehicle: <span className="font-medium">{formData.vehicleNumber}</span>
              </p>
              
              <div className="flex justify-center gap-4">
                {/* ❌ No, Cancel */}
                <button
                  onClick={handleConfirmModalClose}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition-all duration-200"
                >
                  No, Cancel
                </button>
                
                {/* ✅ Yes, Submit */}
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

      {/* Success Modal - Complete */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              {/* Enhanced Success Animation */}
              <div className="mb-3 flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
  <ReceiptText className="w-10 h-10 text-white" />
</div>
                  <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-ping opacity-25"></div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                FastTag/Challan Updated Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                {successMessage || `Vehicle ${formData.vehicleNumber} FastTag/Challan details have been updated.`}
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

export default ModifyFastTagPage;