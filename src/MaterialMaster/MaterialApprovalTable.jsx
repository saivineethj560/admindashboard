// import React from "react";

// const MaterialApprovalTable = ({
//   items,
//   selectedRows,
//   onRowSelect,
//   onSelectAll,
//   requestType,
//   onItemChange, // 👈 ADded on 04-03-2026--------------------
// }) => {
//   const thStyle =
//     "px-2 py-2 text-[10px] font-bold text-white uppercase tracking-wide border-b border-[#312e81] bg-[#312e81] whitespace-nowrap text-center";
//   const tdStyle = "px-2 py-2 border-b border-blue-50 text-[10px]";

//   // Common Input/Select Style
//   const getInputStyle = (isReadonly) =>
//     `w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
//       isReadonly
//         ? "bg-gray-100 border-gray-300 cursor-not-allowed text-gray-600 font-semibold"
//         : "border-blue-300 bg-white"
//     }`;

//   // Render Creation Table
//   if (requestType === "Creation") {
//     return (
//       <div className="pt-3 mt-3 border-t border-gray-200">
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
//             Material Item Details - Creation
//           </span>
//         </div>
//         <div className="overflow-x-auto border border-blue-200 rounded-lg shadow-sm">
//           <table className="min-w-full text-xs">
//             <thead>
//               <tr>
//                 <th className={thStyle}>
//                   <input
//                     type="checkbox"
//                     checked={
//                       selectedRows.length === items.length && items.length > 0
//                     }
//                     onChange={onSelectAll}
//                     className="cursor-pointer"
//                   />
//                 </th>
//                 <th className={thStyle}>SNo</th>
//                 <th className={thStyle}>Material Type</th>
//                 <th className={thStyle}>Material Group</th>
//                 <th className={thStyle}>Material Sub Group</th>
//                 <th className={thStyle}>Storage Location</th>
//                 <th className={thStyle}>Material Description</th>
//                 <th className={thStyle}>UOM</th>
//                 <th className={thStyle}>Valuation Class</th>
//                 <th className={thStyle}>MRP</th>
//                 <th className={thStyle}>Price</th>
//                 {/* <th className={thStyle}>Case ID</th> */}
//                 {/* ------------added on 04-03-2026------------------------------ */}
//                 <th className={thStyle}>Material Status</th>
//                 <th className={thStyle}>Material Code</th>
//                 {/* ---------------------------------------------------------------- */}
//               </tr>
//             </thead>
//             <tbody>
//                             {items.map((item, index) => {
//                                 // Check if this specific row is already completed in SAP
//                                 const isCompleted = item.MAT_CODE_STATUS === "COMPLETED";

//                                 return (
//                                     <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-blue-50/30"}>
//                                         <td className={`${tdStyle} text-center`}>
//                                             <input
//                                                 type="checkbox"
//                                                 checked={selectedRows.includes(index)}
//                                                 onChange={() => onRowSelect(index)}
//                                                 className="cursor-pointer"
//                                             />
//                                         </td>
//                                         <td className={`${tdStyle} text-center text-gray-400 font-bold`}>{index + 1}</td>
//                                         <td className={tdStyle}>{item.MAT_TYPE || '-'}</td>
//                                         <td className={tdStyle}>{item.MAT_GRP || '-'}</td>
//                                         <td className={tdStyle}>{item.MAT_SUB_GRP || '-'}</td>
//                                         <td className={tdStyle}>{item.STORAGE_LOC || '-'}</td>
//                                         <td className={tdStyle}>{item.MAT_DESCP || '-'}</td>
//                                         <td className={tdStyle}>{item.UOM || '-'}</td>
//                                         <td className={tdStyle}>{item.VALUATION_CLASS || '-'}</td>
//                                         <td className={tdStyle}>{item.MRP || '-'}</td>
//                                         <td className={tdStyle}>{item.PRICE || '-'}</td>
//                                         {/* <td className={tdStyle}>{item.MAT_CASE_ID || '-'}</td> */}

//                                         {/* Material Status - Values synced with Backend keys */}
//                                         <td className={tdStyle}>
//                                             <select
//                                                 value={item.MAT_STATUS || ""}
//                                                 disabled={isCompleted}
//                                                 onChange={(e) => onItemChange(index, "MAT_STATUS", e.target.value)}
//                                                 className={getInputStyle(isCompleted)}
//                                             >
//                                                 <option value="">Select</option>
//                                                 <option value="New">New</option>
//                                                 <option value="Exist">Existing</option>
//                                             </select>
//                                         </td>

