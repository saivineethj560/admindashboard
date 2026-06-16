import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Divider,
  Chip
} from '@mui/material';
import { API_BASE_URL, FILE_PATH } from '../Config';
import {
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  InsertDriveFile as FileIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const ViewallFastTagFiles = () => {
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

  // Enhanced file type detection
  const getFileType = (fileName, item) => {
    if (!fileName) return 'Unknown';
    
    const lowerFileName = fileName.toLowerCase();
    
    // Check filename for type indicators
    if (lowerFileName.includes('challan')) return 'Challan';
    if (lowerFileName.includes('fasttag') || lowerFileName.includes('fast_tag') || lowerFileName.includes('fast-tag')) return 'Fast Tag';
    
    // Check if this came from FAST_FILE or CHALLAN_FILE field
    if (item.FAST_FILE && fileName === item.FAST_FILE) return 'Fast Tag';
    if (item.CHALLAN_FILE && fileName === item.CHALLAN_FILE) return 'Challan';
    
    // Check for other possible field indicators
    if (item.FILE_TYPE) {
      const fileType = item.FILE_TYPE.toLowerCase();
      if (fileType.includes('challan')) return 'Challan';
      if (fileType.includes('fast') || fileType.includes('tag')) return 'Fast Tag';
    }
    
    return 'Document';
  };

  // Get file type color
  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'Challan': return 'error';
      case 'Fast Tag': return 'success';
      default: return 'default';
    }
  };

  // Fetch Fast Tag/Challan Files
  const fetchFastTagFiles = async () => {
    if (!vehicleNumber) {
      setError('Vehicle number not provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching Fast Tag/Challan files for vehicle:', vehicleNumber);

      const response = await axios.get(
        `${API_BASE_URL}fast_file?vhno=${encodeURIComponent(vehicleNumber)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: 'application/json',
            Authorization: `Bearer ${userToken.token}`
          },
          timeout: 10000
        }
      );

      console.log('API Response:', response.data);

      if (response.data.status && response.data.data) {
        const responseFiles = [];
        
        // Process each item from the response
        response.data.data.forEach(item => {
          console.log('Processing item:', item); // Debug log
          
          // Check for Fast Tag files
          if (item.FAST_FILE) {
            responseFiles.push({
              fileName: item.FAST_FILE,
              filePath: item.FAST_FILE,
              vehicleNumber: item.VH_NUMBER,
              fileType: 'Fast Tag',
              fileId: item.ID || item.FILE_ID,
              uploadDate: item.UPLOAD_DATE || item.CREATED_DATE,
              originalData: item
            });
          }
          
          // Check for Challan files
          if (item.CHALLAN_FILE) {
            responseFiles.push({
              fileName: item.CHALLAN_FILE,
              filePath: item.CHALLAN_FILE,
              vehicleNumber: item.VH_NUMBER,
              fileType: 'Challan',
              fileId: item.ID || item.FILE_ID,
              uploadDate: item.UPLOAD_DATE || item.CREATED_DATE,
              originalData: item
            });
          }
          
          // Fallback: if neither FAST_FILE nor CHALLAN_FILE, but there's a generic file field
          if (!item.FAST_FILE && !item.CHALLAN_FILE) {
            // Check for other possible file fields
            const possibleFileFields = ['FILE_NAME', 'FILE_PATH', 'DOCUMENT', 'FILE'];
            let foundFile = null;
            
            for (const field of possibleFileFields) {
              if (item[field]) {
                foundFile = item[field];
                break;
              }
            }
            
            if (foundFile) {
              responseFiles.push({
                fileName: foundFile,
                filePath: foundFile,
                vehicleNumber: item.VH_NUMBER,
                fileType: getFileType(foundFile, item),
                fileId: item.ID || item.FILE_ID,
                uploadDate: item.UPLOAD_DATE || item.CREATED_DATE,
                originalData: item
              });
            }
          }
        });
        
        console.log('Processed files:', responseFiles); // Debug log
        
        setFiles(responseFiles);
        setError(null);
      } else {
        setFiles([]);
        setError(`No Fast Tag/Challan files found for vehicle: ${vehicleNumber}`);
      }

    } catch (error) {
      console.error('Error fetching Fast Tag/Challan files:', error);
      if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else if (error.response?.status === 401) {
        setError('Unauthorized access. Please login again.');
      } else if (error.response?.status === 404) {
        setError(`No files found for vehicle: ${vehicleNumber}`);
      } else {
        setError(error.response?.data?.message || 'Failed to fetch Fast Tag/Challan files');
      }
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFastTagFiles();
  }, [vehicleNumber]);

  // Enhanced file view function
  // const handleFileView = async (file) => {
  //   const filePath = file.filePath || file.fileName;
    
  //   if (!filePath) {
  //     alert('No file path provided');
  //     return;
  //   }

  //   console.log('Attempting to view file:', filePath);

  //   try {
  //     // Method 1: Try with authorization header first
  //     const response = await axios.get(
  //       `http://172.20.0.9/laravel/myhomedashboard/api/view-file/${encodeURIComponent(filePath)}`,
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
  //           `http://172.20.0.9/laravel/myhomedashboard/api/view-fastchallan-file/${encodeURIComponent(filePath)}`,
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
          
  //         // Method 3: Try with file ID if available
  //         if (file.fileId) {
  //           try {
  //             const response3 = await axios.get(
  //               `http://172.20.0.9/laravel/myhomedashboard/api/view-fastchallan-file/${file.fileId}`,
  //               {
  //                 headers: {
  //                   Authorization: `Bearer ${userToken?.token || ''}`
  //                 },
  //                 responseType: 'blob',
  //                 timeout: 15000
  //               }
  //             );
              
  //             const contentType = response3.headers['content-type'] || 'application/pdf';
  //             const blob = new Blob([response3.data], { type: contentType });
  //             const url = window.URL.createObjectURL(blob);
              
  //             const newWindow = window.open(url, '_blank');
              
  //             if (!newWindow) {
  //               const link = document.createElement('a');
  //               link.href = url;
  //               link.download = filePath.split('/').pop() || `file_${Date.now()}.pdf`;
  //               link.target = '_blank';
  //               document.body.appendChild(link);
  //               link.click();
  //               document.body.removeChild(link);
  //             }
              
  //             setTimeout(() => window.URL.revokeObjectURL(url), 5000);
  //             return;
              
  //           } catch (error3) {
  //             console.error('Third attempt also failed:', error3);
  //           }
  //         }
          
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
const handleFileView = (file) => {
   const filePath = file.filePath || file.fileName;
      if (!filePath) {
        alert('No file path provided');
        return;
      }
       else if (filePath) {
      const url = `${FILE_PATH}public/storage/${filePath}`;
      window.open(url, '_blank');
      }
    };

  const handleFileDownload = async (file) => {
    if (!file.filePath && !file.fileId) {
      alert('No file identifier provided');
      return;
    }

    // You can implement download logic here if needed
    console.log('Download functionality not implemented yet');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
        <Typography variant="h6" ml={2}>Loading Fast Tag/Challan files...</Typography>
      </Box>
    );
  }

  // Group files by type for better display
  const fastTagFiles = files.filter(file => file.fileType === 'Fast Tag');
  const challanFiles = files.filter(file => file.fileType === 'Challan');
  const otherFiles = files.filter(file => file.fileType !== 'Fast Tag' && file.fileType !== 'Challan');

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
                    Fast Tag / Challan Files - {vehicleNumber}
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
                  No Fast Tag / Challan Files Found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  No Fast Tag or Challan files are available for vehicle: <strong>{vehicleNumber}</strong>
                </Typography>
              </Paper>
            ) : (
              <Box>
                {/* Summary */}
                

                <Grid container spacing={3}>
                  {files.map((file, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Card
                        elevation={2}
                        sx={{
                          height: '200px',
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
                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                              {file.fileName || `File ${index + 1}`}
                            </Typography>
                          </Box>

                          <Chip
                            label={file.fileType}
                            color={getFileTypeColor(file.fileType)}
                            size="small"
                            sx={{ mb: 1 }}
                          />

                          <Divider sx={{ my: 1 }} />

                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Vehicle:</strong> {file.vehicleNumber || vehicleNumber}
                          </Typography>

                          {file.uploadDate && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              <CalendarIcon sx={{ fontSize: 14, mr: 0.5 }} />
                              {formatDate(file.uploadDate)}
                            </Typography>
                          )}
                        </CardContent>

                        <CardActions sx={{ justifyContent: 'space-between', pt: 0.5, pb: 1, px: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleFileView(file)}
                            sx={{
                              backgroundColor: '#4682A9',
                              '&:hover': {
                                backgroundColor: '#3a6b8a'
                              },
                              flex: 1,
                              mr: 0.5
                            }}
                          >
                            View
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewallFastTagFiles;