import React from 'react';
import {
    Box, Typography, CircularProgress, Divider, Grid,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';

// ── Header Field sub-component (ScrapSaleActionView style) ──
const HeaderField = ({ label, value, valueColor = 'inherit' }) => (
    <Box sx={{ display: 'flex', mb: 0.8, alignItems: 'baseline' }}>
        <Typography variant="body2" sx={{ width: '130px', fontWeight: '500', color: '#666', flexShrink: 0 }}>
            {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: '500', color: '#333', mr: 1 }}>:</Typography>
        <Typography variant="body2" sx={{ fontWeight: '600', color: valueColor, wordBreak: 'break-word' }}>
            {value || 'N/A'}
        </Typography>
    </Box>
);

const MMAssetActionView = ({ flowLoading, flowData, selectedRowData, formatDate, getStatusColor, isMaximized }) => {

    if (flowLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading Asset data...</Typography>
            </Box>
        );
    }

    if (!flowData || !flowData.data) {
        return (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                No data available
            </Typography>
        );
    }

    const data = flowData.data;

    // ── Safe status color — avoid yellow on light backgrounds ──
    const getSafeStatusColor = (status) => {
        const color = getStatusColor(status);
        if (color === '#facc15' || status?.toLowerCase() === 'to_do' || status?.toLowerCase() === 'pending') {
            return '#b45309';
        }
        if (status?.toLowerCase() === 'revert') return '#ea580c';
        return color;
    };

    // ── Friendly display label ──
    const displayStatus = (raw) => {
        if (!raw) return 'Pending';
        const s = raw.toLowerCase();
        if (s === 'approve' || s === 'approved') return 'Approved';
        if (s === 'reject' || s === 'rejected') return 'Rejected';
        if (s === 'to_do' || s === 'pending') return 'Pending';
        if (s === 'completed') return 'Completed';
        if (s === 'revert') return 'Revert';
        return raw;
    };

    // ── All possible approval steps (from Doc 1 data keys) ──
    const allPossibleSteps = [
        {
            id: 'PM',
            label: 'Project Manager',
            name: data.PM_NAME,
            status: data.PM_STATUS,
            date: data.PM_DT,
            remarks: data.PM_REM,
        },
        {
            id: 'FI_CONSULTANT',
            label: 'Finance Consultant',
            name: data.FI_NAME,
            status: data.FI_STATUS,
            date: data.FI_DT,
            remarks: data.FI_REM,
        },
    ];

    // ── Build visible steps (ManpowerActionView logic) ──
    const buildVisibleSteps = () => {
        const visible = [];
        for (let i = 0; i < allPossibleSteps.length; i++) {
            const step = allPossibleSteps[i];
            const statusLower = (step.status || '').toLowerCase();
            const isCurrentTask = data.current_task === step.id;

            const hasActed =
                statusLower === 'approve' ||
                statusLower === 'approved' ||
                statusLower === 'reject' ||
                statusLower === 'rejected' ||
                statusLower === 'revert' ||
                statusLower === 'completed';

            if (hasActed) {
                visible.push(step);
                if (statusLower === 'reject' || statusLower === 'rejected') break;
                if (statusLower === 'revert') break;
            } else if (isCurrentTask) {
                visible.push(step);
                break;
            }
        }
        return visible;
    };

    const visibleSteps = buildVisibleSteps();

    const isRejected = visibleSteps.some(s => {
        const sl = (s.status || '').toLowerCase();
        return sl === 'reject' || sl === 'rejected';
    });

    const lastStep = allPossibleSteps[allPossibleSteps.length - 1];
    const lastStepActed = lastStep && (() => {
        const sl = (lastStep.status || '').toLowerCase();
        return sl === 'approve' || sl === 'approved' || sl === 'completed';
    })();
    const isCompleted = lastStepActed && !isRejected;

    // ── Overall display status for header ──
    const overallStatus = isCompleted
        ? 'Completed'
        : isRejected
            ? 'Closed'
            : (data.current_status || 'Pending');

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* ═══════════════════════════════════════════════
                Section 1 — Asset Request Information Header
                (ScrapSaleActionView style)
            ═══════════════════════════════════════════════ */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                <Box sx={{ backgroundColor: '#f0f4f8', px: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle2" sx={{ color: '#1976d2', fontWeight: 'bold', textTransform: 'uppercase', fontSize: isMaximized ? '16px' : undefined }}>
                        Asset Creation Request Information
                    </Typography>
                </Box>
                <Box sx={{ p: 2, backgroundColor: '#f8f9fa', display: 'flex', flexWrap: 'wrap' }}>

                    {/* Left column */}
                    <Box sx={{ flex: 1, minWidth: '260px', pr: 2, borderRight: { md: '1px solid #ddd' } }}>
                        <HeaderField label="Case ID" value={selectedRowData?.CASEID || data.case_id} />
                        <HeaderField label="Raised By" value={data.name} />
                        <HeaderField label="Department" value={data.department} />
                        <HeaderField label="Request Date" value={data.raiser_date ? formatDate(data.raiser_date) : data.raiser_date} />
                    </Box>

                    {/* Right column */}
                    <Box sx={{ flex: 1, minWidth: '260px', pl: { md: 4, xs: 0 }, pt: { xs: 2, md: 0 } }}>
                        <HeaderField label="Current Task" value={data.current_task} />
                        <HeaderField label="Current User" value={data.current_user} />
                        <HeaderField label="Process" value="Asset Creation Request" />
                        <HeaderField
                            label="Status"
                            value={overallStatus}
                            valueColor={getSafeStatusColor(data.current_status)}
                        />
                    </Box>
                </Box>
            </Box>

            {/* ═══════════════════════════════════════════════
                Section 2 — Asset Details Table
                (ScrapSaleActionView "Materials" table style)
            ═══════════════════════════════════════════════ */}
            {data.details && Object.keys(data.details).length > 0 && (
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, backgroundColor: '#ffffff' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1.5, color: '#6b1fb1', fontWeight: 'bold' }}>
                        Asset Information
                    </Typography>
                    <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #eee' }}>
                        <Table size="small">
                            <TableHead sx={{ backgroundColor: '#f3e5f5' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', color: '#6b1fb1' }}>
                                        Field
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', color: '#6b1fb1' }}>
                                        Value
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(data.details).map(([key, value], index) => (
                                    <TableRow
                                        key={key}
                                        sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}
                                    >
                                        <TableCell sx={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', fontWeight: '600' }}>
                                            {key}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '11px', fontWeight: 'bold', color: '#222' }}>
                                            {value || 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* ═══════════════════════════════════════════════
                Section 3 — Approval Flow
                (ManpowerActionView style — full logic)
            ═══════════════════════════════════════════════ */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                    Approval Flow
                </Typography>

                {visibleSteps.map((step) => {
                    const isCurrentTask = data.current_task === step.id;
                    const statusLower = (step.status || '').toLowerCase();
                    const isPending = !statusLower || statusLower === 'to_do' || statusLower === 'pending';

                    const displayName = (step.name && step.name.trim() !== '')
                        ? step.name
                        : isCurrentTask
                            ? (data.current_user && data.current_user.trim() !== '' ? data.current_user : 'Unassigned')
                            : 'Unassigned';

                    const stepStatus = step.status || 'Pending';

                    const cardBg = statusLower === 'revert'
                        ? '#fff7ed'
                        : (isPending && isCurrentTask) ? '#fffde7'
                            : 'white';

                    return (
                        <Box key={step.id} sx={{
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            p: 2,
                            mb: 1.5,
                            backgroundColor: cardBg,
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: isMaximized ? '16px' : undefined }}>
                                        {step.label} — {displayName}
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: getSafeStatusColor(stepStatus),
                                        fontWeight: 'bold',
                                        fontSize: isMaximized ? '15px' : undefined,
                                    }}>
                                        Status: {displayStatus(stepStatus)}
                                    </Typography>
                                    {step.date && (
                                        <Typography variant="body2" sx={{ color: '#666', fontSize: isMaximized ? '14px' : '12px', mt: 0.5 }}>
                                            Date: {formatDate ? formatDate(step.date) : step.date}
                                        </Typography>
                                    )}
                                    {step.remarks && step.remarks.trim() !== '' && (
                                        <Box sx={{
                                            mt: 1, p: 1,
                                            backgroundColor: '#f0f4ff',
                                            borderRadius: '4px',
                                            borderLeft: '3px solid #1976d2',
                                        }}>
                                            <Typography variant="body2" sx={{ fontSize: '12px', color: '#444' }}>
                                                <span style={{ fontWeight: 'bold' }}>Remarks: </span>
                                                {step.remarks}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                {/* Status badge chip */}
                                <Box sx={{
                                    backgroundColor: statusLower === 'revert'
                                        ? '#f97316'
                                        : getStatusColor(stepStatus),
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '4px',
                                    alignSelf: 'center',
                                    ml: 1,
                                    minWidth: '65px',
                                    textAlign: 'center',
                                }}>
                                    {displayStatus(stepStatus)}
                                </Box>
                            </Box>
                        </Box>
                    );
                })}

                {/* ── Final Status block (completed or rejected) ── */}
                {(isCompleted || isRejected) && (
                    <Box sx={{
                        border: `1px solid ${isRejected ? '#ffcdd2' : '#c8e6c9'}`,
                        borderRadius: '6px',
                        p: 2,
                        mt: 0.5,
                        backgroundColor: isRejected ? '#ffebee' : '#e8f5e9',
                        textAlign: 'center',
                    }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            Final Status
                        </Typography>
                        <Typography variant="body1" fontWeight="bold"
                            sx={{ color: isRejected ? '#d32f2f' : '#2e7d32', fontSize: '14px' }}>
                            {isRejected ? 'REJECTED' : 'COMPLETED'}
                        </Typography>
                    </Box>
                )}

                {/* ── Current Status block (in-progress) ── */}
                {!isCompleted && !isRejected && (
                    <Box sx={{
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        p: 2,
                        backgroundColor: data.current_task === 'RAISER' ? '#fff7ed' : '#fffde7',
                        borderColor: data.current_task === 'RAISER' ? '#fb923c' : '#ddd',
                    }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Current Status
                        </Typography>

                        {data.current_task === 'RAISER' ? (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#c2410c', fontWeight: 'bold' }}>
                                    Reverted — Awaiting Raiser Resubmission
                                </Typography>
                                <Typography variant="body2">
                                    Raiser: <strong>{data.current_user || data.name}</strong>
                                </Typography>
                                <Box sx={{
                                    backgroundColor: '#f97316', color: 'white',
                                    fontSize: '10px', fontWeight: 'bold',
                                    px: 1.5, py: 0.5, borderRadius: '4px',
                                }}>
                                    REVERTED
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', flexWrap: 'wrap', gap: 1,
                            }}>
                                <Typography variant="body2" sx={{ fontSize: isMaximized ? '15px' : undefined }}>
                                    Current User:{' '}
                                    <strong>
                                        {data.current_user && data.current_user.trim() !== ''
                                            ? data.current_user
                                            : 'Unassigned / Pending Claim'}
                                    </strong>
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: isMaximized ? '15px' : undefined }}>
                                    Current Task: <strong>{data.current_task || '-'}</strong>
                                </Typography>
                                <Typography variant="body2" fontWeight="bold"
                                    sx={{ color: getSafeStatusColor(data.current_status), fontSize: isMaximized ? '15px' : undefined }}>
                                    Status: {displayStatus(data.current_status)}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>

        </Box>
    );
};

export default MMAssetActionView;