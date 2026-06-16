import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiGlobe } from "react-icons/fi"; 
import { FaBookOpen, FaCalendarCheck, FaCar, FaBalanceScale, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { RiHomeOfficeLine } from "react-icons/ri"; 
import { FiMaximize } from "react-icons/fi";
import { IMAGE_PATH } from '../Config';
import { Footer } from '../Components/Footer';

const MainPage = () => {
  const navigate = useNavigate();
  const [userToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo')) || {};
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [isMuted, setIsMuted] = useState(true);

  // --- VIDEO ROTATION LOGIC ---
  // Slot 1: These videos will rotate every time the full sequence loops
  const slot1Videos = [
    `${IMAGE_PATH}/REPUBLIC DAY.mp4`, 
    `${IMAGE_PATH}/hrp2.mp4`, // Add more variations here
    // `${IMAGE_PATH}/REPUBLIC_DAY_V3.mp4`,
  ];

  // Fixed Videos: These always play after whichever Slot 1 video was chosen
  const fixedVideos = [
    `${IMAGE_PATH}/vd3_1.mp4`, // Video 2
    `${IMAGE_PATH}/vd3.mp4`    // Video 3
  ];

  const [currentSlot, setCurrentSlot] = useState(1); // change to 1 if you want to play slot1videos
  const [slot1Index, setSlot1Index] = useState(0);   // Which Slot 1 video to show

  const getCurrentVideoPath = () => {
    // if (currentSlot === 0) {
    //   return slot1Videos[slot1Index];
    // } else {
    //   return fixedVideos[currentSlot - 1];
    // }
    return fixedVideos[currentSlot - 1];
  };

  const handleVideoEnded = () => {
    if (currentSlot === 2) {
      // enable these 2 lines to play slot1videos
      // setCurrentSlot(0);
      // setSlot1Index((prev) => (prev + 1) % slot1Videos.length);

      // disable to play slot1videos or enable to stop them
      setCurrentSlot(1); 
    } else {
      // Move to the next video in sequence
      setCurrentSlot((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (userToken.token) {
      navigate('/dashboard');
    }
  }, [navigate, userToken.token]);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div
      className="grid grid-cols-12 gap-2 md:gap-4 p-2 md:p-4 min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('https://i.pinimg.com/736x/b2/5c/63/b25c638ad797a8ff76f9c56f3b25403e.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: '100vh'
      }}
    >
      {/* Top Branding */}
      <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-6 z-10" >
        <div className="h-12 w-12 md:h-16 lg:h-20 md:w-10 lg:w-20 rounded-full p-1 bg-white ml-2 sm:ml-4 md:ml-4 lg:ml-10 shadow-neon">
          <img src={`${IMAGE_PATH}/my home logo.png`} alt="Logo" className="h-full w-full rounded-full object-cover" />
        </div>
        <h1 className="text-lg sm:text-base md:text-xl lg:text-lg xl:text-3xl text-center sm:text-left ml-4 font-bold text-[#3C552D]">
          MY HOME CONSTRUCTIONS PVT LTD
        </h1>
        <div className="h-12 w-12 md:h-16 lg:h-20 md:w-16 lg:w-20 rounded-full p-1 bg-white hidden sm:block shadow-neon">
          <img src={`${IMAGE_PATH}/chairman.png`} alt="Chairman" className="h-full w-full rounded-full object-cover" />
        </div>
      </div>

      {/* App Links Section */}
      <div className="col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 mt-24 md:mt-32 lg:mt-40 p-2">
        {/* INTRANET */}
        <div className="w-full max-w-[240px] mx-auto h-20 rounded-xl border border-orange-300 shadow-orange-glow hover:scale-105 transition-transform flex items-center justify-center bg-[#FCE7C8]">
          <Link to="/login" className="flex items-center space-x-4">
              <FiGlobe className="text-4xl text-[#FF8364] -ml-8" />
              <div className="h-10 w-[4px] bg-orange-400"></div>
              <h3 className="text-sm md:text-base lg:text-lg text-black font-bold">INTRANET</h3>
          </Link>
        </div>

        {/* MYSPACE */}
        <div className="w-full max-w-[240px] mx-auto h-20 rounded-xl border border-green-300 shadow-green-glow hover:scale-105 transition-transform flex items-center justify-center bg-[#D4E7C5]">
          <Link to="http://myspace.myhomeconstructions.com:8081/" target="_blank" className="flex items-center space-x-4">
              <FaCalendarCheck className="text-4xl text-green-600 -ml-10" />
              <div className="h-10 w-[4px] bg-green-400"></div>
              <h3 className="text-sm md:text-base lg:text-lg text-black font-bold">MY SPACE</h3>
          </Link>
        </div>

        {/* JNAN */}
        <div className="w-full max-w-[240px] mx-auto h-20 rounded-xl border border-[#D2B48C] shadow-tan-glow hover:scale-105 transition-transform flex items-center justify-center bg-[#DFD3C3]">
          <Link to="http://mhcphp.myhomeconstructions.com:8084/jnan/" target='_blank' className="flex items-center space-x-4">
              <FaBookOpen className="text-4xl text-[#5C4033] -ml-12" />
              <div className="h-10 w-[4px] bg-[#D2B48C]"></div>
              <h3 className="text-sm md:text-base lg:text-lg text-black font-bold">JNAN</h3>
          </Link>
        </div>

        {/* HOME LOANS */}
        <div className="w-full max-w-[240px] mx-auto h-20 rounded-xl border border-rose-300 shadow-rose-glow hover:scale-105 transition-transform flex items-center justify-center bg-[#FFCCCC]">
          <Link to="http://mhcphp.myhomeconstructions.com:8084/clpr/" target='_blank' className="flex items-center space-x-4">
              <RiHomeOfficeLine className="text-4xl text-rose-500 -ml-2" />
              <div className="h-10 w-[4px] bg-rose-400"></div>
              <h3 className="text-sm md:text-base lg:text-lg text-black font-bold text-center">HOME LOANS</h3>
          </Link>
        </div>

        {/* TRAVEL GRID */}
        <div className="w-full max-w-[240px] mx-auto h-20 rounded-xl border border-yellow-500 shadow-yellow-glow hover:scale-105 transition-transform flex items-center justify-center bg-[#FFDBAA]">
          <Link to="https://traveldesk.myhomeconstructions.com:8443/tems" target='_blank' className="flex items-center space-x-4">
              <FaCar className="text-4xl text-yellow-700 -ml-2" />
              <div className="h-10 w-[4px] bg-yellow-700"></div>
              <h3 className="text-sm md:text-base lg:text-lg text-black font-bold">TRAVEL GRID</h3>
          </Link>
        </div>

        {/* LEGAL */}
        <div className="w-full max-w-[240px] mx-auto h-20 rounded-xl border border-blue-400 shadow-blue-glow hover:scale-105 transition-transform flex items-center justify-center bg-[#DBEAFE]">
          <Link to="http://webapp.myhomeconstructions.com/react/legal/" target="_blank" className="flex items-center space-x-4">
              <FaBalanceScale className="text-4xl text-blue-600 -ml-14" />
              <div className="h-10 w-[4px] bg-blue-500"></div>
              <h3 className="text-sm md:text-base lg:text-lg text-black font-bold">LEGAL</h3>
          </Link>
        </div>
      </div>

      {/* Right Content Column */}
      <div className="col-span-12 lg:col-span-5 mt-6 lg:mt-24 flex items-center justify-center md:p-4">
        <div className="relative rounded-2xl glow-border-wrapper w-full max-w-full mt-[-100px] lg:mt-[-125px]">
          <div className="relative rounded-2xl p-3 md:p-4 h-[68vh] md:h-[78vh] lg:h-[88vh] z-10 shadow-xl border border-black bg-[#E1F0DA]">
            
            {/* Video Title Section */}
            <div className="text-center mt-4 mb-2">
              <div className="flex items-center justify-center gap-2 relative">
                <h3 className="text-base md:text-lg font-semibold uppercase tracking-wider">MHC Events</h3>
                <button onClick={() => openModal('video')} className="absolute right-2 p-2 text-gray-900 hover:text-black">
                  <FiMaximize size={20} />
                </button>
              </div>
            </div>

            {/* Video Player Card */}
            <div className="w-full relative pt-[100%] md:pt-[56.25%] lg:pt-[80%] rounded-xl overflow-hidden shadow-lg bg-black group">
              <video
                src={getCurrentVideoPath()}
                onEnded={handleVideoEnded}
                autoPlay
                playsInline
                muted={isMuted}
                className="absolute top-0 left-0 w-full h-full object-cover"
                onContextMenu={(e) => e.preventDefault()}
              />
              <button
                onClick={toggleMute}
                className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all z-20"
              >
                {isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
              </button>
            </div>

            {/* --- SEAMLESS MARQUEE GREETINGS --- */}
            {/* <div className="mt-6 overflow-hidden bg-[#F1F8E8] border-y-2 border-[#3C552D] py-3 relative shadow-inner">
              <div className="absolute left-0 top-0 bottom-0 bg-[#3C552D] px-4 z-20 flex items-center font-bold text-white shadow-lg">
                <span className="animate-pulse">✨ GREETINGS</span>
              </div>
              
              <div className="overflow-hidden flex whitespace-nowrap w-full">
                <div className="flex animate-marquee">
                  {/* GROUP 1 */}

                  {/* <span className="text-xl md:text-2xl font-black mx-8 inline-flex items-center shimmer-text">
                    <span className="animate-float">🇮🇳</span> 
                    Wishing Everyone a Happy 77th Republic Day! 
                    <span className="animate-float-delay">🫡</span>
                  </span>
                  <span className="text-xl md:text-2xl font-bold mx-8 inline-flex items-center text-pulse">
                    🕊️ May the tricolor always fly high! 🕊️
                  </span>
                  <span className="text-xl md:text-2xl font-black mx-8 inline-flex items-center festive-gradient-text">
                    ✨ Saluting the Heroes of our Nation. Jai Hind! ✨
                  </span>
                  <span className="text-xl md:text-2xl font-black mx-8 inline-flex items-center shimmer-text">
                    🇮🇳 Proud to be Indian 🇮🇳
                  </span> */}

                  {/* GROUP 2 (EXACT DUPLICATE FOR SEAMLESS LOOP) */}
                  
                  {/* <span className="text-xl md:text-2xl font-black mx-8 inline-flex items-center shimmer-text">
                    <span className="animate-float">🇮🇳</span> 
                    Wishing Everyone a Happy 77th Republic Day! 
                    <span className="animate-float-delay">🫡</span>
                  </span>
                  <span className="text-xl md:text-2xl font-bold mx-8 inline-flex items-center text-pulse">
                    🕊️ May the tricolor always fly high! 🕊️
                  </span>
                  <span className="text-xl md:text-2xl font-black mx-8 inline-flex items-center festive-gradient-text">
                    ✨ Saluting the Heroes of our Nation. Jai Hind! ✨
                  </span>
                  <span className="text-xl md:text-2xl font-black mx-8 inline-flex items-center shimmer-text">
                    🇮🇳 Proud to be Indian 🇮🇳
                  </span>
                </div>
              </div>
            </div> */} 

          </div>
        </div>
      </div>

      {/* --- CUSTOM ANIMATIONS --- */}
      <style>
        {`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .shadow-neon {
          animation: neonPulse 2.5s ease-in-out infinite;
        }
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 12px #729762, inset 0 0 8px #729762, 0 0 26px #729762; }
          50% { box-shadow: 0 0 16px #729762, inset 0 0 8px #729762, 0 0 32px #729762; }
        }
        .shimmer-text {
          background: linear-gradient(to right, #FF9933 20%, #FFD700 40%, #ffffff 50%, #FFD700 60%, #138808 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 3s linear infinite;
        }
        .text-pulse { animation: patrioticPulse 4s ease-in-out infinite; }
        @keyframes patrioticPulse {
          0%, 100% { color: #FF9933; transform: scale(1); }
          50% { color: #138808; transform: scale(1.05); }
        }
        .festive-gradient-text {
          background: linear-gradient(to right, #FF9933 20%, #000080 50%, #138808 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: shine 3s linear infinite;
        }
        @keyframes shine { to { background-position: 200% center; } }
        .animate-float { display: inline-block; animation: floating 2s ease-in-out infinite; }
        .animate-float-delay { display: inline-block; animation: floating 2s ease-in-out infinite 1s; }
        @keyframes floating {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-10px) rotate(10deg); }
        }
        .shadow-orange-glow { box-shadow: 0 0 12px 2px rgba(234,88,12,0.7); }
        .shadow-green-glow { box-shadow: 0 0 12px 2px rgba(114,191,98,0.7); }
        .shadow-tan-glow { box-shadow: 0 0 12px 2px rgba(188,159,139,0.7); }
        .shadow-rose-glow { box-shadow: 0 0 12px 2px rgba(244,63,94,0.7); }
        .shadow-yellow-glow { box-shadow: 0 0 12px 2px rgba(234,179,8,0.7); }
        .shadow-blue-glow { box-shadow: 0 0 12px 2px rgba(59,130,246,0.7); }
        `}
      </style>

      {/* Fullscreen Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl">
            <button onClick={closeModal} className="absolute -top-12 right-0 text-white text-4xl font-light hover:text-red-500 transition-colors">&times;</button>
            <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-black">
              {modalType === 'video' && (
                <video
                  src={getCurrentVideoPath()}
                  onEnded={handleVideoEnded}
                  autoPlay
                  controls
                  playsInline
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-[75vh] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MainPage;