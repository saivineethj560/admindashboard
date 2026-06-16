import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, FILE_PATH } from '../Config';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import * as XLSX from 'xlsx';

const TwoWheelerChange = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 });
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});

  // Check if current user is authorized for modify button
  const isAuthorizedForModify = userToken?.employee === "Rajakumari.M" || userToken?.employee === "Rajakumari.M";
const isAuthorizedForEdit = !(
  userToken?.employee?.toLowerCase() === "rajakumari.m" || 
  userToken?.user?.toLowerCase() === "rajakumari.m" || 
  userToken?.username?.toLowerCase() === "rajakumari.m"
);
  // Function to format date to dd-mm-yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Filtered data - moved before exportToExcel function
  const filteredData = useMemo(() => {
    if (!searchText) return data;
    const search = searchText.toLowerCase();
    return data.filter(row =>
      Object.entries(row).some(
        ([, value]) =>
          typeof value === 'string' && value.toLowerCase().includes(search)
      )
    );
  }, [data, searchText]);

  // Handle Edit button click
  const handleEditClick = (rowData) => {
    navigate('/EditTwoWheeler', {
      state: { 
        vehicleData: rowData,
        vehicleNumber: rowData?.VH_NUMBER
      },
    });
  };

  const handleModifyClick = (rowData) => {
    navigate('/ModifyTwoWheeler', {
      state: { 
        vehicleData: rowData,
        vehicleNumber: rowData?.VH_NUMBER
      },
    });
  };
