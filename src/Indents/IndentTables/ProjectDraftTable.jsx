// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Plus, Trash2 } from "lucide-react";
// import { API_BASE_URL_INDENT } from "../../Config";

// const ProjectDraftTable = ({
//   items,
//   setItems,
//   plant,
//   projectType,
//   indentType,
//   subTab,
//   isViewMode,
//   primaryColor = "#28556E",
//   lightBorder = "#7ba5b8",
// }) => {
//   // --- Local State for Dropdowns & UI ---
//     const [plantCode, setPlantCode] = useState(""); // New State for just the Code
//   const [wbsList, setWbsList] = useState([]);
//   const [subWbsList, setSubWbsList] = useState({});
//   const [matCodeList, setMatCodeList] = useState({});
//   const [showPopup, setShowPopup] = useState(false);
//   const [popupIndex, setPopupIndex] = useState(null);

//   // --- 1. Extract Plant Code from Plant String ---
//    // --- 1. Extract Plant Code ---
// useEffect(() => {
//   if (plant) {
//     const extractedCode = plant.split("-")[0].trim();
//     setPlantCode(extractedCode);
//   } else {
//     setPlantCode("");
//   }
// }, [plant]);
//     console.log('plamt',plantCode);
//   // --- API 1: Fetch WBS List on Mount/Change ---
//   useEffect(() => {
//     if (!plantCode || !indentType || !projectType) return;

//     axios
//       .get(`${API_BASE_URL_INDENT}/fetch-wbs`, {
//         params: { plant:plantCode, mainType: indentType, projectType },
//       })
//       .then((res) => {
//         setWbsList(res.data);
//       })
//       .catch((err) => console.error("Error fetching WBS list:", err));
//   }, [plantCode, projectType, indentType]);

//   // --- Helper to Update Parent State ---
//   const updateItems = (newItems) => {
//     setItems(newItems);
//   };

//   // --- NEW: Helper to Calculate Dynamic Balance based on PREVIOUS rows ---
//   const getDynamicBalance = (currentItem, currentIndex) => {
//     // 1. Calculate Base Balance for this specific item (Total - Till)
//     const total = Number(currentItem.quantity) || 0;
//     const till = Number(currentItem.till_indent) || 0;
//     const baseBalance = total - till;

//     // 2. Sum 'reqnow' of all PREVIOUS rows (0 to currentIndex - 1) that match WBS+SubWBS+Material
//     const usedPreviously = items.slice(0, currentIndex).reduce((acc, prevItem) => {
//       if (
//         prevItem.wbs === currentItem.wbs &&
//         prevItem.subwbs === currentItem.subwbs &&
//         prevItem.mat_code === currentItem.mat_code
//       ) {
//         return acc + (Number(prevItem.reqnow) || 0);
//       }
//       return acc;
//     }, 0);

//     // 3. Return the remaining balance
//     const dynamicBal = baseBalance - usedPreviously;
//     // Optional: Return with 2 decimals if needed, or just the number
//     return Number.isInteger(dynamicBal) ? dynamicBal : dynamicBal.toFixed(2);
//   };


//   // Helper to calculate Till Indent including previous rows' input
//   const getEffectiveTillIndent = (currentItem, currentIndex) => {
//     // 1. Get the original value from API/DB
//     const baseTillIndent = Number(currentItem.till_indent) || 0;

//     // 2. Sum 'reqnow' of all PREVIOUS rows (0 to currentIndex - 1) that match this material
//     const previousUsage = items.slice(0, currentIndex).reduce((acc, prevItem) => {
//       if (prevItem.wbs === currentItem.wbs && 
//           prevItem.subwbs === currentItem.subwbs && 
//           prevItem.mat_code === currentItem.mat_code) {
//         return acc + (Number(prevItem.reqnow) || 0);
//       }
//       return acc;
//     }, 0);

//     // 3. Return the sum
//     return baseTillIndent + previousUsage;
//   };

//   // --- Handlers with API Logic ---

//   const handleWbsChange = async (index, value) => {
//     const updated = [...items];
//     updated[index].wbs = value;
//     updated[index].subwbs = "";
    
//     // Reset dependent fields
//     updated[index].wdesc = "";
//     updated[index].mat_group = "";
//     updated[index].mat_code = "";
    
//     updateItems(updated);

//     // Clear existing Sub-WBS list for this row
//     setSubWbsList((prev) => {
//         const newMap = { ...prev };
//         delete newMap[index]; 
//         return newMap;
//     });

//     if (!value) return;

//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-subwbs`, {
//         params: { plant:plantCode, mainType: indentType, projectType, wbs: value },
//       });
//       setSubWbsList((prev) => ({ ...prev, [index]: res.data }));
//     } catch (err) {
//       console.error("Error fetching SUB-WBS:", err);
//       setSubWbsList((prev) => ({ ...prev, [index]: [] }));
//     }
//   };

//   const handleSubWbsChange = async (index, value) => {
//     const updated = [...items];
//     updated[index].subwbs = value;
    
//     // Reset dependent fields
//     updated[index].wdesc = "";
//     updated[index].mat_code = "";
//     updated[index].mat_desc = "";
//     updated[index].mat_group = "";
//     updated[index].uom = "";
//     updated[index].quantity = "";
//     updated[index].till_indent = "";
//     updated[index].balqty = ""; // Reset static balqty
//     updated[index].reqnow = "";

//     setMatCodeList((prev) => { const n = { ...prev }; delete n[index]; return n; });

//     updateItems(updated);

//     if (!value) return;

//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-materials`, {
//         params: { plant:plantCode, mainType: indentType, projectType, wbs: updated[index].wbs, subwbs: value },
//       });
      
//       const materialsData = res.data || [];
//       setMatCodeList((prev) => ({ ...prev, [index]: materialsData }));

//       const newItems = [...updated];
//       if (materialsData.length > 0 && materialsData[0].WDESC) {
//           newItems[index].wdesc = materialsData[0].WDESC;
//       }
//       updateItems(newItems);

//     } catch (err) {
//       console.error("Error fetching Materials:", err);
//     }
//   };

//   // const handleMaterialChange = async (index, value) => {
//   //   const updated = [...items];
//   //   updated[index].mat_code = value;

//   //   // 1. Populate basic details
//   //   const specificList = matCodeList[index] || [];
//   //   const selectedData = specificList.find((m) => m.MAT === value);

//   //   if (selectedData) {
//   //       updated[index].mat_desc = selectedData.MDESC || selectedData.MAT_DESC || "";
//   //       updated[index].uom = selectedData.UNIT || selectedData.UOM || "";
        
//   //       const qty = parseFloat(selectedData.QUAN || selectedData.quantity || 0);
//   //       const till = parseFloat(selectedData.TILL_INDENT || selectedData.till_indent || 0);

//   //       updated[index].quantity = qty;
//   //       updated[index].till_indent = till;
        
//   //       // Note: We update static 'balqty' here for initial state, 
//   //       // but the table Render will use getDynamicBalance() for display
//   //       updated[index].balqty = (qty - till).toFixed(2);

//   //       updated[index].mat_group = "Loading..."; 
//   //   } else {
//   //       updated[index].mat_desc = "";
//   //       updated[index].uom = "";
//   //       updated[index].mat_group = "";
//   //       updated[index].quantity = "";
//   //       updated[index].till_indent = "";
//   //       updated[index].balqty = "";
//   //   }

//   //   updateItems(updated);

//   //   if (!value) {
//   //       updated[index].mat_group = "";
//   //       updateItems(updated);
//   //       return;
//   //   }

//   //   try {
//   //     const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mat-group`, {
//   //       params: { plant: plant, mat_code: value,mainType: indentType }
//   //     });
//   //     const newItems = [...updated];
//   //     newItems[index].mat_group = res.data.MAT_GROUP || ""; 
//   //     setItems(newItems);
//   //   } catch (err) {
//   //     console.error("Error fetching material group", err);
//   //     const errItems = [...updated];
//   //     errItems[index].mat_group = "";
//   //     setItems(errItems);
//   //   }
//   // };


//   const handleMaterialChange = async (index, value) => {
//     const updated = [...items];
//     updated[index].mat_code = value;

//     // 1. Check if the typed/selected value exists in the current row's material list
//     const specificList = matCodeList[index] || [];
//     const selectedData = specificList.find((m) => m.MAT === value);

//     if (selectedData) {
//         // If an exact match is found (User selected from suggestions)
//         updated[index].mat_desc = selectedData.MDESC || selectedData.MAT_DESC || "";
//         updated[index].uom = selectedData.UNIT || selectedData.UOM || "";
        
//         const qty = parseFloat(selectedData.QUAN || selectedData.quantity || 0);
//         const till = parseFloat(selectedData.TILL_INDENT || selectedData.till_indent || 0);

//         updated[index].quantity = qty;
//         updated[index].till_indent = till;
//         updated[index].balqty = (qty - till).toFixed(2);
//         updated[index].mat_group = "Loading..."; 

//         updateItems(updated);

