import './App.css'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
// import Popup from './Forms/Popup';//popup page forget password???
import SetPassword from './Forms/SetPassword';
import Dashboard from './Pages/Dashboard';
import Header from './Components/Header/index.jsx';
import Sidebar from './Components/Sidebar/index.jsx';
import { createContext, useState } from 'react';
import DemoStationaryList from './Demo/DemoStationaryList.jsx';
import Login from './Forms/Login.jsx';
import MainPage from './MainPage/MainPage.jsx';
import ProtectRoute from './ProtectRoute/ProtectRoute.jsx';
import StationaryRequestForm from './Stationary/StationaryRequestForm.jsx';
import StationaryApproverForm from './Stationary/StationaryApproverForm.jsx'
// import Mrf from './Mrf/Mrf.jsx'; // Manpower Request Form import
// import MrfUpload from './Mrf/MrfUpload.jsx';
// import MrfUploadList from './Mrf/MrfUploadList.jsx';
import Inbox from './Inbox/Inbox.jsx';
import StationaryStoreApproval from './Stationary/StationaryStoreApproval.jsx'
import Participant from './Participants/Participant.jsx';
import Unassigned from './Unassigned/Unassigned.jsx';
import StatUploadForm from './Stationary/StatUploadForm.jsx';
import HrForm from './Stationary/HrForm.jsx';
import StatStockQuanList from './Stationary/StatStockQuanList.jsx';
import MeetingDashboard from './MeetingRoom/MeetingDashboard.jsx';
import MeetingRoomBooking from './MeetingRoom/MeetingRoomBooking.jsx';
//----------------------------HO VEHICLE TRACKER-------------------------------------------//
import NavBar from './Travel/NavBar.jsx';
import Creation from './Travel/Creation.jsx';
import Creation1 from './Travel/Creation1.jsx';
import MaintenanceFour from './Travel/MaintenanceFour.jsx';
import TaxFour from './Travel/TaxFour.jsx';
import InsuDisplay from './Travel/InsuDisplay.jsx';
import MainDisplay from './Travel/MainDisplay.jsx';
import TaxDisplay from './Travel/TaxDisplay.jsx';
import FastDisplay from './Travel/FastDisplay.jsx';
import ViewAll from './Travel/ViewAll.jsx';
import ViewallMaint from './Travel/ViewallMaint.jsx';
import ChangeTab from './Travel/ChangeTab.jsx';
import ViewallIsuFiles from './Travel/ViewallIsuFiles.jsx';
import EditInsChangePage from './Travel/EditInsChangePage.jsx';
import ViewallMaintFiles from './Travel/ViewallMaintFiles.jsx';
import EditMaintChangePage from './Travel/EditMaintChangePage.jsx';
import EditRoadTaxPage from './Travel/EditRoadTaxPage.jsx';
import ViewallFastTagFiles from './Travel/ViewallFastTagFiles.jsx';
import EditFastChallanPage from './Travel/EditFastChallanPage.jsx';
import Fourhistory from './Travel/Fourhistory.jsx';
import VehicleDetailsModal from './Travel/VehicleDetailsModal.jsx';
import CreationTwo from './Travel/CreationTwo.jsx';
import TwoWheelerDisplay from './Travel/TwoWheelerDisplay.jsx';
import TwoWheelerChange from './Travel/TwoWheelerChange.jsx';
import EditTwoWheeler from './Travel/EditTwoWheeler.jsx';
import ModifyTwoWheeler from './Travel/ModifyTwoWheeler.jsx';
import Twohistory from './Travel/Twohistory.jsx';
import TwoVehicleDetailsModal from './Travel/TwoVehicleDetailsModal.jsx';
import InsurAllFiles from './Travel/InsurAllFiles.jsx';
import ModifyInsurancePage from './Travel/ModifyInsurancePage.jsx';
import ModifyMaintenancePage from './Travel/ModifyMaintenancePage.jsx';
import ModifyRoadTaxPage from './Travel/ModifyRoadTaxPage.jsx';
import ModifyFastTagPage from './Travel/ModifyFastTagPage.jsx';
import EditScrapPage from './Travel/EditScrapPage.jsx';
import ScrapDisplay from './Travel/ScrapDisplay.jsx';
import EditvhkmsPage from './Travel/EditvhkmsPage.jsx';

