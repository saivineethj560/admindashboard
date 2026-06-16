import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from 'lucide-react';
import axios from "axios";
import { API_BASE_URL } from "../../Config";

export default function ProjectTable({ items, setItems, plant, projectType, mainType, primaryColor, lightBorder, subTab }) {
  
  const [wbsList, setWbsList] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupIndex, setPopupIndex] = useState(null);

  const [focusedIndex, setFocusedIndex] = useState(null); // for mat code suggestion search
  // --- API: Fetch WBS ---
  useEffect(() => {
    console.log("--- Fetching WBS List Triggered ---");
    console.log("Params:", { plant, mainType, projectType });
    if (!plant || !mainType || !projectType) {
      setWbsList([]);
      return;
    }
    axios.get(`${API_BASE_URL}/fetch-wbs`, {
        params: { plant, mainType, projectType },
      })
      .then((res) => setWbsList(res.data))
      .catch((err) => console.error(err));
  }, [plant, mainType, projectType]);
//----------for mat code suggestion search---------------
  const handleMatSelect = (index, selectedMaterial) => {
  const value = selectedMaterial.MAT;
  
  // Call your existing handleItemChange logic manually
  // We pass 'mat_code' and the value
  handleItemChange(index, "mat_code", value);
  
  // Close the suggestion list
  setFocusedIndex(null);
};

  // --- Handlers ---
  const addRow = () => {
    setItems([...items, { 
      wbs: "", subwbs: "", wdesc:"", mat_code: "", mat_group:"", Remarks:"",
      mat_desc: "", uom: "", quantity: "", till_indent: "", reqnow: "",
      descoping: "", subwbsList: [], materialList: []
    }]);
  };

  const deleteRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = async (index, field, value) => {
    const newItems = [...items];

    if (field === "wbs") {
      newItems[index] = {
        ...newItems[index],
        wbs: value,
        subwbs: "", wdesc:"", mat_code: "", mat_desc: "", uom: "",
        quantity: "", till_indent: "", reqnow: "", mat_group:"", Remarks:"",
        descoping: "", subwbsList: [], materialList: [],
      };
      
      try {
        const res = await axios.get(`${API_BASE_URL}/fetch-subwbs`, {
          params: { plant, mainType, projectType, wbs: value },
        });
        newItems[index].subwbsList = res.data;
      } catch (err) { newItems[index].subwbsList = []; }

    } else if (field === "subwbs") {
       const selectedSubWbs = newItems[index].subwbsList?.find((s) => s.SUBWBS === value);
       
       newItems[index] = {
         ...newItems[index],
         subwbs: value,
         wdesc: "", 
         mat_code: "", mat_desc: "", mat_group: "", uom: "",
         quantity: "", till_indent: "", reqnow: "", materialList: [],
       };

       if(selectedSubWbs?.WDESC) {
           newItems[index].wdesc = selectedSubWbs.WDESC;
       }

       try {
         const res = await axios.get(`${API_BASE_URL}/fetch-materials`, {
           params: { plant, mainType, projectType, wbs: newItems[index].wbs, subwbs: value },
         });
         
         newItems[index].materialList = res.data;

         if (!newItems[index].wdesc && res.data.length > 0 && res.data[0].WDESC) {
            newItems[index].wdesc = res.data[0].WDESC;
         }
       } catch (err) { newItems[index].materialList = []; }

    // } else if (field === "mat_code") {
    //    const selectedMaterial = newItems[index].materialList?.find((m) => m.MAT === value);
       
    //    // 1. Populate basic fields available in the list
    //    newItems[index] = {
    //      ...newItems[index],
    //      mat_code: value,
    //      mat_group: "Loading...", // Temporary feedback
    //      mat_desc: selectedMaterial?.MDESC || selectedMaterial?.DESC || "",
    //      wdesc: selectedMaterial?.WDESC || newItems[index].wdesc || "",
    //      uom: selectedMaterial?.UNIT || selectedMaterial?.UOM || "",
    //      quantity: selectedMaterial?.QUAN || selectedMaterial?.QTY || "",
    //      till_indent: selectedMaterial?.TILL_INDENT || selectedMaterial?.TILL || "",
    //    };

    //    // 2. Update State immediately so UI shows "Loading..." and other fields
    //    setItems([...newItems]);

    //    // 3. Trigger API to fetch Material Group
    //    try {
    //        const res = await axios.get(`${API_BASE_URL}/fetch-mat-group`, {
    //            params: { 
    //                plant: plant, 
    //                mat_code: value ,
    //                mainType:mainType
    //            }
    //        });

    //        // 4. Update the specific item with the fetched group
    //        const updatedItems = [...newItems];
    //        // Ensure we are updating the correct row (in case user added rows quickly)
    //        updatedItems[index].mat_group = res.data.MAT_GROUP || ""; 
    //        setItems(updatedItems);

    //    } catch (err) {
    //        console.error("Error fetching material group", err);
    //        const updatedItems = [...newItems];
    //        updatedItems[index].mat_group = ""; // Clear loading on error
    //        setItems(updatedItems);
    //    }
       
    //    return; // Return here because we handled setItems manually above

    // ... inside handleItemChange function ...
} else if (field === "mat_code") {
    const selectedMaterial = newItems[index].materialList?.find((m) => m.MAT === value);
    
    newItems[index] = {
      ...newItems[index],
      mat_code: value,
      // If we found a match, populate fields, otherwise clear them
      mat_desc: selectedMaterial ? (selectedMaterial.MDESC || selectedMaterial.DESC) : "",
      wdesc: selectedMaterial ? (selectedMaterial.WDESC || newItems[index].wdesc) : newItems[index].wdesc,
      uom: selectedMaterial ? (selectedMaterial.UNIT || selectedMaterial.UOM) : "",
      quantity: selectedMaterial ? (selectedMaterial.QUAN || selectedMaterial.QTY) : "",
      till_indent: selectedMaterial ? (selectedMaterial.TILL_INDENT || selectedMaterial.TILL) : "",
      mat_group: selectedMaterial ? "Loading..." : "" 
    };

    setItems([...newItems]);

    // ONLY fetch group if it's a valid material code from the list
    if (selectedMaterial) {
        try {
            const res = await axios.get(`${API_BASE_URL}/fetch-mat-group`, {
                params: { plant, mat_code: value, mainType }
            });
            const updatedItems = [...newItems];
            updatedItems[index].mat_group = res.data.MAT_GROUP || ""; 
            setItems(updatedItems);
        } catch (err) {
            const updatedItems = [...newItems];
            updatedItems[index].mat_group = ""; 
            setItems(updatedItems);
        }
    }
    return;
    } else if (field === "reqnow") {
       let valNum = value === "" ? "" : Number(value);
       
       if (valNum < 0) {
          newItems[index].reqnow = valNum;
          newItems[index].descoping = "Yes";
       } else {
          // 1. Calculate base balance
          const baseBalance = (Number(newItems[index].quantity) || 0) - (Number(newItems[index].till_indent) || 0);

          // 2. Calculate what is used in ALL OTHER rows for this same material combination
          const usedInOtherRows = newItems.reduce((acc, item, i) => {
            if (i !== index && // Don't count the current row
                item.wbs === newItems[index].wbs && 
                item.subwbs === newItems[index].subwbs && 
                item.mat_code === newItems[index].mat_code) {
                return acc + (Number(item.reqnow) || 0);
            }
            return acc;
          }, 0);

          // 3. Determine real available limit
          const availableLimit = baseBalance - usedInOtherRows;

          if (valNum > availableLimit) {
             setShowPopup(true);
             setPopupIndex(index);
             return; // Stop update
          }

          newItems[index].reqnow = valNum;
          newItems[index].descoping = "";
       }
    } 
// ... rest of function
    else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const shouldShowDescoping = () => items.some(item => Number(item.reqnow) < 0);

  // Helper to calculate balance for a specific row index
  const getDynamicBalance = (currentItem, currentIndex) => {
    const baseBalance = (Number(currentItem.quantity) || 0) - (Number(currentItem.till_indent) || 0);
    
    // Sum 'reqnow' of all PREVIOUS rows (0 to currentIndex - 1) that match this material
    const usedPreviously = items.slice(0, currentIndex).reduce((acc, prevItem) => {
      if (prevItem.wbs === currentItem.wbs && 
          prevItem.subwbs === currentItem.subwbs && 
          prevItem.mat_code === currentItem.mat_code) {
        return acc + (Number(prevItem.reqnow) || 0);
      }
      return acc;
    }, 0);

    return baseBalance - usedPreviously;
  };
  
  // Helper to calculate Till Indent including previous rows' input
  const getEffectiveTillIndent = (currentItem, currentIndex) => {
    // 1. Get the original value from API/DB
    const baseTillIndent = Number(currentItem.till_indent) || 0;

    // 2. Sum 'reqnow' of all PREVIOUS rows (0 to currentIndex - 1) that match this material
    const previousUsage = items.slice(0, currentIndex).reduce((acc, prevItem) => {
      if (prevItem.wbs === currentItem.wbs && 
          prevItem.subwbs === currentItem.subwbs && 
          prevItem.mat_code === currentItem.mat_code) {
        return acc + (Number(prevItem.reqnow) || 0);
      }
      return acc;
    }, 0);

    // 3. Return the sum
    return baseTillIndent + previousUsage;
  };
  const label = mainType === "Service" ? "Service" : "Material";
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={addRow} className="flex items-center gap-1 px-2 py-1 text-white text-[11px] rounded border-2" style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>
          <Plus className="w-3 h-3" /> Add {subTab} Item
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm" style={{ borderColor: lightBorder }}>
        <table className="w-full border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-200">
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">S.No</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">WBS Element</th>
               
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Sub WBS</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">SubWBS Desc</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">{label} Code</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">{label} Desc</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">{label} Group</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Total Qty</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">UOM</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Till Indent</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Balance Qty</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Req Now</th>
               {shouldShowDescoping() && <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Descoping</th>}
               <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b">Remarks</th>
               <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="transition-colors hover:bg-gray-50">
                <td className="px-1.5 py-0.5 border-b text-center"><span className="text-[11px] font-medium text-gray-700">{index + 1}</span></td>
                
                 {/* WBS Dropdown - Updated to show Description */}
                <td className="px-1.5 py-0.5 border-b">
                   <select 
                     value={item.wbs || ""} 
                     onChange={(e) => handleItemChange(index, "wbs", e.target.value)} 
                     className="w-48 px-1.5 py-1 text-[11px] rounded focus:outline-none" 
                     style={{ border: `1px solid ${lightBorder}`, height: '26px' }}
                   >
                     <option value="">Select WBS</option>
                     {wbsList.map((wbs, i) => (
                       <option key={i} value={wbs.WBS}>
                         {wbs.WBS} - {wbs.PROJ_DESC}
                       </option>
                     ))}
                   </select>
                </td>

               
                {/* Sub WBS */}
                <td className="px-1.5 py-0.5 border-b">
                  <select value={item.subwbs || ""} onChange={(e) => handleItemChange(index, "subwbs", e.target.value)} disabled={!item.wbs} className="w-32 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}>
                    <option value="">Select Sub WBS</option>
                    {item.subwbsList?.map(s => <option key={s.SUBWBS} value={s.SUBWBS}>{s.SUBWBS}</option>)}
                  </select>
                </td>
                
                <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.wdesc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/></td>

                {/* Mat Code */}
                {/* <td className="px-2.5 py-1.5 border-b">
                   <select value={item.mat_code || ""} onChange={(e) => handleItemChange(index, "mat_code", e.target.value)} disabled={!item.subwbs} className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}>
                     <option value="">Select Mat</option>
                     {item.materialList?.map(m => <option key={m.MAT} value={m.MAT}>{m.MAT}</option>)}
                   </select>
                </td> */}

                {/* Mat Code Input with Suggestions */}
<td className="px-2.5 py-1.5 border-b">
  {/* The Input */}
  <input
    type="text"
    list={`mat-options-${index}`} // Link to the datalist ID
    value={item.mat_code || ""}
    placeholder="Search Mat..."
    disabled={!item.subwbs}
    onChange={(e) => handleItemChange(index, "mat_code", e.target.value)}
    className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100"
    style={{ border: `1px solid ${lightBorder}`, height: '26px' }}
  />

  {/* The Native Suggestion Engine */}
  <datalist id={`mat-options-${index}`}>
    {item.materialList?.map((m, i) => (
      <option key={i} value={m.MAT}>
        {m.MDESC || m.DESC}
      </option>
    ))}
  </datalist>
</td>

                <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.mat_desc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/></td>
                
                {/* Mat Group (Read Only) */}
                <td className="px-1.5 py-0.5 border-b">
                   <input type="text" value={item.mat_group || ""} readOnly className="w-28 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }} />
                </td>
                
                <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.quantity || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/></td>
                <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.uom || ""} readOnly className="w-16 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/></td>
                {/* <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.till_indent || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/></td> */}
               <td className="px-1.5 py-0.5 border-b">
  <input 
    type="number" // Changed to number for cleaner alignment
    value={getEffectiveTillIndent(item, index)} // <--- Use the new helper function
    readOnly 
    className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded" 
    style={{ border: `1px solid ${lightBorder}`, height: '26px' }}
  />
