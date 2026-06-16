import React, { useState, useEffect } from "react";
import { API_BASE_URL } from '../Config';
import {
  FaMotorcycle,
  FaCar,
  FaPlus,
  FaEye,
  FaHistory,
  FaExchangeAlt,
  FaShieldAlt,
  FaMoneyBillWave,
  FaWrench,
  FaTags,
  FaTimes,
  FaCheckCircle,
  FaCogs,
  FaExclamationTriangle,
  FaCreditCard,
  FaRoad,
  FaSpinner
} from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useNavigate } from "react-router-dom";
import {  BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
const MultiSegmentProgressBar = ({ soldCount, scrapCount, repairCount }) => {
  const totalCount = soldCount + scrapCount + repairCount;
  
  // Always show the progress bar, even with zero values
  const soldPercentage = totalCount > 0 ? (soldCount / totalCount) * 100 : 0;
  const scrapPercentage = totalCount > 0 ? (scrapCount / totalCount) * 100 : 0;
  const repairPercentage = totalCount > 0 ? (repairCount / totalCount) * 100 : 0;

  return (
    <div className="w-full mb-4">
      
    </div>
  );
};
const MultiSegmentProgressBars = ({ soldCount, scrapCount }) => {
  const totalCount = soldCount + scrapCount;
  
   // Always show the progress bar, even with zero values
  const soldPercentage = totalCount > 0 ? (soldCount / totalCount) * 100 : 0;
  const scrapPercentage = totalCount > 0 ? (scrapCount / totalCount) * 100 : 0;

  return (
    <div className="w-full mb-4">
      
    </div>
  );
};

const NavBar = () => {
  const [showTwoWheelerModal, setShowTwoWheelerModal] = useState(false);
  const [showFourWheelerModal, setShowFourWheelerModal] = useState(false);
  const [twoWheelerActiveTab, setTwoWheelerActiveTab] = useState(0);
  const [fourWheelerActiveTab, setFourWheelerActiveTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedVehicleType, setSelectedVehicleType] = useState('4wheeler');
  const barColors = ['#007bff', '#ffc107', '#dc3545', '#6f42c1'];
  const years = ['All', ...Array.from({length: 26}, (_, i) => new Date().getFullYear() - i)];
  const [selectedVehicleType1, setSelectedVehicleType1] = useState('2-wheeler');
const [selectedStatus, setSelectedStatus] = useState('active');
const [vehicleTableData, setVehicleTableData] = useState([]);
const [isTableLoading, setIsTableLoading] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 5;
const totalRecords = vehicleTableData?.length || 0;
const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const [dashboardData, setDashboardData] = useState({
    active: 0,
    maintenance: 0,
    insurance: 0,
    tax: 0,
    fastTag: 0,
    totalAmount: 0,
    vhNumberCount: 0,
    maintenanceCount: 0,
    insuranceCount: 0,
    taxCount: 0,
    fastTagCount: 0,
    totalFastTagAmount: 0, 
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [useToken, setToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo')) ? JSON.parse(localStorage.getItem('userInfo')) : null
  });

  //------------------------------------------------------start-----------------------------------------------------------
    //added on 18-12-2025 by rajakumari.m
  const permissions = useToken?.Is_HO_VEH_USR
  ? useToken.Is_HO_VEH_USR.split(',').map(v => v.trim())
  : [];

const hasOne = permissions.includes('1');
const hasVH  = permissions.includes('VH');

console.log("Permissions:", permissions, "hasOne:", hasOne, "hasVH:", hasVH);
//----------end ------------------------------------------
  // Analytics data for the new section
  const [fourWheelerData, setFourWheelerData] = useState({
  total: 0,
  active: 0,
  inactive: 0,
  maintenance: 0,
  insurance: 0,
  tax: 0,
  fastTag: 0,
  totalAmount: 0,
  scrap: 0,         // This is the count
  sold: 0,          // This is the count   
  repair: 0,        // This is the count
  // Amount fields
  soldAmount: 0,
  scarpAmount: 0,

});

 const [twoWheelerData, setTwoWheelerData] = useState({
  total: 0,
  active: 0,
  inactive: 0,
  soldAmount: 0,
  scrapAmount: 0,
  totalDisposedAmount: 0,
  insuAmount:0,
  maintAmount:0
});

  const navigate = useNavigate();

  const closeModal = () => {
    setShowTwoWheelerModal(false);
    setShowFourWheelerModal(false);
    setTwoWheelerActiveTab(0);
    setFourWheelerActiveTab(0);
  };

  // Fetch main dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setApiError(false);
        
        const response = await fetch(`${API_BASE_URL}getnavbarcount`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "Authorization": `Bearer ${useToken?.token}`
          },
        });

        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.status && result.data) {
          const newData = {
            active: result.data.active || 0,
            maintenance: result.data.maintenance || 0,
            insurance: result.data.insurance || 0,
            tax: result.data.tax || 0,
            fastTag: result.data.fastTag || 0,
            vhNumberCount: result.data.vhNumberCount || 0,
            maintenanceCount: result.data.maintenanceCount || 0,
            insuranceCount: result.data.insuranceCount || 0,
            taxCount: result.data.taxCount || 0,
            fastTagCount: result.data.fastTagCount || 0,
            totalAmount: result.data.totalAmount || 0,
          };
          
          setDashboardData(newData);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setApiError(true);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.error('Network error - possibly CORS issue');
        }
        
        setDashboardData({
          active: 0,
          maintenance: 0,
          insurance: 0,
          tax: 0,
          fastTag: 0,
          totalAmount: 0,
          vhNumberCount: 0,
          maintenanceCount: 0,
          insuranceCount: 0,
          taxCount: 0,
          fastTagCount: 0,
          totalFastTagAmount: 0, 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
useEffect(() => {
  const fetchTotalFastTagAmount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}getLatestFastTag`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          "Authorization": `Bearer ${useToken?.token}`
        },
      });

      const result = await response.json();
      console.log('Total Fast Tag API Response:', result);
      
      if (result.status && result.data) {
        console.log('Setting totalFastTagAmount to:', result.data.total_fast_amt || result.data.amount || 0);
        setDashboardData(prevData => ({
          ...prevData,
          // Check what field name your API actually returns - adjust accordingly
          totalFastTagAmount: result.data.TOTAL_FAST_AMT || 0
        }));
      }
      
    } catch (error) {
      console.error('Error fetching total fast tag amount:', error);
      setDashboardData(prevData => ({
        ...prevData,
        totalFastTagAmount: 0
      }));
    }
  };

  if (useToken?.token) {
    fetchTotalFastTagAmount();
  }
}, [useToken?.token]);

useEffect(() => {
  const fetchVehicleData = async () => {
    if (!selectedVehicleType1 || !selectedStatus) return;
    
    try {
      setIsTableLoading(true);
      let apiUrl;
      
      if (selectedVehicleType1 === '2-wheeler') {
        apiUrl = `${API_BASE_URL}gettwoInsuranceStatusData?status=${selectedStatus}`;
      } else if (selectedVehicleType1 === '4-wheeler') {
        apiUrl = `${API_BASE_URL}insurance-status-data?status=${selectedStatus}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          "Authorization": `Bearer ${useToken?.token}`
        }
      });
      
      const result = await response.json();
      console.log('Vehicle Table Data Response:', result);
      
      if (result.status && result.data) {
        setVehicleTableData(result.data);
      } else {
        setVehicleTableData([]);
      }
      
    } catch (error) {
      console.error('Error fetching vehicle table data:', error);
      setVehicleTableData([]);
    } finally {
      setIsTableLoading(false);
    }
  };

  fetchVehicleData();
}, [selectedVehicleType1, selectedStatus, useToken?.token]);
  // Fetch analytics data when year or vehicle type changes
 useEffect(() => {
  const fetchAnalyticsData = async () => {
    try {
      if (selectedVehicleType === '4wheeler') {
        const apiUrl = selectedYear === 'All' 
          ? `${API_BASE_URL}getvehicledashboardcount`
          : `${API_BASE_URL}getvehicledashboardcount?purchaseYear=${selectedYear}`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "Authorization": `Bearer ${useToken?.token}`
          }
        });
        
        const result = await response.json();
        console.log('4Wheeler Analytics API Response:', result);
        
        if (result.status && result.data) {
         setFourWheelerData({
    total: result.data.totalVehicles || 0, 
    active: result.data.active || 0,
    inactive: result.data.inactive || 0,
    maintenance: result.data.maintenance || 0,
    insurance: result.data.insurance || 0,
    tax: result.data.tax || 0,
    fastTag: result.data.fastTag || 0,
    totalAmount: result.data.totalAmount || 0,
    scrap: result.data.scarp || 0,           
    sold: result.data.sold || 0,             
    repair: result.data.repair || 0,        
    soldAmount: result.data.soldAmount || 0,
    scarpAmount: result.data.scarpAmount || 0,
    
  });
        }
       } else if (selectedVehicleType === '2wheeler') {
  // Add 2wheeler API call here
  const apiUrl = selectedYear === 'All' 
    ? `${API_BASE_URL}getvehicleTwodashboardcount`
    : `${API_BASE_URL}getvehicleTwodashboardcount?purchaseYear=${selectedYear}`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "Authorization": `Bearer ${useToken?.token}`
          }
        });
        
        const result = await response.json();
        console.log('2Wheeler Analytics API Response:', result);
        
       // In the else if (selectedVehicleType === '2wheeler') block, update:
