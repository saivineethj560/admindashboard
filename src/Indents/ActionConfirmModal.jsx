import React from "react";
import { CheckCircle, X, Undo2, AlertTriangle } from "lucide-react";

const ActionConfirmModal = ({ isOpen, config, caseId, onConfirm, onClose }) => {
  if (!isOpen || !config) return null;

  const { action, title, counts } = config;

  const themes = {
    approve: {
      headerBg: "bg-green-50",
      iconBg: "bg-green-100 text-green-700",
      btnBg: "bg-green-600 hover:bg-green-700",
      border: "border-green-100",
      icon: <CheckCircle size={20} />
    },
    reject: {
      headerBg: "bg-red-50",
      iconBg: "bg-red-100 text-red-700",
      btnBg: "bg-red-600 hover:bg-red-700",
      border: "border-red-200",
      icon: <X size={20} />
    },
    revert: {
      headerBg: "bg-orange-50",
      iconBg: "bg-orange-100 text-orange-700",
      btnBg: "bg-orange-600 hover:bg-orange-700",
      border: "border-orange-100",
      icon: <Undo2 size={20} />
    }
  };

  const theme = themes[action] || themes.approve;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center gap-3 ${theme.headerBg}`}>
          <div className={`p-2 rounded-full ${theme.iconBg}`}>
            {theme.icon}
          </div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-500">Case ID</span>
            <span className="text-sm font-bold text-[#28556e]">{caseId}</span>
          </div>

          <div className="space-y-4">
            {action === 'reject' ? (
              /* TOTAL REJECTION VIEW */
              <div className="p-4 rounded-lg border-2 border-red-100 bg-red-50 flex flex-col items-center text-center">
                <AlertTriangle className="text-red-600 mb-2" size={32} />
                <h4 className="text-red-800 font-bold text-base mb-1">Total Indent Rejection</h4>
                <p className="text-sm text-red-700 mb-3">
                  You are about to reject the <strong>entire indent</strong>. All items will be cancelled.
                </p>
                <div className="flex items-center justify-between w-full px-4 py-2 bg-white rounded border border-red-200">
                  <span className="text-sm font-semibold text-gray-600">Total Items Impacted:</span>
                  <span className="text-lg font-bold text-red-700">{counts?.total || 0}</span>
                </div>
              </div>
            ) : (
              /* APPROVE / REVERT VIEW */
              <>
                <div className={`flex items-center justify-between p-3 rounded-lg border ${theme.border} bg-white shadow-sm`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${action === 'approve' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <span className="text-sm font-semibold text-gray-700">
                      {action === 'approve' ? 'Items to Approve' : 'Items to Revert'}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${action === 'approve' ? 'text-green-700' : 'text-orange-700'}`}>
                    {counts?.selected || 0}
                  </span>
                </div>

                {action === 'approve' && counts?.unselected > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-sm font-semibold text-gray-700">Unselected (Auto-Reject)</span>
                    </div>
                    <span className="text-lg font-bold text-red-700">{counts.unselected}</span>
                  </div>
                )}
                
                {action === 'approve' && counts?.unselected === 0 && (
                   <p className="text-center text-xs text-gray-500 italic">All items in this case will be approved.</p>
                )}
              </>
            )}
          </div>

          {action === 'reject' && (
            <p className="mt-4 text-[11px] text-red-500 font-medium italic text-center leading-tight">
              * This action cannot be undone. Comments are mandatory for total rejection.
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex gap-3 justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`px-6 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-all active:scale-95 ${theme.btnBg}`}
          >
            {action === 'reject' ? 'Confirm Total Rejection' : 'Confirm & Process'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmModal;