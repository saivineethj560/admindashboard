import React, { useEffect, useState } from "react";
import {
  Save, AlertCircle, CheckCircle, ArrowLeft, Check, Upload 
} from "lucide-react";
import { useLocation, useNavigate , useParams} from "react-router-dom";
import axios from "axios";
// import { API_BASE_URL, API_DOC_URL } from "./Config";

import { API_BASE_URL_INDENT, API_DOC_URL_INDENT } from "../Config";

import { useIndent } from "./IndentContext";
import ProjectDraftTable from "./IndentTables/ProjectDraftTable";
import RMCDraftTable from "./IndentTables/RMCDraftTable";
import MaintenanceDraftTable from "./IndentTables/MaintenanceDraftTable";
import WaterDocUploadModal from "./WaterDocUploadModal"; // ✅ IMPORTED MODAL

// Configure axios
axios.defaults.baseURL = API_BASE_URL_INDENT;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const DraftForm = ({ mainType, tileType, subTab }) => {
  const { case_id: urlCaseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isViewMode = location.state?.viewMode || false;

  // --- State ---
  const [indent, setIndent] = useState({});
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  
  // ✅ File Handling State
  const [documents, setDocuments] = useState([]); // Existing files from DB
  const [newFiles, setNewFiles] = useState([]);   // New files from Modal
  const [quotationDocModal, setquotationDocModal] = useState(false); // Modal visibility

  // Modals
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, title: '', message: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, action: null, message: '' });

  const { selectedIndent } = useIndent();
  const caseId = selectedIndent?.CASEID || urlCaseId; 

  // Add this log to debug exactly what is happening
  console.log("Context ID:", selectedIndent?.CASEID);
  console.log("URL ID:", urlCaseId);
  console.log("Effective caseId:", caseId);
  // const caseId = selectedIndent?.CASEID;
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const primaryColor = "#28556E";
  const lightBorder = "#7ba5b8";
  // Add this line to get the code part (e.g., "1200")
const plantCodeOnly = indent.PLANT ? indent.PLANT.split("-")[0].trim() : "";

  // --- Fetch Indent & Hydrate ---
  useEffect(() => {
    const fetchIndentDetails = async () => {
      if (!caseId) return;
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL_INDENT}/indent-details/${caseId}`);
        const responseData = res.data.data;
        console.log("RAW LINE ITEMS FROM DB:", responseData.line_items); // 👈 ADD THIS
        const lineItems = responseData.line_items || [];

        const topFields = lineItems.length > 0
            ? {
                CASEID: lineItems[0].CASEID || "",
                EMP_ID: lineItems[0].EMPID || "",
                RAISER: lineItems[0].EMP_NAME || "",
                EMP_MAIL: lineItems[0].EMP_MAILID || "",
                DEPT: lineItems[0].DEPT || "",
                PLANT: lineItems[0].PLANT || "",
                PRJ_TYPE: lineItems[0].PRJ_TYPE || "",
                RAISER_DATE: responseData.approval.RAISER_DATE || "",
                CUR_TASK: lineItems[0].CUR_TASK || "",
                INDENT_TYPE: lineItems[0].INDENT_TYPE || "",
                CATEGORY_TYPE: lineItems[0].CATEGORY_TYPE || "",
                TILE_TYPE: lineItems[0].TILE_TYPE || "",
              }
            : {};

        setIndent({ ...topFields, line_items: lineItems });

        // Map Items
        const initialItems = lineItems.map((item) => ({
            SNO: item.SNO || "",
            wbs: item.WBS_ELE || "",
            subwbs: item.SUBWBS_ELE || "",
            wdesc: item.WDESC || "",
            mat_group: item.MAT_GRP || "",
            mat_code: item.MAT_CODE || "",
            mat_desc: item.MAT_DESC || "",
            uom: item.UOM || "",
            short_text: item.SHORT_TEXT || "",
            quantity: parseFloat(item.QUAN || 0).toFixed(2), 
            till_indent: parseFloat(item.TILL_INDENT || 0).toFixed(2),
            base_indent: parseFloat(item.TILL_INDENT || 0).toFixed(2), // 👈 ADD THIS LINE
            reqnow: item.REQ_NOW || "",
            balqty: (parseFloat(item.QUAN || 0) - parseFloat(item.TILL_INDENT || 0)).toFixed(2),
            Remarks: item.REMARKS || "",
            descoping: item.DESCOPING || "",
        }));

        // Hydration Step
        const currentPlant = topFields.PLANT;
        // 1. Extract the code part (e.g., "1200") from the string (e.g., "1200 - MyHome")
        const plantCode = currentPlant ? currentPlant.split("-")[0].trim() : "";
        const hydratedItems = await Promise.all(initialItems.map(async (item) => {
            if (currentPlant && item.mat_code) {
                try {
                    const sapRes = await axios.get(`${API_BASE_URL_INDENT}/fetch-till-indent`, {
                        params: { 
                            currentPlant: currentPlant, 
                            plant: plantCode, 
                            wbs: item.wbs, 
                            subwbs: item.subwbs, 
                            mat_code: item.mat_code,
                            projectType: topFields.PRJ_TYPE,
                            short_text: item.short_text, // 👈 ADD THIS LINE

                            INDENT_TYPE: topFields.INDENT_TYPE
                        }
                    });
                    const liveTotal = parseFloat(sapRes.data.quantity) || 0;
                    const liveTill = parseFloat(sapRes.data.till_indent) || 0;
                    
                    return {
                        ...item,
                        quantity: liveTotal.toFixed(2),
                        till_indent: liveTill.toFixed(2),
                        base_indent: liveTill.toFixed(2), // 👈 ADD THIS LINE
                        balqty: (liveTotal - liveTill).toFixed(2)
                    };
                } catch (err) {
                    return item; 
                }
            }
            return item;
        }));
        setItems(hydratedItems);

        // Load Documents
        if (lineItems.length > 0) {
          const firstItem = lineItems[0];
          const docPaths = firstItem.DOC_PATHS ? JSON.parse(firstItem.DOC_PATHS) : [];
          const docNames = firstItem.DOC_NAMES ? JSON.parse(firstItem.DOC_NAMES) : [];
          setDocuments(docPaths.map((path, idx) => ({ name: docNames[idx] || path.split("/").pop(), path: path })));
        }

      } catch (err) {
        console.error("Error loading indent:", err);
        setNotification({ show: true, type: "error", message: "Failed to load details" });
      } finally {
        setLoading(false);
      }
    };
    fetchIndentDetails();
  }, [caseId]);

  // --- Remove Handlers ---
  const removeNewFile = (index) => setNewFiles((prev) => prev.filter((_, i) => i !== index));
  const removeExistingDoc = (index) => setDocuments((prev) => prev.filter((_, i) => i !== index));

  // --- Submit Logic ---
  const openConfirmModal = (action) => {
    const title = action === 'save' ? 'Save Draft' : 'Submit Indent';
    const message = `Case ID: ${caseId || indent.CASEID}\n\nAre you sure you want to ${action === 'save' ? 'save as draft' : 'submit'}?`;
    setConfirmModal({ isOpen: true, action, title, message });
  };

  const handleSubmit = async (actionType) => {
    // Validation
    // const validItems = items.filter((item) => item.reqnow && parseFloat(item.reqnow) > 0);
    // ✅ NEW LOGIC: allows positive (requests) AND negative (descoping) numbers
    const validItems = items.filter((item) => 
      item.reqnow !== "" && 
      item.reqnow !== null && 
      parseFloat(item.reqnow) !== 0
    );
    if (validItems.length === 0) {
      setNotification({ show: true, type: "error", message: "Please enter 'Req Now' for at least one item." });
      setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
      return;
    }
    const hasError = validItems.some(item => parseFloat(item.reqnow) > parseFloat(item.balqty) && indent.CATEGORY_TYPE == 'Projects' && indent.PRJ_TYPE?.endsWith("(B)"));
    if (hasError) {
        setNotification({ show: true, type: "error", message: "Req Now cannot exceed Balance Qty." });
        setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
        return;
    }

    setConfirmModal({ isOpen: false, action: null, title: '', message: '' });
    setLoading(true);

     // 👇 ADD THIS CALCULATION BLOCK BEFORE SENDING TO BACKEND
    // =========================================================
    const processedItems = items.map((item, index) => {
        // Start with the base value from the DB
        let cumulativeTill = Number(item.base_indent || item.till_indent || 0);

        // Add 'reqnow' from all PREVIOUS rows that match the same CC and Material
        for (let i = 0; i < index; i++) {
            const prevItem = items[i];
            if (prevItem.wbs === item.wbs && prevItem.mat_code === item.mat_code) {
                cumulativeTill += Number(prevItem.reqnow || 0);
            }
        }

        return {
            ...item,
            till_indent: cumulativeTill, // Send the updated starting point
        };
    });
    // =========================================================
    
  const plantCodeOnly = indent.PLANT ? indent.PLANT.split("-")[0] : "";
    try {
      const formData = new FormData();
      formData.append("status", actionType);
      formData.append("project_type", indent.PRJ_TYPE);
      formData.append("main_type", indent.INDENT_TYPE);
      formData.append("tile_type", indent.TILE_TYPE);
      formData.append("sub_tab", indent.CATEGORY_TYPE);
      formData.append("case_id",  caseId);
      formData.append("plant", indent.PLANT);
      formData.append("plantCodeOnly", plantCodeOnly);
      formData.append("CUR_TASK", indent.CUR_TASK);
      formData.append("emp_name", indent.RAISER);
      formData.append("emp_mail", indent.EMP_MAIL);
      formData.append("dept", indent.DEPT);
      formData.append("emp_id", indent.EMP_ID);
      formData.append("user", JSON.stringify({ username: storedUser.username, displayName: storedUser.name, email: storedUser.email }));
      // formData.append("items", JSON.stringify(items));
      // 👇 CHANGE THIS: Send processedItems instead of items
      formData.append("items", JSON.stringify(processedItems));
      
      // ✅ Handle Files (Existing + New)
      formData.append("existing_docs", JSON.stringify(documents));
      newFiles.forEach((file) => formData.append("docs[]", file));
      
      const apiEndpoint = actionType === "Draft" ? `${API_BASE_URL_INDENT}/save-draft` : `${API_BASE_URL_INDENT}/submit-indent`;
      const response = await axios.post(apiEndpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });

      if (response.data.status === "success" || response.status === 200) {
        // Use response.data.case_id which contains the new ID from the server
        const finalCaseId = response.data.case_id ;
        setSuccessModal({ isOpen: true, action: actionType === "Draft" ? 'save' : 'submit', message: `Success! Case ID: ${finalCaseId}` });
      } else {
        throw new Error(response.data.message || "Failed");
      }
    } catch (error) {
      setNotification({ show: true, type: "error", message: error.response?.data?.message || "Submission failed." });
      setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !indent.CASEID) {
    return <div className="p-10 text-center">Loading Draft & Refreshing SAP Data...</div>;
  }

  return (
    <div className="relative">
      {/* Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-lg shadow-lg ${notification.type === "success" ? "bg-green-500" : "bg-red-500"} text-white`}>
           {notification.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
           <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mt-1 mb-2 px-4 py-1.5 bg-[#28556E] border border-[#28556E] rounded-md shadow-sm flex items-center justify-between">
        <h1 className="flex-1 text-lg font-semibold tracking-wide text-center text-white">Draft Form</h1>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-[#28556E] rounded-md hover:bg-[#f1f5f9] bg-white absolute right-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="mb-1 overflow-hidden bg-white border-2 shadow-lg rounded-xl" style={{ borderColor: primaryColor }}>
        <div className="p-2 space-y-2">
          {/* Top Info & File Upload */}
          <div className="flex gap-1.5">
             <div className="flex-1 p-2 border-2 rounded-lg" style={{ borderColor: lightBorder }}>
                <div className="grid grid-cols-4 gap-2 mb-2">
                    {["Case ID", "Raiser Emp ID", "Raiser Name", "Raiser Email ID"].map((lbl, i) => (
                        <div key={lbl}>
                            <label className="block text-[14px] font-semibold text-gray-700 mb-1">{lbl}*</label>
                            <input type="text" readOnly value={[indent.CASEID, indent.EMP_ID, indent.RAISER, indent.EMP_MAIL][i] || ""} className="w-full px-2 py-1 text-[14px] rounded bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed" style={{ border: `1px solid ${lightBorder}`, height: "32px" }} />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {["Raiser Dept", "Plant", "Project Type", "Raised Date"].map((lbl, i) => (
                        <div key={lbl}>
                            <label className="block text-[14px] font-semibold text-gray-700 mb-1">{lbl}*</label>
                            <input type="text" readOnly value={[indent.DEPT, indent.PLANT, indent.PRJ_TYPE, indent.RAISER_DATE][i] || ""} className="w-full px-2 py-1 text-[14px] rounded bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed" style={{ border: `1px solid ${lightBorder}`, height: "32px" }} />
                        </div>
                    ))}
                </div>
             </div>
             
             {/* ✅ CORRECTED UPLOAD SECTION */}
             <div className="flex flex-col justify-between p-3 border-2 rounded-lg w-72" style={{ borderColor: lightBorder, height: "160px" }}>
                <div className="flex flex-col items-center justify-center flex-1">
                    <button 
                        type="button" 
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border-2 rounded-lg" 
                        style={{ backgroundColor: primaryColor, borderColor: primaryColor }} 
                        onClick={() => setquotationDocModal(true)}
                    >
                        <Upload className="w-4 h-4" /> 
                        Upload {(newFiles.length + documents.length) > 0 && `(${(newFiles.length + documents.length)})`}
                    </button>
                </div>
                
                {/* File List (Existing + New) */}
                {(newFiles.length > 0 || documents.length > 0) && (
                    <ul className="mt-2 space-y-[2px] text-[11px] text-gray-700 border rounded-lg p-1 max-h-90 overflow-y-auto">
                        {/* New Files */}
                        {newFiles.map((file, index) => (
                        <li key={`new-${index}`} className="flex justify-between items-center bg-green-50 border rounded px-2 py-[2px]">
                            <span className="truncate" title={file.name}>{file.name} (New)</span>
                            <button type="button" className="text-red-500 text-[10px] font-semibold" onClick={() => removeNewFile(index)}>✕</button>
                        </li>
                        ))}
                        {/* Existing Docs */}
                        {documents.map((doc, index) => (
                        <li key={`old-${index}`} className="flex justify-between items-center bg-gray-50 border rounded px-2 py-[2px]">
                            <a href={`${API_DOC_URL_INDENT}/${doc.path}`} target="_blank" rel="noreferrer" className="text-blue-600 truncate hover:underline" title={doc.name}>{doc.name}</a>
                            <button type="button" className="text-red-500 text-[10px] font-semibold" onClick={() => removeExistingDoc(index)}>✕</button>
                        </li>
                        ))}
                    </ul>
                )}
             </div>
          </div>

          {/* Table Component */}
          {indent.CATEGORY_TYPE === 'Projects' ? (
            // <ProjectDraftTable 
            //     items={items} setItems={setItems} plant={indent.PLANT}
            //     projectType={indent.PRJ_TYPE} indentType={indent.INDENT_TYPE}
            //     subTab={subTab} isViewMode={isViewMode}
            //     primaryColor={primaryColor} lightBorder={lightBorder}
            // />
             <>
      {/* If Project Type ends with (NB), use MaintenanceDraftTable */}
      {indent.PRJ_TYPE && indent.PRJ_TYPE.endsWith("(NB)") ? (
        <MaintenanceDraftTable
          // items={items}
          // setItems={setItems}
          // plant={indent.PLANT}
          // projectType={indent.PRJ_TYPE}
          // indentType={indent.INDENT_TYPE}
          // subTab={subTab}
          // isViewMode={isViewMode}
          // primaryColor={primaryColor}
          // lightBorder={lightBorder}

          items={items} setItems={setItems} plant={indent.PLANT} plantCode={plantCodeOnly}
                projectType={indent.PRJ_TYPE} indentType={indent.INDENT_TYPE}
                subTab={subTab} isViewMode={isViewMode}
                primaryColor={primaryColor} lightBorder={lightBorder}
        />
      ) : (
        /* Otherwise (specifically for (B) or default), use ProjectDraftTable */
        <ProjectDraftTable
          items={items}
          setItems={setItems}
          plant={indent.PLANT}
          projectType={indent.PRJ_TYPE}
          indentType={indent.INDENT_TYPE}
          subTab={subTab}
          isViewMode={isViewMode}
          primaryColor={primaryColor}
          lightBorder={lightBorder}
        />
      )}
    </>
          ):indent.CATEGORY_TYPE === 'Maintenance' ? (
             <MaintenanceDraftTable 
                items={items} setItems={setItems} plant={indent.PLANT} plantCode={plantCodeOnly}
                projectType={indent.PRJ_TYPE} indentType={indent.INDENT_TYPE}
                subTab={subTab} isViewMode={isViewMode}
                primaryColor={primaryColor} lightBorder={lightBorder}
            />
          )
          :(
            <RMCDraftTable 
                items={items} setItems={setItems} plant={indent.PLANT} plantCodeOnly={plantCodeOnly}
                projectType={indent.PRJ_TYPE} indentType={indent.INDENT_TYPE}
                subTab={subTab} isViewMode={isViewMode}
                primaryColor={primaryColor} lightBorder={lightBorder}
            />
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-center gap-4 p-3 mt-2 mb-2 rounded-lg bg-gray-50">
            <button type="button" onClick={() => openConfirmModal('save')} className="flex items-center gap-1.5 px-4 py-1.5 text-white text-[11px] font-semibold rounded shadow-lg hover:shadow-xl transition-all border-2" style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>
                <Save className="w-3.5 h-3.5" /> Save Indent
            </button>
            <button type="button" onClick={() => openConfirmModal('submit')} disabled={loading} className="flex items-center gap-1.5 px-4 py-1.5 text-white text-[11px] font-semibold rounded shadow-lg hover:shadow-xl transition-all border-2" style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>
                {loading ? "Submitting..." : <><Check className="w-4 h-4" /> Submit Indent</>}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ ADDED MODAL COMPONENT */}
      <WaterDocUploadModal 
         show={quotationDocModal} 
         onClose={() => setquotationDocModal(false)} 
         linkDocs={newFiles} 
         setLinkDocs={setNewFiles} 
         title="Upload Docs" 
      />

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-none bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="w-full max-w-md p-6 mx-4 bg-white border-black rounded-lg shadow-xl border-1">
            <h3 className="mb-4 text-xl font-semibold">{confirmModal.title}</h3>
            <p className="mb-6 text-gray-600 whitespace-pre-line">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
               <button onClick={() => setConfirmModal({ isOpen: false, action: null })} className="px-4 py-2 border rounded-lg">Cancel</button>
               <button onClick={() => handleSubmit(confirmModal.action === 'save' ? 'Draft' : 'Submit')} className="px-4 py-2 text-white bg-blue-600 rounded-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal.isOpen && (
        <div className="fixed inset-0 bg-none bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="w-full max-w-md p-6 mx-4 text-center bg-white border-black rounded-lg shadow-xl border-1">
             <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
             <h3 className="mb-2 text-xl font-semibold">Success!</h3>
             <p className="mb-6 text-gray-600">{successModal.message}</p>
             <button onClick={() => { setSuccessModal({ isOpen: false }); navigate(-1); }} className="px-6 py-2 text-white rounded-lg" style={{ backgroundColor: primaryColor }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftForm;