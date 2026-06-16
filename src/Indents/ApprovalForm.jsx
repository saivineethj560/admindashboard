import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  X,
  Undo2,
  CheckCircle,
} from "lucide-react";
import { useLocation, useNavigate , useParams} from "react-router-dom";
import axios from "axios";

import { API_BASE_URL_INDENT, API_DOC_URL_INDENT } from "../Config";
// Add token automatically to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// import { API_BASE_URL, API_DOC_URL } from "./Config";
import { useIndent } from "./IndentContext";

// Import your separated table components
// ADJUST THE PATH IF NECESSARY (e.g., "./Tables/ProjectApprovalTable")
import ProjectApprovalTable from "./IndentTables/ProjectApprovalTable"; 
import RMCApprovalTable from "./IndentTables/RMCApprovalTable";
import MaintenanceApprovalTable from "./IndentTables/MaintenanceApprovalTable";
import ActionConfirmModal from "./ActionConfirmModal"; 
// Configure axios
axios.defaults.baseURL = API_BASE_URL_INDENT;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ApprovalForm = ({ mainType = "Material", tileType, subTab }) => {
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
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [comments, setComments] = useState("");
  const [showRevertButton, setShowRevertButton] = useState(false);

  // User Data
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const username = storedUser?.username || "";
  const displayName = storedUser?.name || "";
  const email = storedUser?.email || "";

  const { selectedIndent } = useIndent();
  // Use Context first, fallback to URL param
  const caseId = selectedIndent?.CASEID || urlCaseId; 

  // Add this log to debug exactly what is happening
  console.log("Context ID:", selectedIndent?.CASEID);
  console.log("URL ID:", urlCaseId);
  console.log("Effective caseId:", caseId);
  // const caseId = selectedIndent?.CASEID;
const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  console.log("userToken-", userToken);
  console.log("userToken-", userToken.username);

  // Modals
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, title: '', message: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, action: null, message: '' });

  // Logic Flags
  const isPlanningQS = indent?.CUR_TASK === "PLANNING_QS";
  const showLogs = ["PRJ_INCHARGE", "PRJ_HEAD", "PRESIDENT_PRJ", "PRESIDENT", "DIRECTOR_PRJ", "PLANNING_QS"].includes(indent?.CUR_TASK);
  const showPlanningQSRemarks = ["PRJ_INCHARGE", "PRJ_HEAD", "PRESIDENT_PRJ", "PRESIDENT", "DIRECTOR_PRJ", "PLANNING_QS"].includes(indent?.CUR_TASK);

  // Revert Button Visibility
  useEffect(() => {
    const revertEnabledTasks = ["PLANNING_QS", "PRESIDENT_PRJ", "PRESIDENT", "DIRECTOR_PRJ"];
    setShowRevertButton(revertEnabledTasks.includes(indent?.CUR_TASK));
  }, [indent?.CUR_TASK]);

  // Handle item change (e.g., Planning QS Remarks)
  const handleItemChange = (index, field, value) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return updatedItems;
    });
  };
 
  // Fetch details
  useEffect(() => {
    const fetchIndentDetails = async () => {
      if (!caseId) return;

      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL_INDENT}/indent-details/${caseId}`);
        const responseData = res.data.data;
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
            wdesc: item.WDESC || "", // Important for RMC
            mat_code: item.MAT_CODE || "",
            mat_desc: item.MAT_DESC || "",
            mat_group: item.MAT_GRP || "",
            uom: item.UOM || "",
            short_text: item.SHORT_TEXT || "",
            quantity: item.QUAN || "",
            till_indent: item.TILL_INDENT || "",
            reqnow: item.REQ_NOW || "",
            balqty: item.BAL_QTY || "",
            // balqty: (parseFloat(item.QUAN || 0) - parseFloat(item.TILL_INDENT || 0)).toString(),
            Remarks: item.REMARKS || "",
            planningQSRemarks: item.PLANNING_QS_REMARKS || "",
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

  // Selection Logic
  const handleCheckboxChange = (index) => {
    if (isViewMode) return;
    setSelectedItems((prev) => prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]);
  };

  const handleSelectAll = () => {
    if (isViewMode) return;
    setSelectedItems(selectAll ? [] : items.map((_, index) => index));
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    setSelectAll(items.length > 0 && selectedItems.length === items.length);
  }, [selectedItems, items]);

  // Actions
  // const openConfirmModal = (action) => {
  //   const modalConfig = {
  //     approve: { title: 'Approve Request', message: `Case ID: ${caseId}\n\nAre you sure you want to approve ${selectedItems.length} selected item(s)?` },
  //     reject: { title: 'Reject Request', message: `Case ID: ${caseId}\n\nAre you sure you want to reject ${selectedItems.length} selected item(s)? Ensure comments are added.` },
  //     revert: { title: 'Revert Request', message: `Case ID: ${caseId}\n\nAre you sure you want to revert ${selectedItems.length} selected item(s)?` }
  //   };
  //   setConfirmModal({ isOpen: true, action, ...modalConfig[action] });
  // };

  // Actions
  const openConfirmModal = (action) => {
  const selectedCount = selectedItems.length;
  const unselectedCount = items.length - selectedCount;

  setConfirmModal({
    isOpen: true,
    action,
    title: action === 'approve' ? 'Review Submission' : 
           action === 'reject' ? 'Confirm Rejection' : 'Confirm Revert',
    counts: {
      selected: selectedCount,
      unselected: unselectedCount
    }
  });
};

  const closeSuccessModal = () => setSuccessModal({ isOpen: false, action: null, message: '' });

  const handleApprove = async () => {
    if (selectedItems.length === 0) return;
    setConfirmModal({ isOpen: false, action: null, title: '', message: '' });
    setLoading(true);

    try {
      const selected = items.filter((_, index) => selectedItems.includes(index));
      const unselected = items.filter((_, index) => !selectedItems.includes(index));

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
        selectedItems,
        selectedItemsData: selected,
        unselectedItemsData: unselected,
        comments,
        // user: { username, displayName, email },
        user: {
          username: userToken.username,
          displayName: userToken.employee,
          email: userToken.Email,
        },
      };

       // -------------------------------------------------------
      // 🔍 DEBUGGING LOGS - Check your browser console
      // -------------------------------------------------------
      console.group("🚀 Approval Submission Debug");
      console.log("🔹 Case ID:", caseId);
      console.log("🔹 Current Task:", indent.CUR_TASK);
      console.log("✅ Selected Indices:", selectedItems);
      console.log("📦 Selected Items Data (Payload):", selected);
      console.log("🚫 Unselected Items Data (Payload):", unselected);
      console.log("📤 FULL PAYLOAD SENT TO API:", approvalData);
      console.groupEnd();
      // -------------------------------------------------------

      let apiEndpoint = `${API_BASE_URL_INDENT}/indent-approval`;
      if (indent.CUR_TASK === "PM") apiEndpoint += "-pm";
      else if (indent.CUR_TASK === "PLANNING_QS") apiEndpoint += "-planningqs";
      else if (indent.CUR_TASK === "PRJ_INCHARGE") apiEndpoint += "-prjincharge";
      else if (indent.CUR_TASK === "PRJ_HEAD") apiEndpoint += "-prjhead";
      else if (indent.CUR_TASK === "PRESIDENT_PRJ") apiEndpoint += "-presprj";
      else if (indent.CUR_TASK === "PRESIDENT") apiEndpoint += "-pres";
      else if (indent.CUR_TASK === "DIRECTOR_PRJ") apiEndpoint += "-directorprj";
      else if (indent.CUR_TASK === "EVC") apiEndpoint += "-evc";

      await axios.post(apiEndpoint, approvalData);
      setSuccessModal({ isOpen: true, action: 'approve', message: `Case ID: ${caseId}\n\nSuccessfully approved ${selectedItems.length} item(s)!` });
      setSelectedItems([]);
    } catch (error) {
      setNotification({ show: true, type: "error", message: "Failed to approve items" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (selectedItems.length === 0) return;
    setConfirmModal({ isOpen: false, action: null, title: '', message: '' });
    setLoading(true);

    try {
      const rejectionData = {
        caseId,
        CUR_TASK: indent.CUR_TASK,
        PLANT: indent.PLANT,
        RAISER: indent.RAISER,
        EMP_ID: indent.EMP_ID,
        PRJ_TYPE: indent.PRJ_TYPE,
        INDENT_TYPE: indent.INDENT_TYPE,
        TILE_TYPE: indent.TILE_TYPE,
        action: "reject",
        comments,
        selectedItems,
        items: items.filter((_, index) => selectedItems.includes(index)),
        // user: { username, displayName, email },
        user: {
          username: userToken.username,
          displayName: userToken.employee,
          email: userToken.Email,
        },
      };

      await axios.post(`${API_BASE_URL_INDENT}/indent-rejection`, rejectionData);
      setSuccessModal({ isOpen: true, action: 'reject', message: `Case ID: ${caseId}\n\nSuccessfully rejected ${selectedItems.length} item(s)!` });
      setSelectedItems([]);
    } catch (error) {
      setNotification({ show: true, type: "error", message: "Failed to reject items" });
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async () => {
    if (selectedItems.length === 0) return;
    setConfirmModal({ isOpen: false, action: null, title: '', message: '' });
    setLoading(true);

    try {
      const selected = items.filter((_, index) => selectedItems.includes(index));
      const unselected = items.filter((_, index) => !selectedItems.includes(index));

      const revertData = {
        caseId,
        CUR_TASK: indent.CUR_TASK,
        PLANT: indent.PLANT,
        RAISER: indent.RAISER,
        RAISER_MAIL: indent.EMP_MAIL,
        EMP_ID: indent.EMP_ID,
        PRJ_TYPE: indent.PRJ_TYPE,
        INDENT_TYPE: indent.INDENT_TYPE,
        TILE_TYPE: indent.TILE_TYPE,
        action: "revert",
        comments,
        selectedItems,
        selectedItemsData: selected,
        unselectedItemsData: unselected,
        // user: { username, displayName, email },
        user: {
          username: userToken.username,
          displayName: userToken.employee,
          email: userToken.Email,
        },
      };

      await axios.post(`${API_BASE_URL_INDENT}/indent-revert`, revertData);
      setSuccessModal({ isOpen: true, action: 'revert', message: `Case ID: ${caseId}\n\nSuccessfully reverted ${selectedItems.length} item(s)!` });
      setSelectedItems([]);
      setComments("");
    } catch (error) {
      setNotification({ show: true, type: "error", message: "Failed to revert items" });
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = "#28556e";
  const lightBorder = "#7ba5b8";

   console.log("🔍 Current PRJ_TYPE state:", indent.PRJ_TYPE);
   
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
        <h1 className="flex-1 text-lg font-semibold tracking-wide text-center text-white">Approval Form</h1>
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
            {/* {indent?.PRJ_TYPE === "RMC" || indent?.PRJ_TYPE === "Maintenance" ? ( */}
            {indent?.PRJ_TYPE === "RMC"  ? (
              <RMCApprovalTable 
                items={items}
                selectedItems={selectedItems}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onCheckboxChange={handleCheckboxChange}
                isViewMode={isViewMode}
                showPlanningQSRemarks={showPlanningQSRemarks}
                isPlanningQS={isPlanningQS}
                onItemChange={handleItemChange}
                lightBorder={lightBorder}
                mainType={indent.INDENT_TYPE} 
              />
            ) : indent?.PRJ_TYPE === "Maintenance"  ? (
            // ) : indent.PRJ_TYPE === "Maintenance" || indent.PRJ_TYPE.endsWith("(NB)")  ? (
              <MaintenanceApprovalTable 
                items={items}
                selectedItems={selectedItems}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onCheckboxChange={handleCheckboxChange}
                isViewMode={isViewMode}
                showPlanningQSRemarks={showPlanningQSRemarks}
                isPlanningQS={isPlanningQS}
                onItemChange={handleItemChange}
                lightBorder={lightBorder}
                mainType={indent.INDENT_TYPE} 
              />
            ) : (indent.CATEGORY_TYPE === "Projects" && indent.PRJ_TYPE.endsWith("(B)")) ? (
    /* 3. Projects (B) Trigger */
    <ProjectApprovalTable 
      items={items}
      selectedItems={selectedItems}
      selectAll={selectAll}
      onSelectAll={handleSelectAll}
      onCheckboxChange={handleCheckboxChange}
      isViewMode={isViewMode}
      showPlanningQSRemarks={showPlanningQSRemarks}
      isPlanningQS={isPlanningQS}
      onItemChange={handleItemChange}
      lightBorder={lightBorder}
      mainType={indent.INDENT_TYPE} 
    />
  ) : (
    /* 4. Default Fallback */
    <MaintenanceApprovalTable 
                items={items}
                selectedItems={selectedItems}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onCheckboxChange={handleCheckboxChange}
                isViewMode={isViewMode}
                showPlanningQSRemarks={showPlanningQSRemarks}
                isPlanningQS={isPlanningQS}
                onItemChange={handleItemChange}
                lightBorder={lightBorder}
                mainType={indent.INDENT_TYPE} 
              />
  )}
          </div>

          {/* Comments & Buttons */}
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
              {/* {showRevertButton && ( */}
                <button type="button" onClick={() => openConfirmModal('revert')} disabled={loading || selectedItems.length === 0} className="flex items-center gap-1.5 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded shadow-lg border-2 border-orange-600 disabled:opacity-50">
                  <Undo2 className="w-4 h-4" /> Revert Selected
                </button>
              {/*  )} */}
              <button type="button" onClick={() => openConfirmModal('approve')} disabled={loading || selectedItems.length === 0} className="flex items-center gap-1.5 px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded shadow-lg border-2 border-green-600 disabled:opacity-50">
                <Check className="w-4 h-4" /> Approve Selected
              </button>
              <button type="button" onClick={() => openConfirmModal('reject')} disabled={loading || selectedItems.length === 0} className="flex items-center gap-1.5 px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded shadow-lg border-2 border-red-600 disabled:opacity-50">
                <X className="w-4 h-4" /> Reject Selected
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Confirmation Modal */}
      {/* {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 bg-none">
          <div className="w-full max-w-md p-6 mx-4 bg-white border rounded-lg shadow-2xl">
            <h3 className="mb-4 text-xl font-semibold">{confirmModal.title}</h3>
            <p className="mb-6 text-gray-600 whitespace-pre-line">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmModal({ isOpen: false, action: null })} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={confirmModal.action === 'approve' ? handleApprove : confirmModal.action === 'reject' ? handleCancel : handleRevert} className={`px-4 py-2 text-white rounded-lg ${confirmModal.action === 'approve' ? 'bg-green-600' : confirmModal.action === 'reject' ? 'bg-red-600' : 'bg-orange-600'}`}>Confirm</button>
            </div>
          </div>
        </div>
      )} */}

      {/* Success Modal remains as is, but replace Confirm Modal with this: */}
<ActionConfirmModal 
  isOpen={confirmModal.isOpen}
  config={confirmModal}
  caseId={caseId}
  onClose={() => setConfirmModal({ isOpen: false, action: null })}
  onConfirm={
    confirmModal.action === 'approve' ? handleApprove : 
    confirmModal.action === 'reject' ? handleCancel : 
    handleRevert
  }
/>

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

export default ApprovalForm;