if (result.status && result.data) {
  setTwoWheelerData({
   total: result.data.totalVehicles || 0,
    active: result.data.active || 0,
    inactive: result.data.inactive || 0,
    soldAmount: result.data.soldAmount || 0,
    scrapAmount: result.data.scrapAmount || 0,
    // ✅ Fixed: Map totalInsuranceAmount from API to insuAmount in frontend
    insuAmount: result.data.insuAmount || 0,
    // ✅ Fixed: Map totalMaintenanceAmount from API to maintAmount in frontend
    maintAmount: result.data.totalMaintenanceAmount || 0, 
    totalDisposedAmount: result.data.totalDisposedAmount || 0
  });
}
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      if (selectedVehicleType === '4wheeler') {
        setFourWheelerData({ 
          total: 0, active: 0, inactive: 0,
          maintenance: 0, insurance: 0, tax: 0, fastTag: 0, totalAmount: 0,sold: 0, scarp: 0, repair: 0
        });
      } 
        else {
  setTwoWheelerData({ 
    total: 0, 
    active: 0, 
    inactive: 0,
    soldAmount: 0,
    scrapAmount: 0,
    totalDisposedAmount: 0,
   
    insuAmount:0,
    maintAmount:0
  });
      }
    }
  };

  fetchAnalyticsData();
}, [selectedYear, selectedVehicleType, useToken?.token]);
const vehicleData = {
  '2-wheeler': {
    active: [
      { id: 'TN01AB1234', model: 'Honda Activa', owner: 'John Doe', lastService: '2024-01-15', fuel: '85%' },
      { id: 'TN02CD5678', model: 'TVS Jupiter', owner: 'Jane Smith', lastService: '2024-01-10', fuel: '92%' },
      { id: 'TN03EF9012', model: 'Yamaha Fascino', owner: 'Mike Johnson', lastService: '2024-01-12', fuel: '78%' },
    ],
    inactive: [
      { id: 'TN04GH3456', model: 'Bajaj Pulsar', owner: 'Sarah Wilson', lastService: '2023-12-20', fuel: '45%' },
      { id: 'TN05IJ7890', model: 'Hero Splendor', owner: 'David Brown', lastService: '2023-12-15', fuel: '30%' },
    ]
  },
  '4-wheeler': {
    active: [
      { id: 'TN06KL2345', model: 'Maruti Swift', owner: 'Lisa Davis', lastService: '2024-01-18', fuel: '88%' },
      { id: 'TN07MN6789', model: 'Hyundai i20', owner: 'Tom Anderson', lastService: '2024-01-14', fuel: '91%' },
      { id: 'TN08OP1234', model: 'Honda City', owner: 'Emma Taylor', lastService: '2024-01-16', fuel: '82%' },
    ],
    inactive: [
      { id: 'TN09QR5678', model: 'Toyota Innova', owner: 'Chris Martin', lastService: '2023-12-18', fuel: '55%' },
      { id: 'TN10ST9012', model: 'Ford EcoSport', owner: 'Amy White', lastService: '2023-12-10', fuel: '40%' },
    ]
  }
};
// Update the downloadTableData function to download as Excel
const downloadTableData = () => {
  if (vehicleTableData.length === 0) {
    alert('No data available to download');
    return;
  }

  // Define headers based on vehicle type
  let headersMap = [];

  if (selectedVehicleType1 === '4-wheeler') {
    headersMap = [
      { key: 'VH_NUMBER', label: 'Vehicle Number' },
      { key: 'VH_TYPE', label: 'Vehicle Type' },
      { key: 'FUEL', label: 'Fuel' },
      { key: 'VH_COMPANY', label: 'Company' },
      { key: 'VH_MODEL', label: 'Model' },
      { key: 'COMP_PLANT', label: 'Company Plant' },
      { key: 'PUR_YEAR', label: 'Purchase Year' },
      { key: 'VH_USER', label: 'User' },
      { key: 'VH_DRIVER', label: 'Driver' },
      { key: 'INSURANCE_START_DATE', label: 'Insurance Start' },
      { key: 'INSURANCE_END_DATE', label: 'Insurance End' },
      { key: 'INSURANCE_CMP', label: 'Insurance Company' },
      { key: 'REG_DT', label: 'Registration Date' },
      { key: 'REG_VALID', label: 'Registration Valid' },
      { key: 'MOBILE', label: 'Mobile' },
      { key: 'AMT', label: 'Insurance Amount' },
      { key: 'STAT_AMT', label: 'Status Amount' },
      { key: 'STAT_DT', label: 'Status Date' },
      { key: 'STATUS_RE', label: 'Status Reason' },
      { key: 'INS_STATUS', label: 'Insurance Status' },

      // Maintenance
      { key: 'SERVICE_DATE', label: 'Service Date' },
      { key: 'STATUS_MAIN', label: 'Maintenance Status' },
      { key: 'COST_MAIN', label: 'Maintenance Cost' },
      { key: 'DESC_MAIN', label: 'Maintenance Description' },
      { key: 'VENDOR_NAME', label: 'Vendor' },

      // Claim
      { key: 'CLAIM_STATUS', label: 'Claim Status' },
      { key: 'CLAIM_AMT', label: 'Claim Amount' },
      { key: 'CLAIM_DT', label: 'Claim Date' },

      // Tax
      { key: 'TAX_START_DATE', label: 'Tax Start Date' },
      { key: 'TAX_REMAINDER_DATE', label: 'Tax Reminder Date' },

      // General Status
      { key: 'STATUS', label: 'Status' },
      { key: 'COST', label: 'Cost' },
      { key: 'DESCRIPTION', label: 'Description' },

      // FastTag / Challan
      { key: 'TRAFFIC_CHALLAN', label: 'Traffic Challan' },
      { key: 'CHALLAN_AMT', label: 'Challan Amount' },
      { key: 'TRAF_DT', label: 'Challan Date' },
      { key: 'FAST_DT', label: 'Fastag Date' },
      { key: 'TAG_NO', label: 'Tag Number' },
      { key: 'TAG_BANK', label: 'Tag Bank' },
      { key: 'TAG_REG_MOBILE', label: 'Tag Mobile' },
      { key: 'FAST_AMT', label: 'Fastag Amount' }
    ];
  } else if (selectedVehicleType1 === '2-wheeler') {
    headersMap = [
      { key: 'VH_NUMBER', label: 'Vehicle Number' },
      { key: 'VH_COMPANY', label: 'Company' },
      { key: 'VH_LOC', label: 'Location' },
      { key: 'VH_USER', label: 'User' },
      { key: 'EMP_ID', label: 'Employee ID' },
      { key: 'MOBILE', label: 'Mobile' },
      { key: 'VALID_DT', label: 'Valid Date' },
      { key: 'REG_DT', label: 'Registration Date' },
      { key: 'FUEL', label: 'Fuel' },
      { key: 'STATUS', label: 'Status' },
      { key: 'S_DATE', label: 'Service Date' },
      { key: 'COST', label: 'Cost' },
      { key: 'INS_START', label: 'Insurance Start' },
      { key: 'INS_END', label: 'Insurance End' },
      { key: 'PUR_YEAR', label: 'Purchase Year' },
      { key: 'INS_AMT', label: 'Insurance Amount' }
    ];
  }

  const headers = headersMap.map(h => h.label);

  const excelData = vehicleTableData.map(vehicle => {
    const row = {};
    headersMap.forEach(({ key, label }) => {
      row[label] = vehicle[key] ?? ''; // Default to empty if missing
    });
    return row;
  });

  // Convert to CSV
  const csvContent = [
    headers.join(','), // Header row
    ...excelData.map(row =>
      headers.map(header => `"${row[header]}"`).join(',')
    )
  ].join('\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${selectedVehicleType1}_${selectedStatus}_report.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
// Dynamic header configuration based on vehicle type
const getTableHeaders = () => {
  if (selectedVehicleType1 === '4-wheeler') {
    return [
    
    
  { key: 'VH_NUMBER', label: 'Vehicle Number' },
  { key: 'VH_TYPE', label: 'Vehicle Type' },
  
  { key: 'FUEL', label: 'Fuel' },
  { key: 'VH_COMPANY', label: 'Company' },
  { key: 'VH_MODEL', label: 'Model' },
  { key: 'COMP_PLANT', label: 'Company Plant' },
  { key: 'PUR_YEAR', label: 'Purchase Year' },
  { key: 'VH_USER', label: 'User' },
  { key: 'VH_DRIVER', label: 'Driver' },
  { key: 'INSURANCE_START_DATE', label: 'Insurance Start' },
  { key: 'INSURANCE_END_DATE', label: 'Insurance End' },
  { key: 'INSURANCE_CMP', label: 'Insurance Company' },
  { key: 'REG_DT', label: 'Registration Date' },
  { key: 'REG_VALID', label: 'Registration Valid' },
  { key: 'MOBILE', label: 'Mobile' },
 
  { key: 'AMT', label: 'Insurance Amount' },
  
  { key: 'STAT_AMT', label: 'Status Amount' },
  { key: 'STAT_DT', label: 'Status Date' },
  { key: 'STATUS_RE', label: 'Status Reason' },
  { key: 'INS_STATUS', label: 'Insurance Status' },

  // Maintenance
  { key: 'SERVICE_DATE', label: 'Service Date' },
  { key: 'STATUS_MAIN', label: 'Maintenance Status' },
  { key: 'COST_MAIN', label: 'Maintenance Cost' },
  { key: 'DESC_MAIN', label: 'Maintenance Description' },
  { key: 'VENDOR_NAME', label: 'Vendor' },

  // Claim
  { key: 'CLAIM_STATUS', label: 'Claim Status' },
  { key: 'CLAIM_AMT', label: 'Claim Amount' },
  { key: 'CLAIM_DT', label: 'Claim Date' },

  // Tax
  { key: 'TAX_START_DATE', label: 'Tax Start Date' },
  { key: 'TAX_REMAINDER_DATE', label: 'Tax Reminder Date' },

  // General Status
  { key: 'STATUS', label: 'Status' },
  { key: 'COST', label: ' Cost' },
  { key: 'DESCRIPTION', label: 'Description' },

  // FASTag / Challan
  
  { key: 'TRAFFIC_CHALLAN', label: 'Traffic Challan' },
  { key: 'CHALLAN_AMT', label: 'Challan Amount' },
  { key: 'TRAF_DT', label: 'Challan Date' },
  { key: 'FAST_DT', label: 'Fastag Date' },
  { key: 'TAG_NO', label: 'Tag Number' },
  { key: 'TAG_BANK', label: 'Tag Bank' },
  { key: 'TAG_REG_MOBILE', label: 'Tag Mobile' },
  { key: 'FAST_AMT', label: 'Fastag Amount' }
];

   
  } else if (selectedVehicleType1 === '2-wheeler') {
    return [
      { key: 'VH_NUMBER', label: 'Vehicle Number' },
    
      { key: 'VH_COMPANY', label: 'Company' },
      { key: 'VH_LOC', label: 'Location' },
      { key: 'VH_USER', label: 'User' },
      { key: 'EMP_ID', label: 'Employee ID' },
     
      { key: 'MOBILE', label: 'Mobile' },
      { key: 'VALID_DT', label: 'Valid Date' },
      { key: 'REG_DT', label: 'Registration Date' },
      { key: 'FUEL', label: 'Fuel' },
      { key: 'STATUS', label: 'Status' },
      { key: 'S_DATE', label: 'Service Date' },
      { key: 'COST', label: 'Cost' },
      
      { key: 'INS_START', label: 'Insurance Start' },
      { key: 'INS_END', label: 'Insurance End' },
      { key: 'PUR_YEAR', label: 'Purchase Year' },
      { key: 'INS_AMT', label: 'Insurance Amount' }
    ];
  }
  return [];
};
const paginatedData = vehicleTableData?.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
) || [];
const chartData = [
  {
    name: 'Insurance',
    value: selectedVehicleType === '4wheeler' ? fourWheelerData.insurance : 0, // 2-wheeler doesn't have insurance in your current data structure
  },
  {
    name: 'Maintenance',
    value: selectedVehicleType === '4wheeler' ? fourWheelerData.maintenance : 0, // 2-wheeler doesn't have maintenance in your current data structure
  },
  {
    name: 'Tax',
    value: selectedVehicleType === '4wheeler' ? fourWheelerData.tax : 0, // 2-wheeler doesn't have tax in your current data structure
  },
  {
    name: 'Fast Tag',
    value: selectedVehicleType === '4wheeler' ? fourWheelerData.fastTag : 0, // 2-wheeler doesn't have fastTag in your current data structure
  },
  
];
//updated on 18-12-2025---------------rajakumari-----------
  const twoWheelerTabs = [
     ...(useToken.Is_HO_VEH_USR !== "2" 
    ? [ { name: "Two Wheeler Creation", icon: FaPlus, route: "/CreationTwo" }] 
    : []
  ),
    
    { name: "Display", icon: FaEye, route: "/TwoWheelerDisplay" },
    { name: "Vehicle History", icon: FaHistory, route: "/Twohistory" },
   
     ...(useToken.Is_HO_VEH_USR !== "2" 
    ? [  { name: "Change Tab", icon: FaPlus, route: "/TwoWheelerChange" }] 
    : []
  )
   
  ];

  const fourWheelerTabs = [
  // Only show Four Wheeler Creation if HO_VEH_NOT is not "2"
  ...(useToken.Is_HO_VEH_USR !== "2" 
    ? [{ name: "Four Wheeler Creation", icon: FaPlus, route: "/creation1" }] 
    : []
  ),
  { name: "Insurance Display", icon: FaShieldAlt, route: "/InsuDisplay" },
  { name: "Maintenance Display", icon: FaWrench, route: "/MainDisplay" },
  { name: "Tax Display", icon: FaMoneyBillWave, route: "/TaxDisplay" },
  { name: "Fast Tag & Challan Display", icon: FaTags, route: "/FastDisplay" },
  { name: "Scrap/Sold", icon: FaWrench, route: "/ScrapDisplay" },
  { name: "Vehicle History", icon: FaHistory, route: "/Fourhistory" },
  // Only show Edit Tab if HO_VEH_NOT is not "2"
  ...(useToken.Is_HO_VEH_USR !== "2" 
    ? [{ name: "Edit Tab", icon: FaPlus, route: "/ChangeTab" }] 
    : []
  )
];
//-------------------------------------end 18-12-2025---------------------
  const tileData = [
    {
      name: "Total Vehicles",
      value: dashboardData.vhNumberCount,
      icon: FaCar,
      gradient: "from-indigo-400 via-indigo-500 to-indigo-600",
      hoverGradient: "from-indigo-500 via-indigo-600 to-indigo-700",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-700",
      valueColor: "text-indigo-800",
      borderColor: "border-indigo-300",
      shadowColor: "shadow-indigo-200"
    },
    { 
      name: "Active", 
      value: dashboardData.active, 
      icon: FaCheckCircle,
      gradient: "from-green-400 via-emerald-500 to-green-600",
      hoverGradient: "from-green-500 via-emerald-600 to-green-700",
      bgColor: "bg-green-50",
      iconColor: "text-green-700",
      valueColor: "text-green-800",
      borderColor: "border-green-300",
      shadowColor: "shadow-green-200"
    },
    { 
      name: "Maintenance", 
      value: dashboardData.maintenance, 
      icon: FaCogs,
      gradient: "from-amber-400 via-yellow-500 to-orange-500",
      hoverGradient: "from-amber-500 via-yellow-600 to-orange-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-700",
      valueColor: "text-amber-800",
      borderColor: "border-amber-300",
      shadowColor: "shadow-amber-200",
      isAmount: true
    },
    { 
      name: "Insurance", 
      value: dashboardData.insurance, 
      icon: FaShieldAlt,
      gradient: "from-blue-400 via-cyan-500 to-blue-600",
      hoverGradient: "from-blue-500 via-cyan-600 to-blue-700",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-700",
      valueColor: "text-blue-800",
      borderColor: "border-blue-300",
      shadowColor: "shadow-blue-200",
      isAmount: true
    },
    { 
      name: "Tax", 
      value: dashboardData.tax, 
      icon: FaMoneyBillWave,
      gradient: "from-red-400 via-pink-500 to-red-600",
      hoverGradient: "from-red-500 via-pink-600 to-red-700",
      bgColor: "bg-red-50",
      iconColor: "text-red-700",
      valueColor: "text-red-800",
      borderColor: "border-red-300",
      shadowColor: "shadow-red-200",
      isAmount: true
    },
    { 
      name: "Fast Tag", 
      value: dashboardData.fastTag, 
      icon: FaRoad,
      gradient: "from-purple-400 via-violet-500 to-purple-600",
      hoverGradient: "from-purple-500 via-violet-600 to-purple-700",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-700",
      valueColor: "text-purple-800",
      borderColor: "border-purple-300",
      shadowColor: "shadow-purple-200",
      isAmount: true
    },
    { 
    name: "Total Fast Tag Amount", 
    value: dashboardData.totalFastTagAmount, 
    icon: FaCreditCard,
    gradient: "from-teal-400 via-cyan-500 to-teal-600",
    hoverGradient: "from-teal-500 via-cyan-600 to-teal-700",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-700",
    valueColor: "text-teal-800",
    borderColor: "border-teal-300",
    shadowColor: "shadow-teal-200",
    isAmount: true
  }
  ];

  const donutData = [
    { name: 'Maintenance', value: dashboardData.maintenanceCount, color: '#f59e0b' },
    { name: 'Insurance', value: dashboardData.insuranceCount, color: '#3b82f6' },
    { name: 'Tax', value: dashboardData.taxCount, color: '#ef4444' },
    { name: 'Fast Tag', value: dashboardData.fastTagCount, color: '#8b5cf6' }
  ].filter(item => item.value > 0);

  const TileCard = ({ icon: Icon, title, onClick, colorScheme = "blue" }) => {
    const colorClasses = {
      blue: { gradient: "from-cyan-300 via-blue-200 to-blue-300 hover:from-blue-400 hover:to-cyan-400", border: "border-blue-600", iconBg: "border-blue-300", iconColor: "text-blue-800", titleColor: "text-blue-900", buttonBg: "bg-blue-700 hover:bg-blue-900" },
      green: { gradient: "from-green-300 via-lime-200 to-green-300 hover:from-green-400 hover:to-lime-400", border: "border-green-600", iconBg: "border-green-300", iconColor: "text-green-800", titleColor: "text-green-900", buttonBg: "bg-green-700 hover:bg-green-900" },
      purple: { gradient: "from-purple-300 via-purple-200 to-purple-300 hover:from-purple-400 hover:to-purple-400", border: "border-purple-600", iconBg: "border-purple-300", iconColor: "text-purple-800", titleColor: "text-purple-900", buttonBg: "bg-purple-700 hover:bg-purple-900" },
      orange: { gradient: "from-orange-300 via-orange-200 to-orange-300 hover:from-orange-400 hover:to-orange-400", border: "border-orange-600", iconBg: "border-orange-300", iconColor: "text-orange-800", titleColor: "text-orange-900", buttonBg: "bg-orange-700 hover:bg-orange-900" },
      red: { gradient: "from-red-300 via-red-200 to-red-300 hover:from-red-400 hover:to-red-400", border: "border-red-600", iconBg: "border-red-300", iconColor: "text-red-800", titleColor: "text-red-900", buttonBg: "bg-red-700 hover:bg-red-900" },
      indigo: { gradient: "from-indigo-300 via-indigo-200 to-indigo-300 hover:from-indigo-400 hover:to-indigo-400", border: "border-indigo-600", iconBg: "border-indigo-300", iconColor: "text-indigo-800", titleColor: "text-indigo-900", buttonBg: "bg-indigo-700 hover:bg-indigo-900" },
      teal: { gradient: "from-teal-300 via-teal-200 to-teal-300 hover:from-teal-400 hover:to-teal-400", border: "border-teal-600", iconBg: "border-teal-300", iconColor: "text-teal-800", titleColor: "text-teal-900", buttonBg: "bg-teal-700 hover:bg-teal-900" }
    };

    const colors = colorClasses[colorScheme];

    return (
      <div className={`w-64 h-36 rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer border-2 ${colors.border}`}>
        <div className="p-2 flex flex-col items-center justify-center space-y-1 h-full">
          <div className={`bg-white p-1.5 rounded-full border-2 ${colors.iconBg} shadow-md`}>
            <Icon className={`${colors.iconColor} text-lg`} />
          </div>
          <h3 className={`text-xs font-bold ${colors.titleColor} text-center px-1`}>{title}</h3>
          <button onClick={onClick} className={`${colors.buttonBg} text-white px-2 py-1 rounded-full text-xs shadow-md transition`}>
            Click Here
          </button>
        </div>
      </div>
    );
  };

  const StatsTile = ({ data }) => {
    const { name, value, icon: Icon, gradient, hoverGradient, bgColor, iconColor, valueColor, borderColor, shadowColor, isAmount } = data;
    
    const formatValue = (val) => {
      if (isAmount) {
        return `₹${parseFloat(val).toFixed(2)}`;
      }
      return val;
    };
    
    return (
      <div className={`group relative overflow-hidden rounded-lg ${bgColor} border-2 ${borderColor} shadow-lg ${shadowColor} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
        <div className={`absolute inset-0 bg-gradient-to-br ${hoverGradient} opacity-0 group-hover:opacity-15 transition-all duration-500 transform scale-110 group-hover:scale-100`}></div>
        
        <div className="relative p-2 flex flex-col items-center justify-center h-full space-y-1">
          <div className={`relative bg-white p-1.5 rounded-full shadow-md border-2 ${borderColor} group-hover:scale-105 transition-transform duration-300`}>
            <Icon className={`${iconColor} text-base group-hover:animate-pulse`} />
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 animate-ping`}></div>
          </div>
          
          <div className="text-center space-y-0.5">
            <div className={`text-xl font-bold ${valueColor} group-hover:scale-105 transition-transform duration-300`}>
              {isLoading ? <FaSpinner className="animate-spin" /> : formatValue(value)}
            </div>
            <div className={`text-xs font-semibold ${iconColor} uppercase tracking-wide`}>
              {name}
            </div>
          </div>
          
          <div className={`w-0 h-0.5 bg-gradient-to-r ${gradient} group-hover:w-full transition-all duration-300 rounded-full`}></div>
        </div>
      </div>
    );
  };

  const TabContent = ({ tabs }) => {
    const colors = ["blue", "green", "purple", "orange", "red", "indigo", "teal"];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-3">
        {tabs.map((tab, index) => (
          <TileCard
            key={index} 
            icon={tab.icon}
            title={tab.name}
            colorScheme={colors[index % colors.length]}
            onClick={() => navigate(tab.route)}
          />
        ))}
      </div>
    );
  };  

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const actualValue = payload[0].name === 'Maintenance' ? dashboardData.maintenance :
                         payload[0].name === 'Insurance' ? dashboardData.insurance :
                         payload[0].name === 'Tax' ? dashboardData.tax :
                         payload[0].name === 'Fast Tag' ? dashboardData.fastTag : 0;
      
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">{`Amount: ₹${parseFloat(actualValue).toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="py-3 px-3">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow border-2 border-blue-500 overflow-hidden">
          <div className="p-2">
            <div className="flex justify-between items-center">
              <img src="./img.png" alt="Logo" className="mr-4 w-40 h-12 rounded-lg" />
              <div className="flex-grow flex justify-center">
                <div className="bg-[#5ea8bb] px-1 py-1.5 rounded-lg inline-block -ml-20">
                  <h1 className="text-xl font-bold text-white">HO Vehicle Tracker</h1>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-white bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed] hover:from-[#c71d6f] hover:to-[#d09693] rounded-full p-1"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="h-0.5 bg-blue-600 w-[95%] mx-auto"></div>

          <div className="p-5">
            <div className="flex justify-center gap-8 flex-wrap">
              <div
                onClick={() => setShowTwoWheelerModal(true)}
                className="w-64 cursor-pointer rounded-xl bg-gradient-to-br from-cyan-100 via-blue-200 to-blue-300 hover:from-blue-400 hover:to-cyan-400 shadow-md transition-all transform hover:-translate-y-1 border border-blue-500"
              >
                <div className="p-4 flex flex-col items-center space-y-3">
                  <div className="bg-white p-3 rounded-full border-2 border-blue-300 shadow-sm">
                    <FaMotorcycle className="text-blue-800 text-2xl" />
                  </div>
                  <h2 className="text-lg font-semibold text-blue-900 tracking-wide">Two Wheeler</h2>
                  <button className="bg-blue-700 hover:bg-blue-900 text-white px-4 py-1.5 rounded-full text-sm shadow-sm transition">
                    Click Here
                  </button>
                </div>
              </div>

              <div
                onClick={() => setShowFourWheelerModal(true)}
                className="w-64 cursor-pointer rounded-xl bg-gradient-to-br from-green-100 via-lime-200 to-green-300 hover:from-green-400 hover:to-lime-400 shadow-md transition-all transform hover:-translate-y-1 border border-green-500"
              >
                <div className="p-4 flex flex-col items-center space-y-3">
                  <div className="bg-white p-3 rounded-full border-2 border-green-300 shadow-sm">
                    <FaCar className="text-green-800 text-2xl" />
                  </div>
                  <h2 className="text-lg font-semibold text-green-900 tracking-wide">Four Wheeler</h2>
                  <button className="bg-green-700 hover:bg-green-900 text-white px-4 py-1.5 rounded-full text-sm shadow-sm transition">
                    Click Here
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicle Dashboard Section with Tiles */}
            <div className="mt-3 bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-700 text-white px-3 py-1.5 flex items-center justify-between">
                <h2 className="text-base font-semibold text-center w-full">Four Wheeler's Vehicle Dashboard</h2>
              </div>

              <div className="p-3">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="w-full lg:w-3/5">
                    <div className="bg-gray-50 rounded-md p-2 shadow-inner">
  <h3 className="text-sm font-semibold text-gray-800 mb-2">Vehicle Statistics</h3>
  
  {/* First row - 4 tiles */}
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 mb-3">
    {tileData.slice(0, 4).map((tile, index) => (
      <StatsTile key={index} data={tile} />
    ))}
  </div>
  
  {/* Second row - 3 tiles */}
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
    {tileData.slice(4).map((tile, index) => (
      <StatsTile key={index + 4} data={tile} />
    ))}
  </div>
  
