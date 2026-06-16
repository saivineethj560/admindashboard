import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import '../assets/styles/style.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import { DataGrid } from '@mui/x-data-grid';
import Swal from 'sweetalert2';
import { Box, Paper, MenuItem, Select, TextField, InputAdornment, IconButton } from '@mui/material';
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, } from "@material-tailwind/react";
import { FilterList, Refresh, Close, Edit, Search } from '@mui/icons-material';
import { ArrowLeftIcon, Briefcase, BriefcaseIcon, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from "../Config";


const MrfUploadList1 = () => {
  const [userToken, setUserToken] = useState(() =>
    JSON.parse(localStorage.getItem('userInfo')) || {}
  );
  const [transfer, setTransfer] = useState(false);

  const [form, setForm] = useState({
    status: '',
    designation: '',
    emp_name: '',
    plant_code: '',
    total_requirement: '',
    availability: '',
    actual_requirement: '',
    department: '',
  });
  const [searchText, setSearchText] = useState('');
  const [filterPlant, setFilterPlant] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  // ✅ Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}manpower-upload-get`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${userToken.token}`,
          },
        }
      );
      if (response.data && Array.isArray(response.data.data)) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchData();
    }
  }, [location]);

  useEffect(() => {
    if (!userToken.token) {
      navigate('/');
    }
  }, [navigate, userToken?.token]);

  // ✅ Search + Filter Logic
  const filteredData = data.filter((row) => {
    const matchesSearch =
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      );
    const matchesPlant = filterPlant ? row.Plant_code === filterPlant : true;
    const matchesDept = filterDepartment ? row.Designation === filterDepartment : true;
    return matchesSearch && matchesPlant && matchesDept;
  });

  // ✅ Open Modal for Edit
  const handleEditClick = (row) => {
    setForm({
      status: '',
      designation: row.Designation || '',
      emp_name: row.Emp_Name || '',
      plant_code: row.Plant_code || '',
      total_requirement: row.Total_Requirement || '',
      availability: row.Availability || '',
      actual_requirement: row.Actual_Requirement || '',
      department: row.Department || '',
      mrf_id: row.mrf_id,
    });
    setTransfer(true);
  };

  // ✅ Update Record
  const handleModalSubmit = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}mrfUploadDataUpdate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${userToken.token}`,
          },
          body: JSON.stringify({
            mrf_id: form.mrf_id,
            Total_Requirement: form.total_requirement,
            Designation: form.designation,
            Emp_Name: form.emp_name,
            Plant_code: form.plant_code,
            Availability: form.availability,
            Actual_Requirement: form.actual_requirement,
            Department: form.department,
          }),
        }
      );

      const result = await response.json();
      if (result.status === 200) {
        Swal.fire('Updated!', 'Manpower Upload details updated successfully.', 'success');
        fetchData();
        setTransfer(false);
      } else {
        Swal.fire('Error!', 'Failed to update data.', 'error');
      }
    } catch (error) {
      console.error('Error updating:', error);
      Swal.fire('Error!', 'Failed to update data.', 'error');
    }
  };

  // ✅ DataGrid Columns
  const columns = [
    { field: 'Plant_code', headerName: 'Plant Code', flex: 1, minWidth: 120 },
    { field: 'Designation', headerName: 'Designation', flex: 1.2, minWidth: 150 },
    { field: 'Total_Requirement', headerName: 'Total Requirement', flex: 0.8, minWidth: 100 },
    { field: 'Availability', headerName: 'Available', flex: 0.8, minWidth: 80 },
    { field: 'Actual_Requirement', headerName: 'Actual Requirement', flex: 0.8, minWidth: 100 },
    {
      field: 'created_at',
      headerName: 'Created At',
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => {
        if (!params) return '';
        const date = new Date(params);
        return `${String(date.getDate()).padStart(2, '0')}/${String(
          date.getMonth() + 1
        ).padStart(2, '0')}/${date.getFullYear()}`;
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 0.6,
      minWidth: 80,
      renderCell: (params) => (
        <button
          onClick={() => handleEditClick(params.row)}
          className="flex items-center gap-1 px-3 py-1 text-white transition-all duration-200 rounded-md shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          <Edit sx={{ fontSize: 16 }} />
          Edit
        </button>
      ),
    },
  ];

  // ✅ Unique filter values
  const uniquePlants = [...new Set(data.map((row) => row.Plant_code))];
  const uniqueDesignation = [...new Set(data.map((row) => row.Designation))];

  return (
    <div className="w-full min-h-screen p-4 mx-auto border border-gray-300 shadow-2xl max-w-7xl rounded-3xl bg-gradient-to-br from-pink-100 via-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="flex items-center px-8 py-6 bg-white border border-gray-100 shadow-lg rounded-2xl ">
        {/* Left Accent Icon */}
        <div className="flex items-center justify-center w-12 h-12 mr-4 text-white shadow-md rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
          <BriefcaseIcon className="w-6 h-6" />
        </div>

        {/* Title + Subtitle */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text">
            Manpower Upload Edit Form
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Submit a request for hiring, replacements, or manpower planning
          </p>
        </div>

        {/* Back Button */}
        <motion.button
          // onClick={handleBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-2 font-medium text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:from-blue-600 hover:to-blue-700"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </motion.button>
      </div>

      {/* =================Modal================= */}
      <Dialog open={transfer} handler={setTransfer} size="md" className="shadow-xl rounded-2xl">
        <DialogHeader className="p-0 overflow-hidden rounded-t-2xl">
          <div className="relative w-full px-6 py-3 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-t-2xl">
            <h2 className="text-xl font-semibold text-center">
              {form.mrf_id
                ? `Edit MRF Record - (${form.plant_code.split(" - ")[0]}) - ${form.plant_code.split(" - ")[1]}`
                : 'Edit Record'}
            </h2>

            <button
              onClick={() => setTransfer(false)}
              className="absolute text-2xl font-bold leading-none text-white transition-colors -translate-y-1/2 right-6 top-1/2 hover:text-red-200 focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </DialogHeader>
        <DialogBody className="px-6 py-6 bg-gray-50">
          <div className="p-6 border border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl">
            <form className="space-y-6 text-sm">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    <MapPin className="w-4 h-4" />
                    Plant Code</label>
                  <input
                    type="text"
                    value={form.plant_code || ''}
                    readOnly
                    className="w-full px-4 py-3 text-sm bg-gray-100 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    <Users className="w-4 h-4" />
                    Employee Name</label>
                  <input
                    type="text"
                    value={form.emp_name || ''}
                    readOnly
                    className="w-full px-4 py-3 text-sm bg-gray-100 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    <Briefcase className="w-4 h-4" />
                    Designation</label>
                  <input
                    type="text"
                    value={form.designation || ''}
                    readOnly
                    className="w-full px-4 py-3 text-sm bg-gray-100 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>

                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Total Requirement <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.total_requirement || ''}
                    onChange={(e) => setForm({ ...form, total_requirement: e.target.value })}
                    className="w-full px-4 py-3 text-sm transition-all bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Availability</label>
                  <input
                    type="text"
                    value={form.availability || ''}
                    readOnly
                    className="w-full px-4 py-3 text-sm bg-gray-100 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Actual Requirement</label>
                  <input
                    type="text"
                    value={form.actual_requirement || ''}
                    readOnly
                    className="w-full px-4 py-3 text-sm bg-gray-100 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
        <DialogFooter className="flex justify-end gap-3 px-6 py-4 bg-gray-100 border-t border-gray-200 rounded-b-xl">
          <Button
            onClick={() => setTransfer(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleModalSubmit}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm px-5 py-2.5 rounded-lg font-medium transition-all shadow-md"
          >
            Update Record
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ================= Table Section ================= */}
      <Paper sx={{
        width: '100%',
        mt: 4,
        borderRadius: '20px',

        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Search + Filters */}
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { md: 'center' },
            padding: 3,
            borderRadius: '16px',

            backgroundColor: 'rgba(120, 128, 128, 0.1)',

            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
          <TextField
            placeholder="Search records..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
            sx={{
              minWidth: 250,
              background: 'white',
              borderRadius: '14px',

              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchText('')}
                    sx={{ color: '#999' }}
                  >
                    <Close />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Select
            value={filterPlant}
            onChange={(e) => setFilterPlant(e.target.value)}
            displayEmpty
            size="small"
            sx={{
              minWidth: 180,
              background: 'white',
              borderRadius: '12px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
                borderWidth: '2px',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
                borderWidth: '2px',
              },
            }}
          >
            <MenuItem value="">All Plants</MenuItem>
            {uniquePlants.map((plant) => (
              <MenuItem key={plant} value={plant}>
                {plant}
              </MenuItem>
            ))}
          </Select>


          <Select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            displayEmpty
            size="small"
            sx={{
              minWidth: 200,
              background: 'white',
              borderRadius: '12px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e2e8f0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
              }
            }}
          >
            <MenuItem value="">All Designations</MenuItem>
            {uniqueDesignation.map((desi) => (
              <MenuItem key={desi} value={desi}>{desi}</MenuItem>
            ))}
          </Select>

          <Box sx={{ display: 'flex', gap: 1, ml: { md: 'auto' } }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setFilterPlant("");
                setFilterDepartment("");
                setSearchText("");
              }}
              sx={{
                textTransform: "none",
                // background: 'linear-gradient(45deg, #050d32ff, #4f4857ff)',
                borderRadius: '10px',
                fontWeight: '600',
                // boxShadow: '0 4px 15px rgba(118, 75, 162, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                  boxShadow: '0 6px 20px rgba(118, 75, 162, 0.4)',
                },
                px: 2,
                py: 1
              }}
              startIcon={<FilterList />}
            >
              Clear Filters
            </Button>

          </Box>
        </Box>

        {/* DataGrid */}
        <Box

          sx={{
            width: '100%',
            height: '70vh',
            borderRadius: '16px',
            background: 'white',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row.mrf_id}
            loading={loading}
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
            }
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            rowHeight={50}
            columnHeaderHeight={55}
            sx={{
              width: '100%',
              height: '100%',
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                fontSize: '14px',
                fontWeight: '600',
                borderBottom: '2px solid #e0e7ff',

              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: '600',

              },
              '& .MuiDataGrid-row': {
                borderBottom: '1px solid #f1f5f9',
                '&:hover': {
                  background: 'linear-gradient(90deg, #f8faff, #f0f4ff)',
                },
              },
              '& .even-row': {
                background: '#fafbff',
              },
              '& .odd-row': {
                background: '#ffffff',
              },
              '& .MuiDataGrid-cell': {
                fontSize: '14px',
                color: '#374151',
                fontWeight: '500',
                borderRight: '1px solid #f1f5f9',
              },
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-footerContainer': {
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderTop: '1px solid #e0f2fe',
                color: '#0369a1',
              },
              '& .MuiTablePagination-root': {
                color: '#0369a1',
              },
              '& .MuiTablePagination-selectIcon': {
                color: '#0369a1',
              },
              '& .MuiIconButton-root': {
                color: '#0369a1',
                '&:hover': {
                  backgroundColor: 'rgba(3, 105, 161, 0.1)'
                }
              },
              '& .MuiDataGrid-selectedRowCount': {
                color: '#0369a1',
                fontWeight: '500'
              },
              borderRadius: '16px',
            }}
          />
        </Box>
      </Paper>
    </div>
  );
};

export default MrfUploadList1;