//         // Fetch the group via API
//         try {
//           const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mat-group`, {
//             params: { plant: plantCode, mat_code: value, mainType: indentType }
//           });
//           const newItems = [...updated];
//           newItems[index].mat_group = res.data.MAT_GROUP || ""; 
//           setItems(newItems);
//         } catch (err) {
//           const errItems = [...updated];
//           errItems[index].mat_group = "";
//           setItems(errItems);
//         }
//     } else {
//         // If user is still typing and no match is found yet, clear dependent fields
//         updated[index].mat_desc = "";
//         updated[index].uom = "";
//         updated[index].mat_group = "";
//         updated[index].quantity = "";
//         updated[index].till_indent = "";
//         updated[index].balqty = "";
//         updateItems(updated);
//     }
//   };

//   const addRow = () => {
//     setItems([
//       ...items,
//       {
//         wbs: "", subwbs: "", mat_code: "", mat_desc: "", uom: "",
//         quantity: "", till_indent: "", reqnow: "", wdesc: "",
//         mat_group: "", Remarks: "", descoping: ""
//       },
//     ]);
//   };

//   const deleteRow = (index) => {
//     if (items.length > 1) {
//       setItems(items.filter((_, i) => i !== index));
//     }
//   };

//   const handleFieldChange = (index, field, value) => {
//     const updated = [...items];
//     updated[index][field] = value;
//     setItems(updated);
//   };

//   // --- UPDATED REQ NOW HANDLER ---
//   const handleReqNowChange = (index, inputValue) => {
//     let value = inputValue === "" ? "" : Number(inputValue);
//     const item = items[index];
//     const updated = [...items];

//     if (value < 0) {
//         updated[index].reqnow = value;
//         updated[index].descoping = "Yes";
//         setItems(updated);
//     } else {
//         if (subTab !== 'RMC') {
//             // 1. Calculate Base Balance
//             const total = Number(item.quantity) || 0;
//             const till = Number(item.till_indent) || 0;
//             const baseBalance = total - till;

//             // 2. Sum up what is used in ALL OTHER rows for the same item
//             const usedInOtherRows = items.reduce((acc, row, i) => {
//                  if (i !== index && 
//                      row.wbs === item.wbs && 
//                      row.subwbs === item.subwbs && 
//                      row.mat_code === item.mat_code) {
//                      return acc + (Number(row.reqnow) || 0);
//                  }
//                  return acc;
//             }, 0);

//             // 3. Real available limit for this row
//             const availableLimit = baseBalance - usedInOtherRows;

//             if (value > availableLimit) {
//                 setPopupIndex(index);
//                 setShowPopup(true);
//                 return; // Stop update
//             }
//         }
        
//         updated[index].reqnow = value;
//         updated[index].descoping = "";
//         setItems(updated);
//     }
//   };

//   const shouldShowDescoping = () => items.some(item => Number(item.reqnow) < 0);

//   const label = indentType === "Service" ? "Service" : "Material";
//   return (
//     <div className="mt-[-4]">
//       {/* Add Button */}
//       <div className="flex items-center justify-between mb-2">
//         <button
//           type="button"
//           onClick={addRow}
//           className="flex items-center gap-1 px-2 py-1 text-white text-[11px] rounded shadow hover:shadow-lg transition-all transform hover:scale-105 border-2"
//           style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
//         >
//           <Plus className="w-3 h-3" />
//           Add Item
//         </button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto border-2 rounded-lg shadow-sm" style={{ borderColor: lightBorder }}>
//         <table className="w-full border-collapse min-w-max">
//           <thead>
//             <tr className="bg-gray-200">
//                {["Sno", "WBS Element", "Sub WBS", "WBS Desc", `${label} Code`, `${label} Desc`, `${label} Group`, "Total Qty", "UOM", "Till Indent", "Balance Qty", "Req Now"].map(h => (
//                    <th key={h} className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>{h}</th>
//                ))}
//                {shouldShowDescoping() && <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b whitespace-nowrap">Descoping</th>}
//                <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Remarks</th>
//                <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length === 0 ? (
//                <tr><td colSpan="15" className="px-4 py-8 text-sm text-center text-gray-500">No line items found</td></tr>
//             ) : (
//               items.map((item, index) => (
//                 <tr key={index} className="transition-colors hover:bg-gray-50">
//                   <td className="px-1.5 py-0.5 border-b text-center text-[11px]" style={{ borderColor: lightBorder }}>{index + 1}</td>
                  
//                   {/* WBS */}
//                   <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                     <select
//                         value={item.wbs || ""}
//                         onChange={(e) => handleWbsChange(index, e.target.value)}
//                         className="w-32 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100"
//                         style={{ border: `1px solid ${lightBorder}`, height: "26px" }}
//                     >
//                         <option value="">Select WBS</option>
//                         {wbsList.map((w, i) => <option key={i} value={w.WBS}>{w.WBS}</option>)}
//                     </select>
//                   </td>

