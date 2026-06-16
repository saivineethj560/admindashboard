import {  Button,  Dialog,  DialogTitle,  DialogContent,  DialogActions,  Badge,  Menu,  MenuItem,  IconButton,} from '@mui/material';
import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
// import { FaRegBell } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { PiSignOutBold } from "react-icons/pi";
import { MdUpload } from "react-icons/md";
import { MyContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { IMAGE_PATH } from "../../Config";
import { API_BASE_URL } from "../../Config"


const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

function Header() {
  const [anchorMyAcc, setAnchorMyAcc] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const defaultImg = `${IMAGE_PATH}/usericon.jpg`;
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('profileImage') || defaultImg;
  });

  const openMyAcc = Boolean(anchorMyAcc);
  const navigate = useNavigate();
  const context = useContext(MyContext);

  const token = JSON.parse(localStorage.getItem("userInfo")) || {
    employee: "", Emp_Id: "", token: ""
  };

  const handleClickMyAcc = (event) => {
    setAnchorMyAcc(event.currentTarget);
  };

  const handleCloseMyAcc = () => {
    setAnchorMyAcc(null);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = '';
    let emoji = '';
    if (hour < 12) {
      greeting = 'Good Morning!'; emoji = '☀️';
    } else if (hour < 18) {
      greeting = 'Good Afternoon!'; emoji = '🌤️';
    } else {
      greeting = 'Good Evening!'; emoji = '🌙';
    }
    return `${greeting}${emoji} ${token?.employee ? ` ${token.employee}` : ''} `;

  };

  const userLogout = async () => {
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

      localStorage.setItem('userInfo', JSON.stringify({ Emp_Id: "", employee: "", token: "" }));
      navigate('/login');

      if (!LogoutResponse.ok) throw new Error("Server is Not Responding Error 500");
    } catch (error) {
      console.error("Logout Failed 401");
    }
  };

  const handleProfileOpen = () => setOpenProfileModal(true);
  const handleProfileClose = () => setOpenProfileModal(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  return (
    <>
      <header className="relative sticky top-0 z-50 w-full h-[auto] py-2 flex items-center justify-between pr-7 
        bg-gradient-to-r from-rose-900 to-rose-500 text-white shadow-md">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-[60px] h-[60px] rounded-full p-[4px] bg-white neon-ring flex items-center justify-center ml-5" style={{ marginRight: '150px' }}>
            <img src={`${IMAGE_PATH}/my home logo.png`} alt="Home Logo" className="w-full h-full object-contain rounded-full" />
          </div>
        </div>

        {/* Greeting */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-xl font-semibold whitespace-nowrap">{getGreeting()}</h1>
        </div>

        {/* Notifications + Profile */}
        <div className='part2 w-[40%] flex items-center justify-end gap-5'>
          {/* <IconButton aria-label="notifications">
            <StyledBadge badgeContent={4} color="secondary">
              <FaRegBell style={{ color: 'white' }} />
            </StyledBadge>
          </IconButton> */}
          <div className="relative">
            <div className='rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer' onClick={handleClickMyAcc}>
              <img src={profileImage || defaultImg} onError={(e) => e.target.src = defaultImg} className='w-full h-full object-cover' />
            </div>

            <Menu
              anchorEl={anchorMyAcc}
              open={openMyAcc}
              onClose={handleCloseMyAcc}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            >
              <MenuItem onClick={() => { handleCloseMyAcc(); handleProfileOpen(); }}>
                <FaUser className='mr-2' /> Profile
              </MenuItem>
              <MenuItem onClick={() => { handleCloseMyAcc(); userLogout(); }}>
                <PiSignOutBold className='mr-2' /> Sign Out
              </MenuItem>
            </Menu>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <Dialog open={openProfileModal} onClose={handleProfileClose}>
        <DialogTitle>Welcome to your Profile</DialogTitle>
        <DialogContent 
  className="flex flex-col gap-4 p-4"
  style={{ minWidth: '400px', maxWidth: '400px' }}
>
  <div className="relative w-[120px] h-[120px] self-center">
    <img
      src={selectedImage || profileImage || defaultImg}
      onError={(e) => e.target.src = defaultImg}
      alt="Profile"
      className="rounded-full w-full h-full object-cover border-4 border-rose-600"
    />
    <label htmlFor="upload-button">
      <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full cursor-pointer shadow-md">
        <MdUpload className="text-xl text-rose-700" />
      </div>
      <input
        type="file"
        id="upload-button"
        accept="image/*"
        hidden
        onChange={handleImageChange}
      />
    </label>
  </div>

  <div className="space-y-2 text-left font-semibold">
    <p>Name: <span className="font-normal text-gray-500 break-words">{token.employee || "John Doe"}</span></p>
    <p>Email: <span className="font-normal text-gray-500 break-words">{token.Email || "user@example.com"}</span></p>
    <p>Emp ID: <span className="font-normal text-gray-500">{token.Emp_Id || "123456" }</span></p>
    <p>Department: <span className="font-normal text-gray-500">{token.Department || "SAP" }</span></p>
  </div>
</DialogContent>


        <DialogActions className="justify-between p-4">
          <Button variant="outlined" onClick={handleProfileClose}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedImage) {
                setProfileImage(selectedImage);
                localStorage.setItem("profileImage", selectedImage);
              }
              setOpenProfileModal(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Header;