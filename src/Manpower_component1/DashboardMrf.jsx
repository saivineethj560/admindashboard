import React, { useEffect, useState, Fragment } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react";
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUpIcon, UsersIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ArrowRightIcon, FilterIcon, RefreshCwIcon, BarChart3Icon, EyeIcon, EyeOffIcon, BuildingIcon, BriefcaseIcon, CalendarIcon, UserCheckIcon, UserXIcon, UserPlusIcon, RotateCcwIcon, ArrowLeftIcon, BarChart3, TrendingUp, ChartBarIcon } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from "../Config";

const columns = [
  { field: "PLANT", headerName: "Plant", flex: 3, minWidth: 230 },
  { field: "RaiserCount", headerName: "Raiser Count", flex: 1, minWidth: 120 },
  { field: "Pending", headerName: "Pending", flex: 1, minWidth: 100 },
  { field: "Joined", headerName: "Joined", flex: 1, minWidth: 100 },
  { field: "Transferred", headerName: "Transferred", flex: 1, minWidth: 120 },
  {
    field: "Reverted",
    headerName: "Reverted",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    flex: 1,
    minWidth: 100,
  },
  { field: "WIP", headerName: "WIP", flex: 1, minWidth: 80 },
];

export default function DashboardMrf() {
  const [userToken, setToken] = useState(() => {
    const stored = localStorage.getItem("userInfo");
    return stored ? JSON.parse(stored) : null;
  });

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [rows, setRows] = useState([]);
  const [rows1, setRows1] = useState([]);
  const [rows2, setRows2] = useState([]);
  const [rows3, setRows3] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedRow1, setExpandedRow1] = useState(null);

  // Filter states
  const [plant, setPlant] = useState("");
  const [designation, setDesignation] = useState("");
  const [plant1, setPlant1] = useState("");
  const [designation1, setDesignation1] = useState("");
  const [year1, setYear1] = useState("");

  const pieData = [
    { name: "Open", value: 20, color: "#3b82f6" },
    { name: "In Progress", value: 15, color: "#10b981" },
    { name: "Closed", value: 10, color: "#f59e0b" },
  ];
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const pieDatas = (data?.PlantWiseStatusCount || []).map((plant, idx) => ({
    name: plant.PLANT,
    value: plant.count, // make sure you have a "count" field for each plant
    color: COLORS[idx % COLORS.length],
  }));

  const fetchData = async (plant, WIPStatus) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/hr_requisition_list`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${userToken?.token}`,
          },
        }
      );
      const responseData = response.data.data || [];
      const filteredData = responseData.filter((row) => {
        let plantMatch = true;
        let statusMatch = true;
        if (plant) {
          plantMatch = row.PLANT === plant;
        }
        if (WIPStatus) {
          statusMatch = row.STATUS === WIPStatus;
        }
        return plantMatch && statusMatch;
      });
      setRows(filteredData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchData3 = async (plant1 = "", designation1 = "", year1 = "") => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/filterOverallCount`, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${userToken?.token}`
        },
        params: {
          plant_code: plant1,
          designation: designation1,
          year: year1
        }
      });

      if (response.data.success) {
        setRows3(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData3();
  }, []);

  const resetFilters = () => {
    setPlant1("");
    setYear1("");
    setDesignation1("");
    fetchData3();
  };

  useEffect(() => {
    async function statusCountData() {
      try {
        const response = await fetch(`${API_BASE_URL}/overallMrfStatusCount`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${userToken?.token}`,
          },
        });
        const responseData = await response.json();
        setData(responseData);
      } catch (err) {
        console.error("Error In Fetching StatusCount Data", err);
      }
    }
    if (userToken) {
      statusCountData();
      fetchData(null, null);
    }
  }, [userToken]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/agingAnalaysisAprvls`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${userToken?.token}`,
          },
        });

        const result = await response.json();
        setRows1(result.data || []);
      } catch (err) {
        console.error("Error In Fetching Data");
      }
    };

    const fetchData1 = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/agingHRAnalaysis`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${userToken?.token}`,
          },
        });
        const result = await response.json();
        setRows2(result.data || []);
      } catch (err) {
        console.error("Error In Fetching Data");
      }
    };

    if (userToken.token) {
      fetchData1();
      fetchData();
    }
  }, []);

  const handleCellClick = (params) => {
    if (params.field === "WIP") {
      fetchData(params.id, params.field).then(() => {
        setOpen(true);
        setSelectedRow(params.row);
      });
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleRowToggle = (plant) => {
    setExpandedRow1(expandedRow1 === plant ? null : plant);
  };
  const handleBack = () => {
    navigate(-1);
  };
  const STATUS_LIST = ['Transferred', 'Reverted', 'Joined', 'WIP'];
  const chartData = (STATUS_LIST || []).map(status => {
    const row = { status };
    (data?.PlantWiseStatusCount || []).forEach(plant => {
      row[plant.PLANT] = plant[status] || 0;
    });
    return row;
  });

  const paginationModel = { page: 0, pageSize: 5 };
  const statusCards = [
    {
      title: "Raiser Count",
      value: data.OverStatusCount?.RaiserCount || 0,
      icon: UserPlusIcon,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-500"
    },
    {
      title: "Pending",
      value: data.OverStatusCount?.Pending || 0,
      icon: ClockIcon,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-100",
      iconBg: "bg-amber-500"
    },
    {
      title: "Completed",
      value: data.OverStatusCount?.Approval || 0,
      icon: CheckCircleIcon,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-100",
      iconBg: "bg-green-500"
    }
  ];

  const hrStatusCards = [
    {
      title: "Transfer",
      value: data.OverStatusCount?.Transfer || 0,
      icon: ArrowRightIcon,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-500"
    },
    {
      title: "Joined",
      value: data.OverStatusCount?.Joined || 0,
      icon: UserCheckIcon,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-100",
      iconBg: "bg-emerald-500"
    },
    {
      title: "Reverted",
      value: data.OverStatusCount?.Reverted || 0,
      icon: RotateCcwIcon,
      gradient: "from-rose-500 to-pink-500",
      bgGradient: "from-rose-50 to-pink-100",
      iconBg: "bg-rose-500"
    },
    {
      title: "WIP",
      value: data.OverStatusCount?.WIP || 0,
      icon: TrendingUpIcon,
      gradient: "from-indigo-500 to-blue-500",
      bgGradient: "from-indigo-50 to-blue-100",
      iconBg: "bg-indigo-500"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="w-full p-10 mx-auto space-y-10 border border-gray-300 shadow-2xl max-w-7xl rounded-3xl bg-gradient-to-br from-pink-100 via-gray-50 to-gray-100">
        <div className="flex items-center px-8 py-6 bg-white border border-gray-200 shadow-lg rounded-2xl">
          {/* Left Accent Icon */}
          <div className="flex items-center justify-center w-12 h-12 mr-4 text-white shadow-md rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
            <BriefcaseIcon className="w-6 h-6" />
          </div>

          {/* Title + Subtitle */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text">
              Manpower Dashboard
            </h1>
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

        {/* Status Cards Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* MRF Status Cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white border border-gray-100 shadow-xl rounded-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <BriefcaseIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">MRF Status Overview</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {statusCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative  rounded-2xl bg-gradient-to-br ${card.bgGradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                    </div>
                    <div className={`p-3 ${card.iconBg} rounded-xl shadow-lg`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 hover:opacity-10 transition-opacity duration-300`}></div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* HR Status Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white border border-gray-100 shadow-xl rounded-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">HR Status Overview</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {hrStatusCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative rounded-2xl bg-gradient-to-br ${card.bgGradient} p-4 shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                    </div>
                    <div className={`p-2 ${card.iconBg} rounded-lg shadow-md`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 hover:opacity-10 transition-opacity duration-300`}></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Data Table and Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-7"
        >
          {/* Enhanced Data Table */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-xl lg:col-span-4 rounded-3xl">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-200 to-indigo-200">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-700">
                <BuildingIcon className="w-5 h-5" />
                Plants & Status Counts
              </h3>
            </div>
            <div className="p-4">
              <div className="h-80">
                <DataGrid
                  rows={data.PlantWiseStatusCount || []}
                  columns={columns}
                  onCellClick={handleCellClick}
                  getRowId={(row) => row.PLANT}
                  getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : ''
                  }
                  autoHeight={false}
                  rowHeight={40}
                  columnHeaderHeight={45}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#f8fafc',
                      borderBottom: '2px solid #e2e8f0',
                    },
                    '& .MuiDataGrid-columnHeader': {
                      backgroundColor: '#f8fafc',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: 'bold',
                      color: '#1e293b',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: '#f0f9ff',
                      cursor: 'pointer',
                    },
                    '& .even-row': {
                      backgroundColor: '#f8fafc',
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: '13px',
                    },
                    fontSize: '13px',
                    color: '#374151',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Enhanced Bar Chart */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-xl lg:col-span-3 rounded-3xl">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-300 to-slate-200">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                <BarChart3 className="w-5 h-5" />
                Status Distribution
              </h3>
            </div>

            <div className="p-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                  {(data?.PlantWiseStatusCount || []).map((plant, idx) => (
                    <Bar
                      key={idx}
                      dataKey={plant.PLANT}
                      fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][idx % 5]}
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Aging Analysis for Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-3xl"
        >

          <div className="px-6 py-4 bg-gradient-to-r from-sky-100 to-blue-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-teal-400"></div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
              <TrendingUp className="w-6 h-6 text-sky-500" />
              Aging Analysis for Approve
            </h2>
          </div>
          <div className="">
            <div className="overflow-y-auto max-h-96">
              <table className="w-full border-collapse">
                <thead className="top-0">
                  <tr>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">S.No</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Plant</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">GM</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">PRJ_HEAD</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">FUNC_HEAD</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">SP</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">HOD</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">EVC</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Average</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows1.map((plant, pIndex) => {
                    const children = plant.children || [];
                    return (
                      <Fragment key={plant.PLANT}>
                        <tr className={`${pIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-200`}>
                          <td className="p-4 text-sm border border-gray-200">{pIndex + 1}</td>
                          <td className="p-4 font-semibold text-blue-600 border border-gray-200">{plant.PLANT}</td>
                          <td className="p-4 text-sm border border-gray-200">{plant.plant_average_delays?.RAISER_to_GM || "-"}</td>
                          <td className="p-4 text-sm border border-gray-200">{plant.plant_average_delays?.GM_to_PRJ || "-"}</td>
                          <td className="p-4 text-sm border border-gray-200">{plant.plant_average_delays?.PRJ_to_FUNC || "-"}</td>
                          <td className="p-4 text-sm border border-gray-200">{plant.plant_average_delays?.FUNC_to_SP || "-"}</td>
                          <td className="p-4 text-sm border border-gray-200">{plant.plant_average_delays?.RAISER_to_HO_HOD || "-"}</td>
                          <td className="p-4 text-sm border border-gray-200">{plant.plant_average_delays?.HO_HOD_to_EVC || "-"}</td>
                          <td className="p-4 text-sm font-bold text-purple-600 border border-gray-200">{plant.plant_average_delays?.Average || "-"}</td>
                          <td className="p-4 text-center border border-gray-200">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleRow(plant.PLANT)}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg shadow-md bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg"
                            >
                              {expandedRow === plant.PLANT ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                              {expandedRow === plant.PLANT ? "Hide" : "Expand"}
                            </motion.button>
                          </td>
                        </tr>

                        <AnimatePresence>
                          {expandedRow === plant.PLANT && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <td colSpan="10" className="p-0">
                                <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                                  <div className="shadow-lg rounded-xl">
                                    <table className="w-full overflow-hidden border-collapse rounded-xl">
                                      <thead className="bg-gradient-to-r from-sky-200 to-blue-200">
                                        <tr>
                                          <th className="p-3 font-semibold text-left text-black border border-gray-200">Case ID</th>
                                          <th className="p-3 font-semibold text-left text-black border border-gray-200">Sub Case ID</th>
                                          <th className="p-3 font-semibold text-left text-black border border-gray-200">Designation</th>
                                          <th className="p-3 font-semibold text-left text-black border border-gray-200">Raiser</th>
                                          {children.length > 0 &&
                                            Object.keys(children[0].delays).map((key) => (
                                              <th key={key} className="p-3 font-semibold text-left text-black border border-gray-200">
                                                {key}
                                              </th>
                                            ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {children
                                          .filter(c => c.STATUS === "WIP")
                                          .map((child, idx) => (
                                            <tr key={child.CHILD_CASEID} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-purple-50 transition-colors duration-200`}>
                                              <td className="p-3 font-semibold text-blue-600 border border-gray-200">{child.CASEID}</td>
                                              <td className="p-3 font-semibold text-purple-600 border border-gray-200">{child.CHILD_CASEID}</td>
                                              <td className="p-3 text-sm border border-gray-200">{child.MANPOWER_DESG}</td>
                                              <td className="p-3 text-sm border border-gray-200">{child.RAISER}</td>
                                              {Object.keys(child.delays).map((key) => (
                                                <td key={key} className="p-3 text-sm border border-gray-200">
                                                  {child.delays[key] !== null ? child.delays[key] : "-"}
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Aging Analysis for HR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-3xl"
        >
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-100 to-teal-100">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
              <TrendingUpIcon className="w-6 h-6" />
              Aging Analysis for HR
            </h2>
          </div>

          <div className="">
            <div className="max-h-96">
              <table className="w-full border-collapse">
                <thead className="top-0">
                  <tr>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">S.No</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Plant</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">WIP</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Joined</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Transfer</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Reverted</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Average</th>
                    <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows2.map((plant, pIndex) => {
                    const children = plant.children || [];
                    return (
                      <Fragment key={plant.PLANT}>
                        <tr className={`${pIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-emerald-50 transition-colors duration-200`}>
                          <td className="p-4 text-sm border border-gray-200">{pIndex + 1}</td>
                          <td className="p-4 font-semibold border border-gray-200 text-emerald-600">{plant.PLANT}</td>
                          <td className="p-4 text-sm border border-gray-200">{plant.plant_average_delays?.WIP ?? "-"}</td>
                          <td className="p-4 text-sm border border-gray-200">{plant.plant_average_delays?.Joined ?? "-"}</td>
                          <td className="p-4 text-sm border border-gray-200">{plant.plant_average_delays?.Transfer ?? "-"}</td>
                          <td className="p-4 text-sm border border-gray-200">{plant.plant_average_delays?.Reverted ?? "-"}</td>
                          <td className="p-4 text-sm font-bold text-purple-600 border border-gray-200">{plant.plant_average_delays?.Average ?? "-"}</td>
                          <td className="p-4 text-center border border-gray-200">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRowToggle(plant.PLANT)}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg shadow-md bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg"
                            >
                              {expandedRow1 === plant.PLANT ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                              {expandedRow1 === plant.PLANT ? "Hide" : "Expand"}
                            </motion.button>
                          </td>
                        </tr>

                        <AnimatePresence>
                          {expandedRow1 === plant.PLANT && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <td colSpan="8" className="p-0">
                                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50">
                                  <div className="shadow-lg rounded-xl">
                                    <table className="w-full overflow-hidden bg-white border-collapse rounded-xl">
                                      <thead className="bg-gradient-to-r from-emerald-200 to-teal-200">
                                        <tr>
                                          <th className="p-3 font-semibold text-left text-black border">Case ID</th>
                                          <th className="p-3 font-semibold text-left text-black border">Child Case ID</th>
                                          <th className="p-3 font-semibold text-left text-black border">Raiser</th>
                                          <th className="p-3 font-semibold text-left text-black border">Designation</th>
                                          <th className="p-3 font-semibold text-left text-black border">WIP</th>
                                          <th className="p-3 font-semibold text-left text-black border">Joined</th>
                                          <th className="p-3 font-semibold text-left text-black border">Transfer</th>
                                          <th className="p-3 font-semibold text-left text-black border">Reverted</th>
                                          <th className="p-3 font-semibold text-left text-black border">Average</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {children.map((child, idx) => (
                                          <tr key={child.CHILD_CASEID} className={`${idx % 2 === 0 ? 'bg-wheat-50' : 'bg-white'} hover:bg-emerald-50 transition-colors duration-200`}>
                                            <td className="p-3 font-semibold text-blue-600 border">{child.CASEID}</td>
                                            <td className="p-3 font-semibold text-purple-600 border">{child.CHILD_CASEID}</td>
                                            <td className="p-3 text-sm border">{child.RAISER}</td>
                                            <td className="p-3 text-sm border">{child.MANPOWER_DESG}</td>
                                            <td className="p-3 text-sm border">{child.delays.WIP ?? "-"}</td>
                                            <td className="p-3 text-sm border">{child.delays.Joined ?? "-"}</td>
                                            <td className="p-3 text-sm border">{child.delays.Transfer ?? "-"}</td>
                                            <td className="p-3 text-sm border">{child.delays.Reverted ?? "-"}</td>
                                            <td className="p-3 text-sm font-bold text-purple-600 border">{child.delays.Average ?? "-"}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* HR Analysis Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50"
        >
          <div className="px-6 py-4 bg-gray-200 border-b border-gray-200 rounded-t-xl">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <BriefcaseIcon className="w-5 h-5 text-teal-500" />
              HR Analysis Report
            </h2>
          </div>
          {/* Enhanced Filters */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <FilterIcon className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
                  <BuildingIcon className="w-4 h-4" />
                  Plant
                </label>
                <select
                  value={plant1}
                  onChange={(e) => {
                    setPlant1(e.target.value);
                    fetchData3(e.target.value, designation1, year1);
                  }}
                  className="w-full px-4 py-3 text-sm transition-all duration-200 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="">All Plants</option>
                  <option value="2000 - My Home Constructions HO">2000 - My Home Constructions HO</option>
                  <option value="2109 - My Home Nishada">2109 - My Home Nishada</option>
                  <option value="2152 - My Home Tridasa">2152 - My Home Tridasa</option>
                </select>
              </div>

              <div>
                <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
                  <BriefcaseIcon className="w-4 h-4" />
                  Designation
                </label>
                <select
                  value={designation1}
                  onChange={(e) => {
                    setDesignation1(e.target.value);
                    fetchData3(plant1, e.target.value, year1);
                  }}
                  className="w-full px-4 py-3 text-sm transition-all duration-200 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="">All Designations</option>
                  <option value="3D Visualiser">3D Visualiser</option>
                  <option value="Advisor">Advisor</option>
                  <option value="Assistant">Assistant</option>
                </select>
              </div>

              <div>
                <label className="flex items-center block gap-2 mb-2 text-sm font-medium text-gray-700">
                  <CalendarIcon className="w-4 h-4" />
                  Year
                </label>
                <select
                  value={year1}
                  onChange={(e) => {
                    setYear1(e.target.value);
                    fetchData3(plant1, designation1, e.target.value);
                  }}
                  className="w-full px-4 py-3 text-sm transition-all duration-200 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="">Select Year</option>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>

              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetFilters}
                  className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl hover:shadow-xl"
                >
                  <RefreshCwIcon className="w-4 h-4" />
                  Reset Filters
                </motion.button>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="">
            <div className="max-h-96 ">
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
                    <p className="font-medium text-gray-600">Loading data...</p>
                  </div>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-gradient-to-r from-indigo-100 to-purple-100">
                    <tr>
                      <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">S.No</th>
                      <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Plant Code</th>
                      <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Designation</th>
                      <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Planned</th>
                      <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">MRF Raised</th>
                      <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Joined</th>
                      <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Transfer</th>
                      <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Existing</th>
                      <th className="p-4 font-semibold text-left text-gray-700 border border-gray-200">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows3.map((item, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50 transition-colors duration-200`}
                      >
                        <td className="p-4 text-sm border border-gray-200">{index + 1}</td>
                        <td className="p-4 border border-gray-200">{item.Plant_code}</td>
                        <td className="p-4 text-sm border border-gray-200">{item.Designation}</td>
                        <td className="p-4 text-sm font-bold text-blue-600 border border-gray-200">{item.Total_Requirement}</td>
                        <td className="p-4 text-sm border border-gray-200">{item.MRF_Raised_count}</td>
                        <td className="p-4 text-sm border border-gray-200">{item.Joined_count}</td>
                        <td className="p-4 text-sm border border-gray-200">{item.Transfer_count}</td>
                        <td className="p-4 text-sm border border-gray-200">{item.Existing_count}</td>
                        <td className="p-4 text-sm font-bold text-purple-600 border border-gray-200">{item.Total}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Modal */}
        <Dialog open={open} handler={setOpen} size="xl" className="shadow-2xl rounded-3xl">
          <DialogHeader className="p-0 overflow-hidden rounded-t-3xl">
            <div className="relative flex items-center justify-between w-full px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <BriefcaseIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  MRF WIP Status - {rows[0]?.PLANT || ""}
                </h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(false)}
                className="p-2 text-2xl font-bold leading-none text-white transition-all duration-200 rounded-lg hover:text-red-200 focus:outline-none hover:bg-white/10"
              >
                ×
              </motion.button>
            </div>
          </DialogHeader>

          <DialogBody className="p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 max-h-96">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
              <div className="">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-white border border-blue-500">S.No</th>
                      <th className="px-6 py-3 text-sm font-semibold text-white border border-blue-500">Plant</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white border border-blue-500">Child Case ID</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white border border-blue-500">Emp ID</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white border border-blue-500">Designation</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white border border-blue-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-blue-50"} hover:bg-blue-100 transition-colors duration-200`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-center text-gray-700 border border-gray-200">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 border border-gray-200">{row?.PLANT || ""}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-blue-600 border border-gray-200">{row?.CHILD_CASEID || ""}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 border border-gray-200">{row?.EMPID || ""}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 border border-gray-200">{row?.MANPOWER_DESG || ""}</td>
                        <td className="px-4 py-3 text-sm border border-gray-200">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${row?.STATUS === 'WIP' ? 'bg-yellow-100 text-yellow-800' :
                            row?.STATUS === 'Joined' ? 'bg-green-100 text-green-800' :
                              row?.STATUS === 'Transferred' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {row?.STATUS || ""}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-3xl">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:shadow-xl"
            >
              <XCircleIcon className="w-4 h-4" />
              Close
            </motion.button>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  );
}