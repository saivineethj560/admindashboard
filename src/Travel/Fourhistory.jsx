import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, FILE_PATH } from '../Config';
import { DataGrid } from '@mui/x-data-grid';
import * as XLSX from 'xlsx';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Modal,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';


const Fourhistory = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 });
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // 1. Add this new state for storing all records for modal
  const [allRecordsForVehicle, setAllRecordsForVehicle] = useState([]);
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
const exportToExcel = () => {
  if (!selectedVehicle || !allRecordsForVehicle.length) {
    alert('No data to export');
    return;
  }

  try {
    // Prepare data for Excel
    const excelData = allRecordsForVehicle.map((record, index) => ({
      'SNO': index + 1,
      'VEHICLE NO': record.VH_NUMBER || '-',
      'DATE OF REGISTRATION': formatDate(record.REG_DT),
      'VALID OF REGISTRATION': formatDate(record.REG_VALID),
      'USER / DEPT': record.VH_USER || '-',
      'DRIVER NAME': record.VH_DRIVER || '-',
      'DRIVER MOBILE NO': record.MOBILE || '-',
      'INSURANCE START DATE': record.INSURANCE_START_DATE || '-',
      'INSURANCE END DATE': record.INSURANCE_END_DATE || '-',
      'INSURANCE COMPANY': record.INSURANCE_CMP || '-',
      'PREMIUM INSURANCE AMOUNT': record.AMT || '-',
      'CHALLAN DATE': record.TRAF_DT || '-',
      'CHALLAN AMT': record.CHALLAN_AMT || '-',
      'FAST TAG NO': record.TAG_NO || '-',
      'FAST TAG BANK': record.TAG_BANK || '-',
      'FAST TAG MOBILE NO': record.TAG_REG_MOBILE || '-',
      'FAST TAG DATE': record.FAST_DT || '-',
      'FAST AMT': record.FAST_AMT || '-',
      'STATUS DATE': record.STAT_DT || '-',
      'STATUS AMOUNT': record.STAT_AMT || '-',
      'STATUS': record.INS_STATUS || '-',
      'STATUS REASON': record.STATUS_RE || '-',
      'SERVICE DATE': record.SERVICE_DATE || '-',
      'MAINT STATUS': record.STATUS_MAIN || '-',
      'MAINT DESCP': record.DESC_MAIN || '-',
      'MAINT CLAIMED STATUS': record.CLAIM_STATUS || '-',
      'COST MAINT': record.COST_MAIN || '-',
      'MAINT CLAIMED AMT': record.CLAIM_AMT || '-',
      'DIFFERENCE AMT': (() => {
        const costMain = parseFloat(record.COST_MAIN) || 0;
        const claimAmt = parseFloat(record.CLAIM_AMT) || 0;
        if (costMain > 0 && claimAmt > 0) {
          return (costMain - claimAmt).toFixed(2);
        }
        return '-';
      })(),
      'MAINT CLAIMED DT': record.CLAIM_DT || '-',
      'TAX START DATE': record.TAX_START_DATE || '-',
      'TAX REMAINDER DATE': record.TAX_REMAINDER_DATE || '-',
      'TAX COST': record.COST || '-',
      'VEHICLE KMS': record.VH_KMS || '-',
      'FROM DATE': record.FROM_DATE || '-',
      'TO DATE': record.TO_DATE || '-',
        'VHC_KMS': record.VHC_KMS || '',
        'PY_DATE': record.PY_DATE || '',
         'PAY_STATUS':record.PAY_STATUS ||'',
      'UPDATED AT': formatDate(record.updated_at || '-')
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, 
      { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, 
      { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, 
      { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, 
      { wch: 15 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, 
      { wch: 12 },  { wch: 12 }, { wch: 12 }, 
      { wch: 12 },{ wch: 20 }
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicle History');

    // Generate filename with vehicle number and current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `Vehicle_History_${selectedVehicle.VH_NUMBER}_${currentDate}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    // Show success message
    alert(`Excel file "${filename}" has been downloaded successfully!`);

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error occurred while exporting to Excel. Please try again.');
  }
};
// Add this function after exportToExcel and before filteredData
const exportAllVehiclesToExcel = () => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    // Prepare data for Excel - include all records from all vehicles
    const excelData = data.map((record, index) => ({
      'SNO': index + 1,
      'VEHICLE NO': record.VH_NUMBER || '-',
      'VEHICLE TYPE': record.VH_TYPE || '-',
      'FUEL TYPE': record.FUEL || '-',
      'VEHICLE COMPANY': record.VH_COMPANY || '-',
      'VEHICLE MODEL': record.VH_MODEL || '-',
      'PURCHASE YEAR': formatDate(record.PUR_YEAR),
      'COM & PLANT': record.COMP_PLANT || '-',
      'DATE OF REGISTRATION': formatDate(record.REG_DT),
      'VALID OF REGISTRATION': formatDate(record.REG_VALID),
      'USER / DEPT': record.VH_USER || '-',
      'DRIVER NAME': record.VH_DRIVER || '-',
      'DRIVER MOBILE NO': record.MOBILE || '-',
      'INSURANCE START DATE': formatDate(record.INSURANCE_START_DATE),
      'INSURANCE END DATE': formatDate(record.INSURANCE_END_DATE),
      'INSURANCE COMPANY': record.INSURANCE_CMP || '-',
      'PREMIUM INSURANCE AMOUNT': record.AMT || '-',
      'CHALLAN DATE': formatDate(record.TRAF_DT),
      'CHALLAN AMT': record.CHALLAN_AMT || '-',
      'FAST TAG NO': record.TAG_NO || '-',
      'FAST TAG BANK': record.TAG_BANK || '-',
      'FAST TAG MOBILE NO': record.TAG_REG_MOBILE || '-',
      'FAST TAG DATE': formatDate(record.FAST_DT),
      'FAST AMT': record.FAST_AMT || '-',
      'STATUS DATE': formatDate(record.STAT_DT),
      'STATUS AMOUNT': record.STAT_AMT || '-',
      'STATUS': record.INS_STATUS || '-',
      'STATUS REASON': record.STATUS_RE || '-',
      'SERVICE DATE': formatDate(record.SERVICE_DATE),
      'MAINT STATUS': record.STATUS_MAIN || '-',
      'MAINT DESCP': record.DESC_MAIN || '-',
      'MAINT CLAIMED STATUS': record.CLAIM_STATUS || '-',
      'COST MAINT': record.COST_MAIN || '-',
      'MAINT CLAIMED AMT': record.CLAIM_AMT || '-',
      'DIFFERENCE AMT': (() => {
        const costMain = parseFloat(record.COST_MAIN) || 0;
        const claimAmt = parseFloat(record.CLAIM_AMT) || 0;
        if (costMain > 0 && claimAmt > 0) {
          return (costMain - claimAmt).toFixed(2);
        }
        return '-';
      })(),
      'MAINT CLAIMED DT': formatDate(record.CLAIM_DT),
      'TAX START DATE': formatDate(record.TAX_START_DATE),
      'TAX REMAINDER DATE': formatDate(record.TAX_REMAINDER_DATE),
      'TAX COST': record.COST || '-',
      'VEHICLE KMS': record.VH_KMS || '-',
      'FROM DATE': formatDate(record.FROM_DATE),
      'TO DATE': formatDate(record.TO_DATE),
      'VHC_KMS': record.VHC_KMS || '-',
      'PY_DATE': formatDate(record.PY_DATE),
      'PAY_STATUS': record.PAY_STATUS || '-',
      'UPDATED AT': formatDate(record.updated_at || '-')
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 5 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
      { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
      { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 10 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'All Vehicles History');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `All_Vehicles_History_${currentDate}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    // Show success message
    alert(`Excel file "${filename}" with ${data.length} records has been downloaded successfully!`);

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error occurred while exporting to Excel. Please try again.');
  }
};
  // Filtered data - moved before exportToExcel function
  const filteredData = useMemo(() => {
    if (!data) return [];

    // First apply search filter
    let searchFiltered = data;
    if (searchText) {
      const search = searchText.toLowerCase();
      searchFiltered = data.filter(row =>
        Object.entries(row).some(
          ([, value]) =>
            typeof value === 'string' && value.toLowerCase().includes(search)
        )
      );
    }

    const uniqueRecords = [];
    const seenVhNumbers = new Set();

    searchFiltered.forEach(row => {
      if (!seenVhNumbers.has(row.VH_NUMBER)) {
        // Check if this vehicle has any active records
        const vehicleRecords = data.filter(record => record.VH_NUMBER === row.VH_NUMBER);
        const hasActiveRecord = vehicleRecords.some(record =>
          record.INS_STATUS?.toLowerCase() === 'active'
        );

        // Get the latest record for this vehicle (or you can use any other logic)
        const latestRecord = vehicleRecords[vehicleRecords.length - 1];

        // Add status info to the row
        const rowWithStatus = {
          ...latestRecord,
          HAS_ACTIVE_RECORD: hasActiveRecord
        };

        uniqueRecords.push(rowWithStatus);
        seenVhNumbers.add(row.VH_NUMBER);
      }
    });

    return uniqueRecords;
  }, [data, searchText]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}getVehicleHistoryChange`, {
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

  // Handle edit action
  const handleEdit = (rowData) => {
    // Get all records for this VH_NUMBER
    const vehicleRecords = data.filter(record => record.VH_NUMBER === rowData.VH_NUMBER);

    setSelectedVehicle(rowData);
    setAllRecordsForVehicle(vehicleRecords);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };
  // 1. Add this function before the VehicleDetailsModal component
  // const handleViewFile = (filePath, fileName) => {
  //   if (!filePath) {
  //     alert('No file available');
  //     return;
  //   }

  //   // Construct the full file URL - adjust the base URL according to your backend
  //   const fileUrl = `http://172.20.0.9/laravel/myhomedashboard/storage/${filePath}`;

  //   // Open file in new tab
  //   window.open(fileUrl, '_blank');
  // };
  const handleViewFile = (filePath) => {
    if (!filePath) {
      alert('No file path provided');
      return;
    }

    const url = `${FILE_PATH}public/storage/${filePath}`;
    window.open(url, '_blank');
  };
  // Modal component
  const VehicleDetailsModal = () => {
    if (!selectedVehicle) return null;

    return (
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="vehicle-details-modal"
        aria-describedby="vehicle-details-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: { xs: '95%', sm: '90%', md: '90%', lg: '95%' },
            maxWidth: '1400px',
            bgcolor: 'background.paper',
            border: '3px solid #1976d2',
            borderRadius: '12px',
            boxShadow: 24,
            p: 0,
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          {/* Modal Header */}
          <Box
  sx={{
    position: 'relative',
    p: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    color: 'white',
    background: 'linear-gradient(45deg, #1976d2,rgba(238, 218, 243, 0.39),rgb(227, 100, 246))',
    backgroundSize: '200% 200%',
    animation: 'gradientShift 3s ease infinite',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(45deg,rgb(71, 235, 112),rgb(119, 159, 32),rgb(165, 95, 230))',
      transform: 'scale(1.01)',
    },
    '@keyframes gradientShift': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
  }}
>
           <Box display="flex" alignItems="center" gap={1}>
    <HistoryIcon sx={{ fontSize: 28 }} />
    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
      Vehicle Details - {selectedVehicle.VH_NUMBER}
    </Typography>
  </Box>
<Box display="flex" alignItems="center" gap={2}>
    {/* Excel Download Button */}
    <Button
      onClick={exportToExcel}
      variant="contained"
      size="small"
      startIcon={<FileDownloadIcon />}
      sx={{
        backgroundColor: 'rgba(76, 175, 80, 0.9)',
        '&:hover': {
          backgroundColor: '#4caf50',
          transform: 'scale(1.05)',
        },
        borderRadius: '20px',
        px: 2,
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        textTransform: 'none'
      }}
    >
      Export Excel
    </Button>

    {/* Close Button */}
    <IconButton
      onClick={handleCloseModal}
      sx={{
        color: 'white',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          transform: 'rotate(90deg)',
        },
        transition: 'all 0.3s ease',
      }}
    >
      <CloseIcon />
    </IconButton>
  </Box>
</Box>

          {/* Modal Body with Table */}
          <Box sx={{ p: 3 }}>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
                fontFamily: 'Roboto, sans-serif',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    {/* Table headers with enhanced styling */}
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '50px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>SNO</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>DATE OF<br />REGISTRATION</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>VALID OF<br />REGISTRATION</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>USER /<br />DEPT</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>DRIVER<br />NAME</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>DRIVER<br />MOBILE NO</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>INSURANCE<br />START DATE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>INSURANCE<br />END DATE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>INSURANCE<br />COMPANY</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>INSURANCE<br />COPY</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>PREMIUM INSURANCE<br />AMOUNT</th>
                    {/* <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>TRAFFIC<br />CHALLAN</th> */}
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>CHALLAN<br />FILE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>CHALLAN<br />DATE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>CHALLAN<br />AMT</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>RC<br />UPLOAD</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>FAST TAG<br />NO</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>FAST TAG<br />BANK</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>FAST TAG<br />MOBILE NO</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>FAST TAG<br />DATE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>FAST TAG<br />UPLOAD</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>FAST<br />AMT</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>STATUS<br />DATE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>STATUS<br />AMOUNT</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>STATUS<br /></th>

                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>STATUS<br />REASON</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>SERVICE<br />DATE</th>
                   
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>MAINT<br />STATUS</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>MAINT<br />DESCP</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>MAINT<br />CLAIMED _STATUS</th>
                     <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>COST<br />MAINT</th>
                    
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>MAINT<br />CLAIMED_AMT</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>DIFFERENCE<br />AMT</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>MAINT<br />CLAIMED_DT</th>
                     <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>MAINT<br />VH_KMS</th>
                      <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>PAYMENT<br />DATE</th>
                     <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>PAYMENT<br />STATUS</th>
                   
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>TAX<br />START DATE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>TAX<br />REMAINDER DATE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>TAX<br />COST</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>VEHICLE<br />KMS</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>FROM<br />DTAE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>TO<br />DATE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '120px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>UPDATED<br />AT</th>
                  </tr>
                </thead>
                <tbody>
                  {allRecordsForVehicle.map((record, index) => (
                    <tr
                      key={index}
                      style={{
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e3f2fd';
                        e.currentTarget.style.transform = 'scale(1.01)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Table cells with enhanced styling */}
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{index + 1}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.REG_DT)}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.REG_VALID)}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.VH_USER || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.VH_DRIVER || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.MOBILE || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.INSURANCE_START_DATE || '-')}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.INSURANCE_END_DATE || '-')}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.INSURANCE_CMP || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>
                        {record.INS_FILE ? (
                          <button
                            onClick={() => handleViewFile(record.INS_FILE, 'Insurance Copy')}
                            style={{
                              background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                            }}
                          >
                            📄 View
                          </button>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.AMT || '-'}</td>
{/* 
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.TRAFFIC_CHALLAN || '-'}</td> */}
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>
                        {record.CHALLAN_FILE ? (
                          <button
                            onClick={() => handleViewFile(record.CHALLAN_FILE, 'Challan File')}
                            style={{
                              background: 'linear-gradient(45deg, #f44336, #ff6b6b)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                            }} lknb
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                            }}
                          >
                            🚫 View
                          </button>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.TRAF_DT || '-')}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.CHALLAN_AMT || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>
                        {record.RC ? (
                          <button
                            onClick={() => handleViewFile(record.RC, 'RC Document')}
                            style={{
                              background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                            }}
                          >
                            📋 View
                          </button>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.TAG_NO || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.TAG_BANK || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.TAG_REG_MOBILE || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.FAST_DT || '-')}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>
                        {record.FAST_FILE ? (
                          <button
                            onClick={() => handleViewFile(record.FAST_FILE, 'FastTag File')}
                            style={{
                              background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                            }}
                          >
                            🏷️ View
                          </button>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.FAST_AMT || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.STAT_DT || '-')}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.STAT_AMT || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.INS_STATUS || '-'}</td>

                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.STATUS_RE || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.SERVICE_DATE || '-')}</td>
                     
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.STATUS_MAIN || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.DESC_MAIN || '-'}</td>
                       <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.CLAIM_STATUS || '-'}</td>

 <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.COST_MAIN || '-'}</td>
                     

                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.CLAIM_AMT || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{(() => {
                        // Calculate difference amount (COST_MAIN - CLAIM_AMT)
                        const costMain = parseFloat(record.COST_MAIN) || 0;
                        const claimAmt = parseFloat(record.CLAIM_AMT) || 0;

                        // Only display difference if both cost and claim amount exist and claim amount > 0
                        if (costMain > 0 && claimAmt > 0) {
                          return (costMain - claimAmt).toFixed(2);
                        } else {
                          return '-';
                        }
                      })()}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.CLAIM_DT || '-')}</td>
                       <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.VHC_KMS || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.PY_DATE || '-')}</td>
                       <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.PAY_STATUS || '-')}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.TAX_START_DATE || '-')}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.TAX_REMAINDER_DATE || '-')}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.COST || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.VH_KMS || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.FROM_DATE || '-')}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.TO_DATE || '-')}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{formatDate(record.updated_at || '-')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>

            {/* Financial Summary Section */}
            <Box sx={{ mt: 4, mb: 3 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                gap: 2,
                p: 2,
                borderRadius: '12px',
                background: 'linear-gradient(135deg,rgb(130, 151, 246) 0%,rgb(172, 108, 235) 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg,rgb(98, 209, 24) 0%,rgb(214, 84, 236) 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                }
              }}>
                <Box sx={{
                  color: '#ffd700',
                  fontSize: '24px',
                  animation: 'bounce 2s infinite',
                  '@keyframes bounce': {
                    '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                    '40%': { transform: 'translateY(-10px)' },
                    '60%': { transform: 'translateY(-5px)' },
                  }
                }}>💰</Box>
                <Typography variant="h5" sx={{
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  Financial Summary
                </Typography>
              </Box>

              {(() => {
                // Calculate totals for all records of this vehicle
                const insuranceTotal = allRecordsForVehicle.reduce((sum, record) => sum + parseFloat(record.AMT || 0), 0);
                const challanTotal = allRecordsForVehicle.reduce((sum, record) => sum + parseFloat(record.CHALLAN_AMT || 0), 0);
                const fasttagTotal = allRecordsForVehicle.reduce((sum, record) => sum + parseFloat(record.FAST_AMT || 0), 0);
       // Find this section in the Financial Summary calculation and replace it:
const maintenanceTotal = allRecordsForVehicle.reduce((sum, record) => {
  const costMain = parseFloat(record.COST_MAIN || 0);
  const claimAmt = parseFloat(record.CLAIM_AMT || 0);
  const claimStatus = record.CLAIM_STATUS?.toLowerCase();
  const payStatus = record.PAY_STATUS?.toLowerCase(); // Add this line

  // Only calculate if there's a maintenance cost AND payment status is 'paid'
  if (costMain > 0 && payStatus === 'paid') { // Add payStatus condition
    if (claimStatus === 'yes' && claimAmt > 0) {
      // If claimed status is 'yes', add the difference amount
      const diff = costMain - claimAmt;
      return sum + (diff > 0 ? diff : 0);
    } else if (claimStatus === 'no' || !claimStatus || claimAmt === 0) {
      // If claimed status is 'no' or not set, add the full maintenance cost
      return sum + costMain;
    }
  }
  return sum;
}, 0);
  const taxTotal = allRecordsForVehicle.reduce((sum, record) => sum + parseFloat(record.COST || 0), 0);
                const claimedTotal = allRecordsForVehicle.reduce((sum, record) => sum + parseFloat(record.CLAIM_AMT || 0), 0);
                
                  const scrapTotal = allRecordsForVehicle.reduce((sum, record) => sum + parseFloat(record.STAT_AMT || 0), 0);
                const grandTotal = insuranceTotal + challanTotal + fasttagTotal + maintenanceTotal +taxTotal;

                // Count records
                const insuranceCount = allRecordsForVehicle.filter(record => record.AMT && parseFloat(record.AMT) > 0).length;
                const challanCount = allRecordsForVehicle.filter(record => record.CHALLAN_AMT && parseFloat(record.CHALLAN_AMT) > 0).length;
                const fasttagCount = allRecordsForVehicle.filter(record => record.FAST_AMT && parseFloat(record.FAST_AMT) > 0).length;
      // Find this section and replace it:
const maintenanceCount = allRecordsForVehicle.filter(record => {
  const costMain = parseFloat(record.COST_MAIN || 0);
  const claimAmt = parseFloat(record.CLAIM_AMT || 0);
  const claimStatus = record.CLAIM_STATUS?.toLowerCase();
  const payStatus = record.PAY_STATUS?.toLowerCase(); // Add this line

  if (costMain > 0 && payStatus === 'paid') { // Add payStatus condition
    if (claimStatus === 'yes' && claimAmt > 0) {
      const diff = costMain - claimAmt;
      return diff > 0;
    } else if (claimStatus === 'no' || !claimStatus || claimAmt === 0) {
      return true;
    }
  }
  return false;
}).length;
  const taxCount = allRecordsForVehicle.filter(record => record.COST && parseFloat(record.COST) > 0).length;

                const claimedCount = allRecordsForVehicle.filter(record => record.CLAIM_AMT && parseFloat(record.CLAIM_AMT) > 0).length;
   const scrapCount = allRecordsForVehicle.filter(record => record.STAT_AMT && parseFloat(record.STAT_AMT) > 0).length;
                return (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {/* Summary Cards Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                      {/* Insurance */}
                      <Box sx={{
                        flex: 1,
                        minWidth: '150px',
                        border: '3px solid #2196f3',
                        borderRadius: '12px',
                        p: 2,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-5px) scale(1.05)',
                          boxShadow: '0 10px 25px rgba(33, 150, 243, 0.4)',
                          background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
                          color: 'white',
                          '& .MuiTypography-root': {
                            color: 'white'
                          }
                        },
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s',
                        },
                        '&:hover:before': {
                          left: '100%',
                        }
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2196f3', mb: 1 }}>
                          🛡️ INSURANCE
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {insuranceCount}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                          ₹{insuranceTotal.toFixed(2)}
                        </Typography>
                      </Box>

                      {/* Challan */}
                      <Box sx={{
                        flex: 1,
                        minWidth: '150px',
                        border: '3px solid #f44336',
                        borderRadius: '12px',
                        p: 2,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-5px) scale(1.05)',
                          boxShadow: '0 10px 25px rgba(244, 67, 54, 0.4)',
                          background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
                          color: 'white',
                          '& .MuiTypography-root': {
                            color: 'white'
                          }
                        },
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s',
                        },
                        '&:hover:before': {
                          left: '100%',
                        }
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f44336', mb: 1 }}>
                          🚫 CHALLAN
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {challanCount}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                          ₹{challanTotal.toFixed(2)}
                        </Typography>
                      </Box>

                      {/* FastTag */}
                      <Box sx={{
                        flex: 1,
                        minWidth: '150px',
                        border: '3px solid #4caf50',
                        borderRadius: '12px',
                        p: 2,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-5px) scale(1.05)',
                          boxShadow: '0 10px 25px rgba(76, 175, 80, 0.4)',
                          background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                          color: 'white',
                          '& .MuiTypography-root': {
                            color: 'white'
                          }
                        },
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s',
                        },
                        '&:hover:before': {
                          left: '100%',
                        }
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50', mb: 1 }}>
                          🏷️ FASTTAG
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {fasttagCount}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                          ₹{fasttagTotal.toFixed(2)}
                        </Typography>
                      </Box>

                      {/* Maintenance */}
                      <Box sx={{
                        flex: 1,
                        minWidth: '150px',
                        border: '3px solid #ff9800',
                        borderRadius: '12px',
                        p: 2,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-5px) scale(1.05)',
                          boxShadow: '0 10px 25px rgba(255, 152, 0, 0.4)',
                          background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                          color: 'white',
                          '& .MuiTypography-root': {
                            color: 'white'
                          }
                        },
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s',
                        },
                        '&:hover:before': {
                          left: '100%',
                        }
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff9800', mb: 1 }}>
                          🔧 MAINTENANCE
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {maintenanceCount}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                          ₹{maintenanceTotal.toFixed(2)}
                        </Typography>
                      </Box>
  {/* road tax */}
                      <Box sx={{
                        flex: 1,
                        minWidth: '150px',
                        border: '3px solid #00f7ffff',
                        borderRadius: '12px',
                        p: 2,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #fff3e0 0%, #02ffe1ff 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-5px) scale(1.05)',
                          boxShadow: '0 10px 25px rgba(0, 157, 255, 0.4)',
                          background: 'linear-gradient(135deg, #00f2ffff 0%, #4dc7ffff 100%)',
                          color: 'white',
                          '& .MuiTypography-root': {
                            color: 'white'
                          }
                        },
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s',
                        },
                        '&:hover:before': {
                          left: '100%',
                        }
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#02865eff', mb: 1 }}>
                          🚗 ROAD TAX
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {taxCount}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#5ac4c4ff', fontWeight: 'bold' }}>
                          ₹{taxTotal.toFixed(2)}
                        </Typography>
                      </Box>

                      {/* scrap/sold */}
                      <Box sx={{
                        flex: 1,
                        minWidth: '150px',
                        border: '3px solid #ea58b5ff',
                        borderRadius: '12px',
                        p: 2,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-5px) scale(1.05)',
                          boxShadow: '0 10px 25px rgba(176, 39, 151, 0.4)',
                          background: 'linear-gradient(135deg, #b0277bff 0%, #c868a5ff 100%)',
                          color: 'white',
                          '& .MuiTypography-root': {
                            color: 'white'
                          }
                        },
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s',
                        },
                        '&:hover:before': {
                          left: '100%',
                        }
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#b02762ff', mb: 1 }}>
                          💸 SCRAP/SOLD
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {scrapCount}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                          ₹{scrapTotal.toFixed(2)}
                        </Typography>
                      </Box>


                      {/* Claimed */}
                      <Box sx={{
                        flex: 1,
                        minWidth: '150px',
                        border: '3px solid #9c27b0',
                        borderRadius: '12px',
                        p: 2,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-5px) scale(1.05)',
                          boxShadow: '0 10px 25px rgba(156, 39, 176, 0.4)',
                          background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                          color: 'white',
                          '& .MuiTypography-root': {
                            color: 'white'
                          }
                        },
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s',
                        },
                        '&:hover:before': {
                          left: '100%',
                        }
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#9c27b0', mb: 1 }}>
                          💸 CLAIMED
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {claimedCount}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                          ₹{claimedTotal.toFixed(2)}
                        </Typography>
                      </Box>

                    </Box>
                    
                    

                    {/* Grand Total */}
                    <Box sx={{
                      mt: 3,
                      p: 3,
                      border: '4px solid #673ab7',
                      borderRadius: '16px',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg,rgb(50, 66, 236) 0%,rgb(11, 125, 192) 25%,rgb(133, 12, 167) 50%,rgb(225, 105, 236) 75%,rgb(26, 157, 14) 100%)',
                      backgroundSize: '400% 400%',
                      animation: 'gradientMove 4s ease infinite',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 15px 35px rgba(103, 58, 183, 0.5)',
                        '&:before': {
                          opacity: 1,
                        }
                      },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      },
                      '@keyframes gradientMove': {
                        '0%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                        '100%': { backgroundPosition: '0% 50%' },
                      }
                    }}>
                      <Typography variant="h5" sx={{
                        fontWeight: 'bold',
                        mb: 2,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        position: 'relative',
                        zIndex: 1
                      }}>
                        🏆 GRAND TOTAL
                      </Typography>
                      <Typography variant="h4" sx={{
                        fontWeight: 'bold',
                        textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
                        position: 'relative',
                        zIndex: 1,
                        color: '#ffd700'
                      }}>
                        ₹{grandTotal.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" sx={{
                        mt: 1,
                        opacity: 0.9,
                        position: 'relative',
                        zIndex: 1
                      }}>
                        Total Records: {allRecordsForVehicle.length}
                      </Typography>

                      {/* Note */}
                      <Typography variant="caption" sx={{
                        mt: 1,
                        display: 'block',
                        color: 'white',
                        textAlign: 'center',
                        fontStyle: 'italic'
                      }}>
                        (*Total amount includes Insurance amt, Challan amt, Fastag amt, Road tax and Maintenance charges.*)
                      </Typography>
                    </Box> </Box>
                );
              })()}
            </Box>


          </Box>
        </Box>
      </Modal>
    );
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
      minWidth: 80,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'VH_COMPANY',
      headerName: 'VEHICLE COMPANY',
      flex: 1.2,
      minWidth: 120,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'VH_MODEL',
      headerName: 'VEHICLE MODEL',
      flex: 1.2,
      minWidth: 120,
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
      field: 'COMP_PLANT',
      headerName: 'COM & PLANT',
      flex: 1,
      minWidth: 140,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center'
    },
    // Add this column after the STATUS column in your columns array
    {
      field: 'TOTAL',
      headerName: 'TOTAL',
      flex: 1,
      minWidth: 120,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // Get all records for this vehicle
        const vehicleRecords = data.filter(record => record.VH_NUMBER === params.row.VH_NUMBER);

        // Calculate totals from all records
        const insuranceTotal = vehicleRecords.reduce((sum, record) => sum + parseFloat(record.AMT || 0), 0);
        const challanTotal = vehicleRecords.reduce((sum, record) => sum + parseFloat(record.CHALLAN_AMT || 0), 0);
        const fasttagTotal = vehicleRecords.reduce((sum, record) => sum + parseFloat(record.FAST_AMT || 0), 0);
 // In the TOTAL column renderCell function, find and replace this section:
const maintenanceTotal = vehicleRecords.reduce((sum, record) => {
  const costMain = parseFloat(record.COST_MAIN || 0);
  const claimAmt = parseFloat(record.CLAIM_AMT || 0);
  const claimStatus = record.CLAIM_STATUS?.toLowerCase();
  const payStatus = record.PAY_STATUS?.toLowerCase(); // Add this line

  // Only calculate if there's a maintenance cost AND payment status is 'paid'
  if (costMain > 0 && payStatus === 'paid') { // Add payStatus condition
    if (claimStatus === 'yes' && claimAmt > 0) {
      // If claimed status is 'yes', add the difference amount
      const diff = costMain - claimAmt;
      return sum + (diff > 0 ? diff : 0);
    } else if (claimStatus === 'no' || !claimStatus || claimAmt === 0) {
      // If claimed status is 'no' or not set, add the full maintenance cost
      return sum + costMain;
    }
  }
  return sum;
}, 0);
const taxTotal = allRecordsForVehicle.reduce((sum, record) => sum + parseFloat(record.COST || 0), 0);
        const claimedTotal = vehicleRecords.reduce((sum, record) => sum + parseFloat(record.CLAIM_AMT || 0), 0);

        const grandTotal = insuranceTotal + challanTotal + fasttagTotal + maintenanceTotal +taxTotal;

        return (
          <span style={{
            fontWeight: 'bold',
            color: '#1976d2'
          }}>
            ₹{grandTotal.toFixed(2)}
          </span>
        );
      }
    },

   {
  field: 'STATUS',
  headerName: 'STATUS',
  flex: 1,
  minWidth: 120,
  headerClassName: 'header-style',
  headerAlign: 'center',
  align: 'center',
  renderCell: (params) => {
    // Get all records for this vehicle from the original data
    const vehicleRecords = data.filter(record => record.VH_NUMBER === params.row.VH_NUMBER);
    
    // Check if any record has 'Scrap' or 'Sold' status (case insensitive)
    const hasInactiveStatus = vehicleRecords.some(record => {
      const status = record.INS_STATUS?.toLowerCase();
      return status === 'scrap' || status === 'sold';
    });

    if (hasInactiveStatus) {
      return (
        <span style={{
          color: 'red',
          fontWeight: 'bold'
        }}>
          INACTIVE
        </span>
      );
    } else {
      return (
        <span style={{
          color: 'green',
          fontWeight: 'bold'
        }}>
          ACTIVE
        </span>
      );
    }
  }
},

    {
      field: 'ACTION',
      headerName: 'ACTION',
      flex: 1,
      minWidth: 100,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleEdit(params.row)}
          sx={{
            minWidth: '70px',
            height: '28px',
            fontSize: '11px',
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
            borderRadius: '4px',
            textTransform: 'none',
            fontWeight: 'bold'
          }}
          startIcon={<EditIcon sx={{ fontSize: '14px' }} />}
        >
          Open
        </Button>
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
                  <h1 className="text-xl font-bold text-white">Four Wheeler Vehicle History</h1>
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

<Box sx={{
                mb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative'
              }}>
               

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    onClick={exportAllVehiclesToExcel}
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    sx={{
                      backgroundColor: '#4caf50',
                      '&:hover': {
                        backgroundColor: '#45a049',
                        transform: 'scale(1.05)',
                      },
                      borderRadius: '8px',
                      px: 3,
                      py: 1,
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      textTransform: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    Export All Vehicles Data
                  </Button>
                </Box>

              </Box>
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

      {/* Modal Component */}
      <VehicleDetailsModal />
    </div>
  );
};

export default Fourhistory;