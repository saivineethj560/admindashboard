// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { API_BASE_URL_INDENT } from "../../Config"; 

// const ProjectRevertTable = ({
//   items,
//   setItems,
//   plant,
//   projectType,
//   indentType,
//   isViewMode,
//   primaryColor,
//   lightBorder,
// }) => {
//   // --- Local State ---
//   const [plantCode, setPlantCode] = useState(""); // New State for just the Code
//   const [wbsList, setWbsList] = useState([]);
//   const [subWbsList, setSubWbsList] = useState({});
//   const [matCodeList, setMatCodeList] = useState({}); 
//   const [showPopup, setShowPopup] = useState(false);
//   const [popupIndex, setPopupIndex] = useState(null);

//   // --- 1. Extract Plant Code from Plant String ---
//   useEffect(() => {
//     if (plant) {
//       // Splits "1200 - MyHome" into ["1200 ", " MyHome"] then trims to get "1200"
//       const extractedCode = plant.split("-")[0].trim();
//       setPlantCode(extractedCode);
//     } else {
//       setPlantCode("");
//     }
//   }, [plant]);
  
//   // --- Internal WBS Fetch ---
//   useEffect(() => {
//     if (!plant || !indentType || !projectType) return;

//     const fetchWbs = async () => {
//       try {
//         const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-wbs`, {
//           params: { plantCode, indentType, projectType },
//         });
//         setWbsList(res.data);
//       } catch (err) {
//         console.error("Error fetching WBS list:", err);
//         setWbsList([]);
//       }
//     };

//     fetchWbs();
//   }, [plant, projectType, indentType]);

//   // --- Helpers ---
//   const shouldShowDescoping = () => {
//     return items.some((item) => Number(item.reqnow) < 0);
//   };

//   // --- Handlers ---

//   const handleWbsChange = async (index, value) => {
//     const updated = [...items];
//     updated[index]["wbs"] = value;
//     updated[index]["subwbs"] = "";
//     setItems(updated);

//     if (!value) return;

//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-subwbs`, {
//         params: { plant:plantCode, mainType: indentType, projectType, wbs: value },
//       });
//       setSubWbsList((prev) => ({ ...prev, [index]: res.data }));
//     } catch (err) {
//       console.error("Error fetching SUB-WBS:", err);
//     }
//   };

//   const handleSubWbsChange = async (index, value) => {
//     const updatedItems = [...items];
//     updatedItems[index]["subwbs"] = value;
    
//     // Reset dependent fields
//     ["wbs_desc", "mat_group", "mat_code", "mat_desc", "uom", "quantity", "till_indent", "balqty", "reqnow"].forEach(f => updatedItems[index][f] = "");
    
//     // Clear material list for this row
//     setMatCodeList((prev) => { const n = { ...prev }; delete n[index]; return n; });

//     if (!value) {
//       setItems(updatedItems);
//       return;
//     }

//     // 1. Fetch SubWBS Desc
//     try {
//         const resDesc = await axios.get(`${API_BASE_URL_INDENT}/fetch-subwbs-details`, {
//             params: { plant:plantCode, mainType: indentType, projectType, wbs: updatedItems[index].wbs, subwbs: value },
//         });
//         updatedItems[index].wbs_desc = resDesc.data.wdesc || "";
//     } catch (err) {
//         console.error("Error fetching SubWBS Desc:", err);
//     }

//     setItems(updatedItems);

//     // 2. Fetch Materials List
//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-materials`, {
//         params: { 
//             plant:plantCode, 
//             mainType: indentType, 
//             projectType, 
//             wbs: updatedItems[index].wbs, 
//             subwbs: value 
//         },
//       });
      
//       setMatCodeList((prev) => ({ ...prev, [index]: res.data || [] }));
//     } catch (err) {
//       console.error("Error fetching Materials:", err);
//     }
//   };

//   // 🔥 UPDATED: Use Local Data for BOQ details, Fetch Group via API
//   const handleMaterialChange = async (index, selectedMatCode) => {
//     const updatedItems = [...items];
//     updatedItems[index]["mat_code"] = selectedMatCode;

//     if (!selectedMatCode) {
//         updatedItems[index]["mat_desc"] = "";
//         updatedItems[index]["uom"] = "";
//         updatedItems[index]["mat_group"] = "";
//         updatedItems[index]["quantity"] = "";
//         updatedItems[index]["till_indent"] = "";
//         updatedItems[index]["balqty"] = "";
//         setItems(updatedItems);
//         return;
//     }

//     // 1. Populate ALL details from local list (Desc, UOM, Qty, Till Indent)
//     const specificList = matCodeList[index] || [];
//     const selectedData = specificList.find((m) => m.MAT === selectedMatCode);

//     if (selectedData) {
//       updatedItems[index]["mat_desc"] = selectedData.MDESC || selectedData.MAT_DESC || "";
//       updatedItems[index]["uom"] = selectedData.UNIT || selectedData.UOM || "";
      
//       // Map Quantities directly from local data
//       const qty = parseFloat(selectedData.QUAN || selectedData.quantity || 0);
//       const till = parseFloat(selectedData.TILL_INDENT || selectedData.till_indent || 0);

//       updatedItems[index]["quantity"] = qty;
//       updatedItems[index]["till_indent"] = till;
//       updatedItems[index]["balqty"] = (qty - till).toFixed(2);
//     }

//     // Set loading for Group only
//     updatedItems[index]["mat_group"] = "Loading...";
    
//     setItems(updatedItems);

//     try {
//       // 2. Fetch ONLY Material Group
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mat-group`, {
//          params: { plant: plantCode, mat_code: selectedMatCode }
//       });

//       // Update state safely using functional update
//       setItems(prevItems => {
//         const newItems = [...prevItems];
//         // Ensure the row still has the same material selected
//         if(newItems[index].mat_code === selectedMatCode) {
//             newItems[index]["mat_group"] = res.data?.MAT_GROUP || res.data?.MAT_GRP || "";
//         }
//         return newItems;
//       });

//     } catch (err) {
//       console.error("Error fetching material group:", err);
//       setItems(prevItems => {
//         const newItems = [...prevItems];
//         if(newItems[index].mat_code === selectedMatCode) {
//             newItems[index]["mat_group"] = "";
//         }
//         return newItems;
//       });
//     }
//   };

//   // const handleReqNowChange = (index, valueRaw) => {
//   //   let value = valueRaw === "" ? "" : Number(valueRaw);
//   //   const updatedItems = [...items];

//   //   if (value < 0) {
//   //     updatedItems[index].reqnow = value;
//   //     updatedItems[index].descoping = "Yes";
//   //     setItems(updatedItems);
//   //   } else {
//   //     // Validate Balance Qty
//   //     const balanceQty = (Number(updatedItems[index].quantity) || 0) - (Number(updatedItems[index].till_indent) || 0);
      
//   //     if (value > balanceQty) {
//   //       setPopupIndex(index);
//   //       setShowPopup(true);
//   //       return; 
//   //     }

//   //     updatedItems[index].reqnow = value;
//   //     updatedItems[index].descoping = "";
//   //     setItems(updatedItems);
//   //   }
//   // };


//   const handleReqNowChange = (index, valueRaw) => {
//     let value = valueRaw === "" ? "" : Number(valueRaw);
//     const updatedItems = [...items];

//     // 1. Validate Balance Qty for Current Row
//     const currentBalanceQty = (Number(updatedItems[index].quantity) || 0) - (Number(updatedItems[index].till_indent) || 0);
    
//     if (value !== "" && value > currentBalanceQty) {
//       setPopupIndex(index);
//       setShowPopup(true);
//       return; 
//     }

//     // 2. Update Current Row
//     updatedItems[index].reqnow = value;
//     updatedItems[index].descoping = value < 0 ? "Yes" : "";

//     // 3. Calculate Logic for the IMMEDIATE NEXT Row
//     if (index + 1 < updatedItems.length) {
//       const nextIndex = index + 1;
      
//       // The logic: Next Row's Till Indent = Current Row's Till Indent + Current Row's Req Now
//       const currentTill = Number(updatedItems[index].till_indent) || 0;
//       const currentReq = Number(updatedItems[index].reqnow) || 0;
      
//       const newNextTillIndent = currentTill + currentReq;
//       const nextTotalQty = Number(updatedItems[nextIndex].quantity) || 0;

//       updatedItems[nextIndex].till_indent = newNextTillIndent;
//       updatedItems[nextIndex].balqty = (nextTotalQty - newNextTillIndent).toFixed(2);
//     }

//     setItems(updatedItems);
//   };
  
//   const handleLineItemChange = (index, field, value) => {
//     const updated = [...items];
//     updated[index][field] = value;
//     setItems(updated);
//   };
//   const label = indentType === "Service" ? "Service" : "Material";

//   return (
//     <div className="overflow-x-auto border-2 rounded-lg shadow-sm" style={{ borderColor: lightBorder }}>
//       <table className="w-full border-collapse min-w-max">
//         <thead>
//           <tr className="bg-gray-200">
//             {/* Headers */}
//             {["Sno", "WBS Element", "Sub WBS", "WBS Desc", `${label} Code`, `${label} Desc`, `${label} Group`, "Total Qty", "UOM", "Till Indent", "Bal Qty", "Req Now"].map(h => (
//               <th key={h} className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>{h}</th>
//             ))}
//             {shouldShowDescoping() && <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b whitespace-nowrap">Descoping</th>}
//             <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>Remarks</th>
//           </tr>
//         </thead>
//         <tbody>
//           {items.map((item, index) => (
//             <tr key={index} className="transition-colors hover:bg-gray-50">
//               <td className="px-1.5 py-0.5 border-b text-center text-[11px]" style={{ borderColor: lightBorder }}>{item.SNO || index + 1}</td>
              
//               {/* WBS */}
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <select className="w-32 px-1.5 py-1 text-[11px] rounded border" value={item.wbs || ""} onChange={(e) => handleWbsChange(index, e.target.value)} disabled={isViewMode}>
//                   <option value="">Select WBS</option>
//                   {wbsList.map((w, i) => <option key={i} value={w.WBS}>{w.WBS}</option>)}
//                 </select>
//               </td>

//               {/* Sub WBS */}
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <select className="w-32 px-1.5 py-1 text-[11px] rounded border" value={item.subwbs || ""} onChange={(e) => handleSubWbsChange(index, e.target.value)} disabled={isViewMode}>
//                     <option value="">Select SubWBS</option>
//                     {!subWbsList[index] && item.subwbs && <option value={item.subwbs}>{item.subwbs}</option>}
//                     {subWbsList[index]?.map((s, i) => <option key={i} value={s.SUBWBS}>{s.SUBWBS}</option>)}
//                 </select>
//               </td>
                
//               {/* WBS Desc */}
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <input type="text" value={item.wbs_desc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" />
//               </td>

//               {/* Material Code */}
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <select value={item.mat_code || ""} disabled={isViewMode} onChange={(e) => handleMaterialChange(index, e.target.value)} className="w-28 px-1.5 py-1 text-[11px] rounded border">
//                     <option value="">Select</option>
//                     {!matCodeList[index] && item.mat_code && <option value={item.mat_code}>{item.mat_code}</option>}
//                     {matCodeList[index]?.map((m, i) => <option key={i} value={m.MAT}>{m.MAT}</option>)}
//                   </select>
//               </td>

//               {/* Material Desc */}
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.mat_desc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" /></td>

//               {/* Material Group (Read Only) */}
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                    <input type="text" value={item.mat_group || ""} readOnly className="w-28 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" />
//               </td>

//               {/* Stats */}
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.quantity || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" /></td>
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.uom || ""} readOnly className="w-16 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" /></td>
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.till_indent || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" /></td>
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.balqty || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" /></td>

//               {/* Req Now */}
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <input type="number" value={item.reqnow || ""} onChange={(e) => handleReqNowChange(index, e.target.value)} className="w-24 px-1.5 py-1 text-[11px] rounded border focus:border-blue-500" disabled={isViewMode} />
//               </td>

//                {shouldShowDescoping() && (
//                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                     <input type="text" value={item.descoping || ""} readOnly className={`w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border text-center ${item.descoping === "Yes" ? "text-red-500" : ""}`} />
//                  </td>
//                )}
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                  <input type="text" value={item.Remarks || ""} onChange={(e) => handleLineItemChange(index, "Remarks", e.target.value)} className="w-24 px-1.5 py-1 text-[11px] rounded border" disabled={isViewMode} />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       {showPopup && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-none bg-opacity-40">
//           <div className="p-6 text-center bg-white border rounded-lg shadow-lg w-72">
//             <h2 className="mb-4 text-sm font-semibold text-gray-800">Requested quantity cannot exceed balance quantity!</h2>
//             <button className="bg-blue-800 text-white px-4 py-1.5 rounded text-sm" onClick={() => { setShowPopup(false); if(popupIndex !== null) handleLineItemChange(popupIndex, "reqnow", ""); }}>OK</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProjectRevertTable;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { API_BASE_URL_INDENT } from "../../Config";

// const ProjectRevertTable = ({
//   items,
//   setItems,
//   plant,
//   projectType,
//   indentType,
//   isViewMode,
//   primaryColor = "#28556E",
//   lightBorder = "#7ba5b8",
// }) => {
//   // --- Local State ---
//   const [plantCode, setPlantCode] = useState("");
//   const [wbsList, setWbsList] = useState([]);
//   const [subWbsList, setSubWbsList] = useState({});
//   const [matCodeList, setMatCodeList] = useState({});
//   const [showPopup, setShowPopup] = useState(false);
//   const [popupIndex, setPopupIndex] = useState(null);

//   // --- 1. Extract Plant Code ---
//   useEffect(() => {
//     if (plant) {
//       const extractedCode = plant.split("-")[0].trim();
//       setPlantCode(extractedCode);
//     } else {
//       setPlantCode("");
//     }
//   }, [plant]);

//   // Add this inside ProjectRevertTable.jsx (above your return statement)

// useEffect(() => {
//   const hydrateSubWbsOnLoad = async () => {
//     // Only run if we have a plant and at least one item
//     if (!plantCode || items.length === 0) return;

//     const newSubWbsMap = { ...subWbsList };
//     let changed = false;

//     // Loop through all items coming from the database
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];

//       // Check: Does this row have a WBS? And have we NOT fetched the list for this index yet?
//       if (item.wbs && !newSubWbsMap[i]) {
//         try {
//           const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-subwbs`, {
//             params: { 
//               plant: plantCode, 
//               mainType: indentType, 
//               projectType: projectType, 
//               wbs: item.wbs 
//             },
//           });
//           newSubWbsMap[i] = res.data;
//           changed = true;
//         } catch (err) {
//           console.error("Failed to hydrate subwbs for row " + i, err);
//         }
//       }
//     }

//     if (changed) {
//       setSubWbsList(newSubWbsMap);
//     }
//   };

//   hydrateSubWbsOnLoad();
// }, [plantCode, items.length]); // Triggers when plantCode is ready or items load

//   // --- Internal WBS Fetch ---
//   useEffect(() => {
//     if (!plantCode || !indentType || !projectType) return;

//     const fetchWbs = async () => {
//       try {
//         const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-wbs`, {
//           params: { plant: plantCode, mainType: indentType, projectType },
//         });
//         setWbsList(res.data);
//       } catch (err) {
//         console.error("Error fetching WBS list:", err);
//         setWbsList([]);
//       }
//     };
//     fetchWbs();
//   }, [plantCode, projectType, indentType]);

//   // --- Helpers ---
//   const shouldShowDescoping = () => items.some((item) => Number(item.reqnow) < 0);

//   // --- Handlers ---

//   const handleWbsChange = async (index, value) => {
//     const updated = [...items];
//     updated[index] = {
//       ...updated[index],
//       wbs: value,
//       subwbs: "",
//       wbs_desc: "",
//       mat_code: "",
//       mat_desc: "",
//       mat_group: "",
//       short_text: "",
//       quantity: "",
//       till_indent: "",
//       balqty: "",
//       reqnow: "",
//       shortTextList: []
//     };
//     setItems(updated);

//     if (!value) return;

//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-subwbs`, {
//         params: { plant: plantCode, mainType: indentType, projectType, wbs: value },
//       });
//       setSubWbsList((prev) => ({ ...prev, [index]: res.data }));
//     } catch (err) {
//       console.error("Error fetching SUB-WBS:", err);
//     }
//   };

//   const handleSubWbsChange = async (index, value) => {
//     const updatedItems = [...items];
//     updatedItems[index] = {
//       ...updatedItems[index],
//       subwbs: value,
//       wbs_desc: "",
//       mat_code: "",
//       mat_desc: "",
//       mat_group: "",
//       short_text: "",
//       quantity: "",
//       till_indent: "",
//       balqty: "",
//       reqnow: "",
//       shortTextList: []
//     };

//     setMatCodeList((prev) => { const n = { ...prev }; delete n[index]; return n; });

//     if (!value) {
//       setItems(updatedItems);
//       return;
//     }

//     try {
//       // Fetch Details and Materials
//       const [resDesc, resMat] = await Promise.all([
//         axios.get(`${API_BASE_URL_INDENT}/fetch-subwbs-details`, {
//           params: { plant: plantCode, mainType: indentType, projectType, wbs: updatedItems[index].wbs, subwbs: value },
//         }),
//         axios.get(`${API_BASE_URL_INDENT}/fetch-materials`, {
//           params: { plant: plantCode, mainType: indentType, projectType, wbs: updatedItems[index].wbs, subwbs: value },
//         })
//       ]);

//       updatedItems[index].wbs_desc = resDesc.data.wdesc || "";
//       setMatCodeList((prev) => ({ ...prev, [index]: resMat.data || [] }));
//       setItems(updatedItems);
//     } catch (err) {
//       console.error("Error fetching subwbs info:", err);
//     }
//   };

//   const handleMaterialChange = async (index, selectedMatCode) => {
//     const updatedItems = [...items];
//     updatedItems[index].mat_code = selectedMatCode;

//     const specificList = matCodeList[index] || [];
//     const selectedData = specificList.find((m) => m.MAT === selectedMatCode);

//     if (selectedData) {
//       updatedItems[index].mat_desc = selectedData.MDESC || selectedData.MAT_DESC || "";
//       updatedItems[index].uom = selectedData.UNIT || selectedData.UOM || "";
//       updatedItems[index].mat_group = "Loading...";
//       updatedItems[index].short_text = ""; // Reset as short text determines qty now
//       updatedItems[index].quantity = "";
//       updatedItems[index].till_indent = "";
//       updatedItems[index].balqty = "";

//       setItems(updatedItems);

//       // 1. Fetch Service Short Texts if applicable
//       if (indentType === "Service") {
//         try {
//           const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-service-short-texts`, {
//             params: { plant: plantCode, wbs: updatedItems[index].wbs, subwbs: updatedItems[index].subwbs, mat_code: selectedMatCode },
//           });
//           setItems(prev => {
//             const next = [...prev];
//             next[index].shortTextList = res.data;
//             return next;
//           });
//         } catch (err) { console.error("Short text fetch error", err); }
//       } else {
//         // Material Logic
//         updatedItems[index].quantity = parseFloat(selectedData.QUAN || 0);
//         updatedItems[index].till_indent = parseFloat(selectedData.TILL_INDENT || 0);
//         updatedItems[index].balqty = (updatedItems[index].quantity - updatedItems[index].till_indent).toFixed(2);
//         setItems(updatedItems);
//       }

//       // 2. Fetch Group
//       try {
//         const resG = await axios.get(`${API_BASE_URL_INDENT}/fetch-mat-group`, {
//           params: { plant: plantCode, mat_code: selectedMatCode, mainType: indentType }
//         });
//         setItems(prev => {
//           const next = [...prev];
//           if (next[index]) next[index].mat_group = resG.data.MAT_GROUP || "";
//           return next;
//         });
//       } catch (err) { /* silent */ }
//     } else {
//       setItems(updatedItems);
//     }
//   };

//   const handleShortTextChange = (index, value) => {
//     const updated = [...items];
//     const selectedTextData = updated[index].shortTextList?.find(s => s.SHORTTXT === value);

//     updated[index].short_text = value;
//     if (selectedTextData) {
//       updated[index].quantity = selectedTextData.QUAN;
//       updated[index].till_indent = selectedTextData.TILL_INDENT;
//       updated[index].uom = selectedTextData.UNIT || updated[index].uom;
//       updated[index].balqty = (Number(selectedTextData.QUAN) - Number(selectedTextData.TILL_INDENT)).toFixed(2);
//     }
//     setItems(updated);
//   };

//   const handleReqNowChange = (index, valueRaw) => {
//     let value = valueRaw === "" ? "" : Number(valueRaw);
//     const updatedItems = [...items];

//     // 1. Validate Balance Qty
//     const currentBalanceQty = (Number(updatedItems[index].quantity) || 0) - (Number(updatedItems[index].till_indent) || 0);
    
//     if (value !== "" && value > currentBalanceQty) {
//       setPopupIndex(index);
//       setShowPopup(true);
//       return; 
//     }

//     updatedItems[index].reqnow = value;
//     updatedItems[index].descoping = value < 0 ? "Yes" : "";

//     // 2. Dynamic Update for following rows (Optional logic preserved from your snippet)
//     if (index + 1 < updatedItems.length) {
//       const nextIdx = index + 1;
//       const currentTill = Number(updatedItems[index].till_indent) || 0;
//       const currentReq = Number(updatedItems[index].reqnow) || 0;
      
//       const newNextTill = currentTill + currentReq;
//       updatedItems[nextIdx].till_indent = newNextTill;
//       updatedItems[nextIdx].balqty = (Number(updatedItems[nextIdx].quantity) - newNextTill).toFixed(2);
//     }

//     setItems(updatedItems);
//   };

//   const label = indentType === "Service" ? "Service" : "Material";

//   return (
//     <div className="overflow-x-auto border-2 rounded-lg shadow-sm" style={{ borderColor: lightBorder }}>
//       <table className="w-full border-collapse min-w-max text-[11px]">
//         <thead>
//           <tr className="bg-gray-200">
//             {["Sno", "WBS Element", "Sub WBS", "WBS Desc", `${label} Code`, `${label} Desc`, `${label} Group`].map(h => (
//               <th key={h} className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{h}</th>
//             ))}
//             {indentType === "Service" && (
//               <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Short Text</th>
//             )}
//             {["Total Qty", "UOM", "Till Indent", "Bal Qty", "Req Now"].map(h => (
//               <th key={h} className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{h}</th>
//             ))}
//             {shouldShowDescoping() && <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Descoping</th>}
//             <th className="px-1.5 py-1 text-center font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Remarks</th>
//           </tr>
//         </thead>
//         <tbody>
//           {items.map((item, index) => (
//             <tr key={index} className="border-b hover:bg-gray-50 last:border-0" style={{ borderColor: lightBorder }}>
//               <td className="px-1.5 py-1 text-center">{index + 1}</td>
//               <td>
//                 <select className="w-32 p-1 border rounded" value={item.wbs || ""} onChange={(e) => handleWbsChange(index, e.target.value)} disabled={isViewMode}>
//                   <option value="">Select WBS</option>
//                   {wbsList.map((w, i) => <option key={i} value={w.WBS}>{w.WBS}</option>)}
//                 </select>
//               </td>
//               <td>
//                 <select className="w-32 p-1 border rounded disabled:bg-gray-100" value={item.subwbs || ""} onChange={(e) => handleSubWbsChange(index, e.target.value)} disabled={isViewMode || !item.wbs}>
//                   <option value="">Select SubWBS</option>
//                   {subWbsList[index]?.map((s, i) => <option key={i} value={s.SUBWBS}>{s.SUBWBS}</option>)}
//                 </select>
//               </td>
//               <td><input type="text" value={item.wbs_desc || ""} readOnly className="w-32 p-1 border rounded bg-gray-50" /></td>
//               <td>
//                 <input type="text" list={`mat-list-${index}`} value={item.mat_code || ""} placeholder="Search..." disabled={isViewMode || !item.subwbs} onChange={(e) => handleMaterialChange(index, e.target.value)} className="p-1 border rounded w-28" />
//                 <datalist id={`mat-list-${index}`}>
//                   {matCodeList[index]?.map((m, i) => <option key={i} value={m.MAT}>{m.MDESC || m.DESC}</option>)}
//                 </datalist>
//               </td>
//               <td><input type="text" value={item.mat_desc || ""} readOnly className="w-32 p-1 border rounded bg-gray-50" /></td>
//               <td><input type="text" value={item.mat_group || ""} readOnly className="p-1 border rounded w-28 bg-gray-50" /></td>

//               {indentType === "Service" && (
//                 <td>
//                   <input type="text" list={`st-list-${index}`} value={item.short_text || ""} placeholder="Select Text..." disabled={isViewMode || !item.mat_code} onChange={(e) => handleShortTextChange(index, e.target.value)} className="w-40 p-1 border rounded" />
//                   <datalist id={`st-list-${index}`}>
//                     {item.shortTextList?.map((s, i) => (
//                       <option key={i} value={s.SHORTTXT}>{`Avail: ${Number(s.QUAN) - Number(s.TILL)}`}</option>
//                     ))}
//                   </datalist>
//                 </td>
//               )}

//               <td><input type="text" value={item.quantity || ""} readOnly className="w-20 p-1 text-right border rounded bg-gray-50" /></td>
//               <td><input type="text" value={item.uom || ""} readOnly className="w-16 p-1 text-center border rounded bg-gray-50" /></td>
//               <td><input type="text" value={item.till_indent || ""} readOnly className="w-20 p-1 text-right border rounded bg-gray-50" /></td>
//               <td><input type="text" value={item.balqty || ""} readOnly className="w-20 p-1 text-right border rounded bg-gray-50" /></td>
//               <td><input type="number" value={item.reqnow || ""} onChange={(e) => handleReqNowChange(index, e.target.value)} className="w-24 p-1 border rounded" disabled={isViewMode} /></td>
//               {shouldShowDescoping() && (
//                 <td><input type="text" value={item.descoping || ""} readOnly className="w-20 p-1 font-bold text-center text-red-500 border rounded bg-gray-50" /></td>
//               )}
//               <td><input type="text" value={item.Remarks || ""} onChange={(e) => { const updated = [...items]; updated[index].Remarks = e.target.value; setItems(updated); }} className="w-24 p-1 border rounded" disabled={isViewMode} /></td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       {showPopup && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <div className="p-6 text-center bg-white rounded-lg shadow-xl w-72">
//             <h2 className="mb-4 text-sm font-bold">Requested quantity cannot exceed balance quantity!</h2>
//             <button className="bg-[#28556E] text-white px-6 py-1.5 rounded" onClick={() => { setShowPopup(false); if (popupIndex !== null) handleReqNowChange(popupIndex, ""); }}>OK</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProjectRevertTable;


import React from "react";

const ProjectRevertTable = ({
  items,
  setItems, // Ensure this is received as a prop
  indentType,
  lightBorder = "#7ba5b8",
}) => {
  // --- Helpers ---
  const shouldShowDescoping = () => items.some((item) => Number(item.reqnow) < 0);
  const label = indentType === "Service" ? "Service" : "Material";

  return (
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
            {["Total Qty", "UOM", "Till Indent", "Bal Qty", "Req Now"].map(h => (
              <th key={h} className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{h}</th>
            ))}
            {shouldShowDescoping() && <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Descoping</th>}
            <th className="px-1.5 py-1 text-center font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b hover:bg-gray-50 last:border-0" style={{ borderColor: lightBorder }}>
              {/* SNo */}
              <td className="px-1.5 py-1 text-center text-gray-600 font-medium">{index + 1}</td>
              
              {/* READ ONLY FIELDS */}
              <td><input type="text" value={item.wbs || ""} readOnly className="w-32 p-1 bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              <td><input type="text" value={item.subwbs || ""} readOnly className="w-32 p-1 bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              <td><input type="text" value={item.wbs_desc || item.wdesc || ""} readOnly className="w-32 p-1 bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              <td><input type="text" value={item.mat_code || ""} readOnly className="p-1 bg-gray-100 border rounded outline-none cursor-not-allowed w-28" /></td>
              <td><input type="text" value={item.mat_desc || ""} readOnly className="w-32 p-1 bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              <td><input type="text" value={item.mat_group || ""} readOnly className="p-1 bg-gray-100 border rounded outline-none cursor-not-allowed w-28" /></td>

              {indentType === "Service" && (
                <td><input type="text" value={item.short_text || ""} readOnly className="w-40 p-1 bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              )}

              <td><input type="text" value={item.quantity || ""} readOnly className="w-20 p-1 text-right bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              <td><input type="text" value={item.uom || ""} readOnly className="w-16 p-1 text-center bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              <td><input type="text" value={item.till_indent || ""} readOnly className="w-20 p-1 text-right bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              <td><input type="text" value={item.balqty || ""} readOnly className="w-20 p-1 text-right bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              <td><input type="text" value={item.reqnow || ""} readOnly className="w-24 p-1 font-semibold text-right text-blue-800 border rounded outline-none cursor-not-allowed bg-blue-50" /></td>

              {shouldShowDescoping() && (
                <td><input type="text" value={item.descoping || ""} readOnly className="w-20 p-1 font-bold text-center text-red-500 bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              )}

              {/* ✅ EDITABLE REMARKS FIELD */}
              <td>
                <input 
                  type="text" 
                  value={item.Remarks || ""} 
                  onChange={(e) => {
                    const updated = [...items];
                    updated[index] = { ...updated[index], Remarks: e.target.value };
                    setItems(updated);
                  }}
                  placeholder="Enter remarks..."
                  className="w-32 p-1 bg-white border border-gray-300 rounded outline-none focus:ring-1 focus:ring-blue-400" 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectRevertTable;