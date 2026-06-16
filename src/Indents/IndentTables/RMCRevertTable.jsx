import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL_INDENT } from "../../Config"; 

const RMCRevertTable = ({
  items,
  setItems,
  plant,
  projectType,
  indentType,
  isViewMode,
  primaryColor,
  lightBorder,
}) => {
  // --- Local State ---
  const [wbsList, setWbsList] = useState([]);
  const [matGroupList, setMatGroupList] = useState({});
  const [matCodeList, setMatCodeList] = useState({});

  const shouldShowDescoping = () => items.some((item) => Number(item.reqnow) < 0);

  // --- 1. Fetch Cost Centers (WBS) on Load ---
  useEffect(() => {
    if (!plant || !indentType || !projectType) return;

    const fetchWbs = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-cost-centers`, {
          params: { plant, indentType, projectType },
        });
        setWbsList(res.data);
      } catch (err) {
        console.error("Error fetching WBS/Cost Centers:", err);
        setWbsList([]);
      }
    };

    fetchWbs();
  }, [plant, projectType, indentType]);

  // --- Handlers ---

  // --- 2. WBS Change: Set Desc & Fetch Material Groups ---
  const handleWbsChange = async (index, value) => {
    const updated = [...items];
    updated[index]["wbs"] = value;
    
    // Find Description
    const selectedCC = wbsList.find((w) => (w.WBS || w.COST_CENTER || w.KOSTL) === value);
    updated[index]["wbs_desc"] = selectedCC ? (selectedCC.WDESC || selectedCC.MCTXT) : "";

    // Reset dependent fields
    updated[index]["mat_group"] = "";
    updated[index]["mat_code"] = "";
    updated[index]["mat_desc"] = "";
    updated[index]["uom"] = "";
    updated[index]["quantity"] = ""; // kept in state for logic, hidden from UI
    updated[index]["till_indent"] = "";
    updated[index]["balqty"] = "";   // kept in state for logic, hidden from UI
    updated[index]["reqnow"] = "";

    setItems(updated);
    
    // Clear downstream lists
    setMatGroupList((prev) => { const n = { ...prev }; delete n[index]; return n; });
    setMatCodeList((prev) => { const n = { ...prev }; delete n[index]; return n; });

    if (!value) return;

    // API: Fetch Material Groups
    try {
      const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mgrp`, {
        params: { plant, mainType: indentType }
      });
      setMatGroupList((prev) => ({ ...prev, [index]: res.data }));
    } catch (err) {
      console.error("Error fetching material groups:", err);
    }
  };

  // --- 3. Group Change: Fetch Materials ---
  const handleMatGroupChange = async (index, selectedGroup) => {
    const updatedItems = [...items];
    updatedItems[index]["mat_group"] = selectedGroup;
    
    // Reset dependent fields
    updatedItems[index]["mat_code"] = "";
    updatedItems[index]["mat_desc"] = "";
    updatedItems[index]["uom"] = "";
    updatedItems[index]["quantity"] = "";
    updatedItems[index]["till_indent"] = "";
    updatedItems[index]["balqty"] = "";
    updatedItems[index]["reqnow"] = "";

    setItems(updatedItems);
    
    // Clear material list
    setMatCodeList((prev) => { const n = { ...prev }; delete n[index]; return n; });

    if (!selectedGroup) return;

    // API: Fetch Materials
    try {
      const res = await axios.get(`${API_BASE_URL_INDENT}/fetch-mat-details`, {
        params: { 
            plant, 
            mainType: indentType, 
            mat_group: selectedGroup 
        }
      });
      setMatCodeList((prev) => ({ ...prev, [index]: res.data }));
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  // --- 4. Material Change: Populate Details ---
//   const handleMaterialChange = (index, selectedMatCode) => {
//     const updatedItems = [...items];
//     updatedItems[index]["mat_code"] = selectedMatCode;

//     if (!selectedMatCode) {
//         updatedItems[index]["mat_desc"] = "";
//         updatedItems[index]["uom"] = "";
//         updatedItems[index]["quantity"] = "";
//         updatedItems[index]["till_indent"] = "";
//         updatedItems[index]["balqty"] = "";
//         setItems(updatedItems);
//         return;
//     }

//     const specificList = matCodeList[index] || [];
//     const selectedData = specificList.find((m) => m.MAT === selectedMatCode);

//     if (selectedData) {
//       updatedItems[index]["mat_desc"] = selectedData.MDESC || selectedData.DESC || "";
//       updatedItems[index]["uom"] = selectedData.UNIT || selectedData.UOM || "";
      
//       // We still calculate them in state in case backend needs them, but they won't be shown
//       const qty = parseFloat(selectedData.QUAN || 0);
//       const indentVal = parseFloat(selectedData.TILL_INDENT || 0);
      
//       updatedItems[index]["quantity"] = qty;
//       updatedItems[index]["till_indent"] = indentVal;
//       updatedItems[index]["balqty"] = (qty - indentVal).toFixed(2);
//     }

//     setItems(updatedItems);
//   };

 const handleMaterialChange = (index, selectedMatCode) => {
    const updatedItems = [...items];
    updatedItems[index]["mat_code"] = selectedMatCode;

    // 1. Immediate UI Updates (Description, UOM, Qty from list)
    const specificList = matCodeList[index] || [];
    const selectedData = specificList.find((m) => m.MAT === selectedMatCode);

    if (selectedData) {
      updatedItems[index]["mat_desc"] = selectedData.MDESC || selectedData.DESC || "";
      updatedItems[index]["uom"] = selectedData.UNIT || selectedData.UOM || "";
      updatedItems[index]["quantity"] = parseFloat(selectedData.QUAN || 0);

      // Set Loading State while fetching
      updatedItems[index]["till_indent"] = "Loading...";
      updatedItems[index]["balqty"] = "";
    } else {
      // Clear if removed
      updatedItems[index]["mat_desc"] = "";
      updatedItems[index]["uom"] = "";
      updatedItems[index]["quantity"] = "";
      updatedItems[index]["till_indent"] = "";
      updatedItems[index]["balqty"] = "";
    }

    // Update state immediately
    setItems(updatedItems);

    // 2. Trigger API Call to fetch Till Indent
    if (selectedMatCode) {
        const requestParams = {
            plant: plant,
            wbs: updatedItems[index].wbs,
            mat_code: selectedMatCode,
            mainType: indentType,
            projectType: projectType
        };

        console.log("Fetching Indent Data params:", requestParams);

        axios.get(`${API_BASE_URL_INDENT}/fetch-indent-data`, {
            params: requestParams
        })
        .then((res) => {
            console.log("API Response:", res.data);

            // Functional state update
            setItems((prevItems) => {
                const newItems = [...prevItems];
                if (newItems[index]) {
                    const fetchedTill = parseFloat(res.data.till_indent || 0);
                    newItems[index]["till_indent"] = fetchedTill;

                    // Recalculate Balance if needed (internally, even if hidden in UI)
                    const qty = parseFloat(newItems[index]["quantity"] || 0);
                    if (qty > 0) {
                        newItems[index]["balqty"] = (qty - fetchedTill).toFixed(2);
                    }
                }
                return newItems;
            });
        })
        .catch((err) => {
            console.error("Error fetching till indent:", err);
            setItems((prevItems) => {
                const newItems = [...prevItems];
                if (newItems[index]) {
                    newItems[index]["till_indent"] = "0";
                }
                return newItems;
            });
        });
    }
  };

  // const handleReqNowChange = (index, valueRaw) => {
  //   let value = valueRaw === "" ? "" : Number(valueRaw);
  //   const updatedItems = [...items];

  //   if (value < 0) {
  //     updatedItems[index].reqnow = value;
  //     updatedItems[index].descoping = "Yes";
  //   } else {
  //     updatedItems[index].reqnow = value;
  //     updatedItems[index].descoping = "";
  //   }
  //   setItems(updatedItems);
  // };
  
  const handleReqNowChange = (index, valueRaw) => {
    // 1. Prepare values
    let value = valueRaw === "" ? "" : Number(valueRaw);
    const updatedItems = [...items];

    // 2. Update Current Row
    updatedItems[index].reqnow = value;
    updatedItems[index].descoping = value < 0 ? "Yes" : "";

    // 3. Logic to update the IMMEDIATE NEXT row
    if (index + 1 < updatedItems.length) {
      const nextIndex = index + 1;
      
      // Calculation: Next Till Indent = Current Till Indent + Current Req Now
      // We use Number() and || 0 to handle "Loading..." strings or empty values safely
      const currentTill = parseFloat(updatedItems[index].till_indent) || 0;
      const currentReq = Number(value) || 0;
      
      const newNextTillIndent = currentTill + currentReq;
      
      // Update Next Row's Till Indent
      updatedItems[nextIndex].till_indent = newNextTillIndent;

      // Update Next Row's Balance Qty (Internally in state)
      const nextTotalQty = parseFloat(updatedItems[nextIndex].quantity) || 0;
      if (nextTotalQty > 0) {
        updatedItems[nextIndex].balqty = (nextTotalQty - newNextTillIndent).toFixed(2);
      }
    }

    // 4. Update State
    setItems(updatedItems);
  };
  
  const label = indentType === "Service" ? "Service" : "Material";

  return (
    <div className="overflow-x-auto border-2 rounded-lg shadow-sm" style={{ borderColor: lightBorder }}>
      <table className="w-full border-collapse min-w-max">
        <thead>
          <tr className="bg-gray-200">
             {/* Headers: Removed Total Qty and Bal Qty */}
             {["Sno", "Cost Center", "Cost Center Desc", `${label} Group`, `${label} Code`, `${label} Desc`, "UOM", "Till Indent", "Req Now"].map(h => (
              <th key={h} className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>{h}</th>
            ))}
            {shouldShowDescoping() && <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b whitespace-nowrap">Descoping</th>}
            <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="transition-colors hover:bg-gray-50">
              <td className="px-1.5 py-0.5 border-b text-center text-[11px]" style={{ borderColor: lightBorder }}>{item.SNO || index + 1}</td>
              
               {/* Cost Center / WBS */}
               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                <select className="w-32 px-1.5 py-1 text-[11px] rounded border" value={item.wbs || ""} onChange={(e) => handleWbsChange(index, e.target.value)} disabled={isViewMode}>
                  <option value="">Select Cost Center</option>
                  {wbsList.map((w, i) => {
                      const val = w.WBS || w.COST_CENTER || w.KOSTL;
                      return <option key={i} value={val}>{val}</option>;
                  })}
                </select>
              </td>

              {/* Cost Center Desc */}
              <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.wbs_desc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" /></td>
               
               {/* Mat Group */}
               <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                  <select value={item.mat_group || ""} disabled={isViewMode || !item.wbs} onChange={(e) => handleMatGroupChange(index, e.target.value)} className="w-28 px-1.5 py-1 text-[11px] rounded border">
                    <option value="">Select</option>
                    {!matGroupList[index] && item.mat_group && <option value={item.mat_group}>{item.mat_group}</option>}
                    {matGroupList[index]?.map((g, i) => <option key={i} value={g.MAT_GROUP}>{g.MAT_GROUP}</option>)}
                  </select>
              </td>

              {/* Mat Code */}
              <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                  <select value={item.mat_code || ""} disabled={isViewMode || !item.mat_group} onChange={(e) => handleMaterialChange(index, e.target.value)} className="w-28 px-1.5 py-1 text-[11px] rounded border">
                    <option value="">Select</option>
                    {!matCodeList[index] && item.mat_code && <option value={item.mat_code}>{item.mat_code}</option>}
                    {matCodeList[index]?.map((m, i) => <option key={i} value={m.MAT}>{m.MAT}</option>)}
                  </select>
              </td>

              {/* Details (Desc, UOM, Till Indent, Req Now) */}
              <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.mat_desc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" /></td>
              
              {/* Removed Total Qty Column */}

              <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.uom || ""} readOnly className="w-16 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" /></td>
              <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.till_indent || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" /></td>
              
              {/* Removed Balance Qty Column */}

              <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                <input type="number" value={item.reqnow || ""} onChange={(e) => handleReqNowChange(index, e.target.value)} className="w-24 px-1.5 py-1 text-[11px] rounded border focus:border-blue-500" disabled={isViewMode} />
              </td>

               {shouldShowDescoping() && (
                 <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                    <input type="text" value={item.descoping || ""} readOnly className={`w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border text-center ${item.descoping === "Yes" ? "text-red-500" : ""}`} />
                 </td>
               )}
              <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                 <input type="text" value={item.Remarks || ""} onChange={(e) => { const u = [...items]; u[index].Remarks = e.target.value; setItems(u); }} className="w-24 px-1.5 py-1 text-[11px] rounded border" disabled={isViewMode} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RMCRevertTable;