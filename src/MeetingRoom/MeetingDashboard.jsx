
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROOM_GROUPS } from './RoomGroupsData';
import { API_BASE_URL } from '../Config';
import { IMAGE_PATH } from '../Config';

const MeetingDashboard = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [meetingDates, setMeetingDates] = useState(new Set());
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTimelineDate, setSelectedTimelineDate] = useState(new Date());

  // New state for weekly schedule
  const [weeklyScheduleData, setWeeklyScheduleData] = useState({});
const [selectedRoom, setSelectedRoom] = useState({ block: '', room: '' });
  const [scheduleLoading, setScheduleLoading] = useState(false); ``

  const getEmployeeName = () => {
    const token = JSON.parse(localStorage.getItem("userInfo")) || {
      employee: "", Emp_Id: "", token: ""
    };
    return token?.employee || "User";
  };
  const [userToken, setToken] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo")) ? JSON.parse(localStorage.getItem("userInfo")) : null
  })

  const employeeName = getEmployeeName();

   // ADD THIS FUNCTION - Back button handler ON 01.11.25
  const handleBack = () => {
    navigate('/dashboard');
  };

  const SlidingConferenceRooms = ({
    onRoomClick,
    selectedRoom,
    handleCreateBooking,
  }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const intervalRef = useRef();
    const pauseTimeoutRef = useRef();
    const roomGroups = ROOM_GROUPS;

    // Auto-slide logic—start and clear interval based on pause state
    useEffect(() => {
      if (!isPaused) {
        intervalRef.current = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % roomGroups.length);
        }, 6000);
      } else {
        clearInterval(intervalRef.current);
      }
      return () => clearInterval(intervalRef.current);
    }, [isPaused, roomGroups.length]);

    // Clean up pause timeout on unmount
    useEffect(() => {
      return () => clearTimeout(pauseTimeoutRef.current);
    }, []);

    // Pause and resume auto-sliding after a set time
    const pauseAndResume = (pauseMs = 3000) => {
      setIsPaused(true);
      clearInterval(intervalRef.current); // Stop auto-sliding immediately
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = setTimeout(() => {
        setIsPaused(false);
      }, pauseMs);
    };

    // Next slide button handler
    const nextSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % roomGroups.length);
      pauseAndResume();
    };

    // Room grid click: pause auto-slide, notify parent
    const handleRoomGridClick = (room) => {
      if (!room.isEmpty && onRoomClick) {
        pauseAndResume();
        onRoomClick(room);
      }
    };

    // Highlight logic for selected room
    const isRoomSelected = (room) =>
      selectedRoom?.block === room.number && selectedRoom?.room === room.apiRoom;

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Conference Rooms</h3>
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <button
                onClick={handleCreateBooking}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-transform duration-200 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Create</span>
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Book Here
              </div>
            </div>
            <button
              onClick={nextSlide}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sliding Grids */}
        <div className="relative overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {roomGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="w-full flex-shrink-0">
                <div className={`grid gap-3 ${groupIndex === 1 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"
                  }`}>
                  {group.map((room, roomIndex) => (
                    <div
                      key={`${groupIndex}-${roomIndex}`}
                      onClick={() => handleRoomGridClick(room)}
                      className={`
                      ${room.bgColor} rounded-xl p-3 relative text-center transition-all duration-300 ease-in-out hover:shadow-lg min-h-[80px]
                      ${!room.isEmpty
                          ? `cursor-pointer transform hover:scale-105 hover:z-10 border-2 ${isRoomSelected(room)
                            ? `${room.borderColor} border-4 shadow-lg`
                            : "border-transparent hover:border-gray-400"
                          }`
                          : "opacity-0 pointer-events-none"
                        }
                    `}
                    >
                      {!room.isEmpty && (
                        <div className="flex flex-col justify-center h-full">
                          <h4 className="font-bold text-gray-900 text-sm mb-1">{room.number}</h4>
                          <p className="text-xs text-gray-900 font-bold leading-tight">{room.location}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Slide Indicator */}
        <div className="mt-2 text-center flex items-center justify-center space-x-2">
          <span className="text-xs text-gray-500">
            {currentSlide + 1} of {roomGroups.length}
          </span>
        </div>
      </div>
    );
  };

  // Default homework items (fallback when no meetings today)
  const defaultHomeworkItems = [
    {
      title: "Block 1 - Old Conference Room",
      purpose: "N/A",
      requestedBy: "N/A",
      facilities: "N/A"
    },
    {
      title: "Block 1 - Video Conference Room(New)",
      purpose: "N/A",
      requestedBy: "N/A",
      facilities: "N/A"
    },
    {
      title: "Block 3 - Conference Room",
      purpose: "N/A",
      requestedBy: "N/A",
      facilities: "N/A"
    }
  ];

  // Calendar functions
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  // Get current week dates for timeline
  const getCurrentWeekDates = () => {
    const startOfWeek = new Date(selectedTimelineDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + 1; // Start from Monday
    startOfWeek.setDate(diff);

    const weekDates = [];
    for (let i = 0; i < 6; i++) { // Only 6 days: Mon to Sat
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getCurrentWeekDates();

  // Check if date is today
  const isDateToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isDateSelected = (date) => {
    return date.toDateString() === selectedTimelineDate.toDateString();
  };

  // Navigation functions for timeline
  const navigateWeek = (direction) => {
    const newDate = new Date(selectedTimelineDate);
    newDate.setDate(selectedTimelineDate.getDate() + (direction * 7));
    setSelectedTimelineDate(newDate);
  };

   // Check if navigation should be disabled (31 days limit)
  const canNavigateForward = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 31);
    
    const nextWeekDate = new Date(selectedTimelineDate);
    nextWeekDate.setDate(selectedTimelineDate.getDate() + 7);
    
    return nextWeekDate <= maxDate;
  };

  const canNavigateBackward = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const prevWeekDate = new Date(selectedTimelineDate);
    prevWeekDate.setDate(selectedTimelineDate.getDate() - 7);
    
    return prevWeekDate >= today;
  };

  // Fetch weekly room schedule from API
  const fetchWeeklyRoomSchedule = async (block, room) => {
    setScheduleLoading(true);

    const apiUrl = `${API_BASE_URL}weekly-room-schedule?block=${encodeURIComponent(block)}&room=${encodeURIComponent(room)}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setWeeklyScheduleData(data);
    } catch (err) {
      setWeeklyScheduleData({});
    } finally {
      setScheduleLoading(false);
    }
  };

  // Convert time string to 12-hour format for display
  const formatTimeForDisplay = (timeStr) => {
    if (!timeStr) return '';

    // Handle if it's already in HH:MM format
    const [hours, minutes] = timeStr.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';

    return `${hour12}:${minutes || '00'} ${ampm}`;
  };

  // Convert 12-hour display format back to 24-hour for comparison
  const convertDisplayTimeToSlot = (timeStr) => {
    if (!timeStr) return '';

    // Extract time and AM/PM
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);

    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    return `${hour24.toString().padStart(2, '0')}:${minutes || '30'}`;
  };

  // Convert time to minutes for easier calculation
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes back to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Calculate meeting duration in time slots (30-minute intervals)
  const calculateMeetingSpan = (startTime, endTime) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const durationMinutes = endMinutes - startMinutes;
    return Math.ceil(durationMinutes / 30); // Each slot is 30 minutes
  };

  // Get meeting data from API for a specific date and time
  const getMeetingDataFromAPI = (date, timeSlot) => {
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const dayMeetings = weeklyScheduleData[dateKey] || [];

    // Convert timeSlot to 24-hour format for comparison
    const slotTime24 = convertDisplayTimeToSlot(timeSlot);

    // Find meeting that starts at this time slot
    const meeting = dayMeetings.find(m => {
      const meetingTime = m.time; // This should be in HH:MM format from API
      return meetingTime === slotTime24;
    });

    return meeting ? {
      time: timeSlot,
      title: meeting.purpose || 'Meeting',
      color: getRandomMeetingColor(),
      fullData: meeting,
      span: meeting.toTime ? calculateMeetingSpan(meeting.time, meeting.toTime) : 1
    } : null;
  };

  // Check if current time slot is occupied by a meeting (for spanning)
  const isTimeSlotOccupied = (date, timeSlot) => {
    const dateKey = date.toISOString().split('T')[0];
    const dayMeetings = weeklyScheduleData[dateKey] || [];
    const slotTime24 = convertDisplayTimeToSlot(timeSlot);
    const slotMinutes = timeToMinutes(slotTime24);

    // Check if this time slot falls within any meeting's duration
    return dayMeetings.some(meeting => {
      const startMinutes = timeToMinutes(meeting.time);
      const endMinutes = meeting.toTime ? timeToMinutes(meeting.toTime) : startMinutes + 30;
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  // Get random color for meetings
  const getRandomMeetingColor = () => {
    const colors = ['bg-green-200', 'bg-blue-200', 'bg-yellow-200', 'bg-pink-200', 'bg-purple-200'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle room selection
  const handleRoomClick = (room) => {
    const newSelection = { block: room.number, room: room.apiRoom };
    setSelectedRoom(newSelection);
  };

  // API function to fetch meeting details
  const fetchMeetingDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}meeting-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const dates = new Set();

        result.data.forEach(meeting => {
          const meetingDate = meeting.DATE || meeting.date || meeting.meeting_date || meeting.start_date || meeting.created_at;

          if (meetingDate) {
            // Handle date string in YYYY-MM-DD format to avoid timezone issues
            if (typeof meetingDate === 'string' && meetingDate.match(/^\d{4}-\d{2}-\d{2}/)) {
              const [year, month, day] = meetingDate.split('-').map(num => parseInt(num));
              // month is 1-based in the string, but we need 0-based for comparison
              const dateKey = `${year}-${month - 1}-${day}`;
              dates.add(dateKey);
            } else {
              // Fallback for other date formats
              const date = new Date(meetingDate);
              if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = date.getMonth();
                const day = date.getDate();
                const dateKey = `${year}-${month}-${day}`;
                dates.add(dateKey);
              }
            }
          }
        });

        setMeetingDates(dates);
      }
    } catch (err) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  // Enhanced API function to fetch today's meetings
  const fetchTodayMeetings = async () => {
    setNotesLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}today-meetings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // Check if the response is successful
      if (result.success) {
        // Check if we have actual meeting data
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          setTodayMeetings(result.data);
          setError(null);
        } else {
          setTodayMeetings(defaultHomeworkItems);
          setError('No meetings scheduled for today');
        }
      } else {
        setTodayMeetings(defaultHomeworkItems);
        setError(result.message || 'API returned unsuccessful response');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
      setTodayMeetings(defaultHomeworkItems);
    } finally {
      setNotesLoading(false);
    }
  };

  // Fetch meeting details on component mount and when month changes
  useEffect(() => {
    fetchMeetingDetails();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  // Fetch today's meetings on component mount
  useEffect(() => {
    fetchTodayMeetings();
  }, []);

  // Fetch weekly schedule when selected room or timeline date changes
  useEffect(() => {
    if (selectedRoom.block && selectedRoom.room) {
      fetchWeeklyRoomSchedule(selectedRoom.block, selectedRoom.room);
    }
  }, [selectedRoom, selectedTimelineDate]);

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDaysArray = () => {
    const daysCount = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let day = 1; day <= daysCount; day++) {
      days.push(day);
    }
    return days;
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  // Check if a date has meetings
  const hasMeeting = (day) => {
    if (!day) return false;

    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    return meetingDates.has(dateKey);
  };

  // Get the appropriate styling for calendar dates
  const getDateStyling = (day) => {
    const todayCheck = isToday(day);
    const meetingCheck = hasMeeting(day);
    const selectedCheck = day === selectedDate;

    if (todayCheck && meetingCheck) {
      // Today has meetings: green background
      return 'bg-green-500 text-white shadow-sm';
    } else if (todayCheck) {
      // Today without meetings: blue background
      return 'bg-blue-500 text-white shadow-sm';
    } else if (selectedCheck) {
      // Selected date (not today)
      return 'bg-blue-100 text-blue-700';
    } else if (meetingCheck) {
      // Meeting date (not today)
      return 'bg-green-500 text-white shadow-sm';
    } else {
      // Regular date
      return 'text-gray-700 hover:bg-gray-200';
    }
  };

  const handleCreateBooking = () => {
    // Navigate to your Meeting Room Booking page
    navigate('/MeetingRoomBooking');
  };

  const formatTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleMeetingDoubleClick = (meeting, date) => {
    handleMeetingClick(meeting, date);
  };
  const handleMeetingClick = async (meeting, date) => {
    try {
      // Format the date for API call
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Convert display time back to 24-hour format for API
      const timeFor24Hour = convertDisplayTimeToSlot(meeting.time);

      // Prepare the parameters for the API call
      const params = new URLSearchParams({
        block: selectedRoom.block,
        room: selectedRoom.room,
        date: formattedDate,
        time: timeFor24Hour
      });

      // Fetch meeting details from API
      const response = await fetch(`${API_BASE_URL}meeting-details-for-edit?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Store the meeting details in localStorage or sessionStorage for the next page
        localStorage.setItem('editMeetingData', JSON.stringify(result.data));

        // Redirect to the meeting room booking page with edit mode
        navigate('/MeetingRoomBooking?mode=edit');

      } else {
        console.error('Failed to fetch meeting details:', result.message);
        alert('Failed to load meeting details. Please try again.');
      }

    } catch (error) {
      console.error('Error fetching meeting details:', error);
      alert('An error occurred while loading meeting details.');
    }
  };

  // const timeSlots = [
  //   "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  //   "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM",
  //   "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"
  // ];/
  const timeSlots = [
    "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
    "16:30", "17:00", "17:30", "18:00"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-blue-300">
      {/* Header with Meeting Rooms   Updated div with back btn on 01.11.25*/}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex-1"></div>
        <h1 className="text-lg font-semibold text-gray-800 flex-1 text-center">MEETING ROOMS BOOKING</h1>
        <div className="flex-1 flex justify-end">
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          {/* Welcome Section - Updated with dynamic employee name */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-2">Welcome back, {employeeName}!</h2>
              <p className="text-purple-100 mb-4"><b><i>``A good meeting room is the foundation of great collaboration``</i></b></p>
            </div>
            <div className="absolute top-4 right-4">
              <img
                src={`${IMAGE_PATH}/Meetroom.png`}
                alt="Logo"
                className="h-20 w-55 object-contain rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Conference Rooms */}
              <SlidingConferenceRooms
                onRoomClick={handleRoomClick}
                selectedRoom={selectedRoom}
                handleCreateBooking={handleCreateBooking}
              />
              {/* Enhanced My Schedule Timeline with Spanning Meetings */}
              <div>
                <div className="flex items-center justify-between mb-1">
  <h3 className="text-base font-semibold text-gray-800">
    Week Schedule
    {selectedRoom.block && selectedRoom.room && (
      <span className="ml-2">
      of {selectedRoom.block} - {selectedRoom.room}
      </span>
    )}
  </h3>
  <div className="flex items-center space-x-1">
    <button
                      onClick={() => navigateWeek(-1)}
                      /* added canNavigateBackward on 01.11.25 */
                      disabled={!canNavigateBackward()}
                      className={`p-1 rounded transition-colors ${
                        canNavigateBackward() 
                          ? 'hover:bg-gray-100 cursor-pointer' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      title={!canNavigateBackward() ? 'Cannot go before today' : 'Previous week'}
                    >
                      <ChevronLeft className="w-3 h-3 text-gray-600" />
                    </button>
    <span className="text-xs text-gray-600 font-medium">
      {selectedTimelineDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
    </span>
    <button
                      onClick={() => navigateWeek(1)}
                      /* added canNavigateForward on 01.11.25 */
                      disabled={!canNavigateForward()}
                      className={`p-1 rounded transition-colors ${
                        canNavigateForward() 
                          ? 'hover:bg-gray-100 cursor-pointer' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      title={!canNavigateForward() ? 'Maximum 31 days from today' : 'Next week'}
                    >
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                    </button>
  </div>
</div>

                {/* Enhanced Timeline Header with Dynamic Dates */}
                <div className="flex">
                  <div className="w-16"></div>
                  <div className="flex-1 grid grid-cols-6 text-center">
                    {weekDates.map((date, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer transition-all duration-200 rounded py-0.5 px-0.5 ${isDateToday(date)
                          ? 'bg-blue-500 text-white shadow-md'
                          : isDateSelected(date)
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                          }`}
                        onClick={() => setSelectedTimelineDate(date)}
                      >
                        <div className="text-xs font-medium">
                          {dayNamesShort[date.getDay()]}
                        </div>
                        <div className={`text-xs font-bold ${isDateToday(date) ? 'text-white' : 'text-gray-700'
                          }`}>
                          {date.getDate()}
                        </div>
                        {isDateToday(date) && (
                          <div className="text-xs text-blue-100">Today</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Grid with Spanning Meetings */}
                <div className="bg-gray-50 rounded-lg p-1">
                  {scheduleLoading && (
                    <div className="flex items-center justify-center py-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      <span className="ml-1 text-xs text-gray-600">Loading...</span>
                    </div>
                  )}

                  {/* Timeline Grid with Spanning Support */}
                  <div className="border border-gray-300 rounded overflow-hidden" style={{ border: '1px solid #d1d5db' }}>
                    {timeSlots.map((time, timeIndex) => (
                      <div key={timeIndex} className="flex items-stretch" style={{ borderBottom: timeIndex < timeSlots.length - 1 ? '1px solid #d1d5db' : 'none' }}>
                        {/* Time column with inline AM/PM */}
                        <div className="w-16 bg-gray-100 flex items-center justify-end pr-1" style={{ borderRight: '1px solid #d1d5db' }}>
                          <span className="text-xs text-gray-600 font-medium">
                            {/* {time.includes(':') ? `${time.split(' ')[0]} ${time.split(' ')[1]}` : time} */}
                            {time}
                          </span>
                        </div>
                        {/* Days grid */}
                        <div className="flex-1 grid grid-cols-6">
                          {weekDates.map((date, dayIndex) => {
                            const meeting = getMeetingDataFromAPI(date, time);
                            const isOccupied = isTimeSlotOccupied(date, time);
                            const isSelected = isDateSelected(date);

                            return (
                              <div
                                key={dayIndex}
                                className={`relative ${isSelected ? 'border-blue-300' : ''}`}
                                style={{
                                  height: '20px',
                                  borderRight: dayIndex < weekDates.length - 1 ? '1px solid #d1d5db' : 'none'
                                }}
                              >
                                {meeting ? (
                                  // Meeting starts here - render spanning block
                                  <div
                                    className={`${meeting.color} absolute inset-0 flex items-center justify-center font-medium text-gray-800 hover:shadow-md transition-shadow cursor-pointer rounded-sm`}
                                    style={{
                                      height: `${meeting.span * 20}px`,
                                      zIndex: 10,
                                      border: '1px solid #d1d5db'
                                    }}
                                    title={`${meeting.fullData.purpose} (${meeting.fullData.time} - ${meeting.fullData.toTime})`}
                                    onClick={() => handleMeetingClick(meeting, date)} // Single click to edit
                                  >
                                    <span className="truncate text-xs px-1 text-center hover:underline">
                                      {meeting.title}
                                    </span>
                                  </div>
                                ) : isOccupied && !meeting ? (
                                  // Time slot is occupied by a meeting that started earlier
                                  <div className="h-full bg-transparent"></div>
                                ) : (
                                  // Empty time slot
                                  <div className={`h-full transition-colors hover:bg-blue-50 cursor-pointer ${isSelected ? 'bg-blue-25' : 'bg-white'}`}></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Compact Footer */}
                  <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                    <span>09:30 - 18:00</span>
                    <span className="text-blue-600">
                      {Object.keys(weeklyScheduleData).length} meetings
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Compact Working Calendar */}
              <div className="bg-gradient-to-br from-yellow-100 via-purple-100 to-blue-100 p-3 rounded-xl">
                {/* Header: Month & Navigation */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h3>
                  <div className="flex space-x-1">
                    <button onClick={() => navigateMonth(-1)} className="p-1 rounded hover:bg-gray-200">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={() => navigateMonth(1)} className="p-1 rounded hover:bg-gray-200">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-gray-50 rounded-lg p-2">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                      <div key={idx} className="text-center text-xs font-semibold text-white bg-blue-500 rounded">{day}</div>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysArray().map((day, idx) => (
                      <div key={idx} className="h-6 flex items-center justify-center">
                        {day && (
                          <button
                            onClick={() => setSelectedDate(day)}
                            className={`w-6 h-6 text-xs rounded font-medium relative ${getDateStyling(day)}`}
                          >
                            {day}
                            {(() => {
                              const today = isToday(day);
                              const meeting = hasMeeting(day);
                              // Only show dot for current date (today)
                              if (today && meeting) {
                                return <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 rounded-full border border-white"></div>;
                              }
                              return null; // No dots for other dates
                            })()}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center mt-2 space-x-3 text-[10px] text-gray-600">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded"></div>
                      <span>Today</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded"></div>
                      <span>Meetings</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section - Cleaned */}
              <div className="bg-gradient-to-br from-yellow-100 via-purple-100 to-blue-100 p-4 rounded-2xl shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <img src={`${IMAGE_PATH}/Notes1.png`} alt="Notes Icon" className="w-6 h-6" />
                  Today's Meetings
                </h3>
                <div className="text-xs text-gray-600 mb-4 font-medium">
                  {formatTodayDate()}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-xs text-red-600">
                      {error}
                    </div>
                  </div>
                )}

                {notesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading meetings...</span>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                    {todayMeetings.length > 0 ? (
                      todayMeetings.map((item, index) => (
                        <div key={index} className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 text-sm mb-2">{item.title}</h4>
                              {item.time && (
                                <p className="text-xs text-blue-600 mb-2 font-semibold">{item.time}</p>
                              )}
                              <div className="space-y-1">
                                <p className="text-xs text-gray-600"><span className="font-bold">Purpose:</span> {item.purpose}</p>
                                <p className="text-xs text-gray-600"><span className="font-bold">Requested by:</span> {item.requestedBy}</p>
                                <p className="text-xs text-gray-600"><span className="font-bold">Facilities:</span> {item.facilities}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <div className="text-gray-500 text-sm">
                          <p className="mb-2">🗓️ No meetings scheduled for today</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Refresh Button */}
                <div className="mt-4 text-center">
                  <button
                    onClick={fetchTodayMeetings}
                    disabled={notesLoading}
                    className="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {notesLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingDashboard;