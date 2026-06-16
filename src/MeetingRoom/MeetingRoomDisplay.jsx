import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const MeetingRoomDisplay = () => {
    const [formData, setFormData] = useState({
        block: '',
        meetingRoom: '',
        date: ''
    });
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Get current month's date range (strictly current month only)
    const getCurrentMonthRange = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const date = now.getDate();
        
        // Start from today's date (July 1, 2025)
        const today = new Date(year, month, date);
        const lastDay = new Date(year, month + 1, 0);
        
        // Use today as both minimum and reference point
        return {
            min: today.toISOString().split('T')[0],
            max: lastDay.toISOString().split('T')[0],
            currentMonth: month,
            currentYear: year
        };
    };

    const dateRange = getCurrentMonthRange();

    // Sample data for dropdowns (you can replace with API calls)
    const blocks = ['Block 1', 'Block 3', 'Hyma'];
    const meetingRooms = {
        'Block 1': [
            'Meeting Room 1(Glass)',
            'Meeting Room 2(Glass)',
            'Old Conference Room',
            'Video Conference Room(New)'
        ],
        'Block 3': [
            'Conference Room 2'
        ],
        'Hyma':[
            'Mini Conference Room',
            'Main Conference Room'
        ]
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
            // Reset meeting room if block changes
            ...(field === 'block' && { meetingRoom: '' })
        }));
    };

    const handleCheck = async () => {
        if (!formData.block || !formData.meetingRoom || !formData.date) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/meetings/filter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    block: formData.block,
                    meetroom: formData.meetingRoom,
                    date: formData.date
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                setMeetings(data.data || []);
            } else {
                setError(data.message || 'Failed to fetch meeting details');
                setMeetings([]);
            }

        } catch (err) {
            console.error('Error fetching meetings:', err);
            setError('Failed to fetch meeting details. Please check your connection.');
            setMeetings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        window.history.back();
    };

    const handleModifyCancel = async (meeting, action) => {
        if (action === 'Cancel') {
            const confirmed = window.confirm('Are you sure you want to cancel this meeting?');
            if (!confirmed) return;

            try {
                setLoading(true);
                const response = await fetch(`http://127.0.0.1:8000/api/meetings/cancel`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        block: meeting.BLOCK,
                        meetroom: meeting.MEETROOM,
                        date: meeting.DATE,
                        from_time: meeting.FROM_TIME,
                        to_time: meeting.TO_TIME,
                        request_by: meeting.REQUEST_BY
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    // Update the meetings list to reflect the cancelled status
                    setMeetings(prevMeetings => 
                        prevMeetings.map(m => 
                            m.BLOCK === meeting.BLOCK && 
                            m.MEETROOM === meeting.MEETROOM && 
                            m.DATE === meeting.DATE && 
                            m.FROM_TIME === meeting.FROM_TIME &&
                            m.TO_TIME === meeting.TO_TIME &&
                            m.REQUEST_BY === meeting.REQUEST_BY
                                ? { ...m, STATUS: 'Cancelled' }
                                : m
                        )
                    );
                    alert('Meeting cancelled successfully');
                } else {
                    alert(data.message || 'Failed to cancel meeting');
                }
            } catch (error) {
                console.error('Error cancelling meeting:', error);
                alert('Failed to cancel meeting. Please try again.');
            } finally {
                setLoading(false);
            }
        } else if (action === 'Modify') {
            // Redirect to MeetingRoomBooking page with pre-filled data
            const queryParams = new URLSearchParams({
                mode: 'modify',
                block: meeting.BLOCK || '',
                meetingRoom: meeting.MEETROOM || '',
                date: meeting.DATE || '',
                fromTime: meeting.FROM_TIME || '',
                toTime: meeting.TO_TIME || '',
                requestBy: meeting.REQUEST_BY || '',
                department: meeting.DEPARTMENT || '',
                purpose: meeting.PURPOSE || '',
                attendees: meeting.NO_OF_ATTENDEES || '',
                // Add any other fields that might be needed
                originalDate: meeting.DATE, // Keep original for update reference
                originalFromTime: meeting.FROM_TIME,
                originalToTime: meeting.TO_TIME,
                originalRequestBy: meeting.REQUEST_BY
            });

            // Navigate to MeetingRoomBooking page with query parameters
            window.location.href = `/myhomedashboard/MeetingRoomBooking?${queryParams.toString()}`;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        
        // Handle different time formats
        if (timeString.includes(':')) {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minutes} ${period}`;
        }
        
        return timeString;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-blue-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <button
                    onClick={handleBack}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-full shadow-lg border-2 border-purple-400 transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back</span>
                </button>
                <h1 className="text-base font-semibold text-gray-800 flex items-center space-x-2">
                    <span className="text-black font-bold">MEETING ROOMS BOOKED STATUS</span>
                </h1>
                <div className="w-20"></div>
            </div>

            {/* Main Content */}
            <div className="px-4 flex-1">
                <div className="bg-white rounded-3xl shadow-lg p-6 h-full flex flex-col">
                    {/* Search Form */}
                    <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            {/* Block Selection */}
                            <div className="flex items-center space-x-2 min-w-fit">
                                <label className="text-sm font-bold text-gray-700 whitespace-nowrap min-w-fit">
                                    Block:
                                </label>
                                <select
                                    value={formData.block}
                                    onChange={(e) => handleInputChange('block', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors min-w-32"
                                >
                                    <option value="">Select Block</option>
                                    {blocks.map(block => (
                                        <option key={block} value={block}>{block}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Meeting Room Selection */}
                            <div className="flex items-center space-x-2 min-w-fit">
                                <label className="text-sm font-bold text-gray-700 whitespace-nowrap min-w-fit">
                                    Meeting Room:
                                </label>
                                <select
                                    value={formData.meetingRoom}
                                    onChange={(e) => handleInputChange('meetingRoom', e.target.value)}
                                    disabled={!formData.block}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:bg-gray-100 min-w-48"
                                >
                                    <option value="">Select Meeting Room</option>
                                    {formData.block && meetingRooms[formData.block]?.map(room => (
                                        <option key={room} value={room}>{room}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Selection - Strictly Current Month Only */}
                            <div className="flex items-center space-x-2 min-w-fit">
                                <label className="text-sm font-bold text-gray-700 whitespace-nowrap min-w-fit">
                                    Date:
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    min={dateRange.min}
                                    max={dateRange.max}
                                    onChange={(e) => {
                                        const selectedDate = e.target.value;
                                        const selectedDateObj = new Date(selectedDate + 'T00:00:00');
                                        
                                        // Strict validation - only allow current month dates
                                        if (selectedDateObj.getMonth() === dateRange.currentMonth && 
                                            selectedDateObj.getFullYear() === dateRange.currentYear &&
                                            selectedDate >= dateRange.min &&
                                            selectedDate <= dateRange.max) {
                                            handleInputChange('date', selectedDate);
                                            // Clear any previous error
                                            if (error.includes('date')) {
                                                setError('');
                                            }
                                        } else {
                                            // Reset to empty and show error
                                            handleInputChange('date', '');
                                            setError('Please select a date from July 2025 only (today onwards)');
                                        }
                                    }}
                                    onBlur={(e) => {
                                        // Additional validation on blur
                                        const selectedDate = e.target.value;
                                        if (selectedDate) {
                                            const selectedDateObj = new Date(selectedDate + 'T00:00:00');
                                            if (selectedDateObj.getMonth() !== dateRange.currentMonth || 
                                                selectedDateObj.getFullYear() !== dateRange.currentYear) {
                                                handleInputChange('date', '');
                                                setError('Invalid date selection. Please choose from July 2025 only.');
                                            }
                                        }
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors min-w-fit"
                                    title={`Select a date from July 1, 2025 to July 31, 2025 only`}
                                />
                            </div>

                            {/* Check Button */}
                            <div className="flex justify-center min-w-fit">
                                <button
                                    onClick={handleCheck}
                                    disabled={loading}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Checking...' : 'Check'}
                                </button>
                            </div>
                        </div>

                        {/* Date Range Info */}
                        {error && (
                            <div className="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Results Table */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {meetings.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Bookings for {formData.block} - {formData.meetingRoom} on {formatDate(formData.date)}
                                </h3>
                                <div className="text-sm text-gray-600">
                                    Found {meetings.length} booking{meetings.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                            </div>
                        ) : meetings.length > 0 ? (
                            <div className="flex-1 overflow-auto">
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Meeting Room</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Booked By</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Booking Purpose</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Attendees</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Modify</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Cancel</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {meetings.map((meeting, index) => (
                                                <tr key={`${meeting.BLOCK}-${meeting.MEETROOM}-${meeting.DATE}-${meeting.FROM_TIME}-${index}`} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${meeting.STATUS === 'Cancelled' ? 'opacity-60 bg-red-50' : ''}`}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {formatDate(meeting.DATE)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {meeting.MEETROOM}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {formatTime(meeting.FROM_TIME)} - {formatTime(meeting.TO_TIME)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        <div>
                                                            <div className="font-medium">{meeting.REQUEST_BY}</div>
                                                            <div className="text-gray-500 text-xs">{meeting.DEPARTMENT}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        <div className="flex items-center space-x-2">
                                                            <span>{meeting.PURPOSE}</span>
                                                            {meeting.STATUS === 'Cancelled' && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                    Cancelled
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {meeting.NO_OF_ATTENDEES}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <button
                                                            onClick={() => handleModifyCancel(meeting, 'Modify')}
                                                            disabled={meeting.STATUS === 'Cancelled'}
                                                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                        >
                                                            Modify
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <button
                                                            onClick={() => handleModifyCancel(meeting, 'Cancel')}
                                                            disabled={meeting.STATUS === 'Cancelled'}
                                                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                        >
                                                            {meeting.STATUS === 'Cancelled' ? 'Cancelled' : 'Cancel'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <div className="text-center">
                                    <p className="text-lg font-medium">No bookings found</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingRoomDisplay;