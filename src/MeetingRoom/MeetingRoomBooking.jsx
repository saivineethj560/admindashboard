import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config';

const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes();
    // Round to nearest 30-minute slot
    const roundedMinutes = minutes >= 30 ? '30' : '00';
    return `${hours}:${roundedMinutes}`;
};

const isTimeInPast = (timeString) => {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const timeToCheck = new Date();
    timeToCheck.setHours(hours, minutes, 0, 0);
    return timeToCheck <= now;
};

const getAvailableTimeSlots = (selectedDate) => {
    const allTimeSlots = [
        "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
        "16:30", "17:00", "17:30", "18:00", "18:30"
    ];

    const today = new Date();
    const selected = new Date(selectedDate);

    // If selected date is today, filter out past times
    if (selected.toDateString() === today.toDateString()) {
        return allTimeSlots.filter(time => !isTimeInPast(time));
    }

    // If it's a future date, return all slots
    return allTimeSlots;
};

const Swal = {
    fire: (options) => {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                    <div class="text-center">
                        ${options.icon === 'success' ? '<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4"><svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>' : ''}
                        ${options.icon === 'error' ? '<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"><svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>' : ''}
                        ${options.icon === 'warning' ? '<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4"><svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg></div>' : ''}
                        ${options.title ? `<h3 class="text-lg font-medium text-gray-900 mb-2">${options.title}</h3>` : ''}
                        ${options.text ? `<div class="text-sm text-gray-500 mb-4 whitespace-pre-line">${options.text}</div>` : ''}
                        <div class="flex justify-center space-x-3">
                            <button id="swal-confirm" class="font-medium py-2 px-4 rounded-md transition-colors" style="background-color: ${options.confirmButtonColor || '#3b82f6'}; color: white;">
                                ${options.confirmButtonText || 'OK'}
                            </button>
                            ${options.showCancelButton ? `
                                <button id="swal-cancel" class="font-medium py-2 px-4 rounded-md transition-colors" style="background-color: ${options.cancelButtonColor || '#6b7280'}; color: white;">
                                    ${options.cancelButtonText || 'Cancel'}
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>`;
            document.body.appendChild(modal);

            const confirmBtn = modal.querySelector('#swal-confirm');
            const cancelBtn = modal.querySelector('#swal-cancel');

            const closeModal = (isConfirmed) => {
                document.body.removeChild(modal);
                resolve({ isConfirmed });
            };

            confirmBtn.addEventListener('click', () => closeModal(true));
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => closeModal(false));
            }

            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(false);
            });
        });
    }
};

