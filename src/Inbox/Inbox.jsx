import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Paper } from '@mui/material';
import 'sweetalert2/dist/sweetalert2.min.css';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Doughnut } from 'react-chartjs-2';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaChartPie } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend, } from 'chart.js';
import { API_BASE_URL, API_HRM_PROCESS } from "../Config"
import useCombinedStats from '../hooks/useCombinedStats';
import {  Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Chip
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const Inbox = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 });

  // below states by ajith on 15042026
  const [historyOpen, setHistoryOpen] = useState(false);
const [historyData, setHistoryData] = useState([]);

  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});

  const { combinedStats, refetch: refetchCombinedStats } = useCombinedStats(userToken);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}getData`, {
        headers: {
          "Content-Type": "application/json",
          Accept: 'application/json',
          Authorization: `Bearer ${userToken.token}`
        }
      });
      const responseData = response.data.allAprvls || [];
      console.log(responseData);
      setData(responseData);
      refetchCombinedStats();
    } catch (error) {
      console.error("Error fetching data. Using mock:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchData();
    }, 1000);
  }, []);

  useEffect(() => {
    if (location.state?.refresh) fetchData();
  }, [location]);

  useEffect(() => {
    if (!userToken.token) navigate('/');
  }, [navigate, userToken?.token]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };
// handleHistory by ajith on 15042026
  const handleHistory = async (caseid) => {
  try {
    const response = await fetch(
      `${API_HRM_PROCESS}/mrfRevisionHstry/${caseid}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("HRM API DATA:", result);

    setHistoryData(result.mrfRvsnData);
      setHistoryOpen(true);

  } catch (err) {
    console.error("Fetch Error:", err);
   

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to fetch HRM data'
    });
  } 
};


//Stationary
  const handleButtonClick = (row) => {
    console.log("Button Clicked Row Data:", row);
    const { CASEID, PROCESSNAME, CUR_STATUS, CUR_TASK } = row;
    try {
      if (PROCESSNAME === 'Stationary') {
        navigate(`/StationaryApprover/${CASEID}`);
      } 
      else if (PROCESSNAME === 'Indent') {
        // navigate(`/IndentApproval/${case_id}`);
         if (CUR_STATUS === "TO_DO") {
        if (CUR_TASK !== "PR_USR") {
          navigate(`/ApprovalForm/${CASEID}`);
        } else {
          console.log(CUR_TASK);
          console.log(CUR_STATUS);
          navigate(`/PRForm/${CASEID}`);
        }
      } 
      else if (CUR_STATUS === "REVERT") {
        navigate(`/RevertForm/${CASEID}`);
      } 
      else if (CUR_STATUS === "DRAFT") {
        navigate(`/DraftForm/${CASEID}`);
      } 
      else {
        // Default fallback for Indent
        navigate(`/IndentApproval/${CASEID}`);
      }
      } 
      else if (PROCESSNAME === 'Scrap Sale Request') {
        navigate(`/ScrapApproval/${CASEID}`);
      } 
      else if (PROCESSNAME === 'MM Asset Creation') {
        navigate(`/MMAssetApproval/${CASEID}`);
      } 
      else if (PROCESSNAME === 'Stock Transfer Request') {
        navigate(`/StockApproval/${CASEID}`);
      } 
      else if (PROCESSNAME === 'Service Code Request') {
        navigate(`/serviceCodeApproval/${CASEID}`);
      } 
      else if (PROCESSNAME === 'Material Master Request' || PROCESSNAME === 'Material Master Extension') {
        navigate(`/matmasterApproval/${CASEID}`);
      } 
      else if (PROCESSNAME === 'Manpower') {
        navigate(`/manapp/${CASEID}`);
      } 
      
      else if (PROCESSNAME === "HRM PROCESS") {
         navigate(`/hrmapprovals/${CASEID}`);
      }
      
      
      
    } catch (err) {
      console.error("Error In The Getting the Data")
    }
  }

  const filteredData = useMemo(() => {
    if (!searchText) return data;

    return data.filter(row => {
      const search = searchText.toLowerCase();
      return Object.entries(row).some(([key, value]) => {
        return typeof value === 'string' && value.toLowerCase().includes(search);
      });
    });
  }, [data, searchText]);

  const handleApprove = async (case_id) => {
    Swal.fire("Approved!", `Case ID ${case_id} approved ✅`, "success");
    fetchData();
  };

  const handleReject = async (case_id) => {
    Swal.fire("Rejected!", `Case ID ${case_id} rejected ❌`, "error");
    fetchData();
  };

  const statusCounts = combinedStats;

  const donutData = {
    labels: ['completed', 'pending', 'rejected'],
    datasets: [
      {
        data: [statusCounts.completed, statusCounts.pending, statusCounts.rejected],
        backgroundColor: ['#67AE6E', '#F5C45E', '#ef4444'],
        hoverBackgroundColor: ['#328E6E', '#E78B48', '#dc2626'],
      },
    ],
  };

  const donutOptions = {
    plugins: {
      legend: {
        labels: {
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        titleFont: { size: 10 },
        bodyFont: { size: 10 },
      },
      datalabels: {
        color: 'white',
        font: {
          size: 12,
          weight: 'bold',
        },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}: ${value}`;
        },
      },
    },
    maintainAspectRatio: false,
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const columns = [
    {
      field: 'SNO',
      headerName: 'S.NO',
      flex: 0.5,
      minWidth: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const index = params.api.getRowIndexRelativeToVisibleRows(params.id);
        const pageSize = paginationModel.pageSize;
        const page = paginationModel.page;
        const serialNumber = page * pageSize + index + 1;
        return serialNumber;
      }
    },
    {
      field: 'btn',
      headerName: 'BUTTON',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        // const { CASEID, PROCESSNAME } = params.row;
        const handleClick = () => handleButtonClick(params.row);
        return (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: '100%',
            width: '100%',
          }}>
            <Box sx={{
              borderRadius: '5px',
              backgroundColor: '#007bff',
              color: 'white',
              fontWeight: 'bold',
              width: '80px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: '#0056b3',
              },
              '&:focus': {
                outline: 'none',
              }
            }} onClick={handleClick}>
              Open
            </Box>
          </Box>
        );
      }
    },

  // added history col by ajith on 15042026  
{
  field: 'His',
  headerName: 'History',
  flex: 1,
  minWidth: 120,
  renderCell: (params) => {
    const caseid = params.row.CASEID;
    const processName = params.row.PROCESSNAME;
    const revisionId = params.row.REVISION_ID;

    // show only for HRM PROCESS and revision not 00
 if (
  processName !== 'HRM PROCESS' ||
  !revisionId ||
  revisionId === '00'
) {
  return null;
}

    return (
      <Button
        variant="contained"
        size="small"
        onClick={() => handleHistory(caseid)}
        sx={{
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '6px',
          fontSize: '11px',
          padding: '2px 8px',
          minWidth: 'auto',
          backgroundColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#115293',
          },
        }}
      >
        History
      </Button>
    );
  }
},

    // { field: 'CASEID', headerName: 'CASE ID', flex: 1, minWidth: 120 },
    //by ajith on 15042026
    {
  field: 'CASEID',
  headerName: 'CASE ID',
  flex: 1,
  minWidth: 160,
  renderCell: (params) => {
    const processName = params.row?.PROCESSNAME?.toLowerCase();
    const caseId = params.row?.CASEID || '';
    const revId = params.row?.REVISION_ID;

    // only HRM process gets special formatting
    if (processName === 'hrm process') {
      if (!revId || revId === '00') {
        return caseId;
      }
      return `${caseId}_${revId}`;
    }

    // all other processes untouched
    return caseId;
  }
},
    { field: 'PROCESSNAME', headerName: 'PROCESS', flex: 1, minWidth: 120 },
    {
      field: 'raiser',
      headerName: 'RAISER',
      flex: 1.2,
      minWidth: 140,
      renderCell: (params) => {
        return params.row.raiser || params.row.RAISER || '';
      }
    },
    {
      field: 'raiser_date',
      headerName: 'RAISER DATE',
      flex: 1.2,
      minWidth: 140,
      renderCell: (params) => {
        const date = params.row.raiser_date || params.row.RAISER_DATE;
        return formatDate(date);
      }
    },
    {
      field: 'received_date',
      headerName: 'RECEIVED DATE',
      flex: 1.2,
      minWidth: 140,
      renderCell: (params) => {
        const date = params.row.received_date || params.row.LAST_MODIFIED;
        return formatDate(date);
      }
    },
    { field: 'CUR_USR', headerName: 'CUR USER', flex: 1.2, minWidth: 140 },
    { field: 'PREV_USR', headerName: 'PREV USER', flex: 1, minWidth: 120 },
  ];

  // by ajith on 15042026
  const isHrmProcess = filteredData.some(
  (row) =>
    row.PROCESSNAME === 'HRM PROCESS' &&
    row.REVISION_ID &&
    row.REVISION_ID !== '00'
);

  return (
    <>
      {/* Dashboard tiles section - 4 tiles first, then doughnut chart */}
      <div
        style={{
          height: '180px',
          width: '100%',
          backgroundColor: 'white',
          borderBottom: '10px solid #ddd',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          boxSizing: 'border-box',
          gap: '20px',
          border: '1px solid gray',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        {/* Total Tile */}
        <div
          className="tile"
          style={{
            flex: '1 1 18%',
            minWidth: '140px',
            height: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
            padding: '10px',
            boxSizing: 'border-box',
            color: 'white',
            border: '1px solid #ccc',
            borderRadius: '12px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            backgroundColor: '#87CEEB',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            justifyContent: 'flex-start',
            marginTop: '10px'
          }}>
            <FaChartPie size={30} />
            <div>
              <span style={{ fontWeight: 'bold' }}>Total</span>
              <div style={{
                backgroundColor: 'white',
                color: 'black',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px',
                marginTop: '4px',
                width: '40px'
              }}>
                {statusCounts.total}
              </div>
            </div>
          </div>
        </div>

        {/* Completed Tile */}
        <div
          className="tile"
          style={{
            flex: '1 1 18%',
            minWidth: '140px',
            height: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
            padding: '10px',
            boxSizing: 'border-box',
            color: 'white',
            border: '1px solid #ccc',
            borderRadius: '12px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            backgroundColor: '#22c55e',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            justifyContent: 'flex-start',
            marginTop: '10px'
          }}>
            <FaCheckCircle size={30} />
            <div>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Completed</span>
              <div style={{
                backgroundColor: 'white',
                color: 'black',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                marginTop: '4px',
                width: '40px'
              }}>
                {statusCounts.completed}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Tile */}
        <div
          className="tile"
          style={{
            flex: '1 1 18%',
            minWidth: '140px',
            height: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
            padding: '10px',
            boxSizing: 'border-box',
            color: 'black',
            border: '1px solid #ccc',
            borderRadius: '12px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            backgroundColor: '#facc15',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            justifyContent: 'flex-start',
            color: 'white',
            marginTop: '10px'
          }}>
            <FaExclamationCircle size={30} />
            <div>
              <span style={{ fontWeight: 'bold' }}>Pending</span>
              <div style={{
                backgroundColor: 'white',
                color: 'black',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px',
                marginTop: '4px',
                width: '40px'
              }}>
                {statusCounts.pending}
              </div>
            </div>
          </div>
        </div>

        {/* Rejected Tile */}
        <div
          className="tile"
          style={{
            flex: '1 1 18%',
            minWidth: '140px',
            height: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
            padding: '10px',
            boxSizing: 'border-box',
            color: 'white',
            border: '1px solid #ccc',
            borderRadius: '12px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            backgroundColor: '#ef4444',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            justifyContent: 'flex-start',
            marginTop: '10px'
          }}>
            <FaTimesCircle size={30} />
            <div>
              <span style={{ fontWeight: 'bold' }}>Rejected</span>
              <div style={{
                backgroundColor: 'white',
                color: 'black',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px',
                marginTop: '4px',
                width: '40px'
              }}>
                {statusCounts.rejected}
              </div>
            </div>
          </div>
        </div>

        {/* Doughnut Chart - Last */}
        <div
          className="tile"
          style={{
            flex: '1 1 18%',
            minWidth: '140px',
            height: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
            padding: '10px',
            boxSizing: 'border-box',
            color: 'white',
            border: '1px solid #ccc',
            borderRadius: '12px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            backgroundColor: '#ffffff',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Doughnut data={donutData} options={donutOptions} />
        </div>
      </div>

      {/* DataGrid section with improved styling */}
      <Paper sx={{
        width: '100%',
        padding: 2,
        border: '1px solid gray',
        borderRadius: '8px',
      }}>
        {/* Title and Search bar */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          {/* Search Box */}
          <Box sx={{ flex: 1, maxWidth: '400px' }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearch}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#8e7ad5' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Center Title */}
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '2px',
              }}
            >
              INBOX
            </span>
          </Box>

          {/* Dummy spacer for symmetry */}
          <Box sx={{ flex: 1, maxWidth: '400px' }} />
        </Box>

        <Box sx={{
          width: '100%',
          height: '100%',
          borderRadius: '10px',
        }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row.SNO}
            loading={loading}
            // added bu ajith on 15042026
            columnVisibilityModel={{
              His: isHrmProcess,
            }}

            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : ''
            }
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 20]}
            autoHeight={false}
            rowHeight={30}
            columnHeaderHeight={30}
            sx={{
              width: '100%',
              height: '80%',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#CDC1FF',
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: '#CDC1FF',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
                color: '#000',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f0f9ff',
              },
              '& .even-row': {
                backgroundColor: '#F2F2F2',
              },
              fontSize: '13px',
              color: 'black',
            }}
          />
        </Box>
      </Paper>

              {/* added Dialog by ajith on 15042026 */}
            <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          }
        }}
      >
        {/* HEADER */}
        <DialogTitle sx={{ m: 0, p: 0 }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #273a66 0%, #1e3a8a 60%, #2563eb 100%)',
            px: 2.5, py: 1.6,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
              <Box
                sx={{
                  width: 46,
                  height: 36,
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.13)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Trash2 size={18} color="white" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '14.5px', color: '#fff', lineHeight: 1.2 }}>
                History
                </Typography>
                <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>
                  {historyData.length} record{historyData.length !== 1 ? 's' : ''} found
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setHistoryOpen(false)} size="small" sx={{
              color: '#fff', bgcolor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
              width: 28, height: 28,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
            }}>
              <CloseIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* BODY */}
        <DialogContent sx={{
          p: 0, bgcolor: '#f1f5f9',
          '&::-webkit-scrollbar': { width: '5px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: '6px' },
        }}>
          {historyData.length === 0 ? (
            <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 58, height: 58, borderRadius: '14px',
                background: '#e2e8f0', border: '2px dashed #cbd5e1',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
              }}>📭</Box>
              <Typography sx={{ fontWeight: 700, fontSize: '13.5px', color: '#475569' }}>No Records Found</Typography>
              <Typography sx={{ fontSize: '11.5px', color: '#94a3b8', textAlign: 'center', maxWidth: 220 }}>
                No deleted history records to display.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {historyData.map((item, index) => (
                <Box key={index} sx={{
                  borderRadius: '10px', overflow: 'hidden',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                  animation: `fadeUp 0.22s ease ${index * 0.05}s both`,
                  '@keyframes fadeUp': {
                    from: { opacity: 0, transform: 'translateY(7px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}>

                  {/* Card top strip */}
                  <Box sx={{
                    px: 1.8, py: 0.8,
                    background: '#f8fafc',
                    borderBottom: '1px solid #e9eef5',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                        Record #{index + 1}
                      </Typography>
                      <Box sx={{ width: '1px', height: 12, bgcolor: '#cbd5e1' }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.6 }}>
                      {/* {added by ajith 15042026} */}
                      {[
                        { label: `Rev: ${item.REVISION_ID}`, label: `Previous Rev: ${item.REVISION_ID}`, bg: '#f5f3ff', border: '#ddd6fe', color: '#6d28d9' },
                      ].map(({ label, bg, border, color }) => (
                        <Chip key={label} label={label} size="small" sx={{
                          height: '19px', fontSize: '10px', fontWeight: 600,
                          bgcolor: bg, border: `1px solid ${border}`, color,
                          borderRadius: '4px', '& .MuiChip-label': { px: 0.8 },
                        }} />
                      ))}
                    </Box>
                  </Box>

                  {/* 5-col field grid */}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 0,
                    px: 0,
                  }}>
                    {
                    
              [
  { emoji: '🆔', label: 'Case ID', value: item.CASEID },
  { emoji: '👤', label: 'Raiser', value: item.RAISER },
  { emoji: '🔁', label: 'Revision ID', value: item.REVISION_ID },
  { emoji: '👨‍💼', label: '1st Approval', value: item.firstAprvl },
  { emoji: '👩‍💼', label: '2nd Approval', value: item.secondAprvl },
  { emoji: '👩‍💻', label: '3rd Approval', value: item.thridAprvl },
  {
    emoji: '📅',
    label: 'Created At',
    value: item.created_at
      ? new Date(item.created_at).toLocaleDateString('en-GB')
      : ''
  },
  {
    emoji: '⏱️',
    label: 'Updated At',
    value: item.updated_at
      ? new Date(item.updated_at).toLocaleDateString('en-GB')
      : ''
  }
]
                    
                    
                    .map(({ emoji, label, value }, i) => (
                      <Box key={label} sx={{
                        px: 1.4, py: 1.1,
                        borderRight: i % 5 !== 4 ? '1px solid #f1f5f9' : 'none',
                        borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.15s',
                        '&:hover': { bgcolor: '#f8fafc' },
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 0.4 }}>
                          <Typography sx={{ fontSize: '12px', lineHeight: 1 }}>{emoji}</Typography>
                          <Typography sx={{
                            fontSize: '9.5px', fontWeight: 700, color: '#94a3b8',
                            textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1,

                            
                          }}>{label}</Typography>
                        </Box>
                        <Typography sx={{
                          fontSize: '12px', fontWeight: 500, color: '#1e293b',
                          lineHeight: 1.35, wordBreak: 'break-word',
                          pl: '19px',
                        }}>
                          {value
                            ? value
                            : <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: '11px' }}>—</span>
                          }
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        {/* FOOTER */}
   <DialogActions
  sx={{
    px: 2,
    py: 1.2,
    bgcolor: '#fff',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}
>
  <Typography sx={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
    {historyData.length > 0
      ? `Showing ${historyData.length} record(s)`
      : 'Nothing to display'}
  </Typography>

  <Button
    onClick={() => setHistoryOpen(false)}
    variant="contained"
    startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
    sx={{
      minWidth: 95,
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'none',
      background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
      boxShadow: '0 3px 10px rgba(15,23,42,0.22)',
      px: 2,
      py: 0.75,
      '&:hover': {
        background: 'linear-gradient(135deg, #1e293b, #2563eb)',
        transform: 'translateY(-1px)',
        boxShadow: '0 5px 14px rgba(15,23,42,0.3)',
      },
    }}
  >
    Close
  </Button>
</DialogActions>
      </Dialog>
      
    </>
  );
};

export default Inbox;