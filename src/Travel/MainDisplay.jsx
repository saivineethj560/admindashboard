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

const MainDisplay = () => {
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
 // Function to format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "-";
    const numValue = parseFloat(amount);
    if (isNaN(numValue)) return "-";
    return numValue.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
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
const calculateDifferenceAmount = (cost, claimAmt, claimStatus) => {
  const claimStatusLower = claimStatus?.toLowerCase();
  
  // If claim status is "no" or empty/null, return "-"
  if (claimStatusLower === 'no' || !claimStatusLower) {
    return '-';
  }
  
  // If claim status is "yes", calculate the difference
  if (claimStatusLower === 'yes') {
    const costValue = parseFloat(cost) || 0;
    const claimValue = parseFloat(claimAmt) || 0;
    const difference = costValue - claimValue;
    return difference.toFixed(2);
  }
  
  // For any other status, return "-"
  return '-';
};

  // ✅ FIXED: Moved exportToExcel function inside component to access filteredData and formatDate
  const exportToExcel = () => {
    try {
      // Check if there's data to export
      if (!filteredData || filteredData.length === 0) {
        alert('No data available to export');
        return;
      }

      // Define the header fields you want to include
      const headers = [
        'S.NO',
        'VEHICLE NO',
        'VEHICLE TYPE',
        'FUEL TYPE',
        'VEHICLE COMPANY',
        'VEHICLE MODEL',
        'COMPANY & PLANT',
        'PURCHASE YEAR',
        'DATE OF REGISTRATION',
        'VALID OF REGISTRATION',
        'USER / DEPT',
        'DRIVER NAME',
        'DRIVER MOBILE NO',
         'SERVICE DATE',
'COST',
 'VENDOR NAME',
        'STATUS',
        
        'DESCRIPTION',
       
        
           'VHC_KMS',
          'PY_DATE',
                'PAY_STATUS',

      ];

      const exportData = filteredData.map((row, index) => ({
        'S.NO': index + 1,
        'VEHICLE NO': row.VH_NUMBER || '',
        'VEHICLE TYPE': row.VH_TYPE || '',
        'FUEL TYPE': row.FUEL || '',
        'VEHICLE COMPANY': row.VH_COMPANY || '',
        'VEHICLE MODEL': row.VH_MODEL || '',
        'COMPANY & PLANT': row.COMP_PLANT || '',
        'PURCHASE YEAR': row.PUR_YEAR || '',
        'DATE OF REGISTRATION': formatDate(row.REG_DT),
        'VALID OF REGISTRATION': formatDate(row.REG_VALID),
        'USER / DEPT': row.VH_USER || '',
        'DRIVER NAME': row.VH_DRIVER || '',
        'DRIVER MOBILE NO': row.MOBILE || '',
        'SERVICE DATE': formatDate(row.SERVICE_DATE),
        'COST':row.COST_MAIN ||'',
        'VENDOR NAME': row.VENDOR_NAME || '',
        'STATUS': row.STATUS_MAIN || '',
         'DESCRIPTION':row.DESC_MAIN ||'',
        'VHC_KMS': row.VHC_KMS || '',
        'PY_DATE': row.PY_DATE || '',
         'PAY_STATUS':row.PAY_STATUS ||'',
       
         
       
      }));

      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance');
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `Maintenance_Report_${currentDate}.xlsx`;
      
      // Write and download file
      XLSX.writeFile(workbook, filename);
      
      console.log('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data to Excel. Please try again.');
    }
  };

  // ✅ FIXED handleFileView function
  // ✅ MODIFIED handleFileView function to VIEW files instead of downloading
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
    
//     // Open in new tab for viewing
//     window.open(url, '_blank');
    
//     // Clean up the URL object after a delay
//     setTimeout(() => {
//       window.URL.revokeObjectURL(url);
//     }, 5000); // Increased timeout to ensure file loads properly

//   } catch (error) {
//     console.error('Error viewing file:', error);
    
//     if (error.response?.status === 403) {
//       try {
//         // Second attempt without authorization
//         const response2 = await axios.get(
//           `${API_BASE_URL}${encodeURIComponent(filePath)}`,
//           {
//             responseType: 'blob',
//             timeout: 10000
//           }
//         );
        
//         const contentType = response2.headers['content-type'] || 'application/pdf';
//         const blob = new Blob([response2.data], { type: contentType });
//         const url = window.URL.createObjectURL(blob);
        
//         // Open in new tab for viewing
//         window.open(url, '_blank');
        
//         setTimeout(() => window.URL.revokeObjectURL(url), 5000);
//         return;
        
//       } catch (error2) {
//         console.error('Second attempt also failed:', error2);
//         alert('Error viewing file. Please try again.');
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
      const response = await axios.get(`${API_BASE_URL}getMaintData`, {
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
    navigate('/viewallMaint', {
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
      field: 'VH_TYPE', 
      headerName: 'VEHICLE TYPE', 
      flex: 1, 
      minWidth: 120,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center'
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
      field: 'VH_MODEL', 
      headerName: 'VEHICLE MODEL', 
      flex: 1.2, 
      minWidth: 140,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'COMP_PLANT', 
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
      flex: 1, 
      minWidth: 120,
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
      field: 'REG_VALID', 
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
      field: 'VH_DRIVER', 
      headerName: 'DRIVER NAME', 
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
      field: 'SERVICE_DATE', 
      headerName: 'SERVICE DATE', 
      flex: 1.5, 
      minWidth: 160,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => formatDate(params.value)
    },
   
    { 
      field: 'VENDOR_NAME', 
      headerName: 'VENDOR NAME', 
      flex: 1.5, 
      minWidth: 160,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center',
      
    },
    { 
      field: 'STATUS_MAIN', 
      headerName: 'STATUS', 
      flex: 1.5, 
      minWidth: 160,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'DESC_MAIN', 
      headerName: 'DESCRIPTION',
      flex: 1.5, 
      minWidth: 160,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center'
    },
  
      { 
      field: 'COST_MAIN', 
      headerName: 'COST', 
      flex: 1.5, 
      minWidth: 160,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center',
     
    },
      { 
      field: 'VHC_KMS', 
      headerName: 'VHC_KMS', 
      flex: 1.5, 
      minWidth: 160,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center'
    },
    
    
     { 
      field: 'PAY_STATUS', 
      headerName: 'PAY_STATUS', 
      flex: 1.5, 
      minWidth: 160,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'PY_DATE', 
      headerName: 'PY_DATE', 
      flex: 1.2, 
      minWidth: 120,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center',
        renderCell: (params) => formatDate(params.value)
    },
  
    {
      field: 'MAINT_FILE',
      headerName: 'MAINT_FILE',
      flex: 1.2,
      minWidth: 150,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) =>
        params.row.MAINT_FILE ? (
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', width: '100%' }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleFileView(params.row.MAINT_FILE)}
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
    {
      field: 'ALL_MAINT_FILE',
      headerName: 'ALL MAINTENANCE COPY',
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
            onClick={() => handleOpenAllInsurance(params.row.ALL_INS_FILE, params.row)}
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
                  <h1 className="text-xl font-bold text-white">Four Wheeler Maintenance Display</h1>
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
          borderColor: '#1976d2', // 🔷 blue border
        },
        '&:hover fieldset': {
          borderColor: '#1565c0', // 🔷 darker on hover
        },
        '&.Mui-focused fieldset': {
          borderColor: '#0d47a1', // 🔷 darkest on focus
        },
      },
      '& .MuiInputAdornment-root .MuiSvgIcon-root': {
        color: '#1976d2', // 🔷 icon color
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
                      boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)',
                      '&:hover': {
                        backgroundColor: '#15803d',
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


export default MainDisplay;