import React from "react";

const ServiceApprovalTable = ({
  items = [],
  selectedRows = [],
  setSelectedRows,
  onUpdateItem, 
}) => {
  const toggleRow = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((i) => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const toggleAll = () => {
    if (selectedRows.length === items.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(items.map((_, index) => index));
    }
  };

  const isAllSelected = items.length > 0 && selectedRows.length === items.length;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between px-4 py-2 mb-2 border border-blue-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100">
        <label className="flex items-center gap-2 text-sm font-bold text-indigo-900">
          <span className="text-xl">📋</span> Line Item Details
        </label>
        <span className="text-[10px] bg-gradient-to-r from-[#4183a5] to-[#3a7590] text-white px-3 py-1 rounded-md font-bold uppercase shadow-sm">
          Selected: {selectedRows.length} / {items.length}
        </span>
      </div>

      <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-md">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] text-white text-[10px] uppercase tracking-wide">
              <th className="w-10 p-2 text-center border-r border-white/20">
                <input type="checkbox" checked={isAllSelected} onChange={toggleAll} />
              </th>
              <th className="w-8 p-2 text-center border-r border-white/20">SNO</th>
              <th className="p-2 border-r border-white/20">Service Category</th>
              <th className="p-2 border-r border-white/20">Service Group</th>
              <th className="p-2 border-r border-white/20">Service Code Description</th>
              <th className="p-2 border-r border-white/20">UOM</th>
              <th className="p-2 border-r border-white/20">Additional Description *</th>
              <th className="p-2 border-r border-white/20">Valuation Class</th>
              <th className="p-2 border-r border-white/20">Work Status </th>
              <th className="p-2 border-r border-white/20">Remarks</th>
              <th className="p-2 border-r border-white/20">Service Code</th>
              <th className="p-2 border-r border-white/20">Service Descp</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={index} className={`border-b border-gray-200 ${selectedRows.includes(index) ? 'bg-blue-50' : ''}`}>
                  <td className="p-2 text-center border-r border-gray-200">
                    <input type="checkbox" checked={selectedRows.includes(index)} onChange={() => toggleRow(index)} />
                  </td>
                  <td className="p-1.5 text-[10px] font-bold text-center text-blue-800 border-r border-gray-200">{index + 1}</td>
                  <td className="p-1.5 text-[11px] font-semibold border-r border-gray-200">{item.SERV_CAT}</td>
                  <td className="p-1.5 text-[11px] border-r border-gray-200">{item.MAT_GRP}</td>
                  <td className="p-1.5 text-[11px] border-r border-gray-200">{item.MAT_DESCP}</td>
                  <td className="p-1.5 text-[11px] text-center border-r border-gray-200">{item.UOM}</td>
                  <td className="p-1.5 text-[11px] border-r border-gray-200">{item.ADD_DESCP}</td>
                  <td className="p-1.5 text-[11px] border-r border-gray-200">{item.VALUATION_CLASS}</td>
                  <td className="p-1.5 text-[11px] border-r border-gray-200">{item.WRK_STATUS}</td>
                  <td className="p-1.5 text-[11px] border-r border-gray-200">{item.REMARKS}</td>
                   {/* EDITABLE SERVICE CODE INPUT */}
                  <td className="p-1.5 border-r border-gray-200 min-w-[120px]">
                    <input 
                      type="text" 
                      value={item.SERVICE_CODE || ""} 
                      placeholder="Enter Code..."
                      onChange={(e) => onUpdateItem(index, "SERVICE_CODE", e.target.value)} 
                      // onChange={(e) => onInputChange(index, "SERVICE_CODE", e.target.value)}
                      className="w-full px-2 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white shadow-sm"
                    />
                  </td>
                   {/* EDITABLE SERVICE DESCRIPTION INPUT */}
                  <td className="p-1.5 border-r border-gray-200 min-w-[150px]">
                    <input 
                      type="text" 
                      value={item.SERVICE_DESCP || ""} 
                      placeholder="Enter Description..."
                      onChange={(e) => onUpdateItem(index, "SERVICE_DESCP", e.target.value)} 
                      className="w-full px-2 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white shadow-sm"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="p-10 italic text-center text-gray-400">No items found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceApprovalTable;

