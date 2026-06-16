import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import CurrentDateField from "./CurrentDateField";
import { Typography, Button, CircularProgress, } from "@mui/material";
import { ArrowLeftIcon, BriefcaseIcon, CalendarCheck, CalendarCheck2, CalendarIcon, CheckCircleIcon, UserIcon } from "lucide-react";
import { AcademicCapIcon, BuildingOfficeIcon, DocumentTextIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from "../Config";

function ManPowerView({ caseId }) {

  const navigate = useNavigate();
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const [attempted, setAttempted] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentTask, setCurrentTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
  const [showPopup, setShowPopup] = useState(true);
  const [modalType, setModalType] = useState("");
  const [deptdesigndata, setDeptDesign] = useState({ empDept: '', empDesignation: '' });

  useEffect(() => {
    const uid = userToken.Emp_Id;
    axios
      .get(
        `http://192.168.8.91:8084/inactive/phpapi/get_empdetails.php?uid=${uid}`
      )
      .then((res) => {
        if (res.data.status === "success") {
          const user = res.data.user;
          setDeptDesign(
            {
              empDept: user.dept,
              empDesignation: user.designation
            }
          )
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user data", err);
      });
  }, []);

  const manPowerCloseStatus = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to close the Manpower Status?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Close it!',
    });

    if (result.isConfirmed) {
      try {
        const closeStatusResponse = await fetch(`${API_BASE_URL}manpowerClose`,
          {
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
        });
        navigate('/dashboard');
      } catch (err) {
        console.error('Error in updating the Manpower Close Status ------------', err);
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong while closing.',
          icon: 'error',
        });
      }
    }
  };

  useEffect(() => {
    const fetchFormData = async () => {
      if (!caseId || !userToken.token) return;
      try {
        const response = await axios.get(`${API_BASE_URL}manpower-data/${caseId}`, {
          headers:
          {
            Authorization: `Bearer ${userToken.token}`,
          },
        });
        console.log("Fetched formData:", response.data);
        console.log("API said CUR_TASK =", response.data.CUR_TASK);
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            ...response.data,
            caseid: response.data.CHILD_CASEID,
          }));
          if (response.data.CUR_TASK) {
            setCurrentTask(response.data.CUR_TASK);
          }
        }
      }
      catch (error) {
        console.error("Failed to fetch form data:", error);
      }
    };

    fetchFormData();
  }, [caseId, userToken.token]);

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

  const getFieldClass = (fieldName) => {
    const baseClass = `w-full px-2.5 py-1.5 text-xs border rounded-md transition-all duration-200
      focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-500
      placeholder:text-gray-400 hover:border-gray-400`;

    const requiredFields = [remarksFieldKey, 'approve'];
    const isReadOnly = [
      'plant', 'caseid', 'rdate', 'requestor', 'rmail_id', 'department',
      'jobtype', 'recruitmentcycle', 'Position', 'qualf', 'exyear',
      'hiringfor', 'reportingto', 'req_pers', 'tecskill', 'soft_skill',
      'jdesc', 'uremarks', 'hodremarks'
    ].includes(fieldName);

    const hasError = (errors[fieldName] || (attempted && requiredFields.includes(fieldName) &&
      (!formData[fieldName] || formData[fieldName].trim() === ''))) && !isReadOnly;

    if (hasError) {
      return `${baseClass} border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-500`;
    }
    if (isReadOnly) {
      return `${baseClass} bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed`;
    }
    return `${baseClass} border-gray-200`;
  };

  // Custom Date Field component to match other fields
  const CustomDateField = () => {
    return (
      <div>
        <label className="flex items-center block gap-1 mb-1 text-xs font-semibold text-gray-700">
          <CalendarIcon className="w-3 h-3" />
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="rdate"
          value={formData.rdate || new Date().toLocaleDateString()}
          readOnly
          className={getFieldClass("rdate")}
        />
      </div>
    );
  };

  return (
    <>
      {showPopup &&
        <div className="flex items-center justify-center min-h-screen p-2">
          <div className="w-full p-3 mx-auto border border-gray-300 shadow-2xl max-w-7xl rounded-xl bg-gradient-to-br from-pink-50 via-gray-50 to-gray-100">

            {/* Header - Ultra Compressed */}
            <div className="flex items-center px-4 py-2 mb-3 bg-white border border-gray-100 rounded-lg shadow-lg">
              <div className="flex-1">
                <h1 className="flex items-center justify-center text-lg font-bold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text">
                  <BriefcaseIcon className="w-5 h-5 mr-2 text-blue-800" />
                  Manpower Requisition View Form
                </h1>
              </div>
            </div>

            <form className="space-y-3" noValidate>
              {/* Card 1: Basic Information - Pastel Pink Background */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-3 border border-gray-100 shadow-lg rounded-xl bg-gradient-to-br from-pink-50 to-pink-100"
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="p-1.5 bg-gradient-to-r from-pink-500 to-pink-600 rounded-md">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-gray-800">Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="md:col-span-2">
                    <label className="flex items-center block gap-1 mb-1 text-xs font-semibold text-gray-700">
                      <BuildingOfficeIcon className="w-3 h-3" />
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="plant"
                      value={formData.PLANT}
                      readOnly
                      className={getFieldClass("plant")}
                    />
                  </div>

                  <div>
                    <label className="flex items-center block gap-1 mb-1 text-xs font-semibold text-gray-700">
                      <DocumentTextIcon className="w-3 h-3" />
                      Case ID
                    </label>
                    <input
                      type="text"
                      name="caseid"
                      value={formData.caseid}
                      readOnly
                      className={getFieldClass("caseid")}
                    />
                  </div>

                  <div>
                    <CustomDateField />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-3 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">Requestor</label>
                    <input
                      type="text"
                      name="requestor"
                      value={formData.RAISER}
                      readOnly
                      className={getFieldClass("requestor")} />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">Department</label>
                    <input
                      type="text"
                      name="requestor"
                      value={deptdesigndata.empDept}
                      readOnly
                      className={getFieldClass("requestor")} />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">Designation</label>
                    <input
                      type="text"
                      name="rmail_id"
                      value={deptdesigndata.empDesignation}
                      readOnly
                      className={getFieldClass("rmail_id")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">Requestor Email</label>
                    <input
                      type="email"
                      name="rmail_id"
                      value={formData.REQ_MAIL}
                      readOnly
                      className={getFieldClass("rmail_id")}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Job Requisition Details - Pastel Blue Background */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-3 border border-gray-100 shadow-lg rounded-xl bg-gradient-to-br from-blue-50 to-blue-100"
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md">
                    <BriefcaseIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-gray-800">Job Requisition Details</h2>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 md:grid-cols-3 lg:grid-cols-3">
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">
                      Requestor Department <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.DEPT}
                      readOnly
                      className={getFieldClass("department")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">
                      Required for Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="jobtype"
                      value={formData.MANPOWER_DESG}
                      readOnly
                      className={getFieldClass("jobtype")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">Employee Level</label>
                    <input
                      type="text"
                      name="recruitmentcycle"
                      value={formData.RECRUIT_CYCLE}
                      readOnly
                      className={getFieldClass("recruitmentcycle")} />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">Type of Employment</label>
                    <input
                      type="text"
                      name="Position"
                      value={formData.POSITION}
                      readOnly
                      className={getFieldClass("Position")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">
                      Qualification <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="qualf"
                      value={formData.EDUCATION}
                      readOnly
                      className={getFieldClass("qualf")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">
                      Experience in Years <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="exyear"
                      value={formData.EXP}
                      readOnly
                      className={getFieldClass("exyear")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">Hiring For</label>
                    <input
                      type="text"
                      name="hiringfor"
                      value={formData.RECRUIT_FOR}
                      readOnly
                      className={getFieldClass("hiringfor")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">
                      Reporting To
                    </label>
                    <input
                      type="text"
                      name="reportingto"
                      value={formData.REPORTING}
                      readOnly
                      className={getFieldClass("reportingto")}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">
                      Required Persons <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="req_pers"
                      value={formData.NUM_REQUIRE}
                      readOnly
                      className={getFieldClass("req_pers")}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Required Skills - Pastel Green Background */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-3 border border-gray-100 shadow-lg rounded-xl bg-gradient-to-br from-green-50 to-green-100"
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="p-1.5 bg-gradient-to-r from-green-500 to-green-600 rounded-md">
                    <AcademicCapIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-gray-800">Required Skills</h2>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-3 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">
                      Technical Skills <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="tecskill"
                      id="tecskill"
                      value={formData.TECH_SKILLS}
                      rows="1"
                      maxLength="100"
                      readOnly
                      className={getFieldClass("tecskill")}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">
                      Soft Skills <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="soft_skill"
                      id="soft_skill"
                      value={formData.SOFT_SKILLS}
                      rows="1"
                      maxLength="100"
                      readOnly
                      className={getFieldClass("soft_skill")}
                    ></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">
                      Job Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="jdesc"
                      id="jdesc"
                      value={formData.JOB_DESC}
                      rows="1"
                      maxLength="100"
                      readOnly
                      className={getFieldClass("jdesc")}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-700">
                      User Remarks <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="uremarks"
                      id="uremarks"
                      value={formData.REMARKS}
                      rows="1"
                      maxLength="100"
                      readOnly
                      className={getFieldClass("uremarks")}
                    ></textarea>
                  </div>
                </div>
              </motion.div>

              {/* Card 4: Job Details Table - Pastel Purple Background */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.4 }}
                  className="p-3 border border-gray-100 shadow-lg rounded-xl bg-gradient-to-br from-purple-50 to-purple-100"
                >
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="p-1.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md">
                      <CalendarIcon className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-base font-bold text-gray-800">Job Details</h2>
                  </div>

                  <div className="overflow-hidden border border-gray-200 rounded-lg shadow">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-100 to-purple-100">
                          <th className="px-3 py-1.5 text-left text-xs font-semibold">S.No</th>
                          <th className="px-3 py-1.5 text-left text-xs font-semibold">Job Title</th>
                          <th className="px-3 py-1.5 text-left text-xs font-semibold">Req By Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="px-3 py-1.5 text-xs text-gray-900 border-b border-r border-gray-300">
                            {formData.SNO}
                          </td>
                          <td className="px-3 py-1.5 text-xs text-gray-900 border-b border-r border-gray-300">
                            {formData.JOB_TIT}
                          </td>
                          <td className="px-3 py-1.5 text-xs text-gray-900 border-b border-r border-gray-300">
                            {formData.REQ_BY_DT}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* Approvals Section - Pastel Yellow Background */}
                <motion.div>
                  {(formData?.GM_STATUS ||
                    formData?.PRJ_STATUS ||
                    formData?.FUNC_STATUS ||
                    formData?.SP_STATUS ||
                    formData?.EVC_STATUS ||
                    formData?.HO_HOD_STATUS) && (
                      <div className="p-3 border border-gray-100 shadow-lg rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100">
                        <div className="mb-2">
                          <div className="flex items-center gap-1.5">
                            <div className="p-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-md">
                              <CalendarCheck className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-base font-bold text-gray-800">Approvals</h2>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {formData?.GM_STATUS && (
                            <div>
                              <label className="block mb-0.5 text-blue-800 text-xs font-semibold">GM:</label>
                              <textarea
                                value={formData?.GM_REM}
                                rows="1"
                                maxLength="100"
                                readOnly
                                className={getFieldClass("tecskill")}
                              />
                            </div>
                          )}

                          {formData?.PRJ_STATUS && (
                            <div>
                              <label className="block mb-0.5 text-blue-800 text-xs font-semibold">PRJ_HEAD:</label>
                              <textarea
                                value={formData?.PRJ_REM}
                                rows="1"
                                maxLength="100"
                                readOnly
                                className={getFieldClass("soft_skill")}
                              />
                            </div>
                          )}

                          {formData?.FUNC_STATUS && (
                            <div>
                              <label className="block mb-0.5 text-blue-800 text-xs font-semibold">FUNC_HEAD:</label>
                              <textarea
                                value={formData?.FUNC_REM}
                                rows="1"
                                maxLength="100"
                                readOnly
                                className={getFieldClass("soft_skill")}
                              />
                            </div>
                          )}

                          {formData?.SP_STATUS && (
                            <div>
                              <label className="block mb-0.5 text-blue-800 text-xs font-semibold">SP:</label>
                              <textarea
                                value={formData?.SP_REM}
                                rows="1"
                                maxLength="100"
                                readOnly
                                className={getFieldClass("soft_skill")}
                              />
                            </div>
                          )}

                          {formData?.EVC_STATUS && (
                            <div>
                              <label className="block mb-0.5 text-blue-800 text-xs font-semibold">EVC:</label>
                              <textarea
                                value={formData?.EVC_REM}
                                rows="1"
                                maxLength="100"
                                readOnly
                                className={getFieldClass("soft_skill")}
                              />
                            </div>
                          )}

                          {formData?.HO_HOD_STATUS && (
                            <div>
                              <label className="block mb-0.5 text-blue-800 text-xs font-semibold">HOD:</label>
                              <textarea
                                value={formData?.HO_HOD_REM}
                                rows="1"
                                maxLength="100"
                                readOnly
                                className={getFieldClass("tecskill")}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </motion.div>
              </AnimatePresence>
            </form>
          </div>
        </div>
      }
    </>
  );
}

export default ManPowerView;