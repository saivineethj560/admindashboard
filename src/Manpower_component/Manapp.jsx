import React, { useEffect, useState } from "react";
import axios from "axios";
import {  Table,  TableBody,  TableCell,  TableContainer,  TableHead,  TableRow,  Paper,  Typography,} from "@mui/material";

function Manapp({ childcaseid }) {
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
    uremarks: "", // For remarks from the API (original user)
    remarks: "", // For GM's remarks (new input)
    approve: "", // For GM's approval status (new input)
    hodremarks: "",
  });

  // New state variable for CUR_TASK
  const [currentTask, setCurrentTask] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    // Replace with actual case ID to fetch

    axios
      .get(
        `http://192.168.8.91:8084/inactive/phpAPI/manp_data.php?caseid=${childcaseid}`
      )
      .then((response) => {
        // Use functional update to safely merge API data with existing state
        setFormData((prevData) => ({
          ...prevData, // Preserve fields not in API response (like new 'remarks' and 'approve')
          plant: response.data.PLANT || "",
          caseid: response.data.CASEID || "",
          rdate: response.data.RAISER_DATE || "",
          requestor: response.data.RAISER || "",
          rmail_id: response.data.REQ_MAIL || "",
          department: response.data.DEPT || "",
          jobtype: response.data.MANPOWER_DESG || "",
          recruitmentcycle: response.data.RECRUIT_CYCLE || "",
          Position: response.data.POSITION || "",
          qualf: response.data.EDUCATION || "",
          exyear: response.data.EXP || "",
          hiringfor: response.data.RECRUIT_FOR || "",
          reportingto: response.data.REPORTING || "",
          req_pers: response.data.NUM_REQUIRE || "",
          tecskill: response.data.TECH_SKILLS || "",
          soft_skill: response.data.SOFT_SKILLS || "",
          jdesc: response.data.JOB_DESC || "",
          uremarks: response.data.REMARKS || "",
          hodremarks: response.data.HO_HOD_REM || "",
        }));

        // Set currentTask
        if (response.data && response.data.CUR_TASK) {
          setCurrentTask(response.data.CUR_TASK);
        } else {
          setCurrentTask(""); // Or some default/error value
          console.warn(
            "CUR_TASK not found in API response or response.data is undefined"
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching form data:", error);
        // Optionally set currentTask to an error state here too
        setCurrentTask("Error fetching task");
      });
  }, [childcaseid]);
  // --- Helper to determine the dynamic remarks field name ---
  const getDynamicRemarksKey = (task) => {
    if (task && typeof task === "string" && task.trim() !== "") {
      return `${task.toLowerCase().replace(/\s+/g, "_")}remarks`; // e.g., "EVC" -> "evcremarks", "Pending HR" -> "pending_hrremarks"
    }
    return "default_gm_remarks"; // Fallback key if currentTask is not set or invalid
  };

  const remarksFieldKey = getDynamicRemarksKey(currentTask);
  // --- End helper ---

  return (
    <div className="max-w-full p-6 mx-auto mt-2 bg-white rounded-lg shadow-lg">
      <h2 className="mb-6 text-2xl font-semibold text-center text-gray-700">
        Manpower Form
      </h2>

      {/* You can display currentTask if needed, for example: */}
      {currentTask && (
        <Typography
          variant="subtitle1"
          align="center"
          color="secondary"
          gutterBottom
        >
          Current Task: {currentTask} (Remarks field: {remarksFieldKey})
        </Typography>
      )}
      <form className="space-y-5">
        {/* Row 1: Location / Case ID / Date */}
        <div className="flex flex-wrap mb-4 -mx-2">
          <div className="w-full px-2 sm:w-1/4">
            <label className="block mb-1 font-medium text-blue-800">
              Location <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="plant"
              value={formData.plant}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md form-input focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full px-2 sm:w-1/4">
            <label className="block mb-1 font-medium text-blue-800">
              Case ID <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="caseid"
              value={formData.caseid}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md form-input focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full px-2 sm:w-1/2">
            <label className="block mb-1 font-medium text-blue-800">
              Date <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="rdate"
              value={formData.rdate}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md form-input focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Row 2: Full Name / Role */}
        <div className="flex flex-wrap mb-4 -mx-2">
          <div className="w-full px-2 sm:w-1/2">
            <label className="block mb-1 text-gray-700">Requestor</label>
            <input
              type="text"
              name="requestor"
              value={formData.requestor}
              required
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md form-input focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full px-2 sm:w-1/2">
            <label className="block mb-1 text-gray-600">Requestor Email</label>
            <input
              type="email"
              name="rmail_id"
              value={formData.rmail_id}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Row 3: */}
        <div className="flex flex-wrap mb-4 -mx-2">
          <div className="w-full px-2 sm:w-1/2">
            <label className="block mb-1 text-gray-700">
              Requestor Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              required
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md form-input focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full px-2 sm:w-1/4">
            <label className="block mb-1 text-gray-600">
              Required for Job Title
            </label>
            <input
              type="text"
              name="jobtype"
              value={formData.jobtype}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full px-2 sm:w-1/4">
            <label className="block mb-1 text-gray-600">Employee Level</label>
            <input
              type="text"
              name="recruitmentcycle"
              value={formData.recruitmentcycle}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Row 4 */}
        <div className="flex flex-wrap mb-4 -mx-2">
          <div className="w-full px-2 sm:w-1/2">
            <label className="block mb-1 text-gray-700">
              Type of Employment
            </label>
            <input
              type="text"
              name="Position"
              value={formData.Position}
              required
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md form-input focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full px-2 sm:w-1/2">
            <label className="block mb-1 text-gray-600">Qualification</label>
            <input
              type="text"
              name="qualf"
              value={formData.qualf}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Row 5 */}
        <div className="flex flex-wrap mb-4 -mx-2">
          <div className="w-full px-2 sm:w-1/4">
            <label className="block mb-1 text-gray-700">
              Experience in Years
            </label>
            <input
              type="text"
              name="exyear"
              value={formData.exyear}
              required
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md form-input focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full px-2 sm:w-1/4">
            <label className="block mb-1 text-gray-600">Hiring For</label>
            <input
              type="text"
              name="hiringfor"
              value={formData.hiringfor}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full px-2 sm:w-1/4">
            <label className="block mb-1 text-gray-600">Reporting To</label>
            <input
              type="text"
              name="reportingto"
              value={formData.reportingto}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full px-2 sm:w-1/4">
            <label className="block mb-1 text-gray-600">Required Persons</label>
            <input
              type="text"
              name="req_pers"
              value={formData.req_pers}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Row 6: Technical Skills / Soft Skills */}
        <div className="flex flex-wrap mb-4 -mx-2">
          <div className="w-full px-2 sm:w-1/2">
            <label className="block mb-1 text-gray-600">
              Technical Skills:
            </label>
            <textarea
              name="tecskill"
              id="tecskill"
              value={formData.tecskill}
              rows="3"
              maxLength="100"
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="w-full px-2 sm:w-1/2">
            <label className="block mb-1 text-gray-600">Soft Skills:</label>
            <textarea
              name="soft_skill"
              id="soft_skill"
              value={formData.soft_skill}
              rows="3"
              maxLength="100"
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>
        {/* Row 7: Job Description / User Remarks (from API) */}
        <div className="flex flex-wrap mb-4 -mx-2">
          <div className="w-full px-2 sm:w-1/2">
            <label className="block mb-1 text-gray-600">Job Description:</label>
            <textarea
              name="jdesc"
              id="jdesc"
              value={formData.jdesc}
              rows="3"
              maxLength="100"
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="w-full px-2 sm:w-1/2">
            <label className="block mb-1 text-gray-600">User Remarks:</label>
            <textarea
              name="uremarks"
              id="uremarks"
              value={formData.uremarks} // This is populated from API response.data.REMARKS
              rows="3"
              maxLength="100"
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <Typography variant="h6" gutterBottom align="center">
            Job Requirement Details
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    <strong>SNO</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Job Title</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Req By Date</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell align="center">1</TableCell>
                  <TableCell align="center">{formData.jobtype}</TableCell>
                  <TableCell align="center">{formData.rdate}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Row 9: GM Remarks / GM Approve */}
        <div className="flex flex-wrap mb-4 -mx-2">
          <div className="w-full px-2 sm:w-1/2">
            <label className="block mb-1 text-gray-600">
              Remarks<span className="text-red-600">*</span>:
            </label>
            <textarea
              name={remarksFieldKey} // This is for GM's remarks
              id={remarksFieldKey}
              value={formData[remarksFieldKey]}
              onChange={handleChange} // Added onChange handler
              rows="3"
              maxLength="100"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="w-full px-2 sm:w-1/2">
            <label className="block mb-1 text-gray-600">
              Approve <span className="text-red-600">*</span>:
            </label>
            <select
              name="approve" // This is for GM's approval
              value={formData.approve}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>
          </div>
        </div>

        {/* Row 10: HOD Remarks */}
        {currentTask === "EVC" && (
          <div className="flex flex-wrap mb-4 -mx-2">
            <div className="w-full px-2 sm:w-1/2">
              <label className="block mb-1 text-gray-600">
                HOD Remarks<span className="text-red-600">*</span>:
              </label>
              <textarea
                name="hodremarks" // This is for GM's remarks
                id="hodremarks"
                value={formData.hodremarks}
                onChange={handleChange} // Added onChange handler
                rows="3"
                maxLength="100"
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default Manapp;
