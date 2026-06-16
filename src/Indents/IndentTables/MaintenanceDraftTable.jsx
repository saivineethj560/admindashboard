// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import { Plus, Trash2 } from "lucide-react";
// import { API_BASE_URL_INDENT } from "../../Config";

// const MaintenanceDraftTable = ({
//   items,
//   setItems,
//   plant,
//   plantCode,
//   projectType,
//   indentType,
//   subTab,
//   isViewMode,
//   primaryColor = "#28556E",
//   lightBorder = "#7ba5b8",
// }) => {
//   const [wbsList, setWbsList] = useState([]);
//   const [subwbsList, setSubwbsList] = useState({});
//   const [matGroupList, setMatGroupList] = useState({});
//   const [matCodeList, setMatCodeList] = useState({});

//   // --- API Fetchers wrapped in useCallback to prevent stale closures ---
//   const fetchSubWBS = useCallback(async (index, wbsValue) => {
//     if (!plantCode || !wbsValue) return;
//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-subwbs-maint`, {
//         params: { plantCode, mainType: indentType, projectType, wbs: wbsValue }
//       });
//       setSubwbsList(prev => ({ ...prev, [index]: res.data }));
//     } catch (err) { console.error("Error fetching Sub WBS:", err); }
//   }, [plantCode, indentType, projectType]);

//   const fetchGroups = useCallback(async (index) => {
//     if (!plantCode) return;
//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mgrp`, { 
//         params: { plant: plantCode, mainType: indentType } 
//       });
//       setMatGroupList(prev => ({ ...prev, [index]: res.data }));
//     } catch (err) { console.error("Error fetching groups:", err); }
//   }, [plantCode, indentType]);

//   const fetchMaterials = useCallback(async (index, group) => {
//     if (!plantCode || !group) return;
//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mat-details`, {
//         params: { plant: plantCode, mainType: indentType, mat_group: group }
//       });
//       setMatCodeList(prev => ({ ...prev, [index]: res.data }));
//     } catch (err) { console.error("Error fetching materials:", err); }
//   }, [plantCode, indentType]);

//   // 1. Load Master WBS List
//   useEffect(() => {
//     if (!plantCode || !indentType || !projectType) return;
//     axios.get(`${API_BASE_URL_INDENT}/fetch-wbs-maint`, {
//         params: { plantCode, mainType: indentType, projectType },
//       })
//       .then((res) => setWbsList(res.data))
//       .catch((err) => console.error("Error fetching WBS:", err));
//   }, [plantCode, projectType, indentType]);

//   // 2. INITIALIZATION: Populate options for Draft Items
//   // Added [items] and [plantCode] to dependencies to ensure it runs when data arrives
//   useEffect(() => {
//     if (items?.length > 0 && wbsList.length > 0 && plantCode) {
//       items.forEach((item, index) => {
//         // Only fetch if data exists and list is not already fetched for this row
//         if (item.wbs && !subwbsList[index]) {
//           fetchSubWBS(index, item.wbs);
//         }
//         if (item.subwbs && !matGroupList[index]) {
//           fetchGroups(index);
//         }
//         if (item.mat_group && !matCodeList[index]) {
//           fetchMaterials(index, item.mat_group);
//         }
//       });
//     }
//   }, [wbsList, items, plantCode, fetchSubWBS, fetchGroups, fetchMaterials]);


//   const handleWbsChange = (index, value) => {
//     const updated = [...items];
//     updated[index] = {
//       ...updated[index],
//       wbs: value, subwbs: "", wdesc: "", mat_group: "", mat_code: "", 
//       mat_desc: "", uom: "", till_indent: 0, base_indent: 0, reqnow: ""
//     };
//     setItems(updated);
//     // Explicitly clear row lists when changing WBS
//     setSubwbsList(prev => ({ ...prev, [index]: [] }));
//     if (value) fetchSubWBS(index, value);
//   };

//   const handleSubWbsChange = (index, value) => {
//     const updated = [...items];
//     const selectedObj = (subwbsList[index] || []).find(s => s.SUBWBS === value);
//     updated[index] = {
//       ...updated[index],
//       subwbs: value,
//       wdesc: selectedObj ? selectedObj.WDESC : "",
//       mat_group: "", mat_code: "", mat_desc: "", uom: "", 
//       till_indent: 0, base_indent: 0, reqnow: ""
//     };
//     setItems(updated);
//     if (value) fetchGroups(index);
//   };

