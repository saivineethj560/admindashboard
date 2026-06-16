



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_BASE_URLss, API_HRM_PROCESS } from '../../Config'
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
// import { jsPDF } from 'jspdf';
// import logo from "../asset/imagesmy.png";




const SalaryStackup = ({ data, salary, remarks, setRemarks, TableHeader, DataRow, note, personalData }) => (
  <div className="p-3 space-y-3">
    {/* Employee Info Box */}
    <div className="grid grid-cols-2 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      {[
        { label: 'NAME', value: data?.name },
           { label: 'JOB TITLE', value: data?.DESIG ||  data?.MANPOWER_DESG || 'N/A' },
        { label: 'LOCATION', value: data?.PLANT || 'N/A' },
        { label: 'FIXED COST TO COMPANY', value: `₹ ${salary.totalCTC.a.toLocaleString('en-IN')}`, valueClass: 'text-emerald-700 font-bold' },
        { label: 'VARIABLE PAY', value: '-', valueClass: 'text-gray-400' },
        { label: 'TOTAL COST TO COMPANY', value: `₹ ${salary.totalCTC.a.toLocaleString('en-IN')}`, valueClass: 'text-blue-700 font-bold', rowClass: 'bg-blue-50' },
      ].map(({ label, value, valueClass = 'text-gray-900', rowClass = '' }, i, arr) => (
        <React.Fragment key={label}>
          <div className={`px-3 py-1.5 border-r ${i < arr.length - 1 ? 'border-b' : ''} border-gray-300 font-semibold bg-gray-50 text-[10px] uppercase tracking-wider text-gray-600`}>
            {label}
          </div>
          <div className={`px-3 py-1.5 ${i < arr.length - 1 ? 'border-b' : ''} border-gray-300 text-xs ${valueClass} ${rowClass}`}>
            {value}
          </div>
        </React.Fragment>
      ))}
    </div>

    {/* Salary Table */}
    <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <TableHeader title="I. COMPENSATION COMPONENTS" colorClass="bg-gradient-to-r from-gray-800 to-gray-700" />
        </thead>
        <tbody>
          <DataRow label="Basic Salary" monthly={salary.basic.m} annual={salary.basic.a} />
          <DataRow label="HRA" monthly={salary.hra.m} annual={salary.hra.a} />
          <DataRow label="Conveyance" monthly={salary.conveyance.m} annual={salary.conveyance.a} isFixed={true} />
          <DataRow label="Education Allowance" monthly={salary.education.m} annual={salary.education.a} isFixed={true} />
          <DataRow label="Special Allowance" monthly={salary.special.m} annual={salary.special.a} />
          <DataRow label="GROSS SALARY" monthly={salary.gross.m} annual={salary.gross.a} isBold={true} isTotal={true} bgColor="bg-emerald-50" />

          <TableHeader title="II. OTHER BENEFITS" colorClass="bg-gradient-to-r from-gray-700 to-gray-600" />
          <DataRow label="Bonus" monthly={salary.bonus.m} annual={salary.bonus.a} />
          <DataRow label="Employer PF Contribution" monthly={salary.employerPF.m} annual={salary.employerPF.a} />
          <DataRow label="Employer ESI Contribution" monthly={0} annual={0} isDisabled={true} />

          <TableHeader title="III. DEDUCTIONS" colorClass="bg-gradient-to-r from-gray-700 to-gray-600" />
          <DataRow label="Employee PF Contribution" monthly={salary.employeePF.m} annual={salary.employeePF.a} />
          <DataRow label="Employee ESI Contribution" monthly={0} annual={0} isDisabled={true} />
          <DataRow label="Professional Tax" monthly={salary.pt.m} annual={salary.pt.a} />
          <DataRow label="TOTAL DEDUCTIONS" monthly={salary.totalDeductions.m} annual={salary.totalDeductions.a} isBold={true} isTotal={true} bgColor="bg-red-50" />

          <DataRow label="NET SALARY (Gross - Deductions)" monthly={salary.netSalary.m} annual={salary.netSalary.a} isBold={true} isHighlight={true} />
          <DataRow label="FIXED COST TO COMPANY" monthly={salary.totalCTC.m} annual={salary.totalCTC.a} isBold={true} isTotal={true} bgColor="bg-blue-50" />
        </tbody>
      </table>

      {/* Terms & Conditions */}
      <div className="px-3 py-2 bg-white border-t border-gray-300 space-y-1">
        <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Terms & Conditions</h4>
        {[
          "You are entitled for GPA. For GTI & GMC 50% of the premium to be borne by the employee as per the policy.",
          "Subsidized lunch will be provided at workplace.",
          "Gratuity is applicable as per provisions of The Gratuity Act 1972.",
          "Your net salary is subject to TDS deduction.",
          "Statutory deductions as applicable.",
          "Management has right to change/modify/alter the CTC structure."
        ].map((point, idx) => (
          <div key={idx} className="flex items-start gap-1.5 text-[10px] text-gray-500 leading-snug">
            <span className="text-gray-400 mt-0.5">•</span>
            <p className="flex-1">{point}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HRMActionView = ({ caseId }) => {
    
  const [activeTab, setActiveTab] = useState('personal');
  const [noteAprvlData, setNoteAprvlData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);


  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [userToken, setUserToken] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo")) || {};
  });
 const navigate = useNavigate();
  // Calculate detailed breakdown
  const calculateDetailedBreakdown = (ctc) => {
    const annualCTC = parseFloat(ctc) || 0;
    const monthlyCTC = annualCTC / 12;

    const annualBasic = Math.round(annualCTC * 0.50);
    const monthlyBasic = Math.round(annualBasic / 12);

    const annualHRA = Math.round(annualBasic * 0.40);
    const monthlyHRA = Math.round(annualHRA / 12);

    const monthlyConveyance = 1600;
    const monthlyEducation = 200;

    const monthlyEmployeePF = Math.min(Math.round(monthlyBasic * 0.12), 1800);
    const monthlyEmployerPF = monthlyEmployeePF;
    const monthlyPT = 200;
    const monthlyBonus = Math.round(monthlyBasic * 0.0833);

    const currentSum = monthlyBasic + monthlyHRA + monthlyConveyance + monthlyEducation + monthlyEmployerPF + monthlyBonus;
    const monthlySpecial = Math.max(0, Math.round(monthlyCTC - currentSum));

    const monthlyGross = monthlyBasic + monthlyHRA + monthlyConveyance + monthlyEducation + monthlySpecial;
    const monthlyDeductions = monthlyEmployeePF + monthlyPT;

    return {
      basic: { m: monthlyBasic, a: monthlyBasic * 12 },
      hra: { m: monthlyHRA, a: monthlyHRA * 12 },
      conveyance: { m: monthlyConveyance, a: monthlyConveyance * 12 },
      education: { m: monthlyEducation, a: monthlyEducation * 12 },
      special: { m: monthlySpecial, a: monthlySpecial * 12 },
      gross: { m: monthlyGross, a: monthlyGross * 12 },
      bonus: { m: monthlyBonus, a: monthlyBonus * 12 },
      employerPF: { m: monthlyEmployerPF, a: monthlyEmployerPF * 12 },
      employeePF: { m: monthlyEmployeePF, a: monthlyEmployeePF * 12 },
      pt: { m: monthlyPT, a: monthlyPT * 12 },
      totalDeductions: { m: monthlyDeductions, a: monthlyDeductions * 12 },
      netSalary: { m: monthlyGross - monthlyDeductions, a: (monthlyGross - monthlyDeductions) * 12 },
      totalCTC: { m: monthlyCTC, a: annualCTC }
    };
  };

  const [salary, setSalary] = useState(calculateDetailedBreakdown(0));




  // Fetch note approval data
  const noteFrAprvlData = async () => {
    try {
      setLoading(true);
    

      const response = await fetch(
        `${API_HRM_PROCESS}/noteForAprvlGetMRFData/${caseId}`
      );



      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API DATA:", result);

      if (result.success && result.VerifyData && result.VerifyData.length > 0) {
  
        setNoteAprvlData(result.VerifyData);
        setSelectedData(result.VerifyData[0]);
        const amount = parseFloat(result.VerifyData[0].offer_ctc) || 0;
        setSalary(calculateDetailedBreakdown(amount));
      } else {
        console.log("No data found");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch approval data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken?.token) {
      noteFrAprvlData();
    } else {
      setLoading(false);
    }
  }, [userToken]);

  const TableHeader = ({ title, colorClass }) => (
    <tr className={`${colorClass} text-white`}>
      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">{title}</th>
      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">MONTHLY (₹)</th>
      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">ANNUAL (₹)</th>
    </tr>
  );

  const DataRow = ({ label, monthly, annual, isBold = false, isTotal = false, isFixed = false, isDisabled = false, isHighlight = false, bgColor = '' }) => {
    let rowBgColor = bgColor;
    if (isTotal) rowBgColor = 'bg-gray-50';
    if (isHighlight) rowBgColor = 'bg-blue-50';
    
    return (
      <tr className={`border-b border-gray-200 ${rowBgColor} hover:bg-gray-50 transition-colors`}>
        <td className="px-4 py-2.5 text-xs">
          <span className={`${isBold ? 'font-bold' : 'font-medium'} ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {label}
            {isFixed && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Fixed</span>}
          </span>
        </td>
        <td className={`px-4 py-2.5 text-center text-xs ${isBold ? 'font-bold' : ''} ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {isDisabled ? '-' : `₹ ${Math.round(monthly || 0).toLocaleString('en-IN')}`}
        </td>
        <td className={`px-4 py-2.5 text-center text-xs ${isBold ? 'font-bold' : ''} ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {isDisabled ? '-' : `₹ ${Math.round(annual || 0).toLocaleString('en-IN')}`}
        </td>
      </tr>
    );
  };

 

 

  const PersonalDetails = () => {
    const matchedPersonal = selectedData;
    const presentExperience = null;

    const handleFileOpen = (filePath) => {
      if (!filePath) {
        Swal.fire({
          icon: 'warning',
          title: 'No File',
          text: 'No file available',
        });
        return;
      }

      const fileUrl = filePath.startsWith('http') 
        ? filePath 
        : `${API_BASE_URLss}${filePath}`;
      
      window.open(fileUrl, '_blank');
    };

    const getFileName = (path) => {
      if (!path) return "No File";
      const file = path.split("/").pop();
      const cleanName = file.replace(/^verification_\d+_/, "");
      return cleanName.length > 20 ? cleanName.substring(0, 20) + "..." : cleanName;
    };

    const currentCTC = parseFloat(selectedData?.current_ctc || 0);
    const offerCTCVal = parseFloat(selectedData?.offer_ctc || 0);
    const hikePercentage = currentCTC > 0 ? (((offerCTCVal - currentCTC) / currentCTC) * 100).toFixed(2) : 0;

    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {/* PRESENT DETAILS */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 pb-1.5 border-b-2 border-blue-200 flex items-center gap-2">
              <span className="bg-blue-600  text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">👤</span>
              PRESENT DETAILS
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 shadow-sm">
              <DetailRow label="Name" value={selectedData?.name || 'N/A'} />
              <DetailRow label="Current CTC" value={`₹ ${currentCTC.toLocaleString('en-IN')}`} valueColor="text-emerald-700 font-bold" />
             <DetailRow label="Present Company" value={selectedData?.experienceData?.[0]?.COMPANY_NAME || 'N/A'}  />
              <DetailRow label="Total Experience" value={`${selectedData?.TOTAL_EXP || 'N/A'} years`} />
              <DetailRow label="DEPT" value={selectedData?.DEPT || 'N/A'} />
              <DetailRow label="Highest Qualification" value={selectedData?.HIGHEST_QUA || 'N/A'} />


            </div>
          </div>

          {/* PROPOSED DETAILS */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 pb-1.5 border-b-2 border-emerald-200 flex items-center gap-2">
              <span className="bg-emerald-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">📋</span>
              PROPOSED DETAILS
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 shadow-sm">
              <DetailRow label="Source Type" value={selectedData?.SRC_TYPE || 'N/A'} />
              <DetailRow label="Offered CTC" value={`₹ ${offerCTCVal.toLocaleString('en-IN')}`} valueColor="text-blue-700 font-bold" />
              <DetailRow
                label="Hike Percentage"
                value={`${hikePercentage}%`}
                valueColor={parseFloat(hikePercentage) > 0 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}
              />
                             <DetailRow
  label="Joining Duration"
  value={
    selectedData?.experienceData?.[0]?.noticePeriod
      ? `${selectedData.experienceData[0].noticePeriod} Days`
      : 'N/A'
  }
/>
              <DetailRow label="Offered Designation" value= {selectedData?.DESIG ||  selectedData?.MANPOWER_DESG} />

              {/* HR Evaluation File */}
              <div className="flex justify-between items-center px-3 py-2 hover:bg-gray-50 transition-colors">
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">HR Evaluation File</span>
                {selectedData?.cand_aprvl_file ? (
                  <button
                    onClick={() => handleFileOpen(selectedData?.cand_aprvl_file)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    <span>📄</span>
                    {getFileName(selectedData?.cand_aprvl_file)}
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-gray-400">No File</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DetailRow = ({ label, value, valueColor = "text-gray-900" }) => (
    <div className="flex justify-between items-center px-3 py-2 hover:bg-gray-50 transition-colors">
      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      <span className={`text-xs font-semibold ${valueColor}`}>{value}</span>
    </div>
  );

  const getCurrentApprovalStep = () => {
    if (selectedData?.hr !== 'Approved') return 'hr';
    if (selectedData?.director !== 'Approved') return 'director';
    if (selectedData?.evc !== 'Approved') return 'evc';
    return null;
  };

  const currentStep = getCurrentApprovalStep();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!selectedData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">No approval data available</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl mx-auto shadow-2xl overflow-hidden flex flex-col" style={{ height: '650px' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-5 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* <img src={logo} alt="Logo" className="w-14 h-14 rounded-full border-2 border-white shadow-md" /> */}
            <div>
              <h1 className="text-xl font-bold text-white">MY HOME GROUP</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-medium text-blue-200">HRM Approvals</span>
                <span className="text-xs text-blue-300">•</span>
                <span className="text-xs font-medium text-blue-200">
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <span className="bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium text-white border border-blue-500">
                CASEID: {selectedData?.child_caseid  || 'N/A'}
              </span>
              <span className="bg-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium text-white border border-emerald-500">
                {selectedData?.PLANT || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50 flex-shrink-0">
          <TabButton
            active={activeTab === 'personal'}
            onClick={() => setActiveTab('personal')}
            icon="👤"
            label="Personal Details"
          />
          <TabButton
            active={activeTab === 'salary'}
            onClick={() => setActiveTab('salary')}
            icon="💰"
            label="Salary Stackup"
          />
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto custom-scrollbar" style={{ height: activeTab === 'personal' ? '400px' : '460px' }}>
          {activeTab === 'personal' && <PersonalDetails />}
          {activeTab === 'salary' && (
            <SalaryStackup
              data={selectedData}
              salary={salary}
              remarks={remarks}
              setRemarks={setRemarks}
              TableHeader={TableHeader}
              DataRow={DataRow}
              token={userToken}
            />
          )}
        </div>

        {/* Status Cards + Remarks */}
        <div className="flex bg-gray-50" style={{ minHeight: '80px' }}>
          <div className="flex flex-col justify-center px-4 py-3" style={{ width: '60%' }}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Approval Status</p>
            <div className="flex gap-2">
              {[
                { key: 'hr', title: 'HOD', border: 'border-blue-200', bg: 'bg-blue-50' },
                { key: 'director', title: 'DIRECTOR', border: 'border-purple-200', bg: 'bg-purple-50' },
                { key: 'evc', title: 'EVC', border: 'border-orange-200', bg: 'bg-orange-50' },
              ].map(({ key, title, border, bg }) => {
                let statusType = '';
                if (selectedData?.[key] === 'Approved') {
                  statusType = 'approved';
                } else if (currentStep === key) {
                  statusType = 'wip';
                } else {
                  statusType = 'pending';
                }

                return (
                  <div key={key} className={`flex-1 border ${border} ${bg} rounded-lg px-3 py-2 flex items-center gap-2`}>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-base">👤</span>
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">{title}</p>
                    </div>
                    <div className="w-px self-stretch bg-gray-300 mx-1" />
                    <span
                      className={`flex-1 text-center px-1.5 py-1.5 rounded-full text-[9px] font-semibold border ${
                        statusType === 'approved'
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : statusType === 'wip'
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                      }`}
                    >
                      {statusType === 'approved'
                        ? '✓ Approved'
                        : statusType === 'wip'
                        ? '⚡ WIP'
                        : '⏳ Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Action Buttons */}
       
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    style={active ? { backgroundColor: '#BBDCE5' } : {}}
    className={`flex-1 px-6 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
      active
        ? 'text-blue-900 border-b-2 border-blue-400'
        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
    }`}
  >
    <span>{icon}</span>
    {label}
  </button>
);

const ActionButton = ({ onClick, children, variant = 'primary', icon, disabled }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
        variants[variant]
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default HRMActionView;


