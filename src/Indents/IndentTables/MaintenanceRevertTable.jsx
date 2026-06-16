// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { API_BASE_URL_INDENT } from "../../Config";

// const MaintenanceRevertTable = ({
//   items,
//   setItems,
//   plant,
//   projectType,
//   indentType,
//   isViewMode,
//   primaryColor,
//   lightBorder,
// }) => {
//   const [plantCode, setPlantCode] = useState("");
//   const [wbsList, setWbsList] = useState([]);
//   const [subWbsList, setSubWbsList] = useState({});
//   const [matGroupList, setMatGroupList] = useState({});
//   const [matCodeList, setMatCodeList] = useState({});

//   // 1. Extract Plant Code
//   useEffect(() => {
//     if (plant) {
//       const extractedCode = plant.split("-")[0].trim();
//       setPlantCode(extractedCode);
//     }
//   }, [plant]);

//   // 2. Fetch Initial WBS List
//   useEffect(() => {
//     if (!plantCode || !indentType || !projectType) return;
//     axios.get(`${API_BASE_URL_INDENT}/fetch-wbs-maint`, {
//       params: { plantCode, mainType: indentType, projectType },
//     })
//     .then((res) => setWbsList(res.data))
//     .catch((err) => console.error(err));
//   }, [plantCode, projectType, indentType]);

//   // --- Fetch Helpers ---
//   const fetchSubWBS = useCallback(async (index, wbsValue) => {
//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-subwbs-maint`, {
//         params: { plantCode, mainType: indentType, projectType, wbs: wbsValue },
//       });
//       setSubWbsList((prev) => ({ ...prev, [index]: res.data }));
//     } catch (err) { console.error(err); }
//   }, [plantCode, indentType, projectType]);

//   const fetchGroups = useCallback(async (index) => {
//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mgrp`, {
//         params: { plant: plantCode, mainType: indentType }
//       });
//       setMatGroupList((prev) => ({ ...prev, [index]: res.data }));
//     } catch (err) { console.error(err); }
//   }, [plantCode, indentType]);

//   const fetchMaterials = useCallback(async (index, groupValue) => {
//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mat-details`, {
//         params: { plant: plantCode, mainType: indentType, mat_group: groupValue }
//       });
//       setMatCodeList((prev) => ({ ...prev, [index]: res.data }));
//     } catch (err) { console.error(err); }
//   }, [plantCode, indentType]);

//   // --- 3. Initialization logic: Fetch the lists for existing data ---
//   useEffect(() => {
//     if (items?.length > 0 && plantCode && wbsList.length > 0) {
//       items.forEach((item, index) => {
//         if (item.wbs && !subWbsList[index]) fetchSubWBS(index, item.wbs);
//         if (item.subwbs && !matGroupList[index]) fetchGroups(index);
//         if (item.mat_group && !matCodeList[index]) fetchMaterials(index, item.mat_group);
//       });
//     }
//   }, [plantCode, wbsList, items?.length]);

//   // --- 4. NEW: SYNC DESCRIPTION LOGIC ---
//   // This runs when subWbsList is updated. It finds the matching WDESC and puts it in the item.
//   useEffect(() => {
//     const updatedItems = [...items];
//     let changed = false;

//     items.forEach((item, index) => {
//       // If we have a subwbs value but the description is missing or "Loading..."
//       if (item.subwbs && (!item.wdesc || item.wdesc === "Loading...")) {
//         const list = subWbsList[index];
//         if (list) {
//           const match = list.find(s => s.SUBWBS === item.subwbs);
//           if (match && match.WDESC) {
//             updatedItems[index].wdesc = match.WDESC;
//             changed = true;
//           }
//         }
//       }
//     });

//     if (changed) {
//       setItems(updatedItems);
//     }
//   }, [subWbsList]); // Trigger whenever subWbsList is populated

//   const handleWbsChange = (index, value) => {
//     const updated = [...items];
//     updated[index] = {
//       ...updated[index],
//       wbs: value, subwbs: "", wdesc: "Loading...", mat_group: "", mat_code: "",
//       mat_desc: "", uom: "", till_indent: 0, reqnow: ""
//     };
//     setItems(updated);
//     if (value) fetchSubWBS(index, value);
//   };

//   const handleSubWbsChange = (index, value) => {
//     const updated = [...items];
//     const selectedSub = subWbsList[index]?.find(s => s.SUBWBS === value);
//     updated[index] = {
//       ...updated[index],
//       subwbs: value,
//       wdesc: selectedSub ? selectedSub.WDESC : "Loading...",
//       mat_group: "", mat_code: "", mat_desc: "", uom: "", till_indent: 0, reqnow: ""
//     };
//     setItems(updated);
//     if (value) fetchGroups(index);
//   };

//   const handleMatGroupChange = (index, value) => {
//     const updated = [...items];
//     updated[index].mat_group = value;
//     updated[index].mat_code = "";
//     setItems(updated);
//     if (value) fetchMaterials(index, value);
//   };

//   const handleMaterialChange = async (index, value) => {
//     const updated = [...items];
//     updated[index].mat_code = value;
//     const selectedData = matCodeList[index]?.find(m => m.MAT === value);

//     if (selectedData) {
//       updated[index].mat_desc = selectedData.MDESC || selectedData.DESC || "";
//       updated[index].uom = selectedData.UNIT || selectedData.UOM || "";
//       updated[index].till_indent = "Loading...";
//       setItems(updated);

//       try {
//         const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-indent-data`, {
//           params: { plant: plantCode, wbs: updated[index].subwbs, mat_code: value, mainType: indentType, projectType }
//         });
//         setItems(prev => {
//           const u = [...prev];
//           if (u[index]) {
//             u[index].till_indent = res.data.till_indent ?? 0;
//             u[index].base_indent = res.data.till_indent ?? 0;
//           }
//           return u;
//         });
//       } catch (err) { console.error(err); }
//     }
//   };

//   const handleReqNowChange = (index, valueRaw) => {
//     let value = valueRaw === "" ? "" : Number(valueRaw);
//     const updated = [...items];
//     updated[index].reqnow = value;
//     updated[index].descoping = value < 0 ? "Yes" : "";

//     if (index + 1 < updated.length) {
//       const nextIdx = index + 1;
//       const currentTill = parseFloat(updated[index].till_indent) || 0;
//       const currentReq = Number(value) || 0;
//       updated[nextIdx].till_indent = (currentTill + currentReq);
//     }
//     setItems(updated);
//   };

//   const label = indentType === "Service" ? "Service" : "Material";

//   return (
//     <div className="overflow-x-auto border-2 rounded-lg" style={{ borderColor: lightBorder }}>
//       <table className="w-full border-collapse min-w-max">
//         <thead>
//           <tr className="bg-gray-200">
//             {["Sno", "WBS Element", "Sub WBS", "SubWBS Desc", `${label} Group`, `${label} Code`, `${label} Desc`, "UOM", "Till Indent", "Req Now", "Remarks"].map(h => (
//               <th key={h} className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{h}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {items.map((item, index) => (
//             <tr key={index} className="transition-colors hover:bg-gray-50">
//               <td className="px-1.5 py-0.5 border-b text-center text-[11px]" style={{ borderColor: lightBorder }}>{index + 1}</td>
              
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <select className="w-40 px-1.5 py-1 text-[11px] rounded border" value={item.wbs || ""} onChange={(e) => handleWbsChange(index, e.target.value)} disabled={isViewMode}>
//                   <option value="">Select WBS</option>
//                   {wbsList.map((w, i) => <option key={i} value={w.WBS}>{w.WBS} - {w.PROJ_DESC}</option>)}
//                 </select>
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <select className="w-32 px-1.5 py-1 text-[11px] rounded border" value={item.subwbs || ""} disabled={isViewMode || !item.wbs} onChange={(e) => handleSubWbsChange(index, e.target.value)}>
//                     <option value="">Select SubWBS</option>
//                     {!subWbsList[index] && item.subwbs && <option value={item.subwbs}>{item.subwbs}</option>}
//                     {subWbsList[index]?.map((s, i) => <option key={i} value={s.SUBWBS}>{s.SUBWBS}</option>)}
//                 </select>
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <input type="text" value={item.wdesc ?? ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" />
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <select className="w-28 px-1.5 py-1 text-[11px] rounded border" value={item.mat_group || ""} disabled={isViewMode || !item.subwbs} onChange={(e) => handleMatGroupChange(index, e.target.value)}>
//                     <option value="">Select Group</option>
//                     {!matGroupList[index] && item.mat_group && <option value={item.mat_group}>{item.mat_group}</option>}
//                     {matGroupList[index]?.map((g, i) => <option key={i} value={g.MAT_GROUP}>{g.MAT_GROUP}</option>)}
//                   </select>
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <select className="w-28 px-1.5 py-1 text-[11px] rounded border" value={item.mat_code || ""} disabled={isViewMode || !item.mat_group} onChange={(e) => handleMaterialChange(index, e.target.value)}>
//                     <option value="">Select Code</option>
//                     {!matCodeList[index] && item.mat_code && <option value={item.mat_code}>{item.mat_code}</option>}
//                     {matCodeList[index]?.map((m, i) => <option key={i} value={m.MAT}>{m.MAT}</option>)}
//                   </select>
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.mat_desc ?? ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" /></td>
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.uom ?? ""} readOnly className="w-12 px-1.5 py-1 text-[11px] bg-gray-50 rounded border text-center" /></td>
              
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 {/* STRICT NULL CHECK ?? 0 shows the value even if it is 0 */}
//                 <input type="text" value={item.till_indent ?? 0} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border font-bold text-right" />
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <input type="number" value={item.reqnow ?? ""} onChange={(e) => handleReqNowChange(index, e.target.value)} className="w-20 px-1.5 py-1 text-[11px] rounded border outline-none text-right" disabled={isViewMode} />
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                  <input type="text" value={item.Remarks ?? ""} onChange={(e) => { const u = [...items]; u[index].Remarks = e.target.value; setItems(u); }} className="w-24 px-1.5 py-1 text-[11px] rounded border outline-none" disabled={isViewMode} />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default MaintenanceRevertTable;


// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { API_BASE_URL_INDENT } from "../../Config";

// const MaintenanceRevertTable = ({
//   items,
//   setItems,
//   plant,
//   projectType,
//   indentType,
//   isViewMode,
//   primaryColor,
//   lightBorder,
// }) => {
//   const [plantCode, setPlantCode] = useState("");
//   const [wbsList, setWbsList] = useState([]);
//   const [subWbsList, setSubWbsList] = useState({});
//   const [matGroupList, setMatGroupList] = useState({});
//   const [matCodeList, setMatCodeList] = useState({});

//   // 1. Extract Plant Code
//   useEffect(() => {
//     if (plant) {
//       const extractedCode = plant.split("-")[0].trim();
//       setPlantCode(extractedCode);
//     }
//   }, [plant]);

//   // 2. Fetch Initial WBS List
//   useEffect(() => {
//     if (!plantCode || !indentType || !projectType) return;
//     axios.get(`${API_BASE_URL_INDENT}/fetch-wbs-maint`, {
//       params: { plantCode, mainType: indentType, projectType },
//     })
//     .then((res) => setWbsList(res.data))
//     .catch((err) => console.error(err));
//   }, [plantCode, projectType, indentType]);

//   // --- Fetch Helpers ---
//   const fetchSubWBS = useCallback(async (index, wbsValue) => {
//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-subwbs-maint`, {
//         params: { plantCode, mainType: indentType, projectType, wbs: wbsValue },
//       });
//       setSubWbsList((prev) => ({ ...prev, [index]: res.data }));
//     } catch (err) { console.error(err); }
//   }, [plantCode, indentType, projectType]);

//   const fetchGroups = useCallback(async (index) => {
//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mgrp`, {
//         params: { plant: plantCode, mainType: indentType }
//       });
//       setMatGroupList((prev) => ({ ...prev, [index]: res.data }));
//     } catch (err) { console.error(err); }
//   }, [plantCode, indentType]);

//   const fetchMaterials = useCallback(async (index, groupValue) => {
//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mat-details`, {
//         params: { plant: plantCode, mainType: indentType, mat_group: groupValue }
//       });
//       setMatCodeList((prev) => ({ ...prev, [index]: res.data }));
//     } catch (err) { console.error(err); }
//   }, [plantCode, indentType]);

//   // --- 3. Initialization logic: Fetch the lists for existing data ---
//   useEffect(() => {
//     if (items?.length > 0 && plantCode && wbsList.length > 0) {
//       items.forEach((item, index) => {
//         if (item.wbs && !subWbsList[index]) fetchSubWBS(index, item.wbs);
//         if (item.subwbs && !matGroupList[index]) fetchGroups(index);
//         if (item.mat_group && !matCodeList[index]) fetchMaterials(index, item.mat_group);
//       });
//     }
//   }, [plantCode, wbsList, items?.length]);

//   // --- 4. NEW: SYNC DESCRIPTION LOGIC ---
//   useEffect(() => {
//     const updatedItems = [...items];
//     let changed = false;

