import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Divider } from '@mui/material';
import Swal from 'sweetalert2';
import { API_HRM_PROCESS } from '../../Config';

const HRMView = ({ ID }) => {
    const [loading, setLoading] = useState(true);
    const [hrmData, setHrmData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHRMData = async () => {
            setLoading(true);
            setError(null);
            
            try {
        const response = await fetch(
  `${API_HRM_PROCESS}/noteForAprvlGetMRFData/${ID}`
);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log("HRM API DATA:", result);

                if (result.success && result.VerifyData && result.VerifyData.length > 0) {
                    setHrmData(result.VerifyData[0]);
                } else {
                    setError("No data found");
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Failed to fetch approval data");
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch HRM data'
                });
            } finally {
                setLoading(false);
            }
        };

        if (ID) {
            fetchHRMData();
        }
    }, [ID]);

    // Format date function
    const formatDateToDDMMYYYY = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Get status style based on approval status and current step
    const getStatusStyle = (status, isCurrentStep) => {
        if (!status || status.toLowerCase() === 'pending') {
            if (isCurrentStep) {
                return {
                    color: "#ea580c", // Orange/WIP color
                    backgroundColor: "#fff7ed",
                    borderColor: "#fed7aa",
                    badgeColor: "#f97316",
                    badgeText: "WIP"
                };
            }
            return {
                color: "#9ca3af", // Gray for pending
                backgroundColor: "#f9fafb",
                borderColor: "#e5e7eb",
                badgeColor: "#9ca3af",
                badgeText: "PENDING"
            };
        }
        if (status.toLowerCase() === 'approved' || status.toLowerCase() === 'approve') {
            return {
                color: "#22c55e", // Green for approved
                backgroundColor: "#f0fdf4",
                borderColor: "#bbf7d0",
                badgeColor: "#22c55e",
                badgeText: "APPROVED"
            };
        }
        if (status.toLowerCase() === 'reject' || status.toLowerCase() === 'rejected') {
            return {
                color: "#ef4444", // Red for rejected
                backgroundColor: "#fef2f2",
                borderColor: "#fecaca",
                badgeColor: "#ef4444",
                badgeText: "REJECTED"
            };
        }
        return {
            color: "#9ca3af",
            backgroundColor: "#f9fafb",
            borderColor: "#e5e7eb",
            badgeColor: "#9ca3af",
            badgeText: "PENDING"
        };
    };

    const displayStatus = (raw) => {
        if (!raw) return 'Pending';
        const s = raw.toLowerCase();
        if (s === 'approved' || s === 'approve') return 'Approved';
        if (s === 'reject' || s === 'rejected') return 'Rejected';
        if (s === 'pending') return 'Pending';
        return raw;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading HRM data...</Typography>
            </Box>
        );
    }

    if (error || !hrmData) {
        return (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 3, color: 'red' }}>
                {error || "No HRM data available"}
            </Typography>
        );
    }

    const data = hrmData;

    // Define approval steps in order
    const approvalSteps = [
        { key: 'HR', title: 'HOD Approval', border: 'border-blue-200', bg: 'bg-blue-50' },
        { key: 'DIRECTOR', title: 'Director Approval', border: 'border-purple-200', bg: 'bg-purple-50' },
        { key: 'EVC', title: 'EVC Approval', border: 'border-orange-200', bg: 'bg-orange-50' }
    ];

    // Determine the current step (first pending step)
    const getCurrentStep = () => {
        for (const step of approvalSteps) {
            const status = data[step.key.toLowerCase()];
            if (!status || status.toLowerCase() === 'pending') {
                return step.key;
            }
        }
        return null; // All approved
    };

    const currentStep = getCurrentStep();
    const isFullyApproved = data.hr === 'Approved' && data.director === 'Approved' && data.evc === 'Approved';
    const isRejected = data.hr === 'Reject' || data.director === 'Reject' || data.evc === 'Reject';

    const Field = ({ label, value }) => (
        <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.9 }}>
            <span style={{ fontWeight: 'bold' }}>{label}: </span>
            <span style={{ color: '#555' }}>{value || '-'}</span>
        </Typography>
    );

    const Row = ({ leftLabel, leftValue, rightLabel, rightValue }) => (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Field label={leftLabel} value={leftValue} />
            <Field label={rightLabel} value={rightValue} />
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Request Information Card */}
            <Box sx={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px', 
                p: 2.5, 
                backgroundColor: '#f8f9fa' 
            }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                    HRM Request Information
                </Typography>
                
                <Row 
                    leftLabel="Case ID" leftValue={data.child_caseid || ID}
                    rightLabel="Candidate Name" rightValue={data.name}
                />
                
                <Row 
                    leftLabel="Department" leftValue={data.DEPT}
                    rightLabel="Designation" rightValue={data.DESIG || data.MANPOWER_DESG }
                />
                
                <Row 
                    leftLabel="Plant" leftValue={data.PLANT}
          rightLabel="Email" rightValue={data.email}
                />
                
        
    
            </Box>

            {/* Approval Flow Card */}
            <Box sx={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px', 
                p: 2, 
                backgroundColor: '#f8f9fa' 
            }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                    Approval Flow
                </Typography>

                {approvalSteps.map((step, index) => {
                    const statusValue = data[step.key.toLowerCase()];
                    const isCurrentStep = currentStep === step.key;
                    const isApproved = statusValue?.toLowerCase() === 'approved';
                    const isRejectedStep = statusValue?.toLowerCase() === 'reject' || statusValue?.toLowerCase() === 'rejected';
                    const style = getStatusStyle(statusValue, isCurrentStep);

                    // Don't show future steps if a step is rejected
                    if (isRejectedStep && index > approvalSteps.findIndex(s => s.key === step.key)) {
                        return null;
                    }

                    return (
                        <Box key={step.key}>
                            <Box sx={{
                                border: `1px solid ${style.borderColor}`,
                                borderRadius: '6px',
                                p: 2,
                                mb: 2,
                                backgroundColor: style.backgroundColor,
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                ...(isCurrentStep && {
                                    boxShadow: '0 0 0 2px #f97316, 0 2px 8px rgba(0,0,0,0.1)',
                                })
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                            {step.title}
                                        </Typography>
                                     
                                        <Typography variant="body2" sx={{ 
                                            color: style.color, 
                                            fontWeight: 'bold' 
                                        }}>
                                            Status: {displayStatus(statusValue)}
                                        </Typography>
                                        {isCurrentStep && (
                                            <Typography variant="body2" sx={{ 
                                                color: '#ea580c', 
                                                fontSize: '11px',
                                                mt: 0.5,
                                                fontWeight: 'bold'
                                            }}>
                                                ⏳ Awaiting approval from {step.title}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{
                                        backgroundColor: style.badgeColor,
                                        color: 'white',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: '4px',
                                        minWidth: '100px',
                                        textAlign: 'center',
                                    }}>
                                        {style.badgeText}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Down Arrow between steps */}
                            {index < approvalSteps.length - 1 && 
                             !isRejectedStep && 
                             (!isFullyApproved || index < approvalSteps.length - 1) && (
                                <Typography sx={{ 
                                    fontSize: 20, 
                                    textAlign: 'center', 
                                    color: '#1976d2', 
                                    my: 0,
                                    opacity: isApproved ? 1 : 0.4
                                }}>
                                    ↓
                                </Typography>
                            )}
                        </Box>
                    );
                })}

                {/* Final Status */}
                {(isFullyApproved || isRejected) && (
                    <Box sx={{
                        border: `1px solid ${isRejected ? '#ffcdd2' : '#c8e6c9'}`,
                        borderRadius: '6px',
                        p: 2,
                        mt: 1,
                        backgroundColor: isRejected ? '#ffebee' : '#e8f5e9',
                        textAlign: 'center',
                    }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            Final Status
                        </Typography>
                        <Typography variant="body1" fontWeight="bold"
                            sx={{ color: isRejected ? '#d32f2f' : '#2e7d32', fontSize: '14px' }}>
                            {isRejected ? 'REJECTED' : 'FULLY APPROVED'}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default HRMView;