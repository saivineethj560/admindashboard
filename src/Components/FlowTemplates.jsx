import React from 'react';
import { Box, Typography } from '@mui/material';

const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// --- 1. GENERIC TEMPLATE (For future processes) ---
export const GenericFlowTemplate = ({ data, processName, getStatusColor }) => {
  const itemsKey = Object.keys(data).find(key => key.endsWith('_items')) || 'items';
  const itemsArray = data[itemsKey] || [];

  const getGenericItems = (level) => {
    return {
      approved: itemsArray.filter(item => {
        const status = level === 'hod' ? item.sub_status : item.storeshead_status;
        const s = status?.toLowerCase();
        return s === 'approved' || s === 'approve' || s === 'completed';
      }),
      reject: itemsArray.filter(item => {
        const status = level === 'hod' ? item.sub_status : item.storeshead_status;
        const s = status?.toLowerCase();
        return s === 'rejected' || s === 'reject';
      })
    };
  };

  const renderStep = (user, task, status, date, level) => {
    const items = getGenericItems(level);
    return (
      <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 0.5, backgroundColor: '#f0f4f8', width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 1, minHeight: '80px' }}>
          <Box sx={{ flex: 0.6, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '13px' }}>{user} - {task}</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ color: getStatusColor(status), fontSize: '12px' }}>Status: {status || 'Pending'}</Typography>
            {date && <Typography variant="body2" sx={{ color: 'gray', fontSize: '11px' }}>Date: {formatDateToDDMMYYYY(date)}</Typography>}
          </Box>
          <Box sx={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white', maxHeight: '100px', overflowY: 'auto' }}>
            {items.approved.map((item, i) => (
              <Typography key={`app-${i}`} sx={{ fontSize: '11px', color: '#22c55e' }}>✅ {item.item_name || item.description || 'Item'}: {item.quantity || '-'}</Typography>
            ))}
            {items.reject.map((item, i) => (
              <Typography key={`rej-${i}`} sx={{ fontSize: '11px', color: '#ef4444' }}>❌ {item.item_name || item.description || 'Item'} (Rejected)</Typography>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, backgroundColor: '#e3f2fd', textAlign: 'center' }}>
        <Typography variant="body2" fontWeight="bold" sx={{ color: '#1976d2' }}>{processName} Raised By: {data.name}</Typography>
        <Typography variant="body2" sx={{ fontSize: '12px' }}>Date: {formatDateToDDMMYYYY(data.raiser_date)}</Typography>
      </Box>
      <Typography sx={{ textAlign: 'center', color: '#1976d2' }}>↓</Typography>
      {data.hod_name && renderStep(data.hod_name, 'HOD', data.hod_status, data.hod_aprvl_date, 'hod')}
      {data.stores_name && <Typography sx={{ textAlign: 'center', color: '#1976d2' }}>↓</Typography>}
      {data.stores_name && renderStep(data.stores_name, 'Process Owner', data.stores_status, data.stores_aprvl_date, 'stores')}
    </Box>
  );
};

// --- 2. INDENT TEMPLATE (Specifically for your Indent database columns) ---
export const IndentFlowTemplate = ({ data, getStatusColor }) => {
  const items = data.indent_items || [];

  const getItemsByStatus = (level) => {
    return {
      approved: items.filter(item => {
        const status = level === 'hod' ? item.PM_STATUS : item.PRJ_INC_STATUS;
        const s = status?.toLowerCase();
        return s === 'completed' || s === 'approved' || s === 'approve';
      }),
      reject: items.filter(item => {
        const status = level === 'hod' ? item.PM_STATUS : item.PRJ_INC_STATUS;
        const s = status?.toLowerCase() === 'rejected' || status?.toLowerCase() === 'reject';
        return s;
      })
    };
  };

  const renderStep = (user, task, status, date, level) => {
    const levelItems = getItemsByStatus(level);
    return (
      <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, mb: 0.5, backgroundColor: '#f0f4f8', width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 1, minHeight: '80px' }}>
          <Box sx={{ flex: 0.6, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white' }}>
            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '13px' }}>{user} - {task}</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ color: getStatusColor(status), fontSize: '12px' }}>Status: {status || 'Pending'}</Typography>
            {date && <Typography variant="body2" sx={{ fontSize: '11px', color: 'gray' }}>Date: {formatDateToDDMMYYYY(date)}</Typography>}
          </Box>
          <Box sx={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', p: 1, backgroundColor: 'white', maxHeight: '100px', overflowY: 'auto' }}>
            {levelItems.approved.map((item, i) => (
              <Typography key={i} sx={{ fontSize: '11px', color: '#22c55e' }}>✅ {item.MAT_DESC}: {item.REQ_NOW} {item.UOM}</Typography>
            ))}
            {levelItems.reject.map((item, i) => (
              <Typography key={i} sx={{ fontSize: '11px', color: '#ef4444' }}>❌ {item.MAT_DESC} (Rejected)</Typography>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={{ border: '1px solid #ccc', borderRadius: '6px', p: 1, backgroundColor: '#e3f2fd', textAlign: 'center' }}>
        <Typography variant="body2" fontWeight="bold" sx={{ color: '#1976d2' }}>Indent Raised By: {data.name}</Typography>
        <Typography variant="body2" sx={{ fontSize: '12px' }}>Date: {formatDateToDDMMYYYY(data.raiser_date)}</Typography>
      </Box>
      <Typography sx={{ textAlign: 'center', color: '#1976d2' }}>↓</Typography>
      {data.hod_name && renderStep(data.hod_name, 'HOD Approval', data.hod_status, data.hod_aprvl_date, 'hod')}
      {data.stores_name && <Typography sx={{ textAlign: 'center', color: '#1976d2' }}>↓</Typography>}
      {data.stores_name && renderStep(data.stores_name, 'Project Incharge', data.stores_status, data.stores_aprvl_date, 'stores')}
    </Box>
  );
};