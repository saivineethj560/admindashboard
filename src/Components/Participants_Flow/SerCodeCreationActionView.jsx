// import React from "react";
// import {
//   Box,
//   Typography,
//   CircularProgress,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
// } from "@mui/material";

// // Helper: If any item in this step is approved, the whole step is "Approve" (Partial Approval)
// const getStepStatus = (items, statusKey, globalStatus) => {
//   const statuses = items.map((item) => item[statusKey]).filter(Boolean);
//   if (statuses.length === 0) return globalStatus || "PENDING";

//   // If even one item is approved, prioritize "Approve" to show it moved forward
//   if (statuses.some((s) => s.toLowerCase() === "approve")) return "Approve";
//   if (statuses.some((s) => s.toLowerCase() === "reject")) return "Reject";
  
//   return globalStatus || statuses[0];
// };

// // Helper: Find Name and Date for a step by scanning all items
// const getStepActor = (items, nameKey, dateKey, globalName, globalDate) => {
//   const actorItem = items.find(
//     (item) => item[nameKey] && item[nameKey].trim() !== "",
//   );
//   return {
//     name: globalName || (actorItem ? actorItem[nameKey] : null),
//     date: globalDate || (actorItem ? actorItem[dateKey] : null),
//   };
// };

// // Helper: Find Remarks for a step by scanning all items
// const getStepRemarks = (items, remarksKey) => {
//   const actorItem = items.find(
//     (item) => item[remarksKey] && item[remarksKey].trim() !== "",
//   );
//   return actorItem ? actorItem[remarksKey] : null;
// };

// const HeaderField = ({ label, value, valueColor = "inherit" }) => (
//   <Box sx={{ display: "flex", mb: 0.8, alignItems: "baseline" }}>
//     <Typography
//       variant="body2"
//       sx={{ width: "130px", fontWeight: "500", color: "#666", flexShrink: 0 }}
//     >
//       {label}
//     </Typography>
//     <Typography
//       variant="body2"
//       sx={{ fontWeight: "500", color: "#333", mr: 1 }}
//     >
//       :
//     </Typography>
//     <Typography
//       variant="body2"
//       sx={{ fontWeight: "600", color: valueColor, wordBreak: "break-word" }}
//     >
//       {value || "N/A"}
//     </Typography>
//   </Box>
// );

// const SerCodeCreationActionView = ({
//   flowLoading,
//   flowData,
//   selectedRowData,
//   formatDate,
//   getStatusColor,
// }) => {
//   if (flowLoading) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "150px" }}>
//         <CircularProgress />
//         <Typography sx={{ ml: 2 }}>Loading data...</Typography>
//       </Box>
//     );
//   }

//   const data = flowData?.data || {};
//   // Handle both possible item keys
//   const items = data.servcodecreation_items || data.servcodecreation_items || [];

//   // Determine the calculated overall status for the footer
//   const calculatedStatus = getStepStatus(items, "CUR_STATUS", data.current_status);
//   const isApproved = calculatedStatus?.toLowerCase() === 'approve';

//   // --- LOGIC FOR HISTORY STEPS ---
//   const approvalSteps = [
//     {
//       label: "Request Raised By",
//       name: data.name,
//       status: "SUBMITTED",
//       date: data.raiser_date,
//       remarks: null,
//     },
//     {
//       label: "Service Creator",
//       ...getStepActor(items, "SERVICE_CREATOR_NAME", "SERVICE_CREATOR_DT", data.SERVICE_CREATOR_NAME, data.SERVICE_CREATOR_DT),
//       status: getStepStatus(items, "SERVICE_CREATOR_STATUS", data.SERVICE_CREATOR_STATUS),
//       remarks: getStepRemarks(items, "SERVICE_CREATOR_REM"),
//     },
//   ].filter((step) => step.name && step.name.trim() !== "");

//    // Use values directly from selectedRowData to avoid mismatch with the main grid
//   const currentStatus = selectedRowData?.ACTION_STATUS || "Pending";
//   const currentUser = selectedRowData?.CURRENT_USER || "Unassigned";
//   const currentTask = selectedRowData?.TASK_NAME || "N/A";
  
