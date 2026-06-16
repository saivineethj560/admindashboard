// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from 'react-router-dom';
// import { HiTrash } from 'react-icons/hi';
// import Swal from 'sweetalert2';
// import SubStationary from '../SubStationaryItems/SubStationary';
// import { API_BASE_URL } from '../Config';

// const SearchableSelect = ({
//   options = [],
//   value = '',
//   onChange,
//   placeholder = "Search items...",
//   className = "",
//   error = false
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredOptions, setFilteredOptions] = useState(options);
//   const [highlightedIndex, setHighlightedIndex] = useState(-1);
//   const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

//   const inputRef = useRef(null);
//   const dropdownRef = useRef(null);

//   // Filter options based on search term
//   useEffect(() => {
//       const safeSearchTerm = typeof searchTerm === 'string' ? searchTerm.toLowerCase() : '';
//       const filtered = options.filter(option => {
//         const label = typeof option?.item_name === 'string' ? option.item_name.toLowerCase() : '';
//         return label.includes(safeSearchTerm);
//       });
//       setFilteredOptions(filtered);
//       setHighlightedIndex(-1);
// }, [searchTerm, options]);


//   // Set search term when value changes from outside
//   useEffect(() => {
//     setSearchTerm(value);
//   }, [value]);

//   // Handle click outside to close dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         inputRef.current &&
//         !inputRef.current.contains(event.target) &&
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target)
//       ) {
//         setIsOpen(false);
//       }
//     };

//     const handleScroll = () => {
//       if (isOpen) {
//         calculateDropdownPosition();
//       }
//     };

//     const handleResize = () => {
//       if (isOpen) {
//         calculateDropdownPosition();
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     window.addEventListener('scroll', handleScroll, true);
//     window.addEventListener('resize', handleResize);

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       window.removeEventListener('scroll', handleScroll, true);
//       window.removeEventListener('resize', handleResize);
//     };
//   }, [isOpen]);

//   const handleInputChange = (e) => {
//     const newValue = e.target.value;
//     setSearchTerm(newValue);
//     if (!isOpen) {
//       calculateDropdownPosition();
//     }
//     setIsOpen(true);
//     onChange(newValue);
//   };

//   const calculateDropdownPosition = () => {
//     if (inputRef.current) {
//       const rect = inputRef.current.getBoundingClientRect();
//       const dropdownHeight = 240; // max-h-60 = 240px
//       const spaceBelow = window.innerHeight - rect.bottom;
//       const spaceAbove = rect.top;

//       // Show above if there's more space above or not enough space below
//       const showAbove = spaceAbove > spaceBelow && spaceBelow < dropdownHeight;

//       setDropdownPosition({
//         top: showAbove ? rect.top + window.scrollY - dropdownHeight : rect.bottom + window.scrollY,
//         left: rect.left + window.scrollX,
//         width: rect.width
//       });
//     }
//   };

//   const handleInputFocus = () => {
//     calculateDropdownPosition();
//     setIsOpen(true);
//   };

//   const handleOptionSelect = (option) => {
//     setSearchTerm(option);
//     onChange(option);
//     setIsOpen(false);
//     inputRef.current?.blur();
//   };

//   const handleKeyDown = (e) => {
//     if (!isOpen) {
//       if (e.key === 'ArrowDown' || e.key === 'Enter') {
//         calculateDropdownPosition();
//         setIsOpen(true);
//         return;
//       }
//     }

//     switch (e.key) {
//       case 'ArrowDown':
//         e.preventDefault();
//         setHighlightedIndex(prev =>
//           prev < filteredOptions.length - 1 ? prev + 1 : prev
//         );
//         break;

//       case 'ArrowUp':
//         e.preventDefault();
//         setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
//         break;

//       case 'Enter':
//         e.preventDefault();
//         if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
//           handleOptionSelect(filteredOptions[highlightedIndex]);
//         }
//         break;

//       case 'Escape':
//         setIsOpen(false);
//         inputRef.current?.blur();
//         break;

//       default:
//         break;
//     }
//   };

//   const inputStyle = error
//     ? "w-full border border-red-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-400 bg-red-50"
//     : "w-full border border-blue-500 rounded-full p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";

//   return (
//     <div className="relative">
//       <div className="relative">
//         <input
//           ref={inputRef}
//           type="text"
//           value={searchTerm}
//           onChange={handleInputChange}
//           onFocus={handleInputFocus}
//           onKeyDown={handleKeyDown}
//           placeholder={placeholder}
//           className={`${inputStyle} ${className} pr-8`}
//           autoComplete="off"
//         />

//         {/* Search Icon */}
//         <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
//           <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//           </svg>
//         </div>
//       </div>

//      {/* Dropdown - FIXED POSITION TO APPEAR ABOVE TABLE */}
//       {isOpen && (
//         <div
//           ref={dropdownRef}
//           className="fixed bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
//           style={{
//             zIndex: 9999,
//             top: `${dropdownPosition.top}px`,
//             left: `${dropdownPosition.left}px`,
//             width: `${dropdownPosition.width}px`
//           }}
//         >
//           {/* Header */}
//           <div className="bg-blue-500 text-white px-3 py-2 text-sm font-medium rounded-t-md">
//             Select Stationery Item ({filteredOptions.length} items)
//           </div>
          
//           {filteredOptions.length > 0 ? (
//             filteredOptions.map((option, index) => (
//               <div
//                 key={index}
//                 onClick={() => handleOptionSelect(option)}
//                 className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500 transition-all duration-200 ${
//                   index === highlightedIndex ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
//                 } ${searchTerm === option ? 'bg-blue-50 font-medium border-l-4 border-l-blue-500' : ''}`}
//               >
//                 {option}
//               </div>
//             ))
//           ) : (
//             <div className="px-3 py-2 text-sm text-gray-500">
//               No items found
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };
// const StationeryRequestForm = () => {
//   const stationeryOptions =
//   {
//     Standard: ["CALCULATOR (Nos.)", "SKETCH PENS (ALL COLOURS) (Pkts.)", "SCRIBBLING PADS NOS 5 - PLANE (Nos.)", "SCRIBBLING PADS NOS 6 - PLANE (Nos.)", "SCRIBBLING PADS NOS 7 - PLANE (Nos.)", "PEN STAND (Nos.)", "FEVISTICK BIG (Nos.)", "PLASTIC SCALE (Nos.)", "CUTTER - SMALL (Nos.)", "CD MARKER PENS (Nos.)", "HIGH LIGHTERS (GREEN) (Nos.)", "JUM CLIP - SMALL (Pkts.)", "BINDING CLIPS - 15MM (Pkts.)", "PIN REMOVER SR 100 (Nos.)", "STAPLER SMALL (Nos.)", "STAPLER PINS SMALL (Nos.)", "PEN BLUE (Nos.)", "PEN BLACK (Nos.)", "PEN RED (Nos.)", "PENCIL (Nos.)", "ERASERS (Nos.)", "SHARPENERS (Nos.)", "POST IT PAD SMALL - ALL COLOURS (Pads)", "WHITENER PEN (Nos.)", "PUNCHING MACHINE DP 600 (Nos.)", "DIARY NOTE BOOK", "STEEL WATER BOTTELS (Nos.)"],
//     Projects:
//       [
//         "SCIENTIFIC CALCULATOR (Nos.)", "NOTICE BOARD PINS (Pkts.)", "SKETCH PENS (ALL COLOURS) (Pkts.)", "STABILO PENs (Pkts.)", "SCRIBBLING PADS NOS 5 - PLANE (Nos.)", "SCRIBBLING PADS NOS 6 - PLANE (Nos.)", "SCRIBBLING PADS NOS 7 - PLANE (Nos.)", "PEN STAND (Nos.)", "FEVISTICK BIG (Nos.)", "PLASTIC SCALE (Nos.)", "CUTTER - SMALL (Nos.)", "CD MARKER PENS (Nos.)", "HIGH LIGHTERS (GREEN) (Nos.)", "JUM CLIP - SMALL (Pkts.)", "BINDING CLIPS - 15MM (Pkts.)", "PIN REMOVER SR 100 (Nos.)", "STAPLER SMALL (Nos.)", "STAPLER PINS SMALL (Nos.)", "PEN BLUE (Nos.)", "PEN BLACK (Nos.)", "PEN RED (Nos.)", "GEL PEN BLUE (Nos.)", "GEL PEN BLACK (Nos.)", "PENCIL (Nos.)", "ERASERS (Nos.)", "SHARPENERS (Nos.)", "POST IT PAD SMALL - ALL COLOURS (Pads)", "POST IT PAD - MEDIUM (Pads)", "WHITENER PEN (Nos.)", "PUNCHING MACHINE DP 600 (Nos.)", "DIARY NOTE BOOK", "STEEL WATER BOTTELS (Nos.)"
//       ],
//   };
//   // const stationeryItems = [
//   //   "CALCULATOR (Nos.)", "JUM CLIP - SMALL (Pkts.)", "BINDING CLIPS - 15MM (Pkts.)", "PIN REMOVER SR 100 (Nos.)", "STAPLER SMALL (Nos.)", "STAPLER PINS SMALL (Nos.)", "PEN BLUE (Nos.)", "PEN BLACK (Nos.)", "PEN RED (Nos.)", "PENCIL (Nos.)", "ERASERS (Nos.)", "SHARPENERS (Nos.)", "POST IT PAD SMALL - ALL COLOURS (Pads)", "WHITENER PEN (Nos.)", "PUNCHING MACHINE DP 600 (Nos.)", "DIARY NOTE BOOK", "STEEL WATER BOTTLES(Nos.)"
//   // ];

//   const [userToken, setToken] = useState(() => {
//     return JSON.parse(localStorage.getItem('userInfo')) || {};
//   });
//   // Initialize form data with user information from token
//   const [formData, setFormData] = useState({
//     date: new Date().toISOString().split('T')[0],
//     request_for: userToken.Is_Employee === 0 ? "Standard" : "Self",
//     name: userToken.employee || "",
//     email: userToken.Email || "",
//     emp_id: userToken.Emp_Id || "",
//     department: "",
//     hod_name: "",
//     items: [{ stationary: "", quantity: "", remarks: "" }],
//   });

//   const [backendStationeryItems, setBackendStationeryItems] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState(""); // "submit", "draft", or "error"
//   const [errors, setErrors] = useState({});
//   const [attempted, setAttempted] = useState(false);
//   const navigate = useNavigate();

//   console.log(backendStationeryItems);
//   const getStatStoreDropdown = async () => {
//     // alert(userToken.token);
//     try {
//       const getStatStore = await fetch(`${API_BASE_URL}statstock`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           "Accept": "application/json",
//           Authorization: `Bearer ${userToken.token}`
//         }
//       })
//       const getData = await getStatStore.json();
//      // console.log("Get JSON Data:",getData.data);
//       setBackendStationeryItems(getData.data);
//     }
//     catch (error) {
//       console.error("Error In Fetching Data");
//     }
//   }


//   // Set only today's date when form loads, clear localStorage on refresh
//   useEffect(() => {
//     // Check if this is a page refresh
//     const isPageRefresh = performance.navigation &&
//       performance.navigation.type === 1;

//     // Alternative check for browsers that don't support performance.navigation
//     if (isPageRefresh || document.referrer === document.location.href) {
//       // Clear localStorage on page refresh
//       localStorage.removeItem('stationeryFormDraft');
//     }

//     // Always set today's date
//     const today = new Date();
//     const formattedDate = today.toISOString().split('T')[0];
//     setFormData(prev => ({ ...prev, date: formattedDate }));
//     getStatStoreDropdown();
//   }, []);

//   const handleBack = () => {
//     navigate('/dashboard');
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     const requiredFields = ['date', 'request_for', 'name', 'email', 'emp_id', 'department', 'hod_name'];

//     requiredFields.forEach(field => {
//       if (!formData[field]) {
//         newErrors[field] = `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
//       }
//     });

//     if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email address is invalid';
//     }

//     // Validate each item in the items array
//     let hasValidItems = false;
//     formData.items.forEach((item) => {
//       if (item.stationary && item.quantity) {
//         hasValidItems = true;
//       }
//     });

//     if (!hasValidItems) {
//       newErrors.items = 'At least one stationery item must have both type and quantity selected';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     // Clear the error for this field if it exists
//     if (errors[name]) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[name];
//         return newErrors;
//       });
//     }
//   };

//   const handleRadioChange = (value) => {
//     setFormData(prev => ({ ...prev, request_for: value }));

//     // Clear the error for this field if it exists
//     if (errors.request_for) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors.request_for;
//         return newErrors;
//       });
//     }
//   };

//   const handleItemChange = (e, index) => {
//     const { name, value } = e.target;
//     const updatedItems = [...formData.items];
//     console.log(updatedItems);
//     updatedItems[index] = { ...updatedItems[index], [name]: value };
//     setFormData(prev => ({ ...prev, items: updatedItems }));
//     // Clear the items error if all items now have values
//     if (errors.items) {
//       const allItemsValid = updatedItems.every(item => item.stationary && item.quantity);
//       if (allItemsValid) 
//       {
//         setErrors(prev => {
//           const newErrors = { ...prev };
//           delete newErrors.items;
//           return newErrors;
//         });
//       }
//     }
//   };
//   const handleAddItem = () => {
//     setFormData(prev => ({
//       ...prev,
//       items: [...prev.items, { stationary: "", quantity: "", remarks: "" }],
//     }));
//   };

//   const handleRemoveItem = (index) => {
//     if (formData.items.length > 1) {
//       setFormData(prev => ({
//         ...prev,
//         items: prev.items.filter((_, i) => i !== index),
//       }));
//     }
//   };

//   const handleReset = () => {
//     const today = new Date();
//     const formattedDate = today.toISOString().split('T')[0];
//     setFormData({
//       date: formattedDate,
//       request_for: "",
//       name: userToken.employee || "",
//       email: userToken.Email || "",
//       emp_id: userToken.Emp_Id || "",
//       department: "",
//       hod_name: "",
//       items: [{ stationary: "", quantity: "", remarks: "" }],
//     });
//     setErrors({});
//     setAttempted(false);

//     // Clear the saved draft from localStorage
//     localStorage.removeItem('stationeryFormDraft');
//   };

//   const handleSaveAsDraft = () => {
//     // Save form data to localStorage
//     localStorage.setItem('stationeryFormDraft', JSON.stringify(formData));

//     // Show the draft modal
//     setModalType("draft");
//     setShowModal(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setAttempted(true); // Mark that submission was attempted
//     const isValid = validateForm(); // Re-enable validation


//     if (!isValid) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Validation Error',
//         text: 'Please check all required fields.',
//       });
//       return;
//     }
//     // Filter out any empty items before submission
//     const filteredItems = formData.items.filter(item => item.stationary && item.quantity);
//     // If no valid items remain after filtering, show an error
//     if (filteredItems.length === 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'No Items Selected',
//         text: 'Please select at least one stationery item with a quantity.',
//       });
//       return;
//     }
//     // Create a copy of formData with filtered items
//     const submissionData = {
//       ...formData,
//       items: filteredItems,
//     };
//     // Show confirmation dialog and wait for user response
//     const result = await Swal.fire({
//       title: 'Are you sure?',
//       text: 'you want to go ahead with the stationery request?',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Yes',
//       cancelButtonText: 'No',
//     });
//     // Only proceed if user confirmed
//     if (!result.isConfirmed) {
//       return; // User clicked "No", cancel submission
//     }
//     try {
//       const response = await fetch(`${API_BASE_URL}emp-stationary-store`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//           Authorization: `Bearer ${userToken.token}`,
//         },
//         body: JSON.stringify(submissionData), // Use the filtered data
//       });
//       const data = await response.json();
//       if (response.ok) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Success!',
//           text: 'Request Raised Successfully',
//         });
//         navigate('/participants');
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Stationery Request Submission Failed',
//           text: data.message || 'Something went wrong on the server.',
//         });
//       }
//     } catch (error) {
//       console.error('Error in Requesting Stationery', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Network Error',
//         text: 'Could not connect to the server.',
//       });
//     }
//   };

//   const inputStyle = "w-full border border-blue-500 rounded-full p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";
//   const highlightedInputStyle = "w-full border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";
//   const errorInputStyle = "w-full border border-red-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-400 bg-red-50";

//   // Function to determine the correct style for input fields
//   const getInputStyle = (fieldName) => {
//     if (errors[fieldName] && attempted) 
//     {
//       return errorInputStyle;
//     }

//     // Highlighted fields are date, name, email, emp_id
//     if (['date', 'name', 'email', 'emp_id'].includes(fieldName)) 
//     {
//       return highlightedInputStyle;
//     }
//     return inputStyle;
//   };

//   const Modal = ({ onClose }) => {
//     const hasErrors = modalType === "error";
//     const isDraft   = modalType === "draft";
//     return (
//       <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white p-4 rounded-md max-w-md w-full text-center">
//           <div className="flex justify-center mb-2">
//             {hasErrors ? (
//               <div className="rounded-full border-2 border-red-400 p-2 inline-flex">
//                 <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//                 </svg>
//               </div>
//             ) : isDraft ? (
//               <div className="rounded-full border-2 border-blue-500 p-2 inline-flex">
//                 <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
//                 </svg>
//               </div>
//             ) : (
//               <div className="rounded-full border-2 border-green-500 p-2 inline-flex">
//                 <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                 </svg>
//               </div>
//             )}
//           </div>
//           <h2 className="text-xl font-bold mb-1">
//             {hasErrors ? "Error" : isDraft ? "Draft Saved" : "Success"}
//           </h2>
//           <p className="mb-4 text-sm">
//             {hasErrors ? "Please fill all required fields." : isDraft ? "Form saved as draft!" : "Form submitted successfully!"}
//           </p>
//           <button
//             onClick={onClose}
//             className="bg-indigo-600 text-white px-4 py-1 rounded-md font-medium text-sm"
//           >
//             OK
//           </button>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="py-3 px-3">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-lg shadow border-2 border-blue-500 overflow-hidden">
//           <div className="p-2">
//             <div className="flex justify-between items-center">
//               <div className="flex items-center">
//                 <img src="./quote6.png" alt="Logo" className="mr-4 w-60 h-12 rounded-lg" />
//               </div>
//               <div className="flex-grow flex justify-center">
//                 {/* Heading inside a blue box */}
//                 <div className="bg-[#83bcc9] px-5 py-1.5 rounded-lg inline-block -ml-20">
//                   <h1 className="text-xl font-bold text-white">{!(userToken.Is_Employee == 0) ? ("Stationery Request Form") : ("Stationery HR Request Form")}</h1>
//                 </div>
//               </div>
//               <div>
//                 <button
//                   onClick={handleBack}
//                   className="text-white bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed] hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] rounded-full p-1">
//                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M19 12H5M12 19l-7-7 7-7" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="h-0.5 bg-blue-600 w-[95%] mx-auto"></div>
//           <div className="p-3">
//             <form onSubmit={handleSubmit} noValidate>
//               {/* Top Layout */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                 {/* Image Section - Reduced Size */}
//                 <div className="flex justify-center">
//                   <img
//                     src="./stationeryimg.jpg"
//                     alt="Form process illustration"
//                     className="max-w-full max-h-48 mb-3 mt-4" // Slightly increased height
//                   />
//                 </div>

//                 {/* Right Side Form Fields */}
//                 <div className="space-y-2">
//                   {/* Date field */}
//                   <div>
//                     <div className="flex items-center">
//                       <label className="w-1/3 text-indigo-800 font-bold text-sm">
//                         Date<span className="text-red-500 ml-1">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="date"
//                         value={formData.date}
//                         onChange={handleChange}
//                         className={getInputStyle('date')}
//                       />
//                     </div>
//                     {errors.date && attempted && (
//                       <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.date}</div>
//                     )}
//                   </div>

//                   {/* Employee Name field */}
//                   <div>
//                     <div className="flex items-center">
//                       <label className="w-1/3 text-indigo-800 font-bold text-xs">
//                         Employee Name<span className="text-red-500 ml-1">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="name"
//                         value={formData.name}
//                         onChange={handleChange}
//                         className={getInputStyle('name')}
//                       />
//                     </div>
//                     {errors.name && attempted && (
//                       <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.name}</div>
//                     )}
//                   </div>

//                   {/* Email Id field */}
//                   <div>
//                     <div className="flex items-center">
//                       <label className="w-1/3 text-indigo-800 font-bold text-xs">
//                         Email Id<span className="text-red-500 ml-1">*</span>
//                       </label>
//                       <input
//                         type="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                         className={getInputStyle('email')}
//                       />
//                     </div>
//                     {errors.email && attempted && (
//                       <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.email}</div>
//                     )}
//                   </div>

//                   {/* Request For - Radio Buttons */}
//                   {!(userToken.Is_Employee == 0) ?
//                     (<div>
//                       <div className="flex items-center">
//                         <label className="w-1/3 text-indigo-800 font-bold text-xs">
//                           Request For<span className="text-red-500 ml-1">*</span>
//                         </label>
//                         <div className="flex gap-2">
//                           <label className="flex items-center cursor-pointer">
//                             <input
//                               type="radio"
//                               checked
//                               name="request_for"
//                               // checked={formData.request_for === "Self"}
//                               onChange={() => handleRadioChange("Self")}
//                               className={`mr-1 h-3 w-3  ${errors.request_for && attempted ? "text-red-600" : "text-blue-600"}`}
//                             />
//                             <span className="text-sm">Self</span>
//                           </label>
//                           <label className="flex items-center cursor-pointer">
//                             <input
//                               type="radio"
//                               name="request_for"
//                               checked={formData.request_for === "Others"}
//                               onChange={() => handleRadioChange("Others")}
//                               className={`mr-1 h-3 w-3 ml-8 ${errors.request_for && attempted ? "text-red-600" : "text-blue-600"}`}
//                             />
//                             <span className="text-sm">Others</span>
//                           </label>
//                         </div>
//                       </div>
//                       {errors.request_for && attempted && (
//                         <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.request_for}</div>
//                       )}
//                     </div>)

//                     : (<div>
//                       <div className="flex items-start">
//                         <label className="w-1/3 text-indigo-800 font-bold text-xs">
//                           Stationery<span className="text-red-500 ml-1">*</span>
//                         </label>

//                         <div className="flex flex-col gap-1"> {/* reduced gap from 2 to 1 */}
//                           {["Standard", "Projects", "Other"].map((option) => (
//                             <label key={option} className="flex items-center space-x-1 cursor-pointer text-xs  font-bold "> {/* smaller font */}
//                               <input
//                                 type="radio"
//                                 name="request_for"
//                                 checked={formData.request_for === option}
//                                 onChange={() => handleRadioChange(option)}
//                                 className={`  h-3 w-3 ${errors.request_for && attempted ? "text-red-600" : "text-blue-600"}`}
//                               />
//                               <span>
//                                 {option === "Standard"
//                                   ? "Welcome Kit For Standard"
//                                   : option === "Projects"
//                                     ? "Welcome Kit For Projects"
//                                     : "Other Stationery"}
//                               </span>
//                             </label>
//                           ))}
//                         </div>
//                       </div>

//                       {errors.request_for && attempted && (
//                         <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">
//                           {errors.request_for}
//                         </div>
//                       )}
//                     </div>)
//                   }

//                   {/* Employee ID field */}
//                   <div>
//                     <div className="flex items-center">
//                       <label className="w-1/3 text-indigo-800 font-bold text-xs">
//                         Employee ID<span className="text-red-500 ml-1">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="emp_id"
//                         value={formData.emp_id}
//                         onChange={handleChange}
//                         className={getInputStyle('emp_id')}
//                         readOnly
//                       />
//                     </div>
//                     {errors.emp_id && attempted && (
//                       <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.emp_id}</div>
//                     )}
//                   </div>