//----------------p and m-----------------------------
import Mainpage from './PandM/Mainpage.jsx';
import VehicleData from './PandM/VehicleData.jsx';
import DriverData from './PandM/DriverData.jsx';
import ContractDetails from './PandM/ContractDetails.jsx';
import EquipmentMonit from './PandM/EquipmentMonit.jsx';
import TransferService from './PandM/TransferService.jsx';
import Reports from './PandM/Reports.jsx';
import ActionPage from './PandM/ActionPage.jsx';
import SessionTimeout from './SessionTimeout.jsx';
//------------------------Indent----------------------

import { IndentProvider } from "./Indents/IndentContext";
import IndentApproval from './Indents/ApprovalForm.jsx'
import PRFORM from './Indents/PRForm.jsx'
//---------------------Scrap sale ----------------
import ScrapSale from './ScrapSale/ScrapSaleRequestForm.jsx'
import ScrapSaleApproval from './ScrapSale/ScrapSaleApprovalForm.jsx'
import ScrapSaleUnassign from './ScrapSale/ScrapSaleUnassignForm.jsx'


//---------------------MM Asset Creation ----------------
import MMAsset from './MM_Asset_Creation/AssetCreationForm.jsx'
import MMAssetApproval from './MM_Asset_Creation/AssetApprovalForm.jsx'
//---------------------Stock Transfer Request ----------------
import StockTransferReq from './StockTransfer/StockRequestForm.jsx'
import StockApproval from './StockTransfer/StockApprovalForm.jsx'
//---------------------Material Master creation  ----------------
import MaterialMasterCreation from './MaterialMaster/MaterialMasterRequest.jsx'
import MaterialMasterApproval from './MaterialMaster/MaterialMasterApproval.jsx'
//---------------------Service Code creation  ----------------
import ServiceCodeRequest from './ServiceCode/ServiceCodeRequest.jsx';
import ServiceApproval from './ServiceCode/ServiceApproval.jsx';
import DraftForm from './Indents/DraftForm.jsx';
import RevertForm from './Indents/RevertForm.jsx';
// import DashboardMrf from './Manpower_component/DashboardMrf.jsx';
// import ManPowerHrList from './Manpower_component/ManPowerHrList.jsx';
// import ManpowerForm from './Manpower_component/ManpowerForm.jsx';
// import Manapp from './Manpower_component/Manapp1.jsx';
// import Transfer from './PandM/Transfer.jsx';
// import Service from './PandM/Service.jsx';
//-----------------------Manpower form--------18032026
import Mrf from './Mrf/Mrf.jsx';
import MrfUpload from './Mrf/MrfUpload.jsx';
import MrfUploadList from './Mrf/MrfUploadList.jsx';
import Manapp from './Manpower_component/Manapp1.jsx';
import ManpowerForm from './Manpower_component/ManpowerForm.jsx';
import ManPowerFlow from './DataFlow/DataFlow.jsx';
import ManPowerHrList from './Manpower_component/ManPowerHrList.jsx';
import DashboardMrf from './Manpower_component/DashboardMrf.jsx';
import MrfUploadList1 from './Mrf/MrfUploadEdit.jsx';

import MasterDataUdyan from './Master_data/masterDataUdyan.jsx';
import GroupCode from './Master_data/GroupCodeCreation.jsx';
import SubCodeCreation from './Master_data/SubCodeCreation.jsx';
import MasterAddition from './Master_data/MasterAddition.jsx';
import MrfChange from './Mrf_change/MrfChange.jsx';
import Indents from './Mrf_change/Indents.jsx';

//-----------HRM Process----------
import HrmApprovals from './HRM/hrmapprovals.jsx';

const MyContext = createContext();

// const RootLayout = () => (
//   <>
//     {/* <SessionTimeout timeoutMins={600} /> */}
//     <Outlet />
//   </>
// );

