import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // Make sure to install: npm install axios
import { HiTrash, HiPlus } from "react-icons/hi";
import { API_BASE_URL } from "../Config";

const MaterialItemsTable = ({
  items,
  requestType,
  onItemChange,
  onAddItem,
  onRemoveItem,
}) => {
  // 1. Define State for Dropdowns
  const [dropdownData, setDropdownData] = useState({
    materialTypes: [],
    materialGroups: [],
    materialSubGroups: [],
    uomOptions: [],
    mrpOptions: [],
    storagelocations: [],
    valuationClasses: [],
  });
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(true);
  const inputRefs = useRef({});
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const [tooltip, setTooltip] = useState({
    show: false,
    content: "",
    x: 0,
    y: 0,
  }); // added on 25-02-2026----------------------------
  const [userToken] = useState(() => {
    const info = localStorage.getItem("userInfo");
    return info ? JSON.parse(info) : null;
  });
  //   ---------on 25-02-2026----------------------------------------------------------------
  // Tooltip handlers
  const handleMouseEnter = (e, content) => {
    if (!content) return;
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      show: true,
      content: content,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 30,
    });
  };
  const selectMaterial = (index, mat) => {
    onItemChange(index, "material_code", mat.material_code);
    onItemChange(index, "description", mat.description);

    setDropdownPosition(null);
    setSuggestions((prev) => ({
      ...prev,
      [index]: [],
    }));
  };
  const handleMaterialSearch = async (index, val) => {
    const rect = inputRefs.current[index]?.getBoundingClientRect();

    if (rect) {
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        index,
      });
    }

    if (val.length < 3) {
      setSuggestions((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}search-materials`,
        { q: val },
        {
          headers: {
            Authorization: `Bearer ${userToken.token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setSuggestions((prev) => ({ ...prev, [index]: response.data }));
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions((prev) => ({ ...prev, [index]: [] }));
    }
  };
  const handleMouseLeave = () => {
    setTooltip({ show: false, content: "", x: 0, y: 0 });
  };

  // Tooltip component to render at the end
  const Tooltip = () => {
    if (!tooltip.show) return null;
    return (
      <div
        className="fixed z-[9999] px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg pointer-events-none"
        style={{
          left: tooltip.x,
          top: tooltip.y,
          transform: "translateX(-50%)",
          maxWidth: "300px",
          whiteSpace: "nowrap",
          
        }}
      >
        {tooltip.content}
        <div className="absolute -mt-1 transform -translate-x-1/2 top-full left-1/2">
          <div className="w-2 h-2 rotate-45 bg-gray-800"></div>
        </div>
      </div>
    );
  };
  // --------------------------------------------------------------------------------------------------
  // 2. Fetch data from Laravel API
  useEffect(() => {
    const fetchMetadata = async () => {
      // Optional: Check if token exists before making the call
      if (!userToken?.token) return;

      try {
        const response = await axios.get(`${API_BASE_URL}material-metadata`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken.token}`,
          },
        });

        const data = response.data;

        setDropdownData({
          materialTypes: data.material_types || [],
          materialGroups: data.material_groups || [],
          materialSubGroups: data.material_sub_groups || [],
          uomOptions: data.uoms || [],
          mrpOptions: data.mrp_options || [],
          valuationClasses: data.valuation_classes || [],
          storagelocations: data.storage_locations || [],
        });
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        // Handle 401 Unauthorized specifically if needed
        if (error.response?.status === 401) {
          console.error("Session expired or invalid token");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [userToken?.token]); // Added token as dependency to re-run if token changes

  const tableInputStyle =
    "w-full border border-blue-400 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/50 transition-all duration-200 hover:bg-blue-100/50 hover:border-blue-500";
  const readonlyStyle =
    "w-full border border-gray-300 rounded px-1.5 py-1 text-[11px] bg-gradient-to-r from-gray-100 to-gray-200 cursor-not-allowed text-gray-700 font-semibold text-center";

  // Show loading spinner or placeholder while fetching
  if (loading)
    return (
      <div className="p-4 text-sm text-blue-600">Loading master data...</div>
    );

  if (requestType === "Creation") {
    return (
      <div className="mt-2">
        <Tooltip />
        <div className="flex items-center justify-between px-4 py-2 mb-2 border border-blue-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100">
          <label className="flex items-center gap-2 text-sm font-bold text-indigo-900">
            <span className="text-xl">📋</span>
            Material Item Details - Creation
          </label>
          <button
            type="button"
            onClick={onAddItem}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-white transition-all duration-300 bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] rounded-md shadow-sm hover:scale-105"
          >
            <HiPlus className="text-sm" /> Add Item
          </button>
        </div>

        <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-md">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] text-white text-[10px] uppercase tracking-wide">
                  <th className="w-8 p-2 text-center border-r border-white/20">
                    SNO
                  </th>
                  <th className="p-2 border-r border-white/20 min-w-[155px]">
                    Material Type <span className="text-red-300">*</span>
                  </th>
 {/* --------------------on 04-03-2026--------------------------------------------------------------------------- */}

{/* --------------------on 25-02-2026--------------------------------------------------------------------------- */}
                  <th className="p-2 border-r border-white/20 min-w-[155px]">
                    Material Group<span className="text-red-300">*</span>
                  </th>
                  <th className="p-2 border-r border-white/20 min-w-[155px]">
                    Material Sub Group<span className="text-red-300">*</span>
                  </th>
                  
                  {/* ------------------------------------------------------------------------------------------------------------------- */}
                 
                  <th className="p-2 border-r border-white/20 min-w-[165px]">
                    Storage Location
                  </th>
                
                  <th className="p-2 border-r border-white/20 min-w-[160px]">
                    Material Description<span className="text-red-300">*</span>
                  </th>
                   <th className="p-2 border-r border-white/20 min-w-[155px]">
                    UOM <span className="text-red-300">*</span>
                  </th>
                  {/* ------------------------------------------------------------------------ */}
                 
                  <th className="p-2 border-r border-white/20 min-w-[165px]">
                    Valuation Class
                  </th>
                  <th className="p-2 border-r border-white/20 min-w-[130px]">
                    MRP
                  </th>
                  {/* --------------------on 25-02-2026--------------------------------------------------------------------------- */}

                  <th className="w-20 p-2 text-center border-r border-white/20 min-w-[90px]">
                    Price <span className="text-red-300">*</span>
                  </th>
                   {/* ADDED REMARKS HEADER */}
                  <th className="p-2 border-r border-white/20 min-w-[180px]">Remarks</th>
                  {/* ------------------------------------------------------------------------------------------------------------------- */}

                  {/* <th className="p-2 border-r border-white/20 min-w-[90px]">
                    Case ID
                  </th> */}
                  <th className="w-12 p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {items.map((row, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-1.5 text-[10px] font-bold text-center text-blue-800 bg-gray-50">
                      {index + 1}
                    </td>

                    {/* Material Type Dropdown from State */}
                    <td className="p-1">
                      <select
                        value={row.material_type}
                        onChange={(e) =>
                          onItemChange(index, "material_type", e.target.value)
                        }
                        onMouseEnter={(e) =>
                          handleMouseEnter(
                            e,
                            row.material_type || "Select Material Type",
                          )
                        }
                        onMouseLeave={handleMouseLeave}
                        className={tableInputStyle}
                      >
                        <option value="">-Select Material Type</option>
                        {dropdownData.materialTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </td>

                      {/* Material Group Dropdown from State */}
                    <td className="p-1">
                      <select
                        value={row.material_group}
                        onChange={(e) =>
                          onItemChange(index, "material_group", e.target.value)
                        }
                        onMouseEnter={(e) =>
                          handleMouseEnter(
                            e,
                            row.material_group || "Select Material Group",
                          )
                        }
                        onMouseLeave={handleMouseLeave}
                        className={tableInputStyle}
                      >
                        <option value="">-Select Material Group</option>
                        {dropdownData.materialGroups.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Material Sub Group Dropdown from State */}
                    <td className="p-1">
                      <select
                        value={row.material_sub_group}
                        onChange={(e) =>
                          onItemChange(
                            index,
                            "material_sub_group",
                            e.target.value,
                          )
                        }
                        onMouseEnter={(e) =>
                          handleMouseEnter(
                            e,
                            row.material_sub_group || "Select Sub Group",
                          )
                        }
                        onMouseLeave={handleMouseLeave}
                        className={tableInputStyle}
                      >
                        <option value="">-Select Sub Group</option>
                        {dropdownData.materialSubGroups.map((sg) => (
                          <option key={sg} value={sg}>
                            {sg}
                          </option>
                        ))}
                      </select>
                    </td>
  {/* Storage Location Dropdown from State */}
                    <td className="p-1">
                      <select
                        value={row.storage_location}
                        onChange={(e) =>
                          onItemChange(
                            index,
                            "storage_location",
                            e.target.value,
                          )
                        }
                        onMouseEnter={(e) =>
                          handleMouseEnter(
                            e,
                            row.storage_location || "Select Storage Location",
                          )
                        }
                        onMouseLeave={handleMouseLeave}
                        className={tableInputStyle}
                      >
                        <option value="">-Select Storage Location</option>
                        {dropdownData.storagelocations.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                     <td className="p-1">
                      <input
                        type="text"
                        value={row.material_description}
                        onChange={(e) =>
                          onItemChange(
                            index,
                            "material_description",
                            e.target.value,
                          )
                        }
                        onMouseEnter={(e) =>
                          handleMouseEnter(
                            e,
                            row.material_description || "Enter description",
                          )
                        }
                        onMouseLeave={handleMouseLeave}
                        placeholder="Enter description"
                        className={tableInputStyle}
                      />
                    </td>
                    {/* UOM Dropdown from State */}
                    <td className="p-1">
                      <select
                        value={row.uom}
                        onChange={(e) =>
                          onItemChange(index, "uom", e.target.value)
                        }
                        onMouseEnter={(e) =>
                          handleMouseEnter(e, row.uom || "Select UOM")
                        }
                        onMouseLeave={handleMouseLeave}
                        className={tableInputStyle}
                      >
                        <option value="">-Select UOM</option>
                        {dropdownData.uomOptions.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </td>

                  
                   

                  

                    {/* Valuation Class Dropdown from State */}
                    <td className="p-1">
                      <select
                        value={row.valuation_class}
                        onChange={(e) =>
                          onItemChange(index, "valuation_class", e.target.value)
                        }
                        onMouseEnter={(e) =>
                          handleMouseEnter(
                            e,
                            row.valuation_class || "Select Valuation Class",
                          )
                        }
                        onMouseLeave={handleMouseLeave}
                        className={tableInputStyle}
                      >
                        <option value="">-Select Valuation Class</option>
                        {dropdownData.valuationClasses.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* MRP Dropdown from State */}
                    <td className="p-1">
                      <select
                        value={row.mrp}
                        onChange={(e) =>
                          onItemChange(index, "mrp", e.target.value)
                        }
                        onMouseEnter={(e) =>
                          handleMouseEnter(e, row.mrp || "Select MRP")
                        }
                        onMouseLeave={handleMouseLeave}
                        className={tableInputStyle}
                      >
                        <option value="">-Select MRP</option>
                        {dropdownData.mrpOptions.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-1">
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) =>
                          onItemChange(index, "price", e.target.value)
                        }
                        onMouseEnter={(e) =>
                          handleMouseEnter(
                            e,
                            row.price ? `Price: ${row.price}` : "Enter price",
                          )
                        }
                        onMouseLeave={handleMouseLeave}
                        className={tableInputStyle}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </td>

                    {/* ADDED REMARKS INPUT FIELD */}
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.remarks || ""}
                        onChange={(e) => onItemChange(index, "remarks", e.target.value)}
                        onMouseEnter={(e) => handleMouseEnter(e, row.remarks || "Enter remarks")}
                        onMouseLeave={handleMouseLeave}
                        className={tableInputStyle}
                        placeholder="Enter remarks..."
                      />
                    </td>
                    
                    {/* <td className="p-1">
                      <input
                        type="text"
                        value={row.case_id}
                        onChange={(e) =>
                          onItemChange(index, "case_id", e.target.value)
                        }
                        onMouseEnter={(e) =>
                          handleMouseEnter(e, row.case_id || "Enter Case ID")
                        }
                        onMouseLeave={handleMouseLeave}
                        className={tableInputStyle}
                        placeholder="Case ID"
                      />
                    </td> */}
                    <td className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        disabled={items.length === 1}
                        className="text-red-500 hover:text-red-700"
                      >
                        <HiTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Render Extension Table
  if (requestType === "Extension") {
    return (
      <div className="mt-2">
        <Tooltip />
        {/* Header with Blue Pastel Background */}
        <div className="flex items-center justify-between px-4 py-2 mb-2 border border-blue-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100">
          <label className="flex items-center gap-2 text-sm font-bold text-indigo-900">
            <span className="text-xl">📋</span>
            Material Item Details - Extension
          </label>
          <button
            type="button"
            onClick={onAddItem}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-white transition-all duration-300 
                        bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590]
                        rounded-md shadow-sm hover:from-[#4183a5] hover:to-[#3a7590] hover:shadow-md transform hover:scale-105 active:scale-95"
          >
            <HiPlus className="text-sm" /> Add Item
          </button>
        </div>

        {/* Compact Table with Scroll */}
        <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-md">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] text-white text-[10px] uppercase tracking-wide">
                  <th className="w-8 p-2 text-center border-r border-white/20">
                    SNO
                  </th>
                  <th className="p-2 border-r border-white/20 min-w-[120px]">
                    Material Code <span className="text-red-300">*</span>
                  </th>
                  <th className="p-2 border-r border-white/20 min-w-[200px]">
                    Description
                  </th>
                  <th className="p-2 border-r border-white/20 min-w-[120px]">
                    Action
                  </th>
                  <th className="w-24 p-2 text-center border-r border-white/20">
                    Price<span className="text-red-300">*</span>
                  </th>
                  <th className="p-2 border-r border-white/20 min-w-[150px]">
                    Remarks
                  </th>
                  <th className="w-12 p-2 text-center">
                    <HiTrash size={14} />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {items.map((row, index) => (
                  <tr
                    key={index}
                    className="transition-all duration-200 border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group"
                  >
                    {/* SNo */}
                    <td className="p-1.5 text-[10px] font-bold text-center text-blue-800 bg-gray-50 group-hover:bg-blue-100 transition-colors">
                      {index + 1}
                    </td>

                    {/* Material Code */}
                    <td className="relative p-1">
                      <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        value={row.material_code || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          onItemChange(index, "material_code", value);
                          handleMaterialSearch(index, value);
                        }}
                        onMouseEnter={(e) =>
                          handleMouseEnter(
                            e,
                            row.material_code || "Enter material code",
                          )
                        }
                        onMouseLeave={handleMouseLeave}
                        placeholder="Type to search..."
                        autoComplete="off"
                        className="w-full border border-blue-400 rounded px-1.5 py-1 text-[11px]"
                      />

                      {dropdownPosition &&
                        suggestions[dropdownPosition.index]?.length > 0 && (
                          <ul
                            className="fixed overflow-y-auto bg-white border border-blue-400 rounded-md shadow-xl max-h-60"
                            style={{
                              top: dropdownPosition.top,
                              left: dropdownPosition.left,
                              width: dropdownPosition.width,
                              zIndex: 9999,
                            }}
                          >
                            {suggestions[dropdownPosition.index].map((s, i) => (
                              <li
                                key={i}
                                className="p-2 text-[11px] cursor-pointer hover:bg-blue-600 hover:text-white border-b border-gray-100 last:border-0"
                                onClick={() =>
                                  selectMaterial(dropdownPosition.index, s)
                                }
                              >
                                <div className="font-semibold truncate">
                                  {s.material_code}
                                </div>
                                <div className="text-gray-600 text-[10px] truncate">
                                  {s.description}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                    </td>
                    {/* Description */}
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.description || ""}
                        onChange={(e) =>
                          onItemChange(index, "description", e.target.value)
                        }
                        onMouseEnter={(e) =>
                          handleMouseEnter(
                            e,
                            row.description || "Enter description",
                          )
                        }
                        onMouseLeave={handleMouseLeave}
                        className={tableInputStyle}
                        placeholder="Enter description"
                      />
                    </td>

                    {/* Action (Default: Extension) */}
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.action || "Extension"}
                        readOnly
                        className={readonlyStyle}
                      />
                    </td>

                    {/* Price */}
                    <td className="p-1">
                      <input
                        type="number"
                        value={row.price || ""}
                        onChange={(e) =>
                          onItemChange(index, "price", e.target.value)
                        }
                        onMouseEnter={(e) =>
                          handleMouseEnter(
                            e,
                            row.price ? `Price: ${row.price}` : "Enter price",
                          )
                        }
                        onMouseLeave={handleMouseLeave}
                        className={tableInputStyle}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </td>

                    {/* Remarks */}
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.remarks || ""}
                        onChange={(e) =>
                          onItemChange(index, "remarks", e.target.value)
                        }
                        onMouseEnter={(e) =>
                          handleMouseEnter(e, row.remarks || "Enter remarks")
                        }
                        onMouseLeave={handleMouseLeave}
                        className={tableInputStyle}
                        placeholder="Enter remarks"
                      />
                    </td>

                    {/* Remove Row */}
                    <td className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        disabled={items.length === 1}
                        className={`transition-all duration-200 ${
                          items.length === 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-red-500 hover:text-red-700 hover:scale-125 active:scale-95"
                        }`}
                      >
                        <HiTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Default message when no request type is selected
  return (
    <div className="mt-2">
      <div className="flex items-center justify-center p-8 border border-blue-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100">
        <p className="flex items-center gap-2 text-sm font-medium text-indigo-800">
          <span className="text-xl">ℹ️</span>
          Please select Material Type (Creation or Extension) to display the
          table
        </p>
      </div>
    </div>
  );
};

export default MaterialItemsTable;
