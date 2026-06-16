// import React from "react";

// const StockApprovalTable = ({ items = [], selectedRows = [], setSelectedRows }) => {
//   const headerCell = "p-3 border-r border-indigo-800 text-center text-[10px] uppercase tracking-tighter font-bold";
//   const bodyCell = "p-2 text-xs border-r border-gray-100 text-gray-700";
//   const readonlyInput = "w-full bg-transparent text-xs text-center outline-none cursor-default py-1 font-medium text-gray-800";

//   // --- Selection Logic ---
  
//   // Toggle individual row
//   const toggleRow = (index) => {
//     if (selectedRows.includes(index)) {
//       setSelectedRows(selectedRows.filter((i) => i !== index));
//     } else {
//       setSelectedRows([...selectedRows, index]);
//     }
//   };

//   // Toggle all rows
//   const toggleAll = () => {
//     if (selectedRows.length === items.length) {
//       setSelectedRows([]); // Unselect all
//     } else {
//       setSelectedRows(items.map((_, index) => index)); // Select all indices
//     }
//   };

//   const isAllSelected = items.length > 0 && selectedRows.length === items.length;

//   return (
//     <div className="mt-4">
//       <div className="flex items-center justify-between px-2 mb-4">
//         <label className="text-lg font-extrabold tracking-tight text-indigo-900">
//           Line Item Details
//         </label>
//         <div className="flex items-center gap-3">
//             <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold uppercase">
//               Selected: {selectedRows.length} / {items.length}
//             </span>
//         </div>
//       </div>

//       <div className="overflow-x-auto bg-white border border-gray-200 shadow-sm rounded-xl">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="text-white bg-indigo-900">
//               {/* SELECT ALL CHECKBOX */}
//               <th className="w-10 p-3 text-center border-r border-indigo-800">
//                 <input 
//                   type="checkbox" 
//                   className="w-4 h-4 text-indigo-600 border-gray-300 rounded cursor-pointer focus:ring-indigo-500"
//                   checked={isAllSelected}
//                   onChange={toggleAll}
//                 />
//               </th>
//               <th className={`${headerCell} w-10`}>SNO</th>
//               <th className={`${headerCell} min-w-[200px] !text-left`}>Material Description</th>
//               <th className={`${headerCell} w-28`}>Mat. Code</th>
//               <th className={`${headerCell} w-20`}>Unit</th>
//               <th className={`${headerCell} w-24`}>Prev Qty</th>
//               <th className={`${headerCell} w-24`}>Prev Rate</th>
//               <th className={`${headerCell} w-24`}>Cul Qty</th>
//               {/* <th className={`${headerCell} w-24 bg-indigo-800`}>Cul Qty</th> */}
//               <th className={`${headerCell} min-w-[150px] !text-left border-r-0`}>Remarks</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length > 0 ? (
//               items.map((item, index) => {
//                 const isSelected = selectedRows.includes(index);
//                 return (
//                   <tr 
//                     key={index} 
//                     className={`border-b border-gray-100 transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}
//                   >
//                     {/* ROW CHECKBOX */}
//                     <td className="p-3 text-center border-r border-gray-100">
//                         <input 
//                           type="checkbox" 
//                           className="w-4 h-4 text-indigo-600 border-gray-300 rounded cursor-pointer focus:ring-indigo-500"
//                           checked={isSelected}
//                           onChange={() => toggleRow(index)}
//                         />
//                     </td>

//                     <td className="p-3 text-xs font-bold text-center text-indigo-900 border-r border-gray-100 bg-gray-50/50">
//                       {index + 1}
//                     </td>
                    
//                     <td className={bodyCell}>
//                       <div className="font-semibold text-gray-900 uppercase">{item.description || item.MAT_DESC}</div>
//                     </td>

//                     <td className={bodyCell}>
//                       <div className="font-mono font-bold text-center text-indigo-600">{item.material_code || item.MAT_CODE}</div>
//                     </td>

//                     <td className={bodyCell}>
//                       <div className="font-bold text-center">{item.unit || item.UOM}</div>
//                     </td>

//                     <td className={bodyCell}>
//                       <input type="text" readOnly className={readonlyInput} value={item.prev_qty || 0} />
//                     </td>

//                     <td className={bodyCell}>
//                       <input type="text" readOnly className={readonlyInput} value={item.prev_rate || 0} />
//                     </td>
//                     <td className={bodyCell}>
//                       <input type="text" readOnly className={readonlyInput} value={item.cumulative_qty || 0} />
//                     </td>

//                     {/* <td className={`${bodyCell} bg-blue-50/50`}>
//                       <div className="text-sm font-black text-center text-blue-700">
//                           {item.cumulative_qty || item.cumulative_qty}
//                       </div>
//                     </td> */}

//                     <td className="p-2 text-xs italic text-gray-500">
//                       {item.remarks || "---"}
//                     </td>
//                   </tr>
//                 );
//               })
//             ) : (
//               <tr>
//                 <td colSpan="10" className="p-10 italic text-center text-gray-400">
//                   No line items found for this request.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default StockApprovalTable;


import React from "react";

const StockApprovalTable = ({ items = [], selectedRows = [], setSelectedRows }) => {
  const tableInputStyle = "w-full border border-blue-400 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/50 transition-all duration-200";
  const readonlyStyle = "w-full border border-gray-300 rounded px-1.5 py-1 text-[11px] bg-gradient-to-r from-gray-100 to-gray-200 cursor-not-allowed text-gray-700 font-semibold text-center";

  // Toggle individual row
  const toggleRow = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((i) => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  // Toggle all rows
  const toggleAll = () => {
    if (selectedRows.length === items.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(items.map((_, index) => index));
    }
  };

  const isAllSelected = items.length > 0 && selectedRows.length === items.length;

  return (
    <div className="mt-2">
      {/* Header with Blue Pastel Background */}
      <div className="flex items-center justify-between px-4 py-2 mb-2 border border-blue-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100">
        <label className="flex items-center gap-2 text-sm font-bold text-indigo-900">
          <span className="text-xl">📋</span>
          Line Item Details
        </label>
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] text-white px-3 py-1 rounded-md font-bold uppercase shadow-sm hover:from-[#4183a5] hover:to-[#3a7590] hover:shadow-md">
            Selected : {selectedRows.length} / {items.length}
          </span>
        </div>
      </div>

      {/* Compact Table */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] text-white text-[10px] uppercase tracking-wide">
              {/* SELECT ALL CHECKBOX */}
              <th className="w-10 p-2 text-center border-r border-white/20">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-indigo-600 transition-all duration-200 bg-white border-white rounded cursor-pointer focus:ring-2 focus:ring-white/50 hover:scale-110"
                  checked={isAllSelected}
                  onChange={toggleAll}
                />
              </th>
              <th className="w-8 p-2 text-center border-r border-white/20">SNO</th>
              <th className="p-2 border-r border-white/20 min-w-[200px]">Material Description</th>
              <th className="w-24 p-2 text-center border-r border-white/20">Code</th>
              <th className="w-16 p-2 text-center border-r border-white/20">Unit</th>
              <th className="w-20 p-2 text-center border-r border-white/20">Prev Qty</th>
              <th className="w-20 p-2 text-center border-r border-white/20">Req Qty</th>
              <th className="w-20 p-2 text-center border-r border-white/20">Cumul Qty</th>
              <th className="w-20 p-2 text-center border-r border-white/20">Prev Rate</th>
              <th className="p-2 min-w-[150px]">Remarks</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.length > 0 ? (
              items.map((item, index) => {
                const isSelected = selectedRows.includes(index);
                return (
                  <tr 
                    key={index} 
                    className={`transition-all duration-200 border-b border-gray-200 group ${
                      isSelected 
                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100' 
                        : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                    }`}
                  >
                    {/* ROW CHECKBOX */}
                    <td className="p-2 text-center border-r border-gray-100">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-indigo-600 transition-all duration-200 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-indigo-500 hover:scale-110"
                        checked={isSelected}
                        onChange={() => toggleRow(index)}
                      />
                    </td>

                    {/* SNO */}
                    <td className="p-1.5 text-[10px] font-bold text-center text-blue-800 bg-gray-50 group-hover:bg-blue-100 transition-colors border-r border-gray-100">
                      {index + 1}
                    </td>
                    
                    {/* Material Description */}
                    <td className="p-1 border-r border-gray-100">
                      <input 
                        type="text" 
                        readOnly 
                        className={`${readonlyStyle} !text-left font-bold text-gray-900 uppercase`} 
                        value={item.description || item.MAT_DESC || ""} 
                      />
                    </td>

                    {/* Material Code */}
                    <td className="p-1 border-r border-gray-100">
                      <input 
                        type="text" 
                        readOnly 
                        className={`${readonlyStyle} font-mono font-bold text-indigo-600`} 
                        value={item.material_code || item.MAT_CODE || ""} 
                      />
                    </td>

                    {/* Unit */}
                    <td className="p-1 border-r border-gray-100">
                      <input 
                        type="text" 
                        readOnly 
                        className={`${readonlyStyle} font-bold`} 
                        value={item.unit || item.UOM || ""} 
                      />
                    </td>

                    {/* Previous Quantity */}
                    <td className="p-1 border-r border-gray-100">
                      <input 
                        type="number" 
                        readOnly 
                        className={readonlyStyle} 
                        value={item.prev_qty || 0} 
                      />
                    </td>

                    {/* Required Quantity */}
                    <td className="p-1 border-r border-gray-100">
                      <input 
                        type="number" 
                        readOnly 
                        className={`${readonlyStyle} bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300 font-bold`} 
                        value={item.required_qty || item.req_qty || 0} 
                      />
                    </td>

                    {/* Cumulative Quantity */}
                    <td className="p-1 border-r border-gray-100">
                      <input 
                        type="number" 
                        readOnly 
                        className={`${readonlyStyle} bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 font-bold`} 
                        value={item.cumulative_qty || 0} 
                      />
                    </td>

                    {/* Previous Rate */}
                    <td className="p-1 border-r border-gray-100">
                      <input 
                        type="number" 
                        readOnly 
                        className={readonlyStyle} 
                        value={item.prev_rate || 0} 
                      />
                    </td>

                    {/* Remarks */}
                    <td className="p-1">
                      <input 
                        type="text" 
                        readOnly 
                        className={`${readonlyStyle} !text-left italic ${item.remarks ? 'text-gray-600' : 'text-gray-400'}`} 
                        value={item.remarks || "---"} 
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="p-10 italic text-center text-gray-400 bg-gray-50/30">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl opacity-50">📭</span>
                    <span>No line items found for this request.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockApprovalTable;
