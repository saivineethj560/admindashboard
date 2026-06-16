import React, { useState, useMemo, useEffect } from "react";
import { Search, RefreshCw, Download, Calendar, AlertTriangle, CheckCircle, Clock, Loader2, ExternalLink,X } from "lucide-react";
import axios from 'axios';
import { API_BASE_URL ,FILE_PATH} from '../Config.jsx';
import { useNavigate } from 'react-router-dom';
import { DollarSign } from "lucide-react";


const ChangeTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("insurance");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;
  const [showFastTagModal, setShowFastTagModal] = useState(false);
const [fastTagTotalAmount, setFastTagTotalAmount] = useState("");
const [submittingAmount, setSubmittingAmount] = useState(false);
  const navigate = useNavigate();
  // const isAuthorizedForModify = userToken?.employee === "Eswar Sonapuram";
  //-------------------------updated on 18-12-2025 by rajakumari.m--------------------------------------------------
  const [userToken, setToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo')) ? JSON.parse(localStorage.getItem('userInfo')) : null
  });
  const isAuthorizedForEdit = !["Rajakumari.M", "rajakumari.m"].includes(userToken?.employee);
    const isAuthorizedForModify = userToken.Emp_Id == "MHC877";
  const tabConfig = {
    insurance: {
      title: "Insurance",
      icon: "🛡️",
      headers: [
        "SNO",
        "VEHICLE NO",
        "VEHICLE TYPE",
        "FUEL TYPE",
        "VEHICLE COMPANY",
        "VEHICLE MODEL",
        "COMPANY & PLANT",
        "PURCHASE YEAR",
        "DATE OF REGISTRATION",
        "VALID OF REGISTRATION",
        "USER OR DEPT",
        "DRIVER NAME",
        "DRIVER MOBILE NO",
        "INSURANCE START DATE",
        "INSURANCE END DATE",
        "INSURANCE COMPANY",
        "INSURANCE COPY",
        "PREMIUM INSURANCE AMOUNT",
        "RC UPLOAD",
         "VEHICLE DOC",
      
        "All Files",
        "EDIT",
         "MODIFY",
      ],
      colors: {
        default: "bg-blue-50 text-blue-700 border-blue-500",
        active: "bg-blue-600 text-white border-blue-700",
        badge: { default: "bg-blue-100 text-blue-800", active: "bg-white/20 text-white" }
      },
      bgGradient: "from-blue-50 to-blue-100",
      accent: "blue-600"
    },
    maintenance: {
      title: "Maintenance",
      icon: "🔧",
      headers: [
        "SNO",
        "VEHICLE NO",
        "VEHICLE TYPE",
        "COMPANY",
        "VEHICLE MODEL",
        "PURCHASE YEAR",
        "USER",
        "DRIVER NAME",
        "SERVICE DATE",
        "STATUS",
       
        "DESCRIPTION",
        "VENDOR NAME",
        "MAINT FILE",
         "COST",
        // "CLAIM STATUS",
        // "CLAIM AMT",
        // "CLAIM DT",
        // "DIFFERENCE AMT",
          "VEHCILE KMS",
           "PAYMENT DATE",
        "PAYMENT STATUS",
      
        
        "ALL FILES",
        "EDIT",
          "MODIFY",
         
      ],
      colors: {
        default: "bg-green-50 text-green-700 border-green-500",
        active: "bg-green-600 text-white border-green-700",
        badge: { default: "bg-green-100 text-green-800", active: "bg-white/20 text-white" }
      },
      bgGradient: "from-green-50 to-green-100",
      accent: "green-600"
    },
      scrap: {
      title: "Scrap/Sold",
      icon: "🔧",
      headers: [
        "SNO",
        "VEHICLE NO",
        "VEHICLE TYPE",
        "COMPANY",
        "VEHICLE MODEL",
        "PURCHASE YEAR",
         "STATUS DATE",
        "STATUS AMOUNT",
        "STATUS REASON",
        "STATUS",
        "EDIT",
          // "MODIFY",
            ],
          

      colors: {
        default: "bg-pink-50 text-pink-700 border-pink-500",
        active: "bg-pink-600 text-white border-pink-700",
        badge: { default: "bg-pink-100 text-pink-800", active: "bg-white/20 text-white" }
      },
      bgGradient: "from-pink-50 to-pink-100",
      accent: "pink-600"
    },
    vhkms: {
    title: "Vehicle Kms", // Fixed title spelling
    icon: "🚗", // Changed to a more appropriate icon
    headers: [
      "SNO", "VEHICLE NO", "VEHICLE TYPE", "COMPANY", "VEHICLE MODEL",
      "PURCHASE YEAR", "VEHICLE KMS", "FROM DATE", "TO DATE", "EDIT",
    ],
    colors: {
      default: "bg-indigo-50 text-indigo-700 border-indigo-500", // Changed colors to differentiate from maintenance
      active: "bg-indigo-600 text-white border-indigo-700",
      badge: { default: "bg-indigo-100 text-indigo-800", active: "bg-white/20 text-white" }
    },
    bgGradient: "from-indigo-50 to-indigo-100",
    accent: "indigo-600"
  },
    roadTax: {
      title: "Road Tax/Quarterly Tax",
      icon: "💰",
      headers: [
        "SNO",
        "VEHICLE NO",
        "VEHICLE TYPE",
        "COMPANY",
        "VEHICLE MODEL",
        "PURCHASE YEAR",
        "USER",
        "DRIVER NAME",
        "TAX START DATE",
        "TAX REMAINDER DATE",
        "STATUS",
        "COST",
        "DESCRIPTION",
        "EDIT",
         "MODIFY",
      ],
      colors: {
        default: "bg-orange-50 text-orange-700 border-orange-500",
        active: "bg-orange-600 text-white border-orange-700",
        badge: { default: "bg-orange-100 text-orange-800", active: "bg-white/20 text-white" }
      },
      bgGradient: "from-orange-50 to-orange-100",
      accent: "orange-600"
    },
    fastTag: {
      title: "Fast Tag/Challan",
      icon: "🚗",
      headers: [
        "SNO",
        "VEHICLE NO",
        "VEHICLE TYPE",
        "COMPANY",
        "VEHICLE MODEL",
        "PURCHASE YEAR",
        "USER",
        "DRIVER NAME",
        "DRIVER MOBILE NO",
        "CHALLAN DATE",
        // "TRAFFIC CHALLAN",
        "CHALLAN AMT",
        "CHALLAN FILE",
          "FAST TAG FILE",
        "FAST TAG DATE",
        "FAST TAG NO",
        "FAST TAG BANK",
        "FAST TAG REGISTER MOBILE NO",
        "FAST AMT",
      
        "ALL FILES",
        "EDIT",
          "MODIFY",
            ],
          

      colors: {
        default: "bg-purple-50 text-purple-700 border-purple-500",
        active: "bg-purple-600 text-white border-purple-700",
        badge: { default: "bg-purple-100 text-purple-800", active: "bg-white/20 text-white" }
      },
      bgGradient: "from-purple-50 to-purple-100",
      accent: "purple-600"
    }
    
   
  };

  // State for storing API data
  const [vehicleData, setVehicleData] = useState({
    insurance: [],
    maintenance: [],
    roadTax: [],
    fastTag: [],
     scrap: [] ,
     vhkms:[]
  });

  // Function to fetch insurance data from API
  const fetchInsuranceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching insurance data...');
      
      const response = await fetch(`${API_BASE_URL}getInsuChangeData`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken.token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text);
        throw new Error('Server returned non-JSON response');
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.status && result.data && Array.isArray(result.data)) {
        console.log('Data received:', result.data.length, 'records');
        
        // Transform API data to match table structure
        const transformedData = result.data.map((item, index) => ({
          sno: index + 1,
          vehicleNo: item.VH_NUMBER || '-',
          vehicleType: item.VH_TYPE || '-',
          fuelType: item.FUEL || '-',
          vehicleCompany: item.VH_COMPANY || '-',
          vehicleModel: item.VH_MODEL || '-',
          companyPlant: item.COMP_PLANT || '-',
        purchaseYear: item.PUR_YEAR ? new Date(item.PUR_YEAR).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
          dateOfRegistration: item.REG_DT ? new Date(item.REG_DT).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
          validOfRegistration: item.REG_VALID ? new Date(item.REG_VALID).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
          userOrDept: item.VH_USER || '-',
          driverName: item.VH_DRIVER || '-',
          driverMobile: item.MOBILE || '-',
        insuranceStartDate: item.INSURANCE_START_DATE
  ? new Date(item.INSURANCE_START_DATE).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-",


          insuranceEndDate: item.INSURANCE_END_DATE
           ? new Date(item.INSURANCE_END_DATE).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-",
          insuranceCompany: item.INSURANCE_CMP || '-',
          insuranceCopy: item.INS_FILE || '-',
          insuranceAmount: item.AMT || '-',
          rcUpload: item.RC || '-',
           vhDocUpload: item.VH_DOC || '-',
         
         allFiles: 'View Files', 
          edit: 'Edit',
          modify: 'Modify',
        }));

        console.log('Transformed data:', transformedData);

        setVehicleData(prev => ({
          ...prev,
          insurance: transformedData
        }));

        setError(null);
      } else {
        console.error('Invalid response structure:', result);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching insurance data:', err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
// Function to submit Fast Tag Total Amount
const handleFastTagTotalSubmit = async () => {
  if (!fastTagTotalAmount || fastTagTotalAmount.trim() === '') {
    alert('Please enter a valid amount');
    return;
  }

  // Validate that the amount is a positive number
  const amount = parseFloat(fastTagTotalAmount);
  if (isNaN(amount) || amount < 0) {
    alert('Please enter a valid positive number');
    return;
  }

  setSubmittingAmount(true);
  
  try {
    // Updated API endpoint - remove the extra slash
    const response = await fetch(`${API_BASE_URL}saveFastTagTotal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${userToken.token}`
      },
      body: JSON.stringify({
        TOTAL_FAST_AMT: amount
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Response is not JSON:', text);
      throw new Error('Server returned non-JSON response');
    }

    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.status) {
      alert('Fast Tag Total Amount saved successfully!');
      setShowFastTagModal(false);
      setFastTagTotalAmount("");
      // Optionally refresh the fast tag data to show updated information
      // fetchFastTagData();
    } else {
      throw new Error(result.message || 'Failed to save amount');
    }
    
  } catch (error) {
    console.error('Error saving Fast Tag Total Amount:', error);
    alert(`Error saving amount: ${error.message}. Please try again.`);
  } finally {
    setSubmittingAmount(false);
  }
};
  // Function to fetch maintenance data from API
 const fetchMaintenanceData = async () => {     
  setLoading(true);     
  setError(null);          

  try {       
    console.log('Fetching maintenance data...');              

    const response = await fetch(`${API_BASE_URL}getMaintChange`, {         
      method: 'GET',         
      headers: {           
        'Content-Type': 'application/json',           
        'Accept': 'application/json',           
        'Authorization': `Bearer ${userToken.token}`         
      }       
    });        

    console.log('Maintenance Response status:', response.data);        

    if (!response.ok) {         
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);       
    }        

    const contentType = response.headers.get('content-type');       
    // console.log('Maintenance Content-Type:', contentType);              

    if (!contentType || !contentType.includes('application/json')) {         
      const text = await response.text();         
      // console.error('Response is not JSON:', text);         
      throw new Error('Server returned non-JSON response');       
    }        

    const result = await response.json();       
    console.log('Maintenance API Response:', result.data);              

    if (result.status && result.data && Array.isArray(result.data)) {         
      // console.log('Maintenance data received:', result.data.length, 'records');                  

      // Transform API data to match maintenance table structure         
      const transformedData = result.data.map((item, index) => {
  // Calculate difference amount (COST - CLAIMED AMT)
  const costMain = parseFloat(item.COST_MAIN) || 0;
  const claimAmt = parseFloat(item.CLAIM_AMT) || 0;
  
  // Only calculate and display difference if both cost and claim amount exist and claim amount > 0
  let differenceAmount = '-';
  if (costMain > 0 && claimAmt > 0) {
    differenceAmount = (costMain - claimAmt).toFixed(2);
  }
  
        return {
    sno: index + 1,           
    vehicleNo: item.VH_NUMBER || '-',           
    vehicleType: item.VH_TYPE || '-',           
    company: item.VH_COMPANY || '-',           
    vehicleModel: item.VH_MODEL || '-',           
    purchaseYear: item.PUR_YEAR ? new Date(item.PUR_YEAR).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-",            
    user: item.VH_USER || '-',           
    driverName: item.VH_DRIVER || '-',           
    serviceDate: item.SERVICE_DATE ? new Date(item.SERVICE_DATE).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-",  
    status: item.STATUS_MAIN || '-',                   
    description: item.DESC_MAIN || '-',           
    vendorName: item.VENDOR_NAME || '-',           
    maintFile: item.MAINT_FILE || '-',              
    cost: item.COST_MAIN || '-',           
    // claimStatus: item.CLAIM_STATUS || '-',           
    // claimAmt: item.CLAIM_AMT || '-',           
    // claimDt: item.CLAIM_DT || '-',           
    // differenceAmt: differenceAmount, // Show difference only when both values exist
    vhckms: item.VHC_KMS || '-',           
    pydate: item.PY_DATE? new Date(item.SERVICE_DATE).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-",             
    pystatus: item.PAY_STATUS || '-',  
    allFiles: 'View Files',           
    edit: 'Edit',
    modify: 'Modify',      
  };
});


      // console.log('Transformed maintenance data:', transformedData);          

      setVehicleData(prev => ({           
        ...prev,           
        maintenance: transformedData         
      }));          

      setError(null);       
    } else {         
      // console.error('Invalid maintenance response structure:', result);         
      setError('Invalid data format received from server');       
    }     
  } catch (err) {       
    // console.error('Error fetching maintenance data:', err);       
    setError(`Network error: ${err.message}`);     
  } finally {       
    setLoading(false);     
  }   
};

  const handleEdit = (vehicleNumber) => {
    navigate('/EditInsChangePage', {
      state: {
        vehicleNumber: vehicleNumber,
        editMode: true
      }
    });
  };
const fetchScrapData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    console.log('Fetching Scrap/Sold data...');
    
    const response = await fetch(`${API_BASE_URL}getScrapVehicles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${userToken.token}`
      }
    });

    console.log('Scrap Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error('Server returned non-JSON response');
    }

    const result = await response.json();
    console.log('Scrap API Response:', result);
    
    if (result.status && result.data && Array.isArray(result.data)) {
      console.log('Scrap data received:', result.data.length, 'records');
      
      // Transform API data to match scrap table structure

const transformedData = result.data.map((item, index) => ({
  sno: index + 1,
  vehicleNo: item.VH_NUMBER || '-',        // Note: using VH_NUMBER not vehicleNo
  vehicleType: item.VH_TYPE || '-',
  company: item.VH_COMPANY || '-',
  vehicleModel: item.VH_MODEL || '-',
   purchaseYear: item.PUR_YEAR ? new Date(item.PUR_YEAR).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
  statusDate: item.STAT_DT ? new Date(item.STAT_DT).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
  statusAmount: item.STAT_AMT || '-',
  statusReason: item.STATUS_RE || '-',
  status: item.INS_STATUS || '-',
  edit: 'Edit',
}));

      console.log('Transformed scrap data:', transformedData);

      setVehicleData(prev => ({
        ...prev,
        scrap: transformedData
      }));

      setError(null);
    } else {
      console.error('Invalid scrap response structure:', result);
      setError('Invalid data format received from server');
    }
  } catch (err) {
    console.error('Error fetching scrap data:', err);
    setError(`Network error: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

const fetchvhkmsData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    console.log('Fetching vehicle kms data...');
    
    const response = await fetch(`${API_BASE_URL}getvhkmsVehicles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${userToken.token}`
      }
    });

    console.log('Vehicle kms Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Response is not JSON:', text);
      throw new Error('Server returned non-JSON response');
    }

    const result = await response.json();
    console.log('Vehicle kms API Response:', result);
    
    if (result.status && result.data && Array.isArray(result.data)) {
      console.log('Vehicle kms data received:', result.data.length, 'records');
      
      // Transform API data to match vhkms table structure
      const transformedData = result.data.map((item, index) => ({
        sno: index + 1,
        vehicleNo: item.VH_NUMBER || '-',
        vehicleType: item.VH_TYPE || '-',
        company: item.VH_COMPANY || '-',
        vehicleModel: item.VH_MODEL || '-',
        purchaseYear: item.PUR_YEAR ?new Date(item.PUR_YEAR).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
        vehicleKms: item.VH_KMS || '-',
        fromDate: item.FROM_DATE ?new Date(item.FROM_DATE).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
        toDate: item.TO_DATE ?new Date(item.TO_DATE).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
        edit: 'Edit',
      }));

      console.log('Transformed vehicle kms data:', transformedData);

      setVehicleData(prev => ({
        ...prev,
        vhkms: transformedData
      }));

      setError(null);
    } else {
      console.error('Invalid vehicle kms response structure:', result);
      setError('Invalid data format received from server');
    }
  } catch (err) {
    console.error('Error fetching vehicle kms data:', err);
    setError(`Network error: ${err.message}`);
  } finally {
    setLoading(false);
  }
};
// Function to fetch Fast Tag/Challan data from API
const fetchFastTagData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    console.log('Fetching Fast Tag/Challan data...');
    
    const response = await fetch(`${API_BASE_URL}getFastChange`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${userToken.token}`
      }
    });

    console.log('Fast Tag Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    console.log('Fast Tag Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Response is not JSON:', text);
      throw new Error('Server returned non-JSON response');
    }

    const result = await response.json();
    console.log('Fast Tag API Response:', result);
    
    if (result.status && result.data && Array.isArray(result.data)) {
      console.log('Fast Tag data received:', result.data.length, 'records');
      
      // Transform API data to match Fast Tag table structure
      // Updated to match your actual API response fields
    const transformedData = result.data.map((item, index) => ({
  sno: index + 1,
  vehicleNo: item.VH_NUMBER || '-',
  vehicleType: item.VH_TYPE || '-',
  company: item.VH_COMPANY || '-',
  vehicleModel: item.VH_MODEL || '-',
  purchaseYear: item.PUR_YEAR ?new Date(item.PUR_YEAR).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
  user: item.VH_USER || '-',
  driverName: item.VH_DRIVER || '-',
  driverMobile: item.MOBILE || '-',
  challanDate: item.TRAF_DT ?new Date(item.TRAF_DT).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
  // trafficChallan: item.TRAFFIC_CHALLAN || '-',
  challanAmt: item.CHALLAN_AMT || '-',
  challanFile: item.CHALLAN_FILE || '-',
   fastTagFile: item.FAST_FILE || '-',
  fastTagDate: item.FAST_DT ?new Date(item.FAST_DT).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
  fastTagNo: item.TAG_NO || '-',
  fastTagBank: item.TAG_BANK || '-',
  fastTagRegisterMobileNo: item.TAG_REG_MOBILE || '-',
  fastAmt: item.FAST_AMT || '-',
   // ✅ Changed from fastTagUpload to fastTagFile
  allFiles: 'View Files',
  edit: 'Edit',
   modify: 'Modify',
}));

      console.log('Transformed Fast Tag data:', transformedData);

      setVehicleData(prev => ({
        ...prev,
        fastTag: transformedData
      }));

      setError(null);
    } else {
      console.error('Invalid Fast Tag response structure:', result);
      setError('Invalid data format received from server');
    }
  } catch (err) {
    console.error('Error fetching Fast Tag data:', err);
    setError(`Network error: ${err.message}`);
  } finally {
    setLoading(false);
  }
};
// Function to fetch road tax data from API
const fetchRoadTaxData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    // console.log('Fetching road tax data...');
    
    const response = await fetch(`${API_BASE_URL}getTaxChange`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${userToken.token}`
      }
    });

    // console.log('Road Tax Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    // console.log('Road Tax Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      // console.error('Response is not JSON:', text);
      throw new Error('Server returned non-JSON response');
    }

    const result = await response.json();
    // console.log('Road Tax API Response:', result);
    
    if (result.status && result.data && Array.isArray(result.data)) {
      // console.log('Road Tax data received:', result.data.length, 'records');
      
      // Transform API data to match road tax table structure
      const transformedData = result.data.map((item, index) => ({
        sno: index + 1,
        vehicleNo: item.VH_NUMBER || '-',
        vehicleType: item.VH_TYPE || '-',
        company: item.VH_COMPANY || '-',
        vehicleModel: item.VH_MODEL || '-',
        purchaseYear: item.PUR_YEAR ?new Date(item.PUR_YEAR).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
        user: item.VH_USER || '-',
        driverName: item.VH_DRIVER || '-',
        taxStartDate: item.TAX_START_DATE ?new Date(item.TAX_START_DATE).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
        taxRemainderDate: item.TAX_REMAINDER_DATE ?new Date(item.TAX_REMAINDER_DATE).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",   // 👈 full year (yyyy)
    }).replaceAll("/", "-") // 👈 replaces / with -
  : "-", 
        status: item.TAX_STATUS || '-',
        cost: item.COST || '-',
        description: item.DESCRIPTION || '-',
        edit: 'Edit',
         modify: 'Modify',
      }));

      console.log('Transformed road tax data:', transformedData);

      setVehicleData(prev => ({
        ...prev,
        roadTax: transformedData
      }));

      setError(null);
    } else {
      console.error('Invalid road tax response structure:', result);
      setError('Invalid data format received from server');
    }
  } catch (err) {
    console.error('Error fetching road tax data:', err);
    setError(`Network error: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  // Function to handle file viewing with proper authentication
  // const handleFileView = async (vehicleNo) => {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}insurance-file/${encodeURIComponent(vehicleNo)}`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${userToken.token}`,
  //         'Accept': 'application/pdf,image/*,*/*'
  //       }
  //     });

  //     if (!response.ok) {
  //       if (response.status === 401) {
  //         alert('Authentication failed. Please login again.');
  //         return;
  //       }
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     window.open(url, '_blank');
      
  //     setTimeout(() => {
  //       window.URL.revokeObjectURL(url);
  //     }, 1000);
      
  //   } catch (error) {
  //     console.error('Error viewing file:', error);
  //     alert('Error viewing file. Please try again.');
  //   }
  // };
  const handleFileView = (filePath) => {
      if (!filePath) {
        alert('No file path provided');
        return;
      }

      const url = `${FILE_PATH}public/storage/${filePath}`;
      window.open(url, '_blank');
    };

  // Function to handle file viewing with proper authentication
  // const handleRcFileView = async (vehicleNo) => {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}getRcFile/${encodeURIComponent(vehicleNo)}`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${userToken.token}`,
  //         'Accept': 'application/pdf,image/*,*/*'
  //       }
  //     });

  //     if (!response.ok) {
  //       if (response.status === 401) {
  //         alert('Authentication failed. Please login again.');
  //         return;
  //       }
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     window.open(url, '_blank');
      
  //     setTimeout(() => {
  //       window.URL.revokeObjectURL(url);
  //     }, 1000);
      
  //   } catch (error) {
  //     console.error('Error viewing file:', error);
  //     alert('Error viewing file. Please try again.');
  //   }
  // };
  const handleRcFileView = (filePath) => {
      if (!filePath) {
        alert('No file path provided');
        return;
      }

      const url = `${FILE_PATH}public/storage/${filePath}`;
      window.open(url, '_blank');
    };
const handleVhdocFileView = (filePath) => {
      if (!filePath) {
        alert('No file path provided');
        return;
      }

      const url = `${FILE_PATH}public/storage/${filePath}`;
      window.open(url, '_blank');
    };
  // Function to handle maintenance file viewing
  // const handleMaintenanceFileView = async (vehicleNo) => {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}getMaintFile/${encodeURIComponent(vehicleNo)}`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${userToken.token}`,
  //         'Accept': 'application/pdf,image/*,*/*'
  //       }
  //     });

  //     if (!response.ok) {
  //       if (response.status === 401) {
  //         alert('Authentication failed. Please login again.');
  //         return;
  //       }
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     window.open(url, '_blank');
      
  //     setTimeout(() => {
  //       window.URL.revokeObjectURL(url);
  //     }, 1000);
      
  //   } catch (error) {
  //     console.error('Error viewing maintenance file:', error);
  //     alert('Error viewing maintenance file. Please try again.');
  //   }
  // };
  const handleMaintenanceFileView = (filePath) => {
      if (!filePath) {
        alert('No file path provided');
        return;
      }

      const url = `${FILE_PATH}public/storage/${filePath}`;
      window.open(url, '_blank');
    };

  // Updated function to handle "View Files" navigation based on active tab
  const handleViewAllFiles = (vehicleNo, rowItem) => {
  console.log('Navigating to view files with:', { vehicleNo, rowItem, activeTab });
  
  // Check if vehicle number exists
  if (!vehicleNo || vehicleNo === '-') {
    alert('Vehicle number not available for this record.');
    return;
  }

  try {
    // Navigate to different pages based on active tab
    let targetPage = '';
    
    switch (activeTab) {
      case 'insurance':
        targetPage = '/ViewallIsuFiles';
        break;
      case 'maintenance':
        targetPage = '/ViewallMaintFiles';
        break;
      case 'roadTax':
        targetPage = '/ViewallRoadTaxFiles';
        break;
      case 'fastTag':
        targetPage = '/ViewallFastTagFiles';
        break;
      default:
        targetPage = '/ViewallIsuFiles'; // Default fallback
    }

    console.log(`Navigating to ${targetPage} for ${activeTab} tab`);
    
    // Navigate to the appropriate page
    navigate(targetPage, { 
      state: { 
        vehicleNumber: vehicleNo,
        vehicleData: rowItem,
        tabType: activeTab
      } 
    });
  } catch (error) {
    console.error('Navigation error:', error);
    alert('Error navigating to files view. Please try again.');
  }
};

  // Replace the existing handleEditClick function with this updated version
// Replace the existing handleEditClick function with this updated version
const handleEditClick = (rowItem) => {
  console.log('Edit button clicked for:', rowItem);
  
  // Validate vehicle number
  if (!rowItem.vehicleNo || rowItem.vehicleNo === '-') {
    alert('Vehicle number is not available for this record.');
    return;
  }

  try {
    // Determine the target edit page based on active tab
    let targetPage = '';
    
     switch (activeTab) {
    case 'insurance':
      targetPage = '/EditInsChangePage';
      break;
    case 'maintenance':
      targetPage = '/EditMaintChangePage';
      break;
    case 'roadTax':
      targetPage = '/EditRoadTaxPage';
      break;
    case 'fastTag':
      targetPage = '/EditFastChallanPage'; // ✅ This is correct
      break;
      case 'scrap':
  targetPage = '/EditScrapPage';
  break;
    case 'vhkms':
        targetPage = '/EditvhkmsPage';
        break;
    default:
      targetPage = '/EditInsChangePage';
  }
  
    console.log(`Navigating to ${targetPage} for ${activeTab} tab`);
    
    // Navigate to the appropriate edit page
    navigate(targetPage, { 
      state: { 
        vehicleNumber: rowItem.vehicleNo,
        vehicleData: rowItem,
        tabType: activeTab,
        editMode: true
      } 
    });
  } catch (error) {
    console.error('Navigation error:', error);
    alert('Error navigating to edit page. Please try again.');
  }
};
// Function to handle Challan file viewing
// Updated function to handle Challan file viewing
// const handleChallanFileView = async (vehicleNo) => {
//   try {
//     console.log('Viewing challan file for vehicle:', vehicleNo);
    
//     // First, get the file path from the API
//     const response = await fetch(`${API_BASE_URL}get-challan-file?vhno=${encodeURIComponent(vehicleNo)}`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${userToken.token}`,
//         'Accept': 'application/json'
//       }
//     });

//     if (!response.ok) {
//       if (response.status === 401) {
//         alert('Authentication failed. Please login again.');
//         return;
//       }
//       if (response.status === 404) {
//         alert('Challan file not found for this vehicle.');
//         return;
//       }
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     console.log('Challan file API response:', result);
    
//     // Check if the response contains the file path
//     if (result.status && result.data && result.data.CHALLAN_FILE) {
//       const filePath = result.data.CHALLAN_FILE;
//       console.log('File path received:', filePath);
      
//       // Now fetch the actual file using the file path
//       const fileResponse = await fetch(`${API_BASE_URL}view-file/${encodeURIComponent(filePath)}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${userToken.token}`,
//           'Accept': 'application/pdf,image/*,*/*'
//         }
//       });

//       if (!fileResponse.ok) {
//         if (fileResponse.status === 404) {
//           alert('File not found on server.');
//           return;
//         }
//         throw new Error(`File fetch error! status: ${fileResponse.status}`);
//       }

//       const blob = await fileResponse.blob();
//       const url = window.URL.createObjectURL(blob);
//       window.open(url, '_blank');
      
//       setTimeout(() => {
//         window.URL.revokeObjectURL(url);
//       }, 1000);
      
//     } else {
//       alert('No challan file found for this vehicle.');
//     }
    
//   } catch (error) {
//     console.error('Error viewing challan file:', error);
//     alert('Error viewing challan file. Please try again.');
//   }
// };
const handleChallanFileView = (filePath) => {
      if (!filePath) {
        alert('No file path provided');
        return;
      }

      const url = `${FILE_PATH}public/storage/${filePath}`;
      window.open(url, '_blank');
    };
    const handleFastTagFileView = (filePath) => {
      if (!filePath) {
        alert('No file path provided');
        return;
      }

      const url = `${FILE_PATH}public/storage/${filePath}`;
      window.open(url, '_blank');
    };

// const handleFastTagFileView = async (vehicleNo) => {
//   try {
//     console.log('Viewing Fast Tag file for vehicle:', vehicleNo);
    
//     // Updated API endpoint to match your backend structure
//     const response = await fetch(`${API_BASE_URL}get-fast-file/?vhno=${encodeURIComponent(vehicleNo)}`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${userToken.token}`,
//         'Accept': 'application/json'
//       }
//     });

//     if (!response.ok) {
//       if (response.status === 401) {
//         alert('Authentication failed. Please login again.');
//         return;
//       }
//       if (response.status === 404) {
//         alert('Fast Tag file not found for this vehicle.');
//         return;
//       }
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
    
//     // Check if the response contains file data
//     if (result.status && result.data && result.data.FAST_FILE) {
//       const filePath = result.data.FAST_FILE;
      
//       // Now make a second request to get the actual file
//       const fileResponse = await fetch(`${API_BASE_URL}view-file/${encodeURIComponent(filePath)}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${userToken.token}`,
//           'Accept': 'application/pdf,image/*,*/*'
//         }
//       });

//       if (!fileResponse.ok) {
//         throw new Error(`Error fetching file: ${fileResponse.status}`);
//       }

//       const blob = await fileResponse.blob();
//       const url = window.URL.createObjectURL(blob);
//       window.open(url, '_blank');
      
//       setTimeout(() => {
//         window.URL.revokeObjectURL(url);
//       }, 1000);
      
//     } else {
//       alert('No file data found in the response.');
//     }
    
//   } catch (error) {
//     console.error('Error viewing Fast Tag file:', error);
//     alert('Error viewing Fast Tag file. Please try again.');
//   }
// };
// Update the useEffect hook (around line 520) to include road tax data fetching
useEffect(() => {
  if (activeTab === 'insurance') {
    fetchInsuranceData();
  } else if (activeTab === 'maintenance') {
    fetchMaintenanceData();
  } else if (activeTab === 'roadTax') {
    fetchRoadTaxData();
  } else if (activeTab === 'fastTag') {
    fetchFastTagData();
  } else if (activeTab === 'scrap') { // ADD this condition
    fetchScrapData();
  }
else if (activeTab === 'vhkms') { // Make sure this condition exists
    fetchvhkmsData();
  }
}, [activeTab]);


  const currentData = vehicleData[activeTab] || [];

  const filteredData = useMemo(() => {
    let filtered = currentData.filter(item =>
      Object.values(item || {}).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (filterStatus !== "all") {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [currentData, searchTerm, filterStatus, sortConfig]);
const handleModifyClick = (rowItem) => {
  console.log('Modify button clicked for:', rowItem);
  
  // Validate vehicle number
  if (!rowItem.vehicleNo || rowItem.vehicleNo === '-') {
    alert('Vehicle number is not available for this record.');
    return;
  }

  try {
    // Determine the target modify page based on active tab
    let targetPage = '';
    
    switch (activeTab) {
      case 'insurance':
        targetPage = '/ModifyInsurancePage';
        break;
      case 'maintenance':
        targetPage = '/ModifyMaintenancePage';
        break;
      case 'roadTax':
        targetPage = '/ModifyRoadTaxPage';
        break;
      case 'fastTag':
        targetPage = '/ModifyFastTagPage';
        break;
  //       case 'scrap':
  // targetPage = '/ModifyScrapPage';
  break;

      default:
        targetPage = '/ModifyInsurancePage';
    }
    
    console.log(`Navigating to ${targetPage} for ${activeTab} tab`);
    
    // Navigate to the appropriate modify page
    navigate(targetPage, { 
      state: { 
        vehicleNumber: rowItem.vehicleNo,
        vehicleData: rowItem,
        tabType: activeTab,
        modifyMode: true
      } 
    });
  } catch (error) {
    console.error('Navigation error:', error);
    alert('Error navigating to modify page. Please try again.');
  }
};
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    setCurrentPage(1);
    setSearchTerm("");
    setFilterStatus("all");
    setSortConfig({ key: null, direction: 'asc' });
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderTableCell = (value, isActionColumn = false, columnName = '', rowItem = {}) => {
  console.log('renderTableCell called:', { value, isActionColumn, columnName, rowItem });
  
  // Handle action columns - Edit, Modify, and View Files
  if (isActionColumn || value === 'Edit' || value === 'Modify' || value === 'View Files') {
    if (value === 'Edit') {
      return isAuthorizedForEdit ? (
        <button 
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Edit button clicked', { vehicleNo: rowItem.vehicleNo, rowItem, userAuth: isAuthorizedForEdit });
            handleEditClick(rowItem);
          }}
          title="Edit this record"
        >
          Edit
        </button>
      ) : (
        <span className="px-3 py-1 bg-gray-300 text-gray-500 rounded text-xs cursor-not-allowed" title="Not authorized">
          Edit
        </span>
      );
    }
    else if (value === 'Modify') {
      return isAuthorizedForModify ? (
        <button 
          className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs transition-colors duration-200"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Modify button clicked', { vehicleNo: rowItem.vehicleNo, rowItem });
            handleModifyClick(rowItem);
          }}
          title="Modify this record"
        >
          Modify
        </button>
      ) : (
        <span className="px-3 py-1 bg-gray-300 text-gray-500 rounded text-xs cursor-not-allowed">
          Modify
        </span>
      );
    } 
    else if (value === 'View Files') {
      return (
        <button
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs transition-colors duration-200 flex items-center space-x-1"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('View Files button clicked', { vehicleNo: rowItem.vehicleNo, rowItem, activeTab });
            handleViewAllFiles(rowItem.vehicleNo, rowItem);
          }}
          title={`View all ${activeTab} files for this vehicle`}
        >
          <span>View Files</span>
        </button>
      );
    }
  }

  // Show "View" button for INSURANCE COPY
  if (columnName === 'insuranceCopy' && value && value !== '-') {
    return (
      <button
        onClick={() => handleFileView(rowItem.insuranceCopy)}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200"
      >
        View
      </button>
    );
  }
  
  // Show "View" button for RC UPLOAD
  if (columnName === 'rcUpload' && value && value !== '-') {
    return (
      <button
        onClick={() => handleRcFileView(rowItem.rcUpload)}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200"
      >
        View
      </button>
    );
  }

  // Show "View" button for VEHICLE DOC
  if (columnName === 'vhDocUpload' && value && value !== '-') {
    return (
      <button
        onClick={() => handleVhdocFileView(rowItem.vhDocUpload)}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200"
      >
        View
      </button>
    );
  }
  
  // Show "View" button for MAINTENANCE FILE
  if (columnName === 'maintFile' && value && value !== '-') {
    return (
      <button
        onClick={() => handleMaintenanceFileView(rowItem.maintFile)}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200"
      >
        View
      </button>
    );
  }
  
  // Show "View" button for CHALLAN FILE
  if (columnName === 'challanFile' && value && value !== '-' && value !== null) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Challan file button clicked for:', rowItem.challanFile);
          handleChallanFileView(rowItem.challanFile);
        }}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200"
      >
        View
      </button>
    );
  }
  
  // Show "View" button for FAST TAG FILE
  if (columnName === 'fastTagFile' && value && value !== '-' && value !== null) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Fast tag file button clicked for:', rowItem.fastTagFile);
          handleFastTagFileView(rowItem.fastTagFile);
        }}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200"
      >
        View
      </button>
    );
  }

  // Show link if it's a known file format (fallback)
  if (typeof value === 'string' && (value.endsWith('.pdf') || value.endsWith('.jpg') || value.endsWith('.png'))) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
        View File
      </a>
    );
  }

  return <span className="text-gray-900 text-xs">{value || '-'}</span>;
};
// Function to handle road tax file viewing
const handleRoadTaxFileView = async (vehicleNo) => {
  try {
    const response = await fetch(`${API_BASE_URL}getTaxFile/${encodeURIComponent(vehicleNo)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken.token}`,
        'Accept': 'application/pdf,image/*,*/*'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        alert('Authentication failed. Please login again.');
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
    
  } catch (error) {
    console.error('Error viewing road tax file:', error);
    alert('Error viewing road tax file. Please try again.');
  }
};
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-2 mx-1 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === i
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Previous
        </button>
        {startPage > 1 && (
          <>
            <button onClick={() => setCurrentPage(1)} className="px-3 py-2 mx-1 rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50">1</button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button onClick={() => setCurrentPage(totalPages)} className="px-3 py-2 mx-1 rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50">{totalPages}</button>
          </>
        )}
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Next
        </button>
      </div>
    );
  };

  const currentTab = tabConfig[activeTab];

  return (
    <div className="py-3 px-3">
      <div className="max-w-9xl mx-auto">
        <div className="bg-white rounded-lg shadow border-2 border-blue-500 overflow-hidden">
          {/* Header */}
          <div className="p-2">
            <div className="flex justify-between items-center">
              <div className="flex justify-between items-center">
                <img src="./img.png" alt="Logo" className="mr-4 w-40 h-12 rounded-lg" />
                <div className="flex-grow flex justify-center"></div>
              </div>
              <div className="flex-grow flex justify-center">
                <div className="bg-[#5ea8bb] px-5 py-1.5 rounded-lg inline-block -ml-20">
                  <h1 className="text-xl font-bold text-white">Four Wheeler Change Tab</h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.history.back()}
                  className="text-white bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed] hover:from-[#c71d6f] hover:to-[#d09693] rounded-full p-1"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="h-0.5 bg-blue-600 w-[95%] mx-auto"></div>

          {/* Tabs */}
          <div className="grid grid-cols-6 text-center text-sm font-semibold">
            {Object.entries(tabConfig).map(([key, tab]) => {
              const isActive = activeTab === key;
              return (
                <div
                  key={key}
                  onClick={() => handleTabClick(key)}
                  className={`
                    py-3 cursor-pointer transition-all duration-300 flex items-center justify-center space-x-2 border-b-4
                    ${isActive
                      ? `${tab.colors.active} shadow-lg`
                      : `${tab.colors.default} hover:shadow-md`}
                  `}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    isActive ? tab.colors.badge.active : tab.colors.badge.default
                  }`}>
                    {vehicleData[key]?.length || 0}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Content */}
          <div className={`p-6 bg-gradient-to-r ${currentTab.bgGradient}`}>
            {/* Search & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={`Search ${currentTab.title.toLowerCase()} records...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 text-sm border border-blue-500 rounded-full focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

               {/* Fast Tag Total Amount Button - Only show in Fast Tag tab */}
  {activeTab === 'fastTag' && (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setShowFastTagModal(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
      >
        <DollarSign className="w-4 h-4" />
        <span>Fast Tag Total Amt</span>
      </button>
    </div>
  )}
</div>
          {/* Fast Tag Total Amount Modal */}
{showFastTagModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Fast Tag Total Amount</h3>
        <button
          onClick={() => {
            setShowFastTagModal(false);
            setFastTagTotalAmount("");
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mb-4">
        <label htmlFor="fastTagTotal" className="block text-sm font-medium text-gray-700 mb-2">
          Fast Tag Total Amount:
        </label>
        <input
          id="fastTagTotal"
          type="number"
          step="0.01"
          value={fastTagTotalAmount}
          onChange={(e) => setFastTagTotalAmount(e.target.value)}
          placeholder="Enter total amount"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={() => {
            setShowFastTagModal(false);
            setFastTagTotalAmount("");
          }}
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleFastTagTotalSubmit}
          disabled={submittingAmount || !fastTagTotalAmount}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
        >
          {submittingAmount ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </button>
      </div>
    </div>
  </div>
)}

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto border-2 border-gray-500 rounded-lg bg-white shadow-md">
              <table className="min-w-full border-2 border-gray-300 text-sm text-left">
                <thead className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs font-semibold uppercase tracking-wide border-b-2 border-gray-500">
                  <tr>
                    {currentTab.headers.map((header, i) => (
                      <th
                        key={i}
                        onClick={() => handleSort(header.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                        className={`px-2 py-2 text-left text-xs font-medium text-${currentTab.accent.split('-')[0]}-700 border-r last:border-r-0 cursor-pointer hover:bg-gray-200 transition-colors duration-200`}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{header}</span>
                          {sortConfig.key === header.toLowerCase().replace(/[^a-z0-9]/g, '') && (
                            <span className={`text-${currentTab.accent}`}>
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
               
<tbody>
  {loading ? (
    <tr className={`hover:bg-gray-100 border-2 border-gray-500`}>
      <td colSpan={currentTab.headers.length} className="px-3 py-2 border-2 border-gray-500 text-xs text-gray-700 whitespace-nowrap bg-white">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-500">Loading data...</p>
        </div>
      </td>
    </tr>
  ) : paginatedData.length > 0 ? (
    paginatedData.map((item, rowIndex) => (
      <tr 
        key={rowIndex} 
        className={`hover:bg-gray-50 transition-colors duration-200 ${
          rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
        }`}
      >
        {Object.entries(item).map(([columnName, value], colIndex) => {
          // Determine if this is an action column (Edit, Modify, View Files)
          const isActionColumn = ['edit', 'modify', 'allFiles'].includes(columnName) || 
                                 ['Edit', 'Modify', 'View Files'].includes(value);
          
          return (
            <td key={colIndex} className="px-3 py-2 border-t border-gray-200 text-xs text-gray-700 whitespace-nowrap">
              {renderTableCell(value, isActionColumn, columnName, item)}
            </td>
          );
        })}
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={currentTab.headers.length} className="text-center py-12">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-gray-500 font-medium">
              {searchTerm ? 'No matching records found' : `No ${currentTab.title.toLowerCase()} records available.`}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm ? 'Try adjusting your search criteria' : `Add ${currentTab.title.toLowerCase()} records to get started`}
            </p>
          </div>
        </div>
      </td>
    </tr>
  )}
</tbody>
              </table>
            </div>

            {/* Pagination */}
            {renderPagination()}

            {filteredData.length > 0 && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeTab;