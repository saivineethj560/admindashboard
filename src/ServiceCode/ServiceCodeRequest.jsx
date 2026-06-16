import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../Config';
import ServiceItemTable from "./ServiceItemTable.jsx";

const ServiceCodeRequest = () => {
  const navigate = useNavigate();

  const [userToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo')) || {};
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Updated state to match ServiceItemTable fields
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    requestor_name: userToken.employee || "",
    emp_id: userToken.Emp_Id || "",
    department: userToken.Department || "",
    email: userToken.Email || "",
    contact_no: "",
    items: [{
      service_category: "",
      valuation_class: "",
      description: "",
      uom: "",
      wrkstatus: "",
      additional_description: "",
      material_group: "",
      remarks: "" // Added field
    }],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        service_category: "",
        valuation_class: "",
        description: "",
        uom: "",
      wrkstatus: "",
      additional_description: "",
        material_group: "",
        remarks: "" // Added field
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

    // Updated validation logic for Service fields
    const isTableValid = formData.items.every(item => 
      item.service_category && 
      item.valuation_class && 
      item.description.trim() !== "" && 
      item.uom && 
      item.wrkstatus && 
      item.additional_description && 
      item.material_group
    );

    if (!isTableValid) {
      Swal.fire("Incomplete Table", "Please fill all required fields in the service table.", "warning");
      return;
    }

    const confirmResult = await Swal.fire({
      title: 'Confirm Submission?',
      text: "Are you sure you want to raise this service creation request?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4183a5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Submit'
    });

    if (!confirmResult.isConfirmed) return;
    
    setIsSubmitting(true);
    try {
      // Sending as JSON is cleaner for structured data
      const response = await fetch(`${API_BASE_URL}submit-service-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken.token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: 'Success!',
          text: result.message || 'Service request submitted successfully.',
          icon: 'success',
          timer: 2000
        });
        navigate('/dashboard');
      } else {
        throw new Error(result.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      Swal.fire('Error', error.message || 'Failed to connect to the server.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable styles
  const labelStyle = "w-2/3 text-indigo-800 font-bold text-[11px] pr-2 uppercase";
  const inputBaseStyle = "w-full border-2 border-blue-300 rounded-lg py-1.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-blue-400";
  const readonlyStyle = `${inputBaseStyle} bg-gradient-to-r from-gray-50 to-gray-100 cursor-not-allowed text-gray-700 font-medium`;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="overflow-hidden bg-white border-2 border-blue-200 shadow-xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-blue-300 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100">
          <div className="flex items-center">
            <img src="./squote.png" alt="Logo" className="object-contain h-8 transition-all duration-300 rounded shadow-sm hover:scale-105" />
          </div>

          <div className="flex items-center gap-3 bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] px-16 py-2 rounded-lg shadow-md">
            <span className="text-2xl">🛠️</span>
            <h1 className="text-lg font-bold tracking-wider text-white uppercase">
              Service Creation Request
            </h1>
          </div>

          <button type="button" onClick={() => navigate(-1)} className="text-blue-500 hover:bg-blue-50 rounded-full p-1.5 border border-blue-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 bg-gradient-to-b from-white to-gray-50">
          <form onSubmit={handleSubmit}>
            <div className="grid items-start grid-cols-1 gap-4 mb-4 lg:grid-cols-4">
              <div className="flex flex-col items-center justify-center p-2 border-2 border-blue-200 shadow-lg lg:col-span-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl h-[130px]">
                <img src="./slogo.png" alt="Icon" className="object-contain w-full h-full" />
              </div>

              <div className="space-y-3 lg:col-span-3">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center"><label className={labelStyle}>👤 Emp ID</label><input type="text" value={formData.emp_id} readOnly className={readonlyStyle} /></div>
                  <div className="flex items-center"><label className={labelStyle}>📅 Date</label><input type="text" value={new Date(formData.date).toLocaleDateString('en-GB')} readOnly className={readonlyStyle} /></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center"><label className={labelStyle}>✍️ Req By</label><input type="text" value={formData.requestor_name} readOnly className={readonlyStyle} /></div>
                  <div className="flex items-center"><label className={labelStyle}>📧 Email</label><input type="text" value={formData.email} readOnly className={readonlyStyle} /></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center"><label className={labelStyle}>🏢 Dept</label><input type="text" value={formData.department} readOnly className={readonlyStyle} /></div>
                  <div className="flex items-center">
                    <label className={labelStyle}>📞 Contact <span className="text-red-500">*</span></label>
                    <input type="text" name="contact_no" required value={formData.contact_no} onChange={handleInputChange} className={inputBaseStyle} placeholder="Ext / Mobile" />
                  </div>
                </div>
              </div>
            </div>

            <ServiceItemTable
              items={formData.items}
              handleItemChange={handleItemChange}
              addItem={addItem}
              removeItem={removeItem}
              userToken={userToken}
            />

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-3 px-10 py-3 text-sm font-bold tracking-wider text-white uppercase transition-all duration-300 bg-gradient-to-r from-[#4183a5] to-[#3a7590] rounded-full shadow-lg hover:scale-105 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Submit Service Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceCodeRequest;