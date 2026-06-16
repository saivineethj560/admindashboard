import React from "react";

const RMCApprovalTable = ({
  items,
  selectedItems,
  selectAll,
  onSelectAll,
  onCheckboxChange,
  isViewMode,
  showPlanningQSRemarks,
  isPlanningQS,
  onItemChange,
  lightBorder = "#7ba5b8",
  mainType,
}) => {
  const label = mainType === "Service" ? "Service" : "Material";
  
  const shouldShowDescoping = () => items.some((item) => Number(item.reqnow) < 0);

  return (
    <div className="overflow-x-auto border-2 rounded-lg shadow-sm" style={{ borderColor: lightBorder }}>
      <table className="w-full border-collapse min-w-max">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-1.5 py-1 text-center border-b-2" style={{ borderColor: lightBorder }}>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={onSelectAll}
                disabled={isViewMode}
                className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
              />
            </th>
            {/* RMC Specific Headers: Cost Center instead of WBS */}
            {["Sno", "Cost Center", "Cost Center Desc", `${label} Group`, `${label} Code`, `${label} Desc`, "UOM", "Till Indent", "Req Now"].map((h) => (
              <th key={h} className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>{h}</th>
            ))}
            {shouldShowDescoping() && (
              <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>Descoping</th>
            )}
            <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>Remarks</th>
            
            {showPlanningQSRemarks && (
              <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>Planning QS Remarks</th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={14} className="px-4 py-8 text-center text-gray-500 text-sm">No line items found</td></tr>
          ) : (
            items.map((item, index) => (
              <tr key={index} className={`hover:bg-gray-50 transition-colors ${selectedItems.includes(index) ? "bg-blue-50" : ""}`}>
                <td className="px-1.5 py-0.5 border-b text-center" style={{ borderColor: lightBorder }}>
                  <input type="checkbox" checked={selectedItems.includes(index)} onChange={() => onCheckboxChange(index)} disabled={isViewMode} className="w-4 h-4 cursor-pointer" />
                </td>
                <td className="px-1.5 py-0.5 border-b text-center text-[11px]" style={{ borderColor: lightBorder }}>{index + 1}</td>
                
                {/* RMC Columns Mapping: WBS -> Cost Center, WDESC -> Cost Center Desc */}
                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.wbs || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.wdesc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                
                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.mat_group || ""} readOnly className="w-28 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.mat_code || ""} readOnly className="w-28 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.mat_desc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                
                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.uom || ""} readOnly className="w-16 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.till_indent || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                
                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="number" value={item.reqnow || ""} readOnly className="w-24 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                
                {shouldShowDescoping() && (
                   <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                     <input type="text" value={Number(item.reqnow) < 0 ? "Yes" : ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-200 text-red-500 text-center rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} />
                   </td>
                )}

                <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><textarea value={item.Remarks || ""} readOnly className="w-34 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} /></td>

                {showPlanningQSRemarks && (
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                    <textarea 
                        value={item.planningQSRemarks || ""} 
                        onChange={(e) => onItemChange(index, "planningQSRemarks", e.target.value)} 
                        disabled={!isPlanningQS || isViewMode} 
                        className={`w-34 px-1.5 py-1 text-[11px] rounded focus:outline-none ${!isPlanningQS || isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`} 
                        style={{ border: `1px solid ${lightBorder}`, height: "26px" }} 
                        placeholder={isPlanningQS && !isViewMode ? "Enter remarks..." : ""} 
                    />
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RMCApprovalTable;