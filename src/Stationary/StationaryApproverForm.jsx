import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Paper, TextField, Tooltip, Checkbox } from '@mui/material';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../Config';
import { IMAGE_PATH } from "../Config";

const StationeryApproverForm = () => {
  const { case_id } = useParams();
  const [statData, setStationaryData] = useState([]);
  const [statComment, setCommentData] = useState([]);
  const [errors, setError] = useState('');
  const [statSubData, setSubStationaryData] = useState([]);
  const [joinedData, setJoinedData] = useState([]);
  const [isApproving, setIsApproving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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
  const navigate = useNavigate();
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const fetchDataByEmpId = async () => {
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
      setStationaryData(statAndSubStatData.Stationary_data[0]);
      const { SubStationary_data } = statAndSubStatData;

      const balanceResponse = await fetch(`${API_BASE_URL}statstock`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${userToken.token}`
        }
      });

      const balanceData = await balanceResponse.json();
      let stockData = [];
      if (balanceData.success && balanceData.data) {
        stockData = balanceData.data;
      } else if (Array.isArray(balanceData)) {
        stockData = balanceData;
      }

      const balanceMap = {};
      stockData.forEach(stock => {
        balanceMap[stock.MAT] = stock.BAL_QUAN;
      });

      if (Number(userToken.Is_Employee) === 2) {
        const approvedItems = SubStationary_data.filter(
          item => item.sub_status === "Approve"
        ).map(item => ({
          ...item,
          original_quantity: item.Quantity,
          Quantity: item.approved_quantity || item.Quantity,
          balance_quantity: balanceMap[item.stationary] || 0
        }));
        setSubStationaryData(approvedItems);
        setSelectedRowIds(approvedItems.map(item => item.substationary_id));
      } else {
        const todoItems = SubStationary_data.filter(item => item.sub_status === "TO_DO").map(item => ({
          ...item,
          balance_quantity: balanceMap[item.stationary] || 0
        }));
        setSubStationaryData(todoItems);
      }
    } catch (error) {
      console.error("Error in getting the data");
    }
  }

  useEffect(() => {
    if (case_id) {
      fetchDataByEmpId();
    }
  }, [case_id]);

  useEffect(() => {
    if (!statData?.case_id) return;

    const fetchJoinedData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}getJoinedData`, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: `Bearer ${userToken.token}`,
          },
        });
        const data = await response.json();
        if (data.status === 200 && data.joinedStatAndEmpsTable) {
          setJoinedData(data.joinedStatAndEmpsTable);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };

    fetchJoinedData();
  }, [statData]);

  const getRaiserEmployeeType = () => {
    if (!joinedData.length || !statData?.case_id) return null;
    const matchedRecord = joinedData.find(record =>
      record.case_id === statData.case_id ||
      record.id === statData.case_id
    );
    return matchedRecord ? (matchedRecord.Is_Employee || matchedRecord.is_employee || matchedRecord.employee_type) : null;
  };

  useEffect(() => {
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

  const userData = {
    "hod_name": userToken.employee,
  }

  const handleApproveSelected = async () => {
    const selectedData = statSubData.filter((row) =>
      selectedRowIds.includes(row.substationary_id)
    );

    const UnselectedData = statSubData.filter((row) =>
      !selectedRowIds.includes(row.substationary_id)
    );

    const validationErrors = [];

    selectedData.forEach((item, index) => {
      if ((item.balance_quantity === 0 || item.balance_quantity === "0") &&
        item.Quantity && parseInt(item.Quantity) > 0) {
        validationErrors.push(`Item "${item.stationary}": Cannot approve - Requested quantity (${item.Quantity}) exceeds available quantity (0)`);
      }

      if (item.Quantity && item.balance_quantity && parseInt(item.Quantity) > parseInt(item.balance_quantity)) {
        validationErrors.push(`Item "${item.stationary}": Requested quantity (${item.Quantity}) exceeds available quantity (${item.balance_quantity})`);
      }

      if (item.Quantity && parseInt(item.Quantity) < 0) {
        validationErrors.push(`Item "${item.stationary}": Negative quantity is not allowed`);
      }

      if (item.balance_quantity && parseInt(item.balance_quantity) < 0) {
        validationErrors.push(`Item "${item.stationary}": Cannot approve - Invalid stock quantity (${item.balance_quantity})`);
      }
    });

    if (validationErrors.length > 0) {
      Swal.fire({
        title: 'Validation Error!',
        html: validationErrors.join('<br>'),
        icon: 'error',
        confirmButtonColor: '#ef4444',
        width: '400px',
        customClass: {
          popup: 'swal-compact',
          title: 'swal-compact-title',
          htmlContainer: 'swal-compact-text',
          confirmButton: 'swal-compact-button'
        }
      });
      return;
    }

    const mappedSelectedData = selectedData.map(item => ({
      ...item,
      ...(userToken.Is_Employee == 2
        ? { issued_quantity: item.Quantity }
        : { approved_quantity: item.Quantity })
    }));

    const data = {
      "subStat": mappedSelectedData,
      "UserData": userData,
      "UnselectedData": UnselectedData,
      statComment
    };

    var selectedCount = data.subStat.length;
    var unselectedCount = data.UnselectedData.length;

    var url = null;
    if (!(userToken.Is_Employee == 2)) {
      url = "stat-hod-aprvl";
    } else {
      url = "stat-store-approval";
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to approve this request? You have selected ${selectedCount} item(s) and unselected ${unselectedCount} item(s).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsApproving(true);

    try {
      const subStatUpdate = await fetch(`${API_BASE_URL}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${userToken.token}`
        },
        body: JSON.stringify(data)
      });

      if (subStatUpdate.ok) {
        Swal.fire({
          title: 'Approved!',
          text: `Case ID: ${case_id} has been approved successfully`,
          icon: 'success',
          confirmButtonColor: '#10b981',
        });
        fetchDataByEmpId();
        navigate('/StationaryList');
      }

    } catch (error) {
      console.error("Error In Updating");
      Swal.fire({
        title: 'Error!',
        text: 'Failed to approve the stationery request',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectSelected = async () => {
    const selectedData = statSubData.filter((row) =>
      selectedRowIds.includes(row.substationary_id)
    );

    const data = {
      "subStat": selectedData, "UserData": userData, statComment
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "want to reject this request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsClosing(true);

    try {
      const subStatUpdate = await fetch(`${API_BASE_URL}stat-hod-rejct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${userToken.token}`
        },
        body: JSON.stringify(data)
      });

      if (subStatUpdate.ok) {
        Swal.fire({
          title: 'Rejected!',
          text: `Case ID: ${case_id} has been rejected`,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
        fetchDataByEmpId();
        navigate('/StationaryList');
      }
    } catch (error) {
      console.error("Error In Updating");
      Swal.fire({
        title: 'Error!',
        text: 'Failed to reject the stationery request',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
      });
    } finally {
      setIsClosing(false);
    }
  };

  // Updated columns with fixed widths and no scroll
  const columns = [
  {
    field: 'sno',
    headerName: 'S.NO',
    width: 60,
    headerClassName: 'table-header',
    flex: 0.3,
    renderCell: (params) => (
      <div style={{
        textAlign: 'center',
        width: '100%'
      }}>
        {params.api.getRowIndexRelativeToVisibleRows(params.row.substationary_id) + 1}
      </div>
    ),
  },
  {
    field: 'case_id',
    headerName: 'CASE ID',
    width: 110,
    headerClassName: 'table-header',
    flex: 0.5,
  },
  {
    field: 'stationary',
    headerName: 'STATIONERY',
    // Give more width to stationery column and allow it to grow
    flex: 2,
    minWidth: 280,
    headerClassName: 'table-header',
    renderCell: (params) => (
      <div style={{
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        lineHeight: '1.3',
        padding: '8px 4px'
      }}>
        {params.value}
      </div>
    ),
  },
  {
    field: 'Quantity',
    headerName: 'QUANTITY',
    width: 100,
    headerClassName: 'table-header',
    flex: 0.5,
    renderCell: (params) => (
      <TextField
        variant="outlined"
        size="small"
        type="number"
        value={params.row.Quantity || ''}
        onChange={(e) => {
          handleInputChange(params.row.substationary_id, e.target.value, 'Quantity')
        }}
        inputProps={{
          min: 0,
          step: 1
        }}
        sx={{
          fontSize: '0.75rem',
          width: '80px',
          '& .MuiOutlinedInput-root': {
            fontSize: '0.75rem',
            padding: '4px 8px',
            backgroundColor: 'white',
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
            },
          },
          '& .MuiInputBase-input': {
            padding: '4px 8px',
          },
          '& input[type=number]': {
            MozAppearance: 'textfield',
          },
          '& input[type=number]::-webkit-outer-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
          '& input[type=number]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
        }}
      />
    ),
  },
  // COMMENTS COLUMN - Only shown for Store Person (Is_Employee == 2)
  ...(userToken.Is_Employee == 2 ? [{
    field: 'hod_comments',
    headerName: 'COMMENTS',
    width: 200,
    headerClassName: 'table-header',
    flex: 1,
    renderCell: (params) => (
      <TextField
        variant="outlined"
        size="small"
        multiline
        minRows={1}
        maxRows={3}
        value={params.row.store_comments || ''}
        onChange={(e) =>
          handleInputChange(params.row.substationary_id, e.target.value, 'store_comments')
        }
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        sx={{
          fontSize: '0.75rem',
          width: '100%',
          '& .MuiOutlinedInput-root': {
            fontSize: '0.75rem',
            backgroundColor: 'white',
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
            },
          },
          '& .MuiInputBase-input': {
            padding: '4px 8px',
            resize: 'none',
          }
        }}
        placeholder="Enter your comments..."
      />
    ),
  }] : []),
  {
    field: 'balance_quantity',
    headerName: 'AVAIL. QTY',
    width: 100,
    headerClassName: 'table-header',
    align: 'center',
    flex: 0.5,
    renderCell: (params) => (
      <div style={{
        padding: '4px 8px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: params.value > 0 ? '#2e7d32' : params.value === 0 ? '#f57c00' : '#d32f2f',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
      }}>
        {params.value || 0}
      </div>
    ),
  },
];

  const handleInputChange = (id, value, field) => {
    if (field === 'Quantity') {
      const quantity = parseInt(value);
      const raiserEmployeeType = getRaiserEmployeeType();

      if (raiserEmployeeType) {
        let limit;
        if (raiserEmployeeType === 1 || raiserEmployeeType === 2) { 
          limit = 2;
        } else if (raiserEmployeeType === 3) {
          limit = 10;
        } else {
          limit = 2;
        }

        if (quantity > limit) {
          Swal.fire({
            title: 'Limit Exceeded!',
            text: `Maximum allowed quantity for this request is ${limit} (based on raiser's employee type)`,
            icon: 'warning',
            confirmButtonColor: '#3085d6'
          });
          return;
        }
      }
    }

    setSubStationaryData(prev =>
      prev.map(row =>
        row.substationary_id === id ? { ...row, [field]: value } : row
      )
    );
  };

  // Fixed height to prevent scroll on the table body
  const calculateTableHeight = () => {
    const rowHeight = 52;
    const headerHeight = 52;
    const footerHeight = 52;
    const minHeight = 200;
    const calculatedHeight = headerHeight + footerHeight + (statSubData.length * rowHeight);
    // Return a fixed height that fits the content without forcing scroll
    return Math.max(calculatedHeight, minHeight);
  };

  const inputStyle = "w-full border border-blue-500 rounded-xl p-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400";
  const highlightedInputStyle = "w-full border border-blue-500 rounded-xl p-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50";

  return (
    <div className="px-6 pt-10 pb-8 -mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="overflow-hidden bg-white border-2 border-blue-500 rounded-lg shadow">
          <div className="p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img src={`${IMAGE_PATH}/quote6.png`} alt="Logo" className="h-12 mr-2 rounded-lg w-60" />
              </div>
              <div className="flex justify-center flex-grow">
                <div className="bg-[#83bcc9] px-4 py-1 rounded-lg inline-block -ml-28">
                  {userToken.Is_Employee == 2 ? (<h1 className="text-lg font-bold text-white">Stationery Store Approval Form</h1>) : (<h1 className="text-lg font-bold text-white">Stationery HOD Approval Form</h1>)}
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
              <div className="flex justify-center">
                <img
                  src={`${IMAGE_PATH}/stationeryimg.jpg`}
                  alt="Form process illustration"
                  className="h-24 max-w-full mt-2"
                />
              </div>

              <div className="space-y-1 lg:col-span-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-xs font-bold text-indigo-800">
                        Employee Name<span className="ml-1 text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={statData.name}
                        readOnly
                        className={highlightedInputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-xs font-bold text-indigo-800">
                        Date<span className="ml-1 text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        readOnly
                        className={highlightedInputStyle}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-xs font-bold text-indigo-800">
                        Email Id<span className="ml-1 text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={statData.email}
                        readOnly
                        className={highlightedInputStyle}
                      />
                    </div>
                  </div>
                </div>

                {statData.request_for === "Others" && (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <div className="flex items-center">
                        <label className="w-1/3 text-xs font-bold text-indigo-800">
                          Other's Name<span className="ml-1 text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="others_name"
                          value={statData.others_name || ''}
                          readOnly
                          className={highlightedInputStyle}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-xs font-bold text-indigo-800">
                        Request For<span className="ml-1 text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="request_for"
                            checked={statData.request_for === "Self"}
                            disabled
                            className="mr-1 h-3 w-3 text-blue-600"
                          />
                          <span className="text-xs">Self</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="request_for"
                            checked={statData.request_for === "Others"}
                            disabled
                            className="mr-1 h-3 w-3 ml-8 text-blue-600"
                          />
                          <span className="text-xs">Others</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-xs font-bold text-indigo-800">
                        Employee ID<span className="ml-1 text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="emp_id"
                        value={statData.emp_id}
                        readOnly
                        className={highlightedInputStyle}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-xs font-bold text-indigo-800">
                        Department<span className="ml-1 text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={statData.department}
                        readOnly
                        className={highlightedInputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-xs font-bold text-indigo-800">
                        {(userToken.Is_Employee == 2) ? (<>Stores Department</>) : (<>Department HOD</>)}<span className="ml-1 text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="hod_name"
                        value={statData.current_user}
                        readOnly
                        className={highlightedInputStyle}
                      />
                    </div>
                  </div>
                </div>

                {(statData.req_for_emp_id || statData.req_for_emp_dept) && (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <div className="flex items-center">
                        <label className="w-1/3 text-xs font-bold text-indigo-800">
                          Req For EmpId<span className="ml-1 text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="req_for_emp_id"
                          value={statData.req_for_emp_id || ''}
                          readOnly
                          className={highlightedInputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center">
                        <label className="w-1/3 text-xs font-bold text-indigo-800">
                          Req. Emp Dept<span className="ml-1 text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="req_for_emp_dept"
                          value={statData.req_for_emp_dept || ''}
                          readOnly
                          className={highlightedInputStyle}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stationery Items Section - Fixed width table without scroll */}
            <div className="mt-4">
              <div className="flex flex-col items-center mx-4 mb-3">
                <label className="mb-2 text-base font-bold text-indigo-800">
                  Stationery Items<span className="ml-1 text-red-500">*</span>
                </label>
              </div>
              <div className="mx-4 overflow-x-auto">
                {!(statData.stores_status == "Approve") ? (
                  <Paper
                    elevation={0}
                    sx={{
                      width: '100%',
                      border: '1px solid #bfdbfe',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      // Ensure no horizontal scroll on the container
                      overflowX: 'auto'
                    }}
                  >
                    <div style={{ 
                      minWidth: '650px', 
                      height: calculateTableHeight(),
                      // Prevent vertical scroll by setting exact height
                      overflowY: 'hidden'
                    }}>
                      <DataGrid
                        rows={statSubData}
                        columns={columns}
                        getRowId={(row) => row.substationary_id}
                        checkboxSelection
                        disableRowSelectionOnClick
                        rowSelectionModel={selectedRowIds}
                        onRowSelectionModelChange={(ids) => {
                          if (userToken.Is_Employee != 2) {
                            setSelectedRowIds(ids);
                          }
                        }}
                        isRowSelectable={(params) => {
                          if (userToken.Is_Employee == 2) {
                            return false;
                          }
                          return true;
                        }}
                        hideFooterPagination
                        hideFooter
                        slots={{
                          baseCheckbox: (props) => {
                            if (props.inputProps && props.inputProps['aria-label'] === 'Select all rows') {
                              return (
                                <Tooltip title="Select All Items" placement="top" arrow>
                                  <Checkbox
                                    {...props}
                                    checked={selectedRowIds.length === statSubData.length && statSubData.length > 0}
                                    indeterminate={selectedRowIds.length > 0 && selectedRowIds.length < statSubData.length}
                                    onChange={(e) => {
                                      if (userToken.Is_Employee != 2) {
                                        if (e.target.checked) {
                                          setSelectedRowIds(statSubData.map(row => row.substationary_id));
                                        } else {
                                          setSelectedRowIds([]);
                                        }
                                      }
                                    }}
                                    disabled={userToken.Is_Employee == 2}
                                    sx={{
                                      color: '#3b82f6',
                                      '&.Mui-checked': { color: '#3b82f6' },
                                      '&.MuiCheckbox-indeterminate': { color: '#3b82f6' },
                                      '&.Mui-disabled': {
                                        color: '#93c5fd !important',
                                      },
                                      padding: '2px',
                                    }}
                                  />
                                </Tooltip>
                              );
                            }
                            return <Checkbox {...props} />;
                          },
                        }}
                        sx={{
                          border: '1px solid #3b82f6',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          '& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader': {
                            backgroundColor: '#2563eb !important',
                            color: 'white !important',
                          },
                          '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#2563eb !important',
                            color: 'white !important',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            borderBottom: '1px solid #3b82f6',
                          },
                          '& .MuiDataGrid-columnHeader--sortable .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 'bold',
                            color: 'white !important',
                          },
                          '& .MuiDataGrid-columnHeader': {
                            backgroundColor: '#2563eb !important',
                            color: 'white !important',
                            borderRight: '1px solid #93c5fd',
                          },
                          '& .MuiDataGrid-columnHeader .MuiDataGrid-sortIcon': {
                            color: 'white !important',
                          },
                          '& .MuiDataGrid-columnHeader .MuiDataGrid-menuIcon': {
                            color: 'white !important',
                          },
                          '& .MuiDataGrid-columnHeader .MuiDataGrid-menuIconButton': {
                            color: 'white !important',
                          },
                          '& .MuiDataGrid-columnHeader .MuiIconButton-root': {
                            color: 'white !important',
                          },
                          '& .MuiDataGrid-columnHeader .MuiCheckbox-root': {
                            color: 'white !important',
                            '& .MuiSvgIcon-root': {
                              color: 'white !important',
                            },
                          },
                          '& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root': {
                            color: 'white !important',
                            '& .MuiSvgIcon-root': {
                              color: 'white !important',
                            },
                          },
                          '& .MuiDataGrid-virtualScroller': {
                            overflowY: 'hidden !important',
                          },
                          '& .MuiDataGrid-cell': {
                            border: '1px solid #93c5fd',
                            fontSize: '0.75rem',
                            padding: '4px',
                            whiteSpace: 'normal',
                            wordWrap: 'break-word',
                          },
                          '& .MuiDataGrid-row': {
                            borderBottom: '1px solid #e0f2fe',
                          },
                          '& .MuiDataGrid-row:nth-of-type(even)': {
                            backgroundColor: '#f0f9ff',
                          },
                          '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#e0f2fe',
                          },
                          '.MuiCheckbox-root': {
                            color: '#3b82f6',
                            padding: '2px',
                          },
                          '& .MuiDataGrid-footerContainer': {
                            borderTop: '1px solid #3b82f6',
                            backgroundColor: '#f8fafc',
                            display: 'none',
                          },
                        }}
                      />
                    </div>
                  </Paper>
                ) : (
                  <div className="px-2 py-1 text-center text-white rounded bg-gradient-to-r from-red-500 to-yellow-300">
                    Overall Process is Completed
                  </div>
                )}
              </div>
            </div>

            {/* Logs and Comments Section */}
            <div className="mx-4 mt-4 space-y-2">
              <div>
                <div className="flex items-center mb-1">
                  <label className="text-xs font-bold text-indigo-800">Logs and Comments</label>
                </div>

                <div className="grid grid-cols-2 p-1 text-white bg-blue-600 rounded-t-lg">
                  <div className="pr-1 text-xs font-medium border-r border-white">Hod Comments</div>
                  <div className="pl-1 text-xs font-medium">Activity Logs</div>
                </div>

                <div className="grid grid-cols-2 p-1 border-b border-gray-300 rounded-b-lg">
                  <div className="pr-1 border-r border-gray-300">
                    {statData.hod_comment ? (
                      <input
                        value={statData.hod_comment}
                        readOnly
                        className={`${inputStyle} text-center h-10 rounded-lg text-xs px-2`}
                        style={{ backgroundColor: "#83b9fb" }}
                        placeholder="Add your comments here..." />)
                      :
                      (<input
                        type="text"
                        name="overall_comment"
                        value={statComment.overall_comment}
                        onChange={(e) =>
                          setCommentData(() => ({ overall_comment: e.target.value }))
                        }
                        className={`${inputStyle} text-start h-10 rounded-lg text-xs px-2`}
                        placeholder="Add your comments here..." />)}
                  </div>
                  <div className="pl-1">
                    <div className="mb-2 text-sm text-gray-700">
                      <span className="px-2 py-1 text-sm text-white rounded bg-gradient-to-r from-red-500 to-yellow-300">
                        {statData.raiser_date
                          ? (() => {
                            const date = new Date(statData.raiser_date);
                            const formattedDate = date.toLocaleDateString('en-GB').replace(/\//g, '-');
                            const formattedTime = date.toLocaleTimeString('en-GB', {
                              hour12: false,
                            });
                            return `${formattedDate} ${formattedTime}`;
                          })()
                          : ''}
                      </span> <span className="px-2 py-1 text-xs font-bold text-white rounded bg-gradient-to-r from-blue-500 to-blue-300">{`Raised by ${statData.name}`}</span>
                    </div>
                    {
                      statData.hod_aprvl_date ? (
                        <div className="text-sm text-gray-700">
                          <span className="px-2 py-1 text-sm text-white rounded bg-gradient-to-r from-red-500 to-yellow-300">
                            {statData.hod_aprvl_date.split('.')[0]}
                          </span>
                          <span className="px-2 py-1 text-xs font-bold text-white rounded bg-gradient-to-r from-blue-500 to-blue-300">
                            {`Last approved by ${statData.hod_name}`}
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700">
                          <span className="px-2 py-1 text-sm text-white rounded bg-gradient-to-r from-red-500 to-yellow-300">
                            Approval is in First Stage
                          </span>
                          <span className="px-2 py-1 ml-1 text-xs font-bold text-white rounded bg-gradient-to-r from-blue-500 to-blue-300">
                            {`Last approved by ${statData.hod_name}`}
                          </span>
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* CENTERED BUTTONS */}
            <div className="flex items-center justify-center gap-2">
              {!(statData.stores_status == "Approve") ? (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleApproveSelected}
                  disabled={selectedRowIds.length === 0 || isApproving || isClosing}
                  sx={{
                    fontSize: '0.7rem',
                    py: 0.5,
                    bgcolor: (isApproving || isClosing) ? '#d1fae5' : '#10b981',
                    color: (isApproving || isClosing) ? '#065f46' : 'white',
                    '&:hover': {
                      bgcolor: (isApproving || isClosing) ? '#d1fae5' : '#059669'
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#d1fae5',
                      color: '#065f46'
                    },
                    minWidth: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isApproving ? (
                    <>
                      Approving
                      <div className="flex ml-1 space-x-1">
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </>
                  ) : isClosing ? (
                    'APPROVE'
                  ) : (
                    'APPROVE'
                  )}
                </Button>
              ) : ("")}

              {!(userToken.Is_Employee == 2) ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleRejectSelected}
                  disabled={selectedRowIds.length === 0 || isClosing || isApproving}
                  sx={{
                    fontSize: '0.7rem',
                    py: 0.5,
                    bgcolor: (isClosing || isApproving) ? '#fee2e2' : '#ef4444',
                    color: (isClosing || isApproving) ? '#991b1b' : 'white',
                    '&:hover': {
                      bgcolor: (isClosing || isApproving) ? '#fee2e2' : '#dc2626'
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#fee2e2',
                      color: '#991b1b'
                    },
                    minWidth: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isClosing ? (
                    <>
                      Closing
                      <div className="flex ml-1 space-x-1">
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </>
                  ) : isApproving ? (
                    'CLOSE'
                  ) : (
                    'CLOSE'
                  )}
                </Button>
              ) : ""}
            </div>
          </div>
        </div>
      </div>
      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </div>
  );
};

// Placeholder Modal component - replace with your actual implementation
const Modal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg">
        <p>Modal Content</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default StationeryApproverForm;