//     items.forEach((item, index) => {
//       if (item.subwbs && (!item.wdesc || item.wdesc === "Loading...")) {
//         const list = subWbsList[index];
//         if (list) {
//           const match = list.find(s => s.SUBWBS === item.subwbs);
//           if (match && match.WDESC) {
//             updatedItems[index].wdesc = match.WDESC;
//             changed = true;
//           }
//         }
//       }
//     });

//     if (changed) {
//       setItems(updatedItems);
//     }
//   }, [subWbsList]);

//   const handleWbsChange = (index, value) => {
//     const updated = [...items];
//     updated[index] = {
//       ...updated[index],
//       wbs: value, subwbs: "", wdesc: "Loading...", mat_group: "", mat_code: "",
//       mat_desc: "", short_text: "", uom: "", till_indent: 0, reqnow: ""
//     };
//     setItems(updated);
//     if (value) fetchSubWBS(index, value);
//   };

//   const handleSubWbsChange = (index, value) => {
//     const updated = [...items];
//     const selectedSub = subWbsList[index]?.find(s => s.SUBWBS === value);
//     updated[index] = {
//       ...updated[index],
//       subwbs: value,
//       wdesc: selectedSub ? selectedSub.WDESC : "Loading...",
//       mat_group: "", mat_code: "", mat_desc: "", short_text: "", uom: "", till_indent: 0, reqnow: ""
//     };
//     setItems(updated);
//     if (value) fetchGroups(index);
//   };

//   const handleMatGroupChange = (index, value) => {
//     const updated = [...items];
//     updated[index].mat_group = value;
//     updated[index].mat_code = "";
//     updated[index].mat_desc = "";
//     updated[index].short_text = "";
//     setItems(updated);
//     if (value) fetchMaterials(index, value);
//   };

//   const handleMaterialChange = async (index, value) => {
//     const updated = [...items];
//     updated[index].mat_code = value;
//     const selectedData = matCodeList[index]?.find(m => m.MAT === value);

//     if (selectedData) {
//       updated[index].mat_desc = selectedData.MDESC || selectedData.DESC || "";
//       updated[index].uom = selectedData.UNIT || selectedData.UOM || "";
//       // ✅ Populating short_text
//       updated[index].short_text = selectedData.SHORT_TEXT || selectedData.MDESC || "";
//       updated[index].till_indent = "Loading...";
//       setItems(updated);

//       try {
//         const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-indent-data`, {
//           params: { plant: plantCode, wbs: updated[index].subwbs, mat_code: value, mainType: indentType, projectType }
//         });
//         setItems(prev => {
//           const u = [...prev];
//           if (u[index]) {
//             u[index].till_indent = res.data.till_indent ?? 0;
//             u[index].base_indent = res.data.till_indent ?? 0;
//           }
//           return u;
//         });
//       } catch (err) { console.error(err); }
//     }
//   };

//   const handleReqNowChange = (index, valueRaw) => {
//     let value = valueRaw === "" ? "" : Number(valueRaw);
//     const updated = [...items];
//     updated[index].reqnow = value;
//     updated[index].descoping = value < 0 ? "Yes" : "";

//     if (index + 1 < updated.length) {
//       const nextIdx = index + 1;
//       const currentTill = parseFloat(updated[index].till_indent) || 0;
//       const currentReq = Number(value) || 0;
//       updated[nextIdx].till_indent = (currentTill + currentReq);
//     }
//     setItems(updated);
//   };

//   const label = indentType === "Service" ? "Service" : "Material";

//   return (
//     <div className="overflow-x-auto border-2 rounded-lg" style={{ borderColor: lightBorder }}>
//       <table className="w-full border-collapse min-w-max">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Sno</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>WBS Element</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Sub WBS</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>SubWBS Desc</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{label} Group</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{label} Code</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{label} Desc</th>
            
//             {/* ✅ Conditional Short Text Header */}
//             {indentType === "Service" && (
//               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Short Text</th>
//             )}

//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>UOM</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Till Indent</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Req Now</th>
//             <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Remarks</th>
//           </tr>
//         </thead>
//         <tbody>
//           {items.map((item, index) => (
//             <tr key={index} className="transition-colors hover:bg-gray-50">
//               <td className="px-1.5 py-0.5 border-b text-center text-[11px]" style={{ borderColor: lightBorder }}>{index + 1}</td>
              
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <select className="w-40 px-1.5 py-1 text-[11px] rounded border" value={item.wbs || ""} onChange={(e) => handleWbsChange(index, e.target.value)} disabled={isViewMode}>
//                   <option value="">Select WBS</option>
//                   {wbsList.map((w, i) => <option key={i} value={w.WBS}>{w.WBS} - {w.PROJ_DESC}</option>)}
//                 </select>
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <select className="w-32 px-1.5 py-1 text-[11px] rounded border" value={item.subwbs || ""} disabled={isViewMode || !item.wbs} onChange={(e) => handleSubWbsChange(index, e.target.value)}>
//                     <option value="">Select SubWBS</option>
//                     {!subWbsList[index] && item.subwbs && <option value={item.subwbs}>{item.subwbs}</option>}
//                     {subWbsList[index]?.map((s, i) => <option key={i} value={s.SUBWBS}>{s.SUBWBS}</option>)}
//                 </select>
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <input type="text" value={item.wdesc ?? ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" />
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <select className="w-28 px-1.5 py-1 text-[11px] rounded border" value={item.mat_group || ""} disabled={isViewMode || !item.subwbs} onChange={(e) => handleMatGroupChange(index, e.target.value)}>
//                     <option value="">Select Group</option>
//                     {!matGroupList[index] && item.mat_group && <option value={item.mat_group}>{item.mat_group}</option>}
//                     {matGroupList[index]?.map((g, i) => <option key={i} value={g.MAT_GROUP}>{g.MAT_GROUP}</option>)}
//                   </select>
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <select className="w-28 px-1.5 py-1 text-[11px] rounded border" value={item.mat_code || ""} disabled={isViewMode || !item.mat_group} onChange={(e) => handleMaterialChange(index, e.target.value)}>
//                     <option value="">Select Code</option>
//                     {!matCodeList[index] && item.mat_code && <option value={item.mat_code}>{item.mat_code}</option>}
//                     {matCodeList[index]?.map((m, i) => <option key={i} value={m.MAT}>{m.MAT}</option>)}
//                   </select>
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <input type="text" value={item.mat_desc ?? ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" />
//               </td>

//               {/* ✅ Conditional Short Text Cell */}
//               {indentType === "Service" && (
//                 <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <input type="text" value={item.short_text ?? ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" />
//                 </td>
//               )}

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.uom ?? ""} readOnly className="w-12 px-1.5 py-1 text-[11px] bg-gray-50 rounded border text-center" /></td>
              
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <input type="text" value={item.till_indent ?? 0} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border font-bold text-right" />
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <input type="number" value={item.reqnow ?? ""} onChange={(e) => handleReqNowChange(index, e.target.value)} className="w-20 px-1.5 py-1 text-[11px] rounded border outline-none text-right" disabled={isViewMode} />
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                  <input type="text" value={item.Remarks ?? ""} onChange={(e) => { const u = [...items]; u[index].Remarks = e.target.value; setItems(u); }} className="w-24 px-1.5 py-1 text-[11px] rounded border outline-none" disabled={isViewMode} />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default MaintenanceRevertTable;


// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { API_BASE_URL_INDENT } from "../../Config";

// const MaintenanceRevertTable = ({
//   items,
//   setItems,
//   plant,
//   projectType,
//   indentType,
//   isViewMode,
//   primaryColor,
//   lightBorder,
// }) => {
//   const [plantCode, setPlantCode] = useState("");
//   const [wbsList, setWbsList] = useState([]);
//   const [subWbsList, setSubWbsList] = useState({});
//   const [matGroupList, setMatGroupList] = useState({});
//   const [matCodeList, setMatCodeList] = useState({});

//   // 1. Extract Plant Code
//   useEffect(() => {
//     if (plant) {
//       const extractedCode = plant.split("-")[0].trim();
//       setPlantCode(extractedCode);
//     }
//   }, [plant]);

//   // 2. Fetch Initial WBS List
//   useEffect(() => {
//     if (!plantCode || !indentType || !projectType) return;
//     axios.get(`${API_BASE_URL_INDENT}/fetch-wbs-maint`, {
//       params: { plantCode, mainType: indentType, projectType },
//     })
//     .then((res) => setWbsList(res.data))
//     .catch((err) => console.error(err));
//   }, [plantCode, projectType, indentType]);

//   // --- Fetch Helpers ---
//   const fetchSubWBS = useCallback(async (index, wbsValue) => {
//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-subwbs-maint`, {
//         params: { plantCode, mainType: indentType, projectType, wbs: wbsValue },
//       });
//       setSubWbsList((prev) => ({ ...prev, [index]: res.data }));
//     } catch (err) { console.error(err); }
//   }, [plantCode, indentType, projectType]);

//   const fetchGroups = useCallback(async (index) => {
//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mgrp`, {
//         params: { plant: plantCode, mainType: indentType }
//       });
//       setMatGroupList((prev) => ({ ...prev, [index]: res.data }));
//     } catch (err) { console.error(err); }
//   }, [plantCode, indentType]);

//   const fetchMaterials = useCallback(async (index, groupValue) => {
//     try {
//       const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mat-details`, {
//         params: { plant: plantCode, mainType: indentType, mat_group: groupValue }
//       });
//       setMatCodeList((prev) => ({ ...prev, [index]: res.data }));
//     } catch (err) { console.error(err); }
//   }, [plantCode, indentType]);

//   // --- 3. Initialization logic: Fetch the lists for existing data ---
//   useEffect(() => {
//     if (items?.length > 0 && plantCode && wbsList.length > 0) {
//       items.forEach((item, index) => {
//         if (item.wbs && !subWbsList[index]) fetchSubWBS(index, item.wbs);
//         if (item.subwbs && !matGroupList[index]) fetchGroups(index);
//         if (item.mat_group && !matCodeList[index]) fetchMaterials(index, item.mat_group);
//       });
//     }
//   }, [plantCode, wbsList, items?.length]);

//   // --- 4. NEW: SYNC DESCRIPTION LOGIC ---
//   useEffect(() => {
//     const updatedItems = [...items];
//     let changed = false;

//     items.forEach((item, index) => {
//       if (item.subwbs && (!item.wdesc || item.wdesc === "Loading...")) {
//         const list = subWbsList[index];
//         if (list) {
//           const match = list.find(s => s.SUBWBS === item.subwbs);
//           if (match && match.WDESC) {
//             updatedItems[index].wdesc = match.WDESC;
//             changed = true;
//           }
//         }
//       }
//     });

//     if (changed) {
//       setItems(updatedItems);
//     }
//   }, [subWbsList]);

//   const handleWbsChange = (index, value) => {
//     const updated = [...items];
//     updated[index] = {
//       ...updated[index],
//       wbs: value, subwbs: "", wdesc: "Loading...", mat_group: "", mat_code: "",
//       mat_desc: "", short_text: "", SHORT_TEXT: "", uom: "", till_indent: 0, reqnow: ""
//     };
//     setItems(updated);
//     if (value) fetchSubWBS(index, value);
//   };

//   const handleSubWbsChange = (index, value) => {
//     const updated = [...items];
//     const selectedSub = subWbsList[index]?.find(s => s.SUBWBS === value);
//     updated[index] = {
//       ...updated[index],
//       subwbs: value,
//       wdesc: selectedSub ? selectedSub.WDESC : "Loading...",
//       mat_group: "", mat_code: "", mat_desc: "", short_text: "", SHORT_TEXT: "", uom: "", till_indent: 0, reqnow: ""
//     };
//     setItems(updated);
//     if (value) fetchGroups(index);
//   };

//   const handleMatGroupChange = (index, value) => {
//     const updated = [...items];
//     updated[index].mat_group = value;
//     updated[index].mat_code = "";
//     updated[index].mat_desc = "";
//     updated[index].short_text = "";
//     updated[index].SHORT_TEXT = "";
//     setItems(updated);
//     if (value) fetchMaterials(index, value);
//   };

//   const handleMaterialChange = async (index, value) => {
//     const updated = [...items];
//     updated[index].mat_code = value;
//     const selectedData = matCodeList[index]?.find(m => m.MAT === value);

//     if (selectedData) {
//       updated[index].mat_desc = selectedData.MDESC || selectedData.DESC || "";
//       updated[index].uom = selectedData.UNIT || selectedData.UOM || "";
      
//       // ✅ Populate Short Text from selected material
//       // updated[index].short_text = selectedData.SHORT_TEXT || selectedData.MDESC || "";
//       updated[index].short_text =  "";
      
//       updated[index].till_indent = "Loading...";
//       setItems(updated);

//       try {
//         const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-indent-data`, {
//           params: { plant: plantCode, wbs: updated[index].subwbs, mat_code: value, mainType: indentType, projectType }
//         });
//         setItems(prev => {
//           const u = [...prev];
//           if (u[index]) {
//             u[index].till_indent = res.data.till_indent ?? 0;
//             u[index].base_indent = res.data.till_indent ?? 0;
//           }
//           return u;
//         });
//       } catch (err) { console.error(err); }
//     } else {
//         updated[index].short_text = "";
//         setItems(updated);
//     }
//   };

//   const handleReqNowChange = (index, valueRaw) => {
//     let value = valueRaw === "" ? "" : Number(valueRaw);
//     const updated = [...items];
//     updated[index].reqnow = value;
//     updated[index].descoping = value < 0 ? "Yes" : "";

//     if (index + 1 < updated.length) {
//       const nextIdx = index + 1;
//       const currentTill = parseFloat(updated[index].till_indent) || 0;
//       const currentReq = Number(value) || 0;
//       updated[nextIdx].till_indent = (currentTill + currentReq);
//     }
//     setItems(updated);
//   };

//   const label = indentType === "Service" ? "Service" : "Material";

//   return (
//     <div className="overflow-x-auto border-2 rounded-lg" style={{ borderColor: lightBorder }}>
//       <table className="w-full border-collapse min-w-max">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Sno</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>WBS Element</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Sub WBS</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Sub WBS Desc</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{label} Group</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{label} Code</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{label} Desc</th>
            
//             {/* ✅ Conditional Short Text Header */}
//             {indentType === "Service" && (
//               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Short Text</th>
//             )}

//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>UOM</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Till Indent</th>
//             <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Req Qty</th>
//             <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Remarks</th>
//           </tr>
//         </thead>
//         <tbody>
//           {items.map((item, index) => (
//             <tr key={index} className="transition-colors hover:bg-gray-50">
//               <td className="px-1.5 py-0.5 border-b text-center text-[11px]" style={{ borderColor: lightBorder }}>{index + 1}</td>
              
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <select className="w-40 px-1.5 py-1 text-[11px] rounded border" value={item.wbs || ""} onChange={(e) => handleWbsChange(index, e.target.value)} disabled={isViewMode}>
//                   <option value="">Select WBS</option>
//                   {wbsList.map((w, i) => <option key={i} value={w.WBS}>{w.WBS} - {w.PROJ_DESC}</option>)}
//                 </select>
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <select className="w-32 px-1.5 py-1 text-[11px] rounded border" value={item.subwbs || ""} disabled={isViewMode || !item.wbs} onChange={(e) => handleSubWbsChange(index, e.target.value)}>
//                     <option value="">Select SubWBS</option>
//                     {!subWbsList[index] && item.subwbs && <option value={item.subwbs}>{item.subwbs}</option>}
//                     {subWbsList[index]?.map((s, i) => <option key={i} value={s.SUBWBS}>{s.SUBWBS}</option>)}
//                 </select>
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <input type="text" value={item.wdesc ?? ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" />
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <select className="w-28 px-1.5 py-1 text-[11px] rounded border" value={item.mat_group || ""} disabled={isViewMode || !item.subwbs} onChange={(e) => handleMatGroupChange(index, e.target.value)}>
//                     <option value="">Select Group</option>
//                     {!matGroupList[index] && item.mat_group && <option value={item.mat_group}>{item.mat_group}</option>}
//                     {matGroupList[index]?.map((g, i) => <option key={i} value={g.MAT_GROUP}>{g.MAT_GROUP}</option>)}
//                   </select>
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <select className="w-28 px-1.5 py-1 text-[11px] rounded border" value={item.mat_code || ""} disabled={isViewMode || !item.mat_group} onChange={(e) => handleMaterialChange(index, e.target.value)}>
//                     <option value="">Select Code</option>
//                     {!matCodeList[index] && item.mat_code && <option value={item.mat_code}>{item.mat_code}</option>}
//                     {matCodeList[index]?.map((m, i) => <option key={i} value={m.MAT}>{m.MAT}</option>)}
//                   </select>
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <input type="text" value={item.mat_desc ?? ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" />
//               </td>

//               {/* ✅ Conditional Short Text Cell (handles both upper and lower case) */}
//               {/* {indentType === "Service" && (
//                 <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                   <input 
//                     type="text" 
//                     value={item.short_text || item.SHORT_TEXT || ""} 
//                     readOnly 
//                     className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" 
//                   />
//                 </td>
//               )} */}
//               {/* ✅ Draggable Manual Short Text Cell */}
// {indentType === "Service" && (
//   <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//     <textarea 
//       value={item.short_text || item.SHORT_TEXT || ""} 
//       maxLength={40}
//       onChange={(e) => {
//         const u = [...items];
//         u[index].short_text = e.target.value;
//         u[index].SHORT_TEXT = e.target.value; // Keep both in sync
//         setItems(u);
//       }}
//       disabled={isViewMode}
//       rows="1"
//       placeholder={isViewMode ? "" : "Enter details..."}
//       className={`w-32 px-1.5 py-1 text-[11px] rounded block outline-none ${
//         isViewMode ? "bg-gray-50 cursor-not-allowed" : "bg-white focus:bg-blue-50"
//       }`} 
//       style={{ 
//         border: `1px solid ${lightBorder}`, 
//         height: '26px',          // Initial height to match other rows
//         minHeight: '26px',       // Prevents row shrinking
//         minWidth: '128px',       // Matches w-32
//         resize: isViewMode ? 'none' : 'both', // Only draggable when not in view mode
//         overflow: 'auto',        
//         lineHeight: '1.2'
//       }}
//     />
//   </td>
// )}

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.uom ?? ""} readOnly className="w-12 px-1.5 py-1 text-[11px] bg-gray-50 rounded border text-center" /></td>
              
//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <input type="text" value={item.till_indent ?? 0} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border font-bold text-right" />
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                 <input type="number" value={item.reqnow ?? ""} onChange={(e) => handleReqNowChange(index, e.target.value)} className="w-20 px-1.5 py-1 text-[11px] rounded border outline-none text-right" disabled={isViewMode} />
//               </td>

//               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
//                  <input type="text" value={item.Remarks ?? ""} onChange={(e) => { const u = [...items]; u[index].Remarks = e.target.value; setItems(u); }} className="w-24 px-1.5 py-1 text-[11px] rounded border outline-none" disabled={isViewMode} />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default MaintenanceRevertTable;


import React from "react";

const MaintenanceRevertTable = ({
  items,
  setItems, // 👈 Added this prop
  indentType,
  primaryColor = "#28556E",
  lightBorder = "#7ba5b8",
}) => {
  const label = indentType === "Service" ? "Service" : "Material";

  return (
    <div className="overflow-x-auto border-2 rounded-lg shadow-sm" style={{ borderColor: lightBorder }}>
      <table className="w-full border-collapse min-w-max text-[11px]">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Sno</th>
            <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>WBS Element</th>
            <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Sub WBS</th>
            <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Sub WBS Desc</th>
            <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{label} Group</th>
            <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{label} Code</th>
            <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>{label} Desc</th>
            
            {indentType === "Service" && (
              <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Short Text</th>
            )}

            <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>UOM</th>
            <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Till Indent</th>
            <th className="px-1.5 py-1 text-left font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Req Qty</th>
            <th className="px-1.5 py-1 text-center font-semibold text-gray-700 border-b-2" style={{ borderColor: lightBorder }}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b hover:bg-gray-50 last:border-0" style={{ borderColor: lightBorder }}>
              <td className="px-1.5 py-1 text-center text-gray-600">{index + 1}</td>
              
              {/* LOCKED FIELDS */}
              <td><input type="text" value={item.wbs || ""} readOnly className="w-40 p-1 bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              <td><input type="text" value={item.subwbs || ""} readOnly className="w-32 p-1 bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              <td><input type="text" value={item.wdesc || item.wbs_desc} readOnly className="w-32 p-1 bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              <td><input type="text" value={item.mat_group || ""} readOnly className="p-1 bg-gray-100 border rounded outline-none cursor-not-allowed w-28" /></td>
              <td><input type="text" value={item.mat_code || ""} readOnly className="p-1 bg-gray-100 border rounded outline-none cursor-not-allowed w-28" /></td>
              <td><input type="text" value={item.mat_desc || ""} readOnly className="w-32 p-1 bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>

              {indentType === "Service" && (
                <td><input type="text" value={item.short_text || item.SHORT_TEXT || ""} readOnly className="w-32 p-1 bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              )}

              <td><input type="text" value={item.uom || ""} readOnly className="w-12 p-1 text-center bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              <td><input type="text" value={item.till_indent ?? 0} readOnly className="w-20 p-1 font-bold text-right bg-gray-100 border rounded outline-none cursor-not-allowed" /></td>
              <td><input type="text" value={item.reqnow || ""} readOnly className="w-20 p-1 font-semibold text-right text-blue-800 border rounded outline-none cursor-not-allowed bg-blue-50" /></td>

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

export default MaintenanceRevertTable;