function App() {
  const [isSidebarOpen, setisSidebarOpen] = useState(true);

  const router = createBrowserRouter([
    // {
    //   // 🔥 EVERYTHING starts here inside RootLayout
    //   element: <RootLayout />, 
    //   children: [
    
    {
      path: "/",
      exact: true,
      element: <MainPage />
    },
    {
      path: '/login',
      exact: true,
      element: <Login />
    },
     {
      path: '/SetPassword',
      exact: true,
      element: <SetPassword />
    },
//  {
//       path: '/Popup',
//       exact: true,
//       element: <Popup />
//     },

    {
      element: <ProtectRoute />,
      children: [
        {
          path: '/dashboard',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <Dashboard />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/StationaryList',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <Inbox />
                </div>
              </div>
            </section>
          )
        },
        {
          path: "/DemoStationaryList",
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <DemoStationaryList />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/StationaryForm',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <StationaryRequestForm />
                </div>
              </div>
            </section>
          )
        },

       
        {
          path: '/StationaryApprover/:case_id',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <StationaryApproverForm />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/StationaryStoreApproval/:case_id',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <StationaryStoreApproval />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/participants',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <Participant />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/unassigned',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <Unassigned />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/StatUploadForm',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <StatUploadForm />
                </div>
              </div>
            </section>
          )
        },
        //  {
        //   path: '/mrfdashboard',
        //   exact: true,
        //   element: (
        //       <section className='main'>
        //         <Header/>
        //         <div className='flex contentMain'>
        //           <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
        //             <Sidebar/>
        //           </div>
        //           <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
        //             <DashboardMrf/>
        //           </div>
        //         </div>
        //       </section>
        //   )
        // },
        // // {
        // //   path:"/dataflow",
        // //   exact:true,
        // //    element: (
        // //     <section className='main'>
        // //         <Header/>
        // //       <div className='flex contentMain'>
        // //         <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
        // //           <Sidebar/>
        // //         </div>
        // //         <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
        // //           <ManPowerFlow/>
        // //         </div>
        // //       </div>
        // //     </section>
        // //   )
        // // },
        // {
        //   path:"/mapower_hr_list",
        //   exact:true,
        //    element: (
        //     <section className='main'>
        //         <Header/>
        //       <div className='flex contentMain'>
        //         <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
        //           <Sidebar/>
        //         </div>
        //         <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
        //           <ManPowerHrList/>
        //         </div>
        //       </div>
        //     </section>
        //   )
        // },
        {
          path: '/StatStockQuanList',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <StatStockQuanList />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/MeetingDashboard',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <MeetingDashboard />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/MeetingRoomBooking',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <MeetingRoomBooking />
                </div>
              </div>
            </section>
          )
        },
        //..................................................ho vehcile tracker............................................
        {
          path: '/Creation',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <Creation />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/Creation1',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <Creation1 />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/MaintenanceFour',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <MaintenanceFour />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/TaxFour',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <TaxFour />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/InsuDisplay',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <InsuDisplay />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/MainDisplay',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <MainDisplay />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/TaxDisplay',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <TaxDisplay />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/FastDisplay',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <FastDisplay />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/ViewAll',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <ViewAll />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/ViewallIsuFiles',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <ViewallIsuFiles />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/ViewallMaint',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <ViewallMaint />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/ChangeTab',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <ChangeTab />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/EditInsChangePage',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <EditInsChangePage />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/ViewallMaintFiles',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <ViewallMaintFiles />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/EditMaintChangePage',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <EditMaintChangePage />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/ViewallFastTagFiles',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <ViewallFastTagFiles />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/EditRoadTaxPage',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <EditRoadTaxPage />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/EditFastChallanPage',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <EditFastChallanPage />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/Fourhistory',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <Fourhistory />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/VehicleDetailsModal',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <VehicleDetailsModal />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/CreationTwo',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <CreationTwo />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/TwoWheelerDisplay',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <TwoWheelerDisplay />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/TwoWheelerChange',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <TwoWheelerChange />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/EditTwoWheeler',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <EditTwoWheeler />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/ModifyTwoWheeler',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <ModifyTwoWheeler />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/Twohistory',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <Twohistory />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/TwoVehicleDetailsModal',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <TwoVehicleDetailsModal />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/InsurAllFiles',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <InsurAllFiles />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/NavBar',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <NavBar />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/ModifyInsurancePage',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <ModifyInsurancePage />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/ModifyMaintenancePage',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <ModifyMaintenancePage />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/ModifyRoadTaxPage',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <ModifyRoadTaxPage />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/ModifyFastTagPage',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <ModifyFastTagPage />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/EditScrapPage',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <EditScrapPage />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/ScrapDisplay',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <ScrapDisplay />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/EditvhkmsPage',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <EditvhkmsPage />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/Mainpage',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <Mainpage />
                </div>
              </div>
            </section>
          )
        },
        // p and M ----------------------------------------------------------------------
                 {
                  path: '/Mainpage',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header/>
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar/>
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <Mainpage/>
                        </div>
                      </div>
                    </section>
                  )
                },
                {
                  path: '/VehicleData',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header/>
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar/>
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <VehicleData/>
                        </div>
                      </div>
                    </section>
                  )
                },
                 {
                  path: '/ActionPage',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header/>
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar/>
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <ActionPage/>
                        </div>
                      </div>
                    </section>
                  )
                },
                 {
                  path: '/DriverData',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header/>
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar/>
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <DriverData/>
                        </div>
                      </div>
                    </section>
                  )
                },
                {
                  path: '/ContractDetails',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header/>
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar/>
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <ContractDetails/>
                        </div>
                      </div>
                    </section>
                  )
                },
                {
                  path: '/EquipmentMonit',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header/>
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar/>
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <EquipmentMonit/>
                        </div>
                      </div>
                    </section>
                  )
                },
                
                {
                  path: '/TransferService',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header/>
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar/>
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <TransferService/>
                        </div>
                      </div>
                    </section>
                  )
                },
                {
                  path: '/Reports',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header/>
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar/>
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <Reports/>
                        </div>
                      </div>
                    </section>
                  )
                },
                //------------------------------------------------------Indents---------------------------------
                {
                  path: '/ApprovalForm/:case_id',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header/>
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar/>
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <IndentApproval/>
                        </div>
                      </div>
                    </section>
                  )
                },
                {
                  path: '/DraftForm/:case_id',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header/>
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar/>
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <DraftForm/>
                        </div>
                      </div>
                    </section>
                  )
                },
                {
                  path: '/RevertForm/:case_id',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header/>
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar/>
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <RevertForm/>
                        </div>
                      </div>
                    </section>
                  )
                },
                {
                  path: '/PRForm/:case_id',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header/>
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar/>
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <PRFORM/>
                        </div>
                      </div>
                    </section>
                  )
                },
              //------------------------------Scrap Sale Request-------------------------
                {
                  path: '/scrapsale',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header />
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar />
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <ScrapSale />
                        </div>
                      </div>
                    </section>
                  )
                },
                {
                  path: '/ScrapApproval/:case_id',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header />
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar />
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <ScrapSaleApproval />
                        </div>
                      </div>
                    </section>
                  )
                },
                {
                  path: '/ScrapUnassign/:case_id',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header />
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar />
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <ScrapSaleUnassign />
                        </div>
                      </div>
                    </section>
                  )
                },

                //------------------------------MM Asset Creation Form-------------------------
                {
                  path: '/mmassetcreation',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header />
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar />
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <MMAsset />
                        </div>
                      </div>
                    </section>
                  )
                },
                {
                  path: '/MMAssetApproval/:case_id',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header />
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar />
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <MMAssetApproval />
                        </div>
                      </div>
                    </section>
                  )
                },
                 //------------------------------Stock Transfer Form-------------------------  
                {
                  path: '/stockrequest',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header />
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar />
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <StockTransferReq />
                        </div>
                      </div>
                    </section>
                  )
                },
                {
                  path: '/StockApproval/:case_id',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header />
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar />
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <StockApproval />
                        </div>
                      </div>
                    </section>
                  )
                },
                 //------------------------------Material Master Creation Form-------------------------  
                {
                  path: '/matmastercreation',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header />
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar />
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <MaterialMasterCreation />
                        </div>
                      </div>
                    </section>
                  )
                },
                {
                  path: '/matmasterApproval/:case_id',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header />
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar />
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <MaterialMasterApproval />
                        </div>
                      </div>
                    </section>
                  )
                },
                 //------------------------------Service Code Creation Form-------------------------  
                {
                  path: '/servicecoderequest',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header />
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar />
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <ServiceCodeRequest />
                        </div>
                      </div>
                    </section>
                  )
                },
                {
                  path: '/serviceCodeApproval/:case_id',
                  exact: true,
                  element: (
                    <section className='main'>
                      <Header />
                      <div className='flex contentMain'>
                        <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                          <Sidebar />
                        </div>
                        <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                          <ServiceApproval />
                        </div>
                      </div>
                    </section>
                  )
                },
                
                //------------------------manpower links-----------------------18032026
                {
          path: '/mrfdashboard',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <DashboardMrf />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/MasterDataUdyan',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <MasterDataUdyan />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/GroupCodeCreation',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <GroupCode />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/SubCodeCreation',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <SubCodeCreation />
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/MasterAddition',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <MasterAddition />
                </div>
              </div>
            </section>
          )
        },
        {
      path: '/ManpowerForm',
      exact: true,
      element: (
        <section className='main'>
          <Header />
          <div className='flex contentMain'>
            <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
              <Sidebar />
            </div>
            <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
              <Mrf />
            </div>
          </div>
        </section>
      )
    },

     {
          path: '/ManpowerUploadForm',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <MrfUpload />
                </div>
              </div>
            </section>
          )
        },
         {
          path: '/mrfUploadEdit',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <MrfUploadList1 />
                </div>
              </div>
            </section>
          )
        },
        
        {
          path: '/ManpowerUploadList',
          exact: true,
          element: (
            <section className='main'>
              <Header />
              <div className='flex contentMain'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar />
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen === true ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <MrfUploadList />
                </div>
              </div>
            </section>
          )
        },
    {
      path: '/manpower',
      exact: true,
      element: (
        <section className='main'>
          <Header />
          <div className='flex contentMain'>
            <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
              <Sidebar />
            </div>
            <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
              <ManpowerForm />
            </div>
          </div>
        </section>
      )
    },
    {
      path: '/manapp/:case_id',
      exact: true,
      element: (
        <section className='main'>
          <Header />
          <div className='flex contentMain'>
            <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
              <Sidebar />
            </div>
            <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
              <Manapp />
            </div>
          </div>
        </section>
      )
    },
    {
      path: "/dataflow",
      exact: true,
      element: (
        <section className='main'>
          <Header />
          <div className='flex contentMain'>
            <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
              <Sidebar />
            </div>
            <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
              <ManPowerFlow />
            </div>
          </div>
        </section>
      )
    },
    {
      path: "/mapower_hr_list",
      exact: true,
      element: (
        <section className='main'>
          <Header />
          <div className='flex contentMain'>
            <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
              <Sidebar />
            </div>
            <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
              <ManPowerHrList />
            </div>
          </div>
        </section>
      )
    },
    {
      path: "/mrfauthorize",
      exact: true,
      element: (
        <section className='main'>
          <Header />
          <div className='flex contentMain'>
            <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
              <Sidebar />
            </div>
            <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
              <MrfChange />
            </div>
          </div>
        </section>
      )
    },
    {
      path: "/indentflow",
      exact: true,
      element: (
        <section className='main'>
          <Header />
          <div className='flex contentMain'>
            <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
              <Sidebar />
            </div>
            <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
              <Indents />
            </div>
          </div>
        </section>
      )
    },
        
    
       {
  path: '/hrmapprovals/:case_id',
  element: (
    <section className='main'>
      <Header />
      <div className='flex contentMain'>
        <div className={`sidebarWapper ${isSidebarOpen ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
          <Sidebar />
        </div>
        <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
          <HrmApprovals  />
        </div>
      </div>
    </section>
  )
}
      ],
    },
    //  ] // <-- Close the children array here
    // } // 
  ], {
    basename: '/react/myhomedashboard', // ✅ Put basename here
  }
  )

  const values = {
    isSidebarOpen,
    setisSidebarOpen,
  }

  return (
    <>
    <IndentProvider> 
      <MyContext.Provider value={values}>
        <RouterProvider router={router} />
      </MyContext.Provider>
      </IndentProvider>
    </>
  )
}

export default App;
export { MyContext };