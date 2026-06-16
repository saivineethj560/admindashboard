import React from 'react';
import { Box, Typography, CircularProgress, Divider } from '@mui/material';

const StockTransferFlowDetails = ({ flowLoading, flowData, formatDate, getStatusColor }) => {
    if (flowLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading Stock Transfer data...</Typography>
            </Box>
        );
    }

    if (!flowData || !flowData.data) {
        return <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>No data available</Typography>;
    }

    const data = flowData.data;
    const itemsArray = data.stock_items || [];

    const getSafeStatusColor = (status) => {
        const color = getStatusColor(status);
        if (color === "#facc15" || status?.toLowerCase() === 'to_do') return "#b45309"; 
        return color;
    };

    // HELPER: Find the name/date/status for a step by looking across ALL items
    const getStepInfo = (stepId, nameKey, statusKey, dateKey) => {
        // Find any item that has been processed at this step
        const processedItem = itemsArray.find(item => item[nameKey] && item[nameKey].trim() !== "");
        
        // Summarize status across all items in this step
        const statuses = itemsArray.map(item => item[statusKey]).filter(Boolean);
        let finalStatus = null;
        if (statuses.length > 0) {
            if (statuses.every(s => s === 'Approve')) finalStatus = 'Approve';
            else if (statuses.every(s => s === 'Reject')) finalStatus = 'Reject';
            else finalStatus = 'Approve'; // Mixed
        }

        return {
            name: data[nameKey] || processedItem?.[nameKey],
            status: data[statusKey] || finalStatus,
            date: data[dateKey] || processedItem?.[dateKey]
        };
    };

    const allPossibleSteps = [
        { 
            id: 'FRM_PLANT_INCH', 
            label: 'From Plant Incharge', 
            ...getStepInfo('FRM_PLANT_INCH', 'FRM_PLANT_INCH_NAME', 'FRM_PLANT_INCH_STATUS', 'FRM_PLANT_INCH_DT'),
            itemStatusKey: 'FRM_PLANT_INCH_STATUS',
            requiredPrevStatusKey: null 
        },
        { 
            id: 'TO_PLANT_INCH', 
            label: 'To Plant Incharge', 
            ...getStepInfo('TO_PLANT_INCH', 'TO_PLANT_INCH_NAME', 'TO_PLANT_INCH_STATUS', 'TO_PLANT_INCH_DT'),
            itemStatusKey: 'TO_PLANT_INCH_STATUS',
            requiredPrevStatusKey: 'FRM_PLANT_INCH_STATUS' 
        },
        { 
            id: "STORES_HEAD", 
            label: 'Store Head', 
            ...getStepInfo('STORES_HEAD', 'STR_HEAD_NAME', 'STR_HEAD_STATUS', 'STR_HEAD_DT'),
            itemStatusKey: 'STR_HEAD_STATUS',
            requiredPrevStatusKey: 'TO_PLANT_INCH_STATUS' 
        },
        { 
            id: 'EVC', 
            label: 'EVC', 
            ...getStepInfo('EVC', 'EVC_NAME', 'EVC_STATUS', 'EVC_DT'),
            itemStatusKey: 'EVC_STATUS',
            requiredPrevStatusKey: 'STR_HEAD_STATUS' 
        },
    ];

    const activeSteps = allPossibleSteps.filter(step => {
        const hasHistory = step.name && step.name.trim() !== "";
        const isCurrentlyPending = itemsArray.some(item => item.CUR_TASK === step.id && item.CUR_STATUS === 'TO_DO');
        return hasHistory || isCurrentlyPending;
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
        const displayName = name || (stepHasTodoItems ? visibleItems.find(i => i.CUR_TASK === id)?.CUR_USR : "Pending");
        const displayStatus = status || (stepHasTodoItems ? "TO_DO" : "Pending");

        return (
            <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 1, backgroundColor: displayStatus === 'TO_DO' ? '#fffde7' : '#f5f5f5' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ flex: 0.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '11px' }}>{displayName}</Typography>
                        <Typography variant="caption" sx={{ color: 'gray', display: 'block', fontSize: '10px' }}>{label}</Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: getSafeStatusColor(displayStatus), mt: 0.5, fontSize: '10px' }}>
                            {displayStatus}
                        </Typography>
                        {date && <Typography sx={{ fontSize: '9px', mt: 0.5 }}>{formatDate(date)}</Typography>}
                    </Box>

                    <Box sx={{ flex: 1.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: gridConfig, gap: '4px', borderBottom: '1px solid #ddd', pb: 0.5 }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '10px' }}>Item</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>MCode</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>UOM</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Prev</Typography>
                            <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '10px' }}>Req</Typography>
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
                                        <Typography sx={{ fontSize: '9px' }} align="center">{item.REQ_QTY}</Typography>
                                        <Typography sx={{ fontSize: '9px', fontWeight: 'bold' }} align="center">{item.CUMUL_QTY}</Typography>
                                        <Box sx={{ backgroundColor: getStatusColor(itemDisplayStatus), color: 'white', fontSize: '8px', borderRadius: '2px', textAlign: 'center', fontWeight: 'bold', py: 0.2 }}>
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
    const lastProcessedItem = [...itemsArray].reverse().find(i => i.CUR_STATUS !== 'PENDING');

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 1, backgroundColor: '#e3f2fd', textAlign: 'center' }}>
                <Typography variant="body2" fontWeight="bold">Stock Transfer Request By: {data.name}</Typography>
                <Typography variant="caption">Dept: {data.department} | Date: {formatDate(data.raiser_date)}</Typography>
                <Divider sx={{ my: 0.5 }} />
                <Typography variant="caption" fontWeight="bold" color="primary">
                    From: {itemsArray[0]?.SEND_PLANT_CODE} → To: {itemsArray[0]?.REC_PLANT_CODE}
                </Typography>
            </Box>

            {activeSteps.map((step) => (
                <React.Fragment key={step.id}>
                    <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.1, lineHeight: 1 }}>↓</Typography>
                    {renderStepBox(step)}
                </React.Fragment>
            ))}

            {/* <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.2, lineHeight: 1 }}>↓</Typography>
            <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, backgroundColor: isOverallTodo ? '#c6ddf1' : '#ffebee', textAlign: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ fontSize: "12px" }}>
                    Current User: {itemsArray.find(i => i.CUR_STATUS === 'TO_DO')?.CUR_USR || lastProcessedItem?.CUR_USR || data.current_user}
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5, color: getSafeStatusColor(isOverallTodo ? "TO_DO" : lastProcessedItem?.CUR_STATUS || "Reject"), fontSize: "12px" }}>
                    Status: {isOverallTodo ? "TO_DO" : lastProcessedItem?.CUR_STATUS || "Reject"}
                </Typography>
            </Box> */}
        </Box>
    );

};

export default StockTransferFlowDetails;