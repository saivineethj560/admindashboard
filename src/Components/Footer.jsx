import { useState } from "react";

export const Footer = () => {
  const teamMembers = [
    "FOR ANY QUERIES, CONTACT 8707, 8988",
    "DEVELOPED BY MHCPL SAP - WEB TEAM",
    "FOR ANY QUERIES, CONTACT 8707, 8988",
    "DEVELOPED BY MHCPL SAP - WEB TEAM",
    "FOR ANY QUERIES, CONTACT 8707, 8988",
    "DEVELOPED BY MHCPL SAP - WEB TEAM",
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white overflow-hidden transition-all duration-500 h-12"
      >
        <div className="relative h-full flex items-center">
          <div className="marquee-container w-full overflow-hidden">
            <div className="marquee-content flex items-center space-x-3 animate-marquee">
              {teamMembers.map((member, index) => (
                <div
                  key={`first-${index}`}
                  className="flex items-center space-x-2 whitespace-nowrap"
                >
                  <span className="text-2xl">✨</span>
                  <span className="text-lg font-semibold">{member}</span>
                  <span className="text-2xl">✨</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-purple-600 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-purple-600 to-transparent pointer-events-none"></div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }

        .marquee-container:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
