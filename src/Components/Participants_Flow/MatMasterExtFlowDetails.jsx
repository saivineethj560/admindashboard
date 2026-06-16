// import React from 'react';
// import { Box, Typography, CircularProgress, Divider } from '@mui/material';

// const MatMasterExtFlowDetails = ({ flowLoading, flowData, formatDate, getStatusColor }) => {
//     if (flowLoading) {
//         return (
//             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
//                 <CircularProgress />
//                 <Typography sx={{ ml: 2 }}>Loading Material Master data...</Typography>
//             </Box>
//         );
//     }

//     if (!flowData || !flowData.data) {
//         return <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>No data available</Typography>;
//     }

//     const data = flowData.data;
//     const itemsArray = data.mmextension_items || [];
//     const firstItem = itemsArray[0] || {};

//     const getSafeStatusColor = (status) => {
//         const color = getStatusColor(status);
//         if (color === "#facc15" || status?.toLowerCase() === 'to_do') return "#b45309"; 
//         return color;
//     };

//     // HELPER: Find the name/date/status for a step by looking across ALL items (Robust Scanning)
//     const getStepInfo = (stepId, nameKey, statusKey, dateKey) => {
//         // Find any item processed at this step
//         const processedItem = itemsArray.find(item => item[nameKey] && item[nameKey].trim() !== "");
        
//         const statuses = itemsArray.map(item => item[statusKey]).filter(Boolean);
//         let finalStatus = null;
//         if (statuses.length > 0) {
//             // PRIORITY: If any item is approved, show Approve
//             if (statuses.some(s => s === 'Approve')) finalStatus = 'Approve';
//             else if (statuses.every(s => s === 'Reject')) finalStatus = 'Reject';
//             else finalStatus = statuses[0];
//         }

//         return {
//             name: data[nameKey] || processedItem?.[nameKey],
//             status: data[statusKey] || finalStatus,
//             date: data[dateKey] || processedItem?.[dateKey]
//         };
//     };

//     const allPossibleSteps = [
//         { 
//             id: 'MATERIALCREATOR', 
//             label: 'Material Creator', 
//             ...getStepInfo('MATERIALCREATOR', 'MAT_CREATOR_NAME', 'MAT_CREATOR_STATUS', 'MAT_CREATOR_DT'),
//             itemStatusKey: 'MAT_CREATOR_STATUS',
//             requiredPrevStatusKey: null 
//         },
//     ];

//     const activeSteps = allPossibleSteps.filter(step => {
//         const hasHistory = step.name && step.name.trim() !== "";
//         const isCurrentlyPending = itemsArray.some(item => item.CUR_TASK === step.id && item.CUR_STATUS === 'TO_DO');
//         return hasHistory || isCurrentlyPending;
//     });

//     // Grid config: Description, Code, Price, Remarks, Status
//     const gridConfig = "1.5fr 65px 50px 70px 65px";

//     const renderStepBox = (step) => {
//         const { name, label, status, date, itemStatusKey, requiredPrevStatusKey, id } = step;

//         const visibleItems = itemsArray.filter(item => {
//             if (!requiredPrevStatusKey) return true;
//             const prevStatus = item[requiredPrevStatusKey]?.toLowerCase();
//             return prevStatus === 'approve' || prevStatus === 'approved';
//         });

//         if (visibleItems.length === 0) return null;

//         const stepHasTodoItems = visibleItems.some(item => item.CUR_TASK === id && item.CUR_STATUS === 'TO_DO');
//         const displayName = name || (stepHasTodoItems ? visibleItems.find(i => i.CUR_TASK === id)?.CUR_USR : "Pending");
//         const displayStatus = status || (stepHasTodoItems ? "TO_DO" : "Pending");

