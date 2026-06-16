// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from 'react-router-dom';
// import { HiTrash } from 'react-icons/hi';
// import { API_BASE_URL } from '../Config';
// import Swal from 'sweetalert2';


// const StatUploadForm = () => {
//   const [userToken] = useState(() => {
//     return JSON.parse(localStorage.getItem('userInfo')) || {};
//   });

//   // Fetch stationery items once here (parent)
//   const [backendStationeryItems, setBackendStationeryItems] = useState([]);

//   useEffect(() => {
//     const fetchStationeryItems = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}statstock`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             "Accept": "application/json",
//             Authorization: `Bearer ${userToken.token}`
//           }
//         });
//         const data = await response.json();
//         setBackendStationeryItems(data.data || []);
//       } catch (error) {
//         console.error("Error fetching stationery items:", error);
//       }
//     };

//     if (userToken.token) {
//       fetchStationeryItems();
//     }
//   }, [userToken.token]);

//   // "Dumb" SearchableSelect component - NO fetching inside
//   const SearchableSelect = ({
//     options = [],
//     value = '',
//     onChange,
//     placeholder = "Search items...",
//     className = "",
//     error = false
//   }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filteredOptions, setFilteredOptions] = useState(options);
//     const [highlightedIndex, setHighlightedIndex] = useState(-1);
//     const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

//     const inputRef = useRef(null);
//     const dropdownRef = useRef(null);

//     // Filter options based on search term
//     useEffect(() => {
//       const filtered = options.filter(option =>
//         option.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setFilteredOptions(filtered);
//       setHighlightedIndex(-1);
//     }, [searchTerm, options]);

//     // Sync external value with searchTerm
//     useEffect(() => {
//       setSearchTerm(value);
//     }, [value]);

//     // Close dropdown when clicking outside
//     useEffect(() => {
//       const handleClickOutside = (event) => {
//         if (
//           inputRef.current &&
//           !inputRef.current.contains(event.target) &&
//           dropdownRef.current &&
//           !dropdownRef.current.contains(event.target)
//         ) {
//           setIsOpen(false);
//         }
//       };

//       const handleScroll = () => {
//         if (isOpen) {
//           calculateDropdownPosition();
//         }
//       };
//       const handleResize = () => {
//         if (isOpen) {
//           calculateDropdownPosition();
//         }
//       };

//       document.addEventListener('mousedown', handleClickOutside);
//       window.addEventListener('scroll', handleScroll, true);
//       window.addEventListener('resize', handleResize);

//       return () => {
//         document.removeEventListener('mousedown', handleClickOutside);
//         window.removeEventListener('scroll', handleScroll, true);
//         window.removeEventListener('resize', handleResize);
//       };
//     }, [isOpen]);

//     const calculateDropdownPosition = () => {
//       if (inputRef.current) {
//         const rect = inputRef.current.getBoundingClientRect();
//         const dropdownHeight = 240;
//         const spaceBelow = window.innerHeight - rect.bottom;
//         const spaceAbove = rect.top;

//         const showAbove = spaceAbove > spaceBelow && spaceBelow < dropdownHeight;

//         setDropdownPosition({
//           top: showAbove ? rect.top + window.scrollY - dropdownHeight : rect.bottom + window.scrollY,
//           left: rect.left + window.scrollX,
//           width: rect.width
//         });
//       }
//     };

//       const handleInputChange = (e) => {
//       const newValue = e.target.value;
//       setSearchTerm(newValue);
//       if (!isOpen) {
//         calculateDropdownPosition();
//         setIsOpen(true);
//         // 07012026
//         onChange(newValue)
//       }
//       // Don't call onChange on every keystroke to prevent interrupting typing
//     };

//     const handleInputFocus = () => {
//       calculateDropdownPosition();
//       setIsOpen(true);
//     };

//     const handleOptionSelect = (option) => {
//       setSearchTerm(option);
//       onChange(option);
//       setIsOpen(false);
//       inputRef.current?.blur();
//     };

//     const handleKeyDown = (e) => {
//       if (!isOpen) {
//         if (e.key === 'ArrowDown' || e.key === 'Enter') {
//           calculateDropdownPosition();
//           setIsOpen(true);
//           return;
//         }
//       }

//       switch (e.key) {
//         case 'ArrowDown':
//           e.preventDefault();
//           setHighlightedIndex(prev =>
//             prev < filteredOptions.length - 1 ? prev + 1 : prev
//           );
//           break;

//         case 'ArrowUp':
//           e.preventDefault();
//           setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
//           break;

//         case 'Enter':
//           e.preventDefault();
//           if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
//             handleOptionSelect(filteredOptions[highlightedIndex]);
//           }
//           break;

//         case 'Escape':
//           setIsOpen(false);
//           inputRef.current?.blur();
//           break;

//         default:
//           break;
//       }
//     };

//     const inputStyle = error
//       ? "w-full border border-red-500 rounded-full h-7 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-400 bg-red-50"
//       : "w-full border border-blue-500 rounded-full h-7 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400";

//     return (
//       <div className="relative w-full">
//         <div className="relative">
//           <input
//             ref={inputRef}
//             type="text"
//             value={searchTerm}
//             onChange={handleInputChange}
//             onFocus={handleInputFocus}
//             onKeyDown={handleKeyDown}
//             placeholder={placeholder}
//             className={`${inputStyle} ${className} pr-6`}
//             autoComplete="off"
//           />

//           <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
//             <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//         </div>

//         {isOpen && (
//           <div
//             ref={dropdownRef}
//             className="fixed bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
//             style={{
//               zIndex: 9999,
//               top: `${dropdownPosition.top}px`,
//               left: `${dropdownPosition.left}px`,
//               width: `${dropdownPosition.width}px`
//             }}
//             onMouseDown={(e) => e.preventDefault()}
//           >
//             {filteredOptions.length > 0 ? (
//               filteredOptions.map((option, index) => (
//                 <div
//                   key={index}
//                   onMouseDown={() => handleOptionSelect(option)}
//                   className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-100 ${index === highlightedIndex ? 'bg-blue-100' : ''
//                     } ${searchTerm === option ? 'bg-blue-50 font-medium' : ''}`}
//                 >
//                   {option}
//                 </div>
//               ))
//             ) : (
//               <div className="px-3 py-2 text-sm text-gray-500">
//                 No items found
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   };

//   // FORM STATE AND LOGIC
//   const [formData, setFormData] = useState({
//     date: new Date().toISOString().split('T')[0],
//     request_for: "",
//     name: userToken.employee || "",
//     email: userToken.Email || "",
//     emp_id: userToken.Emp_Id || "",
//     department: "",
//     hod_name: "",
//     items: [{ stationary: "", quantity: "", remarks: "" }],
//     invoice: "",
//     invoicedate: "",
//     file: null,
//     uploadInvoiceDate: ""
//   });

//   const [formMode, setFormMode] = useState('update');
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState("");
//   const [errors, setErrors] = useState({});
//   const [attempted, setAttempted] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [nextItemCode, setNextItemCode] = useState("");

//   // ADD mode state
//   const [addFormData, setAddFormData] = useState({
//     items: [{ item_code: "", material: "" }]
//   });
//   const [addErrors, setAddErrors] = useState({});
//   const [addAttempted, setAddAttempted] = useState(false);

//   // ADJUST mode state 07-01
//   const [adjustFormData, setAdjustFormData] = useState({
//     items: [{ item_code: "", stationary: "", actual_quantity: "", adjust_quantity: "", balance_quantity: "" }]
//   });
//   const [adjustErrors, setAdjustErrors] = useState({});
//   const [adjustAttempted, setAdjustAttempted] = useState(false);

//   const navigate = useNavigate();

//   const fetchNextItemCode = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}next-item-code`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           "Accept": "application/json",
//           Authorization: `Bearer ${userToken.token}`
//         }
//       });

//       const data = await response.json();
//       if (data.success) {
//         setNextItemCode(data.data.next_item_code);

//         setAddFormData(prev => ({
//           ...prev,
//           items: prev.items.map((item, index) =>
//             index === 0 ? { ...item, item_code: data.data.next_item_code } : item
//           )
//         }));
//       }
//     } catch (error) {
//       console.error("Error fetching next item code:", error);
//       const fallbackCode = "STA001";
//       setNextItemCode(fallbackCode);

//       setAddFormData(prev => ({
//         ...prev,
//         items: prev.items.map((item, index) =>
//           index === 0 ? { ...item, item_code: fallbackCode } : item
//         )
//       }));
//     }
//   };

//   useEffect(() => {
//     if (formMode === 'add') {
//       fetchNextItemCode();
//     }
//   }, [formMode]);

//   useEffect(() => {
//     const isPageRefresh = performance?.navigation?.type === 1 || false;
//     if (isPageRefresh || document.referrer === document.location.href) {
//       localStorage.removeItem('stationeryFormDraft');
//     }

//     const today = new Date();
//     const formattedDate = today.toISOString().split('T')[0];
//     setFormData(prev => ({ ...prev, date: formattedDate }));
//   }, []);

//   const handleBack = () => {
//     navigate('/dashboard');
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (formMode === 'update') {
//       const requiredFields = ['invoice', 'invoicedate'];
//       const fieldTypes = {
//         invoice: 'input',
//         invoicedate: 'select',
//       };

//       requiredFields.forEach(field => {
//         if (!formData[field]) {
//           const action = fieldTypes[field] === 'select' ? 'select' : 'enter';
//           const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
//           newErrors[field] = `Please ${action} ${fieldName}`;
//         }
//       });

//       let hasItemError = false;
//       formData.items.forEach((item) => {
//         if (!item.stationary || !item.quantity) {
//           hasItemError = true;
//         }
//       });

//       if (hasItemError) {
//         newErrors.items = 'Please Select Stationery items and Quantity';
//       }
//     } else if (formMode === 'upload') {
//       if (!formData.file) {
//         newErrors.file = 'Please select a file';
//       }
//     } else if (formMode === 'add') {
//       let hasItemError = false;
//       addFormData.items.forEach((item) => {
//         if (!item.item_code || !item.material) {
//           hasItemError = true;
//         }
//       });

//       if (hasItemError) {
//         newErrors.items = 'Please enter Item Code and Material for all entries';
//       }
//     }
//     // 07-01
//      else if (formMode === 'adjust') {
//       let hasItemError = false;
//       adjustFormData.items.forEach((item) => {
//         if (!item.item_code || !item.stationary || !item.actual_quantity || item.adjust_quantity === '') {
//           hasItemError = true;
//         }
//       });

//       if (hasItemError) {
//         newErrors.items = 'Please fill all required fields for stock adjustment';
//       }
//     }

//     if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email address is invalid';
//     }

//     if (formMode === 'add') {
//       setAddErrors(newErrors);
//     } 
//     // 07-01
//     else if (formMode === 'adjust') {
//       setAdjustErrors(newErrors);
//     } else {
//       setErrors(newErrors);
//     }

//     return Object.keys(newErrors).length === 0;
//   };

//   const handleInvoiceChange = (e) => {
//     let value = e.target.value;
//     value = value.toUpperCase();
//     value = value.replace(/[^A-Z0-9]/g, '');

//     setFormData(prev => ({ ...prev, invoice: value }));

//     if (errors.invoice) {
//       setErrors(prev => {
//         const newErr = { ...prev };
//         delete newErr.invoice;
//         return newErr;
//       });
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));

//     if (errors[name]) {
//       setErrors(prev => {
//         const newErr = { ...prev };
//         delete newErr[name];
//         return newErr;
//       });
//     }
//   };

//   const handleAddFormChange = (e, index) => {
//     const { name, value } = e.target;
//     const updatedItems = [...addFormData.items];
//     updatedItems[index] = { ...updatedItems[index], [name]: value };
//     setAddFormData(prev => ({ ...prev, items: updatedItems }));

//     if (addErrors.items) {
//       const allItemsValid = updatedItems.every(item => item.item_code && item.material);
//       if (allItemsValid) {
//         setAddErrors(prev => {
//           const newErr = { ...prev };
//           delete newErr.items;
//           return newErr;
//         });
//       }
//     }
//   };

//   // ========== ADJUST MODE HANDLERS ==========
  
//   // Handle Item Code change - Auto-fill Stationary and Actual Qty
//   const handleItemCodeChange = (value, index) => {
//     const updatedItems = [...adjustFormData.items];
//     updatedItems[index].item_code = value;

//     // Find matching stock item by item code
//     const stockItem = backendStationeryItems.find(item => item.ITEM_CODE === value);
    
//     if (stockItem) {
//       updatedItems[index].stationary = stockItem.MAT;
//       updatedItems[index].actual_quantity = stockItem.BAL_QUAN.toString();
      
//       // Recalculate balance if adjust_quantity exists
//       if (updatedItems[index].adjust_quantity !== '') {
//         const actual = parseFloat(stockItem.BAL_QUAN) || 0;
//         const adjust = parseFloat(updatedItems[index].adjust_quantity) || 0;
//         updatedItems[index].balance_quantity = (actual - adjust).toString();
//       } else {
//         updatedItems[index].balance_quantity = stockItem.BAL_QUAN.toString();
//       }
//     }

//     setAdjustFormData(prev => ({ ...prev, items: updatedItems }));

//     // Clear errors if all fields are valid
//     if (adjustErrors.items) {
//       const allItemsValid = updatedItems.every(item => 
//         item.item_code && item.stationary && item.actual_quantity && item.adjust_quantity !== ''
//       );
//       if (allItemsValid) {
//         setAdjustErrors(prev => {
//           const newErr = { ...prev };
//           delete newErr.items;
//           return newErr;
//         });
//       }
//     }
//   };

//   // Handle Stationary change - Auto-fill Item Code and Actual Qty 07-01
//   const handleStationaryChange = (value, index) => {
//     const updatedItems = [...adjustFormData.items];
//     updatedItems[index].stationary = value;

//     // Find matching stock item by material name
//     const stockItem = backendStationeryItems.find(item => item.MAT === value);
    
//     if (stockItem) {
//       updatedItems[index].item_code = stockItem.ITEM_CODE;
//       updatedItems[index].actual_quantity = stockItem.BAL_QUAN.toString();
      
//       // Recalculate balance if adjust_quantity exists
//       if (updatedItems[index].adjust_quantity !== '') {
//         const actual = parseFloat(stockItem.BAL_QUAN) || 0;
//         const adjust = parseFloat(updatedItems[index].adjust_quantity) || 0;
//         updatedItems[index].balance_quantity = (actual - adjust).toString();
//       } else {
//         updatedItems[index].balance_quantity = stockItem.BAL_QUAN.toString();
//       }
//     }

//     setAdjustFormData(prev => ({ ...prev, items: updatedItems }));

//     // Clear errors if all fields are valid
//     if (adjustErrors.items) {
//       const allItemsValid = updatedItems.every(item => 
//         item.item_code && item.stationary && item.actual_quantity && item.adjust_quantity !== ''
//       );
//       if (allItemsValid) {
//         setAdjustErrors(prev => {
//           const newErr = { ...prev };
//           delete newErr.items;
//           return newErr;
//         });
//       }
//     }
//   };

//   // Handle Adjust Quantity change - Calculate Balance
//   const handleAdjustFormChange = (e, index) => {
//     const { name, value } = e.target;
//     const updatedItems = [...adjustFormData.items];
//     updatedItems[index] = { ...updatedItems[index], [name]: value };

//     // Auto-calculate balance quantity (allow negative adjust_quantity)
//     if (name === 'adjust_quantity') {
//       const actual = parseFloat(updatedItems[index].actual_quantity) || 0;
//       const adjust = parseFloat(value) || 0;
//       updatedItems[index].balance_quantity = (actual - adjust).toString();
//     }

//     setAdjustFormData(prev => ({ ...prev, items: updatedItems }));

//     if (adjustErrors.items) {
//       const allItemsValid = updatedItems.every(item => 
//         item.item_code && item.stationary && item.actual_quantity && item.adjust_quantity !== ''
//       );
//       if (allItemsValid) {
//         setAdjustErrors(prev => {
//           const newErr = { ...prev };
//           delete newErr.items;
//           return newErr;
//         });
//       }
//     }
//   };
//   // 07-01 end

//   const handleItemChange = (e, index) => {
//     const { name, value } = e.target;
    
//     if (name === 'quantity' && value !== '' && parseFloat(value) < 0) {
//       setModalType("negative_quantity");
//       setShowModal(true);
//       return;
//     }
    
//     const updatedItems = [...formData.items];
//     updatedItems[index] = { ...updatedItems[index], [name]: value };
//     setFormData(prev => ({ ...prev, items: updatedItems }));

//     if (errors.items) {
//       const allItemsValid = updatedItems.every(item => item.stationary && item.quantity);
//       if (allItemsValid) {
//         setErrors(prev => {
//           const newErr = { ...prev };
//           delete newErr.items;
//           return newErr;
//         });
//       }
//     }
//   };

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     setFormData(prev => ({ ...prev, file: selectedFile }));

//     if (errors.file) {
//       setErrors(prev => {
//         const newErr = { ...prev };
//         delete newErr.file;
//         return newErr;
//       });
//     }
//   };

//   const handleAddItem = () => {
//     // Prevent adding new rows in adjust mode 07-01
//     if (formMode === 'adjust') {
//       return;
//     }
     
//     if (formMode === 'update') {
//       setFormData(prev => ({
//         ...prev,
//         items: [...prev.items, { stationary: "", quantity: "", remarks: "" }],
//       }));
//     } else if (formMode === 'add') {
//       const currentItems = addFormData.items;
//       const currentMaxCode = Math.max(...currentItems.map(item => {
//         if (item.item_code && item.item_code.startsWith('STA')) {
//           const numPart = parseInt(item.item_code.replace('STA', '')) || 0;
//           return numPart;
//         }
//         return 0;
//       }));

//       const newItemCode = `STA${String(currentMaxCode + 1).padStart(3, '0')}`;

//       setAddFormData(prev => ({
//         ...prev,
//         items: [...prev.items, { item_code: newItemCode, material: "" }],
//       }));
//     }
//     // 07-01
//     else if (formMode === 'adjust') {
//       // Disabled for adjust mode
//       return;
//     }
//   };

//   const handleRemoveItem = (index) => {
//     // In adjust mode, don't allow removing rows 07-01
//     if (formMode === 'adjust') {
//       return;
//     }
    
//     if (formMode === 'update' && formData.items.length > 1) {
//       setFormData(prev => ({
//         ...prev,
//         items: prev.items.filter((_, i) => i !== index),
//       }));
//     } else if (formMode === 'add' && addFormData.items.length > 1) {
//       setAddFormData(prev => ({
//         ...prev,
//         items: prev.items.filter((_, i) => i !== index),
//       }));
//     }
//     // 07-01
//     else if (formMode === 'adjust' && adjustFormData.items.length > 1) {
//       // Disabled for adjust mode
//       return;
//     }
//   };

//   const handleReset = () => {
//     const today = new Date().toISOString().split('T')[0];

//     setFormData({
//       date: today,
//       request_for: "",
//       name: userToken.employee || "",
//       email: userToken.Email || "",
//       emp_id: userToken.Emp_Id || "",
//       department: "",
//       hod_name: "",
//       items: [{ stationary: "", quantity: "", remarks: "" }],
//       invoice: "",
//       invoicedate: "",
//       file: null,
//       uploadInvoiceDate: ""
//     });

//     setAddFormData({
//       items: [{ item_code: "", material: "" }]
//     });
// // 07-01
//     setAdjustFormData({
//       items: [{ item_code: "", stationary: "", actual_quantity: "", adjust_quantity: "", balance_quantity: "" }]
//     });

//     setErrors({});
//     setAddErrors({});
//     // --------07-01
//     setAdjustErrors({}); 
//     setAttempted(false);
//     setAddAttempted(false);
//     // --------07-01
//     setAdjustAttempted(false);

//     localStorage.removeItem('stationeryFormDraft');
//   };

//   const handleSaveAsDraft = () => {
//     const dataToSave = formMode === 'upload'
//       ? { ...formData, formMode }
//       : formMode === 'add'
//         ? { ...formData, ...addFormData, formMode }
//         // 07-01
//         : formMode === 'adjust'
//           ? { ...formData, ...adjustFormData, formMode }
//           : { ...formData, formMode };

//     localStorage.setItem('stationeryFormDraft', JSON.stringify(dataToSave));

//     setModalType("draft");
//     setShowModal(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     // Different confirmation messages based on form mode
//     let confirmationMessage = 'Do you want to go ahead with the stationery request?';
    
//     if (formMode === 'add') {
//       confirmationMessage = 'Do you want to add new stock items?';
//     } else if (formMode === 'adjust') {
//       confirmationMessage = 'Do you want to adjust the stock quantities?';
//     } else if (formMode === 'upload') {
//       confirmationMessage = 'Do you want to upload the stationery file?';
//     }
  
//     const result = await Swal.fire({
//       title: 'Are you sure?',
//       text: confirmationMessage,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Yes',
//       cancelButtonText: 'No',
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//     });
  
//     // If user clicks "No", stop the submission
//     if (!result.isConfirmed) {
//       return;
//     }
  
//     // Rest of your existing validation code...
//     if (formMode === 'add') {
//       setAddAttempted(true);
//     } else if (formMode === 'adjust') {
//       setAdjustAttempted(true);
//     } else {
//       setAttempted(true);
//     }
  
//     const isValid = validateForm();
//     if (!isValid) {
//       setModalType("error");
//       setShowModal(true);
//       return;
//     }
  
//     setIsSubmitting(true);
  
//     try {
//       let endpoint, requestData;

//       if (formMode === 'add') {
//         endpoint = `${API_BASE_URL}add-stock-item`;
//         requestData = {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Accept": "application/json",
//             Authorization: `Bearer ${userToken.token}`
//           },
//           body: JSON.stringify({
//             items: addFormData.items.map(item => ({
//               item_code: item.item_code,
//               material: item.material
//             }))
//           })
//         };
//       }
//       // 07-01
//       else if (formMode === 'adjust') {
//         endpoint = `${API_BASE_URL}adjust-stock`;
//         requestData = {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Accept": "application/json",
//             Authorization: `Bearer ${userToken.token}`
//           },
//           body: JSON.stringify({
//             items: adjustFormData.items.map(item => ({
//               item_code: item.item_code,
//               stationary: item.stationary,
//               actual_quantity: parseFloat(item.actual_quantity),
//               adjust_quantity: parseFloat(item.adjust_quantity),
//               balance_quantity: parseFloat(item.balance_quantity)
//             }))
//           })
//         };
//       } else {
//         endpoint = `${API_BASE_URL}stationary-upload`;

//         if (formMode === 'update') {
//           const stationary_items = formData.items.map(item => ({
//             name: item.stationary,
//             quantity: parseInt(item.quantity, 10),
//           }));

//           requestData = {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               "Accept": "application/json",
//               Authorization: `Bearer ${userToken.token}`
//             },
//             body: JSON.stringify({
//               invoice_number: formData.invoice,
//               invoicedate: formData.invoicedate,
//               stationary_items
//             })
//           };
//         } else {
//           const formDataObj = new FormData();
//           formDataObj.append('file', formData.file);
//           formDataObj.append('invoicedate', formData.uploadInvoiceDate);

//           requestData = {
//             method: "POST",
//             headers: {
//               "Accept": "application/json",
//               Authorization: `Bearer ${userToken.token}`
//             },
//             body: formDataObj
//           };
//         }
//       }

//       const response = await fetch(endpoint, requestData);
//       const responseData = await response.json();

//       if (response.ok && responseData.success) {
//         setModalType("submit");
//         setShowModal(true);
//         handleReset();

//         if (formMode === 'add') {
//           fetchNextItemCode();
//         }
//       } else {
//         console.error("API Error:", responseData.message || responseData.errors);
//         setModalType("error");
//         setShowModal(true);
//       }
//     } catch (error) {
//       console.error("Error in Storing Data", error);
//       setModalType("error");
//       setShowModal(true);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const inputStyle = "w-80 border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";
//   const highlightedInputStyle = "w-80 border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";
//   const errorInputStyle = "w-80 border border-red-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-400 bg-red-50";
//   const buttonStyle = "px-6 py-2 text-sm font-medium rounded-md transition-colors duration-300";
//   const activeButtonStyle = `${buttonStyle} bg-blue-600 text-white`;
//   const inactiveButtonStyle = `${buttonStyle} bg-gray-300 text-gray-700`;

//   const getInputStyle = (fieldName) => {
//     if (errors[fieldName] && attempted) {
//       return errorInputStyle;
//     }
//     if (['date', 'name', 'email', 'emp_id'].includes(fieldName)) {
//       return highlightedInputStyle;
//     }
//     return inputStyle;
//   };

//   const Modal = ({ onClose }) => {
//     const hasErrors = modalType === "error";
//     const isDraft = modalType === "draft";
//     const isNegativeQuantity = modalType === "negative_quantity";

//     return (
//       <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white p-4 rounded-md max-w-md w-full text-center">
//           <div className="flex justify-center mb-2">
//             {hasErrors || isNegativeQuantity ? (
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
//             {hasErrors ? "Error" : isDraft ? "Draft Saved" : isNegativeQuantity ? "Invalid Quantity" : "Success"}
//           </h2>
//           <p className="mb-4 text-sm">
//             {hasErrors ? "Please fill all required fields." : isDraft ? "Form saved as draft!" : isNegativeQuantity ? "Negative values are not allowed in quantity field." : "Form submitted successfully!"}
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
//           <div className="p-4">
//             <div className="flex justify-between items-center">
//               <div className="flex items-center">
//                 <img src="./quote6.png" alt="Logo" className="mr-4 w-60 h-12 rounded-lg" />
//               </div>
//               <div className="flex-grow flex justify-center">
//                 <div className="bg-[#83bcc9] px-5 py-1.5 rounded-lg inline-block -ml-20">
//                   <h1 className="text-xl font-bold text-white">Stationery Upload Form</h1>
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

//           {/* Mode Selection Buttons */}
//           <div className="flex justify-center gap-4 mt-4">
//             <button
//               type="button"
//               onClick={() => setFormMode('update')}
//               className={formMode === 'update' ? activeButtonStyle : inactiveButtonStyle}
//               disabled={formMode === 'update'}
//             >
//               UPDATE
//             </button>
//             <button
//               type="button"
//               onClick={() => setFormMode('upload')}
//               className={formMode === 'upload' ? activeButtonStyle : inactiveButtonStyle}
//               disabled={formMode === 'upload'}
//             >
//               UPLOAD
//             </button>
//             <button
//               type="button"
//               onClick={() => setFormMode('add')}
//               className={formMode === 'add' ? activeButtonStyle : inactiveButtonStyle}
//               disabled={formMode === 'add'}
//             >
//               ADD
//             </button>
//             {/* 07-01 */}
//             <button
//               type="button"
//               onClick={() => setFormMode('adjust')}
//               className={formMode === 'adjust' ? activeButtonStyle : inactiveButtonStyle}
//               disabled={formMode === 'adjust'}
//             >
//               STOCK ADJUST
//             </button>
//           </div>

//           <div className="p-3">
//             <form onSubmit={handleSubmit} noValidate>
//               <div className="grid grid-cols-10 gap-4">

//                 <div className="col-span-4 flex justify-center items-start">
//                   <img
//                     src="./stationeryimg.jpg"
//                     alt="Form process illustration"
//                     className="max-w-full max-h-48 mb-3 mt-4"
//                   />
//                 </div>
//                  {/* 07-01 */}
//                 <div className="col-span-6 space-y-1">
//                   {formMode === 'adjust' ? (
//                     <>
//                       {/* ADJUST Mode Items Table - No Action column or Plus button */}
//                       <div className="mt-4">
//                         <div className="flex items-center justify-between mb-2 max-w-[700px]">
//                           <label className="text-indigo-800 font-bold text-xs">Stock Adjustment</label>
//                           {/* Plus button removed for adjust mode */}
//                         </div>

//                         <div className="bg-blue-600 text-white grid grid-cols-12 p-1.5 rounded-t-lg text-xs font-semibold max-w-[700px]">
//                           <div className="col-span-1 text-center border-r border-white">S.No</div>
//                           <div className="col-span-2 px-2 border-r border-white">Item Code</div>
//                           <div className="col-span-3 px-2 border-r border-white">Stationery Item</div>
//                           <div className="col-span-2 px-2 border-r border-white">Actual Qty</div>
//                           <div className="col-span-2 px-2 border-r border-white">Adjust Qty</div>
//                           <div className="col-span-2 px-2">Balance</div>
//                           {/* Action column header removed */}
//                         </div>

//                         <div className="max-h-80 overflow-y-auto border border-t-0 border-gray-300 rounded-b-lg max-w-[700px]">
//                           {adjustFormData.items.map((item, index) => (
//                             <div key={index} className="grid grid-cols-12 p-1 border-b border-gray-200 text-xs items-center">
//                               <div className="col-span-1 text-center border-r border-gray-300 py-1">
//                                 {index + 1}
//                               </div>

//                               <div className="col-span-2 px-1 border-r border-gray-300">
//                                 <SearchableSelect
//                                   options={backendStationeryItems.map(item => item.ITEM_CODE)}
//                                   value={item.item_code}
//                                   onChange={(value) => handleItemCodeChange(value, index)}
//                                   placeholder="Code..."
//                                   error={adjustErrors.items && adjustAttempted}
//                                   className="text-xs"
//                                 />
//                               </div>

//                               <div className="col-span-3 px-1 border-r border-gray-300">
//                                 <SearchableSelect
//                                   options={backendStationeryItems.map(item => item.MAT)}
//                                   value={item.stationary}
//                                   onChange={(value) => handleStationaryChange(value, index)}
//                                   placeholder="Search items..."
//                                   error={adjustErrors.items && adjustAttempted}
//                                   className="text-xs"
//                                 />
//                               </div>

//                               <div className="col-span-2 px-1 border-r border-gray-300">
//                                 <input
//                                   type="number"
//                                   name="actual_quantity"
//                                   placeholder="Actual"
//                                   value={item.actual_quantity}
//                                   readOnly
//                                   className="w-full border border-gray-300 rounded-full h-7 px-2 text-xs focus:outline-none bg-gray-100 text-gray-600"
//                                 />
//                               </div>

//                               <div className="col-span-2 px-1 border-r border-gray-300">
//                                 <input
//                                   type="number"
//                                   name="adjust_quantity"
//                                   placeholder="Adjust"
//                                   step="0.01"
//                                   value={item.adjust_quantity}
//                                   onChange={(e) => handleAdjustFormChange(e, index)}
//                                   className={`${adjustErrors.items && adjustAttempted ? 'border-red-500 bg-red-50' : 'border-blue-500'} w-full border rounded-full h-7 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400`}
//                                 />
//                               </div>

//                               <div className="col-span-2 px-1">
//                                 <input
//                                   type="number"
//                                   name="balance_quantity"
//                                   value={item.balance_quantity}
//                                   readOnly
//                                   className="w-full border border-gray-300 rounded-full h-7 px-2 text-xs focus:outline-none bg-blue-50 text-blue-800 font-medium"
//                                 />
//                               </div>

//                               {/* Action column cell removed */}
//                             </div>
//                           ))}
//                         </div>

//                         {adjustErrors.items && adjustAttempted && (
//                           <div className="text-red-500 text-xs mt-1 max-w-[700px]">{adjustErrors.items}</div>
//                         )}
//                       </div>
//                     </>
//                   ) : formMode === 'add' ? (
//                     <>
//                       {/* ADD Mode Items Table - Keep existing code */}
//                       <div className="mt-4">
//                         <div className="flex items-center justify-between mb-2 max-w-[500px]">
//                           <label className="text-indigo-800 font-bold text-xs">Add Stock Items</label>
//                           <button
//                             type="button"
//                             onClick={handleAddItem}
//                             className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] text-white w-7 h-7 rounded-lg flex items-center justify-center text-base"
//                           >
//                             +
//                           </button>
//                         </div>

//                         <div className="bg-blue-600 text-white grid grid-cols-12 p-1.5 rounded-t-lg text-xs font-semibold max-w-[500px]">
//                           <div className="col-span-1 text-center border-r border-white">S.No</div>
//                           <div className="col-span-5 px-2 border-r border-white">Item Code</div>
//                           <div className="col-span-4 px-2 border-r border-white">Material</div>
//                           <div className="col-span-2 text-center">Action</div>
//                         </div>

//                         <div className="max-h-36 overflow-y-auto border border-t-0 border-gray-300 rounded-b-lg max-w-[500px]">
//                           {addFormData.items.map((item, index) => (
//                             <div key={index} className="grid grid-cols-12 p-1 border-b border-gray-200 text-xs items-center">
//                               <div className="col-span-1 text-center border-r border-gray-300 py-1">
//                                 {index + 1}
//                               </div>

//                               <div className="col-span-5 px-1 border-r border-gray-300">
//                                 <input
//                                   type="text"
//                                   name="item_code"
//                                   placeholder={item.item_code || "Loading..."}
//                                   value={item.item_code || ""}
//                                   readOnly
//                                   className="w-full border border-gray-300 rounded-full h-7 px-2 text-xs focus:outline-none bg-gray-100 text-gray-600"
//                                 />
//                               </div>

//                               <div className="col-span-4 px-1 border-r border-gray-300">
//                                 <input
//                                   type="text"
//                                   name="material"
//                                   placeholder="Material Name"
//                                   value={item.material}
//                                   onChange={(e) => handleAddFormChange(e, index)}
//                                   className={`${addErrors.items && addAttempted ? 'border-red-500 bg-red-50' : 'border-blue-500'} w-full border rounded-full h-7 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400`}
//                                 />
//                               </div>

//                               <div className="col-span-2 flex justify-center py-1">
//                                 <button
//                                   type="button"
//                                   onClick={() => handleRemoveItem(index)}
//                                   disabled={addFormData.items.length === 1}
//                                   className={`${addFormData.items.length === 1
//                                     ? 'text-gray-400 cursor-not-allowed'
//                                     : 'text-red-600 hover:text-red-800'
//                                     }`}
//                                 >
//                                   <HiTrash className="w-4 h-4" />
//                                 </button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>

//                         {addErrors.items && addAttempted && (
//                           <div className="text-red-500 text-xs mt-1 max-w-[500px]">{addErrors.items}</div>
//                         )}
//                       </div>
//                     </>
//                   ) : formMode === 'update' ? (
//                     <>
//                       {/* UPDATE Mode - Keep existing code */}
//                       <div className="mb-2">
//                         <div className="flex items-center gap-3">
//                           <label className="w-32 text-indigo-800 font-bold text-xs flex-shrink-0">
//                             Invoice Number<span className="text-red-500 ml-1">*</span>
//                           </label>
//                           <input
//                             type="text"
//                             name="invoice"
//                             value={formData.invoice || ""}
//                             onChange={handleInvoiceChange}
//                             placeholder="Enter invoice number"
//                             className={`${getInputStyle('invoice')} h-7 text-xs px-2`}
//                           />
//                         </div>
//                         {errors.invoice && attempted && (
//                           <div className="pl-36 text-red-500 text-xs mt-0.5">{errors.invoice}</div>
//                         )}
//                       </div>

