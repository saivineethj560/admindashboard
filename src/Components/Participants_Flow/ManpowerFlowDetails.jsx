import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';


const ManpowerFlowDetails = ({ flowLoading, flowData, formatDate, selectedRowData, getStatusColor }) => {
    if (flowLoading) return <CircularProgress />;
    if (!flowData || !flowData.data) return <Typography>No data available</Typography>;

    const data = flowData.data;

     // 2. Add this logic to check the status from the main table row
    const rowStatus = selectedRowData?.ACTION_STATUS || '';
    const isFinished = rowStatus.toLowerCase() === 'completed' || rowStatus.toLowerCase() === 'approved';

    /* ── make amber readable on white ── */
    const getSafeStatusColor = (status) => {
        const color = getStatusColor(status);
        if (color === '#facc15' || status?.toLowerCase() === 'to_do') return '#b45309';
        if (status?.toLowerCase() === 'revert') return '#ea580c'; // ← ADD THIS LINE
        return color;
    };

    /* ── determine which flow based on TYPE_PLANT or plant code ── */
    const plantCode = (data.PLANT || '').toString().substring(0, 4);
    const isFlowA = ['2000', '2150', '2250'].includes(plantCode) || data.TYPE_PLANT === 'A';

    /* ── build step definitions from exact backend fields ── */
    const flowBCSteps = [
        {
            id: 'GM',
            label: 'GM (Planning & QS)',
            name: data.GM_NAME,
            status: data.GM_STATUS,
            date: data.GM_DATE,
        },
        {
            id: 'PRJ_HEAD',
            label: 'Project Head',
            name: data.PRJ_NAME,
            status: data.PRJ_STATUS,
            date: data.PRJ_DATE,
        },
        {
            id: 'FUNC_HEAD',
            label: 'Functional Head',
            name: data.FUNC_NAME,
            status: data.FUNC_STATUS,
            date: data.FUNC_DATE,
        },
        {
            id: 'SP',
            label: 'Sr. President',
            name: data.SP_NAME,
            status: data.SP_STATUS,
            date: data.SP_DATE,
        },
        {
            id: 'EVC',
            label: 'EVC',
            name: data.EVC_NAME,
            status: data.EVC_STATUS,
            date: data.EVC_DATE,
        },
    ];

    const flowASteps = [
        {
            id: 'HOD',
            label: 'HO HOD',
            name: data.HO_HOD_NAME,
            status: data.HO_HOD_STATUS,
            date: data.HO_HOD_DATE,
        },
        {
            id: 'EVC',
            label: 'EVC / MD / CFO',
            name: data.EVC_NAME,
            status: data.EVC_STATUS,
            date: data.EVC_DATE,
        },
    ];

    const allSteps = isFlowA ? flowASteps : flowBCSteps;

    /* ── only show steps that have a name OR are the current TO_DO task ── */
    /* ── FIX: split into visibleSteps first, then cut off after rejection ── */
    // const visibleSteps = allSteps.filter(step =>
    //     (step.name && step.name.trim() !== '') ||
    //     (data.CUR_TASK === step.id && data.CUR_STATUS === 'TO_DO')
    // );

     const visibleSteps = allSteps.filter(step => {
        const hasName = step.name && step.name.trim() !== '';
        const isCurrentTask = data.CUR_TASK === step.id;
        
        // Logic:
        // 1. If the step has a name (someone actually touched it), always show it.
        // 2. If it doesn't have a name, only show it as a 'Pending' row if the process isn't finished.
        return hasName || (!isFinished && isCurrentTask);
    });

    const rejectedIndex = visibleSteps.findIndex(step =>
        step.status?.toLowerCase() === 'reject' ||
        step.status?.toLowerCase() === 'rejected'
    );

    const activeSteps = rejectedIndex !== -1
        ? visibleSteps.slice(0, rejectedIndex + 1)
        : visibleSteps;

    const isRejected = rejectedIndex !== -1;
    /* ── END FIX ── */

    /* ── render one approval step box (matches ScrapSale renderStepBox) ── */
    const renderStepBox = (step) => {
        const { id, label, name, status, date } = step;

        const isCurrent = data.CUR_TASK === id;
        const isTodo = isCurrent && (data.CUR_STATUS === 'TO_DO');
        const displayName = (name && name.trim() !== '')
            ? name
            : isTodo
                ? (data.CUR_USR && data.CUR_USR.trim() !== '' ? data.CUR_USR : 'Unassigned')
                : 'Pending';
        // const displayStatus = status || (isTodo ? 'TO_DO' : 'Pending');
         const displayStatus = (isCurrent && isFinished) ? rowStatus : (status || (isTodo ? 'TO_DO' : 'Pending'));
        // ← ADD HERE
        const formatStatus = (s) => {
            if (!s) return 'Pending';
            const lower = s.toLowerCase();
            if (lower === 'approve') return 'Approve';
            if (lower === 'reject' || lower === 'rejected') return 'Rejected';
            if (lower === 'to_do') return 'Pending';
            if (lower === 'revert') return 'Revert';
            if (lower === 'completed') return 'Completed';
            return s;
        };

        return (
            <Box sx={{
                border: '1px solid #ccc',
                borderRadius: '6px',
                p: 1,
                mb: 1,
                backgroundColor: displayStatus?.toLowerCase() === 'revert'
                    ? '#fff7ed'
                    : isTodo ? '#fffde7' : '#f5f5f5',
            }}>
                <Box sx={{ display: 'flex', gap: 1 }}>

                    {/* Left — approver info */}
                    <Box sx={{ flex: 0.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '11px' }}>
                            {displayName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'gray', display: 'block', fontSize: '10px' }}>
                            {label}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: getSafeStatusColor(displayStatus), mt: 0.5, fontSize: '10px' }}>
                            {formatStatus(displayStatus)}
                        </Typography>
                        {date && (
                            <Typography sx={{ fontSize: '9px', mt: 0.5 }}>
                                {formatDate(date)}
                            </Typography>
                        )}
                    </Box>

                    {/* Right — request summary (single record, not items array) */}
                    <Box sx={{ flex: 1.5, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>

                        {/* Header */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1.8fr 80px 60px 65px', gap: '4px', borderBottom: '1px solid #ddd', pb: 0.5 }}>
                            {['Position', 'Type', 'Req', 'Status'].map(h => (
                                <Typography key={h} variant="caption" fontWeight="bold"
                                    align={h === 'Position' ? 'left' : 'center'} sx={{ fontSize: '10px' }}>
                                    {h}
                                </Typography>
                            ))}
                        </Box>

                        {/* Single data row */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1.8fr 80px 60px 65px', gap: '4px', py: 0.5 }}>
                            <Typography sx={{ fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {data.MANPOWER_DESG || data.JOB_TIT || '-'}
                            </Typography>
                            <Typography sx={{ fontSize: '9px' }} align="center">
                                {data.POSITION || '-'}
                            </Typography>
                            <Typography sx={{ fontSize: '9px' }} align="center">
                                {data.NUM_REQUIRE || '-'}
                            </Typography>
                            <Box sx={{
                                backgroundColor: displayStatus?.toLowerCase() === 'revert' ? '#f97316' : getStatusColor(displayStatus),
                                color: 'white',
                                fontSize: '8px',
                                borderRadius: '2px',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                py: 0.2,
                            }}>
                                {formatStatus(displayStatus)}
                            </Box>

                        </Box>

                        {/* Extra details row */}
                        <Box sx={{ mt: 0.5, pt: 0.5, borderTop: '1px solid #f0f0f0' }}>
                            <Typography sx={{ fontSize: '9px', color: '#555' }}>
                                Dept: <strong>{data.DEPT || '-'}</strong> &nbsp;|&nbsp;
                                Recruit For: <strong>{data.RECRUIT_FOR || '-'}</strong>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    };

    return (
        <Box sx={{ p: 1 }}>

            {/* Raiser header */}
            <Box sx={{
                border: '1px solid #ccc',
                borderRadius: '6px',
                p: 1,
                mb: 1,
                backgroundColor: '#e3f2fd',
                textAlign: 'center',
            }}>
                <Typography variant="body2" fontWeight="bold">
                    Manpower Request By: {data.RAISER}
                </Typography>
                <Typography variant="caption">
                    Dept: {data.RAISER_DEPT} | Plant: {data.PLANT} | Date: {data.RAISER_DATE}
                </Typography>
            </Box>

            {/* Approval step boxes */}
            {activeSteps.map((step) => (
                <React.Fragment key={step.id}>
                    <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.1, lineHeight: 1 }}>↓</Typography>
                    {renderStepBox(step)}
                </React.Fragment>
            ))}
             {/* ── NEW: Reverted to Raiser block ── */}
        {!isRejected && data.CUR_TASK === 'RAISER' && data.CUR_STATUS === 'TO_DO' && (
            <>
                <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.1, lineHeight: 1 }}>↓</Typography>
                {/* <Box sx={{
                    border: '1px solid #fb923c',
                    borderRadius: '6px',
                    p: 1,
                    mb: 1,
                    backgroundColor: '#fff7ed',
                    textAlign: 'center',
                }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '12px', color: '#c2410c' }}>
                        Reverted — Awaiting Raiser Resubmission
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9a3412', display: 'block', mt: 0.3 }}>
                        {data.CUR_USR || data.RAISER}
                    </Typography>
                </Box> */}
            </>
        )}

            {/* Final status block — shown when COMPLETED or Rejected */}
            {/* ── FIX: use isRejected instead of data.CUR_STATUS === 'Reject' ── */}
            {/* {(data.STATUS === 'COMPLETED' || isRejected) && (
                <>
                    <Typography sx={{ textAlign: 'center', color: '#1976d2', my: 0.1, lineHeight: 1 }}>↓</Typography>
                    <Box sx={{
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        p: 1,
                        backgroundColor: isRejected ? '#ffebee' : '#e8f5e9',
                        textAlign: 'center',
                    }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '12px' }}>
                            Final Status
                        </Typography>
                        <Typography variant="body2" fontWeight="bold"
                            sx={{ mt: 0.5, color: isRejected ? '#d32f2f' : getSafeStatusColor(data.STATUS), fontSize: '12px' }}>
                            {isRejected ? 'REJECTED' : 'COMPLETED'}
                        </Typography>
                    </Box>
                </>
            )} */}
        </Box>
    );
};

export default ManpowerFlowDetails;