//         return (
//             <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 1, backgroundColor: displayStatus === 'TO_DO' ? '#fffde7' : '#f5f5f5' }}>
//                 <Box sx={{ display: 'flex', gap: 1 }}>
//                     {/* Left side: Actor Info */}
//                     <Box sx={{ flex: 0.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
//                         <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '11px' }}>{displayName}</Typography>
//                         <Typography variant="caption" sx={{ color: 'gray', display: 'block', fontSize: '10px' }}>{label}</Typography>
//                         <Typography variant="body2" fontWeight="bold" sx={{ color: getSafeStatusColor(displayStatus), mt: 0.5, fontSize: '10px' }}>
//                             {displayStatus}
//                         </Typography>
//                         {date && <Typography sx={{ fontSize: '9px', mt: 0.5 }}>{formatDate(date)}</Typography>}
//                     </Box>

//                     {/* Right side: Items Table */}
//                     <Box sx={{ flex: 1.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
//                         <Box sx={{ display: 'grid', gridTemplateColumns: gridConfig, gap: '4px', borderBottom: '1px solid #ddd', pb: 0.5 }}>
//                             <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '10px' }}>Description</Typography>
//                             <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Code</Typography>
//                             <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Price</Typography>
//                             <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Remarks</Typography>
//                             <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Status</Typography>
//                         </Box>

//                         <Box sx={{ maxHeight: '120px', overflowY: 'auto' }}>
//                             {visibleItems.map((item, index) => {
//                                 const itemDisplayStatus = item[itemStatusKey] || item.CUR_STATUS;
//                                 return (
//                                     <Box key={index} sx={{ display: 'grid', gridTemplateColumns: gridConfig, gap: '4px', py: 0.5, borderBottom: '1px solid #eee' }}>
//                                         <Typography sx={{ fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.MAT_DESCP}>
//                                             {item.MAT_DESCP}
//                                         </Typography>
//                                         <Typography sx={{ fontSize: '8px' }} align="center">{item.MAT_CODE?.split(' ')[0] || 'N/A'}</Typography>
//                                         <Typography sx={{ fontSize: '9px' }} align="center">{item.PRICE || 0}</Typography>
//                                         <Typography sx={{ fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} align="center" title={item.REMARKS}>
//                                             {item.REMARKS || '—'}
//                                         </Typography>
//                                         <Box sx={{ 
//                                             backgroundColor: getStatusColor(itemDisplayStatus), 
//                                             color: 'white', fontSize: '8px', borderRadius: '2px', textAlign: 'center', fontWeight: 'bold', py: 0.2 
//                                         }}>
//                                             {itemDisplayStatus}
//                                         </Box>
//                                     </Box>
//                                 );
//                             })}
//                         </Box>
//                     </Box>
//                 </Box>
//             </Box>
//         );
//     };

//     // --- FOOTER LOGIC ---
//     const isOverallTodo = itemsArray.some(item => item.CUR_STATUS === 'TO_DO');
//     const lastProcessedItem = [...itemsArray].reverse().find(i => i.CUR_STATUS !== 'PENDING' && i.CUR_STATUS !== 'SUBMITTED');

//     return (
//         <Box sx={{ p: 1 }}>
//             {/* Header Box */}
//             <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 1, backgroundColor: '#e3f2fd', textAlign: 'center' }}>
//                 <Typography variant="body2" fontWeight="bold">Material Master Request By: {data.name}</Typography>
//                 <Typography variant="caption">Dept: {data.department} | Date: {formatDate(data.raiser_date)}</Typography>
//             </Box>

//             {/* Steps Rendering */}
//             {activeSteps.map((step) => (
//                 <React.Fragment key={step.id}>
//                     <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.1, lineHeight: 1 }}>↓</Typography>
//                     {renderStepBox(step)}
//                 </React.Fragment>
//             ))}

//             {/* Footer Summary Box */}
//             <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.2, lineHeight: 1 }}>↓</Typography>
//             <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, backgroundColor: isOverallTodo ? '#c6ddf1' : '#ffebee', textAlign: 'center' }}>
//                 <Typography variant="body2" fontWeight="bold" sx={{ fontSize: "12px" }}>
//                     Current User: {itemsArray.find(i => i.CUR_STATUS === 'TO_DO')?.CUR_USR || lastProcessedItem?.CUR_USR || data.current_user}
//                 </Typography>
//                 <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5, color: getSafeStatusColor(isOverallTodo ? "TO_DO" : lastProcessedItem?.CUR_STATUS || "Reject"), fontSize: "12px" }}>
//                     Status: {isOverallTodo ? "TO_DO" : (lastProcessedItem?.CUR_STATUS || data.current_status || "Reject")}
//                 </Typography>
//             </Box>
//         </Box>
//     );
// };

// export default MatMasterExtFlowDetails;


import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const MatMasterExtFlowDetails = ({ flowLoading, flowData, formatDate, getStatusColor }) => {
    if (flowLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading Material Master data...</Typography>
            </Box>
        );
    }

    if (!flowData || !flowData.data) {
        return <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>No data available</Typography>;
    }

    const data = flowData.data;
    // Handle both potential item keys
    const itemsArray = data.mmextension_items || data.mmcreation_items || [];

    const getSafeStatusColor = (status) => {
        const color = getStatusColor(status);
        // Custom orange for TO_DO
        if (color === "#facc15" || status?.toUpperCase() === 'TO_DO') return "#b45309"; 
        return color;
    };

    // HELPER: Find info for a step. Prioritizes item-level "Approve" for Partial Approvals.
    const getStepInfo = (stepId, nameKey, statusKey, dateKey) => {
        // Find all items that have been processed at this step
        const stepItems = itemsArray.filter(item => item[statusKey] && item[statusKey] !== "PENDING");
        
        if (stepItems.length === 0) {
            return {
                name: data[nameKey],
                status: data[statusKey],
                date: data[dateKey]
            };
        }

        // PRIORITY LOGIC: If even one item is Approved, the Step Header should show "Approve"
        const hasApprove = stepItems.some(item => item[statusKey] === 'Approve');
        const calculatedStatus = hasApprove ? 'Approve' : (data[statusKey] || stepItems[0][statusKey]);

        return {
            name: data[nameKey] || stepItems[0]?.[nameKey],
            status: calculatedStatus,
            date: data[dateKey] || stepItems[0]?.[dateKey]
        };
    };

    const allPossibleSteps = [
        { 
            id: 'MATERIALCREATOR', 
            label: 'Material Creator', 
            ...getStepInfo('MATERIALCREATOR', 'MAT_CREATOR_NAME', 'MAT_CREATOR_STATUS', 'MAT_CREATOR_DT'),
            itemStatusKey: 'MAT_CREATOR_STATUS',
            requiredPrevStatusKey: null 
        },
    ];

    const activeSteps = allPossibleSteps.filter(step => {
        const hasHistory = step.name && step.name.trim() !== "";
        const isCurrentlyPending = itemsArray.some(item => item.CUR_TASK === step.id);
        return hasHistory || isCurrentlyPending;
    });

    // Grid config: Description, Code, Price, Remarks, Status
    const gridConfig = "1.5fr 70px 50px 80px 70px";

    const renderStepBox = (step) => {
        const { name, label, status, date, itemStatusKey, requiredPrevStatusKey, id } = step;

        const visibleItems = itemsArray.filter(item => {
            if (!requiredPrevStatusKey) return true;
            const prevStatus = item[requiredPrevStatusKey]?.toLowerCase();
            return prevStatus === 'approve' || prevStatus === 'approved';
        });

        if (visibleItems.length === 0) return null;

        const stepHasTodoItems = visibleItems.some(item => item.CUR_TASK === id && item.CUR_STATUS === 'TO_DO');
        const displayName = name || (stepHasTodoItems ? visibleItems.find(i => i.CUR_TASK === id)?.CUR_USR : "Pending");
        const displayStatus = status || (stepHasTodoItems ? "TO_DO" : "Pending");

        return (
            <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 1, backgroundColor: displayStatus === 'TO_DO' ? '#fffde7' : '#f5f5f5' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Left side: Actor Info */}
                    <Box sx={{ flex: 0.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '11px' }}>{displayName}</Typography>
                        <Typography variant="caption" sx={{ color: 'gray', display: 'block', fontSize: '10px' }}>{label}</Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: getSafeStatusColor(displayStatus), mt: 0.5, fontSize: '10px' }}>
                            {displayStatus}
                        </Typography>
                        {date && <Typography sx={{ fontSize: '9px', mt: 0.5 }}>{formatDate(date)}</Typography>}
                    </Box>

                    {/* Right side: Items Table */}
                    <Box sx={{ flex: 1.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: gridConfig, gap: '4px', borderBottom: '1px solid #ddd', pb: 0.5, px: 0.5 }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '10px' }}>Description</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Code</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Price</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Remarks</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Status</Typography>
                        </Box>

                        <Box sx={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {visibleItems.map((item, index) => {
                                const itemDisplayStatus = item[itemStatusKey] || item.CUR_STATUS;
                                return (
                                    <Box key={index} sx={{ display: 'grid', gridTemplateColumns: gridConfig, gap: '4px', py: 0.5, px: 0.5, borderBottom: '1px solid #eee', alignItems: 'center' }}>
                                        <Typography sx={{ fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.MAT_DESCP}>
                                            {item.MAT_DESCP}
                                        </Typography>
                                        <Typography sx={{ fontSize: '8px' }} align="center">{item.MAT_CODE || 'N/A'}</Typography>
                                        <Typography sx={{ fontSize: '9px' }} align="center">{item.PRICE || 0}</Typography>
                                        <Typography sx={{ fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} align="center" title={item.MAT_CREATOR_REM || item.REMARKS}>
                                            {item.MAT_CREATOR_REM || item.REMARKS || '—'}
                                        </Typography>
                                        <Box sx={{ 
                                            backgroundColor: getStatusColor(itemDisplayStatus), 
                                            color: 'white', fontSize: '8px', borderRadius: '2px', textAlign: 'center', fontWeight: 'bold', py: 0.2 
                                        }}>
                                            {itemDisplayStatus}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    };

    // --- FOOTER LOGIC ---
    const isOverallTodo = itemsArray.some(item => item.CUR_STATUS === 'TO_DO');
    const hasAnyApprove = itemsArray.some(item => item.CUR_STATUS === 'Approve');
    const lastProcessedItem = [...itemsArray].reverse().find(i => i.CUR_STATUS !== 'PENDING' && i.CUR_STATUS !== 'SUBMITTED');

    // If any item is approved, the overall workflow status should be Green/Approve
    const finalStatus = isOverallTodo ? "TO_DO" : (hasAnyApprove ? "Approve" : (lastProcessedItem?.CUR_STATUS || data.current_status || "Reject"));

    return (
        <Box sx={{ p: 1 }}>
            {/* Header Box */}
            <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 1, backgroundColor: '#e3f2fd', textAlign: 'center' }}>
                <Typography variant="body2" fontWeight="bold">Material Extension Request By: {data.name}</Typography>
                <Typography variant="caption">Dept: {data.department} | Date: {formatDate(data.raiser_date)}</Typography>
            </Box>

            {/* Steps Rendering */}
            {activeSteps.map((step) => (
                <React.Fragment key={step.id}>
                    <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.1, lineHeight: 1 }}>↓</Typography>
                    {renderStepBox(step)}
                </React.Fragment>
            ))}

            {/* Footer Summary Box */}
            <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.2, lineHeight: 1 }}>↓</Typography>
            <Box sx={{ 
                border: '1px solid #ccc', 
                borderRadius: '6px', 
                p: 1, 
                backgroundColor: isOverallTodo ? '#fffde7' : (hasAnyApprove ? '#e8f5e9' : '#ffebee'), 
                textAlign: 'center' 
            }}>
                <Typography variant="body2" fontWeight="bold" sx={{ fontSize: "12px" }}>
                    Current User: {itemsArray.find(i => i.CUR_STATUS === 'TO_DO')?.CUR_USR || lastProcessedItem?.CUR_USR || data.current_user}
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5, color: getSafeStatusColor(finalStatus), fontSize: "12px" }}>
                     Status: {finalStatus}
                </Typography>
            </Box>
        </Box>
    );
};

export default MatMasterExtFlowDetails;