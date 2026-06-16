import { Outlet, Navigate } from "react-router-dom";
import SessionTimeout from "../SessionTimeout";



const ProtectRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || !userInfo.token) {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      {/* ✅ Session timeout will only run when user is logged in */}
      <SessionTimeout />
      <Outlet />
    </>
  );
};

export default ProtectRoute;
