import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { HiHand,HiCheck, HiX, HiDownload, HiArrowLeft } from 'react-icons/hi';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../Config';
import ScrapUnassignTable from "./ScrapUnassignTable";

const ScrapSaleUnassignForm = () => {
  const navigate = useNavigate();
  const { case_id } = useParams();

  const [userToken] = useState(() => {
    const info = localStorage.getItem('userInfo');
    return info ? JSON.parse(info) : null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [approvalComments, setApprovalComments] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    requestor_name: userToken.employee || "",
    emp_id: userToken.Emp_Id || "",
    department: userToken.Department || "",
    email: userToken.Email || "",
    username: userToken.username || "",
    contact_no: "",
    profit_center: "",
    cur_status: "",
    cur_task: "",
    cur_usr: "",
    plant: "",

    STR_HEAD_REM: null,
    VP_REM: null,
    EVC_REM: null,
    
    items: [],
    files: []
  });

  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!case_id) return;
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}scrap-request-details/${case_id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken?.token}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setFormData(prev => ({ ...prev, ...result.data }));
        } else {
          Swal.fire("Error", result.message || "Failed to load details", "error");
        }
      } catch (error) {
        console.error("Error fetching details:", error);
        Swal.fire("Error", "Server connection failed", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequestDetails();
  }, [case_id, userToken?.token]);

  // const handleAction = (status) => {
  //   const currentTask = formData.cur_task;
  //   const selectedItems = formData.items.filter((_, index) => selectedRows.includes(index));
  //   const unselectedItems = formData.items.filter((_, index) => !selectedRows.includes(index));

  //   if (selectedItems.length === 0) {
  //     Swal.fire("Selection Required", "Please select at least one item to process.", "warning");
  //     return;
  //   }

  //   if (status === 'Rejected' && !approvalComments.trim()) {
  //     Swal.fire("Required", "Please provide a reason for rejection in the comments box.", "warning");
  //     return;
  //   }

  //   // Check 2: Mandatory comments for Partial Approval (when some items are unselected)
  //       const isPartialSelection = selectedRows.length < formData.items.length;
  //       if (status === 'Approved' && isPartialSelection && !approvalComments.trim()) {
  //         Swal.fire(
  //           "Comments Required", 
  //           "You have unselected some items. Please provide a reason or remarks in the comments box before approving.", 
  //           "warning"
  //         );
  //         return;
  //       }
    
  //       // --- END VALIDATION ---
  //   Swal.fire({
  //     title: `${status} Request?`,
  //     text: `Are you sure you want to ${status.toLowerCase()} ${selectedItems.length} items?`,
  //     icon: status === 'Approved' ? 'question' : 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, Proceed',
  //     confirmButtonColor: status === 'Approved' ? '#059669' : '#dc2626',
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       setIsProcessing(true);
  //       let apiEndpoint = "";
  //       try {
  //         if (currentTask === 'STORES_HEAD') apiEndpoint = `${API_BASE_URL}storehead_approval_sc`;
  //         else if (currentTask === 'VP') apiEndpoint = `${API_BASE_URL}vp_approval`;
  //         else if (currentTask === 'EVC') apiEndpoint = `${API_BASE_URL}evc_approval_sc`;

  //         const payload = {
  //           requestor_name: formData.requestor_name,
  //           emp_id: formData.emp_id,
  //           email: formData.email,
  //           username: formData.username,
  //           approverEmail: userToken.Email,
  //           approverName: userToken.employee,
  //           case_id: case_id,
  //           plant: formData.plant,
  //           status: status,
  //           remarks: approvalComments,
  //           cur_task: currentTask,
  //           selected_items: selectedItems,
  //           unselected_items: unselectedItems
  //         };

  //         const response = await fetch(apiEndpoint, {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken.token}` },
  //           body: JSON.stringify(payload)
  //         });

  //         const res = await response.json();
  //         if (res.success) {
  //           Swal.fire('Success', `Request has been ${status.toLowerCase()}`, 'success');
  //           navigate('/dashboard');
  //         } else {
  //           Swal.fire('Error', res.message || 'Update failed', 'error');
  //         }
  //       } catch (error) {
  //         Swal.fire('Error', 'Server Error: ' + error.message, 'error');
  //       } finally {
  //         setIsProcessing(false);
  //       }
  //     }
  //   });
  // };

  // UPDATED STYLES
  
  
  // --- NEW CLAIM ACTION ---
 
 
  const handleClaim = () => {
     const currentTask = formData.cur_task;
    const selectedItems = formData.items.filter((_, index) => selectedRows.includes(index));
    const unselectedItems = formData.items.filter((_, index) => !selectedRows.includes(index));
    Swal.fire({
      title: 'Claim this Task?',
      text: "This request will be assigned to your inbox for further processing.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Claim it',
      confirmButtonColor: '#4f46e5', // Indigo color
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsProcessing(true);
        try {
          const response = await fetch(`${API_BASE_URL}claim-scrap-task`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${userToken.token}` 
            },
            body: JSON.stringify({
              requestor_name: formData.requestor_name,
            emp_id: formData.emp_id,
            email: formData.email,
            username: formData.username,
            approverEmail: userToken.Email,
            approverName: userToken.employee,
            case_id: case_id,
            plant: formData.plant,
            status: 'claim',
            remarks: approvalComments,
            cur_task: currentTask,
             // SEND ALL ITEMS HERE:
            selected_items: formData.items, 
            unselected_items: [] 
             
            })
          });

          const res = await response.json();
          if (res.success) {
            Swal.fire('Task Claimed', 'The request is now in your inbox.', 'success');
            navigate('/dashboard'); // Go back to dashboard to see it in Inbox
          } else {
            Swal.fire('Error', res.message || 'Claiming failed', 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'Server Error: ' + error.message, 'error');
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };
  
  
  const labelStyle = "w-2/3 text-indigo-800 font-bold text-[11px] pr-2 uppercase";
  const readonlyStyle = "w-full border-2 border-blue-300 rounded-lg py-1.5 px-4 text-xs bg-gradient-to-r from-gray-50 to-gray-100 cursor-not-allowed text-gray-700 font-medium shadow-sm";

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      <p className="italic font-semibold text-indigo-800">Fetching request details...</p>
    </div>
  );

  return (
    <div className="px-2 py-4 mx-auto max-w-7xl">
      <div className="overflow-hidden bg-white border-2 border-blue-200 shadow-xl rounded-2xl">

        {/* Header - Matching Style */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-blue-300 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100">
          <div className="flex items-center">
            <img src="../scquote.png" alt="Logo" className="object-contain h-8 transition-transform rounded hover:scale-105" />
          </div>
          
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] px-12 py-2 rounded-lg shadow-md">
            <span className="text-2xl">⚖️</span>
            <h1 className="text-lg font-bold tracking-wider text-white uppercase">Scrap Approval Portal</h1>
          </div>
          
          <button type="button" onClick={() => navigate(-1)} className="text-blue-500 hover:bg-blue-50 rounded-full p-1.5 border border-blue-400 transition-all hover:scale-110">
            <HiArrowLeft size={18} />
          </button>
        </div>

        <div className="p-6 bg-gradient-to-b from-white to-gray-50">
          <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
            
            {/* Left Side: Illustration Container */}
            <div className="flex flex-col items-center justify-center p-4 transition-all duration-300 border-2 border-blue-200 shadow-lg lg:col-span-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl hover:shadow-xl">
              <img src="../sclimage.png" alt="Approval Icon" className="object-contain w-full h-full transition-transform duration-300 hover:scale-105" />
              <div className="mt-4 px-4 py-1 bg-white border border-blue-200 rounded-full shadow-sm text-[10px] font-bold text-blue-800 uppercase tracking-tighter">
                ID: {case_id}
              </div>
            </div>

            {/* Right Side: Data Fields */}
            <div className="space-y-3 lg:col-span-3">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">👤</span> Emp ID
                  </label>
                  <input type="text" value={formData.emp_id} readOnly className={readonlyStyle} />
                </div>
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">📅</span> Req Date
                  </label>
                  <input type="text" value={formData.date} readOnly className={readonlyStyle} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">✍️</span> Req By
                  </label>
                  <input type="text" value={formData.requestor_name} readOnly className={readonlyStyle} />
                </div>
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">📧</span> Email
                  </label>
                  <input type="text" value={formData.email} readOnly className={readonlyStyle} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">🏢</span> Dept
                  </label>
                  <input type="text" value={formData.department} readOnly className={readonlyStyle} />
                </div>
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">📞</span> Raiser Contact
                  </label>
                  <input type="text" value={formData.contact_no} readOnly className={readonlyStyle} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">🏭</span> Plant
                  </label>
                  <input type="text" value={formData.plant} readOnly className={readonlyStyle} />
                </div>
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">💰</span> Profit Center
                  </label>
                  <input type="text" value={formData.profit_center} readOnly className={readonlyStyle} />
                </div>
              </div>

              {/* Attachments Styling */}
              {formData.files?.length > 0 && (
                <div className="flex items-start pt-1 group">
                  <label className="w-[32.5%] text-indigo-800 font-bold text-[11px] uppercase pr-2 flex items-center gap-1">
                    <span className="text-blue-500">📎</span> Documents
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.files.map((file, idx) => (
                      <a key={idx} href={file.file_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-md border border-blue-200 text-[10px] font-bold text-blue-800 shadow-sm hover:border-blue-400 hover:scale-105 transition-all"
                      >
                        <HiDownload size={14} /> {file.file_name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table Section */}
          <div className="pt-2 mt-4 border-t border-gray-100">
            <ScrapUnassignTable
              items={formData.items}
              userToken={userToken}
              viewOnly={true}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
            />
          </div>


{/* Previous Remarks History */}
{(formData.EVC_REM || formData.VP_REM || formData.STR_HEAD_REM) && (
  <div className="p-3 mb-4 border border-blue-100 rounded-xl bg-blue-50/50">
    <h3 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-2">
      <span className="text-sm">💬</span> Previous Approval Remarks
    </h3>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      
      
      {/* Store Head Remark */}
      {formData.STR_HEAD_REM && (
        <div className="p-2 bg-white border border-blue-200 rounded-lg shadow-sm">
          <p className="text-[9px] font-bold text-indigo-700 uppercase">Store Head</p>
          <p className="mt-1 text-xs italic text-gray-700">"{formData.STR_HEAD_REM}"</p>
        </div>
      )}
      {/* VP Remark */}
      {formData.VP_REM && (
        <div className="p-2 bg-white border border-blue-200 rounded-lg shadow-sm">
          <p className="text-[9px] font-bold text-indigo-700 uppercase">VP </p>
          <p className="mt-1 text-xs italic text-gray-700">"{formData.VP_REM}"</p>
        </div>
      )}
      {/* From EVC Remark */}
      {formData.EVC_REM && (
        <div className="p-2 bg-white border border-blue-200 rounded-lg shadow-sm">
          <p className="text-[9px] font-bold text-indigo-700 uppercase">EVC </p>
          <p className="mt-1 text-xs italic text-gray-700">"{formData.EVC_REM}"</p>
        </div>
      )}
      
    </div>
  </div>
)}

          {/* Comments Section */}
          {/* <div className="p-4 mt-6 bg-white border-2 border-blue-100 shadow-inner rounded-2xl">
            <label className="flex items-center block gap-1 mb-2 text-xs font-bold tracking-wider text-indigo-900 uppercase">
              <span className="text-blue-500">💬</span>
              {formData.cur_task === 'STORES_HEAD' ? 'Stores Head Remarks' :
                formData.cur_task === 'VP' ? 'VP Remarks' : 'Approval Comments'}
            </label>
            <textarea
              rows="3"
              className="w-full p-3 text-sm transition-all border-2 border-gray-200 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
              placeholder="Enter your decision remarks here..."
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
            ></textarea>
          </div> */}

          {/* Action Buttons */}
          {/* <div className="flex justify-center gap-6 mt-8">
            <button
              onClick={() => handleAction('Approved')}
              disabled={isProcessing}
              className="flex items-center gap-3 px-12 py-3 text-sm font-black tracking-widest text-white uppercase transition-all rounded-full shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <HiCheck size={20} /> Approve Request
            </button>
            <button
              onClick={() => handleAction('Rejected')}
              disabled={isProcessing}
              className="flex items-center gap-3 px-12 py-3 text-sm font-black tracking-widest text-white uppercase transition-all rounded-full shadow-lg bg-gradient-to-r from-rose-500 to-red-600 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <HiX size={20} /> Reject Request
            </button>
          </div> */}

          {/* Action Footer */}
          <div className="flex flex-col items-center justify-center p-8 mt-8 border-2 border-indigo-200 border-dashed rounded-3xl bg-indigo-50/30">
            <p className="mb-4 text-xs font-medium text-indigo-600">
                This request is currently unassigned. Click below to claim it and move it to your inbox.
            </p>
            <button
              onClick={handleClaim}
              disabled={isProcessing}
              className="flex items-center gap-3 px-20 py-4 text-sm font-black tracking-widest text-white uppercase transition-all rounded-full shadow-xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <HiHand size={22} className="rotate-12" /> {isProcessing ? 'Processing...' : 'Claim Task'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ScrapSaleUnassignForm;