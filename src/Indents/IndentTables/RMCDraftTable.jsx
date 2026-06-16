import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
import { API_BASE_URL_INDENT } from "../../Config";

const RMCDraftTable = ({
  items,
  setItems,
  plant,
  plantCodeOnly,
  projectType,
  indentType,
  subTab,
  isViewMode,
  primaryColor = "#28556E",
  lightBorder = "#7ba5b8",
}) => {
  // Global list for Cost Centers (loaded once)
  const [wbsList, setWbsList] = useState([]);
  
  // Row-specific lists for dependent dropdowns
  const [matGroupList, setMatGroupList] = useState({});
  const [matCodeList, setMatCodeList] = useState({});
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupIndex, setPopupIndex] = useState(null);

  // --- API 1: Fetch Cost Centers on Mount ---
  useEffect(() => {
    if (!plant || !indentType || !projectType) return;

    axios
      .get(`${API_BASE_URL_INDENT}/fetch-cost-centers`, {
        // Sending indentType as mainType to match backend expectations
        params: { plant:plantCodeOnly, mainType: indentType, projectType },
      })
      .then((res) => {
        console.log("RMC Cost Center List:", res.data);
        setWbsList(res.data);
      })
      .catch((err) => console.error("Error fetching Cost Centers:", err));
  }, [plant, projectType, indentType]);

  const updateItems = (newItems) => {
    setItems(newItems);
  };

  // --- HANDLER 1: Cost Center Change ---
  // Flow: Update WBS -> Fill Desc -> Fetch Material Groups
  const handleWbsChange = async (index, value) => {
    const updated = [...items];
    updated[index].wbs = value;
     updated[index].subwbs = "";
    // Auto-fill Description from the loaded WBS List
    const selectedCC = wbsList.find(
      (w) => (w.WBS || w.COST_CENTER || w.KOSTL) === value
    );
    updated[index].wdesc = selectedCC ? (selectedCC.WDESC || selectedCC.MCTXT) : "";

    // Reset downstream fields
    updated[index].mat_group = "";
    updated[index].mat_code = "";
    updated[index].mat_desc = "";
    updated[index].uom = "";
    updated[index].quantity = "";
    updated[index].till_indent = "";
    updated[index].balqty = "";
    updated[index].reqnow = "";

    // Clear downstream lists for this row
    setMatCodeList((prev) => { const n = { ...prev }; delete n[index]; return n; });
    
    updateItems(updated);

    if (!value) return;

    // API Call: Fetch Material Groups
    try {
      const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mgrp`, {
        params: { plant, mainType: indentType }
      });
      // Store groups specifically for this row index
      setMatGroupList((prev) => ({ ...prev, [index]: res.data }));
    } catch (err) {
      console.error("Error fetching material groups:", err);
    }
  };

  // --- HANDLER 2: Material Group Change ---
  // Flow: Update Group -> Fetch Materials
  // const handleMatGroupChange = async (index, value) => {
  //   const updated = [...items];
  //   updated[index].mat_group = value;
    
  //   // Reset downstream fields
  //   updated[index].mat_code = "";
  //   updated[index].mat_desc = "";
  //   updated[index].uom = "";
  //   updated[index].quantity = "";
  //   updated[index].till_indent = "";
  //   updated[index].balqty = "";
  //   updated[index].reqnow = "";

  //   updateItems(updated);

  //   if (!value) return;

  //   // API Call: Fetch Materials
  //   try {
  //     const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mat-details`, {
  //       params: { 
  //           plant, 
  //           mainType: indentType, 
  //           mat_group: value 
  //       }
  //     });
  //     // Store materials specifically for this row index
  //     setMatCodeList((prev) => ({ ...prev, [index]: res.data }));
  //   } catch (err) {
  //     console.error("Error fetching materials:", err);
  //   }
  // };

  // --- HANDLER 3: Material Code Change ---
  // Flow: Update Code -> Fill Desc/UOM/Qty -> Calculate Balance
  // const handleMaterialChange = (index, value) => {
  //   const updated = [...items];
  //   updated[index].mat_code = value;

  //   // Find details in the fetched list
  //   const specificList = matCodeList[index] || [];
  //   const selectedData = specificList.find((m) => m.MAT === value);

  //   if (selectedData) {
  //       updated[index].mat_desc = selectedData.MDESC || selectedData.DESC || "";
  //       updated[index].uom = selectedData.UNIT || selectedData.UOM || "";
        
  //       // Handle Quantities (If provided by API, otherwise 0)
  //       const qty = parseFloat(selectedData.QUAN || 0);
  //       const till = parseFloat(selectedData.TILL_INDENT || 0);
        
  //       updated[index].quantity = qty;
  //       updated[index].till_indent = till;
        
  //       // Calculate Balance
  //       updated[index].balqty = (qty - till).toFixed(2);
  //   } else {
  //       // Fallback or Reset
  //       updated[index].mat_desc = "";
  //       updated[index].uom = "";
  //       updated[index].quantity = "";
  //       updated[index].till_indent = "";
  //       updated[index].balqty = "";
  //   }

  //   updateItems(updated);
  // };

  // const handleMaterialChange = (index, value) => {
  //   const updated = [...items];
  //   updated[index].mat_code = value;

  //   // 1. Immediate UI Update (Description, UOM, Qty from List)
  //   const specificList = matCodeList[index] || [];
  //   const selectedData = specificList.find((m) => m.MAT === value);

  //   if (selectedData) {
  //       updated[index].mat_desc = selectedData.MDESC || selectedData.DESC || "";
  //       updated[index].uom = selectedData.UNIT || selectedData.UOM || "";
  //       // Set quantity from master list if available
  //       updated[index].quantity = parseFloat(selectedData.QUAN || 0); 
  //       // Set placeholder while fetching live indent data
  //       updated[index].till_indent = "Loading..."; 
  //       updated[index].balqty = ""; 
  //   } else {
  //       updated[index].mat_desc = "";
  //       updated[index].uom = "";
  //       updated[index].quantity = "";
  //       updated[index].till_indent = "";
  //   }

  //   // Update state immediately so dropdown closes and loading text appears
  //   setItems(updated);

  //   // 2. Trigger API Call to fetch Till Indent
  //   if (value) {
  //       const requestParams = {
  //          plant: plant,
  //          wbs: updated[index].wbs,
  //          mat_code: value,
  //          mainType: indentType,  // Mapped from props
  //          projectType: projectType
  //       };

  //       console.log("Fetching Indent Data with params:", requestParams);

  //       axios.get(`${API_BASE_URL_INDENT}/fetch-indent-data`, {
  //          params: requestParams
  //       })
  //       .then((res) => {
  //          console.log("API Response:", res.data);
           
  //          // Functional state update to safely update the specific row asynchronously
  //          setItems((prevItems) => {
  //              const newItems = [...prevItems];
  //              // Ensure row still exists
  //              if (newItems[index]) {
  //                  const fetchedTillIndent = parseFloat(res.data.till_indent || 0);
  //                  newItems[index].till_indent = fetchedTillIndent;

  //                  // Recalculate Balance if Quantity exists (Optional based on your logic)
  //                  const totalQty = parseFloat(newItems[index].quantity || 0);
  //                  if (totalQty > 0) {
  //                      newItems[index].balqty = (totalQty - fetchedTillIndent).toFixed(2);
  //                  }
  //              }
  //              return newItems;
  //          });
  //       })
  //       .catch((err) => {
  //          console.error("Error fetching till indent:", err);
  //          setItems((prevItems) => {
  //              const newItems = [...prevItems];
  //              if (newItems[index]) {
  //                  newItems[index].till_indent = "0"; // Error fallback
  //              }
  //              return newItems;
  //          });
  //       });
  //   }
  // };


   // --- HANDLER 2: Material Group Change (Suggestion Logic) ---
  const handleMatGroupChange = async (index, value) => {
    const updated = [...items];
    updated[index].mat_group = value;
    
    // Check if valid selection from list
    const specificGroups = matGroupList[index] || [];
    const isValid = specificGroups.some(g => g.MAT_GROUP === value);

    if (isValid) {
        try {
          const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mat-details`, {
            params: { plant, mainType: indentType, mat_group: value }
          });
          setMatCodeList((prev) => ({ ...prev, [index]: res.data }));
        } catch (err) { console.error("Error fetching materials:", err); }
    } else {
        updated[index].mat_code = "";
        updated[index].mat_desc = "";
    }
    updateItems(updated);
  };

  // --- HANDLER 3: Material Code Change (Suggestion Logic) ---
  const handleMaterialChange = (index, value) => {
    const updated = [...items];
    updated[index].mat_code = value;

    const specificList = matCodeList[index] || [];
    const selectedData = specificList.find((m) => m.MAT === value);

    if (selectedData) {
        updated[index].mat_desc = selectedData.MDESC || selectedData.DESC || "";
        updated[index].uom = selectedData.UNIT || selectedData.UOM || "";
        updated[index].quantity = parseFloat(selectedData.QUAN || 0); 
        updated[index].till_indent = "Loading..."; 
        updateItems(updated);

        // Fetch Live Indent
        axios.get(`${API_BASE_URL_INDENT}/fetch-indent-data`, {
           params: { plant, wbs: updated[index].wbs, mat_code: value, mainType: indentType, projectType }
        })
        .then((res) => {
           setItems((prev) => {
               const newItems = [...prev];
               if (newItems[index]) {
                   newItems[index].till_indent = parseFloat(res.data.till_indent || 0);
                   newItems[index].base_indent = parseFloat(res.data.till_indent || 0); // For dynamic calc
               }
               return newItems;
           });
        });
    } else {
        updated[index].mat_desc = "";
        updated[index].uom = "";
        updated[index].till_indent = "";
        updateItems(updated);
    }
  };
  // --- Other Handlers ---
  const addRow = () => {
    setItems([...items, { 
      wbs: "", subwbs: "",wdesc: "", 
      mat_group: "", mat_code: "", mat_desc: "", uom: "", 
      quantity: "", till_indent: "", balqty: "", reqnow: "", 
      Remarks: "", descoping: "" 
    }]);
  };

  const deleteRow = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleReqNowChange = (index, inputValue) => {
    let value = inputValue === "" ? "" : Number(inputValue);
    const item = items[index];

    if (value < 0) {
        const updated = [...items];
        updated[index].reqnow = value;
        updated[index].descoping = "Yes";
        setItems(updated);
    } else {
       
        const updated = [...items];
        updated[index].reqnow = value;
        updated[index].descoping = "";
        setItems(updated);
    }
  };

  // --- NEW: Helper to calculate indent dynamically ---
  const getCalculatedIndent = (currentIndex) => {
    const currentItem = items[currentIndex];
    
    // If we are still loading or haven't selected items, return placeholder
    if (!currentItem.wbs || !currentItem.mat_code) return "";
    
    // 1. Start with the value fetched from DB (default to 0)
    let totalIndent = Number(currentItem.base_indent || 0);

    // 2. Loop through all PREVIOUS rows
    for (let i = 0; i < currentIndex; i++) {
      const prevItem = items[i];

      // 3. If Cost Center AND Material Code match
      if (prevItem.wbs === currentItem.wbs && prevItem.mat_code === currentItem.mat_code) {
        // Add the previous row's 'Req Now' to the total
        totalIndent += Number(prevItem.reqnow || 0);
      }
    }

    return totalIndent;
  };
  
  const shouldShowDescoping = () => items.some(item => Number(item.reqnow) < 0);
  const label = indentType === "Service" ? "Service" : "Material";

  return (
    <div className="mt-[-4]">
      {/* Add Button */}
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={addRow} className="flex items-center gap-1 px-2 py-1 text-white text-[11px] rounded shadow hover:shadow-lg transition-all transform hover:scale-105 border-2" style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>
          <Plus className="w-3 h-3" /> Add Item
        </button>
      </div>

      <div className="overflow-x-auto border-2 rounded-lg shadow-sm" style={{ borderColor: lightBorder }}>
        <table className="w-full border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-200">
               {["Sno", "Cost Center", "Cost Center Desc", `${label} Group`, `${label} Code`, `${label} Desc`,  "UOM", "Till Indent", "Req Now"].map(h => (
                   <th key={h} className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>{h}</th>
               ))}
               {shouldShowDescoping() && <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b whitespace-nowrap">Descoping</th>}
               <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Remarks</th>
               <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
               <tr><td colSpan="14" className="px-4 py-8 text-sm text-center text-gray-500">No line items found</td></tr>
            ) : (
              items.map((item, index) => {
                return (
                  <tr key={index} className="transition-colors hover:bg-gray-50">
                    <td className="px-1.5 py-0.5 border-b text-center text-[11px]" style={{ borderColor: lightBorder }}>{index + 1}</td>
                    
                    {/* 1. Cost Center Dropdown */}
                    <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                      <select
                          value={item.wbs || ""}
                          onChange={(e) => handleWbsChange(index, e.target.value)}
                          className="w-32 px-1.5 py-1 text-[11px] rounded focus:outline-none"
                          style={{ border: `1px solid ${lightBorder}`, height: "26px" }}
                      >
                          <option value="">Select Cost Center</option>
                          {wbsList.map((w, i) => {
                              const val = w.WBS || w.COST_CENTER || w.KOSTL;
                              return <option key={i} value={val}>{val}</option>;
                          })}
                      </select>
                    </td>

                    {/* 2. Cost Center Desc */}
                    <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                        <input type="text" value={item.wdesc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} />
                    </td>

                    {/* 3. Material Group Dropdown */}
                    {/* <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                      <select 
                        value={item.mat_group || ""} 
                        disabled={isViewMode || !item.wbs} 
                        onChange={(e) => handleMatGroupChange(index, e.target.value)} 
                        className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none" 
                        style={{ border: `1px solid ${lightBorder}`, height: "26px" }}
                      >
                          <option value="">Select Group</option>
                          
                          {matGroupList[index] && matGroupList[index].map((g, i) => (
                              <option key={i} value={g.MAT_GROUP}>{g.MAT_GROUP}</option>
                          ))}
                         
                          {!matGroupList[index] && item.mat_group && (
                              <option value={item.mat_group}>{item.mat_group}</option>
                          )}
                      </select>
                    </td> */}

                    {/* 4. Material Code Dropdown */}
                    {/* <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                      <select 
                        value={item.mat_code || ""} 
                        disabled={isViewMode || !item.mat_group} 
                        onChange={(e) => handleMaterialChange(index, e.target.value)} 
                        className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none" 
                        style={{ border: `1px solid ${lightBorder}`, height: "26px" }}
                      >
                          <option value="">Select Material</option>
                          
                          {matCodeList[index] && matCodeList[index].map((m, i) => (
                              <option key={i} value={m.MAT}>{m.MAT}</option>
                          ))}

                          {!matCodeList[index] && item.mat_code && (
                              <option value={item.mat_code}>{item.mat_code}</option>
                          )}
                      </select>
                    </td> */}


                         {/* Mat Group Suggestion Input */}
                    <td className="px-1.5 py-0.5 border-b">
                      <input 
                        type="text" 
                        list={`mgrp-list-${index}`}
                        value={item.mat_group || ""} 
                        placeholder="Search Group..."
                        disabled={isViewMode || !item.wbs} 
                        onChange={(e) => handleMatGroupChange(index, e.target.value)} 
                        className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none" 
                        style={{ border: `1px solid ${lightBorder}`, height: "26px" }}
                      />
                      <datalist id={`mgrp-list-${index}`}>
                          {matGroupList[index]?.map((g, i) => <option key={i} value={g.MAT_GROUP} />)}
                      </datalist>
                    </td>

                    {/* Mat Code Suggestion Input */}
                    <td className="px-1.5 py-0.5 border-b">
                      <input 
                        type="text"
                        list={`mat-list-${index}`}
                        value={item.mat_code || ""} 
                        placeholder="Search Mat..."
                        disabled={isViewMode || !item.mat_group} 
                        onChange={(e) => handleMaterialChange(index, e.target.value)} 
                        className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none" 
                        style={{ border: `1px solid ${lightBorder}`, height: "26px" }}
                      />
                      <datalist id={`mat-list-${index}`}>
                          {matCodeList[index]?.map((m, i) => (
                              <option key={i} value={m.MAT}>{m.MDESC || m.DESC}</option>
                          ))}
                      </datalist>
                    </td>


                    {/* Details & Calculations */}
                    <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.mat_desc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} /></td>
                    {/* <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.quantity || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} /></td> */}
                    <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.uom || ""} readOnly className="w-16 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} /></td>
                    <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={getCalculatedIndent(index)} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} /></td>
                    {/* <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.balqty || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} /></td> */}

                    <td className="px-1.5 py-0.5 border-b">
                      <input type="number" value={item.reqnow || ""} step="1" onChange={(e) => handleReqNowChange(index, e.target.value)} required className="w-24 px-1.5 py-1 text-[11px] rounded focus:outline-none" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} onFocus={(e) => (e.target.style.border = `2px solid ${primaryColor}`)} onBlur={(e) => (e.target.style.border = `1px solid ${lightBorder}`)} />
                    </td>

                    {shouldShowDescoping() && <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.descoping || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded text-center text-red-500" style={{ border: `1px solid ${lightBorder}`, height: '26px' }} /></td>}
                    <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.Remarks || ""} disabled={isViewMode} onChange={(e) => handleFieldChange(index, "Remarks", e.target.value)} className="w-24 px-1.5 py-1 text-[11px] rounded focus:outline-none" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} /></td>
                    <td className="px-1.5 py-0.5 border-b text-center"><button type="button" onClick={() => deleteRow(index)} className="p-1 text-red-600 transition-colors transform rounded hover:bg-red-50 hover:scale-110"><Trash2 className="w-3 h-3" /></button></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-none bg-opacity-40">
          <div className="p-6 text-center bg-white border-black rounded-lg shadow-lg border-1 w-72">
            <h2 className="mb-4 text-sm font-semibold text-gray-800">Requested quantity cannot exceed balance quantity!</h2>
            <button className="bg-[#28556E] text-white px-4 py-1.5 rounded text-sm font-medium" onClick={() => { setShowPopup(false); if (popupIndex !== null) handleFieldChange(popupIndex, "reqnow", ""); }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RMCDraftTable;