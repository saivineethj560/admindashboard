import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const IndentFlowDetails = ({ flowLoading, flowData, formatDate, getStatusColor }) => {
    if (flowLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading Indent data...</Typography>
            </Box>
        );
    }

    if (!flowData || !flowData.data) {
        return <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>No indent data available</Typography>;
    }

    const data = flowData.data;
    const itemsArray = data.indent_items || [];
    const firstItem = itemsArray.length > 0 ? itemsArray[0] : {};

    const getSafeStatusColor = (status) => {
        const color = getStatusColor(status);
        if (color === "#facc15" || status?.toLowerCase() === 'to_do' || status?.toLowerCase() === 'pending') {
            return "#b45309"; 
        }
        return color;
    };

    // 1. Define all possible approval steps in order
    const allPossibleSteps = [
        { id: 'PM', label: 'PM', name: data.PM_NAME || firstItem.PM_NAME, status: data.PM_STATUS || firstItem.PM_STATUS, date: data.PM_APP_DATE || firstItem.PM_APP_DATE, itemKey: 'PM_STATUS' },
        { id: 'PRJ_INCHARGE', label: 'PRJ_INCHARGE', name: data.PRJ_INC_NAME || firstItem.PRJ_INC_NAME, status: data.PRJ_INC_STATUS || firstItem.PRJ_INC_STATUS, date: data.PRJ_INC_DT || firstItem.PRJ_INC_DT, itemKey: 'PRJ_INC_STATUS' },
        { id: 'PLANNING_QS', label: 'PLANNING_QS', name: data.PLAN_QS_NAME || firstItem.PLAN_QS_NAME, status: data.PLAN_QS_STATUS || firstItem.PLAN_QS_STATUS, date: data.PLAN_QS_DT || firstItem.PLAN_QS_DT, itemKey: 'PLAN_QS_STATUS' },
        { id: 'PRJ_HEAD', label: 'PRJ_HEAD', name: data.PRJ_HEAD_NAME || firstItem.PRJ_HEAD_NAME, status: data.PRJ_HEAD_STATUS || firstItem.PRJ_HEAD_STATUS, date: data.PRJ_HEAD_DT || firstItem.PRJ_HEAD_DT, itemKey: 'PRJ_HEAD_STATUS' },
        { id: 'PRESIDENT_PRJ', label: 'PRES_PRJ', name: data.PRES_PRJ_NAME || firstItem.PRES_PRJ_NAME, status: data.PRES_PRJ_STATUS || firstItem.PRES_PRJ_STATUS, date: data.PRES_PRJ_DT || firstItem.PRES_PRJ_DT, itemKey: 'PRES_PRJ_STATUS' },
        { id: 'PRESIDENT', label: 'PRESIDENT', name: data.PRES_NAME || firstItem.PRES_NAME, status: data.PRES_STATUS || firstItem.PRES_STATUS, date: data.PRES_DT || firstItem.PRES_DT, itemKey: 'PRES_STATUS' },
        { id: 'DIRECT_PRJ', label: 'DIRECTOR_PROJECTS', name: data.DIRECT_PRJ_NAME || firstItem.DIRECT_PRJ_NAME, status: data.DIRECT_PRJ_STATUS || firstItem.DIRECT_PRJ_STATUS, date: data.DIRECT_PRJ_DT || firstItem.DIRECT_PRJ_DT, itemKey: 'DIRECT_PRJ_STATUS' },
        { id: 'EVC', label: 'EVC', name: data.EVC_NAME || firstItem.EVC_NAME, status: data.EVC_STATUS || firstItem.EVC_STATUS, date: data.EVC_DT || firstItem.EVC_DT, itemKey: 'EVC_STATUS' },
    ];

    // 2. Identify active steps: Either processed (has name) OR current task
    const activeSteps = allPossibleSteps.filter(step => {
        const hasBeenProcessed = step.name && step.name.trim() !== "";
        const currentTask = (data.current_task || "").toUpperCase();
        return hasBeenProcessed || currentTask === step.id;
    });

    const renderIndentStep = (step) => {
        const { id, name, label, status, date, itemKey } = step;

        // --- PROPAGATION LOGIC: STOP REJECTED ITEMS ---
        const visibleItems = itemsArray.filter(item => {
            const currentIndex = allPossibleSteps.findIndex(s => s.id === id);
            // Check all steps before this one
            for (let i = 0; i < currentIndex; i++) {
                const prevKey = allPossibleSteps[i].itemKey;
                const prevStatus = item[prevKey]?.toLowerCase();
                // If it was rejected at any previous point, hide it from this box
                if (prevStatus === 'reject' || prevStatus === 'rejected') {
                    return false;
                }
            }
            return true;
        });

        // If no items are eligible to reach this step, don't show the step at all
        if (visibleItems.length === 0) return null;

        const currentTask = (data.current_task || "").toUpperCase();
        const isPendingTask = currentTask === id;
        
        const displayName = name || (isPendingTask ? data.current_user : "Pending");
        const displayStatus = status || (isPendingTask ? "TO_DO" : "Pending");

        return (
            <React.Fragment key={id}>
                <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.2 }}>↓</Typography>
                <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 1, backgroundColor: isPendingTask ? '#fff3e0' : '#e8f5e9' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {/* Approver Details */}
                        <Box sx={{ flex: 0.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '12px' }}>{displayName}</Typography>
                            <Typography variant="caption" sx={{ color: 'gray', display: 'block' }}>{label}</Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ color: getSafeStatusColor(displayStatus), mt: 1, fontSize: '11px' }}>
                                Status: {displayStatus}
                            </Typography>
                            {date && <Typography variant="body2" sx={{ fontSize: "10px", mt: 0.5 }}>Date: {date}</Typography>}
                        </Box>

                        {/* Item Table */}
                        <Box sx={{ flex: 1.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '2.5fr 40px 60px 40px 40px 60px', gap: '4px', borderBottom: '1px solid #ddd', pb: 0.5 }}>
                                <Typography variant="caption" fontWeight="bold" sx={{fontSize: '10px'}}>Material</Typography>
                                <Typography variant="caption" fontWeight="bold" align="center" sx={{fontSize: '10px'}}>UOM</Typography>
                                <Typography variant="caption" fontWeight="bold" align="center" sx={{fontSize: '10px'}}>WBS</Typography>
                                <Typography variant="caption" fontWeight="bold" align="center" sx={{fontSize: '10px'}}>Req</Typography>
                                <Typography variant="caption" fontWeight="bold" align="center" sx={{fontSize: '10px'}}>App</Typography>
                                <Typography variant="caption" fontWeight="bold" align="center" sx={{fontSize: '10px'}}>Status</Typography>
                            </Box>
                            <Box sx={{ maxHeight: '120px', overflowY: 'auto' }}>
                                {visibleItems.map((item, index) => {
                                    const itemStatus = item[itemKey] || (isPendingTask ? 'TO_DO' : 'PENDING');
                                    return (
                                        <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '2.5fr 40px 60px 40px 40px 60px', gap: '4px', py: 0.5, borderBottom: '1px solid #eee' }}>
                                            <Typography sx={{ fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {item.MAT_DESC || 'N/A'}
                                            </Typography>
                                            <Typography sx={{ fontSize: '9px' }} align="center">{item.UOM}</Typography>
                                            <Typography sx={{ fontSize: '9px' }} align="center">{item.WBS_ELE}</Typography>
                                            <Typography sx={{ fontSize: '9px' }} align="center">{item.REQ_NOW}</Typography>
                                            <Typography sx={{ fontSize: '9px' }} align="center">{item.QUAN}</Typography>
                                            <Box sx={{
                                                backgroundColor: itemStatus.toLowerCase().includes('reject') ? '#ef4444' : (itemStatus.toLowerCase().includes('app') || itemStatus === 'OK' ? '#22c55e' : '#facc15'),
                                                color: 'white', fontSize: '8px', borderRadius: '2px', textAlign: 'center', fontWeight: 'bold', py: 0.2
                                            }}>
                                                {itemStatus}
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </React.Fragment>
        );
    };

    return (
        <Box sx={{ p: 1 }}>
            {/* Raiser Section */}
            <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 1, backgroundColor: '#e3f2fd', textAlign: 'center' }}>
                <Typography variant="body2" fontWeight="bold">Indent Raised By: {data.name}</Typography>
                <Typography variant="caption">Dept: {data.department} | Date: {formatDate(data.raiser_date)}</Typography>
            </Box>

            {/* Loop through all active steps */}
            {activeSteps.map((step) => renderIndentStep(step))}

            {/* Footer Summary */}
            <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.2 }}>↓</Typography>
            <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1.5, backgroundColor: '#c6ddf1', textAlign: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ fontSize: "13px" }}>
                    Current User: {data.current_user} { data.current_task ? `- ${data.current_task}` : "" }
                </Typography>
                <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{
                        mt: 0.5,
                        color: getSafeStatusColor(data.current_status || "TO_DO"),
                        fontSize: "13px",
                    }}
                >
                    Status: {
                        data.current_status === "Approve"
                            ? "Completed"
                            : (data.current_status?.toLowerCase().includes("reject") ? "Closed" : (data.current_status || "TO_DO"))
                    }
                </Typography>
            </Box>
        </Box>
    );
};

export default IndentFlowDetails;