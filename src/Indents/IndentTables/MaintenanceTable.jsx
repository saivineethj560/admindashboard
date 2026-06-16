import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from 'lucide-react';
import axios from "axios";
import { API_BASE_URL } from "../../Config";

export default function MaintenanceTable({ items, setItems, plant, projectType, mainType, primaryColor, lightBorder }) {
  
  const [orderList, setOrderList] = useState([]); // List for Maintenance Orders
  const [showPopup, setShowPopup] = useState(false);
  const [popupIndex, setPopupIndex] = useState(null);

  // --- API: Fetch Maintenance Orders ---
  useEffect(() => {
    if (!plant || !mainType || !projectType) {
      setOrderList([]);
      return;
    }
    // ✅ Change this endpoint if Maintenance uses a different API than WBS
    axios.get(`${API_BASE_URL}/fetch-wbs`, { 
        params: { plant, mainType, projectType },
      })
      .then((res) => setOrderList(res.data))
      .catch((err) => console.error(err));
  }, [plant, mainType, projectType]);

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
      // Logic for selecting Main Order / WBS
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
       // Logic for Sub Order
       const selectedSub = newItems[index].subwbsList?.find((s) => s.SUBWBS === value);
       newItems[index] = {
         ...newItems[index],
         subwbs: value,
         wdesc: selectedSub?.WDESC || "",
         mat_code: "", mat_desc: "", mat_group: "", uom: "",
         quantity: "", till_indent: "", reqnow: "", materialList: [],
       };

       try {
         const res = await axios.get(`${API_BASE_URL}/fetch-materials`, {
           params: { plant, mainType, projectType, wbs: newItems[index].wbs, subwbs: value },
         });
         newItems[index].materialList = res.data;
         if (res.data.length > 0 && res.data[0].WDESC && !newItems[index].wdesc) {
            newItems[index].wdesc = res.data[0].WDESC;
         }
       } catch (err) { newItems[index].materialList = []; }

    } else if (field === "mat_code") {
       const selectedMaterial = newItems[index].materialList?.find((m) => m.MAT === value);
       newItems[index] = {
         ...newItems[index],
         mat_code: value,
         mat_desc: selectedMaterial?.MDESC || selectedMaterial?.DESC || "",
         wdesc: selectedMaterial?.WDESC || newItems[index].wdesc || "",
         uom: selectedMaterial?.UNIT || selectedMaterial?.UOM || "",
         quantity: selectedMaterial?.QUAN || selectedMaterial?.QTY || "",
         till_indent: selectedMaterial?.TILL_INDENT || selectedMaterial?.TILL || "",
       };

    } else if (field === "reqnow") {
       let valNum = value === "" ? "" : Number(value);
       
       if (valNum < 0) {
          newItems[index].reqnow = valNum;
          newItems[index].descoping = "Yes";
       } else {
          const balanceQty = (Number(newItems[index].quantity) || 0) - (Number(newItems[index].till_indent) || 0);
          if (valNum > balanceQty) {
             setShowPopup(true);
             setPopupIndex(index);
             return; 
          }
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
          <Plus className="w-3 h-3" /> Add Maintenance Item
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm" style={{ borderColor: lightBorder }}>
        <table className="w-full border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-200">
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">S.No</th>
               {/* Changed Header for Maintenance Context */}
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Order No</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Sub Order</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">Order Desc</th>
               
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">{label} Group</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">{label} Code</th>
               <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b">{label} Desc</th>
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
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-1.5 py-0.5 border-b text-center"><span className="text-[11px] font-medium text-gray-700">{index + 1}</span></td>
                
                {/* Order No (WBS) */}
                <td className="px-1.5 py-0.5 border-b">
                   <select value={item.wbs || ""} onChange={(e) => handleItemChange(index, "wbs", e.target.value)} className="w-32 px-1.5 py-1 text-[11px] rounded focus:outline-none" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}>
                     <option value="">Select Order</option>
                     {orderList.map((order, i) => <option key={i} value={order.WBS}>{order.WBS}</option>)}
                   </select>
                </td>

                {/* Sub Order */}
                <td className="px-1.5 py-0.5 border-b">
                  <select value={item.subwbs || ""} onChange={(e) => handleItemChange(index, "subwbs", e.target.value)} disabled={!item.wbs} className="w-32 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}>
                    <option value="">Select Sub</option>
                    {item.subwbsList?.map(s => <option key={s.SUBWBS} value={s.SUBWBS}>{s.SUBWBS}</option>)}
                  </select>
                </td>
                
                {/* Description */}
                <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.wdesc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/></td>

                {/* Mat Group */}
                <td className="px-1.5 py-0.5 border-b">
                   <select value={item.mat_group || ""} onChange={(e) => handleItemChange(index, "mat_group", e.target.value)} disabled={!item.subwbs} className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}>
                     <option value="">Select Mat</option>
                     {item.materialList?.map(m => <option key={m.MAT} value={m.MAT}>{m.MAT}</option>)}
                   </select>
                </td>

                <td className="px-2.5 py-1.5 border-b">
                   <select value={item.mat_code || ""} onChange={(e) => handleItemChange(index, "mat_code", e.target.value)} disabled={!item.subwbs} className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}>
                     <option value="">Select Mat</option>
                     {item.materialList?.map(m => <option key={m.MAT} value={m.MAT}>{m.MAT}</option>)}
                   </select>
                </td>

                <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.mat_desc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/></td>
                <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.quantity || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/></td>
                <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.uom || ""} readOnly className="w-16 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/></td>
                <td className="px-1.5 py-0.5 border-b"><input type="text" value={item.till_indent || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: '26px' }}/></td>
                
                {/* Balance Qty */}
                <td className="px-1.5 py-0.5 border-b">
                   <input type="number" value={(Number(item.quantity) || 0) - (Number(item.till_indent) || 0)} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded border" style={{ borderColor: lightBorder, height: '26px' }}/>
                </td>

                {/* Req Now */}
                <td className="px-1.5 py-0.5 border-b">
                   <input type="number" value={item.reqnow || ""} step="1" onChange={(e) => handleItemChange(index, "reqnow", e.target.value)} required className="w-24 px-1.5 py-1 text-[11px] rounded focus:outline-none" style={{ border: `1px solid ${lightBorder}`, height: "26px" }}/>
                </td>

                {/* Descoping */}
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

      {/* Validation Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-none bg-opacity-40 flex justify-center items-center z-50">
           <div className="bg-white border-1 border-black p-6 rounded-lg shadow-lg w-72 text-center transform hover:scale-105">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Requested quantity cannot exceed balance quantity!</h2>
              <button className="bg-[#28556E] text-white px-4 py-1.5 rounded hover:bg-[#1f4357] transition-all text-sm font-medium" onClick={() => { setShowPopup(false); if(popupIndex !== null) handleItemChange(popupIndex, "reqnow", ""); }}>OK</button>
           </div>
        </div>
      )}
    </div>
  );
}