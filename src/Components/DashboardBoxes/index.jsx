// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { IoCalendarOutline, IoClose } from "react-icons/io5";
// import { GiPencilRuler, GiSteelClaws } from "react-icons/gi";
// import { RiPassValidLine } from "react-icons/ri";
// import { FaFileInvoiceDollar } from "react-icons/fa";
// import { MdBuild } from "react-icons/md";
// import CustomCalendar from './CustomCalendar';
// import holidayImages from './holidayImages';
// //-------------------------------------------//
// import { FaCarSide } from "react-icons/fa";
// import { IMAGE_PATH } from "../../Config";
// import { INDENT_URL } from "../../Config"

// // Chart.js imports
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import { Bar } from 'react-chartjs-2';

// // Register Chart.js components
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
// const getRandomData = () => labels.map(() => Math.floor(Math.random() * 100));

// const DashboardBoxes = () => {
  // ✅ Hooks must be INSIDE the component function
  // const [openVideo, setOpenVideo] = useState(false);
//   const [showNotification, setShowNotification] = useState(true);
//   const [useToken, setToken] = useState(() => {
//     return JSON.parse(localStorage.getItem('userInfo')) ? JSON.parse(localStorage.getItem('userInfo')) : {}
//   })
//   console.log(useToken);
//   const chartData = {
//     labels,
//     datasets: [
//       {
//         label: 'Random Dataset',
//         data: getRandomData(),
//         backgroundColor: 'rgba(54, 162, 235, 0.6)',
//         borderColor: 'rgba(54, 162, 235, 1)',
//         borderWidth: 1,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//     },
//   };

// // Define gradient classes
// const pinkGradient = "bg-gradient-to-r from-[#c71d6f] to-[#d09693]";
// const blueGradient = "bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed]";

// // Counter for visible tiles to determine color
// let visibleTileIndex = 0;

//   //-------------------------------------------------------------------------------------start---------------------------------
//   // this function is added by rajakumari.m on 18-12-2025 for HO VH
//   // Create a variable to check whether user can access the project
//   // const hasProjectAccess =

//   //   // col name with user tokmen
//   //   useToken?.Is_HO_VEH_USR

//   //     // Convert the string into an array by splitting with comma
//   //     // Example:
//   //     // "1,VH"  → ["1", "VH"]
//   //     // "1"     → ["1"]
//   //     ?.split(',')

//   //     // Remove extra spaces from each value
//   //     // " VH" → "VH"
//   //     .map(v => v.trim())

//   //    // Check if array contains "1"
//   //     .includes('1');

//   //------------------------------------------ebd-------------------------------------------------------------------------------------

//   return (
//     <div className="relative min-h-screen px-6 pt-2 pb-6">
//       <div className="grid grid-cols-12 gap-4 bg-blue">

//         {/* Left Section - Tiles */}
//         <div className="col-span-12 lg:col-span-7">
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

//             <>
//               {/* Stationery */}
//               {/* {(useToken.Is_Employee == 0) && ( */}
//               {(useToken.Is_Employee == 1 || useToken.Is_Employee == 0 || useToken.Is_Employee == 2 || useToken.Is_Employee == 3) && (
//                 <Link to="/StationaryForm">
//                   <div className="box h-full p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-r from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
//                     <GiPencilRuler className="text-[40px] text-white" />
//                     <div className="info w-[70%]">
//                       <h3>Stationery</h3>
//                     </div>
//                   </div>
//                 </Link>
//               )}
//               {/* ----------------updated on 18-12-2025 by rajakumari.m ---------------------------------------------------- */}
//               {/* Travel grid Form */}
//               {(useToken.Is_HO_VEH_USR == 1 || useToken.Is_HO_VEH_USR == 2) && (
//                 <Link to="/NavBar">
//                    <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                     <FaCarSide className="text-[40px] text-white" />
//                     <div className="info w-[70%]">
//                       <h3>HO Vehicle Tracker</h3>
//                     </div>
//                   </div>
//                 </Link>
//               )}
//               {/* -------------------------------------------------------end------------------------------------ */}

//               {/* Meeting Room Blocking */}
//               {useToken.Is_Meeting == 1 && (
//                 <Link to="/MeetingDashboard">
//                    <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                     <IoCalendarOutline className="text-[40px] text-white" />
//                     <div className="info w-[70%]">
//                       <h3>Meeting Room Blocking</h3>
//                     </div>
//                   </div>
//                 </Link>
//               )}

