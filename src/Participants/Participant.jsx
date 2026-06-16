import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Paper, Modal, IconButton, Typography, Button, CircularProgress, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "sweetalert2/dist/sweetalert2.min.css";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Doughnut } from "react-chartjs-2";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaChartPie, } from "react-icons/fa";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend, } from "chart.js";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { API_BASE_URL, API_HRM_PROCESS } from "../Config";
import useCombinedStats from "../hooks/useCombinedStats"; // Import the hook
import IndentFlowDetails from "../Components/IndentFlowDetails";
import MMAssetFlowDetails from "../Components/Participants_Flow/MMAssetFlowDetails.jsx";
import ScrapSaleFlowDetails from "../Components/Participants_Flow/ScrapSaleFlowDetails.jsx";
import StockTransferFlowDetails from "../Components/Participants_Flow/StockTransferFlowDetails.jsx";
import ScrapSaleActionView from "../Components/Participants_Flow/ScrapSaleActionView.jsx";
import IndentActionView from "../Components/Participants_Flow/IndentActionView.jsx";
import StockTransferActionView from "../Components/Participants_Flow/StockTransferActionView.jsx";
import MatMasterFlowDetails from "../Components/Participants_Flow/MatMasterFlowDetails.jsx";
import MatMasterActionView from "../Components/Participants_Flow/MatMasterActionView.jsx";
import MatMasterExtFlowDetails from "../Components/Participants_Flow/MatMasterExtFlowDetails.jsx";
import MatMasterExtActionView from "../Components/Participants_Flow/MatMasterExtActionView.jsx";
import SerCodeCreationFlowDetails from "../Components/Participants_Flow/SerCodeCreationFlowDetails.jsx";
import SerCodeCreationActionView from "../Components/Participants_Flow/SerCodeCreationActionView.jsx";
// ===================== MANPOWER IMPORTS (NEW) =====================
import ManpowerFlowDetails from "../Components/Participants_Flow/ManpowerFlowDetails.jsx";
import ManpowerActionView from "../Components/Participants_Flow/ManpowerActionView.jsx";
//==============================06-04-2026======================================
import HRMActionView from "../Components/Participants_Flow/HRMActionView.jsx";
import HRMView from "../Components/Participants_Flow/HRMView.jsx";
//added by ajit 15042026
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { Trash2 } from "lucide-react";
// =================================================================
ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const Participant = () => {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
//added 15042026 by ajit
 const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  
  const [flowData, setFlowData] = useState(null);
  const [flowLoading, setFlowLoading] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [userToken] = useState(
    () => JSON.parse(localStorage.getItem("userInfo")) || {},
  );

  // Use the combined stats hook
  const { combinedStats, refetch: refetchCombinedStats } =
    useCombinedStats(userToken);

  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Keep backend connection from first code
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}participants`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${userToken.token}`,
          },
        });

        const data = response.data.participantData;
        console.log(Array.isArray(data));
        setData(Array.isArray(data) ? data : []);

        // Refetch combined stats when data changes
        refetchCombinedStats();
      } catch (error) {
        console.error("Error fetching participant data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!userToken.token) navigate("/");
  }, [navigate, userToken?.token]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  // Fetch flow data based on case ID
  const fetchFlowData = async (caseId, processName) => {
    setFlowLoading(true);

    const name = processName?.trim(); // ← trims hidden spaces
    let apiPath = "";

    if (name === "Stationary") apiPath = `stationary/${caseId}`;
    else if (name === "Indent") apiPath = `indent/${caseId}`;
    else if (name === "MM Asset Creation") apiPath = `mmasset/${caseId}`;
    else if (name === "Scrap Sale Request") apiPath = `scrapsale/${caseId}`;
    else if (name === "Stock Transfer Request") apiPath = `stocktransfer/${caseId}`;
    else if (name === "Material Master Request") apiPath = `matmaster_request/${caseId}`;
    else if (name === "Material Master Extension") apiPath = `matmaster_extension/${caseId}`;
    else if (name === "Service Code Request") apiPath = `servcode_request/${caseId}`;
    // ===================== MANPOWER API PATH (NEW) =====================
    // PROCESSNAME stored in DB is "Manpower" (set in ManPowerController manPowerStore)
    else if (name === "Manpower") apiPath = `manpower/${caseId}`;
    
    else if (name === "HRM PROCESS") {  //---------added hrm 
      // HRM PROCESS doesn't need API call - just set loading false and return
      setFlowLoading(false);
      setFlowData(null);
      return;
    }
    // ==================================================================

    // ← GUARD: if nothing matched, log and exit early
    if (!apiPath) {
      console.error("❌ No API path matched for processName:", JSON.stringify(processName));
      setFlowLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}${apiPath}`, {
        params: { processname: name },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${userToken.token}`,
        },
      });
      console.log("✅ Flow data fetched:", response.data);
      setFlowData(response.data);
    } catch (error) {
      console.error("❌ Error fetching flow data:", error);
      console.error("❌ Response status:", error.response?.status);
      console.error("❌ Response data:", error.response?.data);
      console.error("❌ Error fetching flow data:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch case flow data",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setFlowLoading(false);
    }
  };

  // Handle modal open
  const handleOpenModal = async (rowData) => {
    console.log("📋 DETAILS clicked — CASEID:", rowData.CASEID, "| PROCESSNAME:", JSON.stringify(rowData.PROCESSNAME));
    setSelectedRowData(rowData);
    setModalOpen(true);
     //==============================06-04-2026================
    if(rowData.PROCESSNAME === "HRM PROCESS") {
    // For HRM PROCESS, just set flowLoading to false and don't fetch
    setFlowLoading(false);
    setFlowData(null);
  }
    //========================end======06-04-2026================
    if (rowData.CASEID) {
      await fetchFlowData(rowData.CASEID, rowData.PROCESSNAME);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRowData(null);
    setFlowData(null);
  };

//added by ajit 15042026
   const handleHistory = async (caseid) => {
    try {
      const response = await fetch(
        `${API_HRM_PROCESS}/mrfRevisionHstry/${caseid}`
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("HRM API DATA:", result);
  
      setHistoryData(result.mrfRvsnData);
        setHistoryOpen(true);
  
    } catch (err) {
      console.error("Fetch Error:", err);
     
  
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch HRM data'
      });
    } 
  };

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!searchText) return data;

    return data.filter((row) => {
      // Convert search text to lowercase for case-insensitive search
      const search = searchText.toLowerCase();

      // Search across all fields in the row (removed ACTION_UID, added raiser_date)
      return (
        (row.CASEID && row.CASEID.toLowerCase().includes(search)) ||
        (row.PROCESSNAME && row.PROCESSNAME.toLowerCase().includes(search)) ||
        (row.RAISER && row.RAISER.toLowerCase().includes(search)) ||
        (row.raiser_date && row.raiser_date.toLowerCase().includes(search)) ||
        (row.CURRENT_USER && row.CURRENT_USER.toLowerCase().includes(search)) ||
        (row.ACTION_STATUS && row.ACTION_STATUS.toLowerCase().includes(search))
      );
    });
  }, [data, searchText]);

  // Add dynamic serial numbers to filtered data
  const dataWithSerialNumbers = useMemo(() => {
    return filteredData.map((row, index) => ({
      ...row,
      SNO: index + 1, // Dynamic serial number starting from 1
    }));
  }, [filteredData]);

  // Use combined stats instead of local calculation
  const statusCounts = combinedStats;
  const donutData = {
    labels: ["Completed", "Pending", "Rejected"],
    datasets: [
      {
        data: [
          statusCounts.completed,
          statusCounts.pending,
          statusCounts.rejected,
        ],
        backgroundColor: ["#67AE6E", "#F5C45E", "#ef4444"],
        hoverBackgroundColor: ["#328E6E", "#E78B48", "#dc2626"],
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
        color: "white", // You can set this to the color you want
        font: {
          size: 12, // Reduced font size inside the donut
          weight: "bold",
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
      name: "Data",
      completed: statusCounts.completed,
      pending: statusCounts.pending,
      rejected: statusCounts.rejected,
    },
  ];
  const handleOpenActionModal = async (rowData) => {
    console.log("👁 DISPLAY clicked — CASEID:", rowData.CASEID, "| PROCESSNAME:", JSON.stringify(rowData.PROCESSNAME));
    setSelectedRowData(rowData);
    setActionModalOpen(true);
    if (rowData.CASEID) {
      await fetchFlowData(rowData.CASEID, rowData.PROCESSNAME);
    }
  };
  const handleCloseActionModal = () => {
    setActionModalOpen(false);
    setSelectedRowData(null);
    setFlowData(null);
  };



   const isHrmProcess = filteredData.some(
  (row) =>
    row.PROCESSNAME === 'HRM PROCESS' &&
    row.REVISION_ID &&
    row.REVISION_ID !== '00'
);
  // DataGrid columns with improved styling - FIXED TO_DO display and added Details column
  const columns = [
    { field: "SNO", headerName: "S.NO", flex: 0.5, minWidth: 80 },
    {
      field: "display",
      headerName: "DISPLAY",
      flex: 0.6,
      minWidth: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <IconButton
            size="small"
            onClick={() => handleOpenActionModal(params.row)}
            sx={{
              color: "#8e7ad5",
              padding: "4px",
              "&:hover": {
                color: "#7c68c3",
                backgroundColor: "rgba(142, 122, 213, 0.1)",
              },
            }}
          >
            <VisibilityIcon sx={{ fontSize: 18 }} />
          </IconButton>
        );
      },
    },
    {
      field: "details",
      headerName: "DETAILS",
      flex: 0.8,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleOpenModal(params.row)}
            sx={{
              backgroundColor: "#8e7ad5",
              color: "white",
              fontSize: "11px",
              padding: "4px 12px",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#7c68c3",
              },
            }}
          >
            Open
          </Button>
        );
      },
    },
//added by ajit 15042026

     {
     field: 'His',
     headerName: 'History',
     flex: 1,
     minWidth: 120,
     renderCell: (params) => {
       const caseid = params.row.CASEID;
       const processName = params.row.PROCESSNAME;
       const revisionId = params.row.REVISION_ID;
   
       // show only for HRM PROCESS and revision not 00
    if (
     processName !== 'HRM PROCESS' ||
     !revisionId ||
     revisionId === '00'
   ) {
     return null;
   }
   
       return (
         <Button
           variant="contained"
           size="small"
           onClick={() => handleHistory(caseid)}
           sx={{
             textTransform: 'none',
             fontWeight: 500,
             borderRadius: '6px',
             fontSize: '11px',
             padding: '2px 8px',
             minWidth: 'auto',
             backgroundColor: '#1976d2',
             '&:hover': {
               backgroundColor: '#115293',
             },
           }}
         >
           History
         </Button>
       );
     }
   },
     {
     field: 'CASEID',
     headerName: 'CASE ID',
     flex: 1,
     minWidth: 160,
     renderCell: (params) => {
       const processName = params.row?.PROCESSNAME?.toLowerCase();
       const caseId = params.row?.CASEID || '';
       const revId = params.row?.REVISION_ID;
   
       // only HRM process gets special formatting
       if (processName === 'hrm process') {
         if (!revId || revId === '00') {
           return caseId;
         }
         return `${caseId}_${revId}`;
       }
   
       // all other processes untouched
       return caseId;
     }
   },
    { field: "PROCESSNAME", headerName: "PROCESS", flex: 1, minWidth: 120 },
    { field: "RAISER", headerName: "RAISER", flex: 1, minWidth: 120 },
    {
      // field: "raiser_date",
      field: "raiser_date",
      headerName: "RAISER DATE",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        return formatDateToDDMMYYYY(params.value);
      },
    },
    // For received_date column:
    {
      field: "received_date",
      headerName: "RECEIVED DATE",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        return formatDateToDDMMYYYY(params.value);
      },
    },
    {
      field: "CURRENT_USER",
      headerName: "CURRENT USER",
      flex: 1.2,
      minWidth: 140,
      renderCell: (params) => {
        // Check if value is null, undefined, or an empty string
        if (!params.value || params.value.trim() === "") {
          return (
            <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
              Unassigned
            </span>
          );
        }
        return params.value;
      },
    },
    {
      field: "ACTION_STATUS",
      headerName: "ACTION STATUS",
      flex: 1.2,
      minWidth: 140,
      renderCell: (params) => {
        let color = "";
        const status = params.value?.toLowerCase();
        if (status === "pending" || status === "to_do")
          color = "#facc15"; // Yellow - Fixed case
        else if (status === "completed")
          color = "#22c55e"; // Green
        else if (status === "reject") color = "#ef4444"; // Red

        return (
          <span style={{ color, fontWeight: "bold" }}>{params.value}</span>
        );
      },
    },
  ];

  // Function to get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "completed") return "#22c55e";
    if (statusLower === "pending" || statusLower === "to_do") return "#facc15";
    if (statusLower === "reject") return "#ef4444";
    if (statusLower === "approved" || statusLower === "approve")
      return "#22c55e";
    return "inherit";
  };

  // --- STANDARD FOOTER COMPONENT ---
