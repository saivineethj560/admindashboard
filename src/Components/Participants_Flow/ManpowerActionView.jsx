import React from 'react';
import { Box, Typography, CircularProgress, Divider } from '@mui/material';

const ManpowerActionView = ({ flowLoading, flowData, selectedRowData, formatDate, getStatusColor }) => {
    if (flowLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading flow data…</Typography>
            </Box>
        );
    }

    if (!flowData || !flowData.data) {
        return (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                No flow data available
            </Typography>
        );
    }

    const data = flowData.data;

    const getSafeStatusColor = (status) => {
        const color = getStatusColor(status);
        if (color === '#facc15' || status?.toLowerCase() === 'to_do') return '#b45309';
        if (status?.toLowerCase() === 'revert') return '#ea580c';
        return color;
    };

    const displayStatus = (raw) => {
        if (!raw) return 'Pending';
        const s = raw.toLowerCase();
        if (s === 'completed') return 'Completed';
        if (s === 'approve') return 'Approved';
        if (s === 'reject' || s === 'rejected') return 'Rejected';
        if (s === 'to_do') return 'Pending';
        if (s === 'revert') return 'Revert';
        return raw;
    };

    const plantCode = (data.PLANT || '').toString().substring(0, 4);
    const isFlowA = ['2000', '2150', '2250'].includes(plantCode) || data.TYPE_PLANT === 'A';

    const flowBCSteps = [
        { id: 'GM', label: 'GM (Planning & QS)', name: data.GM_NAME, status: data.GM_STATUS, date: data.GM_DATE },
        { id: 'PRJ_HEAD', label: 'Project Head', name: data.PRJ_NAME, status: data.PRJ_STATUS, date: data.PRJ_DATE },
        { id: 'FUNC_HEAD', label: 'Functional Head', name: data.FUNC_NAME, status: data.FUNC_STATUS, date: data.FUNC_DATE },
        { id: 'SP', label: 'Sr. President', name: data.SP_NAME, status: data.SP_STATUS, date: data.SP_DATE },
        { id: 'EVC', label: 'EVC', name: data.EVC_NAME, status: data.EVC_STATUS, date: data.EVC_DATE },
    ];

    const flowASteps = [
        { id: 'HOD', label: 'HO HOD', name: data.HO_HOD_NAME, status: data.HO_HOD_STATUS, date: data.HO_HOD_DATE },
        { id: 'EVC', label: 'EVC / MD / CFO', name: data.EVC_NAME, status: data.EVC_STATUS, date: data.EVC_DATE },
    ];

    const allSteps = isFlowA ? flowASteps : flowBCSteps;

    /* ── mirror the same filter + cut-off logic from ManpowerFlowDetails ── */
    const visibleSteps = allSteps.filter(step =>
        (step.name && step.name.trim() !== '') ||
        (data.CUR_TASK === step.id && data.CUR_STATUS === 'TO_DO')
    );

    const rejectedIndex = visibleSteps.findIndex(step =>
        step.status?.toLowerCase() === 'reject' ||
        step.status?.toLowerCase() === 'rejected'
    );

    const activeSteps = rejectedIndex !== -1
        ? visibleSteps.slice(0, rejectedIndex + 1)
        : visibleSteps;

    const isRejected = rejectedIndex !== -1;
    const isCompleted = data.STATUS === 'COMPLETED';
    /* ── END ── */

    const Field = ({ label, value }) => (
        <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.9 }}>
            <span style={{ fontWeight: 'bold' }}>{label}: </span>
            <span style={{ color: '#555' }}>{value || '-'}</span>
        </Typography>
    );

    const Row = ({ leftLabel, leftValue, rightLabel, rightValue }) => (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Field label={leftLabel} value={leftValue} />
            <Field label={rightLabel} value={rightValue} />
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* ── 1. Request Information ── */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2.5, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                    Request Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    <Row leftLabel="Raised By" leftValue={data.RAISER}
                        rightLabel="Request Date" rightValue={data.RAISER_DATE} />
                    <Row leftLabel="Department" leftValue={data.RAISER_DEPT}
                        rightLabel="Designation" rightValue={data.RAISER_DESG || data.MANPOWER_DESG} />
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    <Row leftLabel="Plant" leftValue={data.PLANT}
                        rightLabel="Department" rightValue={data.DEPT || data.RAISER_DEPT} />
                    <Row leftLabel="Position" leftValue={data.MANPOWER_DESG}
                        rightLabel="Employee Level" rightValue={data.EMP_LEVEL || data.RECRUIT_CYCLE} />
                    <Row leftLabel="Type of Employment" leftValue={data.POSITION || data.sub_post || '-'}
                        rightLabel="Qualification" rightValue={data.EDUCATION} />
                    <Row leftLabel="Experience" leftValue={data.EXP ? `${data.EXP} yrs` : '-'}
                        rightLabel="Hiring For" rightValue={data.RECRUIT_FOR} />
                </Box>
                {data.JOB_DESC && (
                    <>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333', mb: 0.5 }}>
                            Job Description:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#555', fontSize: '12px' }}>
                            {data.JOB_DESC}
                        </Typography>
                    </>
                )}
            </Box>

            {/* ── 2. Approval Flow ── */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                    Approval Flow
                </Typography>

                {activeSteps.map((step) => {
                    const isCurrent = data.CUR_TASK === step.id;
                    const isTodo = isCurrent && data.CUR_STATUS === 'TO_DO';
                    const displayName = (step.name && step.name.trim() !== '')
                        ? step.name
                        : isTodo
                            ? (data.CUR_USR && data.CUR_USR.trim() !== '' ? data.CUR_USR : 'Unassigned')
                            : 'Pending';
                    const stepStatus = step.status || (isTodo ? 'TO_DO' : 'Pending');

                    const remarksMap = {
                        GM: data.GM_REM,
                        PRJ_HEAD: data.PRJ_REM,
                        FUNC_HEAD: data.FUNC_REM,
                        SP: data.SP_REM,
                        EVC: data.EVC_REM,
                        HOD: data.HO_HOD_REM,
                    };
                    const stepRemarks = remarksMap[step.id];

                    return (
                        <Box key={step.id} sx={{
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            p: 2,
                            mb: 1.5,
                            backgroundColor: stepStatus?.toLowerCase() === 'revert'
                                ? '#fff7ed'
                                : isTodo ? '#fffde7' : 'white',
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                        {step.label} — {displayName}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: getSafeStatusColor(stepStatus), fontWeight: 'bold' }}>
                                        Status: {displayStatus(stepStatus)}
                                    </Typography>
                                    {step.date && (
                                        <Typography variant="body2" sx={{ color: '#666', fontSize: '12px', mt: 0.5 }}>
                                            Date: {formatDate(step.date)}
                                        </Typography>
                                    )}
                                    {stepRemarks && stepRemarks.trim() !== '' && (
                                        <Box sx={{ mt: 1, p: 1, backgroundColor: '#f0f4ff', borderRadius: '4px', borderLeft: '3px solid #1976d2' }}>
                                            <Typography variant="body2" sx={{ fontSize: '12px', color: '#444' }}>
                                                <span style={{ fontWeight: 'bold' }}>Remarks: </span>
                                                {stepRemarks}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{
                                    backgroundColor: stepStatus?.toLowerCase() === 'revert' ? '#f97316' : getStatusColor(stepStatus),
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '4px',
                                    alignSelf: 'center',
                                    ml: 1,
                                }}>
                                    {displayStatus(stepStatus)}
                                </Box>
                            </Box>
                        </Box>
                    );
                })}

                {/* ── Final Status block — shown when COMPLETED or Rejected ── */}
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

                {/* ── Current Status block — shown only when NOT completed/rejected ── */}
                {!isCompleted && !isRejected && (
    <Box sx={{
        border: '1px solid #ddd',
        borderRadius: '6px',
        p: 2,
        backgroundColor: data.CUR_TASK === 'RAISER' ? '#fff7ed' : '#fffde7',
        borderColor: data.CUR_TASK === 'RAISER' ? '#fb923c' : '#ddd',
    }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Current Status
        </Typography>

        {data.CUR_TASK === 'RAISER' ? (
            /* ── Reverted state ── */
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#c2410c', fontWeight: 'bold' }}>
                    Reverted — Awaiting Raiser Resubmission
                </Typography>
                <Typography variant="body2">
                    Raiser: <strong>{data.CUR_USR || data.RAISER}</strong>
                </Typography>
                <Box sx={{
                    backgroundColor: '#f97316',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '4px',
                }}>
                    REVERTED
                </Box>
            </Box>
        ) : (
            /* ── Normal pending state ── */
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                    Current User:{' '}
                    <strong>
                        {data.CUR_USR && data.CUR_USR.trim() !== ''
                            ? data.CUR_USR
                            : 'Unassigned / Pending Claim'}
                    </strong>
                </Typography>
                <Typography variant="body2">
                    Current Task:{' '}
                    <strong>
                        {{
                            'GM':        'GM (Planning & QS)',
                            'PRJ_HEAD':  'Project Head',
                            'FUNC_HEAD': 'Functional Head',
                            'SP':        'Sr. President',
                            'EVC':       'EVC',
                            'HOD':       'HO HOD',
                            'DIRECTOR':  'Director',
                            'MD':        'MD',
                            'CFO':       'CFO',
                        }[data.CUR_TASK] || data.CUR_TASK || '-'}
                    </strong>
                </Typography>
                <Typography variant="body2" fontWeight="bold"
                    sx={{ color: getSafeStatusColor(data.CUR_STATUS || data.STATUS) }}>
                    Status: {displayStatus(data.CUR_STATUS || data.STATUS)}
                </Typography>
            </Box>
        )}
    </Box>
)}
            </Box>
        </Box>
    );
};

export default ManpowerActionView;