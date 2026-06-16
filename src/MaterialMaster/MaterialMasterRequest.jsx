import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../Config";
import MaterialItemsTable from "./MaterialItemsTable";

// ─── Empty Row Templates ───────────────────────────────────────────────────────
const emptyCreationRow = () => ({
    material_type: "",
    storage_location: "",
    material_description: "",
    uom: "",
    material_group: "",
    material_sub_group: "",
    mrp: "",
    valuation_class: "",
    price: "",
    // case_id: "",
});

const emptyExtensionRow = () => ({
    material_code: "",
    description: "",
    action: "Extension",
    price: "",
    remarks: "",
});

// ─── Main Component ───────────────────────────────────────────────────────────
const MaterialMasterRequest = () => {
    const navigate = useNavigate();
    const [userToken] = useState(() => {
        return JSON.parse(localStorage.getItem("userInfo")) || {};
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [plants, setPlants] = useState([]);
    const [isLoadingPlants, setIsLoadingPlants] = useState(false);
const [uploadedFile, setUploadedFile] = useState(null);//added on 04-03-2026--------------------------------
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        name: userToken.employee || "",
        emp_id: userToken.Emp_Id || "",
        designation: userToken.Designation || "",
        department: userToken.Department || "",
        email: userToken.Email || "",
        plant: "",
        profit_center: "",
        request_type: "",
        items: [],
    });

    // ── Fetch Plants ──────────────────────────────────────────────────────
    useEffect(() => {
        const fetchPlants = async () => {
            setIsLoadingPlants(true);
            try {
                const response = await fetch(`${API_BASE_URL}all-plant-data`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userToken.token}`,
                    },
                });
                const result = await response.json();
                if (result.success && result.data) setPlants(result.data);
            } catch (error) {
                console.error("Error fetching plants:", error);
            } finally {
                setIsLoadingPlants(false);
            }
        };
        if (userToken.token) fetchPlants();
    }, [userToken.token]);

    // ── Handle Request Type Change ────────────────────────────────────────
    useEffect(() => {
        if (formData.request_type === "Creation") {
            setFormData((prev) => ({ ...prev, items: [emptyCreationRow()] }));
        } else if (formData.request_type === "Extension") {
            setFormData((prev) => ({ ...prev, items: [emptyExtensionRow()] }));
        }
    }, [formData.request_type]);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handlePlantChange = (combinedValue) => {
        const selectedPlantCode = combinedValue.split(" - ")[0];
        const selectedPlantObj = plants.find((p) => p.plant_code === selectedPlantCode);
        setFormData((prev) => ({
            ...prev,
            plant: combinedValue,
            profit_center: selectedPlantObj ? selectedPlantObj.profit_center : "",
        }));
    };

  const handleItemChange = (index, field, value) => {
  setFormData(prev => {
    const updatedItems = [...prev.items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    return {
      ...prev,
      items: updatedItems
    };
  });
};
    const addItem = () => {
        const newRow = formData.request_type === "Creation" ? emptyCreationRow() : emptyExtensionRow();
        setFormData((prev) => ({ ...prev, items: [...prev.items, newRow] }));
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            setFormData((prev) => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index),
            }));
        }
    };
// [[-----------------------------------on 25-02-2026------------------------------------------------------------------------------------]]
   const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate plant selection
    if (!formData.plant.trim()) {
        Swal.fire(
            "Plant Required",
            "Please select a Plant before submitting",
            "warning"
        );
        return;
    }

    // Validate request type selection
    if (!formData.request_type.trim()) {
        Swal.fire(
            "Material Type Required",
            "Please select Material Type (Creation or Extension) before submitting",
            "warning"
        );
        return;
    }

    // Validate all items based on request type
    let allValid = true;
    let errorMessage = "";

    if (formData.request_type === "Creation") {
        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i];
            if (!item.material_type?.trim()) {
                allValid = false;
                errorMessage = `Row ${i + 1}: Material Type is required`;
                break;
            }
            if (!item.material_group?.trim()) {
                allValid = false;
                errorMessage = `Row ${i + 1}: Material Group is required`;
                break;
            }
            if (!item.material_sub_group?.trim()) {
                allValid = false;
                errorMessage = `Row ${i + 1}: Material Sub Group is required`;
                break;
            }
            if (!item.material_description?.trim()) {
                allValid = false;
                errorMessage = `Row ${i + 1}: Material Description is required`;
                break;
            }
            if (!item.uom?.trim()) {
                allValid = false;
                errorMessage = `Row ${i + 1}: UOM is required`;
                break;
            }
            if (!item.price?.trim()) {
                allValid = false;
                errorMessage = `Row ${i + 1}: price is required`;
                break;
            }
        }
    } else if (formData.request_type === "Extension") {
        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i];
            if (!item.material_code?.trim()) {
                allValid = false;
                errorMessage = `Row ${i + 1}: Material Code is required`;
                break;
            }
             if (!item.price?.trim()) {
                allValid = false;
                errorMessage = `Row ${i + 1}: price is required`;
                break;
            }
        }
    }

    if (!allValid) {
        Swal.fire(
            "Validation Error",
            errorMessage,
            "warning"
        );
        return;
    }
    //----on 25-02-2026------------------------------------------------------------------------------------------------

     // Validate items based on request type
            let validItems = [];
            if (formData.request_type === "Creation") {
                validItems = formData.items.filter(
                    (item) => item.material_type.trim() !== "" && item.uom.trim() !== ""
                );
                if (validItems.length === 0) {
                    Swal.fire(
                        "Incomplete Table",
                        "Please fill at least one material row with Material Type and UOM",
                        "warning"
                    );
                    return;
                }
            } else if (formData.request_type === "Extension") {
                validItems = formData.items.filter(
                    (item) => item.material_code.trim() !== ""
                );
                if (validItems.length === 0) {
                    Swal.fire(
                        "Incomplete Table",
                        "Please fill at least one material row with Material Code",
                        "warning"
                    );
                    return;
                }
            }
    
        const confirmResult = await Swal.fire({
            title: "Confirm Submission?",
            text: "Are you sure you want to submit this Material Creation Request?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#4183a5",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Submit",
        });
        if (!confirmResult.isConfirmed) return;
        setIsSubmitting(true);
        let apiEndpoint = "";
        try {
            const data = new FormData();
            data.append("date", formData.date);
            data.append("name", formData.name);
            data.append("emp_id", formData.emp_id);
            data.append("designation", formData.designation);
            data.append("department", formData.department);
            data.append("email", formData.email);
            data.append("plant", formData.plant);
            data.append("profit_center", formData.profit_center);
            data.append("request_type", formData.request_type);
            data.append("items", JSON.stringify(validItems));

             if (uploadedFile) {
        // 'file' is the key your backend will look for (e.g., req.file in Node/Multer)
        data.append("file", uploadedFile); 
    }
            
            if (formData.request_type === 'Creation') apiEndpoint = `${API_BASE_URL}submit_material_request`;
            else if (formData.request_type === 'Extension') apiEndpoint = `${API_BASE_URL}submit_material_extension`;
            
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: { Authorization: `Bearer ${userToken.token}` },
                body: data,
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned a non-JSON response. Check backend logs.");
            }

            const result = await response.json();

            if (result.success) {
                await Swal.fire({
                    title: "Success!",
                    text: result.message || "Material request submitted successfully.",
                    icon: "success",
                    timer: 2000,
                });
                navigate("/dashboard");
            } else {
                throw new Error(result.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Submission Error:", error);
            Swal.fire("Error", error.message || "Failed to connect to the server.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Style Tokens ─────────────────────────────────────────────────────
    const labelStyle = "w-2/3 text-indigo-800 font-bold text-[11px] pr-2 uppercase";
    const inputBaseStyle = "w-full border-2 border-blue-300 rounded-lg py-1.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-blue-400";
    const readonlyStyle = `${inputBaseStyle} bg-gradient-to-r from-gray-50 to-gray-100 cursor-not-allowed text-gray-700 font-medium`;

    return (
        <div className="mx-auto max-w-7xl">
            <div className="overflow-hidden bg-white border-2 border-blue-200 shadow-xl rounded-2xl">

                {/* Header Bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-blue-300 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100">
                    <div className="flex items-center">
                        <img 
                            src="./mat_mastquote.png" 
                            alt="Logo" 
                            className="object-contain h-8 transition-all duration-300 rounded shadow-sm hover:scale-105" 
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] px-16 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                        <span className="text-2xl">📋</span>
                        <h1 className="text-lg font-bold tracking-wider text-white uppercase">
                            Material Creation Request
                        </h1>
                    </div>
                    
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="text-blue-500 hover:bg-blue-50 rounded-full p-1.5 border border-blue-400 transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
                            {/* Left Side: Illustration */}
                            <div className="flex flex-col items-center justify-center p-4 transition-all duration-300 border-2 border-blue-200 shadow-lg lg:col-span-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl hover:shadow-xl hover:scale-105">
                                <img 
                                    src="./mat_masterimg.png" 
                                    alt="Material Request Icon" 
                                    className="object-contain w-full h-full transition-transform duration-300 hover:scale-110" 
                                />
                            </div>

                            {/* Right Side: Header Form Fields */}
                            <div className="space-y-3 lg:col-span-3">
                                {/* Row 1: Emp Id & Date */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center group">
                                        <label className={`${labelStyle} flex items-center gap-1`}>
                                            <span className="text-blue-500">👤</span>
                                            Emp Id
                                        </label>
                                        <input type="text" value={formData.emp_id} readOnly className={readonlyStyle} />
                                    </div>
                                    <div className="flex items-center group">
                                        <label className={`${labelStyle} flex items-center gap-1`}>
                                            <span className="text-blue-500">📅</span>
                                            Date
                                        </label>
                                        <input
                                            type="text"
                                            value={new Date(formData.date).toLocaleDateString("en-GB")}
                                            readOnly
                                            className={readonlyStyle}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Name & Email */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center group">
                                        <label className={`${labelStyle} flex items-center gap-1`}>
                                            <span className="text-blue-500">✍️</span>
                                            Name
                                        </label>
                                        <input type="text" value={formData.name} readOnly className={readonlyStyle} />
                                    </div>
                                    <div className="flex items-center group">
                                        <label className={`${labelStyle} flex items-center gap-1`}>
                                            <span className="text-blue-500">📧</span>
                                            Email
                                        </label>
                                        <input type="text" value={formData.email} readOnly className={readonlyStyle} />
                                    </div>
                                </div>

                                {/* Row 3: Department & Designation */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center group">
                                        <label className={`${labelStyle} flex items-center gap-1`}>
                                            <span className="text-blue-500">🏢</span>
                                            Department
                                        </label>
                                        <input type="text" value={formData.department} readOnly className={readonlyStyle} />
                                    </div>
                                    <div className="flex items-center group">
                                        <label className={`${labelStyle} flex items-center gap-1`}>
                                            <span className="text-blue-500">💼</span>
                                            Designation
                                        </label>
                                        <input type="text" value={formData.designation} readOnly className={readonlyStyle} />
                                    </div>
                                </div>

                                {/* Row 4: Plant & Profit Center */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center group">
                                        <label className={`${labelStyle} flex items-center gap-1`}>
                                            <span className="text-blue-500">🏭</span>
                                            Plant <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.plant}
                                            onChange={(e) => handlePlantChange(e.target.value)}
                                            className={`${inputBaseStyle} hover:border-blue-500`}
                                        >
                                            <option value="">{isLoadingPlants ? "Loading..." : "Select Plant"}</option>
                                            {plants.map((p) => {
                                                const combined = `${p.plant_code} - ${p.plant_name}`;
                                                return (
                                                    <option key={p.plant_code} value={combined}>{combined}</option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="flex items-center group">
                                        <label className={`${labelStyle} flex items-center gap-1`}>
                                            <span className="text-blue-500">💰</span>
                                            Profit Center
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.profit_center}
                                            readOnly
                                            className={readonlyStyle}
                                            placeholder="Auto-filled"
                                        />
                                    </div>
                                </div>

                                {/* Row 5: Material Type */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center group">
                                        <label className={`${labelStyle} flex items-center gap-1`}>
                                            <span className="text-blue-500">📦</span>
                                            Material Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.request_type}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, request_type: e.target.value }))}
                                            className={`${inputBaseStyle} hover:border-blue-500`}
                                        >
                                            <option value="">Select Material Type</option>
                                            <option value="Creation">Creation</option>
                                            <option value="Extension">Extension</option>
                                        </select>
                                    </div>
                                    {/* added on 04-03-2026--------------------------------------------------------------------------- */}
                                {/* File Upload - Show Only for Creation */}
{formData.request_type === "Creation" && (
  <div className="flex items-center group">
    <label className={`${labelStyle} flex items-center gap-1`}>
      <span className="text-blue-500">📎</span>
      File Upload
    </label>

    <input
      type="file"
      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
      onChange={(e) => {
        const file = e.target.files[0];
        setUploadedFile(file || null);
      }}
      className="w-full border-2 border-blue-300 rounded-lg py-1.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-blue-400"
    />
  </div>
)}
                                    {/* ----------------------------------------------------------------------------------------------- */}
                                </div>
                            </div>
                        </div>

                        {/* Material Items Table Component */}
                        <div className="pt-2 mt-1 border-t border-gray-100">
                            <MaterialItemsTable
                                items={formData.items}
                                requestType={formData.request_type}
                                onItemChange={handleItemChange}
                                onAddItem={addItem}
                                onRemoveItem={removeItem}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center mt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-3 px-10 py-3 text-sm font-bold tracking-wider text-white uppercase transition-all duration-300 bg-gradient-to-r from-[#4183a5] via-[#3e7e9b] to-[#3a7590] rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M5 13l4 4L19 7" />
                                        </svg>
                                        Submit Material Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MaterialMasterRequest;
