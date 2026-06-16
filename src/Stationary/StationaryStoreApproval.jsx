import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { HiTrash } from 'react-icons/hi';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Paper, TextField } from '@mui/material';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { API_BASE_URL } from '../Config';
import { IMAGE_PATH } from "../Config";

const StationaryStoreApproval = () => {
  const { case_id } = useParams();
  const [statData, setStationaryData]=useState([]);
  const [formData, setFormData] = useState({
    date: "",
    request_for: "",
    name: "",
    email: "",
    emp_id: "",
    department: "",
    hod_name: "",
    items: [{ stationary: "", quantity: "", remarks: "" }],
    comments: "",
  });
  const [userToken, setToken] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo")) || {};
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const navigate = useNavigate();
  const [statSubData,setSubStationaryData]=useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
 // console.log(statSubData);
  const fetchDataByEmpId = async() => 
{
    try {
      const getDataStBYEmpId = await fetch(`${API_BASE_URL}gt-stat-userId/${case_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${userToken.token}`,
        }
      });
      const statAndSubStatData = await getDataStBYEmpId.json();

        // 🔥 Console full response
    console.log("Full API Response:", statAndSubStatData);

    // 🔥 Console specific parts
    console.log("Stationary_data:", statAndSubStatData.Stationary_data);
    console.log("SubStationary_data:", statAndSubStatData.SubStationary_data);
    
      setStationaryData(statAndSubStatData.Stationary_data[0]);
      const subStatFilter = statAndSubStatData.SubStationary_data.filter((item)=>item.sub_status === "Approve")
      setSubStationaryData(subStatFilter);
    } catch(error) 
    {
      console.error("Error in getting the data");
    }
  }

  useEffect(() => {
    if (case_id) {
      fetchDataByEmpId();
    }
  }, [case_id]);

  useEffect(() => 
{
    const isPageRefresh = performance.navigation && performance.navigation.type === 1;
    if (isPageRefresh || document.referrer === document.location.href) {
      localStorage.removeItem('stationeryFormDraft');
    }
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: formattedDate }));
  }, []);

  const handleBack = () => {
    navigate('/StationaryList');
  };

  //Hod Approval
  const handleApprove = () => {
    Swal.fire({
      title: 'Approved!',
      text: `Case ID: ${case_id} has been approved successfully`,
      icon: 'success',
      confirmButtonColor: '#10b981',
    });
  } 

  const userData = 
  {
    "hod_name": userToken.employee,
  }

  // Submit Approval selected rows
  const handleApproveSelected = async() => 
    {
    const selectedData = statSubData.filter((row) =>
      selectedRowIds.includes(row.substationary_id)
    );
    const UnselectedData = statSubData.filter((row) =>
      !selectedRowIds.includes(row.substationary_id)
    );
    console.log(UnselectedData);
    const data = 
    {
      "subStat":selectedData,"UserData":userData,"UnselectedData":UnselectedData
    }
    console.log(data);
    try {
      const subStatUpdate = await fetch(`${API_BASE_URL}stat-hod-aprvl`,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
            "Accept":"application/json",
            Authorization:  `Bearer ${userToken.token}`
          },
          body:JSON.stringify(data)
        });
        if(subStatUpdate.ok)
          {
          // Show success sweet alert
          Swal.fire({
            title: 'Approved!',
            text: `Case ID: ${case_id} has been approved successfully`,
            icon: 'success',
            confirmButtonColor: '#10b981',
          });
          fetchDataByEmpId();
        }
      
    } catch(error) {
      console.error("Error In Updating");
      // Show error sweet alert
      Swal.fire({
        title: 'Error!',
        text: 'Failed to approve the stationery request',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  //Reject Selected Rows-----
  const handleRejectSelected = async() => {
    const selectedData = statSubData.filter((row) =>
      selectedRowIds.includes(row.substationary_id)
    );
   // console.log({"subStat":selectedData});
   // console.log({"userData":userData});
    const data = 
    {
      "subStat":selectedData,"UserData":userData
    }
    // Post selectedData to your API if needed here
    try {
      const subStatUpdate = await fetch(`${API_BASE_URL}stat-hod-rejct`,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
            "Accept":"application/json",
            Authorization:  `Bearer ${userToken.token}`
          },
          body:JSON.stringify(data)
        });
        if(subStatUpdate.ok)
        {
            // Show rejection sweet alert
            Swal.fire({
            title: 'Rejected!',
            text: `Case ID: ${case_id} has been rejected`,
            icon: 'error',
            confirmButtonColor: '#ef4444',
          });
          fetchDataByEmpId();
        }
    } catch(error) 
    {
      console.error("Error In Updating");
      // Show error sweet alert
      Swal.fire({
        title: 'Error!',
        text: 'Failed to reject the stationery request',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
      });
    }
  };

  const columns = [
    { 
      field: 'case_id', 
      headerName: 'CASE ID', 
      width: 110,
      headerClassName: 'table-header',
    },
    {
      field: 'stationary',
      headerName: 'STATIONERY',
      width: 170,
      headerClassName: 'table-header',
    },
    {
      field: 'Quantity',
      headerName: 'QUANTITY',
      width: 110,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <TextField
          variant="standard"
          value={params.row.Quantity || ''}
          onChange={(e) =>
            handleInputChange(params.row.substationary_id, e.target.value, 'Quantity')
          }
          sx={{ fontSize: '0.75rem' }}
        />
      ),
    },
    {
      field: 'Comments',
      headerName: 'COMMENTS',
      width: 280,
      headerClassName: 'table-header',
      flex: 1,
      renderCell: (params) => (
        <TextField
          variant="standard"
          value={params.row.Comments || ''}
          onChange={(e) =>
            handleInputChange(params.row.substationary_id, e.target.value, 'Comments')
          }
          sx={{ fontSize: '0.75rem', width: '100%' }}
        />
      ),
    },
  ];

  const handleInputChange = (id, value, field) => {
    setSubStationaryData(prev =>
      prev.map(row =>
        row.substationary_id === id ? { ...row, [field]: value } : row
      )
    );
  };
  
  const inputStyle = "w-full border border-blue-500 rounded-xl p-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400";
  const highlightedInputStyle = "w-full border border-blue-500 rounded-xl p-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";
  const errorInputStyle = "w-full border border-red-500 rounded-xl p-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-400 bg-red-50";

  return (
    <div className="pt-10 pb-8 px-6 -mt-10">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow border-2 border-blue-500 overflow-hidden">
          <div className="p-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img src={`${IMAGE_PATH}/quote6.png`} alt="Logo" className="mr-2 w-60 h-12 rounded-lg" />
              </div>
              <div className="flex-grow flex justify-center">
                <div className="bg-[#83bcc9] px-4 py-1 rounded-lg inline-block -ml-28">
                  <h1 className="text-lg font-bold text-white">Stationery Store Approval Form</h1>
                </div>
              </div>
              <div>
                <button
                  onClick={handleBack}
                  className="text-white bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed] hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] rounded-full p-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="h-0.5 bg-blue-600 w-[95%] mx-auto"></div>

          <div className="p-6 space-y-4">
           
              {/* Top Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-4 gap-y-3">
                {/* Image Section - Smaller */}
                <div className="flex justify-center">
                  <img
                    src={`${IMAGE_PATH}/stationeryimg.jpg`}
                    alt="Form process illustration"
                    className="max-w-full h-24 mt-2"
                  />
                </div>

                {/* Right Side Form Fields - Now taking 3 columns */}
                <div className="space-y-1 lg:col-span-3">
                  {/* Row 1: Employee Name and Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Employee Name field */}
                    <div>
                      <div className="flex items-center">
                        <label className="w-1/3 text-indigo-800 font-bold text-xs">
                          Employee Name<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={statData.name}
                          readOnly
                          className={errors.name && attempted ? errorInputStyle : highlightedInputStyle}
                        />
                      </div>
                      {errors.name && attempted && (
                        <div className="ml-1/3 pl-24 text-red-500 text-xs">{errors.name}</div>
                      )}
                    </div>

                    {/* Date field */}
                    <div>
                      <div className="flex items-center">
                        <label className="w-1/3 text-indigo-800 font-bold text-xs">
                          Date<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          readOnly
                          className={errors.date && attempted ? errorInputStyle : highlightedInputStyle}
                        />
                      </div>
                      {errors.date && attempted && (
                        <div className="ml-1/3 pl-24 text-red-500 text-xs">{errors.date}</div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Email Id (full width) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center">
                        <label className="w-1/3 text-indigo-800 font-bold text-xs">
                          Email Id<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={statData.email}
                          readOnly
                          className={errors.email && attempted ? errorInputStyle : highlightedInputStyle}
                        />
                      </div>
                      {errors.email && attempted && (
                        <div className="ml-1/3 pl-24 text-red-500 text-xs">{errors.email}</div>
                      )}
                    </div>
                  </div>


                  {/* Row 3: Request For and Employee ID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Request For - Radio Buttons */}
                    <div>
                      <div className="flex items-center">
                        <label className="w-1/3 text-indigo-800 font-bold text-xs">
                          Request For<span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex gap-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="request_for"
                              checked={statData.request_for === "Self"}
                              disabled 
                              className={`mr-1 h-3 w-3 ${errors.request_for && attempted ? "text-red-600" : "text-blue-600"}`}
                            />
                            <span className="text-xs">Self</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="request_for"
                              checked={statData.request_for === "Others"}
                              disabled
                              className={`mr-1 h-3 w-3 ml-8 ${errors.request_for && attempted ? "text-red-600" : "text-blue-600"}`}
                            />
                            <span className="text-xs">Others</span>
                          </label>
                        </div>
                      </div>
                      {errors.request_for && attempted && (
                        <div className="ml-1/3 pl-24 text-red-500 text-xs">{errors.request_for}</div>
                      )}
                    </div>
                    
                    {/* Employee ID field */}
                    <div>
                      <div className="flex items-center">
                        <label className="w-1/3 text-indigo-800 font-bold text-xs">
                          Employee ID<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="emp_id"
                          value={statData.emp_id} 
                          readOnly
                          className={errors.emp_id && attempted ? errorInputStyle : highlightedInputStyle}
                        />
                      </div>
                      {errors.emp_id && attempted && (
                        <div className="ml-1/3 pl-24 text-red-500 text-xs">{errors.emp_id}</div>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Department and Department HOD */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Department field */}
                    <div>
                      <div className="flex items-center">
                        <label className="w-1/3 text-indigo-800 font-bold text-xs">
                          Department<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={statData.department}
                          readOnly
                          className={errors.department && attempted ? errorInputStyle : highlightedInputStyle}
                        />
                      </div>
                      {errors.department && attempted && (
                        <div className="ml-1/3 pl-24 text-red-500 text-xs">{errors.department}</div>
                      )}
                    </div>
                    
                    {/* Department HOD field */}
                    <div>
                      <div className="flex items-center">
                        <label className="w-1/3 text-indigo-800 font-bold text-xs">
                          Department HOD<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={statData.current_user}
                          readOnly
                          className={errors.hod_name && attempted ? errorInputStyle : highlightedInputStyle}
                        />
                      </div>
                      {errors.hod_name && attempted && (
                        <div className="ml-1/3 pl-24 text-red-500 text-xs">{errors.hod_name}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Logs and Comments Section - keeping original styling */}
              <div className="mt-2 mx-4 space-y-2">
                <div>
                  <div className="flex items-center mb-1">
                    <label className="text-indigo-800 font-bold text-xs">Logs and Comments</label>
                  </div>
                  
                  {/* Header with two columns */}
                  <div className="bg-blue-600 text-white grid grid-cols-2 p-1 rounded-t-lg">
                    <div className="font-medium text-xs pr-1 border-r border-white">Activity Logs</div>
                    <div className="font-medium text-xs pl-1">Comments</div>
                  </div>
                  
                  {/* Logs and Comments row */}
                  <div className="grid grid-cols-2 border-b border-gray-300 p-1 rounded-b-lg">
                    <div className="pr-1 border-r border-gray-300">
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="text-sm bg-gradient-to-r from-red-500 to-yellow-300 text-white px-2 py-1 rounded">
                        {statData.raiser_date}
                      </span> <span className="text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-300 text-white px-2 py-1 rounded">{`Raised by ${statData.name}`}</span>
                  </div>
                  {
                    statData.hod_aprvl_date ? (
                      <div className="text-sm text-gray-700">
                        <span className="text-sm bg-gradient-to-r from-red-500 to-yellow-300 text-white px-2 py-1 rounded">
                          {statData.hod_aprvl_date}
                        </span> 
                        <span className="text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-300 text-white px-2 py-1 rounded">
                          {`Last approved by ${statData.hod_name}`}
                        </span>
                        {/* {new Date(new Date().getTime() - 24*60*60*1000).toLocaleString()} - Last Modified */}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700">
                        <span className="text-sm bg-gradient-to-r from-red-500 to-yellow-300 text-white px-2 py-1 rounded">
                          Approval is in First Stage
                        </span> 
                        <span className="text-xs font-bold ml-1 bg-gradient-to-r from-blue-500 to-blue-300 text-white px-2 py-1 rounded">
                          {`Last approved by ${statData.hod_name}`}
                        </span>
                        {/* {new Date(new Date().getTime() - 24*60*60*1000).toLocaleString()} - Last Modified */}
                      </div>
                    )
                  }
                    </div>
                    <div className="pl-1">
                    <textarea
                      name="comments"
                      placeholder="Add your comments here..."
                      value="No Comments"
                      readOnly
                      className={`${inputStyle} text-center pt-3 h-10 rounded-lg text-xs bg-gradient-to-r from-blue-500 to-blue-300 text-white px-2 py-1`}
                    >
                    </textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stationery Items Section with DataGrid - improved styling */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-indigo-800 font-bold text-base ml-4">Stationery Items<span className="text-red-500 ml-1">*</span></label>
                </div>
                
                <div className="mx-4">
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleApproveSelected}
                      disabled={selectedRowIds.length === 0}
                      sx={{ 
                        fontSize: '0.7rem', 
                        py: 0.5, 
                        bgcolor: '#10b981', 
                        '&:hover': { bgcolor: '#059669' },
                        '&.Mui-disabled': { bgcolor: '#d1fae5', color: '#065f46' }
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleRejectSelected}
                      disabled={selectedRowIds.length === 0}
                      sx={{ 
                        fontSize: '0.7rem', 
                        py: 0.5, 
                        bgcolor: '#ef4444', 
                        '&:hover': { bgcolor: '#dc2626' },
                        '&.Mui-disabled': { bgcolor: '#fee2e2', color: '#991b1b' }
                      }}
                    >
                      Reject 
                    </Button>
                  </div>
                  
                  <Paper 
                    elevation={0}
                    sx={{ 
                      height: 280, 
                      width: '100%', 
                      border: '1px solid #bfdbfe',
                      borderRadius: '0.5rem',
                      overflow: 'hidden'
                    }}
                  >
                    <DataGrid
                            rows={statSubData}
                            columns={columns}
                            getRowId={(row) => row.substationary_id}
                            checkboxSelection
                            onRowSelectionModelChange={(ids) => setSelectedRowIds(ids)}
                            sx={{
                            border: 0,
                            '.MuiDataGrid-columnHeaders': {
                                backgroundColor: '#dbeafe', // light blue
                                color: '#1e40af',
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                                borderBottom: '1px solid #e5e7eb',
                            },
                            '.MuiDataGrid-cell': {
                                fontSize: '0.75rem',
                                padding: '4px 8px',
                                borderRight: '1px solid #e5e7eb', // 👈 vertical line
                            },
                            '.MuiDataGrid-columnHeader': {
                                borderRight: '1px solid #e5e7eb', // 👈 vertical line in header
                            },
                            '.MuiDataGrid-row': {
                                borderBottom: '1px solid #f0f9ff',
                            },
                            '.MuiDataGrid-row:hover': {
                                backgroundColor: '#f0f9ff',
                            },
                            '.MuiDataGrid-row:nth-of-type(even)': {
                                backgroundColor: '#f8fafc',
                            },
                            '.MuiCheckbox-root': {
                                color: '#3b82f6',
                                padding: '2px',
                            },
                            '.MuiDataGrid-footerContainer': {
                                borderTop: '1px solid #e5e7eb',
                                backgroundColor: '#f8fafc',
                            },
                            '.MuiTablePagination-root': {
                                fontSize: '0.75rem',
                            },
                            }}
                            initialState={{
                            pagination: {
                                paginationModel: { pageSize: 5, page: 0 },
                            },
                            }}
                            pageSizeOptions={[5, 10]}
                        />
                  </Paper>
                </div>
              </div>
          </div>
        </div>
      </div>

      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default StationaryStoreApproval;