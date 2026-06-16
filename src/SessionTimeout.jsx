import { useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SessionTimeout = ({ timeoutMins = 600 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);

  const logout = useCallback(() => {
    console.log("Inactivity detected. Logging out...");
    
    // 🔥 CLEAR THE CORRECT KEY: userInfo
    localStorage.removeItem("userInfo"); 
    localStorage.clear(); 
    
    // Redirect to login
    navigate("/login", { replace: true });
    
    // Hard refresh for server build safety
    window.location.href = "/react/myhomedashboard/login"; 
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // 🔥 READ THE CORRECT KEY: userInfo
    const data = localStorage.getItem('userInfo');
    const userData = data ? JSON.parse(data) : null;
    const token = userData?.token; // Extract token from inside the object

    if (token) {
        console.log(`Timer restarted! Session active for ${timeoutMins} seconds.`);
        timerRef.current = setTimeout(logout, timeoutMins * 1000);
    }
  }, [logout, timeoutMins]);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    const handleActivity = () => resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer, location.pathname]);

  return null;
};

export default SessionTimeout;