//                   {/* Sub WBS */}
//                   <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                      <select
//                         value={item.subwbs || ""}
//                         disabled={isViewMode}
//                         onChange={(e) => handleSubWbsChange(index, e.target.value)}
//                         className="w-32 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100"
//                         style={{ border: `1px solid ${lightBorder}`, height: "26px" }}
//                     >
//                         <option value="">Select Sub WBS</option>
//                         {!subWbsList[index] && item.subwbs && <option value={item.subwbs}>{item.subwbs}</option>}
//                         {subWbsList[index] && subWbsList[index].map((s, i) => <option key={i} value={s.SUBWBS}>{s.SUBWBS}</option>)}
//                     </select>
//                   </td>

//                   <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                     <input type="text" value={item.wdesc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} />
//                   </td>

//                   {/* Material Code */}
//                   {/* <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                      <select
//                         value={item.mat_code || ""}
//                         disabled={isViewMode || !item.subwbs}
//                         onChange={(e) => handleMaterialChange(index, e.target.value)}
//                         className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100"
//                         style={{ border: `1px solid ${lightBorder}`, height: "26px" }}
//                     >
//                         <option value="">Select Material</option>
//                         {!matCodeList[index] && item.mat_code && <option value={item.mat_code}>{item.mat_code}</option>}
//                         {matCodeList[index] && matCodeList[index].map((m, i) => <option key={i} value={m.MAT}>{m.MAT}</option>)}
//                     </select>
//                   </td> */}

//                   {/* Material Code Suggestion Input */}
// <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//     <input
//         type="text"
//         list={`mat-list-${index}`} // Unique ID for each row
//         value={item.mat_code || ""}
//         placeholder="Search..."
//         disabled={isViewMode || !item.subwbs}
//         onChange={(e) => handleMaterialChange(index, e.target.value)}
//         className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100"
//         style={{ border: `1px solid ${lightBorder}`, height: "26px" }}
//         onFocus={(e) => (e.target.style.border = `2px solid ${primaryColor}`)}
//         onBlur={(e) => (e.target.style.border = `1px solid ${lightBorder}`)}
//     />
    
//     <datalist id={`mat-list-${index}`}>
//         {matCodeList[index]?.map((m, i) => (
//             <option key={i} value={m.MAT}>
//                 {m.MDESC || m.MAT_DESC || m.DESC}
//             </option>
//         ))}
//     </datalist>
// </td>

//                   <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                      <input type="text" value={item.mat_desc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} />
//                   </td>

//                   <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                      <input type="text" value={item.mat_group || ""} readOnly className="w-28 px-1.5 py-1 text-[11px] bg-gray-50 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} />
//                   </td>

//                   <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                      <input type="text" value={item.quantity || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} />
//                   </td>
//                   <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                      <input type="text" value={item.uom || ""} readOnly className="w-16 px-1.5 py-1 text-[11px] bg-gray-50 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} />
//                   </td>
//                   <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                      <input 
//     type="number" // Changed to number for cleaner alignment
//     value={getEffectiveTillIndent(item, index)} // <--- Use the new helper function
//     readOnly 
//     className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded" 
//     style={{ border: `1px solid ${lightBorder}`, height: '26px' }}
//   />
// </td> 

//                   {/* DYNAMIC BALANCE QTY */}
//                   <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                      <input 
//                         type="text" 
//                         value={getDynamicBalance(item, index)} // Use Helper Here
//                         readOnly 
//                         className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded cursor-not-allowed border" 
//                         style={{ borderColor: lightBorder, height: "26px" }} 
//                      />
//                   </td>

//                   {/* Req Now */}
//                   <td className="px-1.5 py-0.5 border-b">
//                      <input
//                         type="number"
//                         value={item.reqnow || ""}
//                         step="1"
//                         onChange={(e) => handleReqNowChange(index, e.target.value)}
//                         required
//                         className="w-24 px-1.5 py-1 text-[11px] rounded focus:outline-none"
//                         style={{ border: `1px solid ${lightBorder}`, height: "26px" }}
//                         onFocus={(e) => (e.target.style.border = `2px solid ${primaryColor}`)}
//                         onBlur={(e) => (e.target.style.border = `1px solid ${lightBorder}`)}
//                       />
//                   </td>

//                   {shouldShowDescoping() && (
//                     <td className="px-1.5 py-0.5 border-b">
//                       <input type="text" value={item.descoping || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded text-center font-semibold text-red-500" style={{ border: `1px solid ${lightBorder}`, height: '26px' }} />
//                     </td>
//                   )}

//                   <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                      <input
//                         type="text"
//                         value={item.Remarks || ""}
//                         disabled={isViewMode}
//                         onChange={(e) => handleFieldChange(index, "Remarks", e.target.value)}
//                         className="w-24 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100"
//                         style={{ border: `1px solid ${lightBorder}`, height: "26px" }}
//                       />
//                   </td>

//                   <td className="px-1.5 py-0.5 border-b text-center">
//                     <button type="button" onClick={() => deleteRow(index)} className="p-1 text-red-600 transition-colors transform rounded hover:bg-red-50 hover:scale-110">
//                        <Trash2 className="w-3 h-3" />
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Popup */}
//       {showPopup && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-none bg-opacity-40">
//           <div className="p-6 text-center bg-white border-black rounded-lg shadow-lg border-1 w-72">
//             <h2 className="mb-4 text-sm font-semibold text-gray-800">Requested quantity cannot exceed balance quantity!</h2>
//             <button
//               className="bg-[#28556E] text-white px-4 py-1.5 rounded text-sm font-medium"
//               onClick={() => { setShowPopup(false); if (popupIndex !== null) handleReqNowChange(popupIndex, ""); }}
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProjectDraftTable;


import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
import { API_BASE_URL_INDENT } from "../../Config";

const ProjectDraftTable = ({
  items,
  setItems,
  plant,
  projectType,
  indentType,
  subTab,
  isViewMode,
  primaryColor = "#28556E",
  lightBorder = "#7ba5b8",
}) => {
  // --- Local State for Dropdowns & UI ---
  const [plantCode, setPlantCode] = useState("");
  const [wbsList, setWbsList] = useState([]);
  const [subWbsList, setSubWbsList] = useState({});
  const [matCodeList, setMatCodeList] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupIndex, setPopupIndex] = useState(null);

  
  // --- 1. Extract Plant Code ---
  useEffect(() => {
    if (plant) {
      const extractedCode = plant.split("-")[0].trim();
      setPlantCode(extractedCode);
    } else {
      setPlantCode("");
    }
  }, [plant]);

  // Inside ProjectDraftTable.jsx

  // Inside ProjectDraftTable.jsx

useEffect(() => {
  const hydrateDropdowns = async () => {
    if (!plantCode || items.length === 0) return;

    // We use temporary maps to avoid multiple state updates in a loop
    const newSubWbsMap = { ...subWbsList };
    const newMatMap = { ...matCodeList };
    let changed = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // 1. If row has WBS but no Sub-WBS list, fetch it
      if (item.wbs && !newSubWbsMap[i]) {
        try {
          const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-subwbs`, {
            params: { plant: plantCode, mainType: indentType, projectType, wbs: item.wbs },
          });
          newSubWbsMap[i] = res.data;
          changed = true;
        } catch (err) { console.error("Hydrate SubWBS error", err); }
      }

      // 2. If row has Sub-WBS but no Material list, fetch it
      if (item.subwbs && !newMatMap[i]) {
        try {
          const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-materials`, {
            params: { plant: plantCode, mainType: indentType, projectType, wbs: item.wbs, subwbs: item.subwbs },
          });
          newMatMap[i] = res.data;
          changed = true;
        } catch (err) { console.error("Hydrate Materials error", err); }
      }
    }

    if (changed) {
      setSubWbsList(newSubWbsMap);
      setMatCodeList(newMatMap);
    }
  };

  hydrateDropdowns();
}, [plantCode, items.length]); // Runs when plant is ready or items list changes