//                   {/* Department field */}
//                   <div>
//                     <div className="flex items-center">
//                       <label className="w-1/3 text-indigo-800 font-bold text-xs">
//                         Department<span className="text-red-500 ml-1">*</span>
//                       </label>
//                       <select
//                         name="department"
//                         value={formData.department}
//                         onChange={handleChange}
//                         className={getInputStyle('department')}
//                       >
//                         <option value="">Select</option>
//                         {["ACCOUNTS", "CS", "PURCHASE", "IT"].map((option, i) => (
//                           <option key={i} value={option.trim()}>{option}</option>
//                         ))}
//                       </select>
//                     </div>
//                     {errors.department && attempted && (
//                       <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.department}</div>
//                     )}
//                   </div>

//                   {/* Department HOD field */}
//                   <div>
//                     <div className="flex items-center">
//                       <label className="w-1/3 text-indigo-800 font-bold text-xs">
//                         {!(userToken.Emp_Category == "HOD") ? "Department HOD" : "Stores"}<span className="text-red-500 ml-1">*</span>
//                       </label>
//                       {!(userToken.Emp_Category == "HOD") ? (<select
//                         name="hod_name"
//                         value={formData.hod_name}
//                         onChange={handleChange}
//                         className={getInputStyle('hod_name')}
//                       >
//                         <option value="">Select</option>
//                         <option value="Durgapraveen.A">Durga Praveen</option>
//                         <option value="Manisha.N">Manisha</option>
//                         <option value="Siddardha.N">Siddartha</option>
//                       </select>) : (<select
//                         name="hod_name"
//                         value={formData.hod_name}
//                         onChange={handleChange}
//                         className={getInputStyle('hod_name')}
//                       >
//                         <option value="">Select</option>
//                         <option value="Shiva.J">Shiva.J</option>
//                         <option value="Rajakumari.M">Rajakumari.M</option>
//                       </select>)}
//                     </div>
//                     {errors.hod_name && attempted && (
//                       <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.hod_name}</div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-3 mx-6">
//                 <div className="flex items-center justify-between mb-2">
//                   <label className="text-indigo-800 font-bold text-base">
//                     Stationery Items<span className="text-red-500 ml-1">*</span>
//                   </label>
//                   <button
//                     type="button"
//                     onClick={handleAddItem}
//                     className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] text-white w-7 h-7 rounded-lg flex items-center justify-center text-base"
//                   >
//                     +
//                   </button>
//                 </div>

//                 {/* Table Header */}
//                 <div className={`bg-blue-600 text-white grid ${userToken.Is_Employee !== 0 ?
//                   "grid-cols-10" : // Employee: Always show Action column
//                   (formData.request_for === "Standard" || formData.request_for === "Projects") ?
//                     "grid-cols-8" : // HR Standard/Projects: Only Item + Quantity
//                     "grid-cols-10" // HR Other: Show all columns
//                   } p-1.5 rounded-t-lg text-sm font-medium`}>
//                   <div className="col-span-4 font-bold pr-5 border-r-2 border-white">Stationery Item</div>
//                   <div className="col-span-4 font-bold px-2 border-r-2 border-white">Quantity</div>
//                   {/* Show Action column for Employees OR HR with "Other" request */}
//                   {(userToken.Is_Employee !== 0 || formData.request_for === "Other") && (
//                     <div className="col-span-2 font-bold px-2 text-center">Action</div>
//                   )}
//                 </div>

//                 {userToken.Is_Employee !== 0 ? (
//                   // FOR EMPLOYEE, STORES, AND COMMON USER (1, 2, 3)
//                   <div className="max-h-36 overflow-y-auto border rounded-b-md">
//                     {formData.items.map((item, index) => (
//                       <div key={index} className="grid grid-cols-10 border-b border-gray-300 p-1 bg-blue-50">
//                         <div className="col-span-4 pr-2 border-r border-gray-300">
//                        <SearchableSelect
//                           options={backendStationeryItems.map(item => ({
//                             label: item?.item_name,
//                             value: item?.item_name
//                           }))}
//                           value={{
//                             label: item?.item_name,
//                             value: item?.item_name
//                           }} // ✅ full object, not just string
//                           onChange={(selected) =>
//                             handleItemChange({ target: { name: 'stationary', value: selected?.value } }, index)
//                           }
//                           placeholder="Search items..."
//                           error={errors.items && attempted}
//                           className="h-[28px] text-[8px] px-1 bg-white border-2 border-blue-500 focus:bg-white focus:border-blue-600 shadow-sm"
//                         />
//                       </div>


//                         <div className="col-span-4 px-2 border-r-2 border-gray-300">
//                           <select
//                             name="quantity"
//                             value={item.quantity}
//                             onChange={(e) => handleItemChange(e, index)}
//                             className={`${errors.items && attempted ? errorInputStyle : 'w-full border-2 border-blue-500 rounded-full p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 bg-blue-50 focus:bg-blue-100 shadow-sm'} flex-grow`}
//                           >
//                             <option value="">Qty</option>
//                             {(userToken.Is_Employee === 1 || userToken.Is_Employee === 2
//                               ? [1, 2]
//                               : userToken.Is_Employee === 3
//                                 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
//                                 : []
//                             ).map((q) => (
//                               <option key={q} value={q}>
//                                 {q}
//                               </option>
//                             ))}
//                           </select>
//                         </div>

//                         {/* Action column - Always visible for employees */}
//                         <div className="col-span-2 flex items-center justify-center">
//                           <button
//                             type="button"
//                             onClick={() => handleRemoveItem(index)}
//                             disabled={formData.items.length === 1}
//                             className={`p-2 rounded transition-colors ${formData.items.length === 1
//                               ? 'text-gray-400 cursor-not-allowed bg-gray-100'
//                               : 'text-red-600 hover:text-red-800 hover:bg-red-50'
//                               }`}
//                             title={formData.items.length === 1 ? "Cannot delete the only item" : "Remove item"}
//                           >
//                             <HiTrash className="w-5 h-5" />
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   // FOR HR (0)
//                   <>
//                     <div className="max-h-60 overflow-y-auto">
//                       {(formData.request_for === "Standard" || formData.request_for === "Projects") ? (
//                         // HR: Standard/Projects - Only Item + Quantity (NO Action column)
//                         <div className="max-h-98 overflow-y-auto border rounded-b-md">
//                           {stationeryOptions[formData.request_for].map((itemName, index) => (
//                             <div
//                               key={index}
//                               className="grid grid-cols-8 items-center border-b border-gray-300 py-2 px-3 text-sm bg-white"
//                             >
//                               {/* Stationery Item */}
//                               <div className="col-span-4 pr-3">
//                                 <div className="w-full h-[35px] px-3 py-2 text-gray-700 bg-white border-2 border-blue-500 rounded-full flex items-center text-sm font-medium shadow-sm focus-within:border-blue-600">
//                                   {itemName}
//                                 </div>
//                               </div>

//                               {/* Quantity Select */}
//                               <div className="col-span-4 px-2">
//                                 <select
//                                   name={`quantity-${index}`}
//                                   value={
//                                     formData.items.find(i => i.stationary === itemName)?.quantity || ""
//                                   }
//                                   onChange={(e) => {
//                                     const value = e.target.value;
//                                     let updatedItems = [...formData.items];
//                                     const existingIndex = updatedItems.findIndex(
//                                       i => i.stationary === itemName
//                                     );

