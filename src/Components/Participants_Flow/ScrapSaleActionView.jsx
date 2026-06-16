// import React from 'react';
// import { Box, Typography, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// // Helper: If any item in this step is approved, the whole step is "Approve"
// const getStepStatus = (items, statusKey) => {
//     const statuses = items.map(item => item[statusKey]).filter(Boolean);
//     if (statuses.length === 0) return null;

//     if (statuses.some(s => s.toLowerCase() === 'approve')) return "Approve";
//     if (statuses.some(s => s.toLowerCase() === 'reject')) return "Reject";
//     return statuses[0];
// };

// // Helper: Find Name and Date for a step by scanning all items
// const getStepActor = (items, nameKey, dateKey) => {
//     const actorItem = items.find(item => item[nameKey] && item[nameKey].trim() !== "");
//     return {
//         name: actorItem ? actorItem[nameKey] : null,
//         date: actorItem ? actorItem[dateKey] : null
//     };
// };

// // NEW Helper: Find Remarks for a step by scanning all items
// const getStepRemarks = (items, remarksKey) => {
//     const actorItem = items.find(item => item[remarksKey] && item[remarksKey].trim() !== "");
//     return actorItem ? actorItem[remarksKey] : null;
// };

// const HeaderField = ({ label, value, valueColor = "inherit" }) => (
//     <Box sx={{ display: 'flex', mb: 0.8, alignItems: 'baseline' }}>
//         <Typography variant="body2" sx={{ width: '110px', fontWeight: '500', color: '#666', flexShrink: 0 }}>
//             {label}
//         </Typography>
//         <Typography variant="body2" sx={{ fontWeight: '500', color: '#333', mr: 1 }}>
//             :
//         </Typography>
//         <Typography variant="body2" sx={{ fontWeight: '600', color: valueColor, wordBreak: 'break-word' }}>
//             {value || 'N/A'}
//         </Typography>
//     </Box>
// );

// const ScrapSaleActionView = ({ flowLoading, flowData, selectedRowData, formatDate, getStatusColor }) => {
//     if (flowLoading) {
//         return (
//             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
//                 <CircularProgress />
//                 <Typography sx={{ ml: 2 }}>Loading Scrap Sale data...</Typography>
//             </Box>
//         );
//     }

//     if (!flowData || !flowData.data) {
//         return <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>No data available</Typography>;
//     }

//     const data = flowData.data;
//     const items = data.scrap_items || [];

//     // --- LOGIC FOR FOOTER STATUS ---
//     const pendingItem = items.find(item => item.CUR_STATUS === 'TO_DO');
//     const isOverallTodo = !!pendingItem;
//     const lastActorItem = [...items].reverse().find(item => item.CUR_STATUS !== 'PENDING' && item.CUR_STATUS !== 'SUBMITTED');

//     // --- LOGIC FOR HISTORY STEPS ---
//     const approvalSteps = [
//         { 
//             label: 'Request Raised By', 
//             name: data.name, 
//             status: 'SUBMITTED', 
//             date: data.raiser_date,
//             remarks: null // Raiser remarks usually in data.REMARKS if needed
//         },
//         { 
//             label: 'Store Head', 
//             ...getStepActor(items, 'STR_HEAD_NAME', 'STR_HEAD_DT'),
//             status: getStepStatus(items, 'STR_HEAD_STATUS'),
//             remarks: getStepRemarks(items, 'STR_HEAD_REM') // Added Remarks
//         },
//         { 
//             label: 'Vice President', 
//             ...getStepActor(items, 'VP_NAME', 'VP_DT'),
//             status: getStepStatus(items, 'VP_STATUS'),
//             remarks: getStepRemarks(items, 'VP_REM') // Added Remarks
//         },
//         { 
//             label: 'EVC', 
//             ...getStepActor(items, 'EVC_NAME', 'EVC_DT'),
//             status: getStepStatus(items, 'EVC_STATUS'),
//             remarks: getStepRemarks(items, 'EVC_REM') // Added Remarks
//         },
//     ].filter(step => step.name && step.name.trim() !== "");

//     return (
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            
//             {/* Section 1: Information Header */}
//             <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
//                 <Box sx={{ backgroundColor: '#f0f4f8', px: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
//                     <Typography variant="subtitle2" sx={{ color: '#1976d2', fontWeight: 'bold', textTransform: 'uppercase' }}>
//                         Scrap Sale Information
//                     </Typography>
//                 </Box>
//                 <Box sx={{ p: 2, backgroundColor: '#f8f9fa', display: 'flex', flexWrap: 'wrap' }}>
//                     <Box sx={{ flex: 1, minWidth: '280px', pr: 2, borderRight: { md: '1px solid #ddd' } }}>
//                         <HeaderField label="Case ID" value={selectedRowData?.CASEID || items[0]?.CASEID} />
//                         <HeaderField label="Raiser" value={data.name} />
//                         <HeaderField label="Department" value={data.department} />
//                         <HeaderField label="Request Date" value={formatDate(data.raiser_date)} />
//                     </Box>
//                     <Box sx={{ flex: 1, minWidth: '280px', pl: { md: 4, xs: 0 }, pt: { xs: 2, md: 0 } }}>
//                         <HeaderField label="Plant" value={items[0]?.PLANT || selectedRowData?.PLANT} valueColor="#d32f2f" />
//                         <HeaderField label="Process" value="Scrap Sale Request" />
//                         <HeaderField label="Status" value={isOverallTodo ? "TO_DO" : (data.current_status || 'In Progress')} />
//                     </Box>
//                 </Box>
//             </Box>

//             {/* Section 2: Items Table */}
//             <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, backgroundColor: '#ffffff' }}>
//                 <Typography variant="subtitle1" sx={{ mb: 1.5, color: '#1976d2', fontWeight: 'bold' }}>
//                     Materials for Sale
//                 </Typography>
//                 <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #eee' }}>
//                     <Table size="small">
//                         <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
//                             <TableRow>
//                                 <TableCell sx={{ fontWeight: 'bold', fontSize: '11px' }}>Material Description</TableCell>
//                                 <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>UOM</TableCell>
//                                 <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>Prev Qty</TableCell>
//                                 <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>Sale Qty</TableCell>
//                                 <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>Cum Qty</TableCell>
//                                 <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>Status</TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {items.map((item, index) => (
//                                 <TableRow key={index} sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}>
//                                     <TableCell sx={{ fontSize: '10px' }}>{item.MAT_DESCP}</TableCell>
//                                     <TableCell align="center" sx={{ fontSize: '10px' }}>{item.UNIT}</TableCell>
//                                     <TableCell align="center" sx={{ fontSize: '10px' }}>{item.PREV_QTY}</TableCell>
//                                     <TableCell align="center" sx={{ fontSize: '10px', fontWeight: 'bold' }}>{item.SALE_QTY}</TableCell>
//                                     <TableCell align="center" sx={{ fontSize: '10px' }}>{item.CUMUL_QTY}</TableCell>
//                                     <TableCell align="center">
//                                         <Box sx={{ 
//                                             backgroundColor: getStatusColor(item.CUR_STATUS), 
//                                             color: 'white', fontSize: '9px', borderRadius: '4px', p: '2px 8px', display: 'inline-block', fontWeight: 'bold', minWidth: '70px', textAlign: 'center'
//                                         }}>
//                                             {item.CUR_STATUS || 'PENDING'}
//                                         </Box>
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             </Box>

//             {/* Section 3: Approval History */}
//             <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, backgroundColor: '#f8f9fa' }}>
//                 <Typography variant="subtitle1" sx={{ mb: 1.5, color: '#1976d2', fontWeight: 'bold' }}>
//                     Approval History
//                 </Typography>
//                 {approvalSteps.map((step, index) => (
//                     <Box key={index} sx={{ p: 1, borderBottom: '1px dashed #ccc', '&:last-child': { borderBottom: 'none' } }}>
//                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                             <Box>
//                                 <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{step.label}: {step.name}</Typography>
//                                 {step.date && <Typography variant="caption" color="textSecondary">Processed on: {formatDate(step.date)}</Typography>}
//                             </Box>
//                             <Typography variant="body2" sx={{ fontWeight: 'bold', color: getStatusColor(step.status) }}>
//                                 {step.status}
//                             </Typography>
//                         </Box>
                        
//                         {/* RENDER REMARKS IF EXIST */}
//                         {step.remarks && (
//                             <Box sx={{ mt: 0.5, p: 0.8, backgroundColor: '#fff', borderRadius: '4px', borderLeft: '3px solid #1976d2' }}>
//                                 <Typography variant="caption" sx={{ color: '#555', fontStyle: 'italic', display: 'block' }}>
//                                     <b>Remarks:</b> {step.remarks}
//                                 </Typography>
//                             </Box>
//                         )}
//                     </Box>
//                 ))}

//                 {/* Footer Context-Aware Status */}
//                 <Box sx={{ 
//                     mt: 2, 
//                     p: 1.5, 
//                     backgroundColor: isOverallTodo ? '#fffde7' : '#f5f5f5', 
//                     borderRadius: '6px', 
//                     border: isOverallTodo ? '1px solid #fbc02d' : '1px solid #ddd' 
//                 }}>
//                     <Typography variant="body2" sx={{ fontWeight: 'bold', color: isOverallTodo ? '#b45309' : '#333' }}>
//                         {isOverallTodo ? "Currently At:" : "Final Status:"}
//                     </Typography>
//                     <Typography variant="body2">
//                         <b>Task:</b> { data.current_task }
//                     </Typography>
//                     <Typography variant="body2">
//                         <b>Assigned To:</b> {  data.current_user }
//                     </Typography>
//                     <Typography variant="body2">
//                         <b>Status:</b> 
//                         <span style={{ 
//                             color: getStatusColor(  data.current_status), 
//                             fontWeight: 'bold', 
//                             marginLeft: '5px' 
//                         }}>
//                             { data.current_status}
//                         </span>
//                     </Typography>
//                 </Box>
//             </Box>
//         </Box>
//     );
// };

// export default ScrapSaleActionView;


import React from 'react';
import { Box, Typography, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import AttachmentIcon from '@mui/icons-material/Attachment'; // Added icon for docs
// Helper: If any item in this step is approved, the whole step is "Approve"
const getStepStatus = (items, statusKey) => {
    const statuses = items.map(item => item[statusKey]).filter(Boolean);
    if (statuses.length === 0) return null;

    if (statuses.some(s => s.toLowerCase() === 'approve')) return "Approve";
    if (statuses.some(s => s.toLowerCase() === 'reject')) return "Reject";
    return statuses[0];
};

// Helper: Find Name and Date for a step by scanning all items
const getStepActor = (items, nameKey, dateKey) => {
    const actorItem = items.find(item => item[nameKey] && item[nameKey].trim() !== "");
    return {
        name: actorItem ? actorItem[nameKey] : null,
        date: actorItem ? actorItem[dateKey] : null
    };
};

// Helper: Find Remarks for a step
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

const ScrapSaleActionView = ({ flowLoading, flowData, selectedRowData, formatDate, getStatusColor }) => {
    if (flowLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading Scrap Sale data...</Typography>
            </Box>
        );
    }

    if (!flowData || !flowData.data) {
        return <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>No data available</Typography>;
    }

    const data = flowData.data;
    const items = data.scrap_items || [];
    const documents = data.lifting_documents || [];
    // --- NEW FOOTER LOGIC ---
    // Find if any item is currently in TO_DO
    const todoItem = items.find(i => i.CUR_STATUS === 'TO_DO');
    const isOverallTodo = !!todoItem;

    // Determine Logic-Based Status
    let displayStatus = "Reject"; 
    if (isOverallTodo) {
        displayStatus = "TO_DO";
    } else if (items.some(i => i.CUR_STATUS === 'Approve')) {
        displayStatus = "Approve";
    }

    // Determine Logic-Based User
    let displayUser = "N/A";
    let displayTask = data.current_task || "Completed";

    if (isOverallTodo) {
        displayTask = todoItem.CUR_TASK;
        displayUser = (todoItem.CUR_USR && todoItem.CUR_USR.trim() !== "") 
            ? todoItem.CUR_USR 
            : "Unassigned / Pending Claim";
    } else {
        displayUser = data.current_user || "N/A";
    }

    // --- HISTORY LOGIC ---
    const approvalSteps = [
        { label: 'Request Raised By', name: data.name, status: 'SUBMITTED', date: data.raiser_date, remarks: null },
        { label: 'Store Head', ...getStepActor(items, 'STR_HEAD_NAME', 'STR_HEAD_DT'), status: getStepStatus(items, 'STR_HEAD_STATUS'), remarks: getStepRemarks(items, 'STR_HEAD_REM') },
        { label: 'Vice President', ...getStepActor(items, 'VP_NAME', 'VP_DT'), status: getStepStatus(items, 'VP_STATUS'), remarks: getStepRemarks(items, 'VP_REM') },
        { label: 'EVC', ...getStepActor(items, 'EVC_NAME', 'EVC_DT'), status: getStepStatus(items, 'EVC_STATUS'), remarks: getStepRemarks(items, 'EVC_REM') },
        { label: 'Purchase', ...getStepActor(items, 'PURCHASE_NAME', 'PURCHASE_DT'), status: getStepStatus(items, 'PURCHASE_STATUS'), remarks: getStepRemarks(items, 'PURCHASE_REM') },
    ].filter(step => step.name && step.name.trim() !== "");

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            
            {/* Section 1: Information Header */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                <Box sx={{ backgroundColor: '#f0f4f8', px: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle2" sx={{ color: '#1976d2', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Scrap Sale Information
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
                        <HeaderField label="Plant" value={items[0]?.PLANT || selectedRowData?.PLANT} valueColor="#d32f2f" />
                        <HeaderField label="Process" value="Scrap Sale Request" />
                        <HeaderField label="Status" value={displayStatus} />
                    </Box>
                    
                    {/* --- NEW: LIFTING DOCUMENTS SUB-SECTION --- */}
                    {documents.length > 0 && (
                        <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #ddd' }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                Lifting Documents / Attachments:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {documents.map((doc, idx) => (
                                    <Box 
                                        key={idx}
                                        component="a"
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 0.5,
                                            backgroundColor: '#e3f2fd',
                                            border: '1px solid #bbdefb',
                                            borderRadius: '4px',
                                            px: 1,
                                            py: 0.5,
                                            textDecoration: 'none',
                                            color: '#1976d2',
                                            '&:hover': { backgroundColor: '#bbdefb' }
                                        }}
                                    >
                                        <AttachmentIcon sx={{ fontSize: '14px' }} />
                                        <Typography sx={{ fontSize: '11px', fontWeight: 'bold' }}>
                                            {doc.name}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Section 2: Items Table */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, backgroundColor: '#ffffff' }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, color: '#1976d2', fontWeight: 'bold' }}>
                    Materials for Sale
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #eee' }}>
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', fontSize: '11px' }}>Material Description</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>UOM</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>Prev Qty</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>Sale Qty</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>Cum Qty</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '11px' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index} sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}>
                                    <TableCell sx={{ fontSize: '10px' }}>{item.MAT_DESCP}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '10px' }}>{item.UNIT}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '10px' }}>{item.PREV_QTY}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '10px', fontWeight: 'bold' }}>{item.SALE_QTY}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '10px' }}>{item.CUMUL_QTY}</TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ 
                                            backgroundColor: getStatusColor(item.CUR_STATUS), 
                                            color: 'white', fontSize: '9px', borderRadius: '4px', p: '2px 8px', display: 'inline-block', fontWeight: 'bold', minWidth: '70px', textAlign: 'center'
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{step.label}: {step.name}</Typography>
                                {step.date && <Typography variant="caption" color="textSecondary">Processed on: {formatDate(step.date)}</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: getStatusColor(step.status) }}>
                                {step.status}
                            </Typography>
                        </Box>
                        {step.remarks && (
                            <Box sx={{ mt: 0.5, p: 0.8, backgroundColor: '#fff', borderRadius: '4px', borderLeft: '3px solid #1976d2' }}>
                                <Typography variant="caption" sx={{ color: '#555', fontStyle: 'italic', display: 'block' }}>
                                    <b>Remarks:</b> {step.remarks}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                ))}

                {/* --- CORRECTED FOOTER --- */}
                {/* <Box sx={{ 
                    mt: 2, 
                    p: 1.5, 
                    backgroundColor: isOverallTodo ? '#fffde7' : (displayStatus === 'Reject' ? '#ffebee' : '#e8f5e9'), 
                    borderRadius: '6px', 
                    border: '1px solid #ddd'
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: isOverallTodo ? '#b45309' : '#333' }}>
                        {isOverallTodo ? "Currently At:" : "Final Status:"}
                    </Typography>
                    <Typography variant="body2">
                        <b>Task:</b> {displayTask}
                    </Typography>
                    <Typography variant="body2">
                        <b>Assigned To:</b> {displayUser}
                    </Typography>
                    <Typography variant="body2">
                        <b>Status:</b> 
                        <span style={{ 
                            color: getStatusColor(displayStatus), 
                            fontWeight: 'bold', 
                            marginLeft: '5px' 
                        }}>
                            {displayStatus}
                        </span>
                    </Typography>
                </Box> */}
            </Box>
        </Box>
    );
};

export default ScrapSaleActionView;