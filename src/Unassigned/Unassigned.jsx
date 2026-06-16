import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Paper } from '@mui/material';
import 'sweetalert2/dist/sweetalert2.min.css';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Doughnut } from 'react-chartjs-2';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaChartPie } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend, } from 'chart.js';
import { API_BASE_URL } from "../Config"
import useCombinedStats from '../hooks/useCombinedStats';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const Unassigned = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 });

  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});

  const { combinedStats, refetch: refetchCombinedStats } = useCombinedStats(userToken);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}getunassignedData`, {
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
        navigate(`/ScrapUnassign/${CASEID}`);
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
    { field: 'CASEID', headerName: 'CASE ID', flex: 1, minWidth: 120 },
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
    </>
  );
};

export default Unassigned;