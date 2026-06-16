

// import React from 'react';
// import { Box, Typography, CircularProgress, Divider } from '@mui/material';

// const ScrapSaleFlowDetails = ({ flowLoading, flowData, formatDate, getStatusColor }) => {
//     if (flowLoading) return <CircularProgress />;
//     if (!flowData || !flowData.data) return <Typography>No data available</Typography>;

//     const data = flowData.data;
//     const itemsArray = data.scrap_items || [];

//     const getSafeStatusColor = (status) => {
//         const color = getStatusColor(status);
//         if (color === "#facc15" || status?.toLowerCase() === 'to_do') return "#b45309"; 
//         return color;
//     };

//     const getStepInfo = (stepId, nameKey, statusKey, dateKey) => {
//         const processedItem = itemsArray.find(item => item[nameKey] && item[nameKey].trim() !== "");
//         const itemStatuses = itemsArray.map(item => item[statusKey]).filter(Boolean);
        
//         let calculatedStatus = null;
//         if (itemStatuses.length > 0) {
//             // FIX: If ANY item is approved, the whole box shows Approved
//             if (itemStatuses.some(s => s === 'Approve')) calculatedStatus = 'Approve';
//             else if (itemStatuses.every(s => s === 'Reject')) calculatedStatus = 'Reject';
//             else calculatedStatus = itemStatuses[0];
//         }

//         return {
//             name: processedItem?.[nameKey] || data[nameKey],
//             status: calculatedStatus || data[statusKey], 
//             date: processedItem?.[dateKey] || data[dateKey]
//         };
//     };

//     const allPossibleSteps = [
//         { id: 'STORES_HEAD', label: 'Store Head', ...getStepInfo('STORES_HEAD', 'STR_HEAD_NAME', 'STR_HEAD_STATUS', 'STR_HEAD_DT'), itemStatusKey: 'STR_HEAD_STATUS', requiredPrevStatusKey: null },
//         { id: 'VP', label: 'Vice President', ...getStepInfo('VP', 'VP_NAME', 'VP_STATUS', 'VP_DT'), itemStatusKey: 'VP_STATUS', requiredPrevStatusKey: 'STR_HEAD_STATUS' },
//         { id: 'EVC', label: 'EVC', ...getStepInfo('EVC', 'EVC_NAME', 'EVC_STATUS', 'EVC_DT'), itemStatusKey: 'EVC_STATUS', requiredPrevStatusKey: 'VP_STATUS' },
//     ];

//     const activeSteps = allPossibleSteps.filter(step => {
//         const hasHistory = step.name && step.name.trim() !== "";
//         const isCurrent = itemsArray.some(item => item.CUR_TASK === step.id && item.CUR_STATUS === 'TO_DO');
//         return hasHistory || isCurrent;
//     });

