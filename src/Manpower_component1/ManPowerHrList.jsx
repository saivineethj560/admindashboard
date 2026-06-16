import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import * as XLSX from "xlsx";
import {  Search,  Filter,  Download,  History,  UserCheck,  Building,  Users,  Calendar,  MessageSquare,  X,  ChevronRight,  ChevronDown,  ArrowUpRight,  Clock,  CheckCircle,  AlertCircle,  XCircle,  RefreshCw,  FileText,  User,  MapPin,  Briefcase,  Eye,  Edit3,  Plus,  TrendingUp,  Activity,  Maximize,  Minimize
} from 'lucide-react';
import { MenuItem, Select } from '@mui/material';
import { API_BASE_URL } from "../Config";

const ManPowerHrList = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [historyData, setHistoryData] = useState([]);
  const [modalChildCaseId, setModalChildCaseId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const location = useLocation();
  const navigate = useNavigate();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyFullscreen, setHistoryFullscreen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const statusOptions = ['', 'WIP', 'Joined', 'Transfer', 'Reverted'];
  const [desgList, setDesgList] = useState([]);
  const [plantCodes, setPlantCodes] = useState([]);
  const [empDepartDesign, setempData] = useState([]);
  const [mhcemps, setMHCEmployees] = useState([]);
  const [modlData, setModlData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    EMPID: "",
    Current_Plant: "",
    Plant: "",
    current_designation: "",
    Design: "",
    Transfer_Date: "",
    updated_by: "",
    updated_date: "",
    Remarks: "",
  });
  
  const [historyFilters, setHistoryFilters] = useState({
    status: "",
    Plant: "",
    Design: ""
  });

  // Initialize form state
  const getInitialFormState = () => ({
    status: '',
    prevPlant: '',
    EMPID: '',
    currPlant: '',
    designation: '',
    transferDate: '',
    currentDate: '',
    joinDate: "",
    depat: "",
    comments: '',
    extendedDate: ''
  });

  const [form, setForm] = useState(getInitialFormState());

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      'WIP': 'bg-amber-100 text-amber-800 border-amber-200',
      'Joined': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Transfer': 'bg-blue-100 text-blue-800 border-blue-200',
      'Reverted': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'WIP': <Clock className="w-4 h-4" />,
      'Joined': <CheckCircle className="w-4 h-4" />,
      'Transfer': <ArrowUpRight className="w-4 h-4" />,
      'Reverted': <XCircle className="w-4 h-4" />
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  const getFieldClass = (fieldName, hasError = false, value = "") => {
    const baseClass = `w-full px-3 py-2.5 text-sm border rounded-lg transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500
    placeholder:text-gray-400 hover:border-blue-300 bg-white`;

    if (hasError) {
      return `${baseClass} border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-500`;
    }

    // Default highlight for status field
    if (fieldName === "status" && !value) {
      return `${baseClass} border-wheat-500 bg-blue-100 ring-2 ring-skyblue-600`;
    }

    if (['plant', 'dept', 'designation'].includes(fieldName)) {
      return `${baseClass} bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed`;
    }

    return `${baseClass} border-gray-200`;
  };

  // Calculate stats
  const stats = useMemo(() => {
    const statusCounts = rows.reduce((acc, row) => {
      acc[row.STATUS] = (acc[row.STATUS] || 0) + 1;
      return acc;
    }, {});

    return {
      total: rows.length,
      wip: statusCounts['WIP'] || 0,
      joined: statusCounts['Joined'] || 0,
      transfer: statusCounts['Transfer'] || 0,
      reverted: statusCounts['Reverted'] || 0
    };
  }, [rows]);

  useEffect(() => {
    const matched = data.filter((dt) => dt.CHILD_CASEID === modalChildCaseId);
    if (matched.length > 0) {
      setModlData(matched[0]);
    }
  }, [modalChildCaseId, data]);

  // Data fetching and initialization
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Fetch departments and designations
        const deptResponse = await axios.get(`${API_BASE_URL}dept`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${userToken.token}`,
          },
        });
        const designations = deptResponse.data.designations;
        setDesgList(designations);

        // Fetch plant codes
        const plantResponse = await fetch('http://mhcphp.myhomeconstructions.com:8084/inactive/phPAPI/plant_api', {
          method: "GET",
        });
        const plantData = await plantResponse.json();
        setPlantCodes(plantData);

        // Fetch MHC employees
        const emplResponseData = await fetch('http://mhcphp.myhomeconstructions.com:8084/inactive/phPAPI/fetch_all_employees.php', {
          method: "GET",
        });
        const emplResponseData1 = await emplResponseData.json();
        setMHCEmployees(emplResponseData1);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        Swal.fire('Error', 'Failed to load initial data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (userToken.token) {
      fetchInitialData();
    }
  }, [userToken.token]);

  const empDetailsEmpId = async (emp_id) => {
    try {
      const getempIdDetails = await fetch(`http://mhcphp.myhomeconstructions.com:8084/inactive/phPAPI/get_empdetails.php?uid=${emp_id}`, {
        method: "GET"
      });
      const jsonempData = await getempIdDetails.json();
      setempData(jsonempData.user);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}hr_requisition_list`, {
        headers: {
          "Content-Type": "application/json",
          Accept: 'application/json',
          Authorization: `Bearer ${userToken.token}`
        }
      });
      const responseData = response.data.data || [];
      const rowsWithId = responseData.map((row, index) => ({
        ...row,
        id: row.CHILD_CASEID || `row_${index}`
      }));
      setData(rowsWithId);
      setRows(rowsWithId);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire('Error', 'Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statusHistoryTable = async (child_caseId) => {
    try {
      setLoading(true);
      const statusData = await fetch(`${API_BASE_URL}mrf_status_history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${userToken.token}`
        },
        body: JSON.stringify({ childCaseId: child_caseId })
      });
      const historyData = await statusData.json();
      setHistoryData(historyData.Mrfdata || []);
      if (historyData.success) {
        setHistoryDialogOpen(true);
      }
    } catch (err) {
      console.error("Error fetching history data:", err);
      Swal.fire('Error', 'Failed to fetch history data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location.state?.refresh) fetchData();
  }, [location]);

  useEffect(() => {
    if (!userToken.token) navigate('/');
  }, [navigate, userToken?.token]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.status) {
      newErrors.status = 'Please Select Status';
    }
    if (form.status === 'Joined') {
      if (!form.EMPID?.trim()) newErrors.EMPID = 'Please Enter EMP_ID';
      if (!form.joinDate?.trim()) newErrors.joinDate = 'Please Enter Joined Date';
    }
    if (form.status === 'WIP') {
      if (!form.extendedDate) newErrors.extendedDate = 'Please Select Extended Date';
    }
    if (form.status) {
      if (!form.comments?.trim()) newErrors.comments = 'Please Enter Comments';
      if (form.status === 'Transfer') {
        if (!form.EMPID?.trim()) newErrors.EMPID = 'Please Enter EMP_ID';
        if (!form.currPlant) newErrors.currPlant = 'Please Enter Current Plant';
        if (!form.transferDate) newErrors.transferDate = 'Please Select Transfer Date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleButtonClick = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const rowData = rows.find(row => row.CHILD_CASEID === modalChildCaseId);
      if (!rowData) {
        Swal.fire('Error', 'Row data not found.', 'error');
        return;
      }
      const payload = {
        CASEID: rowData.CHILD_CASEID,
        STATUS: form.status,
        EMPID: form.status === 'Transfer' ? form.EMPID : form.status === 'Joined' ? form.EMPID : null,
        Raiser_Date: form.status === 'WIP' ? form.raiserDate : null,
        Extended_Date: form.status === 'WIP' ? form.extendedDate : null,
        Remarks: form.comments,
        JoinDate: form.joinDate,
        Current_dept: rowData.DEPT,
        Current_Designation: rowData.MANPOWER_DESG,
        Current_Plant: rowData.PLANT,
        Transfer_Date: form.status === 'Transfer' ? form.transferDate : null,
        Plant: form.status === 'Transfer' ? form.currPlant : null,
        Designation: form.status === 'Transfer' ? empDepartDesign.designation : form.status === 'Joined' ? form.designation : null,
        Department: form.status === 'Transfer' ? empDepartDesign.dept : form.status === 'Joined' ? form.depat : null
      };
      const response = await axios.post(`${API_BASE_URL}hr_status_update_history`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken.token}`,
        },
      });
      Swal.fire('Success', response.data.message || 'Status updated successfully!', 'success');
      
      setTransferDialogOpen(false);
      fetchData();
      // Reset form only on successful submission
      setForm(getInitialFormState());
      setErrors({});
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire('Error', 'Failed to update status.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchText) return rows;
    const search = searchText.toLowerCase();
    return rows.filter(row =>
      Object.entries(row).some(([key, value]) =>
        typeof value === 'string' && value.toLowerCase().includes(search)
      )
    );
  }, [rows, searchText]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleHistoryFilterChange = (key, value) => {
    setHistoryFilters({ ...historyFilters, [key]: value });
  };

  const filteredHistory = Array.isArray(historyData)
    ? historyData.filter((hist) => {
      return (
        (hist.status ?? "").toLowerCase().includes((historyFilters.status ?? "").toLowerCase()) &&
        (hist.Plant ?? "").toLowerCase().includes((historyFilters.Plant ?? "").toLowerCase()) &&
        (hist.Design ?? "").toLowerCase().includes((historyFilters.Design ?? "").toLowerCase())
      );
    })
    : [];

  const exportToExcel = () => {
    if (!filteredHistory.length) {
      Swal.fire('Info', 'No data to export', 'info');
      return;
    }

    const tableData = filteredHistory.map((hist, index) => ({
      "S.No": index + 1,
      "Status": hist.status,
      "EMPID": hist.EMPID,
      "Current Plant": hist.Current_Plant,
      "Plant": hist.Plant,
      "Current Designation": hist.current_designation,
      "Designation": hist.Design,
      "Transfer Date": hist.Transfer_Date,
      "Updated By": hist.updated_by,
      "Updated Date": hist.updated_date,
      "Remarks": hist.Remarks
    }));
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MRF History");
    XLSX.writeFile(workbook, "MRF_History.xlsx");
  };

  const handleStatusClick = (caseId) => {
    setModalChildCaseId(caseId);
    setForm(getInitialFormState()); // Reset form when opening for a new case
    setErrors({});
    setTransferDialogOpen(true);
  };

  const handleHistoryClick = (caseId) => {
    statusHistoryTable(caseId);
  };

  // Get unique values for dropdowns
  const uniquePlants = [...new Set(historyData.map(item => item.Plant).filter(Boolean))];
  const uniqueDesignations = [...new Set(historyData.map(item => item.Design).filter(Boolean))];

  return (
    <div className="min-h-screen p-6 overflow">
      < div className="w-full p-10 mx-auto border border-gray-300 shadow-2xl max-w-7xl rounded-3xl bg-gradient-to-br from-pink-100 via-gray-50 to-gray-100">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                  ManPower Hr Management
                </h1>
                <p className="text-lg text-gray-600">Streamline HR requisitions and track status updates efficiently</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-5">
              <div className="p-6 transition-shadow duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                    <Activity className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Cases</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 transition-shadow duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                    <Clock className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-700">Work in Progress</p>
                    <p className="text-2xl font-bold text-amber-800">{stats.wip}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 transition-shadow duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Joined</p>
                    <p className="text-2xl font-bold text-emerald-800">{stats.joined}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 transition-shadow duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                    <ArrowUpRight className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Transfers</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.transfer}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 transition-shadow duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl">
                    <XCircle className="w-6 h-6 text-red-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700">Reverted</p>
                    <p className="text-2xl font-bold text-red-800">{stats.reverted}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search cases, departments, employees..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full py-3 pl-12 pr-4 transition-all duration-200 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 text-gray-700 transition-colors duration-200 bg-gray-100 rounded-xl hover:bg-gray-200">
                  <Filter className="w-4 h-4" />
                  Advanced Filters
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-gray-600">Loading...</span>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="border-b border-gray-200 bg-gradient-to-r from-gray-300 to-gray-200">
                  <tr>
                    <th className="w-12 px-4 py-3 text-xs font-semibold text-left text-gray-700 border-r border-gray-300">S.NO</th>
                    <th className="w-20 px-4 py-3 text-xs font-semibold text-left text-gray-700 border-r border-gray-300">Plant</th>
                    <th className="w-24 px-4 py-3 text-xs font-semibold text-left text-gray-700 border-r border-gray-300">Case ID</th>
                    <th className="w-24 px-4 py-3 text-xs font-semibold text-left text-gray-700 border-r border-gray-300">Department</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 border-r border-gray-300 w-28">Designation</th>
                    <th className="w-20 px-4 py-3 text-xs font-semibold text-left text-gray-700 border-r border-gray-300">Status</th>
                    <th className="w-20 px-4 py-3 text-xs font-semibold text-left text-gray-700 border-r border-gray-300">EMP ID</th>
                    <th className="w-32 px-4 py-3 text-xs font-semibold text-left text-gray-700 border-r border-gray-300">Remarks</th>
                    <th className="px-4 py-3 text-xs font-semibold text-left text-gray-700 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((row, index) => (
                    <tr key={row.id} className="transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group">
                      <td className="px-4 py-3 text-xs font-medium text-gray-900 border-r border-gray-200">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                            <Building className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="font-medium truncate">{row.PLANT}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-blue-600 truncate border-r border-gray-200 cursor-pointer hover:text-blue-800">
                        {row.CHILD_CASEID}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-1.5">
                          <Users className="flex-shrink-0 w-3 h-3 text-gray-500" />
                          <span className="truncate">{row.DEPT}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="flex-shrink-0 w-3 h-3 text-gray-500" />
                          <span className="truncate">{row.MANPOWER_DESG}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(row.STATUS)}`}>
                          {getStatusIcon(row.STATUS)}
                          {row.STATUS}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900 border-r border-gray-200">
                        {row.EMPID && (
                          <div className="flex items-center gap-1.5">
                            <User className="flex-shrink-0 w-3 h-3 text-gray-500" />
                            <span className="truncate">{row.EMPID}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 border-r border-gray-200">
                        <div className="truncate max-w-32" title={row.REMARKS}>
                          {row.REMARKS}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStatusClick(row.CHILD_CASEID)}
                            className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
                          >
                            <Edit3 className="w-3 h-3" />
                            Update
                          </button>
                          <button
                            onClick={() => handleHistoryClick(row.CHILD_CASEID)}
                            className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-[rgba(7,13,145,0.8)] to-[rgba(72,13,145,0.8)] text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
                          >
                            <History className="w-3 h-3" />
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>of {filteredData.length} entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm transition-colors duration-200 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm transition-colors duration-200 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Dialog - Improved Form Layout */}
          {transferDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <div className="w-full max-w-4xl overflow-y-auto bg-white shadow-2xl rounded-2xl">
                <div className="sticky top-0 px-6 py-3 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">Update Status</h2>
                      <p className="text-sm">Case ID: {modlData?.CHILD_CASEID}</p>
                    </div>
                    <button
                      onClick={() => setTransferDialogOpen(false)}
                      className="p-2 transition-colors duration-150 hover:bg-white hover:bg-opacity-20 rounded-xl"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-112px)]">
                  {/* Current Details Card */}
                  <div className="p-6 border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Current Details
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
                          <MapPin className="w-4 h-4" />
                          Plant Code
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={modlData?.PLANT || ""}
                          className={getFieldClass("plant")}
                        />
                      </div>
                      <div>
                        <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
                          <Users className="w-4 h-4" />
                          Department
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={modlData?.DEPT || ''}
                          className={getFieldClass("dept")}
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
                          value={modlData?.MANPOWER_DESG || ''}
                          className={getFieldClass("designation")}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Update Form */}
                  <div>

                    <div className="p-6 border border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Update Status</h3>

                      {/* First Row: Status, Plant (if Transfer), EMP ID */}
                      <div className="grid grid-cols-3 gap-4 p-4 mb-4 border-gray-500">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Status <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={form.status || ""}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            displayEmpty
                            className="w-full"
                            sx={{
                              height: 42,
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#93b3f3ff',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#a5b4fc',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#9092f5ff',
                                boxShadow: '0 0 0 2px #6366f133'
                              },
                              '& .MuiSelect-select': {
                                padding: '10px 14px',
                                backgroundColor: '#fff',
                              },
                              '& .Mui-disabled': {
                                backgroundColor: '#f3f4f6',
                              }
                            }}
                          >

                            <MenuItem value="" disabled>
                              <span style={{ color: "#9ca3af" }}>Select Status</span>
                            </MenuItem>
                            {statusOptions.slice(1).map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.status && (
                            <p className="mt-1 text-sm text-red-500">{errors.status}</p>
                          )}
                        </div>

                        {form.status === "Transfer" && (
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Plant <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={form.currPlant}
                              onChange={(e) => setForm({ ...form, currPlant: e.target.value })}
                              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            >
                              <option value="" disabled>Select Plant</option>
                              {plantCodes.map((plant) => (
                                <option key={plant.PLANT_NAME} value={plant.PLANT_NAME}>
                                  {plant.PLANT_NAME}
                                </option>
                              ))}
                            </select>
                            {errors.currPlant && <p className="mt-1 text-sm text-red-500">{errors.currPlant}</p>}
                          </div>
                        )}

                        {(form.status !== 'WIP' && form.status !== 'Reverted' && form.status !== '') && (
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              EMP ID {(form.status === 'Joined' || form.status === 'Transfer') && <span className="text-red-500">*</span>}
                            </label>
                            {form.status === 'Joined' ? (
                              <input
                                type="text"
                                value={form.EMPID}
                                onChange={(e) => setForm({ ...form, EMPID: e.target.value })}
                                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                placeholder="Enter EMP ID"
                              />
                            ) : (
                              <select
                                value={form.EMPID}
                                onChange={(e) => {
                                  setForm({ ...form, EMPID: e.target.value });
                                  empDetailsEmpId(e.target.value);
                                }}
                                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                              >
                                <option value="" disabled>Select EMPID</option>
                                {mhcemps.map((emp) => (
                                  <option key={emp.EMP_ID} value={emp.EMP_ID}>
                                    {`${emp.EMP_ID}-${emp.EMP_NAME}`}
                                  </option>
                                ))}
                              </select>
                            )}
                            {errors.EMPID && <p className="mt-1 text-sm text-red-500">{errors.EMPID}</p>}
                          </div>
                        )}
                      </div>

                      {/* Second Row: Department, Designation, Date fields */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {(form.status === 'Transfer' || form.status === 'Joined') && (
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Department {form.status === 'Transfer' && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="text"
                              value={
                                form.status === "Transfer"
                                  ? empDepartDesign.dept || ""
                                  : form.depat || ""
                              }
                              onChange={(e) => setForm({ ...form, depat: e.target.value })}
                              disabled={form.status === 'Transfer'}
                              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-50"
                              placeholder="Department"
                            />
                            {errors.depat && <p className="mt-1 text-sm text-red-500">{errors.depat}</p>}
                          </div>
                        )}

                        {(form.status === 'Transfer' || form.status === 'Joined') && (
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Designation {form.status === 'Transfer' && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="text"
                            value={
                                form.status === "Transfer"
                                  ? empDepartDesign.designation|| ""
                                  : form.designation || ""
                              }
                              onChange={(e) => setForm({ ...form, designation: e.target.value })}
                              disabled={form.status === 'Transfer'}
                              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-50"
                              placeholder="Designation"
                            />
                            {errors.designation && <p className="mt-1 text-sm text-red-500">{errors.designation}</p>}
                          </div>
                        )}

                        {form.status === "Transfer" && (
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Transfer Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              max={new Date().toISOString().split('T')[0]}
                              value={form.transferDate}
                              onChange={(e) => setForm({ ...form, transferDate: e.target.value })}
                              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            />
                            {errors.transferDate && <p className="mt-1 text-sm text-red-500">{errors.transferDate}</p>}
                          </div>
                        )}

                        {form.status === "Joined" && (
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Joined Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              max={new Date().toISOString().split('T')[0]}
                              value={form.joinDate}
                              onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            />
                            {errors.joinDate && <p className="mt-1 text-sm text-red-500">{errors.joinDate}</p>}
                          </div>
                        )}

                        {form.status === 'WIP' && (
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Extended Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={form.extendedDate}
                              onChange={(e) => setForm({ ...form, extendedDate: e.target.value })}
                              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            />
                            {errors.extendedDate && <p className="mt-1 text-sm text-red-500">{errors.extendedDate}</p>}
                          </div>
                        )}

                        {form.status === "Reverted" && (
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Reverted To
                            </label>
                            <input
                              type="text"
                              value={modlData?.RAISER || ''}
                              disabled
                              readOnly
                              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50"
                            />
                          </div>
                        )}
                      </div>

                      {/* Third Row: Comments (full width) */}

                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Comments <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={form.comments}
                      onChange={(e) => setForm({ ...form, comments: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      placeholder="Enter your comments here..."
                    />
                    {errors.comments && <p className="mt-1 text-sm text-red-500">{errors.comments}</p>}
                  </div>
                </div>

                <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setTransferDialogOpen(false)}
                      className="px-6 py-2 text-gray-700 transition-colors duration-200 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleButtonClick}
                      disabled={!form.status || loading}
                      className="px-6 py-2 text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        form.status ? `Update ${form.status}` : 'Update Status'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Dialog with Fullscreen Toggle */}
          {historyDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className={`bg-white rounded-2xl shadow-2xl overflow-y-auto transition-all duration-300 ${historyFullscreen
                ? 'w-[98vw] h-[98vh] max-w-none max-h-none'
                : 'max-w-6xl w-full max-h-[90vh]'
                }`}>
                <div className="sticky top-0 px-6 py-3 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="flex items-center gap-2 text-xl font-bold">
                        <History className="w-5 h-5" />
                        MRF Status History
                      </h2>
                      <p className="text-sm">Track all status changes and updates</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHistoryFullscreen(!historyFullscreen)}
                        className="flex items-center gap-2 px-4 py-2 transition-colors duration-200 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl"
                        title={historyFullscreen ? "Minimize" : "Fullscreen"}
                      >
                        {historyFullscreen ? (
                          <Minimize className="w-4 h-4" />
                        ) : (
                          <Maximize className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-4 py-2 transition-colors duration-200 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <button
                        onClick={() => {
                          setHistoryDialogOpen(false);
                          setHistoryFullscreen(false);
                        }}
                        className="p-2 transition-colors duration-150 hover:bg-white hover:bg-opacity-20 rounded-xl"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Filter Section */}
                  <div className="p-4 mb-6 bg-gray-50 rounded-xl">
                    <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                      <Filter className="w-4 h-4" />
                      Filter History
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700">Status</label>
                        <select
                          value={historyFilters.status}
                          onChange={(e) => handleHistoryFilterChange('status', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        >
                          <option value="">All Statuses</option>
                          {statusOptions.slice(1).map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700">Plant</label>
                        <select
                          value={historyFilters.Plant}
                          onChange={(e) => handleHistoryFilterChange('Plant', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        >
                          <option value="">All Plants</option>
                          {uniquePlants.map(plant => (
                            <option key={plant} value={plant}>{plant}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700">Designation</label>
                        <select
                          value={historyFilters.Design}
                          onChange={(e) => handleHistoryFilterChange('Design', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        >
                          <option value="">All Designations</option>
                          {uniqueDesignations.map(designation => (
                            <option key={designation} value={designation}>{designation}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* History Table with borders */}
                  <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-[calc(100vh-10px)]">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 border-b border-r border-gray-300">S.No</th>
                          <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 border-b border-r border-gray-300">Status</th>
                          <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 border-b border-r border-gray-300">EMP ID</th>
                          <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 border-b border-r border-gray-300">Current Plant</th>
                          <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 border-b border-r border-gray-300">Transfer Plant</th>
                          <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 border-b border-r border-gray-300">Designation</th>
                          <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 border-b border-r border-gray-300">Transfer Date</th>
                          <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 border-b border-r border-gray-300">Updated By</th>
                          <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 border-b border-r border-gray-300">Updated Date</th>
                          <th className="px-3 py-3 text-xs font-semibold text-left text-gray-700 border-b border-gray-300">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistory.map((hist, index) => (
                          <tr key={index} className="transition-colors duration-150 hover:bg-gray-50">
                            <td className="px-3 py-3 text-xs text-gray-900 border-b border-r border-gray-200">{index + 1}</td>
                            <td className="px-3 py-3 border-b border-r border-gray-200">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(hist.status)}`}>
                                {getStatusIcon(hist.status)}
                                {hist.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-900 border-b border-r border-gray-200">{hist.EMPID}</td>
                            <td className="px-3 py-3 text-xs text-gray-900 border-b border-r border-gray-200">{hist.Current_Plant}</td>
                            <td className="px-3 py-3 text-xs text-gray-900 border-b border-r border-gray-200">{hist.Plant}</td>
                            <td className="px-3 py-3 text-xs text-gray-900 border-b border-r border-gray-200">{hist.Design}</td>
                            <td className="px-3 py-3 text-xs text-gray-900 border-b border-r border-gray-200">{hist.Transfer_Date}</td>
                            <td className="px-3 py-3 text-xs text-gray-900 border-b border-r border-gray-200">{hist.updated_by}</td>
                            <td className="px-3 py-3 text-xs text-gray-900 border-b border-r border-gray-200">{hist.updated_date}</td>
                            <td className="px-3 py-3 text-xs text-gray-600 border-b border-gray-200">{hist.Remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManPowerHrList;