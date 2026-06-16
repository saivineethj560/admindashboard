import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { HiCloudUpload, HiTrash } from 'react-icons/hi';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../Config';
import ScrapLineItemsTable from "./ScrapLineItemsTable.jsx";

const ScrapSaleRequestForm = () => {
  const navigate = useNavigate();

  const [userToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo')) || {};
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plants, setPlants] = useState([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    requestor_name: userToken.employee || "",
    emp_id: userToken.Emp_Id || "",
    department: userToken.Department || "",
    email: userToken.Email || "",
    contact_no: "",
    profit_center: "",
    plant: "",
    items: [{
      description: "",
      material_code: "",
      unit: "",
      prev_qty: "",
      prev_rate: "",
      cumulative_qty: "",
      sale_request_qty: "",
      remarks: ""
    }],
  });

  useEffect(() => {
    const fetchPlants = async () => {
      setIsLoadingPlants(true);
      try {
        const response = await fetch(`${API_BASE_URL}all-plant-data`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken.token}`
          }
        });
        const result = await response.json();
        if (result.success && result.data) setPlants(result.data);
      } catch (error) {
        console.error("Error fetching plants:", error);
      } finally {
        setIsLoadingPlants(false);
      }
    };
    if (userToken.token) fetchPlants();
  }, [userToken.token]);

  const handlePlantChange = (e) => {
    const combinedValue = e.target.value;
    const selectedPlantCode = combinedValue.split(' - ')[0];
    const selectedPlantObj = plants.find(p => p.plant_code === selectedPlantCode);

    setFormData(prev => ({
      ...prev,
      plant: combinedValue,
      profit_center: selectedPlantObj ? selectedPlantObj.profit_center : ""
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      Swal.fire("Limit Exceeded", "You can only upload up to 5 documents", "warning");
      return;
    }
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: "", material_code: "", unit: "", prev_qty: "",
        prev_rate: "", cumulative_qty: "", sale_request_qty: "", remarks: ""
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
    if (selectedFiles.length === 0) {
      Swal.fire("Missing Files", "Please upload the Scrap Lifting Request documents", "error");
      return;
    }
    const validItems = formData.items.filter(item => item.material_code.trim() !== "" && parseFloat(item.sale_request_qty) > 0);
    if (validItems.length === 0) {
      Swal.fire("Incomplete Table", "Please select at least one material and enter a valid Sale Quantity", "warning");
      return;
    }

    const confirmResult = await Swal.fire({
      title: 'Confirm Submission?',
      text: "Are you sure you want to raise this scrap sale request?",
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
      data.append('plant', formData.plant);
      data.append('profit_center', formData.profit_center);
      data.append('items', JSON.stringify(validItems));
      selectedFiles.forEach((file) => data.append('files[]', file));

      const response = await fetch(`${API_BASE_URL}submit-scrap-request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken.token}` },
        body: data
      });

      const result = await response.json();
      if (result.success) {
        await Swal.fire('Success!', result.message, 'success');
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

  // STYLES FROM STOCK FORM
  const labelStyle = "w-2/3 text-indigo-800 font-bold text-[11px] pr-2 uppercase";
  const inputBaseStyle = "w-full border-2 border-blue-300 rounded-lg py-1.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-blue-400";
  const readonlyStyle = `${inputBaseStyle} bg-gradient-to-r from-gray-50 to-gray-100 cursor-not-allowed text-gray-700 font-medium`;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="overflow-hidden bg-white border-2 border-blue-200 shadow-xl rounded-2xl">
        
        {/* Header - Matching Stock Form */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-blue-300 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100">
          <div className="flex items-center">
            <img src="./scquote.png" alt="Logo" className="object-contain h-8 transition-all duration-300 rounded shadow-sm hover:scale-105" />
          </div>
          
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] px-16 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            <span className="text-2xl">♻️</span>
            <h1 className="text-lg font-bold tracking-wider text-white uppercase">Scrap Sale Request</h1>
          </div>
          
          <button type="button" onClick={() => navigate(-1)} className="text-blue-500 hover:bg-blue-50 rounded-full p-1.5 border border-blue-400 transition-all duration-200 hover:scale-110 active:scale-95">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
        </div>

        <div className="p-6 bg-gradient-to-b from-white to-gray-50">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
              
              {/* Left Side: Shrunken Illustration Container */}
              <div className="flex flex-col items-center justify-center p-4 transition-all duration-300 border-2 border-blue-200 shadow-lg lg:col-span-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl hover:shadow-xl hover:scale-105">
                <img src="./sclimage.png" alt="Scrap Icon" className="object-contain w-full h-full transition-transform duration-300 hover:scale-110" />
              </div>

              {/* Right Side: Form Fields */}
              <div className="space-y-3 lg:col-span-3">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">👤</span> Emp ID
                    </label>
                    <input type="text" value={formData.emp_id} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">📅</span> Date
                    </label>
                    <input type="text" value={new Date(formData.date).toLocaleDateString('en-GB')} readOnly className={readonlyStyle} />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">✍️</span> Req By
                    </label>
                    <input type="text" value={formData.requestor_name} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">📧</span> Email
                    </label>
                    <input type="text" value={formData.email} readOnly className={readonlyStyle} />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">🏢</span> Dept
                    </label>
                    <input type="text" value={formData.department} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">📞</span> Raiser Contact <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="contact_no" required value={formData.contact_no} onChange={handleInputChange} className={inputBaseStyle} placeholder="Ext/Mobile" />
                  </div>
                </div>

                {/* Row 4: Plant & Profit Center */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">🏭</span> Plant <span className="text-red-500">*</span>
                    </label>
                    <select name="plant" required value={formData.plant} onChange={handlePlantChange} className={inputBaseStyle}>
                      <option value="">{isLoadingPlants ? "Loading..." : "Select Plant"}</option>
                      {plants.map((p, idx) => (
                        <option key={idx} value={`${p.plant_code} - ${p.plant_name}`}>{p.plant_code} - {p.plant_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center group">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">💰</span> Profit Center
                    </label>
                    <input type="text" value={formData.profit_center} readOnly className={readonlyStyle} />
                  </div>
                </div>

                {/* Row 5: File Upload with New Styling */}
                <div className="flex items-center pt-1 group">
                  <label className="w-[32.5%] text-indigo-800 font-bold text-[11px] uppercase pr-2 flex items-center gap-1">
                    <span className="text-blue-500">📎</span> Lifting Req <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center w-full gap-4">
                    <div className="relative">
                      <input type="file" multiple onChange={handleFileChange} id="file-upload" className="hidden" />
                      <label htmlFor="file-upload" className="flex items-center gap-2 px-4 py-1.5 border-2 border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 text-blue-600 font-bold text-[10px] uppercase shadow-sm transition-all duration-200 hover:border-blue-400">
                        <HiCloudUpload size={16} /> Browse Documents
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 rounded-md border border-blue-200 text-[10px] text-blue-800 shadow-sm animate-in fade-in zoom-in duration-200">
                          <span className="max-w-[120px] truncate font-medium">{file.name}</span>
                          <button type="button" onClick={() => removeFile(idx)} className="text-red-500 transition-colors hover:text-red-700">
                            <HiTrash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Table Section */}
            <div className="pt-2 mt-1 border-t border-gray-100">
              <ScrapLineItemsTable
                items={formData.items}
                handleItemChange={handleItemChange}
                addItem={addItem}
                removeItem={removeItem}
                userToken={userToken}
              />
            </div>

            {/* Submit Button - Matching Stock Form */}
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
                    Submit Scrap Request
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

export default ScrapSaleRequestForm;