//                                         {/* Material Code - Values synced with Backend keys */}
//                                         <td className={tdStyle}>
//                                             <input
//                                                 type="text"
//                                                 maxLength={18}
//                                                 value={item.MAT_CODE || ""}
//                                                 disabled={isCompleted}
//                                                 onChange={(e) => onItemChange(index, "MAT_CODE", e.target.value)}
//                                                 placeholder={isCompleted ? "" : "Enter Code"}
//                                                 className={getInputStyle(isCompleted)}
//                                             />
//                                         </td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   }

//   // Render Extension Table
//   if (requestType === "Extension") {
//     return (
//       <div className="pt-3 mt-3 border-t border-gray-200">
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
//             Material Item Details - Extension
//           </span>
//         </div>
//         <div className="overflow-x-auto border border-blue-200 rounded-lg shadow-sm">
//           <table className="min-w-full text-xs">
//             <thead>
//               <tr>
//                 <th className={thStyle}>
//                   <input
//                     type="checkbox"
//                     checked={
//                       selectedRows.length === items.length && items.length > 0
//                     }
//                     onChange={onSelectAll}
//                     className="cursor-pointer"
//                   />
//                 </th>
//                 <th className={thStyle}>SNo</th>
//                 <th className={thStyle}>Material Code</th>
//                 <th className={thStyle}>Description</th>
//                 <th className={thStyle}>Price</th>
//                 <th className={thStyle}>Remarks</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((item, index) => (
//                 <tr
//                   key={index}
//                   className={index % 2 === 0 ? "bg-white" : "bg-blue-50/30"}
//                 >
//                   <td className={`${tdStyle} text-center`}>
//                     <input
//                       type="checkbox"
//                       checked={selectedRows.includes(index)}
//                       onChange={() => onRowSelect(index)}
//                       className="cursor-pointer"
//                     />
//                   </td>
//                   <td
//                     className={`${tdStyle} text-center text-gray-400 font-bold`}
//                   >
//                     {index + 1}
//                   </td>
//                   <td className={tdStyle}>{item.MAT_CODE || "-"}</td>
//                   <td className={tdStyle}>{item.MAT_DESCP || "-"}</td>
//                   <td className={tdStyle}>{item.PRICE || "-"}</td>
//                   <td className={tdStyle}>{item.REMARKS || "-"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   }

//   // Default: show message when no request type is selected
//   return (
//     <div className="pt-3 mt-3 border-t border-gray-200">
//       <div className="flex items-center justify-center p-8 border border-blue-200 rounded-lg bg-blue-50">
//         <p className="text-sm font-medium text-indigo-800">
//           Please select Material Type (Creation or Extension) to display the
//           table
//         </p>
//       </div>
//     </div>
//   );
// };

// export default MaterialApprovalTable;

import React from "react";