// --- NEW: Fetch short texts for existing draft rows on mount ---
useEffect(() => {
  const hydrateShortTexts = async () => {
    const updatedItems = [...items];
    let changed = false;

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      // If it's a service, has a material, but no shortTextList yet
      if (indentType === "Service" && item.mat_code && (!item.shortTextList || item.shortTextList.length === 0)) {
        try {
          const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-service-short-texts`, {
            params: { 
              plant: plantCode, 
              wbs: item.wbs, 
              subwbs: item.subwbs, 
              mat_code: item.mat_code 
            },
          });
          updatedItems[i].shortTextList = res.data;
          changed = true;
        } catch (err) {
          console.error("Error hydrating short texts for row " + i, err);
        }
      }
    }

    if (changed) {
      setItems(updatedItems);
    }
  };

  if (items.length > 0 && plantCode) {
    hydrateShortTexts();
  }
}, [plantCode]); // Only run when plantCode is ready

  // --- API 1: Fetch WBS List ---
  useEffect(() => {
    if (!plantCode || !indentType || !projectType) return;

    axios
      .get(`${API_BASE_URL_INDENT}/fetch-wbs`, {
        params: { plant: plantCode, mainType: indentType, projectType },
      })
      .then((res) => {
        setWbsList(res.data);
      })
      .catch((err) => console.error("Error fetching WBS list:", err));
  }, [plantCode, projectType, indentType]);

  // --- Helper to Update Parent State ---
  const updateItems = (newItems) => {
    setItems(newItems);
  };

  // --- Helper: Dynamic Balance calculation (Includes Short Text Grouping) ---
 const getDynamicBalance = (currentItem, currentIndex) => {
  const total = Number(currentItem.quantity) || 0;
  const till = Number(currentItem.till_indent) || 0;
  const baseBalance = total - till;

  const usedPreviously = items.slice(0, currentIndex).reduce((acc, prevItem) => {
    if (
      prevItem.wbs === currentItem.wbs &&
      prevItem.subwbs === currentItem.subwbs &&
      prevItem.mat_code === currentItem.mat_code &&
      prevItem.short_text === currentItem.short_text // 👈 IMPORTANT
    ) {
      return acc + (Number(prevItem.reqnow) || 0);
    }
    return acc;
  }, 0);

  return (baseBalance - usedPreviously).toFixed(2);
};
  // --- Helper: Effective Till Indent ---
  const getEffectiveTillIndent = (currentItem, currentIndex) => {
    const baseTillIndent = Number(currentItem.till_indent) || 0;

    const previousUsage = items.slice(0, currentIndex).reduce((acc, prevItem) => {
      if (
        prevItem.wbs === currentItem.wbs &&
        prevItem.subwbs === currentItem.subwbs &&
        prevItem.mat_code === currentItem.mat_code &&
        prevItem.short_text === currentItem.short_text
      ) {
        return acc + (Number(prevItem.reqnow) || 0);
      }
      return acc;
    }, 0);

    return baseTillIndent + previousUsage;
  };

  // --- Handlers ---

  const handleWbsChange = async (index, value) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      wbs: value,
      subwbs: "", wdesc: "", mat_code: "", mat_desc: "", mat_group: "",
      short_text: "", quantity: "", till_indent: "", reqnow: "", shortTextList: []
    };
    updateItems(updated);

    if (!value) return;

    try {
      const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-subwbs`, {
        params: { plant: plantCode, mainType: indentType, projectType, wbs: value },
      });
      setSubWbsList((prev) => ({ ...prev, [index]: res.data }));
    } catch (err) {
      setSubWbsList((prev) => ({ ...prev, [index]: [] }));
    }
  };

  const handleSubWbsChange = async (index, value) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      subwbs: value,
      mat_code: "", mat_desc: "", mat_group: "", short_text: "",
      quantity: "", till_indent: "", reqnow: "", shortTextList: []
    };
    updateItems(updated);

    if (!value) return;

    try {
      const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-materials`, {
        params: { plant: plantCode, mainType: indentType, projectType, wbs: updated[index].wbs, subwbs: value },
      });
      const materialsData = res.data || [];
      setMatCodeList((prev) => ({ ...prev, [index]: materialsData }));

      if (materialsData.length > 0 && materialsData[0].WDESC) {
        // const newerItems = [...items];
        // newerItems[index].wdesc = materialsData[0].WDESC;
        // updateItems(newerItems);
         // ✅ FIX: Use a functional update to get the LATEST state
            setItems((prevItems) => {
                const newerItems = [...prevItems];
                // Make sure the row still exists
                if (newerItems[index]) {
                    newerItems[index].wdesc = materialsData[0].WDESC;
                }
                return newerItems;
            });
      }
    } catch (err) {
      console.error("Error fetching Materials:", err);
    }
  };

  const handleMaterialChange = async (index, value) => {
    const updated = [...items];
    updated[index].mat_code = value;

    const specificList = matCodeList[index] || [];
    const selectedData = specificList.find((m) => m.MAT === value);

    if (selectedData) {
      updated[index].mat_desc = selectedData.MDESC || selectedData.MAT_DESC || "";
      updated[index].uom = selectedData.UNIT || selectedData.UOM || "";
      updated[index].mat_group = "Loading...";
      updated[index].short_text = ""; // Reset as short text determines qty now
      updated[index].quantity = "";
      updated[index].till_indent = "";

      updateItems(updated);

      // 1. Fetch Short Texts for Services
      if (indentType === "Service") {
        try {
          const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-service-short-texts`, {
            params: { plant: plantCode, wbs: updated[index].wbs, subwbs: updated[index].subwbs, mat_code: value },
          });
          const stItems = [...items];
          stItems[index].shortTextList = res.data;
          updateItems(stItems);
        } catch (err) { console.error("Short text fetch error", err); }
      } else {
        // Standard Material logic
        updated[index].quantity = parseFloat(selectedData.QUAN || 0);
        updated[index].till_indent = parseFloat(selectedData.TILL_INDENT || 0);
        updateItems(updated);
      }

      // 2. Fetch Group via API
      try {
        const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mat-group`, {
          params: { plant: plantCode, mat_code: value, mainType: indentType }
        });
        const groupItems = [...items];
        if (groupItems[index]) groupItems[index].mat_group = res.data.MAT_GROUP || "";
        setItems(groupItems);
      } catch (err) { /* silent fail */ }
    } else {
      updateItems(updated);
    }
  };

  const handleShortTextChange = (index, value) => {
    const updated = [...items];
    const selectedTextData = updated[index].shortTextList?.find(s => s.SHORTTXT === value);

    updated[index].short_text = value;
    if (selectedTextData) {
      updated[index].quantity = selectedTextData.QUAN;
      updated[index].till_indent = selectedTextData.TILL;
      updated[index].uom = selectedTextData.UNIT || updated[index].uom;
    }
    updateItems(updated);
  };

  const handleReqNowChange = (index, inputValue) => {
    let value = inputValue === "" ? "" : Number(inputValue);
    const item = items[index];
    const updated = [...items];

    if (value < 0) {
      updated[index].reqnow = value;
      updated[index].descoping = "Yes";
      setItems(updated);
    } else {
      if (subTab !== 'RMC') {
        const total = Number(item.quantity) || 0;
        const till = Number(item.till_indent) || 0;
        const baseBalance = total - till;

        const usedInOtherRows = items.reduce((acc, row, i) => {
          if (
            i !== index &&
            row.wbs === item.wbs &&
            row.subwbs === item.subwbs &&
            row.mat_code === item.mat_code &&
            row.short_text === item.short_text
          ) {
            return acc + (Number(row.reqnow) || 0);
          }
          return acc;
        }, 0);

        const availableLimit = baseBalance - usedInOtherRows;

        if (value > availableLimit) {
          setPopupIndex(index);
          setShowPopup(true);
          return;
        }
      }
      updated[index].reqnow = value;
      updated[index].descoping = "";
      setItems(updated);
    }
  };

  const addRow = () => {
    setItems([
      ...items,
      {
        wbs: "", subwbs: "", mat_code: "", mat_desc: "", uom: "",
        quantity: "", till_indent: "", reqnow: "", wdesc: "",
        mat_group: "", Remarks: "", descoping: "", short_text: "", shortTextList: []
      },
    ]);
  };

  const deleteRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const label = indentType === "Service" ? "Service" : "Material";
  const shouldShowDescoping = () => items.some(item => Number(item.reqnow) < 0);

  return (
    <div className="mt-[-4]">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 px-2 py-1 text-white text-[11px] rounded border-2 shadow hover:shadow-lg transition-all transform hover:scale-105"
          style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
        >
          <Plus className="w-3 h-3" /> Add Item
        </button>
      </div>

      <div className="overflow-x-auto border-2 rounded-lg shadow-sm" style={{ borderColor: lightBorder }}>
        <table className="w-full border-collapse min-w-max text-[11px]">
          <thead>
            <tr className="bg-gray-200">
              {["Sno", "WBS Element", "Sub WBS", "WBS Desc", `${label} Code`, `${label} Desc`, `${label} Group`].map(h => (
                <th key={h} className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{h}</th>
              ))}
              
              {indentType === "Service" && (
                <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Short Text</th>
              )}

              {["Total Qty", "UOM", "Till Indent", "Balance Qty", "Req Now"].map(h => (
                <th key={h} className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{h}</th>
              ))}
              
              {shouldShowDescoping() && <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Descoping</th>}
              <th className="px-1.5 py-1 text-center font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Remarks</th>
              <th className="px-1.5 py-1 text-center font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="20" className="px-4 py-8 text-sm text-center text-gray-500">No line items found</td></tr>
            ) : (
              items.map((item, index) => (
                <tr key={index} className="transition-colors hover:bg-gray-50">
                  <td className="px-1.5 py-1 text-center border-b" style={{ borderColor: lightBorder }}>{index + 1}</td>
                  
                  <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                    <select value={item.wbs || ""} onChange={(e) => handleWbsChange(index, e.target.value)} className="w-32 p-1 border rounded focus:outline-none" style={{ borderColor: lightBorder }}>
                      <option value="">Select WBS</option>
                      {wbsList.map((w, i) => <option key={i} value={w.WBS}>{w.WBS}</option>)}
                    </select>
                  </td>

                  <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                    <select value={item.subwbs || ""} disabled={isViewMode || !item.wbs} onChange={(e) => handleSubWbsChange(index, e.target.value)} className="w-32 p-1 border rounded disabled:bg-gray-100" style={{ borderColor: lightBorder }}>
                      <option value="">Select Sub WBS</option>
                      {subWbsList[index]?.map((s, i) => <option key={i} value={s.SUBWBS}>{s.SUBWBS}</option>)}
                    </select>
                  </td>

                  <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                    <input type="text" value={item.wdesc || ""} readOnly className="w-32 p-1 border rounded bg-gray-50" style={{ borderColor: lightBorder }} />
                  </td>

                  <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                    <input type="text" list={`mat-list-${index}`} value={item.mat_code || ""} placeholder="Search..." disabled={isViewMode || !item.subwbs} onChange={(e) => handleMaterialChange(index, e.target.value)} className="p-1 border rounded w-28" style={{ borderColor: lightBorder }} />
                    <datalist id={`mat-list-${index}`}>
                      {matCodeList[index]?.map((m, i) => <option key={i} value={m.MAT}>{m.MDESC || m.DESC}</option>)}
                    </datalist>
                  </td>

                  <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                    <input type="text" value={item.mat_desc || ""} readOnly className="w-32 p-1 border rounded bg-gray-50" style={{ borderColor: lightBorder }} />
                  </td>

                  <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                    <input type="text" value={item.mat_group || ""} readOnly className="p-1 border rounded w-28 bg-gray-50" style={{ borderColor: lightBorder }} />
                  </td>

                  {/* SHORT TEXT COLUMN */}
                  {indentType === "Service" && (
                    <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                      <input 
                        type="text" 
                        list={`st-list-${index}`} 
                        value={item.short_text || ""} 
                        placeholder={item.mat_code ? "Select Text..." : "Pick Code"} 
                        disabled={isViewMode || !item.mat_code} 
                        onChange={(e) => handleShortTextChange(index, e.target.value)} 
                        className="w-40 p-1 border rounded focus:outline-none" 
                        style={{ borderColor: lightBorder }} 
                      />
                      <datalist id={`st-list-${index}`}>
                        {item.shortTextList?.map((s, i) => (
                          <option key={i} value={s.SHORTTXT}>{`Avail: ${Number(s.QUAN) - Number(s.TILL)}`}</option>
                        ))}
                      </datalist>
                    </td>
                  )}

                  <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                    <input type="text" value={item.quantity || ""} readOnly className="w-20 p-1 text-right border rounded bg-gray-50" style={{ borderColor: lightBorder }} />
                  </td>
                  <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                    <input type="text" value={item.uom || ""} readOnly className="w-16 p-1 text-center border rounded bg-gray-50" style={{ borderColor: lightBorder }} />
                  </td>
                  <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                    <input type="text" value={getEffectiveTillIndent(item, index)} readOnly className="w-20 p-1 text-right border rounded bg-gray-50" style={{ borderColor: lightBorder }} />
                  </td>
                  <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                    <input type="text" value={getDynamicBalance(item, index)} readOnly className="w-20 p-1 text-right border rounded bg-gray-50" style={{ borderColor: lightBorder }} />
                  </td>
                  <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                    <input type="number" value={item.reqnow || ""} step="1" onChange={(e) => handleReqNowChange(index, e.target.value)} required className="w-24 p-1 border rounded focus:ring-1 focus:ring-blue-400 focus:outline-none" style={{ borderColor: lightBorder }} />
                  </td>

                  {shouldShowDescoping() && (
                    <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                      <input type="text" value={item.descoping || ""} readOnly className="w-20 p-1 font-bold text-center text-red-500 border rounded bg-gray-50" style={{ borderColor: lightBorder }} />
                    </td>
                  )}

                  <td className="px-1.5 py-1 border-b" style={{ borderColor: lightBorder }}>
                    <input type="text" value={item.Remarks || ""} disabled={isViewMode} onChange={(e) => handleFieldChange(index, "Remarks", e.target.value)} className="w-24 p-1 border rounded focus:outline-none" style={{ borderColor: lightBorder }} />
                  </td>

                  <td className="px-1.5 py-1 border-b text-center" style={{ borderColor: lightBorder }}>
                    <button type="button" onClick={() => deleteRow(index)} className="p-1 text-red-600 transition-transform hover:scale-110">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="p-6 text-center bg-white rounded-lg shadow-xl w-72">
            <h2 className="mb-4 text-sm font-bold text-gray-800">Requested quantity cannot exceed balance quantity!</h2>
            <button className="bg-[#28556E] text-white px-6 py-1.5 rounded text-sm font-medium" onClick={() => { setShowPopup(false); if (popupIndex !== null) handleReqNowChange(popupIndex, ""); }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDraftTable;