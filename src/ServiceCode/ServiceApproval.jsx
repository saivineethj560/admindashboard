import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiCheck, HiX, HiDownload } from "react-icons/hi";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../Config";
import ServiceApprovalTable from "./ServiceApprovalTable";

const ServiceApproval = () => {
  const navigate = useNavigate();
  const { case_id } = useParams();

  const [userToken] = useState(() => {
    const info = localStorage.getItem("userInfo");
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
    items: [],
    files: [],
  });

  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!case_id) return;
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}service-request-details/${case_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken?.token}`,
            },
          },
        );
        const result = await response.json();
        if (result.success) {
          setFormData((prev) => ({ ...prev, ...result.data }));
        } else {
          Swal.fire(
            "Error",
            result.message || "Failed to load details",
            "error",
          );
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
  
  // Calculate which items are selected and which are not
  const selectedItems = formData.items.filter((_, index) => selectedRows.includes(index));
  const unselectedItems = formData.items.filter((_, index) => !selectedRows.includes(index));

  if (selectedItems.length === 0) {
    Swal.fire("Selection Required", "Please select at least one item.", "warning");
    return;
  }

  if (status === 'Rejected' && !approvalComments.trim()) {
    Swal.fire("Required", "Please provide a reason for rejection.", "warning");
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
    text: `Confirm ${status.toLowerCase()} for ${selectedItems.length} items?`,
    icon: status === 'Approved' ? 'question' : 'warning',
    showCancelButton: true,
    confirmButtonColor: status === 'Approved' ? '#059669' : '#dc2626',
  }).then(async (result) => {
    if (result.isConfirmed) {
      setIsProcessing(true);
      
      const apiEndpoint = `${API_BASE_URL}approve-service-request`; 

      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken.token}`
          },
          body: JSON.stringify({
            case_id: case_id,
            status: status,
            remarks: approvalComments,
            requestor_name: formData.requestor_name,
            emp_id: formData.emp_id,
            email: formData.email,
            username: formData.username,
            cur_task: currentTask,
            // THESE KEYS MUST MATCH YOUR LARAVEL CONTROLLER
            selected_items: selectedItems, 
            unselected_items: unselectedItems 
          })
        });

        const res = await response.json();
        if (res.success) {
          await Swal.fire('Success', res.message || `Request ${status}ed`, 'success');
          navigate('/dashboard');
        } else {
          throw new Error(res.message || "Update failed");
        }
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      } finally {
        setIsProcessing(false);
      }
    }
  });
};

  const handleItemUpdate = (index, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, items: updatedItems };
    });
  };

  const labelStyle =
    "w-2/3 text-indigo-800 font-bold text-[11px] pr-2 uppercase";
  const readonlyStyle =
    "w-full border-2 border-blue-300 rounded-lg py-1.5 px-4 text-xs bg-gradient-to-r from-gray-50 to-gray-100 cursor-not-allowed text-gray-700 font-medium shadow-sm transition-all duration-200";

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
        <p className="font-semibold text-indigo-800">
          Loading Request Details...
        </p>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="overflow-hidden bg-white border-2 border-blue-200 shadow-xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-blue-300 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100">
          <div className="flex items-center">
            <img
              src="../scquote.png"
              alt="Logo"
              className="object-contain h-8 transition-all duration-300 rounded shadow-sm hover:scale-105"
            />
          </div>

          <div className="flex items-center gap-3 bg-gradient-to-r from-[#4183a5] via-[#4f95bb] to-[#3a7590] px-16 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            <span className="text-2xl">✅</span>
            <h1 className="text-lg font-bold tracking-wider text-white uppercase">
              Service Approval Portal
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-blue-500 hover:bg-blue-50 rounded-full p-1.5 border border-blue-400 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 bg-gradient-to-b from-white to-gray-50">
          {/* Top section: image + fields */}
          <div className="grid items-start grid-cols-1 gap-4 mb-4 lg:grid-cols-4">
            {/* Icon Section — fixed height */}
            <div className="flex flex-col items-center justify-center p-3 transition-all duration-300 border-2 border-blue-200 shadow-lg lg:col-span-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl hover:shadow-xl hover:scale-105 h-[175px]">
              <img
                src="../slogo.png"
                alt="Approval Icon"
                className="object-contain w-full h-full transition-transform duration-300 hover:scale-110"
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-3 lg:col-span-3">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">📅</span>
                    Request Date
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    readOnly
                    className={readonlyStyle}
                  />
                </div>
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">👤</span>
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.emp_id}
                    readOnly
                    className={readonlyStyle}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">✍️</span>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.requestor_name}
                    readOnly
                    className={readonlyStyle}
                  />
                </div>
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">📧</span>
                    Email
                  </label>
                  <input
                    type="text"
                    value={formData.email}
                    readOnly
                    className={readonlyStyle}
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">🏢</span>
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    readOnly
                    className={readonlyStyle}
                  />
                </div>
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">📞</span>
                    Contact No
                  </label>
                  <input
                    type="text"
                    value={formData.cont_no}
                    readOnly
                    className={readonlyStyle}
                  />
                </div>
              </div>

              {/* Row 4 — Attachments */}
              {formData.files?.length > 0 && (
                <div className="flex items-center group">
                  <label className={`${labelStyle} flex items-center gap-1`}>
                    <span className="text-blue-500">📎</span>
                    Attachments
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border-2 border-blue-200 text-[10px] text-blue-800 font-medium shadow-sm hover:shadow-md hover:border-blue-400 hover:text-indigo-600 transition-all duration-200"
                      >
                        <HiDownload size={12} />
                        <span className="truncate max-w-[120px]">
                          {file.file_name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table Section */}
          <div className="border-t border-gray-100">
            <ServiceApprovalTable
              items={formData.items}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              currentTask={formData.cur_task}
              onUpdateItem={handleItemUpdate}
            />
          </div>

          {/* Comments */}
          <div className="p-4 mt-4 border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl">
            <label className="block mb-2 text-[11px] font-bold text-indigo-800 uppercase flex items-center gap-1">
              <span className="text-blue-500">💬</span>
              {formData.cur_task === "STORES_HEAD"
                ? "Stores Head Comments"
                : formData.cur_task === "VP"
                  ? "VP Comments"
                  : "Approval Comments"}
            </label>
            <textarea
              rows="2"
              className="w-full p-3 text-sm transition-all duration-200 border-2 border-blue-300 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400"
              placeholder="Enter your remarks here..."
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 mt-6">
            <button
              onClick={() => handleAction("Approved")}
              disabled={isProcessing}
              className="flex items-center gap-3 px-10 py-3 text-sm font-bold tracking-wider text-white uppercase transition-all duration-300 transform rounded-full shadow-lg bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 hover:from-emerald-600 hover:to-green-700 hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              {isProcessing ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <HiCheck size={20} />
              )}
              Approve
            </button>

            <button
              onClick={() => handleAction("Rejected")}
              disabled={isProcessing}
              className="flex items-center gap-3 px-10 py-3 text-sm font-bold tracking-wider text-white uppercase transition-all duration-300 transform rounded-full shadow-lg bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-700 hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              {isProcessing ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <HiX size={20} />
              )}
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceApproval;