//   const handleMatGroupChange = async (index, value) => {
//     const updated = [...items];
//     updated[index].mat_group = value;
    
//     const specificGroups = matGroupList[index] || [];
//     const isValid = specificGroups.some(g => g.MAT_GROUP === value);

//     if (isValid) {
//         fetchMaterials(index, value);
//     } else {
//         updated[index].mat_code = "";
//         updated[index].mat_desc = "";
//     }
//     setItems(updated);
//   };

//   const handleMaterialChange = (index, value) => {
//     const updated = [...items];
//     updated[index].mat_code = value;

//     const specificList = matCodeList[index] || [];
//     const selectedData = specificList.find((m) => m.MAT === value);

//     if (selectedData) {
//         updated[index].mat_desc = selectedData.MDESC || selectedData.DESC || "";
//         updated[index].uom = selectedData.UNIT || selectedData.UOM || "";
//         updated[index].till_indent = "Loading..."; 
//         setItems(updated);

//         axios.get(`${API_BASE_URL_INDENT}/fetch-indent-data`, {
//            params: { plant, wbs: updated[index].subwbs, mat_code: value, mainType: indentType, projectType }
//         })
//         .then((res) => {
//            setItems((prev) => {
//                const newItems = [...prev];
//                if (newItems[index]) {
//                    newItems[index].till_indent = parseFloat(res.data.till_indent || 0);
//                    newItems[index].base_indent = parseFloat(res.data.till_indent || 0);
//                }
//                return newItems;
//            });
//         });
//     } else {
//         updated[index].mat_desc = "";
//         updated[index].uom = "";
//         updated[index].till_indent = "";
//         setItems(updated);
//     }
//   };

//   const getCalculatedIndent = (currentIndex) => {
//     const currentItem = items[currentIndex];
//     if (!currentItem.wbs || !currentItem.subwbs || !currentItem.mat_code) return 0;
    
//     let totalIndent = Number(currentItem.base_indent || 0);
//     for (let i = 0; i < currentIndex; i++) {
//       const prevItem = items[i];
//       if (prevItem.wbs === currentItem.wbs && prevItem.subwbs === currentItem.subwbs && prevItem.mat_code === currentItem.mat_code) {
//         totalIndent += Number(prevItem.reqnow || 0);
//       }
//     }
//     return totalIndent;
//   };

//   const addRow = () => {
//     setItems([...items, { 
//       wbs: "", subwbs: "", wdesc: "", mat_group: "", mat_code: "", 
//       mat_desc: "", uom: "", till_indent: "", base_indent: 0, reqnow: "", 
//       Remarks: "", descoping: "" 
//     }]);
//   };

//   const deleteRow = (index) => {
//     if (items.length > 1) setItems(items.filter((_, i) => i !== index));
//   };

//   const handleReqNowChange = (index, inputValue) => {
//     let value = inputValue === "" ? "" : Number(inputValue);
//     const updated = [...items];
//     updated[index].reqnow = value;
//     updated[index].descoping = value < 0 ? "Yes" : "";
//     setItems(updated);
//   };

//   const shouldShowDescoping = () => items.some(item => Number(item.reqnow) < 0);
//   const label = indentType === "Service" ? "Service" : "Material";

//   return (
//     <div className="mt-2">
//       <div className="flex items-center justify-between mb-2">
//         <button type="button" onClick={addRow} className="flex items-center gap-1 px-2 py-1 text-white text-[11px] rounded border-2 shadow-sm" style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>
//           <Plus className="w-3 h-3" /> Add Item
//         </button>
//       </div>

//       <div className="overflow-x-auto border-2 rounded-lg" style={{ borderColor: lightBorder }}>
//         <table className="w-full border-collapse min-w-max">
//           <thead>
//             <tr className="bg-gray-200">
//                {["Sno", "WBS Element", "Sub WBS", "SubWBS Desc", `${label} Group`, `${label} Code`, `${label} Desc`, "UOM", "Till Indent", "Req Now"].map(h => (
//                    <th key={h} className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{h}</th>
//                ))}
//                {shouldShowDescoping() && <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b whitespace-nowrap">Descoping</th>}
//                <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Remarks</th>
//                <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((item, index) => (
//               <tr key={index} className="transition-colors hover:bg-gray-50">
//                 <td className="px-1.5 py-0.5 border-b text-center text-[11px]" style={{ borderColor: lightBorder }}>{index + 1}</td>
                
//                 <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <select value={item.wbs || ""} onChange={(e) => handleWbsChange(index, e.target.value)} className="w-40 px-1.5 py-1 text-[11px] rounded outline-none border" style={{ borderColor: lightBorder, height: "26px" }}>
//                       <option value="">Select WBS</option>
//                       {wbsList.map((w, i) => <option key={i} value={w.WBS}>{w.WBS} - {w.PROJ_DESC}</option>)}
//                   </select>
//                 </td>

//                 <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <select value={item.subwbs || ""} disabled={!item.wbs} onChange={(e) => handleSubWbsChange(index, e.target.value)} className="w-32 px-1.5 py-1 text-[11px] rounded outline-none border" style={{ borderColor: lightBorder, height: "26px" }}>
//                       <option value="">Select Sub WBS</option>
//                       {subwbsList[index]?.map((s, i) => <option key={i} value={s.SUBWBS}>{s.SUBWBS}</option>)}
//                   </select>
//                 </td>

//                 <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                     <input type="text" value={item.wdesc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" style={{ borderColor: lightBorder, height: "26px" }} />
//                 </td>

//                 <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <input type="text" list={`mgrp-list-${index}`} value={item.mat_group || ""} disabled={!item.subwbs} onChange={(e) => handleMatGroupChange(index, e.target.value)} className="w-28 px-1.5 py-1 text-[11px] rounded outline-none border" style={{ borderColor: lightBorder, height: "26px" }} placeholder="Search..." />
//                   <datalist id={`mgrp-list-${index}`}>
//                       {matGroupList[index]?.map((g, i) => <option key={i} value={g.MAT_GROUP} />)}
//                   </datalist>
//                 </td>

//                 <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <input type="text" list={`mat-list-${index}`} value={item.mat_code || ""} disabled={!item.mat_group} onChange={(e) => handleMaterialChange(index, e.target.value)} className="w-28 px-1.5 py-1 text-[11px] rounded outline-none border" style={{ borderColor: lightBorder, height: "26px" }} placeholder="Search..." />
//                   <datalist id={`mat-list-${index}`}>
//                       {matCodeList[index]?.map((m, i) => <option key={i} value={m.MAT}>{m.MDESC || m.DESC}</option>)}
//                   </datalist>
//                 </td>

//                 <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.mat_desc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" style={{ borderColor: lightBorder, height: "26px" }} /></td>
//                 <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.uom || ""} readOnly className="w-12 px-1.5 py-1 text-[11px] bg-gray-50 rounded border text-center" style={{ borderColor: lightBorder, height: "26px" }} /></td>
//                 <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={getCalculatedIndent(index)} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border font-bold text-right" style={{ borderColor: lightBorder, height: "26px" }} /></td>

//                 <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <input type="number" value={item.reqnow || ""} onChange={(e) => handleReqNowChange(index, e.target.value)} className="w-20 px-1.5 py-1 text-[11px] rounded border outline-none text-right" style={{ borderColor: lightBorder, height: "26px" }} />
//                 </td>

//                 {shouldShowDescoping() && (
//                   <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                     <input type="text" value={item.descoping || ""} readOnly className="w-16 px-1.5 py-1 text-[11px] bg-gray-50 rounded text-center text-red-500 border" style={{ borderColor: lightBorder, height: '26px' }} />
//                   </td>
//                 )}

//                 <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <input type="text" value={item.Remarks || ""} onChange={(e) => setItems(prev => { const n=[...prev]; n[index].Remarks=e.target.value; return n; })} className="w-24 px-1.5 py-1 text-[11px] rounded border outline-none" style={{ borderColor: lightBorder, height: "26px" }} />
//                 </td>
                
//                 <td className="px-1.5 py-0.5 border-b text-center" style={{ borderColor: lightBorder }}>
//                   <button type="button" onClick={() => deleteRow(index)} className="p-1 text-red-600 transition-transform transform rounded hover:bg-red-50 hover:scale-110">
//                     <Trash2 className="w-3.5 h-3.5" />
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

// export default MaintenanceDraftTable;


import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
import { API_BASE_URL_INDENT } from "../../Config";

const MaintenanceDraftTable = ({
  items,
  setItems,
  plant,
  plantCode,
  projectType,
  indentType,
  subTab,
  isViewMode,
  primaryColor = "#28556E",
  lightBorder = "#7ba5b8",
}) => {
  const [wbsList, setWbsList] = useState([]);
  const [subwbsList, setSubwbsList] = useState({});
  const [matGroupList, setMatGroupList] = useState({});
  const [matCodeList, setMatCodeList] = useState({});

  // --- API Fetchers ---
  const fetchSubWBS = useCallback(async (index, wbsValue) => {
    if (!plantCode || !wbsValue) return;
    try {
      const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-subwbs-maint`, {
        params: { plantCode, mainType: indentType, projectType, wbs: wbsValue }
      });
      setSubwbsList(prev => ({ ...prev, [index]: res.data }));
    } catch (err) { console.error("Error fetching Sub WBS:", err); }
  }, [plantCode, indentType, projectType]);

  const fetchGroups = useCallback(async (index) => {
    if (!plantCode) return;
    try {
      const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mgrp`, { 
        params: { plant: plantCode, mainType: indentType } 
      });
      setMatGroupList(prev => ({ ...prev, [index]: res.data }));
    } catch (err) { console.error("Error fetching groups:", err); }
  }, [plantCode, indentType]);

  const fetchMaterials = useCallback(async (index, group) => {
    if (!plantCode || !group) return;
    try {
      const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mat-details`, {
        params: { plant: plantCode, mainType: indentType, mat_group: group }
      });
      setMatCodeList(prev => ({ ...prev, [index]: res.data }));
    } catch (err) { console.error("Error fetching materials:", err); }
  }, [plantCode, indentType]);

  // 1. Load Master WBS List
  useEffect(() => {
    if (!plantCode || !indentType || !projectType) return;
    axios.get(`${API_BASE_URL_INDENT}/fetch-wbs-maint`, {
        params: { plantCode, mainType: indentType, projectType },
      })
      .then((res) => setWbsList(res.data))
      .catch((err) => console.error("Error fetching WBS:", err));
  }, [plantCode, projectType, indentType]);

  // 2. INITIALIZATION: Populate options for Draft Items
  useEffect(() => {
    if (items?.length > 0 && wbsList.length > 0 && plantCode) {
      items.forEach((item, index) => {
        if (item.wbs && !subwbsList[index]) fetchSubWBS(index, item.wbs);
        if (item.subwbs && !matGroupList[index]) fetchGroups(index);
        if (item.mat_group && !matCodeList[index]) fetchMaterials(index, item.mat_group);
      });
    }
  }, [wbsList, items, plantCode, fetchSubWBS, fetchGroups, fetchMaterials]);


  const handleWbsChange = (index, value) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      wbs: value, subwbs: "", wdesc: "", mat_group: "", mat_code: "", 
      mat_desc: "", short_text: "", uom: "", till_indent: 0, base_indent: 0, reqnow: ""
    };
    setItems(updated);
    setSubwbsList(prev => ({ ...prev, [index]: [] }));
    if (value) fetchSubWBS(index, value);
  };

  const handleSubWbsChange = (index, value) => {
    const updated = [...items];
    const selectedObj = (subwbsList[index] || []).find(s => s.SUBWBS === value);
    updated[index] = {
      ...updated[index],
      subwbs: value,
      wdesc: selectedObj ? selectedObj.WDESC : "",
      mat_group: "", mat_code: "", mat_desc: "", short_text: "", uom: "", 
      till_indent: 0, base_indent: 0, reqnow: ""
    };
    setItems(updated);
    if (value) fetchGroups(index);
  };

  const handleMatGroupChange = async (index, value) => {
    const updated = [...items];
    updated[index].mat_group = value;
    const specificGroups = matGroupList[index] || [];
    const isValid = specificGroups.some(g => g.MAT_GROUP === value);

    if (isValid) {
        fetchMaterials(index, value);
    } else {
        updated[index].mat_code = "";
        updated[index].mat_desc = "";
        updated[index].short_text = "";
    }
    setItems(updated);
  };

  const handleMaterialChange = (index, value) => {
    const updated = [...items];
    updated[index].mat_code = value;

    const specificList = matCodeList[index] || [];
    const selectedData = specificList.find((m) => m.MAT === value);

    if (selectedData) {
        updated[index].mat_desc = selectedData.MDESC || selectedData.DESC || "";
        updated[index].uom = selectedData.UNIT || selectedData.UOM || "";
        // ✅ Populating short_text from fetched material data
        updated[index].short_text = selectedData.SHORT_TEXT || selectedData.MDESC || "";
        updated[index].till_indent = "Loading..."; 
        setItems(updated);

        axios.get(`${API_BASE_URL_INDENT}/fetch-indent-data`, {
           params: { plant, wbs: updated[index].subwbs, mat_code: value, mainType: indentType, projectType }
        })
        .then((res) => {
           setItems((prev) => {
               const newItems = [...prev];
               if (newItems[index]) {
                   newItems[index].till_indent = parseFloat(res.data.till_indent || 0);
                   newItems[index].base_indent = parseFloat(res.data.till_indent || 0);
               }
               return newItems;
           });
        });
    } else {
        updated[index].mat_desc = "";
        updated[index].uom = "";
        updated[index].short_text = "";
        updated[index].till_indent = "";
        setItems(updated);
    }
  };

  const getCalculatedIndent = (currentIndex) => {
    const currentItem = items[currentIndex];
    if (!currentItem.wbs || !currentItem.subwbs || !currentItem.mat_code) return 0;
    
    let totalIndent = Number(currentItem.base_indent || 0);
    for (let i = 0; i < currentIndex; i++) {
      const prevItem = items[i];
      if (prevItem.wbs === currentItem.wbs && prevItem.subwbs === currentItem.subwbs && prevItem.mat_code === currentItem.mat_code) {
        totalIndent += Number(prevItem.reqnow || 0);
      }
    }
    return totalIndent;
  };

  const addRow = () => {
    setItems([...items, { 
      wbs: "", subwbs: "", wdesc: "", mat_group: "", mat_code: "", 
      mat_desc: "", short_text: "", uom: "", till_indent: "", base_indent: 0, reqnow: "", 
      Remarks: "", descoping: "" 
    }]);
  };

  const deleteRow = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const handleReqNowChange = (index, inputValue) => {
    let value = inputValue === "" ? "" : Number(inputValue);
    const updated = [...items];
    updated[index].reqnow = value;
    updated[index].descoping = value < 0 ? "Yes" : "";
    setItems(updated);
  };

  const shouldShowDescoping = () => items.some(item => Number(item.reqnow) < 0);
  const label = indentType === "Service" ? "Service" : "Material";

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={addRow} className="flex items-center gap-1 px-2 py-1 text-white text-[11px] rounded border-2 shadow-sm" style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>
          <Plus className="w-3 h-3" /> Add Item
        </button>
      </div>

      <div className="overflow-x-auto border-2 rounded-lg" style={{ borderColor: lightBorder }}>
        <table className="w-full border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-200">
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Sno</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>WBS Element</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Sub WBS</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Sub WBS Desc</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{label} Group</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{label} Code</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{label} Desc</th>
               
               {/* ✅ Conditional Short Text Header */}
               {indentType === "Service" && (
                 <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Short Text</th>
               )}

               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>UOM</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Till Indent</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Req Qty</th>
               {shouldShowDescoping() && <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b whitespace-nowrap">Descoping</th>}
               <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Remarks</th>
               <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="transition-colors hover:bg-gray-50">
                <td className="px-1.5 py-0.5 border-b text-center text-[11px]" style={{ borderColor: lightBorder }}>{index + 1}</td>
                
                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                  <select value={item.wbs || ""} onChange={(e) => handleWbsChange(index, e.target.value)} className="w-40 px-1.5 py-1 text-[11px] rounded outline-none border" style={{ borderColor: lightBorder, height: "26px" }}>
                      <option value="">Select WBS</option>
                      {wbsList.map((w, i) => <option key={i} value={w.WBS}>{w.WBS} - {w.PROJ_DESC}</option>)}
                  </select>
                </td>

                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                  <select value={item.subwbs || ""} disabled={!item.wbs} onChange={(e) => handleSubWbsChange(index, e.target.value)} className="w-32 px-1.5 py-1 text-[11px] rounded outline-none border" style={{ borderColor: lightBorder, height: "26px" }}>
                      <option value="">Select Sub WBS</option>
                      {subwbsList[index]?.map((s, i) => <option key={i} value={s.SUBWBS}>{s.SUBWBS}</option>)}
                  </select>
                </td>

                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                    <input type="text" value={item.wdesc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" style={{ borderColor: lightBorder, height: "26px" }} />
                </td>

                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                  <input type="text" list={`mgrp-list-${index}`} value={item.mat_group || ""} disabled={!item.subwbs} onChange={(e) => handleMatGroupChange(index, e.target.value)} className="w-28 px-1.5 py-1 text-[11px] rounded outline-none border" style={{ borderColor: lightBorder, height: "26px" }} placeholder="Search..." />
                  <datalist id={`mgrp-list-${index}`}>
                      {matGroupList[index]?.map((g, i) => <option key={i} value={g.MAT_GROUP} />)}
                  </datalist>
                </td>

                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                  <input type="text" list={`mat-list-${index}`} value={item.mat_code || ""} disabled={!item.mat_group} onChange={(e) => handleMaterialChange(index, e.target.value)} className="w-28 px-1.5 py-1 text-[11px] rounded outline-none border" style={{ borderColor: lightBorder, height: "26px" }} placeholder="Search..." />
                  <datalist id={`mat-list-${index}`}>
                      {matCodeList[index]?.map((m, i) => <option key={i} value={m.MAT}>{m.MDESC || m.DESC}</option>)}
                  </datalist>
                </td>

                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.mat_desc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" style={{ borderColor: lightBorder, height: "26px" }} /></td>

                {/* ✅ Conditional Short Text Cell */}
                {/* ✅ Draggable Manual Short Text Cell */}
{indentType === "Service" && (
  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
    <textarea 
      value={item.short_text || ""} 
      maxLength={40}
      onChange={(e) => setItems(prev => {
          const n = [...prev];
          n[index].short_text = e.target.value;
          return n;
      })}
      rows="1"
      placeholder="Edit details..."
      className="w-32 px-1.5 py-1 text-[11px] bg-white rounded block outline-none" 
      style={{ 
        border: `1px solid ${lightBorder}`, 
        height: '26px',          
        minHeight: '26px',       
        minWidth: '128px',       
        resize: 'both',          
        overflow: 'auto',        
        lineHeight: '1.2'
      }}
    />
  </td>
)}
                {/* {indentType === "Service" && (
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                    <input type="text" value={item.short_text || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" style={{ borderColor: lightBorder, height: "26px" }} />
                  </td>
                )} */}

                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.uom || ""} readOnly className="w-12 px-1.5 py-1 text-[11px] bg-gray-50 rounded border text-center" style={{ borderColor: lightBorder, height: "26px" }} /></td>
                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={getCalculatedIndent(index)} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border font-bold text-right" style={{ borderColor: lightBorder, height: "26px" }} /></td>

                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                  <input type="number" value={item.reqnow || ""} onChange={(e) => handleReqNowChange(index, e.target.value)} className="w-20 px-1.5 py-1 text-[11px] rounded border outline-none text-right" style={{ borderColor: lightBorder, height: "26px" }} />
                </td>

                {shouldShowDescoping() && (
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                    <input type="text" value={item.descoping || ""} readOnly className="w-16 px-1.5 py-1 text-[11px] bg-gray-50 rounded text-center text-red-500 border" style={{ borderColor: lightBorder, height: '26px' }} />
                  </td>
                )}

                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                  <input type="text" value={item.Remarks || ""} onChange={(e) => setItems(prev => { const n=[...prev]; n[index].Remarks=e.target.value; return n; })} className="w-24 px-1.5 py-1 text-[11px] rounded border outline-none" style={{ borderColor: lightBorder, height: "26px" }} />
                </td>
                
                <td className="px-1.5 py-0.5 border-b text-center" style={{ borderColor: lightBorder }}>
                  <button type="button" onClick={() => deleteRow(index)} className="p-1 text-red-600 transition-transform transform rounded hover:bg-red-50 hover:scale-110">
                    <Trash2 className="w-3.5 h-3.5" />
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

export default MaintenanceDraftTable;

