import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from 'lucide-react';
import axios from "axios";
import { API_BASE_URL } from "../../Config";

export default function RMCTable({ items, setItems, plant, projectType, mainType, primaryColor, lightBorder }) {
  
  const [costCenters, setCostCenters] = useState([]); 

  // --- API 1: Fetch Cost Centers ---
  useEffect(() => {
    if (!plant) {
        setCostCenters([]);
        return;
    }
    axios.get(`${API_BASE_URL}/fetch-cost-centers`, {
        params: { plant: plant }
    })
      .then((res) => {
        setCostCenters(res.data);
      })
      .catch((err) => console.error("Error fetching cost centers:", err));
  }, [plant]);

  const addRow = () => {
    setItems([...items, { 
      wbs: "", subwbs: "", wdesc:"", mat_code: "", mat_group:"", Remarks:"",
      mat_desc: "", uom: "", quantity: "", 
      base_indent: 0, // NEW: Stores the original value from DB
      reqnow: "",
      descoping: "", subwbsList: [], materialList: [], matGroupList: [] 
    }]);
  };

  const deleteRow = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
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

  const handleItemChange = async (index, field, value) => {
    const newItems = [...items];

    // --- 1. Cost Center Change ---
    if (field === "wbs") {
      const selectedCC = costCenters.find((c) => c.WBS === value);

      newItems[index] = {
        ...newItems[index],
        wbs: value,
        wdesc: selectedCC ? selectedCC.WDESC : "",
        subwbs: "", 
        mat_code: "", mat_desc: "", uom: "",
        quantity: "", 
        base_indent: 0, // Reset base indent
        reqnow: "", mat_group:"",
        matGroupList: [], 
        materialList: [], 
      };
      
      if (value) {
          try {
            const res = await axios.get(`${API_BASE_URL}/fetch-mgrp`, {
              params: { plant: plant, mainType: mainType }
            });
            newItems[index].matGroupList = res.data; 
          } catch (err) { 
            console.error("Error fetching groups", err);
            newItems[index].matGroupList = []; 
          }
      }

    } 
    // --- 2. Material Group Change ---
    // else if (field === "mat_group") {
    //     newItems[index] = {
    //         ...newItems[index],
    //         mat_group: value,
    //         mat_code: "", mat_desc: "", uom: "",
    //         materialList: [] 
    //     };

    //     if (value) {
    //         try {
    //             const res = await axios.get(`${API_BASE_URL}/fetch-mat-details`, {
    //                 params: { plant: plant, mainType: mainType, mat_group: value }
    //             });
    //             newItems[index].materialList = res.data;
    //         } catch (err) {
    //             console.error("Error fetching materials", err);
    //             newItems[index].materialList = [];
    //         }
    //     }
    // }
    // // --- 3. Material Code Change ---
    // else if (field === "mat_code") {
    //    const selectedMaterial = newItems[index].materialList?.find((m) => m.MAT === value);
       
    //    newItems[index] = {
    //      ...newItems[index],
    //      mat_code: value,
    //      mat_desc: selectedMaterial?.MDESC || selectedMaterial?.DESC || "",
    //      uom: selectedMaterial?.UNIT || selectedMaterial?.UOM || "",
    //      base_indent: 0, // Reset base indent while loading
    //    };

    //    if (value) {
    //      const requestParams = {
    //         plant: plant,
    //         wbs: newItems[index].wbs,
    //         mat_code: value,
    //         mainType: mainType,
    //         projectType: projectType
    //      };

    //      axios.get(`${API_BASE_URL}/fetch-indent-data`, { params: requestParams })
    //      .then((res) => {
    //         setItems((prevItems) => {
    //             const updatedItems = [...prevItems];
    //             if (updatedItems[index]) {
    //                 // STORE API DATA IN 'base_indent', NOT directly in the visible field
    //                 updatedItems[index].base_indent = res.data.till_indent || 0; 
    //             }
    //             return updatedItems;
    //         });
    //      })
    //      .catch((err) => {
    //         console.error("Error fetching till indent:", err);
    //      });
    //    }
    // } 


      // --- 2. Material Group Change (Suggestion Logic) ---
    else if (field === "mat_group") {
        newItems[index].mat_group = value;
        
        // Check if the typed value exists in the group list
        const isValidGroup = newItems[index].matGroupList?.find(g => g.MAT_GROUP === value);

        if (isValidGroup) {
            try {
                const res = await axios.get(`${API_BASE_URL}/fetch-mat-details`, {
                    params: { plant: plant, mainType: mainType, mat_group: value }
                });
                newItems[index].materialList = res.data;
            } catch (err) { newItems[index].materialList = []; }
        } else {
            // Clear materials if user is just typing or clears the group
            newItems[index].materialList = [];
            newItems[index].mat_code = "";
            newItems[index].mat_desc = "";
        }
    }
    // --- 3. Material Code Change (Suggestion Logic) ---
    else if (field === "mat_code") {
       newItems[index].mat_code = value;
       const selectedMaterial = newItems[index].materialList?.find((m) => m.MAT === value);
       
       if (selectedMaterial) {
         newItems[index].mat_desc = selectedMaterial.MDESC || selectedMaterial.DESC || "";
         newItems[index].uom = selectedMaterial.UNIT || selectedMaterial.UOM || "";

         // Fetch Indent Data
         axios.get(`${API_BASE_URL}/fetch-indent-data`, { 
             params: { plant, wbs: newItems[index].wbs, mat_code: value, mainType, projectType } 
         })
         .then((res) => {
            setItems((prev) => {
                const updated = [...prev];
                if (updated[index]) updated[index].base_indent = res.data.till_indent || 0;
                return updated;
            });
         });
       } else {
           newItems[index].mat_desc = "";
           newItems[index].uom = "";
           newItems[index].base_indent = 0;
       }
    } 
    // --- 4. Logic for Req Now & Descoping ---
    else if (field === "reqnow") {
       let valNum = value === "" ? "" : Number(value);
       if (valNum < 0) {
          newItems[index].reqnow = valNum;
          newItems[index].descoping = "Yes";
       } else {
          newItems[index].reqnow = valNum;
          newItems[index].descoping = "";
       }
    } else {
      newItems[index][field] = value;
    }

    setItems(newItems);
  };

  const shouldShowDescoping = () => items.some(item => Number(item.reqnow) < 0);
const label = mainType === "Service" ? "Service" : "Material";
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <button type="button" onClick={addRow} className="flex items-center gap-1 px-2 py-1 text-white text-[11px] rounded border-2" style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>
          <Plus className="w-3 h-3" /> Add RMC Item
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm" style={{ borderColor: lightBorder }}>
        <table className="w-full border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-200">
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">S.No</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Cost Center</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Cost Center Desc</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">{label} Group</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">{label} Code</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">{label} Desc</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">UOM</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Till Indent</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Req Now</th>
               {shouldShowDescoping() && <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Descoping</th>}
               <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b">Remarks</th>
               <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-1.5 py-0.5 border-b text-center"><span className="text-[11px] font-medium text-gray-700">{index + 1}</span></td>
                
                {/* Cost Center Dropdown */}
                <td className="px-1.5 py-0.5 border-b">
                   <select value={item.wbs || ""} onChange={(e) => handleItemChange(index, "wbs", e.target.value)} className="w-32 px-1.5 py-1 text-[11px] rounded focus:outline-none" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}>
                     <option value="">Select CC</option>
                     {costCenters.map((c, i) => (
                        <option key={i} value={c.WBS}>{c.WBS}</option>
                     ))}
                   </select>
                </td>

                <td className="px-1.5 py-0.5 border-b">
                    <input type="text" value={item.wdesc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/>
                </td>

                {/* <td className="px-1.5 py-0.5 border-b">
                   <select value={item.mat_group || ""} onChange={(e) => handleItemChange(index, "mat_group", e.target.value)} disabled={!item.wbs} className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}>
                     <option value="">Select Group</option>
                     {item.matGroupList?.map((g, i) => (
                        <option key={i} value={g.MAT_GROUP}>{g.MAT_GROUP}</option>
                     ))}
                   </select>
                </td>

                <td className="px-2.5 py-1.5 border-b">
                   <select value={item.mat_code || ""} onChange={(e) => handleItemChange(index, "mat_code", e.target.value)} disabled={!item.mat_group} className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}>
                     <option value="">Select Mat</option>
                     {item.materialList?.map(m => (
                        <option key={m.MAT} value={m.MAT}>
                             {m.MAT} - {m.MDESC}
                        </option>
                     ))}
                   </select>
                </td> */}


                 {/* Material Group Suggestion Input */}
                <td className="px-1.5 py-0.5 border-b">
                   <input 
                    type="text"
                    list={`mgrp-list-${index}`}
                    value={item.mat_group || ""}
                    placeholder="Search..."
                    disabled={!item.wbs}
                    onChange={(e) => handleItemChange(index, "mat_group", e.target.value)}
                    className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100" 
                    style={{ border: `1px solid ${lightBorder}`, height: '26px' }}
                   />
                   <datalist id={`mgrp-list-${index}`}>
                      {item.matGroupList?.map((g, i) => <option key={i} value={g.MAT_GROUP} />)}
                   </datalist>
                </td>

                {/* Material Code Suggestion Input */}
                <td className="px-2.5 py-1.5 border-b">
                   <input 
                    type="text"
                    list={`mat-list-${index}`}
                    value={item.mat_code || ""}
                    placeholder="Search..."
                    disabled={!item.mat_group}
                    onChange={(e) => handleItemChange(index, "mat_code", e.target.value)}
                    className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100" 
                    style={{ border: `1px solid ${lightBorder}`, height: '26px' }}
                   />
                   <datalist id={`mat-list-${index}`}>
                      {item.materialList?.map((m, i) => (
                        <option key={i} value={m.MAT}>{m.MDESC || m.DESC}</option>
                      ))}
                   </datalist>
                </td>

                <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.mat_desc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/></td>
                
                <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.uom || ""} readOnly className="w-16 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/></td>
                
                {/* TILL INDENT - CHANGED TO CALCULATED VALUE */}
                <td className="px-1.5 py-0.5 border-b">
                    <input 
                      type="text" 
                      value={getCalculatedIndent(index)} // Calls function instead of state directly
                      readOnly 
                      className="w-24 px-1.5 py-1 text-[11px] rounded focus:outline-none bg-gray-50 font-bold" 
                      style={{ border: `1px solid ${lightBorder}`, height: '26px' }}
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
                  <button type="button" onClick={() => deleteRow(index)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors transform hover:scale-110"><Trash2 className="w-3 h-3" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}