const MeetingRoomBookingForm = () => {
    const navigate = useNavigate();
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const [formData, setFormData] = useState({
        block: '',
        meetingRoom: '',
        attendees: '',
        date: getTodayDate(),
        fromTime: '',
        toTime: '',
        purpose: '',
        facilities: {
            water: false,
            teaCoffee: false,
            snacks: false,
            lunch: false
        },
        specialInstructions: '',
        requestedBy: '',
        department: '',
        bookedBy: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false); // New state for update process
    const [availabilityData, setAvailabilityData] = useState([]);
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isFieldsDisabled, setIsFieldsDisabled] = useState(false);
    const [originalBookingData, setOriginalBookingData] = useState(null);
    const [availableFromTimes, setAvailableFromTimes] = useState([]);
    const [availableToTimes, setAvailableToTimes] = useState([]);
    const [isCancelling, setIsCancelling] = useState(false);

    const [userToken, setToken] = useState(() => {
        return JSON.parse(localStorage.getItem("userInfo")) ? JSON.parse(localStorage.getItem("userInfo")) : null
    })

    const handleInputChange = async (e) => {
        const { name, value, type, checked } = e.target;


        if (type === 'checkbox') {

            setFormData(prev => ({
                ...prev,
                facilities: {
                    ...prev.facilities,
                    [name]: checked
                }
            }));
        } else {

            setFormData(prev => ({
                ...prev,
                [name]: value
            }));

            if (errors[name]) {
                setErrors(prev => ({
                    ...prev,
                    [name]: ''
                }));
            }

            // Check for invalid time selection immediately when fromTime is selected
            if (name === 'fromTime' && value && formData.date) {
                const selectedDate = new Date(formData.date);
                const today = new Date();

                // Check if selected date is today and time is in the past
                if (selectedDate.toDateString() === today.toDateString() && isTimeInPast(value)) {
                    await Swal.fire({
                        title: 'Invalid Time',
                        text: 'Cannot select past time slots for today.',
                        icon: 'warning',
                        confirmButtonText: 'OK'
                    });

                    // Reset the fromTime to empty
                    setFormData(prev => ({
                        ...prev,
                        fromTime: ''
                    }));
                    return;
                }
            }
            // Check for invalid toTime selection immediately
            if (name === 'toTime' && value && formData.fromTime) {
                // Check if toTime is not after fromTime
                if (value <= formData.fromTime) {
                    await Swal.fire({
                        title: 'Invalid Time Range',
                        text: 'End time must be after start time.',
                        icon: 'warning',
                        confirmButtonText: 'OK'
                    });

                    // Reset the toTime to empty
                    setFormData(prev => ({
                        ...prev,
                        toTime: ''
                    }));
                    return;
                }
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.block) {
            newErrors.block = 'Please select a block';
        }

        if (!formData.meetingRoom) {
            newErrors.meetingRoom = 'Please select a meeting room';
        }

        if (!formData.attendees) {
            newErrors.attendees = 'Please enter number of attendees';
        } else if (parseInt(formData.attendees) <= 0) {
            newErrors.attendees = 'Number of attendees must be greater than 0';
        } else if (formData.meetingRoom && parseInt(formData.attendees) > roomCapacities[formData.meetingRoom]) {
            newErrors.attendees = `Number of attendees exceeds room capacity (${roomCapacities[formData.meetingRoom]})`;
        }

        if (!formData.date) {
            newErrors.date = 'Please select a date';
        } else {
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.date = 'Date cannot be in the past';
            }
        }

        if (!formData.fromTime) {
            newErrors.fromTime = 'Please select start time'
        } else if (formData.date) {
            const selectedDate = new Date(formData.date);
            const today = new Date();

            // Check if selected date is today and time is in the past
            if (selectedDate.toDateString() === today.toDateString() && isTimeInPast(formData.fromTime)) {
                newErrors.fromTime = 'Start time cannot be in the past';
            }
        }

        if (!formData.toTime) {
            newErrors.toTime = 'Please select end time';
        } else if (formData.fromTime && formData.toTime <= formData.fromTime) {
            newErrors.toTime = 'End time must be after start time';
        }

        // Validate mandatory fields
        if (!formData.purpose || formData.purpose.trim() === '') {
            newErrors.purpose = 'Please enter booking purpose';
        }

        if (!formData.requestedBy || formData.requestedBy.trim() === '') {
            newErrors.requestedBy = 'Please enter requested by';
        }

        if (!formData.department || formData.department.trim() === '') {
            newErrors.department = 'Please enter department';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check authorization for edit mode
        if (isEditMode && !canUserEditOrCancel()) {
            await Swal.fire({
                title: 'Access Denied',
                text: 'Only the person who booked this meeting can edit or cancel it.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }

        // Additional time validation for today's bookings
        if (formData.date && formData.fromTime) {
            const selectedDate = new Date(formData.date);
            const today = new Date();

            if (selectedDate.toDateString() === today.toDateString() && isTimeInPast(formData.fromTime)) {
                await Swal.fire({
                    title: 'Invalid Time',
                    text: 'Cannot book meeting for past time slots.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                return;
            }
        }

        if (validateForm()) {
            if (formData.fromTime >= formData.toTime) {
                await Swal.fire({
                    title: 'Invalid Time Range',
                    text: 'From Time must be earlier than To Time.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                setIsSubmitting(false);
                return;
            }

            // Set the appropriate loading state
            if (isEditMode) {
                setIsUpdating(true);
            } else {
                setIsSubmitting(true);
            }

            try {
                // Step 1: Check availability (only for new bookings or if time/date changed)
                if (!isEditMode) {
                    const availabilityCheck = await fetch(`${API_BASE_URL}check-availability`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'Authorization': `Bearer ${userToken.token}`,
                        },
                        body: JSON.stringify({
                            date: formData.date,
                            block: formData.block,
                            room: formData.meetingRoom,
                            fromTime: formData.fromTime,
                            toTime: formData.toTime
                        })
                    });

                    const availabilityResult = await availabilityCheck.json();

                    if (!availabilityResult.available) {
                        let alertMessage = `${availabilityResult.message}\n\nConflicting bookings:\n`;
                        availabilityResult.conflicts.forEach((conflict, index) => {
                            alertMessage += `${index + 1}. ${conflict}\n`;
                        });

                        await Swal.fire({
                            title: 'Room Not Available',
                            text: alertMessage,
                            icon: 'warning',
                            confirmButtonText: 'OK'
                        });
                        setIsSubmitting(false);
                        return;
                    }
                }

                // Step 2: Prepare API data
                const apiData = {
                    BLOCK: formData.block,
                    MEETROOM: formData.meetingRoom,
                    NO_OF_ATTENDEES: parseInt(formData.attendees),
                    DATE: formData.date,
                    FROM_TIME: formData.fromTime,
                    TO_TIME: formData.toTime,
                    PURPOSE: formData.purpose || '',
                    FACILITIES: Object.entries(formData.facilities)
                        .filter(([_, value]) => value)
                        .map(([key]) => key)
                        .join(', ') || '',
                    INSTRUCTIONS: formData.specialInstructions || '',
                    REQUEST_BY: formData.requestedBy || '',
                    DEPARTMENT: formData.department || '',
                    BOOKED_BY: userToken.employee || userToken.name || userToken.email || 'Unknown User',
                };
                if (isEditMode) {
                    apiData.ORIGINAL_BOOKING = originalBookingData;
                    apiData.BOOKED_BY = userToken.employee || userToken.name || userToken.email || 'Unknown User';

                }
                // Step 3: Determine URL and method based on edit mode
                const url = isEditMode
                    ? `${API_BASE_URL}meeting-room-booking/update` // Update endpoint
                    : `${API_BASE_URL}meeting-room-booking`; // Create endpoint

                const method = 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${userToken.token}`,
                    },
                    body: JSON.stringify(apiData)
                });

                let result;
                try {
                    result = await response.json();

                    console.log(result, "hi");
                } catch {
                    const textResult = await response.text();
                    throw new Error('Invalid JSON response from server');
                }

                if (response.ok) {
                    await Swal.fire({
                        title: 'Success!',
                        text: isEditMode ? 'Meeting updated successfully!' : 'Meeting room booked successfully!',
                        icon: 'success',
                        confirmButtonText: 'OK!'
                    });
                    await fetchSchedule();

                    // Redirect back to dashboard or clear form
                    if (isEditMode) {
                        navigate('/MeetingDashboard');
                    } else {
                        // Reset form for new booking
                        setFormData({
                            block: '',
                            meetingRoom: '',
                            attendees: '',
                            date: getTodayDate(),
                            fromTime: '',
                            toTime: '',
                            purpose: '',
                            facilities: {
                                water: false,
                                teaCoffee: false,
                                snacks: false,
                                lunch: false
                            },
                            specialInstructions: '',
                            requestedBy: '',
                            department: ''
                        });
                    }
                } else {
                    if (result.errors) {
                        const newErrors = {};
                        Object.keys(result.errors).forEach(key => {
                            const formFieldMap = {
                                'BLOCK': 'block',
                                'MEETROOM': 'meetingRoom',
                                'NO_OF_ATTENDEES': 'attendees',
                                'DATE': 'date',
                                'FROM_TIME': 'fromTime',
                                'TO_TIME': 'toTime',
                                'PURPOSE': 'purpose',
                                'REQUEST_BY': 'requestedBy',
                                'DEPARTMENT': 'department'
                            };
                            const formField = formFieldMap[key] || key;
                            newErrors[formField] = result.errors[key][0];
                        });
                        setErrors(newErrors);

                        await Swal.fire({
                            title: 'Validation Error',
                            text: 'Please fix the validation errors and try again.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    } else {
                        await Swal.fire({
                            title: 'Error',
                            text: result.message || `Server error: ${response.status}`,
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                }
            } catch (error) {
                await Swal.fire({
                    title: 'Network Error',
                    text: `Network error: ${error.message}`,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            } finally {
                setIsSubmitting(false);
                setIsUpdating(false); // Reset update loading state
            }
        }
    };


    const handleBack = () => {
        navigate('/MeetingDashboard');
    };


    useEffect(() => {
        const checkRealTimeAvailability = async () => {
            // Check if all required fields are filled EXCEPT toTime
            if (formData.date && formData.block && formData.meetingRoom && formData.fromTime) {
                // Only proceed if toTime is also filled
                if (!formData.toTime) {
                    return; // Exit if toTime is not filled yet
                }

                // Skip check if in edit mode AND the booking details haven't changed from original
                if (isEditMode && originalBookingData) {
                    const isTimeSlotUnchanged =
                        formData.date === originalBookingData.DATE &&
                        formData.block === originalBookingData.BLOCK &&
                        formData.meetingRoom === originalBookingData.MEETROOM &&
                        formData.fromTime === originalBookingData.FROM_TIME &&
                        formData.toTime === originalBookingData.TO_TIME;

                    // If nothing changed, don't check availability
                    if (isTimeSlotUnchanged) {
                        return;
                    }
                }

                try {
                    const requestBody = {
                        date: formData.date,
                        block: formData.block,
                        room: formData.meetingRoom,
                        fromTime: formData.fromTime,
                        toTime: formData.toTime
                    };

                    // If in edit mode, include original booking data to exclude it from conflict check
                    if (isEditMode && originalBookingData) {
                        requestBody.excludeBooking = originalBookingData;
                    }

                    const response = await fetch(`${API_BASE_URL}check-availability`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'Authorization': `Bearer ${userToken.token}`,
                        },
                        body: JSON.stringify(requestBody)
                    });

                    const result = await response.json();

                    if (!result.available) {
                        let alertMessage = `${result.message}\n\nConflicting bookings:\n`;
                        result.conflicts.forEach((conflict, index) => {
                            alertMessage += `${index + 1}. ${conflict}\n`;
                        });

                        await Swal.fire({
                            title: 'Room Conflict Detected',
                            text: alertMessage,
                            icon: 'warning',
                            confirmButtonText: 'OK'
                        });
                    }
                } catch (error) {
                    console.error('Error checking availability:', error);
                }
            }
        };

        const timeoutId = setTimeout(checkRealTimeAvailability, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.date, formData.block, formData.meetingRoom, formData.fromTime, formData.toTime, isEditMode, originalBookingData]);

    // ✅ Move fetchSchedule outside to reuse it
    const fetchSchedule = async () => {
        setIsLoadingSchedule(true);
        try {
            const response = await fetch(`${API_BASE_URL}weekly-schedule`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken.token}`,
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setAvailabilityData(result.data); // ✅ This updates the week schedule
            } else {
                console.error('Failed to fetch weekly schedule:', result.message);
            }
        } catch (error) {
            console.error('Error fetching schedule:', error.message);
        } finally {
            setIsLoadingSchedule(false);
        }
    };

    // ✅ Call it on initial render
    useEffect(() => {
        fetchSchedule();
    }, []);


    const handleEdit = async () => {
        if (!canUserEditOrCancel()) {
            await Swal.fire({
                title: 'Access Denied',
                text: 'Only the person who booked this meeting can edit or cancel it.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }
        setIsFieldsDisabled(false);
    };

    const handleCancel = async () => {
        if (!canUserEditOrCancel()) {
            await Swal.fire({
                title: 'Access Denied',
                text: 'Only the person who booked this meeting can edit or cancel it.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }
        const result = await Swal.fire({
            title: 'Cancel Meeting',
            text: 'Are you sure you want to cancel the meeting?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            confirmButtonColor: '',
            cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed) {
            setIsCancelling(true);
            try {
                // Prepare the data for cancellation API
                const cancelData = {
                    BLOCK: formData.block,
                    MEETROOM: formData.meetingRoom,
                    DATE: formData.date,
                    FROM_TIME: formData.fromTime,
                    TO_TIME: formData.toTime
                };

                const response = await fetch(`${API_BASE_URL}meeting-room-booking/cancel`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${userToken.token}`,
                    },
                    body: JSON.stringify(cancelData)
                });

                const cancelResult = await response.json();

                if (response.ok && cancelResult.success) {
                    // Show success message
                    await Swal.fire({
                        title: 'Success!',
                        text: 'Meeting cancelled successfully!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                    await fetchSchedule();

                    // Redirect to meeting dashboard
                    navigate('/MeetingDashboard');
                } else {
                    // Handle API errors
                    await Swal.fire({
                        title: 'Error',
                        text: cancelResult.message || 'Failed to cancel meeting',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                // Handle network errors
                await Swal.fire({
                    title: 'Network Error',
                    text: `Failed to cancel meeting: ${error.message}`,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
            setIsCancelling(false);
        }
    };
    useEffect(() => {
        // Check if we're in edit mode and have pre-fill data
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');

        if (mode === 'edit') {
            setIsEditMode(true);
            setIsFieldsDisabled(true);

            const storedDataStr = localStorage.getItem('editMeetingData');

            if (storedDataStr) {
                try {
                    const meetingData = JSON.parse(storedDataStr);

                    setOriginalBookingData({
                        BLOCK: meetingData.block || meetingData.BLOCK,
                        MEETROOM: meetingData.meetroom || meetingData.MEETROOM,
                        DATE: meetingData.date || meetingData.DATE,
                        FROM_TIME: meetingData.fromTime || meetingData.FROM_TIME,
                        TO_TIME: meetingData.toTime || meetingData.TO_TIME
                    });

                    // Parse facilities string from API
                    const facilitiesString = meetingData.facilities || meetingData.FACILITIES || '';
                    const parseFacilities = (facilityStr) => {
                        if (!facilityStr) return { water: false, teaCoffee: false, snacks: false, lunch: false };

                        const str = facilityStr.toLowerCase().trim();
                        return {
                            water: str.includes('water'),
                            teaCoffee: str.includes('tea') || str.includes('coffee') || str.includes('teacoffee'),
                            snacks: str.includes('snacks'),
                            lunch: str.includes('lunch')
                        };
                    };

                    // Map the meeting data to match your form structure
                    setFormData({
                        block: meetingData.block || meetingData.BLOCK || '',
                        meetingRoom: meetingData.meetroom || meetingData.MEETROOM || '',
                        attendees: meetingData.noOfAttendees || meetingData.NO_OF_ATTENDEES || '',
                        date: meetingData.date || meetingData.DATE || getTodayDate(),
                        fromTime: meetingData.fromTime || meetingData.FROM_TIME || '',
                        toTime: meetingData.toTime || meetingData.TO_TIME || '',
                        purpose: meetingData.purpose || meetingData.PURPOSE || '',
                        facilities: parseFacilities(facilitiesString),
                        specialInstructions: meetingData.instructions || meetingData.INSTRUCTIONS || '',
                        requestedBy: meetingData.requestBy || meetingData.REQUEST_BY || '',
                        department: meetingData.department || meetingData.DEPARTMENT || '',
                        bookedBy: meetingData.bookedBy || meetingData.BOOKED_BY || ''
                    });

                    localStorage.removeItem('editMeetingData');

                } catch (error) {
                    console.error('Error parsing stored meeting data:', error);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (formData.date) {
            const availableTimes = getAvailableTimeSlots(formData.date);
            setAvailableFromTimes(availableTimes);

            // Update available "To" times based on selected "From" time
            if (formData.fromTime) {
                const fromIndex = availableTimes.indexOf(formData.fromTime);
                if (fromIndex !== -1) {
                    setAvailableToTimes(availableTimes.slice(fromIndex + 1));
                }
            } else {
                setAvailableToTimes(availableTimes);
            }
        }
    }, [formData.date]);

    useEffect(() => {
        if (formData.fromTime && formData.date) {
            const availableTimes = getAvailableTimeSlots(formData.date);
            const fromIndex = availableTimes.indexOf(formData.fromTime);
            if (fromIndex !== -1) {
                setAvailableToTimes(availableTimes.slice(fromIndex + 1));

                // Clear "To" time if it's no longer valid
                if (formData.toTime && availableTimes.slice(fromIndex + 1).indexOf(formData.toTime) === -1) {
                    setFormData(prev => ({ ...prev, toTime: '' }));
                }
            }
        }
    }, [formData.fromTime, formData.date]);

    const roomOptionsByBlock = {
        'Block 1': [
            'Meeting Room 1(Glass)',
            'Meeting Room 2(Glass)',
            'Old Conference Room',
            // 'New Conference Room',
            'Video Conference Room(New)'
        ],
        'Block 3': [
            'Conference Room 2'
        ],
        'Hyma': [
            'Mini Conference Room',
            'Main Conference Room'
        ]
    };

    const roomCapacities = {
        'Meeting Room 1(Glass)': 4,
        'Meeting Room 2(Glass)': 5,
        'Old Conference Room': 15,
        // 'New Conference Room': 15,
        'Video Conference Room(New)': 40,
        'Conference Room 2': 15,
        'Mini Conference Room': 15,
        'Main Conference Room': 30
    };
    const canUserEditOrCancel = () => {
        if (!userToken || !formData.bookedBy) return false;

        const loggedInUserEmail = userToken.email?.toLowerCase();
        const loggedInUserName = userToken.employee?.toLowerCase();
        const bookedBy = formData.bookedBy.toLowerCase();

        return (
            loggedInUserEmail === bookedBy ||
            loggedInUserName === bookedBy ||
            bookedBy.includes(loggedInUserEmail) ||
            bookedBy.includes(loggedInUserName)
        );
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
                    <span className="text-black-500">
                        {isEditMode ? 'EDIT MEETING ROOM BOOKING' : 'MEETING ROOMS AVAILABILITY'}
                    </span>
                </h1>
                <div className="w-20"></div>
            </div>

            {/* Main Content */}
            <div className="px-4 flex-1">
                <div className="bg-white rounded-3xl shadow-lg p-6 h-full">
                    <div className="grid grid-cols-12 gap-4 h-full">
                        {/* Left Column - Form */}
                        <div className="col-span-5 pr-2 h-full">
                            <div className="border-2 border-purple-500 rounded-lg p-4 bg-gray-50 shadow-lg h-full flex flex-col">
                                <div className="space-y-3 flex-1">

                                    {/* Block Selection */}
                                    <div className="grid grid-cols-4 gap-3 items-center">
                                        <label className="text-black font-medium text-left text-xs">
                                            Block <span className="text-red-500 text-base font-bold">*</span> :
                                        </label>
                                        <div className="col-span-3">
                                            <select
                                                name="block"
                                                value={formData.block}
                                                onChange={handleInputChange}
                                                disabled={isEditMode} // Always disabled in edit mode
                                                className={`w-full px-1.5 py-1.5 border-2 ${errors.block ? "border-red-500" : "border-purple-400"
                                                    } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs ${isEditMode ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                                required
                                            >
                                                <option value="">Select</option>
                                                <option value="Block 1">Block 1</option>
                                                <option value="Block 3">Block 3</option>
                                                <option value="Hyma">Hyma</option>
                                            </select>
                                            {errors.block && (
                                                <p className="text-red-500 text-xs mt-1">{errors.block}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Meeting Room Selection */}
                                    <div className="grid grid-cols-4 gap-3 items-center">
                                        <label className="text-black font-medium text-left text-xs">
                                            Meeting Room <span className="text-red-500 text-base font-bold">*</span>:
                                        </label>
                                        <div className="col-span-3">
                                            <select
                                                name="meetingRoom"
                                                value={formData.meetingRoom}
                                                onChange={handleInputChange}
                                                disabled={isEditMode} // Always disabled in edit mode
                                                className={`w-full px-1.5 py-1.5 border-2 ${errors.meetingRoom ? "border-red-500" : "border-purple-400"
                                                    } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs ${isEditMode ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                                required
                                            >
                                                <option value="">Select</option>
                                                {roomOptionsByBlock[formData.block]?.map((room) => (
                                                    <option key={room} value={room}>
                                                        {room}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.meetingRoom && (
                                                <p className="text-red-500 text-xs mt-1">{errors.meetingRoom}</p>
                                            )}
                                            {formData.meetingRoom && (
                                                <div className="text-left text-xs text-gray-600 mt-1">
                                                    Capacity:{" "}
                                                    <span className="font-medium text-gray-800">
                                                        {roomCapacities[formData.meetingRoom]}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Number of Attendees and Date - Side by Side */}
                                    <div className="grid grid-cols-8 gap-3 items-center">
                                        <label className="col-span-2 text-black font-medium text-left text-xs">
                                            No.of Attendees<span className="text-red-500 text-base font-bold">*</span>:
                                        </label>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                name="attendees"
                                                value={formData.attendees}
                                                onChange={handleInputChange}
                                                disabled={isFieldsDisabled}
                                                className={`w-full px-1.5 py-1.5 border-2 ${errors.attendees ? "border-red-500" : "border-purple-400"
                                                    } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs ${isFieldsDisabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                                required
                                                min="1"
                                            />
                                            {errors.attendees && (
                                                <p className="text-red-500 text-xs mt-1">{errors.attendees}</p>
                                            )}
                                        </div>
                                        <label className="col-span-2 text-black font-medium text-left text-xs">
                                            Date <span className="text-red-500 text-base font-bold">*</span>:
                                        </label>
                                        <div className="col-span-2">
                                            <input
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                disabled={isFieldsDisabled}
                                                min={getTodayDate()} // This prevents past dates
                                                className={`w-full px-1.5 py-1.5 border-2 ${errors.date ? "border-red-500" : "border-purple-400"
                                                    } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs ${isFieldsDisabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                                required
                                            />
                                            {errors.date && (
                                                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* From Time and To Time - Side by Side */}
                                    <div className="grid grid-cols-8 gap-3 items-center">
                                        <label className="col-span-2 text-black font-medium text-left text-xs">
                                            From Time <span className="text-red-500 text-base font-bold">*</span>:
                                        </label>
                                        <div className="col-span-2">
                                            <select
                                                name="fromTime"
                                                value={formData.fromTime}
                                                onChange={handleInputChange}
                                                disabled={isFieldsDisabled}
                                                className={`w-full px-1.5 py-1.5 border-2 ${errors.fromTime ? "border-red-500" : "border-purple-400"
                                                    } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs ${isFieldsDisabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                                required
                                            >
                                                <option value="">--select--</option>
                                                <option value="09:30">09:30</option>
                                                <option value="10:00">10:00</option>
                                                <option value="10:30">10:30</option>
                                                <option value="11:00">11:00</option>
                                                <option value="11:30">11:30</option>
                                                <option value="12:00">12:00</option>
                                                <option value="12:30">12:30</option>
                                                <option value="13:00">13:00</option>
                                                <option value="13:30">13:30</option>
                                                <option value="14:00">14:00</option>
                                                <option value="14:30">14:30</option>
                                                <option value="15:00">15:00</option>
                                                <option value="15:30">15:30</option>
                                                <option value="16:00">16:00</option>
                                                <option value="16:30">16:30</option>
                                                <option value="17:00">17:00</option>
                                                <option value="17:30">17:30</option>
                                                <option value="18:00">18:00</option>
                                                {availableFromTimes.map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                            {errors.fromTime && (
                                                <p className="text-red-500 text-xs mt-1">{errors.fromTime}</p>
                                            )}
                                        </div>
                                        <label className="col-span-2 text-black font-medium text-left text-xs">
                                            To Time <span className="text-red-500 text-base font-bold">*</span>:
                                        </label>
                                        <div className="col-span-2">
                                            <select
                                                name="toTime"
                                                value={formData.toTime}
                                                onChange={handleInputChange}
                                                disabled={isFieldsDisabled}
                                                className={`w-full px-1.5 py-1.5 border-2 ${errors.toTime ? "border-red-500" : "border-purple-400"
                                                    } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs ${isFieldsDisabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                                required
                                            >
                                                <option value="">--select--</option>
                                                <option value="09:30">09:30</option>
                                                <option value="10:00">10:00</option>
                                                <option value="10:30">10:30</option>
                                                <option value="11:00">11:00</option>
                                                <option value="11:30">11:30</option>
                                                <option value="12:00">12:00</option>
                                                <option value="12:30">12:30</option>
                                                <option value="13:00">13:00</option>
                                                <option value="13:30">13:30</option>
                                                <option value="14:00">14:00</option>
                                                <option value="14:30">14:30</option>
                                                <option value="15:00">15:00</option>
                                                <option value="15:30">15:30</option>
                                                <option value="16:00">16:00</option>
                                                <option value="16:30">16:30</option>
                                                <option value="17:00">17:00</option>
                                                <option value="17:30">17:30</option>
                                                <option value="18:00">18:00</option>
                                                {availableToTimes.map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                            {errors.toTime && (
                                                <p className="text-red-500 text-xs mt-1">{errors.toTime}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Booking Purpose */}
                                    <div className="grid grid-cols-4 gap-3 items-center">
                                        <label className="text-black font-medium text-left text-xs">
                                            Booking Purpose <span className="text-red-500 text-base font-bold">*</span>:
                                        </label>
                                        <div className="col-span-3">
                                            <input
                                                type="text"
                                                name="purpose"
                                                value={formData.purpose}
                                                onChange={handleInputChange}
                                                disabled={isFieldsDisabled}
                                                placeholder="Purpose"
                                                className={`w-full px-1.5 py-1.5 border-2 ${errors.purpose ? "border-red-500" : "border-purple-400"} rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs ${isFieldsDisabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                                required
                                            />
                                            {errors.purpose && (
                                                <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Facilities - All in one row */}
                                    <div className="grid grid-cols-4 gap-3 items-center">
                                        <label className="text-black font-medium text-left text-xs">
                                            Facilities:
                                        </label>
                                        <div className="col-span-3">
                                            <div className="flex flex-wrap gap-3">
                                                <label className="flex items-center space-x-1">
                                                    <input
                                                        type="checkbox"
                                                        name="water"
                                                        checked={formData.facilities.water || false}
                                                        onChange={handleInputChange}
                                                        disabled={isFieldsDisabled}
                                                        className="w-3 h-3 text-purple-600 bg-gray-100 border-purple-300 rounded focus:ring-purple-500 border-2"
                                                    />
                                                    <span className="text-black-700 text-xs">Water</span>
                                                </label>
                                                <label className="flex items-center space-x-1">
                                                    <input
                                                        type="checkbox"
                                                        name="teaCoffee"
                                                        checked={formData.facilities.teaCoffee || false}
                                                        onChange={handleInputChange}
                                                        disabled={isFieldsDisabled}
                                                        className="w-3 h-3 text-purple-600 bg-gray-100 border-purple-300 rounded focus:ring-purple-500 border-2"
                                                    />
                                                    <span className="text-black-700 text-xs">Tea/Coffee</span>
                                                </label>
                                                <label className="flex items-center space-x-1">
                                                    <input
                                                        type="checkbox"
                                                        name="snacks"
                                                        checked={formData.facilities.snacks || false}
                                                        onChange={handleInputChange}
                                                        disabled={isFieldsDisabled}
                                                        className="w-3 h-3 text-purple-600 bg-gray-100 border-purple-300 rounded focus:ring-purple-500 border-2"
                                                    />
                                                    <span className="text-black-700 text-xs">Snacks</span>
                                                </label>
                                                <label className="flex items-center space-x-1">
                                                    <input
                                                        type="checkbox"
                                                        name="lunch"
                                                        checked={formData.facilities.lunch || false}
                                                        onChange={handleInputChange}
                                                        disabled={isFieldsDisabled}
                                                        className="w-3 h-3 text-purple-600 bg-gray-100 border-purple-300 rounded focus:ring-purple-500 border-2"
                                                    />
                                                    <span className="text-black-700 text-xs">Lunch</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Special Instructions */}
                                    <div className="grid grid-cols-4 gap-3 items-center">
                                        <label className="text-black font-medium text-left text-xs">
                                            Special Instructions :
                                        </label>
                                        <input
                                            type="text"
                                            name="specialInstructions"
                                            value={formData.specialInstructions}
                                            onChange={handleInputChange}
                                            disabled={isFieldsDisabled}
                                            placeholder="Instructions"
                                            className={`col-span-3 px-1.5 py-1.5 border-2 border-purple-400 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs ${isFieldsDisabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                        />
                                    </div>

                                     {/* Requested By */}
                                    <div className="grid grid-cols-4 gap-3 items-center">
                                        <label className="text-black font-medium text-left text-xs">
                                            Requested Email<span className="text-red-500 text-base font-bold">*</span>:
                                        </label>
                                        <div className="col-span-3">
                                            <input
                                                type="email"
                                                name="requestedBy"
                                                value={formData.requestedBy}
                                                onChange={handleInputChange}
                                                disabled={isFieldsDisabled}
                                                placeholder="example@myhomeconstructions.com"
                                                className={`w-full px-1.5 py-1.5 border-2 ${errors.requestedBy ? "border-red-500" : "border-purple-400"} rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs ${isFieldsDisabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                                required
                                            />
                                            {errors.requestedBy && (
                                                <p className="text-red-500 text-xs mt-1">{errors.requestedBy}</p>
                                            )}
                                        </div>
                                    </div>
                                    {/* Department */}
                                    <div className="grid grid-cols-4 gap-3 items-center">
                                        <label className="text-black font-medium text-left text-xs">
                                            Department <span className="text-red-500 text-base font-bold">*</span>:
                                        </label>
                                        <div className="col-span-3">
                                            <input
                                                type="text"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                disabled={isFieldsDisabled}
                                                placeholder="Department"
                                                className={`w-full px-1.5 py-1.5 border-2 ${errors.department ? "border-red-500" : "border-purple-400"} rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs ${isFieldsDisabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                                required
                                            />
                                            {errors.department && (
                                                <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button - Centered */}
                                    <div className="mt-auto pt-4 flex justify-center">
                                        {isEditMode ? (
                                            <div className="flex space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={handleEdit}
                                                    disabled={isUpdating || isCancelling}
                                                    className={`${isUpdating || isCancelling
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                                        } text-white font-bold py-2 px-6 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg border-2 border-green-400 text-sm`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSubmit}
                                                    disabled={isSubmitting || isFieldsDisabled || isUpdating || isCancelling}
                                                    className={`${isFieldsDisabled || isUpdating || isCancelling
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                                                        } text-white font-bold py-2 px-6 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg border-2 border-purple-400 text-sm`}
                                                >
                                                    {isUpdating ? 'Updating...' : 'Update Meeting'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancel}
                                                    disabled={isUpdating || isCancelling}
                                                    className={`${isUpdating || isCancelling
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                                        } text-white font-bold py-2 px-6 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg border-2 border-red-400 text-sm`}
                                                >
                                                    {isCancelling ? 'Cancelling...' : 'Cancel'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-2 px-8 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg border-2 border-purple-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? 'Processing...' : 'Submit'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Availability Schedule */}
                        <div className="col-span-7 pl-2 h-full">
                            <div className="border-2 border-purple-500 rounded-lg overflow-hidden shadow-lg h-full flex flex-col">
                                <div className="bg-gray-50 p-2 border-b-2 border-purple-400 flex-shrink-0">
                                    <h3 className="text-center font-semibold text-gray-800 text-sm">Week Schedule</h3>
                                </div>

                                {/* Table Header - Fixed */}
                                <div className="bg-white border-b-2 border-purple-400 flex-shrink-0">
                                    {/* Block headers */}
                                    <div className="grid grid-cols-12 text-xs font-bold text-gray-800 bg-gray-100">
                                        <div className="col-span-2 p-2 border-r border-purple-300 text-center"></div>
                                        <div className="col-span-8 p-2 border-r border-purple-300 text-center border-b border-purple-300">Block 1</div>
                                        <div className="col-span-2 p-2 text-center border-b border-purple-300">Block 3</div>
                                    </div>

                                    {/* Room headers */}
                                    <div className="grid grid-cols-12 text-xs font-medium text-gray-700 bg-gray-50">
                                        <div className="col-span-2 p-2 border-r border-purple-300 text-center font-bold">Dates</div>
                                        <div className="col-span-2 p-2 border-r border-purple-300 text-center font-bold">Meeting Room 1(Glass)</div>
                                        <div className="col-span-2 p-2 border-r border-purple-300 text-center font-bold">Meeting Room 2(Glass)</div>
                                        <div className="col-span-2 p-2 border-r border-purple-300 text-center font-bold">Old Conference Room</div>
                                        <div className="col-span-2 p-2 border-r border-purple-300 text-center font-bold">Video Conference Room(New)</div>
                                        <div className="col-span-2 p-2 text-center font-bold">Conference Room 2</div>
                                    </div>
                                </div>

                                {/* Table Body - Fill remaining space */}
                                <div className="flex-1 bg-white overflow-auto">
                                    {isLoadingSchedule ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-gray-500 text-sm">Loading schedule...</div>
                                        </div>
                                    ) : (
                                        <div className="h-full">
                                            {availabilityData.map((row, index) => (
                                                row.day === 'Sunday' ? (
                                                    <div
                                                        key={index}
                                                        className="grid grid-cols-12 border-b border-purple-200 last:border-b-0 bg-gray-100 min-h-[35px]"
                                                    >
                                                        <div className="col-span-12 text-center text-purple-600 font-semibold text-sm flex items-center justify-center">
                                                            [{row.date}] Sunday – No bookings available
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div key={index} className="grid grid-cols-12 border-b border-purple-200 last:border-b-0 hover:bg-gray-50 min-h-[35px]">
                                                        <div className="col-span-2 p-1 border-r border-purple-300 text-xs text-center bg-gray-50 flex flex-col justify-center">
                                                            <div className="font-medium text-gray-800">{row.date}</div>
                                                            <div className="text-gray-500 text-xs">({row.day})</div>
                                                        </div>

                                                        {Object.entries(row.rooms)
                                                            .filter(([room]) => room !== 'New Conference Room')
                                                            .map(([room, booking], roomIndex) => (
                                                                <div
                                                                    key={roomIndex}
                                                                    className="col-span-2 p-1 border-r border-purple-300 last:border-r-0 text-xs text-center flex items-center justify-center"
                                                                >
                                                                    {booking ? (
                                                                        <div className="text-red-600 font-medium text-xs leading-tight">
                                                                            {booking}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-green-600 font-medium text-xs">Available</div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                    </div>
                                                )
                                            ))}

                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingRoomBookingForm;