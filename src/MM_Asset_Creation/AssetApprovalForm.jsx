import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../Config";
import {
  HiArrowLeft,
  HiOutlineCube,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineOfficeBuilding,
  HiOutlineMap,
  HiOutlineTag,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineLibrary,
  HiOutlineLocationMarker,
  HiOutlineCollection,
  HiOutlineHashtag,
  HiOutlineClipboardList,
  HiOutlineScale,
  HiOutlineBeaker,
  HiOutlineTruck,
  HiOutlineStatusOnline,
  HiOutlineGlobe,
  HiOutlineHome,
  HiOutlineViewGrid,
  HiOutlineDocumentText,
  HiOutlineShoppingCart,
  HiOutlineAnnotation,
  HiOutlineCurrencyRupee,
} from "react-icons/hi";
import Swal from "sweetalert2";

const AssetApprovalForm = () => {
  const { case_id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [actionAttempted, setActionAttempted] = useState(false);
  const [userToken] = useState(
    () => JSON.parse(localStorage.getItem("userInfo")) || {},
  );

  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [financeModalType, setFinanceModalType] = useState(""); // 'Approved' or 'Rejected'
  const [assetNum, setAssetNum] = useState("");
  const [financeRemarks, setFinanceRemarks] = useState("");

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}asset-details/${case_id}`,
          {
            headers: { Authorization: `Bearer ${userToken.token}` },
          },
        );
        const result = await response.json();
        if (result.success) {
          setFormData(result.data);
        } else {
          Swal.fire("Error", "Could not fetch asset details", "error");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (case_id) fetchAssetDetails();
  }, [case_id, userToken.token]);

  // 1. Intercept the action buttons

  // 1. Updated: Pass an empty object {} instead of a string ""
  const handleInitiateAction = (status) => {
    if (formData?.cur_task === "FI_CONSULTANT") {
      setFinanceModalType(status);
      setShowFinanceModal(true);
    } else {
      // Normal flow for PM or others - passing empty object
      handleAction(status, {});
    }
  };

  const handleAction = async (status, additionalData = {}) => {
    const actionText = status === "Approved" ? "Approve" : "Reject";

    setActionAttempted(true);

    // if (!remarks.trim()) {
    //   Swal.fire({
    //     title: 'Remarks Required',
    //     text: `Please provide remarks before ${actionText === 'Approve' ? 'approving' : 'rejecting'} the asset.`,
    //     icon: 'warning',
    //   //  confirmButtonColor: '#4f46e5',
    //     confirmButtonText: 'OK'
    //   });
    //   return;
    // }

    const confirm = await Swal.fire({
      title: `${actionText} Asset Registration?`,
      text: `Case ID: ${case_id}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: status === "Approved" ? "#059669" : "#dc2626",
      confirmButtonText: `Yes, ${actionText}`,
    });

    if (confirm.isConfirmed) {
      setIsSubmitting(true);

      const payload = {
        case_id: case_id,
        company_code: formData?.COMP_CODE,
        PLANT: formData?.PLANT,
        requestor_name: formData?.REQ_NAME,
        requestor_email: formData?.REQ_EMAIL,
        requestor_dept: formData?.DEPT,
        WBS_NO: formData?.WBS_NO,
        WBS_DESCP: formData?.WBS_DESCP,
        ASST_NAME: formData?.ASST_NAME,
        ASSET_VALUE: formData?.ASSET_VALUE,
        ASSET_CLASS: formData?.ASSET_CLASS,
        status: status,
        approverName: userToken.employee,
        approveremail: userToken.Email,
        cur_task: formData?.cur_task,
        remarks: additionalData.remarks || remarks, // Uses modal remarks or main remarks
        asset_number: additionalData.asset_num || "",
        approverusername: userToken.username,
      };

      let apiEndpoint = "";
      if (formData?.cur_task === "PM") apiEndpoint = "pm_approval";
      else if (formData?.cur_task === "FI_CONSULTANT")
        apiEndpoint = "finance_approval";

      try {
        const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken.token}`,
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.success) {
          await Swal.fire("Updated", `Asset has been ${status}`, "success");
          navigate(-1);
        } else {
          Swal.fire("Error", result.message || "Action failed", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Failed to connect to server", "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 3. Finance Modal Submit Handler
  const handleFinanceSubmit = (e) => {
    e.preventDefault();
    if (financeModalType === "Approved" && !assetNum.trim()) {
      Swal.fire("Required", "Please enter the Asset Number", "warning");
      return;
    }
    if (financeModalType === "Rejected" && !financeRemarks.trim()) {
      Swal.fire("Required", "Please enter rejection remarks", "warning");
      return;
    }

    handleAction(financeModalType, {
      asset_num: assetNum,
      remarks: financeRemarks,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-600">
            Loading Asset Details...
          </p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <HiOutlineXCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-bold text-red-500">Asset Not Found</p>
        </div>
      </div>
    );
  }

  const labelStyle =
    "flex items-center gap-1.5 text-[10px] font-bold text-gray-700 mb-1 tracking-wide uppercase";
  const inputStyle =
    "w-full border border-gray-200 rounded-lg py-1.5 px-3 text-xs text-gray-800 bg-white shadow-sm";
  // const remarksHasError = actionAttempted && !remarks.trim();


  const renderAttachments = () => {
    if (!formData?.ATTACHMENTS) return <span className="text-[10px] italic text-gray-400">No attachments found</span>;
  
    // Split the comma-separated string into an array
    const files = formData.ATTACHMENTS.split(',').filter(f => f.trim() !== "");
  
    return (
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <a
            key={index}
            // Assuming your API_BASE_URL is something like http://localhost:8000/api/
            // We go up one level to find the public/AssetCreation folder
            href={`${API_BASE_URL.replace('/api/', '/')}public/AssetCreation/${file}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all shadow-sm group"
          >
            <HiOutlineDocumentText size={14} className="text-indigo-500" />
            <span className="text-[10px] font-bold text-indigo-900 truncate max-w-[150px]">
              {file.replace(case_id + "_", "")} {/* Shows original name without CaseID prefix */}
            </span>
            <HiOutlineTag size={10} className="text-gray-400 group-hover:text-indigo-400" />
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* ── Outer Container ── */}
      <div className="p-3 border border-blue-200 shadow-xl bg-gradient-to-br from-slate-100 to-blue-100 rounded-2xl">
        {/* ── Header Card ── */}
        <div className="mb-2 overflow-hidden border shadow-xl rounded-2xl border-white/60">
          {/* Title Bar */}
          <div className="relative px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 to-transparent" />
            <div className="flex items-center justify-center gap-2.5 relative">
              <div className="p-1.5 bg-white/20 rounded-lg ring-1 ring-white/30">
                <HiOutlineCube className="text-white" size={15} />
              </div>
              <h1 className="text-sm font-extrabold text-white tracking-[0.15em] uppercase drop-shadow">
                Asset Approval Review
              </h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 ring-1 ring-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            >
              <HiArrowLeft size={12} /> Back
            </button>
          </div>

          {/* User Info Strip */}
          <div className="px-5 py-3 border-t border-indigo-100 bg-gradient-to-r from-white via-slate-50 to-white">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {[
                {
                  icon: HiOutlineCalendar,
                  bg: "bg-blue-100",
                  ring: "ring-blue-200",
                  iconCls: "text-blue-600",
                  label: "Date",
                  value: formData.REGISTRATION_DT,
                },
                {
                  icon: HiOutlineUser,
                  bg: "bg-violet-100",
                  ring: "ring-violet-200",
                  iconCls: "text-violet-600",
                  label: "Requester",
                  value: formData.REQ_NAME,
                },
                {
                  icon: HiOutlineMail,
                  bg: "bg-pink-100",
                  ring: "ring-pink-200",
                  iconCls: "text-pink-600",
                  label: "Email",
                  value: formData.REQ_EMAIL,
                  extra: "col-span-2 md:col-span-1",
                },
                {
                  icon: HiOutlineBriefcase,
                  bg: "bg-indigo-100",
                  ring: "ring-indigo-200",
                  iconCls: "text-indigo-600",
                  label: "Designation",
                  value: formData.DESIGN,
                },
                {
                  icon: HiOutlineOfficeBuilding,
                  bg: "bg-emerald-100",
                  ring: "ring-emerald-200",
                  iconCls: "text-emerald-600",
                  label: "Department",
                  value: formData.DEPT || "N/A",
                },
              ].map(
                ({ icon: Icon, bg, ring, iconCls, label, value, extra }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 min-w-0 ${extra || ""}`}
                  >
                    <div
                      className={`p-1.5 ${bg} ring-1 ${ring} rounded-lg shrink-0`}
                    >
                      <Icon className={iconCls} size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                        {label}
                      </p>
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {value}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* ── Form Grid ── */}
        <div className="grid grid-cols-1 gap-2 mb-2 lg:grid-cols-2 xl:grid-cols-4">
          {/* 1. Organizational Data — Blue */}
          <div className="bg-gradient-to-br from-blue-200 to-indigo-200 rounded-2xl shadow-md hover:shadow-xl border-2 border-blue-500 border-t-[3px] border-t-blue-500 p-4 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-blue-300/70">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-sm shadow-blue-200">
                <HiOutlineOfficeBuilding size={14} className="text-white" />
              </div>
              <h2 className="text-[11px] font-extrabold text-blue-900 tracking-wider uppercase">
                Organizational Data
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelStyle}>
                  <HiOutlineLibrary size={14} className="text-blue-700" />
                  Company Code
                </label>
                <div className={inputStyle}>{formData.COMP_CODE}</div>
              </div>
              <div>
                <label className={labelStyle}>
                  <HiOutlineOfficeBuilding
                    size={14}
                    className="text-blue-700"
                  />
                  Plant Code
                </label>
                <div className={inputStyle}>{formData.PLANT}</div>
              </div>
              <div>
                <label className={labelStyle}>
                  <HiOutlineCollection size={14} className="text-blue-700" />
                  WBS / Cost Center
                </label>
                <div className={inputStyle}>{formData.WBS_NO || "N/A"}</div>
              </div>
              <div>
                <label className={labelStyle}>
                  <HiOutlineDocumentText size={14} className="text-blue-700" />
                  WBS Description
                </label>
                <div className="w-full border border-blue-300 rounded-lg py-1.5 px-3 text-xs bg-blue-100 text-blue-800 font-semibold">
                  {formData.WBS_DESCP || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Asset Specification — Purple */}
          <div className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl shadow-md hover:shadow-xl border-2 border-purple-500 border-t-[3px] border-t-purple-500 p-4 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-purple-300/70">
              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-sm shadow-purple-200">
                <HiOutlineCube size={14} className="text-white" />
              </div>
              <h2 className="text-[11px] font-extrabold text-purple-900 tracking-wider uppercase">
                Asset Specification
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelStyle}>
                  <HiOutlineCube size={14} className="text-purple-700" />
                  Asset Name
                </label>
                <div className={inputStyle}>{formData.ASST_NAME}</div>
              </div>
              <div>
                <label className={labelStyle}>
                  <HiOutlineViewGrid size={14} className="text-purple-700" />
                  Asset Class
                </label>
                <div className={inputStyle}>{formData.ASSET_CLASS}</div>
              </div>
              {/* <div>
                <label className={labelStyle}>
                  <HiOutlineHashtag size={14} className="text-purple-700" />
                  Total Units
                </label>
                <div className={inputStyle}>{formData.SIMILAR_ASSET_NO}</div>
              </div> */}
               {/* 👇 Units and Value displayed side-by-side 👇 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelStyle}>
                    <HiOutlineHashtag size={14} className="text-purple-700" />
                    Total Units
                  </label>
                  <div className={inputStyle}>{formData.SIMILAR_ASSET_NO || "1"}</div>
                </div>
                <div>
                  <label className={labelStyle}>
                    <HiOutlineCurrencyRupee size={14} className="text-purple-700" />
                    Asset Value
                  </label>
                  <div className={inputStyle}>
                    {/* Note: Ensure ASST_VAL matches the key returned by your API */}
                    {formData.ASSET_VALUE || "0.00"}
                  </div>
                </div>
              </div>
              <div>
                <label className={labelStyle}>
                  <HiOutlineShoppingCart
                    size={14}
                    className="text-purple-700"
                  />
                  Purchase Type
                </label>
                <div className={inputStyle}>{formData.ASST_PURCHASE_TYPE}</div>
              </div>
            </div>
          </div>

          {/* 3. Inventory & Capitalization — Emerald */}
          <div className="bg-gradient-to-br from-emerald-200 to-teal-200 rounded-2xl shadow-md hover:shadow-xl border-2 border-emerald-500 border-t-[3px] border-t-emerald-500 p-4 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-emerald-300/70">
              <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-sm shadow-emerald-200">
                <HiOutlineTag size={14} className="text-white" />
              </div>
              <h2 className="text-[11px] font-extrabold text-emerald-900 tracking-wider uppercase">
                Inventory & Capitalization
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelStyle}>
                  <HiOutlineHashtag size={14} className="text-emerald-700" />
                  S.No
                </label>
                <div className={inputStyle}>{formData.SERIAL_NUM || "N/A"}</div>
              </div>
              <div>
                <label className={labelStyle}>
                  <HiOutlineClipboardList
                    size={14}
                    className="text-emerald-700"
                  />
                  Inventory Number
                </label>
                <div className={inputStyle}>{formData.INV_NUM || "N/A"}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelStyle}>
                    <HiOutlineScale size={14} className="text-emerald-700" />
                    Quantity
                  </label>
                  <div className={inputStyle}>{formData.QTY}</div>
                </div>
                <div>
                  <label className={labelStyle}>
                    <HiOutlineBeaker size={14} className="text-emerald-700" />
                    UOM
                  </label>
                  <div className={inputStyle}>{formData.UOM || "NOS"}</div>
                </div>
              </div>
              <div>
                <label className={labelStyle}>
                  <HiOutlineTruck size={14} className="text-emerald-700" />
                  Vendor
                </label>
                <div className={inputStyle}>{formData.VENDOR_NAME}</div>
              </div>
              <div>
                <label className={labelStyle}>
                  <HiOutlineCalendar size={14} className="text-emerald-700" />
                  Capitalization Date
                </label>
                <div className={inputStyle}>{formData.CAPITALIZED_DT}</div>
              </div>
            </div>
          </div>

          {/* 4. Location & Status — Orange */}
          <div className="bg-gradient-to-br from-orange-200 to-amber-200 rounded-2xl shadow-md hover:shadow-xl border-2 border-orange-500 border-t-[3px] border-t-orange-500 p-4 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-orange-300/70">
              <div className="p-1.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-sm shadow-orange-200">
                <HiOutlineMap size={14} className="text-white" />
              </div>
              <h2 className="text-[11px] font-extrabold text-orange-900 tracking-wider uppercase">
                Location & Status
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelStyle}>
                  <HiOutlineStatusOnline
                    size={14}
                    className="text-orange-700"
                  />
                  Status
                </label>
                <div className={inputStyle}>{formData.STATUS}</div>
              </div>
              <div>
                <label className={labelStyle}>
                  <HiOutlineGlobe size={14} className="text-orange-700" />
                  Zone
                </label>
                <div className={inputStyle}>{formData.ZONE}</div>
              </div>
              <div>
                <label className={labelStyle}>
                  <HiOutlineHome size={14} className="text-orange-700" />
                  Village
                </label>
                <div className={inputStyle}>{formData.MANDAL_VILLAGE}</div>
              </div>
              <div>
                <label className={labelStyle}>
                  <HiOutlineLocationMarker
                    size={14}
                    className="text-orange-700"
                  />
                  Location
                </label>
                <div className={inputStyle}>{formData.LOC}</div>
              </div>
            </div>
          </div>


          {/* 5. Attachments — Indigo */}
<div className="lg:col-span-2 xl:col-span-4 bg-gradient-to-r from-slate-100 to-indigo-50 rounded-xl shadow-sm border border-indigo-300 p-3 px-4 mt-2">
  <div className="flex flex-col md:flex-row items-center gap-6">
    
    {/* Label & Icon */}
    <div className="flex items-center gap-2 shrink-0 border-r border-indigo-200 pr-6">
      <div className="p-1.5 bg-indigo-500 rounded-md shadow-sm">
        <HiOutlineDocumentText size={14} className="text-white" />
      </div>
      <div>
        <h2 className="text-[11px] font-extrabold text-indigo-900 tracking-wider uppercase leading-none">Supporting</h2>
        <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-tighter">Documents</p>
      </div>
    </div>

    {/* File List */}
    <div className="flex-1">
      {renderAttachments()}
    </div>
    
  </div>
</div>

        </div>

        {/* ── Remarks + Action Buttons Row ── */}
        <div className="flex items-end gap-4">
          {/* Remarks Field — takes remaining space */}
          {/* <div className="flex-1">
            <label className={`${labelStyle} text-gray-700`}>
              <HiOutlineAnnotation size={14} className="text-indigo-600" />
              Remarks <span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="Enter remarks before approving or rejecting... (required)"
              className={`w-full border rounded-lg py-1.5 px-3 text-xs text-gray-800 focus:ring-2 outline-none bg-white transition-all shadow-sm placeholder-gray-400 resize-none ${remarksHasError
                  ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                  : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'
                }`}
            />
            {remarksHasError && (
              <p className="text-[10px] text-red-500 mt-0.5 font-semibold">⚠ Remarks are required before approving or rejecting.</p>
            )}
          </div> */}

          {/* Action Buttons — pinned to the right */}
          {/* <div className="flex gap-3 shrink-0 pb-0.5">
            <button
              type="button"
              disabled={isSubmitting}
              // onClick={() => handleAction('Rejected')}
            onClick={() => handleInitiateAction('Rejected')} // Changed
              className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white px-10 py-2.5 rounded-xl font-extrabold text-xs tracking-widest uppercase shadow-lg shadow-red-300/50 hover:shadow-xl hover:shadow-red-400/50 hover:scale-105 active:scale-100 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/15 to-transparent" />
              <HiOutlineXCircle size={15} />
              Reject
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              // onClick={() => handleAction('Approved')}
            onClick={() => handleInitiateAction('Approved')} // Changed
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-14 py-2.5 rounded-xl font-extrabold text-xs tracking-widest uppercase shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-400/50 hover:scale-105 active:scale-100 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/15 to-transparent" />
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <HiOutlineCheckCircle size={15} />
                  Approve
                </>
              )}
            </button>
          </div> */}

          {/* Action Buttons — pinned to the right */}
          <div className="flex gap-3 shrink-0 pb-0.5">
            {/* 👇 CONDITIONAL RENDERING: Hide Reject if task is PM */}
            {/* {formData?.cur_task !== "PM" && ( */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleInitiateAction("Rejected")}
                className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white px-10 py-2.5 rounded-xl font-extrabold text-xs tracking-widest uppercase shadow-lg shadow-red-300/50 hover:shadow-xl hover:shadow-red-400/50 hover:scale-105 active:scale-100 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/15 to-transparent" />
                <HiOutlineXCircle size={15} />
                Reject
              </button>
            {/* )} */}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleInitiateAction("Approved")}
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-14 py-2.5 rounded-xl font-extrabold text-xs tracking-widest uppercase shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-400/50 hover:scale-105 active:scale-100 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/15 to-transparent" />
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <HiOutlineCheckCircle size={15} />
                  Approve
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Finance Consultant Modal ── */}
        {showFinanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {financeModalType === "Approved"
                    ? "Complete Asset Creation"
                    : "Reject Request"}
                </h3>
                <button onClick={() => setShowFinanceModal(false)}>
                  <HiOutlineXCircle
                    className="text-gray-400 hover:text-red-500"
                    size={24}
                  />
                </button>
              </div>

              <form onSubmit={handleFinanceSubmit} className="space-y-4">
                {financeModalType === "Approved" ? (
                  <div>
                    <label className="block mb-1 text-xs font-bold text-gray-600 uppercase">
                      SAP Asset Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={assetNum}
                      onChange={(e) => setAssetNum(e.target.value)}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter generated Asset Number..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block mb-1 text-xs font-bold text-gray-600 uppercase">
                      Rejection Remarks <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      autoFocus
                      value={financeRemarks}
                      onChange={(e) => setFinanceRemarks(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-red-500"
                      placeholder="Explain why this request is being rejected..."
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFinanceModal(false)}
                    className="flex-1 px-4 py-2 text-xs font-bold text-gray-500 uppercase transition-colors bg-gray-100 rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 text-xs font-bold text-white uppercase rounded-xl transition-all shadow-lg ${
                      financeModalType === "Approved"
                        ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                        : "bg-red-600 hover:bg-red-700 shadow-red-200"
                    }`}
                  >
                    {isSubmitting ? "Processing..." : "Submit Action"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* ── End Outer Container ── */}
    </div>
  );
};

export default AssetApprovalForm;
