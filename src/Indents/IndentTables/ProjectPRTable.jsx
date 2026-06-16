import React, { useState } from "react";

const ProjectPRTable = ({
  items,
  isViewMode,
  showPlanningQSRemarks,
  isPlanningQS,
  onItemChange,
  lightBorder = "#7ba5b8", 
  indentType,
}) => {
  // We keep track of which rows have been modified in this session.
  // If a row is in this list, we know the user is currently editing it.
  const [modifiedRows, setModifiedRows] = useState({});

  const handleStatusChange = (index, newValue) => {
    // 1. Mark this row as modified/touched
    setModifiedRows((prev) => ({ ...prev, [index]: true }));
    
    // 2. Propagate the change to the parent
    onItemChange(index, "status", newValue);
  };

  const label = indentType === "Service" ? "Service" : "Material";

  return (
    <div className="overflow-x-auto border-2 rounded-lg shadow-sm" style={{ borderColor: lightBorder }}>
      <table className="w-full border-collapse min-w-max">
        <thead>
          <tr className="bg-gray-200">
            {[
              "Sno", "WBS Element", "Sub WBS", `${label} Group`, `${label} Code`, 
              `${label} Desc`, "Total Qty", "UOM", "Till Indent", "Balance Qty", 
              "Req Now", "Remarks", "Status", "PR Number"  
            ].map((h) => (
              <th key={h} className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>
                {h}
              </th>
            ))}
            
            {showPlanningQSRemarks && (
              <th className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap" style={{ borderColor: lightBorder }}>
                Planning QS Remarks
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={showPlanningQSRemarks ? 15 : 14} className="px-4 py-8 text-center text-gray-500 text-sm">No line items found</td></tr>
          ) : (
            items.map((item, index) => {
              
              const isCompleted = item.status === "Completed";
              const isModifiedInSession = modifiedRows[index];

              // LOCKING LOGIC:
              // 1. If View Mode is ON -> ALWAYS Locked.
              // 2. If Status is "Completed" AND it was NOT modified in this session -> Locked (Loaded as Completed).
              // 3. If Status is "Completed" BUT user just changed it -> Unlocked (Allow entering PR No).
              const isRowLocked = isViewMode || (isCompleted && !isModifiedInSession);

              // Special Check: Is Status Dropdown itself disabled?
              // Usually, even if locked, we might want to allow changing "Completed" back to "WIP" unless in ViewMode.
              // If you want strictly ReadOnly once completed: Use `isRowLocked`
              // If you want to allow unlocking by switching back to WIP: Use `isViewMode`
              const isStatusDisabled = isViewMode || (isCompleted && !isModifiedInSession); 

              // PR Number Validation (Show red if Completed but empty)
              const isPrNumberMissing = isCompleted && (!item.prNumber || item.prNumber.trim() === "");

              return (
                <tr key={index} className={`transition-colors ${isRowLocked ? "bg-gray-50" : "hover:bg-gray-50"}`}>
                  
                  <td className="px-1.5 py-0.5 border-b text-center text-[11px]" style={{ borderColor: lightBorder }}>{index + 1}</td>
                  
                  {/* Read Only Columns */}
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.wbs || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.subwbs || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.mat_group || ""} readOnly className="w-28 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.mat_code || ""} readOnly className="w-28 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.mat_desc || ""} readOnly className="w-32 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.quantity || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.uom || ""} readOnly className="w-16 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.till_indent || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="text" value={item.balqty || ""} readOnly className="w-20 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><input type="number" value={item.reqnow || ""} readOnly className="w-24 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}` }} /></td>
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}><textarea value={item.Remarks || ""} readOnly className="w-34 px-1.5 py-1 text-[11px] bg-gray-200 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}`, height: "26px" }} /></td>

                  {/* ✅ Status Dropdown */}
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                    <select
                      value={item.status || ""}
                      onChange={(e) => handleStatusChange(index, e.target.value)}
                      disabled={isStatusDisabled} 
                      className={`w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none focus:ring-1 focus:ring-blue-500 
                        ${isStatusDisabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"}
                      `}
                      style={{ border: `1px solid ${lightBorder}`, height: "26px" }}
                    >
                      <option value="">Select</option>
                      <option value="WIP">WIP</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>

                  {/* ✅ PR Number Input (Only Locked if loaded as completed and untouched) */}
                  <td className="px-1.5 py-0.5 border-b" style={{ borderColor: lightBorder }}>
                    <input
                      type="text"
                      value={item.prNumber || ""}
                      onChange={(e) => onItemChange(index, "prNumber", e.target.value)}
                      disabled={isRowLocked}
                      placeholder={isRowLocked ? "" : "PR No."}
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

export default ProjectPRTable;