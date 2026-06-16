// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { HiTrash, HiPlus } from "react-icons/hi";
// import { API_BASE_URL } from "../Config";

// const ServiceItemTable = ({ items, handleItemChange, addItem, removeItem, userToken }) => {
//   const [dropdownData, setDropdownData] = useState({
//     serviceCategories: [],
//     valuationClasses: [],
//     uomOptions: [],
//     materialGroups: [],
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchMetadata = async () => {
//       if (!userToken?.token) return;
//       try {
//         const response = await axios.get(`${API_BASE_URL}service-masterdata`, {
//           headers: { Authorization: `Bearer ${userToken.token}` }
//         });
        
//         const data = response.data;
//         setDropdownData({
//           serviceCategories: data.service_categories || [], // Mapping backend material_types to Service Categories
//           valuationClasses: data.valuation_classes || [],
//           uomOptions: data.uoms || [],
//           materialGroups: data.material_groups || [],
//         });
//       } catch (error) {
//         console.error("Error fetching metadata:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMetadata();
//   }, [userToken?.token]);

//   const tableInputStyle = "w-full border border-blue-400 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/50";
//   const selectStyle = "w-full border border-blue-400 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/50 cursor-pointer";

//   if (loading) return <div className="p-10 font-bold text-center text-blue-600 animate-pulse">Loading Master Data...</div>;

//   return (
//     <div className="mt-2">
//       <div className="flex items-center justify-between px-4 py-2 mb-2 border border-blue-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-100 to-purple-100">
//         <label className="flex items-center gap-2 text-sm font-bold text-indigo-900">
//           <span className="text-xl">🛠️</span> Service Code Details
//         </label>
//         <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-white bg-gradient-to-r from-[#4183a5] to-[#3a7590] rounded-md shadow-md hover:scale-105">
//           <HiPlus /> Add Item
//         </button>
//       </div>

//       <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-md">
//         <table className="w-full text-left border-collapse">
//           <thead className="sticky top-0 z-10">
//             <tr className="bg-[#4183a5] text-white text-[10px] uppercase">
//               <th className="w-8 p-2 text-center border-r border-white/20">SNO</th>
//               <th className="p-2 border-r border-white/20 min-w-[160px]">Service Category *</th>
//               <th className="p-2 border-r border-white/20 min-w-[180px]">Service Group *</th>
//               <th className="p-2 border-r border-white/20 min-w-[200px]">Service Code Description *</th>
//               <th className="p-2 border-r border-white/20 min-w-[130px]">UOM *</th>
//               <th className="p-2 border-r border-white/20 min-w-[200px]">Additional Description *</th>
//               <th className="p-2 border-r border-white/20 min-w-[160px]">Valuation Class *</th>
//               <th className="p-2 border-r border-white/20 min-w-[200px]">Work Status *</th>
//               <th className="w-12 p-2 text-center"><HiTrash size={14} /></th>
//             </tr>
//           </thead>
//           <tbody className="bg-white">
//             {items.map((item, index) => (
//               <tr key={index} className="transition-colors border-b border-gray-200 hover:bg-blue-50">
//                 <td className="p-1.5 text-[10px] font-bold text-center text-blue-800 bg-gray-50">{index + 1}</td>
//                 <td className="p-1">
//                   <select required className={selectStyle} value={item.service_category} onChange={(e) => handleItemChange(index, 'service_category', e.target.value)}>
//                     <option value="">-Select Category</option>
//                     {dropdownData.serviceCategories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
//                   </select>
//                 </td>
//                 <td className="p-1">
//                   <select required className={selectStyle} value={item.material_group} onChange={(e) => handleItemChange(index, 'material_group', e.target.value)}>
//                     <option value="">-Select Group</option>
//                     {dropdownData.materialGroups.map((mg, i) => <option key={i} value={mg}>{mg}</option>)}
//                   </select>
//                 </td>
//                 <td className="p-1">
//                   <input type="text" required placeholder="Service Description..." className={tableInputStyle} value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
//                 </td>
//                  <td className="p-1">
//                   <select required className={selectStyle} value={item.uom} onChange={(e) => handleItemChange(index, 'uom', e.target.value)}>
//                     <option value="">-Select UOM</option>
//                     {dropdownData.uomOptions.map((u, i) => <option key={i} value={u}>{u}</option>)}
//                   </select>
//                 </td>
//                 <td className="p-1">
//                   <input type="text" required placeholder="Additional Description..." className={tableInputStyle} value={item.additional_description} onChange={(e) => handleItemChange(index, 'additional_description', e.target.value)} />
//                 </td>
//                 <td className="p-1">
//                   <select required className={selectStyle} value={item.valuation_class} onChange={(e) => handleItemChange(index, 'valuation_class', e.target.value)}>
//                     <option value="">-Select Class</option>
//                     {dropdownData.valuationClasses.map((vc, i) => <option key={i} value={vc}>{vc}</option>)}
//                   </select>
//                 </td>
                
//                 <td className="p-1">
//                   <input type="text" required placeholder="Work Status..." className={tableInputStyle} value={item.wrkstatus} onChange={(e) => handleItemChange(index, 'wrkstatus', e.target.value)} />
//                 </td>
                
                
//                 <td className="p-1.5 text-center">
//                   <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1} className={items.length === 1 ? 'text-gray-300' : 'text-red-500 hover:scale-125'}>
//                     <HiTrash size={16} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ServiceItemTable;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { HiTrash, HiPlus } from "react-icons/hi";
import { API_BASE_URL } from "../Config";

const ServiceItemTable = ({ items, handleItemChange, addItem, removeItem, userToken }) => {
  const [dropdownData, setDropdownData] = useState({
    serviceCategories: [],
    valuationClasses: [],
    uomOptions: [],
    materialGroups: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!userToken?.token) return;
      try {
        const response = await axios.get(`${API_BASE_URL}service-masterdata`, {
          headers: { Authorization: `Bearer ${userToken.token}` }
        });
        
        const data = response.data;
        setDropdownData({
          serviceCategories: data.service_categories || [],
          valuationClasses: data.valuation_classes || [],
          uomOptions: data.uoms || [],
          materialGroups: data.material_groups || [],
        });
      } catch (error) {
        console.error("Error fetching metadata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [userToken?.token]);

  const tableInputStyle = "w-full border border-blue-400 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/50";
  const selectStyle = "w-full border border-blue-400 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/50 cursor-pointer";

  // Added specific style for the draggable textarea
  const textareaStyle = `${tableInputStyle} resize min-h-[32px] leading-tight`;
  
  if (loading) return <div className="p-10 font-bold text-center text-blue-600 animate-pulse">Loading Master Data...</div>;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between px-4 py-2 mb-2 border border-blue-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-100 to-purple-100">
        <label className="flex items-center gap-2 text-sm font-bold text-indigo-900">
          <span className="text-xl">🛠️</span> Service Code Details
        </label>
        <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-white bg-gradient-to-r from-[#4183a5] to-[#3a7590] rounded-md shadow-md hover:scale-105">
          <HiPlus /> Add Item
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-md">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#4183a5] text-white text-[10px] uppercase">
              <th className="w-8 p-2 text-center border-r border-white/20">SNO</th>
              <th className="p-2 border-r border-white/20 min-w-[160px]">Service Category *</th>
              <th className="p-2 border-r border-white/20 min-w-[180px]">Service Group *</th>
              <th className="p-2 border-r border-white/20 min-w-[200px]">Service Code Description *</th>
              <th className="p-2 border-r border-white/20 min-w-[130px]">UOM *</th>
              <th className="p-2 border-r border-white/20 min-w-[200px]">Additional Description *</th>
              <th className="p-2 border-r border-white/20 min-w-[160px]">Valuation Class *</th>
              <th className="p-2 border-r border-white/20 min-w-[150px]">Work Status *</th>
              <th className="p-2 border-r border-white/20 min-w-[200px]">Remarks</th>
              <th className="w-12 p-2 text-center"><HiTrash size={14} /></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.map((item, index) => (
              <tr key={index} className="transition-colors border-b border-gray-200 hover:bg-blue-50">
                <td className="p-1.5 text-[10px] font-bold text-center text-blue-800 bg-gray-50">{index + 1}</td>
                
                <td className="p-1">
                  <select required className={selectStyle} value={item.service_category} onChange={(e) => handleItemChange(index, 'service_category', e.target.value)}>
                    <option value="">-Select Category</option>
                    {dropdownData.serviceCategories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                  </select>
                </td>

                <td className="p-1">
                  <select required className={selectStyle} value={item.material_group} onChange={(e) => handleItemChange(index, 'material_group', e.target.value)}>
                    <option value="">-Select Group</option>
                    {dropdownData.materialGroups.map((mg, i) => <option key={i} value={mg}>{mg}</option>)}
                  </select>
                </td>

                <td className="p-1">
                  <input type="text" required placeholder="Service Description..." className={tableInputStyle} value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
                </td>

                <td className="p-1">
                  <select required className={selectStyle} value={item.uom} onChange={(e) => handleItemChange(index, 'uom', e.target.value)}>
                    <option value="">-Select UOM</option>
                    {dropdownData.uomOptions.map((u, i) => <option key={i} value={u}>{u}</option>)}
                  </select>
                </td>

                {/* <td className="p-1">
                  <input type="text" required placeholder="Additional Description..." className={tableInputStyle} value={item.additional_description} onChange={(e) => handleItemChange(index, 'additional_description', e.target.value)} />
                </td> */}

                <td className="p-1">
                  <textarea 
                    required 
                    rows="1"
                    placeholder="Additional Description..." 
                    className={textareaStyle} 
                    value={item.additional_description || ""} 
                    onChange={(e) => handleItemChange(index, 'additional_description', e.target.value)} 
                  />
                </td>

                <td className="p-1">
                  <select required className={selectStyle} value={item.valuation_class} onChange={(e) => handleItemChange(index, 'valuation_class', e.target.value)}>
                    <option value="">-Select Class</option>
                    {dropdownData.valuationClasses.map((vc, i) => <option key={i} value={vc}>{vc}</option>)}
                  </select>
                </td>

                
                
                <td className="p-1">
                  <input type="text" required placeholder="Work Status..." className={tableInputStyle} value={item.wrkstatus} onChange={(e) => handleItemChange(index, 'wrkstatus', e.target.value)} />
                </td>

                {/* NEW REMARKS COLUMN */}
                <td className="p-1">
                  <input 
                    type="text" 
                    placeholder="Remarks (optional)..." 
                    className={tableInputStyle} 
                    value={item.remarks || ""} 
                    onChange={(e) => handleItemChange(index, 'remarks', e.target.value)} 
                  />
                </td>
                
                <td className="p-1.5 text-center">
                  <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1} className={items.length === 1 ? 'text-gray-300' : 'text-red-500 hover:scale-125'}>
                    <HiTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceItemTable;