import React from 'react';
import { Box, Typography, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// Helper: If any item in this step is approved, the whole step is "Approve"
const getStepStatus = (items, statusKey) => {
    const statuses = items.map(item => item[statusKey]).filter(Boolean);
    if (statuses.length === 0) return null;

    if (statuses.some(s => s.toLowerCase() === 'approve')) return "Approve";
    if (statuses.some(s => s.toLowerCase() === 'reject')) return "Reject";
    return statuses[0];
};

// Helper: Find Name and Date for a step by scanning all items (not just the first one)
const getStepActor = (items, nameKey, dateKey) => {
    const actorItem = items.find(item => item[nameKey] && item[nameKey].trim() !== "");
    return {
        name: actorItem ? actorItem[nameKey] : null,
        date: actorItem ? actorItem[dateKey] : null
    };
};

// NEW Helper: Find Remarks for a step by scanning all items
const getStepRemarks = (items, remarksKey) => {
    const actorItem = items.find(item => item[remarksKey] && item[remarksKey].trim() !== "");
    return actorItem ? actorItem[remarksKey] : null;
};

const HeaderField = ({ label, value, valueColor = "inherit" }) => (
    <Box sx={{ display: 'flex', mb: 0.8, alignItems: 'baseline' }}>
        <Typography variant="body2" sx={{ width: '110px', fontWeight: '500', color: '#666', flexShrink: 0 }}>
            {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: '500', color: '#333', mr: 1 }}>
            :
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: '600', color: valueColor, wordBreak: 'break-word' }}>
            {value || 'N/A'}
        </Typography>
    </Box>
);

const StockTransferActionView = ({ flowLoading, flowData, selectedRowData, formatDate, getStatusColor }) => {
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
    const items = data.stock_items || [];

    // --- LOGIC FOR FOOTER STATUS ---
    const pendingItem = items.find(item => item.CUR_STATUS === 'TO_DO');
    const isOverallTodo = !!pendingItem;
    // If finished, find the last person who acted
    const lastActorItem = [...items].reverse().find(item => item.CUR_STATUS !== 'PENDING');

    // --- LOGIC FOR HISTORY STEPS ---
    const approvalSteps = [
        { 
            label: 'Request Raised By', 
            name: data.name, 
            status: 'SUBMITTED', 
            date: data.raiser_date,
            remarks: null // Raiser remarks usually in data.REMARKS if needed
        },
        { 
            label: 'From Plant Incharge', 
            ...getStepActor(items, 'FRM_PLANT_INCH_NAME', 'FRM_PLANT_INCH_DT'),
            status: getStepStatus(items, 'FRM_PLANT_INCH_STATUS'),
            remarks: getStepRemarks(items, 'FRM_PLANT_INCH_REM') // Added Remarks
        },
        { 
            label: 'To Plant Incharge', 
            ...getStepActor(items, 'TO_PLANT_INCH_NAME', 'TO_PLANT_INCH_DT'),
            status: getStepStatus(items, 'TO_PLANT_INCH_STATUS'),
            remarks: getStepRemarks(items, 'TO_PLANT_INCH_REM') // Added Remarks
        },
        { 
            label: 'Store Head', 
            ...getStepActor(items, 'STR_HEAD_NAME', 'STR_HEAD_DT'),
            status: getStepStatus(items, 'STR_HEAD_STATUS'),
            remarks: getStepRemarks(items, 'STR_HEAD_REM') // Added Remarks
        },
        { 
            label: 'EVC', 
            ...getStepActor(items, 'EVC_NAME', 'EVC_DT'),
            status: getStepStatus(items, 'EVC_STATUS'),
            remarks: getStepRemarks(items, 'EVC_REM') // Added Remarks
        },
    ].filter(step => step.name && step.name.trim() !== "");

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            
            {/* Section 1: Transfer Information */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                <Box sx={{ backgroundColor: '#f0f4f8', px: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle2" sx={{ color: '#1976d2', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Transfer Information
                    </Typography>
                </Box>
                <Box sx={{ p: 2, backgroundColor: '#f8f9fa', display: 'flex', flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: '280px', pr: 2, borderRight: { md: '1px solid #ddd' } }}>
                        <HeaderField label="Case ID" value={selectedRowData?.CASEID || items[0]?.CASEID} />
                        <HeaderField label="Raiser" value={data.name} />
                        <HeaderField label="Department" value={data.department} />
                        <HeaderField label="Request Date" value={formatDate(data.raiser_date)} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '280px', pl: { md: 4, xs: 0 }, pt: { xs: 2, md: 0 } }}>
                        <HeaderField label="From Plant" value={items[0]?.SEND_PLANT_CODE} valueColor="#d32f2f" />
                        <HeaderField label="To Plant" value={items[0]?.REC_PLANT_CODE} valueColor="#2e7d32" />
                        <HeaderField label="From Co" value={items[0]?.SEND_COMP_CODE} />
                        <HeaderField label="To Co" value={items[0]?.REC_COMP_CODE} />
                    </Box>
                </Box>
            </Box>

            {/* Section 2: Items Table */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, backgroundColor: '#ffffff' }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, color: '#1976d2', fontWeight: 'bold' }}>
                    Materials for Transfer
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #eee' }}>
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', fontSize: '11px' }}>Material Description</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>Code</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>UOM</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>Prev Qty</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>Req Qty</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>Cum Qty</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index} sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}>
                                    <TableCell sx={{ fontSize: '10px' }}>{item.MAT_DESCP}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '10px' }}>{item.MAT_CODE}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '10px' }}>{item.UNIT}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '10px' }}>{item.PREV_QTY}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '10px' }}>{item.REQ_QTY}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '10px', fontWeight: 'bold' }}>{item.CUMUL_QTY}</TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ 
                                            backgroundColor: getStatusColor(item.CUR_STATUS), 
                                            color: 'white', fontSize: '9px', borderRadius: '4px', p: '2px 8px', display: 'inline-block', fontWeight: 'bold'
                                        }}>
                                            {item.CUR_STATUS || 'PENDING'}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

      {/* Section 3: Approval History */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, backgroundColor: '#f8f9fa' }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, color: '#1976d2', fontWeight: 'bold' }}>
                    Approval History
                </Typography>
                {approvalSteps.map((step, index) => (
                    <Box key={index} sx={{ p: 1, borderBottom: '1px dashed #ccc', '&:last-child': { borderBottom: 'none' } }}>
                        {/* TOP ROW: Name and Status */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{step.label}: {step.name}</Typography>
                                {step.date && <Typography variant="caption" color="textSecondary">Processed on: {formatDate(step.date)}</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: getStatusColor(step.status) }}>
                                {step.status}
                            </Typography>
                        </Box>

                        {/* BOTTOM ROW: Remarks (If exist) */}
                        {step.remarks && (
                            <Box sx={{ mt: 0.8, p: 0.8, backgroundColor: '#fff', borderRadius: '4px', borderLeft: '3px solid #1976d2', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <Typography variant="caption" sx={{ color: '#555', fontStyle: 'italic', display: 'block' }}>
                                    <b>Remarks:</b> {step.remarks}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                ))}


                {/* Updated Footer Status */}
                {/* <Box sx={{ mt: 2, p: 1.5, backgroundColor: isOverallTodo ? '#fffde7' : '#f5f5f5', borderRadius: '6px', border: isOverallTodo ? '1px solid #fbc02d' : '1px solid #ddd' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: isOverallTodo ? '#b45309' : '#333' }}>
                        {isOverallTodo ? "Currently At:" : "Final Status:"}
                    </Typography>
                    <Typography variant="body2">
                        <b>Task:</b> {isOverallTodo ? pendingItem.CUR_TASK : (lastActorItem?.CUR_TASK || data.current_task)}
                    </Typography>
                    <Typography variant="body2">
                        <b>Assigned To:</b> {isOverallTodo ? pendingItem.CUR_USR : (lastActorItem?.CUR_USR || data.current_user)}
                    </Typography>
                    <Typography variant="body2">
                        <b>Status:</b> 
                        <span style={{ 
                            color: getStatusColor(isOverallTodo ? "TO_DO" : (lastActorItem?.CUR_STATUS || data.current_status)), 
                            fontWeight: 'bold', 
                            marginLeft: '5px' 
                        }}>
                            {isOverallTodo ? "TO_DO" : (lastActorItem?.CUR_STATUS || data.current_status)}
                        </span>
                    </Typography>
                </Box> */}
            </Box>
        </Box>
    );
};

export default StockTransferActionView;