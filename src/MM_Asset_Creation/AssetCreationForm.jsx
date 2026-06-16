// import React, { useState, useEffect } from "react";
// import { useNavigate } from 'react-router-dom';
// import { API_BASE_URL } from '../Config';
// import {
//   HiArrowLeft, HiOutlineCube, HiOutlineSave,
//   HiOutlineOfficeBuilding, HiOutlineMap, HiOutlineTag,
//   HiOutlineUser, HiOutlineMail, HiOutlineBriefcase, HiOutlineCalendar,
//   HiOutlineLibrary, HiOutlineLocationMarker, HiOutlineCollection,
//   HiOutlineHashtag, HiOutlineClipboardList, HiOutlineScale,
//   HiOutlineBeaker, HiOutlineTruck, HiOutlineStatusOnline,
//   HiOutlineGlobe, HiOutlineHome, HiOutlineViewGrid,
//   HiOutlineDocumentText, HiOutlineShoppingCart, HiOutlineCurrencyRupee,
//   HiOutlineAnnotation
// } from 'react-icons/hi';
// import Swal from 'sweetalert2';

// const AssetCreationForm = () => {
//   const navigate = useNavigate();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitAttempted, setSubmitAttempted] = useState(false);
//   const [companies, setCompanies] = useState([]);
//   const [plants, setPlants] = useState([]);
//   const [assetClasses, setAssetClasses] = useState([]);
//   const [wbsCostCenters, setWbsCostCenters] = useState([]);
//   const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});

//   const currentUser = {
//     name: userToken.employee || "N/A",
//     email: userToken.Email || "N/A",
//     designation: userToken.Designation || "N/A",
//     department: userToken.Department || "N/A",
//     currentDate: new Date().toLocaleDateString('en-GB', {
//       day: '2-digit', month: 'short', year: 'numeric'
//     })
//   };

//   const [formData, setFormData] = useState({
//     company_code: "", plant_code: "", asset_class: "", similar_assets_count: "1",
//     wbs_cost_center: "", wbs_description: "", quantity: "", uom: "",
//     vendor_custom: "", capitalized_date: "", status: "", zone: "",
//     mandal_village: "", asset_purchase_type: "", asset_name: "", location: "",
//     sno: "", inventory_number: "", asset_val: ""
//     //  remarks: ""
//   });

//   useEffect(() => {
//     if (!userToken.token) return;
//     const fetchData = async () => {
//       try {
//         const headers = { "Content-Type": "application/json", Authorization: `Bearer ${userToken.token}` };
//         const [compRes, assetRes] = await Promise.all([
//           fetch(`${API_BASE_URL}companies`, { headers }),
//           fetch(`${API_BASE_URL}asset-classes`, { headers })
//         ]);
//         const compData = await compRes.json();
//         const assetData = await assetRes.json();
//         if (compData.success) setCompanies(compData.data);
//         if (assetData.success) setAssetClasses(assetData.data);
//       } catch (error) { console.error("Error:", error); }
//     };
//     fetchData();
//   }, [userToken.token]);

//   //--------------------by vineeth on 26052026 -----------------------
//   const [selectedFiles, setSelectedFiles] = useState([]);

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     const MAX_SIZE_MB = 1;
//     const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024; // 1,048,576 bytes
  
//     // Check if any file exceeds the limit
//     const oversizedFiles = files.filter(file => file.size > MAX_SIZE_BYTES);
  
//     if (oversizedFiles.length > 0) {
//       Swal.fire({
//         title: 'File Too Large',
//         text: `One or more files exceed the ${MAX_SIZE_MB}MB limit. Please compress them and try again.`,
//         icon: 'error',
//         confirmButtonColor: '#4f46e5',
//       });
      
//       // Clear the input and state
//       e.target.value = ""; 
//       setSelectedFiles([]);
//       return;
//     }
  
//     setSelectedFiles(files);
//   };
//   //--------------------end by vineeth on 26052026 -----------------------


//   const handleCompanyChange = (e) => {
//     const selectedCode = e.target.value;
//     const compcodeOnly = selectedCode.split(" - ")[0];
//     setFormData({ ...formData, company_code: selectedCode, plant_code: "", wbs_cost_center: "", wbs_description: "" });
//     setPlants([]);
//     setWbsCostCenters([]);
//     if (selectedCode) {
//       fetch(`${API_BASE_URL}plants/${compcodeOnly}`, {
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken.token}` }
//       }).then(res => res.json()).then(result => { if (result.success) setPlants(result.data); });
//     }
//   };

//   const handlePlantChange = (e) => {
//     const selectedPlant = e.target.value;
//     const codeOnly = selectedPlant.split(" - ")[0];
//     setFormData({ ...formData, plant_code: selectedPlant, wbs_cost_center: "", wbs_description: "" });
//     setWbsCostCenters([]);
//     if (selectedPlant) {
//       fetch(`${API_BASE_URL}wbs-cost-centers/${codeOnly}`, {
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken.token}` }
//       }).then(res => res.json()).then(result => { if (result.success) setWbsCostCenters(result.data); });
//     }
//   };

//   const handleWbsChange = (e) => {
//     const selectedValue = e.target.value;
//     const selectedObj = wbsCostCenters.find(item => item.wbs_cost_center === selectedValue);
//     setFormData({ ...formData, wbs_cost_center: selectedValue, wbs_description: selectedObj ? selectedObj.wbs_description : "" });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setSubmitAttempted(true);

