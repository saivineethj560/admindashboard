import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { Button, CircularProgress } from "@mui/material";
import { ArrowBack, Business, Assignment, Person, Email, Work, School, TrendingUp, Groups, Description, Comment, CheckCircle, Close } from "@mui/icons-material";
import { API_BASE_URL } from "../Config";


function Manapp() {
  const navigate = useNavigate();
  const { case_id } = useParams();
  // const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
   const [userToken] = useState(() => {
      return JSON.parse(localStorage.getItem('userInfo')) || {};
    });
  const [attempted, setAttempted] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    plant: "",
    caseid: "",
    rdate: "",
    requestor: "",
    rmail_id: "",
    department: "",
    jobtype: "",
    recruitmentcycle: "",
    Position: "",
    qualf: "",
    exyear: "",
    hiringfor: "",
    reportingto: "",
    req_pers: "",
    tecskill: "",
    soft_skill: "",
    jdesc: "",
    uremarks: "",
    remarks: "",
    approve: "",
    hodremarks: "",
  });

  const [currentTask, setCurrentTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deptdesigndata, setDeptDesign] = useState({ empDept: '', empDesignation: '' });

  // useEffect(() => {
  //   const uid = userToken.Emp_Id;
  //   axios
  //     .get(`http://192.168.8.91:8084/inactive/phpapi/get_empdetails.php?uid=${uid}`)
  //     .then((res) => {
  //       if (res.data.status === "success") {
  //         const user = res.data.user;
  //         setDeptDesign({
  //           empDept: user.dept,
  //           empDesignation: user.designation
  //         });
  //       }
  //     })
  //     .catch((err) => {
  //       console.error("Failed to fetch user data", err);
  //     });
  // }, []);

  const manPowerData = { case_id: case_id };

  const manPowerCloseStatus = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to close the Manpower Status?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Close it!',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'px-4 py-2 rounded-lg',
        cancelButton: 'px-4 py-2 rounded-lg'
      }
    });
    if (result.isConfirmed) {
      try {
        const closeStatusResponse = await fetch(`${API_BASE_URL}manpowerClose`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${userToken.token}`,
          },
          body: JSON.stringify(manPowerData),
        });
        Swal.fire({
          title: 'Closed!',
          text: 'Manpower status has been closed.',
          icon: 'success',
          customClass: {
            popup: 'rounded-xl'
          }
        });
        navigate('/dashboard');
      } catch (err) {
        console.error('Error in updating the Manpower Close Status ------------', err);
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong while closing.',
          icon: 'error',
          customClass:
          {
            popup: 'rounded-xl'
          }
        });
      }
    }
  };

  // useEffect(() => {
  //   const fetchFormData = async () => {
  //     if (!case_id || !userToken.token) return;
  //     try {
  //       const response = await axios.get(`${API_BASE_URL}manpower-data/${case_id}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${userToken.token}`,
  //           },
  //         });
  //       if (response.data) {
  //         setFormData(prev => ({
  //           ...prev,
  //           ...response.data,
  //           caseid: response.data.CHILD_CASEID,
  //         }));

  //         if (response.data.CUR_TASK) {
  //           setCurrentTask(response.data.CUR_TASK);
  //         }
  //       }
  //     }
  //     catch (error) {
  //       console.error("Failed to fetch form data:", error);
  //     }
  //   };

  //   fetchFormData();
  // }, [case_id, userToken.token]);


  useEffect(() => {
  const fetchFormData = async () => {
    if (!case_id || !userToken.token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}manpower-data/${case_id}`, {
        headers: { Authorization: `Bearer ${userToken.token}` },
      });

      // Access the inner 'data' object from the API response
      const api = response.data.data || response.data;

      if (api) {
        setFormData({
          // Internal Keys : API Keys
          plant: api.PLANT,
          caseid: api.CHILD_CASEID,
          rdate: api.RAISER_DATE,
          requestor: api.RAISER,
          department: api.DEPT,
          jobtype: api.MANPOWER_DESG,
          recruitmentcycle: api.RECRUIT_CYCLE,
          Position: api.POSITION,
          qualf: api.EDUCATION,
          exyear: api.EXP,
          hiringfor: api.RECRUIT_FOR,
          Replacing_Emp: api.Replacing_Emp,
          reportingto: api.REPORTING,
          req_pers: api.NUM_REQUIRE,
          tecskill: api.TECH_SKILLS,
          soft_skill: api.SOFT_SKILLS,
          jdesc: api.JOB_DESC,
          uremarks: api.REMARKS,
          JOB_TIT: api.JOB_TIT,      // For the table
          REQ_BY_DT: api.REQ_BY_DT,  // For the table
          STATUS: api.STATUS,
          SP_STATUS: api.SP_STATUS,
          EVC_STATUS: api.EVC_STATUS,
          SP_REM: api.SP_REM,
          EVC_REM: api.EVC_REM,
          SP_NAME: api.SP_NAME,
          EVC_NAME: api.EVC_NAME,
        });

        if (api.CUR_TASK) {
          setCurrentTask(api.CUR_TASK);
        }
      }
    } catch (error) {
      console.error("Failed to fetch form data:", error);
    }
  };
  fetchFormData();
}, [case_id, userToken.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const getDynamicRemarksKey = (task) => {
    if (task && typeof task === "string" && task.trim() !== "") {
      return `${task.toLowerCase().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, '')}remarks`;
    }
    return "default_gm_remarks";
  };

  const remarksFieldKey = getDynamicRemarksKey(currentTask);

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [remarksFieldKey];
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    const action = e.nativeEvent.submitter.value;
    const isValid = validateForm();

    if (!isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please check all required fields.',
        customClass:
        {
          popup: 'rounded-xl'
        }
      });
      return;
    }

    let swalOptions =
    {
      title: 'Are you sure?',
      icon: 'question',
      showCloseButton: true,
      reverseButtons: true,
      customClass:
      {
        popup: 'rounded-xl',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white',
        cancelButton: 'bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg text-white',
        closeButton: 'text-gray-600 hover:text-gray-900 focus:outline-none'
      },
      buttonsStyling: false
    };

    if (action === "REVERT") {
      swalOptions.text = "Do you want to revert this request?";
      swalOptions.showCancelButton = false;
      swalOptions.confirmButtonText = "Yes, Revert";
    }
    else {
      swalOptions.text = "Do you want to approve this request?";
      swalOptions.showCancelButton = true;
      swalOptions.confirmButtonText = "Yes, Approve";
      swalOptions.cancelButtonText = "Cancel";
    }

    const result = await Swal.fire(swalOptions);
    let actionText = null;

    if (action === "REVERT") {
      if (result.isConfirmed) {
        actionText = "REVERT";
      } else if (result.dismiss === Swal.DismissReason.close) {
        console.log("Closed without reverting");
        return;
      }
    } else {
      if (result.isConfirmed) {
        actionText = "Approve";
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        actionText = "Reject";
      } else if (result.dismiss === Swal.DismissReason.close) {
        console.log("Closed without action");
        return;
      }
    }

    if (result.dismiss === Swal.DismissReason.close) {
      return;
    }

    if (action === "REVERT") {
      actionText = "REVERT";
    } else if (result.isConfirmed) {
      actionText = "Approve";
    } else {
      actionText = "Reject";
    }

    try {
      const payload =
      {
        case_id: case_id,
        [remarksFieldKey]: formData[remarksFieldKey],
        approve: actionText,
        user: userToken.token,
        cur_tas: currentTask,
        department: formData.DEPT,
        loc: formData.PLANT,
      };

      let endpoint;
      let role;

      switch (currentTask) {
        case "GM":
          role = "GM";
          endpoint = `manpower-gm-data/${case_id}`;
          break;
        case "PRJ_HEAD":
          role = "PRJ_HEAD";
          endpoint = `manpower-prj-data/${case_id}`;
          break;
        case "FUNC_HEAD":
          role = "FUNC_HEAD";
          endpoint = `manpower-func-data/${case_id}`;
          break;
        case "SP":
          role = "SP";
          endpoint = `manpower-sp-data/${case_id}`;
          break;
        case "EVC":
          role = "EVC";
          endpoint = `manpower-evc-data/${case_id}`;
          break;
        case "HOD":
          role = "HOD";
          endpoint = `manpower-hod-data/${case_id}`;
          break;
        default:
          role = "APPROVER";
          endpoint = `mrfRevertBack/${case_id}`;
      }

      const response = await axios.post(
        `${API_BASE_URL}${endpoint}`,
        payload,
        {
          headers:
          {
            Authorization: `Bearer ${userToken.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.statusText === "OK") {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `${role} ${actionText} Successfully`,
          customClass:
          {
            popup: 'rounded-xl'
          }
        });
        navigate('/StationaryList');
      }
      else {
        Swal.fire({
          icon: 'error',
          title: `${role} Failed to ${actionText}`,
          text: response.data?.message || 'Something went wrong on the server.',
          customClass: {
            popup: 'rounded-xl'
          }
        });
      }
    }
    catch (error) {
      console.error('Error submitting form:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Error',
        text: 'An error occurred while submitting the form.',
        customClass:
        {
          popup: 'rounded-xl'
        }
      });
    }
    finally {
      setIsLoading(false);
    }
  };

  const revertedSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    const isValid = validateForm();

    if (!isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please check all required fields.',
        customClass: {
          popup: 'rounded-2xl',
          title: 'text-gray-800',
          content: 'text-gray-600'
        }
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Submission',
      text: 'Do you want to raise the Manpower request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Submit',
      cancelButtonText: 'Cancel',
      customClass:
      {
        popup: 'rounded-2xl',
        title: 'text-gray-800',
        content: 'text-gray-600'
      }
    });

    if (!result.isConfirmed) return;

    const payload =
    {
      case_id: case_id,
      [remarksFieldKey]: formData[remarksFieldKey],
    };

    try {
      const response = await fetch(`${API_BASE_URL}mrfRevertedSubmit`,
        {
          method: "POST",
          headers:
          {
            'Content-Type': "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${userToken.token}`,
          },
          body: JSON.stringify(payload)
        });

      let responseData = await response.json();

      if (responseData.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'ManPower Request Raised Successfully',
          customClass: {
            popup: 'rounded-2xl',
            title: 'text-gray-800',
            content: 'text-gray-600'
          }
        });
        navigate('/participants');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Request Submission Failed',
          text: responseData.message || 'Something went wrong on the server.',
          customClass: {
            popup: 'rounded-2xl',
            title: 'text-gray-800',
            content: 'text-gray-600'
          }
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while submitting.',
        customClass: {
          popup: 'rounded-2xl'
        }
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getFieldClass = (fieldName) => {
    const baseClass = "w-full px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 transition";

    const isReadOnly =
      [
        'plant', 'CHILD_CASEID', 'rdate', 'requestor', 'rmail_id', 'department',
        'jobtype', 'recruitmentcycle', 'Position', 'qualf', 'exyear',
        'hiringfor','replaced_emp', 'reportingto', 'req_pers', 'tecskill', 'soft_skill',
        'jdesc', 'uremarks', 'hodremarks'
      ].includes(fieldName);

    const requiredFields = [remarksFieldKey, 'approve'];
    const hasError = (errors[fieldName] || (attempted && requiredFields.includes(fieldName) &&
      (!formData[fieldName] || formData[fieldName].trim() === ''))) && !isReadOnly;

    if (hasError) {
      return `${baseClass} border-red-500 focus:ring-red-500 bg-red-50`;
    }
    if (isReadOnly) {
      return `${baseClass} border-gray-200 bg-gray-50 text-gray-700 focus:ring-blue-500 cursor-not-allowed`;
    }
    return `${baseClass} border-gray-300 focus:ring-blue-500 focus:border-blue-400`;
  };

  return (
    <div className="min-h-screen px-2 py-2">
      <div className="max-w-6xl mx-auto overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-3 py-1.5 text-white">
          <div className="relative flex items-center justify-between">

            {/* LEFT : plant + case */}
            <div className="flex items-center">
              <div className="flex items-center text-[10px] text-blue-100">
                {/* <Business className="mr-0.5" style={{ fontSize: '12px' }} />
        <span>{formData.PLANT || 'Loading...'}</span>
        <span className="mx-1.5">•</span>
        <Assignment className="mr-0.5" style={{ fontSize: '12px' }} />
        <span>{formData.CHILD_CASEID || 'Loading...'}</span> */}
              </div>
            </div>

            {/* CENTER : title */}
            <h1 className="absolute font-semibold -translate-x-1/2 left-1/2 text-s whitespace-nowrap">
              Manpower Requisition Form
            </h1>

            {/* RIGHT : Task + Back button */}
            <div className="flex items-center gap-2">
              {formData.STATUS !== "Reverted" &&
                formData.STATUS === "TO_DO" &&
                currentTask && (
                  <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-medium">
                    Task: {currentTask}
                  </div>
                )}

              <button
                onClick={handleBack}
                className="p-1 transition-colors rounded bg-white/20 hover:bg-white/30"
                title="Go Back"
              >
                <ArrowBack className="text-white" style={{ fontSize: '20px' }} />
              </button>
            </div>

          </div>
        </div>

        <form onSubmit={currentTask === "RAISER" ? revertedSubmit : handleSubmit} className="p-3 space-y-2" noValidate>
          {/* Basic Information Card - Pastel Blue Background */}
          <div className="p-2 border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <h2 className="text-[10px] font-semibold text-gray-800 mb-1.5 flex items-center">
              <Person className="mr-0.5 text-blue-600" style={{ fontSize: '14px' }} />
              Basic Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Location</label>
                <input
                  type="text"
                  name="plant"
                  value={formData.plant }
                  readOnly
                  className={getFieldClass("plant")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Case ID</label>
                <input
                  type="text"
                  name="caseid"
                  value={formData.caseid}
                  readOnly
                  className={getFieldClass("caseid")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Date</label>
                <input
                  type="text"
                  name="rdate"
                  value={formData.rdate  ? new Date(formData.rdate ).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}
                  readOnly
                  className={getFieldClass("rdate")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Requestor..</label>
                <input
                  type="text"
                  name="requestor"
                  value={formData.requestor}
                  readOnly
                  className={getFieldClass("requestor")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  readOnly
                  className={getFieldClass("department")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.department}
                  readOnly
                  className={getFieldClass("department")}
                />
              </div>
            </div>
          </div>

          {/* Job Requisition Details Card - Pastel Green Background */}
          <div className="p-2 border border-gray-200 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <h2 className="text-[10px] font-semibold text-gray-800 mb-1.5 flex items-center">
              <Work className="mr-0.5 text-blue-600" style={{ fontSize: '14px' }} />
              Job Requisition Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5">
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Req Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  readOnly
                  className={getFieldClass("department")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Job Title</label>
                <input
                  type="text"
                  name="jobtype"
                  value={formData.jobtype}
                  readOnly
                  className={getFieldClass("jobtype")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Employee Level</label>
                <input
                  type="text"
                  name="recruitmentcycle"
                  value={formData.recruitmentcycle}
                  readOnly
                  className={getFieldClass("recruitmentcycle")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Employment Type</label>
                <input
                  type="text"
                  name="Position"
                  value={formData.Position}
                  readOnly
                  className={getFieldClass("Position")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Qualification</label>
                <input
                  type="text"
                  name="qualf"
                  value={formData.qualf}
                  readOnly
                  className={getFieldClass("qualf")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Experience (Years)</label>
                <input
                  type="text"
                  name="exyear"
                  value={formData.exyear}
                  readOnly
                  className={getFieldClass("exyear")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Hiring For</label>
                <input
                  type="text"
                  name="hiringfor"
                  value={formData.hiringfor}
                  readOnly
                  className={getFieldClass("hiringfor")}
                />
              </div>
              {/* ── NEW: only shown when hiring is for Replacement ── */}
  {formData.RECRUIT_FOR === "Replacement" && (
    <div>
      <label className="block text-[10px] font-medium text-black mb-0.5">Replacing Employee</label>
      <input
        type="text"
        name="replaced_emp"
        value={formData.Replacing_Emp || ""}
        readOnly
        className={getFieldClass("replaced_emp")}
      />
    </div>
  )}
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Reporting To</label>
                <input
                  type="text"
                  name="reportingto"
                  value={formData.reportingto}
                  readOnly
                  className={getFieldClass("reportingto")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Required Persons</label>
                <input
                  type="text"
                  name="req_pers"
                  value={formData.req_pers}
                  readOnly
                  className={getFieldClass("req_pers")}
                />
              </div>
            </div>
          </div>

          {/* Required Skills Card - Pastel Pink Background */}
          <div className="p-2 border border-gray-200 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
            <h2 className="text-[10px] font-semibold text-gray-800 mb-1.5 flex items-center">
              <TrendingUp className="mr-0.5 text-blue-600" style={{ fontSize: '14px' }} />
              Required Skills & Description
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Technical Skills</label>
                <textarea
                  name="tecskill"
                  value={formData.tecskill}
                  rows="2"
                  readOnly
                  className={getFieldClass("tecskill")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Soft Skills</label>
                <textarea
                  name="soft_skill"
                  value={formData.soft_skill}
                  rows="2"
                  readOnly
                  className={getFieldClass("soft_skill")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Job Description</label>
                <textarea
                  name="jdesc"
                  value={formData.jdesc}
                  rows="2"
                  readOnly
                  className={getFieldClass("jdesc")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">User Remarks</label>
                <textarea
                  name="uremarks"
                  value={formData.uremarks}
                  rows="2"
                  readOnly
                  className={getFieldClass("uremarks")}
                />
              </div>
            </div>
          </div>

          {/* HOD Remarks for EVC - Pastel Orange Background */}
          {currentTask === "EVC" && formData.hodremarks && (
            <div className="p-2 border border-gray-200 rounded bg-gradient-to-br from-orange-50 to-orange-100">
              <h2 className="text-[10px] font-semibold text-gray-800 mb-1.5 flex items-center">
                <Comment className="mr-0.5 text-blue-600" style={{ fontSize: '14px' }} />
                HOD Remarks (Previous Stage)
              </h2>
              <textarea
                name="hodremarks"
                value={formData.hodremarks}
                rows="2"
                readOnly
                className={getFieldClass("hodremarks")}
              />
            </div>
          )}

          {/* Revert Remarks — shown to RAISER when SP or EVC reverted */}
{currentTask === "RAISER" && (formData.SP_STATUS === "REVERT" || formData.EVC_STATUS === "REVERT") && (
  <div className="p-2 border border-red-200 rounded bg-gradient-to-br from-red-50 to-red-100">
    <h2 className="text-[10px] font-semibold text-gray-800 mb-1.5 flex items-center">
      <Comment className="mr-0.5 text-red-600" style={{ fontSize: '14px' }} />
      {formData.SP_STATUS === "REVERT" ? "SP Revert Remarks" : "EVC Revert Remarks"}
      <span className="ml-2 px-1.5 py-0.5 bg-red-200 text-red-700 rounded text-[9px] font-bold">
        REVERTED
      </span>
    </h2>
    <textarea
      value={
        formData.SP_STATUS === "REVERT"
          ? (formData.SP_REM || "No remarks provided")
          : (formData.EVC_REM || "No remarks provided")
      }
      rows="2"
      readOnly
      className="w-full px-2 py-1 text-xs text-red-800 bg-white border border-red-300 rounded cursor-not-allowed focus:outline-none"
    />
    <p className="text-[9px] text-red-500 mt-1">
      Reverted by:{" "}
      <span className="font-semibold">
        {formData.SP_STATUS === "REVERT" ? formData.SP_NAME : formData.EVC_NAME}
      </span>
    </p>
  </div>
)}

          {/* Job Requirement Details - Pastel Purple Background */}
          <div className="p-2 border border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <h2 className="text-[10px] font-semibold text-gray-800 mb-1.5 flex items-center">
              <Groups className="mr-0.5 text-blue-600" style={{ fontSize: '14px' }} />
              Job Requirement Details
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-white bg-gradient-to-r from-blue-500 to-blue-600">
                    <th className="px-2 py-1 text-left text-[10px] font-semibold rounded-tl-lg">SNO</th>
                    <th className="px-2 py-1 text-left text-[10px] font-semibold">Job Title</th>
                    <th className="px-2 py-1 text-left text-[10px] font-semibold rounded-tr-lg">Req By Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="transition-colors border-b border-gray-200 hover:bg-blue-50">
                    <td className="px-2 py-1 text-[10px] text-gray-700">1</td>
                    <td className="px-2 py-1 text-[10px] text-gray-700">{formData.JOB_TIT}</td>
                    <td className="px-2 py-1 text-[10px] text-gray-700">
                      {formData.REQ_BY_DT ? new Date(formData.REQ_BY_DT).toLocaleDateString("en-GB") : ""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Replace the existing button group with this */}
{/* <div className="flex justify-center gap-2 pt-1.5 border-t border-gray-200"> */}
  {/* Remarks Section - UNCOMMENTED AND ACTIVE */}
          {formData.STATUS !== "Reverted" && formData.STATUS === "TO_DO" && (
            <div className="p-2 border border-gray-200 rounded bg-gradient-to-br from-yellow-50 to-yellow-100">
              <h2 className="text-[10px] font-semibold text-gray-800 mb-1.5 flex items-center">
                <Description className="mr-0.5 text-blue-600" style={{ fontSize: '14px' }} />
                {currentTask ? `${currentTask} Remarks` : "Remarks"}
                <span className="ml-1 text-red-600">*</span>
              </h2>
              <textarea
                name={remarksFieldKey}
                value={formData[remarksFieldKey] || ""}
                onChange={handleChange}
                rows="2"
                required
                className={getFieldClass(remarksFieldKey)}
                placeholder={`Enter your remarks for ${currentTask} here...`}
              />
              {errors[remarksFieldKey] && attempted && (
                <p className="mt-0.5 text-[10px] text-red-600 flex items-center">
                  <Close className="mr-0.5 text-red-600" style={{ fontSize: '12px' }} />
                  Please enter remarks
                </p>
              )}
            </div>
          )}

          {/* Action Buttons Group */}
          <div className="flex justify-center gap-2 pt-1.5 border-t border-gray-200">
            {formData.STATUS === "Reverted" && formData.STATUS !== "TO_DO" ? (
              <Button
                onClick={manPowerCloseStatus}
                variant="outlined"
                color="secondary"
                size="small"
                className="px-3 py-0.5 text-[10px] rounded font-medium text-gray-700 border-gray-400 hover:bg-gray-100"
                startIcon={<Close style={{ fontSize: '14px' }} />}>
                Close Request
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  value="Submit"
                  disabled={isLoading || !formData.caseid}
                  className="px-3 py-0.5 text-[10px] rounded font-medium shadow-md"
                  style={{ backgroundColor: isLoading || !formData.caseid ? undefined : '#16a34a' }}
                  startIcon={isLoading ? <CircularProgress size={12} /> : <CheckCircle style={{ fontSize: '14px' }} />}>
                  {isLoading ? "Submitting..." : currentTask === "RAISER" ? "Submit" : "Approve"}
                </Button>

                {/* Reject Button */}
                {currentTask !== "RAISER" && (
                    <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    value="REJECT"
                    disabled={isLoading || !formData.caseid}
                    className="px-3 py-0.5 text-[10px] rounded font-medium shadow-md"
                    style={{ backgroundColor: isLoading || !formData.caseid ? undefined : '#dc2626' }}
                    startIcon={isLoading ? <CircularProgress size={12} /> : <Close style={{ fontSize: '14px' }} />}>
                    Reject
                    </Button>
                )}

                {/* Revert Button */}
                {(currentTask === "SP" || currentTask === "EVC") && (
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    value="REVERT"
                    disabled={isLoading || !formData.caseid}
                    className="px-3 py-0.5 text-[10px] rounded font-medium shadow-md"
                    style={{ backgroundColor: isLoading || !formData.caseid ? undefined : '#ea580c' }}
                    startIcon={isLoading ? <CircularProgress size={12} /> : <ArrowBack style={{ fontSize: '14px' }} />}>
                    Revert
                  </Button>
                )}
              </>
            )}
</div>

          {/* Remarks Section - Pastel Yellow Background */}
          {/* {formData.STATUS !== "Reverted" && formData.STATUS === "TO_DO" && (
            <div className="p-2 border border-gray-200 rounded bg-gradient-to-br from-yellow-50 to-yellow-100">
              <h2 className="text-[10px] font-semibold text-gray-800 mb-1.5 flex items-center">
                <Description className="mr-0.5 text-blue-600" style={{ fontSize: '14px' }} />
                {currentTask ? `${currentTask} Remarks` : "GM Remarks"}
                <span className="ml-1 text-red-600">*</span>
              </h2>
              <textarea
                name={remarksFieldKey}
                disabled={formData.STATUS === "Reverted"}
                value={formData[remarksFieldKey] || ""}
                onChange={handleChange}
                rows="2"
                required
                className={`${getFieldClass(remarksFieldKey)} ${formData.STATUS === "Reverted" ? "bg-gray-200 cursor-not-allowed" : ""}`}
                placeholder={`Enter your remarks for ${currentTask} here...`}
              />
              {errors[remarksFieldKey] && attempted && (
                <p className="mt-0.5 text-[10px] text-red-600 flex items-center">
                  <Close className="mr-0.5 text-red-600" style={{ fontSize: '12px' }} />
                  Please enter remarks
                </p>
              )}
            </div>
          )}

          <div className="flex justify-center gap-2 pt-1.5 border-t border-gray-200">
            {(formData.STATUS === "Reverted" && formData.STATUS !== "TO_DO") ? (
              <Button
                onClick={manPowerCloseStatus}
                variant="outlined"
                color="secondary"
                size="small"
                className="px-3 py-0.5 text-[10px] rounded font-medium text-gray-700 border-gray-400 hover:bg-gray-100"
                startIcon={<Close style={{ fontSize: '14px' }} />}>
                Close Request
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  value="Submit"
                  disabled={isLoading || !formData.caseid}
                  className="px-3 py-0.5 text-[10px] rounded font-medium shadow-md"
                  style={{ backgroundColor: isLoading || !formData.caseid ? undefined : '#16a34a' }}
                  startIcon={isLoading ? <CircularProgress size={12} /> : <CheckCircle style={{ fontSize: '14px' }} />}>
                  {isLoading ? "Submitting..." : currentTask === "RAISER" ? "Submit" : "Submit Approval"}
                </Button>
                {(currentTask === "SP" || currentTask === "EVC") && (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="small"
                    value="REVERT"
                    disabled={isLoading || !formData.caseid}
                    className="px-3 py-0.5 text-[10px] rounded font-medium shadow-md"
                    style={{ backgroundColor: isLoading || !formData.caseid ? undefined : '#ea580c' }}
                    startIcon={isLoading ? <CircularProgress size={12} /> : <Close style={{ fontSize: '14px' }} />}>
                    Revert
                  </Button>
                )}
              </>
            )}
          </div> */}
        </form>
      </div>
    </div>
  );
}

export default Manapp;