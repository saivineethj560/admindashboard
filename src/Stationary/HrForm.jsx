import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { HiTrash } from 'react-icons/hi';
import { API_BASE_URL } from '../Config';



const HrForm = () => 
{
  const [userToken, setToken] = useState(() => {
  try 
  {
    return JSON.parse(localStorage.getItem('userInfo')) || {};
  } catch (error) {
    console.error('Failed to parse userInfo from localStorage:', error);
    return {};
  }
});

//console.log(`JWT TOKEN ${userToken.token}`);
  // Initialize form data with user information from token
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    request_for: "",
    name: userToken.employee || "",
    email: userToken.Email || "",
    emp_id: userToken.Emp_Id || "",
    department: "",
    hod_name: "",
    items: [{ stationary: "", quantity: "", remarks: "" }],
  });

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "submit", "draft", or "error"
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const navigate = useNavigate();



  const stationeryOptions = {
   Standard: [    "CALCULATOR (Nos.)",    "SKETCH PENS (ALL COLOURS) (Pkts.)",    "SCRIBBLING PADS NOS 5 - PLANE (Nos.)",    "SCRIBBLING PADS NOS 6 - PLANE (Nos.)",    "SCRIBBLING PADS NOS 7 - PLANE (Nos.)",    "PEN STAND (Nos.)",    "FEVISTICK BIG (Nos.)",    "PLASTIC SCALE (Nos.)",    "CUTTER - SMALL (Nos.)",    "CD MARKER PENS (Nos.)",    "HIGH LIGHTERS (GREEN) (Nos.)",    "JUM CLIP - SMALL (Pkts.)",    "BINDING CLIPS - 15MM (Pkts.)",    "PIN REMOVER SR 100 (Nos.)",    "STAPLER SMALL (Nos.)",    "STAPLER PINS SMALL (Nos.",    "PEN BLUE (Nos.)",    "PEN BLACK (Nos.)",    "PEN RED (Nos.)",    "PENCIL (Nos.)",    "ERASERS (Nos.)",    "SHARPENERS (Nos.)",    "POST IT PAD SMALL - ALL COLOURS (Pads)",    "WHITENER PEN (Nos.)",    "PUNCHING MACHINE DP 600 (Nos.)",    "DIARY NOTE BOOK",    "STEEL WATER BOTTLES(Nos.)"
     ],
   Projects: 
    [
      "SCIENTIFIC CALCULATOR (Nos.)","NOTICE BOARD PINS (Pkts.)","SKETCH PENS (ALL COLOURS) (Pkts.)",    "STABILO PENS (Pkts.)",    "SCRIBBLING PADS NOS 5 - PLANE (Nos.)",    "SCRIBBLING PADS NOS 6 - PLANE (Nos.)",    "SCRIBBLING PADS NOS 7 - PLANE (Nos.)",    "PEN STAND (Nos.)",    "FEVISTICK BIG (Nos.)",    "PLASTIC SCALE (Nos.)",    "CUTTER - SMALL (Nos.)",    "CD MARKER PENS (Nos.)",    "HIGH LIGHTERS (GREEN) (Nos.)",    "JUM CLIP - SMALL (Pkts.)",    "BINDING CLIPS - 15MM (Pkts.)",    "PIN REMOVER SR 100 (Nos.)",    "STAPLER SMALL (Nos.)",    "STAPLER PINS SMALL (Nos.)",    "PEN BLUE (Nos.)",    "PEN BLACK (Nos.)",    "PEN RED (Nos.)",    "GEL PEN BLUE (Nos.)",    "GEL PEN BLACK (Nos.)",    "PENCIL (Nos.)",    "ERASERS (Nos.)",    "SHARPENERS (Nos.)",    "POST IT PAD SMALL - ALL COLOURS (Pads)",    "POST IT PAD - MEDIUM (Pads)",    "WHITENER PEN (Nos.)",    "PUNCHING MACHINE DP 600 (Nos.)",    "DIARY NOTE BOOK",    "STEEL WATER BOTTLES(Nos.)"
    ],

};
const stationeryItems = [
  "CALCULATOR (Nos.)",  "SKETCH PENS (ALL COLOURS) (Pkts.)",  "SCRIBBLING PADS NOS 5 - PLANE (Nos.)",  "SCRIBBLING PADS NOS 6 - PLANE (Nos.)",  "SCRIBBLING PADS NOS 7 - PLANE (Nos.)",  "PEN STAND (Nos.)",  "FEVISTICK BIG (Nos.)",  "PLASTIC SCALE (Nos.)",  "CUTTER - SMALL (Nos.)",  "CD MARKER PENS (Nos.)",  "HIGH LIGHTERS (GREEN) (Nos.)",  "JUM CLIP - SMALL (Pkts.)",  "BINDING CLIPS - 15MM (Pkts.)",  "PIN REMOVER SR 100 (Nos.)",  "STAPLER SMALL (Nos.)",  "STAPLER PINS SMALL (Nos.)",  "PEN BLUE (Nos.)",  "PEN BLACK (Nos.)",  "PEN RED (Nos.)",  "PENCIL (Nos.)",  "ERASERS (Nos.)",  "SHARPENERS (Nos.)",  "POST IT PAD SMALL - ALL COLOURS (Pads)",  "WHITENER PEN (Nos.)",  "PUNCHING MACHINE DP 600 (Nos.)",  "DIARY NOTE BOOK",  "STEEL WATER BOTTLES(Nos.)"
];



  // Set only today's date when form loads, clear localStorage on refresh
  useEffect(() => {
    // Check if this is a page refresh
    const isPageRefresh = performance.navigation &&
      performance.navigation.type === 1;

    // Alternative check for browsers that don't support performance.navigation
    if (isPageRefresh || document.referrer === document.location.href) {
      // Clear localStorage on page refresh
      localStorage.removeItem('stationeryFormDraft');
    }

    // Always set today's date
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: formattedDate }));
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const validateForm = () => {
    const newErrors = {};
    // const requiredFields = ['date', 'request_for', 'name', 'email', 'emp_id', 'department', 'hod_name'];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }

    // Validate each item in the items array
    let hasItemError = false;
    formData.items.forEach((item, index) => {
      if (!item.stationary || !item.quantity) {
        hasItemError = true;
      }
    });

    if (hasItemError) {
      newErrors.items = 'All stationery items must have both type and quantity selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear the error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRadioChange = (value) => {
    setFormData(prev => ({ ...prev, request_for: value }));

    // Clear the error for this field if it exists
    if (errors.request_for) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.request_for;
        return newErrors;
      });
    }
  };

  const handleItemChange = (e, index) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setFormData(prev => ({ ...prev, items: updatedItems }));

    // Clear the items error if all items now have values
    if (errors.items) {
      const allItemsValid = updatedItems.every(item => item.stationary && item.quantity);
      if (allItemsValid) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.items;
          return newErrors;
        });
      }
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { stationary: "", quantity: "", remarks: "" }],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleReset = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    setFormData({
      date: formattedDate,
      request_for: "",
      name: userToken.employee || "",
      email: userToken.Email || "",
      emp_id: userToken.Emp_Id || "",
      department: "",
      hod_name: "",
      items: [{ stationary: "", quantity: "", remarks: "" }],
    });
    setErrors({});
    setAttempted(false);

    // Clear the saved draft from localStorage
    localStorage.removeItem('stationeryFormDraft');
  };

  const handleSaveAsDraft = () => 
  {
    // Save form data to localStorage
    localStorage.setItem('stationeryFormDraft', JSON.stringify(formData));
    // Show the draft modal
    setModalType("draft");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true); // Mark that submission was attempted
    try {
      const responseData = await fetch(`${API_BASE_URL}mp-stationary-store`,
        {
          method: "POST",
          headers:
          {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${userToken.token}`
          },
          body: JSON.stringify(formData)
        })
      setModalType("submit");
      setShowModal(true);
    }
    catch (error) {
      console.error("Error in Storing Data");
      setModalType("error");
      setShowModal(true);
    }
  };
  const inputStyle = "w-full border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";
  const highlightedInputStyle = "w-full border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";
  const errorInputStyle = "w-full border border-red-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-400 bg-red-50";

  // Function to determine the correct style for input fields
  const getInputStyle = (fieldName) => {
    if (errors[fieldName] && attempted) {
      return errorInputStyle;
    }

    // Highlighted fields are date, name, email, emp_id
    if (['date', 'name', 'email', 'emp_id','department','department_hod'].includes(fieldName)) {
      return highlightedInputStyle;
    }

    return inputStyle;
  };

  const Modal = ({ onClose }) => {
    const hasErrors = modalType === "error";
    const isDraft = modalType === "draft";

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-md max-w-md w-full text-center">
          <div className="flex justify-center mb-2">
            {hasErrors ? (
              <div className="rounded-full border-2 border-red-400 p-2 inline-flex">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            ) : isDraft ? (
              <div className="rounded-full border-2 border-blue-500 p-2 inline-flex">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                </svg>
              </div>
            ) : (
              <div className="rounded-full border-2 border-green-500 p-2 inline-flex">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold mb-1">
            {hasErrors ? "Error" : isDraft ? "Draft Saved" : "Success"}
          </h2>
          <p className="mb-4 text-sm">
            {hasErrors ? "Please fill all required fields." : isDraft ? "Form saved as draft!" : "Form submitted successfully!"}
          </p>
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-4 py-1 rounded-md font-medium text-sm"
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="py-3 px-3">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow border-2 border-blue-500 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img src="./quote4.png" alt="Logo" className="mr-4 w-40 h-12 rounded-lg" />
              </div>
              <div className="flex-grow flex justify-center">
                {/* Heading inside a blue box */}
                <div className="bg-[#83bcc9] px-5 py-1.5 rounded-lg inline-block -ml-20">
                  <h1 className="text-xl font-bold text-white">HR Stationery Request Form</h1>
                </div>
              </div>
              <div>
                <button
                  onClick={handleBack}
                  className="text-white bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed] hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] rounded-full p-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="h-0.5 bg-blue-600 w-[95%] mx-auto"></div>
          <div className="p-3">
            <form onSubmit={handleSubmit} noValidate>
              {/* Top Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Image Section - Reduced Size */}
                <div className="flex justify-center">
                  <img
                    src="./stationeryimg.jpg"
                    alt="Form process illustration"
                    className="max-w-full max-h-48 mb-3 mt-4" // Slightly increased height
                  />
                </div>

                {/* Right Side Form Fields */}
                <div className="space-y-1">
                  {/* Date field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Date<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={`${getInputStyle('date')} py-1 text-xs`} // ⬅️ reduced padding and text size
                      />
                    </div>
                    {errors.date && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.date}</div>
                    )}
                  </div>

                  {/* Request For - Radio Buttons */}
                  <div>
                    <div className="flex items-start">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Stationery<span className="text-red-500 ml-1">*</span>
                      </label>

                      <div className="flex flex-col gap-1"> {/* reduced gap from 2 to 1 */}
                        {["Standard", "Projects", "Other"].map((option) => (
                          <label key={option} className="flex items-center space-x-1 cursor-pointer text-xs"> {/* smaller font */}
                            <input
                              type="radio"
                              name="request_for"
                              checked={formData.request_for === option}
                              onChange={() => handleRadioChange(option)}
                              className={`h-3 w-3 ${errors.request_for && attempted ? "text-red-600" : "text-blue-600"}`}
                            />
                            <span>
                              {option === "Standard"
                                ? "Welcome Kit For Standard"
                                : option === "Projects"
                                  ? "Welcome Kit For Projects"
                                  : "Other Stationery"}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {errors.request_for && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">
                        {errors.request_for}
                      </div>
                    )}
                  </div>

                  {/* Employee ID field */}
                  {/* Name Field */}
                  <div className="mb-2"> {/* Optional spacing between sections */}
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Welcome Kit For (Name)<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        readOnly
                        className={`${getInputStyle('name')} h-7 text-xs px-2`} // smaller height
                      />
                    </div>
                    {errors.name && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.name}</div>
                    )}
                  </div>

                  {/* Email Id Field */}
                  <div className="mb-2">
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">Email Id</label>
                      <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        readOnly
                        className={`${getInputStyle('email')} h-7 text-xs px-2`}
                      />
                    </div>
                    {errors.email && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.email}</div>
                    )}
                  </div>

                  {/* Emp Id Field */}
                  <div className="mb-2">
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">Employee Id</label>
                      <input
                        type="text"
                        name="emp_id"
                        value={formData.emp_id}
                        onChange={handleChange}
                        readOnly
                        className={`${getInputStyle('emp_id')} h-7 text-xs px-2`}
                      />
                    </div>
                    {errors.emp_id && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.emp_id}</div>
                    )}
                  </div>
                  
                  {/* Department field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Department<span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={getInputStyle('department')}
                      >
                        <option value="">Select</option>
                        {["ACCOUNTS", "CS", "PURCHASE", "IT"].map((option, i) => (
                          <option key={i} value={option.trim()}>{option}</option>
                        ))}
                      </select>
                    </div>
                    {errors.department && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.department}</div>
                    )}
                  </div>

                  {/* Department HOD field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        {!(userToken.Emp_Category=="HOD")?"Department HOD":"Stores"}<span className="text-red-500 ml-1">*</span>
                      </label>
                      {!(userToken.Emp_Category=="HOD")?(                      
                        <select
                        name="hod_name"
                        value={formData.hod_name}
                        onChange={handleChange}
                        className={getInputStyle('hod_name')}
                      >
                        <option value="">Select</option>
                        <option value="Durgapraveen.A">Durga Praveen</option>
                        <option value="Manisha.N">Manisha</option>
                        <option value="Siddardha.N">Siddartha</option>
                      </select>):(                      <select
                        name="hod_name"
                        value={formData.hod_name}
                        onChange={handleChange}
                        className={getInputStyle('hod_name')}
                      >
                        <option value="">Select</option>
                        <option value="Shiva.J">Shiva.J</option>
                        <option value="Rajakumari.M">Rajakumari.M</option>
                      </select>)}
                    </div>
                    {errors.hod_name && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.hod_name}</div>
                    )}
                  </div>
                  
                </div>
              </div>

              {/* Stationery Items Section - Compact Styling */}
              <div className="mt-2 mx-8">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-indigo-800 font-bold text-sm"> {/* Heading text smaller */}
                    {formData.request_for === "Standard"
                      ? "Welcome Kit for Standard"
                      : formData.request_for === "Projects"
                        ? "Welcome Kit for Projects"
                        : formData.request_for === "Other"
                          ? "Other Stationery"
                          : "Stationery Items"}
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] text-white w-6 h-6 rounded flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Header */}
                <div className="bg-blue-600 text-white grid grid-cols-2 p-1 rounded-t-md text-[10px] font-semibold">
                  <div className="pr-2 border-r border-white">Stationery Item</div>
                  <div className="px-2">Quantity</div>
                </div>

                {/* Items */}
                <div className="max-h-60 overflow-y-auto">
                  {(formData.request_for === "Standard" || formData.request_for === "Projects") ? (
                    <div className="max-h-98 overflow-y-auto border rounded-b-md">
                      {stationeryOptions[formData.request_for].map((itemName, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-2 items-center border-b border-gray-300 py-[-5px] px-5 text-[13px]"
                        >
                          <div className="text-gray-700">{itemName}</div>
                          <div>
                            <select
                              name={`quantity-${index}`}
                              value=
                              {
                                formData.items.find(i => i.stationary === itemName)?.quantity || ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                let updatedItems = [...formData.items];
                                const existingIndex = updatedItems.findIndex(
                                  i => i.stationary === itemName
                                );
                                if (existingIndex >= 0) {
                                  updatedItems[existingIndex] = 
                                  {
                                    ...updatedItems[existingIndex],
                                    quantity: value,
                                  };
                                } 
                               else 
                                {
                                  updatedItems.push({
                                    stationary: itemName,
                                    quantity: value,
                                    remarks: "",
                                  });
                                }
                                setFormData(prev => ({ ...prev, items: updatedItems }));
                              }}
                              className={`${inputStyle} w-full h-[27px] text-[8px] px-1`}>
                              <option value="">Select</option>
                              <option value="0">0</option>
                              <option value="1">1</option>
                            </select>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="max-h-36 overflow-y-auto border rounded-b-md">
                      {formData.items.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-2 items-center border-b border-gray-300 py-[2px] px-2 text-[10px]">
                          <div className="pr-2 border-r border-gray-300">
                            <select
                              name="stationary"
                              value={item.stationary}
                              onChange={(e) => handleItemChange(e, index)}
                              className={`${errors.items && attempted ? errorInputStyle : inputStyle} h-[28px] text-[8px] px-1 w-full`}
                            >
                              <option value="">Select item</option>
                              {stationeryItems.map((itemName, i) => (
                                <option key={i} value={itemName}>
                                  {itemName}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center pl-2">
                            <input
                              type="number"
                              name="quantity"
                              placeholder="Qty"
                              min={1}
                              max={10}
                              value={item.quantity||''}
                              onChange={(e) => handleItemChange(e, index)}
                              className={`${inputStyle} h-[26px] text-[10px] px-1 w-full`}
                            />
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 ml-1"
                              >
                                <HiTrash className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Centered Buttons */}
              <div className="flex justify-center gap-5 mt-5">
                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] text-white px-5 py-1.5 rounded-md flex items-center gap-1.5 text-sm"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] flex items-center gap-1.5 text-white px-5 py-1.5 rounded-md text-sm"
                >
                  Submit
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default HrForm;