//     // Validate remarks before proceeding
//     // if (!formData.remarks.trim()) {
//     //   Swal.fire({
//     //     title: 'Remarks Required',
//     //     text: 'Please enter remarks before submitting the form.',
//     //     icon: 'warning',
//     //  // confirmButtonColor: '#4f46e5',
//     //     confirmButtonText: 'OK'
//     //   });
//     //   return;
//     // }

//     const payload = {
//       ...formData,
//       created_by_name: currentUser.name,
//       created_by_username: currentUser.username,
//       created_by_email: currentUser.email,
//       created_by_designation: currentUser.designation,
//       created_by_department: currentUser.department,
//       registration_date: currentUser.currentDate
//     };

//     const confirm = await Swal.fire({
//       title: 'Register New Asset?',
//       text: "Please confirm all details are correct.",
//       icon: 'question',
//       showCancelButton: true,
//       confirmButtonColor: '#4f46e5',
//       confirmButtonText: 'Yes, Create'
//     });

//     if (confirm.isConfirmed) {
//       setIsSubmitting(true);
//       try {
//         const response = await fetch(`${API_BASE_URL}create-asset`, {
//           method: 'POST',
//           headers: { "Content-Type": "application/json", "Authorization": `Bearer ${userToken.token}` },
//           body: JSON.stringify(payload)
//         });
//         const result = await response.json();
//         if (response.ok && result.success) {
//           Swal.fire({ title: 'Success!', text: result.message || 'Asset registered successfully', icon: 'success', showConfirmButton: false, timer: 2000 });
//           setTimeout(() => navigate('/dashboard'), 2000);
//         } else {
//           throw new Error(result.message || "Failed to register asset");
//         }
//       } catch (error) {
//         Swal.fire({ title: 'Error', text: error.message || 'Connection to server failed', icon: 'error' });
//       } finally {
//         setIsSubmitting(false);
//       }
//     }
//   };

//   const labelStyle = "flex items-center gap-1.5 text-[10px] font-bold text-gray-700 mb-1 tracking-wide uppercase";
//   const inputStyle = "w-full border border-gray-200 rounded-lg py-1.5 px-3 text-xs text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white transition-all disabled:bg-gray-100 disabled:text-gray-400 shadow-sm placeholder-gray-400";
//   const selectStyle = "w-full border border-gray-200 rounded-lg py-1.5 px-3 text-xs text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white transition-all disabled:bg-gray-100 disabled:text-gray-400 shadow-sm cursor-pointer";

//   return (
//     <div className="mx-auto max-w-7xl">

//       {/* ── Outer Container ── */}
//       <div className="p-3 border border-blue-200 shadow-xl bg-gradient-to-br from-slate-100 to-blue-100 rounded-2xl">

//         {/* ── Header Card ── */}
//         <div className="mb-2 overflow-hidden border shadow-xl rounded-2xl border-white/60">

//           {/* Title Bar */}
//           <div className="relative px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
//             <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 to-transparent" />
//             <div className="flex items-center justify-center gap-2.5 relative">
//               <div className="p-1.5 bg-white/20 rounded-lg ring-1 ring-white/30">
//                 <HiOutlineCube className="text-white" size={15} />
//               </div>
//               <h1 className="text-sm font-extrabold text-white tracking-[0.15em] uppercase drop-shadow">
//                 Asset Creation Form
//               </h1>
//             </div>
//             <button
//               onClick={() => navigate(-1)}
//               className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 ring-1 ring-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95"
//             >
//               <HiArrowLeft size={12} /> Back
//             </button>
//           </div>

//           {/* User Info Strip */}
//           <div className="px-5 py-3 border-t border-indigo-100 bg-gradient-to-r from-white via-slate-50 to-white">
//             <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
//               {[
//                 { icon: HiOutlineCalendar, bg: "bg-blue-100", ring: "ring-blue-200", iconCls: "text-blue-600", label: "Date", value: currentUser.currentDate },
//                 { icon: HiOutlineUser, bg: "bg-violet-100", ring: "ring-violet-200", iconCls: "text-violet-600", label: "Employee", value: currentUser.name },
//                 { icon: HiOutlineMail, bg: "bg-pink-100", ring: "ring-pink-200", iconCls: "text-pink-600", label: "Email", value: currentUser.email, extra: "col-span-2 md:col-span-1" },
//                 { icon: HiOutlineBriefcase, bg: "bg-indigo-100", ring: "ring-indigo-200", iconCls: "text-indigo-600", label: "Designation", value: currentUser.designation },
//                 { icon: HiOutlineOfficeBuilding, bg: "bg-emerald-100", ring: "ring-emerald-200", iconCls: "text-emerald-600", label: "Department", value: currentUser.department },
//               ].map(({ icon: Icon, bg, ring, iconCls, label, value, extra }) => (
//                 <div key={label} className={`flex items-center gap-2.5 min-w-0 ${extra || ""}`}>
//                   <div className={`p-1.5 ${bg} ring-1 ${ring} rounded-lg shrink-0`}>
//                     <Icon className={iconCls} size={13} />
//                   </div>
//                   <div className="min-w-0">
//                     <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
//                     <p className="text-xs font-bold text-gray-800 truncate">{value}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* ── Form Grid ── */}
//         <form onSubmit={handleSubmit}>
//           <div className="grid grid-cols-1 gap-2 mb-2 lg:grid-cols-2 xl:grid-cols-4">

