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
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaChartPie } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend, } from 'chart.js';
import { API_BASE_URL } from "../Config";


ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const ManPowerUploadList = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 });
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  // Keep backend connection from first code
  const fetchData = async () => 
  {
    setLoading(true);
    try 
    {
      const response = await axios.get(`${API_BASE_URL}getData`, {
        headers: 
        {
          "Content-Type": "application/json",
          Accept: 'application/json',
          Authorization: `Bearer ${userToken.token}`
        }
      });
      const responseData = response.data.allAprvls || [];
    
      setData(responseData);
    } 
    catch (error) 
    {
      console.error("Error fetching data. Using mock:", error);
    } 
    finally 
    {
      setLoading(false);
    }
  };

  useEffect(() => 
  {
    setTimeout(() => 
    {
      fetchData();
    }, 1000);
  }, []);

  useEffect(() => 
  {
    if (location.state?.refresh) fetchData();
  }, [location]);

  useEffect(() => {
    if (!userToken.token) navigate('/');
  }, [navigate, userToken?.token]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

const handleButtonClick = (case_id,processname) => {
    try 
    {
      if(processname=='Manpower')
      {
        navigate(`/manapp/${case_id}`);
      }
      else if(processname=='Stationary')
      {
        navigate(`/StationaryApprover/${case_id}`);
      }
    }
     catch (err) 
     {
        console.error("Error In The Getting the Data")
     }
  }

  // Filter data based on search text - using implementation from Participant.js
  const filteredData = useMemo(() => 
    {
    if (!searchText) return data;
    return data.filter(row => {
      // Convert search text to lowercase for case-insensitive search
      const search = searchText.toLowerCase();
      // Search across all fields in the row
      return Object.entries(row).some(([key, value]) => {
        // Only check string values
        return typeof value === 'string' && value.toLowerCase().includes(search);
      });
    });
  }, [data, searchText]);


  // Calculate status counts for charts - Updated to use total count for pending
  const statusCounts = useMemo(() => 
  {
    const counts = 
    {
      total: data.length,
      completed: 0,
      pending: data.length, // Use total count for pending
      rejected: 0,
    };

    data.forEach(item => {
      const status = item.Status?.toLowerCase();
      if (status === 'completed') counts.completed += 1;
      else if (status === 'rejected') counts.rejected += 1;
    });

    return counts;
  }, [data]);

  const donutData = {
    labels: ['completed', 'pending'],
    datasets: [
      {
        data: [statusCounts.completed, statusCounts.pending],
        backgroundColor: ['#67AE6E', '#F5C45E'],
        hoverBackgroundColor: ['#328E6E', '#E78B48'],
      },
    ],
  };

  const donutOptions = {
    plugins: {
      legend: {
        labels: {
          font: {
            size: 10, // Adjust the font size for legend labels
          },
        },
      },
      tooltip: {
        titleFont:{ size: 10 },
        bodyFont: { size: 10 },
      },
      // Modify the labels inside the donut chart
      datalabels: 
      {
        color: 'white', // You can set this to the color you want
        font: {
          size: 12,  // Reduced font size inside the donut
          weight: 'bold',
        },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}: ${value}`; // Show count with label
        },
      },
    },
    maintainAspectRatio: false, // optional for tighter fit
  };
  const stackedBarData = [
    { name: 'Data', completed: statusCounts.completed, pending: statusCounts.pending },
  ];
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) 
    {
      return dateString;
    }
  };
  // DataGrid columns with added Raiser and Raiser Date columns
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
      const { CASEID, PROCESSNAME } = params.row;
      const handleClick = () => handleButtonClick(CASEID, PROCESSNAME);
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
            '&:focus': 
            {
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
    field: 'RAISER',
    headerName: 'RAISER',
    flex: 1.2,
    minWidth: 140,
    renderCell: (params) => 
    {
      return  params.row.RAISER || '';
    }
  },
  {
    field: 'RAISER_DATE',
    headerName: 'RAISER DATE',
    flex: 1.2,
    minWidth: 140,
    renderCell: (params) => 
    {
      const date = params.row.RAISER_DATE;
      return formatDate(date);
    }
  },
  {
    field: 'RECEIVED_DATE',
    headerName: 'RECEIVED DATE',
    flex: 1.2,
    minWidth: 140,
    renderCell: (params) => 
    {
      const date =  params.row.RECEIVED_DATE;
      return formatDate(date);
    }
  },
  { field: 'CUR_USR', headerName: 'CUR USER', flex: 1.2, minWidth: 140 },
  { field: 'PREV_USR', headerName: 'PREV USER', flex: 1, minWidth: 120 },
];
  return (
    <>
      {/* Dashboard tiles section */}
      <div
        style={{
          height: '180px',
          width: '100%',
          backgroundColor: 'white',
          borderBottom: '10px solid #ddd',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '0 16px',
          boxSizing: 'border-box',
          gap: '10px',
          border: '1px solid gray',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        {[...Array(7)].map((_, index) => {
          const tileStyle = {
            flex: '1 1 11.28%',
            minWidth: '100px',
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
            backgroundColor: '#ffffff', // default white
            ...(index === 3 && { backgroundColor: '#87CEEB' }), // Total - sky blue
            ...(index === 4 && { backgroundColor: '#22c55e' }), // Completed - green
            ...(index === 5 && { backgroundColor: '#facc15', color: 'black' }), // Pending - yellow
            ...(index === 6 && { backgroundColor: '#ef4444' }), // Rejected - red
          };
          return (
            <div
              key={index}
              className="tile"
              style={tileStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {index === 0 ? (
                <Doughnut data={donutData} options={donutOptions} />
              ) : index === 1 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    width: '100%',
                  }}
                >
                  <div style={{ backgroundColor: '#C68EFD', padding: '8px', border: '1px solid #ccc', color: '#000', fontSize: '10px', fontWeight: 'bold' }}>
                    TOTAL:{statusCounts.total}
                  </div>
                  <div style={{ backgroundColor: '#A0C878', padding: '8px', border: '1px solid #ccc', color: '#000', fontSize: '10px', fontWeight: 'bold' }}>
                    COMPLETED:{statusCounts.completed}
                  </div>
                  <div style={{ backgroundColor: '#FFF085', padding: '8px', border: '1px solid #ccc', color: '#000', fontSize: '10px', fontWeight: 'bold' }}>
                    PENDING:{statusCounts.pending}
                  </div>
                </div>
              ) : index === 2 ? (
                <BarChart width={50} height={150} data={stackedBarData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="completed" stackId="a" fill="#22c55e" />
                  <Bar dataKey="pending" stackId="a" fill="#facc15" />
                </BarChart>
              ) : index === 3 ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  justifyContent: 'flex-start',
                  marginTop: '10px'
                }}>
                  <FaChartPie size={30}/>
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
              ) : index === 4 ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  justifyContent: 'flex-start',
                  marginTop: '10px'
                }}>
                  <FaCheckCircle size={30}/>
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
              ) : index === 5 ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  justifyContent: 'flex-start',
                  color: 'white',
                  marginTop: '10px'
                }}>
                  <FaExclamationCircle size={30}/>
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
              ) : index === 6 ? (
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
              ) : null}
            </div>
          );
        })}
      </div>

      {/* DataGrid section with improved styling */}
      <Paper sx={{
        width: '100%',
        padding: 2,
        border: '1px solid gray',
        borderRadius: '8px',
      }}>
        {/* Search bar */}
        <Box sx={{ mb: 2, width: '70%' }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8e7ad5' }} />
                </InputAdornment>
              ),
            }}
          />
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

export default ManPowerUploadList;



















