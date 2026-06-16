import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import '../assets/styles/style.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import { DataGrid, GridOverlay } from '@mui/x-data-grid';
import Swal from 'sweetalert2';
import { Box, Paper, TextField, InputAdornment, Select, Input, MenuItem,IconButton, DialogTitle, DialogContent, FormControl, InputLabel, DialogActions } from '@mui/material';
import {  Button,  Dialog,  DialogHeader,  DialogBody,  DialogFooter,} from "@material-tailwind/react";
import {  X,  FileText,  MapPin,  Users,  Briefcase,  RefreshCw,  Search,  BriefcaseIcon,  ArrowLeftIcon} from 'lucide-react';
import { Add, Edit, FileUpload, FilterList } from '@mui/icons-material';
import { motion } from 'framer-motion';
import MrfFileUpload from './MrfUpload';
import { API_BASE_URL } from "../Config";

const MrfUploadList = () => {

  const [userToken, setUserToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo')) || {};
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalPlant, setModalPlant] = useState('');
  const [modalDesignation, setModalDesignation] = useState('');
  const [modalDepartment, setModalDepartment] = useState('');
  const [transfer, setTransfer] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterPlant, setFilterPlant] = useState('');
  const [totalReq, setTotalReq] = useState("");
  const [availabilityAdd, setAvailabilityAdd] = useState("");
  const [actualReqAdd, setActualReqAdd] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [plantCode, setPlantCode] = useState('');
  const [deptList, setDeptList] = useState([]);
  const [desgList, setDesgList] = useState([]);
  const [modalErrors, setModalErrors] = useState({});
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
 
  const validateModalForm = () => {
    const newErrors = {};

    if (!plantCode) {
      newErrors.plantCode = 'Plant Code is required';
    }

    if (!selectedDept) {
      newErrors.selectedDept = 'Department is required';
    }

    if (!selectedDesignation) {
      newErrors.selectedDesignation = 'Designation is required';
    }

    if (!totalReq || isNaN(totalReq) || totalReq <= 0) {
      newErrors.totalReq = 'Total Requirement must be a positive number';
    }

    if (availabilityAdd === "" || isNaN(availabilityAdd) || availabilityAdd < 0) {
      newErrors.availabilityAdd = 'Availability must be a non-negative number';
    }

    setModalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const getFieldClass = (fieldName, hasError = false, value = "") => {
    const baseClass = `w-full px-3 py-2.5 text-sm border rounded-lg transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-gray-100
    placeholder:text-gray-400 `;

    if (hasError) {
      return `${baseClass} border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-500`;
    }

    if (fieldName === "total_requirement") {
      return `${baseClass} border-gray-200 bg-white`;
    }

    if (['emp_name', 'plant_code', 'designation', 'department', 'availability', 'actual_requirement'].includes(fieldName)) {
      return `${baseClass} text-gray-700 cursor-not-allowed`;
    }

    return `${baseClass} border-gray-200`;
  };

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

  const loaderStyle = {
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #3498db',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '50px auto',
  };

  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualReq, setactualReq] = useState('');
  const [plantOptions, setPlantOptions] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });

  useEffect(() => {
    axios
      .get("http://192.168.8.91:8084/inactive/phpapi/plant_api.php")
      .then(res => setPlantOptions(res.data))
      .catch(err => console.error("Failed to fetch plant data", err));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}manpower-upload-get`, {
        headers: {
          "Content-Type": "application/json",
          Accept: 'application/json',
          Authorization: `Bearer  ${userToken.token}`
        }
      });
      if (response.data && Array.isArray(response.data.data)) {
        setData(response.data.data);

        console.log("getData", response?.data);
      }
    } catch (error) {
      console.error("Data is not in the Array Format here---");
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

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.total_requirement?.trim()) {
      newErrors.total_requirement = 'Total Requirement is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchDeptAndDesg = async () => {

      try {
        const response = await axios.get(`${API_BASE_URL}dept`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${userToken.token}`,
          },
        });
        const departments = response.data.departments;
        const designations = response.data.designations;
      
        setDeptList(departments);
        setDesgList(designations);
      } catch (error) {
        console.error('Failed to fetch dept/desig data', error);
      }
    };
    fetchDeptAndDesg();
  }, []);

const handleEditSubmit = async () => {
console.log({
        mrf_id: form.mrf_id,
        Total_Requirement: form.total_requirement,
        Designation: form.designation,
        Emp_Name: form.emp_name,
        Plant_code: form.plant_code,
        Availability: form.availability,
        Actual_Requirement: form.actual_requirement,
        Department: form.department,
      },"helloooooooooo");

  try {
    const response = await fetch(`${API_BASE_URL}mrfUploadDataUpdate`, {
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
        // add other fields if backend accepts
      }),
    });

    const result = await response.json();
    if (result.status === 200) {
      Swal.fire('Updated!', 'Manpower Upload details updated successfully.', 'success');
      fetchData();  // refresh list
      setTransfer(false); // close modal
    } else {
      Swal.fire('Error!', 'Failed to update data.', 'error');
    }
  } catch (error) {
    console.error('Error updating:', error);
    Swal.fire('Error!', 'Failed to update data.', 'error');
  }
};

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    // Validate form before submission
    if (!validateModalForm()) return;
    console.log(userToken.token, "token");
    try {
      // Check if this exact combination already exists
      const existingRow = data.find(
        (row) =>
          row.Plant_code === plantCode &&
          row.Department === selectedDept &&
          row.Designation === selectedDesignation
      );

      if (existingRow) {
        Swal.fire(
          "Warning",
          "This combination of Plant, Department, and Designation already exists",
          "warning"
        );
        return;
      }

      const response = await fetch(`${API_BASE_URL}mrf-Upload-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${userToken.token}`,
        },
        body: JSON.stringify({
          Plant_code: plantCode,
          Department: selectedDept,
          Designation: selectedDesignation,
          Total_Requirement: parseInt(totalReq) || 0,
          Availability: parseInt(availabilityAdd) || 0,
          Actual_Requirement: parseInt(actualReqAdd) || 0
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      const result = await response.json();
      console.log(result, "response result");

      // Create a new individual row using the form values
      const newRow = {
        mrf_id: result.mrf_id || `temp_${Date.now()}`, // Use API response ID or temp ID
        Plant_code: plantCode,
        Department: selectedDept,
        Designation: selectedDesignation,
        Total_Requirement: parseInt(totalReq) || 0,
        Availability: parseInt(availabilityAdd) || 0,
        Actual_Requirement: parseInt(actualReqAdd) || 0,
        created_at: new Date().toISOString(),
        Emp_Name: '', // These can be filled later when editing
      };
      // Add the new row to the data
      setData((prevData) => [newRow, ...prevData]);
      Swal.fire("Success", "Data saved successfully", "success");

      // Reset form + close modal
      setIsAddModalOpen(false);
      setPlantCode("");
      setSelectedDept("");
      setSelectedDesignation("");
      setTotalReq("");
      setAvailabilityAdd("");
      setActualReqAdd("");
      setModalErrors({}); // Clear errors

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Something went wrong while saving data", "error");
    }
  };

  const filteredData = data.filter((row) => {
    const matchesSearch =
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      );
    const matchesPlant = filterPlant ? row.Plant_code === filterPlant : true;
    const matchesDept = filterDepartment ? row.Designation === filterDepartment : true;
    return matchesSearch && matchesPlant && matchesDept;
  });
  // const uniquePlants = [...new Set(data.map(row => row.Plant_code))];
  const uniqueDesignations = [...new Set(data.map(row => row.Designation))];
  const uniqueDepartments = [...new Set(data.map(row => row.Department))];
  const columns = [
    { field: "Plant_code", headerName: "Plant Code", flex: 1, minWidth: 120 },
    { field: "Department", headerName: "Department", flex: 1.2, minWidth: 150 },
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

  const handlePlantCodeChange = (e) => setPlantCode(e.target.value);
  const handleTotalAvailibility = (e) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(value) && value >= 0)) {
      setTotalReq(value);

      if (availabilityAdd !== "") {
        setActualReqAdd(Math.max(0, value - availabilityAdd));
      }
    }
  };
  const handleActual = (e) => setActualReqAdd(e.target.value);
  const handleAvailable = (e) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(value) && value >= 0)) {
      setAvailabilityAdd(value);

      if (totalReq !== "") {
        setActualReqAdd(Math.max(0, totalReq - value));
      }
    }
  }

  const handleDesignation = (e) => setDesgList(e.target.value);
  const uniquePlants = [...new Set(data.map((row) => row.Plant_code))];
  const uniqueDesignation = [...new Set(data.map((row) => row.Designation))];
  const handleBack = () => {
    navigate(-1);
  };
  return (
    <>
      <div className="w-full min-h-screen p-6 mx-auto border border-gray-300 rounded-lg shadow-md shadow-2xl max-w-7xl rounded-3xl bg-gradient-to-br from-pink-100 via-gray-50 to-gray-100">
        <div className="flex items-center px-8 py-6 bg-white border border-gray-100 shadow-lg rounded-2xl ">
          {/* Left Accent Icon */}
          <div className="flex items-center justify-center w-12 h-12 mr-4 text-white shadow-md rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
            <BriefcaseIcon className="w-6 h-6" />
          </div>

          {/* Title + Subtitle */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text">
              Manpower Upload Form
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Submit a request for hiring, replacements, or manpower planning
            </p>
          </div>

          {/* Back Button */}
          <motion.button
             onClick={handleBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2 font-medium text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:from-blue-600 hover:to-blue-700"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back
          </motion.button>
        </div>

        {transfer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-4xl overflow-y-auto bg-white shadow-2xl rounded-2xl">
              <div className="sticky top-0 px-6 py-3 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">MRF Upload Record</h2>
                    <p className="text-sm">MRF ID: {form.mrf_id}</p>
                  </div>
                  <button
                    onClick={() => setTransfer(false)}
                    className="p-2 transition-colors duration-150 hover:bg-white hover:bg-opacity-20 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-112px)]">
                {/* Update Form */}
                <div className="p-6 border border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Update Requirements</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700 ">
                        <MapPin className="w-4 h-4" />
                        Plant Code
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={form.plant_code || ""}
                        className={getFieldClass("plant_code")}
                      />
                    </div>
                    <div>
                      <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
                        <Users className="w-4 h-4" />
                        Employee Name
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={form?.emp_name || ''}
                        className={getFieldClass("emp_name")}
                      />
                    </div>

                    <div>
                      <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
                        <Briefcase className="w-4 h-4" />
                        Designation
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={form.designation || ''}
                        className={getFieldClass("designation")}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 pt-3 mb-3">
                    <div>
                      <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
                        <Briefcase className="w-4 h-4" />
                        Department
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={form.department || ''}
                        className={getFieldClass("department")}
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
                        className={getFieldClass("total_requirement", errors.total_requirement)}
                        placeholder="Enter total requirement"
                      />
                      {errors.total_requirement && (
                        <p className="mt-1 text-sm text-red-500">{errors.total_requirement}</p>
                      )}
                    </div>

                    {/* Availability - Read Only */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Availability
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={form.availability || ''}
                        className={getFieldClass("availability")}
                      />
                    </div>

                    {/* Actual Requirement - Read Only */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Actual Requirement
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={form.actual_requirement || ''}
                        className={getFieldClass("actual_requirement")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setTransfer(false)}
                    className="px-6 py-2 text-gray-700 transition-colors duration-200 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    disabled={loading}
                    className="px-6 py-2 text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      'Update Record'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Paper sx={{
          width: '100%',
          mt: 4,
          borderRadius: '20px',

          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
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

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 text-white transition-all duration-200 bg-blue-600 shadow-md rounded-xl hover:bg-blue-500 hover:shadow-lg"
            >
              <Add className="w-6 h-6" />
              ADD
            </button>

            {isAddModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                <div className="w-full max-w-4xl overflow-y-auto bg-white shadow-2xl rounded-2xl">
                  <div className="sticky top-0 px-6 py-3 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">Add Data</h2>
                      </div>
                      <button
                        onClick={() => {
                          setIsAddModalOpen(false);
                          setModalErrors({}); // Clear errors when closing
                        }}
                        className="p-2 transition-colors duration-150 hover:bg-white hover:bg-opacity-20 rounded-xl"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-112px)]">
                    <div className="p-6 border border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Add Requirements</h3>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700 ">
                            <MapPin className="w-4 h-4" />
                            Plant Code <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={plantCode}
                            onChange={handlePlantCodeChange}
                            className={`w-full mt-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-200 bg-white text-gray-900 ${modalErrors.plantCode ? "border-red-400 focus:ring-red-100" : "border-blue-300 focus:ring-blue-100"
                              }`}
                            required
                          >
                            <option value="">Select Plant</option>
                            {plantOptions.map((plant, idx) => (
                              <option key={idx} value={plant.PLANT}>{plant.PLANT_NAME}</option>
                            ))}
                          </select>
                          {modalErrors.plantCode && (
                            <p className="mt-1 text-sm text-red-500">{modalErrors.plantCode}</p>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
                            <Briefcase className="w-4 h-4" />
                            Department <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className={`w-full mt-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-200 bg-white text-gray-900 ${modalErrors.selectedDept ? "border-red-400 focus:ring-red-100" : "border-blue-300 focus:ring-blue-100"
                              }`}
                            required
                          >
                            <option value="">Select Department</option>
                            {deptList?.map((dept, idx) => (
                              <option key={idx} value={dept?.DEPT}>
                                {dept?.DEPT}
                              </option>
                            ))}
                          </select>
                          {modalErrors.selectedDept && (
                            <p className="mt-1 text-sm text-red-500">{modalErrors?.selectedDept}</p>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
                            <Briefcase className="w-4 h-4" />
                            Designation <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedDesignation}
                            onChange={(e) => setSelectedDesignation(e.target.value)}
                            className={`w-full mt-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-200 bg-white ${modalErrors.selectedDesignation ? "border-red-400 focus:ring-red-100" : "border-blue-300 focus:ring-blue-100"
                              }`}
                            required
                          >
                            <option value="">Select Designation</option>
                            {desgList?.map((desg, idx) => (
                              <option key={idx} value={desg?.DESIG}>
                                {desg?.DESIG}
                              </option>
                            ))}
                          </select>
                          {modalErrors.selectedDesignation && (
                            <p className="mt-1 text-sm text-red-500">{modalErrors.selectedDesignation}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-3 mb-3">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Total Requirement <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={totalReq}
                            onChange={handleTotalAvailibility}
                            min="0"
                            className={`w-full mt-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-200 bg-white ${modalErrors.totalReq ? "border-red-400 focus:ring-red-100" : "border-blue-300 focus:ring-blue-100"
                              }`}
                            placeholder="Enter total requirement"
                          />
                          {modalErrors.totalReq && (
                            <p className="mt-1 text-sm text-red-500">{modalErrors.totalReq}</p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            Availability <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            onChange={handleAvailable}
                            value={availabilityAdd}
                            min="0"
                            className={`w-full mt-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-200 bg-white ${modalErrors.availabilityAdd ? "border-red-400 focus:ring-red-100" : "border-blue-300 focus:ring-blue-100"
                              }`}
                          />
                          {modalErrors.availabilityAdd && (
                            <p className="mt-1 text-sm text-red-500">{modalErrors.availabilityAdd}</p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Actual Requirement
                          </label>
                          <input
                            type="number"
                            value={actualReqAdd}
                            readOnly
                            className="w-full px-4 py-3 mt-1 transition duration-200 bg-gray-100 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => {
                          setIsAddModalOpen(false);
                          setModalErrors({});
                        }}
                        className="px-6 py-2 text-gray-700 transition-colors duration-200 border border-gray-200 rounded-xl hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleModalSubmit}
                        disabled={loading}
                        className="px-6 py-2 text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Saving...
                          </div>
                        ) : (
                          'Save Record'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
          <Box sx={{
            width: '100%',
            height: '50vh',
            borderRadius: '16px',
            background: 'white',
            overflow: 'hidden',

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
                '& .MuiDataGrid-columnHeaders': {
                  background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)',
                  color: 'white',
                  backgroundColor: 'red'
                },

                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: '600',

                  color: 'black',
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
    </>
  );
};

export default MrfUploadList;



















// import React, { useState, useMemo, useEffect } from 'react';
// import axios from 'axios';
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import SearchIcon from '@mui/icons-material/Search';
// import '../assets/styles/style.css';
// import 'sweetalert2/dist/sweetalert2.min.css';
// import { DataGrid, GridOverlay } from '@mui/x-data-grid';
// import Swal from 'sweetalert2';
// import { Box, Paper, TextField, InputAdornment, Select, Input, MenuItem, IconButton, DialogTitle, DialogContent, FormControl, InputLabel, DialogActions } from '@mui/material';
// import {
//   Button,
//   Dialog,
//   DialogHeader,
//   DialogBody,
//   DialogFooter,
// } from "@material-tailwind/react";
// import {
//   X,
//   FileText,
//   MapPin,
//   Users,
//   Briefcase,
//   RefreshCw,
//   Search,
//   BriefcaseIcon,
//   ArrowLeftIcon
// } from 'lucide-react';
// import { Add, Edit, FileUpload, FilterList } from '@mui/icons-material';
// import { motion } from 'framer-motion';
// import MrfFileUpload from './MrfUpload';

// const MrfUploadList = () => {

//   const [userToken, setUserToken] = useState(() => {
//     return JSON.parse(localStorage.getItem('userInfo')) || {};
//   });
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [modalPlant, setModalPlant] = useState('');
//   const [modalDesignation, setModalDesignation] = useState('');
//   const [modalDepartment, setModalDepartment] = useState('');
//   const [transfer, setTransfer] = useState(false);
//   const [filterDepartment, setFilterDepartment] = useState('');
//   const [filterPlant, setFilterPlant] = useState('');
//   const [totalReq, setTotalReq] = useState("");
//   const [availabilityAdd, setAvailabilityAdd] = useState("");
//   const [actualReqAdd, setActualReqAdd] = useState("");

//   const [selectedDesignation, setSelectedDesignation] = useState("");
//   const [selectedDept, setSelectedDept] = useState("");
//   const [plantCode, setPlantCode] = useState('');
//   const [deptList, setDeptList] = useState([]);
//   const [desgList, setDesgList] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [form, setForm] = useState({
//     status: '',
//     designation: '',
//     emp_name: '',
//     plant_code: '',
//     total_requirement: '',
//     availability: '',
//     actual_requirement: '',
//     department: '',
//   });



//   const getFieldClass = (fieldName, hasError = false, value = "") => {
//     const baseClass = `w-full px-3 py-2.5 text-sm border rounded-lg transition-all duration-200 ease-in-out
//     focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-gray-100
//     placeholder:text-gray-400 `;

//     if (hasError) {
//       return `${baseClass} border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-500`;
//     }

//     if (fieldName === "total_requirement") {
//       return `${baseClass} border-gray-200 bg-white`;
//     }

//     if (['emp_name', 'plant_code', 'designation', 'department', 'availability', 'actual_requirement'].includes(fieldName)) {
//       return `${baseClass} text-gray-700 cursor-not-allowed`;
//     }

//     return `${baseClass} border-gray-200`;
//   };


//   const handleEditClick = (row) => {
//     setForm({
//       status: '',
//       designation: row.Designation || '',
//       emp_name: row.Emp_Name || '',
//       plant_code: row.Plant_code || '',
//       total_requirement: row.Total_Requirement || '',
//       availability: row.Availability || '',
//       actual_requirement: row.Actual_Requirement || '',
//       department: row.Department || '',
//       mrf_id: row.mrf_id,
//     });
//     setTransfer(true);
//   };

//   const loaderStyle = {
//     border: '5px solid #f3f3f3',
//     borderTop: '5px solid #3498db',
//     borderRadius: '50%',
//     width: '40px',
//     height: '40px',
//     animation: 'spin 1s linear infinite',
//     margin: '50px auto',
//   };

//   const [searchText, setSearchText] = useState('');
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actualReq, setactualReq] = useState('');
//   const [plantOptions, setPlantOptions] = useState([]);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [paginationModel, setPaginationModel] = useState({
//     pageSize: 5,
//     page: 0,
//   });


//   useEffect(() => {
//     axios
//       .get("http://192.168.8.91:8084/inactive/phpapi/plant_api.php")
//       .then(res => setPlantOptions(res.data))
//       .catch(err => console.error("Failed to fetch plant data", err));
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get('http://127.0.0.1:8000/api/manpower-upload-get', {
//         headers: {
//           "Content-Type": "application/json",
//           Accept: 'application/json',
//           Authorization: `Bearer  ${userToken.token}`
//         }
//       });
//       if (response.data && Array.isArray(response.data.data)) {
//         setData(response.data.data);

//         console.log("getData", response?.data);
//       }
//     } catch (error) {
//       console.error("Data is not in the Array Format here---");
//     } finally {
//       setLoading(false);
//     }
//   };



//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (location.state?.refresh) {
//       fetchData();
//     }
//   }, [location]);

//   useEffect(() => {
//     if (!userToken.token) {
//       navigate('/');
//     }
//   }, [navigate, userToken?.token]);

//   const handleSearch = (e) => {
//     setSearchText(e.target.value);
//     setPaginationModel({ ...paginationModel, page: 0 });
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!form.total_requirement?.trim()) {
//       newErrors.total_requirement = 'Total Requirement is required';
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };



//   const handleSubmit = async () => {


//     try {
//       const response = await fetch('http://127.0.0.1:8000/api/mrf-Upload-data', {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${userToken.token}` },
//         body: formData,
//       });

//       const data = await response.json();

//       if (!response.ok) throw new Error(data.error || 'Unknown error');

//       // Show success SweetAlert
//       await Swal.fire({
//         title: 'Success!',
//         text: 'File uploaded successfully!',
//         icon: 'success',
//         confirmButtonText: 'OK',
//         confirmButtonColor: '#2563eb',
//       });


//       navigate('/ManpowerUploadList');

//     } catch (error) {
//       setError(error.message);
//       setIsUploading(false); // Re-enable button on error

//       // Show error SweetAlert
//       Swal.fire({
//         title: 'Error!',
//         text: error.message || 'Failed to upload file',
//         icon: 'error',
//         confirmButtonText: 'OK',
//         confirmButtonColor: '#dc2626',
//       });
//     }
//   };

//   useEffect(() => {
//     const fetchDeptAndDesg = async () => {
//       try {
//         const response = await axios.get('http://127.0.0.1:8000/api/dept', {
//           headers: {
//             Accept: 'application/json',
//             Authorization: `Bearer ${userToken.token}`,
//           },
//         });
//         const departments = response.data.departments;
//         const designations = response.data.designations;
//         setDeptList(departments);
//         setDesgList(designations);
//       } catch (error) {
//         console.error('Failed to fetch dept/desig data', error);
//       }
//     };
//     fetchDeptAndDesg();
//   }, []);

// const handleModalSubmit = async (e) => {
//   e.preventDefault();

//   console.log(userToken.token, "token");
    
//   try {
//     // Call API first
//     const response = await fetch("http://127.0.0.1:8000/api/mrf-Upload-data", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//         Authorization: `Bearer ${userToken.token}`,
//       },
//       body: JSON.stringify({
//         Plant_code: plantCode,
//         Department: selectedDept,
//         Designation: selectedDesignation,
//         Total_Requirement: parseInt(totalReq) || 0,
//         Availability: parseInt(availabilityAdd) || 0,
//         Actual_Requirement: parseInt(actualReqAdd) || 0
//       }),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to save data");
//     }

//     const result = await response.json();
//     console.log(result, "response result");

//     // Check if this exact combination already exists
//     const existingRow = data.find(
//       (row) => 
//         row.Plant_code === plantCode && 
//         row.Department === selectedDept && 
//         row.Designation === selectedDesignation
//     );

//     if (existingRow) {
//       Swal.fire(
//         "Warning",
//         "This combination of Plant, Department, and Designation already exists",
//         "warning"
//       );
//       return;
//     }

//     // Create a new individual row using the form values
//     const newRow = {
//       mrf_id: result.mrf_id || `temp_${Date.now()}`, // Use API response ID or temp ID
//       Plant_code: plantCode,
//       Department: selectedDept,
//       Designation: selectedDesignation,
//       Total_Requirement: parseInt(totalReq) || 0,
//       Availability: parseInt(availabilityAdd) || 0,
//       Actual_Requirement: parseInt(actualReqAdd) || 0,
//       created_at: new Date().toISOString(),
//       Emp_Name: '', // These can be filled later when editing
//     };

//     // Add the new row to the data
//     setData((prevData) => [newRow, ...prevData]);

//     Swal.fire("Success", "Data saved successfully", "success");

//     // Reset form + close modal
//     setIsAddModalOpen(false);
//     setPlantCode("");
//     setSelectedDept("");
//     setSelectedDesignation("");
//     setTotalReq("");
//     setAvailabilityAdd("");
//     setActualReqAdd("");

//   } catch (error) {
//     console.error(error);
//     Swal.fire("Error", "Something went wrong while saving data", "error");
//   }
// };

//   // const handleModalSubmit = async () => {
//   //   // if (!validateForm()) return;

//   //   try {
//   //     setLoading(true);
//   //     const response = await fetch("http://127.0.0.1:8000/api/mrf-Upload-data", {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         "Accept": "application/json",
//   //         Authorization: `Bearer ${userToken.token}`,
//   //       },
//   //       body: JSON.stringify({
//   //         Plant_code: plantCode,
//   //         Department: selectedDept,
//   //         Designation: selectedDesignation,
//   //         Total_Requirement: parseInt(totalReq) || 0,
//   //         Availability: parseInt(availabilityAdd) || 0,
//   //         Actual_Requirement: parseInt(actualReqAdd) || 0
//   //       }),
//   //     });

//   //     const result = await response.json();
//   //     if (result.status === 200) {
//   //       Swal.fire('Updated!', 'Manpower Upload details updated successfully.', 'success');
//   //       fetchData();
//   //       setTransfer(false);
//   //     } else {
//   //       Swal.fire('Error!', 'Failed to update data.', 'error');
//   //     }
//   //   } catch (error) {
//   //     console.error('Error updating:', error);
//   //     Swal.fire('Error!', 'Failed to update data.', 'error');
//   //   } finally {
//   //     setLoading(false);

//   //   }
//   // };

//   const filteredData = data.filter((row) => {
//     const matchesSearch =
//       Object.values(row).some((val) =>
//         String(val).toLowerCase().includes(searchText.toLowerCase())
//       );
//     const matchesPlant = filterPlant ? row.Plant_code === filterPlant : true;
//     const matchesDept = filterDepartment ? row.Designation === filterDepartment : true;
//     return matchesSearch && matchesPlant && matchesDept;
//   });
//   // const uniquePlants = [...new Set(data.map(row => row.Plant_code))];
//   const uniqueDesignations = [...new Set(data.map(row => row.Designation))];
//   const uniqueDepartments = [...new Set(data.map(row => row.Department))];



//   const columns = [
//     { field: "Plant_code", headerName: "Plant Code", flex: 1, minWidth: 120 },
//     { field: "Department", headerName: "Department", flex: 1.2, minWidth: 150 },
//     { field: 'Designation', headerName: 'Designation', flex: 1.2, minWidth: 150 },
//     { field: 'Total_Requirement', headerName: 'Total Requirement', flex: 0.8, minWidth: 100 },
//     { field: 'Availability', headerName: 'Available', flex: 0.8, minWidth: 80 },
//     { field: 'Actual_Requirement', headerName: 'Actual Requirement', flex: 0.8, minWidth: 100 },
//     {
//       field: 'created_at',
//       headerName: 'Created At',
//       flex: 1,
//       minWidth: 100,
//       valueFormatter: (params) => {
//         if (!params) return '';
//         const date = new Date(params);
//         return `${String(date.getDate()).padStart(2, '0')}/${String(
//           date.getMonth() + 1
//         ).padStart(2, '0')}/${date.getFullYear()}`;
//       },
//     },
//     {
//       field: 'action',
//       headerName: 'Action',
//       flex: 0.6,
//       minWidth: 80,
//       renderCell: (params) => (
//         <button
//           onClick={() => handleEditClick(params.row)}
//           className="flex items-center gap-1 px-3 py-1 text-white transition-all duration-200 rounded-md shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
//         >
//           <Edit sx={{ fontSize: 16 }} />
//           Edit
//         </button>
//       ),
//     },
//   ];



//   const handlePlantCodeChange = (e) => setPlantCode(e.target.value);
//   const handleTotalAvailibility = (e) => setTotalReq(e.target.value);
//   const handleActual = (e) => setActualReqAdd(e.target.value);
// const handleAvailable = (e) => {
//   const avail = Number(e.target.value);
//   setAvailabilityAdd(avail);
//   setActualReqAdd(totalReq ? totalReq - avail : "");
// };

//   const handleDesignation = (e) => setDesgList(e.target.value);
//   const uniquePlants = [...new Set(data.map((row) => row.Plant_code))];
//   const uniqueDesignation = [...new Set(data.map((row) => row.Designation))];


//   return (
//     <>

//       <div className="w-full min-h-screen p-6 mx-auto border border-gray-300 rounded-lg shadow-md shadow-2xl max-w-7xl // rounded-3xl bg-gradient-to-br from-pink-100 via-gray-50 to-gray-100">
//         <div className="flex items-center px-8 py-6 bg-white border border-gray-100 shadow-lg rounded-2xl ">
//           {/* Left Accent Icon */}
//           <div className="flex items-center justify-center w-12 h-12 mr-4 text-white shadow-md rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
//             <BriefcaseIcon className="w-6 h-6" />
//           </div>

//           {/* Title + Subtitle */}
//           <div className="flex-1">
//             <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text">
//               Manpower Upload Form
//             </h1>
//             <p className="mt-1 text-sm text-gray-500">
//               Submit a request for hiring, replacements, or manpower planning
//             </p>
//           </div>

//           {/* Back Button */}
//           <motion.button
//             // onClick={handleBack}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="flex items-center gap-2 px-5 py-2 font-medium text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-600 // hover:shadow-lg hover:from-blue-600 hover:to-blue-700"
//           >
//             <ArrowLeftIcon className="w-5 h-5" />
//             Back
//           </motion.button>
//         </div>

//         {transfer && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//             <div className="w-full max-w-4xl overflow-y-auto bg-white shadow-2xl rounded-2xl">
//               <div className="sticky top-0 px-6 py-3 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-t-2xl">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className="text-xl font-bold">MRF Upload Record</h2>
//                     <p className="text-sm">MRF ID: {form.mrf_id}</p>
//                   </div>
//                   <button
//                     onClick={() => setTransfer(false)}
//                     className="p-2 transition-colors duration-150 hover:bg-white hover:bg-opacity-20 rounded-xl"
//                   >
//                     <X className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-112px)]">
//                 {/* Update Form */}
//                 <div className="p-6 border border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl">
//                   <h3 className="mb-4 text-lg font-semibold text-gray-900">Update Requirements</h3>

//                   <div className="grid grid-cols-3 gap-4">
//                     <div>
//                       <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700 ">
//                         <MapPin className="w-4 h-4" />
//                         Plant Code
//                       </label>

//                       <select

//                         value={plantCode}
//                         onChange={handlePlantCodeChange}
//                         className={getFieldClass("plant_code")}
//                         required
//                       >
//                         <option value="">Select Plant</option>
//                         {plantOptions.map((plant, idx) => (
//                           <option key={idx} value={plant.PLANT}>{plant.PLANT_NAME}</option>
//                         ))}
//                       </select>

//                     </div>
//                     <div>
//                       <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
//                         <Users className="w-4 h-4" />
//                         Employee Name
//                       </label>
//                       <input
//                         type="text"
//                         readOnly
//                         value={form.emp_name || ''}
//                         className={getFieldClass("emp_name")}
//                       />
//                     </div>

//                     <div>
//                       <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
//                         <Briefcase className="w-4 h-4" />
//                         Designation
//                       </label>
//                       <input
//                         type="text"
//                         readOnly
//                         value={form.designation || ''}
//                         className={getFieldClass("designation")}
//                       />
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-4 gap-4 pt-3 mb-3">


//                     <div>
//                       <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
//                         <Briefcase className="w-4 h-4" />
//                         Department
//                       </label>
//                       <input
//                         type="text"
//                         readOnly
//                         value={form.department || ''}
//                         className={getFieldClass("department")}
//                       />
//                     </div>
//                     <div>
//                       <label className="block mb-2 text-sm font-medium text-gray-700">
//                         Total Requirement <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={form.total_requirement || ''}
//                         onChange={(e) => setForm({ ...form, total_requirement: e.target.value })}
//                         className={getFieldClass("total_requirement", errors.total_requirement)}
//                         placeholder="Enter total requirement"
//                       />
//                       {errors.total_requirement && (
//                         <p className="mt-1 text-sm text-red-500">{errors.total_requirement}</p>
//                       )}
//                     </div>

//                     {/* Availability - Read Only */}
//                     <div>
//                       <label className="block mb-2 text-sm font-medium text-gray-700">
//                         Availability
//                       </label>
//                       <input
//                         type="text"
//                         readOnly
//                         value={form.availability || ''}
//                         className={getFieldClass("availability")}
//                       />
//                     </div>

//                     {/* Actual Requirement - Read Only */}
//                     <div>
//                       <label className="block mb-2 text-sm font-medium text-gray-700">
//                         Actual Requirement
//                       </label>
//                       <input
//                         type="text"
//                         readOnly
//                         value={form.actual_requirement || ''}
//                         className={getFieldClass("actual_requirement")}
//                       />
//                     </div>
//                   </div>


//                 </div>
//               </div>

//               <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
//                 <div className="flex items-center justify-end gap-3">
//                   <button
//                     onClick={() => setIsAddModalOpen(false)}
//                     className="px-6 py-2 text-gray-700 transition-colors duration-200 border border-gray-200 rounded-xl hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleModalSubmit}
//                     disabled={loading}
//                     className="px-6 py-2 text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
//                   >
//                     {loading ? (
//                       <div className="flex items-center gap-2">
//                         <RefreshCw className="w-4 h-4 animate-spin" />
//                         Updating...
//                       </div>
//                     ) : (
//                       'Update Record'
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}



//         <Paper sx={{
//           width: '100%',
//           mt: 4,
//           borderRadius: '20px',

//           boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
//           overflow: 'hidden'
//         }}>

//           <Box
//             sx={{
//               mb: 2,
//               display: 'flex',
//               flexDirection: { xs: 'column', md: 'row' },
//               gap: 2,
//               alignItems: { md: 'center' },
//               padding: 3,
//               borderRadius: '16px',

//               backgroundColor: 'rgba(120, 128, 128, 0.1)',

//               boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
//             }}>
//             <TextField
//               placeholder="Search records..."
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               size="small"
//               sx={{
//                 minWidth: 250,
//                 background: 'white',
//                 borderRadius: '14px',

//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: '14px',
//                   '&:hover fieldset': {
//                     borderColor: '#667eea',
//                   },
//                   '&.Mui-focused fieldset': {
//                     borderColor: '#667eea',
//                   }
//                 }
//               }}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Search sx={{ color: '#667eea' }} />
//                   </InputAdornment>
//                 ),
//                 endAdornment: searchText && (
//                   <InputAdornment position="end">
//                     <IconButton
//                       size="small"
//                       onClick={() => setSearchText('')}
//                       sx={{ color: '#999' }}
//                     >
//                       <Close />
//                     </IconButton>
//                   </InputAdornment>
//                 )
//               }}
//             />

//             <Select
//               value={filterPlant}
//               onChange={(e) => setFilterPlant(e.target.value)}
//               displayEmpty
//               size="small"
//               sx={{
//                 minWidth: 180,
//                 background: 'white',
//                 borderRadius: '12px',
//                 '& .MuiOutlinedInput-notchedOutline': {
//                   borderWidth: '2px',
//                 },
//                 '&:hover .MuiOutlinedInput-notchedOutline': {
//                   borderColor: '#667eea',
//                   borderWidth: '2px',
//                 },
//                 '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
//                   borderColor: '#667eea',
//                   borderWidth: '2px',
//                 },
//               }}
//             >
//               <MenuItem value="">All Plants</MenuItem>
//               {uniquePlants.map((plant) => (
//                 <MenuItem key={plant} value={plant}>
//                   {plant}
//                 </MenuItem>
//               ))}
//             </Select>


//             <Select
//               value={filterDepartment}
//               onChange={(e) => setFilterDepartment(e.target.value)}
//               displayEmpty
//               size="small"
//               sx={{
//                 minWidth: 200,
//                 background: 'white',
//                 borderRadius: '12px',
//                 '& .MuiOutlinedInput-notchedOutline': {
//                   borderColor: '#e2e8f0',
//                 },
//                 '&:hover .MuiOutlinedInput-notchedOutline': {
//                   borderColor: '#667eea',
//                 },
//                 '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
//                   borderColor: '#667eea',
//                 }
//               }}
//             >
//               <MenuItem value="">All Designations</MenuItem>
//               {uniqueDesignation.map((desi) => (
//                 <MenuItem key={desi} value={desi}>{desi}</MenuItem>
//               ))}
//             </Select>



//       <button
//   onClick={() => setIsAddModalOpen(true)}
//   className="flex items-center px-4 py-2 text-white transition-all duration-200 bg-blue-600 shadow-md rounded-xl hover:bg-blue-500 hover:shadow-lg"
// >
//   <Add className="w-6 h-6" />
//   ADD
// </button>



//             {isAddModalOpen && (
//               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//                 <div className="w-full max-w-4xl overflow-y-auto bg-white shadow-2xl rounded-2xl">
//                   <div className="sticky top-0 px-6 py-3 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-t-2xl">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h2 className="text-xl font-bold">Add Data</h2>

//                       </div>
//                       <button
//                         onClick={() => setIsAddModalOpen(false)}
//                         className="p-2 transition-colors duration-150 hover:bg-white hover:bg-opacity-20 rounded-xl"
//                       >
//                         <X className="w-5 h-5" />
//                       </button>
//                     </div>
//                   </div>

//                   <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-112px)]">
//                     {/* Update Form */}
//                     <div className="p-6 border border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl">
//                       <h3 className="mb-4 text-lg font-semibold text-gray-900">Update Requirements</h3>

//                       <div className="grid grid-cols-3 gap-4">
//                         <div>
//                           <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700 ">
//                             <MapPin className="w-4 h-4" />
//                             Plant Code
//                           </label>
//                           <select
//                             value={plantCode}
//                             onChange={handlePlantCodeChange}
//                             className="w-full px-4 py-3 mt-1 text-gray-900 transition duration-200 bg-white border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2"
//                             required
//                           >
//                             <option value="">Select Plant</option>
//                             {plantOptions.map((plant, idx) => (
//                               <option key={idx} value={plant.PLANT}>{plant.PLANT_NAME}</option>
//                             ))}
//                           </select>
//                         </div>


//                         <div>
//                           <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
//                             <Briefcase className="w-4 h-4" />
//                             Department
//                           </label>
//                           <select
//                             value={selectedDept}
//                             onChange={(e) => setSelectedDept(e.target.value)}
//                             className="w-full px-4 py-3 mt-1 text-gray-900 transition duration-200 bg-white border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2"
//                             required
//                           >
//                             {deptList?.map((dept, idx) => (
//                               <option key={idx} value={dept.DEPT}>
//                                 {dept.DEPT}
//                               </option>
//                             ))}
//                           </select>

//                         </div>

//                         <div>
//                           <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
//                             <Briefcase className="w-4 h-4" />
//                             Designation
//                           </label>
//                           <select
//                             value={selectedDesignation}
//                             onChange={(e) => setSelectedDesignation(e.target.value)}
//                             className="w-full px-4 py-3 mt-1 transition duration-200 bg-white border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2"
//                             required
//                           >
//                             {desgList?.map((desg, idx) => (
//                               <option key={idx} value={desg.DESIG}>
//                                 {desg.DESIG}
//                               </option>
//                             ))}
//                           </select>

//                         </div>
//                       </div>
//                       <div className="grid grid-cols-3 gap-4 pt-3 mb-3">


//                         <div>
//                           <label className="block mb-2 text-sm font-medium text-gray-700">
//                             Total Requirement <span className="text-red-500">*</span>
//                           </label>
//                           <input
//                             type="number"
//                             value={totalReq}
// required
//                             onChange={handleTotalAvailibility}


//                           className={getFieldClass("total_requirement", errors.total_requirement)}
//                             placeholder="Enter total requirement"
//                           />
                          
//                         </div>

//                         {/* Availability - Read Only */}
//                         <div>
//                           <label className="block mb-2 text-sm font-medium">
//                             Availability
//                           </label>
//                           <input
//                             type='number'
//                             onChange={handleAvailable}
//                             value={availabilityAdd}
//                             className={getFieldClass("availability")}
//                           />
//                         </div>

//                         {/* Actual Requirement - Read Only */}
//                         <div>
//                           <label className="block mb-2 text-sm font-medium text-gray-700">
//                             Actual Requirement
//                           </label>
//                           <input
//                             type='number'
//                             onChange={handleActual}
//                             value={actualReqAdd}
//                               readOnly
//                             className={getFieldClass("actual_requirement")}
//                           />
//                         </div>
//                       </div>


//                     </div>
//                   </div>

//                   <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
//                     <div className="flex items-center justify-end gap-3">
//                       <button
//                         onClick={() => setIsAddModalOpen(false)}
//                         className="px-6 py-2 text-gray-700 transition-colors duration-200 border border-gray-200 rounded-xl hover:bg-gray-50"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         onClick={handleModalSubmit}
//                         disabled={loading}
//                         className="px-6 py-2 text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
//                       >
//                         {loading ? (
//                           <div className="flex items-center gap-2">
//                             <RefreshCw className="w-4 h-4 animate-spin" />
//                             Updating...
//                           </div>
//                         ) : (
//                           'Update Record'
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}


//             <Box sx={{ display: 'flex', gap: 1, ml: { md: 'auto' } }}>
//               <Button
//                 variant="contained"
//                 size="small"
//                 onClick={() => {
//                   setFilterPlant("");
//                   setFilterDepartment("");
//                   setSearchText("");
//                 }}
//                 sx={{
//                   textTransform: "none",
//                   // background: 'linear-gradient(45deg, #050d32ff, #4f4857ff)',
//                   borderRadius: '10px',
//                   fontWeight: '600',
//                   // boxShadow: '0 4px 15px rgba(118, 75, 162, 0.3)',
//                   '&:hover': {
//                     background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
//                     boxShadow: '0 6px 20px rgba(118, 75, 162, 0.4)',
//                   },
//                   px: 2,
//                   py: 1
//                 }}
//                 startIcon={<FilterList />}
//               >
//                 Clear Filters
//               </Button>

//             </Box>
//           </Box>
//           {/* DataGrid */}
//           <Box sx={{
//             width: '100%',
//             height: '50vh',
//             borderRadius: '16px',
//             background: 'white',
//             overflow: 'hidden',

//           }}>
//             <DataGrid
//               rows={filteredData}
//               columns={columns}
//               getRowId={(row) => row.mrf_id}
//               loading={loading}
//               getRowClassName={(params) =>
//                 params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
//               }
//               paginationModel={paginationModel}
//               onPaginationModelChange={setPaginationModel}
//               pageSizeOptions={[5, 10, 25, 50]}
//               rowHeight={50}
//               columnHeaderHeight={55}
//               sx={{
//                 width: '100%',
//                 height: '100%',
//                 '& .MuiDataGrid-columnHeaders': {
//                   background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)',
//                   color: 'white',
//                   backgroundColor: 'red'
//                 },

//                 '& .MuiDataGrid-columnHeaderTitle': {
//                   fontWeight: '600',

//                   color: 'black',
//                 },
//                 '& .MuiDataGrid-row': {
//                   borderBottom: '1px solid #f1f5f9',
//                   '&:hover': {
//                     background: 'linear-gradient(90deg, #f8faff, #f0f4ff)',
//                   },
//                 },
//                 '& .even-row': {
//                   background: '#fafbff',
//                 },
//                 '& .odd-row': {
//                   background: '#ffffff',
//                 },
//                 '& .MuiDataGrid-cell': {
//                   fontSize: '14px',
//                   color: '#374151',
//                   fontWeight: '500',
//                   borderRight: '1px solid #f1f5f9',
//                 },
//                 '& .MuiDataGrid-cell:focus': {
//                   outline: 'none',
//                 },
//                 '& .MuiDataGrid-footerContainer': {
//                   background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
//                   borderTop: '1px solid #e0f2fe',
//                   color: '#0369a1',
//                 },
//                 '& .MuiTablePagination-root': {
//                   color: '#0369a1',
//                 },
//                 '& .MuiTablePagination-selectIcon': {
//                   color: '#0369a1',
//                 },
//                 '& .MuiIconButton-root': {
//                   color: '#0369a1',
//                   '&:hover': {
//                     backgroundColor: 'rgba(3, 105, 161, 0.1)'
//                   }
//                 },
//                 '& .MuiDataGrid-selectedRowCount': {
//                   color: '#0369a1',
//                   fontWeight: '500'
//                 },
//                 borderRadius: '16px',
//               }}
//             />
//           </Box>
//         </Paper>

//       </div>
//     </>


//   );
// };

// export default MrfUploadList;