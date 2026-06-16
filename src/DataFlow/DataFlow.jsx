
import { Box, Typography, Paper, Chip, CircularProgress, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from "../Config";

const getStatusColor = (status) => 
{
  switch ((status||'').toUpperCase()) 
  {
    case 'APPROVE':
    case 'APPROVED':
      return 'success';
    case 'TO_DO':
    case 'PENDING':
      return 'info';
    case 'REJECT':
    case 'REJECTED':
      return 'error';
    case 'COMPLETED':
      return 'primary';
    default:
      return 'default';
  }
};

const ManPowerFlow = ({ processname, caseId, mode }) => {
  const [approvalFlow, setFlowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userToken] = useState(() =>
    JSON.parse(localStorage.getItem('userInfo')) || {}
  );


  const fetchFlowData = async () => {


    try {
      const response = await axios.get(
        // `${API_URL}/stationary/${caseId}/${processname}`,
        //  `http://127.0.0.1:8000/api/stationary/${caseId}/${processname}`,
         `${MRF_API_URL}/stationary/${caseId}/${processname}`,
        {
          headers: 
          {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${userToken.token}`,
          },
        }
      );
      setFlowData(response.data.data);
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch case flow data',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFlowData();
  }, []);

  const renderStepCard = (label,name, status, date) => {
    if (!status) return null;
    return (
      <Paper
        elevation={2}
        sx={{
          p: 1.5,
          bgcolor: '#f0f7ff',
          borderLeft: '4px solid #1976d2',
          textAlign: 'center',
          fontFamily: 'Roboto, sans-serif',
          mb: 2,
        }}
      >
        <Typography fontWeight="bold" fontSize={14} sx={{ mb: 0.5 }}>
          {name || '—'} - {label}
        </Typography>
        <Typography fontSize={13} sx={{ mb: 0.5 }}>
          Status:{' '}
          <Chip size="small" label={status} color={getStatusColor(status)}/>
        </Typography>
        {date && (
          <Typography fontSize={12}>
            Date: {new Date(date).toLocaleDateString()}
          </Typography>
        )}
      </Paper>
    );
  };
  const renderCommentsCard = (comments, extraRem) => {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 1.5,
          bgcolor: '#fff3e0',
          borderLeft: '4px solid #ff9800',
          fontFamily: 'Roboto, sans-serif',
          mb: 2,
        }}
      >
        {comments && (
          <Typography
            fontSize={12}
            sx={{ mt: 0.5, fontStyle: 'italic', color: '#424242' }}
          >
            Comments: {comments}
          </Typography>
        )}
        {extraRem && (
          <Typography
            fontSize={12}
            sx={{ mt: 0.5, fontStyle: 'italic', color: '#8d6e63' }}
          >
            Remarks: {extraRem}
          </Typography>
        )}
        {!comments && !extraRem && (
          <Typography fontSize={12} sx={{ color: '#9e9e9e', fontStyle: 'italic' }}>
            No comments/remarks
          </Typography>
        )}
      </Paper>
    );
  };

  const renderStep = (label, name, status, date, comments, extraRem) => 
  {
    if (!status) return null;
    return (
      <>
        <Typography
          sx={{ textAlign: 'center', color: '#1976d2', fontSize: 22, my: 1 }}
        >
          ↓
        </Typography>
        {mode === 'view' ? (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              {renderStepCard(label, name, status, date)}
            </Grid>
            <Grid item xs={6}>
              {renderCommentsCard(comments,extraRem)}
            </Grid>
          </Grid>
        ) : (
          <Paper
            elevation={2}
            sx = {{
              p: 1.5,
              bgcolor: '#e3f2fd',
              borderLeft: '4px solid #1976d2',
              textAlign: 'center',
              fontFamily: 'Roboto, sans-serif',
              mb: 2,
            }}>
            <Typography fontWeight="bold" fontSize={14} sx={{ mb: 0.5 }}>
              {name || '—'} - {label}
            </Typography>
            <Typography fontSize={13} sx={{mb:0.5}}>
              Status:{' '}
              <Chip size="small" label={status} color={getStatusColor(status)} />
            </Typography>
            {date && (
              <Typography fontSize={12}>
                Date: {new Date(date).toLocaleDateString()}
              </Typography>
            )}
            {comments && (
              <Typography
                fontSize={12}
                sx={{ mt: 1, fontStyle: 'italic', color: '#424242' }}>
                Comments: {comments}
              </Typography>
            )}
            {mode === 'view' && extraRem && (
              <Typography
                fontSize={12}
                sx = {{ mt: 1, fontStyle: 'italic', color: '#8d6e63' }}>
                Remarks: {extraRem}
              </Typography>
            )}
          </Paper>
        )}
      </>
    );
  };
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ px: 2, fontFamily: 'Roboto, sans-serif' }}>
      {/* Raiser */}
      {mode === 'view' ? (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            {renderStepCard(
              ` ${approvalFlow?.RAISER || '—'} - ${
                approvalFlow?.role ?? ''
              }`,
              '',
              approvalFlow?.CUR_STATUS,
              approvalFlow?.RAISER_DATE
            )}
          </Grid>
          <Grid item xs={6}>
            {renderCommentsCard(approvalFlow?.REMARKS, null)}
          </Grid>
        </Grid>
      ) : (
        <Paper
          elevation={2}
          sx={{
            p: 1,
            bgcolor: '#e3f2fd',
            borderLeft: '4px solid #1976d2',
            textAlign: 'center',
            fontFamily: 'Roboto, sans-serif',
            mb: 2,
          }}>
          <Typography fontWeight="bold" fontSize={14} sx={{ mb: 0.5 }}>
          Raised By: {approvalFlow.RAISER || '—'} -{' '}
            {approvalFlow.role ?? ''}
          </Typography>
          {approvalFlow.CUR_STATUS && (
            <Typography fontSize={13} sx={{ mb: 0.5 }}>
              Status:{' '}
              <Chip
                size="small"
                label={approvalFlow.CUR_STATUS}
                color={getStatusColor(approvalFlow.CUR_STATUS)}
              />
            </Typography>
          )}
          {approvalFlow.RAISER_DATE && (
            <Typography fontSize={12}>
              Date: {new Date(approvalFlow.RAISER_DATE).toLocaleDateString()}
            </Typography>
          )}
          {approvalFlow.RAISER_COMMENTS && (
            <Typography
              fontSize={12}
              sx={{mt:1,fontStyle: 'italic',color: '#424242' }}>
              Comments: {approvalFlow?.RAISER_COMMENTS}
            </Typography>
          )}
        </Paper>
      )}
      {/* Steps */}
      {approvalFlow?.CUR_TASK && (
        <>
          <Typography
            sx={{ textAlign: 'center', color: '#d32f2f', fontSize: 20, my: 2 }}
          >
            ⏩ Next Pending Step
          </Typography>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              bgcolor: '#fffde7',
              borderLeft: '4px solid #f57c00',
              textAlign: 'center',
              fontFamily: 'Roboto, sans-serif',
              mb: 2,
            }}
          >
            <Typography fontWeight="bold" fontSize={15} sx={{ mb: 0.5 }}>
              Current Task: {approvalFlow?.CUR_TASK}
            </Typography>
            {approvalFlow?.CUR_STATUS && (
              <Typography fontSize={13}>
                Status:{" "}
                <Chip
                  size="small"
                  label={approvalFlow?.CUR_STATUS}
                  color={getStatusColor(approvalFlow?.CUR_STATUS)}
                />
              </Typography>
            )}
          </Paper>
        </>
      )}






      {approvalFlow?.HO_HOD_STATUS ? (
        <>
          {renderStep (
            'HOD',
            approvalFlow?.HO_HOD_NAME ?? 'HOD',
            approvalFlow?.HO_HOD_STATUS,
            approvalFlow?.HO_HOD_DATE,
            approvalFlow?.HO_HOD_REM
          )}
          {renderStep (
            'EVC',
            approvalFlow?.EVC_NAME ?? 'EVC',
            approvalFlow?.EVC_STATUS,
            approvalFlow?.EVC_DATE,
            approvalFlow?.EVC_COMMENTS,
            approvalFlow?.EVC_REM
          )}
        </>
      ) : (
        <>
          {renderStep(
            'GM',
            approvalFlow?.GM_NAME ?? 'GM',
            approvalFlow?.GM_STATUS,
            approvalFlow?.GM_DATE,
            approvalFlow?.GM_COMMENTS,
            approvalFlow?.GM_REM
          )}
          {renderStep(
            'PRJ',
            approvalFlow?.PRJ_NAME ?? 'PRJ',
            approvalFlow?.PRJ_STATUS,
            approvalFlow?.PRJ_DATE,
            approvalFlow?.PRJ_COMMENTS,
            approvalFlow?.PRJ_REM
          )}

          {approvalFlow?.FUNC_STATUS ? (
            <>
              {renderStep(
                'FUNCT_HEAD',
                approvalFlow?.FUNC_NAME ?? 'FUNC_HEAD',
                approvalFlow?.FUNC_STATUS,
                approvalFlow?.FUNC_DATE,
                approvalFlow?.FUNC_COMMENTS,
                approvalFlow?.FUNC_REM
              )}
              {renderStep(
                'SP',
                approvalFlow?.SP_NAME ?? 'SP',
                approvalFlow?.SP_STATUS,
                approvalFlow?.SP_DATE,
                approvalFlow?.SP_COMMENTS,
                approvalFlow?.SP_REM
              )}
              {renderStep(
                'EVC',
                approvalFlow?.EVC_NAME ?? 'EVC',
                approvalFlow?.EVC_STATUS,
                approvalFlow?.EVC_DATE,
                approvalFlow?.EVC_COMMENTS,
                approvalFlow?.EVC_REM
              )}
            </>
          ) : (
            <>
              {renderStep(
                'SP',
                approvalFlow?.SP_NAME ?? 'SP',
                approvalFlow?.SP_STATUS,
                approvalFlow?.SP_DATE,
                approvalFlow?.SP_COMMENTS,
                approvalFlow?.SP_REM
              )}
              {renderStep(
                'EVC',
                approvalFlow?.EVC_NAME ?? 'EVC',
                approvalFlow?.EVC_STATUS,
                approvalFlow?.EVC_DATE,
                approvalFlow?.EVC_COMMENTS,
                approvalFlow?.EVC_REM
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default ManPowerFlow;
