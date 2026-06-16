import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { HiCheck, HiX, HiArrowLeft } from 'react-icons/hi';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../Config';
import MaterialApprovalTable from './MaterialApprovalTable';

const MaterialMasterApproval = () => {
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
    name: "",
    emp_id: "",
    designation: "",
    department: "",
    email: "",
    plant: "",
    profit_center: "",
    request_type: "",
    cur_status: "",
    cur_task: "",
    cur_usr: "",
    items: []
  });

  useEffect(() => {
    // Safety timeout - show page after 5 seconds even if API hasn't responded
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("Loading timeout - showing page anyway");
        setIsLoading(false);
        Swal.fire({
          title: "Timeout",
          text: "Request is taking too long. Showing page with available data.",
          icon: "warning",
          timer: 3000
        });
      }
    }, 5000);

    const fetchRequestDetails = async () => {
      if (!case_id) {
        setIsLoading(false);
        clearTimeout(timeoutId);
        return;
      }
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}material-request-details/${case_id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken?.token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result);

        if (result.success && result.data) {
          const apiData = result.data;
          // setFormData(prev => ({
          //   ...prev,
          //   ...result.data
          // }));
           setFormData({
        // State Name : API Data Name
        date: apiData.date || "",
        name: apiData.requestor_name || "",      // Fixed: maps requestor_name to name
        emp_id: apiData.emp_id || "",
        designation: apiData.desig || "",        // Fixed: maps desig to designation
        department: apiData.department || "",
        email: apiData.email || "",
        plant: apiData.plant || "",
        profit_center: apiData.profit_center || "",
        request_type: apiData.req_type || "",    // Fixed: maps req_type to request_type
        cur_status: apiData.cur_status || "",
        cur_task: apiData.cur_task || "",
        cur_usr: apiData.cur_usr || "",
        items: apiData.items || []               // Items are inside the data object
      });
        } else {
          console.error("API returned unsuccessful response:", result);
          Swal.fire({
            title: "Warning",
            text: result.message || "Failed to load details. Showing empty form.",
            icon: "warning"
          });
        }
      } catch (error) {
        console.error("Error fetching details:", error);
        Swal.fire({
          title: "Connection Error",
          text: "Could not connect to server. Showing empty form.",
          icon: "error"
        });
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    fetchRequestDetails();

    return () => clearTimeout(timeoutId);
  }, [case_id, userToken?.token]);

  const handleRowSelect = (index) => {
    setSelectedRows(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(formData.items.map((_, index) => index));
    } else {
      setSelectedRows([]);
    }
  };

  const handleAction = (status) => {
    // 1. Get the Request Type (Creation or Extension)
    const requestType = formData.request_type; 
    
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsProcessing(true);
        
        // 2. SELECT API BASED ON REQUEST TYPE
        let apiEndpoint = "";

        if (requestType === 'Creation') {
          apiEndpoint = `${API_BASE_URL}material-creation-approval-submit`;
        } else if (requestType === 'Extension') {
          apiEndpoint = `${API_BASE_URL}material-extension-approval-submit`;
        } else {
          setIsProcessing(false);
          console.error("Invalid Request Type:", requestType);
          return Swal.fire("Error", "Invalid Request Type: " + requestType, "error");
        }

        try {
          const payload = {
            name: formData.name,
            emp_id: formData.emp_id,
            plant: formData.plant,
            email: formData.email,
            case_id: case_id,
            status: status,
            remarks: approvalComments,
            cur_task: formData.cur_task,
            request_type: requestType,
            username: userToken.token,
            selected_items: selectedItems,
            unselected_items: unselectedItems
          };

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
            navigate('/dashboard', { state: { refresh: true } });
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

  const labelStyle = "w-1/4 text-indigo-800 font-semibold text-[10px] pr-2 uppercase";
  const readonlyStyle = "w-full border border-gray-300 rounded-lg py-1 px-2 text-xs bg-gray-50 cursor-not-allowed text-gray-700";

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      <p className="font-semibold text-indigo-800">Loading Request Details...</p>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-3 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
            <img src="../mat_mastquote.png" alt="Logo" className="object-contain h-10 rounded-lg w-38" />
            <div className="px-4 py-1 bg-indigo-900 rounded-lg">
              <h1 className="text-base font-bold tracking-wide text-white uppercase">Material Request Approval</h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-all font-semibold text-xs shadow-sm"
            >
              <HiArrowLeft size={16} /> Back
            </button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-5">
              {/* Status Image */}
              <div className="flex flex-col items-center justify-center p-3 border border-blue-100 shadow-inner lg:col-span-1 bg-gradient-to-b from-blue-50 to-white rounded-xl self-stretch min-h-[160px]">
                <img src="../mat_masterimg.png" alt="Material Request Icon" className="object-contain w-full h-full" />
              </div>

              {/* Form Data */}
              <div className="space-y-2 lg:col-span-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex items-center">
                    <label className={labelStyle}>Request Date</label>
                    <input type="text" value={formData.date} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center">
                    <label className={labelStyle}>Employee ID</label>
                    <input type="text" value={formData.emp_id} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center">
                    <label className={labelStyle}>Email</label>
                    <input type="text" value={formData.email} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center">
                    <label className={labelStyle}>Name</label>
                    <input type="text" value={formData.name} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center">
                    <label className={labelStyle}>Department</label>
                    <input type="text" value={formData.department} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center">
                    <label className={labelStyle}>Designation</label>
                    <input type="text" value={formData.designation} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center">
                    <label className={labelStyle}>Plant</label>
                    <input type="text" value={formData.plant} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center">
                    <label className={labelStyle}>Profit Center</label>
                    <input type="text" value={formData.profit_center} readOnly className={readonlyStyle} />
                  </div>
                  <div className="flex items-center">
                    <label className={labelStyle}>Material Type</label>
                    <input type="text" value={formData.request_type} readOnly className={readonlyStyle} />
                  </div>
                </div>
              </div>
            </div>

            {/* Material Approval Table Component */}
            <MaterialApprovalTable
              items={formData.items}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
              requestType={formData.request_type}
            />

            {/* Comments */}
            <div className="p-3 mt-4 bg-white border border-gray-200 rounded-lg">
              <label className="block mb-1 text-xs font-semibold text-indigo-900 uppercase">
                {formData.cur_task === 'MANAGER' ? 'Manager Comments' :
                  formData.cur_task === 'HEAD' ? 'Head Comments' :
                    formData.cur_task === 'VP' ? 'VP Comments' : 'Approval Comments'}
              </label>
              <textarea
                rows="2"
                className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your remarks here..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-3">
              <button
                onClick={() => handleAction('Approved')}
                disabled={isProcessing}
                className="flex items-center gap-2 px-8 py-2 text-sm font-bold text-white uppercase transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                <HiCheck size={18} /> Approve
              </button>
              <button
                onClick={() => handleAction('Rejected')}
                disabled={isProcessing}
                className="flex items-center gap-2 px-8 py-2 text-sm font-bold text-white uppercase transition-all rounded-lg shadow-md bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
              >
                <HiX size={18} /> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialMasterApproval;
