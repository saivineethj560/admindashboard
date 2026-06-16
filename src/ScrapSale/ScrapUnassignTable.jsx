import React from "react";

const ScrapUnassignTable = ({ items = [], selectedRows = [], setSelectedRows, updateItemField }) => {
  const headerCell = "p-3 border-r border-blue-700 text-center text-[10px] uppercase tracking-tighter font-bold";
  const bodyCell = "p-2 text-xs border-r border-blue-50 text-gray-700";
  const readonlyInput = "w-full bg-transparent text-xs text-center outline-none cursor-default py-1 font-medium text-gray-800";

  // Toggle individual row
//   const toggleRow = (index) => {
//     if (selectedRows.includes(index)) {
//       setSelectedRows(selectedRows.filter((i) => i !== index));
//     } else {
//       setSelectedRows([...selectedRows, index]);
//     }
//   };

  // Toggle all rows
//   const toggleAll = () => {
//     if (selectedRows.length === items.length) {
//       setSelectedRows([]);
//     } else {
//       setSelectedRows(items.map((_, index) => index));
//     }
//   };

//   const isAllSelected = items.length > 0 && selectedRows.length === items.length;
  
// Style for the editable Sale Order field
  const editableInput = "w-full bg-blue-50 border border-blue-200 rounded text-xs text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-1 font-bold text-blue-900";
  
  
  // Locked Style (for SO numbers that are already saved)
  const lockedInput = "w-full bg-gray-100 border border-gray-300 rounded text-xs text-center outline-none py-1 font-bold text-gray-500 cursor-not-allowed";
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between px-2 mb-4">
        <label className="text-lg font-extrabold tracking-tight text-blue-900">
          Line Item Details
        </label>
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold uppercase border border-blue-200">
            Selected: {selectedRows.length} / {items.length}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border-2 border-blue-200 shadow-md rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-white bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590]">
              {/* SELECT ALL CHECKBOX */}
              {/* <th className="w-10 p-3 text-center border-r border-blue-700">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-500 border-blue-300 rounded cursor-pointer focus:ring-blue-400"
                  checked={isAllSelected}
                  onChange={toggleAll}
                />
              </th> */}
              <th className={`${headerCell} w-10`}>SNO</th>
              <th className={`${headerCell} min-w-[200px] !text-left`}>Material Description</th>
              <th className={`${headerCell} w-28`}>Mat. Code</th>
              <th className={`${headerCell} w-20`}>Unit</th>
              <th className={`${headerCell} w-24`}>Prev Qty</th>
              <th className={`${headerCell} w-24`}>Prev Rate</th>
              <th className={`${headerCell} w-24`}>Sale Qty</th>
              <th className={`${headerCell} w-24`}>Cul Qty</th>
              <th className={`${headerCell} min-w-[150px] !text-left border-r-0`}>Remarks</th>
               {/* NEW COLUMN */}
              <th className={`${headerCell} min-w-[160px] border-r-0 bg-blue-800`}>Sale Order Number</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => {
                const isSelected = selectedRows.includes(index);

                  
                // --- LOGIC: If the item already has a Purchase Status of 'Approve', it means the SO is already saved ---
                const isAlreadySaved = item.PURCHASE_STATUS === 'Approve' || (item.SALE_ORDER_STATUS === 'COMPLETED');
                
                return (
                  <tr
                    key={index}
                    className={`border-b border-blue-50 transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-blue-50/40'}`}
                  >
                    {/* ROW CHECKBOX */}
                    {/* <td className="p-3 text-center border-r border-blue-50">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-500 border-blue-300 rounded cursor-pointer focus:ring-blue-400"
                        checked={isSelected}
                        onChange={() => toggleRow(index)}
                      />
                    </td> */}

                    <td className="p-3 text-xs font-bold text-center text-blue-700 border-r border-blue-50 bg-blue-50/60">
                      {index + 1}
                    </td>

                    <td className={bodyCell}>
                      <div className="font-semibold text-gray-900 uppercase">
                        {item.description || item.MAT_DESC}
                      </div>
                    </td>

                    <td className={bodyCell}>
                      <div className="font-mono font-bold text-center text-[#4183a5]">
                        {item.material_code || item.MAT_CODE}
                      </div>
                    </td>

                    <td className={bodyCell}>
                      <div className="font-bold text-center">{item.unit || item.UOM}</div>
                    </td>

                    <td className={bodyCell}>
                      <input type="text" readOnly className={readonlyInput} value={item.prev_qty || 0} />
                    </td>

                    <td className={bodyCell}>
                      <input type="text" readOnly className={readonlyInput} value={item.prev_rate || 0} />
                    </td>

                    <td className={bodyCell}>
                      <input type="text" readOnly className={readonlyInput} value={item.sale_request_qty || 0} />
                    </td>

                    <td className={bodyCell}>
                      <input type="text" readOnly className={readonlyInput} value={item.cumulative_qty || 0} />
                    </td>

                    <td className="p-2 text-xs italic text-gray-500 border-r border-blue-50">
                      {item.remarks || "---"}
                    </td>

                     {/* NEW SALE ORDER INPUT FIELD */}
                    {/* <td className="p-2 text-center border-b border-blue-50">
                      <input 
                        type="text" 
                        className={editableInput} 
                        placeholder="Enter SO Number"
                        value={item.SALE_ORDER_NO || ""} 
                        onChange={(e) => updateItemField(index, 'SALE_ORDER_NO', e.target.value)}
                      />
                    </td> */}

                     {/* SALE ORDER INPUT FIELD */}
                    <td className="p-2 text-center border-b border-blue-50">
                      <input 
                        type="text" 
                        // If it's already saved, use locked styles and set readOnly
                        className={isAlreadySaved ? lockedInput : editableInput} 
                        placeholder={isAlreadySaved ? "" : "Enter SO Number"}
                        value={item.SALE_ORDER_NO || ""} 
                        readOnly={isAlreadySaved}
                        onChange={(e) => updateItemField(index, 'SALE_ORDER_NO', e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="p-10 italic text-center text-blue-300">
                  No line items found for this request.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScrapUnassignTable;