</div>
                  </div>

                  <div className="w-full lg:w-2/5">
                    <div className="bg-gray-50 rounded-md p-2 shadow-inner">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1 text-center">Vehicle Count Overview</h3>

                      <div className="h-40 relative">
                        {isLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <FaSpinner className="animate-spin text-xl text-purple-600" />
                          </div>
                        ) : donutData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={donutData}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {donutData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                              <Legend
                                verticalAlign="bottom"
                                height={24}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '11px' }}
                                formatter={(value, entry) => (
                                  <span style={{ color: entry.color, fontWeight: 'bold' }}>{value}</span>
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                              <FaExclamationTriangle className="mx-auto mb-1 text-xl" />
                              <p className="text-sm">No data available</p>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-800">ACTIVE</div>
                            <div className="text-sm font-semibold text-gray-600">{dashboardData.active}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center bg-gradient-to-br from-emerald-50 to-green-100 rounded-lg p-1 shadow-sm border border-green-200">
                        <div className="flex items-center justify-center mb-2">
                          <FaMoneyBillWave className="text-green-600 text-lg mr-1"/>
                          <span className="text-xs font-semibold text-green-800 uppercase tracking-wide">Total Amount</span>
                        </div>
                        <div className="text-lg font-bold text-green-900">
                          {isLoading ? (
                            <FaSpinner className="animate-spin mx-auto"/>
                          ) : (
                            `₹${parseFloat(dashboardData.totalAmount).toFixed(2)}`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Analytics Dashboard */}
            <div className="mt-3 bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 text-white px-3 py-1.5 flex items-center justify-between">
                <h2 className="text-base font-semibold text-center w-full">Vehicle Analytics Dashboard</h2>
              </div>

              <div className="p-3">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">Select Year</label>
    <select 
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={selectedYear}
      onChange={(e) => setSelectedYear(e.target.value)}
    >
      {years.map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  </div>

  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
    <select 
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={selectedVehicleType}
      onChange={(e) => setSelectedVehicleType(e.target.value)}
    >
      <option value="4wheeler">4 Wheeler</option>
      <option value="2wheeler">2 Wheeler</option>
    </select>
  </div>
</div>
            

                <div className="flex flex-col lg:flex-row gap-3">
                 <div className={`w-full ${selectedVehicleType === '4wheeler' ? 'lg:w-3/5' : 'lg:w-3/5'}`}>
                    <div className="bg-gray-50 rounded-md p-2 shadow-inner">
                     <h3 className="text-sm font-semibold text-gray-800 mb-2">
  {selectedVehicleType === '4wheeler' ? '4 Wheeler' : '2 Wheeler'} Statistics - {selectedYear === 'All' ? 'All Years' : selectedYear}
</h3>
                      {/* First Row: Total, Active, Inactive */}
{/* First Row: Total, Active, Inactive */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 mb-3">
  <div className="bg-white border-2 border-indigo-600 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-indigo-500 p-1.5 rounded-full shadow-sm">
        <FaCar className="text-white text-base"/>
      </div>
      <div className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Total Vehicles</div>
      <div className="w-full h-0.5 bg-indigo-400 my-1"></div>
      <div className="bg-indigo-600 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        {selectedVehicleType === '4wheeler' ? fourWheelerData.total : twoWheelerData.total}
      </div>
    </div>
  </div>

  <div className="bg-white border-2 border-green-600 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-green-500 p-1.5 rounded-full shadow-sm">
        <FaCheckCircle className="text-white text-base" />
      </div>
      <div className="text-sm font-semibold text-green-700 uppercase tracking-wide">Active</div>
      <div className="w-full h-0.5 bg-green-400 my-1"></div>
      <div className="bg-green-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        {selectedVehicleType === '4wheeler' ? fourWheelerData.active : twoWheelerData.active}
      </div>
    </div>
  </div>

  <div className="bg-white border-2 border-red-600 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-red-500 p-1.5 rounded-full shadow-sm">
        
        <FaExclamationTriangle className="text-white text-base"/>
      </div>
      <div className="text-sm font-semibold text-red-700 uppercase tracking-wide">Inactive</div>
      <div className="w-full h-0.5 bg-red-400 my-1"></div>
      <div className="bg-red-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        {selectedVehicleType === '4wheeler' ? fourWheelerData.inactive : twoWheelerData.inactive}
      </div>
    </div>
  </div>
</div>

{/* Second Row: Insurance, Maintenance, Fast Tag, Tax */}
{selectedVehicleType === '4wheeler' && (
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
  <div className="bg-white border-2 border-blue-600 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-blue-500 p-1.5 rounded-full shadow-sm">
        <FaShieldAlt className="text-white text-base"/>
      </div>
      <div className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Insurance</div>
      <div className="w-full h-0.5 bg-blue-400 my-1"></div>
      <div className="bg-blue-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        ₹{parseFloat(fourWheelerData.insurance).toFixed(2)}
      </div>
    </div>
  </div>

  <div className="bg-white border-2 border-amber-600 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-amber-500 p-1.5 rounded-full  shadow-sm">
        <FaCogs className="text-white text-base"/>
      </div>
       <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Maintenance</div>
        <div className="w-full h-0.5 bg-amber-400 my-1"></div>
      <div className="bg-amber-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        ₹{parseFloat(fourWheelerData.maintenance).toFixed(2)}
      </div>
    </div>
  </div>

  <div className="bg-white border-2 border-purple-600 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-purple-500 p-1.5 rounded-full  shadow-sm">
        <FaRoad className="text-white text-base" />
      </div>
      <div className="text-[10px] font-semibold text-purple-700 uppercase tracking-wide">Fast_Tag & Challan</div>
        <div className="w-full h-0.5 bg-purple-400 my-1"></div>
      <div className="bg-purple-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        ₹{parseFloat(fourWheelerData.fastTag).toFixed(2)}
      </div>
      
    </div>
  </div>

  <div className="bg-white border-2 border-orange-600 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-orange-500 p-1.5 rounded-full  shadow-sm">
        <FaMoneyBillWave className="text-white text-base" />
      </div>
      <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Tax</div>
      <div className="w-full h-0.5 bg-orange-400 my-1"></div>
      <div className="bg-orange-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        ₹{parseFloat(fourWheelerData.tax).toFixed(2)}
      </div>
      
    </div>
  </div>
  
</div>)}
{/* // 4. Update the Total Amount tile */}
{selectedVehicleType === '4wheeler' && (
<div className="grid grid-cols-1 gap-2 mt-3">
  <div className="bg-white border-2 border-emerald-600 rounded-lg p-3 shadow-sm">
    <div className="flex flex-col items-center space-y-2">
      <div className="bg-emerald-600 p-2 rounded-full  shadow-sm">
        <FaMoneyBillWave className="text-white text-lg" />
      </div>
       <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Total Expenses Amount</div>
        <div className="w-full h-0.5 bg-emerald-400 my-1"></div>
      <div className="bg-emerald-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        ₹{parseFloat(fourWheelerData.totalAmount).toFixed(2)}
      </div>
     
    </div>
  </div>
</div>
)}
{/* Third Row: Scrap, Sold, Total - Only for 4wheeler */}
{selectedVehicleType === '4wheeler' && (
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-2 mt-3">
  <div className="bg-white border-2 border-teal-600 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-teal-500 p-1.5 rounded-full shadow-sm">
        <FaMoneyBillWave className="text-white text-base" />
      </div>
      <div className="text-sm font-semibold text-teal-700 uppercase tracking-wide">Sold Amount</div>
      <div className="w-full h-0.5 bg-teal-400 my-1"></div>
      <div className="bg-teal-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        ₹{parseFloat(fourWheelerData.soldAmount || 0).toFixed(2)}
      </div>
    </div>
  </div>

  <div className="bg-white border-2 border-indigo-600 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-indigo-500 p-1.5 rounded-full shadow-sm">
        <FaWrench className="text-white text-base"/>
      </div>
      <div className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Scrap Amount</div>
      <div className="w-full h-0.5 bg-indigo-400 my-1"></div>
      <div className="bg-indigo-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        ₹{parseFloat(fourWheelerData.scarpAmount || 0).toFixed(2)}
      </div>
    </div>
  </div>

  
</div>
)}

{/* Second Row: Sold, Scrap, Total Amount - Only for 2wheeler */}
{selectedVehicleType === '2wheeler' && (
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 mt-3">
  <div className="bg-white border-2 border-blue-300 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-blue-600 p-1.5 rounded-full border-2 border-blue-300 shadow-sm">
        <FaShieldAlt className="text-white text-base"/>
      </div>
       <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Insurance Amount</div>
        <div className="w-full h-0.5 bg-blue-400 my-1"></div>
      <div className="bg-blue-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        ₹{parseFloat(twoWheelerData.insuAmount).toFixed(2)}
      </div>
     
    </div>
  </div>

 <div className="bg-white border-2 border-amber-600 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-amber-500 p-1.5 rounded-full  shadow-sm">
        <FaCogs className="text-white text-base" />
      </div>
       <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Maintenance</div>
        <div className="w-full h-0.5 bg-amber-400 my-1"></div>
      <div className="bg-amber-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        ₹{parseFloat(twoWheelerData.maintAmount).toFixed(2)}
      </div>
    </div>
  </div>

  <div className="bg-white border-2 border-emerald-300 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-emerald-600 p-1.5 rounded-full border-2 border-emerald-300 shadow-sm">
        <FaMoneyBillWave className="text-white text-base"/>
      </div>
       <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Total Expenses Amount</div>
        <div className="w-full h-0.5 bg-emerald-400 my-1"></div>
      <div className="bg-emerald-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        ₹{parseFloat(twoWheelerData.totalDisposedAmount).toFixed(2)}
      </div>
     
    </div>
  </div>
</div>
)}
{/* Second Row: Sold, Scrap, Total Amount - Only for 2wheeler */}
{selectedVehicleType === '2wheeler' && (
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-2 mt-3">
  <div className="bg-white border-2 border-orange-300 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-orange-600 p-1.5 rounded-full border-2 border-orange-300 shadow-sm">
        <FaMoneyBillWave className="text-white text-base"/>
      </div>
       <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Sold Amount</div>
        <div className="w-full h-0.5 bg-orange-400 my-1"></div>
      <div className="bg-orange-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        ₹{parseFloat(twoWheelerData.soldAmount).toFixed(2)}
      </div>
     
    </div>
  </div>

  <div className="bg-white border-2 border-indigo-300 rounded-lg p-2 shadow-sm">
    <div className="flex flex-col items-center space-y-1">
      <div className="bg-indigo-600 p-1.5 rounded-full border-2 border-indigo-300 shadow-sm">
        <FaWrench className="text-white text-base"/>
      </div>
      <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Scrap Amount</div>
      <div className="w-full h-0.5 bg-indigo-400 my-1"></div>
      <div className="bg-indigo-500 text-white px-2 py-1 rounded text-xl font-bold w-full text-center">
        ₹{parseFloat(twoWheelerData.scrapAmount).toFixed(2)}
      </div>
      
    </div>
  </div>

</div>
)}
                    </div>
                  </div>

                 <div className={`w-full ${selectedVehicleType === '4wheeler' ? 'lg:w-2/5' : 'lg:w-2/5'}`}>
                    <div className="bg-gray-50 rounded-md p-2 shadow-inner">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1 text-center">
  {selectedVehicleType === '4wheeler' ? '4 Wheeler' : '2 Wheeler'} Distribution - {selectedYear === 'All' ? 'All Years' : selectedYear}
</h3>
                 <div className="h-80 relative">
  <ResponsiveContainer width="100%" height="100%">
 <BarChart
      data={selectedVehicleType === '4wheeler' ? [
        {
          name: 'Insurance',
          value: fourWheelerData.insurance,
        },
        {
          name: 'Maintenance', 
          value: fourWheelerData.maintenance,
        },
        {
          name: 'Tax',
          value: fourWheelerData.tax,
        },
        {
          name: 'Fast_tag & Challan',
          value: fourWheelerData.fastTag,
        }
      ] : [
        {
          name: 'Insu amt',
          value: twoWheelerData.insuAmount,
        },
        {
          name: 'Maint amt',
          value: twoWheelerData.maintAmount,
        }
      ]}
      margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
    >
      <XAxis 
        dataKey="name" 
        tick={{ fontSize: 12 }}
        angle={-45}
        textAnchor="end"
        height={60}
      />
      <YAxis />
      <Tooltip 
        formatter={(value) => [`₹${parseFloat(value).toFixed(2)}`, 'Amount']}
      />
      <Bar dataKey="value">
        {(selectedVehicleType === '4wheeler' ? [0, 1, 2, 3] : [0, 1]).map((index) => (
          <Cell key={`cell-${index}`} fill={barColors[index]} />
        ))}
      </Bar>
    </BarChart>


{selectedVehicleType === '2wheeler' && (
  <div className="-mt-20">

    <div className="bg-white border-2 border-purple-300 rounded-lg p-3 shadow-sm">
      <div className="text-center mb-3">
        <h4 className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
          Vehicle Status Distribution (Amounts)
        </h4>
      </div>
      
      {/* Multi-segment progress bar for amounts */}
      <div className="w-full mb-4">
        {(() => {
          // Ensure all values are numbers and handle null/undefined
          const soldAmount = parseFloat(twoWheelerData.soldAmount || 0) || 0;
          const scrapAmount = parseFloat(twoWheelerData.scrapAmount || 0) || 0;
         
          
          const totalAmount = soldAmount + scrapAmount ;
          
          // Calculate percentages - use 0 if total is 0
          const soldPercentage = totalAmount > 0 ? (soldAmount / totalAmount) * 100 : 0;
          const scrapPercentage = totalAmount > 0 ? (scrapAmount / totalAmount) * 100 : 0;
          
          
          return (
            <>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Sold: ₹{soldAmount.toFixed(2)} ({soldPercentage.toFixed(1)}%)</span>
                 <span>Scrap: ₹{scrapAmount.toFixed(2)} ({scrapPercentage.toFixed(1)}%)</span>
                
                {/* <span>Total: ₹{totalAmount.toFixed(2)}</span> */}
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
                {totalAmount === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs bg-gray-100">
                    No amount data available
                  </div>
                ) : (
                  <>
                    {/* Sold Amount segment */}
                    {soldAmount > 0 && (
                      <div 
                        className="bg-teal-500 h-full flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
                        style={{ 
                          width: `${Math.max(soldPercentage, soldAmount > 0 ? 5 : 0)}%` 
                        }}
                        title={`Sold Amount: ₹${soldAmount.toFixed(2)}`}
                      >
                        {soldPercentage > 15 ? 'Sold' : ''}
                      </div>
                    )}
                    
                    {/* Scrap Amount segment */}
                    {scrapAmount > 0 && (
                      <div 
                        className="bg-indigo-500 h-full flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
                        style={{ 
                          width: `${Math.max(scrapPercentage, scrapAmount > 0 ? 5 : 0)}%` 
                        }}
                        title={`Scrap Amount: ₹${scrapAmount.toFixed(2)}`}
                      >
                        {scrapPercentage > 15 ? 'Scrap' : ''}
                      </div>
                    )}
                    
                  
                  </>
                )}
              </div>
              
             
            </>
          );
        })()}
      </div>
      {/* Count-based progress bar */}
      <MultiSegmentProgressBars
        soldCount={twoWheelerData.sold || 0}
        scrapCount={twoWheelerData.scrap || 0}
       
      />
    </div>
  </div>
)}
{selectedVehicleType === '4wheeler' && (
  <div className="mt-4">
    <div className="bg-white border-2 border-purple-300 rounded-lg p-3 shadow-sm">
      <div className="text-center mb-3">
        <h4 className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
          Vehicle Status Distribution (Amounts)
        </h4>
      </div>
      
      {/* Multi-segment progress bar for amounts */}
      <div className="w-full mb-4">
        {(() => {
          // Ensure all values are numbers and handle null/undefined
          const soldAmount = parseFloat(fourWheelerData.soldAmount || 0) || 0;
          const scrapAmount = parseFloat(fourWheelerData.scarpAmount || 0) || 0;
         
          
          const totalAmount = soldAmount + scrapAmount ;
          
          // Calculate percentages - use 0 if total is 0
          const soldPercentage = totalAmount > 0 ? (soldAmount / totalAmount) * 100 : 0;
          const scrapPercentage = totalAmount > 0 ? (scrapAmount / totalAmount) * 100 : 0;
          
          
          return (
            <>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Sold: ₹{soldAmount.toFixed(2)} ({soldPercentage.toFixed(1)}%)</span>
                 <span>Scrap: ₹{scrapAmount.toFixed(2)} ({scrapPercentage.toFixed(1)}%)</span>
                {/* <span>Total: ₹{totalAmount.toFixed(2)}</span> */}
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
                {totalAmount === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs bg-gray-100">
                    No amount data available
                  </div>
                ) : (
                  <>
                    {/* Sold Amount segment */}
                    {soldAmount > 0 && (
                      <div 
                        className="bg-teal-500 h-full flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
                        style={{ 
                          width: `${Math.max(soldPercentage, soldAmount > 0 ? 5 : 0)}%` 
                        }}
                        title={`Sold Amount: ₹${soldAmount.toFixed(2)}`}
                      >
                        {soldPercentage > 15 ? 'Sold' : ''}
                      </div>
                    )}
                    
                    {/* Scrap Amount segment */}
                    {scrapAmount > 0 && (
                      <div 
                        className="bg-indigo-500 h-full flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
                        style={{ 
                          width: `${Math.max(scrapPercentage, scrapAmount > 0 ? 5 : 0)}%` 
                        }}
                        title={`Scrap Amount: ₹${scrapAmount.toFixed(2)}`}
                      >
                        {scrapPercentage > 15 ? 'Scrap' : ''}
                      </div>
                    )}
                    
                  
                  </>
                )}
              </div>
              
              
            </>
          );
        })()}
      </div>
      {/* Count-based progress bar */}
      <MultiSegmentProgressBar
        soldCount={fourWheelerData.sold || 0}
        scrapCount={fourWheelerData.scrap || 0}
        
      />
    </div>
  </div>
)}
  </ResponsiveContainer>
</div>
 
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          <div className="mt-3 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
  <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-700 text-white px-3 py-1.5 flex items-center justify-between">
    <h2 className="text-base font-semibold text-center w-full">Vehicle Reports</h2>
  </div>
  
  <div className="p-4">
    {/* Filter Controls */}
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Vehicle Type:</label>
        <select 
          value={selectedVehicleType1}
          onChange={(e) => setSelectedVehicleType1(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="2-wheeler">2 Wheeler</option>
          <option value="4-wheeler">4 Wheeler</option>
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Status:</label>
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      
      <button
        onClick={downloadTableData}
        className="ml-auto px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center gap-2"
       >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download CSV
      </button>
    </div>
    
    {/* Reports Table */}
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
    <tr>
      {getTableHeaders().map((header) => (
        <th 
          key={header.key}
          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          {header.label}
        </th>
      ))}
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {isTableLoading ? (
      <tr>
        <td colSpan={getTableHeaders().length} className="px-4 py-8 text-center">
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin mr-2"/>
            Loading vehicle data...
          </div>
        </td>
      </tr>
    ) : vehicleTableData.length > 0 ? (
      paginatedData.map((vehicle, index) => (
        <tr key={vehicle.id || `${currentPage}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
       
          {getTableHeaders().map((header) => (
            <td 
              key={header.key}
              className="px-4 py-3 whitespace-nowrap text-sm text-gray-700"
            >
              {header.key === 'STATUS' || header.key === 'INS_STATUS' ? (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  (vehicle[header.key] === 'active') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {vehicle[header.key] || 'N/A'}
                </span>
              ) : (
                vehicle[header.key] || 'N/A'
              )}
            </td>
          ))}
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={getTableHeaders().length} className="px-4 py-8 text-center text-gray-500">
          No {selectedStatus} {selectedVehicleType1} vehicles found.
        </td>
      </tr>
    )}
  </tbody>
</table>

      <div className="flex justify-between items-center py-4 px-4">
  <span className="text-sm text-gray-600">
    Page {currentPage} of {totalPages}
  </span>

  <div className="space-x-2">
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
    >
      Previous
    </button>
    <button
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>

      
      {vehicleData[selectedVehicleType1][selectedStatus].length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No {selectedStatus} {selectedVehicleType1} vehicles found.
        </div>
      )}
    </div>
  </div>
</div>
          </div>
        </div>
      </div>

      {/* Two Wheeler Modal */}
      {showTwoWheelerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto border-4 border-blue-500">
            <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white px-4 py-5 relative">
              <h2 className="text-xl font-bold text-center">Two Wheeler Tabs</h2>
              <button onClick={closeModal} className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors">
                <FaTimes className="text-xl" />
              </button>
            </div>
            <TabContent tabs={twoWheelerTabs} />
            <div className="text-right p-4">
              <button onClick={closeModal} className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Four Wheeler Modal */}
       {showFourWheelerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto border-4 border-green-500">
            <div className="bg-gradient-to-r from-green-500 via-lime-500 to-green-600 text-white px-4 py-5 relative">
              <h2 className="text-xl font-bold text-center">Four Wheeler Tabs</h2>
              <button onClick={closeModal} className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors">
                <FaTimes className="text-xl" />
              </button>
            </div>
            <TabContent tabs={fourWheelerTabs} />
            <div className="text-right p-4">
              <button onClick={closeModal} className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NavBar;