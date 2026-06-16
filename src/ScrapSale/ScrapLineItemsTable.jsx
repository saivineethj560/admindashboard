// import React, { useState, useRef, useEffect } from "react";
// import ReactDOM from "react-dom"; // Import ReactDOM for Portal
// import { HiTrash, HiPlus } from "react-icons/hi";
// import { API_BASE_URL } from "../Config";

// const ScrapLineItemsTable = ({ items, handleItemChange, addItem, removeItem, userToken }) => {
//   const [suggestions, setSuggestions] = useState([]);
//   const [activeRow, setActiveRow] = useState(null);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [searching, setSearching] = useState(false);

//   // Track the position of the active input to position the dropdown
//   const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
//   const inputRefs = useRef([]);

//   const fetchMaterials = async (query, index) => {
//     if (!query.trim()) {
//       setSuggestions([]);
//       setShowSuggestions(false);
//       return;
//     }
//     try {
//       setSearching(true);
//       const response = await fetch(`${API_BASE_URL}search-materials?query=${query}`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${userToken.token}`
//         }
//       });
//       const result = await response.json();
//       if (result.success) {
//         setSuggestions(result.data);
//         setActiveRow(index);
//         setShowSuggestions(true);

//         // Calculate position of the current input
//         if (inputRefs.current[index]) {
//           const rect = inputRefs.current[index].getBoundingClientRect();
//           setDropdownPos({
//             top: rect.bottom + window.scrollY,
//             left: rect.left + window.scrollX,
//             width: rect.width
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Search error:", error);
//     } finally {
//       setSearching(false);
//     }
//   };

//   const onSelectMaterial = (index, material) => {
//     handleItemChange(index, 'description', material.material_desc);
//     handleItemChange(index, 'material_code', material.material_code);
//     handleItemChange(index, 'unit', material.base_unit || "");
//     setShowSuggestions(false);
//     setSuggestions([]);
//   };

//   const tableInputStyle = "w-full border-2 border-blue-500 rounded-lg p-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50";
//   const readonlyStyle = "w-full border-2 border-gray-300 rounded-lg p-1 text-xs bg-gray-100 cursor-not-allowed text-gray-600 font-medium text-center";

//   return (
//     <div className="mt-8">
//       <div className="flex items-center justify-between px-2 mb-3">
//         <label className="flex items-center text-lg font-bold text-indigo-900">
//           Scrap Item Details
//         </label>
//         <button type="button" onClick={addItem} className="flex items-center gap-1 px-3 py-1 text-sm font-bold text-white transition-all bg-green-600 rounded-lg shadow-md hover:bg-green-700">
//           <HiPlus /> Add Item
//         </button>
//       </div>

//       <div className="overflow-x-auto border border-gray-200 shadow-sm rounded-xl">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-indigo-900 text-white text-[11px] uppercase tracking-wider">
//               <th className="w-10 p-3 text-center border-r border-indigo-800">SNO</th>
//               <th className="p-3 border-r border-indigo-800 min-w-[200px]">Material Description</th>
//               <th className="p-3 text-center border-r border-indigo-800 w-28">Mat. Code</th>
//               <th className="w-20 p-3 text-center border-r border-indigo-800">Unit</th>
//               <th className="w-24 p-3 border-r border-indigo-800">Prev CUMUL Qty</th>
//               <th className="w-24 p-3 border-r border-indigo-800">Prev Rate</th>
//               <th className="w-24 p-3 border-r border-indigo-800">Sale Qty</th>
//               <th className="w-24 p-3 border-r border-indigo-800">Cumul Qty</th>
//               <th className="p-3 border-r border-indigo-800 min-w-[150px]">Remarks</th>
//               <th className="w-12 p-3 text-center">Action</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white">
//             {items.map((item, index) => (
//               <tr key={index} className="relative transition-colors border-b border-gray-100 hover:bg-blue-50/50">
//                 <td className="p-3 text-xs font-bold text-center text-blue-700 bg-gray-50">{index + 1}</td>

//                 <td className="p-2">
//                   <input
//                     ref={el => inputRefs.current[index] = el} // Store ref to calculate position
//                     type="text"
//                     required
//                     placeholder={searching && activeRow === index ? "Searching..." : "Search..."}
//                     className={tableInputStyle}
//                     value={item.description}
//                     onChange={(e) => {
//                       handleItemChange(index, 'description', e.target.value);
//                       fetchMaterials(e.target.value, index);
//                     }}
//                     onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
//                   />
//                 </td>

//                 <td className="p-2">
//                   <input type="text" readOnly placeholder="Code" className={readonlyStyle} value={item.material_code} />
//                 </td>
//                 <td className="p-2">
//                   <input type="text" readOnly placeholder="Unit" className={readonlyStyle} value={item.unit} />
//                 </td>
//                 <td className="p-2">
//                   <input type="number" className={tableInputStyle} value={item.prev_qty === 0 ? "" : item.prev_qty}
//                     onChange={(e) => {
//                       const prev = Number(e.target.value || 0);
//                       const sale = Number(item.sale_request_qty || 0);

//                       handleItemChange(index, "prev_qty", prev);
//                       handleItemChange(index, "cumulative_qty", prev + sale);
//                     }}
//                   />
//                 </td>
//                 <td className="p-2">
//                   <input type="number" className={tableInputStyle} value={item.prev_rate} onChange={(e) => handleItemChange(index, 'prev_rate', e.target.value)} />
//                 </td>
//                 <td className="p-2">
//                   <input type="number" required className={tableInputStyle} value={item.sale_request_qty === 0 ? "" : item.sale_request_qty}
//                     onChange={(e) => {
//                       const sale = Number(e.target.value || 0);
//                       const prev = Number(item.prev_qty || 0);

//                       handleItemChange(index, "sale_request_qty", sale);
//                       handleItemChange(index, "cumulative_qty", prev + sale);
//                     }}
//                   />
//                 </td>
//                 <td className="p-2">
//                   <input type="number"
//                     readOnly
//                     className={readonlyStyle}
//                     value={item.cumulative_qty || ""}
//                   />
//                 </td>
//                 <td className="p-2">
//                   <input type="text" className={tableInputStyle} value={item.remarks} onChange={(e) => handleItemChange(index, 'remarks', e.target.value)} />
//                 </td>
//                 <td className="p-2 text-center">
//                   <button
//                     type="button"
//                     onClick={() => removeItem(index)}
//                     disabled={items.length === 1}
//                     className={`${items.length === 1 ? 'text-gray-300' : 'text-red-500 hover:scale-110'}`}
//                   >
//                     <HiTrash size={18} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* RENDER SUGGESTIONS IN A PORTAL */}
//       {showSuggestions && suggestions.length > 0 && ReactDOM.createPortal(
//         <div
//           style={{
//             position: 'absolute',
//             top: dropdownPos.top,
//             left: dropdownPos.left,
//             width: dropdownPos.width,
//             zIndex: 9999
//           }}
//           className="overflow-y-auto bg-white border-2 border-blue-400 rounded-lg shadow-2xl max-h-48"
//         >
//           {suggestions.map((m, i) => (
//             <div
//               key={i}
//               className="flex flex-col p-2 text-xs border-b cursor-pointer hover:bg-blue-100 last:border-0"
//               onMouseDown={() => onSelectMaterial(activeRow, m)} // Use onMouseDown to trigger before input onBlur
//             >
//               <span className="font-bold text-blue-800">{m.material_code}</span>
//               <span className="text-gray-600 truncate">{m.material_desc}</span>
//             </div>
//           ))}
//         </div>,
//         document.body
//       )}
//     </div>
//   );
// };

// export default ScrapLineItemsTable;


import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { HiTrash, HiPlus } from "react-icons/hi";
import { API_BASE_URL } from "../Config";

const ScrapLineItemsTable = ({ 
  items, 
  handleItemChange, 
  addItem, 
  removeItem, 
  userToken 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [activeRow, setActiveRow] = useState(null); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRefs = useRef([]);

  const fetchMaterials = async (query, index) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      setSearching(true);
      const response = await fetch(`${API_BASE_URL}search-materials?query=${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken.token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setSuggestions(result.data); 
        setActiveRow(index);
        setShowSuggestions(true);
        
        if (inputRefs.current[index]) {
          const rect = inputRefs.current[index].getBoundingClientRect();
          setDropdownPos({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
          });
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const onSelectMaterial = (index, material) => {
    handleItemChange(index, 'description', material.material_desc);
    handleItemChange(index, 'material_code', material.material_code);
    handleItemChange(index, 'unit', material.base_unit || "");
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const tableInputStyle = "w-full border border-blue-400 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/50 transition-all duration-200 hover:bg-blue-100/50 hover:border-blue-500";
  const readonlyStyle = "w-full border border-gray-300 rounded px-1.5 py-1 text-[11px] bg-gradient-to-r from-gray-100 to-gray-200 cursor-not-allowed text-gray-700 font-semibold text-center";

  return (
    <div className="mt-2">
      {/* Header with Blue Pastel Background */}
      <div className="flex items-center justify-between px-4 py-2 mb-2 border border-blue-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100">
        <label className="flex items-center gap-2 text-sm font-bold text-indigo-900">
          <span className="text-xl">♻️</span>
          Scrap Item Details
        </label>
        <button 
          type="button" 
          onClick={addItem} 
          className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-white transition-all duration-300 
          bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] rounded-md shadow-sm hover:from-[#4183a5] hover:to-[#3a7590] hover:shadow-md transform hover:scale-105 active:scale-95"
        >
          <HiPlus className="text-sm" /> Add Item
        </button>
      </div>

      {/* Compact Table */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] text-white text-[10px] uppercase tracking-wide">
              <th className="w-8 p-2 text-center border-r border-white/20">SNO</th>
              <th className="p-2 border-r border-white/20 min-w-[200px]">Material Description</th>
              <th className="w-24 p-2 text-center border-r border-white/20">Code</th>
              <th className="w-16 p-2 text-center border-r border-white/20">Unit</th>
              <th className="w-20 p-2 text-center border-r border-white/20">Prev Cumul</th>
              <th className="w-20 p-2 text-center border-r border-white/20">Prev Rate</th>
              <th className="w-20 p-2 text-center border-r border-white/20">Sale Qty<span className="text-yellow-300"> *</span></th>
              <th className="w-20 p-2 text-center border-r border-white/20">Cumul</th>
              <th className="p-2 border-r border-white/20 min-w-[150px]">Remarks</th>
              <th className="w-12 p-2 text-center">
                <HiTrash size={14} />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.map((item, index) => (
              <tr 
                key={index} 
                className="transition-all duration-200 border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group"
              >
                <td className="p-1.5 text-[10px] font-bold text-center text-blue-800 bg-gray-50 group-hover:bg-blue-100 transition-colors">
                  {index + 1}
                </td>
                
                <td className="p-1">
                  <input 
                    ref={el => inputRefs.current[index] = el}
                    type="text" 
                    required
                    placeholder={searching && activeRow === index ? "Searching..." : "Search..."} 
                    className={tableInputStyle} 
                    value={item.description} 
                    onChange={(e) => {
                      handleItemChange(index, 'description', e.target.value);
                      fetchMaterials(e.target.value, index);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                </td>

                <td className="p-1">
                  <input type="text" readOnly placeholder="Auto" className={readonlyStyle} value={item.material_code} />
                </td>

                <td className="p-1">
                  <input type="text" readOnly placeholder="Auto" className={readonlyStyle} value={item.unit} />
                </td>

                <td className="p-1">
                  <input 
                    type="number" 
                    className={tableInputStyle} 
                    value={item.prev_qty === 0 ? "" : item.prev_qty}
                    onChange={(e) => {
                      const prev = Number(e.target.value || 0);
                      const sale = Number(item.sale_request_qty || 0);
                      handleItemChange(index, "prev_qty", prev);
                      handleItemChange(index, "cumulative_qty", prev + sale);
                    }}
                    placeholder="0"
                  />
                </td>

                <td className="p-1">
                  <input 
                    type="number" 
                    className={tableInputStyle} 
                    value={item.prev_rate} 
                    onChange={(e) => handleItemChange(index, 'prev_rate', e.target.value)}
                    placeholder="0.00"
                  />
                </td>

                <td className="p-1">
                  <input 
                    type="number" 
                    required
                    className={`${tableInputStyle} border-yellow-400 focus:ring-yellow-500`} 
                    value={item.sale_request_qty === 0 ? "" : item.sale_request_qty}
                    onChange={(e) => {
                      const sale = Number(e.target.value || 0);
                      const prev = Number(item.prev_qty || 0);
                      handleItemChange(index, "sale_request_qty", sale);
                      handleItemChange(index, "cumulative_qty", prev + sale);
                    }}
                    placeholder="0"
                  />
                </td>

                <td className="p-1">
                  <input 
                    type="number" 
                    readOnly 
                    className={`${readonlyStyle} bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 font-bold`} 
                    value={item.cumulative_qty || 0} 
                  />
                </td>

                <td className="p-1">
                  <input 
                    type="text" 
                    className={tableInputStyle} 
                    value={item.remarks} 
                    onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                    placeholder="Remarks..."
                  />
                </td>

                <td className="p-1.5 text-center">
                  <button 
                    type="button" 
                    onClick={() => removeItem(index)} 
                    disabled={items.length === 1} 
                    className={`transition-all duration-200 ${
                      items.length === 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-red-500 hover:text-red-700 hover:scale-125 active:scale-95'
                    }`}
                  >
                    <HiTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdown */}
      {showSuggestions && suggestions.length > 0 && ReactDOM.createPortal(
        <div 
          style={{ 
            position: 'absolute', 
            top: dropdownPos.top, 
            left: dropdownPos.left, 
            width: dropdownPos.width,
            zIndex: 9999 
          }}
          className="overflow-y-auto bg-white border-2 border-blue-500 rounded-lg shadow-2xl max-h-48"
        >
          {suggestions.map((m, i) => (
            <div 
              key={i} 
              className="flex flex-col p-2 text-[11px] border-b border-gray-200 cursor-pointer transition-all duration-150 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 last:border-0" 
              onMouseDown={() => onSelectMaterial(activeRow, m)}
            >
              <span className="font-bold text-blue-800">{m.material_code}</span>
              <span className="text-gray-600 truncate text-[10px]">{m.material_desc}</span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default ScrapLineItemsTable;

