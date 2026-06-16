import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { API_BASE_URL, FILE_PATH } from '../Config';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  InsertDriveFile as FileIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

const ViewallIsuFiles = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});

  const { vehicleNumber } = location.state || {};

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

 // Update the fetchInsuranceFiles function
const fetchInsuranceFiles = async () => {
  if (!vehicleNumber) {
    setError('Vehicle number not provided');
    setLoading(false);
    return;
  }

  setLoading(true);
  try {
    console.log('Fetching files for vehicle:', vehicleNumber);
    
    const response = await axios.get(
      `${API_BASE_URL}insurance-files/${vehicleNumber}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: 'application/json',
          Authorization: `Bearer ${userToken.token}`
        }
      }
    );

    console.log('API Response:', response.data);

    // Handle the response properly
    const responseFiles = response.data.files || [];
    setFiles(responseFiles);
    
    if (responseFiles.length === 0) {
      setError(`No insurance files found for vehicle: ${vehicleNumber}`);
    } else {
      setError(null);
    }
    
  } catch (error) {
    console.error('Error fetching files:', error);
    setError(error.response?.data?.message || 'Failed to fetch insurance files');
    setFiles([]);
  } finally {
    setLoading(false);
  }
};

 useEffect(() => {
  console.log('ViewAll mounted with vehicleNumber:', vehicleNumber);
  console.log('Location state:', location.state);
  fetchInsuranceFiles();
}, [vehicleNumber]);

  // Update handleFileView in ViewAll
// const handleFileView = async (filePath, fileName) => {
//   if (!filePath) {
//     alert('No file path provided');
//     return;
//   }

//   try {
//     const response = await axios.get(
//       `http://172.20.0.9/laravel/myhomedashboard/api/view-file/${encodeURIComponent(filePath)}`,
//       {
//         headers: {
//           Authorization: `Bearer ${userToken?.token || ''}`
//         },
//         responseType: 'blob',
//         timeout: 10000
//       }
//     );

//     const blob = new Blob([response.data], { 
//       type: response.headers['content-type'] || 'application/pdf' 
//     });
//     const url = window.URL.createObjectURL(blob);
//     window.open(url, '_blank');

//     setTimeout(() => window.URL.revokeObjectURL(url), 5000);

//   } catch (error) {
//     console.error('Error viewing file:', error);
//     alert('Error viewing file: ' + error.message);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
        <Typography variant="h6" ml={2}>Loading insurance files...</Typography>
      </Box>
    );
  }

  return (
    <div className="py-3 px-3">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow border-2 border-blue-500 overflow-hidden">
          {/* Header */}
          <div className="p-2">
            <div className="flex justify-between items-center">
              <img src="./img.png" alt="Logo" className="mr-4 w-40 h-12 rounded-lg" />
              <div className="flex-grow flex justify-center">
                <div className="bg-[#5ea8bb] px-5 py-1.5 rounded-lg inline-block -ml-20">
                  <h1 className="text-xl font-bold text-white">
                    Insurance Files - {vehicleNumber}
                  </h1>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-white bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed] hover:from-[#c71d6f] hover:to-[#d09693] rounded-full p-1"
              >
                <ArrowBackIcon />
              </button>
            </div>
          </div>

          <div className="h-0.5 bg-blue-600 w-[95%] mx-auto"></div>

          {/* File Section */}
          <div className="p-2">
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {files.length === 0 && !error && !loading ? (
  <Paper sx={{ padding: 4, textAlign: 'center' }}>
    <FileIcon sx={{ fontSize: 80, color: 'gray', mb: 2 }} />
    <Typography variant="h6" color="textSecondary" gutterBottom>
      No Insurance Files Found
    </Typography>
    <Typography variant="body2" color="textSecondary">
      No insurance files are available for vehicle: <strong>{vehicleNumber}</strong>
    </Typography>
  </Paper>
) : (
              <Grid container spacing={3}>
                {files.map((file, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card
                      elevation={2}
                      sx={{
                        height: '150px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <FileIcon color="primary" sx={{ fontSize: 24, mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight="bold">
                            {file.fileName || `Insurance File ${index + 1}`}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Vehicle:</strong> {file.vehicleNumber || vehicleNumber}
                        </Typography>

                        {file.startDate && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <CalendarIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                            <strong>Start:</strong> {formatDate(file.startDate)}
                          </Typography>
                        )}

                        {file.endDate && (
                          <Typography variant="body2" color="text.secondary">
                            <CalendarIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                            <strong>End:</strong> {formatDate(file.endDate)}
                          </Typography>
                        )}
                      </CardContent>

                      <CardActions sx={{ justifyContent: 'center', pt: 0.5, pb: 1 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleFileView(file.filePath || file.INS_FILE, file.fileName)}
                          sx={{
                            backgroundColor: '#4682A9',
                            '&:hover': {
                              backgroundColor: '#3a6b8a'
                            }
                          }}
                        >
                          View File
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



export default ViewallIsuFiles;
