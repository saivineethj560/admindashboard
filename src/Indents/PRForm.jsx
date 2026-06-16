import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Send, // Icon for Submit
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// import { API_BASE_URL, API_DOC_URL } from "./Config";


import { API_BASE_URL_INDENT, API_DOC_URL_INDENT } from "../Config";
// Add token automatically to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
import { useIndent } from "./IndentContext";

// Import your separated table components
import ProjectApprovalTable from "./IndentTables/ProjectPRTable"; 
import RMCApprovalTable from "./IndentTables/RMCPRTable";

// Configure axios
axios.defaults.baseURL = API_BASE_URL_INDENT;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const PRForm = ({ mainType = "Material", tileType, subTab }) => {
  const { case_id: urlCaseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isViewMode = location.state?.viewMode || false;
  
  // State management
  const [indent, setIndent] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [documents, setDocuments] = useState([]);
  const [comments, setComments] = useState("");

  // User Data
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const username = storedUser?.username || "";
  const displayName = storedUser?.name || "";
  const email = storedUser?.email || "";

  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
    console.log("userToken-", userToken);
    console.log("userToken-", userToken.username);
    

  const { selectedIndent } = useIndent();
  // Use Context first, fallback to URL param
  const caseId = selectedIndent?.CASEID || urlCaseId; 

  // Add this log to debug exactly what is happening
  console.log("Context ID:", selectedIndent?.CASEID);
  console.log("URL ID:", urlCaseId);
  console.log("Effective caseId:", caseId);
  // const caseId = selectedIndent?.CASEID;

  // Modals
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  // Logic Flags
  const isPlanningQS = indent?.CUR_TASK === "PLANNING_QS";
  const showLogs = ["PRJ_INCHARGE", "PRJ_HEAD", "PRESIDENT_PRJ", "PRESIDENT", "DIRECTOR_PRJ", "PLANNING_QS"].includes(indent?.CUR_TASK);
  const showPlanningQSRemarks = ["PRJ_INCHARGE", "PRJ_HEAD", "PRESIDENT_PRJ", "PRESIDENT", "DIRECTOR_PRJ", "PLANNING_QS"].includes(indent?.CUR_TASK);

  // ✅ Handle Item Change (Updates Status, PR Number, Remarks)
  const handleItemChange = (index, field, value) => {
    // console.log(`Updating Item ${index} - Field: ${field} - Value: ${value}`); // Debug log

    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return updatedItems;
    });
  };
 
  // Fetch details
  useEffect(() => {
    const fetchIndentDetails = async () => {
      console.log("Attempting to fetch details for caseId:", caseId);
      if (!caseId) return;

      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL_INDENT}/indent-details/${caseId}`);
        const responseData = res.data.data;
          // 👇 ADD THIS LOG HERE 👇
        console.log("📋 Indent Details from API:", responseData);
        const lineItems = responseData.line_items || [];

        const topFields = lineItems.length > 0 ? {
                CASEID: lineItems[0].CASEID || "",
                EMP_ID: lineItems[0].EMPID || "",
                RAISER: lineItems[0].EMP_NAME || "",
                EMP_MAIL: lineItems[0].EMP_MAILID || "",
                DEPT: lineItems[0].DEPT || "",
                PLANT: lineItems[0].PLANT || "",
                PRJ_TYPE: lineItems[0].PRJ_TYPE || "",
                INDENT_TYPE: lineItems[0].INDENT_TYPE || "",
                TILE_TYPE: lineItems[0].TILE_TYPE || "",
                CATEGORY_TYPE: lineItems[0].CATEGORY_TYPE || "",
                RAISER_DATE: responseData.approval.RAISER_DATE || "",
                CUR_TASK: lineItems[0].CUR_TASK || "",
              } : {};

        setIndent({ ...topFields, line_items: lineItems });

        setItems(
          lineItems.map((item) => ({
            SNO: item.SNO || "",
            wbs: item.WBS_ELE || "",
            subwbs: item.SUBWBS_ELE || "",
            wdesc: item.WDESC || "", 
            mat_code: item.MAT_CODE || "",
            mat_desc: item.MAT_DESC || "",
            mat_group: item.MAT_GRP || "",
            uom: item.UOM || "",
            quantity: item.QUAN || "",
            till_indent: item.TILL_INDENT || "",
            reqnow: item.REQ_NOW || "",
            balqty: (parseFloat(item.QUAN || 0) - parseFloat(item.TILL_INDENT || 0)).toString(),
            Remarks: item.REMARKS || "",
            planningQSRemarks: item.PLANNING_QS_REMARKS || "",
            status: item.PR_STATUS || "",     // Map API field 'PR_STATUS' to frontend 'status'
            prNumber: item.PR_NUMBER || ""    // Map API field 'PR_NUMBER' to frontend 'prNumber'
          }))
        );

        if (lineItems.length > 0) {
          const firstItem = lineItems[0];
          const docPaths = firstItem.DOC_PATHS ? JSON.parse(firstItem.DOC_PATHS) : [];
          const docNames = firstItem.DOC_NAMES ? JSON.parse(firstItem.DOC_NAMES) : [];
          setDocuments(docPaths.map((path, idx) => ({
            name: docNames[idx] || path.split("/").pop(),
            path: path,
          })));
        } else {
          setDocuments([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching indent details:", err);
        setLoading(false);
      }
    };

    fetchIndentDetails();
  }, [caseId]);

  // Actions
  const openConfirmModal = () => {
    setConfirmModal({ 
      isOpen: true, 
      title: 'Submit Request', 
      message: `Case ID: ${caseId}\n\nAre you sure you want to submit this form with ${items.length} item(s)?` 
    });
  };

  const closeSuccessModal = () => setSuccessModal({ isOpen: false, message: '' });

  // ✅ Updated Single Submit Function with Validation
  const handleSubmit = async () => {
    
    // 1. Validation Step
    const invalidItems = items.filter(item => item.status === "Completed" && (!item.prNumber || item.prNumber.trim() === ""));

    if (invalidItems.length > 0) {
      setNotification({ 
        show: true, 
        type: "error", 
        message: `Please enter PR Number for ${invalidItems.length} completed item(s).` 
      });
      setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
      setConfirmModal({ isOpen: false, title: '', message: '' });
      return; 
    }

    setConfirmModal({ isOpen: false, title: '', message: '' });
    setLoading(true);

    try {
      const approvalData = {
        caseId,
        CUR_TASK: indent.CUR_TASK,
        PLANT: indent.PLANT,
        RAISER: indent.RAISER,
        EMP_ID: indent.EMP_ID,
        PRJ_TYPE: indent.PRJ_TYPE,
        INDENT_TYPE: indent.INDENT_TYPE,
        TILE_TYPE: indent.TILE_TYPE,
        action: "approve", 
        selectedItems: items.map((_, index) => index), 
        selectedItemsData: items, // Contains 'status' and 'prNumber'
        unselectedItemsData: [], 
        comments,
        // user: { username, displayName, email },
        user: {
          username: userToken.username,
          displayName: userToken.employee,
          email: userToken.Email,
        },
      };

      console.log("🚀 Payload to API:", approvalData);

      let apiEndpoint = `${API_BASE_URL_INDENT}/pr-submit`;
      
      await axios.post(apiEndpoint, approvalData);
      setSuccessModal({ isOpen: true, message: `Case ID: ${caseId}\n\nSuccessfully submitted!` });
    } catch (error) {
      console.error("API Error:", error);
      setNotification({ show: true, type: "error", message: "Failed to submit items" });
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = "#28556e";
  const lightBorder = "#7ba5b8";

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="relative">
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-lg shadow-lg ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mt-1 mb-2 px-4 py-1.5 bg-[#28556E] border border-[#28556E] rounded-md shadow-sm flex items-center justify-between">
        <h1 className="flex-1 text-lg font-semibold tracking-wide text-center text-white">PR Form</h1>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-[#28556E] rounded-md bg-white hover:bg-gray-100 border border-[#28556E] absolute right-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <form className="mb-1 overflow-hidden bg-white border-2 shadow-lg rounded-xl" style={{ borderColor: primaryColor }}>
        <div className="p-2 space-y-2">
          {/* Header Fields & Documents */}
          <div className="flex gap-1.5">
            <div className="flex-1 p-2 border-2 rounded-lg" style={{ borderColor: lightBorder }}>
               <div className="grid grid-cols-1 gap-2 mb-2 md:grid-cols-4">
                  <div><label className="block text-[14px] font-semibold text-gray-700 mb-1">Case ID</label><input type="text" value={indent.CASEID || caseId || ""} readOnly className="w-full px-2 py-1 text-[14px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "32px" }} /></div>
                  <div><label className="block text-[14px] font-semibold text-gray-700 mb-1">Raiser Emp ID</label><input type="text" value={indent?.EMP_ID || ""} readOnly className="w-full px-2 py-1 text-[14px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "32px" }} /></div>
                  <div><label className="block text-[14px] font-semibold text-gray-700 mb-1">Raiser Name</label><input type="text" value={indent?.RAISER || ""} readOnly className="w-full px-2 py-1 text-[14px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "32px" }} /></div>
                  <div><label className="block text-[14px] font-semibold text-gray-700 mb-1">Raiser Email</label><input type="text" value={indent?.EMP_MAIL || ""} readOnly className="w-full px-2 py-1 text-[14px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "32px" }} /></div>
               </div>
               <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  <div><label className="block text-[14px] font-semibold text-gray-700 mb-1">Dept</label><input type="text" value={indent?.DEPT || ""} readOnly className="w-full px-2 py-1 text-[14px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "32px" }} /></div>
                  <div><label className="block text-[14px] font-semibold text-gray-700 mb-1">Plant</label><input type="text" value={indent?.PLANT || ""} readOnly className="w-full px-2 py-1 text-[14px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "32px" }} /></div>
                  <div><label className="block text-[14px] font-semibold text-gray-700 mb-1">Project Type</label><input type="text" value={indent?.PRJ_TYPE || ""} readOnly className="w-full px-2 py-1 text-[14px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "32px" }} /></div>
                  <div><label className="block text-[14px] font-semibold text-gray-700 mb-1">Raised Date</label><input type="text" value={indent?.RAISER_DATE ? new Date(indent.RAISER_DATE).toISOString().slice(0, 10) : ""} readOnly className="w-full px-2 py-1 text-[14px] bg-gray-50 rounded" style={{ border: `1px solid ${lightBorder}`, height: "32px" }} /></div>
               </div>
            </div>

            <div className="p-2 border-2 rounded-lg" style={{ borderColor: lightBorder, maxWidth: "500px" }}>
              <h5 className="mb-3 text-primary">Documents</h5>
              {documents.length > 0 ? (
                <ul className="list-group">
                  {documents.map((doc, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-gray-50 border rounded px-2 py-[2px]">
                      <a href={`${API_DOC_URL_INDENT}/${doc.path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 truncate hover:underline">{doc.name}</a>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-muted">No documents.</p>}
            </div>
          </div>

          {/* DYNAMIC TABLE RENDERING */}
          <div className="mt-[-4]">
            {indent?.PRJ_TYPE === "RMC" || indent?.PRJ_TYPE === "Maintenance" ? (
              <RMCApprovalTable 
                items={items}
                isViewMode={isViewMode}
                showPlanningQSRemarks={showPlanningQSRemarks}
                isPlanningQS={isPlanningQS}
                onItemChange={handleItemChange} // Passed correctly
                lightBorder={lightBorder}
                indentType={indent.INDENT_TYPE}
              />
            ) : (
              <ProjectApprovalTable 
                items={items}
                isViewMode={isViewMode}
                showPlanningQSRemarks={showPlanningQSRemarks}
                isPlanningQS={isPlanningQS}
                onItemChange={handleItemChange} // Passed correctly
                lightBorder={lightBorder}
                indentType={indent.INDENT_TYPE}
              />
            )}
          </div>

          {/* Comments & Submit Button */}
          <div className="flex items-center justify-center gap-4 p-3 mt-2 mb-2 rounded-lg bg-gray-50">
             {showLogs && (
               <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-1">Logs</label>
                <textarea readOnly className="w-60 px-2 py-1 text-[11px] bg-gray-100 rounded cursor-not-allowed" style={{ border: `1px solid ${lightBorder}`, height: "40px" }} />
               </div>
             )}
             <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-1">Comments<span className="text-red-500">*</span></label>
                <textarea value={comments} onChange={(e) => setComments(e.target.value)} disabled={isViewMode} className="w-60 px-2 py-1 text-[11px] bg-white rounded" style={{ border: `1px solid ${lightBorder}`, height: "40px" }} placeholder="Enter comments..." />
             </div>
          </div>

          {!isViewMode && (
            <div className="flex items-center justify-center gap-4 p-3 mt-2 mb-2 rounded-lg bg-gray-50">
              {/* Single Submit Button */}
              <button 
                type="button" 
                onClick={openConfirmModal} 
                disabled={loading} 
                className="flex items-center gap-1.5 px-6 py-2 bg-[#28556e] hover:bg-[#1e3f52] text-white text-sm font-semibold rounded shadow-lg border-2 border-[#28556e] disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" /> Submit
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 bg-none">
          <div className="w-full max-w-md p-6 mx-4 bg-white border rounded-lg shadow-2xl">
            <h3 className="mb-4 text-xl font-semibold">{confirmModal.title}</h3>
            <p className="mb-6 text-gray-600 whitespace-pre-line">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmModal({ isOpen: false, title: '', message: '' })} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 text-white rounded-lg bg-[#28556e] hover:bg-[#1e3f52]">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 bg-none">
          <div className="w-full max-w-md p-6 text-center bg-white border rounded-lg shadow-2xl">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
            <h3 className="mb-2 text-xl font-semibold">Success!</h3>
            <p className="mb-6 text-gray-600 whitespace-pre-line">{successModal.message}</p>
            <button onClick={() => { closeSuccessModal(); navigate(-1); }} className="px-6 py-2 text-white bg-green-600 rounded-lg">OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PRForm;