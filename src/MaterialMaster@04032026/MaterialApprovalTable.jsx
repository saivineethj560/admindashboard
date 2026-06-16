import React from "react";

const MaterialApprovalTable = ({ 
    items, 
    selectedRows, 
    onRowSelect, 
    onSelectAll,
    requestType 
}) => {
    const thStyle = "px-2 py-2 text-[10px] font-bold text-white uppercase tracking-wide border-b border-[#312e81] bg-[#312e81] whitespace-nowrap text-center";
    const tdStyle = "px-2 py-2 border-b border-blue-50 text-[10px]";

    // Render Creation Table
    if (requestType === "Creation") {
        return (
            <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                        Material Item Details - Creation
                    </span>
                </div>
                <div className="overflow-x-auto border border-blue-200 rounded-lg shadow-sm">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr>
                                <th className={thStyle}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === items.length && items.length > 0}
                                        onChange={onSelectAll}
                                        className="cursor-pointer"
                                    />
                                </th>
                                <th className={thStyle}>SNo</th>
                                <th className={thStyle}>Material Type</th>
                                <th className={thStyle}>Material Group</th>
                                <th className={thStyle}>Material Sub Group</th>
                                <th className={thStyle}>Material Description</th>
                                <th className={thStyle}>UOM</th>
                                <th className={thStyle}>Storage Location</th>
                                <th className={thStyle}>Valuation Class</th>
                                <th className={thStyle}>MRP</th>
                                <th className={thStyle}>Price</th>
                                <th className={thStyle}>Case ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-blue-50/30"}>
                                    <td className={`${tdStyle} text-center`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(index)}
                                            onChange={() => onRowSelect(index)}
                                            className="cursor-pointer"
                                        />
                                    </td>
                                    <td className={`${tdStyle} text-center text-gray-400 font-bold`}>{index + 1}</td>
                                    <td className={tdStyle}>{item.MAT_TYPE || '-'}</td>
                                    <td className={tdStyle}>{item.MAT_GRP || '-'}</td>
                                    <td className={tdStyle}>{item.MAT_SUB_GRP || '-'}</td>
                                    <td className={tdStyle}>{item.MAT_DESCP || '-'}</td>
                                    <td className={tdStyle}>{item.UOM || '-'}</td>
                                    <td className={tdStyle}>{item.STORAGE_LOC || '-'}</td>
                                    <td className={tdStyle}>{item.VALUATION_CLASS || '-'}</td>
                                    <td className={tdStyle}>{item.MRP || '-'}</td>
                                    <td className={tdStyle}>{item.PRICE || '-'}</td>
                                    <td className={tdStyle}>{item.MAT_CASE_ID || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Render Extension Table
    if (requestType === "Extension") {
        return (
            <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                        Material Item Details - Extension
                    </span>
                </div>
                <div className="overflow-x-auto border border-blue-200 rounded-lg shadow-sm">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr>
                                <th className={thStyle}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === items.length && items.length > 0}
                                        onChange={onSelectAll}
                                        className="cursor-pointer"
                                    />
                                </th>
                                <th className={thStyle}>SNo</th>
                                <th className={thStyle}>Material Code</th>
                                <th className={thStyle}>Description</th>
                                <th className={thStyle}>Price</th>
                                <th className={thStyle}>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-blue-50/30"}>
                                    <td className={`${tdStyle} text-center`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(index)}
                                            onChange={() => onRowSelect(index)}
                                            className="cursor-pointer"
                                        />
                                    </td>
                                    <td className={`${tdStyle} text-center text-gray-400 font-bold`}>{index + 1}</td>
                                    <td className={tdStyle}>{item.MAT_CODE || '-'}</td>
                                    <td className={tdStyle}>{item.MAT_DESCP || '-'}</td>
                                    <td className={tdStyle}>{item.PRICE || '-'}</td>
                                    <td className={tdStyle}>{item.REMARKS || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Default: show message when no request type is selected
    return (
        <div className="pt-3 mt-3 border-t border-gray-200">
            <div className="flex items-center justify-center p-8 border border-blue-200 rounded-lg bg-blue-50">
                <p className="text-sm font-medium text-indigo-800">
                    Please select Material Type (Creation or Extension) to display the table
                </p>
            </div>
        </div>
    );
};

export default MaterialApprovalTable;