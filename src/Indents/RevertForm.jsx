import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, ArrowLeft, Check } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// import { API_BASE_URL, API_DOC_URL } from "./Config";

import { API_BASE_URL_INDENT, API_DOC_URL_INDENT } from "../Config";
import { useIndent } from "./IndentContext";
import ProjectRevertTable from "./IndentTables/ProjectRevertTable";
import MaintenanceRevertTable from "./IndentTables/MaintenanceRevertTable";
import RMCRevertTable from "./IndentTables/RMCRevertTable";

// Configure axios
axios.defaults.baseURL = API_BASE_URL_INDENT;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const RevertForm = ({ mainType, tileType, subTab }) => {
  const { case_id: urlCaseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isViewMode = location.state?.viewMode || false;

  // State management
  const [indent, setIndent] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [documents, setDocuments] = useState([]);
  const [comments, setComments] = useState("");

  // REMOVED: wbsList state and useEffect

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const username = storedUser?.username || "";
  const displayName = storedUser?.name || "";
  const email = storedUser?.email || "";

  const [userToken] = useState(
    () => JSON.parse(localStorage.getItem("userInfo")) || {},
  );
  console.log("userToken-", userToken);
  console.log("userToken-", userToken.username);

  const { selectedIndent } = useIndent();
  const caseId = selectedIndent?.CASEID || urlCaseId;

  // Add this log to debug exactly what is happening
  console.log("Context ID:", selectedIndent?.CASEID);
  console.log("URL ID:", urlCaseId);
  console.log("Effective caseId:", caseId);
  // const caseId = selectedIndent?.CASEID;

  // Fetch indent details
  useEffect(() => {
    const fetchIndentDetails = async () => {
      if (!caseId) return;

      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL_INDENT}/indent-details/${caseId}`,
        );

        // 👇 DEBUG LOGS
        console.group("🚀 FETCH DEBUG: Indent Details API");
        console.log("Full Axios Response:", res);
        console.groupEnd();

        const responseData = res.data.data;
        const lineItems = responseData.line_items || [];

        const topFields =
          lineItems.length > 0
            ? {
                CASEID: lineItems[0].CASEID || "",
                EMP_ID: lineItems[0].EMPID || "",
                RAISER: lineItems[0].EMP_NAME || "",
                EMP_MAIL: lineItems[0].EMP_MAILID || "",
                DEPT: lineItems[0].DEPT || "",
                PLANT: lineItems[0].PLANT || "",
                PRJ_TYPE: lineItems[0].PRJ_TYPE || "",
                RAISER_DATE: responseData.approval.RAISER_DATE || "",
                CUR_TASK: lineItems[0].CUR_TASK || "",
                INDENT_TYPE: lineItems[0].INDENT_TYPE || "",
                CATEGORY_TYPE: lineItems[0].CATEGORY_TYPE || "",
              }
            : {};

        setIndent({ ...topFields, line_items: lineItems });

        setItems(
          lineItems.map((item) => ({
            SNO: item.SNO || "",
            wbs: item.WBS_ELE || "",
            subwbs: item.SUBWBS_ELE || "",
            wbs_desc: item.WBS_DESC || item.WDESC || "",
            mat_group: item.MAT_GRP || "",
            mat_code: item.MAT_CODE || "",
            mat_desc: item.MAT_DESC || "",
            uom: item.UOM || "",
            short_text: item.SHORT_TEXT || "",
            quantity: item.QUAN || "",
            till_indent: item.TILL_INDENT || "",
            reqnow: item.REQ_NOW || "",
            comments: item.COMMENTS || "",
            balqty: (
              parseFloat(item.QUAN || 0) - parseFloat(item.TILL_INDENT || 0)
            ).toString(),
            Remarks: item.REMARKS || "",
          })),
        );

        const mainComments =
          lineItems[0]?.COMMENTS || responseData.approval?.COMMENTS || "";
        setComments(mainComments);

        if (lineItems.length > 0) {
          const firstItem = lineItems[0];
          const docPaths = firstItem.DOC_PATHS
            ? JSON.parse(firstItem.DOC_PATHS)
            : [];
          const docNames = firstItem.DOC_NAMES
            ? JSON.parse(firstItem.DOC_NAMES)
            : [];

          const combinedDocs = docPaths.map((path, idx) => ({
            name: docNames[idx] || path.split("/").pop(),
            path: path,
          }));
          setDocuments(combinedDocs);
        } else {
          setDocuments([]);
        }
      } catch (err) {
        console.error("Error fetching indent details:", err);
        setNotification({
          show: true,
          type: "error",
          message: "Failed to load indent details",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIndentDetails();
  }, [caseId]);

  const handleSubmit = async () => {
    if (!comments.trim()) {
      setNotification({
        show: true,
        type: "error",
        message: "Please enter comments before submitting.",
      });
      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000,
      );
      return;
    }

    // 2. ✅ VALIDATION: Ensure every item has a valid 'Req Now' value
    // We check if any value is empty, null, or zero.
    const hasInvalidItem = items.some(
      (item) =>
        item.reqnow === "" ||
        item.reqnow === null ||
        parseFloat(item.reqnow) === 0,
    );

    if (hasInvalidItem) {
      setNotification({
        show: true,
        type: "error",
        message:
          "Please enter a valid 'Req Now' quantity for all items in the table.",
      });
      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000,
      );
      return;
    }

    // 3. Optional: Check if any item exceeds the Balance Qty
    // const hasExceededBalance = items.some((item) => {
    //   const req = parseFloat(item.reqnow || 0);
    //   const bal = parseFloat(item.balqty || 0);
    //   return req > bal;
    // });

    // if (hasExceededBalance) {
    //   setNotification({
    //     show: true,
    //     type: "error",
    //     message: "Req Now cannot exceed Balance Quantity.",
    //   });
    //   setTimeout(
    //     () => setNotification({ show: false, type: "", message: "" }),
    //     3000,
    //   );
    //   return;
    // }
    // const validItems = items.filter((item) => item.reqnow && parseFloat(item.reqnow) > 0);

    // if (validItems.length === 0) {
    //   setNotification({ show: true, type: "error", message: "Please enter 'Req Now' quantity for at least one item." });
    //   setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
    //   return;
    // }

    // const hasError = validItems.some((item) => {
    //   const req = parseFloat(item.reqnow || 0);
    //   const bal = parseFloat(item.balqty || 0);
    //   return req > bal;
    // });

    // if (hasError) {
    //   setNotification({ show: true, type: "error", message: "'Req Now' cannot exceed 'Balance Qty'." });
    //   setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
    //   return;
    // }

    setLoading(true);

    const payload = {
      case_id: indent.CASEID || caseId,
      project_type: indent.PRJ_TYPE,
      plant: indent.PLANT,
      CUR_TASK: indent.CUR_TASK,
      RAISER: indent.RAISER,
      INDENT_TYPE: indent.INDENT_TYPE,
      TILE_TYPE: indent.TILE_TYPE,
      raiser_emp_id: indent.EMP_ID,
      comments: comments,
      user: {
        username: userToken.username,
        displayName: userToken.employee,
        email: userToken.Email,
      },
      selectedItemsData: items.map((item) => ({
        sno: item.SNO,
        wbs: item.wbs,
        subwbs: item.subwbs,
        material_group: item.mat_group,
        material_code: item.mat_code,
        material_desc: item.mat_desc,
        short_text: item.short_text || item.SHORT_TEXT || "", // ✅ ADD THIS LINE
        req_quantity: item.reqnow,
        unit: item.uom,
        till_indent: item.till_indent,
        remarks: item.Remarks,
      })),
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL_INDENT}/submit-revert`,
        payload,
      );
      if (response.data.status === "success" || response.status === 200) {
        setNotification({
          show: true,
          type: "success",
          message: "Revert form submitted successfully!",
        });
        setTimeout(() => navigate(-1), 2000);
      } else {
        throw new Error(response.data.message || "Submission failed");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      setNotification({
        show: true,
        type: "error",
        message: error.response?.data?.message || "Failed to submit form.",
      });
    } finally {
      setLoading(false);
      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000,
      );
    }
  };

  const primaryColor = "#28556e";
  const lightBorder = "#7ba5b8";

  if (loading && !indent.CASEID) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div
            className="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-t-transparent animate-spin"
            style={{ borderColor: primaryColor }}
          ></div>
          <p className="text-gray-600">Loading indent details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-lg shadow-lg transition-all ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mt-1 mb-2 px-4 py-1.5 bg-[#28556E] border border-[#28556E] rounded-md shadow-sm flex items-center justify-between">
        <h1 className="flex-1 text-lg font-semibold tracking-wide text-center text-white">
          Revert Form
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-[#28556E] rounded-md hover:bg-[#f1f5f9] transition-all border border-[#28556E] bg-white absolute right-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <form
        className="mb-1 overflow-hidden bg-white border-2 shadow-lg rounded-xl"
        style={{ borderColor: primaryColor }}
      >
        <div className="p-2 space-y-2">
          {/* Top Form Fields */}
          <div className="flex gap-1.5">
            <div
              className="flex-1 p-2 border-2 rounded-lg"
              style={{ borderColor: lightBorder }}
            >
              {/* Header Fields Grid 1 */}
              <div className="grid grid-cols-1 gap-2 mb-2 md:grid-cols-4">
                {[
                  { label: "Case ID", value: indent.CASEID || caseId },
                  { label: "Raiser Emp ID", value: indent.EMP_ID },
                  { label: "Raiser Name", value: indent.RAISER },
                  { label: "Raiser Email ID", value: indent.EMP_MAIL },
                ].map((field, idx) => (
                  <div key={idx}>
                    <label className="block text-[14px] font-semibold text-gray-700 mb-1">
                      {field.label}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={field.value || ""}
                      readOnly
                      className="w-full px-2 py-1 text-[14px] rounded bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                      style={{
                        border: `1px solid ${lightBorder}`,
                        height: "32px",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Header Fields Grid 2 */}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-1">
                    Raiser Dept<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={indent?.DEPT || ""}
                    readOnly
                    className="w-full px-2 py-1 text-[14px] rounded bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                    style={{
                      border: `1px solid ${lightBorder}`,
                      height: "32px",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-1">
                    Plant <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={indent?.PLANT || ""}
                    readOnly
                    className="w-full px-2 py-1 text-[14px] rounded bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                    style={{
                      border: `1px solid ${lightBorder}`,
                      height: "32px",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-1">
                    Project Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={indent?.PRJ_TYPE || ""}
                    readOnly
                    className="w-full px-2 py-1 text-[14px] rounded bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                    style={{
                      border: `1px solid ${lightBorder}`,
                      height: "32px",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-1">
                    Raised Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={
                      indent?.RAISER_DATE
                        ? new Date(indent.RAISER_DATE)
                            .toISOString()
                            .slice(0, 10)
                            .split("-")
                            .reverse()
                            .join("-")
                        : ""
                    }
                    readOnly
                    className="w-full px-2 py-1 text-[14px] rounded bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                    style={{
                      border: `1px solid ${lightBorder}`,
                      height: "32px",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div
              className="p-2 border-2 rounded-lg"
              style={{ borderColor: lightBorder, maxWidth: "500px" }}
            >
              <h5 className="mb-3 text-primary">Uploaded Documents</h5>
              {documents && documents.length > 0 ? (
                <ul className="list-group">
                  {documents.map((doc, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center bg-gray-50 border rounded px-2 py-[2px]"
                    >
                      <a
                        href={`${API_DOC_URL_INDENT}/${doc.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 truncate hover:underline"
                      >
                        {doc.name}
                      </a>
                      <i className="bi bi-file-earmark-text text-secondary"></i>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No documents uploaded.</p>
              )}
            </div>
          </div>

          {/* Conditional Rendering of Tables (Props removed for wbsList) */}
          {indent.CATEGORY_TYPE === "Projects" ? (
            // <ProjectRevertTable
            //   items={items}
            //   setItems={setItems}
            //   plant={indent.PLANT}
            //   projectType={indent.PRJ_TYPE}
            //   indentType={indent.INDENT_TYPE}
            //   subTab={subTab}
            //   isViewMode={isViewMode}
            //   primaryColor={primaryColor}
            //   lightBorder={lightBorder}
            // />
            <>
              {/* If Project Type ends with (NB), use MaintenanceRevertTable */}
              {indent.PRJ_TYPE && indent.PRJ_TYPE.endsWith("(NB)") ? (
                <MaintenanceRevertTable
                  items={items}
                  setItems={setItems}
                  plant={indent.PLANT}
                  projectType={indent.PRJ_TYPE}
                  indentType={indent.INDENT_TYPE}
                  subTab={subTab}
                  isViewMode={isViewMode}
                  primaryColor={primaryColor}
                  lightBorder={lightBorder}
                  
                />
              ) : (
                /* Otherwise (specifically for (B) or default), use ProjectRevertTable */
                <ProjectRevertTable
                  items={items}
                  setItems={setItems}
                  plant={indent.PLANT}
                  projectType={indent.PRJ_TYPE}
                  indentType={indent.INDENT_TYPE}
                  subTab={subTab}
                  isViewMode={isViewMode}
                  primaryColor={primaryColor}
                  lightBorder={lightBorder}
                />
              )}
            </>
          ) : indent.CATEGORY_TYPE === "Maintenance" ? (
            <MaintenanceRevertTable
              items={items}
              setItems={setItems}
              plant={indent.PLANT}
              projectType={indent.PRJ_TYPE}
              indentType={indent.INDENT_TYPE}
              subTab={subTab}
              isViewMode={isViewMode}
              primaryColor={primaryColor}
              lightBorder={lightBorder}
            />
          ) : (
            <RMCRevertTable
              items={items}
              setItems={setItems}
              plant={indent.PLANT}
              projectType={indent.PRJ_TYPE}
              indentType={indent.INDENT_TYPE}
              subTab={subTab}
              isViewMode={isViewMode}
              primaryColor={primaryColor}
              lightBorder={lightBorder}
            />
          )}

          {/* Footer Comments & Submit */}
          <div className="flex items-center justify-center gap-4 p-3 mt-2 mb-2 rounded-lg bg-gray-50">
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-1">
                Logs
              </label>
              <textarea
                value=""
                readOnly
                className="w-60 px-2 py-1 text-[11px] bg-gray-100 rounded cursor-not-allowed"
                style={{ border: `1px solid ${lightBorder}`, height: "40px" }}
              />
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-1">
                Comments<span className="text-red-500">*</span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-60 px-2 py-1 text-[11px] bg-white rounded focus:outline-none"
                style={{ border: `1px solid ${lightBorder}`, height: "40px" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 p-3 mt-2 mb-2 rounded-lg bg-gray-50">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`flex items-center gap-1.5 px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded shadow-lg border-2 border-green-600 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700 hover:shadow-xl transition-all transform hover:scale-105"}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RevertForm;