//                                     if (value) {
//                                       if (existingIndex >= 0) {
//                                         updatedItems[existingIndex] = {
//                                           ...updatedItems[existingIndex],
//                                           stationary: itemName,
//                                           quantity: value,
//                                         };
//                                       } else {
//                                         updatedItems.push({
//                                           stationary: itemName,
//                                           quantity: value,
//                                           remarks: "",
//                                         });
//                                       }
//                                     } else if (existingIndex >= 0) {
//                                       updatedItems.splice(existingIndex, 1);
//                                     }
//                                     setFormData(prev => ({ ...prev, items: updatedItems }));
//                                   }}
//                                   className="w-full h-[35px] px-3 py-2 text-sm border-2 border-blue-500 rounded-full bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 shadow-sm"
//                                 >
//                                   <option value="" className="text-sm">Select</option>
//                                   <option value="0" className="text-sm">0</option>
//                                   <option value="1" className="text-sm">1</option>
//                                 </select>
//                               </div>
//                               {/* No Action column for Standard/Projects */}
//                             </div>
//                           ))}
//                         </div>
//                       ) : formData.request_for === "Other" ? (
//                         // HR: Other - Show all columns including Action
//                         <div className="max-h-36 overflow-y-auto border rounded-b-md">
//                           {formData.items.map((item, index) => (
//                             <div
//                               key={index}
//                               className="grid grid-cols-10 items-center border-b border-gray-300 py-[2px] px-2 text-[10px] bg-white">
//                             <div className="col-span-4 pr-2 border-r border-gray-300">
//                                <SearchableSelect
//                                       options={backendStationeryItems.map(item => ({
//                                       label: item?.item_name,
//                                       value: item?.item_name
//                                     }))}
//                                     value={{
//                                       label: item?.item_name,
//                                       value: item?.item_name
//                                     }} // ✅ full object, not just string
//                                     onChange={(selected) =>
//                                       handleItemChange({ target: { name: 'stationary', value: selected?.value } }, index)
//                                     }
//                                     placeholder="Search items..."
//                                     error={errors.items && attempted}
//                                     className="h-[28px] text-[8px] px-1 bg-white border-2 border-blue-500 focus:bg-white focus:border-blue-600 shadow-sm"
//                                   />
//                               </div>

//                               <div className="col-span-4 pl-2 border-r border-gray-300">
//                                 <input
//                                   type="number"
//                                   name="quantity"
//                                   placeholder="Qty"
//                                   min={1}
//                                   max={10}
//                                   value={item.quantity || ''}
//                                   onChange={(e) => handleItemChange(e, index)}
//                                   className="h-[26px] text-[10px] px-1 w-full border-2 border-blue-500 rounded-full bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 shadow-sm"
//                                 />
//                               </div>

//                               <div className="col-span-2 flex items-center justify-center">
//                                 <button
//                                   type="button"
//                                   onClick={() => handleRemoveItem(index)}
//                                   disabled={formData.items.length === 1}
//                                   className={`p-2 rounded transition-colors ${formData.items.length === 1
//                                     ? 'text-gray-400 cursor-not-allowed bg-gray-100'
//                                     : 'text-red-600 hover:text-red-800 bg-blue-100 hover:bg-blue-200'
//                                     }`}
//                                   title={formData.items.length === 1 ? "Cannot delete the only item" : "Remove item"}
//                                 >
//                                   <HiTrash className="w-5 h-5" />
//                                 </button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         // HR: Default case - Show all columns
//                         <div className="max-h-36 overflow-y-auto border rounded-b-md">
//                           {formData.items.map((item, index) => (
//                             <div
//                               key={index}
//                               className="grid grid-cols-10 items-center border-b border-gray-300 py-2 px-2 bg-white"
//                             >
//                               <div className="col-span-4 pr-2 border-r border-gray-300">
//                                 <select
//                                   name="stationary"
//                                   value={item.stationary}
//                                   onChange={(e) => handleItemChange(e, index)}
//                                   className={`${errors.items && attempted ? errorInputStyle : 'h-[32px] text-sm px-3 w-full border-2 border-blue-500 rounded-full bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 shadow-sm'}`}>
//                                   <option value="" className="text-sm">Select item</option>
//                                   {stationeryItems.map((itemName, i) => (
//                                     <option key={i} value={itemName} className="text-sm">
//                                       {itemName}
//                                     </option>
//                                   ))}
//                                 </select>
//                               </div>

//                               <div className="col-span-4 pl-2 border-r border-gray-300">
//                                 <input
//                                   type="number"
//                                   name="quantity"
//                                   placeholder="Qty"
//                                   min={1}
//                                   max={10}
//                                   value={item.quantity || ''}
//                                   onChange={(e) => handleItemChange(e, index)}
//                                   className="h-[32px] text-sm px-3 w-full border-2 border-blue-500 rounded-full bg-blue-50 focus:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 shadow-sm"
//                                 />
//                               </div>

//                               <div className="col-span-2 flex items-center justify-center">
//                                 <button
//                                   type="button"
//                                   onClick={() => handleRemoveItem(index)}
//                                   disabled={formData.items.length === 1}
//                                   className={`p-2 rounded transition-colors ${formData.items.length === 1
//                                     ? 'text-gray-400 cursor-not-allowed bg-gray-100'
//                                     : 'text-red-600 hover:text-red-800 hover:bg-red-50'
//                                     }`}
//                                   title={formData.items.length === 1 ? "Cannot delete the only item" : "Remove item"}>
//                                   <HiTrash className="w-4.5 h-4.5" />
//                                 </button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </>
//                 )}
//                 {errors.items && attempted && (
//                   <div className="text-red-500 text-xs mt-0.5">{errors.items}</div>
//                 )}
//               </div>

//               {/* Centered Buttons */}
//               <div className="flex justify-center gap-4 mt-4">
//                 <button
//                   type="button"
//                   onClick={handleSaveAsDraft}
//                   className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] text-white px-5 py-1.5 rounded-md flex items-center gap-1.5 text-sm"
//                 >
//                   Save as Draft
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] flex items-center gap-1.5 text-white px-5 py-1.5 rounded-md text-sm"
//                 >
//                   Submit
//                   <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                   </svg>
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>

//       {showModal && <Modal onClose={() => setShowModal(false)} />}
//     </div>
//   );
// };

// export default StationeryRequestForm;



import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { HiTrash } from 'react-icons/hi';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../Config';


const SearchableSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = "Search items...",
  className = "",
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });


  const inputRef = useRef(null);
  const dropdownRef = useRef(null);



  

  // Filter options based on search term
  useEffect(() => {
    const filtered = options?.filter(option =>
      option?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );
    setFilteredOptions(filtered);
    setHighlightedIndex(-1);
  }, [searchTerm, options]);

  // Set search term when value changes from outside
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };
    const handleResize = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (!isOpen) {
      calculateDropdownPosition();
    }
    setIsOpen(true);
    onChange(newValue);
  };

  const calculateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const dropdownHeight = 240; // max-h-60 = 240px
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Show above if there's more space above or not enough space below
      const showAbove = spaceAbove > spaceBelow && spaceBelow < dropdownHeight;

      setDropdownPosition({
        top: showAbove ? rect.top + window.scrollY - dropdownHeight : rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  const handleInputFocus = () => {
    calculateDropdownPosition();
    setIsOpen(true);
  };

  const handleOptionSelect = (option) => {
    setSearchTerm(option);
    onChange(option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        calculateDropdownPosition();
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;

      default:
        break;
    }
  };

  const inputStyle = error
    ? "w-full border border-red-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-400 bg-red-50"
    : "w-full border border-blue-500 rounded-full p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${inputStyle} ${className} pr-8`}
          autoComplete="off"
        />

        {/* Search Icon */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Dropdown - FIXED POSITION TO APPEAR ABOVE TABLE */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          style={{
            zIndex: 9999,
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {/* Header */}
          <div className="bg-blue-500 text-white px-3 py-2 text-sm font-medium rounded-t-md">
            Select Stationery Item ({filteredOptions.length} items)
          </div>

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleOptionSelect(option)}
                className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500 transition-all duration-200 ${index === highlightedIndex ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  } ${searchTerm === option.item_name ? 'bg-blue-50 font-medium border-l-4 border-l-blue-500' : ''}`}
              >
                {option}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No items found
            </div>
          )}
        </div>
      )}
    </div>
  );
};
const StationeryRequestForm = () => {
  const stationeryOptions =
  {
    Standard: ["CALCULATOR (Nos.)", "SKETCH PENS (ALL COLOURS) (Pkts.)", "SCRIBBLING PADS NOS 5 - PLANE (Nos.)", "SCRIBBLING PADS NOS 6 - PLANE (Nos.)", "SCRIBBLING PADS NOS 7 - PLANE (Nos.)", "PEN STAND (Nos.)", "FEVISTICK BIG (Nos.)", "PLASTIC SCALE (Nos.)", "CUTTER - SMALL (Nos.)", "CD MARKER PENS (Nos.)", "HIGH LIGHTERS (GREEN) (Nos.)", "JUM CLIP - SMALL (Pkts.)", "BINDING CLIPS - 15MM (Pkts.)", "PIN REMOVER SR 100 (Nos.)", "STAPLER SMALL (Nos.)", "STAPLER PINS SMALL (Nos.)", "PEN BLUE (Nos.)", "PEN BLACK (Nos.)", "PEN RED (Nos.)", "PENCIL (Nos.)", "ERASERS (Nos.)", "SHARPENERS (Nos.)", "POST IT PAD SMALL - ALL COLOURS (Pads)", "WHITENER PEN (Nos.)", "PUNCHING MACHINE DP 600 (Nos.)", "DIARY NOTE BOOK", "STEEL WATER BOTTELS (Nos.)"].sort(),
    Projects:
      [
        "SCIENTIFIC CALCULATOR (Nos.)", "NOTICE BOARD PINS (Pkts.)", "SKETCH PENS (ALL COLOURS) (Pkts.)", "STABILO PENs (Pkts.)", "SCRIBBLING PADS NOS 5 - PLANE (Nos.)", "SCRIBBLING PADS NOS 6 - PLANE (Nos.)", "SCRIBBLING PADS NOS 7 - PLANE (Nos.)", "PEN STAND (Nos.)", "FEVISTICK BIG (Nos.)", "PLASTIC SCALE (Nos.)", "CUTTER - SMALL (Nos.)", "CD MARKER PENS (Nos.)", "HIGH LIGHTERS (GREEN) (Nos.)", "JUM CLIP - SMALL (Pkts.)", "BINDING CLIPS - 15MM (Pkts.)", "PIN REMOVER SR 100 (Nos.)", "STAPLER SMALL (Nos.)", "STAPLER PINS SMALL (Nos.)", "PEN BLUE (Nos.)", "PEN BLACK (Nos.)", "PEN RED (Nos.)", "GEL PEN BLUE (Nos.)", "GEL PEN BLACK (Nos.)", "PENCIL (Nos.)", "ERASERS (Nos.)", "SHARPENERS (Nos.)", "POST IT PAD SMALL - ALL COLOURS (Pads)", "POST IT PAD - MEDIUM (Pads)", "WHITENER PEN (Nos.)", "PUNCHING MACHINE DP 600 (Nos.)", "DIARY NOTE BOOK", "STEEL WATER BOTTELS (Nos.)"
      ].sort(),
  };
  const stationeryItems = [
    "CALCULATOR (Nos.)", "JUM CLIP - SMALL (Pkts.)", "BINDING CLIPS - 15MM (Pkts.)", "PIN REMOVER SR 100 (Nos.)", "STAPLER SMALL (Nos.)", "STAPLER PINS SMALL (Nos.)", "PEN BLUE (Nos.)", "PEN BLACK (Nos.)", "PEN RED (Nos.)", "PENCIL (Nos.)", "ERASERS (Nos.)", "SHARPENERS (Nos.)", "POST IT PAD SMALL - ALL COLOURS (Pads)", "WHITENER PEN (Nos.)", "PUNCHING MACHINE DP 600 (Nos.)", "DIARY NOTE BOOK", "STEEL WATER BOTTLES(Nos.)"
  ];

  const [userToken, setToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo')) || {};
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Initialize form data with user information from token
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    request_for: userToken.Is_Employee === 0 ? "Standard" : "Self",
    name: userToken.employee || "",
    email: userToken.Email || "",
    emp_id: userToken.Emp_Id || "",
    department: userToken.Department,
    hod_name: userToken.DEPT_HOD,
    others_name: "", // Add this new field
    items: [{ stationary: "", quantity: "", remarks: "" }],
  });

  const [backendStationeryItems, setBackendStationeryItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "submit", "draft", or "error"
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const navigate = useNavigate();

  const getStatStoreDropdown = async () => {
    try {
      // Keep your original endpoint since the route is 'statstock'
      const getStatStore = await fetch(`${API_BASE_URL}statstock`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${userToken.token}`
        }
      });

      const getData = await getStatStore.json();

      // Check if the response is successful
      if (getData.success && getData.data) {
        // Transform the data to match what your SearchableSelect expects
        const transformedItems = getData.data.map(item => ({
          item_name: item.MAT, // Use MAT field as the item name
          sno: item.SNO,
          balance_quantity: item.BAL_QUAN,
          type: item.TYPE
        }));

        setBackendStationeryItems(transformedItems);
        console.log("Stationery items loaded:", transformedItems);
      } else {
        console.error("API Error:", getData.message);
        // Fallback to empty array or show error message
        setBackendStationeryItems([]);
      }
    } catch (error) {
      console.error("Error In Fetching Data:", error);
      setBackendStationeryItems([]);
    }
  }

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
    getStatStoreDropdown();
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const validateForm = () => {
    const newErrors = {};
    let requiredFields = ['date', 'request_for', 'department', 'hod_name'];

    // Add conditional required fields based on request_for value
    if (formData.request_for === "Others") {
      requiredFields.push('others_name');
    } else {
      requiredFields.push('name');
    }

    // Email and emp_id are always required (they're always present from userToken)
    requiredFields.push('email', 'emp_id');

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }

    // Validate each item in the items array
    let hasValidItems = false;
    formData.items.forEach((item) => {
      if (item.stationary && item.quantity) {
        hasValidItems = true;
      }
    });

    if (!hasValidItems) {
      newErrors.items = 'At least one stationery item must have both type and quantity selected';
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
    setFormData(prev => ({
      ...prev,
      request_for: value,
      // Clear others_name when switching away from "Others"
      others_name: value === "Others" ? prev.others_name : ""
    }));

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
    console.log(updatedItems);
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
      others_name: "", // Add this line
      items: [{ stationary: "", quantity: "", remarks: "" }],
    });
    setErrors({});
    setAttempted(false);
    localStorage.removeItem('stationeryFormDraft');
  };

  const handleSaveAsDraft = () => {
    // Save form data to localStorage
    localStorage.setItem('stationeryFormDraft', JSON.stringify(formData));

    // Show the draft modal
    setModalType("draft");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true); // Mark that submission was attempted
    const isValid = validateForm(); // Re-enable validation

    if (!isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please check all required fields.',
      });
      return;
    }

    // Filter out items that are empty OR have quantity "0" or 0
    const filteredItems = formData.items.filter(item => {
      // Check if item has both stationary and quantity
      if (!item.stationary || !item.quantity) {
        return false;
      }

      // Check if quantity is "0" (string) or 0 (number)
      const quantity = parseInt(item.quantity);
      if (quantity === 0 || item.quantity === "0") {
        return false;
      }

      return true;
    });

    // If no valid items remain after filtering, show an error
    if (filteredItems.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Items Selected',
        text: 'Please select at least one stationery item with a quantity greater than 0.',
      });
      return;
    }

    // Create a copy of formData with filtered items
    const submissionData = {
      ...formData,
      items: filteredItems,
    };

    console.log(submissionData, "submissionDatasubmissionDatasubmissionDatasubmissionData");

    // Show confirmation dialog and wait for user response
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'you want to go ahead with the stationery request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });

    // Only proceed if user confirmed
    if (!result.isConfirmed) {
      return; // User clicked "No", cancel submission
    }
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}emp-stationary-store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken.token}`,
        },
        body: JSON.stringify(submissionData), // Use the filtered data
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Request Raised Successfully',
        });
        navigate('/participants');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Stationery Request Submission Failed',
          text: data.message || 'Something went wrong on the server.',
        });
      }
    } catch (error) {
      console.error('Error in Requesting Stationery', error);
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Could not connect to the server.',
      });
      setIsSubmitting(false);
    }
  };

  const inputStyle = "w-full border border-blue-500 rounded-full p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";
  const highlightedInputStyle = "w-full border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";
  const errorInputStyle = "w-full border border-red-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-400 bg-red-50";
  const disabledInputStyle = "w-full border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-100 cursor-not-allowed";

  // Function to determine the correct style for input fields
  const getInputStyle = (fieldName) => {
    if (errors[fieldName] && attempted) {
      return errorInputStyle;
    }

    // Email and emp_id are always grayed out (disabled)
    if (['email', 'emp_id'].includes(fieldName)) {
      return disabledInputStyle;
    }

    // Highlighted fields are date, name, others_name
    if (['date', 'name', 'others_name'].includes(fieldName)) {
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
          <div className="p-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img src="./quote6.png" alt="Logo" className="mr-4 w-60 h-12 rounded-lg" />
              </div>
              <div className="flex-grow flex justify-center">
                {/* Heading inside a blue box */}
                <div className="bg-[#83bcc9] px-5 py-1.5 rounded-lg inline-block -ml-20">
                  <h1 className="text-xl font-bold text-white">{!(userToken.Is_Employee == 0) ? ("Stationery Request Form") : ("Stationery HR Request Form")}</h1>
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
                <div className="space-y-2">
                  {/* Date field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-sm">
                        Date<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text" // Changed from "date" to "text"
                        name="date"
                        value={new Date(formData.date).toLocaleDateString('en-GB')} // Display as DD/MM/YYYY
                        readOnly
                        className={getInputStyle('date')}
                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                      />
                    </div>
                    {errors.date && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.date}</div>
                    )}
                  </div>

                  {/* Employee Name field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Employee Name<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        readOnly
                        className={getInputStyle('name')}
                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                      />
                    </div>
                    {errors.name && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.name}</div>
                    )}
                  </div>

                  {/* Email Id field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Email Id<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        readOnly
                        className={getInputStyle('email')}
                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                      />
                    </div>
                    {errors.email && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.email}</div>
                    )}
                  </div>

                  {/* Request For - Radio Buttons */}
                  {!(userToken.Is_Employee == 0) ? (
                    <div>
                      <div className="flex items-center">
                        <label className="w-1/3 text-indigo-800 font-bold text-xs">
                          Request For<span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex gap-2">
                          <label className="flex items-center cursor-pointer px-2 py-1">
                            <input
                              type="radio"
                              name="request_for"
                              value="Self"
                              checked={formData.request_for === "Self"}
                              onChange={(e) => handleRadioChange(e.target.value)}
                              className={`mr-2 h-3 w-3 ${errors.request_for && attempted ? "text-red-600" : "text-blue-600"}`}
                            />
                            <span className="text-sm select-none">Self</span>
                          </label>
                          <label className="flex items-center cursor-pointer px-2 py-1 ml-4">
                            <input
                              type="radio"
                              name="request_for"
                              value="Others"
                              checked={formData.request_for === "Others"}
                              onChange={(e) => handleRadioChange(e.target.value)}
                              className={`mr-2 h-3 w-3 ${errors.request_for && attempted ? "text-red-600" : "text-blue-600"}`}
                            />
                            <span className="text-sm select-none">Others</span>
                          </label>
                        </div>
                      </div>
                      {errors.request_for && attempted && (
                        <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.request_for}</div>
                      )}
                    </div>
                  ) : (<div>
                    <div className="flex items-start">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Stationery<span className="text-red-500 ml-1">*</span>
                      </label>

                      <div className="flex flex-col gap-1"> {/* reduced gap from 2 to 1 */}
                        {["Standard", "Projects", "Other"].map((option) => (
                          <label key={option} className="flex items-center space-x-1 cursor-pointer text-xs  font-bold "> {/* smaller font */}
                            <input
                              type="radio"
                              name="request_for"
                              checked={formData.request_for === option}
                              onChange={() => handleRadioChange(option)}
                              className={`  h-3 w-3 ${errors.request_for && attempted ? "text-red-600" : "text-blue-600"}`}
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
                  </div>)
                  }

                  {/* 4a. Add conditional Other's Name field when "Others" is selected */}
                  {formData.request_for === "Others" && (
                    <div>
                      <div className="flex items-center">
                        <label className="w-1/3 text-indigo-800 font-bold text-xs">
                          Other's Name<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="others_name"
                          value={formData.others_name}
                          onChange={handleChange}
                          className={getInputStyle('others_name')}
                          placeholder="Enter other person's name"
                        />
                      </div>
                      {errors.others_name && attempted && (
                        <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.others_name}</div>
                      )}
                    </div>
                  )}

                  {/* Employee ID field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Employee ID<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="emp_id"
                        value={formData.emp_id}
                        readOnly
                        className={getInputStyle('emp_id')}
                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
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
                      {/* <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={getInputStyle('department')}
                      >
                        <option value="">Select</option>
                        {["ACCOUNTS", "CS", "PURCHASE", "IT"].map((option, i) => (
                          <option key={i} value={option.trim()}>{option}</option>
                        ))}
                      </select> */}
                      <input
                        type="text"
                        name="hod_name"
                        value={userToken.Department}
                        readOnly
                        className={getInputStyle('hod_name')}
                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                      />

                    </div>
                    {errors.department && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.department}</div>
                    )}
                  </div>

                  {/* Department HOD field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        {!(userToken.Emp_Category == "HOD") ? "Department HOD" : "Stores"}<span className="text-red-500 ml-1">*</span>
                      </label>
                      {!(userToken.Emp_Category == "HOD") ? (
                      //   <select
                      //   name="hod_name"
                      //   value={formData.hod_name}
                      //   onChange={handleChange}
                      //   className={getInputStyle('hod_name')}
                      // >
                      //   <option value="">Select</option>
                      //   <option value="Durgapraveen.A">Durga Praveen</option>
                      //   <option value="Manisha.N">Manisha</option>
                      //   <option value="Siddardha.N">Siddartha</option>
                      // </select>
                      <input
                        type="text"
                        name="hod_name"
                        value={userToken.DEPT_HOD}
                        readOnly
                        className={getInputStyle('hod_name')}
                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                      />
                      ) : (
                        <input
                        type="text"
                        name="hod_name"
                        value={userToken.StoresUserName}
                        readOnly
                        className={getInputStyle('hod_name')}
                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                      />
                      // <select
                      //   name="hod_name"
                      //   value={formData.hod_name}
                      //   onChange={handleChange}
                      //   className={getInputStyle('hod_name')}
                      // >
                      //   <option value="">Select</option>
                      //   <option value="Shiva.J">Shiva.J</option>
                      //   <option value="Rajakumari.M">Rajakumari.M</option>
                      // </select>
                    )}
                    </div>
                    {errors.hod_name && attempted && (
                      <div className="ml-1/3 pl-32 text-red-500 text-xs mt-0.5">{errors.hod_name}</div>
                    )}
                  </div>
                </div>
              </div>

             <div className="mt-3 mx-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-indigo-800 font-bold text-base">
                    Stationery Items<span className="text-red-500 ml-1">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] text-white w-7 h-7 rounded-lg flex items-center justify-center text-base"
                  >
                    +
                  </button>
                </div>

                {/* Table Header */}
                <div className="bg-blue-600 text-white grid grid-cols-12 p-1.5 rounded-t-lg text-sm font-medium">
                  <div className="col-span-1 font-bold px-2 border-r-2 border-white text-center">SNO</div>
                  <div className="col-span-5 font-bold px-5 border-r-2 border-white">Stationery Item</div>
                  <div className="col-span-4 font-bold px-2 border-r-2 border-white">Quantity</div>
                  <div className="col-span-2 font-bold px-2 text-center">Action</div>
                </div>

                {userToken.Is_Employee != 0 ? (
                  // FOR EMPLOYEE, STORES, AND COMMON USER (1, 2, 3)
                  <div className="max-h-36 overflow-y-auto border rounded-b-md">
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 items-center border-b border-gray-300 p-2 bg-blue-50">
                        {/* SNO Column */}
                        <div className="col-span-1 text-center border-r-2 border-gray-300">
                          <span className="font-bold text-lg text-blue-700">{index + 1}</span>
                        </div>

                        {/* Stationery Item Column */}
                        <div className="col-span-5 px-2 border-r-2 border-gray-300">
                          <SearchableSelect
                            options={backendStationeryItems.map(item => item.item_name)}
                            value={item.stationary}
                            onChange={(value) => handleItemChange({ target: { name: 'stationary', value } }, index)}
                            placeholder="Search stationery items..."
                            error={errors.items && attempted}
                            className="bg-blue-50 border-2 border-blue-500 focus:bg-blue-100 focus:border-blue-600 shadow-sm"
                          />
                        </div>

                        {/* Quantity Column */}
                        <div className="col-span-4 px-2 border-r-2 border-gray-300">
                          <select
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(e, index)}
                            className={`${errors.items && attempted ? errorInputStyle : 'w-full border-2 border-blue-500 rounded-full p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 bg-blue-50 focus:bg-blue-100 shadow-sm'}`}
                          >
                            <option value="">Qty</option>
                            {(userToken.Is_Employee == 1 || userToken.Is_Employee == 2
                              ? [1, 2]
                              : userToken.Is_Employee == 3
                                ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                                : []
                            ).map((q) => (
                              <option key={q} value={q}>{q}</option>
                            ))}
                          </select>
                        </div>

                        {/* Action Column */}
                        <div className="col-span-2 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={formData.items.length === 1}
                            className={`p-2 rounded transition-colors ${formData.items.length === 1 ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-red-600 hover:text-red-800 hover:bg-red-50'}`}
                            title={formData.items.length === 1 ? "Cannot delete the only item" : "Remove item"}
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // FOR HR (0)
                  <>
                    <div className="max-h-60 overflow-y-auto">
                      {(formData.request_for === "Standard" || formData.request_for === "Projects") ? (
                        // HR: Standard/Projects - Only Item + Quantity (NO Action column)
                        <div className="max-h-98 overflow-y-auto border rounded-b-md">
                          {stationeryOptions[formData.request_for].map((itemName, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-8 items-center border-b border-gray-300 py-2 px-3 text-sm bg-white"
                            >
                              {/* Stationery Item */}
                              <div className="col-span-4 pr-3">
                                <div className="w-full h-[35px] px-3 py-2 text-gray-700 bg-white border-2 border-blue-500 rounded-full flex items-center text-sm font-medium shadow-sm focus-within:border-blue-600">
                                  {itemName}
                                </div>
                              </div>

                              {/* Quantity Select */}
                              <div className="col-span-4 px-2">
                                <select
                                  name={`quantity-${index}`}
                                  value={
                                    formData.items.find(i => i.stationary === itemName)?.quantity || ""
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    let updatedItems = [...formData.items];
                                    const existingIndex = updatedItems.findIndex(
                                      i => i.stationary === itemName
                                    );

                                    if (value) {
                                      if (existingIndex >= 0) {
                                        updatedItems[existingIndex] = {
                                          ...updatedItems[existingIndex],
                                          stationary: itemName,
                                          quantity: value,
                                        };
                                      } else {
                                        updatedItems.push({
                                          stationary: itemName,
                                          quantity: value,
                                          remarks: "",
                                        });
                                      }
                                    } else if (existingIndex >= 0) {
                                      updatedItems.splice(existingIndex, 1);
                                    }

                                    setFormData(prev => ({ ...prev, items: updatedItems }));
                                  }}
                                  className="w-full h-[35px] px-3 py-2 text-sm border-2 border-blue-500 rounded-full bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 shadow-sm"
                                >
                                  <option value="" className="text-sm">Select</option>
                                  <option value="0" className="text-sm">0</option>
                                  <option value="1" className="text-sm">1</option>
                                </select>
                              </div>
                              {/* No Action column for Standard/Projects */}
                            </div>
                          ))}
                        </div>
                      ) : formData.request_for === "Other" ? (
                        // HR: Other - Show all columns including Action
                        <div className="max-h-36 overflow-y-auto border rounded-b-md">
                          {formData.items.map((item, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-10 items-center border-b border-gray-300 py-[2px] px-2 text-[10px] bg-white"
                            >
                              <div className="col-span-4 pr-2 border-r border-gray-300">
                                <SearchableSelect
                                  options={backendStationeryItems.map(item => item.item_name)}
                                  value={item.item_name}
                                  onChange={(value) => handleItemChange({ target: { name: 'stationary', value } }, index)}
                                  placeholder="Search items..."
                                  error={errors.items && attempted}
                                  className="h-[28px] text-[8px] px-1 bg-white border-2 border-blue-500 focus:bg-white focus:border-blue-600 shadow-sm"
                                />
                              </div>

                              <div className="col-span-4 pl-2 border-r border-gray-300">
                                <input
                                  type="number"
                                  name="quantity"
                                  placeholder="Qty"
                                  min={1}
                                  max={10}
                                  value={item.quantity || ''}
                                  onChange={(e) => handleItemChange(e, index)}
                                  className="h-[26px] text-[10px] px-1 w-full border-2 border-blue-500 rounded-full bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 shadow-sm"
                                />
                              </div>

                              <div className="col-span-2 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  disabled={formData.items.length === 1}
                                  className={`p-2 rounded transition-colors ${formData.items.length === 1
                                    ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                    : 'text-red-600 hover:text-red-800 bg-blue-100 hover:bg-blue-200'
                                    }`}
                                  title={formData.items.length === 1 ? "Cannot delete the only item" : "Remove item"}
                                >
                                  <HiTrash className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // HR: Default case - Show all columns
                        <div className="max-h-36 overflow-y-auto border rounded-b-md">
                          {formData.items.map((item, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-10 items-center border-b border-gray-300 py-2 px-2 bg-white"
                            >
                              <div className="col-span-4 pr-2 border-r border-gray-300">
                                <select
                                  name="stationary"
                                  value={item.item_name}
                                  onChange={(e) => handleItemChange(e, index)}
                                  className={`${errors.items && attempted ? errorInputStyle : 'h-[32px] text-sm px-3 w-full border-2 border-blue-500 rounded-full bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 shadow-sm'}`}
                                >
                                  <option value="" className="text-sm">Select item</option>
                                  {stationeryItems.map((itemName, i) => (
                                    <option key={i} value={itemName} className="text-sm">
                                      {itemName}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="col-span-4 pl-2 border-r border-gray-300">
                                <input
                                  type="number"
                                  name="quantity"
                                  placeholder="Qty"
                                  min={1}
                                  max={10}
                                  value={item.quantity || ''}
                                  onChange={(e) => handleItemChange(e, index)}
                                  className="h-[32px] text-sm px-3 w-full border-2 border-blue-500 rounded-full bg-blue-50 focus:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 shadow-sm"
                                />
                              </div>

                              <div className="col-span-2 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  disabled={formData.items.length === 1}
                                  className={`p-2 rounded transition-colors ${formData.items.length === 1
                                    ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                    : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                    }`}
                                  title={formData.items.length === 1 ? "Cannot delete the only item" : "Remove item"}
                                >
                                  <HiTrash className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {errors.items && attempted && (
                  <div className="text-red-500 text-xs mt-0.5">{errors.items}</div>
                )}
              </div>

              {/* Centered Buttons */}
              <div className="flex justify-center gap-4 mt-4">
                {/* <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] text-white px-5 py-1.5 rounded-md flex items-center gap-1.5 text-sm"
                >
                  Save as Draft
                </button> */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693]'
                    } flex items-center gap-1.5 text-white px-5 py-1.5 rounded-md text-sm transition-all duration-200`}
                >
                  {isSubmitting ? (
                    <>
                      Submitting
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </>
                  ) : (
                    <>
                      Submit
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
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

export default StationeryRequestForm;