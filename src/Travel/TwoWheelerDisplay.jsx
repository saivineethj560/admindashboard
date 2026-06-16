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
import * as XLSX from 'xlsx';

const TwoWheelerDisplay = () => {
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

  // Updated exportToExcel function with proper field mapping
  const exportToExcel = () => {
    try {
      // Check if there's data to export
      if (!filteredData || filteredData.length === 0) {
        alert('No data available to export');
        return;
      }

      // Define the header fields based on your data structure
      const headers = [
        'S.NO',
        'VEHICLE NO',
        'FUEL TYPE',
        'VEHICLE COMPANY',
        'COMPANY & PLANT',
        'DATE OF REGISTRATION',
        'VALID OF REGISTRATION',
        'USER / DEPT',
        'EMP ID',
        'DRIVER MOBILE NO',
        'COST',
        'DATE',
        'STATUS',
        'INS SATRT DATE',
        'INS END DATE',
        'PUR_YEAR',
      ];

      const exportData = filteredData.map((row, index) => ({
        'S.NO': index + 1,
        'VEHICLE NO': row.VH_NUMBER || '',
        'FUEL TYPE': row.FUEL || '',
        'VEHICLE COMPANY': row.VH_COMPANY || '',
        'COMPANY & PLANT': row.VH_LOC || '',
        'DATE OF REGISTRATION': formatDate(row.REG_DT),
        'VALID OF REGISTRATION': formatDate(row.VALID_DT),
        'USER / DEPT': row.VH_USER || '',
        'EMP ID': row.EMP_ID || '',
        'DRIVER MOBILE NO': row.MOBILE || '',
        'COST': row.COST || '',
        'S_DATE': formatDate(row.S_DATE),
        'STATUS': row.STATUS || '',
        'INS_START': formatDate(row.INS_START),
        'INS_END': formatDate(row.INS_END), 
         'PUR_YEAR': formatDate(row.PUR_YEAR), 
      }));

      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'TwoWheelerData');
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `TwoWheeler_Report_${currentDate}.xlsx`;
      
      // Write and download file
      XLSX.writeFile(workbook, filename);
      
      console.log('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data to Excel. Please try again.');
    }
  };

  // Updated handleRCFileView function using the working API endpoint
  // Updated handleRCFileView function to handle the JSON response
// const handleRCFileView = async (vehicleNumber) => {
//   if (!vehicleNumber) {
//     alert('Vehicle number is required to view RC file');
//     return;
//   }

//   console.log('Attempting to view RC file for vehicle:', vehicleNumber);

//   try {
//     // First API call to get the file path
//     const response = await axios.get(
//       `${API_BASE_URL}get-rc-file?vhno=${encodeURIComponent(vehicleNumber)}`,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Accept: 'application/json', // Changed to application/json
//           Authorization: `Bearer ${userToken?.token || ''}`
//         },
//         timeout: 10000
//       }
//     );

//     console.log('RC file path retrieved successfully', response.data);
    
//     // Check if the response contains the file path
//     if (response.data?.status && response.data?.data?.RC_FILE_PATH) {
//       const filePath = response.data.data.RC_FILE_PATH;
      
//       // Construct the full file URL
//       const fileUrl = `http://172.20.0.9/laravel/myhomedashboard/storage/${filePath}`;
      
//       console.log('File URL:', fileUrl);
      
//       // Second API call to get the actual file content
//       try {
//         const fileResponse = await axios.get(fileUrl, {
//           headers: {
//             Authorization: `Bearer ${userToken?.token || ''}`
//           },
//           responseType: 'blob',
//           timeout: 15000
//         });

//         console.log('File content retrieved successfully');
        
//         // Get content type from response headers
//         const contentType = fileResponse.headers['content-type'] || 'application/pdf';
        
//         // Create blob and URL
//         const blob = new Blob([fileResponse.data], { type: contentType });
//         const url = window.URL.createObjectURL(blob);
        
//         // Try to open in new window
//         const newWindow = window.open(url, '_blank');
        
//         // If popup blocked, create download link
//         if (!newWindow) {
//           const link = document.createElement('a');
//           link.href = url;
//           link.download = `RC_${vehicleNumber}_${Date.now()}.pdf`;
//           link.target = '_blank';
//           document.body.appendChild(link);
//           link.click();
//           document.body.removeChild(link);
//         }

//         // Clean up URL after 5 seconds
//         setTimeout(() => {
//           window.URL.revokeObjectURL(url);
//         }, 5000);

//       } catch (fileError) {
//         console.error('Error fetching file content:', fileError);
        
//         // If direct file access fails, try opening the URL directly
//         const newWindow = window.open(fileUrl, '_blank');
//         if (!newWindow) {
//           alert('Unable to open file. Please check if the file exists and you have proper permissions.');
//         }
//       }
      
//     } else {
//       console.error('Invalid response structure:', response.data);
//       alert('Invalid response from server. Please try again.');
//     }

//   } catch (error) {
//     console.error('Error viewing RC file:', error);
    
//     if (error.response?.status === 404) {
//       alert('RC file not found for this vehicle number.');
//     } else if (error.response?.status === 403) {
//       alert('Access denied. Please check your authorization.');
//     } else if (error.response?.status === 400) {
//       alert('Invalid vehicle number format.');
//     } else {
//       alert(`Error viewing RC file: ${error.message}`);
//     }
//   }
// };
    const handleRCFileView = (filePath) => {
      if (!filePath) {
        alert('No file path provided');
        return;
      }

      const url = `${FILE_PATH}public/storage/${filePath}`;
      window.open(url, '_blank');
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
const handleInsFileView = (vehicleNumber) => {
  if (!vehicleNumber) {
    alert('Vehicle number is required to view insurance file');
    return;
  }

  console.log('Redirecting to InsurAllFiles.jsx for vehicle:', vehicleNumber);
  
  // Option 1: If InsuranceFiles.php is in the same domain
  // window.location.href = `InsuranceFiles.php?vhno=${encodeURIComponent(vehicleNumber)}`;
  
  // Option 2: If you want to open in a new tab
  window.open(`InsuranceFiles.jsx?vhno=${encodeURIComponent(vehicleNumber)}`, '_blank');
  
  // Option 3: If you're using React Router and have a route set up for this page
  // navigate(`/insurance-files/${encodeURIComponent(vehicleNumber)}`);
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

  const columns = [
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
      align: 'center',
      
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
        console.log("RenderCell params:", params);
        const vehicleNumber = params.row.VH_NUMBER;
        const rcFile = params.row.RC_FILE_PATH;
;
        
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
                  <h1 className="text-xl font-bold text-white">Two Wheeler Display</h1>
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
                      backgroundColor: '#296fe0',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)',
                      '&:hover': {
                        backgroundColor: '#3f51b5',
                        boxShadow: '0 4px 8px rgba(22, 163, 74, 0.4)',
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

export default TwoWheelerDisplay;