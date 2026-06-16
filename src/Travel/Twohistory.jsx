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


const Twohistory = () => {
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
      // Get all records for this vehicle
      const vehicleRecords = data.filter(record => record.VH_NUMBER === row.VH_NUMBER);
      
      // Sort records by date to get the latest one (you might need to adjust this based on your date field)
      // Assuming you have a date field like 'updated_at', 'created_at', or 'REG_DT'
      const sortedRecords = vehicleRecords.sort((a, b) => {
        // Replace 'updated_at' with your actual date field name
        const dateA = new Date(a.updated_at || a.created_at || a.REG_DT || 0);
        const dateB = new Date(b.updated_at || b.created_at || b.REG_DT || 0);
        return dateB - dateA; // Latest first
      });
      
      // Get the latest record
      const latestRecord = sortedRecords[0];
      
      // Determine display status based on latest record's STATUS
      const latestStatus = latestRecord?.STATUS?.toLowerCase();
      let displayStatus = 'ACTIVE'; // Default
      
      if (latestStatus === 'scrap' || latestStatus === 'sold') {
        displayStatus = 'INACTIVE';
      } else if (latestStatus === 'active') {
        displayStatus = 'ACTIVE';
      } else {
        // For any other status, you can decide what to show
        displayStatus = latestStatus ? latestStatus.toUpperCase() : 'ACTIVE';
      }

      // Add status info to the row
      const rowWithStatus = {
        ...latestRecord,
        DISPLAY_STATUS: displayStatus,
        LATEST_DB_STATUS: latestStatus
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
      const response = await axios.get(`${API_BASE_URL}getTwoVehicleHistoryChange`, {
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
              justifyContent: 'center',
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

            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
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
                    }}>Emp<br />ID</th>
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
                    }}>STATUS<br />DATE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>INSU START<br />DATE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>INSU END<br />DATE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>INSU<br />AMT</th>
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
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>STATUS<br />AMT</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>INSU<br />FILE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>RC<br />FILE</th>
                    <th style={{
                      border: '1px solid #ddd',
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      minWidth: '100px',
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
                      }}>{formatDate(record.VALID_DT)}</td>
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
                      }}>{record.EMP_ID || '-'}</td>
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
                      }}>{record.S_DATE || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.INS_START || '-'}</td><td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.INS_END || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.INS_AMT || '-'}</td>
                      <td style={{
                        border: '1px solid #ddd',
                        padding: '12px 8px',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}>{record.STATUS || '-'}</td>

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
                      }}>
                        {record.INS_FILE ? (
                          <button
                            onClick={() => handleViewFile(record.INS_FILE, 'INS_FILE Document')}
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
                      }}>
                        {record.RC_FILE_PATH ? (
                          <button
                            onClick={() => handleViewFile(record.RC_FILE_PATH, 'RC_FILE_PATH Document')}
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
                      }}>{record.updated_at || '-'}</td>
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

                // Calculate Insurance totals - sum all INS_AMT values
                const insuranceRecords = allRecordsForVehicle.filter(record => record.INS_AMT && parseFloat(record.INS_AMT) > 0);
                const insuranceCount = insuranceRecords.length;
                const insuranceTotal = allRecordsForVehicle.reduce((sum, record) => sum + parseFloat(record.INS_AMT || 0), 0);

                // Calculate Claimed totals - sum all COST values (status amount)
                const claimedRecords = allRecordsForVehicle.filter(record => record.COST && parseFloat(record.COST) > 0);
                const claimedCount = claimedRecords.length;
                const claimedTotal = allRecordsForVehicle.reduce((sum, record) => sum + parseFloat(record.COST || 0), 0);

                // Total should be insurance amount as per your requirement
                const grandTotal = insuranceTotal;

                return (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Summary Cards Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                      {/* Insurance */}
                      <Box sx={{
                        flex: 1,
                        minWidth: '200px',
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

                      {/* Claimed */}
                      <Box sx={{
                        flex: 1,
                        minWidth: '200px',
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
                        (*Total amount includes Insurance amt only*)
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
      field: 'PUR_YEAR',
      headerName: 'PURCHASE YEAR',
      flex: 1.2,
      minWidth: 120,
      headerClassName: 'header-style',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => formatDate(params.value)
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

        const CostTotal = vehicleRecords.reduce((sum, record) => sum + parseFloat(record.COST || 0), 0);

        return (
          <span style={{
            fontWeight: 'bold',
            color: '#1976d2'
          }}>
            ₹{CostTotal.toFixed(2)}
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
    const displayStatus = params.row.DISPLAY_STATUS || 'ACTIVE';
    
    return (
      <span style={{
        color: displayStatus === 'ACTIVE' ? 'green' : 'red',
        fontWeight: 'bold'
      }}>
        {displayStatus}
      </span>
    );
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
                  <h1 className="text-xl font-bold text-white">Two Wheeler Vehicle History</h1>
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

      {/* Modal Component */}
      <VehicleDetailsModal />
    </div>
  );
};

export default Twohistory;