//   const renderStandardFooter = (data, rowData) => {
//     if (!data && !rowData) return null;

//     // ── FIX: prefer flowData.data fields (manpower request) over participant row ──
//     const curUser   = data?.CUR_USR   || rowData?.CURRENT_USER || 'UNASSIGNED';
//     const curTask   = data?.CUR_TASK  || rowData?.CUR_TASK     || 'N/A';
//     const curStatus = data?.CUR_STATUS || rowData?.ACTION_STATUS || 'Pending';

//     // ── Human-readable task label map ──
//     const taskLabelMap = {
//         'GM':        'GM (Planning & QS)',
//         'PRJ_HEAD':  'Project Head',
//         'FUNC_HEAD': 'Functional Head',
//         'SP':        'Sr. President',
//         'EVC':       'EVC',
//         'HOD':       'HO HOD',
//         'RAISER':    'Raiser',
//         'DIRECTOR':  'Director',
//         'MD':        'MD',
//         'CFO':       'CFO',
//     };
//     const curTaskLabel = taskLabelMap[curTask] || curTask;

//     return (
//         <Box sx={{
//             mt: 2,
//             border: '1px solid #ccc',
//             borderRadius: '6px',
//             p: 1.5,
//             backgroundColor: '#f0f7ff',
//             textAlign: 'center',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
//         }}>
//             <Typography variant="body2" fontWeight="bold" sx={{ fontSize: "13px" }}>
//                 Current User: <span style={{ color: '#1976d2' }}>
//                     {curUser && curUser.trim() !== "" ? curUser : "Unassigned"}
//                 </span>
//             </Typography>
//             <Typography variant="body2" sx={{ fontSize: '11px', color: '#666', mt: 0.3 }}>
//                 Current Task: <span style={{ fontWeight: 'bold' }}>{curTaskLabel}</span>
//             </Typography>
//             <Typography variant="body2" fontWeight="bold" sx={{
//                 mt: 0.8,
//                 color: getStatusColor(curStatus),
//                 fontSize: "14px",
//                 textTransform: 'uppercase'
//             }}>
//                 Status: {curStatus}
//             </Typography>
//         </Box>
//     );
// };

const renderStandardFooter = (data, rowData) => {
    if (!data && !rowData) return null;

    // 1. Get the status from the DataGrid row (The ultimate truth)
    const overallStatus = rowData?.ACTION_STATUS || data?.STATUS || 'Pending';
    
    // 2. Check if the process is finished/approved/rejected
    const isFinished = ["completed", "approved", "approve", "reject", "rejected", "closed"]
                       .includes(overallStatus.toLowerCase());

    const curUser   = data?.CUR_USR   || rowData?.CURRENT_USER || 'UNASSIGNED';
    const curTask   = data?.CUR_TASK  || rowData?.CUR_TASK     || 'N/A';

    const taskLabelMap = {
        'GM': 'GM (Planning & QS)',
        'PRJ_HEAD': 'Project Head',
        'FUNC_HEAD': 'Functional Head',
        'SP': 'Sr. President',
        'EVC': 'EVC',
        'HOD': 'HO HOD',
    };
    const curTaskLabel = taskLabelMap[curTask] || curTask;

    return (
        <Box sx={{
            mt: 2,
            border: '1px solid #ccc',
            borderRadius: '6px',
            p: 1.5,
            backgroundColor: '#f0f7ff',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
            {/* 3. ONLY show Current User/Task if the process is NOT finished */}
            {!isFinished && (
                <>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: "13px" }}>
                        Current User: <span style={{ color: '#1976d2' }}>
                            {curUser && curUser.trim() !== "" ? curUser : "Unassigned"}
                        </span>
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '11px', color: '#666', mt: 0.3 }}>
                        Current Task: <span style={{ fontWeight: 'bold' }}>{curTaskLabel}</span>
                    </Typography>
                </>
            )}

            {/* Always show the status from the dashboard row */}
            <Typography variant="body2" fontWeight="bold" sx={{
                mt: isFinished ? 0 : 0.8,
                color: getStatusColor(overallStatus),
                fontSize: "14px",
                textTransform: 'uppercase'
            }}>
                {isFinished ? "FINAL STATUS" : "STATUS"}: {overallStatus}
            </Typography>
        </Box>
    );
};

  // Updated renderFlowData function with Rai Qty and App Qty columns
  const renderFlowData = () => {
    if (flowLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "150px",
          }}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading flow data...</Typography>
        </Box>
      );
    }

    if (!flowData || !flowData.data) {
      return (
        <Typography variant="body1" sx={{ textAlign: "center", py: 3 }}>
          No flow data available
        </Typography>
      );
    }

    const data = flowData.data;

    // Helper function to filter items by approval level
    const getItemsForLevel = (level) => {
      if (!data.stationary_items) return { approved: [], reject: [] };

      return {
        approved: data.stationary_items.filter((item) => {
          const subStatus = item.sub_status?.toLowerCase();
          const storesheadStatus = item.storeshead_status?.toLowerCase();

          if (level === "hod") {
            // HOD level: show items that HOD approved (and weren't rejected by stores)
            return (
              (subStatus === "approved" || subStatus === "approve") &&
              (!storesheadStatus ||
                storesheadStatus === "approved" ||
                storesheadStatus === "approve")
            );
          } else if (level === "stores") {
            // Stores level: show items that stores approved (regardless of HOD status)
            return (
              storesheadStatus === "approved" || storesheadStatus === "approve"
            );
          }
          return [];
        }),
        reject: data.stationary_items.filter((item) => {
          const subStatus = item.sub_status?.toLowerCase();
          const storesheadStatus = item.storeshead_status?.toLowerCase();

          if (level === "hod") {
            // HOD level: show items that HOD rejected
            return subStatus === "rejected" || subStatus === "reject";
          } else if (level === "stores") {
            // Stores level: show items that stores rejected (even if HOD approved)
            return (
              storesheadStatus === "rejected" || storesheadStatus === "reject"
            );
          }
          return [];
        }),
      };
    };

    const renderApprovalStep = (
      name,
      task,
      status,
      approvalDate,
      levelItems,
    ) => (
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: "6px",
          p: 1,
          mb: 0.5,
          backgroundColor: "#c6ddf1",
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, minHeight: "100px" }}>
          {/* Left Box - Approval Details */}
          <Box
            sx={{
              flex: 0.6,
              border: "1px solid #ddd",
              borderRadius: "4px",
              p: 1,
              backgroundColor: "white",
            }}
          >
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ mb: 0.5, fontSize: "13px" }}
            >
              {name} {task ? `- ${task}` : ""}
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{
                mb: 0.5,
                color: getStatusColor(status),
                fontSize: "12px",
              }}
            >
              Status: {status}
            </Typography>
            {approvalDate && (
              <Typography
                variant="body2"
                sx={{ color: "BLACK", fontSize: "11px" }}
              >
                Date: {formatDateToDDMMYYYY(approvalDate)}
              </Typography>
            )}
          </Box>

          {/* Right Box - Items with updated columns including Rai Qty and App Qty */}
          <Box
            sx={{
              flex: 1,
              border: "1px solid #ddd",
              borderRadius: "4px",
              p: 0.8,
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Table Header with new columns */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 40px 40px 40px 50px", // Added 40px for Iss Qty
                gap: "2px",
                mb: 1,
                borderBottom: "1px solid #ddd",
                pb: 0.5,
              }}
            >
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ fontSize: "11px", color: "#333" }}
              >
                Item
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ fontSize: "10px", color: "#333", textAlign: "center" }}
              >
                Rai Qty
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ fontSize: "10px", color: "#333", textAlign: "center" }}
              >
                App Qty
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ fontSize: "10px", color: "#333", textAlign: "center" }}
              >
                Iss Qty
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ fontSize: "11px", color: "#333", textAlign: "center" }}
              >
                Status
              </Typography>
            </Box>

            {/* Table Rows */}
            <Box
              sx={{
                maxHeight: "60px",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#888",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "#555",
                  },
                },
              }}
            >
              {/* Approved Items */}
              {levelItems.approved.map((item, index) => (
                <Box
                  key={`approved-${index}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 40px 40px 40px 50px", // Added 40px for Iss Qty
                    gap: "2px",
                    py: 0.3,
                    borderBottom: "1px solid #f0f0f0",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "10px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.stationary}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "10px", textAlign: "center" }}
                  >
                    {item.quantity || item.Quantity || "-"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "10px", textAlign: "center" }}
                  >
                    {item.approved_quantity || "-"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "10px", textAlign: "center" }}
                  >
                    {item.issued_quantity || "-"}
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: "#22c55e",
                      color: "white",
                      fontSize: "8px",
                      padding: "2px 3px",
                      borderRadius: "3px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    APPROVED
                  </Box>
                </Box>
              ))}

              {/* Rejected Items */}
              {levelItems.reject.map((item, index) => (
                <Box
                  key={`reject-${index}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 40px 40px 40px 50px", // Added 40px for Iss Qty
                    gap: "2px",
                    py: 0.3,
                    borderBottom: "1px solid #f0f0f0",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "10px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.stationary}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "10px", textAlign: "center" }}
                  >
                    {item.quantity || item.Quantity || "-"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "10px", textAlign: "center" }}
                  >
                    -
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "10px", textAlign: "center" }}
                  >
                    -
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      fontSize: "8px",
                      padding: "2px 3px",
                      borderRadius: "3px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    REJECTED
                  </Box>
                </Box>
              ))}

              {/* If no items in either category */}
              {levelItems.approved.length === 0 &&
                levelItems.reject.length === 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: "40px",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "gray",
                        fontStyle: "italic",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      No items processed
                    </Typography>
                  </Box>
                )}
            </Box>
          </Box>
        </Box>
      </Box>
    );


    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {/* Raiser Information */}
        {data.name && (
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              p: 1,
              backgroundColor: "#c6ddf1",
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ color: "#1976d2", mb: 0.5, fontSize: "13px" }}
            >
              Request Raised By: {data.name}
            </Typography>
            {data.raiser_date && (
              <Typography
                variant="body2"
                sx={{ color: "black", fontSize: "12px" }}
              >
                Date: {formatDateToDDMMYYYY(data.raiser_date)}
              </Typography>
            )}
          </Box>
        )}

        {/* Down Arrow */}
        <Typography
          sx={{ fontSize: 20, textAlign: "center", color: "#1976d2", my: 0.2 }}
        >
          ↓
        </Typography>

        {/* HOD Approval Step */}
        {data.hod_name &&
          renderApprovalStep(
            data.hod_name,
            "HOD",
            data.hod_status || "Pending",
            data.hod_aprvl_date,
            getItemsForLevel("hod"),
          )}

        {/* Down Arrow */}
        {data.stores_name && (
          <Typography
            sx={{
              fontSize: 20,
              textAlign: "center",
              color: "#1976d2",
              my: 0.2,
            }}
          >
            ↓
          </Typography>
        )}

        {/* Stores Approval Step */}
        {data.stores_name &&
          renderApprovalStep(
            data.stores_name,
            "Store",
            data.stores_status || "Pending",
            data.stores_aprvl_date,
            getItemsForLevel("stores"),
          )}

        {/* Current Status */}
        {(data.current_user || data.current_status) && (
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              p: 1.5,
              backgroundColor: "#c6ddf1",
              textAlign: "center",
            }}
          >
            {data.current_user && (
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ fontSize: "13px" }}
              >
                Current User: {data.current_user}{" "}
                {data.current_task ? `- ${data.current_task}` : ""}
              </Typography>
            )}
            {data.current_status && (
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{
                  mt: 0.5,
                  color: getStatusColor(data.current_status),
                  fontSize: "13px",
                }}
              >
                Status:{" "}
                {data.current_status === "Approve"
                  ? "Completed"
                  : data.current_status?.toLowerCase() === "reject" ||
                    data.current_status?.toLowerCase() === "rejected"
                    ? "Closed"
                    : data.current_status}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  };


  const renderActionFlowData = () => {
    if (flowLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "150px",
          }}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading flow data...</Typography>
        </Box>
      );
    }

    if (selectedRowData?.PROCESSNAME === "HRM PROCESS") {

   
    return (
      <HRMView ID = {selectedRowData?.CASEID}/>
    );
  }
  
    if (!flowData || !flowData.data) {
      return (
        <Typography variant="body1" sx={{ textAlign: "center", py: 3 }}>
          No flow data available
        </Typography>
      );
    }

    // --- ADD THIS BLOCK FOR SCRAP SALE ---
    if (selectedRowData?.PROCESSNAME === "Scrap Sale Request") {
      return (
        <ScrapSaleActionView
          flowLoading={flowLoading}
          flowData={flowData}
          selectedRowData={selectedRowData}
          formatDate={formatDateToDDMMYYYY}
          getStatusColor={getStatusColor}
        />
      );
    }
    // NEW LOGIC: Use IndentActionView for Indents
    if (selectedRowData?.PROCESSNAME === "Indent") {
      return (
        <IndentActionView
          flowLoading={flowLoading}
          flowData={flowData}
          selectedRowData={selectedRowData}
          formatDate={formatDateToDDMMYYYY}
          getStatusColor={getStatusColor}
        />
      );
    }
    // NEW LOGIC: Use StockActionView for Indents
    if (selectedRowData?.PROCESSNAME === "Stock Transfer Request") {
      return (
        <StockTransferActionView
          flowLoading={flowLoading}
          flowData={flowData}
          selectedRowData={selectedRowData}
          formatDate={formatDateToDDMMYYYY}
          getStatusColor={getStatusColor}
        />
      );
    }
    //---------------Material Master Request----------
    if (selectedRowData?.PROCESSNAME === "Material Master Request") {
      return (
        <MatMasterActionView
          flowLoading={flowLoading}
          flowData={flowData}
          selectedRowData={selectedRowData}
          formatDate={formatDateToDDMMYYYY}
          getStatusColor={getStatusColor}
        />
      );
    }
    //---------------Material Master Request----------
    if (selectedRowData?.PROCESSNAME === "Material Master Extension") {
      return (
        <MatMasterExtActionView
          flowLoading={flowLoading}
          flowData={flowData}
          selectedRowData={selectedRowData}
          formatDate={formatDateToDDMMYYYY}
          getStatusColor={getStatusColor}
        />
      );
    }
    //---------------Material Master Request----------
    if (selectedRowData?.PROCESSNAME === "Service Code Request") {
      return (
        <SerCodeCreationActionView
          flowLoading={flowLoading}
          flowData={flowData}
          selectedRowData={selectedRowData}
          formatDate={formatDateToDDMMYYYY}
          getStatusColor={getStatusColor}
        />
      );
    }
    // ===================== MANPOWER ACTION VIEW (NEW) =====================
    if (selectedRowData?.PROCESSNAME === "Manpower") {
      return (
        <ManpowerActionView
          flowLoading={flowLoading}
          flowData={flowData}
          selectedRowData={selectedRowData}
          formatDate={formatDateToDDMMYYYY}
          getStatusColor={getStatusColor}
        />
      );
    }
    // =====================================================================

    const data = flowData.data;

    // Helper function to get status color - FIXED VERSION
    const getStatusColorForModal = (status) => {
      if (!status) return "#666";
      const statusLower = status.toLowerCase();

      // Completed/Approved statuses - GREEN
      if (
        statusLower === "completed" ||
        statusLower === "approved" ||
        statusLower === "approve"
      ) {
        return "#22c55e";
      }
      // Pending/To Do statuses - YELLOW
      if (statusLower === "pending" || statusLower === "to_do") {
        return "#facc15";
      }
      // Rejected statuses - RED
      if (statusLower === "reject" || statusLower === "rejected") {
        return "#ef4444";
      }
      // Default for unknown statuses
      return "#666";
    };

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Basic Information Card */}
        <Box
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            p: 2,
            backgroundColor: "#f8f9fa",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}
          >
            Request Information
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                Case ID:{" "}
                <span style={{ fontWeight: "normal" }}>
                  {selectedRowData?.CASEID}
                </span>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "#333", mt: 1 }}
              >
                Process:{" "}
                <span style={{ fontWeight: "normal" }}>
                  {selectedRowData?.PROCESSNAME}
                </span>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "#333", mt: 1 }}
              >
                Raiser:{" "}
                <span style={{ fontWeight: "normal" }}>{data.name}</span>
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                Department:{" "}
                <span style={{ fontWeight: "normal" }}>{data.department}</span>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "#333", mt: 1 }}
              >
                Request Date:{" "}
                <span style={{ fontWeight: "normal" }}>
                  {formatDateToDDMMYYYY(data.raiser_date)}
                </span>
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "#333", mt: 1 }}
              >
                Request For:{" "}
                <span style={{ fontWeight: "normal" }}>{data.request_for}</span>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Items Requested with Rai Qty and App Qty columns */}
        <Box
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            p: 2,
            backgroundColor: "#f8f9fa",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}
          >
            Items Requested
          </Typography>
          <Box
            sx={{
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            {/* Table Header with new columns */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 60px 60px 60px", // Changed from '1fr 80px 80px' - reduced width, added Iss Qty
                gap: 1,
                p: 1,
                backgroundColor: "#e3f2fd",
                borderBottom: "1px solid #ddd",
                fontWeight: "bold",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", fontSize: "12px" }}
              >
                Item Name
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: "11px",
                }}
              >
                Rai Qty
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: "11px",
                }}
              >
                App Qty
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: "11px",
                }}
              >
                Iss Qty
              </Typography>
            </Box>

            {/* Table Rows with new columns */}
            {data.stationary_items &&
              data.stationary_items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 60px 60px 60px", // Changed from '1fr 80px 80px'
                    gap: 1,
                    p: 1,
                    borderBottom:
                      index < data.stationary_items.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                    backgroundColor: index % 2 === 0 ? "white" : "#fafafa",
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: "11px" }}>
                    {item.stationary}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", fontSize: "11px" }}
                  >
                    {item.quantity || item.Quantity || "-"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", fontSize: "11px" }}
                  >
                    {item.approved_quantity || "-"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", fontSize: "11px" }}
                  >
                    {item.issued_quantity || "-"}
                  </Typography>
                </Box>
              ))}
          </Box>
        </Box>

        {/* Approval Flow */}
        <Box
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            p: 2,
            backgroundColor: "#f8f9fa",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}
          >
            Approval Flow
          </Typography>

          {/* HOD Approval */}
          {data.hod_name && (
            <Box
              sx={{
                border: "1px solid #ddd",
                borderRadius: "6px",
                p: 2,
                mb: 2,
                backgroundColor: "white",
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
                HOD Approval - {data.hod_name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: getStatusColorForModal(data.hod_status), // USING FIXED FUNCTION
                  fontWeight: "bold",
                  mb: 1,
                }}
              >
                Status: {data.hod_status || "Pending"}
              </Typography>
              {data.hod_aprvl_date && (
                <Typography
                  variant="body2"
                  sx={{ color: "#666", fontSize: "12px" }}
                >
                  Date: {formatDateToDDMMYYYY(data.hod_aprvl_date)}
                </Typography>
              )}
            </Box>
          )}

          {/* Stores Approval */}
          {data.stores_name && (
            <Box
              sx={{
                border: "1px solid #ddd",
                borderRadius: "6px",
                p: 2,
                mb: 2,
                backgroundColor: "white",
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
                Stores Approval - {data.stores_name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: getStatusColorForModal(data.stores_status), // USING FIXED FUNCTION
                  fontWeight: "bold",
                  mb: 1,
                }}
              >
                Status: {data.stores_status || "Pending"}
              </Typography>
              {data.stores_aprvl_date && (
                <Typography
                  variant="body2"
                  sx={{ color: "#666", fontSize: "12px" }}
                >
                  Date: {formatDateToDDMMYYYY(data.stores_aprvl_date)}
                </Typography>
              )}
            </Box>
          )}

          {/* Current Status - FIXED COLOR LOGIC */}
          <Box
            sx={{
              border: "1px solid #ddd",
              borderRadius: "6px",
              p: 2,
              backgroundColor: "white",
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
              Current Status
            </Typography>
            {data.current_user && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                Current User: {data.current_user}{" "}
                {data.current_task ? `- ${data.current_task}` : ""}
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{
                color: getStatusColorForModal(data.current_status), // USING FIXED FUNCTION
                fontWeight: "bold",
              }}
            >
              Status:{" "}
              {data.current_status === "Approve"
                ? "Completed"
                : data.current_status?.toLowerCase() === "reject" ||
                  data.current_status?.toLowerCase() === "rejected"
                  ? "Closed"
                  : data.current_status}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // Modal styles - INCREASED WIDTH from 55% to 75%
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "75%", // Changed from '55%' to '75%' - INCREASED WIDTH
    maxWidth: 700, // Changed from 500 to 700 - INCREASED MAX WIDTH
    bgcolor: "background.paper",
    border: "2px solid #000",
    borderRadius: "8px",
    boxShadow: 24,
    p: 1,
    maxHeight: "70vh",
    overflow: "auto",
  };

  return (
    <>
      {/* Dashboard tiles section - 4 tiles first, then doughnut chart */}
      <div
        style={{
          height: "180px",
          width: "100%",
          backgroundColor: "white",
          borderBottom: "10px solid #ddd",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          boxSizing: "border-box",
          gap: "20px",
          border: "1px solid gray",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
      >
        {/* Tile 1: Total */}
        <div
          className="tile"
          style={{
            flex: "1 1 18%",
            minWidth: "140px",
            height: "150px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "14px",
            padding: "10px",
            boxSizing: "border-box",
            color: "white",
            border: "1px solid #ccc",
            borderRadius: "12px",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: "pointer",
            backgroundColor: "#87CEEB",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              justifyContent: "flex-start",
              marginTop: "10px",
            }}
          >
            <FaChartPie size={30} />
            <div>
              <span style={{ fontWeight: "bold" }}>Total</span>
              <div
                style={{
                  backgroundColor: "white",
                  color: "black",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  marginTop: "4px",
                  width: "40px",
                }}
              >
                {statusCounts.total}
              </div>
            </div>
          </div>
        </div>

        {/* Tile 2: Completed */}
        <div
          className="tile"
          style={{
            flex: "1 1 18%",
            minWidth: "140px",
            height: "150px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "14px",
            padding: "10px",
            boxSizing: "border-box",
            color: "white",
            border: "1px solid #ccc",
            borderRadius: "12px",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: "pointer",
            backgroundColor: "#22c55e",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              justifyContent: "flex-start",
              marginTop: "10px",
            }}
          >
            <FaCheckCircle size={30} />
            <div>
              <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                Completed
              </span>
              <div
                style={{
                  backgroundColor: "white",
                  color: "black",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  marginTop: "4px",
                  width: "40px",
                }}
              >
                {statusCounts.completed}
              </div>
            </div>
          </div>
        </div>

        {/* Tile 3: Pending */}
        <div
          className="tile"
          style={{
            flex: "1 1 18%",
            minWidth: "140px",
            height: "150px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "14px",
            padding: "10px",
            boxSizing: "border-box",
            color: "black",
            border: "1px solid #ccc",
            borderRadius: "12px",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: "pointer",
            backgroundColor: "#facc15",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              justifyContent: "flex-start",
              color: "white",
              marginTop: "10px",
            }}
          >
            <FaExclamationCircle size={30} />
            <div>
              <span style={{ fontWeight: "bold" }}>Pending</span>
              <div
                style={{
                  backgroundColor: "white",
                  color: "black",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  marginTop: "4px",
                  width: "40px",
                }}
              >
                {statusCounts.pending}
              </div>
            </div>
          </div>
        </div>

        {/* Tile 4: Rejected */}
        <div
          className="tile"
          style={{
            flex: "1 1 18%",
            minWidth: "140px",
            height: "150px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "14px",
            padding: "10px",
            boxSizing: "border-box",
            color: "white",
            border: "1px solid #ccc",
            borderRadius: "12px",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: "pointer",
            backgroundColor: "#ef4444",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              justifyContent: "flex-start",
              marginTop: "10px",
            }}
          >
            <FaTimesCircle size={30} />
            <div>
              <span style={{ fontWeight: "bold" }}>Rejected</span>
              <div
                style={{
                  backgroundColor: "white",
                  color: "black",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  marginTop: "4px",
                  width: "40px",
                }}
              >
                {statusCounts.rejected}
              </div>
            </div>
          </div>
        </div>

        {/* Tile 5: Doughnut Chart - MOVED TO LAST */}
        <div
          className="tile"
          style={{
            flex: "1 1 18%",
            minWidth: "140px",
            height: "150px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "14px",
            padding: "10px",
            boxSizing: "border-box",
            color: "white",
            border: "1px solid #ccc",
            borderRadius: "12px",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: "pointer",
            backgroundColor: "#ffffff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Doughnut data={donutData} options={donutOptions} />
        </div>
      </div>

      {/* DataGrid section with improved styling */}
      <Paper
        sx={{
          width: "100%",
          padding: 2,
          border: "1px solid gray",
          borderRadius: "8px",
        }}
      >
        {/* Title and Search bar */}
        <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
          {/* Search bar (left) */}
          <Box sx={{ flex: 1, maxWidth: "400px" }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearch}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#8e7ad5" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Center title */}
          <Box
            sx={{
              flexGrow: 1,
              textAlign: "center",
              fontSize: "32px",
              fontWeight: "bold",
              background: "linear-gradient(45deg, #6a11cb, #2575fc)", // purple → blue
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "2px",
            }}
          >
            PARTICIPANTS
          </Box>

          {/* Spacer to balance right side */}
          <Box sx={{ flex: 1, maxWidth: "400px" }} />
        </Box>

        <Box
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: "10px",
          }}
        >
          <DataGrid
            rows={dataWithSerialNumbers}
            columns={columns}
            getRowId={(row) => row.CASEID}
            //added by ajit 15042026
          columnVisibilityModel={{
    His: isHrmProcess,

  }}
            
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? "even-row" : ""
            }
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 20]}
            autoHeight={false}
            rowHeight={30}
            columnHeaderHeight={30}
            sx={{
              width: "100%",
              height: "80%",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#CDC1FF",
              },
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: "#CDC1FF",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
                color: "#000",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f0f9ff",
              },
              "& .even-row": {
                backgroundColor: "#F2F2F2",
              },
              fontSize: "13px",
              color: "black",
            }}
          />
        </Box>
      </Paper>

    {/* {added by ajit 15042026} */}
<Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          }
        }}
      >
        {/* HEADER */}
        <DialogTitle sx={{ m: 0, p: 0 }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #273a66 0%, #1e3a8a 60%, #2563eb 100%)',
            px: 2.5, py: 1.6,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
              <Box
                sx={{
                  width: 46,
                  height: 36,
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.13)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Trash2 size={18} color="white" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '14.5px', color: '#fff', lineHeight: 1.2 }}>
                History
                </Typography>
                <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>
                  {historyData.length} record{historyData.length !== 1 ? 's' : ''} found
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setHistoryOpen(false)} size="small" sx={{
              color: '#fff', bgcolor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
              width: 28, height: 28,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
            }}>
              <CloseIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* BODY */}
        <DialogContent sx={{
          p: 0, bgcolor: '#f1f5f9',
          '&::-webkit-scrollbar': { width: '5px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: '6px' },
        }}>
          {historyData.length === 0 ? (
            <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 58, height: 58, borderRadius: '14px',
                background: '#e2e8f0', border: '2px dashed #cbd5e1',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
              }}>📭</Box>
              <Typography sx={{ fontWeight: 700, fontSize: '13.5px', color: '#475569' }}>No Records Found</Typography>
              <Typography sx={{ fontSize: '11.5px', color: '#94a3b8', textAlign: 'center', maxWidth: 220 }}>
                No deleted history records to display.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {historyData.map((item, index) => (
                <Box key={index} sx={{
                  borderRadius: '10px', overflow: 'hidden',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                  animation: `fadeUp 0.22s ease ${index * 0.05}s both`,
                  '@keyframes fadeUp': {
                    from: { opacity: 0, transform: 'translateY(7px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}>

                  {/* Card top strip */}
                  <Box sx={{
                    px: 1.8, py: 0.8,
                    background: '#f8fafc',
                    borderBottom: '1px solid #e9eef5',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                        Record #{index + 1}
                      </Typography>
                      <Box sx={{ width: '1px', height: 12, bgcolor: '#cbd5e1' }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.6 }}>
                      {[
                        { label: `Rev: ${item.REVISION_ID}`, label: `Previous Rev: ${item.REVISION_ID}`, bg: '#f5f3ff', border: '#ddd6fe', color: '#6d28d9' },
                      ].map(({ label, bg, border, color }) => (
                        <Chip key={label} label={label} size="small" sx={{
                          height: '19px', fontSize: '10px', fontWeight: 600,
                          bgcolor: bg, border: `1px solid ${border}`, color,
                          borderRadius: '4px', '& .MuiChip-label': { px: 0.8 },
                        }} />
                      ))}
                    </Box>
                  </Box>

                  {/* 5-col field grid */}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 0,
                    px: 0,
                  }}>
                    {
                    
              [
  { emoji: '🆔', label: 'Case ID', value: item.CASEID },
  { emoji: '👤', label: 'Raiser', value: item.RAISER },
  { emoji: '🔁', label: 'Revision ID', value: item.REVISION_ID },
  { emoji: '👨‍💼', label: '1st Approval', value: item.firstAprvl },
  { emoji: '👩‍💼', label: '2nd Approval', value: item.secondAprvl },
  { emoji: '👩‍💻', label: '3rd Approval', value: item.thridAprvl },
  {
    emoji: '📅',
    label: 'Created At',
    value: item.created_at
      ? new Date(item.created_at).toLocaleDateString('en-GB')
      : ''
  },
  {
    emoji: '⏱️',
    label: 'Updated At',
    value: item.updated_at
      ? new Date(item.updated_at).toLocaleDateString('en-GB')
      : ''
  }
]
                    
                    
                    .map(({ emoji, label, value }, i) => (
                      <Box key={label} sx={{
                        px: 1.4, py: 1.1,
                        borderRight: i % 5 !== 4 ? '1px solid #f1f5f9' : 'none',
                        borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.15s',
                        '&:hover': { bgcolor: '#f8fafc' },
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 0.4 }}>
                          <Typography sx={{ fontSize: '12px', lineHeight: 1 }}>{emoji}</Typography>
                          <Typography sx={{
                            fontSize: '9.5px', fontWeight: 700, color: '#94a3b8',
                            textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1,

                            
                          }}>{label}</Typography>
                        </Box>
                        <Typography sx={{
                          fontSize: '12px', fontWeight: 500, color: '#1e293b',
                          lineHeight: 1.35, wordBreak: 'break-word',
                          pl: '19px',
                        }}>
                          {value
                            ? value
                            : <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: '11px' }}>—</span>
                          }
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        {/* FOOTER */}
   <DialogActions
  sx={{
    px: 2,
    py: 1.2,
    bgcolor: '#fff',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}
>
  <Typography sx={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
    {historyData.length > 0
      ? `Showing ${historyData.length} record(s)`
      : 'Nothing to display'}
  </Typography>

  <Button
    onClick={() => setHistoryOpen(false)}
    variant="contained"
    startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
    sx={{
      minWidth: 95,
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'none',
      background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
      boxShadow: '0 3px 10px rgba(15,23,42,0.22)',
      px: 2,
      py: 0.75,
      '&:hover': {
        background: 'linear-gradient(135deg, #1e293b, #2563eb)',
        transform: 'translateY(-1px)',
        boxShadow: '0 5px 14px rgba(15,23,42,0.3)',
      },
    }}
  >
    Close
  </Button>
</DialogActions>
      </Dialog>
      

      {/* Modal for displaying row details with dynamic flow data */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...modalStyle,
            maxHeight: "80vh",
            overflowY: "auto",
            position: "relative",
            maxWidth: 1000
          }}
        >
          {/* Title Header */}
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{
              mb: 1,
              textAlign: "center",
              fontWeight: "bold",
              backgroundImage:
                "linear-gradient(90deg, rgb(131, 223, 239), rgb(223, 128, 217))",
              color: "white",
              padding: "6px",
              borderRadius: "6px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "14px",
              position: "relative",
            }}
          >
            Case ID: {selectedRowData?.CASEID} | Process:{" "}
            {selectedRowData?.PROCESSNAME}
            {/* Close Button moved inside header */}
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                top: "50%",
                right: "8px",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                color: "white",
                padding: "4px",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Typography>

          {/* Dynamic flow data */}
          {/* {renderFlowData()} */}
          {/* DYNAMIC RENDERER CALL */}
          {selectedRowData?.PROCESSNAME === "Indent" ? (
            <IndentFlowDetails
              flowLoading={flowLoading}
              flowData={flowData}
              formatDate={formatDateToDDMMYYYY}
              getStatusColor={getStatusColor}
            />
          ) : selectedRowData?.PROCESSNAME === "Material Master Request" ? (
            <MatMasterFlowDetails
              flowLoading={flowLoading}
              flowData={flowData}
              formatDate={formatDateToDDMMYYYY}
              getStatusColor={getStatusColor}
            />
          ) : selectedRowData?.PROCESSNAME === "Material Master Extension" ? (
            <MatMasterExtFlowDetails
              flowLoading={flowLoading}
              flowData={flowData}
              formatDate={formatDateToDDMMYYYY}
              getStatusColor={getStatusColor}
            />
          ) : selectedRowData?.PROCESSNAME === "Service Code Request" ? (
            <SerCodeCreationFlowDetails
              flowLoading={flowLoading}
              flowData={flowData}
              formatDate={formatDateToDDMMYYYY}
              getStatusColor={getStatusColor}
            />
          ) : selectedRowData?.PROCESSNAME === "MM Asset Creation" ? (
            <MMAssetFlowDetails
              flowLoading={flowLoading}
              flowData={flowData}
              formatDate={formatDateToDDMMYYYY}
              getStatusColor={getStatusColor}
            />
          ) :
            selectedRowData?.PROCESSNAME === "Scrap Sale Request" ? (
              <ScrapSaleFlowDetails
                flowLoading={flowLoading}
                flowData={flowData}
                formatDate={formatDateToDDMMYYYY}
                getStatusColor={getStatusColor}
              />
            ) :
              selectedRowData?.PROCESSNAME === "Stock Transfer Request" ? (
                <StockTransferFlowDetails
                  flowLoading={flowLoading}
                  flowData={flowData}
                  formatDate={formatDateToDDMMYYYY}
                  getStatusColor={getStatusColor}
                />
              ) :
                // ===================== MANPOWER FLOW DETAILS (NEW) =====================
                selectedRowData?.PROCESSNAME === "Manpower" ? (
                  <ManpowerFlowDetails
                    flowLoading={flowLoading}
                    flowData={flowData}
                    formatDate={formatDateToDDMMYYYY}
                    getStatusColor={getStatusColor}
                  />
                ) :selectedRowData?.PROCESSNAME === "HRM PROCESS" ? (
                  <HRMActionView caseId = {selectedRowData?.CASEID} />
                ):
                  // =======================================================================
                  (
                    renderFlowData() // This handles "Stationary"
                  )}

          {/* 👇 ADD THIS HERE */}
          {!flowLoading && flowData && selectedRowData?.PROCESSNAME !== "Stationary" && renderStandardFooter(flowData.data, selectedRowData)}
        </Box>
      </Modal>

      {/* Action Modal */}
      <Modal
        open={actionModalOpen}
        onClose={handleCloseActionModal}
        aria-labelledby="action-modal-title"
        aria-describedby="action-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            maxWidth: 800,
            maxHeight: "85vh",
            bgcolor: "background.paper",
            border: "2px solid #000",
            borderRadius: "12px",
            boxShadow: 24,
            p: 0,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Case Details - {selectedRowData?.CASEID} | Process:{" "}
              {selectedRowData?.PROCESSNAME}
            </Typography>
            <IconButton
              onClick={handleCloseActionModal}
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box
            sx={{
              p: 3,
              maxHeight: "calc(85vh - 80px)",
              overflowY: "auto",
            }}
          >
            {renderActionFlowData()}
            {/* 👇 ADD THIS HERE */}
            {!flowLoading && flowData && selectedRowData?.PROCESSNAME !== "Stationary" && renderStandardFooter(flowData.data, selectedRowData)}
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default Participant;