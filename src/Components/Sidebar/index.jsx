import { Button } from "@mui/material";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Link } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { FaRegImage } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { RiProductHuntLine } from "react-icons/ri";
import { TbCategory } from "react-icons/tb";
import { IoBagCheckOutline } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa";
import { Collapse } from "react-collapse";
import { MyContext } from "../../App";
import { MdSpaceDashboard ,MdOutlineAdminPanelSettings} from "react-icons/md";
import { FiInbox, FiLogOut } from "react-icons/fi";
import { HiOutlineUsers } from "react-icons/hi";
import { API_BASE_URL } from "../../Config";

const Sidebar = () => {
  const [submenuIndex, setSubmenuIndex] = useState(null);

  const [creationChangeOpen, setCreationChangeOpen] = useState(false);

  const [token, useToken] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo"))
      ? JSON.parse(localStorage.getItem("userInfo"))
      : {};
  });
  const navigate = useNavigate();
  const userLogout = async () => {
    //alert(123);
    try {
      const LogoutResponse = await fetch(`${API_BASE_URL}logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token.token}`,
        },
        body: JSON.stringify({}),
      });
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ Emp_Id: "", employee: "", token: "" }),
      );

      if (!LogoutResponse.ok)
        throw new Error("Server is Not Responding Error 500");
      navigate("/login");
    } catch (error) {
      console.error("Logout Failed 401");
    }
  };
  const isOpenSubMenu = (index) => {
    if (submenuIndex === index) {
      setSubmenuIndex(null);
    } else {
      setSubmenuIndex(index);
    }
  };
  const context = useContext(MyContext);
  return (
    <div
      onMouseEnter={() => context.setisSidebarOpen(true)}
      onMouseLeave={() => context.setisSidebarOpen(false)}
      className={`overflow-hidden sidebar fixed top-0 left-0 
      bg-gradient-to-b from-rose-500 to-rose-900 
      ${context.isSidebarOpen ? "w-[16%]" : "w-[90px]"} 
      h-full z-40 text-white py-2 px-4 border-r border-[rgba(255,255,255,0.1)] 
      transition-all duration-300`}
    >
      <div className="flex justify-center w-full py-2">
        <Link to="/">
          <img
            src="https://ecme-react.themenate.net/img/logo/logo-light-full.png"
            className={`transition-all duration-300 ${context.isSidebarOpen ? "w-[120px]" : "w-[40px]"}`}
            alt="Logo"
          />
        </Link>
      </div>
      <ul className="mt-4 space-y-2 pt-[60px] pl-4">
        <li>
          {/* Dashboard */}
          <Link to="/dashboard">
            <Button
              className="w-full !capitalize !py-2 hover:!bg-[rgba(255,255,255,0.1)]
  !justify-start flex gap-3 text-[14px] !text-white !font-[700] items-center"
            >
              <MdSpaceDashboard className="text-[25px]" />
              {context.isSidebarOpen && <span>Dashboard</span>}
            </Button>
          </Link>

          {/* Inbox */}
          <Link to="/StationaryList">
            <Button
              className="w-full !capitalize !py-2 hover:!bg-[rgba(255,255,255,0.1)]
  !justify-start flex gap-3 text-[14px] !text-white !font-[700] items-center"
            >
              <FiInbox className="text-[25px]" />
              {context.isSidebarOpen && <span>Inbox</span>}
            </Button>
          </Link>

          {/* Participants */}
          <Link to="/participants">
            <Button
              className="w-full !capitalize !py-2 hover:!bg-[rgba(255,255,255,0.1)]
  !justify-start flex gap-3 text-[14px] !text-white !font-[700] items-center"
            >
              <HiOutlineUsers className="text-[25px]" />
              {context.isSidebarOpen && <span>Participants</span>}
            </Button>
          </Link>

          {/* Unassigned */}
          <Link to="/unassigned">
            <Button
              className="w-full !capitalize !py-2 hover:!bg-[rgba(255,255,255,0.1)]
  !justify-start flex gap-3 text-[14px] !text-white !font-[700] items-center"
            >
              <HiOutlineUsers className="text-[25px]" />
              {context.isSidebarOpen && <span>Unassigned</span>}
            </Button>
          </Link>

{(token.MRF == 2 ) && (
          <Link to="/mrfdashboard">
            <Button
              className="w-full !capitalize !py-2 hover:!bg-[rgba(255,255,255,0.1)]
                !justify-start flex gap-3 text-[14px] !text-white !font-[700] items-center"
            >
              <HiOutlineUsers className="text-[25px]" />
              {context.isSidebarOpen && <span>MRFdashboard</span>}
            </Button>
          </Link>
          )}
          {/* mrfdashboard */}
          {/* <Link to="/mrfdashboard">
            <Button
              className="w-full !capitalize !py-2 hover:!bg-[rgba(255,255,255,0.1)]
              !justify-start flex gap-3 text-[14px] !text-white !font-[700] items-center"
            >
              <HiOutlineUsers className="text-[25px]" />
              {context.isSidebarOpen && <span>MRFdashboard</span>}
            </Button>
          </Link> */}

          {/* ── Level 1: MasterData ── */}
          <li>
            <Link to="/MasterDataUdyan">
              <Button
                className="w-full !capitalize !py-2 hover:!bg-[rgba(255,255,255,0.1)]
                !justify-start flex gap-3 text-[14px] !text-white !font-[700] items-center"
                onClick={() => isOpenSubMenu(3)}
              >
                <HiOutlineUsers className="text-[25px]" />
                {context.isSidebarOpen && <span>MasterData</span>}
                {context.isSidebarOpen && (
                  <span className="ml-auto w-[30px] flex items-center justify-center">
                    <FaAngleDown
                      className={`transition-all ${submenuIndex === 3 ? "rotate-180" : ""}`}
                    />
                  </span>
                )}
              </Button>
            </Link>

            <Collapse isOpened={submenuIndex === 3}>
              <ul className="w-full">
                {/* ── Level 2: Creation/Change (clickable toggle) ── */}
                <li className="w-full">
                  <Button
                    className="!text-[rgba(255,255,255,0.85)] !capitalize !justify-start !w-full 
                      !text-[13px] !font-[700] !pl-9 flex gap-3 hover:!bg-[rgba(255,255,255,0.05)]"
                    onClick={() => setCreationChangeOpen((v) => !v)}
                  >
                    <span className="block w-[8px] h-[8px] rounded-full bg-[rgba(255,255,255,0.3)]"></span>
                    {context.isSidebarOpen && (
                      <span className="flex items-center justify-between w-full pr-1">
                        <span>Creation/Change</span>
                        <FaAngleDown
                          className={`text-[10px] transition-all ${creationChangeOpen ? "rotate-180" : ""}`}
                        />
                      </span>
                    )}
                  </Button>

                  {/* ── Level 3: Group Code & Sub Code ── */}
                  <Collapse isOpened={creationChangeOpen}>
                    <ul className="w-full">
                      <li className="w-full">
                        <Link to="/GroupCodeCreation">
                          <Button
                            className="!text-[rgba(255,255,255,0.7)] !capitalize !justify-start !w-full 
                            !text-[12px] !font-[600] !pl-14 flex gap-2 hover:!bg-[rgba(255,255,255,0.05)]"
                          >
                            <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(255,255,255,0.4)]"></span>
                            {context.isSidebarOpen && <span>Group Code</span>}
                          </Button>
                        </Link>
                      </li>

                      <li className="w-full">
                        <Link to="/SubCodeCreation">
                          <Button
                            className="!text-[rgba(255,255,255,0.7)] !capitalize !justify-start !w-full 
                            !text-[12px] !font-[600] !pl-14 flex gap-2 hover:!bg-[rgba(255,255,255,0.05)]"
                          >
                            <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(255,255,255,0.4)]"></span>
                            {context.isSidebarOpen && <span>Sub Code</span>}
                          </Button>
                        </Link>
                      </li>
                    </ul>
                  </Collapse>
                </li>

                {/* Master Add/Sub */}
                <li className="w-full">
                  <Link to="/MasterAddition">
                    <Button
                      className="!text-[rgba(255,255,255,0.85)] !capitalize !justify-start !w-full 
                      !text-[13px] !font-[700] !pl-9 flex gap-3 hover:!bg-[rgba(255,255,255,0.05)]"
                    >
                      <span className="block w-[8px] h-[8px] rounded-full bg-[rgba(255,255,255,0.3)]"></span>
                      {context.isSidebarOpen && <span>MRF Add/Sub</span>}
                    </Button>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>

          {/* MRF Authorization - Only visible to Is_Employee == 1 */}
{(token.MRF == 2 ) && (
          <Link to="/mrfauthorize">
            <Button className='w-full !capitalize !py-2 hover:!bg-[rgba(255,255,255,0.1)]
      !justify-start flex gap-3 text-[14px] !text-white !font-[700] items-center'>
              <MdOutlineAdminPanelSettings className='text-[25px]' />
              {context.isSidebarOpen && <span>WF Authorization</span>}
            </Button>
          </Link>
          )}

          {/* --------------updated this div to give access to both emp ==0 and emp == 2----------- */}
          {(token.Is_Employee == 0 || token.Is_Employee == 2) && (
            <Link to="/StatStockQuanList">
              <Button
                className="w-full !capitalize !py-2 hover:!bg-[rgba(255,255,255,0.1)]
      !justify-start flex gap-3 text-[14px] !text-white !font-[700] items-center"
              >
                <HiOutlineUsers className="text-[25px]" />
                {context.isSidebarOpen && <span>Stationery Stock</span>}
              </Button>
            </Link>
          )}

          

          {/* Participants */}
         
        
          {/*Log Out*/}
          <Button
            onClick={() => {
              userLogout();
            }}
            className="w-full !capitalize !py-2 hover:!bg-[rgba(255,255,255,0.1)]
    !justify-start flex gap-3 text-[14px] !text-white !font-[700] items-center"
          >
            <FiLogOut className="text-[25px]" />
            {context.isSidebarOpen && <span>Sign Out</span>}
          </Button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
