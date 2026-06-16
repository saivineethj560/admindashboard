import React, { useState } from "react";

const RMCPRTable = ({
  items,
  isViewMode,
  showPlanningQSRemarks,
  isPlanningQS,
  onItemChange,
  lightBorder = "#7ba5b8", 
  indentType,
}) => {
  
  // 1. State to track which rows are modified in this session
  const [modifiedRows, setModifiedRows] = useState({});

  const shouldShowDescoping = () => items.some((item) => Number(item.reqnow) < 0);

  // 2. Helper to handle status changes and mark row as modified
  const handleStatusChange = (index, newValue) => {
    setModifiedRows((prev) => ({ ...prev, [index]: true }));
    onItemChange(index, "status", newValue);
  };
  const label = indentType === "Service" ? "Service" : "Material";

  return (
    <div className="overflow-x-auto border-2 rounded-lg shadow-sm" style={{ borderColor: lightBorder }}>
      <table className="w-full border-collapse min-w-max">
        <thead>
          <tr className="bg-gray-200">
            {/* Headers */}
            {[
              "Sno", "Cost Center", "Cost Center Desc", `${label} Group`, `${label} Code`, 
              `${label} Desc`, "UOM", "Till Indent", "Req Now"
            ].map((h) => (
              <th key={h} className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>{h}</th>
            ))}
            
            {shouldShowDescoping() && (
              <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>Descoping</th>
            )}
            
            <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>Remarks</th>
            
            {/* Status and PR Number Headers */}
            <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>Status</th>
            <th className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>PR Number</th>
            
            {showPlanningQSRemarks && (
              <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>Planning QS Remarks</th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td 
                colSpan={shouldShowDescoping() ? (showPlanningQSRemarks ? 15 : 14) : (showPlanningQSRemarks ? 14 : 13)} 
                className="px-4 py-8 text-center text-gray-500 text-sm"
              >
                No line items found
              </td>
            </tr>
          ) : (
            items.map((item, index) => {
              
              // 3. Logic Implementation
              const isCompleted = item.status === "Completed";
              const isModifiedInSession = modifiedRows[index];

              // LOCKING LOGIC:
              // Locked if View Mode OR (It is Completed AND it was NOT modified in this session)
              const isRowLocked = isViewMode || (isCompleted && !isModifiedInSession);

              // 4. Validation logic
              const isPrNumberMissing = isCompleted && (!item.prNumber || item.prNumber.trim() === "");

              return (
                <tr key={index} className={`transition-colors ${isRowLocked ? "bg-gray-50" : "hover:bg-gray-50"}`}>
                  
                  <td className="px-1.5 py-0.5 border-b text-center text-[11px]" style={{ borderColor: lightBorder }}>{index + 1}</td>
                  
                  {/* Read Only Columns */}
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

                  {/* ✅ Status Dropdown */}
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                    <select
                      value={item.status || ""}
                      onChange={(e) => handleStatusChange(index, e.target.value)}
                      disabled={isRowLocked}
                      className={`w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none focus:ring-1 focus:ring-blue-500
                        ${isRowLocked ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"}
                      `}
                      style={{ border: `1px solid ${lightBorder}`, height: "26px" }}
                    >
                      <option value="">Select</option>
                      <option value="WIP">WIP</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>

                  {/* ✅ PR Number Input */}
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                    <input
                      type="text"
                      value={item.prNumber || ""}
                      onChange={(e) => onItemChange(index, "prNumber", e.target.value)}
                      disabled={isRowLocked}
                      placeholder={isPrNumberMissing ? "Required" : "PR No."}
                      className={`w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none transition-all
                        ${isRowLocked ? "bg-gray-200 cursor-not-allowed text-gray-500" : "bg-white focus:ring-blue-500"}
                        ${isPrNumberMissing && !isRowLocked ? "border-red-500 bg-red-50" : ""}
                      `}
                      style={{ 
                        border: (isPrNumberMissing && !isRowLocked) ? "1px solid red" : `1px solid ${lightBorder}`, 
                        height: "26px" 
                      }}
                    />
                  </td>

                  {/* Planning QS Remarks */}
                  {showPlanningQSRemarks && (
                    <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                      <textarea 
                          value={item.planningQSRemarks || ""} 
                          onChange={(e) => onItemChange(index, "planningQSRemarks", e.target.value)} 
                          disabled={!isPlanningQS || isRowLocked} 
                          className={`w-34 px-1.5 py-1 text-[11px] rounded focus:outline-none 
                            ${(!isPlanningQS || isRowLocked) ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
                          `} 
                          style={{ border: `1px solid ${lightBorder}`, height: "26px" }} 
                          placeholder={isPlanningQS && !isRowLocked ? "Enter remarks..." : ""} 
                      />
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RMCPRTable;