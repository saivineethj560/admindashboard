import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../Config';
import StockLineItemsTable from "./StockLineItemsTable.jsx";

const StockRequestForm = () => {
  const navigate = useNavigate();

  const [userToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo')) || {};
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [allPlants, setAllPlants] = useState([]);
  const [filteredSenderPlants, setFilteredSenderPlants] = useState([]);
  const [filteredReceiverPlants, setFilteredReceiverPlants] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    requestor_name: userToken.employee || "",
    emp_id: userToken.Emp_Id || "",
    department: userToken.Department || "",
    email: userToken.Email || "",
    contact_no: "",
    sender_company_code: "",
    sender_plant_code: "",
    receiver_company_code: "",
    receiver_plant_code: "",
    items: [{
      description: "",
      material_code: "",
      unit: "",
      prev_qty: "",
      req_qty: "",
      prev_rate: "",
      cumulative_qty: "",
      remarks: ""
    }],
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch(`${API_BASE_URL}comp_plant_codes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken.token}`
          }
        });
        const result = await response.json();

        if (result.success && result.data) {
          setAllPlants(result.data);
          const companyMap = new Map();
          result.data.forEach(item => {
            if (!companyMap.has(item.company_code)) {
              companyMap.set(item.company_code, `${item.company_code} - ${item.company_name}`);
            }
          });
          setCompanies(Array.from(companyMap.values()));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    if (userToken.token) fetchData();
  }, [userToken.token]);

  const handleCompanyChange = (e, type) => {
    const selectedValue = e.target.value;
    const companyCode = selectedValue.split(' - ')[0];
    const filtered = allPlants.filter(p => p.company_code === companyCode);

    console.log('Selected Company:', selectedValue);
    console.log('Company Code:', companyCode);
    console.log('Filtered Plants:', filtered);

    if (type === 'sender') {
      setFilteredSenderPlants(filtered);
      setFormData(prev => ({
        ...prev,
        sender_company_code: selectedValue,
        sender_plant_code: "",
      }));
    } else {
      setFilteredReceiverPlants(filtered);
      setFormData(prev => ({
        ...prev,
        receiver_company_code: selectedValue,
        receiver_plant_code: "",
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    if (field === 'prev_qty' || field === 'req_qty') {
      const prevQty = parseFloat(updatedItems[index].prev_qty) || 0;
      const reqQty = parseFloat(updatedItems[index].req_qty) || 0;
      updatedItems[index].cumulative_qty = prevQty + reqQty;
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: "", material_code: "", unit: "", prev_qty: "",
        req_qty: "", prev_rate: "", cumulative_qty: "", remarks: ""
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sender_company_code || !formData.sender_plant_code ||
      !formData.receiver_company_code || !formData.receiver_plant_code) {
      Swal.fire("Required", "Please select both Sender and Receiver Company/Plant details", "warning");
      return;
    }

    const validItems = formData.items.filter(item => item.material_code.trim() !== "");
    if (validItems.length === 0) {
      Swal.fire("Incomplete Table", "Please select at least one material", "warning");
      return;
    }

    const confirmResult = await Swal.fire({
      title: 'Confirm Submission?',
      text: "Submit this stock transfer request?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4183a5',
      confirmButtonText: 'Yes, Submit'
    });

    if (!confirmResult.isConfirmed) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('date', formData.date);
      data.append('requestor_name', formData.requestor_name);
      data.append('emp_id', formData.emp_id);
      data.append('department', formData.department);
      data.append('email', formData.email);
      data.append('contact_no', formData.contact_no);
      data.append('sender_company_code', formData.sender_company_code);
      data.append('sender_plant_code', formData.sender_plant_code);
      data.append('receiver_company_code', formData.receiver_company_code);
      data.append('receiver_plant_code', formData.receiver_plant_code);
      data.append('items', JSON.stringify(validItems));

      const response = await fetch(`${API_BASE_URL}submit-stock-request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken.token}` },
        body: data
      });

      const result = await response.json();
      if (result.success) {
        await Swal.fire('Success!', 'Request submitted.', 'success');
        navigate('/dashboard');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = "w-2/3 text-indigo-800 font-bold text-[11px] pr-2 uppercase";
  const inputBaseStyle = "w-full border-2 border-blue-300 rounded-lg py-1.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-blue-400";
  const readonlyStyle = `${inputBaseStyle} bg-gradient-to-r from-gray-50 to-gray-100 cursor-not-allowed text-gray-700 font-medium`;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="overflow-hidden bg-white border-2 border-blue-200 shadow-xl rounded-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-blue-300 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100">
          <div className="flex items-center">
            <img 
              src="./stquote.png" 
              alt="Logo" 
              className="object-contain h-8 transition-all duration-300 rounded shadow-sm hover:scale-105" 
            />
          </div>
          
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] px-16 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            <span className="text-2xl">📦</span>
            <h1 className="text-lg font-bold tracking-wider text-white uppercase">
              Stock Transfer Request
            </h1>
          </div>
          
          <button type="button" onClick={() => navigate(-1)} className="text-blue-500 hover:bg-blue-50 rounded-full p-1.5 border border-blue-400 transition-all duration-200 hover:scale-110 active:scale-95">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 bg-gradient-to-b from-white to-gray-50">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">

              {/* Icon Section */}
              <div className="flex flex-col items-center justify-center p-4 transition-all duration-300 border-2 border-blue-200 shadow-lg lg:col-span-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl hover:shadow-xl hover:scale-105">
                <img src="./022.png" alt="Stock Transfer Icon" className="object-contain w-full h-full transition-transform duration-300 hover:scale-110" />
              </div>

              {/* Form Fields */}
              <div className="space-y-3 lg:col-span-3">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">👤</span>
                      Emp ID
                    </label>
                    <input type="text" value={formData.emp_id} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">📅</span>
                      Date
                    </label>
                    <input type="text" value={new Date(formData.date).toLocaleDateString('en-GB')} readOnly className={readonlyStyle} />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">✍️</span>
                      Req By
                    </label>
                    <input type="text" value={formData.requestor_name} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">📧</span>
                      Email
                    </label>
                    <input type="text" value={formData.email} readOnly className={readonlyStyle} />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">🏢</span>
                      Dept
                    </label>
                    <input type="text" value={formData.department} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">📞</span>
                      Raiser Contact <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="contact_no" 
                      required 
                      value={formData.contact_no} 
                      onChange={handleInputChange} 
                      className={inputBaseStyle} 
                      placeholder="Enter Extension/Mobile Number" 
                    />
                  </div>
                </div>

                {/* Row 4 - Receiver & Sender Company */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center group">
<label className={`${labelStyle} text-green-700 flex items-center`}>
                      <span className="text-blue-500">🏭</span>
                      Receiver Cmp <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.receiver_company_code}
                      onChange={(e) => handleCompanyChange(e, 'receiver')}
                      className={`${inputBaseStyle} hover:border-blue-500`}
                    >
                      <option value="">{isLoadingData ? "Loading..." : "Select Receiver Company"}</option>
                      {companies.map((code, idx) => (
                        <option key={idx} value={code}>{code}</option>
                      ))}
                    </select>

                  </div>
                  <div className="flex items-center group">
<label className={`${labelStyle} text-green-700 flex items-center gap-1`}>
                      <span className="text-blue-500">🏭</span>
                      Sender cmp <span className="text-red-500">*</span>
                    </label>                    <select
                      required
                      value={formData.sender_company_code}
                      onChange={(e) => handleCompanyChange(e, 'sender')}
                      className={`${inputBaseStyle} hover:border-blue-500`}
                    >
                      <option value="">{isLoadingData ? "Loading..." : "Select Sender Company"}</option>
                      {companies.map((code, idx) => (
                        <option key={idx} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 5 - Receiver & Sender Plant */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center group">
 <label className={`${labelStyle} text-green-700 flex items-center gap-1`}>
                      <span className="text-blue-500">🏗️</span>
                      Receiver Plant <span className="text-red-500">*</span>
                    </label>                    <select
                      name="receiver_plant_code"
                      required
                      disabled={!formData.receiver_company_code}
                      value={formData.receiver_plant_code}
                      onChange={handleInputChange}
                      className={`${inputBaseStyle} hover:border-blue-500 ${!formData.receiver_company_code ? 'bg-gray-100 opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select Receiver Plant</option>
                      {filteredReceiverPlants.map((p, idx) => (
                        <option key={idx} value={`${p.plant_code}-${p.plant_name}`}>
                          {p.plant_code} - {p.plant_name}
                        </option>
                      ))}
                    </select>

                  </div>
                  <div className="flex items-center group">
                   <label className={`${labelStyle} text-green-700 flex items-center gap-1`}>
                      <span className="text-blue-500">🏗️</span>
                      Sender Plant <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="sender_plant_code"
                      required
                      disabled={!formData.sender_company_code}
                      value={formData.sender_plant_code}
                      onChange={handleInputChange}
                      className={`${inputBaseStyle} hover:border-blue-500 ${!formData.sender_company_code ? 'bg-gray-100 opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select Sender Plant</option>
                      {filteredSenderPlants.map((p, idx) => (
                        <option key={idx} value={`${p.plant_code}-${p.plant_name}`}>
                          {p.plant_code} - {p.plant_name}
                        </option>
                      ))}
                    </select>

                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="pt-2 mt-1 border-t border-gray-100">
              <StockLineItemsTable
                items={formData.items}
                handleItemChange={handleItemChange}
                addItem={addItem}
                removeItem={removeItem}
                userToken={userToken}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-8">
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex items-center gap-3 px-10 py-3 text-sm font-bold tracking-wider text-white uppercase transition-all duration-300 bg-gradient-to-r from-[#4183a5] via-[#3e7e9b] to-[#3a7590] rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Stock Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockRequestForm;