</td> 
                {/* <td className="px-1.5 py-0.5 border-b">
                   <input type="number" value={(Number(item.quantity) || 0) - (Number(item.till_indent) || 0)} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" style={{ borderColor: lightBorder, height: '26px' }}/>
                </td> */}
                <td className="px-1.5 py-0.5 border-b">
                <input 
  type="number" 
  value={getDynamicBalance(item, index)} 
  readOnly 
  className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" style={{ borderColor: lightBorder, height: '26px' }}
/>
                </td>

                <td className="px-1.5 py-0.5 border-b">
                   <input type="number" value={item.reqnow || ""} step="1" onChange={(e) => handleItemChange(index, "reqnow", e.target.value)} required className="w-24 px-1.5 py-1 text-[11px] rounded focus:outline-none" style={{ border: `1px solid ${lightBorder}`, height: "26px" }}/>
                </td>

                {shouldShowDescoping() && (
                  <td className="px-1.5 py-0.5 border-b">
                    <input type="text" value={item.descoping || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded text-center" style={{ border: `1px solid ${lightBorder}`, height: '26px', color: item.descoping === "Yes" ? '#ef4444' : 'inherit' }}/>
                  </td>
                )}

                <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.Remarks || ""} onChange={(e) => handleItemChange(index, "Remarks", e.target.value)} className="w-24 px-1.5 py-1 text-[11px] rounded focus:outline-none" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/></td>
                
                <td className="px-1.5 py-0.5 border-b text-center">
                  <button type="button" onClick={() => deleteRow(index)} className="p-1 text-red-600 transition-colors transform rounded hover:bg-red-50 hover:scale-110"><Trash2 className="w-3 h-3" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-none bg-opacity-40">
           <div className="p-6 text-center transform bg-white border-black rounded-lg shadow-lg border-1 w-72 hover:scale-105">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">Requested quantity cannot exceed balance quantity!</h2>
              <button className="bg-[#28556E] text-white px-4 py-1.5 rounded hover:bg-[#1f4357] transition-all text-sm font-medium" onClick={() => { setShowPopup(false); if(popupIndex !== null) handleItemChange(popupIndex, "reqnow", ""); }}>OK</button>
           </div>
        </div>
      )}
    </div>
  );
}