const MaterialApprovalTable = ({
  items,
  selectedRows,
  onRowSelect,
  onSelectAll,
  requestType,
  onItemChange, 
}) => {
  const thStyle =
    "px-2 py-2 text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/10 bg-[#312e81] whitespace-nowrap text-center";
  const tdStyle = "px-2 py-2 border-b border-blue-50 text-[10px] border-r border-gray-100";

  const getInputStyle = (isReadonly) =>
    `w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
      isReadonly
        ? "bg-gray-100 border-gray-300 cursor-not-allowed text-gray-500"
        : "border-blue-300 bg-white hover:border-blue-400"
    }`;

  if (requestType === "Creation") {
    return (
      <div className="pt-3 mt-3 border-t border-gray-200">
        <span className="text-[11px] font-bold text-indigo-800 uppercase block mb-2">Material Details - Creation</span>
        <div className="overflow-x-auto border border-blue-200 rounded-lg shadow-sm">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className={thStyle}><input type="checkbox" checked={selectedRows.length === items.length && items.length > 0} onChange={onSelectAll} /></th>
                <th className={thStyle}>SNo</th>
                <th className={thStyle}>Type</th>
                <th className={thStyle}>Group</th>
                <th className={thStyle}>Sub Group</th>
                <th className={thStyle}>Storage</th>
                <th className={thStyle}>Description</th>
                <th className={thStyle}>UOM</th>
                <th className={thStyle}>Val. Class</th>
                <th className={thStyle}>MRP</th>
                <th className={thStyle} style={{backgroundColor: '#1e3a8a'}}>Price *</th>
                 <th className={thStyle}>Material Status</th>
                 <th className={thStyle}>Material Code</th>
                {/* <th className={thStyle} style={{backgroundColor: '#1e3a8a'}}>Status</th>
                <th className={thStyle} style={{backgroundColor: '#1e3a8a'}}>SAP Code</th> */}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const isCompleted = item.MAT_CODE_STATUS === "COMPLETED";
                return (
                  <tr key={index} className={selectedRows.includes(index) ? "bg-blue-50" : "bg-white"}>
                    <td className="p-2 text-center border-b border-gray-100"><input type="checkbox" checked={selectedRows.includes(index)} onChange={() => onRowSelect(index)} /></td>
                    <td className="p-2 font-bold text-center text-gray-400 border-b border-gray-100">{index + 1}</td>
                    <td className={tdStyle}>{item.MAT_TYPE}</td>
                    <td className={tdStyle}>{item.MAT_GRP}</td>
                    <td className={tdStyle}>{item.MAT_SUB_GRP}</td>
                    <td className={tdStyle}>{item.STORAGE_LOC}</td>
                    <td className={tdStyle}>{item.MAT_DESCP}</td>
                    <td className={tdStyle}>{item.UOM}</td>
                    <td className={tdStyle}>{item.VALUATION_CLASS}</td>
                    <td className={tdStyle}>{item.MRP}</td>
                    
                    {/* Editable Price */}
                    <td className={tdStyle}>
                        <input type="number" step="0.01" value={item.PRICE || ""} disabled={isCompleted}
                               onChange={(e) => onItemChange(index, "PRICE", e.target.value)}
                               className={getInputStyle(isCompleted)} />
                    </td>

                    <td className={tdStyle}>
                      <select value={item.MAT_STATUS || ""} disabled={isCompleted}
                              onChange={(e) => onItemChange(index, "MAT_STATUS", e.target.value)}
                              className={getInputStyle(isCompleted)}>
                        <option value="">Select</option>
                        <option value="New">New</option>
                        <option value="Exist">Existing</option>
                      </select>
                    </td>

                    <td className={tdStyle}>
                      <input type="text" maxLength={18} value={item.MAT_CODE || ""} disabled={isCompleted}
                             onChange={(e) => onItemChange(index, "MAT_CODE", e.target.value)}
                             placeholder="Enter Code" className={getInputStyle(isCompleted)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (requestType === "Extension") {
    return (
      <div className="pt-3 mt-3 border-t border-gray-200">
        <span className="text-[11px] font-bold text-indigo-800 uppercase block mb-2">Material Details - Extension</span>
        <div className="overflow-x-auto border border-blue-200 rounded-lg shadow-sm">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className={thStyle}><input type="checkbox" checked={selectedRows.length === items.length && items.length > 0} onChange={onSelectAll} /></th>
                <th className={thStyle}>SNo</th>
                <th className={thStyle}>Material Code</th>
                <th className={thStyle}>Description</th>
                <th className={thStyle} style={{backgroundColor: '#1e3a8a'}}>Price *</th>
                <th className={thStyle}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const isCompleted = item.MAT_CODE_STATUS === "COMPLETED";
                return (
                  <tr key={index} className={selectedRows.includes(index) ? "bg-blue-50" : "bg-white"}>
                    <td className="p-2 text-center border-b border-gray-100"><input type="checkbox" checked={selectedRows.includes(index)} onChange={() => onRowSelect(index)} /></td>
                    <td className="p-2 font-bold text-center text-gray-400 border-b border-gray-100">{index + 1}</td>
                    <td className={tdStyle}>{item.MAT_CODE}</td>
                    <td className={tdStyle}>{item.MAT_DESCP}</td>
                    <td className={tdStyle}>
                        <input type="number" step="0.01" value={item.PRICE || ""} disabled={isCompleted}
                               onChange={(e) => onItemChange(index, "PRICE", e.target.value)}
                               className={getInputStyle(isCompleted)} />
                    </td>
                    <td className={tdStyle}>{item.REMARKS}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};

export default MaterialApprovalTable;