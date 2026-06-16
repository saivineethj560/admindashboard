
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

// // Helper: If any item in this step is approved, the whole step is "Approve"
// const getStepStatus = (items, statusKey) => {
//   const statuses = items.map((item) => item[statusKey]).filter(Boolean);
//   if (statuses.length === 0) return null;

//   if (statuses.some((s) => s.toLowerCase() === "approve")) return "Approve";
//   if (statuses.some((s) => s.toLowerCase() === "reject")) return "Reject";
//   return statuses[0];
// };

// // Helper: Find Name and Date for a step by scanning all items
// const getStepActor = (items, nameKey, dateKey) => {
//   const actorItem = items.find(
//     (item) => item[nameKey] && item[nameKey].trim() !== "",
//   );
//   return {
//     name: actorItem ? actorItem[nameKey] : null,
//     date: actorItem ? actorItem[dateKey] : null,
//   };
// };

// // NEW Helper: Find Remarks for a step by scanning all items
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

// const MatMasterExtActionView = ({
//   flowLoading,
//   flowData,
//   selectedRowData,
//   formatDate,
//   getStatusColor,
// }) => {
//   if (flowLoading) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           minHeight: "150px",
//         }}
//       >
//         <CircularProgress />
//         <Typography sx={{ ml: 2 }}>Loading data...</Typography>
//       </Box>
//     );
//   }

//   const data = flowData?.data || {};
//   const items = data.mmextension_items || [];

//   // --- LOGIC FOR HISTORY STEPS ---
//   const approvalSteps = [
//     {
//       label: "Request Raised By",
//       name: data.name,
//       status: "SUBMITTED",
//       date: data.raiser_date,
//       remarks: null, // Raiser remarks usually in data.REMARKS if needed
//     },
//     {
//       label: "MATERIALCREATOR",
//       ...getStepActor(items, "MAT_CREATOR_NAME", "MAT_CREATOR_DT"),
//       status: getStepStatus(items, "MAT_CREATOR_STATUS"),
//       remarks: getStepRemarks(items, "MAT_CREATOR_REM"), // Added Remarks
//     },
//   ].filter((step) => step.name && step.name.trim() !== "");

//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
//       {/* Section 1: Request Information */}
//       <Box
//         sx={{
//           border: "1px solid #e0e0e0",
//           borderRadius: "8px",
//           overflow: "hidden",
//         }}
//       >
//         <Box
//           sx={{
//             backgroundColor: "#f0f4f8",
//             px: 2,
//             py: 1,
//             borderBottom: "1px solid #e0e0e0",
//           }}
//         >
//           <Typography
//             variant="subtitle2"
//             sx={{
//               color: "#1976d2",
//               fontWeight: "bold",
//               textTransform: "uppercase",
//             }}
//           >
//             Material Request Information
//           </Typography>
//         </Box>
//         <Box
//           sx={{
//             p: 2,
//             backgroundColor: "#f8f9fa",
//             display: "flex",
//             flexWrap: "wrap",
//           }}
//         >
//           <Box
//             sx={{
//               flex: 1,
//               minWidth: "280px",
//               pr: 2,
//               borderRight: { md: "1px solid #ddd" },
//             }}
//           >
//             <HeaderField label="Case ID" value={selectedRowData?.CASEID} />
//             <HeaderField label="Raiser Name" value={data.name} />
//             <HeaderField label="Department" value={data.department} />
//           </Box>
//           <Box sx={{ flex: 1, minWidth: "280px", pl: { md: 4, xs: 0 } }}>
//             <HeaderField
//               label="Request Date"
//               value={formatDate(data.raiser_date)}
//             />
//             <HeaderField
//               label="Current Task"
//               value={data.current_task}
//               valueColor="#1976d2"
//             />
//             <HeaderField label="Request Type" value={data.Req_Type} />
//           </Box>
//         </Box>
//       </Box>

//       {/* Section 2: Items Table */}
//       <Box
//         sx={{
//           border: "1px solid #e0e0e0",
//           borderRadius: "8px",
//           p: 2,
//           backgroundColor: "#ffffff",
//         }}
//       >
//         <Typography
//           variant="subtitle1"
//           sx={{ mb: 1.5, color: "#1976d2", fontWeight: "bold" }}
//         >
//           Requested Materials
//         </Typography>
//         <TableContainer
//           component={Paper}
//           sx={{ boxShadow: "none", border: "1px solid #eee" }}
//         >
//           <Table size="small">
//             <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
//               <TableRow>
//                 <TableCell sx={{ fontWeight: "bold", fontSize: "11px" }}>
//                   Description
//                 </TableCell>
//                 <TableCell
//                   align="center"
//                   sx={{ fontWeight: "bold", fontSize: "11px" }}
//                 >
//                   Code
//                 </TableCell>
                
//                 <TableCell
//                   align="center"
//                   sx={{ fontWeight: "bold", fontSize: "11px" }}
//                 >
//                   Price
//                 </TableCell>
                
//                 <TableCell
//                   align="center"
//                   sx={{ fontWeight: "bold", fontSize: "11px" }}
//                 >
//                   Status
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {items.map((item, index) => (
//                 <TableRow
//                   key={index}
//                   sx={{ "&:nth-of-type(even)": { backgroundColor: "#fafafa" } }}
//                 >
//                   <TableCell sx={{ fontSize: "10px" }}>
//                     {item.MAT_DESCP}
//                   </TableCell>
//                   <TableCell align="center" sx={{ fontSize: "10px" }}>
//                     {item.MAT_CODE}
//                   </TableCell>
                  
//                   <TableCell align="center" sx={{ fontSize: "10px" }}>
//                     {item.PRICE}
//                   </TableCell>
                 
//                   <TableCell align="center">
//                     <Box
//                       sx={{
//                         backgroundColor: getStatusColor(item.CUR_STATUS),
//                         color: "white",
//                         fontSize: "9px",
//                         borderRadius: "4px",
//                         p: "2px 8px",
//                         display: "inline-block",
//                         fontWeight: "bold",
//                         minWidth: "70px",
//                         textAlign: "center",
//                       }}
//                     >
//                       {item.CUR_STATUS || "PENDING"}
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Box>

//       {/* Section 3: Status Summary */}
//       <Box
//         sx={{
//           border: "1px solid #e0e0e0",
//           borderRadius: "8px",
//           p: 2,
//           backgroundColor: "#f8f9fa",
//         }}
//       >
//         <Typography
//           variant="subtitle1"
//           sx={{ mb: 1.5, color: "#1976d2", fontWeight: "bold" }}
//         >
//           Approval History
//         </Typography>
//         {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, borderBottom: '1px dashed #ccc' }}>
//                     <Box>
//                         <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Material Creator: {data.MAT_CREATOR_NAME}</Typography>
//                         <Typography variant="caption" color="textSecondary">Processed: {formatDate(data.MAT_CREATOR_DT)}</Typography>
//                     </Box>
//                     <Typography variant="body2" sx={{ fontWeight: 'bold', color: getStatusColor(data.MAT_CREATOR_STATUS) }}>
//                         {data.MAT_CREATOR_STATUS}
//                     </Typography>
//                 </Box> */}

//         {approvalSteps.map((step, index) => (
//           <Box
//             key={index}
//             sx={{
//               p: 1,
//               borderBottom: "1px dashed #ccc",
//               "&:last-child": { borderBottom: "none" },
//             }}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <Box>
//                 <Typography variant="body2" sx={{ fontWeight: "bold" }}>
//                   {step.label}: {step.name}
//                 </Typography>
//                 {step.date && (
//                   <Typography variant="caption" color="textSecondary">
//                     Processed on: {formatDate(step.date)}
//                   </Typography>
//                 )}
//               </Box>
//               <Typography
//                 variant="body2"
//                 sx={{ fontWeight: "bold", color: getStatusColor(step.status) }}
//               >
//                 {step.status}
//               </Typography>
//             </Box>

//             {/* RENDER REMARKS IF EXIST */}
//             {step.remarks && (
//               <Box
//                 sx={{
//                   mt: 0.5,
//                   p: 0.8,
//                   backgroundColor: "#fff",
//                   borderRadius: "4px",
//                   borderLeft: "3px solid #1976d2",
//                 }}
//               >
//                 <Typography
//                   variant="caption"
//                   sx={{ color: "#555", fontStyle: "italic", display: "block" }}
//                 >
//                   <b>Remarks:</b> {step.remarks}
//                 </Typography>
//               </Box>
//             )}
//           </Box>
//         ))}

//         <Box
//           sx={{
//             mt: 2,
//             p: 1.5,
//             backgroundColor: "#fff9c4",
//             borderRadius: "6px",
//             border: "1px solid #fbc02d",
//           }}
//         >
//           <Typography
//             variant="body2"
//             sx={{ fontWeight: "bold", color: "#f57f17" }}
//           >
//             Current Status:
//           </Typography>
//           <Typography variant="body2">
//             <b>Assigned To:</b> {data.current_user}
//           </Typography>
//           <Typography variant="body2">
//             <b>Status:</b> {data.current_status}
//           </Typography>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default MatMasterExtActionView;


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

// Helper: If any item in this step is approved, the whole step is "Approve" (Partial Approval)
const getStepStatus = (items, statusKey, globalStatus) => {
  const statuses = items.map((item) => item[statusKey]).filter(Boolean);
  if (statuses.length === 0) return globalStatus || "PENDING";

  // If even one item is approved, prioritize "Approve" to show it moved forward
  if (statuses.some((s) => s.toLowerCase() === "approve")) return "Approve";
  if (statuses.some((s) => s.toLowerCase() === "reject")) return "Reject";
  
  return globalStatus || statuses[0];
};

// Helper: Find Name and Date for a step by scanning all items
const getStepActor = (items, nameKey, dateKey, globalName, globalDate) => {
  const actorItem = items.find(
    (item) => item[nameKey] && item[nameKey].trim() !== "",
  );
  return {
    name: globalName || (actorItem ? actorItem[nameKey] : null),
    date: globalDate || (actorItem ? actorItem[dateKey] : null),
  };
};

// Helper: Find Remarks for a step by scanning all items
const getStepRemarks = (items, remarksKey) => {
  const actorItem = items.find(
    (item) => item[remarksKey] && item[remarksKey].trim() !== "",
  );
  return actorItem ? actorItem[remarksKey] : null;
};

const HeaderField = ({ label, value, valueColor = "inherit" }) => (
  <Box sx={{ display: "flex", mb: 0.8, alignItems: "baseline" }}>
    <Typography
      variant="body2"
      sx={{ width: "130px", fontWeight: "500", color: "#666", flexShrink: 0 }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ fontWeight: "500", color: "#333", mr: 1 }}
    >
      :
    </Typography>
    <Typography
      variant="body2"
      sx={{ fontWeight: "600", color: valueColor, wordBreak: "break-word" }}
    >
      {value || "N/A"}
    </Typography>
  </Box>
);

const MatMasterExtActionView = ({
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
  // Handle both possible item keys
  const items = data.mmextension_items || data.mmcreation_items || [];

  // Determine the calculated overall status for the footer
  const calculatedStatus = getStepStatus(items, "CUR_STATUS", data.current_status);
  const isApproved = calculatedStatus?.toLowerCase() === 'approve';

  // --- LOGIC FOR HISTORY STEPS ---
  const approvalSteps = [
    {
      label: "Request Raised By",
      name: data.name,
      status: "SUBMITTED",
      date: data.raiser_date,
      remarks: null,
    },
    {
      label: "Material Creator",
      ...getStepActor(items, "MAT_CREATOR_NAME", "MAT_CREATOR_DT", data.MAT_CREATOR_NAME, data.MAT_CREATOR_DT),
      status: getStepStatus(items, "MAT_CREATOR_STATUS", data.MAT_CREATOR_STATUS),
      remarks: getStepRemarks(items, "MAT_CREATOR_REM"),
    },
  ].filter((step) => step.name && step.name.trim() !== "");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Section 1: Request Information */}
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>
        <Box sx={{ backgroundColor: "#f0f4f8", px: 2, py: 1, borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="subtitle2" sx={{ color: "#1976d2", fontWeight: "bold", textTransform: "uppercase" }}>
            Material Extension Information
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
            <HeaderField label="Current Task" value={data.current_task} valueColor="#1976d2" />
            <HeaderField label="Request Type" value={data.Req_Type} />
          </Box>
        </Box>
      </Box>

      {/* Section 2: Items Table */}
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", p: 2, backgroundColor: "#ffffff" }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5, color: "#1976d2", fontWeight: "bold" }}>
          Requested Materials
        </Typography>
        <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #eee" }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", fontSize: "11px" }}>Description</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "11px" }}>Code</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "11px" }}>Price</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "11px" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index} sx={{ "&:nth-of-type(even)": { backgroundColor: "#fafafa" } }}>
                  <TableCell sx={{ fontSize: "10px" }}>{item.MAT_DESCP}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "10px" }}>{item.MAT_CODE}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "10px" }}>{item.PRICE}</TableCell>
                  <TableCell align="center">
                    <Box sx={{
                      backgroundColor: getStatusColor(item.CUR_STATUS || item.MAT_CREATOR_STATUS),
                      color: "white", fontSize: "9px", borderRadius: "4px", p: "2px 8px", display: "inline-block", fontWeight: "bold", minWidth: "70px", textAlign: "center"
                    }}>
                      {item.CUR_STATUS || item.MAT_CREATOR_STATUS || "PENDING"}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Section 3: Status Summary */}
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

        {/* Dynamic Footer Summary */}
        <Box sx={{ 
            mt: 2, p: 1.5, 
            backgroundColor: isApproved ? "#e8f5e9" : "#fff9c4", 
            borderRadius: "6px", 
            border: isApproved ? "1px solid #4caf50" : "1px solid #fbc02d" 
        }}>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: isApproved ? "#2e7d32" : "#f57f17" }}>
            Current Summary Status:
          </Typography>
          <Typography variant="body2"><b>Assigned To:</b> {data.current_user}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: getStatusColor(calculatedStatus) }}>
            <b>Action:</b> {calculatedStatus}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MatMasterExtActionView;