//             {/* 1. Organizational Data — Blue */}
//             <div className="bg-gradient-to-br from-blue-200 to-indigo-200 rounded-2xl shadow-md hover:shadow-xl border-2 border-blue-500 border-t-[3px] border-t-blue-500 p-4 transition-all duration-300 hover:-translate-y-0.5">
//               <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-blue-300/70">
//                 <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-sm shadow-blue-200">
//                   <HiOutlineOfficeBuilding size={14} className="text-white" />
//                 </div>
//                 <h2 className="text-[11px] font-extrabold text-blue-900 tracking-wider uppercase">Organizational Data</h2>
//               </div>
//               <div className="space-y-3">
//                 <div>
//                   <label className={labelStyle}><HiOutlineLibrary size={14} className="text-blue-700" />Company Code *</label>
//                   <select name="company_code" required value={formData.company_code} onChange={handleCompanyChange} className={selectStyle}>
//                     <option value="">Select Company</option>
//                     {companies.map(comp => (
//                       <option key={comp.company_code} value={`${comp.company_code} - ${comp.company_name}`}>
//                         {comp.company_code} - {comp.company_name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className={labelStyle}><HiOutlineOfficeBuilding size={14} className="text-blue-700" />Plant Code *</label>
//                   <select name="plant_code" required disabled={!formData.company_code} value={formData.plant_code} onChange={handlePlantChange} className={selectStyle}>
//                     <option value="">Select Plant</option>
//                     {plants.map(plt => (
//                       <option key={plt.plant_code} value={`${plt.plant_code} - ${plt.plant_name}`}>
//                         {plt.plant_code} - {plt.plant_name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className={labelStyle}><HiOutlineCollection size={14} className="text-blue-700" />WBS / Cost Center *</label>
//                   <select name="wbs_cost_center" required disabled={!formData.plant_code} value={formData.wbs_cost_center} onChange={handleWbsChange} className={selectStyle}>
//                     <option value="">Select WBS/CC</option>
//                     {wbsCostCenters.map((item, idx) => (
//                       <option key={idx} value={item.wbs_cost_center}>{item.wbs_cost_center}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className={labelStyle}><HiOutlineDocumentText size={14} className="text-blue-700" />WBS/CC Description</label>
//                   <input type="text" value={formData.wbs_description} readOnly
//                     className="w-full border border-blue-300 rounded-lg py-1.5 px-3 text-xs bg-blue-100 text-blue-800 font-semibold outline-none" />
//                 </div>
//               </div>
//             </div>

//             {/* 2. Asset Specification — Purple */}
//             <div className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl shadow-md hover:shadow-xl border-2 border-purple-500 border-t-[3px] border-t-purple-500 p-4 transition-all duration-300 hover:-translate-y-0.5">
//               <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-purple-300/70">
//                 <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-sm shadow-purple-200">
//                   <HiOutlineCube size={14} className="text-white" />
//                 </div>
//                 <h2 className="text-[11px] font-extrabold text-purple-900 tracking-wider uppercase">Asset Specification</h2>
//               </div>
//               <div className="space-y-3">
//                 <div>
//                   <label className={labelStyle}><HiOutlineCube size={14} className="text-purple-700" />Asset Name *</label>
//                   <input type="text" name="asset_name" required value={formData.asset_name} onChange={handleInputChange} className={inputStyle} placeholder="Enter asset name" />
//                 </div>
//                 <div>
//                   <label className={labelStyle}><HiOutlineViewGrid size={14} className="text-purple-700" />Asset Class *</label>
//                   <select name="asset_class" required value={formData.asset_class} onChange={handleInputChange} className={selectStyle}>
//                     <option value="">Select Class</option>
//                     {assetClasses.map((item, idx) => (
//                       <option key={idx} value={item.ASSET_CLASS}>{item.ASSET_CLASS}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="grid grid-cols-2 gap-2">
//                   {/* <label className={labelStyle}><HiOutlineHashtag size={14} className="text-purple-700" />Total Units</label>
//                   <input type="number" name="similar_assets_count" value={formData.similar_assets_count} onChange={handleInputChange} className={inputStyle} /> */}
//                   <div>
//                     <label className={labelStyle}><HiOutlineScale size={14} className="text-emerald-700" />Total Units</label>
//                     <input type="number" name="similar_assets_count" value={formData.similar_assets_count} onChange={handleInputChange} className={inputStyle} />
//                   </div>
//                   <div>
//                     <label className={labelStyle}><HiOutlineBeaker size={14} className="text-emerald-700" />Asset Value</label>
//                     <input type="text" name="asset_val" value={formData.asset_val} onChange={handleInputChange} className={inputStyle} />
//                   </div>
//                 </div>
//                 <div>
//                   <label className={labelStyle}><HiOutlineShoppingCart size={14} className="text-purple-700" />Purchase Type</label>
//                   <select name="asset_purchase_type" value={formData.asset_purchase_type} onChange={handleInputChange} className={selectStyle}>
//                     <option value="">Select Type</option>
//                     <option value="New">New</option>
//                     <option value="Old">Old</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* 3. Inventory & Capitalization — Emerald */}
//             <div className="bg-gradient-to-br from-emerald-200 to-teal-200 rounded-2xl shadow-md hover:shadow-xl border-2 border-emerald-500 border-t-[3px] border-t-emerald-500 p-4 transition-all duration-300 hover:-translate-y-0.5">
//               <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-emerald-300/70">
//                 <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-sm shadow-emerald-200">
//                   <HiOutlineTag size={14} className="text-white" />
//                 </div>
//                 <h2 className="text-[11px] font-extrabold text-emerald-900 tracking-wider uppercase">Inventory & Capitalization</h2>
//               </div>
//               <div className="space-y-3">
//                 {/* <div>
//                   <label className={labelStyle}><HiOutlineHashtag size={14} className="text-emerald-700" />S.No</label>
//                   <input type="text" name="sno" value={formData.sno} onChange={handleInputChange} className={inputStyle} placeholder="Enter S.No" />
//                 </div>
//                 <div>
//                   <label className={labelStyle}><HiOutlineClipboardList size={14} className="text-emerald-700" />Inventory Number</label>
//                   <input type="text" name="inventory_number" value={formData.inventory_number} onChange={handleInputChange} className={inputStyle} placeholder="Enter inventory number" />
//                 </div> */}