//                       <div className="mb-2">
//                         <div className="flex items-center gap-3">
//                           <label className="w-32 text-indigo-800 font-bold text-xs flex-shrink-0">
//                             Invoice Date<span className="text-red-500 ml-1">*</span>
//                           </label>
//                           <input
//                             type="date"
//                             name="invoicedate"
//                             value={formData.invoicedate}
//                             onChange={handleChange}
//                             className={`${getInputStyle('invoicedate')} py-1 text-xs bg-transparent`}
//                           />
//                         </div>
//                         {errors.invoicedate && attempted && (
//                           <div className="pl-36 text-red-500 text-xs mt-0.5">{errors.invoicedate}</div>
//                         )}
//                       </div>

//                       {/* Stationery Items Table */}
//                       <div className="mt-4">
//                         <div className="flex items-center justify-between mb-2 max-w-[500px]">
//                           <label className="text-indigo-800 font-bold text-xs">Stationery Items</label>
//                           <button
//                             type="button"
//                             onClick={handleAddItem}
//                             className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] text-white w-7 h-7 rounded-lg flex items-center justify-center text-base"
//                           >
//                             +
//                           </button>
//                         </div>

//                         <div className="bg-blue-600 text-white grid grid-cols-12 p-1.5 rounded-t-lg text-xs font-semibold max-w-[500px]">
//                           <div className="col-span-1 text-center border-r border-white">S.No</div>
//                           <div className="col-span-5 px-2 border-r border-white">Stationery Item</div>
//                           <div className="col-span-4 px-2 border-r border-white">Quantity</div>
//                           <div className="col-span-2 text-center">Action</div>
//                         </div>

//                         <div className="max-h-36 overflow-y-auto border border-t-0 border-gray-300 rounded-b-lg max-w-[500px]">
//                           {formData.items.map((item, index) => (
//                             <div key={index} className="grid grid-cols-12 p-1 border-b border-gray-200 text-xs items-center">
//                               <div className="col-span-1 text-center border-r border-gray-300 py-1">
//                                 {index + 1}
//                               </div>

//                               <div className="col-span-5 px-1 border-r border-gray-300">
//                                 <SearchableSelect
//                                   options={backendStationeryItems.map(item => item.MAT)}
//                                   value={item.stationary}
//                                   onChange={(value) => {
//                                     const event = { target: { name: 'stationary', value } };
//                                     handleItemChange(event, index);
//                                   }}
//                                   placeholder="Search items..."
//                                   error={errors.items && attempted}
//                                   className="text-xs"
//                                 />
//                               </div>

//                               <div className="col-span-4 px-1 border-r border-gray-300">
//                                 <input
//                                   type="number"
//                                   name="quantity"
//                                   placeholder="Qty"
//                                   min="1"
//                                   value={item.quantity}
//                                   onChange={(e) => handleItemChange(e, index)}
//                                   className={`${errors.items && attempted ? 'border-red-500 bg-red-50' : 'border-blue-500'} w-full border rounded-full h-7 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400`}
//                                 />
//                               </div>

//                               <div className="col-span-2 flex justify-center py-1">
//                                 <button
//                                   type="button"
//                                   onClick={() => handleRemoveItem(index)}
//                                   disabled={formData.items.length === 1}
//                                   className={`${formData.items.length === 1
//                                     ? 'text-gray-400 cursor-not-allowed'
//                                     : 'text-red-600 hover:text-red-800'
//                                     }`}
//                                 >
//                                   <HiTrash className="w-4 h-4" />
//                                 </button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>

//                         {errors.items && attempted && (
//                           <div className="text-red-500 text-xs mt-1 max-w-[500px]">{errors.items}</div>
//                         )}
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       {/* UPLOAD Mode */}
//                       <div className="mt-4 space-y-4">
//                         <div className="mb-2">
//                           <div className="flex items-center gap-3">
//                             <label className="w-32 text-indigo-800 font-bold text-xs flex-shrink-0">
//                               Upload File<span className="text-red-500 ml-1">*</span>
//                             </label>
//                             <input
//                               type="file"
//                               onChange={handleFileChange}
//                               className={`${errors.file && attempted ? 'border-red-500 bg-red-50' : 'border-blue-500'} w-80 border rounded-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400`}
//                               accept=".xlsx,.xls,.csv,.pdf"
//                             />
//                           </div>
//                           {errors.file && attempted && (
//                             <div className="pl-36 text-red-500 text-xs mt-0.5">{errors.file}</div>
//                           )}
//                         </div>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//               {/* 07 -01 */}

//               {/* Buttons */}
//               <div className="flex justify-center gap-5 mt-5">
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className={`${isSubmitting
//                     ? 'bg-orange-500 cursor-not-allowed'
//                     : 'bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693]'
//                     } flex items-center gap-1.5 text-white px-5 py-1.5 rounded-md text-sm transition-colors duration-200`}
//                 >
//                   {isSubmitting ? (
//                     <>
//                       Submitting
//                       <span className="inline-flex">
//                         <span className="animate-pulse">.</span>
//                         <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
//                         <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       Submit
//                       <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                       </svg>
//                     </>
//                   )}
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

//// export default StatUploadForm;

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { HiTrash } from 'react-icons/hi';
import { API_BASE_URL } from '../Config';
import Swal from 'sweetalert2';


const StatUploadForm = () => {
  const [userToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo')) || {};
  });

  // Fetch stationery items once here (parent)
  const [backendStationeryItems, setBackendStationeryItems] = useState([]);

  useEffect(() => {
    const fetchStationeryItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}statstock`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${userToken.token}`
          }
        });
        const data = await response.json();
        setBackendStationeryItems(data.data || []);
      } catch (error) {
        console.error("Error fetching stationery items:", error);
      }
    };

    if (userToken.token) {
      fetchStationeryItems();
    }
  }, [userToken.token]);

  // "Dumb" SearchableSelect component - NO fetching inside
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
      const filtered = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
      setHighlightedIndex(-1);
    }, [searchTerm, options]);

    // Sync external value with searchTerm
    useEffect(() => {
      setSearchTerm(value);
    }, [value]);

    // Close dropdown when clicking outside
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

    const calculateDropdownPosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const dropdownHeight = 240;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        const showAbove = spaceAbove > spaceBelow && spaceBelow < dropdownHeight;

        setDropdownPosition({
          top: showAbove ? rect.top + window.scrollY - dropdownHeight : rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };

      const handleInputChange = (e) => {
      const newValue = e.target.value;
      setSearchTerm(newValue);
      if (!isOpen) {
        calculateDropdownPosition();
        setIsOpen(true);
        // 07012026
        onChange(newValue)
      }
      // Don't call onChange on every keystroke to prevent interrupting typing
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
      ? "w-full border border-red-500 rounded-full h-7 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-400 bg-red-50"
      : "w-full border border-blue-500 rounded-full h-7 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400";

    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`${inputStyle} ${className} pr-6`}
            autoComplete="off"
          />

          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

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
            onMouseDown={(e) => e.preventDefault()}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  onMouseDown={() => handleOptionSelect(option)}
                  className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-100 ${index === highlightedIndex ? 'bg-blue-100' : ''
                    } ${searchTerm === option ? 'bg-blue-50 font-medium' : ''}`}
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

  // FORM STATE AND LOGIC
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    request_for: "",
    name: userToken.employee || "",
    email: userToken.Email || "",
    emp_id: userToken.Emp_Id || "",
    department: "",
    hod_name: "",
    items: [{ stationary: "", quantity: "", remarks: "" }],
    invoice: "",
    invoicedate: "",
    file: null,
    uploadInvoiceDate: ""
  });

  const [formMode, setFormMode] = useState('update');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextItemCode, setNextItemCode] = useState("");

  // ADD mode state
  const [addFormData, setAddFormData] = useState({
    items: [{ item_code: "", material: "" }]
  });
  const [addErrors, setAddErrors] = useState({});
  const [addAttempted, setAddAttempted] = useState(false);

  // ADJUST mode state 07-01
  const [adjustFormData, setAdjustFormData] = useState({
    items: [{ item_code: "", stationary: "", actual_quantity: "", adjust_quantity: "", balance_quantity: "" }]
  });
  const [adjustErrors, setAdjustErrors] = useState({});
  const [adjustAttempted, setAdjustAttempted] = useState(false);

  const navigate = useNavigate();

  const fetchNextItemCode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}next-item-code`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${userToken.token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setNextItemCode(data.data.next_item_code);

        setAddFormData(prev => ({
          ...prev,
          items: prev.items.map((item, index) =>
            index === 0 ? { ...item, item_code: data.data.next_item_code } : item
          )
        }));
      }
    } catch (error) {
      console.error("Error fetching next item code:", error);
      const fallbackCode = "STA001";
      setNextItemCode(fallbackCode);

      setAddFormData(prev => ({
        ...prev,
        items: prev.items.map((item, index) =>
          index === 0 ? { ...item, item_code: fallbackCode } : item
        )
      }));
    }
  };

  useEffect(() => {
    if (formMode === 'add') {
      fetchNextItemCode();
    }
  }, [formMode]);

  useEffect(() => {
    const isPageRefresh = performance?.navigation?.type === 1 || false;
    if (isPageRefresh || document.referrer === document.location.href) {
      localStorage.removeItem('stationeryFormDraft');
    }

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: formattedDate }));
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const validateForm = () => {
    const newErrors = {};

    if (formMode === 'update') {
      const requiredFields = ['invoice', 'invoicedate'];
      const fieldTypes = {
        invoice: 'input',
        invoicedate: 'select',
      };

      requiredFields.forEach(field => {
        if (!formData[field]) {
          const action = fieldTypes[field] === 'select' ? 'select' : 'enter';
          const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          newErrors[field] = `Please ${action} ${fieldName}`;
        }
      });

      let hasItemError = false;
      formData.items.forEach((item) => {
        if (!item.stationary || !item.quantity) {
          hasItemError = true;
        }
      });

      if (hasItemError) {
        newErrors.items = 'Please Select Stationery items and Quantity';
      }
    } else if (formMode === 'upload') {
      if (!formData.file) {
        newErrors.file = 'Please select a file';
      }
    } else if (formMode === 'add') {
      let hasItemError = false;
      addFormData.items.forEach((item) => {
        if (!item.item_code || !item.material) {
          hasItemError = true;
        }
      });

      if (hasItemError) {
        newErrors.items = 'Please enter Item Code and Material for all entries';
      }
    }
    // 07-01
     else if (formMode === 'adjust') {
      let hasItemError = false;
      adjustFormData.items.forEach((item) => {
        if (!item.item_code || !item.stationary || !item.actual_quantity || item.adjust_quantity === '') {
          hasItemError = true;
        }
      });

      if (hasItemError) {
        newErrors.items = 'Please fill all required fields for stock adjustment';
      }
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }

    if (formMode === 'add') {
      setAddErrors(newErrors);
    } 
    // 07-01
    else if (formMode === 'adjust') {
      setAdjustErrors(newErrors);
    } else {
      setErrors(newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleInvoiceChange = (e) => {
    let value = e.target.value;
    value = value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, '');

    setFormData(prev => ({ ...prev, invoice: value }));

    if (errors.invoice) {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr.invoice;
        return newErr;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }
  };

  const handleAddFormChange = (e, index) => {
    const { name, value } = e.target;
    const updatedItems = [...addFormData.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setAddFormData(prev => ({ ...prev, items: updatedItems }));

    if (addErrors.items) {
      const allItemsValid = updatedItems.every(item => item.item_code && item.material);
      if (allItemsValid) {
        setAddErrors(prev => {
          const newErr = { ...prev };
          delete newErr.items;
          return newErr;
        });
      }
    }
  };

  // ========== ADJUST MODE HANDLERS ==========
  
  // Handle Item Code change - Auto-fill Stationary and Actual Qty
  const handleItemCodeChange = (value, index) => {
    const updatedItems = [...adjustFormData.items];
    updatedItems[index].item_code = value;

    // Find matching stock item by item code
    const stockItem = backendStationeryItems.find(item => item.ITEM_CODE === value);
    
    if (stockItem) {
      updatedItems[index].stationary = stockItem.MAT;
      updatedItems[index].actual_quantity = stockItem.BAL_QUAN.toString();
      
      // Recalculate balance if adjust_quantity exists
      if (updatedItems[index].adjust_quantity !== '') {
        const actual = parseFloat(stockItem.BAL_QUAN) || 0;
        const adjust = parseFloat(updatedItems[index].adjust_quantity) || 0;
        updatedItems[index].balance_quantity = (actual - adjust).toString();
      } else {
        updatedItems[index].balance_quantity = stockItem.BAL_QUAN.toString();
      }
    }

    setAdjustFormData(prev => ({ ...prev, items: updatedItems }));

    // Clear errors if all fields are valid
    if (adjustErrors.items) {
      const allItemsValid = updatedItems.every(item => 
        item.item_code && item.stationary && item.actual_quantity && item.adjust_quantity !== ''
      );
      if (allItemsValid) {
        setAdjustErrors(prev => {
          const newErr = { ...prev };
          delete newErr.items;
          return newErr;
        });
      }
    }
  };

  // Handle Stationary change - Auto-fill Item Code and Actual Qty 07-01
  const handleStationaryChange = (value, index) => {
    const updatedItems = [...adjustFormData.items];
    updatedItems[index].stationary = value;

    // Find matching stock item by material name
    const stockItem = backendStationeryItems.find(item => item.MAT === value);
    
    if (stockItem) {
      updatedItems[index].item_code = stockItem.ITEM_CODE;
      updatedItems[index].actual_quantity = stockItem.BAL_QUAN.toString();
      
      // Recalculate balance if adjust_quantity exists
      if (updatedItems[index].adjust_quantity !== '') {
        const actual = parseFloat(stockItem.BAL_QUAN) || 0;
        const adjust = parseFloat(updatedItems[index].adjust_quantity) || 0;
        updatedItems[index].balance_quantity = (actual - adjust).toString();
      } else {
        updatedItems[index].balance_quantity = stockItem.BAL_QUAN.toString();
      }
    }

    setAdjustFormData(prev => ({ ...prev, items: updatedItems }));

    // Clear errors if all fields are valid
    if (adjustErrors.items) {
      const allItemsValid = updatedItems.every(item => 
        item.item_code && item.stationary && item.actual_quantity && item.adjust_quantity !== ''
      );
      if (allItemsValid) {
        setAdjustErrors(prev => {
          const newErr = { ...prev };
          delete newErr.items;
          return newErr;
        });
      }
    }
  };

  // Handle Adjust Quantity change - Calculate Balance
  const handleAdjustFormChange = (e, index) => {
    const { name, value } = e.target;
    const updatedItems = [...adjustFormData.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };

    // Auto-calculate balance quantity (allow negative adjust_quantity)
    if (name === 'adjust_quantity') {
      const actual = parseFloat(updatedItems[index].actual_quantity) || 0;
      const adjust = parseFloat(value) || 0;
      updatedItems[index].balance_quantity = (actual - adjust).toString();
    }

    setAdjustFormData(prev => ({ ...prev, items: updatedItems }));

    if (adjustErrors.items) {
      const allItemsValid = updatedItems.every(item => 
        item.item_code && item.stationary && item.actual_quantity && item.adjust_quantity !== ''
      );
      if (allItemsValid) {
        setAdjustErrors(prev => {
          const newErr = { ...prev };
          delete newErr.items;
          return newErr;
        });
      }
    }
  };
  // 07-01 end

  const handleItemChange = (e, index) => {
    const { name, value } = e.target;
    
    if (name === 'quantity' && value !== '' && parseFloat(value) < 0) {
      setModalType("negative_quantity");
      setShowModal(true);
      return;
    }
    
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setFormData(prev => ({ ...prev, items: updatedItems }));

    if (errors.items) {
      const allItemsValid = updatedItems.every(item => item.stationary && item.quantity);
      if (allItemsValid) {
        setErrors(prev => {
          const newErr = { ...prev };
          delete newErr.items;
          return newErr;
        });
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFormData(prev => ({ ...prev, file: selectedFile }));

    if (errors.file) {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr.file;
        return newErr;
      });
    }
  };

  const handleAddItem = () => {
    // Prevent adding new rows in adjust mode 07-01
    if (formMode === 'adjust') {
      return;
    }
     
    if (formMode === 'update') {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { stationary: "", quantity: "", remarks: "" }],
      }));
    } else if (formMode === 'add') {
      const currentItems = addFormData.items;
      const currentMaxCode = Math.max(...currentItems.map(item => {
        if (item.item_code && item.item_code.startsWith('STA')) {
          const numPart = parseInt(item.item_code.replace('STA', '')) || 0;
          return numPart;
        }
        return 0;
      }));

      const newItemCode = `STA${String(currentMaxCode + 1).padStart(3, '0')}`;

      setAddFormData(prev => ({
        ...prev,
        items: [...prev.items, { item_code: newItemCode, material: "" }],
      }));
    }
    // 07-01
    else if (formMode === 'adjust') {
      // Disabled for adjust mode
      return;
    }
  };

  const handleRemoveItem = (index) => {
    // In adjust mode, don't allow removing rows 07-01
    if (formMode === 'adjust') {
      return;
    }
    
    if (formMode === 'update' && formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    } else if (formMode === 'add' && addFormData.items.length > 1) {
      setAddFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
    // 07-01
    else if (formMode === 'adjust' && adjustFormData.items.length > 1) {
      // Disabled for adjust mode
      return;
    }
  };

  const handleReset = () => {
    const today = new Date().toISOString().split('T')[0];

    setFormData({
      date: today,
      request_for: "",
      name: userToken.employee || "",
      email: userToken.Email || "",
      emp_id: userToken.Emp_Id || "",
      department: "",
      hod_name: "",
      items: [{ stationary: "", quantity: "", remarks: "" }],
      invoice: "",
      invoicedate: "",
      file: null,
      uploadInvoiceDate: ""
    });

    setAddFormData({
      items: [{ item_code: "", material: "" }]
    });
// 07-01
    setAdjustFormData({
      items: [{ item_code: "", stationary: "", actual_quantity: "", adjust_quantity: "", balance_quantity: "" }]
    });

    setErrors({});
    setAddErrors({});
    // --------07-01
    setAdjustErrors({}); 
    setAttempted(false);
    setAddAttempted(false);
    // --------07-01
    setAdjustAttempted(false);

    localStorage.removeItem('stationeryFormDraft');
  };

  const handleSaveAsDraft = () => {
    const dataToSave = formMode === 'upload'
      ? { ...formData, formMode }
      : formMode === 'add'
        ? { ...formData, ...addFormData, formMode }
        // 07-01
        : formMode === 'adjust'
          ? { ...formData, ...adjustFormData, formMode }
          : { ...formData, formMode };

    localStorage.setItem('stationeryFormDraft', JSON.stringify(dataToSave));

    setModalType("draft");
    setShowModal(true);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Different confirmation messages based on form mode
  let confirmationMessage = 'Do you want to go ahead with stationery update?';
  
  if (formMode === 'add') {
    confirmationMessage = 'Do you want to add new stationery items?';
  } else if (formMode === 'adjust') {
    confirmationMessage = 'Do you want to adjust the stock quantities?';
  } else if (formMode === 'upload') {
    confirmationMessage = 'Do you want to upload the stationery file?';
  }

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: confirmationMessage,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
  });

  // If user clicks "No", stop the submission
  if (!result.isConfirmed) {
    return;
  }

  // Rest of your existing validation code...
  if (formMode === 'add') {
    setAddAttempted(true);
  } else if (formMode === 'adjust') {
    setAdjustAttempted(true);
  } else {
    setAttempted(true);
  }

  const isValid = validateForm();
  if (!isValid) {
    setModalType("error");
    setShowModal(true);
    return;
  }

  setIsSubmitting(true);

    try {
      let endpoint, requestData;

      if (formMode === 'add') {
        endpoint = `${API_BASE_URL}add-stock-item`;
        requestData = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${userToken.token}`
          },
          body: JSON.stringify({
            items: addFormData.items.map(item => ({
              item_code: item.item_code,
              material: item.material
            }))
          })
        };
      }
      // 07-01
      else if (formMode === 'adjust') {
        endpoint = `${API_BASE_URL}adjust-stock`;
        requestData = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${userToken.token}`
          },
          body: JSON.stringify({
            items: adjustFormData.items.map(item => ({
              item_code: item.item_code,
              stationary: item.stationary,
              actual_quantity: parseFloat(item.actual_quantity),
              adjust_quantity: parseFloat(item.adjust_quantity),
              balance_quantity: parseFloat(item.balance_quantity)
            }))
          })
        };
      } else {
        endpoint = `${API_BASE_URL}stationary-upload`;

        if (formMode === 'update') {
          const stationary_items = formData.items.map(item => ({
            name: item.stationary,
            quantity: parseInt(item.quantity, 10),
          }));

          requestData = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              Authorization: `Bearer ${userToken.token}`
            },
            body: JSON.stringify({
              invoice_number: formData.invoice,
              invoicedate: formData.invoicedate,
              stationary_items
            })
          };
        } else {
          const formDataObj = new FormData();
          formDataObj.append('file', formData.file);
          formDataObj.append('invoicedate', formData.uploadInvoiceDate);

          requestData = {
            method: "POST",
            headers: {
              "Accept": "application/json",
              Authorization: `Bearer ${userToken.token}`
            },
            body: formDataObj
          };
        }
      }

      const response = await fetch(endpoint, requestData);
      const responseData = await response.json();

      if (response.ok && responseData.success) {
        setModalType("submit");
        setShowModal(true);
        handleReset();

        if (formMode === 'add') {
          fetchNextItemCode();
        }
      } else {
        console.error("API Error:", responseData.message || responseData.errors);
        setModalType("error");
        setShowModal(true);
      }
    } catch (error) {
    console.error("Error in Storing Data", error);
    setModalType("error");
    setShowModal(true);
  } finally {
    setIsSubmitting(false);
  }
};

  const inputStyle = "w-80 border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";
  const highlightedInputStyle = "w-80 border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";
  const errorInputStyle = "w-80 border border-red-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-400 bg-red-50";
  const buttonStyle = "px-6 py-2 text-sm font-medium rounded-md transition-colors duration-300";
  const activeButtonStyle = `${buttonStyle} bg-blue-600 text-white`;
  const inactiveButtonStyle = `${buttonStyle} bg-gray-300 text-gray-700`;

  const getInputStyle = (fieldName) => {
    if (errors[fieldName] && attempted) {
      return errorInputStyle;
    }
    if (['date', 'name', 'email', 'emp_id'].includes(fieldName)) {
      return highlightedInputStyle;
    }
    return inputStyle;
  };

  const Modal = ({ onClose }) => {
    const hasErrors = modalType === "error";
    const isDraft = modalType === "draft";
    const isNegativeQuantity = modalType === "negative_quantity";

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-md max-w-md w-full text-center">
          <div className="flex justify-center mb-2">
            {hasErrors || isNegativeQuantity ? (
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
            {hasErrors ? "Error" : isDraft ? "Draft Saved" : isNegativeQuantity ? "Invalid Quantity" : "Success"}
          </h2>
          <p className="mb-4 text-sm">
            {hasErrors ? "Please fill all required fields." : isDraft ? "Form saved as draft!" : isNegativeQuantity ? "Negative values are not allowed in quantity field." : "Form submitted successfully!"}
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
                <img src="./quote6.png" alt="Logo" className="mr-4 w-60 h-12 rounded-lg" />
              </div>
              <div className="flex-grow flex justify-center">
                <div className="bg-[#83bcc9] px-5 py-1.5 rounded-lg inline-block -ml-20">
                  <h1 className="text-xl font-bold text-white">Stationery Upload Form</h1>
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

          {/* Mode Selection Buttons */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={() => setFormMode('update')}
              className={formMode === 'update' ? activeButtonStyle : inactiveButtonStyle}
              disabled={formMode === 'update'}
            >
              UPDATE
            </button>
            <button
              type="button"
              onClick={() => setFormMode('upload')}
              className={formMode === 'upload' ? activeButtonStyle : inactiveButtonStyle}
              disabled={formMode === 'upload'}
            >
              UPLOAD
            </button>
            <button
              type="button"
              onClick={() => setFormMode('add')}
              className={formMode === 'add' ? activeButtonStyle : inactiveButtonStyle}
              disabled={formMode === 'add'}
            >
              ADD
            </button>
            {/* 07-01 */}
            <button
              type="button"
              onClick={() => setFormMode('adjust')}
              className={formMode === 'adjust' ? activeButtonStyle : inactiveButtonStyle}
              disabled={formMode === 'adjust'}
            >
              STOCK ADJUST
            </button>
          </div>

          <div className="p-3">
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-10 gap-4">

                <div className="col-span-4 flex justify-center items-start">
                  <img
                    src="./stationeryimg.jpg"
                    alt="Form process illustration"
                    className="max-w-full max-h-48 mb-3 mt-4"
                  />
                </div>
                 {/* 07-01 */}
                <div className="col-span-6 space-y-1">
                  {formMode === 'adjust' ? (
                    <>
                      {/* ADJUST Mode Items Table - No Action column or Plus button */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2 max-w-[700px]">
                          <label className="text-indigo-800 font-bold text-xs">Stock Adjustment</label>
                          {/* Plus button removed for adjust mode */}
                        </div>

                        <div className="bg-blue-600 text-white grid grid-cols-12 p-1.5 rounded-t-lg text-xs font-semibold max-w-[700px]">
                          <div className="col-span-1 text-center border-r border-white">S.No</div>
                          <div className="col-span-2 px-2 border-r border-white">Item Code</div>
                          <div className="col-span-3 px-2 border-r border-white">Stationery Item</div>
                          <div className="col-span-2 px-2 border-r border-white">Actual Qty</div>
                          <div className="col-span-2 px-2 border-r border-white">Adjust Qty</div>
                          <div className="col-span-2 px-2">Balance</div>
                          {/* Action column header removed */}
                        </div>

                        <div className="max-h-80 overflow-y-auto border border-t-0 border-gray-300 rounded-b-lg max-w-[700px]">
                          {adjustFormData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 p-1 border-b border-gray-200 text-xs items-center">
                              <div className="col-span-1 text-center border-r border-gray-300 py-1">
                                {index + 1}
                              </div>

                              <div className="col-span-2 px-1 border-r border-gray-300">
                                <SearchableSelect
                                  options={backendStationeryItems.map(item => item.ITEM_CODE)}
                                  value={item.item_code}
                                  onChange={(value) => handleItemCodeChange(value, index)}
                                  placeholder="Code..."
                                  error={adjustErrors.items && adjustAttempted}
                                  className="text-xs"
                                />
                              </div>

                              <div className="col-span-3 px-1 border-r border-gray-300">
                                <SearchableSelect
                                  options={backendStationeryItems.map(item => item.MAT)}
                                  value={item.stationary}
                                  onChange={(value) => handleStationaryChange(value, index)}
                                  placeholder="Search items..."
                                  error={adjustErrors.items && adjustAttempted}
                                  className="text-xs"
                                />
                              </div>

                              <div className="col-span-2 px-1 border-r border-gray-300">
                                <input
                                  type="number"
                                  name="actual_quantity"
                                  placeholder="Actual"
                                  value={item.actual_quantity}
                                  readOnly
                                  className="w-full border border-gray-300 rounded-full h-7 px-2 text-xs focus:outline-none bg-gray-100 text-gray-600"
                                />
                              </div>

                              <div className="col-span-2 px-1 border-r border-gray-300">
                                <input
                                  type="number"
                                  name="adjust_quantity"
                                  placeholder="Adjust"
                                  step="0.01"
                                  value={item.adjust_quantity}
                                  onChange={(e) => handleAdjustFormChange(e, index)}
                                  className={`${adjustErrors.items && adjustAttempted ? 'border-red-500 bg-red-50' : 'border-blue-500'} w-full border rounded-full h-7 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400`}
                                />
                              </div>

                              <div className="col-span-2 px-1">
                                <input
                                  type="number"
                                  name="balance_quantity"
                                  value={item.balance_quantity}
                                  readOnly
                                  className="w-full border border-gray-300 rounded-full h-7 px-2 text-xs focus:outline-none bg-blue-50 text-blue-800 font-medium"
                                />
                              </div>

                              {/* Action column cell removed */}
                            </div>
                          ))}
                        </div>

                        {adjustErrors.items && adjustAttempted && (
                          <div className="text-red-500 text-xs mt-1 max-w-[700px]">{adjustErrors.items}</div>
                        )}
                      </div>
                    </>
                  ) : formMode === 'add' ? (
                    <>
                      {/* ADD Mode Items Table - Keep existing code */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2 max-w-[500px]">
                          <label className="text-indigo-800 font-bold text-xs">Add Stock Items</label>
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] text-white w-7 h-7 rounded-lg flex items-center justify-center text-base"
                          >
                            +
                          </button>
                        </div>

                        <div className="bg-blue-600 text-white grid grid-cols-12 p-1.5 rounded-t-lg text-xs font-semibold max-w-[500px]">
                          <div className="col-span-1 text-center border-r border-white">S.No</div>
                          <div className="col-span-5 px-2 border-r border-white">Item Code</div>
                          <div className="col-span-4 px-2 border-r border-white">Material</div>
                          <div className="col-span-2 text-center">Action</div>
                        </div>

                        <div className="max-h-36 overflow-y-auto border border-t-0 border-gray-300 rounded-b-lg max-w-[500px]">
                          {addFormData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 p-1 border-b border-gray-200 text-xs items-center">
                              <div className="col-span-1 text-center border-r border-gray-300 py-1">
                                {index + 1}
                              </div>

                              <div className="col-span-5 px-1 border-r border-gray-300">
                                <input
                                  type="text"
                                  name="item_code"
                                  placeholder={item.item_code || "Loading..."}
                                  value={item.item_code || ""}
                                  readOnly
                                  className="w-full border border-gray-300 rounded-full h-7 px-2 text-xs focus:outline-none bg-gray-100 text-gray-600"
                                />
                              </div>

                              <div className="col-span-4 px-1 border-r border-gray-300">
                                <input
                                  type="text"
                                  name="material"
                                  placeholder="Material Name"
                                  value={item.material}
                                  onChange={(e) => handleAddFormChange(e, index)}
                                  className={`${addErrors.items && addAttempted ? 'border-red-500 bg-red-50' : 'border-blue-500'} w-full border rounded-full h-7 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400`}
                                />
                              </div>

                              <div className="col-span-2 flex justify-center py-1">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  disabled={addFormData.items.length === 1}
                                  className={`${addFormData.items.length === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-600 hover:text-red-800'
                                    }`}
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {addErrors.items && addAttempted && (
                          <div className="text-red-500 text-xs mt-1 max-w-[500px]">{addErrors.items}</div>
                        )}
                      </div>
                    </>
                  ) : formMode === 'update' ? (
                    <>
                      {/* UPDATE Mode - Keep existing code */}
                      <div className="mb-2">
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-indigo-800 font-bold text-xs flex-shrink-0">
                            Invoice Number<span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            name="invoice"
                            value={formData.invoice || ""}
                            onChange={handleInvoiceChange}
                            placeholder="Enter invoice number"
                            className={`${getInputStyle('invoice')} h-7 text-xs px-2`}
                          />
                        </div>
                        {errors.invoice && attempted && (
                          <div className="pl-36 text-red-500 text-xs mt-0.5">{errors.invoice}</div>
                        )}
                      </div>

                      <div className="mb-2">
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-indigo-800 font-bold text-xs flex-shrink-0">
                            Invoice Date<span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="date"
                            name="invoicedate"
                            value={formData.invoicedate}
                            onChange={handleChange}
                            className={`${getInputStyle('invoicedate')} py-1 text-xs bg-transparent`}
                          />
                        </div>
                        {errors.invoicedate && attempted && (
                          <div className="pl-36 text-red-500 text-xs mt-0.5">{errors.invoicedate}</div>
                        )}
                      </div>

                      {/* Stationery Items Table */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2 max-w-[500px]">
                          <label className="text-indigo-800 font-bold text-xs">Stationery Items</label>
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] text-white w-7 h-7 rounded-lg flex items-center justify-center text-base"
                          >
                            +
                          </button>
                        </div>

                        <div className="bg-blue-600 text-white grid grid-cols-12 p-1.5 rounded-t-lg text-xs font-semibold max-w-[500px]">
                          <div className="col-span-1 text-center border-r border-white">S.No</div>
                          <div className="col-span-5 px-2 border-r border-white">Stationery Item</div>
                          <div className="col-span-4 px-2 border-r border-white">Quantity</div>
                          <div className="col-span-2 text-center">Action</div>
                        </div>

                        <div className="max-h-36 overflow-y-auto border border-t-0 border-gray-300 rounded-b-lg max-w-[500px]">
                          {formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 p-1 border-b border-gray-200 text-xs items-center">
                              <div className="col-span-1 text-center border-r border-gray-300 py-1">
                                {index + 1}
                              </div>

                              <div className="col-span-5 px-1 border-r border-gray-300">
                                <SearchableSelect
                                  options={backendStationeryItems.map(item => item.MAT)}
                                  value={item.stationary}
                                  onChange={(value) => {
                                    const event = { target: { name: 'stationary', value } };
                                    handleItemChange(event, index);
                                  }}
                                  placeholder="Search items..."
                                  error={errors.items && attempted}
                                  className="text-xs"
                                />
                              </div>

                              <div className="col-span-4 px-1 border-r border-gray-300">
                                <input
                                  type="number"
                                  name="quantity"
                                  placeholder="Qty"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(e, index)}
                                  className={`${errors.items && attempted ? 'border-red-500 bg-red-50' : 'border-blue-500'} w-full border rounded-full h-7 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400`}
                                />
                              </div>

                              <div className="col-span-2 flex justify-center py-1">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  disabled={formData.items.length === 1}
                                  className={`${formData.items.length === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-600 hover:text-red-800'
                                    }`}
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {errors.items && attempted && (
                          <div className="text-red-500 text-xs mt-1 max-w-[500px]">{errors.items}</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* UPLOAD Mode */}
                      <div className="mt-4 space-y-4">
                        <div className="mb-2">
                          <div className="flex items-center gap-3">
                            <label className="w-32 text-indigo-800 font-bold text-xs flex-shrink-0">
                              Upload File<span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                              type="file"
                              onChange={handleFileChange}
                              className={`${errors.file && attempted ? 'border-red-500 bg-red-50' : 'border-blue-500'} w-80 border rounded-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400`}
                              accept=".xlsx,.xls,.csv,.pdf"
                            />
                          </div>
                          {errors.file && attempted && (
                            <div className="pl-36 text-red-500 text-xs mt-0.5">{errors.file}</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* 07 -01 */}

              {/* Buttons */}
              <div className="flex justify-center gap-5 mt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${isSubmitting
                    ? 'bg-orange-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693]'
                    } flex items-center gap-1.5 text-white px-5 py-1.5 rounded-md text-sm transition-colors duration-200`}
                >
                  {isSubmitting ? (
                    <>
                      Submitting
                      <span className="inline-flex">
                        <span className="animate-pulse">.</span>
                        <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                        <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
                      </span>
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

export default StatUploadForm;