//     const gridConfig = "1.5fr 60px 35px 45px 45px 45px 65px";

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
//                     <Box sx={{ flex: 0.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
//                         <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '11px' }}>{displayName}</Typography>
//                         <Typography variant="caption" sx={{ color: 'gray', display: 'block', fontSize: '10px' }}>{label}</Typography>
//                         <Typography variant="body2" fontWeight="bold" sx={{ color: getSafeStatusColor(displayStatus), mt: 0.5, fontSize: '10px' }}>{displayStatus}</Typography>
//                         {date && <Typography sx={{ fontSize: '9px', mt: 0.5 }}>{formatDate(date)}</Typography>}
//                     </Box>
//                     <Box sx={{ flex: 1.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
//                         <Box sx={{ display: 'grid', gridTemplateColumns: gridConfig, gap: '4px', borderBottom: '1px solid #ddd', pb: 0.5 }}>
//                             <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '10px' }}>Item</Typography>
//                             <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>MCode</Typography>
//                             <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>UOM</Typography>
//                             <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Prev</Typography>
//                             <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Sale</Typography>
//                             <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Cum</Typography>
//                             <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Status</Typography>
//                         </Box>
//                         <Box sx={{ maxHeight: '120px', overflowY: 'auto' }}>
//                             {visibleItems.map((item, index) => {
//                                 const itemDisplayStatus = item[itemStatusKey] || item.CUR_STATUS;
//                                 return (
//                                     <Box key={index} sx={{ display: 'grid', gridTemplateColumns: gridConfig, gap: '4px', py: 0.5, borderBottom: '1px solid #eee' }}>
//                                         <Typography sx={{ fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.MAT_DESCP}</Typography>
//                                         <Typography sx={{ fontSize: '9px' }} align="center">{item.MAT_CODE}</Typography>
//                                         <Typography sx={{ fontSize: '9px' }} align="center">{item.UNIT}</Typography>
//                                         <Typography sx={{ fontSize: '9px' }} align="center">{item.PREV_QTY}</Typography>
//                                         <Typography sx={{ fontSize: '9px' }} align="center">{item.SALE_QTY}</Typography>
//                                         <Typography sx={{ fontSize: '9px', fontWeight: 'bold' }} align="center">{item.CUMUL_QTY}</Typography>
//                                         <Box sx={{ backgroundColor: getStatusColor(itemDisplayStatus), color: 'white', fontSize: '8px', borderRadius: '2px', textAlign: 'center', fontWeight: 'bold', py: 0.2 }}>{itemDisplayStatus}</Box>
//                                     </Box>
//                                 );
//                             })}
//                         </Box>
//                     </Box>
//                 </Box>
//             </Box>
//         );
//     };

//      // --- FOOTER LOGIC ---
//     const isOverallTodo = itemsArray.some(item => item.CUR_STATUS === 'TO_DO');
//     const lastProcessedItem = [...itemsArray].reverse().find(i => i.CUR_STATUS !== 'PENDING');
//  const footerStatus = data.current_status || "Pending";
//     const footerUser = data.current_user || "N/A";
//     return (
//         <Box sx={{ p: 1 }}>
//             <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 1, backgroundColor: '#e3f2fd', textAlign: 'center' }}>
//                 <Typography variant="body2" fontWeight="bold">Scrap Sale Request By: {data.name}</Typography>
//                 <Typography variant="caption">Dept: {data.department} | Date: {formatDate(data.raiser_date)}</Typography>
//             </Box>
//             {activeSteps.map((step) => (
//                 <React.Fragment key={step.id}>
//                     <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.1, lineHeight: 1 }}>↓</Typography>
//                     {renderStepBox(step)}
//                 </React.Fragment>
//             ))}

//              <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.2, lineHeight: 1 }}>↓</Typography>
//                         <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, backgroundColor: isOverallTodo ? '#c6ddf1' : '#ffebee', textAlign: 'center' }}>
//                             <Typography variant="body2" fontWeight="bold" sx={{ fontSize: "12px" }}>
//                                 Current User: {itemsArray.find(i => i.CUR_STATUS === 'TO_DO')?.CUR_USR || lastProcessedItem?.CUR_USR || data.current_user}
//                             </Typography>
//                             <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5, color: getSafeStatusColor(isOverallTodo ? "TO_DO" : lastProcessedItem?.CUR_STATUS || "Reject"), fontSize: "12px" }}>
//                                 Status: {isOverallTodo ? "TO_DO" : lastProcessedItem?.CUR_STATUS || "Reject"}
//                             </Typography>
//                         </Box>
//         </Box>
//     );
// };

// export default ScrapSaleFlowDetails;

import React from 'react';
import { Box, Typography, CircularProgress, Divider } from '@mui/material';

const ScrapSaleFlowDetails = ({ flowLoading, flowData, formatDate, getStatusColor }) => {
    if (flowLoading) return <CircularProgress />;
    if (!flowData || !flowData.data) return <Typography>No data available</Typography>;

    const data = flowData.data;
    const itemsArray = data.scrap_items || [];

    const getSafeStatusColor = (status) => {
        const color = getStatusColor(status);
        if (color === "#facc15" || status?.toLowerCase() === 'to_do') return "#b45309"; 
        return color;
    };

    const getStepInfo = (stepId, nameKey, statusKey, dateKey) => {
        const processedItem = itemsArray.find(item => item[nameKey] && item[nameKey].trim() !== "");
        const itemStatuses = itemsArray.map(item => item[statusKey]).filter(Boolean);
        
        let calculatedStatus = null;
        if (itemStatuses.length > 0) {
            // If ANY item is approved, the box header shows Approved
            if (itemStatuses.some(s => s === 'Approve')) calculatedStatus = 'Approve';
            else if (itemStatuses.every(s => s === 'Reject')) calculatedStatus = 'Reject';
            else calculatedStatus = itemStatuses[0];
        }

        return {
            name: processedItem?.[nameKey] || (data[nameKey] !== data.name ? data[nameKey] : null),
            status: calculatedStatus || data[statusKey], 
            date: processedItem?.[dateKey] || data[dateKey]
        };
    };

    const allPossibleSteps = [
        { id: 'STORES_HEAD', label: 'Store Head', ...getStepInfo('STORES_HEAD', 'STR_HEAD_NAME', 'STR_HEAD_STATUS', 'STR_HEAD_DT'), itemStatusKey: 'STR_HEAD_STATUS', requiredPrevStatusKey: null },
        { id: 'VP', label: 'Vice President', ...getStepInfo('VP', 'VP_NAME', 'VP_STATUS', 'VP_DT'), itemStatusKey: 'VP_STATUS', requiredPrevStatusKey: 'STR_HEAD_STATUS' },
        { id: 'EVC', label: 'EVC', ...getStepInfo('EVC', 'EVC_NAME', 'EVC_STATUS', 'EVC_DT'), itemStatusKey: 'EVC_STATUS', requiredPrevStatusKey: 'VP_STATUS' },
        { id: 'PURCHASE', label: 'Purchase', ...getStepInfo('PURCHASE', 'PURCHASE_NAME', 'PURCHASE_STATUS', 'PURCHASE_DT'), itemStatusKey: 'CUR_STATUS', requiredPrevStatusKey: 'EVC_STATUS' },
    ];

    const activeSteps = allPossibleSteps.filter(step => {
        const hasHistory = step.name && step.name.trim() !== "";
        const isCurrent = itemsArray.some(item => item.CUR_TASK === step.id && item.CUR_STATUS === 'TO_DO');
        return hasHistory || isCurrent;
    });

    const gridConfig = "1.5fr 60px 35px 45px 45px 45px 65px";

    const renderStepBox = (step) => {
        const { name, label, status, date, itemStatusKey, requiredPrevStatusKey, id } = step;
        const visibleItems = itemsArray.filter(item => {
            if (!requiredPrevStatusKey) return true;
            const prevStatus = item[requiredPrevStatusKey]?.toLowerCase();
            return prevStatus === 'approve' || prevStatus === 'approved';
        });

        if (visibleItems.length === 0) return null;
        const stepHasTodoItems = visibleItems.some(item => item.CUR_TASK === id && item.CUR_STATUS === 'TO_DO');
        
        // Use name if exists, otherwise check for CUR_USR in TO_DO items, otherwise "Pending"
        const todoUser = visibleItems.find(i => i.CUR_TASK === id && i.CUR_STATUS === 'TO_DO')?.CUR_USR;
        const displayName = name || (todoUser && todoUser.trim() !== "" ? todoUser : (stepHasTodoItems ? "Unassigned" : "Pending"));
        const displayStatus = status || (stepHasTodoItems ? "TO_DO" : "Pending");

        return (
            <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 1, backgroundColor: displayStatus === 'TO_DO' ? '#fffde7' : '#f5f5f5' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ flex: 0.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '11px' }}>{displayName}</Typography>
                        <Typography variant="caption" sx={{ color: 'gray', display: 'block', fontSize: '10px' }}>{label}</Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: getSafeStatusColor(displayStatus), mt: 0.5, fontSize: '10px' }}>{displayStatus}</Typography>
                        {date && <Typography sx={{ fontSize: '9px', mt: 0.5 }}>{formatDate(date)}</Typography>}
                    </Box>
                    <Box sx={{ flex: 1.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: gridConfig, gap: '4px', borderBottom: '1px solid #ddd', pb: 0.5 }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '10px' }}>Item</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>MCode</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>UOM</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Prev</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Sale</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Cum</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Status</Typography>
                        </Box>
                        <Box sx={{ maxHeight: '120px', overflowY: 'auto' }}>
                            {visibleItems.map((item, index) => {
                                const itemDisplayStatus = item[itemStatusKey] || item.CUR_STATUS;
                                return (
                                    <Box key={index} sx={{ display: 'grid', gridTemplateColumns: gridConfig, gap: '4px', py: 0.5, borderBottom: '1px solid #eee' }}>
                                        <Typography sx={{ fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.MAT_DESCP}</Typography>
                                        <Typography sx={{ fontSize: '9px' }} align="center">{item.MAT_CODE}</Typography>
                                        <Typography sx={{ fontSize: '9px' }} align="center">{item.UNIT}</Typography>
                                        <Typography sx={{ fontSize: '9px' }} align="center">{item.PREV_QTY}</Typography>
                                        <Typography sx={{ fontSize: '9px' }} align="center">{item.SALE_QTY}</Typography>
                                        <Typography sx={{ fontSize: '9px', fontWeight: 'bold' }} align="center">{item.CUMUL_QTY}</Typography>
                                        <Box sx={{ backgroundColor: getStatusColor(itemDisplayStatus), color: 'white', fontSize: '8px', borderRadius: '2px', textAlign: 'center', fontWeight: 'bold', py: 0.2 }}>{itemDisplayStatus}</Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    };

    // --- UPDATED FOOTER LOGIC ---
    // 1. Check if any item is TO_DO
    const todoItem = itemsArray.find(i => i.CUR_STATUS === 'TO_DO');
    const isOverallTodo = !!todoItem;

    // 2. Determine Status
    let displayStatus = "Reject"; // Default to Reject
    if (isOverallTodo) {
        displayStatus = "TO_DO";
    } else if (itemsArray.some(i => i.CUR_STATUS === 'Approve')) {
        displayStatus = "Approve";
    }

    // 3. Determine User
    let displayUser = "N/A";
    if (isOverallTodo) {
        // Only show name if it's NOT empty
        displayUser = (todoItem.CUR_USR && todoItem.CUR_USR.trim() !== "") 
            ? todoItem.CUR_USR 
            : "Unassigned / Pending Claim";
    } else {
        displayUser = data.current_user || "N/A";
    }

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 1, backgroundColor: '#e3f2fd', textAlign: 'center' }}>
                <Typography variant="body2" fontWeight="bold">Scrap Sale Request By: {data.name}</Typography>
                <Typography variant="caption">Dept: {data.department} | Date: {formatDate(data.raiser_date)}</Typography>
            </Box>

            {activeSteps.map((step) => (
                <React.Fragment key={step.id}>
                    <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.1, lineHeight: 1 }}>↓</Typography>
                    {renderStepBox(step)}
                </React.Fragment>
            ))}

            {/* <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.2, lineHeight: 1 }}>↓</Typography>
            <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, backgroundColor: isOverallTodo ? '#fffde7' : (displayStatus === 'Reject' ? '#ffebee' : '#e8f5e9'), textAlign: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ fontSize: "12px" }}>
                    Current User: {displayUser}
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5, color: getSafeStatusColor(displayStatus), fontSize: "12px" }}>
                    Status: {displayStatus}
                </Typography>
            </Box> */}
        </Box>
    );
};

export default ScrapSaleFlowDetails;