//                 <div className="grid grid-cols-2 gap-2">
//                   <div>
//                     <label className={labelStyle}><HiOutlineHashtag size={14} className="text-emerald-700" />S.No</label>
//                     <input type="text" name="sno" value={formData.sno} onChange={handleInputChange} className={inputStyle} placeholder="Enter S.No" />
//                   </div>
//                   <div>
//                     <label className={labelStyle}><HiOutlineClipboardList size={14} className="text-emerald-700" />Inventory NO</label>
//                     <input type="text" name="inventory_number" value={formData.inventory_number} onChange={handleInputChange} className={inputStyle} placeholder="Enter inventory number" />
//                   </div>
//                 </div>


//                 <div className="grid grid-cols-2 gap-2">
//                   <div>
//                     <label className={labelStyle}><HiOutlineScale size={14} className="text-emerald-700" />Quantity</label>
//                     <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className={inputStyle} placeholder="0.00" />
//                   </div>
//                   <div>
//                     <label className={labelStyle}><HiOutlineBeaker size={14} className="text-emerald-700" />UOM</label>
//                     <input type="text" name="uom" value={formData.uom} onChange={handleInputChange} className={inputStyle} placeholder="e.g., NOS, KG" />
//                   </div>
//                 </div>
//                 <div>
//                   <label className={labelStyle}><HiOutlineTruck size={14} className="text-emerald-700" />Vendor</label>
//                   <input type="text" name="vendor_custom" value={formData.vendor_custom} onChange={handleInputChange} className={inputStyle} placeholder="Vendor name" />
//                 </div>
//                 <div>
//                   <label className={labelStyle}><HiOutlineCalendar size={14} className="text-emerald-700" />Capitalization Date</label>
//                   <input type="date" name="capitalized_date" value={formData.capitalized_date} onChange={handleInputChange} className={inputStyle} />
//                 </div>
//               </div>
//             </div>

//             {/* 4. Location & Status — Amber/Orange */}
//             <div className="bg-gradient-to-br from-orange-200 to-amber-200 rounded-2xl shadow-md hover:shadow-xl border-2 border-orange-500 border-t-[3px] border-t-orange-500 p-4 transition-all duration-300 hover:-translate-y-0.5">
//               <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-orange-300/70">
//                 <div className="p-1.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-sm shadow-orange-200">
//                   <HiOutlineMap size={14} className="text-white" />
//                 </div>
//                 <h2 className="text-[11px] font-extrabold text-orange-900 tracking-wider uppercase">Location & Status</h2>
//               </div>
//               <div className="space-y-3">
//                 <div>
//                   <label className={labelStyle}><HiOutlineStatusOnline size={14} className="text-orange-700" />Status</label>
//                   <select name="status" value={formData.status} onChange={handleInputChange} className={selectStyle}>
//                     <option value="">Select Status</option>
//                     <option value="AGCU">AGCU - Agri. Cultivated</option>
//                     <option value="AGNC">AGNC - Agri. Non-Cultivated</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className={labelStyle}><HiOutlineGlobe size={14} className="text-orange-700" />Zone</label>
//                   <select name="zone" value={formData.zone} onChange={handleInputChange} className={selectStyle}>
//                     <option value="">Select Zone</option>
//                     <option value="111G">111G - Govt Order</option>
//                     <option value="HMDA">HMDA</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className={labelStyle}><HiOutlineHome size={14} className="text-orange-700" />Village</label>
//                   <select name="mandal_village" value={formData.mandal_village} onChange={handleInputChange} className={selectStyle}>
//                     <option value="">Select Village</option>
//                     <option value="V1">Village A</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className={labelStyle}><HiOutlineLocationMarker size={14} className="text-orange-700" />Location</label>
//                   <input type="text" name="location" value={formData.location} onChange={handleInputChange} className={inputStyle} placeholder="Enter specific location" />
//                 </div>
//               </div>
//             </div>

//             {/* 5. Attachments — Indigo */}
// {/* 5. Attachments — Slim Version */}
// <div className="lg:col-span-2 xl:col-span-4 bg-gradient-to-r from-slate-100 to-indigo-50 rounded-xl shadow-sm border border-indigo-300 p-2 px-4 transition-all duration-300">
//   <div className="flex flex-col md:flex-row items-center gap-4">
    
//     {/* Label & Icon - Compact */}
//     <div className="flex items-center gap-2 shrink-0 border-r border-indigo-200 pr-4">
//       <div className="p-1 bg-indigo-500 rounded-md shadow-sm">
//         <HiOutlineDocumentText size={12} className="text-white" />
//       </div>
//       <h2 className="text-[10px] font-extrabold text-indigo-900 tracking-wider uppercase">Documents</h2>
//     </div>

//     {/* Small Upload Area */}
//     <div className="relative group shrink-0">
//       <input 
//         type="file" 
//         multiple 
//         onChange={handleFileChange}
//         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
//       />
//       <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-dashed border-indigo-400 rounded-lg group-hover:bg-indigo-50 transition-all">
//         <HiOutlineDocumentText size={14} className="text-indigo-500" />
//         <span className="text-[10px] font-bold text-indigo-600 uppercase">Attach Files</span>
//       </div>
//     </div>

//     {/* Horizontal File List - This will scroll horizontally if there are many files */}
//     <div className="flex-1 flex gap-2 overflow-x-auto py-1 no-scrollbar">
//       {selectedFiles.length > 0 ? (
//         selectedFiles.map((file, index) => (
//           <div key={index} className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-200 px-2 py-1 rounded-md shrink-0">
//             <HiOutlineTag size={10} className="text-indigo-600" />
//             <span className="text-[9px] text-indigo-800 font-bold max-w-[120px] truncate">{file.name}</span>
//             <span className="text-[8px] text-indigo-400 uppercase">{(file.size / 1024).toFixed(0)}KB</span>
//           </div>
//         ))
//       ) : (
//         <span className="text-[10px] italic text-gray-400">No attachments added (Optional)</span>
//       )}
//     </div>

//   </div>
// </div>
//           </div>

//           {/* ── Remarks + Submit Row ── */}
//           {/* <div className="flex items-end justify-between gap-4 pb-2"> */}
//           <div className="flex items-end justify-end gap-4 pb-2">

//             {/* Remarks Field — left side */}
//             {/* <div className="flex-1 max-w-xl">
//               <label className={`${labelStyle} text-gray-700`}>
//                 <HiOutlineAnnotation size={14} className="text-indigo-600" />
//                 Remarks <span className="text-red-500 ml-0.5">*</span>
//               </label>
//               <textarea
//                 name="remarks"
//                 value={formData.remarks}
//                 onChange={handleInputChange}
//                 rows={2}
//                 placeholder="Enter remarks before submitting... (required)"
//                 className={`w-full border rounded-lg py-1.5 px-3 text-xs text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white transition-all shadow-sm placeholder-gray-400 resize-none ${
//                   submitAttempted && !formData.remarks.trim()
//                     ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
//                     : 'border-gray-200'
//                 }`}
//               />
//               {submitAttempted && !formData.remarks.trim() && (
//                 <p className="text-[10px] text-red-500 mt-0.5 font-semibold">⚠ Remarks are required before submitting.</p>
//               )}
//             </div> */}

//             {/* Submit Button — right side */}
//             <div className="shrink-0">
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-14 py-2.5 rounded-xl font-extrabold text-xs tracking-widest uppercase shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-400/50 hover:scale-105 active:scale-100 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//               >
//                 <span className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/15 to-transparent" />
//                 {isSubmitting ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <HiOutlineSave size={15} />
//                     Submit
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>{/* ── End Outer Container ── */}
//     </div>
//   );
// };

// export default AssetCreationForm;



import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config';
import {
  HiArrowLeft, HiOutlineCube, HiOutlineSave,
  HiOutlineOfficeBuilding, HiOutlineMap, HiOutlineTag,
  HiOutlineUser, HiOutlineMail, HiOutlineBriefcase, HiOutlineCalendar,
  HiOutlineLibrary, HiOutlineLocationMarker, HiOutlineCollection,
  HiOutlineHashtag, HiOutlineClipboardList, HiOutlineScale,
  HiOutlineBeaker, HiOutlineTruck, HiOutlineStatusOnline,
  HiOutlineGlobe, HiOutlineHome, HiOutlineViewGrid,
  HiOutlineDocumentText, HiOutlineShoppingCart, HiOutlineCurrencyRupee,
  HiOutlineAnnotation
} from 'react-icons/hi';
import Swal from 'sweetalert2';

const AssetCreationForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [plants, setPlants] = useState([]);
  const [assetClasses, setAssetClasses] = useState([]);
  const [wbsCostCenters, setWbsCostCenters] = useState([]);
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});

  const currentUser = {
    name: userToken.employee || "N/A",
    username: userToken.username || "N/A", // Added username here
    email: userToken.Email || "N/A",
    designation: userToken.Designation || "N/A",
    department: userToken.Department || "N/A",
    currentDate: new Date().toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  };

  const [formData, setFormData] = useState({
    company_code: "", plant_code: "", asset_class: "", similar_assets_count: "1",
    wbs_cost_center: "", wbs_description: "", quantity: "", uom: "",
    vendor_custom: "", capitalized_date: "", status: "", zone: "",
    mandal_village: "", asset_purchase_type: "", asset_name: "", location: "",
    sno: "", inventory_number: "", asset_val: ""
  });

  useEffect(() => {
    if (!userToken.token) return;
    const fetchData = async () => {
      try {
        const headers = { "Content-Type": "application/json", Authorization: `Bearer ${userToken.token}` };
        const [compRes, assetRes] = await Promise.all([
          fetch(`${API_BASE_URL}companies`, { headers }),
          fetch(`${API_BASE_URL}asset-classes`, { headers })
        ]);
        const compData = await compRes.json();
        const assetData = await assetRes.json();
        if (compData.success) setCompanies(compData.data);
        if (assetData.success) setAssetClasses(assetData.data);
      } catch (error) { console.error("Error:", error); }
    };
    fetchData();
  }, [userToken.token]);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE_MB = 1;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    const oversizedFiles = files.filter(file => file.size > MAX_SIZE_BYTES);

    if (oversizedFiles.length > 0) {
      Swal.fire({
        title: 'File Too Large',
        text: `One or more files exceed the ${MAX_SIZE_MB}MB limit. Please compress them and try again.`,
        icon: 'error',
        confirmButtonColor: '#4f46e5',
      });
      e.target.value = ""; 
      setSelectedFiles([]);
      return;
    }
    setSelectedFiles(files);
  };

  const handleCompanyChange = (e) => {
    const selectedCode = e.target.value;
    const compcodeOnly = selectedCode.split(" - ")[0];
    setFormData({ ...formData, company_code: selectedCode, plant_code: "", wbs_cost_center: "", wbs_description: "" });
    setPlants([]);
    setWbsCostCenters([]);
    if (selectedCode) {
      fetch(`${API_BASE_URL}plants/${compcodeOnly}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken.token}` }
      }).then(res => res.json()).then(result => { if (result.success) setPlants(result.data); });
    }
  };

  const handlePlantChange = (e) => {
    const selectedPlant = e.target.value;
    const codeOnly = selectedPlant.split(" - ")[0];
    setFormData({ ...formData, plant_code: selectedPlant, wbs_cost_center: "", wbs_description: "" });
    setWbsCostCenters([]);
    if (selectedPlant) {
      fetch(`${API_BASE_URL}wbs-cost-centers/${codeOnly}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken.token}` }
      }).then(res => res.json()).then(result => { if (result.success) setWbsCostCenters(result.data); });
    }
  };

  const handleWbsChange = (e) => {
    const selectedValue = e.target.value;
    const selectedObj = wbsCostCenters.find(item => item.wbs_cost_center === selectedValue);
    setFormData({ ...formData, wbs_cost_center: selectedValue, wbs_description: selectedObj ? selectedObj.wbs_description : "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const confirm = await Swal.fire({
      title: 'Register New Asset?',
      text: "Please confirm all details are correct.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      confirmButtonText: 'Yes, Create'
    });

    if (confirm.isConfirmed) {
      setIsSubmitting(true);
      
      // CREATE FORMDATA OBJECT
      const data = new FormData();
      
      // 1. Append Form Fields
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // 2. Append User/Meta Data
      data.append('created_by_name', currentUser.name);
      data.append('created_by_username', currentUser.username);
      data.append('created_by_email', currentUser.email);
      data.append('created_by_designation', currentUser.designation);
      data.append('created_by_department', currentUser.department);
      data.append('registration_date', currentUser.currentDate);

      // 3. Append Files
      selectedFiles.forEach((file) => {
        data.append('attachments[]', file); // 'attachments[]' is the key the backend will look for
      });

      try {
        const response = await fetch(`${API_BASE_URL}create-asset`, {
          method: 'POST',
          headers: { 
            "Authorization": `Bearer ${userToken.token}` 
            // Note: Do NOT set Content-Type header when sending FormData
          },
          body: data
        });
        
        const result = await response.json();
        if (response.ok && result.success) {
          Swal.fire({ title: 'Success!', text: result.message || 'Asset registered successfully', icon: 'success', showConfirmButton: false, timer: 2000 });
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          throw new Error(result.message || "Failed to register asset");
        }
      } catch (error) {
        Swal.fire({ title: 'Error', text: error.message || 'Connection to server failed', icon: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const labelStyle = "flex items-center gap-1.5 text-[10px] font-bold text-gray-700 mb-1 tracking-wide uppercase";
  const inputStyle = "w-full border border-gray-200 rounded-lg py-1.5 px-3 text-xs text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white transition-all disabled:bg-gray-100 disabled:text-gray-400 shadow-sm placeholder-gray-400";
  const selectStyle = "w-full border border-gray-200 rounded-lg py-1.5 px-3 text-xs text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white transition-all disabled:bg-gray-100 disabled:text-gray-400 shadow-sm cursor-pointer";

  return (
    <div className="mx-auto max-w-7xl">
      <div className="p-3 border border-blue-200 shadow-xl bg-gradient-to-br from-slate-100 to-blue-100 rounded-2xl">
        
        {/* Header Section */}
        <div className="mb-2 overflow-hidden border shadow-xl rounded-2xl border-white/60">
          <div className="relative px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 to-transparent" />
            <div className="flex items-center justify-center gap-2.5 relative">
              <div className="p-1.5 bg-white/20 rounded-lg ring-1 ring-white/30">
                <HiOutlineCube className="text-white" size={15} />
              </div>
              <h1 className="text-sm font-extrabold text-white tracking-[0.15em] uppercase drop-shadow">
                Asset Creation Form
              </h1>
            </div>
            <button onClick={() => navigate(-1)} className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 ring-1 ring-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95">
              <HiArrowLeft size={12} /> Back
            </button>
          </div>

          <div className="px-5 py-3 border-t border-indigo-100 bg-gradient-to-r from-white via-slate-50 to-white">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {[
                { icon: HiOutlineCalendar, bg: "bg-blue-100", ring: "ring-blue-200", iconCls: "text-blue-600", label: "Date", value: currentUser.currentDate },
                { icon: HiOutlineUser, bg: "bg-violet-100", ring: "ring-violet-200", iconCls: "text-violet-600", label: "Employee", value: currentUser.name },
                { icon: HiOutlineMail, bg: "bg-pink-100", ring: "ring-pink-200", iconCls: "text-pink-600", label: "Email", value: currentUser.email, extra: "col-span-2 md:col-span-1" },
                { icon: HiOutlineBriefcase, bg: "bg-indigo-100", ring: "ring-indigo-200", iconCls: "text-indigo-600", label: "Designation", value: currentUser.designation },
                { icon: HiOutlineOfficeBuilding, bg: "bg-emerald-100", ring: "ring-emerald-200", iconCls: "text-emerald-600", label: "Department", value: currentUser.department },
              ].map(({ icon: Icon, bg, ring, iconCls, label, value, extra }) => (
                <div key={label} className={`flex items-center gap-2.5 min-w-0 ${extra || ""}`}>
                  <div className={`p-1.5 ${bg} ring-1 ${ring} rounded-lg shrink-0`}>
                    <Icon className={iconCls} size={13} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                    <p className="text-xs font-bold text-gray-800 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-2 mb-2 lg:grid-cols-2 xl:grid-cols-4">

            {/* 1. Organizational Data */}
            <div className="bg-gradient-to-br from-blue-200 to-indigo-200 rounded-2xl shadow-md border-2 border-blue-500 border-t-[3px] border-t-blue-500 p-4 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-blue-300/70">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-sm shadow-blue-200">
                  <HiOutlineOfficeBuilding size={14} className="text-white" />
                </div>
                <h2 className="text-[11px] font-extrabold text-blue-900 tracking-wider uppercase">Organizational Data</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={labelStyle}><HiOutlineLibrary size={14} className="text-blue-700" />Company Code *</label>
                  <select name="company_code" required value={formData.company_code} onChange={handleCompanyChange} className={selectStyle}>
                    <option value="">Select Company</option>
                    {companies.map(comp => (
                      <option key={comp.company_code} value={`${comp.company_code} - ${comp.company_name}`}>{comp.company_code} - {comp.company_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}><HiOutlineOfficeBuilding size={14} className="text-blue-700" />Plant Code *</label>
                  <select name="plant_code" required disabled={!formData.company_code} value={formData.plant_code} onChange={handlePlantChange} className={selectStyle}>
                    <option value="">Select Plant</option>
                    {plants.map(plt => (
                      <option key={plt.plant_code} value={`${plt.plant_code} - ${plt.plant_name}`}>{plt.plant_code} - {plt.plant_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}><HiOutlineCollection size={14} className="text-blue-700" />WBS / Cost Center *</label>
                  <select name="wbs_cost_center" required disabled={!formData.plant_code} value={formData.wbs_cost_center} onChange={handleWbsChange} className={selectStyle}>
                    <option value="">Select WBS/CC</option>
                    {wbsCostCenters.map((item, idx) => (
                      <option key={idx} value={item.wbs_cost_center}>{item.wbs_cost_center}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}><HiOutlineDocumentText size={14} className="text-blue-700" />WBS/CC Description</label>
                  <input type="text" value={formData.wbs_description} readOnly className="w-full border border-blue-300 rounded-lg py-1.5 px-3 text-xs bg-blue-100 text-blue-800 font-semibold outline-none" />
                </div>
              </div>
            </div>

            {/* 2. Asset Specification */}
            <div className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl shadow-md border-2 border-purple-500 border-t-[3px] border-t-purple-500 p-4 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-purple-300/70">
                <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-sm shadow-purple-200">
                  <HiOutlineCube size={14} className="text-white" />
                </div>
                <h2 className="text-[11px] font-extrabold text-purple-900 tracking-wider uppercase">Asset Specification</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={labelStyle}><HiOutlineCube size={14} className="text-purple-700" />Asset Name *</label>
                  <input type="text" name="asset_name" required value={formData.asset_name} onChange={handleInputChange} className={inputStyle} placeholder="Enter asset name" />
                </div>
                <div>
                  <label className={labelStyle}><HiOutlineViewGrid size={14} className="text-purple-700" />Asset Class *</label>
                  <select name="asset_class" required value={formData.asset_class} onChange={handleInputChange} className={selectStyle}>
                    <option value="">Select Class</option>
                    {assetClasses.map((item, idx) => (
                      <option key={idx} value={item.ASSET_CLASS}>{item.ASSET_CLASS}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelStyle}><HiOutlineScale size={14} className="text-emerald-700" />Total Units</label>
                    <input type="number" name="similar_assets_count" value={formData.similar_assets_count} onChange={handleInputChange} className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}><HiOutlineBeaker size={14} className="text-emerald-700" />Asset Value</label>
                    <input type="text" name="asset_val" value={formData.asset_val} onChange={handleInputChange} className={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}><HiOutlineShoppingCart size={14} className="text-purple-700" />Purchase Type</label>
                  <select name="asset_purchase_type" value={formData.asset_purchase_type} onChange={handleInputChange} className={selectStyle}>
                    <option value="">Select Type</option>
                    <option value="New">New</option>
                    <option value="Old">Old</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Inventory & Capitalization */}
            <div className="bg-gradient-to-br from-emerald-200 to-teal-200 rounded-2xl shadow-md border-2 border-emerald-500 border-t-[3px] border-t-emerald-500 p-4 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-emerald-300/70">
                <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-sm shadow-emerald-200">
                  <HiOutlineTag size={14} className="text-white" />
                </div>
                <h2 className="text-[11px] font-extrabold text-emerald-900 tracking-wider uppercase">Inventory & Capitalization</h2>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelStyle}><HiOutlineHashtag size={14} className="text-emerald-700" />S.No</label>
                    <input type="text" name="sno" value={formData.sno} onChange={handleInputChange} className={inputStyle} placeholder="Enter S.No" />
                  </div>
                  <div>
                    <label className={labelStyle}><HiOutlineClipboardList size={14} className="text-emerald-700" />Inventory NO</label>
                    <input type="text" name="inventory_number" value={formData.inventory_number} onChange={handleInputChange} className={inputStyle} placeholder="Enter inventory number" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelStyle}><HiOutlineScale size={14} className="text-emerald-700" />Quantity</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className={inputStyle} placeholder="0.00" />
                  </div>
                  <div>
                    <label className={labelStyle}><HiOutlineBeaker size={14} className="text-emerald-700" />UOM</label>
                    <input type="text" name="uom" value={formData.uom} onChange={handleInputChange} className={inputStyle} placeholder="e.g., NOS, KG" />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}><HiOutlineTruck size={14} className="text-emerald-700" />Vendor</label>
                  <input type="text" name="vendor_custom" value={formData.vendor_custom} onChange={handleInputChange} className={inputStyle} placeholder="Vendor name" />
                </div>
                <div>
                  <label className={labelStyle}><HiOutlineCalendar size={14} className="text-emerald-700" />Capitalization Date</label>
                  <input type="date" name="capitalized_date" value={formData.capitalized_date} onChange={handleInputChange} className={inputStyle} />
                </div>
              </div>
            </div>

            {/* 4. Location & Status */}
            <div className="bg-gradient-to-br from-orange-200 to-amber-200 rounded-2xl shadow-md border-2 border-orange-500 border-t-[3px] border-t-orange-500 p-4 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-orange-300/70">
                <div className="p-1.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-sm shadow-orange-200">
                  <HiOutlineMap size={14} className="text-white" />
                </div>
                <h2 className="text-[11px] font-extrabold text-orange-900 tracking-wider uppercase">Location & Status</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={labelStyle}><HiOutlineStatusOnline size={14} className="text-orange-700" />Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className={selectStyle}>
                    <option value="">Select Status</option>
                    <option value="AGCU">AGCU - Agri. Cultivated</option>
                    <option value="AGNC">AGNC - Agri. Non-Cultivated</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}><HiOutlineGlobe size={14} className="text-orange-700" />Zone</label>
                  <select name="zone" value={formData.zone} onChange={handleInputChange} className={selectStyle}>
                    <option value="">Select Zone</option>
                    <option value="111G">111G - Govt Order</option>
                    <option value="HMDA">HMDA</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}><HiOutlineHome size={14} className="text-orange-700" />Village</label>
                  <select name="mandal_village" value={formData.mandal_village} onChange={handleInputChange} className={selectStyle}>
                    <option value="">Select Village</option>
                    <option value="V1">Village A</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}><HiOutlineLocationMarker size={14} className="text-orange-700" />Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} className={inputStyle} placeholder="Enter specific location" />
                </div>
              </div>
            </div>

            {/* 5. Attachments Section */}
            <div className="lg:col-span-2 xl:col-span-4 bg-gradient-to-r from-slate-100 to-indigo-50 rounded-xl shadow-sm border border-indigo-300 p-2 px-4 transition-all duration-300">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2 shrink-0 border-r border-indigo-200 pr-4">
                  <div className="p-1 bg-indigo-500 rounded-md shadow-sm">
                    <HiOutlineDocumentText size={12} className="text-white" />
                  </div>
                  <h2 className="text-[10px] font-extrabold text-indigo-900 tracking-wider uppercase">Documents</h2>
                </div>

                <div className="relative group shrink-0">
                  <input type="file" multiple 
                  // accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-dashed border-indigo-400 rounded-lg group-hover:bg-indigo-50 transition-all">
                    <HiOutlineDocumentText size={14} className="text-indigo-500" />
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">Attach Files</span>
                      <span className="text-[7px] text-gray-400 font-bold tracking-tighter">MAX 1MB</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex gap-2 overflow-x-auto py-1 no-scrollbar">
                  {selectedFiles.length > 0 ? (
                    selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-200 px-2 py-1 rounded-md shrink-0">
                        <HiOutlineTag size={10} className="text-indigo-600" />
                        <span className="text-[9px] text-indigo-800 font-bold max-w-[120px] truncate">{file.name}</span>
                        <span className="text-[8px] text-indigo-400 uppercase">{(file.size / 1024).toFixed(0)}KB</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] italic text-gray-400">No attachments added (Optional)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Row */}
          <div className="flex items-end justify-end gap-4 pb-2">
            <div className="shrink-0">
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-14 py-2.5 rounded-xl font-extrabold text-xs tracking-widest uppercase shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-400/50 hover:scale-105 active:scale-100 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/15 to-transparent" />
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <HiOutlineSave size={15} />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetCreationForm;