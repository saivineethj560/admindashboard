import React from 'react'
import DashboardBoxes from '../../Components/DashboardBoxes';
import Button from '@mui/material/Button';
import {FaPlus } from 'react-icons/fa6';
import Checkbox from '@mui/material/Checkbox';
import {Link} from 'react-router-dom';
import Progress from '../../Components/ProgressBar';
import { FaRegEdit } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa6";
import { FiTrash2 } from "react-icons/fi";
import Tooltip from '@mui/material/Tooltip';
import Pagination from '@mui/material/Pagination';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
const Dashboard = () => {
  return (
    <>
       {/* <div className='w-full px-5 border border-[rgba(0,0,0,0.1)] flex items-center bg-[#f1faff]
           gap-8 mb-5 justify-between rounded-md py-2'>
           <div className='info'>
              <h1 className='text-[35px] font-bold leading-10 mb-3'>Good Morning, Cameron</h1><br/>
              <p className='mb-4'>Hello world This is the ReactJs Dashboard here...</p>
              <Button className='btn-blue !capitalize'><FaPlus/>Add Product</Button>
           </div>
           <img src="/banner2.jpg" className='w-[200px] h-[200px]'/>
       </div>   */}
      <DashboardBoxes/>
      
      {/* <div className='card my-4 shadow-md sm:rounded-lg bg-white'>
        <div className="flex items-center justify-between px-3 py-5">
          <h2 className='font-[20px] font-[600]'>Products <span className='text-[400] text-[12px]'>(Tailwind css Table)</span></h2>
        </div>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6  pr-0 py-3">
                          <div className='w-[60px] '>
                             <Checkbox {...label} size="small"/>
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3  !pr-0">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Category
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Sub-Category
                        </th>
                       
                        <th scope="col" className="px-6 py-3">
                            Price
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Rating
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 mb-2">
                         <td  className="px-6 pr-2 py-2 !pr-0">
                           <div className='w-[60px]'>
                             <Checkbox {...label} size="small"/>
                          </div>
                        </td>
                        <td className='px-6 py-2  !pr-0'>
                            <div  className='flex items-center gap-4 w-[350px]'>
                                <div className='img w-[70px] h-[70px] rounded-md overflow-hidden group'>
                                    <Link to="/product/453">
                                      <img   src="https://ecme-react.themenate.net/img/products/product-1.jpg" className="w-full group-hover:scale-105 transition-all"/>
                                  </Link>
                                </div>
                                <div className='info  w-[75%]'>
                                    <h3 className="font-[600] text-[13px] leading-4 hover:!text-[#1D58D8]">
                                      <Link   to='/product/453'>Dummy can also be used.
                                      </Link>
                                    </h3>
                                  <p className='text-[12px]'>In this article. </p>
                                </div>
                            </div>
                        </td>

                        <td className='px-6 py-2'>
                           Electronics
                        </td>
                        <td className='px-6 py-2'>
                            Women
                        </td>
                        <td className='px-6 py-2'>
                        $410.00
                        </td>
                        <td className='px-6 py-2'>
                          <p className='text-[14px] w-150'><span className='font-[600]'>234</span>sale</p>
                            <Progress value={30} type="success"/>
                        </td>
                        <td className='px-6 py-2'>
                          <div className='flex items-center gap-1'>
                            <Tooltip title="Edit" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FaRegEdit className='text-[rgba(0,0,0,0.7)] text-[20px]'/></Button> 
                            </Tooltip>
                            <Tooltip title="View" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FaRegEye className='text-[rgba(0,0,0,0.7)] text-[18px]'/></Button>
                             </Tooltip>
                             <Tooltip title="Delete" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FiTrash2 className='text-[rgba(0,0,0,0.7)] text-[20px]'/></Button>
                             </Tooltip>
                          </div>
                        </td>
                        <td className='px-6 py-2'>
                        
                        </td>
                    </tr> 

                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 mb-2">
                         <td  className="px-6 pr-2 py-2 !pr-0">
                           <div className='w-[60px]'>
                             <Checkbox {...label} size="small"/>
                          </div>
                        </td>
                        <td className='px-6 py-2  !pr-0'>
                            <div  className='flex items-center gap-4 w-[350px]'>
                                <div className='img w-[70px] h-[70px] rounded-md overflow-hidden group'>
                                    <Link to="/product/453">
                                      <img   src="https://ecme-react.themenate.net/img/products/product-1.jpg" className="w-full group-hover:scale-105 transition-all"/>
                                  </Link>
                                </div>
                                <div className='info  w-[75%]'>
                                    <h3 className="font-[600] text-[13px] leading-4 hover:!text-[#1D58D8]">
                                      <Link   to='/product/453'>Dummy can also be used.
                                      </Link>
                                    </h3>
                                  <p className='text-[12px]'>In this article. </p>
                                </div>
                            </div>
                        </td>

                        <td className='px-6 py-2'>
                           Electronics
                        </td>
                        <td className='px-6 py-2'>
                            Women
                        </td>
                        <td className='px-6 py-2'>
                        $410.00
                        </td>
                        <td className='px-6 py-2'>
                          <p className='text-[14px] w-150'><span className='font-[600]'>234</span>sale</p>
                            <Progress value={30} type="success"/>
                        </td>
                        <td className='px-6 py-2'>
                          <div className='flex items-center gap-1'>
                            <Tooltip title="Edit" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FaRegEdit className='text-[rgba(0,0,0,0.7)] text-[20px]'/></Button> 
                            </Tooltip>
                            <Tooltip title="View" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FaRegEye className='text-[rgba(0,0,0,0.7)] text-[18px]'/></Button>
                             </Tooltip>
                             <Tooltip title="Delete" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FiTrash2 className='text-[rgba(0,0,0,0.7)] text-[20px]'/></Button>
                             </Tooltip>
                          </div>
                        </td>
                        <td className='px-6 py-2'>
                        
                        </td>
                    </tr> 
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 mb-2">
                         <td  className="px-6 pr-2 py-2 !pr-0">
                           <div className='w-[60px]'>
                             <Checkbox {...label} size="small"/>
                          </div>
                        </td>
                        <td className='px-6 py-2  !pr-0'>
                            <div  className='flex items-center gap-4 w-[350px]'>
                                <div className='img w-[70px] h-[70px] rounded-md overflow-hidden group'>
                                    <Link to="/product/453">
                                      <img   src="https://ecme-react.themenate.net/img/products/product-1.jpg" className="w-full group-hover:scale-105 transition-all"/>
                                  </Link>
                                </div>
                                <div className='info  w-[75%]'>
                                    <h3 className="font-[600] text-[13px] leading-4 hover:!text-[#1D58D8]">
                                      <Link   to='/product/453'>Dummy can also be used.
                                      </Link>
                                    </h3>
                                  <p className='text-[12px]'>In this article. </p>
                                </div>
                            </div>
                        </td>

                        <td className='px-6 py-2'>
                           Electronics
                        </td>
                        <td className='px-6 py-2'>
                            Women
                        </td>
                        <td className='px-6 py-2'>
                        $410.00
                        </td>
                        <td className='px-6 py-2'>
                          <p className='text-[14px] w-150'><span className='font-[600]'>234</span>sale</p>
                            <Progress value={30} type="success"/>
                        </td>
                        <td className='px-6 py-2'>
                          <div className='flex items-center gap-1'>
                            <Tooltip title="Edit" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FaRegEdit className='text-[rgba(0,0,0,0.7)] text-[20px]'/></Button> 
                            </Tooltip>
                            <Tooltip title="View" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FaRegEye className='text-[rgba(0,0,0,0.7)] text-[18px]'/></Button>
                             </Tooltip>
                             <Tooltip title="Delete" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FiTrash2 className='text-[rgba(0,0,0,0.7)] text-[20px]'/></Button>
                             </Tooltip>
                          </div>
                        </td>
                        <td className='px-6 py-2'>
                        
                        </td>
                    </tr> 
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 mb-2">
                         <td  className="px-6 pr-2 py-2 !pr-0">
                           <div className='w-[60px]'>
                             <Checkbox {...label} size="small"/>
                          </div>
                        </td>
                        <td className='px-6 py-2  !pr-0'>
                            <div  className='flex items-center gap-4 w-[350px]'>
                                <div className='img w-[70px] h-[70px] rounded-md overflow-hidden group'>
                                    <Link to="/product/453">
                                      <img   src="https://ecme-react.themenate.net/img/products/product-1.jpg" className="w-full group-hover:scale-105 transition-all"/>
                                  </Link>
                                </div>
                                <div className='info  w-[75%]'>
                                    <h3 className="font-[600] text-[13px] leading-4 hover:!text-[#1D58D8]">
                                      <Link   to='/product/453'>Dummy can also be used.
                                      </Link>
                                    </h3>
                                  <p className='text-[12px]'>In this article. </p>
                                </div>
                            </div>
                        </td>

                        <td className='px-6 py-2'>
                           Electronics
                        </td>
                        <td className='px-6 py-2'>
                            Women
                        </td>
                        <td className='px-6 py-2'>
                        $410.00
                        </td>
                        <td className='px-6 py-2'>
                          <p className='text-[14px] w-150'><span className='font-[600]'>234</span>sale</p>
                            <Progress value={30} type="success"/>
                        </td>
                        <td className='px-6 py-2'>
                          <div className='flex items-center gap-1'>
                            <Tooltip title="Edit" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FaRegEdit className='text-[rgba(0,0,0,0.7)] text-[20px]'/></Button> 
                            </Tooltip>
                            <Tooltip title="View" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FaRegEye className='text-[rgba(0,0,0,0.7)] text-[18px]'/></Button>
                             </Tooltip>
                             <Tooltip title="Delete" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FiTrash2 className='text-[rgba(0,0,0,0.7)] text-[20px]'/></Button>
                             </Tooltip>
                          </div>
                        </td>
                        <td className='px-6 py-2'>
                        
                        </td>
                    </tr> 
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 mb-2">
                         <td  className="px-6 pr-2 py-2 !pr-0">
                           <div className='w-[60px]'>
                             <Checkbox {...label} size="small"/>
                          </div>
                        </td>
                        <td className='px-6 py-2  !pr-0'>
                            <div  className='flex items-center gap-4 w-[350px]'>
                                <div className='img w-[70px] h-[70px] rounded-md overflow-hidden group'>
                                    <Link to="/product/453">
                                      <img   src="https://ecme-react.themenate.net/img/products/product-1.jpg" className="w-full group-hover:scale-105 transition-all"/>
                                  </Link>
                                </div>
                                <div className='info  w-[75%]'>
                                    <h3 className="font-[600] text-[13px] leading-4 hover:!text-[#1D58D8]">
                                      <Link   to='/product/453'>Dummy can also be used.
                                      </Link>
                                    </h3>
                                  <p className='text-[12px]'>In this article. </p>
                                </div>
                            </div>
                        </td>

                        <td className='px-6 py-2'>
                           Electronics
                        </td>
                        <td className='px-6 py-2'>
                            Women
                        </td>
                        <td className='px-6 py-2'>
                        $410.00
                        </td>
                        <td className='px-6 py-2'>
                          <p className='text-[14px] w-150'><span className='font-[600]'>234</span>sale</p>
                            <Progress value={30} type="success"/>
                        </td>
                        <td className='px-6 py-2'>
                          <div className='flex items-center gap-1'>
                            <Tooltip title="Edit" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FaRegEdit className='text-[rgba(0,0,0,0.7)] text-[20px]'/></Button> 
                            </Tooltip>
                            <Tooltip title="View" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FaRegEye className='text-[rgba(0,0,0,0.7)] text-[18px]'/></Button>
                             </Tooltip>
                             <Tooltip title="Delete" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FiTrash2 className='text-[rgba(0,0,0,0.7)] text-[20px]'/></Button>
                             </Tooltip>
                          </div>
                        </td>
                        <td className='px-6 py-2'>
                        
                        </td>
                    </tr> 
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 mb-2">
                         <td  className="px-6 pr-2 py-2 !pr-0">
                           <div className='w-[60px]'>
                             <Checkbox {...label} size="small"/>
                          </div>
                        </td>
                        <td className='px-6 py-2  !pr-0'>
                            <div  className='flex items-center gap-4 w-[350px]'>
                                <div className='img w-[70px] h-[70px] rounded-md overflow-hidden group'>
                                    <Link to="/product/453">
                                      <img   src="https://ecme-react.themenate.net/img/products/product-1.jpg" className="w-full group-hover:scale-105 transition-all"/>
                                  </Link>
                                </div>
                                <div className='info  w-[75%]'>
                                    <h3 className="font-[600] text-[13px] leading-4 hover:!text-[#1D58D8]">
                                      <Link   to='/product/453'>Dummy can also be used.
                                      </Link>
                                    </h3>
                                  <p className='text-[12px]'>In this article. </p>
                                </div>
                            </div>
                        </td>

                        <td className='px-6 py-2'>
                           Electronics
                        </td>
                        <td className='px-6 py-2'>
                            Women
                        </td>
                        <td className='px-6 py-2'>
                        $410.00
                        </td>
                        <td className='px-6 py-2'>
                          <p className='text-[14px] w-150'><span className='font-[600]'>234</span>sale</p>
                            <Progress value={30} type="success"/>
                        </td>
                        <td className='px-6 py-2'>
                          <div className='flex items-center gap-1'>
                            <Tooltip title="Edit" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FaRegEdit className='text-[rgba(0,0,0,0.7)] text-[20px]'/></Button> 
                            </Tooltip>
                            <Tooltip title="View" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FaRegEye className='text-[rgba(0,0,0,0.7)] text-[18px]'/></Button>
                             </Tooltip>
                             <Tooltip title="Delete" placement="top">
                             <Button className='!w-[35px] !h-[35px] !min-w-[35px] !bg-[#f1f1f1] !border-t !border-[rgba(0,0,0,0.1)] !rounded-full hover:!bg-[#ccc]' style={{minWidth:'35px'}}><FiTrash2 className='text-[rgba(0,0,0,0.7)] text-[20px]'/></Button>
                             </Tooltip>
                          </div>
                        </td>
                        <td className='px-6 py-2'>
                        
                        </td>
                    </tr> 
                </tbody>
            </table>
        </div>
            <div className='!flex !items-center justify-end '>
                <Pagination count={10} color="primary" className='px-6 py-4' />
            </div>
      </div> */}


      {/* <div className='card my-4 shadow-md sm:rounded-lg bg-white'>
        <div className="flex items-center justify-between px-3 py-5">
          <h2 className='font-[20px] font-[600]'>Recent Orders</h2>
        </div>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                          Order Id 
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Customer
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Items
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Price
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Created
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            Apple MacBook Pro 17"
                        </th>
                        <td className="px-6 py-4">
                            Silver
                        </td>
                        <td className="px-6 py-4">
                            Laptop
                        </td>
                        <td className="px-6 py-4">
                            $2999
                        </td>
                        <td className="px-6 py-4">
                           12-09-2024
                        </td>
                        <td className="px-6 py-4">
                            <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                        </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            Microsoft Surface Pro
                        </th>
                        <td className="px-6 py-4">
                            White
                        </td>
                        <td className="px-6 py-4">
                            Laptop PC
                        </td>
                        <td className="px-6 py-4">
                            $1999
                        </td>
                        <td className="px-6 py-4">
                           12-09-2024
                        </td>
                        <td className="px-6 py-4">
                            <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                        </td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            Magic Mouse 2
                        </th>
                        <td className="px-6 py-4">
                            Black
                        </td>
                        <td className="px-6 py-4">
                            Accessories
                        </td>
                        <td className="px-6 py-4">
                            $99
                        </td>
                        <td className="px-6 py-4">
                           12-09-2024
                        </td>
                        <td className="px-6 py-4">
                            <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div> */}

{/*------------------------------------DataTables In the ReactJs------------------------------------------------*/}


    </>
  )
}

export default Dashboard;
