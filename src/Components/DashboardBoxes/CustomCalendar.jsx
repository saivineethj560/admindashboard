import React, { useState, useEffect } from 'react';
import { IoCalendarOutline, IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import holidayImages from './holidayImages';

const CustomCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateMessage, setSelectedDateMessage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [holidays, setHolidays] = useState([
    // { name: "New Year", date: "01-Jan-2025", day: "Wednesday" },
    // { name: "Bhogi", date: "13-Jan-2025", day: "Monday" },
    { name: "Pongal/Sankranti", date: "15-Jan-2026", day: "Thursday" },
    { name: "Republic Day", date: "26-Jan-2026", day: "Monday" },
    // { name: "Maha shivaratri", date: "26-Feb-2025", day: "Wednesday" },
    { name: "Ugadi", date: "19-Mar-2026", day: "Thursday" },
    // { name: "Holi", date: "14-Mar-2025", day: "Friday" },
     { name: "Sri Rama Navami", date: "27-Mar-2026", day: "Friday" },
    { name: "May Day", date: "01-May-2026", day: "Friday" },
    { name: "Independence Day", date: "15-Aug-2026", day: "Saturday" },
    { name: "Vinayaka Chavithi", date: "14-Sep-2026", day: "Monday" },
    { name: "Gandhi Jayanthi", date: "02-Oct-2026", day: "Friday" },
    { name: "Vijaya Dasami", date: "20-Oct-2026", day: "Tuesday" },
    // { name: "Deepavali", date: "20-Oct-2025", day: "Monday" }
  ]);


  const currentDate = new Date();

  // Get current month's holidays for display
  const getCurrentMonthHolidays = () => {
    const monthNum = currentMonth.getMonth();
    return holidays.filter(holiday => {
      const [day, monthStr, year] = holiday.date.split('-');
      const monthMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      return monthMap[monthStr] === monthNum;
    });
  };

  const currentMonthHolidays = getCurrentMonthHolidays();

  // Effect to handle image rotation for current month holidays
  useEffect(() => {
    if (!selectedDate && currentMonthHolidays.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % currentMonthHolidays.length
        );
      }, 3000); // 3 seconds

      return () => clearInterval(interval);
    } else {
      setCurrentImageIndex(0);
    }
  }, [currentMonth, selectedDate, currentMonthHolidays.length]);

  // Effect to handle image rotation for selected date holidays
  useEffect(() => {
    if (selectedDate) {
      const dateHolidays = getHolidaysForDate(selectedDate);
      if (dateHolidays.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex((prevIndex) => 
            (prevIndex + 1) % dateHolidays.length
          );
        }, 3000); // 3 seconds

        return () => clearInterval(interval);
      } else {
        setCurrentImageIndex(0);
      }
    }
  }, [selectedDate]);

  // Function to get the festival image for a specific holiday
  const getFestivalImage = (holiday) => {
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                        'july', 'august', 'september', 'october', 'november', 'december'];
    const month = monthNames[currentMonth.getMonth()];
    
    // If no specific holiday provided, get the first holiday of the month
    if (!holiday && currentMonthHolidays.length > 0) {
      holiday = currentMonthHolidays[0];
    }
    
    if (!holiday) return "/images/default-festival.jpg";
    
    const holidayName = holiday.name.toLowerCase();
    
    // Match holiday name with available images
    if (month === 'january') {
      if (holidayName.includes('bhogi')) return holidayImages.january.bhogi;
      if (holidayName.includes('pongal') || holidayName.includes('sankranti')) return holidayImages.january.pongal;
      if (holidayName.includes('republic')) return holidayImages.january.republic;
    } else if (month === 'february') {
      if (holidayName.includes('shivaratri')) return holidayImages.february.mahaShivaratri;
    } else if (month === 'march') {
      if(holidayName.includes('ugadi')) return holidayImages.march.ugadi;
      if (holidayName.includes('holi')) return holidayImages.march.holi;
      if (holidayName.includes('rama')) return holidayImages.march.ramaNavami;
    } else if (month === 'april') {
      if (holidayName.includes('rama')) return holidayImages.april.ramaNavami;
    } else if (month === 'may') {
      if (holidayName.includes('may day') || holidayName.includes('labor')) return holidayImages.may.laborDay;
    } else if (month === 'august') {
      if (holidayName.includes('independence')) return holidayImages.august.independenceDay;
    } else if (month === 'september') {
      if (holidayName.includes('vinayaka')) return holidayImages.september.vinayaka;
    } else if (month === 'october') {
      if (holidayName.includes('gandhi')) return holidayImages.october.gandhiJayanti;
      if (holidayName.includes('dussehra') || holidayName.includes('dasami') || holidayName.includes('vijaya')) return holidayImages.october.dussehra;
      if (holidayName.includes('deepavali') || holidayName.includes('diwali')) return holidayImages.october.deepavali;
    }
    
    return "/images/default-festival.jpg";
  };

  // Function to navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prevState => {
      const newDate = new Date(prevState);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
    setSelectedDate(null);
    setSelectedDateMessage('');
    setCurrentImageIndex(0);
  };

  // Function to navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prevState => {
      const newDate = new Date(prevState);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
    setSelectedDate(null);
    setSelectedDateMessage('');
    setCurrentImageIndex(0);
  };

  // Function to check if a date is a Sunday
  const isSunday = (date) => {
    return date.getDay() === 0;
  };

  // Function to check if a date is a second Saturday
  const isSecondSaturday = (date) => {
    return date.getDay() === 6 && Math.floor((date.getDate() - 1) / 7) === 1;
  };

  // Function to check if a date is today
  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  // Function to check if a date has holidays
  const getHolidaysForDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateString = `${date.getDate().toString().padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
    return holidays.filter(holiday => holiday.date === dateString);
  };
  
// Handle date click
const handleDateClick = (date) => {
  setSelectedDate(date);
  setCurrentImageIndex(0); // Reset image index when selecting a new date
  
  // Check if it's a Sunday
  if (isSunday(date)) {
    setSelectedDateMessage('It is Sunday!');
    return;
  }
  
  // Check if it's a Second Saturday
  if (isSecondSaturday(date)) {
    setSelectedDateMessage('It is Second Saturday!');
    return;
  }
  
  // Check for holidays
  const dateHolidays = getHolidaysForDate(date);
  if (dateHolidays.length > 0) {
    // Clear any previous message when clicking on a holiday date
    setSelectedDateMessage('');
  } else {
    setSelectedDateMessage('No holiday on this day');
  }
};

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const startingDayOfWeek = firstDay.getDay();
    
    // Total days in the month
    const totalDays = lastDay.getDate();
    
    // Array to hold all calendar days
    const days = [];
    
    // Add empty spaces for the days of the week before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: null,
        isCurrentMonth: false
      });
    }
    
    // Add current month's days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isHoliday: isSunday(date) || isSecondSaturday(date) || getHolidaysForDate(date).length > 0
      });
    }
    
    return days;
  };

  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

  return (
<div className="bg-white rounded-xl p-6 shadow-[0_12px_32px_rgba(0,0,0,0.2)] ring-1 ring-blue-100 border border-blue-300 h-auto">
      <div className="flex justify-between items-center mb-4 text-sm">
        <h2 className="font-semibold">HO HOLIDAY CALENDAR</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="text-blue-600 hover:bg-blue-100 p-2 rounded-full"
        >
          <IoCalendarOutline size={24} />
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Calendar Section */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4 text-xs"> {/* Reduced font size for the header */}
            <button onClick={prevMonth} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full">
              <IoChevronBack size={24} />
            </button>
            <h3 className="font-bold text-blue-800 text-sm"> {/* Reduced font size for the month-year heading */}
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button onClick={nextMonth} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full">
              <IoChevronForward size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-7 text-center text-xs"> {/* Reduced font size for the weekday labels */}
            <div className="font-semibold text-red-600">Sun</div>
            <div className="font-semibold">Mon</div>
            <div className="font-semibold">Tue</div>
            <div className="font-semibold">Wed</div>
            <div className="font-semibold">Thu</div>
            <div className="font-semibold">Fri</div>
            <div className="font-semibold">Sat</div>
            
            {generateCalendarDays().map((day, index) => (
              <div 
                key={index} 
                className={`
                  p-2 text-center 
                  ${!day.date ? 'invisible' : ''} 
                  ${day.date && day.date.getDay() === 0 ? 'text-red-600 font-semibold' : ''} 
                  ${day.date && isSecondSaturday(day.date) ? 'text-red-600 font-semibold' : ''} 
                  ${day.date && day.date.getDay() === 6 && !isSecondSaturday(day.date) ? 'text-black' : ''} 
                  ${day.date && isToday(day.date) ? 'bg-blue-100 rounded-full font-bold' : ''} 
                  ${day.date && selectedDate && day.date.toDateString() === selectedDate.toDateString() ? 'bg-green-200 rounded-full' : ''} 
                  ${day.date && getHolidaysForDate(day.date).length > 0 ? 'border border-green-500 rounded-full' : ''} 
                  ${day.date ? 'cursor-pointer hover:bg-gray-100' : ''}
                `}
                onClick={() => day.date && handleDateClick(day.date)}
              >
                {day.date ? day.date.getDate() : ''}
              </div>
            ))}
          </div>
        </div>
        
        {/* Holiday Display Section */}
        <div className="w-full lg:w-1/3 flex flex-col text-sm">
          {selectedDate ? (
            <>
              {selectedDateMessage && (
                <div className="text-red-600 font-bold text-right mb-2">
                  {selectedDateMessage}
                </div>
              )}
              
              {getHolidaysForDate(selectedDate).length > 0 && (
                <>
                  <div className="rounded-lg overflow-hidden mb-2 relative">
                    <img 
                      src={getFestivalImage(getHolidaysForDate(selectedDate)[currentImageIndex])} 
                      alt="Festival"
                      className="w-full h-32 object-cover transition-opacity duration-500"
                    />
                    {getHolidaysForDate(selectedDate).length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {currentImageIndex + 1} / {getHolidaysForDate(selectedDate).length}
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    {getHolidaysForDate(selectedDate).map((holiday, index) => (
                      <div key={index} className="mb-1">
                        <p className="text-xs">{index + 1}. {holiday.name}</p>
                        <p className="text-xxs text-gray-600">{holiday.date}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : currentMonthHolidays.length > 0 ? (
            <>
              <div className="rounded-lg overflow-hidden mb-2 relative">
                <img 
                  src={getFestivalImage(currentMonthHolidays[currentImageIndex])}
                  alt={currentMonthHolidays[currentImageIndex].name}
                  className="w-full h-32 object-cover transition-opacity duration-500"
                />
                {currentMonthHolidays.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {currentImageIndex + 1} / {currentMonthHolidays.length}
                  </div>
                )}
              </div>
              <div className="mt-2">
                {currentMonthHolidays.map((holiday, index) => (
                  <div key={index} className="mb-1">
                    <p className="text-xs">{index + 1}. {holiday.name}</p>
                    <p className="text-xxs text-gray-600">{holiday.date}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No holidays this month
            </div>
          )}
        </div>
      </div>

      {/* Holiday Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-center text-cyan-500">CIRCULAR</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose size={24} />
              </button>
            </div>
            
            <h3 className="text-center font-bold text-blue-800 mb-4">LIST OF HOLIDAYS FOR THE YEAR OF 2025</h3>
            
            <p className="mb-4 text-sm">
              List of holidays declared as paid Holidays for MHCPL and allied companies for the year 2025 as per TS shops establishments act,1988 and rules 1990 are as follows.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-cyan-200">
                    <th colSpan="4" className="py-1 px-2 text-center text-sm border border-gray-300">
                      HOLIDAYS FOR HEAD OFFICE
                    </th>
                  </tr>
                  <tr className="bg-red-200">
                    <th className="py-1 px-2 border text-sm border-gray-300">S.NO</th>
                    <th className="py-1 px-2 border text-sm border-gray-300">HOLIDAY</th>
                    <th className="py-1 px-2 border text-sm border-gray-300">DATE</th>
                    <th className="py-1 px-2 border text-sm border-gray-300">DAY</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((holiday, index) => (
                    <tr key={index}>
                      <td className="py-1 px-2  text-sm  border border-gray-300 text-center">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="py-1 px-2  text-sm border border-gray-300">{holiday.name}</td>
                      <td className="py-1 px-2  text-sm border border-gray-300">{holiday.date}</td>
                      <td className="py-1 px-2  text-sm border border-gray-300">{holiday.day}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p className="mt-4 font-semibold">NOTE: 2<sup>nd</sup> saturday of every month considered as holiday for HO.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;