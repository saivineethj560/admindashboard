import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { HiCheck, HiX, HiDownload, HiArrowLeft } from 'react-icons/hi';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../Config';
import StockApprovalTable from "./StockApprovalTable";

const StockApprovalForm = () => {
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
    send_comp_code: "",
    cur_status: "",
    cur_task: "",
    cur_usr: "",
    send_plant_code: "",
    rec_plant_code: "",
    rec_comp_code: "",
    
    FRM_PLANT_INCH_REM: null,
    TO_PLANT_INCH_REM: null,
    STR_HEAD_REM: null,
    EVC_REM: null,
    FRM_PLANT_INCH_MAIL: null,
    TO_PLANT_INCH_MAIL: null,
    STR_HEAD_MAIL: null,
    EVC_MAIL: null,
    
    items: []
  });

  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!case_id) return;
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}stock-request-details/${case_id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken?.token}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setFormData(prev => ({
            ...prev,
            ...result.data
          }));
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

  const handleAction = (status) => {
    const currentTask = formData.cur_task;
    const selectedItems = formData.items.filter((_, index) => selectedRows.includes(index));
    const unselectedItems = formData.items.filter((_, index) => !selectedRows.includes(index));

    if (selectedItems.length === 0) {
      Swal.fire("Selection Required", "Please select at least one item to process.", "warning");
      return;
    }

    if (status === 'Rejected' && !approvalComments.trim()) {
      Swal.fire("Required", "Please provide a reason for rejection in the comments box.", "warning");
      return;
    }
     // Check 2: Mandatory comments for Partial Approval (when some items are unselected)
        const isPartialSelection = selectedRows.length < formData.items.length;
        if (status === 'Approved' && isPartialSelection && !approvalComments.trim()) {
          Swal.fire(
            "Comments Required", 
            "You have unselected some items. Please provide a reason or remarks in the comments box before approving.", 
            "warning"
          );
          return;
        }
        // --- END VALIDATION ---
    Swal.fire({
      title: `${status} Request?`,
      text: `Are you sure you want to ${status.toLowerCase()} ${selectedItems.length} items?`,
      icon: status === 'Approved' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Proceed',
      confirmButtonColor: status === 'Approved' ? '#059669' : '#dc2626',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsProcessing(true);
        let apiEndpoint = "";

        try {
          if (currentTask === 'STORES_HEAD') {
            apiEndpoint = `${API_BASE_URL}storehead_approval`;
          } else if (currentTask === 'FRM_PLANT_INCH') {
            apiEndpoint = `${API_BASE_URL}frm_plnt_approval`;
          }  else if (currentTask === 'TO_PLANT_INCH') {
            apiEndpoint = `${API_BASE_URL}to_plnt_approval`;
          } else if (currentTask === 'EVC') {
            apiEndpoint = `${API_BASE_URL}evc_approval`;
          }

          const payload = {
            requestor_name: formData.requestor_name,
            emp_id: formData.emp_id,
            email: formData.email,
            department: formData.department,
            username: formData.username,
            approverName: userToken.employee,
            approverEmail: userToken.Email,
            case_id: case_id,
            send_plant_code: formData.send_plant_code,
            send_comp_code: formData.send_comp_code,
            rec_plant_code: formData.rec_plant_code,
            rec_comp_code: formData.rec_comp_code,
            FRM_PLANT_INCH_MAIL: formData.FRM_PLANT_INCH_MAIL,
            TO_PLANT_INCH_MAIL: formData.TO_PLANT_INCH_MAIL,
            STR_HEAD_MAIL: formData.STR_HEAD_MAIL,
            EVC_MAIL: formData.EVC_MAIL,
            status: status,
            remarks: approvalComments,
            cur_task: currentTask,
            selected_items: selectedItems,
            unselected_items: unselectedItems
          };

          console.log("%c >>> SENDING DATA TO BACKEND <<< ", "background: #222; color: #bada55; font-size: 15px;");
          console.log("Endpoint:", apiEndpoint);
          console.log("Full Payload:", payload);
          console.log("Selected Items Count:", payload.selected_items.length);
          console.table(payload.selected_items);

          const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken.token}`
            },
            body: JSON.stringify(payload)
          });

          const res = await response.json();
          if (res.success) {
            Swal.fire('Success', `Request has been ${status.toLowerCase()}`, 'success');
            navigate('/dashboard');
          } else {
            Swal.fire('Error', res.message || 'Update failed', 'error');
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
  const inputBaseStyle = "w-full border-2 border-blue-300 rounded-lg py-1.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-blue-400";
  const readonlyStyle = `${inputBaseStyle} bg-gradient-to-r from-gray-50 to-gray-100 cursor-not-allowed text-gray-700 font-medium`;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      <p className="font-semibold text-indigo-800">Loading Request Details...</p>
    </div>
  );

  return (
   
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden bg-white border border-blue-200 shadow-xl rounded-xl">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-blue-300 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100">
          <div className="flex items-center">
            <img 
              src="../stquote.png"
              alt="Logo" 
              className="object-contain h-8 transition-all duration-300 rounded shadow-sm hover:scale-105" 
            />
          </div>
       
          
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] px-16 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            <span className="text-2xl">📦</span>
            <h1 className="text-lg font-bold tracking-wider text-white uppercase">
              Stock Approval Portal
            </h1>
          </div>
          
          <button type="button" onClick={() => navigate(-1)} className="text-blue-500 hover:bg-blue-50 rounded-full p-1.5 border border-blue-400 transition-all duration-200 hover:scale-110 active:scale-95">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

          <div className="p-3">
            <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-4">
              {/* Status Illustration */}
<div className="flex flex-col items-center justify-center p-4 transition-all duration-300 border-2 border-blue-200 shadow-lg lg:col-span-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl hover:shadow-xl hover:scale-105">            
        <img src="../033.png" alt="Approval Queue" className="object-contain w-full h-full" />
              </div>

              {/* Form Data */}
              <div className="space-y-1 lg:col-span-3">
                <div className="grid grid-cols-2 gap-x-6">
                  <div className="flex items-center">
                   <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">👤</span>Emp ID</label>
                    <input type="text" value={formData.emp_id} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">📅</span>Date</label>
                    <input type="text" value={formData.date} readOnly className={readonlyStyle} />
                  </div>
                  
                </div>

                <div className="grid grid-cols-2 gap-x-6">
                   <div className="flex items-center">
                   <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">✍️</span>Req By</label>
                    <input type="text" value={formData.requestor_name} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center">
                   <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">📧</span>Email</label>
                    <input type="text" value={formData.email} readOnly className={readonlyStyle} />
                  </div>
                 
                </div>

                <div className="grid grid-cols-2 gap-x-6">
                  <div className="flex items-center">
                    <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">🏢</span>Dept</label>
                    <input type="text" value={formData.department} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center">
                 <label className={`${labelStyle} flex items-center gap-1`}>
                      <span className="text-blue-500">📞</span>Raiser Contact</label>
                    <input type="text" value={formData.contact_no} readOnly className={readonlyStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6">
                   <div className="flex items-center">
                    <label className={`${labelStyle} text-green-700 flex items-center`}>
                      <span className="text-blue-500">🏭</span>Rec Comp</label>
                    <input type="text" value={formData.rec_comp_code} readOnly className={readonlyStyle} />
                  </div>
                
                  <div className="flex items-center">
                  <label className={`${labelStyle} text-green-700 flex items-center gap-1`}>
                      <span className="text-blue-500">🏭</span>Sender Comp</label>
                    <input type="text" value={formData.send_comp_code} readOnly className={readonlyStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6">
                  <div className="flex items-center">
                    <label className={`${labelStyle} text-green-700 flex items-center gap-1`}>
                      <span className="text-blue-500">🏗️</span>Rec Plant</label>
                    <input type="text" value={formData.rec_plant_code} readOnly className={readonlyStyle} />
                  </div>
                   <div className="flex items-center">
                      <label className={`${labelStyle} text-green-700 flex items-center gap-1`}>
                      <span className="text-blue-500">🏗️</span>Sender Plant</label>
                    <input type="text" value={formData.send_plant_code} readOnly className={readonlyStyle} />
                  </div>
                </div>
              </div>
            </div>

            {/* Table Component */}
            <div className="pt-2 mt-1 border-t border-gray-100">
              <StockApprovalTable
                items={formData.items}
                userToken={userToken}
                viewOnly={true}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
              />
            </div>

{/* Previous Remarks History */}
{(formData.FRM_PLANT_INCH_REM || formData.TO_PLANT_INCH_REM || formData.STR_HEAD_REM) && (
  <div className="p-3 mb-4 border border-blue-100 rounded-xl bg-blue-50/50">
    <h3 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-2">
      <span className="text-sm">💬</span> Previous Approval Remarks
    </h3>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      
      {/* From Plant Remark */}
      {formData.FRM_PLANT_INCH_REM && (
        <div className="p-2 bg-white border border-blue-200 rounded-lg shadow-sm">
          <p className="text-[9px] font-bold text-indigo-700 uppercase">From Plant Incharge</p>
          <p className="mt-1 text-xs italic text-gray-700">"{formData.FRM_PLANT_INCH_REM}"</p>
        </div>
      )}

      {/* To Plant Remark */}
      {formData.TO_PLANT_INCH_REM && (
        <div className="p-2 bg-white border border-blue-200 rounded-lg shadow-sm">
          <p className="text-[9px] font-bold text-indigo-700 uppercase">To Plant Incharge</p>
          <p className="mt-1 text-xs italic text-gray-700">"{formData.TO_PLANT_INCH_REM}"</p>
        </div>
      )}

      {/* Store Head Remark */}
      {formData.STR_HEAD_REM && (
        <div className="p-2 bg-white border border-blue-200 rounded-lg shadow-sm">
          <p className="text-[9px] font-bold text-indigo-700 uppercase">Store Head</p>
          <p className="mt-1 text-xs italic text-gray-700">"{formData.STR_HEAD_REM}"</p>
        </div>
      )}
    </div>
  </div>
)}

            {/* Comments Section */}
            <div className="p-2.5 mt-4 bg-white border border-gray-200 shadow-sm rounded-xl">
              <label className="block mb-1.5 text-[10px] font-bold tracking-wider text-indigo-900 uppercase">
                {formData.cur_task === 'STORES_HEAD' ? 'Stores Head Comments' :
                  formData.cur_task === 'FRM_PLANT_INCH' ? 'FRM_PLANT_INCH Comments' :
                    formData.cur_task === 'TO_PLANT_INCH' ? 'TO_PLANT_INCH Comments' :
                      formData.cur_task === 'EVC' ? 'EVC Comments' : 'Approval Comments'}
              </label>
              <textarea
                rows="2"
                className="w-full p-2 text-xs transition-all border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your remarks here..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6 mt-5">
              <button
                onClick={() => handleAction('Approved')}
                disabled={isProcessing}
className="flex items-center gap-3 px-10 py-3 text-sm font-bold tracking-wider text-white uppercase transition-all duration-300 bg-gradient-to-r from-[#4183a5] via-[#3e7e9b] to-[#3a7590] rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"              >
                <HiCheck size={20} /> Approve Request
              </button>
              <button
                onClick={() => handleAction('Rejected')}
                disabled={isProcessing}
className="flex items-center gap-3 px-10 py-3 text-sm font-bold tracking-wider text-white uppercase transition-all duration-300 bg-gradient-to-r from-[#F63049] via-[#F26076] to-[#F63049] rounded-full shadow-lg hover:from-red-500 hover:to-red-700 hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"              >
             
                <HiX size={20} /> Reject Request
              </button>
            </div>
          </div>
        </div>
      </div>
   
  );
};

export default StockApprovalForm;
