import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL ,FILE_PATH} from '../Config.jsx';
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
import * as XLSX from 'xlsx';

const FastDisplay = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 });
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});

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

  // Export Excel (only required fields)
const exportToExcel = () => {
  if (!filteredData.length) return alert('No data to export');

  const headers = [
    'VEHICLE NO', 'VEHICLE TYPE', 'VEHICLE MODEL', 'VEHICLE COMPANY',
    'PURCHASE YEAR', 'USER / DEPT', 'DRIVER NAME', 'MOBILE',
    'TAG NO', 'TAG BANK', 'TAG REG MOBILE', 'FAST DATE',
    'FAST AMOUNT', 'CHALLAN AMOUNT', 'TRAFFIC CHALLAN', 'TRAFFIC DATE'
  ];

  const exportData = filteredData.map(row => ({
    'VEHICLE NO': row.VH_NUMBER || '',
    'VEHICLE TYPE': row.VH_TYPE || '',
    'VEHICLE MODEL': row.VH_MODEL || '',
    'VEHICLE COMPANY': row.VH_COMPANY || '',
    'PURCHASE YEAR': row.PUR_YEAR || '',
    'USER / DEPT': row.VH_USER || '',
    'DRIVER NAME': row.VH_DRIVER || '',
    'MOBILE': row.MOBILE || '',
    'TAG NO': row.TAG_NO || '',
    'TAG BANK': row.TAG_BANK || '',
    'TAG REG MOBILE': row.TAG_REG_MOBILE || '',
    'FAST DATE': formatDate(row.FAST_DT),
    'FAST AMOUNT': row.FAST_AMT || '',
    'CHALLAN AMOUNT': row.CHALLAN_AMT || '',
    'TRAFFIC CHALLAN': row.TRAFFIC_CHALLAN || '',
    'TRAFFIC DATE': formatDate(row.TRAF_DT)
  }));

  const ws = XLSX.utils.json_to_sheet(exportData, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'FastTag');

  const filename = `FastTag_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
};

  // File view function - Enhanced similar to InsuDisplay
// const handleFileView = async (filePath, fileType = 'file') => {
//   if (!filePath) {
//     console.log('No file path provided');
//     return;
//   }

//   console.log('Attempting to view file:', filePath);

//   try {
//     // Method 1: Try with authorization header first
//     const response = await axios.get(
//       `${API_BASE_URL}view-file/${encodeURIComponent(filePath)}`,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Accept: '*/*',
//           Authorization: `Bearer ${userToken?.token || ''}`
//         },
//         responseType: 'blob',
//         timeout: 10000
//       }
//     );

//     console.log('File retrieved successfully', response);
//     const contentType = response.headers['content-type'] || 'application/pdf';
//     const blob = new Blob([response.data], { type: contentType });
    
//     // Create URL for viewing instead of downloading
//     const url = window.URL.createObjectURL(blob);
    
//     // Try to open in new tab
//     const newWindow = window.open(url, '_blank');
    
//     // Fallback if popup blocked
//     if (!newWindow) {
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = filePath.split('/').pop() || `file_${Date.now()}.pdf`;
//       link.target = '_blank';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
    
//     // Clean up the URL object after a delay
//     setTimeout(() => {
//       window.URL.revokeObjectURL(url);
//     }, 5000);

//   } catch (error) {
//     console.error('Error viewing file:', error);
    
//     if (error.response?.status === 403) {
//       try {
//         // Second attempt without authorization
//         const response2 = await axios.get(
//           `${API_BASE_URL}view-fastchallan-file/${encodeURIComponent(filePath)}`,
//           {
//             responseType: 'blob',
//             timeout: 10000
//           }
//         );
        
//         const contentType = response2.headers['content-type'] || 'application/pdf';
//         const blob = new Blob([response2.data], { type: contentType });
//         const url = window.URL.createObjectURL(blob);
        
//         const newWindow = window.open(url, '_blank');
        
//         if (!newWindow) {
//           const link = document.createElement('a');
//           link.href = url;
//           link.download = filePath.split('/').pop() || `file_${Date.now()}.pdf`;
//           link.target = '_blank';
//           document.body.appendChild(link);
//           link.click();
//           document.body.removeChild(link);
//         }
        
//         setTimeout(() => window.URL.revokeObjectURL(url), 5000);
//         return;
        
//       } catch (error2) {
//         console.error('Second attempt also failed:', error2);
//         // Try direct URL as last resort
//         const directUrl = `http://172.20.0.9/laravel/myhomedashboard/storage/${filePath}`;
//         window.open(directUrl, '_blank');
//       }
//     } else if (error.response?.status === 404) {
//       alert('File not found. It may have been moved or deleted.');
//     } else {
//       alert(`Error viewing file: ${error.message}`);
//     }
//   }
// };
 const handleFileView = (filePath) => {
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
      const response = await axios.get(`${API_BASE_URL}getFastChange`, {
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

  // Updated function to handle View All Files - now passes both FAST_FILE and CHALLAN_FILE
  const handleOpenAllFiles = (rowData) => {
    navigate('/ViewallFastTagFiles', {
      state: { 
        vehicleNumber: rowData?.VH_NUMBER,
        fastFile: rowData?.FAST_FILE,
        challanFile: rowData?.CHALLAN_FILE,
        rowData: rowData // Pass entire row data for additional context
      },
    });
  };

const columns = [
  { 
    field: 'VH_NUMBER', 
    headerName: 'VEHICLE NO', 
    flex: 1, 
    minWidth: 140, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style'
  },
  { 
    field: 'VH_TYPE', 
    headerName: 'VEHICLE TYPE', 
    flex: 1, 
    minWidth: 120, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style'
  },
  { 
    field: 'VH_MODEL', 
    headerName: 'VEHICLE MODEL', 
    flex: 1, 
    minWidth: 140, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style'
  },
  { 
    field: 'VH_COMPANY', 
    headerName: 'VEHICLE COMPANY', 
    flex: 1, 
    minWidth: 140, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style'
  },
  { 
    field: 'PUR_YEAR', 
    headerName: 'PURCHASE YEAR', 
    flex: 1, 
    minWidth: 120, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style'
  },
  { 
    field: 'VH_USER', 
    headerName: 'USER / DEPT', 
    flex: 1, 
    minWidth: 140, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style'
  },
  { 
    field: 'VH_DRIVER', 
    headerName: 'DRIVER NAME', 
    flex: 1, 
    minWidth: 140, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style'
  },
  { 
    field: 'MOBILE', 
    headerName: 'MOBILE', 
    flex: 1, 
    minWidth: 140, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style'
  },
  { 
    field: 'TAG_NO', 
    headerName: 'TAG NO', 
    flex: 1, 
    minWidth: 120, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style'
  },
  { 
    field: 'TAG_BANK', 
    headerName: 'TAG BANK', 
    flex: 1, 
    minWidth: 120, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style'
  },
  { 
    field: 'TAG_REG_MOBILE', 
    headerName: 'TAG REG MOBILE', 
    flex: 1, 
    minWidth: 140, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style'
  },
  { 
    field: 'FAST_DT', 
    headerName: 'FAST DATE', 
    flex: 1.2, 
    minWidth: 130, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style',
    renderCell: (params) => formatDate(params.value)
  },
  
  // FAST FILE Column with View Button - Enhanced styling
  {
    field: 'FAST_FILE',
    headerName: 'FAST FILE',
    flex: 1.2,
    minWidth: 150,
    headerAlign: 'center',
    align: 'center',
    headerClassName: 'header-style',
    renderCell: (params) => {
      console.log('FAST_FILE params:', params); // Debug log
      const filePath = params.value || params.row.FAST_FILE;
      console.log('FAST_FILE filePath:', filePath); // Debug log
      
      return filePath ? (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Button
            variant="contained"
            size="small"
           
            onClick={() => handleFileView(filePath)}
            sx={{ 
              fontSize: '10px',
              padding: '4px 8px',
              borderRadius: '20px',
              textTransform: 'capitalize',
              backgroundColor: '#4682A9',
              color: '#fff',
              boxShadow: '0 2px 5px rgba(70, 130, 169, 0.4)',
              '&:hover': { 
                backgroundColor: '#218838',
                boxShadow: '0 4px 8px rgba(70, 130, 169, 0.6)'
              }
            }}
          >
            View
          </Button>
        </div>
      ) : <span style={{ color: '#888' }}>-</span>;
    }
  },

  { 
    field: 'FAST_AMT', 
    headerName: 'FAST AMOUNT', 
    flex: 1.2, 
    minWidth: 120, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style'
  },
  { 
    field: 'CHALLAN_AMT', 
    headerName: 'CHALLAN AMOUNT', 
    flex: 1.2, 
    minWidth: 130, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style'
  },
   {
        field: 'CHALLAN_FILE',
        headerName: 'CHALLAN FILE',
        flex: 1.2,
        minWidth: 150,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) =>
          params.row.CHALLAN_FILE ? (
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', width: '100%' }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleFileView(params.row.CHALLAN_FILE)}
                sx={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  textTransform: 'capitalize',
                  backgroundColor: '#4682A9',
                  color: '#fff',
                  boxShadow: '0 2px 5px rgba(40, 114, 167, 0.4)',
                  '&:hover': {
                    backgroundColor: '#218838',
                  }
                }}
              >
                View
              </Button>
            </div>
          ) : (
            <span style={{ color: '#888' }}>-</span>
          )
      },
 
  
  // { 
  //   field: 'TRAFFIC_CHALLAN', 
  //   headerName: 'TRAFFIC CHALLAN', 
  //   flex: 1.2, 
  //   minWidth: 150, 
  //   headerAlign: 'center', 
  //   align: 'center',
  //   headerClassName: 'header-style'
  // },
  { 
    field: 'TRAF_DT', 
    headerName: 'TRAFFIC DATE', 
    flex: 1.2, 
    minWidth: 130, 
    headerAlign: 'center', 
    align: 'center',
    headerClassName: 'header-style',
    renderCell: (params) => formatDate(params.value)
  },
  {
        field: 'ALL_FILES',
        headerName: 'ALL FILES',
        flex: 1.2,
        minWidth: 170,
        headerClassName: 'header-style',
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleOpenAllFiles(params.row)}
              sx={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '20px',
                textTransform: 'capitalize',
                backgroundColor: '#4682A9',
                color: '#fff',
                boxShadow: '0 2px 5px rgba(40, 140, 167, 0.4)',
                '&:hover': {
                  backgroundColor: '#218838',
                },
              }}
            >
              View All
            </Button>
          </div>
        )
      },
];

  return (
    <div className="py-3 px-3">
      <div className="max-w-9xl mx-auto">
        <div className="bg-white rounded-lg shadow border-2 border-blue-500 overflow-hidden">
          <div className="p-2">
            <div className="flex justify-between items-center">
              <img src="./img.png" alt="Logo" className="mr-4 w-40 h-12 rounded-lg" />
              <div className="flex-grow flex justify-center">
                <div className="bg-[#5ea8bb] px-5 py-1.5 rounded-lg inline-block -ml-20">
                  <h1 className="text-xl font-bold text-white">Four Wheeler Fast Tag / Challan Display</h1>
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
                
                <div 
                  style={{
                    position: 'sticky',
                    right: 0,
                    zIndex: 10
                  }}
                >
                  <Button
                    onClick={exportToExcel}
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    sx={{
                      backgroundColor: '#3f51b5',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 2px 4px rgba(63, 81, 181, 0.3)',
                      '&:hover': {
                        backgroundColor: '#303f9f',
                        boxShadow: '0 4px 8px rgba(63, 81, 181, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Download
                  </Button>
                </div>
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
                    // Enhanced header styling with #3f51b5 background and white text
                    '& .header-style': {
                      backgroundColor: '#3f51b5',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '13px',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#3f51b5',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      borderBottom: '2px solid #3f51b5',
                    },
                    '& .MuiDataGrid-columnHeader': {
                      backgroundColor: '#3f51b5',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:focus': {
                        outline: 'none',
                        backgroundColor: '#3f51b5',
                      },
                      '&:focus-within': {
                        backgroundColor: '#3f51b5',
                      }
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: 'bold',
                      color: 'white',
                      fontSize: '13px',
                    },
                    '& .MuiDataGrid-columnHeaderTitleContainer': {
                      color: 'white',
                    },
                    '& .MuiDataGrid-iconSeparator': {
                      color: 'white',
                    },
                    '& .MuiDataGrid-sortIcon': {
                      color: 'white',
                    },
                    '& .MuiDataGrid-menuIconButton': {
                      color: 'white',
                    },
                    // Row styling
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
                      fontSize: '13px',
                      color: 'black',
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
                      color: 'white',
                      zIndex: 3,
                      borderRight: '1px solid #ccc',
                    },
                    // Additional styling for consistency
                    '& .MuiDataGrid-filler': {
                      backgroundColor: '#3f51b5',
                    },
                    '& .MuiDataGrid-scrollbarFiller': {
                      backgroundColor: '#3f51b5',
                    },
                    '& .MuiDataGrid-scrollbarFiller--header': {
                      backgroundColor: '#3f51b5',
                    }
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

export default FastDisplay;