//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
//       {/* Section 1: Request Information */}
//       <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>
//         <Box sx={{ backgroundColor: "#f0f4f8", px: 2, py: 1, borderBottom: "1px solid #e0e0e0" }}>
//           <Typography variant="subtitle2" sx={{ color: "#1976d2", fontWeight: "bold", textTransform: "uppercase" }}>
//             Material Extension Information
//           </Typography>
//         </Box>
//         <Box sx={{ p: 2, backgroundColor: "#f8f9fa", display: "flex", flexWrap: "wrap" }}>
//           <Box sx={{ flex: 1, minWidth: "280px", pr: 2, borderRight: { md: "1px solid #ddd" } }}>
//             <HeaderField label="Case ID" value={selectedRowData?.CASEID} />
//             <HeaderField label="Raiser Name" value={data.name} />
//             <HeaderField label="Department" value={data.department} />
//           </Box>
//           <Box sx={{ flex: 1, minWidth: "280px", pl: { md: 4, xs: 0 } }}>
//             <HeaderField label="Request Date" value={formatDate(data.raiser_date)} />
//             <HeaderField label="Current Task" value={data.current_task} valueColor="#1976d2" />
//             {/* <HeaderField label="Request Type" value={data.Req_Type} /> */}
//           </Box>
//         </Box>
//       </Box>

//       {/* Section 2: Items Table */}
//       <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", p: 2, backgroundColor: "#ffffff" }}>
//         <Typography variant="subtitle1" sx={{ mb: 1.5, color: "#1976d2", fontWeight: "bold" }}>
//           Requested Materials
//         </Typography>
//         <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #eee" }}>
//           <Table size="small">
//             <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
//               <TableRow>
//                 <TableCell sx={{ fontWeight: "bold", fontSize: "11px" }}>Service Category</TableCell>
//                 <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "11px" }}>UOM</TableCell>
//                 <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "11px" }}>Valuation Class</TableCell>
//                 <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "11px" }}>Mat Descp</TableCell>
//                 <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "11px" }}>Mat Grp</TableCell>
//                 <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "11px" }}>Status</TableCell>
//               </TableRow>

//             </TableHead>
//             <TableBody>
//               {items.map((item, index) => (
//                 <TableRow key={index} sx={{ "&:nth-of-type(even)": { backgroundColor: "#fafafa" } }}>
//                   <TableCell sx={{ fontSize: "10px" }}>{item.SERV_CAT}</TableCell>
//                   <TableCell align="center" sx={{ fontSize: "10px" }}>{item.UOM}</TableCell>
//                   <TableCell align="center" sx={{ fontSize: "10px" }}>{item.VALUATION_CLASS}</TableCell>
//                   <TableCell align="center" sx={{ fontSize: "10px" }}>{item.MAT_DESCP}</TableCell>
//                   <TableCell align="center" sx={{ fontSize: "10px" }}>{item.MAT_GRP}</TableCell>
//                   <TableCell align="center">
//                     <Box sx={{
//                       backgroundColor: getStatusColor(item.CUR_STATUS || item.SERVICE_CREATOR_STATUS),
//                       color: "white", fontSize: "9px", borderRadius: "4px", p: "2px 8px", display: "inline-block", fontWeight: "bold", minWidth: "70px", textAlign: "center"
//                     }}>
//                       {item.CUR_STATUS || item.SERVICE_CREATOR_STATUS || "PENDING"}
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>

//         </TableContainer>
//       </Box>

//       {/* Section 3: Status Summary */}
//       <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", p: 2, backgroundColor: "#f8f9fa" }}>
//         <Typography variant="subtitle1" sx={{ mb: 1.5, color: "#1976d2", fontWeight: "bold" }}>
//           Approval History
//         </Typography>

//         {approvalSteps.map((step, index) => (
//           <Box key={index} sx={{ p: 1, borderBottom: "1px dashed #ccc", "&:last-child": { borderBottom: "none" } }}>
//             <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <Box>
//                 <Typography variant="body2" sx={{ fontWeight: "bold" }}>{step.label}: {step.name}</Typography>
//                 {step.date && <Typography variant="caption" color="textSecondary">Processed on: {formatDate(step.date)}</Typography>}
//               </Box>
//               <Typography variant="body2" sx={{ fontWeight: "bold", color: getStatusColor(step.status) }}>
//                 {step.status}
//               </Typography>
//             </Box>
//             {step.remarks && (
//               <Box sx={{ mt: 0.5, p: 0.8, backgroundColor: "#fff", borderRadius: "4px", borderLeft: "3px solid #1976d2" }}>
//                 <Typography variant="caption" sx={{ color: "#555", fontStyle: "italic", display: "block" }}>
//                   <b>Remarks:</b> {step.remarks}
//                 </Typography>
//               </Box>
//             )}
//           </Box>
//         ))}

//         {/* Dynamic Footer Summary */}
//         <Box sx={{ 
//             mt: 2, p: 1.5, 
//             backgroundColor: currentStatus === "Completed" ? "#e8f5e9" : "#fff9c4",
//             borderRadius: "6px", 
//             border: isApproved ? "1px solid #4caf50" : "1px solid #fbc02d" 
//         }}>
//           <Typography variant="body2" sx={{ fontWeight: "bold", color: isApproved ? "#2e7d32" : "#f57f17" }}>
//             Current Summary Status:
//           </Typography>
//           <Typography variant="body2"><b>Assigned To:</b> {currentUser}</Typography>
//           <Typography variant="body2" sx={{ fontWeight: 'bold', color: getStatusColor(calculatedStatus) }}>
//             <b>Action:</b> {currentTask}
//           </Typography>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default SerCodeCreationActionView;

import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

// Helper: If any item in this step is approved, the whole step is "Approve"
const getStepStatus = (items, statusKey, globalStatus) => {
  const statuses = items.map((item) => item[statusKey]).filter(Boolean);
  if (statuses.length === 0) return globalStatus || "PENDING";
  if (statuses.some((s) => s.toLowerCase() === "approve")) return "Approve";
  if (statuses.some((s) => s.toLowerCase() === "reject")) return "Reject";
  return globalStatus || statuses[0];
};

// Helper: Find Name and Date for a step
const getStepActor = (items, nameKey, dateKey, globalName, globalDate) => {
  const actorItem = items.find((item) => item[nameKey] && item[nameKey].trim() !== "");
  return {
    name: globalName || (actorItem ? actorItem[nameKey] : null),
    date: globalDate || (actorItem ? actorItem[dateKey] : null),
  };
};

// Helper: Find Remarks
const getStepRemarks = (items, remarksKey) => {
  const actorItem = items.find((item) => item[remarksKey] && item[remarksKey].trim() !== "");
  return actorItem ? actorItem[remarksKey] : null;
};

const HeaderField = ({ label, value, valueColor = "inherit" }) => (
  <Box sx={{ display: "flex", mb: 0.8, alignItems: "baseline" }}>
    <Typography variant="body2" sx={{ width: "130px", fontWeight: "500", color: "#666", flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: "500", color: "#333", mr: 1 }}>:</Typography>
    <Typography variant="body2" sx={{ fontWeight: "600", color: valueColor, wordBreak: "break-word" }}>
      {value || "N/A"}
    </Typography>
  </Box>
);

const SerCodeCreationActionView = ({
  flowLoading,
  flowData,
  selectedRowData,
  formatDate,
  getStatusColor,
}) => {
  if (flowLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "150px" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading data...</Typography>
      </Box>
    );
  }

  const data = flowData?.data || {};
  const items = data.servcodecreation_items || [];

  // Logic for Approval History Section
  const approvalSteps = [
    {
      label: "Request Raised By",
      name: data.name,
      status: "SUBMITTED",
      date: data.raiser_date,
      remarks: null,
    },
    {
      label: "Service Creator",
      ...getStepActor(items, "SERVICE_CREATOR_NAME", "SERVICE_CREATOR_DT", data.SERVICE_CREATOR_NAME, data.SERVICE_CREATOR_DT),
      status: getStepStatus(items, "SERVICE_CREATOR_STATUS", data.SERVICE_CREATOR_STATUS),
      remarks: getStepRemarks(items, "SERVICE_CREATOR_REM"),
    },
  ].filter((step) => step.name && step.name.trim() !== "");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Section 1: Request Information */}
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>
        <Box sx={{ backgroundColor: "#f0f4f8", px: 2, py: 1, borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="subtitle2" sx={{ color: "#1976d2", fontWeight: "bold", textTransform: "uppercase" }}>
            Service Code Creation Information
          </Typography>
        </Box>
        <Box sx={{ p: 2, backgroundColor: "#f8f9fa", display: "flex", flexWrap: "wrap" }}>
          <Box sx={{ flex: 1, minWidth: "280px", pr: 2, borderRight: { md: "1px solid #ddd" } }}>
            <HeaderField label="Case ID" value={selectedRowData?.CASEID} />
            <HeaderField label="Raiser Name" value={data.name} />
            <HeaderField label="Department" value={data.department} />
          </Box>
          <Box sx={{ flex: 1, minWidth: "280px", pl: { md: 4, xs: 0 } }}>
            <HeaderField label="Request Date" value={formatDate(data.raiser_date)} />
            {/* Displaying current task from the main data object */}
            <HeaderField label="Current Task" value={data.current_task || selectedRowData?.CUR_TASK} valueColor="#1976d2" />
          </Box>
        </Box>
      </Box>

      {/* Section 2: Items Table */}
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", p: 2, backgroundColor: "#ffffff" }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5, color: "#1976d2", fontWeight: "bold" }}>
          Requested Services
        </Typography>
        <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #eee" }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", fontSize: "11px" }}>Service Category</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "11px" }}>UOM</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "11px" }}>Valuation Class</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "11px" }}>Service Descp</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "11px" }}>Service Grp</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "11px" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index} sx={{ "&:nth-of-type(even)": { backgroundColor: "#fafafa" } }}>
                  <TableCell sx={{ fontSize: "10px" }}>{item.SERV_CAT}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "10px" }}>{item.UOM}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "10px" }}>{item.VALUATION_CLASS}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "10px" }}>{item.MAT_DESCP}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "10px" }}>{item.MAT_GRP}</TableCell>
                  <TableCell align="center">
                    <Box sx={{
                      backgroundColor: getStatusColor(item.CUR_STATUS || item.SERVICE_CREATOR_STATUS),
                      color: "white", fontSize: "9px", borderRadius: "4px", p: "2px 8px", display: "inline-block", fontWeight: "bold", minWidth: "70px", textAlign: "center"
                    }}>
                      {item.CUR_STATUS || item.SERVICE_CREATOR_STATUS || "PENDING"}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Section 3: History */}
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", p: 2, backgroundColor: "#f8f9fa" }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5, color: "#1976d2", fontWeight: "bold" }}>
          Approval History
        </Typography>
        {approvalSteps.map((step, index) => (
          <Box key={index} sx={{ p: 1, borderBottom: "1px dashed #ccc", "&:last-child": { borderBottom: "none" } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>{step.label}: {step.name}</Typography>
                {step.date && <Typography variant="caption" color="textSecondary">Processed on: {formatDate(step.date)}</Typography>}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: "bold", color: getStatusColor(step.status) }}>
                {step.status}
              </Typography>
            </Box>
            {step.remarks && (
              <Box sx={{ mt: 0.5, p: 0.8, backgroundColor: "#fff", borderRadius: "4px", borderLeft: "3px solid #1976d2" }}>
                <Typography variant="caption" sx={{ color: "#555", fontStyle: "italic", display: "block" }}>
                  <b>Remarks:</b> {step.remarks}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      {/* 
          FOOTER REMOVED FROM HERE.
          The parent (Participant.js) will render the Standard Footer 
          below this component automatically.
      */}
    </Box>
  );
};

export default SerCodeCreationActionView;