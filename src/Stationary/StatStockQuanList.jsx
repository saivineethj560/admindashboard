// import React, { useState, useMemo, useEffect } from 'react';
// import axios from 'axios';
// import { useLocation, useNavigate } from "react-router-dom";
// import { DataGrid } from '@mui/x-data-grid';
// import { Box, Paper, Button } from '@mui/material';
// import { TextField, InputAdornment } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import DownloadIcon from '@mui/icons-material/Download';
// import { Doughnut } from 'react-chartjs-2';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
// import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaChartPie } from 'react-icons/fa';
// import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend, } from 'chart.js';
// import { API_BASE_URL } from '../Config';

// ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

// const StatStockQuanList = () => {
//     const [searchText, setSearchText] = useState('');
//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const location = useLocation();
//     const navigate = useNavigate();
//     const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 });
//     const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});

//     // Fetch data from statstock API
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await axios.get(`${API_BASE_URL}statstock`, {
//                     headers: {
//                         "Content-Type": "application/json",
//                         Accept: "application/json",
//                         Authorization: `Bearer ${userToken.token}`
//                     }
//                 });

//                 console.log('API Response:', response.data);

//                 // Handle the response structure based on your controller
//                 let stockData = [];
//                 if (response.data.success && response.data.data) {
//                     stockData = response.data.data;
//                 } else if (Array.isArray(response.data)) {
//                     stockData = response.data;
//                 }

//                 console.log('Processed data:', stockData);
//                 setData(stockData);
//             } catch (error) {
//                 console.error("Error fetching statstock data:", error);
//                 if (error.response) {
//                     console.error("Error response:", error.response.data);
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [userToken.token]);

//     useEffect(() => {
//         if (!userToken.token) navigate('/');
//     }, [navigate, userToken?.token]);

//     const handleSearch = (e) => {
//         setSearchText(e.target.value);
//         setPaginationModel(prev => ({ ...prev, page: 0 }));
//     };

//     // Export to Excel function by pravallika on 31032026
//     const handleDownloadExcel = () => {
//         // Prepare data for Excel export
//         const exportData = filteredData.map((row, index) => ({
//             'S.NO': index + 1,
//             'ITEM CODE': row.ITEM_CODE || '-',
//             'MATERIAL': row.MAT || '',
//             'NEW INWARD QTY': row.NEW_INWARD_QUAN || 0,
//             'ISSUED QTY': row.ISSUED_QUAN || 0,
//             'BALANCE QTY': row.BAL_QUAN || 0
//         }));

//         // Create workbook and worksheet
//         const ws = XLSX.utils.json_to_sheet(exportData);
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, 'Stock Quantity Report');

//         // Generate Excel file and download
//         XLSX.writeFile(wb, `Stock_Quantity_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
//     };
//     // Filter data based on search text - Updated field names
//     const filteredData = useMemo(() => {
//         if (!searchText) return data;

//         return data.filter(row => {
//             // Convert search text to lowercase for case-insensitive search
//             const search = searchText.toLowerCase();

//             // Search across the material inventory fields with correct column names
//             return (
//                 (row.SNO && row.SNO.toString().toLowerCase().includes(search)) ||
//                 (row.MAT && row.MAT.toLowerCase().includes(search)) ||
//                 (row.NEW_INWARD_QUAN && row.NEW_INWARD_QUAN.toString().toLowerCase().includes(search)) ||
//                 (row.ISSUED_QUAN && row.ISSUED_QUAN.toString().toLowerCase().includes(search)) ||
//                 (row.BAL_QUAN && row.BAL_QUAN.toString().toLowerCase().includes(search)) ||
//                 (row.TYPE && row.TYPE.toLowerCase().includes(search))
//             );
//         });
//     }, [data, searchText]);

//     // Add dynamic row numbers to filtered data
//     const dataWithDynamicSNo = useMemo(() => {
//         return filteredData.map((row, index) => ({
//             ...row,
//             dynamicSNo: index + 1
//         }));
//     }, [filteredData]);

//     // Calculate counts based on actual data - Updated field names
//     const statusCounts = useMemo(() => {
//         const counts = {
//             total: filteredData.length,
//             inStock: 0,
//             lowStock: 0,
//             outOfStock: 0,
//             totalInward: 0,
//             totalIssued: 0,
//             totalBalance: 0
//         };

//         filteredData.forEach(row => {
//             const balance = parseInt(row.BAL_QUAN) || 0;
//             const inward = parseInt(row.NEW_INWARD_QUAN) || 0;
//             const issued = parseInt(row.ISSUED_QUAN) || 0;

//             // Calculate totals
//             counts.totalInward += inward;
//             counts.totalIssued += issued;
//             counts.totalBalance += balance;

//             // Categorize stock levels
//             if (balance === 0) {
//                 counts.outOfStock++;
//             } else if (balance <= 10) { // You can adjust this threshold
//                 counts.lowStock++;
//             } else {
//                 counts.inStock++;
//             }
//         });

//         return counts;
//     }, [filteredData]);

//     const donutData = {
//         labels: ['In Stock', 'Low Stock', 'Out of Stock'],
//         datasets: [
//             {
//                 data: [statusCounts.inStock, statusCounts.lowStock, statusCounts.outOfStock],
//                 backgroundColor: ['#22c55e', '#facc15', '#ef4444'],
//                 hoverBackgroundColor: ['#16a34a', '#eab308', '#dc2626'],
//             },
//         ],
//     };

//     const donutOptions = {
//         plugins: {
//             legend: {
//                 labels: {
//                     font: {
//                         size: 10, // Adjust the font size for legend labels
//                     },
//                 },
//             },
//             tooltip: {
//                 titleFont: { size: 10 },
//                 bodyFont: { size: 10 },
//             },
//             // Modify the labels inside the donut chart
//             datalabels: {
//                 color: 'white', // You can set this to the color you want
//                 font: {
//                     size: 12,  // Reduced font size inside the donut
//                     weight: 'bold',
//                 },
//                 formatter: (value, context) => {
//                     const label = context.chart.data.labels[context.dataIndex];
//                     return `${label}: ${value}`; // Show count with label
//                 },
//             },
//         },
//         maintainAspectRatio: false, // optional for tighter fit
//     };

//     const stackedBarData = [
//         {
//             name: 'Inventory',
//             inStock: statusCounts.inStock,
//             lowStock: statusCounts.lowStock,
//             outOfStock: statusCounts.outOfStock
//         },
//     ];

//     // DataGrid columns - Updated field names with dynamic S.NO
//     const columns = [
//         {
//             field: 'dynamicSNo',
//             headerName: 'S.NO',
//             flex: 0.5,
//             minWidth: 80
//         },
//         {
//             field: 'ITEM_CODE',
//             headerName: 'ITEM CODE',
//             flex: 1,
//             minWidth: 120,
//             renderCell: (params) => (
//                 <span style={{ fontWeight: 'bold', color: '#6a1b9a' }}>
//                     {params.value || '-'}
//                 </span>
//             )
//         },
//         {
//             field: 'MAT',
//             headerName: 'MATERIAL',
//             flex: 1.5,
//             minWidth: 150
//         },
//         {
//             field: 'NEW_INWARD_QUAN',
//             headerName: 'NEW INWARD QTY',
//             flex: 1.2,
//             minWidth: 130,
//             renderCell: (params) => {
//                 return (
//                     <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
//                         {params.value || 0}
//                     </span>
//                 );
//             }
//         },
//         {
//             field: 'ISSUED_QUAN',
//             headerName: 'ISSUED QTY',
//             flex: 1,
//             minWidth: 120,
//             renderCell: (params) => {
//                 return (
//                     <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>
//                         {params.value || 0}
//                     </span>
//                 );
//             }
//         },
//         {
//             field: 'BAL_QUAN',
//             headerName: 'BALANCE QTY',
//             flex: 1,
//             minWidth: 120,
//             renderCell: (params) => {
//                 const value = params.value || 0;
//                 const color = value > 0 ? '#2e7d32' : value === 0 ? '#f57c00' : '#d32f2f';
//                 return (
//                     <span style={{ fontWeight: 'bold', color }}>
//                         {value}
//                     </span>
//                 );
//             }
//         },

//     ];

//     if (loading) {
//         return (
//             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
//                 <div>Loading...</div>
//             </div>
//         );
//     }

//     return (
//         <>
//             {/* Dashboard tiles section */}
//             <div
//                 style={{
//                     height: '180px',
//                     width: '100%',
//                     backgroundColor: 'white',
//                     borderBottom: '10px solid #ddd',
//                     display: 'flex',
//                     flexWrap: 'wrap',
//                     alignItems: 'center',
//                     padding: '0 16px',
//                     boxSizing: 'border-box',
//                     gap: '10px',
//                     border: '1px solid gray',
//                     borderRadius: '8px',
//                     marginBottom: '16px',
//                 }}
//             >
//                 {[...Array(7)].map((_, index) => {
//                     const tileStyle = {
//                         flex: '1 1 11.28%',
//                         minWidth: '100px',
//                         height: '150px',
//                         display: 'flex',
//                         flexDirection: 'column',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         fontSize: '14px',
//                         padding: '10px',
//                         boxSizing: 'border-box',
//                         color: 'white',
//                         border: '1px solid #ccc',
//                         borderRadius: '12px',
//                         transition: 'transform 0.2s ease, box-shadow 0.2s ease',
//                         cursor: 'pointer',
//                         backgroundColor: '#ffffff', // default white
//                         ...(index === 3 && { backgroundColor: '#87CEEB' }), // Total - sky blue
//                         ...(index === 4 && { backgroundColor: '#22c55e' }), // Completed - green
//                         ...(index === 5 && { backgroundColor: '#facc15', color: 'black' }), // Pending - yellow
//                         ...(index === 6 && { backgroundColor: '#ef4444' }), // Rejected - red
//                     };
//                     return (
//                         <div
//                             key={index}
//                             className="tile"
//                             style={tileStyle}
//                             onMouseEnter={(e) => {
//                                 e.currentTarget.style.transform = 'scale(1.03)';
//                                 e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
//                             }}
//                             onMouseLeave={(e) => {
//                                 e.currentTarget.style.transform = 'scale(1)';
//                                 e.currentTarget.style.boxShadow = 'none';
//                             }}
//                         >
//                             {index === 0 ? (
//                                 <Doughnut data={donutData} options={donutOptions} />
//                             ) : index === 1 ? (
//                                 <div
//                                     style={{
//                                         display: 'flex',
//                                         flexDirection: 'column',
//                                         justifyContent: 'space-between',
//                                         height: '100%',
//                                         width: '100%',
//                                     }}
//                                 >
//                                     <div style={{ backgroundColor: '#C68EFD', padding: '8px', border: '1px solid #ccc', color: '#000', fontSize: '10px', fontWeight: 'bold' }}>
//                                         TOTAL ITEMS: {statusCounts.total}
//                                     </div>
//                                     <div style={{ backgroundColor: '#A0C878', padding: '8px', border: '1px solid #ccc', color: '#000', fontSize: '10px', fontWeight: 'bold' }}>
//                                         IN STOCK: {statusCounts.inStock}
//                                     </div>
//                                     <div style={{ backgroundColor: '#FFF085', padding: '8px', border: '1px solid #ccc', color: '#000', fontSize: '10px', fontWeight: 'bold' }}>
//                                         LOW STOCK: {statusCounts.lowStock}
//                                     </div>
//                                     <div style={{ backgroundColor: '#FF8585', padding: '8px', border: '1px solid #ccc', color: '#000', fontSize: '10px', fontWeight: 'bold' }}>
//                                         OUT OF STOCK: {statusCounts.outOfStock}
//                                     </div>
//                                 </div>
//                             ) : index === 2 ? (
//                                 <BarChart width={50} height={150} data={stackedBarData}>
//                                     <XAxis dataKey="name" hide />
//                                     <YAxis hide />
//                                     <Tooltip />
//                                     <Bar dataKey="inStock" stackId="a" fill="#22c55e" />
//                                     <Bar dataKey="lowStock" stackId="a" fill="#facc15" />
//                                     <Bar dataKey="outOfStock" stackId="a" fill="#ef4444" />
//                                 </BarChart>
//                             ) : index === 3 ? (
//                                 <div style={{
//                                     display: 'flex',
//                                     alignItems: 'flex-start',
//                                     gap: '8px',
//                                     justifyContent: 'flex-start',
//                                     marginTop: '10px'
//                                 }}>
//                                     <FaChartPie size={30} />
//                                     <div>
//                                         <span style={{ fontWeight: 'bold' }}>Total Items</span>
//                                         <div style={{
//                                             backgroundColor: 'white',
//                                             color: 'black',
//                                             padding: '4px 8px',
//                                             borderRadius: '4px',
//                                             fontSize: '14px',
//                                             marginTop: '4px',
//                                             width: '40px'
//                                         }}>
//                                             {statusCounts.total}
//                                         </div>
//                                     </div>
//                                 </div>
//                             ) : index === 4 ? (
//                                 <div style={{
//                                     display: 'flex',
//                                     alignItems: 'flex-start',
//                                     gap: '8px',
//                                     justifyContent: 'flex-start',
//                                     marginTop: '10px'
//                                 }}>
//                                     <FaCheckCircle size={30} />
//                                     <div>
//                                         <span style={{ fontSize: '12px', fontWeight: 'bold' }}>In Stock</span>
//                                         <div style={{
//                                             backgroundColor: 'white',
//                                             color: 'black',
//                                             padding: '4px 8px',
//                                             borderRadius: '4px',
//                                             fontSize: '12px',
//                                             marginTop: '4px',
//                                             width: '40px'
//                                         }}>
//                                             {statusCounts.inStock}
//                                         </div>
//                                     </div>
//                                 </div>
//                             ) : index === 5 ? (
//                                 <div style={{
//                                     display: 'flex',
//                                     alignItems: 'flex-start',
//                                     gap: '8px',
//                                     justifyContent: 'flex-start',
//                                     color: 'white',
//                                     marginTop: '10px'
//                                 }}>
//                                     <FaExclamationCircle size={30} />
//                                     <div>
//                                         <span style={{ fontWeight: 'bold' }}>Low Stock</span>
//                                         <div style={{
//                                             backgroundColor: 'white',
//                                             color: 'black',
//                                             padding: '4px 8px',
//                                             borderRadius: '4px',
//                                             fontSize: '14px',
//                                             marginTop: '4px',
//                                             width: '40px'
//                                         }}>
//                                             {statusCounts.lowStock}
//                                         </div>
//                                     </div>
//                                 </div>
//                             ) : index === 6 ? (
//                                 <div style={{
//                                     display: 'flex',
//                                     alignItems: 'flex-start',
//                                     gap: '8px',
//                                     justifyContent: 'flex-start',
//                                     marginTop: '10px'
//                                 }}>
//                                     <FaTimesCircle size={30} />
//                                     <div>
//                                         <span style={{ fontWeight: 'bold' }}>Out of Stock</span>
//                                         <div style={{
//                                             backgroundColor: 'white',
//                                             color: 'black',
//                                             padding: '4px 8px',
//                                             borderRadius: '4px',
//                                             fontSize: '14px',
//                                             marginTop: '4px',
//                                             width: '40px'
//                                         }}>
//                                             {statusCounts.outOfStock}
//                                         </div>
//                                     </div>
//                                 </div>
//                             ) : null}
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* DataGrid section with improved styling */}
//             <Paper sx={{
//                 width: '100%',
//                 padding: 2,
//                 border: '1px solid gray',
//                 borderRadius: '8px',
//             }}>
//                 {/* Search bar */}
//                  {/* Search bar and Download button row by pravallika on 31032026*/}
//                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <Box sx={{ width: '70%' }}>
//                         <TextField
//                             variant="outlined"
//                             size="small"
//                             placeholder="Search..."
//                             value={searchText}
//                             onChange={handleSearch}
//                             InputProps={{
                                
//                                 startAdornment: (
//                                     <InputAdornment position="start">
//                                         <SearchIcon sx={{ color: '#8e7ad5' }} />
//                                     </InputAdornment>
//                                 ),
//                             }}
//                         />
//                     </Box>
//                     <Button
//                         variant="contained"
//                         startIcon={<DownloadIcon />}
//                         onClick={handleDownloadExcel}
//                         sx={{
//                             backgroundColor: '#8e7ad5',
//                             '&:hover': {
//                                 backgroundColor: '#7d6bc4',
//                             },
//                             textTransform: 'none',
//                             fontWeight: 'bold',
//                             px: 3
//                         }}
//                     >
//                         Download

//                     </Button>
//                 </Box>

//                 <Box sx={{
//                     width: '100%',
//                     height: '100%',
//                     borderRadius: '10px',
//                 }}>
//                     <DataGrid
//                         rows={dataWithDynamicSNo}
//                         columns={columns}
//                         getRowId={(row) => row.SNO ?? row.id}

//                         getRowClassName={(params) =>
//                             params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : ''
//                         }
//                         paginationModel={paginationModel}
//                         onPaginationModelChange={setPaginationModel}
//                         pageSizeOptions={[5, 10, 20]}
//                         autoHeight={false}
//                         rowHeight={30}
//                         columnHeaderHeight={30}
//                         sx={{
//                             width: '100%',
//                             height: '80%',
//                             '& .MuiDataGrid-columnHeaders': {
//                                 backgroundColor: '#CDC1FF',
//                             },
//                             '& .MuiDataGrid-columnHeader': {
//                                 backgroundColor: '#CDC1FF',
//                                 fontWeight: 'bold',
//                             },
//                             '& .MuiDataGrid-columnHeaderTitle': {
//                                 fontWeight: 'bold',
//                                 color: '#000',
//                             },
//                             '& .MuiDataGrid-row:hover': {
//                                 backgroundColor: '#f0f9ff',
//                             },
//                             '& .even-row': {
//                                 backgroundColor: '#F2F2F2',
//                             },
//                             fontSize: '13px',
//                             color: 'black',
//                         }}
//                     />
//                 </Box>
//             </Paper>

//         </>
//     );
// };

// export default StatStockQuanList;


import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import { Box, Paper, Button } from '@mui/material';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { Doughnut } from 'react-chartjs-2';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaChartPie } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend, } from 'chart.js';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../Config';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const StatStockQuanList = () => {
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 });
    const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});

    // Fetch data from statstock API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}statstock`, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${userToken.token}`
                    }
                });

                console.log('API Response:', response.data);

                // Handle the response structure based on your controller
                let stockData = [];
                if (response.data.success && response.data.data) {
                    stockData = response.data.data;
                } else if (Array.isArray(response.data)) {
                    stockData = response.data;
                }

                console.log('Processed data:', stockData);
                setData(stockData);
            } catch (error) {
                console.error("Error fetching statstock data:", error);
                if (error.response) {
                    console.error("Error response:", error.response.data);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userToken.token]);

    useEffect(() => {
        if (!userToken.token) navigate('/');
    }, [navigate, userToken?.token]);

    const handleSearch = (e) => {
        setSearchText(e.target.value);
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    // Export to Excel function
    const handleDownloadExcel = () => {
        // Prepare data for Excel export
        const exportData = filteredData.map((row, index) => ({
            'S.NO': index + 1,
            'ITEM CODE': row.ITEM_CODE || '-',
            'MATERIAL': row.MAT || '',
            'NEW INWARD QTY': row.NEW_INWARD_QUAN || 0,
            'ISSUED QTY': row.ISSUED_QUAN || 0,
            'BALANCE QTY': row.BAL_QUAN || 0
        }));

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Stock Quantity Report');

        // Generate Excel file and download
        XLSX.writeFile(wb, `Stock_Quantity_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Filter data based on search text - Updated field names
    const filteredData = useMemo(() => {
        if (!searchText) return data;

        return data.filter(row => {
            // Convert search text to lowercase for case-insensitive search
            const search = searchText.toLowerCase();

            // Search across the material inventory fields with correct column names
            return (
                (row.SNO && row.SNO.toString().toLowerCase().includes(search)) ||
                (row.MAT && row.MAT.toLowerCase().includes(search)) ||
                (row.NEW_INWARD_QUAN && row.NEW_INWARD_QUAN.toString().toLowerCase().includes(search)) ||
                (row.ISSUED_QUAN && row.ISSUED_QUAN.toString().toLowerCase().includes(search)) ||
                (row.BAL_QUAN && row.BAL_QUAN.toString().toLowerCase().includes(search)) ||
                (row.TYPE && row.TYPE.toLowerCase().includes(search))
            );
        });
    }, [data, searchText]);

    // Add dynamic row numbers to filtered data
    const dataWithDynamicSNo = useMemo(() => {
        return filteredData.map((row, index) => ({
            ...row,
            dynamicSNo: index + 1
        }));
    }, [filteredData]);

    // Calculate counts based on actual data - Updated field names
    const statusCounts = useMemo(() => {
        const counts = {
            total: filteredData.length,
            inStock: 0,
            lowStock: 0,
            outOfStock: 0,
            totalInward: 0,
            totalIssued: 0,
            totalBalance: 0
        };

        filteredData.forEach(row => {
            const balance = parseInt(row.BAL_QUAN) || 0;
            const inward = parseInt(row.NEW_INWARD_QUAN) || 0;
            const issued = parseInt(row.ISSUED_QUAN) || 0;

            // Calculate totals
            counts.totalInward += inward;
            counts.totalIssued += issued;
            counts.totalBalance += balance;

            // Categorize stock levels
            if (balance === 0) {
                counts.outOfStock++;
            } else if (balance <= 10) { // You can adjust this threshold
                counts.lowStock++;
            } else {
                counts.inStock++;
            }
        });

        return counts;
    }, [filteredData]);

    const donutData = {
        labels: ['In Stock', 'Low Stock', 'Out of Stock'],
        datasets: [
            {
                data: [statusCounts.inStock, statusCounts.lowStock, statusCounts.outOfStock],
                backgroundColor: ['#22c55e', '#facc15', '#ef4444'],
                hoverBackgroundColor: ['#16a34a', '#eab308', '#dc2626'],
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
                titleFont: { size: 10 },
                bodyFont: { size: 10 },
            },
            // Modify the labels inside the donut chart
            datalabels: {
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
        {
            name: 'Inventory',
            inStock: statusCounts.inStock,
            lowStock: statusCounts.lowStock,
            outOfStock: statusCounts.outOfStock
        },
    ];

    // DataGrid columns - Updated field names with dynamic S.NO
    const columns = [
        {
            field: 'dynamicSNo',
            headerName: 'S.NO',
            flex: 0.5,
            minWidth: 80
        },
        {
            field: 'ITEM_CODE',
            headerName: 'ITEM CODE',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <span style={{ fontWeight: 'bold', color: '#6a1b9a' }}>
                    {params.value || '-'}
                </span>
            )
        },
        {
            field: 'MAT',
            headerName: 'MATERIAL',
            flex: 1.5,
            minWidth: 150
        },
        {
            field: 'NEW_INWARD_QUAN',
            headerName: 'NEW INWARD QTY',
            flex: 1.2,
            minWidth: 130,
            renderCell: (params) => {
                return (
                    <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
                        {params.value || 0}
                    </span>
                );
            }
        },
        {
            field: 'ISSUED_QUAN',
            headerName: 'ISSUED QTY',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => {
                return (
                    <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>
                        {params.value || 0}
                    </span>
                );
            }
        },
        {
            field: 'BAL_QUAN',
            headerName: 'BALANCE QTY',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => {
                const value = params.value || 0;
                const color = value > 0 ? '#2e7d32' : value === 0 ? '#f57c00' : '#d32f2f';
                return (
                    <span style={{ fontWeight: 'bold', color }}>
                        {value}
                    </span>
                );
            }
        },

    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div>Loading...</div>
            </div>
        );
    }

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
                                        TOTAL ITEMS: {statusCounts.total}
                                    </div>
                                    <div style={{ backgroundColor: '#A0C878', padding: '8px', border: '1px solid #ccc', color: '#000', fontSize: '10px', fontWeight: 'bold' }}>
                                        IN STOCK: {statusCounts.inStock}
                                    </div>
                                    <div style={{ backgroundColor: '#FFF085', padding: '8px', border: '1px solid #ccc', color: '#000', fontSize: '10px', fontWeight: 'bold' }}>
                                        LOW STOCK: {statusCounts.lowStock}
                                    </div>
                                    <div style={{ backgroundColor: '#FF8585', padding: '8px', border: '1px solid #ccc', color: '#000', fontSize: '10px', fontWeight: 'bold' }}>
                                        OUT OF STOCK: {statusCounts.outOfStock}
                                    </div>
                                </div>
                            ) : index === 2 ? (
                                <BarChart width={50} height={150} data={stackedBarData}>
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide />
                                    <Tooltip />
                                    <Bar dataKey="inStock" stackId="a" fill="#22c55e" />
                                    <Bar dataKey="lowStock" stackId="a" fill="#facc15" />
                                    <Bar dataKey="outOfStock" stackId="a" fill="#ef4444" />
                                </BarChart>
                            ) : index === 3 ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px',
                                    justifyContent: 'flex-start',
                                    marginTop: '10px'
                                }}>
                                    <FaChartPie size={30} />
                                    <div>
                                        <span style={{ fontWeight: 'bold' }}>Total Items</span>
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
                                    <FaCheckCircle size={30} />
                                    <div>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>In Stock</span>
                                        <div style={{
                                            backgroundColor: 'white',
                                            color: 'black',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            marginTop: '4px',
                                            width: '40px'
                                        }}>
                                            {statusCounts.inStock}
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
                                    <FaExclamationCircle size={30} />
                                    <div>
                                        <span style={{ fontWeight: 'bold' }}>Low Stock</span>
                                        <div style={{
                                            backgroundColor: 'white',
                                            color: 'black',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            marginTop: '4px',
                                            width: '40px'
                                        }}>
                                            {statusCounts.lowStock}
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
                                        <span style={{ fontWeight: 'bold' }}>Out of Stock</span>
                                        <div style={{
                                            backgroundColor: 'white',
                                            color: 'black',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            marginTop: '4px',
                                            width: '40px'
                                        }}>
                                            {statusCounts.outOfStock}
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
                {/* Search bar and Download button row */}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ width: '70%' }}>
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
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadExcel}
                        sx={{
                            backgroundColor: '#8e7ad5',
                            '&:hover': {
                                backgroundColor: '#7d6bc4',
                            },
                            textTransform: 'none',
                            fontWeight: 'bold',
                            px: 3
                        }}
                    >
                        Download

                    </Button>
                </Box>

                <Box sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '10px',
                }}>
                    <DataGrid
                        rows={dataWithDynamicSNo}
                        columns={columns}
                        getRowId={(row) => row.SNO ?? row.id}

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

export default StatStockQuanList;