//               {/* Indent Users  */}
//               {(useToken.IND_USERS == 1 || useToken.IND_USERS == 2) && (
//                 <Link to={`${INDENT_URL}`} target="_blank">
//                    <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                     <IoCalendarOutline className="text-[40px] text-white" />
//                     <div className="info w-[70%]">
//                       <h3>Indent Request</h3>
//                     </div>
//                   </div>
//                 </Link>
//               )}

//               {/* MM Asset Creation   */}
//               {useToken.MM_ASSET == 1 && (
//                 <Link to="/mmassetcreation">
//                   <div className="box p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-br from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
//                     <IoCalendarOutline className="text-[40px] text-white" />
//                     <div className="info w-[70%]">
//                       <h3>Asset Creation</h3>
//                     </div>
//                   </div>
//                 </Link>
//               )}

//                {/* Scrap Sale  */}
//               {useToken.SCRAP == 1 && (
//                 <Link to="/scrapsale">
//                    <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                     <IoCalendarOutline className="text-[40px] text-white" />
//                     <div className="info w-[70%]">
//                       <h3>Scrap Sale</h3>
//                     </div>
//                   </div>
//                 </Link>
//               )}

//               {/* Material Master Request   */}
//               {useToken.MM_CODE == 1 && (
//                 <Link to="/matmastercreation">
//                   <div className="box p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-br from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
//                     <IoCalendarOutline className="text-[40px] text-white" />
//                     <div className="info w-[70%]">
//                       <h3>Material Master Creation</h3>
//                     </div>
//                   </div>
//                 </Link>
//               )}
              
//               {/* Service Code Request   */}
//               {useToken.SER_CODE == 1 && (
//                 <Link to="/servicecoderequest">
//                   <div className="box p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-br from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
//                     <IoCalendarOutline className="text-[40px] text-white" />
//                     <div className="info w-[70%]">
//                       <h3>Service Code Creation</h3>
//                     </div>
//                   </div>
//                 </Link>
//               )}
//             {/* Stock Transfer Request   */}
//               {useToken.STOCK == 1 && (
//                 <Link to="/stockrequest">
//                    <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                     <IoCalendarOutline className="text-[40px] text-white" />
//                     <div className="info w-[70%]">
//                       <h3>Stock Transfer</h3>
//                     </div>
//                   </div>
//                 </Link>
//               )}
//               {/* Manpower Request   */}
//               {(useToken.MRF == 1 || useToken.MRF == 2) && (
//                 <Link to="/manpower">
//                    <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                     <IoCalendarOutline className="text-[40px] text-white" />
//                     <div className="info w-[70%]">
//                       <h3>ManPower Request</h3>
//                     </div>
//                   </div>
//                 </Link>
//               )}

//               {/* ManPower Upload Form */}
//                 <Link to="/ManpowerUploadForm">
//                    <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                     <FaFileInvoiceDollar className="text-[30px] text-white" />
//                     <div className="info w-[70%]">
//                       <h3>ManPower Upload Form</h3>
//                     </div>
//                   </div>
//                 </Link>
                

//               {/* Gate Pass */}
//               {/*  <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                   <RiPassValidLine className="text-[40px] text-white" />
//                   <div className="info w-[70%]">
//                     <h3>Gate pass</h3>
//                   </div>
//                 </div> */}

//               {/* Register Bill Tracker */}
//               {/* <div className="box p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-r from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
//                   <FaFileInvoiceDollar className="text-[30px] text-white" />
//                   <div className="info w-[70%]">
//                     <h3>Register Bill Tracker</h3>
//                   </div>
//                 </div> */}

//               {/* Steel Indents */}
//               {/*  <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                   <img
//                     src={`${IMAGE_PATH}/steel.png`}
//                     alt="Steel Indents"
//                     className="w-[40px] h-[40px] object-contain filter brightness-0 invert"
//                   />
//                   <div className="info w-[70%]">
//                     <h3>Steel Indents</h3>
//                   </div>
//                 </div> */}

//               {/* Material/Service Indents */}
//               {/* <div className="box p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-r from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
//                   <MdBuild className="text-[30px] text-white" />
//                   <div className="info w-[70%]">
//                     <h3>Material/Service Indents</h3>
//                   </div>
//                 </div> */}

//               {/* ManPower Upload Form */}
             


//               {/* ManPower Upload Form */}
             

//               {/* Stationery Upload */}
//               {useToken.Is_Employee == 0 && (
//                 <Link to="/StatUploadForm">
//                   <div className="box h-full p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-r from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
//                     <GiPencilRuler className="text-[40px] text-white" />
//                     <div className="info w-[70%]">
//                       <h3>Stationery Upload</h3>
//                     </div>
//                   </div>
//                 </Link>
//               )}

//               {/* Plant & Machinery */}
//               <Link to="/Mainpage">
//                  <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                   <FaCarSide className="text-[40px] text-white" />
//                   <div className="info w-[70%]">
//                     <h3>Plant & Machinery</h3>
//                   </div>
//                 </div>
//               </Link>
//             </>



//           </div>
//         </div>

//         {/* Right Section - Chart & Calendar */}
//         <div className="flex flex-col col-span-12 gap-4 lg:col-span-5">
//           {/* <div className="bg-white rounded-xl p-6 shadow-[0_12px_32px_rgba(0,0,0,0.2)] ring-1 ring-blue-100 border border-blue-300 h-[300px] overflow-hidden">
//             <h2 className="mb-2 text-lg font-semibold">Chart</h2>
//             <div className="h-[240px]">
//               <Bar data={chartData} options={chartOptions} />
//             </div>
//           </div> */}

//           {/* Replace the old Calendar with CustomCalendar */}
//           <CustomCalendar />
//         </div>
//       </div>

//       {/* ✅ Notification Popup */}
//       {/* {showNotification && (
//         <div
//           className="absolute flex items-start justify-between p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-72"
//           style={{
//             top: '20px',
//             right: '30px',
//             animation: 'slideIn 0.3s ease-out',
//           }}
//         >
//           <style>{`
//             @keyframes slideIn {
//               0% {
//                 opacity: 0;
//                 transform: translateX(100%);
//               }
//               100% {
//                 opacity: 1;
//                 transform: translateX(0);
//               }
//             }
//           `}</style>
//           <div>
//             <h4 className="mb-1 font-semibold text-gray-800">Reminder</h4>
//             <p className="text-sm text-gray-600">Don't forget to submit your report by 5 PM today!</p>
//           </div>
//           <button
//             onClick={() => setShowNotification(false)}
//             className="ml-2 text-gray-400 hover:text-gray-600"
//           >
//             <IoClose size={20} />
//           </button>
//         </div>
//       )} */}
//     </div>
//   );
// };

// export default DashboardBoxes;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoCalendarOutline, IoClose } from "react-icons/io5";
import { GiPencilRuler, GiSteelClaws } from "react-icons/gi";
import { RiPassValidLine } from "react-icons/ri";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { MdBuild } from "react-icons/md";
import CustomCalendar from './CustomCalendar';
import holidayImages from './holidayImages';
//-------------------------------------------//
import { FaCarSide } from "react-icons/fa";
import { MdPlayCircleFilled } from "react-icons/md";
import { IMAGE_PATH } from "../../Config";
import { INDENT_URL } from "../../Config"

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const getRandomData = () => labels.map(() => Math.floor(Math.random() * 100));

const DashboardBoxes = () => {
const [openVideo, setOpenVideo] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [useToken, setToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo')) ? JSON.parse(localStorage.getItem('userInfo')) : {}
  })
  console.log(useToken);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Random Dataset',
        data: getRandomData(),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

// Define gradient classes
const pinkGradient = "bg-gradient-to-r from-[#c71d6f] to-[#d09693]";
const blueGradient = "bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed]";

// Counter for visible tiles to determine color
let visibleTileIndex = 0;

  //-------------------------------------------------------------------------------------start---------------------------------
  // this function is added by rajakumari.m on 18-12-2025 for HO VH
  // Create a variable to check whether user can access the project
  // const hasProjectAccess =

  //   // col name with user tokmen
  //   useToken?.Is_HO_VEH_USR

  //     // Convert the string into an array by splitting with comma
  //     // Example:
  //     // "1,VH"  → ["1", "VH"]
  //     // "1"     → ["1"]
  //     ?.split(',')

  //     // Remove extra spaces from each value
  //     // " VH" → "VH"
  //     .map(v => v.trim())

  //    // Check if array contains "1"
  //     .includes('1');

  //------------------------------------------ebd-------------------------------------------------------------------------------------

  return (
    <div className="relative min-h-screen px-6 pt-2 pb-6">
      <div className="grid grid-cols-12 gap-4 bg-blue">

        {/* Left Section - Tiles */}
        <div className="col-span-12 lg:col-span-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

            <>
              {/* Stationery */}
              {/* {(useToken.Is_Employee == 0) && ( */}
              {(useToken.Is_Employee == 1 || useToken.Is_Employee == 0 || useToken.Is_Employee == 2 || useToken.Is_Employee == 3) && (
                <Link to="/StationaryForm">
                  <div className="box h-full p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-r from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
                    <GiPencilRuler className="text-[40px] text-white" />
                    <div className="info w-[70%]">
                      <h3>Stationery</h3>
                    </div>
                  </div>
                </Link>
              )}
              {/* ----------------updated on 18-12-2025 by rajakumari.m ---------------------------------------------------- */}
              {/* Travel grid Form */}
              {(useToken.Is_HO_VEH_USR == 1 || useToken.Is_HO_VEH_USR == 2) && (
                <Link to="/NavBar">
                   <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
                    <FaCarSide className="text-[40px] text-white" />
                    <div className="info w-[70%]">
                      <h3>HO Vehicle Tracker</h3>
                    </div>
                  </div>
                </Link>
              )}
              {/* -------------------------------------------------------end------------------------------------ */}

              {/* Meeting Room Blocking */}
              {useToken.Is_Meeting == 1 && (
                <Link to="/MeetingDashboard">
                   <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
                    <IoCalendarOutline className="text-[40px] text-white" />
                    <div className="info w-[70%]">
                      <h3>Meeting Room Blocking</h3>
                    </div>
                  </div>
                </Link>
              )}

              {/* Indent Users  */}
              {(useToken.IND_USERS == 1 || useToken.IND_USERS == 2) && (
                <Link to={`${INDENT_URL}`} target="_blank">
                   <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
                    <IoCalendarOutline className="text-[40px] text-white" />
                    <div className="info w-[70%]">
                      <h3>Indent Request</h3>
                    </div>
                  </div>
                </Link>
              )}

              {/* MM Asset Creation   */}
              {useToken.MM_ASSET == 1 && (
                <Link to="/mmassetcreation">
                  <div className="box p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-br from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
                    <IoCalendarOutline className="text-[40px] text-white" />
                    <div className="info w-[70%]">
                      <h3>Asset Creation</h3>
                    </div>
                  </div>
                </Link>
              )}

               {/* Scrap Sale  */}
              {useToken.SCRAP == 1 && (
                <Link to="/scrapsale">
                   <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
                    <IoCalendarOutline className="text-[40px] text-white" />
                    <div className="info w-[70%]">
                      <h3>Scrap Sale</h3>
                    </div>
                  </div>
                </Link>
              )}

              {/* Material Master Request   */}
              {useToken.MM_CODE == 1 && (
                <Link to="/matmastercreation">
                  <div className="box p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-br from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
                    <IoCalendarOutline className="text-[40px] text-white" />
                    <div className="info w-[70%]">
                      <h3>Material Master Creation</h3>
                    </div>
                  </div>
                </Link>
              )}
              
              {/* Service Code Request   */}
              {useToken.SER_CODE == 1 && (
                <Link to="/servicecoderequest">
                  <div className="box p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-br from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
                    <IoCalendarOutline className="text-[40px] text-white" />
                    <div className="info w-[70%]">
                      <h3>Service Code Creation</h3>
                    </div>
                  </div>
                </Link>
              )}
            {/* Stock Transfer Request   */}
              {useToken.STOCK == 1 && (
                <Link to="/stockrequest">
                   <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
                    <IoCalendarOutline className="text-[40px] text-white" />
                    <div className="info w-[70%]">
                      <h3>Stock Transfer</h3>
                    </div>
                  </div>
                </Link>
              )}
              {/* Manpower Request   */}
              {(useToken.MRF == 1 || useToken.MRF == 2) && (
                <Link to="/manpower">
                   <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
                    <IoCalendarOutline className="text-[40px] text-white" />
                    <div className="info w-[70%]">
                      <h3>ManPower Request</h3>
                    </div>
                  </div>
                </Link>
              )}

              {/* ManPower Upload Form */}
                <Link to="/ManpowerUploadForm">
                   <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
                    <FaFileInvoiceDollar className="text-[30px] text-white" />
                    <div className="info w-[70%]">
                      <h3>ManPower Upload Form</h3>
                    </div>
                  </div>
                </Link>
                

              {/* Gate Pass */}
              {/*  <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
                  <RiPassValidLine className="text-[40px] text-white" />
                  <div className="info w-[70%]">
                    <h3>Gate pass</h3>
                  </div>
                </div> */}

              {/* Register Bill Tracker */}
              {/* <div className="box p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-r from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
                  <FaFileInvoiceDollar className="text-[30px] text-white" />
                  <div className="info w-[70%]">
                    <h3>Register Bill Tracker</h3>
                  </div>
                </div> */}

              {/* Steel Indents */}
              {/*  <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
                  <img
                    src={`${IMAGE_PATH}/steel.png`}
                    alt="Steel Indents"
                    className="w-[40px] h-[40px] object-contain filter brightness-0 invert"
                  />
                  <div className="info w-[70%]">
                    <h3>Steel Indents</h3>
                  </div>
                </div> */}

              {/* Material/Service Indents */}
              {/* <div className="box p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-r from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
                  <MdBuild className="text-[30px] text-white" />
                  <div className="info w-[70%]">
                    <h3>Material/Service Indents</h3>
                  </div>
                </div> */}

              {/* ManPower Upload Form */}
             


              {/* ManPower Upload Form */}
             

              {/* Stationery Upload */}
              {useToken.Is_Employee == 0 && (
                <Link to="/StatUploadForm">
                  <div className="box h-full p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-r from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
                    <GiPencilRuler className="text-[40px] text-white" />
                    <div className="info w-[70%]">
                      <h3>Stationery Upload</h3>
                    </div>
                  </div>
                </Link>
              )}

 {/* ✅ App Video Tutorial Tile */}
            <a 
              href={`${IMAGE_PATH}/MRF Approval Flow.mp4`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
                <MdPlayCircleFilled className="text-[40px] text-white" /> 
                <div className="info w-[70%]">
                  <h3 className="font-bold">MRF Approval Manual</h3>
                  <p className="text-[10px] opacity-80">Watch Help Video</p>
                </div>
              </div>
            </a>

              {/* Plant & Machinery */}
              <Link to="/Mainpage">
                 <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
                  <FaCarSide className="text-[40px] text-white" />
                  <div className="info w-[70%]">
                    <h3>Plant & Machinery</h3>
                  </div>
                </div>
              </Link>
            </>



          </div>
        </div>

        {/* Right Section - Chart & Calendar */}
        <div className="flex flex-col col-span-12 gap-4 lg:col-span-5">
          {/* <div className="bg-white rounded-xl p-6 shadow-[0_12px_32px_rgba(0,0,0,0.2)] ring-1 ring-blue-100 border border-blue-300 h-[300px] overflow-hidden">
            <h2 className="mb-2 text-lg font-semibold">Chart</h2>
            <div className="h-[240px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div> */}

          {/* Replace the old Calendar with CustomCalendar */}
          <CustomCalendar />
        </div>
      </div>

      {/* ✅ Notification Popup */}
      {/* {showNotification && (
        <div
          className="absolute flex items-start justify-between p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-72"
          style={{
            top: '20px',
            right: '30px',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <style>{`
            @keyframes slideIn {
              0% {
                opacity: 0;
                transform: translateX(100%);
              }
              100% {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
          <div>
            <h4 className="mb-1 font-semibold text-gray-800">Reminder</h4>
            <p className="text-sm text-gray-600">Don't forget to submit your report by 5 PM today!</p>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <IoClose size={20} />
          </button>
        </div>
      )} */}
    </div>
  );
};

export default DashboardBoxes;

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { IoCalendarOutline, IoClose } from "react-icons/io5";
// import { GiPencilRuler, GiSteelClaws } from "react-icons/gi";
// import { RiPassValidLine } from "react-icons/ri";
// import { FaFileInvoiceDollar, FaCarSide } from "react-icons/fa";
// import { MdBuild, MdPlayCircleFilled } from "react-icons/md"; // Combined these
// import { IMAGE_PATH, INDENT_URL } from "../../Config";
// import CustomCalendar from './CustomCalendar';
// import holidayImages from './holidayImages';

// // Chart.js imports
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import { Bar } from 'react-chartjs-2';

// // Register Chart.js components
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
// const getRandomData = () => labels.map(() => Math.floor(Math.random() * 100));

// const DashboardBoxes = () => {
//   // ✅ Hooks must be INSIDE the component function
//   const [openVideo, setOpenVideo] = useState(false);
//   const [showNotification, setShowNotification] = useState(true);
//   const [useToken, setToken] = useState(() => {
//     return JSON.parse(localStorage.getItem('userInfo')) ? JSON.parse(localStorage.getItem('userInfo')) : {}
//   });

//   const chartData = {
//     labels,
//     datasets: [
//       {
//         label: 'Random Dataset',
//         data: getRandomData(),
//         backgroundColor: 'rgba(54, 162, 235, 0.6)',
//         borderColor: 'rgba(54, 162, 235, 1)',
//         borderWidth: 1,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     plugins: { legend: { position: 'top' } },
//   };

//   const pinkGradient = "bg-gradient-to-r from-[#c71d6f] to-[#d09693]";
//   const blueGradient = "bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed]";

//   let visibleTileIndex = 0;

//   return (
//     <div className="relative min-h-screen px-6 pt-2 pb-6">
//       <div className="grid grid-cols-12 gap-4 bg-blue">
//         <div className="col-span-12 lg:col-span-7">
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            
//             {/* Stationery */}
//             {(useToken.Is_Employee == 1 || useToken.Is_Employee == 0 || useToken.Is_Employee == 2 || useToken.Is_Employee == 3) && (
//               <Link to="/StationaryForm">
//                 <div className="box h-full p-5 bg-white text-white rounded-xl cursor-pointer bg-gradient-to-r from-[#c71d6f] to-[#d09693] hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105">
//                   <GiPencilRuler className="text-[40px] text-white" />
//                   <div className="info w-[70%]"><h3>Stationery</h3></div>
//                 </div>
//               </Link>
//             )}

//             {/* HO Vehicle Tracker */}
//             {(useToken.Is_HO_VEH_USR == 1 || useToken.Is_HO_VEH_USR == 2) && (
//               <Link to="/NavBar">
//                  <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                   <FaCarSide className="text-[40px] text-white" />
//                   <div className="info w-[70%]"><h3>HO Vehicle Tracker</h3></div>
//                 </div>
//               </Link>
//             )}

//             {/* Manpower Request */}
//             {(useToken.MRF == 1 || useToken.MRF == 2) && (
//               <Link to="/manpower">
//                  <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                   <IoCalendarOutline className="text-[40px] text-white" />
//                   <div className="info w-[70%]"><h3>ManPower Request</h3></div>
//                 </div>
//               </Link>
//             )}

//             {/* ✅ App Video Tutorial Tile */}
//             <a 
//               href={`${IMAGE_PATH}/MRF Approval Flow.mp4`} 
//               target="_blank" 
//               rel="noopener noreferrer"
//             >
//               <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                 <MdPlayCircleFilled className="text-[40px] text-white" /> 
//                 <div className="info w-[70%]">
//                   <h3 className="font-bold">MRF Approval Manual</h3>
//                   <p className="text-[10px] opacity-80">Watch Help Video</p>
//                 </div>
//               </div>
//             </a>

//             {/* Plant & Machinery */}
//             <Link to="/Mainpage">
//                <div className={`box h-full p-5 bg-white text-white rounded-xl cursor-pointer ${visibleTileIndex++ % 2 === 0 ? pinkGradient : blueGradient} hover:brightness-110 border border-[rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform duration-300 transform hover:scale-105`}>
//                 <FaCarSide className="text-[40px] text-white" />
//                 <div className="info w-[70%]"><h3>Plant & Machinery</h3></div>
//               </div>
//             </Link>

//           </div>
//         </div>

//         <div className="flex flex-col col-span-12 gap-4 lg:col-span-5">
//           <CustomCalendar />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardBoxes;