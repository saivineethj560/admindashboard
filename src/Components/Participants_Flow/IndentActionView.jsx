import React from 'react';
import { Box, Typography, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const IndentActionView = ({ flowLoading, flowData, selectedRowData, formatDate, getStatusColor }) => {
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
    const items = data.indent_items || [];

    // Define the approval steps to display in the summary timeline
    const approvalSteps = [
        { label: 'Project Manager', name: data.PM_NAME, status: data.PM_STATUS, date: data.PM_APP_DATE },
        { label: 'Project Incharge', name: data.PRJ_INC_NAME, status: data.PRJ_INC_STATUS, date: data.PRJ_INC_DT },
        { label: 'Planning/QS', name: data.PLAN_QS_NAME, status: data.PLAN_QS_STATUS, date: data.PLAN_QS_DT },
        { label: 'Project Head', name: data.PRJ_HEAD_NAME, status: data.PRJ_HEAD_STATUS, date: data.PRJ_HEAD_DT },
        { label: 'President Project', name: data.PRES_PRJ_NAME, status: data.PRES_PRJ_STATUS, date: data.PRES_PRJ_DT },
        { label: 'President', name: data.PRES_NAME, status: data.PRES_STATUS, date: data.PRES_DT },
        { label: 'Director Projects', name: data.DIRECT_PRJ_NAME, status: data.DIRECT_PRJ_STATUS, date: data.DIRECT_PRJ_DT },
    ].filter(step => step.name && step.name.trim() !== "");

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            
            {/* Section 1: Request Information */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, backgroundColor: '#f8f9fa' }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, color: '#1976d2', fontWeight: 'bold', borderBottom: '1px solid #ddd', pb: 0.5 }}>
                    General Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}><b>Case ID:</b> {selectedRowData?.CASEID}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><b>Raiser:</b> {data.EMP_NAME || data.name}</Typography>
                        <Typography variant="body2"><b>Department:</b> {data.DEPT || data.department}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}><b>Project:</b> {data.PROJ_NAME || 'N/A'}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><b>Date:</b> {formatDate(data.RAISED_DATE || data.raiser_date)}</Typography>
                        <Typography variant="body2"><b> WBS Type:</b> {data.PRJ_TYPE || 'N/A'}</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Section 2: Consolidated Items Table */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, backgroundColor: '#ffffff' }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, color: '#1976d2', fontWeight: 'bold' }}>
                    Materials Requested
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #eee' }}>
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', fontSize: '12px' }}>Material Description</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px' }}>UOM</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px' }}>WBS</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px' }}>Req Qty</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px' }}>App Qty</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px' }}>Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px' }}>cur usr</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index} sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}>
                                    <TableCell sx={{ fontSize: '11px' }}>{item.MAT_DESC}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '11px' }}>{item.UOM}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '11px' }}>{item.WBS_ELE}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '11px' }}>{item.REQ_NOW}</TableCell>
                                    <TableCell align="center" sx={{ fontSize: '11px' }}>{item.QUAN}</TableCell>
                                     <TableCell align="center">
                                        <Box sx={{ 
                                            backgroundColor: '#8e7ad5', // Purple theme to match your app
                                            color: 'white', 
                                            fontSize: '10px', 
                                            borderRadius: '4px', 
                                            p: '2px 8px', 
                                            display: 'inline-block', 
                                            fontWeight: 'bold',
                                            minWidth: '60px',
                                            textAlign: 'center'
                                        }}>
                                            {item.CUR_STATUS}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontSize: '11px' }}>{item.CUR_USER}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Section 3: Approval History & Current Status */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, backgroundColor: '#f8f9fa' }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, color: '#1976d2', fontWeight: 'bold' }}>
                    Approval History
                </Typography>
                
                {approvalSteps.map((step, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '1px dashed #ccc', '&:last-child': { borderBottom: 'none' } }}>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{step.label}: {step.name}</Typography>
                            {step.date && <Typography variant="caption" color="textSecondary">Processed on: {formatDate(step.date)}</Typography>}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: getStatusColor(step.status) }}>
                            {step.status}
                        </Typography>
                    </Box>
                ))}

                <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#fff9c4', borderRadius: '6px', border: '1px solid #fbc02d' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f57f17' }}>Current Pending Step:</Typography>
                    <Typography variant="body2"><b>Task:</b> {data.CUR_TASK || data.current_task}</Typography>
                    <Typography variant="body2"><b>Assigned To:</b> {data.CUR_USER || data.current_user}</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default IndentActionView;