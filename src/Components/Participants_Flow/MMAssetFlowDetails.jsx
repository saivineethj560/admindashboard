import React from 'react';
import { Box, Typography, CircularProgress, Grid } from '@mui/material';

const MMAssetFlowDetails = ({ flowLoading, flowData, formatDate, getStatusColor, isMaximized }) => {
    if (flowLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading Asset data...</Typography>
            </Box>
        );
    }

    if (!flowData || !flowData.data) {
        return <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>No data available</Typography>;
    }

    const data = flowData.data;

    // Helper to fix the visibility of TO_DO/Pending on Blue backgrounds
    const getSafeStatusColor = (status) => {
        const color = getStatusColor(status);
        if (color === "#facc15" || status?.toLowerCase() === 'to_do' || status?.toLowerCase() === 'pending') {
            return "#b45309"; // Darker Amber
        }
        return color;
    };

    // 1. Define all possible steps - IDs MUST match the current_task from your JSON
    const allPossibleSteps = [
        { id: 'PM', label: 'Project Manager', name: data.PM_NAME, status: data.PM_STATUS, date: data.PM_DT },
        { id: 'FI_CONSULTANT', label: 'Finance Consultant', name: data.FI_NAME, status: data.FI_STATUS, date: data.FI_DT },
    ];

    // 2. Filter steps: Show if processed (has name) OR if it matches current_task
    const activeSteps = allPossibleSteps.filter(step => {
        const hasBeenProcessed = step.name && step.name.trim() !== "";
        const isCurrentPending = data.current_task === step.id;
        return hasBeenProcessed || isCurrentPending;
    });

    // Helper to render the Asset details fields
    const renderAssetFields = () => (
        <Box sx={{ flex: 1.5, border: '1px solid #ddd', borderRadius: '4px', p: 1.5, backgroundColor: 'white' }}>
            <Typography variant="caption" fontWeight="bold" sx={{
                display: 'block',
                mb: 1,
                borderBottom: '1px solid #eee',
                color: '#6b1fb1',
                fontSize: isMaximized ? '13px' : undefined,   // ← ADD
            }}>
                ASSET INFORMATION
            </Typography>
            <Grid container spacing={1}>
                {data.details && Object.entries(data.details).map(([key, value]) => (
                    <Grid item xs={6} key={key}>
                        <Typography sx={{
                            fontSize: isMaximized ? '12px' : '9px',   // ← ADD
                            color: 'gray',
                            textTransform: 'uppercase',
                        }}>
                            {key}
                        </Typography>
                        <Typography sx={{
                            fontSize: isMaximized ? '14px' : '11px',   // ← ADD
                            fontWeight: 'bold',
                        }}>
                            {value || 'N/A'}
                        </Typography>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    const renderStepBox = (step) => {
        const { id, name, label, status, date } = step;

        const isCurrent = data.current_task === id;
        const displayName = name || (isCurrent ? data.current_user : "Pending");
        const displayStatus = status || (isCurrent ? "TO_DO" : "Pending");

        return (
            <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 1, backgroundColor: isCurrent ? '#fff3e0' : '#f3e5f5' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Left side: Approver Info */}
                    <Box sx={{ flex: 0.6, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
                        <Typography variant="body2" fontWeight="bold" sx={{
                            fontSize: isMaximized ? '15px' : '12px',   // ← ADD
                        }}>
                            {displayName}
                        </Typography>
                        <Typography variant="caption" sx={{
                            color: 'gray',
                            fontSize: isMaximized ? '13px' : undefined,   // ← ADD
                        }}>
                            {label}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{
                            color: getSafeStatusColor(displayStatus),
                            mt: 1,
                            fontSize: isMaximized ? '14px' : '11px',   // ← ADD
                        }}>
                            Step Status: {displayStatus}
                        </Typography>
                        {date && (
                            <Typography sx={{
                                fontSize: isMaximized ? '13px' : '10px',   // ← ADD
                                mt: 0.5,
                            }}>
                                Date: {date}
                            </Typography>
                        )}
                    </Box>

                    {/* Right side: Field Information */}
                    {renderAssetFields()}
                </Box>
            </Box>
        );
    };

    return (
        <Box sx={{ p: 1 }}>
            {/* Raiser Header (Blue Theme) */}
            <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 1, backgroundColor: '#e3f2fd', textAlign: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{
                    fontSize: isMaximized ? '17px' : undefined,   // ← ADD
                }}>
                    Asset Creation Request By: {data.name}
                </Typography>
                <Typography variant="caption" sx={{
                    fontSize: isMaximized ? '14px' : undefined,   // ← ADD
                }}>
                    Dept: {data.department} | Date: {data.raiser_date}
                </Typography>
            </Box>

            {/* Render Vertical Flow */}
            {activeSteps.map((step) => (
                <React.Fragment key={step.id}>
                    <Typography sx={{
                        textAlign: 'center',
                        color: '#1976d2',
                        my: 0.2,
                        fontSize: isMaximized ? '24px' : undefined,   // ← ADD
                    }}>
                        ↓
                    </Typography>
                    {renderStepBox(step)}
                </React.Fragment>
            ))}

            {/* Summary Footer (Blue Theme - Stationary Style) */}
            <Typography sx={{
                textAlign: 'center',
                color: '#1976d2',
                my: 0.2,
                fontSize: isMaximized ? '24px' : undefined,   // ← ADD
            }}>
                ↓
            </Typography>
            <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1.5, backgroundColor: '#c6ddf1', textAlign: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{
                    fontSize: isMaximized ? '17px' : '13px',   // ← ADD
                }}>
                    Current User: {data.current_user} {data.current_task ? `- ${data.current_task}` : ""}
                </Typography>
                <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{
                        mt: 0.5,
                        color: getSafeStatusColor(data.current_status || "TO_DO"),
                        fontSize: isMaximized ? '17px' : '13px',   // ← ADD
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

export default MMAssetFlowDetails;