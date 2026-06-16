import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import './stylePage.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ExclamationCircleIcon, ArrowLeftIcon, UserIcon, BriefcaseIcon, AcademicCapIcon, DocumentTextIcon, CalendarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from "../Config";

const ManpowerForm = () => {
  const navigate = useNavigate();

  const [userToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo')) || {};
  });
  const [attempted, setAttempted] = useState(false);
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState({});
  const typeRef = useRef(null);
  const plantRef = useRef(null);
  const deptRef = useRef(null);

  // Format today's date as DD/MM/YYYY
  const getFormattedDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [formData, setFormData] = useState({
    requestor: userToken.employee || "",
    emp_id: userToken.Emp_Id || "",
    empDept: userToken.Department || "",
    rmail_id: userToken.Email || "",
    empDesignation: userToken.Designation || "",
    type: "",
    loc: "",
    caseid: "",
    tdate: getFormattedDate(),        // ✅ Now in DD/MM/YYYY
    //requestor: "",
    // empDept: "",
    // empDesignation: "",
    department: "",
    //  rmail_id: "",
    jobtype: "",
    tecskill: "",
    soft_skill: "",
    recruitmentcycle: "Senior Management",
    Position: "Regular",
    qualf: "",
    exyear: "",
    hiringfor: "",
    reportingto: "",
    req_pers: "",
    job_descp: "",
    remarks: "",
    // ── NEW fields for upload-flow ──────────────────────────────────────────
    group_code: "",   // CODES from man_power_upload
    sub_code: "",     // SUB_CODES from man_power_upload
    sub_post: "",     // POSITION from man_power_upload (stored in sub_post for project plants)
  });

  const Token = JSON.parse(localStorage.getItem('userInfo'));
  const [plantOptions, setPlantOptions] = useState([]);
  const [deptList, setDeptList] = useState([]);
  const [desgList, setDesgList] = useState([]);
  const [userDetailsFetched, setUserDetailsFetched] = useState(false);
  const [jobRows, setJobRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  // const [plantCodeEmps, setplantCodeEmps] = useState([]);
  const [deptEmps, setDeptEmps] = useState([]);
  const [deptEmpsLoading, setDeptEmpsLoading] = useState(false);

  const [plantSearch, setPlantSearch] = useState("");
  const [showPlantList, setShowPlantList] = useState(false);
  // Type of plant search
  const [typeSearch, setTypeSearch] = useState("");
  const [showTypeList, setShowTypeList] = useState(false);

  // Department search
  const [deptSearch, setDeptSearch] = useState("");
  const [showDeptList, setShowDeptList] = useState(false);

  // 🔎 highlight helper
  const highlight = (text, search) => {
    if (!search) return text;

    const regex = new RegExp(`(${search})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === search.toLowerCase()
        ? <span key={i} className="font-semibold bg-yellow-200">{part}</span>
        : part
    );
  };

  // ── NEW STATE: man_power_upload lookup ─────────────────────────────────────
  const [plantUploadRows, setPlantUploadRows] = useState([]);    // rows from man_power_upload for selected plant
  const [plantHasUpload, setPlantHasUpload] = useState(false); // true = plant IS in upload table

  // ── NEW DERIVED: cascading dropdown options ────────────────────────────────
  const groupCodeOptions = [...new Set(plantUploadRows.map(r => r.CODES).filter(Boolean))];
  const uploadDeptOptions = [...new Set(plantUploadRows.map(r => r.DEPT).filter(Boolean))];
  const subCodeOptions = plantUploadRows.filter(r => r.CODES === formData.group_code);
  const positionOptions = plantUploadRows.filter(
    r => r.CODES === formData.group_code && r.SUB_CODES === formData.sub_code
  );
  const selectedUploadRow = plantUploadRows.find(
    r => r.CODES === formData.group_code && r.SUB_CODES === formData.sub_code && r.POSITION === formData.sub_post
  );
  const maxAllowed = selectedUploadRow ? parseInt(selectedUploadRow.TOTAL_PLAN || 0, 10) : null;
  // ──────────────────────────────────────────────────────────────────────────
  // ── Numeric input filter for experience field ─────────────────────────────
  const handleNumericInput = (e) => {
  // Allow letters, numbers, spaces, hyphens, plus signs (e.g. "3-5 years", "2+ years", "Fresher")
  const value = e.target.value;
  setFormData(prev => ({ ...prev, exyear: value }));
};
  // ──────────────────────────────────────────────────────────────────────────

  const validateReqPers = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };
    const tempFormData = {
      ...formData,
      [name]: value,
    };

    // ── NEW: upload-flow validation ────────────────────────────────────────
    if (plantHasUpload && selectedUploadRow) {
      const enteredReq = parseInt(tempFormData.req_pers || "0", 10);
      if (enteredReq > maxAllowed) {
        newErrors.req_pers = `Only ${maxAllowed} position(s) allowed for this selection`;
        setErrors(newErrors);
      } else {
        setErrors((prev) => { const n = { ...prev }; delete n.req_pers; return n; });
      }
      return;
    }

    // ── ORIGINAL validation – but removed the "No matching job title" error ──
    const matchedRow = data.find(
      (row) =>
        row.Plant_code.slice(0, 4) === tempFormData.loc.slice(0, 4)
        && row.Designation.trim().toLowerCase() === tempFormData.jobtype.trim().toLowerCase()
    );
    if (!matchedRow) {
      // ❌ Removed the error: no longer set any error for missing job title
      // newErrors.req_pers = "No matching job title found for selected plant.";
      setErrors(newErrors);
      return;
    }
    const totalReq = parseInt(matchedRow.Total_Requirement || "0", 10);
    const enteredReq = parseInt(tempFormData.req_pers || "0", 10);
    if (enteredReq > totalReq) {
      newErrors.req_pers = `Only ${totalReq} position(s) allowed for this Job Title at selected Plant`;
      setErrors(newErrors);
    } else {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr.req_pers;
        return newErr;
      });
    }
  };

  // const plantCodeemployees = async (e) => {
  //   const plantSlice = e.slice(0, 4);
  //   const fetchplantCodeemps = await fetch(`http://192.168.8.91:8084/inactive/phpapi/get_emp_by_plant.php?plant_code=${plantSlice}`, {
  //     method: "GET"
  //   });
  //   const employs = await fetchplantCodeemps.json();
  //   if (Array.isArray(employs.data)) {
  //     setplantCodeEmps(employs.data);
  //   } else {
  //     console.error("Expected array but got:", employs.data);
  //     setplantCodeEmps([]);
  //   }
  // };

  const fetchUploadGetData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}manpower-upload-get`, {
        headers: {
          "Content-Type": "application/json",
          Accept: 'application/json',
          Authorization: `Bearer ${userToken.token}`
        }
      });
      if (response.data && Array.isArray(response.data.data)) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Data is not in the Array Format here---");
    }
  };

  // ── NEW: fetch man_power_upload rows for the selected plant ────────────────
  const fetchPlantUploadRows = async (plantCode4) => {
    try {
      const res = await axios.get(`${API_BASE_URL}manpower-upload-by-plant`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${userToken.token}` },
        params: { plant: plantCode4 }
      });
      const rows = res.data?.data || [];
      setPlantUploadRows(rows);
      setPlantHasUpload(rows.length > 0);
      // Reset upload-flow dependent fields
      setFormData(prev => ({
        ...prev,
        group_code: "",
        sub_code: "",
        sub_post: "",
        department: "",
        jobtype: "",
        group_dept: "",
      }));
      setJobRows([]);
    } catch (e) {
      console.error("Plant upload rows fetch failed", e);
      setPlantUploadRows([]);
      setPlantHasUpload(false);
    }
  };
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {

      if (typeRef.current && !typeRef.current.contains(event.target)) {
        setShowTypeList(false);
      }

      if (plantRef.current && !plantRef.current.contains(event.target)) {
        setShowPlantList(false);
      }

      if (deptRef.current && !deptRef.current.contains(event.target)) {
        setShowDeptList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // useEffect(() => {
  //   axios
  //     .get(`${API_BASE_URL}get-plant-details`, {
  //       headers: {
  //         Accept: "application/json",
  //         Authorization: `Bearer ${userToken.token}`,
  //       },
  //       params: { status: "ACTIVE" }  // 👈 only fetch ACTIVE plants
  //     })
  //     .then((res) => {
  //       if (res.data && Array.isArray(res.data.data)) {
  //         setPlantOptions(res.data.data);  // 👈 res.data.data because our API returns { status, message, data: [...] }
  //       }
  //     })
  //     .catch((err) => {
  //       console.error("Failed to fetch plant data", err);
  //     });
  // }, []);

  useEffect(() => {
    // Ensure we have the token and username before making the call
    if (userToken && userToken.username) {
      axios
        .post(`${API_BASE_URL}get-plant-details`,
          {
            // Request Body
            status: "ACTIVE",
            username: userToken.username
          },
          {
            // Config (Headers)
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${userToken.token}`,
            }
          }
        )
        .then((res) => {
          if (res.data && Array.isArray(res.data.data)) {
            setPlantOptions(res.data.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch plant data", err);
        });
    }
  }, [userToken]);

  useEffect(() => {
    const fetchDeptAndDesg = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}dept`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${userToken.token}`,
          },
        });
        const departments = response.data.departments;
        const designations = response.data.designations;
        setDeptList(departments);
        setDesgList(designations);
      } catch (error) {
        console.error('Failed to fetch dept/desig data', error);
      }
    };
    fetchDeptAndDesg();
    fetchUploadGetData();
  }, []);

  useEffect(() => {
    const uid = userToken.Emp_Id;
    if (uid) {
      axios
        .get(`http://192.168.8.91:8084/inactive/phpapi/get_empdetails.php?uid=${uid}`)
        .then((res) => {
          if (res.data.status === "success") {
            const user = res.data.user;
            setFormData((prev) => ({
              ...prev,
              requestor: user.name,
              rmail_id: user.email,
              empDept: user.dept,
              empDesignation: user.designation,
            }));
          }
          setUserDetailsFetched(true);
        })
        .catch((err) => {
          console.error("Failed to fetch user data", err);
          setUserDetailsFetched(true);
        });
    } else {
      setUserDetailsFetched(true); // No user ID, mark as done
    }
  }, [userToken.Emp_Id]); // Add dependency to re-run when Emp_Id changes

  useEffect(() => {
  const fetchDeptEmps = async () => {
    const dept = formData.group_dept || formData.department;
    if (!dept || formData.hiringfor !== "Replacement") {
      setDeptEmps([]);
      return;
    }
    setDeptEmpsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}emps-by-dept`, {
        params: { department: dept },
        headers: { Authorization: `Bearer ${userToken.token}` },
      });
      setDeptEmps(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch dept employees:", err);
      setDeptEmps([]);
    } finally {
      setDeptEmpsLoading(false);
    }
  };
  fetchDeptEmps();
}, [formData.department, formData.group_dept, formData.hiringfor, userToken.token]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 🔁 MODIFIED: When hiringfor changes to "New", clear replaced_emp and its error
    if (name === "hiringfor" && value === "New") {
      setFormData(prev => ({ ...prev, replaced_emp: "" }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.replaced_emp;
        return newErrors;
      });
    }
    // ── NEW: sub_post → sync to jobtype so existing job row / store logic works
    if (name === "sub_post") {
      setFormData(prev => ({ ...prev, sub_post: value, jobtype: value }));
      setJobRows([]);
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────
    if (name === "type") {
      setFormData(prev => ({
        ...prev,
        type: value,
        loc: "",        // reset plant when type changes
        caseid: "",     // reset caseid too
      }));
      setPlantUploadRows([]);
      setPlantHasUpload(false);
      setJobRows([]);
      return;
    }

    if (name === "loc") {
      setJobRows([]);
      if (value.trim() === "") {
        setFormData((prev) => ({
          ...prev,
          caseid: "",
        }));
        // ── NEW: clear upload state when plant is cleared ─────────────────
        setPlantUploadRows([]);
        setPlantHasUpload(false);
        return;
      }
      try {
        const response = await axios.post(`${API_BASE_URL}fetch-gpnum`,
          { plant: value },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${userToken.token}`,
            },
          }
        );
        setFormData((prev) => ({
          ...prev,
          caseid: response.data || "",
        }));
      } catch (err) {
        console.error("Error fetching case ID:", err);
        setFormData((prev) => ({
          ...prev,
          caseid: "",
        }));
      }
      // ── NEW: fetch man_power_upload rows for this plant ───────────────────
      await fetchPlantUploadRows(value.slice(0, 4));
    }

    if (name === "req_pers" || name === "loc" || name === "jobtype") {
      const tempFormData = {
        ...formData,
        [name]: value,
      };
      const newErrors = { ...errors };

      // ── NEW: upload-flow req_pers validation ──────────────────────────────
      if (plantHasUpload && selectedUploadRow && name === "req_pers") {
        const enteredReq = parseInt(value || "0", 10);
        if (enteredReq > maxAllowed) {
          newErrors.req_pers = `Only ${maxAllowed} position(s) allowed for this selection`;
        } else {
          delete newErrors.req_pers;
        }
        setErrors(newErrors);
      } else {
        // ── ORIGINAL validation – removed the "No matching job title" error ──
        const matchedRow = data.find(
          (row) =>
            row?.Plant_code?.slice(0, 4) === tempFormData?.loc?.slice(0, 4) &&
            row?.Designation?.trim() === tempFormData?.jobtype?.trim()
        );
        if (matchedRow) {
          const totalReq = parseInt(matchedRow.Total_Requirement || "0", 10);
          const enteredReq = parseInt(tempFormData.req_pers || "0", 10);
          if (enteredReq > totalReq) {
            newErrors.req_pers = `Only ${totalReq} position(s) allowed for this Job Title at selected Plant`;
          } else {
            delete newErrors.req_pers;
          }
        } else {
          // ❌ Removed the error: no error is set when no matching job title
          // delete newErrors.req_pers;
        }
        setErrors(newErrors);
      }
    }

    if (name === "req_pers") {
      const count = parseInt(value);
      const baseCaseid = formData.caseid;
      const currentJobTitle = formData.jobtype || formData.sub_post || "";
      if (count === 0 || isNaN(count)) {
        setJobRows([]);
      } else {
        const rows = Array.from({ length: count }, (_, idx) => ({
          sno: idx + 1,
          jobTitle: currentJobTitle,
          requiredDate: "",
          childcaseid: `${baseCaseid}${String(idx + 1).padStart(2, "0")}`,
        }));
        setJobRows(rows);
      }
    }

    if (name === "jobtype") {
      const currentCount = parseInt(formData.req_pers || "0");
      if (currentCount > 0) {
        const baseCaseid = formData.caseid;
        const rows = Array.from({ length: currentCount }, (_, idx) => ({
          sno: idx + 1,
          jobTitle: value,
          requiredDate: jobRows[idx]?.requiredDate || "",
          childcaseid: `${baseCaseid}${String(idx + 1).padStart(2, "0")}`,
        }));
        setJobRows(rows);
      } else {
        setJobRows((prevRows) =>
          prevRows.map((row) => ({ ...row, jobTitle: value }))
        );
      }
    }
  };

  const handleDateChangeForRow = (index, dateValue) => {
    setJobRows((prevRows) =>
      prevRows.map((row, idx) =>
        idx === index ? { ...row, requiredDate: dateValue } : row
      )
    );
    if (errors.jobDates) {
      const allDatesFilled = jobRows.every((row, idx) =>
        idx === index ? dateValue !== "" : row.requiredDate !== ""
      );
      if (allDatesFilled) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.jobDates;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'loc', 'jobtype', 'department', 'qualf',
      'exyear', 'reportingto', 'req_pers', 'tecskill',
      'soft_skill', 'job_descp', 'remarks', 'hiringfor'
    ];

    // ── NEW: if plant has upload data, also validate group_code/sub_code/sub_post
    if (plantHasUpload) {
      requiredFields.push('sub_post');
    }

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
      }
    });

    if (formData.hiringfor === "Replacement" && (!formData.replaced_emp || formData.replaced_emp.trim() === '')) {
      newErrors.replaced_emp = 'Replacing Emp_Id is required';
    }

    if (formData.rmail_id && !/\S+@\S+\.\S+/.test(formData.rmail_id)) {
      newErrors.rmail_id = 'Email address is invalid';
    }

    if (jobRows.length > 0) {
      let hasDateError = false;
      jobRows.forEach((row) => {
        if (!row.requiredDate) {
          hasDateError = true;
        }
      });
      if (hasDateError) {
        newErrors.jobDates = 'Please Select dates for all job requirements';
      }
    }

    // ── NEW: upload-flow req_pers validation ──────────────────────────────────
    if (plantHasUpload && selectedUploadRow) {
      const enteredReq = parseInt(formData.req_pers || "0", 10);
      if (enteredReq > maxAllowed) {
        newErrors.req_pers = `Only ${maxAllowed} position(s) allowed for this selection`;
      }
    } else {
      // ── ORIGINAL validation – removed the "No matching job title" error ──
      const matchedRow = data?.find(
        row => row?.Plant_code?.slice(0, 4) === formData?.loc?.slice(0, 4) && row?.Designation?.trim() === formData?.jobtype?.trim()
      );
      if (matchedRow) {
        const totalReq = parseInt(matchedRow.Total_Requirement || "0", 10);
        const enteredReq = parseInt(formData.req_pers || "0", 10);
        if (enteredReq > totalReq) {
          newErrors.req_pers = `Only ${totalReq} position(s) allowed for this Job Title at selected Plant`;
        }
      }
      // ❌ No error added when matchedRow not found
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
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
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-gray-800',
        content: 'text-gray-600'
      }
    });
    if (!result.isConfirmed) return;
    const jobDetailsToSend = jobRows.map(row => {
      const { sno, ...rest } = row;
      return rest;
    });
    // ✅ Build full plant label for display
    const selectedPlant = plantOptions.find(p => p.WERKS === formData.loc);
    const fullPlantLabel = selectedPlant
      ? `${selectedPlant.WERKS} - ${selectedPlant.NAME1}`
      : formData.loc;

    const payload = {
      loc: fullPlantLabel,
      type: formData.type,
      caseid: formData.caseid,
      tdate: formData.tdate,
      department: formData.group_dept || formData.department,
      jobtype: formData.jobtype,
      recruitmentcycle: formData.recruitmentcycle,
      Position: formData.Position,
      qualf: formData.qualf,
      exyear: formData.exyear,
      hiringfor: formData.hiringfor,
      replaced_emp: formData.hiringfor === "Replacement" ? (formData.replaced_emp || "") : "",
      reportingto: formData.reportingto,
      req_pers: formData.req_pers,
      tecskill: formData.tecskill,
      soft_skill: formData.soft_skill,
      job_descp: formData.job_descp,
      remarks: formData.remarks,
      group_code: formData.group_code,
      sub_code: formData.sub_code,
      sub_post: formData.sub_post,
      plant_has_upload: plantHasUpload,
      jobDetails: jobDetailsToSend,
      raisedByDept: formData.empDept,
      raisedByDesg: formData.empDesignation,
    };
    try {
      const response = await fetch(`${API_BASE_URL}man-power-store`, {
        method: "POST",
        headers: {
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
      setModalType("error");
      setShowModal(true);
    }
  };

  const getFieldClass = (fieldName, isSelect = false) => {
    const baseClass = `w-full px-2 py-1 text-xs border-2 rounded-md transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-500
      placeholder:text-gray-400 hover:border-gray-400`;

    const requiredFields = [
      'loc', 'jobtype', 'department', 'qualf',
      'exyear', 'reportingto', 'req_pers', 'tecskill',
      'soft_skill', 'job_descp', 'remarks',
      // ── NEW: include upload-flow fields when applicable ───────────────────
      ...(plantHasUpload ? ['sub_post'] : []),
    ];

    const isReadOnly = ['requestor', 'rmail_id', 'caseid', 'empDept', 'empDesignation', 'tdate'].includes(fieldName);
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

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="w-full p-3 mx-auto bg-white border border-gray-200 shadow-xl max-w-10xl rounded-xl">
        <div className="flex items-center px-3 py-2 border border-gray-100 rounded-lg shadow-md bg-gradient-to-r from-pink-50 via-gray-50 to-blue-50">
          <div className="flex-1">
            <h1 className="flex items-center justify-center text-base font-bold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text">
              <BriefcaseIcon className="w-6 h-6 mr-2 text-blue-800" />
              MANPOWER REQUISITION FORM
            </h1>
          </div>
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 
      text-white rounded-md shadow-md hover:shadow-lg transition-all duration-300 
      hover:from-blue-600 hover:to-blue-700 font-medium text-xs"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3" noValidate>
          {/* Card 1: Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-3 transition-all duration-300 bg-white border-2 border-blue-400 shadow-lg rounded-xl hover:shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md">
                <UserIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-sm font-bold text-blue-600">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="flex items-center block gap-1 mb-1 text-xs font-semibold text-gray-700">
                  <DocumentTextIcon className="w-3 h-3" />
                  Type of Plants
                </label>
                <div className="relative" ref={typeRef}>
                  <input
                    type="text"
                    value={showTypeList ? typeSearch : formData.type}
                    placeholder="Select Type of Plant"
                    onFocus={() => {
                      setShowTypeList(true);
                      setTypeSearch("");
                    }}
                    onChange={(e) => {
                      setTypeSearch(e.target.value);
                      setShowTypeList(true);
                    }}
                    className={getFieldClass("type")}
                  />

                  {showTypeList && (
                    <div className="absolute z-50 w-full mt-1 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-40">
                      {[...new Set(plantOptions.map(p => p.TYPE).filter(Boolean))]
                        .filter(t =>
                          (t || "").toLowerCase().includes(typeSearch.toLowerCase())
                        )
                        .map((type, idx) => (
                          <div
                            key={idx}
                            className="px-2 py-1 text-xs cursor-pointer hover:bg-blue-50"
                            onClick={() => {

                              setShowTypeList(false);
                              setTypeSearch("");

                              handleChange({
                                target: {
                                  name: "type",
                                  value: type
                                }
                              });

                            }}
                          >
                            {highlight(type, typeSearch)}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="flex items-center block gap-1 mb-1 text-xs font-semibold text-gray-700">
                  <BuildingOfficeIcon className="w-3 h-3" />
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={plantRef}>
                  <input
                    type="text"
                    value={
                      showPlantList
                        ? plantSearch
                        : (
                          plantOptions.find(p => p.WERKS === formData.loc)
                            ? `${formData.loc} - ${plantOptions.find(p => p.WERKS === formData.loc)?.NAME1}`
                            : ""
                        )
                    }
                    placeholder="Select Plant"
                    onFocus={() => {
                      setShowPlantList(true);
                      setPlantSearch("");
                    }}
                    onChange={(e) => {
                      setPlantSearch(e.target.value);
                      setShowPlantList(true);
                    }}
                    className={getFieldClass("loc")}
                  />

                  {showPlantList && (
                    <div className="absolute z-50 w-full mt-1 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-48">
                      {plantOptions
                        .filter(plant => !formData.type || plant.TYPE === formData.type)
                        .filter(plant =>
                          `${plant.WERKS} - ${plant.NAME1}`
                            .toLowerCase()
                            .includes(plantSearch.toLowerCase())
                        )
                        .map((plant, idx) => {
                          const label = `${plant.WERKS} - ${plant.NAME1}`;

                          return (
                            <div
                              key={idx}
                              className="px-2 py-1 text-xs cursor-pointer hover:bg-blue-50"
                              onClick={() => {
                                setShowPlantList(false);
                                setPlantSearch("");
                                handleChange({
                                  target: {
                                    name: "loc",
                                    value: plant.WERKS
                                  }
                                });

                                // plantCodeemployees(plant.WERKS);
                              }}
                            >
                              {highlight(label, plantSearch)}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {attempted && errors.loc && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1 mt-1 text-xs text-red-500"
                    >
                      <ExclamationCircleIcon className="w-3 h-3" />
                      Please Select Plant Location
                    </motion.div>
                  )}
                </AnimatePresence>
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
                <label className="flex items-center block gap-1 mb-1 text-xs font-semibold text-gray-700">
                  <CalendarIcon className="w-3 h-3" />
                  Today's Date
                </label>
                <input
                  type="text"
                  name="tdate"
                  value={formData.tdate}   // ✅ now in DD/MM/YYYY
                  readOnly
                  className={getFieldClass("tdate")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 mt-2 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">Requestor</label>
                <input
                  type="text"
                  name="requestor"
                  value={formData.requestor}
                  onChange={handleChange}
                  readOnly
                  className={getFieldClass("requestor")}
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">Department</label>
                <input
                  type="text"
                  name="empDept"
                  value={formData.empDept}
                  onChange={handleChange}
                  readOnly
                  className={getFieldClass("empDept")}
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">Designation</label>
                <input
                  type="text"
                  name="empDesignation"
                  value={formData.empDesignation}
                  onChange={handleChange}
                  readOnly
                  className={getFieldClass("empDesignation")}
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">Requestor Email</label>
                <input
                  type="email"
                  name="rmail_id"
                  value={formData.rmail_id}
                  onChange={handleChange}
                  readOnly
                  className={getFieldClass("rmail_id")}
                />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Job Requisition Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 transition-all duration-300 bg-white border-2 border-purple-400 shadow-lg rounded-xl hover:shadow-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md">
                <BriefcaseIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-sm font-bold text-purple-600">Job Requisition Details</h2>
              {/* ── NEW: badge showing which flow is active ──────────────────────── */}

            </div>

            {/* ════════════════════════════════════════════════════════════════
                ── NEW SECTION: only shown when plant IS in man_power_upload ──
                Group Code → Sub Code → Position (jobtype) + Department
            ════════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 gap-2 mb-2 md:grid-cols-2 lg:grid-cols-5">

              {/* ── Department: upload flow shows CODE-DEPT, old flow shows plain list ── */}
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                {plantHasUpload ? (
                  <select
                    name="department"
                    value={formData.department}
                    onChange={(e) => {
                      const selectedDept = e.target.value;
                      const matchedRow = plantUploadRows.find(r => r.DEPT === selectedDept);
                      const plantCode4 = formData.loc.slice(0, 4);
                      const isProjectPlant = ['3001', '4001'].includes(plantCode4);  // ← NEW

                      setFormData(prev => ({
                        ...prev,
                        department: isProjectPlant ? "" : selectedDept,      // ← CHANGED: null for projects
                        group_dept: isProjectPlant ? selectedDept : "",      // ← NEW: only for projects
                        group_code: matchedRow?.CODES || "",
                        sub_code: "",
                        sub_post: "",
                        jobtype: "",
                      }));
                      setJobRows([]);
                      if (errors.department) {
                        setErrors(prev => { const n = { ...prev }; delete n.department; return n; });
                      }
                    }}
                    className={getFieldClass("department", true)}
                  >
                    <option value="">Select Department</option>
                    {[...new Map(
                      plantUploadRows
                        .filter(r => r.DEPT && r.CODES)
                        .map(r => [r.DEPT, r])
                    ).values()].map((r, i) => (
                      <option key={i} value={r.DEPT}>
                        {r.CODES} - {r.DEPT}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="relative" ref={deptRef}>
                    <input
                      type="text"
                      value={showDeptList ? deptSearch : formData.department}
                      placeholder="Select Dept"
                      onFocus={() => {
                        setShowDeptList(true);
                        setDeptSearch("");
                      }}
                      onChange={(e) => {
                        setDeptSearch(e.target.value);
                        setShowDeptList(true);
                      }}
                      className={getFieldClass("department")}
                    />

                    {showDeptList && (
                      <div className="absolute z-50 w-full mt-1 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-40">
                        {deptList
                          .filter(d =>
                            (d.DEPT || "").toLowerCase().includes(deptSearch.toLowerCase())
                          )
                          .map((dept, idx) => (
                            <div
                              key={idx}
                              className="px-2 py-1 text-xs cursor-pointer hover:bg-blue-50"
                              onClick={() => {

                                setShowDeptList(false);
                                setDeptSearch("");

                                handleChange({
                                  target: {
                                    name: "department",
                                    value: dept.DEPT
                                  }
                                });

                              }}
                            >
                              {highlight(dept.DEPT, deptSearch)}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
                <AnimatePresence>
                  {errors.department && attempted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1 mt-1 text-xs text-red-500"
                    >
                      <ExclamationCircleIcon className="w-3 h-3" />
                      Please Select Department
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Position: upload flow shows SUBCODE-POSITION, old flow shows plain list ── */}
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Required for Job Title/Position <span className="text-red-500">*</span>
                </label>
                {plantHasUpload ? (
                  <>
                    <select
                      name="sub_post"
                      value={formData.sub_post}
                      onChange={(e) => {
                        const selectedPosition = e.target.value;
                        const matchedRow = plantUploadRows.find(
                          r => r.POSITION === selectedPosition && r.CODES === formData.group_code
                        );
                        const plantCode4 = formData.loc.slice(0, 4);
                        const isProjectPlant = ['3001', '4001'].includes(plantCode4);  // ← NEW

                        setFormData(prev => ({
                          ...prev,
                          sub_post: selectedPosition,
                          sub_code: matchedRow?.SUB_CODES || "",
                          jobtype: selectedPosition,
                          group_dept: isProjectPlant                             // ← NEW
                            ? (matchedRow?.DEPT || prev.group_dept)
                            : "",
                        }));
                        setJobRows([]);
                        if (errors.sub_post) {
                          setErrors(prev => { const n = { ...prev }; delete n.sub_post; return n; });
                        }
                      }}
                      disabled={!formData.group_code}
                      className={`${getFieldClass("sub_post", true)} ${!formData.group_code ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select Position</option>
                      {plantUploadRows
                        .filter(r => r.CODES === formData.group_code && r.SUB_CODES && r.POSITION)
                        .map((r, i) => (
                          <option key={i} value={r.POSITION}>
                            {r.SUB_CODES} - {r.POSITION} ({r.TOTAL_PLAN ?? 0} available)
                          </option>
                        ))
                      }
                    </select>
                    {selectedUploadRow && (
                      <p className="text-xs text-indigo-600 mt-0.5 font-medium">
                        Max allowed: <span className="font-bold">{maxAllowed}</span> position(s)
                      </p>
                    )}
                  </>
                ) : (
                  <select
                    name="jobtype"
                    value={formData.jobtype}
                    onChange={handleChange}
                    className={getFieldClass("jobtype", true)}
                  >
                    <option value="">Select Job title</option>
                    {desgList.map((desg, idx) => (
                      <option key={idx} value={desg.DESIG}>{desg.DESIG}</option>
                    ))}
                  </select>
                )}
                <AnimatePresence>
                  {(errors.sub_post || errors.jobtype) && attempted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1 mt-1 text-xs text-red-500"
                    >
                      <ExclamationCircleIcon className="w-3 h-3" />
                      Please Select Job Title / Position
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Employee Level ── */}
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">Employee Level</label>
                <select
                  name="recruitmentcycle"
                  value={formData.recruitmentcycle}
                  onChange={handleChange}
                  className={getFieldClass("recruitmentcycle", true)}
                >
                  <option value="Senior Management">Senior Management</option>
                  <option value="Middle Management">Middle Management</option>
                  <option value="Junior Management">Junior Management</option>
                </select>
              </div>

              {/* ── Type of Employment ── */}
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">Type of Employment</label>
                <select
                  name="Position"
                  value={formData.Position}
                  onChange={handleChange}
                  className={getFieldClass("Position", true)}
                >
                  <option value="Regular">Regular</option>
                  <option value="Work Man">Work Man</option>
                </select>
              </div>

              {/* ── Qualification ── */}
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="qualf"
                  value={formData.qualf}
                  onChange={handleChange}
                  placeholder="Enter qualification"
                  className={getFieldClass("qualf")}
                />
                <AnimatePresence>
                  {errors.qualf && attempted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1 mt-1 text-xs text-red-500"
                    >
                      <ExclamationCircleIcon className="w-3 h-3" />
                      Please Enter Qualification
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Experience in Years <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="exyear"
                  value={formData.exyear}
                  onChange={handleNumericInput}   // ✅ numeric only
                  placeholder="e.g., 3-5 years"
                  className={getFieldClass("exyear")}
                  inputMode="numeric"
                />
                <AnimatePresence>
                  {errors.exyear && attempted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1 mt-1 text-xs text-red-500"
                    >
                      <ExclamationCircleIcon className="w-3 h-3" />
                      Please Enter Experience In Years
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">Hiring For</label>
                <select
                  name="hiringfor"
                  value={formData.hiringfor}
                  onChange={handleChange}
                  className={getFieldClass("hiringfor", true)}
                >
                  <option value="" disabled>Select Hiring For</option>
                  <option value="New">New</option>
                  <option value="Replacement">Replacement</option>
                </select>
              </div>

              {/* 🔁 MODIFIED: Conditionally render Replacing Emp_Id field */}
              {formData.hiringfor === "Replacement" && (
                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700">
                    Replacing Employee <span className="text-red-500">*</span>
                  </label>
                  {deptEmpsLoading ? (
                    <div className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 border-2 border-gray-200 rounded-md bg-gray-50">
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Loading employees...
                    </div>
                  ) : (
                    <select
                      name="replaced_emp"
                      value={formData.replaced_emp || ""}
                      onChange={handleChange}
                      className={getFieldClass("replaced_emp", true)}
                    >
                      <option value="">-- Select Employee --</option>
                      {deptEmps.length === 0 ? (
                        <option disabled>No employees found for this department</option>
                      ) : (
                        deptEmps.map((emp) => (
                          <option key={emp.EMP_ID} value={`${emp.EMP_ID} - ${emp.EMP_NAME}`}>
                            {emp.EMP_ID} — {emp.EMP_NAME}
                            {emp.DESIGNATION ? ` (${emp.DESIGNATION})` : ""}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                  <AnimatePresence>
                    {errors.replaced_emp && attempted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1 mt-1 text-xs text-red-500"
                      >
                        <ExclamationCircleIcon className="w-3 h-3" />
                        {errors.replaced_emp}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Reporting To <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="reportingto"
                  value={formData.reportingto}
                  onChange={handleChange}
                  placeholder="Enter reporting manager"
                  className={getFieldClass("reportingto")}
                />
                <AnimatePresence>
                  {errors.reportingto && attempted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1 mt-1 text-xs text-red-500"
                    >
                      <ExclamationCircleIcon className="w-3 h-3" />
                      Please Enter Reporting To
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Required Persons <span className="text-red-500">*</span>
                  {/* ── NEW: show max hint when upload row selected ──────────── */}
                  {plantHasUpload && maxAllowed !== null && (
                    <span className="ml-1 font-bold text-indigo-600">(max {maxAllowed})</span>
                  )}
                </label>
                <select
                  name="req_pers"
                  value={formData.req_pers}
                  onChange={(e) => {
                    handleChange(e);
                    validateReqPers(e);
                  }}
                  // ── NEW: disable until Position is selected in upload flow ──
                  disabled={plantHasUpload && !formData.sub_post}
                  className={`${getFieldClass("req_pers", true)} ${plantHasUpload && !formData.sub_post ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Number</option>
                  <option value="0">-----Clear Grid---</option>
                  {/* ── NEW: cap options to maxAllowed in upload flow ────────── */}
                  {Array.from({ length: plantHasUpload && maxAllowed !== null ? maxAllowed : 20 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num.toString()}>
                      {num}
                    </option>
                  ))}
                </select>
                <AnimatePresence>
                  {errors.req_pers && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1 mt-1 text-xs text-red-500"
                    >
                      <ExclamationCircleIcon className="w-3 h-3" />
                      {typeof errors.req_pers === 'string' ? errors.req_pers : 'Please Select No. of Persons'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-3 transition-all duration-300 bg-white border-2 border-green-400 shadow-lg rounded-xl hover:shadow-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-gradient-to-r from-green-500 to-green-600 rounded-md">
                <AcademicCapIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-sm font-bold text-green-600">Required Skills</h2>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-2 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Technical Skills <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="tecskill"
                  value={formData.tecskill}
                  onChange={handleChange}
                  rows="2"
                  maxLength="500"
                  placeholder="List required technical skills..."
                  className={`${getFieldClass("tecskill")} resize-none`}
                />
                <div className="flex items-center justify-between mt-1">
                  <AnimatePresence>
                    {errors.tecskill && attempted && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-1 text-xs text-red-500"
                      >
                        <ExclamationCircleIcon className="w-3 h-3" />
                        Please Enter Technical Skills
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="text-xs text-gray-500">{formData.tecskill.length}/500</span>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Soft Skills <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="soft_skill"
                  value={formData.soft_skill}
                  onChange={handleChange}
                  rows="2"
                  maxLength="500"
                  placeholder="List required soft skills..."
                  className={`${getFieldClass("soft_skill")} resize-none`}
                />
                <div className="flex items-center justify-between mt-1">
                  <AnimatePresence>
                    {errors.soft_skill && attempted && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-1 text-xs text-red-500"
                      >
                        <ExclamationCircleIcon className="w-3 h-3" />
                        Please Enter Soft Skills
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="text-xs text-gray-500">{formData.soft_skill.length}/500</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="job_descp"
                  value={formData.job_descp}
                  maxLength="500"
                  onChange={handleChange}
                  rows="2"
                  placeholder="Describe the job role and responsibilities..."
                  className={`${getFieldClass("job_descp")} resize-none`}
                />
                <div className="flex items-center justify-between mt-1">
                  <AnimatePresence>
                    {errors.job_descp && attempted && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-1 text-xs text-red-500"
                      >
                        <ExclamationCircleIcon className="w-3 h-3" />
                        Please Enter Job Description
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="text-xs text-gray-500">{formData.job_descp.length}/500</span>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Comments <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows="2"
                  maxLength="500"
                  placeholder="Additional comments or requirements..."
                  className={`${getFieldClass("remarks")} resize-none`}
                />
                <div className="flex items-center justify-between mt-1">
                  <AnimatePresence>
                    {errors.remarks && attempted && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-1 text-xs text-red-500"
                      >
                        <ExclamationCircleIcon className="w-3 h-3" />
                        Please Enter Comments
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="text-xs text-gray-500">{formData.remarks.length}/500</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Job Details Table */}
          <AnimatePresence>
            {jobRows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.4 }}
                className="p-3 transition-all duration-300 bg-white border-2 shadow-lg rounded-xl border-amber-400 hover:shadow-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-md">
                    <CalendarIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h2 className="text-sm font-bold text-amber-600">Job Details</h2>
                </div>

                <div className="overflow-hidden border border-gray-200 rounded-lg shadow-md">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-white">S.No</th>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-white">Job Title</th>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-white">Required Date *</th>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-white">Case ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {jobRows.map((row, index) => (
                        <motion.tr
                          key={row.childcaseid || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            } hover:bg-blue-50 transition-colors duration-200`}
                        >
                          <td className="px-2 py-1.5 text-xs font-medium text-gray-900">
                            <div className="flex items-center justify-center w-5 h-5 text-xs font-bold text-blue-600 bg-blue-100 rounded-full">
                              {row.sno}
                            </div>
                          </td>
                          <td className="px-2 py-1.5 text-xs text-gray-900 font-medium">{row.jobTitle}</td>
                          <td className="px-2 py-1.5">
                            <input
                              type="date"
                              value={row.requiredDate || ''}
                              onChange={(e) => handleDateChangeForRow(index, e.target.value)}
                              className={`w-full px-1.5 py-1 text-xs bg-white border-2 rounded-md transition-all duration-200 
                                focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-500 ${errors.jobDates && attempted && !row.requiredDate
                                  ? 'border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-500'
                                  : 'border-gray-200 hover:border-gray-300'
                                }`}
                            />
                          </td>
                          <td className="px-2 py-1.5 text-xs text-gray-600 font-mono bg-gray-50 rounded-md">
                            {row.childcaseid}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <AnimatePresence>
                  {errors.jobDates && attempted && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-2 mt-2 border border-red-200 rounded-lg bg-red-50"
                    >
                      <ExclamationCircleIcon className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-xs font-medium text-red-700">{errors.jobDates}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center pt-1"
          >
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-2 text-xs font-semibold text-white transition-all duration-300 rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Submit Request
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default ManpowerForm;