import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SessionTimeout = () => {
  const navigate = useNavigate();
  const timer = useRef(null); // ✅ stable reference
  const resetTimer = () => 
  {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => 
    {
      localStorage.removeItem("userInfo");
      alert("Session expired due to inactivity.");
      navigate("/login");
    }, 1* 60 * 1000); // 30 minutes
  };

  useEffect(() => {
    // Attach events
    window.onload      = resetTimer;
    window.onmousemove = resetTimer;
    window.onkeypress  = resetTimer;
    // Cleanup on unmount
    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.onload      = null;
      window.onmousemove = null;
      window.onkeypress  = null;
    };
  }, []);
  return null;
};

export default SessionTimeout;