const handleINSFileView = async (vehicleNumber) => {
  if (!vehicleNumber) {
    alert('Vehicle number is required to view INS file');
    return;
  }

  console.log('Attempting to view INS file for vehicle:', vehicleNumber);

  try {
    // Correct API endpoint format - remove the extra slash
    const response = await axios.get(
      `${API_BASE_URL}getTwoInsuranceFile/${encodeURIComponent(vehicleNumber)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: 'application/json',
          Authorization: `Bearer ${userToken?.token || ''}`
        },
        responseType: 'blob', // Change to blob since the API returns file content directly
        timeout: 15000
      }
    );

    console.log('INS file retrieved successfully');
    
    // Get content type from response headers
    const contentType = response.headers['content-type'] || 'application/pdf';
    
    // Create blob and URL
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    
    // Try to open in new window
    const newWindow = window.open(url, '_blank');
    
    // If popup blocked, create download link
    if (!newWindow) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `INS_${vehicleNumber}_${Date.now()}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Clean up URL after 5 seconds
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 5000);

  } catch (error) {
    console.error('Error viewing INS file:', error);
    
    if (error.response?.status === 404) {
      alert('INS file not found for this vehicle number.');
    } else if (error.response?.status === 403) {
      alert('Access denied. Please check your authorization.');
    } else if (error.response?.status === 400) {
      alert('Invalid vehicle number format.');
    } else {
      alert(`Error viewing INS file: ${error.message}`);
    }
  }
};

    const handleRCFileView = (filePath) => {
      if (!filePath) {
        alert('No file path provided');
        return;
      }

      const url = `${FILE_PATH}public/storage/${filePath}`;
      window.open(url, '_blank');
    };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}two_wheeler`, {
        headers: {
          "Content-Type": "application/json",
          Accept: 'application/json',
          Authorization: `Bearer ${userToken.token}`
        }
      });

      console.log("Fetched data:", response.data);
      setData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!userToken.token) navigate('/');
  }, [navigate, userToken?.token]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleOpenAllInsurance = (filePath, rowData) => {
    navigate('/viewall', {
      state: { 
        vehicleNumber: rowData?.VH_NUMBER,
        filePath: filePath,
      },
    });
  };

  // Create columns array with conditional MODIFY column
  const createColumns = () => {
    const baseColumns = [
      {
        field: 'SNO',
        headerName: 'S.NO',
        flex: 0.5,
        minWidth: 60,
        sortable: false,
        filterable: false,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => {
          const index = params.api.getRowIndexRelativeToVisibleRows(params.id);
          const pageSize = paginationModel.pageSize;
          const page = paginationModel.page;
          return page * pageSize + index + 1;
        }
      },
      {
        field: 'VH_NUMBER',
        headerName: 'VEHICLE NO',
        flex: 1,
        minWidth: 140,
        headerClassName: 'header-style sticky-col',
        headerAlign: 'center',
        align: 'center',
        cellClassName: 'sticky-col',
      },
      { 
        field: 'FUEL', 
        headerName: 'FUEL TYPE', 
        flex: 1, 
        minWidth: 120,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center'
      },
      { 
        field: 'VH_COMPANY', 
        headerName: 'VEHICLE COMPANY', 
        flex: 1.2, 
        minWidth: 140,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center'
      },
      { 
        field: 'VH_LOC', 
        headerName: 'COMPANY & PLANT', 
        flex: 1.5, 
        minWidth: 160,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center'
      },
       { 
        field: 'PUR_YEAR', 
        headerName: 'PURCHASE YEAR', 
        flex: 1.2, 
        minWidth: 140,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => formatDate(params.value)
      },
      { 
        field: 'REG_DT', 
        headerName: 'DATE OF REGISTRATION', 
        flex: 1.5, 
        minWidth: 160,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => formatDate(params.value)
      },
      { 
        field: 'VALID_DT', 
        headerName: 'VALID OF REGISTRATION', 
        flex: 1.5, 
        minWidth: 160,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => formatDate(params.value)
      },
      { 
        field: 'VH_USER', 
        headerName: 'USER / DEPT', 
        flex: 1.2, 
        minWidth: 140,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center'
      },
      { 
        field: 'EMP_ID', 
        headerName: 'EMP ID', 
        flex: 1.2, 
        minWidth: 140,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center'
      },
      { 
        field: 'MOBILE', 
        headerName: 'DRIVER MOBILE NO', 
        flex: 1.2, 
        minWidth: 140,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center'
      },
      { 
        field: 'COST', 
        headerName: 'COST', 
        flex: 1.5, 
        minWidth: 160,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center',
      },
      { 
        field: 'S_DATE', 
        headerName: 'DATE', 
        flex: 1.5, 
        minWidth: 160,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => formatDate(params.value)
      },
      { 
        field: 'STATUS', 
        headerName: 'STATUS', 
        flex: 1.5, 
        minWidth: 160,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center'
      },
      { 
            field: 'INS_START', 
            headerName: 'INS START DATE', 
            flex: 1.5, 
            minWidth: 160,
            headerClassName: 'header-style',
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => formatDate(params.value)
          },
            { 
            field: 'INS_END', 
            headerName: 'INS END DATE', 
            flex: 1.5, 
            minWidth: 160,
            headerClassName: 'header-style',
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => formatDate(params.value)
          },
           { 
            field: 'INS_AMT', 
            headerName: 'PREMIUM INS AMT', 
            flex: 1.5, 
            minWidth: 160,
            headerClassName: 'header-style',
            headerAlign: 'center',
            align: 'center'
           
          },
          {
        field: 'INS_FILES',
        headerName: 'INS FILE',
        flex: 1.2,
        minWidth: 150,
        headerClassName: 'header-style',
        headerAlign: 'center',
         align: 'center',
            renderCell: (params) => {
              const vehicleNumber = params.row.VH_NUMBER;
              
              if (vehicleNumber) {
                return (
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', width: '100%' }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleINSFileView(vehicleNumber)}
                      
                      sx={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        textTransform: 'capitalize',
                        backgroundColor: '#4682A9',
                        color: '#fff',
                        boxShadow: '0 2px 5px rgba(70, 130, 169, 0.4)',
                        '&:hover': {
                          backgroundColor: '#218838',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      View
                    </Button>
                  </div>
                );
              } else {
                return <span style={{ color: '#666' }}>-</span>;
              }
            }
          },
         {
        field: 'INS FILE',
        headerName: 'All INS FILE',
        flex: 1.2,
        minWidth: 150,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => {
          const vehicleNumber = params.row.VH_NUMBER;
          
          if (vehicleNumber) {
            return (
              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', width: '100%' }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/InsurAllFiles', { 
                    state: { 
                      vehicleNumber: vehicleNumber,
                      vehicleData: params.row 
                    } 
                  })}
                  sx={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    textTransform: 'capitalize',
                    backgroundColor: '#4682A9',
                    color: '#fff',
                    boxShadow: '0 2px 5px rgba(70, 130, 169, 0.4)',
                    '&:hover': {
                      backgroundColor: '#218838',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  open
                </Button>
              </div>
            );
          } else {
            return <span style={{ color: '#666' }}>-</span>;
          }
        }
      },
      {
        field: 'RC_FILE_PATH',
        headerName: 'RC FILE',
        flex: 1.2,
        minWidth: 150,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => {
          const vehicleNumber = params.row.VH_NUMBER;
          const rcFile = params.row.RC_FILE_PATH;
          if (vehicleNumber) {
            return (
              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', width: '100%' }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleRCFileView(rcFile)}
                  
                  sx={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    textTransform: 'capitalize',
                    backgroundColor: '#4682A9',
                    color: '#fff',
                    boxShadow: '0 2px 5px rgba(70, 130, 169, 0.4)',
                    '&:hover': {
                      backgroundColor: '#218838',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  View RC
                </Button>
              </div>
            );
          } else {
            return <span style={{ color: '#666' }}>-</span>;
          }
        }
      },
     { 
  field: 'EDIT', 
  headerName: 'EDIT', 
  flex: 1.2, 
  minWidth: 120,
  headerClassName: 'header-style',
  headerAlign: 'center',
  align: 'center',
  sortable: false,
  filterable: false,
  renderCell: (params) => {
    return (
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', width: '100%' }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => handleEditClick(params.row)}
          startIcon={<EditIcon />}
          disabled={!isAuthorizedForEdit} // Add this line
          sx={{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '20px',
            textTransform: 'capitalize',
            backgroundColor: isAuthorizedForEdit ? '#3f51b5' : '#9e9e9e', // Change color when disabled
            color: '#fff',
            boxShadow: isAuthorizedForEdit ? '0 2px 5px rgba(0, 64, 255, 0.4)' : 'none',
            '&:hover': {
              backgroundColor: isAuthorizedForEdit ? '#f57c00' : '#9e9e9e',
              transform: isAuthorizedForEdit ? 'translateY(-1px)' : 'none',
            },
            transition: 'all 0.2s ease-in-out',
            cursor: isAuthorizedForEdit ? 'pointer' : 'not-allowed'
          }}
        >
          Edit
        </Button>
      </div>
    );
  }
}];

    // Only add MODIFY column if user is authorized
    if (isAuthorizedForModify) {
      baseColumns.push({
        field: 'MODIFY', 
        headerName: 'MODIFY', 
        flex: 1.2, 
        minWidth: 120,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', width: '100%' }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleModifyClick(params.row)}
                startIcon={<EditIcon />}
                sx={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  textTransform: 'capitalize',
                  backgroundColor: '#3f51b5',
                  color: '#fff',
                  boxShadow: '0 2px 5px rgba(0, 64, 255, 0.4)',
                  '&:hover': {
                    backgroundColor: '#f50072ff',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Modify
              </Button>
            </div>
          );
        }
      });
    }

    return baseColumns;
  };

  const columns = createColumns();
  

  return (
    <div className="py-3 px-3">
      <div className="max-w-9xl mx-auto">
        <div className="bg-white rounded-lg shadow border-2 border-blue-500 overflow-hidden">
          <div className="p-2">
            <div className="flex justify-between items-center">
              <img src="./img.png" alt="Logo" className="mr-4 w-40 h-12 rounded-lg" />
              <div className="flex-grow flex justify-center">
                <div className="bg-[#5ea8bb] px-5 py-1.5 rounded-lg inline-block -ml-20">
                  <h1 className="text-xl font-bold text-white">Two Wheeler Change Tab</h1>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-white bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed] hover:from-[#c71d6f] hover:to-[#d09693] rounded-full p-1"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="h-0.5 bg-blue-600 w-[95%] mx-auto"></div>

          <div className="p-2">
            <Paper sx={{ padding: 2, border: '1px solid gray', borderRadius: '8px' }}>
              <Box sx={{ 
                mb: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                position: 'relative'
              }}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search..."
                  value={searchText}
                  onChange={handleSearch}
                  sx={{
                    width: '30%',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#1976d2',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1565c0',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0d47a1',
                      },
                    },
                    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                      color: '#1976d2',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
              
               
              </Box>

              <Box sx={{ width: '100%' }}>
                <DataGrid
                  rows={filteredData}
                  columns={columns}
                  getRowId={(row) => row.SNO || row.id || row.VH_NUMBER}
                  loading={loading}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[5, 10, 20]}
                  rowHeight={40}
                  columnHeaderHeight={35}
                  autoHeight
                  getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : ''
                  }
                  sx={{
                    '& .header-style': {
                      backgroundColor: '#3f51b5',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '13px',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#3f51b5',
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: 'bold',
                      color: 'white',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: '#f0f9ff',
                    },
                    '& .even-row': {
                      backgroundColor: '#f8f9fa',
                    },
                    '& .MuiDataGrid-cell': {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                    },
                    '& .sticky-cell': {
                      position: 'sticky',
                      left: 0,
                      backgroundColor: '#fff',
                      zIndex: 1,
                      borderRight: '1px solid #ccc',
                    },
                    '& .MuiDataGrid-columnHeaders .sticky-header': {
                      position: 'sticky',
                      left: 0,
                      backgroundColor: '#3f51b5',
                      color: '#fff',
                      zIndex: 3,
                      borderRight: '1px solid #ccc',
                    },
                    fontSize: '13px',
                    color: 'black',
                  }}
                />
              </Box>
            </Paper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoWheelerChange;